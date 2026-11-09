import katex from 'katex'
import { ObjetMathalea2D } from '../lib/2d/ObjetMathalea2D'
import { normaliseOrientation } from '../lib/2d/utilitairesGeometriques'
import {
  buildDataKeyboardFromStyle,
  convertClasseToString,
} from '../lib/interactif/claviers/keyboard'
import { MetaInteractif2dElement } from '../lib/customElements/MetaInteractif2dElement'
import { cubeIsoInteractionMarkup } from '../lib/2d/figures2d/Shape3d'
import { reflectionAnimationMarkup } from '../lib/2d/Figures2D'
import { fractionCliquableInteractionMarkup } from '../lib/customElements/FractionCliquableElement'
import type {
  MetaInteractif2dData,
  NestedObjetMathalea2dArray,
  ObjetDivLatex,
} from '../types/2d'
import { context } from './context'
const buildDataKeyboardString = (style = '') => {
  const blocks = buildDataKeyboardFromStyle(style)
  return blocks.join(' ')
}
export type Mathalea2dDisplay = 'block' | 'inline' | 'inline-block'

export type Mathalea2dLayoutOptions = {
  display?: Mathalea2dDisplay
  center?: boolean
}

export type Mathalea2DOptions = {
  xmin?: number
  ymin?: number
  xmax?: number
  ymax?: number
  pixelsParCm?: number
  scale?: number
  zoom?: number
  vraieGrandeur?: boolean
  optionsTikz?: string | string[]
  mainlevee?: boolean
  amplitude?: number
  display?: Mathalea2dDisplay
  center?: boolean
  id?: string
  usePgfplots?: boolean
  centerLatex?: boolean
  pgfplotsXTickDistance?: number
  pgfplotsYTickDistance?: number
  pgfplotsMinorXTickNum?: number
  pgfplotsMinorYTickNum?: number
  /** Repère orthonormé en LaTeX (`axis equal image`), quelle que soit la fenêtre. */
  pgfplotsAxisEqual?: boolean
  /**
   * Alternative textuelle de la figure, en texte brut (sans `$` ni LaTeX), qui
   * remplace pour un lecteur d'écran le tracé et ses étiquettes. HTML uniquement.
   * Voir documentation/developpement/auteurs-exercices/rediger-un-exercice.md
   */
  description?: string
  /** Figure sans information, masquée aux technologies d'assistance. `description` a priorité. */
  decorative?: boolean
}

const innerWrapperStyle = 'position: relative; display: inline-block'

/**
 * Valeur d'attribut HTML pour un texte brut. `sp()` renvoie `&nbsp;` : il devient
 * une vraie espace insécable au lieu d'être lu tel quel. Le `$` est encodé pour
 * rester invisible des traitements qui cherchent des formules dans le HTML.
 */
const echappeAttribut = (texte: string) =>
  texte
    .replaceAll('&nbsp;', '\u00A0')
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('$', '&#36;')

/*
  MathALEA2D
 @name      mathalea2d
 @author    Rémi Angot et Jean-claude Lhote
 @license   MIT License - CC-BY-SA
 @homepage  https://coopmaths.fr/mathalea2d.html
 */

// Remarque : la définition concrète de ObjetMathalea2D vit désormais dans
// src/lib/2d/ObjetMathalea2D.ts ; on n'effectue plus de réexport runtime ici
// (cela évite des dépendances circulaires).
// export { ObjetMathalea2D } from '../lib/2d/ObjetMathalea2D'

