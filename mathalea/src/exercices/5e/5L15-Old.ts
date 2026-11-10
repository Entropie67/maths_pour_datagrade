import { amcConvert } from '../../lib/amc/amcBuilders'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { nombreDeChiffresDansLaPartieEntiere } from '../../lib/outils/nombres'
import { sp } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Tester une égalité'
export const dateDeModifImportante = '18/11/2023'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'

/**
 * Tester une égalité pour 2 valeurs données (une vraie et une fausse)
 *
 * * 3x-a=2x+b
 * * 3x+a=5x-b
 * * ax+b=(a+1)x-c
 * * a-2x=b+2x
 * @author Rémi Angot
 */
export const uuid = 'd88d6'

export const refs = {
  'fr-fr': [''],
  'fr-ch': [''],
}
export default class TesterUneEgaliteOld extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      2,
      '1 : Entiers naturels\n2 : Entiers relatifs',
    ]
    this.besoinFormulaire2CaseACocher = ['Avec des expressions du second degré']
    this.besoinFormulaire3Numerique = [
      "Type d'exercices AMC",
      2,
      '1 : Question ouverte\n2 : Réponses numériques',
    ]

    this.nbQuestions = 3

    this.sup = 1
    this.sup2 = false
    this.sup3 = 2
  }

  nouvelleVersion() {
    let typesDeQuestionsDisponibles // = range1(5)

    if (!this.sup2) {
      typesDeQuestionsDisponibles = [1, 2, 3, 4, 5]
    } else {
      typesDeQuestionsDisponibles = [6, 7, 3]
    }
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posées mais l'ordre diffère à chaque "cycle"

    for (
      let i = 0, texte, texteCorr, expression, rep1, rep2, rep3, rep4, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      let a, b, c, d, x1, x2, x3
      switch (listeTypeDeQuestions[i]) {
        case 1: // 3x-a=2x+b   x=a+b
          if (this.sup === 1) {
            a = randint(1, 6)
            b = randint(1, 6, [a])
            x2 = a + b
            x1 = randint(2, 10, [x2])
          } else {
            a = randint(-6, 6, [0])
            b = randint(-6, 6, [a, 0])
            x2 = a + b
            x1 = randint(-10, 10, [0, x2])
          }
          expression = `$${sp(2)}3x-${ecritureParentheseSiNegatif(a)}=2x+${ecritureParentheseSiNegatif(b)}${sp(1)}$`
          texteCorr = `Pour $x=${x1}$ : <br>`
          texteCorr += `D'une part, $3x-${ecritureParentheseSiNegatif(a)}=3\\times ${ecritureParentheseSiNegatif(x1)}-${ecritureParentheseSiNegatif(a)}=${miseEnEvidence(3 * x1 - a)}$. <br>D'autre part, $2x+${ecritureParentheseSiNegatif(b)}=2\\times ${ecritureParentheseSiNegatif(x1)}+${ecritureParentheseSiNegatif(b)}=${miseEnEvidence(2 * x1 + b)}$.<br>`
          texteCorr += `$${3 * x1 - a}\\not=${2 * x1 + b}$ donc ${texteEnCouleurEtGras("l'égalité n'est pas vraie")}.<br><br>`
          texteCorr += `Pour $x=${ecritureParentheseSiNegatif(x2)}$ : <br>`
          texteCorr += `D'une part, $3x-${ecritureParentheseSiNegatif(a)}=3\\times ${ecritureParentheseSiNegatif(x2)}-${ecritureParentheseSiNegatif(a)}=${miseEnEvidence(3 * x2 - a)}$. <br>D'autre part, $2x+${ecritureParentheseSiNegatif(b)}=2\\times ${ecritureParentheseSiNegatif(x2)}+${ecritureParentheseSiNegatif(b)}=${miseEnEvidence(2 * x2 + b)}$.<br>`
          texteCorr += `On trouve le même résultat pour le membre de gauche et pour le membre de droite donc ${texteEnCouleurEtGras("l'égalité est vraie")}.`
          rep1 = 3 * x1 - a
          rep2 = 2 * x1 + b
          rep3 = 3 * x2 - a
          rep4 = 3 * x2 - a
          break
        case 2: // 3x+a=5x-b   x=(a+b)/2 donc a et b impairs pour une solution entière
          if (this.sup === 1) {
            a = randint(1, 9)
            b = randint(0, 4) * 2 + (a % 2)
            x1 = (a + b) / 2
            x2 = randint(1, 9, x1)
          } else {
            a = randint(-9, 9, [0])
            b = randint(-4, 4, [a, 0]) * 2 + (a % 2)
            x1 = (a + b) / 2
            x2 = randint(-9, 9, [0, x1])
          }
          expression = `$${sp(2)}3x+${ecritureParentheseSiNegatif(a)}=5x-${ecritureParentheseSiNegatif(b)}${sp(1)}$`
          texteCorr = `Pour $x=${x1}$ : <br>`
          texteCorr += `D'une part, $3x+${ecritureParentheseSiNegatif(a)}=3\\times ${ecritureParentheseSiNegatif(x1)}+${ecritureParentheseSiNegatif(a)}=${miseEnEvidence(3 * x1 + a)}$. <br>D'autre part, $5x-${ecritureParentheseSiNegatif(b)}=5\\times ${ecritureParentheseSiNegatif(x1)}-${ecritureParentheseSiNegatif(b)}=${miseEnEvidence(5 * x1 - b)}$.<br>`
          texteCorr += `On trouve le même résultat pour le membre de gauche et pour le membre de droite donc ${texteEnCouleurEtGras("l'égalité est vraie")}.<br><br>`
          texteCorr += `Pour $x=${x2}$ : <br>`
          texteCorr += `D'une part, $3x+${ecritureParentheseSiNegatif(a)}=3\\times ${ecritureParentheseSiNegatif(x2)}+${ecritureParentheseSiNegatif(a)}=${miseEnEvidence(3 * x2 + a)}$. <br>D'autre part, $5x-${ecritureParentheseSiNegatif(b)}=5\\times ${ecritureParentheseSiNegatif(x2)}-${ecritureParentheseSiNegatif(b)}=${miseEnEvidence(5 * x2 - b)}$.<br>`
          texteCorr += `$${3 * x2 + a}\\not=${5 * x2 - b}$ donc ${texteEnCouleurEtGras("l'égalité n'est pas vraie")}.`
          rep1 = 3 * x1 + a
          rep2 = 5 * x1 - b
          rep3 = 3 * x2 + a
          rep4 = 5 * x2 - b
          break
        case 3: // 10(x-a)=4(2x+b) x=(10a+4b)/2
          if (this.sup === 1) {
            a = randint(1, 3)
            b = randint(1, 3)
            x2 = (10 * a + 4 * b) / 2
            x1 = randint(1, 9, x2)
          } else {
            a = randint(-3, 3, [0])
            b = randint(-3, 3, [0])
            x2 = (10 * a + 4 * b) / 2
            x1 = randint(-9, 9, [0, x2])
          }
          expression = `$${sp(2)}10(x-${ecritureParentheseSiNegatif(a)})=4(2x+${ecritureParentheseSiNegatif(b)})${sp(1)}$`
          texteCorr = `Pour $x=${x1}$ : <br>`
          texteCorr += `D'une part, $10(x-${ecritureParentheseSiNegatif(a)})=10\\times (${ecritureParentheseSiNegatif(x1)}-${ecritureParentheseSiNegatif(a)})=10\\times ${x1 - a}=${miseEnEvidence(10 * (x1 - a))}$. <br>D'autre part, $4(2x+${ecritureParentheseSiNegatif(b)})=4\\times (2\\times ${ecritureParentheseSiNegatif(x1)}+${ecritureParentheseSiNegatif(b)})=4\\times ${2 * x1 + b}=${miseEnEvidence(4 * (2 * x1 + b))}$.<br>`
          texteCorr += `$${10 * (x1 - a)}\\not=${4 * (2 * x1 + b)}$ donc ${texteEnCouleurEtGras("l'égalité n'est pas vraie")}.<br><br>`
          texteCorr += `Pour $x=${x2}$ : <br>`
          texteCorr += `D'une part, $10(x-${ecritureParentheseSiNegatif(a)})=10\\times (${ecritureParentheseSiNegatif(x2)}-${ecritureParentheseSiNegatif(a)})=10\\times ${x2 - a}=${miseEnEvidence(10 * (x2 - a))}$. <br>D'autre part, $4(2x+${ecritureParentheseSiNegatif(b)})=4\\times (2\\times ${ecritureParentheseSiNegatif(x2)}+${ecritureParentheseSiNegatif(b)})=4\\times ${2 * x2 + b}=${miseEnEvidence(4 * (2 * x2 + b))}$.<br>`
          texteCorr += `On trouve le même résultat pour le membre de gauche et pour le membre de droite donc ${texteEnCouleurEtGras("l'égalité est vraie")}.`
          rep1 = 10 * (x1 - a)
          rep2 = 4 * (2 * x1 + b)
          rep3 = 10 * (x2 - a)
          rep4 = 4 * (2 * x2 + b)
          break
        case 4: // ax+b=(a+1)x-c x=b+c
          if (this.sup === 1) {
            a = randint(2, 9)
            b = randint(2, 9)
            c = randint(1, 3)
            x1 = b + c
            x2 = randint(2, 10, x1)
          } else {
            a = randint(2, 9)
            b = randint(2, 9) * randint(-1, 1, 0)
            c = randint(1, 3) * randint(-1, 1, 0)
            x1 = b + c
            x2 = randint(2, 10, x1) * randint(-1, 1, 0)
          }
          expression = `$${sp(2)}${ecritureParentheseSiNegatif(a)}x+${ecritureParentheseSiNegatif(b)}=${a + 1}x-${ecritureParentheseSiNegatif(c)}${sp(1)}$`
          texteCorr = `Pour $x=${x1}$ : <br>`
          texteCorr += `D'une part, $${a}x+${ecritureParentheseSiNegatif(b)}=${ecritureParentheseSiNegatif(a)}\\times ${ecritureParentheseSiNegatif(x1)}+${ecritureParentheseSiNegatif(b)}=${miseEnEvidence(a * x1 + b)}$. <br>D'autre part, $${a + 1}x-${ecritureParentheseSiNegatif(c)}=${a + 1}\\times ${ecritureParentheseSiNegatif(x1)}-${ecritureParentheseSiNegatif(c)}=${miseEnEvidence((a + 1) * x1 - c)}$.<br>`
          texteCorr += `On trouve le même résultat pour le membre de gauche et pour le membre de droite donc ${texteEnCouleurEtGras("l'égalité est vraie")}.<br><br>`
          texteCorr += `Pour $x=${x2}$ : <br>`
          texteCorr += `D'une part, $${a}x+${ecritureParentheseSiNegatif(b)}=${ecritureParentheseSiNegatif(a)}\\times ${ecritureParentheseSiNegatif(x2)}+${ecritureParentheseSiNegatif(b)}=${miseEnEvidence(a * x2 + b)}$. <br>D'autre part, $${a + 1}x-${ecritureParentheseSiNegatif(c)}=${a + 1}\\times ${ecritureParentheseSiNegatif(x2)}-${ecritureParentheseSiNegatif(c)}=${miseEnEvidence((a + 1) * x2 - c)}$.<br>`
          texteCorr += `$${a * x2 + b}\\not=${(a + 1) * x2 - c}$ donc ${texteEnCouleurEtGras("l'égalité n'est pas vraie")}.`
          rep1 = a * x1 + b
          rep2 = (a + 1) * x1 - c
          rep3 = a * x2 + b
          rep4 = (a + 1) * x2 - c
          break
        case 5: // a-2x=b+2x x=(a-b)/4
          if (this.sup === 1) {
            x1 = randint(1, 9)
            b = randint(1, 9)
            a = b + 4 * x1
            x2 = randint(1, 11, x1)
          } else {
            x1 = randint(-9, 9)
            b = randint(-9, 9, 0)
            a = b + 4 * x1
            x2 = randint(1, 11, x1)
          }
          expression = `$${sp(2)}${a}-2x=${b}+2x${sp(1)}$`
          texteCorr = `Pour $x=${x1}$ : <br>`
          texteCorr += `D'une part, $${a}-2x=${a}-2\\times ${ecritureParentheseSiNegatif(x1)}=${miseEnEvidence(a - 2 * x1)}$. <br>D'autre part, $${b}+2x=${b}+2\\times ${ecritureParentheseSiNegatif(x1)}=${miseEnEvidence(b + 2 * x1)}$.<br>`
          texteCorr += `On trouve le même résultat pour le membre de gauche et pour le membre de droite donc ${texteEnCouleurEtGras("l'égalité est vraie")}.<br><br>`
          texteCorr += `Pour $x=${x2}$ : <br>`
          texteCorr += `D'une part, $${a}-2x=${a}-2\\times ${ecritureParentheseSiNegatif(x2)}=${miseEnEvidence(a - 2 * x2)}$. <br>D'autre part, $${b}+2x=${b}+2\\times ${ecritureParentheseSiNegatif(x2)}=${miseEnEvidence(b + 2 * x2)}$.<br>`
          texteCorr += `$${a - 2 * x2}\\not=${b + 2 * x2}$ donc ${texteEnCouleurEtGras("l'égalité n'est pas vraie")}.`
          rep1 = a - 2 * x1
          rep2 = b + 2 * x1
          rep3 = a - 2 * x2
          rep4 = b + 2 * x2
          break
        case 6: // ax-ab=x²-bx (a-x)(x-b)=0 solutions a et b.
          if (this.sup === 1) {
            b = randint(2, 9)
            a = randint(2, 9)
            x3 = b
            x1 = a
            x2 = randint(1, 9, [x1, x3])
          } else {
            a = randint(-9, 9, [0, 1])
            b = randint(-9, 9, [0, a])
            x1 = a
            x3 = b
            x2 = randint(-9, 9, [x1, x3])
          }
          expression = `$${sp(2)}${a}x-${ecritureParentheseSiNegatif(a * b)}=x^2-${ecritureParentheseSiNegatif(b)}x${sp(1)}$`
          texteCorr = `Pour $x=${x1}$ : <br>`
          texteCorr += `D'une part, $${a}x-${ecritureParentheseSiNegatif(a * b)}=${a}\\times ${ecritureParentheseSiNegatif(x1)}-${ecritureParentheseSiNegatif(a * b)}=${miseEnEvidence(a * x1 - a * b)}$. <br>D'autre part, $x^2-${b}\\times x=${ecritureParentheseSiNegatif(x1)}^2-${ecritureParentheseSiNegatif(b)}\\times ${ecritureParentheseSiNegatif(x1)}=${x1 * x1}-${ecritureParentheseSiNegatif(b * x1)}=${miseEnEvidence(x1 * x1 - b * x1)}$.<br>`
          texteCorr += `On trouve le même résultat pour le membre de gauche et pour le membre de droite donc ${texteEnCouleurEtGras("l'égalité est vraie")}.<br><br>`
          texteCorr += `Pour $x=${x2}$ : <br>`
          texteCorr += `D'une part, $${a}x-${ecritureParentheseSiNegatif(a * b)}=${a}\\times ${ecritureParentheseSiNegatif(x2)}-${ecritureParentheseSiNegatif(a * b)}=${miseEnEvidence(a * x2 - a * b)}$. <br>D'autre part, $x^2-${b}\\times x=${ecritureParentheseSiNegatif(x2)}^2-${ecritureParentheseSiNegatif(b)}\\times ${ecritureParentheseSiNegatif(x2)}=${x2 * x2}-${ecritureParentheseSiNegatif(b * x2)}=${miseEnEvidence(x2 * x2 - b * x2)}$.<br>`
          texteCorr += `$${a * x2 - a * b}\\not=${x2 * x2 - b * x2}$ donc ${texteEnCouleurEtGras("l'égalité n'est pas vraie")}.<br><br>`
          rep1 = a * x1 - a * b
          rep2 = x1 * x1 - b * x1
          rep3 = a * x2 - a * b
          rep4 = x2 * x2 - b * x2
          /*  texteCorr += `Pour $x=${x3}$ : <br>`
          texteCorr += `$${a}x-${ecritureParentheseSiNegatif(a * b)}=${a}\\times ${ecritureParentheseSiNegatif(x3)}-${ecritureParentheseSiNegatif(a * b)}=${a * x3 - a * b}$. <br>D'autre part, $x^2-${b}\\times  x=${ecritureParentheseSiNegatif(x3)}^2-${ecritureParentheseSiNegatif(b)}\\times ${ecritureParentheseSiNegatif(x3)}=${x3 * x3}-${ecritureParentheseSiNegatif(b * x3)}=${x3 * x3 - b * x3}$<br>`
          texteCorr += 'On trouve le même résultat pour le membre de gauche et pour le membre de droite donc ${texteEnCouleurEtGras('l\'égalité est vraie')}.<br><br>'
          */
          break
        case 7: // adx-bd=acx²-bcx  --- (ax-b)(d-cx)=0 solutions b/a et d/c.
        default:
          if (this.sup === 1) {
            c = randint(2, 5)
            a = randint(2, 5)
            x2 = randint(2, 6)
            x3 = randint(2, 6, x2)
            x1 = randint(1, 7, [x2, x3])
            b = a * x2
            d = c * x3
          } else {
            c = randint(2, 5) * randint(-1, 1, 0)
            a = randint(2, 5) * randint(-1, 1, 0)
            x2 = randint(1, 6) * randint(-1, 1, 0)
            x3 = randint(1, 6, x2) * randint(-1, 1, 0)
            x1 = randint(1, 7, [x2, x3]) * randint(-1, 1, 0)
            b = a * x2
            d = c * x3
          }
          expression = `$${sp(2)}${a * d}x-${ecritureParentheseSiNegatif(b * d)}=${a * c}x^2-${ecritureParentheseSiNegatif(b * c)}x${sp(1)}$`
          texteCorr = `Pour $x=${x1}$ : <br>`
          texteCorr += `D'une part, $${a * d}x-${ecritureParentheseSiNegatif(b * d)}=${a * d}\\times ${ecritureParentheseSiNegatif(x1)}-${ecritureParentheseSiNegatif(b * d)}=${miseEnEvidence(a * d * x1 - d * b)}$. <br>D'autre part, $${a * c}x^2-${ecritureParentheseSiNegatif(b * c)}x=${a * c}\\times ${ecritureParentheseSiNegatif(x1)}^2-${ecritureParentheseSiNegatif(b * c)}\\times ${ecritureParentheseSiNegatif(x1)}=${a * c * x1 * x1}-${ecritureParentheseSiNegatif(b * c * x1)}=${miseEnEvidence(a * c * x1 * x1 - b * c * x1)}$.<br>`
          texteCorr += `$${a * d * x1 - d * b}\\not=${a * c * x1 * x1 - b * c * x1}$ donc ${texteEnCouleurEtGras("l'égalité n'est pas vraie")}.<br><br>`
          texteCorr += `Pour $x=${x2}$ : <br>`
          texteCorr += `D'une part, $${a * d}x-${ecritureParentheseSiNegatif(b * d)}=${a * d}\\times ${ecritureParentheseSiNegatif(x2)}-${ecritureParentheseSiNegatif(b * d)}=${miseEnEvidence(a * d * x2 - d * b)}$. <br>D'autre part, $${a * c}x^2-${ecritureParentheseSiNegatif(b * c)}x=${a * c}\\times ${ecritureParentheseSiNegatif(x2)}^2-${ecritureParentheseSiNegatif(b * c)}\\times ${ecritureParentheseSiNegatif(x2)}=${a * c * x2 * x2}-${ecritureParentheseSiNegatif(b * c * x2)}=${miseEnEvidence(a * c * x2 * x2 - b * c * x2)}$.<br>`
          texteCorr += `On trouve le même résultat pour le membre de gauche et pour le membre de droite donc ${texteEnCouleurEtGras("l'égalité est vraie")}.<br><br>`
          rep1 = a * d * x1 - d * b
          rep2 = a * c * x1 * x1 - b * c * x1
          rep3 = a * d * x2 - d * b
          rep4 = a * c * x2 * x2 - b * c * x2
          /*
          texteCorr += `Pour $x=${x3}$ : <br>`
          texteCorr += `$${a * d}x-${ecritureParentheseSiNegatif(b * d)}=${a * d}\\times ${ecritureParentheseSiNegatif(x3)}-${ecritureParentheseSiNegatif(b * d)}=${a * d * x3 - d * b}$. <br>D'autre part, $${a * c}x^2-${ecritureParentheseSiNegatif(b * c)}x=${a * c}\\times ${ecritureParentheseSiNegatif(x3)}^2-${ecritureParentheseSiNegatif(b * c)}\\times ${ecritureParentheseSiNegatif(x3)}=${a * c * x3 * x3}-${ecritureParentheseSiNegatif(b * c * x3)}=${a * c * x3 * x3 - b * c * x3}$<br>`
          texteCorr += 'On trouve le même résultat pour le membre de gauche et pour le membre de droite donc ${texteEnCouleurEtGras('l\'égalité est vraie')}.<br><br>'
          */
          break
      }

      texte = `Tester l'égalité ${expression} pour $${sp(1)}x=${x1}${sp(1)}$ puis pour $${sp(1)}x=${x2}$.`
      if (this.interactif && !context.isAmc) {
        handleAnswers(
          this,
          6 * i,
          { reponse: { value: rep1 } },
          { formatInteractif: 'mathlive' },
        )
        handleAnswers(
          this,
          6 * i + 1,
          { reponse: { value: rep2 } },
          { formatInteractif: 'mathlive' },
        )
        handleAnswers(
          this,
          6 * i + 2,
          {
            reponse: {
              value:
                rep1 === rep2 ? ['Oui', 'oui', 'OUI'] : ['Non', 'non', 'NON'],
              options: { texteAvecCasse: true },
            },
          },
          { formatInteractif: 'mathlive' },
        )
        handleAnswers(
          this,
          6 * i + 3,
          { reponse: { value: rep3 } },
          { formatInteractif: 'mathlive' },
        )
        handleAnswers(
          this,
          6 * i + 4,
          { reponse: { value: rep4 } },
          { formatInteractif: 'mathlive' },
        )
        handleAnswers(
          this,
          6 * i + 5,
          {
            reponse: {
              value:
                rep3 === rep4 ? ['Oui', 'oui', 'OUI'] : ['Non', 'non', 'NON'],
              options: { texteAvecCasse: true },
            },
          },
          { formatInteractif: 'mathlive' },
        )
        texte +=
          `<br> ${sp(10)}Pour $x=${x1}$, d'une part, ${sp(5)} ${expression.split('=')[0]}$ = ` +
          ajouteChampTexteMathLive(this, 6 * i, KeyboardType.clavierDeBase)
        texte +=
          `<br> ${sp(10)}Pour $x=${x1}$, d'autre part, ${sp(6)} $${expression.split('=')[1]} = ` +
          ajouteChampTexteMathLive(
            this,
            6 * i + 1,
            KeyboardType.clavierDeBaseAvecX,
          )
        texte +=
          `<br> Conclure : l'égalité ${expression} est-elle vérifiée pour $${sp(1)}x=${x1}${sp(1)}$ ? (Oui/Non) ` +
          ajouteChampTexteMathLive(this, 6 * i + 2, KeyboardType.vFON)
        texte +=
          `<br><br> ${sp(10)}Pour $x=${x2}$, d'une part, ${sp(5)} ${expression.split('=')[0]}$ = ` +
          ajouteChampTexteMathLive(
            this,
            6 * i + 3,
            KeyboardType.clavierDeBaseAvecX,
          )
        texte +=
          `<br> ${sp(10)}Pour $x=${x2}$, d'autre part, ${sp(6)} $${expression.split('=')[1]} = ` +
          ajouteChampTexteMathLive(
            this,
            6 * i + 4,
            KeyboardType.clavierDeBaseAvecX,
          )
        texte +=
          `<br> Conclure : l'égalité ${expression} est-elle vérifiée pour $${sp(1)}x=${x2}${sp(1)}$ ? (Oui/Non)  ` +
          ajouteChampTexteMathLive(this, 6 * i + 5, KeyboardType.vFON)
      }

      if (context.isAmc) {
        if (this.sup3 === 1) {
          this.autoCorrectionAMC[i] = {
            enonce: '',
            enonceAvant: false,
            enonceAvantUneFois: true,
            options: { numerotationEnonce: true },
            propositions: [
              {
                type: 'AMCOpen',
                propositions: [
                  {
                    texte: ' ',
                    numQuestionVisible: false,
                    statut: 3, // (ici c'est le nombre de lignes du cadre pour la réponse de l'élève sur AMC)
                    feedback: '',
                    enonce: `Tester l'égalité ${expression} pour $${sp(1)}x=${x1}$.`, // EE : ce champ est facultatif et fonctionnel qu'en mode hybride (en mode normal, il n'y a pas d'intérêt)
                    sanscadre: false, // EE : ce champ est facultatif et permet (si true) de cacher le cadre et les lignes acceptant la réponse de l'élève
                  },
                ],
              },
              {
                type: 'AMCOpen',
                propositions: [
                  {
                    texte: ' ',
                    numQuestionVisible: false,
                    statut: 3, // (ici c'est le nombre de lignes du cadre pour la réponse de l'élève sur AMC)
                    feedback: '',
                    enonce: `Tester l'égalité ${expression} pour $${sp(1)}x=${x2}$.`, // EE : ce champ est facultatif et fonctionnel qu'en mode hybride (en mode normal, il n'y a pas d'intérêt)
                    sanscadre: false, // EE : ce champ est facultatif et permet (si true) de cacher le cadre et les lignes acceptant la réponse de l'élève
                  },
                ],
              },
            ],
          }
          this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        } else {
          this.autoCorrectionAMC.push({
            enonce: texte,
            enonceAvant: false,
            enonceApresNumQuestion: true,
            options: { barreseparation: false },
            propositions: [
              {
                type: 'AMCNum',
                propositions: [
                  {
                    texte: '',
                    statut: '',
                    multicolsBegin: true,
                    reponse: {
                      texte: `Pour $x=${x1}$, que vaut ${expression.split('=')[0]}$ ?`,
                      valeur: rep1,
                      param: {
                        digits: Math.max(
                          nombreDeChiffresDansLaPartieEntiere(rep1, rep2),
                        ),
                        decimals: 0,
                        signe: true,
                        approx: 0,
                      },
                    },
                  },
                ],
              },
              {
                type: 'AMCNum',
                propositions: [
                  {
                    texte: '',
                    statut: '',
                    multicolsEnd: true,
                    reponse: {
                      texte: `Pour $x=${x1}$, que vaut $${expression.split('=')[1]} ?`,
                      valeur: rep2,
                      param: {
                        digits: Math.max(
                          nombreDeChiffresDansLaPartieEntiere(rep1, rep2),
                        ),
                        decimals: 0,
                        signe: true,
                        approx: 0,
                      },
                    },
                  },
                ],
              },
              {
                type: 'qcmMono',
                enonce: `Conclusion : l'égalité ${expression} est-elle vérifiée pour $x=${x1}$ ?`,
                propositions: [
                  {
                    texte: 'Oui',
                    statut: rep1 === rep2,
                  },
                  {
                    texte: 'Non',
                    statut: rep1 !== rep2,
                  },
                ],
              },
              {
                type: 'AMCNum',
                propositions: [
                  {
                    texte: '',
                    statut: '',
                    multicolsBegin: true,
                    reponse: {
                      texte: `Pour $x=${x2}$, que vaut ${expression.split('=')[0]}$ ?`,
                      valeur: rep3,
                      param: {
                        digits: Math.max(
                          nombreDeChiffresDansLaPartieEntiere(rep3, rep4),
                        ),
                        decimals: 0,
                        signe: true,
                        approx: 0,
                      },
                    },
                  },
                ],
              },
              {
                type: 'AMCNum',
                propositions: [
                  {
                    texte: '',
                    statut: '',
                    multicolsEnd: true,
                    reponse: {
                      texte: `Pour $x=${x2}$, que vaut $${expression.split('=')[1]} ?`,
                      valeur: rep4,
                      param: {
                        digits: Math.max(
                          nombreDeChiffresDansLaPartieEntiere(rep3, rep4),
                        ),
                        decimals: 0,
                        signe: true,
                        approx: 0,
                      },
                    },
                  },
                ],
              },
              {
                type: 'qcmMono',
                enonce: `Conclusion : l'égalité ${expression} est-elle vérifiée pour $x=${x2}$ ?`,
                propositions: [
                  {
                    texte: 'Oui',
                    statut: rep3 === rep4,
                  },
                  {
                    texte: 'Non',
                    statut: rep3 !== rep4,
                  },
                ],
              },
            ],
          })
        }
      }
      if (this.questionJamaisPosee(i, texte)) {
        // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
