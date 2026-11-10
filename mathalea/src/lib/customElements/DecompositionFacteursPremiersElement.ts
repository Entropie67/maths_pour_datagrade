import { context } from '../../modules/context'
import { bleuMathalea, orangeMathalea } from '../colors'
import { baremeEtapes } from './PossibleMultiLinesAnswerElement'
import {
  KeyboardType,
  buildDataKeyboardFromStyle,
  convertClasseToString,
} from '../interactif/claviers/keyboard'
import { verifySingleMathLiveField } from '../interactif/mathLiveVerifications'
import { nommeChampsAutourDe } from '../interactif/nomAccessibleChamp'
import { ajouteFeedback } from '../interactif/questionMathLive'
import { renderKatex } from '../latex/renderKatex'
import { estPremier } from '../outils/primalite'
import { texNombre } from '../outils/texNombre'
import type { IExercice } from '../types'
import MathaleaCustomElement, {
  registerMathaleaCustomElement,
} from './MathaleaCustomElement'
import {
  MathaleaMathfieldElement,
  type MathaleaMathfieldVerificationResult,
} from './MathaleaMathfield'

/**
 * Algorithme de décomposition d'un entier en produit de facteurs premiers,
 * posé comme au cahier :
 *
 * ```
 * 132 | 2
 *  66 | 2
 *  33 | 3
 *  11 | 11
 *   1 |
 * 132 = 2 × 2 × 3 × 11
 * ```
 *
 * L'élève choisit chaque diviseur (colonne de droite), puis saisit le quotient
 * (ligne suivante, colonne de gauche). Quand il obtient 1, il écrit la
 * décomposition.
 *
 * Deux modes de vérification (`BaremeMultiLignes`, comme pour le calcul en
 * plusieurs étapes) :
 *
 * - `toutOuRien` : rien n'est corrigé pendant la saisie, la question vaut un
 *   point si toutes les étapes et la décomposition sont justes. Chaque étape
 *   est corrigée par rapport au nombre saisi par l'élève à la ligne précédente.
 * - `etapes` : chaque diviseur et chaque quotient est corrigé dès qu'il est
 *   validé. Une saisie fausse est barrée en rouge, reste visible, et l'élève
 *   la corrige juste à côté. La question vaut 2 points : 2 si tout est juste,
 *   1 si la décomposition finale est juste malgré une étape fausse.
 *
 * Le composant produit les trois sorties attendues : HTML, LaTeX (`array`) et
 * Typst (`table`). Hors HTML interactif, il affiche soit le tableau vide à
 * remplir (`rendu: 'vide'`), soit la solution (`rendu: 'solution'`).
 *
 * @author Rémi Angot
 */

export type BaremeDecomposition = 'toutOuRien' | 'etapes'

/** Ce que le composant affiche : champs à remplir, tableau vide ou solution. */
export type RenduDecomposition = 'interactif' | 'vide' | 'solution'

export type DecompositionFacteursPremiersOptions = {
  id?: string
  numeroExercice?: number
  questionIndex?: number
  /** L'entier à décomposer. */
  nombre: number
  bareme?: BaremeDecomposition
  /** Clavier du champ de la décomposition finale. */
  style?: string
  rendu?: RenduDecomposition
  interactivityOn?: boolean
}

/* -------------------------------------------------------------------------- */
/* Calculs                                                                     */
/* -------------------------------------------------------------------------- */

/** Une saisie de l'élève, avec son verdict (`null` tant qu'elle n'est pas corrigée). */
export type Tentative = { v: string; ok: boolean | null }

/** Une ligne de l'algorithme : le diviseur choisi puis le quotient obtenu. */
export type EtapeSaisie = { diviseurs: Tentative[]; quotients: Tentative[] }

/**
 * L'état saisi par l'élève. Un diviseur ou un quotient faux reste dans la liste
 * (barré) : la dernière tentative est la valeur retenue.
 */
export type EtatDecomposition = { etapes: EtapeSaisie[]; final: string }

export type Phase =
  | { type: 'diviseur'; etape: number }
  | { type: 'quotient'; etape: number }
  | { type: 'termine' }

export type VerdictDiviseur = 'ok' | 'invalide' | 'nonPremier' | 'neDivisePas'

export function etatVide(): EtatDecomposition {
  return { etapes: [], final: '' }
}

/** Lit un entier positif saisi en LaTeX (`1320`, `1\,320`, `1 320`). */
export function parseEntier(saisie: string): number | null {
  const net = saisie
    .replaceAll('\\,', '')
    .replaceAll('\\ ', '')
    .replaceAll('~', '')
    .replaceAll(/\s/g, '')
  if (!/^\d+$/.test(net)) return null
  const n = Number(net)
  return Number.isSafeInteger(n) ? n : null
}

