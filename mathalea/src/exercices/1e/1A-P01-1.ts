import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'

export const titre = 'Reconnaître un réel pouvant être une probabilité'
export const dateDePublication = '07/08/2026'
export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

export const uuid = '339f9'
export const refs = {
  'fr-fr': ['1A-P01-1', '2A-P1-1'],
  'fr-ch': ['11LCNO4B-5', '11LSNO4B-5'],
}

type Proposition = {
  latex: string
  estUneProbabilite: boolean
  justification: string
}

/**
 * Reconnaître les différentes écritures d'un réel compris entre 0 et 1.
 * @author Stéphane Guyon
 */
export default class ReconnaitreUneProbabilite extends ExerciceQcmA {
  private generePropositionDecimaleInvalide(): Proposition {
    const estNegative = choice([true, false])
    const valeur = estNegative ? -randint(1, 9) / 10 : randint(11, 19) / 10
    return {
      latex: texNombre(valeur, 1),
      estUneProbabilite: false,
      justification:
        valeur < 0 ? 'est strictement négatif' : 'est supérieur à $1$',
    }
  }

  private generePropositionFractionInvalide(): Proposition {
    const denominateur = randint(2, 8)
    const numerateur = denominateur + randint(1, 5)
    return {
      latex: `\\dfrac{${numerateur}}{${denominateur}}`,
      estUneProbabilite: false,
      justification: 'est supérieur à $1$',
    }
  }

  private generePropositionPourcentageInvalide(): Proposition {
    const pourcentage = randint(11, 25) * 10
    return {
      latex: `${pourcentage}\\,\\%`,
      estUneProbabilite: false,
      justification: 'est supérieur à $100\\,\\%$',
    }
  }

  private genereFractionValide(): Proposition {
    const denominateur = randint(3, 10)
    const numerateur = randint(1, denominateur - 1)
    return {
      latex: `\\dfrac{${numerateur}}{${denominateur}}`,
      estUneProbabilite: true,
      justification: 'est compris entre $0$ et $1$',
    }
  }

  private genereDecimalValide(): Proposition {
    const valeur = randint(1, 99) / 100
    return {
      latex: texNombre(valeur, 2),
      estUneProbabilite: true,
      justification: 'est compris entre $0$ et $1$',
    }
  }

  private generePourcentageValide(): Proposition {
    const pourcentage = randint(1, 9) * 10
    return {
      latex: `${pourcentage}\\,\\%`,
      estUneProbabilite: true,
      justification: 'est compris entre $0\\,\\%$ et $100\\,\\%$',
    }
  }

  private genereValeurExtreme(forcePourcentage = false): Proposition {
    const extremes = forcePourcentage
      ? [
          {
            latex: '0\\,\\%',
            justification:
              'est égal à $0$, probabilité d’un événement impossible',
          },
          {
            latex: '100\\,\\%',
            justification: 'est égal à $1$, probabilité d’un événement certain',
          },
        ]
      : [
          {
            latex: '0',
            justification: 'est la probabilité d’un événement impossible',
          },
          {
            latex: '1',
            justification: 'est la probabilité d’un événement certain',
          },
          {
            latex: '0\\,\\%',
            justification:
              'est égal à $0$, probabilité d’un événement impossible',
          },
          {
            latex: '100\\,\\%',
            justification: 'est égal à $1$, probabilité d’un événement certain',
          },
        ]
    const extreme = choice(extremes)
    return { ...extreme, estUneProbabilite: true }
  }

  private appliqueLesValeurs(demandeValeurPossible: boolean) {
    let propositions: Proposition[]

    if (demandeValeurPossible) {
      propositions = [
        this.genereValeurExtreme(),
        this.generePropositionDecimaleInvalide(),
        this.generePropositionFractionInvalide(),
        this.generePropositionPourcentageInvalide(),
      ]
    } else {
      const typeValeurInvalide = choice(['decimale', 'fraction', 'pourcentage'])
      const valeurInvalide =
        typeValeurInvalide === 'decimale'
          ? this.generePropositionDecimaleInvalide()
          : typeValeurInvalide === 'fraction'
            ? this.generePropositionFractionInvalide()
            : this.generePropositionPourcentageInvalide()
      const autresValeursValides =
        typeValeurInvalide === 'decimale'
          ? [this.genereFractionValide(), this.generePourcentageValide()]
          : typeValeurInvalide === 'fraction'
            ? [this.genereDecimalValide(), this.generePourcentageValide()]
            : [this.genereDecimalValide(), this.genereFractionValide()]
      propositions = [
        valeurInvalide,
        this.genereValeurExtreme(typeValeurInvalide !== 'pourcentage'),
        ...autresValeursValides,
      ]
    }

    const bonneProposition = propositions.find(
      (proposition) => proposition.estUneProbabilite === demandeValeurPossible,
    )!
    const distracteurs = propositions.filter(
      (proposition) => proposition !== bonneProposition,
    )
    const propositionsDansOrdre = [bonneProposition, ...distracteurs]
    this.reponses = propositionsDansOrdre.map(
      (proposition) => `$${proposition.latex}$`,
    )

    this.enonce = demandeValeurPossible
      ? 'Parmi les réels suivants, lequel peut être une probabilité ?'
      : 'Parmi les réels suivants, lequel ne peut pas être une probabilité ?'

    this.correction = `Une probabilité est un réel compris entre $0$ et $1$. Lorsqu'elle est écrite en pourcentage, elle est comprise entre $0\\,\\%$ et $100\\,\\%$. La bonne réponse est donc $${miseEnEvidence(bonneProposition.latex)}$.`
  }

  versionAleatoire = () => this.appliqueLesValeurs(choice([true, false]))

  constructor() {
    super()
    this.options.ordered = context.isTypst
    this.versionAleatoire()
  }
}
