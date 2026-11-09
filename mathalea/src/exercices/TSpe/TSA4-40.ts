import { createList } from '../../lib/format/lists'
import {
  brent,
  tableauDeVariation,
} from '../../lib/mathFonctions/etudeFonction'
import { Polynome } from '../../lib/mathFonctions/Polynome'
import { enleveDoublonNum } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  reduireAxPlusB,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi, signe } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Travailler un sujet de synthèse avec la fonction exponentielle'
export const interactifReady = false

export const dateDePublication = '18/12/2025'
export const dateDeModifImportante = '23/01/2026'

export const uuid = '777be'

/**
 * @author Stéphane Guyon
 */

export const refs = {
  'fr-fr': ['TSA4-40', 'TCA7-51'],
  'fr-ch': [],
}

export default class EtudeCompleteFonctionExponentielle extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : Limites en $\\pm\\infty$',
        '2 : Calcul de la dérivée',
        '3 : Étude de variations',
        '4 : Étude de la convexité',
        "5 : Résolution d'une équation $f(x)=k$",
        '6 : Toutes les questions',
      ].join('\n'),
    ]
    this.sup = '6'
    this.spacing = 2
    this.spacingCorr = 2
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = enleveDoublonNum(
      gestionnaireFormulaireTexte({
        saisie: this.sup,
        max: 5,
        melange: 6,
        defaut: 6,
        nbQuestions: 5,
        shuffle: false,
      }).map(Number),
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let a: number
      let b: number
      let m: number
      do {
        a = randint(-5, 5, 0)
        b = randint(-5, 5, 0)
        m = randint(-2, 2, [0, 1, a, -a])
      } while (-m * b - a === 0 || -m * b - a === a || -m * m - a === -a)

      const fAff = new Polynome({ coeffs: [b, a] })
      const questions: string[] = []
      const corrections: string[] = []
      const sommet = new FractionEtendue(-a - m * b, a * m) // abscisse du maximum ou minimum de f
      const k1: number = Math.trunc(Number(sommet.valeurDecimale)) // déterminer un seuil k1 pour choisir k dans la question du TVI et assurer l'existence d'une solution
      const k =
        a * m > 0 ? randint(k1 + 2, k1 + 10, 0) : randint(-k1 - 10, k1 - 2, 0) // Pour le TVI
      let extremum: number
      if (m > 0)
        extremum = arrondi(
          (a * sommet.valeurDecimale + b) * Math.exp(m * sommet.valeurDecimale),
          2,
        )
      else
        extremum = arrondi(
          (a * sommet.valeurDecimale + b) * Math.exp(m * sommet.valeurDecimale),
          4,
        ) // valeur approchée du maximum ou minimum de f

      const extremumF1 = new FractionEtendue(-a, m) // image du sommet dans (ax+b)
      const extremumF2 = new FractionEtendue(-m * b - a, a) // image du sommet dans e^(mx)
      const sommetConvexite = new FractionEtendue(
        -m * (2 * a + m * b),
        a * m * m,
      ) // abscisse du point d'inflexion de f
      let variation: string // pour le TVI
      let variation2: string // pour le TVI
      if (this.questionJamaisPosee(i, a, b, m)) {
        const texte = `Soit $f$ la fonction deux fois dérivable sur $\\mathbb{R}$, définie pour tout réel $x$ par $f(x) = \\left(${reduireAxPlusB(a, b)} \\right) \\mathrm{e}^{${rienSi1(m)}x}.$`

        for (let j = 0; j < typesDeQuestionsDisponibles.length; j++) {
          let question: string = ''
          let correction: string = ''

          switch (typesDeQuestionsDisponibles[j]) {
            case 1: {
              let corrPlus = ''
              let corrMoins = ''

              if (m > 0) {
                corrPlus = `$\\displaystyle\\lim_{x \\to +\\infty} ${fAff.toString()}=${signe(a)}\\infty$ et $\\displaystyle\\lim_{x \\to +\\infty}\\mathrm{e}^{${rienSi1(m)}x}=+\\infty$, donc par produit, $${miseEnEvidence(
                  `\\displaystyle\\lim_{x \\to +\\infty} f(x) = ${signe(
                    a,
                  )}\\infty`,
                )}.$<br>`

                corrMoins = `$\\displaystyle\\lim_{x \\to -\\infty} ${fAff.toString()}=${signe(-a)}\\infty$ et $\\displaystyle\\lim_{x \\to -\\infty}\\mathrm{e}^{${rienSi1(m)}x}= 0$. <br>On reconnaît une forme indéterminée $${signe(-a)}\\infty \\times 0$.<br>
                Pour la lever, on utilise le théorème des croissances comparées : <br>
                $\\begin{aligned}
                f(x)&=\\left(${reduireAxPlusB(a, b)} \\right) \\mathrm{e}^{${rienSi1(m)}x}\\\\
                  &=${rienSi1(a)}x\\times \\mathrm{e}^{${rienSi1(m)}x}${ecritureAlgebrique(b)}\\times \\mathrm{e}^{${rienSi1(m)}x}\\\\
                              \\end{aligned}$ <br>
                 On sait que, pour tout réel $a$ strictement positif, $\\displaystyle\\lim_{X\\to -\\infty} X\\mathrm{e}^{aX}=0$, donc $\\displaystyle\\lim_{x\\to -\\infty}${rienSi1(a)}x\\mathrm{e}^{${rienSi1(m)}x}=0.$<br>
                 Comme $\\displaystyle\\lim_{x\\to -\\infty} \\mathrm{e}^{${rienSi1(m)}x}=0$, alors par somme $${miseEnEvidence(`\\displaystyle\\lim_{x \\to -\\infty} f(x)=0`)}.$`
              } else if (m < 0) {
                corrPlus = `$\\displaystyle\\lim_{x \\to +\\infty} ${fAff.toString()}=${signe(
                  a,
                )}\\infty$ et $\\displaystyle\\lim_{x \\to +\\infty}\\mathrm{e}^{${rienSi1(m)}x}= 0$.<br>
                On reconnaît une forme indéterminée $${signe(a)}\\infty \\times 0$.<br>
              Pour la lever, on utilise le théorème des croissances comparées : <br>
                $\\begin{aligned}
                f(x)&=\\left(${reduireAxPlusB(a, b)} \\right) \\mathrm{e}^{${rienSi1(m)}x}\\\\
                  &=${rienSi1(a)}x\\times \\mathrm{e}^{${rienSi1(m)}x}${ecritureAlgebrique(b)}\\times \\mathrm{e}^{${rienSi1(m)}x}\\\\
                               \\end{aligned}$ <br>
               On sait que, pour tout réel $a$ strictement positif, $\\displaystyle\\lim_{X\\to -\\infty} X\\mathrm{e}^{aX}=0$,
               donc, $\\displaystyle\\lim_{x\\to +\\infty}${rienSi1(a)}x\\mathrm{e}^{${rienSi1(m)}x}=0.$<br>
                 Comme $\\displaystyle\\lim_{x\\to +\\infty} \\mathrm{e}^{${rienSi1(m)}x}=0$, alors par somme $${miseEnEvidence(`\\displaystyle\\lim_{x \\to +\\infty} f(x)=0`)}.$`
                corrMoins = `$\\displaystyle\\lim_{x \\to -\\infty} ${fAff.toString()}=${signe(
                  -a,
                )}\\infty$ et $\\displaystyle\\lim_{x \\to -\\infty}\\mathrm{e}^{${rienSi1(m)}x}= +\\infty$ donc par produit $${miseEnEvidence(`\\displaystyle\\lim_{x \\to -\\infty} f(x) = ${signe(-a)}\\infty`)}.$`
              }

              question +=
                ' Étudier les limites de la fonction $f$ en $+\\infty$ et $-\\infty$.'

              correction += createList({
                style: 'fleches',
                items: [corrPlus, corrMoins],
              })

              break
            }
            case 2: {
              question += `Calculer la dérivée $f'$ de la fonction $f$.`
              correction += `On a $f=uv$, avec pour tout $x\\in\\mathbb{R}$, $u(x) = ${reduireAxPlusB(a, b)}$ et $v(x) = \\mathrm{e}^{${rienSi1(m)}x}$.<br>
      On calcule : $u'(x) = ${a}$ et $v'(x) = ${m} \\mathrm{e}^{${rienSi1(m)}x}$.<br>
     Par dérivation d'un produit,<br>
      $\\begin{aligned}
      f'(x) &=u'(x)v(x) + u(x)v'(x)\\\\
      &= ${rienSi1(a)} \\mathrm{e}^{${rienSi1(m)}x} + (${reduireAxPlusB(a, b)}) (${m} \\mathrm{e}^{${rienSi1(m)}x})\\\\
      &= \\mathrm{e}^{${rienSi1(m)}x} \\left(${a} ${ecritureAlgebriqueSauf1(m)} (${reduireAxPlusB(a, b)})\\right)\\\\
      &=\\mathrm{e}^{${rienSi1(m)}x} \\left( ${a * m}x${ecritureAlgebrique(a + m * b)} \\right)
      \\end{aligned}$.`
              correction += `<br>Donc, pour tout $x\\in\\mathbb{R}, ${miseEnEvidence(`f'(x) = \\mathrm{e}^{${rienSi1(m)}x} \\left( ${a * m}x${ecritureAlgebrique(a + m * b)} \\right)`)}.$<br>`

              break
            }
            case 3:
              {
                question += `Étudier les variations de la fonction $f$ sur $\\mathbb{R}$.`
                this.listeReponsesCourtes[i] = null // La réponse est un tableau de variations.
                correction += `Pour étudier les variations de la fonction $f$, on analyse le signe de sa dérivée $f'$.<br>
      On a $f'(x) = \\mathrm{e}^{${rienSi1(m)}x} \\left( ${rienSi1(a * m)}x${ecritureAlgebrique(a + m * b)} \\right)$.<br>
      Pour tout $x\\in\\mathbb{R}$, $\\mathrm{e}^{${rienSi1(m)}x}>0$. <br>On étudie le signe de $${rienSi1(a * m)}x${ecritureAlgebrique(a + m * b)}$.`

                correction += `<br>$\\begin{aligned}
       \\phantom{\\iff}&${rienSi1(a * m)}x${ecritureAlgebrique(a + m * b)}>0\\\\
       \\iff &${rienSi1(a * m)}x>${-a - m * b}\\\\
        \\end{aligned}$`
                if (a * m > 0) {
                  correction += `<br>$\\begin{aligned}
     \\iff &x>${sommet.texFraction}\\\\
     \\iff &x>${sommet.texFractionSimplifiee}
     \\end{aligned}$ <br>
     $f$ est donc croissante quand $x>${sommet.texFractionSimplifiee}$<br>`
                } else if (a * m < 0) {
                  correction += `<br>$\\begin{aligned}
      \\iff&x<${sommet.texFraction}\\\\
      \\iff&x<${sommet.texFractionSimplifiee}
      \\end{aligned}$ <br>`
                }
                const ligneFprime =
                  a * m > 0
                    ? ['Line', 20, '', 20, '-', 20, 'z', 20, '+', 20]
                    : ['Line', 20, '', 20, '+', 20, 'z', 20, '-', 20]
                let ligneVariation
                if (a > 0 && m > 0) {
                  ligneVariation = [
                    'Var',
                    10,
                    '+/$0$',
                    30,
                    `-/$\\frac{${extremumF1.numIrred}}{${extremumF1.denIrred}}\\mathrm{e}^{\\frac{${extremumF2.numIrred}}{${extremumF2.denIrred}}}$`,
                    15,
                    '+/$+\\infty$',
                  ]
                } else if (a < 0 && m < 0) {
                  ligneVariation = [
                    'Var',
                    10,
                    '+/$+\\infty$',
                    30,
                    `-/$\\frac{${extremumF1.numIrred}}{${extremumF1.denIrred}}\\mathrm{e}^{\\frac{${extremumF2.numIrred}}{${extremumF2.denIrred}}}$`,
                    15,
                    '+/$0$',
                  ]
                } else if (a > 0 && m < 0) {
                  ligneVariation = [
                    'Var',
                    10,
                    '-/$-\\infty$',
                    30,
                    `+/$\\frac{${extremumF1.numIrred}}{${extremumF1.denIrred}}\\mathrm{e}^{\\frac{${extremumF2.numIrred}}{${extremumF2.denIrred}}}$`,
                    15,
                    '-/$0$',
                  ]
                } else {
                  ligneVariation = [
                    'Var',
                    10,
                    '-/$0$',
                    30,
                    `+/$\\frac{${extremumF1.numIrred}}{${extremumF1.denIrred}}\\mathrm{e}^{\\frac{${extremumF2.numIrred}}{${extremumF2.denIrred}}}$`,
                    15,
                    '-/$-\\infty$',
                  ]
                }
                correction += tableauDeVariation({
                  tabInit: [
                    [
                      ['x', 2, 100],
                      ["f'(x)", 2, 30],
                      ['f(x)', 4, 30],
                    ],
                    // Première ligne du tableau avec chaque antécédent suivi de son nombre de pixels de largeur estimée du texte pour le centrage

                    [
                      '$-\\infty$',
                      30,
                      `$${sommet.texFractionSimplifiee}$`,
                      30,
                      '$+\\infty$',
                      30,
                    ],
                  ],
                  // tabLines ci-dessous contient les autres lignes du tableau.

                  tabLines: [ligneFprime, ligneVariation],
                  // colorBackground: '',
                  espcl: 8, // taille en cm entre deux antécédents
                  deltacl: 1, // distance entre la bordure et les premiers et derniers antécédents
                  lgt: 3.5, // taille de la première colonne en cm
                  hauteurLignes: [30, 30, 30],
                })
                if (extremumF2.numIrred === 1) correction += `<br>$\\begin{aligned}f\\left(\\frac{${sommet.numIrred}}{${sommet.denIrred}}\\right)& = ${extremumF1.texFractionSimplifiee}\\mathrm{e}^{\\frac{${extremumF2.numIrred}}{${extremumF2.denIrred}}}\\\\&\\approx ${texNombre(extremum)}\\end{aligned}$.<br>`
                else correction += `<br>$\\begin{aligned}f\\left(\\frac{${sommet.numIrred}}{${sommet.denIrred}}\\right)& = ${extremumF1.texFractionSimplifiee}\\mathrm{e}^{${extremumF2.numIrred}}\\\\&\\approx ${texNombre(extremum)}\\end{aligned}$.<br>`
              }
              break
            case 4: {
              question += `Soit $f''$ la dérivée de la fonction $f'$.
              On donne, pour tout $x\\in\\mathbb{R}, f''(x) = \\mathrm{e}^{${rienSi1(m)}x}\\left(${rienSi1(a * m * m)}x${ecritureAlgebrique(m * (2 * a + m * b))}\\right)$.<br>
              Étudier la convexité de la fonction $f$.<br>
              Déterminer la présence éventuelle de points d'inflexion.`
              correction += `Pour étudier la convexité de la fonction $f$, on étudie le signe de la dérivée seconde $f''$.<br>
      Soit $x\\in\\mathbb{R}$, on a $f''(x) = \\mathrm{e}^{${rienSi1(m)}x}\\left(${rienSi1(a * m * m)}x${ecritureAlgebrique(m * (2 * a + m * b))}\\right)$.<br>
    On sait que pour tout $x\\in\\mathbb{R}$, $\\mathrm{e}^{${rienSi1(m)}x}>0$.<br>
    On étudie donc le signe de $${rienSi1(a * m * m)}x${ecritureAlgebrique(m * (2 * a + m * b))}$.<br>
    On résout : <br>$\\begin{aligned}
      &${rienSi1(a * m * m)}x${ecritureAlgebrique(m * (2 * a + m * b))}>0\\\\
      \\iff&${rienSi1(a * m * m)}x>${-m * (2 * a + m * b)}\\\\
      \\end{aligned}$<br>`

              if (a * m * m > 0) {
                correction += `$\\begin{aligned}
       \\iff x&>${sommetConvexite.texFraction}\\\\
       \\iff x&>${sommetConvexite.texFractionSimplifiee}
       \\end{aligned}$ <br>
       `
              } else if (a * m * m < 0) {
                correction += `$\\begin{aligned}
        \\iff&x<${sommetConvexite.texFraction}\\\\
        \\iff&x<${sommetConvexite.texFractionSimplifiee}
        \\end{aligned}$ <br>`
              }
              correction +=
                ' $f$ est convexe quand sa dérivée seconde est positive, concave quand elle est négative. On en déduit le tableau récapitulatif : <br>'
              const ligneFseconde =
                a * m * m > 0
                  ? ['Line', 20, '', 20, '-', 20, 'z', 20, '+', 20]
                  : ['Line', 20, '', 20, '+', 20, 'z', 20, '-', 20]
              const ligneFconvexite =
                a * m * m > 0
                  ? [
                      'Line',
                      20,
                      '',
                      20,
                      '$\\text{Concave}$',
                      30,
                      't',
                      20,
                      '$\\text{Convexe}$',
                      20,
                    ]
                  : [
                      'Line',
                      20,
                      '',
                      20,
                      '$\\text{Convexe}$',
                      20,
                      't',
                      20,
                      '$\\text{Concave}$',
                      20,
                    ]
              correction += tableauDeVariation({
                tabInit: [
                  [
                    ['x', 2, 20],
                    ["f''(x)", 2, 30],
                    ['$f$', 2, 20],
                  ],
                  // Première ligne du tableau avec chaque antécédent suivi de son nombre de pixels de largeur estimée du texte pour le centrage

                  [
                    '$-\\infty$',
                    30,
                    `$${sommetConvexite.texFractionSimplifiee}$`,
                    30,
                    '$+\\infty$',
                    30,
                  ],
                ],
                // tabLines ci-dessous contient les autres lignes du tableau.

                tabLines: [ligneFseconde, ligneFconvexite],

                espcl: 8, // taille en cm entre deux antécédents
                deltacl: 1, // distance entre la bordure et les premiers et derniers antécédents
                lgt: 3.5, // taille de la première colonne en cm
                hauteurLignes: [20, 20, 10],
              })
              correction += `<br><br>Une courbe représentative d'une fonction $f$ admet un point d'inflexion si et seulement si la dérivée seconde $f''$ s'annule et change de signe. <br>
           On peut donc conclure que la courbe représentative de $f$ admet un unique point d'inflexion en $x = ${sommetConvexite.texFractionSimplifiee}$.<br>`
              break
            }
            // *********************************
            // TVI
            // ******************************** */
            case 5:
              {
                question += `Déterminer le nombre de solution(s) sur $\\mathbb{R}$, de l'équation $f(x) = ${k}$.
              On donnera, le cas échéant, pour chacune, une valeur approchée au centième près.<br>`
                let TVIPlus = '  '
                let TVIMoins = ' '
                let TVI1 = ' '
                let TVI2 = ' '
                let TVI3 = ' '
                variation = ''
                variation2 = ''
                if (a > 0) {
                  variation = 'croissante'
                  variation2 = 'décroissante'
                } else {
                  variation = 'décroissante'
                  variation2 = 'croissante'
                }

                if (m > 0) {
                  TVIPlus += ` Sur l'intervalle $\\left ]-\\infty ; ${sommet.texFractionSimplifiee}\\right[$ :<br>
                $f$ est strictement ${variation2}. `
                  TVIPlus += `Comme $\\displaystyle\\lim_{x \\to -\\infty} f(x) = 0$, alors pour tout $x$ de cet intervalle, on a `
                  if (a > 0) {
                    TVIPlus += `$f(x)<0$.<br> L'équation $f(x) = ${k}$ n'admet donc aucune solution.`
                  } else {
                    TVIPlus += `$f(x)>0$.<br> L'équation $f(x) = ${k}$ n'admet donc aucune solution.`
                  }
                  TVIMoins += `Sur l'intervalle $\\left[ ${sommet.texFractionSimplifiee};+\\infty \\right[$ :`
                  TVI1 = 'On sait que $f$ est dérivable donc continue.'

                  if (a > 0) {
                    TVI2 = `$${k}\\in \\left[ f\\left(\\frac{${sommet.numIrred}}{${sommet.denIrred}}\\right) ;+\\infty \\right[$ `
                  } else {
                    TVI2 = `$${k}\\in \\left]-\\infty ; f\\left(\\frac{${sommet.numIrred}}{${sommet.denIrred}}\\right) \\right[$ `
                  }
                  TVI2 += ` car <br>`
                  if (extremumF2.numIrred === 1) TVI2 += `$\\begin{aligned}f\\left(\\frac{${sommet.numIrred}}{${sommet.denIrred}}\\right)& = ${extremumF1.texFractionSimplifiee}\\mathrm{e}^{\\frac{${extremumF2.numIrred}}{${extremumF2.denIrred}}}\\\\&\\approx ${texNombre(extremum)}\\end{aligned}$.`
                  else TVI2 += `<br>$\\begin{aligned}f\\left(\\frac{${sommet.numIrred}}{${sommet.denIrred}}\\right)& = ${extremumF1.texFractionSimplifiee}\\mathrm{e}^{${extremumF2.numIrred}}\\\\&\\approx ${texNombre(extremum)}\\end{aligned}$.`
                  TVI2 += `<br>$\\displaystyle\\lim_{x \\to +\\infty} f(x) =`
                  TVI2 += a > 0 ? `+\\infty$.` : `-\\infty$.`
                  TVI3 = `$f$ est strictement croissante.`
                  correction = [TVIPlus, TVIMoins, TVI1, TVI2, TVI3].join('<br>')
                  correction += `<br>D'après le corollaire du théorème des valeurs intermédiaires, l'équation $f(x) = ${k}$ admet une unique solution sur cet intervalle.<br> `
                } else if (m < 0) {
                  TVIPlus = `Sur l'intervalle $\\left[${sommet.texFractionSimplifiee};+\\infty \\right[$ :<br>`
                  TVIPlus += `$f$ est strictement ${variation2}.<br>`
                  TVIPlus += `$\\begin{aligned}f\\left(${sommet.texFractionSimplifiee}\\right) &= ${extremumF1.texFractionSimplifiee}\\mathrm{e}^{\\frac{${extremumF2.numIrred}}{${extremumF2.denIrred}}}\\\\&\\approx ${texNombre(extremum)}\\end{aligned}$<br>
                et $\\displaystyle\\lim_{x \\to +\\infty} f(x) = 0$. <br>
                donc $${texNombre(k)} \\notin\\left]-\\infty ; ${extremumF1.texFractionSimplifiee}\\mathrm{e}^{\\frac{${extremumF2.numIrred}}{${extremumF2.denIrred}}}\\right]$.`
                  TVIMoins = ` Sur l'intervalle $\\left ]-\\infty ; ${sommet.texFractionSimplifiee}\\right]$ : `
                  TVI1 = 'On sait que $f$ est dérivable donc continue.'
                  TVI2 = `$f$ est strictement ${variation} `
                  TVI3 = `$\\displaystyle\\lim_{x \\to -\\infty} f(x) = ${signe(-a)}\\infty$.<br>`
                  if (a > 0) {
                    TVI3 += `Donc $${k} \\in \\left]${signe(-a)}\\infty ; ${extremumF1.texFractionSimplifiee}\\mathrm{e}^{\\frac{${extremumF2.numIrred}}{${extremumF2.denIrred}}}\\right]$.<br>`
                  } else {
                    TVI3 += `Donc $${k} \\in \\left] ${extremumF1.texFractionSimplifiee}\\mathrm{e}^{\\frac{${extremumF2.numIrred}}{${extremumF2.denIrred}}};${signe(-a)}\\infty \\right[$.<br>`
                  }
                  TVI3 += `d'après le corollaire du théorème des valeurs intermédiaires, l'équation $f(x) = ${k}$ admet une unique solution sur cet intervalle.<br> `

                  correction = [TVIPlus, TVIMoins, TVI1, TVI2, TVI3].join('<br>')
                }

                correction += ` Par disjonction des cas, l'équation $f(x) = ${k}$ admet donc une unique solution sur $\\mathbb{R}$.`
                const fEquation = (x: number) =>
                  (a * x + b) * Math.exp(m * x) - k
                const { root: x0 } = brent(fEquation, -100, 100, 1e-10, 200)

                correction += ` <br> À la calculatrice, on trouve une valeur approchée au centième qui vaut $x_0 \\approx ${texNombre(
                  arrondi(x0, 2),
                )}$.`
              }

              break
          }
          questions.push(question)
          corrections.push(correction)
        }

        this.listeQuestions[i] =
          texte +
          createList({
            style: 'alpha',
            items: questions,
          })
        this.listeCorrections[i] = createList({
          style: 'alpha',
          items: corrections,
        })
        i++
      }
      cpt++
    }

    listeQuestionsToContenu(this)
  }
}
