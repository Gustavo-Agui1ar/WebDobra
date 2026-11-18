import Header from "./component/header.js";

new Header().render("header", "game.html");

const $ = (id) => document.getElementById(id);

const DOM = {
    hero: $("hero-section"),
    game: $("game-section"),
    titulo: $("titulo-tabuleiro"),
    descricao: $("origami-descricao"),
    linkTutorial: $("link-tutorial"),
    board: $("game-board"),
    tentativas: $("tentativas-count"),
    btnTentar: $("btn-tentar"),
    btnReiniciar: $("btn-reiniciar"),
    btnVoltar: $("btn-voltar"),
};

const DATA_PATH = "../assets/data";

const estado = {
    selecao: [],
    origami: null,
    slug: "",
    tentativas: 3,
    bloqueado: false,
    modo: "facil",
    controller: null,
};

const obterPassos = (origami) => origami?.passos ?? origami?.steps ?? origami?.etapas ?? [];

const embaralhar = (arr) => {
    const copia = [...arr];
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
};

const resolverImg = (slug, img) => {
    if (!img) return "";
    if (/^(https?:|\.\.|\/)/.test(img)) return img;
    const limpo = img.replace(/^\.\//, "");
    if (limpo.startsWith("tutorials/")) return `${DATA_PATH}/${limpo}`;
    const base = `${DATA_PATH}/tutorials/${slug}`;
    return limpo.startsWith("imgs/") ? `${base}/${limpo}` : `${base}/imgs/${limpo}`;
};

const fetchJSON = async (url, signal) => {
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`Falha ao carregar: ${url}`);
    return res.json();
};

function alternarTelas(exibirJogo) {
    DOM.hero?.classList.toggle("hidden", exibirJogo);
    DOM.game?.classList.toggle("hidden", !exibirJogo);
}

function exibirMensagem(texto) {
    const p = document.createElement("p");
    p.textContent = texto;
    DOM.board?.replaceChildren(p);
}

function atualizarUI() {
    const total = obterPassos(estado.origami).length;

    DOM.board?.querySelectorAll(".game-card").forEach((card) => {
        const idx = estado.selecao.findIndex((item) => item.card === card);
        card.classList.toggle("selected", idx !== -1);
        card.querySelector(".card-badge").textContent = idx !== -1 ? idx + 1 : "";
    });

    if (DOM.tentativas) DOM.tentativas.textContent = estado.tentativas;
    if (DOM.btnTentar) DOM.btnTentar.disabled = estado.selecao.length !== total || total === 0;
}

function configurarReiniciar(visivel, texto = "", icone = "", acao = null) {
    const btn = DOM.btnReiniciar;
    if (!btn) return;

    btn.classList.toggle("hidden", !visivel);
    btn.onclick = visivel ? acao : null;
    if (visivel) {
        const iconEl = btn.querySelector("i");
        const spanEl = btn.querySelector("span");
        if (iconEl) iconEl.className = icone;
        if (spanEl) spanEl.textContent = texto;
    }
}

function criarCard(passo) {
    const texto = passo.texto ?? passo.text ?? passo.descricao ?? "";
    const caminhoImg = passo.img ?? passo.image ?? passo.imagem ?? passo.src;

    const card = Object.assign(document.createElement("button"), {
        type: "button",
        className: "game-card",
    });

    const img = Object.assign(document.createElement("img"), {
        src: resolverImg(estado.slug, caminhoImg),
        alt: `Passo ${passo.id}: ${texto}`,
        className: "card-image",
    });

    const badge = Object.assign(document.createElement("span"), {
        className: "card-badge",
    });

    card.append(img, badge);

    card.onclick = () => {
        if (estado.bloqueado) return;
        const existe = estado.selecao.some((item) => item.card === card);
        estado.selecao = existe
            ? estado.selecao.filter((item) => item.card !== card)
            : [...estado.selecao, { card, id: passo.id }];
        atualizarUI();
    };

    return card;
}

/**
 * Renderiza a descrição de forma segura via DOM, sem uso de innerHTML.
 */
function renderizarDescricao(htmlStr) {
    if (!DOM.descricao) return;
    DOM.descricao.replaceChildren();

    if (!htmlStr) {
        DOM.descricao.style.display = "none";
        return;
    }

    const doc = new DOMParser().parseFromString(htmlStr, "text/html");
    const paragraphs = doc.querySelectorAll("p");

    if (paragraphs.length > 0) {
        paragraphs.forEach((p) => {
            const pEl = document.createElement("p");
            pEl.textContent = p.textContent;
            DOM.descricao.append(pEl);
        });
    } else {
        const pEl = document.createElement("p");
        pEl.textContent = doc.body.textContent;
        DOM.descricao.append(pEl);
    }

    DOM.descricao.style.display = "block";
}

