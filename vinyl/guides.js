/* ============================================================
   レコード棚 - 音楽入門／深掘りシリーズ一覧の表示ロジック

   ★ 連載を増やすには guides.json に1件足してください。
     入門は "series"、深掘りは "deepDives" の配列に追加します。
     status を "published" にして url に記事ページを指定すると
     リンクが有効になります（"coming" のあいだは準備中表示）。
   ============================================================ */
renderNav("guides.html");
renderFooter();

function guideCardHtml(g, opts){
  opts = opts || {};
  var published = g.status === "published" && g.url;
  var numLabel = opts.deep ? "深掘り "+escHtml(String(g.no)) : "第"+escHtml(String(g.no))+"回";
  var reqTag = "";
  if(opts.deep && g.requires && opts.seriesById && opts.seriesById[g.requires]){
    reqTag = '<span class="g-requires">↳ 「'+escHtml(opts.seriesById[g.requires].title)+'」既読推奨</span>';
  }
  var inner =
    '<span class="g-no">'+numLabel+'</span>' +
    '<h2>'+escHtml(g.title)+'</h2>' +
    '<p class="g-sub">'+escHtml(g.subtitle||"")+'</p>' +
    '<p class="g-desc">'+escHtml(g.description||"")+'</p>' +
    reqTag +
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
    var series = (d && d.series) || [];
    var deepDives = (d && d.deepDives) || [];
    var seriesById = {};
    series.forEach(function(g){ seriesById[g.id] = g; });

    var grid = document.getElementById("guideGrid");
    grid.innerHTML = series.length
      ? series.map(function(g){ return guideCardHtml(g); }).join("")
      : '<p class="empty">まだ連載がありません。</p>';

    var deepGrid = document.getElementById("deepGrid");
    var deepSection = document.querySelector(".section-divider");
    if(!deepDives.length){
      if(deepSection) deepSection.style.display = "none";
      if(deepGrid) deepGrid.style.display = "none";
      return;
    }
    deepGrid.innerHTML = deepDives.map(function(g){ return guideCardHtml(g, {deep: true, seriesById: seriesById}); }).join("");
  })
  .catch(function(){
    document.getElementById("guideGrid").innerHTML = '<p class="empty">読み込みに失敗しました。</p>';
  });
