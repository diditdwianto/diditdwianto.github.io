// Guest search for the AI Leaders Dinner: type a name, pick it, see that guest's drink-order QR.
// The QR is drawn here with the same library and settings as the Drinks Orders app (level M, 4-module quiet zone).
(function () {
  "use strict";
  var PAGE = "https://diditdwianto.github.io/dinner/";
  var MAX = 8;
  var $ = function (id) { return document.getElementById(id); };
  var q = $("q"), results = $("results"), note = $("note");
  var guests = [];

  // Lower case, no accents or punctuation: "M. Ismoyono" finds "ismoyono".
  function fold(s) {
    return String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9@]+/g, " ").trim();
  }
  function linkOf(g) { return PAGE + "?g=" + encodeURIComponent(g.g) + "&n=" + encodeURIComponent(g.n); }

  function match(text) {
    var words = fold(text).split(" ").filter(Boolean);
    if (!words.length || fold(text).replace(/ /g, "").length < 2) return [];
    return guests
      .map(function (g) {
        var nameWords = g.nameKey.split(" ");
        var score = 0;
        for (var i = 0; i < words.length; i++) {
          var w = words[i];
          if (nameWords.some(function (n) { return n.indexOf(w) === 0; })) score += 3;
          else if (g.nameKey.indexOf(w) >= 0) score += 2;
          else if (g.companyKey.indexOf(w) >= 0) score += 1;
          else return null;
        }
        return { g: g, score: score };
      })
      .filter(Boolean)
      .sort(function (a, b) { return b.score - a.score || a.g.n.localeCompare(b.g.n); })
      .slice(0, MAX)
      .map(function (x) { return x.g; });
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function render() {
    var text = q.value;
    results.textContent = "";
    if (fold(text).replace(/ /g, "").length < 2) { note.textContent = ""; return; }
    var found = match(text);
    if (!found.length) {
      note.textContent = "Nama tidak ditemukan. Coba nama depan atau belakang saja. · Name not found. Try just your first or last name.";
      return;
    }
    note.textContent = found.length === 1 ? "" : "Pilih nama Anda · Choose your name";
    found.forEach(function (g) {
      var li = el("li");
      var b = el("button");
      b.type = "button";
      b.appendChild(el("span", "r-name", g.n));
      b.appendChild(el("span", "r-meta", [g.t, g.c].filter(Boolean).join(" · ")));
      b.addEventListener("click", function () { show(g, true); });
      li.appendChild(b);
      results.appendChild(li);
    });
  }

  function qrSvg(link) {
    var qr = qrcode(0, "M");
    qr.addData(link);
    qr.make();
    var n = qr.getModuleCount(), size = n + 8, d = "";
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (qr.isDark(r, c)) d += "M" + (c + 4) + " " + (r + 4) + "h1v1h-1z";
    return '<svg viewBox="0 0 ' + size + " " + size + '" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg"><rect width="' + size + '" height="' + size + '" fill="#fff"/><path d="' + d + '" fill="#000"/></svg>';
  }

  function show(g, push) {
    var link = linkOf(g);
    $("g-name").textContent = g.n;
    $("g-meta").textContent = [g.t, g.c].filter(Boolean).join(" · ");
    $("qr").innerHTML = qrSvg(link);
    $("qr").setAttribute("aria-label", "QR · " + g.n);
    $("open").href = link;
    $("search-view").hidden = true;
    $("qr-view").hidden = false;
    window.scrollTo(0, 0);
    if (push) history.pushState({ g: g.g }, "", "#" + encodeURIComponent(g.g));
  }

  function back(push) {
    $("qr-view").hidden = true;
    $("search-view").hidden = false;
    if (push) history.pushState({}, "", location.pathname);
    q.focus();
  }

  function fromHash() {
    var code = decodeURIComponent(location.hash.slice(1));
    var g = code && guests.find(function (x) { return x.g === code; });
    if (g) show(g, false);
    else back(false);
  }

  $("back").addEventListener("click", function () { back(true); });
  window.addEventListener("popstate", fromHash);
  q.addEventListener("input", render);
  q.addEventListener("keydown", function (e) {
    if (e.key !== "Enter") return;
    var found = match(q.value);
    if (found.length === 1) show(found[0], true);
  });

  fetch("guests.json?v=2", { cache: "no-cache" })
    .then(function (r) { return r.json(); })
    .then(function (list) {
      guests = list.map(function (g) { return { n: g.n, c: g.c || "", t: g.t || "", g: g.g, nameKey: fold(g.n), companyKey: fold(g.c) }; });
      if (location.hash) fromHash();
      render();
    })
    .catch(function () { note.textContent = "Daftar tamu belum bisa dimuat. Coba lagi. · Could not load the guest list. Please try again."; });
})();