/** Les lignes de l'algorithme : le diviseur de chaque ligne et le quotient obtenu. */
export function etapesAlgorithme(
  nombre: number,
): { diviseur: number; quotient: number }[] {
  const etapes: { diviseur: number; quotient: number }[] = []
  let reste = nombre
  for (let d = 2; reste > 1; d++) {
    while (reste % d === 0) {
      reste /= d
      etapes.push({ diviseur: d, quotient: reste })
    }
  }
  return etapes
}

/** Les facteurs premiers de `nombre`, dans l'ordre croissant. */
export function facteursPremiers(nombre: number): number[] {
  return etapesAlgorithme(nombre).map(({ diviseur }) => diviseur)
}

/** Un diviseur est juste s'il est premier et divise le nombre de sa ligne. */
export function verdictDiviseur(
  nombre: number | null,
  saisie: string,
): VerdictDiviseur {
  const diviseur = parseEntier(saisie)
  if (diviseur == null) return 'invalide'
  if (diviseur < 2 || !estPremier(diviseur)) return 'nonPremier'
  if (nombre == null || nombre % diviseur !== 0) return 'neDivisePas'
  return 'ok'
}

/** Une tentative est « retenue » : corrigée et juste, ou (sans correction) saisie. */
function estRetenue(tentative: Tentative, corrige: boolean): boolean {
  return corrige ? tentative.ok === true : true
}

/** Le nombre à diviser à la ligne `etape` : `nombre`, puis le dernier quotient saisi. */
export function nombreAvant(
  etat: EtatDecomposition,
  nombre: number,
  etape: number,
): number | null {
  if (etape === 0) return nombre
  const quotient = etat.etapes[etape - 1]?.quotients.at(-1)
  return quotient == null ? null : parseEntier(quotient.v)
}

/** Ce que l'élève doit saisir maintenant. `corrige` : mode de correction à chaque étape. */
export function phase(etat: EtatDecomposition, corrige: boolean): Phase {
  const derniere = etat.etapes.at(-1)
  if (derniere == null) return { type: 'diviseur', etape: 0 }
  const index = etat.etapes.length - 1
  const diviseur = derniere.diviseurs.at(-1)
  if (diviseur == null || !estRetenue(diviseur, corrige)) {
    return { type: 'diviseur', etape: index }
  }
  const quotient = derniere.quotients.at(-1)
  if (quotient == null || !estRetenue(quotient, corrige)) {
    return { type: 'quotient', etape: index }
  }
  if (parseEntier(quotient.v) === 1) return { type: 'termine' }
  return { type: 'diviseur', etape: index + 1 }
}

/** Le message affiché sous le tableau quand une saisie est fausse (mode `etapes`). */
function messageSaisieFausse(
  phaseCourante: Phase,
  nombre: number | null,
  diviseur: string,
  saisie: string,
): string {
  if (phaseCourante.type === 'diviseur') {
    switch (verdictDiviseur(nombre, saisie)) {
      case 'invalide':
        return 'Saisir un nombre entier.'
      case 'nonPremier':
        return `$${saisie}$ n'est pas un nombre premier.`
      default:
        return `$${saisie}$ ne divise pas $${nombre == null ? '' : texNombre(nombre)}$.`
    }
  }
  return `Le quotient de $${nombre == null ? '' : texNombre(nombre)}$ par $${diviseur}$ n'est pas $${saisie}$.`
}

/**
 * Valide la saisie `saisie` à l'étape courante et retourne le nouvel état.
 * Avec `corrige`, le verdict est calculé tout de suite ; sinon il reste `null`.
 */
export function valideSaisie(
  etat: EtatDecomposition,
  nombre: number,
  saisie: string,
  corrige: boolean,
): { etat: EtatDecomposition; message: string } {
  const courante = phase(etat, corrige)
  const net = saisie.trim()
  if (courante.type === 'termine' || net === '') return { etat, message: '' }
  const copie: EtatDecomposition = JSON.parse(JSON.stringify(etat))
  if (copie.etapes[courante.etape] == null) {
    copie.etapes[courante.etape] = { diviseurs: [], quotients: [] }
  }
  const etape = copie.etapes[courante.etape]
  const avant = nombreAvant(copie, nombre, courante.etape)
  const diviseur = etape.diviseurs.at(-1)?.v ?? ''
  let ok: boolean | null = null
  if (corrige) {
    if (courante.type === 'diviseur') {
      ok = verdictDiviseur(avant, net) === 'ok'
    } else {
      const d = parseEntier(diviseur)
      ok = avant != null && d != null && parseEntier(net) === avant / d
    }
  }
  const liste = courante.type === 'diviseur' ? etape.diviseurs : etape.quotients
  liste.push({ v: net, ok })
  return {
    etat: copie,
    message:
      ok === false ? messageSaisieFausse(courante, avant, diviseur, net) : '',
  }
}

