/* ============================================================
   レコード棚 - 表示ロジック

   ★ レコードを追加するには records.json をさわればOK。
     このファイルは基本さわらなくて大丈夫です。
   ============================================================ */
function escHtml(s){
  return String(s == null ? "" : s)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}
function yen(n){
  return "¥" + Number(n).toLocaleString("ja-JP");
}

var ALL_RECORDS = [];

function initial(str){
  var s = String(str || "?").trim();
  return s.charAt(0).toUpperCase();
}

function renderStats(list){
  var withPrice = list.filter(function(r){ return typeof r.price === "number"; });
  var total = withPrice.reduce(function(sum, r){ return sum + r.price; }, 0);
  var shops = list.map(function(r){ return r.shop; }).filter(function(s){ return s; });
  var uniqueShops = shops.filter(function(s, i){ return shops.indexOf(s) === i; });

  document.getElementById("statCount").textContent = list.length;
  document.getElementById("statSpent").textContent = withPrice.length ? yen(total) : "―";
  document.getElementById("statShops").textContent = uniqueShops.length;
}

function populateShopFilter(list){
  var sel = document.getElementById("shopFilter");
  var shops = list.map(function(r){ return r.shop; }).filter(function(s){ return s; });
  var unique = shops.filter(function(s, i){ return shops.indexOf(s) === i; }).sort();
  sel.innerHTML = '<option value="">すべての購入先</option>' +
    unique.map(function(s){ return '<option value="'+escHtml(s)+'">'+escHtml(s)+'</option>'; }).join("");
}

function cardHtml(r){
  var metaBits = [];
  if(r.year) metaBits.push(r.year + "年");
  if(r.label) metaBits.push(r.label);
  var shopLine;
  if(r.shop || typeof r.price === "number"){
    shopLine = '<div class="rs-shop">' +
      '<span class="place">📍 ' + (r.shop ? escHtml(r.shop) + (r.shopArea ? "（"+escHtml(r.shopArea)+"）" : "") : "購入先 未記入") + '</span>' +
      (typeof r.price === "number" ? '<span class="price">' + yen(r.price) + '</span>' : '<span class="price">価格 未記入</span>') +
      '</div>' +
      (r.note ? '<p class="rs-purchase-note">※ '+escHtml(r.note)+'</p>' : '');
  } else {
    shopLine = '<div class="rs-shop unknown">購入先・価格は未記入です</div>';
  }

  var tags = [];
  if(r.genre) tags.push('<span class="rs-tag genre">'+escHtml(r.genre)+'</span>');
  if(r.format) tags.push('<span class="rs-tag">'+escHtml(r.format)+'</span>');
  if(r.pressing) tags.push('<span class="rs-tag">'+escHtml(r.pressing)+'</span>');

  return (
    '<article class="rs-card" data-id="'+escHtml(r.id)+'">' +
      '<div class="rs-card-top">' +
        '<div class="rs-disc"><span>'+escHtml(initial(r.artist))+'</span></div>' +
        '<div class="rs-title-block">' +
          '<p class="rs-title">'+escHtml(r.title)+'</p>' +
          '<p class="rs-artist">'+escHtml(r.artist)+'</p>' +
          (metaBits.length ? '<p class="rs-meta">'+escHtml(metaBits.join(" ・ "))+'</p>' : '') +
        '</div>' +
      '</div>' +
      (tags.length ? '<div class="rs-tags">'+tags.join("")+'</div>' : '') +
      shopLine +
      (r.description ? '<button class="rs-desc-toggle" type="button">解説を読む ▾</button><p class="rs-desc">'+escHtml(r.description)+'</p>' : '') +
    '</article>'
  );
}

function renderGrid(list){
  var grid = document.getElementById("grid");
  if(!list.length){
    grid.innerHTML = '<p class="rs-empty">該当するレコードが見つかりませんでした。</p>';
    return;
  }
  grid.innerHTML = list.map(cardHtml).join("");
  grid.querySelectorAll(".rs-desc-toggle").forEach(function(btn){
    btn.addEventListener("click", function(){
      var card = btn.closest(".rs-card");
      var open = card.classList.toggle("open");
      btn.textContent = open ? "閉じる ▴" : "解説を読む ▾";
    });
  });
}

function applyFiltersAndRender(){
  var q = document.getElementById("search").value.trim().toLowerCase();
  var shop = document.getElementById("shopFilter").value;
  var sort = document.getElementById("sortBy").value;

  var list = ALL_RECORDS.filter(function(r){
    var matchesQ = !q || [r.title, r.artist, r.artistJa, r.label, r.genre].some(function(f){
      return f && String(f).toLowerCase().indexOf(q) !== -1;
    });
    var matchesShop = !shop || r.shop === shop;
    return matchesQ && matchesShop;
  });

  list = list.slice().sort(function(a,b){
    if(sort === "artist") return String(a.artist).localeCompare(String(b.artist), "ja");
    if(sort === "title") return String(a.title).localeCompare(String(b.title), "ja");
    if(sort === "priceHigh") return (b.price||0) - (a.price||0);
    if(sort === "priceLow") return (a.price==null?Infinity:a.price) - (b.price==null?Infinity:b.price);
    return 0; // "added": keep records.json order (newest addition last-in wins by default)
  });
  if(sort === "added") list.reverse();

  renderGrid(list);
}

function boot(records){
  ALL_RECORDS = records;
  renderStats(ALL_RECORDS);
  populateShopFilter(ALL_RECORDS);
  applyFiltersAndRender();

  document.getElementById("search").addEventListener("input", applyFiltersAndRender);
  document.getElementById("shopFilter").addEventListener("change", applyFiltersAndRender);
  document.getElementById("sortBy").addEventListener("change", applyFiltersAndRender);
}

fetch("records.json", {cache:"no-store"})
  .then(function(r){ if(!r.ok) throw 0; return r.json(); })
  .then(function(d){ boot((d && d.records) || []); })
  .catch(function(){ boot([]); });
