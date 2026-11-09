import { afficheLongueurSegment } from '../../lib/2d/afficheLongueurSegment'
import { distancePointDroite, droite } from '../../lib/2d/droites'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { nommePolygone, polygone } from '../../lib/2d/polygones'
import { segmentAvecExtremites } from '../../lib/2d/segmentsVecteurs'
import { labelPoint, latexParPoint } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import {
  homothetie,
  rotation,
  symetrieAxiale,
} from '../../lib/2d/transformations'
import {
  angle,
  angleOriente,
  longueur,
} from '../../lib/2d/utilitairesGeometriques'
import { pointSurDroite } from '../../lib/2d/utilitairesPoint'
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
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { arrondi } from '../../lib/outils/nombres'
export const titre = 'Utiliser les propriétés de conservation de la symétrie'

// Gestion de la date de publication initiale
export const dateDePublication = '25/01/2023'
export const dateDeModifImportante = '13/11/2025'

/**
 * Utiliser les propriétés de la symétrie pour répondre à des questions
 * @author Éric Elter
 * Ajout de la symétrie centrale par Guillaume Valmont le 13/11/2025
 */

export const uuid = '65bd7'

export const refs = {
  'fr-fr': [],
  'fr-2016': [],
  'fr-ch': [],
}
export const interactifReady = true

