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

  const normalisePhoneForTel = (value) => {
    if (!isNonEmptyString(value)) return "";
    const trimmed = value.trim();
    if (trimmed.startsWith("+")) {
      return `+${trimmed.slice(1).replace(/[^\d]/g, "")}`;
    }
    const digits = trimmed.replace(/[^\d]/g, "");
    if (!digits) return "";
    if (digits.startsWith("44")) return `+${digits}`;
    if (digits.startsWith("0")) return `+44${digits.slice(1)}`;
    return `+${digits}`;
  };

  const getEnquiryMailtoHref = (emailAddress) => {
    const subject = encodeURIComponent("Enquiry from website");
    const body = encodeURIComponent("Hi Georgie,\n\nI'm getting in touch about...");
    return `mailto:${emailAddress}?subject=${subject}&body=${body}`;
  };

  const setContactEmail = (emailValue) => {
    const wrappers = document.querySelectorAll("[data-contact-email-wrap]");
    wrappers.forEach((wrapper) => {
      const link = wrapper.querySelector("[data-contact-email-link]");
      if (!link) return;
      if (isNonEmptyString(emailValue)) {
        const cleanValue = emailValue.trim();
        link.textContent = cleanValue;
        link.setAttribute("href", getEnquiryMailtoHref(cleanValue));
        wrapper.classList.remove("hidden");
      } else {
        wrapper.classList.add("hidden");
      }
    });
  };

  const setContactPhone = (displayValue, telValue) => {
    const wrappers = document.querySelectorAll("[data-contact-phone-wrap]");
    wrappers.forEach((wrapper) => {
      const link = wrapper.querySelector("[data-contact-phone-link]");
      if (!link) return;

      const display = isNonEmptyString(displayValue) ? displayValue.trim() : "";
      const tel = isNonEmptyString(telValue) ? telValue.trim() : normalisePhoneForTel(display);

      if (display && tel) {
        link.textContent = display;
        link.setAttribute("href", `tel:${tel}`);
        wrapper.classList.remove("hidden");
      } else {
        wrapper.classList.add("hidden");
      }
    });
  };

  const getSocialConfig = () => {
    const nested = config.social && typeof config.social === "object" ? config.social : {};
    return {
      instagramUrl: isNonEmptyString(nested.instagramUrl) ? nested.instagramUrl : config.instagramUrl,
      facebookUrl: isNonEmptyString(nested.facebookUrl) ? nested.facebookUrl : config.facebookUrl,
      tiktokUrl: isNonEmptyString(nested.tiktokUrl) ? nested.tiktokUrl : config.tiktokUrl,
      instagramEmbedPosts: Array.isArray(nested.instagramEmbedPosts) ? nested.instagramEmbedPosts : []
    };
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

    const social = getSocialConfig();
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

    const emailValue = isNonEmptyString(config.email)
      ? config.email
      : config.contactEmail;

    const phoneDisplayValue = isNonEmptyString(config.phoneDisplay)
      ? config.phoneDisplay
      : config.contactPhone;

    const phoneTelValue = isNonEmptyString(config.phoneTel)
      ? config.phoneTel
      : normalisePhoneForTel(phoneDisplayValue);

    setContactEmail(emailValue);
    setContactPhone(phoneDisplayValue, phoneTelValue);

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

  const normaliseAssetPath = (source) => {
    if (!isNonEmptyString(source)) return "";

    let cleaned = source.trim();
    if (!cleaned) return "";

    try {
      if (/^https?:\/\//i.test(cleaned)) {
        cleaned = new URL(cleaned).pathname || cleaned;
      }
    } catch (error) {
      // Ignore URL parsing and continue with the original source string.
    }

    cleaned = cleaned.split("?")[0].split("#")[0];
    try {
      cleaned = decodeURIComponent(cleaned);
    } catch (error) {
      // Keep encoded path when decodeURIComponent fails.
    }

    cleaned = cleaned.replace(/\\/g, "/").replace(/^\.\//, "");
    const marker = "assets/images/";
    const markerIndex = cleaned.toLowerCase().indexOf(marker);
    if (markerIndex >= 0) {
      cleaned = cleaned.slice(markerIndex);
    }

    return cleaned.replace(/^\/+/, "");
  };

  let optimisedImageManifestPromise = null;

  const loadOptimisedImageManifest = async () => {
    // Optional file generated by `npm run images:build`.
    if (optimisedImageManifestPromise) {
      return optimisedImageManifestPromise;
    }

    optimisedImageManifestPromise = fetch("/assets/images/optimized/manifest.json", {
      cache: "force-cache"
    })
      .then(async (response) => {
        if (!response.ok) return null;
        const payload = await response.json();
        if (!payload || typeof payload !== "object" || !payload.images || typeof payload.images !== "object") {
          return null;
        }
        return payload.images;
      })
      .catch(() => null);

    return optimisedImageManifestPromise;
  };

  const normaliseVariantList = (variants) => {
    if (!Array.isArray(variants)) return [];
    return variants
      .filter(
        (item) =>
          item &&
          typeof item === "object" &&
          isNonEmptyString(item.src) &&
          Number.isFinite(Number(item.width))
      )
      .map((item) => ({
        src: item.src,
        width: Number(item.width)
      }))
      .sort((left, right) => left.width - right.width);
  };

  const toSrcSet = (variants) =>
    variants.map((variant) => `${variant.src} ${variant.width}w`).join(", ");

  const ensureOptimisedPicture = (img) => {
    if (!img || !img.parentNode) return null;
    if (img.parentElement && img.parentElement.tagName === "PICTURE") {
      return img.parentElement;
    }

    const picture = document.createElement("picture");
    picture.className = "responsive-picture";
    img.parentNode.insertBefore(picture, img);
    picture.appendChild(img);
    return picture;
  };

  const getManifestEntryForSource = (manifestImages, source) => {
    if (!manifestImages || typeof manifestImages !== "object") return null;
    const normalised = normaliseAssetPath(source);
    if (!normalised) return null;

    const candidates = [normalised];
    try {
      candidates.push(encodeURI(normalised));
    } catch (error) {
      // Ignore URI encoding failures.
    }

    for (const candidate of candidates) {
      if (manifestImages[candidate]) {
        return manifestImages[candidate];
      }
    }

    return null;
  };

  const applyOptimisedImageSources = (img, manifestEntry, sizesValue) => {
    if (!img || !manifestEntry || typeof manifestEntry !== "object") return false;

    const jpgVariants = normaliseVariantList(manifestEntry.jpg);
    if (!jpgVariants.length) return false;

    const jpgSrcSet = toSrcSet(jpgVariants);
    if (!isNonEmptyString(jpgSrcSet)) return false;

    const fallbackSrc = jpgVariants[0].src;
    if (isNonEmptyString(fallbackSrc)) {
      img.setAttribute("src", fallbackSrc);
    }
    img.setAttribute("srcset", jpgSrcSet);
    img.setAttribute("sizes", sizesValue);

    const avifVariants = normaliseVariantList(manifestEntry.avif);
    const webpVariants = normaliseVariantList(manifestEntry.webp);
    if (!avifVariants.length && !webpVariants.length) return true;

    const picture = ensureOptimisedPicture(img);
    if (!picture) return true;

    picture.querySelectorAll("source[data-optimized-source]").forEach((sourceNode) => {
      sourceNode.remove();
    });

    if (webpVariants.length) {
      const webpSource = document.createElement("source");
      webpSource.type = "image/webp";
      webpSource.srcset = toSrcSet(webpVariants);
      webpSource.sizes = sizesValue;
      webpSource.setAttribute("data-optimized-source", "webp");
      picture.insertBefore(webpSource, img);
    }

    if (avifVariants.length) {
      const avifSource = document.createElement("source");
      avifSource.type = "image/avif";
      avifSource.srcset = toSrcSet(avifVariants);
      avifSource.sizes = sizesValue;
      avifSource.setAttribute("data-optimized-source", "avif");
      picture.insertBefore(avifSource, picture.firstChild);
    }

    return true;
  };

  const removeMisleadingSrcSet = (img) => {
    if (!img) return;
    const srcset = img.getAttribute("srcset");
    if (!isNonEmptyString(srcset)) return;

    const srcCandidates = srcset
      .split(",")
      .map((entry) => entry.trim().split(/\s+/)[0] || "")
      .filter((entry) => isNonEmptyString(entry));

    if (!srcCandidates.length) return;

    const normalisedCandidates = srcCandidates
      .map((entry) => normaliseAssetPath(entry))
      .filter((entry) => isNonEmptyString(entry));

    if (!normalisedCandidates.length) return;

    if (new Set(normalisedCandidates).size <= 1) {
      img.removeAttribute("srcset");
      img.removeAttribute("sizes");
    }
  };

  const initProgressiveImages = async () => {
    const images = Array.from(document.querySelectorAll("img"));
    if (!images.length) return;
    const optimisedManifest = await loadOptimisedImageManifest();
    const primaryHeroImage = document.querySelector(".hero img:not(.brand-mark)");

    images.forEach((img) => {
      const inHero = Boolean(img.closest(".hero"));
      const isBrand = img.classList.contains("brand-mark");
      const isPrimaryHeroImage = img === primaryHeroImage;
      removeMisleadingSrcSet(img);

      if (!img.hasAttribute("decoding")) {
        img.setAttribute("decoding", "async");
      }

      if (isPrimaryHeroImage) {
        img.setAttribute("loading", "eager");
      } else {
        img.setAttribute("loading", "lazy");
      }

      if (isPrimaryHeroImage && !isBrand) {
        img.setAttribute("fetchpriority", "high");
      } else if (!isBrand) {
        img.setAttribute("fetchpriority", "low");
      } else if (img.hasAttribute("fetchpriority")) {
        img.removeAttribute("fetchpriority");
      }

      let sizeRule = "";
      if (img.matches(".hero-collage img")) {
        sizeRule = "(max-width: 420px) 92vw, (max-width: 760px) 46vw, (max-width: 1080px) 50vw, 32vw";
      } else if (img.matches(".gallery-tile img, .image-card img")) {
        sizeRule =
          "(max-width: 520px) 100vw, (max-width: 760px) 50vw, (max-width: 1200px) 33vw, 280px";
      } else if (img.matches(".social-preview-grid img")) {
        sizeRule = "(max-width: 760px) 30vw, 124px";
      } else if (img.matches(".path-card img, .about-photo")) {
        sizeRule = "(max-width: 960px) 100vw, 44vw";
      }

      if (sizeRule) {
        const imageSrc = img.getAttribute("src") || "";
        const triggerSource =
          img.closest("[data-lightbox]")?.getAttribute("data-lightbox") || "";
        const manifestEntry =
          getManifestEntryForSource(optimisedManifest, imageSrc) ||
          getManifestEntryForSource(optimisedManifest, triggerSource);
        applyOptimisedImageSources(img, manifestEntry, sizeRule);
      }

      if (isBrand || img.classList.contains("lightbox-image")) return;

      img.classList.add("img-fade", "img-skeleton");

      const markLoaded = () => {
        img.classList.add("is-loaded");
        img.classList.remove("img-skeleton");
      };

      if (img.complete) {
        markLoaded();
      } else {
        img.addEventListener("load", markLoaded, { once: true });
        img.addEventListener("error", () => img.classList.remove("img-skeleton"), { once: true });
      }
    });
  };

  const normaliseImageLabel = (source) => {
    if (!isNonEmptyString(source)) return "";
    try {
      const fileName = decodeURIComponent(source.split("/").pop() || "");
      return fileName
        .replace(/\.[a-z0-9]+$/i, "")
        .replace(/\b(pt|part)\s*\d+\b/gi, "")
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
    } catch (error) {
      return "";
    }
  };

  const inferGalleryAlt = (source) => {
    if (!isNonEmptyString(source)) return "";
    const label = normaliseImageLabel(source);
    if (!label) return "";

    if (source.includes("/Nails/")) {
      return `Nail set - ${label || "photo"}`;
    }

    if (source.includes("/Jewellery/")) {
      let type = "piece";
      if (label.includes("bracelet")) type = "bracelet";
      if (label.includes("anklet")) type = "anklet";
      if (label.includes("ring")) type = "ring";

      const feature = label
        .replace(/\b(permanent|welding|welded|bracelet|anklet|ring)\b/gi, "")
        .replace(/\s+/g, " ")
        .trim();

      return `Permanent jewellery - ${type}, ${feature || "feature detail"}`;
    }

    return "";
  };

  const initGalleryAltText = () => {
    document.querySelectorAll("[data-lightbox]").forEach((trigger) => {
      const imageNode = trigger.querySelector("img");
      const source =
        trigger.getAttribute("data-lightbox") ||
        (imageNode ? imageNode.getAttribute("src") : "");

      const alt = inferGalleryAlt(source || "");
      if (!isNonEmptyString(alt)) return;

      trigger.setAttribute("data-alt", alt);
      if (imageNode) {
        imageNode.setAttribute("alt", alt);
      }
    });
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
    const toggle = document.getElementById("mobileNavToggle") || document.querySelector("[data-nav-toggle]");
    const overlay = document.getElementById("mobileNavOverlay") || document.querySelector("[data-nav-backdrop]");
    const panel = document.getElementById("mobileNavPanel") || document.querySelector("[data-nav-menu]");
    const closeButton = document.getElementById("mobileNavClose");

    if (!toggle || !overlay || !panel) return;

    const mobileQuery = window.matchMedia("(max-width: 768px)");
    let isOpen = false;

    const getFocusable = () =>
      Array.from(
        panel.querySelectorAll(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );

    const applyClosedState = () => {
      isOpen = false;
      overlay.setAttribute("data-open", "false");
      overlay.setAttribute("aria-hidden", "true");
      panel.classList.remove("is-open");
      panel.setAttribute("inert", "");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("no-scroll");
      document.body.classList.remove("menu-open");
    };

    const applyDesktopState = () => {
      isOpen = false;
      overlay.setAttribute("data-open", "false");
      overlay.setAttribute("aria-hidden", "true");
      panel.classList.remove("is-open");
      panel.removeAttribute("inert");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("no-scroll");
      document.body.classList.remove("menu-open");
    };

    const syncNavStateForViewport = () => {
      if (mobileQuery.matches) {
        applyClosedState();
      } else {
        applyDesktopState();
      }
    };

    const openMenu = () => {
      if (!mobileQuery.matches) return;
      isOpen = true;
      overlay.setAttribute("data-open", "true");
      overlay.setAttribute("aria-hidden", "false");
      panel.classList.add("is-open");
      panel.removeAttribute("inert");
      toggle.setAttribute("aria-expanded", "true");
      document.body.classList.add("no-scroll");

      const firstLink = panel.querySelector("a[href]");
      const focusable = getFocusable();
      const target = firstLink || focusable[0];
      if (target) target.focus();
    };

    const closeMenu = () => {
      if (!isOpen && overlay.getAttribute("data-open") !== "true") return;
      applyClosedState();
      toggle.focus();
    };

    syncNavStateForViewport();
    if (typeof mobileQuery.addEventListener === "function") {
      mobileQuery.addEventListener("change", syncNavStateForViewport);
    } else if (typeof mobileQuery.addListener === "function") {
      mobileQuery.addListener(syncNavStateForViewport);
    }

    toggle.addEventListener("click", () => {
      if (!mobileQuery.matches) return;
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    if (closeButton) {
      closeButton.addEventListener("click", () => {
        if (!mobileQuery.matches) return;
        closeMenu();
      });
    }

    overlay.addEventListener("click", (event) => {
      if (!mobileQuery.matches) return;
      if (event.target === overlay) {
        closeMenu();
      }
    });

    panel.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (!mobileQuery.matches) return;
        closeMenu();
      });
    });

    document.addEventListener("keydown", (event) => {
      if (!isOpen || !mobileQuery.matches) return;
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
    lightbox.setAttribute("tabindex", "-1");
    lightbox.setAttribute("inert", "");

    lightbox.innerHTML = `
      <div class="lightbox-frame">
        <button type="button" class="lightbox-close" aria-label="Close image preview">&times;</button>
        <button type="button" class="lightbox-nav prev" aria-label="Previous image"><</button>
        <img class="lightbox-image" src="" alt="" width="900" height="1120">
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
    let openingTrigger = null;

    const isFocusableVisible = (node) => {
      if (!node) return false;
      const style = window.getComputedStyle(node);
      return style.display !== "none" && style.visibility !== "hidden";
    };

    const getFocusableInLightbox = () =>
      Array.from(lightbox.querySelectorAll('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'))
        .filter((node) => isFocusableVisible(node));

    const trapLightboxFocus = (event) => {
      if (event.key !== "Tab") return;

      const focusable = getFocusableInLightbox();
      if (!focusable.length) {
        event.preventDefault();
        closeBtn.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const updateImage = () => {
      const item = items[activeIndex];
      if (!item) return;
      img.setAttribute("src", item.src);
      img.setAttribute("alt", item.alt);
    };

    const open = (index, triggerElement) => {
      activeIndex = index;
      openingTrigger = triggerElement || null;
      lastFocused = triggerElement || document.activeElement;
      updateImage();
      lightbox.removeAttribute("inert");
      lightbox.classList.add("is-open");
      isOpen = true;
      document.body.classList.add("menu-open");
      closeBtn.focus();
    };

    const close = () => {
      if (!isOpen) return;
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("inert", "");
      isOpen = false;
      document.body.classList.remove("menu-open");
      const focusTarget = openingTrigger || lastFocused;
      if (focusTarget && typeof focusTarget.focus === "function") {
        focusTarget.focus();
      }
      openingTrigger = null;
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
        open(index, triggerElement);
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
      if (event.key === "Tab") {
        trapLightboxFocus(event);
        return;
      }
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
      const countNode = wrapper.querySelector("[data-gallery-count]");
      const loadMoreButton = wrapper.querySelector("[data-gallery-load-more]");
      const loadMoreWrap = loadMoreButton?.closest(".gallery-load-wrap");
      const pageSize = Number(wrapper.getAttribute("data-gallery-page-size")) || 12;
      const loadedByFilter = {};

      const primeTileImage = (tile) => {
        const img = tile.querySelector("img");
        if (!img || img.dataset.lazyPrimed === "true") return;
        const currentSrc = img.getAttribute("src");
        const currentSrcset = img.getAttribute("srcset");

        if (isNonEmptyString(currentSrc)) {
          img.dataset.src = currentSrc;
          img.removeAttribute("src");
        }

        if (isNonEmptyString(currentSrcset)) {
          img.dataset.srcset = currentSrcset;
          img.removeAttribute("srcset");
        }

        img.dataset.lazyPrimed = "true";
      };

      const loadTileImage = (tile) => {
        const img = tile.querySelector("img");
        if (!img || img.getAttribute("src")) return;

        const source = img.dataset.src;
        if (!isNonEmptyString(source)) return;

        img.setAttribute("src", source);
        if (isNonEmptyString(img.dataset.srcset)) {
          img.setAttribute("srcset", img.dataset.srcset);
        }

        if (!img.classList.contains("img-fade")) {
          img.classList.add("img-fade", "img-skeleton");
        }

        const markLoaded = () => {
          img.classList.add("is-loaded");
          img.classList.remove("img-skeleton");
        };

        if (img.complete) {
          markLoaded();
        } else {
          img.addEventListener("load", markLoaded, { once: true });
          img.addEventListener("error", () => img.classList.remove("img-skeleton"), { once: true });
        }
      };

      const getMatchingTiles = (filterValue) =>
        tiles.filter((tile) => {
          const category = tile.getAttribute("data-category") || "";
          return filterValue === "all" || category === filterValue;
        });

      tiles.forEach((tile) => {
        primeTileImage(tile);
      });

      buttons.forEach((button) => {
        const key = button.getAttribute("data-filter-btn") || "all";
        if (!loadedByFilter[key]) {
          loadedByFilter[key] = pageSize;
        }
      });

      let activeFilter =
        buttons.find((btn) => btn.getAttribute("aria-pressed") === "true")?.getAttribute("data-filter-btn") ||
        "all";

      const updateView = () => {
        const matching = getMatchingTiles(activeFilter);
        const totalMatching = matching.length;
        const limit = Math.min(loadedByFilter[activeFilter] || pageSize, totalMatching);
        loadedByFilter[activeFilter] = limit || pageSize;
        const visibleSet = new Set(matching.slice(0, limit));

        buttons.forEach((button) => {
          button.setAttribute(
            "aria-pressed",
            String((button.getAttribute("data-filter-btn") || "all") === activeFilter)
          );
        });

        tiles.forEach((tile) => {
          const isVisible = visibleSet.has(tile);
          tile.hidden = !isVisible;
          if (isVisible) {
            loadTileImage(tile);
          }
        });

        if (countNode) {
          countNode.textContent = `${visibleSet.size} of ${totalMatching} pieces shown`;
        }

        if (loadMoreButton) {
          const hasMore = limit < totalMatching;
          loadMoreButton.hidden = !hasMore;
          if (loadMoreWrap) {
            loadMoreWrap.hidden = !hasMore;
          }
        }
      };

      buttons.forEach((button) => {
        const activateFilter = () => {
          const nextFilter = button.getAttribute("data-filter-btn") || "all";
          activeFilter = nextFilter;
          updateView();
        };

        button.addEventListener("click", activateFilter);
        button.addEventListener("keydown", (event) => {
          if (event.key !== " " && event.key !== "Spacebar") return;
          event.preventDefault();
          activateFilter();
        });
      });

      if (loadMoreButton) {
        loadMoreButton.addEventListener("click", () => {
          const matching = getMatchingTiles(activeFilter);
          loadedByFilter[activeFilter] = Math.min(
            (loadedByFilter[activeFilter] || pageSize) + pageSize,
            matching.length
          );
          updateView();
        });
      }

      updateView();
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
      return getPreferred(reviews, ["Nails", "Both"]).slice(0, limit);
    }

    if (viewKey === "jewellery") {
      return getPreferred(reviews, ["Permanent Jewellery", "Both"]).slice(0, limit);
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
          <span class="review-source">${escapeHtml(review.source || "Client feedback")}</span>
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
  let tiktokScriptPromise;

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

  const loadTikTokScript = () => {
    if (window.tiktokEmbedLoaded === true) {
      return Promise.resolve();
    }

    if (tiktokScriptPromise) {
      return tiktokScriptPromise;
    }

    tiktokScriptPromise = new Promise((resolve, reject) => {
      const existing = document.getElementById("tiktok-embed-script");
      if (existing) {
        existing.addEventListener(
          "load",
          () => {
            window.tiktokEmbedLoaded = true;
            resolve();
          },
          { once: true }
        );
        existing.addEventListener("error", () => reject(new Error("TikTok script failed")), {
          once: true
        });
        return;
      }

      const script = document.createElement("script");
      script.id = "tiktok-embed-script";
      script.src = "https://www.tiktok.com/embed.js";
      script.async = true;
      script.onload = () => {
        window.tiktokEmbedLoaded = true;
        resolve();
      };
      script.onerror = () => reject(new Error("TikTok script failed"));
      document.body.appendChild(script);
    });

    return tiktokScriptPromise;
  };

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const extractTikTokHandle = (urlValue) => {
    if (!isValidUrl(urlValue)) return "";
    try {
      const pathname = new URL(urlValue).pathname || "";
      const match = pathname.match(/@([A-Za-z0-9._-]+)/);
      return match ? match[1] : "";
    } catch (error) {
      return "";
    }
  };

  const socialState = new WeakMap();

  const getSocialSectionState = (section) => {
    if (!socialState.has(section)) {
      socialState.set(section, {
        instagramLoading: false,
        instagramLoaded: false,
        instagramInteracted: false,
        tiktokLoading: false,
        tiktokLoaded: false,
        tiktokInteracted: false
      });
    }
    return socialState.get(section);
  };

  const setStatus = (node, message, tone = "info") => {
    if (!node) return;
    if (!isNonEmptyString(message)) {
      node.textContent = "";
      node.classList.add("hidden");
      node.removeAttribute("data-tone");
      return;
    }

    node.textContent = message;
    node.setAttribute("data-tone", tone);
    node.classList.remove("hidden");
  };

  const setPanelOpen = (panel, trigger, isOpen, openLabel, closeLabel) => {
    if (panel) {
      panel.classList.toggle("hidden", !isOpen);
    }

    if (trigger) {
      trigger.setAttribute("aria-expanded", String(isOpen));
      trigger.textContent = isOpen ? closeLabel : openLabel;
    }
  };

  const syncInstagramButtonState = (section) => {
    const panel = section.querySelector('[data-social-panel="instagram"]');
    const trigger = section.querySelector('[data-load-social="instagram"]');
    if (!trigger) return;

    const isOpen = panel ? !panel.classList.contains("hidden") : false;
    trigger.textContent = isOpen ? "Hide latest posts" : "Show latest posts";
    trigger.setAttribute("aria-expanded", String(isOpen));
  };

  const syncTikTokButtonState = (section) => {
    const state = getSocialSectionState(section);
    const panel = section.querySelector('[data-social-panel="tiktok"]');
    const trigger = section.querySelector('[data-load-social="tiktok"]');
    if (!trigger) return;

    const isOpen = panel ? !panel.classList.contains("hidden") : false;
    const collapsedLabel = state.tiktokLoaded ? "Show TikTok feed" : "Load TikTok feed";
    trigger.textContent = isOpen ? "Hide TikTok feed" : collapsedLabel;
    trigger.setAttribute("aria-expanded", String(isOpen));
  };

  const loadInstagramEmbeds = async (section, options = {}) => {
    const state = getSocialSectionState(section);
    const auto = Boolean(options.auto);

    const embedContent = section.querySelector("[data-embed-content]");
    const status = section.querySelector("[data-embed-status]");
    const panel = section.querySelector('[data-social-panel="instagram"]');
    const trigger = section.querySelector('[data-load-social="instagram"]');
    const placeholder = section.querySelector("[data-embed-placeholder]");
    if (!embedContent || !status) return;

    const social = getSocialConfig();
    const instagramUrl = social.instagramUrl;
    const posts = social.instagramEmbedPosts
      .filter((item) => isValidUrl(item))
      .slice(0, 3);

    if (!isValidUrl(instagramUrl) || !posts.length) {
      if (!auto) {
        setPanelOpen(panel, trigger, true, "Show latest posts", "Hide latest posts");
        setStatus(status, "Instagram previews are unavailable right now. Use the profile link instead.", "warning");
      }
      return;
    }

    if (state.instagramLoading) {
      if (!auto) {
        setPanelOpen(panel, trigger, true, "Show latest posts", "Hide latest posts");
        setStatus(status, "Loading latest Instagram posts...");
      }
      return;
    }

    if (!auto) {
      setPanelOpen(panel, trigger, true, "Show latest posts", "Hide latest posts");
    }

    state.instagramLoading = true;
    if (trigger) {
      trigger.setAttribute("disabled", "true");
      trigger.textContent = "Loading posts...";
    }

    if (placeholder) {
      placeholder.classList.remove("hidden");
    }

    embedContent.classList.add("hidden");
    setStatus(status, auto ? "" : "Loading latest Instagram posts...");

    embedContent.innerHTML = posts
      .map(
        (url) => `
          <blockquote class="instagram-media" data-instgrm-permalink="${escapeHtml(
            `${url}?utm_source=ig_embed&utm_campaign=loading`
          )}" data-instgrm-version="14"></blockquote>
        `
      )
      .join("");

    try {
      await loadInstagramScript();
      if (
        window.instgrm &&
        window.instgrm.Embeds &&
        typeof window.instgrm.Embeds.process === "function"
      ) {
        window.instgrm.Embeds.process();
      }

      await wait(2200);
      const hasIframe = embedContent.querySelector("iframe") !== null;

      if (hasIframe) {
        state.instagramLoaded = true;
        if (placeholder) {
          placeholder.classList.add("hidden");
        }
        embedContent.classList.remove("hidden");

        if (auto && !state.instagramInteracted) {
          setPanelOpen(panel, trigger, false, "Show latest posts", "Hide latest posts");
          setStatus(status, "");
        } else {
          setPanelOpen(panel, trigger, true, "Show latest posts", "Hide latest posts");
          setStatus(status, "Latest Instagram posts loaded.", "success");
        }

        return;
      } else {
        throw new Error("Instagram preview did not render");
      }
    } catch (error) {
      if (placeholder) {
        placeholder.classList.add("hidden");
      }
      embedContent.classList.add("hidden");
      embedContent.innerHTML = "";

      if (!auto) {
        setPanelOpen(panel, trigger, true, "Show latest posts", "Hide latest posts");
        setStatus(
          status,
          "Instagram preview is blocked in this browser. Use the profile button to view posts.",
          "warning"
        );
      } else {
        setPanelOpen(panel, trigger, false, "Show latest posts", "Hide latest posts");
        setStatus(status, "");
      }
    } finally {
      state.instagramLoading = false;
      if (trigger) {
        trigger.removeAttribute("disabled");
      }
      syncInstagramButtonState(section);
    }
  };

  const loadTikTokEmbed = async (section) => {
    const state = getSocialSectionState(section);

    const tiktokContent = section.querySelector("[data-tiktok-content]");
    const status = section.querySelector("[data-tiktok-status]");
    const panel = section.querySelector('[data-social-panel="tiktok"]');
    const trigger = section.querySelector('[data-load-social="tiktok"]');
    const placeholder = section.querySelector("[data-tiktok-placeholder]");
    if (!tiktokContent || !status) return;

    const social = getSocialConfig();
    const tiktokUrl = social.tiktokUrl;
    if (!isValidUrl(tiktokUrl)) {
      setPanelOpen(panel, trigger, true, "Load TikTok feed", "Hide TikTok feed");
      setStatus(status, "TikTok preview is unavailable right now. Use the profile link instead.", "warning");
      return;
    }

    if (state.tiktokLoading) {
      setPanelOpen(
        panel,
        trigger,
        true,
        state.tiktokLoaded ? "Show TikTok feed" : "Load TikTok feed",
        "Hide TikTok feed"
      );
      setStatus(status, "Loading latest TikTok posts...");
      return;
    }

    setPanelOpen(
      panel,
      trigger,
      true,
      state.tiktokLoaded ? "Show TikTok feed" : "Load TikTok feed",
      "Hide TikTok feed"
    );

    state.tiktokLoading = true;
    if (trigger) {
      trigger.setAttribute("disabled", "true");
      trigger.textContent = "Loading TikTok feed...";
    }

    if (placeholder) {
      placeholder.classList.remove("hidden");
    }
    tiktokContent.classList.add("hidden");
    setStatus(status, "Loading latest TikTok posts...");

    const handle = extractTikTokHandle(tiktokUrl) || "elysium_by_georgierose";
    tiktokContent.innerHTML = `
      <blockquote class="tiktok-embed" cite="${escapeHtml(
        tiktokUrl
      )}" data-unique-id="${escapeHtml(
        handle
      )}" data-embed-type="creator" style="margin:0;">
        <section>
          <a target="_blank" rel="noreferrer noopener" href="${escapeHtml(
            tiktokUrl
          )}">@${escapeHtml(handle)}</a>
        </section>
      </blockquote>
    `;

    try {
      await loadTikTokScript();
      await wait(2000);
      const hasIframe = tiktokContent.querySelector("iframe") !== null;
      if (hasIframe) {
        state.tiktokLoaded = true;
        if (placeholder) {
          placeholder.classList.add("hidden");
        }
        tiktokContent.classList.remove("hidden");
        setStatus(status, "Latest TikTok posts loaded.", "success");
      } else {
        throw new Error("TikTok preview did not render");
      }
    } catch (error) {
      if (placeholder) {
        placeholder.classList.add("hidden");
      }
      tiktokContent.classList.add("hidden");
      tiktokContent.innerHTML = "";
      setStatus(
        status,
        "TikTok preview is blocked in this browser. Use the profile button to view posts.",
        "warning"
      );
    } finally {
      state.tiktokLoading = false;
      if (trigger) {
        trigger.removeAttribute("disabled");
      }
      syncTikTokButtonState(section);
    }
  };

  const initSocialEmbeds = () => {
    const sections = Array.from(document.querySelectorAll("[data-social-embed]"));
    if (!sections.length) return;

    sections.forEach((section) => {
      const state = getSocialSectionState(section);
      const instagramTrigger = section.querySelector('[data-load-social="instagram"]');
      const instagramPanel = section.querySelector('[data-social-panel="instagram"]');
      const instagramStatus = section.querySelector("[data-embed-status]");
      const tiktokTrigger = section.querySelector('[data-load-social="tiktok"]');
      const tiktokPanel = section.querySelector('[data-social-panel="tiktok"]');
      const tiktokStatus = section.querySelector("[data-tiktok-status]");

      if (instagramTrigger) {
        instagramTrigger.addEventListener("click", async () => {
          state.instagramInteracted = true;

          if (state.instagramLoaded) {
            const shouldOpen = instagramPanel ? instagramPanel.classList.contains("hidden") : true;
            setPanelOpen(instagramPanel, instagramTrigger, shouldOpen, "Show latest posts", "Hide latest posts");
            setStatus(
              instagramStatus,
              shouldOpen ? "Latest Instagram posts loaded." : "",
              shouldOpen ? "success" : "info"
            );
            return;
          }

          await loadInstagramEmbeds(section, { auto: false });
        });
      }

      if (tiktokTrigger) {
        tiktokTrigger.addEventListener("click", async () => {
          state.tiktokInteracted = true;

          if (state.tiktokLoaded) {
            const shouldOpen = tiktokPanel ? tiktokPanel.classList.contains("hidden") : true;
            setPanelOpen(
              tiktokPanel,
              tiktokTrigger,
              shouldOpen,
              "Show TikTok feed",
              "Hide TikTok feed"
            );
            setStatus(
              tiktokStatus,
              shouldOpen ? "Latest TikTok posts loaded." : "",
              shouldOpen ? "success" : "info"
            );
            return;
          }

          await loadTikTokEmbed(section);
        });
      }

      syncInstagramButtonState(section);
      syncTikTokButtonState(section);
    });

    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          loadInstagramEmbeds(entry.target, { auto: true });
        });
      },
      {
        rootMargin: "220px 0px"
      }
    );

    sections.forEach((section) => observer.observe(section));
  };

  const initEnquiryForms = () => {
    document.querySelectorAll('form[data-form-type="enquiry"]').forEach((form) => {
      const card = form.closest(".form-card");
      const errorNode = form.querySelector("[data-form-error]");
      const summaryNode = form.querySelector("[data-form-error-summary]");

      if (!card) return;

      const configuredAction = isNonEmptyString(config.formspreeEndpoint)
        ? config.formspreeEndpoint.trim()
        : "";

      if (!isPlaceholderEndpoint(configuredAction)) {
        form.setAttribute("action", configuredAction);
      }

      const fields = Array.from(form.querySelectorAll("[data-validate-field]"));
      const getFieldErrorNode = (field) =>
        form.querySelector(`[data-field-error-for="${field.getAttribute("id")}"]`);

      const clearSummary = () => {
        if (!summaryNode) return;
        summaryNode.innerHTML = "";
        summaryNode.classList.add("hidden");
      };

      const showSummary = (messages) => {
        if (!summaryNode) return;
        const filteredMessages = Array.from(
          new Set(messages.filter((message) => isNonEmptyString(message)))
        );

        if (!filteredMessages.length) {
          clearSummary();
          return;
        }

        summaryNode.innerHTML = `
          <p>Please correct the following before sending your enquiry:</p>
          <ul>${filteredMessages.map((message) => `<li>${escapeHtml(message)}</li>`).join("")}</ul>
        `;
        summaryNode.classList.remove("hidden");
      };

      const getValidationMessage = (field) => {
        if (field.validity.valueMissing) {
          return field.getAttribute("data-required-message") || "This field is required.";
        }

        if (field.validity.typeMismatch && field.getAttribute("type") === "email") {
          return "Enter a valid email address.";
        }

        return "";
      };

      const collectInvalidMessages = () =>
        fields
          .map((field) => getValidationMessage(field))
          .filter((message) => isNonEmptyString(message));

      const setFieldState = (field, message) => {
        const fieldErrorNode = getFieldErrorNode(field);
        if (fieldErrorNode) {
          fieldErrorNode.textContent = message || "";
        }

        if (message) {
          field.setAttribute("aria-invalid", "true");
        } else {
          field.removeAttribute("aria-invalid");
        }
      };

      const validateField = (field) => {
        const message = getValidationMessage(field);
        setFieldState(field, message);
        return !message;
      };

      fields.forEach((field) => {
        ["input", "change", "blur"].forEach((eventName) => {
          field.addEventListener(eventName, () => {
            if (!field.value && !field.hasAttribute("required")) {
              setFieldState(field, "");
              if (summaryNode && !summaryNode.classList.contains("hidden")) {
                showSummary(collectInvalidMessages());
              }
              return;
            }
            validateField(field);
            if (summaryNode && !summaryNode.classList.contains("hidden")) {
              showSummary(collectInvalidMessages());
            }
          });
        });
      });

      form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (errorNode) {
          errorNode.textContent = "";
        }
        clearSummary();

        let firstInvalidField = null;

        fields.forEach((field) => {
          const valid = validateField(field);
          if (!valid && !firstInvalidField) {
            firstInvalidField = field;
          }
        });

        if (firstInvalidField) {
          if (errorNode) {
            errorNode.textContent =
              "Please complete the required fields before sending your enquiry.";
          }
          showSummary(collectInvalidMessages());
          if (summaryNode && !summaryNode.classList.contains("hidden")) {
            summaryNode.focus();
          } else {
            firstInvalidField.focus();
          }
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
            clearSummary();
            showSuccess();
            return;
          }

          throw new Error("Submission failed");
        } catch (error) {
          if (errorNode) {
            errorNode.textContent =
              "We could not send your enquiry right now. Please message on Instagram or email instead.";
          }
          showSummary(["We could not send your enquiry right now. Please try again or use Instagram/email."]);
          if (summaryNode && !summaryNode.classList.contains("hidden")) {
            summaryNode.focus();
          }
        } finally {
          if (submitButton) {
            submitButton.removeAttribute("disabled");
          }
        }
      });
    });
  };

  ready(async () => {
    applyConfig();
    await initProgressiveImages();
    initGalleryAltText();
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
