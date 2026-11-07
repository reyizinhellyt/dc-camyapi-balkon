/* DC Yapı Cam Balkon — herkese açık galeri (Cloudflare D1 API v2).
 * Galeri kartları, kategori filtreleri ve tam ekran görsel gezintisi korunur.
 */
(() => {
  'use strict';
  const grid = document.querySelector('#galleryGrid');
  const filters = document.querySelector('#galleryFilters');
  if (!grid) return;

  let items = [];
  let activeType = 'all';
  let activeValue = '';
  let visibleItems = [];
  let currentIndex = 0;
  let lastTrigger = null;

  const norm = value => String(value || '').trim().toLocaleLowerCase('tr-TR');
  function safeImage(value) {
    if (typeof value !== 'string') return '';
    try {
      const u = new URL(value);
      return u.protocol === 'https:' && !u.username && !u.password ? u.href : '';
    } catch { return ''; }
  }
  function makeButton(className, label, text) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.setAttribute('aria-label', label);
    button.textContent = text;
    return button;
  }

  const lightbox = document.createElement('dialog');
  lightbox.className = 'gallery-lightbox';
  lightbox.setAttribute('aria-label', 'Tam ekran galeri görüntüsü');
  const layout = document.createElement('div');
  layout.className = 'lightbox-layout';
  const toolbar = document.createElement('div');
  toolbar.className = 'lightbox-toolbar';
  const closeButton = makeButton('lightbox-button lightbox-close', 'Görseli kapat', '×');
  toolbar.append(closeButton);
  const content = document.createElement('div');
  content.className = 'lightbox-content';
  const previousButton = makeButton('lightbox-button lightbox-previous', 'Önceki görsel', '‹');
  const figure = document.createElement('figure');
  figure.className = 'lightbox-stage';
  const fullImage = document.createElement('img');
  fullImage.alt = '';
  fullImage.draggable = false;
  const caption = document.createElement('figcaption');
  caption.className = 'lightbox-caption';
  figure.append(fullImage, caption);
  const nextButton = makeButton('lightbox-button lightbox-next', 'Sonraki görsel', '›');
  content.append(previousButton, figure, nextButton);
  const counter = document.createElement('div');
  counter.className = 'lightbox-counter';
  counter.setAttribute('aria-live', 'polite');
  layout.append(toolbar, content, counter);
  lightbox.append(layout);
  document.body.append(lightbox);

  function openAt(index, trigger) {
    if (!visibleItems.length) return;
    currentIndex = (index + visibleItems.length) % visibleItems.length;
    const item = visibleItems[currentIndex];
    fullImage.src = item.image;
    fullImage.alt = item.alt_text || item.title || 'DC Yapı Cam Balkon uygulama fotoğrafı';
    caption.textContent = [item.title, item.category, item.caption].filter(Boolean).join(' · ');
    counter.textContent = `${currentIndex + 1} / ${visibleItems.length}`;
    previousButton.hidden = nextButton.hidden = visibleItems.length < 2;
    lastTrigger = trigger || lastTrigger;
    if (!lightbox.open) lightbox.showModal();
    closeButton.focus();
  }

  closeButton.addEventListener('click', () => lightbox.close());
  previousButton.addEventListener('click', () => openAt(currentIndex - 1));
  nextButton.addEventListener('click', () => openAt(currentIndex + 1));
  lightbox.addEventListener('click', event => {
    if ([lightbox, layout, content].includes(event.target)) lightbox.close();
  });
  lightbox.addEventListener('close', () => {
    if (lastTrigger?.isConnected) lastTrigger.focus();
    else grid.focus?.();
  });
  document.addEventListener('keydown', event => {
    if (!lightbox.open) return;
    if (event.key === 'ArrowRight' && visibleItems.length > 1) {
      event.preventDefault(); openAt(currentIndex + 1);
    } else if (event.key === 'ArrowLeft' && visibleItems.length > 1) {
      event.preventDefault(); openAt(currentIndex - 1);
    }
  });

  function renderFilters() {
    if (!filters) return;
    const categories = new Map();
    items.forEach(item => {
      if (item.category && !categories.has(norm(item.category))) {
        categories.set(norm(item.category), item.category);
      }
    });
    const options = [...categories.values()].map(value => ({ type: 'category', value, label: value }));
    if (activeType !== 'all' && !options.some(x => norm(x.value) === norm(activeValue))) {
      activeType = 'all'; activeValue = '';
    }
    filters.replaceChildren();
    for (const option of [{ type: 'all', value: '', label: 'Tümü' }, ...options]) {
      const button = makeButton('filter-chip', option.type === 'all' ? 'Tüm galeri görselleri' : `Kategori: ${option.value}`, option.label);
      button.classList.toggle('active', option.type === activeType && norm(option.value) === norm(activeValue));
      button.addEventListener('click', () => {
        activeType = option.type;
        activeValue = option.value;
        render();
      });
      filters.append(button);
    }
  }

  function showMessage(value, retry = false) {
    grid.replaceChildren();
    const empty = document.createElement('div');
    empty.className = 'content-empty';
    const mark = document.createElement('span');
    mark.className = 'empty-mark';
    mark.textContent = 'DC';
    const bold = document.createElement('b');
    bold.textContent = value;
    empty.append(mark, bold);
    if (retry) {
      const button = makeButton('filter-chip', 'Galeriyi yeniden yükle', 'Yeniden dene');
      button.addEventListener('click', load);
      empty.append(button);
    } else {
      const hint = document.createElement('span');
      hint.textContent = 'Başka bir kategori seçerek galeriye göz atabilirsiniz.';
      empty.append(hint);
    }
    grid.append(empty);
  }

  function render() {
    renderFilters();
    visibleItems = items.filter(item => activeType === 'all' || norm(item.category) === norm(activeValue));
    if (!visibleItems.length) {
      showMessage('Bu kategoride görsel bulunamadı.');
      return;
    }
    grid.replaceChildren();
    visibleItems.forEach((item, index) => {
      const card = document.createElement('article');
      card.className = 'gallery-card';
      const image = document.createElement('div');
      image.className = 'gallery-image';
      image.setAttribute('role', 'button');
      image.tabIndex = 0;
      image.setAttribute('aria-label', `Görseli tam ekranda aç: ${item.title || 'DC Yapı Cam Balkon uygulaması'}`);
      const img = document.createElement('img');
      img.src = item.image;
      img.alt = item.alt_text || item.title || 'DC Yapı Cam Balkon uygulaması';
      img.loading = 'lazy';
      img.onerror = () => {
        image.classList.add('image-failed');
        image.removeAttribute('role');
        image.removeAttribute('aria-label');
        image.tabIndex = -1;
        img.remove();
      };
      image.append(img);
      const category = document.createElement('small');
      category.className = 'gallery-card-category';
      category.textContent = item.category || 'Cam balkon';
      const title = document.createElement('h3');
      title.textContent = item.title || 'Cam balkon uygulaması';
      const captionText = document.createElement('p');
      captionText.textContent = item.caption || '';
      card.append(image, category, title);
      if (captionText.textContent) card.append(captionText);
      card.style.setProperty('--gallery-index', index % 4);
      grid.append(card);
    });
  }

  grid.addEventListener('click', event => {
    const trigger = event.target.closest('.gallery-image');
    if (!trigger || !grid.contains(trigger) || !trigger.querySelector('img')) return;
    const index = [...grid.querySelectorAll('.gallery-card')].indexOf(trigger.closest('.gallery-card'));
    if (index >= 0) openAt(index, trigger);
  });
  grid.addEventListener('keydown', event => {
    const trigger = event.target.closest('.gallery-image');
    if (!trigger || !trigger.querySelector('img')) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const index = [...grid.querySelectorAll('.gallery-card')].indexOf(trigger.closest('.gallery-card'));
      if (index >= 0) openAt(index, trigger);
    }
  });

  async function load() {
    showMessage('Galeri görselleri yükleniyor…');
    try {
      const response = await fetch('/api/public/gallery', {
        method: 'GET', credentials: 'omit', cache: 'no-store',
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (!data || data.ok !== true || !Array.isArray(data.items)) throw new Error('API yanıtı geçersiz');
      items = data.items.filter(item => Number(item.is_published) === 1).map(item => ({
        id: Number(item.id) || 0,
        title: String(item.title || ''),
        category: String(item.category_name || ''),
        image: safeImage(item.image_url),
        caption: String(item.caption || ''),
        alt_text: String(item.alt_text || ''),
      })).filter(item => item.image);
      render();
    } catch (error) {
      console.error('Galeri API yükleme hatası:', error);
      showMessage('Galeri şu anda yüklenemiyor.', true);
    }
  }

  load();
})();
