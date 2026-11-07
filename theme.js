(() => {
  const root = document.documentElement;
  const storageKey = 'dc-yapi-theme';
  const saved = (() => {
    try { return localStorage.getItem(storageKey); } catch (_) { return null; }
  })();
  if (saved === 'dark' || saved === 'light') root.dataset.theme = saved;

  const makeButton = () => {
    if (document.body?.hasAttribute('data-no-theme-toggle')) return;
    if (document.querySelector('.theme-toggle')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'theme-toggle';
    button.setAttribute('aria-pressed', String(root.dataset.theme === 'dark'));
    button.addEventListener('click', () => {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      button.setAttribute('aria-pressed', String(next === 'dark'));
      updateLabel(button, next);
      try { localStorage.setItem(storageKey, next); } catch (_) {}
    });
    updateLabel(button, root.dataset.theme || 'light');
    const socialDock = document.querySelector('.floating-actions');
    if (socialDock) socialDock.prepend(button);
    else document.body.append(button);
  };

  function updateLabel(button, theme) {
    const dark = theme === 'dark';
    button.innerHTML = `<span class="theme-toggle-icon" aria-hidden="true">${dark ? '☀' : '☾'}</span><span class="theme-toggle-label">${dark ? 'Gündüz modu' : 'Karanlık mod'}</span>`;
    button.setAttribute('aria-label', dark ? 'Gündüz moduna geç' : 'Karanlık moda geç');
    button.title = dark ? 'Gündüz moduna geç' : 'Karanlık moda geç';
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', makeButton, { once: true });
  else makeButton();
})();