/** Annule la dernière saisie (mode `toutOuRien` seulement : aucune n'est corrigée). */
export function annuleDerniereSaisie(
  etat: EtatDecomposition,
): EtatDecomposition {
  const copie: EtatDecomposition = JSON.parse(JSON.stringify(etat))
  const derniere = copie.etapes.at(-1)
  if (derniere == null) return copie
  if (derniere.quotients.length > 0) derniere.quotients.pop()
  else derniere.diviseurs.pop()
  if (derniere.diviseurs.length === 0) copie.etapes.pop()
  return copie
}

/**
 * Corrige toutes les saisies, chaque ligne l'étant par rapport au nombre saisi
 * par l'élève à la ligne précédente : une erreur n'en fait pas apparaître
 * d'autres derrière elle.
 */
export function corrigeLesEtapes(
  etat: EtatDecomposition,
  nombre: number,
): EtatDecomposition {
  const copie: EtatDecomposition = JSON.parse(JSON.stringify(etat))
  copie.etapes.forEach((etape, index) => {
    const avant = nombreAvant(copie, nombre, index)
    const diviseur = etape.diviseurs.at(-1)
    const d = diviseur == null ? null : parseEntier(diviseur.v)
    etape.diviseurs.forEach((tentative) => {
      tentative.ok = verdictDiviseur(avant, tentative.v) === 'ok'
    })
    etape.quotients.forEach((tentative) => {
      tentative.ok =
        avant != null &&
        d != null &&
        diviseur?.ok === true &&
        parseEntier(tentative.v) === avant / d
    })
  })
  return copie
}

export type ResumeEtapes = {
  /** L'algorithme va jusqu'au quotient 1 avec un dernier quotient juste. */
  complet: boolean
  nbDiviseursFaux: number
  nbQuotientsFaux: number
}

export function resumeEtapes(etat: EtatDecomposition): ResumeEtapes {
  let nbDiviseursFaux = 0
  let nbQuotientsFaux = 0
  for (const etape of etat.etapes) {
    nbDiviseursFaux += etape.diviseurs.filter((t) => t.ok === false).length
    nbQuotientsFaux += etape.quotients.filter((t) => t.ok === false).length
  }
  const dernier = etat.etapes.at(-1)?.quotients.at(-1)
  return {
    complet:
      dernier != null && dernier.ok === true && parseEntier(dernier.v) === 1,
    nbDiviseursFaux,
    nbQuotientsFaux,
  }
}

/** Lecture défensive d'un état sérialisé (sauvegarde vide, ancienne ou corrompue). */
export function parseEtat(brut: unknown): EtatDecomposition | null {
  let valeur = brut
  if (typeof valeur === 'string') {
    try {
      valeur = JSON.parse(valeur)
    } catch {
      return null
    }
  }
  if (valeur == null || typeof valeur !== 'object') return null
  const { etapes, final } = valeur as Record<string, unknown>
  if (!Array.isArray(etapes) || typeof final !== 'string') return null
  const lisTentatives = (liste: unknown): Tentative[] | null => {
    if (!Array.isArray(liste)) return null
    const tentatives: Tentative[] = []
    for (const t of liste) {
      if (t == null || typeof t !== 'object') return null
      const { v, ok } = t as Record<string, unknown>
      if (typeof v !== 'string') return null
      tentatives.push({ v, ok: typeof ok === 'boolean' ? ok : null })
    }
    return tentatives
  }
  const resultat: EtapeSaisie[] = []
  for (const etape of etapes) {
    if (etape == null || typeof etape !== 'object') return null
    const diviseurs = lisTentatives((etape as EtapeSaisie).diviseurs)
    const quotients = lisTentatives((etape as EtapeSaisie).quotients)
    if (diviseurs == null || quotients == null) return null
    resultat.push({ diviseurs, quotients })
  }
  return { etapes: resultat, final }
}

/* -------------------------------------------------------------------------- */
/* Sorties imprimées                                                           */
/* -------------------------------------------------------------------------- */

/** Nombre de lignes du tableau vide : une par facteur, plus la ligne du 1. */
function nbLignesVides(nombre: number): number {
  return facteursPremiers(nombre).length + 1
}

function couleurTex(texte: string, couleur: string): string {
  return `{\\color[HTML]{${couleur.replace('#', '')}}${texte}}`
}

