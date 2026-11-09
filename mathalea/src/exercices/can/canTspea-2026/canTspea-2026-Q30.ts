import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { polyline } from '../../../lib/2d/Polyline'
import { repere } from '../../../lib/2d/reperes'
import { texteParPosition } from '../../../lib/2d/textes'
import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { mathalea2d } from '../../../modules/mathalea2d'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Question $30$'
export const interactifReady = true

export const uuid = 'brlw7'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/ export default class Can2026TermQ30 extends ExerciceCan {
  enonce(choix?: { x: number; pente: number }): void {
    if (choix == null) {
      const listeValeurs = [
        { x: -4, pente: 0 },
        { x: -3.5, pente: 0 },
        { x: -2.5, pente: -1 },
        { x: -2.2, pente: -1 },
        { x: -1.5, pente: 2 },
        { x: -1.8, pente: 2 },
        { x: -0.5, pente: 0 },
        { x: 0, pente: 0 },
        { x: 0.5, pente: 0 },
        { x: 1.4, pente: -2 },
        { x: 1.5, pente: -2 },
        { x: 1.6, pente: -2 },
        { x: 2.5, pente: 1 },
        { x: 2.2, pente: 1 },
        { x: 3.5, pente: 0 },
        { x: 4, pente: 0 },
      ]
      choix = choice(listeValeurs)
    }

    // 1. Définition du repère
    const r = repere({
      xMin: -5,
      xMax: 5,
      yMin: -1,
      yMax: 3,
      grilleX: true,
      grilleY: true,
      grilleSecondaire: true,
      grilleSecondaireXDistance: 0.5,
      grilleSecondaireYDistance: 0.5,
      xUnite: 1,
      yUnite: 1,
      axeXStyle: '->',
      axeYStyle: '->',
    })

    // 2. Définition des points
    const p1 = pointAbstrait(-4.5, 1)
    const p2 = pointAbstrait(-3, 1)
    const p3 = pointAbstrait(-2, 0)
    const p4 = pointAbstrait(-1, 2)
    const p5 = pointAbstrait(1, 2)
    const p6 = pointAbstrait(2, 0)
    const p7 = pointAbstrait(3, 1)
    const p8 = pointAbstrait(4.5, 1)

    // 3. Tracé de la ligne avec la couleur passée directement
    const courbe = polyline([p1, p2, p3, p4, p5, p6, p7, p8], bleuMathalea)
    courbe.epaisseur = 2

    // 4. Création des étiquettes
    const nomCourbe = texteParPosition('$C_f$', -3.5, 1.7)
    const labelX = texteParPosition('$x$', 4.7, -0.4)
    const labelY = texteParPosition('$y$', -0.4, 3.2)

    // 5. Rendu (Ajout indispensable des "..." devant objets pour corriger l'erreur de "length")
    const objets = [nomCourbe, labelX, labelY, r, courbe]
    const figure = mathalea2d(
      Object.assign({ pixelsParCm: 30, scale: 0.8 }, fixeBordures(objets)),
      ...objets,
    )

    // 6. Affectations générales
    const xString = texNombre(choix.x, 1)
    this.reponse = choix.pente.toString()

    this.question = `${figure}`
    if (this.interactif) {
      this.question += `<br>$f'(${xString})=$`
    } else {
      this.question += `<br>$f'(${xString})=\\ldots$`
    }

    // 7. Correction simplifiée avec mise en évidence
    this.correction = `Le nombre dérivé $f'(${xString})$ est égal au coefficient directeur de la tangente à la courbe au point d'abscisse $${xString}$.<br>
    En ce point, la courbe est confondue avec sa tangente.<br>
    $f'(${xString})$ est donc égal au coefficient directeur de la droite contenant le segment de la courbe sur lequel se trouve le point d'abscisse $${xString}$.<br>`
    this.correction += `Par lecture graphique, ce coefficient directeur est égal à $${choix.pente}$.<br>`
    this.correction += `On en déduit que $f'(${xString}) = ${miseEnEvidence(choix.pente.toString())}$.`
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    // 8. Affectations CAN
    this.canEnonce = figure
    this.canReponseACompleter = `$f'(${xString}) = \\dots$`
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce({ x: 1.4, pente: -2 })
    else this.enonce()
  }
}
