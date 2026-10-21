/* ═══════════════════════════════════════════════════════
   SELENA // PIANISSIMO — PGR ARCHIVE INTERACTIONS v2
   ═══════════════════════════════════════════════════════ */
'use strict';

/* ─── BOOT SEQUENCE ─── */
(function bootSequence() {
  const overlay = document.getElementById('boot-overlay');
  const fill = document.getElementById('boot-fill');
  const log = document.getElementById('boot-log');
  const logs = [
    '> loading kernel...',
    '> mounting /selena...',
    '> decrypting biodata...',
    '> syncing M.I.N.D. ...',
    '> loading voice bank...',
    '> resyncing frame data...',
    '> ready.'
  ];
  let i = 0;
  const iv = setInterval(() => {
    if (i < logs.length) {
      log.textContent = logs[i];
      fill.style.width = ((i + 1) / logs.length * 100) + '%';
      i++;
    } else {
      clearInterval(iv);
      setTimeout(() => overlay.classList.add('hidden'), 400);
    }
  }, 280);
})();

/* ─── WEB AUDIO ENGINE (synthesized SFX) ─── */
const Audio = (() => {
  let ctx = null;
  let enabled = true;
  const ensure = () => {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
  };
  const tone = (freq, dur = 0.12, type = 'sine', gain = 0.06) => {
    if (!enabled) return;
    ensure(); if (!ctx) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(gain, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.connect(g); g.connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + dur);
  };
  const chord = (freqs, dur = 0.4) => {
    if (!enabled) return;
    freqs.forEach((f, i) => setTimeout(() => tone(f, dur, 'sine', 0.05), i * 40));
  };
  return {
    tone, chord,
    hover: () => tone(1200, 0.04, 'sine', 0.02),
    click: () => tone(660, 0.08, 'square', 0.03),
    success: () => chord([523.25, 659.25, 783.99]),
    toggle: () => { enabled = !enabled; return enabled; },
    get enabled() { return enabled; },
    ensure
  };
})();

/* ─── CUSTOM CURSOR ─── */
(function cursorFX() {
  const glow = document.getElementById('cursor-glow');
  const dot = document.getElementById('cursor-dot');
  let mx = 0, my = 0, gx = 0, gy = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  document.addEventListener('mouseover', e => {
    if (e.target.closest('a,button,.gallery-item,.frame-tab,.voiceline-card,.gf-btn,.data-card')) {
      document.body.classList.add('cursor-hover');
    } else {
      document.body.classList.remove('cursor-hover');
    }
  });
  (function loop() {
    gx += (mx - gx) * 0.15; gy += (my - gy) * 0.15;
    glow.style.left = gx + 'px'; glow.style.top = gy + 'px';
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    requestAnimationFrame(loop);
  })();
})();

/* ─── HOVER SFX GLOBAL ─── */
document.addEventListener('mouseover', e => {
  if (e.target.closest('a,button,.gallery-item,.frame-tab,.voiceline-card,.gf-btn')) {
    Audio.hover();
  }
});

