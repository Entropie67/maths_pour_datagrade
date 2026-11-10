import { context } from '../../modules/context'
import type { ColourNames } from '../2d/colorToLatexOrHtml'
import { colours, mathaleaColorAliases } from '../2d/colorToLatexOrHtml'
import { range } from './nombres'
import './ShemasEnBoite.css'
import { texNombre } from './texNombre'

// Ramène 'blue'/'green'/'orange' vers les couleurs officielles CoopMaths.
function normalizeMathaleaColor(color: string): string {
  return mathaleaColorAliases[color] ?? color
}

const standardLatexColors = new Set([
  'black',
  'white',
  'red',
  'green',
  'blue',
  'cyan',
  'magenta',
  'yellow',
  'gray',
  'darkgray',
  'lightgray',
  'orange',
  'violet',
  'purple',
  'brown',
  'lime',
  'olive',
  'pink',
  'teal',
])

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]
}

function colorForTikz(color: string): string {
  if (standardLatexColors.has(color)) return color
  const hex = color.startsWith('#') ? color : colours[color as ColourNames]
  if (hex) {
    const [r, g, b] = hexToRgb(hex)
    return `{rgb,255:red,${r};green,${g};blue,${b}}`
  }
  return color
}

function colorForTextcolor(color: string): string {
  if (standardLatexColors.has(color)) return `{${color}}`
  const hex = color.startsWith('#') ? color : colours[color as ColourNames]
  if (hex) {
    const [r, g, b] = hexToRgb(hex)
    return `[RGB]{${r},${g},${b}}`
  }
  return `{${color}}`
}

/**
 * @author Jean-claude Lhote
 */

type AccoladeType = {
  start: number // colonne de début (1 = première colonne)
  end: number // colonne de fin = start + longueur de l'accolade
  text: string
  type?: 'accolade' | 'flèche' // pour le style de l'accolade, 'curl' pour les accolades classiques, 'arrow' pour les accolades avec une flèche
  options?: {
    justify?: 'start' | 'center' | 'end' // pour justifier le texte à gauche, au centre ou à droite
    color?: string // pour la couleur du texte
    fontSize?: string // pour la taille de la police
    fontWeight?: string // pour le poids de la police
    lineHeight?: string // pour la hauteur de ligne
  }
}
type BarreSchemaType = {
  color: string
  length: number
  content: string
  type?: 'boite' | 'flèche'
  options?: {
    borderless?: boolean // pour une boîte sans bordure
    justify?: 'start' | 'center' | 'end' // pour justifier le texte à gauche, au centre ou à droite
    color?: string // pour la couleur du texte
    fontSize?: string // pour la taille de la police
    fontWeight?: string // pour le poids de la police
    textAlign?: 'left' | 'center' | 'right' // pour aligner le texte à gauche, au centre ou à droite
    style?: string // pour ajouter un style CSS supplémentaire
    // par exemple: 'border: 1px solid black;'
    // pour ajouter une bordure ou d'autres styles
    // on peut aussi ajouter d'autres options si besoin
  }
}

type LigneSchemaType = {
  barres: BarreSchemaType[]
  entete?: {
    content: string // pour le titre de la ligne
    longueur?: number // pour la longueur de l'entête (en nombre d'unité de grille) n"cessaire sur la prémière ligne du schéma les autres lignes auront la même longueur
    couleur?: string // pour la couleur du texte de l'entête (le fond est dans la couleur de la page)
    fontSize?: string // pour la taille de la police de l'entête
    fontWeight?: string // pour le poids de la police de l'entête
  }
  spacing?: number // pour l'espacement après la ligne
  height?: string // pour la hauteur de la ligne (en em), si non défini, on utilise la hauteur par défaut
}

type LigneAccoladeType = AccoladeType[]
export default class SchemaEnBoite {
  topBraces?: LigneAccoladeType
  bottomBraces?: LigneAccoladeType
  lignes: LigneSchemaType[] = []
  rightBraces?: AccoladeType[] // pour les accolades à droite, si nécessaire
  maxEnteteLength?: number // pour la largeur max des entêtes (en nombre d'unité de grille), si nécessaire

  constructor(
    {
      lignes,
      bottomBraces,
      topBraces,
      rightBraces,
    }: {
      lignes: LigneSchemaType[]
      bottomBraces?: LigneAccoladeType
      topBraces?: LigneAccoladeType
      rightBraces?: LigneAccoladeType
    } = { lignes: [] },
  ) {
    this.lignes = lignes
    this.rightBraces = []
    if (bottomBraces) {
      this.bottomBraces = bottomBraces
    }
    if (topBraces) {
      this.topBraces = topBraces
    }
    if (rightBraces) {
      this.rightBraces = rightBraces
    }
  }

