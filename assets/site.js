(() => {
  const ready = (fn) => {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  };

  ready(() => {
    const navToggle = document.querySelector("#navToggle");
    const navMenu = document.querySelector("#navMenu");

    if (navToggle && navMenu) {
      navToggle.addEventListener("click", () => {
        const isOpen = navMenu.classList.toggle("open");
        navToggle.setAttribute("aria-expanded", String(isOpen));
      });

      document.addEventListener("click", (event) => {
        if (!navMenu.classList.contains("open")) return;
        const target = event.target;
        if (navMenu.contains(target) || navToggle.contains(target)) return;
        navMenu.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });

      navMenu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
          navMenu.classList.remove("open");
          navToggle.setAttribute("aria-expanded", "false");
        });
      });
    }

    document.querySelectorAll("[data-accordion]").forEach((group) => {
      const details = group.querySelectorAll("details");
      details.forEach((item) => {
        item.addEventListener("toggle", () => {
          if (!item.open) return;
          details.forEach((other) => {
            if (other !== item) other.open = false;
          });
        });
      });
    });

    document.querySelectorAll("form[data-ajax='true']").forEach((form) => {
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const formCard = form.closest(".form-card");
        const action = form.getAttribute("action") || "";
        const isPlaceholder = action.includes("XXXX");

        if (!action || isPlaceholder) {
          if (formCard) {
            formCard.classList.add("is-success");
          }
          return;
        }

        try {
          const formData = new FormData(form);
          const response = await fetch(action, {
            method: "POST",
            body: formData,
            headers: {
              Accept: "application/json",
            },
          });

          if (response.ok) {
            if (formCard) {
              formCard.classList.add("is-success");
            }
          } else {
            form.submit();
          }
        } catch (error) {
          form.submit();
        }
      });
    });

    const banner = document.querySelector(".cookie-banner");
    const hasNonEssential = document.querySelector("[data-nonessential='true']");
    if (banner && hasNonEssential) {
      const stored = localStorage.getItem("elysiumCookiePref");
      if (!stored) {
        banner.style.display = "flex";
      }
      const acceptBtn = banner.querySelector("button");
      if (acceptBtn) {
        acceptBtn.addEventListener("click", () => {
          localStorage.setItem("elysiumCookiePref", "accepted");
          banner.style.display = "none";
        });
      }
    }

    document.querySelectorAll("[data-year]").forEach((el) => {
      el.textContent = new Date().getFullYear();
    });
  });
})();
