// script.js
(() => {
  const getDataPath = () => {
    const p = window.location.pathname;
    if (p.includes("/assets/html/")) return "../data/listings.json";
    return "assets/data/listings.json";
  };

  const dataPath = getDataPath();

  const attachMobileMenu = (hamburgerId, menuId) => {
    const btn = document.getElementById(hamburgerId);
    const menu = document.getElementById(menuId);
    if (!btn || !menu) return;
    btn.addEventListener("click", () => {
      const open = menu.getAttribute("aria-hidden") === "false";
      menu.setAttribute("aria-hidden", String(!open));
      menu.style.display = open ? "none" : "block";
    });
    document.addEventListener("click", (e) => {
      if (!menu.contains(e.target) && e.target !== btn) {
        menu.setAttribute("aria-hidden", "true");
        menu.style.display = "none";
      }
    });
  };

  attachMobileMenu("hamburger", "mobileMenu");
  attachMobileMenu("hamburger2", "mobileMenu2");
  attachMobileMenu("hamburger3", "mobileMenu3");
  attachMobileMenu("hamburger4", "mobileMenu4");

  async function fetchListings() {
    try {
      const res = await fetch(dataPath, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return Array.isArray(json) ? json : [];
    } catch (err) {
      console.error("Listeleri yüklerken hata:", err);
      return [];
    }
  }

  function esc(s) {
    return String(s || "").replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  async function initListings() {
    const listings = await fetchListings();

    // === SLIDER ===
    const sliderEl = document.getElementById("listing-slider");
    if (sliderEl) {
      sliderEl.innerHTML = "";
      if (!listings.length) {
        sliderEl.innerHTML = `<div class="slide active" style="display:flex;align-items:center;justify-content:center;height:200px">İlan bulunamadı.</div>`;
      } else {
        listings.forEach((it, i) => {
          const slide = document.createElement("div");
          slide.className = "slide" + (i === 0 ? " active" : "");
          slide.innerHTML = `
            <a href="${esc(it.link)}" target="_blank" rel="noopener" class="slide-link">
              <img src="${esc(it.image)}" alt="${esc(it.title)}">
              <div class="slide-meta"><h3>${esc(it.title)}</h3></div>
              <div class="price-badge">${esc(it.price)}</div>
            </a>
          `;
          sliderEl.appendChild(slide);
        });

        // dots
        const dots = document.createElement("div");
        dots.className = "slider-dots";
        listings.forEach((_, idx) => {
          const d = document.createElement("div");
          d.className = "dot" + (idx === 0 ? " active" : "");
          d.addEventListener("click", () => goTo(idx));
          dots.appendChild(d);
        });
        sliderEl.appendChild(dots);

        const slides = sliderEl.querySelectorAll(".slide");
        const dotEls = sliderEl.querySelectorAll(".dot");
        let current = 0;
        let timer = setInterval(next, 4500);

        function next() { goTo((current + 1) % slides.length); }
        function goTo(i) {
          slides[current].classList.remove("active");
          dotEls[current].classList.remove("active");
          current = i;
          slides[current].classList.add("active");
          dotEls[current].classList.add("active");
          clearInterval(timer);
          timer = setInterval(next, 4500);
        }
      }
    }

    // === FEATURED/PORTFOLIO ===
    const featured = document.getElementById("featured-grid") || document.getElementById("portfolio-grid");
    if (featured) {
      featured.innerHTML = "";
      if (!listings.length) {
        featured.innerHTML = `<div class="muted">Henüz ilan yok.</div>`;
        return;
      }
      listings.forEach(it => {
        const card = document.createElement("article");
        card.className = "prop-card fade-in";
        card.innerHTML = `
          <a href="${esc(it.link)}" target="_blank" rel="noopener" class="prop-link" style="display:block;height:100%;color:inherit;text-decoration:none">
            <div class="prop-media"><img src="${esc(it.image)}" alt="${esc(it.title)}"></div>
            <div class="prop-content">
              <h3 class="prop-title">${esc(it.title)}</h3>
              <div class="prop-meta">${esc(it.location || "")}</div>
              <div class="prop-footer">
                <div class="prop-actions"><a class="link-muted" href="${esc(it.link)}" target="_blank">Detay</a></div>
                <div class="prop-price">${esc(it.price)}</div>
              </div>
            </div>
          </a>
        `;
        featured.appendChild(card);
      });
    }
  }

  // === CONTACT FORM ===
  function attachContactForm() {
    const form = document.getElementById("contactForm");
    if (!form) return;
    const status = document.getElementById("contactStatus");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("c-name").value.trim();
      const email = document.getElementById("c-email").value.trim();
      const msg = document.getElementById("c-msg").value.trim();
      if (!name || !email || !msg) {
        status.textContent = "Lütfen zorunlu alanları doldurun.";
        status.style.color = "#b45309";
        return;
      }
      status.textContent = "Mesaj gönderiliyor...";
      status.style.color = "#6b7280";
      setTimeout(() => {
        status.textContent = "Mesajınız alındı. En kısa sürede dönüş yapacağız ✅";
        status.style.color = "#0a7a2b";
        form.reset();
      }, 900);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initListings();
    attachContactForm();
  });

})();

// Telefon numarası göster/gönder
function showNumber(btn, number) {
  if (!btn.dataset.shown) {
    btn.textContent = number;
    btn.dataset.shown = "true";
  } else {
    window.location.href = "tel:" + number.replace(/\s|\(|\)/g, "");
  }
}