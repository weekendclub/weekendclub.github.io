/* ============================================================
   レコード棚 - 音楽入門／深掘り／沼シリーズ一覧の表示ロジック

   ★ 連載を増やすには guides.json に1件足してください。
     入門は "series"、深掘りは "deepDives"、沼は "swamp" の
     配列に追加します。status を "published" にして url に
     記事ページを指定するとリンクが有効になります
     （"coming" のあいだは準備中表示）。
   ============================================================ */
renderNav("guides.html");
renderFooter();

var TIERS = [
  {key: "series",    grid: "guideGrid", labelPrefix: null},      // 第N回
  {key: "deepDives", grid: "deepGrid",  labelPrefix: "深掘り"},
  {key: "swamp",     grid: "swampGrid", labelPrefix: "沼"}
];

function guideCardHtml(g, labelPrefix, allById){
  var published = g.status === "published" && g.url;
  var numLabel = labelPrefix ? labelPrefix+" "+escHtml(String(g.no)) : "第"+escHtml(String(g.no))+"回";
  var reqTag = "";
  if(g.requires && allById[g.requires]){
    reqTag = '<span class="g-requires">↳ 「'+escHtml(allById[g.requires].title)+'」既読推奨</span>';
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
    d = d || {};
    var allById = {};
    TIERS.forEach(function(t){ (d[t.key]||[]).forEach(function(g){ allById[g.id] = g; }); });

    var sectionDividers = document.querySelectorAll(".section-divider");
    TIERS.forEach(function(t, i){
      var list = d[t.key] || [];
      var grid = document.getElementById(t.grid);
      if(!grid) return;
      if(!list.length){
        if(i === 0){ grid.innerHTML = '<p class="empty">まだ連載がありません。</p>'; return; }
        grid.style.display = "none";
        var divider = sectionDividers[i-1];
        if(divider) divider.style.display = "none";
        return;
      }
      grid.innerHTML = list.map(function(g){ return guideCardHtml(g, t.labelPrefix, allById); }).join("");
    });
  })
  .catch(function(){
    document.getElementById("guideGrid").innerHTML = '<p class="empty">読み込みに失敗しました。</p>';
  });
