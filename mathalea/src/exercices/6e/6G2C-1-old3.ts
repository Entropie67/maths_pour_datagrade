// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid a51c0 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { cercle } from '../../lib/2d/cercle'
import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { codageSegments } from '../../lib/2d/CodageSegment'
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { droite } from '../../lib/2d/droites'
import { mediatrice } from '../../lib/2d/Mediatrice'
import { placeLatexSurSegment } from '../../lib/2d/placeLatexSurSegment'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { segment, segmentAvecExtremites } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { rotation } from '../../lib/2d/transformations'
import {
  milieu,
  pointSurCercle,
  pointSurDroite,
} from '../../lib/2d/utilitairesPoint'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { toutPourUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { choisitLettresDifferentes } from '../../lib/outils/aleatoires'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import type { Valeur } from '../../lib/types'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'

export const titre = 'Identifier une région du plan'
export const interactifReady = true
export const interactifType = 'mathLive'

export const dateDePublication = '10/01/2026'

/**
 * @author Jean-claude Lhote
 */
export const dateDeModifImportante = '09/10/2026'

export const uuid = 'a51c0'

export const refs = {
  'fr-fr': [],
  'fr-2016': [],
  'fr-ch': ['NR'],
}

const typesDeQuestions = [
  'interieurDisque',
  'exterieurDisque',
  'cercle',
  'couronne',
  'intersectionDeuxDisques',
  'exterieurDeuxDisques',
  'interieurDisqueExterieurAutreDisque',
  'mediatrice',
  'demiPlan',
] as const

/** Choix du formulaire qui mélange les régions délimitées par des cercles. */
const melangeDisques = 10

export default class RegionsDuPlanOld3 extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.consigne = "Dans cet exercice, l'unité de longueur est le centimètre."
    this.besoinFormulaireTexte = [
      'Types de régions',
      [
        'Nombres séparés par des tirets :',
        "1 : Intérieur d'un disque (une condition)",
        "2 : Extérieur d'un disque (une condition)",
        '3 : Cercle (une condition)',
        '4 : Couronne (deux conditions)',
        '5 : Intersection de deux disques (deux conditions)',
        '6 : Extérieur de deux disques (deux conditions)',
        "7 : Intérieur d'un disque et extérieur d'un autre (deux conditions)",
        '8 : Médiatrice (une condition)',
        '9 : Demi-plan délimité par une médiatrice (une condition)',
        `${melangeDisques} : Mélange des régions délimitées par des cercles (1 à 7)`,
      ].join('\n'),
    ]
    this.sup = String(melangeDisques)
  }

  nouvelleVersion() {
    // Le mélange ne propose pas la médiatrice et le demi-plan, travaillés à part.
    const saisie = String(this.sup)
      .split('-')
      .map((choix) =>
        Number(choix) === melangeDisques ? '1-2-3-4-5-6-7' : choix,
      )
      .join('-')
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie,
      nbQuestions: this.nbQuestions,
      min: 1,
      max: typesDeQuestions.length,
      defaut: 1,
      melange: melangeDisques,
      listeOfCase: [...typesDeQuestions],
    })
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      let content = ''
      let objetReponse: Valeur
      let nbConditions = 1
      let region = 'de la partie grisée du plan'
      let texteCorr = ''
      const objetsEnonce: NestedObjetMathalea2dArray = []
      let donneesAleatoires: (number | string)[] = []
      const noms = choisitLettresDifferentes(3, 'M')
      const cm = '\\text{ cm}'
      switch (listeTypeDeQuestions[i]) {
        case 'interieurDisque':
        case 'exterieurDisque':
        case 'cercle':
          {
            const type = listeTypeDeQuestions[i]
            const xC = randint(-2, 2)
            const yC = randint(-2, 2)
            const r = randint(20, 35) / 10
            const rTex = texNombre(r, 1)
            const C = pointAbstrait(xC, yC, noms[0], 'left')
            const c = cercle(C, r)
            const D = pointSurCercle(c, 0, noms[1], 'above')
            const labels = labelPoint(C)
            const centre = tracePoint(C)
            const rayon = segment(C, D)
            const longRayon = placeLatexSurSegment(rTex, D, C, {
              horizontal: true,
              distance: 0.5,
              letterSize: 'scriptsize',
            })
            const reponse = `M${noms[0]} ${type === 'interieurDisque' ? '<' : type === 'exterieurDisque' ? '>' : '='} ${rTex}${cm}`
            if (type === 'interieurDisque') {
              c.couleurDeRemplissage = colorToLatexOrHTML('lightgray')
              objetsEnonce.push(c)
              texteCorr += `Le point $M$ est situé à l'intérieur du disque de centre $${noms[0]}$ et de rayon $${rTex}${cm}$.<br>
            Autrement dit, le point $M$ est à moins de $${rTex}${cm}$ du point $${noms[0]}$ : $${miseEnEvidence(reponse)}$.`
              objetReponse = { champ1: { value: '<' } }
            } else if (type === 'exterieurDisque') {
              const poly = polygone(
                pointAbstrait(-6.5, -6.5),
                pointAbstrait(6.5, -6.5),
                pointAbstrait(6.5, 6.5),
                pointAbstrait(-6.5, 6.5),
              )
              poly.couleurDeRemplissage = colorToLatexOrHTML('lightgray')
              c.couleurDeRemplissage = colorToLatexOrHTML('white')
              objetsEnonce.push(poly, c)
              texteCorr += `Le point $M$ est situé à l'extérieur du disque de centre $${noms[0]}$ et de rayon $${rTex}${cm}$.<br>
            Autrement dit, le point $M$ est à plus de $${rTex}${cm}$ du point $${noms[0]}$ : $${miseEnEvidence(reponse)}$.`
              objetReponse = { champ1: { value: '>' } }
            } else {
              c.color = colorToLatexOrHTML('red')
              c.epaisseur = 2
              objetsEnonce.push(c)
              region = 'du cercle rouge'
              texteCorr += `Le point $M$ est situé sur le cercle de centre $${noms[0]}$ et de rayon $${rTex}${cm}$.<br>
            Autrement dit, le point $M$ est à $${rTex}${cm}$ du point $${noms[0]}$ : $${miseEnEvidence(reponse)}$.`
              objetReponse = { champ1: { value: '=' } }
            }
            objetsEnonce.push(labels, centre, rayon, longRayon)
            content = `M${noms[0]} %{champ1} ${rTex}${cm}`
            donneesAleatoires = [type, noms.join(''), xC, yC, r]
          }
          break
        case 'couronne':
          {
            nbConditions = 2
            const xC = randint(-1, 1)
            const yC = randint(-1, 1)
            const r1 = randint(15, 25) / 10
            const r2 = randint(35, 45) / 10
            const r1Tex = texNombre(r1, 1)
            const r2Tex = texNombre(r2, 1)
            const C = pointAbstrait(xC, yC, noms[0], 'left')
            const c1 = cercle(C, r1)
            const c2 = cercle(C, r2)
            const D1 = pointSurCercle(c1, 0, noms[1], 'above')
            const D2 = pointSurCercle(c2, 60, noms[2], 'above')
            const labels = labelPoint(C)
            const centre = tracePoint(C)
            const rayon1 = segment(C, D1)
            const longRayon1 = placeLatexSurSegment(r1Tex, D1, C, {
              horizontal: true,
              distance: 0.5,
              letterSize: 'scriptsize',
            })
            const rayon2 = segment(C, D2)
            // Étiquette horizontale au milieu de la partie du rayon dans la couronne.
            const P1 = pointSurCercle(c1, 60, '')
            const longRayon2 = placeLatexSurSegment(r2Tex, P1, D2, {
              horizontal: true,
              distance: 0.8,
              letterSize: 'scriptsize',
            })

            c1.couleurDeRemplissage = colorToLatexOrHTML('white')
            c2.couleurDeRemplissage = colorToLatexOrHTML('lightgray')

            objetsEnonce.push(
              c2,
              c1,
              labels,
              centre,
              rayon1,
              longRayon1,
              rayon2,
              longRayon2,
            )
            texteCorr += `Le point $M$ est situé dans la couronne comprise entre le cercle de centre $${noms[0]}$ et de rayon $${r1Tex}${cm}$ et le cercle de centre $${noms[0]}$ et de rayon $${r2Tex}${cm}$.<br>
            Autrement dit, le point $M$ est à plus de $${r1Tex}${cm}$ et à moins de $${r2Tex}${cm}$ du point $${noms[0]}$ : $${miseEnEvidence(`${r1Tex}${cm} < M${noms[0]} < ${r2Tex}${cm}`)}$.`
            content = `${r1Tex}${cm} %{champ1} M${noms[0]} %{champ2} ${r2Tex}${cm}`
            objetReponse = { champ1: { value: '<' }, champ2: { value: '<' } }
            donneesAleatoires = [noms.join(''), xC, yC, r1, r2]
          }
          break
        case 'intersectionDeuxDisques':
        case 'exterieurDeuxDisques':
        case 'interieurDisqueExterieurAutreDisque':
          {
            nbConditions = 2
            const type = listeTypeDeQuestions[i]
            const xC1 = randint(-2, 0)
            const yC1 = randint(-2, 0)
            const r1 = randint(25, 35) / 10
            const xC2 = randint(0, 2, xC1)
            const yC2 = randint(0, 2, yC1)
            const r2 =
              type === 'interieurDisqueExterieurAutreDisque'
                ? randint(15, 25) / 10
                : randint(25, 35) / 10
            // Exclure les cercles disjoints, tangents ou emboîtés.
            const distanceCentres = Math.hypot(xC2 - xC1, yC2 - yC1)
            if (
              distanceCentres <= Math.abs(r1 - r2) ||
              distanceCentres >= r1 + r2
            ) {
              continue
            }
            const r1Tex = texNombre(r1, 1)
            const r2Tex = texNombre(r2, 1)
            const C1 = pointAbstrait(xC1, yC1, noms[0], 'left')
            const C2 = pointAbstrait(xC2, yC2, noms[1], 'right')
            const c1 = cercle(C1, r1)
            const c2 = cercle(C2, r2)
            const D1 = pointSurCercle(c1, -135, '', 'above')
            const D2 = pointSurCercle(c2, 60, '', 'above')
            const labels = labelPoint(C1, C2)
            const centre1 = tracePoint(C1)
            const centre2 = tracePoint(C2)
            const rayon1 = segment(C1, D1)
            const longRayon1 = placeLatexSurSegment(r1Tex, D1, C1, {
              horizontal: true,
              distance: 0.5,
              letterSize: 'scriptsize',
            })
            const rayon2 = segment(C2, D2)
            const longRayon2 = placeLatexSurSegment(r2Tex, C2, D2, {
              distance: 0.5,
              letterSize: 'scriptsize',
            })
            // Le disque blanc masque une partie du premier cercle : on le retrace.
            const contourC1 = cercle(C1, r1)
            const signe1 = type === 'exterieurDeuxDisques' ? '>' : '<'
            const signe2 = type === 'intersectionDeuxDisques' ? '<' : '>'
            const position = (signe: string) =>
              signe === '<' ? "à l'intérieur" : "à l'extérieur"
            const distance = (signe: string) =>
              signe === '<' ? 'à moins de' : 'à plus de'

            if (type === 'intersectionDeuxDisques') {
              c1.couleurDeRemplissage = colorToLatexOrHTML('gray')
              c1.opaciteDeRemplissage = 0.5
              c2.couleurDeRemplissage = colorToLatexOrHTML('gray')
              c2.opaciteDeRemplissage = 0.5
              objetsEnonce.push(c1, c2)
              region = 'de la partie gris foncé'
            } else {
              if (type === 'exterieurDeuxDisques') {
                const fond = polygone(
                  pointAbstrait(-6.5, -6.5),
                  pointAbstrait(6.5, -6.5),
                  pointAbstrait(6.5, 6.5),
                  pointAbstrait(-6.5, 6.5),
                )
                fond.couleurDeRemplissage = colorToLatexOrHTML('lightgray')
                objetsEnonce.push(fond)
                c1.couleurDeRemplissage = colorToLatexOrHTML('white')
              } else {
                c1.couleurDeRemplissage = colorToLatexOrHTML('lightgray')
              }
              c2.couleurDeRemplissage = colorToLatexOrHTML('white')
              objetsEnonce.push(c1, c2, contourC1)
            }
            objetsEnonce.push(
              labels,
              centre1,
              centre2,
              rayon1,
              longRayon1,
              rayon2,
              longRayon2,
            )
            texteCorr += `Le point $M$ est situé ${position(signe1)} du disque de centre $${noms[0]}$ et de rayon $${r1Tex}${cm}$ et ${position(signe2)} du disque de centre $${noms[1]}$ et de rayon $${r2Tex}${cm}$.<br>
            Autrement dit, le point $M$ est ${distance(signe1)} $${r1Tex}${cm}$ du point $${noms[0]}$ et ${distance(signe2)} $${r2Tex}${cm}$ du point $${noms[1]}$ : $${miseEnEvidence(`M${noms[0]} ${signe1} ${r1Tex}${cm}`)}$ et $${miseEnEvidence(`M${noms[1]} ${signe2} ${r2Tex}${cm}`)}$.`
            content = `M${noms[0]} %{champ1} ${r1Tex}${cm} \\text{ et } M${noms[1]} %{champ2} ${r2Tex}${cm}`
            objetReponse = {
              champ1: { value: signe1 },
              champ2: { value: signe2 },
            }
            donneesAleatoires = [
              type,
              noms.join(''),
              xC1,
              yC1,
              r1,
              xC2,
              yC2,
              r2,
            ]
          }
          break
        case 'mediatrice':
          {
            const xA = randint(-5, -2)
            const yA = randint(-5, -2)
            const xB = randint(2, 5)
            const yB = randint(2, 5)
            const A = pointAbstrait(xA, yA, noms[0], 'left')
            const B = pointAbstrait(xB, yB, noms[1], 'right')
            const labels = labelPoint(A, B)
            const d = mediatrice(A, B)
            d.epaisseur = 2
            d.color = colorToLatexOrHTML('red')
            const N = milieu(A, B)
            const P = rotation(A, N, 90)
            const s = segmentAvecExtremites(A, B)
            const ad = codageAngleDroit(P, N, B)
            const egLongueur = codageSegments('//', bleuMathalea, A, N, N, B)

            objetsEnonce.push(s, d, ad, egLongueur, labels)
            region = 'de la droite rouge'
            texteCorr += `Le point $M$ est situé sur la médiatrice du segment $[${noms[0]}${noms[1]}]$.<br>
            Autrement dit, le point $M$ est à égale distance des points $${noms[0]}$ et $${noms[1]}$ : $${miseEnEvidence(`M${noms[0]} = M${noms[1]}`)}$.`
            content = `M${noms[0]} %{champ1} M${noms[1]}`
            objetReponse = { champ1: { value: '=' } }
            donneesAleatoires = [noms.join(''), xA, yA, xB, yB]
          }
          break
        case 'demiPlan':
          {
            const cote = choice([-1, 1])
            const xA = randint(-5, -2)
            const yA = randint(-5, -2)
            const xB = randint(2, 5)
            const yB = randint(2, 5)
            const A = pointAbstrait(xA, yA, noms[0], 'left')
            const B = pointAbstrait(xB, yB, noms[1], 'right')
            const labels = labelPoint(A, B)
            const d = mediatrice(A, B)
            const N = milieu(A, B)
            const P = rotation(A, N, 90)
            const dd = droite(N, P)
            const s = segmentAvecExtremites(A, B)
            const ad = codageAngleDroit(P, N, B)
            const egLongueur = codageSegments('//', bleuMathalea, A, N, N, B)
            const P1 = pointSurDroite(dd, 25)
            const P2 = pointSurDroite(dd, -25)
            const poly = polygone(
              P1,
              P2,
              pointAbstrait(cote * 6.5, 6),
              pointAbstrait(cote * 6.5, -6),
            )
            poly.couleurDeRemplissage = colorToLatexOrHTML('lightgray')
            objetsEnonce.push(s, d, ad, egLongueur, poly, labels)
            const proche = cote > 0 ? noms[1] : noms[0]
            const loin = cote > 0 ? noms[0] : noms[1]
            texteCorr += `Le point $M$ est situé dans le demi-plan délimité par la médiatrice du segment $[${noms[0]}${noms[1]}]$ et contenant le point $${proche}$.<br>
            Autrement dit, le point $M$ est plus proche de $${proche}$ que de $${loin}$ : $${miseEnEvidence(`M${proche} < M${loin}`)}$.`
            content = `M${proche} %{champ1} M${loin}`
            objetReponse = { champ1: { value: '<' } }
            donneesAleatoires = [cote, noms.join(''), xA, yA, xB, yB]
          }
          break
        default:
          throw new Error(
            `Type de question inconnu : ${listeTypeDeQuestions[i]}`,
          )
      }
      let texte = `$M$ est un point ${region}.<br>`
      texte +=
        nbConditions === 1
          ? 'Trouver la condition vérifiée par le point $M$.'
          : 'Trouver les deux conditions vérifiées par le point $M$.'
      texte += '<br><br>'
      if (context.isHtml && this.interactif) {
        texte += remplisLesBlancs(this, i, content, KeyboardType.clavierCompare)
        // Une ou deux cases selon la région : la question vaut toujours un point.
        handleAnswers(this, i, { bareme: toutPourUnPoint, ...objetReponse })
      }
      texte += mathalea2d(
        {
          scale: 0.5,
          xmin: -6,
          xmax: 6,
          ymin: -6,
          ymax: 6,
        },
        objetsEnonce,
      )

      if (
        this.questionJamaisPosee(
          i,
          donneesAleatoires.map((x) => String(x)).join(''),
        )
      ) {
        this.listeQuestions.push(texte)
        this.listeCorrections.push(texteCorr)
        i++
      }
    }
  }
}
