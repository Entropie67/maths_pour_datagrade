import { orangeMathalea } from '../colors'
import { context } from '../../modules/context'
import type { IExercice } from '../types'
import { miseEnEvidence, texteEnCouleurEtGras } from '../outils/embellissements'

const hexOrange = orangeMathalea.replace('#', '')
const debutMiseEnEvidence = new RegExp(
  `\\\\color(?:\\[HTML\\])?\\{#?${hexOrange}\\}\\s*\\\\boldsymbol\\s*\\{`,
  'gi',
)

/** Retire les `\vphantom{…}` (invisibles, ils servent à égaliser la hauteur des propositions). */
function sansVphantom(latex: string): string {
  let resultat = latex
  for (;;) {
    const debut = resultat.indexOf('\\vphantom{')
    if (debut === -1) return resultat
    let profondeur = 0
    let fin = -1
    for (let i = debut + '\\vphantom'.length; i < resultat.length; i++) {
      if (resultat[i] === '{') profondeur++
      else if (resultat[i] === '}' && --profondeur === 0) {
        fin = i
        break
      }
    }
    if (fin === -1) return resultat
    resultat = resultat.slice(0, debut) + resultat.slice(fin + 1)
  }
}

/** Forme comparable : sans espaces, sans mise en forme du texte ni accolades. */
function canon(latex: string): string {
  return sansVphantom(latex)
    .replace(/\\(?:text|textbf|mathrm|operatorname)(?![a-z])/g, '')
    .replace(/\\left|\\right|\\displaystyle/g, '')
    .replace(/\\dfrac|\\tfrac/g, '\\frac')
    .replace(/\\[,;!: ]|~|&nbsp;| |\s/g, '')
    .replace(/[{}]/g, '')
}

/** Positions des mises en évidence orange d'une correction. */
function occurrences(correction: string) {
  const resultat: { debut: number; fin: number; contenu: string }[] = []
  debutMiseEnEvidence.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = debutMiseEnEvidence.exec(correction)) !== null) {
    const ouvrante = m.index + m[0].length - 1
    let profondeur = 0
    let fermante = -1
    for (let i = ouvrante; i < correction.length; i++) {
      if (correction[i] === '\\') i++
      else if (correction[i] === '{') profondeur++
      else if (correction[i] === '}' && --profondeur === 0) {
        fermante = i
        break
      }
    }
    if (fermante === -1) break
    // `{\color{…}\boldsymbol{…}}` : l'accolade qui ouvre le groupe précède `\color`
    const debut = correction[m.index - 1] === '{' ? m.index - 1 : m.index
    const fin = correction[fermante + 1] === '}' ? fermante + 2 : fermante + 1
    resultat.push({
      debut,
      fin,
      contenu: correction.slice(ouvrante + 1, fermante).trim(),
    })
    debutMiseEnEvidence.lastIndex = fermante + 1
  }
  return resultat
}

/**
 * Longueur du plus long segment de `texte` (lu depuis `depuis`, vers la droite si
 * `sens` vaut 1, vers la gauche sinon) qui s'écrit comme `attendu`, sans sortir
 * de la formule. Renvoie 0 si aucun segment ne convient.
 */
function longueurCorrespondante(
  texte: string,
  depuis: number,
  sens: 1 | -1,
  attendu: string,
): number {
  const limite =
    sens === 1 ? texte.indexOf('$', depuis) : texte.lastIndexOf('$', depuis - 1)
  const fin = limite === -1 ? (sens === 1 ? texte.length : 0) : limite
  const cible = canon(attendu)
  if (cible === '') return 0
  let longueur = 0
  for (let n = 1; n <= Math.abs(fin - depuis); n++) {
    const segment =
      sens === 1
        ? texte.slice(depuis, depuis + n)
        : texte.slice(depuis - n, depuis)
    // le plus long segment : il emporte les accolades fermantes de `\text{…}`
    if (canon(segment) === cible) longueur = n
  }
  return longueur
}

/** Repère `a)`, `1)`… produit par `numAlpha` : un span orange qui ne désigne aucune réponse. */
const repereDeSousQuestion = /^\s*(?:[a-z]|\d{1,2})\)(?:&nbsp;|\s)*$/i

const spanOrange = new RegExp(
  `<span style="color:\\s*#?${hexOrange}\\s*;\\s*font-weight:\\s*bold;?">([^<]*)</span>`,
  'gi',
)

