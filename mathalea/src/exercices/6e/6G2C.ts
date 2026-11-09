import { afficheCoteSegment } from '../../lib/2d/AfficheCoteSegment'
import { Arc, arc } from '../../lib/2d/Arc'
import { BoiteBuilder } from '../../lib/2d/BoiteBuilder'
import { cercle } from '../../lib/2d/cercle'
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { cordelette } from '../../lib/2d/Cordelette'
import { droite } from '../../lib/2d/droites'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { placeLatexSurSegment } from '../../lib/2d/placeLatexSurSegment'
import { PointAbstrait, pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint, texteParPosition } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { homothetie, rotation } from '../../lib/2d/transformations'
import { angleOriente } from '../../lib/2d/utilitairesGeometriques'
import {
  pointIntersectionCC,
  pointIntersectionDD,
  pointIntersectionLC,
  pointSurSegment,
} from '../../lib/2d/utilitairesPoint'
import { vide2d } from '../../lib/2d/Vide2d'
import { numAlpha } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Résoudre des problèmes mettant en jeu des distances à un point'
export const interactifReady = false

export const dateDePublication = '03/08/2025'

/**
 * Exercice tiré des documents officiels : un classique de la géométrie plane
 * @author Jean-claude Lhote

*/
export const uuid = '29c3c'

export const refs = {
  'fr-fr': ['6G2C'],
  'fr-2016': ['6G54'],
  'fr-ch': ['PRQES02C-6', '9R1ES7B-1', '9R2ES7B-1', '9R3ES7B-1'],
}
export default class ProblemeDeLaChevreDansSonEnclos extends Exercice {
  constructor() {
    super()
    this.reponseCourteDisponible = false // La réponse est une construction.
    this.comment =
      "Cet exercice n'est pas interactif, il s'agit d'un problème de géométrie plane classique à faire sur papier."
    this.nbQuestions = 1
    this.besoinFormulaireTexte = [
      'Types de question',
      "Nombres séparés par des tirets :\n1 : Cabane au coin de l'enclos\n2 : Cabane sur un côté de l'enclos\n3 : Cabane sans contact avec l'enclos\n4 : Mélange",
    ]
    this.sup = '1'
  }