/** Le tableau de l'algorithme en LaTeX : `array` à deux colonnes séparées par un trait. */
export function renderLatexDecomposition(
  nombre: number,
  rendu: RenduDecomposition,
): string {
  const etapes = etapesAlgorithme(nombre)
  const solution = rendu === 'solution'
  const lignes: string[] = []
  const nbLignes = solution ? etapes.length + 1 : nbLignesVides(nombre)
  for (let k = 0; k < nbLignes; k++) {
    const gauche =
      k === 0
        ? texNombre(nombre)
        : solution
          ? couleurTex(texNombre(etapes[k - 1].quotient), bleuMathalea)
          : '\\phantom{0000}'
    const droite =
      solution && k < etapes.length
        ? couleurTex(`\\boldsymbol{${etapes[k].diviseur}}`, orangeMathalea)
        : solution
          ? ''
          : '\\phantom{000}'
    lignes.push(`${gauche} & ${droite}`)
  }
  const tableau = `\\renewcommand{\\arraystretch}{1.5}$\\begin{array}{l|l}${lignes.join('\\\\')}\\end{array}$`
  const decomposition = solution
    ? couleurTex(
        `\\boldsymbol{${etapes.map(({ diviseur }) => diviseur).join('\\times ')}}`,
        orangeMathalea,
      )
    : '\\ldots\\ldots\\ldots\\ldots\\ldots'
  return `\\par\\smallskip{${tableau}}\\par\\smallskip $${texNombre(nombre)} = ${decomposition}$\\par\\smallskip `
}

function nombreTypst(nombre: number): string {
  return texNombre(nombre).replaceAll('\\,', ' thin ')
}

/** Le même tableau en Typst : `table` à deux colonnes, trait vertical à gauche de la seconde. */
export function renderTypstDecomposition(
  nombre: number,
  rendu: RenduDecomposition,
): string {
  const etapes = etapesAlgorithme(nombre)
  const solution = rendu === 'solution'
  const nbLignes = solution ? etapes.length + 1 : nbLignesVides(nombre)
  const cellules: string[] = []
  for (let k = 0; k < nbLignes; k++) {
    const gauche =
      k === 0
        ? `[$${nombreTypst(nombre)}$]`
        : solution
          ? `[#text(fill: rgb("${bleuMathalea}"))[$${nombreTypst(etapes[k - 1].quotient)}$]]`
          : '[#h(3em)]'
    const droite =
      solution && k < etapes.length
        ? `[#text(fill: rgb("${orangeMathalea}"), weight: "bold")[$${etapes[k].diviseur}$]]`
        : solution
          ? '[]'
          : '[#h(2.5em)]'
    cellules.push(`${gauche}, ${droite},`)
  }
  const decomposition = solution
    ? `#text(fill: rgb("${orangeMathalea}"), weight: "bold")[$${etapes.map(({ diviseur }) => diviseur).join(' times ')}$]`
    : '$dots.h dots.h dots.h$'
  return [
    '#block(breakable: false)[',
    '#table(columns: (auto, auto), align: left, inset: (x: 0.8em, y: 0.5em),',
    'stroke: (x, y) => if x == 1 { (left: 0.6pt) } else { none },',
    ...cellules,
    ')',
    `$${nombreTypst(nombre)} =$ ${decomposition}`,
    ']',
  ].join('\n')
}

/* -------------------------------------------------------------------------- */
/* Le composant                                                                */
/* -------------------------------------------------------------------------- */

const STYLE_ID = 'decomposition-facteurs-premiers-style'
const CLAVIER_NOMBRES = buildDataKeyboardFromStyle(
  convertClasseToString(KeyboardType.clavierNumbers),
).join(' ')
const ICONE_VALIDER =
  '<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="8.5"/><path d="M6 10.5l3 3 5-6"/></svg>'

export class DecompositionFacteursPremiersElement extends MathaleaCustomElement {
  static readonly elementTag = 'decomposition-facteurs-premiers'

  private etat: EtatDecomposition = etatVide()
  private champActif: MathaleaMathfieldElement | null = null
  private compteurChamps = 0

