import { addMultiMathfield } from '../../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import Exercice from '../../Exercice'
export const titre = 'Test MultiMathfield'
export const interactifReady = true

export const dateDePublication = '26/03/2026'
/**
 * @author Jean-claude Lhote
 */
export const uuid = '29957'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export default class TestMultiMatfield extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  nouvelleVersion() {
    const a = randint(1, 2)
    const b = randint(1, 5)
    const c = randint(1, 2) * 5
    this.listeQuestions[0] = `$ABCD$ est un rectangle tel que $AB=${texNombre((a * 10 + b) / 10, 1)}\\text{ dm}$ et $BC=${texNombre(c)}\\text{ dm}$. Quelles sont les dimensions de ce rectangle en cm ?<br>
         ${addMultiMathfield(this, 0, {
           dataTemplate: `Tout d'abord, la largeur : %{champ2}<br>
           Ensuite, la longueur : %{champ3}<br>
           Le périmètre est : %{champ4}`,
           dataOptions: {
             champ2: {
               keyboard: KeyboardType.longueur,
               placeholder: '123\\text{ cm}',
               texteApres: '<em class="ml-2">(Une unité est attendue.)</em>',
             },
             champ3: {
               keyboard: KeyboardType.longueur,
               placeholder: '123\\text{ cm }',
               texteApres: '<em class="ml-2">(Une unité est attendue.)</em>',
             },
             champ4: {
               keyboard: KeyboardType.longueur,
               placeholder: '123\\text{ cm }',
               texteApres: '<em class="ml-2">(Une unité est attendue.)</em>',
             },
           },
         })}`
    this.listeCorrections[0] = `Le périmètre de $ABCD$ est égal à $2\\times(AB+BC)$,
     soit $${miseEnEvidence('2')}\\times(${miseEnEvidence(`${texNombre(a * 10 + b, 0)}\\text{ cm}`)}
     +${miseEnEvidence(`${texNombre(c * 10, 0)}\\text{ cm}`)})=
     ${miseEnEvidence(`${texNombre(2 * (a * 10 + b + c * 10), 0)}\\text{ cm}`)}$`
    handleAnswers(
      this,
      0,
      {
        champ2: {
          value: `${Math.min(a * 10 + b, c * 10)} cm`,
          options: { unite: true },
        },
        champ3: {
          value: `${Math.max(a * 10 + b, c * 10)} cm`,
          options: { unite: true },
        },
        champ4: {
          value: `${2 * (a * 10 + b + c * 10)} cm`,
          options: { unite: true },
        },
      },
      { formatInteractif: 'multi-mathfield' },
    )
  }
}
