import { toutAUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
export const titre =
  "Trouver un ordre de grandeur d'un produit de nombres entiers ou décimaux"
export const interactifReady = true

/**
 * * Ordre de grandeur d'une multiplication d'entiers ou de décimaux
 * * 6N31-2
 * @author Jean-claude Lhote
 */

export const dateDePublication = '06/01/2025'
export const uuid = '843e6'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

export default class OrdreDeGrandeurMultiplicationOld extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 5
    this.besoinFormulaireTexte = [
      'Type de question',
      'nombres séparés par des tirets :\n1: Nombres entiers\n2: Nombres décimaux\n3: Mélange',
    ]
    this.besoinFormulaire2Texte = [
      "Type d'opération",
      'nombres séparés par des tirets :\n1: Multiplication\n2: Addition\n3: Soustraction\n4: Division\n5: Mélange',
    ]
    this.besoinFormulaire3CaseACocher = ['Nombres plus simples', false]

    this.consigne =
      'Donner un ordre de grandeur de chaque nombre puis du résultat.'
    this.sup = '3'
    this.sup2 = '1'
    this.sup3 = false

    // this.nbQuestionsModifiable = false;
    this.spacing = context.isHtml ? 3 : 2
    this.spacingCorr = context.isHtml ? 2.5 : 1.5
  }

  nouvelleVersion() {
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      nbQuestions: this.nbQuestions,
      min: 1,
      max: 2,
      melange: 3,
      defaut: 3,
    }).map(Number)
    const listeTypeOperations = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      nbQuestions: this.nbQuestions,
      min: 1,
      max: 4,
      melange: 5,
      defaut: 5,
    }).map(Number)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte: string = ''
      let texteCorr: string = ''
      let nb1: number = 0
      let nb2: number = 0
      const nbChiffres = this.sup3 ? 2 : 5
      switch (listeTypeOperations[i]) {
        case 1:
          {
            // multiplication
            const p1 = randint(2, nbChiffres)
            const p2 = randint(2, nbChiffres)
            const ordreDeGrandeur1 = randint(2, 8) * 10 ** p1
            const ordreDeGrandeur2 = randint(2, 8) * 10 ** p2
            const d1 = randint(10 ** (p1 - 2) + 1, 10 ** (p1 - 1) - 1)
            const d2 = randint(10 ** (p2 - 2) + 1, 10 ** (p2 - 1) - 1)
            const nombre1 = ordreDeGrandeur1 + choice([-1, 1]) * d1
            const nombre2 = ordreDeGrandeur2 + choice([-1, 1]) * d2
            const div1 =
              listeTypeDeQuestions[i] === 1
                ? 1
                : 10 ** randint(1, nbChiffres - 1)
            const div2 =
              listeTypeDeQuestions[i] === 1
                ? 1
                : 10 ** randint(1, nbChiffres - 1)
            nb1 = nombre1 / div1
            nb2 = nombre2 / div2
            const odg1 = ordreDeGrandeur1 / div1
            const odg2 = ordreDeGrandeur2 / div2

            texte = `$${texNombre(nb1, 4)}\\times${texNombre(nb2, 4)}\\approx$ ${remplisLesBlancs(this, i, '%{champ1}\\times %{champ2}\\approx %{champ3}', '', '\\ldots\\ldots\\ldots')}`
            texteCorr = `$${texNombre(nb1, 4)}\\times${texNombre(nb2, 4)}\\approx${texNombre(odg1, 4)}\\times${texNombre(odg2, 4)}\\approx${miseEnEvidence(texNombre(odg1 * odg2, 6))}$`
            handleAnswers(this, i, {
              champ1: { value: odg1 },
              champ2: { value: odg2 },
              champ3: { value: odg1 * odg2 },
              bareme: toutAUnPoint,
            })
          }
          break
        case 2:
          {
            // addition
            const p1 = randint(2, nbChiffres)
            const ordreDeGrandeur1 = randint(2, 8) * 10 ** p1
            const ordreDeGrandeur2 = randint(2, 8) * 10 ** p1
            const d1 = randint(
              1,
              p1 === 2 ? 2 : p1 === 3 ? 20 : p1 === 4 ? 200 : 2000,
            )
            const d2 = randint(
              1,
              p1 === 2 ? 2 : p1 === 3 ? 20 : p1 === 4 ? 200 : 2000,
            )
            const nombre1 = ordreDeGrandeur1 + choice([-1, 1]) * d1
            const nombre2 = ordreDeGrandeur2 + choice([-1, 1]) * d2
            const div1 =
              listeTypeDeQuestions[i] === 1
                ? 1
                : 10 ** randint(1, nbChiffres - 1)
            nb1 = nombre1 / div1
            nb2 = nombre2 / div1
            const odg1 = ordreDeGrandeur1 / div1
            const odg2 = ordreDeGrandeur2 / div1

            texte = `$${texNombre(nb1, 4)}+${texNombre(nb2, 3)}\\approx$ ${remplisLesBlancs(this, i, '%{champ1}+%{champ2}\\approx%{champ3}', '', '\\ldots\\ldots\\ldots')}`
            texteCorr = `$${texNombre(nb1, 3)}+${texNombre(nb2, 3)}\\approx${texNombre(odg1, 3)}+${texNombre(odg2, 3)}\\approx${miseEnEvidence(texNombre(odg1 + odg2, 6))}$`
            handleAnswers(this, i, {
              champ1: { value: odg1 },
              champ2: { value: odg2 },
              champ3: { value: odg1 + odg2 },
              bareme: toutAUnPoint,
            })
          }
          break
        case 3:
          {
            // soustraction
            const p1 = randint(2, nbChiffres)
            const o1 = randint(3, 8)
            const o2 = randint(2, o1 - 1)
            const ordreDeGrandeur1 = o1 * 10 ** p1
            const ordreDeGrandeur2 = o2 * 10 ** p1
            const d1 = randint(
              1,
              p1 === 2 ? 2 : p1 === 3 ? 20 : p1 === 4 ? 200 : 2000,
            )
            const d2 = randint(
              1,
              p1 === 2 ? 2 : p1 === 3 ? 20 : p1 === 4 ? 200 : 2000,
            )
            const nombre1 = ordreDeGrandeur1 + choice([-1, 1]) * d1
            const nombre2 = ordreDeGrandeur2 + choice([-1, 1]) * d2
            const div1 =
              listeTypeDeQuestions[i] === 1
                ? 1
                : 10 ** randint(1, nbChiffres - 1)
            nb1 = nombre1 / div1
            nb2 = nombre2 / div1
            const odg1 = ordreDeGrandeur1 / div1
            const odg2 = ordreDeGrandeur2 / div1

            texte = `$${texNombre(nb1, 3)}-${texNombre(nb2, 3)}\\approx$ ${remplisLesBlancs(this, i, '%{champ1}-%{champ2}\\approx%{champ3}', '', '\\ldots\\ldots\\ldots')}`
            texteCorr = `$${texNombre(nb1, 3)}-${texNombre(nb2, 3)}\\approx${texNombre(odg1, 3)}-${texNombre(odg2, 3)}\\approx${miseEnEvidence(texNombre(odg1 - odg2, 6))}$`
            handleAnswers(this, i, {
              champ1: { value: odg1 },
              champ2: { value: odg2 },
              champ3: { value: odg1 - odg2 },
              bareme: toutAUnPoint,
            })
          }
          break

        case 4:
        default:
          {
            // division
            const o2 = choice([2, 3, 4, 5])
            const p1 = randint(2, nbChiffres)
            const o1 = randint(2, 8) * o2
            const p2 = listeTypeDeQuestions[i] === 1 ? 2 : 1
            const ordreDeGrandeur1 = o1 * 10 ** p1
            const ordreDeGrandeur2 = o2 * 10 ** p2
            const d1 = randint(
              1,
              p1 === 2 ? 2 : p1 === 3 ? 20 : p1 === 4 ? 200 : 2000,
            )
            const d2 = p2 === 2 ? randint(1, 3) : randint(1, 3) / 10
            const nombre1 = ordreDeGrandeur1 + choice([-1, 1]) * d1
            const nombre2 = ordreDeGrandeur2 + choice([-1, 1]) * d2
            const div1 =
              listeTypeDeQuestions[i] === 1 ? 1 : 10 ** randint(1, p1 - 1)
            const div2 = 1
            nb1 = nombre1 / div1
            nb2 = nombre2 / div2
            const odg1 = ordreDeGrandeur1 / div1
            const odg2 = ordreDeGrandeur2 / div2

            texte = `$${texNombre(nb1, 3)}:${texNombre(nb2, 3)}\\approx$ ${remplisLesBlancs(this, i, '%{champ1}:%{champ2}\\approx%{champ3}', '', '\\ldots\\ldots\\ldots')}`
            texteCorr = `$${texNombre(nb1, 3)}:${texNombre(nb2, 3)}\\approx${texNombre(odg1, 3)}:${texNombre(odg2, 3)}\\approx${miseEnEvidence(texNombre(odg1 / odg2, 6))}$`
            handleAnswers(this, i, {
              champ1: { value: odg1 },
              champ2: { value: odg2 },
              champ3: { value: odg1 / odg2 },
              bareme: toutAUnPoint,
            })
          }
          break
      }
      if (this.questionJamaisPosee(i, nb1, nb2)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
