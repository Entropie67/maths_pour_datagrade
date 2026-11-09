import { bleuMathalea } from '../../../lib/colors'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import {
  barycentre,
  polygone,
  polygoneAvecNom,
} from '../../../lib/2d/polygones'
import { texteSurSegment } from '../../../lib/2d/texteSurSegment'
import { rotation } from '../../../lib/2d/transformations'
import { propositionsQcm } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  texteEnCouleur,
  texteEnCouleurEtGras,
} from '../../../lib/outils/embellissements'
import { creerNomDePolygone } from '../../../lib/outils/outilString'
import { mathalea2d } from '../../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../../types/2d'
import Exercice from '../../Exercice'
export const dateDeModifImportante = '07/11/2026'
export const titre = 'Déterminer si un triangle est rectangle'
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const dateDePublication = '01/10/2023'

/**
 * @author Jean-Claude  Lhote
 */

export const uuid = '5344c'

export const refs = {
  'fr-fr': ['can4G1-05'],
  'fr-ch': ['11LCGM2B-2', '11LSGM2B-2'],
}
export default class TripletsPythagoriciensOuPas extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const listeTripletsPythagoriciens = [
        [3, 4, 5],
        [5, 12, 13],
        [6, 8, 10],
        [8, 15, 17],
        [9, 12, 15],
        [12, 16, 20],
        [15, 20, 25],
      ]
      const listeTripletsNonPytagoriciens = [
        [3, 4, 6],
        [6, 12, 13],
        [5, 8, 10],
        [8, 15, 18],
        [9, 13, 15],
        [12, 16, 18],
        [15, 16, 25],
        [3, 5, 6],
        [5, 11, 13],
        [6, 9, 11],
        [8, 16, 20],
        [10, 13, 15],
        [12, 18, 20],
        [13, 15, 25],
      ]
      const choix = choice([true, false]) // rectangle ? ou pas
      const triplet = choix
        ? choice(listeTripletsPythagoriciens)
        : choice(listeTripletsNonPytagoriciens)
      const nom = Array.from(creerNomDePolygone(3, ['QD']))
      const scale = 4 / triplet[1]
      const A = pointAbstrait(0, 0)
      const B = pointAbstrait(triplet[0] * scale, 0)
      const C = pointAbstrait(triplet[0] * scale, triplet[1] * scale)
      const abc = polygone(A, B, C)
      const O = barycentre(abc)
      const tri = rotation(abc, O, randint(0, 360))
      const a = tri.listePoints[0]
      const b = tri.listePoints[1]
      const c = tri.listePoints[2]
      a.nom = nom[0]
      b.nom = nom[1]
      c.nom = nom[2]
      const poly = polygoneAvecNom(a, b, c)
      const longueurAB = texteSurSegment(
        String(triplet[0]),
        b,
        a,
        'black',
        0.5,
        true,
      )
      const longueurBC = texteSurSegment(
        String(triplet[1]),
        c,
        b,
        'black',
        0.5,
        true,
      )
      const longueurCA = texteSurSegment(
        String(triplet[2]),
        a,
        c,
        'black',
        0.5,
        true,
      )
      const objets: NestedObjetMathalea2dArray = [poly]
      objets.push(longueurCA, longueurAB, longueurBC)
      let texte = `Dans le triangle $${nom}$, `
      texte += `$${nom[0]}${nom[1]}=${triplet[0]}\\text{ cm}$, $${nom[1]}${nom[2]}=${triplet[1]}\\text{ cm}$ et $${nom[0]}${nom[2]}=${triplet[2]}$.<br>Ce triangle est-il rectangle (La figure n'est pas forcément représentative) ?<br>`
      objets.push()
      const figure = mathalea2d(
        Object.assign(
          { scale: 0.6, display: 'inline' } as const,
          fixeBordures(objets),
        ),
        objets,
      )
      texte += figure
      this.canEnonce = texte
      this.autoCorrection[i] = {
        enonce: texte,
        propositions: [
          {
            texte: 'Vrai',
            statut: choix === true,
          },
          {
            texte: 'Faux',
            statut: choix === false,
          },
        ],
        options: { ordered: true, radio: true },
      }
      const monQcm = propositionsQcm(this, i)
      if (this.interactif) {
        texte += monQcm.texte
      }
      let texteCorr = `Le plus grand côté du triangle est $[${nom[0]}${nom[2]}]$ et $${nom[0]}${nom[2]}^2=${triplet[2]}^2=${triplet[2] ** 2}$.<br>`
      texteCorr += `D'autre part, $${nom[0]}${nom[1]}^2+${nom[2]}${nom[1]}^2=${triplet[0]}^2+${triplet[1]}^2=${triplet[0] ** 2}+${triplet[1] ** 2}=${triplet[0] ** 2 + triplet[1] ** 2}$.<br>`
      texteCorr += choix
        ? `On constate que $${nom[0]}${nom[2]}^2=${nom[0]}${nom[1]}^2+${nom[2]}${nom[1]}^2$ donc, d'après la réciproque de la propriété de Pythagore, le triangle $${nom}$ ${texteEnCouleurEtGras('est rectangle')} en $${nom[1]}$.`
        : `On constate que $${nom[0]}${nom[2]}^2\\neq ${nom[0]}${nom[1]}^2+${nom[2]}${nom[1]}^2$ donc, d'après la contraposée du théorème de Pythagore, le triangle $${nom}$ ${texteEnCouleurEtGras("n'est pas rectangle")} en $${nom[1]}$.`
      texteCorr += choix
        ? ''
        : '<br>' +
          texteEnCouleur(
            `On aurait pu regarder uniquement la somme des chiffres des unités : $${triplet[0] ** 2 % 10}+${triplet[1] ** 2 % 10}$ finit par  $${((triplet[0] ** 2 % 10) + (triplet[1] ** 2 % 10)) % 10}$ qui n'est pas compatible avec $${triplet[2] ** 2}$`,
            bleuMathalea,
          )

      if (this.questionJamaisPosee(i, triplet.join(''))) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr

        this.listeCanEnonces.push(this.canEnonce)
        this.listeCanReponsesACompleter.push(monQcm.texte)
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
