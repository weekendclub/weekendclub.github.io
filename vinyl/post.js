/* ============================================================
   レコード棚 - 記事ページ（post.html?id=...）の表示ロジック
   ============================================================ */
renderNav("post.html");
renderFooter();

/* 読み進み具合のバー */
window.addEventListener("scroll", function(){
  var h = document.documentElement;
  var max = h.scrollHeight - h.clientHeight;
  var p = max > 0 ? (h.scrollTop / max) * 100 : 0;
  document.getElementById("progress").style.width = p + "%";
});

function relatedCardHtml(r){
  var url = "post.html?id=" + encodeURIComponent(r.id);
  return (
    '<article class="pc" data-theme="'+escHtml(r.theme)+'">' +
      '<a href="'+url+'">'+coverHtml(r)+'</a>' +
      '<div class="pc-body">' +
        '<h2 class="pc-title"><a href="'+url+'">'+escHtml(r.title)+'</a></h2>' +
        '<p class="pc-byline">'+escHtml(r.artist)+'</p>' +
        '<a class="readmore" href="'+url+'">読む →</a>' +
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

  var noteBox = r.note ? '<div class="note-box">※ '+escHtml(r.note)+'</div>' : "";

  var pageUrl = location.href.split("#")[0];
  var share = shareUrls(r.title + "／" + r.artist, pageUrl);

  var paras = toParagraphs(r.description).map(function(p){
    return '<p>'+escHtml(p)+'</p>';
  }).join("");

  /* 前後の記事（FEED順＝新着順） */
  var feed = all.slice().reverse();
  var idx = feed.indexOf(r);
  var newer = idx > 0 ? feed[idx-1] : null;
  var older = idx < feed.length-1 ? feed[idx+1] : null;
  function pnLink(rec, cls, lbl, arrow){
    if(!rec) return '<a class="'+cls+' ph" aria-hidden="true"></a>';
    return '<a class="'+cls+'" href="post.html?id='+encodeURIComponent(rec.id)+'">' +
      '<span class="lbl">'+lbl+'</span>' +
      '<span class="ttl">'+arrow[0]+escHtml(rec.title)+arrow[1]+'</span></a>';
  }

  var related = all.filter(function(o){ return o.id !== r.id && o.genre === r.genre; }).slice(0,3);
  if(!related.length){
    related = all.filter(function(o){ return o.id !== r.id; }).slice(0,3);
  }

  document.getElementById("articleRoot").innerHTML =
    '<article data-theme="'+escHtml(r.theme)+'">' +
      '<div class="art-head">' +
        '<span class="kicker">'+escHtml(r.genre||"Record")+'</span>' +
        '<h1>'+escHtml(r.title)+'</h1>' +
        '<div class="art-byline"><b>'+escHtml(r.artist)+'</b>' +
          (metaBits.length ? '<span class="dot"></span><span>'+escHtml(metaBits.join(" ・ "))+'</span>' : '') +
          '<span class="dot"></span><span>約'+readingMinutes(r.description)+'分で読めます</span>' +
        '</div>' +
        (r.highlight ? '<p class="art-lede">'+escHtml(r.highlight)+'</p>' : '') +
      '</div>' +

      '<div class="turntable"><div class="tt-disc"><div class="tt-label">'+escHtml(initial(r.artist))+'</div></div>' +
        '<span class="tt-note">33 1/3 RPM ・ Now Playing</span></div>' +

      '<div class="art-grid">' +
        '<div class="art-body">' +
          '<h2>解説</h2>' + paras +
        '</div>' +
        '<aside class="spec">' +
          '<h3>盤の基本情報</h3>' +
          '<dl>'+specRows+'</dl>' +
          '<hr>' +
          '<h3>購入の記録</h3>' +
          '<dl>'+purchaseRows+'</dl>' +
          noteBox +
          '<div class="share">' +
            '<a href="'+escHtml(share.x)+'" target="_blank" rel="noopener">Xでシェア</a>' +
            '<a href="'+escHtml(share.line)+'" target="_blank" rel="noopener">LINEで送る</a>' +
          '</div>' +
        '</aside>' +
      '</div>' +

      '<nav class="pn">' +
        pnLink(newer, "prev", "新しい記事", ["← ",""]) +
        pnLink(older, "next", "古い記事", [""," →"]) +
      '</nav>' +

      '<a class="backlink" href="index.html">← レコード棚トップに戻る</a>' +
    '</article>' +

    (related.length ? (
      '<section class="related"><h2>あわせて聴きたい・読みたい</h2><div class="grid">' +
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
    '<div style="padding:80px 0;text-align:center;color:var(--ink3)">' +
      '<p style="font-family:var(--serif);font-size:17px">その盤は、棚に見あたりませんでした。</p>' +
      '<a class="backlink" href="index.html">← レコード棚トップに戻る</a>' +
    '</div>';
}

loadRecords(function(list){
  var id = qs("id");
  var record = list.filter(function(r){ return r.id === id; })[0];
  if(record){ renderArticle(record, list); } else { renderNotFound(); }
});
