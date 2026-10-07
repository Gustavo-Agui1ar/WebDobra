
import OrigamiFold from "./origami_simple_fold.js";
import { injectCSS } from "./utils.js";

injectCSS("../css/carrosel.css");
export default class Carousel {

    constructor(element, items) {

        this.carousel = element;
        this.items = items;

        this.currentIndex = 0;

        this.autoplay =
            element.dataset.autoplay === "true";

        this.interval =
            Number(element.dataset.interval) || 5000;

        this.height =
            Number(element.dataset.height) || 400;

        this.showTitle =
            element.dataset.showTitle !== "false";

        this.showDescription =
            element.dataset.showDescription !== "false";

        this.showArrows =
            element.dataset.showArrows !== "false";

        this.showDots =
            element.dataset.showDots !== "false";

        this.render();
        this.start();
    }

    renderContent(item) {

        switch (item.type) {

            case "image":

                return `
                    <img
                        src="${item.image}"
                        alt="${item.title || ""}"
                    >
                `;

            case "html":

                return item.content;

            case "origami":

                return new OrigamiFold(item).render();

            default:

                return "";
        }
    }

    render() {

        this.carousel.style.height =
            `${this.height}px`;

        this.carousel.innerHTML = `
            <div class="carousel-track"></div>

            ${this.showArrows ? `
                <button
                    type="button"
                    class="carousel-prev"
                    aria-label="Slide anterior">

                    <i class="fa-solid fa-chevron-left"></i>

                </button>

                <button
                    type="button"
                    class="carousel-next"
                    aria-label="Próximo slide">

                    <i class="fa-solid fa-chevron-right"></i>

                </button>
            ` : ""}

            ${this.showDots ? `
                <nav
                    class="carousel-dots"
                    aria-label="Navegação do carrossel">
                </nav>
            ` : ""}
        `;

        this.track =
            this.carousel.querySelector(
                ".carousel-track"
            );

        this.dotsContainer =
            this.carousel.querySelector(
                ".carousel-dots"
            );

        this.items.forEach((item, index) => {

            const content =
                this.renderContent(item);

            this.track.insertAdjacentHTML(
                "beforeend",
                `
                <article class="carousel-slide">

                    ${content}

                    ${this.showTitle && item.title ? `
                        <div class="carousel-content">

                            <h2>
                                ${item.title}
                            </h2>

                            ${this.showDescription &&
                            item.description ? `
                                <p>
                                    ${item.description}
                                </p>
                            ` : ""}

                        </div>
                    ` : ""}

                </article>
                `
            );

            if (this.showDots) {

                this.dotsContainer.insertAdjacentHTML(
                    "beforeend",
                    `
                    <button
                        type="button"
                        class="carousel-dot"
                        data-index="${index}"
                        aria-label="Ir para slide ${index + 1}">
                    </button>
                    `
                );
            }
        });

        this.slides =
            this.track.querySelectorAll(
                ".carousel-slide"
            );

        this.dots =
            this.showDots
                ? this.dotsContainer.querySelectorAll(
                    ".carousel-dot"
                )
                : [];

        this.bindEvents();

        this.update();
    }

    bindEvents() {

        if (this.showArrows) {

            this.carousel
                .querySelector(".carousel-next")
                .addEventListener(
                    "click",
                    () => this.next()
                );

            this.carousel
                .querySelector(".carousel-prev")
                .addEventListener(
                    "click",
                    () => this.previous()
                );
        }

        if (this.showDots) {

            this.dots.forEach(dot => {

                dot.addEventListener(
                    "click",
                    () => {

                        this.currentIndex =
                            Number(dot.dataset.index);

                        this.update();
                    }
                );
            });
        }
    }

    next() {

        this.currentIndex =
            (this.currentIndex + 1) %
            this.items.length;

        this.update();
    }

    previous() {

        this.currentIndex =
            (
                this.currentIndex -
                1 +
                this.items.length
            ) %
            this.items.length;

        this.update();
    }

    update() {

        this.track.style.transform =
            `translateX(-${this.currentIndex * 100}%)`;

        if (this.showDots) {

            this.dots.forEach(
                (dot, index) => {

                    dot.classList.toggle(
                        "active",
                        index === this.currentIndex
                    );

                }
            );
        }

        if (
            this.slides &&
            this.slides.length > 0
        ) {

            const currentSlide =
                this.slides[this.currentIndex];

            const animatedParts =
                currentSlide.querySelectorAll(
                    ".origami-part"
                );

            animatedParts.forEach(part => {

                part.style.animation = "none";

                void part.offsetWidth;

                part.style.animation = "";

            });
        }
    }

    start() {

        if (!this.autoplay) {
            return;
        }

        setInterval(
            () => this.next(),
            this.interval
        );
    }
}