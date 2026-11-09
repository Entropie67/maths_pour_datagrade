import { afficheMesureAngle } from '../../lib/2d/AfficheMesureAngle'
import { cercle } from '../../lib/2d/cercle'
import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { droite, droiteVerticaleParPoint } from '../../lib/2d/droites'
import { pointAbstrait, PointAbstrait } from '../../lib/2d/PointAbstrait'
import {
  NommePolygone,
  Polygone,
  polygone,
  polygoneAvecNom,
} from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint, texteParPosition } from '../../lib/2d/textes'
import { texteSurSegment } from '../../lib/2d/texteSurSegment'
import { tracePoint } from '../../lib/2d/TracePoint'
import { projectionOrtho } from '../../lib/2d/transformations'
import { angle, longueur } from '../../lib/2d/utilitairesGeometriques'
import {
  milieu,
  pointAdistance,
  pointIntersectionLC,
} from '../../lib/2d/utilitairesPoint'
import {
  Arete3d,
  arete3d,
  CodageAngleDroit3D,
  demicercle3d,
  Point3d,
  point3d,
  rotationV3d,
  Vecteur3d,
  vecteur3d,
} from '../../lib/3d/3dProjectionMathalea2d/elementsEtTransformations3d'
import { sphere3d } from '../../lib/3d/3dProjectionMathalea2d/Sphere3dPerspectiveCavaliere'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import {
  arrondi,
  nombreDeChiffresDansLaPartieDecimale,
  nombreDeChiffresDe,
} from '../../lib/outils/nombres'
import {
  creerNomDePolygone,
  lettreDepuisChiffre,
  numAlpha,
  sp,
} from '../../lib/outils/outilString'
import { stringNombre, texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import Grandeur from '../../modules/Grandeur'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Problèmes nécessitant un calcul de longueur à l'aide de la trigonométrie"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const dateDePublication = '05/03/2022'
export const dateDeModifImportante = '10/10/2025'

/**
 * Calculer la largeur d\'une rivière @author Jean-claude Lhote
 * Calcul d\'un parallèle terrestre @author Jean-claude Lhote
 * Calculer la hauteur d\'un objet vu sous un angle donné @author Jean-claude Lhote
 * Calculer la hauteur d\'une falaise @author Jean-claude Lhote
 * Calculer la hauteur d\'une montagne @author Jean-claude Lhote
 * Triangle rectangle inscrit dans un triangle rectangle @author Rémi Angot
 * Fusion des exercices @author Guillaume Valmont
 * Interactivité des exercices, aléatoirisation des figures et des points dans les exos, AMC-isation de tous les exos @author Éric Elter
 * Meilleure interactivite + colorisation des exercices par @author Éric Elter
 */
export const uuid = '2045e'

export const refs = {
  'fr-fr': ['3G32-0'],
  'fr-ch': ['1mT-9'],
}
export default class ProblemesTrigoLongueur extends Exercice {
  constructor() {
    super()

    this.besoinFormulaireCaseACocher = [
      'Afficher des questions intermédiaires et éventuellement un schéma',
    ]
    this.sup = true
    this.besoinFormulaire2Texte = [
      'Type de questions',
      `Nombres séparés par des tirets :
    1 : Calculer la largeur d'une rivière
    2 : Calcul d'un parallèle terrestre
    3 : Calculer la hauteur d'un objet vu sous un angle donné
    4 : Calculer la hauteur d'une falaise
    5 : Calculer la hauteur d'une montagne
    6 : Calculer une longueur dans des triangles rectangles imbriqués
    7 : Mélange`,
    ]
    this.comment = `Cet exercice regroupe les exercices 3G32-X (X : 1 à 5).`
    this.sup2 = 7
    this.nbQuestions = 2
    this.spacingCorr = 3
    this.spacing = 2
  }

  nouvelleVersion() {
    let listeDeNomsDePolygones: string[] = []
    const objet = [
      ['arbre', 'un', '', 'situé'],
      ['immeuble', 'un', '', 'situé'],
      ['éolienne', 'une', 'te', 'située'],
      ['colline', 'une', 'te', 'située'],
    ]
    let distance
    let beta = 0
    let alpha = 0
    let taille
    let A: PointAbstrait | Point3d
    let B: PointAbstrait | Point3d
    let S: PointAbstrait | Point3d
    let C: PointAbstrait | Point3d
    let R: [Polygone, NommePolygone] | Vecteur3d | PointAbstrait
    let objets = []
    let p
    let O: PointAbstrait | Point3d
    let H: PointAbstrait | Point3d
    let M: PointAbstrait | Point3d
    let R2: Vecteur3d
    let Axe
    let normalV
    let normalH
    let P: PointAbstrait | Point3d
    let HP: Arete3d
    let Sph
    let OP: Arete3d
    let PoleNord
    let PoleSud
    let hauteur
    let teta
    let index
    // let M1, MInit, normalH1, R21, P1
    const lettresGrecques = [
      ['α', '\\alpha'],
      ['β', '\\beta'],
      ['δ', '\\delta'],
      ['γ', '\\gamma'],
      ['ω', '\\omega'],
      ['ε', '\\epsilon'],
      ['θ', '\\theta'],
      ['λ', '\\lambda'],
    ]
    const listeTypeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      max: 6,
      melange: 7,
      defaut: 7,
      nbQuestions: this.nbQuestions,
    })

    let ii = 0 // Cet indice permet de gérer les numéros de champs interactifs car ces champs ne sont pas de nombre égal selon les listeTypeQuestions[i].
    let iiAMC // Cet indice permet de gérer les numéros de champs AMC car ces champs ne sont pas de nombre égal selon les listeTypeQuestions[i].
    for (
      let i = 0,
        iiInitial,
        texte,
        numA,
        ordA,
        numB,
        numC,
        numR,
        absC,
        numS,
        absS,
        numH,
        AB,
        propositionsAMC,
        enonceAMC,
        enonceInit,
        texteCorr,
        reponse,
        j,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      texte = ''
      texteCorr = ''
      propositionsAMC = []
      iiAMC = 0
      iiInitial = ii // ça c'est pour revenir au même index si on ne pousse pas la question !
      if (i % 3 === 0) listeDeNomsDePolygones = ['QD']
      const choixAlpha = randint(0, 7)
      const alfa = lettresGrecques[choixAlpha][1] // context.isHtml ? lettresGrecques[choixAlpha][0] : // on passe tout en latex
      const alfaInteractif = lettresGrecques[choixAlpha][1]
      const choixBeta = randint(0, 7, [choixAlpha])
      const baita = lettresGrecques[choixBeta][1] // context.isHtml ? lettresGrecques[choixBeta][0] :
      const baitaInteractif = lettresGrecques[choixBeta][1]
      const sensV = choice([-1, 1])
      const sensH = choice([-1, 1])
      numB = randint(1, 26, [4, 5, 15, 23, 24, 25])
      numC = randint(1, 26, [4, 5, 15, 23, 24, 25, numB])
      numS = randint(1, 26, [4, 5, 15, 23, 24, 25, numB, numC])
      numA = randint(1, 26, [4, 5, 15, 23, 24, 25, numB, numC, numS])
      numH = randint(1, 26, [4, 5, 15, 23, 24, 25, numA, numB, numC, numS])
      numR = randint(1, 26, [
        4,
        5,
        15,
        23,
        24,
        25,
        numA,
        numB,
        numC,
        numS,
        numH,
      ])
      const lR = lettreDepuisChiffre(numR)
      const lB = lettreDepuisChiffre(numB)
      const lC = lettreDepuisChiffre(numC)
      const lS = lettreDepuisChiffre(numS)
      const lA = lettreDepuisChiffre(numA)
      const lH = lettreDepuisChiffre(numH)

      switch (listeTypeQuestions[i]) {
        case 1:
          objets = []
          alpha = randint(25, 65)
          j = 0
          beta = alpha + randint(2, 5)
          distance = randint(7, 15) * 10
          taille = arrondi(
            Math.round(
              distance *
                (Math.tan((beta * Math.PI) / 180) -
                  Math.tan((alpha * Math.PI) / 180)),
            ),
          )
          numA = randint(1, 26, [4, 5, 15, 23, 24, 25])
          ordA = sensV * randint(5, 9)
          A = pointAbstrait(0, ordA, lA)
          numB = randint(1, 26, [4, 5, 15, 23, 24, 25, numA])
          B = pointAbstrait(0, 0, lB)
          AB = lA + lB
          numC = randint(1, 26, [4, 5, 15, 23, 24, 25, numA, numB])
          absC = sensH * randint(5, 9)
          C = pointAbstrait(
            absC,
            0,
            lC,
            sensH > 0
              ? sensV > 0
                ? 'below left'
                : 'above left'
              : sensV > 0
                ? 'below right'
                : 'above right',
          )
          numS = randint(1, 26, [4, 5, 15, 23, 24, 25, numA, numB, numC])
          absS = randint(3, 7)
          S = pointAbstrait(absC + sensH * absS, 0, lS)
          p = polygoneAvecNom(A, B, S)
          R = polygoneAvecNom(
            pointAbstrait(absC, -1 * sensV),
            pointAbstrait(absC + sensH * absS, -1 * sensV),
            pointAbstrait(absC + sensH * absS, ordA + sensV),
            pointAbstrait(absC, ordA + sensV),
          )
          R[0].color = context.isHtml
            ? colorToLatexOrHTML(bleuMathalea)
            : colorToLatexOrHTML('lightgray')
          R[0].couleurDeRemplissage = R[0].color
          R[0].opaciteDeRemplissage = 0.5
          R[0].opacite = 0.5
          objets.push(
            R[0],
            p[1],
            p[0],
            segment(A, C),
            codageAngleDroit(A, B, C),
            labelPoint(C),
          )
          objets.push(
            afficheMesureAngle(B, A, C, 'black', 1, `${alfa}`),
            afficheMesureAngle(B, A, S, 'black', 2, `${baita}`),
          )
          objets.push(
            texteSurSegment(
              `${stringNombre(distance)} m`,
              sensH * sensV < 0 ? B : A,
              sensH * sensV < 0 ? A : B,
              'black',
              -0.5,
            ),
          )

          texte =
            "Un géomètre veut mesurer la largeur d'une rivière, représentée par le rectangle, dans le schéma ci-dessous.<br>"
          texte += `Pour cela, il remarque une souche notée $${lS}$ sur la rive opposée.<br>`
          texte += `Il a placé un cône sur sa rive en face de la souche, son emplacement est noté $${lC}$.<br>`
          texte += `Ensuite, il s'est éloigné de la berge en restant aligné avec la souche $${lS}$ et le cône $${lC}$ jusqu'à un endroit où il place un bâton noté $${lB}$.<br>`
          texte += `Du bâton, il effectue un quart de tour et s'éloigne d'une distance de $${distance}\\text{ m}$ jusqu'à son appareil de mesure noté $${lA}$.<br>`
          texte += `À l'aide de son appareil, il mesure l'angle $\\widehat{${lB}${lA}${lC}}$ noté $${alfa}$  et l'angle $\\widehat{${lB}${lA}${lS}}$ noté $${baita}$.`
          texte +=
            "<br>(Le schéma ci-dessous n'est pas en vraie grandeur et ne respecte pas les proportions.)"
          texte +=
            '<br>' +
            mathalea2d(
              {
                xmin: Math.min(-sensH, absC + sensH * (absS + 1)),
                ymin: Math.min(-sensV, ordA + sensV),
                xmax: Math.max(-sensH, absC + sensH * (absS + 1)),
                ymax: Math.max(-sensV, ordA + sensV),
                pixelsParCm: 20,
                scale: 0.5,
              },
              objets,
            ) //  1O est le max de ordA+1 : ainsi le cadre a toujours proportionnellement la même hauteur, bien que la figure change de hauteur.
          enonceInit = texte
          if (this.sup) {
            enonceAMC = `${numAlpha(j)}Exprimer $${lB}${lC}$ en fonction de $${lA}${lB}$ et de $${alfa}$.`
            texte += enonceAMC
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                i + ii,
                KeyboardType.grecTrigo,
                {
                  texteAvant: `$${sp(20)}${lB}${lC}=$`,
                },
              )
              handleAnswers(this, i + ii, {
                reponse: {
                  value: `${AB}\\times\\tan(${alfaInteractif})`,
                  options: { calculFormel: true },
                },
              })
              ii++
            } else if (context.isAmc) {
              propositionsAMC[iiAMC] = {
                type: 'AMCOpen',
                propositions: [
                  {
                    texte: '',
                    statut: 2,
                    enonce: enonceInit + enonceAMC,
                    pointilles: false,
                  },
                ],
              }
              iiAMC++
            }

            j++
            enonceAMC = `${numAlpha(j)}Exprimer $${lB}${lS}$ en fonction de $${lA}${lB}$ et de $${baita}$.`
            texte += '<br>' + enonceAMC
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                i + ii,
                KeyboardType.grecTrigo,
                {
                  texteAvant: `$${sp(20)}${lB}${lS}=$`,
                },
              )
              handleAnswers(this, i + ii, {
                reponse: {
                  value: `${AB}\\times\\tan(${baitaInteractif})`,
                  options: { calculFormel: true },
                },
              })
              ii++
            } else if (context.isAmc) {
              propositionsAMC[iiAMC] = {
                type: 'AMCOpen',
                propositions: [
                  {
                    texte: '',
                    statut: 2,
                    enonce: enonceAMC,
                    pointilles: false,
                  },
                ],
              }
              iiAMC++
            }
            j++
          }
          enonceAMC = `${numAlpha(j)}Exprimer $${lC}${lS}$ en fonction de $${lA}${lB}$, de $${alfa}$ et de $${baita}$.`
          texte += '<br>' + enonceAMC
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              i + ii,
              KeyboardType.grecTrigo,
              {
                texteAvant: `$${sp(20)}${lC}${lS}=$`,
              },
            )
            handleAnswers(this, i + ii, {
              reponse: {
                value: [
                  `${AB}\\times(\\tan(${baitaInteractif})-\\tan(${alfaInteractif}))`,
                  `${AB}\\times\\tan(${baitaInteractif})-${AB}\\times\\tan(${alfaInteractif})`,
                ],
                options: { calculFormel: true },
              },
            })
            ii++
          } else if (context.isAmc) {
            propositionsAMC[iiAMC] = {
              type: 'AMCOpen',
              propositions: [
                {
                  texte: '',
                  statut: this.sup ? 2 : 5,
                  enonce: this.sup
                    ? enonceAMC
                    : enonceInit + '<br>' + enonceAMC,
                  pointilles: false,
                },
              ],
            }
            iiAMC++
          }
          j++
          enonceAMC = `${numAlpha(j)}Calculer la largeur de la rivière au mètre près sachant que $${alfa}=${alpha}^\\circ$ et $${baita}=${beta}^\\circ$.`
          texte += '<br>' + enonceAMC
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              i + ii,
              KeyboardType.longueur,
              {
                texteAvant: `$${sp(25)}$`,
                texteApres: sp(4) + "(Préciser l'unité.)",
              },
            )
            handleAnswers(this, i + ii, {
              reponse: {
                value: new Grandeur(taille, 'm'),
                options: { unite: true, precisionUnite: 1 },
              },
            })
            ii++
          } else if (context.isAmc) {
            propositionsAMC[iiAMC] = {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  statut: '',
                  reponse: {
                    texte: enonceAMC,
                    valeur: [taille],
                    alignement: 'center',
                    param: {
                      digits: nombreDeChiffresDe(taille),
                      decimals: 0,
                      signe: false,
                    },
                  },
                },
              ],
            }
            iiAMC++
          }
          j = 0
          texteCorr = mathalea2d(
            {
              xmin: Math.min(-sensH, absC + sensH * (absS + 1)),
              ymin: Math.min(-sensV, ordA + sensV),
              xmax: Math.max(-sensH, absC + sensH * (absS + 1)),
              ymax: Math.max(-sensV, ordA + sensV),
              pixelsParCm: 20,
              scale: 0.5,
            },
            objets,
          )
          texteCorr += `${numAlpha(j)}Dans le triangle $${lA}${lB}${lC}$ rectangle en $${lB}$ on a : $\\tan(${alfa})=\\dfrac{${lB}${lC}}{${AB}}$ 
          d'où $${lB}${lC}=${miseEnEvidence(`${AB}\\times \\tan(${alfa})`)}$.<br>`
          j++
          if (this.sup) {
            texteCorr += `${numAlpha(j)}`
            j++
          }
          texteCorr += `Dans le triangle $${lA}${lB}${lS}$ rectangle en $${lB}$ on a : $\\tan(${baita})=\\dfrac{${lB}${lS}}{${AB}}$ 
          d'où $${lB}${lS}=${miseEnEvidence(`${AB}\\times \\tan(${baita})`)}$.<br>`
          if (this.sup) {
            texteCorr += `${numAlpha(j)}`
            j++
          }
          texteCorr += `Comme $${lB}${lS}=${AB}\\times \\tan(${baita})$ et $${lB}${lC}=${AB}\\times \\tan(${alfa})$, alors $${lC}${lS}=${AB}\\times(\\tan(${baita})-\\tan(${alfa}))$.<br>`
          texteCorr += `${numAlpha(j)}Donc $${lC}${lS}=${distance}${sp()} m\\times(\\tan(${beta}^\\circ)-\\tan(${alpha}^\\circ))\\approx ${miseEnEvidence(taille)}$ ${texteEnCouleurEtGras('m')}.<br>`

          break
        case 2:
          context.anglePerspective = 20
          objets = []
          alpha = randint(30, 60)
          O = point3d(0, 0, 0, false, 'O')
          M = point3d(5, 0, 0, true, 'M')
          PoleNord = point3d(0, 0, 5, false, 'N')
          PoleSud = point3d(0, 0, -5, false, 'S')
          R = vecteur3d(O, M)
          Axe = arete3d(PoleSud, PoleNord)
          normalV = vecteur3d(0, 0, 1)
          M = rotationV3d(M, normalV, context.anglePerspective)
          M.c2d.nom = 'M'
          M.c2d.positionLabel = 'right'
          normalH = rotationV3d(R, normalV, 90)
          P = rotationV3d(M, normalH, -alpha)
          P.c2d.nom = 'P'
          P.c2d.positionLabel = 'above right'
          H = point3d(0, 0, P.z, false)
          R2 = rotationV3d(vecteur3d(H, P), normalV, context.anglePerspective) // Rayon obtenu depuis P
          H.c2d.nom = 'H'
          H.c2d.positionLabel = 'left'
          Sph = sphere3d(O, 5, 'black', 'black', 6, 'gray', 12, 'gray')
          HP = arete3d(H, P)
          OP = arete3d(O, P)
          objets.push(
            ...Sph.c2d,
            Axe.c2d,
            HP.c2d,
            OP.c2d,
            new CodageAngleDroit3D(P, H, O),
            tracePoint(H.c2d, P.c2d, O.c2d, M.c2d),
            labelPoint(H.c2d, P.c2d, O.c2d, M.c2d),
          )
          objets.push(
            demicercle3d(
              H,
              normalV,
              R2,
              'indirect',
              false,
              'red',
              -context.anglePerspective,
            ),
          )
          objets.push(
            demicercle3d(
              H,
              normalV,
              R2,
              'direct',
              true,
              'red',
              -context.anglePerspective,
            ),
          )
          objets.push(arete3d(O, M).c2d)
          objets.push(
            afficheMesureAngle(
              M.c2d,
              O.c2d,
              P.c2d,
              'black',
              1.5,
              `${alpha}^\\circ`,
            ),
          )
          texte = mathalea2d(
            {
              xmin: -8,
              ymin: -6,
              xmax: 8,
              ymax: 6,
              pixelsParCm: 20,
              scale: 0.5,
            },
            objets,
          )
          texte += `Quelle est la longueur du $${alpha}$e parallèle Nord au kilomètre près ?`
          texte += `<br>On prendra $${texNombre(6400)}${sp()}\\text{km}$ comme rayon de la Terre.<br>`
          enonceAMC = texte
          texteCorr = mathalea2d(
            {
              xmin: -8,
              ymin: -6,
              xmax: 8,
              ymax: 6,
              pixelsParCm: 20,
              scale: 0.5,
            },
            objets,
          )
          texteCorr += `Considérons que le $${alpha}$e parallèle Nord est un cercle. Soit $H$ le centre de ce cercle situé sur l'axe de rotation de la Terre.<br>`
          texteCorr +=
            'Les segments $[HP]$ et $[OM]$ sont parallèles, donc les angles alternes-internes $\\widehat{MOP}$ et $\\widehat{OPH}$ sont égaux.<br>'
          texteCorr +=
            "Dans le triangle $OPH$ rectangle en $H$, $\\cos(\\widehat{OPH})=\\dfrac{HP}{OP}$ d'où $HP=OP\\times \\cos(\\widehat{OPH})$.<br>"
          texteCorr += `Le rayon de la Terre étant approximativement de $${texNombre(6400)}${sp()}\\text{km}$, nous pouvons calculer $HP$.<br>`
          texteCorr += `$HP\\approx${texNombre(6400)}${sp()}\\text{km}\\times \\cos(${alpha}^\\circ)\\approx ${texNombre(arrondi(6400 * Math.cos((alpha * Math.PI) / 180)))}${sp()}\\text{km}$<br>`
          reponse = Math.round(
            2 * Math.PI * 6400 * Math.cos((alpha * Math.PI) / 180),
          )
          texteCorr += `Calculons maintenant la longueur $L$ du $${alpha}$e parallèle : $L\\approx 2\\times \\pi\\times ${texNombre(arrondi(6400 * Math.cos((alpha * Math.PI) / 180)))}${sp()}\\text{km}\\approx ${miseEnEvidence(texNombre(reponse))}$ ${texteEnCouleurEtGras('km')}.<br>`
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              i + ii,
              KeyboardType.longueur,
              { texteApres: sp(4) + "(Préciser l'unité.)" },
            )
            handleAnswers(this, i + ii, {
              reponse: {
                value: new Grandeur(reponse, 'km'),
                options: { unite: true, precisionUnite: 1000 },
              },
            })
            ii++
          } else if (context.isAmc) {
            propositionsAMC[iiAMC] = {
              type: 'AMCOpen',
              propositions: [
                {
                  texte: '',
                  statut: 5,
                  enonce: enonceAMC,
                  pointilles: false,
                },
              ],
            }
            iiAMC++
            propositionsAMC[iiAMC] = {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  statut: '',
                  reponse: {
                    texte: `Longueur calculée, exprimée en $\\text{km}$ et arrondie à l'unité, du $${alpha}$e parallèle Nord : `,
                    valeur: [reponse],
                    alignement: 'center',
                    param: {
                      digits: nombreDeChiffresDe(reponse),
                      decimals: 0,
                      signe: false,
                    },
                  },
                },
              ],
            }
            iiAMC++
          }
          break
        case 3:
          objets = []
          distance = randint(5, 300)
          hauteur = randint(150, 190) / 100
          beta = (Math.atan(hauteur / distance) / Math.PI) * 180
          alpha = randint(10, 50)
          teta = ((alpha - beta) * Math.PI) / 180
          taille = arrondi(hauteur + distance * Math.tan(teta), 1)
          if (taille < 20) index = 0
          else if (taille < 50) index = 1
          else if (taille < 100) index = 2
          else index = 3
          A = pointAbstrait(0, 0, lA)
          ordA = sensH * randint(10, 14)
          B = pointAdistance(A, ordA, 0, lB)
          absC = choice([2.5, 3, 3.5])
          C = pointAdistance(A, absC, 90, lC)
          R = pointAdistance(B, absC, 90, lR)
          absS = randint(7, 11)
          S = pointAdistance(B, absS, 90, lS)
          p = polygoneAvecNom(A, B, R, S, C)
          objets.push(
            p[1],
            p[0],
            segment(C, B),
            segment(C, R),
            codageAngleDroit(C, A, B),
            codageAngleDroit(A, B, R),
            codageAngleDroit(C, R, S),
          )
          objets.push(
            afficheMesureAngle(B, C, S, 'black', 3, `${alfa}`),
            afficheMesureAngle(A, B, C, 'black', 2, `${baita}`),
            afficheMesureAngle(B, C, R, 'black', 2, `${baita}`),
          )
          objets.push(
            texteSurSegment(
              `${stringNombre(hauteur)} m`,
              sensH < 0 ? A : C,
              sensH < 0 ? C : A,
              'black',
              -0.5,
            ),
            texteSurSegment(`${stringNombre(distance)} m`, C, R),
          )
          texte = `Un observateur regarde ${objet[index][1]} ${objet[index][0]} sous un angle de $${alpha}^\\circ$.<br>`
          texte += `Cet${objet[index][2]} ${objet[index][0]} est ${objet[index][3]} à une distance de $${texNombre(distance)}\\text{ m}$ de l'observateur.<br>`
          texte += `L'œil de l'observateur est situé à $${texNombre(hauteur)}\\text{ m}$ du sol.`
          enonceInit = texte
          j = 0
          if (this.sup) {
            texte = `<br>$${lC}$ représente l'œil de l'observateur, $[${lB}${lS}]$ représente cet${objet[index][2]} ${objet[index][0]}.<br>`
            texte +=
              "(Le schéma ci-dessous n'est pas en vraie grandeur et ne respecte pas les proportions.)<br>"
            texte += mathalea2d(
              {
                xmin: Math.min(-sensH, ordA + sensH),
                ymin: -1,
                xmax: Math.max(-sensH, ordA + sensH),
                ymax: absS + 1,
                pixelsParCm: 20,
                scale: 0.5,
              },
              objets,
            )
            texte += `${numAlpha(j)}Calculer d'abord $${baita}$, arrondie au centième près.`
            enonceAMC = texte
            texte = enonceInit + texte
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                i + ii,
                KeyboardType.clavierNumbers,
                {
                  texteApres: '$^\\circ$',
                },
              )
              handleAnswers(this, i + ii, {
                reponse: { value: arrondi(beta) },
              })
              ii++
            } else if (context.isAmc) {
              propositionsAMC[iiAMC] = {
                type: 'AMCOpen',
                propositions: [
                  {
                    texte: '',
                    statut: 2,
                    enonce: enonceInit + enonceAMC,
                    pointilles: false,
                  },
                ],
              }
              iiAMC++
              propositionsAMC[iiAMC] = {
                type: 'AMCNum',
                propositions: [
                  {
                    texte: '',
                    statut: '',
                    reponse: {
                      texte: `Valeur calculée, arrondie au centième, de $${baita}$ : `,
                      valeur: [arrondi(beta)],
                      alignement: 'center',
                      param: {
                        digits: nombreDeChiffresDe(arrondi(beta)),
                        decimals: nombreDeChiffresDansLaPartieDecimale(
                          arrondi(beta),
                        ),
                        signe: false,
                      },
                    },
                  },
                ],
              }
              iiAMC++
            }
            j++
            enonceAMC = `${numAlpha(j)}En déduire la mesure de l'angle $\\widehat{${lR}${lC}${lS}}$, arrondie au centième près.`
            texte += '<br>' + enonceAMC
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                i + ii,
                KeyboardType.clavierNumbers,
                {
                  texteApres: '$^\\circ$',
                },
              )
              handleAnswers(this, i + ii, {
                reponse: { value: arrondi(alpha - beta) },
              })
              ii++
            } else if (context.isAmc) {
              propositionsAMC[iiAMC] = {
                type: 'AMCNum',
                propositions: [
                  {
                    texte: '',
                    statut: '',
                    reponse: {
                      texte: enonceAMC,
                      valeur: [arrondi(alpha - beta)],
                      alignement: 'center',
                      param: {
                        digits: nombreDeChiffresDe(arrondi(alpha - beta)),
                        decimals: nombreDeChiffresDansLaPartieDecimale(
                          arrondi(alpha - beta),
                        ),
                        signe: false,
                      },
                    },
                  },
                ],
              }
              iiAMC++
            }
            j++
            enonceAMC = `${numAlpha(j)}Calculer alors la longueur $${lR}${lS}$, arrondie au cm près.`
            texte += '<br>' + enonceAMC
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                i + ii,
                KeyboardType.longueur,
                { texteApres: sp(4) + "(Préciser l'unité.)" },
              )
              handleAnswers(this, i + ii, {
                reponse: {
                  value: new Grandeur(arrondi(taille - hauteur), 'm'),
                  options: { unite: true, precisionUnite: 1 },
                },
              })
              ii++
            } else if (context.isAmc) {
              propositionsAMC[iiAMC] = {
                type: 'AMCOpen',
                propositions: [
                  {
                    texte: '',
                    statut: 2,
                    enonce: enonceAMC,
                    pointilles: false,
                  },
                ],
              }
              iiAMC++
              propositionsAMC[iiAMC] = {
                type: 'AMCNum',
                propositions: [
                  {
                    texte: '',
                    statut: '',
                    reponse: {
                      texte: `Longueur en mètres, calculée au centième près, de $${lR}${lS}$ : `,
                      valeur: [arrondi(taille - hauteur)],
                      alignement: 'center',
                      param: {
                        digits: nombreDeChiffresDe(arrondi(taille - hauteur)),
                        decimals: nombreDeChiffresDansLaPartieDecimale(
                          arrondi(taille - hauteur),
                        ),
                        signe: false,
                      },
                    },
                  },
                ],
              }
              iiAMC++
            }
            j++
          }
          enonceAMC = this.sup ? `${numAlpha(j)}` : ''
          texte += '<br>' + enonceAMC
          enonceAMC += `Calculer la hauteur, en mètres, de cet${objet[index][2]} ${objet[index][0]}, arrondie au mètre près.`
          texte += `Calculer la hauteur de cet${objet[index][2]} ${objet[index][0]}, arrondie au mètre près.`
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              i + ii,
              KeyboardType.longueur,
              { texteApres: sp(4) + "(Préciser l'unité.)" },
            )
            handleAnswers(this, i + ii, {
              reponse: {
                value: new Grandeur(arrondi(taille, 0), 'm'),
                options: { unite: true, precisionUnite: 1 },
              },
            })
            ii++
          } else if (context.isAmc) {
            if (!this.sup) {
              propositionsAMC[iiAMC] = {
                type: 'AMCOpen',
                propositions: [
                  {
                    texte: '',
                    statut: 6,
                    enonce: enonceInit + '<br>' + enonceAMC + '<br>',
                    pointilles: false,
                  },
                ],
              }
              iiAMC++
            }
            propositionsAMC[iiAMC] = {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  statut: '',
                  reponse: {
                    texte: !this.sup
                      ? `Hauteur, en mètres, de cet${objet[index][2]} ${objet[index][0]} :`
                      : enonceAMC,
                    valeur: [arrondi(taille, 0)],
                    alignement: 'center',
                    param: {
                      digits: nombreDeChiffresDe(arrondi(taille, 0)),
                      decimals: 0,
                      signe: false,
                    },
                  },
                },
              ],
            }
            iiAMC++
          }
          j = 0
          texteCorr = mathalea2d(
            {
              xmin: Math.min(-sensH, ordA + sensH),
              ymin: -1,
              xmax: Math.max(-sensH, ordA + sensH),
              ymax: absS + 1,
              pixelsParCm: 20,
              scale: 0.5,
            },
            objets,
          )
          texteCorr += this.sup ? `${numAlpha(j)}` : ''
          texteCorr += `Dans le triangle $${lC}${lR}${lB}$ rectangle en $${lR}$, $\\tan(${baita})=\\dfrac{${lR}${lB}}{${lC}${lR}}$.<br>
          D'où $${baita}=\\arctan(\\dfrac{${texNombre(hauteur)}}{${texNombre(distance)}})\\approx ${miseEnEvidence(`${texNombre(beta, 2)}`)}^\\circ$.<br>`
          j++
          texteCorr += this.sup ? `${numAlpha(j)}` : ''
          texteCorr += `$\\widehat{${lR}${lC}${lS}}=${alfa}-${baita}\\approx ${miseEnEvidence(`${texNombre(alpha - beta, 2)}`)}^\\circ$<br>`
          j++
          texteCorr += this.sup ? `${numAlpha(j)}` : ''
          texteCorr += `Dans le triangle $${lR}${lC}${lS}$ rectangle en $${lC}$, $\\tan(\\widehat{${lR}${lC}${lS}})=\\dfrac{${lR}${lS}}{${lC}${lR}}$.<br>`
          texteCorr += `D'où $${lR}${lS}=${lC}${lR}\\times \\tan(\\widehat{${lR}${lC}${lS}})\\approx ${distance}${sp()}\\text{m}\\times \\tan(${texNombre(alpha - beta, 2)}^\\circ)\\approx ${miseEnEvidence(texNombre(taille - hauteur))}$ ${texteEnCouleurEtGras('m')}<br>`
          j++
          texteCorr += this.sup ? `${numAlpha(j)}` : ''
          texteCorr += `$${lB}${lS}=${lB}${lR}+${lR}${lS}\\approx${texNombre(hauteur)}${sp()}\\text{m}+${texNombre(taille - hauteur)}${sp()}\\text{m}=${texNombre(taille)}${sp()}\\text{m}\\approx${texNombre(Math.round(taille))}${sp()}\\text{m}$<br>`
          texteCorr += `Cet${objet[index][2]} ${objet[index][0]} mesure environ $${miseEnEvidence(texNombre(Math.round(taille)))}$ ${texteEnCouleurEtGras('m')} de hauteur.`
          break
        case 4:
          objets = []
          alpha = randint(25, 45)
          beta =
            (Math.tan((alpha * Math.PI) / 180) *
              Math.tan(((alpha + 5) * Math.PI) / 180)) /
            (Math.tan(((alpha + 5) * Math.PI) / 180) -
              Math.tan((alpha * Math.PI) / 180))
          distance = randint(5, 10)
          taille = beta * distance
          numB = randint(1, 26, [4, 5, 15, 23, 24, 25])
          B = pointAbstrait(0, 0, lB)
          numS = randint(1, 26, [4, 5, 15, 23, 24, 25, numB])
          absS = sensH * randint(4, 6)
          S = pointAdistance(B, absS, 0, lS)
          numC = randint(1, 26, [4, 5, 15, 23, 24, 25, numB, numS])
          absC = sensH * randint(10, 14)
          C = pointAdistance(B, absC, 0, lC)
          numA = randint(1, 26, [4, 5, 15, 23, 24, 25, numB, numS, numC])
          ordA = randint(10, 14)
          A = pointAdistance(C, ordA, 90, lA)
          p = polygoneAvecNom(B, S, C, A)
          objets.push(p[1], p[0], segment(A, S), codageAngleDroit(B, C, A))
          objets.push(
            afficheMesureAngle(C, B, A, 'black', 2, `${alfa}`),
            afficheMesureAngle(C, S, A, 'black', 2, `${baita}`),
          )
          objets.push(
            texteSurSegment(
              `${stringNombre(distance)} m`,
              B,
              S,
              'black',
              -sensH * 0.5,
            ),
            texteParPosition(
              'h',
              milieu(C, A).x + sensH * 0.5,
              milieu(C, A).y,
              0,
              'black',
              2,
              'milieu',
              true,
            ),
          )
          j = 0
          texte =
            "Un observateur sur un bateau s'approche d'une falaise dont il veut mesurer la hauteur"
          texte += this.sup ? ' $h$.<br>' : '.<br>'
          texte += `Il jette l'ancre puis constate qu'il voit la falaise sous un angle de $${alpha}^\\circ$.<br>`
          texte += `Il se rapproche ensuite de la falaise jusqu'à la voir sous un angle de $${alpha + 5}^\\circ$.<br>`
          texte += `Il constate qu'entre ses deux mesures, il s'est rapproché de la falaise de $${distance}\\text{ m}$.<br>`
          enonceInit = texte
          if (this.sup) {
            enonceAMC =
              "(Le schéma ci-dessous n'est pas en vraie grandeur et ne respecte pas les proportions.)<br>"
            enonceAMC += mathalea2d(
              {
                xmin: Math.min(-sensH, absC + sensH),
                ymin: -1,
                xmax: Math.max(-sensH, absC + sensH),
                ymax: ordA + 1,
                pixelsParCm: 20,
                scale: 0.5,
              },
              objets,
            )
            enonceAMC += `${numAlpha(j)}Exprimer $h$ en fonction de $${lS}${lC}$ et $${baita}$ puis en fonction de $${lB}${lC}$ et $${alfa}$.`
            texte += enonceAMC
            if (this.interactif) {
              texte +=
                '<br>' +
                ajouteChampTexteMathLive(this, i + ii, KeyboardType.grecTrigo, {
                  texteAvant: `$${sp(20)}h=$`,
                })
              AB = lS + lC
              handleAnswers(this, i + ii, {
                reponse: {
                  value: `${AB}\\times\\tan(${baitaInteractif})`,
                  options: { calculFormel: true },
                },
              })
              ii++
              texte +=
                '<br>' +
                ajouteChampTexteMathLive(this, i + ii, KeyboardType.grecTrigo, {
                  texteAvant: `$${sp(20)}h=$`,
                })
              AB = lB + lC
              handleAnswers(this, i + ii, {
                reponse: {
                  value: `${AB}\\times\\tan(${alfaInteractif})`,
                  options: { calculFormel: true },
                },
              })
              ii++
            } else if (context.isAmc) {
              propositionsAMC[iiAMC] = {
                type: 'AMCOpen',
                propositions: [
                  {
                    texte: '',
                    statut: 3,
                    enonce: enonceInit + '<br>' + enonceAMC,
                    pointilles: false,
                  },
                ],
              }
              iiAMC++
            }
            j++
            enonceAMC = `${numAlpha(j)}En déduire $${lS}${lC}$ en fonction de $${lB}${lS}$, $${alfa}$ et $${baita}$.`
            texte += '<br>' + enonceAMC
            if (this.interactif) {
              texte +=
                '<br>' +
                ajouteChampTexteMathLive(this, i + ii, KeyboardType.grecTrigo, {
                  texteAvant: `$${sp(20)}${lS}${lC}=$`,
                })
              AB = lS + lB
              handleAnswers(this, i + ii, {
                reponse: {
                  value: [
                    `\\frac{${AB}\\times\\tan(${alfaInteractif})}{\\tan(${baitaInteractif})-\\tan(${alfaInteractif})}`,
                    `${AB}\\times\\frac{\\tan(${alfaInteractif})}{\\tan(${baitaInteractif})-\\tan(${alfaInteractif})}`,
                    `\\tan(${alfaInteractif})\\times\\frac{${AB}}{\\tan(${baitaInteractif})-\\tan(${alfaInteractif})}`,
                  ],
                  options: { calculFormel: true },
                },
              })
              ii++
            } else if (context.isAmc) {
              propositionsAMC[iiAMC] = {
                type: 'AMCOpen',
                propositions: [
                  {
                    texte: '',
                    statut: 3,
                    enonce: enonceAMC,
                    pointilles: false,
                  },
                ],
              }
              iiAMC++
            }
            j++
            enonceAMC = `${numAlpha(j)}Exprimer $${lC}${lA}$ en fonction de $${lB}${lS}$, $${alfa}$ et $${baita}$.`
            texte += '<br>' + enonceAMC
            if (this.interactif) {
              texte +=
                '<br>' +
                ajouteChampTexteMathLive(this, i + ii, KeyboardType.grecTrigo, {
                  texteAvant: `$${sp(20)}${lC}${lA}=$`,
                })
              handleAnswers(this, i + ii, {
                reponse: {
                  value: [
                    `\\frac{${AB}\\times\\tan(${alfaInteractif})\\times\\tan(${baitaInteractif})}{\\tan(${baitaInteractif})-\\tan(${alfaInteractif})}`,
                    `${AB}\\times\\frac{\\tan(${alfaInteractif})\\times\\tan(${baitaInteractif})}{\\tan(${baitaInteractif})-\\tan(${alfaInteractif})}`,
                    `\\tan(${alfaInteractif})\\times\\tan(${baitaInteractif})\\times\\frac{${AB}}{\\tan(${baitaInteractif})-\\tan(${alfaInteractif})}`,
                  ],
                  options: { calculFormel: true },
                },
              })
              ii++
            } else if (context.isAmc) {
              propositionsAMC[iiAMC] = {
                type: 'AMCOpen',
                propositions: [
                  {
                    texte: '',
                    statut: 2,
                    enonce: enonceAMC,
                    pointilles: false,
                  },
                ],
              }
              iiAMC++
            }
            j++
          }
          enonceAMC = this.sup ? `${numAlpha(j)}` : ''
          texte += '<br>' + enonceAMC
          enonceAMC += 'Quelle est la hauteur, en mètres, de la falaise ?'
          texte += 'Quelle est la hauteur de la falaise ?'
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              i + ii,
              KeyboardType.longueur,
              { texteApres: sp(4) + "(Préciser l'unité.)" },
            )
            handleAnswers(this, i + ii, {
              reponse: {
                value: new Grandeur(arrondi(taille, 0), 'm'),
                options: { unite: true, precisionUnite: 1 },
              },
            })
            ii++
          } else if (context.isAmc) {
            if (!this.sup) {
              propositionsAMC[iiAMC] = {
                type: 'AMCOpen',
                propositions: [
                  {
                    texte: '',
                    statut: 6,
                    enonce: enonceInit + '<br>' + enonceAMC,
                    pointilles: false,
                  },
                ],
              }
              iiAMC++
            }
            propositionsAMC[iiAMC] = {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  statut: '',
                  reponse: {
                    texte: !this.sup
                      ? 'Hauteur, en mètres et arrondie au mètre près, de la falaise :'
                      : enonceAMC,
                    valeur: [arrondi(taille, 0)],
                    alignement: 'center',
                    param: {
                      digits: nombreDeChiffresDe(arrondi(taille, 0)),
                      decimals: 0,
                      signe: false,
                    },
                  },
                },
              ],
            }
            iiAMC++
          }
          j++
          enonceAMC = this.sup ? `${numAlpha(j)}` : ''
          texte += '<br>' + enonceAMC
          enonceAMC +=
            "À quelle distance, en mètres et arrondie au mètre près, du pied de la falaise se trouve l'observateur lors du deuxième relevé ?"
          texte +=
            "À quelle distance du pied de la falaise se trouve l'observateur lors du deuxième relevé ?"
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              i + ii,
              KeyboardType.longueur,
              { texteApres: sp(4) + "(Préciser l'unité.)" },
            )
            handleAnswers(this, i + ii, {
              reponse: {
                value: new Grandeur(
                  arrondi(taille / Math.tan(((alpha + 5) * Math.PI) / 180), 0),
                  'm',
                ),
                options: { unite: true, precisionUnite: 1 },
              },
            })
            ii++
          } else if (context.isAmc) {
            propositionsAMC[iiAMC] = {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  statut: '',
                  reponse: {
                    texte: enonceAMC,
                    valeur: [
                      arrondi(
                        taille / Math.tan(((alpha + 5) * Math.PI) / 180),
                        0,
                      ),
                    ],
                    alignement: 'center',
                    param: {
                      digits: nombreDeChiffresDe(
                        arrondi(
                          taille / Math.tan(((alpha + 5) * Math.PI) / 180),
                          0,
                        ),
                      ),
                      decimals: 0,
                      signe: false,
                    },
                  },
                },
              ],
            }
            iiAMC++
          }
          texte +=
            "<br>Arrondir les résultats au mètre près. (On supposera le point d'observation au niveau de l'eau)"
          texteCorr = mathalea2d(
            {
              xmin: Math.min(-sensH, absC + sensH),
              ymin: -1,
              xmax: Math.max(-sensH, absC + sensH),
              ymax: ordA + 1,
              pixelsParCm: 20,
              scale: 0.5,
            },
            objets,
          )
          j = 0
          texteCorr += this.sup ? `${numAlpha(j)}` : ''
          texteCorr += `Dans le triangle $${lS}${lC}${lA}$ rectangle en $${lC}$, $\\tan(${baita})=\\dfrac{h}{${lS}${lC}}$.<br>D'où $h=${lS}${lC}\\times \\tan(${baita})$.<br>`
          texteCorr += `Dans le triangle $${lB}${lC}${lA}$ rectangle en $${lC}$, $\\tan(${alfa})=\\dfrac{h}{${lB}${lC}}$.<br>D'où $h=${miseEnEvidence(`${lB}${lC}\\times \\tan(${alfa})`)}$.<br>`
          j++
          texteCorr += this.sup ? `${numAlpha(j)}` : ''
          texteCorr += `Or $${lB}${lC}=${lB}${lS}+${lS}${lC}$ donc $h=(${lB}${lS}+${lS}${lC})\\times \\tan(${alfa})$.<br>`
          texteCorr += `On en déduit que $${lS}${lC}\\times \\tan(${baita})=(${lB}${lS}+${lS}${lC})\\times \\tan(${alfa})$, soit $${lS}${lC}\\times \\tan(${baita})=${lB}${lS}\\times \\tan(${alfa})+${lS}${lC}\\times \\tan(${alfa})$.<br>`
          texteCorr += `D'où $${lB}${lS}\\times \\tan(${alfa})=${lS}${lC}\\times \\tan(${baita})-${lS}${lC}\\times \\tan(${alfa})=${lS}${lC}\\times(\\tan(${baita})-\\tan(${alfa}))$.<br>`
          texteCorr += `Et $${lS}${lC}=${miseEnEvidence(`\\dfrac{${lB}${lS}\\times \\tan(${alfa})}{\\tan(${baita})-\\tan(${alfa})}`)}$.<br>`
          j++
          texteCorr += this.sup ? `${numAlpha(j)}` : ''
          texteCorr += `Ainsi $h=${lS}${lC}\\times \\tan(${baita})=${miseEnEvidence(`\\dfrac{${lB}${lS}\\times \\tan(${alfa})\\times \\tan(${baita})}{\\tan(${baita})-\\tan(${alfa})}`)}$.<br>`
          // texteCorr += this.sup ? '' : 'Application numérique : <br>'
          j++
          texteCorr += this.sup ? `${numAlpha(j)}` : ''
          texteCorr += `$h=\\dfrac{${distance}${sp()}\\text{m}\\times \\tan(${alpha}^\\circ)\\times \\tan(${alpha + 5}^\\circ)}{\\tan(${alpha + 5}^\\circ)-\\tan(${alpha}^\\circ)}\\approx ${Math.round(taille)}${sp()}\\text{m}$.<br>`
          texteCorr += this.sup
            ? `La hauteur de la falaise est de $${miseEnEvidence(Math.round(taille))}$ ${texteEnCouleurEtGras('m')}.<br>`
            : ''
          j++
          texteCorr += this.sup ? `${numAlpha(j)}` : ''
          texteCorr += `$${lS}${lC}=\\dfrac{${distance}${sp()}\\text{m}\\times \\tan(${alpha}^\\circ)}{\\tan(${alpha + 5}^\\circ)-\\tan(${alpha}^\\circ)}\\approx ${texNombre(Math.round(taille / Math.tan(((alpha + 5) * Math.PI) / 180)))}${sp()}\\text{m}$.<br>`
          texteCorr += this.sup
            ? `L'observateur se trouve à $${miseEnEvidence(texNombre(Math.round(taille / Math.tan(((alpha + 5) * Math.PI) / 180))))}$ ${texteEnCouleurEtGras('m')} de la falaise lors du deuxième relevé.<br>`
            : ''
          texteCorr += this.sup
            ? ''
            : `La hauteur de la falaise est de $${miseEnEvidence(Math.round(taille))}$ ${texteEnCouleurEtGras('m')} et l'observateur se trouve à $${miseEnEvidence(texNombre(Math.round(taille / Math.tan(((alpha + 5) * Math.PI) / 180))))}$ ${texteEnCouleurEtGras('m')} de celle-ci lors du deuxième relevé.<br>`
          break
        case 5:
          objets = []
          alpha = randint(25, 45)
          j = 0
          beta = alpha + randint(1, 3)
          taille = randint(20, 50) * 100
          distance = Math.round(
            (taille * Math.sin(((beta - alpha) * Math.PI) / 180)) /
              Math.sin((alpha * Math.PI) / 180) /
              Math.sin((beta * Math.PI) / 180),
          )
          taille = Math.round(
            (distance *
              Math.sin((alpha * Math.PI) / 180) *
              Math.sin((beta * Math.PI) / 180)) /
              Math.sin(((beta - alpha) * Math.PI) / 180),
          )

          B = pointAbstrait(0, 0, lB)
          absC = sensH * randint(4, 6)
          C = pointAdistance(B, absC, 0, lC)
          absS = sensH * randint(10, 14)
          S = pointAdistance(B, absS, 0, lS)
          ordA = randint(5, 9)
          A = pointAdistance(S, ordA, 90, lA)
          H = projectionOrtho(
            C,
            droite(B, A),
            lH,
            sensH > 0 ? 'above left' : 'above right',
          )
          p = polygoneAvecNom(B, C, S, A)
          objets.push(
            p[1],
            p[0],
            segment(H, C),
            segment(A, C),
            codageAngleDroit(B, S, A),
            codageAngleDroit(C, H, A),
          )
          objets.push(
            afficheMesureAngle(S, B, A, 'black', 2, `${alfa}`),
            afficheMesureAngle(S, C, A, 'black', 2, `${baita}`),
          )

          objets.push(
            texteSurSegment(
              `${stringNombre(distance)} m`,
              B,
              C,
              'black',
              -sensH * 0.5,
            ),
            labelPoint(H),
            texteParPosition(
              'h',
              milieu(S, A).x + sensH * 0.5,
              milieu(S, A).y,
              0,
              'black',
              2,
              'milieu',
              true,
            ),
          )

          texte =
            "Un voyageur approche d'une montagne. Il aimerait en calculer la hauteur.<br>"
          texte += `Pour cela, il utilise un théodolite en un point $${lB}$ qui lui permet de mesurer l'angle $${alfa}$ vertical formé par le sommet $${lA}$ de la montagne, le point $${lB}$ et la base de la montagne $${lS}$.<br>`
          texte += `Il parcourt ensuite $${texNombre(distance)}\\text{ m}$ en direction de la montagne et effectue une nouvelle mesure de l'angle $${baita}$ en un point $${lC}$.<br>`
          texte +=
            "(Le schéma ci-dessous n'est pas en vraie grandeur et ne respecte pas les proportions.)<br>"
          texte += `  On donne : $${alfa}=${alpha}^\\circ$, $${baita}=${beta}^\\circ$ et $${lB}${lC}=${texNombre(distance)}\\text{ m}$.<br>`
          texte += mathalea2d(
            {
              xmin: Math.min(-sensH, absS + sensH),
              ymin: -1,
              xmax: Math.max(-sensH, absS + sensH),
              ymax: ordA + 1,
              pixelsParCm: 20,
              scale: 0.5,
            },
            objets,
          )
          enonceInit = texte
          if (this.sup) {
            enonceAMC = `${numAlpha(j)}Exprimer la mesure de l'angle $\\widehat{${lC}${lA}${lS}}$ en fonction de $${baita}$.`
            texte += enonceAMC
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                i + ii,
                KeyboardType.grecTrigo,
                {
                  texteAvant: `$${sp(20)}\\widehat{CAS}=$`,
                },
              )
              handleAnswers(this, i + ii, {
                reponse: {
                  // Attention, l'emplacement des espaces est primordial
                  value: [`90-${baitaInteractif}`],
                  options: { texteAvecCasse: true },
                },
              })
              ii++
            } else if (context.isAmc) {
              propositionsAMC[iiAMC] = {
                type: 'AMCOpen',
                propositions: [
                  {
                    texte: '',
                    statut: 2,
                    enonce: enonceInit + '<br>' + enonceAMC,
                    pointilles: false,
                  },
                ],
              }
              iiAMC++
            }
            enonceAMC = `${numAlpha(j + 1)}Exprimer la mesure de l'angle $\\widehat{${lB}${lA}${lS}}$ en fonction de $${alfa}$.`
            texte += '<br>' + enonceAMC
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                i + ii,
                KeyboardType.grecTrigo,
                {
                  texteAvant: `$${sp(20)}\\widehat{${lB}${lA}${lS}}=$`,
                },
              )
              handleAnswers(this, i + ii, {
                reponse: {
                  // Attention, l'emplacement des espaces est primordial
                  value: [`90-${alfaInteractif}`],
                  options: { texteAvecCasse: true },
                },
              })
              ii++
            } else if (context.isAmc) {
              propositionsAMC[iiAMC] = {
                type: 'AMCOpen',
                propositions: [
                  {
                    texte: '',
                    statut: 2,
                    enonce: enonceAMC,
                    pointilles: false,
                  },
                ],
              }
              iiAMC++
            }
            j += 2
          }
          enonceAMC = `${numAlpha(j)}Montrer que $\\widehat{${lC}${lA}${lH}}=${baita}-${alfa}$.`
          texte += '<br>' + enonceAMC
          if (context.isAmc) {
            propositionsAMC[iiAMC] = {
              type: 'AMCOpen',
              propositions: [
                {
                  texte: '',
                  statut: this.sup ? 2 : 4,
                  enonce: this.sup
                    ? enonceAMC
                    : enonceInit + '<br>' + enonceAMC,
                  pointilles: false,
                },
              ],
            }
            iiAMC++
          }
          j++
          if (this.sup) {
            enonceAMC = `${numAlpha(j)}Dans le triangle $${lC}${lH}${lA}$, exprimer $${lC}${lA}$ en fonction de $${lC}${lH}$.`
          } else {
            enonceAMC = `${numAlpha(j)}Exprimer $${lC}${lA}$ en fonction de $${lH}$.`
          }
          texte += '<br>' + enonceAMC
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              i + ii,
              KeyboardType.grecTrigo,
              {
                texteAvant: `$${sp(20)}CA=$`,
              },
            )
            handleAnswers(this, i + ii, {
              reponse: {
                value: `\\frac{CH}{\\sin(${baitaInteractif}-${alfaInteractif})}`,
                options: { calculFormel: true },
              },
            })
            ii++
          } else if (context.isAmc) {
            propositionsAMC[iiAMC] = {
              type: 'AMCOpen',
              propositions: [
                {
                  texte: '',
                  statut: 2,
                  enonce: enonceAMC,
                  pointilles: false,
                },
              ],
            }
            iiAMC++
          }
          j++
          if (this.sup) {
            enonceAMC = `${numAlpha(j)}Dans le triangle $${lB}${lC}${lH}$, exprimer $${lC}${lH}$ en fonction de $${lB}${lC}$.`
          } else {
            enonceAMC = `${numAlpha(j)}Exprimer $${lC}${lH}$ en fonction de $${lB}${lC}$.`
          }
          texte += '<br>' + enonceAMC
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              i + ii,
              KeyboardType.grecTrigo,
              {
                texteAvant: `$${sp(20)}${lC}${lH}=$`,
              },
            )
            handleAnswers(this, i + ii, {
              reponse: {
                value: `${lB}${lC}\\times\\sin(${alfaInteractif})`,
                options: { calculFormel: true },
              },
            })
            ii++
          } else if (context.isAmc) {
            propositionsAMC[iiAMC] = {
              type: 'AMCOpen',
              propositions: [
                {
                  texte: '',
                  statut: 2,
                  enonce: enonceAMC,
                  pointilles: false,
                },
              ],
            }
            iiAMC++
          }
          j++
          if (this.sup) {
            enonceAMC = `${numAlpha(j)}En déduire $h$ en fonction de $${lC}${lA}$, puis en fonction de $${lC}${lH}$ et enfin en fonction de $${lB}${lC}$.`
          } else {
            enonceAMC = `${numAlpha(j)}En déduire $h$ en fonction de $${lB}${lC}$.`
          }
          texte += '<br>' + enonceAMC
          enonceAMC += this.sup ? '<br>' : ''
          if (this.interactif) {
            texte +=
              '<br>' +
              ajouteChampTexteMathLive(this, i + ii, KeyboardType.grecTrigo, {
                texteAvant: `$${sp(20)}h=$`,
              })
            handleAnswers(this, i + ii, {
              reponse: {
                value: `${lA}${lC}\\times\\sin(${baitaInteractif})`,
                options: { calculFormel: true },
              },
            })
            ii++
            texte +=
              '<br>' +
              ajouteChampTexteMathLive(this, i + ii, KeyboardType.grecTrigo, {
                texteAvant: `$${sp(20)}h=$`,
              })
            handleAnswers(this, i + ii, {
              reponse: {
                value: [
                  `\\frac{${lC}${lH}\\times\\sin(${baitaInteractif})}{${baitaInteractif}-${alfaInteractif}}`,
                  `\\frac{\\sin(${baitaInteractif}\\times${lC}${lH}\\sin(${baitaInteractif})}{${baitaInteractif}-${alfaInteractif}}`,
                ],
                options: { calculFormel: true },
              },
            })
            ii++
            texte +=
              '<br>' +
              ajouteChampTexteMathLive(this, i + ii, KeyboardType.grecTrigo, {
                texteAvant: `$${sp(20)}h=$`,
              })
            handleAnswers(this, i + ii, {
              reponse: {
                value: [
                  `\\frac{${lB}${lC}\\times\\sin(${alfaInteractif})\\times\\sin(${baitaInteractif})}{${baitaInteractif}-${alfaInteractif}}`,
                  `\\frac{\\sin(${alfaInteractif})\\times${lB}${lC}\\times\\sin(${baitaInteractif})}{${baitaInteractif}-${alfaInteractif}}`,
                ],
                options: { calculFormel: true },
              },
            })
            ii++
          } else if (context.isAmc) {
            propositionsAMC[iiAMC] = {
              type: 'AMCOpen',
              propositions: [
                {
                  texte: '',
                  statut: 5,
                  enonce: enonceAMC,
                  pointilles: false,
                },
              ],
            }
            iiAMC++
          }
          j++
          enonceAMC = `${numAlpha(j)}En supposant que le point d'observation est au niveau du sol, quelle est la hauteur de la montagne ? `
          texte +=
            '<br>' +
            enonceAMC +
            "(arrondir au mètre près, en précisant l'unité)"
          enonceAMC += '(exprimer en mètres et arrondir au mètre près)'

          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              i + ii,
              KeyboardType.longueur,
            )
            handleAnswers(this, i + ii, {
              reponse: {
                value: new Grandeur(arrondi(taille, 0), 'm'),
                options: { unite: true, precisionUnite: 1 },
              },
            })
            ii++
          } else if (context.isAmc) {
            propositionsAMC[iiAMC] = {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  statut: '',
                  reponse: {
                    texte: enonceAMC,
                    valeur: [arrondi(taille, 0)],
                    alignement: 'center',
                    param: {
                      digits: nombreDeChiffresDe(arrondi(taille, 0)),
                      decimals: 0,
                      signe: false,
                    },
                  },
                },
              ],
            }
            iiAMC++
          }
          j = 0
          texteCorr = mathalea2d(
            {
              xmin: Math.min(-sensH, absS + sensH),
              ymin: -1,
              xmax: Math.max(-sensH, absS + sensH),
              ymax: ordA + 1,
              pixelsParCm: 20,
              scale: 0.5,
            },
            objets,
          )
          if (this.sup) {
            texteCorr += `${numAlpha(j)}Dans le triangle $${lC}${lS}${lA}$ rectangle en $${lS}$, les angles aigus sont complémentaires donc $\\widehat{${lC}${lA}${lS}}=${miseEnEvidence(`90-${baita}`)}$.<br>`
            texteCorr += `${numAlpha(j + 1)}Dans le triangle $${lB}${lS}${lA}$ rectangle en $${lS}$, pour la même raison $\\widehat{${lB}${lA}${lS}}=${miseEnEvidence(`90-${alfa}`)}$.<br>`
            j += 2
          }
          texteCorr += `${numAlpha(j)}On sait que $\\widehat{${lC}${lA}${lS}}=90-${baita}$ et $\\widehat{${lB}${lA}${lS}}=90-${alfa}$.<br>
          Donc $\\widehat{${lC}${lA}${lH}}=\\widehat{${lB}${lA}${lS}}-\\widehat{${lC}${lA}${lS}}=90-${alfa}-(90-${baita})=\\cancel{90}-${alfa}-\\cancel{90}+${baita}=${miseEnEvidence(`${baita}-${alfa}`)}$.<br>`
          j++
          texteCorr += `${numAlpha(j)}Dans le triangle $${lC}${lH}${lA}$ rectangle en $${lH}$, $\\sin(\\widehat{${lC}${lA}${lH}})=\\dfrac{${lC}${lH}}{${lC}${lA}}$ 
          d'où $${lC}${lA}=\\dfrac{${lC}${lH}}{\\sin(\\widehat{${lC}${lA}${lH}})}=${miseEnEvidence(`\\dfrac{${lC}${lH}}{\\sin(${baita}-${alfa})}`)}$.<br>`
          j++
          texteCorr += `${numAlpha(j)}Dans le triangle $${lB}${lC}${lH}$ rectangle en $${lH}$, $\\sin(\\widehat{${lC}${lB}${lH}})=\\dfrac{${lC}${lH}}{${lB}${lC}}$ 
          d'où $${lC}${lH}=${lB}${lC}\\times \\sin(\\widehat{${lC}${lB}${lH}})=${miseEnEvidence(`${lB}${lC}\\times \\sin(${alfa})`)}$.<br>`
          j++

          texteCorr += `${numAlpha(j)}Dans le triangle $${lC}${lS}${lA}$ rectangle en $${lS}$, 
          $h=${lC}${lA}\\times \\sin(${baita})=\\dfrac{${lC}${lH}}{\\sin(${baita}-${alfa})}\\times \\sin(${baita})=${miseEnEvidence(`\\dfrac{${lB}${lC}\\times \\sin(${alfa})}{\\sin(${baita}-${alfa})}\\times \\sin(${baita})`)}$<br>`

          j++
          texteCorr += `${numAlpha(j)}Application numérique : $h=\\dfrac{${texNombre(distance)}${sp()}\\text{m}\\times \\sin(${alpha}^\\circ)}{\\sin(${beta}^\\circ-${alpha}^\\circ)}\\times \\sin(${beta}^\\circ)=\\dfrac{${texNombre(distance)}${sp()}\\text{m}\\times \\sin(${alpha}^\\circ)\\times \\sin(${beta}^\\circ)}{\\sin(${beta - alpha}^\\circ)}\\approx ${miseEnEvidence(texNombre(Math.round(taille)))}$ ${texteEnCouleurEtGras('m')}.<br>`
          break
        case 6:
          {
            let objetsEnonce = []
            let paramsEnonce = {}

            const AD = randint(5, 9)
            const AE = randint(AD + 1, AD + 4)
            const AC = randint(3, AD - 1)
            const A = pointAbstrait(0, 0, 'A', 'below left')
            const C = pointAbstrait(AC, 0, 'C', 'below')
            const D = pointAbstrait(AD, 0, 'D', 'below right')
            const dDE = droiteVerticaleParPoint(D)
            const cAE = cercle(A, AE)
            const E = pointIntersectionLC(dDE, cAE, 'E')
            E.positionLabel = 'right'
            const p = polygone(A, D, E)
            const dAE = droite(A, E)
            const B = projectionOrtho(C, dAE, 'B', 'above left')
            const codage1 = codageAngleDroit(A, B, C)
            const codage2 = codageAngleDroit(A, D, E)
            const nomDesSommets = creerNomDePolygone(5, listeDeNomsDePolygones)
            listeDeNomsDePolygones.push(nomDesSommets)
            A.nom = nomDesSommets[0]
            B.nom = nomDesSommets[1]
            C.nom = nomDesSommets[2]
            D.nom = nomDesSommets[3]
            E.nom = nomDesSommets[4]
            const labels = labelPoint(A, B, C, D, E)
            /* const mirroir = choice([true, false]) // EE : Je n'ai pas compris l'intérêt ici s'il n'y a pas de miroir sur la figure
           if (mirroir) {
            B.x *= -1
            C.x *= -1
            D.x *= -1
            E.x *= -1
            A.positionLabel = 'below'
            B.positionLabel = 'above'
            C.positionLabel = 'below'
            D.positionLabel = 'below'
            E.positionLabel = 'above'
          } */
            const sBC = segment(B, C)

            objetsEnonce = [p, sBC, codage1, codage2, labels]
            paramsEnonce = {
              xmin: -10,
              ymin: -1,
              xmax: 10,
              ymax: E.y + 1.5,
              pixelsParCm: 20,
              scale: 1,
              mainlevee: false,
            }
            enonceAMC = `$${A.nom + E.nom} = ${AE}\\text{ cm}$, $${A.nom + D.nom} = ${AD}\\text{ cm}$ et $${A.nom + C.nom} = ${AC}\\text{ cm}$.`
            enonceAMC += '<br>' + mathalea2d(paramsEnonce, objetsEnonce)
            enonceAMC += `Calculer la longueur $${A.nom + B.nom}$ et donner une valeur approchée `
            texte = enonceAMC + "(au millimètre près, en précisant l'unité)."
            enonceAMC += 'en cm, au millimètre près.<br>'
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                i + ii,
                KeyboardType.longueur,
              )
              handleAnswers(this, i + ii, {
                reponse: {
                  value: new Grandeur(arrondi(longueur(A, B), 1), 'cm'),
                  options: { unite: true, precisionUnite: 0.01 },
                },
              })
              ii++
            } else if (context.isAmc) {
              propositionsAMC[iiAMC] = {
                type: 'AMCOpen',
                propositions: [
                  {
                    texte: '',
                    statut: 5,
                    enonce: enonceAMC,
                    pointilles: false,
                  },
                ],
              }
              iiAMC++
              propositionsAMC[iiAMC] = {
                type: 'AMCNum',
                propositions: [
                  {
                    texte: '',
                    statut: '',
                    reponse: {
                      texte: `Longueur calculée, exprimée en cm et arrondie au millième, du segment $[${A.nom + B.nom}]$ : `,
                      valeur: [arrondi(longueur(A, B), 1)],
                      alignement: 'center',
                      param: {
                        digits:
                          1 + nombreDeChiffresDe(arrondi(longueur(A, B), 1)),
                        decimals: 1,
                        signe: false,
                      },
                    },
                  },
                ],
              }
              iiAMC++
            }
            texteCorr = `Dans le triangle $${A.nom + D.nom + E.nom}$ rectangle en $${D.nom}$ : `
            texteCorr += `<br>$\\cos(\\widehat{${D.nom + A.nom + E.nom}})=\\dfrac{${A.nom + D.nom}}{${A.nom + E.nom}}\\quad$, soit $\\quad\\cos(\\widehat{${D.nom + A.nom + E.nom}})=\\dfrac{${AD}}{${AE}}$,`
            texteCorr += `<br> d'où $\\widehat{${D.nom + A.nom + E.nom}}=\\text{arccos}\\left(\\dfrac{${AD}}{${AE}}\\right)\\approx${texNombre(angle(D, A, E), 1)}^\\circ$.`

            texteCorr += `<br><br>Dans le triangle $${A.nom + B.nom + C.nom}$ rectangle en $${B.nom}$ : `
            texteCorr += `<br>$\\cos(\\widehat{${B.nom + A.nom + C.nom}})=\\dfrac{${A.nom + B.nom}}{${A.nom + C.nom}}\\quad$, soit $\\quad\\cos(${texNombre(arrondi(angle(D, A, E), 1))}^\\circ)\\approx\\dfrac{${A.nom + B.nom}}{${AC}}$,`
            texteCorr += `<br> d'où $${A.nom + B.nom} \\approx ${AC}${sp()}\\text{cm}\\times \\cos(${texNombre(arrondi(angle(D, A, E), 1))}^\\circ)\\approx${miseEnEvidence(texNombre(longueur(A, B), 1))}$ ${texteEnCouleurEtGras('cm')}.`

            // texteCorr += `<br><br>On pouvait aussi écrire : $${A.nom + B.nom} = ${AC}\\times \\cos\\left(\\text{arccos}\\left(\\dfrac{${AD}}{${AE}}\\right)\\right)=${AC}\\times \\dfrac{${AD}}{${AE}}=${texFractionReduite(AC * AD, AE)}\\text{ cm}$ qui est la valeur exacte.`
          }
          break
      }
      if (context.isAmc) {
        this.autoCorrectionAMC[i] = {
          // enonce: enonceAMC,
          enonce: '',
          // enonceAvant: this.nbQuestions > 1, // EE : ce champ est facultatif et permet (si false) de supprimer l'énoncé ci-dessus avant la numérotation de chaque question.
          enonceAvant: false, // EE : ce champ est facultatif et permet (si false) de supprimer l'énoncé ci-dessus avant la numérotation de chaque question.
          propositions: propositionsAMC,
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      }
      if (this.questionJamaisPosee(i, alfa, baita, beta, alpha)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
        ii-- // si on pousse la question, il ne faut pas que l'incrément de i et de ii se cumulent !
        iiAMC--
      } else {
        ii = iiInitial // on ne pousse pas la question, ii reprend la valeur qu'il avait avant la question
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
