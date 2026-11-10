import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import { reduireAxPlusB, rienSi1 } from '../../../lib/outils/ecritures'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { miseEnEvidence } from '../../../lib/outils/embellissements'

export const titre = 'Trouver les racines à partir d’une forme factorisée'
export const interactifReady = true

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '01/06/2022' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
 *
 * @author Gilles Mora
 */
export const uuid = 'a23a1'

export const refs = {
  'fr-fr': ['can1SD21-04'],
  'fr-ch': [],
}
export default class RacinesPoly extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let texte, texteCorr
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const a = randint(-9, 9, 0)
      const x1 = randint(-9, 9)
      const x2 = randint(-9, 9, [0, x1])
      if (x1 === 0) {
        texte = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par :
        $f(x)=${rienSi1(a)}x(${reduireAxPlusB(1, -x2)})$. <br>`
      } else {
        texte = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par :
        $f(x)=${rienSi1(a)}(${reduireAxPlusB(1, -x1)})(${reduireAxPlusB(1, -x2)})$. <br>`
      }
      texte += 'Déterminer les racines de $f$.'
      handleAnswers(this, i, {
        reponse: {
          value: `${Math.min(x1, x2)};${Math.max(x1, x2)}`,
          options: { suiteDeNombres: true },
        },
      })
      if (this.interactif) {
        texte += '<br>Écrire ces racines séparées par un point-virgule : '
        texte +=
          ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierFullOperations,
          )
      }

      texteCorr = `$f$ est une fonction polynôme du second degré écrite sous forme factorisée $a(x-x_1)(x-x_2)$.<br>
      Les racines sont donc $x_1=${miseEnEvidence(x1)}$ et $x_2=${miseEnEvidence(x2)}$.`
      if (this.questionJamaisPosee(i, a, x1, x2)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
    this.canEnonce = texte
  }
}
