import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { prenomF, prenomM } from '../../../lib/outils/Personne'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
import { deDevant } from '../../../lib/outils/outilString'
export const titre = 'Résoudre un problème de partage'
export const interactifReady = true

export const dateDePublication = '03/07/2025'
/**
 * @author Gilles Mora
 */
export const uuid = '6c977'

export const refs = {
  'fr-fr': ['can6C6-05', '6N2K-flash3'],
  'fr-ch': [],
}
export default class PetitsProblemePartage2 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1

    this.formatChampTexte = KeyboardType.clavierNumbers
  }

  nouvelleVersion() {
    const listeProportion1 = [
      ['au quart du', 4],
      [' au tiers du', 3],
      ['à la moitié du', 2],
      ['au cinquième du', 5],
      ['à la moitié du', 2],
    ]
    const listeProportion2 = [
      ['au double du', 2],
      ['au triple du', 3],
      ['au triple du ', 3],
      ['quatre fois le ', 4],
      ['cinq fois le ', 5],
    ]
    let a, nbre1, nbre2, nbre, prenom1, choix, proportion
    switch (this.quotaChoice('typeDeQuestions', [1, 2])) {
      case 1:
        choix = choice([true, false])
        prenom1 = prenomF()
        a = randint(2, 5)
        nbre1 = choice([10, 20, 25])
        nbre2 = choice([10, 20, 25]) / 100

        this.reponse = choix
          ? `${new Decimal(a).div(nbre2)}`
          : `${new Decimal(a).mul(100).div(nbre1)}`
        this.question = ` Pour son anniversaire, ${prenom1} a acheté $${a}$ litres de jus de fruits.<br>
         Les verres de ${prenom1} contiennent ${choix ? `$${texNombre(nbre2, 2, true)}$ litre` : `$${texNombre(nbre1, 0, true)}$ centilitres`}.<br>

            Combien de verres de jus de fruits ${prenom1} pourra-t-elle servir ? `
        this.correction = `Dans un litre, il y a ${choix ? `$${texNombre(1 / nbre2, 0, true)}\\times ${texNombre(nbre2, 2, true)}$ litre ` : `$${texNombre(100 / nbre1, 0, true)}\\times ${texNombre(nbre1, 0, true)}$ centilitres`}.<br>
        Dans $${a}$ litres, il y a donc ${choix ? `$${texNombre(a / nbre2, 0, true)}\\times ${texNombre(nbre2, 2, true)}$ litre ` : `$${texNombre((100 * a) / nbre1, 0, true)}\\times ${texNombre(nbre1, 0, true)}$ centilitres`}.<br>
        Elle pourra donc servir ${choix ? `$${miseEnEvidence(texNombre(a / nbre2, 0, true))}$` : `$${miseEnEvidence(texNombre((100 * a) / nbre1, 0, true))}$`} verres.`
        if (this.interactif) {
          this.optionsChampTexte = { texteAvant: '<br>', texteApres: ' verres' }
        }

        this.canReponseACompleter = '$\\dots$ verres'
        break
      case 2:
        if (choice([true, false])) {
          proportion = choice(listeProportion1)
          prenom1 = prenomM()
          a = randint(2, 10)
          nbre = a * Number(proportion[1]) + a

          this.reponse = a
          this.question = `  Le nombre de billes ${deDevant(prenom1)} est égal ${proportion[0]} nombre
                de billes de sa sœur.<br>
                 À eux deux, ils ont $${nbre}$ billes.<br>
                Combien de billes a ${prenom1} ? `
          this.correction = `Il faut partager le nombre de billes en $${Number(proportion[1]) + 1}$.<br>
        $${nbre}\\div ${Number(proportion[1]) + 1}=${nbre / (Number(proportion[1]) + 1)}$.<br>
        ${prenom1} aura donc $${miseEnEvidence(a)}$ billes (sa sœur en aura $${a}\\times ${Number(proportion[1])}$, soit $${a * Number(proportion[1])}$).
        `
        } else {
          proportion = choice(listeProportion2)
          prenom1 = prenomM()
          a = randint(2, 10)

          nbre = a * Number(proportion[1]) + a

          this.reponse = a * Number(proportion[1])
          this.question = `  Le nombre de billes ${deDevant(prenom1)} est égal ${proportion[0]} nombre
                  de billes de sa sœur.<br>
                   À eux deux, ils ont $${nbre}$ billes.<br>
                  Combien de billes a ${prenom1} ? `
          this.correction = `Il faut partager le nombre de billes en $${Number(proportion[1]) + 1}$.<br>
          $${nbre}\\div ${Number(proportion[1]) + 1}=${nbre / (Number(proportion[1]) + 1)}$.<br>
          ${prenom1} aura donc $${a}\\times ${proportion[1]}=${miseEnEvidence(this.reponse)}$ billes (sa sœur en aura $${a}$).
          `
        }
        if (this.interactif) {
          this.optionsChampTexte = { texteAvant: '<br>', texteApres: ' billes' }
        }

        this.canReponseACompleter = '$\\dots$ billes'
        break
    }
  }
}
