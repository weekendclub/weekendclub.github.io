/* ============================================================
   レコード棚 - トップページ（記事一覧）の表示ロジック
   ============================================================ */
var ALL_RECORDS = [];   /* records.json の順（古い→新しい） */
var FEED = [];          /* 新着順（新しい→古い） */

function renderStats(list){
  var withPrice = list.filter(function(r){ return typeof r.price === "number"; });
  var total = withPrice.reduce(function(sum, r){ return sum + r.price; }, 0);
  var shops = list.map(function(r){ return r.shop; }).filter(function(s){ return s; });
  var uniqueShops = shops.filter(function(s, i){ return shops.indexOf(s) === i; });

  document.getElementById("statCount").textContent = list.length + "枚";
  document.getElementById("statSpent").textContent = withPrice.length ? yen(total) : "―";
  document.getElementById("statShops").textContent = uniqueShops.length + "軒";
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

function metaLine(r){
  var bits = [];
  if(r.year) bits.push(r.year + "年");
  if(r.label) bits.push(r.label);
  return bits.join(" ・ ");
}

function renderFeatured(r){
  var el = document.getElementById("featured");
  if(!r){ el.innerHTML = ""; return; }
  var url = "post.html?id=" + encodeURIComponent(r.id);
  var shopPill = (r.shop || typeof r.price === "number")
    ? '<span class="pill">📍 <strong>'+escHtml(r.shop||"購入先未記入")+'</strong>'+(typeof r.price==="number" ? " ・ "+yen(r.price) : "")+'</span>'
    : '';
  el.innerHTML =
    '<div data-theme="'+escHtml(r.theme)+'">' +
      '<div class="feat-flag">New Arrival ─ 最新の一枚</div>' +
      '<div class="feat-card">' +
        '<a href="'+url+'">'+coverHtml(r)+'</a>' +
        '<div class="feat-body">' +
          '<div class="pill-row"><span class="pill acc">'+escHtml(r.genre||"Record")+'</span>' +
            (r.pressing ? '<span class="pill">'+escHtml(r.pressing)+'</span>' : '') + '</div>' +
          '<h2><a href="'+url+'">'+escHtml(r.title)+'</a></h2>' +
          '<p class="feat-byline">'+escHtml(r.artist)+(metaLine(r) ? ' ・ '+escHtml(metaLine(r)) : '')+'</p>' +
          (r.highlight ? '<p class="feat-quote">'+escHtml(r.highlight)+'</p>' : '') +
          '<div class="feat-foot">' + shopPill +
            '<a class="btn acc" href="'+url+'">記事を読む</a>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
}

function postCardHtml(r){
  var url = "post.html?id=" + encodeURIComponent(r.id);
  var priceBadge = (typeof r.price === "number")
    ? '<span class="pill">📍 <strong>'+escHtml(r.shop||"購入先未記入")+'</strong> ・ '+yen(r.price)+'</span>'
    : '<span class="pill">購入情報 未記入</span>';
  var excerpt = r.highlight || (r.description ? r.description.slice(0, 70) + "…" : "");

  return (
    '<article class="pc" data-theme="'+escHtml(r.theme)+'">' +
      '<a href="'+url+'">'+coverHtml(r)+'</a>' +
      '<div class="pc-body">' +
        '<h2 class="pc-title"><a href="'+url+'">'+escHtml(r.title)+'</a></h2>' +
        '<p class="pc-byline">'+escHtml(r.artist)+(metaLine(r) ? ' ・ '+escHtml(metaLine(r)) : '')+'</p>' +
        '<p class="pc-excerpt">'+escHtml(excerpt)+'</p>' +
        '<div class="pc-foot">'+priceBadge+'<a class="readmore" href="'+url+'">読む →</a></div>' +
      '</div>' +
    '</article>'
  );
}

function renderGrid(list){
  var grid = document.getElementById("grid");
  if(!list.length){
    grid.innerHTML = '<p class="empty">該当するレコードは棚にありませんでした。</p>';
    return;
  }
  grid.innerHTML = list.map(postCardHtml).join("");
}

function applyFiltersAndRender(){
  var q = document.getElementById("search").value.trim().toLowerCase();
  var genre = document.getElementById("genreFilter").value;
  var shop = document.getElementById("shopFilter").value;
  var sort = document.getElementById("sortBy").value;
  var isDefault = !q && !genre && !shop && sort === "added";

  var list = FEED.filter(function(r){
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
    return 0; /* added: FEED はすでに新着順 */
  });

  /* 通常表示では、最新の一枚は上のフィーチャー枠に出ているので一覧から除く */
  if(isDefault && list.length > 1){ list = list.slice(1); }

  renderGrid(list);
}

function boot(records){
  ALL_RECORDS = records;
  FEED = records.slice().reverse();
  document.getElementById("heroLede").textContent = SITE.description;
  renderStats(ALL_RECORDS);
  populateFilters(ALL_RECORDS);
  renderFeatured(FEED[0]);
  applyFiltersAndRender();

  document.getElementById("search").addEventListener("input", applyFiltersAndRender);
  document.getElementById("genreFilter").addEventListener("change", applyFiltersAndRender);
  document.getElementById("shopFilter").addEventListener("change", applyFiltersAndRender);
  document.getElementById("sortBy").addEventListener("change", applyFiltersAndRender);
}

renderNav("index.html");
renderFooter();
loadRecords(boot);
