/* ============================================================
   レコード棚 - 共通処理（全ページで読み込み）

   ★ サイト名・紹介文・ナビはここの SITE を書き換えれば
      すべてのページに反映されます。
   ============================================================ */
var SITE = {
  name: "レコード棚",
  nameEn: "THE RECORD SHELF",
  tagline: "買ったレコードを、1枚ずつ。",
  description: "買ったレコードを1枚ずつ記録していく個人的な音楽ブログ。購入店・価格つきで、盤の背景をまじめに解説します。",
  nav: [
    {label: "すべての記事", url: "index.html"},
    {label: "レコード店から探す", url: "shops.html"},
    {label: "About", url: "about.html"}
  ]
};

function escHtml(s){
  return String(s == null ? "" : s)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}
function yen(n){
  return "¥" + Number(n).toLocaleString("ja-JP");
}
function initial(str){
  var s = String(str || "?").trim();
  return s.charAt(0).toUpperCase();
}
function qs(name){
  return new URLSearchParams(location.search).get(name);
}

/* ジャンル文字列から見た目のテーマ（アクセントカラー）を判定 */
function genreTheme(genre){
  var g = String(genre || "").toLowerCase();
  if(g.indexOf("jazz") !== -1) return "jazz";
  if(g.indexOf("classical") !== -1 || g.indexOf("室内楽") !== -1 || g.indexOf("クラシック") !== -1) return "classical";
  if(g.indexOf("j-pop") !== -1 || g.indexOf("シティ") !== -1 || g.indexOf("citypop") !== -1) return "citypop";
  if(g.indexOf("rock") !== -1 || g.indexOf("ロック") !== -1) return "rock";
  return "default";
}

/* records.json を読み込み、各レコードに導出情報（テーマ色など）を付与する */
function loadRecords(cb){
  fetch("records.json", {cache:"no-store"})
    .then(function(r){ if(!r.ok) throw 0; return r.json(); })
    .then(function(d){
      var list = (d && d.records) || [];
      list.forEach(function(r){ r.theme = genreTheme(r.genre); });
      cb(list);
    })
    .catch(function(){ cb([]); });
}

function renderNav(activeUrl){
  var here = activeUrl || location.pathname.split("/").pop() || "index.html";
  var links = SITE.nav.map(function(n){
    var act = (n.url === here) ? ' class="active"' : '';
    return '<a href="'+esc_(n.url)+'"'+act+'>'+esc_(n.label)+'</a>';
  }).join("");
  var el = document.getElementById("rs-nav");
  if(!el) return;
  el.innerHTML =
    '<div class="wrap rs-nav-inner">' +
      '<a class="rs-brand" href="index.html"><span class="disc-mark"></span>' +
        '<span class="rs-brand-text">'+esc_(SITE.name)+'<small>'+esc_(SITE.nameEn)+'</small></span>' +
      '</a>' +
      '<nav class="rs-nav-links">'+links+'</nav>' +
    '</div>';
}
function esc_(s){ return escHtml(s); }

function renderFooter(){
  var el = document.getElementById("rs-footer");
  if(!el) return;
  el.innerHTML =
    '<div class="wrap rs-foot-inner">' +
      '<div><strong>'+esc_(SITE.name)+'</strong><span class="rs-foot-tag">'+esc_(SITE.tagline)+'</span></div>' +
      '<nav>' + SITE.nav.map(function(n){ return '<a href="'+esc_(n.url)+'">'+esc_(n.label)+'</a>'; }).join("") + '</nav>' +
    '</div>';
}

/* 共有ボタン用URL生成 */
function shareUrls(title, url){
  var t = encodeURIComponent(title);
  var u = encodeURIComponent(url);
  return {
    x: "https://twitter.com/intent/tweet?text="+t+"&url="+u,
    line: "https://social-plugins.line.me/lineit/share?url="+u
  };
}
