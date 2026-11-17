import createOrigamiFold from "./origami_simple_fold.js";

export default class Carousel {
  constructor(element, items = []) {
    if (!element) return;

    this.carousel = element;
    this.items = Array.isArray(items) ? items : [];
    this.currentIndex = 0;
    this.timer = null;

    this.autoplay = element.dataset.autoplay === "true";
    this.interval = Number(element.dataset.interval) || 5000;
    this.height = Number(element.dataset.height) || 400;

    this.showTitle = element.dataset.showTitle !== "false";
    this.showDescription = element.dataset.showDescription !== "false";
    this.showArrows = element.dataset.showArrows !== "false";
    this.showDots = element.dataset.showDots !== "false";

    this.prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    this.track = null;
    this.dotsContainer = null;
    this.slides = [];
    this.dots = [];

    this.render();
    this.bindEvents();
    this.start();
  }

  createContentNode(item) {
    if (!item) return document.createDocumentFragment();

    switch (item.type) {
      case "image": {
        const figure = document.createElement("figure");
        figure.className = "carousel-media";

        const img = document.createElement("img");
        img.src = item.image;
        img.alt = item.title || "";
        img.loading = "lazy";
        img.className = "carousel-img";

        if (item.url || item.link) {
          const a = document.createElement("a");
          a.href = item.url || item.link;
          a.setAttribute("aria-label", item.title || "Ver mais");
          a.appendChild(img);
          figure.appendChild(a);
        } else {
          figure.appendChild(img);
        }

        return figure;
      }

      case "video": {
        const video = document.createElement("video");
        video.src = item.video || item.src;
        video.controls = true;
        video.preload = "metadata";
        return video;
      }

      case "origami": {
        const figure = document.createElement("figure");
        figure.className = "carousel-media origami-container";
        
        const origami = createOrigamiFold(item);
        figure.appendChild(origami.render());
        
        return figure;
      }

      case "html": {
        const section = document.createElement("section");
        section.className = "carousel-custom-html";
        section.innerHTML = item.content || "";
        return section;
      }

      default:
        return document.createDocumentFragment();
    }
  }

  render() {
    this.carousel.replaceChildren();

    if (this.items.length === 0) {
      const emptyText = document.createElement("p");
      emptyText.className = "carousel-empty";
      emptyText.textContent = "Nenhum item para exibir.";
      this.carousel.appendChild(emptyText);
      return;
    }

    this.carousel.style.height = `${this.height}px`;

    const hasMultipleItems = this.items.length > 1;
    const showArrows = this.showArrows && hasMultipleItems;
    const showDots = this.showDots && hasMultipleItems;

    this.track = document.createElement("div");
    this.track.className = "carousel-track";

    const fragment = document.createDocumentFragment();

    this.items.forEach((item, index) => {
      const isActive = index === 0;

      const article = document.createElement("article");
      article.className = "carousel-slide";
      if (!isActive) article.inert = true;

      article.appendChild(this.createContentNode(item));

      if (this.showTitle && item.title) {
        const header = document.createElement("header");
        header.className = "carousel-content";

        const h2 = document.createElement("h2");
        h2.textContent = item.title;
        header.appendChild(h2);

        if (this.showDescription && item.description) {
          const p = document.createElement("p");
          p.textContent = item.description;
          header.appendChild(p);
        }

        article.appendChild(header);
      }

      this.track.appendChild(article);
    });

    fragment.appendChild(this.track);

    if (showArrows) {
      const btnPrev = document.createElement("button");
      btnPrev.type = "button";
      btnPrev.className = "carousel-prev";
      btnPrev.setAttribute("aria-label", "Slide anterior");

      const iconPrev = document.createElement("i");
      iconPrev.className = "fa-solid fa-chevron-left";
      iconPrev.setAttribute("aria-hidden", "true");
      btnPrev.appendChild(iconPrev);

      const btnNext = document.createElement("button");
      btnNext.type = "button";
      btnNext.className = "carousel-next";
      btnNext.setAttribute("aria-label", "Próximo slide");

      const iconNext = document.createElement("i");
      iconNext.className = "fa-solid fa-chevron-right";
      iconNext.setAttribute("aria-hidden", "true");
      btnNext.appendChild(iconNext);

      fragment.append(btnPrev, btnNext);
    }

    if (showDots) {
      this.dotsContainer = document.createElement("nav");
      this.dotsContainer.className = "carousel-dots";
      this.dotsContainer.setAttribute("aria-label", "Navegação do carrossel");

      this.items.forEach((_, index) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = `carousel-dot ${index === 0 ? "active" : ""}`;
        dot.dataset.index = index;
        dot.setAttribute("aria-label", `Ir para slide ${index + 1}`);
        this.dotsContainer.appendChild(dot);
      });

      fragment.appendChild(this.dotsContainer);
    }

    this.carousel.appendChild(fragment);

    this.slides = Array.from(this.track.children);
    this.dots = this.dotsContainer ? Array.from(this.dotsContainer.children) : [];

    this.updateTransform();
  }

  bindEvents() {
    if (this.items.length <= 1) return;

    if (this.showArrows) {
      this.carousel.addEventListener("click", (e) => {
        if (e.target.closest(".carousel-next")) {
          this.next();
          this.resetTimer();
        } else if (e.target.closest(".carousel-prev")) {
          this.previous();
          this.resetTimer();
        }
      });
    }

    if (this.showDots && this.dotsContainer) {
      this.dotsContainer.addEventListener("click", (e) => {
        const dot = e.target.closest(".carousel-dot");
        if (dot) {
          this.goTo(Number(dot.dataset.index));
          this.resetTimer();
        }
      });
    }

    this.carousel.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        this.previous();
        this.resetTimer();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        this.next();
        this.resetTimer();
      }
    });

    if (this.autoplay) {
      this.carousel.addEventListener("mouseenter", () => this.stop());
      this.carousel.addEventListener("mouseleave", () => this.start());
      this.carousel.addEventListener("focusin", () => this.stop());
      this.carousel.addEventListener("focusout", () => this.start());
    }
  }

  goTo(index) {
    if (isNaN(Number(index))) return;

    const targetIndex = Math.max(0, Math.min(Number(index), this.items.length - 1));
    if (targetIndex === this.currentIndex) return;

    this.currentIndex = targetIndex;
    this.update();
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.items.length;
    this.update();
  }

  previous() {
    this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
    this.update();
  }

  updateTransform() {
    if (this.track) {
      this.track.style.transform = `translateX(-${this.currentIndex * 100}%)`;
    }
  }

  update() {
    this.updateTransform();

    // Atualiza estado ativo dos dots
    if (this.showDots && this.dots.length > 0) {
      this.dots.forEach((dot, index) => {
        dot.classList.toggle("active", index === this.currentIndex);
      });
    }

    if (this.slides.length > 0) {
      this.slides.forEach((slide, index) => {
        slide.inert = index !== this.currentIndex;
      });

      this.triggerSlideAnimations(this.slides[this.currentIndex]);
    }
  }

  triggerSlideAnimations(currentSlide) {
    if (!currentSlide || this.prefersReducedMotion) return;

    const animatedParts = currentSlide.querySelectorAll(".origami-part");
    if (animatedParts.length === 0) return;

    animatedParts.forEach((part) => (part.style.animation = "none"));
    void currentSlide.offsetWidth; 
    animatedParts.forEach((part) => (part.style.animation = ""));
  }

  start() {
    if (!this.autoplay || this.items.length <= 1 || this.timer) return;
    this.timer = setInterval(() => this.next(), this.interval);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  resetTimer() {
    this.stop();
    this.start();
  }
}