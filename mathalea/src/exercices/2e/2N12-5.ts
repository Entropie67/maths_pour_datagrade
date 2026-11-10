import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence, texteCode } from '../../lib/outils/embellissements'
import { scriptPython } from '../../lib/outils/scriptPython'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'
import { sp } from '../../lib/outils/outilString'

export const titre =
  "Compléter ou interpréter un programme Python testant l'appartenance à un intervalle"
export const dateDePublication = '19/09/2026'
export const uuid = '4bb46'
export const refs = {
  'fr-fr': ['2N12-5'],
  'fr-ch': [],
}
export const interactifReady = true

type Variantes = { notations: string[]; conditions: string[] }

// 4 notations / conditions partageant les mêmes bornes a, b, dans un ordre fixe :
// [a;b], ]a;b[, [a;b[, ]a;b]. Le complémentaire d'un intervalle borné est la
// réunion de deux demi-droites de même indice dans variantesReunion().
function variantesBornees(a: number, b: number): Variantes {
  return {
    notations: [
      `[${a}\\,;\\,${b}]`,
      `]${a}\\,;\\,${b}[`,
      `[${a}\\,;\\,${b}[`,
      `]${a}\\,;\\,${b}]`,
    ],
    conditions: [
      `x >= ${a} and x <= ${b}`,
      `x > ${a} and x < ${b}`,
      `x >= ${a} and x < ${b}`,
      `x > ${a} and x <= ${b}`,
    ],
  }
}

// Complémentaires des 4 variantes bornées ci-dessus, même ordre d'indice.
function variantesReunion(a: number, b: number): Variantes {
  return {
    notations: [
      `]-\\infty\\,;\\,${a}[\\,\\cup\\,]${b}\\,;\\,+\\infty[`,
      `]-\\infty\\,;\\,${a}]\\,\\cup\\,[${b}\\,;\\,+\\infty[`,
      `]-\\infty\\,;\\,${a}[\\,\\cup\\,[${b}\\,;\\,+\\infty[`,
      `]-\\infty\\,;\\,${a}]\\,\\cup\\,]${b}\\,;\\,+\\infty[`,
    ],
    conditions: [
      `x < ${a} or x > ${b}`,
      `x <= ${a} or x >= ${b}`,
      `x < ${a} or x >= ${b}`,
      `x <= ${a} or x > ${b}`,
    ],
  }
}

// 4 notations / conditions partageant la même borne a, dans un ordre fixe :
// ]-∞;a[, ]-∞;a], ]a;+∞[, [a;+∞[. Le complémentaire de la variante d'indice k
// est la variante d'indice 3-k (même tableau).
function variantesDemiDroite(a: number): Variantes {
  return {
    notations: [
      `]-\\infty\\,;\\,${a}[`,
      `]-\\infty\\,;\\,${a}]`,
      `]${a}\\,;\\,+\\infty[`,
      `[${a}\\,;\\,+\\infty[`,
    ],
    conditions: [`x < ${a}`, `x <= ${a}`, `x > ${a}`, `x >= ${a}`],
  }
}

// Pour un intervalle borné ou une réunion (version « interpréter »), les
// distracteurs sont tirés d'un ensemble mélangeant les deux familles de
// notation, plus une réunion écrite à tort avec « ∩ » (qui ne décrit alors
// aucun nombre), plutôt que de rester dans la seule famille de la bonne
// réponse.
function melangeNotations(a: number, b: number, correcte: string): string[] {
  const bornees = variantesBornees(a, b).notations
  const reunions = variantesReunion(a, b).notations
  const intersectionVide = `]-\\infty\\,;\\,${a}[\\,\\cap\\,]${b}\\,;\\,+\\infty[`
  const pool = [...bornees, ...reunions, intersectionVide].filter(
    (n) => n !== correcte,
  )
  return [correcte, ...shuffle(pool).slice(0, 3)]
}