  display(texScale = 0.8): string {
    if (context.isHtml) {
      // Trouver la largeur max des entêtes (en nombre d'unité de grille)
      let maxEnteteLength = 0
      let hasEntete = false
      for (const ligne of this.lignes) {
        if (ligne.entete !== undefined) {
          hasEntete = true
          if ((ligne.entete.longueur ?? 0) > maxEnteteLength) {
            maxEnteteLength = ligne.entete.longueur ?? 0
          }
        }
      }
      this.maxEnteteLength = maxEnteteLength
      // Si aucune entête n'est définie, on ne met pas de colonne d'entête
      let ligneAccoladeH = ''
      if (this.topBraces) {
        for (let k = 0; k < this.topBraces.length; k++) {
          const brace = this.topBraces[k]
          const start = brace.start
          const end = brace.end
          const texte = brace.text
          const type = brace.type ?? 'accolade'
          const options = brace.options ?? {}
          const justify = options.justify ?? 'center'
          const color = normalizeMathaleaColor(options.color ?? 'black')
          const fontSize = options.fontSize ?? '1em'
          const fontWeight = options.fontWeight ?? 'normal'
          const lineHeight = options.lineHeight ?? '1.2em'
          if (start != null && end != null && texte != null) {
            ligneAccoladeH +=
              type === 'flèche'
                ? `<div class="SchemaTop" style="grid-row: 1; grid-column-start: ${start + maxEnteteLength}; grid-column-end: ${end + maxEnteteLength}; text-align:center; border: none; --arrow-color: ${color}">
                    <div class="latexAccoladeTop" style="text-align: ${justify}; color: ${color}; font-size: ${fontSize}; font-weight: ${fontWeight}; line-height: ${lineHeight}">${texte}</div>
                  <div class="horizontalArrow">
                    <div class="horizontalArrowHead" style="transform: rotate(180deg);"></div>
                    <div class="horizontalArrowLine"></div>
                    <div class="horizontalArrowHead"></div>
                  </div>
                </div>\n`
                : `<div class="SchemaTop" style="grid-row: 1; grid-column-start: ${start + maxEnteteLength}; grid-column-end: ${end + maxEnteteLength}; text-align:center; border: none"; --brace-color: ${color}">
                    <div class="latexAccoladeTop" style="text-align: ${justify}; color: ${color}; font-size: ${fontSize}; font-weight: ${fontWeight}; line-height: ${lineHeight}">${texte}</div>
                    <div class="braceTop">
                      <div class="braceTopLeft">
                        <div class="curlTopLeftLeft"></div>
                        <div class="lineTopLeftMiddle"></div>
                        <div class="curlTopLeftRight"></div>
                      </div>
                      <div class="braceTopRight">
                        <div class="curlTopRightLeft"></div>
                        <div class="lineTopRightMiddle"></div>
                        <div class="curlTopRightRight"></div>
                      </div>
                    </div>
                </div>\n`
          }
        }
      }

      // Générer les lignes de barres avec entête et gestion du spacing
      const lignesHtml: string[] = []
      let offset = 0
      for (let i = 0; i < this.lignes.length; i++) {
        const ligne = this.lignes[i]
        const entete = ligne.entete?.content ?? ''
        const couleurEntete = normalizeMathaleaColor(
          ligne.entete?.couleur ?? 'black',
        )
        const fontSizeEntete = ligne.entete?.fontSize ?? '1em'
        const fontWeightEntete = ligne.entete?.fontWeight ?? 'normal'
        const spacing = ligne.spacing ?? 0
        const lineHeight = ligne.height ?? '1.2em'

        let barresHtml = ''
        let start = 1
        const barres = ligne.barres ?? []
        for (let k = 0; k < barres.length; k++) {
          const barre = barres[k]
          if (barre.length <= 0) continue
          if (barre.content == null) barre.content = ''
          barre.color = normalizeMathaleaColor(barre.color ?? 'lightgray')
          if (barre.options == null) barre.options = {}
          const options = barre.options ?? {}
          const justify = options.justify ?? 'center'
          const color = normalizeMathaleaColor(options.color ?? 'black')
          const fontSize = options.fontSize ?? '1em'
          const fontWeight = options.fontWeight ?? 'normal'
          const style = options.style ?? ''
          const type = barre.type ?? 'boite'
          const borderless = options.borderless ?? false // Si on veut une boîte sans bordure
          barresHtml +=
            type === 'boite'
              ? `<div class="SchemaItem" style="grid-row: ${i + 2 + offset};
                  grid-column-start: ${start + maxEnteteLength};
                  grid-column-end: ${start + barre.length + maxEnteteLength};
                  background-color:${barre.color};
                  justify-content:${justify};
                  color:${color};
                  font-size:${fontSize};
                  font-weight:${fontWeight};
                  line-height:${lineHeight};
                  ${
                    borderless
                      ? 'border: none;'
                      : k > 0
                        ? 'border-left: none;'
                        : 'border: solid 1px black;'
                  }
                   ${style}">
                ${
                  barre.content.includes('<br>')
                    ? `<div style="text-align: center;">${barre.content}</div>\n`
                    : barre.content
                }
              </div>\n`
              : `<div class="SchemaItem" style="grid-row: ${i + 2 + offset};
                  grid-column-start: ${start + maxEnteteLength};
                  grid-column-end: ${start + barre.length + maxEnteteLength};
                  background-color:${barre.color};
                  font-size:${fontSize};
                  font-weight:${fontWeight};
                  line-height:${lineHeight};
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  border: ${borderless ? 'none' : 'solid 1px black'};
                  ${style}">
                <div class="horizontalArrow" style="width: 100%;margin-top: 0.5em; --arrow-color: ${color}">
                  <div class="horizontalArrowHead" style="border-left: 12px solid ${color}; transform: rotate(180deg);"></div>
                  <div class="horizontalArrowLine" style="--arrow-color: ${color}"></div>
                  <div class="horizontalArrowHead" style="border-left: 12px solid ${color};"></div>
                </div>
                <div style="width: 100%; text-align: center; color: ${color};">${barre.content}</div>
              </div>\n`

          start += barre.length
        }
        // Si on doit afficher une colonne d'entête
        if (hasEntete) {
          // On met un div d'entête devant la ligne
          // On peut fixer la largeur en "em" selon maxEnteteLength, ou laisser le CSS gérer
          lignesHtml.push(
            `<div class="SchemaItem" style="grid-row: ${i + 2 + offset}; grid-column-start: 1; grid-column-end: ${maxEnteteLength + 1}; border: none; color: ${couleurEntete}; font-size: ${fontSizeEntete}; font-weight: ${fontWeightEntete}">${entete}</div>\n` +
              barresHtml,
          )
        } else {
          lignesHtml.push(barresHtml)
        }
        // Espacement vertical si spacing > 0 (on ajoute un div vide)
        if (spacing > 0) {
          lignesHtml.push(
            `<div class="SchemaItem" style="grid-row: ${i + 3 + offset}; grid-column-start: 1; grid-column-end: 2; border: none; height: ${spacing}em"></div>\n`,
          )
          offset++
        }
      }

      let ligneAccoladeB = ''
      if (this.bottomBraces) {
        for (let k = 0; k < this.bottomBraces.length; k++) {
          const brace = this.bottomBraces[k]
          const start = brace.start
          const end = brace.end
          const texte = brace.text
          const type = brace.type ?? 'accolade'
          const options = brace.options ?? {}
          const justify = options.justify ?? 'center'
          const color = normalizeMathaleaColor(options.color ?? 'black')
          const fontSize = options.fontSize ?? '1em'
          const fontWeight = options.fontWeight ?? 'normal'
          const lineHeight = options.lineHeight ?? '1.2em'
          if (start != null && end != null && texte != null) {
            ligneAccoladeB +=
              type === 'flèche'
                ? `<div class="SchemaBottom" style="grid-row: ${this.lignes.length + 2 + offset}; grid-column-start: ${start}; grid-column-end: ${end}; text-align:center; border: none; --brace-color: ${color}">
                  <div class="horizontalArrow">
                    <div class="horizontalArrowHead" style="transform: rotate(180deg);"></div>
                    <div class="horizontalArrowLine"></div>
                    <div class="horizontalArrowHead"></div>
                  </div>
                    <div class="latexAccoladeBottom" style="text-align: ${justify}; color: ${color}; font-size: ${fontSize}; font-weight: ${fontWeight}; line-height: ${lineHeight}">${texte}</div>
                </div>\n`
                : `<div class="SchemaBottom" style="grid-row: ${this.lignes.length + 2 + offset}; grid-column-start: ${start + maxEnteteLength}; grid-column-end: ${end + maxEnteteLength}; text-align:center; border: none; --brace-color: ${color}">
                    <div class="braceBottom">
                      <div class="braceBottomLeft">
                        <div class="curlBottomLeftLeft"></div>
                        <div class="lineBottomLeftMiddle"></div>
                        <div class="curlBottomLeftRight"></div>
                      </div>
                    <div class="braceBottomRight">
                      <div class="curlBottomRightLeft"></div>
                      <div class="lineBottomRightMiddle"></div>
                      <div class="curlBottomRightRight"></div>
                    </div>
                  </div>
                <div class="latexAccoladeBottom" style="text-align: ${justify}; color: ${color}; font-size: ${fontSize}; font-weight: ${fontWeight}; line-height: ${lineHeight}">
                  ${
                    texte.includes('<br>')
                      ? `<div style="text-align: center;">${texte}</div>\n`
                      : `${texte}`
                  }</div>\n
                  </div>\n`
          }
        }
      }
      let ligneAccoladeDroite = ''
      if (this.rightBraces) {
        for (let k = 0; k < this.rightBraces.length; k++) {
          const gridLength = Math.max(
            ...this.lignes.map(
              (l) =>
                l.barres.reduce((acc, b) => acc + (b.length ?? 0), 0) +
                (maxEnteteLength ?? 0) +
                1,
            ),
          ) // Longueur totale de la grille
          const brace = this.rightBraces[k]
          const start = brace.start
          const end = brace.end
          const texte = brace.text
          // const type = brace.type ?? 'accolade'
          const options = brace.options ?? {}
          const justify = options.justify ?? 'center'
          const color = normalizeMathaleaColor(options.color ?? 'black')
          const fontSize = options.fontSize ?? '1em'
          const fontWeight = options.fontWeight ?? 'normal'
          if (start != null && end != null && texte != null) {
            ligneAccoladeDroite += `<div class="SchemaRight" style="grid-row: ${start}/${end}; grid-column-start: ${gridLength + 1}; grid-column-end: ${gridLength + 2}; text-align:center; border: none; --brace-color: ${color}">
    <div class="braceRight">
      <div class="braceRightTop">
        <div class="curlRightTopTop"></div>
        <div class="lineRightTopMiddle"></div>
        <div class="curlRightTopBottom"></div>
      </div>
      <div class="braceRightBottom">
        <div class="curlRightBottomTop"></div>
        <div class="lineRightBottomMiddle"></div>
        <div class="curlRightBottomBottom"></div>
      </div>
    </div>
  </div>
    <div class="latexAccoladeRight" style="grid-row: ${Math.round((start + end) / 2) - 1}; grid-column-start: ${gridLength + 2}; grid-column-end: ${gridLength + 10};text-align: ${justify}; color: ${color}; font-size: ${fontSize}; font-weight: ${fontWeight}">
     <div style="display: inline-block; text-align: center;">${texte}</div>\n
    </div>\n`
          }
        }
      }
      return `<div class="SchemaContainer">${ligneAccoladeH}\n${lignesHtml.join('\n')}\n${ligneAccoladeB}${ligneAccoladeDroite}</div>\n`
    } else {
      // latex
      // Trouver la largeur max des entêtes (en nombre de caractères)
      let maxEnteteLength = 0
      let hasEntete = false
      for (const ligne of this.lignes) {
        if (ligne.entete !== undefined) {
          hasEntete = true
          if ((ligne.entete.longueur ?? 0) > maxEnteteLength) {
            maxEnteteLength = ligne.entete.longueur ?? 0
          }
        }
      }
      // Si aucune entête n'est définie, on ne met pas de colonne d'entête
      // On peut aussi utiliser la plus grande largeur réelle (en px) mais ici on reste simple
      let latex = `\\begin{tikzpicture}[scale=${texScale}]\n`
      if (this.topBraces) {
        for (let k = 0; k < this.topBraces.length; k++) {
          const brace = this.topBraces[k]
          const start =
            (brace.start + (hasEntete ? maxEnteteLength : 0) - 1) * texScale
          const end =
            (brace.end + (hasEntete ? maxEnteteLength : 0) - 1) * texScale
          const texte = brace.text
          const type = brace.type ?? 'accolade'
          const options = brace.options ?? {}
          const color = normalizeMathaleaColor(options.color ?? 'black')
          const fontSize = options.fontSize ?? '1em'
          const fontWeight = options.fontWeight ?? 'normal'
          if (start != null && end != null && texte != null) {
            let styleTexte = ''
            if (color && !texte.includes('tikzpicture'))
              styleTexte += `\\textcolor${colorForTextcolor(color)}{`
            let fontSizeCmd = ''
            if (fontSize) {
              if (fontSize === 'small') fontSizeCmd = '\\small '
              else if (fontSize === 'large') fontSizeCmd = '\\large '
              else if (fontSize === 'Large') fontSizeCmd = '\\Large '
              else if (fontSize === 'footnotesize')
                fontSizeCmd = '\\footnotesize '
            }
            let fontWeightCmd = ''
            if (fontWeight === 'bold') fontWeightCmd = '\\textbf{'
            const texteLatex = `${styleTexte}${fontSizeCmd}${fontWeightCmd}${texte}${fontWeight === 'bold' ? '}' : ''}${color && !texte.includes('tikzpicture') ? '}' : ''}`
            if (type === 'flèche') {
              latex += `\\draw[<->,thick, draw=${colorForTikz(color)}] (${start.toFixed(1)},3.2) -- (${end.toFixed(1)},3.2) node[above, pos=0.5] {${texteLatex}};\n`
            } else {
              latex += `\\draw[decorate,decoration={brace,amplitude=10pt},xshift=0pt,yshift=0pt,draw=${colorForTikz(color)}] (${start.toFixed(1)},3) -- node[above=10pt, pos=0.5] {${texteLatex}} (${end.toFixed(1)},3);\n`
            }
          }
        }
      }
      let y = 3
      for (let i = 0; i < this.lignes.length; i++) {
        const ligne = this.lignes[i]
        const entete = ligne.entete?.content ?? ''
        const couleurEntete = normalizeMathaleaColor(
          ligne.entete?.couleur ?? 'black',
        )
        const fontSizeEntete = ligne.entete?.fontSize ?? '1em'
        const fontWeightEntete = ligne.entete?.fontWeight ?? 'normal'

        const barres = ligne.barres ?? []
        if (hasEntete) {
          // On ajoute une barre vide pour l'entête
          barres.unshift({
            color: 'white',
            length: maxEnteteLength,
            content: entete,
            type: 'boite',
            options: {
              color: couleurEntete,
              justify: 'center',
              style: 'borderless',
              fontSize: fontSizeEntete,
              fontWeight: fontWeightEntete,
            },
          })
        }
        let start = 0
        const lineHeight = ligne.height ?? '1.2em'

        let rectHeight = 1
        if (lineHeight && typeof lineHeight === 'string') {
          const match = lineHeight.match(/^([\d.]+)(em|pt|cm|mm)?$/)
          if (match) {
            const value = parseFloat(match[1])
            if (match[2] === 'em' || !match[2]) {
              rectHeight = value / 1.2
            } else if (match[2] === 'pt') {
              rectHeight = value / 12
            } else if (match[2] === 'cm') {
              rectHeight = value / 0.508
            }
          }
        }

        y -= rectHeight * texScale

        for (let k = 0; k < barres.length; k++) {
          const barre = barres[k]
          if (barre.length <= 0) continue
          if (barre.content == null) barre.content = ''
          barre.color = normalizeMathaleaColor(barre.color ?? 'lightgray')
          if (barre.options == null) barre.options = {}
          const options = barre.options ?? {}
          const justify = options.justify ?? 'center'
          const color = normalizeMathaleaColor(options.color ?? 'black')
          const fontSize = options.fontSize ?? '1em'
          const fontWeight = options.fontWeight ?? 'normal'

          let styleTexte = ''
          if (color && !barre.content.includes('tikzpicture'))
            styleTexte += `\\textcolor${colorForTextcolor(color)}{`
          let fontSizeCmd = ''
          if (fontSize) {
            if (fontSize === 'small') fontSizeCmd = '\\small '
            else if (fontSize === 'large') fontSizeCmd = '\\large '
            else if (fontSize === 'Large') fontSizeCmd = '\\Large '
            else if (fontSize === 'footnotesize')
              fontSizeCmd = '\\footnotesize '
          }
          let fontWeightCmd = ''
          if (fontWeight === 'bold') fontWeightCmd = '\\textbf{'
          const texteLatex = barre.content.includes('<br>')
            ? `${styleTexte}${fontSizeCmd}${fontWeightCmd}\\shortstack{${barre.content.replaceAll('<br>', '\\\\')}}${fontWeight === 'bold' ? '}' : ''}${color && !barre.content.includes('tikzpicture') ? '}' : ''}`
            : `${styleTexte}${fontSizeCmd}${fontWeightCmd}${barre.content}${fontWeight === 'bold' ? '}' : ''}${color ? '}' : ''}`
          if (barre.type === 'boite') {
            if (barre.options?.style === 'borderless') {
              latex += `\\draw[fill=${colorForTikz(barre.color)}, draw=none] (${(start * texScale).toFixed(1)},${y.toFixed(1)}) rectangle (${((start + barre.length) * texScale).toFixed(1)},${(rectHeight * texScale + y).toFixed(1)});\n`
            } else {
              latex += `\\draw[fill=${colorForTikz(barre.color)}] (${(start * texScale).toFixed(1)},${y.toFixed(1)}) rectangle (${((start + barre.length) * texScale).toFixed(1)},${(rectHeight * texScale + y).toFixed(1)});\n`
            }
            let anchor = 'center'
            let align = 'center'
            let x = ((start + barre.length / 2) * texScale).toFixed(1)
            if (justify === 'start') {
              anchor = 'west'
              align = 'left'
              x = (start * texScale).toFixed(1)
            } else if (justify === 'end') {
              anchor = 'east'
              align = 'right'
              x = ((start + barre.length) * texScale).toFixed(1)
            }
            latex += `\\node[anchor=${anchor}, align=${align}] at (${x},${(y + rectHeight / 2).toFixed(1)}) {${texteLatex}};\n`
          } else if (barre.type === 'flèche') {
            latex += `\\draw[<->,thick, draw=${colorForTikz(color)}] (${(start * texScale).toFixed(1)},${(y + 0.56).toFixed(1)}) -- (${((start + barre.length) * texScale).toFixed(1)},${(y + 0.56).toFixed(1)}) node[pos=0.5, below] {${texteLatex}};\n`
            // Ligne verticale à l'extrémité droite de la flèche
            latex += `\\draw[dashed, thick, draw=${colorForTikz(color)}] (${((start + barre.length) * texScale).toFixed(1)},${y}) -- (${((start + barre.length) * texScale).toFixed(1)},${(y + rectHeight * texScale).toFixed(1)});\n`
          } else {
            latex += `\\draw[fill=${colorForTikz(barre.color)}] (${(start * texScale).toFixed(1)},${y.toFixed(1)}) rectangle (${((start + barre.length) * texScale).toFixed(1)},${(rectHeight * texScale + y).toFixed(1)}) node[pos=0.5] {${texteLatex}};\n`
          }

          // On met à jour le start pour le prochain élément
          start += barre.length // On ajoute un espace de 0.5 pour le prochain élément
        }
        y -= ligne?.spacing ?? 0
      }
      if (this.bottomBraces) {
        for (let k = 0; k < this.bottomBraces.length; k++) {
          const brace = this.bottomBraces[k]
          const start =
            (brace.start + (hasEntete ? maxEnteteLength : 0) - 1) * texScale
          const end =
            (brace.end + (hasEntete ? maxEnteteLength : 0) - 1) * texScale
          const texte = brace.text
          const type = brace.type ?? 'accolade'
          const options = brace.options ?? {}
          const color = normalizeMathaleaColor(options.color ?? 'black')
          const fontSize = options.fontSize ?? '1em'
          const fontWeight = options.fontWeight ?? 'normal'
          if (start != null && end != null && texte != null) {
            let styleTexte = ''
            if (color && !texte.includes('tikzpicture'))
              styleTexte += `\\textcolor${colorForTextcolor(color)}{`
            let fontSizeCmd = ''
            if (fontSize) {
              if (fontSize === 'small') fontSizeCmd = '\\small '
              else if (fontSize === 'large') fontSizeCmd = '\\large '
              else if (fontSize === 'Large') fontSizeCmd = '\\Large '
              else if (fontSize === 'footnotesize')
                fontSizeCmd = '\\footnotesize '
            }
            let fontWeightCmd = ''
            if (fontWeight === 'bold') fontWeightCmd = '\\textbf{'
            const texteLatex = texte.includes('<br>')
              ? `${styleTexte}${fontSizeCmd}${fontWeightCmd}\\shortstack{${texte.replaceAll('<br>', '\\\\')}}${fontWeight === 'bold' ? '}' : ''}${color && !texte.includes('tikzpicture') ? '}' : ''}`
              : `${styleTexte}${fontSizeCmd}${fontWeightCmd}${texte}${fontWeight === 'bold' ? '}' : ''}${color ? '}' : ''}`
            if (type === 'flèche') {
              latex += `\\draw[<->,thick, draw=${colorForTikz(color)}] (${start.toFixed(1)},${y - 0.2}) -- (${end.toFixed(1)},${y - 0.2}) node[below, pos=0.5] {${texteLatex}};\n`
            } else {
              latex += `\\draw[decorate,decoration={brace,amplitude=10pt},xshift=0pt,yshift=0pt, draw=${colorForTikz(color)}] (${end.toFixed(1)},${y}) -- node[below=10pt, pos=0.5] {${texteLatex}} (${start.toFixed(1)},${y});\n`
            }
          }
        }
      }
      if (this.rightBraces) {
        const longueurBarres = this.lignes.map(
          (l) =>
            l.barres.reduce((acc, b) => acc + (b.length ?? 0), 0) +
            (maxEnteteLength ?? 0),
        )
        const gridLength = Math.max(...longueurBarres) // Longueur totale de la grille
        for (let k = 0; k < this.rightBraces.length; k++) {
          const brace = this.rightBraces[k]
          const start =
            3 +
            (this.topBraces && this.topBraces.length > 0 ? 2 : 1) * texScale -
            brace.start * texScale
          const end =
            3 +
            (this.topBraces && this.topBraces.length > 0 ? 2 : 1) * texScale -
            brace.end * texScale
          const texte = brace.text
          // const type = brace.type ?? 'accolade'
          const options = brace.options ?? {}
          const color = normalizeMathaleaColor(options.color ?? 'black')
          const fontSize = options.fontSize ?? '1em'
          const fontWeight = options.fontWeight ?? 'normal'
          if (start != null && end != null && texte != null) {
            let styleTexte = ''
            if (color && !texte.includes('tikzpicture'))
              styleTexte += `\\textcolor${colorForTextcolor(color)}{`
            let fontSizeCmd = ''
            if (fontSize) {
              if (fontSize === 'small') fontSizeCmd = '\\small '
              else if (fontSize === 'large') fontSizeCmd = '\\large '
              else if (fontSize === 'Large') fontSizeCmd = '\\Large '
              else if (fontSize === 'footnotesize')
                fontSizeCmd = '\\footnotesize '
            }
            let fontWeightCmd = ''
            if (fontWeight === 'bold') fontWeightCmd = '\\textbf{'
            const texteLatex = texte.includes('<br>')
              ? `${styleTexte}${fontSizeCmd}${fontWeightCmd}\\shortstack{${texte.replaceAll('<br>', '\\\\')}}${fontWeight === 'bold' ? '}' : ''}${color && !texte.includes('tikzpicture') ? '}' : ''}`
              : `${styleTexte}${fontSizeCmd}${fontWeightCmd}${texte}${fontWeight === 'bold' ? '}' : ''}${color ? '}' : ''}`

            latex += `\\draw[decorate,decoration={brace,amplitude=10pt},xshift=0pt,yshift=0pt, draw=${colorForTikz(color)}]  (${((gridLength + 0.3) * texScale).toFixed(1)},${start.toFixed(1)}) -- (${((gridLength + 0.3) * texScale).toFixed(1)},${end.toFixed(1)});\n`
            // Ajoute un petit espace horizontal (par exemple 0.3) entre l'accolade et le texte
            latex += `\\node[anchor=west, align=left] at (${(gridLength * texScale + 0.8).toFixed(1)},${((start + end) / 2).toFixed(1)}) {${texteLatex}};\n`
          }
        }
      }
      latex += '\\end{tikzpicture}'
      return latex
    }
  }

