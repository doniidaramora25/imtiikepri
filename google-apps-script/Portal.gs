/**
 * IMTII Kepri Membership Portal — Google Apps Script backend.
 * Spreadsheet: existing IMTII Kepri data spreadsheet.
 *
 * SECURITY:
 * - Run setPortalAdminEmail() once after setting Script Property SUPER_ADMIN_EMAIL.
 * - Run setupPortal() once. It creates portal sheets and a one-time admin password.
 * - Never publish this spreadsheet or share it with members.
 * - Deploy as Web App, Execute as: Me. The browser communicates through a sandboxed iframe.
 */

function spreadsheet_() {
  const id = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if (!id) throw new Error("Set Script Property SPREADSHEET_ID terlebih dahulu.");
  return SpreadsheetApp.openById(id);
}
const SESSION_HOURS = 8;
const PASSWORD_ROUNDS = 1200;
const SHEETS = {
  Users: ["id","email","name","password_hash","salt","role","association_id","member_id","status","created_at","last_login","must_change_password"],
  Associations: ["id","data_json","updated_at","updated_by"],
  Members: ["id","data_json","updated_at","updated_by"],
  Leadership: ["id","data_json","updated_at","updated_by"],
  Periods: ["id","data_json","updated_at","updated_by"],
  Sessions: ["token_hash","user_id","expires_at","created_at"],
  AuditLog: ["timestamp","actor_id","action","entity","entity_id","details"]
};

function setupPortal() {
  const ss = spreadsheet_();
  Object.keys(SHEETS).forEach(name => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    if (sheet.getLastRow() === 0) sheet.appendRow(SHEETS[name]);
  });

  const email = String(PropertiesService.getScriptProperties().getProperty("SUPER_ADMIN_EMAIL") || "").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Set Script Property SUPER_ADMIN_EMAIL dengan email Super Admin terlebih dahulu.");
  }

  const users = ss.getSheetByName("Users");
  const rows = users.getDataRange().getValues();
  const existing = rows.slice(1).some(r => String(r[1]).toLowerCase() === email && r[5] === "super_admin");
  if (existing) {
    Logger.log("Super Admin sudah tersedia. Tidak ada akun baru dibuat.");
    return;
  }

  const temporaryPassword = randomSecret_(18);
  const salt = randomSecret_(24);
  const id = Utilities.getUuid();
  users.appendRow([id,email,email,passwordHash_(temporaryPassword,salt),salt,"super_admin","","","ACTIVE",new Date().toISOString(),"",true]);
  audit_(id,"CREATE_SUPER_ADMIN","Users",id,{email:email});
  Logger.log("SUPER ADMIN EMAIL: " + email);
  Logger.log("PASSWORD SEMENTARA (simpan sekarang, tidak ditampilkan lagi): " + temporaryPassword);
  Logger.log("Login pertama wajib mengganti password.");
}

function doGet() {
  return HtmlService.createHtmlOutput(
    '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="font:16px Arial;padding:24px;color:#18372e"><h2>IMTII Kepri Portal API</h2><p>Backend aktif. Gunakan halaman login pada website IMTII Kepri.</p></body></html>'
  ).setTitle("IMTII Kepri Portal API");
}

function doPost(e) {
  let response;
  try {
    const params = (e && e.parameter) || {};
    const action = String(params.action || "");
    const payload = params.payload ? JSON.parse(params.payload) : {};
    if (action === "login") response = login_(payload);
    else if (action === "getDashboard") response = getDashboard_(params.token);
    else if (action === "saveRecord") response = saveRecord_(params.token,payload);
    else if (action === "deleteRecord") response = deleteRecord_(params.token,payload);
    else if (action === "createMember") response = createMember_(params.token,payload);
    else if (action === "changePassword") response = changePassword_(params.token,payload);
    else if (action === "logout") response = logout_(params.token);
    else throw new Error("Aksi tidak dikenal.");
  } catch (err) {
    response = {ok:false,message:err && err.message ? err.message : "Permintaan gagal diproses."};
  }
  return htmlResponse_(response,paramsSafe_(e));
}

function paramsSafe_(e) {
  return String((e && e.parameter && e.parameter.request_id) || "");
}

