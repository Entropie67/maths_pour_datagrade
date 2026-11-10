import { combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
} from '../../modules/outils'
import AjouterOuSoustraire8Ou9 from '../CM2/CM2N4J-3'

export const titre =
  'Ajouter ou soustraire 8, 9, 18, 19, 28, 29, 38 ou 39 à un nombre'
export const dateDePublication = '03/11/2026'
export const interactifReady = true

/**
 * Version CM1 de CM2N4J-3 : le nombre ajouté ou soustrait ne dépasse pas 39
 * et chaque opération (+8, …, -39) peut être choisie avec son poids.
 * @author Rémi Angot
 */
export const uuid = 'a9b5b'

export const refs = {
  'fr-fr': ['CM1N4H-1'],
  'fr-ch': [],
}

const termes = [8, 9, 18, 19, 28, 29, 38, 39]

export default class AjouterOuSoustraire8Ou9CM1 extends AjouterOuSoustraire8Ou9 {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Opérations',
      [
        'Nombres séparés par des tirets :',
        ...termes.map((terme, k) => `${k + 1} : Ajouter ${terme}`),
        ...termes.map(
          (terme, k) => `${k + termes.length + 1} : Soustraire ${terme}`,
        ),
        `${2 * termes.length + 1} : Mélange`,
      ].join('\n'),
    ]
    this.sup = String(2 * termes.length + 1)
  }

  nouvelleVersion() {
    const operations = combinaisonListes(
      gestionnaireFormulaireTexte({
        saisie: this.sup,
        max: 2 * termes.length,
        melange: 2 * termes.length + 1,
        defaut: 2 * termes.length + 1,
        nbQuestions: this.nbQuestions,
      }).map(Number),
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const estAddition = operations[i] <= termes.length
      const terme = termes[(operations[i] - 1) % termes.length]
      if (this.creerQuestion(i, terme, estAddition)) i++
    }
    listeQuestionsToContenu(this)
  }
}
