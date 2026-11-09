import { notify } from '../../../bugsnag'
import { texteApresChamp } from '../../outils/outilString'
import { TableauMathliveElement } from '../../customElements/TableauMathlive'
import type { AllChoicesType } from '../../customElements/ListeDeroulanteElement'
import '../../customElements/ListeDeroulanteElement'
import type { TableauMathliveType } from '../../types'
import { buildDataKeyboardFromStyle } from '../claviers/keyboard'
import './tableauMathlive.scss'
export interface Icell {
  texte: string
  latex: boolean
  gras: boolean
  color: string
  style?: string
  options?: {
    texteApres?: string
    texteAvant?: string
    blocCenter?: boolean
    espace?: boolean
    /**
     * Si ce tableau est fourni, la cellule (quand `texte` est vide) n'est pas
     * un math-field mais une liste déroulante proposant ces choix.
     */
    choices?: AllChoicesType
    /** Le premier choix de la liste est-il sélectionnable ? */
    choix0?: boolean
  }
}

export type FlecheCote = false | string
export type FlecheSens = 'bas' | 'haut'
export type Fleche = [number, number, string, number] | [number, number, string]
export type Raws = Array<Icell[]>
type ObjetParams = Record<string, string>

export function creeTableauMathliveElement({
  numeroExercice,
  question,
  tableau,
  typeTableau = 'doubleEntree',
  classes = '',
  texteAvant = '',
  texteApres = '',
  blocCenter = false,
  espace = false,
}: {
  numeroExercice: number
  question: number
  tableau: ItabDbleEntry | Itableau
  typeTableau?: TableauMathliveType
  classes?: string
  texteAvant?: string
  texteApres?: string
  blocCenter?: boolean
  espace?: boolean
}): string {
  const leTableau =
    typeTableau === 'doubleEntree'
      ? AddTabDbleEntryMathlive.create(
          numeroExercice,
          question,
          tableau as ItabDbleEntry,
          classes,
          true,
          {
            texteAvant,
            texteApres,
            blocCenter: blocCenter ? ' bloccenter' : '',
            espace: espace ? ' ' : '',
          },
        )
      : AddTabPropMathlive.create(
          numeroExercice,
          question,
          tableau as Itableau,
          classes,
          true,
          {
            texteAvant,
            texteApres,
            blocCenter: blocCenter ? ' bloccenter' : '',
            espace: espace ? ' ' : '',
          },
        )
  return leTableau.output
}

// Le TabPropMathlive ne gère pas les flèches... alors, je ne sais pas pourquoi j'ai mis toutes ces propriétés faculatives... Pour l'avenir ?
// Si quelqu'un sait faire, qu'il ne se gêne pas !
export interface Itableau {
  nbColonnes: number
  ligne1: Icell[]
  ligne2: Icell[]
  flecheHaut?: Fleche[] // [[1, 2, '\\times 6,4', 3], [2, 3, '\\div 6']]
  flecheBas?: Fleche[]
  flecheDroite?: FlecheCote // à remplacer par un string
  flecheDroiteSens?: FlecheSens
  flecheGauche?: FlecheCote
  flecheGaucheSens?: FlecheSens
}

export interface ItabDbleEntry {
  raws: Array<Icell[]>
  headingCols: Icell[]
  headingLines: Icell[]
  colFooters: Icell[]
  lineFooters: Icell[]
}

/**
 * Ajoute une cellule et ce qu'il faut dedans
 * @param {boolean} isInteractif
 * @param line
 * @param icell
 * @param indexCol
 * @param indexLine
 * @param tag
 * @param classes
 * @param NoEx
 * @param NoQ
 */