/** Texte d'une proposition sans HTML ni `$` : forme comparable de sa lecture. */
function lecture(proposition: string): string {
  return canon(proposition.replace(/<[^>]*>/g, '').replace(/\$/g, ''))
}

/** Proposition réécrite avec une mise en évidence sur chaque morceau, formule ou texte. */
function propositionEnEvidence(proposition: string): string {
  return proposition
    .trim()
    .split(/(\$[^$]*\$)/)
    .filter((morceau) => morceau.trim() !== '')
    .map((morceau) =>
      morceau.startsWith('$')
        ? `$${miseEnEvidence(sansVphantom(morceau.slice(1, -1)).trim())}$`
        : texteEnCouleurEtGras(
            // en LaTeX, un % non protégé commente la fin de la ligne
            context.isHtml
              ? morceau.trim()
              : morceau.trim().replace(/(?<!\\)%/g, '\\%'),
          ),
    )
    .join(' ')
}

/**
 * En QCM, la mise en évidence de la correction porte sur la bonne proposition
 * complète, et pas seulement sur la valeur : `x = 6` et non `6`, `90 km` et non `90`,
 * `\sqrt{85}\text{ cm}` et non `\sqrt{85}`. La correction est écrite pour la saisie
 * libre, qui n'attend que la valeur.
 * - Quand la bonne proposition est une formule qui prolonge (étiquette avant, unité
 *   après) l'unique valeur mise en évidence, la mise en évidence s'étend et la phrase
 *   n'a plus à redire l'étiquette ou l'unité.
 * - Sinon, si tout ce qui est mis en évidence appartient à la bonne proposition (équation
 *   alignée, unité en texte…), les mises en évidence sont retirées de la correction et une
 *   phrase finale donne la bonne proposition complète en évidence.
 * Une correction dont les mises en évidence n'appartiennent pas à la proposition (autre
 * formulation, autre valeur) est laissée telle quelle : c'est à l'exercice de la corriger.
 * @param correction la correction écrite par l'exercice
 * @param bonneProposition le texte de la bonne proposition, par exemple `$x = 6$`
 */
