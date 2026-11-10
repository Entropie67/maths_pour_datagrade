import { createList } from '../../lib/format/lists'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence, texteGras } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Trinome from '../../modules/Trinome'
import Exercice from '../Exercice'
export const titre = 'Calculer un nombre dérivé à partir de la définition'

export const interactifReady = true

export const dateDePublication = '16/12/2021'
export const dateDeModifImportante = '29/11/2025'

/*
 * @author Gilles Mora
 * Calculer un taux de variation. chgt de titre Stéphane Guyon (retravaillé par Gilles Mora)
 * Passage en typescript le 06/02/2025 + ajout des miseEnEvidence + interactivité Jean-claude Lhote
 */

export const uuid = '29202'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

export default class TauxVariationOld extends Exercice {
  constructor() {
    super()
    this.correctionDetaillee = false
    this.correctionDetailleeDisponible = true
    this.spacingCorr = 1.5
    this.besoinFormulaireTexte = [
      'Type de fonctions',
      [
        'Nombres séparés par des tirets :',
        '1 : Fonction affine',
        '2 : Fonction carré',
        '3 : Fonction inverse',
        '4 : Fonction racine carrée',
        '5 : Fonction $x^2+bx+c$',
        '6 : Fonction $ax^2+bx+c$ avec $a \\neq 1$',
        '7 : Fonction  $\\dfrac{a}{x}$',
        '8 : Fonction  $\\dfrac{a}{x+b}$',
        '9 : Mélange',
      ].join('\n'),
    ]

    this.nbQuestions = 1 // Nombre de questions par défaut

    this.sup = '9'
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 8,
      melange: 9,
      defaut: 9,
      nbQuestions: this.nbQuestions,
    })
    const listeTypeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posés mais l'ordre diffère à chaque "cycle"

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      // Boucle principale où i+1 correspond au numéro de la question
      let a: number, b: number, c: number, m: number, p: number
      let texte = ''
      let texteCorr = ''
      let reponse1: string
      let reponse2: string
      const typeDeQuestion = listeTypeQuestions[i]

      if (typeDeQuestion === 4) {
        a = randint(1, 10) // Pour la racine carrée, a doit être positif
      } else if (typeDeQuestion === 5 || typeDeQuestion === 6) {
        a = randint(-2, 3, [0]) // Pour le polynôme du second degré
      } else if (typeDeQuestion === 8) {
        // Pour la fonction homographique, a sera défini après coefDenom pour éviter la valeur interdite
        a = 0 // valeur temporaire
      } else {
        a = randint(-5, 8, [0])
      }
      const Q1 = `Calculer le taux de variation $t(h)$ de $f$ entre $${a}$ et $${a}+h$, où $h$ est un réel non nul.`
      const Q2 = `En déduire que $f$ est dérivable en $${a}$ et déterminer $f'(${a})$.`
      const IntroCorrection = `Pour déterminer le taux de variation de $f$ entre $${a}$ et $${a}+h$, on applique la définition (avec $h\\neq 0$) :<br>`
      const Conclusion =
        'Comme la limite existe et est finie, on peut en conclure que $f$ est dérivable en '
      // Textes communs pour la correction détaillée
      const texteDef = `\\text{Définition du taux de variation}`
      const texteDev = `\\text{Développement au numérateur}`
      const texteSimp = `\\text{Simplification au numérateur}`
      const texteRed = `\\text{Réduction au numérateur}`
      const texteFact = `\\text{Factorisation par } h \\text{ au numérateur}`
      const texteSimpH = `\\text{Simplification par } h`
      let texteApp = '' // Texte spécifique à chaque cas

      switch (
        typeDeQuestion // Suivant le type de question, le contenu sera différent
      ) {
        case 1: // affine
          m = randint(-5, 5, [0]) // coeff dir de ax+b
          p = randint(-5, 5, [0])

          // Texte spécifique pour la correction détaillée
          texteApp = `\\text{Application à la fonction } f(x)=${reduireAxPlusB(m, p)}`

          texte = `Soit $f$ la fonction définie pour tout $x$ de $\\mathbb{R}$ par $f(x)=${reduireAxPlusB(m, p)} $.<br>`
          texte += createList({
            items: [Q1, Q2],
            style: 'nombres',
          })
          texteCorr = createList({
            items: [
              IntroCorrection +
                `
$\\begin{aligned}t(h) &= \\dfrac{f(${a}+h)-f(${a})}{h}${this.correctionDetaillee ? `&${texteDef}` : ``}\\\\
&= \\dfrac{${m}(${a}+h)${ecritureAlgebrique(p)}-${ecritureParentheseSiNegatif(m)}\\times ${ecritureParentheseSiNegatif(a)}${ecritureAlgebrique(-p)}}{h}${this.correctionDetaillee ? `&${texteApp}` : ``}  \\\\
&= \\dfrac{${ecritureParentheseSiNegatif(a * m)}${ecritureAlgebriqueSauf1(m)} h ${ecritureAlgebrique(p)}-${ecritureParentheseSiNegatif(a * m)} ${ecritureAlgebriqueSauf1(-p)}}{h}${this.correctionDetaillee ? `&${texteDev} ` : ``} \\\\
&= \\dfrac{${rienSi1(m)} h } {h}${this.correctionDetaillee ? ` &${texteRed}` : ``}  \\\\
&= ${miseEnEvidence(m)} ${this.correctionDetaillee ? `&${texteSimpH}` : ``}  \\\\
\\end{aligned}$`,
              `
On calcule la limite du taux de variation quand $h$ tend vers $0$.<br>
$\\lim\\limits_{h \\rightarrow 0} ${m}=${m}$<br>
` +
                Conclusion +
                ` $${a}$ et donc $f'(${a})=${miseEnEvidence(m)}$.<br>${
                  this.correctionDetaillee
                    ? `${texteGras('Remarque : ')}Le taux de variations de $f$ est une constante qui ne dépend pas de $h$.<br>
Ce résultat était prévisible puisque la représentation graphique d'une fonction affine est une droite.<br>
La pente entre deux points de la droite est donc toujours égale au coefficient directeur de la fonction affine, ici ${m}.<br>`
                    : ``
                }`,
            ],
            style: 'nombres',
          })
          reponse1 = m.toString()
          reponse2 = m.toString()
          break
        case 2: // 'carre':
          // Texte spécifique pour la correction détaillée
          texteApp = `\\text{Application à la fonction carré}`

          texte =
            'Soit $f$ la fonction définie pour tout $x$ de $\\mathbb{R}$ par $f(x)=x^2$.<br>'
          texte += createList({
            items: [Q1, Q2],
            style: 'nombres',
          })
          texteCorr = createList({
            items: [
              IntroCorrection +
                `
$\\begin{aligned}t(h) &= \\dfrac{f(${a}+h)-f(${a})}{h}${this.correctionDetaillee ? `&${texteDef}` : ``}\\\\
&= \\dfrac{(${a}+h)^2-(${a})^2}{h}${this.correctionDetaillee ? `&${texteApp}` : ``}\\\\
&= \\dfrac{${ecritureParentheseSiNegatif(a)}^2+2\\times${ecritureParentheseSiNegatif(a)}\\times h+h^2-${ecritureParentheseSiNegatif(a)}^2}{h}${this.correctionDetaillee ? `&\\text{Développement de l'identité remarquable}` : ``}\\\\
&= \\dfrac{${a * a}${ecritureAlgebrique(2 * a)} h+h^2-${a * a}}{h}${this.correctionDetaillee ? `&${texteSimp}` : ``}\\\\
&= \\dfrac{${2 * a} h+h^2}{h}${this.correctionDetaillee ? `&${texteRed}` : ``}\\\\
&= \\dfrac{h(${2 * a}+h)}{h}${this.correctionDetaillee ? `&${texteFact}` : ``}\\\\
&=${miseEnEvidence(`${2 * a} +h`)}${this.correctionDetaillee ? `&${texteSimpH}` : ``}\\\\
\\end{aligned}$`,
              `On calcule la limite du taux de variation quand $h$ tend vers $0$.<br>
$\\lim\\limits_{h \\rightarrow 0} ${2 * a} +h=${2 * a}$ <br>` +
                Conclusion +
                ` $${a}$ et donc $f'(${a})=${miseEnEvidence(2 * a)}$.`,
            ],
            style: 'nombres',
          })
          reponse1 = String(2 * a) + '+h'
          reponse2 = String(2 * a)
          break
        case 3: // 'inverse':
          // Texte spécifique pour la correction détaillée
          texteApp = `\\text{Application à la fonction inverse}`

          texte =
            'Soit $f$ la fonction définie pour tout $x$ de $\\mathbb{R}^{*}$ par $f(x)=\\dfrac{1}{x}$.<br>'
          texte += createList({
            items: [Q1, Q2],
            style: 'nombres',
          })
          texteCorr = createList({
            items: [
              IntroCorrection +
                `
$\\begin{aligned}t(h) &= \\dfrac{f(${a}+h)-f(${a})}{h}${this.correctionDetaillee ? `&${texteDef}` : ``}\\\\
&= \\dfrac{\\dfrac{1}{${a}+h}-\\dfrac{1}{${a}}}{h}${this.correctionDetaillee ? `&${texteApp}` : ``}\\\\
&= \\dfrac{\\dfrac{${a}}{(${a}+h)\\times ${ecritureParentheseSiNegatif(a)}}-\\dfrac{${a}+h}{${a}\\times (${a}+h)}}{h}${this.correctionDetaillee ? `&\\text{Mise au même dénominateur}` : ``}\\\\
&= \\dfrac{\\dfrac{${a}${ecritureAlgebriqueSauf1(-a)}-h}{(${a}+h)\\times ${ecritureParentheseSiNegatif(a)}}}{h}${this.correctionDetaillee ? `&${texteRed}` : ``}\\\\
&= \\dfrac{-h}{(${a}+h)\\times ${ecritureParentheseSiNegatif(a)}}\\times \\dfrac{1}{h}${this.correctionDetaillee ? `&\\text{Diviser par } h\\text{, c'est multiplier par }\\dfrac{1}{h}` : ``}\\\\
&= ${miseEnEvidence(`\\dfrac{-1}{(${a}+h)\\times ${ecritureParentheseSiNegatif(a)}}`)} ${this.correctionDetaillee ? `&\\text{Simplification par }h` : ``} \\\\
\\end{aligned}$`,
              `On calcule la limite du taux de variation quand $h$ tend vers $0$.<br>
$\\lim\\limits_{h \\rightarrow 0} \\dfrac{-1}{(${a}+h)\\times ${ecritureParentheseSiNegatif(a)}}= \\dfrac{-1}{${a * a}}$ <br>` +
                Conclusion +
                ` $${a}$ et donc ${
                  a !== 1 && a !== -1
                    ? `$f'(${a})=${miseEnEvidence(`\\dfrac{-1}{${a * a}}`)}$`
                    : `$f'(${a})=${miseEnEvidence(-1)}$.`
                }`,
            ],
            style: 'nombres',
          })
          reponse1 = `\\frac{-1}{(${a}+h)\\times${a}}`
          if (a !== 1 && a !== -1) {
            reponse2 = `\\frac{-1}{${a * a}}`
          } else {
            reponse2 = '-1'
          }

          break
        case 4: // 'racine_carree':
          // Texte spécifique pour la correction détaillée
          texteApp = `\\text{Application à la fonction racine carrée}`
          texte =
            'Soit $f$ la fonction définie pour tout $x$ de $\\mathbb{R}_{+}$ par $f(x)=\\sqrt{x}$.<br>'
          texte += createList({
            items: [Q1, Q2],
            style: 'nombres',
          })
          texteCorr = createList({
            items: [
              IntroCorrection +
                `
$\\begin{aligned}t(h) &= \\dfrac{f(${a}+h)-f(${a})}{h}${this.correctionDetaillee ? `&${texteDef}` : ``}\\\\
&= \\dfrac{\\sqrt{${a}+h}-\\sqrt{${a}}}{h}${this.correctionDetaillee ? `&${texteApp}` : ``}\\\\
&=\\dfrac{(\\sqrt{${a}+h}-\\sqrt{${a}})(\\sqrt{${a}+h}+\\sqrt{${a}})}{h(\\sqrt{${a}+h}+\\sqrt{${a}})}${this.correctionDetaillee ? `&\\text{Multiplication par la "quantité conjuguée"}` : ``}\\\\
&=\\dfrac{${a}+h${ecritureAlgebrique(-a)}}{h(\\sqrt{${a}+h}+\\sqrt{${a}})}${this.correctionDetaillee ? `&\\text{Identité remarquable : } (a-b)(a+b)=a^2-b^2` : ``}\\\\
&=\\dfrac{h}{h(\\sqrt{${a}+h}+\\sqrt{${a}})}${this.correctionDetaillee ? `&${texteRed}` : ``}\\\\
&=${miseEnEvidence(`\\dfrac{1}{\\sqrt{${a}+h}+\\sqrt{${a}}}`)} ${this.correctionDetaillee ? `&\\text{Simplification de la fraction par } h` : ``}\\\\
\\end{aligned}$`,
              `On calcule la limite du taux de variation quand $h$ tend vers $0$.<br>
$\\lim\\limits_{h \\rightarrow 0} \\dfrac{1}{\\sqrt{${a}+h}+\\sqrt{${a}}}=\\dfrac{1}{2 \\sqrt{${a}}}$<br>
` +
                Conclusion +
                `$${a}$ et donc ${
                  a === 1
                    ? `$f'(${a})=${miseEnEvidence('\\dfrac{1}{2}')}$`
                    : a === 4
                      ? `$f'(${a})=${miseEnEvidence('\\dfrac{1}{4}')}$`
                      : `$f'(${a})=${miseEnEvidence(`\\dfrac{1}{2 \\sqrt{${a}}}`)}$.`
                }`,
            ],
            style: 'nombres',
          })
          reponse1 = `\\frac{1}{\\sqrt{${a}+h}+\\sqrt{${a}}}`
          if (a === 1) {
            reponse2 = '\\frac{1}{2}'
          } else if (a === 4) {
            reponse2 = '\\frac{1}{4}'
          } else {
            reponse2 = `\\frac{1}{2 \\sqrt{${a}}}`
          }
          break

        case 5: // 'polynôme second degré':
          {
            b = randint(-2, 3)
            c = randint(-4, 5, b)
            const poly = new Trinome(1, b, c)
            const valeurEnA = a * a + b * a + c
            const valeurEnAh = `((${a}+h)^2${b === 0 ? `` : `${ecritureAlgebriqueSauf1(b)}(${a}+h)`}${c === 0 ? `` : `${ecritureAlgebrique(c)}`})`
            const developpementAh = `${a ** 2}${ecritureAlgebrique(2 * a)} h+h^2${b === 0 ? `` : `${ecritureAlgebrique(b * a)}${ecritureAlgebriqueSauf1(b)}h`}${c === 0 ? `` : `${ecritureAlgebrique(c)}`}`
            const simplificationAh = `${a * a}${ecritureAlgebrique(2 * a)}h+h^2${b === 0 ? `` : `${ecritureAlgebrique(b * a)}${ecritureAlgebriqueSauf1(b)}h`}${c === 0 ? `` : `${ecritureAlgebrique(c)}`}`
            const reductionNum = `${rienSi1(2 * a + b)}h+h^2`
            const factorisation = `h(${2 * a + b}+h)`
            reponse1 = String(2 * a + b) + '+h'
            reponse2 = String(2 * a + b)

            // Texte spécifique pour la correction détaillée
            texteApp = `\\text{Application à  } f(x)=${poly.tex}`

            texte = ` Soit $f$ la fonction définie pour tout $x$ de $\\mathbb{R}$ par $f(x)=${poly.tex}$.<br>`
            texte += createList({
              items: [Q1, Q2],
              style: 'nombres',
            })
            texteCorr = createList({
              items: [
                IntroCorrection +
                  `
$\\begin{aligned}t(h) &= \\dfrac{f(${a}+h)-f(${a})}{h}${this.correctionDetaillee ? `&${texteDef}` : ``}\\\\
&= \\dfrac{${valeurEnAh}-(${ecritureParentheseSiNegatif(a)}^2${b === 0 ? `` : `${ecritureAlgebrique(b * a)}`}${c === 0 ? `` : `${ecritureAlgebrique(c)}`})}{h}${this.correctionDetaillee ? `&${texteApp}` : ``}\\\\
&= \\dfrac{(${developpementAh})${a * a + b * a + c === 0 ? `-0` : `-${ecritureParentheseSiNegatif(valeurEnA)}`}}{h}${this.correctionDetaillee ? `&${texteDev}` : ``}\\\\
&= \\dfrac{${simplificationAh}${valeurEnA === 0 ? `` : `${ecritureAlgebrique(-valeurEnA)}`}}{h}${this.correctionDetaillee ? `&${texteSimp}` : ``}\\\\
&= \\dfrac{${reductionNum}}{h}${this.correctionDetaillee ? `&${texteRed}` : ``}\\\\
&= \\dfrac{${factorisation}}{h}${this.correctionDetaillee ? `&${texteFact}` : ``}\\\\
&=${miseEnEvidence(`${2 * a + b}+h`)}${this.correctionDetaillee ? `&${texteSimpH}` : ``}\\\\
\\end{aligned}$`,
                `On calcule la limite du taux de variation quand $h$ tend vers $0$.<br>
$\\lim\\limits_{h \\rightarrow 0} ${2 * a + b}+h=${2 * a + b}$<br>
` +
                  Conclusion +
                  ` $${a}$ et donc $f'(${a})=${miseEnEvidence(2 * a + b)}$.`,
              ],
              style: 'nombres',
            })
          }
          break

        case 6: // 'polynôme second degré avec coefficient ≠ 1':
          {
            const coefA = randint(-2, 3, [0, 1]) // coefficient de x² différent de 0 et 1
            b = randint(-2, 2)
            c = randint(-2, 3)
            const poly6 = new Trinome(coefA, b, c)
            const valeurEnA6 = coefA * a * a + b * a + c
            const valeurEnAh6 = `(${rienSi1(coefA)}(${a}+h)^2${b === 0 ? `` : `${ecritureAlgebriqueSauf1(b)}(${a}+h)`}${c === 0 ? `` : `${ecritureAlgebrique(c)}`})`
            const developpementAh6 = `${rienSi1(coefA)}\\times${ecritureParentheseSiNegatif(a)}^2${ecritureAlgebrique(2 * coefA * a)} h${ecritureAlgebriqueSauf1(coefA)}h^2${b === 0 ? `` : `${ecritureAlgebrique(b * a)}${ecritureAlgebriqueSauf1(b)}h`}${c === 0 ? `` : `${ecritureAlgebrique(c)}`}`
            const simplificationAh6 = `${coefA * a * a}${ecritureAlgebrique(2 * coefA * a)}h${ecritureAlgebriqueSauf1(coefA)}h^2${b === 0 ? `` : `${ecritureAlgebrique(b * a)}${ecritureAlgebriqueSauf1(b)}h`}${c === 0 ? `` : `${ecritureAlgebrique(c)}`}`
            const reductionNum6 = `${rienSi1(2 * coefA * a + b)}h${ecritureAlgebriqueSauf1(coefA)}h^2`
            const factorisation6 = `h(${2 * coefA * a + b}${ecritureAlgebriqueSauf1(coefA)}h)`

            // Texte spécifique pour la correction détaillée
            texteApp = `\\text{Application à } f(x)=${poly6.tex}`

            texte = `Soit $f$ la fonction définie pour tout $x$ de $\\mathbb{R}$ par $f(x)=${poly6.tex}$.<br>`
            texte += createList({
              items: [Q1, Q2],
              style: 'nombres',
            })
            texteCorr = createList({
              items: [
                IntroCorrection +
                  `
$\\begin{aligned}t(h) &= \\dfrac{f(${a}+h)-f(${a})}{h}${this.correctionDetaillee ? `&${texteDef}` : ``}\\\\
&= \\dfrac{${valeurEnAh6}-(${rienSi1(coefA)}\\times${ecritureParentheseSiNegatif(a)}^2${b === 0 ? `` : `${ecritureAlgebrique(b * a)}`}${c === 0 ? `` : `${ecritureAlgebrique(c)}`})}{h}${this.correctionDetaillee ? `&${texteApp}` : ``}\\\\
&= \\dfrac{(${developpementAh6})${ecritureAlgebrique(-valeurEnA6)}}{h}${this.correctionDetaillee ? `&${texteDev}` : ``}\\\\
&= \\dfrac{${simplificationAh6}${ecritureAlgebrique(-valeurEnA6)}}{h}${this.correctionDetaillee ? `&${texteSimp}` : ``}\\\\
&= \\dfrac{${reductionNum6}}{h}${this.correctionDetaillee ? `&${texteRed}` : ``}\\\\
&= \\dfrac{${factorisation6}}{h}${this.correctionDetaillee ? `&${texteFact}` : ``}\\\\
&=${miseEnEvidence(`${2 * coefA * a + b}${ecritureAlgebriqueSauf1(coefA)}h`)}${this.correctionDetaillee ? `&${texteSimpH}` : ``}\\\\
\\end{aligned}$`,
                `On calcule la limite du taux de variation quand $h$ tend vers $0$.<br>
$\\lim\\limits_{h \\rightarrow 0} ${2 * coefA * a + b}${ecritureAlgebriqueSauf1(coefA)}h=${2 * coefA * a + b}$<br>
` +
                  Conclusion +
                  ` $${a}$ et donc $f'(${a})=${miseEnEvidence(2 * coefA * a + b)}$.`,
              ],
              style: 'nombres',
            })
            reponse1 = `${2 * coefA * a + b}${ecritureAlgebriqueSauf1(coefA)}h`
            reponse2 = String(2 * coefA * a + b)
          }
          break

        case 7: // 'fonction a/x':
          {
            const coefNum7 = randint(-5, 10, [0, 1, -1]) // coefficient au numérateur

            // S'assurer que le point où on calcule la dérivée est différent du coefficient
            // et qu'il n'y a pas de simplification facile
            const pointA7 = coefNum7 + choice([-1, 1])

            const Q1cas7 = `Calculer le taux de variation $t(h)$ de $f$ entre $${pointA7}$ et $${pointA7}+h$, où $h$ est un réel non nul.`
            const Q2cas7 = `En déduire que $f$ est dérivable en $${pointA7}$ et déterminer $f'(${pointA7})$.`

            texteApp = `\\text{Application à } f(x)=\\dfrac{${coefNum7}}{x}`

            texte = `Soit $f$ la fonction définie pour tout $x$ de $\\mathbb{R}^*$ par $f(x)=\\dfrac{${coefNum7}}{x}$.<br>`
            texte += createList({
              items: [Q1cas7, Q2cas7],
              style: 'nombres',
            })
            texteCorr = createList({
              items: [
                IntroCorrection +
                  `
$\\begin{aligned}t(h) &= \\dfrac{f(${pointA7}+h)-f(${pointA7})}{h}${this.correctionDetaillee ? `&${texteDef}` : ``}\\\\
&= \\dfrac{\\dfrac{${coefNum7}}{${pointA7}+h}-\\dfrac{${coefNum7}}{${pointA7}}}{h}${this.correctionDetaillee ? `&${texteApp}` : ``}\\\\
&= \\dfrac{\\dfrac{${coefNum7}\\times ${pointA7}}{${pointA7}(${pointA7}+h)}-\\dfrac{${coefNum7}(${pointA7}+h)}{${pointA7}(${pointA7}+h)}}{h}${this.correctionDetaillee ? `&\\text{Mise au même dénominateur}` : ``}\\\\
&= \\dfrac{\\dfrac{${coefNum7 * pointA7}-${coefNum7}(${pointA7}+h)}{${pointA7}(${pointA7}+h)}}{h}${this.correctionDetaillee ? `&${texteRed}` : ``}\\\\
&= \\dfrac{\\dfrac{${coefNum7 * pointA7}${ecritureAlgebrique(-coefNum7 * pointA7)}${ecritureAlgebriqueSauf1(-coefNum7)}h}{${pointA7}(${pointA7}+h)}}{h}${this.correctionDetaillee ? `&${texteDev}` : ``}\\\\
&= \\dfrac{\\dfrac{${rienSi1(-coefNum7)}h}{${pointA7}(${pointA7}+h)}}{h}${this.correctionDetaillee ? `&${texteSimp}` : ``}\\\\
&= \\dfrac{${-coefNum7}h}{${pointA7}(${pointA7}+h)} \\times \\dfrac{1}{h}${this.correctionDetaillee ? `&\\text{Diviser par } h\\text{, c'est multiplier par }\\dfrac{1}{h}` : ``}\\\\
&=${miseEnEvidence(`\\dfrac{${-coefNum7}}{${pointA7}(${pointA7}+h)}`)}${this.correctionDetaillee ? `&${texteSimpH}` : ``}\\\\
\\end{aligned}$`,
                `On calcule la limite du taux de variation quand $h$ tend vers $0$.<br>
$\\lim\\limits_{h \\rightarrow 0} \\dfrac{${-coefNum7}}{${pointA7}(${pointA7}+h)}=\\dfrac{${-coefNum7}}{${pointA7 * pointA7}}$<br>
` +
                  Conclusion +
                  ` $${pointA7}$ et donc $f'(${pointA7})=${miseEnEvidence(`\\dfrac{${-coefNum7}}{${pointA7 * pointA7}}`)}$.`,
              ],
              style: 'nombres',
            })

            reponse1 = `\\frac{${-coefNum7}}{${pointA7}(${pointA7}+h)}`
            reponse2 = `\\frac{${-coefNum7}}{${pointA7 * pointA7}}`
          }
          break

        case 8: // ' a/(x+b)':
        default:
          {
            const coefNum = randint(2, 6) // coefficient a du numérateur
            const coefDenom = randint(-5, 5, [0, coefNum + 1]) // coefficient b de x+b

            a = coefNum + 1 - coefDenom

            // Redéclarer Q1 et Q2 avec la nouvelle valeur de a
            const Q1cas8 = `Calculer le taux de variation $t(h)$ de $f$ entre $${a}$ et $${a}+h$, où $h$ est un réel non nul.`
            const Q2cas8 = `En déduire que $f$ est dérivable en $${a}$ et déterminer $f'(${a})$.`

            // Texte spécifique pour la correction détaillée
            texteApp = `\\text{Application à } f(x)=\\dfrac{${coefNum}}{x${ecritureAlgebrique(coefDenom)}}`

            const xA = a // renommer pour clarifier : x_a est le point où on calcule la dérivée
            const denominateurEnA = xA + coefDenom // Calculer x_a + b
            const coefNumOppose = -coefNum // Simplifier directement l'opposé de coefNum
            reponse1 = `\\frac{${coefNumOppose}}{${denominateurEnA}(${reduireAxPlusB(1, denominateurEnA, 'h')}) }`
            reponse2 = `\\frac{${coefNumOppose}}{${denominateurEnA * denominateurEnA}}`
            texte = `Soit $f$ la fonction définie pour tout $x$ de $\\mathbb{R} \\smallsetminus \\{${-coefDenom}\\}$ par $f(x)=\\dfrac{${coefNum}}{x${ecritureAlgebrique(coefDenom)}}$.<br>`
            texte += createList({
              items: [Q1cas8, Q2cas8],
              style: 'nombres',
            })
            texteCorr = createList({
              items: [
                `Pour déterminer le taux de variation de $f$ entre $${xA}$ et $${xA}+h$, on applique la définition :<br>
$\\begin{aligned}t(h) &= \\dfrac{f(${xA}+h)-f(${xA})}{h}${this.correctionDetaillee ? `&${texteDef}` : ``}\\\\
&= \\dfrac{\\dfrac{${coefNum}}{${xA}+h${ecritureAlgebrique(coefDenom)}}-\\dfrac{${coefNum}}{${denominateurEnA}}}{h}${this.correctionDetaillee ? `&${texteApp}` : ``}\\\\
&= \\dfrac{\\dfrac{${coefNum}\\times ${denominateurEnA}}{ ${denominateurEnA}(h${ecritureAlgebrique(denominateurEnA)})}-\\dfrac{${coefNum}(h${ecritureAlgebrique(denominateurEnA)})}{${denominateurEnA}(h${ecritureAlgebrique(denominateurEnA)})}}{h}${this.correctionDetaillee ? `&\\text{Mise au même dénominateur}` : ``}\\\\
&= \\dfrac{\\dfrac{${coefNum}\\times ${denominateurEnA}-${coefNum}(h${ecritureAlgebrique(denominateurEnA)})}{ ${denominateurEnA}(h${ecritureAlgebrique(denominateurEnA)})}}{h}${this.correctionDetaillee ? `&${texteRed}` : ``}\\\\
&= \\dfrac{\\dfrac{${coefNum * denominateurEnA}-${coefNum}h${ecritureAlgebrique(-coefNum * denominateurEnA)}}{ ${denominateurEnA}(h${ecritureAlgebrique(denominateurEnA)})}}{h}${this.correctionDetaillee ? `&${texteDev}` : ``}\\\\
&= \\dfrac{\\dfrac{${rienSi1(coefNumOppose)}h}{ ${denominateurEnA}(h${ecritureAlgebrique(denominateurEnA)})}}{h}${this.correctionDetaillee ? `&${texteSimp}` : ``}\\\\
&= \\dfrac{${coefNumOppose}h}{${denominateurEnA}(h${ecritureAlgebrique(denominateurEnA)})} \\times \\dfrac{1}{h}${this.correctionDetaillee ? `&\\text{Diviser par } h\\text{, c'est multiplier par }\\dfrac{1}{h}` : ``}\\\\
&=${miseEnEvidence(`\\dfrac{${coefNumOppose}}{${denominateurEnA}(h${ecritureAlgebrique(denominateurEnA)}) }`)}${this.correctionDetaillee ? `&${texteSimpH}` : ``}\\\\
\\end{aligned}$`,
                `On calcule la limite du taux de variation quand $h$ tend vers $0$.<br>
$\\lim\\limits_{h \\rightarrow 0} \\dfrac{${coefNumOppose}}{(h${ecritureAlgebrique(denominateurEnA)})\\times ${denominateurEnA}}=\\dfrac{${coefNumOppose}}{${denominateurEnA * denominateurEnA}}$<br>
` +
                  Conclusion +
                  ` $${xA}$ et donc $f'(${xA})=${miseEnEvidence(`${new FractionEtendue(coefNumOppose, denominateurEnA * denominateurEnA).texFractionSimplifiee}`)}$.`,
              ],
              style: 'nombres',
            })
          }
          break
      }
      texte += ajouteChampTexteMathLive(this, 2 * i, KeyboardType.lycee, {
        texteAvant: `$t(h)=$`,
      })
      texte += ajouteChampTexteMathLive(this, 2 * i + 1, KeyboardType.lycee, {
        texteAvant: `$f'(${a})=$`,
      })
      handleAnswers(this, 2 * i, {
        reponse: { value: reponse1, options: { calculFormel: true } },
      })
      handleAnswers(this, 2 * i + 1, { reponse: { value: reponse2 } })
      if (this.questionJamaisPosee(i, typeDeQuestion, a)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
