/* ==========================================================
   LocaLoan — Onboarding, Install Prompt & Demo Tour
   Shown only when no loans exist (brand-new install or cleared data).
========================================================== */
(function () {
  'use strict';

  const F = "'Space Mono','Courier New',monospace";
  const C = {
    bg:      '#0f172a',
    card:    '#111827',
    border:  '#1e293b',
    orange:  '#F97316',
    green:   '#22C55E',
    white:   '#f8fafc',
    gray:    '#94a3b8',
    muted:   '#64748b',
    warn_bg: '#431407',
    warn_bd: '#9a3412',
    warn_fg: '#fed7aa',
  };

  const isPWA     = () => window.matchMedia('(display-mode: standalone)').matches || !!navigator.standalone;
  const isIOS     = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isAndroid = () => /android/i.test(navigator.userAgent);

  function hasLoans() {
    try {
      if (typeof loadData === 'function') {
        const d = loadData();
        return (d.loans || []).filter(l => !l.deleted).length > 0;
      }
    } catch (_) {}
    return false;
  }

  let _deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', function(e) {
    e.preventDefault();
    _deferredPrompt = e;
  });

  function injectStyles() {
    if (document.getElementById('ob-css')) return;
    const s = document.createElement('style');
    s.id = 'ob-css';
    s.textContent = [
      '@keyframes ob-pop  {from{opacity:0;transform:scale(.72)}to{opacity:1;transform:scale(1)}}',
      '@keyframes ob-up   {from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}',
      '@keyframes ob-in   {from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}',
      '@keyframes ob-blink{0%,100%{opacity:1}50%{opacity:0}}',
      '.ob-pop{animation:ob-pop .55s cubic-bezier(.34,1.56,.64,1) both}',
      '.ob-up {animation:ob-up  .42s ease both}',
      '.ob-in {animation:ob-in  .32s ease both}',
      '#ob-cursor{display:inline-block;width:2px;height:1em;background:' + C.orange + ';',
      '  margin-left:2px;vertical-align:text-bottom;animation:ob-blink 1s step-start infinite}',
    ].join('');
    document.head.appendChild(s);
  }

  function fadeOut(el, cb) {
    if (!el) { if (cb) cb(); return; }
    el.style.transition = 'opacity .28s ease';
    el.style.opacity    = '0';
    setTimeout(function() { el.remove(); if (cb) cb(); }, 300);
  }

  function solidBtn(id, label, bg) {
    return '<button id="' + id + '" style="display:block;width:100%;padding:.7rem 1rem;margin-top:.5rem;border-radius:.75rem;background:' + bg + ';color:' + C.white + ';border:none;font-family:' + F + ';font-size:.78rem;font-weight:700;cursor:pointer;">' + label + '</button>';
  }

  function skipLink(id, label) {
    label = label || 'Skip — continue in the browser';
    return '<button id="' + id + '" style="background:none;border:none;width:100%;padding:.65rem 0 0;font-family:' + F + ';font-size:.68rem;color:' + C.muted + ';cursor:pointer;text-align:center;text-decoration:underline;text-underline-offset:3px;">' + label + '</button>';
  }

  var WARN_HTML = '<div style="background:' + C.warn_bg + ';border:1px solid ' + C.warn_bd + ';border-radius:.6rem;padding:.8rem;margin-top:.9rem;font-size:.68rem;color:' + C.warn_fg + ';line-height:1.65;">⚠️ <strong>Data safety:</strong> Without installing as a PWA, your data sits in browser cache. iOS & Android may silently delete it during low-storage cleanup. Install as a PWA to keep your debt data safe.</div>';

  function showLanding() {
    injectStyles();
    var overlay = document.createElement('div');
    overlay.id = 'ob-overlay';
    overlay.setAttribute('style', 'position:fixed;inset:0;z-index:9998;background:' + C.bg + ';display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:' + F + ';padding:2rem 1.5rem 6rem;overflow-y:auto;');

    overlay.innerHTML = [
      '<div class="ob-pop" style="animation-delay:.1s">',
        '<svg width="88" height="88" viewBox="0 0 512 512" fill="none">',
          '<rect width="512" height="512" rx="80" fill="#0F172A"/>',
          '<path d="M256 80v352M356 144H209a60 60 0 000 120h94a60 60 0 010 120H156" stroke="#F97316" stroke-width="36" stroke-linecap="round" stroke-linejoin="round"/>',
        '</svg>',
      '</div>',
      '<div class="ob-up" style="margin-top:1.1rem;font-size:1.9rem;font-weight:700;letter-spacing:-.02em;animation-delay:.5s;">',
        '<span style="color:' + C.white + '">Loca</span>',
        '<span style="color:' + C.orange + '">Loan</span>',
      '</div>',
      '<div class="ob-up" style="margin-top:.6rem;max-width:300px;text-align:center;color:' + C.gray + ';font-size:.75rem;line-height:1.7;animation-delay:.8s;min-height:2.3rem;">',
        '<span id="ob-tagtext"></span><span id="ob-cursor"></span>',
      '</div>',
      '<div id="ob-panel" style="display:none;width:100%;max-width:360px;margin-top:1.5rem;animation:ob-in .38s ease both;"></div>',
    ].join('');

    document.body.appendChild(overlay);

    var tagline = 'Find the fastest, cheapest path to zero.';
    var idx = 0;
    var tw = setInterval(function() {
      var span = document.getElementById('ob-tagtext');
      if (!span || idx >= tagline.length) {
        clearInterval(tw);
        var cur = document.getElementById('ob-cursor');
        if (cur) setTimeout(function() { if (cur) cur.style.display = 'none'; }, 900);
        return;
      }
      span.textContent += tagline[idx++];
    }, 38);

    setTimeout(showPanel, 2500);
  }

  function showPanel() {
    var panel = document.getElementById('ob-panel');
    if (!panel) return;
    if (isPWA()) {
      panel.innerHTML = pwaPanelHTML();
    } else if (isIOS()) {
      panel.innerHTML = installPanelHTML('ios');
    } else if (isAndroid()) {
      panel.innerHTML = installPanelHTML('android');
    } else {
      panel.innerHTML = installPanelHTML('desktop');
    }
    panel.style.display = 'block';
    wirePanel();
  }

  function wirePanel() {
    var overlay  = document.getElementById('ob-overlay');
    var startBtn = document.getElementById('ob-start');
    if (startBtn) startBtn.addEventListener('click', function() { fadeOut(overlay, startDemo); });
    var skipBtn = document.getElementById('ob-skip');
    if (skipBtn) skipBtn.addEventListener('click', function() { fadeOut(overlay, startDemo); });
    var chromeBtn = document.getElementById('ob-chrome-install');
    if (chromeBtn) chromeBtn.addEventListener('click', function() {
      if (_deferredPrompt) {
        _deferredPrompt.prompt();
        _deferredPrompt.userChoice.then(function(result) {
          _deferredPrompt = null;
          if (result.outcome === 'accepted') fadeOut(overlay, startDemo);
        });
      } else {
        chromeBtn.textContent = 'Use browser menu → "Install LocaLoan"';
        chromeBtn.disabled = true;
      }
    });
  }

  function pwaPanelHTML() {
    return '<div style="background:' + C.card + ';border:1px solid ' + C.border + ';border-radius:1rem;padding:1.4rem;text-align:center;">' +
      '<div style="font-size:.95rem;font-weight:700;color:' + C.white + ';margin-bottom:.35rem;">Ready to crush your debt</div>' +
      '<div style="font-size:.72rem;color:' + C.gray + ';line-height:1.65;margin-bottom:1.1rem;">Add your first loan and see exactly when you\'ll be debt-free.</div>' +
      solidBtn('ob-start', 'Add my first loan', C.orange) +
    '</div>';
  }

  function installPanelHTML(platform) {
    var steps = {
      ios: ['1. Open this page in <strong>Safari</strong>','2. Tap the <strong>Share</strong> button ⎋ at the bottom','3. Tap <strong>"Add to Home Screen"</strong>','4. Tap <strong>"Add"</strong> to confirm'],
      android: ['1. Tap the <strong>⋮ three-dot menu</strong> in Chrome','2. Tap <strong>"Add to Home screen"</strong>','3. Tap <strong>"Install"</strong> to confirm'],
    };
    var headers = { ios: { emoji: '🍎', label: 'iOS · Safari required' }, android: { emoji: '🤖', label: 'Android · Chrome' }, desktop: { emoji: '💻', label: 'Chrome or Edge' } };
    var h = headers[platform];
    var stepsHtml = (steps[platform] || []).map(function(s) {
      return '<div style="padding:.45rem 0;border-bottom:1px solid ' + C.border + ';font-size:.72rem;color:' + C.gray + ';line-height:1.55;">' + s + '</div>';
    }).join('');

    var bodyHtml = platform === 'desktop'
      ? '<div style="font-size:.72rem;color:' + C.gray + ';text-align:center;line-height:1.65;margin-bottom:.85rem;">Install as an app for the best experience and safer data storage.</div>' + solidBtn('ob-chrome-install', '⬇ Install App', C.orange)
      : '<div style="margin-bottom:.85rem;">' + stepsHtml + '</div>';

    return '<div style="background:' + C.card + ';border:1px solid ' + C.border + ';border-radius:1rem;padding:1.35rem;">' +
      '<div style="text-align:center;margin-bottom:.9rem;"><div style="font-size:1rem;font-weight:700;color:' + C.white + ';">' + h.emoji + ' Add to Home Screen</div><div style="font-size:.68rem;color:' + C.muted + ';margin-top:.2rem;">' + h.label + '</div></div>' +
      bodyHtml + WARN_HTML + skipLink('ob-skip') +
    '</div>';
  }

  var TOUR = [
    { tab: null,        icon: '💸', title: 'Welcome to LocaLoan', body: 'No accounts. No cloud. Every loan you track stays only on this device. See exactly when you\'ll be debt-free and how much interest you\'ll pay. Here\'s a quick tour.' },
    { tab: 'dashboard', icon: '📊', title: 'Dashboard',           body: 'Your debt command center. See total debt, monthly minimums, and your projected payoff date. Switch between Avalanche and Snowball strategies to see which saves more.' },
    { tab: 'add',       icon: '➕', title: 'Add a Loan',          body: 'Enter any debt — credit card, auto loan, student loan, mortgage. Include the current balance, APR, and minimum payment. Optional: add promo APR periods.' },
    { tab: 'loans',     icon: '📋', title: 'Your Loans',          body: 'All your loans in one list, sorted by your active strategy. Tap any loan to see the full amortization schedule — every payment, every month, down to the penny.' },
    { tab: null,        icon: '✅', title: 'All set',             body: 'Start by adding your first loan. Tip: add ALL your loans for the most accurate payoff timeline and strategy comparison.' },
  ];

  var _step = 0, _demoEl = null;

  function startDemo() {
    injectStyles();
    _demoEl = document.createElement('div');
    _demoEl.id = 'ob-demo';
    _demoEl.setAttribute('style', 'position:fixed;bottom:calc(4.5rem + env(safe-area-inset-bottom,0px));left:0;right:0;z-index:9997;display:flex;justify-content:center;pointer-events:none;font-family:' + F + ';padding:0 1rem;');
    document.body.appendChild(_demoEl);
    _step = 0;
    renderStep();
  }

  function renderStep() {
    if (!_demoEl) return;
    var s = TOUR[_step], total = TOUR.length, last = (_step === total - 1);
    if (s.tab && typeof switchTab === 'function') switchTab(s.tab);

    var dots = TOUR.map(function(_, i) {
      return '<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:' + (i === _step ? C.orange : C.border) + ';margin:0 3px;transition:background .2s;"></span>';
    }).join('');

    _demoEl.innerHTML =
      '<div class="ob-in" style="pointer-events:all;background:' + C.card + ';border:1px solid ' + C.border + ';border-radius:1.25rem;padding:1.15rem 1.15rem .9rem;width:100%;max-width:420px;box-shadow:0 -4px 40px rgba(0,0,0,.6);">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.6rem;">' +
          '<div style="display:flex;align-items:center;gap:.45rem;"><span style="font-size:1.05rem;">' + s.icon + '</span><span style="font-size:.85rem;font-weight:700;color:' + C.white + ';">' + s.title + '</span></div>' +
          '<div style="display:flex;align-items:center;gap:.75rem;"><span style="font-size:.65rem;font-weight:700;color:' + C.muted + ';">'+(_step+1)+' / '+total+'</span>' +
          '<button id="ob-skip-tour" style="background:none;border:none;padding:0;font-family:' + F + ';font-size:.65rem;color:' + C.muted + ';cursor:pointer;text-decoration:underline;text-underline-offset:2px;">Skip demo</button></div>' +
        '</div>' +
        '<div style="text-align:center;margin-bottom:.7rem;">' + dots + '</div>' +
        '<p style="font-size:.73rem;color:' + C.gray + ';line-height:1.7;margin:0 0 .9rem;">' + s.body + '</p>' +
        '<button id="ob-next-step" style="display:block;width:100%;padding:.6rem;border-radius:.75rem;background:' + (last ? C.green : C.orange) + ';color:' + C.white + ';border:none;font-family:' + F + ';font-size:.78rem;font-weight:700;cursor:pointer;">' + (last ? '✓ Got it — let\'s go!' : 'Next →') + '</button>' +
      '</div>';

    document.getElementById('ob-next-step').addEventListener('click', advanceDemo);
    document.getElementById('ob-skip-tour').addEventListener('click', endDemo);
  }

  function advanceDemo() { _step++; if (_step >= TOUR.length) endDemo(); else renderStep(); }
  function endDemo() { var el = _demoEl; _demoEl = null; fadeOut(el); }

  function init() {
    if (hasLoans()) return;
    setTimeout(showLanding, 380);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
