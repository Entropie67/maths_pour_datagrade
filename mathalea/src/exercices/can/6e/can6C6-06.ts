import Decimal from 'decimal.js'
import { texPrix } from '../../../lib/format/style'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { prenomF, prenomM } from '../../../lib/outils/Personne'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { deDevant, queDevant } from '../../../lib/outils/outilString'
export const titre = 'Résoudre un problème avec «\u00a0de plus\u00a0», «\u00a0de moins\u00a0»'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '27/07/2022'

/**
 * @author Gilles Mora
 */
export const uuid = '95dd2'

export const refs = {
  'fr-fr': ['can6C6-06', '6N2A-flash6', '5N2autoA-8'],
  'fr-ch': ['NR'],
}
export default class PlusOuMoins6ieme extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1

    this.formatChampTexte = KeyboardType.clavierNumbers
  }

  nouvelleVersion() {
    let a,
      b,
      c,
      prenom1,
      prenom2,
      choix1,
      reponse1,
      reponse2,
      choix,
      prix1,
      prix2,
      choix2,
      m1,
      m2
    switch (
      this.quotaChoice('typeDeQuestions', [1, 1, 1, 2, 3, 3, 3]) //
    ) {
      case 1:
        choix = choice(['a', 'b', 'c', 'd']) //
        choix1 = choice([true, false])
        prenom1 = prenomF()
        prenom2 = prenomF()
        while (prenom2 === prenom1) {
          prenom2 = prenomM()
        }
        a = new Decimal(randint(81, 119, [80, 90, 100, 110])).div(10)
        b = new Decimal(choice([15, 25, 35, 45, 55])).div(10)
        c = new Decimal(b).div(100)
        if (choix === 'a') {
          reponse1 = new Decimal(a).add(b)
          reponse2 = new Decimal(a).sub(b)
          this.reponse = choix1 ? reponse1 : reponse2
          this.question = `${prenom1} et ${prenom2} sont allées acheter un déjeuner dans une sandwicherie.<br>
                ${prenom1} a payé $${texPrix(a)}$ € pour son déjeuner. ${prenom2} a payé le sien $${texPrix(b)}$ € ${choix1 ? 'de plus' : ' de moins '}.<br>
                
                Combien ${prenom2} a-t-elle payé son déjeuner ? `
          this.correction = `${prenom2} a payé son déjeuner $${texPrix(b)}$ € ${choix1 ? 'de plus' : ' de moins '} que celui ${deDevant(prenom1)}.<br>
        Elle l'a donc payé (${choix1 ? `$${texPrix(a)}+${texPrix(b)}$` : `$${texPrix(a)}-${texPrix(b)}$`}) €, soit ${choix1 ? `$${miseEnEvidence(texPrix(reponse1))}$` : `$${miseEnEvidence(texPrix(reponse2))}$`} €.`

          this.canReponseACompleter = '$\\dots$ €'
        } else if (choix === 'b') {
          reponse2 = new Decimal(a).add(b)
          reponse1 = new Decimal(a).sub(b)
          this.reponse = choix1 ? reponse1 : reponse2
          this.question = `${prenom1} et ${prenom2} sont allées acheter un déjeuner dans une sandwicherie.<br>
                      ${prenom1} a payé $${texPrix(a)}$ € pour son déjeuner soit $${texPrix(b)}$ € ${choix1 ? 'de plus' : ' de moins '} ${queDevant(prenom2)}. <br>
                     
                      Combien ${prenom2} a-t-elle payé son déjeuner ? `
          this.correction = `${prenom1} a payé son déjeuner $${texPrix(b)}$ € ${choix1 ? 'de plus' : ' de moins '} que celui ${deDevant(prenom2)}.<br>
              ${prenom2} a donc payé son déjeuner $${texPrix(b)}$ € ${choix1 ? 'de moins' : ' de plus '}. Elle l'a donc payé (${choix1 ? `$${texPrix(a)}-${texPrix(b)}$` : `$${texPrix(a)}+${texPrix(b)}$`}) €, soit ${choix1 ? `$${miseEnEvidence(texPrix(reponse1))}$` : `$${miseEnEvidence(texPrix(reponse2))}$`} €.`

          this.canReponseACompleter = '$\\dots$ €'
        } else if (choix === 'c') {
          prix1 = new Decimal(a).add(b)
          prix2 = new Decimal(a).sub(b)
          reponse2 = new Decimal(a).mul(2).add(b)
          reponse1 = new Decimal(a).mul(2).sub(b)
          this.reponse = choix1 ? reponse1 : reponse2
          this.question = `${prenom1} et ${prenom2} sont allées acheter un déjeuner dans une sandwicherie.<br>
                      ${prenom1} a payé $${texPrix(a)}$ € pour son déjeuner soit $${texPrix(b)}$ € ${choix1 ? 'de plus' : ' de moins '}
                       ${queDevant(prenom2)}.<br>
                      
                      Combien ont-elles payé ensemble leur déjeuner ? `
          this.correction = `${prenom1} a payé son déjeuner $${texPrix(b)}$ € ${choix1 ? 'de plus' : ' de moins '}
          que celui ${deDevant(prenom2)}.<br>
              ${prenom2} a donc payé son déjeuner $${texPrix(b)}$ € ${choix1 ? 'de moins' : ' de plus '}.
              Elle l'a donc payé (${choix1 ? `$${texPrix(a)}-${texPrix(b)}$` : `$${texPrix(a)}+${texPrix(b)}$`}) €,
              soit ${choix1 ? `$${texPrix(prix2)}$` : `$${texPrix(prix1)}$`} €.<br>
              Ensemble, elles ont donc payé : (${choix1 ? `$${texPrix(a)}+${texPrix(prix2)}$` : `$${texPrix(a)}+${texPrix(prix1)}$`}) €,
              soit ${choix1 ? `$${miseEnEvidence(texPrix(reponse1))}$` : `$${miseEnEvidence(texPrix(reponse2))}$`} €. `

          this.canReponseACompleter = '$\\dots$ €'
        } else {
          prix1 = new Decimal(a).add(b)
          prix2 = new Decimal(a).sub(b)
          reponse2 = new Decimal(a).add(prix1)
          reponse1 = new Decimal(a).add(prix2)
          this.reponse = choix1 ? reponse2 : reponse1
          this.question = `${prenom1} et ${prenom2} sont allées acheter un déjeuner dans une sandwicherie.<br>
          ${prenom1} a payé $${texPrix(a)}$ € pour son déjeuner. ${prenom2} a payé le sien $${texPrix(b)}$ € ${choix1 ? 'de plus' : ' de moins '}.<br>
          
          Combien ont-elles payé ensemble leur déjeuner ? `
          this.correction = `${prenom2} a payé son déjeuner $${texPrix(b)}$ € ${choix1 ? 'de plus' : ' de moins '} que celui ${deDevant(prenom1)}.<br>
          Elle l'a donc payé (${choix1 ? `$${texPrix(a)}+${texPrix(b)}$` : `$${texPrix(a)}-${texPrix(b)}$`}) €, soit ${choix1 ? `$${texPrix(prix1)}$` : `$${texPrix(prix2)}$`} €. <br>
              Ensemble, elles ont donc payé : (${choix1 ? `$${texPrix(a)}+${texPrix(prix1)}$` : `$${texPrix(a)}+${texPrix(prix2)}$`}) €,
              soit ${choix1 ? `$${miseEnEvidence(texPrix(reponse2))}$` : `$${miseEnEvidence(texPrix(reponse1))}$`} €. `

          this.canReponseACompleter = '$\\dots$ €'
        }

        if (this.interactif) {
          this.optionsChampTexte = { texteApres: ' €' }
        }

        break

      case 2:
        choix1 = choice([true, false])
        prenom1 = prenomM()
        prenom2 = prenomM()
        while (prenom2 === prenom1) {
          prenom2 = prenomM()
        }
        a = new Decimal(randint(130, 160)).div(100)
        b = randint(2, 15)
        c = new Decimal(b).div(100)
        if (choice([true, false])) {
          reponse1 = new Decimal(a).add(c)
          reponse2 = new Decimal(a).sub(c)
          this.reponse = choix1 ? reponse2 : reponse1
          this.question = `${prenom1} mesure $${texNombre(a, 2, true)}\\text{ m}$. Il mesure $${b}\\text{ cm}$ ${choix1 ? 'de plus' : ' de moins '}
              ${queDevant(prenom2)}. <br>

              Quelle est la taille ${deDevant(prenom2)} ?`
          this.correction = `${prenom1} mesure $${b}\\text{ cm}$ ${choix1 ? 'de plus' : ' de moins '} ${queDevant(prenom2)} donc ${prenom2} mesure $${b}\\text{ cm}$ ${choix1 ? 'de moins' : ' de plus '} ${queDevant(prenom1)}.<br>
              Il mesure donc (${choix1 ? `$${texNombre(a, 2, true)}-${texNombre(c, 2, true)}$` : `$${texNombre(a, 2, true)}+${texNombre(c, 2, true)}$`}) $\\text{m}$, soit ${choix1 ? `$${miseEnEvidence(texNombre(reponse2, 2, true))}$` : `$${miseEnEvidence(texNombre(reponse1, 2, true))}$`} $\\text{m}$. `

          this.canReponseACompleter = '$\\dots\\text{ m}$'
        } else {
          reponse1 = new Decimal(a).add(c)
          reponse2 = new Decimal(a).sub(c)
          this.reponse = choix1 ? reponse1 : reponse2
          this.question = `${prenom1} mesure $${texNombre(a, 2, true)}\\text{ m}$. ${prenom2} mesure $${b}\\text{ cm}$ ${choix1 ? 'de plus' : ' de moins '}
                    ${queDevant(prenom1)}. <br>
                    Quelle est la taille ${deDevant(prenom2)} ?`
          this.correction = `${prenom2} mesure $${b}\\text{ cm}$ ${choix1 ? 'de plus' : ' de moins '} ${queDevant(prenom1)} donc ${prenom2} mesure (${choix1 ? `$${texNombre(a, 2, true)}+${texNombre(c, 2, true)}$` : `$${texNombre(a, 2, true)}-${texNombre(c, 2, true)}$`}) $\\text{m}$, soit ${choix1 ? `$${miseEnEvidence(texNombre(reponse1, 2, true))}$` : `$${miseEnEvidence(texNombre(reponse2, 2, true))}$`} $\\text{m}$. `

          this.canReponseACompleter = '$\\dots\\text{ m}$'
        }
        if (this.interactif) {
          this.optionsChampTexte = { texteApres: '$\\text{ m}$' }
        }

        break

      case 3:
        choix = choice(['a', 'b', 'c', 'd']) //, 'b', 'c', 'd'
        choix1 = choice([true, false])
        choix2 = choice([true, false])
        prenom1 = prenomM()
        prenom2 = prenomM()
        while (prenom2 === prenom1) {
          prenom2 = prenomM()
        }
        a = new Decimal(randint(1, 5) * 10 + randint(1, 10)).div(10)
        b = randint(1, 9) * 100
        c = new Decimal(b).div(1000)
        if (choix === 'a') {
          reponse1 = new Decimal(a).add(c)
          reponse2 = new Decimal(a).sub(c)
          this.reponse = choix1 ? reponse2 : reponse1
          this.question = `Chez le primeur, ${prenom1} a acheté $${texNombre(a, 1)}$ kg de ${choix2 ? 'fruits' : ' légumes '}.<br>
            Il en a acheté $${b}$ g ${choix1 ? 'de plus' : ' de moins '} ${queDevant(prenom2)}.<br>

            Quelle masse de ${choix2 ? 'fruits' : ' légumes '} a acheté ${prenom2} ?`
          this.correction = `${prenom1} a acheté $${b}$ g de ${choix2 ? 'fruits' : ' légumes '} ${choix1 ? 'de plus' : ' de moins '} ${queDevant(prenom2)}, donc ${prenom2} en a acheté $${b}$ g ${choix1 ? 'de moins' : ' de plus '} ${queDevant(prenom1)}.<br>
            Or $${b}$ g $=${texNombre(c, 1)}$ kg. <br>
            ${prenom2} a donc acheté $(${choix1 ? `${texNombre(a, 1)}-${texNombre(c, 1)}` : `${texNombre(a, 1)}+${texNombre(c, 1)}`})$ kg
            soit $${choix1 ? `${miseEnEvidence(texNombre(reponse2, 1))}` : `${miseEnEvidence(texNombre(reponse1, 1))}`}$ kg de ${choix2 ? 'fruits' : ' légumes '}.`

          this.canReponseACompleter = '$\\dots$ kg'
        } else if (choix === 'b') {
          reponse1 = new Decimal(a).add(c)
          reponse2 = new Decimal(a).sub(c)
          this.reponse = choix1 ? reponse1 : reponse2
          this.question = `Chez le primeur, ${prenom1} a acheté $${texNombre(a, 1)}$ kg de ${choix2 ? 'fruits' : ' légumes '}.<br>
          ${prenom2} en a acheté $${b}$ g ${choix1 ? 'de plus' : ' de moins '}.<br>

            Quelle masse de ${choix2 ? 'fruits' : ' légumes '} a acheté ${prenom2} ?`
          this.correction = `$${b}$ g $=${texNombre(c, 1)}$ kg. <br>
          ${prenom2} a acheté $${texNombre(c, 1)}$ kg de ${choix2 ? 'fruits' : ' légumes '} ${choix1 ? 'de plus' : ' de moins '} ${queDevant(prenom1)},
          donc ${prenom2} en a acheté $(${choix1 ? `${texNombre(a, 1)}+${texNombre(c, 1)}` : `${texNombre(a, 1)}-${texNombre(c, 1)}`})$ kg
            soit $${choix1 ? `${miseEnEvidence(texNombre(reponse1, 1))}` : `${miseEnEvidence(texNombre(reponse2, 1))}`}$ kg de ${choix2 ? 'fruits' : ' légumes '}.`

          this.canReponseACompleter = '$\\dots$ kg'
        } else if (choix === 'c') {
          m1 = new Decimal(a).add(c)
          m2 = new Decimal(a).sub(c)
          reponse1 = new Decimal(m1).add(a)
          reponse2 = new Decimal(m2).add(a)
          this.reponse = choix1 ? reponse1 : reponse2
          this.question = `Chez le primeur, ${prenom1} a acheté $${texNombre(a, 1)}$ kg de ${choix2 ? 'fruits' : ' légumes '}.<br>
          ${prenom2} en a acheté $${b}$ g ${choix1 ? 'de plus' : ' de moins '}.<br>

            Quelle masse de ${choix2 ? 'fruits' : ' légumes '} ont-ils acheté ensemble ?`
          this.correction = `$${b}$ g $=${texNombre(c, 1)}$ kg. <br>
          ${prenom2} a acheté $${texNombre(c, 1)}$ kg de ${choix2 ? 'fruits' : ' légumes '} ${choix1 ? 'de plus' : ' de moins '} ${queDevant(prenom1)},
          donc ${prenom2} en a acheté $(${choix1 ? `${texNombre(a, 1)}+${texNombre(c, 1)}` : `${texNombre(a, 1)}-${texNombre(c, 1)}`})$ kg
            soit $${choix1 ? `${texNombre(m1, 1)}` : `${texNombre(m2, 1)}`}$ kg de ${choix2 ? 'fruits' : ' légumes '}.<br>
            Ensemble, ils ont donc acheté : $(${choix1 ? `${texNombre(a, 1)}+${texNombre(m1, 1)}` : `${texNombre(a, 1)}+${texNombre(m2, 1)}`})$ kg
            soit $${choix1 ? `${miseEnEvidence(texNombre(reponse1, 1))}` : `${miseEnEvidence(texNombre(reponse2, 1))}`}$ kg de ${choix2 ? 'fruits' : ' légumes '}.`

          this.canReponseACompleter = '$\\dots$ kg'
        } else {
          m1 = new Decimal(a).add(c)
          m2 = new Decimal(a).sub(c)
          reponse1 = new Decimal(m1).add(a)
          reponse2 = new Decimal(m2).add(a)
          this.reponse = choix1 ? reponse2 : reponse1
          this.question = `Chez le primeur, ${prenom1} a acheté $${texNombre(a, 1)}$ kg de ${choix2 ? 'fruits' : ' légumes '}.<br>
          Il en a acheté $${b}$ g ${choix1 ? 'de plus' : ' de moins '} ${queDevant(prenom2)}.<br>

          Quelle masse de ${choix2 ? 'fruits' : ' légumes '} ont-ils acheté ensemble ?`
          this.correction = `${prenom1} a acheté $${b}$ g de ${choix2 ? 'fruits' : 'légumes'} ${choix1 ? 'de plus' : 'de moins'} ${queDevant(prenom2)}, donc ${prenom2} en a acheté $${b}$ g ${choix1 ? 'de moins' : ' de plus '} ${queDevant(prenom1)}.<br>
            Or $${b}$ g $=${texNombre(c, 1)}$ kg. <br>
            ${prenom2} a donc acheté $(${choix1 ? `${texNombre(a, 1)}-${texNombre(c, 1)}` : `${texNombre(a, 1)}+${texNombre(c, 1)}`})$ kg
            soit $${choix1 ? `${texNombre(m2, 1)}` : `${texNombre(m1, 1)}`}$ kg de ${choix2 ? 'fruits' : ' légumes '}.<br>
            Ensemble, ils ont donc acheté : $(${choix1 ? `${texNombre(a, 1)}+${texNombre(m2, 1)}` : `${texNombre(a, 1)}+${texNombre(m1, 1)}`})$ kg
            soit $${choix1 ? `${miseEnEvidence(texNombre(reponse2, 1))}` : `${miseEnEvidence(texNombre(reponse1, 1))}`}$ kg de ${choix2 ? 'fruits' : ' légumes '}.`

          this.canReponseACompleter = '$\\dots$ kg'
        }

        if (this.interactif) {
          this.optionsChampTexte = { texteApres: ' kg' }
        }

        break
    }
  }
}
