import scratchblockCore from '@scratch2latex/scratch-core/scratchblock'
import { ObjetMathalea2D } from '../lib/2d/ObjetMathalea2D'
import { context } from './context'

export function scratchblock(
  stringLatex: string,
  style = 'block',
  useHighContrast = false,
) {
  if (context.isHtml) {
    return scratchblockCore(stringLatex, style, useHighContrast)
  }
  return stringLatex
}
/**
 * Représente une boussole pour les 4 orientations possible dans Scratch
 * Il n'y a pas d'arguments, c'est un objet statique qui a sa méthode svg() et sa méthode tikz()
 * Il est difficile de modifier la taille de l'objet à cause du texte des blocks
 * @class
 * @author Jean-claude Lhote, Sylvain Chambon, Sébastien Lozano
 * @return {RoseDesVents}
 */
export class RoseDesVents extends ObjetMathalea2D {
  constructor() {
    super()
    this.bordures = [-6, -6, 6, 6]
  }

  svg(coeff: number) {
    function cadran() {
      let group = '<g>\n'
      for (let alpha = 0; alpha < 360; alpha += 15) {
        group += `<line x1="${115 + Math.round(45 * Math.cos((alpha * Math.PI) / 180))}" y1="${115 + Math.round(45 * Math.sin((alpha * Math.PI) / 180))}" x2="${115 + Math.round(35 * Math.cos((alpha * Math.PI) / 180))}" y2="${115 + Math.round(35 * Math.sin((alpha * Math.PI) / 180))}" stroke="white" />\n`
      }
      return group + '</g>\n'
    }

    function sorientera(angle: number) {
      return `<g id="sorientera${angle}" style="transform: scale(0.675)">
<g transform="translate(0 0)">
<g transform="translate(2 1)">
<path class="sb3-motion" d="M 0 4
      A 4 4 0 0 1 4 0
      H 12 c 2 0 3 1 4 2
      l 4 4
      c 1 1 2 2 4 2
      h 12
      c 2 0 3 -1 4 -2
      l 4 -4
      c 1 -1 2 -2 4 -2
      L 139 0
      a 4 4 0 0 1 4 4 L 143 44 a 4 4 0 0 1 -4 4 L 48 48 c -2 0 -3 1 -4 2 l -4 4 c -1 1 -2 2 -4 2 h -12 c -2 0 -3 -1 -4 -2 l -4 -4 c -1 -1 -2 -2 -4 -2 L 4 48 a 4 4 0 0 1 -4 -4 Z"></path>
      <text class="sb3-label sb3-" x="0" y="13" transform="translate(8 17)">s'orienter</text>
      <text class="sb3-label sb3-" x="0" y="13" transform="translate(78 17)">à</text>
      <g transform="translate(95 8)">
      <rect rx="16" ry="16" x="0" y="0" width="40" height="32" class="sb3-motion sb3-input sb3-input-number"></rect>
      <text class="sb3-label sb3-literal-number" x="0" y="13" transform="translate(11 9)">${angle}</text>
      </g>
      </g>
      </g>
      </g>`
    }

    const code = `<g class="roseDesVents" id=roseDesVents${this.id} transform="translate(-115 -115) scale(${coeff / 20})">
<rect x="50" y="50" rx="4" ry="4" width="130" height="130" fill="#4c97ff" stroke="#3373cc"/>
<circle r="50" cx="115" cy="115" fill="#3373cc" stroke="#3373cc"/>
${cadran()}
<clipPath id="monClip">
    <rect x="115" y="50" width="50" height="65"></rect>
  </clipPath>
  <circle r="50" cx="115" cy="115" id="quartDeCercle" fill-opacity="0.3" fill="white" clip-path="url(#monClip)"/>
  <defs>
  <g id="direction" x="0" y="0">
  <circle r="10" cx="0" cy="0" fill="white"/>
  <path d="M -6 3 h 7 v 3 l 5 -6 l -5 -6 v 3 h -7 v 6 z" fill="#4c97ff" />
  </g>
 </defs>
 <use href="#direction" x="165" y="115" />
 <use href="#direction" transform="rotate(-90 115 65)" x="115" y="65" />
 <use href="#direction" transform="rotate(-180 65 115)" x="65" y="115" />
 <use href="#direction" transform="rotate(90 115 165)" x="115" y="165" />
  <g transform="translate(65 0)">${sorientera(0)}</g>
<g transform="translate(230 65) rotate(90)">${sorientera(90)}</g>
<g transform="translate(165 230) rotate(180)">${sorientera(180)}</g>
<g transform="translate(0 165) rotate(-90)">${sorientera(-90)}</g>
</g>
`
    return code
  }

