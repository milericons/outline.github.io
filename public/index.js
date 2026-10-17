document.addEventListener('DOMContentLoaded', () => {
  const FAVORITES_KEY = 'milericons-favorites';
  const availableIcons = new Set(MillerIcons.names);
  let favorites = new Set();
  const packageIcons = new Set();
  try {
    const storedFavorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
    if (Array.isArray(storedFavorites)) {
      favorites = new Set(storedFavorites.filter((name) => availableIcons.has(name)));
    }
  } catch (error) {
    console.error('No se pudieron cargar los favoritos:', error);
  }

  function updateFavoriteButton(cell, isFavorite) {
    const button = cell.querySelector('.icon-cell__favorite');
    const label = isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos';
    cell.classList.toggle('is-favorite', isFavorite);
    button.setAttribute('aria-label', label);
    button.setAttribute('aria-pressed', String(isFavorite));
    button.querySelector('.icon-cell__action-label').textContent = label;
  }

  function updatePackageButton(cell, isSelected) {
    const button = cell.querySelector('.icon-cell__package');
    const label = isSelected ? 'Quitar del paquete' : 'Añadir al paquete';
    cell.classList.toggle('is-in-package', isSelected);
    button.setAttribute('aria-label', label);
    button.setAttribute('aria-pressed', String(isSelected));
    button.querySelector('.icon-cell__action-label').textContent = label;
  }

  function createIconCell(name, extraClass = '') {
    const cell = document.createElement('div');
    cell.className = `icon-cell${extraClass ? ` ${extraClass}` : ''}`;
    cell.dataset.name = name;

    const icon = document.createElement('span');
    icon.className = 'miller-icon';
    icon.dataset.icon = name;

    const label = document.createElement('span');
    label.className = 'icon-cell__name';
    label.textContent = name.replaceAll('_', ' ');

    const favoriteButton = document.createElement('button');
    favoriteButton.type = 'button';
    favoriteButton.className = 'icon-cell__favorite';
    favoriteButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"></path></svg><span class="icon-cell__action-label"></span>';
    const packageButton = document.createElement('button');
    packageButton.type = 'button';
    packageButton.className = 'icon-cell__package';
    packageButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"></path></svg><span class="icon-cell__action-label"></span>';
    const actions = document.createElement('div');
    actions.className = 'icon-cell__actions';
    const actionsToggle = document.createElement('button');
    actionsToggle.type = 'button';
    actionsToggle.className = 'icon-cell__actions-toggle';
    actionsToggle.setAttribute('aria-label', `Acciones para ${name.replaceAll('_', ' ')}`);
    actionsToggle.setAttribute('aria-haspopup', 'true');
    actionsToggle.setAttribute('aria-expanded', 'false');
    actionsToggle.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>';
    const actionsMenu = document.createElement('div');
    actionsMenu.className = 'icon-cell__actions-menu';
    actionsMenu.hidden = true;
    actionsMenu.append(favoriteButton, packageButton);
    actions.append(actionsToggle, actionsMenu);
    cell.append(icon, label, actions);
    updateFavoriteButton(cell, favorites.has(name));
    updatePackageButton(cell, packageIcons.has(name));
    return cell;
  }

  const fragment = document.createDocumentFragment();
  MillerIcons.names.forEach((name) => {
    fragment.append(createIconCell(name));
  });
  document.body.append(fragment);

  const copyButton = document.querySelector('.dock__copy');
  copyButton.addEventListener('click', async () => {
    const snippet = '<script src="https://milericons.github.io/resources.github.io/public/miller-icons.js" defer></script>';
    await navigator.clipboard.writeText(snippet);
    copyButton.textContent = 'copiado';
    setTimeout(() => {
      copyButton.textContent = 'copiar';
    }, 1500);
  });

  const searchToggle = document.querySelector('[data-search-toggle]');
  const searchPanel = document.querySelector('.dock__search');
  const searchInput = document.querySelector('.dock__search-input');
  const searchClear = document.querySelector('.dock__search-clear');
  const iconCells = document.querySelectorAll('.icon-cell');
  const favoriteToggle = document.querySelector('[data-favorites-toggle]');
  const favoritesModal = document.querySelector('[data-favorites-modal]');
  const favoritesGrid = document.querySelector('[data-favorites-grid]');
  const favoritesCount = document.querySelector('[data-favorites-count]');
  const favoritesEmpty = document.querySelector('[data-favorites-empty]');
  const favoritesClose = document.querySelector('[data-favorites-close]');
  const packageToggle = document.querySelector('[data-package-toggle]');
  const packageModal = document.querySelector('[data-package-modal]');
  const packageClose = document.querySelector('[data-package-close]');
  const packageColor = document.querySelector('[data-package-color]');
  const packageSizeToggle = document.querySelector('[data-package-size-toggle]');
  const packageSizeLabel = document.querySelector('[data-package-size-label]');
  const packageSizeMenu = document.querySelector('[data-package-size-menu]');
  const packageSizeOptions = document.querySelectorAll('[data-package-size-option]');
  let packageSize = '24';
  const packageCount = document.querySelector('[data-package-count]');
  const packagePreview = document.querySelector('[data-package-preview]');
  const packageOutput = document.querySelector('[data-package-output]');
  const packageNote = document.querySelector('[data-package-note]');
  const packageCopy = document.querySelector('[data-package-copy]');
  const packageDownloadSprite = document.querySelector('[data-package-download-sprite]');
  const packageDownloadSvgs = document.querySelector('[data-package-download-svgs]');
  const packageFormats = document.querySelectorAll('[data-package-format]');
  let packageFormat = 'html';
  let packageRenderVersion = 0;

  function updateFavoritesToggle() {
    favoriteToggle.classList.toggle('has-favorites', favorites.size > 0);
  }

  updateFavoritesToggle();

  function renderFavorites() {
    const names = MillerIcons.names.filter((name) => favorites.has(name));
    favoritesCount.textContent = `${names.length} ${names.length === 1 ? 'icono guardado' : 'iconos guardados'}`;
    favoritesEmpty.hidden = names.length > 0;
    favoritesGrid.hidden = names.length === 0;
    favoritesGrid.replaceChildren();
    names.forEach((name) => {
      const cell = createIconCell(name, 'favorites-modal__item');
      bindIconCell(cell, () => {
        closeFavorites();
        openInfo(name);
      });
      favoritesGrid.append(cell);
    });
    MillerIcons.scan(favoritesGrid);
  }

  function saveFavorites() {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
    } catch (error) {
      console.error('No se pudieron guardar los favoritos:', error);
    }
  }

  function toggleFavorite(name) {
    if (favorites.has(name)) favorites.delete(name);
    else favorites.add(name);
    saveFavorites();
    updateFavoritesToggle();
    document.querySelectorAll('.icon-cell').forEach((cell) => {
      if (cell.dataset.name !== name) return;
      updateFavoriteButton(cell, favorites.has(name));
    });
    if (!favoritesModal.hidden) {
      renderFavorites();
      favoritesClose.focus();
    }
  }

  function openFavorites() {
    renderFavorites();
    favoritesModal.hidden = false;
    document.body.classList.add('has-modal');
    favoritesClose.focus();
  }

  function closeFavorites() {
    favoritesModal.hidden = true;
    document.body.classList.remove('has-modal');
    favoriteToggle.focus();
  }

  function packageIconNames() {
    return MillerIcons.names.filter((name) => packageIcons.has(name));
  }

  function renderPackagePreview() {
    const names = packageIconNames();
    packageCount.textContent = `${names.length} ${names.length === 1 ? 'icono seleccionado' : 'iconos seleccionados'}`;
    packagePreview.replaceChildren();
    if (names.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'package-builder__empty';
      empty.textContent = 'Añade iconos desde la cuadrícula principal para preparar tu paquete.';
      packagePreview.append(empty);
      return;
    }
    names.forEach((name) => {
      const item = document.createElement('div');
      item.className = 'package-builder__preview-icon';
      const icon = document.createElement('span');
      icon.className = 'miller-icon';
      icon.dataset.icon = name;
      icon.style.width = `${packageSize}px`;
      icon.style.height = `${packageSize}px`;
      icon.style.color = packageColor.value;
      const label = document.createElement('span');
      label.textContent = name.replaceAll('_', ' ');
      item.append(icon, label);
      packagePreview.append(item);
    });
    MillerIcons.scan(packagePreview);
  }

  async function createStyledSvg(name) {
    const markup = await MillerIcons.getSvgMarkup(name);
    const parsed = new DOMParser().parseFromString(markup, 'image/svg+xml');
    const svg = parsed.documentElement;
    if (svg.localName !== 'svg' || parsed.querySelector('parsererror')) {
      throw new Error(`El icono "${name}" no contiene un SVG válido`);
    }
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('width', packageSize);
    svg.setAttribute('height', packageSize);
    svg.setAttribute('color', packageColor.value);
    return new XMLSerializer().serializeToString(svg);
  }

  async function packageExportContent(format, names) {
    if (names.length === 0) return '';
    const svgs = await Promise.all(names.map(async (name) => ({
      name,
      markup: await createStyledSvg(name),
    })));
    if (format === 'html') {
      return svgs.map(({ name, markup }) => `<!-- ${name} -->\n${markup}`).join('\n\n');
    }
    const symbols = svgs.map(({ name, markup }) => {
      const parsed = new DOMParser().parseFromString(markup, 'image/svg+xml');
      const sourceSvg = parsed.documentElement;
      const symbol = document.createElementNS('http://www.w3.org/2000/svg', 'symbol');
      symbol.setAttribute('id', `milericons-${name}`);
      symbol.setAttribute('viewBox', sourceSvg.getAttribute('viewBox') || '0 0 24 24');
      symbol.setAttribute('fill', 'currentColor');
      Array.from(sourceSvg.childNodes).forEach((node) => symbol.append(node.cloneNode(true)));
      return new XMLSerializer().serializeToString(symbol);
    }).join('\n');
    return `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n${symbols}\n</svg>\n\n<!-- Uso: <svg width="${packageSize}" height="${packageSize}" color="${packageColor.value}"><use href="milericons-sprite.svg#milericons-${names[0]}"></use></svg> -->`;
  }

  async function updatePackageExport() {
    const version = ++packageRenderVersion;
    const names = packageIconNames();
    const hasSelection = names.length > 0;
    packageCopy.disabled = !hasSelection;
    packageDownloadSprite.disabled = !hasSelection;
    packageDownloadSvgs.disabled = !hasSelection;
    packageNote.textContent = hasSelection
      ? 'Puedes copiar el código, descargar un sprite con todos los iconos o bajar los SVG individuales.'
      : 'Elige iconos para habilitar la exportación.';
    if (!hasSelection) {
      packageOutput.textContent = '';
      return;
    }
    packageOutput.textContent = 'Generando código…';
    try {
      const content = await packageExportContent(packageFormat, names);
      if (version === packageRenderVersion) packageOutput.textContent = content;
    } catch (error) {
      console.error('No se pudo generar el código del paquete:', error);
      if (version === packageRenderVersion) {
        packageOutput.textContent = '';
        packageNote.textContent = 'No se pudo generar el paquete. Inténtalo de nuevo.';
      }
    }
  }

  function renderPackageSelection() {
    document.querySelectorAll('.icon-cell').forEach((cell) => {
      updatePackageButton(cell, packageIcons.has(cell.dataset.name));
    });
    renderPackagePreview();
    updatePackageExport();
  }

  function togglePackageIcon(name) {
    if (!availableIcons.has(name)) return;
    if (packageIcons.has(name)) packageIcons.delete(name);
    else packageIcons.add(name);
    renderPackageSelection();
  }

  function openPackageBuilder() {
    closeInfo();
    packageModal.hidden = false;
    document.body.classList.add('has-modal');
    renderPackageSelection();
    packageClose.focus();
  }

  function closePackageBuilder() {
    packageModal.hidden = true;
    document.body.classList.remove('has-modal');
    packageToggle.focus();
  }

  function downloadText(filename, content, mimeType) {
    const link = document.createElement('a');
    const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function closeIconActions(except = null) {
    document.querySelectorAll('.icon-cell__actions.is-open').forEach((actions) => {
      if (actions === except) return;
      actions.classList.remove('is-open');
      actions.querySelector('.icon-cell__actions-toggle').setAttribute('aria-expanded', 'false');
      actions.querySelector('.icon-cell__actions-menu').hidden = true;
    });
  }

  function bindIconCell(cell, onSelect) {
    cell.addEventListener('click', (event) => {
      event.stopPropagation();
      if (onSelect) {
        onSelect();
        return;
      }
      const name = cell.dataset.name;
      if (!infoPanel.hidden && cell.classList.contains('is-selected')) closeInfo();
      else openInfo(name);
    });
    const actions = cell.querySelector('.icon-cell__actions');
    const actionsToggle = actions.querySelector('.icon-cell__actions-toggle');
    const actionsMenu = actions.querySelector('.icon-cell__actions-menu');
    actionsToggle.addEventListener('click', (event) => {
      event.stopPropagation();
      const willOpen = !actions.classList.contains('is-open');
      closeIconActions(actions);
      actions.classList.toggle('is-open', willOpen);
      actionsToggle.setAttribute('aria-expanded', String(willOpen));
      actionsMenu.hidden = !willOpen;
      if (willOpen) actionsMenu.querySelector('button').focus();
    });
    cell.querySelector('.icon-cell__favorite').addEventListener('click', (event) => {
      event.stopPropagation();
      toggleFavorite(cell.dataset.name);
      closeIconActions();
      if (favoritesModal.hidden) actionsToggle.focus();
    });
    cell.querySelector('.icon-cell__package').addEventListener('click', (event) => {
      event.stopPropagation();
      togglePackageIcon(cell.dataset.name);
      closeIconActions();
      actionsToggle.focus();
    });
  }

  iconCells.forEach((cell) => bindIconCell(cell));
  favoriteToggle.addEventListener('click', (event) => {
    event.stopPropagation();
    openFavorites();
  });
  packageToggle.addEventListener('click', (event) => {
    event.stopPropagation();
    openPackageBuilder();
  });
  packageClose.addEventListener('click', (event) => {
    event.stopPropagation();
    closePackageBuilder();
  });
  packageModal.addEventListener('click', (event) => {
    if (event.target === packageModal) {
      event.stopPropagation();
      closePackageBuilder();
    }
  });
  packageModal.querySelector('.package-builder__dialog').addEventListener('click', (event) => event.stopPropagation());
  packageModal.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const focusable = [...packageModal.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled])')]
      .filter((element) => !element.closest('[hidden]'));
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  packageColor.addEventListener('input', () => {
    renderPackagePreview();
    updatePackageExport();
  });
  packageSizeToggle.addEventListener('click', (event) => {
    event.stopPropagation();
    packageSizeMenu.hidden = !packageSizeMenu.hidden;
    packageSizeToggle.setAttribute('aria-expanded', String(!packageSizeMenu.hidden));
  });
  packageSizeMenu.addEventListener('click', (event) => event.stopPropagation());
  packageSizeOptions.forEach((option) => {
    option.addEventListener('click', () => {
      packageSize = option.dataset.packageSizeOption;
      packageSizeLabel.textContent = `${packageSize} px`;
      packageSizeToggle.setAttribute('aria-label', `Tamaño de los iconos: ${packageSize} px`);
      packageSizeOptions.forEach((sizeOption) => {
        sizeOption.setAttribute('aria-checked', String(sizeOption === option));
        sizeOption.classList.toggle('is-active', sizeOption === option);
      });
      packageSizeMenu.hidden = true;
      packageSizeToggle.setAttribute('aria-expanded', 'false');
      packageSizeToggle.focus();
      renderPackagePreview();
      updatePackageExport();
    });
  });
  packageFormats.forEach((button) => {
    button.addEventListener('click', () => {
      packageFormat = button.dataset.packageFormat;
      packageFormats.forEach((formatButton) => {
        const isActive = formatButton === button;
        formatButton.classList.toggle('is-active', isActive);
        formatButton.setAttribute('aria-selected', String(isActive));
      });
      updatePackageExport();
    });
  });
  packageCopy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(packageOutput.textContent);
      packageNote.textContent = 'Código copiado al portapapeles.';
    } catch (error) {
      console.error('No se pudo copiar el código del paquete:', error);
      packageNote.textContent = 'No se pudo copiar. Revisa los permisos del navegador.';
    }
  });
  packageDownloadSprite.addEventListener('click', async () => {
    try {
      const content = await packageExportContent('sprite', packageIconNames());
      downloadText('milericons-sprite.svg', content, 'image/svg+xml');
    } catch (error) {
      console.error('No se pudo descargar el sprite:', error);
      packageNote.textContent = 'No se pudo descargar el sprite.';
    }
  });
  packageDownloadSvgs.addEventListener('click', async () => {
    try {
      const files = await Promise.all(packageIconNames().map(async (name) => ({
        name,
        markup: await createStyledSvg(name),
      })));
      files.forEach(({ name, markup }) => downloadText(`${name}.svg`, markup, 'image/svg+xml'));
      packageNote.textContent = files.length > 1
        ? `Descargando ${files.length} SVG individuales. El navegador puede pedir permiso para varias descargas.`
        : 'SVG descargado.';
    } catch (error) {
      console.error('No se pudieron descargar los SVG:', error);
      packageNote.textContent = 'No se pudieron descargar los SVG individuales.';
    }
  });
  favoritesClose.addEventListener('click', (event) => {
    event.stopPropagation();
    closeFavorites();
  });
  favoritesModal.addEventListener('click', (event) => {
    if (event.target === favoritesModal) {
      event.stopPropagation();
      closeFavorites();
    }
  });
  favoritesModal.querySelector('.favorites-modal__dialog').addEventListener('click', (event) => event.stopPropagation());
  favoritesModal.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const focusable = [...favoritesModal.querySelectorAll('button:not([disabled]), [tabindex]:not([tabindex="-1"])')]
      .filter((element) => !element.closest('[hidden]'));
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  const THEME_KEY = 'milericons-theme';
  const root = document.documentElement;
  const colorScheme = window.matchMedia('(prefers-color-scheme: dark)');
  const themeToggle = document.querySelector('[data-theme-toggle]');
  const themePanel = document.querySelector('.dock__theme');
  const themeOptions = document.querySelectorAll('[data-theme-option]');

  let currentTheme = 'system';
  try {
    currentTheme = localStorage.getItem(THEME_KEY) || 'system';
  } catch (e) {}

  const THEME_ICONS = { light: 'sun', dark: 'moon', system: 'computer' };

  function applyTheme(theme) {
    currentTheme = theme;
    const resolved = theme === 'system' ? (colorScheme.matches ? 'dark' : 'light') : theme;
    root.dataset.theme = resolved;
    themeToggle.dataset.icon = THEME_ICONS[theme];
    MillerIcons.render(themeToggle);
    themeOptions.forEach((option) => {
      option.classList.toggle('is-active', option.dataset.themeOption === theme);
    });
  }

  applyTheme(currentTheme);

  colorScheme.addEventListener('change', () => {
    if (currentTheme === 'system') applyTheme('system');
  });

  function openTheme() {
    themePanel.hidden = false;
  }

  function closeTheme() {
    themePanel.hidden = true;
  }

  themeToggle.addEventListener('click', (event) => {
    event.stopPropagation();
    if (themePanel.hidden) openTheme();
    else closeTheme();
  });

  themePanel.addEventListener('click', (event) => event.stopPropagation());

  themeOptions.forEach((option) => {
    option.addEventListener('click', () => {
      const theme = option.dataset.themeOption;
      applyTheme(theme);
      try {
        localStorage.setItem(THEME_KEY, theme);
      } catch (e) {}
      closeTheme();
    });
  });

  function filterGrid(query) {
    const term = query.trim().toLowerCase();
    document.body.classList.toggle('is-filtering', term !== '');
    iconCells.forEach((cell) => {
      cell.hidden = term !== '' && !cell.dataset.name.includes(term);
    });
  }

  function openSearch() {
    closeInfo();
    searchPanel.hidden = false;
    searchInput.focus();
  }

  function closeSearch() {
    searchPanel.hidden = true;
    searchInput.value = '';
    searchClear.setAttribute('aria-label', 'Cerrar búsqueda');
    searchClear.title = 'Cerrar búsqueda';
    filterGrid('');
  }

  searchToggle.addEventListener('click', (event) => {
    event.stopPropagation();
    if (searchPanel.hidden) openSearch();
    else closeSearch();
  });

  searchPanel.addEventListener('click', (event) => event.stopPropagation());
  searchInput.addEventListener('input', () => {
    filterGrid(searchInput.value);
    const hasQuery = searchInput.value.length > 0;
    searchClear.setAttribute('aria-label', hasQuery ? 'Limpiar búsqueda' : 'Cerrar búsqueda');
    searchClear.title = hasQuery ? 'Limpiar búsqueda' : 'Cerrar búsqueda';
  });
  searchClear.addEventListener('click', () => {
    if (searchInput.value.length === 0) {
      closeSearch();
      return;
    }
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    searchInput.focus();
  });

  const infoPanel = document.querySelector('.dock__info');
  const infoName = document.querySelector('.dock__info-name');
  const infoIcon = document.querySelector('.dock__info-icon');
  const infoTabs = document.querySelectorAll('[data-info-tab]');
  const infoPanes = document.querySelectorAll('[data-info-pane]');
  const infoHtml = document.querySelector('[data-info-html]');
  const infoSvg = document.querySelector('[data-info-svg]');
  const infoSizeLabel = document.querySelector('[data-size-label]');
  const infoDownload = document.querySelector('[data-info-download]');
  const infoAnimTab = document.querySelector('[data-info-tab="anim"]');
  const infoAnim = document.querySelector('[data-info-anim]');
  const sizeToggle = document.querySelector('[data-size-toggle]');
  const sizeMenu = document.querySelector('.dock__size-menu');
  const sizeOptions = document.querySelectorAll('[data-size-option]');

  let pngSize = 256;

  sizeToggle.addEventListener('click', (event) => {
    event.stopPropagation();
    sizeMenu.hidden = !sizeMenu.hidden;
  });

  sizeMenu.addEventListener('click', (event) => event.stopPropagation());

  sizeOptions.forEach((option) => {
    option.addEventListener('click', () => {
      pngSize = Number(option.dataset.sizeOption);
      infoSizeLabel.textContent = `${pngSize} px`;
      sizeOptions.forEach((item) => {
        item.classList.toggle('is-active', item === option);
      });
      sizeMenu.hidden = true;
    });
  });

  const ANIMATED_NAMES = new Set([
    'loader', 'loader_min', 'loop', 'restart', 'reset', 'refresh',
    'terminal', 'chat_unread', 'wifi', 'file_text', 'download', 'download_cloud',
    'upload', 'upload_cloud', 'progress', 'check', 'login_circle', 'logout_circle',
    'share_box', 'fingerprint',
  ]);

  function hasAnimation(name) {
    if (ANIMATED_NAMES.has(name)) return true;
    return /^arrow_(left|right|up|down)(?:_|$)/.test(name);
  }

  function htmlSnippet(name) {
    return `<span class="miller-icon" data-icon="${name}"></span>`;
  }

  function animatedSnippet(name) {
    return `<span class="miller-icon" data-icon="${name}" data-animated="true"></span>`;
  }

  function htmlSnippetHighlighted(name) {
    return `<span class="tok-tag">&lt;span</span> <span class="tok-attr">class</span>=<span class="tok-str">"miller-icon"</span> <span class="tok-attr">data-icon</span>=<span class="tok-str">"${name}"</span>&gt;<span class="tok-tag">&lt;/span&gt;</span>`;
  }

  function animatedSnippetHighlighted(name) {
    return `<span class="tok-tag">&lt;span</span> <span class="tok-attr">class</span>=<span class="tok-str">"miller-icon"</span> <span class="tok-attr">data-icon</span>=<span class="tok-str">"${name}"</span> <span class="tok-attr">data-animated</span>=<span class="tok-str">"true"</span>&gt;<span class="tok-tag">&lt;/span&gt;</span>`;
  }

  function escapeHtml(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function highlightSvg(markup) {
    const tokenRe = /(<\/?)([\w:-]+)|([\w:-]+)(=)|("[^"]*"|'[^']*')|(\/?>)/g;
    let out = '';
    let last = 0;
    let match;
    while ((match = tokenRe.exec(markup)) !== null) {
      out += escapeHtml(markup.slice(last, match.index));
      if (match[2] !== undefined) {
        out += `<span class="tok-punct">${escapeHtml(match[1])}</span><span class="tok-tag">${escapeHtml(match[2])}</span>`;
      } else if (match[3] !== undefined) {
        out += `<span class="tok-attr">${escapeHtml(match[3])}</span><span class="tok-punct">=</span>`;
      } else if (match[5] !== undefined) {
        out += `<span class="tok-str">${escapeHtml(match[5])}</span>`;
      } else if (match[6] !== undefined) {
        out += `<span class="tok-punct">${escapeHtml(match[6])}</span>`;
      }
      last = tokenRe.lastIndex;
    }
    out += escapeHtml(markup.slice(last));
    return out;
  }

  function setInfoTab(tab) {
    infoTabs.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.infoTab === tab);
    });
    infoPanes.forEach((pane) => {
      pane.hidden = pane.dataset.infoPane !== tab;
    });
    if (tab === 'anim' && !infoAnimTab.hidden) {
      infoIcon.dataset.animated = 'true';
    } else {
      infoIcon.removeAttribute('data-animated');
    }
    sizeMenu.hidden = true;
  }

  function openInfo(name) {
    const label = name.replaceAll('_', '_\u200B');
    const animatable = hasAnimation(name);
    infoName.textContent = label;
    infoIcon.removeAttribute('data-animated');
    infoIcon.dataset.icon = name;
    MillerIcons.render(infoIcon);
    infoHtml.innerHTML = htmlSnippetHighlighted(name);
    infoSvg.textContent = 'cargando…';
    MillerIcons.getSvgMarkup(name).then((svg) => {
      if (infoPanel.hidden || infoIcon.dataset.icon !== name) return;
      infoSvg.innerHTML = highlightSvg(svg.trim());
    });
    infoAnimTab.hidden = !animatable;
    if (animatable) {
      infoAnim.innerHTML = animatedSnippetHighlighted(name);
    }
    setInfoTab('html');
    infoPanel.hidden = false;
    iconCells.forEach((cell) => {
      cell.classList.toggle('is-selected', cell.dataset.name === name);
    });
  }

  function closeInfo() {
    infoPanel.hidden = true;
    infoIcon.removeAttribute('data-animated');
    iconCells.forEach((cell) => cell.classList.remove('is-selected'));
  }

  infoPanel.addEventListener('click', (event) => event.stopPropagation());
  document.querySelector('[data-info-close]').addEventListener('click', closeInfo);
  infoTabs.forEach((button) => {
    button.addEventListener('click', () => setInfoTab(button.dataset.infoTab));
  });

  document.querySelectorAll('[data-copy-info]').forEach((button) => {
    button.addEventListener('click', async () => {
      const kind = button.dataset.copyInfo;
      const name = infoIcon.dataset.icon;
      const text =
        kind === 'html' ? htmlSnippet(name)
        : kind === 'anim' ? animatedSnippet(name)
        : infoSvg.textContent;
      await navigator.clipboard.writeText(text);
      const label = button.textContent;
      button.textContent = 'copiado';
      setTimeout(() => {
        button.textContent = label;
      }, 1500);
    });
  });

  infoDownload.addEventListener('click', async () => {
    const name = infoIcon.dataset.icon;
    const size = pngSize;
    try {
      const svg = await MillerIcons.getSvgMarkup(name);
      const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);
      const image = new Image();
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
        image.src = url;
      });
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      canvas.getContext('2d').drawImage(image, 0, 0, size, size);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${name}-${size}.png`;
        link.click();
        URL.revokeObjectURL(link.href);
      }, 'image/png');
    } catch (error) {
      console.error('No se pudo exportar el png:', error);
    }
  });

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (!target.closest('.icon-cell__actions')) closeIconActions();
    if (!target.closest('.package-builder__size-wrap')) {
      packageSizeMenu.hidden = true;
      packageSizeToggle.setAttribute('aria-expanded', 'false');
    }
    if (!target.closest('.dock__theme-wrap')) closeTheme();
    if (!target.closest('.dock__size-wrap')) sizeMenu.hidden = true;
  }, true);

  document.addEventListener('click', () => {
    closeSearch();
    closeTheme();
    closeInfo();
    sizeMenu.hidden = true;
  });
  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (!packageModal.hidden) {
        packageClose.focus();
        return;
      }
      if (searchPanel.hidden) openSearch();
      else searchInput.focus();
      return;
    }
    if (event.key === 'Escape') {
      if (!packageSizeMenu.hidden) {
        packageSizeMenu.hidden = true;
        packageSizeToggle.setAttribute('aria-expanded', 'false');
        packageSizeToggle.focus();
        return;
      }
      const openActions = document.querySelector('.icon-cell__actions.is-open');
      if (openActions) {
        const trigger = openActions.querySelector('.icon-cell__actions-toggle');
        closeIconActions();
        trigger.focus();
        return;
      }
      if (!packageModal.hidden) {
        closePackageBuilder();
        return;
      }
      if (!favoritesModal.hidden) {
        closeFavorites();
        return;
      }
      closeSearch();
      closeTheme();
      closeInfo();
      sizeMenu.hidden = true;
    }
  });
});
