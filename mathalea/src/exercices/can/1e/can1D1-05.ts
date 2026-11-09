import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { courbe } from '../../../lib/2d/Courbe'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import RepereBuilder from '../../../lib/2d/RepereBuilder'
import { latexParCoordonnees, texteParPosition } from '../../../lib/2d/textes'
import { bleuMathalea } from '../../../lib/colors'
import { deuxColonnesResp } from '../../../lib/format/miseEnPage'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../../lib/outils/ecritures'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre =
  'Déterminer une équation de tangente à partir des courbes de $f$ et $f’$'
export const interactifReady = true

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '22/06/2022' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
// export const dateDeModifImportante = '14/02/2022' // Une date de modification importante au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 */
export const uuid = '6f32d'

export const refs = {
  'fr-fr': ['can1D1-05'],
  'fr-ch': [],
}
export default class LectureGraphiqueTangente extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecEgalEtVariable
  }

  nouvelleVersion() {
    let f, F, nbre, alpha: number, beta: number
    switch (
      this.quotaChoice('type', [1, 2]) //, 2
    ) {
      case 1: // second degré (x-alpha)^2+beta
        {
          if (choice([true, false])) {
            nbre = randint(0, 3)
            alpha = randint(0, 2)
            beta = randint(-2, 2)
            f = function (x: number) {
              // fonction dérivée
              return 2 * x - 2 * alpha
            }
            F = function (x: number) {
              // fonction
              return (x - alpha) ** 2 + beta
            }
            while (f(nbre) === 0) {
              nbre = randint(0, 3)
              alpha = randint(0, 2)
              beta = randint(-2, 2)
            }
          } else {
            nbre = randint(-2, 1)
            alpha = randint(-2, 0)
            beta = randint(-2, 2)
            f = function (x: number) {
              // fonction dérivée
              return 2 * x - 2 * alpha
            }
            F = function (x: number) {
              // fonction
              return (x - alpha) ** 2 + beta
            }
            while (f(nbre) === 0) {
              nbre = randint(-2, 1)
              alpha = randint(-2, 0)
              beta = randint(-2, 2)
            }
          }

          const o = texteParPosition('O', -0.3, -0.3, 0, 'black', 1)

          const r1 = new RepereBuilder({
            xMin: -3,
            xMax: 3,
            yMin: -3,
            yMax: 12,
          })
            .setUniteX(1.5)
            .setUniteY(1.5)
            .setLabelX({ xMin: -3, xMax: 3, dx: 3 })
            .setLabelY({ yMin: -3, yMax: 11, dy: 3 })
            .setGrille({
              grilleX: { dx: 1, xMin: -3, xMax: 3 },
              grilleY: { dy: 1, yMin: -3, yMax: 12 },
            })
            .setGrilleSecondaire({
              grilleX: { dx: 1, xMin: -3, xMax: 3 },
              grilleY: { dy: 0.5, yMin: -3, yMax: 12, style: undefined },
            })
            .setThickX({ xMin: -3, xMax: 3, dx: 1.5 })
            .setThickY({ yMin: -3, yMax: 12, dy: 1.5 })
            .buildStandard()

          const r2 = new RepereBuilder({ xMin: -3, xMax: 3, yMin: -5, yMax: 8 })
            .setUniteX(1.5)
            .setUniteY(1.5)
            .setLabelX({ xMin: -3, xMax: 3, dx: 3 })
            .setLabelY({ yMin: -3, yMax: 12, dy: 3 })
            .setGrille({
              grilleX: { dx: 1, xMin: -3, xMax: 3 },
              grilleY: { dy: 1, yMin: -5, yMax: 8 },
            })
            .setGrilleSecondaire({
              grilleX: { dx: 1, xMin: -3, xMax: 3 },
              grilleY: { dy: 0.5, yMin: -5, yMax: 8, style: undefined },
            })
            .setThickX({ xMin: -3, xMax: 3, dx: 1.5 })
            .setThickY({ yMin: -3, yMax: 8, dy: 1.5 })
            .buildStandard()

          const courbef = latexParCoordonnees(
            '\\Large \\cal C_f',
            3,
            10,
            bleuMathalea,
            1,
            20,
            '',
            8,
          )
          const courbefp = latexParCoordonnees(
            '\\Large\\cal C_f\\prime',
            3,
            6,
            'red',
            1,
            20,
            '',
            8,
          )

          const objets1 = [
            r1,
            o,
            courbef,
            courbe(F, { repere: r1, color: bleuMathalea, epaisseur: 2 }),
          ]
          const objets2 = [
            r2,
            o,
            courbefp,
            courbe(f, { repere: r2, color: 'red', epaisseur: 2 }),
          ]
          const colonne2 = mathalea2d(
            Object.assign({}, fixeBordures(objets2)),
            objets2,
          )
          const colonne1 = mathalea2d(
            Object.assign({}, fixeBordures(objets1)),
            objets1,
          )
          this.question = `On donne les représentations graphiques d'une fonction et de sa dérivée.<br>
        Donner l'équation réduite de la tangente à la courbe de $f$ en $x=${nbre}$. <br> `
          this.question += deuxColonnesResp(colonne1, colonne2, {
            largeur1: 50,
            widthmincol1: '100px',
            widthmincol2: '100px',
          })

          this.correction = `L'équation réduite de la tangente au point d'abscisse $${nbre}$ est  : $y=f'(${nbre})(x-${ecritureParentheseSiNegatif(nbre)})+f(${nbre})$.<br>
        On lit graphiquement $f(${nbre})=${F(nbre)}$ et $f'(${nbre})=${f(nbre)}$.<br>
        L'équation réduite de la tangente est donc donnée par :
        $y=${miseEnEvidence(`${f(nbre)}(x${ecritureAlgebrique(-nbre)})${ecritureAlgebrique(F(nbre))}`)}$, soit `
          if (-nbre * f(nbre) + F(nbre) === 0) {
            this.correction += `$y=${miseEnEvidence(`${rienSi1(f(nbre))}x`)}$.`
          } else {
            this.correction += `$y=${miseEnEvidence(`${rienSi1(f(nbre))}x${ecritureAlgebrique(-nbre * f(nbre) + F(nbre))}`)}$.`
          }

          this.reponse = [`y=${f(nbre)}x+${-nbre * f(nbre) + F(nbre)}`]
          this.canEnonce = `On donne les représentations graphiques d'une fonction et de sa dérivée.<br>
        Donner l'équation réduite de la tangente à la courbe de $f$ en $x=${nbre}$. <br>

        `
          this.canEnonce += colonne1
          this.canReponseACompleter = colonne2
        }
        break

      case 2: {
        // second degré -(x-alpha)^2+beta
        if (choice([true, false])) {
          nbre = randint(0, 2)
          alpha = randint(0, 2)
          beta = randint(1, 4)
          f = function (x: number) {
            // fonction dérivée
            return 2 * x * -1 + 2 * alpha
          }
          F = function (x: number) {
            // fonction
            return -1 * (x - alpha) ** 2 + beta
          }
          while (f(nbre) === 0) {
            // pas de tangente horizontales à chercher
            nbre = randint(0, 2)
            alpha = randint(0, 2)
            beta = randint(1, 4)
          }
        } else {
          nbre = randint(-2, 0)
          alpha = randint(-2, 0)
          beta = randint(0, 3)
        }
        f = function (x: number) {
          // fonction dérivée
          return 2 * x * -1 + 2 * alpha
        }
        F = function (x: number) {
          // fonction
          return -1 * (x - alpha) ** 2 + beta
        }
        while (f(nbre) === 0) {
          // pas de tangente horizontales à chercher
          nbre = randint(-2, 0)
          alpha = randint(-2, 0)
          beta = randint(0, 3)
        }

        const o = texteParPosition('O', -0.3, -0.3, 0, 'black', 1)
        const r1 = new RepereBuilder({ xMin: -4, xMax: 4, yMin: -8, yMax: 6 })
          .setUniteX(2)
          .setUniteY(2)
          .setLabelX({ xMin: -4, xMax: 4, dx: 2 })
          .setLabelY({ yMin: -8, yMax: 6, dy: 2 })
          .setGrille({
            grilleX: { dx: 1, xMin: -4, xMax: 4 },
            grilleY: { dy: 1, yMin: -8, yMax: 6 },
          })
          .setGrilleSecondaire({
            grilleX: { dx: 1, xMin: -4, xMax: 4 },
            grilleY: { dy: 0.5, yMin: -8, yMax: 6 },
          })
          .setThickX({ xMin: -4, xMax: 4, dx: 2 })
          .setThickY({ yMin: -8, yMax: 6, dy: 2 })
          .buildStandard()

        const r2 = new RepereBuilder({ xMin: -4, xMax: 4, yMin: -8, yMax: 6 })
          .setUniteX(2)
          .setUniteY(2)
          .setLabelX({ xMin: -4, xMax: 4, dx: 2 })
          .setLabelY({ yMin: -8, yMax: 5, dy: 2 })
          .setGrille({
            grilleX: { dx: 1, xMin: -4, xMax: 4 },
            grilleY: { dy: 1, yMin: -8, yMax: 6 },
          })
          .setGrilleSecondaire({
            grilleX: { dx: 1, xMin: -4, xMax: 4 },
            grilleY: { dy: 0.5, yMin: -8, yMax: 6 },
          })
          .setThickX({ xMin: -4, xMax: 4, dx: 2 })
          .setThickY({ yMin: -8, yMax: 6, dy: 2 })
          .buildStandard()

        const courbef = latexParCoordonnees(
          '\\Large \\cal C_f',
          3,
          4,
          bleuMathalea,
          1,
          20,
          '',
          8,
        )
        const courbefp = latexParCoordonnees(
          '\\Large\\cal C_f\\prime',
          3,
          4,
          'red',
          1,
          20,
          '',
          8,
        )

        f = (x: number): number => -2 * x + 2 * alpha
        F = (x: number): number => -1 * (x - alpha) ** 2 + beta
        const objets1 = [
          r1,
          o,
          courbef,
          courbe(F, { repere: r1, color: bleuMathalea, epaisseur: 2 }),
        ]
        const objets2 = [
          r2,
          o,
          courbefp,
          courbe(f, { repere: r2, color: 'red', epaisseur: 2 }),
        ]
        this.question = `On donne les représentations graphiques d'une fonction et de sa dérivée.<br>
      Donner l'équation réduite de la tangente à la courbe de $f$ en $x=${nbre}$. <br> `
        const colonne1 = mathalea2d(
          Object.assign({}, fixeBordures(objets1)),
          objets1,
        )
        const colonne2 = mathalea2d(
          Object.assign({}, fixeBordures(objets2)),
          objets2,
        )

        this.question += deuxColonnesResp(colonne1, colonne2, {
          largeur1: 50,
          widthmincol1: '100px',
          widthmincol2: '100px',
        })
        this.correction = `L'équation réduite de la tangente au point d'abscisse $${nbre}$ est  : $y=f'(${nbre})(x-${ecritureParentheseSiNegatif(nbre)})+f(${nbre})$.<br>
      On lit graphiquement $f(${nbre})=${F(nbre)}$ et $f'(${nbre})=${f(nbre)}$.<br>
      L'équation réduite de la tangente est donc donnée par :
      $y=${miseEnEvidence(`${f(nbre)}(x${ecritureAlgebrique(-nbre)})${ecritureAlgebrique(F(nbre))}`)}$, soit `
        if (-nbre * f(nbre) + F(nbre) === 0) {
          this.correction += `$y=${miseEnEvidence(`${f(nbre)}x`)}$.`
        } else {
          this.correction += `$y=${miseEnEvidence(`${f(nbre)}x${ecritureAlgebrique(-nbre * f(nbre) + F(nbre))}`)}$.`
        }
        this.reponse = [`y=${f(nbre)}x+${-nbre * f(nbre) + F(nbre)}`]
        this.canEnonce = `On donne les représentations graphiques d'une fonction et de sa dérivée.<br>
        Donner l'équation réduite de la tangente à la courbe de $f$ en $x=${nbre}$. <br>
        
        `
        this.canEnonce += colonne1

        this.canReponseACompleter = colonne2
        break
      }
    }
  }
}
