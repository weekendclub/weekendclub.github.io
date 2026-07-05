/* ============================================================
   レコード棚 - 音楽入門シリーズ一覧の表示ロジック

   ★ 連載を増やすには guides.json に1件足してください。
     status を "published" にして url に記事ページを指定すると
     リンクが有効になります（"coming" のあいだは準備中表示）。
   ============================================================ */
renderNav("guides.html");
renderFooter();

function guideCardHtml(g){
  var published = g.status === "published" && g.url;
  var inner =
    '<span class="g-no">第'+escHtml(String(g.no))+'回</span>' +
    '<h2>'+escHtml(g.title)+'</h2>' +
    '<p class="g-sub">'+escHtml(g.subtitle||"")+'</p>' +
    '<p class="g-desc">'+escHtml(g.description||"")+'</p>' +
    (published
      ? '<span class="readmore">読む →</span>'
      : '<span class="g-coming">Coming Soon ─ 準備中</span>');

  if(published){
    return '<a class="gcard" data-theme="'+escHtml(g.theme||"default")+'" href="'+escHtml(g.url)+'">'+inner+'</a>';
  }
  return '<div class="gcard coming" data-theme="'+escHtml(g.theme||"default")+'">'+inner+'</div>';
}

fetch("guides.json", {cache:"no-store"})
  .then(function(r){ if(!r.ok) throw 0; return r.json(); })
  .then(function(d){
    var list = (d && d.series) || [];
    var grid = document.getElementById("guideGrid");
    if(!list.length){
      grid.innerHTML = '<p class="empty">まだ連載がありません。</p>';
      return;
    }
    grid.innerHTML = list.map(guideCardHtml).join("");
  })
  .catch(function(){
    document.getElementById("guideGrid").innerHTML = '<p class="empty">読み込みに失敗しました。</p>';
  });
