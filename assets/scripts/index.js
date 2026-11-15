/*global document */
import CardFactory from "./component/card.js";
import Carousel from "./component/carrosel.js";
import Header from "./component/header.js";

const headerComponent = new Header();
headerComponent.render("header", "index.html");

const cardFactory = new CardFactory();

const cardsData = [
    {
        description: "Um clássico interativo. Pressione a parte traseira " +
        "para fazê-lo saltar!",
        difficulty: "facil",
        difficultyLabel: "Fácil",
        id: "frog",
        image: "assets/data/tutorials/frog/imgs/frog-step-23.png",
        steps: 23,
        time: "5 min",
        title: "Sapo de Papel",
        url: "pages/tutorial.html?origami=frog"
    },
    {
        description: "Uma bela flor de papel ideal para decoração. Ótimo " +
        "ponto de partida.",
        difficulty: "medio",
        difficultyLabel: "Médio",
        id: "flower",
        image: "assets/data/tutorials/flower/imgs/flower-step-30.png",
        steps: 30,
        time: "10 min",
        title: "Flor de Lótus",
        url: "pages/tutorial.html?origami=flower"
    },
    {
        description: "O famoso barquinho. Muito simples de fazer e " +
        "perfeito para ensinar crianças.",
        difficulty: "facil",
        difficultyLabel: "Fácil",
        id: "boat",
        image: "assets/data/tutorials/boat/imgs/boat-step-15.png",
        steps: 15,
        time: "3 min",
        title: "Barco Tradicional",
        url: "pages/tutorial.html?origami=boat"
    }
];

const bannerItems = [
    {
        description: "Pulando direto para o tutorial do sapo, você " +
        "aprenderá os fundamentos do origami de forma divertida e prática!",
        image: "assets/imgs/logo.svg",
        title: "Novo na arte do Origami? Comece com o Tutorial do Sapo!",
        type: "image",
        url: "pages/tutorial.html?origami=frog"
    },
    {
        description: "Clique aqui para explorar todas as nossas " +
        "categorias e tutoriais passo a passo!",
        image: "assets/imgs/logo.svg",
        title: "Descubra o Mundo dos Origamis",
        type: "image",
        url: "pages/category.html"
    },
    {
        description: "Descubra a rica história do origami e como essa " +
        "arte antiga se desenvolveu ao longo do tempo!",
        image: "assets/imgs/logo.svg",
        title: "Aprenda a História do Origami",
        type: "image",
        url: "pages/history.html"
    },
    {
        description: "Coloque seus conhecimentos à prova e domine a " +
        "arte do origami com o jogo Memorigami!",
        image: "assets/imgs/logo.svg",
        title: "Teste seus Conhecimentos sobre Origami e Dobre com Maestria",
        type: "image",
        url: "pages/game.html"
    }
];

function wrapInListItem(element) {
    const li = document.createElement("li");
    li.appendChild(element);
    return li;
}

function renderHomeTutorials() {
    const gridTutorials = document.querySelector("#grid-tutorials");
    if (!gridTutorials) {
        return;
    }

    gridTutorials.replaceChildren();
    const fragment = document.createDocumentFragment();

    cardsData.forEach(function (item) {
        const cardElement = cardFactory.create(item);
        fragment.appendChild(wrapInListItem(cardElement));
    });

    gridTutorials.appendChild(fragment);
}

function initCarousel() {
    const bannerElement = document.getElementById("banner-principal");
    if (bannerElement) {
        new Carousel(bannerElement, bannerItems);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    renderHomeTutorials();
    initCarousel();
});