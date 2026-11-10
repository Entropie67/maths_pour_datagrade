// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid f9d32 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
// Version publiée jusqu'au 07/10/2026 (commit c93cc0ca5).
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'

import { texNombre } from '../../lib/outils/texNombre'

import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = 'f9d32'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Calculer un taux d'évolution particulier"
export const dateDePublication = '19/01/2026'

export default class TauxEvolutionOld extends ExerciceQcmA {
  private appliquerLesValeurs(
    typeEvolution: string,
    pourcentageBonneReponse: number,
  ): void {
    // Définition des paramètres pour chaque type d'évolution
    const parametres: Record<
      string,
      {
        phraseEnonce: string
        typeAction: 'augmenté' | 'diminué'
        cm: string
        cmDecimal: string
        calcul: string
        T: string
        tauxSigne: string
      }
    > = {
      doublé: {
        phraseEnonce: 'Un prix a doublé',
        typeAction: 'augmenté',
        cm: '2',
        cmDecimal: '2',
        calcul: '2 - 1 = 1',
        T: '1',
        tauxSigne: '100\\,\\%',
      },
      triplé: {
        phraseEnonce: 'Un prix a triplé',
        typeAction: 'augmenté',
        cm: '3',
        cmDecimal: '3',
        calcul: '3 - 1 = 2',
        T: '2',
        tauxSigne: '200\\,\\%',
      },
      'divisé par 2': {
        phraseEnonce: 'Un prix a été divisé par $2$',
        typeAction: 'diminué',
        cm: '\\dfrac{1}{2} = 0,5',
        cmDecimal: '0,5',
        calcul: '0,5 - 1 = -0,5',
        T: '-0,5',
        tauxSigne: '-50\\,\\%',
      },
      'divisé par 4': {
        phraseEnonce: 'Un prix a été divisé par $4$',
        typeAction: 'diminué',
        cm: '\\dfrac{1}{4} = 0,25',
        cmDecimal: '0,25',
        calcul: '0,25 - 1 = -0,75',
        T: '-0,75',
        tauxSigne: '-75\\,\\%',
      },
    }

    const params = parametres[typeEvolution]

    this.enonce = `${params.phraseEnonce}. Cela signifie que le prix a ${params.typeAction} de :`

    this.correction = `Si ${params.phraseEnonce.toLowerCase()}, cela signifie que le coefficient multiplicateur est $CM = ${params.cm}$.<br>
    Le taux d'évolution $T$  vérifie : $T = CM - 1 = ${params.calcul} = ${params.tauxSigne}$.<br>
    Le prix a donc ${params.typeAction} de $${miseEnEvidence(`${pourcentageBonneReponse}\\,\\%`)}$.`

    // Générer des distracteurs cohérents
    const bonneReponse = `$${texNombre(pourcentageBonneReponse)}\\%$`

    // Créer une liste de distracteurs possibles selon le contexte
    let tousLesDistracteurs: string[] = []

    if (typeEvolution === 'doublé') {
      tousLesDistracteurs = [
        '$50\\,\\%$',
        '$150\\,\\%$',
        '$200\\,\\%$',
        '$2\\,\\%$',
        '$20\\,\\%$',
        '$120\\,\\%$',
      ]
    } else if (typeEvolution === 'triplé') {
      tousLesDistracteurs = [
        '$100\\,\\%$',
        '$150\\,\\%$',
        '$300\\,\\%$',
        '$3\\,\\%$',
        '$30\\,\\%$',
        '$33\\,\\%$',
      ]
    } else if (typeEvolution === 'divisé par 2') {
      tousLesDistracteurs = [
        '$25\\,\\%$',
        '$100\\,\\%$',
        '$200\\,\\%$',
        '$2\\,\\%$',
        '$20\\,\\%$',
      ]
    } else if (typeEvolution === 'divisé par 4') {
      tousLesDistracteurs = [
        '$25\\,\\%$',
        '$50\\,\\%$',
        '$100\\,\\%$',
        '$4\\,\\%$',
        '$40\\,\\%$',
      ]
    }

    // Filtrer les distracteurs différents de la bonne réponse et mélanger
    const distracteursDisponibles = shuffle(
      tousLesDistracteurs.filter((d) => d !== bonneReponse),
    )

    // Prendre 3 distracteurs aléatoires
    const distracteursSelectionnes = distracteursDisponibles.slice(0, 3)

    this.reponses = [bonneReponse, ...distracteursSelectionnes]
  }

  versionOriginale: () => void = () => {
    this.enonce = `Un prix a doublé. Cela signifie que le prix a augmenté de :`

    this.reponses = ['$50\\,\\%$', '$100\\,\\%$', '$150\\,\\%$', '$200\\,\\%$']

    this.correction = `Si un prix a doublé, cela signifie que le coefficient multiplicateur est $CM = 2$.<br>
    Le taux d'évolution $T$  vérifie : $T = CM - 1 = 2 - 1 = 1 = 100\\,\\%$.<br>
    Le prix a donc augmenté de $${miseEnEvidence('100\\,\\%')}$.`
  }

  versionAleatoire: () => void = () => {
    // Configurations : [typeEvolution, pourcentageBonneReponse]
    const configurations: Array<[string, number]> = [
      ['doublé', 100],
      ['triplé', 200],
      ['divisé par 2', 50],
      ['divisé par 4', 75],
    ]

    const config = choice(configurations)

    this.appliquerLesValeurs(config[0], config[1])
  }

  constructor() {
    super()
  }
}
