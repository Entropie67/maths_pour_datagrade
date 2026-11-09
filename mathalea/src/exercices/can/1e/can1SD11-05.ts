import { courbe } from '../../../lib/2d/Courbe'
import { repere } from '../../../lib/2d/reperes'
import { texteParPosition } from '../../../lib/2d/textes'
import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../../lib/interactif/questionMathLive'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'
import { sp } from '../../../lib/outils/outilString'

export const titre = 'Lire graphiquement le signe de $a$ et de $\\Delta$'
export const interactifReady = true

export const dateDePublication = '08/06/2022' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
export const dateDeModifImportante = '12/10/2024'
// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle

/**
 *
 * @author Gilles Mora
 */
export const uuid = 'a8936'

export const refs = {
  'fr-fr': ['can1SD11-05'],
  'fr-ch': [],
}
export default class LectureGraphiqueParabole extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let texte,
      texteCorr,
      a: number,
      alpha: number,
      beta: number,
      r,
      F,
      o,
      texteIntro,
      texteNI,
      texteI

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      texteNI = 'Donner le signe de $a$ et de $\\Delta$.<br>'
      texteIntro =
        'La courbe représente une fonction $f$ définie par $f(x)=ax^2+bx+c$.<br>'
      texteI =
        `Donner le signe de $a$ et de $\\Delta$ (compléter avec $>$, $<$ ou $=$)${sp()}:<br>`
      switch (
        choice([1, 2, 3, 4, 5, 6]) //
      ) {
        case 1: // cas parabole a>0 et delta<0
          a = randint(0, 1) + randint(5, 9) / 10
          alpha = randint(-2, 1) + randint(1, 9) / 10
          beta = randint(0, 2) + randint(4, 9) / 10
          o = texteParPosition('O', -0.3, -0.3, 0, 'black', 1)
          texte = `${texteIntro}`
          if (!this.interactif) {
            texte += `${texteNI}`
          } else {
            texte += `${texteI}`
            texte += remplisLesBlancs(
              this,
              i,
              'a \\,%{champ1} \\, 0 \\text{ et } \\Delta \\, %{champ2}\\, 0',
              KeyboardType.clavierCompare,
            )
          }
          handleAnswers(this, i, {
            bareme: (listePoints) => [
              Math.min(listePoints[0], listePoints[1]),
              1,
            ],
            champ1: { value: '>', options: { texteSansCasse: true } },
            champ2: { value: '<', options: { texteSansCasse: true } },
          })
          // $${delta}$ et $${a}(x-${alpha})^2+${beta}$
          r = repere({
            xMin: -5,
            yMin: -1,
            yMax: 6,
            xMax: 5,
            thickHauteur: 0.1,
            xLabelMin: -4,
            xLabelMax: 4,
            yLabelMax: 5,
            axeXStyle: '->',
            axeYStyle: '->',
          })

          F = (x: number) => a * (x - alpha) ** 2 + beta
          texte += mathalea2d(
            {
              xmin: -5,
              xmax: 5,
              ymin: -1.5,
              ymax: 6,
              pixelsParCm: 25,
              scale: 0.65,
              center: !context.isHtml,
            },
            r,
            o,
            courbe(F, { repere: r, color: bleuMathalea, epaisseur: 2 }),
          )

          texteCorr = `La parabole a «${sp()}les bras${sp()}» tournés vers le haut, on en déduit que $a${miseEnEvidence('>')}0$. <br>
      De plus, elle ne coupe pas l'axe des abscisses, donc $f$ n'a pas de racines et par suite $\\Delta${miseEnEvidence('<')}0$.`
          break

        case 2: // cas parabole a>0 et delta>0
          a = randint(0, 1) + randint(5, 9) / 10
          alpha = randint(-2, 1) + randint(1, 9) / 10
          beta = randint(-2, 0) - randint(4, 9) / 10
          o = texteParPosition('O', -0.3, -0.3, 0, 'black', 1)
          texte = `${texteIntro}`
          if (!this.interactif) {
            texte += `${texteNI}`
          } else {
            texte += `${texteI}`
            texte += remplisLesBlancs(
              this,
              i,
              'a \\, %{champ1} \\, 0 \\text{ et } \\Delta \\, %{champ2}\\, 0',
              KeyboardType.clavierCompare,
            )
          }
          handleAnswers(this, i, {
            bareme: (listePoints) => [
              Math.min(listePoints[0], listePoints[1]),
              1,
            ],
            champ1: { value: '>', options: { texteSansCasse: true } },
            champ2: { value: '>', options: { texteSansCasse: true } },
          })
          // $${delta}$ et $${a}(x-${alpha})^2+${beta}$

          r = repere({
            xMin: -5,
            yMin: -4,
            yMax: 5,
            xMax: 5,
            thickHauteur: 0.1,
            xLabelMin: -4,
            xLabelMax: 4,
            yLabelMax: 4,
            yLabelMin: -3,
            axeXStyle: '->',
            axeYStyle: '->',
          })

          F = (x: number) => a * (x - alpha) ** 2 + beta
          texte += mathalea2d(
            {
              xmin: -5,
              xmax: 5,
              ymin: -4.5,
              ymax: 5,
              pixelsParCm: 25,
              scale: 0.65,
              center: !context.isHtml,
            },
            r,
            o,
            courbe(F, { repere: r, color: bleuMathalea, epaisseur: 2 }),
          )
          texteCorr = `La parabole a «${sp()}les bras${sp()}» tournés vers le haut, on en déduit que $a${miseEnEvidence('>')}0$. <br>
    De plus, elle coupe l'axe des abscisses en deux points, donc $f$ a deux racines et par suite $\\Delta${miseEnEvidence('>')}0$.`
          break

        case 3: // cas parabole a>0 et delta=0
          a = randint(0, 1) + randint(5, 9) / 10
          alpha = randint(-2, 1) + randint(1, 9) / 10
          beta = 0
          o = texteParPosition('O', -0.3, -0.3, 0, 'black', 1)
          texte = `${texteIntro}`
          if (!this.interactif) {
            texte += `${texteNI}`
          } else {
            texte += `${texteI}`
            texte += remplisLesBlancs(
              this,
              i,
              'a \\, %{champ1} \\, 0 \\text{ et } \\Delta \\, %{champ2}\\, 0',
              KeyboardType.clavierCompare,
            )
          }
          handleAnswers(this, i, {
            bareme: (listePoints) => [
              Math.min(listePoints[0], listePoints[1]),
              1,
            ],
            champ1: { value: '>', options: { texteSansCasse: true } },
            champ2: { value: '=', options: { texteSansCasse: true } },
          })
          // $${delta}$ et $${a}(x-${alpha})^2+${beta}$
          r = repere({
            xMin: -5,
            yMin: -2,
            yMax: 5,
            xMax: 5,
            thickHauteur: 0.1,
            xLabelMin: -4,
            xLabelMax: 4,
            yLabelMax: 4,
            axeXStyle: '->',
            yLabelMin: -1,
            axeYStyle: '->',
          })

          F = (x: number) => a * (x - alpha) ** 2 + beta
          texte += mathalea2d(
            {
              xmin: -5,
              xmax: 5,
              ymin: -2.5,
              ymax: 5,
              pixelsParCm: 25,
              scale: 0.65,
              center: !context.isHtml,
            },
            r,
            o,
            courbe(F, { repere: r, color: bleuMathalea, epaisseur: 2 }),
          )

          texteCorr = `La parabole a «${sp()}les bras${sp()}» tournés vers le haut, on en déduit que $a${miseEnEvidence('>')}0$. <br>
 De plus, elle coupe l'axe des abscisses en un point, donc $f$ a une seule racine et par suite $\\Delta${miseEnEvidence('=')}0$.`
          break

        case 4: // cas parabole a<0 et delta=0
          a = randint(-1, 0) - randint(5, 9) / 10
          alpha = randint(-2, 1) + randint(1, 9) / 10
          beta = 0
          o = texteParPosition('O', -0.3, -0.3, 0, 'black', 1)
          texte = `${texteIntro}`
          if (!this.interactif) {
            texte += `${texteNI}`
          } else {
            texte += `${texteI}`
            texte += remplisLesBlancs(
              this,
              i,
              'a \\, %{champ1} \\, 0 \\text{ et } \\Delta \\, %{champ2}\\, 0',
              KeyboardType.clavierCompare,
            )
          }
          handleAnswers(this, i, {
            bareme: (listePoints) => [
              Math.min(listePoints[0], listePoints[1]),
              1,
            ],
            champ1: { value: '<', options: { texteSansCasse: true } },
            champ2: { value: '=', options: { texteSansCasse: true } },
          })
          // $${delta}$ et $${a}(x-${alpha})^2+${beta}$

          r = repere({
            xMin: -5,
            yMin: -5,
            yMax: 2,
            xMax: 5,
            thickHauteur: 0.1,
            xLabelMin: -4,
            xLabelMax: 4,
            yLabelMax: 1,
            axeXStyle: '->',
            yLabelMin: -4,
            axeYStyle: '->',
          })

          F = (x: number) => a * (x - alpha) ** 2 + beta
          texte += mathalea2d(
            {
              xmin: -5,
              xmax: 5,
              ymin: -5.5,
              ymax: 2,
              pixelsParCm: 25,
              scale: 0.65,
              center: !context.isHtml,
            },
            r,
            o,
            courbe(F, { repere: r, color: bleuMathalea, epaisseur: 2 }),
          )

          texteCorr = `La parabole a «${sp()}les bras${sp()}» tournés vers le bas, on en déduit que $a${miseEnEvidence('<')}0$. <br>
 De plus, elle coupe l'axe des abscisses en un point, donc $f$ a une seule racine et par suite $\\Delta${miseEnEvidence('=')}0$.`
          break

        case 5: // cas parabole a<0 et delta>0
          a = randint(-1, 0) - randint(5, 9) / 10
          alpha = randint(-2, 1) + randint(1, 9) / 10
          beta = randint(1, 3) + randint(4, 9) / 10
          o = texteParPosition('O', -0.3, -0.3, 0, 'black', 1)
          texte = `${texteIntro}`
          if (!this.interactif) {
            texte += `${texteNI}`
          } else {
            texte += `${texteI}`
            texte += remplisLesBlancs(
              this,
              i,
              'a \\, %{champ1} \\, 0 \\text{ et } \\Delta \\, %{champ2}\\, 0',
              KeyboardType.clavierCompare,
            )
          }
          handleAnswers(this, i, {
            bareme: (listePoints) => [
              Math.min(listePoints[0], listePoints[1]),
              1,
            ],
            champ1: { value: '<', options: { texteSansCasse: true } },
            champ2: { value: '>', options: { texteSansCasse: true } },
          })
          // $${delta}$ et $${a}(x-${alpha})^2+${beta}$

          r = repere({
            xMin: -5,
            yMin: -2,
            yMax: 5,
            xMax: 5,
            thickHauteur: 0.1,
            xLabelMin: -4,
            yLabelMin: -1,
            xLabelMax: 3,
            yLabelMax: 4,
            axeXStyle: '->',
            axeYStyle: '->',
          })

          F = (x: number) => a * (x - alpha) ** 2 + beta
          texte += mathalea2d(
            {
              xmin: -5,
              xmax: 5,
              ymin: -2.5,
              ymax: 5,
              pixelsParCm: 25,
              scale: 0.65,
              center: !context.isHtml,
            },
            r,
            o,
            courbe(F, { repere: r, color: bleuMathalea, epaisseur: 2 }),
          )

          texteCorr = `La parabole a «${sp()}les bras${sp()}» tournés vers le bas, on en déduit que $a${miseEnEvidence('<')}0$. <br>
 De plus, elle coupe l'axe des abscisses en deux points, donc $f$ a deux racines et par suite $\\Delta${miseEnEvidence('>')}0$.`
          break

        case 6: // cas parabole a<0 et delta<0
        default:
          a = randint(-1, 0) - randint(3, 7) / 10
          alpha = randint(-2, 1) + randint(1, 9) / 10
          beta = randint(-1, 0) - randint(4, 9) / 10
          o = texteParPosition('O', -0.3, -0.3, 0, 'black', 1)
          texte = `${texteIntro}`
          if (!this.interactif) {
            texte += `${texteNI}`
          } else {
            texte += `${texteI}`
            texte += remplisLesBlancs(
              this,
              i,
              'a \\, %{champ1} \\, 0 \\text{ et } \\Delta \\, %{champ2}\\, 0',
              KeyboardType.clavierCompare,
            )
          }
          handleAnswers(this, i, {
            bareme: (listePoints) => [
              Math.min(listePoints[0], listePoints[1]),
              1,
            ],
            champ1: { value: '<', options: { texteSansCasse: true } },
            champ2: { value: '<', options: { texteSansCasse: true } },
          })
          // $${delta}$ et $${a}(x-${alpha})^2+${beta}$

          r = repere({
            xMin: -5,
            yMin: -5,
            yMax: 2,
            xMax: 5,
            thickHauteur: 0.1,
            xLabelMin: -4,
            yLabelMin: -4,
            xLabelMax: 4,
            yLabelMax: 1,
            axeXStyle: '->',
            axeYStyle: '->',
          })

          F = (x: number) => a * (x - alpha) ** 2 + beta
          texte += mathalea2d(
            {
              xmin: -5,
              xmax: 5,
              ymin: -5.5,
              ymax: 2,
              pixelsParCm: 25,
              scale: 0.65,
              center: !context.isHtml,
            },
            r,
            o,
            courbe(F, { repere: r, color: bleuMathalea, epaisseur: 2 }),
          )

          texteCorr = `La parabole a «${sp()}les bras${sp()}» tournés vers le bas, on en déduit que $a${miseEnEvidence('<')}0$. <br>
 De plus, elle ne coupe pas l'axe des abscisses, donc $f$ n'a pas de racines et par suite $\\Delta${miseEnEvidence('<')}0$.`
          break
      }

      if (this.questionJamaisPosee(i, a, alpha, beta)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr

        this.canEnonce = texte
        this.canReponseACompleter = '$a\\ldots 0$ et $\\Delta \\ldots 0$'
        this.listeCanEnonces.push(this.canEnonce)
        this.listeCanReponsesACompleter.push(this.canReponseACompleter)
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
