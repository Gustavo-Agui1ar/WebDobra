/*global window, document, fetch, console, URLSearchParams, history */
import CardFactory from "./component/card.js";
import Header from "./component/header.js";

const headerComponent = new Header();
headerComponent.render("header", "category.html");

const cardFactory = new CardFactory();
let categoriesData = null;

const DOM = {
    backBtn: document.getElementById("back-to-categories"),
    categoriesContainer: document.getElementById("categories-container"),
    categoriesSection: document.getElementById("categories-section"),
    categoryTitle: document.getElementById("category-title"),
    origamisContainer: document.getElementById("origamis-container"),
    origamisSection: document.getElementById("origamis-section")
};

function wrapInListItem(element) {
    const li = document.createElement("li");
    li.appendChild(element);
    return li;
}

async function getCategoriesData() {
    if (categoriesData) {
        return categoriesData;
    }

    try {
        const response = await fetch("../assets/data/categories.json");
        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
            return [];
        }
        categoriesData = await response.json();
        return categoriesData;
    } catch (error) {
        console.error("Erro ao carregar dados:", error);
        return [];
    }
}

async function renderView() {
    const data = await getCategoriesData();
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get("cat");

    if (catParam) {
        showOrigamisSection(catParam, data);
        return;
    }

    showCategoriesMain(data);
}

function showCategoriesMain(data) {
    if (DOM.origamisSection) {
        DOM.origamisSection.classList.add("hidden");
    }
    if (DOM.categoriesSection) {
        DOM.categoriesSection.classList.remove("hidden");
    }

    if (DOM.categoriesContainer) {
        if (DOM.categoriesContainer.children.length === 0) {
            const fragment = document.createDocumentFragment();

            data.forEach(function (category) {
                const card = cardFactory.create({
                    ...category,
                    url: `?cat=${category.id}`
                });
                fragment.appendChild(wrapInListItem(card));
            });

            DOM.categoriesContainer.appendChild(fragment);
        }
    }
}

function showOrigamisSection(categoryId, data) {
    if (DOM.categoriesSection) {
        DOM.categoriesSection.classList.add("hidden");
    }
    if (DOM.origamisSection) {
        DOM.origamisSection.classList.remove("hidden");
    }

    const currentCategory = data.find(function (cat) {
        return cat.id.toLowerCase() === categoryId.toLowerCase();
    });

    if (DOM.categoryTitle) {
        if (currentCategory) {
            DOM.categoryTitle.textContent = currentCategory.title;
        } else {
            DOM.categoryTitle.textContent = `"${categoryId}" não encontrada`;
        }
    }

    if (DOM.origamisContainer) {
        DOM.origamisContainer.replaceChildren();

        if (
            !currentCategory ||
            !currentCategory.items ||
            currentCategory.items.length === 0
        ) {
            const emptyMsg = document.createElement("li");
            emptyMsg.className = "empty-state";
            emptyMsg.append(
                cardFactory.createIcon(cardFactory.ICONS.empty),
                " Nenhum origami cadastrado nesta categoria ainda."
            );
            DOM.origamisContainer.appendChild(emptyMsg);
            return;
        }

        const fragment = document.createDocumentFragment();

        currentCategory.items.forEach(function (item) {
            const card = cardFactory.create({
                ...item,
                url: item.url || `tutorial.html?origami=${item.id}`
            });
            fragment.appendChild(wrapInListItem(card));
        });

        DOM.origamisContainer.appendChild(fragment);
    }
}

if (DOM.categoriesContainer) {
    DOM.categoriesContainer.addEventListener("click", function (e) {
        const link = e.target.closest("a");
        if (!link) {
            return;
        }

        const href = link.getAttribute("href");
        if (href && href.startsWith("?cat=")) {
            e.preventDefault();
            history.pushState({}, "", href);
            renderView();
        }
    });
}

if (DOM.backBtn) {
    DOM.backBtn.addEventListener("click", function (e) {
        e.preventDefault();
        history.pushState({}, "", window.location.pathname);
        renderView();
    });
}

window.addEventListener("popstate", renderView);

renderView();