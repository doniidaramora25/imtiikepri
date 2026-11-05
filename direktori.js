(() => {
  'use strict';
  const config = window.IMTII_DIRECTORY_CONFIG || {};
  const grid = document.getElementById('directory-grid');
  const count = document.getElementById('directory-count');
  const search = document.getElementById('search-directory');
  const cityFilter = document.getElementById('filter-city');
  const form = document.getElementById('association-form');
  const status = document.getElementById('form-status');
  const iframe = document.getElementById('submission-frame');
  let associations = [];
  let submissionPending = false;

  const safe = (value) => String(value || '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const initials = (name) => String(name || 'TI').split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase();
  const validHttpUrl = (value) => {
    try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : ''; }
    catch (_) { return ''; }
  };
  const whatsappUrl = (value) => {
    const number = String(value || '').replace(/\D/g, '');
    return number.length >= 9 ? `https://wa.me/${number}` : '';
  };

  function render() {
    const query = (search.value || '').trim().toLocaleLowerCase('id-ID');
    const city = cityFilter.value;
    const filtered = associations.filter(item => {
      const haystack = [item.association_name, item.short_name, item.campus_name, item.city, item.description].join(' ').toLocaleLowerCase('id-ID');
      return (!query || haystack.includes(query)) && (!city || item.city === city);
    });
    count.textContent = `${filtered.length} profil terverifikasi`;
    if (!filtered.length) {
      grid.innerHTML = '<article class="directory-empty"><h3>Belum ada profil yang cocok</h3><p>Coba kata kunci atau wilayah lain. Profil baru akan ditampilkan setelah diverifikasi Admin IMTII Kepri.</p></article>';
      return;
    }
    grid.innerHTML = filtered.map(item => {
      const logo = validHttpUrl(item.logo_url);
      const instagram = validHttpUrl(item.instagram_url);
      const website = validHttpUrl(item.website_url);
      const wa = whatsappUrl(item.public_whatsapp);
      const contacts = [item.chair_name ? `<div><strong>Ketua:</strong> ${safe(item.chair_name)}</div>` : '', item.representative_name ? `<div><strong>Perwakilan:</strong> ${safe(item.representative_name)}${item.representative_role ? ` · ${safe(item.representative_role)}` : ''}</div>` : '', item.term_period ? `<div><strong>Periode:</strong> ${safe(item.term_period)}</div>` : ''].filter(Boolean).join('');
      const links = [wa ? `<a href="${safe(wa)}" target="_blank" rel="noopener noreferrer">WhatsApp ↗</a>` : '', instagram ? `<a href="${safe(instagram)}" target="_blank" rel="noopener noreferrer">Instagram ↗</a>` : '', website ? `<a href="${safe(website)}" target="_blank" rel="noopener noreferrer">Website ↗</a>` : ''].filter(Boolean).join('');
      return `<article class="association-card"><div class="association-card-top"><div class="association-logo">${logo ? `<img src="${safe(logo)}" alt="Logo ${safe(item.association_name)}" loading="lazy" onerror="this.remove();this.parentElement.textContent='${safe(initials(item.short_name || item.association_name))}'">` : safe(initials(item.short_name || item.association_name))}</div><div><h3>${safe(item.association_name)}</h3><div class="association-campus">${safe(item.campus_name)}${item.city ? ` · ${safe(item.city)}` : ''}</div><span class="verified-label">✓ Terverifikasi</span></div></div><p class="association-description">${safe(item.description || 'Profil himpunan Teknik Industri yang telah diverifikasi oleh Admin IMTII Kepri.')}</p><div class="association-meta">${contacts || '<div>Informasi kepengurusan tersedia melalui kontak organisasi.</div>'}</div>${links ? `<div class="association-card-actions">${links}</div>` : ''}</article>`;
    }).join('');
  }

  function loadFromAppsScript(url) {
    return new Promise((resolve, reject) => {
      const callbackName = `imtiiDirectoryCallback_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      const script = document.createElement('script');
      const timeout = window.setTimeout(() => finish(new Error('Waktu tunggu sumber data habis.')), 12000);
      function finish(error, data) {
        window.clearTimeout(timeout);
        try { delete window[callbackName]; } catch (_) { window[callbackName] = undefined; }
        script.remove();
        error ? reject(error) : resolve(data);
      }
      window[callbackName] = (data) => finish(null, data);
      script.onerror = () => finish(new Error('Sumber data direktori tidak dapat diakses.'));
      script.src = `${url}${url.includes('?') ? '&' : '?'}callback=${callbackName}&_=${Date.now()}`;
      document.head.appendChild(script);
    });
  }

  async function loadDirectory() {
    try {
      let data;
      if (config.appsScriptUrl && config.appsScriptUrl.trim()) {
        data = await loadFromAppsScript(config.appsScriptUrl.trim());
        if (!data || !Array.isArray(data.associations)) throw new Error('Format data direktori tidak sesuai.');
        associations = data.associations.filter(item => item.status === 'Terverifikasi');
      } else {
        const response = await fetch(config.fallbackDataUrl || 'data/himpunan.json', { cache: 'no-store' });
        if (!response.ok) throw new Error('File data contoh tidak ditemukan.');
        const data = await response.json();
        associations = (Array.isArray(data.associations) ? data.associations : []).filter(item => item.status === 'Terverifikasi');
      }
      render();
      if (!config.appsScriptUrl) count.textContent = `${associations.length} profil contoh — sumber data belum dikonfigurasi`;
    } catch (error) {
      associations = [];
      render();
      count.textContent = 'Sumber data belum tersedia';
      console.error('IMTII directory:', error);
    }
  }

  search.addEventListener('input', render);
  cityFilter.addEventListener('change', render);

  form.addEventListener('submit', (event) => {
    if (!config.appsScriptUrl || !config.appsScriptUrl.trim()) {
      event.preventDefault();
      status.textContent = 'Pengiriman belum aktif. Deploy Google Apps Script sebagai Web App, lalu isi appsScriptUrl pada direktori.html.';
      status.className = 'form-status is-error';
      return;
    }
    form.action = config.appsScriptUrl.trim();
    submissionPending = true;
    status.textContent = 'Data sedang dikirim. Jangan tutup halaman sampai proses selesai.';
    status.className = 'form-status';
  });

  window.addEventListener('message', (event) => {
    const data = event.data;
    if (!data || data.source !== 'imtii-directory-form' || !submissionPending) return;
    submissionPending = false;
    status.textContent = data.message || (data.status === 'success' ? 'Data diterima.' : 'Pengiriman gagal.');
    status.className = data.status === 'success' ? 'form-status is-success' : 'form-status is-error';
    if (data.status === 'success') {
      form.reset();
      const studyProgram = form.elements.namedItem('study_program');
      if (studyProgram) studyProgram.value = 'Teknik Industri';
    }
  });

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
  loadDirectory();
})();