export default class SymetrieAxialeProprietes extends Exercice {
  constructor() {
    super()
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
    this.sup3 = 2
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
        case 1:
          nbpoints = 4
          noms = choisitLettresDifferentes(nbpoints, 'QWXO', true)
          A = pointAbstrait(
            arrondi(randint(-80, 80, 0) / 10),
            arrondi(randint(-80, 80, 0) / 10),
            noms[0],
          )
          while (distancePointDroite(A, d) < 1)
            A = pointAbstrait(
              arrondi(randint(-80, 80, 0) / 10),
              arrondi(randint(-80, 80, 0) / 10),
              noms[0],
            )
          B = pointAbstrait(
            arrondi(randint(-80, 80, 0) / 10),
            arrondi(randint(-80, 80, 0) / 10),
            noms[1],
          )
          while (
            distancePointDroite(B, d) < 1 ||
            longueur(A, B) < 1 ||
            longueur(symetrieAxiale(A, d), B) < 1
          )
            B = pointAbstrait(
              arrondi(randint(-80, 80, 0) / 10),
              arrondi(randint(-80, 80, 0) / 10),
              noms[1],
            )
          C = symetrieAxiale(A, d, noms[2])
          D = symetrieAxiale(B, d, noms[3])
          Crot = rotation(A, O, 180, noms[2])
          Drot = rotation(B, O, 180, noms[3])
          texte += `Les segments $[${A.nom}${B.nom}]$ et $[${C.nom}${D.nom}]$ sont symétriques par rapport à $${typesDeTransformations[i] === 2 ? '(d)' : 'O'}$ et $${A.nom}${B.nom}=${texNombre(longueur(A, B, 1))}${sp()}\\text{cm}$ . Quelle est la longueur du segment $[${C.nom}${D.nom}]$ ?`
          texte += this.sup2 && !this.interactif ? ' Justifier.<br>' : '<br>'
          objetsEnonce.push(
            segmentAvecExtremites(A, B),
            nommePolygone(polygone([A, B]), A.nom + B.nom),
            afficheLongueurSegment(A, B),
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
          reponse = texNombre(longueur(A, B, 1), 1)
          break
        case 3:
          nbpoints = 6
          noms = choisitLettresDifferentes(nbpoints, 'QWX', true)
          A = pointAbstrait(
            arrondi(randint(-80, 80, 0) / 10),
            arrondi(randint(-80, 80, 0) / 10),
            noms[0],
          )
          while (distancePointDroite(A, d) < 1)
            A = pointAbstrait(
              arrondi(randint(-80, 80, 0) / 10),
              arrondi(randint(-80, 80, 0) / 10),
              noms[0],
            )
          B = pointAbstrait(
            arrondi(randint(-80, 80, 0) / 10),
            arrondi(randint(-80, 80, 0) / 10),
            noms[1],
          )
          while (
            distancePointDroite(B, d) < 1 ||
            longueur(A, B) < 1 ||
            longueur(symetrieAxiale(A, d), B) < 1
          )
            B = pointAbstrait(
              arrondi(randint(-80, 80, 0) / 10),
              arrondi(randint(-80, 80, 0) / 10),
              noms[1],
            )
          C = pointSurDroite(droite(A, B), B.x + 1, noms[2])
          D = symetrieAxiale(A, d, noms[3])
          E = symetrieAxiale(B, d, noms[4])
          F = symetrieAxiale(C, d, noms[5])
          Drot = rotation(A, O, 180, noms[3])
          Erot = rotation(B, O, 180, noms[4])
          Frot = rotation(C, O, 180, noms[5])
          texte += `Les points $${D.nom}$, $${E.nom}$ et $${F.nom}$ sont les symétriques respectifs de $${A.nom}$, $${B.nom}$ et $${C.nom}$ par rapport à $${typesDeTransformations[i] === 2 ? '(d)' : 'O'}$. Les points $${A.nom}$, $${B.nom}$ et $${C.nom}$ sont alignés. Les points $${D.nom}$, $${E.nom}$ et $${F.nom}$ le sont-ils ?`
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
          texteCorr += `Les points $${D.nom}$, $${E.nom}$ et $${F.nom}$ sont les symétriques respectifs de $${A.nom}$, $${B.nom}$ et $${C.nom}$ par rapport à $${typesDeTransformations[i] === 2 ? '(d)' : 'O'}$ et sont alignés.<br>`
          texteCorr += "Or, la symétrie axiale conserve l'alignement.<br>"
          texteCorr += `Donc les points $${miseEnEvidence(D.nom)}$${texteEnCouleurEtGras(', ')}$${miseEnEvidence(E.nom)}$${texteEnCouleurEtGras(' et ')}$${miseEnEvidence(F.nom)}$ ${texteEnCouleurEtGras(' sont alignés')} également.<br>`
          reponse = ['oui', 'V', 'O']
          break
        case 2:
          nbpoints = 6
          noms = choisitLettresDifferentes(nbpoints, 'QWX', true)
          A = pointAbstrait(
            arrondi(randint(-80, 80, 0) / 10),
            arrondi(randint(-80, 80, 0) / 10),
            noms[0],
          )
          while (distancePointDroite(A, d) < 1)
            A = pointAbstrait(
              arrondi(randint(-80, 80, 0) / 10),
              arrondi(randint(-80, 80, 0) / 10),
              noms[0],
            )
          B = pointAbstrait(
            arrondi(randint(-80, 80, 0) / 10),
            arrondi(randint(-80, 80, 0) / 10),
            noms[1],
          )
          while (
            distancePointDroite(B, d) < 1 ||
            longueur(A, B) < 1 ||
            longueur(symetrieAxiale(A, d), B) < 1
          )
            B = pointAbstrait(
              arrondi(randint(-80, 80, 0) / 10),
              arrondi(randint(-80, 80, 0) / 10),
              noms[1],
            )
          C = pointAbstrait(
            arrondi(randint(-80, 80, 0) / 10),
            arrondi(randint(-80, 80, 0) / 10),
            noms[2],
          )
          while (
            distancePointDroite(C, d) < 1 ||
            longueur(A, C) < 1 ||
            longueur(symetrieAxiale(A, d), C) < 1 ||
            longueur(C, B) < 1 ||
            longueur(symetrieAxiale(B, d), C) < 1 ||
            angle(A, B, C) < 30 ||
            angle(B, A, C) < 30 ||
            angle(A, C, B) < 30
          )
            C = pointAbstrait(
              arrondi(randint(-80, 80, 0) / 10),
              arrondi(randint(-80, 80, 0) / 10),
              noms[2],
            )
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
            afficheLongueurSegment(A, B),
            afficheLongueurSegment(A, C),
            afficheLongueurSegment(C, B),
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
          reponse = texNombre(longueur(A, B, 1), 1)
          break
        case 4:
          nbpoints = 6
          noms = choisitLettresDifferentes(nbpoints, 'QWX', true)
          A = pointAbstrait(
            arrondi(randint(-80, 80, 0) / 10),
            arrondi(randint(-80, 80, 0) / 10),
            noms[0],
          )
          while (distancePointDroite(A, d) < 1)
            A = pointAbstrait(
              arrondi(randint(-80, 80, 0) / 10),
              arrondi(randint(-80, 80, 0) / 10),
              noms[0],
            )
          B = pointAbstrait(
            arrondi(randint(-80, 80, 0) / 10),
            arrondi(randint(-80, 80, 0) / 10),
            noms[1],
          )
          while (
            distancePointDroite(B, d) < 1 ||
            longueur(A, B) < 6 ||
            longueur(symetrieAxiale(A, d), B) < 1
          )
            B = pointAbstrait(
              arrondi(randint(-80, 80, 0) / 10),
              arrondi(randint(-80, 80, 0) / 10),
              noms[1],
            )
          C = pointAbstrait(
            arrondi(randint(-80, 80, 0) / 10),
            arrondi(randint(-80, 80, 0) / 10),
            noms[2],
          )
          while (
            distancePointDroite(C, d) < 1 ||
            longueur(A, C) < 6 ||
            longueur(symetrieAxiale(A, d), C) < 1 ||
            longueur(C, B) < 6 ||
            longueur(symetrieAxiale(B, d), C) < 1 ||
            angle(A, B, C) < 30 ||
            angle(B, A, C) < 30 ||
            angle(A, C, B) < 30
          )
            C = pointAbstrait(
              arrondi(randint(-80, 80, 0) / 10),
              arrondi(randint(-80, 80, 0) / 10),
              noms[2],
            )
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
            arc(Barc, B, angleOriente(ptRef1, B, ptRef2)),
            latexParPoint(
              `${angle(ptRef1, B, ptRef2, 0)}^\\circ`,
              BLabel,
              'black',
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
            arc(Carc, C, angleOriente(ptRef1, C, ptRef2)),
            latexParPoint(
              `${angle(ptRef1, C, ptRef2, 0)}^\\circ`,
              CLabel,
              'black',
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
            arc(Aarc, A, angleOriente(ptRef1, A, ptRef2)),
            latexParPoint(
              `${180 - angle(A, ptRef2, ptRef1, 0) - angle(A, ptRef1, ptRef2, 0)}^\\circ`,
              ALabel,
              'black',
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
          texteCorr += `Donc les angles $\\widehat{${A.nom}${C.nom}${B.nom}}$ et $\\widehat{${D.nom}${F.nom}${E.nom}}$ ont la même mesure et $\\widehat{${D.nom}${F.nom}${E.nom}} = ${angle(D, F, E, 0)}^\\circ$.<br>`
          reponse = texNombre(angle(D, F, E, 0))
          break
      }
      if (this.questionJamaisPosee(i, a, b)) {
        // Si la question n'a jamais été posée, on en crée une autre
        if (this.interactif) {
          if (reponse.indexOf('cm') !== -1) {
            handleAnswers(this, i, {
              reponse: {
                value: reponse,
                options: { unite: true, precisionUnite: 0.1 },
              },
            })
            texte += ajouteChampTexteMathLive(this, i, KeyboardType.longueur, {
              texteApres: '$\\text{ cm}',
            })
          } else if (reponse.indexOf('°') !== -1) {
            handleAnswers(this, i, {
              reponse: {
                value: reponse,
                options: { unite: true, precisionUnite: 1 },
              },
            })
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
              {
                texteApres: '°',
              },
            )
          } else {
            handleAnswers(this, i, {
              reponse: { value: reponse, options: { texteSansCasse: true } },
            })
            texte += ajouteChampTexteMathLive(this, i, KeyboardType.vFON)
          }
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
