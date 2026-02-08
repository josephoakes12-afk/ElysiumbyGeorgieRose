(() => {
  const images = [
    { src: "assets/images/gallery/gallery-1.jpg", alt: "Permanent jewellery detail" },
    { src: "assets/images/gallery/gallery-2.jpg", alt: "Gold bracelet stack" },
    { src: "assets/images/gallery/gallery-3.jpg", alt: "Sterling silver anklet" },
    { src: "assets/images/gallery/gallery-4.jpg", alt: "Welded ring detail" },
    { src: "assets/images/gallery/gallery-5.jpg", alt: "Welded anklet detail" },
    { src: "assets/images/gallery/gallery-6.jpg", alt: "Welded ring fitting" },
    { src: "assets/images/gallery/gallery-7.jpg", alt: "Pop-up station setup" },
    { src: "assets/images/gallery/gallery-8.jpg", alt: "Wedding guest experience" }
  ];

  const grid = document.querySelector("#galleryGrid");
  const lightbox = document.querySelector("#lightbox");
  const lightboxImg = document.querySelector("#lightboxImg");
  const lightboxClose = document.querySelector("#lightboxClose");
  let lastFocused = null;

  if (!grid || !lightbox || !lightboxImg || !lightboxClose) return;

  images.forEach((image, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "gallery-item";
    button.setAttribute("aria-label", `Open image ${index + 1}`);
    const img = document.createElement("img");
    img.src = image.src;
    img.alt = image.alt;
    button.appendChild(img);
    button.addEventListener("click", () => openLightbox(image));
    grid.appendChild(button);
  });

  const openLightbox = (image) => {
    lastFocused = document.activeElement;
    lightboxImg.src = image.src;
    lightboxImg.alt = image.alt;
    lightbox.classList.add("active");
    lightbox.setAttribute("aria-hidden", "false");
    lightboxClose.focus();
  };

  const closeLightbox = () => {
    lightbox.classList.remove("active");
    lightbox.setAttribute("aria-hidden", "true");
    if (lastFocused) lastFocused.focus();
  };

  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("active")) return;
    if (event.key === "Escape") {
      closeLightbox();
    }
    if (event.key === "Tab") {
      event.preventDefault();
      lightboxClose.focus();
    }
  });
})();
