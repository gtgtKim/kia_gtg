(function () {
  "use strict";

  var config = window.KIA_MARKET || {};
  var dataLayer = (window.dataLayer = window.dataLayer || []);

  function pushEvent(payload) {
    dataLayer.push(payload);
    renderLatestEvent(payload);
  }

  function renderLatestEvent(payload) {
    var log = document.querySelector("[data-event-log]");
    if (!log) {
      return;
    }

    log.textContent = JSON.stringify(payload, null, 2);
  }

  function injectGtgIfEnabled() {
    var gtg = config.gtg || {};
    if (!gtg.enabled || !gtg.containerId || !gtg.path) {
      pushEvent({
        event: "gtg_demo_mode",
        market: config.market || "global",
        gateway_path: gtg.path || "/metrics/",
        status: "prepared_not_loaded"
      });
      return;
    }

    (function (w, d, s, l, i, p) {
      w[l] = w[l] || [];
      w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
      var f = d.getElementsByTagName(s)[0];
      var j = d.createElement(s);
      var dl = l !== "dataLayer" ? "&l=" + l : "";
      j.async = true;
      j.src = p + "?id=" + encodeURIComponent(i) + dl;
      f.parentNode.insertBefore(j, f);
    })(window, document, "script", "dataLayer", gtg.containerId, gtg.path);

    pushEvent({
      event: "gtg_gateway_script_requested",
      market: config.market || "global",
      container_id: gtg.containerId,
      gateway_path: gtg.path
    });
  }

  function initNav() {
    var toggle = document.querySelector("[data-menu-toggle]");
    if (!toggle) {
      return;
    }

    toggle.addEventListener("click", function () {
      var open = !document.body.classList.contains("nav-open");
      document.body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  function initHero() {
    var slides = config.slides || [];
    var hero = document.querySelector("[data-hero]");
    if (!hero || slides.length === 0) {
      return;
    }

    var image = hero.querySelector("[data-hero-image]");
    var eyebrow = hero.querySelector("[data-hero-eyebrow]");
    var title = hero.querySelector("[data-hero-title]");
    var copy = hero.querySelector("[data-hero-copy]");
    var primary = hero.querySelector("[data-hero-primary]");
    var secondary = hero.querySelector("[data-hero-secondary]");
    var pager = hero.querySelector("[data-hero-pager]");
    var active = 0;

    function setSlide(index, source) {
      active = index;
      var slide = slides[active];
      if (!slide) {
        return;
      }

      if (image) {
        image.src = slide.image;
        image.alt = slide.alt || slide.title || "";
      }
      if (eyebrow) {
        eyebrow.textContent = slide.eyebrow || "";
      }
      if (title) {
        title.textContent = slide.title || "";
      }
      if (copy) {
        copy.textContent = slide.copy || "";
      }
      if (primary) {
        primary.textContent = slide.primaryText || "Learn more";
        primary.href = slide.primaryHref || "#conversion";
        primary.dataset.ctaName = slide.primaryText || "Learn more";
      }
      if (secondary) {
        secondary.textContent = slide.secondaryText || "Build yours";
        secondary.href = slide.secondaryHref || "#vehicles";
        secondary.dataset.ctaName = slide.secondaryText || "Build yours";
      }

      Array.prototype.forEach.call(pager.querySelectorAll(".hero-dot"), function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === active);
      });

      pushEvent({
        event: source === "auto" ? "hero_auto_view" : "hero_view",
        market: config.market || "global",
        hero_title: slide.title,
        hero_index: active + 1
      });
    }

    if (pager) {
      pager.innerHTML = "";
      slides.forEach(function (_, index) {
        var dot = document.createElement("button");
        dot.className = "hero-dot";
        dot.type = "button";
        dot.setAttribute("aria-label", "Show hero " + (index + 1));
        dot.addEventListener("click", function () {
          setSlide(index, "click");
        });
        pager.appendChild(dot);
      });
    }

    setSlide(0, "load");

    if (slides.length > 1) {
      window.setInterval(function () {
        setSlide((active + 1) % slides.length, "auto");
      }, 8500);
    }
  }

  function initTracking() {
    document.addEventListener("click", function (event) {
      var target = event.target.closest("[data-track]");
      if (!target) {
        return;
      }

      pushEvent({
        event: target.dataset.track || "cta_click",
        market: config.market || "global",
        cta_name: target.dataset.ctaName || target.textContent.trim(),
        cta_url: target.getAttribute("href") || "",
        page_path: window.location.pathname
      });
    });
  }

  function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
  }

  function normalizePhone(value) {
    var raw = String(value || "").replace(/[^\d+]/g, "");
    if (raw.charAt(0) === "+") {
      return raw;
    }
    if (raw.length === 10) {
      return "+1" + raw;
    }
    return raw;
  }

  function toHex(buffer) {
    return Array.prototype.map
      .call(new Uint8Array(buffer), function (byte) {
        return byte.toString(16).padStart(2, "0");
      })
      .join("");
  }

  function sha256(value) {
    if (!window.crypto || !window.crypto.subtle || !window.TextEncoder) {
      return Promise.resolve("sha256_unavailable_in_this_context");
    }

    return window.crypto.subtle
      .digest("SHA-256", new TextEncoder().encode(value))
      .then(toHex);
  }

  function initConversionForm() {
    var form = document.querySelector("[data-conversion-form]");
    if (!form) {
      return;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var email = normalizeEmail(form.elements.email && form.elements.email.value);
      var phone = normalizePhone(form.elements.phone && form.elements.phone.value);
      var firstName = String(form.elements.firstName && form.elements.firstName.value || "").trim().toLowerCase();
      var lastName = String(form.elements.lastName && form.elements.lastName.value || "").trim().toLowerCase();
      var model = String(form.elements.model && form.elements.model.value || "").trim();

      Promise.all([sha256(email), sha256(phone), sha256(firstName), sha256(lastName)]).then(function (hashes) {
        var payload = {
          event: "generate_lead",
          market: config.market || "global",
          conversion_label: "ec4w_qa_lead",
          gateway_path: (config.gtg && config.gtg.path) || "/metrics/",
          method: "local_sha256_demo",
          selected_model: model,
          user_data: {
            sha256_email_address: hashes[0],
            sha256_phone_number: hashes[1],
            address: {
              sha256_first_name: hashes[2],
              sha256_last_name: hashes[3],
              country: config.country || ""
            }
          }
        };

        pushEvent(payload);

        var status = document.querySelector("[data-form-status]");
        if (status) {
          status.textContent = "Demo conversion pushed to dataLayer. No form data was stored by this static page.";
        }
      });
    });
  }

  function init() {
    injectGtgIfEnabled();
    initNav();
    initHero();
    initTracking();
    initConversionForm();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
