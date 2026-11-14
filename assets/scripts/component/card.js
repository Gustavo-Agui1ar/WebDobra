export default class CardFactory {
  
  DEFAULT_IMAGE = "../assets/imgs/logo.svg";

  ICONS = {
    category: "fa-folder-open",
    origami: "fa-shapes",
    time: "fa-clock",
    steps: "fa-list-ol",
    empty: "fa-box-open",
  };

  createIcon(name) {
    const icon = document.createElement("i");
    icon.className = `fa-solid ${name}`;
    icon.setAttribute("aria-hidden", "true");
    return icon;
  }

  createMetaItem(iconName, text) {
    const item = document.createElement("span");
    item.className = "card-meta-item";
    item.append(this.createIcon(iconName), text);
    return item;
  }

  createMediaWrapper(imagePath, altText) {
    const figure = document.createElement("figure");
    figure.className = "card-image-wrapper";

    const img = document.createElement("img");
    img.alt = altText || "";
    img.loading = "lazy";

    const hasPath = typeof imagePath === "string" && imagePath.trim().length > 0;
    const finalSrc = hasPath ? imagePath.trim() : this.DEFAULT_IMAGE;

    img.onerror = () => {
      img.onerror = null; 
      img.setAttribute("src", this.DEFAULT_IMAGE);
    };

    img.setAttribute("src", finalSrc);

    figure.appendChild(img);
    return figure;
  }

  create(item) {
    const article = document.createElement("article");
    article.className = "card";

    const link = document.createElement("a");
    link.className = "card-link";
    link.href = item.url || (item.id ? `?id=${item.id}` : "#");
    link.setAttribute("aria-label", item.title);

    const title = document.createElement("h3");
    title.className = "card-title";
    title.textContent = item.title;

    const subtitle = document.createElement("p");
    subtitle.className = "card-subtitle";
    subtitle.textContent = item.description;

    const children = [
      this.createMediaWrapper(item.image, item.title),
      title,
      subtitle,
    ];

    if (item.difficulty) {
      const badge = document.createElement("span");
      const diff = item.difficulty;
      badge.className = `badge ${diff}`;
      badge.textContent = item.difficultyLabel || diff;
      children.push(badge);
    }

    if (item.time) {
      children.push(this.createMetaItem(this.ICONS.time, item.time));
    }

    if (item.steps) {
      children.push(
        this.createMetaItem(this.ICONS.steps, `${item.steps} passos`)
      );
    }

    link.append(...children);
    article.append(link);
    return article;
  }
}