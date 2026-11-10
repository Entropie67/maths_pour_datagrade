import { afficheMesureAngle } from '../../lib/2d/AfficheMesureAngle'
import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { codageSegments } from '../../lib/2d/CodageSegment'
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import {
  Droite,
  droiteAvecNomLatex,
  droiteHorizontaleParPoint,
  droiteParPointEtPente,
  droiteVerticaleParPoint,
} from '../../lib/2d/droites'
import { PointAbstrait, pointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { representant } from '../../lib/2d/representantVecteur'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { pointEstSur } from '../../lib/2d/utilitairesGeometriques'
import { milieu, pointSurDroite } from '../../lib/2d/utilitairesPoint'
import { vecteur } from '../../lib/2d/Vecteur'
import { vide2d } from '../../lib/2d/Vide2d'
import { bleuMathalea, orangeMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import {
  createSubQuestions,
  type SubQuestion,
} from '../../lib/interactif/subQuestions'
import { choice } from '../../lib/outils/arrayOutils'
import { texFractionReduite } from '../../lib/outils/deprecatedFractions'
import { miseEnCouleur, miseEnEvidence } from '../../lib/outils/embellissements'
import { numAlpha } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import {
  imagePointParTransformation,
  type TransformationsIndex,
} from '../../modules/imagePointParTransformation'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Trouver les coordonnées de l'image d'un point par une rotation et une homothétie"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const dateDeModifImportante = '06/11/2026'

/**
 * Trouver les coordonnées d'un punto transformé d'un autre par une des transformations du plan
 * @author Jean-claude Lhote (Modif des paramètres, nbQuestions modifiables par Éric Elter)
 */
export const uuid = 'd4088'

export const refs = {
  'fr-fr': ['3G10-1'],
  'fr-ch': ['10CTES2B-3', '10LCES2B-3', '10LSES2B-3', '11LCES3A-5', '11LSES3A-5', 'PRQES03A-7', '9R1ES4E-7', '9R2ES4E-7', '9R3ES4E-7', 'PRQES02D-15'],
}
export default class TransformationsDuPlanEtCoordonnees extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Choix des transformations ',
      'Nombres séparés par des tirets (3 maximum) \n1 : Symétrie axiale\n2 : Symétrie centrale\n3 : Translation\n4 : Rotation\n5 : Homothétie de rapport décimal (agrandissement)\n6 : Homothétie de rapport fractionnaire (réduction)\n7: Mélange',
    ]

    this.nbQuestions = 1

    context.fenetreMathalea2d = [-9, -9, 9, 9]
    this.sup = '4-5-6'
  }

  nouvelleVersion() {
    const k: number[] = []
    // On initialise les PointAbstrait pour éviter les erreurs typescript type undefined.
    let A: PointAbstrait = pointAbstrait(0, 0)
    let B: PointAbstrait = pointAbstrait(0, 0)
    let C: PointAbstrait = pointAbstrait(0, 0)
    let Aprime: PointAbstrait = pointAbstrait(0, 0)
    let Bprime: PointAbstrait = pointAbstrait(0, 0)
    let Cprime: PointAbstrait = pointAbstrait(0, 0)
    const xP = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] // ces nombres sont juste là pour compter combien il y en a... ils seront remplacés plus tard par les coordonnées utiles ou pas.
    const yP = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] // comme pour t, je n'utiliserai pas le premier élément pour coller aux index.
    const t = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] // il y a 14 transformations mais je n'utilise pas t[0] pour coller avec les index.
    const lettre1 = ['A', 'B', 'C']
    const lettre2 = ["O'", 'A', 'B'] // si t[i]=0 alors la transformation concernée n'existe pas, si t[i]=1, on la dessine.
    const punto: number[][] = [[]]
    const couleurs = ['brown', 'green', bleuMathalea]
    const listeTypeDeQuestions = [[1, 2, 3, 4], [7], [8], [5, 6], [9], [10]]
    for (
      let ee = 0,
        xA = 0,
        yA = 0,
        xB = 0,
        yB = 0,
        xC = 0,
        yC = 0,
        objetsEnonce,
        objetsCorrection,
        cpt = 0;
      ee < this.nbQuestions && cpt < 50;
    ) {
      const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
        saisie: this.sup,
        min: 1,
        max: 6,
        melange: 7,
        defaut: 7,
        nbQuestions: 3,
      })
        .map(Number)
        .map((nb) => nb - 1)
      let enonceAmc = ''
      const enonces: string[] = []
      const corrections: string[] = []
      const sousQuestions: SubQuestion[] = []
      objetsEnonce = []
      objetsCorrection = []
      const choixTransformation = []
      for (let j = 0; j < 3; j++)
        choixTransformation.push(
          choice(listeTypeDeQuestions[typesDeQuestionsDisponibles[j]]),
        )
      for (let j = 0; j < 3; j++) {
        if (choixTransformation[j] === 10) {
          k[j] = choice([2, 4, 5, -2, -4, -5], k) // rapport d'homothétie entre -1 et 1
        } else {
          k[j] = choice([1.5, 2, 3, 2.5, -1, -2, -3, -2.5, -1.5], k) // rapport d'homothétie > 1 ou <=-1
        }
      }

      const xO = randint(-3, 3, [0, -1]) // PointAbstrait O' (origine du repère dans lequel les transformations sont simples (centre des rotations et punto d'intersection des axes))
      const yO = randint(-3, 3, [0, -1])
      const pointO = pointAbstrait(0, 0, 'O', 'above right')

      const O = pointAbstrait(xO, yO, "O'", 'above left') // on crée le point O'
      let droited1,
        droited2,
        droited,
        droitedprime,
        droitedLatex,
        droited1Latex,
        droited2Latex,
        droitedprimeLatex
      let trouve = false
      let compteur = 0
      while (!trouve) {
        xA = randint(-7, 7, 0) // PointAbstrait A
        yA = randint(-7, 7, -1)
        if (xA === xO && yA === yO) xA = randint(-7, 7, [0, xO])
        punto[0] = imagePointParTransformation(
          choixTransformation[0] as TransformationsIndex,
          [xA, yA],
          [xO, yO],
          [xO, yO],
          k[0],
        )
        punto[0] = punto[0].map((e) => Number(e)) // supprime les fractions étendues, on revient à la notation décimale
        compteur = 0
        while (
          (punto[0][0] < -9 ||
            punto[0][0] > 9 ||
            punto[0][1] < -9 ||
            punto[0][1] > 9) &&
          compteur < 20
        ) {
          // on teste si A est dans la fenêtre sinon on en choisit un autre
          xA = randint(-7, 7, [0]) // PointAbstrait A
          yA = randint(-7, 7, -1)
          if (xA === xO && yA === yO) xA = randint(-7, 7, [0, xO])
          punto[0] = imagePointParTransformation(
            choixTransformation[0] as TransformationsIndex,
            [xA, yA],
            [xO, yO],
            [xO, yO],
            k[0],
          )
          punto[0] = punto[0].map((e) => Number(e)) // supprime les fractions étendues, on revient à la notation décimale
          compteur++
        }
        A = pointAbstrait(xA, yA, 'A')
        Aprime = pointAbstrait(punto[0][0], punto[0][1], "A'")

        // xB = randint(-7, 7, [xA, 0]) // PointAbstrait B
        xB = randint(-7, 7, [xA, 0, punto[0][0]]) // PointAbstrait B
        // yB = randint(-7, 7, -1)
        yB = randint(-7, 7, [yA, -1])
        if (xB === xO && yB === yO) xB = randint(-7, 7, [0, xO, xA])
        if (choixTransformation[1] > 4) {
          punto[1] = imagePointParTransformation(
            choixTransformation[1] as TransformationsIndex,
            [xB, yB],
            [xA, yA],
            [xA, yA],
            k[1],
          )
          punto[1] = punto[1].map((e) => Number(e)) // supprime les fractions étendues, on revient à la notation décimale
        } else {
          punto[1] = imagePointParTransformation(
            choixTransformation[1] as TransformationsIndex,
            [xB, yB],
            [xO, yO],
          )
          punto[1] = punto[1].map((e) => Number(e)) // supprime les fractions étendues, on revient à la notation décimale
        } // si c'est une symétrie, l'axe passe par O'
        compteur = 0
        while (
          (punto[1][0] < -9 ||
            punto[1][0] > 9 ||
            punto[1][1] < -9 ||
            punto[1][1] > 9) &&
          compteur < 20
        ) {
          // on teste si on est dans les clous, sinon on choisit un autre punto B
          xB = randint(-7, 7, [0, xA]) // PointAbstrait B
          yB = randint(-7, 7, -1)
          if (xB === xO && yB === yO) xB = randint(-7, 7, [0, xO, xA])
          if (choixTransformation[1] > 4) {
            punto[1] = imagePointParTransformation(
              choixTransformation[1] as TransformationsIndex,
              [xB, yB],
              [xA, yA],
              [xA, yA],
              k[1],
            )
            punto[1] = punto[1].map((e) => Number(e)) // supprime les fractions étendues, on revient à la notation décimale
          } else {
            punto[1] = imagePointParTransformation(
              choixTransformation[1] as TransformationsIndex,
              [xB, yB],
              [xO, yO],
            )
            punto[1] = punto[1].map((e) => Number(e)) // supprime les fractions étendues, on revient à la notation décimale
          } // si c'est une symétrie, l'axe passe par O'
          compteur++
        }

        B = pointAbstrait(xB, yB, 'B')
        Bprime = pointAbstrait(punto[1][0], punto[1][1], "B'")

        // xC = randint(-7, 7, 0) // PointAbstrait C
        xC = randint(-7, 7, [0, punto[0][0], punto[1][0]]) // PointAbstrait C
        yC = randint(-7, 7, [yA, yB, -1])
        if (xC === xO && yC === yO) xC = randint(-7, 7, [0, xO, xA, xB])
        if (choixTransformation[2] > 4) {
          punto[2] = imagePointParTransformation(
            choixTransformation[2] as TransformationsIndex,
            [xC, yC],
            [xB, yB],
            [xB, yB],
            k[2],
          )
          punto[2] = punto[2].map((e) => Number(e)) // supprime les fractions étendues, on revient à la notation décimale
        } else {
          punto[2] = imagePointParTransformation(
            choixTransformation[2] as TransformationsIndex,
            [xC, yC],
            [xO, yO],
          )
          punto[2] = punto[2].map((e) => Number(e)) // supprime les fractions étendues, on revient à la notation décimale
        } // si c'est une symétrie, l'axe passe par O'
        compteur = 0
        while (
          (punto[2][0] < -9 ||
            punto[2][0] > 9 ||
            punto[2][1] < -9 ||
            punto[2][1] > 9) &&
          compteur < 20
        ) {
          // on vérifie que C est dans le repère sinon on change le punto C.
          xC = randint(-7, 7, [0, xA, xB]) // PointAbstrait C
          yC = randint(-7, 7, [yA, yB, -1])
          if (xC === xO && yC === yO) xC = randint(-7, 7, [0, xO, xA, xB])
          if (choixTransformation[2] > 4) {
            punto[2] = imagePointParTransformation(
              choixTransformation[2] as TransformationsIndex,
              [xC, yC],
              [xB, yB],
              [xB, yB],
              k[2],
            )
            punto[2] = punto[2].map((e) => Number(e)) // supprime les fractions étendues, on revient à la notation décimale
          } else {
            punto[2] = imagePointParTransformation(
              choixTransformation[2] as TransformationsIndex,
              [xC, yC],
              [xO, yO],
            )
            punto[2] = punto[2].map((e) => Number(e)) // supprime les fractions étendues, on revient à la notation décimale
          } // si c'est une symétrie, l'axe passe par O'
          compteur++
        }
        if (compteur < 20) {
          trouve = true
        } else {
          continue
        }
        C = pointAbstrait(xC, yC, 'C')
        Cprime = pointAbstrait(punto[2][0], punto[2][1], "C'")
      }
      let couleurDroite: string = 'black'
      // les puntos sont choisis, on écrit l'énoncé
      for (let i = 0; i < 3; i++) {
        couleurDroite = context.isHtml ? couleurs[i] : 'black'
        switch (choixTransformation[i]) {
          case 1: // symétrie axiale
            droited1Latex = droiteAvecNomLatex(
              droiteParPointEtPente(O, 1, '', couleurDroite),
              '(d_1)',
              couleurDroite,
            )
            droited1 = droited1Latex[0] as Droite
            droited1.isVisible = true
            droited1.epaisseur = 2
            droited1.opacite = 0.5
            t[1] = 1
            if (i === 0) {
              objetsEnonce.push(tracePoint(A), labelPoint(A))
              objetsCorrection.push(
                tracePoint(A),
                labelPoint(A),
                tracePoint(Aprime, orangeMathalea),
                labelPoint(Aprime, orangeMathalea),
                pointEstSur(A, droited1)
                  ? vide2d()
                  : [
                      segment(A, Aprime, couleurs[i]),
                      codageAngleDroit(
                        A,
                        milieu(A, Aprime),
                        pointSurDroite(droited1, -15),
                        couleurs[i],
                      ),
                      codageSegments(
                        '//',
                        couleurs[i],
                        A,
                        milieu(A, Aprime),
                        milieu(A, Aprime),
                        Aprime,
                      ),
                    ],
              )
              xP[1] = xA
              yP[1] = yA
            } else if (i === 1) {
              couleurDroite = context.isHtml
                ? choixTransformation[0] === choixTransformation[1]
                  ? couleurs[0]
                  : couleurs[i]
                : 'black'
              objetsEnonce.push(tracePoint(B), labelPoint(B))
              objetsCorrection.push(
                tracePoint(B),
                labelPoint(B),
                tracePoint(Bprime, orangeMathalea),
                labelPoint(Bprime, orangeMathalea),
                pointEstSur(B, droited1)
                  ? vide2d()
                  : [
                      segment(B, Bprime, couleurs[i]),
                      codageAngleDroit(
                        B,
                        milieu(B, Bprime),
                        pointSurDroite(droited1, -15),
                        couleurs[i],
                      ),
                      codageSegments(
                        'O',
                        couleurs[i],
                        B,
                        milieu(B, Bprime),
                        milieu(B, Bprime),
                        Bprime,
                      ),
                    ],
              )
              xP[1] = xB
              yP[1] = yB
            } else {
              couleurDroite = context.isHtml
                ? choixTransformation[0] === choixTransformation[2]
                  ? couleurs[0]
                  : choixTransformation[1] === choixTransformation[2]
                    ? couleurs[1]
                    : couleurs[i]
                : 'black'
              objetsEnonce.push(tracePoint(C), labelPoint(C))
              objetsCorrection.push(
                tracePoint(C),
                labelPoint(C),
                tracePoint(Cprime, orangeMathalea),
                labelPoint(Cprime, orangeMathalea),
                pointEstSur(C, droited1)
                  ? vide2d()
                  : [
                      segment(C, Cprime, couleurs[i]),
                      codageAngleDroit(
                        C,
                        milieu(C, Cprime),
                        pointSurDroite(droited1, -15),
                        couleurs[i],
                      ),
                      codageSegments(
                        '|||',
                        couleurs[i],
                        C,
                        milieu(C, Cprime),
                        milieu(C, Cprime),
                        Cprime,
                      ),
                    ],
              )
              xP[1] = xC
              yP[1] = yC
            }
            droited1.color = colorToLatexOrHTML(couleurDroite)
            droited1Latex[1].color = colorToLatexOrHTML(couleurDroite)
            objetsEnonce.push(droited1Latex)
            objetsCorrection.push(droited1Latex)

            enonces[i] =
              `Donner les coordonnées du symétrique de $${lettre1[i]}$ par rapport à la droite $${miseEnCouleur('(d_1)', droited1.color[0])}$.`
            if (context.isAmc) {
              enonceAmc +=
                (i === 0 ? numAlpha(i) : '<br>' + numAlpha(i)) +
                ` Donner les coordonnées du symétrique de $${lettre1[i]}$ par rapport à la droite $${miseEnCouleur('(d_1)', droited1.color[0])}$.`
            }
            corrections[i] =
              `$${lettre1[i]}'$, le symétrique de $${lettre1[i]}$ par rapport à $(d_1)$ a pour coordonnées $(${miseEnEvidence(`${texNombre(punto[i][0])};${texNombre(punto[i][1])}`)})$.`
            break

          case 2: // symétrie axiale
            droited2Latex = droiteAvecNomLatex(
              droiteParPointEtPente(O, -1, '', couleurDroite),
              '(d_2)',
              couleurDroite,
            )
            droited2 = droited2Latex[0] as Droite
            droited2.isVisible = true
            droited2.epaisseur = 2
            droited2.opacite = 0.5
            t[2] = 1
            if (i === 0) {
              droited2.color = colorToLatexOrHTML(couleurDroite)
              objetsEnonce.push(tracePoint(A), labelPoint(A))
              objetsCorrection.push(
                tracePoint(A),
                labelPoint(A),
                tracePoint(Aprime, orangeMathalea),
                labelPoint(Aprime, orangeMathalea),
                pointEstSur(A, droited2)
                  ? vide2d()
                  : [
                      segment(A, Aprime, couleurs[i]),
                      codageAngleDroit(
                        A,
                        milieu(A, Aprime),
                        pointSurDroite(droited2, -15),
                        couleurs[i],
                      ),
                      codageSegments(
                        '//',
                        couleurs[i],
                        A,
                        milieu(A, Aprime),
                        milieu(A, Aprime),
                        Aprime,
                      ),
                    ],
              )
              xP[2] = xA
              yP[2] = yA
            } else if (i === 1) {
              couleurDroite = context.isHtml
                ? choixTransformation[0] === choixTransformation[1]
                  ? couleurs[0]
                  : couleurs[i]
                : 'black'
              objetsEnonce.push(tracePoint(B), labelPoint(B))
              objetsCorrection.push(
                tracePoint(B),
                labelPoint(B),
                tracePoint(Bprime, orangeMathalea),
                labelPoint(Bprime, orangeMathalea),
                pointEstSur(B, droited2)
                  ? vide2d()
                  : [
                      segment(B, Bprime, couleurs[i]),
                      codageAngleDroit(
                        B,
                        milieu(B, Bprime),
                        pointSurDroite(droited2, -15),
                        couleurs[i],
                      ),
                      codageSegments(
                        'O',
                        couleurs[i],
                        B,
                        milieu(B, Bprime),
                        milieu(B, Bprime),
                        Bprime,
                      ),
                    ],
              )
              xP[2] = xB
              yP[2] = yB
            } else {
              couleurDroite = context.isHtml
                ? choixTransformation[0] === choixTransformation[2]
                  ? couleurs[0]
                  : choixTransformation[1] === choixTransformation[2]
                    ? couleurs[1]
                    : couleurs[i]
                : 'black'
              objetsEnonce.push(tracePoint(C), labelPoint(C))
              objetsCorrection.push(
                tracePoint(C),
                labelPoint(C),
                tracePoint(Cprime, orangeMathalea),
                labelPoint(Cprime, orangeMathalea),
                pointEstSur(C, droited2)
                  ? vide2d()
                  : [
                      segment(C, Cprime, couleurs[i]),
                      codageAngleDroit(
                        C,
                        milieu(C, Cprime),
                        pointSurDroite(droited2, -15),
                        couleurs[i],
                      ),
                      codageSegments(
                        '|||',
                        couleurs[i],
                        C,
                        milieu(C, Cprime),
                        milieu(C, Cprime),
                        Cprime,
                      ),
                    ],
              )
              xP[2] = xC
              yP[2] = yC
            }
            droited2.color = colorToLatexOrHTML(couleurDroite)
            droited2Latex[1].color = colorToLatexOrHTML(couleurDroite)
            objetsEnonce.push(droited2Latex)
            objetsCorrection.push(droited2Latex)
            enonces[i] =
              `Donner les coordonnées du symétrique de $${lettre1[i]}$ par rapport à la droite $${miseEnCouleur('(d_2)', droited2.color[0])}$.`
            if (context.isAmc) {
              enonceAmc +=
                (i === 0 ? numAlpha(i) : '<br>' + numAlpha(i)) +
                ` Donner les coordonnées du symétrique de $${lettre1[i]}$ par rapport à la droite $${miseEnCouleur('(d_2)', droited2.color[0])}$.`
            }
            corrections[i] =
              `$${lettre1[i]}'$, le symétrique de $${lettre1[i]}$ par rapport à $(d_2)$ a pour coordonnées $(${miseEnEvidence(`${texNombre(punto[i][0])};${texNombre(punto[i][1])}`)})$.`
            break

          case 3: // symétrie axiale
            droitedLatex = droiteAvecNomLatex(
              droiteHorizontaleParPoint(O, ''),
              '(d)',
              couleurDroite,
            )
            droited = droitedLatex[0] as Droite
            droited.isVisible = true
            droited.epaisseur = 2
            droited.opacite = 0.5
            t[3] = 1
            if (i === 0) {
              objetsEnonce.push(tracePoint(A), labelPoint(A))
              objetsCorrection.push(
                tracePoint(A),
                labelPoint(A),
                tracePoint(Aprime, couleurs[i]),
                labelPoint(Aprime, orangeMathalea),
                pointEstSur(A, droited)
                  ? vide2d()
                  : [
                      segment(A, Aprime, orangeMathalea),
                      codageAngleDroit(
                        A,
                        milieu(A, Aprime),
                        pointSurDroite(droited, -15),
                        couleurs[i],
                      ),
                      codageSegments(
                        '//',
                        couleurs[i],
                        A,
                        milieu(A, Aprime),
                        milieu(A, Aprime),
                        Aprime,
                      ),
                    ],
              )
              xP[3] = xA
              yP[3] = yA
            } else if (i === 1) {
              couleurDroite = context.isHtml
                ? choixTransformation[0] === choixTransformation[1]
                  ? couleurs[0]
                  : couleurs[i]
                : 'black'
              objetsEnonce.push(tracePoint(B), labelPoint(B))
              objetsCorrection.push(
                tracePoint(B),
                labelPoint(B),
                tracePoint(Bprime, couleurs[i]),
                labelPoint(Bprime, orangeMathalea),
                pointEstSur(B, droited)
                  ? vide2d()
                  : [
                      segment(B, Bprime, orangeMathalea),
                      codageAngleDroit(
                        B,
                        milieu(B, Bprime),
                        pointSurDroite(droited, -15),
                        couleurs[i],
                      ),
                      codageSegments(
                        'O',
                        couleurs[i],
                        B,
                        milieu(B, Bprime),
                        milieu(B, Bprime),
                        Bprime,
                      ),
                    ],
              )
              xP[3] = xB
              yP[3] = yB
            } else {
              couleurDroite = context.isHtml
                ? choixTransformation[0] === choixTransformation[2]
                  ? couleurs[0]
                  : choixTransformation[1] === choixTransformation[2]
                    ? couleurs[1]
                    : couleurs[i]
                : 'black'
              objetsEnonce.push(tracePoint(C), labelPoint(C))
              objetsCorrection.push(
                tracePoint(C),
                labelPoint(C),
                tracePoint(Cprime, couleurs[i]),
                labelPoint(Cprime, orangeMathalea),
                pointEstSur(C, droited)
                  ? vide2d()
                  : [
                      segment(C, Cprime, orangeMathalea),
                      codageAngleDroit(
                        C,
                        milieu(C, Cprime),
                        pointSurDroite(droited, -15),
                        couleurs[i],
                      ),
                      codageSegments(
                        '|||',
                        couleurs[i],
                        C,
                        milieu(C, Cprime),
                        milieu(C, Cprime),
                        Cprime,
                      ),
                    ],
              )
              xP[3] = xC
              yP[3] = yC
            }
            droited.color = colorToLatexOrHTML(couleurDroite)
            droitedLatex[1].color = colorToLatexOrHTML(couleurDroite)
            objetsEnonce.push(droitedLatex)
            objetsCorrection.push(droitedLatex)
            enonces[i] =
              `Donner les coordonnées du symétrique de $${lettre1[i]}$ par rapport à la droite $${miseEnCouleur('(d)', droited.color[0])}$.`
            if (context.isAmc) {
              enonceAmc +=
                (i === 0 ? numAlpha(i) : '<br>' + numAlpha(i)) +
                ` Donner les coordonnées du symétrique de $${lettre1[i]}$ par rapport à la droite $${miseEnCouleur('(d)', droited.color[0])}$.`
            }
            corrections[i] =
              `$${lettre1[i]}'$, le symétrique de $${lettre1[i]}$ par rapport à $(d)$ a pour coordonnées $(${miseEnEvidence(`${texNombre(punto[i][0])};${texNombre(punto[i][1])}`)})$.`
            break

          case 4: // symétrie axiale
            droitedprimeLatex = droiteAvecNomLatex(
              droiteVerticaleParPoint(O, '', couleurDroite),
              "(d')",
              couleurDroite,
            )
            droitedprime = droitedprimeLatex[0] as Droite
            droitedprime.isVisible = true
            droitedprime.epaisseur = 2
            droitedprime.opacite = 0.5
            t[4] = 1
            if (i === 0) {
              objetsEnonce.push(tracePoint(A), labelPoint(A))
              objetsCorrection.push(
                tracePoint(A),
                labelPoint(A),
                tracePoint(Aprime, orangeMathalea),
                labelPoint(Aprime, orangeMathalea),
                pointEstSur(A, droitedprime)
                  ? vide2d()
                  : [
                      segment(A, Aprime, couleurs[i]),
                      codageAngleDroit(
                        A,
                        milieu(A, Aprime),
                        pointSurDroite(droitedprime, -15),
                        couleurs[i],
                      ),
                      codageSegments(
                        '//',
                        couleurs[i],
                        A,
                        milieu(A, Aprime),
                        milieu(A, Aprime),
                        Aprime,
                      ),
                    ],
              )
              xP[4] = xA
              yP[4] = yA
            } else if (i === 1) {
              couleurDroite = context.isHtml
                ? choixTransformation[0] === choixTransformation[1]
                  ? couleurs[0]
                  : couleurs[i]
                : 'black'
              objetsEnonce.push(tracePoint(B), labelPoint(B))
              objetsCorrection.push(
                tracePoint(B),
                labelPoint(B),
                tracePoint(Bprime, orangeMathalea),
                labelPoint(Bprime, orangeMathalea),
                pointEstSur(B, droitedprime)
                  ? vide2d()
                  : [
                      segment(B, Bprime, couleurs[i]),
                      codageAngleDroit(
                        B,
                        milieu(B, Bprime),
                        pointSurDroite(droitedprime, -15),
                        couleurs[i],
                      ),
                      codageSegments(
                        'O',
                        couleurs[i],
                        B,
                        milieu(B, Bprime),
                        milieu(B, Bprime),
                        Bprime,
                      ),
                    ],
              )
              xP[4] = xB
              yP[4] = yB
            } else {
              couleurDroite = context.isHtml
                ? choixTransformation[0] === choixTransformation[2]
                  ? couleurs[0]
                  : choixTransformation[1] === choixTransformation[2]
                    ? couleurs[1]
                    : couleurs[i]
                : 'black'
              objetsEnonce.push(tracePoint(C), labelPoint(C))
              objetsCorrection.push(
                tracePoint(C),
                labelPoint(C),
                tracePoint(Cprime, orangeMathalea),
                labelPoint(Cprime, orangeMathalea),
                pointEstSur(C, droitedprime)
                  ? vide2d()
                  : [
                      segment(C, Cprime, couleurs[i]),
                      codageAngleDroit(
                        C,
                        milieu(C, Cprime),
                        pointSurDroite(droitedprime, -15),
                        couleurs[i],
                      ),
                      codageSegments(
                        '|||',
                        couleurs[i],
                        C,
                        milieu(C, Cprime),
                        milieu(C, Cprime),
                        Cprime,
                      ),
                    ],
              )
              xP[4] = xC
              yP[4] = yC
            }
            droitedprime.color = colorToLatexOrHTML(couleurDroite)
            droitedprimeLatex[1].color = colorToLatexOrHTML(couleurDroite)
            objetsEnonce.push(droitedprimeLatex)
            objetsCorrection.push(droitedprimeLatex)
            enonces[i] =
              `Donner les coordonnées du symétrique de $${lettre1[i]}$ par rapport à la droite $${miseEnCouleur("(d')", droitedprime.color[0])}$.`
            if (context.isAmc) {
              enonceAmc +=
                (i === 0 ? numAlpha(i) : '<br>' + numAlpha(i)) +
                ` Donner les coordonnées du symétrique de $${lettre1[i]}$ par rapport à la droite $${miseEnCouleur("(d')", droitedprime.color[0])}$.`
            }
            corrections[i] =
              `$${lettre1[i]}'$, le symétrique de $${lettre1[i]}$ par rapport à $(d')$ a pour coordonnées $(${miseEnEvidence(`${texNombre(punto[i][0])};${texNombre(punto[i][1])}`)})$.`
            break

          case 5: // rotation de 90°
            t[5] = 1
            if (i === 0) {
              objetsEnonce.push(tracePoint(A, O), labelPoint(A, O))
              objetsCorrection.push(
                tracePoint(A, O),
                labelPoint(A, O),
                tracePoint(Aprime, orangeMathalea),
                labelPoint(Aprime, orangeMathalea),
                codageAngleDroit(A, O, Aprime, couleurs[i]),
                segment(O, A, couleurs[i]),
                segment(O, Aprime, couleurs[i]),
                codageSegments('//', couleurs[i], O, A, O, Aprime),
              )
              xP[5] = xA
              yP[5] = yA
            } else if (i === 1) {
              objetsEnonce.push(tracePoint(B, A), labelPoint(B, A))
              objetsCorrection.push(
                tracePoint(B, A),
                labelPoint(B, A),
                tracePoint(Bprime, orangeMathalea),
                labelPoint(Bprime, orangeMathalea),
                codageAngleDroit(B, A, Bprime, couleurs[i]),
                segment(A, B, couleurs[i]),
                segment(A, Bprime, couleurs[i]),
                codageSegments('O', couleurs[i], A, B, A, Bprime),
              )
              xP[5] = xB
              yP[5] = yB
            } else {
              objetsEnonce.push(tracePoint(C, B), labelPoint(C, B))
              objetsCorrection.push(
                tracePoint(C, B),
                labelPoint(C, B),
                tracePoint(Cprime, orangeMathalea),
                labelPoint(Cprime, orangeMathalea),
                codageAngleDroit(C, O, Cprime, couleurs[i]),
                segment(B, C, couleurs[i]),
                segment(B, Cprime, couleurs[i]),
                codageSegments('|||', couleurs[i], B, C, B, Cprime),
              )
              xP[5] = xC
              yP[5] = yC
            }
            enonces[i] =
              `Donner les coordonnées de l'image de $${lettre1[i]}$ par la rotation de centre $${lettre2[i]}$ et d'angle $90^\\circ$ dans le sens anti-horaire.`
            if (context.isAmc) {
              enonceAmc +=
                (i === 0 ? numAlpha(i) : '<br>' + numAlpha(i)) +
                ` Donner les coordonnées de l'image de $${lettre1[i]}$ par la rotation de centre $${lettre2[i]}$ et d'angle $90^\\circ$ dans le sens anti-horaire.`
            }
            corrections[i] =
              `$${lettre1[i]}'$, l'image de $${lettre1[i]}$ par la rotation de centre $${lettre2[i]}$ et d'angle $90^\\circ$ dans le sens anti-horaire a pour coordonnées $(${miseEnEvidence(`${texNombre(punto[i][0])};${texNombre(punto[i][1])}`)})$.`
            break

          case 6: // rotation de 90°
            t[6] = 1
            if (i === 0) {
              objetsEnonce.push(tracePoint(A, O), labelPoint(A, O))
              objetsCorrection.push(
                tracePoint(A, O),
                labelPoint(A, O),
                tracePoint(Aprime, orangeMathalea),
                labelPoint(Aprime, orangeMathalea),
                codageAngleDroit(A, O, Aprime, couleurs[i]),
                segment(O, A, couleurs[i]),
                segment(O, Aprime, couleurs[i]),
                afficheMesureAngle(A, O, Aprime),
                codageSegments('//', couleurs[i], O, A, O, Aprime),
              )
              xP[6] = xA
              yP[6] = yA
            } else if (i === 1) {
              objetsEnonce.push(tracePoint(B, A), labelPoint(B, A))
              objetsCorrection.push(
                tracePoint(B, A),
                labelPoint(B, A),
                tracePoint(Bprime, orangeMathalea),
                labelPoint(Bprime, orangeMathalea),
                codageAngleDroit(B, A, Bprime, couleurs[i]),
                segment(A, B, couleurs[i]),
                segment(A, Bprime, couleurs[i]),
                codageSegments('O', couleurs[i], A, B, A, Bprime),
              )
              xP[6] = xB
              yP[6] = yB
            } else {
              objetsEnonce.push(tracePoint(C, B), labelPoint(C, B))
              objetsCorrection.push(
                tracePoint(C, B),
                labelPoint(C, B),
                tracePoint(Cprime, orangeMathalea),
                labelPoint(Cprime, orangeMathalea),
                codageAngleDroit(C, B, Cprime, couleurs[i]),
                segment(B, C, couleurs[i]),
                segment(B, Cprime, couleurs[i]),
                afficheMesureAngle(C, B, Cprime),
                codageSegments('|||', couleurs[i], B, C, B, Cprime),
              )
              xP[6] = xC
              yP[6] = yC
            }
            enonces[i] =
              `Donner les coordonnées de l'image de $${lettre1[i]}$ par la rotation de centre $${lettre2[i]}$ et d'angle $90^\\circ$ dans le sens horaire.`
            if (context.isAmc) {
              enonceAmc +=
                (i === 0 ? numAlpha(i) : '<br>' + numAlpha(i)) +
                ` Donner les coordonnées de l'image de $${lettre1[i]}$ par la rotation de centre $${lettre2[i]}$ et d'angle $90^\\circ$ dans le sens horaire.`
            }
            corrections[i] =
              `$${lettre1[i]}'$, l'image de $${lettre1[i]}$ par la rotation de centre $${lettre2[i]}$ et d'angle $90^\\circ$ dans le sens horaire a pour coordonnées $(${miseEnEvidence(`${texNombre(punto[i][0])};${texNombre(punto[i][1])}`)})$.`
            break

          case 7: // symétrie centrale
            t[7] = 1
            if (i === 0) {
              objetsEnonce.push(tracePoint(A, O), labelPoint(A, O))
              objetsCorrection.push(
                tracePoint(A, O),
                labelPoint(A, O),
                tracePoint(Aprime, orangeMathalea),
                labelPoint(Aprime, orangeMathalea),
                segment(O, A, couleurs[i]),
                segment(O, Aprime, couleurs[i]),
                codageSegments('//', couleurs[i], O, A, O, Aprime),
              )
              xP[7] = xA
              yP[7] = yA
            } else if (i === 1) {
              objetsEnonce.push(tracePoint(B, A), labelPoint(B, A))
              objetsCorrection.push(
                tracePoint(B, A),
                labelPoint(B, A),
                tracePoint(Bprime, orangeMathalea),
                labelPoint(Bprime, orangeMathalea),
                segment(A, B, couleurs[i]),
                segment(A, Bprime, couleurs[i]),
                codageSegments('O', couleurs[i], A, B, A, Bprime),
              )
              xP[7] = xB
              yP[7] = yB
            } else {
              objetsEnonce.push(tracePoint(C, B), labelPoint(C, B))
              objetsCorrection.push(
                tracePoint(C, B),
                labelPoint(C, B),
                tracePoint(Cprime, orangeMathalea),
                labelPoint(Cprime, orangeMathalea),
                segment(B, C, couleurs[i]),
                segment(B, Cprime, couleurs[i]),
                codageSegments('|||', couleurs[i], B, C, B, Cprime),
              )
              xP[7] = xC
              yP[7] = yC
            }
            enonces[i] =
              `Donner les coordonnées de l'image de $${lettre1[i]}$ par la symétrie de centre $${lettre2[i]}$.`
            if (context.isAmc) {
              enonceAmc +=
                (i === 0 ? numAlpha(i) : '<br>' + numAlpha(i)) +
                ` Donner les coordonnées de l'image de $${lettre1[i]}$ par la symétrie de centre $${lettre2[i]}$.`
            }
            corrections[i] =
              `$${lettre1[i]}'$, l'image de $${lettre1[i]}$ par la symétrie de centre $${lettre2[i]}$ a pour coordonnées $(${miseEnEvidence(`${texNombre(punto[i][0])};${texNombre(punto[i][1])}`)})$.`
            break
          case 8: // translation
            t[8] = 1
            O.positionLabel = 'right'
            if (i === 0) {
              objetsEnonce.push(
                tracePoint(A, O, pointO),
                labelPoint(A, O, pointO),
                representant(vecteur(pointO, O), pointO),
              )
              objetsCorrection.push(
                tracePoint(A, O, pointO),
                labelPoint(A, O, pointO),
                tracePoint(Aprime, orangeMathalea),
                labelPoint(Aprime, orangeMathalea),
                representant(vecteur(pointO, O), A, couleurs[i]),
                representant(vecteur(pointO, O), pointO, couleurs[i]),
              )
              xP[8] = xA
              yP[8] = yA
            } else if (i === 1) {
              objetsEnonce.push(
                tracePoint(B, A, pointO),
                labelPoint(B, A, pointO),
                representant(vecteur(pointO, A), pointO),
              )
              objetsCorrection.push(
                tracePoint(B, A, pointO),
                labelPoint(B, A, pointO),
                tracePoint(Bprime, orangeMathalea),
                labelPoint(Bprime, orangeMathalea),
                representant(vecteur(pointO, A), B, couleurs[i]),
                representant(vecteur(pointO, A), pointO, couleurs[i]),
              )
              xP[8] = xB
              yP[8] = yB
            } else {
              objetsEnonce.push(
                tracePoint(C, B, pointO),
                labelPoint(C, B, pointO),
                representant(vecteur(pointO, B), pointO),
              )
              objetsCorrection.push(
                tracePoint(C, B, pointO),
                labelPoint(C, B, pointO),
                tracePoint(Cprime, orangeMathalea),
                labelPoint(Cprime, orangeMathalea),
                representant(vecteur(pointO, B), C, couleurs[i]),
                representant(vecteur(pointO, B), pointO, couleurs[i]),
              )
              xP[8] = xC
              yP[8] = yC
            }
            enonces[i] =
              `Donner les coordonnées de l'image de $${lettre1[i]}$ par la translation qui transforme $O$ en $${lettre2[i]}$.`
            if (context.isAmc) {
              enonceAmc +=
                (i === 0 ? numAlpha(i) : '<br>' + numAlpha(i)) +
                ` Donner les coordonnées de l'image de $${lettre1[i]}$ par la translation qui transforme $O$ en $${lettre2[i]}$.`
            }
            corrections[i] =
              `$${lettre1[i]}'$, l'image de $${lettre1[i]}$ par la translation qui transforme $O$ en $${lettre2[i]}$ a pour coordonnées $(${miseEnEvidence(`${texNombre(punto[i][0])};${texNombre(punto[i][1])}`)})$.`
            break

          case 9: // homothétie de rapport décimal (agrandissement)
            t[9] = 1
            if (i === 0) {
              objetsEnonce.push(tracePoint(A, O), labelPoint(A, O))
              objetsCorrection.push(
                tracePoint(A, O),
                labelPoint(A, O),
                tracePoint(Aprime, orangeMathalea),
                labelPoint(Aprime, orangeMathalea),
                segment(O, A, couleurs[i]),
                segment(O, Aprime, couleurs[i]),
              )
              xP[9] = xA
              yP[9] = yA
            } else if (i === 1) {
              objetsEnonce.push(tracePoint(B, A), labelPoint(B, A))
              objetsCorrection.push(
                tracePoint(B, A),
                labelPoint(B, A),
                tracePoint(Bprime, orangeMathalea),
                labelPoint(Bprime, orangeMathalea),
                segment(A, B, couleurs[i]),
                segment(A, Bprime, couleurs[i]),
              )

              xP[9] = xB
              yP[9] = yB
            } else {
              objetsEnonce.push(tracePoint(C, B), labelPoint(C, B))
              objetsCorrection.push(
                tracePoint(C, B),
                labelPoint(C, B),
                tracePoint(Cprime, orangeMathalea),
                labelPoint(Cprime, orangeMathalea),
                segment(B, C, couleurs[i]),
                segment(B, Cprime, couleurs[i]),
              )

              xP[9] = xC
              yP[9] = yC
            }
            enonces[i] =
              `Donner les coordonnées de l'image de $${lettre1[i]}$ par l'homothétie de centre $${lettre2[i]}$ et de rapport $${texNombre(k[i])}$.`
            if (context.isAmc) {
              enonceAmc +=
                (i === 0 ? numAlpha(i) : '<br>' + numAlpha(i)) +
                ` Donner les coordonnées de l'image de $${lettre1[i]}$ par l'homothétie de centre $${lettre2[i]}$ et de rapport $${texNombre(k[i])}$.`
            }
            corrections[i] =
              `$${lettre1[i]}'$, l'image de $${lettre1[i]}$ par l'homothétie de centre $${lettre2[i]}$ et de rapport $${texNombre(k[i])}$ a pour coordonnées $(${miseEnEvidence(`${texNombre(punto[i][0])};${texNombre(punto[i][1])}`)})$.`
            break

          case 10: // homothétie de rapport fractionnaire (réduction)
            t[10] = 1
            if (i === 0) {
              objetsEnonce.push(tracePoint(A, O), labelPoint(A, O))
              objetsCorrection.push(
                tracePoint(A, O),
                labelPoint(A, O),
                tracePoint(Aprime, orangeMathalea),
                labelPoint(Aprime, orangeMathalea),
                segment(O, A, couleurs[i]),
                segment(O, Aprime, couleurs[i]),
              )
              xP[10] = xA
              yP[10] = yA
            } else if (i === 1) {
              objetsEnonce.push(tracePoint(B, A), labelPoint(B, A))
              objetsCorrection.push(
                tracePoint(B, A),
                labelPoint(B, A),
                tracePoint(Bprime, orangeMathalea),
                labelPoint(Bprime, orangeMathalea),
                segment(A, B, couleurs[i]),
                segment(A, Bprime, couleurs[i]),
              )
              xP[10] = xB
              yP[10] = yB
            } else {
              objetsEnonce.push(tracePoint(C, B), labelPoint(C, B))
              objetsCorrection.push(
                tracePoint(C, B),
                labelPoint(C, B),
                tracePoint(Cprime, orangeMathalea),
                labelPoint(Cprime, orangeMathalea),
                segment(B, C, couleurs[i]),
                segment(B, Cprime, couleurs[i]),
              )
              xP[10] = xC
              yP[10] = yC
            }
            enonces[i] =
              `Donner les coordonnées de l'image de $${lettre1[i]}$ par l'homothétie de centre $${lettre2[i]}$ et de rapport $${texFractionReduite(1, k[i])}$.`
            if (context.isAmc) {
              enonceAmc +=
                (i === 0 ? numAlpha(i) : '<br>' + numAlpha(i)) +
                ` Donner les coordonnées de l'image de $${lettre1[i]}$ par l'homothétie de centre $${lettre2[i]}$ et de rapport $${texFractionReduite(1, k[i])}$.`
            }
            corrections[i] =
              `$${lettre1[i]}'$, l'image de $${lettre1[i]}$ par l'homothétie de centre $${lettre2[i]}$ et de rapport $${texFractionReduite(1, k[i])}$ a pour coordonnées $(${miseEnEvidence(`${texNombre(punto[i][0])};${texNombre(punto[i][1])}`)})$.`
            break

          case 11: // rotation de 60$^\\circ$
            t[11] = 1
            if (i === 0) {
              objetsEnonce.push(tracePoint(A, O), labelPoint(A, O))
              objetsCorrection.push(
                tracePoint(A, Aprime, O),
                labelPoint(A, Aprime, O),
                segment(O, A, couleurs[i]),
                segment(O, Aprime, couleurs[i]),
                afficheMesureAngle(A, O, Aprime),
                codageSegments('//', couleurs[i], O, A, O, Aprime),
              )
              xP[11] = xA
              yP[11] = yA
            } else if (i === 1) {
              objetsEnonce.push(tracePoint(B, A), labelPoint(B, A))
              objetsCorrection.push(
                tracePoint(B, Bprime, A),
                labelPoint(B, Bprime, A),
                segment(A, B, couleurs[i]),
                segment(A, Bprime, couleurs[i]),
                afficheMesureAngle(B, A, Bprime),
                codageSegments('O', couleurs[i], A, B, A, Bprime),
              )
              xP[11] = xB
              yP[11] = yB
            } else {
              objetsEnonce.push(tracePoint(C, B), labelPoint(C, B))
              objetsCorrection.push(
                tracePoint(C, Cprime, B),
                labelPoint(C, Cprime, B),
                segment(B, C, couleurs[i]),
                segment(B, Cprime, couleurs[i]),
                afficheMesureAngle(C, B, Cprime),
                codageSegments('|||', couleurs[i], B, C, B, Cprime),
              )
              xP[11] = xC
              yP[11] = yC
            }
            enonces[i] =
              `Donner les coordonnées de l'image de $${lettre1[i]}$ par la rotation de centre $${lettre2[i]}$ et d'angle 60$^\\circ$ dans le sens anti-horaire.`
            if (context.isAmc) {
              enonceAmc +=
                (i === 0 ? numAlpha(i) : '<br>' + numAlpha(i)) +
                ` Donner les coordonnées de l'image de $${lettre1[i]}$ par la rotation de centre $${lettre2[i]}$ et d'angle 60$^\\circ$ dans le sens anti-horaire.`
            }
            corrections[i] =
              `$${lettre1[i]}'$, l'image de $${lettre1[i]}$ par la rotation de centre $${lettre2[i]}$ et d'angle 60$^\\circ$ dans le sens anti-horaire a pour coordonnées $(${miseEnEvidence(`${texNombre(punto[i][0], 2)};${texNombre(punto[i][1], 2)}`)})$.`
            break
          case 12: // rotation de 60$^\\circ$
            t[12] = 1
            if (i === 0) {
              objetsEnonce.push(tracePoint(A, O), labelPoint(A, O))
              objetsCorrection.push(
                tracePoint(A, Aprime, O),
                labelPoint(A, Aprime, O),
                segment(O, A, couleurs[i]),
                segment(O, Aprime, couleurs[i]),
                afficheMesureAngle(A, O, Aprime),
                codageSegments('//', couleurs[i], O, A, O, Aprime),
              )
              xP[12] = xA
              yP[12] = yA
            } else if (i === 1) {
              objetsEnonce.push(tracePoint(B, A), labelPoint(B, A))
              objetsCorrection.push(
                tracePoint(B, Bprime, A),
                labelPoint(B, Bprime, A),
                segment(A, B, couleurs[i]),
                segment(A, Bprime, couleurs[i]),
                afficheMesureAngle(B, A, Bprime),
                codageSegments('O', couleurs[i], A, B, A, Bprime),
              )
              xP[12] = xB
              yP[12] = yB
            } else {
              objetsEnonce.push(tracePoint(C, B), labelPoint(C, B))
              objetsCorrection.push(
                tracePoint(C, Cprime, B),
                labelPoint(C, Cprime, B),
                segment(B, C, couleurs[i]),
                segment(B, Cprime, couleurs[i]),
                afficheMesureAngle(C, B, Cprime),
                codageSegments('|||', couleurs[i], B, C, B, Cprime),
              )
              xP[12] = xC
              yP[12] = yC
            }
            enonces[i] =
              `Donner les coordonnées de l'image de $${lettre1[i]}$ par la rotation de centre $${lettre2[i]}$ et d'angle 60$^\\circ$ dans le sens horaire.`
            if (context.isAmc) {
              enonceAmc +=
                (i === 0 ? numAlpha(i) : '<br>' + numAlpha(i)) +
                ` Donner les coordonnées de l'image de $${lettre1[i]}$ par la rotation de centre $${lettre2[i]}$ et d'angle 60$^\\circ$ dans le sens horaire.`
            }
            corrections[i] =
              `$${lettre1[i]}'$, l'image de $${lettre1[i]}$ par la rotation de centre $${lettre2[i]}$ et d'angle 60$^\\circ$ dans le sens horaire a pour coordonnées $(${miseEnEvidence(`${texNombre(punto[i][0], 2)};${texNombre((punto[i][1], 2))}`)})$.`
            break

          case 13: // rotation de 120°
            t[13] = 1
            if (i === 0) {
              objetsEnonce.push(tracePoint(A, O), labelPoint(A, O))
              objetsCorrection.push(
                tracePoint(A, Aprime, O),
                labelPoint(A, Aprime, O),
                segment(O, A, couleurs[i]),
                segment(O, Aprime, couleurs[i]),
                afficheMesureAngle(A, O, Aprime),
                codageSegments('//', couleurs[i], O, A, O, Aprime),
              )
              xP[13] = xA
              yP[13] = yA
            } else if (i === 1) {
              objetsEnonce.push(tracePoint(B, A), labelPoint(B, A))
              objetsCorrection.push(
                tracePoint(B, Bprime, A),
                labelPoint(B, Bprime, A),
                segment(A, B, couleurs[i]),
                segment(A, Bprime, couleurs[i]),
                afficheMesureAngle(B, A, Bprime),
                codageSegments('O', couleurs[i], A, B, A, Bprime),
              )
              xP[13] = xB
              yP[13] = yB
            } else {
              objetsEnonce.push(tracePoint(C, B), labelPoint(C, B))
              objetsCorrection.push(
                tracePoint(C, Cprime, B),
                labelPoint(C, Cprime, B),
                segment(B, C, couleurs[i]),
                segment(B, Cprime, couleurs[i]),
                afficheMesureAngle(C, B, Cprime),
                codageSegments('|||', couleurs[i], B, C, B, Cprime),
              )
              xP[13] = xC
              yP[13] = yC
            }
            enonces[i] =
              `Donner les coordonnées de l'image de $${lettre1[i]}$ par la rotation de centre $${lettre2[i]}$ et d'angle 120° dans le sens anti-horaire.`
            if (context.isAmc) {
              enonceAmc +=
                (i === 0 ? numAlpha(i) : '<br>' + numAlpha(i)) +
                ` Donner les coordonnées de l'image de $${lettre1[i]}$ par la rotation de centre $${lettre2[i]}$ et d'angle 120° dans le sens anti-horaire.`
            }
            corrections[i] =
              `$${lettre1[i]}'$, l'image de $${lettre1[i]}$ par la rotation de centre $${lettre2[i]}$ et d'angle 120° dans le sens anti-horaire a pour coordonnées $(${miseEnEvidence(`${texNombre(punto[i][0], 2)};${texNombre(punto[i][1], 2)}`)})$.`
            break

          case 14: // rotation de 120°
            t[14] = 1
            if (i === 0) {
              objetsEnonce.push(tracePoint(A, O), labelPoint(A, O))
              objetsCorrection.push(
                tracePoint(A, Aprime, O),
                labelPoint(A, Aprime, O),
                segment(O, A, couleurs[i]),
                segment(O, Aprime, couleurs[i]),
                afficheMesureAngle(A, O, Aprime),
                codageSegments('//', couleurs[i], O, A, O, Aprime),
              )
              xP[14] = xA
              yP[14] = yA
            } else if (i === 1) {
              objetsEnonce.push(tracePoint(B, A), labelPoint(B, A))
              objetsCorrection.push(
                tracePoint(B, Bprime, A),
                labelPoint(B, Bprime, A),
                segment(A, B, couleurs[i]),
                segment(A, Bprime, couleurs[i]),
                afficheMesureAngle(B, A, Bprime),
                codageSegments('O', couleurs[i], A, B, A, Bprime),
              )
              xP[14] = xB
              yP[14] = yB
            } else {
              objetsEnonce.push(tracePoint(C, B), labelPoint(C, B))
              objetsCorrection.push(
                tracePoint(C, Cprime, B),
                labelPoint(C, Cprime, B),
                segment(B, C, couleurs[i]),
                segment(B, Cprime, couleurs[i]),
                afficheMesureAngle(C, B, Cprime),
                codageSegments('|||', couleurs[i], B, C, B, Cprime),
              )
              xP[14] = xC
              yP[14] = yC
            }
            enonces[i] =
              `Donner les coordonnées de l'image de $${lettre1[i]}$ par la rotation de centre $${lettre2[i]}$ et d'angle 120° dans le sens horaire.`
            if (context.isAmc) {
              enonceAmc +=
                (i === 0 ? numAlpha(i) : '<br>' + numAlpha(i)) +
                ` Donner les coordonnées de l'image de $${lettre1[i]}$ par la rotation de centre $${lettre2[i]}$ et d'angle 120° dans le sens horaire.`
            }
            corrections[i] =
              `$${lettre1[i]}'$, l'image de $${lettre1[i]}$ par la rotation de centre $${lettre2[i]}$ et d'angle 120° dans le sens horaire a pour coordonnées $(${miseEnEvidence(`${texNombre(punto[i][0], 2)};${texNombre(punto[i][1], 2)}`)})$.`
            break
        }
        // Le nom du point et les parenthèses n'entourent le champ qu'en interactif.
        const champ =
          this.interactif && context.isHtml && !context.isTypst
            ? `$~~${lettre1[i]}^{\\prime}($%{0}$)$`
            : ''
        sousQuestions.push({
          question: enonces[i] + champ,
          answer: {
            value: `${punto[i][0]};${punto[i][1]}`,
            options: { coordonnees: true, noFeedback: true },
          },
          field: { keyboard: KeyboardType.lyceeClassique },
          correction: corrections[i],
        })

        if (context.isAmc) {
          enonceAmc += '<br>'
        }
      }
      objetsEnonce.push(
        repere({
          xMin: -10,
          yMin: -10,
          xMax: 10,
          yMax: 10,
          grilleOpacite: 0.2,
        }),
      )
      objetsCorrection.push(
        repere({
          xMin: -10,
          yMin: -10,
          xMax: 10,
          yMax: 10,
          grilleOpacite: 0.2,
        }),
      )
      // Chaque sous-question vaut un point : la question vaut toujours 3 points.
      const sub = createSubQuestions(this, ee, sousQuestions)
      if (context.isAmc) {
        // À l'indice de la question : handleAnswers() y a déjà créé une entrée.
        this.autoCorrectionAMC[ee] = {
          enonce:
            '\\begin{center}' +
            mathalea2d(
              {
                xmin: -10,
                ymin: -10,
                xmax: 10,
                ymax: 10,
                pixelsParCm: 20,
                scale: 0.45,
                mainlevee: false,
              },
              objetsEnonce,
            ) +
            '\\\\' +
            '\\end{center}' +
            enonceAmc,
          enonceAvant: false,
          enonceApresNumQuestion: true,
          options: { barreseparation: false },
          propositions: [
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  statut: '',
                  multicolsBegin: true,
                  reponse: {
                    texte: numAlpha(0) + " Abscisse de l'image de A",
                    valeur: punto[0][0],
                    param: {
                      digits: 1,
                      decimals: 0,
                      signe: true,
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
                  texte: `A(${punto[0][0]};${punto[0][1]})`,
                  statut: '',
                  multicolsEnd: true,
                  reponse: {
                    texte: "Ordonnée de l'image de A",
                    valeur: punto[0][1],
                    param: {
                      digits: 1,
                      decimals: 0,
                      signe: true,
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
                  multicolsBegin: true,
                  reponse: {
                    texte: numAlpha(1) + " Abscisse de l'image de B",
                    valeur: punto[1][0],
                    param: {
                      digits: 1,
                      decimals: 0,
                      signe: true,
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
                  texte: `B(${punto[1][0]};${punto[1][1]})`,
                  statut: '',
                  multicolsEnd: true,
                  reponse: {
                    texte: "Ordonnée de l'image de B",
                    valeur: punto[1][1],
                    param: {
                      digits: 1,
                      decimals: 0,
                      signe: true,
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
                  multicolsBegin: true,
                  reponse: {
                    texte: numAlpha(2) + " Abscisse de l'image de C",
                    valeur: punto[2][0],
                    param: {
                      digits: 1,
                      decimals: 0,
                      signe: true,
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
                  texte: `C(${punto[2][0]};${punto[2][1]})`,
                  statut: '',
                  multicolsEnd: true,
                  reponse: {
                    texte: "Ordonnée de l'image de C",
                    valeur: punto[2][1],
                    param: {
                      digits: 1,
                      decimals: 0,
                      signe: true,
                      approx: 0,
                    },
                  },
                },
              ],
            },
          ],
        }
      }
      if (this.questionJamaisPosee(ee, xA, yA, xB, yB, xC, yC)) {
        this.listeQuestions[ee] =
          sub.question +
          mathalea2d(
            {
              xmin: -10,
              ymin: -10,
              xmax: 10,
              ymax: 10,
              pixelsParCm: 20,
              scale: 0.45,
              mainlevee: false,
            },
            objetsEnonce,
          )
        this.listeCorrections[ee] =
          sub.correction +
          mathalea2d(
            {
              xmin: -10,
              ymin: -10,
              xmax: 10,
              ymax: 10,
              pixelsParCm: 20,
              scale: 0.45,
              mainlevee: false,
            },
            objetsCorrection,
          )
        ee++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
