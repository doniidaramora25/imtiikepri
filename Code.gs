/**
 * IMTII Kepri - backend direktori himpunan.
 * 1. Buat Google Spreadsheet baru.
 * 2. Salin ID spreadsheet ke SPREADSHEET_ID.
 * 3. Jalankan setupSheet() satu kali dari editor Apps Script.
 * 4. Deploy > New deployment > Web app; Execute as: Me.
 * 5. Atur akses sesuai kebijakan organisasi. Jika dipilih Anyone, jangan simpan data sensitif yang tidak diperlukan.
 */
const SPREADSHEET_ID = 'GANTI_DENGAN_ID_SPREADSHEET';
const SHEET_NAME = 'Pendataan Himpunan';
const HEADERS = [
  'Timestamp','Status','Nama Perguruan Tinggi','Program Studi','Kota/Kabupaten',
  'Nama Himpunan','Singkatan','Tahun Berdiri','Deskripsi','URL Logo','Instagram','Website',
  'Nama Ketua','Periode','WhatsApp Ketua','Email Kontak','Nama Perwakilan','Jabatan Perwakilan',
  'WhatsApp Perwakilan','Akurasi Data Disetujui','Izin Kontak Disetujui','Verifikasi Disetujui',
  'Catatan Admin','Kontak Publik'
];

function getSheet_() {
  if (!SPREADSHEET_ID || SPREADSHEET_ID.indexOf('GANTI_') === 0) throw new Error('SPREADSHEET_ID belum dikonfigurasi.');
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sheet;
}

function setupSheet() {
  const sheet = getSheet_();
  Logger.log('Sheet siap: ' + sheet.getParent().getUrl());
}

function doGet(e) {
  const callback = e && e.parameter ? String(e.parameter.callback || '') : '';
  const payload = { associations: getVerifiedAssociations_() };
  const json = JSON.stringify(payload);
  if (callback && /^[A-Za-z_$][\w$\.]*$/.test(callback)) {
    return ContentService.createTextOutput(callback + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

function getVerifiedAssociations_() {
  const sheet = getSheet_();
  const values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return [];
  const headers = values[0];
  const rows = values.slice(1);
  const idx = name => headers.indexOf(name);
  return rows.filter(row => row[idx('Status')] === 'Terverifikasi').map(row => ({
    status: row[idx('Status')],
    campus_name: row[idx('Nama Perguruan Tinggi')],
    study_program: row[idx('Program Studi')],
    city: row[idx('Kota/Kabupaten')],
    association_name: row[idx('Nama Himpunan')],
    short_name: row[idx('Singkatan')],
    founded_year: row[idx('Tahun Berdiri')],
    description: row[idx('Deskripsi')],
    logo_url: row[idx('URL Logo')],
    instagram_url: row[idx('Instagram')],
    website_url: row[idx('Website')],
    chair_name: row[idx('Nama Ketua')],
    term_period: row[idx('Periode')],
    chair_whatsapp: row[idx('WhatsApp Ketua')],
    representative_name: row[idx('Nama Perwakilan')],
    representative_role: row[idx('Jabatan Perwakilan')],
    representative_whatsapp: row[idx('WhatsApp Perwakilan')],
    public_whatsapp: row[idx('Kontak Publik')]
  }));
}

function doPost(e) {
  try {
    const p = e && e.parameter ? e.parameter : {};
    const required = ['campus_name','study_program','city','association_name','chair_name','term_period','chair_whatsapp','representative_name','representative_role','representative_whatsapp'];
    const missing = required.filter(key => !String(p[key] || '').trim());
    if (missing.length) return responsePage_(false, 'Data wajib belum lengkap. Periksa kembali formulir.');
    if (p.data_accuracy_consent !== 'yes' || p.contact_publication_consent !== 'yes' || p.verification_consent !== 'yes') {
      return responsePage_(false, 'Persetujuan wajib harus dicentang sebelum data dikirim.');
    }
    const sheet = getSheet_();
    const row = [
      new Date(), 'Menunggu verifikasi', p.campus_name, p.study_program, p.city,
      p.association_name, p.short_name || '', p.founded_year || '', p.description || '', p.logo_url || '',
      p.instagram_url || '', p.website_url || '', p.chair_name, p.term_period, p.chair_whatsapp,
      p.contact_email || '', p.representative_name, p.representative_role, p.representative_whatsapp,
      p.data_accuracy_consent, p.contact_publication_consent, p.verification_consent, '', ''
    ];
    sheet.appendRow(row);
    return responsePage_(true, 'Data berhasil diterima dan berstatus menunggu verifikasi Admin IMTII Kepri.');
  } catch (error) {
    console.error(error);
    return responsePage_(false, 'Terjadi kendala saat menyimpan data. Silakan hubungi Admin IMTII Kepri.');
  }
}

function responsePage_(success, message) {
  const safeMessage = JSON.stringify(message);
  const result = success ? 'success' : 'error';
  const html = '<!doctype html><html><head><meta charset="utf-8"></head><body><script>' +
    'window.parent.postMessage({source:"imtii-directory-form",status:' + JSON.stringify(result) + ',message:' + safeMessage + '}, "*");' +
    'document.body.textContent=' + safeMessage + ';' +
    '</script></body></html>';
  return HtmlService.createHtmlOutput(html).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
