import { droiteGraduee } from '../../../lib/2d/DroiteGraduee'
import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Déterminer une abscisse sur une droite graduée'
export const interactifReady = true

export const uuid = 'f7b05'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class NomExercice extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsChampTexte = { texteApres: '.' }
    this.canOfficielle = false
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      const d = droiteGraduee({
        Unite: 3,
        Min: 0,
        Max: 3,
        x: 0,
        y: 0,
        thickDistance: 1,
        thickSec: true,
        thickSecDist: 0.25,
        thickOffset: 0,
        axeStyle: '->',
        pointListe: [[1.25, 'A']],
        pointCouleur: bleuMathalea,
        pointStyle: 'x',
        labelsPrincipaux: true,
      })
      this.reponse = '1.25'
      this.question = mathalea2d(
        {
          xmin: -1,
          ymin: -1.5,
          xmax: 10,
          ymax: 1.5,
          scale: 0.6,
          center: !context.isHtml,
        },
        d,
      )
      this.question += "<br>L'abscisse du point $A$ est : "
      this.correction = `Entre $0$ et $1$, il y a $4$ intervalles.<br>
      Une graduation correspond donc à $0,25$.<br>
      Ainsi, l'abscisse du point $A$ est : $${miseEnEvidence(texNombre(1.25))}$.`
    } else {
      const choix = this.quotaChoice('choix', [true, false])
      const a = this.quotaChoice(
        'a',
        ['0.25', '0.75', '1.25', '1.5', '1.75', '2.25', '2.75'].map(Number),
      )
      const b = this.quotaRandint('b', 1, 14, [5, 10]) / 5
      const d = droiteGraduee({
        Unite: 3,
        Min: 0,
        Max: 3,
        x: 0,
        y: 0,
        thickDistance: 1,
        thickSec: true,
        thickSecDist: choix ? 0.25 : 0.2,
        thickOffset: 0,
        axeStyle: '->',
        pointListe: choix ? [[a, 'A']] : [[b, 'A']],
        pointCouleur: bleuMathalea,
        pointStyle: 'x',
        labelsPrincipaux: true,
      })
      this.reponse = choix ? a.toFixed(2) : b.toFixed(2)
      this.question = mathalea2d(
        {
          xmin: -1,
          ymin: -1.3,
          xmax: 10,
          ymax: 1.2,
          scale: 0.6,
          center: !context.isHtml,
        },
        d,
      )
      this.question += "<br>L'abscisse du point $A$ est : "
      this.correction = `Entre $0$ et $1$, il y a ${choix ? '$4$' : '$5$'} intervalles.<br>
      Une graduation correspond donc à ${choix ? '$0,25$' : '$0,2$'}.<br>
      Ainsi, l'abscisse du point $A$ est : ${choix ? `$${miseEnEvidence(texNombre(a, 2))}$` : `$${miseEnEvidence(texNombre(b))}$`}.`
    }

    this.canReponseACompleter = '$\\ldots$'
    if (!this.interactif && context.isHtml) {
      this.question += '$\\ldots$'
    }
  }
}