export function alignerMiseEnEvidenceQcm(
  correction: string,
  proposition: string | undefined,
): string {
  // le point final d'une proposition n'est pas ce que la correction met en évidence
  const bonneProposition = proposition?.replace(/[\s.]+$/, '')
  if (bonneProposition == null || /<|\\begin\{/.test(bonneProposition))
    return correction
  const cibleLue = lecture(bonneProposition)
  const formules = occurrences(correction)
  const textes = [...correction.matchAll(spanOrange)]
    .filter((m) => !repereDeSousQuestion.test(m[1]))
    .map((m) => ({ debut: m.index, contenu: m[1] }))
  // dans l'ordre de la correction, comme les lit la vérification des réponses
  const contenus = [...formules, ...textes]
    .sort((a, b) => a.debut - b.debut)
    .map((morceau) => morceau.contenu)
  if (contenus.length === 0) {
    // aucune mise en évidence : la proposition complète conclut la correction
    const formule = bonneProposition.trim().match(/^\$([^$]+)\$$/)
    const separateur = correction === '' ? '' : '<br>'
    return formule == null
      ? `${correction}${separateur}La bonne proposition est : ${propositionEnEvidence(bonneProposition)}.`
      : `${correction}${separateur}Donc ${propositionEnEvidence(bonneProposition)}.`
  }
  const lus = contenus.map((contenu) => canon(contenu))
  const motUnique = /^[^\s$]+$/.test(bonneProposition.trim())
  if (
    formules.length === 0 &&
    motUnique &&
    textes.length > 0 &&
    !lus.includes(cibleLue)
  ) {
    // « Oui », « Non », « Rose »… : les phrases mises en évidence justifient, le mot conclut
    const sansPhrases = correction.replace(
      spanOrange,
      (span, contenu: string) =>
        repereDeSousQuestion.test(contenu) ? span : contenu,
    )
    return `${sansPhrases}<br>La réponse est ${propositionEnEvidence(bonneProposition)}.`
  }
  if (
    formules.length === 0 &&
    textes.length === 1 &&
    !cibleLue.includes(lus[0]) &&
    // une phrase qui contient la proposition la met déjà en évidence : on la garde
    !lus[0].includes(cibleLue)
  ) {
    // la seule phrase mise en évidence reformule la proposition : elle lui cède la place
    const span = [...correction.matchAll(spanOrange)].filter(
      (m) => !repereDeSousQuestion.test(m[1]),
    )[0]
    return (
      correction.slice(0, span.index) +
      propositionEnEvidence(bonneProposition) +
      correction.slice(span.index + span[0].length)
    )
  }
  if (lus.some((lu) => lu === '' || !cibleLue.includes(lu))) return correction
  // une même réponse reprise plusieurs fois (calcul, puis conclusion) compte une fois
  if (new Set(lus).size === 1 && lus[0] === cibleLue) return correction
  if (lus.join('') === cibleLue) return correction
  if (lus.length === 1 && formules.length === 1) {
    const inline = etendreEnLigne(
      correction,
      formuleComplete(bonneProposition),
      formules[0],
    )
    if (inline != null) return inline
  }
  if (formules.length >= 2 && textes.length === 0) {
    const regroupe = regrouperDansLaProposition(
      correction,
      formules,
      bonneProposition,
    )
    if (regroupe != null) return regroupe
  }
  const nue = (texte: string) =>
    texte.replace(spanOrange, (span, contenu: string) =>
      repereDeSousQuestion.test(contenu) ? span : contenu,
    )
  let sansEvidence = correction
  for (const { debut, fin, contenu } of [...formules].reverse()) {
    sansEvidence =
      sansEvidence.slice(0, debut) + contenu + sansEvidence.slice(fin)
  }
  // la dernière ligne alignée, qui ne redit plus que la ligne précédente, disparaît
  sansEvidence = nue(sansEvidence).replace(
    /(&\s*=\s*((?:(?!\\\\).)+?))\s*\\\\\s*&\s*=\s*((?:(?!\\\\).)+?)\s*(\\end\{aligned\})/,
    (ligne, garde, avant, derniere, fin) =>
      canon(avant) === canon(derniere) ? `${garde}${fin}` : ligne,
  )
  const formule = bonneProposition.trim().match(/^\$([^$]+)\$$/)
  return formule == null
    ? `${sansEvidence}<br>La bonne proposition est : ${propositionEnEvidence(bonneProposition)}.`
    : `${sansEvidence}<br>Donc ${propositionEnEvidence(bonneProposition)}.`
}

/**
 * Impose la bonne proposition d'un QCM comme seule mise en évidence de la correction :
 * toutes les autres mises en évidence (valeurs intermédiaires, morceaux de phrase) sont
 * retirées et une dernière phrase donne la bonne proposition complète en évidence.
 * À réserver aux exercices dont la correction ne se laisse pas aligner par
 * `alignerMiseEnEvidenceQcm`.
 * @param correction la correction écrite par l'exercice
 * @param proposition le texte de la bonne proposition, par exemple `Vrai` ou `$x = 6$`
 */
export function imposerMiseEnEvidenceQcm(
  correction: string,
  proposition: string,
): string {
  const bonneProposition = proposition.replace(/[\s.]+$/, '')
  let sansEvidence = correction
  for (const { debut, fin, contenu } of [
    ...occurrences(correction),
  ].reverse()) {
    sansEvidence =
      sansEvidence.slice(0, debut) + contenu + sansEvidence.slice(fin)
  }
  sansEvidence = sansEvidence.replace(spanOrange, (span, contenu: string) =>
    repereDeSousQuestion.test(contenu) ? span : contenu,
  )
  const separateur = sansEvidence === '' ? '' : '<br>'
  if (/^[^\s$]+$/.test(bonneProposition.trim())) {
    return `${sansEvidence}${separateur}La réponse est ${propositionEnEvidence(bonneProposition)}.`
  }
  return /^\$[^$]+\$$/.test(bonneProposition.trim())
    ? `${sansEvidence}${separateur}Donc ${propositionEnEvidence(bonneProposition)}.`
    : `${sansEvidence}${separateur}La bonne proposition est : ${propositionEnEvidence(bonneProposition)}.`
}

/**
 * Plusieurs valeurs mises en évidence séparément à l'intérieur d'une même formule qui est
 * exactement la bonne proposition (`$A(\\textcolor{orange}{1}\\,;\\,\\textcolor{orange}{-4})$`) :
 * un seul orange sur la formule entière remplace les mises en évidence séparées.
 * `undefined` si les mises en évidence ne sont pas toutes dans une formule qui se lit
 * comme la bonne proposition.
 */
function regrouperDansLaProposition(
  correction: string,
  formules: { debut: number; fin: number; contenu: string }[],
  bonneProposition: string,
): string | undefined {
  const modele = bonneProposition.trim().match(/^\$([^$]+)\$$/)
  if (modele == null) return undefined
  const debutFormule = correction.lastIndexOf('$', formules[0].debut - 1) + 1
  const finFormule = correction.indexOf('$', formules[formules.length - 1].fin)
  if (debutFormule === 0 || finFormule === -1) return undefined
  let formule = correction.slice(debutFormule, finFormule)
  if (formule.includes('$')) return undefined
  for (const { debut, fin, contenu } of [...formules].reverse()) {
    formule =
      formule.slice(0, debut - debutFormule) +
      contenu +
      formule.slice(fin - debutFormule)
  }
  if (canon(formule) !== canon(modele[1])) return undefined
  return (
    correction.slice(0, debutFormule) +
    miseEnEvidence(formule.trim()) +
    correction.slice(finFormule)
  )
}

/**
 * La bonne proposition écrite en une seule formule : `$90$ km` devient `90\\text{ km}`.
 * `undefined` si elle mêle davantage que une formule et un texte.
 */
function formuleComplete(proposition: string): string | undefined {
  const morceaux = proposition
    .trim()
    .split(/(\$[^$]*\$)/)
    .filter((morceau) => morceau.trim() !== '')
  const formules = morceaux.filter((morceau) => morceau.startsWith('$'))
  if (formules.length !== 1 || morceaux.length > 2) return undefined
  const formule = sansVphantom(formules[0].slice(1, -1)).trim()
  if (morceaux.length === 1) return formule
  const texte = morceaux.find((morceau) => !morceau.startsWith('$'))!.trim()
  return morceaux[0].startsWith('$')
    ? `${formule}\\text{ ${texte}}`
    : `\\text{${texte} }${formule}`
}

function etendreEnLigne(
  correction: string,
  complet: string | undefined,
  { debut, fin, contenu }: { debut: number; fin: number; contenu: string },
): string | undefined {
  if (complet == null) return undefined
  const cComplet = canon(complet)
  const cContenu = canon(contenu)
  const position = cComplet.indexOf(cContenu)
  if (position === -1) return undefined
  const avant = cComplet.slice(0, position)
  const apres = cComplet.slice(position + cContenu.length)
  let debutRemplace = debut
  let finRemplace = fin
  if (avant !== '') {
    const n = longueurCorrespondante(correction, debut, -1, avant)
    if (n === 0) return undefined
    debutRemplace = debut - n
  }
  if (apres !== '') {
    const n = longueurCorrespondante(correction, fin, 1, apres)
    if (n === 0) return undefined
    finRemplace = fin + n
  }
  return (
    correction.slice(0, debutRemplace) +
    miseEnEvidence(complet) +
    correction.slice(finRemplace)
  )
}

/**
 * Les exercices écrits à la main (`autoCorrection[i]` rempli par l'exercice, souvent
 * avec `propositionsQcm`) ne passent pas par le constructeur de QCM : leur correction
 * est alignée ici, une fois l'exercice généré. Seul le mode interactif affiche alors
 * un QCM ; hors interactif, la correction reste celle de la justification.
 */
export function alignerCorrectionsQcmEcrites(exercice: IExercice): void {
  if (!exercice.interactif || exercice.typeExercice === 'simple') return
  exercice.autoCorrection.forEach((autoCorrection, i) => {
    const propositions = autoCorrection?.propositions
    if (
      !Array.isArray(propositions) ||
      (autoCorrection.formatInteractif != null &&
        autoCorrection.formatInteractif !== 'mathalea-qcm') ||
      typeof exercice.listeCorrections[i] !== 'string'
    )
      return
    const bonnes = propositions.filter(
      (proposition) => proposition.statut === true,
    )
    if (bonnes.length !== 1) return
    exercice.listeCorrections[i] = alignerMiseEnEvidenceQcm(
      exercice.listeCorrections[i],
      String(bonnes[0].texte),
    )
  })
}

/**
 * Pour les exercices dont les corrections écrites à la main ne se laissent pas aligner
 * seules : pour chaque question qui a une unique bonne proposition, la correction est
 * alignée par `alignerMiseEnEvidenceQcm` ; si ses mises en évidence ne correspondent
 * toujours pas à la proposition, `imposerMiseEnEvidenceQcm` les remplace par elle.
 * À appeler en fin de `nouvelleVersion()`, quel que soit le mode (interactif ou non).
 */
export function imposerCorrectionsQcm(exercice: IExercice): void {
  exercice.autoCorrection.forEach((autoCorrection, i) => {
    const propositions = autoCorrection?.propositions
    const correction = exercice.listeCorrections[i]
    if (!Array.isArray(propositions) || typeof correction !== 'string') return
    const bonnes = propositions.filter(
      (proposition) => proposition.statut === true,
    )
    if (bonnes.length !== 1) return
    const proposition = String(bonnes[0].texte)
    const cible = lecture(proposition.replace(/[\s.]+$/, ''))
    const lus = [
      ...occurrences(correction).map((m) => canon(m.contenu)),
      ...[...correction.matchAll(spanOrange)]
        .filter((m) => !repereDeSousQuestion.test(m[1]))
        .map((m) => canon(m[1])),
    ]
    if (lus.join('') === cible || lus.includes(cible)) return
    const alignee = alignerMiseEnEvidenceQcm(correction, proposition)
    exercice.listeCorrections[i] =
      alignee !== correction
        ? alignee
        : imposerMiseEnEvidenceQcm(correction, proposition)
  })
}

/** Les accolades d'un morceau de LaTeX se referment-elles toutes ? */
function accoladesEquilibrees(latex: string): boolean {
  let profondeur = 0
  for (let i = 0; i < latex.length; i++) {
    if (latex[i] === '\\') i++
    else if (latex[i] === '{') profondeur++
    else if (latex[i] === '}' && --profondeur < 0) return false
  }
  return profondeur === 0
}

/**
 * Découpe `contenu` en `[avant, valeur 1, entre, valeur 2, …, après]` : chaque valeur se
 * lit comme la cible correspondante, dans l'ordre, et chaque morceau garde ses accolades
 * équilibrées. `undefined` si aucun découpage ne convient.
 */
function decouper(contenu: string, cibles: string[]): string[] | undefined {
  const espace = /^(?:\\[,;!: ]|~|&nbsp;|\s)/
  type Decoupe = { morceaux: string[]; fin: number }
  // les valeurs se cherchent de la dernière à la première, la plus tardive d'abord : dans
  // `\dfrac{a^8}{a^4} = a^4`, la réponse `a^4` est celle du second membre
  const chercher = (k: number, limite: number): Decoupe | undefined => {
    for (let s = limite - 1; s >= 0; s--) {
      for (let e = s + 1; e <= limite; e++) {
        // `\left` ne se sépare pas de son délimiteur : la valeur le reprend
        const commande = contenu.slice(0, s).match(/\\(?:left|bigg?|Bigg?)$/)
        const debut = commande == null ? s : s - commande[0].length
        const valeur = contenu.slice(debut, e)
        if (canon(valeur) !== cibles[k]) continue
        // une valeur ne commence pas par une espace : elle reste dans l'entre-deux
        if (espace.test(valeur)) continue
        // une valeur ne coupe pas une commande LaTeX (`\\right`) en deux
        if (/(?<!\\)(?:\\\\)*\\$/.test(valeur)) continue
        if (
          /\\[a-zA-Z]*$/.test(contenu.slice(0, s)) &&
          /^[a-zA-Z]/.test(valeur)
        )
          continue
        if (!accoladesEquilibrees(valeur)) continue
        // une valeur n'est pas un morceau de nombre : `6,4` n'est pas dans `6,40`
        const suite = contenu.slice(e)
        if (/\d$/.test(valeur) && /^(?:\d|[,.]\d)/.test(suite)) continue
        if (/^\d/.test(valeur) && /\d[,.]?$/.test(contenu.slice(0, debut)))
          continue
        if (k === 0) {
          const avant = contenu.slice(0, debut)
          if (accoladesEquilibrees(avant))
            return { morceaux: [avant, valeur], fin: e }
          continue
        }
        const precedent = chercher(k - 1, debut)
        if (precedent == null) continue
        const entre = contenu.slice(precedent.fin, debut)
        if (!accoladesEquilibrees(entre)) continue
        return { morceaux: [...precedent.morceaux, entre, valeur], fin: e }
      }
    }
    return undefined
  }
  const decoupe = chercher(cibles.length - 1, contenu.length)
  if (decoupe == null) return undefined
  const apres = contenu.slice(decoupe.fin)
  return accoladesEquilibrees(apres) ? [...decoupe.morceaux, apres] : undefined
}

/**
 * En saisie libre, le champ n'attend que la valeur : le libellé (`S =`) et l'unité
 * (`\,\%`, `\text{ cm}`) que la mise en évidence d'un QCM contient sortent de l'orange.
 * Avec plusieurs champs (`A(%{champ1} ; %{champ2})`), chaque valeur reste en orange et le
 * reste de la proposition en noir. Une mise en évidence qui ne contient pas toutes les
 * réponses attendues, dans l'ordre et telles quelles, est laissée intacte.
 * @param correction la correction
 * @param reponse ce que l'élève saisit, par exemple `20`, ou une valeur par champ
 */
export function restreindreALaReponse(
  correction: string,
  reponse: string | string[],
): string {
  const cibles = (Array.isArray(reponse) ? reponse : [reponse]).map(canon)
  if (cibles.some((cible) => cible === '')) return correction
  // l'orange se lit déjà comme la réponse attendue (valeur et unité que le champ attend)
  const morceauxOrange = [
    ...occurrences(correction).map((m) => ({
      place: m.debut,
      lu: canon(m.contenu),
    })),
    ...[...correction.matchAll(spanOrange)]
      .filter((m) => !repereDeSousQuestion.test(m[1]))
      .map((m) => ({ place: m.index, lu: lecture(m[1]) })),
  ]
    .sort((x, y) => x.place - y.place)
    .map((m) => m.lu)
  if (morceauxOrange.join('') === cibles.join('')) return correction
  // un texte mis en évidence (`une hausse de`, `et`) n'est pas ce que le champ attend
  let resultat = correction.replace(spanOrange, (span, contenu: string) =>
    repereDeSousQuestion.test(contenu) ||
    cibles.some((cible) => lecture(contenu).includes(cible))
      ? span
      : contenu,
  )
  for (const { debut, fin, contenu } of [...occurrences(resultat)].reverse()) {
    const lu = canon(contenu)
    if (lu === cibles.join('')) continue
    let morceaux = decouper(contenu, cibles)
    if (morceaux == null) continue
    // un signe qui ouvre la mise en évidence (`+36`, `-0,5`) reste avec sa valeur
    if (/^[+\-−]$/.test(morceaux[0].trim()))
      morceaux = ['', morceaux[0].trim() + morceaux[1], ...morceaux.slice(2)]
    // déjà exactement les valeurs attendues, sans libellé ni unité
    if (morceaux.every((morceau, k) => k % 2 === 1 || morceau.trim() === ''))
      continue
    // hors de l'orange, l'unité n'a plus à être en gras
    const normal = (latex: string) => latex.replace(/\\textbf\{/g, '\\text{')
    const remplacement = morceaux
      .map((morceau, k) =>
        k % 2 === 1 ? miseEnEvidence(morceau) : normal(morceau),
      )
      .join('')
    resultat = resultat.slice(0, debut) + remplacement + resultat.slice(fin)
  }
  return resultat
}

/**
 * Point d'entrée unique : ce que la correction d'une question à bonne proposition
 * unique met en orange selon le mode.
 * - Saisie libre (`reponseSaisie` donnée) : seulement ce que l'élève saisit.
 * - Sinon (QCM, ou correction affichée sans interactivité) : la bonne proposition
 *   complète, unité comprise.
 * @param correction la correction écrite par l'exercice
 * @param proposition la bonne proposition du QCM, par exemple `$20\,\%$`
 * @param options.reponseSaisie la réponse attendue dans le champ, en saisie libre
 */
export function mettreEnEvidenceSelonMode(
  correction: string,
  proposition: string | undefined,
  options: { reponseSaisie?: string | string[] } = {},
): string {
  return options.reponseSaisie == null
    ? alignerMiseEnEvidenceQcm(correction, proposition)
    : restreindreALaReponse(correction, options.reponseSaisie)
}
