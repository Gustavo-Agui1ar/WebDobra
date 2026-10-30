import OrigamiFold from "./origami_simple_fold.js";
import { injectCSS } from "./utils.js";

injectCSS("../css/carrosel.css");

function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export default class Carousel {
    constructor(element, items = []) {
        if (!element) return;

        this.carousel = element;
        this.items = Array.isArray(items) ? items : [];
        this.currentIndex = 0;
        this.timer = null;
        this.destroyed = false; // Estado para evitar execução após destroy()
        this.abortController = new AbortController();
        this.autoplay = element.dataset.autoplay === "true";
        this.interval = Number(element.dataset.interval) || 5000;
        this.height = Number(element.dataset.height) || 400;
        this.showTitle = element.dataset.showTitle !== "false";
        this.showDescription = element.dataset.showDescription !== "false";
        this.showArrows = element.dataset.showArrows !== "false";
        this.showDots = element.dataset.showDots !== "false";

        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        this.track = null;
        this.dotsContainer = null;
        this.slides = [];
        this.dots = [];

        this.render();
        this.bindEvents();
        this.start();
    }

    renderContent(item) {
        if (!item) return "";
        switch (item.type) {
            case "image":
                return `<img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.title || '')}" loading="lazy">`;
            case "html":
                return item.content || "";
            case "origami":
                return new OrigamiFold(item).render();
            default:
                return "";
        }
    }

    render() {
        if (this.items.length === 0) {
            this.carousel.innerHTML = '<div class="carousel-empty"><p>Nenhum item para exibir.</p></div>';
            return;
        }

        this.carousel.style.height = `${this.height}px`;

        const hasMultipleItems = this.items.length > 1;
        const showArrows = this.showArrows && hasMultipleItems;
        const showDots = this.showDots && hasMultipleItems;

        const arrowsHTML = showArrows
            ? `<button type="button" class="carousel-prev" aria-label="Slide anterior">
                   <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
               </button>
               <button type="button" class="carousel-next" aria-label="Próximo slide">
                   <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
               </button>`
            : "";

        const dotsContainerHTML = showDots
            ? `<nav class="carousel-dots" aria-label="Navegação do carrossel"></nav>`
            : "";

        this.carousel.innerHTML = `
            <div class="carousel-track"></div>
            ${arrowsHTML}
            ${dotsContainerHTML}
        `;

        this.track = this.carousel.querySelector(".carousel-track");
        this.dotsContainer = this.carousel.querySelector(".carousel-dots");

        let slidesHTML = "";
        let dotsHTML = "";

        this.items.forEach((item, index) => {
            const content = this.renderContent(item);
            const titleHTML = (this.showTitle && item.title)
                ? `<div class="carousel-content">
                       <h2>${escapeHTML(item.title)}</h2>
                       ${(this.showDescription && item.description) ? `<p>${escapeHTML(item.description)}</p>` : ""}
                   </div>`
                : "";

            const isActive = index === 0;

            slidesHTML += `
                <article class="carousel-slide" ${!isActive ? 'inert' : ''} aria-hidden="${!isActive}">
                    ${content}
                    ${titleHTML}
                </article>
            `;

            if (showDots) {
                dotsHTML += `
                    <button type="button" 
                            class="carousel-dot ${isActive ? 'active' : ''}" 
                            data-index="${index}" 
                            aria-label="Ir para slide ${index + 1}">
                    </button>
                `;
            }
        });

        this.track.innerHTML = slidesHTML;
        if (showDots && this.dotsContainer) {
            this.dotsContainer.innerHTML = dotsHTML;
        }

        // Armazena referências no cache para reuso posterior
        this.slides = Array.from(this.track.querySelectorAll(".carousel-slide"));
        this.dots = showDots ? Array.from(this.dotsContainer.querySelectorAll(".carousel-dot")) : [];

        this.updateTransform();
    }

    bindEvents() {
        if (this.destroyed || this.items.length <= 1) return;

        const { signal } = this.abortController;

        // Delegação de evento para as setas
        if (this.showArrows) {
            this.carousel.addEventListener("click", (e) => {
                if (e.target.closest(".carousel-next")) {
                    this.next();
                    this.resetTimer();
                } else if (e.target.closest(".carousel-prev")) {
                    this.previous();
                    this.resetTimer();
                }
            }, { signal });
        }

        if (this.showDots && this.dotsContainer) {
            this.dotsContainer.addEventListener("click", (e) => {
                const dot = e.target.closest(".carousel-dot");
                if (dot) {
                    this.goTo(Number(dot.dataset.index));
                    this.resetTimer();
                }
            }, { signal });
        }

        this.carousel.setAttribute("tabindex", "0");
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
        }, { signal });

        if (this.autoplay) {
            this.carousel.addEventListener("mouseenter", () => this.stop(), { signal });
            this.carousel.addEventListener("mouseleave", () => this.start(), { signal });
            this.carousel.addEventListener("focusin", () => this.stop(), { signal });
            this.carousel.addEventListener("focusout", () => this.start(), { signal });
        }
    }

    goTo(index) {
        if (this.destroyed || this.items.length === 0) return;

        if (isNaN( Number(index))) return;

        let targetIndex = Math.max(0, Math.min(Number(index), this.items.length - 1));

        if (targetIndex === this.currentIndex) return;

        this.currentIndex = targetIndex;
        this.update();
    }

    next() {
        if (this.destroyed || this.items.length === 0) return;
        this.currentIndex = (this.currentIndex + 1) % this.items.length;
        this.update();
    }

    previous() {
        if (this.destroyed || this.items.length === 0) return;
        this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
        this.update();
    }

    updateTransform() {
        if (this.track) {
            this.track.style.transform = `translateX(-${this.currentIndex * 100}%)`;
        }
    }

    update() {
        if (this.destroyed || this.items.length === 0) return;

        this.updateTransform();

        if (this.showDots && this.dots.length > 0) {
            this.dots.forEach((dot, index) => {
                dot.classList.toggle("active", index === this.currentIndex);
            });
        }

        if (this.slides.length > 0) {
            this.slides.forEach((slide, index) => {
                const isActive = index === this.currentIndex;
                slide.setAttribute("aria-hidden", String(!isActive));
                slide.inert = !isActive; // Bloqueia o foco em elementos internos de slides inativos
            });

            this.triggerSlideAnimations(this.slides[this.currentIndex]);
        }
    }

    /**
     * Centraliza a reativação de animações respeitando a preferência por movimento reduzido
     */
    triggerSlideAnimations(currentSlide) {
        if (!currentSlide || this.prefersReducedMotion) return;

        const animatedParts = currentSlide.querySelectorAll(".origami-part");
        if (animatedParts.length === 0) return;

        animatedParts.forEach(part => {
            part.style.animation = "none";
        });

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (this.destroyed) return;
                animatedParts.forEach(part => {
                    part.style.animation = "";
                });
            });
        });
    }

    start() {
        if (this.destroyed || !this.autoplay || this.items.length <= 1 || this.timer) return;
        this.timer = setInterval(() => this.next(), this.interval);
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    resetTimer() {
        if (this.destroyed) return;
        this.stop();
        this.start();
    }

    destroy() {
        this.destroyed = true;
        this.stop();

        this.abortController.abort();

        if (this.carousel) {
            this.carousel.innerHTML = "";
            this.carousel.removeAttribute("tabindex");
            this.carousel.style.height = "";
        }

        this.slides = [];
        this.dots = [];
        this.track = null;
        this.dotsContainer = null;
        this.items = [];
    }
}