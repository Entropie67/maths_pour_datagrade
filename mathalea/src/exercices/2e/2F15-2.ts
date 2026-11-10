import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  reduireAxPlusB,
  reduirePolynomeDegre3,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Déterminer l'ensemble de définition d'une fonction à partir de son expression"
export const dateDePublication = '12/08/2026'
export const interactifReady = true

export const uuid = 'f142a'
export const refs = {
  'fr-fr': ['2F15-2'],
  'fr-ch': [],
}

type TypeQuestion = 1 | 2 | 3 | 4 | 5

type DonneesQuestion = {
  expression: string
  domaine: string
  correction: string
  cle: string
}

function domainePriveDUneValeur(valeur: number): string {
  return `]-\\infty~;~${valeur}[\\,\\cup\\,]${valeur}~;~+\\infty[`
}

function domainePriveDeDeuxValeurs(valeur1: number, valeur2: number): string {
  const gauche = Math.min(valeur1, valeur2)
  const droite = Math.max(valeur1, valeur2)
  return `]-\\infty~;~${gauche}[\\,\\cup\\,]${gauche}~;~${droite}[\\,\\cup\\,]${droite}~;~+\\infty[`
}

function numerateur(valeursInterdites: number[] = []): string {
  const coefficient = randint(-4, 4, [0])
  let constante = randint(-6, 6)
  while (
    valeursInterdites.some((valeur) => coefficient * valeur + constante === 0)
  ) {
    constante = randint(-6, 6)
  }
  return reduireAxPlusB(coefficient, constante)
}

function polynome(): DonneesQuestion {
  const degre = choice([2, 3])
  const coefficientCube = degre === 3 ? randint(-3, 3, [0]) : 0
  const coefficientCarre = randint(-4, 4, [0])
  const coefficientX = randint(-6, 6)
  const constante = randint(-8, 8)
  const expression = reduirePolynomeDegre3(
    coefficientCube,
    coefficientCarre,
    coefficientX,
    constante,
  )
  return {
    expression,
    domaine: '\\mathbb{R}',
    correction: `L'expression de $f$ est un polynôme. Une fonction polynôme est définie pour tout nombre réel.`,
    cle: `1-${expression}`,
  }
}

function denominateurAffine(): DonneesQuestion {
  const racine = randint(-6, 6)
  const coefficient = randint(-4, 4, [0])
  const denominateur = reduireAxPlusB(coefficient, -coefficient * racine)
  const expression = `\\dfrac{${numerateur([racine])}}{${denominateur}}`
  return {
    expression,
    domaine: domainePriveDUneValeur(racine),
    correction: `La fonction $f$ est définie lorsque son dénominateur est non nul.<br>$${denominateur}=0\\iff x=${racine}$.<br>La valeur $${racine}$ doit donc être exclue.`,
    cle: `2-${expression}`,
  }
}

function denominateurProduit(): DonneesQuestion {
  const racine1 = randint(-6, 5)
  const racine2 = randint(racine1 + 1, 6)
  const coefficient1 = randint(-3, 3, [0])
  const coefficient2 = randint(-3, 3, [0])
  const facteur1 = reduireAxPlusB(coefficient1, -coefficient1 * racine1)
  const facteur2 = reduireAxPlusB(coefficient2, -coefficient2 * racine2)
  const denominateur = `(${facteur1})(${facteur2})`
  const expression = `\\dfrac{${numerateur([racine1, racine2])}}{${denominateur}}`
  return {
    expression,
    domaine: domainePriveDeDeuxValeurs(racine1, racine2),
    correction: `La fonction $f$ est définie lorsque son dénominateur est non nul. On résout donc :<br>
    $\\begin{aligned}
    &\\phantom{\\iff}\\;${denominateur}=0\\\\
    &\\iff ${facteur1}=0 &&\\text{ ou }&& ${facteur2}=0\\\\
    &\\iff x=${racine1} &&\\text{ ou }&& x=${racine2}.
    \\end{aligned}$<br>
    L'ensemble des solutions de cette équation est $S=\\{${racine1}~;~${racine2}\\}$.<br>
    Les valeurs $${racine1}$ et $${racine2}$ doivent donc être exclues du domaine de définition de $f$.`,
    cle: `3-${expression}`,
  }
}

function differenceDeCarres(): DonneesQuestion {
  const a = randint(1, 6)
  const denominateur = `x^2-${a}^2`
  const expression = `\\dfrac{${numerateur([-a, a])}}{${denominateur}}`
  return {
    expression,
    domaine: domainePriveDeDeuxValeurs(-a, a),
    correction: `La fonction $f$ est définie lorsque son dénominateur est non nul.<br>On utilise l'identité remarquable :<br>$x^2-${a}^2=(x-${a})(x+${a})$.<br>Ainsi, $x^2-${a}^2=0$ si et seulement si $x=-${a}$ ou $x=${a}$. Ces deux valeurs doivent être exclues.`,
    cle: `4-${expression}`,
  }
}

function sommeDeCarres(): DonneesQuestion {
  const a = randint(1, 6)
  const constante = a ** 2
  const denominateur = `x^2+${constante}`
  const expression = `\\dfrac{${numerateur()}}{${denominateur}}`
  return {
    expression,
    domaine: '\\mathbb{R}',
    correction: `Pour tout réel $x$, on a $x^2+${constante}>0$. Le dénominateur ne s'annule donc jamais et la fonction $f$ est définie pour tout nombre réel.`,
    cle: `5-${expression}`,
  }
}

function creerQuestion(type: TypeQuestion): DonneesQuestion {
  switch (type) {
    case 1:
      return polynome()
    case 2:
      return denominateurAffine()
    case 3:
      return denominateurProduit()
    case 4:
      return differenceDeCarres()
    case 5:
      return sommeDeCarres()
  }
}

/**
 * @author Stéphane Guyon
 */
export default class DomaineDefinitionExpression extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 2
    this.spacing = 2
    this.spacingCorr = 2
  }

  nouvelleVersion(): void {
    const listeTypes = combinaisonListes<TypeQuestion>(
      [1, 2, 3, 4, 5],
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const donnees = creerQuestion(listeTypes[i])
      let texte = `On considère la fonction $f$ définie par :<br>$f(x)=${donnees.expression}$.<br>Déterminer son ensemble de définition $D_f$.`
      if (this.interactif) {
        texte +=
          '<br>' +
          ajouteChampTexteMathLive(this, i, KeyboardType.clavierEnsemble, {
            texteAvant: '$D_f=$',
          })
      }
      handleAnswers(this, i, {
        reponse: {
          value: donnees.domaine,
          options: { intervalle: true },
        },
      })
      const correction = `${donnees.correction}<br>Ainsi, $D_f=${miseEnEvidence(donnees.domaine)}$.`

      if (this.questionJamaisPosee(i, donnees.cle)) {
        this.listeQuestions.push(texte)
        this.listeCorrections.push(correction)
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
