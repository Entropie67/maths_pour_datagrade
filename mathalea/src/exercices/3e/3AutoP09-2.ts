import { courbe } from '../../lib/2d/Courbe'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { lectureAntecedent } from '../../lib/2d/LectureAntecedent'
import { lectureImage } from '../../lib/2d/LectureImage'
import { repere } from '../../lib/2d/reperes'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'

export const titre = 'Lire la distance de freinage en fonction de la vitesse'

export const interactifReady = true

export const dateDePublication = '2/01/2026'
export const dateDeModifImportante = '15/04/2026'

export const uuid = '5bc87'

export const refs = {
  'fr-fr': ['3AutoP04-2'],
  'fr-ch': ['11LCFA2H-4', '11LSFA2H-4'],
}

/**
 * @author Jean-claude Lhote
 */
export default class VitesseEtDistance extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 1
    this.optionsDeComparaison = { estDansIntervalle: true }
    this.formatChampTexte = KeyboardType.clavierNumbers
  }

  nouvelleVersion(): void {
    const inversement = choice([true, false])
    const reciproquement = choice([true, false])
    const isDry = choice([true, false])
    const cfl = randint(-5, 5) / 100 + 0.5
    const distanceByVitesse = (v: number) =>
      ((isDry ? 1 : 2) * (v / 3.6) ** 2) / (19.6 * cfl)
    const vitesseByDistance = (d: number) =>
      Math.sqrt((d * 19.6 * cfl) / (isDry ? 1 : 2)) * 3.6
    const vitesse = choice([30, 50, 70, 90, 110, 130])
    const dist = isDry ? randint(10, 13) * 10 : randint(20, 26) * 10
    if (inversement) {
      const rep = repere({
        xMin: 0,
        xMax: isDry ? 155 : 310,
        yMin: 0,
        yMax: 140,
        xUnite: isDry ? 0.1 : 0.05,
        yUnite: 0.1,
        xLabelDistance: 20,
        yLabelDistance: 20,
        xThickDistance: isDry ? 10 : 20,
        yThickDistance: 10,
        grilleSecondaireX: true,
        grilleSecondaireXDistance: 0.2,
        xLegende: 'Distance de freinage (m)',
        xLegendePosition: [16.1, 0],
        yLegende: 'Vitesse (km/h)',
        yLegendePosition: [-2, 15],
      })
      const cF = courbe(vitesseByDistance, {
        repere: rep,
        xMin: 0,
        xMax: isDry ? 150 : 300,
      })
      const objets = [rep, cF]
      const graphique = mathalea2d(
        Object.assign({ scale: 0.7, pixelsParCm: 20 }, fixeBordures(objets)),
        objets,
      )
      const objetsCorr = [
        ...objets,
        reciproquement
          ? lectureAntecedent(
              distanceByVitesse(vitesse),
              vitesse,
              isDry ? 10 : 20,
              10,
              'red',
              '',
              '',
            )
          : lectureImage(
              dist,
              vitesseByDistance(dist),
              isDry ? 10 : 20,
              10,
              'red',
              '',
              '',
            ),
      ]
      const graphiqueCorr = mathalea2d(
        Object.assign(
          { scale: 0.7, pixelsParCm: 20 },
          fixeBordures(objetsCorr),
        ),
        objetsCorr,
      )
      this.question = `${graphique}<br><br>`
      this.question += reciproquement
        ? `Une voiture roule à la vitesse de $${vitesse}\\text{ km/h}$ sur une route ${isDry ? 'sèche' : 'mouillée'}.<br>
    En utilisant le graphique ci-dessous, quelle est la distance de freinage en mètres ?`
        : `Une voiture freine sur une route ${isDry ? 'sèche' : 'mouillée'} et parcourt $${dist}\\text{ m}$.<br>
    En utilisant le graphique ci-dessous, à quelle vitesse roulait-elle ?`
      this.correction =
        `${graphiqueCorr}<br><br>` +
        (reciproquement
          ? `Pour une vitesse de $${vitesse}\\text{ km/h}$, la distance de freinage est d'environ $${miseEnEvidence(Math.round(distanceByVitesse(vitesse)))}\\text{ m}$.`
          : `Pour une distance de freinage de $${dist}\\text{ m}$, la vitesse est d'environ $${miseEnEvidence(Math.round(vitesseByDistance(dist)))}\\text{ km/h}$.`)
      this.reponse = reciproquement
        ? `[${Math.floor(distanceByVitesse(vitesse) - 2)};${Math.ceil(distanceByVitesse(vitesse) + 2)}]`
        : `[${Math.floor(vitesseByDistance(dist) - 2)};${Math.ceil(vitesseByDistance(dist) + 2)}]`
      this.optionsChampTexte = reciproquement
        ? { texteApres: ' $\\text{m}$' }
        : { texteApres: ' $\\text{km/h}$' }
    } else {
      const rep = repere({
        xMin: 0,
        xMax: 140,
        yMin: 0,
        yMax: isDry ? 155 : 310,
        xUnite: 0.1,
        yUnite: isDry ? 0.1 : 0.05,
        xLabelDistance: 20,
        yLabelDistance: 20,
        xThickDistance: 10,
        yThickDistance: isDry ? 10 : 20,
        grilleSecondaireY: true,
        grilleSecondaireYDistance: 0.2,
        xLegende: 'Vitesse (km/h)',
        xLegendePosition: [15, 0],
        yLegende: 'Distance de freinage (m)',
        yLegendePosition: [-2, 16.5],
      })
      const cF = courbe(distanceByVitesse, { repere: rep, xMin: 0, xMax: 135 })
      const objets = [rep, cF]
      const graphique = mathalea2d(
        Object.assign({ scale: 0.7, pixelsParCm: 20 }, fixeBordures(objets)),
        objets,
      )
      const objetsCorr = [
        ...objets,
        reciproquement
          ? lectureAntecedent(
              vitesseByDistance(dist),
              dist,
              10,
              isDry ? 10 : 20,
              'red',
              '',
              '',
            )
          : lectureImage(
              vitesse,
              distanceByVitesse(vitesse),
              10,
              isDry ? 10 : 20,
              'red',
              '',
              '',
            ),
      ]
      const graphiqueCorr = mathalea2d(
        Object.assign(
          { scale: 0.7, pixelsParCm: 20 },
          fixeBordures(objetsCorr),
        ),
        objetsCorr,
      )
      this.question = `${graphique}<br><br>`
      this.question += reciproquement
        ? `Une voiture freine sur une route ${isDry ? 'sèche' : 'mouillée'} et parcourt $${dist}\\text{ m}$.<br>
    En utilisant le graphique ci-dessous, dire à quelle vitesse elle roulait ?`
        : `Une voiture roule à la vitesse de $${vitesse}\\text{ km/h}$ sur une route ${isDry ? 'sèche' : 'mouillée'}.<br>
    En utilisant le graphique ci-dessous, quelle est la distance de freinage en mètres ?`
      this.correction =
        `${graphiqueCorr}<br><br>` +
        (reciproquement
          ? `Pour une distance de freinage de $${dist}\\text{ m}$, la vitesse est d'environ $${miseEnEvidence(Math.round(vitesseByDistance(dist)))}\\text{ km/h}$.`
          : `Pour une vitesse de $${vitesse}\\text{ km/h}$, la distance de freinage est d'environ $${miseEnEvidence(Math.round(distanceByVitesse(vitesse)))}\\text{ m}$.`)
      this.reponse = reciproquement
        ? `[${Math.floor(vitesseByDistance(dist) - 2)};${Math.ceil(vitesseByDistance(dist) + 2)}]`
        : `[${Math.floor(distanceByVitesse(vitesse) - 2)};${Math.ceil(distanceByVitesse(vitesse) + 2)}]`
      this.optionsChampTexte = reciproquement
        ? { texteApres: ' $\\text{km/h}$' }
        : { texteApres: ' $\\text{m}$' }
    }
  }
}
