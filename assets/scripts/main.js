import Carousel from "./carrosel.js";

document.addEventListener("DOMContentLoaded", () => {
  const bannerElement = document.getElementById("banner-principal");

  if (bannerElement) {
    const bannerItems = [
        {
            type: "image",
            image: "assets/imgs/logo.svg",
            url: "pages/tutorial.html?origami=frog",
            title: "Novo na arte do Origami? Comece com o Tutorial do Sapo!",
            description: "Pulando direto para o tutorial do sapo, você aprenderá os fundamentos do origami de forma divertida e prática!"
        },
        {
            type: "image",
            image: "assets/imgs/logo.svg",
            url: "pages/category.html",
            title: "Descubra o Mundo dos Origamis",
            description: "Clique aqui para explorar todas as nossas categorias e tutoriais passo a passo!"
        },
        {
            type: "image",
            image: "assets/imgs/logo.svg",
            url: "pages/history.html",
            title: "Aprenda a História do Origami",
            description: "Descubra a rica história do origami e como essa arte antiga se desenvolveu ao longo do tempo!"
        },
        {
            type: "image",
            image: "assets/imgs/logo.svg",
            url: "pages/game.html",
            title: "Teste seus Conhecimentos sobre Origami e Dobre com Maestria",
            description: "Coloque seus conhecimentos à prova e domine a arte do origami com o jogo Memorigami!"
        }
    ];

    new Carousel(bannerElement, bannerItems);
  }
});