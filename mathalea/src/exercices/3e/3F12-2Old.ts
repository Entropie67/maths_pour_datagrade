import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { texFractionReduite } from '../../lib/outils/deprecatedFractions'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'
import { lettreMinusculeDepuisChiffre } from '../../lib/outils/outilString'
import { fraction } from '../../modules/fractions'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const dateDeModifImportante = '23/01/2025'

export const titre =
  "Déterminer l'image d'un nombre par une fonction d'après sa forme algébrique"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * Déterminer l'image d'un nombre par une fonction d'après sa forme algébrique
 *
 * * Niveau 1 : Fonctions affines
 * * Niveau 2 : Polynôme du second degré
 * * Niveau 3 : Quotients de fonctions affines
 * * Niveau 4 : (ax+b)(cx+d)
 * * Niveau 5 : Mélange
 * @author Rémi Angot
 * Ajout du choix du type de question par Guillaume Valmont le 23/01/2025
 * 3F12-2
 */
export const uuid = '082d7'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class ImageFonctionAlgebrique extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 5

    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      5,
      '1 : Fonctions affines\n2 : Polynôme du second degré\n3 : Quotient\n4 : Produit \n5 : Mélange',
    ]
    this.sup = 5

    this.besoinFormulaire2Texte = [
      'Types de questions',
      [
        'Nombres séparés par des tirets  :',
        '1 : Calculer f(x)',
        "2 : Calculer l'image de x par la fonction f",
      ].join('\n'),
    ]
    this.sup2 = '1'
  }

  nouvelleVersion() {
    let situationsDisponibles: string[] = []
    if (this.sup === 1) {
      situationsDisponibles = ['ax+b', 'ax-b', '-ax+b', '-ax-b']
    }
    if (this.sup === 2) {
      situationsDisponibles = [
        'ax2+bx+c',
        'ax2+c',
        'ax2+bx',
        '-ax2+bx-c',
        '-ax2-bx-c',
        '-ax2-bx+c',
        '-ax2-bx',
      ]
    }
    if (this.sup === 3) {
      situationsDisponibles = ['a/cx+d', 'ax+b/cx+d']
    }
    if (this.sup === 4) {
      situationsDisponibles = ['(ax+b)(cx+d)', '(ax+b)2']
    }
    if (this.sup === 5) {
      situationsDisponibles = [
        'ax+b',
        'ax-b',
        '-ax+b',
        'ax2+bx+c',
        '-ax2+bx-c',
        '-ax2-bx',
        'a/cx+d',
        'ax+b/cx+d',
        '(ax+b)(cx+d)',
        '(ax+b)2',
      ]
    }
    const listeSituations = combinaisonListes(
      situationsDisponibles,
      this.nbQuestions,
    )
    const signesDeX = combinaisonListes([true, false], this.nbQuestions)

    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: 2,
      melange: 3,
      defaut: 3,
      nbQuestions: this.nbQuestions,
    })
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (
      let i = 0, texte, texteCorr, a, b, c, d, expression, nomdef, x, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      texteCorr = ''
      x = randint(1, 12)
      if (signesDeX[i]) {
        x = -1 * x
      }
      a = randint(2, 11)
      b = randint(2, 11)
      c = randint(2, 11)
      nomdef = lettreMinusculeDepuisChiffre(6 + i) // on commence par f puis on continue dans l'ordre alphabétique
      switch (listeSituations[i]) {
        case 'ax+b':
          expression = `${a}x+${b}`
          texteCorr = `$${nomdef}(${x})=${a}\\times ${ecritureParentheseSiNegatif(x)}+${b}=${a * x}+${b}=${a * x + b}$`
          handleAnswers(
            this,
            i,
            { reponse: { value: a * x + b } },
            { formatInteractif: 'mathlive' },
          )
          break
        case 'ax-b':
          expression = `${a}x-${b}`
          texteCorr = `$${nomdef}(${x})=${a}\\times ${ecritureParentheseSiNegatif(x)}-${b}=${a * x}-${b}=${a * x - b}$`
          handleAnswers(
            this,
            i,
            { reponse: { value: a * x - b } },
            { formatInteractif: 'mathlive' },
          )
          break
        case '-ax+b':
          expression = `-${a}x+${b}`
          texteCorr = `$${nomdef}(${x})=-${a}\\times ${ecritureParentheseSiNegatif(x)}+${b}=${-1 * a * x}+${b}=${-1 * a * x + b}$`
          handleAnswers(
            this,
            i,
            { reponse: { value: -1 * a * x + b } },
            { formatInteractif: 'mathlive' },
          )
          break
        case '-ax-b':
          expression = `-${a}x-${b}`
          texteCorr = `$${nomdef}(${x})=-${a}\\times ${ecritureParentheseSiNegatif(x)}-${b}=${-1 * a * x}-${b}=${-1 * a * x - b}$`
          handleAnswers(
            this,
            i,
            { reponse: { value: -1 * a * x - b } },
            { formatInteractif: 'mathlive' },
          )
          break
        case 'ax2+bx+c':
          expression = `${a}x^2+${b}x+${c}`
          texteCorr = `$${nomdef}(${x})=${a}\\times ${ecritureParentheseSiNegatif(x)}^2+${b}\\times ${ecritureParentheseSiNegatif(x)}+${c}=${a}\\times${x * x}${ecritureAlgebrique(b * x)}+${c}=${a * x * x}${ecritureAlgebrique(b * x)}+${c}=${a * x * x + b * x + c}$`
          handleAnswers(
            this,
            i,
            { reponse: { value: a * x * x + b * x + c } },
            { formatInteractif: 'mathlive' },
          )
          break
        case 'ax2+c':
          expression = `${a}x^2+${c}`
          texteCorr = `$${nomdef}(${x})=${a}\\times ${ecritureParentheseSiNegatif(x)}^2+${c}=${a}\\times${x * x}+${c}=${a * x * x}+${c}=${a * x * x + c}$`
          handleAnswers(
            this,
            i,
            { reponse: { value: a * x * x + c } },
            { formatInteractif: 'mathlive' },
          )
          break
        case 'ax2+bx':
          expression = `${a}x^2+${b}x`
          texteCorr = `$${nomdef}(${x})=${a}\\times ${ecritureParentheseSiNegatif(x)}^2+${b}\\times ${ecritureParentheseSiNegatif(x)}=${a}\\times${x * x}${ecritureAlgebrique(b * x)}=${a * x * x}${ecritureAlgebrique(b * x)}=${a * x * x + b * x}$`
          handleAnswers(
            this,
            i,
            { reponse: { value: a * x * x + b * x } },
            { formatInteractif: 'mathlive' },
          )
          break
        case '-ax2+bx-c':
          expression = `-${a}x^2+${b}x-${c}`
          texteCorr = `$${nomdef}(${x})=-${a}\\times ${ecritureParentheseSiNegatif(x)}^2+${b}\\times ${ecritureParentheseSiNegatif(x)}-${c}=-${a}\\times${x * x}${ecritureAlgebrique(b * x)}-${c}=${-1 * a * x * x}${ecritureAlgebrique(b * x)}-${c}=${-1 * a * x * x + b * x - c}$`
          handleAnswers(
            this,
            i,
            { reponse: { value: -1 * a * x * x + b * x - c } },
            { formatInteractif: 'mathlive' },
          )
          break
        case '-ax2-bx-c':
          expression = `-${a}x^2-${b}x-${c}`
          texteCorr = `$${nomdef}(${x})=-${a}\\times ${ecritureParentheseSiNegatif(x)}^2-${b}\\times ${ecritureParentheseSiNegatif(x)}-${c}=-${a}\\times${x * x}${ecritureAlgebrique(-1 * b * x)}-${c}=${-1 * a * x * x}${ecritureAlgebrique(-1 * b * x)}-${c}=${-1 * a * x * x - b * x - c}$`
          handleAnswers(
            this,
            i,
            { reponse: { value: -1 * a * x * x - b * x - c } },
            { formatInteractif: 'mathlive' },
          )
          break
        case '-ax2-bx+c':
          expression = `-${a}x^2-${b}x+${c}`
          texteCorr = `$${nomdef}(${x})=-${a}\\times ${ecritureParentheseSiNegatif(x)}^2-${b}\\times ${ecritureParentheseSiNegatif(x)}+${c}=-${a}\\times${x * x}${ecritureAlgebrique(-1 * b * x)}+${c}=${-1 * a * x * x}${ecritureAlgebrique(-1 * b * x)}+${c}=${-1 * a * x * x - b * x + c}$`
          handleAnswers(
            this,
            i,
            { reponse: { value: -1 * a * x * x - b * x + c } },
            { formatInteractif: 'mathlive' },
          )
          break
        case '-ax2-bx':
          expression = `-${a}x^2-${b}x`
          texteCorr = `$${nomdef}(${x})=-${a}\\times ${ecritureParentheseSiNegatif(x)}^2-${b}\\times ${ecritureParentheseSiNegatif(x)}=-${a}\\times${x * x}${ecritureAlgebrique(-1 * b * x)}=${-1 * a * x * x}${ecritureAlgebrique(-1 * b * x)}=${-1 * a * x * x - b * x}$`
          handleAnswers(
            this,
            i,
            { reponse: { value: -1 * a * x * x - b * x } },
            { formatInteractif: 'mathlive' },
          )
          break
        case 'a/cx+d':
          d = randint(1, 11)
          while (c * x + d === 0) {
            c = randint(2, 11)
          }
          expression = `\\dfrac{${a}}{${c}x+${d}}`
          texteCorr = `$${nomdef}(${x})=\\dfrac{${a}}{${c}\\times${ecritureParentheseSiNegatif(x)}+${d}}=\\dfrac{${a}}{${c * x}+${d}}=\\dfrac{${a}}{${c * x + d}}=${texFractionReduite(a, c * x + d)}$`
          handleAnswers(
            this,
            i,
            { reponse: { value: fraction(a, c * x + d) } },
            { formatInteractif: 'mathlive' },
          )
          break
        case 'ax+b/cx+d':
          d = randint(1, 11)
          while (c * x + d === 0) {
            c = randint(2, 11)
          }
          while (a * x + b === 0) {
            a = randint(2, 11)
          }
          expression = `\\dfrac{${a}x+${b}}{${c}x+${d}}`
          texteCorr = `$${nomdef}(${x})=\\dfrac{${a}\\times${ecritureParentheseSiNegatif(x)}+${b}}{${c}\\times${ecritureParentheseSiNegatif(x)}+${d}}=\\dfrac{${a * x}+${b}}{${c * x}+${d}}=\\dfrac{${a * x + b}}{${c * x + d}}=${texFractionReduite(a * x + b, c * x + d)}$`
          handleAnswers(
            this,
            i,
            { reponse: { value: fraction(a * x + b, c * x + d) } },
            { formatInteractif: 'mathlive' },
          )
          break
        case '(ax+b)(cx+d)':
          a = randint(-4, 4, [0, 1, -1])
          b = randint(-4, 4, [0])
          c = randint(-4, 4, [0, 1, -1])
          d = randint(-4, 4, [0])
          x = randint(-2, 2, [0])

          expression = `(${a}x${ecritureAlgebrique(b)})(${c}x${ecritureAlgebrique(d)})`
          texteCorr = `$${nomdef}(${x})=\\left(${a}\\times${ecritureParentheseSiNegatif(x)}${ecritureAlgebrique(b)}\\right)\\left(${c}\\times${ecritureParentheseSiNegatif(x)}${ecritureAlgebrique(d)}\\right)=(${a * x}${ecritureAlgebrique(b)})(${c * x}${ecritureAlgebrique(d)})=${a * x + b}\\times${ecritureParentheseSiNegatif(c * x + d)}=${(a * x + b) * (c * x + d)}$`
          handleAnswers(
            this,
            i,
            { reponse: { value: (a * x + b) * (c * x + d) } },
            { formatInteractif: 'mathlive' },
          )
          break
        case '(ax+b)2':
          a = randint(-4, 4, [0, -1, 1])
          b = randint(-4, 4, [0])
          c = randint(-4, 4, [0, -1, 1])
          d = randint(-4, 4, [0])
          x = randint(-2, 2, [0])

          expression = `(${a}x${ecritureAlgebrique(b)})^2`
          texteCorr = `$${nomdef}(${x})=\\left(${a}\\times${ecritureParentheseSiNegatif(x)}${ecritureAlgebrique(b)}\\right)^2=(${a * x}${ecritureAlgebrique(b)})^2=${ecritureParentheseSiNegatif(a * x + b)}^2=${(a * x + b) * (a * x + b)}$`
          handleAnswers(
            this,
            i,
            { reponse: { value: (a * x + b) * (a * x + b) } },
            { formatInteractif: 'mathlive' },
          )
          break
      }

      texte = `On considère la fonction $${nomdef}$ définie par $${nomdef}:x\\mapsto ${expression}$. `
      if (listeTypeDeQuestions[i] === 1) {
        texte += `Calculer $${nomdef}(${x})$.`
      } else {
        texte += `Calculer l'image de ${x} par la fonction $${nomdef}$.`
      }
      texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBaseAvecFraction)

      if (this.listeQuestions.indexOf(texte) === -1) {
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
