/* ============================================================
   レコード棚 - 共通処理（全ページで読み込み）

   ★ サイト名・紹介文・ナビはここの SITE を書き換えれば
      すべてのページに反映されます。
   ============================================================ */
var SITE = {
  name: "レコード棚",
  nameEn: "THE RECORD SHELF",
  tagline: "一枚ずつ、確かめるように。",
  description: "買ったレコードを一枚ずつ、どこで・いくらで手に入れたかまで含めて記録していく音楽ブログ。ロックもジャズも歌謡曲もクラシックも、針を落として、確かめて、言葉にします。",
  nav: [
    {label: "すべての記事", url: "index.html"},
    {label: "音楽入門", url: "guides.html"},
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

/* 長い解説文を、読みやすい段落（数文ずつ）に分ける */
function toParagraphs(text){
  var sentences = String(text || "").match(/[^。]*。?/g) || [];
  var paras = [], cur = "";
  sentences.forEach(function(s){
    if(!s) return;
    cur += s;
    if(cur.length > 130){ paras.push(cur); cur = ""; }
  });
  if(cur) paras.push(cur);
  return paras;
}

/* およその読了時間（分）。日本語は1分あたり約450文字で計算 */
function readingMinutes(text){
  return Math.max(1, Math.round(String(text||"").length / 450));
}

/* ジャケット＋盤のビジュアル（全ページ共通で使う） */
function coverHtml(r, extraClass){
  return (
    '<span class="cover '+(extraClass||"")+'" data-theme="'+escHtml(r.theme)+'">' +
      '<span class="disc" aria-hidden="true"><span class="disc-label"><b>'+escHtml(initial(r.artist))+'</b></span></span>' +
      '<span class="sleeve">' +
        '<span class="sl-top">'+escHtml(r.label || r.genre || "LP")+'</span>' +
        '<span class="sl-title">'+escHtml(r.title)+'</span>' +
        '<span class="sl-artist">'+escHtml(r.artist)+'</span>' +
      '</span>' +
    '</span>'
  );
}

function renderNav(activeUrl){
  var here = activeUrl || location.pathname.split("/").pop() || "index.html";
  var links = SITE.nav.map(function(n){
    var act = (n.url === here) ? ' class="active"' : '';
    return '<a href="'+escHtml(n.url)+'"'+act+'>'+escHtml(n.label)+'</a>';
  }).join("");
  var el = document.getElementById("site-nav");
  if(!el) return;
  el.innerHTML =
    '<div class="wrap nav-inner">' +
      '<a class="brand" href="index.html"><span class="brand-disc"></span>' +
        '<span class="brand-text">'+escHtml(SITE.name)+'<small>'+escHtml(SITE.nameEn)+'</small></span>' +
      '</a>' +
      '<nav class="nav-links">'+links+'</nav>' +
    '</div>';
}

function renderFooter(){
  var el = document.getElementById("site-footer");
  if(!el) return;
  el.innerHTML =
    '<div class="wrap foot-inner">' +
      '<div class="foot-brand">' +
        '<strong>'+escHtml(SITE.name)+'</strong>' +
        '<span>'+escHtml(SITE.tagline)+'</span>' +
      '</div>' +
      '<nav>' + SITE.nav.map(function(n){ return '<a href="'+escHtml(n.url)+'">'+escHtml(n.label)+'</a>'; }).join("") + '</nav>' +
      '<p class="foot-note">ここに載っているレコードは、すべて実際に店で手に取って買った盤です。</p>' +
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