  /**
   *
   * @param nb1 Le premier facteur (celui de la ligne du haut)
   * @param nb2 Le deuxième facteur (celui de l'accolade)
   * @param precision Le nombre de décimales
   * @param produit Le produit au format string si on veut écrire autre chose que '?' (écrit dans la case du dessous)
   * @returns
   */
  static multiplication(
    nb1: number | undefined,
    nb2: number | undefined,
    precision: number,
    produit: string | undefined,
  ): SchemaEnBoite {
    const seb = new SchemaEnBoite({
      topBraces: [
        {
          start: 1,
          end: 8 + precision * 2,
          text:
            nb2 != null
              ? `$${texNombre(nb2, precision)}\\text{ fois}$`
              : '? fois',
        },
      ],
      lignes: [
        {
          barres: [
            {
              color: 'lightgray',
              length: 2 + precision,
              content: nb1 != null ? `$${texNombre(nb1, precision)}$` : '?',
              type: 'boite',
            },
            {
              color: 'lightgray',
              length: 3,
              content: '\\ldots',
              type: 'boite',
            },
            {
              color: 'lightgray',
              length: 2 + precision,
              content: nb1 != null ? `$${texNombre(nb1, precision)}$` : '?',
              type: 'boite',
            },
          ],
        },
        {
          barres: [
            {
              color: 'white',
              length: 7 + precision * 2,
              content: produit != null ? produit : '?',
            }, // `${nb1 * nb2}`,
          ],
        },
      ],
    })
    return seb
  }