function appendCell({
  isInteractif,
  line,
  icell,
  indexCol,
  indexLine,
  tag,
  classes,
  NoEx,
  NoQ,
  style,
}: {
  isInteractif: boolean
  line: HTMLElement
  icell: Icell
  indexCol: number
  indexLine: number
  tag: 'th' | 'td'
  classes: string
  NoEx: number
  NoQ: number
  style: string
}) {
  const cell = document.createElement(tag)
  let element: HTMLElement
  const options = icell.options || {}
  if (icell.texte === '') {
    if (isInteractif) {
      if (options.texteAvant != null && options.texteAvant !== '') {
        const spanAvant = document.createElement('span')
        spanAvant.classList.add('tableauMathlive')
        spanAvant.textContent = options.texteAvant
        cell.appendChild(spanAvant)
      }
      if (options.choices != null && options.choices.length > 0) {
        element = document.createElement('liste-deroulante')
        element.classList.add('tableauMathlive')
        element.setAttribute(
          'choices',
          encodeURIComponent(JSON.stringify(options.choices)),
        )
        element.setAttribute('choix0', options.choix0 ? 'true' : 'false')
        element.id = `champTexteEx${NoEx}Q${NoQ}L${indexLine}C${indexCol}`
      } else {
        element = document.createElement('math-field')
        if (options.espace) {
          element.setAttribute('data-space', 'true')
        }
        element.classList.add('tableauMathlive')

        const classeString = buildDataKeyboardFromStyle(classes).join(' ')
        element.setAttribute('data-keyboard', classeString)
        element.id = `champTexteEx${NoEx}Q${NoQ}L${indexLine}C${indexCol}`
        element.setAttribute('virtual-keyboard-mode', 'manual')
      }
      cell.appendChild(element)
      if (options.texteApres != null && options.texteApres !== '') {
        const spanApres = document.createElement('span')
        spanApres.innerHTML = texteApresChamp(options.texteApres)
        cell.appendChild(spanApres)
      }
      /*  const spanResultat = document.createElement('span')
      spanResultat.id = `resultatCheckEx${NoEx}Q${NoQ}L${indexLine}C${indexCol}`
      cell.appendChild(spanResultat)
      */
    } else {
      element = document.createElement('span')
      element.classList.add('tableauMathlive')
      for (const classe of classes.split(' ')) {
        if (classe !== '') element.classList.add(classe)
      }
      element.id = `cell${NoEx}Q${NoQ}L${indexLine}C${indexCol}`
      cell.appendChild(element)
    }
  } else {
    if (icell.latex) {
      // J'aimerais pouvoir utiliser mathlive mais ça semble poser des soucis, je remplace par katex...
      //  element = document.createElement('math-field')
      // element.innerHTML = `<math-field read-only style="display:inline-block" id="L${indexLine}C${i + 1}">${icell.texte}</math-field>`
      element = document.createElement('span')
      cell.appendChild(element)
      element.outerHTML = `<span id="spanEx${NoEx}Q${NoQ}L${indexLine}C${indexCol}">$${icell.texte}$</span>`
      if (icell.texte.includes('\\frac') || icell.texte.includes('\\dfrac')) {
        cell.style.padding = '0.5em'
      }
    } else {
      element = document.createElement('span')
      cell.appendChild(element)
      element.outerHTML = `<span id="spanEx${NoEx}Q${NoQ}L${indexLine}C${indexCol}">${icell.texte}</span>`
    }
  }
  if (style != null) {
    cell.style.backgroundColor = style.split(';')[0] || 'transparent'
    cell.style.color = style.split(';')[1] || 'black'
  }
  line.appendChild(cell)
}

/**
 * @param {HTMLTableRowElement} line L'élément HTML <tr> qui reçoit les cellules
 * @param {Icell[]} content la liste des cellules au format Icell
 * @param {number} index le numéro de la ligne pour fabriquer l'identifiant de cellule
 * @param {'td'|'th'} tag le tag (td pour des cellules à l'intérieur th pour des cellules d'entête)
 * @param {string} classes une liste de className dans un string séparés par des espaces
 */
const fillLine = function ({
  isInteractif,
  line,
  content,
  index,
  tag,
  classes,
  NoEx,
  NoQ,
  style,
}: {
  isInteractif: boolean
  line: HTMLElement
  content: Icell[]
  index: number
  tag: 'td' | 'th'
  classes: string
  NoEx: number
  NoQ: number
  style: ObjetParams
}): void {
  for (let i = 0; i < content.length; i++) {
    appendCell({
      isInteractif,
      line,
      icell: content[i],
      indexCol: i,
      indexLine: index,
      tag,
      classes,
      NoEx,
      NoQ,
      style: style[`L${index}C${i}`],
    })
  }
}

export class AddTabPropMathlive {
  styles: Record<string, string>
  id!: string // ce sera nécessaire pour retrouver le tableau s'il y en a plusieurs dans la page.
  numeroExercice: number
  numeroQuestion: number
  output!: string
  nbColonnes: number
  ligne1!: Icell[]
  ligne2!: Icell[]
  flecheHaut: Fleche[] // [[1, 2, '\\times 6,4', 3], [2, 3, '\\div 6']]
  flecheBas: Fleche[]
  flecheDroite: FlecheCote // à remplacer par un string
  flecheDroiteSens: FlecheSens
  flecheGauche: FlecheCote
  flecheGaucheSens: FlecheSens
  classes?: string
  isInteractif: boolean

