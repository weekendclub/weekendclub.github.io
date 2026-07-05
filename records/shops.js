/* ============================================================
   レコード棚 - レコード店ディレクトリの表示ロジック
   ============================================================ */
renderNav("shops.html");
renderFooter();

function shopCardHtml(shop, records){
  var withPrice = records.filter(function(r){ return typeof r.price === "number"; });
  var total = withPrice.reduce(function(sum, r){ return sum + r.price; }, 0);

  var list = records.map(function(r){
    return '<a href="post.html?id='+encodeURIComponent(r.id)+'">' +
      '<span>'+escHtml(r.title)+' — '+escHtml(r.artist)+'</span>' +
      '<span>'+ (typeof r.price === "number" ? yen(r.price) : "―") +'</span>' +
    '</a>';
  }).join("");

  return (
    '<div class="rs-shop-card">' +
      '<h3>📍 '+escHtml(shop)+'</h3>' +
      '<div class="rs-shop-stats">' +
        '<div><div class="n">'+records.length+'</div><div class="l">購入枚数</div></div>' +
        '<div><div class="n">'+ (withPrice.length ? yen(total) : "―") +'</div><div class="l">合計金額</div></div>' +
      '</div>' +
      '<ul class="rs-shop-list">'+list+'</ul>' +
    '</div>'
  );
}

loadRecords(function(list){
  var byShop = {};
  list.forEach(function(r){
    var shop = r.shop || "購入先 未記入";
    (byShop[shop] = byShop[shop] || []).push(r);
  });
  var shopNames = Object.keys(byShop).sort(function(a,b){ return byShop[b].length - byShop[a].length; });

  var grid = document.getElementById("shopGrid");
  if(!shopNames.length){
    grid.innerHTML = '<p class="rs-empty">まだレコードが登録されていません。</p>';
    return;
  }
  grid.innerHTML = shopNames.map(function(s){ return shopCardHtml(s, byShop[s]); }).join("");
});
