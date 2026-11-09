import { courbe } from '../../lib/2d/Courbe'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import { fraction } from '../../modules/fractions'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Déterminer une fonction affine par la donnée des images de deux nombres'
export const interactifReady = true

export const dateDeModifImportante = '29/03/2026'

/**
 * Déterminer la forme algébrique à partir de la donnée de 2 nombres et de leurs images
 * cas 0 : fonction constante
 * cas 1 : f(0) et f(x2) donnés
 * cas 2 : f(x1) et f(x1+1) donnés
 * cas 3 : f(x1) et f(x2) donnés a et b entiers
 * cas 4 : f(x1) et f(x2) donnés a et b rationnels
 * x1, x2, f(x1) et f(x2) sont toujours entiers relatifs
 * @author Jean-claude Lhote

 */
export const uuid = 'b8b33'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class DeterminerFonctionAffine3eOld extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      3,
      '1 : Facile\n2 : Difficile\n3 : Très difficile',
    ]

    this.sup = 1
    this.nbQuestions = 2
    this.nbCols = 2 // Uniquement pour la sortie LaTeX
    this.nbColsCorr = 2 // Uniquement pour la sortie LaTeX
    this.spacingCorr = 2
  }

  nouvelleVersion() {
    let typeDeQuestionsDisponibles
    if (parseInt(this.sup) === 1) {
      typeDeQuestionsDisponibles = [0, 1]
    } else if (parseInt(this.sup) === 2) {
      typeDeQuestionsDisponibles = [1, 2, 3]
    } else {
      typeDeQuestionsDisponibles = [3, 4]
    }
    const listeTypeDeQuestions = combinaisonListes(
      typeDeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (
      let i = 0, tA, tB, r, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      texte = '' // Nous utilisons souvent cette variable pour construire le texte de la question.
      texteCorr = '' // Idem pour le texte de la correction.
      let a = 0
      let b = 0
      let x1 = 0
      let x2 = 0
      let y1 = 0
      let y2 = 0
      switch (listeTypeDeQuestions[i]) {
        case 0: // fonction constante
          a = 0
          b = randint(-10, 10, 0)
          x1 = randint(-5, -1)
          x2 = randint(1, 5)
          y1 = b
          y2 = b
          texteCorr = `On remarque que $f(${x1})=f(${x2})=${b}$ donc la droite représentant la fonction $f$ passe par deux points distincts ayant la même ordonnée.<br>`
          texteCorr += `Elle est donc parallèle à l'axe des abscisses. La fonction $f$ est une fonction constante et $${miseEnEvidence(`f(x)=${b}`)}$.`
          handleAnswers(
            this,
            i,
            { reponse: { value: `f(x)=${b}` } },
            { formatInteractif: 'mathlive' },
          )
          if (this.correctionDetaillee) {
            tA = tracePoint(pointAbstrait(x1, y1), 'red')
            tB = tracePoint(pointAbstrait(x2, y2), 'red')

            r = repere({
              xMin: -5,
              yMin: Math.min(-1, b - 1),
              xMax: 5,
              yMax: Math.max(b + 1, 2),
            })
            texteCorr += `<br><br>${mathalea2d(
              {
                xmin: -5,
                ymin: Math.min(-1, b - 1),
                xmax: 5,
                ymax: Math.max(b + 1, 2),
                pixelsParCm: 20,
                scale: 0.7,
              },
              r,
              courbe((x) => a * x + b, { repere: r, color: bleuMathalea }),
              tA,
              tB,
            )}`
          }
          break

        case 1: // f(0)=y1 f(x2)= y2 a et b entiers relatifs.
          a = randint(-2, 2, 0)
          b = randint(-5, 5, 0)
          x1 = 0
          y1 = b
          x2 = randint(-5, 5, 0)
          y2 = b + a * x2
          texteCorr = `Soit $f(x)=ax+b$. Nous savons que $f(0)=${y1}=b$.<br>`
          texteCorr += `Donc $f(x)=ax${ecritureAlgebrique(y1)}$. En utilisant la donnée $f(${x2})=${y2}$ on obtient : $a \\times ${ecritureParentheseSiNegatif(x2)}${ecritureAlgebrique(b)}=${y2}$ d'où $a \\times ${ecritureParentheseSiNegatif(x2)}=${y2}${ecritureAlgebrique(-b)}=${y2 - b}$ donc $a=\\dfrac{${y2 - b}}{${x2}}=${a}$.<br>`
          texteCorr += `Donc $${miseEnEvidence(`f(x)=${reduireAxPlusB(a, b)}`)}$.`
          handleAnswers(
            this,
            i,
            { reponse: { value: `f(x)=${a}x${ecritureAlgebrique(b)}` } },
            { formatInteractif: 'mathlive' },
          )
          if (this.correctionDetaillee) {
            tA = tracePoint(pointAbstrait(x1, y1), 'red')
            tB = tracePoint(pointAbstrait(x2, y2), 'red')

            r = repere({
              xMin: -5,
              yMin: Math.min(-5 * a + b, 5 * a + b),
              xMax: 5,
              yMax: Math.max(-5 * a + b, 5 * a + b),
            })
            texteCorr += `<br><br>${mathalea2d(
              {
                xmin: -5,
                ymin: Math.min(-5 * a + b, 5 * a + b),
                xmax: 5,
                ymax: Math.max(-5 * a + b, 5 * a + b),
                pixelsParCm: 20,
                scale: 0.7,
              },
              r,
              courbe((x) => a * x + b, { repere: r, color: bleuMathalea }),
              tA,
              tB,
            )}`
          }
          break

        case 2: // f(x1)=y1 et f(x1+1)=y2
          a = randint(-5, 5, 0)
          b = randint(-5, 5, 0)
          x1 = randint(-5, 5, [-1, 0])
          y1 = a * x1 + b
          x2 = x1 + 1
          y2 = b + a * x2
          texteCorr = `Soit $f(x)=ax+b$. On passe de $${x1}$ à $${x2}$ en ajoutant 1, donc la pente $a$ de la droite correspond à $f(${x2})-f(${x1})=${y2}-${ecritureParentheseSiNegatif(y1)}=`
          if (y1 < 0) texteCorr += `${y2}${ecritureAlgebrique(-y1)}=${a}$.<br>`
          else texteCorr += `${a}$.<br>`
          texteCorr += `Donc $f(x)=${a}x+b$.<br>En utilisant la donnée $f(${x2})=${y2}$ on obtient : $${a} \\times ${ecritureParentheseSiNegatif(x2)}+b=${y2}$ d'où $${a * x2}+b=${y2}$ donc $b=${y2}${ecritureAlgebrique(-a * x2)}=${b}$.<br>`
          texteCorr += `Donc $${miseEnEvidence(`f(x)=${reduireAxPlusB(a, b)}`)}$.`
          handleAnswers(
            this,
            i,
            { reponse: { value: `f(x)=${a}x${ecritureAlgebrique(b)}` } },
            { formatInteractif: 'mathlive' },
          )
          if (this.correctionDetaillee) {
            tA = tracePoint(pointAbstrait(x1, y1), 'red')
            tB = tracePoint(pointAbstrait(x2, y2), 'red')

            r = repere({
              xMin: -5,
              yMin: Math.min(-5 * a + b, 5 * a + b),
              xMax: 5,
              yMax: Math.max(-5 * a + b, 5 * a + b),
            })
            texteCorr += `<br><br>${mathalea2d(
              {
                xmin: -5,
                ymin: Math.min(-5 * a + b, 5 * a + b),
                xmax: 5,
                ymax: Math.max(-5 * a + b, 5 * a + b),
                pixelsParCm: 20,
                scale: 0.7,
              },
              r,
              courbe((x) => a * x + b, { repere: r, color: bleuMathalea }),
              tA,
              tB,
            )}`
          }
          break

        case 3: // f(x1)=y1 f(x2)=y2 a et b entiers
          a = randint(-5, 5, 0)
          b = randint(-5, 5, 0)
          x1 = randint(-5, 5, 0)
          y1 = a * x1 + b
          x2 = randint(-5, 5, [0, x1])
          y2 = b + a * x2
          texteCorr = `Soit $f(x)=ax+b$. En utilisant les données de l'énoncé, on obtient : $f(${x1})=${y1}=a \\times ${ecritureParentheseSiNegatif(x1)}+b$ et $f(${x2})=${y2}=a \\times ${ecritureParentheseSiNegatif(x2)}+b$.<br>`
          texteCorr += `Donc d'une part : $b=${y1}+a\\times ${ecritureParentheseSiNegatif(-x1)}$ et d'autre part : $b=${y2}+a\\times ${ecritureParentheseSiNegatif(-x2)}$.<br>`
          texteCorr += `Par identification, on obtient : $${y1}+a\\times ${ecritureParentheseSiNegatif(-x1)}=${y2}+a\\times ${ecritureParentheseSiNegatif(-x2)}$.<br>`
          texteCorr += `On en déduit que $${y1}${ecritureAlgebrique(-y2)}=a(${x1}${ecritureAlgebrique(-x2)})$ soit $${y1 - y2}=${x1 - x2}a$.<br>`
          texteCorr += `Donc $a=\\dfrac{${y1 - y2}}{${x1 - x2}}=${a}$.<br>`
          texteCorr += `Donc $b=${y1}${ecritureAlgebrique(a)}\\times ${ecritureParentheseSiNegatif(-x1)}=${y1}${ecritureAlgebrique(-a * x1)}=${b}$.<br>`
          texteCorr += `Donc $${miseEnEvidence(`f(x)=${reduireAxPlusB(a, b)}`)}$.`
          handleAnswers(
            this,
            i,
            { reponse: { value: `f(x)=${a}x${ecritureAlgebrique(b)}` } },
            { formatInteractif: 'mathlive' },
          )
          if (this.correctionDetaillee) {
            tA = tracePoint(pointAbstrait(x1, y1), 'red')
            tB = tracePoint(pointAbstrait(x2, y2), 'red')

            r = repere({
              xMin: -5,
              yMin: Math.min(-5 * a + b, 5 * a + b),
              xMax: 5,
              yMax: Math.max(-5 * a + b, 5 * a + b),
            })
            texteCorr += `<br><br>${mathalea2d(
              {
                xmin: -5,
                ymin: Math.min(-5 * a + b, 5 * a + b),
                xmax: 5,
                ymax: Math.max(-5 * a + b, 5 * a + b),
                pixelsParCm: 20,
                scale: 0.7,
              },
              r,
              courbe((x) => a * x + b, { repere: r, color: bleuMathalea }),
              tA,
              tB,
            )}`
          }
          break

        case 4: {
          x1 = randint(-5, 5, 0)
          x2 = randint(-5, 5, [0, x1])
          y1 = randint(-5, 5)
          y2 = randint(-5, 5, y1)
          const aFrac = new FractionEtendue(y2 - y1, x2 - x1)
          let bFrac = new FractionEtendue(y2 - y1, x2 - x1)
          bFrac = aFrac.multiplieEntier(-x1).ajouteEntier(y1)
          texteCorr = `Soit $f(x)=ax+b$. En utilisant les données de l'énoncé, on obtient : $f(${x1})=${y1}=a \\times ${ecritureParentheseSiNegatif(x1)}+b$ et $f(${x2})=${y2}=a \\times ${ecritureParentheseSiNegatif(x2)}+b$.<br>`
          texteCorr += `Donc d'une part : $b=${y1}+a\\times ${ecritureParentheseSiNegatif(-x1)}$ et d'autre part : $b=${y2}+a\\times ${ecritureParentheseSiNegatif(-x2)}$.<br>`
          texteCorr += `Par identification, on obtient : $${y1}+a\\times ${ecritureParentheseSiNegatif(-x1)}=${y2}+a\\times ${ecritureParentheseSiNegatif(-x2)}$.<br>`
          texteCorr += `On en déduit que $${y1}${ecritureAlgebrique(-y2)}=a(${x1}${ecritureAlgebrique(-x2)})$ soit $${y1 - y2}=${x1 - x2}a$.<br>`
          texteCorr += `Donc $a=\\dfrac{${y1 - y2}}{${x1 - x2}}=${aFrac.texFractionSimplifiee}$.<br>`
          texteCorr += `Donc $b=${y1}+${aFrac.signe === -1 ? '\\Big(' : ''}${aFrac.texFractionSimplifiee}${aFrac.signe === -1 ? '\\Big)' : ''}\\times ${ecritureParentheseSiNegatif(-x1)}=${fraction(y1 * aFrac.denIrred, aFrac.denIrred).texFraction}+${aFrac.multiplieEntier(-x1).texFractionSimplifiee}=${bFrac.texFractionSimplifiee}$.<br>`
          texteCorr += `Donc $${miseEnEvidence(`f(x)=${aFrac.texFractionSimplifiee}x${bFrac.num === 0 ? '' : bFrac.simplifie().texFractionSignee}`)}$.`
          handleAnswers(
            this,
            i,
            {
              reponse: {
                value: `f(x)=${aFrac.texFractionSimplifiee}x${bFrac.simplifie().texFractionSignee}`,
              },
            },
            { formatInteractif: 'mathlive' },
          )
          if (this.correctionDetaillee) {
            tA = tracePoint(pointAbstrait(x1, y1), 'red')
            tB = tracePoint(pointAbstrait(x2, y2), 'red')

            a = aFrac.n / aFrac.d
            b = bFrac.n / bFrac.d
            r = repere({
              xMin: -5,
              yMin: Math.round(Math.min(-5 * a + b, 5 * a + b)),
              xMax: 5,
              yMax: Math.round(Math.max(-5 * a + b, 5 * a + b)),
            })
            texteCorr += `<br><br>${mathalea2d(
              {
                xmin: -5,
                ymin: Math.round(Math.min(-5 * a + b, 5 * a + b)),
                xmax: 5,
                ymax: Math.round(Math.max(-5 * a + b, 5 * a + b)),
                pixelsParCm: 20,
                scale: 0.7,
              },
              r,
              courbe((x) => a * x + b, { repere: r, color: bleuMathalea }),
              tA,
              tB,
            )}`
          }
          break
        }
      }
      texte = `La fonction $f$ est une fonction affine et on sait que $f(${x1})=${y1}$ et $f(${x2})=${y2}$.<br>`
      texte += 'Déterminer la forme algébrique de la fonction $f$.'
      texte += ajouteChampTexteMathLive(
        this,
        i,
        KeyboardType.clavierFullOperations,
      )
      if (
        this.questionJamaisPosee(
          i,
          x1,
          x2,
          y1,
          y2,
          a,
          b,
          listeTypeDeQuestions[i],
        )
      ) {
        // Si la question n'a jamais été posée, on la stocke dans la liste des questions
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this) // On envoie l'exercice à la fonction de mise en page
  }
}
