import Carousel from "./carrosel.js";

const paper_color = "#2196F3"; 

const carousels = {
    "banner-principal": [
        {
            type: "origami",
            title: "Aprenda Origami",
            description: "Dobre o papel ao meio.",
            width: 300,
            height: 200,
            position: 50,
            direction: "vertical",
            color: paper_color,
            duration: 3000,
            foldLineColor: "black",
            shadow: true
        },
        {
            type: "origami",
            title: "Aprenda Origami",
            description: "Dobre o papel ao meio.",
            width: 150,
            height: 200,
            position:50,
            direction: "horizontal",
            color: paper_color,
            duration: 3000,
            foldLineColor: "black",
            shadow: true
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