async function iniciarRodada(modo, sortearNovo = true) {
    exibirMensagem("Carregando dobraduras...");
    Object.assign(estado, { selecao: [], tentativas: 3, bloqueado: true, modo });
    configurarReiniciar(false);
    atualizarUI();

    if (sortearNovo || !estado.origami) {
        estado.controller?.abort();
        estado.controller = new AbortController();
        const { signal } = estado.controller;

        try {
            const indice = await fetchJSON(`${DATA_PATH}/index.json`, signal);
            const lista = indice[modo] || indice.facil;
            estado.slug = lista[Math.floor(Math.random() * lista.length)];
            estado.origami = await fetchJSON(`${DATA_PATH}/tutorials/${estado.slug}/${estado.slug}.json`, signal);
        } catch (erro) {
            if (erro.name !== "AbortError") {
                console.error(erro);
                exibirMensagem("Erro ao carregar os cards. Tente novamente mais tarde.");
            }
            return;
        }
    }

    if (!DOM.board) return;
    const passos = obterPassos(estado.origami);

    if (!passos.length) {
        console.error("Estrutura do JSON inesperada:", estado.origami);
        exibirMensagem("Nenhuma etapa encontrada para este origami.");
        return;
    }

    estado.bloqueado = false;

    if (DOM.titulo) {
        const label = modo[0].toUpperCase() + modo.slice(1);
        const nome = estado.origami.nome ?? estado.origami.title ?? estado.slug;
        DOM.titulo.textContent = `${nome} (${label})`;
    }

    const descText = estado.origami.descricao ?? estado.origami.description ?? estado.origami.resumo ?? "";
    renderizarDescricao(descText);

    if (DOM.linkTutorial) {
        DOM.linkTutorial.href = `tutorial.html?origami=${estado.slug}`;
        DOM.linkTutorial.style.display = "inline-flex";
    }

    const passosNumerados = passos.map((p, i) => ({
        ...p,
        id: Number(p.id ?? p.step ?? i + 1),
    }));

    DOM.board.replaceChildren(...embaralhar(passosNumerados).map(criarCard));
    atualizarUI();
}

DOM.btnTentar?.addEventListener("click", () => {
    const total = obterPassos(estado.origami).length;
    if (estado.bloqueado || estado.selecao.length !== total) return;

    const primeiroErro = estado.selecao.findIndex((item, i) => item.id !== i + 1);
    const acertos = primeiroErro === -1 ? total : primeiroErro;
    const nome = estado.origami.nome ?? estado.origami.title ?? "origami";

    estado.bloqueado = true;
    estado.selecao.forEach((item, i) => item.card.classList.add(i < acertos ? "correct" : "error"));

    if (acertos === total) {
        setTimeout(() => {
            alert(`Parabéns! Você completou a sequência do "${nome}" perfeitamente! 🎉`);
            configurarReiniciar(true, "Próximo Origami", "fa-solid fa-arrow-right", () =>
                iniciarRodada(estado.modo, true)
            );
        }, 200);
        return;
    }

    estado.tentativas--;
    atualizarUI();

    setTimeout(() => {
        estado.selecao.forEach((item) => item.card.classList.remove("correct", "error"));
        estado.selecao = estado.selecao.slice(0, acertos);
        atualizarUI();

        if (estado.tentativas <= 0) {
            alert(`Fim de Jogo! Suas tentativas acabaram no "${nome}". 💔`);
            configurarReiniciar(true, "Tentar Novamente", "fa-solid fa-rotate-right", () =>
                iniciarRodada(estado.modo, false)
            );
        } else {
            estado.bloqueado = false;
        }
    }, 1500);
});

document.querySelectorAll(".mode-card").forEach((botao) => {
    botao.addEventListener("click", () => {
        const modo = botao.dataset.mode || "facil";
        iniciarRodada(modo, true);
        alternarTelas(true);
    });
});

DOM.btnVoltar?.addEventListener("click", () => {
    estado.controller?.abort();
    alternarTelas(false);
    exibirMensagem("Os cards do jogo aparecerão aqui...");
    if (DOM.titulo) DOM.titulo.textContent = "";
    if (DOM.descricao) {
        DOM.descricao.replaceChildren();
        DOM.descricao.style.display = "none";
    }
    if (DOM.linkTutorial) {
        DOM.linkTutorial.href = "#";
        DOM.linkTutorial.style.display = "none";
    }
    Object.assign(estado, { selecao: [], origami: null });
    configurarReiniciar(false);
    atualizarUI();
});