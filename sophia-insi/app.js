/* =========================================================================
   臨床心理 院試ノート  sophia-insi/app.js
   上智大学大学院 臨床心理学コースの入試に向けた非公式の対策ページ。
   ・試験の概要／語句説明の練習／論述の練習／模擬試験（本番形式120分ほか）／研究計画書／口述試験
   ・本番形式：公開されている過去問（2025・2026年度）にならい、問I 語句説明（全問）＋問II 論述（9問から4問選択）。
   ・広告なし／外部通信なし。答案・メモ・記録はこの端末のブラウザ（localStorage）だけに保存。
   ・見た目は国試ドリルと共通の ../drill/style.css を使い、固有の部品は insi.css に置く。
   データ：data/facts.js（SI_FACTS）、terms.js（SI_TERMS・SI_FIELDS）、essays.js（SI_ESSAYS）、
           oral.js（SI_ORAL）、plan.js（SI_PLAN）。問題・解答例はすべて独自作成。
   ========================================================================= */
(function () {
  'use strict';

  var APP = { name: '臨床心理 院試ノート', version: '1.1.0', key: 'siinsi' };
  var LS_KEY = APP.key + '.v1';
  var FACTS = window.SI_FACTS || { schedule: [], sections: [] };
  var TERMS = window.SI_TERMS || [];
  var FIELDS = window.SI_FIELDS || [];
  var ESSAYS = window.SI_ESSAYS || [];
  var ORAL = window.SI_ORAL || [];
  var PLAN = window.SI_PLAN || { sections: [], checklist: [], parts: [] };

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
  // 本文：エスケープしたうえで **強調** と改行だけ許可
  function fmt(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>'); }
  function paras(s) { return String(s || '').split(/\n+/).map(function (p) { return '<p>' + fmt(p) + '</p>'; }).join(''); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function dkey(d) { d = d || new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parseKey(k) { var p = k.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); }
  function addDays(k, n) { var d = parseKey(k); d.setDate(d.getDate() + n); return dkey(d); }
  function daysBetween(a, b) { return Math.round((parseKey(b) - parseKey(a)) / 86400000); }
  function today() { return dkey(); }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  var WD = ['日', '月', '火', '水', '木', '金', '土'];
  function jdate(k) { var d = parseKey(k); return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日（' + WD[d.getDay()] + '）'; }
  function mdate(k) { var d = parseKey(k); return (d.getMonth() + 1) + '/' + d.getDate() + '（' + WD[d.getDay()] + '）'; }
  function sdate(k) { return parseKey(k).getFullYear() + '/' + mdate(k); }
  function fmtDate(ts) { var d = new Date(ts); return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate(); }
  function fmtMin(sec) { sec = Math.max(0, Math.round(sec)); var m = Math.floor(sec / 60), s = sec % 60; return m + ':' + pad(s); }
  // 字数：改行と空白を除いた文字数（原稿用紙に近い数え方）
  function charCount(s) { return String(s || '').replace(/[\s　]/g, '').length; }
  // キーワード照合用の正規化（全角英数→半角、カタカナ→ひらがな、空白・中点・記号の除去、小文字化）
  function norm(s) {
    return String(s || '').replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0xFEE0); })
      .replace(/[ァ-ヶ]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0x60); })
      .replace(/[\s　・･,，、。.．\-‐ー－―〜~（）()「」『』"'“”]/g, '').toLowerCase();
  }
  function hasKey(ans, key) {
    var a = norm(ans);
    return key.split('/').some(function (alt) { var k = norm(alt); return k && a.indexOf(k) >= 0; });
  }

  var ICONS = {
    play: '<path d="M7 5v14l11-7z"/>', pause: '<path d="M8 5v14M16 5v14"/>',
    check: '<path d="M4 12l5 5L20 6"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>',
    clock: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/>',
    cards: '<rect x="3" y="5" width="13" height="15" rx="2"/><path d="M8 3h11a2 2 0 0 1 2 2v13"/>',
    pen: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13 7l4 4"/>',
    doc: '<path d="M5 3h11l3 3v15H5zM8 9h8M8 13h8M8 17h5"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/>',
    cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
    right: '<path d="M9 5l7 7-7 7"/>', left: '<path d="M15 5l-7 7 7 7"/>',
    redo: '<path d="M4 12a8 8 0 1 0 2.3-5.6L4 8.7"/><path d="M4 4v4.7h4.7"/>',
    down: '<path d="M12 4v12M6 11l6 6 6-6M5 20h14"/>', link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'
  };
  function icon(n) { return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[n] || '') + '</svg>'; }

  /* ---------------------------------------------------------------------
     データの下ごしらえ
     --------------------------------------------------------------------- */
  var TBYID = {}, FBYID = {}, EBYID = {}, OBYID = {};
  FIELDS.forEach(function (f, i) { f.order = i; FBYID[f.id] = f; });
  TERMS.forEach(function (t, i) { t.idx = i; TBYID[t.id] = t; });
  ESSAYS.forEach(function (e, i) { e.idx = i; EBYID[e.id] = e; });
  ORAL.forEach(function (o, i) { o.idx = i; OBYID[o.id] = o; });
  var OGROUPS = []; ORAL.forEach(function (o) { if (OGROUPS.indexOf(o.g) < 0) OGROUPS.push(o.g); });

  /* ---------------------------------------------------------------------
     保存（localStorage）。使えない環境ではメモリ上だけで動かす
     --------------------------------------------------------------------- */
  var memStore = {};
  var canStore = (function () { try { var k = '__si'; localStorage.setItem(k, '1'); localStorage.removeItem(k); return true; } catch (e) { return false; } })();
  function lsGet(k) { try { return canStore ? localStorage.getItem(k) : memStore[k] || null; } catch (e) { return null; } }
  function lsSet(k, v) {
    try { if (canStore) localStorage.setItem(k, v); else memStore[k] = v; return true; }
    catch (e) { toast('保存できませんでした（ブラウザの保存容量がいっぱいの可能性があります）'); return false; }
  }
  function defaults() {
    return {
      v: 1,
      settings: { theme: 'auto', font: 'm', examDate: FACTS.defaultExam || '', termSec: 180 },
      terms: {},    // 用語ID → { r:0|1|2, d:'YYYY-MM-DD', ans, n }
      essays: {},   // 論述ID → { r, d, ans, rub:{i:true}, sec }
      mocks: [],    // 模擬試験の記録
      run: null,    // 実施中の模擬試験
      oral: {},     // 口述ID → { memo, d, n }
      plan: { chk: {}, draft: {} },
      kako: [],     // 過去問の分析メモ
      log: {}
    };
  }
  var store = (function () {
    var d = defaults(), raw = lsGet(LS_KEY);
    if (!raw) return d;
    try {
      var s = JSON.parse(raw);
      Object.keys(d).forEach(function (k) { if (s[k] == null) s[k] = d[k]; });
      s.settings = Object.assign(d.settings, s.settings || {});
      s.plan = Object.assign({ chk: {}, draft: {} }, s.plan || {});
      return s;
    } catch (e) { return d; }
  })();
  var saveTimer = null;
  function save(now) {
    clearTimeout(saveTimer);
    if (now) { lsSet(LS_KEY, JSON.stringify(store)); return; }
    saveTimer = setTimeout(function () { lsSet(LS_KEY, JSON.stringify(store)); }, 300);
  }
  window.addEventListener('pagehide', function () { save(true); });
  function logAdd(field) { var k = today(), l = store.log[k] || (store.log[k] = {}); l[field] = (l[field] || 0) + 1; }

  /* ---------------------------------------------------------------------
     テーマ・トースト・モーダル
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
    store.settings.theme = dark ? 'light' : 'dark'; applyLook(); save();
    toast(dark ? 'ライト表示にしました' : 'ダーク表示にしました');
  });
  var toastTimer;
  function toast(msg) { var t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.hidden = true; }, 2600); }
  var modalReturnFocus = null;
  function openModal(o) {
    $('#modalTitle').textContent = o.title || '';
    $('#modalBody').innerHTML = o.html || '';
    var acts = $('#modalActions'); acts.innerHTML = '';
    (o.actions || [{ label: '閉じる' }]).forEach(function (a) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'btn ' + (a.cls || ''); b.textContent = a.label;
      b.addEventListener('click', function () { var keep = a.fn && a.fn() === false; if (!keep) closeModal(); });
      acts.appendChild(b);
    });
    modalReturnFocus = document.activeElement; $('#modal').hidden = false;
    var f = acts.querySelector('.primary') || acts.querySelector('button'); if (f) f.focus();
  }
  function closeModal() { $('#modal').hidden = true; if (modalReturnFocus && modalReturnFocus.focus) { try { modalReturnFocus.focus(); } catch (e) { /* noop */ } } }
  function confirmBox(title, html, okLabel, fn, danger) { openModal({ title: title, html: html, actions: [{ label: 'キャンセル' }, { label: okLabel || 'OK', cls: danger ? 'danger' : 'primary', fn: fn }] }); }
  $('#modal').addEventListener('click', function (e) { if (e.target.hasAttribute('data-close')) closeModal(); });

  /* ---------------------------------------------------------------------
     タイマー（画面ごとに一つ）
     --------------------------------------------------------------------- */
  var TM = null;   // { end, left, run, onTick, onEnd, el }
  function timerStart(sec, onEnd) {
    timerStop();
    TM = { left: sec, run: true, last: Date.now(), onEnd: onEnd };
    TM.iv = setInterval(timerTick, 250); timerPaint();
  }
  function timerTick() {
    if (!TM || !TM.run) return;
    var now = Date.now(); TM.left -= (now - TM.last) / 1000; TM.last = now;
    if (TM.left <= 0) { TM.left = 0; timerPaint(); var f = TM.onEnd; timerStop(); if (f) f(); return; }
    timerPaint();
  }
  function tmLeft() {
    if (!TM) return null;
    if (TM.run) { var now = Date.now(); TM.left = Math.max(0, TM.left - (now - TM.last) / 1000); TM.last = now; }
    return TM.left;
  }
  function timerToggle() { if (!TM) return; TM.run = !TM.run; TM.last = Date.now(); timerPaint(); }
  function timerStop() { if (TM && TM.iv) clearInterval(TM.iv); TM = null; }
  function timerPaint() {
    var el = $('#tmv'); if (!el || !TM) return;
    el.textContent = fmtMin(TM.left);
    var box = $('#tmbox'); if (box) { box.classList.toggle('low', TM.left < 60); box.classList.toggle('paused', !TM.run); }
    var b = $('[data-act="tmToggle"]'); if (b) b.innerHTML = icon(TM.run ? 'pause' : 'play') + (TM.run ? ' 一時停止' : ' 再開');
  }
  function timerHtml(label) {
    return '<div class="tmbox" id="tmbox"><span class="small muted">' + esc(label || '残り時間') + '</span><b id="tmv" class="num">--:--</b>' +
      '<button type="button" class="btn small ghost" data-act="tmToggle">' + icon('pause') + ' 一時停止</button></div>';
  }

  /* ---------------------------------------------------------------------
     ルーター
     --------------------------------------------------------------------- */
  var VIEWS = {};
  var current = { name: '', params: {} };
  function parseHash() {
    var h = location.hash.replace(/^#\/?/, '');
    var qi = h.indexOf('?'), name = qi >= 0 ? h.slice(0, qi) : h, params = {};
    if (qi >= 0) h.slice(qi + 1).split('&').forEach(function (kv) { if (!kv) return; var p = kv.split('='); params[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || ''); });
    return { name: name || 'home', params: params };
  }
  function go(hash) { if (location.hash === hash) route(); else location.hash = hash; }
  var NAV_OF = { t: 'terms', e: 'essays', mockrun: 'mock', mockres: 'mock', o: 'oral', kako: 'about', settings: 'more' };
  var MORE_KEYS = ['about', 'plan', 'oral', 'more'];
  function route() {
    var r = parseHash();
    if (!VIEWS[r.name]) r = { name: 'home', params: {} };
    if (current.name === 'mockrun' && r.name !== 'mockrun') { pauseRun(); }
    timerStop(); current = r;
    document.body.classList.toggle('focus', r.name === 'mockrun');
    var navKey = NAV_OF[r.name] || r.name;
    $all('[data-nav]').forEach(function (a) {
      var k = a.getAttribute('data-nav'), on = k === navKey;
      if (a.closest('.tabbar') && k === 'more') on = MORE_KEYS.indexOf(navKey) >= 0;
      a.classList.toggle('on', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    VIEWS[r.name](r.params);
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);
  function setView(html) { $('#view').innerHTML = html; }
  function footer() {
    return '<div class="footer">' + esc(APP.name) + ' v' + APP.version + '　｜　非公式・広告なし・答案やメモはこの端末にのみ保存<br>' +
      '上智大学とは関係のない個人の学習ページです。問題・解答例はすべて独自に作成したもので、実際の入試問題ではありません。<a href="#/about">試験の概要・ご注意</a>　<a href="../">weekendclub</a></div>';
  }
  var SRC = { o: ['公式', 'src-o', '大学の公式情報で確認'], s: ['二次情報', 'src-s', '予備校・情報サイトなどの掲載'], u: ['未確認', 'src-u', '古い情報や個人の情報で、現在も同じかは未確認'] };
  function srcBadge(k) { var s = SRC[k] || SRC.u; return '<span class="srcb ' + s[1] + '" title="' + esc(s[2]) + '">' + s[0] + '</span>'; }

  /* ---------------------------------------------------------------------
     ホーム
     --------------------------------------------------------------------- */
  function upcoming() {
    var t = today();
    return (FACTS.schedule || []).filter(function (s) { return (s.end || s.date) >= t; }).sort(function (a, b) { return a.date < b.date ? -1 : 1; });
  }
  function termDue(id) {
    var s = store.terms[id]; if (!s) return false;
    var gap = s.r === 2 ? 14 : s.r === 1 ? 3 : 1;
    return daysBetween(s.d, today()) >= gap;
  }
  VIEWS.home = function () {
    var t = today(), ex = store.settings.examDate, up = upcoming();
    var left = ex ? daysBetween(t, ex) : null;
    var tSeen = Object.keys(store.terms).length, tOk = Object.keys(store.terms).filter(function (id) { return store.terms[id].r === 2; }).length;
    var eDone = Object.keys(store.essays).filter(function (id) { return store.essays[id].r != null; }).length;
    var due = TERMS.filter(function (x) { return termDue(x.id); }).length;
    var chkAll = PLAN.checklist.reduce(function (n, g) { return n + g.items.length; }, 0), chkOn = Object.keys(store.plan.chk).filter(function (k) { return store.plan.chk[k]; }).length;
    var alerts = (FACTS.alerts || []).filter(function (a) { return t <= a.until; });
    setView('<div class="wrap">' +
      alerts.map(function (a) { return '<div class="banner"><span class="bi">' + icon('cal') + '</span><span>' + a.html + '</span></div>'; }).join('') +
      '<section class="card hero-si"><p class="eyebrow small">上智大学大学院 総合人間科学研究科 心理学専攻 臨床心理学コース（非公式）</p>' +
      '<div class="hero-row"><div><h1>院試対策ノート</h1><p class="small muted">筆記試験（心理学：問I 語句説明＋問II 論述）と口述試験、研究計画書の準備をまとめて進めるためのページです。</p></div>' +
      (ex ? '<div class="cd"><span class="small">' + esc(ex === FACTS.defaultExam && FACTS.examLabel ? FACTS.examLabel : '目標の筆記試験') + 'まで</span><b class="num">' + (left >= 0 ? left + '<small>日</small>' : '終了') + '</b><span class="small">' + esc(jdate(ex)) + '</span></div>' : '') + '</div>' +
      (up.length ? '<h2 class="sec small-sec">この先の主な日程</h2><ul class="sched">' + up.slice(0, 4).map(schedItem).join('') + '</ul><p class="small muted">日程は' + esc(FACTS.scheduleYear || '') + 'のものです。必ず最新の入試要項で確認してください。→ <a href="#/about">試験の概要</a></p>' : '') +
      '</section>' +
      '<div class="kpis k4"><div class="kpi"><div class="k">語句（練習済み）</div><div class="v num">' + tSeen + '<small>/' + TERMS.length + '</small></div></div>' +
      '<div class="kpi"><div class="k">語句（◎）</div><div class="v num">' + tOk + '<small>語</small></div></div>' +
      '<div class="kpi"><div class="k">論述（解答済み）</div><div class="v num">' + eDone + '<small>/' + ESSAYS.length + '</small></div></div>' +
      '<div class="kpi"><div class="k">研究計画書チェック</div><div class="v num">' + chkOn + '<small>/' + chkAll + '</small></div></div></div>' +
      '<h2 class="sec">今日の練習（45分の例）</h2><ol class="tsteps">' +
      '<li class="tstep"><span class="tn">1</span><span class="b"><span class="t">語句説明 5語（15分）</span><span class="d small muted">' + (due ? '復習する語句が ' + due + ' 語あります' : '1語3分で、辞書的な定義を簡潔に（60〜150字）') + '</span></span><button class="btn small primary" data-act="termGo" data-n="5" data-mode="' + (due ? 'review' : 'new') + '">始める</button></li>' +
      '<li class="tstep"><span class="tn">2</span><span class="b"><span class="t">論述 1題（20分）</span><span class="d small muted">本番サイズ（1題20分）の設問を、まだ解いていないものから出します</span></span><button class="btn small" data-act="eRandom">始める</button></li>' +
      '<li class="tstep"><span class="tn">3</span><span class="b"><span class="t">口述の想定質問 2問（10分）</span><span class="d small muted">声に出して90秒で答え、要点をメモする</span></span><button class="btn small" data-act="oralRandom">始める</button></li>' +
      '</ol>' +
      '<h2 class="sec">対策する</h2><div class="modes">' +
      mode('#/about', 'info', '試験の概要', '公開された過去問4回分の形式と傾向、日程、出願書類、事前面談。情報の確かさを「公式／二次情報／未確認」で表示。', '確認') +
      mode('#/terms', 'cards', '語句説明', '本番は9〜12問を全問解答。臨床系と基礎系（知覚・神経・社会・発達・測定）を、辞書的な「簡潔な定義」と詳しい解説で。', TERMS.length + '語') +
      mode('#/essays', 'pen', '論述', '本番は9〜10問から4問を選択（臨床コースは臨床系から3問以上）。採点の観点、構成例、解答例つき。', ESSAYS.length + '題') +
      mode('#/mock', 'clock', '模擬試験', '本番形式（語句10問＋論述9問から4問選択）で120分。短い練習形式もあり。自己採点つき。', '120分') +
      mode('#/plan', 'doc', '研究計画書', '約2000字の構成と字数配分、提出前のチェックリスト、下書きの字数カウンター。', 'チェック') +
      mode('#/oral', 'mic', '口述試験', '想定質問と答え方の要点。考える30秒・話す90秒のタイマーで練習。', ORAL.length + '問') +
      '</div>' +
      '<div class="notice" style="margin-top:18px"><strong>このページについて：</strong>上智大学とは関係のない、個人による非公式の学習ページです。<strong>実際の入試問題は掲載していません</strong>（大学の公式サイトで公開されている過去問・出題意図で必ず確認してください）。練習問題・解答例はすべて独自に作成したもので、出題を予想するものではありません。研究計画書などの出願書類は、必ずご自身で書いてください。</div>' +
      footer() + '</div>');
  };
  function mode(h, ic, t, d, n) { return '<a class="mode" href="' + h + '"><span class="ic">' + icon(ic) + '</span><span class="t">' + t + '</span><span class="d">' + d + '</span><span class="n">' + n + '</span></a>'; }
  function schedItem(s) {
    var t = today(), left = daysBetween(t, s.date), past = (s.end || s.date) < t;
    var when = sdate(s.date) + (s.end ? '〜' + mdate(s.end) : '');
    return '<li class="' + (past ? 'past' : '') + '"><span class="sd num">' + esc(when) + '</span><span class="st">' + esc(s.label) + ' ' + srcBadge(s.src) + (s.note ? '<span class="small muted">' + esc(s.note) + '</span>' : '') + '</span>' +
      '<span class="sl num">' + (past ? '終了' : left > 0 ? 'あと' + left + '日' : s.end && left <= 0 ? '期間中' : '今日') + '</span></li>';
  }

  /* ---------------------------------------------------------------------
     試験の概要
     --------------------------------------------------------------------- */
  VIEWS.about = function () {
    setView('<div class="wrap narrow"><h1 class="page">試験の概要</h1>' +
      '<p class="lead">公開されている情報をもとに整理しました。各項目に情報の確かさを表示しています（' + srcBadge('o') + ' ' + srcBadge('s') + ' ' + srcBadge('u') + '）。出願前に<strong>必ず最新の入試要項と専攻別試験概要で確認</strong>してください。最終確認日：' + esc(FACTS.checked || '') + '</p>' +
      '<h2 class="sec">日程（' + esc(FACTS.scheduleYear || '') + '）</h2><ul class="sched">' + (FACTS.schedule || []).map(schedItem).join('') + '</ul>' +
      (FACTS.sections || []).map(function (s, i) { return '<section class="card prose fsec" id="fs-' + i + '"><h2>' + esc(s.t) + '</h2>' + s.html + '</section>'; }).join('') +
      footer() + '</div>');
  };

  /* ---------------------------------------------------------------------
     語句説明（本番の問I）
     --------------------------------------------------------------------- */
  var TL = { f: 'all', st: 'all', kw: '' };
  function tState(id) { var s = store.terms[id]; return !s ? 'new' : s.r === 2 ? 'ok' : s.r === 1 ? 'mid' : 'ng'; }
  VIEWS.terms = function () {
    var due = TERMS.filter(function (x) { return termDue(x.id); }).length;
    var fresh = TERMS.filter(function (x) { return !store.terms[x.id]; }).length;
    setView('<div class="wrap"><h1 class="page">語句説明</h1>' +
      '<p class="lead">本番の問Iは「語句の意味を簡潔に説明する」問題で、<strong>9〜12問すべてに答えます</strong>（公開された過去問4回分）。公式の解答例では、辞典や専門書にある<strong>基本的（辞書的）な定義が簡潔に述べられていること</strong>が求められています。まず「〜とは、…である。」の形で<strong>60〜150字</strong>程度の定義を書き、答え合わせでは「簡潔な定義」と「詳しい解説」を見比べます。</p>' +
      '<div class="card"><div class="row between"><div><div class="small muted">練習のしかた</div><div class="small">1回10語まで。◎は2週間後、△は3日後、×は翌日にもう一度出ます。本番では半分以上が基礎系（知覚・神経・社会・発達・研究法）の語句でした。</div></div>' +
      '<div class="row small-gap"><button class="btn primary" data-act="termGo" data-mode="new"' + (fresh ? '' : ' disabled') + '>' + icon('cards') + ' まだ解いていない語句（' + fresh + '）</button>' +
      '<button class="btn" data-act="termGo" data-mode="review"' + (due ? '' : ' disabled') + '>' + icon('redo') + ' 復習（' + due + '）</button>' +
      '<button class="btn" data-act="termGo" data-mode="random">ランダム10語</button></div></div></div>' +
      '<h2 class="sec">分野</h2><div class="seg wrapseg" role="group" aria-label="分野">' +
      '<button type="button" data-act="tlF" data-v="all" aria-pressed="' + (TL.f === 'all') + '">すべて（' + TERMS.length + '）</button>' +
      FIELDS.map(function (f) { var n = TERMS.filter(function (x) { return x.f === f.id; }).length; return '<button type="button" data-act="tlF" data-v="' + f.id + '" aria-pressed="' + (TL.f === f.id) + '">' + esc(f.name) + '（' + n + '）</button>'; }).join('') + '</div>' +
      (TL.f !== 'all' ? '<p class="small muted" style="margin:6px 0 0">' + esc(FBYID[TL.f].d || '') + '</p><div class="row" style="margin-top:8px"><button class="btn small primary" data-act="termGo" data-mode="field" data-f="' + TL.f + '">この分野で練習</button></div>' : '') +
      '<div class="searchbar" style="margin-top:14px"><input class="inp" id="tkw" type="search" placeholder="語句を検索（例：転移、扁桃体、効果量）" value="' + esc(TL.kw) + '" aria-label="語句を検索"></div>' +
      '<div class="filters"><div class="seg" role="group" aria-label="状態">' + [['all', 'すべて'], ['new', '未練習'], ['ng', '×'], ['mid', '△'], ['ok', '◎']].map(function (x) { return '<button type="button" data-act="tlSt" data-v="' + x[0] + '" aria-pressed="' + (TL.st === x[0]) + '">' + x[1] + '</button>'; }).join('') + '</div></div>' +
      '<ul class="tlist" id="tlist"></ul>' + footer() + '</div>');
    $('#tkw').addEventListener('input', function (e) { TL.kw = e.target.value; renderTermList(); });
    renderTermList();
  };
  function renderTermList() {
    var kw = norm(TL.kw);
    var list = TERMS.filter(function (x) {
      if (TL.f !== 'all' && x.f !== TL.f) return false;
      if (TL.st !== 'all' && tState(x.id) !== TL.st) return false;
      return !kw || norm(x.t + x.en + x.s + x.a).indexOf(kw) >= 0;
    });
    if (kw) { var rank = function (x) { return norm(x.t + x.en).indexOf(kw) >= 0 ? 0 : 1; }; list = list.map(function (x, i) { return { x: x, i: i }; }).sort(function (a, b) { return rank(a.x) - rank(b.x) || a.i - b.i; }).map(function (o) { return o.x; }); }
    $('#tlist').innerHTML = list.length ? list.map(function (x) {
      var st = tState(x.id);
      return '<li><a class="titem" href="#/t?id=' + esc(x.id) + '"><span class="rm r-' + st + '">' + { 'new': '', ok: '◎', mid: '△', ng: '×' }[st] + '</span><span class="b"><span class="t">' + esc(x.t) + '</span>' + (x.en ? '<span class="en small muted">' + esc(x.en) + '</span>' : '') + '</span><span class="chip">' + esc(FBYID[x.f] ? FBYID[x.f].short : '') + '</span></a></li>';
    }).join('') : '<li class="empty">該当する語句はありません。</li>';
  }
  var TS = null; // 用語の練習セッション { q:[ids], i, shown }
  function startTerms(mode, f, n) {
    var pool;
    if (mode === 'review') pool = shuffle(TERMS.filter(function (x) { return termDue(x.id); }));
    else if (mode === 'new') pool = TERMS.filter(function (x) { return !store.terms[x.id]; });
    else if (mode === 'field') pool = shuffle(TERMS.filter(function (x) { return x.f === f; }));
    else pool = shuffle(TERMS);
    if (mode === 'new') { // 分野をまぜて出す
      var byF = {}; pool.forEach(function (x) { (byF[x.f] = byF[x.f] || []).push(x); });
      var mixed = [], more = true, k = 0;
      while (more) { more = false; FIELDS.forEach(function (fd) { var a = byF[fd.id]; if (a && a[k]) { mixed.push(a[k]); more = true; } }); k++; }
      pool = mixed;
    }
    if (!pool.length) { toast('対象の語句はありません'); return; }
    TS = { q: pool.slice(0, n || 10).map(function (x) { return x.id; }), i: 0, shown: false, done: [] };
    go('#/t?s=1');
  }
  VIEWS.t = function (p) {
    if (p.id && (!TS || TS.single !== p.id)) TS = { q: [p.id], i: 0, shown: false, done: [], single: p.id };
    if (!TS) { go('#/terms'); return; }
    if (TS.i >= TS.q.length) { termsDone(); return; }
    var x = TBYID[TS.q[TS.i]], st = store.terms[x.id] || {}, ans = TS.shown ? (TS.ans || '') : (TS.draft != null ? TS.draft : '');
    var multi = TS.q.length > 1;
    setView('<div class="wrap narrow">' +
      '<div class="ptop"><a class="btn small ghost" href="#/terms">' + icon('x') + ' 終える</a><span class="title small muted">語句説明' + (multi ? '・' + (TS.i + 1) + ' / ' + TS.q.length : '') + '</span>' + (store.settings.termSec && !TS.shown ? timerHtml() : '<span></span>') + '</div>' +
      (multi ? '<div class="progress" aria-hidden="true"><i style="width:' + Math.round(TS.i / TS.q.length * 100) + '%"></i></div>' : '') +
      '<div class="card qbox"><div class="row small-gap"><span class="chip">' + esc(FBYID[x.f] ? FBYID[x.f].name : '') + '</span>' + (st.r != null ? '<span class="chip">前回 ' + ['×', '△', '◎'][st.r] + '</span>' : '') + '</div>' +
      '<p class="qlead small muted">次の語句の意味を簡潔に日本語で説明しなさい。</p><h1 class="term">' + esc(x.t) + (x.en ? '<span class="en">（' + esc(x.en) + '）</span>' : '') + '</h1>' +
      '<textarea class="inp ansbox" id="tAns" rows="5" placeholder="辞書的な定義を2〜3文で。「〜とは、…である。」に、提唱者や具体例を一言添える。"' + (TS.shown ? ' readonly' : '') + '>' + esc(ans) + '</textarea>' +
      '<div class="row between small"><span id="tCnt" class="num muted">' + charCount(ans) + '字</span><span class="muted">目安 60〜150字（このページの提案）</span></div>' +
      (TS.shown ? termAnswer(x, TS.ans || '') : '<div class="row end" style="margin-top:10px"><button class="btn" data-act="tSkip">わからない（解答例を見る）</button><button class="btn primary" data-act="tReveal">答え合わせ <kbd>Ctrl+Enter</kbd></button></div>') +
      '</div></div>');
    if (!TS.shown) {
      var ta = $('#tAns'); ta.focus();
      if (store.settings.termSec) timerStart(store.settings.termSec, function () { toast('時間です。区切りをつけて答え合わせへ'); });
    }
  }
  function termAnswer(x, ans) {
    var keys = x.k || [], hit = keys.filter(function (k) { return hasKey(ans, k); }).length;
    return '<div class="answer">' + (x.s ? '<h2 class="sub">簡潔な定義 <span class="small muted">本番の答案の目安・' + charCount(x.s) + '字</span></h2><div class="model def">' + paras(x.s) + '</div>' : '') +
      '<h2 class="sub">詳しい解説 <span class="small muted">理解を深めるために・' + charCount(x.a) + '字</span></h2><div class="model">' + paras(x.a) + '</div>' +
      (keys.length ? '<h2 class="sub">キーワード照合 <span class="small muted">' + hit + ' / ' + keys.length + '</span></h2><ul class="keys">' + keys.map(function (k) {
        var ok = hasKey(ans, k); return '<li class="' + (ok ? 'hit' : 'miss') + '">' + icon(ok ? 'check' : 'x') + esc(k.split('/')[0]) + (k.indexOf('/') > 0 ? '<span class="small muted">（' + esc(k.split('/').slice(1).join('・')) + ' も可）</span>' : '') + '</li>';
      }).join('') + '</ul><p class="small muted">キーワードは詳しい解説に含まれる要素です。簡潔な定義なら2〜3個入っていれば十分です。言い換えでも内容が合っていれば構いません。</p>' : '') +
      (x.p ? '<h2 class="sub">ポイント</h2><div class="note">' + fmt(x.p) + '</div>' : '') +
      '<h2 class="sub">自己評価</h2><div class="rates" role="group" aria-label="自己評価">' +
      [[2, '◎', '要点を押さえて書けた'], [1, '△', '一部書けた'], [0, '×', '書けなかった']].map(function (r) {
        return '<button type="button" class="rbtn r' + r[0] + '" data-act="tRate" data-v="' + r[0] + '"><b>' + r[1] + '</b><span>' + r[2] + '</span></button>';
      }).join('') + '</div></div>';
  }
  function termsDone() {
    var d = TS ? TS.done : [];
    setView('<div class="wrap narrow"><div class="card done-card"><h1 class="page">おつかれさまでした</h1>' +
      (d.length ? '<p>' + d.length + '語を練習しました（◎ ' + d.filter(function (x) { return x.r === 2; }).length + '・△ ' + d.filter(function (x) { return x.r === 1; }).length + '・× ' + d.filter(function (x) { return x.r === 0; }).length + '）。</p>' +
        '<ul class="rlist">' + d.map(function (x) { return '<li><span class="rm r-' + ['ng', 'mid', 'ok'][x.r] + '">' + ['×', '△', '◎'][x.r] + '</span><a class="b" href="#/t?id=' + esc(x.id) + '"><span class="t">' + esc(TBYID[x.id].t) + '</span></a></li>'; }).join('') + '</ul>' : '') +
      '<div class="row" style="justify-content:center;margin-top:14px"><button class="btn primary" data-act="termGo" data-mode="random">ランダムに10語</button><a class="btn" href="#/terms">一覧へ</a><a class="btn" href="#/essays">論述へ</a></div></div>' + footer() + '</div>');
    TS = null;
  }

  /* ---------------------------------------------------------------------
     論述
     --------------------------------------------------------------------- */
  var EL = { f: 'all', g: 'all' };
  var ETYPES = ['説明', '比較', '事例', '研究法', '基礎', '思想'];
  var ETLABEL = { '思想': '思想（参考）' };
  function eGroup(e) { return e.cl ? '臨床系' : '基礎系'; }
  function eReal(e) { return e.min <= 25; }   // 本番サイズ（1題20分前後）
  VIEWS.essays = function () {
    var inG = function (e) { return EL.g === 'all' || (EL.g === 'cl') === !!e.cl; };
    var list = ESSAYS.filter(function (e) { return inG(e) && (EL.f === 'all' || e.ty === EL.f); });
    if (EL.g !== 'all' || EL.f !== 'all') list.sort(function (a, b) { return (eReal(b) - eReal(a)) || a.idx - b.idx; });
    var nCl = ESSAYS.filter(function (e) { return e.cl; }).length;
    setView('<div class="wrap"><h1 class="page">論述</h1>' +
      '<p class="lead">本番の問IIは、<strong>9〜10問から4問を選んで論述</strong>します。臨床心理学コースは、<strong>4問のうち3問以上を臨床系の設問から</strong>選ぶ決まりでした（公開された過去問4回分）。120分から語句説明の時間を引くと、<strong>1題あたり20分前後</strong>です。「本番サイズ」の印がついた設問で時間を計って書き、<strong>採点の観点</strong>で自己点検しましょう。長めの設問は、理解を深める練習用です。</p>' +
      '<div class="card prose"><h3 style="margin-top:0">答案の型（どのタイプにも使える）</h3><ol><li><strong>序論</strong>：問いの言い換えと、答えの方向を一文で（全体の1〜2割）。</li><li><strong>本論</strong>：定義・理論 → 根拠・研究 → 具体例（臨床場面）を、観点ごとに段落を分けて（6〜7割）。</li><li><strong>結論</strong>：問いへの答えを短くまとめ、限界や臨床上の課題に一言ふれる（1〜2割）。</li></ol>' +
      '<p class="small" style="margin-bottom:0">設問で<strong>指定された語句</strong>（「〇〇と〇〇の2つの語を用いること」など）は必ず使い、<strong>設問が求める要素</strong>（意味と事例への当てはめ、共通点と相違点、方法とメリット・デメリットなど）を一つも落とさないことが、公式の解答例から読み取れる採点の基本です。</p></div>' +
      '<h2 class="sec">系統</h2><div class="seg wrapseg" role="group" aria-label="系統">' +
      [['all', 'すべて（' + ESSAYS.length + '）'], ['cl', '臨床系（' + nCl + '）'], ['ba', '基礎系（' + (ESSAYS.length - nCl) + '）']].map(function (x) { return '<button type="button" data-act="elG" data-v="' + x[0] + '" aria-pressed="' + (EL.g === x[0]) + '">' + x[1] + '</button>'; }).join('') + '</div>' +
      '<h2 class="sec">タイプ</h2><div class="seg wrapseg" role="group" aria-label="タイプ">' +
      '<button type="button" data-act="elF" data-v="all" aria-pressed="' + (EL.f === 'all') + '">すべて</button>' +
      ETYPES.map(function (t) { var n = ESSAYS.filter(function (e) { return inG(e) && e.ty === t; }).length; return n ? '<button type="button" data-act="elF" data-v="' + t + '" aria-pressed="' + (EL.f === t) + '">' + (ETLABEL[t] || t) + '（' + n + '）</button>' : ''; }).join('') + '</div>' +
      '<ul class="elist">' + (list.length ? list.map(function (e) {
        var st = store.essays[e.id], r = st && st.r != null ? st.r : null;
        return '<li><a class="eitem" href="#/e?id=' + esc(e.id) + '"><span class="rm r-' + (r == null ? 'new' : ['ng', 'mid', 'ok'][r]) + '">' + (r == null ? '' : ['×', '△', '◎'][r]) + '</span><span class="b"><span class="t">' + esc(e.q.split('\n')[0]) + '</span><span class="small muted">' + (eReal(e) ? '<span class="chip acc">本番サイズ</span> ' : '') + eGroup(e) + '・' + esc(ETLABEL[e.ty] || e.ty) + '・' + esc(FBYID[e.f] ? FBYID[e.f].name : '') + '・目安' + e.min + '分／' + esc(e.len) + '</span></span>' + icon('right') + '</a></li>';
      }).join('') : '<li class="empty">該当する設問はありません。</li>') + '</ul>' + footer() + '</div>');
  };
  var ES = { id: null, shown: false, outline: false };
  VIEWS.e = function (p) {
    var e = EBYID[p.id]; if (!e) { go('#/essays'); return; }
    if (ES.id !== e.id) ES = { id: e.id, shown: false, outline: false, started: false };
    var st = store.essays[e.id] || {}, ans = st.ans || '';
    setView('<div class="wrap narrow">' +
      '<p class="crumb small"><a href="#/essays">論述</a> › ' + esc(e.ty) + '</p>' +
      '<div class="card qbox"><div class="row small-gap"><span class="chip acc">' + eGroup(e) + '</span><span class="chip">' + esc(ETLABEL[e.ty] || e.ty) + '</span><span class="chip">' + esc(FBYID[e.f] ? FBYID[e.f].name : '') + '</span><span class="chip">目安 ' + e.min + '分・' + esc(e.len) + '</span>' + (st.r != null ? '<span class="chip">前回 ' + ['×', '△', '◎'][st.r] + '</span>' : '') + '</div>' +
      '<div class="eq">' + paras(e.q) + '</div>' +
      (ES.shown ? '' : '<div class="row between etools">' + (ES.started ? timerHtml() : '<button class="btn" data-act="eStart">' + icon('clock') + ' ' + e.min + '分で計る</button>') +
        '<button class="btn ghost" data-act="eOutline" aria-pressed="' + ES.outline + '">構成のヒント</button></div>') +
      (ES.outline && !ES.shown ? '<div class="note"><b>構成のヒント</b><ol class="olist">' + e.o.map(function (o) { return '<li>' + fmt(o) + '</li>'; }).join('') + '</ol></div>' : '') +
      '<textarea class="inp ansbox big" id="eAns" rows="14" placeholder="序論・本論・結論を意識して書きましょう。構成メモだけでも構いません。"' + (ES.shown ? ' readonly' : '') + '>' + esc(ans) + '</textarea>' +
      '<div class="row between small"><span id="eCnt" class="num muted">' + charCount(ans) + '字</span><span class="muted">目安 ' + esc(e.len) + '</span></div>' +
      (ES.shown ? essayAnswer(e, st) : '<div class="row end" style="margin-top:10px"><button class="btn primary" data-act="eReveal">書き終えた（観点・解答例を見る）</button></div>') +
      '</div>' +
      '<div class="pnav">' + (ESSAYS[e.idx - 1] ? '<a class="btn prev" href="#/e?id=' + esc(ESSAYS[e.idx - 1].id) + '">' + icon('left') + ' 前の問題</a>' : '<span></span>') + (ESSAYS[e.idx + 1] ? '<a class="btn" href="#/e?id=' + esc(ESSAYS[e.idx + 1].id) + '">次の問題 ' + icon('right') + '</a>' : '<a class="btn" href="#/essays">一覧へ</a>') + '</div>' +
      footer() + '</div>');
    if (ES.started && !ES.shown) timerStart(ES.left != null ? ES.left : e.min * 60, function () { toast('時間です。書き終えたら観点を確認しましょう'); });
  };
  function essayAnswer(e, st) {
    var rub = st.rub || {};
    var on = e.r.filter(function (x, i) { return rub[i]; }).length;
    return '<div class="answer"><h2 class="sub">採点の観点（自己点検） <span class="small muted">' + on + ' / ' + e.r.length + '</span></h2><ul class="rubric">' +
      e.r.map(function (r, i) { return '<li><label class="tgl"><input type="checkbox" data-act="eRub" data-i="' + i + '"' + (rub[i] ? ' checked' : '') + '><span>' + fmt(r) + '</span></label></li>'; }).join('') + '</ul>' +
      '<h2 class="sub">構成例</h2><ol class="olist">' + e.o.map(function (o) { return '<li>' + fmt(o) + '</li>'; }).join('') + '</ol>' +
      '<h2 class="sub">解答例 <span class="small muted">' + charCount(e.a) + '字</span></h2><div class="model">' + paras(e.a) + '</div>' +
      (e.n ? '<h2 class="sub">補足</h2><div class="note">' + fmt(e.n) + '</div>' : '') +
      '<h2 class="sub">自己評価</h2><div class="rates" role="group" aria-label="自己評価">' +
      [[2, '◎', '観点の大半を満たした'], [1, '△', '半分程度'], [0, '×', '書けなかった']].map(function (r) {
        return '<button type="button" class="rbtn r' + r[0] + '" data-act="eRate" data-v="' + r[0] + '" aria-pressed="' + (st.r === r[0]) + '"><b>' + r[1] + '</b><span>' + r[2] + '</span></button>';
      }).join('') + '</div><div class="row" style="margin-top:12px"><button class="btn small ghost" data-act="eRetry">' + icon('redo') + ' もう一度書く</button></div></div>';
  }

  /* ---------------------------------------------------------------------
     模擬試験。本番形式は、公開されている過去問（2025・2026年度の9月・2月入試）にならう：
     問I 語句説明（全問）＋問II 論述（9問から4問を選択。臨床コースは設問(1)〜(5)から3問以上）、120分
     --------------------------------------------------------------------- */
  var TP = 4, EP = 15;   // 自己採点の配点の目安：語句4点、論述15点（本番形式で100点）
  var PRESETS = [
    { id: 'real', name: '本番形式', t: 10, ec: 5, eb: 4, pick: 4, minCl: 3, min: 120, d: '問I 語句10問（全問）＋問II 論述9問から4問を選択。臨床系の設問(1)〜(5)から3問以上を選ぶ、過去問と同じルールです。' },
    { id: 'terms', name: '語句10問', t: 10, ec: 0, eb: 0, min: 35, d: '問Iだけの練習。1語3〜4分で、辞書的な定義を簡潔に書く。' },
    { id: 'essay', name: '論述2問', t: 0, ec: 2, eb: 0, min: 45, d: '臨床系の本番サイズの設問を2問。1問20分のペースをつかむ。' },
    { id: 'mini', name: 'ミニ（語句3・論述1）', t: 3, ec: 1, eb: 0, min: 30, d: '時間がない日の短縮版。' }
  ];
  var BASIC_F = { kiso: 1, neuro: 1, social: 1, kenkyu: 1 };
  VIEWS.mock = function () {
    var run = store.run;
    setView('<div class="wrap"><h1 class="page">模擬試験</h1>' +
      '<p class="lead">公開された過去問4回分の筆記試験（心理学・120分）は、いずれも<strong>問I 語句説明9〜12問（全問解答）</strong>と<strong>問II 論述9〜10問から4問を選択</strong>の構成でした。「本番形式」はこれにならい、語句10問と論述9問（臨床系5問・基礎系4問）を出します。終わったら解答例と採点の観点を見ながら<strong>自己採点</strong>します。</p>' +
      (run ? '<div class="banner info"><span class="bi">' + icon('clock') + '</span><span>実施中の模擬試験があります（残り ' + fmtMin(run.left) + '）</span><span class="spacer"></span><a class="btn small primary" href="#/mockrun">再開</a><button class="btn small ghost" data-act="mockDiscard">破棄</button></div>' : '') +
      '<div class="grid g2 stack-s">' + PRESETS.map(function (p) {
        return '<button class="mode' + (p.pick ? ' hot' : '') + '" data-act="mockStart" data-p="' + p.id + '"><span class="ic">' + icon('clock') + '</span><span class="t">' + esc(p.name) + '</span><span class="d">' + esc(p.d) + '</span><span class="n">' + p.min + '分</span></button>';
      }).join('') + '</div>' +
      '<div class="notice" style="margin-top:16px"><strong>時間配分の例（本番形式）：</strong>語句10問を35〜40分（1語3〜4分）→ 論述4問を各20分 → 見直し5分。最初の数分で問IIの9問に目を通し、選ぶ4問を決めておくと、語句を書きながら構成を考えられます。<br><strong>出題のしかた：</strong>語句は臨床系と基礎系が半々になるように、論述は分野が重ならないように選びます。まだ解いていない問題と、本番サイズ（1題20分前後）の論述が優先されます。</div>' +
      (store.mocks.length ? '<h2 class="sec">記録</h2><div class="card" style="padding:6px 14px; overflow-x:auto"><table class="tbl"><thead><tr><th>日時</th><th>形式</th><th class="r">自己採点</th><th class="r">時間</th><th></th></tr></thead><tbody>' +
        store.mocks.map(function (m, i) { return { m: m, i: i }; }).reverse().map(function (x) {
          var m = x.m, sc = mockScore(m);
          return '<tr><td class="num small">' + fmtDate(m.ts) + '</td><td class="small">' + esc(m.name) + '</td><td class="r num">' + (sc.done ? '<b>' + sc.pct + '</b>%' : '<span class="muted small">未採点</span>') + '</td><td class="r num small">' + fmtMin(m.used) + '</td><td class="r"><a class="btn small" href="#/mockres?i=' + x.i + '">詳細</a></td></tr>';
        }).join('') + '</tbody></table></div>' : '') +
      footer() + '</div>');
  };
  // 語句：臨床系と基礎系を半々に、分野が重ならないように。まだ解いていない語句を優先
  function pickTerms(n) {
    if (!n) return [];
    var unseen = function (x) { return !store.terms[x.id]; };
    var byF = {}; shuffle(TERMS).sort(function (a, b) { return unseen(b) - unseen(a); }).forEach(function (x) { (byF[x.f] = byF[x.f] || []).push(x); });
    var take = function (fs, k) {
      var out = [], i = 0;
      while (out.length < k && i < 40) { fs.forEach(function (f) { if (out.length < k && byF[f] && byF[f][i]) out.push(byF[f][i]); }); i++; }
      return out;
    };
    var fb = shuffle(FIELDS.filter(function (f) { return BASIC_F[f.id]; }).map(function (f) { return f.id; }));
    var fc = shuffle(FIELDS.filter(function (f) { return !BASIC_F[f.id]; }).map(function (f) { return f.id; }));
    var nb = Math.floor(n / 2);
    return shuffle(take(fc, n - nb).concat(take(fb, nb))).map(function (x) { return x.id; });
  }
  // 論述：臨床系を先に、基礎系を後に並べる（本番の設問番号の並びと同じ）。思想タイプは本番で確認できていないため出さない
  function pickEssays(nc, nb) {
    var unseen = function (e) { return !(store.essays[e.id] && store.essays[e.id].r != null); };
    var rank = function (e) { return (unseen(e) ? 0 : 2) + (eReal(e) ? 0 : 1); };
    var sorted = function (arr) { return shuffle(arr).sort(function (a, b) { return rank(a) - rank(b); }); };
    var pick = function (arr, k, key) {
      var out = [], used = {};
      arr.forEach(function (e) { var kk = key(e); if (out.length < k && !used[kk]) { used[kk] = 1; out.push(e); } });
      arr.forEach(function (e) { if (out.length < k && out.indexOf(e) < 0) out.push(e); });
      return out;
    };
    var c = nc ? pick(sorted(ESSAYS.filter(function (e) { return e.cl && e.ty !== '思想'; })), nc, function (e) { return e.ty === '事例' ? '事例' : e.f; }) : [];
    var b = nb ? pick(sorted(ESSAYS.filter(function (e) { return !e.cl; })), nb, function (e) { return e.f; }) : [];
    return c.concat(b).map(function (e) { return e.id; });
  }
  function pauseRun() { var r = store.run; if (r && r.running) { r.left = TM ? tmLeft() : r.left; r.running = false; save(true); } }
  function selInfo(r) {
    var sel = r.sel || [], cl = sel.filter(function (id) { return EBYID[id].cl; }).length;
    return { n: sel.length, cl: cl, ba: sel.length - cl };
  }
  function selStatus(r) { var s = selInfo(r); return '選択中 <b class="num">' + s.n + '</b> / ' + r.pick + '問（臨床系 ' + s.cl + '・基礎系 ' + s.ba + '）'; }
  VIEWS.mockrun = function () {
    var r = store.run; if (!r) { go('#/mock'); return; }
    var real = !!r.pick, sel = r.sel || [];
    var termsHtml = r.terms.length ? '<div class="card"><h2 class="sub">問I　次の語句の意味をそれぞれ簡潔に日本語で説明しなさい。</h2>' +
      r.terms.map(function (id, i) { var x = TBYID[id]; return '<div class="mq"><h3>(' + (i + 1) + ') ' + esc(x.t) + (x.en ? '<span class="en small muted">（' + esc(x.en) + '）</span>' : '') + '</h3><textarea class="inp ansbox" rows="3" data-mans="' + esc(id) + '">' + esc(r.ans[id] || '') + '</textarea><div class="small muted num" data-mcnt="' + esc(id) + '">' + charCount(r.ans[id]) + '字</div></div>'; }).join('') + '</div>' : '';
    var qII = r.terms.length ? '問II' : '論述';
    var essaysHtml = !r.essays.length ? '' : real ?
      '<div class="card"><h2 class="sub">' + qII + '　以下の設問から' + r.pick + '問を選んで、日本語で論述しなさい。</h2>' +
      '<p class="small muted" style="margin:0 0 6px">注　臨床心理学コースは、' + r.pick + '問のうち少なくとも' + r.minCl + '問を設問(1)〜(' + r.essays.filter(function (id) { return EBYID[id].cl; }).length + ')の中から選ぶこと（公開された過去問と同じルール）。選んだ設問にだけ解答欄が表示されます。</p>' +
      '<p class="small selst" id="selSt">' + selStatus(r) + '</p>' +
      r.essays.map(function (id, i) {
        var e = EBYID[id], on = sel.indexOf(id) >= 0;
        return '<div class="mq eq-pick' + (on ? ' on' : '') + '" data-eq="' + esc(id) + '"><div class="row between"><h3>(' + (i + 1) + ')</h3><button type="button" class="btn small' + (on ? ' primary' : '') + '" data-act="mSel" data-id="' + esc(id) + '" aria-pressed="' + on + '">' + (on ? '選択中' : 'この設問を選ぶ') + '</button></div>' +
          '<div class="eq">' + paras(e.q) + '</div><div class="ansarea"' + (on ? '' : ' hidden') + '><textarea class="inp ansbox big" rows="12" data-mans="' + esc(id) + '">' + esc(r.ans[id] || '') + '</textarea><div class="small muted num" data-mcnt="' + esc(id) + '">' + charCount(r.ans[id]) + '字</div></div></div>';
      }).join('') + '</div>'
      : r.essays.map(function (id, i) { var e = EBYID[id]; return '<div class="card"><h2 class="sub">' + qII + '(' + (i + 1) + ')</h2><div class="eq">' + paras(e.q) + '</div><p class="small muted">目安 ' + esc(e.len) + '</p><textarea class="inp ansbox big" rows="12" data-mans="' + esc(id) + '">' + esc(r.ans[id] || '') + '</textarea><div class="small muted num" data-mcnt="' + esc(id) + '">' + charCount(r.ans[id]) + '字</div></div>'; }).join('');
    setView('<div class="wrap narrow mockrun">' +
      '<div class="ptop sticky-top">' + timerHtml('残り時間') + '<span class="title small muted">' + esc(r.name) + '</span><button class="btn small primary" data-act="mockSubmit">提出する</button></div>' +
      termsHtml + essaysHtml +
      '<div class="row end"><button class="btn primary" data-act="mockSubmit">提出する</button></div></div>');
    r.running = true;
    timerStart(r.left, function () { toast('時間になりました。自動で提出しました'); submitMock(); });
  };
  function submitMock() {
    var r = store.run; if (!r) return;
    var left = TM ? tmLeft() : r.left; timerStop();
    var essays = r.pick ? r.essays.filter(function (id) { return (r.sel || []).indexOf(id) >= 0; }) : r.essays;
    var ans = {}; r.terms.concat(essays).forEach(function (id) { if (r.ans[id]) ans[id] = r.ans[id]; });
    store.mocks.push({ ts: Date.now(), name: r.name, preset: r.preset, terms: r.terms, essays: essays, offered: r.pick ? r.essays : null, ne: r.pick || essays.length, tp: r.tp || TP, ep: r.ep || EP, ans: ans, used: r.min * 60 - left, scores: {} });
    if (store.mocks.length > 30) store.mocks = store.mocks.slice(-30);
    store.run = null; logAdd('m'); save(true);
    go('#/mockres?i=' + (store.mocks.length - 1));
  }
  // 自己採点の合計。v1.0の記録（配点の記録なし）は、語句5点・論述25点で数える
  function mockScore(m) {
    var tp = m.tp || 5, ep = m.ep || 25, ne = m.ne != null ? m.ne : m.essays.length;
    var max = m.terms.length * tp + ne * ep, got = 0, n = 0, all = m.terms.concat(m.essays);
    all.forEach(function (id) { if (m.scores[id] != null) { got += m.scores[id]; n++; } });
    return { max: max, got: got, done: all.length > 0 && n === all.length, pct: max ? Math.round(got / max * 100) : 0 };
  }
  VIEWS.mockres = function (p) {
    var m = store.mocks[+p.i]; if (!m) { go('#/mock'); return; }
    var sc = mockScore(m), tp = m.tp || 5, ep = m.ep || 25;
    var sel = function (id, max) {
      var v = m.scores[id], opts = [];
      if (max <= 5) { for (var i = 0; i <= max; i++) opts.push(i); } else { var st = max / 5; for (var j = 0; j <= 5; j++) opts.push(j * st); }
      return '<label class="small sclab">自己採点 <select class="inp sc" data-act="mScore" data-id="' + esc(id) + '"><option value="">—</option>' + opts.map(function (o) { return '<option value="' + o + '"' + (v === o ? ' selected' : '') + '>' + o + '点</option>'; }).join('') + '</select> / ' + max + '点</label>';
    };
    var qno = function (id, i) { return m.offered ? '(' + (m.offered.indexOf(id) + 1) + ')' : '(' + (i + 1) + ')'; };
    var qII = m.terms.length ? '問II' : '論述';
    var skipped = m.offered ? m.offered.filter(function (id) { return m.essays.indexOf(id) < 0; }) : [];
    setView('<div class="wrap narrow"><p class="crumb small"><a href="#/mock">模擬試験</a> › 結果</p><h1 class="page">模擬試験の自己採点</h1>' +
      '<div class="card score-card"><div class="row between"><div><div class="small muted">' + esc(m.name) + '・' + fmtDate(m.ts) + '・解答時間 ' + fmtMin(m.used) + '</div><div class="big num" id="mTotal">' + sc.got + ' <small>/ ' + sc.max + '点</small>' + (sc.done ? '（' + sc.pct + '%）' : '') + '</div></div>' +
      '<div class="small muted">配点は自己採点用の目安です<br>（語句' + tp + '点・論述' + ep + '点）</div></div></div>' +
      (m.offered && m.essays.length < m.ne ? '<div class="notice">選んだ論述が ' + m.essays.length + ' 問でした（' + m.ne + '問を選ぶ形式）。足りない分は0点として合計しています。</div>' : '') +
      (m.terms.length ? '<h2 class="sec">問I　語句説明</h2>' : '') + m.terms.map(function (id) {
        var x = TBYID[id], a = m.ans[id] || '', keys = x.k || [], hit = keys.filter(function (k) { return hasKey(a, k); }).length;
        return '<div class="card rdet"><div class="rhead"><div class="rt"><b>' + esc(x.t) + '</b><span class="small muted">' + charCount(a) + '字・キーワード ' + hit + '/' + keys.length + '</span></div>' + sel(id, tp) + '</div>' +
          '<details><summary>答案と解答例を見る</summary>' +
          '<h3 class="sub">あなたの答案</h3><div class="mine">' + (a ? paras(a) : '<p class="muted">（未記入）</p>') + '</div>' +
          (x.s ? '<h3 class="sub">簡潔な定義</h3><div class="model def">' + paras(x.s) + '</div>' : '') +
          '<h3 class="sub">詳しい解説</h3><div class="model">' + paras(x.a) + '</div>' +
          '<ul class="keys">' + keys.map(function (k) { var ok = hasKey(a, k); return '<li class="' + (ok ? 'hit' : 'miss') + '">' + icon(ok ? 'check' : 'x') + esc(k.split('/')[0]) + '</li>'; }).join('') + '</ul></details></div>';
      }).join('') +
      m.essays.map(function (id, i) {
        var e = EBYID[id], a = m.ans[id] || '';
        return '<h2 class="sec">' + qII + qno(id, i) + '　論述<span class="sub">' + eGroup(e) + '</span></h2><div class="card rdet"><div class="rhead"><div class="rt"><b>' + esc(e.q.split('\n')[0]) + '</b><span class="small muted">' + charCount(a) + '字（目安 ' + esc(e.len) + '）</span></div>' + sel(id, ep) + '</div>' +
          '<details><summary>答案・採点の観点・解答例を見る</summary>' +
          '<h3 class="sub">あなたの答案</h3><div class="mine">' + (a ? paras(a) : '<p class="muted">（未記入）</p>') + '</div>' +
          '<h3 class="sub">採点の観点</h3><ul class="rubric plain">' + e.r.map(function (r) { return '<li>' + fmt(r) + '</li>'; }).join('') + '</ul>' +
          '<h3 class="sub">解答例</h3><div class="model">' + paras(e.a) + '</div></details></div>';
      }).join('') +
      (skipped.length ? '<h2 class="sec">選ばなかった設問</h2><p class="small muted">あとで1題ずつ練習できます。</p><ul class="elist">' + skipped.map(function (id) {
        var e = EBYID[id];
        return '<li><a class="eitem" href="#/e?id=' + esc(id) + '"><span class="rm r-new"></span><span class="b"><span class="t">' + qno(id, 0) + ' ' + esc(e.q.split('\n')[0]) + '</span><span class="small muted">' + eGroup(e) + '・' + esc(ETLABEL[e.ty] || e.ty) + '</span></span>' + icon('right') + '</a></li>';
      }).join('') + '</ul>' : '') +
      '<div class="row" style="margin-top:16px"><a class="btn" href="#/mock">模擬試験へ戻る</a></div>' + footer() + '</div>');
  };

  /* ---------------------------------------------------------------------
     研究計画書
     --------------------------------------------------------------------- */
  function planTotal() { return PLAN.parts.reduce(function (n, pt) { return pt.noCount ? n : n + charCount(store.plan.draft[pt.id]); }, 0); }
  VIEWS.plan = function () {
    var total = planTotal();
    var all = PLAN.checklist.reduce(function (n, g) { return n + g.items.length; }, 0), on = Object.keys(store.plan.chk).filter(function (k) { return store.plan.chk[k]; }).length;
    setView('<div class="wrap narrow"><h1 class="page">研究計画書</h1>' +
      '<div class="notice warnbox"><strong>必ずご自身で書いてください。</strong>2027年度の心理学専攻の試験概要には「出願書類の作成において、ChatGPT などの生成 AI を用いてはいけません。」と明記されています。また、偽造・虚偽記載・剽窃などがあった場合は入学が認められないとされています。このページは、構成の考え方と点検用のチェックリスト、字数を数える下書き欄だけを用意しており、文章を作る機能はありません。</div>' +
      (PLAN.sections || []).map(function (s) { return '<section class="card prose"><h2>' + esc(s.t) + '</h2>' + s.html + '</section>'; }).join('') +
      '<h2 class="sec">提出前のチェックリスト <span class="sub num">' + on + ' / ' + all + '</span></h2>' +
      PLAN.checklist.map(function (g, gi) {
        return '<div class="card"><h3 class="sub" style="margin-top:0">' + esc(g.g) + '</h3><ul class="rubric">' + g.items.map(function (it, ii) {
          var key = gi + '-' + ii; return '<li><label class="tgl"><input type="checkbox" data-act="pChk" data-k="' + key + '"' + (store.plan.chk[key] ? ' checked' : '') + '><span>' + fmt(it) + '</span></label></li>';
        }).join('') + '</ul></div>';
      }).join('') +
      '<h2 class="sec">下書きの字数カウンター <span class="sub num" id="pTotal">' + total + ' 字</span></h2>' +
      '<p class="small muted">各部分の目安の字数と、合計（目安 2000字）を数えます。入力した内容はこの端末にだけ保存されます。字数の数え方（空白を含むか等）は要項の指示に従ってください。</p>' +
      PLAN.parts.map(function (pt) {
        var c = charCount(store.plan.draft[pt.id]);
        return '<div class="card part"><div class="row between"><b>' + esc(pt.name) + '</b><span class="small num"><span data-pcnt="' + pt.id + '">' + c + '</span> / 目安 ' + esc(pt.target) + '</span></div><p class="small muted">' + fmt(pt.hint) + '</p><textarea class="inp" rows="5" data-pdraft="' + pt.id + '">' + esc(store.plan.draft[pt.id] || '') + '</textarea></div>';
      }).join('') +
      '<div class="row"><button class="btn" data-act="planText">' + icon('down') + ' 下書きをテキストで保存</button></div>' +
      footer() + '</div>');
  };

  /* ---------------------------------------------------------------------
     口述試験
     --------------------------------------------------------------------- */
  VIEWS.oral = function () {
    setView('<div class="wrap"><h1 class="page">口述試験</h1>' +
      '<p class="lead">想定質問に、<strong>声に出して</strong>答える練習をします。「考える30秒 → 話す90秒」のタイマーのあと、答え方の要点を確認し、自分の答えの要点をメモに残せます（メモはこの端末にだけ保存）。</p>' +
      '<div class="row"><button class="btn primary" data-act="oralRandom">' + icon('mic') + ' ランダムに練習</button></div>' +
      OGROUPS.map(function (g) {
        return '<h2 class="sec">' + esc(g) + '</h2><ul class="elist">' + ORAL.filter(function (o) { return o.g === g; }).map(function (o) {
          var st = store.oral[o.id];
          return '<li><a class="eitem" href="#/o?id=' + esc(o.id) + '"><span class="rm r-' + (st && st.n ? 'ok' : 'new') + '">' + (st && st.n ? '✓' : '') + '</span><span class="b"><span class="t">' + esc(o.q) + '</span>' + (st && st.memo ? '<span class="small muted">メモあり</span>' : '') + '</span>' + icon('right') + '</a></li>';
        }).join('') + '</ul>';
      }).join('') + footer() + '</div>');
  };
  var OS = { id: null, phase: 0 };
  VIEWS.o = function (p) {
    var o = OBYID[p.id]; if (!o) { go('#/oral'); return; }
    if (OS.id !== o.id) OS = { id: o.id, phase: 0 };
    var st = store.oral[o.id] || {};
    var ph = OS.phase; // 0:開始前 1:考える 2:話す 3:振り返り
    setView('<div class="wrap narrow"><p class="crumb small"><a href="#/oral">口述試験</a> › ' + esc(o.g) + '</p>' +
      '<div class="card qbox oral"><p class="small muted">面接官からの質問</p><h1 class="oq">' + esc(o.q) + '</h1>' +
      (ph === 0 ? '<div class="row"><button class="btn primary" data-act="oPhase" data-v="1">' + icon('play') + ' 考える30秒を始める</button><button class="btn" data-act="oPhase" data-v="2">すぐ話す（90秒）</button><button class="btn ghost" data-act="oPhase" data-v="3">要点を見る</button></div>' : '') +
      (ph === 1 || ph === 2 ? '<div class="ophase"><b>' + (ph === 1 ? '考える' : '声に出して話す') + '</b>' + timerHtml(ph === 1 ? '考える時間' : '話す時間') + '<button class="btn small" data-act="oPhase" data-v="' + (ph + 1) + '">' + (ph === 1 ? '話し始める' : '話し終えた') + '</button></div>' : '') +
      (ph === 3 ? '<div class="answer"><h2 class="sub">答え方の要点</h2><ul class="plist2">' + o.p.map(function (x) { return '<li>' + fmt(x) + '</li>'; }).join('') + '</ul>' +
        (o.x && o.x.length ? '<h2 class="sub">避けたいこと</h2><ul class="plist2 avoid">' + o.x.map(function (x) { return '<li>' + fmt(x) + '</li>'; }).join('') + '</ul>' : '') +
        '<h2 class="sub">自分の答えの要点メモ</h2><textarea class="inp" rows="5" data-omemo="' + esc(o.id) + '" placeholder="キーワードだけを3〜5個。文章で暗記しないほうが、本番で自然に話せます。">' + esc(st.memo || '') + '</textarea>' +
        '<div class="row" style="margin-top:10px"><button class="btn" data-act="oPhase" data-v="1">' + icon('redo') + ' もう一度</button><button class="btn primary" data-act="oralRandom">次の質問</button></div></div>' : '') +
      '</div>' + footer() + '</div>');
    if (ph === 1) timerStart(30, function () { OS.phase = 2; VIEWS.o({ id: o.id }); });
    if (ph === 2) timerStart(90, function () { OS.phase = 3; markOral(o.id); VIEWS.o({ id: o.id }); });
  };
  function markOral(id) { var st = store.oral[id] || (store.oral[id] = {}); st.n = (st.n || 0) + 1; st.d = today(); logAdd('o'); save(); }

  /* ---------------------------------------------------------------------
     過去問の分析メモ（公式の過去問を読んだ記録。問題文の転載ではなく、形式と分野を記録する）
     --------------------------------------------------------------------- */
  var KTYPES = ['語句説明', '論述（臨床系）', '論述（基礎系）', '事例', '研究法・統計', '思想・哲学', 'その他'];
  VIEWS.kako = function () {
    var list = store.kako || [];
    var byTy = {}, byF = {};
    list.forEach(function (k) { byTy[k.ty] = (byTy[k.ty] || 0) + 1; if (k.f) byF[k.f] = (byF[k.f] || 0) + 1; });
    var opt = function (v, l) { return '<option value="' + esc(v) + '">' + esc(l) + '</option>'; };
    setView('<div class="wrap narrow"><p class="crumb small"><a href="#/about">試験の概要</a> › 過去問の分析メモ</p><h1 class="page">過去問の分析メモ</h1>' +
      '<p class="lead">大学が公開している過去問と出題意図を読んだら、大問ごとに<strong>形式・分野・分量</strong>を記録しておきましょう。記録がたまると、どの形式・分野に時間をかけるべきかが見えてきます。記録はこの端末にだけ保存されます。</p>' +
      '<p class="small"><a href="https://adm.sophia.ac.jp/jpn/in_ad/graduate_kakomon/" target="_blank" rel="noopener noreferrer">上智大学 入試情報「大学院入試の過去の入試問題・情報の公表」</a>（外部サイト）</p>' +
      '<div class="card"><h2 class="sub" style="margin-top:0">記録を追加</h2><div class="kform">' +
      '<label class="field"><span class="lab">年度・時期</span><input class="inp" id="kY" placeholder="例：2026年度 2月入試" maxlength="40"></label>' +
      '<label class="field"><span class="lab">大問</span><input class="inp" id="kNo" placeholder="例：第1問" maxlength="20"></label>' +
      '<label class="field"><span class="lab">形式</span><select class="inp" id="kTy">' + KTYPES.map(function (t) { return opt(t, t); }).join('') + '</select></label>' +
      '<label class="field"><span class="lab">分野</span><select class="inp" id="kF">' + opt('', '（選ばない）') + FIELDS.map(function (f) { return opt(f.id, f.name); }).join('') + '</select></label>' +
      '<label class="field wide"><span class="lab">分量・時間の目安</span><input class="inp" id="kN" placeholder="例：語句10問（全問）／論述10問から4問" maxlength="60"></label>' +
      '<label class="field wide"><span class="lab">テーマ・メモ</span><textarea class="inp" id="kM" rows="3" placeholder="何が問われたか（キーワード）、出題意図から読み取れたこと、自分が書けそうか など" maxlength="600"></textarea></label>' +
      '</div><div class="row end"><button class="btn primary" data-act="kAdd">記録する</button></div></div>' +
      (list.length ?
        '<h2 class="sec">傾向 <span class="sub">' + list.length + '件</span></h2><div class="card"><div class="ksum"><div><div class="small muted">形式</div><ul class="kbars">' +
        KTYPES.concat(Object.keys(byTy).filter(function (t) { return KTYPES.indexOf(t) < 0; })).filter(function (t) { return byTy[t]; }).map(function (t) { return '<li><span>' + esc(t) + '</span><i style="--w:' + Math.round(byTy[t] / list.length * 100) + '%"></i><b class="num">' + byTy[t] + '</b></li>'; }).join('') + '</ul></div>' +
        '<div><div class="small muted">分野</div>' + (Object.keys(byF).length ? '<ul class="kbars">' + FIELDS.filter(function (f) { return byF[f.id]; }).map(function (f) {
          return '<li><button type="button" class="linkbtn" data-act="kField" data-f="' + f.id + '" title="この分野の語句を練習">' + esc(f.name) + '</button><i style="--w:' + Math.round(byF[f.id] / list.length * 100) + '%"></i><b class="num">' + byF[f.id] + '</b></li>';
        }).join('') + '</ul><p class="small muted">分野名を押すと、その分野の語句の一覧を開きます。</p>' : '<p class="small muted">分野を選んだ記録はまだありません。</p>') + '</div></div></div>' +
        '<h2 class="sec">記録</h2><ul class="klist">' + list.map(function (k, i) { return { k: k, i: i }; }).reverse().map(function (x) {
          var k = x.k;
          return '<li class="card"><div class="row between"><b>' + esc(k.y || '（年度未入力）') + (k.no ? '　' + esc(k.no) : '') + '</b><button type="button" class="btn small ghost" data-act="kDel" data-i="' + x.i + '" aria-label="この記録を削除">' + icon('x') + ' 削除</button></div>' +
            '<div class="row small-gap"><span class="chip acc">' + esc(k.ty) + '</span>' + (k.f && FBYID[k.f] ? '<span class="chip">' + esc(FBYID[k.f].name) + '</span>' : '') + (k.n ? '<span class="chip">' + esc(k.n) + '</span>' : '') + '</div>' +
            (k.m ? '<p class="kmemo">' + esc(k.m).replace(/\n/g, '<br>') + '</p>' : '') + '</li>';
        }).join('') + '</ul>'
        : '<p class="empty" style="margin-top:16px">まだ記録はありません。</p>') +
      '<p class="small muted" style="margin-top:14px">このメモは自分の学習用です。大学の入試問題を出版物やWebで利用する場合は、大学への事前の申請が必要とされています。</p>' +
      footer() + '</div>');
  };

  /* ---------------------------------------------------------------------
     メニュー・設定・記録
     --------------------------------------------------------------------- */
  VIEWS.more = function () {
    var item = function (h, ic, t, d) { return '<li><a href="' + h + '"><span class="ic">' + icon(ic) + '</span><span>' + t + '<span class="d">' + d + '</span></span></a></li>'; };
    setView('<div class="wrap narrow"><h1 class="page">メニュー</h1><ul class="morelist">' +
      item('#/about', 'info', '試験の概要', '過去問4回分の形式と傾向、日程、出願書類、事前面談') +
      item('#/plan', 'doc', '研究計画書', '構成と字数配分、チェックリスト、字数カウンター') +
      item('#/oral', 'mic', '口述試験', '想定質問と答え方の要点、タイマー練習') +
      item('#/kako', 'chart', '過去問の分析メモ', '公式の過去問を読んで、形式と分野の傾向を記録') +
      item('#/settings', 'gear', '設定・記録', '目標日、タイマー、データの書き出し・読み込み') +
      item('../psych-english/', 'link', '心理英語ノート', '心理学・精神分析の英語文献を読む練習（外国語検定の準備にも）') +
      item('../kouninshinrishi/', 'link', '公認心理師 国試ドリル', '基礎知識の確認に（択一式の練習問題）') +
      '</ul>' + footer() + '</div>');
  };
  VIEWS.settings = function () {
    var st = store.settings;
    var seg = function (key, v, label, cur) { return '<button type="button" data-act="set" data-k="' + key + '" data-v="' + v + '" aria-pressed="' + (String(cur) === String(v)) + '">' + label + '</button>'; };
    var days = Object.keys(store.log).length;
    setView('<div class="wrap narrow"><h1 class="page">設定・記録</h1><div class="card">' +
      '<div class="field"><label class="lab" for="exIn">目標の筆記試験日（ホームにカウントダウンを表示）</label><input class="inp" type="date" id="exIn" value="' + esc(st.examDate || '') + '"><p class="small muted">初期値は ' + esc(FACTS.scheduleYear || '') + ' の2月入試の筆記試験日です。受験する年度の日程に合わせて変えてください。</p></div>' +
      '<div class="field"><span class="lab">語句説明のタイマー（1語あたり）</span><div class="seg">' + seg('termSec', 0, 'なし', st.termSec) + seg('termSec', 120, '2分', st.termSec) + seg('termSec', 180, '3分', st.termSec) + seg('termSec', 240, '4分', st.termSec) + seg('termSec', 300, '5分', st.termSec) + '</div><p class="small muted">本番形式で語句10問を35〜40分で書くなら、1語3〜4分が目安です。</p></div>' +
      '<div class="field"><span class="lab">テーマ</span><div class="seg">' + seg('theme', 'auto', '端末に合わせる', st.theme) + seg('theme', 'light', 'ライト', st.theme) + seg('theme', 'dark', 'ダーク', st.theme) + '</div></div>' +
      '<div class="field"><span class="lab">文字の大きさ</span><div class="seg">' + seg('font', 's', '小', st.font) + seg('font', 'm', '標準', st.font) + seg('font', 'l', '大', st.font) + seg('font', 'xl', '特大', st.font) + '</div></div></div>' +
      '<h2 class="sec">記録</h2><div class="card"><p class="small">学習した日数：<b class="num">' + days + '</b>日　模擬試験：<b class="num">' + store.mocks.length + '</b>回</p>' +
      '<p class="small">答案・メモ・研究計画書の下書きは、このブラウザの中だけに保存されています。別の端末へ移すときや控えとして、書き出しておくと安心です。</p>' +
      '<div class="row"><button class="btn" data-act="export">' + icon('down') + ' 書き出す（JSON）</button><label class="btn">読み込む<input type="file" id="impFile" accept="application/json,.json" hidden></label><button class="btn danger" data-act="reset">記録を消す</button></div></div>' +
      footer() + '</div>');
    $('#exIn').addEventListener('change', function (e) { store.settings.examDate = e.target.value; save(); toast('目標日を保存しました'); });
    $('#impFile').addEventListener('change', importData);
  };
  function download(name, text, type) {
    var blob = new Blob([text], { type: type || 'text/plain;charset=utf-8' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function importData(e) {
    var f = e.target.files && e.target.files[0]; if (!f) return;
    var r = new FileReader();
    r.onload = function () {
      var d; try { d = JSON.parse(r.result); } catch (err) { toast('読み込めませんでした（JSONではありません）'); return; }
      if (!d || d.app !== APP.key || !d.store) { toast(d && typeof d.app === 'string' ? '別のアプリの書き出しファイルです' : 'このページの書き出しファイルではありません'); return; }
      confirmBox('読み込み', '<p>現在の記録を、ファイルの内容で置き換えます。よろしいですか？</p>', '置き換える', function () {
        var base = defaults(), s = d.store; Object.keys(base).forEach(function (k) { if (s[k] == null) s[k] = base[k]; });
        s.settings = Object.assign(base.settings, s.settings || {}); store = s; save(true); applyLook(); toast('読み込みました'); route();
      });
    };
    r.readAsText(f); e.target.value = '';
  }

  /* ---------------------------------------------------------------------
     操作（クリック・入力の委譲）
     --------------------------------------------------------------------- */
  var ACT = {
    skip: function (el, e) { e.preventDefault(); var m = $('#main'); m.focus(); m.scrollIntoView(); },
    tmToggle: function () { timerToggle(); },
    termGo: function (el) { startTerms(el.getAttribute('data-mode'), el.getAttribute('data-f'), +el.getAttribute('data-n') || 10); },
    tlF: function (el) { TL.f = el.getAttribute('data-v'); VIEWS.terms(); },
    tlSt: function (el) { TL.st = el.getAttribute('data-v'); $all('[data-act="tlSt"]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === el)); }); renderTermList(); },
    tReveal: function () { if (!TS) return; TS.ans = $('#tAns').value; TS.draft = null; TS.shown = true; timerStop(); VIEWS.t({}); var r = $('.rbtn'); if (r) r.scrollIntoView({ block: 'center' }); },
    tSkip: function () { if (!TS) return; TS.ans = $('#tAns').value; TS.shown = true; timerStop(); VIEWS.t({}); },
    tRate: function (el) {
      var x = TBYID[TS.q[TS.i]], v = +el.getAttribute('data-v'), prev = store.terms[x.id] || {};
      store.terms[x.id] = { r: v, d: today(), ans: TS.ans || '', n: (prev.n || 0) + 1 };
      TS.done.push({ id: x.id, r: v }); logAdd('t'); save();
      if (TS.single) { toast('記録しました'); TS = null; go('#/terms'); return; }
      TS.i++; TS.shown = false; TS.ans = ''; TS.draft = ''; VIEWS.t({}); window.scrollTo(0, 0);
    },
    elF: function (el) { EL.f = el.getAttribute('data-v'); VIEWS.essays(); },
    elG: function (el) { EL.g = el.getAttribute('data-v'); EL.f = 'all'; VIEWS.essays(); },
    eRandom: function () {
      var fresh = function (e) { return !(store.essays[e.id] && store.essays[e.id].r != null); };
      var pool = ESSAYS.filter(function (e) { return eReal(e) && fresh(e) && e.cl; });
      if (!pool.length) pool = ESSAYS.filter(function (e) { return eReal(e) && fresh(e); });
      if (!pool.length) pool = ESSAYS.filter(eReal);
      var e = shuffle(pool)[0]; ES = { id: null }; go('#/e?id=' + e.id);
    },
    eStart: function () { ES.started = true; ES.left = null; var y = window.scrollY; VIEWS.e({ id: ES.id }); window.scrollTo(0, y); $('#eAns').focus({ preventScroll: true }); },
    eOutline: function () { ES.outline = !ES.outline; ES.left = TM ? tmLeft() : null; var y = window.scrollY; VIEWS.e({ id: ES.id }); window.scrollTo(0, y); },
    eReveal: function () {
      var e = EBYID[ES.id], st = store.essays[e.id] || (store.essays[e.id] = {});
      st.ans = $('#eAns').value; st.sec = TM ? Math.round(e.min * 60 - tmLeft()) : st.sec; ES.shown = true; timerStop(); save();
      var y = window.scrollY; VIEWS.e({ id: e.id }); window.scrollTo(0, y);
    },
    eRate: function (el) { var st = store.essays[ES.id] || (store.essays[ES.id] = {}); var first = st.r == null; st.r = +el.getAttribute('data-v'); st.d = today(); if (first) logAdd('e'); save(); $all('[data-act="eRate"]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === el)); }); toast('記録しました'); },
    eRetry: function () { var st = store.essays[ES.id] || {}; st.ans = ''; st.rub = {}; ES.shown = false; ES.started = false; save(); VIEWS.e({ id: ES.id }); },
    mockStart: function (el) {
      var p = PRESETS.filter(function (x) { return x.id === el.getAttribute('data-p'); })[0];
      var go2 = function () {
        store.run = { preset: p.id, name: p.name + '（' + p.min + '分）', min: p.min, left: p.min * 60, terms: pickTerms(p.t), essays: pickEssays(p.ec, p.eb), pick: p.pick || 0, minCl: p.minCl || 0, sel: [], tp: TP, ep: EP, ans: {}, running: false };
        save(true); go('#/mockrun');
      };
      if (store.run) confirmBox('模擬試験', '<p>実施中の模擬試験を破棄して、新しく始めますか？</p>', '新しく始める', go2, true); else go2();
    },
    mockDiscard: function () { confirmBox('模擬試験の破棄', '<p>実施中の模擬試験の答案を破棄します。</p>', '破棄', function () { store.run = null; save(true); VIEWS.mock(); }, true); },
    mockSubmit: function () {
      var r = store.run, warn = '';
      if (r && r.pick) { var s = selInfo(r); if (s.n < r.pick) warn = '<p><strong>選んだ論述が ' + s.n + ' 問です</strong>（' + r.pick + '問まで選べます）。足りない分は0点になります。</p>'; }
      confirmBox('提出', warn + '<p>提出して自己採点に進みますか？（提出後は答案を書き直せません）</p>', '提出する', function () { submitMock(); });
    },
    mSel: function (el) {
      var r = store.run; if (!r || !r.pick) return;
      var id = el.getAttribute('data-id'), e = EBYID[id], sel = r.sel || (r.sel = []), i = sel.indexOf(id), s = selInfo(r);
      if (i >= 0) sel.splice(i, 1);
      else {
        if (s.n >= r.pick) { toast('選べるのは' + r.pick + '問までです。ほかの設問の選択を外してください'); return; }
        if (!e.cl && s.ba >= r.pick - r.minCl) { toast('臨床コースは' + r.minCl + '問以上を臨床系の設問から選ぶため、基礎系は' + (r.pick - r.minCl) + '問までです'); return; }
        sel.push(id);
      }
      if (TM) r.left = tmLeft(); save();
      var on = sel.indexOf(id) >= 0, box = el.closest('.eq-pick');
      box.classList.toggle('on', on); box.querySelector('.ansarea').hidden = !on;
      el.classList.toggle('primary', on); el.setAttribute('aria-pressed', String(on)); el.textContent = on ? '選択中' : 'この設問を選ぶ';
      $('#selSt').innerHTML = selStatus(r);
      if (on) { var ta = box.querySelector('textarea'); if (ta) ta.focus({ preventScroll: true }); }
    },
    oralRandom: function () {
      var pool = ORAL.filter(function (o) { return !(store.oral[o.id] && store.oral[o.id].d === today()); }); if (!pool.length) pool = ORAL;
      var o = shuffle(pool)[0]; OS = { id: o.id, phase: 0 }; go('#/o?id=' + o.id);
    },
    oPhase: function (el) { var v = +el.getAttribute('data-v'); if (v === 3 && OS.phase === 2) markOral(OS.id); else if (v === 3 && OS.phase < 2) { /* 要点だけを見る */ } OS.phase = v; VIEWS.o({ id: OS.id }); },
    kAdd: function () {
      var v = function (id) { var el = $('#' + id); return el ? el.value.trim() : ''; };
      var rec = { y: v('kY'), no: v('kNo'), ty: v('kTy'), f: v('kF'), n: v('kN'), m: v('kM'), ts: Date.now() };
      if (!rec.y && !rec.no && !rec.m) { toast('年度・大問・メモのいずれかを入力してください'); return; }
      store.kako = store.kako || []; store.kako.push(rec); save(true); toast('記録しました');
      var keepY = rec.y; VIEWS.kako(); var y = $('#kY'); if (y) y.value = keepY;
    },
    kDel: function (el) {
      var i = +el.getAttribute('data-i');
      confirmBox('記録の削除', '<p>この記録を削除しますか？</p>', '削除', function () { store.kako.splice(i, 1); save(true); VIEWS.kako(); }, true);
    },
    kField: function (el) { TL.f = el.getAttribute('data-f'); TL.st = 'all'; TL.kw = ''; go('#/terms'); },
    planText: function () {
      var t = PLAN.parts.map(function (pt) { return '【' + pt.name + '】\n' + (store.plan.draft[pt.id] || '') + '\n'; }).join('\n');
      download('research-plan-draft-' + today() + '.txt', '研究計画書 下書き（' + today() + ' 書き出し）\n\n' + t);
    },
    set: function (el) {
      var k = el.getAttribute('data-k'), v = el.getAttribute('data-v'); if (k === 'termSec') v = +v;
      store.settings[k] = v; save(); applyLook();
      $all('[data-act="set"][data-k="' + k + '"]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === el)); });
    },
    export: function () { download('siinsi-backup-' + today() + '.json', JSON.stringify({ app: APP.key, v: 1, exported: new Date().toISOString(), store: store }, null, 1), 'application/json'); toast('書き出しました'); },
    reset: function () {
      confirmBox('記録を消す', '<p>語句・論述・模擬試験・口述の記録と答案を消します。研究計画書の下書きとチェック、過去問の分析メモは残ります。</p>', '消す', function () {
        var keep = store.plan, s = store.settings, kk = store.kako; store = defaults(); store.plan = keep; store.settings = s; store.kako = kk; save(true); toast('記録を消しました'); route();
      }, true);
    }
  };
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]');
    if (!el || (el.tagName === 'INPUT' && el.type === 'checkbox') || el.tagName === 'SELECT') return;
    if (el.disabled) return;
    var a = ACT[el.getAttribute('data-act')]; if (!a) return;
    if (el.tagName === 'A' && el.getAttribute('data-act') !== 'skip') return;
    a(el, e);
  });
  document.addEventListener('change', function (e) {
    var el = e.target, act = el.getAttribute && el.getAttribute('data-act');
    if (act === 'eRub') { var st = store.essays[ES.id] || (store.essays[ES.id] = {}); st.rub = st.rub || {}; st.rub[+el.getAttribute('data-i')] = el.checked; save(); var e2 = EBYID[ES.id]; var on = e2.r.filter(function (x, i) { return st.rub[i]; }).length; var h = el.closest('.answer').querySelector('.sub .small'); if (h) h.textContent = on + ' / ' + e2.r.length; }
    else if (act === 'pChk') { store.plan.chk[el.getAttribute('data-k')] = el.checked; save(); }
    else if (act === 'mScore') {
      var m = store.mocks[+parseHash().params.i]; if (!m) return; var id = el.getAttribute('data-id');
      if (el.value === '') delete m.scores[id]; else m.scores[id] = +el.value; save();
      var sc = mockScore(m); $('#mTotal').innerHTML = sc.got + ' <small>/ ' + sc.max + '点</small>' + (sc.done ? '（' + sc.pct + '%）' : '');
    }
  });
  document.addEventListener('input', function (e) {
    var el = e.target;
    if (el.id === 'tAns' && TS) { TS.draft = el.value; $('#tCnt').textContent = charCount(el.value) + '字'; return; }
    if (el.id === 'eAns') { var st = store.essays[ES.id] || (store.essays[ES.id] = {}); st.ans = el.value; $('#eCnt').textContent = charCount(el.value) + '字'; save(); return; }
    if (el.hasAttribute('data-mans') && store.run) { var id = el.getAttribute('data-mans'); store.run.ans[id] = el.value; var c = $('[data-mcnt="' + id + '"]'); if (c) c.textContent = charCount(el.value) + '字'; if (TM) store.run.left = tmLeft(); save(); return; }
    if (el.hasAttribute('data-pdraft')) {
      var pid = el.getAttribute('data-pdraft'); store.plan.draft[pid] = el.value; save();
      var pc = $('[data-pcnt="' + pid + '"]'); if (pc) pc.textContent = charCount(el.value);
      var t = $('#pTotal'); if (t) t.textContent = planTotal() + ' 字';
      return;
    }
    if (el.hasAttribute('data-omemo')) { var oid = el.getAttribute('data-omemo'); var so = store.oral[oid] || (store.oral[oid] = {}); so.memo = el.value; save(); }
  });
  document.addEventListener('keydown', function (e) {
    if (!$('#modal').hidden) { if (e.key === 'Escape') closeModal(); return; }
    if (current.name === 't' && e.target.id === 'tAns' && e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); ACT.tReveal(); }
  });
  // 模擬試験中に画面を離れても、残り時間を保存しておく
  setInterval(function () { if (store.run && current.name === 'mockrun' && TM) { store.run.left = tmLeft(); save(); } }, 5000);

  /* ---------- 起動 ---------- */
  route();
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () { /* オフライン対応なしでも動く */ }); });
  }
  window.SIINSI = { version: APP.version, store: function () { return store; }, terms: TERMS, essays: ESSAYS, oral: ORAL, hasKey: hasKey, charCount: charCount };
})();