  private constructor(
    numeroExercice: number,
    question: number,
    tableau: Itableau,
    classes: string,
    isInteractif: boolean,
  ) {
    this.nbColonnes = tableau.nbColonnes ?? 1
    this.flecheHaut = tableau.flecheHaut ?? []
    this.flecheBas = tableau.flecheBas ?? []
    this.flecheDroite = tableau.flecheDroite ?? false
    this.flecheDroiteSens = tableau.flecheDroiteSens ?? 'bas'
    this.flecheGauche = tableau.flecheGauche ?? false
    this.flecheGaucheSens = tableau.flecheGaucheSens ?? 'haut'
    this.numeroExercice = numeroExercice ?? 0
    this.numeroQuestion = question
    this.id = `tabMLEx${this.numeroExercice}Q${this.numeroQuestion}`
    this.classes = classes
    this.isInteractif = isInteractif
    this.styles = {}
  }

  static create(
    numeroExercice: number,
    question: number,
    tableau: Itableau,
    classes: string,
    isInteractif: boolean,
    style: ObjetParams,
  ) {
    if (!Array.isArray(tableau.ligne1) || !Array.isArray(tableau.ligne1)) {
      notify('ajouteTableauMathlive : vérifiez vos paramètres !', {
        ligne1: tableau.ligne1,
        ligne2: tableau.ligne2,
        nbColonnes: tableau.nbColonnes,
      })
    }
    if (style == null) style = {}
    // ça, c'est pour ne pas modifier les lignes du tableau passé en argument
    const NoEx = numeroExercice ?? 0
    const NoQ = question
    const ligne1 = [...tableau.ligne1]
    const ligne2 = [...tableau.ligne2]
    const tableauMathlive: AddTabPropMathlive = new AddTabPropMathlive(
      numeroExercice,
      question,
      tableau,
      classes,
      isInteractif,
    )
    tableauMathlive.ligne1 = ligne1.map((el) => JSON.parse(JSON.stringify(el))) // on clone les lignes pour ne pas modifier le tableau passé en argument
    tableauMathlive.ligne2 = ligne2.map((el) => JSON.parse(JSON.stringify(el)))
    tableauMathlive.styles = style
    const table = document.createElement('table')
    table.className = 'tableauMathlive'
    table.id = `tabMathliveEx${NoEx}Q${question}`
    const firstLine = document.createElement('tr')
    const entete1 = ligne1.shift()
    if (entete1)
      appendCell({
        isInteractif,
        line: firstLine,
        icell: entete1,
        indexCol: 0,
        indexLine: 0,
        tag: 'th',
        classes,
        NoEx,
        NoQ,
        style: style[`L${0}C${0}`],
      })
    for (let i = 0; i < ligne1.length; i++) {
      appendCell({
        isInteractif,
        line: firstLine,
        icell: ligne1[i],
        indexCol: i + 1,
        indexLine: 0,
        tag: 'td',
        classes,
        NoEx,
        NoQ,
        style: style[`L${0}C${i + 1}`] ?? ligne1[i].style,
      })
    }
    table.appendChild(firstLine)
    // tableau de proportionnalité conforme à ceux définis dans src/lib/2d/tableau
    const secondLine = document.createElement('tr')
    const entete2 = ligne2.shift()
    if (entete2)
      appendCell({
        isInteractif,
        line: secondLine,
        icell: entete2,
        indexCol: 0,
        indexLine: 1,
        tag: 'th',
        classes,
        NoEx,
        NoQ,
        style: style[`L${1}C${0}`],
      })
    for (let i = 0; i < ligne2.length; i++) {
      appendCell({
        isInteractif,
        line: secondLine,
        icell: ligne2[i],
        indexCol: i + 1,
        indexLine: 1,
        tag: 'td',
        classes,
        NoEx,
        NoQ,
        style: style[`L${1}C${i + 1}`] ?? ligne2[i].style,
      })
    }
    table.appendChild(secondLine)
    const divFeedbackOuterHTML = `<div id="feedbackEx${numeroExercice}Q${question}"></div>`
    // pour l'instant je retourne l'objet complet avec le HTML de la table dans sa propriété output,
    // mais il sera peut-être possible de ne retourner que le HTML comme pour ajouteChampTexteMathlive...
    tableauMathlive.output = TableauMathliveElement.create({
      numeroExercice: NoEx,
      questionIndex: question,
      tableHtml: table.outerHTML,
      feedbackHtml: divFeedbackOuterHTML,
    })
    return tableauMathlive
  }