  /**
   *
   * @param dividende Le dividende (écrit dans la case du dessous)
   * @param quotient Le diviseur (nombre entier de fois écrit sur l'accolade)
   * @param diviseur Le diviseur (écrit dans les cases du dessus)
   * @param precision nombre de chiffres après la virgule du dividende et du diviseur
   * @returns
   */
  static division(
    dividende: number | undefined,
    diviseur: number | undefined,
    quotient: number | undefined,
    precision: number,
  ): SchemaEnBoite {
    const seb = new SchemaEnBoite({
      topBraces: [
        {
          start: 1,
          end: 8 + 2 * precision,
          text:
            quotient == null ? '? fois' : `$${texNombre(quotient, 0)}$ fois`,
        },
      ],
      lignes: [
        {
          barres: [
            {
              color: 'lightgray',
              length: 2 + precision,
              content:
                diviseur == null ? '?' : `$${texNombre(diviseur, precision)}$`,
              type: 'boite',
            },
            {
              color: 'lightgray',
              length: 3,
              content: '\\ldots',
              type: 'boite',
            },
            {
              color: 'lightgray',
              length: 2 + precision,
              content:
                diviseur == null ? '?' : `$${texNombre(diviseur, precision)}$`,
              type: 'boite',
            },
          ],
        },
        {
          barres: [
            {
              color: 'white',
              length: 7 + 2 * precision,
              content:
                dividende == null
                  ? '?'
                  : `$${texNombre(dividende, precision)}$`,
            },
          ],
        },
      ],
    })
    return seb
  }

