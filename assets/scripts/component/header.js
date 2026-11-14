export default class Header {
  constructor() {
    this.isInsidePages = window.location.pathname.includes("/pages/");

    const rootPath = this.isInsidePages ? "../" : "./";
    const pagesPath = this.isInsidePages ? "./" : "./pages/";

    this.homeUrl = `${rootPath}index.html`;
    this.logoSrc = `${rootPath}assets/imgs/logo.svg`;

    this.navItems = [
      { label: "Início", url: this.homeUrl, key: "index.html" },
      { label: "Sobre", url: `${pagesPath}about.html`, key: "about.html" },
      { label: "Memorigami", url: `${pagesPath}game.html`, key: "game.html" },
      { label: "Mapa", url: `${pagesPath}map.html`, key: "map.html" },
      { label: "Categorias", url: `${pagesPath}category.html`, key: "category.html" },
      { label: "Histórias", url: `${pagesPath}history.html`, key: "history.html" },
    ];
  }

  render(targetElement = "header", activeKey) {
    const header = typeof targetElement === "string" 
      ? document.querySelector(targetElement) 
      : targetElement;

    if (!header) return;

    const currentPath = activeKey || window.location.pathname.split("/").pop() || "index.html";

    // 1. Logo Clicável (a.logo > img + h1)
    const logoLink = document.createElement("a");
    logoLink.className = "logo";
    logoLink.href = this.homeUrl;
    logoLink.setAttribute("aria-label", "Página Inicial - WebDobra");

    const logoImg = document.createElement("img");
    logoImg.src = this.logoSrc;
    logoImg.alt = "Logo WebDobra";

    const titleH1 = document.createElement("h1");
    titleH1.textContent = "WebDobra";

    logoLink.append(logoImg, titleH1);

    // 2. Botão Menu Mobile
    const menuBtn = document.createElement("button");
    menuBtn.className = "menu-toggle";
    menuBtn.id = "mobile-menu-btn";
    menuBtn.setAttribute("aria-label", "Abrir menu");
    menuBtn.setAttribute("aria-expanded", "false");

    const menuIcon = document.createElement("i");
    menuIcon.className = "fa-solid fa-bars";
    menuIcon.setAttribute("aria-hidden", "true");
    menuBtn.appendChild(menuIcon);

    // 3. Navegação
    const nav = document.createElement("nav");
    nav.id = "main-nav";
    nav.setAttribute("aria-label", "Navegação Principal");

    const ul = document.createElement("ul");

    this.navItems.forEach((item) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = item.url;
      a.textContent = item.label;

      const isActive = item.key.toLowerCase() === currentPath.toLowerCase();
      if (isActive) {
        a.className = "active";
      }

      li.appendChild(a);
      ul.appendChild(li);
    });

    nav.appendChild(ul);

    this.bindMenuEvent(menuBtn, nav);

    header.replaceChildren(logoLink, menuBtn, nav);
  }

  bindMenuEvent(menuBtn, nav) {
    menuBtn.addEventListener("click", () => {
      const isExpanded = menuBtn.getAttribute("aria-expanded") === "true";
      menuBtn.setAttribute("aria-expanded", String(!isExpanded));
      nav.classList.toggle("open");
    });
  }
}