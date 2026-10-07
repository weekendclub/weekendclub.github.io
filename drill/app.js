/* =========================================================================
   国試ドリル 共通エンジン  drill/app.js
   ・社会福祉士・公認心理師など、試験ごとの違いは各アプリの data/subjects.js の
     SW_META（app／exam／subjects／groups／mock）で設定する。
   ・広告なし／外部通信なし。学習データはこの端末のブラウザ（localStorage）だけに保存。
   ・画面：ホーム／演習（出題設定→解答）／一問一答／模擬試験／一覧・検索／学習記録／設定／使い方
   ========================================================================= */
(function () {
  'use strict';

  var META = window.SW_META;
  var BUILTIN = window.SW_BANK || [];
  var APP = META.app;                      // アプリ名・保存キー・文言
  var MOCK = META.mock;                    // 模擬試験の構成・配点・判定
  var APPID = APP.storeKey;                // 書き出しファイルの識別子にも使う
  var LS_KEY = APPID + '.v1';
  var LS_CUSTOM = APPID + '.custom.v1';
  var APP_VERSION = APP.version;
  var GROUP_LABEL = META.groupLabel || '科目群';
  var SL = META.subjLabel || '科目';          // 出題の単位の呼び名（公認心理師は「大項目」）
  function points(q) { return MOCK.points ? MOCK.points(q) : 1; }

  /* ---------------------------------------------------------------------
     科目
     --------------------------------------------------------------------- */
  var SUBJ = {};
  META.subjects.forEach(function (s, i) { s.order = i; SUBJ[s.id] = s; });
  var OTHER = { id: 'other', name: '取り込んだ問題（' + SL + '未設定）', short: 'その他', cat: '追加', group: 0, count: 0, session: '', order: 99 };
  SUBJ.other = OTHER;
  var GROUP_OF = {};
  META.groups.forEach(function (g) { g.subjects.forEach(function (sid) { GROUP_OF[sid] = g.id; }); });
  var CIRCLED = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨'];

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
  // 本文：エスケープした上で **強調** だけ許可
  function fmt(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'); }
  function plain(s) { return String(s == null ? '' : s).replace(/\*\*/g, ''); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function dkey(d) { d = d || new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parseKey(k) { var p = k.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); }
  function addDays(k, n) { var d = parseKey(k); d.setDate(d.getDate() + n); return dkey(d); }
  function daysBetween(a, b) { return Math.round((parseKey(b) - parseKey(a)) / 86400000); }
  function pct(c, n) { return n ? Math.round(c / n * 100) : null; }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function sameSet(a, b) {
    if (a.length !== b.length) return false;
    var x = a.slice().sort(), y = b.slice().sort();
    for (var i = 0; i < x.length; i++) if (x[i] !== y[i]) return false;
    return true;
  }
  function fmtDur(ms) {
    var s = Math.max(0, Math.round(ms / 1000));
    var h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), ss = s % 60;
    return (h ? h + ':' + pad(m) : m) + ':' + pad(ss);
  }
  function fmtDurJa(ms) {
    var m = Math.round(ms / 60000);
    if (m < 1) return '1分未満';
    return m >= 60 ? Math.floor(m / 60) + '時間' + (m % 60) + '分' : m + '分';
  }
  function fmtDate(ts) { var d = new Date(ts); return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate() + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  var WD = ['日', '月', '火', '水', '木', '金', '土'];
  function jaDate(k) { var d = parseKey(k); return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日（' + WD[d.getDay()] + '）'; }
  function normalize(s) {
    s = String(s || '');
    try { s = s.normalize('NFKC'); } catch (e) { /* 古いブラウザ */ }
    s = s.toLowerCase();
    // カタカナ→ひらがな（検索の表記ゆれ対策）
    return s.replace(/[ァ-ヶ]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0x60); });
  }
  function icon(name) {
    var P = {
      play: '<path d="M7 4l13 8-13 8z"/>',
      list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
      shuffle: '<path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>',
      repeat: '<path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/>',
      ox: '<circle cx="7.5" cy="12" r="4.5"/><path d="M14 7.5l7 9M21 7.5l-7 9"/>',
      clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
      target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
      flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
      star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
      note: '<path d="M4 4h16v12l-4 4H4z"/><path d="M16 20v-4h4"/>',
      speak: '<path d="M11 5L6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>',
      eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
      x: '<path d="M6 6l12 12M18 6L6 18"/>',
      chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
      gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
      help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17h.01"/>',
      search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/>',
      print: '<path d="M6 9V3h12v6M6 18H4v-7h16v7h-2M8 14h8v7H8z"/>',
      grid: '<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/>',
      book: '<path d="M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4zM20 4h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7z"/>',
      mail: '<path d="M3 6h18v12H3z"/><path d="M3 7l9 6 9-6"/>',
      alert: '<path d="M12 3l9.5 17h-19z"/><path d="M12 10v4M12 17.5h.01"/>',
      pause: '<circle cx="12" cy="12" r="9"/><path d="M10 9v6M14 9v6"/>'
    };
    return '<svg viewBox="0 0 24 24" aria-hidden="true">' + (P[name] || '') + '</svg>';
  }

  /* ---------------------------------------------------------------------
     保存（localStorage）。使えない環境ではメモリ上だけで動かす
     --------------------------------------------------------------------- */
  var memStore = {};
  var canStore = (function () {
    try { var k = '__swd'; localStorage.setItem(k, '1'); localStorage.removeItem(k); return true; } catch (e) { return false; }
  })();
  function lsGet(k) { try { return canStore ? localStorage.getItem(k) : memStore[k] || null; } catch (e) { return null; } }
  function lsSet(k, v) {
    try { if (canStore) localStorage.setItem(k, v); else memStore[k] = v; return true; }
    catch (e) { toast('保存領域がいっぱいです。取り込んだ問題を減らすか、データを書き出してください。'); return false; }
  }

  var DEFAULT_SETTINGS = {
    theme: 'auto', font: 'm', instant: true, shuffleOpts: false, emphasize: true, autoScroll: true,
    dailyGoal: 20, examDate: META.exam.date, speechRate: 1.0, showTimer: true
  };
  function freshStore() {
    return { v: 1, settings: Object.assign({}, DEFAULT_SETTINGS), q: {}, ox: {}, flags: {}, notes: {}, days: {}, mocks: [], session: null, setup: null, created: Date.now() };
  }
  var store = load();
  function load() {
    var raw = lsGet(LS_KEY), s = null;
    if (raw) { try { s = JSON.parse(raw); } catch (e) { s = null; } }
    if (!s || typeof s !== 'object') s = freshStore();
    var f = freshStore();
    Object.keys(f).forEach(function (k) { if (s[k] === undefined) s[k] = f[k]; });
    s.settings = Object.assign({}, DEFAULT_SETTINGS, s.settings || {});
    return s;
  }
  var saveTimer = null;
  function save(now) {
    if (now) { clearTimeout(saveTimer); saveTimer = null; lsSet(LS_KEY, JSON.stringify(store)); return; }
    if (saveTimer) return;
    saveTimer = setTimeout(function () { saveTimer = null; lsSet(LS_KEY, JSON.stringify(store)); }, 250);
  }
  window.addEventListener('pagehide', function () { tickTimer(); save(true); });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { tickTimer(); save(true); } else if (S()) { S().tick = Date.now(); }
  });

  var custom = (function () {
    var raw = lsGet(LS_CUSTOM);
    try { var c = raw ? JSON.parse(raw) : null; if (c && Array.isArray(c.packs)) return c; } catch (e) { /* 壊れていたら作り直す */ }
    return { packs: [] };
  })();
  function saveCustom() { return lsSet(LS_CUSTOM, JSON.stringify(custom)); }

  /* ---------------------------------------------------------------------
     問題バンク
     --------------------------------------------------------------------- */
  var BANK = [], BYID = {}, BUILTIN_IDS = [], SETS = [];
  function buildBank() {
    BANK = []; BYID = {}; BUILTIN_IDS = []; SETS = [];
    var cnt = {};
    BUILTIN.forEach(function (src) {
      var q = Object.assign({}, src);
      q.src = 'b';
      cnt[q.subj] = (cnt[q.subj] || 0) + 1;
      q.no = cnt[q.subj];
      q.ox = q.ox !== false;
      q.set = q.set || 1;
      if (SETS.indexOf(q.set) < 0) SETS.push(q.set);
      BANK.push(q); BYID[q.id] = q; BUILTIN_IDS.push(q.id);
    });
    SETS.sort();
    // セットごとに本番と同じ並びの通し番号（社会福祉士は科目順で問題1〜129）。
    // 試験ごとに並びが違う場合は META.order(問題の配列) で並べ替える（公認心理師：午前の一般→事例→午後の一般→事例）
    var ordered = BUILTIN_IDS.slice().sort(function (a, b) {
      var A = BYID[a], B = BYID[b];
      return (A.set - B.set) || (SUBJ[A.subj].order - SUBJ[B.subj].order) || (A.no - B.no);
    });
    if (META.order) ordered = META.order(ordered.map(function (id) { return BYID[id]; })).map(function (q) { return q.id; });
    var seq = {};
    ordered.forEach(function (id) { var q = BYID[id]; seq[q.set] = (seq[q.set] || 0) + 1; q.gno = seq[q.set]; });
    BUILTIN_IDS = ordered;
    custom.packs.forEach(function (p) {
      if (p.enabled === false) return;
      p.qs.forEach(function (src, i) {
        var q = Object.assign({}, src);
        q.src = p.id; q.pack = p.name; q.no = i + 1;
        if (!SUBJ[q.subj]) q.subj = 'other';
        q.ox = q.ox === true && Array.isArray(q.oe) && q.oe.length === q.opts.length;
        BANK.push(q); BYID[q.id] = q;
      });
    });
  }
  buildBank();
  // 問題セットの表示名（例：公認心理師の「第2回（本試験レベル）」）。未設定なら「第N回」
  function setName(n) { return (META.setNames && META.setNames[n]) || ('第' + n + '回'); }
  function qLabel(q) {
    if (q.label) return q.label;
    if (q.src === 'b') return SUBJ[q.subj].name + ' 問' + q.no;
    return (q.pack || '取込') + ' 問' + q.no;
  }
  function subjName(q) { return q.subjName && q.subj === 'other' ? q.subjName : SUBJ[q.subj].name; }
  function needCount(q) { return q.ans.length; }

  /* 一問一答（○×）：選択肢を1文ずつの正誤問題として使う */
  function oxParse(oid) { var p = oid.lastIndexOf('#'); return { q: BYID[oid.slice(0, p)], i: +oid.slice(p + 1) }; }
  function oxTruth(q, i) { var inAns = q.ans.indexOf(i) >= 0; return q.neg ? !inAns : inAns; }
  function oxAll(subjSet) {
    var out = [];
    BANK.forEach(function (q) {
      if (!q.ox || !q.oe) return;
      if (subjSet && !subjSet[q.subj]) return;
      for (var i = 0; i < q.opts.length; i++) out.push(q.id + '#' + i);
    });
    return out;
  }

  /* ---------------------------------------------------------------------
     学習記録・間隔反復（復習日の計算）
     --------------------------------------------------------------------- */
  var INTERVAL = [1, 3, 7, 14, 30, 60]; // box → 次の復習までの日数
  function srsNext(prevBox, ok, conf) {
    prevBox = prevBox || 0;
    if (!ok || conf === 'guess') return { box: 0, days: 1 };
    if (conf === 'unsure') { var b = Math.max(1, Math.min(prevBox, 2)); return { box: b, days: 2 }; }
    var nb = Math.min(prevBox + 1, INTERVAL.length - 1);
    return { box: nb, days: INTERVAL[nb] };
  }
  function qst(id) { return store.q[id]; }
  function recordAnswer(id, ok, conf) {
    var st = store.q[id] || (store.q[id] = { n: 0, c: 0, h: [], box: 0, due: null });
    var prev = { box: st.box || 0, due: st.due || null, conf: st.conf || null };
    st.n++; if (ok) st.c++;
    st.last = Date.now(); st.lastOk = ok; st.conf = conf || null;
    st.h.push([st.last, ok ? 1 : 0]);
    if (st.h.length > 20) st.h = st.h.slice(-20);
    var nx = srsNext(prev.box, ok, conf);
    st.box = nx.box; st.due = addDays(dkey(), nx.days);
    bumpDay(ok);
    save();
    return prev;
  }
  function setConf(id, prev, ok, conf) {
    var st = store.q[id]; if (!st) return;
    st.conf = conf;
    var nx = srsNext(prev.box, ok, conf);
    st.box = nx.box; st.due = addDays(dkey(), nx.days);
    save();
  }
  function bumpDay(ok) {
    var k = dkey(); var d = store.days[k] || (store.days[k] = { n: 0, c: 0 });
    d.n++; if (ok) d.c++;
  }
  function recordOx(id, ok) {
    var st = store.ox[id] || (store.ox[id] = { n: 0, c: 0 });
    st.n++; if (ok) st.c++; st.last = Date.now(); st.lastOk = ok;
    bumpDay(ok); save();
  }
  function isWeak(id) {
    var st = qst(id); if (!st || !st.n) return false;
    return st.lastOk === false || st.c / st.n < 0.6 || st.conf === 'unsure' || st.conf === 'guess';
  }
  function isDue(id) { var st = qst(id); return !!(st && st.due && st.due <= dkey()); }
  function dueIds() { return BANK.filter(function (q) { return isDue(q.id); }).map(function (q) { return q.id; }); }
  function streak() {
    var k = dkey(), n = 0;
    if (!(store.days[k] && store.days[k].n)) k = addDays(k, -1);
    while (store.days[k] && store.days[k].n) { n++; k = addDays(k, -1); }
    return n;
  }
  function subjStats(ids) {
    var out = {};
    ids.forEach(function (id) {
      var q = BYID[id]; if (!q) return;
      var o = out[q.subj] || (out[q.subj] = { total: 0, done: 0, n: 0, c: 0, lastOk: 0 });
      o.total++;
      var st = qst(id);
      if (st && st.n) { o.done++; o.n += st.n; o.c += st.c; if (st.lastOk) o.lastOk++; }
    });
    return out;
  }

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
    var f = acts.querySelector('.primary') || acts.querySelector('button');
    if (f) f.focus();
    if (o.onOpen) o.onOpen($('#modalBody'));
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
  function route() {
    var r = parseHash();
    if (!VIEWS[r.name]) r = { name: 'home', params: {} };
    if (current.name === 'play' || current.name === 'oxplay') tickTimer();
    stopTimer(); stopSpeech();
    current = r;
    document.body.classList.toggle('focus', r.name === 'play' || r.name === 'oxplay');
    var navKey = { play: 'setup', result: 'setup', oxplay: 'ox', oxresult: 'ox', mockres: 'mock' }[r.name] || r.name;
    $all('[data-nav]').forEach(function (a) {
      var on = a.getAttribute('data-nav') === navKey ||
        (a.getAttribute('data-nav') === 'more' && ['mock', 'stats', 'settings', 'help', 'mockres'].indexOf(navKey) >= 0);
      a.classList.toggle('on', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    VIEWS[r.name](r.params);
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);
  function setView(html) { $('#view').innerHTML = html; }
  function footer() {
    return '<div class="footer">' + esc(APP.name) + ' v' + APP_VERSION + '　｜　広告なし・登録不要・学習データはこの端末にのみ保存<br>' +
      '収録問題は独自作成の練習問題です（実際の過去問ではありません）。<a href="#/help">使い方・ご注意</a>　<a href="../">weekendclub</a></div>';
  }

  /* ---------------------------------------------------------------------
     セッション（演習・模試・一問一答の進行状態）
     --------------------------------------------------------------------- */
  function S() { return store.session; }
  function newSession(o) {
    var s = {
      id: Date.now(), kind: o.kind, title: o.title, ids: o.ids.slice(), i: o.start || 0,
      ans: o.ans || {}, pick: {}, struck: {}, rev: {}, perm: {},
      instant: o.instant != null ? o.instant : store.settings.instant,
      started: Date.now(), elapsed: 0, tick: Date.now(), done: !!o.done, mock: o.mock || null, back: o.back || null
    };
    if ((o.shuffle != null ? o.shuffle : store.settings.shuffleOpts) && o.kind !== 'ox') {
      s.ids.forEach(function (id) { var q = BYID[id]; if (q) s.perm[id] = shuffle(q.opts.map(function (_, i) { return i; })); });
    }
    return s;
  }
  function sessionInProgress() {
    var s = S(); if (!s || s.done || s.kind === 'review') return null;
    var answered = Object.keys(s.kind === 'mock' ? s.pick : s.ans).length;
    return answered > 0 || s.i > 0 ? s : null;
  }
  function startSession(o) {
    if (!o.ids.length) { toast('条件に合う問題がありません'); return; }
    var cur = sessionInProgress();
    var begin = function () {
      store.session = newSession(o); save(true);
      go(o.kind === 'ox' ? '#/oxplay' : '#/play');
    };
    if (cur && !o.force) {
      var n = Object.keys(cur.kind === 'mock' ? cur.pick : cur.ans).length;
      confirmBox('途中のセッションがあります', '<p>「' + esc(cur.title) + '」（' + n + '/' + cur.ids.length + '問 解答済み）が途中です。新しく始めると、途中のセッションは終了します（解答済みの問題の記録は残ります）。</p>', '新しく始める', begin);
    } else begin();
  }
  var timerId = null;
  function tickTimer() {
    if (current.name !== 'play' && current.name !== 'oxplay') return;
    var s = S(); if (!s || s.done) return;
    var now = Date.now();
    if (s.tick && !document.hidden) s.elapsed += Math.min(now - s.tick, 5000);
    s.tick = now;
  }
  function startTimer() {
    stopTimer();
    var s = S(); if (!s) return;
    s.tick = Date.now();
    timerId = setInterval(function () {
      var s2 = S(); if (!s2 || s2.done) { stopTimer(); return; }
      tickTimer();
      var el = $('#timer');
      if (s2.kind === 'mock') {
        var remain = s2.mock.limit * 1000 - s2.elapsed;
        if (el) { el.textContent = '残り ' + fmtDur(remain); el.classList.toggle('low', remain < 10 * 60 * 1000); }
        if (remain <= 0) { stopTimer(); gradeMock(true); return; }
      } else if (el) el.textContent = fmtDur(s2.elapsed);
      if (Math.floor(s2.elapsed / 1000) % 5 === 0) save();
    }, 1000);
  }
  function stopTimer() { if (timerId) { clearInterval(timerId); timerId = null; } }

  /* ---------------------------------------------------------------------
     絞り込み
     --------------------------------------------------------------------- */
  var STATUS_FILTERS = [
    ['all', 'すべて'], ['new', '未解答'], ['wrong', '前回まちがえた'], ['weak', '苦手（正答率60%未満・自信なし含む）'],
    ['due', '今日の復習（期限到来）'], ['flag', '付箋あり'], ['note', 'メモあり'], ['right', '前回正解']
  ];
  function matchStatus(id, f) {
    var st = qst(id);
    switch (f) {
      case 'new': return !st || !st.n;
      case 'wrong': return !!(st && st.n && st.lastOk === false);
      case 'weak': return isWeak(id);
      case 'due': return isDue(id);
      case 'flag': return !!store.flags[id];
      case 'note': return !!(store.notes[id] && store.notes[id].trim());
      case 'right': return !!(st && st.n && st.lastOk === true);
      default: return true;
    }
  }
  function sourceIds(src) {
    // src: 'all' | 'b' | packId
    return BANK.filter(function (q) { return src === 'all' || q.src === src; }).map(function (q) { return q.id; });
  }
  function orderedIds(ids) {
    return ids.slice().sort(function (a, b) {
      var A = BYID[a], B = BYID[b];
      if (A.src !== B.src) return A.src === 'b' ? -1 : B.src === 'b' ? 1 : (A.src < B.src ? -1 : 1);
      if (A.src === 'b') return (A.set - B.set) || (A.gno - B.gno);
      return A.no - B.no;
    });
  }

  /* =====================================================================
     画面：ホーム
     ===================================================================== */
  VIEWS.home = function () {
    var set = store.settings, today = dkey();
    var exam = set.examDate || META.exam.date;
    var left = exam ? daysBetween(today, exam) : -1;
    var td = store.days[today] || { n: 0, c: 0 };
    var goal = Math.max(1, +set.dailyGoal || 20);
    var due = dueIds().length;
    var weak = BANK.filter(function (q) { return isWeak(q.id); }).length;
    var flags = BANK.filter(function (q) { return store.flags[q.id]; }).length;
    var unanswered = BANK.filter(function (q) { var s = qst(q.id); return !s || !s.n; }).length;
    var cur = sessionInProgress();
    var html = '<div class="wrap">';

    if (META.exam.applyUntil && today <= META.exam.applyUntil) {
      var dl = daysBetween(today, META.exam.applyUntil);
      html += '<div class="banner"><span class="bi">' + icon('mail') + '</span><span><b>' + esc(META.exam.applyLabel || '受験申込') + 'は ' + jaDate(META.exam.applyUntil).replace(/^\d+年/, '') + ' まで</b>' +
        (dl === 0 ? '（<b>本日締切</b>）' : '（あと' + dl + '日）') + (META.exam.applyNote ? '。' + esc(META.exam.applyNote) : '') + '</span></div>';
    }
    if (!canStore) html += '<div class="banner"><span class="bi">' + icon('alert') + '</span><span>この環境ではブラウザに保存できないため、ページを閉じると学習記録が消えます（プライベートブラウズ等）。</span></div>';
    if (cur) {
      var n = Object.keys(cur.kind === 'mock' ? cur.pick : cur.ans).length;
      html += '<div class="banner info"><span class="bi">' + icon('pause') + '</span><span><b>続きから再開できます</b><br><span class="small muted">' + esc(cur.title) + '　' + n + '/' + cur.ids.length + '問' +
        (cur.kind === 'mock' ? '　残り ' + fmtDur(cur.mock.limit * 1000 - cur.elapsed) : '') + '</span></span><span class="spacer"></span>' +
        '<a class="btn primary small" href="' + (cur.kind === 'ox' ? '#/oxplay' : '#/play') + '">再開</a></div>';
    }

    html += '<div class="hero">' +
      '<div class="card count-card"><div class="k">' + esc(META.exam.name) + '</div>' +
      (exam && left >= 0 ? '<div class="big num">あと ' + left + '<small>日</small></div>' : '<div class="big" style="font-size:1.6em">' + (exam ? '試験日を過ぎました' : '試験日を設定') + '</div>') +
      '<div class="d">' + (exam ? '試験日 ' + jaDate(exam) + (exam !== META.exam.date ? '（設定で変更済み）' : '') : esc(META.exam.dateNote || '設定で試験日を入力すると、残り日数を表示します')) + '</div>' +
      '<div class="d small" style="margin-top:6px">' + esc(APP.heroNote) + '</div></div>' +
      '<div class="card today"><div class="row between"><b>今日の学習</b><a class="small" href="#/stats">記録を見る</a></div>' +
      '<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="' + goal + '" aria-valuenow="' + td.n + '"><i style="width:' + Math.min(100, td.n / goal * 100) + '%"></i></div>' +
      '<div class="small"><b class="num">' + td.n + '</b> / ' + goal + '問' + (td.n >= goal ? '　<span class="chip ok">目標達成</span>' : '') + '</div>' +
      '<div class="kpis"><div class="kpi"><div class="k">今日の正答率</div><div class="v num">' + (td.n ? pct(td.c, td.n) + '<small>%</small>' : '–') + '</div></div>' +
      '<div class="kpi"><div class="k">連続学習</div><div class="v num">' + streak() + '<small>日</small></div></div>' +
      '<div class="kpi"><div class="k">復習待ち</div><div class="v num">' + due + '<small>問</small></div></div></div>' +
      (studyOn() ? '<div class="row" style="margin-top:10px"><button class="btn small" data-act="studySend">今日の分を勉強シートに送る</button></div>' : '') +
      '</div></div>';

    html += '<h2 class="sec">学習モード</h2><div class="modes">' +
      modeCard('repeat', '今日の復習', '間違えた・あいまいだった問題を、忘れかけの頃に再出題（間隔反復）。', due ? due + '問が復習時期' : '復習予定はまだありません', 'quick', 'due', due > 0) +
      modeCard('list', SL + '別演習', SL + '・出題数・出題順・絞り込みを選んで解く。過去問サイトの「出題範囲を選択」にあたる機能。', BANK.length + '問から選択', 'href', '#/setup') +
      modeCard('shuffle', 'ランダム10問', '全' + SL + 'からランダムに10問。すき間時間に。', 'すぐ始める', 'quick', 'rand10') +
      modeCard('ox', '一問一答（○×）', '選択肢を1文ずつ○×で判定。知識の穴が見つかる。', oxAll(null).length + '文', 'href', '#/ox') +
      modeCard('clock', '模擬試験', esc(APP.mockCard), (store.mocks.length ? '受験 ' + store.mocks.length + '回' : '時間を計って挑戦'), 'href', '#/mock') +
      modeCard('target', '苦手克服', '前回不正解・正答率60%未満・「自信なし」の問題だけ。', weak ? weak + '問' : 'まだありません', 'quick', 'weak', weak > 0) +
      modeCard('flag', '付箋した問題', '付箋を付けた問題だけを解き直す。', flags ? flags + '問' : 'まだありません', 'quick', 'flag', flags > 0) +
      modeCard('star', '未解答の問題から', 'まだ解いていない問題を10問ずつ。', unanswered + '問が未解答', 'quick', 'new', unanswered > 0) +
      modeCard('search', '一覧・検索', 'キーワードで問題と解説を横断検索。印刷用の問題用紙も作れる。', '', 'href', '#/list') +
      '</div>';

    html += '<h2 class="sec">' + SL + '別の進み具合 <span class="sub">' + SL + '名をタップするとその' + SL + 'を演習</span></h2><div class="card" style="padding:10px 12px">' + subjTable(BUILTIN_IDS) + '</div>';

    if (custom.packs.length) {
      html += '<h2 class="sec">取り込んだ問題</h2><div class="card">' + custom.packs.map(function (p) {
        var ids = sourceIds(p.id), d = ids.filter(function (id) { var s = qst(id); return s && s.n; }).length;
        return '<div class="row between" style="padding:6px 0"><span><b>' + esc(p.name) + '</b> <span class="muted small">' + p.qs.length + '問・解答済 ' + d + '</span></span>' +
          '<button class="btn small" data-act="packPlay" data-pack="' + esc(p.id) + '">演習する</button></div>';
      }).join('') + '</div>';
    }

    html += '<div class="notice" style="margin-top:24px"><strong>収録問題について：</strong>' + APP.notice(SETS.length, BUILTIN.length) + 'お持ちの過去問データは「設定 → 問題データの取り込み」から、<strong>この端末の中だけ</strong>に追加して使えます。</div>';
    if (APP.homeExtra) html += APP.homeExtra;
    html += footer() + '</div>';
    setView(html);
  };
  function modeCard(ic, t, d, n, kind, val, enabled) {
    var dis = enabled === false;
    var attrs = kind === 'href' ? 'href="' + val + '"' : 'href="#" data-act="quick" data-q="' + val + '"';
    return '<a class="mode' + (val === 'due' && !dis ? ' hot' : '') + '" ' + attrs + (dis ? ' aria-disabled="true" style="opacity:.6"' : '') + '>' +
      '<span class="ic">' + icon(ic) + '</span><span class="t">' + t + '</span><span class="d">' + d + '</span>' + (n ? '<span class="n">' + n + '</span>' : '') + '</a>';
  }
  function subjTable(ids) {
    var ss = subjStats(ids);
    var h = '<table class="subj-table"><thead><tr><th>' + SL + '</th><th class="r">解答済</th><th style="width:34%">正答率（累計）</th><th class="r">%</th></tr></thead><tbody>';
    META.groups.forEach(function (g) {
      h += '<tr class="grp"><td colspan="4">' + esc(g.name) + (g.note ? '　' + esc(g.note) : '') + '</td></tr>';
      g.subjects.forEach(function (sid) {
        var o = ss[sid] || { total: 0, done: 0, n: 0, c: 0 };
        var p = pct(o.c, o.n);
        h += '<tr><td><a href="#" data-act="subjPlay" data-subj="' + sid + '">' + esc(SUBJ[sid].name) + '</a></td>' +
          '<td class="r num small">' + o.done + '/' + o.total + '</td>' +
          '<td><div class="meter"><i class="' + (p == null ? '' : p >= 60 ? 'ok' : p >= 40 ? 'warn' : 'ng') + '" style="width:' + (p || 0) + '%"></i><span class="line60"></span></div></td>' +
          '<td class="r num small">' + (p == null ? '–' : p) + '</td></tr>';
      });
    });
    return h + '</tbody></table>';
  }

  /* =====================================================================
     画面：出題設定（演習）
     ===================================================================== */
  function defaultSetup() {
    return { subjects: META.subjects.map(function (s) { return s.id; }), status: 'all', order: 'seq', count: 'all', src: 'b', qset: 'all', kind: 'all' };
  }
  VIEWS.setup = function (p) {
    var cfg = Object.assign(defaultSetup(), store.setup || {});
    if (p.subj) { cfg.subjects = p.subj.split(','); }
    if (p.status) cfg.status = p.status;
    if (cfg.src !== 'b' && cfg.src !== 'all' && !custom.packs.some(function (pk) { return pk.id === cfg.src; })) cfg.src = 'b';
    store.setup = cfg;
    var html = '<div class="wrap"><h1 class="page">' + SL + '別演習</h1><p class="lead">出題範囲と条件を選んで「演習スタート」。1問ごとに正誤と解説が表示されます。</p>';

    if (custom.packs.length) {
      html += '<div class="field"><span class="lab">問題の種類</span><div class="seg" id="srcSeg">' +
        segBtn('src', 'b', '収録問題', cfg.src) + custom.packs.map(function (pk) { return segBtn('src', pk.id, pk.name, cfg.src); }).join('') + segBtn('src', 'all', 'すべて', cfg.src) + '</div></div>';
    }

    if (SETS.length > 1 && (cfg.src === 'b' || cfg.src === 'all')) {
      html += '<div class="field"><span class="lab">問題セット</span><div class="seg">' + segBtn('qset', 'all', 'すべて', cfg.qset) +
        SETS.map(function (n) { return segBtn('qset', String(n), setName(n), cfg.qset); }).join('') + '</div></div>';
    }
    html += '<div class="field"><span class="lab">' + SL + '（複数選択可）</span><div class="row" style="margin-bottom:8px">' +
      '<button class="btn small" data-act="subjAll" data-v="1">すべて選択</button><button class="btn small" data-act="subjAll" data-v="0">すべて解除</button>' +
      (META.cats || []).map(function (c) { return '<button class="btn small" data-act="subjCat" data-v="' + esc(c[0]) + '">' + esc(c[1]) + '</button>'; }).join('') + '</div>' +
      '<div class="subj-pick">';
    var ss = subjStats(sourceIds(cfg.src));
    META.groups.forEach(function (g) {
      html += '<div class="grp-box"><div class="grp-head">' + esc(g.name) + '<span class="muted" style="font-weight:400">' + esc(g.note || '') + '</span><span class="spacer"></span>' +
        '<button class="linkbtn" data-act="grpToggle" data-g="' + g.id + '">まとめて切替</button></div><div class="grp-items">';
      g.subjects.forEach(function (sid) {
        var o = ss[sid] || { total: 0, done: 0 };
        html += '<label class="chk"><input type="checkbox" name="subj" value="' + sid + '"' + (cfg.subjects.indexOf(sid) >= 0 ? ' checked' : '') + '>' +
          '<span>' + esc(SUBJ[sid].name) + '</span><span class="c num">' + o.done + '/' + o.total + '</span></label>';
      });
      html += '</div></div>';
    });
    if (ss.other) {
      html += '<div class="grp-box"><div class="grp-items"><label class="chk"><input type="checkbox" name="subj" value="other"' + (cfg.subjects.indexOf('other') >= 0 ? ' checked' : '') + '><span>' + esc(OTHER.name) + '</span><span class="c">' + ss.other.done + '/' + ss.other.total + '</span></label></div></div>';
    }
    html += '</div></div>';

    html += '<div class="field"><span class="lab">絞り込み</span><select class="inp" id="statusSel">' +
      STATUS_FILTERS.map(function (f) { return '<option value="' + f[0] + '"' + (cfg.status === f[0] ? ' selected' : '') + '>' + f[1] + '</option>'; }).join('') + '</select></div>';
    // 一般問題／事例問題（事例問題が収録されている場合だけ表示）
    if (BANK.some(function (q) { return q.case; })) {
      html += '<div class="field"><span class="lab">問題の形式</span><div class="seg">' + segBtn('kind', 'all', 'すべて', cfg.kind || 'all') + segBtn('kind', 'gen', '一般問題', cfg.kind) +
        segBtn('kind', 'case', '事例問題' + (APP.casePoints ? '（' + APP.casePoints + '）' : ''), cfg.kind) + '</div></div>';
    }
    html += '<div class="grid g2 stack-s"><div class="field"><span class="lab">出題順</span><div class="seg">' +
      segBtn('order', 'seq', '番号順', cfg.order) + segBtn('order', 'rand', 'ランダム', cfg.order) + '</div></div>' +
      '<div class="field"><span class="lab">出題数</span><div class="seg">' +
      ['5', '10', '20', '30', 'all'].map(function (c) { return segBtn('count', c, c === 'all' ? '全部' : c + '問', cfg.count); }).join('') + '</div></div></div>';
    html += '<div class="card" style="padding:4px 16px">' +
      switchRow('instant', '選択肢を押したらすぐ採点', 'オフにすると、選んでから「解答する」で採点（選び直しができます）。', store.settings.instant) +
      switchRow('shuffleOpts', '選択肢の並びをシャッフル', '位置で答えを覚えてしまうのを防ぎます。', store.settings.shuffleOpts) +
      '</div>';
    html += '<div class="sticky-go"><div class="info">対象 <b class="num" id="matchN">0</b> 問<br><span class="muted small" id="matchSub"></span></div><span class="spacer"></span>' +
      '<button class="btn primary" data-act="startSetup" id="goBtn">' + icon('play') + ' 演習スタート</button></div>';
    html += footer() + '</div>';
    setView(html);
    updateSetupCount();
  };
  function segBtn(key, val, label, cur) {
    return '<button type="button" data-act="seg" data-k="' + key + '" data-v="' + esc(val) + '" aria-pressed="' + (String(cur) === String(val)) + '">' + esc(label) + '</button>';
  }
  function switchRow(key, t, d, on) {
    return '<label class="switch"><span><span class="t">' + t + '</span><br><span class="d">' + d + '</span></span><input type="checkbox" data-set="' + key + '"' + (on ? ' checked' : '') + '></label>';
  }
  function setupMatches() {
    var cfg = store.setup, set = {};
    cfg.subjects.forEach(function (s) { set[s] = 1; });
    var qs = cfg.qset || 'all';
    return orderedIds(sourceIds(cfg.src).filter(function (id) {
      var q = BYID[id];
      if (qs !== 'all' && q.src === 'b' && q.set !== +qs) return false;
      if (cfg.kind === 'gen' && q.case) return false;
      if (cfg.kind === 'case' && !q.case) return false;
      return set[q.subj] && matchStatus(id, cfg.status);
    }));
  }
  function updateSetupCount() {
    var cfg = store.setup;
    cfg.subjects = $all('input[name="subj"]:checked').map(function (i) { return i.value; });
    var sel = $('#statusSel'); if (sel) cfg.status = sel.value;
    var ids = setupMatches();
    var n = cfg.count === 'all' ? ids.length : Math.min(ids.length, +cfg.count);
    $('#matchN').textContent = n;
    $('#matchSub').textContent = '該当 ' + ids.length + '問・' + cfg.subjects.length + SL;
    $('#goBtn').disabled = n === 0;
    save();
  }

  /* =====================================================================
     画面：解答（演習・模試・見直し 共通）
     ===================================================================== */
  function curQ() { var s = S(); return s ? BYID[s.ids[s.i]] : null; }
  function optOrder(s, q) { return s.perm[q.id] || q.opts.map(function (_, i) { return i; }); }
  function emphasize(text) {
    var h = fmt(text);
    if (!store.settings.emphasize) return h;
    return h.replace(/(誤っているもの|正しくないもの|適切でないもの|不適切なもの|該当しないもの|含まれないもの|2つ選びなさい|２つ選びなさい|2つ選べ|２つ選べ)/g, '<span class="key">$1</span>');
  }
  VIEWS.play = function () {
    var s = S();
    if (!s || s.kind === 'ox') { go('#/'); return; }
    // 取り込み問題の削除などで消えた問題を除く
    var before = s.ids.length;
    s.ids = s.ids.filter(function (id) { return BYID[id]; });
    if (!s.ids.length) { store.session = null; save(); go('#/'); return; }
    if (s.ids.length !== before && s.i >= s.ids.length) s.i = s.ids.length - 1;
    renderPlay();
    if (!s.done) startTimer();
  };
  function renderPlay() {
    var s = S(), q = curQ(); if (!q) return;
    var isMock = s.kind === 'mock', isReview = s.kind === 'review' || (s.done && s.kind !== 'mock');
    var a = s.ans[q.id];
    if (!a && isReview) a = { sel: [], ok: false };
    var answered = !isMock && !!a;
    var order = optOrder(s, q);
    var pick = s.pick[q.id] || [];
    var struck = s.struck[q.id] || [];
    var need = needCount(q);
    var nAns = isMock ? Object.keys(s.pick).filter(function (k) { return s.pick[k].length; }).length : Object.keys(s.ans).length;

    var html = '<div class="player">';
    html += '<div class="ptop"><button class="btn small ghost" data-act="quit">' + icon('x') + (isMock ? ' 中断' : (s.done ? ' 閉じる' : ' 中断')) + '</button>' +
      '<span class="title">' + esc(s.title) + '</span>' +
      (s.done ? '' : (isMock || store.settings.showTimer ? '<span class="timer" id="timer">' + (isMock ? '残り ' + fmtDur(s.mock.limit * 1000 - s.elapsed) : fmtDur(s.elapsed)) + '</span>' : '')) +
      '<button class="btn small" data-act="palette">' + icon('grid') + ' <span class="num">' + (s.i + 1) + '/' + s.ids.length + '</span></button></div>';
    html += '<div class="progress" aria-hidden="true"><i style="width:' + (nAns / s.ids.length * 100) + '%"></i></div>';

    html += '<article class="qcard" id="qcard" aria-labelledby="qh">';
    html += '<div class="qmeta"><span class="qno" id="qh">' + (isMock && s.mock && s.mock.offset != null ? '問題 ' + (s.mock.offset + s.i + 1) : isMock && q.gno && s.mock && s.mock.global ? '問題 ' + q.gno : '第' + (s.i + 1) + '問') + '</span>' +
      '<span class="chip acc">' + esc(subjName(q)) + '</span>' +
      (q.topic ? '<span class="chip">' + esc(q.topic) + '</span>' : '') +
      (q.case && APP.casePoints ? '<span class="chip">事例問題・' + esc(APP.casePoints) + '</span>' : '') +
      (q.src !== 'b' ? '<span class="chip warn">取込: ' + esc(q.label || q.pack) + '</span>' : '') +
      (store.flags[q.id] ? '<span class="chip flag">付箋</span>' : '') + '</div>';
    // 事例の位置：社会福祉士は「問い→事例」、公認心理師は「事例→問い」（APP.caseFirst）
    var caseHtml = q.case ? '<div class="qcase"><span class="k">事例</span>' + fmt(q.case) + '</div>' : '';
    if (APP.caseFirst) html += caseHtml + '<p class="qtext">' + emphasize(q.q) + '</p>';
    else html += '<p class="qtext">' + emphasize(q.q) + '</p>' + caseHtml;
    if (need > 1 && !answered) html += '<div class="multi-hint">' + need + 'つ選んでください（' + pick.length + '/' + need + '）</div>';

    html += '<ol class="opts" role="list">';
    order.forEach(function (oi, k) {
      var cls = 'opt', badge = '';
      if (answered) {
        cls += ' done';
        var isAns = q.ans.indexOf(oi) >= 0, chosen = a.sel.indexOf(oi) >= 0;
        if (isAns) { cls += ' correct'; badge = '<span class="badge">正答</span>'; }
        else if (chosen) { cls += ' wrong'; badge = '<span class="badge">選択</span>'; }
        if (isAns && chosen) badge = '<span class="badge">正答・選択</span>';
      } else {
        if (pick.indexOf(oi) >= 0) cls += ' sel';
      }
      if (struck.indexOf(oi) >= 0 && !answered) cls += ' struck';
      html += '<li class="' + cls + '"><button class="opt-main" data-act="opt" data-k="' + k + '"' + (answered ? ' disabled' : '') +
        ' aria-pressed="' + (pick.indexOf(oi) >= 0) + '"><span class="n">' + (k + 1) + '</span><span class="tx">' + fmt(q.opts[oi]) + '</span>' + badge + '</button>' +
        (answered ? '' : '<button class="opt-x" data-act="strike" data-k="' + k + '" aria-label="選択肢' + (k + 1) + 'を消去法で消す" title="消去法（×をつける）">' +
          '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>') + '</li>';
    });
    html += '</ol>';

    // 解答前の操作（複数選択・即時採点オフ）
    if (!answered && !isMock && (need > 1 || !s.instant)) {
      html += '<div class="pnav"><button class="btn primary" data-act="submit"' + (pick.length === need ? '' : ' disabled') + '>解答する</button></div>';
    }

    // 結果と解説
    if (answered) html += resultBlock(q, a, order, s, isReview);

    // ツール
    html += '<div class="qtools">' +
      '<button class="tool" data-act="flag" aria-pressed="' + !!store.flags[q.id] + '">' + icon('flag') + '付箋</button>' +
      (isMock ? '<button class="tool review" data-act="rev" aria-pressed="' + !!s.rev[q.id] + '">' + icon('eye') + '見直し</button>' : '') +
      '<button class="tool" data-act="noteToggle">' + icon('note') + 'メモ' + (store.notes[q.id] ? '（あり）' : '') + '</button>' +
      ('speechSynthesis' in window ? '<button class="tool" data-act="speak">' + icon('speak') + '読み上げ</button>' : '') +
      '</div>';
    html += '<div class="note-box" id="noteBox"' + (store.notes[q.id] ? '' : ' hidden') + '><label class="sr" for="noteTa">この問題のメモ</label>' +
      '<textarea class="inp" id="noteTa" placeholder="ゴロ合わせ、関連する条文、間違えた理由など（この端末に自動保存）">' + esc(store.notes[q.id] || '') + '</textarea></div>';
    html += '</article>';

    // ナビゲーション
    var last = s.i === s.ids.length - 1;
    html += '<div class="pnav"><button class="btn prev" data-act="prev"' + (s.i === 0 ? ' disabled' : '') + ' aria-label="前の問題">←</button>';
    if (isMock) {
      html += last ? '<button class="btn primary" data-act="submitMock">提出して採点する</button>' : '<button class="btn primary" data-act="next">次の問題 →</button>';
    } else if (answered || s.done) {
      html += last ? '<button class="btn primary" data-act="finish">' + (s.kind === 'review' ? '見直しを終える' : '結果を見る') + '</button>' : '<button class="btn primary" data-act="next">次の問題 →</button>';
    } else {
      html += '<button class="btn" data-act="next">' + (last ? '結果を見る（この問題はスキップ）' : 'スキップ →') + '</button>';
    }
    html += '</div>';
    if (isMock) html += '<div class="row" style="justify-content:center;margin-top:10px"><button class="linkbtn" data-act="submitMock">解答を提出して採点する（' + nAns + '/' + s.ids.length + '問 解答済み）</button></div>';
    html += '<p class="kbd-hint">キーボード：<kbd>1</kbd>〜<kbd>5</kbd> 選択　<kbd>Enter</kbd> 解答／次へ　<kbd>←</kbd><kbd>→</kbd> 移動　<kbd>F</kbd> 付箋</p>';
    html += '</div>';
    setView(html);
  }
  function resultBlock(q, a, order, s, readonly) {
    var disp = q.ans.map(function (oi) { return order.indexOf(oi) + 1; }).sort().join('・');
    var h = '<div class="result-box ' + (a.ok ? 'ok' : 'ng') + '" id="resultBox" tabindex="-1">' +
      '<div class="verdict"><span class="mk" aria-hidden="true">' + (a.ok ? '○' : '×') + '</span>' + (a.ok ? '正解' : (a.sel && a.sel.length ? '不正解' : '未解答')) +
      '<span class="ans">正答 ' + disp + '</span></div>';
    if (!readonly && s.kind === 'practice') {
      h += '<div class="conf"><span class="lab">' + (a.ok ? '手応えは？' : '次回の復習') + '</span>' +
        (a.ok ? [['sure', '自信あり'], ['unsure', 'あいまい'], ['guess', '勘で当たった']] : [['', '明日もう一度出題します']]).map(function (c) {
          return c[0] ? '<button data-act="conf" data-v="' + c[0] + '" aria-pressed="' + ((a.conf || 'sure') === c[0]) + '">' + c[1] + '</button>' : '<span class="muted">' + c[1] + '</span>';
        }).join('') + '</div>';
    }
    h += '</div>';
    h += '<div class="exp">';
    if (q.exp) h += '<h4>ポイント</h4><div class="point">' + fmt(q.exp) + '</div>';
    if (q.oe && q.oe.length) {
      h += '<h4 style="margin-top:12px">選択肢ごとの解説</h4><ul class="oe">';
      order.forEach(function (oi, k) {
        var isAns = q.ans.indexOf(oi) >= 0, mark, tcls, lab;
        if (q.ox) { var tr = oxTruth(q, oi); mark = tr ? '○' : '×'; tcls = tr ? 't' : 'f'; lab = tr ? '正しい記述' : '誤った記述'; }
        else { mark = isAns ? '◎' : '－'; tcls = isAns ? 't' : 'n'; lab = isAns ? '正答' : '正答ではない'; }
        h += '<li class="' + (isAns ? 'is-ans' : '') + '"><span class="tf ' + tcls + '" role="img" aria-label="' + lab + '">' + mark + '</span>' +
          '<span class="b"><span class="o">' + (k + 1) + '. ' + fmt(q.opts[oi]) + '</span>' + fmt(q.oe[oi] || '') + '</span></li>';
      });
      h += '</ul>';
    }
    h += '</div>';
    var st = qst(q.id);
    if (st && st.n) {
      h += '<div class="qhist"><span>この問題の記録：' + st.c + '/' + st.n + '回 正解（' + pct(st.c, st.n) + '%）</span>' +
        '<span class="dots" aria-label="直近の結果">' + st.h.slice(-10).map(function (x) { return '<i class="' + (x[1] ? 'o' : 'x') + '"></i>'; }).join('') + '</span>' +
        (st.due ? '<span>次の復習：' + (st.due <= dkey() ? '今日' : st.due.slice(5).replace('-', '/')) + '</span>' : '') + '</div>';
    }
    return h;
  }
  function submitAnswer(sel) {
    var s = S(), q = curQ(); if (!q || s.ans[q.id]) return;
    var ok = sameSet(sel, q.ans);
    var prev = recordAnswer(q.id, ok, null);
    s.ans[q.id] = { sel: sel.slice(), ok: ok, at: Date.now(), conf: null, prev: prev };
    delete s.pick[q.id];
    save();
    renderPlay();
    var rb = $('#resultBox');
    if (rb) {
      rb.focus({ preventScroll: true });
      if (store.settings.autoScroll) rb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
  function moveTo(i) {
    var s = S(); if (!s) return;
    s.i = Math.max(0, Math.min(s.ids.length - 1, i));
    save(); stopSpeech(); renderPlay();
    var top = $('.player'); if (top) window.scrollTo(0, Math.max(0, top.getBoundingClientRect().top + window.scrollY - 70));
  }
  function finishPractice() {
    var s = S(); if (!s) return;
    if (s.kind === 'review') { s.done = true; save(true); go(s.back || '#/'); return; }
    tickTimer(); s.done = true; save(true); go('#/result');
  }
  function showPalette() {
    var s = S(); if (!s) return;
    var isMock = s.kind === 'mock';
    var h = '<div class="palette-legend">' + (isMock ? '<span class="l-ans">解答済み</span><span class="l-rev">見直し</span>' : '<span class="l-o">正解</span><span class="l-x">不正解</span>') + '<span>未解答</span></div><div class="palette">';
    s.ids.forEach(function (id, i) {
      var cls = [];
      if (isMock) { if (s.pick[id] && s.pick[id].length) cls.push('ans'); if (s.rev[id]) cls.push('rev'); }
      else if (s.ans[id]) cls.push(s.ans[id].ok ? 'o' : 'x');
      if (i === s.i) cls.push('cur');
      h += '<button class="' + cls.join(' ') + '" data-act="jump" data-i="' + i + '" aria-label="' + (i + 1) + '問目へ">' + (i + 1) + '</button>';
    });
    h += '</div>';
    if (isMock) {
      var revN = Object.keys(s.rev).filter(function (k) { return s.rev[k]; }).length;
      var un = s.ids.filter(function (id) { return !(s.pick[id] && s.pick[id].length); }).length;
      h += '<p class="small muted" style="margin:12px 0 0">未解答 ' + un + '問・見直し ' + revN + '問</p>';
    }
    openModal({ title: '問題一覧（' + s.ids.length + '問）', html: h });
  }

  /* =====================================================================
     画面：演習の結果
     ===================================================================== */
  VIEWS.result = function () {
    var s = S();
    if (!s || s.kind === 'mock' || s.kind === 'ox') { go('#/'); return; }
    var ids = s.ids, ok = 0, ng = 0, skip = 0;
    ids.forEach(function (id) { var a = s.ans[id]; if (!a) skip++; else if (a.ok) ok++; else ng++; });
    var total = ids.length, p = pct(ok, ok + ng) || 0;
    var r = 62, C = 2 * Math.PI * r;
    var html = '<div class="wrap"><h1 class="page">演習の結果</h1><p class="lead">' + esc(s.title) + '</p>';
    html += '<div class="card"><div class="score-hero"><div class="ring"><svg viewBox="0 0 150 150"><circle class="bgc" cx="75" cy="75" r="' + r + '"/>' +
      '<circle class="fgc" cx="75" cy="75" r="' + r + '" stroke-dasharray="' + C + '" stroke-dashoffset="' + (C * (1 - p / 100)) + '"/></svg>' +
      '<div class="lbl"><b class="num">' + p + '%</b><span>正答率</span></div></div><div>' +
      '<div class="kpis" style="grid-template-columns:repeat(4,1fr)"><div class="kpi"><div class="k">正解</div><div class="v num" style="color:var(--ok)">' + ok + '</div></div>' +
      '<div class="kpi"><div class="k">不正解</div><div class="v num" style="color:var(--ng)">' + ng + '</div></div>' +
      '<div class="kpi"><div class="k">スキップ</div><div class="v num">' + skip + '</div></div>' +
      '<div class="kpi"><div class="k">所要時間</div><div class="v num" style="font-size:1em">' + fmtDurJa(s.elapsed) + '</div></div></div>' +
      '<p class="small muted" style="margin:10px 0 0">' + (p >= 80 ? 'よくできています。「自信あり」で正解した問題は復習の間隔が延びていきます。' : p >= 60 ? '合格の目安（6割）に届いています。不正解の問題は明日の「今日の復習」に出てきます。' : '不正解の問題は明日の「今日の復習」に出てきます。まずは解説の○×を読み込むのが近道です。') + '</p>' +
      '</div></div>' +
      '<div class="row" style="margin-top:16px">' + (ng + skip ? '<button class="btn primary" data-act="retryWrong">' + icon('repeat') + ' 不正解・スキップだけ解き直す（' + (ng + skip) + '問）</button>' : '') +
      '<button class="btn" data-act="retryAll">同じ問題をもう一度</button>' + (studyOn() ? '<button class="btn" data-act="studySend">勉強シートに送る</button>' : '') + '<a class="btn ghost" href="#/">ホームへ</a></div></div>';

    // 科目別
    var by = {};
    ids.forEach(function (id) { var q = BYID[id]; var o = by[q.subj] || (by[q.subj] = { n: 0, c: 0 }); o.n++; if (s.ans[id] && s.ans[id].ok) o.c++; });
    var keys = Object.keys(by).sort(function (a, b) { return SUBJ[a].order - SUBJ[b].order; });
    if (keys.length > 1) {
      html += '<h2 class="sec">' + SL + '別</h2><div class="card"><div class="bars">' + keys.map(function (k) {
        var pp = pct(by[k].c, by[k].n);
        return '<div class="brow"><span class="lab">' + esc(SUBJ[k].name) + '</span><div class="meter"><i class="' + (pp >= 60 ? 'ok' : pp >= 40 ? 'warn' : 'ng') + '" style="width:' + pp + '%"></i><span class="line60"></span></div><span class="val">' + by[k].c + '/' + by[k].n + '</span></div>';
      }).join('') + '</div></div>';
    }
    html += '<h2 class="sec">解答一覧 <span class="sub">タップで解説を表示</span></h2><div class="card" style="padding:4px 14px"><ul class="rlist">' + ids.map(function (id, i) {
      var q = BYID[id], a = s.ans[id];
      return '<li><span class="mk ' + (!a ? 'n' : a.ok ? 'o' : 'x') + '">' + (!a ? '－' : a.ok ? '○' : '×') + '</span><button class="b" data-act="reviewAt" data-i="' + i + '">' +
        '<span class="muted tiny">' + esc(qLabel(q)) + (q.topic ? '｜' + esc(q.topic) : '') + '</span><span class="t">' + esc(plain(q.q)) + '</span></button></li>';
    }).join('') + '</ul></div>';
    html += footer() + '</div>';
    setView(html);
  };

  /* =====================================================================
     画面：模擬試験
     ===================================================================== */
  var MOCK_SCOPES = MOCK.scopes;
  VIEWS.mock = function () {
    var html = '<div class="wrap"><h1 class="page">模擬試験</h1><p class="lead">本番と同じく、最後にまとめて採点します。途中で解答を変えたり「見直し」印を付けたりできます。中断中は時間が止まります。</p>';
    var ms = mockSetValue();
    if (SETS.length > 1) {
      html += '<div class="field"><span class="lab">問題セット</span><div class="seg">' +
        SETS.map(function (n) { return segBtn('mockset', String(n), setName(n), ms); }).join('') +
        segBtn('mockset', 'mix', 'ランダム組合せ', ms) + '</div>' +
        '<p class="small muted" style="margin:8px 0 0">' + (ms === 'mix' ? '全' + SETS.length + '回分の問題から、本番と同じ構成で毎回ランダムに組み合わせます。' : setName(ms) + 'の問題（本番と同じ構成）で受験します。' + (META.setNotes && META.setNotes[ms] ? META.setNotes[ms] : '')) + '</p></div>';
    }
    html += '<div class="grid g2">' + MOCK_SCOPES.map(function (m) {
      return '<button class="mode" data-act="mockStart" data-scope="' + m.id + '"><span class="ic">' + icon('clock') + '</span><span class="t">' + m.t + '</span><span class="d">' + m.d + '</span><span class="n">' + m.min + '分</span></button>';
    }).join('') + '</div>';
    if (custom.packs.length) {
      html += '<h2 class="sec">取り込んだ問題で模試</h2><div class="grid g2">' + custom.packs.map(function (p) {
        var min = Math.max(5, Math.round(p.qs.length * MOCK.minPerQ));
        return '<button class="mode" data-act="mockStart" data-scope="pack" data-pack="' + esc(p.id) + '"><span class="ic">' + icon('book') + '</span><span class="t">' + esc(p.name) + '</span><span class="d">' + p.qs.length + '問・' + min + '分（本番の1問あたり時間で換算）</span></button>';
      }).join('') + '</div>';
    }
    html += '<div class="notice" style="margin-top:18px"><strong>採点と合否判定：</strong>' + MOCK.noticeHtml + '</div>';
    if (store.mocks.length) {
      html += '<h2 class="sec">受験履歴</h2><div class="card" style="padding:6px 14px; overflow-x:auto"><table class="tbl"><thead><tr><th>日時</th><th>種類</th><th class="r">得点</th><th class="r">得点率</th><th class="r">時間</th><th></th></tr></thead><tbody>' +
        store.mocks.map(function (m, i) { return { m: m, i: i }; }).reverse().map(function (x) {
          var m = x.m;
          return '<tr><td class="num small">' + fmtDate(m.ts) + '</td><td class="small">' + esc(m.label) + '</td><td class="r num"><b>' + m.score + '</b>/' + m.total + '</td><td class="r num">' + pct(m.score, m.total) + '%</td><td class="r num small">' + fmtDurJa(m.dur) + '</td>' +
            '<td class="r"><a class="btn small" href="#/mockres?i=' + x.i + '">詳細</a></td></tr>';
        }).join('') + '</tbody></table></div>';
      html += '<h2 class="sec">得点の推移</h2><div class="card">' + mockTrend() + '</div>';
    }
    html += footer() + '</div>';
    setView(html);
  };
  function mockTrend() {
    var ms = store.mocks.filter(function (m) { return m.scope === 'full'; }).slice(-12);
    if (ms.length < 1) return '<p class="small muted">' + esc(MOCK_SCOPES[0].t) + 'を受けると、得点の推移がここに表示されます。</p>';
    var W = 600, H = 180, pad = 28, max = MOCK.trendMax;
    var x = function (i) { return pad + (ms.length === 1 ? (W - 2 * pad) / 2 : i * (W - 2 * pad) / (ms.length - 1)); };
    var y = function (v) { return H - pad - v / max * (H - 2 * pad); };
    var lines = MOCK.refLines || [];
    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;height:auto" role="img" aria-label="模擬試験の得点の推移">';
    lines.forEach(function (l) { svg += '<line x1="' + pad + '" x2="' + (W - pad) + '" y1="' + y(l[0]) + '" y2="' + y(l[0]) + '" stroke="currentColor" stroke-opacity=".25" stroke-dasharray="4 4"/><text x="' + (W - pad) + '" y="' + (y(l[0]) - 4) + '" font-size="11" text-anchor="end" fill="currentColor" fill-opacity=".6">' + l[1] + ' ' + l[0] + '点</text>'; });
    svg += '<polyline fill="none" stroke="var(--accent)" stroke-width="2.5" points="' + ms.map(function (m, i) { return x(i) + ',' + y(m.score); }).join(' ') + '"/>';
    ms.forEach(function (m, i) { svg += '<circle cx="' + x(i) + '" cy="' + y(m.score) + '" r="4.5" fill="var(--accent)"/><text x="' + x(i) + '" y="' + (y(m.score) - 9) + '" font-size="11" text-anchor="middle" fill="currentColor">' + m.score + '</text>'; });
    return svg + '</svg>';
  }
  function mockSetValue() {
    var v = store.mockSet || String(MOCK.defaultSet || SETS[0] || 1);
    if (v !== 'mix' && SETS.indexOf(+v) < 0) v = String(SETS[0] || 1);
    return v;
  }
  // set: '1' '2' … または 'mix'（全セットから本番の科目別出題数で抽出）
  function mockIds(scope, packId, set) {
    if (scope === 'pack') return sourceIds(packId);
    var pool = BUILTIN_IDS.filter(function (id) { return set === 'mix' || BYID[id].set === +set; });
    if (MOCK.build) return MOCK.build(scope, pool, { BYID: BYID, SUBJ: SUBJ, subjects: META.subjects, shuffle: shuffle, mix: set === 'mix' });
    var bySubj = function (sj, n) {
      var p = pool.filter(function (id) { return BYID[id].subj === sj.id; });
      if (set === 'mix' || n < p.length) p = shuffle(p).slice(0, n);
      return p.sort(function (a, b) { return (BYID[a].set - BYID[b].set) || (BYID[a].gno - BYID[b].gno); });
    };
    var out = [];
    META.subjects.forEach(function (sj) {
      if (scope === 'am' && sj.session !== 'am') return;
      if (scope === 'pm' && sj.session !== 'pm') return;
      out = out.concat(bySubj(sj, scope === 'mini' ? 2 : sj.count));
    });
    return out;
  }
  function startMock(scope, packId) {
    var set = mockSetValue();
    var ids = mockIds(scope, packId, set);
    var sc = MOCK_SCOPES.filter(function (m) { return m.id === scope; })[0];
    var pack = custom.packs.filter(function (p) { return p.id === packId; })[0];
    var min = sc ? sc.min : Math.max(5, Math.round(ids.length * MOCK.minPerQ));
    var label = sc ? sc.t + (SETS.length > 1 ? '・' + (set === 'mix' ? 'ランダム組合せ' : setName(set)) : '') : '取込: ' + (pack ? pack.name : '');
    // 「問題N」の通し番号（本番と同じ番号。午後のみなら午前の問題数の次から）
    var offset = sc && sc.offset != null ? sc.offset : null;
    startSession({ kind: 'mock', title: '模擬試験｜' + label, ids: ids, shuffle: false, mock: { scope: scope, set: scope === 'pack' ? null : set, pack: packId || null, limit: min * 60, label: label, offset: offset } });
  }
  function gradeMock(auto) {
    var s = S(); if (!s || s.kind !== 'mock') return;
    tickTimer(); stopTimer();
    var score = 0, total = 0, nc = 0, bySubj = {}, sel = {};
    s.ids.forEach(function (id) {
      var q = BYID[id]; if (!q) return;
      var p = s.pick[id] || [];
      var ok = p.length > 0 && sameSet(p, q.ans);
      var pt = points(q);
      total += pt;
      if (ok) { score += pt; nc++; }
      var o = bySubj[q.subj] || (bySubj[q.subj] = [0, 0]); o[1]++; if (ok) o[0]++;
      sel[id] = p;
      if (p.length) recordAnswer(id, ok, null);
    });
    var rec = { ts: Date.now(), scope: s.mock.scope, set: s.mock.set || null, offset: s.mock.offset != null ? s.mock.offset : null, pack: s.mock.pack, label: s.mock.label, total: total, score: score, nq: s.ids.length, nc: nc, dur: Math.min(s.elapsed, s.mock.limit * 1000), limit: s.mock.limit, bySubj: bySubj, ids: s.ids.slice(), sel: sel, auto: !!auto };
    store.mocks.push(rec);
    if (store.mocks.length > 30) store.mocks = store.mocks.slice(-30);
    s.done = true;
    save(true);
    if (auto) toast('時間になりました。自動で採点しました。');
    go('#/mockres?i=' + (store.mocks.length - 1));
  }
  function groupScores(m) {
    return META.groups.map(function (g) {
      var c = 0, n = 0;
      g.subjects.forEach(function (sid) { var o = m.bySubj[sid]; if (o) { c += o[0]; n += o[1]; } });
      return { g: g, c: c, n: n };
    }).filter(function (x) { return x.n > 0; });
  }
  VIEWS.mockres = function (p) {
    var m = store.mocks[+p.i];
    if (!m) { go('#/mock'); return; }
    var rate = pct(m.score, m.total) || 0;
    var gs = groupScores(m);
    var strict = META.groupRule === 'nonzero';
    var zero = gs.filter(function (x) { return x.c === 0; });
    var jd = MOCK.judge(m, rate, strict && zero.length > 0), judge = jd.label, cls = jd.cls;
    var r = 62, C = 2 * Math.PI * r;
    var html = '<div class="wrap"><h1 class="page">模擬試験の結果</h1><p class="lead">' + esc(m.label) + '　' + fmtDate(m.ts) + (m.auto ? '（時間切れで自動採点）' : '') + '</p>';
    html += '<div class="card"><div class="score-hero"><div class="ring"><svg viewBox="0 0 150 150"><circle class="bgc" cx="75" cy="75" r="' + r + '"/><circle class="fgc" cx="75" cy="75" r="' + r + '" stroke-dasharray="' + C + '" stroke-dashoffset="' + (C * (1 - rate / 100)) + '"/></svg>' +
      '<div class="lbl"><b class="num">' + m.score + '</b><span>/ ' + m.total + '点</span></div></div><div>' +
      '<div class="judge ' + cls + '">' + esc(judge) + '</div>' +
      '<p class="small" style="margin:4px 0">得点率 <b>' + rate + '%</b>' + (m.nq && m.nq !== m.total ? '（正解 ' + m.nc + '/' + m.nq + '問）' : '') + '　所要 ' + fmtDurJa(m.dur) + ' / ' + Math.round(m.limit / 60) + '分</p>' +
      '<p class="small muted" style="margin:0">' + esc(MOCK.refText(m)) + '</p>' +
      '</div></div>';
    if (gs.length) {
      html += '<h3 style="margin-top:18px">' + esc(GROUP_LABEL) + 'ごとの正解数' + (strict ? ' <span class="small muted" style="font-weight:400">（1群でも0点なら不合格）</span>' : '') + '</h3><div class="groups">' + gs.map(function (x) {
        return '<div class="gbox' + (strict && x.c === 0 ? ' zero' : '') + '"><div class="k">' + esc(x.g.name) + '</div><div class="v num">' + x.c + '/' + x.n + '</div></div>';
      }).join('') + '</div>';
    }
    html += '<div class="row" style="margin-top:16px"><button class="btn primary" data-act="mockReview" data-i="' + p.i + '">' + icon('eye') + ' 全問の解説を見る</button>' +
      (m.score < m.total ? '<button class="btn" data-act="mockWrong" data-i="' + p.i + '">' + icon('repeat') + ' 間違えた問題を演習</button>' : '') +
      (studyOn() ? '<button class="btn" data-act="studySend">勉強シートに送る</button>' : '') +
      '<a class="btn ghost" href="#/mock">模試トップへ</a></div></div>';
    html += '<h2 class="sec">' + SL + '別の正解数</h2><div class="card"><div class="bars">' + Object.keys(m.bySubj).sort(function (a, b) { return (SUBJ[a] || OTHER).order - (SUBJ[b] || OTHER).order; }).map(function (k) {
      var o = m.bySubj[k], pp = pct(o[0], o[1]);
      return '<div class="brow"><span class="lab">' + esc((SUBJ[k] || OTHER).name) + '</span><div class="meter"><i class="' + (pp >= 60 ? 'ok' : pp >= 40 ? 'warn' : 'ng') + '" style="width:' + pp + '%"></i><span class="line60"></span></div><span class="val">' + o[0] + '/' + o[1] + '</span></div>';
    }).join('') + '</div></div>';
    html += '<h2 class="sec">解答一覧</h2><div class="card" style="padding:4px 14px"><ul class="rlist">' + m.ids.map(function (id, i) {
      var q = BYID[id]; if (!q) return '';
      var sel = m.sel[id] || [], ok = sel.length && sameSet(sel, q.ans);
      return '<li><span class="mk ' + (!sel.length ? 'n' : ok ? 'o' : 'x') + '">' + (!sel.length ? '－' : ok ? '○' : '×') + '</span><button class="b" data-act="mockReview" data-i="' + p.i + '" data-at="' + i + '">' +
        '<span class="muted tiny">' + (m.offset != null ? '問題' + (m.offset + i + 1) + '｜' : (q.gno && m.scope !== 'pack' && !m.set ? '問題' + q.gno + '｜' : '')) + esc(subjName(q)) + (q.topic ? '｜' + esc(q.topic) : '') + '</span><span class="t">' + esc(plain(q.q)) + '</span></button></li>';
    }).join('') + '</ul></div>';
    html += footer() + '</div>';
    setView(html);
  };

  /* =====================================================================
     画面：一問一答（○×）
     ===================================================================== */
  VIEWS.ox = function () {
    var cfg = Object.assign({ subjects: META.subjects.map(function (s) { return s.id; }), status: 'all', count: '20' }, store.oxSetup || {});
    store.oxSetup = cfg;
    var all = oxAll(null);
    var done = all.filter(function (id) { return store.ox[id] && store.ox[id].n; }).length;
    var html = '<div class="wrap"><h1 class="page">一問一答（○×）</h1><p class="lead">5択問題の選択肢を1文ずつ取り出して、正しい記述か誤った記述かを判定します。全 <b>' + all.length + '</b> 文（回答済み ' + done + '）。</p>';
    html += '<div class="field"><span class="lab">' + SL + '</span><div class="row" style="margin-bottom:8px"><button class="btn small" data-act="subjAll" data-v="1">すべて選択</button><button class="btn small" data-act="subjAll" data-v="0">すべて解除</button></div><div class="subj-pick"><div class="grp-box"><div class="grp-items">';
    META.subjects.forEach(function (sj) {
      var n = all.filter(function (id) { return oxParse(id).q.subj === sj.id; }).length;
      html += '<label class="chk"><input type="checkbox" name="subj" value="' + sj.id + '"' + (cfg.subjects.indexOf(sj.id) >= 0 ? ' checked' : '') + '><span>' + esc(sj.name) + '</span><span class="c">' + n + '文</span></label>';
    });
    html += '</div></div></div></div>';
    html += '<div class="field"><span class="lab">絞り込み</span><div class="seg">' + [['all', 'すべて'], ['new', '未回答'], ['wrong', '前回まちがえた']].map(function (f) { return segBtn('oxstatus', f[0], f[1], cfg.status); }).join('') + '</div></div>';
    html += '<div class="field"><span class="lab">出題数（ランダム）</span><div class="seg">' + ['10', '20', '50', 'all'].map(function (c) { return segBtn('oxcount', c, c === 'all' ? '全部' : c + '文', cfg.count); }).join('') + '</div></div>';
    html += '<div class="sticky-go"><div class="info">対象 <b class="num" id="matchN">0</b> 文</div><span class="spacer"></span><button class="btn primary" data-act="startOx" id="goBtn">' + icon('play') + ' スタート</button></div>';
    html += footer() + '</div>';
    setView(html);
    updateOxCount();
  };
  function oxMatches() {
    var cfg = store.oxSetup, set = {};
    cfg.subjects.forEach(function (s) { set[s] = 1; });
    return oxAll(set).filter(function (id) {
      var st = store.ox[id];
      if (cfg.status === 'new') return !st || !st.n;
      if (cfg.status === 'wrong') return !!(st && st.n && st.lastOk === false);
      return true;
    });
  }
  function updateOxCount() {
    var cfg = store.oxSetup;
    cfg.subjects = $all('input[name="subj"]:checked').map(function (i) { return i.value; });
    var ids = oxMatches();
    var n = cfg.count === 'all' ? ids.length : Math.min(ids.length, +cfg.count);
    $('#matchN').textContent = n; $('#goBtn').disabled = n === 0; save();
  }
  VIEWS.oxplay = function () {
    var s = S();
    if (!s || s.kind !== 'ox') { go('#/ox'); return; }
    s.ids = s.ids.filter(function (id) { return oxParse(id).q; });
    if (!s.ids.length) { go('#/ox'); return; }
    renderOx();
    if (!s.done) startTimer();
  };
  function renderOx() {
    var s = S(), id = s.ids[s.i], it = oxParse(id), q = it.q, i = it.i;
    var truth = oxTruth(q, i), a = s.ans[id];
    var nAns = Object.keys(s.ans).length;
    var html = '<div class="player"><div class="ptop"><button class="btn small ghost" data-act="quit">' + icon('x') + (s.done ? ' 閉じる' : ' 中断') + '</button><span class="title">' + esc(s.title) + '</span>' +
      '<span class="timer num">' + (s.i + 1) + ' / ' + s.ids.length + '</span></div>' +
      '<div class="progress"><i style="width:' + (nAns / s.ids.length * 100) + '%"></i></div>' +
      '<article class="qcard oxcard"><div class="qmeta"><span class="chip acc">' + esc(subjName(q)) + '</span>' + (q.topic ? '<span class="chip">' + esc(q.topic) + '</span>' : '') + '</div>' +
      '<p class="stmt">' + fmt(q.opts[i]) + '</p>' +
      '<div class="oxbtns"><button class="oxbtn o' + (a ? (truth ? ' truth' : '') + (a.pick === 'o' ? ' picked' : '') : '') + '" data-act="oxAns" data-v="o"' + (a ? ' disabled' : '') + '><span class="sym">○</span>正しい</button>' +
      '<button class="oxbtn x' + (a ? (!truth ? ' truth' : '') + (a.pick === 'x' ? ' picked' : '') : '') + '" data-act="oxAns" data-v="x"' + (a ? ' disabled' : '') + '><span class="sym">×</span>誤り</button></div>';
    if (a) {
      html += '<div class="result-box ' + (a.ok ? 'ok' : 'ng') + '" id="resultBox" tabindex="-1"><div class="verdict"><span class="mk">' + (a.ok ? '○' : '×') + '</span>' + (a.ok ? '正解' : '不正解') +
        '<span class="ans">この記述は「' + (truth ? '正しい' : '誤り') + '」</span></div></div>' +
        '<div class="exp"><h4>解説</h4><div class="point">' + fmt(q.oe[i] || '') + '</div></div>' +
        '<div class="row" style="margin-top:10px"><button class="linkbtn" data-act="oxSource">元の5択問題を見る</button></div>';
    }
    html += '</article><div class="pnav"><button class="btn prev" data-act="prev"' + (s.i === 0 ? ' disabled' : '') + '>←</button>' +
      (a ? (s.i === s.ids.length - 1 ? '<button class="btn primary" data-act="oxFinish">結果を見る</button>' : '<button class="btn primary" data-act="next">次へ →</button>') :
        '<button class="btn" data-act="next">' + (s.i === s.ids.length - 1 ? '結果を見る（スキップ）' : 'スキップ →') + '</button>') + '</div>' +
      '<p class="kbd-hint">キーボード：<kbd>O</kbd>/<kbd>1</kbd> 正しい　<kbd>X</kbd>/<kbd>2</kbd> 誤り　<kbd>Enter</kbd> 次へ</p></div>';
    setView(html);
  }
  VIEWS.oxresult = function () {
    var s = S();
    if (!s || s.kind !== 'ox') { go('#/ox'); return; }
    var ok = 0, ng = 0;
    s.ids.forEach(function (id) { var a = s.ans[id]; if (a) { if (a.ok) ok++; else ng++; } });
    var p = pct(ok, ok + ng) || 0;
    var html = '<div class="wrap"><h1 class="page">一問一答の結果</h1><div class="card"><div class="kpis" style="grid-template-columns:repeat(3,1fr)">' +
      '<div class="kpi"><div class="k">正答率</div><div class="v num">' + p + '<small>%</small></div></div><div class="kpi"><div class="k">正解</div><div class="v num" style="color:var(--ok)">' + ok + '</div></div><div class="kpi"><div class="k">不正解</div><div class="v num" style="color:var(--ng)">' + ng + '</div></div></div>' +
      '<div class="row" style="margin-top:14px">' + (ng ? '<button class="btn primary" data-act="oxRetryWrong">間違えた文だけもう一度（' + ng + '）</button>' : '') + (studyOn() ? '<button class="btn" data-act="studySend">勉強シートに送る</button>' : '') + '<a class="btn" href="#/ox">一問一答トップへ</a></div></div>';
    html += '<h2 class="sec">回答一覧</h2><div class="card" style="padding:4px 14px"><ul class="rlist">' + s.ids.map(function (id, i) {
      var it = oxParse(id), a = s.ans[id], tr = oxTruth(it.q, it.i);
      return '<li><span class="mk ' + (!a ? 'n' : a.ok ? 'o' : 'x') + '">' + (!a ? '－' : a.ok ? '○' : '×') + '</span><button class="b" data-act="oxAt" data-i="' + i + '"><span class="muted tiny">' + esc(subjName(it.q)) + '｜答え：' + (tr ? '正しい' : '誤り') + '</span><span class="t">' + esc(plain(it.q.opts[it.i])) + '</span></button></li>';
    }).join('') + '</ul></div>' + footer() + '</div>';
    setView(html);
  };

  /* =====================================================================
     画面：一覧・検索
     ===================================================================== */
  var listState = { kw: '', subj: 'all', status: 'all', sort: 'no', src: 'all' };
  VIEWS.list = function (p) {
    if (p.kw != null) listState.kw = p.kw;
    var html = '<div class="wrap"><h1 class="page">一覧・検索</h1><p class="lead">問題文・選択肢・解説をまとめて検索できます（ひらがな／カタカナ、全角／半角の違いは無視）。</p>';
    html += '<div class="searchbar"><label class="sr" for="kw">キーワード</label><input class="inp" id="kw" type="search" placeholder="' + esc(APP.searchPlaceholder) + '" value="' + esc(listState.kw) + '" autocomplete="off"></div>';
    html += '<div class="filters"><select class="inp" id="fSubj" aria-label="' + SL + '"><option value="all">すべての' + SL + '</option>' +
      META.subjects.map(function (s) { return '<option value="' + s.id + '"' + (listState.subj === s.id ? ' selected' : '') + '>' + esc(s.name) + '</option>'; }).join('') +
      (BANK.some(function (q) { return q.subj === 'other'; }) ? '<option value="other"' + (listState.subj === 'other' ? ' selected' : '') + '>' + esc(OTHER.name) + '</option>' : '') + '</select>' +
      '<select class="inp" id="fStatus" aria-label="状態">' + STATUS_FILTERS.map(function (f) { return '<option value="' + f[0] + '"' + (listState.status === f[0] ? ' selected' : '') + '>' + f[1] + '</option>'; }).join('') + '</select>' +
      '<select class="inp" id="fSort" aria-label="並び順">' + [['no', '番号順'], ['acc', '正答率が低い順'], ['recent', '最近解いた順'], ['count', '解答回数が多い順']].map(function (f) { return '<option value="' + f[0] + '"' + (listState.sort === f[0] ? ' selected' : '') + '>' + f[1] + '</option>'; }).join('') + '</select>' +
      (custom.packs.length ? '<select class="inp" id="fSrc" aria-label="問題の種類"><option value="all">収録＋取込</option><option value="b"' + (listState.src === 'b' ? ' selected' : '') + '>収録問題のみ</option>' + custom.packs.map(function (pk) { return '<option value="' + esc(pk.id) + '"' + (listState.src === pk.id ? ' selected' : '') + '>' + esc(pk.name) + '</option>'; }).join('') + '</select>' : '') +
      '</div>';
    html += '<div class="row between" style="margin:0 0 10px"><span class="small muted" id="listCount"></span><span class="row"><button class="btn small" data-act="listPlay">' + icon('play') + ' この条件で演習</button><button class="btn small" data-act="listPrint">' + icon('print') + ' 印刷</button></span></div>';
    html += '<ul class="qlist" id="qlist"></ul>' + footer() + '</div>';
    setView(html);
    renderList();
  };
  function listIds() {
    var kw = normalize(listState.kw.trim());
    var terms = kw ? kw.split(/\s+/) : [];
    var ids = BANK.filter(function (q) {
      if (listState.src !== 'all' && q.src !== listState.src) return false;
      if (listState.subj !== 'all' && q.subj !== listState.subj) return false;
      if (!matchStatus(q.id, listState.status)) return false;
      if (!terms.length) return true;
      var hay = q._hay || (q._hay = normalize([q.topic, q.label, q.q, q.case, q.opts.join(' '), q.exp, (q.oe || []).join(' '), subjName(q)].join(' ')));
      var note = normalize(store.notes[q.id] || '');
      return terms.every(function (t) { return hay.indexOf(t) >= 0 || note.indexOf(t) >= 0; });
    }).map(function (q) { return q.id; });
    ids = orderedIds(ids);
    if (listState.sort === 'acc') ids.sort(function (a, b) { return accOf(a) - accOf(b); });
    if (listState.sort === 'recent') ids.sort(function (a, b) { return ((qst(b) || {}).last || 0) - ((qst(a) || {}).last || 0); });
    if (listState.sort === 'count') ids.sort(function (a, b) { return ((qst(b) || {}).n || 0) - ((qst(a) || {}).n || 0); });
    return ids;
  }
  function accOf(id) { var st = qst(id); return st && st.n ? st.c / st.n : 2; }
  function hl(text, terms) {
    var h = esc(plain(text));
    if (!terms.length) return h;
    // 表示テキストは正規化前なので、そのままの語で強調（大文字小文字は無視）
    terms.forEach(function (t) {
      if (!t) return;
      var re = new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      h = h.replace(re, function (m) { return '<mark>' + m + '</mark>'; });
    });
    return h;
  }
  function renderList() {
    var ids = listIds();
    var raw = listState.kw.trim(), terms = raw ? raw.split(/\s+/) : [];
    $('#listCount').textContent = ids.length + '問';
    var ul = $('#qlist');
    if (!ids.length) { ul.innerHTML = '<li class="empty">該当する問題がありません。</li>'; return; }
    var shown = ids.slice(0, 200);
    ul.innerHTML = shown.map(function (id, i) {
      var q = BYID[id], st = qst(id);
      var mk = !st || !st.n ? '' : st.lastOk ? 'o' : 'x';
      var snip = '';
      if (terms.length) {
        var nt = normalize(terms[0]);
        var fields = [q.case || ''].concat(q.opts, [q.exp || ''], q.oe || []);
        for (var f = 0; f < fields.length; f++) {
          var nf = normalize(fields[f]), pos = nf.indexOf(nt);
          if (pos >= 0) { var st0 = Math.max(0, pos - 24); snip = (st0 ? '…' : '') + fields[f].slice(st0, pos + 60) + '…'; break; }
        }
      }
      return '<li><button class="qitem" data-act="listOpen" data-i="' + i + '"><span class="st ' + mk + '">' + (mk === 'o' ? '○' : mk === 'x' ? '×' : '') + '</span><span class="b">' +
        '<span class="t">' + hl(q.q, terms) + '</span>' + (snip ? '<span class="snip">' + hl(snip, terms) + '</span>' : '') +
        '<span class="m"><span class="chip acc">' + esc(qLabel(q)) + '</span>' + (q.topic ? '<span class="chip">' + hl(q.topic, terms) + '</span>' : '') +
        (st && st.n ? '<span class="chip ' + (st.c / st.n >= 0.6 ? 'ok' : 'ng') + '">' + st.c + '/' + st.n + '</span>' : '') +
        (store.flags[id] ? '<span class="chip flag">付箋</span>' : '') + (store.notes[id] ? '<span class="chip">メモ</span>' : '') +
        (q.ans.length > 1 ? '<span class="chip warn">2つ選ぶ</span>' : '') + '</span></span></button></li>';
    }).join('') + (ids.length > 200 ? '<li class="empty">ほか ' + (ids.length - 200) + '問。キーワードや' + SL + 'で絞り込んでください。</li>' : '');
  }
  function printQuestions(ids, title) {
    var h = '<h1>' + esc(title) + '（' + ids.length + '問）</h1><p style="font-size:9pt">' + esc(APP.name) + '／独自作成の練習問題　印刷日 ' + dkey() + '</p>';
    ids.forEach(function (id, i) {
      var q = BYID[id];
      h += '<div class="pq"><div class="h">問' + (i + 1) + '　<span style="font-weight:normal;font-size:9pt">［' + esc(subjName(q)) + '］</span></div>' +
        (APP.caseFirst && q.case ? '<div class="pcase">' + esc(plain(q.case)) + '</div><div>' + esc(plain(q.q)) + '</div>' : '<div>' + esc(plain(q.q)) + '</div>' + (q.case ? '<div class="pcase">' + esc(plain(q.case)) + '</div>' : '')) + '<ol class="po">' +
        q.opts.map(function (o) { return '<li>' + esc(plain(o)) + '</li>'; }).join('') + '</ol></div>';
    });
    h += '<div class="pans"><h1>解答・解説</h1>';
    ids.forEach(function (id, i) {
      var q = BYID[id];
      h += '<div class="pa"><b>問' + (i + 1) + '　正答 ' + q.ans.map(function (x) { return x + 1; }).join('・') + '</b>　' + esc(plain(q.exp || '')) + '</div>';
    });
    h += '</div>';
    $('#printArea').innerHTML = h;
    setTimeout(function () { window.print(); }, 50);
  }

  /* =====================================================================
     画面：学習記録
     ===================================================================== */
  VIEWS.stats = function () {
    var totN = 0, totC = 0, days = 0;
    Object.keys(store.days).forEach(function (k) { var d = store.days[k]; totN += d.n; totC += d.c; if (d.n) days++; });
    var done = BUILTIN_IDS.filter(function (id) { var s = qst(id); return s && s.n; }).length;
    var mastered = BUILTIN_IDS.filter(function (id) { var s = qst(id); return s && s.box >= 3; }).length;
    var html = '<div class="wrap"><h1 class="page">学習記録</h1><p class="lead">この端末に保存されている記録です。別の端末へ移すときは「設定 → データの書き出し」を使います。</p>';
    html += '<div class="grid g4">' + kpi('総解答数', totN, '問') + kpi('累計正答率', totN ? pct(totC, totN) : '–', totN ? '%' : '') + kpi('学習日数', days, '日') + kpi('連続学習', streak(), '日') +
      kpi('網羅率', pct(done, BUILTIN_IDS.length) || 0, '%', done + '/' + BUILTIN_IDS.length + '問') + kpi('定着（3回以上連続正解）', mastered, '問') + kpi('復習待ち', dueIds().length, '問') + kpi('模試受験', store.mocks.length, '回') + '</div>';

    // 日別
    var today = dkey(), arr = [];
    for (var i = 29; i >= 0; i--) { var k = addDays(today, -i); arr.push({ k: k, d: store.days[k] || { n: 0, c: 0 } }); }
    var mx = Math.max.apply(null, arr.map(function (x) { return x.d.n; }).concat([10]));
    html += '<h2 class="sec">直近30日の解答数</h2><div class="card"><div class="daychart" role="img" aria-label="直近30日の解答数">' + arr.map(function (x) {
      return '<span class="d" data-tip="' + x.k.slice(5).replace('-', '/') + '　' + x.d.n + '問（正解' + x.d.c + '）"><i style="height:' + ((x.d.n - x.d.c) / mx * 100) + '%"></i><i class="c" style="height:' + (x.d.c / mx * 100) + '%;border-radius:0"></i></span>';
    }).join('') + '</div><div class="dayaxis"><span>' + arr[0].k.slice(5).replace('-', '/') + '</span><span>今日</span></div>' +
      '<div class="legend"><span style="--k:var(--ok)">正解</span><span style="--k:var(--accent)">不正解</span></div></div>';

    // ヒートマップ（20週）
    var start = addDays(today, -(19 * 7 + parseKey(today).getDay()));
    var cells = '';
    for (var j = 0; j <= daysBetween(start, today); j++) {
      var kk = addDays(start, j), n = (store.days[kk] || {}).n || 0;
      var lv = n === 0 ? '' : n < 5 ? 'l1' : n < 15 ? 'l2' : n < 30 ? 'l3' : 'l4';
      cells += '<i class="' + lv + '" title="' + kk + '：' + n + '問"></i>';
    }
    html += '<h2 class="sec">学習カレンダー（20週）</h2><div class="card"><div class="heat">' + cells + '</div><div class="legend"><span>少</span><span style="--k:color-mix(in srgb, var(--ok) 30%, var(--bg2))">1〜4</span><span style="--k:color-mix(in srgb, var(--ok) 55%, var(--bg2))">5〜14</span><span style="--k:color-mix(in srgb, var(--ok) 80%, var(--bg2))">15〜29</span><span style="--k:var(--ok)">30〜</span></div></div>';

    // 科目別
    var ss = subjStats(BUILTIN_IDS);
    html += '<h2 class="sec">' + SL + '別の正答率 <span class="sub">縦線は60%</span></h2><div class="card"><div class="bars">' + META.subjects.map(function (sj) {
      var o = ss[sj.id] || { n: 0, c: 0, done: 0, total: 0 }, p = pct(o.c, o.n);
      return '<div class="brow"><span class="lab" title="' + esc(sj.name) + '">' + esc(sj.name) + '</span><div class="meter"><i class="' + (p == null ? '' : p >= 60 ? 'ok' : p >= 40 ? 'warn' : 'ng') + '" style="width:' + (p || 0) + '%"></i><span class="line60"></span></div><span class="val">' + (p == null ? '–' : p + '%') + '</span></div>';
    }).join('') + '</div>';
    var weakS = META.subjects.map(function (sj) { var o = ss[sj.id]; return { sj: sj, p: o && o.n >= 3 ? o.c / o.n : null }; }).filter(function (x) { return x.p != null; }).sort(function (a, b) { return a.p - b.p; }).slice(0, 3);
    if (weakS.length) html += '<div class="row" style="margin-top:14px"><span class="small">苦手な' + SL + '：' + weakS.map(function (x) { return '<b>' + esc(x.sj.short) + '</b>（' + Math.round(x.p * 100) + '%）'; }).join('、') + '</span><span class="spacer"></span><button class="btn small primary" data-act="weakSubj" data-v="' + weakS.map(function (x) { return x.sj.id; }).join(',') + '">この科目を集中演習</button></div>';
    html += '</div>';

    // 科目群別（分野別）
    html += '<h2 class="sec">' + esc(GROUP_LABEL) + '別</h2><div class="groups">' + META.groups.map(function (g) {
      var c = 0, n = 0; g.subjects.forEach(function (sid) { var o = ss[sid]; if (o) { c += o.c; n += o.n; } });
      return '<div class="gbox"><div class="k">' + g.name + '</div><div class="v num">' + (n ? pct(c, n) + '%' : '–') + '</div></div>';
    }).join('') + '</div>';

    // よく間違える問題
    var worst = BANK.filter(function (q) { var s = qst(q.id); return s && s.n && s.c < s.n; })
      .sort(function (a, b) { var A = qst(a.id), B = qst(b.id); return (A.c / A.n - B.c / B.n) || (B.n - A.n); }).slice(0, 8);
    if (worst.length) {
      html += '<h2 class="sec">よく間違える問題</h2><div class="card" style="padding:4px 14px"><ul class="rlist">' + worst.map(function (q) {
        var s = qst(q.id);
        return '<li><span class="mk x">×</span><button class="b" data-act="openOne" data-id="' + esc(q.id) + '"><span class="muted tiny">' + esc(qLabel(q)) + '｜正解 ' + s.c + '/' + s.n + '</span><span class="t">' + esc(plain(q.q)) + '</span></button></li>';
      }).join('') + '</ul><div class="row" style="padding:10px 0"><button class="btn small" data-act="quick" data-q="weak">苦手な問題をまとめて演習</button></div></div>';
    }
    html += footer() + '</div>';
    setView(html);
  };
  function kpi(k, v, unit, sub) { return '<div class="kpi" style="background:var(--surface)"><div class="k">' + k + '</div><div class="v num">' + v + '<small>' + (unit || '') + '</small></div>' + (sub ? '<div class="tiny muted">' + sub + '</div>' : '') + '</div>'; }

  /* =====================================================================
     画面：設定・データ
     ===================================================================== */
  VIEWS.settings = function () {
    var st = store.settings;
    var html = '<div class="wrap"><h1 class="page">設定・データ</h1>';
    html += '<h2 class="sec">表示</h2><div class="card">' +
      '<div class="field"><span class="lab">テーマ</span><div class="seg">' + segBtn('theme', 'auto', '端末に合わせる', st.theme) + segBtn('theme', 'light', 'ライト', st.theme) + segBtn('theme', 'dark', 'ダーク', st.theme) + '</div></div>' +
      '<div class="field" style="margin:0"><span class="lab">文字の大きさ</span><div class="seg">' + segBtn('font', 's', '小', st.font) + segBtn('font', 'm', '標準', st.font) + segBtn('font', 'l', '大', st.font) + segBtn('font', 'xl', '特大', st.font) + '</div></div></div>';
    html += '<h2 class="sec">解き方</h2><div class="card" style="padding:4px 16px">' +
      switchRow('instant', '選択肢を押したらすぐ採点', '「2つ選ぶ」問題は、2つ選んでから採点します。', st.instant) +
      switchRow('shuffleOpts', '選択肢の並びをシャッフル', '次に始める演習から反映されます。', st.shuffleOpts) +
      switchRow('emphasize', '「誤っているもの」「不適切なもの」「2つ選ぶ」などを強調', '問われ方の読み違いを防ぎます。', st.emphasize) +
      switchRow('autoScroll', '解答後に正誤の表示までスクロール', 'スマートフォンで便利です。', st.autoScroll) +
      switchRow('showTimer', '演習中に経過時間を表示', '模擬試験の残り時間は常に表示されます。', st.showTimer) + '</div>';
    html += '<h2 class="sec">目標</h2><div class="card"><div class="grid g2 stack-s">' +
      '<div class="field" style="margin:0"><label class="lab" for="goalIn">1日の目標問題数</label><input class="inp" id="goalIn" type="number" min="1" max="500" value="' + (+st.dailyGoal || 20) + '"></div>' +
      '<div class="field" style="margin:0"><label class="lab" for="examIn">試験日（カウントダウン用）</label><input class="inp" id="examIn" type="date" value="' + esc(st.examDate || META.exam.date) + '"></div></div>' +
      ('speechSynthesis' in window ? '<div class="field" style="margin:16px 0 0"><label class="lab" for="rateIn">読み上げの速さ <span id="rateV">' + st.speechRate.toFixed(1) + '</span>倍</label><input id="rateIn" type="range" min="0.6" max="2" step="0.1" value="' + st.speechRate + '" style="width:100%"></div>' : '') + '</div>';

    html += '<h2 class="sec">データの書き出し・読み込み</h2><div class="card"><p class="small" style="margin-top:0">学習記録（解答履歴・付箋・メモ・模試の結果）はこの端末のブラウザにだけ保存されています。機種変更や別の端末で続けるときは、ファイルに書き出して読み込んでください。</p>' +
      '<label class="chk" style="border:0;padding-left:0"><input type="checkbox" id="expCustom" checked><span>取り込んだ問題データも含める</span></label>' +
      '<div class="row"><button class="btn" data-act="export">書き出す（.json）</button><label class="btn">読み込む<input type="file" id="impFile" accept=".json,application/json" hidden></label></div>' +
      '<hr class="sep"><div class="row"><button class="btn danger small" data-act="resetHistory">学習記録を消去</button><button class="btn danger small" data-act="resetAll">すべて初期化</button></div></div>';

    html += '<h2 class="sec" id="import">問題データの取り込み</h2><div class="card"><p class="small" style="margin-top:0">お手元の問題（市販問題集や公式に公表された過去問を<strong>ご自身で入力したもの</strong>など）を JSON または CSV/TSV で取り込むと、演習・一覧・模試で使えます。取り込んだデータは<strong>この端末の中だけ</strong>に保存され、どこにも送信・公開されません。第三者が権利をもつ問題を、権利者の許諾なく他の人へ配布しないでください。</p>' +
      '<div class="field"><label class="lab" for="packName">問題集の名前</label><input class="inp" id="packName" placeholder="' + esc(APP.packPlaceholder) + '"></div>' +
      '<div class="row" style="margin-bottom:10px"><label class="btn">ファイルを選ぶ<input type="file" id="qFile" accept=".json,.csv,.tsv,.txt" hidden></label><button class="btn small" data-act="tplJson">JSONのひな形</button><button class="btn small" data-act="tplCsv">CSVのひな形</button><a class="small" href="#/help">書式の説明</a></div>' +
      '<label class="lab sr" for="qPaste">貼り付け</label><textarea class="inp" id="qPaste" placeholder="ここにJSONまたはCSV/TSVを貼り付けることもできます"></textarea>' +
      '<div class="row" style="margin-top:10px"><button class="btn primary" data-act="importPaste">貼り付けた内容を取り込む</button></div>' +
      (custom.packs.length ? '<hr class="sep"><b class="small">取り込み済み</b>' + custom.packs.map(function (p) {
        return '<div class="row between" style="padding:8px 0;border-bottom:1px solid var(--line)"><span><b>' + esc(p.name) + '</b><br><span class="small muted">' + p.qs.length + '問・' + fmtDate(p.added) + '</span></span>' +
          '<span class="row"><button class="btn small" data-act="packPlay" data-pack="' + esc(p.id) + '">演習</button><button class="btn small" data-act="packExport" data-pack="' + esc(p.id) + '">書き出す</button><button class="btn small danger" data-act="packDel" data-pack="' + esc(p.id) + '">削除</button></span></div>';
      }).join('') : '') + '</div>';
    html += '<h2 class="sec">このアプリについて</h2><div class="card small"><p style="margin-top:0">バージョン ' + APP_VERSION + '　収録 ' + BUILTIN.length + '問（一問一答 ' + oxAll(null).filter(function (id) { return oxParse(id).q.src === 'b'; }).length + '文）</p>' +
      '<p>広告・アクセス解析・外部フォントなど、外部への通信は一切ありません（Content-Security-Policy で外部読み込みを禁止しています）。一度開けばオフラインでも使え、ホーム画面に追加するとアプリのように起動できます。</p><p style="margin-bottom:0"><a href="#/help">使い方・ご注意</a></p></div>';
    html += footer() + '</div>';
    setView(html);
  };

  /* ---------- データ書き出し・読み込み ---------- */
  function download(name, text, type) {
    var blob = new Blob([text], { type: type || 'application/json' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  function exportData() {
    var withCustom = $('#expCustom') ? $('#expCustom').checked : true;
    var data = { app: APPID, v: 1, exported: new Date().toISOString(), store: Object.assign({}, store, { session: null }) };
    if (withCustom) data.custom = custom;
    download(APPID + '-backup-' + dkey().replace(/-/g, '') + '.json', JSON.stringify(data));
    toast('書き出しました');
  }
  // 他の試験のドリル（社会福祉士版・公認心理師版など）の書き出しファイルか
  function otherDrill(d) { return !!(d && typeof d.app === 'string' && /drill$/.test(d.app) && d.app !== APPID && d.store); }
  function importData(text) {
    var d;
    try { d = JSON.parse(text); } catch (e) { toast('ファイルを読み込めませんでした（JSONではありません）'); return; }
    if (!d || d.app !== APPID || !d.store) {
      if (Array.isArray(d) || (d && (d.questions || d.qs))) { toast('問題データのようです。「問題データの取り込み」から読み込んでください'); return; }
      toast(otherDrill(d) ? '別の試験のドリルの書き出しファイルです。そのアプリで読み込んでください' : 'このアプリの書き出しファイルではありません'); return;
    }
    openModal({
      title: '学習データの読み込み',
      html: '<p>書き出し日時：' + esc(fmtDate(d.exported)) + '</p><p><b>統合</b>：今の記録と合わせます（同じ問題は解答回数の多い方を採用）。<br><b>置き換え</b>：今の記録を消して、ファイルの内容にします。</p>',
      actions: [{ label: 'キャンセル' }, { label: '置き換え', cls: 'danger', fn: function () { applyImport(d, true); } }, { label: '統合', cls: 'primary', fn: function () { applyImport(d, false); } }]
    });
  }
  function applyImport(d, replace) {
    var inc = d.store;
    if (replace) {
      var keepSettings = store.settings;
      store = Object.assign(freshStore(), inc, { session: null });
      store.settings = Object.assign({}, DEFAULT_SETTINGS, inc.settings || keepSettings);
    } else {
      ['q', 'ox'].forEach(function (key) {
        Object.keys(inc[key] || {}).forEach(function (id) {
          var a = store[key][id], b = inc[key][id];
          if (!a || (b.n || 0) > (a.n || 0) || ((b.n || 0) === (a.n || 0) && (b.last || 0) > (a.last || 0))) store[key][id] = b;
        });
      });
      Object.keys(inc.flags || {}).forEach(function (id) { if (inc.flags[id]) store.flags[id] = 1; });
      Object.keys(inc.notes || {}).forEach(function (id) {
        var a = store.notes[id] || '', b = inc.notes[id] || '';
        if (b && a.indexOf(b) < 0) store.notes[id] = a ? a + '\n' + b : b;
      });
      Object.keys(inc.days || {}).forEach(function (k) { var a = store.days[k], b = inc.days[k]; if (!a || b.n > a.n) store.days[k] = b; });
      var seen = {}; store.mocks.forEach(function (m) { seen[m.ts] = 1; });
      (inc.mocks || []).forEach(function (m) { if (!seen[m.ts]) store.mocks.push(m); });
      store.mocks.sort(function (a, b) { return a.ts - b.ts; });
    }
    if (d.custom && Array.isArray(d.custom.packs)) {
      d.custom.packs.forEach(function (p) {
        var ex = custom.packs.filter(function (x) { return x.id === p.id; })[0];
        if (!ex) custom.packs.push(p); else if (replace) custom.packs[custom.packs.indexOf(ex)] = p;
      });
      saveCustom(); buildBank();
    }
    save(true); applyLook();
    toast(replace ? '置き換えました' : '統合しました');
    route();
  }

  /* ---------- 問題データの取り込み ---------- */
  function parseCSV(text) {
    var delim = text.split('\n')[0].indexOf('\t') >= 0 ? '\t' : ',';
    var rows = [], row = [], cell = '', q = false;
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (q) {
        if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
        else cell += c;
      } else if (c === '"') q = true;
      else if (c === delim) { row.push(cell); cell = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        row.push(cell); cell = '';
        if (row.some(function (x) { return x.trim() !== ''; })) rows.push(row);
        row = [];
      } else cell += c;
    }
    row.push(cell); if (row.some(function (x) { return x.trim() !== ''; })) rows.push(row);
    if (rows.length < 2) return [];
    var head = rows[0].map(function (h) { return normalize(h.trim()).replace(/\s/g, ''); });
    var col = function (names) {
      names = names.map(function (n) { return normalize(n); });
      for (var i = 0; i < head.length; i++) if (names.indexOf(head[i]) >= 0) return i;
      return -1;
    };
    var C = {
      id: col(['id']), subj: col(['subject', 'subj', '科目']), label: col(['label', 'ラベル', '問題番号', '出典']), topic: col(['topic', '論点', 'テーマ']),
      q: col(['question', 'q', '問題文', '問題']), cs: col(['case', '事例']), ans: col(['answer', 'ans', '正答', '答え', '解答']), exp: col(['explanation', 'exp', '解説'])
    };
    var optCols = [], oeCols = [];
    head.forEach(function (h, i) {
      var m = h.match(/^(?:opt|option|choice|選択肢)(\d+)$/); if (m) optCols[+m[1] - 1] = i;
      var e = h.match(/^(?:exp|oe|explanation|解説)(\d+)$/); if (e) oeCols[+e[1] - 1] = i;
    });
    return rows.slice(1).map(function (r) {
      var get = function (i) { return i >= 0 && r[i] != null ? r[i].trim() : ''; };
      var opts = optCols.map(get).filter(function (x, i, a) { return x !== '' || a.slice(i).some(function (y) { return y !== ''; }); });
      var oe = oeCols.map(get);
      return { id: get(C.id), subject: get(C.subj), label: get(C.label), topic: get(C.topic), question: get(C.q), case: get(C.cs), options: opts, answer: get(C.ans), explanation: get(C.exp), optionExplanations: oe.some(Boolean) ? oe : null };
    });
  }
  function matchSubject(v) {
    if (!v) return { id: 'other' };
    var n = normalize(String(v)).replace(/\s|・/g, '');
    for (var i = 0; i < META.subjects.length; i++) {
      var s = META.subjects[i];
      var nn = normalize(s.name).replace(/\s|・/g, '');
      if (s.id === v || nn === n || normalize(s.short).replace(/\s|・/g, '') === n) return { id: s.id };
    }
    // 別名（旧カリキュラムの科目名など）→ 対応する科目
    var OLD = APP.aliases || {};
    for (var k in OLD) if (normalize(k).replace(/\s|・/g, '') === n) return { id: OLD[k], name: String(v) };
    return { id: 'other', name: String(v) };
  }
  function parseAnswer(v, nOpts) {
    var arr = Array.isArray(v) ? v : normalize(v == null ? '' : String(v)).split(/[,、・\s/]+/);
    var out = [];
    arr.forEach(function (x) {
      x = String(x).trim(); if (!x) return;
      var n = parseInt(x, 10);
      if (isNaN(n)) { var k = CIRCLED.indexOf(x); if (k >= 0) n = k + 1; }
      if (!isNaN(n) && n >= 1 && n <= nOpts && out.indexOf(n - 1) < 0) out.push(n - 1);
    });
    return out;
  }
  function importQuestions(text, name) {
    text = String(text || '').replace(/^﻿/, '').trim();
    if (!text) { toast('内容が空です'); return; }
    var items, packName = name;
    if (text[0] === '[' || text[0] === '{') {
      var d; try { d = JSON.parse(text); } catch (e) { toast('JSONの形式に誤りがあります：' + e.message); return; }
      if (d && d.app === APPID) { importData(text); return; }
      if (otherDrill(d)) { toast('別の試験のドリルの書き出しファイルです。そのアプリで読み込んでください'); return; }
      items = Array.isArray(d) ? d : (d.questions || d.qs || []);
      if (!packName && d.name) packName = d.name;
    } else items = parseCSV(text);
    var pid = 'p' + Date.now().toString(36);
    var ok = [], errs = [];
    (items || []).forEach(function (it, i) {
      var opts = (it.opts || it.options || it.choices || []).map(function (x) { return String(x); });
      var qtext = String(it.q || it.question || it.text || '').trim();
      var ans = parseAnswer(it.ans != null ? it.ans : it.answer, opts.length);
      var line = '#' + (i + 1);
      if (!qtext) { errs.push(line + '：問題文がありません'); return; }
      if (opts.length < 2) { errs.push(line + '：選択肢が2つ未満です'); return; }
      if (!ans.length) { errs.push(line + '：正答（1始まりの番号）が読み取れません'); return; }
      var sm = matchSubject(it.subj || it.subject);
      var oe = it.oe || it.optionExplanations || null;
      ok.push({
        id: pid + ':' + (it.id ? String(it.id) : String(i + 1)), subj: sm.id, subjName: sm.name || undefined,
        label: it.label ? String(it.label) : undefined, topic: it.topic ? String(it.topic) : undefined,
        q: qtext, case: it.case ? String(it.case) : undefined, opts: opts, ans: ans,
        exp: String(it.exp || it.explanation || ''), oe: Array.isArray(oe) && oe.length === opts.length ? oe.map(String) : undefined,
        neg: !!it.neg, ox: it.ox === true
      });
    });
    if (!ok.length) {
      openModal({ title: '取り込めませんでした', html: '<p>有効な問題が見つかりません。</p>' + (errs.length ? '<pre class="code">' + esc(errs.slice(0, 20).join('\n')) + '</pre>' : '') });
      return;
    }
    var dupe = {}; ok.forEach(function (q) { dupe[q.id] = (dupe[q.id] || 0) + 1; });
    ok.forEach(function (q, i) { if (dupe[q.id] > 1) q.id += '#' + i; });
    var pack = { id: pid, name: packName || ('取り込んだ問題 ' + dkey()), added: Date.now(), qs: ok };
    custom.packs.push(pack);
    if (!saveCustom()) { custom.packs.pop(); return; }
    buildBank();
    var other = ok.filter(function (q) { return q.subj === 'other'; }).length;
    openModal({
      title: '取り込みました', html: '<p><b>' + esc(pack.name) + '</b>：' + ok.length + '問</p>' +
        (other ? '<p class="small">' + SL + '名が一致しなかった問題が ' + other + '問あります（「' + esc(OTHER.name) + '」として扱います）。</p>' : '') +
        (errs.length ? '<p class="small">読み飛ばした行：' + errs.length + '件</p><pre class="code">' + esc(errs.slice(0, 20).join('\n')) + '</pre>' : ''),
      actions: [{ label: '閉じる', fn: function () { route(); } }, { label: '演習する', cls: 'primary', fn: function () { packPlay(pid); } }]
    });
  }
  function packPlay(pid) {
    var ids = sourceIds(pid);
    var p = custom.packs.filter(function (x) { return x.id === pid; })[0];
    startSession({ kind: 'practice', title: (p ? p.name : '取り込んだ問題'), ids: ids });
  }
  var TPL = APP.template;   // ひな形に入れる科目名・問題文の例
  var TPL_JSON = JSON.stringify({
    name: '自分用の問題集',
    questions: [{
      id: 'q1', subject: TPL.subj1, label: '練習 問1', topic: TPL.topic1,
      question: TPL.stem1,
      options: ['選択肢1の文', '選択肢2の文', '選択肢3の文', '選択肢4の文', '選択肢5の文'],
      answer: 3, explanation: '全体の解説', optionExplanations: ['1の解説', '2の解説', '3の解説', '4の解説', '5の解説']
    }, {
      id: 'q2', subject: TPL.subj2, question: TPL.stem2, options: ['A', 'B', 'C', 'D', 'E'], answer: [2, 5], explanation: '「2つ選ぶ」問題は answer を配列にします'
    }]
  }, null, 2);
  var TPL_CSV = 'id,科目,問題番号,問題文,事例,選択肢1,選択肢2,選択肢3,選択肢4,選択肢5,正答,解説,解説1,解説2,解説3,解説4,解説5\n' +
    'q1,' + TPL.subj1 + ',練習 問1,"' + TPL.stem1 + '",,"選択肢1の文","選択肢2の文","選択肢3の文","選択肢4の文","選択肢5の文",3,"全体の解説","1の解説","2の解説","3の解説","4の解説","5の解説"\n' +
    'q2,' + TPL.subj2 + ',練習 問2,"' + TPL.stem2 + '",,A,B,C,D,E,"2,5","「2つ選ぶ」問題は正答を 2,5 のように書きます",,,,,\n';

  /* =====================================================================
     画面：メニュー（スマホ）・使い方
     ===================================================================== */
  VIEWS.more = function () {
    var items = [['#/mock', 'clock', '模擬試験', APP.moreMock], ['#/stats', 'chart', '学習記録', SL + '別正答率・カレンダー・模試の推移'], ['#/settings', 'gear', '設定・データ', 'テーマ・文字サイズ・書き出し・問題の取り込み'], ['#/help', 'help', '使い方・ご注意', 'ショートカット・合格基準・取り込みの書式']];
    setView('<div class="wrap"><h1 class="page">メニュー</h1><ul class="morelist">' + items.map(function (x) {
      return '<li><a href="' + x[0] + '"><span class="ic">' + icon(x[1]) + '</span><span>' + x[2] + '<span class="d">' + x[3] + '</span></span></a></li>';
    }).join('') + '</ul>' + footer() + '</div>');
  };
  VIEWS.help = function () {
    var html = '<div class="wrap prose"><h1 class="page">使い方・ご注意</h1>' +
      '<h3>このアプリでできること</h3><ul>' +
      '<li><b>' + SL + '別演習</b>：' + SL + '（複数可）・絞り込み（未解答／前回まちがえた／苦手／付箋／メモ）・出題順・出題数を選んで解きます。1問ごとに正誤と、選択肢ごとの○×解説が表示されます。</li>' +
      '<li><b>一問一答（○×）</b>：選択肢を1文ずつ取り出して正誤を判定。5択の「なんとなく正解」を防げます。</li>' +
      '<li><b>模擬試験</b>：' + APP.helpMock + '</li>' +
      '<li><b>今日の復習（間隔反復）</b>：間違えた問題は翌日、「自信あり」で正解した問題は3日→7日→14日→30日→60日と間隔をあけて再出題します。「あいまい」「勘で当たった」を押すと早めに出題されます。</li>' +
      '<li><b>付箋・メモ</b>：問題ごとに付箋とメモ（自動保存）。メモも検索対象です。</li>' +
      '<li><b>消去法</b>：選択肢右側の × で、選択肢に取り消し線を引けます。</li>' +
      '<li><b>読み上げ</b>：問題文と選択肢を音声で読み上げます（端末の音声合成を使用）。</li>' +
      '<li><b>一覧・検索・印刷</b>：問題文・選択肢・解説・メモを横断検索。表示中の問題を問題用紙＋解答解説の形で印刷できます。</li>' +
      '<li><b>学習記録</b>：直近30日の解答数、学習カレンダー、' + SL + '別・' + esc(GROUP_LABEL) + '別の正答率、よく間違える問題、模試の得点推移。</li>' +
      '<li><b>オフライン・ホーム画面に追加</b>：一度開けば電波がなくても使えます。</li></ul>' +
      '<h3>キーボード操作（パソコン）</h3><ul><li><kbd>1</kbd>〜<kbd>5</kbd>：選択肢を選ぶ　<kbd>Enter</kbd>：解答／次へ　<kbd>←</kbd><kbd>→</kbd>：前後の問題</li><li><kbd>F</kbd>：付箋　<kbd>R</kbd>：見直し印（模試）　<kbd>S</kbd>：読み上げ　<kbd>P</kbd>：問題一覧　<kbd>Esc</kbd>：閉じる</li><li>一問一答：<kbd>O</kbd>または<kbd>1</kbd>＝正しい、<kbd>X</kbd>または<kbd>2</kbd>＝誤り</li></ul>' +
      APP.helpExamHtml +
      '<h3 id="fmt">問題データの取り込み書式</h3><p>JSON（配列、または <code>{"name":"…","questions":[…]}</code>）か、1行目が見出しの CSV/TSV に対応しています。</p><ul>' +
      '<li><code>question</code>（問題文・必須）、<code>options</code>（選択肢の配列・必須）、<code>answer</code>（正答の番号・<b>1始まり</b>・必須。2つ選ぶ問題は <code>[2,5]</code> や <code>"2,5"</code>）</li>' +
      '<li>任意：<code>subject</code>（' + SL + '名。本アプリの' + META.subjects.length + 'の' + SL + 'の名前と一致すると' + SL + '別に集計されます）、<code>label</code>（例「' + esc(APP.labelExample) + '」）、<code>case</code>（事例文）、<code>explanation</code>（解説）、<code>optionExplanations</code>（選択肢ごとの解説の配列）、<code>topic</code>（論点）</li>' +
      '<li>CSVの見出しは <code>問題文, 選択肢1〜選択肢5, 正答, 解説, 科目, 問題番号, 事例, 解説1〜解説5</code>（英語名も可）。</li></ul>' +
      '<pre class="code">' + esc(TPL_JSON) + '</pre>' +
      '<h3>収録問題とご注意</h3><ul><li>収録問題はすべて、出題基準と出題形式に沿って<b>独自に作成した練習問題</b>です。実際の国家試験の問題（過去問）や、他の過去問サイト・問題集の問題・解説を転載したものではありません。</li>' +
      '<li>法令・制度は改正されます。解説は作成時点（2026年10月）の制度に基づいています。学習の際は最新の法令・公式資料も確認してください。誤りに気づいた場合は、メモ機能で控えておくと便利です。</li>' +
      '<li>過去問を自分で入力して取り込む場合、それはご自身の学習のための私的利用です。取り込んだデータを公開・配布しないでください。</li></ul>' +
      '<h3>プライバシー</h3><p>広告・アクセス解析・外部フォント・外部スクリプトは一切使っていません。学習記録はお使いのブラウザ（localStorage）にのみ保存され、外部へ送信されることはありません。ブラウザのデータを消去すると記録も消えるため、定期的な書き出しをおすすめします。</p>' +
      footer() + '</div>';
    setView(html);
  };

  /* =====================================================================
     操作（クリック・入力）
     ===================================================================== */
  var ACT = {
    quick: function (el) {
      var v = el.getAttribute('data-q'), ids;
      if (el.getAttribute('aria-disabled') === 'true') { toast('該当する問題がまだありません'); return; }
      if (v === 'due') { ids = orderedIds(dueIds()); startSession({ kind: 'practice', title: '今日の復習', ids: shuffle(ids) }); }
      else if (v === 'rand10') startSession({ kind: 'practice', title: 'ランダム10問', ids: shuffle(BUILTIN_IDS).slice(0, 10) });
      else if (v === 'weak') startSession({ kind: 'practice', title: '苦手克服', ids: shuffle(BANK.filter(function (q) { return isWeak(q.id); }).map(function (q) { return q.id; })).slice(0, 30) });
      else if (v === 'flag') startSession({ kind: 'practice', title: '付箋した問題', ids: orderedIds(BANK.filter(function (q) { return store.flags[q.id]; }).map(function (q) { return q.id; })) });
      else if (v === 'new') startSession({ kind: 'practice', title: '未解答の問題', ids: shuffle(BUILTIN_IDS.filter(function (id) { var s = qst(id); return !s || !s.n; })).slice(0, 10) });
    },
    subjPlay: function (el) {
      var sid = el.getAttribute('data-subj');
      startSession({ kind: 'practice', title: SUBJ[sid].name, ids: orderedIds(BUILTIN_IDS.filter(function (id) { return BYID[id].subj === sid; })) });
    },
    packPlay: function (el) { closeModal(); packPlay(el.getAttribute('data-pack')); },
    seg: function (el) {
      var k = el.getAttribute('data-k'), v = el.getAttribute('data-v');
      $all('[data-act="seg"][data-k="' + k + '"]').forEach(function (b) { b.setAttribute('aria-pressed', b === el ? 'true' : 'false'); });
      if (k === 'order' || k === 'count' || k === 'src') {
        store.setup[k] = v;
        if (k === 'src') { save(); VIEWS.setup({}); return; }
        updateSetupCount();
      } else if (k === 'qset' || k === 'kind') { store.setup[k] = v; updateSetupCount(); }
      else if (k === 'mockset') { store.mockSet = v; save(); VIEWS.mock(); }
      else if (k === 'oxstatus') { store.oxSetup.status = v; updateOxCount(); }
      else if (k === 'oxcount') { store.oxSetup.count = v; updateOxCount(); }
      else if (k === 'theme' || k === 'font') { store.settings[k] = v; applyLook(); save(); }
    },
    subjAll: function (el) {
      var on = el.getAttribute('data-v') === '1';
      $all('input[name="subj"]').forEach(function (i) { i.checked = on; });
      if (current.name === 'ox') updateOxCount(); else updateSetupCount();
    },
    subjCat: function (el) {
      var cat = el.getAttribute('data-v');
      $all('input[name="subj"]').forEach(function (i) { i.checked = SUBJ[i.value] && SUBJ[i.value].cat === cat; });
      updateSetupCount();
    },
    grpToggle: function (el) {
      var gid = +el.getAttribute('data-g'), g = META.groups.filter(function (x) { return x.id === gid; })[0];
      var boxes = $all('input[name="subj"]').filter(function (i) { return g.subjects.indexOf(i.value) >= 0; });
      var allOn = boxes.every(function (i) { return i.checked; });
      boxes.forEach(function (i) { i.checked = !allOn; });
      updateSetupCount();
    },
    startSetup: function () {
      var cfg = store.setup, ids = setupMatches();
      if (cfg.order === 'rand') ids = shuffle(ids);
      if (cfg.count !== 'all') ids = ids.slice(0, +cfg.count);
      var names = cfg.subjects.length === META.subjects.length ? '全' + SL : cfg.subjects.length <= 2 ? cfg.subjects.map(function (s) { return (SUBJ[s] || OTHER).name; }).join('・') : cfg.subjects.length + '科目';
      var st = STATUS_FILTERS.filter(function (f) { return f[0] === cfg.status; })[0];
      startSession({ kind: 'practice', title: names + (cfg.status !== 'all' ? '（' + st[1].replace(/（.*）/, '') + '）' : ''), ids: ids });
    },
    opt: function (el) {
      var s = S(), q = curQ(); if (!q) return;
      var k = +el.getAttribute('data-k'), oi = optOrder(s, q)[k];
      if (s.kind === 'review' || s.done || (s.kind !== 'mock' && s.ans[q.id])) return;
      var need = needCount(q), pick = (s.pick[q.id] || []).slice();
      // 消去済みの選択肢を選んだら消去を解除
      var st = s.struck[q.id] || []; if (st.indexOf(oi) >= 0) s.struck[q.id] = st.filter(function (x) { return x !== oi; });
      if (need === 1) {
        if (s.kind === 'practice' && s.instant) { submitAnswer([oi]); return; }
        pick = pick[0] === oi && s.kind === 'mock' ? [] : [oi];
      } else {
        var at = pick.indexOf(oi);
        if (at >= 0) pick.splice(at, 1); else { pick.push(oi); if (pick.length > need) pick.shift(); }
      }
      s.pick[q.id] = pick; save(); renderPlay();
    },
    strike: function (el) {
      var s = S(), q = curQ(); if (!q) return;
      var oi = optOrder(s, q)[+el.getAttribute('data-k')];
      var st = (s.struck[q.id] || []).slice(), at = st.indexOf(oi);
      if (at >= 0) st.splice(at, 1); else { st.push(oi); if (s.pick[q.id]) s.pick[q.id] = s.pick[q.id].filter(function (x) { return x !== oi; }); }
      s.struck[q.id] = st; save(); renderPlay();
    },
    submit: function () { var s = S(), q = curQ(); var p = s.pick[q.id] || []; if (p.length === needCount(q)) submitAnswer(p); },
    conf: function (el) {
      var s = S(), q = curQ(), a = s.ans[q.id]; if (!a) return;
      a.conf = el.getAttribute('data-v'); setConf(q.id, a.prev, a.ok, a.conf); save(); renderPlay();
      toast({ sure: '次の復習は間隔をあけます', unsure: '2日後にもう一度出題します', guess: '明日もう一度出題します' }[a.conf]);
    },
    next: function () {
      var s = S(); if (!s) return;
      if (s.i < s.ids.length - 1) { if (s.kind === 'ox') { s.i++; save(); renderOx(); window.scrollTo(0, 0); } else moveTo(s.i + 1); }
      else if (s.kind === 'ox') ACT.oxFinish();
      else if (s.kind === 'mock') ACT.submitMock();
      else finishPractice();
    },
    prev: function () { var s = S(); if (!s || s.i === 0) return; if (s.kind === 'ox') { s.i--; save(); renderOx(); } else moveTo(s.i - 1); },
    finish: function () { finishPractice(); },
    palette: function () { showPalette(); },
    jump: function (el) { closeModal(); moveTo(+el.getAttribute('data-i')); },
    skip: function () { var m = $('#main'); m.focus(); m.scrollIntoView(); },
    flag: function () {
      var q = curQ(); if (!q) return;
      if (store.flags[q.id]) delete store.flags[q.id]; else store.flags[q.id] = 1;
      save(); renderPlay(); toast(store.flags[q.id] ? '付箋を付けました' : '付箋を外しました');
    },
    rev: function () { var s = S(), q = curQ(); s.rev[q.id] = !s.rev[q.id]; save(); renderPlay(); },
    noteToggle: function () { var b = $('#noteBox'); b.hidden = !b.hidden; if (!b.hidden) $('#noteTa').focus(); },
    speak: function () { speakCurrent(); },
    quit: function () {
      var s = S(); if (!s) { go('#/'); return; }
      tickTimer(); save(true);
      if (s.done) { go(s.kind === 'ox' ? '#/oxresult' : s.kind === 'review' ? (s.back || '#/') : '#/result'); return; }
      go('#/');
      toast('中断しました。ホームの「再開」から続けられます');
    },
    submitMock: function () {
      var s = S(); if (!s) return;
      var un = s.ids.filter(function (id) { return !(s.pick[id] && s.pick[id].length); }).length;
      var rv = Object.keys(s.rev).filter(function (k) { return s.rev[k]; }).length;
      confirmBox('解答を提出しますか？', '<p>' + (un ? '<b style="color:var(--ng)">未解答が ' + un + '問</b>あります。' : 'すべて解答済みです。') + (rv ? '<br>見直し印の付いた問題が ' + rv + '問あります。' : '') + '</p><p class="small muted">提出すると採点され、解答は変更できません。</p>', '提出して採点', function () { gradeMock(false); });
    },
    mockStart: function (el) { startMock(el.getAttribute('data-scope'), el.getAttribute('data-pack')); },
    mockReview: function (el) {
      var i = +el.getAttribute('data-i'), m = store.mocks[i]; if (!m) return;
      var ans = {};
      m.ids.forEach(function (id) { var q = BYID[id]; if (!q) return; var sel = m.sel[id] || []; ans[id] = { sel: sel, ok: sel.length > 0 && sameSet(sel, q.ans) }; });
      store.session = newSession({ kind: 'review', title: '見直し｜' + m.label, ids: m.ids.filter(function (id) { return BYID[id]; }), ans: ans, shuffle: false, done: true, start: +(el.getAttribute('data-at') || 0), back: '#/mockres?i=' + i });
      save(true); go('#/play');
    },
    mockWrong: function (el) {
      var m = store.mocks[+el.getAttribute('data-i')]; if (!m) return;
      var ids = m.ids.filter(function (id) { var q = BYID[id]; var sel = m.sel[id] || []; return q && !(sel.length && sameSet(sel, q.ans)); });
      startSession({ kind: 'practice', title: '模試の復習｜' + m.label, ids: ids, force: true });
    },
    retryWrong: function () { var s = S(); startSession({ kind: 'practice', title: s.title + '（解き直し）', ids: s.ids.filter(function (id) { return !s.ans[id] || !s.ans[id].ok; }), force: true }); },
    retryAll: function () { var s = S(); startSession({ kind: 'practice', title: s.title, ids: s.ids, force: true }); },
    reviewAt: function (el) { var s = S(); s.i = +el.getAttribute('data-i'); save(); go('#/play'); },
    startOx: function () {
      var cfg = store.oxSetup, ids = shuffle(oxMatches());
      if (cfg.count !== 'all') ids = ids.slice(0, +cfg.count);
      startSession({ kind: 'ox', title: '一問一答', ids: ids });
    },
    oxAns: function (el) {
      var s = S(), id = s.ids[s.i]; if (s.ans[id]) return;
      var it = oxParse(id), pickV = el.getAttribute('data-v'), ok = (pickV === 'o') === oxTruth(it.q, it.i);
      s.ans[id] = { pick: pickV, ok: ok }; recordOx(id, ok); save(); renderOx();
      var rb = $('#resultBox'); if (rb) { rb.focus({ preventScroll: true }); if (store.settings.autoScroll) rb.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
    },
    oxFinish: function () { var s = S(); tickTimer(); s.done = true; save(true); go('#/oxresult'); },
    oxRetryWrong: function () { var s = S(); startSession({ kind: 'ox', title: '一問一答（解き直し）', ids: s.ids.filter(function (id) { return s.ans[id] && !s.ans[id].ok; }), force: true }); },
    oxAt: function (el) { var s = S(); s.i = +el.getAttribute('data-i'); save(); go('#/oxplay'); },
    oxSource: function () {
      var s = S(), it = oxParse(s.ids[s.i]), q = it.q;
      openModal({
        title: qLabel(q), html: (APP.caseFirst && q.case ? '<div class="qcase">' + fmt(q.case) + '</div><p>' + fmt(q.q) + '</p>' : '<p>' + fmt(q.q) + '</p>' + (q.case ? '<div class="qcase">' + fmt(q.case) + '</div>' : '')) + '<ul class="oe">' + q.opts.map(function (o, i) {
          var isA = q.ans.indexOf(i) >= 0;
          return '<li class="' + (isA ? 'is-ans' : '') + '"><span class="tf ' + (oxTruth(q, i) ? 't' : 'f') + '">' + (oxTruth(q, i) ? '○' : '×') + '</span><span class="b"><span class="o">' + (i + 1) + '. ' + fmt(o) + (isA ? '　<span class="chip ok">正答</span>' : '') + '</span>' + fmt(q.oe[i] || '') + '</span></li>';
        }).join('') + '</ul>' + (q.exp ? '<div class="exp"><h4>ポイント</h4><div class="point">' + fmt(q.exp) + '</div></div>' : '')
      });
    },
    listOpen: function (el) {
      var ids = listIds().slice(0, 200);
      startSession({ kind: 'practice', title: listState.kw ? '検索「' + listState.kw + '」' : '一覧から', ids: ids, start: +el.getAttribute('data-i') });
    },
    listPlay: function () { startSession({ kind: 'practice', title: listState.kw ? '検索「' + listState.kw + '」' : '一覧から', ids: listIds() }); },
    listPrint: function () {
      var ids = listIds();
      if (!ids.length) { toast('印刷する問題がありません'); return; }
      if (ids.length > 150) { toast('150問までにしぼってください'); return; }
      printQuestions(ids, listState.kw ? '検索「' + listState.kw + '」' : (listState.subj !== 'all' ? (SUBJ[listState.subj] || OTHER).name : APP.printTitle));
    },
    openOne: function (el) { startSession({ kind: 'practice', title: '1問だけ解く', ids: [el.getAttribute('data-id')] }); },
    weakSubj: function (el) { var subs = el.getAttribute('data-v').split(','); store.setup = Object.assign(defaultSetup(), store.setup || {}, { subjects: subs, status: 'all', order: 'rand', src: 'b' }); save(); go('#/setup'); },
    export: function () { exportData(); },
    resetHistory: function () {
      confirmBox('学習記録を消去', '<p>解答履歴・一問一答の記録・学習日・模試の結果を消去します。付箋・メモ・設定・取り込んだ問題は残ります。</p><p class="small muted">念のため、先に「書き出す」でバックアップを取っておくと安心です。</p>', '消去する', function () {
        store.q = {}; store.ox = {}; store.days = {}; store.mocks = []; store.session = null; save(true); toast('学習記録を消去しました'); route();
      }, true);
    },
    resetAll: function () {
      confirmBox('すべて初期化', '<p>学習記録・付箋・メモ・設定・取り込んだ問題をすべて消去し、初めて開いた状態に戻します。元に戻せません。</p>', '初期化する', function () {
        store = freshStore(); custom = { packs: [] }; save(true); saveCustom(); buildBank(); applyLook(); toast('初期化しました'); go('#/');
      }, true);
    },
    tplJson: function () { download(APPID + '-template.json', TPL_JSON); },
    tplCsv: function () { download(APPID + '-template.csv', '﻿' + TPL_CSV, 'text/csv'); },
    importPaste: function () { importQuestions($('#qPaste').value, $('#packName').value.trim()); },
    packDel: function (el) {
      var pid = el.getAttribute('data-pack'), p = custom.packs.filter(function (x) { return x.id === pid; })[0];
      confirmBox('取り込んだ問題を削除', '<p>「' + esc(p.name) + '」（' + p.qs.length + '問）を削除します。この問題の学習記録も表示されなくなります。</p>', '削除する', function () {
        custom.packs = custom.packs.filter(function (x) { return x.id !== pid; });
        saveCustom(); buildBank(); toast('削除しました'); route();
      }, true);
    },
    packExport: function (el) {
      var p = custom.packs.filter(function (x) { return x.id === el.getAttribute('data-pack'); })[0];
      download(APPID + '-pack-' + dkey().replace(/-/g, '') + '.json', JSON.stringify({ name: p.name, questions: p.qs.map(function (q) {
        return { id: q.id.split(':').slice(1).join(':'), subject: q.subj === 'other' ? (q.subjName || '') : SUBJ[q.subj].name, label: q.label, topic: q.topic, question: q.q, case: q.case, options: q.opts, answer: q.ans.map(function (x) { return x + 1; }), explanation: q.exp, optionExplanations: q.oe, neg: q.neg || undefined, ox: q.ox || undefined };
      }) }, null, 2));
    }
  };
  /* ---------------------------------------------------------------------
     勉強シートへ送る（APP.studyLink が true で、../study-link.js を読み込んだアプリだけ）
     今日解いた問題を科目ごとに数え、本人の勉強シート（claude.ai・非公開）へ送る
     --------------------------------------------------------------------- */
  function studyOn() { return !!(APP.studyLink && window.StudyLink); }
  function todayStudy() {
    var t0 = window.StudyLink.dayStart(dkey()), t1 = t0 + 86400000, subj = {}, ts = [];
    function add(sid, ok, t) { var o = subj[sid] || (subj[sid] = [0, 0]); o[0]++; if (ok) o[1]++; ts.push(t); }
    BANK.forEach(function (q) {
      var st = store.q[q.id];
      if (st && st.h) st.h.forEach(function (h) { if (h[0] >= t0 && h[0] < t1) add(q.subj, h[1], h[0]); });
    });
    Object.keys(store.ox).forEach(function (oid) {
      var st = store.ox[oid]; if (!st || !(st.last >= t0 && st.last < t1)) return;
      var it = oxParse(oid); if (it.q) add(it.q.subj, st.lastOk, st.last);
    });
    return { subj: subj, ts: ts };
  }
  ACT.studySend = function () {
    var d = todayStudy(), n = 0, c = 0;
    var keys = Object.keys(d.subj).sort(function (a, b) { return (SUBJ[a] || OTHER).order - (SUBJ[b] || OTHER).order; });
    keys.forEach(function (k) { n += d.subj[k][0]; c += d.subj[k][1]; });
    window.StudyLink.open({
      title: APP.name, date: dkey(), minutes: window.StudyLink.estimate(d.ts), empty: !n,
      lines: keys.map(function (k) { return (SUBJ[k] || OTHER).name + '　' + d.subj[k][0] + '問（正解 ' + d.subj[k][1] + '）'; }),
      summary: '今日の合計 ' + n + '問・正答率 ' + (pct(c, n) || 0) + '%（一問一答を含む）',
      build: function (min) { return { v: 1, src: 'k', key: 'k', app: APP.name, date: dkey(), min: min, subj: d.subj }; }
    });
  };

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    var fn = ACT[el.getAttribute('data-act')];
    if (!fn) return;
    if (el.tagName === 'A') e.preventDefault();
    fn(el, e);
  });
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (t.name === 'subj') { if (current.name === 'ox') updateOxCount(); else updateSetupCount(); }
    else if (t.id === 'statusSel') updateSetupCount();
    else if (t.hasAttribute && t.hasAttribute('data-set')) { store.settings[t.getAttribute('data-set')] = t.checked; save(); }
    else if (t.id === 'goalIn') { store.settings.dailyGoal = Math.max(1, Math.min(500, parseInt(t.value, 10) || 20)); save(); toast('目標を保存しました'); }
    else if (t.id === 'examIn') { if (t.value) { store.settings.examDate = t.value; save(); toast('試験日を保存しました'); } }
    else if (t.id === 'fSubj' || t.id === 'fStatus' || t.id === 'fSort' || t.id === 'fSrc') {
      listState[{ fSubj: 'subj', fStatus: 'status', fSort: 'sort', fSrc: 'src' }[t.id]] = t.value; renderList();
    } else if (t.id === 'impFile' || t.id === 'qFile') {
      var f = t.files && t.files[0]; if (!f) return;
      var rd = new FileReader();
      rd.onload = function () {
        if (t.id === 'impFile') importData(String(rd.result));
        else importQuestions(String(rd.result), ($('#packName').value || '').trim() || f.name.replace(/\.[^.]+$/, ''));
        t.value = '';
      };
      rd.readAsText(f, 'utf-8');
    }
  });
  var kwTimer;
  document.addEventListener('input', function (e) {
    var t = e.target;
    if (t.id === 'kw') { clearTimeout(kwTimer); kwTimer = setTimeout(function () { listState.kw = t.value; renderList(); }, 150); }
    else if (t.id === 'noteTa') {
      var q = curQ(); if (!q) return;
      if (t.value.trim()) store.notes[q.id] = t.value; else delete store.notes[q.id];
      save();
    } else if (t.id === 'rateIn') { store.settings.speechRate = +t.value; $('#rateV').textContent = (+t.value).toFixed(1); save(); }
  });

  /* ---------- キーボード ---------- */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !$('#modal').hidden) { closeModal(); return; }
    if (!$('#modal').hidden) return;
    var tg = e.target.tagName;
    if (tg === 'INPUT' || tg === 'TEXTAREA' || tg === 'SELECT' || e.ctrlKey || e.metaKey || e.altKey) return;
    var s = S();
    if (current.name === 'play' && s) {
      var q = curQ(); if (!q) return;
      var k = e.key.toLowerCase();
      if (/^[1-9]$/.test(k) && +k <= q.opts.length) { var b = $('[data-act="opt"][data-k="' + (+k - 1) + '"]'); if (b && !b.disabled) { e.preventDefault(); b.click(); } }
      else if (k === 'enter') {
        if (e.target.closest && e.target.closest('button')) return; // ボタン上の Enter は通常のクリック
        e.preventDefault();
        var sub = $('[data-act="submit"]'); if (sub && !sub.disabled) { sub.click(); return; }
        if (s.kind === 'mock' || s.ans[q.id] || s.done) ACT.next();
      } else if (k === 'arrowright') { e.preventDefault(); ACT.next(); }
      else if (k === 'arrowleft') { e.preventDefault(); ACT.prev(); }
      else if (k === 'f') ACT.flag();
      else if (k === 'r' && s.kind === 'mock') ACT.rev();
      else if (k === 's') speakCurrent();
      else if (k === 'p') showPalette();
    } else if (current.name === 'oxplay' && s) {
      var k2 = e.key.toLowerCase(), id = s.ids[s.i];
      if (!s.ans[id] && (k2 === 'o' || k2 === '1')) { e.preventDefault(); ACT.oxAns($('.oxbtn.o')); }
      else if (!s.ans[id] && (k2 === 'x' || k2 === '2')) { e.preventDefault(); ACT.oxAns($('.oxbtn.x')); }
      else if (k2 === 'enter' && s.ans[id]) { if (e.target.closest && e.target.closest('button')) return; e.preventDefault(); ACT.next(); }
      else if (k2 === 'arrowright') ACT.next();
      else if (k2 === 'arrowleft') ACT.prev();
    }
  });

  /* ---------- 読み上げ ---------- */
  function stopSpeech() { try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) { /* noop */ } }
  function speakCurrent() {
    if (!window.speechSynthesis) return;
    if (speechSynthesis.speaking) { stopSpeech(); return; }
    var s = S(), q = curQ(); if (!q) return;
    var order = optOrder(s, q);
    var text = (APP.caseFirst && q.case ? '事例。' + plain(q.case) + '。' + plain(q.q) + '。' : plain(q.q) + '。' + (q.case ? '事例。' + plain(q.case) + '。' : '')) + order.map(function (oi, k) { return (k + 1) + '。' + plain(q.opts[oi]); }).join('。');
    var a = s.ans[q.id];
    if (a && s.kind !== 'mock') text += '。正答は' + q.ans.map(function (oi) { return order.indexOf(oi) + 1; }).join('と') + '。' + plain(q.exp || '');
    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP'; u.rate = store.settings.speechRate || 1;
    var v = speechSynthesis.getVoices().filter(function (x) { return /ja/i.test(x.lang); })[0]; if (v) u.voice = v;
    speechSynthesis.speak(u);
  }

  /* ---------- 起動 ---------- */
  route();
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () { /* オフライン対応なしでも動く */ }); });
  }
  // テスト・デバッグ用（外部送信はしない）
  window.SWDRILL = { version: APP_VERSION, bank: function () { return BANK; }, store: function () { return store; } };
})();