/* ─── PARTICLES ─── */
(function particles() {
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');
  let w, h, parts = [];
  const glyphs = ['♪', '♫', '◆', '◇', '✦', '◈', '♬', '✧'];
  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  class P {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.vx = (Math.random() - 0.5) * 0.25;
      this.vy = (Math.random() - 0.5) * 0.25 - 0.1;
      this.size = Math.random() * 14 + 6;
      this.alpha = Math.random() * 0.35 + 0.1;
      this.glyph = glyphs[Math.floor(Math.random() * glyphs.length)];
      this.rot = Math.random() * Math.PI * 2;
      this.vrot = (Math.random() - 0.5) * 0.02;
    }
    update() {
      this.x += this.vx; this.y += this.vy; this.rot += this.vrot;
      if (this.x < -20 || this.x > w + 20 || this.y < -20 || this.y > h + 20) this.reset();
    }
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);
      ctx.fillStyle = `rgba(110, 231, 255, ${this.alpha})`;
      ctx.font = `${this.size}px 'Orbitron', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.glyph, 0, 0);
      ctx.restore();
    }
  }
  function init() {
    resize();
    const count = Math.min(60, Math.floor(w / 25));
    parts = Array.from({ length: count }, () => new P());
    loop();
  }
  function loop() {
    ctx.clearRect(0, 0, w, h);
    parts.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }
  window.addEventListener('resize', resize);
  init();
})();

/* ─── NAV SCROLL SPY + SCROLLED STATE ─── */
(function navSpy() {
  const nav = document.getElementById('main-nav');
  const links = document.querySelectorAll('.nav-link');
  const sections = [...links].map(l => document.getElementById(l.dataset.section)).filter(Boolean);
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
    let current = sections[0];
    sections.forEach(s => {
      if (s && s.getBoundingClientRect().top < window.innerHeight * 0.4) current = s;
    });
    links.forEach(l => l.classList.toggle('active', l.dataset.section === current?.id));
    // scroll progress
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    document.getElementById('scroll-fill').style.width = (window.scrollY / docH * 100) + '%';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ─── REVEAL ON SCROLL ─── */
(function reveal() {
  const els = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.12 });
  els.forEach(el => io.observe(el));
})();

/* ─── HERO TYPING EFFECT ─── */
(function typing() {
  const target = document.getElementById('typing-text');
  const lines = [
    'The softest voice. The unbroken melody.',
    'Transcendant of the Red Tide.',
    'Iris of the shattered world.',
    'Pianissimo — and yet, unyielding.',
    'Heir to the hall of art.'
  ];
  let lineIdx = 0, charIdx = 0, deleting = false;
  function tick() {
    const line = lines[lineIdx];
    target.textContent = line.slice(0, charIdx);
    if (!deleting && charIdx < line.length) {
      charIdx++; setTimeout(tick, 55);
    } else if (!deleting && charIdx === line.length) {
      deleting = true; setTimeout(tick, 1800);
    } else if (deleting && charIdx > 0) {
      charIdx--; setTimeout(tick, 25);
    } else {
      deleting = false; lineIdx = (lineIdx + 1) % lines.length;
      setTimeout(tick, 250);
    }
  }
  tick();
})();

/* ─── COUNT-UP STATS ─── */
(function countUp() {
  const nums = document.querySelectorAll('.qs-num');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = +el.dataset.count;
      const dur = 1400;
      const start = performance.now();
      function step(now) {
        const t = Math.min((now - start) / dur, 1);
        el.textContent = Math.floor(t * target);
        if (t < 1) requestAnimationFrame(step);
        else el.textContent = target;
      }
      requestAnimationFrame(step);
      io.unobserve(el);
    });
  }, { threshold: 0.6 });
  nums.forEach(n => io.observe(n));
})();

/* ─── DATA CARD MOUSE GLOW ─── */
document.querySelectorAll('.data-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
    card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
  });
});

/* ─── FRAME TABS ─── */
(function frameTabs() {
  const tabs = document.querySelectorAll('.frame-tab');
  const panels = document.querySelectorAll('.frame-panel');
  tabs.forEach(tab => tab.addEventListener('click', () => {
    Audio.click();
    tabs.forEach(t => t.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('frame-' + tab.dataset.frame).classList.add('active');
  }));
})();

/* ─── VOICELINE PLAYER ─── */
(function voiceLines() {
  const cards = document.querySelectorAll('.voiceline-card');
  const display = document.getElementById('vld-text');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      Audio.ensure();
      cards.forEach(c => c.classList.remove('playing'));
      card.classList.add('playing');
      const freq = parseFloat(card.dataset.freq);
      // Play a small musical phrase
      Audio.chord([freq, freq * 1.25, freq * 1.5], 0.6);
      display.textContent = '“' + card.dataset.line + '”';
      // auto-stop wave after 2s
      setTimeout(() => card.classList.remove('playing'), 2200);
    });
  });
})();

/* ─── QUOTE CHIME ─── */
document.getElementById('play-quote-sfx')?.addEventListener('click', () => {
  Audio.ensure();
  Audio.chord([587.33, 739.99, 880.00, 1174.66], 0.8);
});

/* ─── THEME MUSIC VISUALIZER ─── */
(function themePlayer() {
  const btn = document.getElementById('theme-play');
  const viz = document.getElementById('theme-visualizer');
  const icon = document.getElementById('theme-play-icon');
  const label = document.getElementById('theme-play-label');
  let playing = false;
  let loopId = null;
  function playTheme() {
    Audio.ensure();
    // Simple recurring motif — D minor arpeggio-ish
    const motif = [293.66, 349.23, 440.00, 587.33, 440.00, 349.23];
    let i = 0;
    loopId = setInterval(() => {
      Audio.tone(motif[i % motif.length], 0.5, 'sine', 0.04);
      i++;
    }, 400);
  }
  btn.addEventListener('click', () => {
    playing = !playing;
    if (playing) {
      viz.classList.add('active');
      icon.textContent = '❚❚';
      label.textContent = 'PAUSE THEME';
      playTheme();
    } else {
      viz.classList.remove('active');
      icon.textContent = '▶';
      label.textContent = 'PLAY THEME';
      clearInterval(loopId);
    }
  });
})();

/* ─── GALLERY FILTER + LIGHTBOX ─── */
(function gallery() {
  const items = document.querySelectorAll('.gallery-item');
  const filters = document.querySelectorAll('.gf-btn');
  const lightbox = document.getElementById('lightbox');
  const media = document.getElementById('lightbox-media');
  const caption = document.getElementById('lightbox-caption');
  let visibleItems = [...items];
  let currentIdx = 0;

  filters.forEach(f => f.addEventListener('click', () => {
    Audio.click();
    filters.forEach(x => x.classList.remove('active'));
    f.classList.add('active');
    const cat = f.dataset.filter;
    items.forEach(it => {
      const match = cat === 'all' || it.dataset.cat === cat;
      it.classList.toggle('hidden', !match);
    });
    visibleItems = [...items].filter(it => !it.classList.contains('hidden'));
  }));

  items.forEach(it => it.addEventListener('click', () => {
    Audio.success();
    visibleItems = [...items].filter(x => !x.classList.contains('hidden'));
    currentIdx = visibleItems.indexOf(it);
    openLightbox(it);
  }));

  function openLightbox(item) {
    const clone = item.querySelector('.gallery-placeholder').cloneNode(true);
    media.innerHTML = '';
    media.appendChild(clone);
    caption.textContent = item.dataset.caption || '';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
  }
  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
  }
  document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') { currentIdx = (currentIdx + 1) % visibleItems.length; openLightbox(visibleItems[currentIdx]); }
    if (e.key === 'ArrowLeft') { currentIdx = (currentIdx - 1 + visibleItems.length) % visibleItems.length; openLightbox(visibleItems[currentIdx]); }
  });
  document.getElementById('lightbox-next').addEventListener('click', () => {
    currentIdx = (currentIdx + 1) % visibleItems.length; openLightbox(visibleItems[currentIdx]);
  });
  document.getElementById('lightbox-prev').addEventListener('click', () => {
    currentIdx = (currentIdx - 1 + visibleItems.length) % visibleItems.length; openLightbox(visibleItems[currentIdx]);
  });
})();

/* ─── THEME COLOR TOGGLE ─── */
(function themeToggle() {
  const themes = ['', 'rose', 'gold', 'lime'];
  let idx = 0;
  const btn = document.getElementById('theme-toggle');
  const toast = document.getElementById('toast');
  btn.addEventListener('click', () => {
    Audio.tone(880, 0.1, 'triangle', 0.05);
    idx = (idx + 1) % themes.length;
    document.body.dataset.theme = themes[idx];
    showToast('THEME: ' + (themes[idx] || 'ICE').toUpperCase());
  });
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('show'), 1800);
  }
  window.showToast = showToast;
})();

/* ─── AUDIO TOGGLE ─── */
(function audioToggle() {
  const btn = document.getElementById('audio-toggle');
  const icon = document.getElementById('audio-icon');
  btn.addEventListener('click', () => {
    const on = Audio.toggle();
    icon.textContent = on ? '♪' : '✕';
    btn.classList.toggle('muted', !on);
    if (on) Audio.tone(880, 0.12, 'sine', 0.05);
    window.showToast?.('SOUND: ' + (on ? 'ON' : 'OFF'));
  });
})();

/* ─── TERMINAL EASTER EGG ─── */
(function terminal() {
  const modal = document.getElementById('terminal-modal');
  const body = document.getElementById('terminal-body');
  const input = document.getElementById('terminal-input');
  const openBtn = document.getElementById('open-terminal');
  const closeBtn = document.getElementById('terminal-close');

  function open() {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    setTimeout(() => input.focus(), 200);
  }
  function close() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }
  openBtn?.addEventListener('click', () => { Audio.success(); open(); });
  closeBtn?.addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('open')) close();
  });

  const commands = {
    help: () => [
      'Available commands:',
      '  help       — show this',
      '  whoami     — reveal identity',
      '  selena     — summon the siren',
      '  frames     — list frames',
      '  story      — lore summary',
      '  sfx        — play a sound',
      '  theme      — cycle theme',
      '  clear      — clear terminal',
      '  exit       — close terminal'
    ],
    whoami: () => ['> user: anonymous_visitor', '> clearance: VISITOR', '> access: FULL'],
    selena: () => {
      Audio.chord([523.25, 659.25, 783.99, 1046.50], 0.8);
      return [
        '> Summoning...',
        '> "The softest voice. The unbroken melody."',
        '> Selena (Pianissimo) has entered the archive.',
        '> ♪ ♫ ♬ ♪ ♫ ♬'
      ];
    },
    frames: () => [
      '> PIANISSIMO  — Attacker · Physical/Glacia · S-Rank',
      '> CAPRICCIO   — Amplifier · Dark/Physical · S-Rank',
      '> TEMPEST     — Vanguard · Lightning · S-Rank'
    ],
    story: () => [
      '> Rising star of Babylonia.',
      '> Lost aboard a space station.',
      '> Reborn through the Red Tide.',
      '> The voice that listens to the virus.',
      '> Pianissimo — the softest, and yet unbroken.'
    ],
    sfx: () => { Audio.chord([440, 554.37, 659.25], 0.5); return ['> ♪ tone played']; },
    theme: () => { document.getElementById('theme-toggle').click(); return ['> theme cycled']; },
    clear: () => { body.innerHTML = ''; return []; },
    exit: () => { close(); return []; }
  };

  input.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const cmd = input.value.trim().toLowerCase();
    input.value = '';
    body.insertAdjacentHTML('beforeend', `<p class="term-line"><span class="term-hi">SELENA@ARCHIVE:~$</span> ${escapeHtml(cmd)}</p>`);
    if (!cmd) return;
    const fn = commands[cmd];
    if (fn) {
      const lines = fn();
      lines.forEach(l => body.insertAdjacentHTML('beforeend', `<p class="term-line">${escapeHtml(l)}</p>`));
    } else {
      body.insertAdjacentHTML('beforeend', `<p class="term-line">> unknown command: ${escapeHtml(cmd)}. type <span class="term-hi">help</span>.</p>`);
    }
    body.scrollTop = body.scrollHeight;
  });

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
})();

/* ─── KONAMI CODE EASTER EGG ─── */
(function konami() {
  const seq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let idx = 0;
  document.addEventListener('keydown', e => {
    if (e.key === seq[idx]) {
      idx++;
      if (idx === seq.length) {
        idx = 0;
        document.body.dataset.theme = 'rose';
        Audio.chord([523.25, 659.25, 783.99, 1046.50, 1318.51], 1.0);
        window.showToast?.('★ IRIS MODE ACTIVATED ★');
      }
    } else idx = 0;
  });
})();

/* ─── SCROLL TO TOP ON BRAND CLICK ─── */
document.querySelector('.nav-brand')?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  Audio.click();
});

/* ─── SMOOTH ANCHOR + SFX ─── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', () => Audio.tone(880, 0.06, 'sine', 0.03));
});

/* ─── CONSOLE SIGNATURE ─── */
console.log('%c◈ SELENA // PIANISSIMO — FAN ARCHIVE v2', 'color:#6ee7ff;font-family:Orbitron;font-size:16px;text-shadow:0 0 10px #6ee7ff;');
console.log('%cType konami code for a surprise, or click OPEN TERMINAL.', 'color:#a78bfa;font-family:Share Tech Mono;font-size:12px;');
