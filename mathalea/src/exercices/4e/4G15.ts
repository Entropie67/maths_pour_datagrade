import { Droite, droite } from '../../lib/2d/droites'
import { mediatrice } from '../../lib/2d/Mediatrice'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import {
  nommePolygone,
  Polygone,
  polygone,
  polygoneAvecNom,
  renommePolygone,
} from '../../lib/2d/polygones'
import { labelPoint, latexParPoint } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import {
  rotation,
  similitude,
  symetrieAxiale,
  translation,
} from '../../lib/2d/transformations'
import { longueur } from '../../lib/2d/utilitairesGeometriques'
import {
  milieu,
  pointAdistance,
  pointSurSegment,
} from '../../lib/2d/utilitairesPoint'
import { vecteur } from '../../lib/2d/Vecteur'
import { vide2d } from '../../lib/2d/Vide2d'
import { bleuMathalea, orangeMathalea } from '../../lib/colors'
import {
  rotationAnimee,
  symetrieAnimee,
  translationAnimee,
} from '../../modules/2dAnimation'
import Alea2iep from '../../modules/Alea2iep'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Effectuer des transformations de triangles'
/**
 * @author Liouba Leroux & Jean-claude Lhote
 */
export const dateDeModifImportante = '30/10/2026'

export const uuid = '0da6a'

export const refs = {
  'fr-fr': ['4G15'],
  'fr-ch': ['9R1ES4F-4', '9R2ES4F-4', '9R3ES4F-4', '10CTES2B-6', '10LCES2B-6', '10LSES2B-6', 'PRQES03A-8'],
}
export default class TransformationsDeTriangle extends Exercice {
  constructor() {
    super()

    this.titre = 'Tranformations de triangle'
    this.nbQuestions = 1 // Ici le nombre de questions (une seule pour cet exercice non modifiable)
    this.nbQuestionsModifiable = false // désactive le formulaire nombre de questions
    this.reponseCourteDisponible = false // La réponse est une figure.
  }

