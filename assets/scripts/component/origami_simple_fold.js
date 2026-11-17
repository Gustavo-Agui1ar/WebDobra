/*global document */

function createOrigamiFold(config) {
    const cfg = config || {};

    function render() {
        const color = cfg.color || "#2196F3";
        const direction = cfg.direction || "vertical";
        const duration = cfg.duration || 3000;
        const foldLineColor = cfg.foldLineColor || "rgba(0,0,0,0.8)";
        const height = cfg.height || 200;
        const position = cfg.position || 50;
        const shadow = cfg.shadow !== false;
        const width = cfg.width || 300;

        let dirClass = "origami-horizontal";
        if (direction === "vertical") {
            dirClass = "origami-vertical";
        }

        let foldClass = "fold-part-2";
        if (position <= 50) {
            foldClass = "fold-part-1";
        }

        let shadowValue = "none";
        if (shadow) {
            shadowValue = "0 15px 25px rgba(0,0,0,0.3)";
        }

        const wrapper = document.createElement("div");
        wrapper.className = `origami-wrapper ${dirClass} ${foldClass}`;

        wrapper.style.setProperty("--o-width", `${width}px`);
        wrapper.style.setProperty("--o-height", `${height}px`);
        wrapper.style.setProperty("--o-pos", `${position}%`);
        wrapper.style.setProperty("--o-color", color);
        wrapper.style.setProperty("--o-duration", `${duration}ms`);
        wrapper.style.setProperty("--o-fold-color", foldLineColor);
        wrapper.style.setProperty("--o-shadow", shadowValue);

        const part1 = document.createElement("div");
        part1.className = "origami-part part-1";

        const part2 = document.createElement("div");
        part2.className = "origami-part part-2";

        wrapper.append(part1, part2);

        return wrapper;
    }

    return Object.freeze({
        render
    });
}

export default Object.freeze(createOrigamiFold);