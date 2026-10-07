/* =========================================================================
   勉強シートへ送る（weekendclub 共通）

   その日の学習結果を、本人が claude.ai に持っている「勉強シート」（非公開）へ送る。
   ・送り先（勉強シートのURL）は、この端末のブラウザ（localStorage）にだけ保存する。
     サイトのソースには誰のURLも書かない。
   ・送るのは「勉強シートを開いて送る」を押したときだけ。結果はURLの # の後ろに入れ、
     勉強シートを新しいタブで開く。勉強シート側で「シートに入れる」を押すと記録される。
   ・このファイル自体は外部と通信しない（リンクを開くだけ）。

   使い方：StudyLink.open({ title, date, minutes, lines, summary, empty, build(min) })
           build(min) は送る内容（JSONにできるオブジェクト）を返す。
   ========================================================================= */
(function () {
  'use strict';
  var KEY = 'weekendclub.studyLink.v1';

  function getUrl() { try { return localStorage.getItem(KEY) || ''; } catch (e) { return ''; } }
  function setUrl(u) { try { if (u) localStorage.setItem(KEY, u); else localStorage.removeItem(KEY); return true; } catch (e) { return false; } }
  function cleanUrl(u) {
    var m = String(u || '').trim().match(/^https:\/\/claude\.ai\/(?:code\/)?artifact\/[A-Za-z0-9_-]+/);
    return m ? m[0] : '';
  }
  function b64url(str) {
    var bytes = new TextEncoder().encode(str), bin = '';
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function link(payload) {
    var u = getUrl();
    return u ? u + '#rec.' + b64url(JSON.stringify(payload)) : '';
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function today() { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function dayStart(key) { var p = key.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]).getTime(); }
  // 解答した時刻の並びから、勉強した時間（分）の目安を出す。間が4分以上あいたら休憩とみなす
  function estimate(ts) {
    ts = (ts || []).filter(function (t) { return t > 0; }).sort(function (a, b) { return a - b; });
    if (!ts.length) return 0;
    var ms = 60000;
    for (var i = 1; i < ts.length; i++) ms += Math.min(ts[i] - ts[i - 1], 4 * 60000);
    return Math.max(1, Math.round(ms / 60000));
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var CSS =
    '.sl-ov{position:fixed;inset:0;z-index:9999;background:rgba(10,14,20,.5);display:grid;place-items:center;padding:16px}' +
    '.sl-box{background:Canvas;color:CanvasText;border-radius:14px;max-width:460px;width:100%;max-height:calc(100vh - 32px);overflow:auto;padding:20px;box-shadow:0 16px 48px rgba(0,0,0,.3);font:inherit;line-height:1.6}' +
    '.sl-box h2{margin:0 0 2px;font-size:1.15em}' +
    '.sl-sub{margin:0 0 12px;opacity:.7;font-size:.88em}' +
    '.sl-list{margin:0 0 10px;padding:10px 12px 10px 28px;border:1px solid rgba(128,128,128,.35);border-radius:10px;font-size:.92em}' +
    '.sl-sum{font-weight:700;margin:0 0 12px}' +
    '.sl-f{display:grid;gap:4px;margin:0 0 12px}' +
    '.sl-f label{font-size:.85em;font-weight:700}' +
    '.sl-f input{font:inherit;padding:8px 10px;border:1px solid rgba(128,128,128,.55);border-radius:8px;background:Canvas;color:CanvasText;width:100%;box-sizing:border-box}' +
    '.sl-hint{font-size:.8em;opacity:.72;margin:0}' +
    '.sl-set{border:1px dashed rgba(128,128,128,.55);border-radius:10px;padding:12px;margin:0 0 12px}' +
    '.sl-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}' +
    '.sl-btn{font:inherit;border:1px solid rgba(128,128,128,.55);background:Canvas;color:CanvasText;border-radius:9px;padding:8px 14px;cursor:pointer;text-decoration:none;display:inline-block}' +
    '.sl-btn.pri{background:CanvasText;color:Canvas;border-color:CanvasText;font-weight:700}' +
    '.sl-btn[aria-disabled="true"]{opacity:.45;pointer-events:none}' +
    '.sl-link{background:none;border:none;padding:0;color:inherit;text-decoration:underline;cursor:pointer;font:inherit;font-size:.85em;opacity:.8}' +
    '.sl-done{margin:12px 0 0;font-size:.9em;font-weight:700}' +
    '.sl-btn:focus-visible,.sl-link:focus-visible,.sl-f input:focus-visible{outline:2px solid CanvasText;outline-offset:2px}';
  var styled = false;

  function open(o) {
    if (!styled) { var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st); styled = true; }
    var prevFocus = document.activeElement;
    var ov = document.createElement('div');
    ov.className = 'sl-ov';
    ov.innerHTML =
      '<div class="sl-box" role="dialog" aria-modal="true" aria-labelledby="sl-title">' +
      '<h2 id="sl-title">勉強シートに送る</h2>' +
      '<p class="sl-sub">' + esc(o.title || '') + '・' + esc(o.date || today()) + '</p>' +
      (o.empty
        ? '<p>今日の記録はまだありません。問題を解いてから送ってください。</p>'
        : (o.lines && o.lines.length ? '<ul class="sl-list">' + o.lines.map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') + '</ul>' : '') +
          (o.summary ? '<p class="sl-sum">' + esc(o.summary) + '</p>' : '') +
          '<div class="sl-f"><label for="sl-min">勉強した時間（分）</label><input id="sl-min" type="number" min="0" max="600" step="5" inputmode="numeric" value="' + (+o.minutes || 0) + '">' +
          '<p class="sl-hint">解いた時刻から出した目安です。実際の時間に直してから送れます。</p></div>' +
          '<div class="sl-set" id="sl-set"' + (getUrl() ? ' hidden' : '') + '>' +
          '<div class="sl-f"><label for="sl-url">つなぎ先（自分の勉強シートのURL）</label><input id="sl-url" type="url" placeholder="https://claude.ai/artifact/…" value="' + esc(getUrl()) + '"></div>' +
          '<p class="sl-hint">勉強シートの「道のり」タブにあるURLを貼り付けます。最初の1回だけで、この端末のブラウザにだけ保存されます。</p>' +
          '<div class="sl-row" style="margin-top:8px"><button type="button" class="sl-btn" id="sl-save">つなぎ先を保存</button><span class="sl-hint" id="sl-msg"></span></div></div>') +
      '<div class="sl-row">' +
      (o.empty ? '' : '<a class="sl-btn pri" id="sl-go" target="_blank" rel="noopener" href="#">勉強シートを開いて送る</a>') +
      '<button type="button" class="sl-btn" id="sl-close">閉じる</button>' +
      (o.empty ? '' : '<button type="button" class="sl-link" id="sl-change"' + (getUrl() ? '' : ' hidden') + '>つなぎ先を変える</button>') +
      '</div>' +
      '<p class="sl-done" id="sl-done" hidden>勉強シートが開いたら、いちばん上の「シートに入れる」を押してください。</p>' +
      '</div>';
    document.body.appendChild(ov);
    function q(id) { return ov.querySelector('#' + id); }
    function refresh() {
      var go = q('sl-go'); if (!go) return;
      var url = getUrl();
      var min = Math.max(0, Math.min(600, parseInt((q('sl-min') || {}).value, 10) || 0));
      if (url) { go.href = link(o.build(min)); go.removeAttribute('aria-disabled'); }
      else { go.href = '#'; go.setAttribute('aria-disabled', 'true'); }
    }
    function close() {
      document.removeEventListener('keydown', onKey);
      ov.remove();
      if (prevFocus && prevFocus.focus) try { prevFocus.focus(); } catch (e) { /* なし */ }
    }
    function onKey(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', onKey);
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    q('sl-close').addEventListener('click', close);
    if (!o.empty) {
      q('sl-min').addEventListener('input', refresh);
      q('sl-save').addEventListener('click', function () {
        var u = cleanUrl(q('sl-url').value);
        if (!u) { q('sl-msg').textContent = 'https://claude.ai/artifact/ で始まるURLを貼り付けてください'; return; }
        setUrl(u);
        q('sl-msg').textContent = '保存しました';
        q('sl-set').hidden = true;
        q('sl-change').hidden = false;
        refresh();
      });
      q('sl-change').addEventListener('click', function () { q('sl-set').hidden = false; q('sl-url').focus(); });
      q('sl-go').addEventListener('click', function (e) {
        if (!getUrl()) { e.preventDefault(); q('sl-set').hidden = false; q('sl-url').focus(); return; }
        refresh();
        q('sl-done').hidden = false;
      });
      refresh();
    }
    var first = ov.querySelector(o.empty ? '#sl-close' : (getUrl() ? '#sl-go' : '#sl-url'));
    if (first) first.focus();
  }

  window.StudyLink = { getUrl: getUrl, setUrl: setUrl, link: link, estimate: estimate, today: today, dayStart: dayStart, open: open };
})();
