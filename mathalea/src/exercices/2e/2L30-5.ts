import { texteGras } from '../../lib/format/style'
import { tableauDeVariation } from '../../lib/mathFonctions/etudeFonction'
import { choice, shuffle2tableaux } from '../../lib/outils/arrayOutils'
import { extraireRacineCarree } from '../../lib/outils/calculs'
import { texFractionReduite } from '../../lib/outils/deprecatedFractions'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  reduireAxPlusB,
  reduirePolynomeDegre3,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { numAlpha, sp } from '../../lib/outils/outilString'
import { pgcd } from '../../lib/outils/primalite'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const dateDePublication = '25/05/2023'
export const titre = 'Étudier la position relative de deux courbes'

/**
 *
 * @author Gilles Mora
 * 2L30-5
 */
export const dateDeModifImportante = '31/10/2026'

export const uuid = '53e8f'

export const refs = {
  'fr-fr': ['2L30-5', 'BP1INE02'],
  'fr-ch': [],
}
export default class PositionRelative extends Exercice {
  constructor() {
    super()

    this.reponseCourteDisponible = false // La réponse est une étude de signe avec tableau.
    this.sup = 1
    this.sup2 = 1

    this.nbQuestions = 1
    this.besoinFormulaireTexte = [
      'Choix des fonctions',
      '1 : Fonctions affines\n2 : Polynôme de degré 2 et fonction affine\n3 : Mélange',
    ]
    this.besoinFormulaire2Texte = [
      'Choix des questions',
      '1 : Avec questions intermédiaires\n2 : Sans question intermédiaire',
    ]
  }