/**
 * mathalea2d(xmin,xmax,ymin,ymax,objets)
 *
 * @author Rémi Angot
 *
 *
 * Le paramètre optionsTikz est un tableau de strings contenant exclusivement des options Tikz à ajouter
 * si scale existe autre que 1 il faut que le code reste comme avant
 * sinon on ajoute scale quoi qu'il en soit quitte à ce que xscale et yscale viennent s'ajouter
 * de cette manière d'autres options Tikz pourront aussi être ajoutées
 * si il n'y a qu'une optionsTikz on peut passer un string
 * @param {object} options
 *  @param {number} [options.xmin = 0]
 *  @param {number} [options.ymin = 0]
 *  @param {number} [options.xmax = 15]
 *  @param {number} [options.ymax = 6]
 *  @param {number?} [options.pixelsParCm]
 *  @param {number?} [options.scale = 1]
 *  @param {number?} [options.zoom = 1]
 *  @param {boolean?} [options.vraieGrandeur = false] En sortie Typst, empêche la figure de se réduire pour tenir dans une colonne étroite (à réserver aux figures de construction/mesure, où la taille imprimée doit rester fidèle aux longueurs indiquées ; une figure purement illustrative peut au contraire se réduire pour tenir dans la mise en page).
 *  @param {string|string[]?} [options.optionsTikz = []]
 *  @param {boolean?} [options.mainlevee]
 *  @param {number?} [options.amplitude]
 *  @param {'block'|'inline'|'inline-block'?} [options.display = 'block']
 *  @param {boolean?} [options.center]
 *  @param {string?} [options.id = '']
 *  @param {string?} [options.description] Alternative textuelle de la figure, en texte brut.
 *  @param {boolean?} [options.decorative = false] Masque aux technologies d'assistance une figure sans information.
 * @param {(ObjetMathalea2D|ObjetMathalea2D[])[]} objets
 */
