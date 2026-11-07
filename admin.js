/*
 * DC Yapı Cam Balkon — tasarımı değiştirmeden güvenli D1 girişi (v11)
 * Kullanım: GitHub projesinin kökündeki admin.js içeriğini bununla değiştirin.
 * admin.html / CSS / logo / sayfa düzeni değişmez.
 * /api/admin/login ile aynı alan adı üzerinden çalışır.
 */
(() => {
  'use strict';
  const LOGIN = '/api/admin/login';
  const DASHBOARD = '/api/admin/dashboard';

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else fn();
  }

  function allLeafNodes() {
    return [...document.querySelectorAll('p, small, span, div, label, strong, h1, h2, h3, h4, h5, h6')]
      .filter(el => el.children.length === 0 && (el.textContent || '').trim());
  }

  function removeLegacyMessages() {
    for (const el of allLeafNodes()) {
      const value = (el.textContent || '').trim();
      if (/^Yerel demo bilgilendirmesi$/i.test(value)) {
        el.textContent = 'Güvenli yönetici girişi';
      } else if (/giriş bilgileri tarayıcı tarafında doğrulanır/i.test(value)) {
        el.textContent = 'Giriş bilgileriniz güvenli Cloudflare API üzerinden doğrulanır.';
      }
    }
  }

  function findForm() {
    return [...document.forms].find(form => form.querySelector('input[type="password"]')) || null;
  }

  function findError(form) {
    const known = ['[data-login-error]', '#loginError', '#login-error', '#authError',
      '#errorMessage', '#loginMessage', '#adminError', '.login-error',
      '.auth-error', '.form-error', '[role="alert"]'];
    for (const selector of known) {
      const el = form.querySelector(selector) || document.querySelector(selector);
      if (el) return el;
    }
    // Varsa eski demo girişinin ekranda bıraktığı hata satırını yeniden kullan.
    for (const el of allLeafNodes()) {
      if (/kullanıcı adı (veya|ya da) (şifre|parola) hatalı/i.test(el.textContent || '')) {
        return el;
      }
    }
    const el = document.createElement('p');
    el.setAttribute('role', 'alert');
    el.style.cssText = 'color:#c65345;font-size:13px;margin-top:10px;';
    const button = form.querySelector('button[type="submit"], input[type="submit"], button');
    if (button) button.insertAdjacentElement('afterend', el);
    else form.append(el);
    return el;
  }

  async function fetchLoginToken() {
    const response = await fetch(LOGIN, {
      method: 'GET', credentials: 'same-origin', cache: 'no-store'
    });
    // Zaten oturum açıksa giriş formuna dönmeden panele git.
    if (response.redirected && new URL(response.url).pathname === DASHBOARD) {
      location.assign(DASHBOARD);
      return null;
    }
    if (!response.ok) throw new Error('Giriş güvenlik bilgileri alınamadı. Sayfayı yenileyin.');
    const page = new DOMParser().parseFromString(await response.text(), 'text/html');
    const token = page.querySelector('input[name="_csrf"]')?.value || '';
    if (!/^[A-Za-z0-9_-]{43}$/.test(token)) {
      throw new Error('CSRF doğrulama bilgisi alınamadı. API sürümünü kontrol edin.');
    }
    return token;
  }

  async function login(username, password) {
    const csrf = await fetchLoginToken();
    if (!csrf) return;
    const body = new URLSearchParams({ username, password, _csrf: csrf });
    const response = await fetch(LOGIN, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: body.toString(),
      redirect: 'follow',
      cache: 'no-store'
    });
    if (response.ok && new URL(response.url).pathname === DASHBOARD) {
      location.assign(DASHBOARD);
      return;
    }
    if (response.status === 401) throw new Error('Kullanıcı adı veya parola hatalı.');
    if (response.status === 429) throw new Error('Çok fazla deneme. Bir süre sonra yeniden deneyin.');
    if (response.status === 403) throw new Error('Güvenlik kontrolü başarısız. Sayfayı yenileyin.');
    throw new Error('Giriş başarısız (HTTP ' + response.status + ').');
  }

  ready(() => {
    removeLegacyMessages();
    const form = findForm();
    if (!form) { console.warn('DC Yapı: giriş formu bulunamadı.'); return; }
    const username = form.querySelector('input[name="username"], input[id="username"], input[autocomplete="username"], input[type="text"], input:not([type])');
    const password = form.querySelector('input[type="password"]');
    if (!username || !password) { console.warn('DC Yapı: giriş alanları bulunamadı.'); return; }
    const error = findError(form);
    const submit = form.querySelector('button[type="submit"], input[type="submit"], button');
    error.textContent = '';
    error.hidden = true;
    error.style.display = 'none';
    console.info('DC Yapı güvenli giriş adaptörü v11 yüklendi.');

    // Capture aşamasında eski demo form handler'ının çalışmasını önler.
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (submit?.disabled) return;
      error.hidden = true;
      error.style.display = 'none';
      error.textContent = '';
      if (submit) submit.disabled = true;
      try {
        await login(username.value.trim(), password.value);
      } catch (err) {
        error.textContent = err?.message || 'Giriş sırasında bir hata oluştu.';
        error.hidden = false;
        error.style.display = '';
      } finally {
        if (submit) submit.disabled = false;
      }
    }, true);
  });
})();