  nouvelleVersion() {
    const listeTypesDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      nbQuestions: this.nbQuestions,
      min: 1,
      max: 3,
      defaut: 1,
      melange: 4,
    }).map(Number)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const longueurEnclos = randint(12, 16)
      const largeurEnclos = randint(10, longueurEnclos - 1)
      const longueurCabane = randint(4, Math.ceil(longueurEnclos / 3))
      const largeurCabane = randint(
        3,
        Math.min(Math.ceil(largeurEnclos / 3), longueurCabane - 1),
      )
      const offsetPointP = randint(1, longueurCabane - 1)
      // La corde n'intercepte jamais le bord gauche quand la cabane est collée au bord droit... Mais attention à la cabane au centre !
      const longueurCordelette = randint(
        Math.max(offsetPointP, longueurCabane - offsetPointP + 1),
        largeurEnclos - largeurCabane,
      )

      const objetsEnonce = []
      const objetsCorrection = []
      let texte = ''
      let texteCorr = ''
      const A = pointAbstrait(0, 0)
      const B = pointAbstrait(longueurEnclos, 0)
      const C = pointAbstrait(longueurEnclos, largeurEnclos)
      const D = pointAbstrait(0, largeurEnclos)
      // Les bords de l'enclos pour les intersections
      const AB = droite(A, B)
      const BC = droite(B, C)
      const CD = droite(C, D)
      const DA = droite(D, A)
      let cabA: PointAbstrait
      let cabB: PointAbstrait
      let cabC: PointAbstrait
      let cabD: PointAbstrait
      let P: PointAbstrait
      const enclos = polygone(A, B, C, D)

      switch (listeTypesDeQuestions[i]) {
        /*********************************/
        // cabane sur le côté droit
        /*********************************/
        case 2:
          {
            cabA = pointAbstrait(
              longueurEnclos,
              randint(3, largeurEnclos - largeurCabane - 1),
            )
            cabB = pointAbstrait(longueurEnclos, cabA.y + largeurCabane)
            cabD = pointAbstrait(cabA.x - longueurCabane, cabA.y)
            cabC = pointAbstrait(cabD.x, cabB.y)
            P = pointAbstrait(cabA.x - offsetPointP, cabA.y, 'P', 'above')
            // longueur additionnelle énoncé
            const hSousCabane = afficheCoteSegment(
              segment(cabA, B),
              `${cabA.y}\\,\\text{m}`,
              0.2,
              'black',
              1,
              1,
              context.isHtml ? 'gray' : 'darkgray',
              true,
            )
            objetsEnonce.push(hSousCabane)
            // On s'occupe d'abord de ce qu'il y a sous la cabane
            let I: PointAbstrait
            const J = homothetie(
              P,
              cabA,
              (offsetPointP + longueurCordelette) / offsetPointP,
            )
            const c1 = cercle(P, longueurCordelette)
            if (cabA.y >= longueurCordelette) {
              if (longueurCordelette < offsetPointP) {
                // On a un demi-cercle de centre P
                I = pointIntersectionLC(droite(cabA, cabD), c1, '', 2)
                const a1 = arc(
                  I,
                  P,
                  -Math.abs(angleOriente(I, P, J)),
                  true,
                  'pink',
                  'black',
                  0.4,
                )
                a1.couleurDesHachures = colorToLatexOrHTML('black')
                a1.hachures = 'north east lines'
                a1.opacite = 0.2
                objetsCorrection.push(a1)
              } else {
                // la corde intercepte le coté droit et comme longueurCordelette<=cabA.y, ça se trouve dans l'enclos et l'arc n'est pas intercepté par le bord de l'enclos
                I = pointIntersectionLC(droite(cabA, B), c1, '', 2)
                const a1 = arc(
                  I,
                  P,
                  -Math.abs(angleOriente(I, P, J)),
                  true,
                  'pink',
                  'black',
                  0.4,
                )
                a1.couleurDesHachures = colorToLatexOrHTML('black')
                a1.hachures = 'north east lines'
                a1.opacite = 0.2

                const t1 = polygone(I, cabA, P)
                t1.couleurDeRemplissage = colorToLatexOrHTML('pink')
                t1.opaciteDeRemplissage = 0.4
                t1.couleurDesHachures = colorToLatexOrHTML('black')
                t1.hachures = 'north east lines'
                t1.opacite = 0.2
                objetsCorrection.push(a1, t1)
              }
            } else {
              /* --------------------------------- */
              // la corde intercepte le bord bas
              /* --------------------------------- */
              if (longueurCordelette < offsetPointP) {
                // La corde d'intercepte pas le bord droit
                // On a un demi-cercle de centre P itercepté par le bord bas de l'enclos
                // On va faire : 1 triangle PMN et deux arcs IM et NJ de centre P
                I = pointIntersectionLC(droite(cabA, cabD), c1, '', 2)
                const M = pointIntersectionLC(AB, c1, '', 2)
                const N = pointIntersectionLC(AB, c1, '', 1)
                const a1 = arc(
                  I,
                  P,
                  -Math.abs(angleOriente(I, P, M)),
                  true,
                  'pink',
                  'black',
                  0.4,
                )
                a1.couleurDesHachures = colorToLatexOrHTML('black')
                a1.hachures = 'north east lines'
                a1.opacite = 0.2

                const t1 = polygone(P, M, N)
                t1.couleurDeRemplissage = colorToLatexOrHTML('pink')
                t1.opaciteDeRemplissage = 0.4
                t1.couleurDesHachures = colorToLatexOrHTML('black')
                t1.hachures = 'north east lines'
                t1.opacite = 0.2
                const a2 = arc(
                  N,
                  P,
                  -Math.abs(angleOriente(N, P, J)),
                  true,
                  'pink',
                  'black',
                  0.4,
                )
                a2.couleurDesHachures = colorToLatexOrHTML('black')
                a2.hachures = 'north east lines'
                a2.opacite = 0.2
                objetsCorrection.push(a1, t1, a2)
              } else {
                // la corde intercepte le coté droit et intercepte aussi le bord bas.
                // on va faire : t1, a1, t2, a2 ou, si le coin est à portée de cordelette, un trapèze et un arc.
                if (
                  longueurCordelette ** 2 >=
                  offsetPointP ** 2 + cabA.y ** 2
                ) {
                  // On couvre tout le coin en bas à droite par un trapèze jusqu'au point de départ de l'arc
                  // on s'occupe déja du trapèze
                  const N = pointIntersectionLC(AB, c1, '', 1)
                  I = N
                  const t1 = polygone(P, cabA, B, N)
                  t1.couleurDeRemplissage = colorToLatexOrHTML('pink')
                  t1.opaciteDeRemplissage = 0.4
                  t1.couleurDesHachures = colorToLatexOrHTML('black')
                  t1.hachures = 'north east lines'
                  t1.opacite = 0.2
                  const a2 = arc(
                    N,
                    P,
                    -Math.abs(angleOriente(N, P, J)),
                    true,
                    'pink',
                    'black',
                    0.4,
                  )
                  a2.couleurDesHachures = colorToLatexOrHTML('black')
                  a2.hachures = 'north east lines'
                  a2.opacite = 0.2
                  objetsCorrection.push(t1, a2)
                } else {
                  I = pointIntersectionLC(droite(cabA, B), c1, '', 2)
                  const M = pointIntersectionLC(AB, c1, '', 2)
                  const N = pointIntersectionLC(AB, c1, '', 1)
                  if (I.y !== cabA.y) {
                    // On peut avoir un arc tangent au bord droit, dans ce cas, pas besoin de triangle.
                    const t1 = polygone(P, cabA, I)
                    t1.couleurDeRemplissage = colorToLatexOrHTML('pink')
                    t1.opaciteDeRemplissage = 0.4
                    t1.couleurDesHachures = colorToLatexOrHTML('black')
                    t1.hachures = 'north east lines'
                    t1.opacite = 0.2
                    objetsCorrection.push(t1)
                  }
                  const a1 = arc(
                    I,
                    P,
                    -Math.abs(angleOriente(I, P, M)),
                    true,
                    'pink',
                    'black',
                    0.4,
                  )
                  a1.couleurDesHachures = colorToLatexOrHTML('black')
                  a1.hachures = 'north east lines'
                  a1.opacite = 0.2
                  const t2 = polygone(P, M, N)
                  t2.couleurDeRemplissage = colorToLatexOrHTML('pink')
                  t2.opaciteDeRemplissage = 0.4
                  t2.couleurDesHachures = colorToLatexOrHTML('black')
                  t2.hachures = 'north east lines'
                  t2.opacite = 0.2
                  const a2 = arc(
                    N,
                    P,
                    -Math.abs(angleOriente(N, P, J)),
                    true,
                    'pink',
                    'black',
                    0.4,
                  )
                  a2.couleurDesHachures = colorToLatexOrHTML('black')
                  a2.hachures = 'north east lines'
                  a2.opacite = 0.2
                  objetsCorrection.push(a1, t2, a2)
                }
              }
            }
            const r1Mes = afficheCoteSegment(
              segment(P, I),
              `${longueurCordelette}\\,\\text{m}`,
              0,
              'black',
              0.5,
              0.5,
              context.isHtml ? 'gray' : 'darkgray',
              true,
            )
            // const r1Mes = placeLatexSurSegment(`${longueurCordelette}\\text{ m}`, P, I, { distance: 0.3 })
            objetsCorrection.push(r1Mes)
            /* --------------------------------------------------- */
            // fin de la partie 'sous-cabane' on attaque la partie commençant à J qui ne peut pas intercepter le bord gauche (ouf !)
            /* --------------------------------------------------- */
            const longueurRestante1 =
              longueurCordelette - (longueurCabane - offsetPointP)
            const diff = afficheCoteSegment(
              segment(P, cabD),
              `${longueurCabane - offsetPointP}\\,\\text{m}`,
              0.5,
              'black',
              1,
              0.5,
              'black',
            )
            if (longueurRestante1 + cabA.y > largeurEnclos) {
              /* ------------------------------------ */
              // Le quart de cercle intercepte le bord haut de l'enclos : on a arc puis triangle puis arc
              /* ------------------------------------ */
              const c2 = cercle(cabD, longueurRestante1)
              const M = pointIntersectionLC(CD, c2, '', 1)
              const l1 = afficheCoteSegment(
                segment(cabD, M),
                `${longueurRestante1}\\,\\text{m}`,
                0,
                'black',
                0.5,
                0.5,
                context.isHtml ? 'gray' : 'darkgray',
                true,
              )
              const a1 = arc(
                J,
                cabD,
                angleOriente(J, cabD, M),
                true,
                'pink',
                'black',
                0.3,
              )
              a1.couleurDesHachures = colorToLatexOrHTML('black')
              a1.hachures = 'north east lines'
              a1.opacite = 0.2

              const K = pointIntersectionDD(droite(cabC, cabD), CD)
              const t1 = polygone(M, cabD, K)
              t1.couleurDeRemplissage = colorToLatexOrHTML('pink')
              t1.opaciteDeRemplissage = 0.3
              t1.couleurDesHachures = colorToLatexOrHTML('black')
              t1.hachures = 'north east lines'
              t1.opacite = 0.2
              const longueurRestante2 = longueurRestante1 - largeurCabane
              if (
                longueurRestante2 ** 2 >=
                longueurCabane ** 2 + (largeurEnclos - cabB.y) ** 2
              ) {
                // La corde permet d'aller jusqu'au coin haut droit de l'enclos
                // on dessine un rectangle
                const r1 = polygone(K, C, cabB, cabC)
                r1.couleurDeRemplissage = colorToLatexOrHTML('pink')
                r1.opaciteDeRemplissage = 0.2
                r1.couleurDesHachures = colorToLatexOrHTML('black')
                r1.hachures = 'north east lines'
                r1.opacite = 0.2
                objetsCorrection.push(r1)
              } else {
                // on n'atteint pas le coin, mais peut-être le bord droit !
                // tout d'abord le triangle
                const c2 = cercle(cabC, longueurRestante2)
                const N = pointIntersectionLC(CD, c2, '', 2)
                const t3 = polygone(K, N, cabC)
                /* const X = homothetie(
                  rotation(K, cabC, -45),
                  cabC,
                  longueurRestante2 / longueur(cabC, K),
                )
                 const l2 = afficheCoteSegment(
                  segment(cabC, X),
                  `${longueurRestante2}\\,\\text{m}`,
                  0,
                  'black',
                  1,
                  0.5,
                  context.isHtml ? 'gray' : 'darkgray',
                  true,
                )
                  */
                t3.couleurDeRemplissage = colorToLatexOrHTML('pink')
                t3.opaciteDeRemplissage = 0.2
                t3.couleurDesHachures = colorToLatexOrHTML('black')
                t3.hachures = 'north east lines'
                t3.opacite = 0.2
                objetsCorrection.push(t3 /* , l2 */)
                if (longueurRestante2 > longueurCabane) {
                  // Le bord droit bloque : triangle + arc + triangle
                  const X = pointIntersectionLC(BC, c2, '', 1)
                  const a3 = arc(
                    N,
                    cabC,
                    angleOriente(N, cabC, X),
                    true,
                    'pink',
                    'black',
                    0.2,
                  )
                  a3.couleurDesHachures = colorToLatexOrHTML('black')
                  a3.hachures = 'north east lines'
                  a3.opacite = 0.2
                  const t4 = polygone(X, cabC, cabB)
                  t4.couleurDeRemplissage = colorToLatexOrHTML('pink')
                  t4.opaciteDeRemplissage = 0.2
                  t4.couleurDesHachures = colorToLatexOrHTML('black')
                  t4.hachures = 'north east lines'
                  t4.opacite = 0.2
                  objetsCorrection.push(a3, t4)
                } else {
                  // On n'atteint pas le bord droit : triangle + arc
                  const a3 = arc(
                    N,
                    cabC,
                    angleOriente(N, cabC, cabB),
                    true,
                    'pink',
                    'black',
                    0.2,
                  )
                  a3.couleurDesHachures = colorToLatexOrHTML('black')
                  a3.hachures = 'north east lines'
                  a3.opacite = 0.2
                  objetsCorrection.push(a3)
                }
              }
              objetsCorrection.push(a1, t1, l1)
            } else {
              // Pas de contact avec bord haut, le quart de cercle est complet et ensuite on a un autre quart de cercle
              const quartDeC2 = arc(J, cabD, -90, true, 'pink', 'black', 0.3)
              quartDeC2.hachures = 'north east lines'
              quartDeC2.couleurDesHachures = colorToLatexOrHTML('black')
              quartDeC2.opacite = 0.2
              const Z = rotation(J, cabD, -45)
              const r2 = afficheCoteSegment(
                segment(cabD, Z),
                `${longueurRestante1}\\,\\text{m}`,
                0,
                'black',
                0.5,
                0.5,
                context.isHtml ? 'gray' : 'darkgray',
                true,
              )
              objetsCorrection.push(quartDeC2, r2, diff)
              if (longueurRestante1 > largeurCabane) {
                const longueurRestante2 = longueurRestante1 - largeurCabane
                if (longueurRestante2 > longueurCabane) {
                  // le bord droit bloque : on a un arc jusqu'au bord puis un triangle
                  const c2 = cercle(cabC, longueurRestante2)
                  const N = pointIntersectionLC(BC, c2, '', 1)
                  const a2 = arc(
                    N,
                    cabC,
                    angleOriente(N, cabC, rotation(cabB, cabC, 90)),
                    true,
                    'pink',
                    'black',
                    0.1,
                  )
                  a2.couleurDesHachures = colorToLatexOrHTML('black')
                  a2.opaciteDeRemplissage = 0.1
                  a2.hachures = 'north east lines'
                  a2.opacite = 0.1
                  objetsCorrection.push(a2)
                  const t2 = polygone(N, cabC, cabB)
                  t2.couleurDeRemplissage = colorToLatexOrHTML('pink')
                  t2.opaciteDeRemplissage = 0.2
                  t2.couleurDesHachures = colorToLatexOrHTML('black')
                  t2.hachures = 'north east lines'
                  t2.opacite = 0.2
                  objetsCorrection.push(t2, a2)
                } else {
                  const K = rotation(J, cabD, -90)
                  const quartDeC3 = arc(
                    K,
                    cabC,
                    -90,
                    true,
                    'pink',
                    'black',
                    0.2,
                  )
                  quartDeC3.hachures = 'north east lines'
                  quartDeC3.couleurDesHachures = colorToLatexOrHTML('black')
                  quartDeC3.opacite = 0.2
                  const W = rotation(K, cabC, -45)
                  const r3 = afficheCoteSegment(
                    segment(cabC, W),
                    `${longueurRestante2}\\,\\text{m}`,
                    0,
                    'black',
                    0.5,
                    0.5,
                    context.isHtml ? 'gray' : 'darkgray',
                    true,
                  )
                  objetsCorrection.push(quartDeC3, r3)
                }
              }
            }
          }
          break
        case 3:
          /*********************************/
          // cabane au centre
          /*********************************/
          {
            cabA = pointAbstrait(
              randint(
                Math.ceil(longueurEnclos / 3) + longueurCabane,
                longueurEnclos - 2,
              ),
              randint(
                Math.max(2, Math.floor(largeurEnclos / 2 - largeurCabane / 2)),
                Math.min(
                  largeurEnclos - largeurCabane - 2,
                  Math.floor(largeurEnclos / 2 + largeurCabane / 2),
                ),
              ),
            )
            cabB = pointAbstrait(cabA.x, cabA.y + largeurCabane)
            cabD = pointAbstrait(cabA.x - longueurCabane, cabA.y)
            cabC = pointAbstrait(cabD.x, cabB.y)
            P = pointAbstrait(cabA.x - offsetPointP, cabA.y, 'P', 'above')
            const hSousCabane = afficheCoteSegment(
              segment(cabA, pointAbstrait(cabA.x, 0)),
              `${cabA.y}\\,\\text{m}`,
              0.2,
              'darkgray',
              1,
              1,
              context.isHtml ? 'gray' : 'darkgray',
              true,
            )
            const offsetCabane = afficheCoteSegment(
              segment(pointAbstrait(0, cabC.y), cabC),
              `${cabC.x}\\,\\text{m}`,
              0.2,
              'darkgray',
              1,
              1,
              context.isHtml ? 'gray' : 'darkgray',
              true,
            )
            objetsEnonce.push(hSousCabane, offsetCabane)
            // On détermine s'il y a des intersections
            const longueurRestanteDroite = longueurCordelette - offsetPointP
            const longueurRestanteGauche =
              longueurCordelette - (longueurCabane - offsetPointP)
            const longueurRestanteHautDroite =
              longueurRestanteDroite - largeurCabane
            const longueurRestanteHautGauche =
              longueurRestanteGauche - largeurCabane

            const isTouchAB = longueurCordelette > cabA.y
            const isTouchCDByLeft =
              cabD.y + longueurRestanteGauche > largeurEnclos
            const isTouchCDByRight =
              cabA.y + longueurRestanteDroite > largeurEnclos
            // On commence par le dessous de la cabane
            let M: PointAbstrait
            let N: PointAbstrait
            let I: PointAbstrait
            let J: PointAbstrait
            const c1 = cercle(P, longueurCordelette)
            if (isTouchAB) {
              // On commence par ajouter le triangle bas
              M = pointIntersectionLC(AB, c1, '', 1)
              if (M.x < 0) M = A
              N = pointIntersectionLC(AB, c1, '', 2)
              if (N.x > longueurEnclos) N = B
              const t1 = polygone(P, M, N)
              t1.couleurDeRemplissage = colorToLatexOrHTML('pink')
              t1.opaciteDeRemplissage = 0.4
              t1.couleurDesHachures = colorToLatexOrHTML('black')
              t1.hachures = 'north east lines'
              const r1 = afficheCoteSegment(
                segment(P, M),
                `${longueurCordelette}\\,\\text{m}`,
                0,
                'black',
                0.5,
                0.5,
                context.isHtml ? 'gray' : 'darkgray',
                true,
              )
              const r2 = afficheCoteSegment(
                segment(P, N),
                `${longueurCordelette}\\,\\text{m}`,
                0,
                'black',
                0.5,
                0.5,
                context.isHtml ? 'gray' : 'darkgray',
                true,
              )
              objetsCorrection.push(t1, r1, r2)
              // arc gauche
              const X = pointAbstrait(0, cabA.y)
              if (P.x - longueurCordelette < 0 && M.x > 0) {
                // contact à gauche
                J = pointIntersectionLC(DA, c1, '', 2)
              } else {
                J = X
              }
              const a1 =
                Math.abs(M.x) < 0.01
                  ? polygone(M, P, J)
                  : arc(M, P, angleOriente(M, P, J), true)
              a1.opaciteDeRemplissage = 0.4
              a1.couleurDeRemplissage = colorToLatexOrHTML('pink')
              a1.couleurDesHachures = colorToLatexOrHTML('black')
              a1.hachures = 'north east lines'
              a1.opacite = 0.2
              if (J.y < cabA.y) {
                // On a dessiné un arc, mais il reste un triangle à faire
                const t2 = polygone(P, J, X)
                t2.couleurDeRemplissage = colorToLatexOrHTML('pink')
                t2.opaciteDeRemplissage = 0.4
                t2.couleurDesHachures = colorToLatexOrHTML('black')
                t2.hachures = 'north east lines'
                t2.opacite = 0.2
                const r2 = afficheCoteSegment(
                  segment(cabD, X),
                  `${cabD.x}\\,\\text{m}`,
                  0,
                  'black',
                  0.5,
                  0.5,
                  context.isHtml ? 'gray' : 'darkgray',
                  true,
                )
                objetsCorrection.push(t2, r2)
              }
              // arc droit
              if (
                P.x + longueurCordelette > longueurEnclos &&
                N.x < longueurEnclos
              ) {
                // il y a contact avec la droite
                I = pointIntersectionLC(BC, c1, '', 2)
              } else {
                I = pointAbstrait(
                  Math.min(longueurEnclos, P.x + longueurCordelette),
                  cabA.y,
                )
              }
              const a2 =
                N.x === longueurEnclos
                  ? polygone(N, P, I)
                  : arc(N, P, angleOriente(N, P, I), true)
              a2.opaciteDeRemplissage = 0.4
              a2.couleurDeRemplissage = colorToLatexOrHTML('pink')
              a2.couleurDesHachures = colorToLatexOrHTML('black')
              a2.hachures = 'north east lines'
              a2.opacite = 0.2
              objetsCorrection.push(a1, a2)
            } else {
              // On ne touche pas le fond, on dessine un arc
              const X = pointAbstrait(P.x, P.y - longueurCordelette)
              if (P.x + longueurCordelette >= longueurEnclos) {
                // il y a contact avec la droite
                I = pointIntersectionLC(BC, c1, '', 2)
              } else {
                I = pointAbstrait(P.x + longueurCordelette, cabA.y)
              }
              if (P.x - longueurCordelette < 0) {
                // il y a contact avec la gauche
                J = pointIntersectionLC(DA, c1, '', 2)
              } else {
                J = pointAbstrait(P.x - longueurCordelette, cabA.y)
              }
              const r1 = afficheCoteSegment(
                segment(P, X),
                `${longueurCordelette}\\,\\text{m}`,
                0,
                'black',
                0.5,
                0.5,
                context.isHtml ? 'gray' : 'darkgray',
                true,
              )
              const r2 =
                longueurRestanteDroite === 0
                  ? vide2d()
                  : afficheCoteSegment(
                      segment(cabA, I),
                      `${longueurRestanteDroite}\\,\\text{m}`,
                      0,
                      'black',
                      0.5,
                      -0.5,
                      context.isHtml ? 'gray' : 'darkgray',
                      true,
                    )

              const r3 =
                longueurRestanteGauche === 0
                  ? vide2d()
                  : afficheCoteSegment(
                      segment(cabD, J),
                      `${longueurRestanteGauche}\\,\\text{m}`,
                      0,
                      'black',
                      0.5,
                      0.5,
                      context.isHtml ? 'gray' : 'darkgray',
                      true,
                    )
              const a1 = arc(
                I,
                P,
                -Math.abs(angleOriente(I, P, J)),
                true,
                'pink',
                'black',
                0.4,
              )
              a1.couleurDesHachures = colorToLatexOrHTML('black')
              a1.hachures = 'north east lines'
              a1.opacite = 0.2
              objetsCorrection.push(a1, r1, r2, r3)
            }
            if (I.y < cabA.y) {
              // on a dessiné un arc jusqu'au bord droit mais il reste un triangle à faire
              const t2 = polygone(I, P, pointAbstrait(longueurEnclos, cabA.y))
              t2.couleurDeRemplissage = colorToLatexOrHTML('pink')
              t2.opaciteDeRemplissage = 0.4
              t2.couleurDesHachures = colorToLatexOrHTML('black')
              t2.hachures = 'north east lines'
              t2.opacite = 0.2
              objetsCorrection.push(t2)
            }
            // **********************************************
            // On s'occupe de la partie à droite de la cabane
            const c2 = cercle(cabA, longueurRestanteDroite)
            const SDroit = pointIntersectionLC(droite(cabA, cabB), c2, '', 1)
            let TDroit: PointAbstrait
            let a2: Arc

            if (!isTouchCDByRight) {
              // On ne touche pas le haut, on peut tracer un arc jusqu'à la veticale du bord droit de la cabane
              TDroit = cabB // C'est juste pour éviter de faire des tests de nullité, il ne sera pas utilisé si on ne touche pas le haut
              if (P.x + longueurCordelette <= longueurEnclos) {
                const extremiteDroite = pointAbstrait(
                  P.x + longueurCordelette,
                  cabA.y,
                )
                a2 = arc(
                  extremiteDroite,
                  cabA,
                  angleOriente(extremiteDroite, cabA, SDroit),
                  true,
                  'pink',
                  'black',
                  0.3,
                )
              } else {
                let T = pointIntersectionLC(BC, c2, '', 1)
                if (T.y > largeurEnclos) T = C // ça ne devrait pas arriver vu qu'on n'est pas censé toucher le bord haut
                const t2 = polygone(
                  pointAbstrait(longueurEnclos, cabA.y),
                  cabA,
                  T,
                )
                t2.couleurDeRemplissage = colorToLatexOrHTML('pink')
                t2.opaciteDeRemplissage = 0.3
                t2.couleurDesHachures = colorToLatexOrHTML('black')
                t2.hachures = 'north east lines'
                t2.opacite = 0.2
                objetsCorrection.push(t2)
                const r1 = afficheCoteSegment(
                  segment(cabA, pointAbstrait(longueurEnclos, cabA.y)),
                  `${longueurEnclos - cabA.x}\\,\\text{m}`,
                  0,
                  'black',
                  0.5,
                  -0.5,
                  context.isHtml ? 'gray' : 'darkgray',
                  true,
                )
                const r2 = afficheCoteSegment(
                  segment(cabA, T),
                  `${longueurRestanteDroite}\\,\\text{m}`,
                  0,
                  'black',
                  0.5,
                  -0.5,
                  context.isHtml ? 'gray' : 'darkgray',
                  true,
                )
                a2 = arc(
                  T,
                  cabA,
                  angleOriente(T, cabA, SDroit),
                  true,
                  'pink',
                  'black',
                  0.3,
                )
                if (longueurRestanteHautDroite > 0) {
                  const r3 = afficheCoteSegment(
                    segment(
                      cabB,
                      pointAbstrait(
                        cabB.x,
                        cabC.y + longueurRestanteHautDroite,
                      ),
                    ),
                    `${longueurRestanteHautDroite}\\,\\text{m}`,
                    0,
                    'black',
                    0.5,
                    -0.7,
                    context.isHtml ? 'gray' : 'darkgray',
                    true,
                  )
                  objetsCorrection.push(r3)
                }
                objetsCorrection.push(r1, r2)
              }
              a2.couleurDesHachures = colorToLatexOrHTML('black')
              a2.hachures = 'north east lines'
              a2.opacite = 0.2

              objetsCorrection.push(a2)
            } else {
              // Là on va toucher en haut on doit donc s'arrêter avant de depasser le bord haut de l'enclos
              const U = pointIntersectionLC(CD, c2, '', 2)
              TDroit = pointAbstrait(cabA.x, largeurEnclos)
              const r1 = afficheCoteSegment(
                segment(cabA, pointAbstrait(longueurEnclos, cabA.y)),
                `${longueurEnclos - cabA.x}\\,\\text{m}`,
                0,
                'black',
                0.5,
                -0.5,
                context.isHtml ? 'gray' : 'darkgray',
                true,
              )
              if (U.x - longueurEnclos >= 0) {
                // le contact a lieu à droite de l'enclos on doit donc tracer un trapèze
                const t3 = polygone(
                  cabA,
                  pointAbstrait(longueurEnclos, cabA.y),
                  C,
                  TDroit,
                )
                t3.couleurDeRemplissage = colorToLatexOrHTML('pink')
                t3.opaciteDeRemplissage = 0.3
                t3.couleurDesHachures = colorToLatexOrHTML('black')
                t3.hachures = 'north east lines'
                t3.opacite = 0.2
                objetsCorrection.push(t3)
              } else {
                // contact haut et droite, le coin C est inaccessible on trace un arc entre 2 triangles
                if (P.x + longueurCordelette > longueurEnclos) {
                  let T = pointIntersectionLC(BC, c2, '', 1)
                  if (T.y > largeurEnclos) T = C // ça ne devrait pas arriver
                  const t3 = polygone(
                    cabA,
                    pointAbstrait(longueurEnclos, cabA.y),
                    T,
                  )
                  const t4 = polygone(cabA, U, TDroit)
                  a2 = arc(
                    T,
                    cabA,
                    angleOriente(T, cabA, U),
                    true,
                    'pink',
                    'black',
                    0.3,
                  )
                  ;[t3, a2, t4].forEach((obj) => {
                    obj.couleurDeRemplissage = colorToLatexOrHTML('pink')
                    obj.opaciteDeRemplissage = 0.3
                    obj.couleurDesHachures = colorToLatexOrHTML('black')
                    obj.hachures = 'north east lines'
                    obj.opacite = 0.2
                  })
                  objetsCorrection.push(t3, a2, t4)
                }
              }
              objetsCorrection.push(r1)
            }
            // **********************************************
            // On s'occupe de la partie à gauche de la cabane
            const c3 = cercle(cabD, longueurRestanteGauche)
            const SGauche = pointIntersectionLC(droite(cabC, cabD), c3, '', 1)
            let TGauche: PointAbstrait
            let a3: Arc
            if (!isTouchCDByLeft) {
              // On ne touche pas le haut, on peut tracer un arc jusqu'à la veticale du bord gauche de la cabane
              TGauche = cabD // C'est juste pour éviter de faire des tests de nullité, il ne sera pas utilisé si on ne touche pas le haut
              if (P.x - longueurCordelette >= 0) {
                const extremiteGauche = pointAbstrait(
                  P.x - longueurCordelette,
                  cabA.y,
                )
                a3 = arc(
                  extremiteGauche,
                  cabD,
                  angleOriente(extremiteGauche, cabD, SGauche),
                  true,
                  'pink',
                  'black',
                  0.3,
                )
                const r1 = afficheCoteSegment(
                  segment(cabD, extremiteGauche),
                  `${longueurRestanteGauche}\\,\\text{m}`,
                  0,
                  'black',
                  0.5,
                  0.5,
                  context.isHtml ? 'gray' : 'darkgray',
                  true,
                )
                objetsCorrection.push(r1)
              } else {
                let T = pointIntersectionLC(DA, c3, '', 1)
                const r1 = afficheCoteSegment(
                  segment(cabD, T),
                  `${longueurRestanteGauche}\\,\\text{m}`,
                  0,
                  'black',
                  0.5,
                  -0.5,
                  context.isHtml ? 'gray' : 'darkgray',
                  true,
                )
                const r2 = afficheCoteSegment(
                  segment(
                    cabC,
                    pointAbstrait(cabC.x, cabD.y + longueurRestanteGauche),
                  ),
                  `${longueurRestanteHautGauche}\\,\\text{m}`,
                  0,
                  'black',
                  0.5,
                  0.5,
                  context.isHtml ? 'gray' : 'darkgray',
                  true,
                )
                if (T.y > largeurEnclos) T = D // ça ne devrait pas arriver vu qu'on n'est pas censé toucher le bord haut
                const t2 = polygone(pointAbstrait(0, cabA.y), cabD, T)
                t2.couleurDeRemplissage = colorToLatexOrHTML('pink')
                t2.opaciteDeRemplissage = 0.3
                t2.couleurDesHachures = colorToLatexOrHTML('black')
                t2.hachures = 'north east lines'
                t2.opacite = 0.2
                objetsCorrection.push(t2, r1, r2)
                a3 = arc(
                  T,
                  cabD,
                  angleOriente(T, cabD, SGauche),
                  true,
                  'pink',
                  'black',
                  0.3,
                )
              }
              a3.couleurDesHachures = colorToLatexOrHTML('black')
              a3.hachures = 'north east lines'
              a3.opacite = 0.2

              objetsCorrection.push(a3)
            } else {
              // Là on va toucher en haut on doit donc s'arrêter avant de depasser le bord haut de l'enclos
              const U = pointIntersectionLC(CD, c3, '', 1)
              TGauche = pointAbstrait(cabD.x, largeurEnclos)
              const r2 = afficheCoteSegment(
                segment(TGauche, cabC),
                `${largeurEnclos - cabC.y}\\,\\text{m}`,
                -0.2,
                'black',
                0.5,
                -0.7,
                context.isHtml ? 'gray' : 'darkgray',
                true,
              )
              objetsCorrection.push(r2)
              if (U.x <= 0) {
                // le contact a lieu à gauche de l'enclos on doit donc tracer un trapèze
                const t3 = polygone(
                  cabD,
                  pointAbstrait(0, cabA.y),
                  D,
                  pointAbstrait(cabD.x, largeurEnclos),
                )
                t3.couleurDeRemplissage = colorToLatexOrHTML('pink')
                t3.opaciteDeRemplissage = 0.3
                t3.couleurDesHachures = colorToLatexOrHTML('black')
                t3.hachures = 'north east lines'
                t3.opacite = 0.2
                objetsCorrection.push(t3)
              } else {
                // contact haut avec le coin inaccessible : on cherche on trace un arc entre 2 triangles
                let T: PointAbstrait
                if (P.x - longueurCordelette <= 0) {
                  // On touche à gauche
                  T = pointIntersectionLC(DA, c3, '', 1)
                  if (T.y > largeurEnclos) T = D // ça ne devrait pas arriver vu qu'on n'est pas censé toucher le bord haut
                  if (T.y > cabD.y) {
                    const t3 = polygone(cabD, pointAbstrait(0, cabA.y), T)
                    t3.couleurDeRemplissage = colorToLatexOrHTML('pink')
                    t3.opaciteDeRemplissage = 0.3
                    t3.couleurDesHachures = colorToLatexOrHTML('black')
                    t3.hachures = 'north east lines'
                    t3.opacite = 0.2
                    objetsCorrection.push(t3)
                  }
                } else {
                  // On ne touche pas à gauche}
                  T = pointAbstrait(cabD.x - longueurRestanteGauche, cabD.y)
                }
                const t4 = polygone(cabD, U, TGauche)
                const r2 = afficheCoteSegment(
                  segment(cabD, U),
                  `${longueurRestanteGauche}\\,\\text{m}`,
                  0,
                  'black',
                  0.5,
                  0.5,
                  context.isHtml ? 'gray' : 'darkgray',
                  true,
                )
                a3 = arc(
                  T,
                  cabD,
                  angleOriente(T, cabD, U),
                  true,
                  'pink',
                  'black',
                  0.3,
                )
                ;[a3, t4].forEach((obj) => {
                  obj.couleurDeRemplissage = colorToLatexOrHTML('pink')
                  obj.opaciteDeRemplissage = 0.3
                  obj.couleurDesHachures = colorToLatexOrHTML('black')
                  obj.hachures = 'north east lines'
                  obj.opacite = 0.2
                })
                objetsCorrection.push(a3, t4, r2)
              }
            }
            // **********************************************
            // On s'occupe de la partie au-dessus de la cabane
            if (
              longueurRestanteHautDroite <= 0 &&
              longueurRestanteHautGauche <= 0
            ) {
              break // Il n'y a pas de cordelette au-dessus de la cabane
            }
            let VGauche: PointAbstrait | undefined
            let VDroite: PointAbstrait | undefined

            const c5 = cercle(cabB, Math.max(longueurRestanteHautDroite, 0))
            const c6 = cercle(cabC, Math.max(longueurRestanteHautGauche, 0))
            if (
              longueurRestanteHautDroite + longueurRestanteHautGauche >=
              cabB.x - cabC.x
            ) {
              // Il y a contact entre les deux arcs

              const contact = pointIntersectionCC(c5, c6, '', 1)
              if (isTouchCDByRight) {
                VDroite = pointIntersectionLC(CD, c5, '', 1)
              } else {
                VDroite = SDroit
              }
              if (isTouchCDByLeft) {
                VGauche = pointIntersectionLC(CD, c6, '', 2)
              } else {
                VGauche = SGauche
              }

              if (contact && contact.y < largeurEnclos) {
                // PointAbstrait de contact en dessous du bord haut de l'enclos et au-dessus de la cabane
                if (TDroit.y === largeurEnclos && TDroit.x !== VDroite.x) {
                  const t6 = polygone(cabB, TDroit, VDroite)
                  t6.couleurDeRemplissage = colorToLatexOrHTML('pink')
                  t6.opaciteDeRemplissage = 0.3
                  t6.couleurDesHachures = colorToLatexOrHTML('black')
                  t6.hachures = 'north east lines'
                  t6.opacite = 0.3
                  objetsCorrection.push(t6)
                }
                if (TGauche.y === largeurEnclos && TGauche.x !== VGauche.x) {
                  const t7 = polygone(cabC, TGauche, VGauche)
                  t7.couleurDeRemplissage = colorToLatexOrHTML('pink')
                  t7.opaciteDeRemplissage = 0.3
                  t7.couleurDesHachures = colorToLatexOrHTML('black')
                  t7.hachures = 'north east lines'
                  t7.opacite = 0.3
                  objetsCorrection.push(t7)
                }
                if (contact.y > cabB.y) {
                  const t7 = polygone(cabB, cabC, contact)
                  t7.couleurDeRemplissage = colorToLatexOrHTML('pink')
                  t7.opaciteDeRemplissage = 0.3
                  t7.couleurDesHachures = colorToLatexOrHTML('black')
                  t7.hachures = 'north east lines'
                  t7.opacite = 0.2
                  objetsCorrection.push(t7)
                }
                const a4 = arc(
                  contact,
                  cabB,
                  angleOriente(contact, cabB, VDroite),
                  true,
                  'pink',
                  'black',
                  0.3,
                )
                a4.couleurDesHachures = colorToLatexOrHTML('black')
                a4.hachures = 'north east lines'
                a4.opacite = 0.3
                const a5 = arc(
                  contact,
                  cabC,
                  angleOriente(contact, cabC, VGauche),
                  true,
                  'pink',
                  'black',
                  0.3,
                )
                a5.couleurDesHachures = colorToLatexOrHTML('black')
                a5.hachures = 'north east lines'
                a5.opacite = 0.3
                objetsCorrection.push(a5, a4)
              } else if (contact && contact.y >= largeurEnclos) {
                // On trace un rectangle car les deux arcs se croisent au-dessus de l'enclos
                const t8 = polygone(
                  cabB,
                  pointAbstrait(cabB.x, largeurEnclos),
                  pointAbstrait(cabC.x, largeurEnclos),
                  cabC,
                )
                t8.couleurDeRemplissage = colorToLatexOrHTML('pink')
                t8.opaciteDeRemplissage = 0.2
                t8.couleurDesHachures = colorToLatexOrHTML('black')
                t8.hachures = 'north east lines'
                t8.opacite = 0.2
                objetsCorrection.push(t8)
              }
            } else {
              // la cordelette ne permet pas de faire se toucher les deux arcs
              // on trace séparément les deux arcs, parce qu'ils peuvent potentiellement ne pas exister
              if (longueurRestanteHautDroite > 0) {
                if (isTouchCDByRight) {
                  VDroite = pointIntersectionLC(CD, c5, '', 1)
                } else {
                  VDroite = SDroit
                }
                const finDroite = pointIntersectionLC(
                  droite(cabB, cabC),
                  c5,
                  '',
                  1,
                )
                const a4 = arc(
                  VDroite,
                  cabB,
                  angleOriente(VDroite, cabB, finDroite),
                  true,
                  'pink',
                  'black',
                  0.3,
                )
                a4.couleurDesHachures = colorToLatexOrHTML('black')
                a4.hachures = 'north east lines'
                a4.opacite = 0.2
                const a6 =
                  VDroite.x === cabB.x
                    ? vide2d()
                    : polygone(
                        cabB,
                        VDroite,
                        pointAbstrait(cabB.x, largeurEnclos),
                      )
                a6.couleurDeRemplissage = colorToLatexOrHTML('pink')
                a6.opaciteDeRemplissage = 0.3
                a6.couleurDesHachures = colorToLatexOrHTML('black')
                a6.hachures = 'north east lines'
                a6.opacite = 0.3
                objetsCorrection.push(a4, a6)
              }
              if (longueurRestanteHautGauche > 0) {
                if (isTouchCDByLeft) {
                  VGauche = pointIntersectionLC(CD, c6, '', 2)
                } else {
                  VGauche = SGauche
                }
                const finGauche = pointIntersectionLC(
                  droite(cabB, cabC),
                  c6,
                  '',
                  2,
                )
                const a5 = arc(
                  VGauche,
                  cabC,
                  angleOriente(VGauche, cabC, finGauche),
                  true,
                  'pink',
                  'black',
                  0.3,
                )
                a5.couleurDesHachures = colorToLatexOrHTML('black')
                a5.hachures = 'north east lines'
                a5.opacite = 0.2
                const a7 =
                  cabC.x === VGauche.x
                    ? vide2d()
                    : polygone(
                        cabC,
                        VGauche,
                        pointAbstrait(cabC.x, largeurEnclos),
                      )
                a7.couleurDeRemplissage = colorToLatexOrHTML('pink')
                a7.opaciteDeRemplissage = 0.3
                a7.couleurDesHachures = colorToLatexOrHTML('black')
                a7.hachures = 'north east lines'
                a7.opacite = 0.3
                objetsCorrection.push(a5, a7)
              }
            }
          }
          break
        case 1:
        default:
          /*********************************/
          // cabane en haut à droite
          /*********************************/
          {
            // éléments communs énoncé et correction
            cabA = pointAbstrait(longueurEnclos, largeurEnclos - largeurCabane)
            cabB = C
            cabC = pointAbstrait(longueurEnclos - longueurCabane, largeurEnclos)
            cabD = pointAbstrait(
              longueurEnclos - longueurCabane,
              largeurEnclos - largeurCabane,
            )
            P = pointAbstrait(
              longueurEnclos - offsetPointP,
              largeurEnclos - largeurCabane,
              'P',
              'above',
            )

            // éléments correction
            const c1 = cercle(P, longueurCordelette)
            const I = pointIntersectionLC(droite(B, C), c1, '', 2)
            const r1Mes =
              I.y === P.y
                ? vide2d()
                : placeLatexSurSegment(
                    `${longueurCordelette}\\text{ m}`,
                    P,
                    I,
                    {
                      distance: -0.7,
                      horizontal: true,
                      letterSize: 'normalsize',
                    },
                  )
            const J = homothetie(
              P,
              cabA,
              (offsetPointP + longueurCordelette) / offsetPointP,
            )
            const t1 = polygone(I, cabA, P)
            t1.couleurDeRemplissage = colorToLatexOrHTML('pink')
            t1.opaciteDeRemplissage = 0.4
            t1.couleurDesHachures = colorToLatexOrHTML('black')
            t1.hachures = 'north east lines'
            const a1 = arc(
              I,
              P,
              -Math.abs(angleOriente(I, P, J)),
              true,
              'pink',
              'black',
              0.4,
            )
            a1.couleurDesHachures = colorToLatexOrHTML('black')
            a1.hachures = 'north east lines'

            const diff = afficheCoteSegment(
              segment(P, cabD),
              `${longueurCabane - offsetPointP}\\,\\text{m}`,
              0.5,
              'black',
              1,
              0.5,
              'black',
            )
            const longRestante =
              longueurCordelette - (longueurCabane - offsetPointP)
            a1.opacite = 0.2
            t1.opacite = 0.2
            objetsCorrection.push(a1, r1Mes, t1)
            if (longRestante < largeurCabane) {
              const quartDeC2 = arc(J, cabD, -90, true, 'pink', 'black', 0.2)
              quartDeC2.hachures = 'north east lines'
              quartDeC2.couleurDesHachures = colorToLatexOrHTML('black')
              quartDeC2.opacite = 0.2
              const r2 = placeLatexSurSegment(
                `${longRestante}\\,\\text{m}`,
                cabD,
                rotation(J, cabD, -90),
                { distance: 0.7, horizontal: true, letterSize: 'normalsize' },
              )

              objetsCorrection.push(quartDeC2, r2, diff)
            } else {
              const c2 = cercle(cabD, longRestante)
              const K = pointIntersectionLC(droite(C, D), c2, '', 1)
              const a2 = arc(
                J,
                cabD,
                -Math.abs(angleOriente(J, cabD, K)),
                true,
                'pink',
                'black',
                0.2,
              )
              a2.couleurDesHachures = colorToLatexOrHTML('black')
              a2.hachures = 'north east lines'
              const t2 = polygone(cabD, cabC, K)
              t2.couleurDeRemplissage = colorToLatexOrHTML('pink')
              t2.opaciteDeRemplissage = 0.2
              t2.couleurDesHachures = colorToLatexOrHTML('black')
              t2.hachures = 'north east lines'
              const r2 = placeLatexSurSegment(
                `${longRestante}\\,\\text{m}`,
                cabD,
                K,
                { distance: 0.7, horizontal: true, letterSize: 'normalsize' },
              )
              t2.opacite = 0.2
              a2.opacite = 0.2
              objetsCorrection.push(a2, t2, r2, diff)
            }
          }
          break
      }
      // objets communs à tous les types de questions
      const indicEnclos = new BoiteBuilder({
        xMin: 1,
        xMax: 4,
        yMin: largeurEnclos,
        yMax: largeurEnclos + 1.2,
      })
      indicEnclos.addColor({
        colorBackground: 'darkgray',
        color: 'black',
        opacity: 1,
        backgroudOpacity: 0.2,
      })
      indicEnclos.addTextIn({
        textIn: 'Enclos',
        color: 'black',
        opacity: 0.8,
        size: 1,
      })
      const cabane = polygone(cabA, cabB, cabC, cabD)
      const indicCabane = new BoiteBuilder({
        xMin: (cabA.x + cabD.x) / 2 - 1.5,
        xMax: (cabA.x + cabD.x) / 2 + 1.5,
        yMin: (cabA.y + cabB.y) / 2 - 0.6,
        yMax: (cabA.y + cabB.y) / 2 + 0.6,
      })
      indicCabane.addTextIn({
        textIn: 'Cabane',
        color: 'black',
        opacity: 0.8,
        size: 1,
      })
      indicCabane.addColor({
        colorBackground: 'darkgray',
        color: 'none',
        opacity: 0,
        backgroudOpacity: 0.2,
      })
      const longCab = afficheCoteSegment(
        segment(cabC, cabB),
        `${longueurCabane}\\text{ m}`,
        0.2,
        'black',
        0.5,
        0.7,
        context.isHtml ? 'gray' : 'darkgray',
        true,
      )
      const largCab = afficheCoteSegment(
        segment(cabB, cabA),
        `${largeurCabane}\\text{ m}`,
        0.2,
        'black',
        0.5,
        0.7,
        context.isHtml ? 'gray' : 'darkgray',
        true,
      )
      const distP = afficheCoteSegment(
        segment(cabA, P),
        `${offsetPointP}\\text{ m}`,
        0.2,
        'black',
        0.5,
        0.7,
        'black',
        true,
      )
      const longEnclos = afficheCoteSegment(
        segment(B, A),
        `${longueurEnclos}\\text{ m}`,
        0.2,
        'black',
        1,
        0.7,
        context.isHtml ? 'gray' : 'darkgray',
        true,
      )
      const largEnclos = afficheCoteSegment(
        segment(A, D),
        `${largeurEnclos}\\text{ m}`,
        0.2,
        'black',
        1,
        1,
        context.isHtml ? 'gray' : 'darkgray',
        true,
      )
      const ch = pointSurSegment(
        P,
        A,
        longueurCordelette * 0.85,
        '$\\text{chèvre}$',
        'below left',
      )
      const chLablel = texteParPosition(
        'chèvre',
        ch.x - 0.6,
        ch.y - 0.5,
        0,
        context.isHtml ? 'gray' : 'darkgray',
        1,
        'milieu',
        false,
        1,
      )
      const longe = cordelette(P, ch)
      const longCord = texteParPosition(
        'Corde',
        (P.x + ch.x) / 2 + 0.5,
        (P.y + ch.y) / 2 - 0.5,
        0,
        context.isHtml ? 'gray' : 'darkgray',
        1,
        'milieu',
      )
      const PetCh = tracePoint(P, ch)
      PetCh.style = 'o'

      objetsEnonce.push(
        tracePoint(A),
        enclos,
        cabane,
        indicCabane.render(),
        indicEnclos.render(),
        longCab,
        largCab,
        distP,
        longEnclos,
        largEnclos,
        PetCh,
        labelPoint(P),
        chLablel,
        longe,
        longCord,
      )
      objetsCorrection.push(
        enclos,
        cabane,
        indicCabane.render(),
        indicEnclos.render(),
        tracePoint(P),
        labelPoint(P),
        distP,
        longCab,
        largCab,
      )

      texte +=
        "Dans l'enclos rectangulaire représenté ci-dessous, on a attaché une chèvre à un piquet $(P)$ situé sur le mur d'une cabane rectangulaire, elle aussi.<br>"
      texte += `La corde qui limite les déplacements de la chèvre mesure $${longueurCordelette}\\,\\text{m}$.<br>`
      texte += `${numAlpha(0)} Représenter le schéma de l'enclos en utilisant comme échelle : $1\\,\\text{cm}$ pour $1\\,\\text{m}$.<br>`
      texte += `${numAlpha(1)} Délimiter et hachurer la zone de l'enclos dans laquelle peut brouter la chèvre.<br><br>`

      texte += mathalea2d(
        Object.assign({ scale: 0.5 }, fixeBordures(objetsEnonce)),
        objetsEnonce,
      )
      texteCorr += mathalea2d(
        Object.assign({ scale: 0.7 }, fixeBordures(objetsCorrection)),
        objetsCorrection,
      )
      if (
        this.questionJamaisPosee(
          i,
          longueurEnclos,
          largeurEnclos,
          longueurCabane,
          largeurCabane,
          longueurCordelette,
          offsetPointP,
        )
      ) {
        this.listeQuestions.push(texte)
        this.listeCorrections.push(texteCorr)
        i++
      }
      cpt++
    }
  }
}