export function mathalea2d(
  {
    xmin = 0,
    ymin = 0,
    xmax = 15,
    ymax = 6,
    pixelsParCm = 20,
    scale = 1,
    zoom = 1,
    vraieGrandeur = false,
    optionsTikz = [],
    mainlevee = false,
    amplitude = 1,
    display,
    center = false,
    id = '', // L'id peut-être utile pour des animations, c'est celui du svg. Le div englobant aura un id en M2D + id
    usePgfplots = false,
    centerLatex = false,
    pgfplotsXTickDistance = 2,
    pgfplotsYTickDistance = 2,
    pgfplotsMinorXTickNum = 1,
    pgfplotsMinorYTickNum = 1,
    pgfplotsAxisEqual = false,
    description = '',
    decorative = false,
  }: Mathalea2DOptions = {},
  ...objets: NestedObjetMathalea2dArray
) {
  // Sans espace ordinaire superflue, mais les espaces insécables restent (`\s` les absorberait).
  const descriptionNette = description.replace(/[ \t\r\n]+/g, ' ').trim()
  // Les étiquettes sont déjà dans la description ou sans intérêt : les masquer
  // évite une double lecture. Le conteneur n'est jamais masqué, il porte les
  // champs de réponse de `MetaInteractif2d`, qui ne reçoivent pas cet attribut.
  const attributEtiquette =
    descriptionNette !== '' || decorative ? ' aria-hidden="true"' : ''
  const ajouteCodeHtml = (
    mainlevee: boolean,
    objets: ObjetMathalea2D | NestedObjetMathalea2dArray | ObjetDivLatex,
    divsLatex: string[],
    reflectionAnimationIds: string[],
    xmin: number,
    ymax: number,
  ) => {
    let codeSvg = ''
    // Dans le cas d'objets composites avec des objets Mathalea2d et des divLatex, il faut que ces objets exposent une propriété objets qui contient la liste des objets qui les composent.
    // Cette list est substituée à l'objet ici
    if (objets instanceof ObjetMathalea2D) {
      if (objets.objets != null) {
        objets = objets.objets as ObjetMathalea2D[]
      }
    } // c'est un objet composé d'objets. Exemple : Repere
    if (!Array.isArray(objets) && objets != null) {
      try {
        const objet = objets as ObjetMathalea2D
        if (!mainlevee || typeof objet?.svgml === 'undefined') {
          if (objet?.svg) {
            const code = context.isHtml ? objet.svg(pixelsParCm) : ''
            if (typeof code === 'string') {
              codeSvg = '\t' + code + '\n'
              if (typeof objet.reflectionAnimationId === 'string') {
                reflectionAnimationIds.push(objet.reflectionAnimationId)
              }
            } else {
              const codeLatex = code as ObjetDivLatex
              // on a à faire à un divLatex.
              if (typeof codeLatex !== 'object') {
                window.notify(
                  "Dans mathalea2d, la méthode svg() de l'objet a renvoyé quelque chose d'inconnu",
                  { codeLatex },
                )
                return codeSvg
              }
              if (!context.isHtml) return ''
              const xSvg = (codeLatex.x - xmin) * pixelsParCm * zoom
              const ySvg = -(codeLatex.y - ymax) * pixelsParCm * zoom
              if ('letterSize' in codeLatex) {
                codeLatex.backgroundColor = codeLatex.backgroundColor
                  .replace('{', '')
                  .replace('}', '')
                codeLatex.color = codeLatex.color
                  .replace('{', '')
                  .replace('}', '')

                const divOuterHtml =
                  codeLatex.backgroundColor !== '' &&
                  codeLatex.backgroundColor !== 'none'
                    ? `<div class="divLatex"${attributEtiquette} style="background-color: ${codeLatex.backgroundColor};${codeLatex.padding != null ? ` padding: ${codeLatex.padding}px;` : ''}${codeLatex.bordure != null ? ` border: 1px solid ${codeLatex.bordure}; border-radius: 4px;` : ''} position: absolute; top: ${ySvg}px; left: ${xSvg}px; transform: translate(-50%,-50%) rotate(${-codeLatex.orientation}deg); opacity: ${codeLatex.opacity};" data-top=${ySvg} data-left=${xSvg}>${katex.renderToString('\\' + codeLatex.letterSize + ' {\\color{' + codeLatex.color + '}{' + (codeLatex.gras ? '\\textbf{' : '') + codeLatex.latex.replaceAll('color[HTML]', 'color') + (codeLatex.gras ? '}' : '') + '}}')}</div>`
                    : `<div class="divLatex"${attributEtiquette} style="position: absolute; top: ${ySvg}px; left: ${xSvg}px; transform: translate(-50%,-50%) rotate(${normaliseOrientation(-codeLatex.orientation)}deg); opacity: ${codeLatex.opacity};" data-top=${ySvg} data-left=${xSvg}>${katex.renderToString('{\\color{' + codeLatex.color + '} \\' + codeLatex.letterSize + '{' + (codeLatex.gras ? '\\textbf{' : '') + codeLatex.latex.replaceAll('color[HTML]', 'color') + (codeLatex.gras ? '}' : '') + '}}')}</div>`
                divsLatex.push(divOuterHtml)
              } else if ('exercice' in codeLatex) {
                if (!context.isHtml) return ''
                if ('inputs' in codeLatex) {
                  const code = codeLatex as unknown as MetaInteractif2dData
                  const inputs = code.inputs
                  const isInteractif = code.exercice.interactif
                  for (const input of inputs) {
                    const xSvgInput = (input.x - xmin) * pixelsParCm * zoom
                    const ySvgInput = -(input.y - ymax) * pixelsParCm * zoom
                    const dataKeyboard = buildDataKeyboardString(
                      convertClasseToString(input.classe),
                    )
                    const champIndex = input.content.indexOf('%{champ1}')
                    const prefix =
                      champIndex > 0 ? input.content.slice(0, champIndex) : ''
                    const prefixHtml = prefix
                      ? katex.renderToString(prefix)
                      : ''
                    const mathFieldContent = input.content
                      .slice(champIndex === -1 ? 0 : champIndex)
                      .replace('%{champ1}', '\\placeholder[champ1]{}')
                    const blancContent = input.content
                      .slice(champIndex === -1 ? 0 : champIndex)
                      .replace('%{champ1}', input.blanc)
                    const transform = prefix
                      ? 'translate(0,-50%)'
                      : 'translate(-50%,-50%)'
                    const inputIndex = input.index ?? 0
                    const divOuterHtml = `<div class="divLatex" style="position: absolute; top: ${ySvgInput}px; left: ${xSvgInput}px; transform: ${transform}; opacity: ${input.opacity}; display: inline-flex; align-items: center; gap: 2px;" data-top=${ySvgInput} data-left=${xSvgInput}>${prefixHtml}${
                      isInteractif
                        ? MetaInteractif2dElement.create({
                            numeroExercice: code.exercice.numeroExercice ?? 0,
                            questionIndex: code.question,
                            fieldIndex: inputIndex,
                            innerHtml: `<math-field data-keyboard="${dataKeyboard}" virtual-keyboard-mode=manual readonly class="${input.classe} metaInteractif2d" id="MetaInteractif2dEx${code.exercice.numeroExercice}Q${code.question}field${inputIndex}">${mathFieldContent}</math-field>`,
                          })
                        : `$${blancContent}$`
                    }</div>`
                    divsLatex.push(divOuterHtml)
                  }
                }
              } else {
                window.notify(
                  "Dans mathalea2d, la méthode svg() de l'objet a renvoyé un objet inconnu",
                  { codeLatex },
                )
              }
            }
          }
        } else {
          if (objet?.svgml) {
            if (!context.isHtml) return ''
            codeSvg = '\t' + objet.svgml(pixelsParCm, amplitude) + '\n'
          }
        }
      } catch (error: unknown) {
        window.notify(
          error instanceof Error ? (error as Error).message : String(error),
          { objet: JSON.stringify(objets) },
        )
      }
    } else {
      if (objets != null && Array.isArray(objets)) {
        for (const objet of objets) {
          codeSvg += ajouteCodeHtml(
            mainlevee,
            objet,
            divsLatex,
            reflectionAnimationIds,
            xmin,
            ymax,
          )
        }
      } else {
        window.notify(
          'Un problème avec ce mathalea2d, la liste des objets contient un truc louche',
          { objets: JSON.stringify(objets) },
        )
      }
    }
    return codeSvg
  }
  const ajouteCodeTikz = (
    mainlevee: boolean,
    objets: ObjetMathalea2D | NestedObjetMathalea2dArray | ObjetDivLatex,
    skipRepere = false,
    axisYMin?: number,
    axisYMax?: number,
    axisXMin?: number,
    axisXMax?: number,
  ) => {
    let codeTikz = ''
    // Skip Repere objects when using pgfplots (pgfplots handles axis/grid)
    // Check BEFORE expanding objets.objets
    if (
      skipRepere &&
      objets instanceof ObjetMathalea2D &&
      (objets as any).isRepere === true
    ) {
      return codeTikz
    }
    // Don't expand Courbe objects when using pgfplots (they handle their own tikz output)
    // Check BEFORE expanding objets.objets
    const shouldNotExpand =
      objets instanceof ObjetMathalea2D && (objets as any).usePgfplots === true
    if (objets instanceof ObjetMathalea2D) {
      if (objets.objets != null && !shouldNotExpand) {
        objets = objets.objets as ObjetMathalea2D[]
      }
    } // c'est un objet composé d'objets. Exemple : Repere
    if (!Array.isArray(objets)) {
      try {
        // Only access tikz / tikzml on actual ObjetMathalea2D instances.
        if (objets instanceof ObjetMathalea2D) {
          if (!mainlevee || typeof objets.tikzml === 'undefined') {
            if (typeof objets.tikz === 'function') {
              // Pass axis bounds to Courbe's tikz method
              if (context.isHtml) return ''
              if ((objets as any).usePgfplots === true) {
                codeTikz =
                  '\t' +
                  objets.tikz(axisYMin, axisYMax, axisXMin, axisXMax) +
                  '\n'
              } else {
                codeTikz = '\t' + objets.tikz() + '\n'
              }
            }
          } else {
            if (typeof objets.tikzml === 'function') {
              if (context.isHtml) return ''
              codeTikz = '\t' + objets.tikzml(amplitude) + '\n'
            }
          }
        }
        // If objets is not an ObjetMathalea2D (e.g. ObjetDivLatex), do nothing for TikZ.
      } catch (error: unknown) {
        console.log(error instanceof Error ? error.message : String(error))
      }
    } else {
      for (const objet of objets) {
        codeTikz += ajouteCodeTikz(
          mainlevee,
          objet,
          skipRepere,
          axisYMin,
          axisYMax,
          axisXMin,
          axisXMax,
        )
      }
    }
    return codeTikz
  }
  // On prépare le code HTML
  // En fin de balise : la conversion Typst lit `width`, `height`… par des regex
  // en `<svg[^>]*?`, qu'un `>` du texte resérialisé par le DOM interromprait.
  const attributsAccessibilite =
    descriptionNette !== ''
      ? ` role="img" aria-label="${echappeAttribut(descriptionNette)}"`
      : decorative
        ? ' aria-hidden="true"'
        : ''
  const divsLatex: string[] = []
  const reflectionAnimationIds: string[] = []
  // `data-width-cm`/`data-height-cm` : taille physique réelle de la figure
  // (indépendante de `pixelsParCm`/`zoom`, qui ne pilotent que la taille de
  // rendu à l'écran ; alignée sur `scale`, seul facteur qui redimensionne
  // aussi la figure tikz en LaTeX), reprise par la conversion Typst
  // (`svgToTypstImage`, `latexToTypst.ts`) pour afficher la figure en vraie
  // grandeur dans le PDF, comme le fait déjà tikz en LaTeX à partir de ces
  // mêmes coordonnées. `data-vraie-grandeur` (posé si `vraieGrandeur`) va plus
  // loin : il empêche aussi la réduction automatique qui, sinon, adapte la
  // figure à la largeur de la colonne courante (`mathalea-figure-block`).
  let codeSvg = `<svg class="mathalea2d"  ${id !== '' ? `id="${id}"` : ''} data-width-cm="${(xmax - xmin) * scale}" data-height-cm="${(ymax - ymin) * scale}"${vraieGrandeur ? ' data-vraie-grandeur="1"' : ''} width="${(xmax - xmin) * pixelsParCm * zoom}" height="${
    (ymax - ymin) * pixelsParCm * zoom
  }" viewBox="${xmin * pixelsParCm} ${-ymax * pixelsParCm} ${
    (xmax - xmin) * pixelsParCm
  } ${(ymax - ymin) * pixelsParCm}" xmlns="http://www.w3.org/2000/svg"${attributsAccessibilite} >\n`
  codeSvg += ajouteCodeHtml(
    mainlevee,
    objets,
    divsLatex,
    reflectionAnimationIds,
    xmin,
    ymax,
  )
  codeSvg += '\n</svg>'
  codeSvg = codeSvg.replace(/\\thickspace/gm, ' ')
  // `role="img"` ne suffit pas : Chromium expose encore ces textes (« // », noms
  // de points) sous l'image. Ils sont déjà dans la description.
  if (descriptionNette !== '') {
    codeSvg = codeSvg.replace(
      /<(text|foreignObject)\b/g,
      '<$1 aria-hidden="true"',
    )
  }
  const effectiveDisplay = display ?? 'block'
  // Ces helpers ajoutent des custom elements techniques uniquement quand des
  // objets 2D ont enregistré une interaction à brancher sur le SVG qui précède.
  // En l'absence de cube 3D, d'animation de symétrie ou de fraction cliquable,
  // ils retournent une chaîne vide.
  const technicalInteractionMarkup = [
    cubeIsoInteractionMarkup(id),
    reflectionAnimationMarkup(reflectionAnimationIds),
    fractionCliquableInteractionMarkup(),
  ].join('\n')
  const codeHTML = `<div class="svgContainer" style="display: ${effectiveDisplay};${center ? ' margin: auto;' : ''}">
        <div ${id !== '' ? `id="M2D${id}"` : ''} style="${innerWrapperStyle}">
          ${codeSvg}
          ${technicalInteractionMarkup}
          ${divsLatex.join('\n')}
        </div>
      </div>`
  // On prépare le code Latex
  // si scale existe autre que 1 il faut que le code reste comme avant
  // sinon on ajoute scale quoi qu'il en soit quitte à ce que xscale et yscale viennent s'ajouter
  // de cette manière d'autres options Tikz pourront aussi être ajoutées
  // si il n'y a qu'une optionsTikz on peut passer un string
  let codeTikz
  const listeOptionsTikz: string[] = []
  if (optionsTikz !== undefined) {
    if (typeof optionsTikz === 'string') {
      listeOptionsTikz.push(optionsTikz)
    } else {
      optionsTikz.forEach((e) => listeOptionsTikz.push(e))
    }
  }

  if (usePgfplots) {
    // Use pgfplots with axis environment instead of tikzpicture
    codeTikz = centerLatex ? '{\\centering\n' : ''
    codeTikz += '\\begin{tikzpicture}[baseline'
    for (let l = 0; l < listeOptionsTikz.length; l++) {
      codeTikz += `,${listeOptionsTikz[l]}`
    }
    if (scale !== 1) {
      codeTikz += `,scale = ${scale}`
    }
    codeTikz += ']\n'
    codeTikz += '\\begin{axis}[\n'
    codeTikz += `  xmin=${xmin}, xmax=${xmax},\n`
    codeTikz += `  ymin=${ymin}, ymax=${ymax},\n`
    codeTikz += '  axis lines=middle,\n'
    // Les accolades autour de Stealth permettent aussi au générateur de
    // préambule de détecter que la bibliothèque TikZ arrows.meta est requise.
    codeTikz += '  axis line style={-{Stealth}},\n'
    codeTikz += '  axis on top=false,\n'
    codeTikz += '  xlabel={},\n'
    codeTikz += '  ylabel={},\n'
    codeTikz += `  xtick distance=${pgfplotsXTickDistance},\n`
    codeTikz += `  ytick distance=${pgfplotsYTickDistance},\n`
    codeTikz += `  minor x tick num=${pgfplotsMinorXTickNum},\n`
    codeTikz += `  minor y tick num=${pgfplotsMinorYTickNum},\n`
    codeTikz += '  grid=both,\n'
    codeTikz += '  grid style={line width=.1pt, draw=gray!30},\n'
    codeTikz += '  major grid style={line width=.2pt,draw=gray!50},\n'
    codeTikz += '  tick label style={font=\\scriptsize},\n'
    codeTikz += '  every axis plot/.append style={line width=1pt},\n'
    codeTikz += '  clip=true,\n'
    if (pgfplotsAxisEqual) codeTikz += '  axis equal image,\n'
    codeTikz += ']\n'
    // code += codeTikz(...objets)
    codeTikz += ajouteCodeTikz(mainlevee, objets, true, ymin, ymax, xmin, xmax) // Skip Repere when using pgfplots, pass axis bounds
    codeTikz += '\\end{axis}\n'
    codeTikz += '\\end{tikzpicture}'
    if (centerLatex) codeTikz += '\\par}'
  } else {
    // Standard tikzpicture behavior
    codeTikz = centerLatex ? '{\\centering\n' : ''
    if (scale === 1) {
      codeTikz += '\\begin{tikzpicture}[baseline'
      for (let l = 0; l < listeOptionsTikz.length; l++) {
        codeTikz += `,${listeOptionsTikz[l]}`
      }
      codeTikz += ']\n'
    } else {
      codeTikz += '\\begin{tikzpicture}[baseline'
      for (let l = 0; l < listeOptionsTikz.length; l++) {
        codeTikz += `,${listeOptionsTikz[l]}`
      }
      codeTikz += `,scale = ${scale}`
      codeTikz += ']\n'
    }

    codeTikz += `\\tikzset{
      point/.style={
        thick,
        draw,
        cross out,
        inner sep=0pt,
        minimum width=5pt,
        minimum height=5pt,
      },
    }
    \\clip (${xmin},${ymin}) rectangle (${xmax},${ymax});`
    // code += codeTikz(...objets)
    codeTikz += ajouteCodeTikz(mainlevee, objets)
    codeTikz += '\\end{tikzpicture}'
    if (centerLatex) codeTikz += '\\par}'
  }

  if (effectiveDisplay === 'block' && !centerLatex) codeTikz += '\\\\'
  if (context.isHtml) return codeHTML
  else return codeTikz
}
