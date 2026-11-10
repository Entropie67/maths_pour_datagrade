import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import {
  droite,
  droiteParPointEtParallele,
  droiteParPointEtPente,
  droiteParPointEtPerpendiculaire,
  labelOnLine,
} from '../../lib/2d/droites'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { rotation } from '../../lib/2d/transformations'
import { pointIntersectionDD } from '../../lib/2d/utilitairesPoint'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { bleuMathalea, orangeMathalea } from '../../lib/colors'
import { enleveDoublonNum, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { symboleParallele } from '../../lib/outils/notationsGeometrie'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const dateDePublication = '14/01/2025'
export const amcReady = true
export const amcType = 'AMCOpen'
export const titre =
  'Utiliser les propriétés des droites parallèles et perpendiculaires - v2'

/**
 * @author Éric Elter sur la base de 5G33-2
 * @author Jean-claude Lhote pour 5G33-2 (EE : pour l'ajout d'AMC et la possibilité de sélectionner différents mélanges)
 * @author Mickael Guironnet pour 5G33-2 (refactoring avec ajout des 4 à 6 et des figures)
 * Dans cet exercice, on peut choisir la(les) propriété(s) qu'on veut traiter.
 */
export const uuid = 'am8cs'

export const refs = {
  'fr-fr': ['5G4A-4'],
  'fr-2016': ['5G33-2a'],
  'fr-ch': ['9R1ES1B-8', '9R2ES1B-8', '9R3ES1B-8', 'PRQES01A-9', 'PRQES04A-8'],
}
export default class ProprietesParallelesPerpendiculaires extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Type de raisonnement',
      'Nombres séparés par des tirets :\n1 : Une étape\n2 : Une étape avec distracteur\n3 : Deux étapes\n4 : Trois étapes\n5 : Mélange',
    ]
    // this.besoinFormulaire2CaseACocher = ['Que des perpendiculaires', false]
    // EE : Ai enlevé ce paramètre car avec le choix des propriétés, il ne me semble plus pertinent.
    this.besoinFormulaire3CaseACocher = ['Avec le dessin', true]
    this.besoinFormulaire4Texte = [
      'Type de propriété',
      'Nombres séparés par des tirets :\n1 : P1\n2 : P2\n3 : P3\n4 : Mélange',
    ]
    this.besoinFormulaire5CaseACocher = ['Pas de mélange des propriétés', false]

    this.nbQuestions = 3

    this.sup = '3'
    // this.sup2 = false
    this.sup3 = true
    this.sup4 = '4'
    this.sup5 = false
    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = false
    this.comment =
      "Dans cet exercice, on peut choisir la(les) propriété(s) qu'on veut traiter.<br><br>"
    this.comment +=
      "Il se peut que l'exercice vous propose moins de questions que le nombre demandé par manque de possibiilités d'exercices différents. Pour augmenter cette possibilité, choisissez d'autres types de raisonnement.<br><br>"
    this.comment +=
      "Les propriétés évoquées dans 'Type de propriété' sont : <br><br> P1 : Si deux droites sont parallèles à une même droite alors elles sont parallèles entre elles.<br><br>"
    this.comment +=
      "P2 : Si deux droites sont parallèles alors toute droite perpendiculaire à l'une est aussi perpendiculaire à l'autre.<br><br>"
    this.comment +=
      'P3 : Si deux droites sont perpendiculaires à une même droite alors elles sont parallèles entre elles.<br><br>'
    this.comment +=
      "Le paramètre 'Pas de mélange des propriétés' permet soit de mélanger les propriétés qu'on a choisies, soit de ne retrouver qu'une seule propriété à la fois (avec le nombre d'étapes choisi).<br><br>"
    this.comment +=
      "Si aucun raisonnement ne respecte à la fois le type de raisonnement et les propriétés choisis, l'exercice garde le type de raisonnement et associe les propriétés choisies à d'autres propriétés."
  }

  nouvelleVersion() {
    let QuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 4,
      defaut: 5,
      melange: 5,
      nbQuestions: 50, // EE : laisser 50 à cause de mélange
      shuffle: true,
    }).map(Number)
    QuestionsDisponibles = enleveDoublonNum(QuestionsDisponibles)

    let proprietesDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup4,
      min: 1,
      max: 3,
      defaut: 4,
      melange: 4,
      nbQuestions: 50, // EE : laisser 50 à cause de mélange
      shuffle: true,
    }).map(Number)
    proprietesDisponibles = enleveDoublonNum(proprietesDisponibles)

    const droiteColor = context.isHtml
      ? ['red', bleuMathalea, 'green', 'black', 'magenta', orangeMathalea]
      : ['black', 'black', 'black', 'black', 'black', 'black']

    const differentsCas = [
      [1, 0, 0], // Cas 0
      [0, 1, 0],
      [0, 0, 1],
      [0, 1, 0],
      [0, 1, 0], // Cas 4
      [0, 0, 1],
      [1, 0, 0],
      [1, 0, 0],
      [1, 1, 0], // Cas 8
      [1, 0, 0],
      [0, 1, 1],
      [0, 1, 0],
      [0, 1, 1],
      [1, 0, 1],
      [0, 1, 1],
      [1, 0, 0],
      [1, 1, 1], // Cas 16
      [0, 1, 0],
      [1, 1, 1],
      [0, 1, 0],
      [1, 1, 1],
      [1, 0, 1],
      [0, 1, 1],
      [1, 1, 0], // Cas 23
      [1, 1, 1],
      [0, 1, 1],
      [0, 1, 1],
      [0, 1, 1],
      [0, 1, 1],
      [1, 1, 1],
      [0, 1, 1], // Cas 30
    ]

    type ModeSelection = 'strict' | 'large'

    /**
     * Sélectionne les indices des cas compatibles avec un ensemble de propriétés,
     * selon un mode de filtrage strict ou large.
     *
     * Chaque élément de `differentsCas` est un tableau de 0 et de 1 représentant
     * l'activation (1) ou non (0) des propriétés 1, 2, 3, etc.
     *
     * @param differentsCas
     * Tableau de cas possibles. Chaque cas est un tableau de nombres (0 ou 1),
     * par exemple : [1, 0, 0], [1, 1, 0], [0, 1, 0].
     *
     * @param proprietesDisponibles
     * Tableau des indices de propriétés autorisées (indexées à partir de 1),
     * par exemple : [1], [1, 2] ou [1, 2, 3].
     *
     * @param mode
     * Mode de sélection :
     * - `"strict"` : seuls les cas contenant exactement une propriété active
     *   parmi celles autorisées sont sélectionnés.
     * - `"large"` : tous les cas contenant au moins une propriété active
     *   parmi celles autorisées sont sélectionnés, y compris les combinaisons.
     *
     * @returns
     * Un tableau contenant les indices (0-based) des cas de `differentsCas`
     * qui satisfont les conditions de sélection.
     *
     * @author Éric Elter (pour le prompt)
     * @example
     * ```ts
     * const differentsCas = [
     *   [1, 0, 0],
     *   [0, 1, 0],
     *   [1, 1, 0],
     *   [0, 0, 1]
     * ];
     *
     * selectionnerCas(differentsCas, [1, 2], "strict");
     * // → [0, 1]
     *
     * selectionnerCas(differentsCas, [1, 2], "large");
     * // → [0, 1, 2]
     * ```
     */
    function selectionnerCas(
      differentsCas: number[][],
      proprietesDisponibles: number[],
      mode: ModeSelection,
    ): number[] {
      const resultats: number[] = []

      for (let k = 0; k < differentsCas.length; k++) {
        const cas = differentsCas[k]

        // indices attendus à 1 (0-based)
        const indicesActifs = cas
          .map((v, i) => (v === 1 ? i + 1 : null))
          .filter((v): v is number => v !== null)

        // On ignore tout cas qui contient une propriété non autorisée
        if (!indicesActifs.every((i) => proprietesDisponibles.includes(i))) {
          continue
        }

        if (mode === 'strict') {
          // une seule propriété active
          if (indicesActifs.length === 1) {
            resultats.push(k)
          }
        } else {
          // mode large : au moins une propriété active
          if (indicesActifs.length >= 1) {
            resultats.push(k)
          }
        }
      }
      return resultats
    }

    // listeTypeDeQuestions contient tous les cas qui correspondent aux propriétés demandées.
    let listeTypeDeQuestions = selectionnerCas(
      differentsCas,
      proprietesDisponibles,
      this.sup5 ? 'strict' : 'large',
    )

    // Maintenant, il faut aussi prendre en compte le choix sur le nombre d'étapes.

    /**
     * Filtre une liste d’indices de types de questions en fonction des catégories
     * de questions disponibles.
     *
     * Chaque valeur de `questionsDisponibles` active une plage d’indices autorisés :
     * - 1 → indices de 1 à 6
     * - 2 → indices de 4 à 6
     * - 3 → indices de 7 à 15
     * - 4 → indices de 16 à 30
     *
     * Les plages sont cumulables : un indice est conservé s’il appartient
     * à au moins une des plages activées.
     *
     * @param listeTypeDeQuestions
     * Tableau d’entiers (tous distincts) représentant des types de questions
     * possibles, avec des valeurs comprises entre 0 et 30.
     *
     * @param questionsDisponibles
     * Tableau d’entiers (tous distincts) représentant les catégories de questions
     * disponibles. Les valeurs possibles sont 1, 2, 3 ou 4.
     *
     * @returns
     * Un nouveau tableau contenant uniquement les entiers de `listeTypeDeQuestions`
     * qui appartiennent à au moins une plage autorisée par `questionsDisponibles`.
     *
     * @author Éric Elter (pour le prompt)
     * @example
     * ```ts
     * const questionsDisponibles = [1, 4];
     * const listeTypeDeQuestions = [0, 3, 5, 6, 8, 17, 22, 30];
     *
     * filtrerListeTypeDeQuestions(listeTypeDeQuestions, questionsDisponibles);
     * // → [3, 5, 6, 17, 22, 30]
     * ```
     */
    function filtrerListeTypeDeQuestions(
      listeTypeDeQuestions: number[],
      questionsDisponibles: number[],
    ): number[] {
      return listeTypeDeQuestions.filter((n) => {
        return (
          (questionsDisponibles.includes(1) && n >= 1 && n <= 6) ||
          (questionsDisponibles.includes(2) && n >= 4 && n <= 6) ||
          (questionsDisponibles.includes(3) && n >= 7 && n <= 15) ||
          (questionsDisponibles.includes(4) && n >= 16 && n <= 30)
        )
      })
    }

    listeTypeDeQuestions = filtrerListeTypeDeQuestions(
      listeTypeDeQuestions,
      QuestionsDisponibles,
    )

    // Certaines combinaisons n'existent pas : par exemple, un raisonnement à
    // plusieurs étapes ne peut pas utiliser une seule propriété dans tous les cas.
    // On garde alors le type de raisonnement demandé, et on prend les cas qui
    // utilisent au moins une des propriétés choisies, éventuellement avec d'autres.
    if (listeTypeDeQuestions.length === 0) {
      listeTypeDeQuestions = filtrerListeTypeDeQuestions(
        differentsCas.flatMap((cas, k) =>
          proprietesDisponibles.some((p) => cas[p - 1] === 1) ? [k] : [],
        ),
        QuestionsDisponibles,
      )
    }

    this.nbQuestions = Math.min(this.nbQuestions, listeTypeDeQuestions.length)

    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      texte = ''
      texteCorr = ''

      const numDroites = shuffle([1, 2, 3, 4, 5])
      const d = []
      const dE = []
      const P = []
      const objets = []
      const objets2 = []
      let code: number[][] = []
      let codeDistracteurs: number[][] = []

      switch (listeTypeDeQuestions[i]) {
        // 1 à 6 : 1 étape   (4, 5 et 6 avec distracteur), le cas 0 n'est jamais proposé
        // 7 à 15 : 2 étapes
        // 16 à 30 : 3 étapes
        case 0: // si 1//2 et 2//3 alors 1//3
          code = [
            [1, 2, 1],
            [2, 3, 1],
          ]
          break
        case 1: // si 1//2 et 2T3 alors 1T3
          code = [
            [1, 2, 1],
            [2, 3, -1],
          ]
          break
        case 2: // si 1T2 et 2T3 alors 1//3
          code = [
            [1, 2, -1],
            [2, 3, -1],
          ]
          break
        case 3: // si 1T2 et 2//3 alors 1T3
          code = [
            [1, 2, -1],
            [2, 3, 1],
          ]
          break
        case 4: // si 1T2 et 2//3 alors 1T3 et 4 distracteur
          code = [
            [1, 2, -1],
            [2, 3, 1],
          ]
          codeDistracteurs = [[1, 4, 1]]
          break
        case 5: // si 1T2 et 2T3 alors 1//3 et 4 distracteur
          code = [
            [1, 2, -1],
            [2, 3, -1],
          ]
          codeDistracteurs = [[2, 4, 1]]
          break
        case 6: // si 1//2 et 2//3 alors 1//3 et 4 distracteur
          code = [
            [1, 2, 1],
            [2, 3, 1],
          ]
          codeDistracteurs = [[1, 4, -1]]
          break
        case 7: // Si 1//2 et 2//3 et 3//4 alors 1//4
          code = [
            [1, 2, 1],
            [2, 3, 1],
            [3, 4, 1],
          ]
          break
        case 8: // Si 1//2 et 2//3 et 3T4 alors 1T4 -> P1 et P2
          code = [
            [1, 2, 1],
            [2, 3, 1],
            [3, 4, -1],
          ]
          break
        case 9: // Si 1//2 et 2//3 et 3//4 alors 1//4 (même code que le cas 7)
          code = [
            [1, 2, 1],
            [2, 3, 1],
            [3, 4, 1],
          ]
          break
        case 10: // Si 1//2 et 2T3 et 3T4 alors 1//4
          code = [
            [1, 2, 1],
            [2, 3, -1],
            [3, 4, -1],
          ]
          break
        case 11: // Si 1T2 et 2//3 et 3//4 alors 1T4
          code = [
            [1, 2, -1],
            [2, 3, 1],
            [3, 4, 1],
          ]
          break
        case 12: // Si 1T2 et 2//3 et 3T4 alors 1//4
          code = [
            [1, 2, -1],
            [2, 3, 1],
            [3, 4, -1],
          ]
          break
        case 13: // Si 1T2 et 2T3 et 3//4 alors 1//4
          code = [
            [1, 2, -1],
            [2, 3, -1],
            [3, 4, 1],
          ]
          break
        case 14: // Si 1T2 et 2T3 et 3T4 alors 1T4
          code = [
            [1, 2, -1],
            [2, 3, -1],
            [3, 4, -1],
          ]
          break
        case 15: // Si 1//2 et 2//3 et 3//4 et 4//5 alors 1//5
          code = [
            [1, 2, 1],
            [2, 3, 1],
            [3, 4, 1],
            [4, 5, 1],
          ]
          break
        case 16: // Si 1//2 et 2//3 et 3T4 et 4//5 alors 1T5
          code = [
            [1, 2, 1],
            [2, 3, 1],
            [3, 4, -1],
            [4, 5, 1],
          ]
          break
        case 17: // Si 1//2 et 2T3 et 3//4 et 4//5 alors 1T5
          code = [
            [1, 2, 1],
            [2, 3, -1],
            [3, 4, 1],
            [4, 5, 1],
          ]
          break
        case 18: // Si 1//2 et 2T3 et 3T4 et 4//5 alors 1//5
          code = [
            [1, 2, 1],
            [2, 3, -1],
            [3, 4, -1],
            [4, 5, 1],
          ]
          break
        case 19: // Si 1T2 et 2//3 et 3//4 et 4//5 alors 1T5
          code = [
            [1, 2, -1],
            [2, 3, 1],
            [3, 4, 1],
            [4, 5, 1],
          ]
          break
        case 20: // Si 1T2 et 2//3 et 3T4 et 4//5 alors 1//5
          code = [
            [1, 2, -1],
            [2, 3, 1],
            [3, 4, -1],
            [4, 5, 1],
          ]
          break
        case 21: // Si 1T2 et 2T3 et 3//4 et 4//5 alors 1//5
          code = [
            [1, 2, -1],
            [2, 3, -1],
            [3, 4, 1],
            [4, 5, 1],
          ]
          break
        case 22: // Si 1T2 et 2T3 et 3T4 et 4//5 alors 1T5
          code = [
            [1, 2, -1],
            [2, 3, -1],
            [3, 4, -1],
            [4, 5, 1],
          ]
          break
        case 23: // Si 1//2 et 2//3 et 3//4 et 4T5 alors 1T5
          code = [
            [1, 2, 1],
            [2, 3, 1],
            [3, 4, 1],
            [4, 5, -1],
          ]
          break
        case 24: // Si 1//2 et 2//3 et 3T4 et 4T5 alors 1//5
          code = [
            [1, 2, 1],
            [2, 3, 1],
            [3, 4, -1],
            [4, 5, -1],
          ]
          break
        case 25: // Si 1//2 et 2T3 et 3//4 et 4T5 alors 1//5
          code = [
            [1, 2, 1],
            [2, 3, -1],
            [3, 4, 1],
            [4, 5, -1],
          ]
          break
        case 26: // Si 1//2 et 2T3 et 3T4 et 4T5 alors 1T5
          code = [
            [1, 2, 1],
            [2, 3, -1],
            [3, 4, -1],
            [4, 5, -1],
          ]
          break
        case 27: // Si 1T2 et 2//3 et 3//4 et 4T5 alors 1//5
          code = [
            [1, 2, -1],
            [2, 3, 1],
            [3, 4, 1],
            [4, 5, -1],
          ]
          break
        case 28: // Si 1T2 et 2//3 et 3T4 et 4T5 alors 1T5
          code = [
            [1, 2, -1],
            [2, 3, 1],
            [3, 4, -1],
            [4, 5, -1],
          ]
          break
        case 29: // Si 1T2 et 2T3 et 3//4 et 4T5 alors 1T5
          code = [
            [1, 2, -1],
            [2, 3, -1],
            [3, 4, 1],
            [4, 5, -1],
          ]
          break
        case 30: // Si 1T2 et 2T3 et 3T4 et 4T5 alors 1//5
          code = [
            [1, 2, -1],
            [2, 3, -1],
            [3, 4, -1],
            [4, 5, -1],
          ]
          break
      }

      // enoncé mélangé
      const couleurd = []
      const phrases = []
      texte += 'On sait que '
      couleurd.push(randint(0, 5))
      const codeAll = code.concat(codeDistracteurs)

      for (let j = 0; j < codeAll.length; j++) {
        let textetemp = `$(d_${numDroites[codeAll[j][0] - 1]})`
        if (codeAll[j][2] === 1) {
          textetemp += symboleParallele()
          couleurd.push(couleurd[j])
        } else {
          textetemp += '\\perp'
          couleurd.push((couleurd[j] + 1) % 6)
        }
        textetemp += `(d_${numDroites[codeAll[j][1] - 1]})$`
        phrases.push(textetemp)
      }
      for (let j = 0; j < codeAll.length - 1; j++) {
        texte += phrases[j]
        if (j !== codeAll.length - 2) texte += ', '
        else texte += ' et '
      }
      texte += phrases[codeAll.length - 1] + '.<br>'

      // construction de la figure
      context.fenetreMathalea2d = [-2, -2, 15, 10] // important avec la création des droites
      const labels = []
      P.push(pointAbstrait(0, 0))
      let droiteP = droiteParPointEtPente(
        P[0],
        randint(-1, 1, -2) / 10,
        '',
        droiteColor[couleurd[0]],
      )
      droiteP.epaisseur = 2
      droiteP.pointilles = 0
      d.push(droiteP)
      const droiteE = droite(
        pointAbstrait(droiteP.x1, droiteP.y1),
        pointAbstrait(droiteP.x2, droiteP.y2),
        '',
      )
      droiteE.epaisseur = 2
      dE.push(droiteE)
      labels.push(labelOnLine(droiteE, `(d_${numDroites[codeAll[0][0] - 1]})`))
      objets.push(d[0])
      objets2.push(dE[0])
      for (let x = 0; x < codeAll.length; x++) {
        if (codeAll[x][2] === 1) {
          P.push(pointAbstrait((x + 1) * 2, (x + 1) * 2))
          droiteP = droiteParPointEtParallele(
            P[x + 1],
            d[codeAll[x][0] - 1],
            '',
            droiteColor[couleurd[x + 1]],
          )
          droiteP.epaisseur = 2
          droiteP.pointilles = d[codeAll[x][0] - 1].pointilles
          d.push(droiteP)
          const droiteP2 = droite(
            pointAbstrait(droiteP.x1, droiteP.y1),
            pointAbstrait(droiteP.x2, droiteP.y2),
            '',
          )
          droiteP2.epaisseur = 2
          dE.push(droiteP2)
          labels.push(
            labelOnLine(droiteP2, `(d_${numDroites[codeAll[x][1] - 1]})`),
          )
        } else {
          P.push(pointAbstrait((x + 1) * 2, (x + 1) * 2))
          droiteP = droiteParPointEtPerpendiculaire(
            P[x + 1],
            d[codeAll[x][0] - 1],
            '',
            droiteColor[couleurd[x + 1]],
          )
          droiteP.epaisseur = 2
          droiteP.pointilles = (x % 3) + 1
          d.push(droiteP)
          const droiteP2 = droite(
            pointAbstrait(droiteP.x1, droiteP.y1),
            pointAbstrait(droiteP.x2, droiteP.y2),
            '',
          )
          labels.push(
            labelOnLine(droiteP2, `(d_${numDroites[codeAll[x][1] - 1]})`),
          )
          droiteP2.epaisseur = 2
          dE.push(droiteP2)
          const Inter = pointIntersectionDD(d[codeAll[x][0] - 1], droiteP)
          const PP = rotation(P[x + 1], Inter, 90)
          objets.push(codageAngleDroit(PP, Inter, P[x + 1], 'black', 0.6))
          objets2.push(codageAngleDroit(PP, Inter, P[x + 1], 'black', 0.6))
        }
        objets.push(d[x + 1])
        objets2.push(dE[x + 1])
      }
      objets2.push(...labels)
      objets.push(...labels)

      if (this.sup3) {
        texte +=
          (context.vue === 'diap' ? '<center>' : '') +
          mathalea2d(
            {
              xmin: -2,
              xmax: 15,
              ymin: -2,
              ymax: 10,
              pixelsParCm: 20,
              scale: context.vue !== 'latex' ? 0.3 : 0.6,
              mainlevee: false,
              amplitude: 0.3,
            },
            objets2,
          ) +
          (context.vue === 'diap' ? '</center>' : '')
      }
      texte += `Que peut-on dire de $(d_${numDroites[code[0][0] - 1]})$ et $(d_${numDroites[code[code.length - 1][1] - 1]})$ ?`
      if (context.isAmc && !this.sup3) {
        texte += " On pourra s'aider en traçant une figure."
      }

      // correction raisonnement ordonné
      texteCorr =
        "À partir de l'énoncé, on peut réaliser le schéma suivant (il en existe une infinité).<br>"
      if (
        [2, 5, 14, 30].indexOf(listeTypeDeQuestions[i]) === -1 &&
        !this.sup2
      ) {
        texteCorr +=
          " Les droites données parallèles dans l'énoncé sont de même "
        texteCorr += context.isHtml ? ' couleur/style.<br>' : 'style.<br>'
      }
      texteCorr += mathalea2d(
        {
          xmin: -2,
          xmax: 15,
          ymin: -2,
          ymax: 10,
          pixelsParCm: 20,
          scale: context.vue !== 'latex' ? 0.3 : 0.6,
          mainlevee: false,
          amplitude: 0.3,
        },
        objets,
      )
      for (let j = 0; j < code.length - 1; j++) {
        if (this.correctionDetaillee) texteCorr += 'On sait que : '
        else texteCorr += 'Comme '
        texteCorr += `$(d_${numDroites[code[j][0] - 1]})`
        if (code[j][2] === 1) texteCorr += symboleParallele()
        else texteCorr += '\\perp'
        texteCorr += `(d_${numDroites[code[j][1] - 1]})$ et `
        texteCorr += `$(d_${numDroites[code[j + 1][0] - 1]})`
        if (code[j + 1][2] === 1) texteCorr += symboleParallele()
        else texteCorr += '\\perp'
        texteCorr += `(d_${numDroites[code[j + 1][1] - 1]})$`
        // La conclusion de la dernière étape est la réponse à la question.
        const redigerConclusion = (relation: string) => {
          const conclusion = `(d_${numDroites[code[0][0] - 1]})${relation}(d_${numDroites[code[j + 1][1] - 1]})`
          return ` $${j === code.length - 2 ? miseEnEvidence(conclusion) : conclusion}$.<br>`
        }
        // quelle propriété ?
        if (code[j][2] * code[j + 1][2] === -1) {
          // Une parallèle et une perpendiculaire
          if (this.correctionDetaillee)
            texteCorr +=
              ".<br> Or si deux droites sont parallèles alors toute droite perpendiculaire à l'une est aussi perpendiculaire à l'autre.<br>Donc"
          else texteCorr += ', on en déduit que '
          texteCorr += redigerConclusion('\\perp')
          code[j + 1][0] = code[j][0]
          code[j + 1][2] = -1
        } else if (code[j][2] > 0) {
          // deux parallèles
          if (this.correctionDetaillee)
            texteCorr +=
              '.<br> Or si deux droites sont parallèles à une même droite alors elles sont parallèles entre elles.<br>Donc'
          else texteCorr += ', on en déduit que '
          texteCorr += redigerConclusion(symboleParallele())
          code[j + 1][0] = code[j][0]
          code[j + 1][2] = 1
        } else {
          // deux perpendiculaires
          if (this.correctionDetaillee)
            texteCorr +=
              '.<br> Or si deux droites sont perpendiculaires à une même droite alors elles sont parallèles entre elles.<br>Donc'
          else texteCorr += ', on en déduit que '
          texteCorr += redigerConclusion(symboleParallele())
          code[j + 1][0] = code[j][0]
          code[j + 1][2] = 1
        }
      }

      /** ********************** AMC Open *****************************/
      this.autoCorrectionAMC[i] = {}
      this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      this.autoCorrectionAMC[i].options = { ordered: false }
      this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      this.autoCorrectionAMC[i].enonce = texte + '<br>'
      this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      this.autoCorrectionAMC[i].propositions = [
        {
          texte: texteCorr,
          statut: 3,
        },
      ]
      this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      /****************************************************/

      if (
        this.questionJamaisPosee(
          i,
          numDroites.join(''),
          JSON.stringify(code),
          JSON.stringify(codeDistracteurs),
        )
      ) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }

    listeQuestionsToContenu(this)
  }
}