  /**
   * Les listes de tableauColonneLigne sont des listes de strings.
   * Celles des tableaux Mathlive, doivent être des Icell[] (interface exportée par ce fichier).
   * Cette fonction prends les différentes listes de tableauColonneLigne en argument et retourne un tableau pour AddTabDblEntry
   * @param tabEntetesColonnes
   * @param tabEntetesLignes
   * @param tabLignes
   */
  static convertTableauToTableauMathlive(
    lgn1: string[],
    lgn2: string[],
    gras: boolean = false,
    color: string = 'black',
  ): Itableau {
    const nbColonnes = Math.max(lgn1.length, lgn2.length)
    const ligne1: Icell[] = []
    const ligne2: Icell[] = []
    for (const str of lgn1) {
      ligne1.push({ texte: str, latex: true, gras, color })
    }
    for (const str of lgn2) {
      ligne2.push({ texte: str, latex: true, gras, color })
    }
    return { ligne1, ligne2, nbColonnes }
  }

  get latexOutput(): string {
    // retourne le tableau au format latex
    let output =
      '\\begin{tabular}{|c|' + 'c|'.repeat(this.nbColonnes - 1) + '}\n'
    output += '\\hline\n'
    let content: string[] = []
    for (let i = 0; i < this.ligne1.length; i++) {
      const cellule = this.ligne1[i]
      const style = this.styles[`L0C${i}`] ?? ''
      content.push(
        `${(style ?? ';').split(';')[0] !== '' ? `\\cellcolor{${(style ?? ';').split(';')[0]}}` : ''} ${`${cellule.latex ? '$' : ''}${cellule.texte}${cellule.latex ? '$' : ''}`}`.replace(
          '$$',
          '',
        ),
      )
    }
    output += content.join(' & ') + '\\\\\n'

    output += '\\hline\n'
    content = []
    for (let i = 0; i < this.ligne2.length; i++) {
      const cellule = this.ligne2[i]
      const style = this.styles[`L1C${i}`] ?? ''
      content.push(
        `${(style ?? ';').split(';')[0] !== '' ? `\\cellcolor{${(style ?? ';').split(';')[0]}}` : ''} ${`${cellule.latex ? '$' : ''}${cellule.texte}${cellule.latex ? '$' : ''}`}`.replace(
          '$$',
          '',
        ),
      )
    }
    output += content.join(' & ') + '\\\\\n'
    output += '\\hline\n'
    output += '\\end{tabular}'
    return output
  }
}

export class AddTabDbleEntryMathlive {
  id!: string // ce sera nécessaire pour retrouver le tableau s'il y en a plusieurs dans la page.
  numeroExercice: number
  numeroQuestion: number
  output!: string
  raws!: Raws
  headingCols: Icell[]
  headingLines: Icell[]
  footerCols: Icell[]
  footerLines: Icell[]
  classes: string
  isInteractif: boolean
  private constructor(
    numeroExercice: number,
    question: number,
    tableau: ItabDbleEntry,
    classes: string,
    isInteractif: boolean,
  ) {
    if (numeroExercice == null) {
      window.notify(
        "AddTabDbleEntryMathlive a besoin absolument d'un numero d'exercice",
        {},
      )
    }
    this.headingCols = tableau.headingCols
    this.headingLines = tableau.headingLines
    this.footerCols = tableau.colFooters
    this.footerLines = tableau.lineFooters
    this.numeroExercice = numeroExercice ?? 0
    this.numeroQuestion = question
    this.id = `tabMLEx${this.numeroExercice}Q${this.numeroQuestion}`
    this.raws = tableau.raws
    this.classes = classes
    this.isInteractif = isInteractif
  }

