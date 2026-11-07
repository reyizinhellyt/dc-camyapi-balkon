(() => {
  const key = window.DC_INSTAGRAM_KEY || 'dcYapiInstagramPosts';
  const defaults = window.DC_DEFAULT_INSTAGRAM_POSTS || [];
  const form = document.getElementById('instagramPostsForm');
  const status = document.getElementById('instagramStatus');
  const inputs = [1, 2, 3, 4, 5].map(number => document.getElementById(`instagramPost${number}`));
  const count = document.getElementById('instagramCount');
  if (!form || inputs.some(input => !input)) return;

  function normalizePost(value) {
    try {
      const url = new URL(String(value || '').trim());
      if (url.protocol !== 'https:' || !['instagram.com', 'www.instagram.com'].includes(url.hostname.toLowerCase())) return '';
      if (!/^\/(?:p|reel|tv)\/[A-Za-z0-9_-]+\/?$/.test(url.pathname)) return '';
      return `https://www.instagram.com${url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`}`;
    } catch {
      return '';
    }
  }

  function readPosts() {
    try {
      const stored = localStorage.getItem(key);
      const value = stored === null ? defaults : JSON.parse(stored);
      return Array.isArray(value) ? value : defaults;
    } catch {
      return defaults;
    }
  }

  function render() {
    const posts = readPosts();
    inputs.forEach((input, index) => {
      input.value = posts[index] || '';
      input.setCustomValidity('');
    });
    if (count) count.textContent = String(posts.length);
    if (status) status.textContent = 'Sıralama: en yeni gönderi 1. sırada, en eski gönderi 5. sırada. Yalnızca herkese açık gönderi ve Reels bağlantıları kullanılabilir.';
  }

  inputs.forEach(input => input.addEventListener('input', () => input.setCustomValidity('')));
  form.addEventListener('submit', event => {
    event.preventDefault();
    const urls = [];
    for (let index = 0; index < inputs.length; index += 1) {
      const input = inputs[index];
      input.setCustomValidity('');
      const url = normalizePost(input.value);
      if (!url) {
        input.setCustomValidity('Instagram gönderisinin HTTPS bağlantısını girin. /p/, /reel/ veya /tv/ bağlantısı olmalı.');
        input.reportValidity();
        return;
      }
      if (urls.includes(url)) {
        input.setCustomValidity('Aynı gönderi bağlantısı birden fazla kullanılamaz.');
        input.reportValidity();
        return;
      }
      urls.push(url);
    }

    try {
      localStorage.setItem(key, JSON.stringify(urls));
      if (count) count.textContent = String(urls.length);
      if (status) status.textContent = 'Beş Instagram gönderisi kaydedildi. Siteyi aynı tarayıcıda yenileyince yeni sıralama görüntülenir.';
    } catch {
      if (status) status.textContent = 'Tarayıcı depolaması kapalı veya dolu; gönderi bağlantıları kaydedilemedi.';
    }
  });

  window.addEventListener('storage', event => {
    if (event.key === key) render();
  });
  render();
})();
