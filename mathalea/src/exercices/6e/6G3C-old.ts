// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 3acc1 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { afficheLongueurSegment } from '../../lib/2d/afficheLongueurSegment'
import { cercle } from '../../lib/2d/cercle'
import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { codageMilieu } from '../../lib/2d/CodageMilieu'
import { Droite, droite } from '../../lib/2d/droites'
import { mediatrice } from '../../lib/2d/Mediatrice'
import { PointAbstrait, pointAbstrait } from '../../lib/2d/PointAbstrait'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { longueur } from '../../lib/2d/utilitairesGeometriques'
import {
  pointAdistance,
  pointIntersectionDD,
  pointIntersectionLC,
} from '../../lib/2d/utilitairesPoint'
import { combinaisonListes, shuffle } from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { creerNomDePolygone } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const titre = "Utiliser les propriétés de la médiatrice d'un segment"
export const dateDePublication = '05/08/2021' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
export const dateDeModifImportante = '17/08/2023'

/**
 * Utiliser les propriétés de la médiatrice d'un segment
 * @author Guillaume Valmont
 */

export const uuid = '3acc1'

export const refs = {
  'fr-fr': [],
  'fr-2016': [],
  'fr-ch': ['NR'],
}
export default class ProprietesMediatriceOld extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 4

    this.besoinFormulaireNumerique = [
      'Situation',
      3,
      '1 : Liée à une médiatrice (ou pas)\n2 : Liée à une équidistance (ou pas)\n3 : Mélange',
    ]
    this.sup = 3
    this.besoinFormulaire2CaseACocher = [
      "Inclure des situations où aucun point n'appartient pas à la médiatrice",
    ]
    this.sup2 = true
  }

  nouvelleVersion() {
    let typesDeQuestionsDisponibles, listeSurLaMediatrice
    if (this.sup === 1) {
      typesDeQuestionsDisponibles = ['appartient']
    } else if (this.sup === 2) {
      typesDeQuestionsDisponibles = ['equidistant']
    } else {
      typesDeQuestionsDisponibles = ['appartient', 'equidistant']
    }
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    if (this.sup2 === true) {
      listeSurLaMediatrice = combinaisonListes([true, false], this.nbQuestions)
    } else {
      listeSurLaMediatrice = combinaisonListes([true], this.nbQuestions)
    }
    let A = pointAbstrait(0, 0)
    let B = pointAbstrait(0, 0)
    let C = pointAbstrait(0, 0)
    let D = pointAbstrait(0, 0)
    let segmentAB,
      segmentAC,
      segmentBC,
      mediatriceAB,
      affLongueurAC,
      affLongueurBC
    let objetsEnonce, objetsCorrection, paramsEnonce, paramsCorrection
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // Construction des objets
      objetsEnonce = []
      objetsCorrection = []
      const nomDesPoints = shuffle(
        Array.from(creerNomDePolygone(22, ['O', 'Q', 'W', 'X'])),
      )
      do {
        A = pointAbstrait(0, 0, nomDesPoints[0], 'below')
        B = pointAdistance(
          A,
          randint(30, 60) / 10,
          randint(0, 45),
          nomDesPoints[1],
        )
        mediatriceAB = mediatrice(A, B, '', 'red')
        // Le point C est au-dessus ou en dessous une fois sur deux

        if (randint(0, 99) > 50) {
          C = pointIntersectionLC(
            mediatriceAB as Droite,
            cercle(A, randint(30, 60) / 10),
            nomDesPoints[2],
            1,
          )
        } else {
          C = pointIntersectionLC(
            mediatriceAB as Droite,
            cercle(A, randint(30, 60) / 10),
            nomDesPoints[2],
            2,
          )
        }
        if (!listeSurLaMediatrice[i])
          C = pointAbstrait(
            C.x + randint(-5, 5, 0) / 10,
            C.y + randint(-5, 5, 0) / 10,
            nomDesPoints[2],
            'above',
          ) // s'il ne doit pas être sur la médiatrice, on l'en éloigne
      } while (
        C.constructor !== PointAbstrait ||
        A.constructor !== PointAbstrait ||
        B.constructor !== PointAbstrait
      )
      segmentAB = segment(A, B)
      segmentAC = segment(A, C)
      segmentBC = segment(B, C)
      segmentAC.pointilles = 2
      segmentBC.pointilles = 2
      // Affiche les longueurs au-dessous ou en dessous selon si C est au-dessus ou en dessous de A
      if (C.y > A.y) {
        affLongueurAC = afficheLongueurSegment(A, C, 'black', 0.5)
        affLongueurBC = afficheLongueurSegment(C, B, 'black', 0.5)
      } else {
        affLongueurAC = afficheLongueurSegment(C, A, 'black', 0.5)
        affLongueurBC = afficheLongueurSegment(B, C, 'black', 0.5)
      }
      // Construction des énoncés et des corrections
      if (listeTypeDeQuestions[i] === 'appartient') {
        objetsEnonce.push(segmentAC, segmentBC, affLongueurAC, affLongueurBC) // On affiche les longueurs dans l'énoncé
        texte = `Le point $${nomDesPoints[2]}$ appartient-il à la médiatrice du segment [$${nomDesPoints[0]}${nomDesPoints[1]}$] ? Justifier.<br>`
        // On construit et code la médiatrice puis on la push dans la correction
        D = pointIntersectionDD(mediatriceAB as Droite, droite(A, B))
        if (C.x > A.x) {
          objetsCorrection.push(codageAngleDroit(A, D, C, 'red', 0.4))
        } else {
          objetsCorrection.push(codageAngleDroit(C, D, A, 'red', 0.4))
        }
        objetsCorrection.push(
          codageMilieu(A, B, 'red', '||', false),
          mediatriceAB,
        )
        if (listeSurLaMediatrice[i]) {
          // S'il est sur la médiatrice
          texteCorr = `$${nomDesPoints[2]}${nomDesPoints[0]} = ${nomDesPoints[2]}${nomDesPoints[1]} = ${texNombre(arrondi(longueur(C, A), 1))}$ $cm$ donc le point $${nomDesPoints[2]}$ est équidistant de $${nomDesPoints[0]}$ et de $${nomDesPoints[1]}$.<br>`
          texteCorr += `Comme tout point équidistant de $${nomDesPoints[0]}$ et de $${nomDesPoints[1]}$ appartient à la médiatrice du segment [$${nomDesPoints[0]}${nomDesPoints[1]}$], `
          texteCorr += `alors le point $${nomDesPoints[2]}$ ${texteEnCouleurEtGras('appartient à la médiatrice')} du segment [$${nomDesPoints[0]}${nomDesPoints[1]}$].`
        } else {
          // Si le point C doit ne pas être sur la médiatrice,
          texteCorr = `$${nomDesPoints[2]}${nomDesPoints[0]} = ${texNombre(arrondi(longueur(C, A), 1))}$ alors que $${nomDesPoints[2]}${nomDesPoints[1]} = ${texNombre(arrondi(longueur(C, B), 1))}$ donc le point $${nomDesPoints[2]}$ n'est pas équidistant de $${nomDesPoints[0]}$ et de $${nomDesPoints[1]}$.<br>`
          texteCorr += `Comme tout point qui n'est pas équidistant de $${nomDesPoints[0]}$ et de $${nomDesPoints[1]}$ n'appartient pas à la médiatrice du segment [$${nomDesPoints[0]}${nomDesPoints[1]}$], `
          texteCorr += `alors le point $${nomDesPoints[2]}$ ${texteEnCouleurEtGras("n'appartient pas à la médiatrice")} du segment [$${nomDesPoints[0]}${nomDesPoints[1]}$].`
        }
      } else {
        objetsCorrection.push(
          segmentAC,
          segmentBC,
          affLongueurAC,
          affLongueurBC,
        ) // On affiche les longueurs dans la correction
        texte = `Le point $${nomDesPoints[2]}$ est-il équidistant de $${nomDesPoints[0]}$ et de $${nomDesPoints[1]}$ ? Justifier.<br>`
        // On construit et code la médiatrice puis on la push dans l'énoncé
        D = pointIntersectionDD(mediatriceAB as Droite, droite(A, B))
        if (C.x > A.x) {
          objetsEnonce.push(codageAngleDroit(A, D, C, 'red', 0.4))
        } else {
          objetsEnonce.push(codageAngleDroit(C, D, A, 'red', 0.4))
        }
        objetsEnonce.push(codageMilieu(A, B, 'red', '||', false), mediatriceAB)
        if (listeSurLaMediatrice[i]) {
          // S'il est sur la médiatrice
          texteCorr = `Le point $${nomDesPoints[2]}$ appartient à la médiatrice du segment [$${nomDesPoints[0]}${nomDesPoints[1]}$].<br>`
          texteCorr +=
            "Comme tout point qui appartient à la médiatrice d'un segment est équidistant des extrémités de ce segment, "
          texteCorr += `alors le point $${nomDesPoints[2]}$ ${texteEnCouleurEtGras('est équidistant')} de $${nomDesPoints[0]}$ et de $${nomDesPoints[1]}$.`
        } else {
          // Si le point $${nomDesPoints[2]}$ doit ne pas être sur la médiatrice,
          texteCorr = `Le point $${nomDesPoints[2]}$ n'appartient pas à la médiatrice du segment [$${nomDesPoints[0]}${nomDesPoints[1]}$].<br>`
          texteCorr +=
            "Comme tout point qui n'appartient pas à la médiatrice d'un segment n'est pas équidistant des extrémités de ce segment, "
          texteCorr += `alors le point $${nomDesPoints[2]}$ ${texteEnCouleurEtGras("n'est pas équidistant")} de $${nomDesPoints[0]}$ et de $${nomDesPoints[1]}$.`
        }
      }
      // On push les objets
      objetsEnonce.push(tracePoint(A, B, C), labelPoint(A, B, C), segmentAB)
      objetsEnonce.forEach((obj) => {
        objetsCorrection.push(obj)
      })
      const xmin = Math.min(A.x, B.x, C.x) - 2
      const xmax = Math.max(A.x, B.x, C.x) + 2
      const ymin = Math.min(A.y, B.y, C.y) - 2
      const ymax = Math.max(A.y, B.y, C.y) + 2
      // paramètres de la fenêtre Mathalea2d pour l'énoncé normal
      paramsEnonce = { xmin, ymin, xmax, ymax, pixelsParCm: 20, scale: 1 }
      // paramètres de la fenêtre Mathalea2d pour la correction
      paramsCorrection = paramsEnonce
      // On ajoute au texte de l'énoncé, la figure à main levée et la figure de l'enoncé.
      texte += mathalea2d(paramsEnonce, objetsEnonce)
      // On ajoute au texte de la correction, la figure de la correction
      texteCorr += mathalea2d(paramsCorrection, objetsCorrection)
      if (this.questionJamaisPosee(i, texteCorr)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