// Distracteurs dédiés à la version « compléter » d'un intervalle borné : un
// mélange d'erreurs de grand/strict (avec « and »), de connecteur (« or » au
// lieu de « and »), et de sens des comparaisons (bornes inversées, ce qui ne
// convient à aucun nombre).
function conditionsCompleterBornees(
  a: number,
  b: number,
  cas: 1 | 2 | 3 | 4,
): string[] {
  switch (cas) {
    case 1:
      return [
        `x >= ${a} and x <= ${b}`,
        `x > ${a} and x < ${b}`,
        `x >= ${a} or x <= ${b}`,
        `x < ${a} and x > ${b}`,
      ]
    case 2:
      return [
        `x > ${a} and x < ${b}`,
        `x >= ${a} and x <= ${b}`,
        `x > ${a} or x < ${b}`,
        `x <= ${a} and x >= ${b}`,
      ]
    case 3:
      return [
        `x >= ${a} and x < ${b}`,
        `x > ${a} and x <= ${b}`,
        `x >= ${a} or x < ${b}`,
        `x < ${a} and x >= ${b}`,
      ]
    case 4:
    default:
      return [
        `x > ${a} and x <= ${b}`,
        `x >= ${a} and x < ${b}`,
        `x > ${a} or x <= ${b}`,
        `x <= ${a} and x >= ${b}`,
      ]
  }
}

function avecBonneReponseEnTete<T>(liste: T[], indexCorrect: number): T[] {
  return [liste[indexCorrect], ...liste.filter((_, i) => i !== indexCorrect)]
}

// Traduit une condition Python (vraie syntaxe : <=, >=, and, or) en notation
// mathématique, pour l'énoncé de l'équivalence « x∈I si et seulement si ... »
// dans la correction.
function versMathematique(conditionPython: string): string {
  return conditionPython
    .replace(/>=/g, '\\geqslant')
    .replace(/<=/g, '\\leqslant')
    .replace(/\band\b/g, '\\text{ et }')
    .replace(/\bor\b/g, '\\text{ ou }')
}

// Justifie le choix des inégalités larges/strictes en a et b, selon que ces
// bornes appartiennent (ferméA/ferméB) ou non à l'ensemble I. Vaut aussi bien
// pour un intervalle borné (les deux bornes « ferment » I) que pour la
// réunion de deux demi-droites (les deux bornes « ferment » son complémentaire).
function explicationInegalites(
  a: number,
  b: number,
  ferméA: boolean,
  ferméB: boolean,
): string {
  if (ferméA && ferméB) {
    return `Les crochets sont fermés en $${a}$ et en $${b}$ : ces deux valeurs appartiennent à $I$, il faut donc deux inégalités larges.`
  }
  if (!ferméA && !ferméB) {
    return `Les crochets sont ouverts en $${a}$ et en $${b}$ : ces deux valeurs n'appartiennent pas à $I$, il faut donc deux inégalités strictes.`
  }
  if (ferméA && !ferméB) {
    return `Le crochet est fermé en $${a}$ (borne incluse dans $I$) et ouvert en $${b}$ (borne exclue de $I$).`
  }
  return `Le crochet est ouvert en $${a}$ (borne exclue de $I$) et fermé en $${b}$ (borne incluse dans $I$).`
}

/**
 * Compléter, ou interpréter, un test d'appartenance à un intervalle écrit en
 * Python.
 *
 * En version interactive, la réponse est demandée sous forme de QCM. En
 * version non interactive (impression), l'élève répond directement : la
 * correction ne mentionne alors que la bonne réponse, puisque les
 * distracteurs ne sont pas montrés.
 *
 * @author Arnaud Meistermann
 */
