import { texteEnCouleur, texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
export const titre =
  'Connaitre le vocabulaire de base des polygones particuliers'

export const dateDePublication = '28/02/2025'

/**
 * Connaissance du vocabulaire de base des polygones particuliers (isocèle, équilatéral, losange, rectangle, ca)
 * @author Guillaume Valmont
 */
export const uuid = '60b02'

export const refs = {
  'fr-fr': ['CM2G3B'],
  'fr-2016': ['6G20-4'],
  'fr-ch': ['PRQES02B-1', '9R1ES1D-3', '9R2ES1D-3', '9R3ES1D-3'],
}
export default class VocabulaireDeBaseDesPolygones extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.besoinFormulaireTexte = [
      'Sens des questions',
      'Nombres séparés par des tirets  :\n1 : Demander la définition\n2 : Demander le mot défini\n3 : Mélange',
    ]
    this.sup = '1-2'
  }

  nouvelleVersion() {
    const typeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 2,
      melange: 3,
      defaut: 3,
      nbQuestions: this.nbQuestions,
    }).map(Number)
    const items = [
      {
        mot: 'triangle',
        definition: 'polygone qui a trois côtés',
      },
      {
        mot: 'triangle isocèle',
        definition: 'triangle qui a deux côtés de la même longueur',
      },
      {
        mot: 'triangle équilatéral',
        definition: 'triangle qui a trois côtés de la même longueur',
      },
      {
        mot: 'triangle rectangle',
        definition: 'triangle qui possède un angle droit',
      },
      {
        mot: 'quadrilatère',
        definition: 'polygone qui a quatre côtés',
      },
      {
        mot: 'losange',
        definition: 'quadrilatère qui a quatre côtés de la même longueur',
      },
      {
        mot: 'rectangle',
        definition: 'quadrilatère qui a quatre angles droits',
      },
      {
        mot: 'carré',
        definition:
          'quadrilatère qui a quatre côtés de la même longueur et quatre angles droits',
      },
    ]
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const item = items[randint(0, items.length - 1)]
      if (typeQuestions[i] === 1) {
        texte = `Donner la définition d'un ${item.mot}.`
        texteCorr = `Un ${item.mot} est ${texteEnCouleurEtGras(`un ${item.definition}`)}.`
      } else {
        texte = `Comment s'appelle un ${item.definition} ?`
        texteCorr = `Un ${item.definition} s'appelle ${texteEnCouleurEtGras(`un ${item.mot}`)}.`
      }
      if (this.questionJamaisPosee(i, typeQuestions[i], item.mot)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr

        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
