import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  rienSi1,
} from '../../lib/outils/ecritures'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Trinome from '../../modules/Trinome'
import Exercice from '../Exercice'

import { boutonReponsePredefinie } from '../../lib/interactif/boutonReponsePredefinie'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'

export const titre =
  'Factoriser un polynôme du second degré avec racines entières'
export const interactifReady = true

export const dateDeModifImportante = '9/10/2024'

/**
 *
 * @author Rémi Angot et Stéphane Guyon..
 */
export const uuid = 'a8e1b'

export const refs = {
  'fr-fr': ['1AL22-2'],
  'fr-ch': [''],
}
export default class ResoudreEquationDegre2 extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.nbCols = 2
    this.nbColsCorr = 2
    this.spacingCorr = 3
    this.comment =
      'Une fois sur 2, il y a deux racines entières, une fois sur 4 une racine double et une fois sur 4, pas de racine.'
  }

  nouvelleVersion() {
    this.consigne =
      'Factoriser, si cela est possible, ' +
      (this.nbQuestions !== 1 ? 'chaque' : 'le') +
      ` polynôme $P$ suivant défini pour tout $x$ de $\\mathbb R$ par${sp()}: `
    const listeTypeDeQuestions = combinaisonListes(
      [
        'solutionsEntieres',
        'solutionsEntieres',
        'identiteRemarquable',
        'pasDeSolution',
      ],
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let a: number
      let b: number
      let c: number
      let x1: number
      let x2: number
      let y1: number
      let k: number
      if (listeTypeDeQuestions[i] === 'solutionsEntieres') {
        // k(x-x1)(x-x2)
        x1 = randint(-5, 2, [0])
        x2 = randint(x1 + 1, 5, [0, -x1])
        k = randint(-4, 4, [0])
        a = k
        b = -k * x1 - k * x2
        c = k * x1 * x2

        const trinome = new Trinome(a, b, c)

        texte = `$P(x)=${rienSi1(a)}x^2${ecritureAlgebriqueSauf1(b)}x${ecritureAlgebrique(c)}$`

        texteCorr = `On a $P$ le polynôme défini pour tout $x$ de $\\mathbb R$ par $P(x)=${rienSi1(a)}x^2${ecritureAlgebriqueSauf1(b)}x${ecritureAlgebrique(c)}$.`
        texteCorr +=
          '<br>On reconnaît un polynôme du second degré. On cherche ses éventuelles racines en calculant son discriminant.'
        texteCorr += `<br>$\\Delta = ${trinome.texCalculDiscriminant}$`
        texteCorr += `<br>$\\Delta>0$ donc $P(x)$ admet deux racines${sp()}:`
        texteCorr += `<br>$${trinome.texCalculRacine1()}$`
        texteCorr += `<br>$${trinome.texCalculRacine2()}$.`
        texteCorr +=
          `<br>On peut donc factoriser le polynôme sous la forme${sp()}: $P(x)=a(x-x_1)(x-x_2)$.`
        texteCorr += `<br>$P(x)=${miseEnEvidence(trinome.texFormeFactorisee)}$`
        handleAnswers(this, i, {
          reponse: {
            value: trinome.texFormeFactorisee,
            options: { factorisation: true },
          },
        })
      } else if (listeTypeDeQuestions[i] === 'identiteRemarquable') {
        // k(x-x1)(x-x1)
        x1 = randint(-5, 2, [0])
        x2 = x1
        k = randint(-4, 4, [0])
        a = k
        b = -k * x1 - k * x2
        c = k * x1 * x2

        const trinome = new Trinome(a, b, c)

        texte = `$P(x)=${rienSi1(a)}x^2${ecritureAlgebriqueSauf1(b)}x${ecritureAlgebrique(c)}$`

        texteCorr = `On a $P$ le polynôme défini pour tout $x$ de $\\mathbb R$ par $P(x)=${rienSi1(a)}x^2${ecritureAlgebriqueSauf1(b)}x${ecritureAlgebrique(c)}$.`
        texteCorr +=
          '<br>On reconnaît un polynôme du second degré. On cherche ses éventuelles racines en calculant son discriminant.'
        texteCorr += `<br>$\\Delta = ${trinome.texCalculDiscriminant}$`
        texteCorr += `<br>$\\Delta=0$ donc $P(x)$ admet une unique racine${sp()}:`
        texteCorr += `<br> $x_0 = ${trinome.texCalculRacine1()}$.`
        texteCorr +=
          `<br>On peut donc factoriser le polynôme sous la forme${sp()}: $P(x)=a(x-x_0)^2$.`
        texteCorr += `<br>$P(x)=${miseEnEvidence(trinome.texFormeFactorisee)}$`
        handleAnswers(this, i, {
          reponse: {
            value: trinome.texFormeFactorisee,
            options: { factorisation: true },
          },
        })
      } else {
        // listeTypeDeQuestions[i] === 'pasDeSolution'
        k = randint(1, 5)
        x1 = randint(-3, 3, [0])
        y1 = randint(1, 5)
        if (choice(['+', '-']) === '+') {
          // k(x-x1)^2 + y1 avec k>0 et y1>0
          a = k
          b = -2 * k * x1
          c = k * x1 * x1 + y1
        } else {
          // -k(x-x1)^2 -y1 avec k>0 et y1>0
          a = -k
          b = 2 * k * x1
          c = -k * x1 * x1 - y1
        }
        texte = `$P(x)=${rienSi1(a)}x^2${ecritureAlgebriqueSauf1(b)}x${ecritureAlgebrique(c)}$`

        texteCorr = `On a $P$ le polynôme défini pour tout $x$ de $\\mathbb R$ par $P(x)=${rienSi1(a)}x^2${ecritureAlgebriqueSauf1(b)}x${ecritureAlgebrique(c)}$`
        texteCorr +=
          '<br>On reconnaît un polynôme du second degré. On cherche ses éventuelles racines en calculant son discriminant.'
        texteCorr +=
          "<br>$\\Delta<0$ donc le polynôme n'admet pas de racines réelles."
        texteCorr += `<br>D'après le cours, il n'est ${texteEnCouleurEtGras('pas factorisable')}.`
        handleAnswers(this, i, {
          reponse: { value: '\\text{Pas factorisable}' },
        })
      }
      texte +=
        '<br>' +
        ajouteChampTexteMathLive(this, i, KeyboardType.clavierFullOperations, {
          texteAvant: '$P(x)=$',
        })
      if (this.interactif) {
        texte += boutonReponsePredefinie({
          numeroExercice: this.numeroExercice,
          indiceQuestion: i,
          label: 'Pas factorisable',
        })
      }

      if (this.questionJamaisPosee(i, a, b, c)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
