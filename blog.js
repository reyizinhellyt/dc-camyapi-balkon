/* DC Yapı Cam Balkon — herkese açık blog listesi (Cloudflare D1 API v2).
 * Mevcut #blogGrid / #blogFilters ve CSS sınıfları korunur.
 * Taslak ve arşiv yazıları API tarafından zaten filtrelenir.
 */
(() => {
  'use strict';

  const grid = document.querySelector('#blogGrid');
  const filters = document.querySelector('#blogFilters');
  if (!grid) return;

  let posts = [];
  let activeType = 'all';
  let activeValue = '';

  const norm = value => String(value || '').trim().toLocaleLowerCase('tr-TR');
  const cleanTags = value => {
    const raw = Array.isArray(value) ? value : (typeof value === 'string' ? value.split(/[,;،]+/) : []);
    return [...new Set(raw.map(tag => String(tag).trim()).filter(Boolean))];
  };
  const imageSrc = value => {
    if (typeof value !== 'string') return '';
    try {
      const parsed = new URL(value);
      return parsed.protocol === 'https:' && !parsed.username && !parsed.password ? parsed.href : '';
    } catch { return ''; }
  };
  const dateLabel = value => {
    if (!value) return 'DC Yapı Cam Balkon';
    const date = new Date(`${value}T12:00:00`);
    return Number.isNaN(date.getTime())
      ? 'DC Yapı Cam Balkon'
      : new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  };

  function availableFilters() {
    const categories = new Map();
    const tags = new Map();
    posts.forEach(post => {
      const category = post.category;
      if (category && !categories.has(norm(category))) categories.set(norm(category), category);
      cleanTags(post.tags).forEach(tag => {
        if (!tags.has(norm(tag))) tags.set(norm(tag), tag);
      });
    });
    return [
      ...[...categories.values()].map(value => ({ type: 'category', value, label: value })),
      ...[...tags.values()].map(value => ({ type: 'tag', value, label: `#${value}` })),
    ];
  }

  function renderFilters() {
    if (!filters) return;
    const choices = availableFilters();
    if (activeType !== 'all' && !choices.some(x => x.type === activeType && norm(x.value) === norm(activeValue))) {
      activeType = 'all';
      activeValue = '';
    }
    filters.replaceChildren();
    for (const choice of [{ type: 'all', value: '', label: 'Tümü' }, ...choices]) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'filter-chip';
      button.textContent = choice.label;
      button.classList.toggle('active', choice.type === activeType && norm(choice.value) === norm(activeValue));
      button.setAttribute('aria-label', choice.type === 'category'
        ? `Kategori: ${choice.value}`
        : choice.type === 'tag' ? `Etiket: ${choice.value}` : 'Tüm blog yazıları');
      button.addEventListener('click', () => {
        activeType = choice.type;
        activeValue = choice.value;
        render();
      });
      filters.append(button);
    }
  }

  function matches(post) {
    if (activeType === 'all') return true;
    if (activeType === 'category') return norm(post.category) === norm(activeValue);
    return cleanTags(post.tags).some(tag => norm(tag) === norm(activeValue));
  }

  function buildCard(post, index) {
    const article = document.createElement('article');
    article.className = 'blog-card';

    const image = document.createElement('div');
    image.className = `blog-card-image blog-art-${index % 3}`;
    const src = imageSrc(post.image);
    if (src) {
      const img = document.createElement('img');
      img.src = src;
      img.alt = post.title;
      img.loading = 'lazy';
      img.onerror = () => img.remove();
      image.append(img);
    }
    const category = document.createElement('span');
    category.className = 'blog-category';
    category.textContent = post.category || 'Cam balkon';
    image.append(category);

    const body = document.createElement('div');
    body.className = 'blog-card-body';
    const meta = document.createElement('small');
    meta.textContent = dateLabel(post.date);
    const title = document.createElement('h3');
    title.textContent = post.title;
    const excerpt = document.createElement('p');
    excerpt.textContent = post.excerpt;
    body.append(meta, title, excerpt);

    const tags = cleanTags(post.tags);
    if (tags.length) {
      const tagList = document.createElement('div');
      tagList.className = 'content-card-tags';
      tags.forEach(tag => {
        const chip = document.createElement('span');
        chip.className = 'content-card-tag';
        chip.textContent = `#${tag}`;
        tagList.append(chip);
      });
      body.append(tagList);
    }

    const details = document.createElement('details');
    details.className = 'blog-readmore';
    const summary = document.createElement('summary');
    summary.textContent = 'Yazının devamı';
    const content = document.createElement('p');
    content.textContent = post.content;
    content.style.whiteSpace = 'pre-wrap';
    details.append(summary, content);
    body.append(details);
    article.append(image, body);
    return article;
  }

  function showMessage(message, retry = false) {
    grid.replaceChildren();
    const box = document.createElement('div');
    box.className = 'content-empty';
    box.textContent = message;
    if (retry) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'filter-chip';
      button.textContent = 'Yeniden dene';
      button.addEventListener('click', load);
      box.append(document.createTextNode(' '), button);
    }
    grid.append(box);
  }

  function render() {
    renderFilters();
    const visible = posts.filter(matches).sort((a, b) =>
      (b.date || '').localeCompare(a.date || '') || b.id - a.id
    );
    if (!visible.length) {
      showMessage(posts.length
        ? 'Bu kategori veya etikette blog yazısı bulunamadı.'
        : 'Henüz yayımlanmış bir blog yazısı yok.');
      return;
    }
    grid.replaceChildren(...visible.map(buildCard));
  }

  async function load() {
    showMessage('Blog yazıları yükleniyor…');
    try {
      const response = await fetch('/api/public/posts', {
        method: 'GET', credentials: 'omit', cache: 'no-store',
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (!data || data.ok !== true || !Array.isArray(data.items)) throw new Error('API yanıtı geçersiz');
      posts = data.items.filter(item => item.status === 'published').map(item => ({
        id: Number(item.id) || 0,
        title: String(item.title || ''),
        category: String(item.category_name || ''),
        date: String(item.post_date || ''),
        excerpt: String(item.excerpt || ''),
        content: String(item.content || ''),
        image: item.image_url || '',
        tags: cleanTags(item.tags),
      }));
      render();
    } catch (error) {
      console.error('Blog API yükleme hatası:', error);
      showMessage('Blog yazıları şu anda yüklenemiyor.', true);
    }
  }

  load();
})();
