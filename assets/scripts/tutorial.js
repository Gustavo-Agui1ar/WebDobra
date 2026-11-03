import Carousel from "./carrosel.js";

const doc = {
  menuBtn: document.getElementById("mobile-menu-btn"),
  nav: document.getElementById("main-nav"),
  content: document.getElementById("tutorial-content"),
  stepsContainer: document.getElementById("tutorial-steps-container"),
  title: document.getElementById("tutorial-title"),
  description: document.getElementById("tutorial-description"),
  mainImage: document.getElementById("tutorial-main-image"),
  sourcesContainer: document.getElementById("tutorial-sources-container"),
  sourcesList: document.getElementById("tutorial-sources-list"),
};

const activeCarousels = new Map();

if (doc.menuBtn && doc.nav) {
  doc.menuBtn.addEventListener("click", () => {
    const isOpen = doc.nav.classList.toggle("open");
    doc.menuBtn.setAttribute("aria-expanded", String(isOpen));
  });
}

// ==========================================
// 4. RENDERIZAÇÃO
// ==========================================
function createCarouselItems(passo) {
  const items = [];
  
  if (passo.imagem) {
    items.push({
      type: "image",
      image: `../assets/data/${passo.imagem}`,
      title: `Passo ${passo.numero}`,
      description: passo.descricao
    });
  }

  if (passo.animacao) {
    items.push({
      type: passo.animacao.type,
      ...passo.animacao,
      title: `Passo ${passo.numero} (Animação)`,
      description: passo.descricao
    });
  }

  if (passo.video) {
    const videoPath = `../assets/data/${passo.video}`;
    items.push({
      type: "video",
      video: videoPath,
      src: videoPath, 
      title: `Passo ${passo.numero} (Vídeo)`,
      description: passo.descricao
    });
  }

  return items;
}

function createStepCard(passo, index) {
  const card = document.createElement("article");
  card.className = "step-card";

  const header = document.createElement("header");
  header.className = "step-content";
  header.innerHTML = `<h3>Passo ${passo.numero}</h3><p>${passo.descricao}</p>`;

  const figure = document.createElement("figure");
  figure.className = "step-media";
  figure.innerHTML = `
    <section class="carousel step-carousel" id="carousel-step-${index}"
      data-autoplay="false" data-height="350" data-show-title="false" 
      data-show-description="false" data-show-arrows="true" data-show-dots="true">
    </section>
  `;

  card.appendChild(header);
  card.appendChild(figure);
  return card;
}

function renderSources(fontes) {
  if (!fontes?.length) {
    doc.sourcesContainer.style.display = "none";
    return;
  }

  doc.sourcesContainer.style.display = "block";
  const fragment = document.createDocumentFragment();
  
  fontes.forEach(fonte => {
    const li = document.createElement("li");
    li.innerHTML = `<a href="${fonte.url}" target="_blank" rel="noopener noreferrer">${fonte.nome}</a>`;
    fragment.appendChild(li);
  });
  
  doc.sourcesList.replaceChildren(fragment);
}

// ==========================================
// 5. LAZY LOADING
// ==========================================
function initLazyCarousels(carouselsConfig) {
  if (!('IntersectionObserver' in window)) {
    carouselsConfig.forEach(({ id, items }) => {
      const el = document.getElementById(id);
      if (el) activeCarousels.set(id, new Carousel(el, items));
    });
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const { id } = entry.target;
        const config = carouselsConfig.find(c => c.id === id);
        if (config && !activeCarousels.has(id)) {
          activeCarousels.set(id, new Carousel(entry.target, config.items));
        }
        obs.unobserve(entry.target);
      }
    });
  }, { rootMargin: '200px 0px' });

  carouselsConfig.forEach(({ id }) => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
}

// ==========================================
// 6. CARREGAMENTO DO TUTORIAL
// ==========================================
async function loadTutorial() {
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('origami');

  if (!query || /[^a-zA-Z0-9_-]/.test(query)) return;

  try {
    const response = await fetch(`../assets/data/tutorials/${query}/${query}.json`);
    if (!response.ok) return;
    
    const data = await response.json();
    if (!data?.nome || !Array.isArray(data.passos)) return;

    doc.title.textContent = data.nome;
    doc.description.innerHTML = data.descricao;
    doc.mainImage.src = `../assets/data/${data.imagem}`;
    doc.mainImage.alt = `Imagem final do ${data.nome}`;
    doc.mainImage.style.display = "inline-block";

    // Preencher o card "O que precisa?"
    document.getElementById("meta-folha").textContent = data.folha || "Não informado";
    document.getElementById("meta-tempo").textContent = data.tempo || "Não informado";

    const diffContainer = document.getElementById("meta-dificuldade");
    if (data.dificuldade) {
      const diffClass = data.dificuldade.toLowerCase();
      const diffText = data.dificuldade.charAt(0).toUpperCase() + data.dificuldade.slice(1);
      diffContainer.innerHTML = `<span class="badge ${diffClass}">${diffText}</span>`;
    } else {
      diffContainer.textContent = "Não informado";
    }

    const fragment = document.createDocumentFragment();
    const carouselsToInit = [];

    const videoContainer = document.getElementById("tutorial-video-container");

    if (videoContainer) {
      if (data.video_completo) {
        videoContainer.innerHTML = `
          <div class="video-wrapper">
            <iframe 
              src="${data.video_completo}" 
              title="Vídeo Tutorial Completo - ${data.nome}" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen>
            </iframe>
          </div>
        `;
        videoContainer.style.display = "block";
      } else {
        videoContainer.style.display = "none";
      }
    }

    data.passos.forEach((passo, index) => {
      fragment.appendChild(createStepCard(passo, index));
      carouselsToInit.push({
        id: `carousel-step-${index}`,
        items: createCarouselItems(passo)
      });
    });

    doc.stepsContainer.replaceChildren(fragment);
    initLazyCarousels(carouselsToInit);
    renderSources(data.fontes);
  } catch (error) {
    console.error("Erro ao carregar tutorial:", error);
  }
}

document.addEventListener("DOMContentLoaded", loadTutorial);