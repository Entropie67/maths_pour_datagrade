import type { IPoint3d } from '../../lib/2d/Interfaces'
import { tracePoint } from '../../lib/2d/TracePoint'
import { vide2d } from '../../lib/2d/Vide2d'
import { labelPoint } from '../../lib/2d/textes'
import {
  arete3d,
  point3d,
} from '../../lib/3d/3dProjectionMathalea2d/elementsEtTransformations3d'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { bleuMathalea } from '../../lib/colors'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { lettreDepuisChiffre, sp } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'

/**
 * Convertit un angle en degrés vers des radians
 */
function degToRad(deg: number): number {
  return (deg * Math.PI) / 180
}

/**
 * Calcule le sinus d'un angle en degrés
 */
function degSin(deg: number): number {
  return Math.sin(degToRad(deg))
}

export const titre = 'Se repérer sur un pavé droit'
export const amcReady = true
export const amcType = 'AMCHybride'
export const dateDeModifImportante = '25/11/2024'
export const dateDePublication = '09/06/2021'
/**
 * Un point est situé dans un pavé découpé suivant les trois axes, on doit donner ses coordonnées
 * @author Arnaud Durand et Jean-claude Lhote (AMC par Éric Elter)
 * Ajout d'un paramètre permettant de choisir entre placer un point et lire ses coordonnées
 */
export const uuid = '9c916'

export const refs = {
  'fr-fr': ['4G52'],
  'fr-ch': [],
}

const longueur3d = (A: IPoint3d, B: IPoint3d): number => {
  return Math.sqrt((A.x - B.x) ** 2 + (A.y - B.y) ** 2 + (A.z - B.z) ** 2)
}
export default class ReperagePaveDroit extends Exercice {
  constructor() {
    super()

    this.consigne = `Dans le repère $(A~;~I~;~J~;~K)$${sp()}:`
    this.nbQuestions = 3

    this.besoinFormulaireNumerique = [
      'Angle de la perspective',
      3,
      '1 : 30°\n2 : 45°\n3 : 60°',
    ]
    this.sup = 1

    this.besoinFormulaire2Numerique = [
      'Type de questions',
      3,
      '1 : Placer un point\n2 : Lire les coordonnées\n3 : Mélange',
    ]
    this.sup2 = 1
  }