  static multiplicationPuisDivisionAvecReste(
    nbFois: number | string | undefined,
    nb1: number | string | undefined,
    nb2: number | string | undefined,
    nbParts: number | string | undefined,
    reste: number | string | undefined,
    precison: number,
  ): SchemaEnBoite {
    const longueur = typeof nbFois === 'number' ? nbFois * 3 : 10
    const seb = new SchemaEnBoite({
      topBraces:
        nbFois != null
          ? typeof nbFois === 'string'
            ? [
                {
                  start: 1,
                  end: longueur + 1,
                  text: `${nbFois}`,
                  type: 'accolade',
                },
              ]
            : [
                {
                  start: 1,
                  end: longueur + 1,
                  text: `${texNombre(nbFois, 0)}`,
                  type: 'accolade',
                },
              ]
          : [{ start: 1, end: longueur + 1, text: '? fois', type: 'accolade' }],
      lignes: [
        {
          spacing: 0.5,
          barres:
            typeof nbFois === 'number'
              ? range(nbFois - 1).map((i) => {
                  const nb1Tex =
                    nb1 != null
                      ? typeof nb1 === 'number'
                        ? `$${texNombre(nb1, precison)}$`
                        : `${nb1}`
                      : '?'
                  return {
                    color: 'white',
                    length: 3,
                    content: nb1Tex,
                    type: 'boite',
                  }
                })
              : [
                  {
                    color: 'lightgray',
                    length: 3,
                    content:
                      nb1 != null
                        ? typeof nb1 === 'number'
                          ? `$${texNombre(nb1, precison)}$`
                          : `${nb1}`
                        : '?',
                    type: 'boite',
                  },
                  {
                    color: 'lightgray',
                    length: longueur - 3,
                    content: '\\ldots',
                    type: 'boite',
                    options: { justify: 'center' },
                  },
                ],
        },
        {
          barres: [
            {
              color: 'lightgray',
              length: 3,
              content:
                nb2 != null
                  ? typeof nb2 === 'number'
                    ? `$${texNombre(nb2, precison)}$`
                    : `${nb2}`
                  : '?',
              type: 'boite' as const,
            },
            {
              color: 'lightgray',
              length: longueur - 6,
              content: '\\ldots',
              type: 'boite' as const,
              options: { justify: 'center' },
            },
            {
              color: 'lightgray',
              length: 3,
              content:
                reste != null
                  ? typeof reste === 'number'
                    ? `$${texNombre(reste, precison)}$`
                    : `${reste}`
                  : '?',
              type: 'boite' as const,
              options: { justify: 'center' as const },
            },
          ],
        },
      ],
      bottomBraces: [
        {
          start: 1,
          end: longueur - 2,
          text:
            nbParts != null
              ? typeof nbParts === 'string'
                ? nbParts
                : `$${texNombre(Number(nbParts), precison)}$`
              : '?',
          type: 'accolade',
        },
      ],
    })

    return seb
  }

