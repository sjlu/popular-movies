/* ════════════════════════════════════════════════════════
   CONFIGURATION
════════════════════════════════════════════════════════ */

const BASE = 'https://popular-movies-data.stevenlu.com/';

/* One accent colour is picked at random on every page load */
const ACCENTS = [
  '#3b82f6', '#ef4444', '#f59e0b', '#10b981',
  '#8b5cf6', '#ec4899', '#0ea5e9', '#e11d48', '#14b8a6',
];

/* [url-key, display label] */
const PROVIDERS = [
  ['populaires',     'Popular'],
  ['tous',           'All'],
  ['imdb',           'IMDB'],
  ['rottentomatoes', 'Rotten Tomatoes'],
  ['metacritic',     'Metacritic'],
];

/* Valid min-score values per review platform */
const THRESHOLDS = {
  imdb:           [5, 6, 7, 8],
  rottentomatoes: [50, 60, 70, 80],
  metacritic:     [50, 60, 70, 80],
};

/* Inline SVGs — avoids any external icon dependency */
const PROV_ICON = {
  imdb: `<svg width="32" height="16" viewBox="0 0 575 289.83" aria-hidden="true">
    <path d="M575 24.91C573.44 12.15 563.97 1.98 551.91 0C499.05 0 76.18 0 23.32 0C10.11 2.17 0 14.16 0 28.61C0 51.84 0 237.64 0 260.86C0 276.86 12.37 289.83 27.64 289.83C79.63 289.83 495.6 289.83 547.59 289.83C561.65 289.83 573.26 278.82 575 264.57C575 216.64 575 48.87 575 24.91Z" fill="#f6c700"/>
    <path d="M69.35 58.24H114.98V233.89H69.35Z M201.2 139.15C197.28 112.38 195.1 97.5 194.67 94.53C192.76 80.2 190.94 67.73 189.2 57.09H130.04V232.74H170.01L170.15 116.76L186.97 232.74H215.44L231.39 114.18L231.54 232.74H271.38V57.09H211.77L201.2 139.15Z M346.71 93.63C347.21 95.87 347.47 100.95 347.47 108.89V176.99C347.47 188.68 346.71 195.84 345.2 198.48C343.68 201.12 339.64 202.43 333.09 202.43V87.13C338.06 87.13 341.45 87.66 343.25 88.7C345.05 89.75 346.21 91.39 346.71 93.63ZM367.32 230.95C372.75 229.76 377.31 227.66 381.01 224.67C384.7 221.67 387.29 217.52 388.77 212.21C390.26 206.91 391.14 196.38 391.14 180.63V118.95C391.14 102.33 390.49 91.19 389.48 85.53C388.46 79.86 385.93 74.71 381.88 70.09C377.82 65.47 371.9 62.15 364.12 60.13C356.33 58.11 343.63 57.09 321.54 57.09H287.5V232.74H342.78C355.52 232.34 363.7 231.75 367.32 230.95Z M464.76 204.7C463.92 206.93 460.24 208.06 457.46 208.06C454.74 208.06 452.93 206.98 452.01 204.81C451.09 202.65 450.64 197.72 450.64 190V143.58C450.64 135.58 451.04 130.59 451.85 128.6C452.65 126.63 454.41 125.63 457.13 125.63C459.91 125.63 463.64 126.76 464.6 129.03C465.55 131.3 466.03 136.15 466.03 143.58V188.59C465.74 197.84 465.32 203.21 464.76 204.7ZM406.68 231.21H447.76C449.47 224.5 450.41 220.77 450.6 220.02C454.32 224.52 458.41 227.9 462.9 230.14C467.37 232.39 474.06 233.51 479.24 233.51C486.45 233.51 492.67 231.62 497.92 227.83C503.16 224.05 506.5 219.57 507.92 214.42C509.34 209.26 510.05 201.42 510.05 190.88V141.6C510.05 131 509.81 124.08 509.34 120.83C508.87 117.58 507.47 114.27 505.14 110.88C502.81 107.49 499.42 104.86 494.98 102.98C490.54 101.1 485.3 100.16 479.26 100.16C474.01 100.16 467.29 101.21 462.81 103.28C458.34 105.35 454.28 108.49 450.64 112.7V55.56H406.68V231.21Z" fill="#000"/>
  </svg>`,
  rottentomatoes: `<svg width="15" height="15" viewBox="0 0 138.75 141.25" aria-hidden="true">
    <g fill="#f93208">
      <path d="m20.154 40.829c-28.149 27.622-13.657 61.011-5.734 71.931 35.254 41.954 92.792 25.339 111.89-5.9071 4.7608-8.2027 22.554-53.467-23.976-78.009z"/>
      <path d="m39.613 39.265 4.7778-8.8607 28.406-5.0384 11.119 9.2082z"/>
    </g>
    <path d="m39.436 8.5696 8.9682-5.2826 6.7569 15.479c3.7925-6.3226 13.79-16.316 24.939-4.6684-4.7281 1.2636-7.5161 3.8553-7.7397 8.4768 15.145-4.1697 31.343 3.2127 33.539 9.0911-10.951-4.314-27.695 10.377-41.771 2.334 0.009 15.045-12.617 16.636-19.902 17.076 2.077-4.996 5.591-9.994 1.474-14.987-7.618 8.171-13.874 10.668-33.17 4.668 4.876-1.679 14.843-11.39 24.448-11.425-6.775-2.467-12.29-2.087-17.814-1.475 2.917-3.961 12.149-15.197 28.625-8.476z" fill="#02902e"/>
  </svg>`,
  metacritic: `<svg width="15" height="15" viewBox="0 0 40 40" aria-hidden="true">
    <path d="M36.978 19.49a17.49 17.49 0 1 1 0-.021" fill="#000"/>
    <path d="m17.209 32.937 3.41-3.41-6.567-6.567c-.276-.276-.576-.622-.737-1.014-.369-.783-.53-2.004.369-2.903 1.106-1.106 2.58-.645 4.009.784l6.313 6.313 3.41-3.41-6.59-6.59c-.276-.276-.599-.691-.76-1.037-.438-.898-.415-2.027.392-2.834 1.129-1.129 2.603-.714 4.24.922l6.128 6.129 3.41-3.41L27.6 9.274c-3.364-3.364-6.52-3.249-8.686-1.083-.83.83-1.337 1.705-1.59 2.696a6.71 6.71 0 0 0-.092 2.81l-.046.047c-1.66-.691-3.549-.277-5 1.175-1.936 1.935-1.866 3.986-1.636 5.184l-.07.07-1.681-1.36-2.95 2.949c1.037.945 2.282 2.097 3.687 3.502l7.673 7.673Z" fill="#F2F2F2"/>
    <path d="M19.982 0A20 20 0 1 0 40 20v-.024A20 20 0 0 0 19.982 0Zm-.091 4.274A15.665 15.665 0 0 1 35.57 19.921v.018A15.665 15.665 0 1 1 19.89 4.274Z" fill="#FFBD3F"/>
  </svg>`,
};