  nouvelleVersion(numeroExercice: number) {
    const objetsEnonce = [] // on initialise le tableau des objets Mathalea2d de l'enoncé
    const objetsCorrection = [] // Idem pour la correction

    let texteCorr = '' // Idem pour le texte de la correction.
    let largeur = 20
    let hauteur = 20
    let A,
      B,
      C,
      triangle,
      O,
      M,
      X,
      Y,
      triangle1,
      A1,
      B1,
      C1,
      d1,
      D,
      F,
      triangle3,
      triangle4,
      triangle5,
      traces,
      labels
    let xMin, xMax, yMin, yMax
    let alpha, beta
    const anim = new Alea2iep()
    let triangle0: Polygone
    let triangle2: Polygone
    let med: Droite
    /***************************************/
    /** ******Ici on définit les objets 2d */
    /*************************************/
    do {
      xMin = 0
      xMax = 0
      yMin = 0
      yMax = 0
      A = pointAbstrait(0, 0, 'A')
      B = pointAdistance(A, randint(40, 60) / 10, randint(70, 100), 'B')
      C = similitude(B, A, randint(20, 50), randint(8, 12) / 10, 'C')
      triangle0 = polygone(A, B, C)
      triangle = polygoneAvecNom(A, B, C)
      // d0=droite(A,B)
      O = pointSurSegment(B, A, 2 + longueur(A, B))
      // d0.isVisible=false
      beta = randint(-45, -20)
      A1 = rotation(A, O, beta, 'A')
      B1 = rotation(B, O, beta, 'B')
      C1 = rotation(C, O, beta, 'C')
      triangle1 = polygone(A1, B1, C1)
      renommePolygone(triangle1, ['$A_1$', '$B_1$', '$C_1$'])
      M = milieu(A, A1)
      d1 = droite(A1, B1)
      triangle2 = symetrieAxiale(triangle1, d1)
      renommePolygone(triangle2, ['$A_1$', '$B_1$', '$C_1$'])
      med = mediatrice(A, A1) as Droite
      X = pointSurSegment(M, O, 5)
      Y = pointSurSegment(O, M, 10)
      D = similitude(B1, A1, randint(-40, -10), 1.5, 'D')
      triangle3 = rotation(triangle2, D, 180)
      renommePolygone(triangle3, ['$A_2$', '$B_2$', '$C_2$'])
      F = translation(D, vecteur(B, A), 'F')
      traces = tracePoint(D, F)
      labels = labelPoint(D, F)
      triangle4 = translation(triangle3, vecteur(D, F))
      renommePolygone(triangle4, ['$A_3$', '$B_3$', '$C_3$'])
      alpha = -randint(80, 110)
      triangle5 = rotation(triangle4, F, alpha)
      renommePolygone(triangle5, ['$A_4$', '$B_4$', '$C_4$'])

      for (let i = 0; i < 3; i++) {
        xMin = Math.min(
          xMin,
          triangle0.listePoints[i].x,
          triangle1.listePoints[i].x,
          triangle2.listePoints[i].x,
          triangle3.listePoints[i].x,
          triangle4.listePoints[i].x,
          triangle5.listePoints[i].x,
        )
        xMax = Math.max(
          xMax,
          triangle0.listePoints[i].x,
          triangle1.listePoints[i].x,
          triangle2.listePoints[i].x,
          triangle3.listePoints[i].x,
          triangle4.listePoints[i].x,
          triangle5.listePoints[i].x,
        )
        yMin = Math.min(
          yMin,
          triangle0.listePoints[i].y,
          triangle1.listePoints[i].y,
          triangle2.listePoints[i].y,
          triangle3.listePoints[i].y,
          triangle4.listePoints[i].y,
          triangle5.listePoints[i].y,
        )
        yMax = Math.max(
          yMax,
          triangle0.listePoints[i].y,
          triangle1.listePoints[i].y,
          triangle2.listePoints[i].y,
          triangle3.listePoints[i].y,
          triangle4.listePoints[i].y,
          triangle5.listePoints[i].y,
        )
      }
      xMax += 4
      xMin--
      yMin--
      yMax++
      largeur = xMax - xMin
      hauteur = yMax - yMin
    } while (largeur > 16 && hauteur > 16)

    let texte =
      'Construire<br>$A_1B_1C_1$ le triangle symétrique de $ABC$ par rapport à la droite $(d)$\u00a0;<br>' // Nous utilisons souvent cette variable pour construire le texte de la question.
    texte +=
      '$A_2B_2C_2$ le triangle symétrique de $A_1B_1C_1$ par rapport au point $D$\u00a0;<br>'
    texte +=
      '$A_3B_3C_3$ le triangle translaté de $A_2B_2C_2$ tel que $D$ soit transformé en $F$\u00a0;<br>'
    texte += `$A_4B_4C_4$ le triangle obtenu par la rotation de $A_3B_3C_3$ de centre $F$ et d'angle $${Math.abs(alpha)}^\\circ$ dans le sens des aiguilles d'une montre.<br>`

    const nomd = latexParPoint(
      '(d)',
      translation(milieu(B, B1), vecteur(1, 0)),
      'black',
      30,
      12,
      '',
    )
    if (context.isHtml) {
      const triangle2a = !context.isHtml
        ? vide2d()
        : symetrieAnimee(
            triangle0,
            med,
            `id='anim${numeroExercice}A' begin="0s" dur ="2s" repeatcount="1" fill="freeze"`,
          )
      const triangle3a = !context.isHtml
        ? vide2d()
        : rotationAnimee(
            [triangle2],
            D,
            180,
            `id='anim${numeroExercice}B' begin="2s" dur ="2s" repeatcount="1" fill="freeze"`,
          )
      const triangle4a = !context.isHtml
        ? vide2d()
        : translationAnimee(
            [triangle3],
            vecteur(D, F),
            `id='anim${numeroExercice}C' begin="4s" dur ="2s" repeatcount="1" fill="freeze"`,
          )
      const triangle5a = !context.isHtml
        ? vide2d()
        : rotationAnimee(
            [triangle4],
            F,
            alpha,
            `id='anim${numeroExercice}D' begin="6s" dur ="2s" repeatcount="1" fill="freeze"`,
          )
      anim.vitesse = 15
      anim.tempo = 0.5
      anim.recadre(xMin, yMax)
      anim.polygoneRapide(...triangle0.listePoints)
      anim.pointsCreer(A, B, C, F, D)
      anim.couleur = 'black'
      anim.traitRapide(X, Y, { couleur: 'red', epaisseur: 1 })
      anim.textePoint('(d)', milieu(B, B1))
      anim.symetrieAxialePolygone(triangle0, med, ['A_1', 'B_1', 'C_1'], {
        couleur: bleuMathalea,
        couleurCodage: 'lightblue',
      })
      anim.demiTourPolygone(triangle2, D, ['A_2', 'B_2', 'C_2'], {
        couleur: 'red',
        couleurCodage: 'pink',
      })
      anim.translationPolygone(triangle3, D, F, ['A_3', 'B_3', 'C_3'], {
        couleur: 'brown',
        couleurCodage: orangeMathalea,
      })
      anim.rotationPolygone(triangle4, F, alpha, ['A_4', 'B_4', 'C_4'], {
        couleur: 'green',
        couleurCodage: 'lightgreen',
      })
      anim.crayonMasquer()
      objetsCorrection.push(triangle2a, triangle3a, triangle4a, triangle5a)
    }
    context.fenetreMathalea2d = [xMin, yMin, xMax, yMax]
    objetsEnonce.push(triangle0, triangle[1], traces, labels, med, nomd) // On rempli les tableaux d'objets Mathalea2d
    objetsCorrection.push(
      triangle0,
      triangle[1],
      traces,
      labels,
      med,
      nomd,
      triangle2,
      nommePolygone(triangle2),
      triangle3,
      nommePolygone(triangle3),
      triangle4,
      nommePolygone(triangle4),
      triangle5,
      nommePolygone(triangle5),
    )

    // paramètres de la fenêtre Mathalea2d pour l'énoncé main levée
    //    paramsEnonceml = { xmin: Math.min(objetsEnonceml.x), ymin: Math.min(objetsEnonceml.y), xmax: Math.max(objetsEnonceml.x), ymax: Math.max(objetsEnonceml.y), pixelsParCm: 20, scale: 1, mainlevee: true, amplitude: 1 }
    // paramètres de la fenêtre Mathalea2d pour l'énoncé normal
    const paramsEnonce = {
      xmin: xMin,
      ymin: yMin,
      xmax: xMax,
      ymax: yMax,
      pixelsParCm: 20,
      scale: 1,
      mainlevee: false,
    }
    // paramètres de la fenêtre Mathalea2d pour la correction
    const paramsCorrection = {
      xmin: xMin,
      ymin: yMin,
      xmax: xMax,
      ymax: yMax,
      pixelsParCm: 20,
      scale: 1,
    }
    // On ajoute au texte de l'énoncé, la figure à main levée et la figure de l'enoncé.
    texte += mathalea2d(paramsEnonce, objetsEnonce)
    // On ajoute au texte de la correction, la figure de la correction
    texteCorr += mathalea2d(paramsCorrection, objetsCorrection)
    if (context.isHtml) {
      texteCorr += '<br>'
      texteCorr += `<button type="button" class="m-2 inline-flex items-center gap-1 rounded border border-coopmaths-struct px-3 py-2 text-sm cursor-pointer hover:bg-coopmaths-canvas dark:border-coopmathsdark-struct dark:hover:bg-coopmathsdark-canvas" onclick="document.getElementById('anim${numeroExercice}A').beginElement()"><i class="bx bx-redo" aria-hidden="true"></i>symétrie axiale</button>`
      texteCorr += `<button type="button" class="m-2 inline-flex items-center gap-1 rounded border border-coopmaths-struct px-3 py-2 text-sm cursor-pointer hover:bg-coopmaths-canvas dark:border-coopmathsdark-struct dark:hover:bg-coopmathsdark-canvas" onclick="document.getElementById('anim${numeroExercice}B').beginElement()"><i class="bx bx-redo" aria-hidden="true"></i>symétrie centrale</button>`
      texteCorr += `<button type="button" class="m-2 inline-flex items-center gap-1 rounded border border-coopmaths-struct px-3 py-2 text-sm cursor-pointer hover:bg-coopmaths-canvas dark:border-coopmathsdark-struct dark:hover:bg-coopmathsdark-canvas" onclick="document.getElementById('anim${numeroExercice}C').beginElement()"><i class="bx bx-redo" aria-hidden="true"></i>translation</button>`
      texteCorr += `<button type="button" class="m-2 inline-flex items-center gap-1 rounded border border-coopmaths-struct px-3 py-2 text-sm cursor-pointer hover:bg-coopmaths-canvas dark:border-coopmathsdark-struct dark:hover:bg-coopmathsdark-canvas" onclick="document.getElementById('anim${numeroExercice}D').beginElement()"><i class="bx bx-redo" aria-hidden="true"></i>rotation</button>`

      texteCorr += anim.html(numeroExercice)
    }
    this.listeQuestions.push(texte)
    this.listeCorrections.push(texteCorr)
    listeQuestionsToContenu(this) // On envoie l'exercice à la fonction de mise en page
  }
}