  tikz() {
    const code = `\\node (centre) {
    \\begin{tikzpicture}[baseline, scale=0.5]
              \\definecolor{scratchBlue}{RGB}{76, 151, 255}
               \\definecolor{scratchBlue2}{RGB}{51, 115, 204}
                \\pgfmathsetmacro{\\rayon}{1.5}
                \\coordinate (O) at (2,2);
                \\draw[scratchBlue2,thin,fill=scratchBlue,rounded corners] (0,0) rectangle (4,4);
                \\fill[scratchBlue2] (O) circle (\\rayon);
                \\fill[white,opacity=0.3] (O) -- ++(\\rayon,0) arc [start angle=0, end angle=90, radius=\\rayon cm] -- (O);
                \\draw[white,thick] ($(O)+(0,\\rayon)$) -- (O) -- ($(O)+(\\rayon,0)$) coordinate (dir90);
                \\fill[white] (O) circle (2pt);
                \\foreach \\angle in {0,15,...,345} {
      \\coordinate (A) at ($(O)+(\\angle:1.3)$);
                    \\draw[white,thin] ($(O)!0.8!(A)$) -- (A);
      }
                \\fill[white] (dir90) circle (10pt);
                \\node[scratchBlue,fill=scratchBlue,single arrow,scale=0.2] at (dir90) {aa};
                \\coordinate (N) at (2,\\rayon+2);
                \\fill[white] (N) circle (10pt);
                 \\node[scratchBlue,fill=scratchBlue,single arrow,scale=0.2, rotate=90] at (N) {aa};
                   \\coordinate (S) at (2,2-\\rayon);
                   \\fill[white] (S) circle (10pt);
                 \\node[scratchBlue,fill=scratchBlue,single arrow,scale=0.2, rotate=-90] at (S) {aa};
                   \\coordinate (W) at (2-\\rayon,2);
                   \\fill[white] (W) circle (10pt);
                 \\node[scratchBlue,fill=scratchBlue,single arrow,scale=0.2, rotate=180] at (W) {aa};
                 
            \\end{tikzpicture}
    };
        \\node[above] at (centre.north){
    \\begin{scratch}[scale=0.5]
                \\blockmove{s'orienter à \\ovalnum{$0$}}
            \\end{scratch}
      };
        \\node[above,rotate=-90] at (centre.east) {
      \\begin{scratch}[scale=0.5]
                \\blockmove{s'orienter à \\ovalnum{$90$}}
            \\end{scratch}
        };
        \\node[above, rotate=180] at (centre.south){
        \\begin{scratch}[scale=0.5]
                \\blockmove{s'orienter à \\ovalnum{$180$}}
            \\end{scratch}
          };
        \\node[above,rotate=90] at (centre.west){
          \\begin{scratch}[scale=0.5]
                \\blockmove{s'orienter à \\ovalnum{$-90$}}
            \\end{scratch}
            };`
    return code
  }
}

/**
 * Crée une instance de RoseDesVents (une boussole Scratch)
 * Il n'y a pas d'arguments, c'est un objet statique qui a sa méthode svg() et sa méthode tikz()
 * Il est difficile de modifier la taille de l'objet à cause du texte des blocks
 * @returns {RoseDesVents}
 */
export function roseDesVents() {
  return new RoseDesVents()
}