  static create(
    numeroExercice: number = 0,
    question: number,
    tableau: ItabDbleEntry,
    classes: string,
    isInteractif: boolean,
    style: ObjetParams,
    hauteurLigneEm?: number,
  ) {
    // tableau doit contenir headingCols et headingLines, qui peuvent être vides, mais doivent être fournis.
    if (
      !Array.isArray(tableau.headingCols) ||
      !Array.isArray(tableau.headingLines)
    ) {
      notify('ajouteTableauMathlive : vérifiez vos paramètres !', {
        headingCols: tableau.headingCols,
        headingLines: tableau.headingLines,
      })
    }
    if (style == null) style = {}
    const tableauMathlive: AddTabDbleEntryMathlive =
      new AddTabDbleEntryMathlive(
        numeroExercice,
        question,
        tableau,
        classes,
        isInteractif,
      )
    const table = document.createElement('table')
    const NoEx = numeroExercice ?? 0
    const NoQ = question
    table.className = 'tableauMathlive'
    table.id = `tabMathliveEx${numeroExercice}Q${question}`
    // Hauteur minimale (en em) commune à toutes les lignes, par exemple pour
    // pouvoir écrire une fraction dans chaque case. L'export Typst la relit
    // via data-hauteur-ligne.
    if (hauteurLigneEm != null) {
      table.setAttribute('data-hauteur-ligne', String(hauteurLigneEm))
    }
    const nouvelleLigne = () => {
      const tr = document.createElement('tr')
      if (hauteurLigneEm != null) tr.style.height = `${hauteurLigneEm}em`
      return tr
    }
    const firstLine = nouvelleLigne()
    table.appendChild(firstLine)
    tableauMathlive.headingCols = tableau.headingCols.map((el) =>
      JSON.parse(JSON.stringify(el)),
    ) // on clone les lignes pour ne pas modifier le tableau passé en argument
    tableauMathlive.headingLines = tableau.headingLines.map((el) =>
      JSON.parse(JSON.stringify(el)),
    ) // on clone les lignes pour ne pas modifier le tableau passé en argument
    tableauMathlive.raws = tableau.raws.map((el) =>
      JSON.parse(JSON.stringify(el)),
    ) // on clone les raws pour ne pas modifier le tableau passé en argument

    if (tableau.headingCols != null) {
      fillLine({
        isInteractif,
        line: firstLine,
        content: tableau.headingCols,
        index: 0,
        tag: 'th',
        classes,
        NoEx,
        NoQ,
        style,
      })
    }
    // lignes suivantes
    for (let j = 0; j < tableau.raws.length; j++) {
      const newLine = nouvelleLigne()
      table.appendChild(newLine)
      if (tableau.headingLines != null) {
        const sty =
          style[`L${tableau.headingCols != null ? 1 + j : j}C${0}`] ||
          style[`LC${0}`]
        appendCell({
          isInteractif,
          line: newLine,
          icell: tableau.headingLines[j],
          indexCol: 0,
          indexLine: tableau.headingCols != null ? 1 + j : j,
          tag: 'th',
          classes,
          NoEx,
          NoQ,
          style: sty,
        })
        /*
        const head = document.createElement('th')
        head.textContent = `$${tableau.headingLines[j]}$`
        newLine.appendChild(head)
        */
      }
      const raw = tableau.raws[j]
      if (Array.isArray(raw) && raw.length > 0) {
        for (let i = 0; i < raw.length; i++) {
          appendCell({
            isInteractif,
            line: newLine,
            icell: raw[i],
            indexCol: tableau.headingLines != null ? i + 1 : i,
            indexLine: tableau.headingCols != null ? 1 + j : j,
            tag: 'td',
            classes,
            NoEx,
            NoQ,
            style:
              style[
                `L${tableau.headingCols != null ? 1 + j : j}C${tableau.headingLines != null ? i + 1 : i}`
              ],
          })
        }
      }
      if (tableau.lineFooters.length > 0) {
        const sty =
          style[
            `L${tableau.headingCols != null ? 2 + j : 1 + j}C${raw.length}`
          ] || style[`LC${raw.length}`]
        appendCell({
          isInteractif,
          line: newLine,
          icell: tableau.lineFooters[j],
          indexCol: raw.length,
          indexLine: tableau.headingCols != null ? 2 + j : 1 + j,
          tag: 'th',
          classes,
          NoEx,
          NoQ,
          style: sty,
        })
      }
    }
    if (tableau.colFooters.length != 0) {
      const lastLine = nouvelleLigne()
      table.appendChild(lastLine)
      let lineIndex = tableau.raws.length
      if (tableau.headingCols.length != 0) {
        lineIndex++
      }
      fillLine({
        isInteractif,
        line: lastLine,
        content: tableau.colFooters,
        index: lineIndex,
        tag: 'th',
        classes,
        NoEx,
        NoQ,
        style,
      })
    }
    const divFeedbackOuterHTML = `<div id="feedbackEx${numeroExercice}Q${question}"></div>`
    // pour l'instant je retourne l'objet complet avec le HTML de la table dans sa propriété output,
    // mais il sera peut-être possible de ne retourner que le HTML comme pour ajouteChampTexteMathlive...
    tableauMathlive.output = TableauMathliveElement.create({
      numeroExercice: NoEx,
      questionIndex: question,
      tableHtml: table.outerHTML,
      feedbackHtml: divFeedbackOuterHTML,
    })
    return tableauMathlive
  }

