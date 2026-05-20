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

  const GRAVATAR_URL = 'https://gravatar.com/rafaz182';

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

  const btn = document.getElementById('exportResumeBtn');
  const status = document.getElementById('exportResumeStatus');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    if (typeof pdfMake === 'undefined') { setStatus('pdfmake not loaded'); return; }
    try {
      setStatus('building...');
      btn.disabled = true;
      const cv = await fetchCv();
      const avatar = await tryFetchAvatar(GRAVATAR_URL);
      const docDef = buildResumeDocDef(cv, avatar);
      const filename = `${(cv.profile?.name || 'resume').replace(/\s+/g, '_')}_Resume.pdf`;
      pdfMake.createPdf(docDef).download(filename, () => {
        setStatus('done ✓');
        btn.disabled = false;
        setTimeout(() => setStatus(''), 2500);
      });
    } catch (err) {
      console.error('[resume-pdf]', err);
      setStatus('failed — check console');
      btn.disabled = false;
    }
  });

  function setStatus(msg) { if (status) status.textContent = msg; }

  async function fetchCv() {
    const res = await fetch('open-cv.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`open-cv.json HTTP ${res.status}`);
    return res.json();
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
      stack.push({ text: job.companyDescription, fontSize: 8, color: '#444', margin: [0, 0, 0, 2] });
    }
    if (Array.isArray(job.highlights) && job.highlights.length) {
      stack.push({
        ul: job.highlights.map(h => ({ text: h, fontSize: 8, color: '#222', lineHeight: 1.15 })),
        margin: [0, 1, 0, 0]
      });
    }
    return { stack, margin: [0, 0, 0, isLast ? 0 : 6] };
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
    const H_GAP = 5; // espaçamento horizontal entre chips
    const V_GAP = 4; // espaçamento vertical entre linhas
    const rows = [];
    for (let i = 0; i < chips.length; i += 2) {
      const a = chips[i];
      const b = chips[i + 1];
      rows.push({
        columns: [
          chipCell(a),
          { width: H_GAP, text: '' },
          b ? chipCell(b) : { width: '*', text: '' }
        ],
        margin: [0, 0, 0, V_GAP]
      });
    }
    return { stack: rows };
  }

  function chipCell(text) {
    return {
      width: '*',
      table: {
        widths: ['*'],
        body: [[{ text, fontSize: 7.5, alignment: 'center', color: DARK }]]
      },
      layout: {
        hLineWidth: () => 1,
        vLineWidth: () => 1,
        hLineColor: () => CHIP,
        vLineColor: () => CHIP,
        paddingTop:    () => 3,
        paddingBottom: () => 3,
        paddingLeft:   () => 4,
        paddingRight:  () => 4
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
    const dots = '●'.repeat(lvl) + '○'.repeat(5 - lvl);
    return {
      columns: [
        {
          width: '*',
          stack: [
            { text: lang.language || '', fontSize: 10, bold: true, color: DARK },
            { text: lang.level || '',    fontSize: 9, color: MUTED }
          ]
        },
        { width: 'auto', text: dots, fontSize: 10, color: BLUE, alignment: 'right', margin: [0, 4, 0, 0] }
      ],
      margin: [0, 4, 0, 8]
    };
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
            { text: p.phone || '',     fontSize: 9, color: DARK },
            { text: links.email || '', fontSize: 9, color: DARK }
          ]
        },
        {
          columns: [
            { text: linkedinShort,    fontSize: 9, color: DARK },
            { text: p.location || '', fontSize: 9, color: DARK }
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
      pageMargins: [40, 40, 40, 40],
      content: [header, body],
      defaultStyle: { font: 'Roboto', color: DARK }
    };
  }
})();