  static create({
    id,
    numeroExercice = 0,
    questionIndex = 0,
    nombre,
    bareme = 'toutOuRien',
    style = '',
    rendu = 'interactif',
    interactivityOn = true,
  }: DecompositionFacteursPremiersOptions): string {
    // La vue Typst régénère l'exercice avec `isHtml` encore vrai : ce cas doit
    // donc être traité avant la branche HTML.
    if (context.isTypst) {
      return `<mathalea-typst>${renderTypstDecomposition(nombre, rendu)}</mathalea-typst>`
    }
    if (!context.isHtml) return renderLatexDecomposition(nombre, rendu)
    const tag = DecompositionFacteursPremiersElement.elementTag
    const attrs = this.buildAttributes({
      id: id ?? `${tag}Ex${numeroExercice}Q${questionIndex}`,
      numeroExercice,
      questionIndex,
      nombre,
      bareme,
      rendu,
      interactivityOn: rendu === 'interactif' ? interactivityOn : false,
    })
    if (rendu !== 'interactif') return `<${tag}${attrs}></${tag}>`
    const dataKeyboard = buildDataKeyboardFromStyle(style).join(' ')
    const champFinal = MathaleaMathfieldElement.create({
      numeroExercice,
      questionIndex,
      dataKeyboard,
      className: style,
    })
    return `<${tag}${attrs}><div data-dfp-grille></div><div data-dfp-actions></div><div class="dfp-message" data-dfp-message aria-live="polite"></div><div class="dfp-final" data-dfp-final><label data-dfp-label for="champTexteEx${numeroExercice}Q${questionIndex}"></label>${champFinal}<span id="resultatCheckEx${numeroExercice}Q${questionIndex}"></span></div></${tag}>`
  }

  static verifQuestion(
    exercice: IExercice,
    i: number,
  ): MathaleaMathfieldVerificationResult {
    const element = document.querySelector(
      `#${DecompositionFacteursPremiersElement.elementTag}Ex${exercice.numeroExercice}Q${i}`,
    ) as DecompositionFacteursPremiersElement | null
    if (element == null)
      return MathaleaMathfieldElement.verifQuestion(exercice, i)

    element.valideLeBrouillon()
    if (!element.corrigeALaVolee) {
      element.etat = corrigeLesEtapes(element.etat, element.nombre)
    }
    const resume = resumeEtapes(element.etat)
    const champFinal = element.champFinal()
    const resultatFinal = verifySingleMathLiveField(
      exercice,
      i,
      champFinal?.querySelector('math-field') ?? null,
    )
    if (typeof exercice.answers === 'object') {
      exercice.answers[element.id] = JSON.stringify(element.value)
    }
    element.interactivityOn = false

    const nbErreurs = resume.nbDiviseursFaux + resume.nbQuotientsFaux
    if (resume.complet && nbErreurs === 0) return resultatFinal

    // Le smiley signifie « tout est réussi » : avec une étape fausse ou un
    // algorithme inachevé, une décomposition juste reçoit une simple coche.
    if (resultatFinal.isOk) {
      const span = element.querySelector(
        `#resultatCheckEx${exercice.numeroExercice}Q${i}`,
      )
      if (span != null) {
        span.textContent = '✓'
        span.className = 'dfp-ok'
      }
    }
    const feedbackEtapes = [
      resume.nbDiviseursFaux > 0
        ? 'Un diviseur doit être un nombre premier qui divise le nombre de sa ligne.'
        : '',
      resume.nbQuotientsFaux > 0
        ? resume.nbQuotientsFaux === 1
          ? 'Un quotient est faux.'
          : 'Plusieurs quotients sont faux.'
        : '',
      resume.complet ? '' : "L'algorithme doit se terminer par le quotient 1.",
    ].filter((feedback) => feedback !== '')
    const unPointPourLaDecomposition =
      element.corrigeALaVolee && resultatFinal.isOk ? 1 : 0
    return {
      isOk: false,
      feedback: [...feedbackEtapes, resultatFinal.feedback]
        .filter((feedback) => feedback !== '')
        .join('<br>'),
      score: {
        nbBonnesReponses: unPointPourLaDecomposition,
        nbReponses: resultatFinal.score.nbReponses,
      },
    }
  }

  static pointsMaxQuestion(exercice: IExercice, i: number): number {
    return MathaleaMathfieldElement.pointsMaxQuestion(exercice, i)
  }

  /** Seule la décomposition finale est affichée dans la vue des corrections. */
  static formatStudentAnswer(rawAnswer: string): string {
    const etat = parseEtat(rawAnswer)
    return `$${etat == null ? rawAnswer : etat.final}$`
  }

  static stripFromQuestionHtml(questionHtml: string): string {
    return MathaleaMathfieldElement.stripFromQuestionHtml(
      super.stripFromQuestionHtml(questionHtml),
    )
  }

  get value(): EtatDecomposition {
    return {
      etapes: this.etat.etapes,
      final: this.champFinal()?.value ?? this.etat.final,
    }
  }

  set value(prochaine: EtatDecomposition | string) {
    this.update(prochaine)
  }

  update(prochaine: EtatDecomposition | string): void {
    const etat = parseEtat(prochaine)
    if (etat == null) return
    this.etat = etat
    this.champActif = null
    if (this.isConnected) {
      this.rendu()
      this.appliqueLaDecompositionFinale()
    }
  }

