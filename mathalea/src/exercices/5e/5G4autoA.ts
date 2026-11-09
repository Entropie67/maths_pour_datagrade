import { codageAngle } from '../../lib/2d/angles'
import {
  Droite,
  droite,
  droiteParPointEtPente,
  droiteParPointEtPerpendiculaire,
} from '../../lib/2d/droites'
import { PointAbstrait, pointAbstrait } from '../../lib/2d/PointAbstrait'
import { tracePoint } from '../../lib/2d/TracePoint'
import { rotation, translation2Points } from '../../lib/2d/transformations'
import { angleOriente, longueur } from '../../lib/2d/utilitairesGeometriques'
import { pointSurDroite } from '../../lib/2d/utilitairesPoint'
import { choixDeroulant } from '../../lib/customElements/ListeDeroulanteElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

import type { CodageAngle } from '../../lib/2d/CodageAngle'
import { CodageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { demiDroite, type DemiDroite } from '../../lib/2d/DemiDroite'
import type { TracePoint } from '../../lib/2d/TracePoint'
import { bleuMathalea, vertMathalea } from '../../lib/colors'
import { choice } from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { arrondi, range } from '../../lib/outils/nombres'
import { context } from '../../modules/context'

export const interactifReady = true

export const titre = 'Connaître le vocabulaire sur les angles'
export const dateDePublication = '29/11/2024'
export const dateDeModifImportante = '24/12/2024'

/**
 * Connaitre le vocabulaire sur les angles
 * @author Éric Elter (sur un scénario voulu par Rémi Angot)
 */
export const uuid = '1f334'
export const refs = {
  'fr-fr': ['5G4autoA'],
  'fr-2016': ['5G30-3'],
  'fr-ch': ['1mG1-3', '11LCES1A-2', '11LSES1A-2', 'PRQES01B-4'],
}

// Fonction pour vérifier si tous les points sont dans l'intervalle
function tousDansIntervalle(points: PointAbstrait[]): boolean {
  return points.every(
    (point) => point.x >= -8 && point.x <= 8 && point.y >= -8 && point.y <= 8,
  )
}

export default class VocabulaireAngles extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.besoinFormulaireTexte = [
      "Vocabulaire de l'exercice",
      `Nombres séparés par des tirets :
    1 : Correspondants
    2 : Alternes-internes
    3 : Supplémentaires
    4 : Opposés par le sommet
    5 : Complémentaires
    6 : Côté
    7 : Sommet
    8 : Adjacent
    9 : Mélange`,
    ]
    this.besoinFormulaire2CaseACocher = ['Avec distracteur', false]
    this.besoinFormulaire3CaseACocher = ['En noir et blanc', false]
    this.sup = 9
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 8,
      melange: 9,
      defaut: 9,
      nbQuestions: this.nbQuestions,
    }).map(Number)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texteCorr = ''
      const objets = []

      const origine = pointAbstrait(0, 0)

      let ARot,
        BRot,
        CRot,
        DRot,
        IRot,
        JRot,
        E,
        F,
        G,
        H,
        d1Rot,
        d2Rot,
        d3Rot,
        d4Rot
      const distracteur = this.sup2
      do {
        const xA = randint(4, 8)
        const yA = randint(4, 8)
        const xB = xA * -1
        const yB = yA * -1

        const A = pointAbstrait(xA, yA)
        const B = pointAbstrait(xB, yB)
        const d1 = droiteParPointEtPente(A, 0.5)
        const d2 = droiteParPointEtPente(B, 0.3)
        let C
        do {
          C = pointSurDroite(d1, randint(-4, 4, [0]), 'C')
        } while (longueur(A, C) < 0.5)
        const D = pointSurDroite(d2, 1.5, 'D')
        const d3 = droite(C, D, '', this.sup3 ? 'black' : 'red')
        const d4 = droiteParPointEtPerpendiculaire(C, d3)

        const choix = randint(0, 3) * 90

        ARot = rotation(A, origine, choix)
        BRot = rotation(B, origine, choix)
        CRot = rotation(C, origine, choix)
        DRot = rotation(D, origine, choix)
        d1Rot = rotation(d1, origine, choix) as Droite
        d2Rot = rotation(d2, origine, choix) as Droite
        d3Rot = rotation(d3, origine, choix) as Droite
        d4Rot = rotation(d4, origine, choix) as Droite
        E = translation2Points(CRot, ARot, CRot)
        F = translation2Points(DRot, BRot, DRot)
        G = translation2Points(CRot, DRot, CRot)
        H = translation2Points(DRot, CRot, DRot)

        // I et J sont sur la droite perpendiculaire, leur usage sera en fonction des angles affichés pour éviter la superposition
        // I = pointSurDroite(d4, ((C.x + A.x) / 2), 'I')
        // J = pointSurDroite(d4, ((C.x + E.x) / 2), 'J')
        // IRot = rotation(I, origine, choix)
        // JRot = rotation(J, origine, choix)
        IRot = pointSurDroite(d4Rot, (CRot.x + ARot.x) / 2, 'I')
        JRot = pointSurDroite(d4Rot, (CRot.x + E.x) / 2, 'I')
      } while (!tousDansIntervalle([ARot, BRot, CRot, DRot, E, F, G, H])) // Afin de ne pas avoir de placements de points qui puissent changer le format de la fenêtre prévue
      const tracePts = tracePoint(
        ARot,
        BRot,
        CRot,
        DRot,
        E,
        F,
        G,
        H,
        IRot,
        JRot,
        this.sup3 ? 'black' : 'red',
      ) // Variable qui trace les points avec une croix
      tracePts.epaisseur = 2

      const tabAngles: [
        CodageAngle | CodageAngleDroit,
        (
          | CodageAngle
          | CodageAngleDroit
          | PointAbstrait
          | DemiDroite
          | TracePoint
        ),
        CodageAngle | CodageAngleDroit,
      ][] = []
      const choixQuestion = typesDeQuestionsDisponibles[i] - 1
      let texteSousFigure = ''
      switch (choixQuestion) {
        case 0:
          // Angles correspondants
          texteCorr = `Ce sont des angles ${texteEnCouleurEtGras('correspondants')}.`
          // tabAngles contient deux angles correspondants puis un angle droit qui ne chevauche pas ces angles
          tabAngles.push([
            codageAngle(
              E,
              CRot,
              G,
              2.25,
              '',
              this.sup3 ? 'black' : 'red',
              2,
              1,
              this.sup3 ? 'black' : 'red',
            ),
            codageAngle(
              BRot,
              DRot,
              G,
              1.75,
              '',
              this.sup3 ? 'black' : bleuMathalea,
              2,
              1,
              this.sup3 ? 'black' : bleuMathalea,
            ),
            codageAngle(
              DRot,
              CRot,
              90,
              1,
              '',
              vertMathalea,
              2,
              1,
              vertMathalea,
            ),
          ])
          tabAngles.push([
            codageAngle(
              E,
              CRot,
              DRot,
              2.25,
              '',
              this.sup3 ? 'black' : 'red',
              2,
              1,
              this.sup3 ? 'black' : 'red',
            ),
            codageAngle(
              BRot,
              DRot,
              H,
              1.75,
              '',
              this.sup3 ? 'black' : bleuMathalea,
              2,
              1,
              this.sup3 ? 'black' : bleuMathalea,
            ),
            codageAngle(G, CRot, 90, 1, '', vertMathalea, 2, 1, vertMathalea),
          ])
          tabAngles.push([
            codageAngle(
              ARot,
              CRot,
              DRot,
              2.25,
              '',
              this.sup3 ? 'black' : 'red',
              2,
              1,
              this.sup3 ? 'black' : 'red',
            ),
            codageAngle(
              F,
              DRot,
              H,
              1.75,
              '',
              this.sup3 ? 'black' : bleuMathalea,
              2,
              1,
              this.sup3 ? 'black' : bleuMathalea,
            ),
            codageAngle(G, CRot, 90, 1, '', vertMathalea, 2, 1, vertMathalea),
          ])
          tabAngles.push([
            codageAngle(
              ARot,
              CRot,
              G,
              2.25,
              '',
              this.sup3 ? 'black' : 'red',
              2,
              1,
              this.sup3 ? 'black' : 'red',
            ),
            codageAngle(
              F,
              DRot,
              G,
              1.75,
              '',
              this.sup3 ? 'black' : bleuMathalea,
              2,
              1,
              this.sup3 ? 'black' : bleuMathalea,
            ),
            codageAngle(
              DRot,
              CRot,
              90,
              1,
              '',
              vertMathalea,
              2,
              1,
              vertMathalea,
            ),
          ])
          texteSousFigure = this.sup3
            ? "Qu'est-ce qui caractérise les angles qui ne sont pas des angles droits ? "
            : "Qu'est-ce qui caractérise les angles bleu et rouge ? "
          break
        case 1:
          // Angles alternes-internes
          texteCorr = `Ce sont des angles ${texteEnCouleurEtGras('alternes-internes')}.`
          // tabAngles contient deux angles alternes-internes puis un angle droit qui ne chevauche pas ces angles
          tabAngles.push([
            codageAngle(
              ARot,
              CRot,
              DRot,
              2.25,
              '',
              this.sup3 ? 'black' : 'red',
              2,
              1,
              this.sup3 ? 'black' : 'red',
            ),
            codageAngle(
              BRot,
              DRot,
              G,
              1.75,
              '',
              this.sup3 ? 'black' : bleuMathalea,
              2,
              1,
              this.sup3 ? 'black' : bleuMathalea,
            ),
            codageAngle(G, CRot, 90, 1, '', vertMathalea, 2, 1, vertMathalea),
          ])
          tabAngles.push([
            codageAngle(
              E,
              CRot,
              DRot,
              2.25,
              '',
              this.sup3 ? 'black' : 'red',
              2,
              1,
              this.sup3 ? 'black' : 'red',
            ),
            codageAngle(
              CRot,
              DRot,
              F,
              1.75,
              '',
              this.sup3 ? 'black' : bleuMathalea,
              2,
              1,
              this.sup3 ? 'black' : bleuMathalea,
            ),
            codageAngle(G, CRot, 90, 1, '', vertMathalea, 2, 1, vertMathalea),
          ])
          texteSousFigure = this.sup3
            ? "Qu'est-ce qui caractérise les angles qui ne sont pas des angles droits ? "
            : "Qu'est-ce qui caractérise les angles bleu et rouge ? "
          break
        case 2:
          // Angles supplémentaires
          texteCorr = `Ce sont des angles ${texteEnCouleurEtGras('supplémentaires')} car la somme de leurs mesures est égale à $180^\\circ$ (angle plat).`
          // tabAngles contient deux angles supplémentaires puis un angle droit qui ne chevauche pas ces angles
          tabAngles.push([
            codageAngle(
              G,
              DRot,
              BRot,
              2.25,
              '',
              this.sup3 ? 'black' : 'red',
              2,
              1,
              this.sup3 ? 'black' : 'red',
            ),
            codageAngle(
              F,
              DRot,
              G,
              1.75,
              '',
              this.sup3 ? 'black' : bleuMathalea,
              2,
              1,
              this.sup3 ? 'black' : bleuMathalea,
            ),
            codageAngle(
              DRot,
              CRot,
              90,
              1,
              '',
              vertMathalea,
              2,
              1,
              vertMathalea,
            ),
          ])
          tabAngles.push([
            codageAngle(
              F,
              DRot,
              H,
              2.25,
              '',
              this.sup3 ? 'black' : 'red',
              2,
              1,
              this.sup3 ? 'black' : 'red',
            ),
            codageAngle(
              F,
              DRot,
              G,
              1.75,
              '',
              this.sup3 ? 'black' : bleuMathalea,
              2,
              1,
              this.sup3 ? 'black' : bleuMathalea,
            ),
            codageAngle(
              DRot,
              CRot,
              90,
              1,
              '',
              vertMathalea,
              2,
              1,
              vertMathalea,
            ),
          ])
          tabAngles.push([
            codageAngle(
              ARot,
              CRot,
              G,
              2.25,
              '',
              this.sup3 ? 'black' : 'red',
              2,
              1,
              this.sup3 ? 'black' : 'red',
            ),
            codageAngle(
              ARot,
              CRot,
              DRot,
              1.75,
              '',
              this.sup3 ? 'black' : bleuMathalea,
              2,
              1,
              this.sup3 ? 'black' : bleuMathalea,
            ),
            //  codageAngle(DRot, CRot, 90, 1, '', vertMathalea, 2, 1, vertMathalea)
            codageAngle(
              DRot,
              CRot,
              -90,
              1,
              '',
              vertMathalea,
              2,
              1,
              vertMathalea,
            ),
          ])
          tabAngles.push([
            codageAngle(
              ARot,
              CRot,
              G,
              2.25,
              '',
              this.sup3 ? 'black' : 'red',
              2,
              1,
              this.sup3 ? 'black' : 'red',
            ),
            codageAngle(
              E,
              CRot,
              G,
              1.75,
              '',
              this.sup3 ? 'black' : bleuMathalea,
              2,
              1,
              this.sup3 ? 'black' : bleuMathalea,
            ),
            codageAngle(
              DRot,
              CRot,
              90,
              1,
              '',
              vertMathalea,
              2,
              1,
              vertMathalea,
            ),
          ])
          texteSousFigure = this.sup3
            ? "Qu'est-ce qui caractérise les angles adjacents qui ne sont pas des angles droits ? "
            : "Qu'est-ce qui caractérise les angles adjacents bleu et rouge ? "
          break
        case 3:
          // Angles opposés par le sommet
          texteCorr = `Ce sont des angles ${texteEnCouleurEtGras('opposés')} par le sommet.`
          // tabAngles contient deux angles opposés par le sommet puis un angle droit qui ne chevauche pas ces angles
          if (Math.abs(angleOriente(G, CRot, ARot)) < 90) {
            tabAngles.push([
              codageAngle(
                G,
                CRot,
                ARot,
                2.25,
                '',
                this.sup3 ? 'black' : 'red',
                2,
                1,
                this.sup3 ? 'black' : 'red',
              ),
              codageAngle(
                E,
                CRot,
                H,
                1.75,
                '',
                this.sup3 ? 'black' : bleuMathalea,
                2,
                1,
                this.sup3 ? 'black' : bleuMathalea,
              ),
              codageAngle(
                DRot,
                CRot,
                90,
                1,
                '',
                vertMathalea,
                2,
                1,
                vertMathalea,
              ),
            ])
          }
          tabAngles.push([
            codageAngle(
              F,
              DRot,
              G,
              2.25,
              '',
              this.sup3 ? 'black' : 'red',
              2,
              1,
              this.sup3 ? 'black' : 'red',
            ),
            codageAngle(
              BRot,
              DRot,
              H,
              1.75,
              '',
              this.sup3 ? 'black' : bleuMathalea,
              2,
              1,
              this.sup3 ? 'black' : bleuMathalea,
            ),
            codageAngle(
              DRot,
              CRot,
              90,
              1,
              '',
              vertMathalea,
              2,
              1,
              vertMathalea,
            ),
          ])
          tabAngles.push([
            codageAngle(
              F,
              DRot,
              H,
              2.25,
              '',
              this.sup3 ? 'black' : 'red',
              2,
              1,
              this.sup3 ? 'black' : 'red',
            ), // OK
            codageAngle(
              BRot,
              DRot,
              G,
              1.75,
              '',
              this.sup3 ? 'black' : bleuMathalea,
              2,
              1,
              this.sup3 ? 'black' : bleuMathalea,
            ),
            codageAngle(
              DRot,
              CRot,
              90,
              1,
              '',
              vertMathalea,
              2,
              1,
              vertMathalea,
            ),
          ])
          texteSousFigure = this.sup3
            ? "Qu'est-ce qui caractérise les angles qui ne sont pas des angles droits ? "
            : "Qu'est-ce qui caractérise les angles bleu et rouge ? "
          break
        case 4:
          // Angles complémentaires
          texteCorr = `Ce sont des angles ${texteEnCouleurEtGras('complémentaires')} car la somme de leurs mesures est égale à $90^\\circ$ (angle droit).`
          // tabAngles contient deux angles complémentaires puis un angle droit qui chevauche ou pas ces angles selon si c'est un distracteur ou pas
          if (
            arrondi(
              Math.abs(angleOriente(IRot, CRot, ARot)) +
                Math.abs(angleOriente(G, CRot, ARot)),
              0,
            ) === 90
          ) {
            tabAngles.push([
              codageAngle(
                IRot,
                CRot,
                ARot,
                3.25,
                '',
                this.sup3 ? 'black' : 'red',
                2,
                1,
                this.sup3 ? 'black' : 'red',
              ),
              codageAngle(
                G,
                CRot,
                ARot,
                2.75,
                '',
                this.sup3 ? 'black' : bleuMathalea,
                2,
                1,
                this.sup3 ? 'black' : bleuMathalea,
              ),
              codageAngle(G, CRot, 90, 1, '', vertMathalea, 2, 1, vertMathalea),
            ])
          } else if (
            arrondi(
              Math.abs(angleOriente(IRot, CRot, ARot)) +
                Math.abs(angleOriente(DRot, CRot, ARot)),
              0,
            ) === 90
          ) {
            tabAngles.push([
              codageAngle(
                DRot,
                CRot,
                ARot,
                3.25,
                '',
                this.sup3 ? 'black' : 'red',
                2,
                1,
                this.sup3 ? 'black' : 'red',
              ),
              codageAngle(
                IRot,
                CRot,
                ARot,
                2.75,
                '',
                this.sup3 ? 'black' : bleuMathalea,
                2,
                1,
                this.sup3 ? 'black' : bleuMathalea,
              ),
              codageAngle(
                DRot,
                CRot,
                -90,
                1,
                '',
                vertMathalea,
                2,
                1,
                vertMathalea,
              ),
            ])
          } else if (
            Math.abs(angleOriente(JRot, CRot, E)) <
            Math.abs(angleOriente(IRot, CRot, E))
          ) {
            // if (Math.abs(angleOriente(DRot, CRot, E)) < 90) {
            tabAngles.push([
              codageAngle(
                DRot,
                CRot,
                E,
                3,
                '',
                'black',
                2,
                1,
                this.sup3 ? 'white' : 'red',
              ),
              // codageAngle(IRot, CRot, E, 2.75, '', this.sup3 ? 'black' : bleuMathalea, 2, 1, this.sup3 ? 'black' : bleuMathalea),
              codageAngle(
                JRot,
                CRot,
                E,
                2.75,
                '',
                this.sup3 ? 'black' : bleuMathalea,
                2,
                1,
                this.sup3 ? 'black' : bleuMathalea,
              ),
              codageAngle(
                DRot,
                CRot,
                90,
                1,
                '',
                vertMathalea,
                2,
                1,
                vertMathalea,
              ),
            ])
          } else {
            tabAngles.push([
              codageAngle(
                DRot,
                CRot,
                E,
                3,
                '',
                'black',
                2,
                1,
                this.sup3 ? 'white' : 'red',
              ),
              // codageAngle(IRot, CRot, E, 2.75, '', this.sup3 ? 'black' : bleuMathalea, 2, 1, this.sup3 ? 'black' : bleuMathalea),
              codageAngle(
                IRot,
                CRot,
                E,
                2.75,
                '',
                this.sup3 ? 'black' : bleuMathalea,
                2,
                1,
                this.sup3 ? 'black' : bleuMathalea,
              ),
              codageAngle(G, CRot, 90, 1, '', vertMathalea, 2, 1, vertMathalea),
            ])
            // }
          }
          if (distracteur) {
            if (Math.abs(angleOriente(G, CRot, ARot)) > 90) {
              tabAngles.push([
                codageAngle(
                  IRot,
                  CRot,
                  ARot,
                  3.25,
                  '',
                  this.sup3 ? 'black' : 'red',
                  2,
                  1,
                  this.sup3 ? 'black' : 'red',
                ),
                codageAngle(
                  DRot,
                  CRot,
                  ARot,
                  2.75,
                  '',
                  this.sup3 ? 'black' : bleuMathalea,
                  2,
                  1,
                  this.sup3 ? 'black' : bleuMathalea,
                ),
                codageAngle(
                  DRot,
                  CRot,
                  -90,
                  1,
                  '',
                  vertMathalea,
                  2,
                  1,
                  vertMathalea,
                ),
              ])
            } else if (Math.abs(angleOriente(JRot, CRot, E)) > 90) {
              tabAngles.push([
                codageAngle(
                  IRot,
                  CRot,
                  E,
                  3.25,
                  '',
                  this.sup3 ? 'black' : 'red',
                  2,
                  1,
                  this.sup3 ? 'black' : 'red',
                ),
                codageAngle(
                  DRot,
                  CRot,
                  E,
                  2.75,
                  '',
                  this.sup3 ? 'black' : bleuMathalea,
                  2,
                  1,
                  this.sup3 ? 'black' : bleuMathalea,
                ),
                codageAngle(
                  DRot,
                  CRot,
                  90,
                  1,
                  '',
                  vertMathalea,
                  2,
                  1,
                  vertMathalea,
                ),
              ])
            } else if (Math.abs(angleOriente(IRot, CRot, E)) > 90) {
              tabAngles.push([
                codageAngle(
                  JRot,
                  CRot,
                  E,
                  3.25,
                  '',
                  this.sup3 ? 'black' : 'red',
                  2,
                  1,
                  this.sup3 ? 'black' : 'red',
                ),
                codageAngle(
                  DRot,
                  CRot,
                  E,
                  2.75,
                  '',
                  this.sup3 ? 'black' : bleuMathalea,
                  2,
                  1,
                  this.sup3 ? 'black' : bleuMathalea,
                ),
                codageAngle(
                  DRot,
                  CRot,
                  90,
                  1,
                  '',
                  vertMathalea,
                  2,
                  1,
                  vertMathalea,
                ),
              ])
            }
          }
          texteSousFigure = this.sup3
            ? "Qu'est-ce qui caractérise les angles adjacents qui ne sont pas des angles droits ? "
            : "Qu'est-ce qui caractérise les angles adjacents bleu et rouge ? "
          break
        case 5:
          // Côté de l'angle
          texteCorr = `C'est un ${texteEnCouleurEtGras('côté')} de l'angle, une demi-droite.`
          // tabAngles contient un angle et un de ses côtés puis un angle droit qui ne chevauche pas l'angle
          tabAngles.push([
            codageAngle(
              BRot,
              DRot,
              G,
              1.75,
              '',
              this.sup3 ? 'black' : bleuMathalea,
              2,
              1,
              this.sup3 ? 'black' : bleuMathalea,
            ),
            demiDroite(DRot, BRot, this.sup3 ? 'black' : 'red'),
            codageAngle(
              DRot,
              CRot,
              90,
              1,
              '',
              vertMathalea,
              2,
              1,
              vertMathalea,
            ),
          ])
          tabAngles.push([
            codageAngle(
              BRot,
              DRot,
              G,
              1.75,
              '',
              this.sup3 ? 'black' : bleuMathalea,
              2,
              1,
              this.sup3 ? 'black' : bleuMathalea,
            ),
            demiDroite(DRot, G, this.sup3 ? 'black' : 'red'),
            codageAngle(
              DRot,
              CRot,
              90,
              1,
              '',
              vertMathalea,
              2,
              1,
              vertMathalea,
            ),
          ])
          tabAngles.push([
            codageAngle(
              E,
              CRot,
              G,
              1.75,
              '',
              this.sup3 ? 'black' : bleuMathalea,
              2,
              1,
              this.sup3 ? 'black' : bleuMathalea,
            ),
            demiDroite(CRot, G, this.sup3 ? 'black' : 'red'),
            codageAngle(
              DRot,
              CRot,
              90,
              1,
              '',
              vertMathalea,
              2,
              1,
              vertMathalea,
            ),
          ])
          tabAngles.push([
            codageAngle(
              E,
              CRot,
              G,
              1.75,
              '',
              this.sup3 ? 'black' : bleuMathalea,
              2,
              1,
              this.sup3 ? 'black' : bleuMathalea,
            ),
            demiDroite(CRot, E, this.sup3 ? 'black' : 'red'),
            codageAngle(
              DRot,
              CRot,
              90,
              1,
              '',
              vertMathalea,
              2,
              1,
              vertMathalea,
            ),
          ])
          texteSousFigure = this.sup3
            ? "Que caractérise la demi-droite (plus épaisse que les autres) pour l'angle ? "
            : "Que caractérise la demi-droite en couleur pour l'angle ? "
          break
        case 6:
          // Sommet de  l'angle
          texteCorr = `C'est le ${texteEnCouleurEtGras('sommet')} de l'angle, un point.`
          // tabAngles contient un angle et le sommet de l'angle puis un angle droit qui ne chevauche pas l'angle
          tabAngles.push([
            codageAngle(
              BRot,
              DRot,
              G,
              1.75,
              '',
              this.sup3 ? 'black' : bleuMathalea,
              2,
              1,
              this.sup3 ? 'black' : bleuMathalea,
            ),
            pointAbstrait(DRot.x, DRot.y),
            codageAngle(
              DRot,
              CRot,
              90,
              1,
              '',
              vertMathalea,
              2,
              1,
              vertMathalea,
            ),
          ])
          tabAngles.push([
            codageAngle(
              E,
              CRot,
              G,
              1.75,
              '',
              this.sup3 ? 'black' : bleuMathalea,
              2,
              1,
              this.sup3 ? 'black' : bleuMathalea,
            ),
            pointAbstrait(CRot.x, CRot.y),
            codageAngle(
              DRot,
              CRot,
              90,
              1,
              '',
              vertMathalea,
              2,
              1,
              vertMathalea,
            ),
          ])
          texteSousFigure = this.sup3
            ? "Que caractérise le point pour l'angle ? "
            : "Que caractérise le point en couleur pour l'angle ? "
          break
        case 7:
          // Angles adjacents (non complémentaires)
          texteCorr = `Ce sont des angles ${texteEnCouleurEtGras('adjacents')} car ils ont un sommet commun, ils ont un côté en commun et sont de part et d'autre de ce sommet.`
          // tabAngles contient deux angles adjacents (non complémentaires) puis un angle droit qui ne chevauche pas ces angles
          if (Math.abs(angleOriente(G, CRot, ARot)) > 90) {
            tabAngles.push([
              codageAngle(
                G,
                CRot,
                E,
                3.25,
                '',
                this.sup3 ? 'black' : 'red',
                2,
                1,
                this.sup3 ? 'black' : 'red',
              ),
              codageAngle(
                JRot,
                CRot,
                E,
                2.75,
                '',
                this.sup3 ? 'black' : bleuMathalea,
                2,
                1,
                this.sup3 ? 'black' : bleuMathalea,
                undefined,
                undefined,
                true,
              ),
              codageAngle(
                DRot,
                CRot,
                90,
                1,
                '',
                vertMathalea,
                2,
                1,
                vertMathalea,
              ),
            ])
            tabAngles.push([
              codageAngle(
                G,
                CRot,
                E,
                3.25,
                '',
                this.sup3 ? 'black' : 'red',
                2,
                1,
                this.sup3 ? 'black' : 'red',
              ),
              codageAngle(
                IRot,
                CRot,
                G,
                2.75,
                '',
                this.sup3 ? 'black' : bleuMathalea,
                2,
                1,
                this.sup3 ? 'black' : bleuMathalea,
                undefined,
                undefined,
                true,
              ),
              codageAngle(
                DRot,
                CRot,
                90,
                1,
                '',
                vertMathalea,
                2,
                1,
                vertMathalea,
              ),
            ])
            tabAngles.push([
              codageAngle(
                IRot,
                CRot,
                ARot,
                3.25,
                '',
                this.sup3 ? 'black' : 'red',
                2,
                1,
                this.sup3 ? 'black' : 'red',
              ),
              codageAngle(
                IRot,
                CRot,
                G,
                2.75,
                '',
                this.sup3 ? 'black' : bleuMathalea,
                2,
                1,
                this.sup3 ? 'black' : bleuMathalea,
                undefined,
                undefined,
                true,
              ),
              codageAngle(
                DRot,
                CRot,
                -90,
                1,
                '',
                vertMathalea,
                2,
                1,
                vertMathalea,
              ),
            ])
          } else {
            /*
              tabAngles.push([
              codageAngle(ARot, CRot, G, 3.25, '', this.sup3 ? 'black' : 'red', 2, 1, this.sup3 ? 'red' : 'red'),
              codageAngle(IRot, CRot, G, 2.75, '', this.sup3 ? 'black' : bleuMathalea, 2, 1, this.sup3 ? 'black' : bleuMathalea, undefined, undefined, true),
              // codageAngle(DRot, CRot, 90, 1, '', vertMathalea, 2, 1, vertMathalea)
              codageAngle(JRot, CRot, -90, 1, '', vertMathalea, 2, 1, vertMathalea)
            ]) */
            tabAngles.push([
              codageAngle(
                JRot,
                CRot,
                E,
                3.25,
                '',
                this.sup3 ? 'black' : 'red',
                2,
                1,
                this.sup3 ? 'black' : 'red',
              ),
              codageAngle(
                JRot,
                CRot,
                G,
                2.75,
                '',
                this.sup3 ? 'black' : bleuMathalea,
                2,
                1,
                this.sup3 ? 'black' : bleuMathalea,
                undefined,
                undefined,
                true,
              ),
              // codageAngle(DRot, CRot, 90, 1, '', vertMathalea, 2, 1, vertMathalea)
              // codageAngle(G, CRot, 90, 1, '', vertMathalea, 2, 1, vertMathalea)
              codageAngle(
                IRot,
                CRot,
                -90,
                1,
                '',
                vertMathalea,
                2,
                1,
                vertMathalea,
              ),
            ])
          }
          texteSousFigure = this.sup3
            ? "Qu'est-ce qui caractérise les angles qui ne sont pas des angles droits ? "
            : "Qu'est-ce qui caractérise les angles bleu et rouge ? "
          break
          break
      }
      const choixPossibilitesAngles = range(tabAngles.length - 1)
      const choixAngle = choice(choixPossibilitesAngles)
      const ang1 = tabAngles[choixAngle][0]
      let objet2 = tabAngles[choixAngle][1]
      if (
        choixQuestion === 5 &&
        !(objet2 instanceof PointAbstrait) &&
        !(objet2 instanceof CodageAngleDroit)
      )
        objet2.epaisseur = 3
      else if (choixQuestion === 6 && objet2 instanceof PointAbstrait) {
        objet2 = tracePoint(objet2, this.sup3 ? 'black' : 'red')
        objet2.epaisseur = 2
        objet2.taille = 5
      }
      const ang3 = tabAngles[choixAngle][2]

      /*
      // Ne pas effacer : utile pour le débuggage
      const labelA = latexParPoint('A', ARot, this.sup3 ? 'black' : 'red', 10, 12, '', 10)
      const labelB = latexParPoint('B', BRot, this.sup3 ? 'black' : 'red', 10, 12, '', 10)
      const labelC = latexParPoint('C', CRot, this.sup3 ? 'black' : 'red', 10, 12, '', 10)
      const labelD = latexParPoint('D', DRot, this.sup3 ? 'black' : 'red', 10, 12, '', 10)
      const labelE = latexParPoint('E', E, this.sup3 ? 'black' : 'red', 10, 12, '', 10)
      const labelF = latexParPoint('F', F, this.sup3 ? 'black' : 'red', 10, 12, '', 10)
      const labelG = latexParPoint('G', G, this.sup3 ? 'black' : 'red', 10, 12, '', 10)
      const labelH = latexParPoint('H', H, this.sup3 ? 'black' : 'red', 10, 12, '', 10)

      const labelI = latexParPoint('I', IRot, this.sup3 ? 'black' : 'red', 10, 12, '', 10)
      const labelJ = latexParPoint('J', JRot, this.sup3 ? 'black' : 'red', 10, 12, '', 10)
      objets.push(tracePts, labelA, labelB, labelC, labelD, labelE, labelF, labelG, labelH, labelI, labelJ)
      */

      switch (choixQuestion) {
        case 0:
        case 1:
          if (distracteur) {
            objets.push(ang3, d4Rot)
          }
          objets.push(d1Rot, d2Rot)
          break
        case 2:
          if (choixAngle < 2) objets.push(d2Rot)
          else objets.push(d1Rot)
          if (distracteur) {
            objets.push(ang3, d1Rot, d2Rot, d4Rot)
          }
          break
        case 3:
          if (distracteur) {
            objets.push(ang3, d1Rot, d2Rot, d4Rot)
          }
          if (choixAngle === 0 && tabAngles.length === 3) objets.push(d1Rot)
          else objets.push(d2Rot)
          break
        case 4:
          if (distracteur) {
            objets.push(d2Rot)
          }
          objets.push(ang3, d1Rot, d4Rot)
          break
        case 5:
          if (choixAngle < 2) objets.push(d2Rot)
          else objets.push(d1Rot)
          if (distracteur) {
            objets.push(ang3, d4Rot, d1Rot, d2Rot)
          }
          break
        case 6:
          if (choixAngle < 1) objets.push(d2Rot)
          else objets.push(d1Rot)
          if (distracteur) {
            objets.push(ang3, d4Rot)
          }
          break
        case 7:
          if (distracteur) {
            objets.push(ang3, d2Rot)
          }
          objets.push(d1Rot, d4Rot)
          break
      }
      objets.push(ang1, objet2, d3Rot)

      const choixTypeAngles = [
        { label: "Choisir le type d'angles", value: '' },
        { label: 'correspondants', value: 'correspondants' },
        { label: 'alternes-internes', value: 'alternes-internes' },
        { label: 'supplémentaires', value: 'supplémentaires' },
        { label: 'opposés par le sommet', value: 'opposés par le sommet' },
        { label: 'complémentaires', value: 'complémentaires' },
        { label: 'côté', value: 'côté' },
        { label: 'sommet', value: 'sommet' },
      ]
      if (choixQuestion !== 2 && choixQuestion !== 4)
        choixTypeAngles.push({ label: 'adjacents', value: 'adjacents' })
      if (this.interactif) {
        texteSousFigure += choixDeroulant(this, i, { choices: choixTypeAngles })
        handleAnswers(
          this,
          i,
          {
            bareme: (listePoints: number[]) => [
              Math.min(listePoints[0], listePoints[1]),
              1,
            ],
            reponse: {
              value: choixTypeAngles[choixQuestion + 1].value,
              options: { texteSansCasse: true },
            },
          },
          { formatInteractif: 'liste-deroulante' },
        )
      }

      // On impose xmin et le reste pour avoir toujours la même taille de fenêtre.
      let texte = context.isHtml ? '<br>' : ''
      texte += mathalea2d(
        {
          zoom: 1,
          scale: 0.25,
          xmin: -8,
          xmax: 8,
          ymin: -8,
          ymax: 8,
          optionsTikz: ['baseline=(current bounding box.north)'],
        },
        objets,
      ) // On trace le graphique
      texte += texteSousFigure
      if (
        this.questionJamaisPosee(
          i,
          ARot.x,
          ARot.y,
          BRot.x,
          BRot.y,
          CRot.x,
          CRot.y,
          choixQuestion,
        )
      ) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
