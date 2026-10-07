export function injectCSS(relativePath) {
    const absoluteUrl = new URL(relativePath, import.meta.url).href;

    if (!document.querySelector(`link[href="${absoluteUrl}"]`)) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = absoluteUrl;
        document.head.appendChild(link);
    }
}

injectCSS("../css/carrosel.css");
injectCSS("../css/origami_teste.css");