  nouvelleVersion() {
    // c'est ici que les données sont relatives
    const hauteur = 12
    const largeur = 12
    const profondeur = 12
    if (this.sup === 3) {
      context.anglePerspective = 60
      context.coeffPerspective = 0.4
    } else if (this.sup === 2) {
      context.anglePerspective = 45
      context.coeffPerspective = 0.3
    } else {
      context.anglePerspective = 30
      context.coeffPerspective = 0.4
    }
    const A = point3d(0, 0, 0, true, 'A', 'below left')
    /* EE : Sinon, des points sont illisibles car sur ces points-là.
    const B = point3d(largeur, 0, 0, true, 'B', 'below right')
    const C = point3d(largeur, profondeur, 0, true, 'C', 'above right')
    const D = point3d(0, profondeur, 0, true, 'D', 'above left')
    const E = point3d(0, 0, hauteur, true, 'E', 'above left')
    const F = point3d(largeur, 0, hauteur, true, 'F', 'above right')
    const G = point3d(largeur, profondeur, hauteur, true, 'G', 'above right')
    const H = point3d(0, profondeur, hauteur, true, 'H', 'above left')
    */
    const objetsAtracer: NestedObjetMathalea2dArray = []
    let nbgraduationx = randint(2, 4)
    let nbgraduationy = randint(2, 3)
    let nbgraduationz = randint(2, 4)
    while (nbgraduationx >= 3 && nbgraduationy >= 3) {
      nbgraduationx = randint(2, 5)
      nbgraduationy = randint(2, 3, nbgraduationx)
      nbgraduationz = randint(2, 5, [nbgraduationx, nbgraduationy])
    }
    const deltax = largeur / nbgraduationx
    const deltay = profondeur / nbgraduationy
    const deltaz = hauteur / nbgraduationz
    const I = point3d(deltax, 0, 0, true, 'I', 'below right')
    const J = point3d(0, deltay, 0, false, 'J', 'above left')
    const K = point3d(0, 0, deltaz, true, 'K', 'left')

    // objetsAtracer.push(labelPoint(A, B, C, D, E, F, G, H, I, J, K))
    objetsAtracer.push(labelPoint(A.c2d, I.c2d, J.c2d, K.c2d))

    for (let i = 0; i <= nbgraduationy; i++) {
      for (let j = 0, M, N, s; j <= nbgraduationz; j++) {
        M = point3d(0, i * deltay, j * deltaz)
        N = point3d(largeur, i * deltay, j * deltaz)

        if (i === 0 || j === nbgraduationz) {
          s = arete3d(M, N, 'black', true)
        } else {
          s = arete3d(M, N, 'black', false)
        }
        objetsAtracer.push(s.c2d)
      }
    }
    for (let i = 0; i <= nbgraduationx; i++) {
      for (let j = 0, M, N, s; j <= nbgraduationz; j++) {
        M = point3d(i * deltax, 0, j * deltaz)
        N = point3d(i * deltax, profondeur, j * deltaz)
        if (i === nbgraduationx || j === nbgraduationz) {
          s = arete3d(M, N, 'black', true)
        } else {
          s = arete3d(M, N, 'black', false)
        }
        objetsAtracer.push(s.c2d)
      }
    }

    for (let i = 0, M, N, s; i <= nbgraduationx; i++) {
      M = point3d(i * deltax, 0, 0)
      N = point3d(i * deltax, 0, hauteur)
      s = arete3d(M, N, 'black', true)
      objetsAtracer.push(s.c2d)
      M = point3d(i * deltax, profondeur, 0)
      N = point3d(i * deltax, profondeur, hauteur)
      if (i < nbgraduationx) {
        s = arete3d(M, N, 'black', false)
      } else {
        s = arete3d(M, N, 'black', true)
      }
      objetsAtracer.push(s.c2d)
    }
    for (let i = 1, M, N, s; i < nbgraduationy; i++) {
      M = point3d(0, i * deltay, 0)
      N = point3d(0, i * deltay, hauteur)
      s = arete3d(M, N, 'black', false)
      objetsAtracer.push(s.c2d)
      M = point3d(largeur, i * deltay, 0)
      N = point3d(largeur, i * deltay, hauteur)
      s = arete3d(M, N, 'black', true)
      objetsAtracer.push(s.c2d)
    }

    let typesDeQuestionsDisponibles = ['placer', 'lire']
    if (this.sup2 === 1) typesDeQuestionsDisponibles = ['placer']
    if (this.sup2 === 2) typesDeQuestionsDisponibles = ['lire']
    const listeTypesDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    const coordExistantes = [
      [0, 0, 0],
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ]
    for (
      let i = 0,
        texte,
        texteCorr,
        cpt = 0,
        pointCoord,
        s1,
        s2,
        s3,
        x,
        y,
        z,
        t,
        pointAplacer;
      i < this.nbQuestions && cpt < 50;
    ) {
      let exists
      const objetsAtracerCorr: NestedObjetMathalea2dArray = []
      do {
        // Pour éviter d'avoir deux points avec les mêmes coordonnées que des points déjà présents
        x = randint(0, nbgraduationx)
        y = randint(0, nbgraduationy)
        z = randint(0, nbgraduationz)
        const target = [x, y, z]
        exists = coordExistantes.some(
          (coord) =>
            coord.length === target.length &&
            coord.every((val, index) => val === target[index]),
        )
      } while (exists)
      pointCoord = [x, y, z]
      coordExistantes[i + 4] = pointCoord
      pointAplacer = point3d(
        pointCoord[0] * deltax,
        pointCoord[1] * deltay,
        pointCoord[2] * deltaz,
        true,
        lettreDepuisChiffre(i + 12),
        `${lettreDepuisChiffre(i + 12)}`,
      )
      const pointAbscisse = point3d(pointAplacer.x, 0, 0)
      const pointOrdonnee = point3d(pointAplacer.x, pointAplacer.y, 0)
      s1 =
        longueur3d(pointAbscisse, A) === 0
          ? vide2d()
          : arete3d(A, point3d(pointAplacer.x, 0, 0), bleuMathalea, true).c2d
      s2 =
        longueur3d(pointAbscisse, pointOrdonnee) === 0
          ? vide2d()
          : arete3d(
              point3d(pointAplacer.x, 0, 0),
              point3d(pointAplacer.x, pointAplacer.y, 0),
              'green',
              true,
            ).c2d
      s3 =
        longueur3d(pointOrdonnee, pointAplacer) === 0
          ? vide2d()
          : arete3d(
              point3d(pointAplacer.x, pointAplacer.y, 0),
              pointAplacer,
              'red',
              true,
            ).c2d
      //

      s1.epaisseur = 3
      s2.epaisseur = 3
      s3.epaisseur = 3
      t = tracePoint(pointAplacer, 'red')
      t.epaisseur = 2
      t.taille = 6
      pointAplacer.c2d.positionLabel = 'above right'

      objetsAtracerCorr.push(t, labelPoint(pointAplacer.c2d), ...objetsAtracer)
      ;[s1, s2, s3].forEach((seg) => {
        if ('longueur' in seg && seg.longueur && seg.longueur > 0) {
          objetsAtracerCorr.push(seg)
        }
      })
      let propositionsAMC
      if (listeTypesDeQuestions[i] === 'placer') {
        texte = `Placer le point $${lettreDepuisChiffre(i + 12)}$ de coordonnées $(${pointCoord[0]}~;~${pointCoord[1]}~;~${pointCoord[2]})$.`
        texteCorr = mathalea2d(
          {
            xmin: -1,
            xmax:
              1 +
              largeur +
              profondeur * Math.cos(degToRad(context.anglePerspective)),
            ymin: -1,
            ymax:
              1 +
              hauteur +
              profondeur *
                context.coeffPerspective *
                degSin(context.anglePerspective),
            scale: 0.6,
            display: 'block',
          },
          objetsAtracerCorr,
        )
        texteCorr += `$${lettreDepuisChiffre(i + 12)}$ de coordonnées $(${miseEnEvidence(pointCoord[0], bleuMathalea)}~;~${miseEnEvidence(pointCoord[1], 'green')}~;~${miseEnEvidence(pointCoord[2], 'red')})$.<br>`
        propositionsAMC = [
          {
            type: 'AMCOpen',
            propositions: [
              {
                texte: '',
                statut: 1, // OBLIGATOIRE (ici c'est le nombre de lignes du cadre pour la réponse de l'élève sur AMC)
                feedback: '',
                enonce: `Placer le point $${lettreDepuisChiffre(i + 12)}$ de coordonnées  ($${x}$ ; $${y}$ ; $${z}$ ).<br>`, // EE : ce champ est facultatif et fonctionnel qu'en mode hybride (en mode normal, il n'y a pas d'intérêt)
                sanscadre: true, // EE : ce champ est facultatif et permet (si true) de cacher le cadre et les lignes acceptant la réponse de l'élève
                pointilles: true, // EE : ce champ est facultatif et permet (si false) d'enlever les pointillés sur chaque ligne.
              },
            ],
          },
        ]
      } else {
        texte = `Donner les coordonnées du point $${lettreDepuisChiffre(i + 12)}$.`
        objetsAtracer.push(
          tracePoint(pointAplacer, bleuMathalea),
          labelPoint(pointAplacer.c2d),
        )
        texteCorr = mathalea2d(
          {
            xmin: -1,
            xmax:
              1 +
              largeur +
              profondeur * Math.cos(degToRad(context.anglePerspective)),
            ymin: -1,
            ymax:
              1 +
              hauteur +
              profondeur *
                context.coeffPerspective *
                degSin(context.anglePerspective),
            scale: 0.6,
            display: 'block',
          },
          objetsAtracerCorr,
        )
        texteCorr += `Le point $${lettreDepuisChiffre(i + 12)}$ a pour coordonnées $(${miseEnEvidence(pointCoord[0], bleuMathalea)}~;~${miseEnEvidence(pointCoord[1], 'green')}~;~${miseEnEvidence(pointCoord[2], 'red')})$.`
        propositionsAMC = [
          {
            type: 'AMCNum',
            propositions: [
              {
                texte: '',
                statut: '',
                reponse: {
                  texte: `Donner la première coordonnée du point $${lettreDepuisChiffre(i + 12)}$.`,
                  valeur: pointCoord[0],
                  param: {
                    digits: 1,
                    decimals: 0,
                    signe: false,
                    approx: 0,
                  },
                },
              },
            ],
          },
          {
            type: 'AMCNum',
            propositions: [
              {
                texte: '',
                statut: '',
                reponse: {
                  texte: `Donner la deuxième coordonnée du point $${lettreDepuisChiffre(i + 12)}$.`,
                  valeur: pointCoord[1],
                  param: {
                    digits: 1,
                    decimals: 0,
                    signe: false,
                    approx: 0,
                  },
                },
              },
            ],
          },
          {
            type: 'AMCNum',
            propositions: [
              {
                texte: '',
                statut: '',
                reponse: {
                  texte: `Donner la troisième coordonnée du point $${lettreDepuisChiffre(i + 12)}$.`,
                  valeur: pointCoord[2],
                  param: {
                    digits: 1,
                    decimals: 0,
                    signe: false,
                    approx: 0,
                  },
                },
              },
            ],
          },
        ]
      }
      if (context.isAmc) {
        this.autoCorrectionAMC[i] = {
          enonce: '',
          enonceAvant: false,
          enonceAvantUneFois: this.nbQuestions > 1,
          enonceApresNumQuestion: this.nbQuestions === 1,
          options: {
            multicols: true,
            barreseparation: true,
            multicolsAll: true,
          },
          propositions: propositionsAMC,
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      }

      if (this.questionJamaisPosee(i, x, y, z)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        // Couleurs pédagogiques (une par axe) : la réponse courte est donnée explicitement.
        this.listeReponsesCourtes[i] =
          listeTypesDeQuestions[i] === 'placer'
            ? null
            : `$(${pointCoord[0]}~;~${pointCoord[1]}~;~${pointCoord[2]})$`
        i++
      }
      cpt++
    }
    if (context.isAmc) {
      this.autoCorrection[0].enonce = mathalea2d(
        {
          xmin: -1,
          xmax:
            1 +
            largeur +
            profondeur *
              context.coeffPerspective *
              Math.cos(degToRad(context.anglePerspective)),
          ymin: -1,
          ymax:
            1 +
            hauteur +
            profondeur *
              context.coeffPerspective *
              degSin(context.anglePerspective),
          scale: 0.4,
        },
        objetsAtracer,
      )
    }
    this.introduction =
      (context.vue === 'diap' ? '<center>' : '') +
      mathalea2d(
        {
          xmin: -1,
          xmax:
            1 +
            largeur +
            profondeur *
              context.coeffPerspective *
              Math.cos(degToRad(context.anglePerspective)),
          ymin: -1,
          ymax:
            1 +
            hauteur +
            profondeur *
              context.coeffPerspective *
              degSin(context.anglePerspective),
          scale: 0.6,
          display: 'block',
        },
        objetsAtracer,
      ) +
      (context.vue === 'diap' ? '</center>' : '')
    listeQuestionsToContenu(this)
  }
}