  /**
   *
   * @param diviseur diviseur (est écrit dans les cases du dessus)
   * @param dividende dividende (est écrit dans la case du dessous, mettre undefined pour avoir un ?)
   * @param quotient Le nombre de fois écrit sur l'accolade (un string qui peut être égal à '?')
   * @param reste Le reste de la division (un string qui peut être égal à '?')
   * @param precision
   * @returns
   */
  static divisionAvecReste(
    dividende: number | undefined,
    diviseur: number | undefined,
    quotient: number | undefined,
    precision: number,
    reste?: string,
  ): SchemaEnBoite {
    const seb = new SchemaEnBoite({
      topBraces: [
        {
          start: 1,
          end: 8 + 2 * precision,
          text: quotient == null ? '? fois' : `$${quotient}$ fois`,
        },
      ],
      lignes: [
        {
          barres: [
            {
              color: 'lightgray',
              length: 2 + precision,
              content:
                diviseur == null ? '?' : `$${texNombre(diviseur, precision)}$`,
            },
            { color: 'lightgray', length: 3, content: '\\ldots' },
            {
              color: 'lightgray',
              length: 2 + precision,
              content:
                diviseur == null ? '?' : `$${texNombre(diviseur, precision)}$`,
            },
            { color: 'lightgray', length: 2, content: reste ?? '?' },
          ],
        },
        {
          barres: [
            {
              color: 'white',
              length: 9 + 2 * precision,
              content:
                dividende == null
                  ? '?'
                  : `$${texNombre(dividende, precision)}$`,
            },
          ],
        },
      ],
    })
    return seb
  }

