import { tableauColonneLigne } from '../../../lib/2d/tableau'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import FractionEtendue from '../../../modules/FractionEtendue'
import ExerciceSimple from '../../ExerciceSimple'

type ProbabiliteAffichee = {
  valeur: FractionEtendue
  ecriture: 'decimale' | 'fractionnaire'
}

type JeuDeProbabilites = {
  probabilites: [ProbabiliteAffichee, ProbabiliteAffichee, ProbabiliteAffichee]
  reponse: FractionEtendue
  reponseDecimale: boolean
}

export type QuestionProbabiliteTableau = {
  enonce: string
  correction: string
  reponse: number | string
  reponseAffichee: string
}

const fraction = (n: number, d: number): FractionEtendue =>
  new FractionEtendue(n, d).simplifie()

const decimale = (n: number, d: number): ProbabiliteAffichee => ({
  valeur: fraction(n, d),
  ecriture: 'decimale',
})

const fractionnaire = (n: number, d: number): ProbabiliteAffichee => ({
  valeur: fraction(n, d),
  ecriture: 'fractionnaire',
})

const jeux: JeuDeProbabilites[] = [
  {
    probabilites: [decimale(7, 20), decimale(3, 10), fractionnaire(1, 4)],
    reponse: fraction(1, 10),
    reponseDecimale: true,
  },
  {
    probabilites: [fractionnaire(1, 5), decimale(3, 10), decimale(7, 20)],
    reponse: fraction(3, 20),
    reponseDecimale: true,
  },
  {
    probabilites: [decimale(7, 20), fractionnaire(3, 10), decimale(1, 4)],
    reponse: fraction(1, 10),
    reponseDecimale: true,
  },
  {
    probabilites: [fractionnaire(13, 60), decimale(1, 4), fractionnaire(1, 5)],
    reponse: fraction(1, 3),
    reponseDecimale: false,
  },
  {
    probabilites: [fractionnaire(17, 60), decimale(3, 10), fractionnaire(1, 4)],
    reponse: fraction(1, 6),
    reponseDecimale: false,
  },
  {
    probabilites: [fractionnaire(1, 6), decimale(3, 10), fractionnaire(1, 5)],
    reponse: fraction(1, 3),
    reponseDecimale: false,
  },
  {
    probabilites: [fractionnaire(1, 30), decimale(1, 10), fractionnaire(1, 3)],
    reponse: fraction(8, 15),
    reponseDecimale: false,
  },
  {
    probabilites: [decimale(3, 10), decimale(3, 20), fractionnaire(1, 4)],
    reponse: fraction(3, 10),
    reponseDecimale: false,
  },
  {
    probabilites: [decimale(1, 5), decimale(3, 10), fractionnaire(1, 5)],
    reponse: fraction(3, 10),
    reponseDecimale: false,
  },
  {
    probabilites: [decimale(7, 20), decimale(3, 10), fractionnaire(1, 20)],
    reponse: fraction(3, 10),
    reponseDecimale: false,
  },
  {
    probabilites: [decimale(9, 20), decimale(3, 20), fractionnaire(1, 10)],
    reponse: fraction(3, 10),
    reponseDecimale: false,
  },
]

function ecriture(probabilite: ProbabiliteAffichee): string {
  return probabilite.ecriture === 'decimale'
    ? texNombre(probabilite.valeur.toNumber())
    : probabilite.valeur.texFraction
}

function ecritureReponse(
  reponse: FractionEtendue,
  sousFormeDecimale: boolean,
): string {
  return sousFormeDecimale
    ? texNombre(reponse.toNumber())
    : reponse.texFractionSimplifiee
}

export function genererQuestionProbabiliteTableau(): QuestionProbabiliteTableau {
  const jeu = choice(jeux)
  const valeurs = jeu.probabilites.map(ecriture)
  const somme = jeu.probabilites
    .slice(1)
    .reduce(
      (total, probabilite) => total.sommeFraction(probabilite.valeur),
      jeu.probabilites[0].valeur,
    )
    .simplifie()
  const reponseAffichee = ecritureReponse(jeu.reponse, jeu.reponseDecimale)
  const tableau = tableauColonneLigne(
    ['\\text{Numéro de la face}', '1', '2', '3', '4'],
    ['\\text{Probabilité}'],
    [...valeurs, 'x'],
  )
  const enonce = `On lance un dé à $4$ faces. La probabilité d'obtenir chacune des faces est donnée dans le tableau ci-dessous :<br><br>
${tableau}<br><br>`
  const correction = `La somme des probabilités doit être égale à $1$.<br>
$\\begin{aligned}
x&=1-\\left(${valeurs.join('+')}\\right)\\\\
&=1-${somme.texFractionSimplifiee}\\\\
&=${miseEnEvidence(reponseAffichee)}.
\\end{aligned}$`

  return {
    enonce,
    correction,
    reponse: jeu.reponseDecimale
      ? jeu.reponse.toNumber()
      : jeu.reponse.texFractionSimplifiee,
    reponseAffichee,
  }
}

export const titre = 'Calculer une probabilité dans un tableau'
export const interactifReady = true

export const dateDePublication = '14/08/2026'

/**
 * Version CAN ouverte et autonome de 1A-P03-1.
 * @author Stéphane Guyon
 */
export const uuid = 'b0618'

export const refs = {
  'fr-fr': ['can1P12-05', 'can2P1-03', 'can2P2-08'],
  'fr-ch': [],
}

export default class CalculerProbabiliteTableau extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacingCorr = 1.5
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsChampTexte = { texteAvant: '<br>$x=$' }
  }

  nouvelleVersion() {
    const question = genererQuestionProbabiliteTableau()
    this.question = question.enonce + (this.interactif ? '' : 'Calculer $x$.')
    this.correction = question.correction
    this.reponse = question.reponse
    this.canEnonce = this.question
    this.canReponseACompleter = '$x=\\ldots$'
  }
}
