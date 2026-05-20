// assets/main.js
(function () {
  const STORAGE_KEY = "rafaz_theme";

  function getPreferredTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "dark" || saved === "light") return saved;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
    const btn = document.querySelector("[data-theme-toggle]");
    if (btn) {
      btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      btn.textContent = theme === "dark" ? "theme: dark" : "theme: light";
    }
    const themeText = document.querySelector("[data-status-theme]");
    if (themeText) themeText.textContent = theme;
  }

  function initThemeEarly() {
    // avoid flash by setting ASAP
    setTheme(getPreferredTheme());
  }

  function initToggle() {
    const btn = document.querySelector("[data-theme-toggle]");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "dark";
      setTheme(current === "dark" ? "light" : "dark");
    });
  }

  function initActiveNav() {
    const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    document.querySelectorAll("[data-nav]").forEach((a) => {
      const href = (a.getAttribute("href") || "").toLowerCase();
      if (href === path) a.classList.add("active");
      if (path === "" && href === "index.html") a.classList.add("active");
    });
  }

  function initStatusbar() {
    const now = new Date();
    const last = document.querySelector("[data-status-last]");
    if (last) {
      // YYYY-MM-DD
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");
      last.textContent = `${yyyy}-${mm}-${dd}`;
    }
    const tz = document.querySelector("[data-status-tz]");
    if (tz) tz.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone || "local";
  }

  // Run
  initThemeEarly();
  window.addEventListener("DOMContentLoaded", () => {
    initToggle();
    initActiveNav();
    initStatusbar();
  });
})();

/* =========================================================
 *  Resume PDF Export (open-cv.json -> pdfmake)
 *  Schema: profile / experience / skills (5 buckets) / languages
 *  - 5 experiências mais recentes
 *  - Education com fallback hardcoded (IFSP) se JSON vier vazio
 *  - Avatar via Gravatar (graceful fallback se indisponível)
 * ========================================================= */
