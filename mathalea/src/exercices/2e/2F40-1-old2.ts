// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 05b53 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { context } from '../../modules/context'
import { courbe } from '../../lib/2d/Courbe'
import { courbeInterpolee } from '../../lib/2d/CourbeInterpolee.1'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { latex2d } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import {
  tableauDeVariation,
  tableauVariationsFonction,
} from '../../lib/mathFonctions/etudeFonction'
import { choice } from '../../lib/outils/arrayOutils'
import { ecritureAlgebrique, rienSi1 } from '../../lib/outils/ecritures'
import { texNombre } from '../../lib/outils/texNombre'
import type FractionEtendue from '../../modules/FractionEtendue'
import { mathalea2d } from '../../modules/mathalea2d'

import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
import { bleuMathalea } from '../../lib/colors'

export const titre = "Dresser un tableau de variations à partir d'une courbe"
export const dateDePublication = '14/02/2023'
export const dateDeModifImportante = '28/02/2025'
/**
 * Lintage et typage incomplet à cause de tableauDeVariation qui est mal typé
 * @author Gilles Mora

 */
export const uuid = '05b53'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class VariationsCourbeOld2 extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.sup = 1
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets  :',
        '1 : Intervalle borné',
        '2 : Intervalle non borné à gauche ou à droite',
        '3 : Sur R',
        '4 : Fonction avec valeur interdite',
        '0: Mélange',
      ].join('\n'),
    ]
  }

  nouvelleVersion() {
    const margeHauteNomCourbe = 0.45

    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 4,
      melange: 0,
      defaut: 0,
      nbQuestions: this.nbQuestions,
    }).map(Number)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      const nomF = choice([['f'], ['g'], ['h'], ['u'], ['v'], ['w']])
      const nom = choice(nomF)
      let texte = ''
      let texteCorr = ''
      let choix
      let fonction // La fonction étudiée
      let derivee // Sa dérivée
      let xMin // La borne gauche de l'intervalle d'étude (prévoir une valeur de remplacement pour les infinis + et -)
      let xMax // La borne droite de l'intervalle d'étude
      let substituts = [] // les valeur de substitution pour xMin ou xMax...
      let tolerance // la tolérance doit être réglée au cas par cas, car pour la dérivée de 1/x entre 17 et 19 par exemple, il y a trop peu de différence avec zéro !
      this.consigne = `Dresser ${this.nbQuestions === 1 ? 'le tableau ' : 'les tableaux '}  de variations ${this.nbQuestions === 1 ? 'de la fonction dont on donne la représentation graphique.` ' : 'des  fonctions dont on donne les représentations graphiques.'}`
      const variables: number[] = []
      switch (listeTypeDeQuestions[i]) {
        case 1:
          choix = randint(1, 6)
          if (choix === 1) {
            // croissante, décroissante
            const x0 = randint(-6, -3)
            const y0 = randint(-4, -2)
            const x1 = randint(-2, 2)
            const y1 = randint(-1, 5) // max de y
            const x2 = randint(4, 5)
            const y2 = y1 - randint(1, 4)
            const A0 = pointAbstrait(x0, y0)
            const A1 = pointAbstrait(x1, y1)
            const A2 = pointAbstrait(x2, y2)
            const Tk = tracePoint(A0, A1, A2)
            Tk.epaisseur = 1

            const o = latex2d('\\text{O}', -0.3, -0.3, {
              letterSize: 'scriptsize',
            })
            const r1 = repere({
              xMin: x0 - 1,
              yMin: Math.min(y2 - 1, y0 - 1),
              yMax: y1 + 2,
              xMax: Math.max(4, x2 + 1),
              xUnite: 1,
              yUnite: 1,
              xThickDistance: 1,
              yThickDistance: 1,
              xLabelMin: x0,
              yLabelMin: y0,
              yLabelEcart: 0.6,
              grilleXDistance: 1,
              grilleYDistance: 1,
              grilleXMin: x0 - 1,
              grilleYMin: Math.min(y0 - 1, y2 - 1),
              grilleXMax: 6,
              grilleYMax: y1 + 2,
            })
            const nomC = latex2d(`C_{${nomF}}`, x0 + 0.7, y0 + 1, {
              color: bleuMathalea,
              letterSize: 'normalsize',
            })
            const gr = courbeInterpolee(
              [
                [x0, y0],
                [x1, y1],
                [x2, y2],
              ],
              {
                color: bleuMathalea,
                epaisseur: 2,
                repere: r1,
                xMin: x0 - 1,
                xMax: 6,
              },
            )
            const graphique = mathalea2d(
              {
                xmin: x0 - 1,
                xmax: 6,
                ymin: Math.min(y0 - 1, y2 - 1),
                ymax: y1 + 2 + margeHauteNomCourbe,
                pixelsParCm: 30,
                scale: 0.6,
                center: !context.isHtml,
              },
              r1,
              o,
              gr,
              Tk,
              nomC,
            )

            texte = `${graphique}`

            texteCorr = `La fonction $${nom}$ est définie sur $[${x0}\\,;\\,${x2}]$.<br>
            Son tableau de variations est : <br><br>`
            texteCorr +=
              tableauDeVariation({
                tabInit: [
                  [
                    // Première colonne du tableau avec le format [chaine d'entête, hauteur de ligne, nombre de pixels de largeur estimée du texte pour le centrage]
                    ['$x$', 1.5, 10],
                    [`$${nom}(x)$`, 4, 30],
                  ],
                  // Première ligne du tableau avec chaque antécédent suivi de son nombre de pixels de largeur estimée du texte pour le centrage
                  [`$${x0}$`, 10, `$${x1}$`, 10, `$${x2}$`, 10],
                ],
                // tabLines ci-dessous contient les autres lignes du tableau.
                tabLines: [
                  [
                    'Var',
                    10,
                    `-/$${y0}$`,
                    10,
                    `+/$${y1}$`,
                    10,
                    `-/$${y2}$`,
                    10,
                  ],
                ],
                espcl: 4, // taille en cm entre deux antécédents
                deltacl: 1, // distance entre la bordure et les premiers et derniers antécédents
                lgt: 2.5, // taille de la première colonne en cm
                hauteurLignes: [15, 15],
              }) + '<br>'

            variables.push(x0, x1, x2, y0, y1, y2)
          } else if (choix === 2) {
            // décroissante, croissante
            const x0 = randint(-6, -3)
            const y0 = randint(2, 4)
            const x1 = randint(-2, 2)
            const y1 = randint(-5, 1) // min de y
            const x2 = randint(4, 5)
            const y2 = y1 + randint(1, 4)
            const A0 = pointAbstrait(x0, y0)
            const A1 = pointAbstrait(x1, y1)
            const A2 = pointAbstrait(x2, y2)
            const Tk = tracePoint(A0, A1, A2)
            Tk.epaisseur = 1
            const nom = choice(nomF)
            const o = latex2d('\\text{O}', -0.3, -0.3, {
              letterSize: 'scriptsize',
            })
            const nomC = latex2d(`C_{${nomF}}`, x0 + 0.4, y0 + 1, {
              color: bleuMathalea,
              letterSize: 'normalsize',
            })
            const r1 = repere({
              xMin: x0 - 1,
              yMin: y1 - 2,
              yMax: Math.max(y2 + 1, y0 + 1),
              xMax: 6,
              xUnite: 1,
              yUnite: 1,
              xThickDistance: 1,
              yThickDistance: 1,
              xLabelMin: x0,
              yLabelMin: y1 - 1,
              yLabelEcart: 0.6,
              grilleXDistance: 1,
              grilleYDistance: 1,
              grilleXMin: x0 - 1,
              grilleYMin: y1 - 2,
              grilleXMax: 6,
              grilleYMax: Math.max(y2 + 1, y0 + 1),
            })
            const gr = courbeInterpolee(
              [
                [x0, y0],
                [x1, y1],
                [x2, y2],
              ],
              {
                color: bleuMathalea,
                epaisseur: 2,
                repere: r1,
                xMin: x0 - 1,
                xMax: 6,
              },
            )
            const graphique = mathalea2d(
              {
                xmin: x0 - 1,
                xmax: 6,
                ymin: y1 - 2,
                ymax: Math.max(y2 + 1, y0 + 1) + margeHauteNomCourbe,
                pixelsParCm: 30,
                scale: 0.6,
                center: !context.isHtml,
              },
              r1,
              o,
              gr,
              Tk,
              nomC,
            )

            texte = `${graphique}`

            texteCorr = `La fonction $${nom}$ est définie sur $[${x0}\\,;\\,${x2}]$.<br>
        Son tableau de variations est : <br><br>`
            texteCorr +=
              tableauDeVariation({
                tabInit: [
                  [
                    // Première colonne du tableau avec le format [chaine d'entête, hauteur de ligne, nombre de pixels de largeur estimée du texte pour le centrage]
                    ['$x$', 1.5, 10],
                    [`$${nom}(x)$`, 4, 30],
                  ],
                  // Première ligne du tableau avec chaque antécédent suivi de son nombre de pixels de largeur estimée du texte pour le centrage
                  [`$${x0}$`, 10, `$${x1}$`, 10, `$${x2}$`, 10],
                ],
                // tabLines ci-dessous contient les autres lignes du tableau.
                tabLines: [
                  [
                    'Var',
                    10,
                    `+/$${y0}$`,
                    10,
                    `-/$${y1}$`,
                    10,
                    `+/$${y2}$`,
                    10,
                  ],
                ],
                espcl: 4, // taille en cm entre deux antécédents
                deltacl: 1, // distance entre la bordure et les premiers et derniers antécédents
                lgt: 3, // taille de la première colonne en cm
                hauteurLignes: [15, 15],
              }) + '<br>'
            variables.push(x0, x1, x2, y0, y1, y2)
          } else if (choix === 3) {
            // décroissante, croissante, décroissante
            const x0 = randint(-6, -4)
            const y0 = randint(3, 5)
            const x1 = randint(-2, 1)
            const y1 = y0 - randint(5, 8)
            const x2 = randint(3, 4)
            const y2 = y1 + randint(2, 7)
            const x3 = randint(5, 6)
            const y3 = y2 - randint(1, 4)
            const A0 = pointAbstrait(x0, y0)
            const A1 = pointAbstrait(x1, y1)
            const A2 = pointAbstrait(x2, y2)
            const A3 = pointAbstrait(x3, y3)
            const Tk = tracePoint(A0, A1, A2, A3)
            Tk.epaisseur = 1
            const nom = choice(nomF)
            const o = latex2d('\\text{O}', -0.3, -0.3, {
              letterSize: 'scriptsize',
            })
            const nomC = latex2d(`C_{${nomF}}`, x0 + 0.4, y0 + 0.7, {
              color: bleuMathalea,
              letterSize: 'normalsize',
            })
            const r1 = repere({
              xMin: x0 - 1,
              yMin: Math.min(y1 - 1, y3 - 1),
              yMax: Math.max(y2 + 1, y0 + 1),
              xMax: 7,
              xUnite: 1,
              yUnite: 1,
              xThickDistance: 1,
              yThickDistance: 1,
              xLabelMin: x0,
              yLabelMin: y1 - 1,
              yLabelEcart: 0.6,
              grilleXDistance: 1,
              grilleYDistance: 1,
              grilleXMin: x0 - 1,
              grilleYMin: Math.min(y1 - 1, y3 - 1),
              grilleXMax: 7,
              grilleYMax: Math.max(y2 + 1, y0 + 1),
            })
            const gr = courbeInterpolee(
              [
                [x0, y0],
                [x1, y1],
                [x2, y2],
                [x3, y3],
              ],
              {
                color: bleuMathalea,
                epaisseur: 2,
                repere: r1,
                xMin: x0 - 1,
                xMax: 6,
              },
            )
            const graphique = mathalea2d(
              {
                xmin: x0 - 1,
                xmax: 7,
                ymin: Math.min(y1 - 1, y3 - 1),
                ymax: Math.max(y2 + 1, y0 + 1) + margeHauteNomCourbe,
                pixelsParCm: 30,
                scale: 0.6,
                center: !context.isHtml,
              },
              r1,
              o,
              gr,
              Tk,
              nomC,
            )
            texte = `${graphique}`

            texteCorr = `La fonction $${nom}$ est définie sur $[${x0}\\,;\\,${x3}]$.<br>
        Son tableau de variations est : <br><br>`
            texteCorr +=
              tableauDeVariation({
                tabInit: [
                  [
                    // Première colonne du tableau avec le format [chaine d'entête, hauteur de ligne, nombre de pixels de largeur estimée du texte pour le centrage]
                    ['$x$', 1.5, 10],
                    [`$${nom}(x)$`, 4, 30],
                  ],
                  // Première ligne du tableau avec chaque antécédent suivi de son nombre de pixels de largeur estimée du texte pour le centrage
                  [`$${x0}$`, 10, `$${x1}$`, 10, `$${x2}$`, 10, `$${x3}$`, 10],
                ],
                // tabLines ci-dessous contient les autres lignes du tableau.
                tabLines: [
                  [
                    'Var',
                    10,
                    `+/$${y0}$`,
                    10,
                    `-/$${y1}$`,
                    10,
                    `+/$${y2}$`,
                    10,
                    `-/$${y3}$`,
                    10,
                  ],
                ],
                espcl: 4, // taille en cm entre deux antécédents
                deltacl: 1, // distance entre la bordure et les premiers et derniers antécédents
                lgt: 3, // taille de la première colonne en cm
                hauteurLignes: [15, 15],
              }) + '<br>'
            variables.push(x0, x1, x2, x3, y0, y1, y2, y3)
          } else if (choix === 4) {
            // croissante, décroissante, croissante
            const x0 = randint(-6, -5)
            const y0 = randint(-5, -3)
            const x1 = randint(-3, 2)
            const y1 = y0 + randint(5, 8)
            const x2 = randint(4, 5)
            const y2 = y1 - randint(2, 7)
            const x3 = randint(7, 9)
            const y3 = y2 + randint(1, 4)
            const A0 = pointAbstrait(x0, y0)
            const A1 = pointAbstrait(x1, y1)
            const A2 = pointAbstrait(x2, y2)
            const A3 = pointAbstrait(x3, y3)
            const Tk = tracePoint(A0, A1, A2, A3)
            Tk.epaisseur = 1
            const nom = choice(nomF)
            const o = latex2d('\\text{O}', -0.3, -0.3, {
              letterSize: 'scriptsize',
            })
            const nomC = latex2d(`C_{${nomF}}`, x0 + 0.4, y0 + 0.7, {
              color: bleuMathalea,
              letterSize: 'normalsize',
            })
            const r1 = repere({
              xMin: x0 - 1,
              yMin: Math.min(y2 - 1, y0 - 1),
              yMax: Math.max(y1 + 1, y3 + 1),
              xMax: x3 + 1,
              xUnite: 1,
              yUnite: 1,
              xThickDistance: 1,
              yThickDistance: 1,
              xLabelMin: x0,
              yLabelMin: Math.min(y2 - 1, y0 - 1) + 1,
              yLabelEcart: 0.6,
              grilleXDistance: 1,
              grilleYDistance: 1,
              grilleXMin: x0 - 1,
              grilleYMin: Math.min(y2 - 1, y0 - 1),
              grilleXMax: x3 + 1,
              grilleYMax: Math.max(y1 + 1, y3 + 1),
            })
            const gr = courbeInterpolee(
              [
                [x0, y0],
                [x1, y1],
                [x2, y2],
                [x3, y3],
              ],
              {
                color: bleuMathalea,
                epaisseur: 2,
                repere: r1,
                xMin: x0 - 1,
                xMax: x3 + 1,
              },
            )
            const graphique = mathalea2d(
              {
                xmin: x0 - 1,
                xmax: x3 + 1,
                ymin: Math.min(y2 - 1, y0 - 1),
                ymax: Math.max(y1 + 1, y3 + 1) + margeHauteNomCourbe,
                pixelsParCm: 30,
                scale: 0.5,
                center: !context.isHtml,
              },
              r1,
              o,
              gr,
              Tk,
              nomC,
            )
            texte = `${graphique}`

            texteCorr = `La fonction $${nom}$ est définie sur $[${x0}\\,;\\,${x3}]$.<br>
        Son tableau de variations est : <br><br>`
            texteCorr +=
              tableauDeVariation({
                tabInit: [
                  [
                    // Première colonne du tableau avec le format [chaine d'entête, hauteur de ligne, nombre de pixels de largeur estimée du texte pour le centrage]
                    ['$x$', 1.5, 10],
                    [`$${nom}(x)$`, 4, 30],
                  ],
                  // Première ligne du tableau avec chaque antécédent suivi de son nombre de pixels de largeur estimée du texte pour le centrage
                  [`$${x0}$`, 10, `$${x1}$`, 10, `$${x2}$`, 10, `$${x3}$`, 10],
                ],
                // tabLines ci-dessous contient les autres lignes du tableau.
                tabLines: [
                  [
                    'Var',
                    10,
                    `-/$${y0}$`,
                    10,
                    `+/$${y1}$`,
                    10,
                    `-/$${y2}$`,
                    10,
                    `+/$${y3}$`,
                    10,
                  ],
                ],
                espcl: 4, // taille en cm entre deux antécédents
                deltacl: 1, // distance entre la bordure et les premiers et derniers antécédents
                lgt: 3, // taille de la première colonne en cm
                hauteurLignes: [15, 15],
              }) + '<br>'
            variables.push(x0, x1, x2, x3, y0, y1, y2, y3)
          } else if (choix === 6) {
            // croissante, décroissante, croissante, décroissante
            const x0 = randint(-6, -5)
            const y0 = randint(-5, -3)
            const x1 = randint(-3, -1)
            const y1 = y0 + randint(5, 8)
            const x2 = randint(1, 3)
            const y2 = y1 - randint(2, 7)
            const x3 = randint(4, 6)
            const y3 = y2 + randint(1, 4)
            const x4 = randint(7, 9)
            const y4 = y3 - randint(1, 4)
            const A0 = pointAbstrait(x0, y0)
            const A1 = pointAbstrait(x1, y1)
            const A2 = pointAbstrait(x2, y2)
            const A3 = pointAbstrait(x3, y3)
            const A4 = pointAbstrait(x4, y4)
            const Tk = tracePoint(A0, A1, A2, A3, A4)
            Tk.epaisseur = 1
            const nom = choice(nomF)
            const o = latex2d('\\text{O}', -0.3, -0.3, {
              letterSize: 'scriptsize',
            })
            const nomC = latex2d(`C_{${nomF}}`, x0 + 0.4, y0 + 0.7, {
              color: bleuMathalea,
              letterSize: 'normalsize',
            })
            const r1 = repere({
              xMin: x0 - 1,
              yMin: Math.min(y2 - 1, y0 - 1, y4 - 1),
              yMax: Math.max(y1 + 1, y3 + 1),
              xMax: x4 + 1,
              xUnite: 1,
              yUnite: 1,
              xThickDistance: 1,
              yThickDistance: 1,
              xLabelMin: x0,
              yLabelMin: Math.min(y2 - 1, y0 - 1, y4 - 1) + 1,
              yLabelEcart: 0.6,
              grilleXDistance: 1,
              grilleYDistance: 1,
              grilleXMin: x0 - 1,
              grilleYMin: Math.min(y2 - 1, y0 - 1, y4 - 1),
              grilleXMax: x4 + 1,
              grilleYMax: Math.max(y1 + 1, y3 + 1),
            })
            const gr = courbeInterpolee(
              [
                [x0, y0],
                [x1, y1],
                [x2, y2],
                [x3, y3],
                [x4, y4],
              ],
              {
                color: bleuMathalea,
                epaisseur: 2,
                repere: r1,
                xMin: x0 - 1,
                xMax: x4 + 1,
              },
            )
            const graphique = mathalea2d(
              {
                xmin: x0 - 1,
                xmax: x4 + 1,
                ymin: Math.min(y2 - 1, y0 - 1, y4 - 1),
                ymax: Math.max(y1 + 1, y3 + 1) + margeHauteNomCourbe,
                pixelsParCm: 25,
                scale: 0.5,
                center: !context.isHtml,
              },
              r1,
              o,
              gr,
              Tk,
              nomC,
            )
            texte = `${graphique}`

            texteCorr = `La fonction $${nom}$ est définie sur $[${x0}\\,;\\,${x4}]$.<br>
        Son tableau de variations est : <br><br>`
            texteCorr +=
              tableauDeVariation({
                tabInit: [
                  [
                    ['$x$', 1.5, 10],
                    [`$${nom}(x)$`, 4, 30],
                  ],
                  [
                    `$${x0}$`,
                    10,
                    `$${x1}$`,
                    10,
                    `$${x2}$`,
                    10,
                    `$${x3}$`,
                    10,
                    `$${x4}$`,
                    10,
                  ],
                ],
                tabLines: [
                  [
                    'Var',
                    10,
                    `-/$${y0}$`,
                    10,
                    `+/$${y1}$`,
                    10,
                    `-/$${y2}$`,
                    10,
                    `+/$${y3}$`,
                    10,
                    `-/$${y4}$`,
                    10,
                  ],
                ],
                espcl: 4, // taille en cm entre deux antécédents
                deltacl: 1, // distance entre la bordure et les premiers et derniers antécédents
                lgt: 3, // taille de la première colonne en cm
                hauteurLignes: [15, 15],
              }) + '<br>'
            variables.push(x0, x1, x2, x3, y0, y1, y2, y3)
          } else {
            // décroissante, croissante, décroissante, croissante
            const x0 = randint(-6, -4)
            const y0 = randint(3, 5)
            const x1 = randint(-2, 1)
            const y1 = y0 - randint(5, 8)
            const x2 = randint(2, 3)
            const y2 = y1 + randint(2, 7)
            const x3 = randint(4, 5)
            const y3 = y2 - randint(1, 4)
            const x4 = randint(7, 8)
            const y4 = y3 + randint(1, 5)
            const A0 = pointAbstrait(x0, y0)
            const A1 = pointAbstrait(x1, y1)
            const A2 = pointAbstrait(x2, y2)
            const A3 = pointAbstrait(x3, y3)
            const A4 = pointAbstrait(x4, y4)
            const Tk = tracePoint(A0, A1, A2, A3, A4)
            Tk.epaisseur = 1
            const nom = choice(nomF)
            const o = latex2d('\\text{O}', -0.3, -0.3, {
              letterSize: 'scriptsize',
            })
            const r1 = repere({
              xMin: x0 - 1,
              yMin: Math.min(y1 - 2, y3 - 2),
              yMax: Math.max(y2 + 1, y0 + 1, y4 + 1),
              xMax: x4 + 1,
              xUnite: 1,
              yUnite: 1,
              xThickDistance: 1,
              yThickDistance: 1,
              xLabelMin: x0,
              yLabelMin: y1 - 1,
              yLabelEcart: 0.6,
              grilleXDistance: 1,
              grilleYDistance: 1,
              grilleXMin: x0 - 1,
              grilleYMin: Math.min(y1 - 2, y3 - 2),
              grilleXMax: x4 + 1,
              grilleYMax: Math.max(y2 + 1, y0 + 1, y4 + 1),
            })
            const gr = courbeInterpolee(
              [
                [x0, y0],
                [x1, y1],
                [x2, y2],
                [x3, y3],
                [x4, y4],
              ],
              {
                color: bleuMathalea,
                epaisseur: 2,
                repere: r1,
                xMin: x0 - 1,
                xMax: x4 + 1,
              },
            )
            const nomC = latex2d(`C_{${nomF}}`, x0 + 0.4, y0 + 0.7, {
              color: bleuMathalea,
              letterSize: 'normalsize',
            })
            const graphique = mathalea2d(
              {
                xmin: x0 - 1,
                xmax: x4 + 1,
                ymin: Math.min(y1 - 2, y3 - 2),
                ymax: Math.max(y2 + 1, y0 + 1, y4 + 1) + margeHauteNomCourbe,
                pixelsParCm: 25,
                scale: 0.5,
                center: !context.isHtml,
              },
              r1,
              o,
              gr,
              Tk,
              nomC,
            )

            texte = `${graphique}`

            texteCorr = `La fonction $${nom}$ est définie sur $[${x0}\\,;\\,${x4}]$.<br>
        Son tableau de variations est : <br><br>`
            texteCorr += tableauDeVariation({
              tabInit: [
                [
                  // Première colonne du tableau avec le format [chaine d'entête, hauteur de ligne, nombre de pixels de largeur estimée du texte pour le centrage]
                  ['$x$', 1.5, 10],
                  [`$${nom}(x)$`, 4, 30],
                ],
                // Première ligne du tableau avec chaque antécédent suivi de son nombre de pixels de largeur estimée du texte pour le centrage
                [
                  `$${x0}$`,
                  10,
                  `$${x1}$`,
                  10,
                  `$${x2}$`,
                  10,
                  `$${x3}$`,
                  10,
                 `$${x4}$`,
                  10,
                ],
              ],
              // tabLines ci-dessous contient les autres lignes du tableau.
              tabLines: [
                [
                  'Var',
                  10,
                  `+/$${y0}$`,
                  10,
                  `-/$${y1}$`,
                  10,
                  `+/$${y2}$`,
                  10,
                  `-/$${y3}$`,
                  10,
                  `+/$${y4}$`,
                  10,
                ],
              ],
              espcl: 4, // taille en cm entre deux antécédents
              deltacl: 1, // distance entre la bordure et les premiers et derniers antécédents
              lgt: 3, // taille de la première colonne en cm
              hauteurLignes: [15, 15],
            })
            variables.push(x0, x1, x2, x3, y0, y1, y2, y3)
          }
          break

        case 2:
          choix = randint(1, 6)

          if (choix === 1) {
            // croissante, décroissante
            const x0 = randint(-4, -3)
            const y0 = randint(-4, -2)
            const x1 = randint(-2, 2)
            const y1 = randint(-1, 5) // max de y
            const x2 = 8
            const y2 = -10
            const A0 = pointAbstrait(x0, y0)
            const A1 = pointAbstrait(x1, y1)
            const Tk = tracePoint(A0, A1)
            Tk.epaisseur = 1
            const nom = choice(nomF)
            const o = latex2d('\\text{O}', -0.3, -0.3, {
              letterSize: 'scriptsize',
            })
            const r1 = repere({
              xMin: x0 - 1,
              yMin: Math.min(y2 - 1, y0 - 1),
              yMax: y1 + 2,
              xMax: 6,
              xUnite: 1,
              yUnite: 1,
              xThickDistance: 1,
              yThickDistance: 1,
              xLabelMin: x0,
              yLabelMin: y0,
              yLabelEcart: 0.6,
              grilleXDistance: 1,
              grilleYDistance: 1,
              grilleXMin: x0 - 1,
              grilleYMin: -5,
              grilleXMax: 6,
              grilleYMax: y1 + 2,
            })

            const gr = courbeInterpolee(
              [
                [x0, y0],
                [x1, y1],
                [x2, y2],
              ],
              {
                color: bleuMathalea,
                epaisseur: 2,
                repere: r1,
                xMin: x0 - 1,
                xMax: 6,
              },
            )
            const graphique = mathalea2d(
              {
                xmin: x0 - 1,
                xmax: 6,
                ymin: -5,
                ymax: y1 + 2,
                pixelsParCm: 30,
                scale: 0.6,
                center: !context.isHtml,
              },
              r1,
              o,
              gr,
              Tk,
            )
            texte = `  $${nom}$ est définie sur $[${x0}\\,;\\,+\\infty[$.<br>`
            texte += `${graphique}`

            texteCorr = `La fonction $${nom}$ est définie sur $[${x0}\\,;\\,+\\infty[$.<br>
             Son tableau de variations est : <br><br>`
            texteCorr +=
              tableauDeVariation({
                tabInit: [
                  [
                    // Première colonne du tableau avec le format [chaine d'entête, hauteur de ligne, nombre de pixels de largeur estimée du texte pour le centrage]
                    ['$x$', 1.5, 10],
                    [`$${nom}(x)$`, 4, 30],
                  ],
                  // Première ligne du tableau avec chaque antécédent suivi de son nombre de pixels de largeur estimée du texte pour le centrage
                  [`$${x0}$`, 10, `$${x1}$`, 10, '$+\\infty$', 10],
                ],
                // tabLines ci-dessous contient les autres lignes du tableau.
                tabLines: [
                  ['Var', 10, `-/$${y0}$`, 10, `+/$${y1}$`, 10, '-/', 10],
                ],
                espcl: 4, // taille en cm entre deux antécédents
                deltacl: 1, // distance entre la bordure et les premiers et derniers antécédents
                lgt: 2.5, // taille de la première colonne en cm
                hauteurLignes: [15, 15],
              }) + '<br>'

            variables.push(x0, x1, x2, y0, y1, y2)
          } else if (choix === 2) {
            // décroissante, croissante
            const x0 = -5
            const y0 = 10
            const x1 = randint(0, 2)
            const y1 = randint(-3, 0) // min de y
            const x2 = randint(4, 5)
            const y2 = y1 + randint(1, 4)
            const A1 = pointAbstrait(x1, y1)
            const A2 = pointAbstrait(x2, y2)
            const Tk = tracePoint(A1, A2)
            Tk.epaisseur = 1
            const nom = choice(nomF)
            const o = latex2d('\\text{O}', -0.3, -0.3, {
              letterSize: 'scriptsize',
            })
            const r1 = repere({
              xMin: -2,
              yMin: -5,
              yMax: 6,
              xMax: 6,
              xUnite: 1,
              yUnite: 1,
              xThickDistance: 1,
              yThickDistance: 1,
              xLabelMin: x0,
              yLabelMin: y1 - 1,
              yLabelEcart: 0.6,
              grilleXDistance: 1,
              grilleYDistance: 1,
              grilleXMin: -2,
              grilleYMin: -5,
              grilleXMax: 6,
              grilleYMax: 6,
            })
            const gr = courbeInterpolee(
              [
                [x0, y0],
                [x1, y1],
                [x2, y2],
              ],
              {
                color: bleuMathalea,
                epaisseur: 2,
                repere: r1,
                xMin: x0 - 1,
                xMax: 6,
              },
            )
            const graphique = mathalea2d(
              {
                xmin: -2,
                xmax: 6,
                ymin: y1 - 2,
                ymax: 6,
                pixelsParCm: 30,
                scale: 0.6,
                center: !context.isHtml,
              },
              r1,
              o,
              gr,
              Tk,
            )
            texte = `   $${nom}$ est définie sur $]-\\infty\\,;\\,${x2}]$.<br>`
            texte += `${graphique}`

            texteCorr = `La fonction $${nom}$ est définie sur $]-\\infty\\,;\\,${x2}]$.<br>
         Son tableau de variations est : <br><br>`
            texteCorr +=
              tableauDeVariation({
                tabInit: [
                  [
                    // Première colonne du tableau avec le format [chaine d'entête, hauteur de ligne, nombre de pixels de largeur estimée du texte pour le centrage]
                    ['$x$', 1.5, 10],
                    [`$${nom}(x)$`, 4, 30],
                  ],
                  // Première ligne du tableau avec chaque antécédent suivi de son nombre de pixels de largeur estimée du texte pour le centrage
                  ['$-\\infty$', 10, `$${x1}$`, 10, `$${x2}$`, 10],
                ],
                // tabLines ci-dessous contient les autres lignes du tableau.
                tabLines: [
                  ['Var', 10, '+/', 10, `-/$${y1}$`, 10, `+/$${y2}$`, 10],
                ],
                espcl: 4, // taille en cm entre deux antécédents
                deltacl: 1, // distance entre la bordure et les premiers et derniers antécédents
                lgt: 3, // taille de la première colonne en cm
                hauteurLignes: [15, 15],
              }) + '<br>'
            variables.push(x0, x1, x2, y0, y1, y2)
          } else if (choix === 3) {
            // décroissante, croissante, décroissante
            const x0 = randint(-6, -4)
            const y0 = randint(3, 5)
            const x1 = randint(-2, 1)
            const y1 = y0 - randint(5, 8)
            const x2 = randint(3, 4)
            const y2 = y1 + randint(2, 7)
            const x3 = 10
            const y3 = -10
            const A0 = pointAbstrait(x0, y0)
            const A1 = pointAbstrait(x1, y1)
            const A2 = pointAbstrait(x2, y2)
            const Tk = tracePoint(A0, A1, A2)
            Tk.epaisseur = 1
            const nom = choice(nomF)
            const o = latex2d('\\text{O}', -0.3, -0.3, {
              letterSize: 'scriptsize',
            })
            const r1 = repere({
              xMin: x0 - 1,
              yMin: Math.min(y1 - 1),
              yMax: Math.max(y2 + 1, y0 + 1),
              xMax: 7,
              xUnite: 1,
              yUnite: 1,
              xThickDistance: 1,
              yThickDistance: 1,
              xLabelMin: x0,
              yLabelMin: y1 - 1,
              yLabelEcart: 0.6,
              grilleXDistance: 1,
              grilleYDistance: 1,
              grilleXMin: x0 - 1,
              grilleYMin: Math.min(y1 - 1),
              grilleXMax: 7,
              grilleYMax: Math.max(y2 + 1, y0 + 1),
            })
            const gr = courbeInterpolee(
              [
                [x0, y0],
                [x1, y1],
                [x2, y2],
                [x3, y3],
              ],
              {
                color: bleuMathalea,
                epaisseur: 2,
                repere: r1,
                xMin: x0 - 1,
                xMax: 10,
              },
            )
            const graphique = mathalea2d(
              {
                xmin: x0 - 1,
                xmax: 10,
                ymin: Math.min(y1 - 1),
                ymax: Math.max(y2 + 1, y0 + 1),
                pixelsParCm: 30,
                scale: 0.6,
                center: !context.isHtml,
              },
              r1,
              o,
              gr,
              Tk,
            )
            texte = `   $${nom}$ est définie sur $[${x0}\\,;\\,+\\infty[$. <br>`
            texte += `${graphique}`

            texteCorr = `La fonction $${nom}$ est définie sur $[${x0}\\,;\\,+\\infty[$.<br>
         Son tableau de variations est : <br><br>`
            texteCorr +=
              tableauDeVariation({
                tabInit: [
                  [
                    // Première colonne du tableau avec le format [chaine d'entête, hauteur de ligne, nombre de pixels de largeur estimée du texte pour le centrage]
                    ['$x$', 1.5, 10],
                    [`$${nom}(x)$`, 4, 30],
                  ],
                  // Première ligne du tableau avec chaque antécédent suivi de son nombre de pixels de largeur estimée du texte pour le centrage
                  [
                    `$${x0}$`,
                    10,
                    `$${x1}$`,
                    10,
                    `$${x2}$`,
                    10,
                    '$+\\infty$',
                    10,
                  ],
                ],
                // tabLines ci-dessous contient les autres lignes du tableau.
                tabLines: [
                  [
                    'Var',
                    10,
                    `+/$${y0}$`,
                    10,
                    `-/$${y1}$`,
                    10,
                    `+/$${y2}$`,
                    10,
                    '-/',
                    10,
                  ],
                ],
                espcl: 4, // taille en cm entre deux antécédents
                deltacl: 1, // distance entre la bordure et les premiers et derniers antécédents
                lgt: 3, // taille de la première colonne en cm
                hauteurLignes: [15, 15],
              }) + '<br>'
            variables.push(x0, x1, x2, x3, y0, y1, y2, y3)
          } else if (choix === 4) {
            // croissante, décroissante, croissante
            const x0 = -5
            const y0 = -10
            const x1 = randint(0, 2)
            const y1 = randint(5, 8)
            const x2 = randint(4, 5)
            const y2 = y1 - randint(2, 7)
            const x3 = randint(7, 9)
            const y3 = y2 + randint(1, 4)
            const A1 = pointAbstrait(x1, y1)
            const A2 = pointAbstrait(x2, y2)
            const A3 = pointAbstrait(x3, y3)
            const Tk = tracePoint(A1, A2, A3)
            Tk.epaisseur = 1
            const nom = choice(nomF)
            const o = latex2d('\\text{O}', -0.3, -0.3, {
              letterSize: 'scriptsize',
            })
            const r1 = repere({
              xMin: -4,
              yMin: Math.min(y2 - 1, -2),
              yMax: Math.max(y1 + 1, y3 + 1),
              xMax: x3 + 1,
              xUnite: 1,
              yUnite: 1,
              xThickDistance: 1,
              yThickDistance: 1,
              xLabelMin: x0,
              yLabelMin: Math.min(y2 - 1) + 1,
              yLabelEcart: 0.6,
              grilleXDistance: 1,
              grilleYDistance: 1,
              grilleXMin: x0 - 1,
              grilleYMin: Math.min(y2 - 1, -2),
              grilleXMax: x3 + 1,
              grilleYMax: Math.max(y1 + 1, y3 + 1),
            })
            const gr = courbeInterpolee(
              [
                [x0, y0],
                [x1, y1],
                [x2, y2],
                [x3, y3],
              ],
              {
                color: bleuMathalea,
                epaisseur: 2,
                repere: r1,
                xMin: -4,
                xMax: x3 + 1,
              },
            )
            const graphique = mathalea2d(
              {
                xmin: -4,
                xmax: x3 + 1,
                ymin: Math.min(y2 - 1, -2),
                ymax: Math.max(y1 + 1, y3 + 1),
                pixelsParCm: 30,
                scale: 0.5,
                center: !context.isHtml,
              },
              r1,
              o,
              gr,
              Tk,
            )
            texte = `   $${nom}$ est définie sur $]-\\infty\\,;\\,${x3}]$.<br>`
            texte += `${graphique}`

            texteCorr = `La fonction $${nom}$ est définie sur $]-\\infty\\,;\\,${x2}]$.<br>
         Son tableau de variations est : <br><br>`
            texteCorr +=
              tableauDeVariation({
                tabInit: [
                  [
                    // Première colonne du tableau avec le format [chaine d'entête, hauteur de ligne, nombre de pixels de largeur estimée du texte pour le centrage]
                    ['$x$', 1.5, 10],
                    [`$${nom}(x)$`, 4, 30],
                  ],
                  // Première ligne du tableau avec chaque antécédent suivi de son nombre de pixels de largeur estimée du texte pour le centrage
                  [
                    '$-\\infty$',
                    10,
                    `$${x1}$`,
                    10,
                    `$${x2}$`,
                    10,
                    `$${x3}$`,
                    10,
                  ],
                ],
                // tabLines ci-dessous contient les autres lignes du tableau.
                tabLines: [
                  [
                    'Var',
                    10,
                    '-/',
                    10,
                    `+/$${y1}$`,
                    10,
                    `-/$${y2}$`,
                    10,
                    `+/$${y3}$`,
                    10,
                  ],
                ],
                espcl: 4, // taille en cm entre deux antécédents
                deltacl: 1, // distance entre la bordure et les premiers et derniers antécédents
                lgt: 3, // taille de la première colonne en cm
                hauteurLignes: [15, 15],
              }) + '<br>'
            variables.push(x0, x1, x2, x3, y0, y1, y2, y3)
          } else if (choix === 5) {
            // croissante, décroissante, croissante, décroissante
            const x0 = randint(-6, -5)
            const y0 = randint(-5, -3)
            const x1 = randint(-3, -1)
            const y1 = y0 + randint(5, 8)
            const x2 = randint(1, 3)
            const y2 = y1 - randint(2, 7)
            const x3 = randint(4, 6)
            const y3 = y2 + randint(1, 4)
            const x4 = 10
            const y4 = -10
            const A0 = pointAbstrait(x0, y0)
            const A1 = pointAbstrait(x1, y1)
            const A2 = pointAbstrait(x2, y2)
            const A3 = pointAbstrait(x3, y3)

            const Tk = tracePoint(A0, A1, A2, A3)
            Tk.epaisseur = 1
            const nom = choice(nomF)
            const o = latex2d('\\text{O}', -0.3, -0.3, {
              letterSize: 'scriptsize',
            })
            const r1 = repere({
              xMin: x0 - 1,
              yMin: Math.min(y2 - 1, y0 - 1, -6),
              yMax: Math.max(y1 + 1, y3 + 1),
              xMax: x3 + 3,
              xUnite: 1,
              yUnite: 1,
              xThickDistance: 1,
              yThickDistance: 1,
              xLabelMin: x0,
              yLabelMin: Math.min(y2 - 1, y0 - 1, -6) + 1,
              yLabelEcart: 0.6,
              grilleXDistance: 1,
              grilleYDistance: 1,
              grilleXMin: x0 - 1,
              grilleYMin: Math.min(y2 - 1, y0 - 1, -6),
              grilleXMax: x4 + 1,
              grilleYMax: Math.max(y1 + 1, y3 + 1),
            })
            const gr = courbeInterpolee(
              [
                [x0, y0],
                [x1, y1],
                [x2, y2],
                [x3, y3],
                [x4, y4],
              ],
              {
                color: bleuMathalea,
                epaisseur: 2,
                repere: r1,
                xMin: x0 - 1,
                xMax: x4 + 1,
              },
            )
            const graphique = mathalea2d(
              {
                xmin: x0 - 1,
                xmax: x3 + 3,
                ymin: Math.min(y2 - 1, y0 - 1, -6),
                ymax: Math.max(y1 + 1, y3 + 1),
                pixelsParCm: 25,
                scale: 0.5,
                center: !context.isHtml,
              },
              r1,
              o,
              gr,
              Tk,
            )
            texte = `  $${nom}$ est définie sur $[${x0}\\,;\\,+\\infty[$.<br>`
            texte += `${graphique}`

            texteCorr = `La fonction $${nom}$ est définie sur $[${x0}\\,;\\,+\\infty[$.<br>
         Son tableau de variations est : <br><br>`
            texteCorr +=
              tableauDeVariation({
                tabInit: [
                  [
                    ['$x$', 1.5, 10],
                    [`$${nom}(x)$`, 4, 30],
                  ],
                  [
                    `$${x0}$`,
                    10,
                    `$${x1}$`,
                    10,
                    `$${x2}$`,
                    10,
                    `$${x3}$`,
                    10,
                    '$+\\infty$',
                    10,
                  ],
                ],
                tabLines: [
                  [
                    'Var',
                    10,
                    `-/$${y0}$`,
                    10,
                    `+/$${y1}$`,
                    10,
                    `-/$${y2}$`,
                    10,
                    `+/$${y3}$`,
                    10,
                    '-/',
                    10,
                  ],
                ],
                espcl: 4, // taille en cm entre deux antécédents
                deltacl: 1, // distance entre la bordure et les premiers et derniers antécédents
                lgt: 3, // taille de la première colonne en cm
                hauteurLignes: [15, 15],
              }) + '<br>'
            variables.push(x0, x1, x2, x3, y0, y1, y2, y3)
          } else {
            // décroissante, croissante, décroissante, croissante
            const x0 = randint(-6, -4)
            const y0 = randint(3, 5)
            const x1 = randint(-2, 1)
            const y1 = y0 - randint(5, 8)
            const x2 = randint(2, 3)
            const y2 = y1 + randint(2, 7)
            const x3 = randint(4, 5)
            const y3 = y2 - randint(1, 4)
            const x4 = x3 + 3
            const y4 = 7
            const A0 = pointAbstrait(x0, y0)
            const A1 = pointAbstrait(x1, y1)
            const A2 = pointAbstrait(x2, y2)
            const A3 = pointAbstrait(x3, y3)

            const Tk = tracePoint(A0, A1, A2, A3)
            Tk.epaisseur = 1
            const nom = choice(nomF)
            const o = latex2d('\\text{O}', -0.3, -0.3, {
              letterSize: 'scriptsize',
            })
            const r1 = repere({
              xMin: x0 - 1,
              yMin: Math.min(y1 - 2, y3 - 2),
              yMax: Math.max(y2 + 1, y0 + 1, 6),
              xMax: x3 + 2,
              xUnite: 1,
              yUnite: 1,
              xThickDistance: 1,
              yThickDistance: 1,
              xLabelMin: x0,
              yLabelMin: y1 - 1,
              yLabelEcart: 0.6,
              grilleXDistance: 1,
              grilleYDistance: 1,
              grilleXMin: x0 - 1,
              grilleYMin: Math.min(y1 - 2, y3 - 2),
              grilleXMax: x4 + 1,
              grilleYMax: Math.max(y2 + 1, y0 + 1, 6),
            })
            const gr = courbeInterpolee(
              [
                [x0, y0],
                [x1, y1],
                [x2, y2],
                [x3, y3],
                [x4, y4],
              ],
              {
                color: bleuMathalea,
                epaisseur: 2,
                repere: r1,
                xMin: x0 - 1,
                xMax: x3 + 2,
              },
            )
            const graphique = mathalea2d(
              {
                xmin: x0 - 1,
                xmax: x3 + 2,
                ymin: Math.min(y1 - 2, y3 - 2),
                ymax: Math.max(y2 + 1, y0 + 1, 6),
                pixelsParCm: 25,
                scale: 0.5,
                center: !context.isHtml,
              },
              r1,
              o,
              gr,
              Tk,
            )
            texte = `  $${nom}$ est définie sur $[${x0}\\,;\\,+\\infty[$. <br>`
            texte += `${graphique}`

            texteCorr = `La fonction $${nom}$ est définie sur $[${x0}\\,;\\,${x4}]$.<br>
         Son tableau de variations est : <br><br>`
            texteCorr += tableauDeVariation({
              tabInit: [
                [
                  // Première colonne du tableau avec le format [chaine d'entête, hauteur de ligne, nombre de pixels de largeur estimée du texte pour le centrage]
                  ['$x$', 1.5, 10],
                  [`$${nom}(x)$`, 4, 30],
                ],
                // Première ligne du tableau avec chaque antécédent suivi de son nombre de pixels de largeur estimée du texte pour le centrage
                [
                  `$${x0}$`,
                  10,
                  `$${x1}$`,
                  10,
                  `$${x2}$`,
                  10,
                  `$${x3}$`,
                  10,
                  `$${x4}$`,
                  10,
                ],
              ],
              // tabLines ci-dessous contient les autres lignes du tableau.
              tabLines: [
                [
                  'Var',
                  10,
                  `+/$${y0}$`,
                  10,
                  `-/$${y1}$`,
                  10,
                  `+/$${y2}$`,
                  10,
                  `-/$${y3}$`,
                  10,
                  `+/$${y4}$`,
                  10,
                ],
              ],
              espcl: 4, // taille en cm entre deux antécédents
              deltacl: 1, // distance entre la bordure et les premiers et derniers antécédents
              lgt: 3, // taille de la première colonne en cm
              hauteurLignes: [15, 15],
            })
            variables.push(x0, x1, x2, x3, y0, y1, y2, y3)
          }
          break

        case 3:
          choix = randint(1, 3)

          if (choix === 1) {
            const a = randint(-1, 1, 0)
            const b = randint(-2, 2) * 2
            const c = randint(-1, 1)
            const o = latex2d('\\text{O}', -0.3, -0.3, {
              letterSize: 'scriptsize',
            })
            fonction = (x: number) => a * x ** 2 + b * x + c
            derivee = (x: number) => 2 * a * x + b
            tolerance = 0.005
            xMin = -10
            xMax = 10
            substituts = [
              {
                antVal: -10,
                antTex: '$-\\infty$',
                imgTex: ' ',
              },
              {
                antVal: 10,
                antTex: '$+\\infty$',
                imgTex: ' ',
              },
            ]

            const r = repere({
              xMin: -6.1,
              yMin: -5.05,
              yMax: 5.05,
              xMax: 6.05,
              yUnite: 1,
              yThickDistance: 1,
              grilleYDistance: 1,
              yLabelEcart: 0.5,
            })
            const objets = [
              o,
              r,
              courbe(fonction, {
                repere: r,
                xMin,
                xMax,
                color: bleuMathalea,
                epaisseur: 2,
              }),
            ]

            const tableau = tableauVariationsFonction(
              fonction as (x: FractionEtendue | number) => number,
              derivee as (x: FractionEtendue | number) => number,
              xMin,
              xMax,
              { ligneDerivee: false, substituts, step: 1, tolerance },
            )

            texte = '$f$ est définie sur $\\mathbb{R}$.<br>'
            texte += mathalea2d(
              {
                xmin: -6,
                xmax: 6.1,
                ymin: -5,
                ymax: 5.1,
                pixelsParCm: 25,
                scale: 0.6,
              },
              objets,
            )
            texteCorr = `La fonction $f$ est définie sur $\\mathbb{R}$.<br>
         Son tableau de variations est : <br><br>`
            texteCorr += `${tableau}`
          } else if (choix === 2) {
            const a = randint(-4, 4, [-1, 0, 1])
            const b = randint(-3, 3)
            const o = latex2d('\\text{O}', -0.3, -0.3, {
              letterSize: 'scriptsize',
            })
            fonction = (x: number) => a / ((x - b) ** 2 + 1)
            derivee = (x: number) =>
              (-a * 2 * (x - b)) / ((x - b) ** 2 + 1) ** 2
            tolerance = 0.005
            xMin = -10
            xMax = 10
            substituts = [
              {
                antVal: -10,
                antTex: '$-\\infty$',
                imgTex: ' ',
              },
              {
                antVal: 10,
                antTex: '$+\\infty$',
                imgTex: ' ',
              },
            ]

            const r = repere({
              xMin: -6.1,
              yMin: -5.1,
              yMax: 6.05,
              xMax: 6.05,
              yUnite: 1,
              yThickDistance: 1,
              grilleYDistance: 1,
              yLabelEcart: 0.5,
            })
            const objets = [
              o,
              r,
              courbe(fonction, {
                repere: r,
                xMin,
                xMax,
                color: bleuMathalea,
                epaisseur: 2,
              }),
            ]

            const tableau = tableauVariationsFonction(
              fonction as (x: FractionEtendue | number) => number,
              derivee as (x: FractionEtendue | number) => number,
              xMin,
              xMax,
              { ligneDerivee: false, substituts, step: 1, tolerance },
            )

            texte = '  $f$ est définie sur $\\mathbb{R}$.<br>'
            texte += mathalea2d(
              {
                xmin: -6,
                xmax: 6,
                ymin: -5,
                ymax: 5.1,
                pixelsParCm: 25,
                scale: 0.6,
              },
              objets,
            )
            texteCorr = `La fonction $f$ est définie sur $\\mathbb{R}$.<br>
         Son tableau de variations est : <br><br>`
            texteCorr += `${tableau}`
          } else {
            const a = randint(-1, 1, 0) / 2
            const x1 = randint(-3, -1)
            const x2 = x1 + 2
            const k = randint(-1, 1)
            const o = latex2d('\\text{O}', -0.2, -0.2, {
              letterSize: 'scriptsize',
            })
            fonction = (x: number) =>
              2 * a * x ** 3 -
              3 * a * x1 * x ** 2 -
              3 * a * x2 * x ** 2 +
              6 * a * x1 * x2 * x +
              k
            derivee = (x: number) =>
              6 * a * x ** 2 - 6 * a * x1 * x - 6 * a * x2 * x + 6 * a * x1 * x2
            tolerance = 0.005
            xMin = -10
            xMax = 10
            substituts = [
              {
                antVal: -10,
                antTex: '$-\\infty$',
                imgTex: ' ',
              },
              {
                antVal: 10,
                antTex: '$+\\infty$',
                imgTex: ' ',
              },
            ]

            const r = repere({
              xMin: -4.1,
              yMin: -8.1,
              yMax: 8.05,
              xMax: 4.05,
              yUnite: 0.5,
              yThickDistance: 2,
              grilleYDistance: 0.5,
              yLabelEcart: 0.5,
            })
            const objets = [
              o,
              r,
              courbe(fonction, {
                repere: r,
                xMin,
                xMax,
                color: bleuMathalea,
                epaisseur: 2,
              }),
            ]

            const tableau = tableauVariationsFonction(
              fonction as (x: FractionEtendue | number) => number,
              derivee as (x: FractionEtendue | number) => number,
              xMin,
              xMax,
              { ligneDerivee: false, substituts, step: 1, tolerance },
            )

            texte = ' $f$ est définie sur $\\mathbb{R}$. <br>'
            texte += mathalea2d(
              {
                xmin: -4,
                xmax: 4,
                ymin: -4,
                ymax: 4.1,
                pixelsParCm: 35,
                scale: 0.6,
              },
              objets,
            )
            texteCorr = `La fonction $f$ est définie sur $\\mathbb{R}$.<br>
         Son tableau de variations est : <br><br>`
            texteCorr += `${tableau}`
          }
          break
        case 4:
        default:
          {
            const genereDenomAvecPoles = (choix: number) => {
              let a = randint(-6, 6, 0) / 2
              const a1 = randint(-3, 3, [a, -a, 0])
              const b1 = randint(-3, 3, [-a1, 0])
              if (-a * a1 - b1 === 0) {
                a -= 1
              }
              const fonction =
                choix === 2
                  ? (x: number) => (a < 0 ? 1 / (x - a) : 1 / (a - x))
                  : (x: number) => (a1 * x + b1) / (x - a)
              let denomTex: string
              if (choix === 2) {
                denomTex =
                  a < 0
                    ? `x  ${ecritureAlgebrique(a)}`
                    : `${ecritureAlgebrique(a)} - x`
              } else {
                denomTex = `x  ${ecritureAlgebrique(-a)}`
              }
              const fonctionTex =
                choix === 2
                  ? `\\dfrac{1}{x  ${ecritureAlgebrique(a)}}`
                  : `\\dfrac{${rienSi1(a1)}x ${ecritureAlgebrique(b1)}}{x ${ecritureAlgebrique(-a)}}`
              const numTex =
                choix === 2 ? '1' : `${rienSi1(a1)}x ${ecritureAlgebrique(b1)}`

              const signes =
                choix === 2
                  ? [
                      a > 0 ? '-/ ' : '+/ ',
                      a > 0 ? '+D-/ / ' : '-D+/ / ',
                      a > 0 ? '+/ ' : '-/ ',
                    ]
                  : [
                      b1 + a * a1 > 0 ? '+/ ' : '-/ ',
                      b1 + a * a1 > 0 ? '-D+/ / ' : '+D-/ / ',
                      b1 + a * a1 > 0 ? '-/ ' : '+/ ',
                    ]
              const limiteMoinsInfini = choix === 2 ? 0 : a1
              const limitePlusInfini = choix === 2 ? 0 : a1

              return {
                fonction,
                fonctionTex,
                denomTex,
                numTex,
                signes,
                limiteMoinsInfini,
                limitePlusInfini,
                valeursInterdites: [a],
              }
            }
            choix = randint(1, 2)
            const poles = genereDenomAvecPoles(choix)
            fonction = poles.fonction
            const r1 = repere({
              xMin: -6,
              yMin: -20,
              yMax: 20,
              xMax: 6,
              xUnite: 1,
              yUnite: 0.2,
              xThickDistance: 1,
              yThickDistance: 10,
              xLabelMin: -6,
              xLabelMax: 6,
              yLabelMin: -20,
              yLabelMax: 20,
              yLabelEcart: 0.6,
              grilleXDistance: 1,
              grilleYDistance: 1,
              grilleXMin: -6,
              grilleYMin: -20,
              grilleXMax: 6,
              grilleYMax: 20,
            })
            const cf = courbe(fonction, {
              repere: r1,
              xMin: -6,
              xMax: 6,
              color: bleuMathalea,
              epaisseur: 2,
              step: 0.02,
            })
            const graphique = mathalea2d(
              {
                xmin: -6,
                xmax: 6,
                ymin: -4.1,
                ymax: 4.1,
                pixelsParCm: 30,
                scale: 0.6,
                center: !context.isHtml,
              },
              r1,
              cf,
            )

            texte = `La fonction $${nom}$ est définie sur $\\mathbb{R} \\setminus \\{${poles.valeursInterdites.map((v) => texNombre(v, 1)).join(' ; ')}\\}$.<br>
            ${graphique}<br>`
            texteCorr = `La fonction $${nom}$ est définie sur $\\mathbb{R} \\setminus \\{${poles.valeursInterdites.map((v) => texNombre(v, 1)).join(' ; ')}\\}$.<br>
            Son tableau de variations est : <br><br>`
            if (choix === 2) {
              texteCorr +=
                tableauDeVariation({
                  tabInit: [
                    [
                      ['$x$', 1.5, 10],
                      [`$${nom}(x)$`, 4, 30],
                    ],
                    [
                      `$-\\infty$`,
                      10,
                      `${texNombre(poles.valeursInterdites[0], 1)}`,
                      10,
                      `$+\\infty$`,
                      10,
                    ],
                  ],
                  tabLines: [
                    [
                      'Var',
                      20,
                      `${poles.signes[0]} `,
                      20,
                      `${poles.signes[1]}`,
                      20,
                      `${poles.signes[2]}`,
                      20,
                      `${poles.signes[3]}`,
                    ],
                  ],
                  espcl: 4, // taille en cm entre deux antécédents
                  deltacl: 1, // distance entre la bordure et les premiers et derniers antécédents
                  lgt: 2.5, // taille de la première colonne en cm
                  hauteurLignes: [15, 15],
                }) + '<br>'
            } else {
              texteCorr +=
                tableauDeVariation({
                  tabInit: [
                    [
                      ['$x$', 1.5, 10],
                      [`$${nom}(x)$`, 4, 30],
                    ],
                    [
                      `$-\\infty$`,
                      10,
                      `${texNombre(poles.valeursInterdites[0], 1)}`,
                      10,
                      `$+\\infty$`,
                      10,
                    ],
                  ],
                  tabLines: [
                    [
                      'Var',
                      10,
                      `${poles.signes[0]}`,
                      10,
                      `${poles.signes[1]}`,
                      10,
                      `${poles.signes[2]}`,
                    ],
                  ],
                  espcl: 4, // taille en cm entre deux antécédents
                  deltacl: 1, // distance entre la bordure et les premiers et derniers antécédents
                  lgt: 2.5, // taille de la première colonne en cm
                  hauteurLignes: [15, 15],
                }) + '<br>'
            }

            variables.push(
              ...poles.valeursInterdites,
              ...poles.signes.map((s) => (s === '+' ? 1 : -1)),
            )
          }
          break
      }
      if (this.questionJamaisPosee(i, listeTypeDeQuestions[i], texte)) {
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
