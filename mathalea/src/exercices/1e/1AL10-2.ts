import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
export const titre = "Calculer un terme d'une suite définie de façon explicite"
export const interactifReady = true

export const dateDeModifImportante = '22/09/2024'
/**
 * @author Gilles Mora (Gaelle Morvan)
 */
export const uuid = 'f0c2d'

export const refs = {
  'fr-fr': ['1AL10-2', '1Tec-S102', 'BP1AA01'],
  'fr-ch': [],
}
export default class TermeDUneSuiteDefinieExplicitement extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.sup = 4
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets  :',
        '1 : Affine',
        '2 : Second degré',
        '3 : Homographique',
        '4 : Mélange',
      ].join('\n'),
    ]
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: this.nbQuestions,
    })
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    // Tous les types de questions sont posées mais l'ordre diffère à chaque "cycle"

    for (
      let i = 0, texte, texteCorr, reponse, cpt = 0, a, b, c, d, k;
      i < this.nbQuestions && cpt < 50;
    ) {
      switch (
        listeTypeDeQuestions[i] // listeTypeDeQuestions[i]
      ) {
        case 1: // fonction affine
          a = randint(1, 10) * choice([-1, 1])
          b = randint(1, 10) * choice([-1, 1])
          k = randint(0, 20)
          reponse = a * k + b
          handleAnswers(this, i, {
            reponse: { value: reponse },
          })
          texte = `Soit $(u_n)$ une suite définie pour tout entier $n\\in\\mathbb{N}$ par $u_n =${rienSi1(a)}n${ecritureAlgebrique(b)}$. `

          texte += `<br>Calculer $u_{${k}}$.`

          texteCorr = `Dans l'expression de $u_n$, on remplace $n$ par $${k}$, on obtient : <br>
          $\\begin{aligned}
u_{${k}}&=${a === 1 ? '' : a === -1 ? '-' : `${a} \\times`} ${k} ${ecritureAlgebrique(b)}\\\\
&=${miseEnEvidence(a * k + b)}
\\end{aligned}$`

          break

        case 2: // fonction polynome de degré 2
          a = randint(1, 3) * choice([-1, 1])
          b = randint(0, 9) * choice([-1, 1])
          c = randint(0, 9) * choice([-1, 1])
          k = randint(0, 10)
          reponse = a * k ** 2 + b * k + c
          handleAnswers(this, i, {
            reponse: { value: reponse },
          })
          texte = `Soit $(u_n)$ une suite définie pour tout entier $n\\in\\mathbb{N}$ par
        ${b === 0 ? `$u_n = ${rienSi1(a)}n^2${ecritureAlgebrique(c)}$` : `$u_n = ${rienSi1(a)}n^2${ecritureAlgebriqueSauf1(b)}n${ecritureAlgebrique(c)}$`}  .`

          texte += `<br>Calculer $u_{${k}}$.`

          texteCorr = `Dans l'expression de $u_n$, on remplace $n$ par $${k}$, on obtient :<br>`
          if (b === 0) {
            texteCorr += `$\\begin{aligned}
            u_{${k}}&=${a === 1 ? '' : a === -1 ? '-' : `${a} \\times`} ${k}^2${ecritureAlgebrique(c)}\\\\
            &=${miseEnEvidence(reponse)}
            \\end{aligned}$`
          } else {
            texteCorr += `$\\begin{aligned}
u_{${k}}&=${a === 1 ? '' : a === -1 ? '-' : `${a} \\times`} ${k}^2 ${b === 1 ? '+' : b === -1 ? '-' : `${ecritureAlgebrique(b)} \\times`} ${k}${ecritureAlgebrique(c)}\\\\
&=${miseEnEvidence(reponse)}
\\end{aligned}$`
          }
          break

        case 3: // fonction homographique
        default:
          a = randint(1, 5) * choice([-1, 1])
          b = randint(1, 5) * choice([-1, 1])
          c = randint(2, 4)
          d = randint(1, 7)
          k = randint(1, 9)
          this.reponse = 1
          texte = `Soit $(u_n)$ une suite définie pour tout entier $n\\in\\mathbb{N}$ par
          $u_n =\\dfrac{${rienSi1(a)}n${ecritureAlgebrique(b)}}{${rienSi1(c)}n${ecritureAlgebrique(d)}} $.`

          texte += `<br>Calculer $u_{${k}}$. <br>
          Donner le résultat sous la forme d'une fraction irréductible ou d'un nombre entier.`
          reponse = new FractionEtendue(a * k + b, c * k + d).simplifie()
          handleAnswers(this, i, {
            reponse: {
              value: reponse.texFSD,
              options: { fractionIrreductible: true },
            },
          })
          texteCorr = `Dans l'expression de $u_n$, on remplace $n$ par $${k}$, on obtient :<br>
         $\\begin{aligned}
u_{${k}}&=\\dfrac{${a === 1 ? '' : a === -1 ? '-' : `${a} \\times`} ${k} ${ecritureAlgebrique(b)}}{${c === 1 ? '' : c === -1 ? '-' : `${c} \\times`} ${k} ${ecritureAlgebrique(d)}}\\\\
&=${miseEnEvidence(reponse.texFSD)}
\\end{aligned}$`

          break
      }
      texte +=
        '<br>' +
        ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierDeBaseAvecFraction,
          { texteAvant: `$u_{${k}}=$` },
        )

      if (this.questionJamaisPosee(i, a, b, k)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
