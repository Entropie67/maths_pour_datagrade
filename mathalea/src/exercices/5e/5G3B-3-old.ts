// Copie figée : dépendance d'un exercice archivé, gelée pour que ses
// tirages ne bougent plus. Ne plus la modifier : toute correction va
// dans la version courante du fichier d'origine.
// Gelée avant le déplacement des mesures du 10/10/2026 pour 6G7B-9.ts.
import { distancePointDroite, droite } from '../../lib/2d/droites'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait, PointAbstrait } from '../../lib/2d/PointAbstrait'
import { barycentre, nommePolygone, polygone } from '../../lib/2d/polygones'
import { segmentAvecExtremites } from '../../lib/2d/segmentsVecteurs'
import { labelPoint, latexParPoint } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import {
  homothetie,
  projectionOrtho,
  rotation,
  symetrieAxiale,
} from '../../lib/2d/transformations'
import {
  angle,
  angleOriente,
  longueur,
} from '../../lib/2d/utilitairesGeometriques'
import {
  milieu,
  pointAdistance,
  pointIntersectionCC,
} from '../../lib/2d/utilitairesPoint'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choisitLettresDifferentes } from '../../lib/outils/aleatoires'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

import { arc } from '../../lib/2d/Arc'
import { cercle } from '../../lib/2d/cercle'
import type { IDroite, IPolygone } from '../../lib/2d/Interfaces'
import { placeLatexSurSegment } from '../../lib/2d/placeLatexSurSegment'
import { aireTriangle } from '../../lib/2d/utilitairesTriangle'
import { vertMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { arrondi } from '../../lib/outils/nombres'
import Grandeur from '../../modules/Grandeur'
export const titre = 'Utiliser les propriétés de conservation de la symétrie'

// Gestion de la date de publication initiale
export const dateDePublication = '25/01/2023'
export const dateDeModifImportante = '13/11/2025'

/**
 * Utiliser les propriétés de la symétrie pour répondre à des questions
 * @author Éric Elter
 * Ajout de la symétrie centrale par Guillaume Valmont le 13/11/2025
 */

export const uuid = '335a6'

export const refs = {
  'fr-fr': [],
  'fr-2016': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

const choisir3PointsAlignesOuPas = (
  d: IDroite,
  noms: string[],
  alignes: boolean,
) => {
  let A: PointAbstrait
  let B: PointAbstrait
  let C: PointAbstrait
  let AB: number
  let BC: number
  let AC: number
  let Adistance: number
  let Bdistance: number
  let Cdistance: number
  do {
    A = pointAbstrait(
      arrondi(randint(-80, 80, 0) / 10),
      arrondi(randint(-80, 80, 0) / 10),
      noms[0],
    )
    B = pointAdistance(A, randint(30, 40) / 10, randint(0, 360), noms[1])
    AB = longueur(A, B)

    C = homothetie(B, A, randint(18, 25) / 10, noms[2])
    if (!alignes) {
      C = rotation(C, A, randint(3, 6), noms[2])
    }
    BC = longueur(B, C)
    AC = longueur(A, C)
    Adistance = distancePointDroite(A, d)
    Bdistance = distancePointDroite(B, d)
    Cdistance = distancePointDroite(C, d)
  } while (
    AB > 5 ||
    BC > 5 ||
    AC > 7 ||
    Adistance < 0.5 ||
    Bdistance < 0.5 ||
    Cdistance < 0.5
  )
  return [A, B, C] as [PointAbstrait, PointAbstrait, PointAbstrait]
}

const segmentPasCentreSurD = (d: IDroite, noms: string[]) => {
  let A: PointAbstrait
  let B: PointAbstrait
  let distanceM: number
  let Adistance: number
  let Bdistance: number
  let alpha: number
  do {
    A = pointAbstrait(
      arrondi(randint(-80, 80, 0) / 10),
      arrondi(randint(-80, 80, 0) / 10),
      noms[0],
    )
    B = pointAdistance(A, randint(40, 80) / 10, randint(0, 360), noms[1])
    const M = milieu(A, B)
    const H = projectionOrtho(M, d)
    alpha = Math.round(angle(A, M, H) / 2)
    distanceM = distancePointDroite(M, d)
    Adistance = distancePointDroite(A, d)
    Bdistance = distancePointDroite(B, d)
  } while (
    distanceM < 1.5 ||
    distanceM > 5 ||
    Adistance < 0.5 ||
    Bdistance < 0.5 ||
    alpha < 5 ||
    alpha > 85
  )
  return [A, B] as [PointAbstrait, PointAbstrait]
}

const triangleLoinDeD = (d: IDroite, noms: string[]) => {
  let pol: IPolygone
  let Ad: number
  let Bd: number
  let Cd: number
  let GH: number
  do {
    const A = pointAbstrait(
      arrondi(randint(20, 80, 0) / 10),
      arrondi(randint(20, 80, 0) / 10),
      noms[0],
    )
    const B = pointAdistance(A, randint(30, 80) / 10, randint(0, 360), noms[1])
    const AB = longueur(A, B)
    let r1: number
    let r2: number

    do {
      r1 =
        randint(Math.floor(AB * 0.7), Math.ceil(AB * 0.9)) + randint(1, 5) / 10
      r2 =
        randint(Math.floor(AB * 0.5), Math.ceil(AB * 0.9)) + randint(3, 9) / 10
    } while (r1 + r2 <= AB || Math.abs(r1 - r2) >= AB)
    const c1 = cercle(A, r1)
    const c2 = cercle(B, r2)
    const C = pointIntersectionCC(c1, c2, noms[2])
    const D = pointIntersectionCC(c1, c2, noms[2], 2)
    const orientation = (B.x - A.x) * (C.y - A.y) - (B.y - A.y) * (C.x - A.x)
    pol = polygone([A, B, orientation < 0 ? C : D])
    const Ha = projectionOrtho(A, d)
    const Hb = projectionOrtho(B, d)
    const Hc = projectionOrtho(orientation < 0 ? C : D, d)
    const G = barycentre(pol)
    const H = projectionOrtho(G, d)
    Ad = longueur(A, Ha)
    Bd = longueur(B, Hb)
    Cd = longueur(orientation < 0 ? C : D, Hc)
    GH = longueur(G, H)
  } while (
    Number(aireTriangle(pol)) < 10 ||
    Ad < 1 ||
    Bd < 1 ||
    Cd < 1 ||
    Ad > 5 ||
    Bd > 5 ||
    Cd > 5 ||
    GH < 2 ||
    GH > 5
  )
  return pol.listePoints as [PointAbstrait, PointAbstrait, PointAbstrait]
}

export default class SymetrieProprietesOld extends Exercice {
  constructor() {
    super()
    this.consigne = texteEnCouleurEtGras(
      'Dans cet exercice, les mesures sont à donner avec la bonne unité.',
      'black',
    )
    this.besoinFormulaireTexte = [
      'Type de questions',
      "Nombres séparés par des tirets :\n1 : Longueur d'un seul segment\n2 : Longueur d'un segment parmi d'autres\n3 : Alignement de points\n4 : Angle\n5 : Mélange",
    ]
    this.besoinFormulaire2CaseACocher = ['Justification demandée']
    this.besoinFormulaire3Numerique = [
      'Type de transformation',
      3,
      '1 : Mélange\n2 : Symétrie axiale\n3 : Symétrie centrale',
    ]

    this.spacing = 2
    this.nbQuestions = 3

    this.sup = '5'
    this.sup2 = true
    this.sup3 = 3
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      max: 4,
      defaut: 5,
      nbQuestions: this.nbQuestions,
      melange: 5,
      saisie: this.sup,
    }).map(Number)
    const typesDeTransformations = gestionnaireFormulaireTexte({
      min: 2,
      max: 3,
      defaut: 2,
      nbQuestions: this.nbQuestions,
      melange: 1,
      saisie: this.sup3,
    })
    let optionKeyboard: string = ''
    let objetReponse
    for (
      let i = 0,
        texte,
        texteCorr,
        objetsEnonce,
        a,
        b,
        d,
        A,
        B,
        C,
        D,
        E,
        F,
        Crot,
        Drot,
        Erot,
        Frot,
        ptRef1,
        ptRef2,
        Aarc,
        Barc,
        Carc,
        ALabel,
        BLabel,
        CLabel,
        nbpoints,
        noms,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      texte = ''
      texteCorr = ''
      objetsEnonce = []
      let reponse: string | string[] = ''
      a = randint(-10, 10)
      b = randint(-10, 10, a)
      d = droite(a, b, 0, '(d)')
      const O = pointAbstrait(0, 0, 'O')
      switch (typesDeQuestionsDisponibles[i]) {
        case 1: // Longueur d'un seul segment
          nbpoints = 4
          noms = choisitLettresDifferentes(nbpoints, 'QWXO', true)
          ;[A, B] = segmentPasCentreSurD(d, noms)
          C = symetrieAxiale(A, d, noms[2])
          D = symetrieAxiale(B, d, noms[3])
          Crot = rotation(A, O, 180, noms[2])
          Drot = rotation(B, O, 180, noms[3])
          texte += `Les segments $[${A.nom}${B.nom}]$ et $[${C.nom}${D.nom}]$ sont symétriques par rapport à $${typesDeTransformations[i] === 2 ? '(d)' : 'O'}$ et $${A.nom}${B.nom}=${texNombre(longueur(A, B, 1))}${sp()}\\text{cm}$ . Quelle est la longueur du segment $[${C.nom}${D.nom}]$ ?`
          texte += this.sup2 && !this.interactif ? ' Justifier.<br>' : '<br>'
          objetsEnonce.push(
            segmentAvecExtremites(A, B),
            nommePolygone(polygone([A, B]), A.nom + B.nom),
            placeLatexSurSegment(
              `${texNombre(longueur(A, B, 1))} \\text{cm}`,
              A,
              B,
              { letterSize: 'small' },
            ),
          )
          if (typesDeTransformations[i] === 2) {
            // Symétrie axiale
            objetsEnonce.push(
              d,
              segmentAvecExtremites(C, D),
              nommePolygone(polygone([C, D]), C.nom + D.nom),
            )
          } else if (typesDeTransformations[i] === 3) {
            // Symétrie centrale
            objetsEnonce.push(
              tracePoint(O),
              labelPoint(O),
              segmentAvecExtremites(Crot, Drot),
              nommePolygone(polygone([Crot, Drot]), Crot.nom + Drot.nom),
            )
          }
          texte +=
            '<br>' +
            mathalea2d(
              Object.assign({}, fixeBordures(objetsEnonce)),
              objetsEnonce,
            )
          texteCorr += `Les segments $[${A.nom}${B.nom}]$ et $[${C.nom}${D.nom}]$ sont symétriques par rapport à $${typesDeTransformations[i] === 2 ? '(d)' : 'O'}$.<br>`
          texteCorr +=
            "Or, le symétrique d'un segment est un segment de même longueur.<br>"
          texteCorr += `Donc les segments $[${A.nom}${B.nom}]$ et $[${C.nom}${D.nom}]$ ont la même longueur et $${miseEnEvidence(C.nom + D.nom + '=' + texNombre(longueur(A, B, 1)))}$${sp()}${texteEnCouleurEtGras('cm')}.<br>`
          reponse = new Grandeur(longueur(A, B, 1), 'cm').toString()
          optionKeyboard = KeyboardType.longueur ?? ''
          objetReponse = {
            reponse: {
              value: reponse,
              options: { unite: true, precisionUnite: 0.1 },
            },
          }
          break
        case 3: // Alignement de points
          {
            const aligne = randint(1, 100) < 90
            nbpoints = 6
            noms = choisitLettresDifferentes(nbpoints, 'QWX', true)
            ;[A, B, C] = choisir3PointsAlignesOuPas(d, noms, aligne)

            D = symetrieAxiale(A, d, noms[3])
            E = symetrieAxiale(B, d, noms[4])
            F = symetrieAxiale(C, d, noms[5])
            Drot = rotation(A, O, 180, noms[3])
            Erot = rotation(B, O, 180, noms[4])
            Frot = rotation(C, O, 180, noms[5])
            texte += `Les points $${D.nom}$, $${E.nom}$ et $${F.nom}$ sont les symétriques respectifs de $${A.nom}$, $${B.nom}$ et $${C.nom}$ par rapport à $${typesDeTransformations[i] === 2 ? '(d)' : 'O'}$. Les points $${A.nom}$, $${B.nom}$ et $${C.nom}$ ${aligne ? 'sont' : 'ne sont pas'} alignés. Les points $${D.nom}$, $${E.nom}$ et $${F.nom}$ le sont-ils ?`
            texte += this.sup2 && !this.interactif ? ' Justifier.<br>' : '<br>'
            objetsEnonce.push(tracePoint(A, B, C), labelPoint(A, B, C))
            if (typesDeTransformations[i] === 2) {
              // Symétrie axiale
              objetsEnonce.push(d, tracePoint(D, E, F), labelPoint(D, E, F))
            } else if (typesDeTransformations[i] === 3) {
              // Symétrie centrale
              objetsEnonce.push(
                tracePoint(O),
                labelPoint(O),
                tracePoint(Drot, Erot, Frot),
                labelPoint(Drot, Erot, Frot),
              )
            }
            texte +=
              '<br>' +
              mathalea2d(
                Object.assign({}, fixeBordures(objetsEnonce)),
                objetsEnonce,
              )
            texteCorr += `Les points $${D.nom}$, $${E.nom}$ et $${F.nom}$ sont les symétriques respectifs de $${A.nom}$, $${B.nom}$ et $${C.nom}$ par rapport à $${typesDeTransformations[i] === 2 ? '(d)' : 'O'}$ et sont ${aligne ? 'alignés' : 'non alignés'}.<br>`
            texteCorr += "Or, la symétrie axiale conserve l'alignement.<br>"
            texteCorr += `Donc les points $${miseEnEvidence(D.nom)}$${texteEnCouleurEtGras(', ')}$${miseEnEvidence(E.nom)}$${texteEnCouleurEtGras(' et ')}$${miseEnEvidence(F.nom)}$ ${texteEnCouleurEtGras(` sont ${aligne ? 'alignés' : 'non alignés'}`)} également.<br>`
            reponse = ['oui', 'V', 'O']
            optionKeyboard = KeyboardType.vFON ?? ''
            objetReponse = {
              reponse: { value: reponse, options: { texteSansCasse: true } },
            }
          }
          break
        case 2: // Longueur d'un segment parmi d'autres
          nbpoints = 6
          noms = choisitLettresDifferentes(nbpoints, 'QWX', true)
          ;[A, B, C] = triangleLoinDeD(d, noms)

          D = symetrieAxiale(A, d, noms[3])
          E = symetrieAxiale(B, d, noms[4])
          F = symetrieAxiale(C, d, noms[5])
          Drot = rotation(A, O, 180, noms[3])
          Erot = rotation(B, O, 180, noms[4])
          Frot = rotation(C, O, 180, noms[5])
          texte += `Les points $${D.nom}$, $${E.nom}$ et $${F.nom}$ sont les symétriques respectifs de $${A.nom}$, $${B.nom}$ et $${C.nom}$ par rapport à $${typesDeTransformations[i] === 2 ? '(d)' : 'O'}$. Quelle est la longueur du segment $[${D.nom}${E.nom}]$ ?`
          texte += this.sup2 && !this.interactif ? ' Justifier.<br>' : '<br>'
          objetsEnonce.push(
            polygone([A, B, C], 'green'),
            nommePolygone(polygone([A, B, C]), A.nom + B.nom + C.nom),
            placeLatexSurSegment(
              `${texNombre(longueur(A, B), 1)}\\text{ cm}`,
              A,
              B,
              { letterSize: 'small', color: vertMathalea },
            ),
            placeLatexSurSegment(
              `${texNombre(longueur(C, A), 1)}\\text{ cm}`,
              C,
              A,
              { letterSize: 'small', color: vertMathalea },
            ),
            placeLatexSurSegment(
              `${texNombre(longueur(B, C), 1)}\\text{ cm}`,
              B,
              C,
              { letterSize: 'small', color: vertMathalea },
            ),
          )
          if (typesDeTransformations[i] === 2) {
            // Symétrie axiale
            objetsEnonce.push(
              d,
              polygone([D, E, F], 'brown'),
              nommePolygone(polygone([D, E, F]), D.nom + E.nom + F.nom),
            )
          } else if (typesDeTransformations[i] === 3) {
            // Symétrie centrale
            objetsEnonce.push(
              tracePoint(O),
              labelPoint(O),
              polygone([Drot, Erot, Frot], 'brown'),
              nommePolygone(
                polygone([Drot, Erot, Frot]),
                Drot.nom + Erot.nom + Frot.nom,
              ),
            )
          }
          texte +=
            '<br>' +
            mathalea2d(
              Object.assign(
                {},
                fixeBordures(objetsEnonce, {
                  rxmin: -1,
                  rymin: -1,
                  rxmax: 1,
                  rymax: 1,
                }),
              ),
              objetsEnonce,
            )
          texteCorr += `Les segments $[${A.nom}${B.nom}]$ et $[${D.nom}${E.nom}]$ sont symétriques par rapport à $${typesDeTransformations[i] === 2 ? '(d)' : 'O'}$.<br>`
          texteCorr +=
            "Or, le symétrique d'un segment est un segment de même longueur.<br>"
          texteCorr += `Donc les segments $[${A.nom}${B.nom}]$ et $[${D.nom}${E.nom}]$ ont la même longueur et $${miseEnEvidence(D.nom + E.nom + '=' + texNombre(longueur(A, B, 1)))}$${sp()}${texteEnCouleurEtGras('cm')}.<br>`
          reponse = new Grandeur(longueur(A, B, 1), 'cm').toString()
          objetReponse = {
            reponse: {
              value: reponse,
              options: { unite: true, precisionUnite: 0.1 },
            },
          }
          optionKeyboard = KeyboardType.longueur ?? ''
          break
        case 4: // Angle
        default:
          nbpoints = 6
          noms = choisitLettresDifferentes(nbpoints, 'QWX', true)
          ;[A, B, C] = triangleLoinDeD(d, noms)
          D = symetrieAxiale(A, d, noms[3])
          E = symetrieAxiale(B, d, noms[4])
          F = symetrieAxiale(C, d, noms[5])
          Drot = rotation(A, O, 180, noms[3])
          Erot = rotation(B, O, 180, noms[4])
          Frot = rotation(C, O, 180, noms[5])
          texte += `Les points $${D.nom}$, $${E.nom}$ et $${F.nom}$ sont les symétriques respectifs de $${A.nom}$, $${B.nom}$ et $${C.nom}$ par rapport à $${typesDeTransformations[i] === 2 ? '(d)' : 'O'}$. Quelle est la mesure de l'angle $\\widehat{${D.nom}${F.nom}${E.nom}}$ ?`
          texte += this.sup2 && !this.interactif ? ' Justifier.<br>' : '<br>'
          objetsEnonce.push(
            polygone([A, B, C], 'green'),
            nommePolygone(polygone([A, B, C]), A.nom + B.nom + C.nom),
          )
          if (typesDeTransformations[i] === 2) {
            // Symétrie axiale
            objetsEnonce.push(
              d,
              polygone([D, E, F], 'brown'),
              nommePolygone(polygone([D, E, F]), D.nom + E.nom + F.nom),
            )
          } else if (typesDeTransformations[i] === 3) {
            // Symétrie centrale
            objetsEnonce.push(
              tracePoint(O),
              labelPoint(O),
              polygone([Drot, Erot, Frot], 'brown'),
              nommePolygone(
                polygone([Drot, Erot, Frot]),
                Drot.nom + Erot.nom + Frot.nom,
              ),
            )
          }
          ptRef1 = longueur(A, B) < longueur(C, B) ? A : C
          ptRef2 = longueur(A, B) < longueur(C, B) ? C : A
          Barc = homothetie(ptRef1, B, 2 / 10)
          BLabel = rotation(
            homothetie(ptRef1, B, 2 / 10 + 1 / longueur(ptRef1, B)),
            B,
            angleOriente(ptRef1, B, ptRef2) / 3,
          )
          BLabel.positionLabel = 'center'
          objetsEnonce.push(
            arc(
              Barc,
              B,
              angleOriente(ptRef1, B, ptRef2),
              false,
              'none',
              'green',
            ),
            latexParPoint(
              `${angle(ptRef1, B, ptRef2, 0)}^\\circ`,
              BLabel,
              'green',
              12,
              20,
              '',
            ),
          )
          ptRef1 = longueur(A, C) < longueur(C, B) ? A : B
          ptRef2 = longueur(A, C) < longueur(C, B) ? B : A
          Carc = homothetie(ptRef1, C, 2 / 10)
          CLabel = rotation(
            homothetie(ptRef1, C, 2 / 10 + 1 / longueur(ptRef1, C)),
            C,
            angleOriente(ptRef1, C, ptRef2) / 3,
          )
          CLabel.positionLabel = 'center'
          objetsEnonce.push(
            arc(
              Carc,
              C,
              angleOriente(ptRef1, C, ptRef2),
              false,
              'none',
              'green',
            ),
            latexParPoint(
              `${angle(ptRef1, C, ptRef2, 0)}^\\circ`,
              CLabel,
              'green',
              12,
              20,
              '',
            ),
          )
          ptRef1 = longueur(A, C) < longueur(A, B) ? C : B
          ptRef2 = longueur(A, C) < longueur(A, B) ? B : C
          Aarc = homothetie(ptRef1, A, 2 / 10)
          ALabel = rotation(
            homothetie(ptRef1, A, 2 / 10 + 1 / longueur(A, ptRef1)),
            A,
            angleOriente(ptRef1, A, ptRef2) / 3,
          )
          ALabel.positionLabel = 'center'
          objetsEnonce.push(
            arc(
              Aarc,
              A,
              angleOriente(ptRef1, A, ptRef2),
              false,
              'none',
              'green',
            ),
            latexParPoint(
              `${180 - angle(A, ptRef2, ptRef1, 0) - angle(A, ptRef1, ptRef2, 0)}^\\circ`,
              ALabel,
              'green',
              12,
              20,
              '',
            ),
          )
          texte +=
            '<br>' +
            mathalea2d(
              Object.assign(
                {},
                fixeBordures(objetsEnonce, {
                  rxmin: -1,
                  rymin: -1,
                  rxmax: 1,
                  rymax: 1,
                }),
              ),
              objetsEnonce,
            )
          texteCorr += `Les angles $\\widehat{${A.nom}${C.nom}${B.nom}}$ et $\\widehat{${D.nom}${F.nom}${E.nom}}$ sont symétriques par rapport à $${typesDeTransformations[i] === 2 ? '(d)' : 'O'}$.<br>`
          texteCorr +=
            "Or, le symétrique d'un angle est un angle de même mesure.<br>"
          texteCorr += `Donc les angles $\\widehat{${A.nom}${C.nom}${B.nom}}$ et $\\widehat{${D.nom}${F.nom}${E.nom}}$ ont la même mesure et $\\widehat{${D.nom}${F.nom}${E.nom}} = ${miseEnEvidence(angle(D, F, E, 0))}^\\circ$.<br>`
          reponse = new Grandeur(angle(D, F, E, 0), '°').toString()
          objetReponse = {
            reponse: {
              value: reponse,
              options: { unite: true, precisionUnite: 1 },
            },
          }
          optionKeyboard = `${String(KeyboardType.angles)} ${String(KeyboardType.clavierNumbers)}`
          break
      }
      if (this.questionJamaisPosee(i, a, b)) {
        // Si la question n'a jamais été posée, on en crée une autre
        if (this.interactif) {
          handleAnswers(this, i, objetReponse)
          texte += ajouteChampTexteMathLive(this, i, optionKeyboard, {
            texteApres: '<em class="ml-2">(Une unité est attendue.)</em>',
          })
        }
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }

    listeQuestionsToContenu(this)
  }
}
