import { fixeBordures } from '../../lib/2d/fixeBordures'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { translation } from '../../lib/2d/transformations'
import { longueur } from '../../lib/2d/utilitairesGeometriques'
import { pointSurSegment } from '../../lib/2d/utilitairesPoint'
import { vecteur } from '../../lib/2d/Vecteur'
import { point3d } from '../../lib/3d/3dProjectionMathalea2d/elementsEtTransformations3d'
import { pave3d } from '../../lib/3d/3dProjectionMathalea2d/PaveEtPaveLPH3dPerspectiveCavaliere'
import { bleuMathalea, orangeMathalea } from '../../lib/colors'
import { choisitLettresDifferentes } from '../../lib/outils/aleatoires'
import { choice } from '../../lib/outils/arrayOutils'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const titre = "Construire la section d'un plan dans un pavé droit"
export const amcReady = true
export const amcType = 'AMCOpen'

export const dateDePublication = '07/11/2022'

/**
 * Construire une section dans un pavé droit
 * @author Éric Elter
 */

export const uuid = 'a3cb9'

export const refs = {
  'fr-fr': ['3G41-1'],
  'fr-ch': [],
}
export default class ConstruireSectionPaveDroit extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 3
  }

  nouvelleVersion() {
    for (
      let i = 0,
        texte,
        texteCorr,
        objetsEnonce,
        A,
        B,
        D,
        E,
        Y,
        Z,
        YCorr,
        ZCorr,
        areteY,
        areteZ,
        s1,
        s2,
        s3,
        s4,
        s5,
        solideDessine,
        nomSolide,
        placeDuPoint1,
        placeDuPoint2,
        enonceFigure,
        sommetsPave,
        areteParallele,
        L,
        p,
        choixProfondeur,
        choixAreteParallele,
        h,
        traceTesPoints,
        choix,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      texte = ''
      texteCorr = ''
      objetsEnonce = []
      context.anglePerspective = choice([-30, -60, 30, 60])
      // context.anglePerspective = -30

      L = randint(5, 20)
      h = randint(5, 20, [L])
      p = randint(5, 20, [L, h])
      A = point3d(0, 0, 0)
      B = point3d(L, 0, 0)
      D = point3d(0, 0, h)
      choixProfondeur = choice([p, -p])
      E = point3d(0, choixProfondeur, 0)

      nomSolide = choisitLettresDifferentes(8, 'OQWXD').join('')
      solideDessine = pave3d(A, B, D, E, bleuMathalea, true, nomSolide)
      objetsEnonce.push(...solideDessine.c2d)
      sommetsPave = solideDessine.sommets

      placeDuPoint1 = (5 + (randint(2, 3) * choixProfondeur) / p) / 10
      placeDuPoint2 = (5 - (randint(2, 3) * choixProfondeur) / p) / 10

      choix = randint(1, 3)
      choix = 3

      switch (choix) {
        case 1: // Parallèle à arête verticale - Cas 1
          Z = pointSurSegment(
            sommetsPave[2].c2d,
            sommetsPave[3].c2d,
            placeDuPoint1 * longueur(sommetsPave[2].c2d, sommetsPave[3].c2d),
            choisitLettresDifferentes(1, 'OQWXD' + nomSolide)[0],
          )
          areteZ = nomSolide[3] + nomSolide[2]
          Y = pointSurSegment(
            sommetsPave[6].c2d,
            sommetsPave[7].c2d,
            placeDuPoint2 * longueur(sommetsPave[6].c2d, sommetsPave[7].c2d),
            choisitLettresDifferentes(1, 'OQWXD' + nomSolide + Z.nom)[0],
          )
          areteY = nomSolide[7] + nomSolide[6]
          ZCorr = translation(
            Z,
            vecteur(sommetsPave[2].c2d, sommetsPave[1].c2d),
          )
          YCorr = translation(
            Y,
            vecteur(sommetsPave[2].c2d, sommetsPave[1].c2d),
          )
          if (choice([false, true])) choixAreteParallele = [1, 2]
          else choixAreteParallele = [0, 3]
          break
        case 2: // Parallèle à arête verticale - Cas 2
          Z = pointSurSegment(
            sommetsPave[2].c2d,
            sommetsPave[3].c2d,
            placeDuPoint1 * longueur(sommetsPave[2].c2d, sommetsPave[3].c2d),
            choisitLettresDifferentes(1, 'OQWXD' + nomSolide)[0],
          )
          areteZ = nomSolide[3] + nomSolide[2]
          placeDuPoint2 = randint(2, 8) / 10
          if (placeDuPoint1 > 0.5) {
            Y = pointSurSegment(
              sommetsPave[2].c2d,
              sommetsPave[6].c2d,
              placeDuPoint2 * longueur(sommetsPave[2].c2d, sommetsPave[6].c2d),
              choisitLettresDifferentes(1, 'OQWXD' + nomSolide + Z.nom)[0],
            )
            areteY = nomSolide[2] + nomSolide[6]
          } else {
            Y = pointSurSegment(
              sommetsPave[3].c2d,
              sommetsPave[7].c2d,
              placeDuPoint2 * longueur(sommetsPave[3].c2d, sommetsPave[7].c2d),
              choisitLettresDifferentes(1, 'OQWXD' + nomSolide + Z.nom)[0],
            )
            areteY = nomSolide[7] + nomSolide[3]
          }
          ZCorr = translation(
            Z,
            vecteur(sommetsPave[2].c2d, sommetsPave[1].c2d),
          )
          YCorr = translation(
            Y,
            vecteur(sommetsPave[2].c2d, sommetsPave[1].c2d),
          )
          if (choice([false, true])) choixAreteParallele = [1, 2]
          else choixAreteParallele = [0, 3]
          break
        case 3: // Parallèle à l'arête horizontale de la face de devant - Cas 1
          placeDuPoint2 = randint(2, 8) / 10
          Z = pointSurSegment(
            sommetsPave[1].c2d,
            sommetsPave[2].c2d,
            placeDuPoint1 * longueur(sommetsPave[1].c2d, sommetsPave[2].c2d),
            choisitLettresDifferentes(1, 'OQWXD' + nomSolide)[0],
            'right',
          )
          areteZ = nomSolide[1] + nomSolide[2]
          Y = pointSurSegment(
            sommetsPave[2].c2d,
            sommetsPave[6].c2d,
            placeDuPoint2 * longueur(sommetsPave[2].c2d, sommetsPave[6].c2d),
            choisitLettresDifferentes(1, 'OQWXD' + nomSolide + Z.nom)[0],
            'right',
          )
          areteY = nomSolide[2] + nomSolide[6]
          ZCorr = translation(
            Z,
            vecteur(sommetsPave[1].c2d, sommetsPave[0].c2d),
          )
          YCorr = translation(
            Y,
            vecteur(sommetsPave[1].c2d, sommetsPave[0].c2d),
          )
          if (choice([false, true])) choixAreteParallele = [0, 1]
          else choixAreteParallele = [2, 3]
          break
      }

      if (
        Z == null ||
        Y == null ||
        ZCorr == null ||
        YCorr == null ||
        choixAreteParallele == null
      ) {
        throw new Error('Configuration de section de pavé incomplète')
      }

      areteParallele =
        nomSolide[choixAreteParallele[1]] + nomSolide[choixAreteParallele[0]]
      traceTesPoints = tracePoint(Z, Y, orangeMathalea)
      traceTesPoints.epaisseur = 2
      traceTesPoints.taille = 5

      enonceFigure =
        mathalea2d(
          {
            optionsTikz: 'baseline=(current bounding box.north)',
            ...fixeBordures(objetsEnonce),
            scale: context.isHtml ? 0.7 : 0.3,
            display: 'block',
          },
          objetsEnonce,
          traceTesPoints,
          labelPoint(Z, Y),
        ) + '<br>'
      texte += enonceFigure
      texte += context.isAmc ? '' : 'Reproduire cette figure. '
      texte += `Sachant que ${Z.nom} est sur l'arête [${areteZ}] et que ${Y.nom} est sur l'arête [${areteY}], `
      texte += `tracer la section du pavé droit ${nomSolide} par un plan passant par les points ${Z.nom} et ${Y.nom} et parallèle à l'arête [${areteParallele}].`
      s1 = segment(Z, Y, orangeMathalea)
      s1.epaisseur = 2
      s2 = segment(Z, ZCorr, orangeMathalea)
      s2.epaisseur = 2
      s3 = segment(ZCorr, YCorr, orangeMathalea)
      s2.epaisseur = 2
      s4 = segment(YCorr, Y, orangeMathalea)
      s4.epaisseur = 2
      s5 = segment(
        sommetsPave[choixAreteParallele[0]].c2d,
        sommetsPave[choixAreteParallele[1]].c2d,
        'green',
      )
      s5.epaisseur = 3

      switch (choix) {
        case 1: // Parallèle à arête verticale - Cas 1
          if (!sommetsPave[7].isVisible || !sommetsPave[6].isVisible) {
            s1.pointilles = 2
            s4.pointilles = 2
          } else {
            s3.pointilles = 2
            s4.pointilles = 2
          }
          break
        case 2: // Parallèle à arête verticale - Cas 2
          if (!sommetsPave[6].isVisible) {
            s1.pointilles = 2
          } else if (!sommetsPave[7].isVisible) {
            s2.pointilles = 2
            s1.pointilles = 2
          } else {
            s3.pointilles = 2
          }
          break
        case 3: // Parallèle à l'arête horizontale de la face de devant - Cas 1
          if (!sommetsPave[6].isVisible || !sommetsPave[5].isVisible) {
            s1.pointilles = 2
          } else if (!sommetsPave[7].isVisible) {
            s3.pointilles = 2
            s4.pointilles = 2
          } else {
            s3.pointilles = 2
          }
          break
      }
      enonceFigure =
        mathalea2d(
          {
            optionsTikz: 'baseline=(current bounding box.north)',
            ...fixeBordures(objetsEnonce),
            scale: context.isHtml ? 0.7 : 0.3,
            display: 'block',
          },
          objetsEnonce,
          traceTesPoints,
          labelPoint(Z, Y, ZCorr, YCorr),
          s1,
          s2,
          s3,
          s4,
          s5,
        ) + '<br>'
      texteCorr += enonceFigure

      if (this.questionJamaisPosee(i, nomSolide)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr

        if (context.isAmc) {
          this.autoCorrectionAMC[i] = {
            enonce: texte,
            propositions: [
              {
                texte: texteCorr,
                statut: 0,
                sanscadre: true,
              },
            ],
          }
        }
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
