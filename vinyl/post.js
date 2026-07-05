/* ============================================================
   レコード棚 - 記事ページ（post.html?id=...）の表示ロジック
   ============================================================ */
renderNav("post.html");
renderFooter();

function relatedCardHtml(r){
  return (
    '<article class="rs-postcard" data-theme="'+escHtml(r.theme)+'">' +
      '<div class="rs-sleeve"><div class="disc"></div><span class="kicker-tag">'+escHtml(r.genre||"Record")+'</span></div>' +
      '<div class="rs-post-body">' +
        '<h2 class="rs-post-title"><a href="post.html?id='+encodeURIComponent(r.id)+'">'+escHtml(r.title)+'</a></h2>' +
        '<p class="rs-post-byline">'+escHtml(r.artist)+'</p>' +
        '<a class="rs-readmore" href="post.html?id='+encodeURIComponent(r.id)+'">読む →</a>' +
      '</div>' +
    '</article>'
  );
}

function renderArticle(r, all){
  document.title = r.title + "／" + r.artist + "｜レコード棚";
  var desc = r.highlight || (r.description || "").slice(0, 90);
  document.getElementById("metaDesc").setAttribute("content", desc);
  document.getElementById("ogTitleTag").setAttribute("content", r.title + "／" + r.artist);
  document.getElementById("ogDescTag").setAttribute("content", desc);
  document.getElementById("crumbTitle").textContent = r.title;

  var metaBits = [];
  if(r.year) metaBits.push(r.year + "年");
  if(r.label) metaBits.push(r.label);

  var specRows = [
    ["アーティスト", r.artistJa || r.artist],
    ["発売年", r.year ? r.year+"年" : "不明"],
    ["レーベル", r.label || "不明"],
    ["ジャンル", r.genre || "―"],
    ["フォーマット", r.format || "―"],
    ["盤の情報", r.pressing || "特記なし"]
  ].map(function(row){
    return '<dt>'+escHtml(row[0])+'</dt><dd>'+escHtml(row[1])+'</dd>';
  }).join("");

  var purchaseRows =
    '<dt>購入店</dt><dd>'+ (r.shop ? escHtml(r.shop) + (r.shopArea?"（"+escHtml(r.shopArea)+"）":"") : "未記入") +'</dd>' +
    '<dt>購入価格</dt><dd class="price">'+ (typeof r.price === "number" ? yen(r.price) : "未記入") +'</dd>' +
    (r.purchaseDate ? '<dt>購入日</dt><dd>'+escHtml(r.purchaseDate)+'</dd>' : "");

  var noteBox = r.note ? '<div class="rs-note-box">※ '+escHtml(r.note)+'</div>' : "";

  var pageUrl = location.href.split("#")[0];
  var share = shareUrls(r.title + "／" + r.artist, pageUrl);

  var related = all.filter(function(o){ return o.id !== r.id && o.genre === r.genre; }).slice(0,3);
  if(!related.length){
    related = all.filter(function(o){ return o.id !== r.id; }).slice(0,3);
  }

  document.getElementById("articleRoot").innerHTML =
    '<article data-theme="'+escHtml(r.theme)+'">' +
      '<div class="rs-article-head">' +
        '<span class="rs-kicker">'+escHtml(r.genre||"Record")+'</span>' +
        '<h1>'+escHtml(r.title)+'</h1>' +
        '<p class="rs-article-byline"><b>'+escHtml(r.artist)+'</b>'+(metaBits.length?' ・ '+escHtml(metaBits.join(" ・ ")):'')+'</p>' +
        (r.highlight ? '<p class="rs-lede">'+escHtml(r.highlight)+'</p>' : '') +
      '</div>' +

      '<div class="rs-article-visual"><div class="disc"></div></div>' +

      '<div class="rs-article-grid">' +
        '<div class="rs-article-body">' +
          '<h2>解説</h2>' +
          '<p>'+escHtml(r.description||"").replace(/\n/g,"<br>")+'</p>' +
        '</div>' +
        '<aside class="rs-spec">' +
          '<h3>盤の基本情報</h3>' +
          '<dl>'+specRows+'</dl>' +
          '<hr>' +
          '<h3>購入情報</h3>' +
          '<dl>'+purchaseRows+'</dl>' +
          noteBox +
          '<div class="rs-share">' +
            '<a href="'+escHtml(share.x)+'" target="_blank" rel="noopener">Xでシェア</a>' +
            '<a href="'+escHtml(share.line)+'" target="_blank" rel="noopener">LINEで送る</a>' +
          '</div>' +
        '</aside>' +
      '</div>' +

      '<a class="rs-back" href="index.html">← レコード棚トップに戻る</a>' +
    '</article>' +

    (related.length ? (
      '<section class="rs-related"><h2>あわせて読みたい</h2><div class="rs-grid">' +
        related.map(relatedCardHtml).join("") +
      '</div></section>'
    ) : "");

  injectJsonLd(r, pageUrl);
}

function injectJsonLd(r, pageUrl){
  var ld = {
    "@context": "https://schema.org",
    "@type": "Review",
    "itemReviewed": {
      "@type": "MusicAlbum",
      "name": r.title,
      "byArtist": r.artist,
      "datePublished": r.year ? String(r.year) : undefined
    },
    "reviewBody": r.description,
    "url": pageUrl
  };
  var s = document.createElement("script");
  s.type = "application/ld+json";
  s.textContent = JSON.stringify(ld);
  document.head.appendChild(s);
}

function renderNotFound(){
  document.getElementById("articleRoot").innerHTML =
    '<div style="padding:70px 0;text-align:center;color:var(--ink-dim)">' +
      '<p>指定されたレコードが見つかりませんでした。</p>' +
      '<a class="rs-back" href="index.html">← レコード棚トップに戻る</a>' +
    '</div>';
}

loadRecords(function(list){
  var id = qs("id");
  var record = list.filter(function(r){ return r.id === id; })[0];
  if(record){ renderArticle(record, list); } else { renderNotFound(); }
});
