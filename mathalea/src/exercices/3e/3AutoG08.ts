import { fixeBordures } from '../../lib/2d/fixeBordures'
import { placeLatexSurSegment } from '../../lib/2d/placeLatexSurSegment'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { nommePolygone, polygone } from '../../lib/2d/polygones'
import { polygoneRegulierParCentreEtRayon } from '../../lib/2d/polygonesParticuliers'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import ExerciceSimple from '../ExerciceSimple'

export const titre = 'Calculer un périmètre'

export const interactifReady = true

export const dateDePublication = '25/12/2025'
export const dateDeModifImportante = '30/10/2026'

export const uuid = '6c987'

export const refs = {
  'fr-fr': ['3AutoG08'],
  'fr-ch': ['9R1GM1A-6', '9R2GM1A-6', '9R3GM1A-6', 'PRQMG01B-11'],
}

function choisirPolygone(
  original: boolean,
  longueur: number,
  nbCotes: number,
): NestedObjetMathalea2dArray {
  const legende = `${texNombre(longueur, 1)}\\text{ cm}`
  if (original) {
    const p1 = pointAbstrait(0, 0)
    const p2 = pointAbstrait(3, 2)
    const p3 = pointAbstrait(6, 0)
    const p4 = pointAbstrait(3, -2)
    const poly = polygone([p1, p2, p3, p4])
    const affichageLongueur = placeLatexSurSegment(legende, p1, p2, {
      distance: 1,
      letterSize: 'small',
      horizontal: true,
    })
    return [poly, nommePolygone(poly, 'ADCB'), affichageLongueur]
  } else {
    const p1 = pointAbstrait(0, 0)
    const poly = polygoneRegulierParCentreEtRayon(p1, 3, nbCotes)
    const A = poly.listePoints[0]
    const B = poly.listePoints[1]
    const affichageLongueur = placeLatexSurSegment(legende, A, B, {
      distance: 1.2,
      letterSize: 'small',
      horizontal: true,
    })
    return [
      poly,
      nommePolygone(poly, 'ABCDEFGHIJ'.slice(0, nbCotes)),
      affichageLongueur,
    ]
  }
}
/**
 * @author Jean-claude Lhote
 */
export default class CalculerUnPerimetre extends ExerciceSimple {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = [
      'Sujet original (autres paramètres inutiles si coché)',
      false,
    ]
    this.besoinFormulaire2CaseACocher = ['Valeurs entières', true]
    this.sup = false
    this.sup2 = false
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.optionsChampTexte = { texteApres: ' cm' }
  }

  nouvelleVersion() {
    const nbCotes = this.sup ? 4 : choice([3, 4, 5, 6, 8, 10])
    const nom = this.sup
      ? 'losange'
      : nbCotes === 3
        ? 'triangle équilatéral'
        : nbCotes === 4
          ? 'carré'
          : nbCotes === 5
            ? 'pentagone régulier'
            : nbCotes === 6
              ? 'hexagone régulier'
              : nbCotes === 8
                ? 'octogone régulier'
                : 'décagone régulier'

    const longueur = this.sup
      ? 3
      : this.sup2
        ? randint(2, 9)
        : (randint(2, 8) * 2 + 1) * 0.5
    const elementsGraphiques = choisirPolygone(this.sup, longueur, nbCotes)

    this.reponse = texNombre(nbCotes * longueur, 1)

    this.question = `Calculer le périmètre du ${nom} $${'ABCDEFGHIJ'.slice(0, nbCotes)}$ représenté ci-dessous :<br>
${mathalea2d(Object.assign({ scale: 0.5 }, fixeBordures(elementsGraphiques)), elementsGraphiques)}`
    this.correction = `Le polygone a $${nbCotes.toString()}$ côtés de longueur $${texNombre(
      longueur,
      1,
    )}$ cm.<br>
Le périmètre est donc égal à :<br>
$${nbCotes} \\times ${texNombre(longueur, 1)}\\text{ cm} = ${miseEnEvidence(this.reponse)}$ cm.`
  }
}