  static addition(
    nb1: number | undefined,
    nb2: number | undefined,
    precision: number,
  ): SchemaEnBoite {
    const seb = new SchemaEnBoite({
      lignes: [
        {
          barres: [
            {
              color: 'lightgray',
              length: 2 + precision,
              content: nb1 != null ? `$${texNombre(nb1, precision)}$` : '?',
            },
            {
              color: 'lightgray',
              length: 2 + precision,
              content: nb2 != null ? `$${texNombre(nb2, precision)}$` : '?',
            },
          ],
        },
        {
          barres: [{ color: 'white', length: 4 + precision * 2, content: '?' }],
        },
      ],
    })
    return seb
  }

  static additionPartiesTout(
    tout: number | string | undefined,
    precision: number,
    parties: (number | string | undefined)[],
  ): SchemaEnBoite {
    const nbParties = parties.length
    const partieLength = nbParties < 3 ? 4 : 3
    const seb = new SchemaEnBoite({
      topBraces: [
        {
          start: 1,
          end: nbParties * partieLength + 1,
          text:
            tout != null
              ? typeof tout === 'string'
                ? tout
                : `$${texNombre(tout, precision)}$`
              : '?',
          type: 'accolade',
        },
      ],
      lignes: [
        {
          barres: parties.map((partie, index) =>
            Object.assign(
              {
                color: 'lightgray',
                length: partieLength,
                content:
                  partie != null
                    ? typeof partie === 'string'
                      ? partie
                      : `$${texNombre(Number(partie), precision)}$`
                    : '?',
              },
              {},
            ),
          ),
        },
      ],
    })
    return seb
  }

