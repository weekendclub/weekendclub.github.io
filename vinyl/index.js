/* ============================================================
   レコード棚 - トップページ（記事一覧）の表示ロジック
   ============================================================ */
var ALL_RECORDS = [];

function renderStats(list){
  var withPrice = list.filter(function(r){ return typeof r.price === "number"; });
  var total = withPrice.reduce(function(sum, r){ return sum + r.price; }, 0);
  var shops = list.map(function(r){ return r.shop; }).filter(function(s){ return s; });
  var uniqueShops = shops.filter(function(s, i){ return shops.indexOf(s) === i; });

  document.getElementById("statCount").textContent = list.length;
  document.getElementById("statSpent").textContent = withPrice.length ? yen(total) : "―";
  document.getElementById("statShops").textContent = uniqueShops.length;
}

function populateFilters(list){
  var shopSel = document.getElementById("shopFilter");
  var shops = list.map(function(r){ return r.shop; }).filter(function(s){ return s; });
  var uniqueShops = shops.filter(function(s, i){ return shops.indexOf(s) === i; }).sort();
  shopSel.innerHTML = '<option value="">すべての購入先</option>' +
    uniqueShops.map(function(s){ return '<option value="'+escHtml(s)+'">'+escHtml(s)+'</option>'; }).join("");

  var genreSel = document.getElementById("genreFilter");
  var genres = list.map(function(r){ return r.genre; }).filter(function(s){ return s; });
  var uniqueGenres = genres.filter(function(s, i){ return genres.indexOf(s) === i; }).sort();
  genreSel.innerHTML = '<option value="">すべてのジャンル</option>' +
    uniqueGenres.map(function(g){ return '<option value="'+escHtml(g)+'">'+escHtml(g)+'</option>'; }).join("");
}

function postCardHtml(r){
  var metaBits = [];
  if(r.year) metaBits.push(r.year + "年");
  if(r.label) metaBits.push(r.label);

  var priceBadge = typeof r.price === "number"
    ? '<span class="rs-pill">📍 <strong>'+escHtml(r.shop||"購入先未記入")+'</strong> ・ '+yen(r.price)+'</span>'
    : '<span class="rs-pill">購入情報 未記入</span>';

  var excerpt = r.highlight || (r.description ? r.description.slice(0, 70) + "…" : "");

  return (
    '<article class="rs-postcard" data-theme="'+escHtml(r.theme)+'">' +
      '<div class="rs-sleeve"><div class="disc"></div><span class="kicker-tag">'+escHtml(r.genre||"Record")+'</span></div>' +
      '<div class="rs-post-body">' +
        '<h2 class="rs-post-title"><a href="post.html?id='+encodeURIComponent(r.id)+'">'+escHtml(r.title)+'</a></h2>' +
        '<p class="rs-post-byline">'+escHtml(r.artist)+(metaBits.length ? ' ・ '+escHtml(metaBits.join(" ・ ")) : '')+'</p>' +
        '<p class="rs-post-excerpt">'+escHtml(excerpt)+'</p>' +
        '<div class="rs-post-foot">' +
          priceBadge +
          '<a class="rs-readmore" href="post.html?id='+encodeURIComponent(r.id)+'">続きを読む →</a>' +
        '</div>' +
      '</div>' +
    '</article>'
  );
}

function renderGrid(list){
  var grid = document.getElementById("grid");
  if(!list.length){
    grid.innerHTML = '<p class="rs-empty">該当するレコードが見つかりませんでした。</p>';
    return;
  }
  grid.innerHTML = list.map(postCardHtml).join("");
}

function applyFiltersAndRender(){
  var q = document.getElementById("search").value.trim().toLowerCase();
  var genre = document.getElementById("genreFilter").value;
  var shop = document.getElementById("shopFilter").value;
  var sort = document.getElementById("sortBy").value;

  var list = ALL_RECORDS.filter(function(r){
    var matchesQ = !q || [r.title, r.artist, r.artistJa, r.label, r.genre].some(function(f){
      return f && String(f).toLowerCase().indexOf(q) !== -1;
    });
    var matchesGenre = !genre || r.genre === genre;
    var matchesShop = !shop || r.shop === shop;
    return matchesQ && matchesGenre && matchesShop;
  });

  list = list.slice().sort(function(a,b){
    if(sort === "artist") return String(a.artist).localeCompare(String(b.artist), "ja");
    if(sort === "title") return String(a.title).localeCompare(String(b.title), "ja");
    if(sort === "priceHigh") return (b.price||0) - (a.price||0);
    if(sort === "priceLow") return (a.price==null?Infinity:a.price) - (b.price==null?Infinity:b.price);
    return 0;
  });
  if(sort === "added") list.reverse();

  renderGrid(list);
}

function boot(records){
  ALL_RECORDS = records;
  renderStats(ALL_RECORDS);
  populateFilters(ALL_RECORDS);
  applyFiltersAndRender();

  document.getElementById("search").addEventListener("input", applyFiltersAndRender);
  document.getElementById("genreFilter").addEventListener("change", applyFiltersAndRender);
  document.getElementById("shopFilter").addEventListener("change", applyFiltersAndRender);
  document.getElementById("sortBy").addEventListener("change", applyFiltersAndRender);
}

renderNav("index.html");
renderFooter();
loadRecords(boot);
