import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebriqueSauf0,
  ecritureAlgebriqueSauf1,
  rienSi1,
} from '../../lib/outils/ecritures'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

import { propositionsQcm } from '../../lib/interactif/qcm'
import { calculImageTrinome } from './1Tec-F22'
export const titre =
  "Déterminer si un nombre est une racine d'un polynôme du second degré"

export const dateDePublication = '19/3/2026' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
export const interactifReady = true

export const uuid = '8f59a'
export const refs = {
  'fr-fr': ['1Tec-F22'],
  'fr-ch': [],
}
/**
 *
 * @author Arnaud Meistermann
 */

export default class estUneRacine extends Exercice {
  constructor() {
    super()
    this.consigne = ''
    this.nbQuestions = 4
  }

  nouvelleVersion() {
    const typeQuestionsDisponibles = ['racine', 'pas-racine']
    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      const x1 = randint(-9, 9)
      const x2 = randint(-3, 3, -x1)
      let x: number
      const a = choice([1, -1, 2, -2, 3])
      const b = -a * x1 - a * x2
      const c = a * x1 * x2

      texte = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par $f(x)= ${rienSi1(a)}x^2${ecritureAlgebriqueSauf1(b)}x${ecritureAlgebriqueSauf0(c)}$.<br>`
      switch (listeTypeQuestions[i]) {
        case 'racine': {
          x = x1
          texte += `$${x}$ est-il une racine de $f$ ?`
          texteCorr = calculImageTrinome(a, b, c, x) + '<br>'
          texteCorr += `$f(${x})= 0$ donc $${x}$ est une racine de $f$. La réponse est ${texteEnCouleurEtGras('OUI')}. `
          break
        }
        case 'pas-racine':
        default: {
          x = randint(-9, 9, [x1, x2])
          texte += `$${x}$ est-il une racine de $f$ ?`
          texteCorr = calculImageTrinome(a, b, c, x) + '<br>'
          texteCorr += `$f(${x})\\neq 0$ donc $${x}$ n'est pas une racine de $f$. La réponse est ${texteEnCouleurEtGras('NON')}. `
          break
        }
      }
      this.autoCorrection[i] = {
        options: { ordered: true, radio: true },

        enonce: '',
        propositions: [
          {
            texte: 'OUI',
            statut: listeTypeQuestions[i] === 'racine',
          },
          {
            texte: 'NON',
            statut: listeTypeQuestions[i] !== 'racine',
          },
        ],
      }
      const monQCM = propositionsQcm(this, i)
      if (this.questionJamaisPosee(i, a, b, c, x)) {
        if (this.interactif) {
          this.listeQuestions[i] = texte += monQCM.texte
        } else {
          this.listeQuestions[i] = texte
        }
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
