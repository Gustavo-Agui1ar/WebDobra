// origami_simple_fold.js

export default class OrigamiFold {
    constructor(config) {
        this.config = config;
    }

    render() {
        const {
            width = 300,
            height = 200,
            position = 50,
            direction = "vertical",
            color = "#2196F3",
            duration = 3000,
            foldLineColor = "rgba(0,0,0,0.8)",
            shadow = true
        } = this.config;

        const isVertical = direction === "vertical";
        const dirClass = isVertical ? "origami-vertical" : "origami-horizontal";

        // LÓGICA NOVA: Descobre qual é o menor lado baseado na porcentagem (position)
        // Se position for menor ou igual a 50%, a Parte 1 é a menor e ela quem vai dobrar.
        // Se for maior que 50%, a Parte 2 é a menor.
        const foldClass = position <= 50 ? "fold-part-1" : "fold-part-2";

        const styleVars = `
            --o-width: ${width}px;
            --o-height: ${height}px;
            --o-pos: ${position}%;
            --o-color: ${color};
            --o-duration: ${duration}ms;
            --o-fold-color: ${foldLineColor};
            --o-shadow: ${shadow ? '0 15px 25px rgba(0,0,0,0.3)' : 'none'};
        `;

        // Retorna a estrutura com a classe indicando quem dobra
        return `
            <div class="origami-wrapper ${dirClass} ${foldClass}" style="${styleVars}">
                <div class="origami-part part-1"></div>
                <div class="origami-part part-2"></div>
            </div>
        `;
    }
}