import Carousel from "./carrosel.js";

const carousels = {
    "banner-principal": [
        {
            type: "image",
            image: "https://picsum.photos/id/1015/1200/600",
            title: "Montanhas",
            description: "Paisagem montanhosa."
        },
        {
            type: "image",
            image: "https://picsum.photos/id/1016/1200/600",
            title: "Floresta",
            description: "Área de mata."
        },
        {
            type: "html",
            title: "Aprenda Origami",
            description: "Dobre o papel passo a passo.",
            content: `
                <div class="origami-slide">
                    <div class="origami-paper">
                        <div class="paper-half paper-left"></div>
                        <div class="fold-line"></div>
                        <div class="paper-half paper-right"></div>
                    </div>
                </div>
            `
        }
    ]
};

document
    .querySelectorAll(".carousel")
    .forEach(carousel => {

        const items = carousels[carousel.id];

        if (!items) {
            return;
        }

        new Carousel(carousel, items);
    });