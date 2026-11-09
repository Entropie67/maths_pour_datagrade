import { codageAngle } from '../../lib/2d/angles'
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import type { IPointAbstrait, IPolygone } from '../../lib/2d/Interfaces'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint, texteParPosition } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { rotation } from '../../lib/2d/transformations'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { bleuMathalea } from '../../lib/colors'
import { arcenciel, texcolors } from '../../lib/format/style'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { nombreAvecEspace } from '../../lib/outils/texNombre'
import { rotationAnimee } from '../../modules/2dAnimation'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  contraindreValeur,
  egal,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import { Pavage, pavage } from '../../modules/Pavage'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'

export const titre =
  "Trouver l'image d'une figure par une rotation dans un pavage"
export const dateDePublication = '16/12/2020'
export const dateDeModifImportante = '01/04/2025'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'

/**
 * Trouver l'image par sune rotation d'une figure dans un pavage
 * @author Jean-claude Lhote
 * Rajout par EE d'un quatrième paramètre, de l'interactif et de l'AMC
 */
export const uuid = '442e0'

export const refs = {
  'fr-fr': ['3G12'],
  'fr-ch': ['10CTES2A-2', '10LCES2A-2', '10LSES2A-2'],
}
export default class PavageEtRotation2D extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Taille du pavage (la grande est automatique au-delà de 5 questions)',
      2,
      ' 1 : Taille modeste\n 2 : Grande taille',
    ]
    this.besoinFormulaire2CaseACocher = ['Montrer les centres']
    this.besoinFormulaire3Numerique = [
      'Choix du pavage',
      8,
      "1 : Triangles équilatéraux\n2 : Carrés\n3 : Hexagones réguliers\n4 : Carrés et triangles équilatéraux\n5 : Octogones et carrés\n 6 : Losanges (pavage hexagonal d'écolier)\n7 : Hexagones et triangles équilatéraux\n8 : Un des sept pavages au hasard",
    ]
    this.besoinFormulaire4CaseACocher = ["Ignorer l'angle de 180$^\\circ$"]
    this.nbQuestions = 3

    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = true
    this.spacing = 2

    this.sup = 1 // 1 pour des pavages modestes, 2 pour des plus grand.
    this.sup2 = false // On cache les barycentres par défaut.
    this.sup3 = 7
    this.sup4 = true // On ignore les rotations centrales par défaut.
    this.spacingCorr = context.isHtml ? 2.5 : 1.5
  }

  nouvelleVersion() {
    const videcouples = function (tableau: number[][]) {
      for (let k = 0; k < tableau.length; k++) {
        if (tableau[k][0] === tableau[k][1]) {
          tableau.splice(k, 1)
        }
        /* for (let j = k + 1; j < tableau.length; j++) {
          if (tableau[k][1] === tableau[j][0]) {

          }
        } */
      }
      return tableau
    }
    const compare2polys = function (poly1: IPolygone, poly2: IPolygone) {
      if (comparenbsommets(poly1, poly2)) {
        return comparesommets(poly1, poly2)
      } else {
        return false
      }
    }
    const comparenbsommets = function (poly1: IPolygone, poly2: IPolygone) {
      return poly1.listePoints.length === poly2.listePoints.length
    }

    const compare2sommets = function (
      sommet1: IPointAbstrait,
      sommet2: IPointAbstrait,
    ) {
      return egal(sommet1.x, sommet2.x, 0.1) && egal(sommet1.y, sommet2.y, 0.1)
    }
    const comparesommets = function (poly1: IPolygone, poly2: IPolygone) {
      let trouve = false
      let trouves = 0
      if (comparenbsommets(poly1, poly2)) {
        for (const P of poly1.listePoints) {
          for (const M of poly2.listePoints) {
            if (compare2sommets(M, P)) {
              trouve = true
            }
            if (trouve) {
              break
            }
          }
          if (trouve) {
            trouves++
            trouve = false
          } else {
            trouves -= 100
          }
          if (trouves < 0) {
            break
          }
        }
      }
      return trouves === poly1.listePoints.length
    }

    const rotaccion = function (
      pavage: Pavage,
      A: IPointAbstrait,
      angle: number,
      numero: number,
    ) {
      const poly = pavage.polygones[numero - 1]
      let pol
      const result = -1
      const sympoly = rotation(poly, A, angle) as IPolygone
      for (let k = 0; k < pavage.polygones.length; k++) {
        pol = pavage.polygones[k]
        if (compare2polys(sympoly, pol)) {
          return k + 1
        }
      }
      return result
    }

    const objets: NestedObjetMathalea2dArray = []
    const objetsCorrection: NestedObjetMathalea2dArray = []
    let taillePavage = contraindreValeur(1, 2, this.sup, 2)
    if (taillePavage < 1 || taillePavage > 2) {
      taillePavage = 1
    }
    if (this.nbQuestions > 5) {
      taillePavage = 2
    }

    let Nx
    let Ny
    let index1
    let A = pointAbstrait(0, 0)
    let image
    let couples: number[][] = []
    let tailles = []
    let monpavage
    let fenetreMathalea2d
    let texte = ''
    let texteCorr = ''
    let typeDePavage = contraindreValeur(1, 7, this.sup, 1) as
      1 | 2 | 3 | 4 | 5 | 6 | 7
    let nombreTentatives
    let nombrePavageTestes = 1
    const propositionsAMC = []
    let texteAMC
    let sensdirect = 1
    let M
    let N
    let trace
    let label
    let P1
    let P2
    let P3
    let t
    const alphas = [
      [60, 120, 180],
      [90, 180],
      [60, 120, 180],
      [60, 120, 90],
      [45, 90, 135, 180],
      [60, 120, 180],
      [60, 120, 180],
    ]
    let alpha = 0
    if (this.sup3 === 8) {
      typeDePavage = randint(1, 7) as 1 | 2 | 3 | 4 | 5 | 6 | 7
    } else {
      typeDePavage = Math.max(Math.min(7, this.sup3), 1) as
        1 | 2 | 3 | 4 | 5 | 6 | 7
    }
    while (couples.length < this.nbQuestions && nombrePavageTestes < 6) {
      nombreTentatives = 0
      monpavage = pavage() // On crée l'objet Pavage qui va s'appeler monpavage
      tailles = [
        [
          [3, 2],
          [3, 2],
          [2, 2],
          [2, 2],
          [2, 2],
          [2, 2],
          [3, 2],
        ],
        [
          [4, 3],
          [4, 3],
          [3, 3],
          [3, 3],
          [3, 3],
          [3, 2],
          [5, 3],
        ],
      ]

      Nx = tailles[taillePavage - 1][typeDePavage - 1][0]
      Ny = tailles[taillePavage - 1][typeDePavage - 1][1]
      monpavage.construit(typeDePavage, Nx, Ny, 3) // On initialise toutes les propriétés de l'objet.
      fenetreMathalea2d = monpavage.fenetre
      do {
        // On cherche d pour avoir suffisamment de couples
        couples = [] // On vide la liste des couples pour une nouvelle recherche

        index1 = randint(
          Math.floor(monpavage.nb_polygones / 3),
          Math.ceil((monpavage.nb_polygones * 2) / 3),
        ) // On choisit 1 point dans un des polygones
        if (choice([true, false])) {
          A =
            monpavage.polygones[index1].listePoints[
              randint(0, monpavage.polygones[index1].listePoints.length - 1)
            ] // On choisit un sommet
        } else {
          A = monpavage.barycentres[index1] // Ou on choisit un barycentre
        }
        while (
          A.x - 5 < fenetreMathalea2d.xmin ||
          A.x + 5 > fenetreMathalea2d.xmax ||
          A.y - 5 < fenetreMathalea2d.ymin ||
          A.y + 5 > fenetreMathalea2d.ymax
        ) {
          index1 = randint(
            Math.floor(monpavage.nb_polygones / 3),
            Math.ceil((monpavage.nb_polygones * 2) / 3),
          ) // On choisit 1 point dans un des polygones
          if (choice([true, false])) {
            A =
              monpavage.polygones[index1].listePoints[
                randint(0, monpavage.polygones[index1].listePoints.length - 1)
              ] // On choisit un sommet
          } else {
            A = monpavage.barycentres[index1] // Ou on choisit un barycentre
          }
        }
        A.nom = 'A'
        A.positionLabel = 'below'
        trace = tracePoint(A, 'red') // la trace du centre de symétrie sera rouge et grosse
        label = labelPoint(A, 'red')
        trace.epaisseur = 3
        trace.taille = 4

        alpha = choice(alphas[typeDePavage - 1], this.sup4 ? 180 : 0)
        sensdirect = choice([1, -1])
        for (let i = 1; i <= monpavage.nb_polygones; i++) {
          // on crée une liste des couples (antécédents, images)
          image = rotaccion(monpavage, A, alpha * sensdirect, i)
          if (image !== -1) {
            // si l'image du polygone i existe, on ajoute le couple à la liste
            couples.push([i, image])
          }
        }
        couples = videcouples(couples) // supprime tous les couples en double (x,y)=(y,x)
        nombreTentatives++
      } while (couples.length < this.nbQuestions + 2 && nombreTentatives < 30)
      if (couples.length < this.nbQuestions) {
        if (this.sup3 === 7) {
          typeDePavage = ((typeDePavage + 1) % 5) + 1
        }
        nombrePavageTestes++
      }
    }
    if (couples.length < this.nbQuestions) {
      console.error(
        `Trop de questions (${this.nbQuestions} questions pour ${couples.length} couple(s) trouvé(s) seulement), augmentez la taille du pavage !`,
      )
      return
    }
    if (trace && label) {
      objets.push(trace) // le centre est OK on pousse sa trace
      objets.push(label) // et son label
    }

    couples = shuffle(couples) // on mélange les couples
    const texteNoir = []
    const texteGris = []
    if (monpavage != null) {
      for (let i = 0; i < monpavage.nb_polygones; i++) {
        texteNoir.push(
          texteParPosition(
            nombreAvecEspace(i + 1),
            monpavage.barycentres[i].x,
            monpavage.barycentres[i].y + 0.5,
            0,
            'black',
            1,
            'milieu',
            true,
          ),
        )
        texteGris.push(
          texteParPosition(
            nombreAvecEspace(i + 1),
            monpavage.barycentres[i].x,
            monpavage.barycentres[i].y + 0.5,
            0,
            'gray',
            1,
            'milieu',
            true,
          ),
        )
      }
      if (this.sup2) {
        // Doit-on montrer les centres des figures ?
        for (let i = 0; i < monpavage.nb_polygones; i++) {
          objets.push(monpavage.tracesCentres[i])
        }
      }
      for (let i = 0; i < monpavage.nb_polygones; i++) {
        // il faut afficher tous les polygones du pavage
        objets.push(monpavage.polygones[i])
      }

      texte = mathalea2d(fenetreMathalea2d, objets, texteNoir) // monpavage.fenetre est calibrée pour faire entrer le pavage dans une feuille A4
      texte += `Soit la rotation de centre $A$ et d'angle $${alpha}^\\circ$ dans le sens `
      if (sensdirect === 1) {
        texte += "contraire des aiguilles d'une montre.<br>"
      } else {
        texte += "des aiguilles d'une montre.<br>"
      }
      texteCorr += `Soit la rotation de centre $A$ et d'angle $${alpha}^\\circ$ dans le sens `
      if (sensdirect === 1) {
        texteCorr += "contraire des aiguilles d'une montre. <br>"
      } else {
        texteCorr += "des aiguilles d'une montre. <br>"
      }
      const consigneAMC = texte
      for (let i = 0; i < this.nbQuestions; i++) {
        texteAMC =
          `Quelle est l'image de la figure $${couples[i][0]}$ ?` +
          ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers) +
          '<br>'
        texte += texteAMC
        texteCorr += `L'image de la figure $${couples[i][0]}$ est la figure $${miseEnEvidence(couples[i][1])}$.<br>`

        if (context.isAmc) {
          propositionsAMC.push({
            type: 'AMCNum',
            propositions: [
              {
                texte: texteCorr,
                reponse: {
                  texte: texteAMC,
                  valeur: couples[i][1],
                  param: {
                    signe: false,
                    digits: 2,
                    decimals: 0,
                  },
                },
              },
            ],
          })
        } else {
          handleAnswers(this, i, {
            reponse: { value: couples[i][1] },
          })
        }
        if (this.correctionDetaillee) {
          t = this.nbQuestions * 3
          M = monpavage.barycentres[couples[i][0] - 1]
          N = monpavage.barycentres[couples[i][1] - 1]
          P1 = monpavage.polygones[couples[i][0] - 1]
          P1.color = colorToLatexOrHTML(texcolors(i))
          P1.couleurDeRemplissage = colorToLatexOrHTML(texcolors(i))
          P1.opaciteDeRemplissage = 0.5
          P1.epaisseur = 2
          P2 = monpavage.polygones[couples[i][1] - 1]
          P2.color = colorToLatexOrHTML(texcolors(i))
          P2.couleurDeRemplissage = colorToLatexOrHTML(texcolors(i))
          P2.opaciteDeRemplissage = 0.5
          P2.epaisseur = 2
          if (context.isHtml) {
            P3 = rotationAnimee(
              P1,
              A,
              alpha * sensdirect,
              `begin="${i * 3}s;${i * 3 + t}s;${i * 3 + t * 2}s" end="${i * 3 + 2}s;${i * 3 + t + 2}s;${i * 3 + t * 2 + 2}s" dur="2s" repeatCount="indefinite" repeatDur="${9 * this.nbQuestions}s" id="poly-${i}-anim"`,
            )
            P3.color = colorToLatexOrHTML(texcolors(i))
            P3.epaisseur = 2
            objetsCorrection.push(P3)
          }
          objetsCorrection.push(
            tracePoint(M, N),
            segment(A, M, texcolors(i)),
            segment(A, N, arcenciel(i)),
            codageAngle(
              M,
              A,
              N,
              0.8,
              '',
              arcenciel(i),
              1,
              1,
              bleuMathalea,
              0.2,
              true,
            ),
            P1,
            P2,
          )
        }
      }
      if (this.correctionDetaillee) {
        texteCorr += mathalea2d(
          fenetreMathalea2d,
          objets,
          objetsCorrection,
          texteGris,
        )
      }
      if (context.isAmc) {
        this.autoCorrectionAMC[0] = {
          options: { multicols: true },
          enonce: consigneAMC,
          propositions: propositionsAMC,
        }
        this.questionsAMC[0] = amcConvert(this.autoCorrectionAMC[0])
      }
    }

    this.listeQuestions.push(texte)
    this.listeCorrections.push(texteCorr)
    listeQuestionsToContenu(this)
  }
}