  private get nombre(): number {
    return Number(this.getAttribute('nombre')) || 0
  }

  private get corrigeALaVolee(): boolean {
    return this.getAttribute('bareme') === 'etapes'
  }

  private get typeRendu(): RenduDecomposition {
    const rendu = this.getAttribute('rendu')
    return rendu === 'vide' || rendu === 'solution' ? rendu : 'interactif'
  }

  render(): string | void {
    if (!context.isHtml || context.isTypst) return this.renderLatex()
    injectStyle()
    this.classList.add('not-prose')
    this.rendu()
    queueMicrotask(() => this.appliqueLaDecompositionFinale())
  }

  protected renderLatex(): string {
    return renderLatexDecomposition(this.nombre, this.typeRendu)
  }

  protected onInteractivityChanged(_isOn: boolean): void {
    if (this.isConnected) this.rendu()
  }

  disconnectedCallback(): void {
    this.champActif = null
    super.disconnectedCallback()
  }

  private champFinal(): MathaleaMathfieldElement | null {
    return this.querySelector(
      `[data-dfp-final] ${MathaleaMathfieldElement.elementTag}`,
    )
  }

  private appliqueLaDecompositionFinale(): void {
    const champ = this.champFinal()
    if (champ != null && champ.value === '' && this.etat.final !== '') {
      champ.value = this.etat.final
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Tableau                                                                 */
  /* ---------------------------------------------------------------------- */

  private rendu(): void {
    if (this.typeRendu === 'interactif') this.renduInteractif()
    else this.renduStatique()
  }

  /** Tableau vide ou solution, sans aucun champ. */
  private renduStatique(): void {
    const nombre = this.nombre
    const solution = this.typeRendu === 'solution'
    const etapes = etapesAlgorithme(nombre)
    const nbLignes = solution ? etapes.length + 1 : nbLignesVides(nombre)
    const grille = document.createElement('div')
    grille.className = 'dfp-grille'
    for (let k = 0; k < nbLignes; k++) {
      const gauche = cellule('dfp-g')
      if (k === 0) gauche.append(valeurHtml(texNombre(nombre), 'dfp-nombre'))
      else if (solution) {
        gauche.append(
          valeurHtml(texNombre(etapes[k - 1].quotient), 'dfp-quotient'),
        )
      }
      const droite = cellule('dfp-d')
      if (solution && k < etapes.length) {
        droite.append(valeurHtml(String(etapes[k].diviseur), 'dfp-diviseur'))
      }
      grille.append(gauche, droite)
    }
    const final = document.createElement('div')
    final.className = 'dfp-final'
    final.innerHTML = solution
      ? `$${texNombre(nombre)} =$ <span class="dfp-diviseur">$${etapes.map(({ diviseur }) => diviseur).join('\\times ')}$</span>`
      : `$${texNombre(nombre)} = \\ldots\\ldots\\ldots\\ldots\\ldots$`
    this.replaceChildren(grille, final)
    renderKatex(this)
  }

  private renduInteractif(): void {
    const nombre = this.nombre
    const grilleActuelle = this.querySelector<HTMLElement>('[data-dfp-grille]')
    if (grilleActuelle == null) return
    const corrige = this.corrigeALaVolee
    const courante = phase(this.etat, corrige)
    const saisieOuverte = this.interactivityOn && courante.type !== 'termine'
    const nbEtapes = this.etat.etapes.length
    const retourSurDiviseur =
      courante.type === 'diviseur' && courante.etape < nbEtapes
    const nbLignes = nbEtapes + (retourSurDiviseur ? 0 : 1)

    const grille = document.createElement('div')
    grille.className = 'dfp-grille'
    this.champActif = null
    for (let k = 0; k < nbLignes; k++) {
      const gauche = cellule('dfp-g')
      if (k === 0) gauche.append(valeurHtml(texNombre(nombre), 'dfp-nombre'))
      else {
        const quotients = this.etat.etapes[k - 1]?.quotients ?? []
        quotients.forEach((t) =>
          gauche.append(valeurTentative(t, 'dfp-quotient')),
        )
        if (
          saisieOuverte &&
          courante.type === 'quotient' &&
          courante.etape === k - 1
        ) {
          this.ajouteChampActif(gauche, `Quo${k}`)
        }
      }
      const droite = cellule('dfp-d')
      const diviseurs = this.etat.etapes[k]?.diviseurs ?? []
      diviseurs.forEach((t) =>
        droite.append(valeurTentative(t, 'dfp-diviseur')),
      )
      if (
        saisieOuverte &&
        courante.type === 'diviseur' &&
        courante.etape === k
      ) {
        this.ajouteChampActif(droite, `Div${k}`)
      }
      grille.append(gauche, droite)
    }
    grilleActuelle.replaceWith(grille)
    grille.dataset.dfpGrille = ''
    renderKatex(grille)

    this.metAJourLesActions(courante)
    this.metAJourLeChampFinal(courante.type === 'termine')
    const champ = this.champActif as MathaleaMathfieldElement | null
    if (champ != null && this.dataset.dfpFocus === 'true') champ.focus()
  }

  private ajouteChampActif(cellule: HTMLElement, suffixe: string): void {
    const champ = document.createElement(
      MathaleaMathfieldElement.elementTag,
    ) as MathaleaMathfieldElement
    this.compteurChamps++
    champ.setAttribute(
      'mathfield-id',
      `champTexteEx${this.getAttribute('numero-exercice')}Q${this.getAttribute('question-index')}${suffixe}`,
    )
    champ.setAttribute('data-keyboard', CLAVIER_NOMBRES)
    champ.className = 'dfp-champ'
    champ.addEventListener('keydown', (event) => {
      if ((event as KeyboardEvent).key !== 'Enter') return
      event.preventDefault()
      this.valideLeChampActif()
    })
    const bouton = document.createElement('button')
    bouton.type = 'button'
    bouton.className = 'dfp-valide'
    bouton.title = 'Valider (Entrée)'
    bouton.setAttribute('aria-label', 'Valider')
    bouton.innerHTML = ICONE_VALIDER
    bouton.addEventListener('click', () => this.valideLeChampActif())
    cellule.append(champ, bouton)
    this.champActif = champ
  }

  /** Le bouton d'annulation (mode `toutOuRien` : aucune saisie n'est corrigée). */
  private metAJourLesActions(courante: Phase): void {
    const actions = this.querySelector<HTMLElement>('[data-dfp-actions]')
    if (actions == null) return
    actions.replaceChildren()
    if (
      this.corrigeALaVolee ||
      !this.interactivityOn ||
      this.etat.etapes.length === 0
    ) {
      return
    }
    const annuler = document.createElement('button')
    annuler.type = 'button'
    annuler.className = 'dfp-annule'
    annuler.textContent = '↶ Effacer la dernière saisie'
    annuler.addEventListener('click', () => {
      this.valideLeBrouillon(false)
      this.etat = annuleDerniereSaisie(this.etat)
      this.rendu()
      this.champActif?.focus()
    })
    actions.append(annuler)
    void courante
  }

  /** La décomposition finale reste verrouillée tant que l'algorithme n'est pas terminé. */
  private metAJourLeChampFinal(algorithmeTermine: boolean): void {
    const zone = this.querySelector<HTMLElement>('[data-dfp-final]')
    if (zone == null) return
    const etiquette = zone.querySelector('label')
    if (etiquette != null && etiquette.textContent === '') {
      etiquette.textContent = `$${texNombre(this.nombre)} =$`
      renderKatex(etiquette)
      nommeChampsAutourDe(this)
    }
    const champ = this.champFinal()
    const verrouille = !algorithmeTermine || !this.interactivityOn
    zone.classList.toggle('dfp-verrouille', !algorithmeTermine)
    // Un attribut plutôt que `readOnly` : le champ n'est pas encore amélioré
    // (upgrade) au premier rendu, et une propriété posée trop tôt masquerait
    // l'accesseur de la classe.
    if (verrouille) champ?.setAttribute('readonly', 'true')
    else champ?.removeAttribute('readonly')
  }

  private afficheLeMessage(message: string): void {
    const zone = this.querySelector<HTMLElement>('[data-dfp-message]')
    if (zone == null) return
    zone.textContent = message
    if (message !== '') renderKatex(zone)
  }

  /* ---------------------------------------------------------------------- */
  /* Saisie                                                                  */
  /* ---------------------------------------------------------------------- */

  private valideLeChampActif(): void {
    const champ = this.champActif
    if (champ == null || !this.interactivityOn) return
    const { etat, message } = valideSaisie(
      this.etat,
      this.nombre,
      champ.value,
      this.corrigeALaVolee,
    )
    if (etat === this.etat) return
    this.etat = etat
    this.dataset.dfpFocus = 'true'
    this.rendu()
    this.afficheLeMessage(message)
  }

  /** Valide la saisie en cours de frappe, comme si l'élève avait appuyé sur Entrée. */
  private valideLeBrouillon(corrige = this.corrigeALaVolee): void {
    const champ = this.champActif
    if (champ == null) return
    const { etat } = valideSaisie(this.etat, this.nombre, champ.value, corrige)
    this.etat = etat
    this.champActif = null
  }
}

/* -------------------------------------------------------------------------- */
/* Éléments du tableau                                                         */
/* -------------------------------------------------------------------------- */

function cellule(classe: string): HTMLElement {
  const element = document.createElement('div')
  element.className = classe
  return element
}

function valeurHtml(latex: string, classe: string): HTMLElement {
  const span = document.createElement('span')
  span.className = classe
  span.textContent = `$${latex}$`
  return span
}

/** Une saisie validée : barrée en rouge quand elle est fausse. */
function valeurTentative(tentative: Tentative, classe: string): HTMLElement {
  const span = valeurHtml(tentative.v, classe)
  if (tentative.ok === false) span.classList.add('dfp-barre')
  return span
}

function injectStyle(): void {
  if (document.getElementById(STYLE_ID) != null) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `
    decomposition-facteurs-premiers { display: block; margin: 1em 0; }
    decomposition-facteurs-premiers .dfp-grille { display: grid; grid-template-columns: max-content max-content; width: max-content; max-width: 100%; }
    decomposition-facteurs-premiers .dfp-g, decomposition-facteurs-premiers .dfp-d { display: flex; align-items: center; gap: .5rem; min-height: 2.8rem; padding: .15rem 1rem; }
    decomposition-facteurs-premiers .dfp-g { min-width: 5rem; }
    decomposition-facteurs-premiers .dfp-d { min-width: 4rem; border-left: 2px solid currentColor; }
    decomposition-facteurs-premiers .dfp-quotient { color: ${bleuMathalea}; }
    decomposition-facteurs-premiers .dfp-diviseur { color: ${orangeMathalea}; font-weight: 600; }
    decomposition-facteurs-premiers .dfp-barre { display: inline-block; padding: 0 .25em; background-image: linear-gradient(to top right, transparent calc(50% - 1px), #dc2626 calc(50% - 1px), #dc2626 calc(50% + 1px), transparent calc(50% + 1px)); }
    decomposition-facteurs-premiers .dfp-champ { min-width: 3.5em; }
    decomposition-facteurs-premiers button { display: inline-flex; align-items: center; border: none; background: transparent; color: #9ca3af; cursor: pointer; padding: .1rem; border-radius: 999px; }
    decomposition-facteurs-premiers button:hover, decomposition-facteurs-premiers button:focus-visible { color: #4b5563; }
    decomposition-facteurs-premiers .dfp-annule { font-size: .85rem; padding: .1rem .4rem; }
    decomposition-facteurs-premiers .dfp-message { min-height: 1.4em; margin-top: .4rem; font-size: .9rem; color: #dc2626; }
    decomposition-facteurs-premiers .dfp-final { display: flex; align-items: center; gap: .5rem; margin-top: .75rem; }
    decomposition-facteurs-premiers .dfp-final mathalea-mathfield .dfp-champ, decomposition-facteurs-premiers .dfp-final math-field { min-width: 10em; }
    decomposition-facteurs-premiers .dfp-verrouille { opacity: .45; }
    decomposition-facteurs-premiers .dfp-ok { color: #16a34a; font-weight: 600; }
  `
  document.head.append(style)
}

registerMathaleaCustomElement(DecompositionFacteursPremiersElement)

/**
 * Ajoute l'algorithme de décomposition à une question. À appeler après
 * `handleAnswers()` : la décomposition finale est vérifiée comme un champ
 * MathLive standard, le mode `etapes` remplace le barème par 2 points.
 *
 * Sans interactivité, le tableau vide à remplir est affiché.
 */
export function ajouteDecompositionFacteursPremiers(
  exercice: IExercice,
  questionIndex: number,
  options: Omit<DecompositionFacteursPremiersOptions, 'rendu'>,
): string {
  const numeroExercice = exercice.numeroExercice ?? 0
  if (!exercice.interactif) {
    return DecompositionFacteursPremiersElement.create({
      ...options,
      numeroExercice,
      questionIndex,
      rendu: 'vide',
    })
  }
  const autoCorrection = (exercice.autoCorrection[questionIndex] ??= {})
  autoCorrection.formatInteractif =
    DecompositionFacteursPremiersElement.elementTag
  if (options.bareme === 'etapes' && autoCorrection.valeur != null) {
    autoCorrection.valeur.bareme = baremeEtapes
  }
  return (
    DecompositionFacteursPremiersElement.create({
      ...options,
      numeroExercice,
      questionIndex,
      rendu: 'interactif',
    }) + ajouteFeedback(exercice, questionIndex)
  )
}

/** La solution : tableau rempli et décomposition en évidence. */
export function solutionDecompositionFacteursPremiers(nombre: number): string {
  return DecompositionFacteursPremiersElement.create({
    nombre,
    rendu: 'solution',
  })
}
