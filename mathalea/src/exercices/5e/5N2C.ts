import {
  addRelierEtiquettes,
  type LienRelier,
  RelierEtiquettesElement,
} from '../../lib/customElements/RelierEtiquettesElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Relier un nombre positif, négatif, strictement positif ou strictement négatif à son inégalité'
export const dateDePublication = '31/07/2026'
export const interactifReady = true

/**
 * Relier les quatre qualificatifs de signe (positif, strictement positif,
 * négatif, strictement négatif) aux inégalités correspondantes.
 * @author Rémi Angot
 */

export const uuid = '7f3d1'

export const refs = {
  'fr-fr': ['5N2C'],
  'fr-ch': ['9R1NO3B-3', '9R2NO3B-3', '9R3NO3B-3'],
}

/** Un qualificatif et les deux écritures équivalentes de l'inégalité associée. */
type Definition = {
  qualificatif: string
  /** Écriture directe puis écriture inversée de la même inégalité. */
  inegalites: [string, string]
}

const definitions: Definition[] = [
  {
    qualificatif: 'positif',
    inegalites: ['n \\geqslant 0', '0 \\leqslant n'],
  },
  {
    qualificatif: 'strictement positif',
    inegalites: ['n > 0', '0 < n'],
  },
  {
    qualificatif: 'négatif',
    inegalites: ['n \\leqslant 0', '0 \\geqslant n'],
  },
  {
    qualificatif: 'strictement négatif',
    inegalites: ['n < 0', '0 > n'],
  },
]

export default class RelierSignesEtInegalites extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbCols = 1
    this.nbColsCorr = 1
    this.consigne =
      "Relier chaque phrase décrivant le nombre $n$ à l'inégalité qui la traduit."
    this.besoinFormulaireCaseACocher = [
      "Varier le sens d'écriture des inégalités",
      true,
    ]
    this.sup = true
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const ordreGauche = shuffle([0, 1, 2, 3])
      const ordreDroite = shuffle([0, 1, 2, 3])

      const gauche = ordreGauche.map((indiceDefinition, rang) => ({
        id: `G${rang}`,
        texte: definitions[indiceDefinition].qualificatif,
      }))
      const droite = ordreDroite.map((indiceDefinition, rang) => ({
        id: `D${rang}`,
        texte: `$${
          this.sup
            ? choice(definitions[indiceDefinition].inegalites)
            : definitions[indiceDefinition].inegalites[0]
        }$`,
      }))
      const liens: LienRelier[] = ordreGauche.map((indiceDefinition, rang) => ({
        gauche: `G${rang}`,
        droite: `D${ordreDroite.indexOf(indiceDefinition)}`,
      }))

      const texte = addRelierEtiquettes(this, i, {
        gauche,
        droite,
        interactivityOn: this.interactif,
      })
      const texteCorr = RelierEtiquettesElement.create({
        id: `${RelierEtiquettesElement.elementTag}Ex${this.numeroExercice ?? 0}Q${i}Corr`,
        gauche,
        droite,
        liens,
        interactivityOn: false,
      })

      handleAnswers(
        this,
        i,
        { reponse: { value: JSON.stringify(liens) } },
        { formatInteractif: 'relier-etiquettes' },
      )

      if (
        this.questionJamaisPosee(
          i,
          ordreGauche.join(''),
          ordreDroite.join(''),
          droite.map((etiquette) => etiquette.texte).join(''),
        )
      ) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
