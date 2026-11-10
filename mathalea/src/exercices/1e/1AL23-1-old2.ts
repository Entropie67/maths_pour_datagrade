// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 3517b continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { tableauDeVariation } from '../../lib/mathFonctions/etudeFonction'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Résoudre une inéquation du second degré'

/**
 * Résoudre une inéquation du second degré
 * @author Stéphane Guyon

 */
export const dateDeModifImportante = '19/09/2026'

export const uuid = '3517b'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}

/** Ligne du tableau de signes avec deux racines distinctes (Δ>0) : le signe change à chaque racine. */
function ligneDeuxRacines(aPositif: boolean) {
  return aPositif
    ? ['Line', 30, '', 0, '+', 20, 'z', 20, '-', 20, 'z', 20, '+', 20]
    : ['Line', 30, '', 0, '-', 20, 'z', 20, '+', 20, 'z', 20, '-', 20]
}

/** Ligne du tableau de signes avec une racine double (Δ=0) : le signe ne change pas. */
function ligneUneRacine(aPositif: boolean) {
  const signe = aPositif ? '+' : '-'
  return ['Line', 30, '', 0, signe, 30, 'z', 20, signe, 30]
}

/** Ligne du tableau de signes sans racine (Δ<0) : un seul signe sur $\\mathbb R$. */
function ligneAucuneRacine(aPositif: boolean) {
  return ['Line', 30, '', 0, aPositif ? '+' : '-', 60]
}