  static additionPartiesToutComparaison(
    partie1: number | undefined,
    partie2: number | undefined,
    difference: number | undefined,
    tout: number | undefined,
    precision: number,
  ): SchemaEnBoite {
    const seb = new SchemaEnBoite({
      rightBraces: [
        {
          start: 1,
          end: 5,
          text: tout != null ? `${texNombre(tout, precision)}$` : '?',
          type: 'accolade',
        },
      ],
      lignes: [
        {
          barres: [
            {
              color: 'lightgray',
              length: 8 + precision,
              content:
                partie1 == null ? '?' : `$${texNombre(partie1, precision)}$`,
            },
          ],
        },
        {
          barres: [
            {
              color: 'lightgray',
              length: 4 + precision,
              content:
                partie2 == null ? '?' : `$${texNombre(partie2, precision)}$`,
            },
            {
              color: 'white',
              type: 'flèche',
              length: 4 + precision,
              content:
                difference != null
                  ? `$${texNombre(difference, precision)}$`
                  : 'différence',
              options: {
                style:
                  'border-left: none;border-top: none; border-bottom: none;border-right: dashed;',
              },
            },
          ],
        },
      ],
    })
    return seb
  }

  static additionPartiesToutComparaison2(
    partie1: string,
    partie2: string,
    partie3: string,
    difference: string,
    tout?: string,
    afficherTout?: boolean,
  ): SchemaEnBoite {
    const seb = new SchemaEnBoite(
      afficherTout
        ? Object.assign(
            {},
            {
              lignes: [
                {
                  spacing: 0.5,
                  barres: [
                    { color: 'lightgray', length: 3, content: partie1 },
                    { color: 'lightgray', length: 7, content: partie2 },
                  ],
                },
                {
                  barres: [
                    { color: 'lightgray', length: 6, content: partie3 },
                    {
                      color: 'white',
                      type: 'flèche' as const,
                      length: 4,
                      content: difference,
                      options: {
                        style:
                          'border-left: none;border-top: none; border-bottom: none;border-right: dashed;',
                      },
                    },
                  ],
                },
              ],
              topBraces: [
                {
                  start: 1,
                  end: 11,
                  text: tout,
                  type: 'accolade',
                },
              ],
            },
          )
        : Object.assign(
            {},
            {
              lignes: [
                {
                  spacing: 0.5,
                  barres: [
                    { color: 'lightgray', length: 3, content: partie1 },
                    { color: 'lightgray', length: 7, content: partie2 },
                  ],
                },
                {
                  barres: [
                    { color: 'lightgray', length: 6, content: partie3 },
                    {
                      color: 'white',
                      type: 'flèche' as const,
                      length: 4,
                      content: difference,
                      options: {
                        style:
                          'border-left: none;border-top: none; border-bottom: none;border-right: dashed;',
                      },
                    },
                  ],
                },
              ],
            },
          ),
    )

    return seb
  }

  static soustraction(
    terme1: number | undefined,
    difference: number | undefined,
    terme2: number | undefined,
    precision: number,
  ): SchemaEnBoite {
    const seb = new SchemaEnBoite({
      lignes: [
        {
          barres: [
            {
              color: 'lightgray',
              length: 2 + precision,
              content:
                terme1 == null ? '?' : `$${texNombre(terme1, precision)}$`,
            },
            {
              color: 'lightgray',
              length: 2 + precision,
              content:
                terme2 == null ? '?' : `$${texNombre(terme2, precision)}$`,
            },
          ],
        },
        {
          barres: [
            {
              color: 'white',
              length: 4 + precision * 2,
              content:
                difference == null
                  ? '?'
                  : `$${texNombre(difference, precision)}$`,
            },
          ],
        },
      ],
    })
    return seb
  }
}