/* ════════════════════════════════════════════════════════
   STATE
════════════════════════════════════════════════════════ */

const state = {
  theme:     'light',
  provider:  'populaires',
  threshold: 60,
};

/* In-memory fetch cache: url → parsed movie array */
const cache = {};

let movies      = [];
let animateNext = false; /* true → next renderGrid() staggers card entrances */


/* ════════════════════════════════════════════════════════
   THEME TOGGLE
════════════════════════════════════════════════════════ */

const ICON_MOON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
const ICON_SUN  = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`;

const themeBtn = document.getElementById('themeToggle');

function applyTheme() {
  document.documentElement.classList.toggle('dark', state.theme === 'dark');
  themeBtn.innerHTML = state.theme === 'dark' ? ICON_SUN : ICON_MOON;
}

themeBtn.addEventListener('click', () => {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  applyTheme();
});


/* ════════════════════════════════════════════════════════
   FILTER BAR
════════════════════════════════════════════════════════ */

/* "Popular" / "All" — text tabs with animated underline, no border/background */
function chipClasses() {
  return 'h-8 px-1 text-sm inline-flex items-center cursor-pointer whitespace-nowrap bg-transparent border-0 rounded-none';
}

function chipStyle(active) {
  return active
    ? `color:var(--fg);font-weight:700;box-shadow:inset 0 -2px 0 var(--accent);transition:color .25s ease,box-shadow .25s ease`
    : `color:var(--muted);font-weight:400;box-shadow:inset 0 0 0 transparent;transition:color .25s ease,box-shadow .25s ease`;
}

/* Segmented group cell (no outer border-radius, shares a border) */
function cellClasses(active) {
  const base = 'h-8 px-3.5 text-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap border-l';
  return active ? `${base} font-semibold` : base;
}

function cellStyle(active) {
  const border = 'border-color:var(--line)';
  return active
    ? `background:color-mix(in srgb,var(--accent) 16%,transparent);color:var(--accent);${border}`
    : `background:var(--card);color:var(--fg);${border}`;
}

function buildFilterBar() {
  const bar = document.getElementById('filterBar');

  /* "Popular" and "All" — standalone pill chips */
  /* 6px gap between the two tabs, isolated from the outer gap-3 */
  const simplePills = `<div class="flex items-center gap-1.5">${
    PROVIDERS
      .filter(([k]) => k === 'populaires' || k === 'tous')
      .map(([k, label]) => `
        <button class="${chipClasses()}"
                style="${chipStyle(state.provider === k)}"
                data-prov="${k}">${label}</button>
      `).join('')
  }</div>`;

  /* IMDB / RT / Metacritic — grouped in a segmented control */
  const platformCells = PROVIDERS
    .filter(([k]) => ['imdb', 'rottentomatoes', 'metacritic'].includes(k))
    .map(([k, label], i) => `
      <button class="${cellClasses(state.provider === k)} ${i === 0 ? 'border-l-0' : ''}"
              style="${cellStyle(state.provider === k)}"
              title="${label}" data-prov="${k}">
        ${PROV_ICON[k] || ''}
        <span class="hidden md:inline">${label}</span>
      </button>
    `).join('');

  /* Threshold slider — only shown for platforms that have a score */
  const threshDef  = THRESHOLDS[state.provider];
  const threshHtml = threshDef ? buildThresholdHtml(threshDef) : '';

  /* Vertical divider — the one before the slider is hidden at ≤480px */
  const div      = `<span class="w-px h-5 shrink-0" style="background:var(--line)"></span>`;
  const divThresh = `<span class="w-px h-5 shrink-0 max-xs:hidden" style="background:var(--line)"></span>`;

  bar.innerHTML = `
    <div class="flex flex-wrap items-center gap-3">
      ${simplePills}
      ${div}
      <div class="inline-flex items-stretch border rounded-[10px] overflow-hidden"
           style="border-color:var(--line)">
        ${platformCells}
      </div>
      ${threshHtml ? `
        ${divThresh}
        <div class="max-xs:w-full">${threshHtml}</div>
      ` : ''}
    </div>
    <span id="loadState" class="ml-auto text-xs" style="color:var(--muted)"></span>
  `;

  bar.querySelectorAll('[data-prov]').forEach(btn =>
    btn.addEventListener('click', () => selectProvider(btn.dataset.prov))
  );

  if (threshDef) wireThreshold(bar, threshDef);
}

function buildThresholdHtml(threshDef) {
  const min  = threshDef[0];
  const max  = threshDef[threshDef.length - 1];
  const step = threshDef[1] - threshDef[0];
  const pct  = ((state.threshold - min) / (max - min)) * 100;
  const fill = `background:linear-gradient(90deg,var(--accent) ${pct}%,var(--line) ${pct}%)`;

  const ticks = threshDef.map(v => `
    <button class="text-[11px] p-0 bg-transparent border-0 cursor-pointer transition-colors
                   tabular-nums ${state.threshold === v ? 'font-bold' : ''}"
            style="color:${state.threshold === v ? 'var(--accent)' : 'var(--muted)'}"
            data-th="${v}">${v}</button>
  `).join('');

  return `
    <div class="flex flex-col gap-1" style="width:160px">
      <span class="text-[11px]" style="color:var(--muted)">min score</span>
      <input type="range" id="thrRange"
             min="${min}" max="${max}" step="${step}" value="${state.threshold}"
             class="w-full" style="${fill}">
      <div class="flex justify-between px-px">${ticks}</div>
    </div>
  `;
}

function wireThreshold(scope, threshDef) {
  const min = threshDef[0];
  const max = threshDef[threshDef.length - 1];

  /* Tick buttons snap to a discrete value */
  scope.querySelectorAll('[data-th]').forEach(btn =>
    btn.addEventListener('click', () => setThreshold(+btn.dataset.th))
  );

  /* Range: update fill while dragging, fetch on release */
  const range = scope.querySelector('#thrRange');
  if (!range) return;

  range.addEventListener('input', () => {
    const pct = ((range.value - min) / (max - min)) * 100;
    range.style.background = `linear-gradient(90deg,var(--accent) ${pct}%,var(--line) ${pct}%)`;
    scope.querySelectorAll('[data-th]').forEach(t =>
      Object.assign(t.style, {
        color:      +t.dataset.th === +range.value ? 'var(--accent)' : 'var(--muted)',
        fontWeight: +t.dataset.th === +range.value ? '700' : '',
      })
    );
  });

  range.addEventListener('change', () => setThreshold(+range.value));
}

function setThreshold(v) {
  if (v === state.threshold) return;
  state.threshold = v;
  buildFilterBar();
  fetchAndRender();
}

function selectProvider(key) {
  if (key === state.provider) { fetchAndRender(); return; }
  state.provider = key;
  /* Reset to a sensible default when switching platforms */
  const t = THRESHOLDS[key];
  if (t) state.threshold = key === 'imdb' ? 6 : 60;
  buildFilterBar();
  fetchAndRender();
}


/* ════════════════════════════════════════════════════════
   DATA FETCHING
════════════════════════════════════════════════════════ */

function endpointUrl() {
  if (state.provider === 'populaires') return `${BASE}movies.json`;
  if (state.provider === 'tous')       return `${BASE}all-movies.json`;
  return `${BASE}movies-${state.provider}-min${state.threshold}.json`;
}

async function fetchAndRender() {
  const url = endpointUrl();
  document.getElementById('jsonLink').href = url;

  const loadState = document.getElementById('loadState');

  /* Serve from memory cache to avoid redundant network calls */
  if (cache[url]) {
    movies = cache[url];
    animateNext = true;
    renderGrid();
    return;
  }

  if (loadState) loadState.textContent = 'Loading…';

  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Network error');

    const raw = await res.json();
    const parsed = raw
      .map(m => ({
        title:      m.title,
        imdb_id:    m.imdb_id || null,
        /* normalise http → https to avoid mixed-content blocks */
        poster_url: (m.poster_url || m.poster || '').replace(/^http:\/\//, 'https://') || null,
      }))
      .filter(m => m.title);

    if (!parsed.length) throw new Error('Empty response');
    cache[url] = parsed;
    movies     = parsed;
    if (loadState) loadState.textContent = '';
  } catch {
    movies = [];
    if (loadState) loadState.textContent = 'Source unavailable';
  }

  animateNext = true;
  renderGrid();
}


/* ════════════════════════════════════════════════════════
   GRID RENDERING
════════════════════════════════════════════════════════ */

/* Minimal HTML escaping for strings inserted into innerHTML */
function esc(s) {
  return (s || '').replace(/[&<>"]/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])
  );
}

function renderGrid() {
  const grid  = document.getElementById('grid');
  const empty = document.getElementById('emptyNote');

  if (!movies.length) {
    grid.innerHTML    = '';
    empty.textContent = state.provider === 'populaires'
      ? 'No movies to display.'
      : 'No movies for this source — try another threshold.';
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');

  grid.innerHTML = movies.map((m, i) => {
    /* Diagonal stripe placeholder when no poster is available */
    const imgHtml = m.poster_url
      ? `<img loading="lazy" src="${esc(m.poster_url)}" alt="${esc(m.title)}"
              class="w-full h-full object-cover block"
              onerror="this.style.display='none';this.parentElement.classList.add('stripe')">`
      : `<div class="stripe absolute inset-0 flex items-center justify-center p-3 text-center">
           <span class="text-[11px] uppercase tracking-widest font-medium"
                 style="color:var(--muted)">${esc(m.title)}</span>
         </div>`;

    /* Stagger entrance delays, capped at 520 ms for large grids */
    const delay = animateNext ? `animation-delay:${Math.min(i * 28, 520)}ms` : '';

    return `
      <a href="${m.imdb_id ? `https://www.imdb.com/title/${m.imdb_id}/` : `https://www.imdb.com/find/?q=${encodeURIComponent(m.title)}`}"
         target="_blank" rel="noopener"
         class="block ${animateNext ? 'anim' : ''}"
         style="${delay}">
        <div class="poster relative rounded-[var(--radius)] overflow-hidden"
             style="aspect-ratio:2/3;background:var(--card)">
          ${imgHtml}
          <div class="overlay">
            <span class="text-white text-[13px] font-semibold leading-tight">
              ${esc(m.title)}
            </span>
          </div>
        </div>
      </a>
    `;
  }).join('');

  animateNext = false;
}

/* Re-trigger card entrances when the user returns to a hidden tab
   (CSS animations are paused while a tab is not visible) */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) return;
  document.querySelectorAll('#grid a').forEach((el, i) => {
    el.classList.remove('anim');
    void el.offsetWidth; /* force reflow so animation restarts */
    el.style.animationDelay = `${Math.min(i * 28, 520)}ms`;
    el.classList.add('anim');
  });
});


/* ════════════════════════════════════════════════════════
   BOOT
════════════════════════════════════════════════════════ */

/* Random accent colour on every page load */
document.documentElement.style.setProperty(
  '--accent', ACCENTS[Math.floor(Math.random() * ACCENTS.length)]
);

applyTheme();
buildFilterBar();
fetchAndRender();
