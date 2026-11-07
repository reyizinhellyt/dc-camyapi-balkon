












(() => {
  const track = document.getElementById('instagramTrack');
  if (!track) return;

  const key = window.DC_INSTAGRAM_KEY || 'dcYapiInstagramPosts';
  const defaults = window.DC_DEFAULT_INSTAGRAM_POSTS || [];
  const previous = document.getElementById('instagramPrev');
  const next = document.getElementById('instagramNext');
  const section = document.getElementById('instagram');

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

  async function readPosts() {
    const response = await fetch('/api/public/instagram', {cache: 'no-store'});
    if (!response.ok) throw new Error('Instagram API yanıt vermedi');
    const data = await response.json();
    if (!data || data.ok !== true || !Array.isArray(data.items)) throw new Error('Instagram API verisi geçersiz');
    return [...new Set(data.items.map(item => normalizePost(item.post_url)).filter(Boolean))].slice(0,5);
  }

  function syncButtons() {
    const max = track.scrollWidth - track.clientWidth;
    if (previous) previous.disabled = track.scrollLeft <= 2;
    if (next) next.disabled = track.scrollLeft >= max - 2;
  }

  function processEmbeds() {
    if (window.instgrm && window.instgrm.Embeds) {
      window.instgrm.Embeds.process();
      return;
    }
    if (document.querySelector('script[data-dc-instagram-embed]')) return;
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.instagram.com/embed.js';
    script.dataset.dcInstagramEmbed = 'true';
    script.addEventListener('load', () => window.instgrm?.Embeds?.process());
    script.addEventListener('error', () => { track.dataset.embedState = 'unavailable'; });
    document.head.append(script);
  }

  async function renderPosts() {
    let posts;
    try { posts = await readPosts(); }
    catch (error) {
      track.replaceChildren();
      const p = document.createElement('p');
      p.className = 'instagram-empty';
      p.textContent = 'Instagram gönderileri şu anda yüklenemiyor.';
      track.append(p);
      console.warn('Instagram D1 API:', error.message);
      return;
    }
    track.replaceChildren();
    if (!posts.length) {
      const empty = document.createElement('p');
      empty.className = 'instagram-empty';
      empty.textContent = 'Instagram gönderileri yakında burada görünecek.';
      track.append(empty);
    }

    posts.forEach((post, index) => {
      const card = document.createElement('article');
      card.className = 'instagram-card';
      const embed = document.createElement('div');
      embed.className = 'instagram-embed-shell';
      const quote = document.createElement('blockquote');
      quote.className = 'instagram-media';
      quote.setAttribute('data-instgrm-permalink', post);
      quote.setAttribute('data-instgrm-version', '14');
      quote.style.cssText = 'background:#fff;border:0;border-radius:3px;box-shadow:none;margin:0;max-width:100%;min-width:0;padding:0;width:100%;';

      const fallback = document.createElement('div');
      fallback.className = 'instagram-embed-fallback';
      const mark = document.createElement('span');
      mark.className = 'instagram-embed-mark';
      mark.setAttribute('aria-hidden', 'true');
      mark.textContent = '◎';
      const message = document.createElement('p');
      message.textContent = 'Instagram gönderisi yükleniyor…';
      const fallbackLink = document.createElement('a');
      fallbackLink.href = post;
      fallbackLink.target = '_blank';
      fallbackLink.rel = 'noopener noreferrer';
      fallbackLink.textContent = 'Gönderiyi Instagram’da aç ↗';
      fallback.append(mark, message, fallbackLink);
      quote.append(fallback);
      embed.append(quote);

      const action = document.createElement('a');
      action.className = 'instagram-card-action';
      action.href = post;
      action.target = '_blank';
      action.rel = 'noopener noreferrer';
      action.setAttribute('aria-label', `${index + 1}. gönderiyi Instagram’da aç`);
      action.textContent = 'Instagram’da görüntüle ↗';
      card.append(embed, action);
      track.append(card);
    });

    requestAnimationFrame(syncButtons);
    if (posts.length) processEmbeds();
  }

  function scroll(direction) {
    const card = track.querySelector('.instagram-card');
    if (!card) return;
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    track.scrollBy({ left: direction * (card.getBoundingClientRect().width + gap), behavior: 'smooth' });
  }

  previous?.addEventListener('click', () => scroll(-1));
  next?.addEventListener('click', () => scroll(1));
  track.addEventListener('scroll', syncButtons, { passive: true });
  track.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight') { event.preventDefault(); scroll(1); }
    else if (event.key === 'ArrowLeft') { event.preventDefault(); scroll(-1); }
  });
  window.addEventListener('resize', syncButtons);

  renderPosts();
  if ('IntersectionObserver' in window && section) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        processEmbeds();
        observer.disconnect();
      }
    }, { rootMargin: '300px 0px' });
    observer.observe(section);
  } else {
    processEmbeds();
  }
})();