export default class AppartenanceIntervallePython extends ExerciceSimple {
  private appliquerValeurs(
    typeIntervalle: number,
    modeInterpreter: boolean,
    demandeNon: boolean,
  ): void {
    const a = randint(1, 15)
    let b = 0
    let intervalleTex = ''
    let varsMoi: Variantes
    let indexMoi = 0
    let varsComplement: Variantes
    let indexComplement = 0
    let explicationBonneReponse = ''
    let borneFermeeUnion: [boolean, boolean] | null = null
    let conditionsCompleterOverride: string[] | null = null

    switch (typeIntervalle) {
      case 1: {
        b = randint(a + 1, 25)
        intervalleTex = `[${a}\\,;\\,${b}]`
        varsMoi = variantesBornees(a, b)
        indexMoi = 0
        varsComplement = variantesReunion(a, b)
        indexComplement = 0
        explicationBonneReponse = explicationInegalites(a, b, true, true)
        conditionsCompleterOverride = conditionsCompleterBornees(a, b, 1)
        break
      }
      case 2: {
        b = randint(a + 1, 25)
        intervalleTex = `]${a}\\,;\\,${b}[`
        varsMoi = variantesBornees(a, b)
        indexMoi = 1
        varsComplement = variantesReunion(a, b)
        indexComplement = 1
        explicationBonneReponse = explicationInegalites(a, b, false, false)
        conditionsCompleterOverride = conditionsCompleterBornees(a, b, 2)
        break
      }
      case 3: {
        b = randint(a + 1, 25)
        intervalleTex = `[${a}\\,;\\,${b}[`
        varsMoi = variantesBornees(a, b)
        indexMoi = 2
        varsComplement = variantesReunion(a, b)
        indexComplement = 2
        explicationBonneReponse = explicationInegalites(a, b, true, false)
        conditionsCompleterOverride = conditionsCompleterBornees(a, b, 3)
        break
      }
      case 4: {
        b = randint(a + 1, 25)
        intervalleTex = `]${a}\\,;\\,${b}]`
        varsMoi = variantesBornees(a, b)
        indexMoi = 3
        varsComplement = variantesReunion(a, b)
        indexComplement = 3
        explicationBonneReponse = explicationInegalites(a, b, false, true)
        conditionsCompleterOverride = conditionsCompleterBornees(a, b, 4)
        break
      }
      case 5: {
        intervalleTex = `]-\\infty\\,;\\,${a}[`
        varsMoi = variantesDemiDroite(a)
        indexMoi = 0
        varsComplement = varsMoi
        indexComplement = 3
        explicationBonneReponse = `Le crochet est ouvert en $${a}$ : la borne est exclue de $I$.`
        break
      }
      case 6: {
        intervalleTex = `]-\\infty\\,;\\,${a}]`
        varsMoi = variantesDemiDroite(a)
        indexMoi = 1
        varsComplement = varsMoi
        indexComplement = 2
        explicationBonneReponse = `Le crochet est fermé en $${a}$ : la borne est incluse dans $I$.`
        break
      }
      case 7: {
        intervalleTex = `]${a}\\,;\\,+\\infty[`
        varsMoi = variantesDemiDroite(a)
        indexMoi = 2
        varsComplement = varsMoi
        indexComplement = 1
        explicationBonneReponse = `Le crochet est ouvert en $${a}$ : la borne est exclue de $I$.`
        break
      }
      case 8: {
        intervalleTex = `[${a}\\,;\\,+\\infty[`
        varsMoi = variantesDemiDroite(a)
        indexMoi = 3
        varsComplement = varsMoi
        indexComplement = 0
        explicationBonneReponse = `Le crochet est fermé en $${a}$ : la borne est incluse dans $I$.`
        break
      }
      case 9:
      default: {
        b = randint(a + 1, 25)
        const indexUnion = choice([0, 1, 2, 3])
        // Complémentaire, indice par indice, de la table utilisée par
        // variantesBornees() : une borne fermée dans I est exclue de son
        // complémentaire, et réciproquement.
        const fermeReunion: [boolean, boolean][] = [
          [false, false],
          [true, true],
          [false, true],
          [true, false],
        ]
        varsMoi = variantesReunion(a, b)
        indexMoi = indexUnion
        intervalleTex = varsMoi.notations[indexUnion]
        varsComplement = variantesBornees(a, b)
        indexComplement = indexUnion
        const [ferméA, ferméB] = fermeReunion[indexUnion]
        borneFermeeUnion = [ferméA, ferméB]
        explicationBonneReponse = explicationInegalites(a, b, ferméA, ferméB)
        break
      }
    }

    this.versionQcm = true
    this.versionQcmOptions = { radio: true, vertical: false }

    if (!modeInterpreter) {
      const conditions =
        conditionsCompleterOverride ??
        avecBonneReponseEnTete(varsMoi.conditions, indexMoi)
      const programme = `def appartient(x):
    if ...:
        return "oui"
    else:
        return "non"`

      this.question = `On considère l'intervalle $I=${intervalleTex}$.<br>
${scriptPython(programme, 4)}<br><br>
Que doit-on écrire à la place des pointillés pour que ce programme renvoie «${sp()}oui${sp()}» si le nombre $x$ appartient à $I$, et «${sp()}non${sp()}» sinon ?`

      const propositions = conditions.map((c) => texteCode(c))
      this.reponse = propositions[0]
      this.distracteurs = propositions.slice(1)
      this.correction = `${explicationBonneReponse}<br><br>
$x\\in ${intervalleTex}$ si et seulement si $${versMathematique(conditions[0])}$.<br><br>
La bonne réponse est donc ${texteCode(conditions[0])}.`
    } else {
      const conditionCorrecte = avecBonneReponseEnTete(
        varsMoi.conditions,
        indexMoi,
      )[0]
      const programme = `def appartient(x):
    if ${conditionCorrecte}:
        return "oui"
    else:
        return "non"`

      const varsReponse = demandeNon ? varsComplement : varsMoi
      const indexReponse = demandeNon ? indexComplement : indexMoi
      const correcteNotation = varsReponse.notations[indexReponse]
      const estDemiDroite = typeIntervalle >= 5 && typeIntervalle <= 8
      const notations = estDemiDroite
        ? avecBonneReponseEnTete(varsReponse.notations, indexReponse)
        : melangeNotations(a, b, correcteNotation)
      const motCle = demandeNon ? 'non' : 'oui'

      this.question = `On donne le programme Python complet ci-dessous.<br>
${scriptPython(programme, 4)}<br><br>
Quelles sont toutes les valeurs de $x$ pour lesquelles ce programme renvoie «${sp()}${motCle}${sp()}» ?`

      const propositions = notations.map((n) => `$${n}$`)
      this.reponse = propositions[0]
      this.distracteurs = propositions.slice(1)

      // On détermine d'abord les valeurs de x qui renvoient « oui » (I
      // lui-même), puis on en déduit celles qui renvoient « non » (son
      // complémentaire) si c'est ce qui est demandé.
      let explicationOui: string
      if (typeIntervalle === 9 && borneFermeeUnion != null) {
        // Pour une réunion, on décompose la condition en deux morceaux avant
        // de la traduire en intervalle, plutôt que de justifier seulement
        // le choix des crochets.
        const [ferméA, ferméB] = borneFermeeUnion
        const gaucheCond = ferméA ? `x\\leqslant ${a}` : `x<${a}`
        const gaucheNotation = ferméA
          ? `]-\\infty\\,;\\,${a}]`
          : `]-\\infty\\,;\\,${a}[`
        const droiteCond = ferméB ? `x\\geqslant ${b}` : `x>${b}`
        const droiteNotation = ferméB
          ? `[${b}\\,;\\,+\\infty[`
          : `]${b}\\,;\\,+\\infty[`
        explicationOui = `$${gaucheCond}$ est équivalent à $x\\in ${gaucheNotation}$.<br>
$${droiteCond}$ est équivalent à $x\\in ${droiteNotation}$.<br>
Donc $${gaucheCond} \\text{ ou } ${droiteCond}$ est équivalent à $x\\in ${intervalleTex}$.`
      } else {
        // En version « interpréter », la condition est donnée (dans le
        // programme) et l'intervalle est ce qu'on cherche : on énonce donc
        // l'équivalence dans ce sens, à l'inverse de la version « compléter ».
        // Pour une demi-droite, la justification du crochet n'apporte rien
        // de plus que l'équivalence elle-même : on ne la répète pas.
        const prefixe = estDemiDroite
          ? ''
          : `${explicationBonneReponse}<br><br>`
        explicationOui = `${prefixe}$${versMathematique(conditionCorrecte)}$ si et seulement si $x\\in ${intervalleTex}$.`
      }

      const explicationFinale = demandeNon
        ? `${explicationOui}<br><br>
Le programme renvoie donc «${sp()}oui${sp()}» exactement pour $x\\in ${intervalleTex}$, et «${sp()}non${sp()}» pour toutes les autres valeurs.`
        : explicationOui

      this.correction = `${explicationFinale}<br><br>
L'ensemble des valeurs de $x$ qui renvoient «${sp()}${motCle}${sp()}» est donc $${miseEnEvidence(notations[0])}$.`
    }
  }

