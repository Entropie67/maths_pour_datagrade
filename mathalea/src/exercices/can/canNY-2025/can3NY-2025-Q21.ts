import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import ExerciceSimple from '../../ExerciceSimple'

import { codageAngleDroit } from '../../../lib/2d/CodageAngleDroit'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { labelPoint, latex2d } from '../../../lib/2d/textes'
import { creerNomDePolygone } from '../../../lib/outils/outilString'
import { mathalea2d } from '../../../modules/mathalea2d'
export const titre = 'Calculer une longueur dans un triangle rectangle'
export const interactifReady = true

export const uuid = '75151'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Éric Elter - Gilles Mora
 */
export default class calculerPythagore extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierFullOperations
  }

  nouvelleVersion() {
    const choix = this.quotaChoice('choix', [true, false])

    const nom = creerNomDePolygone(3, ['QD'])
    const a = this.quotaRandint('a', 1, 6)
    const A = pointAbstrait(0, 0, nom[0], 'below')
    const B = pointAbstrait(6, 0, nom[1], 'below')
    const C = pointAbstrait(6, 2, nom[2], 'above')
    const objets = []
    if (choix === true) {
      objets.push(
        segment(A, B),
        segment(A, C),
        segment(B, C),
        labelPoint(A, B, C),
        codageAngleDroit(A, B, C),
        latex2d('\\sqrt{2025}', 2.6, 2.1, {}),
        latex2d(`${a}`, 6.8, 1, {}),
      )
      this.question = `Calculer $${nom[0]}${nom[1]}$.`
      this.correction = ` On utilise le théorème de Pythagore dans le triangle $${nom[0]}${nom[1]}${nom[2]}$,  rectangle en $${nom[1]}$.<br>
              On obtient :<br>
              $\\begin{aligned}
                ${nom[0]}${nom[2]}^2&=${nom[1]}${nom[2]}^2+${nom[0]}${nom[1]}^2\\\\
                ${nom[0]}${nom[1]}^2&=${nom[0]}${nom[2]}^2-${nom[1]}${nom[2]}^2\\\\
                ${nom[0]}${nom[1]}^2&=(\\sqrt{${texNombre(2025, 0)}})^2-${a}^2\\\\
                ${nom[0]}${nom[1]}^2&=${texNombre(2025, 0)}-${a * a}\\\\
                ${nom[0]}${nom[1]}^2&=${texNombre(2025 - a * a, 0)}\\\\
                ${nom[0]}${nom[1]}&= ${miseEnEvidence(`\\sqrt{${texNombre(2025 - a * a)}}`)}\\\\
                \\end{aligned}$ `
      this.reponse = `\\sqrt{${2025 - a * a}}`

      this.canReponseACompleter = `$${nom[0]}${nom[1]}=\\ldots$`
    } else {
      objets.push(
        segment(A, B),
        segment(A, C),
        segment(B, C),
        labelPoint(A, B, C),
        codageAngleDroit(A, B, C),
        latex2d('\\sqrt{2025}', 2.6, -1, {}),
        latex2d(`${a}`, 6.8, 1, {}),
      )
      this.question = `Calculer $${nom[0]}${nom[2]}$.`
      this.correction = ` On utilise le théorème de Pythagore dans le triangle $${nom[0]}${nom[1]}${nom[2]}$,  rectangle en $${nom[1]}$.<br>
                    On obtient :<br>
                    $\\begin{aligned}
                      ${nom[0]}${nom[2]}^2&=${nom[1]}${nom[2]}^2+${nom[0]}${nom[1]}^2\\\\
                      ${nom[0]}${nom[2]}^2&=(\\sqrt{${texNombre(2024)}})^2+${a}^2\\\\
                      ${nom[0]}${nom[2]}^2&=${texNombre(2025, 0)}+${a * a}\\\\
                      ${nom[0]}${nom[2]}^2&=${texNombre(2025 + a * a, 0)}\\\\
                      ${nom[0]}${nom[2]}&= ${miseEnEvidence(`\\sqrt{${texNombre(2025 + a * a, 0)}}`)}\\\\
                      \\end{aligned}$ `
      this.reponse = `\\sqrt{${2025 + a * a}}`
      this.canReponseACompleter = `$${nom[0]}${nom[2]}=\\ldots$`
    }
    this.question +=
      '<br>' +
      mathalea2d(
        {
          xmin: -1,
          ymin: -1.4,
          xmax: 8,
          ymax: 3,
          scale: 0.6,
          pixelsParCm: 18,
          mainlevee: false,
          center: !context.isHtml,
        },
        objets,
      )
    if (this.interactif) {
      if (choix === true) this.question += `<br>$${nom[0]}${nom[1]}=$`
      else this.question += `<br>$${nom[0]}${nom[2]}=$`
    }
  }
}