(function () {
  const BLUE  = '#3E9BCD';
  const DARK  = '#1f1f1f';
  const MUTED = '#6b6b6b';
  const CHIP  = '#999999';

  // Fallback hardcoded — usado APENAS se cv.education vier vazio
  const EDU_FALLBACK = [{
    studyType:   'Information Technology',
    institution: 'Instituto Federal de Educação, Ciência e Tecnologia de São Paulo',
    startDate:   '2014-01',
    endDate:     '2017-12',
    location:    'São Paulo, Brazil'
  }];

  const SKILL_LABELS = {
    languages:    'Languages',
    platforms:    'Platforms',
    architecture: 'Architecture',
    tools:        'Tools',
    practices:    'Practices'
  };

  const LANG_LEVEL_MAP = {
    'native': 5,
    'fluent': 5,
    'full professional': 4,
    'proficient': 4,
    'professional working': 3,
    'limited working': 2,
    'elementary': 1
  };

  const ICONS = {
    phone: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${BLUE}" d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A18 18 0 0 1 3 3a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.24.2 2.45.57 3.57a1 1 0 0 1-.24 1.02l-2.21 2.2z"/></svg>',
    email: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${BLUE}" d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 4v10h16V8l-8 5-8-5z"/></svg>',
    link:  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" stroke="${BLUE}" stroke-width="2" stroke-linecap="round" d="M10.6 13.4a3 3 0 0 0 4.24 0l3-3a3 3 0 0 0-4.24-4.24l-1.5 1.5M13.4 10.6a3 3 0 0 0-4.24 0l-3 3a3 3 0 0 0 4.24 4.24l1.5-1.5"/></svg>',
    pin:   '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${BLUE}" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>'
  };

  const btns = document.querySelectorAll('[data-export-resume]');
  if (!btns.length) return;

  btns.forEach(btn => btn.addEventListener('click', async (e) => {
    const b = e.currentTarget;
    const originalText = b.textContent;
    if (typeof pdfMake === 'undefined') {
      b.textContent = 'pdfmake not loaded';
      setTimeout(() => { b.textContent = originalText; }, 2000);
      return;
    }
    try {
      b.disabled = true;
      b.textContent = 'building...';
      const cv = await fetchCv();
      const avatar = await resolveAvatar(cv);
      const docDef = buildResumeDocDef(cv, avatar);
      const filename = `${(cv.profile?.name || 'resume').replace(/\s+/g, '_')}_Resume.pdf`;
      pdfMake.createPdf(docDef).download(filename, () => {
        b.textContent = 'done ✓';
        setTimeout(() => { b.textContent = originalText; b.disabled = false; }, 2000);
      });
    } catch (err) {
      console.error('[resume-pdf]', err);
      b.textContent = 'failed — check console';
      setTimeout(() => { b.textContent = originalText; b.disabled = false; }, 2500);
    }
  }));

  async function fetchCv() {
    const res = await fetch('open-cv.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`open-cv.json HTTP ${res.status}`);
    return res.json();
  }

  async function resolveAvatar(cv) {
    const email    = cv.profile?.links?.email;
    const fallback = cv.profile?.avatar;

    // 1ª tentativa: Gravatar via hash SHA-256 do email
    if (email && window.crypto?.subtle) {
      try {
        const buf  = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(email.trim().toLowerCase()));
        const hash = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
        const url  = `https://gravatar.com/avatar/${hash}?s=200&d=404`;
        const img  = await tryFetchAvatar(url);
        if (img) return img;
      } catch (e) {
        console.warn('[avatar] gravatar lookup failed', e.message);
      }
    }

    // 2ª tentativa: profile.avatar do JSON (GitHub avatar URL, p.ex.)
    if (fallback) {
      const img = await tryFetchAvatar(fallback);
      if (img) return img;
    }
    return null;
  }

  /* ---------- avatar (Gravatar + circular mask) ---------- */

  async function tryFetchAvatar(url) {
    try {
      const res = await fetch(url, { mode: 'cors' });
      if (!res.ok) return null;
      const blob = await res.blob();
      if (!blob.type.startsWith('image/')) {
        console.warn('[avatar] response is not an image (got', blob.type, ')');
        return null;
      }
      const raw = await blobToDataUrl(blob);
      return await makeCircularImage(raw, 200);
    } catch (e) {
      console.warn('[avatar fetch failed]', e.message);
      return null;
    }
  }

  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload  = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
  }

  function makeCircularImage(dataUrl, size) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        // cover-fit (centered crop)
        const ratio = Math.max(size / img.width, size / img.height);
        const w = img.width * ratio;
        const h = img.height * ratio;
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = dataUrl;
    });
  }

  /* ---------- helpers ---------- */

  function fmtDate(iso) {
    if (!iso) return 'Ongoing';
    const [y, m] = String(iso).split('-');
    return m ? `${m}/${y}` : y;
  }

  function sectionTitle(text) {
    return {
      margin: [0, 10, 0, 5],
      table: {
        widths: ['*'],
        body: [[{ text: text.toUpperCase(), fontSize: 11, bold: true, color: DARK }]]
      },
      layout: {
        hLineWidth: (i) => (i === 1 ? 1 : 0),
        vLineWidth: () => 0,
        hLineColor: () => '#000000',
        paddingLeft: () => 0, paddingRight: () => 0,
        paddingTop: () => 0,  paddingBottom: () => 2
      }
    };
  }

  function workBlock(job, isLast) {
    const stack = [
      { text: job.role || '',    fontSize: 9.5, bold: true, color: DARK },
      { text: job.company || '', fontSize: 9,   bold: true, color: BLUE, margin: [0, 1, 0, 1] },
      {
        text: `${fmtDate(job.startDate)} - ${fmtDate(job.endDate)}     ${job.location || ''}`,
        fontSize: 7.5, color: MUTED, margin: [0, 0, 0, 2]
      }
    ];
    if (job.companyDescription) {
      stack.push({ text: job.companyDescription, fontSize: 7.5, color: '#444', margin: [0, 0, 0, 2], lineHeight: 1.1 });
    }
    if (Array.isArray(job.highlights) && job.highlights.length) {
      stack.push({
        ul: job.highlights.map(h => ({ text: h, fontSize: 7.5, color: '#222', lineHeight: 1.1 })),
        margin: [0, 1, 0, 0]
      });
    }
    return { stack, margin: [0, 0, 0, isLast ? 0 : 4] };
  }

  function educationBlock(edu) {
    return {
      stack: [
        { text: edu.studyType || edu.area || '', fontSize: 9.5, bold: true, color: DARK },
        { text: edu.institution || '', fontSize: 9, bold: true, color: BLUE, margin: [0, 1, 0, 1] },
        {
          text: `${fmtDate(edu.startDate)} - ${fmtDate(edu.endDate)}     ${edu.location || ''}`,
          fontSize: 7.5, color: MUTED
        }
      ],
      margin: [0, 0, 0, 6]
    };
  }

  function chipsTable(chips) {
    const TARGET_W   = 170;  // largura da coluna direita (~ ajuste se mudar layout)
    const H_GAP      = 5;
    const V_GAP      = 4;
    const CHAR_W     = 4.6;  // aproximação Roboto Bold 7.5pt
    const CHIP_EXTRA = 12;   // padding L+R + border

    const estimate = (t) => Math.ceil(t.length * CHAR_W + CHIP_EXTRA);

    // greedy packing
    const rows = [];
    let row = [], used = 0;
    chips.forEach(chip => {
      const w = estimate(chip);
      const cost = row.length === 0 ? w : H_GAP + w;
      if (used + cost > TARGET_W && row.length > 0) {
        rows.push(row);
        row = [chip]; used = w;
      } else {
        row.push(chip); used += cost;
      }
    });
    if (row.length) rows.push(row);

    return {
      stack: rows.map(rowChips => ({
        columns: rowChips
          .flatMap((c, i) => i === 0 ? [chipCell(c)] : [{ width: H_GAP, text: '' }, chipCell(c)])
          .concat([{ width: '*', text: '' }]),  // empurra chips pra esquerda
        margin: [0, 0, 0, V_GAP]
      }))
    };
  }

  function chipCell(text) {
    return {
      width: 'auto',
      table: {
        widths: ['auto'],
        body: [[{ text, fontSize: 7.5, bold: true, alignment: 'center', color: DARK }]]
      },
      layout: {
        hLineWidth: () => 1,
        vLineWidth: () => 1,
        hLineColor: () => CHIP,
        vLineColor: () => CHIP,
        paddingTop:    () => 3,
        paddingBottom: () => 3,
        paddingLeft:   () => 5,
        paddingRight:  () => 5
      }
    };
  }

  function skillsSection(skills) {
    if (!skills || typeof skills !== 'object') return [];
    const blocks = [];
    Object.keys(skills).forEach(key => {
      const chips = skills[key];
      if (!Array.isArray(chips) || !chips.length) return;
      blocks.push({
        stack: [
          { text: SKILL_LABELS[key] || key, fontSize: 10, bold: true, color: BLUE, margin: [0, 4, 0, 6] },
          chipsTable(chips)
        ],
        margin: [0, 0, 0, 8]
      });
    });
    return blocks;
  }

  function languageBlock(lang) {
    const key = String(lang.level || '').toLowerCase();
    const lvl = LANG_LEVEL_MAP[key] || 3;
    return {
      columns: [
        {
          width: '*',
          stack: [
            { text: lang.language || '', fontSize: 10, bold: true, color: DARK },
            { text: lang.level || '',    fontSize: 9, color: MUTED }
          ]
        },
        { width: 'auto', stack: [dotsCanvas(lvl)], alignment: 'right', margin: [0, 9, 0, 0] }
      ],
      margin: [0, 4, 0, 8]
    };
  }

  function dotsCanvas(lvl, total = 5) {
    const r = 2.5;     // raio do dot
    const gap = 3;     // espaço entre dots
    const elems = [];
    for (let i = 0; i < total; i++) {
      const filled = i < lvl;
      elems.push({
        type: 'ellipse',
        x: i * (r * 2 + gap) + r,
        y: r,
        r1: r, r2: r,
        color: filled ? BLUE : '#ffffff',
        lineColor: BLUE,
        lineWidth: 0.8
      });
    }
    return { canvas: elems };
  }

  /* ---------- doc definition ---------- */

  function buildResumeDocDef(cv, avatarDataUrl) {
    const p = cv.profile || {};
    const links = p.links || {};
    const recentWork = (cv.experience || []).slice(0, 5);
    const eduSource = (Array.isArray(cv.education) && cv.education.length)
      ? cv.education
      : EDU_FALLBACK;

    const linkedinShort = links.linkedin ? links.linkedin.replace(/^https?:\/\//, '') : '';

    const headerText = {
      width: '*',
      stack: [
        { text: (p.name || '').toUpperCase(), fontSize: 24, bold: true, color: DARK },
        { text: p.title || '', fontSize: 12, bold: true, color: BLUE, margin: [0, 2, 0, 8] },
        {
          columns: [
            iconText(ICONS.phone, p.phone),
            iconText(ICONS.email, links.email)
          ]
        },
        {
          columns: [
            iconText(ICONS.link, linkedinShort),
            iconText(ICONS.pin,  p.location)
          ],
          margin: [0, 3, 0, 0]
        }
      ]
    };

    const headerCols = [headerText];
    if (avatarDataUrl) {
      headerCols.push({
        width: 80,
        image: avatarDataUrl,
        fit: [72, 72],
        alignment: 'right'
      });
    }

    const header = { columns: headerCols, margin: [0, 0, 0, 14] };

    const body = {
      columns: [
        {
          width: '63%',
          stack: [
            sectionTitle('Experience'),
            { text: 'Showing 5 most recent · full history at rafaz.dev/carreira', fontSize: 7, italics: true, color: MUTED, margin: [0, -2, 0, 4] },
            ...recentWork.map((j, i) => workBlock(j, i === recentWork.length - 1))
          ]
        },
        { width: 18, text: '' },
        {
          width: '*',
          stack: [
            sectionTitle('Education'),
            ...eduSource.map(educationBlock),
            sectionTitle('Skills'),
            ...skillsSection(cv.skills),
            sectionTitle('Languages'),
            ...(cv.languages || []).map(languageBlock)
          ]
        }
      ]
    };

    return {
      pageSize: 'A4',
      pageMargins: [32, 32, 32, 32],
      content: [header, body],
      defaultStyle: { font: 'Roboto', color: DARK }
    };
  }

  function iconText(svg, text) {
    return {
      width: '*',
      columns: [
        { width: 11, svg, fit: [9, 9], margin: [0, 1, 0, 0] },
        { width: '*', text: text || '', fontSize: 9, color: DARK, margin: [4, 0, 0, 0] }
      ]
    };
  }
})();