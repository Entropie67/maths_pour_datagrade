import { fixeBordures } from '../../lib/2d/fixeBordures'
import { Tableau } from '../../lib/2d/tableau'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { toutAUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import {
  AddTabPropMathlive,
  type Icell,
} from '../../lib/interactif/tableaux/AjouteTableauMathlive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { texFractionReduite } from '../../lib/outils/deprecatedFractions'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { lettreMinusculeDepuisChiffre } from '../../lib/outils/outilString'
import { pgcd } from '../../lib/outils/primalite'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { fraction } from '../../modules/fractions'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Compléter un tableau de valeurs'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const dateDeModifImportante = '20/02/2023'

/**
 * Déterminer l'image d'un nombre par une fonction d'après sa forme algébrique
 *
 * * Niveau 1 : Fonctions affines
 * * Niveau 2 : Polynôme du second degré
 * * Niveau 3 : Quotients de fonctions affines
 * * Niveau 4 : (ax+b)(cx+d)
 * * Niveau 5 : Mélange
 * @author Rémi Angot
 */
export const uuid = 'bfb2f'

export const refs = {
  'fr-fr': ['3F12-3', '2F14-1'],
  'fr-ch': ['1mF1-11', '10LCFA3B-3', '10LSFA3B-3', '11CTFA2A-3', 'PRQAL02B-4', 'PRQPF01B-1'],
}
export default class TableauDeValeurs extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      5,
      '1 : Fonctions affines\n2 : Polynôme du second degré\n3 : Quotient\n4 : Produit \n5 : Mélange',
    ]

    this.nbQuestions = 1

    this.sup = 5 // niveau de difficulté
    this.correctionDetailleeDisponible = true
  }

  nouvelleVersion() {
    this.spacing = this.interactif ? 2 : 1
    let typesDeQuestionsDisponibles = []
    if (this.sup === 1) {
      typesDeQuestionsDisponibles = ['ax+b', 'ax']
    } else if (this.sup === 2) {
      typesDeQuestionsDisponibles = ['ax2+bx+c', 'ax2+c', 'ax2+bx']
    } else if (this.sup === 3) {
      typesDeQuestionsDisponibles = ['a/cx+d', 'ax+b/cx+d']
    } else if (this.sup === 4) {
      typesDeQuestionsDisponibles = ['(ax+b)(cx+d)', '(ax+b)2']
    } else {
      typesDeQuestionsDisponibles = [
        'ax+b',
        'ax',
        'ax2+bx+c',
        'ax2+c',
        'ax2+bx',
        'a/cx+d',
        'ax+b/cx+d',
        '(ax+b)(cx+d)',
        '(ax+b)2',
      ]
    }
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posées mais l'ordre diffère à chaque "cycle"
    const listeDeX = combinaisonListes(
      [
        [-3, 0, 3],
        [-2, 0, 2],
        [1, 2, 5],
        [-3, 6, 9],
      ],
      this.nbQuestions,
    )
    for (
      let i = 0, texte, texteCorr, f, x1, x2, x3, nomdef, calculs = '', cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      let listeReponses: (number | FractionEtendue)[] = [] // : number[]
      let a = 0
      let b = 0
      let c = 0
      let d = 0
      let expression = ''
      nomdef = lettreMinusculeDepuisChiffre(6 + i) // on commence par f puis on continue dans l'ordre alphabétique
      x1 = listeDeX[i][0]
      x2 = listeDeX[i][1]
      x3 = listeDeX[i][2]
      switch (listeTypeDeQuestions[i]) {
        case 'ax+b':
          a = randint(-10, 10, [0, -1, 1])
          b = randint(-10, 10, [0])
          expression = `${a}x${ecritureAlgebrique(b)}`
          f = (x: number) => a * x + b
          calculs = `$${nomdef}(${x1})=${a}\\times${ecritureParentheseSiNegatif(x1)}${ecritureAlgebrique(b)}=${a * x1}${ecritureAlgebrique(b)}=${a * x1 + b}$<br>`
          calculs += `$${nomdef}(${x2})=${a}\\times${ecritureParentheseSiNegatif(x2)}${ecritureAlgebrique(b)}=${a * x2}${ecritureAlgebrique(b)}=${a * x2 + b}$<br>`
          calculs += `$${nomdef}(${x3})=${a}\\times${ecritureParentheseSiNegatif(x3)}${ecritureAlgebrique(b)}=${a * x3}${ecritureAlgebrique(b)}=${a * x3 + b}$<br>`
          listeReponses = [f(x1), f(x2), f(x3)]
          break
        case 'ax':
          a = randint(-10, 10, [0, -1, 1])
          expression = `${a}x`
          calculs = `$${nomdef}(${x1})=${a}\\times${ecritureParentheseSiNegatif(x1)}=${a * x1}$<br>`
          calculs += `$${nomdef}(${x2})=${a}\\times${ecritureParentheseSiNegatif(x2)}=${a * x2}$<br>`
          calculs += `$${nomdef}(${x3})=${a}\\times${ecritureParentheseSiNegatif(x3)}=${a * x3}$<br>`
          f = (x: number) => a * x
          listeReponses = [f(x1), f(x2), f(x3)]
          break
        case 'ax2+bx+c':
          a = randint(-3, 3, [0, -1, 1])
          b = randint(-5, 5, [0, -1, 1])
          c = randint(-10, 10, [0])
          expression = `${a}x^2${ecritureAlgebrique(b)}x${ecritureAlgebrique(c)}`
          calculs = `$${nomdef}(${x1})=${a}\\times${ecritureParentheseSiNegatif(x1)}^2${ecritureAlgebrique(b)}\\times${ecritureParentheseSiNegatif(x1)}${ecritureAlgebrique(c)}=${a}\\times${x1 ** 2}${ecritureAlgebrique(b * x1)}${ecritureAlgebrique(c)}=${a * x1 ** 2 + b * x1 + c}$<br>`
          calculs += `$${nomdef}(${x2})=${a}\\times${ecritureParentheseSiNegatif(x2)}^2${ecritureAlgebrique(b)}\\times${ecritureParentheseSiNegatif(x2)}${ecritureAlgebrique(c)}=${a}\\times${x2 ** 2}${ecritureAlgebrique(b * x2)}${ecritureAlgebrique(c)}=${a * x2 ** 2 + b * x2 + c}$<br>`
          calculs += `$${nomdef}(${x3})=${a}\\times${ecritureParentheseSiNegatif(x3)}^2${ecritureAlgebrique(b)}\\times${ecritureParentheseSiNegatif(x3)}${ecritureAlgebrique(c)}=${a}\\times${x3 ** 2}${ecritureAlgebrique(b * x3)}${ecritureAlgebrique(c)}=${a * x3 ** 2 + b * x3 + c}$<br>`
          f = (x: number) => a * x ** 2 + b * x + c
          listeReponses = [f(x1), f(x2), f(x3)]
          break
        case 'ax2+c':
          a = randint(-4, 4, [0, -1, 1])
          c = randint(-10, 10, [0])
          expression = `${a}x^2${ecritureAlgebrique(c)}`
          calculs = `$${nomdef}(${x1})=${a}\\times${ecritureParentheseSiNegatif(x1)}^2${ecritureAlgebrique(c)}=${a}\\times${x1 ** 2}${ecritureAlgebrique(c)}=${a * x1 ** 2 + c}$<br>`
          calculs += `$${nomdef}(${x2})=${a}\\times${ecritureParentheseSiNegatif(x2)}^2${ecritureAlgebrique(c)}=${a}\\times${x2 ** 2}${ecritureAlgebrique(c)}=${a * x2 ** 2 + c}$<br>`
          calculs += `$${nomdef}(${x3})=${a}\\times${ecritureParentheseSiNegatif(x3)}^2${ecritureAlgebrique(c)}=${a}\\times${x3 ** 2}${ecritureAlgebrique(c)}=${a * x3 ** 2 + c}$<br>`
          f = (x: number) => a * x ** 2 + c
          listeReponses = [f(x1), f(x2), f(x3)]
          break
        case 'ax2+bx':
          a = randint(-3, 3, [0, -1, 1])
          b = randint(-5, 5, [0, -1, 1])
          c = randint(-10, 10, [0])
          expression = `${a}x^2${ecritureAlgebrique(b)}x`
          calculs = `$${nomdef}(${x1})=${a}\\times${ecritureParentheseSiNegatif(x1)}^2${ecritureAlgebrique(b)}\\times${ecritureParentheseSiNegatif(x1)}=${a}\\times${x1 ** 2}${ecritureAlgebrique(b * x1)}=${a * x1 ** 2 + b * x1}$<br>`
          calculs += `$${nomdef}(${x2})=${a}\\times${ecritureParentheseSiNegatif(x2)}^2${ecritureAlgebrique(b)}\\times${ecritureParentheseSiNegatif(x2)}=${a}\\times${x2 ** 2}${ecritureAlgebrique(b * x2)}=${a * x2 ** 2 + b * x2}$<br>`
          calculs += `$${nomdef}(${x3})=${a}\\times${ecritureParentheseSiNegatif(x3)}^2${ecritureAlgebrique(b)}\\times${ecritureParentheseSiNegatif(x3)}=${a}\\times${x3 ** 2}${ecritureAlgebrique(b * x3)}=${a * x3 ** 2 + b * x3}$<br>`
          f = (x: number) => a * x ** 2 + b * x
          listeReponses = [f(x1), f(x2), f(x3)]
          break
        case 'a/cx+d':
          this.spacingCorr = 3
          a = randint(-10, 10, [0])
          c = randint(-10, 10, [0, -1, 1])
          d = randint(-10, 10, [0])
          while (c * x1 + d === 0 || c * x2 + d === 0 || c * x3 + d === 0) {
            c = randint(-10, 10, [0, -1, 1])
          }
          expression = `\\dfrac{${a}}{${c}x${ecritureAlgebrique(d)}}`
          calculs = `$${nomdef}(${x1})=\\dfrac{${a}}{${c}\\times${ecritureParentheseSiNegatif(x1)}${ecritureAlgebrique(d)}}=\\dfrac{${a}}{${c * x1}${ecritureAlgebrique(d)}}=${fraction(a, c * x1 + d).texFSD}`
          if (pgcd(a, c * x1 + d) === 1) {
            calculs += '$<br>'
          } else {
            calculs += '=' + texFractionReduite(a, c * x1 + d) + '$<br>'
          }
          calculs += `$${nomdef}(${x2})=\\dfrac{${a}}{${c}\\times${ecritureParentheseSiNegatif(x2)}${ecritureAlgebrique(d)}}=\\dfrac{${a}}{${c * x2}${ecritureAlgebrique(d)}}=${fraction(a, c * x2 + d).texFSD}`
          if (pgcd(a, c * x2 + d) === 1) {
            calculs += '$<br>'
          } else {
            calculs += '=' + texFractionReduite(a, c * x2 + d) + '$<br>'
          }
          calculs += `$${nomdef}(${x3})=\\dfrac{${a}}{${c}\\times${ecritureParentheseSiNegatif(x3)}${ecritureAlgebrique(d)}}=\\dfrac{${a}}{${c * x3}${ecritureAlgebrique(d)}}=${fraction(a, c * x3 + d).texFSD}`
          if (pgcd(a, c * x3 + d) === 1) {
            calculs += '$<br>'
          } else {
            calculs += '=' + texFractionReduite(a, c * x3 + d) + '$<br>'
          }
          f = (x: number) => a / (c * x + d)
          listeReponses = [
            fraction(a, c * x1 + d).simplifie(),
            fraction(a, c * x2 + d).simplifie(),
            fraction(a, c * x3 + d).simplifie(),
          ]
          break
        case 'ax+b/cx+d':
          this.spacingCorr = 3
          a = randint(-10, 10, [0, 1, -1])
          b = randint(-10, 10, [0])
          c = randint(-10, 10, [0, -1, 1])
          d = randint(-10, 10, [0])
          while (c * x1 + d === 0 || c * x2 + d === 0 || c * x3 + d === 0) {
            c = randint(-10, 10, [0, -1, 1])
          }
          expression = `\\dfrac{${a}x${ecritureAlgebrique(b)}}{${c}x${ecritureAlgebrique(d)}}`
          calculs = `$${nomdef}(${x1})=\\dfrac{${a}\\times${ecritureParentheseSiNegatif(x1)}${ecritureAlgebrique(b)}}{${c}\\times${ecritureParentheseSiNegatif(x1)}${ecritureAlgebrique(d)}}=\\dfrac{${a * x1}${ecritureAlgebrique(b)}}{${c * x1}${ecritureAlgebrique(d)}}=\\dfrac{${a * x1 + b}}{${c * x1 + d}}`
          if (pgcd(a * x1 + b, c * x1 + d) === 1) {
            calculs += '$<br>'
          } else {
            calculs +=
              '=' + texFractionReduite(a * x1 + b, c * x1 + d) + '$<br>'
          }
          calculs += `$${nomdef}(${x2})=\\dfrac{${a}\\times${ecritureParentheseSiNegatif(x2)}${ecritureAlgebrique(b)}}{${c}\\times${ecritureParentheseSiNegatif(x2)}${ecritureAlgebrique(d)}}=\\dfrac{${a * x2}${ecritureAlgebrique(b)}}{${c * x2}${ecritureAlgebrique(d)}}=\\dfrac{${a * x2 + b}}{${c * x2 + d}}`
          if (pgcd(a * x2 + b, c * x2 + d) === 1) {
            calculs += '$<br>'
          } else {
            calculs +=
              '=' + texFractionReduite(a * x2 + b, c * x2 + d) + '$<br>'
          }
          calculs += `$${nomdef}(${x3})=\\dfrac{${a}\\times${ecritureParentheseSiNegatif(x3)}${ecritureAlgebrique(b)}}{${c}\\times${ecritureParentheseSiNegatif(x3)}${ecritureAlgebrique(d)}}=\\dfrac{${a * x3}${ecritureAlgebrique(b)}}{${c * x3}${ecritureAlgebrique(d)}}=\\dfrac{${a * x3 + b}}{${c * x3 + d}}`
          if (pgcd(a * x3 + b, c * x3 + d) === 1) {
            calculs += '$<br>'
          } else {
            calculs +=
              '=' + texFractionReduite(a * x3 + b, c * x3 + d) + '$<br>'
          }
          f = (x: number) => (a * x + b) / (c * x + d)
          listeReponses = [
            fraction(a * x1 + b, c * x1 + d).simplifie(),
            fraction(a * x2 + b, c * x2 + d).simplifie(),
            fraction(a * x3 + b, c * x3 + d).simplifie(),
          ]
          break
        case '(ax+b)(cx+d)':
          a = randint(-5, 5, [0, 1, -1])
          b = randint(-5, 5, [0])
          c = randint(-3, 3, [0, -1, 1])
          d = randint(-3, 3, [0])
          if (a < 0 && b < 0 && c < 0 && d < 0) {
            d = randint(1, 3)
          }
          expression = `(${a}x${ecritureAlgebrique(b)})(${c}x${ecritureAlgebrique(d)})`
          calculs = `$${nomdef}(${x1})=\\left(${a}\\times${ecritureParentheseSiNegatif(x1)}${ecritureAlgebrique(b)}\\right)\\left(${c}\\times${ecritureParentheseSiNegatif(x1)}${ecritureAlgebrique(d)}\\right)=(${a * x1}${ecritureAlgebrique(b)})(${c * x1}${ecritureAlgebrique(d)})=${a * x1 + b}\\times ${ecritureParentheseSiNegatif(c * x1 + d)}=${(a * x1 + b) * (c * x1 + d)}$<br>`
          calculs += `$${nomdef}(${x2})=\\left(${a}\\times${ecritureParentheseSiNegatif(x2)}${ecritureAlgebrique(b)}\\right)\\left(${c}\\times${ecritureParentheseSiNegatif(x2)}${ecritureAlgebrique(d)}\\right)=(${a * x2}${ecritureAlgebrique(b)})(${c * x2}${ecritureAlgebrique(d)})=${a * x2 + b}\\times ${ecritureParentheseSiNegatif(c * x2 + d)}=${(a * x2 + b) * (c * x2 + d)}$<br>`
          calculs += `$${nomdef}(${x3})=\\left(${a}\\times${ecritureParentheseSiNegatif(x3)}${ecritureAlgebrique(b)}\\right)\\left(${c}\\times${ecritureParentheseSiNegatif(x3)}${ecritureAlgebrique(d)}\\right)=(${a * x3}${ecritureAlgebrique(b)})(${c * x3}${ecritureAlgebrique(d)})=${a * x3 + b}\\times ${ecritureParentheseSiNegatif(c * x3 + d)}=${(a * x3 + b) * (c * x3 + d)}$<br>`
          f = (x: number) => (a * x + b) * (c * x + d)
          listeReponses = [f(x1), f(x2), f(x3)]
          break
        case '(ax+b)2':
          a = randint(-3, 3, [0, 1, -1])
          b = randint(-3, 3, [0])
          expression = `(${a}x${ecritureAlgebrique(b)})^2`
          calculs = `$${nomdef}(${x1})=\\left(${a}\\times${ecritureParentheseSiNegatif(x1)}${ecritureAlgebrique(b)}\\right)^2=(${a * x1}${ecritureAlgebrique(b)})^2=${ecritureParentheseSiNegatif(a * x1 + b)}^2=${(a * x1 + b) ** 2}$<br>`
          calculs += `$${nomdef}(${x2})=\\left(${a}\\times${ecritureParentheseSiNegatif(x2)}${ecritureAlgebrique(b)}\\right)^2=(${a * x2}${ecritureAlgebrique(b)})^2=${ecritureParentheseSiNegatif(a * x2 + b)}^2=${(a * x2 + b) ** 2}$<br>`
          calculs += `$${nomdef}(${x3})=\\left(${a}\\times${ecritureParentheseSiNegatif(x3)}${ecritureAlgebrique(b)}\\right)^2=(${a * x3}${ecritureAlgebrique(b)})^2=${ecritureParentheseSiNegatif(a * x3 + b)}^2=${(a * x3 + b) ** 2}$<br>`
          f = (x: number) => (a * x + b) ** 2
          listeReponses = [f(x1), f(x2), f(x3)]
          break
      }
      const yGrecs = listeReponses.map((el) =>
        el instanceof FractionEtendue
          ? el.texFractionSimplifiee
          : texNombre(el, 1),
      )
      texte = `On considère la fonction $${nomdef}$ définie par $${nomdef}:x\\mapsto ${expression}$. ${this.interactif ? `<br>Calculer les images par $${nomdef}$ suivantes.` : '<br>Compléter le tableau de valeurs suivant.<br><br>'}`
      const ligne1: Icell[] = [
        { texte: 'x', gras: true, color: 'black', latex: true },
      ].concat(
        [x1, x2, x3].map((el) =>
          Object.assign(
            {},
            {
              texte: texNombre(el, 1),
              gras: false,
              color: 'black',
              latex: true,
            },
          ),
        ),
      )
      const ligne2: Icell[] = [
        { texte: `${nomdef}(x)`, gras: true, color: 'black', latex: true },
      ].concat(
        yGrecs.map((el) =>
          Object.assign(
            {},
            {
              texte: miseEnEvidence(el),
              gras: false,
              color: 'black',
              latex: true,
            },
          ),
        ),
      )
      const ligne2bis: Icell[] = [
        { texte: `${nomdef}(x)`, gras: true, color: 'black', latex: true },
      ].concat(
        listeReponses.map(() =>
          Object.assign(
            {},
            { texte: '', gras: false, color: 'black', latex: true },
          ),
        ),
      )

      if (context.isHtml) {
        const tabMathlive = AddTabPropMathlive.create(
          this.numeroExercice ?? 0,
          i,
          { ligne1, ligne2: ligne2bis, nbColonnes: 4 },
          KeyboardType.clavierDeBaseAvecFraction ?? 'clavierDeBaseAvecFraction',
          this.interactif,
          {},
        )
        texte += '<br>' + tabMathlive.output
      } else {
        const tableauVideForLatex = new Tableau({
          ligne1: ['x']
            .concat([x1, x2, x3].map(String))
            .map((el) => Object.assign({}, { texte: el, latex: true })),
          ligne2: [`${nomdef}(x)`, '', '', ''].map((el) =>
            el === ''
              ? Object.assign({}, { texte: el })
              : Object.assign({}, { texte: el, latex: true }),
          ),
          largeurTitre: 1,
          nbColonnes: 4,
          hauteur: 1,
          largeur: 1,
        })
        const tabVideTex = mathalea2d(
          Object.assign({}, fixeBordures([tableauVideForLatex])),
          tableauVideForLatex,
        )
        texte += tabVideTex
      }
      const tableauValeur = AddTabPropMathlive.create(
        this.numeroExercice ?? 0,
        i,
        { ligne1, ligne2, nbColonnes: 4 },
        String(KeyboardType.clavierDeBaseAvecFraction),
        false,
        {},
      )

      const tableauValeursForLatex = new Tableau({
        ligne1: ['x']
          .concat([x1, x2, x3].map(String))
          .map((el) => Object.assign({}, { texte: el, latex: true })),
        ligne2: ['f(x)', ...yGrecs].map((el, index) =>
          el === ''
            ? Object.assign({}, { texte: '' })
            : Object.assign(
                {},
                {
                  texte: index === 0 ? el : miseEnEvidence(el.toString()),
                  latex: true,
                },
              ),
        ),
        largeurTitre: 1,
        nbColonnes: 4,
        hauteur: 1,
        largeur: 1,
      })
      const tabValeurTex = mathalea2d(
        Object.assign({}, fixeBordures([tableauValeursForLatex])),
        tableauValeursForLatex,
      )
      texteCorr = context.isHtml ? tableauValeur.output : tabValeurTex

      if (context.isAmc) {
        this.autoCorrectionAMC[i] = {
          enonce: `On considère la fonction $${nomdef}$ définie par $${nomdef}:x\\mapsto ${expression}$.\\\\ \n
          Calculer :\\\\ \na) $f(${x1})$\\\\ \nb) $f(${x2})$\\\\ \nc) $f(${x3})$\\\\ \n
          Utiliser le cadre pour les calculs si besoin puis coder les réponses.\\\\`,
          propositions: [
            {
              type: 'AMCOpen',
              propositions: [
                {
                  texte: '',
                  statut: 4,
                },
              ],
            },
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: calculs.split('<br>')[0],
                  statut: '',
                  reponse: {
                    texte: `a) $f(${x1})$`,
                    valeur: !(listeReponses[0] instanceof FractionEtendue)
                      ? listeReponses[0]
                      : listeReponses[0].d === 1
                        ? listeReponses[0].num
                        : listeReponses[0],
                    param: {
                      signe: true,
                      approx: 0,
                      decimals: 1,
                      digits: 2,
                    },
                  },
                },
              ],
            },
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: calculs.split('<br>')[1],
                  statut: '',
                  reponse: {
                    texte: `b) $f(${x2})$`,
                    valeur: !(listeReponses[1] instanceof FractionEtendue)
                      ? listeReponses[1]
                      : listeReponses[1].d === 1
                        ? listeReponses[1].num
                        : listeReponses[1],
                    param: {
                      signe: true,
                      approx: 0,
                      decimals: 1,
                      digits: 2,
                      /* formatInteractif: !(
                        listeReponses[1] instanceof FractionEtendue
                      )
                        ? 'calcul'
                        : listeReponses[1].d === 1
                          ? 'calcul'
                          : 'fractionEgale', */
                    },
                  },
                },
              ],
            },
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: calculs.split('<br>')[2],
                  statut: '',
                  reponse: {
                    texte: `c) $f(${x3})$`,
                    valeur: !(listeReponses[2] instanceof FractionEtendue)
                      ? listeReponses[2] // number
                      : listeReponses[2].d === 1
                        ? listeReponses[2].num // number
                        : listeReponses[2], // [listeReponses[2].type !== 'FractionEtendue' ? listeReponses[2] : listeReponses[2].d === 1 ? listeReponses[2].num : listeReponses[2]],
                    param: {
                      signe: true,
                      approx: 0,
                      decimals: 1,
                      digits: 2,
                    },
                  },
                },
              ],
            },
          ],
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      } else if (this.interactif) {
        const reponses = []
        for (let j = 0; j < 3; j++) {
          reponses.push([
            `L1C${j + 1}`,
            {
              value: listeReponses[j],
              options: { fractionEgale: true },
            },
          ])
        }
        reponses.push(['bareme', toutAUnPoint])
        handleAnswers(this, i, Object.fromEntries(reponses))
      }

      if (this.correctionDetaillee) {
        // EE : Permet en quelques lignes de mettre toutes les réponses attendues en couleur
        const chaqueLigneDeCalcul = calculs.split('<br>')
        const tabDesCalculs = []
        let aMettreEnCouleur, splitChaqueCalcul
        for (let ee = 0; ee < 3; ee++) {
          aMettreEnCouleur =
            miseEnEvidence(
              (chaqueLigneDeCalcul[ee].split('=').pop() as string).replaceAll(
                '$',
                '',
              ),
            ) + '$'
          splitChaqueCalcul = chaqueLigneDeCalcul[ee].split('=')
          tabDesCalculs[ee] = ''
          for (let ii = 0; ii < splitChaqueCalcul.length - 1; ii++) {
            tabDesCalculs[ee] += splitChaqueCalcul[ii] + '='
          }
          tabDesCalculs[ee] += aMettreEnCouleur + '<br>'
        }
        calculs = ''
        for (let ee = 0; ee < 3; ee++) calculs += tabDesCalculs[ee]
        // Fin de le mise en couleur

        texteCorr += '<br>'
        texteCorr += calculs
      }

      if (
        this.questionJamaisPosee(
          i,
          a,
          b,
          c,
          d,
          /* f */ expression,
          listeTypeDeQuestions[i],
        )
      ) {
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