  nouvelleVersion() {
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 2,
      melange: 3,
      defaut: 3,
      listeOfCase: ['affines', 'polynômeEtAffine'],
      shuffle: false,
      nbQuestions: this.nbQuestions,
    })
    const sousChoix = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: 2,
      defaut: 1,
      listeOfCase: ['true', 'false'],
      nbQuestions: this.nbQuestions,
      shuffle: false,
      melange: 0,
    }).map((v) => v === 'true')
    shuffle2tableaux(listeTypeDeQuestions, sousChoix)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let a: number = 0
      let b: number
      let c: number
      let d: number // les coefficients des fonctions
      let ligne1: (string | number)[]
      let ligne2: (string | number)[]
      let ligne3: (string | number)[] // les lignes du tableau de signes
      const typesDeQuestions = listeTypeDeQuestions[i]
      const remarque = `${texteGras(`Remarque${sp()}:`)} vous pouvez vérifier ce résultat en représentant les courbes sur votre calculatrice graphique.`
      switch (typesDeQuestions) {
        case 'affines': // position relative avec deux fonctions affines
          if (sousChoix[i]) {
            a = randint(-9, 9, 0)
            b = randint(-9, 9, 0)
            c = randint(-9, 9, [0, a])
            d = randint(-9, 9, 0)
            texte = `Soient $f$ et $g$ deux fonctions définies sur $\\mathbb R$ respectivement par${sp()}: $f(x)=${reduireAxPlusB(a, b)}$ et $g(x)=${reduireAxPlusB(c, d)}$. <br>
              On note $\\mathscr{C}_f$ et $\\mathscr{C}_g$ leur courbe représentative.<br>`
            texte += `${numAlpha(0)} Résoudre dans $\\mathbb R$ l'inéquation $f(x) < g(x)$.<br>
          ${numAlpha(1)} Quelle interprétation graphique peut-on en donner${sp()}?`
            texteCorr = `${numAlpha(0)} Résolution de l'inéquation${sp()}:<br>
              $\\begin{aligned}
              ${reduireAxPlusB(a, b)}& \\lt ${reduireAxPlusB(c, d)}\\\\
              ${reduireAxPlusB(a, b)}\\,${miseEnEvidence(ecritureAlgebriqueSauf1(-c) + 'x')}& \\lt ${reduireAxPlusB(c, d)}\\,${miseEnEvidence(ecritureAlgebriqueSauf1(-c) + 'x')}\\\\
              ${reduireAxPlusB(a - c, b)}& \\lt ${reduireAxPlusB(0, d)}\\\\
              ${reduireAxPlusB(a - c, b)}\\,${miseEnEvidence(ecritureAlgebriqueSauf1(-b))}& \\lt ${reduireAxPlusB(0, d)}\\,${miseEnEvidence(ecritureAlgebriqueSauf1(-b))}\\\\
              ${reduireAxPlusB(a - c, 0)}& \\lt ${reduireAxPlusB(0, d - b)}\\\\
            ${a - c > 0 ? `x& \\lt \\dfrac{${d - b}}{${a - c}}` : `x&>\\dfrac{${d - b}}{${a - c}}`}
              \\end{aligned}$<br>
              ${pgcd(d - b, a - c) === 1 && a - c > 0 ? "L'" : `Comme $\\dfrac{${d - b}}{${a - c}}=${texFractionReduite(d - b, a - c)}$, l'`} ensemble $S$ des solutions de l'inéquation est
              $S= ${a - c > 0 ? `\\left]-\\infty\\,;\\,${texFractionReduite(d - b, a - c)}\\right[` : `\\left]${texFractionReduite(d - b, a - c)}\\,;\\,+\\infty\\right[`}$.<br>`

            texteCorr += `${numAlpha(1)} Position relative${sp()}: <br>
              La courbe $\\mathscr{C}_f$ est en dessous de la courbe $\\mathscr{C}_g$ sur l'intervalle $${a - c > 0 ? `\\left]-\\infty\\,;\\,${texFractionReduite(d - b, a - c)}\\right[` : `\\left]${texFractionReduite(d - b, a - c)}\\,;\\,+\\infty\\right[`}$.`
            texteCorr += `<br>${remarque}`
          } else {
            // sans question intermédiaire
            a = randint(-9, 9, 0)
            b = randint(-9, 9, 0)
            c = randint(-9, 9, [0, a])
            d = randint(-9, 9, 0)
            texte = `Soient $f$ et $g$ deux fonctions définies sur $\\mathbb R$ respectivement par${sp()}: $f(x)=${reduireAxPlusB(a, b)}$ et $g(x)=${reduireAxPlusB(c, d)}$. <br>
              On note $\\mathscr{C}_f$ et $\\mathscr{C}_g$ leur courbe représentative.<br>`
            texte +=
              'Étudier la position relative des deux courbes $\\mathscr{C}_f$ et $\\mathscr{C}_g$.'
            texteCorr = `La position relative des deux courbes est donnée par l'étude du signe de la différence${sp()}: $f(x)-g(x)$.<br>
              Plus précisément, si $f(x)-g(x)>0$, $\\mathscr{C}_f$ est au-dessus de $\\mathscr{C}_g$, sinon, $\\mathscr{C}_f$ est en dessous de $\\mathscr{C}_g$.<br>
              Pour tout réel $x$,<br> $\\begin{aligned}
              f(x)-g(x)&=(${reduireAxPlusB(a, b)})-(${reduireAxPlusB(c, d)})\\\\
               &=${reduireAxPlusB(a, b)}${c > 0 ? '' : '+'}${reduireAxPlusB(-c, -d)}\\\\
               &=${reduireAxPlusB(a - c, b - d)}
               \\end{aligned}$<br>`
            texteCorr += `Il s'agit d'étudier le signe de l'expression affine $${reduireAxPlusB(a - c, b - d)}$.<br>
               Comme elle s'annule en $${texFractionReduite(d - b, a - c)}$ et que $${a - c > 0 ? `${a - c}>0` : `${a - c}<0`}$, on en déduit le tableau de signes${sp()}: <br>`
            if (a - c > 0) {
              ligne1 = ['Line', 10, '', 0, '-', 20, 'z', 20, '+']
            } else {
              ligne1 = ['Line', 10, '', 0, '+', 20, 'z', 20, '-']
            }
            texteCorr += tableauDeVariation({
              tabInit: [
                [
                  // Première colonne du tableau avec le format [chaine d'entête, hauteur de ligne, nombre de pixels de largeur estimée du texte pour le centrage]
                  ['$x$', 2.5, 10],
                  ['$f(x)-g(x)$', 2, 50],
                ],
                // Première ligne du tableau avec chaque antécédent suivi de son nombre de pixels de largeur estimée du texte pour le centrage
                [
                  '$-\\infty$',
                  20,
                  `$${texFractionReduite(d - b, a - c)}$`,
                  20,
                  '$+\\infty$',
                  30,
                ],
              ],
              // tabLines ci-dessous contient les autres lignes du tableau.
              tabLines: [ligne1],

              espcl: 3.5, // taille en cm entre deux antécédents
              deltacl: 0.8, // distance entre la bordure et les premiers et derniers antécédents
              lgt: 5, // taille de la première colonne en cm
            })

            texteCorr += `Comme $f(x)-g(x)>0$ sur l'intervalle $${a - c > 0 ? `\\left]${texFractionReduite(d - b, a - c)}\\,;\\,+\\infty\\right[` : `\\left]-\\infty\\,;\\,${texFractionReduite(d - b, a - c)}\\right[`}$,
                  la courbe $\\mathscr{C}_f$ est au-dessus de la courbe $\\mathscr{C}_g$ sur cet intervalle et elle est en dessous sur $${a - c > 0 ? `\\left]-\\infty\\,;\\,${texFractionReduite(d - b, a - c)}\\right[` : `\\left]${texFractionReduite(d - b, a - c)}\\,;\\,+\\infty\\right[`}$.
                  `
            texteCorr += `<br>${remarque}`
          }
          break
        case 'polynômeEtAffine':
        default: {
          const alea = choice([1, 2, 3])
          if (alea === 1) {
            // position relative avec un poly degré 2 et une fonction affine (cas etude du signe de x^2 +/- a)
            if (sousChoix[i]) {
              // avec question intermédiaire
              a = 1 // c'est juste pour le this.questionJamaisPosee
              b = randint(-9, 9, 0)
              c = randint(-10, 10)
              d = randint(-10, 10, 0)
              texte = `Soient $f$ et $g$ deux fonctions définies sur $\\mathbb R$ respectivement par${sp()}: $f(x)=${reduirePolynomeDegre3(0, 1, b, c)}$ et $g(x)=${reduireAxPlusB(b, d)}$. <br>
            On note $\\mathscr{C}_f$ et $\\mathscr{C}_g$ leur courbe représentative.<br>`
              if (c - d > 0) {
                texte += `
                ${numAlpha(0)} Montrer que pour tout $x$ de $\\mathbb R$, $f(x) - g(x)=${reduirePolynomeDegre3(0, 1, 0, c - d)}$.<br>`
              }
              if (c - d === 0) {
                texte += `
                ${numAlpha(0)} Montrer que pour tout $x$ de $\\mathbb R$, $f(x) - g(x)=${reduirePolynomeDegre3(0, 1, 0, c - d)}$.<br>`
              }
              if (c - d < 0) {
                texte += `${numAlpha(0)} Montrer que pour tout $x$ de $\\mathbb R$,
                $f(x)-g(x)=(x-${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`})(x+${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`})$.<br>
                `
              }

              texte += `${numAlpha(1)} Étudier pour tout $x$ de $\\mathbb R$, le signe de $f(x)-g(x)$.<br>
        ${numAlpha(2)} Quelle interprétation graphique peut-on en donner${sp()}?`

              texteCorr = `${numAlpha(0)} Pour tout $x$ de $\\mathbb R$, <br>
            $\\begin{aligned}
            f(x) - g(x)&=(${reduirePolynomeDegre3(0, 1, b, c)})-(${reduireAxPlusB(b, d)})\\\\
            &=${reduirePolynomeDegre3(0, 1, b, c)}${b > 0 ? '' : '+'}${reduireAxPlusB(-b, -d)}\\\\
            &=${reduirePolynomeDegre3(0, 1, 0, c - d)}
            \\end{aligned}$<br>
           `
              ligne1 = [
                'Line',
                30,
                '',
                0,
                '-',
                20,
                'z',
                20,
                '+',
                20,
                't',
                20,
                '+',
                20,
              ]
              ligne2 = [
                'Line',
                30,
                '',
                0,
                '-',
                20,
                't',
                20,
                '-',
                20,
                'z',
                20,
                '+',
                20,
              ]
              ligne3 = [
                'Line',
                30,
                '',
                0,
                '+',
                20,
                'z',
                20,
                '-',
                20,
                'z',
                20,
                '+',
                20,
              ]
              if (c - d > 0) {
                texteCorr += `${numAlpha(1)} Pour tout $x$ de $\\mathbb R$, $${reduirePolynomeDegre3(0, 1, 0, c - d)}>0$.<br>
                ${numAlpha(2)} On en déduit que pour tout $x$ de $\\mathbb R$, $f(x)-g(x)>0$, soit $f(x)>g(x)$. <br>
                Graphiquement, $\\mathscr{C}_f$ est toujours au-dessus de $\\mathscr{C}_g$.<br>`
                texteCorr += `${remarque}`
              } else if (c - d === 0) {
                texteCorr += `${numAlpha(1)} Pour tout $x$ de $\\mathbb R$, $${reduirePolynomeDegre3(0, 1, 0, c - d)}\\geqslant 0$.<br>
                ${numAlpha(2)} On en déduit que pour tout $x$ de $\\mathbb R$, $f(x)-g(x)\\geqslant0$, soit $f(x)\\geqslant g(x)$. <br>
                Graphiquement, $\\mathscr{C}_f$ et $\\mathscr{C}_g$ ont un point d'intersection (de coordonnées $(0\\,;\\${d})) et $\\mathscr{C}_f$ est au-dessus de $\\mathscr{C}_g$.<br>`
                texteCorr += `${remarque}`
              } else {
                texteCorr += ` $${reduirePolynomeDegre3(0, 1, 0, c - d)}$ est de la forme $a^2-b^2$ avec $a=x$ et $b=${extraireRacineCarree(d - c)[0]}$.<br>
                  Comme $a^2-b^2=(a-b)(a+b)$, on en déduit $${reduirePolynomeDegre3(0, 1, 0, c - d)}=(x-${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`})(x+${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`})$.<br>
                  Ainsi, pour tout $x$ de $\\mathbb R$,
                  $f(x)-g(x)=(x-${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`})(x+${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`})$.<br>

                ${numAlpha(1)} Comme $x-${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`}$ s'annule en
                $${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`}$ et
                 $x+${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`}$ s'annule en $${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `-${extraireRacineCarree(d - c)[0]}` : `-\\sqrt{${d - c}}`}$, on obtient le tableau de signes${sp()}: <br>`

                texteCorr +=
                  tableauDeVariation({
                    tabInit: [
                      [
                        ['$x$', 2.5, 30],
                        [
                          `$x+${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`}$`,
                          2,
                          75,
                        ],
                        [
                          `$x-${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`}$`,
                          2,
                          75,
                        ],
                        ['$f(x)-g(x)$', 2, 200],
                      ],
                      [
                        '$-\\infty$',
                        30,
                        `$${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `-${extraireRacineCarree(d - c)[0]}` : `-\\sqrt{${d - c}}`}$`,
                        20,
                        `$${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`}$`,
                        20,
                        '$+\\infty$',
                        30,
                      ],
                    ],
                    tabLines: [ligne1, ligne2, ligne3],

                    espcl: 3.5,
                    deltacl: 0.8,
                    lgt: 10,
                  }) + '<br>'
                texteCorr += `${numAlpha(2)} Comme $f(x)-g(x)<0$ pour $x\\in]${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `-${extraireRacineCarree(d - c)[0]}` : `-\\sqrt{${d - c}}`}\\,;\\,${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`}[$, $\\mathscr{C}_f$ est en dessous de $\\mathscr{C}_g$ sur cet inetrvalle. <br>
                  $\\mathscr{C}_f$ est au-dessus de $\\mathscr{C}_g$ sur $]-\\infty\\,;\\,${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `-${extraireRacineCarree(d - c)[0]}` : `-\\sqrt{${d - c}}`}[$ et sur $]${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`}\\,;\\,+\\infty [$.<br>`
                texteCorr += `${remarque}`
              }
            } else {
              // sans question intermédiaire
              a = 1 // c'est juste pour le this.questionJamaisPosee
              b = randint(-9, 9, 0)
              c = randint(-10, 10)
              d = randint(-10, 10, 0)
              texte = `Soient $f$ et $g$ deux fonctions définies sur $\\mathbb R$ respectivement par${sp()}:$f(x)=${reduirePolynomeDegre3(0, 1, b, c)}$ et $g(x)=${reduireAxPlusB(b, d)}$. <br>
              On note $\\mathscr{C}_f$ et $\\mathscr{C}_g$ leur courbe représentative.<br>`
              texte +=
                'Étudier la position relative des deux courbes $\\mathscr{C}_f$ et $\\mathscr{C}_g$.'
              texteCorr = `La position relative des deux courbes est donnée par l'étude du signe de la différence${sp()}: $f(x)-g(x)$.<br>
            Plus précisément, si $f(x)-g(x)>0$, $\\mathscr{C}_f$ est au-dessus de $\\mathscr{C}_g$, sinon, $\\mathscr{C}_f$ est en dessous de $\\mathscr{C}_g$.<br>`
              texteCorr += ` Pour tout $x$ de $\\mathbb R$, <br>
            $\\begin{aligned}
            f(x) - g(x)&=(${reduirePolynomeDegre3(0, 1, b, c)})-(${reduireAxPlusB(b, d)})\\\\
            &=${reduirePolynomeDegre3(0, 1, b, c)}${b > 0 ? '' : '+'}${reduireAxPlusB(-b, -d)}\\\\
            &=${reduirePolynomeDegre3(0, 1, 0, c - d)}
            \\end{aligned}$<br>
           `
              ligne1 = [
                'Line',
                30,
                '',
                0,
                '-',
                20,
                'z',
                20,
                '+',
                20,
                't',
                20,
                '+',
                20,
              ]
              ligne2 = [
                'Line',
                30,
                '',
                0,
                '-',
                20,
                't',
                20,
                '-',
                20,
                'z',
                20,
                '+',
                20,
              ]
              ligne3 = [
                'Line',
                30,
                '',
                0,
                '+',
                20,
                'z',
                20,
                '-',
                20,
                'z',
                20,
                '+',
                20,
              ]
              if (c - d > 0) {
                texteCorr += ` Pour tout $x$ de $\\mathbb R$, $${reduirePolynomeDegre3(0, 1, 0, c - d)}>0$.<br>
                 On en déduit que pour tout $x$ de $\\mathbb R$, $f(x)-g(x)>0$, soit $f(x)>g(x)$. <br>
                Graphiquement, $\\mathscr{C}_f$ est toujours au-dessus de $\\mathscr{C}_g$.<br>${remarque}`
              } else if (c - d === 0) {
                texteCorr += ` Pour tout $x$ de $\\mathbb R$, $${reduirePolynomeDegre3(0, 1, 0, c - d)}\\geqslant 0$.<br>
                On en déduit que pour tout $x$ de $\\mathbb R$, $f(x)-g(x)\\geqslant0$, soit $f(x)\\geqslant g(x)$. <br>
                Graphiquement, $\\mathscr{C}_f$ et $\\mathscr{C}_g$ ont un point d'intersection (de coordonnées $(0\\,;\\${d})) et $\\mathscr{C}_f$ est au-dessus de $\\mathscr{C}_g$.<br>${remarque}`
              } else {
                texteCorr += ` $${reduirePolynomeDegre3(0, 1, 0, c - d)}$ est de la forme $a^2-b^2$ avec $a=x$ et $b=${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`}$.<br>
                  Comme $a^2-b^2=(a-b)(a+b)$, on en déduit $${reduirePolynomeDegre3(0, 1, 0, c - d)}=(x-${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`})(x+${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`})$.<br>
                  Ainsi, pour tout $x$ de $\\mathbb R$,
                  $f(x)-g(x)=(x-${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`})(x+${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`})$.<br>

                 Comme $x-${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`}$ s'annule en
                $${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`}$ et
                 $x+${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`}$ s'annule en $${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `-${extraireRacineCarree(d - c)[0]}` : `-\\sqrt{${d - c}}`}$, on obtient le tableau de signes${sp()}: <br>`

                texteCorr += tableauDeVariation({
                  tabInit: [
                    [
                      ['$x$', 2.5, 30],
                      [
                        `$x+${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`}$`,
                        2,
                        75,
                      ],
                      [
                        `$x-${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`}$`,
                        2,
                        75,
                      ],
                      ['$f(x)-g(x)$', 2, 200],
                    ],
                    [
                      '$-\\infty$',
                      30,
                      `$${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `-${extraireRacineCarree(d - c)[0]}` : `-\\sqrt{${d - c}}`}$`,
                      20,
                      `$${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`}$`,
                      20,
                      '$+\\infty$',
                      30,
                    ],
                  ],
                  tabLines: [ligne1, ligne2, ligne3],

                  espcl: 3.5,
                  deltacl: 0.8,
                  lgt: 10,
                })
                texteCorr += `<br> Comme $f(x)-g(x)<0$ pour $x\\in]${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `-${extraireRacineCarree(d - c)[0]}` : `-\\sqrt{${d - c}}`}\\,;\\,${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`}[$, $\\mathscr{C}_f$ est en dessous de $\\mathscr{C}_g$ sur cet inetrvalle. <br>
                  $\\mathscr{C}_f$ est au-dessus de $\\mathscr{C}_g$ sur $]-\\infty\\,;\\,${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `-${extraireRacineCarree(d - c)[0]}` : `-\\sqrt{${d - c}}`}[$ et sur $]${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`}\\,;\\,+\\infty [$.<br>${remarque}`
              }
            }
          } else if (alea === 2) {
            // position relative avec un poly degré 2 et une fonction affine (cas etude du signe de -x^2 +/- a)
            if (sousChoix[i]) {
              // avec question intermédiaire
              a = 1 // c'est juste pour le this.questionJamaisPosee
              b = randint(-9, 9, 0)
              c = randint(-10, 10)
              d = randint(-10, 10, 0)
              texte = `Soient $f$ et $g$ deux fonctions définies sur $\\mathbb R$ respectivement par${sp()}: $f(x)=${reduirePolynomeDegre3(0, -1, b, -c)}$ et $g(x)=${reduireAxPlusB(b, -d)}$. <br>
              On note $\\mathscr{C}_f$ et $\\mathscr{C}_g$ leur courbe représentative.<br>`
              if (c - d > 0) {
                texte += `
                  ${numAlpha(0)} Montrer que pour tout $x$ de $\\mathbb R$, $f(x) - g(x)=${reduirePolynomeDegre3(0, -1, 0, d - c)}$.<br>`
              }
              if (c - d === 0) {
                texte += `
                  ${numAlpha(0)} Montrer que pour tout $x$ de $\\mathbb R$, $f(x) - g(x)=${reduirePolynomeDegre3(0, -1, 0, d - c)}$.<br>`
              }
              if (c - d < 0) {
                texte += `${numAlpha(0)} Montrer que pour tout $x$ de $\\mathbb R$,
                  $f(x)-g(x)=(${d - c === 1 || d - c === 4 || d - c === 9 || d - c === 16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`}-x)(${d - c === 1 || d - c === 4 || c - d === 9 || c - d === 16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`}+x)$.<br>
                  `
              }

              texte += `${numAlpha(1)} Étudier pour tout $x$ de $\\mathbb R$, le signe de $f(x)-g(x)$.<br>
          ${numAlpha(2)} Quelle interprétation graphique peut-on en donner${sp()}?`

              texteCorr = `${numAlpha(0)} Pour tout $x$ de $\\mathbb R$, <br>
              $\\begin{aligned}
              f(x) - g(x)&=(${reduirePolynomeDegre3(0, -1, b, -c)})-(${reduireAxPlusB(b, -d)})\\\\
              &=${reduirePolynomeDegre3(0, -1, b, -c)}${b > 0 ? '' : '+'}${reduireAxPlusB(-b, d)}\\\\
              &=${reduirePolynomeDegre3(0, -1, 0, d - c)}
              \\end{aligned}$<br>
             `
              ligne1 = [
                'Line',
                30,
                '',
                0,
                '-',
                20,
                'z',
                20,
                '+',
                20,
                't',
                20,
                '+',
                20,
              ]
              ligne2 = [
                'Line',
                30,
                '',
                0,
                '+',
                20,
                't',
                20,
                '+',
                20,
                'z',
                20,
                '-',
                20,
              ]
              ligne3 = [
                'Line',
                30,
                '',
                0,
                '-',
                20,
                'z',
                20,
                '+',
                20,
                'z',
                20,
                '-',
                20,
              ]
              if (c - d > 0) {
                texteCorr += `${numAlpha(1)} Pour tout $x$ de $\\mathbb R$, $${reduirePolynomeDegre3(0, -1, 0, d - c)}<0$.<br>
                  ${numAlpha(2)} On en déduit que pour tout $x$ de $\\mathbb R$, $f(x)-g(x)<0$, soit $f(x) < g(x)$. <br>
                  Graphiquement, $\\mathscr{C}_f$ est toujours en dessous de $\\mathscr{C}_g$.<br>${remarque}`
              }
              if (c - d === 0) {
                texteCorr += `${numAlpha(1)} Pour tout $x$ de $\\mathbb R$, $${reduirePolynomeDegre3(0, -1, 0, d - c)}\\leqslant 0$.<br>
                  ${numAlpha(2)} On en déduit que pour tout $x$ de $\\mathbb R$, $f(x)-g(x)\\leqslant0$, soit $f(x)\\leqslant g(x)$. <br>
                  Graphiquement, $\\mathscr{C}_f$ et $\\mathscr{C}_g$ ont un point d'intersection (de coordonnées $(0\\,;\\${-d})) et $\\mathscr{C}_f$ est en dessous de $\\mathscr{C}_g$. <br>${remarque}`
              }
              if (c - d < 0) {
                texteCorr += ` $${d - c}-x^2$ est de la forme $a^2-b^2$ avec $a=${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`}$ et $b=x$.<br>
                    Comme $a^2-b^2=(a-b)(a+b)$, on en déduit $${d - c}-x^2=(${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`}-x)(${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`}+x)$.<br>
                    Ainsi, pour tout $x$ de $\\mathbb R$,
                    $f(x)-g(x)=
                    (${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`}-x)(${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`}+x)$.<br>
                   ${numAlpha(1)} Comme $${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`}-x$ s'annule en
                  $${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`}$ et
                   $${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`}+x$ s'annule en $${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `-${extraireRacineCarree(d - c)[0]}` : `-\\sqrt{${d - c}}`}$, on obtient le tableau de signes${sp()}: <br>`

                texteCorr += tableauDeVariation({
                  tabInit: [
                    [
                      ['$x$', 2.5, 30],
                      [
                        `$${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`}+x$`,
                        2,
                        75,
                      ],
                      [
                        `$${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`}-x$`,
                        2,
                        75,
                      ],
                      ['$f(x)-g(x)$', 2, 200],
                    ],
                    [
                      '$-\\infty$',
                      30,
                      `$${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `-${extraireRacineCarree(d - c)[0]}` : `-\\sqrt{${d - c}}`}$`,
                      20,
                      `$${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`}$`,
                      20,
                      '$+\\infty$',
                      30,
                    ],
                  ],
                  tabLines: [ligne1, ligne2, ligne3],

                  espcl: 3.5,
                  deltacl: 0.8,
                  lgt: 10,
                })
                texteCorr += `<br>${numAlpha(2)} Comme $f(x)-g(x)>0$ pour $x\\in]${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `-${extraireRacineCarree(d - c)[0]}` : `-\\sqrt{${d - c}}`}\\,;\\,${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`}[$, $\\mathscr{C}_f$ est au-dessus de $\\mathscr{C}_g$ sur cet inetrvalle. <br>
                    $\\mathscr{C}_f$ est en dessous de $\\mathscr{C}_g$ sur $]-\\infty\\,;\\,${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `-${extraireRacineCarree(d - c)[0]}` : `-\\sqrt{${d - c}}`}[$ et sur $]${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`}\\,;\\,+\\infty [$.<br>${remarque}`
              }
            } else {
              // sans question intermédiaire
              b = randint(-9, 9, 0)
              c = randint(-10, 10)
              d = randint(-10, 10, 0)
              texte = `Soient $f$ et $g$ deux fonctions définies sur $\\mathbb R$ respectivement par${sp()}: $f(x)=${reduirePolynomeDegre3(0, -1, b, -c)}$ et $g(x)=${reduireAxPlusB(b, -d)}$. <br>
            On note $\\mathscr{C}_f$ et $\\mathscr{C}_g$ leur courbe représentative.<br>`
              texte +=
                'Étudier la position relative des deux courbes $\\mathscr{C}_f$ et $\\mathscr{C}_g$.'
              texteCorr = `La position relative des deux courbes est donnée par l'étude du signe de la différence${sp()}: $f(x)-g(x)$.<br>
            Plus précisément, si $f(x)-g(x)>0$, $\\mathscr{C}_f$ est au-dessus de $\\mathscr{C}_g$, sinon, $\\mathscr{C}_f$ est en dessous de $\\mathscr{C}_g$.<br>`
              texteCorr += `  Pour tout $x$ de $\\mathbb R$, <br>
            $\\begin{aligned}
            f(x) - g(x)&=(${reduirePolynomeDegre3(0, -1, b, -c)})-(${reduireAxPlusB(b, -d)})\\\\
            &=${reduirePolynomeDegre3(0, -1, b, -c)}${b > 0 ? '' : '+'}${reduireAxPlusB(-b, d)}\\\\
            &=${reduirePolynomeDegre3(0, -1, 0, d - c)}
            \\end{aligned}$<br>
           `
              ligne1 = [
                'Line',
                30,
                '',
                0,
                '-',
                20,
                'z',
                20,
                '+',
                20,
                't',
                20,
                '+',
                20,
              ]
              ligne2 = [
                'Line',
                30,
                '',
                0,
                '+',
                20,
                't',
                20,
                '+',
                20,
                'z',
                20,
                '-',
                20,
              ]
              ligne3 = [
                'Line',
                30,
                '',
                0,
                '-',
                20,
                'z',
                20,
                '+',
                20,
                'z',
                20,
                '-',
                20,
              ]
              if (c - d > 0) {
                texteCorr += `  Pour tout $x$ de $\\mathbb R$, $${reduirePolynomeDegre3(0, -1, 0, d - c)}<0$.<br>
                ${numAlpha(2)} On en déduit que pour tout $x$ de $\\mathbb R$, $f(x)-g(x)<0$, soit $f(x) < g(x)$. <br>
                Graphiquement, $\\mathscr{C}_f$ est toujours en dessous de $\\mathscr{C}_g$.`
              }
              if (c - d === 0) {
                texteCorr += `  Pour tout $x$ de $\\mathbb R$, $${reduirePolynomeDegre3(0, -1, 0, d - c)}\\leqslant 0$.<br>
                 On en déduit que pour tout $x$ de $\\mathbb R$, $f(x)-g(x)\\leqslant0$, soit $f(x)\\leqslant g(x)$. <br>
                Graphiquement, $\\mathscr{C}_f$ et $\\mathscr{C}_g$ ont un point d'intersection (de coordonnées $(0\\,;\\${-d})) et $\\mathscr{C}_f$ est en dessous de $\\mathscr{C}_g$.<br>${remarque}`
                texteCorr += ``
              }
              if (c - d < 0) {
                texteCorr += ` $${d - c}-x^2$ est de la forme $a^2-b^2$ avec $a=${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`}$ et $b=x$.<br>
                  Comme $a^2-b^2=(a-b)(a+b)$, on en déduit $${d - c}-x^2=(${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`}-x)(${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`}+x)$.<br>
                  Ainsi, pour tout $x$ de $\\mathbb R$,
                  $f(x)-g(x)=
                  (${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`}-x)(${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`}+x)$.<br>
                 ${numAlpha(1)} Comme $${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`}-x$ s'annule en
                $${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`}$ et
                 $${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`}+x$ s'annule en $${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `-${extraireRacineCarree(d - c)[0]}` : `-\\sqrt{${d - c}}`}$, on obtient le tableau de signes${sp()}: <br>`

                texteCorr += tableauDeVariation({
                  tabInit: [
                    [
                      ['$x$', 2.5, 30],
                      [
                        `$${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`}+x$`,
                        2,
                        75,
                      ],
                      [
                        `$${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`}-x$`,
                        2,
                        75,
                      ],
                      ['$f(x)-g(x)$', 2, 200],
                    ],
                    [
                      '$-\\infty$',
                      30,
                      `$${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `-${extraireRacineCarree(d - c)[0]}` : `-\\sqrt{${d - c}}`}$`,
                      20,
                      `$${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`}$`,
                      20,
                      '$+\\infty$',
                      30,
                    ],
                  ],
                  tabLines: [ligne1, ligne2, ligne3],

                  espcl: 3.5,
                  deltacl: 0.8,
                  lgt: 10,
                })
                texteCorr += `<br> Comme $f(x)-g(x)>0$ pour $x\\in]${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `-${extraireRacineCarree(d - c)[0]}` : `-\\sqrt{${d - c}}`}\\,;\\,${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`}[$, $\\mathscr{C}_f$ est au-dessus de $\\mathscr{C}_g$ sur cet inetrvalle. <br>
                  $\\mathscr{C}_f$ est en dessous de $\\mathscr{C}_g$ sur $]-\\infty\\,;\\,${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `-${extraireRacineCarree(d - c)[0]}` : `-\\sqrt{${d - c}}`}[$ et sur $]${c - d === -1 || c - d === -4 || c - d === -9 || c - d === -16 ? `${extraireRacineCarree(d - c)[0]}` : `\\sqrt{${d - c}}`}\\,;\\,+\\infty [$.<br>${remarque}`
              }
            }
          } else {
            // position relative avec un poly degré 2 et une fonction affine (cas etude du signe de ax^2 +bx)
            if (!sousChoix[i]) {
              // sans question intermédiaire
              a = randint(-3, 3, 0)
              b = randint(-9, 9, 0)
              c = randint(-10, 10)
              d = randint(-10, 10, [0, b])
              texte = `Soient $f$ et $g$ deux fonctions définies sur $\\mathbb R$ respectivement par${sp()}: $f(x)=${reduirePolynomeDegre3(0, a, b, c)}$ et $g(x)=${reduireAxPlusB(d, c)}$. <br>
              On note $\\mathscr{C}_f$ et $\\mathscr{C}_g$ leur courbe représentative.<br>`
              texte +=
                'Étudier la position relative des deux courbes $\\mathscr{C}_f$ et $\\mathscr{C}_g$.'
              texteCorr = `La position relative des deux courbes est donnée par l'étude du signe de la différence${sp()}: $f(x)-g(x)$.<br>
            Plus précisément, si $f(x)-g(x)>0$, $\\mathscr{C}_f$ est au-dessus de $\\mathscr{C}_g$, sinon, $\\mathscr{C}_f$ est en dessous de $\\mathscr{C}_g$.<br>`
              texteCorr += `  Pour tout $x$ de $\\mathbb R$, <br>
              $\\begin{aligned}
              f(x) - g(x)&=(${reduirePolynomeDegre3(0, a, b, c)}) -(${reduireAxPlusB(d, c)})\\\\
              &=${reduirePolynomeDegre3(0, a, b, c)}${d > 0 ? '' : '+'}${reduireAxPlusB(-d, -c)}\\\\
              &=${reduirePolynomeDegre3(0, a, b - d, 0)}\\\\
              &=x(${rienSi1(a)}x${ecritureAlgebrique(b - d)})
              \\end{aligned}$<br>
             `
              if (a > 0 && (d - b) / a > 0) {
                ligne1 = [
                  'Line',
                  30,
                  '',
                  0,
                  '-',
                  20,
                  'z',
                  20,
                  '+',
                  20,
                  't',
                  20,
                  '+',
                  20,
                ]
                ligne2 = [
                  'Line',
                  30,
                  '',
                  0,
                  '-',
                  20,
                  't',
                  20,
                  '-',
                  20,
                  'z',
                  20,
                  '+',
                  20,
                ]
                ligne3 = [
                  'Line',
                  30,
                  '',
                  0,
                  '+',
                  20,
                  'z',
                  20,
                  '-',
                  20,
                  'z',
                  20,
                  '+',
                  20,
                ]
              } else if (a > 0 && (d - b) / a < 0) {
                ligne1 = [
                  'Line',
                  30,
                  '',
                  0,
                  '-',
                  20,
                  't',
                  20,
                  '-',
                  20,
                  'z',
                  20,
                  '+',
                  20,
                ]
                ligne2 = [
                  'Line',
                  30,
                  '',
                  0,
                  '-',
                  20,
                  'z',
                  20,
                  '+',
                  20,
                  't',
                  20,
                  '+',
                  20,
                ]
                ligne3 = [
                  'Line',
                  30,
                  '',
                  0,
                  '+',
                  20,
                  'z',
                  20,
                  '-',
                  20,
                  'z',
                  20,
                  '+',
                  20,
                ]
              } else if (a < 0 && (d - b) / a > 0) {
                ligne1 = [
                  'Line',
                  30,
                  '',
                  0,
                  '-',
                  20,
                  'z',
                  20,
                  '+',
                  20,
                  't',
                  20,
                  '+',
                  20,
                ]
                ligne2 = [
                  'Line',
                  30,
                  '',
                  0,
                  '+',
                  20,
                  't',
                  20,
                  '+',
                  20,
                  'z',
                  20,
                  '-',
                  20,
                ]
                ligne3 = [
                  'Line',
                  30,
                  '',
                  0,
                  '-',
                  20,
                  'z',
                  20,
                  '+',
                  20,
                  'z',
                  20,
                  '-',
                  20,
                ]
              } else {
                ligne1 = [
                  'Line',
                  30,
                  '',
                  0,
                  '-',
                  20,
                  't',
                  20,
                  '-',
                  20,
                  'z',
                  20,
                  '+',
                  20,
                ]
                ligne2 = [
                  'Line',
                  30,
                  '',
                  0,
                  '+',
                  20,
                  'z',
                  20,
                  '-',
                  20,
                  't',
                  20,
                  '-',
                  20,
                ]
                ligne3 = [
                  'Line',
                  30,
                  '',
                  0,
                  '-',
                  20,
                  'z',
                  20,
                  '+',
                  20,
                  'z',
                  20,
                  '-',
                  20,
                ]
              }

              texteCorr += `  $x$ s'annule en $0$ et $${rienSi1(a)}x${ecritureAlgebrique(b - d)}$ s'annule en $${texFractionReduite(d - b, a)}$.<br>
              On obtient le tableau de signes${sp()}: <br>`

              texteCorr += tableauDeVariation({
                tabInit: [
                  [
                    ['$x$', 2.5, 30],
                    ['$x$', 2, 75],
                    [`$${rienSi1(a)}x${ecritureAlgebrique(b - d)}$`, 2, 75],
                    ['$f(x)-g(x)$', 2, 200],
                  ],
                  [
                    '$-\\infty$',
                    30,
                    `$${(d - b) / a < 0 ? `${texFractionReduite(d - b, a)}` : '0'}$`,
                    20,
                    `$${(d - b) / a > 0 ? `${texFractionReduite(d - b, a)}` : '0'}$`,
                    20,
                    '$+\\infty$',
                    30,
                  ],
                ],
                tabLines: [ligne1, ligne2, ligne3],

                espcl: 3.5,
                deltacl: 0.8,
                lgt: 10,
              })
              if (a < 0) {
                texteCorr += `<br> Comme $f(x)-g(x)>0$ pour
              $x\\in\\left]${(d - b) / a < 0 ? `${texFractionReduite(d - b, a)}` : '0'} \\,;\\,
              ${(d - b) / a < 0 ? '0' : `${texFractionReduite(d - b, a)}`}\\right[$, $\\mathscr{C}_f$ est au-dessus de
                $\\mathscr{C}_g$ sur cet inetrvalle. <br>
                    $\\mathscr{C}_f$ est en dessous de $\\mathscr{C}_g$ sur $\\left]-\\infty\\,;\\,
                    ${(d - b) / a < 0 ? `${texFractionReduite(d - b, a)}` : '0'}\\right[$
                      et sur $\\left]${(d - b) / a < 0 ? '0' : `${texFractionReduite(d - b, a)}`}\\,;\\,+\\infty \\right[$.<br>${remarque}`
              } else {
                texteCorr += `<br> Comme $f(x)-g(x)<0$ pour
              $x\\in\\left]${(d - b) / a < 0 ? `${texFractionReduite(d - b, a)}` : '0'} \\,;\\,
              ${(d - b) / a < 0 ? '0' : `${texFractionReduite(d - b, a)}`}\\right[$, $\\mathscr{C}_f$ est en dessous de
                $\\mathscr{C}_g$ sur cet inetrvalle. <br>
                    $\\mathscr{C}_f$ est au-dessus de $\\mathscr{C}_g$ sur $\\left]-\\infty\\,;\\,
                    ${(d - b) / a < 0 ? `${texFractionReduite(d - b, a)}` : '0'}\\right[$
                      et sur $\\left]${(d - b) / a < 0 ? '0' : `${texFractionReduite(d - b, a)}`}\\,;\\,+\\infty \\right[$.<br>${remarque}`
              }
            } else {
              // avec question intermédiaire
              a = randint(-3, 3, 0)
              b = randint(-9, 9, 0)
              c = randint(-10, 10)
              d = randint(-10, 10, [0, b])
              texte = `Soient $f$ et $g$ deux fonctions définies sur $\\mathbb R$ respectivement par${sp()}: $f(x)=${reduirePolynomeDegre3(0, a, b, c)}$ et $g(x)=${reduireAxPlusB(d, c)}$. <br>
          On note $\\mathscr{C}_f$ et $\\mathscr{C}_g$ leur courbe représentative.<br>`
              texte += `${numAlpha(0)} Montrer que pour tout $x$ de $\\mathbb R$, $f(x) - g(x)=x(${rienSi1(a)}x${ecritureAlgebrique(b - d)})$.<br>`
              texte += `${numAlpha(1)} Étudier pour tout $x$ de $\\mathbb R$, le signe de $f(x)-g(x)$.<br>
      ${numAlpha(2)} Quelle interprétation graphique peut-on en donner${sp()}?`

              texteCorr = `${numAlpha(0)} Pour tout $x$ de $\\mathbb R$, <br>
          $\\begin{aligned}
          f(x) - g(x)&=(${reduirePolynomeDegre3(0, a, b, c)}) -(${reduireAxPlusB(d, c)})\\\\
          &=${reduirePolynomeDegre3(0, a, b, c)}${d > 0 ? '' : '+'}${reduireAxPlusB(-d, -c)}\\\\
          &=${reduirePolynomeDegre3(0, a, b - d, 0)}\\\\
          &=x(${rienSi1(a)}x${ecritureAlgebrique(b - d)})
          \\end{aligned}$<br>
         `
              if (a > 0 && (d - b) / a > 0) {
                ligne1 = [
                  'Line',
                  30,
                  '',
                  0,
                  '-',
                  20,
                  'z',
                  20,
                  '+',
                  20,
                  't',
                  20,
                  '+',
                  20,
                ]
                ligne2 = [
                  'Line',
                  30,
                  '',
                  0,
                  '-',
                  20,
                  't',
                  20,
                  '-',
                  20,
                  'z',
                  20,
                  '+',
                  20,
                ]
                ligne3 = [
                  'Line',
                  30,
                  '',
                  0,
                  '+',
                  20,
                  'z',
                  20,
                  '-',
                  20,
                  'z',
                  20,
                  '+',
                  20,
                ]
              } else if (a > 0 && (d - b) / a < 0) {
                ligne1 = [
                  'Line',
                  30,
                  '',
                  0,
                  '-',
                  20,
                  't',
                  20,
                  '-',
                  20,
                  'z',
                  20,
                  '+',
                  20,
                ]
                ligne2 = [
                  'Line',
                  30,
                  '',
                  0,
                  '-',
                  20,
                  'z',
                  20,
                  '+',
                  20,
                  't',
                  20,
                  '+',
                  20,
                ]
                ligne3 = [
                  'Line',
                  30,
                  '',
                  0,
                  '+',
                  20,
                  'z',
                  20,
                  '-',
                  20,
                  'z',
                  20,
                  '+',
                  20,
                ]
              } else if (a < 0 && (d - b) / a > 0) {
                ligne1 = [
                  'Line',
                  30,
                  '',
                  0,
                  '-',
                  20,
                  'z',
                  20,
                  '+',
                  20,
                  't',
                  20,
                  '+',
                  20,
                ]
                ligne2 = [
                  'Line',
                  30,
                  '',
                  0,
                  '+',
                  20,
                  't',
                  20,
                  '+',
                  20,
                  'z',
                  20,
                  '-',
                  20,
                ]
                ligne3 = [
                  'Line',
                  30,
                  '',
                  0,
                  '-',
                  20,
                  'z',
                  20,
                  '+',
                  20,
                  'z',
                  20,
                  '-',
                  20,
                ]
              } else {
                ligne1 = [
                  'Line',
                  30,
                  '',
                  0,
                  '-',
                  20,
                  't',
                  20,
                  '-',
                  20,
                  'z',
                  20,
                  '+',
                  20,
                ]
                ligne2 = [
                  'Line',
                  30,
                  '',
                  0,
                  '+',
                  20,
                  'z',
                  20,
                  '-',
                  20,
                  't',
                  20,
                  '-',
                  20,
                ]
                ligne3 = [
                  'Line',
                  30,
                  '',
                  0,
                  '-',
                  20,
                  'z',
                  20,
                  '+',
                  20,
                  'z',
                  20,
                  '-',
                  20,
                ]
              }

              texteCorr += ` ${numAlpha(1)} $x$ s'annule en $0$ et $${rienSi1(a)}x${ecritureAlgebrique(b - d)}$ s'annule en $${texFractionReduite(d - b, a)}$.<br>
          On obtient le tableau de signes${sp()}: <br>`

              texteCorr += tableauDeVariation({
                tabInit: [
                  [
                    ['$x$', 2.5, 30],
                    ['$x$', 2, 75],
                    [`$${rienSi1(a)}x${ecritureAlgebrique(b - d)}$`, 2, 75],
                    ['$f(x)-g(x)$', 2, 200],
                  ],
                  [
                    '$-\\infty$',
                    30,
                    `$${(d - b) / a < 0 ? `${texFractionReduite(d - b, a)}` : '0'}$`,
                    20,
                    `$${(d - b) / a > 0 ? `${texFractionReduite(d - b, a)}` : '0'}$`,
                    20,
                    '$+\\infty$',
                    30,
                  ],
                ],
                tabLines: [ligne1, ligne2, ligne3],

                espcl: 3.5,
                deltacl: 0.8,
                lgt: 10,
              })
              if (a < 0) {
                texteCorr += `<br>${numAlpha(2)} Comme $f(x)-g(x)>0$ pour
          $x\\in\\left]${(d - b) / a < 0 ? `${texFractionReduite(d - b, a)}` : '0'} \\,;\\,
          ${(d - b) / a < 0 ? '0' : `${texFractionReduite(d - b, a)}`}\\right[$, $\\mathscr{C}_f$ est au-dessus de
            $\\mathscr{C}_g$ sur cet inetrvalle. <br>
                $\\mathscr{C}_f$ est en dessous de $\\mathscr{C}_g$ sur $\\left]-\\infty\\,;\\,
                ${(d - b) / a < 0 ? `${texFractionReduite(d - b, a)}` : '0'}\\right[$
                  et sur $\\left]${(d - b) / a < 0 ? '0' : `${texFractionReduite(d - b, a)}`}\\,;\\,+\\infty \\right[$.<br>${remarque}`
              } else {
                texteCorr += `<br>${numAlpha(2)} Comme $f(x)-g(x)<0$ pour
          $x\\in\\left]${(d - b) / a < 0 ? `${texFractionReduite(d - b, a)}` : '0'} \\,;\\,
          ${(d - b) / a < 0 ? '0' : `${texFractionReduite(d - b, a)}`}\\right[$, $\\mathscr{C}_f$ est en dessous de
            $\\mathscr{C}_g$ sur cet inetrvalle. <br>
                $\\mathscr{C}_f$ est au-dessus de $\\mathscr{C}_g$ sur $\\left]-\\infty\\,;\\,
                ${(d - b) / a < 0 ? `${texFractionReduite(d - b, a)}` : '0'}\\right[$
                  et sur $\\left]${(d - b) / a < 0 ? '0' : `${texFractionReduite(d - b, a)}`}\\,;\\,+\\infty \\right[$.<br>${remarque}`
              }
            }
          }
        }
      }
      if (this.questionJamaisPosee(i, a, b, c, d)) {
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
