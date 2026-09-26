/* Pre-fill the order from a link, e.g. from the Capsule Builder:
   ?cart=SKU:pieces,SKU:pieces&store=Store%20Name   (pieces per style, e.g. 6 or 12)
   Each style's pieces go into its Dz / 6-pk / 3-pk / Pc boxes, largest pack first, using only the boxes that style offers.
   Only fills the quantity boxes (and the business name). The buyer still reviews and submits. */
(function () {
  var p = new URLSearchParams(location.search);
  var cart = p.get("cart");
  if (!cart || typeof PRODUCTS === "undefined") return;
  var idx = {};
  PRODUCTS.forEach(function (x, i) { idx[String(x.sku).toUpperCase()] = i; });
  var packs = [["dz", 12], ["w6", 6], ["w3", 3], ["pc", 1]];
  var filled = [], missing = [];
  cart.split(",").forEach(function (t) {
    var bits = t.split(":"), sku = String(bits[0] || "").trim().toUpperCase();
    var left = Math.max(0, Math.round(parseFloat(bits[1]) || 0));
    if (!sku || !left) return;
    var i = idx[sku];
    if (i == null) { missing.push(sku); return; }
    var prod = PRODUCTS[i], row = null;
    packs.forEach(function (pk) {
      if (prod[pk[0]] == null || left < pk[1]) return;
      var n = Math.floor(left / pk[1]);
      var inp = document.querySelector('input.qty[data-i="' + i + '"][data-k="' + pk[0] + '"]');
      if (!inp) return;
      inp.value = n; left -= n * pk[1]; row = inp.closest("tr");
    });
    if (row) filled.push(row); else missing.push(sku);
  });
  // bring the filled styles to the top of the list and tint them
  var tbody = document.getElementById("tbody");
  filled.slice().reverse().forEach(function (tr) { tr.style.background = "#f3eefb"; tbody.insertBefore(tr, tbody.firstChild); });
  var store = p.get("store"), bn = document.getElementById("business_name");
  if (store && bn && !bn.value) bn.value = store;
  if (typeof recalc === "function") recalc();
  var n = filled.length;
  var note = document.createElement("div");
  note.style.cssText = "margin:12px 0;padding:10px 14px;border:1px solid #b8a9d9;background:#f3eefb;border-radius:8px;font-size:14px;line-height:1.4";
  note.textContent = "Pre-filled from your curated capsule: " + n + " style" + (n === 1 ? "" : "s") + " at the top of the list." +
    (missing.length ? " Not on this order page: " + missing.join(", ") + " (email us for these)." : "") +
    " Review the quantities, add your details and submit.";
  var table = tbody.closest("table");
  table.parentNode.insertBefore(note, table);
  // take the buyer to their styles; repeat once images above have loaded and moved the page
  function go() { note.scrollIntoView({ block: "center", behavior: "instant" }); }
  if (document.readyState === "complete") setTimeout(go, 200); else window.addEventListener("load", function () { setTimeout(go, 200); });
  setTimeout(go, 1500);
})();
