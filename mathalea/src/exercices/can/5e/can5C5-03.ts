import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../../lib/interactif/questionMathLive'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  ecritureNombreRelatif,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

export const interactifReady = true
export const titre = 'Trouver un entier relatif (addition à trou)'
export const dateDePublication = '19/10/2023'
/**
 * @author  Gilles Mora (J'ai repris l'ex 5R20-2)
 *

 */
export const dateDeModifImportante = '20/09/2026'

export const uuid = 'be94a'

export const refs = {
  'fr-fr': ['can5C5-03', '5N2G-flash2'],
  'fr-ch': ['NR'],
}
export default class AdditionRelatifATrou extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.sup = 20
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      let a = randint(1, this.sup)
      let b = randint(1, this.sup)
      const k = choice([
        [-1, -1],
        [-1, 1],
        [1, -1],
      ]) // Les deux nombres relatifs ne peuvent pas être tous les deux positifs
      a = a * k[0]
      b = b * k[1]
      const rang1 = randint(0, 1)

      const contenu =
        rang1 === 0
          ? `${ecritureNombreRelatif(a)} + %{champ1} = ${ecritureNombreRelatif(a + b)}`
          : `%{champ1} + ${ecritureNombreRelatif(a)} = ${ecritureNombreRelatif(a + b)}`

      handleAnswers(this, i, { champ1: { value: texNombre(b) } })

      const texte =
        "Quel nombre doit-on écrire pour que l'égalité soit correcte ? <br>" +
        remplisLesBlancs(
          this,
          i,
          contenu,
          KeyboardType.clavierDeBase,
          '\\ldots\\ldots',
        )

      const texteCorr =
        rang1 === 0
          ? `$ ${ecritureNombreRelatif(a)} + ${miseEnEvidence(ecritureNombreRelatif(b))} = ${ecritureNombreRelatif(a + b)} $`
          : `$ ${miseEnEvidence(ecritureNombreRelatif(b))} + ${ecritureNombreRelatif(a)} = ${ecritureNombreRelatif(a + b)} $`

      this.canEnonce = 'Compléter.'
      this.canReponseACompleter =
        rang1 === 0
          ? `$ ${ecritureNombreRelatif(a)} + \\ldots\\ldots = ${ecritureNombreRelatif(a + b)} $`
          : `$ \\ldots\\ldots + ${ecritureNombreRelatif(a)} = ${ecritureNombreRelatif(a + b)} $`

      if (this.questionJamaisPosee(i, a, b)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