  get latexOutput(): string {
    if (this.headingCols.length === 0 && this.headingLines.length === 0) {
      throw Error(
        'Un tableau à double entrée doit avoir des entête de colonne et des entête de ligne',
      )
    }
    const nbCols =
      this.headingCols.length > 0
        ? this.headingCols.length
        : this.raws[0].length + (this.headingLines.length > 0 ? 1 : 0)
    const nbLines =
      this.headingLines.length > 0 ? this.headingLines.length : this.raws.length

    // retourne le tableau au format latex
    let output = '\\begin{tabular}{|c|' + 'c|'.repeat(nbCols - 1) + '}\n'
    output += '\\hline\n'
    for (let i = 0; i < nbLines; i++) {
      if (this.headingLines[i] != null) {
        output += `$${this.headingLines[i].texte}$ & `
      }
      const raw = this.raws[i]
      output +=
        raw.map((cellule) => `$${cellule.texte}$`).join(' & ') + '\\\\\n'
      output += '\\hline\n'
    }
    output += '\\end{tabular}'
    return output
  }

  /**
   * Les listes de tableauColonneLigne sont des listes de strings.
   * Celles des tableaux Mathlive, doivent être des Icell[] (interface exportée par ce fichier).
   * Cette fonction prends les différentes listes de tableauColonneLigne en argument et retourne un tableau pour AddTabDblEntry
   * @param tabEntetesColonnes
   * @param tabEntetesLignes
   * @param tabLignes
   * @param tabColsFooters
   * @param tabLinesFooters
   */
  static convertTclToTableauMathlive(
    tabEntetesColonnes: (string | number)[],
    tabEntetesLignes: (string | number)[],
    tabLignes: (string | number)[],
    tabColFooters: (string | number)[] = [],
    tabLineFooters: (string | number)[] = [],
    gras: boolean = true,
    color: string = 'black',
  ): ItabDbleEntry {
    const headingCols: Icell[] = []
    for (const enTete of tabEntetesColonnes) {
      headingCols.push({ texte: enTete.toString(), latex: true, gras, color })
    }
    const headingLines: Icell[] = []
    for (const enTete of tabEntetesLignes) {
      headingLines.push({
        texte: enTete.toString(),
        latex: !enTete.toString().includes('<pre class'),
        gras,
        color,
      })
    }
    const raws: Array<Icell[]> = []
    const haveHeadC = headingCols.length > 0
    const haveHeadL = headingLines.length > 0
    if (!haveHeadL && !haveHeadC)
      throw Error(
        'Un tableau à double entrée doit avoir des entête de colonne ou des entête de ligne',
      )
    // on boucle sur les lignes mais il peut ne pas y avoir de headingLines ! On doit alors diviser le nombre de cellules par le nombre de colonnes à remplir.
    let nbCols: number = headingCols.length
    if (haveHeadC) {
      if (haveHeadL) nbCols--
      if (tabLineFooters.length > 0) nbCols--
    } else {
      nbCols = tabLignes.length / headingLines.length
    }
    const nbLines = haveHeadL ? headingLines.length : tabLignes.length / nbCols
    for (let i = 0; i < nbLines; i++) {
      const raw: Icell[] = []
      for (let j = 0; j < nbCols; j++) {
        raw.push({
          texte: tabLignes[i * nbCols + j].toString(),
          latex: true,
          gras,
          color,
        })
      }
      raws.push(raw)
    }

    if (
      (haveHeadL &&
        tabLineFooters.length > 0 &&
        tabLineFooters.length != headingLines.length) ||
      (haveHeadC &&
        tabColFooters.length > 0 &&
        tabColFooters.length != headingCols.length)
    )
      throw Error(
        'Les pieds de colonne ou ligne ne sont pas de même taille que les entêtes',
      )
    const colFooters: Icell[] = []
    for (const footer of tabColFooters) {
      colFooters.push({ texte: footer.toString(), latex: true, gras, color })
    }
    const lineFooters: Icell[] = []
    for (const footer of tabLineFooters) {
      lineFooters.push({ texte: footer.toString(), latex: true, gras, color })
    }

    return { raws, headingCols, headingLines, colFooters, lineFooters }
  }
}