function htmlResponse_(data, requestId) {
  const json = JSON.stringify({ ...data, requestId: requestId }).replace(/</g,"\\u003c").replace(/>/g,"\\u003e").replace(/&/g,"\\u0026");
  return HtmlService.createHtmlOutput(
    '<!doctype html><html><body><script>window.parent.postMessage({source:"imtii-kepri-portal",data:' + json + '},"*");</script></body></html>'
  ).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function login_(p) {
  const email = String(p.email || "").trim().toLowerCase();
  const password = String(p.password || "");
  if (!email || !password) throw new Error("Masukkan email dan password.");
  const sheet = sheet_("Users");
  const rows = sheet.getDataRange().getValues();
  const index = rows.findIndex((r,i) => i > 0 && String(r[1]).toLowerCase() === email);
  if (index < 1) throw new Error("Email atau password tidak sesuai.");
  const row = rows[index];
  if (row[8] !== "ACTIVE" || passwordHash_(password,String(row[4])) !== String(row[3])) {
    throw new Error("Email atau password tidak sesuai, atau akun tidak aktif.");
  }
  const token = randomSecret_(40);
  const expires = new Date(Date.now() + SESSION_HOURS*60*60*1000).toISOString();
  sheet.getRange(index+1,11).setValue(new Date().toISOString());
  sheet_("Sessions").appendRow([sha256_(token),String(row[0]),expires,new Date().toISOString()]);
  audit_(String(row[0]),"LOGIN","Users",String(row[0]),{});
  return {ok:true,token:token,user:{id:row[0],email:row[1],name:row[2],role:row[5],must_change_password:row[11]===true}};
}

function getDashboard_(token) {
  const user = requireUser_(token);
  if (user.role === "super_admin") {
    return {ok:true,user:publicUser_(user),data:{
      associations:readRecords_("Associations"),members:readRecords_("Members"),
      leadership:readRecords_("Leadership"),periods:readRecords_("Periods")
    }};
  }
  const memberId = String(user.member_id || "");
  const member = readRecords_("Members").find(x => x.id === memberId) || null;
  return {ok:true,user:publicUser_(user),data:{member:member}};
}

function saveRecord_(token,p) {
  const user = requireAdmin_(token);
  const map = {associations:"Associations",members:"Members",leadership:"Leadership",periods:"Periods"};
  const sheetName = map[String(p.entity || "")];
  if (!sheetName) throw new Error("Jenis data tidak valid.");
  const data = p.data || {};
  const id = String(p.id || data.id || Utilities.getUuid());
  delete data.id;
  if (sheetName === "Members" && (!data.full_name || !data.email || !data.association_id)) {
    throw new Error("Nama, email, dan himpunan wajib diisi.");
  }
  upsertRecord_(sheetName,id,data,user.id);
  audit_(user.id,"UPSERT",sheetName,id,{});
  return {ok:true,message:"Data berhasil disimpan.",id:id};
}

function deleteRecord_(token,p) {
  const user = requireAdmin_(token);
  const map = {associations:"Associations",members:"Members",leadership:"Leadership",periods:"Periods"};
  const sheetName = map[String(p.entity || "")];
  if (!sheetName) throw new Error("Jenis data tidak valid.");
  const id = String(p.id || "");
  const sheet = sheet_(sheetName);
  const rows = sheet.getDataRange().getValues();
  const index = rows.findIndex((r,i)=>i>0 && String(r[0])===id);
  if (index < 1) throw new Error("Data tidak ditemukan.");
  sheet.deleteRow(index+1);
  audit_(user.id,"DELETE",sheetName,id,{});
  return {ok:true,message:"Data berhasil dihapus."};
}

function createMember_(token,p) {
  const admin = requireAdmin_(token);
  const email = String(p.email || "").trim().toLowerCase();
  const name = String(p.full_name || "").trim();
  if (!email || !name || !p.association_id) throw new Error("Nama, email, dan himpunan wajib diisi.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Format email tidak valid.");
  const users = sheet_("Users");
  const all = users.getDataRange().getValues();
  if (all.slice(1).some(r=>String(r[1]).toLowerCase()===email)) throw new Error("Email sudah memiliki akun.");
  const memberId = Utilities.getUuid();
  const tempPassword = randomSecret_(16);
  const salt = randomSecret_(24);
  const userId = Utilities.getUuid();
  users.appendRow([userId,email,name,passwordHash_(tempPassword,salt),salt,"member",String(p.association_id),memberId,"ACTIVE",new Date().toISOString(),"",true]);
  const memberData = Object.assign({},p,{email:email,full_name:name});
  delete memberData.password;
  upsertRecord_("Members",memberId,memberData,admin.id);
  audit_(admin.id,"CREATE_MEMBER_ACCOUNT","Members",memberId,{email:email});
  return {ok:true,message:"Akun anggota berhasil dibuat. Berikan password sementara kepada anggota melalui kanal pribadi.",temporary_password:tempPassword,member_id:memberId};
}

function changePassword_(token,p) {
  const user = requireUser_(token);
  const oldPassword = String(p.old_password || "");
  const newPassword = String(p.new_password || "");
  if (newPassword.length < 12) throw new Error("Password baru minimal 12 karakter.");
  const sheet = sheet_("Users");
  const rows = sheet.getDataRange().getValues();
  const index = rows.findIndex((r,i)=>i>0 && String(r[0])===String(user.id));
  if (index < 1) throw new Error("Akun tidak ditemukan.");
  const row = rows[index];
  if (passwordHash_(oldPassword,String(row[4])) !== String(row[3])) throw new Error("Password lama tidak sesuai.");
  const salt = randomSecret_(24);
  sheet.getRange(index+1,4).setValue(passwordHash_(newPassword,salt));
  sheet.getRange(index+1,5).setValue(salt);
  sheet.getRange(index+1,12).setValue(false);
  audit_(user.id,"CHANGE_PASSWORD","Users",user.id,{});
  return {ok:true,message:"Password berhasil diperbarui."};
}

function logout_(token) {
  const hash = sha256_(String(token || ""));
  const sheet = sheet_("Sessions");
  const rows = sheet.getDataRange().getValues();
  for (let i=rows.length-1;i>=1;i--) if (String(rows[i][0])===hash) sheet.deleteRow(i+1);
  return {ok:true,message:"Anda telah keluar."};
}

function requireUser_(token) {
  if (!token) throw new Error("Sesi tidak ditemukan. Silakan login kembali.");
  const hash = sha256_(String(token));
  const sessions = sheet_("Sessions").getDataRange().getValues();
  const now = Date.now();
  let session = null;
  for (let i=1;i<sessions.length;i++) {
    if (String(sessions[i][0])===hash && new Date(sessions[i][2]).getTime()>now) { session=sessions[i]; break; }
  }
  if (!session) throw new Error("Sesi berakhir. Silakan login kembali.");
  const users = sheet_("Users").getDataRange().getValues();
  const row = users.find((r,i)=>i>0 && String(r[0])===String(session[1]));
  if (!row || row[8]!=="ACTIVE") throw new Error("Akun tidak aktif.");
  return {id:row[0],email:row[1],name:row[2],role:row[5],association_id:row[6],member_id:row[7],must_change_password:row[11]===true};
}

function requireAdmin_(token) {
  const user = requireUser_(token);
  if (user.role !== "super_admin") throw new Error("Akses ditolak. Fitur ini hanya untuk Super Admin IMTII Kepri.");
  return user;
}

function publicUser_(u) {
  return {id:u.id,email:u.email,name:u.name,role:u.role,must_change_password:u.must_change_password};
}

function readRecords_(name) {
  const rows = sheet_(name).getDataRange().getValues();
  return rows.slice(1).filter(r=>r[0]).map(r=>{
    try { return Object.assign({id:String(r[0])},JSON.parse(String(r[1]||"{}"))); }
    catch (_) { return {id:String(r[0])}; }
  });
}

function upsertRecord_(name,id,data,actor) {
  const sheet = sheet_(name);
  const rows = sheet.getDataRange().getValues();
  const index = rows.findIndex((r,i)=>i>0 && String(r[0])===id);
  const row = [id,JSON.stringify(data),new Date().toISOString(),actor];
  if (index > 0) sheet.getRange(index+1,1,1,row.length).setValues([row]);
  else sheet.appendRow(row);
}

function sheet_(name) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(name);
  if (!sheet) throw new Error("Sheet " + name + " belum tersedia. Jalankan setupPortal() terlebih dahulu.");
  return sheet;
}

function audit_(actor,action,entity,id,details) {
  sheet_("AuditLog").appendRow([new Date().toISOString(),actor,action,entity,id,JSON.stringify(details||{})]);
}

function passwordHash_(password,salt) {
  let value = salt + ":" + password;
  for (let i=0;i<PASSWORD_ROUNDS;i++) value = sha256_(value);
  return value;
}

function sha256_(value) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(value),Utilities.Charset.UTF_8);
  return bytes.map(b=>("0"+((b+256)%256).toString(16)).slice(-2)).join("");
}

function randomSecret_(length) {
  let value = "";
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  while (value.length < length) {
    const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,Utilities.getUuid()+Math.random(),Utilities.Charset.UTF_8);
    bytes.forEach(b=>{ value += chars.charAt((b+256)%chars.length); });
  }
  return value.slice(0,length);
}