import { miseEnEvidence } from '../../lib/outils/embellissements'
import { codageSegment } from '../../lib/2d/CodageSegment'
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { Segment, segment } from '../../lib/2d/segmentsVecteurs'
import { texteParPosition } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { translation } from '../../lib/2d/transformations'
import { texcolors } from '../../lib/format/style'
import { shuffle } from '../../lib/outils/arrayOutils'
import { nombreAvecEspace } from '../../lib/outils/texNombre'
import { translationAnimee } from '../../modules/2dAnimation'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import type { NestedObjetMathalea2dArray } from '../../types/2d'

import type { IPointAbstrait, IPolygone } from '../../lib/2d/Interfaces'
import { representant } from '../../lib/2d/representantVecteur'
import { vecteur, type Vecteur } from '../../lib/2d/Vecteur'
import {
  contraindreValeur,
  egal,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import { Pavage, pavage } from '../../modules/Pavage'
import Exercice from '../Exercice'
export const titre =
  "Trouver l'image d'une figure par une translation dans un pavage"

/**
 * @author Jean-claude Lhote
 * publié le 16/12/2020
 * Trouver une figure image dans un pavage par une translation. 6 pavages différents.
 */
export const uuid = '3bfb6'

export const refs = {
  'fr-fr': ['4G11'],
  'fr-ch': ['9R1ES4A-4', '9R2ES4A-4', '9R3ES4A-4'],
}
export default class PavageEtTranslation2d extends Exercice {
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

    this.nbQuestions = 3

    this.correctionDetaillee = true
    this.correctionDetailleeDisponible = true

    this.sup = 1 // 1 pour des pavages modestes, 2 pour des plus grand.
    this.sup2 = false // On cache les centres par défaut.
    this.sup3 = 7
    this.spacingCorr = context.isHtml ? 2.5 : 1.5
  }

  nouvelleVersion() {
    this.sup = contraindreValeur(1, 2, this.sup, randint(1, 2))
    this.sup3 = contraindreValeur(1, 8, this.sup3, 8)
    if (this.sup3 === 8) this.sup3 = randint(1, 7)
    const videcouples = function (tableau: [number, number][]) {
      for (let k = 0; k < tableau.length; k++) {
        for (let j = k + 1; j < tableau.length; j++) {
          if (tableau[k][1] === tableau[j][0]) {
            tableau.splice(j, 1)
          }
        }
      }
      return tableau
    }
    const compare2polys = function (poly1: IPolygone, poly2: IPolygone) {
      if (comparenbsommets(poly1, poly2)) {
        if (comparesommets(poly1, poly2)) {
          return true
        } else {
          return false
        }
      } else {
        return false
      }
    }
    const comparenbsommets = function (poly1: IPolygone, poly2: IPolygone) {
      if (poly1.listePoints.length === poly2.listePoints.length) {
        return true
      } else return false
    }

    const compare2sommets = function (
      sommet1: IPointAbstrait,
      sommet2: IPointAbstrait,
    ) {
      if (egal(sommet1.x, sommet2.x, 0.1) && egal(sommet1.y, sommet2.y, 0.1)) {
        return true
      } else return false
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
            if (trouve) break
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
      if (trouves === poly1.listePoints.length) {
        return true
      } else return false
    }

    const translacion = function (pavage: Pavage, v: Vecteur, numero: number) {
      // retourne le numero du polygone image ou -1 si il n'existe pas
      const poly = pavage.polygones[numero - 1]
      let pol
      const result = -1
      const sympoly = translation(poly, v)
      for (let k = 0; k < pavage.polygones.length; k++) {
        pol = pavage.polygones[k]
        if (compare2polys(sympoly, pol)) {
          return k + 1
        }
      }
      return result
    }

    const objets: NestedObjetMathalea2dArray = []
    let objetsCorrection: NestedObjetMathalea2dArray = []
    let P1, P2, P3, t
    let taillePavage = this.nbQuestions > 5 ? 2 : this.sup
    let couples: [number, number][] = []
    let Nx, Ny, A, B, image
    let monpavage = pavage()
    let fenetreMathalea2d
    let texte = ''
    let texteCorr = ''
    let nombreTentatives
    let nombrePavageTestes = 1
    let v: Vecteur | null = null
    let d: Segment | null = null
    let typeDePavage = this.sup3
    let index1: number | null = null
    let index2: number | null = null
    while (taillePavage < 3) {
      while (couples.length < this.nbQuestions && nombrePavageTestes < 6) {
        nombreTentatives = 0
        monpavage = pavage() // On crée l'objet Pavage qui va s'appeler monpavage
        const tailles = [
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
        while (couples.length < this.nbQuestions + 2 && nombreTentatives < 30) {
          // On cherche d pour avoir suffisamment de couples
          couples = [] // On vide la liste des couples pour une nouvelle recherche
          index1 = randint(
            Math.floor(monpavage.nb_polygones / 3),
            Math.ceil((monpavage.nb_polygones * 2) / 3),
          ) // On choisit 2 points dans 2 polygones distincts.
          index2 = randint(
            Math.floor(monpavage.nb_polygones / 3),
            Math.ceil((monpavage.nb_polygones * 2) / 3),
            index1,
          )
          while (
            !comparenbsommets(
              monpavage.polygones[index1],
              monpavage.polygones[index2],
            )
          ) {
            // On vérifie que les deux polygones sont compatibles
            index2 = (index2 + 1) % (monpavage.polygones.length - 1)
          }
          A = monpavage.barycentres[index1] // On prends  les barycentres
          B = monpavage.barycentres[index2]
          v = vecteur(A, B)
          while (compare2sommets(A, B)) {
            // On vérifie qu'ils sont bien distincts sinon, on change.
            index2 = randint(
              Math.floor(monpavage.nb_polygones / 3),
              Math.ceil((monpavage.nb_polygones * 2) / 3),
              index1,
            )
            while (
              !comparenbsommets(
                monpavage.polygones[index1],
                monpavage.polygones[index2],
              )
            ) {
              // On vérifie que les deux polygones sont compatibles
              index2 = (index2 + 1) % (monpavage.polygones.length - 1)
            }
            A = monpavage.barycentres[index1] // On prends  les barycentres
            B = monpavage.barycentres[index2]
            v = vecteur(A, B)
          }
          d = segment(A, B, 'red')
          d.styleExtremites = '->'
          d.epaisseur = 3
          for (let i = 1; i <= monpavage.nb_polygones; i++) {
            // on crée une liste des couples (antécédents, images)
            image = translacion(monpavage, v, i)
            if (image !== -1) {
              // si l'image du polygone i existe, on ajoute le couple à la liste
              couples.push([i, image])
            }
          }
          couples = videcouples(couples) // supprime tous les couples en double (x,y)=(y,x)
          nombreTentatives++
        }
        if (couples.length < this.nbQuestions) {
          if (this.sup3 === 7) {
            typeDePavage = ((typeDePavage + 1) % 5) + 1
          }
          nombrePavageTestes++
        }
      }
      if (couples.length === 0) taillePavage++
      else taillePavage = 3
    }
    if (couples.length < this.nbQuestions) {
      console.error('trop de questions, augmentez la taille du pavage')
      return
    }

    if (d) objets.push(d) // la droite d est trouvée
    couples = shuffle(couples) // on mélange les couples
    for (let i = 0; i < monpavage.nb_polygones; i++) {
      objets.push(
        texteParPosition(
          nombreAvecEspace(i + 1),
          monpavage.barycentres[i].x + 0.5,
          monpavage.barycentres[i].y,
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
    this.introduction = mathalea2d(fenetreMathalea2d, objets) // monpavage.fenetre est calibrée pour faire entrer le pavage dans une feuille A4
    if (index1 == null || index2 == null) {
      console.error('index1 ou index2 est null')
      return
    }
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      texte = `Quelle est l'image de la figure $${couples[i][0]}$ dans la translation transformant la figure $${index1 + 1}$ en la figure $${index2 + 1}$ ?<br>`
      texteCorr = `L'image de la figure $${couples[i][0]}$ dans la translation transformant la figure $${index1 + 1}$ en la figure $${index2 + 1}$ est la figure $${miseEnEvidence(couples[i][1])}$.<br>`
      //      symetriques=associesommets(monpavage.polygones[couples[i][0]-1],monpavage.polygones[couples[i][1]-1],d)
      if (this.correctionDetaillee) {
        A = monpavage.barycentres[couples[i][0] - 1]
        B = monpavage.barycentres[couples[i][1] - 1]
        if (v == null) {
          console.error('v est null')
          return
        }
        d = representant(v, A)
        d.color = colorToLatexOrHTML(texcolors(i))
        t = this.nbQuestions * 3
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
        objetsCorrection = []
        objetsCorrection.push(
          tracePoint(A, B),
          d,
          codageSegment(A, B, '//', texcolors(i)),
          P1,
          P2,
        )
        if (context.isHtml) {
          P3 = translationAnimee(
            [P1],
            v,
            `begin="${i * 3}s;${i * 3 + t}s;${i * 3 + t * 2}s" end="${i * 3 + 2}s;${i * 3 + t + 2}s;${i * 3 + t * 2 + 2}s" dur="2s" repeatCount="indefinite" repeatDur="${9 * this.nbQuestions}s" id="poly-${i}-anim"`,
          )
          P3.color = colorToLatexOrHTML(texcolors(i))
          P3.epaisseur = 2
          objetsCorrection.push(P3)
        }
      }

      if (this.correctionDetaillee) {
        texteCorr += mathalea2d(fenetreMathalea2d, objets, objetsCorrection)
      }
      if (this.questionJamaisPosee(i, couples[i][0])) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }

      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
