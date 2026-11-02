/* =========================================================================
   心理英語ノート  psych-english/app.js
   心理学・精神分析の英語文献を読むための学習ページ。
   ・単語カード（間隔反復）／4択チェック／構文／訳読（通読・訳読）／予習ノート／学び方／記録
   ・広告なし／外部通信なし。学習データはこの端末のブラウザ（localStorage）だけに保存。
   ・見た目は国試ドリルと共通の ../drill/style.css を使い、固有の部品は eigo.css に置く。
   データ：data/words.js（PE_WORDS）、data/grammar.js（PE_GRAMMAR）、
           data/read1〜3.js（PE_READ）、data/guide.js（PE_GUIDE）
   ========================================================================= */
(function () {
  'use strict';

  var APP = { name: '心理英語ノート', version: '1.0.0', key: 'psyeng' };
  var LS_KEY = APP.key + '.v1';
  var WORDS = window.PE_WORDS || [];
  var GRAMMAR = window.PE_GRAMMAR || [];
  var PASSAGES = window.PE_READ || [];
  var GUIDE = window.PE_GUIDE || { sections: [] };

  var CATS = [
    { id: 'acad', name: '学術英語の基本語', short: '学術', d: '論文・専門書のどの分野にも出てくる動詞・名詞・形容詞' },
    { id: 'psy', name: '心理学・臨床の用語', short: '心理', d: '基礎心理学、臨床心理学、精神医学、研究法の用語' },
    { id: 'pa', name: '精神分析の用語', short: '精神分析', d: 'フロイト以後の主要概念。原語（ドイツ語など）と訳語の揺れも' },
    { id: 'phr', name: '文献の言い回し', short: '言い回し', d: 'つなぎの語句、論の運び、留保（ヘッジ）の表現' },
    { id: 'my', name: 'マイ単語', short: 'マイ', d: '訳読や予習ノートから自分で追加した語' }
  ];
  var CAT = {}; CATS.forEach(function (c, i) { c.order = i; CAT[c.id] = c; });
  var LEVELS = [
    { lv: 1, name: '基礎', d: '心理学の入門書レベル。短い文で、文の骨組み（主語と動詞）をつかむ練習から。' },
    { lv: 2, name: '標準', d: '教科書・論文要旨レベル。修飾が長くなり、論の運びを追う練習。' },
    { lv: 3, name: '専門', d: '精神分析の専門書レベル。抽象名詞・挿入・倒置が多い文を、構造から訳す練習。' }
  ];

  /* ---------------------------------------------------------------------
     小さな道具
     --------------------------------------------------------------------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  // 解説文：エスケープしたうえで **強調** と改行だけ許可
  function fmt(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>'); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function dkey(d) { d = d || new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parseKey(k) { var p = k.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); }
  function addDays(k, n) { var d = parseKey(k); d.setDate(d.getDate() + n); return dkey(d); }
  function daysBetween(a, b) { return Math.round((parseKey(b) - parseKey(a)) / 86400000); }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function uid(p) { return p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function fmtDate(ts) { var d = new Date(ts); return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate(); }

  var ICONS = {
    play: '<path d="M7 5v14l11-7z"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="1.5"/>',
    speak: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>',
    cards: '<rect x="3" y="5" width="13" height="15" rx="2"/><path d="M8 3h11a2 2 0 0 1 2 2v13"/>',
    check: '<path d="M4 12l5 5L20 6"/>',
    book: '<path d="M3 5.5c3-1.2 6-1 9 1 3-2 6-2.2 9-1v13c-3-1.2-6-1-9 1-3-2-6-2.2-9-1z"/><path d="M12 6.5v13"/>',
    tree: '<path d="M12 4v5M12 9l-6 5M12 9l6 5M6 14v5M18 14v5M12 9v10"/>',
    note: '<path d="M5 3h11l3 3v15H5zM8 9h8M8 13h8M8 17h5"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    quiz: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17h.01"/>',
    redo: '<path d="M4 12a8 8 0 1 0 2.3-5.6L4 8.7"/><path d="M4 4v4.7h4.7"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    print: '<path d="M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7z"/>',
    down: '<path d="M12 4v12M6 11l6 6 6-6M5 20h14"/>',
    left: '<path d="M15 5l-7 7 7 7"/>',
    right: '<path d="M9 5l7 7-7 7"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>'
  };
  function icon(n) { return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[n] || '') + '</svg>'; }

  /* ---------------------------------------------------------------------
     構造の表記（訳読・構文で共通）
     [S|…] [V|…] [O|…] [C|…] [M|…]  … 主節の要素（小文字 s v o c m は従属節の中の要素）
     (…) 形容詞的な修飾（名詞を説明）  <…> 副詞的な修飾  {…} 名詞のかたまり（名詞節・名詞句）
     *…* 文の骨組みを示す語（接続詞・関係詞など）を強調。 \ の直後の文字はそのまま表示。
     --------------------------------------------------------------------- */
  var SUBNUM = { '1': '₁', '2': '₂' };
  function roleLabel(lab) {
    var base = lab.charAt(0).toUpperCase(), sub = lab.charAt(0) !== base, n = lab.charAt(1);
    return base + (sub ? '′' : '') + (n ? SUBNUM[n] || n : '');
  }
  function renderParse(p) {
    var out = '', stack = [], i = 0, bold = false;
    while (i < p.length) {
      var c = p.charAt(i);
      if (c === '\\' && i + 1 < p.length) { out += esc(p.charAt(i + 1)); i += 2; continue; }
      if (c === '[') {
        var m = /^\[([SVOCMsvocm][12]?)\|/.exec(p.slice(i, i + 5));
        if (m) {
          var lab = m[1], low = lab.charAt(0) !== lab.charAt(0).toUpperCase();
          out += '<span class="pc pc-' + lab.charAt(0).toUpperCase() + (low ? ' sub' : '') + '"><span class="pl" aria-hidden="true">' + roleLabel(lab) + '</span>';
          stack.push(']'); i += m[0].length; continue;
        }
      }
      var top = stack[stack.length - 1];
      if (c === ']' && top === ']') { out += '</span>'; stack.pop(); i++; continue; }
      if (c === '(') { out += '<span class="pm pm-a"><span class="pb">(</span>'; stack.push(')'); i++; continue; }
      if (c === ')' && top === ')') { out += '<span class="pb">)</span></span>'; stack.pop(); i++; continue; }
      if (c === '<') { out += '<span class="pm pm-v"><span class="pb">〈</span>'; stack.push('>'); i++; continue; }
      if (c === '>' && top === '>') { out += '<span class="pb">〉</span></span>'; stack.pop(); i++; continue; }
      if (c === '{') { out += '<span class="pm pm-n"><span class="pb">［</span>'; stack.push('}'); i++; continue; }
      if (c === '}' && top === '}') { out += '<span class="pb">］</span></span>'; stack.pop(); i++; continue; }
      if (c === '*') { out += bold ? '</b>' : '<b class="kw">'; bold = !bold; i++; continue; }
      out += esc(c); i++;
    }
    if (bold) out += '</b>';
    while (stack.length) { var t = stack.pop(); out += t === ']' ? '</span>' : '</span>'; }
    return out;
  }
  function stripParse(p) {
    var out = '', i = 0;
    while (i < p.length) {
      var c = p.charAt(i);
      if (c === '\\' && i + 1 < p.length) { out += p.charAt(i + 1); i += 2; continue; }
      if (c === '[') { var m = /^\[([SVOCMsvocm][12]?)\|/.exec(p.slice(i, i + 5)); if (m) { i += m[0].length; continue; } }
      if ('[](){}<>*'.indexOf(c) >= 0) { i++; continue; }
      out += c; i++;
    }
    return out.replace(/\s+/g, ' ').replace(/\s+([,.;:?!])/g, '$1').trim();
  }
  var PARSE_LEGEND = '<div class="plegend" aria-label="構造の記号の説明">' +
    '<span><span class="pc pc-S"><span class="pl">S</span>主語</span></span>' +
    '<span><span class="pc pc-V"><span class="pl">V</span>動詞</span></span>' +
    '<span><span class="pc pc-O"><span class="pl">O</span>目的語</span></span>' +
    '<span><span class="pc pc-C"><span class="pl">C</span>補語</span></span>' +
    '<span><span class="pc pc-M"><span class="pl">M</span>修飾</span></span>' +
    '<span><span class="pm pm-a"><span class="pb">(</span>名詞を説明<span class="pb">)</span></span></span>' +
    '<span><span class="pm pm-v"><span class="pb">〈</span>副詞的な修飾<span class="pb">〉</span></span></span>' +
    '<span><span class="pm pm-n"><span class="pb">［</span>名詞のかたまり<span class="pb">］</span></span></span>' +
    '<span class="small muted">S′ V′ などは節の中の要素</span></div>';

  /* ---------------------------------------------------------------------
     データの下ごしらえ
     --------------------------------------------------------------------- */
  var WBYID = {}, RANK = {};
  // 新しい単語は、レベルの低い順に、分野を交互にまぜて出す（rk＝分野・レベルの中での順番）
  WORDS.forEach(function (w, i) { w.idx = i; WBYID[w.id] = w; var key = w.cat + (w.lv || 1); w.rk = RANK[key] = (RANK[key] || 0) + 1; });
  var PBYID = {};
  PASSAGES.sort(function (a, b) { return a.lv - b.lv || (a.id < b.id ? -1 : 1); });
  PASSAGES.forEach(function (p, i) {
    p.idx = i; PBYID[p.id] = p;
    p.s.forEach(function (s, k) { s.en = stripParse(s.p); s.k = k; });
    p.wc = p.s.reduce(function (n, s) { return n + s.en.split(/\s+/).length; }, 0);
  });
  var GBYID = {};
  GRAMMAR.forEach(function (g, i) { g.idx = i; GBYID[g.id] = g; });

  /* ---------------------------------------------------------------------
     保存（localStorage）。使えない環境ではメモリ上だけで動かす
     --------------------------------------------------------------------- */
  var memStore = {};
  var canStore = (function () {
    try { var k = '__pe'; localStorage.setItem(k, '1'); localStorage.removeItem(k); return true; } catch (e) { return false; }
  })();
  function lsGet(k) { try { return canStore ? localStorage.getItem(k) : memStore[k] || null; } catch (e) { return null; } }
  function lsSet(k, v) {
    try { if (canStore) localStorage.setItem(k, v); else memStore[k] = v; return true; }
    catch (e) { toast('保存できませんでした（ブラウザの保存容量がいっぱいの可能性があります）'); return false; }
  }
  function defaults() {
    return {
      v: 1,
      settings: { theme: 'auto', font: 'm', rate: 0.9, voice: '', newPerDay: 10, dir: 'en', showParse: false },
      cards: {},        // 単語ID → { iv, due, ease, reps, lapses, last, intro }
      custom: [],       // マイ単語 { id, w, ja, ex, src, ts }
      pas: {},          // 訳読 ID → { done, rate:{k:0|1|2}, tr:{k:text}, q:{i:choice}, last }
      gram: {},         // 構文 ID → { q:{i:choice}, done }
      notes: [],        // 予習ノート
      log: {},          // 'YYYY-MM-DD' → { c, n, s, p, g, q }
      daily: { date: '', n: 0 }
    };
  }
  var store = (function () {
    var d = defaults(), raw = lsGet(LS_KEY);
    if (!raw) return d;
    try {
      var s = JSON.parse(raw);
      Object.keys(d).forEach(function (k) { if (s[k] == null) s[k] = d[k]; });
      s.settings = Object.assign(d.settings, s.settings || {});
      return s;
    } catch (e) { return d; }
  })();
  var saveTimer = null;
  function save(now) {
    clearTimeout(saveTimer);
    if (now) { lsSet(LS_KEY, JSON.stringify(store)); return; }
    saveTimer = setTimeout(function () { lsSet(LS_KEY, JSON.stringify(store)); }, 250);
  }
  window.addEventListener('pagehide', function () { save(true); });
  function today() { return dkey(); }
  function logAdd(field, n) {
    var k = today(), l = store.log[k] || (store.log[k] = {});
    l[field] = (l[field] || 0) + (n || 1);
  }
  function newToday() { return store.daily.date === today() ? store.daily.n : 0; }
  function addNewToday() { if (store.daily.date !== today()) store.daily = { date: today(), n: 0 }; store.daily.n++; }

  /* ---------------------------------------------------------------------
     テーマ・文字サイズ
     --------------------------------------------------------------------- */
  function applyLook() {
    var r = document.documentElement, st = store.settings;
    if (st.theme === 'auto') r.removeAttribute('data-theme'); else r.setAttribute('data-theme', st.theme);
    if (st.font === 'm') r.removeAttribute('data-font'); else r.setAttribute('data-font', st.font);
  }
  applyLook();
  $('#themeToggle').addEventListener('click', function () {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark' ||
      (store.settings.theme === 'auto' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
    store.settings.theme = dark ? 'light' : 'dark';
    applyLook(); save();
    toast(dark ? 'ライト表示にしました' : 'ダーク表示にしました');
  });

  /* ---------------------------------------------------------------------
     トースト・モーダル
     --------------------------------------------------------------------- */
  var toastTimer;
  function toast(msg) {
    var t = $('#toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.hidden = true; }, 2600);
  }
  var modalReturnFocus = null;
  function openModal(o) {
    var m = $('#modal');
    $('#modalTitle').textContent = o.title || '';
    $('#modalBody').innerHTML = o.html || '';
    var acts = $('#modalActions'); acts.innerHTML = '';
    (o.actions || [{ label: '閉じる' }]).forEach(function (a) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'btn ' + (a.cls || ''); b.textContent = a.label;
      b.addEventListener('click', function () { var keep = a.fn && a.fn() === false; if (!keep) closeModal(); });
      acts.appendChild(b);
    });
    modalReturnFocus = document.activeElement;
    m.hidden = false;
    var f = $('#modalBody input, #modalBody textarea') || acts.querySelector('.primary') || acts.querySelector('button');
    if (f) f.focus();
  }
  function closeModal() {
    $('#modal').hidden = true;
    if (modalReturnFocus && modalReturnFocus.focus) { try { modalReturnFocus.focus(); } catch (e) { /* noop */ } }
  }
  function confirmBox(title, html, okLabel, fn, danger) {
    openModal({ title: title, html: html, actions: [{ label: 'キャンセル' }, { label: okLabel || 'OK', cls: danger ? 'danger' : 'primary', fn: fn }] });
  }
  $('#modal').addEventListener('click', function (e) { if (e.target.hasAttribute('data-close')) closeModal(); });

  /* ---------------------------------------------------------------------
     読み上げ（ブラウザ内蔵の音声合成。外部への送信はしない）
     --------------------------------------------------------------------- */
  var TTS = { ok: 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined', voices: [], playing: null };
  function loadVoices() {
    if (!TTS.ok) return;
    try { TTS.voices = speechSynthesis.getVoices().filter(function (v) { return /^en([-_]|$)/i.test(v.lang); }); } catch (e) { TTS.voices = []; }
  }
  if (TTS.ok) { loadVoices(); try { speechSynthesis.onvoiceschanged = loadVoices; } catch (e) { /* noop */ } }
  function pickVoice() {
    var vs = TTS.voices, name = store.settings.voice;
    if (name) { var hit = vs.filter(function (v) { return v.name === name; })[0]; if (hit) return hit; }
    return vs.filter(function (v) { return /en[-_]US/i.test(v.lang) && v.localService; })[0] ||
      vs.filter(function (v) { return /en[-_]US/i.test(v.lang); })[0] || vs[0] || null;
  }
  function stopSpeech() {
    TTS.playing = null;
    $all('.speaking').forEach(function (el) { el.classList.remove('speaking'); });
    $all('[data-act="readAll"]').forEach(function (b) { b.innerHTML = icon('play') + ' 全文を読み上げ'; });
    try { if (TTS.ok) speechSynthesis.cancel(); } catch (e) { /* noop */ }
  }
  function speak(text, opt) {
    if (!TTS.ok || !text) return;
    opt = opt || {};
    try { speechSynthesis.cancel(); } catch (e) { /* noop */ }
    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = (opt.slow ? 0.7 : 1) * (store.settings.rate || 0.9);
    var v = pickVoice(); if (v) { u.voice = v; u.lang = v.lang; }
    if (opt.onend) u.onend = opt.onend;
    u.onerror = function () { if (opt.onend && TTS.playing) { /* 次へ進まず止める */ stopSpeech(); } };
    speechSynthesis.speak(u);
  }
  function speakBtn(text, label, slow) {
    if (!TTS.ok) return '';
    return '<button type="button" class="sbtn" data-act="say" data-t="' + esc(text) + '"' + (slow ? ' data-slow="1"' : '') + ' aria-label="' + esc(label || '読み上げ') + '" title="' + esc(label || '読み上げ') + '">' + icon('speak') + (slow ? '<span class="sl">ゆっくり</span>' : '') + '</button>';
  }

  /* ---------------------------------------------------------------------
     ルーター
     --------------------------------------------------------------------- */
  var VIEWS = {};
  var current = { name: '', params: {} };
  function parseHash() {
    var h = location.hash.replace(/^#\/?/, '');
    var qi = h.indexOf('?'), name = qi >= 0 ? h.slice(0, qi) : h, params = {};
    if (qi >= 0) h.slice(qi + 1).split('&').forEach(function (kv) {
      if (!kv) return; var p = kv.split('='); params[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || '');
    });
    return { name: name || 'home', params: params };
  }
  function go(hash) { if (location.hash === hash) route(); else location.hash = hash; }
  var NAV_OF = { cards: 'words', quiz: 'words', g: 'grammar', p: 'read', redo: 'read', n: 'notes', settings: 'stats' };
  var MORE_KEYS = ['grammar', 'guide', 'stats', 'settings', 'more'];
  function route() {
    var r = parseHash();
    if (!VIEWS[r.name]) r = { name: 'home', params: {} };
    stopSpeech();
    if (current.name === 'n') flushNote();
    current = r;
    document.body.classList.toggle('focus', r.name === 'cards' || r.name === 'quiz');
    var navKey = NAV_OF[r.name] || r.name;
    $all('[data-nav]').forEach(function (a) {
      var k = a.getAttribute('data-nav'), on = k === navKey;
      // スマートフォンの下部メニューにない画面は「メニュー」を選択中として表示
      if (k === 'more') on = MORE_KEYS.indexOf(navKey) >= 0;
      a.classList.toggle('on', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    VIEWS[r.name](r.params);
    if (!r.params.keep) window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);
  function setView(html) { $('#view').innerHTML = html; }
  function footer() {
    return '<div class="footer">' + esc(APP.name) + ' v' + APP.version + '　｜　広告なし・登録不要・学習データはこの端末にのみ保存<br>' +
      '英文・例文はすべて学習用に独自に作成したものです（実在の文献からの引用ではありません）。<a href="#/guide">学び方・ご注意</a>　<a href="../">weekendclub</a></div>';
  }

  /* ---------------------------------------------------------------------
     単語カード（間隔反復）
     --------------------------------------------------------------------- */
  function allWords() {
    return WORDS.concat(store.custom.map(function (c) { return { id: c.id, w: c.w, pos: '', ja: c.ja, cat: 'my', ex: c.ex || '', exj: '', note: c.src ? '出典：' + c.src : '', custom: true }; }));
  }
  function wordById(id) {
    if (WBYID[id]) return WBYID[id];
    var c = store.custom.filter(function (x) { return x.id === id; })[0];
    return c ? { id: c.id, w: c.w, pos: '', ja: c.ja, cat: 'my', ex: c.ex || '', exj: '', note: c.src ? '出典：' + c.src : '', custom: true } : null;
  }
  function cardState(id) {
    var c = store.cards[id];
    if (!c) return 'new';
    if (c.iv >= 21) return 'mature';
    return 'learning';
  }
  function deckWords(deck) { return allWords().filter(function (w) { return deck === 'all' || w.cat === deck; }); }
  function dueList(deck) {
    var t = today();
    return deckWords(deck).filter(function (w) { var c = store.cards[w.id]; return c && c.due <= t; })
      .sort(function (a, b) { return store.cards[a.id].due < store.cards[b.id].due ? -1 : 1; });
  }
  function newList(deck) {
    return deckWords(deck).filter(function (w) { return !store.cards[w.id]; })
      .sort(function (a, b) { return (a.cat === 'my' ? -1 : 0) - (b.cat === 'my' ? -1 : 0) || (a.lv || 1) - (b.lv || 1) || (a.rk || 0) - (b.rk || 0) || CAT[a.cat].order - CAT[b.cat].order; });
  }
  function newQuota() { return Math.max(0, (store.settings.newPerDay || 10) - newToday()); }
  function schedule(c, g) {
    // g: 0=もう一度 1=難しい 2=正解 3=簡単。日単位の簡易版 SM-2
    var t = today(), isNew = !c;
    c = c ? Object.assign({}, c) : { iv: 0, ease: 2.5, reps: 0, lapses: 0, intro: t };
    if (g === 0) { c.lapses = (c.lapses || 0) + (isNew ? 0 : 1); c.ease = Math.max(1.3, c.ease - 0.2); c.iv = 0; }
    else if (isNew || c.iv === 0) { c.iv = [0, 1, 2, 4][g]; if (g === 1) c.ease = Math.max(1.3, c.ease - 0.15); if (g === 3) c.ease = Math.min(3, c.ease + 0.15); }
    else if (g === 1) { c.iv = Math.max(1, Math.round(c.iv * 1.2)); c.ease = Math.max(1.3, c.ease - 0.15); }
    else if (g === 2) { c.iv = Math.max(c.iv + 1, Math.round(c.iv * c.ease)); }
    else { c.iv = Math.max(c.iv + 2, Math.round(c.iv * c.ease * 1.3)); c.ease = Math.min(3, c.ease + 0.15); }
    c.iv = Math.min(c.iv, 365);
    c.reps = (c.reps || 0) + 1; c.last = t; c.due = addDays(t, c.iv);
    return c;
  }
  function ivLabel(d) { return d <= 0 ? 'すぐ' : d === 1 ? '明日' : d < 30 ? d + '日後' : Math.round(d / 30) + 'か月後'; }

  var CS = null; // 進行中のカード・セッション
  function startCards(deck, mode) {
    var due = dueList(deck), fresh = mode === 'review' ? [] : newList(deck).slice(0, newQuota());
    var q = due.map(function (w) { return w.id; }).concat(fresh.map(function (w) { return w.id; }));
    CS = { deck: deck, q: q, i: 0, shown: false, done: 0, nnew: 0, again: {}, total: q.length, dir: store.settings.dir };
    go('#/cards');
  }
  VIEWS.cards = function () {
    if (!CS) { go('#/words'); return; }
    if (CS.i >= CS.q.length) { cardsDone(); return; }
    var id = CS.q[CS.i], w = wordById(id);
    if (!w) { CS.i++; VIEWS.cards(); return; }
    var dir = CS.dir === 'mix' ? (id.length % 2 ? 'en' : 'ja') : CS.dir;
    var c = store.cards[id], isNew = !c;
    var left = CS.q.length - CS.i;
    var front = dir === 'ja'
      ? '<div class="fc-ja">' + esc(w.ja) + '</div>' + (w.exj ? '<p class="fc-hint">' + esc(w.exj) + '</p>' : '') + '<p class="small muted">この意味の英語は？</p>'
      : '<div class="fc-w en">' + esc(w.w) + '</div>' + (w.pos ? '<div class="fc-pos">' + esc(w.pos) + '</div>' : '') + speakBtn(w.w, w.w + ' を読み上げ');
    var back = '';
    if (CS.shown) {
      back = '<div class="fc-back">' +
        (dir === 'ja' ? '<div class="fc-w en">' + esc(w.w) + ' ' + speakBtn(w.w, w.w + ' を読み上げ') + '</div>' + (w.pos ? '<div class="fc-pos">' + esc(w.pos) + '</div>' : '') : '<div class="fc-ja">' + esc(w.ja) + '</div>') +
        wordDetail(w, true) + '</div>' +
        '<div class="grades" role="group" aria-label="思い出せたか">' +
        [0, 1, 2, 3].map(function (g) {
          var n = schedule(c, g);
          return '<button type="button" class="gbtn g' + g + '" data-act="grade" data-g="' + g + '"><b>' + ['もう一度', '難しい', '正解', '簡単'][g] + '</b><span>' + ivLabel(n.iv) + '</span><kbd>' + (g + 1) + '</kbd></button>';
        }).join('') + '</div>';
    }
    setView('<div class="wrap narrow cards-play">' +
      '<div class="ptop"><button class="btn small ghost" data-act="cardsQuit">' + icon('x') + ' 終える</button><span class="title small muted">' + esc(CS.deck === 'all' ? 'すべての単語' : CAT[CS.deck].name) + '</span><span class="small num">残り ' + left + '</span></div>' +
      '<div class="progress" aria-hidden="true"><i style="width:' + Math.round(CS.i / Math.max(1, CS.q.length) * 100) + '%"></i></div>' +
      '<div class="fc card' + (CS.shown ? ' open' : '') + '">' +
      '<div class="fc-meta">' + (isNew ? '<span class="chip acc">新しい単語</span>' : '<span class="chip">復習</span>') + '<span class="chip">' + esc(CAT[w.cat] ? CAT[w.cat].short : '') + '</span></div>' +
      front + back + '</div>' +
      (CS.shown ? '' : '<button type="button" class="btn primary block big" data-act="reveal" id="revealBtn">答えを見る <kbd>Space</kbd></button>') +
      '<p class="kbd-hint small muted">キーボード：Space で答え、1〜4 で評価。思い出せなかったら「もう一度」を選ぶと、少しあとにもう一度出ます。</p>' +
      '</div>');
    var b = $('#revealBtn') || $('.gbtn.g2'); if (b) b.focus();
  };
  function gradeCard(g) {
    if (!CS || !CS.shown) return;
    var id = CS.q[CS.i], before = store.cards[id];
    if (!before) { addNewToday(); logAdd('n'); CS.nnew++; }
    store.cards[id] = schedule(before, g);
    logAdd('c'); CS.done++;
    if (g === 0 && (CS.again[id] || 0) < 3) { CS.again[id] = (CS.again[id] || 0) + 1; CS.q.splice(Math.min(CS.q.length, CS.i + 4), 0, id); }
    CS.i++; CS.shown = false; save();
    VIEWS.cards();
  }
  function cardsDone() {
    var deck = CS ? CS.deck : 'all', dn = CS ? CS.done : 0, nn = CS ? CS.nnew : 0;
    var more = newList(deck).length, quota = newQuota();
    var tomorrow = deckWords(deck).filter(function (w) { var c = store.cards[w.id]; return c && c.due === addDays(today(), 1); }).length;
    setView('<div class="wrap narrow">' +
      '<div class="card done-card"><div class="big-ok">' + icon('check') + '</div><h1 class="page">おつかれさまでした</h1>' +
      '<p>今回 <b class="num">' + dn + '</b> 回答（新しい単語 <b class="num">' + nn + '</b>）。明日の復習予定は <b class="num">' + tomorrow + '</b> 枚です。</p>' +
      (dn === 0 ? '<p class="small muted">今日の復習と、新しい単語の上限（1日 ' + store.settings.newPerDay + ' 語）に達しています。上限は「設定」で変えられます。</p>' : '') +
      '<div class="row" style="justify-content:center; margin-top:12px">' +
      (quota > 0 && more > 0 ? '<button class="btn primary" data-act="cardsStart" data-deck="' + esc(deck) + '">続けて新しい単語</button>' : '') +
      '<a class="btn" href="#/quiz?deck=' + esc(deck === 'my' ? 'all' : deck) + '">' + icon('quiz') + ' 4択でチェック</a>' +
      '<a class="btn" href="#/read">' + icon('book') + ' 訳読へ</a></div></div>' + footer() + '</div>');
    CS = null;
  }

  function wordDetail(w, compact) {
    return '<div class="wd">' +
      (w.alt ? '<p class="wd-alt"><span class="lab">別訳</span>' + esc(w.alt) + '</p>' : '') +
      (w.de ? '<p class="wd-de"><span class="lab">原語</span><span class="en">' + esc(w.de) + '</span></p>' : '') +
      (w.note ? '<p class="wd-note">' + fmt(w.note) + '</p>' : '') +
      (w.ex ? '<div class="wd-ex"><p class="en">' + esc(w.ex) + ' ' + speakBtn(w.ex, '例文を読み上げ') + '</p>' + (w.exj ? '<p class="ja small">' + esc(w.exj) + '</p>' : '') + '</div>' : '') +
      (compact ? '' : '') + '</div>';
  }

  /* ---------- 単語の一覧 ---------- */
  var WL = { cat: 'all', st: 'all', kw: '', open: '' };
  VIEWS.words = function (p) {
    if (p.cat) WL.cat = p.cat;
    var t = today();
    var tiles = CATS.map(function (c) {
      var ws = deckWords(c.id), learned = ws.filter(function (w) { return store.cards[w.id]; }).length;
      var due = ws.filter(function (w) { var s = store.cards[w.id]; return s && s.due <= t; }).length;
      if (c.id === 'my' && !ws.length) return '';
      return '<button class="mode deck' + (WL.cat === c.id ? ' hot' : '') + '" data-act="wlCat" data-v="' + c.id + '"><span class="t">' + esc(c.name) + '</span><span class="d">' + esc(c.d) + '</span>' +
        '<span class="meter" aria-hidden="true"><i style="width:' + (ws.length ? Math.round(learned / ws.length * 100) : 0) + '%"></i></span>' +
        '<span class="n">学習済み ' + learned + ' / ' + ws.length + (due ? '　復習 ' + due : '') + '</span></button>';
    }).join('');
    var dueAll = dueList('all').length, nq = Math.min(newQuota(), newList('all').length);
    setView('<div class="wrap"><h1 class="page">単語</h1>' +
      '<p class="lead">心理学・精神分析の文献に出てくる語を、意味だけでなく<strong>訳語の揺れ・原語・例文</strong>とセットで覚えます。カードは思い出せた度合いに応じて、次に出る日が自動で決まります（間隔反復）。</p>' +
      '<div class="card today-cards"><div class="row between"><div><div class="k small muted">今日の単語カード</div><div class="big num">復習 ' + dueAll + '<small>枚</small>　新しい単語 ' + nq + '<small>語</small></div></div>' +
      '<div class="row"><button class="btn primary" data-act="cardsStart" data-deck="' + (WL.cat === 'all' ? 'all' : esc(WL.cat)) + '">' + icon('cards') + ' カードを始める' + (WL.cat === 'all' ? '' : '（' + esc(CAT[WL.cat].short) + '）') + '</button>' +
      '<a class="btn" href="#/quiz?deck=' + (WL.cat === 'all' || WL.cat === 'my' ? 'all' : esc(WL.cat)) + '">' + icon('quiz') + ' 4択でチェック</a></div></div></div>' +
      '<h2 class="sec">分野</h2><div class="modes decks">' +
      '<button class="mode deck' + (WL.cat === 'all' ? ' hot' : '') + '" data-act="wlCat" data-v="all"><span class="t">すべて</span><span class="d">全分野をまとめて</span><span class="n">' + allWords().length + '語</span></button>' + tiles + '</div>' +
      '<h2 class="sec">一覧 <span class="sub" id="wlCount"></span></h2>' +
      '<div class="searchbar"><input class="inp" id="wkw" type="search" placeholder="英語・日本語で検索（例：transference、転移、suggest）" value="' + esc(WL.kw) + '" aria-label="単語を検索"></div>' +
      '<div class="filters"><div class="seg" role="group" aria-label="学習の状態">' +
      [['all', 'すべて'], ['new', '未学習'], ['learning', '学習中'], ['mature', '定着'], ['due', '今日の復習']].map(function (x) { return '<button type="button" data-act="wlSt" data-v="' + x[0] + '" aria-pressed="' + (WL.st === x[0]) + '">' + x[1] + '</button>'; }).join('') +
      '</div></div><ul class="wlist" id="wlist"></ul>' + footer() + '</div>');
    $('#wkw').addEventListener('input', function (e) { WL.kw = e.target.value; renderWordList(); });
    renderWordList();
  };
  function renderWordList() {
    var kw = WL.kw.trim().toLowerCase(), t = today();
    var ws = allWords().filter(function (w) {
      if (WL.cat !== 'all' && w.cat !== WL.cat) return false;
      var st = cardState(w.id), c = store.cards[w.id];
      if (WL.st === 'due') { if (!c || c.due > t) return false; } else if (WL.st !== 'all' && st !== WL.st) return false;
      if (!kw) return true;
      return (w.w + ' ' + w.ja + ' ' + (w.alt || '') + ' ' + (w.de || '') + ' ' + (w.note || '')).toLowerCase().indexOf(kw) >= 0;
    });
    $('#wlCount').textContent = ws.length + '語';
    var shown = ws.slice(0, 400);
    $('#wlist').innerHTML = shown.length ? shown.map(function (w) {
      var st = cardState(w.id), open = WL.open === w.id;
      return '<li class="witem' + (open ? ' open' : '') + '" id="w-' + esc(w.id) + '">' +
        '<button type="button" class="wh" data-act="wOpen" data-id="' + esc(w.id) + '" aria-expanded="' + open + '">' +
        '<span class="st st-' + st + '" title="' + { 'new': '未学習', learning: '学習中', mature: '定着' }[st] + '"></span>' +
        '<span class="en ww">' + esc(w.w) + '</span><span class="pos small muted">' + esc(w.pos || '') + '</span><span class="wj">' + esc(w.ja) + '</span></button>' +
        (open ? '<div class="wbody">' + speakBtn(w.w, w.w + ' を読み上げ') + wordDetail(w) +
          '<div class="row small-gap">' + (store.cards[w.id] ? '<button class="btn small" data-act="wDueNow" data-id="' + esc(w.id) + '">今日の復習に入れる</button><button class="btn small ghost" data-act="wReset" data-id="' + esc(w.id) + '">学習記録を消す</button>' : '<button class="btn small" data-act="wDueNow" data-id="' + esc(w.id) + '">今日の復習に入れる</button>') +
          (w.custom ? '<button class="btn small danger" data-act="myDel" data-id="' + esc(w.id) + '">' + icon('trash') + ' マイ単語から削除</button>' : '') + '</div></div>' : '') +
        '</li>';
    }).join('') + (ws.length > shown.length ? '<li class="small muted" style="padding:10px">ほか ' + (ws.length - shown.length) + ' 語。検索で絞り込んでください。</li>' : '') : '<li class="empty">該当する単語はありません。</li>';
  }

  /* ---------- 4択チェック ---------- */
  var QZ = null;
  VIEWS.quiz = function (p) {
    if (!QZ || p.deck) {
      var deck = p.deck || 'all';
      var pool = WORDS.filter(function (w) { return deck === 'all' || w.cat === deck; });
      if (pool.length < 4) { go('#/words'); return; }
      // 学習中の語を優先し、足りなければ未学習から
      var learned = shuffle(pool.filter(function (w) { return store.cards[w.id]; }));
      var rest = shuffle(pool.filter(function (w) { return !store.cards[w.id]; }));
      var picks = learned.slice(0, 6).concat(rest).slice(0, 10);
      if (picks.length < 10) picks = picks.concat(shuffle(learned.slice(6))).slice(0, 10);
      QZ = { deck: deck, items: picks.map(function (w) {
        var same = pool.filter(function (x) { return x.id !== w.id && x.ja !== w.ja; });
        var bySub = same.filter(function (x) { return x.sub && x.sub === w.sub; });
        var ds = shuffle(bySub).slice(0, 3);
        if (ds.length < 3) ds = ds.concat(shuffle(same.filter(function (x) { return ds.indexOf(x) < 0; })).slice(0, 3 - ds.length));
        var opts = shuffle([w].concat(ds));
        return { id: w.id, opts: opts.map(function (x) { return x.id; }), pick: null };
      }), i: 0 };
      if (p.deck) { history.replaceState(null, '', '#/quiz'); }
    }
    renderQuiz();
  };
  function renderQuiz() {
    var Q = QZ, it = Q.items[Q.i];
    if (!it) { quizDone(); return; }
    var w = WBYID[it.id], answered = it.pick != null;
    setView('<div class="wrap narrow">' +
      '<div class="ptop"><a class="btn small ghost" href="#/words">' + icon('x') + ' 終える</a><span class="title small muted">4択チェック・' + esc(Q.deck === 'all' ? 'すべて' : CAT[Q.deck].name) + '</span><span class="small num">' + (Q.i + 1) + ' / ' + Q.items.length + '</span></div>' +
      '<div class="progress" aria-hidden="true"><i style="width:' + Math.round(Q.i / Q.items.length * 100) + '%"></i></div>' +
      '<div class="card qz"><p class="small muted">次の語の意味として最も適切なものはどれ？</p><div class="fc-w en">' + esc(w.w) + ' ' + speakBtn(w.w, w.w + ' を読み上げ') + '</div>' + (w.pos ? '<div class="fc-pos">' + esc(w.pos) + '</div>' : '') +
      '<ol class="opts">' + it.opts.map(function (oid, k) {
        var o = WBYID[oid], cls = '';
        if (answered) { if (oid === it.id) cls = ' correct done'; else if (oid === it.pick) cls = ' wrong done'; else cls = ' done'; }
        return '<li class="opt' + cls + '"><button type="button" class="opt-main" data-act="qzPick" data-id="' + esc(oid) + '"' + (answered ? ' disabled' : '') + '><span class="n">' + (k + 1) + '</span><span class="tx">' + esc(o.ja) + '</span></button></li>';
      }).join('') + '</ol>' +
      (answered ? '<div class="result-box ' + (it.pick === it.id ? 'ok' : 'ng') + '" tabindex="-1" id="qzRes"><div class="verdict"><span class="mk">' + icon(it.pick === it.id ? 'check' : 'x') + '</span>' + (it.pick === it.id ? '正解' : '不正解') + '</div>' + wordDetail(w) +
        (!store.cards[w.id] || it.pick !== it.id ? '<button class="btn small" data-act="wDueNow" data-id="' + esc(w.id) + '" style="margin-top:8px">今日の復習に入れる</button>' : '') + '</div>' +
        '<div class="row end" style="margin-top:14px"><button class="btn primary" data-act="qzNext" id="qzNext">' + (Q.i + 1 < Q.items.length ? '次へ' : '結果を見る') + ' <kbd>Enter</kbd></button></div>' : '') +
      '</div></div>');
    var f = $('#qzNext'); if (f) f.focus();
  }
  function quizDone() {
    var ok = QZ.items.filter(function (it) { return it.pick === it.id; }).length;
    logAdd('q');
    var wrong = QZ.items.filter(function (it) { return it.pick !== it.id; });
    setView('<div class="wrap narrow"><div class="card done-card"><h1 class="page">結果：' + ok + ' / ' + QZ.items.length + '</h1>' +
      (wrong.length ? '<p>間違えた語</p><ul class="rlist">' + wrong.map(function (it) { var w = WBYID[it.id]; return '<li><span class="mk"></span><span class="b"><span class="t en">' + esc(w.w) + '</span>　' + esc(w.ja) + '</span></li>'; }).join('') + '</ul>' +
        '<button class="btn primary" data-act="qzWrongDue" style="margin-top:12px">間違えた語を今日の復習に入れる</button>' : '<p>全問正解です。</p>') +
      '<div class="row" style="justify-content:center; margin-top:14px"><button class="btn" data-act="qzAgain">もう一度（別の10語）</button><a class="btn" href="#/words">単語へ戻る</a></div></div>' + footer() + '</div>');
  }
  function dueNow(id) {
    var c = store.cards[id];
    if (!c) { c = { iv: 0, ease: 2.5, reps: 0, lapses: 0, intro: today() }; addNewToday(); logAdd('n'); }
    c = Object.assign({}, c, { due: today(), iv: 0 });
    store.cards[id] = c; save();
  }

  /* ---------------------------------------------------------------------
     構文
     --------------------------------------------------------------------- */
  var GGROUPS = [];
  GRAMMAR.forEach(function (g) { if (GGROUPS.indexOf(g.grp) < 0) GGROUPS.push(g.grp); });
  function gDone(g) { var s = store.gram[g.id]; return !!(s && s.done); }
  VIEWS.grammar = function () {
    var done = GRAMMAR.filter(gDone).length;
    setView('<div class="wrap"><h1 class="page">構文</h1>' +
      '<p class="lead">専門書の英文は、単語を知っていても<strong>文の骨組み</strong>が見えないと訳せません。ここでは心理学・精神分析の文によく出る形を、例文と確認問題で一つずつ押さえます。上から順に進めるのがおすすめです。</p>' +
      '<div class="card"><div class="row between"><span>確認問題まで終えた項目</span><b class="num">' + done + ' / ' + GRAMMAR.length + '</b></div><div class="meter" aria-hidden="true"><i style="width:' + Math.round(done / Math.max(1, GRAMMAR.length) * 100) + '%"></i></div></div>' +
      '<details class="card legend-card"><summary>構造の記号の見方</summary>' + PARSE_LEGEND + '<p class="small muted">例：' + renderParse('[S|The patient] [V|described] [O|a dream] (*that* [v|had] [o|no clear ending]).') + '</p></details>' +
      GGROUPS.map(function (grp) {
        return '<h2 class="sec">' + esc(grp) + '</h2><ul class="glist">' + GRAMMAR.filter(function (g) { return g.grp === grp; }).map(function (g) {
          return '<li><a href="#/g?id=' + esc(g.id) + '" class="gitem"><span class="st ' + (gDone(g) ? 'st-mature' : 'st-new') + '"></span><span class="b"><span class="t">' + esc(g.t) + '</span><span class="d small muted">' + esc(g.lead) + '</span></span>' + icon('right') + '</a></li>';
        }).join('') + '</ul>';
      }).join('') + footer() + '</div>');
  };
  VIEWS.g = function (p) {
    var g = GBYID[p.id]; if (!g) { go('#/grammar'); return; }
    var st = store.gram[g.id] || { q: {} };
    var prev = GRAMMAR[g.idx - 1], next = GRAMMAR[g.idx + 1];
    setView('<div class="wrap narrow"><p class="crumb small"><a href="#/grammar">構文</a> › ' + esc(g.grp) + '</p>' +
      '<h1 class="page">' + esc(g.t) + '</h1><p class="lead">' + esc(g.lead) + '</p>' +
      '<div class="card prose gexp">' + fmt(g.exp) + '</div>' +
      '<h2 class="sec">例文</h2>' + g.ex.map(function (e, k) {
        var en = stripParse(e.p);
        return '<div class="card exs"><div class="row between"><span class="small muted">例 ' + (k + 1) + '</span>' + speakBtn(en, '例文を読み上げ') + '</div>' +
          '<p class="parse en">' + renderParse(e.p) + '</p><p class="ja">' + esc(e.ja) + '</p>' + (e.n ? '<p class="small note">' + fmt(e.n) + '</p>' : '') + '</div>';
      }).join('') +
      '<details class="legend-inline"><summary class="small">記号の見方</summary>' + PARSE_LEGEND + '</details>' +
      '<h2 class="sec">確認問題</h2>' + g.q.map(function (q, k) { return mcq('gq', g.id, k, q, st.q[k]); }).join('') +
      '<div class="pnav">' + (prev ? '<a class="btn prev" href="#/g?id=' + esc(prev.id) + '">' + icon('left') + ' ' + esc(prev.t) + '</a>' : '<span></span>') +
      (next ? '<a class="btn primary" href="#/g?id=' + esc(next.id) + '">' + esc(next.t) + ' ' + icon('right') + '</a>' : '<a class="btn primary" href="#/grammar">一覧へ</a>') + '</div>' +
      footer() + '</div>');
  };
  // 4択（構文・訳読の内容確認で共通）。q: {q, p?, o:[], a, e}
  function mcq(kind, owner, k, q, pick) {
    var answered = pick != null;
    return '<div class="card mcq" id="' + kind + '-' + k + '"><p class="mq"><span class="chip">Q' + (k + 1) + '</span> ' + fmt(q.q) + '</p>' +
      (q.p ? '<p class="parse en mq-en">' + esc(stripParse(q.p)) + '</p>' : '') +
      '<ol class="opts">' + q.o.map(function (o, i) {
        var cls = answered ? (i === q.a ? ' correct done' : i === pick ? ' wrong done' : ' done') : '';
        return '<li class="opt' + cls + '"><button type="button" class="opt-main" data-act="mcq" data-kind="' + kind + '" data-owner="' + esc(owner) + '" data-k="' + k + '" data-i="' + i + '"' + (answered ? ' disabled' : '') + '><span class="n">' + 'abcde'.charAt(i) + '</span><span class="tx' + (/[\u3040-\u30ff\u3400-\u9fff]/.test(o) ? '' : ' en') + '">' + fmt(o) + '</span></button></li>';
      }).join('') + '</ol>' +
      (answered ? '<div class="result-box ' + (pick === q.a ? 'ok' : 'ng') + '"><div class="verdict"><span class="mk">' + icon(pick === q.a ? 'check' : 'x') + '</span>' + (pick === q.a ? '正解' : '不正解（正解は ' + 'abcde'.charAt(q.a) + '）') + '</div>' +
        (q.p ? '<p class="parse en" style="margin:10px 0 4px">' + renderParse(q.p) + '</p>' : '') + (q.e ? '<p class="small" style="margin:6px 0 0">' + fmt(q.e) + '</p>' : '') + '</div>' : '') + '</div>';
  }

  /* ---------------------------------------------------------------------
     訳読
     --------------------------------------------------------------------- */
  function pState(id) { return store.pas[id] || (store.pas[id] = { rate: {}, tr: {}, q: {} }); }
  function pRated(p) { var st = store.pas[p.id]; return st ? Object.keys(st.rate || {}).length : 0; }
  function pDone(p) { var st = store.pas[p.id]; return !!(st && st.done); }
  VIEWS.read = function (p) {
    var lv = +(p.lv || store.settings.readLv || 1);
    if (p.lv) { store.settings.readLv = lv; save(); }
    var redo = redoList().length;
    setView('<div class="wrap"><h1 class="page">訳読</h1>' +
      '<p class="lead">一文ずつ<strong>構造をとって、自分の訳を書き、模範訳と比べる</strong>練習です。すべての文に、構造の解説・訳・語注がついています。文章はすべて学習用の書き下ろしです。</p>' +
      '<div class="seg lvseg" role="group" aria-label="レベル">' + LEVELS.map(function (L) {
        var ps = PASSAGES.filter(function (x) { return x.lv === L.lv; }), d = ps.filter(pDone).length;
        return '<button type="button" data-act="lvPick" data-v="' + L.lv + '" aria-pressed="' + (lv === L.lv) + '">' + esc(L.name) + ' <span class="small num">' + d + '/' + ps.length + '</span></button>';
      }).join('') + '</div>' +
      '<p class="small muted lvd">' + esc(LEVELS[lv - 1].d) + '</p>' +
      (redo ? '<a class="banner info" href="#/redo"><span class="bi">' + icon('redo') + '</span><span>見直す文が <b class="num">' + redo + '</b> 文あります（自己評価が △・× の文）</span><span class="spacer"></span>' + icon('right') + '</a>' : '') +
      '<ul class="plist">' + PASSAGES.filter(function (x) { return x.lv === lv; }).map(function (x) {
        var r = pRated(x), d = pDone(x);
        return '<li><a class="pitem" href="#/p?id=' + esc(x.id) + '"><span class="st ' + (d ? 'st-mature' : r ? 'st-learning' : 'st-new') + '"></span><span class="b">' +
          '<span class="t">' + esc(x.t) + '</span><span class="te en small">' + esc(x.te) + '</span>' +
          '<span class="m small muted">' + esc(x.tag) + '・' + x.s.length + '文・約' + x.wc + '語' + (x.fic ? '・<span class="fic">架空の研究要旨</span>' : '') + (r && !d ? '・' + r + '/' + x.s.length + '文 訳した' : '') + (d ? '・読了' : '') + '</span></span>' + icon('right') + '</a></li>';
      }).join('') + '</ul>' + footer() + '</div>');
  };
  var PV = { mode: 'read', open: {}, i: 0, showParse: null, showJa: false, reveal: false, hint: false };
  VIEWS.p = function (prm) {
    var p = PBYID[prm.id]; if (!p) { go('#/read'); return; }
    if (PV.id !== p.id) { PV = { id: p.id, mode: 'read', open: {}, i: 0, showParse: store.settings.showParse, showJa: false, reveal: false, hint: false }; }
    if (prm.m) PV.mode = prm.m === 'tr' ? 'tr' : 'read';
    if (prm.i != null && prm.i !== '') { PV.i = Math.max(0, Math.min(p.s.length - 1, +prm.i)); PV.reveal = false; PV.hint = false; }
    renderPassage(p);
  };
  function renderPassage(p) {
    var st = pState(p.id), L = LEVELS[p.lv - 1];
    var head = '<p class="crumb small"><a href="#/read?lv=' + p.lv + '">訳読</a> › ' + esc(L.name) + '</p>' +
      '<div class="phead"><div class="chips"><span class="chip acc">' + esc(L.name) + '</span><span class="chip">' + esc(p.tag) + '</span>' + (p.fic ? '<span class="chip warn">架空の研究要旨</span>' : '') + (st.done ? '<span class="chip ok">読了</span>' : '') + '</div>' +
      '<h1 class="page">' + esc(p.t) + '</h1><p class="en pte">' + esc(p.te) + '</p>' + (p.intro ? '<p class="small muted">' + fmt(p.intro) + '</p>' : '') + '</div>' +
      '<div class="ptools"><div class="seg" role="group" aria-label="モード"><button type="button" data-act="pMode" data-v="read" aria-pressed="' + (PV.mode === 'read') + '">' + icon('eye') + ' 通読</button><button type="button" data-act="pMode" data-v="tr" aria-pressed="' + (PV.mode === 'tr') + '">' + icon('note') + ' 訳読（一文ずつ訳す）</button></div>' +
      (TTS.ok && PV.mode === 'read' ? '<button type="button" class="btn small" data-act="readAll">' + icon('play') + ' 全文を読み上げ</button>' : '') + '</div>';
    var body = PV.mode === 'tr' ? trBody(p, st) : readBody(p, st);
    var gloss = p.w && p.w.length ? '<details class="card gloss"' + (PV.mode === 'tr' ? '' : ' open') + '><summary>語注（' + p.w.length + '）</summary><ul class="glosslist">' + p.w.map(function (w, k) {
      var added = store.custom.some(function (c) { return c.w === w[0] && c.src === p.t; }) || WORDS.some(function (x) { return x.w.toLowerCase() === w[0].toLowerCase() && store.cards[x.id]; });
      return '<li><span class="en gw">' + esc(w[0]) + '</span><span class="gj">' + esc(w[1]) + '</span>' + (added ? '<span class="small muted">追加済み</span>' : '<button type="button" class="btn small ghost" data-act="glossAdd" data-k="' + k + '" title="マイ単語に追加">' + icon('plus') + ' カード</button>') + '</li>';
    }).join('') + '</ul></details>' : '';
    var qs = p.q && p.q.length ? '<h2 class="sec">内容の確認</h2>' + p.q.map(function (q, k) { return mcq('pq', p.id, k, q, st.q[k]); }).join('') : '';
    var nextP = PASSAGES[p.idx + 1];
    var fin = '<div class="card finish"><div class="row between"><div><b>' + (st.done ? '読了済み（' + fmtDate(st.done) + '）' : 'この文章を読み終えたら') + '</b><div class="small muted">' + pRated(p) + ' / ' + p.s.length + ' 文を自分で訳しました。</div></div>' +
      (st.done ? '<button class="btn small ghost" data-act="pUndone">読了を取り消す</button>' : '<button class="btn primary" data-act="pDone">' + icon('check') + ' 読了にする</button>') + '</div></div>' +
      '<div class="pnav">' + (PASSAGES[p.idx - 1] ? '<a class="btn prev" href="#/p?id=' + esc(PASSAGES[p.idx - 1].id) + '">' + icon('left') + ' 前の文章</a>' : '<span></span>') +
      (nextP ? '<a class="btn" href="#/p?id=' + esc(nextP.id) + '">次の文章 ' + icon('right') + '</a>' : '<a class="btn" href="#/read">一覧へ</a>') + '</div>';
    setView('<div class="wrap narrow passage">' + head + body + gloss + qs + fin + footer() + '</div>');
    if (PV.mode === 'tr') { var ta = $('#trIn'); if (ta && !PV.reveal) ta.focus({ preventScroll: true }); }
  }
  function readBody(p, st) {
    return '<div class="ropts row"><label class="tgl small"><input type="checkbox" data-act="pShowParse"' + (PV.showParse ? ' checked' : '') + '><span>構造を表示</span></label>' +
      '<label class="tgl small"><input type="checkbox" data-act="pShowJa"' + (PV.showJa ? ' checked' : '') + '><span>訳を表示</span></label>' +
      '<span class="small muted">文をタップすると解説が開きます</span></div>' +
      (PV.showParse ? PARSE_LEGEND : '') +
      '<ol class="sents">' + p.s.map(function (s, k) {
        var open = !!PV.open[k], r = st.rate[k];
        return '<li class="sent' + (open ? ' open' : '') + '" id="s-' + k + '" data-k="' + k + '">' +
          '<button type="button" class="sent-main" data-act="sOpen" data-k="' + k + '" aria-expanded="' + open + '"><span class="sn num">' + (k + 1) + '</span>' +
          '<span class="se en">' + (PV.showParse || open ? renderParse(s.p) : esc(s.en)) + '</span>' + (r != null ? '<span class="rmark r' + r + '" title="自己評価">' + ['×', '△', '◎'][r] + '</span>' : '') + '</button>' +
          (PV.showJa && !open ? '<p class="sja">' + esc(s.ja) + '</p>' : '') +
          (open ? sentDetail(p, s, k, st) : '') + '</li>';
      }).join('') + '</ol>';
  }
  function sentDetail(p, s, k, st) {
    return '<div class="sdet">' +
      '<div class="row small-gap">' + speakBtn(s.en, (k + 1) + '文目を読み上げ') + speakBtn(s.en, (k + 1) + '文目をゆっくり読み上げ', true) +
      '<a class="btn small ghost" href="#/p?id=' + esc(p.id) + '&m=tr&i=' + k + '">' + icon('note') + ' この文を訳す</a></div>' +
      (s.lit ? '<p class="lab small">直訳</p><p class="ja lit">' + esc(s.lit) + '</p>' : '') +
      '<p class="lab small">' + (s.lit ? '自然な訳' : '訳') + '</p><p class="ja">' + esc(s.ja) + '</p>' +
      (s.n && s.n.length ? '<p class="lab small">解説</p><ul class="snotes">' + s.n.map(function (n) { return '<li>' + fmt(n) + '</li>'; }).join('') + '</ul>' : '') +
      (s.g && s.g.length ? '<p class="small">関連する構文：' + s.g.map(function (gid) { var g = GBYID[gid]; return g ? '<a href="#/g?id=' + esc(gid) + '">' + esc(g.t) + '</a>' : ''; }).join('、') + '</p>' : '') +
      (st.tr[k] ? '<p class="lab small">あなたの訳</p><p class="ja mine">' + esc(st.tr[k]) + '</p>' : '') + '</div>';
  }
  function trBody(p, st) {
    var k = PV.i, s = p.s[k], mine = st.tr[k] || '', r = st.rate[k];
    var dots = '<div class="sdots" role="group" aria-label="文を選ぶ">' + p.s.map(function (x, i) {
      var rr = st.rate[i];
      return '<button type="button" data-act="trGo" data-k="' + i + '" class="' + (i === k ? 'cur ' : '') + (rr != null ? 'r' + rr : '') + '" aria-label="' + (i + 1) + '文目' + (rr != null ? '（' + ['×', '△', '◎'][rr] + '）' : '') + '">' + (i + 1) + '</button>';
    }).join('') + '</div>';
    return dots +
      '<div class="card trcard"><div class="row between"><span class="small muted">' + (k + 1) + ' / ' + p.s.length + ' 文目</span><span class="row small-gap">' + speakBtn(s.en, '読み上げ') + speakBtn(s.en, 'ゆっくり読み上げ', true) + '</span></div>' +
      '<p class="tr-en en">' + (PV.hint || PV.reveal ? renderParse(s.p) : esc(s.en)) + '</p>' +
      (PV.hint && !PV.reveal ? PARSE_LEGEND : '') +
      '<label class="lab small" for="trIn">自分の訳</label>' +
      '<textarea class="inp" id="trIn" rows="3" data-pid="' + esc(p.id) + '" data-k="' + k + '" placeholder="主語と動詞を見つけてから、まず直訳で。">' + esc(mine) + '</textarea>' +
      (PV.reveal ? '' : '<div class="row"><button class="btn" data-act="trHint">' + icon('tree') + ' ヒント：構造を見る</button><button class="btn primary" data-act="trReveal">答え合わせ <kbd>Ctrl+Enter</kbd></button></div>') +
      (PV.reveal ? '<div class="answer">' +
        (s.lit ? '<p class="lab small">直訳</p><p class="ja lit">' + esc(s.lit) + '</p>' : '') +
        '<p class="lab small">' + (s.lit ? '自然な訳' : '訳') + '</p><p class="ja">' + esc(s.ja) + '</p>' +
        (s.n && s.n.length ? '<p class="lab small">解説</p><ul class="snotes">' + s.n.map(function (n) { return '<li>' + fmt(n) + '</li>'; }).join('') + '</ul>' : '') +
        (s.g && s.g.length ? '<p class="small">関連する構文：' + s.g.map(function (gid) { var g = GBYID[gid]; return g ? '<a href="#/g?id=' + esc(gid) + '">' + esc(g.t) + '</a>' : ''; }).join('、') + '</p>' : '') +
        '<p class="lab small">自分の訳はどうでしたか</p><div class="rates" role="group" aria-label="自己評価">' +
        [[2, '◎', '構造も意味もとれた'], [1, '△', '一部あやしい'], [0, '×', 'とれなかった']].map(function (x) {
          return '<button type="button" class="rbtn r' + x[0] + '" data-act="trRate" data-v="' + x[0] + '" aria-pressed="' + (r === x[0]) + '"><b>' + x[1] + '</b><span>' + x[2] + '</span></button>';
        }).join('') + '</div></div>' : '') + '</div>';
  }
  function redoList() {
    var out = [];
    PASSAGES.forEach(function (p) {
      var st = store.pas[p.id]; if (!st || !st.rate) return;
      Object.keys(st.rate).forEach(function (k) { if (st.rate[k] < 2) out.push({ p: p, k: +k, r: st.rate[k] }); });
    });
    return out;
  }
  VIEWS.redo = function () {
    var list = redoList();
    setView('<div class="wrap narrow"><p class="crumb small"><a href="#/read">訳読</a> › 見直す文</p><h1 class="page">見直す文</h1>' +
      '<p class="lead">訳読で △・× をつけた文です。もう一度訳して ◎ にすると、この一覧から消えます。</p>' +
      (list.length ? '<ul class="rlist redo">' + list.map(function (x) {
        var s = x.p.s[x.k];
        return '<li><span class="rmark r' + x.r + '">' + ['×', '△', '◎'][x.r] + '</span><a class="b" href="#/p?id=' + esc(x.p.id) + '&m=tr&i=' + x.k + '"><span class="t en">' + esc(s.en) + '</span><span class="small muted">' + esc(x.p.t) + '・' + (x.k + 1) + '文目</span></a></li>';
      }).join('') + '</ul>' : '<div class="empty">見直す文はありません。</div>') + footer() + '</div>');
  };
  // 全文の読み上げ（文ごとに区切って、読んでいる文を強調）
  function readAll(p) {
    if (TTS.playing) { stopSpeech(); return; }
    TTS.playing = p.id;
    $all('[data-act="readAll"]').forEach(function (b) { b.innerHTML = icon('stop') + ' 止める'; });
    var k = 0;
    (function next() {
      if (TTS.playing !== p.id) return;
      $all('.sent.speaking').forEach(function (el) { el.classList.remove('speaking'); });
      if (k >= p.s.length) { stopSpeech(); return; }
      var el = $('#s-' + k); if (el) { el.classList.add('speaking'); }
      var text = p.s[k].en; k++;
      speak(text, { onend: function () { setTimeout(next, 250); } });
    })();
  }

  /* ---------------------------------------------------------------------
     予習ノート（講読会などで読んでいる文献の予習用。内容はこの端末にだけ保存）
     --------------------------------------------------------------------- */
  function noteById(id) { return store.notes.filter(function (n) { return n.id === id; })[0]; }
  VIEWS.notes = function () {
    var ns = store.notes.slice().sort(function (a, b) { return b.upd - a.upd; });
    setView('<div class="wrap"><h1 class="page">予習ノート</h1>' +
      '<p class="lead">講読会やゼミで読んでいる文献を、<strong>一文ずつ「構造メモ → 自分の訳 → 疑問点」</strong>の形で予習するノートです。当日に直した訳も書き残せます。分からない語は「マイ単語」としてカードに追加できます。</p>' +
      '<div class="notice"><strong>保存先：</strong>ノートの内容は、この端末のブラウザの中にだけ保存されます（どこにも送信されません）。機種変更やブラウザのデータ消去に備えて、「記録」から書き出しておくと安心です。</div>' +
      '<div class="row" style="margin:16px 0"><button class="btn primary" data-act="noteNew">' + icon('plus') + ' 新しいノート</button></div>' +
      (ns.length ? '<ul class="nlist">' + ns.map(function (n) {
        var done = n.items.filter(function (it) { return (it.tr || '').trim(); }).length;
        return '<li><a class="nitem" href="#/n?id=' + esc(n.id) + '"><span class="b"><span class="t">' + esc(n.title || '無題のノート') + '</span><span class="small muted">' + esc(n.src || '') + (n.src ? '・' : '') + n.items.length + '文（訳 ' + done + '）・更新 ' + fmtDate(n.upd) + '</span></span>' + icon('right') + '</a></li>';
      }).join('') + '</ul>' : '<div class="empty">まだノートはありません。「新しいノート」から、読んでいる箇所の英文を貼り付けて始めましょう。</div>') +
      '<h2 class="sec">予習の進め方（1回40分の例）</h2><ol class="steps">' +
      '<li><b>5分</b>：担当範囲の英文を貼り付けて文に分け、全体をざっと読む（分からない語に印をつけるだけ）。</li>' +
      '<li><b>15分</b>：一文ずつ、動詞を探し → 主語を決め → 修飾のかたまりを（ ）〈 〉でくくる。構造メモ欄に書く。</li>' +
      '<li><b>15分</b>：まず直訳、そのあと日本語として自然な訳に直す。訳語に迷った専門用語は「単語」で検索。</li>' +
      '<li><b>5分</b>：どうしても分からない点を「疑問点」に一行で書く。当日はそこだけ聞けばよい状態にする。</li></ol>' +
      footer() + '</div>');
  };
  VIEWS.n = function (p) {
    var n = noteById(p.id); if (!n) { go('#/notes'); return; }
    setView('<div class="wrap narrow note-ed"><p class="crumb small"><a href="#/notes">予習ノート</a> › 編集</p>' +
      '<div class="card"><div class="field"><label class="lab" for="nTitle">ノートの名前</label><input class="inp" id="nTitle" data-nf="title" value="' + esc(n.title) + '" placeholder="例：講読会 第3回の予習"></div>' +
      '<div class="field"><label class="lab" for="nSrc">文献・範囲</label><input class="inp" id="nSrc" data-nf="src" value="' + esc(n.src || '') + '" placeholder="例：書名 pp. 12–14"></div></div>' +
      '<details class="card paste"' + (n.items.length ? '' : ' open') + '><summary>' + icon('plus') + ' 英文を貼り付けて追加</summary>' +
      '<textarea class="inp en" id="nPaste" rows="5" placeholder="Paste the English text here. 文の区切り（. ? !）で自動的に一文ずつに分けます。"></textarea>' +
      '<div class="row"><button class="btn primary" data-act="nSplit">文に分けて追加</button><button class="btn" data-act="nAddOne">一文として追加</button></div>' +
      '<p class="small muted">e.g. / i.e. / et al. / cf. / pp. などの略語の後では区切りません。区切りがずれたら各文の欄で直せます。</p></details>' +
      (n.items.length ? '<div class="row between ntools"><span class="small muted">' + n.items.length + '文</span><span class="row small-gap">' +
        '<button class="btn small" data-act="nPrint">' + icon('print') + ' 印刷</button><button class="btn small" data-act="nText">' + icon('down') + ' テキストで保存</button></span></div>' : '') +
      '<ol class="nitems">' + n.items.map(function (it, k) { return noteItem(n, it, k); }).join('') + '</ol>' +
      '<div class="card"><h3>分からない語をマイ単語に追加</h3><div class="row nword"><input class="inp en" id="nwW" placeholder="英語（例：estrangement）" aria-label="英語"><input class="inp" id="nwJ" placeholder="意味（例：疎隔、異化）" aria-label="意味"><button class="btn" data-act="nWordAdd">' + icon('plus') + ' 追加</button></div>' +
      '<p class="small muted">追加した語は「単語」の「マイ単語」に入り、カードで復習できます。</p></div>' +
      '<div class="row between" style="margin-top:20px"><a class="btn" href="#/notes">' + icon('left') + ' 一覧へ</a><button class="btn danger" data-act="nDel">' + icon('trash') + ' このノートを削除</button></div>' +
      footer() + '</div>');
  };
  function noteItem(n, it, k) {
    return '<li class="card nit" data-k="' + k + '"><div class="row between"><span class="chip">' + (k + 1) + '</span><span class="row small-gap">' + speakBtn(it.en, (k + 1) + '文目を読み上げ') +
      '<button type="button" class="iconbtn" data-act="nUp" data-k="' + k + '" aria-label="上へ" title="上へ"' + (k ? '' : ' disabled') + '>↑</button>' +
      '<button type="button" class="iconbtn" data-act="nItemDel" data-k="' + k + '" aria-label="この文を削除" title="この文を削除">' + icon('trash') + '</button></span></div>' +
      '<label class="lab small">英文</label><textarea class="inp en" rows="2" data-ni="en" data-k="' + k + '">' + esc(it.en) + '</textarea>' +
      '<label class="lab small">構造メモ <span class="muted">例：[S …] [V …] (関係詞節) 〈副詞句〉</span></label><textarea class="inp" rows="2" data-ni="st" data-k="' + k + '">' + esc(it.st || '') + '</textarea>' +
      '<label class="lab small">自分の訳</label><textarea class="inp" rows="2" data-ni="tr" data-k="' + k + '">' + esc(it.tr || '') + '</textarea>' +
      '<label class="lab small">疑問点・当日のメモ</label><textarea class="inp" rows="2" data-ni="q" data-k="' + k + '">' + esc(it.q || '') + '</textarea>' +
      '<label class="lab small">当日に直した訳</label><textarea class="inp" rows="2" data-ni="fx" data-k="' + k + '">' + esc(it.fx || '') + '</textarea></li>';
  }
  var noteDirty = null;
  function flushNote() { if (noteDirty) { noteDirty.upd = Date.now(); noteDirty = null; save(true); } }
  // 文の区切りと見なさない略語（文頭に来るものは大文字の形も入れる）
  var ABBR = ['e.g.', 'E.g.', 'i.e.', 'I.e.', 'et al.', 'cf.', 'Cf.', 'ibid.', 'Ibid.', 'pp.', 'p.', 'vs.', 'Dr.', 'Mr.', 'Mrs.', 'Ms.', 'Prof.', 'St.', 'ch.', 'Ch.', 'vol.', 'Vol.', 'No.', 'Fig.', 'ed.', 'eds.', 'trans.', 'approx.', 'ca.', 'viz.'];
  function splitSentences(text) {
    var t = text.replace(/\r/g, '').replace(/-\n(?=[a-z])/g, '').replace(/\s*\n\s*/g, ' ').replace(/\s+/g, ' ').trim();
    if (!t) return [];
    // 略語のピリオドだけを一時的に別の文字に置き換える（略語の直前で文が切れるのは妨げない）
    ABBR.forEach(function (a) {
      var re = new RegExp('(^|[\\s(\\[])' + a.replace(/\./g, '\\.'), 'g');
      t = t.replace(re, function (m0, pre) { return pre + a.replace(/\./g, '\u0001'); });
    });
    // 後読み（?<=）は古いSafariで構文エラーになるため使わない
    var parts = t.replace(/([.!?][)"'”’\]]*)\s+(?=["'“‘(\[]?[A-Z0-9])/g, '$1\u0002').split('\u0002');
    return parts.map(function (s) { return s.replace(/\u0001/g, '.').trim(); }).filter(Boolean);
  }
  function noteText(n) {
    var lines = ['■ ' + (n.title || '無題のノート') + (n.src ? '（' + n.src + '）' : ''), ''];
    n.items.forEach(function (it, k) {
      lines.push('【' + (k + 1) + '】' + it.en);
      if ((it.st || '').trim()) lines.push('　構造：' + it.st.trim());
      if ((it.tr || '').trim()) lines.push('　訳　：' + it.tr.trim());
      if ((it.q || '').trim()) lines.push('　疑問：' + it.q.trim());
      if ((it.fx || '').trim()) lines.push('　修正：' + it.fx.trim());
      lines.push('');
    });
    return lines.join('\n');
  }
  function download(name, text, type) {
    var blob = new Blob([text], { type: type || 'text/plain;charset=utf-8' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function addCustom(w, ja, ex, src) {
    w = (w || '').trim(); ja = (ja || '').trim();
    if (!w || !ja) { toast('英語と意味の両方を入れてください'); return false; }
    if (store.custom.some(function (c) { return c.w.toLowerCase() === w.toLowerCase() && c.ja === ja; })) { toast('すでにマイ単語にあります'); return false; }
    store.custom.push({ id: uid('my-'), w: w, ja: ja, ex: ex || '', src: src || '', ts: Date.now() });
    save(); toast('マイ単語に追加しました：' + w); return true;
  }

  /* ---------------------------------------------------------------------
     学び方（ガイド）
     --------------------------------------------------------------------- */
  VIEWS.guide = function () {
    var secs = GUIDE.sections || [];
    setView('<div class="wrap narrow"><h1 class="page">学び方</h1><p class="lead">' + fmt(GUIDE.lead || '') + '</p>' +
      '<nav class="card toc" aria-label="目次"><ol>' + secs.map(function (s, i) { return '<li><a href="#/guide?keep=1" data-act="toc" data-i="' + i + '">' + esc(s.t) + '</a></li>'; }).join('') + '</ol></nav>' +
      secs.map(function (s, i) { return '<section class="card prose guide-sec" id="gs-' + i + '"><h2>' + esc(s.t) + '</h2>' + s.html + '</section>'; }).join('') +
      footer() + '</div>');
  };

  /* ---------------------------------------------------------------------
     記録・設定・メニュー
     --------------------------------------------------------------------- */
  function streak() {
    var n = 0, k = today();
    if (!store.log[k]) k = addDays(k, -1);
    while (store.log[k]) { n++; k = addDays(k, -1); }
    return n;
  }
  function dayTotal(l) { return l ? (l.c || 0) + (l.s || 0) * 3 + (l.g || 0) * 3 + (l.q || 0) * 5 : 0; }
  VIEWS.stats = function () {
    var learned = Object.keys(store.cards).length, mature = Object.keys(store.cards).filter(function (id) { return store.cards[id].iv >= 21; }).length;
    var pd = PASSAGES.filter(pDone).length, gd = GRAMMAR.filter(gDone).length;
    var sents = 0; Object.keys(store.pas).forEach(function (id) { sents += Object.keys(store.pas[id].rate || {}).length; });
    var days = [], k = addDays(today(), -27), max = 1;
    for (var i = 0; i < 28; i++) { var l = store.log[k]; days.push({ k: k, l: l }); max = Math.max(max, dayTotal(l)); k = addDays(k, 1); }
    setView('<div class="wrap"><h1 class="page">学習記録</h1>' +
      '<div class="kpis k4"><div class="kpi"><div class="k">連続学習</div><div class="v num">' + streak() + '<small>日</small></div></div>' +
      '<div class="kpi"><div class="k">学習した単語</div><div class="v num">' + learned + '<small>/' + allWords().length + '</small></div></div>' +
      '<div class="kpi"><div class="k">定着（21日以上）</div><div class="v num">' + mature + '<small>語</small></div></div>' +
      '<div class="kpi"><div class="k">訳した文</div><div class="v num">' + sents + '<small>文</small></div></div></div>' +
      '<h2 class="sec">この4週間</h2><div class="card"><div class="daychart" role="img" aria-label="日ごとの学習量">' + days.map(function (d) {
        var l = d.l || {}, tot = dayTotal(d.l);
        return '<div class="d" data-tip="' + d.k.slice(5).replace('-', '/') + '：カード' + (l.c || 0) + '・訳' + (l.s || 0) + '文"><i style="height:' + Math.round(tot / max * 100) + '%"></i></div>';
      }).join('') + '</div><div class="dayaxis"><span>' + days[0].k.slice(5).replace('-', '/') + '</span><span>今日</span></div></div>' +
      '<h2 class="sec">分野別の単語</h2><div class="card bars">' + CATS.map(function (c) {
        var ws = deckWords(c.id); if (!ws.length) return '';
        var n = ws.filter(function (w) { return store.cards[w.id]; }).length;
        return '<div class="brow"><span class="lab">' + esc(c.name) + '</span><span class="meter"><i style="width:' + Math.round(n / ws.length * 100) + '%"></i></span><span class="val num">' + n + '/' + ws.length + '</span></div>';
      }).join('') + '</div>' +
      '<h2 class="sec">訳読・構文</h2><div class="card bars">' + LEVELS.map(function (L) {
        var ps = PASSAGES.filter(function (x) { return x.lv === L.lv; }), n = ps.filter(pDone).length;
        return '<div class="brow"><span class="lab">訳読・' + esc(L.name) + '</span><span class="meter"><i style="width:' + Math.round(n / Math.max(1, ps.length) * 100) + '%"></i></span><span class="val num">' + n + '/' + ps.length + '</span></div>';
      }).join('') + '<div class="brow"><span class="lab">構文</span><span class="meter"><i style="width:' + Math.round(gd / Math.max(1, GRAMMAR.length) * 100) + '%"></i></span><span class="val num">' + gd + '/' + GRAMMAR.length + '</span></div></div>' +
      '<h2 class="sec">データ</h2><div class="card"><p class="small">学習記録・予習ノート・マイ単語は、このブラウザの中だけに保存されています。別の端末へ移すときや、念のための控えとして書き出せます。</p>' +
      '<div class="row"><button class="btn" data-act="export">' + icon('down') + ' 書き出す（JSON）</button><label class="btn">読み込む<input type="file" id="impFile" accept="application/json,.json" hidden></label><a class="btn" href="#/settings">' + icon('gear') + ' 設定</a></div></div>' +
      footer() + '</div>');
    var f = $('#impFile'); if (f) f.addEventListener('change', importData);
  };
  VIEWS.settings = function () {
    var st = store.settings;
    var seg = function (key, v, label, cur) { return '<button type="button" data-act="set" data-k="' + key + '" data-v="' + v + '" aria-pressed="' + (String(cur) === String(v)) + '">' + label + '</button>'; };
    setView('<div class="wrap narrow"><h1 class="page">設定</h1><div class="card">' +
      '<div class="field"><span class="lab">テーマ</span><div class="seg">' + seg('theme', 'auto', '端末に合わせる', st.theme) + seg('theme', 'light', 'ライト', st.theme) + seg('theme', 'dark', 'ダーク', st.theme) + '</div></div>' +
      '<div class="field"><span class="lab">文字の大きさ</span><div class="seg">' + seg('font', 's', '小', st.font) + seg('font', 'm', '標準', st.font) + seg('font', 'l', '大', st.font) + seg('font', 'xl', '特大', st.font) + '</div></div>' +
      '<div class="field"><span class="lab">1日の新しい単語の上限</span><div class="seg">' + [5, 10, 15, 20, 30].map(function (n) { return seg('newPerDay', n, n + '語', st.newPerDay); }).join('') + '</div><p class="small muted">続けやすさを優先して、最初は10語前後がおすすめです。</p></div>' +
      '<div class="field"><span class="lab">カードの向き</span><div class="seg">' + seg('dir', 'en', '英語 → 意味', st.dir) + seg('dir', 'ja', '意味 → 英語', st.dir) + seg('dir', 'mix', 'まぜる', st.dir) + '</div></div>' +
      '<div class="field"><span class="lab">通読で最初から構造を表示</span><div class="seg">' + seg('showParse', 'false', 'しない', String(st.showParse)) + seg('showParse', 'true', 'する', String(st.showParse)) + '</div></div>' +
      (TTS.ok ? '<div class="field"><label class="lab" for="voiceSel">読み上げの声</label><select class="inp" id="voiceSel"><option value="">自動（英語）</option>' + TTS.voices.map(function (v) { return '<option value="' + esc(v.name) + '"' + (v.name === st.voice ? ' selected' : '') + '>' + esc(v.name + '（' + v.lang + '）') + '</option>'; }).join('') + '</select>' +
        (TTS.voices.length ? '' : '<p class="small muted">英語の声が見つかりません。端末の設定で英語の音声を追加すると、読み上げが自然になります。</p>') + '</div>' +
        '<div class="field"><label class="lab" for="rateIn">読み上げの速さ <span id="rateV" class="num">' + Number(st.rate).toFixed(2) + '</span>倍</label><input id="rateIn" type="range" min="0.6" max="1.3" step="0.05" value="' + st.rate + '" style="width:100%"><div class="row"><button class="btn small" data-act="say" data-t="Reading slowly is often the fastest way to understand a difficult text.">試しに聞く</button></div></div>'
        : '<p class="small muted">このブラウザは読み上げ（音声合成）に対応していません。</p>') +
      '</div><h2 class="sec">記録の消去</h2><div class="card"><p class="small">単語カード・訳読・構文の記録を消します（予習ノートとマイ単語は残ります）。</p><button class="btn danger" data-act="resetProgress">学習記録を消す</button></div>' +
      footer() + '</div>');
    var vs = $('#voiceSel'); if (vs) vs.addEventListener('change', function () { store.settings.voice = vs.value; save(); speak('Hello. This is the reading voice.'); });
    var ri = $('#rateIn'); if (ri) ri.addEventListener('input', function () { store.settings.rate = +ri.value; $('#rateV').textContent = (+ri.value).toFixed(2); save(); });
  };
  VIEWS.more = function () {
    var item = function (h, ic, t, d) { return '<li><a href="' + h + '"><span class="ic">' + icon(ic) + '</span><span>' + t + '<span class="d">' + d + '</span></span></a></li>'; };
    setView('<div class="wrap narrow"><h1 class="page">メニュー</h1><ul class="morelist">' +
      item('#/grammar', 'tree', '構文', '専門書によく出る文の形を例文と確認問題で') +
      item('#/quiz?deck=all', 'quiz', '4択チェック', '単語の意味を10問で確認') +
      item('#/redo', 'redo', '見直す文', '訳読で △・× をつけた文') +
      item('#/guide', 'compass', '学び方', '40分の進め方、精神分析の訳語、資料の探し方') +
      item('#/stats', 'chart', '学習記録', '連続日数、単語・訳読の進み具合、書き出し') +
      item('#/settings', 'gear', '設定', 'テーマ、文字の大きさ、読み上げの声と速さ') +
      '</ul>' + footer() + '</div>');
  };

  /* ---------------------------------------------------------------------
     ホーム
     --------------------------------------------------------------------- */
  function nextPassage() {
    var started = PASSAGES.filter(function (p) { return !pDone(p) && pRated(p) > 0; })[0];
    return started || PASSAGES.filter(function (p) { return !pDone(p); })[0] || null;
  }
  VIEWS.home = function () {
    var due = dueList('all').length, nq = Math.min(newQuota(), newList('all').length);
    var np = nextPassage(), redo = redoList().length, tl = store.log[today()] || {};
    var cardsDoneToday = (tl.c || 0) > 0 && due === 0;
    var step = function (n, done, t, d, act) {
      return '<li class="tstep' + (done ? ' done' : '') + '"><span class="tn">' + (done ? icon('check') : n) + '</span><span class="b"><span class="t">' + t + '</span><span class="d small muted">' + d + '</span></span>' + act + '</li>';
    };
    setView('<div class="wrap">' +
      '<section class="card hero-pe"><p class="eyebrow small">心理学・精神分析の英語を読む</p><h1>今日の40分</h1>' +
      '<p class="small muted">平日は40分を目安に。時間のない日や疲れた日は、①の単語カードだけで十分です。</p>' +
      '<ol class="tsteps">' +
      step(1, cardsDoneToday, '単語カード（5〜10分）', '復習 ' + due + '枚・新しい単語 ' + nq + '語', '<button class="btn primary small" data-act="cardsStart" data-deck="all">始める</button>') +
      step(2, !!(tl.s), '訳読（20分）', np ? '次は「' + esc(np.t) + '」（' + esc(LEVELS[np.lv - 1].name) + '・' + np.s.length + '文）' : 'すべて読了しました', np ? '<a class="btn small" href="#/p?id=' + esc(np.id) + '&m=tr">訳す</a>' : '') +
      step(3, false, 'ふり返り（10分）', redo ? '△・× の文が ' + redo + ' 文。もう一度訳してみる' : '訳した文の模範訳と自分の訳を見比べ、違いを一つ言葉にする', '<a class="btn small" href="' + (redo ? '#/redo' : '#/read') + '">開く</a>') +
      step(4, false, 'メモ（5分）', '分からなかった点を一行で残す。講読会の予習もここで', '<a class="btn small" href="#/notes">ノート</a>') +
      '</ol>' +
      (window.StudyLink ? '<div class="row" style="margin-top:12px"><button class="btn small" data-act="studySend">今日の分を勉強シートに送る</button></div>' : '') +
      '</section>' +
      '<div class="kpis k4"><div class="kpi"><div class="k">連続学習</div><div class="v num">' + streak() + '<small>日</small></div></div>' +
      '<div class="kpi"><div class="k">学習した単語</div><div class="v num">' + Object.keys(store.cards).length + '<small>/' + allWords().length + '</small></div></div>' +
      '<div class="kpi"><div class="k">読了した文章</div><div class="v num">' + PASSAGES.filter(pDone).length + '<small>/' + PASSAGES.length + '</small></div></div>' +
      '<div class="kpi"><div class="k">構文</div><div class="v num">' + GRAMMAR.filter(gDone).length + '<small>/' + GRAMMAR.length + '</small></div></div></div>' +
      '<h2 class="sec">学ぶ</h2><div class="modes">' +
      '<a class="mode" href="#/words"><span class="ic">' + icon('cards') + '</span><span class="t">単語</span><span class="d">学術英語・心理学・精神分析の用語と、文献の言い回し。訳語の揺れや原語も。</span><span class="n">' + WORDS.length + '語</span></a>' +
      '<a class="mode" href="#/grammar"><span class="ic">' + icon('tree') + '</span><span class="t">構文</span><span class="d">長い主語、関係詞、分詞構文、名詞構文、倒置など、専門書の文の形。</span><span class="n">' + GRAMMAR.length + '項目</span></a>' +
      '<a class="mode" href="#/read"><span class="ic">' + icon('book') + '</span><span class="t">訳読</span><span class="d">基礎・標準・専門の3段階。全文に構造の解説・訳・語注。</span><span class="n">' + PASSAGES.length + '本・' + PASSAGES.reduce(function (n, p) { return n + p.s.length; }, 0) + '文</span></a>' +
      '<a class="mode" href="#/notes"><span class="ic">' + icon('note') + '</span><span class="t">予習ノート</span><span class="d">講読会で読んでいる英文を一文ずつ、構造メモ・訳・疑問点で予習。</span><span class="n">' + store.notes.length + '冊</span></a>' +
      '<a class="mode" href="#/guide"><span class="ic">' + icon('compass') + '</span><span class="t">学び方</span><span class="d">専門書の読み方、精神分析の訳語対照、外部試験との両立。</span><span class="n">読む</span></a>' +
      '<a class="mode" href="#/stats"><span class="ic">' + icon('chart') + '</span><span class="t">学習記録</span><span class="d">連続日数と進み具合。データの書き出し・読み込み。</span><span class="n">見る</span></a>' +
      '</div>' +
      '<div class="notice" style="margin-top:18px"><strong>このページについて：</strong>英文・例文・訳はすべて学習用に独自に作成したものです（実在の文献からの引用ではありません）。研究の要旨の形をした文章は<strong>架空</strong>のもので、その旨を表示しています。専門用語の訳語は、代表的なものと別訳を併記しています。訳書・事典によって訳語が異なることがあります。</div>' +
      footer() + '</div>');
  };

  /* ---------------------------------------------------------------------
     書き出し・読み込み
     --------------------------------------------------------------------- */
  function exportData() {
    download('psyeng-backup-' + today() + '.json', JSON.stringify({ app: APP.key, v: 1, exported: new Date().toISOString(), store: store }, null, 1), 'application/json');
    toast('書き出しました');
  }
  function importData(e) {
    var f = e.target.files && e.target.files[0]; if (!f) return;
    var r = new FileReader();
    r.onload = function () {
      var d;
      try { d = JSON.parse(r.result); } catch (err) { toast('読み込めませんでした（JSONではありません）'); return; }
      if (!d || d.app !== APP.key || !d.store) {
        toast(d && typeof d.app === 'string' && d.app !== APP.key ? '別のアプリの書き出しファイルです' : 'このページの書き出しファイルではありません');
        return;
      }
      confirmBox('読み込み', '<p>現在の記録を、ファイルの内容で置き換えます。よろしいですか？</p>', '置き換える', function () {
        var base = defaults(), s = d.store;
        Object.keys(base).forEach(function (k) { if (s[k] == null) s[k] = base[k]; });
        s.settings = Object.assign(base.settings, s.settings || {});
        store = s; save(true); applyLook(); toast('読み込みました'); route();
      });
    };
    r.readAsText(f);
    e.target.value = '';
  }

  /* ---------------------------------------------------------------------
     操作（クリックの委譲）
     --------------------------------------------------------------------- */
  var ACT = {
    skip: function (el, e) { e.preventDefault(); var m = $('#main'); m.focus(); m.scrollIntoView(); },
    say: function (el) { speak(el.getAttribute('data-t'), { slow: el.getAttribute('data-slow') === '1' }); },
    cardsStart: function (el) { startCards(el.getAttribute('data-deck') || 'all'); },
    cardsQuit: function () { cardsDone(); },
    reveal: function () { if (CS) { CS.shown = true; VIEWS.cards(); } },
    grade: function (el) { gradeCard(+el.getAttribute('data-g')); },
    wlCat: function (el) { WL.cat = el.getAttribute('data-v'); VIEWS.words({}); },
    wlSt: function (el) { WL.st = el.getAttribute('data-v'); $all('[data-act="wlSt"]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === el)); }); renderWordList(); },
    wOpen: function (el) { var id = el.getAttribute('data-id'); WL.open = WL.open === id ? '' : id; renderWordList(); var li = $('#w-' + CSS.escape(id)); if (li) { var b = li.querySelector('.wh'); if (b) b.focus(); } },
    wDueNow: function (el) { dueNow(el.getAttribute('data-id')); toast('今日の復習に入れました'); if (current.name === 'words') renderWordList(); },
    wReset: function (el) { var id = el.getAttribute('data-id'); delete store.cards[id]; save(); toast('この語の学習記録を消しました'); renderWordList(); },
    myDel: function (el) {
      var id = el.getAttribute('data-id');
      confirmBox('マイ単語から削除', '<p>この語を削除します。よろしいですか？</p>', '削除', function () {
        store.custom = store.custom.filter(function (c) { return c.id !== id; }); delete store.cards[id]; save(); renderWordList();
      }, true);
    },
    qzPick: function (el) { var it = QZ.items[QZ.i]; if (it.pick != null) return; it.pick = el.getAttribute('data-id'); renderQuiz(); },
    qzNext: function () { QZ.i++; renderQuiz(); },
    qzAgain: function () { var d = QZ.deck; QZ = null; VIEWS.quiz({ deck: d }); },
    qzWrongDue: function () { QZ.items.forEach(function (it) { if (it.pick !== it.id) dueNow(it.id); }); toast('今日の復習に入れました'); },
    mcq: function (el) {
      var kind = el.getAttribute('data-kind'), owner = el.getAttribute('data-owner'), k = +el.getAttribute('data-k'), i = +el.getAttribute('data-i');
      if (kind === 'gq') {
        var g = GBYID[owner], st = store.gram[owner] || (store.gram[owner] = { q: {} });
        if (st.q[k] != null) return;
        st.q[k] = i;
        if (!st.done && g.q.every(function (x, j) { return st.q[j] != null; })) { st.done = Date.now(); logAdd('g'); }
        save(); rerenderKeep(function () { VIEWS.g({ id: owner }); }, '#gq-' + k);
      } else {
        var ps = pState(owner); if (ps.q[k] != null) return;
        ps.q[k] = i; save();
        rerenderKeep(function () { renderPassage(PBYID[owner]); }, '#pq-' + k);
      }
    },
    lvPick: function (el) { go('#/read?lv=' + el.getAttribute('data-v')); },
    pMode: function (el) { PV.mode = el.getAttribute('data-v'); PV.reveal = false; PV.hint = false; stopSpeech(); renderPassage(PBYID[PV.id]); },
    sOpen: function (el) { var k = +el.getAttribute('data-k'); PV.open[k] = !PV.open[k]; rerenderKeep(function () { renderPassage(PBYID[PV.id]); }, '#s-' + k + ' .sent-main'); },
    pShowParse: function (el) { PV.showParse = el.checked; rerenderKeep(function () { renderPassage(PBYID[PV.id]); }); },
    pShowJa: function (el) { PV.showJa = el.checked; rerenderKeep(function () { renderPassage(PBYID[PV.id]); }); },
    readAll: function () { readAll(PBYID[PV.id]); },
    trGo: function (el) { PV.i = +el.getAttribute('data-k'); PV.reveal = false; PV.hint = false; stopSpeech(); renderPassage(PBYID[PV.id]); },
    trHint: function () { PV.hint = true; rerenderKeep(function () { renderPassage(PBYID[PV.id]); }, '#trIn'); },
    trReveal: function () { PV.reveal = true; rerenderKeep(function () { renderPassage(PBYID[PV.id]); }, '.answer .rbtn'); },
    trRate: function (el) {
      var p = PBYID[PV.id], st = pState(p.id), v = +el.getAttribute('data-v'), first = st.rate[PV.i] == null;
      st.rate[PV.i] = v; st.last = Date.now(); if (first) logAdd('s'); save();
      if (PV.i + 1 < p.s.length) { PV.i++; PV.reveal = false; PV.hint = false; renderPassage(p); window.scrollTo(0, 0); }
      else { PV.mode = 'read'; PV.showJa = false; renderPassage(p); toast('全文を訳しました。最後に内容の確認問題と「読了にする」を'); var q = $('.mcq') || $('.finish'); if (q) q.scrollIntoView({ block: 'start' }); }
    },
    pDone: function () { var p = PBYID[PV.id], st = pState(p.id); if (!st.done) { st.done = Date.now(); logAdd('p'); } save(); rerenderKeep(function () { renderPassage(p); }, '.finish button'); toast('読了にしました'); },
    pUndone: function () { var p = PBYID[PV.id], st = pState(p.id); delete st.done; save(); rerenderKeep(function () { renderPassage(p); }, '.finish button'); },
    glossAdd: function (el) {
      var p = PBYID[PV.id], w = p.w[+el.getAttribute('data-k')];
      var s = p.s.filter(function (x) { return x.en.toLowerCase().indexOf(w[0].toLowerCase().split(/[ ,]/)[0]) >= 0; })[0];
      if (addCustom(w[0], w[1], s ? s.en : '', p.t)) rerenderKeep(function () { renderPassage(p); });
    },
    noteNew: function () {
      var n = { id: uid('n-'), title: '', src: '', ts: Date.now(), upd: Date.now(), items: [] };
      store.notes.push(n); save(true); go('#/n?id=' + n.id);
    },
    nSplit: function () { var n = noteById(parseHash().params.id), t = $('#nPaste').value; var ss = splitSentences(t); if (!ss.length) { toast('英文を貼り付けてください'); return; } ss.forEach(function (s) { n.items.push({ en: s }); }); n.upd = Date.now(); save(true); toast(ss.length + '文を追加しました'); VIEWS.n({ id: n.id }); },
    nAddOne: function () { var n = noteById(parseHash().params.id), t = $('#nPaste').value.replace(/\s+/g, ' ').trim(); if (!t) { toast('英文を貼り付けてください'); return; } n.items.push({ en: t }); n.upd = Date.now(); save(true); VIEWS.n({ id: n.id }); },
    nUp: function (el) { var n = noteById(parseHash().params.id), k = +el.getAttribute('data-k'); if (k < 1) return; var t = n.items[k - 1]; n.items[k - 1] = n.items[k]; n.items[k] = t; save(true); rerenderKeep(function () { VIEWS.n({ id: n.id }); }); },
    nItemDel: function (el) {
      var n = noteById(parseHash().params.id), k = +el.getAttribute('data-k');
      confirmBox('文の削除', '<p>' + (k + 1) + '文目を削除します。よろしいですか？</p>', '削除', function () { n.items.splice(k, 1); save(true); rerenderKeep(function () { VIEWS.n({ id: n.id }); }); }, true);
    },
    nWordAdd: function () { var n = noteById(parseHash().params.id); if (addCustom($('#nwW').value, $('#nwJ').value, '', n.title || n.src || '予習ノート')) { $('#nwW').value = ''; $('#nwJ').value = ''; $('#nwW').focus(); } },
    nPrint: function () {
      var n = noteById(parseHash().params.id);
      $('#printArea').innerHTML = '<h1>' + esc(n.title || '予習ノート') + '</h1><p>' + esc(n.src || '') + '</p>' + n.items.map(function (it, k) {
        return '<div class="pq"><div class="h">' + (k + 1) + '. ' + esc(it.en) + '</div>' + (it.st ? '<div>構造：' + esc(it.st) + '</div>' : '') + (it.tr ? '<div>訳：' + esc(it.tr) + '</div>' : '') + (it.q ? '<div>疑問：' + esc(it.q) + '</div>' : '') + (it.fx ? '<div>修正：' + esc(it.fx) + '</div>' : '') + '</div>';
      }).join('');
      window.print();
    },
    nText: function () { var n = noteById(parseHash().params.id); download((n.title || 'note').replace(/[\\/:*?"<>|]/g, '_') + '.txt', noteText(n)); },
    nDel: function () {
      var id = parseHash().params.id;
      confirmBox('ノートの削除', '<p>このノートを削除します。元に戻せません。</p>', '削除', function () { store.notes = store.notes.filter(function (n) { return n.id !== id; }); noteDirty = null; save(true); go('#/notes'); }, true);
    },
    toc: function (el, e) { e.preventDefault(); var s = $('#gs-' + el.getAttribute('data-i')); if (s) s.scrollIntoView({ block: 'start' }); },
    set: function (el) {
      var k = el.getAttribute('data-k'), v = el.getAttribute('data-v');
      if (k === 'newPerDay') v = +v; if (k === 'showParse') v = v === 'true';
      store.settings[k] = v; save(); applyLook();
      $all('[data-act="set"][data-k="' + k + '"]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === el)); });
    },
    export: function () { exportData(); },
    resetProgress: function () {
      confirmBox('学習記録を消す', '<p>単語カード・訳読・構文の記録と日々の記録を消します。予習ノートとマイ単語は残ります。</p>', '消す', function () {
        store.cards = {}; store.pas = {}; store.gram = {}; store.log = {}; store.daily = { date: '', n: 0 }; save(true); toast('学習記録を消しました'); route();
      }, true);
    }
  };
  /* ---------------------------------------------------------------------
     勉強シートへ送る（../study-link.js があるときだけ）
     今日の単語カード・訳読・構文の量と、今日覚え始めた語を、本人の勉強シート（claude.ai・非公開）へ送る
     --------------------------------------------------------------------- */
  ACT.studySend = function () {
    if (!window.StudyLink) return;
    var k = today(), l = store.log[k] || {}, t0 = window.StudyLink.dayStart(k), t1 = t0 + 86400000;
    var words = [];
    store.custom.forEach(function (c) { if (c.ts >= t0 && c.ts < t1 && c.w) words.push({ en: c.w, ja: c.ja || '' }); });
    Object.keys(store.cards).forEach(function (id) {
      var c = store.cards[id], w = wordById(id);
      if (c && c.intro === k && w && !words.some(function (x) { return x.en === w.w; })) words.push({ en: w.w, ja: w.ja || '' });
    });
    words = words.slice(0, 40);
    var eng = { c: l.c || 0, n: l.n || 0, s: l.s || 0, g: l.g || 0, q: l.q || 0, p: l.p || 0 };
    var lines = [];
    if (eng.c) lines.push('単語カード ' + eng.c + '枚（新しい語 ' + eng.n + '）');
    if (eng.s) lines.push('訳した文 ' + eng.s + '文');
    if (eng.p) lines.push('読み終えた文章 ' + eng.p + '本');
    if (eng.g) lines.push('構文 ' + eng.g + '項目');
    if (eng.q) lines.push('単語クイズ ' + eng.q + '回');
    if (words.length) lines.push('今日の語 ' + words.length + '語（勉強シートの単語帳に入ります）');
    var est = Math.round(eng.c * 0.4 + eng.n * 0.6 + eng.s * 2 + eng.g * 4 + eng.q * 3);
    window.StudyLink.open({
      title: '心理英語ノート', date: k, minutes: est, empty: !lines.length,
      lines: lines,
      build: function (min) { return { v: 1, src: 'e', key: 'e', app: '心理英語ノート', date: k, min: min, eng: eng, words: words }; }
    });
  };
  function rerenderKeep(fn, focusSel) {
    var y = window.scrollY; fn(); window.scrollTo(0, y);
    if (focusSel) { var el = $(focusSel); if (el) el.focus({ preventScroll: true }); }
  }
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]');
    if (!el || el.tagName === 'INPUT' && el.type === 'checkbox') return;
    var a = ACT[el.getAttribute('data-act')]; if (!a) return;
    if (el.tagName === 'A' && el.getAttribute('data-act') !== 'skip' && el.getAttribute('data-act') !== 'toc') return;
    a(el, e);
  });
  document.addEventListener('change', function (e) {
    var el = e.target;
    if (el.matches && el.matches('input[type="checkbox"][data-act]')) { var a = ACT[el.getAttribute('data-act')]; if (a) a(el, e); }
  });
  document.addEventListener('input', function (e) {
    var el = e.target;
    if (el.id === 'trIn') {
      var st = pState(el.getAttribute('data-pid')); st.tr[+el.getAttribute('data-k')] = el.value; save(); return;
    }
    if (current.name === 'n') {
      var n = noteById(current.params.id); if (!n) return;
      if (el.hasAttribute('data-nf')) n[el.getAttribute('data-nf')] = el.value;
      else if (el.hasAttribute('data-ni')) { var it = n.items[+el.getAttribute('data-k')]; if (it) it[el.getAttribute('data-ni')] = el.value; }
      else return;
      n.upd = Date.now(); noteDirty = n; save();
    }
  });
  document.addEventListener('keydown', function (e) {
    if (!$('#modal').hidden) { if (e.key === 'Escape') closeModal(); return; }
    var tag = (e.target.tagName || '').toLowerCase(), typing = tag === 'input' || tag === 'textarea' || tag === 'select';
    if (current.name === 'cards' && CS && !typing) {
      if (!CS.shown && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); ACT.reveal(); return; }
      if (CS.shown && /^[1-4]$/.test(e.key)) { e.preventDefault(); gradeCard(+e.key - 1); return; }
    }
    if (current.name === 'quiz' && QZ && !typing) {
      var it = QZ.items[QZ.i];
      if (it && it.pick == null && /^[1-4]$/.test(e.key)) { e.preventDefault(); it.pick = it.opts[+e.key - 1]; renderQuiz(); return; }
      if (it && it.pick != null && e.key === 'Enter') { e.preventDefault(); ACT.qzNext(); return; }
    }
    if (current.name === 'p' && PV.mode === 'tr' && e.target.id === 'trIn' && e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); ACT.trReveal(); }
  });

  /* ---------- 起動 ---------- */
  route();
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () { /* オフライン対応なしでも動く */ }); });
  }
  // テスト・デバッグ用（外部送信はしない）
  window.PSYENG = { version: APP.version, store: function () { return store; }, words: WORDS, passages: PASSAGES, grammar: GRAMMAR, strip: stripParse, render: renderParse, split: splitSentences, schedule: schedule };
})();
