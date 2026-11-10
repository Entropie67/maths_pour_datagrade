import { fixeBordures } from '../../lib/2d/fixeBordures'
import { repere } from '../../lib/2d/reperes'
import { texteParPosition } from '../../lib/2d/textes'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu } from '../../modules/outils'
import Representerfonctionaffine from '../2e/2F21-3'

export const titre = 'Tracer une droite donnée par son équation réduite'
export const dateDePublication = '21/10/2026'
export const interactifReady = true
export const dateDeModifImportante = '27/10/2026'

export const uuid = '665d8'
export const refs = {
  'fr-fr': ['1A-F06-1'],
  'fr-ch': [],
}

/**
 * Reprise de 2F21-3 pour les automatismes de 1re : une seule question,
 * la droite est donnée par son équation réduite (et non par une fonction affine).
 * @author Arnaud Meistermann
 */
export default class TracerDroiteEquationReduite extends Representerfonctionaffine {
  constructor() {
    super()
    this.reponseCourteDisponible = false // La réponse est une figure ou un tableau.
    this.nbQuestions = 1
    // La figure interactive a la même amplitude que le repère de la correction
    this.figureSuitCorrection = true
    // Correction par l'ordonnée à l'origine et le coefficient directeur
    this.sup2 = 1
    this.besoinFormulaire2Numerique = false
  }

  nouvelleVersion() {
    super.nouvelleVersion()
    // La consigne est dans chaque question : « Tracer la droite d'équation $y=…$. »
    this.consigne = ''
    // Hors interactif, l'élève trace la droite dans un repère vide, de même amplitude que celui de la correction
    const figureVide = (cadre: (typeof this.cadres)[number]) => {
      const repereVide = [
        repere(cadre),
        texteParPosition('O', -0.5, -0.5, 0, 'black', 1),
      ]
      return mathalea2d(
        Object.assign({ scale: 0.6 }, fixeBordures(repereVide)),
        repereVide,
      )
    }
    this.listeQuestions = this.listeQuestions.map(
      (question, i) =>
        question.replace(
          /^\$f_\{\d+\}\(x\)=([^$]*)\$ ?/,
          `Tracer${this.interactif ? '' : ', dans le repère suivant,'} la droite d'équation $$y=$1$$.`,
        ) + (this.interactif ? '' : figureVide(this.cadres[i])),
    )
    this.listeCorrections = this.listeCorrections.map((correction) =>
      correction
        .replace(
          /On constate que \$f_\{\d+\}\$ est une fonction linéaire\. Sa représentation graphique est donc une droite passant par l'origine\./,
          "L'ordonnée à l'origine est nulle, la droite passe donc par l'origine.",
        )
        .replace(
          "On sait que la représentation graphique d'une fonction affine est une droite.<br>",
          '',
        ),
    )
    listeQuestionsToContenu(this)
  }
}
