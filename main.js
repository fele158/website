// Dr. Ιωάννης Φελεσάκης — shared UI behaviour
(function () {
  // Current year
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // Mobile navigation
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    var setNav = function (open) {
      document.body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Κλείσιμο μενού" : "Άνοιγμα μενού");
      if (open) links.scrollTop = 0;
    };
    var isOpen = function () { return document.body.classList.contains("nav-open"); };

    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      setNav(!isOpen());
    });

    // Κλείσιμο μόλις επιλεγεί σύνδεσμος
    links.addEventListener("click", function (e) {
      if (e.target.closest("a")) setNav(false);
    });

    // Κλείσιμο με κλικ/άγγιγμα εκτός του πάνελ
    document.addEventListener("click", function (e) {
      if (isOpen() && !e.target.closest(".nav-links")) setNav(false);
    });

    // Κλείσιμο με Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isOpen()) {
        setNav(false);
        toggle.focus();
      }
    });

    // Αν η οθόνη μεγαλώσει σε desktop, μην αφήσεις κλειδωμένο το body
    var mq = window.matchMedia("(min-width: 901px)");
    var onWide = function (e) { if (e.matches && isOpen()) setNav(false); };
    if (mq.addEventListener) mq.addEventListener("change", onWide);
    else if (mq.addListener) mq.addListener(onWide);
  }

  // Sticky header shadow
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("scrolled", window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Επανάληψη φόρτωσης φωτογραφίας αν αποτύχει (π.χ. ασταθές δίκτυο κινητού)
  Array.prototype.forEach.call(document.querySelectorAll(".shot img"), function (img) {
    var src = img.getAttribute("src");
    var tries = 0;
    var retry = function () {
      if (tries >= 3) return;
      tries += 1;
      window.setTimeout(function () {
        img.src = src + "?r=" + tries;
      }, tries * 1200);
    };
    img.addEventListener("error", retry);
    // Αν απέτυχε πριν τρέξει το script
    if (img.complete && img.naturalWidth === 0) retry();
  });

  // Lightbox για τις φωτογραφίες του ιατρείου
  var shots = Array.prototype.slice.call(document.querySelectorAll(".shot"));
  if (shots.length) {
    var box = document.createElement("div");
    box.className = "lb";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "Φωτογραφίες ιατρείου");
    box.innerHTML =
      '<button class="lb-btn lb-close" type="button" aria-label="Κλείσιμο">&times;</button>' +
      '<button class="lb-btn lb-prev" type="button" aria-label="Προηγούμενη">&#8249;</button>' +
      '<img alt="" />' +
      '<button class="lb-btn lb-next" type="button" aria-label="Επόμενη">&#8250;</button>' +
      '<p class="lb-cap"></p>';
    document.body.appendChild(box);

    var pic = box.querySelector("img");
    var cap = box.querySelector(".lb-cap");
    var at = 0;
    var last = null;

    var show = function (i) {
      at = (i + shots.length) % shots.length;
      var a = shots[at];
      pic.src = a.getAttribute("href");
      pic.alt = a.querySelector("img") ? a.querySelector("img").alt : "";
      cap.textContent = a.getAttribute("data-caption") || pic.alt;
    };
    var open = function (i) {
      last = document.activeElement;
      show(i);
      box.classList.add("open");
      document.body.classList.add("lb-open");
      requestAnimationFrame(function () { box.classList.add("shown"); });
      box.querySelector(".lb-close").focus();
    };
    var close = function () {
      box.classList.remove("shown");
      document.body.classList.remove("lb-open");
      window.setTimeout(function () { box.classList.remove("open"); pic.removeAttribute("src"); }, 300);
      if (last) last.focus();
    };

    shots.forEach(function (a, i) {
      a.addEventListener("click", function (e) { e.preventDefault(); open(i); });
    });
    box.querySelector(".lb-close").addEventListener("click", close);
    box.querySelector(".lb-prev").addEventListener("click", function () { show(at - 1); });
    box.querySelector(".lb-next").addEventListener("click", function () { show(at + 1); });
    box.addEventListener("click", function (e) { if (e.target === box) close(); });
    document.addEventListener("keydown", function (e) {
      if (!box.classList.contains("open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") show(at - 1);
      else if (e.key === "ArrowRight") show(at + 1);
    });
  }

  // Reveal on scroll
  var revealEls = document.querySelectorAll(".reveal");
  // Dev aid / safety: reveal everything at once
  if (location.hash === "#showall") {
    document.body.classList.add("showall");
    revealEls.forEach(function (el) { el.classList.add("in"); });
    return;
  }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el, i) {
      el.style.setProperty("--d", (i % 6) * 55 + "ms");
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("in");
    });
  }
})();