export default class ResoudreEquationDegre2Old2 extends Exercice {
  constructor() {
    super()

    this.consigne = 'Résoudre, dans $\\mathbb{R}$, les inéquations suivantes.'
    this.nbQuestions = 2
    this.nbCols = 2
    this.nbColsCorr = 2
    this.spacingCorr = 1.5

    this.besoinFormulaireTexte = [
      'Nombre de racines du polynôme',
      '1 : Deux racines\n2 : Une racine\n3 : Aucune racine\n4 : Mélange',
    ]
    this.sup = '4'
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions === 1
        ? "Résoudre, dans $\\mathbb{R}$, l'inéquation suivante."
        : 'Résoudre, dans $\\mathbb{R}$, les inéquations suivantes.'
    const typesDeRacinesDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: this.nbQuestions,
    })
    const listeNombreDeRacines = combinaisonListes(
      typesDeRacinesDisponibles,
      this.nbQuestions,
    )

    for (
      let i = 0, texte, texteCorr, a, b, c, x1, x2, y1, k, ligne1, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const nombreDeRacines = listeNombreDeRacines[i]
      const inegalite = choice([
        'strictement supérieur',
        'supérieur ou égal',
        'inférieur ou égal',
        'strictement inférieur',
      ])

      if (nombreDeRacines === 1) {
        // Δ > 0 : deux racines distinctes
        x1 = randint(-5, 2, [0])
        x2 = randint(x1 + 1, 5, [0, -x1])
        k = randint(-4, 4, [0])
        a = k
        b = -k * x1 - k * x2
        c = k * x1 * x2
        const delta = b * b - 4 * a * c
        const racine1 = (-b - Math.sqrt(delta)) / (2 * a)
        const racine2 = (-b + Math.sqrt(delta)) / (2 * a)
        if (inegalite === 'strictement supérieur') {
          texte = `$${rienSi1(a)}x^2${ecritureAlgebriqueSauf1(b)}x${ecritureAlgebrique(c)}>0$`
          texteCorr = `Soit $P$ le polynôme défini pour tout $x$ de $\\mathbb R$ par $P(x)=${rienSi1(a)}x^2${ecritureAlgebriqueSauf1(b)}x${ecritureAlgebrique(c)}$.`
          texteCorr += '<br>On cherche à résoudre $P(x)>0$.'
          texteCorr += '<br>Pour cela, on cherche ses racines éventuelles.'
          texteCorr += `<br>$\\Delta = ${ecritureParentheseSiNegatif(b)}^2-4\\times${ecritureParentheseSiNegatif(a)}\\times${ecritureParentheseSiNegatif(c)}=${b * b - 4 * a * c}$`
          texteCorr +=
            '<br>$\\Delta>0$ donc le polynôme admet deux racines : $x_1 = \\dfrac{-b-\\sqrt{\\Delta}}{2a}$ et $x_2 = \\dfrac{-b+\\sqrt{\\Delta}}{2a}$.'
          texteCorr += `<br>$x_1 =\\dfrac{${-b}-\\sqrt{${b * b - 4 * a * c}}}{${2 * a}}=${racine1}$`
          texteCorr += `<br>$x_2 =\\dfrac{${-b}+\\sqrt{${b * b - 4 * a * c}}}{${2 * a}}=${racine2}$`
          texteCorr +=
            "<br>On sait qu'un polynôme du second degré est du signe de $a$ à l'extérieur de ses racines."
          texteCorr += `<br>Comme $a=${a}`
          if (a > 0) {
            texteCorr += '>0$'
            ligne1 = ligneDeuxRacines(true)
          } else {
            texteCorr += '<0$'
            ligne1 = ligneDeuxRacines(false)
          }
          texteCorr +=
            '<br>on en déduit le signe du polynôme dans un tableau de signes :'
          texteCorr += tableauDeVariation({
            tabInit: [
              [
                ['$x$', 2, 30],
                [
                  `$${rienSi1(a)}x^2${ecritureAlgebriqueSauf1(b)}x${ecritureAlgebrique(c)}$`,
                  2,
                  50,
                ],
              ],
              ['$-\\infty$', 30, `${x1}`, 20, `${x2}`, 20, '$+\\infty$', 30],
            ],
            tabLines: [ligne1],
            espcl: 3.5,
            deltacl: 0.8,
            lgt: 8,
            hauteurLignes: [12, 15],
          })
          if (a > 0) {
            texteCorr += `<br>Finalement $S=${miseEnEvidence(`]-\\infty\\,;\\,${x1}[\\cup]${x2}\\,;\\,+\\infty[`)}$.`
          } else {
            texteCorr += `<br> Finalement $S=${miseEnEvidence(`]${x1}\\,;\\,${x2}[`)}$.`
          }
        } else if (inegalite === 'supérieur ou égal') {
          texte = `$${rienSi1(a)}x^2${ecritureAlgebriqueSauf1(b)}x${ecritureAlgebrique(c)}\\geqslant 0$`
          texteCorr = `Soit $P$ le polynôme défini pour tout $x$ de $\\mathbb R$ par $P(x)=${rienSi1(a)}x^2${ecritureAlgebriqueSauf1(b)}x${ecritureAlgebrique(c)}$.`
          texteCorr += '<br>On cherche à résoudre $P(x)\\geqslant 0$.'
          texteCorr += '<br>Pour cela, on cherche ses racines éventuelles.'
          texteCorr += `<br>$\\Delta = ${ecritureParentheseSiNegatif(b)}^2-4\\times${ecritureParentheseSiNegatif(a)}\\times${ecritureParentheseSiNegatif(c)}=${b * b - 4 * a * c}$`
          texteCorr +=
            '<br>$\\Delta>0$ donc  le polynôme admet deux racines : $x_1 = \\dfrac{-b-\\sqrt{\\Delta}}{2a}$ et $x_2 = \\dfrac{-b+\\sqrt{\\Delta}}{2a}$.'
          texteCorr += `<br>$x_1 =\\dfrac{${-b}-\\sqrt{${b * b - 4 * a * c}}}{${2 * a}}=${racine1}$`
          texteCorr += `<br>$x_2 =\\dfrac{${-b}+\\sqrt{${b * b - 4 * a * c}}}{${2 * a}}=${racine2}$`
          texteCorr +=
            "<br>On sait qu'un polynôme du second degré est du signe de $a$ à l'extérieur de ses racines."
          texteCorr += `<br>Comme $a=${a}`
          if (a > 0) {
            texteCorr += '>0$'
            ligne1 = ligneDeuxRacines(true)
          } else {
            texteCorr += `<0$, on peut dire que $P(x)\\geqslant 0$ sur $S=${miseEnEvidence(`]-\\infty\\,;\\,${x1}]\\cup[${x2}\\,;\\,+\\infty[`)}$`
            ligne1 = ligneDeuxRacines(false)
          }
          texteCorr +=
            '<br>On peut résumer le signe du polynôme dans un tableau de signes :'
          texteCorr += tableauDeVariation({
            tabInit: [
              [
                ['$x$', 2, 30],
                [
                  `$${rienSi1(a)}x^2${ecritureAlgebriqueSauf1(b)}x${ecritureAlgebrique(c)}$`,
                  2,
                  50,
                ],
              ],
              ['$-\\infty$', 30, `${x1}`, 20, `${x2}`, 20, '$+\\infty$', 30],
            ],
            tabLines: [ligne1],
            espcl: 3.5,
            deltacl: 0.8,
            lgt: 8,
            hauteurLignes: [10, 10],
          })
          if (a > 0) {
            texteCorr += `<br>Finalement $S=${miseEnEvidence(`]-\\infty\\,;\\,${x1}]\\cup[${x2}\\,;\\,+\\infty[`)}$.`
          } else {
            texteCorr += `<br> Finalement $S=${miseEnEvidence(`[${x1}\\,;\\,${x2}]`)}$.`
          }
        } else if (inegalite === 'inférieur ou égal') {
          texte = `$${rienSi1(a)}x^2${ecritureAlgebriqueSauf1(b)}x${ecritureAlgebrique(c)}\\leqslant 0$`
          texteCorr = `Soit $P$ le polynôme défini pour tout $x$ de $\\mathbb R$ par $P(x)=${rienSi1(a)}x^2${ecritureAlgebriqueSauf1(b)}x${ecritureAlgebrique(c)}$.`
          texteCorr += '<br>On cherche à résoudre $P(x)\\leqslant 0$.'
          texteCorr += '<br>Pour cela, on cherche ses racines éventuelles.'
          texteCorr += `<br>$\\Delta = ${ecritureParentheseSiNegatif(b)}^2-4\\times${ecritureParentheseSiNegatif(a)}\\times${ecritureParentheseSiNegatif(c)}=${b * b - 4 * a * c}$`
          texteCorr +=
            '<br>$\\Delta>0$ donc  le polynôme admet deux racines : $x_1 = \\dfrac{-b-\\sqrt{\\Delta}}{2a}$ et $x_2 = \\dfrac{-b+\\sqrt{\\Delta}}{2a}$.'
          texteCorr += `<br>$x_1 =\\dfrac{${-b}-\\sqrt{${b * b - 4 * a * c}}}{${2 * a}}=${x1}$`
          texteCorr += `<br>$x_2 =\\dfrac{${-b}+\\sqrt{${b * b - 4 * a * c}}}{${2 * a}}=${x2}$`
          texteCorr +=
            "<br>On sait qu'un polynôme du second degré est du signe de $a$ à l'extérieur de ses racines."
          texteCorr += `<br>Comme $a=${a}`
          if (a > 0) {
            texteCorr += '>0 :$'
            ligne1 = ligneDeuxRacines(true)
          } else {
            texteCorr += '<0 :$'
            ligne1 = ligneDeuxRacines(false)
          }
          texteCorr +=
            '<br>On peut résumer le signe du polynôme dans un tableau de signes :'
          texteCorr += tableauDeVariation({
            tabInit: [
              [
                ['$x$', 2, 30],
                [
                  `$${rienSi1(a)}x^2${ecritureAlgebriqueSauf1(b)}x${ecritureAlgebrique(c)}$`,
                  2,
                  50,
                ],
              ],
              ['$-\\infty$', 30, `${x1}`, 20, `${x2}`, 20, '$+\\infty$', 30],
            ],
            tabLines: [ligne1],
            espcl: 3.5,
            deltacl: 0.8,
            lgt: 8,
            hauteurLignes: [15, 15],
          })
          if (a < 0) {
            texteCorr += `<br>Finalement $S=${miseEnEvidence(`]-\\infty\\,;\\,${x1}]\\cup[${x2}\\,;\\,+\\infty[`)}$.`
          } else {
            texteCorr += `<br> Finalement $S=${miseEnEvidence(`[${x1}\\,;\\,${x2}]`)}$.`
          }
        } else {
          // strictement inférieur
          texte = `$${rienSi1(a)}x^2${ecritureAlgebriqueSauf1(b)}x${ecritureAlgebrique(c)}< 0$`
          texteCorr = `Soit $P$ le polynôme défini pour tout $x$ de $\\mathbb R$ par $P(x)=${rienSi1(a)}x^2${ecritureAlgebriqueSauf1(b)}x${ecritureAlgebrique(c)}$.`
          texteCorr += '<br>On cherche à résoudre $P(x)< 0$.'
          texteCorr += '<br>Pour cela, on cherche ses racines éventuelles.'
          texteCorr += `<br>$\\Delta = ${ecritureParentheseSiNegatif(b)}^2-4\\times${ecritureParentheseSiNegatif(a)}\\times${ecritureParentheseSiNegatif(c)}=${b * b - 4 * a * c}$`
          texteCorr +=
            '<br>$\\Delta>0$ donc le polynôme admet deux racines : $x_1 = \\dfrac{-b-\\sqrt{\\Delta}}{2a}$ et $x_2 = \\dfrac{-b+\\sqrt{\\Delta}}{2a}$.'
          texteCorr += `<br>$x_1 =\\dfrac{${-b}-\\sqrt{${b * b - 4 * a * c}}}{${2 * a}}=${x1}$`
          texteCorr += `<br>$x_2 =\\dfrac{${-b}+\\sqrt{${b * b - 4 * a * c}}}{${2 * a}}=${x2}$`
          texteCorr +=
            "<br>On sait qu'un polynôme du second degré est du signe de $a$ à l'extérieur de ses racines."
          texteCorr += `<br>Comme $a=${a}`
          if (a > 0) {
            texteCorr += '>0 :$'
            ligne1 = ligneDeuxRacines(true)
          } else {
            texteCorr += '<0 :$'
            ligne1 = ligneDeuxRacines(false)
          }
          texteCorr +=
            '<br>On peut résumer le signe du polynôme dans un tableau de signes :'
          texteCorr += tableauDeVariation({
            tabInit: [
              [
                ['$x$', 2, 30],
                [
                  `$${rienSi1(a)}x^2${ecritureAlgebriqueSauf1(b)}x${ecritureAlgebrique(c)}$`,
                  2,
                  50,
                ],
              ],
              ['$-\\infty$', 30, `${x1}`, 20, `${x2}`, 20, '$+\\infty$', 30],
            ],
            tabLines: [ligne1],
            espcl: 3.5,
            deltacl: 0.8,
            lgt: 8,
            hauteurLignes: [15, 15],
          })
          if (a < 0) {
            texteCorr += `<br>Finalement $S=${miseEnEvidence(`]-\\infty\\,;\\,${x1}[\\cup]${x2}\\,;\\,+\\infty[`)}$.`
          } else {
            texteCorr += `<br> Finalement $S=${miseEnEvidence(`]${x1}\\,;\\,${x2}[`)}$.`
          }
        }
      } else if (nombreDeRacines === 2) {
        // Δ = 0 : une racine double
        x1 = randint(-3, 3)
        k = randint(1, 4) * choice([1, -1])
        a = k
        b = -2 * a * x1
        c = a * x1 * x1
        const polynome = `${rienSi1(a)}x^2${ecritureAlgebriqueSauf1(b)}x${ecritureAlgebrique(c)}`
        const polynomeSansB = `${rienSi1(a)}x^2${ecritureAlgebrique(c)}`
        if (inegalite === 'strictement supérieur') {
          texte = `$${b === 0 ? polynomeSansB : polynome}>0$`
          texteCorr = `Soit $P$ le polynôme défini pour tout $x$ de $\\mathbb R$ par $P(x)=${b === 0 ? polynomeSansB : polynome}$.`
          texteCorr += '<br>On cherche à résoudre $P(x)>0$.'
        } else if (inegalite === 'supérieur ou égal') {
          texte = `$${b === 0 ? polynomeSansB : polynome}\\geqslant 0$`
          texteCorr = `Soit $P$ le polynôme défini pour tout $x$ de $\\mathbb R$ par $P(x)=${b === 0 ? polynomeSansB : polynome}$.`
          texteCorr += '<br>On cherche à résoudre $P(x)\\geqslant 0$.'
        } else if (inegalite === 'inférieur ou égal') {
          texte = `$${b === 0 ? polynomeSansB : polynome}\\leqslant 0$`
          texteCorr = `Soit $P$ le polynôme défini pour tout $x$ de $\\mathbb R$ par $P(x)=${b === 0 ? polynomeSansB : polynome}$.`
          texteCorr += '<br>On cherche à résoudre $P(x)\\leqslant 0$.'
        } else {
          texte = `$${b === 0 ? polynomeSansB : polynome}< 0$`
          texteCorr = `Soit $P$ le polynôme défini pour tout $x$ de $\\mathbb R$ par $P(x)=${b === 0 ? polynomeSansB : polynome}$.`
          texteCorr += '<br>On cherche à résoudre $P(x)< 0$.'
        }
        texteCorr += '<br>Pour cela, on cherche ses racines éventuelles.'
        texteCorr += `<br>$\\Delta = ${ecritureParentheseSiNegatif(b)}^2-4\\times${ecritureParentheseSiNegatif(a)}\\times${ecritureParentheseSiNegatif(c)}=0$`
        texteCorr +=
          '<br>$\\Delta=0$ donc le polynôme admet une unique racine (racine double) : $x_0 = \\dfrac{-b}{2a}' +
          `=${x1}$.`
        texteCorr +=
          "<br>On sait qu'un polynôme du second degré est du signe de $a$ partout, sauf en sa racine double où il s'annule."
        texteCorr += `<br>Comme $a=${a}`
        if (a > 0) {
          texteCorr += '>0$'
          ligne1 = ligneUneRacine(true)
        } else {
          texteCorr += '<0$'
          ligne1 = ligneUneRacine(false)
        }
        texteCorr +=
          '<br>on en déduit le signe du polynôme dans un tableau de signes :'
        texteCorr += tableauDeVariation({
          tabInit: [
            [
              ['$x$', 2, 30],
              [`$${b === 0 ? polynomeSansB : polynome}$`, 2, 50],
            ],
            ['$-\\infty$', 30, `${x1}`, 20, '$+\\infty$', 30],
          ],
          tabLines: [ligne1],
          espcl: 3.5,
          deltacl: 0.8,
          lgt: 8,
          hauteurLignes: [12, 15],
        })
        if (inegalite === 'strictement supérieur') {
          texteCorr +=
            a > 0
              ? `<br>Finalement $S=${miseEnEvidence(`]-\\infty\\,;\\,${x1}[\\cup]${x1}\\,;\\,+\\infty[`)}$.`
              : `<br> Finalement $S=${miseEnEvidence('\\emptyset')}$.`
        } else if (inegalite === 'supérieur ou égal') {
          texteCorr +=
            a > 0
              ? `<br>Finalement $S=${miseEnEvidence('\\mathbb{R}')}$.`
              : `<br> Finalement $S=${miseEnEvidence(`\\{${x1}\\}`)}$.`
        } else if (inegalite === 'inférieur ou égal') {
          texteCorr +=
            a > 0
              ? `<br>Finalement $S=${miseEnEvidence(`\\{${x1}\\}`)}$.`
              : `<br> Finalement $S=${miseEnEvidence('\\mathbb{R}')}$.`
        } else {
          texteCorr +=
            a > 0
              ? `<br>Finalement $S=${miseEnEvidence('\\emptyset')}$.`
              : `<br> Finalement $S=${miseEnEvidence(`]-\\infty\\,;\\,${x1}[\\cup]${x1}\\,;\\,+\\infty[`)}$.`
        }
      } else {
        // Δ < 0 : aucune racine
        k = randint(1, 5)
        x1 = randint(-3, 3, [0])
        y1 = randint(1, 5)
        const aPositif = choice([true, false])
        a = aPositif ? k : -k
        b = -2 * a * x1
        c = a * x1 * x1 + (aPositif ? y1 : -y1)
        const polynome = `${rienSi1(a)}x^2${ecritureAlgebriqueSauf1(b)}x${ecritureAlgebrique(c)}`
        const polynomeSansB = `${rienSi1(a)}x^2${ecritureAlgebrique(c)}`
        if (inegalite === 'strictement supérieur') {
          texte = `$${b === 0 ? polynomeSansB : polynome}> 0$`
          texteCorr = `Soit $P$ le polynôme défini pour tout $x$ de $\\mathbb R$ par $P(x)=${b === 0 ? polynomeSansB : polynome}$.`
          texteCorr += '<br>On cherche à résoudre $P(x)> 0$.'
        } else if (inegalite === 'supérieur ou égal') {
          texte = `$${b === 0 ? polynomeSansB : polynome}\\geqslant0$`
          texteCorr = `Soit $P$ le polynôme défini pour tout $x$ de $\\mathbb R$ par $P(x)=${b === 0 ? polynomeSansB : polynome}$.`
          texteCorr += '<br>On cherche à résoudre $P(x)\\geqslant 0$.'
        } else if (inegalite === 'inférieur ou égal') {
          texte = `$${b === 0 ? polynomeSansB : polynome}\\leqslant0$`
          texteCorr = `Soit $P$ le polynôme défini pour tout $x$ de $\\mathbb R$ par $P(x)=${b === 0 ? polynomeSansB : polynome}$.`
          texteCorr += '<br>On cherche à résoudre $P(x)\\leqslant 0$.'
        } else {
          texte = `$${b === 0 ? polynomeSansB : polynome}< 0$`
          texteCorr = `Soit $P$ le polynôme défini pour tout $x$ de $\\mathbb R$ par $P(x)=${b === 0 ? polynomeSansB : polynome}$.`
          texteCorr += '<br>On cherche à résoudre $P(x)< 0$.'
        }
        texteCorr += '<br>Pour cela, on cherche ses racines éventuelles.'
        texteCorr += `<br>$\\Delta = ${ecritureParentheseSiNegatif(b)}^2-4\\times${ecritureParentheseSiNegatif(a)}\\times${ecritureParentheseSiNegatif(c)}=${b * b - 4 * a * c}$`
        texteCorr +=
          "<br>$\\Delta<0$ donc le polynôme $P$ n'admet pas de racine."
        texteCorr += `<br> Il est toujours du signe de $a=${a}`
        texteCorr += a > 0 ? '>0$' : '<0$'
        texteCorr +=
          '<br>on en déduit le signe du polynôme dans un tableau de signes :'
        texteCorr += tableauDeVariation({
          tabInit: [
            [
              ['$x$', 2, 30],
              [`$${b === 0 ? polynomeSansB : polynome}$`, 2, 50],
            ],
            ['$-\\infty$', 30, '$+\\infty$', 30],
          ],
          tabLines: [ligneAucuneRacine(a > 0)],
          espcl: 3.5,
          deltacl: 0.8,
          lgt: 8,
          hauteurLignes: [12, 15],
        })
        if (inegalite === 'strictement supérieur') {
          texteCorr +=
            a > 0
              ? `<br>Finalement $S=${miseEnEvidence('\\mathbb{R}')}$.`
              : `<br> Finalement $S=${miseEnEvidence('\\emptyset')}$.`
        } else if (inegalite === 'supérieur ou égal') {
          texteCorr +=
            a > 0
              ? `<br>Finalement $S=${miseEnEvidence('\\mathbb{R}')}$.`
              : `<br> Finalement $S=${miseEnEvidence('\\emptyset')}$.`
        } else if (inegalite === 'inférieur ou égal') {
          texteCorr +=
            a > 0
              ? `<br>Finalement $S=${miseEnEvidence('\\emptyset')}$.`
              : `<br> Finalement $S=${miseEnEvidence('\\mathbb{R}')}$.`
        } else {
          texteCorr +=
            a > 0
              ? `<br>Finalement $S=${miseEnEvidence('\\emptyset')}$.`
              : `<br> Finalement $S=${miseEnEvidence('\\mathbb{R}')}$.`
        }
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
