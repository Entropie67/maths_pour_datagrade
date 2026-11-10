import { codageAngle } from '../../lib/2d/angles'
import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { droite } from '../../lib/2d/droites'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { markTypeArray, MarqueAngle } from '../../lib/2d/MarkType'
import { placeLatexSurSegment } from '../../lib/2d/placeLatexSurSegment'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { NommePolygone, nommePolygone, Polygone } from '../../lib/2d/polygones'
import { segment, Segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint, Latex2d } from '../../lib/2d/textes'
import {
  homothetie,
  similitude,
  symetrieAxiale,
  translation,
} from '../../lib/2d/transformations'
import {
  triangle2points2angles,
  triangle2points2longueurs,
} from '../../lib/2d/triangles'
import { angleOriente, longueur } from '../../lib/2d/utilitairesGeometriques'
import { pointAdistance } from '../../lib/2d/utilitairesPoint'
import { vecteur } from '../../lib/2d/Vecteur'
import { vide2d } from '../../lib/2d/Vide2d'
import { bleuMathalea } from '../../lib/colors'
import {
  choixDeroulant,
  listeDeroulanteToQcm,
} from '../../lib/customElements/ListeDeroulanteElement'
import { deuxColonnesResp } from '../../lib/format/miseEnPage'
import { handleAnswers } from '../../lib/interactif/gestionInteractif' // fonction qui va préparer l'analyse de la saisie
import { choisitLettresDifferentes } from '../../lib/outils/aleatoires'
import {
  choice,
  combinaisonListes,
  shuffle,
  shuffleLettres,
} from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { creerNomDePolygone, sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'

export const interactifReady = true // pour définir qu'exercice peut s'afficher en mode interactif.
// 'mathLive'
export const amcReady = true // pour définir que l'exercice peut servir à AMC
export const amcType = 'qcmMono'

export const titre = 'Utiliser les propriétés des triangles semblables'
export const dateDePublication = '16/05/2024' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
export const dateDeModifImportante = '06/11/2025'

/**
 * Deux triangles semblables sont codés, il faut reconnaitre les côtés homologues
 * Mais aussi deux triangles sont ils semblables ? dans des cas variés : 2 angles donnés sur 3, 3 Longueurs données,
 * triangles rectangles imbriqués, triangles en configurations de thalès
 * @author Mickael Guironnet; Olivier Mimeau // passage TS ; corrections  ; interactivité

*/
export const uuid = 'f4b7e'

export const refs = {
  'fr-fr': ['3G24-1'],
  'fr-ch': ['1mG3-1', '11LCGM3A-1', '11LSGM3A-1', 'PRQES05A-2'],
}
export default class TrianglesSemblables extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    if (context.isHtml) this.spacing = 1.5
    this.sup = 1
    this.besoinFormulaireNumerique = [
      'Types de questions ',
      5,
      '1 : Trouver angles et côtés homologues\n2 : Démontrer semblables avec les angles\n3 : Démontrer semblables avec les longueurs\n4 : Démontrer semblables avec des triangles rectangles imbriqués\n5 : Démontrer semblables avec des configurations type Thalès',
    ]
  }

  nouvelleVersion() {
    const zoom = context.vue === 'diap' ? 0.5 : 1
    const typeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 5,
      defaut: 1,
      melange: 6,
      nbQuestions: this.nbQuestions,
    })
    let indiceChampReponse = 0 // Cet indice permet de gérer les numéros de champs interactifs car ces champs ne sont pas de nombre égal selon les listeTypeQuestions[i].
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const listeDeNomsDePolygonesDejaPris: string[] = []
      let nbDeChampsReponse = 0
      let texte = ''
      let texteCorr = ''
      const sontSemblables = randint(0, 2) > 0
      const repSemblables = sontSemblables ? 'oui' : 'non'
      const k = randint(8, 13, [10, 11, 9])
      let l1 = randint(6, 8)
      let l2 = randint(6, 9, l1)
      let l3 = randint(6, l1 + l2 - 1, [l1, l2])
      const angleA = randint(45, 80)
      const angleB = randint(45, 80, [90 - angleA])
      let coeff = k / 10
      l1 *= k / 10
      l2 *= k / 10
      l3 *= k / 10
      const sign = choice([-1, 1]) // pour cas 5 (triangles emboités)
      let A = pointAbstrait(0, 0)
      let B = pointAdistance(A, l1, randint(0, 360))
      let p1 =
        typeQuestionsDisponibles[i] === 2
          ? triangle2points2angles(A, B, angleA, angleB)
          : triangle2points2longueurs(A, B, l2, l3)
      const angle = randint(60, 300)
      let p2 = similitude(p1, A, angle, coeff)
      let objetsAAfficher1: (
        Polygone | MarqueAngle | NommePolygone | Latex2d
      )[] = []
      let objetsAAfficher2: (
        Polygone | MarqueAngle | NommePolygone | Latex2d
      )[] = []
      switch (
        typeQuestionsDisponibles[i] // Suivant le type de question, le contenu sera différent
      ) {
        // preparer les triangles à afficher
        case 1: {
          coeff = randint(8, 13, [10, 11, 9]) / 10
          p2 = similitude(p1, A, angle, coeff)
          break
        }
        case 2: {
          coeff = randint(8, 13, [10, 11, 9]) / 10
          p2 = similitude(p1, A, angle, coeff)
          break
        }
        case 3: {
          coeff =
            (k === 5
              ? choice([12, 14])
              : k === 6
                ? choice([10, 15])
                : k === 7
                  ? 10
                  : k === 8
                    ? choice([10, 15])
                    : k === 12
                      ? choice([5, 10])
                      : k === 13
                        ? 10
                        : k === 14
                          ? choice([10, 5])
                          : k === 15
                            ? choice([10, 5])
                            : 10) / 10
          coeff = (10 * coeff) / k
          p2 = similitude(p1, A, angle, coeff)
          break
        }
        case 4: {
          const tripletsPythagoriciens = [
            [3, 4, 5],
            [6, 8, 10],
            [8, 15, 17],
            [10, 24, 26],
            [5, 12, 13],
            [12, 16, 20],
            [20, 21, 29],
            [48, 55, 73],
            [28, 45, 53],
            [36, 77, 85],
            [39, 80, 89],
          ]
          const pindex = randint(1, 9)
          B = pointAdistance(
            A,
            tripletsPythagoriciens[pindex][1],
            randint(-60, 60),
          )
          p1 = triangle2points2longueurs(
            A,
            B,
            tripletsPythagoriciens[pindex][0],
            tripletsPythagoriciens[pindex][2],
          )
          coeff =
            tripletsPythagoriciens[pindex][1] /
            tripletsPythagoriciens[pindex][2]
          p2 = triangle2points2longueurs(
            A,
            B,
            tripletsPythagoriciens[pindex][0] * coeff,
            tripletsPythagoriciens[pindex][1] * coeff,
          )

          break
        }
        case 5: {
          coeff =
            (k === 5
              ? choice([12, 14])
              : k === 6
                ? choice([10, 15])
                : k === 7
                  ? 10
                  : k === 8
                    ? choice([10, 15])
                    : k === 12
                      ? choice([5, 10])
                      : k === 13
                        ? 10
                        : k === 14
                          ? choice([10, 5])
                          : k === 15
                            ? choice([10, 5])
                            : 10) / 10
          coeff = (10 * coeff) / k
          p2 = similitude(p1, A, 0, sign * coeff)
          break
        }
      }
      let C = p1.listePoints[2]
      const longueurAB = longueur(A, B) // l1
      const longueurAC = longueur(A, C)
      const longueurBC = longueur(B, C)
      const longueurDE = longueurAB * coeff
      const longueurDF = longueurAC * coeff
      const longueurEF = sontSemblables
        ? longueurBC * coeff
        : longueurBC * coeff + choice([-1, 1]) * randint(1, 4) * 0.2 // change selon la valeur de sont semblables
      if (
        typeQuestionsDisponibles[i] !== 4 &&
        typeQuestionsDisponibles[i] !== 5 &&
        randint(0, 1) === 1
      ) {
        const d0 = droite(A, B)
        p2 = symetrieAxiale(p2, d0)
      }
      // mettre les triangles à une taille correcte
      const tailleMaxFigure = 14 // en unite*2 sert pour sortie PDF
      const tailleMinFigure = 7
      const scaleDessin = 0.5 // Mais scale à 0.5 est mieux que 1
      const largeurCol = 40 // en % sert pour sortie PDF et HTML ?
      const largeurHTMCol = `${tailleMinFigure * 20}px`
      const longueurMaxp1 = Math.max(longueurAB, longueurAC, longueurBC)
      const [coeffModif1, coeffModif2] = tailleFigures(longueurMaxp1, coeff, [
        tailleMaxFigure,
        tailleMinFigure,
      ])
      if (
        typeQuestionsDisponibles[i] !== 4 &&
        typeQuestionsDisponibles[i] !== 5
      ) {
        if (coeffModif1 !== 1) {
          p1 = homothetie(p1, A, coeffModif1)
        }
        if (coeffModif2 !== 1) {
          p2 = homothetie(p2, A, coeffModif2)
        }
      } else {
        const coefft = Math.max(coeffModif1, coeffModif2)
        if (coefft < 1) {
          p1 = homothetie(p1, A, coefft)
          p2 = homothetie(p2, A, coefft)
        }
      }
      // tenir compte des modifications pour sommets A et B puis declarer tous les sommets
      A = p1.listePoints[0]
      B = p1.listePoints[1]
      C = p1.listePoints[2]
      const D = p2.listePoints[0]
      const E = p2.listePoints[1]
      const F = p2.listePoints[2]

      let codeAB,
        codeDE,
        codeBC,
        codeEF,
        codeAC,
        codeDF,
        codeA1,
        codeA2,
        codeA3,
        codeA4,
        codeA5,
        codeA6,
        nom1,
        nom2,
        nommeP1,
        nommeP2
      let texteInit = `Les triangles $${shuffleLettres(A.nom + B.nom + C.nom)}$ et $${shuffleLettres(D.nom + E.nom + F.nom)}$ `

      switch (
        typeQuestionsDisponibles[i] // Suivant le type de question, le contenu sera différent
      ) {
        case 1: {
          // auChoix.push(nomAB, nomAB)
          const codeAnglesHomologues = combinaisonListes(
            markTypeArray.slice(0, 4),
            2,
          )
          const RayonAngle = 0.8
          const codeAngleA = new MarqueAngle(C, A, B, {
            mark: codeAnglesHomologues[1],
            rayon: RayonAngle,
          })
          const codeAngleB = new MarqueAngle(A, B, C, {
            mark: codeAnglesHomologues[0],
            rayon: RayonAngle,
          })
          const codeAngleD = new MarqueAngle(F, D, E, {
            mark: codeAnglesHomologues[1],
            rayon: RayonAngle,
          })
          const codeAngleE = new MarqueAngle(D, E, F, {
            mark: codeAnglesHomologues[0],
            rayon: RayonAngle,
          })
          nom1 = shuffleLettres(
            creerNomDePolygone(3, listeDeNomsDePolygonesDejaPris),
          )
          listeDeNomsDePolygonesDejaPris.push(nom1)
          const nom2 = shuffleLettres(
            creerNomDePolygone(3, listeDeNomsDePolygonesDejaPris),
          )
          nommeP1 = nommePolygone(p1, nom1)
          nommeP2 = nommePolygone(p2, nom2)
          // const nomAB = `[${A.nom + B.nom}]`// 'AB'// String(`$[${A.nom + B.nom}]$`)
          const auChoixCote = [
            { label: 'Choisir le bon segment', value: '' },
            ...shuffle([
              { latex: `[${D.nom + E.nom}]`, value: `[${D.nom + E.nom}]` },
              { latex: `[${D.nom + F.nom}]`, value: `[${D.nom + F.nom}]` },
              { latex: `[${E.nom + F.nom}]`, value: `[${E.nom + F.nom}]` },
            ]),
          ]
          const auChoixSommet = [
            { label: 'Choisir le bon sommet', value: '' },
            ...shuffle([
              { latex: `${D.nom}`, value: `${D.nom}` },
              { latex: `${E.nom}`, value: `${E.nom}` },
              { latex: `${F.nom}`, value: `${F.nom}` },
            ]),
          ]

          const repCote = [
            `[${D.nom + E.nom}]`,
            `[${D.nom + F.nom}]`,
            `[${E.nom + F.nom}]`,
          ]
          const repSommet = [`${D.nom}`, `${E.nom}`, `${F.nom}`]

          objetsAAfficher1 = [p1, codeAngleA, codeAngleB, nommeP1]
          objetsAAfficher2 = [p2, codeAngleD, codeAngleE, nommeP2]
          texte += `Ci-dessous, les triangles $${shuffleLettres(A.nom + B.nom + C.nom)}$ et $${shuffleLettres(D.nom + E.nom + F.nom)}$ sont semblables.<br>`
          const [colonne1, colonne2] = definiColonnes(
            objetsAAfficher1,
            objetsAAfficher2,
            scaleDessin,
          )

          texte += deuxColonnesResp(colonne1, colonne2, {
            largeur1: largeurCol,
            eleId: '',
            widthmincol1: largeurHTMCol,
            widthmincol2: '0px',
          })

          if (this.interactif) {
            texte +=
              `$[${A.nom + B.nom}]$ et ` +
              choixDeroulant(this, indiceChampReponse, {
                choices: auChoixCote,
              }) +
              ' sont homologues.<br>'
            handleAnswers(
              this,
              indiceChampReponse,
              { reponse: { value: repCote[0] } },
              { formatInteractif: 'liste-deroulante' },
            )
            texte +=
              `$[${A.nom + C.nom}]$ et ` +
              choixDeroulant(this, indiceChampReponse + 1, {
                choices: auChoixCote,
              }) +
              ' sont homologues.<br>'
            handleAnswers(
              this,
              indiceChampReponse + 1,
              { reponse: { value: repCote[1] } },
              { formatInteractif: 'liste-deroulante' },
            )
            texte +=
              `$[${B.nom + C.nom}]$ et ` +
              choixDeroulant(this, indiceChampReponse + 2, {
                choices: auChoixCote,
              }) +
              ' sont homologues.<br>'
            handleAnswers(
              this,
              indiceChampReponse + 2,
              { reponse: { value: repCote[2] } },
              { formatInteractif: 'liste-deroulante' },
            )
            texte +=
              `Les sommets $${A.nom}$ et ` +
              choixDeroulant(this, indiceChampReponse + 3, {
                choices: auChoixSommet,
              }) +
              ' sont homologues.<br>'
            handleAnswers(
              this,
              indiceChampReponse + 3,
              { reponse: { value: repSommet[0] } },
              { formatInteractif: 'liste-deroulante' },
            )
            texte +=
              `Les sommets $${B.nom}$ et ` +
              choixDeroulant(this, indiceChampReponse + 4, {
                choices: auChoixSommet,
              }) +
              ' sont homologues.<br>'
            handleAnswers(
              this,
              indiceChampReponse + 4,
              { reponse: { value: repSommet[1] } },
              { formatInteractif: 'liste-deroulante' },
            )
            texte +=
              `Les sommets $${C.nom}$ et ` +
              choixDeroulant(this, indiceChampReponse + 5, {
                choices: auChoixSommet,
              }) +
              ' sont homologues.<br>'
            handleAnswers(
              this,
              indiceChampReponse + 5,
              { reponse: { value: repSommet[2] } },
              { formatInteractif: 'liste-deroulante' },
            )
          } else if (context.isAmc) {
            const options = { ordered: true, vertical: true }
            texte += `$[${A.nom + B.nom}]$ et $\\ldots\\ldots\\ldots\\ldots$ sont homologues.<br>`
            listeDeroulanteToQcm(
              this,
              indiceChampReponse,
              auChoixCote,
              repCote[0],
              options,
            )
            texte += `$[${B.nom + C.nom}]$ et $\\ldots\\ldots\\ldots\\ldots$ sont homologues.<br>`
            listeDeroulanteToQcm(
              this,
              indiceChampReponse + 1,
              auChoixCote,
              repCote[1],
              options,
            )
            texte += `$[${C.nom + A.nom}]$ et $\\ldots\\ldots\\ldots\\ldots$ sont homologues.<br>`
            listeDeroulanteToQcm(
              this,
              indiceChampReponse + 2,
              auChoixCote,
              repCote[2],
              options,
            )
            texte += `$\\widehat{${A.nom + B.nom + C.nom}}$ et $\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots$ sont homologues.<br>`
            listeDeroulanteToQcm(
              this,
              indiceChampReponse + 4,
              auChoixSommet,
              repSommet[1],
              options,
            )
            texte += `$\\widehat{${C.nom + A.nom + B.nom}}$ et $\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots$ sont homologues.<br>`
            listeDeroulanteToQcm(
              this,
              indiceChampReponse + 3,
              auChoixSommet,
              repSommet[0],
              options,
            )
            texte += `$\\widehat{${B.nom + C.nom + A.nom}}$ et $\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots$ sont homologues.<br>`
            listeDeroulanteToQcm(
              this,
              indiceChampReponse + 5,
              auChoixSommet,
              repSommet[2],
              options,
            )
          } else {
            texte += 'Compléter les phrases suivantes.<br>'
            texte += `$[${A.nom + B.nom}]$ et $\\ldots\\ldots\\ldots\\ldots$ sont homologues.<br>`
            texte += `$[${B.nom + C.nom}]$ et $\\ldots\\ldots\\ldots\\ldots$ sont homologues.<br>`
            texte += `$[${C.nom + A.nom}]$ et $\\ldots\\ldots\\ldots\\ldots$ sont homologues.<br>`
            texte += `$\\widehat{${A.nom + B.nom + C.nom}}$ et $\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots$ sont homologues.<br>`
            texte += `$\\widehat{${C.nom + A.nom + B.nom}}$ et $\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots$ sont homologues.<br>`
            texte += `$\\widehat{${B.nom + C.nom + A.nom}}$ et $\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots$ sont homologues.<br>`
          }
          texteCorr = `$[${A.nom + B.nom}]$ et $${miseEnEvidence(`[${D.nom + E.nom}]`)}$ sont homologues.<br>`
          texteCorr += `$[${B.nom + C.nom}]$ et $${miseEnEvidence(`[${E.nom + F.nom}]`)}$ sont homologues.<br>`
          texteCorr += `$[${C.nom + A.nom}]$ et $${miseEnEvidence(`[${F.nom + D.nom}]`)}$ sont homologues.<br>`
          if (this.interactif || context.isAmc) {
            texteCorr += `Les sommets $${A.nom}$ et $${miseEnEvidence(D.nom)}$ sont homologues.<br>`
            texteCorr += `Les sommets $${B.nom}$ et $${miseEnEvidence(E.nom)}$ sont homologues.<br>`
            texteCorr += `Les sommets $${C.nom}$ et $${miseEnEvidence(F.nom)}$ sont homologues.<br>`
          } else {
            texteCorr += `$\\widehat{${A.nom + B.nom + C.nom}}$ et $${miseEnEvidence(`\\widehat{${D.nom + E.nom + F.nom}}`)}$ sont homologues.<br>`
            texteCorr += `$\\widehat{${C.nom + A.nom + B.nom}}$ et $${miseEnEvidence(`\\widehat{${F.nom + D.nom + E.nom}}`)}$ sont homologues.<br>`
            texteCorr += `$\\widehat{${B.nom + C.nom + A.nom}}$ et $${miseEnEvidence(`\\widehat{${E.nom + F.nom + D.nom}}`)}$ sont homologues.<br>`
          }
          nbDeChampsReponse += 6
          break
        }
        case 2: {
          // const sontSemblables = randint(0, 1) === 1

          const angleC = 180 - angleA - angleB
          let angleF = sontSemblables
            ? angleC
            : angleC + choice([-1, 1]) * randint(1, 5) * 2
          let compteurDeSecours = 0
          while (angleF === angleB && compteurDeSecours < 10) {
            angleF = sontSemblables
              ? angleC
              : angleC + choice([-1, 1]) * randint(1, 5) * 2
            compteurDeSecours++
          }
          const angleE = 180 - angleA - angleF
          const codeAngleB = codageAngle(
            A,
            B,
            C,
            0.8,
            '',
            'black',
            1,
            1,
            'none',
            0.2,
            true,
            true,
            `${angleB}°`,
            1,
          )
          const codeAngleA = codageAngle(
            C,
            A,
            B,
            0.8,
            '',
            'black',
            1,
            1,
            'none',
            0.2,
            true,
            true,
            `${angleA}°`,
            1,
          )
          const codeAngleC = vide2d()
          const codeAngleE = vide2d()
          const codeAngleF = codageAngle(
            E,
            F,
            D,
            0.8,
            '',
            'black',
            1,
            1,
            'none',
            0.2,
            true,
            true,
            `${angleF}°`,
            1,
          )
          const codeAngleD = codageAngle(
            F,
            D,
            E,
            0.8,
            '',
            'black',
            1,
            1,
            'none',
            0.2,
            true,
            true,
            `${angleA}°`,
            1,
          )
          nom1 = shuffleLettres(
            creerNomDePolygone(3, listeDeNomsDePolygonesDejaPris),
          )
          listeDeNomsDePolygonesDejaPris.push(nom1)
          const nom2 = shuffleLettres(
            creerNomDePolygone(3, listeDeNomsDePolygonesDejaPris),
          )
          nommeP1 = nommePolygone(p1, nom1)
          nommeP2 = nommePolygone(p2, nom2)
          texteInit = `Les triangles $${shuffleLettres(A.nom + B.nom + C.nom)}$ et $${shuffleLettres(D.nom + E.nom + F.nom)}$ `

          objetsAAfficher1 = [p1, codeAngleA, codeAngleB, codeAngleC, nommeP1]
          objetsAAfficher2 = [p2, codeAngleD, codeAngleF, codeAngleE, nommeP2]
          const [colonne1, colonne2] = definiColonnes(
            objetsAAfficher1,
            objetsAAfficher2,
            scaleDessin,
          )

          texte += deuxColonnesResp(colonne1, colonne2, {
            largeur1: largeurCol,
            eleId: '',
            widthmincol1: largeurHTMCol,
            widthmincol2: '0px',
          })
          texteCorr =
            'On sait que, dans un triangle, la somme des mesures des angles est égale à $180^\\circ$. <br>'
          texteCorr += `$\\widehat{${B.nom + C.nom + A.nom}} = 180^{\\circ} - ${texNombre(angleB, 0)}^{\\circ} - ${texNombre(angleA, 0)}^{\\circ}=${texNombre(angleC, 0)}^{\\circ}$. <br>`
          texteCorr += `$\\widehat{${D.nom + E.nom + F.nom}} = 180^{\\circ} - ${texNombre(angleF, 0)}^{\\circ} - ${texNombre(angleA, 0)}^{\\circ}=${texNombre(angleE, 0)}^{\\circ}$. <br>`
          if (sontSemblables) {
            texteCorr += `$\\widehat{${A.nom + B.nom + C.nom}}$ = $\\widehat{${D.nom + E.nom + F.nom}}$.<br>`
            texteCorr += `$\\widehat{${C.nom + A.nom + B.nom}}$ = $\\widehat{${F.nom + D.nom + E.nom}}$.<br>`
            texteCorr += `$\\widehat{${B.nom + C.nom + A.nom}}$ = $\\widehat{${E.nom + F.nom + D.nom}}$.<br>`
            texteCorr += `Comme les angles sont deux à deux de même mesure, les deux triangles ${texteEnCouleurEtGras('sont semblables')}.<br>`
          } else {
            texteCorr += `Les angles du triangle $${B.nom + C.nom + A.nom}$ mesurent ${angleA}°, ${angleB}° et ${angleC}°.<br>`
            texteCorr += `Les angles du triangle $${D.nom + E.nom + F.nom}$ mesurent ${angleA}°, ${angleE}° et ${angleF}°.<br>`
            texteCorr += `Les deux triangles $${B.nom + C.nom + A.nom}$ et $${D.nom + E.nom + F.nom}$ n'ont donc pas deux de leurs angles deux à deux de même mesure. Donc, les deux triangles ${texteEnCouleurEtGras('ne sont pas semblables')}.<br>`
          }
          nbDeChampsReponse++
          break
        }
        case 3: {
          codeAB =
            angleOriente(C, A, B) > 0
              ? placeLatexSurSegment(
                  `${texNombre(longueurAB, 1)}\\text{ cm}`,
                  A,
                  B,
                )
              : placeLatexSurSegment(
                  `${texNombre(longueurAB, 1)}\\text{ cm}`,
                  B,
                  A,
                )
          codeAC =
            angleOriente(B, C, A) > 0
              ? placeLatexSurSegment(
                  `${texNombre(longueurAC, 1)}\\text{ cm}`,
                  C,
                  A,
                )
              : placeLatexSurSegment(
                  `${texNombre(longueurAC, 1)}\\text{ cm}`,
                  A,
                  C,
                )
          codeBC =
            angleOriente(A, B, C) > 0
              ? placeLatexSurSegment(
                  `${texNombre(longueurBC, 1)}\\text{ cm}`,
                  B,
                  C,
                )
              : placeLatexSurSegment(
                  `${texNombre(longueurBC, 1)}\\text{ cm}`,
                  C,
                  B,
                )
          codeDE =
            angleOriente(F, D, E) > 0
              ? placeLatexSurSegment(
                  `${texNombre(longueurDE, 1)}\\text{ cm}`,
                  D,
                  E,
                )
              : placeLatexSurSegment(
                  `${texNombre(longueurDE, 1)}\\text{ cm}`,
                  E,
                  D,
                )
          codeDF =
            angleOriente(E, F, D) > 0
              ? placeLatexSurSegment(
                  `${texNombre(longueurDF, 1)}\\text{ cm}`,
                  F,
                  D,
                )
              : placeLatexSurSegment(
                  `${texNombre(longueurDF, 1)}\\text{ cm}`,
                  D,
                  F,
                )
          codeEF =
            angleOriente(D, E, F) > 0
              ? placeLatexSurSegment(
                  `${texNombre(longueurEF, 1)}\\text{ cm}`,
                  E,
                  F,
                )
              : placeLatexSurSegment(
                  `${texNombre(longueurEF, 1)}\\text{ cm}`,
                  F,
                  E,
                )

          nom1 = shuffleLettres(
            creerNomDePolygone(3, listeDeNomsDePolygonesDejaPris),
          )
          listeDeNomsDePolygonesDejaPris.push(nom1)
          const nom2 = shuffleLettres(
            creerNomDePolygone(3, listeDeNomsDePolygonesDejaPris),
          )
          nommeP1 = nommePolygone(p1, nom1)
          nommeP2 = nommePolygone(p2, nom2)
          objetsAAfficher1 = [p1, codeAB, codeBC, codeAC, nommeP1]
          objetsAAfficher2 = [p2, codeDE, codeEF, codeDF, nommeP2]
          texteInit = `Les triangles $${shuffleLettres(A.nom + B.nom + C.nom)}$ et $${shuffleLettres(D.nom + E.nom + F.nom)}$ `
          texte =
            texteInit +
            `ont pour longueurs des côtés respectifs $${texNombre(longueurAB, 1)}\\text{ cm}$, $${texNombre(longueurAC, 1)}\\text{ cm}$ et $${texNombre(longueurBC, 1)}\\text{ cm}$ pour le premier triangle et $${texNombre(longueurDE, 1)}\\text{ cm}$, $${texNombre(longueurDF, 1)}\\text{ cm}$ et $${texNombre(longueurEF, 1)}\\text{ cm}$ pour le second triangle.`
          const [colonne1, colonne2] = definiColonnes(
            objetsAAfficher1,
            objetsAAfficher2,
            scaleDessin,
          )

          texte += deuxColonnesResp(colonne1, colonne2, {
            largeur1: largeurCol,
            eleId: '',
            widthmincol1: largeurHTMCol,
            widthmincol2: '0px',
          })
          texteCorr =
            'On trie les longueurs des deux triangles afin de les comparer. <br>'
          const cotes1 = [longueurAB, longueurAC, longueurBC].sort(
            (a, b) => a - b,
          )
          const cotes2 = [longueurDE, longueurDF, longueurEF].sort(
            (a, b) => a - b,
          )
          texteCorr += `$${texNombre(cotes1[0], 1)} \\div ${texNombre(cotes2[0], 1)} = ${new FractionEtendue(arrondi(cotes1[0], 1), arrondi(cotes2[0], 1)).texFractionSimplifiee}$.<br>`
          texteCorr += `$${texNombre(cotes1[1], 1)} \\div ${texNombre(cotes2[1], 1)} = ${new FractionEtendue(arrondi(cotes1[1], 1), arrondi(cotes2[1], 1)).texFractionSimplifiee}$.<br>`
          texteCorr += `$${texNombre(cotes1[2], 1)} \\div ${texNombre(cotes2[2], 1)} = ${new FractionEtendue(arrondi(cotes1[2], 1), arrondi(cotes2[2], 1)).texFractionSimplifiee}$.<br>`
          texteCorr += sontSemblables
            ? `Les longueurs sont proportionnelles deux à deux donc les deux triangles ${texteEnCouleurEtGras('sont semblables')}.<br>`
            : `Les longueurs ne sont pas proportionnelles deux à deux donc les deux triangles ${texteEnCouleurEtGras('ne sont pas semblables')}.<br>`
          nbDeChampsReponse++
          break
        }
        case 4: {
          codeAB = vide2d() // angleOriente(C, A, B) > 0 ? afficheLongueurSegment(A, B) : afficheLongueurSegment(B, A)
          codeDE = vide2d() // angleOriente(F, D, E) > 0 ? afficheLongueurSegment(D, E) : afficheLongueurSegment(E, D)
          codeBC = vide2d() // angleOriente(A, B, C) > 0 ? afficheLongueurSegment(B, C) : afficheLongueurSegment(C, B)
          codeEF = vide2d() // angleOriente(D, E, F) > 0 ? afficheLongueurSegment(E, F) : afficheLongueurSegment(F, E)
          codeAC = vide2d() // angleOriente(B, C, A) > 0 ? afficheLongueurSegment(C, A) : afficheLongueurSegment(A, C)
          codeDF = vide2d() // angleOriente(E, F, D) > 0 ? afficheLongueurSegment(F, D) : afficheLongueurSegment(D, F)
          codeA1 = vide2d() // codageAngle(A, B, C, 0.8, '|')
          codeA2 = vide2d() // codageAngle(D, E, F, 0.8, '|')
          codeA3 = vide2d() // odageAngle(B, C, A, 0.8, 'X')
          codeA4 = codageAngleDroit(E, F, D)
          codeA5 = codageAngleDroit(C, A, B)
          codeA6 = vide2d() // codageAngle(F, D, E, 0.8, '||')
          nom1 = shuffleLettres(
            creerNomDePolygone(3, listeDeNomsDePolygonesDejaPris),
          )
          listeDeNomsDePolygonesDejaPris.push(nom1)
          nom2 = String(
            nom1[0] +
              nom1[1] +
              choisitLettresDifferentes(
                1,
                listeDeNomsDePolygonesDejaPris.toString(),
              ),
          )
          nommeP1 = nommePolygone(p1, nom1)
          nommeP2 = nommePolygone(p2, nom2)
          const objets = [
            p1,
            p2,
            codeAB,
            codeDE,
            codeBC,
            codeEF,
            codeAC,
            codeDF,
            codeA1,
            codeA2,
            codeA3,
            codeA4,
            codeA5,
            codeA6,
            nommeP1,
            labelPoint(p2.listePoints[2]),
          ]
          texteInit = `Les triangles $${shuffleLettres(A.nom + B.nom + C.nom)}$ et $${shuffleLettres(D.nom + E.nom + F.nom)}$ `
          texte =
            texteInit +
            `ont pour angles respectifs $\\widehat{${A.nom + F.nom + E.nom}} = \\widehat{${E.nom + D.nom + C.nom}} = 90^\\circ$, $\\widehat{${B.nom + C.nom + A.nom}}$ = $\\widehat{${F.nom + D.nom + E.nom}}$ et $\\widehat{${C.nom + A.nom + B.nom}}$ = $\\widehat{${E.nom + F.nom + D.nom}}$.`
          texte += mathalea2d(
            Object.assign(
              {
                scale: 0.5,
                zoom,
              },
              fixeBordures(objets),
            ),
            objets,
          )
          texteCorr =
            'On trie les longueurs des deux triangles afin de les comparer. <br>'
          codeA4 = codageAngleDroit(E, F, D)
          codeA5 = codageAngleDroit(C, A, B)
          texteCorr += `$\\widehat{${C.nom + A.nom + B.nom}} = \\widehat{${E.nom + F.nom + D.nom}} = 90^\\circ$ par codage.<br>`
          texteCorr += `$\\widehat{${A.nom + B.nom + C.nom}}$ = $\\widehat{${D.nom + E.nom + F.nom}}$ car les angles sont confondus.<br>`
          texteCorr +=
            "On a donc deux paires d'angles égales donc la troisième paire aussi grâce à la règle des $180^\\circ$ dans un triangle (la somme des angles est égale à $180^\\circ$). <br>"
          texteCorr += `$\\widehat{${B.nom + C.nom + A.nom}}$ = $\\widehat{${F.nom + D.nom + E.nom}}$.<br>`
          texteCorr += `Les $3$ paires d'angles sont égales. Comme les angles sont égaux deux à deux, les deux triangles ${texteEnCouleurEtGras('sont semblables')}.<br>`
          nbDeChampsReponse++
          break
        }
        case 5: {
          const longueurAE = longueurDE
          const longueurAF = longueurDF
          codeAB =
            angleOriente(C, A, B) > 0
              ? placeLatexSurSegment(
                  `${texNombre(longueurAB, 1)}\\text{ cm}`,
                  A,
                  B,
                )
              : placeLatexSurSegment(
                  `${texNombre(longueurAB, 1)}\\text{ cm}`,
                  B,
                  A,
                )
          codeAC =
            angleOriente(B, C, A) > 0
              ? placeLatexSurSegment(
                  `${texNombre(longueurAC, 1)}\\text{ cm}`,
                  C,
                  A,
                )
              : placeLatexSurSegment(
                  `${texNombre(longueurAC, 1)}\\text{ cm}`,
                  A,
                  C,
                )
          codeBC =
            angleOriente(A, B, C) > 0
              ? placeLatexSurSegment(
                  `${texNombre(longueurBC, 1)}\\text{ cm}`,
                  B,
                  C,
                )
              : placeLatexSurSegment(
                  `${texNombre(longueurBC, 1)}\\text{ cm}`,
                  C,
                  B,
                )
          codeDE =
            angleOriente(F, A, E) > 0
              ? placeLatexSurSegment(
                  `${texNombre(longueurAE, 1)}\\text{ cm}`,
                  A,
                  E,
                )
              : placeLatexSurSegment(
                  `${texNombre(longueurAE, 1)}\\text{ cm}`,
                  E,
                  A,
                )
          codeDF =
            angleOriente(E, F, A) > 0
              ? placeLatexSurSegment(
                  `${texNombre(longueurAF, 1)}\\text{ cm}`,
                  F,
                  A,
                )
              : placeLatexSurSegment(
                  `${texNombre(longueurAF, 1)}\\text{ cm}`,
                  A,
                  F,
                )
          codeEF =
            angleOriente(A, E, F) > 0
              ? placeLatexSurSegment(
                  `${texNombre(longueurEF, 1)}\\text{ cm}`,
                  E,
                  F,
                )
              : placeLatexSurSegment(
                  `${texNombre(longueurEF, 1)}\\text{ cm}`,
                  F,
                  E,
                )
          let coteDF = segment(A, B)
          let coteDE = segment(A, B)
          if (k < 10 && sign > 0) {
            // agrandissement
            // codeDF = afficheCoteSegment(segment(F, A), `${longueurAF}`, -2, bleuMathalea)
            coteDF =
              angleOriente(E, A, F) > 0
                ? afficheCoteSegmentSansTexte(segment(A, F), 1, bleuMathalea)
                : afficheCoteSegmentSansTexte(segment(A, F), -1, bleuMathalea)
            coteDE =
              angleOriente(E, A, F) > 0
                ? afficheCoteSegmentSansTexte(segment(A, E), -1, bleuMathalea)
                : afficheCoteSegmentSansTexte(segment(A, E), 1, bleuMathalea)
            codeDF =
              angleOriente(E, A, F) > 0
                ? placeLatexSurSegment(
                    `${texNombre(longueurAF, 1)}\\text{ cm}`,
                    coteDF.extremite1,
                    coteDF.extremite2,
                  )
                : placeLatexSurSegment(
                    `${texNombre(longueurAF, 1)}\\text{ cm}`,
                    coteDF.extremite2,
                    coteDF.extremite1,
                  )
            codeDE =
              angleOriente(E, A, F) > 0
                ? placeLatexSurSegment(
                    `${texNombre(longueurAE, 1)}\\text{ cm}`,
                    coteDE.extremite2,
                    coteDE.extremite1,
                  )
                : placeLatexSurSegment(
                    `${texNombre(longueurAE, 1)}\\text{ cm}`,
                    coteDE.extremite1,
                    coteDE.extremite2,
                  )
          } else if (k > 10 && sign > 0) {
            coteDF =
              angleOriente(C, A, B) > 0
                ? afficheCoteSegmentSansTexte(segment(A, B), 1, bleuMathalea)
                : afficheCoteSegmentSansTexte(segment(A, B), -1, bleuMathalea)
            coteDE =
              angleOriente(C, A, B) > 0
                ? afficheCoteSegmentSansTexte(segment(A, C), -1, bleuMathalea)
                : afficheCoteSegmentSansTexte(segment(A, C), 1, bleuMathalea)
            codeAB =
              angleOriente(C, A, B) > 0
                ? placeLatexSurSegment(
                    `${texNombre(longueurAB, 1)}\\text{ cm}`,
                    coteDF.extremite1,
                    coteDF.extremite2,
                  )
                : placeLatexSurSegment(
                    `${texNombre(longueurAB, 1)}\\text{ cm}`,
                    coteDF.extremite2,
                    coteDF.extremite1,
                  )
            codeAC =
              angleOriente(C, A, B) > 0
                ? placeLatexSurSegment(
                    `${texNombre(longueurAC, 1)}\\text{ cm}`,
                    coteDE.extremite2,
                    coteDE.extremite1,
                  )
                : placeLatexSurSegment(
                    `${texNombre(longueurAC, 1)}\\text{ cm}`,
                    coteDE.extremite1,
                    coteDE.extremite2,
                  )
          }
          nom1 = shuffleLettres(
            creerNomDePolygone(3, listeDeNomsDePolygonesDejaPris),
          )
          listeDeNomsDePolygonesDejaPris.push(nom1)
          nom2 = String(
            nom1[0] +
              choisitLettresDifferentes(
                2,
                listeDeNomsDePolygonesDejaPris.toString(),
              ),
          ).replace(',', '')
          nommeP1 = nommePolygone(p1, nom1)
          nommeP2 = nommePolygone(p2, nom2)
          const objets = [
            p1,
            p2,
            codeAB,
            codeDE,
            codeBC,
            codeEF,
            codeAC,
            codeDF,
            coteDF,
            coteDE,
            nommeP1,
            labelPoint(p2.listePoints[2]),
            labelPoint(p2.listePoints[1]),
          ]
          texteInit = `Les triangles $${shuffleLettres(A.nom + B.nom + C.nom)}$ et $${shuffleLettres(D.nom + E.nom + F.nom)}$ `
          texte =
            texteInit +
            `ont pour longueurs des côtés respectifs $${texNombre(longueurAB, 1)}\\text{ cm}$, $${texNombre(longueurAC, 1)}\\text{ cm}$ et $${texNombre(longueurBC, 1)}\\text{ cm}$ pour le premier triangle et $${texNombre(longueurDE, 1)}\\text{ cm}$, $${texNombre(longueurDF, 1)}\\text{ cm}$ et $${texNombre(longueurEF, 1)}\\text{ cm}$ pour le second triangle.`
          texte += mathalea2d(
            Object.assign(
              {
                scale: 0.5,
                zoom,
              },
              fixeBordures(objets),
            ),
            objets,
          )
          texteCorr =
            'On trie les longueurs des deux triangles afin de les comparer. <br>'
          const cotes1 = [longueurAB, longueurAC, longueurBC].sort(
            (a, b) => a - b,
          )
          const cotes2 = [longueurDE, longueurDF, longueurEF].sort(
            (a, b) => a - b,
          )
          texteCorr += `$${texNombre(cotes1[0], 1)} \\div ${texNombre(cotes2[0], 1)} = ${new FractionEtendue(arrondi(cotes1[0], 1), arrondi(cotes2[0], 1)).texFractionSimplifiee}$.<br>`
          texteCorr += `$${texNombre(cotes1[1], 1)} \\div ${texNombre(cotes2[1], 1)} = ${new FractionEtendue(arrondi(cotes1[1], 1), arrondi(cotes2[1], 1)).texFractionSimplifiee}$.<br>`
          texteCorr += `$${texNombre(cotes1[2], 1)} \\div ${texNombre(cotes2[2], 1)} = ${new FractionEtendue(arrondi(cotes1[2], 1), arrondi(cotes2[2], 1)).texFractionSimplifiee}$.<br>`
          texteCorr += sontSemblables
            ? `Les longueurs sont proportionnelles deux à deux donc les deux triangles ${texteEnCouleurEtGras('sont semblables')}.<br>`
            : `Les longueurs ne sont pas proportionnelles deux à deux donc les deux triangles ${texteEnCouleurEtGras('ne sont pas semblables')}.<br>`
          nbDeChampsReponse++
          break
        }
      }
      if (typeQuestionsDisponibles[i] !== 1) {
        const choices = [
          { label: 'Choisir la proposition qui convient', value: '' },
          { label: 'sont semblables', value: 'oui' },
          { label: 'ne sont pas semblables', value: 'non' },
        ]
        if (this.interactif) {
          texte +=
            ' ' +
            texteInit +
            choixDeroulant(this, indiceChampReponse, { choices: choices }) +
            '.'
          handleAnswers(
            this,
            indiceChampReponse,
            { reponse: { value: repSemblables } },
            { formatInteractif: 'liste-deroulante' },
          )
        } else if (context.isAmc) {
          const options = { ordered: true, vertical: true }

          listeDeroulanteToQcm(
            this,
            indiceChampReponse,
            choices,
            repSemblables,
            options,
          )
        } else {
          texte += ' ' + texteInit + ` sont-ils semblables${sp()}? Justifier.<br>`
        }
      }
      //      if (this.questionJamaisPosee(i, longueur(A, B).toFixed(1), longueur(B, C).toFixed(1), longueur(C, A).toFixed(1), longueur(D, E).toFixed(1))) {
      if (
        this.questionJamaisPosee(
          i,
          typeQuestionsDisponibles[i],
          longueurAB,
          longueurAC,
          longueurBC,
          longueurDE,
          k,
          coeff,
        )
      ) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        indiceChampReponse += nbDeChampsReponse
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}

