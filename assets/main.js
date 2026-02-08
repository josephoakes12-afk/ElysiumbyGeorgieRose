(() => {
  const ready = (fn) => {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    }
  };

  const config = window.SITE_CONFIG || {};

  const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
  const isValidUrl = (value) => isNonEmptyString(value) && /^https?:\/\//i.test(value.trim()) && !value.includes("YOUR_");
  const isPlaceholderEndpoint = (value) => !isNonEmptyString(value) || value.includes("XXXX");

  const escapeHtml = (value) =>
    String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const toPrettyMonth = (isoDate) => {
    if (!isNonEmptyString(isoDate)) return "";
    const date = new Date(`${isoDate}T00:00:00`);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("en-GB", {
      month: "long",
      year: "numeric"
    }).format(date);
  };

  const setText = (selector, value) => {
    document.querySelectorAll(selector).forEach((el) => {
      el.textContent = value;
    });
  };

  const setLink = (selector, value, fallback = "#") => {
    document.querySelectorAll(selector).forEach((el) => {
      if (isValidUrl(value)) {
        el.setAttribute("href", value);
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noreferrer noopener");
        el.removeAttribute("aria-disabled");
        el.classList.remove("hidden");
      } else if (fallback) {
        el.setAttribute("href", fallback);
        el.removeAttribute("target");
        el.removeAttribute("rel");
      } else {
        el.classList.add("hidden");
        el.setAttribute("aria-disabled", "true");
      }
    });
  };

  const setOptionalText = (selector, value, fallback) => {
    document.querySelectorAll(selector).forEach((el) => {
      el.textContent = isNonEmptyString(value) ? value : fallback;
    });
  };

  const setOptionalLinkGroup = (wrapperSelector, linkSelector, value, protocol) => {
    const wrappers = document.querySelectorAll(wrapperSelector);
    wrappers.forEach((wrapper) => {
      const link = wrapper.querySelector(linkSelector);
      if (!link) return;
      if (isNonEmptyString(value)) {
        const cleanValue = value.trim();
        link.textContent = cleanValue;
        link.setAttribute("href", `${protocol}${cleanValue}`);
        wrapper.classList.remove("hidden");
      } else {
        wrapper.classList.add("hidden");
      }
    });
  };

  const applyConfig = () => {
    const brandName = isNonEmptyString(config.brandName)
      ? config.brandName.trim()
      : "Elysium By Georgie Rose";

    setText("[data-brand-name]", brandName);

    const bookingUrl = isValidUrl(config.bookingUrl) ? config.bookingUrl.trim() : "";
    document.querySelectorAll("[data-book-link]").forEach((link) => {
      if (isValidUrl(bookingUrl)) {
        link.setAttribute("href", bookingUrl);
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noreferrer noopener");
      } else {
        link.removeAttribute("target");
        link.removeAttribute("rel");
      }
    });

    const social = config.social || {};
    setLink('[data-social-link="instagram"]', social.instagramUrl, "#");
    setLink('[data-social-link="facebook"]', social.facebookUrl, "#");
    setLink('[data-social-link="tiktok"]', social.tiktokUrl, "");

    document.querySelectorAll("[data-social-link]").forEach((link) => {
      const socialKey = link.getAttribute("data-social-link");
      const url = social[socialKey + "Url"];
      if (isValidUrl(url)) {
        link.classList.remove("hidden");
      } else if (socialKey === "tiktok") {
        link.classList.add("hidden");
      }
    });

    setOptionalLinkGroup("[data-contact-email-wrap]", "[data-contact-email-link]", config.contactEmail, "mailto:");
    setOptionalLinkGroup("[data-contact-phone-wrap]", "[data-contact-phone-link]", config.contactPhone, "tel:");

    setOptionalText("[data-location-text]", config.locationText, "Serving clients across the local area.");

    const reviewsLink = isValidUrl(config.googleReviewsUrl)
      ? config.googleReviewsUrl
      : "https://share.google/EBIZEN8UOwQqzRysz";

    document.querySelectorAll("[data-google-reviews-link]").forEach((link) => {
      link.setAttribute("href", reviewsLink);
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noreferrer noopener");
    });

    const socialPrompt = document.querySelector("[data-social-config-prompt]");
    if (socialPrompt) {
      if (!isValidUrl(social.instagramUrl)) {
        socialPrompt.classList.remove("hidden");
        socialPrompt.textContent = "Add your Instagram link in assets/site-config.js to enable embeds.";
      } else {
        socialPrompt.classList.add("hidden");
      }
    }
  };

  const initYear = () => {
    document.querySelectorAll("[data-year]").forEach((node) => {
      node.textContent = String(new Date().getFullYear());
    });
  };

  const initActiveNav = () => {
    const menu = document.querySelector("[data-nav-menu]");
    if (!menu) return;

    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    const fallbackMap = {
      "services.html": "jewellery.html",
      "weddings.html": "jewellery.html",
      "popups.html": "jewellery.html",
      "faq.html": "index.html",
      "privacy.html": "contact.html",
      "cookies.html": "contact.html",
      "accessibility.html": "contact.html"
    };

    const targetPage = fallbackMap[currentPath] || currentPath;
    const links = Array.from(menu.querySelectorAll("a[href]"));

    let matched = false;

    links.forEach((link) => {
      const href = link.getAttribute("href") || "";
      const page = href.split("#")[0].split("?")[0].split("/").pop();

      if (page === targetPage) {
        link.setAttribute("aria-current", "page");
        matched = true;
      } else if (link.getAttribute("aria-current") === "page") {
        link.removeAttribute("aria-current");
      }
    });

    if (!matched) {
      const existingCurrent = links.find((link) => link.getAttribute("aria-current") === "page");
      if (!existingCurrent && links.length) {
        links[0].setAttribute("aria-current", "page");
      }
    }
  };

  const initMobileNav = () => {
    const toggle = document.querySelector("[data-nav-toggle]");
    const menu = document.querySelector("[data-nav-menu]");
    const backdrop = document.querySelector("[data-nav-backdrop]");

    if (!toggle || !menu || !backdrop) return;

    let isOpen = false;
    let lastFocused = null;

    const getFocusable = () =>
      Array.from(
        menu.querySelectorAll(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );

    const openMenu = () => {
      isOpen = true;
      lastFocused = document.activeElement;
      menu.classList.add("is-open");
      backdrop.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      document.body.classList.add("menu-open");
      const focusable = getFocusable();
      if (focusable.length) {
        focusable[0].focus();
      }
    };

    const closeMenu = () => {
      isOpen = false;
      menu.classList.remove("is-open");
      backdrop.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
      if (lastFocused && typeof lastFocused.focus === "function") {
        lastFocused.focus();
      }
    };

    toggle.addEventListener("click", () => {
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    backdrop.addEventListener("click", closeMenu);

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (!isOpen) return;
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = getFocusable();
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  };

  const initAccordionGroup = (selector) => {
    document.querySelectorAll(selector).forEach((group) => {
      const details = Array.from(group.children).filter((node) => node.tagName === "DETAILS");
      details.forEach((item) => {
        item.addEventListener("toggle", () => {
          if (!item.open) return;
          details.forEach((other) => {
            if (other !== item) other.open = false;
          });
        });
      });
    });
  };

  const initLightbox = () => {
    const triggers = Array.from(document.querySelectorAll("[data-lightbox]"));
    if (!triggers.length) return;

    const items = triggers
      .map((trigger) => {
        const imageNode = trigger.querySelector("img");
        const src =
          trigger.getAttribute("data-lightbox") ||
          trigger.getAttribute("href") ||
          (imageNode ? imageNode.getAttribute("src") : "");

        if (!isNonEmptyString(src)) return null;

        const alt =
          trigger.getAttribute("data-alt") ||
          (imageNode ? imageNode.getAttribute("alt") : "") ||
          "Expanded gallery image";

        return { trigger, src, alt };
      })
      .filter(Boolean);

    if (!items.length) return;

    const lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "Image preview");

    lightbox.innerHTML = `
      <div class="lightbox-frame">
        <button type="button" class="lightbox-close" aria-label="Close image">x</button>
        <button type="button" class="lightbox-nav prev" aria-label="Previous image"><</button>
        <img class="lightbox-image" src="" alt="">
        <button type="button" class="lightbox-nav next" aria-label="Next image">></button>
      </div>
    `;

    document.body.appendChild(lightbox);

    const img = lightbox.querySelector(".lightbox-image");
    const closeBtn = lightbox.querySelector(".lightbox-close");
    const prevBtn = lightbox.querySelector(".lightbox-nav.prev");
    const nextBtn = lightbox.querySelector(".lightbox-nav.next");

    let activeIndex = 0;
    let isOpen = false;
    let lastFocused = null;

    const updateImage = () => {
      const item = items[activeIndex];
      if (!item) return;
      img.setAttribute("src", item.src);
      img.setAttribute("alt", item.alt);
    };

    const open = (index) => {
      activeIndex = index;
      lastFocused = document.activeElement;
      updateImage();
      lightbox.classList.add("is-open");
      isOpen = true;
      document.body.classList.add("menu-open");
      closeBtn.focus();
    };

    const close = () => {
      lightbox.classList.remove("is-open");
      isOpen = false;
      document.body.classList.remove("menu-open");
      if (lastFocused && typeof lastFocused.focus === "function") {
        lastFocused.focus();
      }
    };

    const move = (direction) => {
      activeIndex = (activeIndex + direction + items.length) % items.length;
      updateImage();
    };

    items.forEach((item, index) => {
      const triggerElement = item.trigger;
      const isAnchor = triggerElement.tagName === "A";

      triggerElement.addEventListener("click", (event) => {
        if (isAnchor) event.preventDefault();
        open(index);
      });
    });

    closeBtn.addEventListener("click", close);
    prevBtn.addEventListener("click", () => move(-1));
    nextBtn.addEventListener("click", () => move(1));

    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) {
        close();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (!isOpen) return;
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        move(1);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        move(-1);
      }
    });

    if (items.length <= 1) {
      prevBtn.classList.add("hidden");
      nextBtn.classList.add("hidden");
    }
  };

  const initGalleryFilter = () => {
    const wrappers = document.querySelectorAll("[data-gallery-filter]");
    wrappers.forEach((wrapper) => {
      const buttons = Array.from(wrapper.querySelectorAll("[data-filter-btn]"));
      const gridSelector = wrapper.getAttribute("data-gallery-target");
      const grid = document.querySelector(gridSelector);
      if (!buttons.length || !grid) return;

      const tiles = Array.from(grid.querySelectorAll("[data-gallery-item]"));
      const countNode = document.querySelector("[data-gallery-count]");

      const setFilter = (filterValue) => {
        let visibleCount = 0;

        buttons.forEach((button) => {
          button.setAttribute(
            "aria-selected",
            String(button.getAttribute("data-filter-btn") === filterValue)
          );
        });

        tiles.forEach((tile) => {
          const category = tile.getAttribute("data-category") || "";
          const matches = filterValue === "all" || category === filterValue;
          tile.hidden = !matches;
          if (matches) visibleCount += 1;
        });

        if (countNode) {
          countNode.textContent = `${visibleCount} pieces shown`;
        }
      };

      buttons.forEach((button) => {
        button.addEventListener("click", () => {
          setFilter(button.getAttribute("data-filter-btn") || "all");
        });
      });

      const initial = buttons.find((btn) => btn.getAttribute("aria-selected") === "true");
      setFilter(initial ? initial.getAttribute("data-filter-btn") : "all");
    });
  };

  const normaliseService = (value) => String(value || "").trim().toLowerCase();

  const sortByMostRecent = (reviews) =>
    [...reviews].sort((a, b) => new Date(`${b.date}T00:00:00`) - new Date(`${a.date}T00:00:00`));

  const getPreferred = (reviews, acceptedServices) => {
    const accepted = acceptedServices.map((item) => normaliseService(item));
    return reviews.filter((review) => accepted.includes(normaliseService(review.service)));
  };

  const pickForHome = (reviews, limit) => {
    const nails = getPreferred(reviews, ["Nails", "Both"]);
    const jewellery = getPreferred(reviews, ["Permanent Jewellery", "Both"]);

    const selected = [];
    const seen = new Set();

    const pushUnique = (review) => {
      const key = `${review.name}-${review.date}-${review.text}`;
      if (seen.has(key)) return;
      seen.add(key);
      selected.push(review);
    };

    const halfTarget = Math.max(2, Math.floor(limit / 2));

    nails.slice(0, halfTarget).forEach(pushUnique);
    jewellery.slice(0, halfTarget).forEach(pushUnique);
    reviews.forEach(pushUnique);

    return selected.slice(0, limit);
  };

  const selectReviews = (reviews, viewKey, limit) => {
    if (viewKey === "nails") {
      const preferred = getPreferred(reviews, ["Nails", "Both"]);
      return [...preferred, ...reviews.filter((item) => !preferred.includes(item))].slice(0, limit);
    }

    if (viewKey === "jewellery") {
      const preferred = getPreferred(reviews, ["Permanent Jewellery", "Both"]);
      return [...preferred, ...reviews.filter((item) => !preferred.includes(item))].slice(0, limit);
    }

    return pickForHome(reviews, limit);
  };

  const renderReviewCard = (review, cardIndex) => {
    const maxLength = 320;
    const fullText = String(review.text || "").trim();
    const shortened = fullText.length > maxLength;
    const previewText = shortened ? `${fullText.slice(0, maxLength).trim()}...` : fullText;
    const dateText = toPrettyMonth(review.date) || "Recent";
    const rating = Math.max(1, Math.min(5, Number(review.rating) || 5));
    const stars = "&#9733;".repeat(rating) + "&#9734;".repeat(5 - rating);

    return `
      <article class="testimonial-card">
        <div class="stars" aria-label="${rating} out of 5 stars">${stars}</div>
        <p class="review-text" id="review-text-${cardIndex}" data-full="${escapeHtml(fullText)}" data-preview="${escapeHtml(previewText)}">${escapeHtml(previewText || "Review text coming soon.")}</p>
        ${
          shortened
            ? `<button class="expand-btn" type="button" data-review-toggle data-target="review-text-${cardIndex}" aria-expanded="false">Read more</button>`
            : ""
        }
        <div class="review-meta">
          <span><strong>${escapeHtml(review.name || "Client")}</strong> &middot; ${escapeHtml(dateText)}</span>
          <span class="review-source">Google review</span>
        </div>
      </article>
    `;
  };

  const initReviewExpandButtons = () => {
    document.querySelectorAll("[data-review-toggle]").forEach((button) => {
      button.addEventListener("click", () => {
        const targetId = button.getAttribute("data-target");
        if (!targetId) return;
        const paragraph = document.getElementById(targetId);
        if (!paragraph) return;

        const expanded = button.getAttribute("aria-expanded") === "true";

        if (expanded) {
          paragraph.textContent = paragraph.getAttribute("data-preview") || "";
          button.setAttribute("aria-expanded", "false");
          button.textContent = "Read more";
        } else {
          paragraph.textContent = paragraph.getAttribute("data-full") || "";
          button.setAttribute("aria-expanded", "true");
          button.textContent = "Read less";
        }
      });
    });
  };

  const renderTestimonialsFallback = (mount, customMessage) => {
    const list = mount.querySelector("[data-testimonial-list]");
    if (!list) return;
    list.innerHTML = `
      <article class="testimonial-card">
        <p class="review-text">${escapeHtml(customMessage)}</p>
        <p class="muted">Follow along on Instagram for recent work and updates.</p>
      </article>
    `;
  };

  const initTestimonials = async () => {
    const mounts = Array.from(document.querySelectorAll("[data-testimonials]"));
    if (!mounts.length) return;

    let reviews;

    try {
      const response = await fetch("assets/testimonials.json", { cache: "no-store" });
      if (!response.ok) throw new Error("Failed to fetch testimonials");
      const payload = await response.json();
      if (!Array.isArray(payload)) throw new Error("Invalid testimonials payload");
      reviews = sortByMostRecent(
        payload.filter((item) => item && typeof item === "object" && isNonEmptyString(item.text))
      );
    } catch (error) {
      mounts.forEach((mount) => {
        renderTestimonialsFallback(
          mount,
          "Reviews are coming soon - follow along on Instagram for recent work and updates."
        );
      });
      return;
    }

    mounts.forEach((mount, mountIndex) => {
      const list = mount.querySelector("[data-testimonial-list]");
      if (!list) return;

      const viewKey = mount.getAttribute("data-testimonials") || "home";
      const limit = Number(mount.getAttribute("data-limit")) || 6;
      const selected = selectReviews(reviews, viewKey, limit);

      if (!selected.length) {
        renderTestimonialsFallback(
          mount,
          "Reviews are coming soon - follow along on Instagram for recent work and updates."
        );
        return;
      }

      list.innerHTML = selected
        .map((review, index) => renderReviewCard(review, mountIndex * 100 + index))
        .join("");
    });

    initReviewExpandButtons();
  };

  let instagramScriptPromise;

  const loadInstagramScript = () => {
    if (window.instgrm && window.instgrm.Embeds) {
      return Promise.resolve();
    }

    if (instagramScriptPromise) {
      return instagramScriptPromise;
    }

    instagramScriptPromise = new Promise((resolve, reject) => {
      const existing = document.getElementById("instagram-embed-script");
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("Instagram script failed")), {
          once: true
        });
        return;
      }

      const script = document.createElement("script");
      script.id = "instagram-embed-script";
      script.src = "https://www.instagram.com/embed.js";
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Instagram script failed"));
      document.body.appendChild(script);
    });

    return instagramScriptPromise;
  };

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const initSocialEmbeds = () => {
    const sections = Array.from(document.querySelectorAll("[data-social-embed]"));
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          loadSocialEmbedSection(entry.target);
        });
      },
      {
        rootMargin: "220px 0px"
      }
    );

    sections.forEach((section) => observer.observe(section));
  };

  const loadSocialEmbedSection = async (section) => {
    const embedContent = section.querySelector("[data-embed-content]");
    const fallback = section.querySelector("[data-embed-fallback]");
    const status = section.querySelector("[data-embed-status]");

    if (!embedContent || !fallback || !status) return;

    const social = config.social || {};
    const instagramUrl = social.instagramUrl;
    const posts = Array.isArray(social.instagramEmbedPosts)
      ? social.instagramEmbedPosts.filter((item) => isValidUrl(item)).slice(0, 3)
      : [];

    if (!isValidUrl(instagramUrl)) {
      fallback.classList.remove("hidden");
      status.textContent = "Add your Instagram link in site-config.js to enable embeds.";
      return;
    }

    if (!posts.length) {
      fallback.classList.remove("hidden");
      status.textContent = "Add Instagram post URLs in site-config.js to show live embeds.";
      return;
    }

    embedContent.innerHTML = posts
      .map(
        (url) => `
          <blockquote class="instagram-media" data-instgrm-permalink="${escapeHtml(
            `${url}?utm_source=ig_embed&utm_campaign=loading`
          )}" data-instgrm-version="14" style="margin:0 auto 1rem; max-width:540px; width:100%;"></blockquote>
        `
      )
      .join("");

    try {
      await loadInstagramScript();
      if (window.instgrm && window.instgrm.Embeds && typeof window.instgrm.Embeds.process === "function") {
        window.instgrm.Embeds.process();
      }

      await wait(2800);
      const hasIframe = embedContent.querySelector("iframe") !== null;

      if (hasIframe) {
        fallback.classList.add("hidden");
        status.textContent = "Latest posts from Instagram.";
      } else {
        fallback.classList.remove("hidden");
        status.textContent = "Instagram embed is blocked in this browser, showing fallback gallery instead.";
      }
    } catch (error) {
      fallback.classList.remove("hidden");
      status.textContent = "Instagram embed is unavailable right now, showing fallback gallery instead.";
    }
  };

  const initEnquiryForms = () => {
    document.querySelectorAll('form[data-form-type="enquiry"]').forEach((form) => {
      const card = form.closest(".form-card");
      const errorNode = form.querySelector("[data-form-error]");

      if (!card) return;

      const configuredAction = isNonEmptyString(config.formspreeEndpoint)
        ? config.formspreeEndpoint.trim()
        : "";

      if (!isPlaceholderEndpoint(configuredAction)) {
        form.setAttribute("action", configuredAction);
      }

      form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (errorNode) {
          errorNode.textContent = "";
        }

        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }

        const action = form.getAttribute("action") || "";
        const usePlaceholderMode = isPlaceholderEndpoint(action) || !/^https?:\/\//i.test(action);

        const showSuccess = () => {
          card.classList.add("form-state--success");
          const heading = card.querySelector(".form-success-layer h3");
          if (heading) {
            heading.setAttribute("tabindex", "-1");
            heading.focus();
          }
        };

        if (usePlaceholderMode) {
          window.setTimeout(showSuccess, 350);
          return;
        }

        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
          submitButton.setAttribute("disabled", "true");
        }

        try {
          const response = await fetch(action, {
            method: "POST",
            body: new FormData(form),
            headers: {
              Accept: "application/json"
            }
          });

          if (response.ok) {
            showSuccess();
            return;
          }

          throw new Error("Submission failed");
        } catch (error) {
          if (errorNode) {
            errorNode.textContent =
              "We could not send your enquiry right now. Please message on Instagram or email instead.";
          }
        } finally {
          if (submitButton) {
            submitButton.removeAttribute("disabled");
          }
        }
      });
    });
  };

  ready(() => {
    applyConfig();
    initYear();
    initActiveNav();
    initMobileNav();
    initAccordionGroup("[data-accordion]");
    initAccordionGroup("[data-accordion-inner]");
    initLightbox();
    initGalleryFilter();
    initSocialEmbeds();
    initEnquiryForms();
    initTestimonials();
  });
})();
