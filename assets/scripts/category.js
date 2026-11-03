let categoriesData = [];

const ICONS = {
  category: "fa-folder-open",
  origami: "fa-shapes",
  time: "fa-clock",
  steps: "fa-list-ol",
  empty: "fa-box-open",
};

function createIcon(name) {
  const icon = document.createElement("i");
  icon.className = `fa-solid ${name}`;
  icon.setAttribute("aria-hidden", "true");
  return icon;
}

function createMetaItem(iconName, text) {
  const item = document.createElement("span");
  item.className = "card-meta-item";
  item.append(createIcon(iconName), text);
  return item;
}

function createMediaWrapper(imagePath, iconName, altText) {
  const mediaWrapper = document.createElement("div");
  mediaWrapper.className = "card-image-wrapper";

  if (imagePath) {
    const img = document.createElement("img");
    img.src = imagePath;
    img.alt = altText || "";
    img.loading = "lazy";
    mediaWrapper.appendChild(img);
  } else {
    const placeholder = document.createElement("span");
    placeholder.className = "card-image-placeholder";
    placeholder.append(createIcon(iconName), altText);
    mediaWrapper.appendChild(placeholder);
  }

  return mediaWrapper;
}

async function loadCategories() {
  try {
    const response = await fetch("../assets/data/categories.json");
    if (!response.ok) return;
    categoriesData = await response.json();

    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get("cat");

    if (catParam) {
      showOrigamisSection(catParam);
    } else {
      showCategoriesMain();
    }
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
  }
}

function showCategoriesMain() {
  const categoriesContainer = document.getElementById("categories-container");
  const origamisSection = document.getElementById("origamis-section");

  if (origamisSection) origamisSection.classList.add("hidden");
  if (categoriesContainer) {
    categoriesContainer.classList.remove("hidden");
    categoriesContainer.replaceChildren();

    const fragment = document.createDocumentFragment();

    categoriesData.forEach((category) => {
      // Uso da tag <article> para cada card de categoria
      const card = document.createElement("article");
      card.className = "card";
      card.tabIndex = 0;
      card.setAttribute("role", "link");
      card.setAttribute("aria-label", `Categoria: ${category.title}`);

      const cardContent = document.createElement("div");
      cardContent.className = "card-content";

      const title = document.createElement("h2");
      title.className = "card-title";
      title.textContent = category.title;

      const subtitle = document.createElement("p");
      subtitle.className = "card-subtitle";
      subtitle.textContent = category.description;

      cardContent.append(title, subtitle);
      card.append(
        createMediaWrapper(category.image, category.icon || ICONS.category, category.title),
        cardContent,
      );

      const openCategory = () => {
        window.location.search = `?cat=${category.id}`;
      };
      card.addEventListener("click", openCategory);
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openCategory();
        }
      });

      fragment.appendChild(card);
    });

    categoriesContainer.appendChild(fragment);
  }
}

function showOrigamisSection(categoryId) {
  const categoriesContainer = document.getElementById("categories-container");
  const origamisSection = document.getElementById("origamis-section");
  const origamisContainer = document.getElementById("origamis-container");
  const categoryTitle = document.getElementById("category-title");

  if (categoriesContainer) categoriesContainer.classList.add("hidden");
  if (origamisSection) origamisSection.classList.remove("hidden");

  const currentCategory = categoriesData.find(
    (cat) => cat.id.toLowerCase() === categoryId.toLowerCase(),
  );

  if (categoryTitle) {
    categoryTitle.textContent = currentCategory
      ? `Origamis da Categoria: ${currentCategory.title}`
      : "Categoria não encontrada";
  }

  if (origamisContainer) {
    origamisContainer.replaceChildren();

    if (
      !currentCategory ||
      !currentCategory.items ||
      currentCategory.items.length === 0
    ) {
      const emptyMsg = document.createElement("p");
      emptyMsg.className = "empty-state";
      emptyMsg.append(
        createIcon(ICONS.empty),
        " Nenhum origami cadastrado nesta categoria ainda.",
      );
      origamisContainer.appendChild(emptyMsg);
      return;
    }

    const fragment = document.createDocumentFragment();

    currentCategory.items.forEach((item) => {
      // Uso da tag semântica <article> envelopada em um link <a> estruturado
      const card = document.createElement("a");
      card.href = item.url || `tutorial.html?origami=${item.id}`;
      card.className = "card";
      card.setAttribute("aria-label", `Tutorial de origami: ${item.title}`);

      const cardContent = document.createElement("div");
      cardContent.className = "card-content";

      const titleEl = document.createElement("h2");
      titleEl.className = "card-title";
      titleEl.textContent = item.title;

      const subtitleEl = document.createElement("p");
      subtitleEl.className = "card-subtitle";
      subtitleEl.textContent = item.description;

      const cardMeta = document.createElement("div");
      cardMeta.className = "card-meta";

      const badge = document.createElement("span");
      const diff = item.difficulty || "";
      badge.className = `badge ${diff}`;
      badge.textContent = item.difficultyLabel || diff;
      cardMeta.appendChild(badge);

      if (item.time) {
        cardMeta.appendChild(createMetaItem(ICONS.time, item.time));
      }

      if (item.steps) {
        cardMeta.appendChild(
          createMetaItem(ICONS.steps, `${item.steps} passos`),
        );
      }

      cardContent.append(titleEl, subtitleEl, cardMeta);
      card.append(
        createMediaWrapper(item.image, item.icon || ICONS.origami, item.title),
        cardContent,
      );

      fragment.appendChild(card);
    });

    origamisContainer.appendChild(fragment);
  }
}

const backBtn = document.getElementById("back-to-categories");
if (backBtn) {
  backBtn.addEventListener("click", () => {
    window.location.search = "";
  });
}

document.addEventListener("DOMContentLoaded", loadCategories);