function definiColonnes(
  objetsAAfficher1: NestedObjetMathalea2dArray,
  objetsAAfficher2: NestedObjetMathalea2dArray,
  scaleDessin: number,
): [string, string] {
  const bord1 = fixeBordures(objetsAAfficher1, {
    rxmin: -0.1,
    rymin: -0.1,
    rxmax: 0.1,
    rymax: 0.1,
  })
  const bord2 = fixeBordures(objetsAAfficher2, {
    rxmin: -0.1,
    rymin: -0.1,
    rxmax: 0.1,
    rymax: 0.1,
  })
  const colonne1 = mathalea2d(
    Object.assign(
      {
        /* pixelsParCm: 20,  */ scale: scaleDessin,
        optionsTikz: ['baseline=(current bounding box.north)'],
        mainlevee: false,
      },
      bord1,
    ),
    objetsAAfficher1,
  )
  const colonne2 = mathalea2d(
    Object.assign(
      {
        scale: scaleDessin,
        optionsTikz: ['baseline=(current bounding box.north)'],
        mainlevee: false,
      },
      bord2,
    ),
    objetsAAfficher2,
  )
  return [colonne1, colonne2]
}

function tailleFigures(
  LongueurFig1: number,
  CoeffFig1Fig2: number,
  taille: [max: number, min: number],
): [number, number] {
  let coeffModif1 = 1
  let coeffModif2 = 1
  const LongueurFig2 = LongueurFig1 * CoeffFig1Fig2
  if (CoeffFig1Fig2 > 1) {
    if (LongueurFig2 > taille[0]) {
      coeffModif2 = taille[0] / LongueurFig2
      coeffModif1 = coeffModif2
    }
  } else {
    if (LongueurFig1 > taille[0]) {
      coeffModif1 = taille[0] / LongueurFig1
      coeffModif2 = coeffModif1
    }
  }
  if (CoeffFig1Fig2 > 1) {
    if (LongueurFig1 * coeffModif1 < taille[1]) {
      coeffModif1 = taille[1] / LongueurFig1
    }
  } else {
    if (LongueurFig2 * coeffModif2 < taille[1]) {
      coeffModif2 = taille[1] / LongueurFig2
    }
  }
  return [coeffModif1, coeffModif2]
}

function afficheCoteSegmentSansTexte(
  s: Segment,
  positionCote = 0.5,
  couleurCote = 'black',
): Segment {
  const A = s.extremite1
  const B = s.extremite2
  const v = similitude(vecteur(A, B), A, 90, positionCote / s.longueur)
  const cote = segment(translation(A, v), translation(B, v), couleurCote)
  if (longueur(A, B) > 1) cote.styleExtremites = '<->'
  else cote.styleExtremites = '>-<'
  return cote
}