  nouvelleVersion(): void {
    const categorie = this.fromQuestionPlan('categorieIntervalle', (n) =>
      gestionnaireFormulaireTexte({
        saisie: this.sup,
        max: 3,
        melange: 4,
        defaut: 4,
        nbQuestions: n,
      }).map(Number),
    )
    let sousCas: number[]
    switch (categorie) {
      case 1:
        sousCas = [1, 2, 3, 4]
        break
      case 2:
        sousCas = [5, 6, 7, 8]
        break
      default:
        sousCas = [9]
    }
    const typeIntervalle = choice(sousCas)
    const modeInterpreter = this.sup2 === 2
    const demandeNon = modeInterpreter && choice([true, false])
    this.appliquerValeurs(typeIntervalle, modeInterpreter, demandeNon)
  }

  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = true
    this.besoinFormulaireTexte = [
      "Type d'intervalle",
      [
        'Nombres séparés par des tirets :',
        '1 : Intervalle borné',
        '2 : Intervalle non borné',
        '3 : Réunion de deux intervalles',
        '4 : Mélange',
      ].join('\n'),
    ]
    this.sup = 4
    this.besoinFormulaire2Numerique = [
      'Type de question',
      2,
      '1 : Compléter le programme\n2 : Interpréter un programme complet',
    ]
    this.sup2 = 1
  }
}
