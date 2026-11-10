import { texPrix } from '../../../lib/format/style'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { prenomF } from '../../../lib/outils/Personne'
import { texNombre } from '../../../lib/outils/texNombre'

import Decimal from 'decimal.js'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Résoudre un problème de rendu de monnaie'
export const interactifReady = true

export const dateDeModifImportante = '22/08/2022'
export const dateDePublication = '21/10/2021'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora & Jean-claude Lhote
 */
export const uuid = '02170'

export const refs = {
  'fr-fr': ['can6C6-02', '6N2A-flash4', '5N2autoA-9'],
  'fr-ch': ['NR'],
}
export default class RenduMonnaie extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1

    this.formatChampTexte = KeyboardType.clavierNumbers
  }

  nouvelleVersion() {
    const listeviennoiserie = [
      ['pains au chocolat', ' un pain au chocolat'],
      ['chocolatines', 'une chocolatine'],
      ['pains aux raisins', 'un pain aux raisins'],
      ['cookies', 'un cookie'],
      ['brioches', 'une brioche'],
    ]
    let a, b, e, prenom1, v, p, pu, t, nbre

    switch (this.quotaChoice('typeDeQuestions', [1, 2, 3, 4])) {
      case 1:
        a = randint(1, 3) * 10
        e = randint(1, 4)
        b = a + 2 * e
        this.reponse = 50 - a
        this.question = `Un livre coûte $${texPrix(b)}$ €. Je donne un billet de $50$ € et $${e}$ ${e > 1 ? 'pièces' : 'pièce'} de $2$ €. <br>

        Combien me rend-on ?`
        this.correction = `On doit me rendre $${50 + 2 * e}-${b}=${miseEnEvidence(this.reponse)}$ €.`
        if (this.interactif) {
          this.optionsChampTexte = { texteApres: ' €' }
        }

        this.canReponseACompleter = '$\\dots$ €'
        break

      case 2:
        a = randint(1, 6) + randint(1, 9) / 10
        this.reponse = 10 - a
        this.question = `Chez le boulanger, je dois payer $${texPrix(a)}$ €. <br>
        Je donne un billet de $10$ €. <br>

Combien me rend-on ?`
        this.correction = `On doit me rendre $10-${texNombre(a)}=${miseEnEvidence(texNombre(10 - a))}$ €.`
        if (this.interactif) {
          this.optionsChampTexte = { texteApres: ' €' }
        }

        this.canReponseACompleter = '$\\dots$ €'
        break

      case 3:
        a = randint(2, 6)
        v = choice(listeviennoiserie)
        p = v[0]
        t = choice([10, 20])
        prenom1 = prenomF()
        pu = new Decimal(choice([9, 11, 12, 13, 14, 15, 16])).div(10)
        this.reponse = new Decimal(pu).mul(a).mul(-1).add(t)
        this.question = `À la boulangerie, ${prenom1} achète $${a}$ ${p} à $${texPrix(pu)}$ € l'unité.<br>
   Elle paie avec un billet de $${t}$ €.<br>

   Combien doit-on lui rendre ?`

        this.correction = `${prenom1} achète $${a}$ ${p} à $${texPrix(pu)}$ € l'unité.<br>
  Le coût est donc $${a}\\times ${texPrix(pu)} =${texPrix(a * Number(pu))}$ €.<br>
  On doit lui rendre : $${t}-${texPrix(a * Number(pu))}=${miseEnEvidence(texPrix(Number(this.reponse)))}$ €.
 `
        if (this.interactif) {
          this.optionsChampTexte = { texteApres: ' €' }
        }

        this.canReponseACompleter = '$\\dots$ €'
        break

      case 4:
        a = randint(5, 9)
        nbre = randint(3, 6)
        prenom1 = prenomF()
        this.reponse = nbre
        if (a * nbre < 35) {
          this.question = `${prenom1} a acheté des mangas coûtant $${a}$ € chacun. Elle a donné $40$ € au vendeur
            qui lui a rendu $${40 - a * nbre}$ €.<br>

            Combien de mangas ${prenom1} a-t-elle achetés ? `

          this.correction = `On lui a rendu $${40 - a * nbre}$ €, donc les mangas ont coûté $(40-${40 - a * nbre})$ €, soit $${a * nbre}$ €.<br>
         Le prix d'un manga est $${a}$ €, donc le nombre de mangas est donné par $${a * nbre}\\div ${a}=${miseEnEvidence(nbre)}$.`
        } else {
          this.question = `${prenom1} a acheté des mangas coûtant $${a}$ € chacun. Elle a donné $60$ € au vendeur
              qui lui a rendu $${60 - a * nbre}$ €.<br>

              Combien de mangas ${prenom1} a-t-elle achetés ? `

          this.correction = `On lui a rendu $${60 - a * nbre}$ €, donc les mangas ont coûté $(60-${60 - a * nbre})$ €, soit $${a * nbre}$ € .<br>
          Le prix d'un manga est $${a}$ €, donc le nombre de mangas est donné par $${a * nbre}\\div ${a}=${miseEnEvidence(nbre)}$.`
        }
        if (this.interactif) {
          this.optionsChampTexte = { texteApres: ' mangas' }
        }

        this.canReponseACompleter = '$\\dots$ mangas'
        break
    }
  }
}
