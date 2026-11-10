import { afficheLongueurSegment } from '../../lib/2d/afficheLongueurSegment'
import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { codageSegments } from '../../lib/2d/CodageSegment'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { nommePolygone, polygone } from '../../lib/2d/polygones'
import { rotation } from '../../lib/2d/transformations'
import { triangle2points2longueurs } from '../../lib/2d/triangles'
import { angleOriente } from '../../lib/2d/utilitairesGeometriques'
import { pointAdistance } from '../../lib/2d/utilitairesPoint'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  arrondi,
  nombreDeChiffresDansLaPartieDecimale,
  nombreDeChiffresDe,
} from '../../lib/outils/nombres'
import { lettreDepuisChiffre, sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Agrandir ou réduire des figures, d'après une situation de proportionnalité"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const dateDePublication = '13/03/2022'
export const dateDeModifImportante = '03/04/2025'

/**
 * Trouver comment agrandir ou réduire des longueurs d'une figure et construire la figure demandée
 * @author Éric Elter
 */
export const uuid = 'e4d13'

export const refs = {
  'fr-fr': ['5P1C'],
  'fr-2016': ['6P14', '5P10-1'],
  'fr-ch': ['9R1FA1E-1', '9R2FA1E-1', '9R3FA1E-1', '10CTFA1A-1', '10LCFA1A-1', '10LSFA1A-1', 'PRQES05A-1', 'PRQPF04A-2'],
}
class AgrandirReduireFigure extends Exercice {
  constructor() {
    super()

    this.besoinFormulaireTexte = [
      'Type de figures',
      [
        'Nombres séparés par des tirets  :',
        '1 : Triangle équilatéral',
        '2 : Carré',
        "3 : Triangle avec coefficient de réduction ou d'agrandissement",
        '4 : Triangle avec longueur initiale et longueur finale',
        "5 : Rectangle avec coefficient de réduction ou d'agrandissement",
        '6 : Rectangle avec longueur initiale et longueur finale',
        '7 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire2Texte = [
      'Longueur maximum dans la figure à produire (5 minimum)',
      '',
    ]
    this.sup = 7
    this.sup2 = '15'
    this.nbQuestions = 4

    this.spacing = 2
    this.consigne = `Lorsqu'une figure est agrandie ou réduite, tous les côtés de la nouvelle figure sont proportionnels à ceux de la figure initiale, et sa forme est conservée.<br><br>`
  }

  nouvelleVersion() {
    const listeTypeQuestions = gestionnaireFormulaireTexte({
      max: 6,
      defaut: 7,
      melange: 7,
      nbQuestions: this.nbQuestions,
      saisie: this.sup,
    })
    const longueurMaximum = Math.max(5, Number(this.sup2))
    const texteAgrandissementOuReduction = [
      [' agrandissement', 'e réduction'],
      ["l'agrandissement demandé", 'la réduction demandée'],
    ] // Ne pas supprimer le 'e'
    let iiAMC // Cet indice permet de gérer les numéros de champs AMC car ces champs ne sont pas de nombre égal selon les listeTypeQuestions[i].
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 200;) {
      let texte, texteCorr, absBFinal, coeffFinal, longueurMax
      do {
        texte = ''
        texteCorr = ''
        const propositionsAMC = []
        iiAMC = 0
        const objets = []
        const coefAgrandissement = [1.5, 2, 3, 5, 0.5, 0.25, 0.75]
        const coefReduction = [
          new FractionEtendue(1, 2),
          new FractionEtendue(1, 4),
          new FractionEtendue(3, 4),
        ]
        const choixAgrandissementOuReduction = randint(0, 6)
        const A = pointAbstrait(0, 0)
        const absB =
          choixAgrandissementOuReduction < 4
            ? randint(5, 11, [6, 9])
            : 2 * randint(4, 7)
        // On en a besoin pour this.qusetionJamaisPosee()
        absBFinal = absB
        coeffFinal = coefAgrandissement[choixAgrandissementOuReduction]
        switch (listeTypeQuestions[i]) {
          case 1:
            {
              // Triangle équilatéral
              const reponse = arrondi(
                coefAgrandissement[choixAgrandissementOuReduction] * absB,
                1,
              )
              const alpha = randint(10, 170)
              const alphaCorr = randint(10, 170, [alpha])
              const sensRotation = choice([-1, 1])
              const B = pointAdistance(A, absB, sensRotation * alpha)
              const BCorr = pointAdistance(A, reponse, sensRotation * alphaCorr)
              const C = pointAdistance(A, absB, sensRotation * (alpha + 60))
              const CCorr = pointAdistance(
                A,
                reponse,
                sensRotation * (alphaCorr + 60),
              )
              const polygoneInit = polygone(A, B, C)
              const polygoneCorr = polygone(A, BCorr, CCorr)
              const numA = randint(1, 26, [4, 5, 15, 23, 24, 25])
              const numB = randint(1, 26, [4, 5, 15, 23, 24, 25, numA])
              const numC = randint(1, 26, [4, 5, 15, 23, 24, 25, numA, numB])
              const nom =
                lettreDepuisChiffre(numA) +
                lettreDepuisChiffre(numB) +
                lettreDepuisChiffre(numC)
              const numACorr = randint(1, 26, [
                4,
                5,
                15,
                23,
                24,
                25,
                numA,
                numB,
                numC,
              ])
              const numBCorr = randint(1, 26, [
                4,
                5,
                15,
                23,
                24,
                25,
                numA,
                numB,
                numACorr,
              ])
              const numCCorr = randint(1, 26, [
                4,
                5,
                15,
                23,
                24,
                25,
                numA,
                numB,
                numACorr,
                numBCorr,
              ])
              const nomCorr =
                lettreDepuisChiffre(numACorr) +
                lettreDepuisChiffre(numBCorr) +
                lettreDepuisChiffre(numCCorr)
              objets.push(
                polygoneInit,
                codageSegments('||', 'red', polygoneInit.listePoints),
                afficheLongueurSegment(
                  sensRotation < 0 ? A : B,
                  sensRotation < 0 ? B : A,
                  bleuMathalea,
                  0.5,
                  '',
                  true,
                ),
                nommePolygone(polygoneInit, nom),
              )
              const enonceInit = `On décide d'effectuer un${texteAgrandissementOuReduction[0][choixAgrandissementOuReduction < 4 ? 0 : 1]} de coefficient $${texNombre(coefAgrandissement[choixAgrandissementOuReduction])}$ du triangle équilatéral ${nom}. Quelle sera la longueur du côté du triangle à construire ?`
              texte += enonceInit
              const enonceAMC =
                '<br>' +
                mathalea2d(
                  Object.assign(
                    {
                      pixelsParCm: 20,
                      scale: 0.5,
                    },
                    fixeBordures(objets),
                  ),
                  objets,
                )
              if (this.interactif) {
                texte += ajouteChampTexteMathLive(
                  this,
                  i,
                  KeyboardType.clavierNumbers,
                )
                texte += enonceAMC
                handleAnswers(this, i, { reponse: { value: reponse } })
              } else if (!context.isAmc) {
                texte += `Trace un${texteAgrandissementOuReduction[0][choixAgrandissementOuReduction < 4 ? 0 : 1]} de coefficient $${texNombre(coefAgrandissement[choixAgrandissementOuReduction])}$ du triangle ${nom}.`
                texte +=
                  '<br>' +
                  mathalea2d(
                    Object.assign(
                      { pixelsParCm: 20, scale: 0.5 },
                      fixeBordures(objets),
                    ),
                    objets,
                  )
              } else {
                propositionsAMC[iiAMC] = {
                  type: 'AMCOpen',
                  propositions: [
                    {
                      texte: '',
                      statut: 1,
                      sanscadre: true,
                      enonce:
                        enonceAMC +
                        `<br>Trace, sur une feuille blanche, ${texteAgrandissementOuReduction[1][choixAgrandissementOuReduction < 4 ? 0 : 1]}.`,
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
                        texte: enonceInit,
                        valeur: [reponse],
                        alignement: 'center',
                        param: {
                          digits: nombreDeChiffresDe(reponse),
                          decimals:
                            nombreDeChiffresDansLaPartieDecimale(reponse),
                          signe: false,
                        },
                      },
                    },
                  ],
                }
                iiAMC++
              }
              texteCorr = `Effectuer un${texteAgrandissementOuReduction[0][choixAgrandissementOuReduction < 4 ? 0 : 1]} de coefficient $${texNombre(coefAgrandissement[choixAgrandissementOuReduction])}$ implique de multiplier toutes les longueurs par ce coefficient`
              if (choixAgrandissementOuReduction >= 4) {
                texteCorr += ` ou bien, comme $${texNombre(coefAgrandissement[choixAgrandissementOuReduction])}=${coefReduction[choixAgrandissementOuReduction - 4].texFraction}$, cela revient à diviser toutes les longueurs par $${coefReduction[choixAgrandissementOuReduction - 4].den}$`
                texteCorr +=
                  choixAgrandissementOuReduction === 6
                    ? ' puis multiplier chacun de ces résultats par $3$'
                    : ''
              }
              texteCorr += '.<br>'
              texteCorr += `$${absB} \\times ${texNombre(coefAgrandissement[choixAgrandissementOuReduction])}=${miseEnEvidence(texNombre(reponse))}$`
              if (choixAgrandissementOuReduction === 6) {
                texteCorr += ` ou bien $(${absB} \\div 4) \\times 3=${texNombre(arrondi(absB / 4, 1))} \\times 3=${miseEnEvidence(texNombre(reponse))}$`
              } else if (choixAgrandissementOuReduction >= 4) {
                texteCorr += ` ou bien $${absB} \\div ${coefReduction[choixAgrandissementOuReduction - 4].den}=${miseEnEvidence(texNombre(reponse))}$`
              }
              texteCorr += `<br>Le triangle équilatéral issu d'un${texteAgrandissementOuReduction[0][choixAgrandissementOuReduction < 4 ? 0 : 1]} du triangle ${nom} de coefficient $${texNombre(coefAgrandissement[choixAgrandissementOuReduction])}$ possède donc des côtés de longueur $${miseEnEvidence(texNombre(reponse))}$.`
              texteCorr += '<br>En voici, une réalisation ci-dessous.'
              objets.push(
                polygoneCorr,
                codageSegments('|||', bleuMathalea, polygoneCorr.listePoints),
                afficheLongueurSegment(
                  sensRotation < 0 ? A : BCorr,
                  sensRotation < 0 ? BCorr : A,
                  'red',
                  0.5,
                  '',
                  true,
                ),
                nommePolygone(polygoneCorr, nomCorr),
              )
              texteCorr +=
                '<br>' +
                mathalea2d(
                  Object.assign(
                    { pixelsParCm: 20, scale: 0.5 },
                    fixeBordures(objets),
                  ),
                  objets,
                )
              longueurMax = reponse
            }
            break
          case 2:
            {
              // Carré
              const reponse = arrondi(
                coefAgrandissement[choixAgrandissementOuReduction] * absB,
                1,
              )
              const alpha = randint(10, 170)
              const alphaCorr = randint(10, 170, [alpha])
              const sensRotation = choice([-1, 1])
              const B = pointAdistance(A, absB, sensRotation * alpha)
              const BCorr = pointAdistance(A, reponse, sensRotation * alphaCorr)
              const C = rotation(A, B, 90)
              const D = rotation(B, A, -90)
              const CCorr = rotation(A, BCorr, 90)
              const DCorr = rotation(BCorr, A, -90)
              const polygoneInit = polygone(A, B, C, D)
              const polygoneCorr = polygone(A, BCorr, CCorr, DCorr)
              const numA = randint(1, 26, [4, 5, 15, 23, 24, 25])
              const numB = randint(1, 26, [4, 5, 15, 23, 24, 25, numA])
              const numC = randint(1, 26, [4, 5, 15, 23, 24, 25, numA, numB])
              const numD = randint(1, 26, [
                4,
                5,
                15,
                23,
                24,
                25,
                numA,
                numB,
                numC,
              ])
              const nom =
                lettreDepuisChiffre(numA) +
                lettreDepuisChiffre(numB) +
                lettreDepuisChiffre(numC) +
                lettreDepuisChiffre(numD)
              const numACorr = randint(1, 26, [
                4,
                5,
                15,
                23,
                24,
                25,
                numA,
                numB,
                numC,
              ])
              const numBCorr = randint(1, 26, [
                4,
                5,
                15,
                23,
                24,
                25,
                numA,
                numB,
                numACorr,
              ])
              const numCCorr = randint(1, 26, [
                4,
                5,
                15,
                23,
                24,
                25,
                numA,
                numB,
                numACorr,
                numBCorr,
              ])
              const numDCorr = randint(1, 26, [
                4,
                5,
                15,
                23,
                24,
                25,
                numA,
                numB,
                numACorr,
                numBCorr,
                numCCorr,
              ])
              const nomCorr =
                lettreDepuisChiffre(numACorr) +
                lettreDepuisChiffre(numBCorr) +
                lettreDepuisChiffre(numCCorr) +
                lettreDepuisChiffre(numDCorr)
              objets.push(
                polygoneInit,
                codageSegments('||', 'red', polygoneInit.listePoints),
                afficheLongueurSegment(A, B, bleuMathalea, 0.5, '', true),
                nommePolygone(polygoneInit, nom),
              )
              objets.push(
                codageAngleDroit(A, B, C),
                codageAngleDroit(D, C, B),
                codageAngleDroit(A, D, C),
                codageAngleDroit(B, A, D),
              )
              const enonceInit = `On décide d'effectuer un${texteAgrandissementOuReduction[0][choixAgrandissementOuReduction < 4 ? 0 : 1]} de coefficient $${texNombre(coefAgrandissement[choixAgrandissementOuReduction])}$, du carré ${nom}. Quelle sera la longueur du côté du carré à construire ?`
              texte += enonceInit
              const enonceAMC =
                '<br>' +
                mathalea2d(
                  Object.assign(
                    {
                      pixelsParCm: 20,
                      scale: 0.5,
                    },
                    fixeBordures(objets),
                  ),
                  objets,
                )
              if (this.interactif) {
                texte += ajouteChampTexteMathLive(
                  this,
                  i,
                  KeyboardType.clavierNumbers,
                )
                texte += enonceAMC
                handleAnswers(this, i, { reponse: { value: reponse } })
              } else if (!context.isAmc) {
                texte += `Trace un${texteAgrandissementOuReduction[0][choixAgrandissementOuReduction < 4 ? 0 : 1]} de coefficient $${texNombre(coefAgrandissement[choixAgrandissementOuReduction])}$ du carré ${nom}.`
                texte +=
                  '<br>' +
                  mathalea2d(
                    Object.assign(
                      { pixelsParCm: 20, scale: 0.5 },
                      fixeBordures(objets),
                    ),
                    objets,
                  )
              } else {
                propositionsAMC[iiAMC] = {
                  type: 'AMCOpen',
                  propositions: [
                    {
                      texte: '',
                      statut: 1,
                      sanscadre: true,
                      enonce:
                        enonceAMC +
                        `<br>Trace, sur une feuille blanche, ${texteAgrandissementOuReduction[1][choixAgrandissementOuReduction < 4 ? 0 : 1]}.`,
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
                        texte: enonceInit,
                        valeur: [reponse],
                        alignement: 'center',
                        param: {
                          digits: nombreDeChiffresDe(reponse),
                          decimals:
                            nombreDeChiffresDansLaPartieDecimale(reponse),
                          signe: false,
                        },
                      },
                    },
                  ],
                }
                iiAMC++
              }
              texteCorr = `Effectuer un${texteAgrandissementOuReduction[0][choixAgrandissementOuReduction < 4 ? 0 : 1]} de coefficient $${texNombre(coefAgrandissement[choixAgrandissementOuReduction])}$ implique de multiplier toutes les longueurs par ce coefficient`
              if (choixAgrandissementOuReduction >= 4) {
                texteCorr += ` ou bien, comme $${texNombre(coefAgrandissement[choixAgrandissementOuReduction])}=${coefReduction[choixAgrandissementOuReduction - 4].texFraction}$, cela revient à diviser toutes les longueurs par $${coefReduction[choixAgrandissementOuReduction - 4].den}$`
                texteCorr +=
                  choixAgrandissementOuReduction === 6
                    ? ' puis multiplier chacun de ces résultats par $3$'
                    : ''
              }
              texteCorr += '.<br>'
              texteCorr += `$${absB} \\times ${texNombre(coefAgrandissement[choixAgrandissementOuReduction])}=${miseEnEvidence(texNombre(reponse))}$`
              if (choixAgrandissementOuReduction === 6) {
                texteCorr += ` ou bien $(${absB} \\div 4) \\times 3=${texNombre(arrondi(absB / 4, 1))} \\times 3=${miseEnEvidence(texNombre(reponse))}$`
              } else if (choixAgrandissementOuReduction >= 4) {
                texteCorr += ` ou bien $${absB} \\div ${coefReduction[choixAgrandissementOuReduction - 4].den}=${miseEnEvidence(texNombre(reponse))}$`
              }
              texteCorr += `<br>Le carré issu d'un${texteAgrandissementOuReduction[0][choixAgrandissementOuReduction < 4 ? 0 : 1]} du carré ${nom} de coefficient $${texNombre(coefAgrandissement[choixAgrandissementOuReduction])}$ possède donc des côtés de longueur $${miseEnEvidence(texNombre(reponse))}$.`
              texteCorr += '<br>En voici, une réalisation ci-dessous.'
              objets.push(
                polygoneCorr,
                codageSegments('|||', bleuMathalea, polygoneCorr.listePoints),
                afficheLongueurSegment(A, BCorr, 'red', 0.5, '', true),
                nommePolygone(polygoneCorr, nomCorr),
              )
              objets.push(
                codageAngleDroit(A, BCorr, CCorr),
                codageAngleDroit(DCorr, CCorr, BCorr),
                codageAngleDroit(A, DCorr, CCorr),
                codageAngleDroit(BCorr, A, DCorr),
              )
              texteCorr +=
                '<br>' +
                mathalea2d(
                  Object.assign(
                    { pixelsParCm: 20, scale: 0.5 },
                    fixeBordures(objets),
                  ),
                  objets,
                )
              longueurMax = reponse
            }
            break
          case 3:
            {
              // Triangle avec coefficient de réduction ou d'agrandissement
              const absC =
                choixAgrandissementOuReduction < 4
                  ? randint(5, 11, [6, 9, absB])
                  : 2 * randint(4, 7, [arrondi(absB / 2, 0)])
              // Le code ci-dessous ne permet pas dans certains cas de trouver une valeur aléatoire
              const absD =
                choixAgrandissementOuReduction < 4
                  ? randint(1 + Math.abs(absB - absC), absB + absC - 1, [
                      6,
                      9,
                      absB,
                      absC,
                    ])
                  : 2 *
                    randint(4, 7, [arrondi(absB / 2, 0), arrondi(absC / 2, 0)])
              const reponse = arrondi(
                coefAgrandissement[choixAgrandissementOuReduction] * absB,
                1,
              )
              const reponse1 = arrondi(
                coefAgrandissement[choixAgrandissementOuReduction] * absC,
                1,
              )
              const reponse2 = arrondi(
                coefAgrandissement[choixAgrandissementOuReduction] * absD,
                1,
              )
              const alpha = randint(10, 170)
              const alphaCorr = randint(10, 170, [alpha])
              const sensRotation = choice([-1, 1])
              const B = pointAdistance(A, absB, sensRotation * alpha)
              const BCorr = pointAdistance(A, reponse, sensRotation * alphaCorr)
              const choixOrientation = randint(1, 2)
              const polygoneInit = triangle2points2longueurs(
                A,
                B,
                absC,
                absD,
                choixOrientation,
              )
              const C = polygoneInit.listePoints[2]
              const polygoneCorr = triangle2points2longueurs(
                A,
                BCorr,
                reponse1,
                reponse2,
                choixOrientation,
              )
              const CCorr = polygoneCorr.listePoints[2]
              const numA = randint(1, 26, [4, 5, 15, 23, 24, 25])
              const numB = randint(1, 26, [4, 5, 15, 23, 24, 25, numA])
              const numC = randint(1, 26, [4, 5, 15, 23, 24, 25, numA, numB])
              const nom =
                lettreDepuisChiffre(numA) +
                lettreDepuisChiffre(numB) +
                lettreDepuisChiffre(numC)

              objets.push(polygoneInit, nommePolygone(polygoneInit, nom))
              objets.push(
                afficheLongueurSegment(
                  angleOriente(C, A, B) > 0 ? A : B,
                  angleOriente(C, A, B) > 0 ? B : A,
                  bleuMathalea,
                  0.5,
                  '',
                  true,
                ),
              )
              objets.push(
                afficheLongueurSegment(
                  angleOriente(A, B, C) > 0 ? B : C,
                  angleOriente(A, B, C) > 0 ? C : B,
                  bleuMathalea,
                  0.5,
                  '',
                  true,
                ),
              )
              objets.push(
                afficheLongueurSegment(
                  angleOriente(B, C, A) > 0 ? C : A,
                  angleOriente(B, C, A) > 0 ? A : C,
                  bleuMathalea,
                  0.5,
                  '',
                  true,
                ),
              )
              const enonceInit = `On décide d'effectuer un${texteAgrandissementOuReduction[0][choixAgrandissementOuReduction < 4 ? 0 : 1]} de coefficient $${texNombre(coefAgrandissement[choixAgrandissementOuReduction])}$ du triangle ${nom}. Quelles seront les longueurs respectives de chaque côté du triangle à construire ?`
              const enonceAMC =
                '<br>' +
                mathalea2d(
                  Object.assign(
                    {
                      pixelsParCm: 20,
                      scale: 0.5,
                    },
                    fixeBordures(objets),
                  ),
                  objets,
                )
              let correctionParticularite = ''
              if (this.interactif) {
                texte += enonceInit
                texte += enonceAMC
                switch (choice([1, 2, 3])) {
                  case 1:
                    texte +=
                      '<br> Dans le nouveau triangle, la plus petite longueur sera :' +
                      ajouteChampTexteMathLive(
                        this,
                        i,
                        KeyboardType.clavierNumbers,
                      )
                    handleAnswers(this, i, {
                      reponse: { value: Math.min(reponse, reponse1, reponse2) },
                    })
                    correctionParticularite +=
                      'Dans le nouveau triangle, la plus petite longueur sera $' +
                      miseEnEvidence(
                        texNombre(Math.min(reponse, reponse1, reponse2)),
                      ) +
                      '$.'
                    break
                  case 2:
                    texte +=
                      '<br> Dans le nouveau triangle, la plus grande longueur sera :' +
                      ajouteChampTexteMathLive(
                        this,
                        i,
                        KeyboardType.clavierNumbers,
                      )
                    handleAnswers(this, i, {
                      reponse: { value: Math.max(reponse, reponse1, reponse2) },
                    })
                    correctionParticularite +=
                      'Dans le nouveau triangle, la plus grande longueur sera $' +
                      miseEnEvidence(
                        texNombre(Math.min(reponse, reponse1, reponse2)),
                      ) +
                      '$.'
                    break
                  case 3: {
                    texte +=
                      "<br> Dans le nouveau triangle, la longueur, qui n'est ni la plus petite, ni la plus grande, sera :" +
                      ajouteChampTexteMathLive(
                        this,
                        i,
                        KeyboardType.clavierNumbers,
                      )
                    let derniereReponse
                    // Trouver la valeur minimale et la valeur maximale
                    const minValue = Math.min(reponse, reponse1, reponse2)
                    const maxValue = Math.max(reponse, reponse1, reponse2)

                    // Cas où toutes les valeurs sont égales
                    if (minValue === maxValue) {
                      derniereReponse = minValue // ou maxValue, c'est la même chose ici
                    } else {
                      // Filtrer les valeurs pour récupérer celle qui n'est ni min ni max
                      const values = [reponse, reponse1, reponse2]
                      const middleValues = values.filter(
                        (value) => value !== minValue && value !== maxValue,
                      )

                      // Retourner la valeur intermédiaire
                      derniereReponse = middleValues[0]
                    }
                    handleAnswers(this, i, {
                      reponse: { value: derniereReponse },
                    })
                    correctionParticularite +=
                      "Dans le nouveau triangle, la longueur, qui n'est ni la plus petite, ni la plus grande, sera $" +
                      miseEnEvidence(texNombre(derniereReponse)) +
                      '$.'
                    break
                  }
                }
              } else if (!context.isAmc) {
                texte += `Trace un${texteAgrandissementOuReduction[0][choixAgrandissementOuReduction < 4 ? 0 : 1]} de coefficient $${texNombre(coefAgrandissement[choixAgrandissementOuReduction])}$ du triangle ${nom}.`
                texte +=
                  '<br>' +
                  mathalea2d(
                    Object.assign(
                      { pixelsParCm: 20, scale: 0.5 },
                      fixeBordures(objets),
                    ),
                    objets,
                  )
              } else {
                propositionsAMC[iiAMC] = {
                  type: 'AMCOpen',
                  propositions: [
                    {
                      texte: '',
                      statut: 1,
                      sanscadre: true,
                      enonce:
                        enonceAMC +
                        `<br>Trace, sur une feuille blanche, ${texteAgrandissementOuReduction[1][choixAgrandissementOuReduction < 4 ? 0 : 1]}.`,
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
                        texte:
                          enonceInit +
                          '<br> <br>Dans le nouveau triangle, la plus petite longueur sera :',
                        valeur: [Math.min(reponse, reponse1, reponse2)],
                        alignement: 'center',
                        param: {
                          digits: nombreDeChiffresDe(
                            Math.min(reponse, reponse1, reponse2),
                          ),
                          decimals: nombreDeChiffresDansLaPartieDecimale(
                            Math.min(reponse, reponse1, reponse2),
                          ),
                          signe: false,
                        },
                      },
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
                        texte:
                          'Dans le nouveau triangle, la plus grande longueur sera :',
                        valeur: [Math.max(reponse, reponse1, reponse2)],
                        alignement: 'center',
                        param: {
                          digits: nombreDeChiffresDe(
                            Math.max(reponse, reponse1, reponse2),
                          ),
                          decimals: nombreDeChiffresDansLaPartieDecimale(
                            Math.max(reponse, reponse1, reponse2),
                          ),
                          signe: false,
                        },
                      },
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
                        texte:
                          'Dans le nouveau triangle, la dernière longueur sera :',
                        valeur: [
                          choice(
                            [reponse, reponse1, reponse2],
                            [
                              Math.min(reponse, reponse1, reponse2),
                              Math.max(reponse, reponse1, reponse2),
                            ],
                          ),
                        ],
                        alignement: 'center',
                        param: {
                          digits: nombreDeChiffresDe(
                            choice(
                              [reponse, reponse1, reponse2],
                              [
                                Math.min(reponse, reponse1, reponse2),
                                Math.max(reponse, reponse1, reponse2),
                              ],
                            ),
                          ),
                          decimals: nombreDeChiffresDansLaPartieDecimale(
                            choice(
                              [reponse, reponse1, reponse2],
                              [
                                Math.min(reponse, reponse1, reponse2),
                                Math.max(reponse, reponse1, reponse2),
                              ],
                            ),
                          ),
                          signe: false,
                        },
                      },
                    },
                  ],
                }
                iiAMC++
              }
              texteCorr = `Effectuer un${texteAgrandissementOuReduction[0][choixAgrandissementOuReduction < 4 ? 0 : 1]} de coefficient $${texNombre(coefAgrandissement[choixAgrandissementOuReduction])}$ implique de multiplier toutes les longueurs par ce coefficient`
              if (choixAgrandissementOuReduction >= 4) {
                texteCorr += ` ou bien, comme $${texNombre(coefAgrandissement[choixAgrandissementOuReduction])}=${coefReduction[choixAgrandissementOuReduction - 4].texFraction}$, cela revient à diviser toutes les longueurs par $${coefReduction[choixAgrandissementOuReduction - 4].den}$`
                texteCorr +=
                  choixAgrandissementOuReduction === 6
                    ? ' puis multiplier chacun de ces résultats par $3$'
                    : ''
              }
              texteCorr += '.<br>'
              texteCorr += `$${absB} \\times ${texNombre(coefAgrandissement[choixAgrandissementOuReduction])}=${texNombre(reponse)}${sp(10)}${absC} \\times ${texNombre(coefAgrandissement[choixAgrandissementOuReduction])}=${texNombre(reponse1)}${sp(10)}${absD} \\times ${texNombre(coefAgrandissement[choixAgrandissementOuReduction])}=${miseEnEvidence(texNombre(reponse2))}$`
              if (choixAgrandissementOuReduction === 6) {
                texteCorr += `${sp(10)} ou bien ${sp(10)}$(${absB} \\div 4) \\times 3=${texNombre(arrondi(absB / 4, 1))} \\times 3=${miseEnEvidence(texNombre(reponse))}$`
                texteCorr += `${sp(10)}$(${absC} \\div 4) \\times 3=${texNombre(arrondi(absC / 4, 1))} \\times 3=${miseEnEvidence(texNombre(reponse1))}$`
                texteCorr += `${sp(10)}$(${absD} \\div 4) \\times 3=${texNombre(arrondi(absD / 4, 1))} \\times 3=${miseEnEvidence(texNombre(reponse2))}$`
              } else if (choixAgrandissementOuReduction >= 4) {
                texteCorr += `${sp(10)} ou bien ${sp(10)}$${absB} \\div ${coefReduction[choixAgrandissementOuReduction - 4].den}=${miseEnEvidence(texNombre(reponse))}$`
                texteCorr += `${sp(10)}$${absC} \\div ${coefReduction[choixAgrandissementOuReduction - 4].den}=${miseEnEvidence(texNombre(reponse1))}$`
                texteCorr += `${sp(10)}$${absD} \\div ${coefReduction[choixAgrandissementOuReduction - 4].den}=${miseEnEvidence(texNombre(reponse2))}$`
              }
              texteCorr += `<br>Le triangle issu d'un${texteAgrandissementOuReduction[0][choixAgrandissementOuReduction < 4 ? 0 : 1]} du triangle ${nom} de coefficient $${texNombre(coefAgrandissement[choixAgrandissementOuReduction])}$ possède donc des côtés de longueur respective $${texNombre(reponse)}$ ; $${texNombre(reponse1)}$ et $${miseEnEvidence(texNombre(reponse2))}$.`
              texteCorr += '<br>' + correctionParticularite
              texteCorr += '<br>En voici, une réalisation ci-dessous.'
              objets.push(polygoneCorr)
              objets.push(
                afficheLongueurSegment(
                  angleOriente(CCorr, A, BCorr) > 0 ? A : BCorr,
                  angleOriente(CCorr, A, BCorr) > 0 ? BCorr : A,
                  'red',
                  0.5,
                  '',
                  true,
                ),
              )
              objets.push(
                afficheLongueurSegment(
                  angleOriente(A, BCorr, CCorr) > 0 ? BCorr : CCorr,
                  angleOriente(A, BCorr, CCorr) > 0 ? CCorr : BCorr,
                  'red',
                  0.5,
                  '',
                  true,
                ),
              )
              objets.push(
                afficheLongueurSegment(
                  angleOriente(BCorr, CCorr, A) > 0 ? CCorr : A,
                  angleOriente(BCorr, CCorr, A) > 0 ? A : CCorr,
                  'red',
                  0.5,
                  '',
                  true,
                ),
              )
              texteCorr +=
                '<br>' +
                mathalea2d(
                  Object.assign(
                    { pixelsParCm: 20, scale: 0.5 },
                    fixeBordures(objets),
                  ),
                  objets,
                )
              longueurMax = Math.max(reponse, reponse1, reponse2)
            }
            break
          case 4:
            {
              // Triangle avec longueur initiale et longueur finale
              const absC =
                choixAgrandissementOuReduction < 4
                  ? randint(5, 11, [6, 9, absB])
                  : 2 * randint(4, 7, [arrondi(absB / 2, 0)])
              // Le code ci-dessous ne permet pas dans certains cas de trouver une valeur aléatoire
              const absD =
                choixAgrandissementOuReduction < 4
                  ? randint(5, 11, [6, 9, absB, absC])
                  : 2 *
                    randint(4, 7, [arrondi(absB / 2, 0), arrondi(absC / 2, 0)])
              const reponse = arrondi(
                coefAgrandissement[choixAgrandissementOuReduction] * absB,
                1,
              )
              const reponse1 = arrondi(
                coefAgrandissement[choixAgrandissementOuReduction] * absC,
                1,
              )
              const reponse2 = arrondi(
                coefAgrandissement[choixAgrandissementOuReduction] * absD,
                1,
              )
              const alpha = randint(10, 170)
              const alphaCorr = randint(10, 170, [alpha])
              const sensRotation = choice([-1, 1])
              const B = pointAdistance(A, absB, sensRotation * alpha)
              const BCorr = pointAdistance(A, reponse, sensRotation * alphaCorr)
              const choixOrientation = randint(1, 2)
              const polygoneInit = triangle2points2longueurs(
                A,
                B,
                absC,
                absD,
                choixOrientation,
              )
              const C = polygoneInit.listePoints[2]
              const polygoneCorr = triangle2points2longueurs(
                A,
                BCorr,
                reponse1,
                reponse2,
                choixOrientation,
              )
              const CCorr = polygoneCorr.listePoints[2]
              const numA = randint(1, 26, [4, 5, 15, 23, 24, 25])
              const numB = randint(1, 26, [4, 5, 15, 23, 24, 25, numA])
              const numC = randint(1, 26, [4, 5, 15, 23, 24, 25, numA, numB])
              const nom =
                lettreDepuisChiffre(numA) +
                lettreDepuisChiffre(numB) +
                lettreDepuisChiffre(numC)
              objets.push(polygoneInit, nommePolygone(polygoneInit, nom))
              objets.push(
                afficheLongueurSegment(
                  angleOriente(C, A, B) > 0 ? A : B,
                  angleOriente(C, A, B) > 0 ? B : A,
                  bleuMathalea,
                  0.5,
                  '',
                  true,
                ),
              )
              objets.push(
                afficheLongueurSegment(
                  angleOriente(A, B, C) > 0 ? B : C,
                  angleOriente(A, B, C) > 0 ? C : B,
                  bleuMathalea,
                  0.5,
                  '',
                  true,
                ),
              )
              objets.push(
                afficheLongueurSegment(
                  angleOriente(B, C, A) > 0 ? C : A,
                  angleOriente(B, C, A) > 0 ? A : C,
                  bleuMathalea,
                  0.5,
                  '',
                  true,
                ),
              )
              const enonceInit = `On décide d'effectuer un${texteAgrandissementOuReduction[0][choixAgrandissementOuReduction < 4 ? 0 : 1]} du triangle ${nom}, de telle sorte que la longueur du côté associé à [${lettreDepuisChiffre(numB) + lettreDepuisChiffre(numC)}] mesurera $${texNombre(reponse2)}$.<br>Quelles seront les longueurs respectives des deux autres côtés du triangle à construire ?`
              const enonceAMC =
                '<br>' +
                mathalea2d(
                  Object.assign(
                    {
                      pixelsParCm: 20,
                      scale: 0.5,
                    },
                    fixeBordures(objets),
                  ),
                  objets,
                )
              let correctionParticularite = ''
              if (this.interactif) {
                texte += enonceInit
                texte += enonceAMC
                switch (choice([1, 2])) {
                  case 1:
                    texte +=
                      '<br> Dans le nouveau triangle, la plus petite longueur à trouver sera :' +
                      ajouteChampTexteMathLive(
                        this,
                        i,
                        KeyboardType.clavierNumbers,
                      )
                    handleAnswers(this, i, {
                      reponse: { value: Math.min(reponse, reponse1) },
                    })
                    correctionParticularite +=
                      'Dans le nouveau triangle, la plus petite longueur à trouver sera $' +
                      miseEnEvidence(texNombre(Math.min(reponse, reponse1))) +
                      '$.'
                    break
                  case 2:
                    texte +=
                      '<br> Dans le nouveau triangle, la plus grande longueur à trouver sera :' +
                      ajouteChampTexteMathLive(
                        this,
                        i,
                        KeyboardType.clavierNumbers,
                      )
                    handleAnswers(this, i, {
                      reponse: { value: Math.max(reponse, reponse1) },
                    })
                    correctionParticularite +=
                      'Dans le nouveau triangle, la plus grande longueur à trouver sera $' +
                      miseEnEvidence(texNombre(Math.max(reponse, reponse1))) +
                      '$.'
                    break
                }
              } else if (!context.isAmc) {
                texte += `Trace un${texteAgrandissementOuReduction[0][choixAgrandissementOuReduction < 4 ? 0 : 1]} du triangle ${nom} de telle sorte que la longueur du côté associé à [${lettreDepuisChiffre(numB) + lettreDepuisChiffre(numC)}] mesurera $${texNombre(reponse2)}$.`
                texte +=
                  '<br>' +
                  mathalea2d(
                    Object.assign(
                      { pixelsParCm: 20, scale: 0.5 },
                      fixeBordures(objets),
                    ),
                    objets,
                  )
              } else {
                propositionsAMC[iiAMC] = {
                  type: 'AMCOpen',
                  propositions: [
                    {
                      texte: '',
                      statut: 1,
                      sanscadre: true,
                      enonce:
                        enonceAMC +
                        `<br>Trace, sur une feuille blanche, ${texteAgrandissementOuReduction[1][choixAgrandissementOuReduction < 4 ? 0 : 1]}.`,
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
                        texte:
                          enonceInit +
                          '<br> <br>Dans le nouveau triangle, la plus petite longueur à trouver sera :',
                        valeur: [Math.min(reponse, reponse1)],
                        alignement: 'center',
                        param: {
                          digits: nombreDeChiffresDe(
                            Math.min(reponse, reponse1),
                          ),
                          decimals: nombreDeChiffresDansLaPartieDecimale(
                            Math.min(reponse, reponse1),
                          ),
                          signe: false,
                        },
                      },
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
                        texte:
                          'Dans le nouveau triangle, la plus grande longueur à trouver sera :',
                        valeur: [Math.max(reponse, reponse1)],
                        alignement: 'center',
                        param: {
                          digits: nombreDeChiffresDe(
                            Math.max(reponse, reponse1),
                          ),
                          decimals: nombreDeChiffresDansLaPartieDecimale(
                            Math.max(reponse, reponse1),
                          ),
                          signe: false,
                        },
                      },
                    },
                  ],
                }
                iiAMC++
              }
              texteCorr = `Effectuer un${texteAgrandissementOuReduction[0][choixAgrandissementOuReduction < 4 ? 0 : 1]} implique de multiplier toutes les longueurs par un coefficient de proportionnalité. Trouvons ce coefficient.<br>`
              texteCorr += `Pour trouver ce coefficient, divisons la longueur connue du futur triangle par sa longueur associée dans le triangle actuel : $${texNombre(reponse2)} \\div ${absD} = ${texNombre(coefAgrandissement[choixAgrandissementOuReduction])}$. Le coefficient de proportionnalité est donc $${texNombre(coefAgrandissement[choixAgrandissementOuReduction])}$.<br>`
              texteCorr += `Multiplions toutes les longueurs connues du triangle actuel par $${texNombre(coefAgrandissement[choixAgrandissementOuReduction])}$`

              if (choixAgrandissementOuReduction >= 4) {
                texteCorr += `, ou bien, comme $${texNombre(coefAgrandissement[choixAgrandissementOuReduction])}=${coefReduction[choixAgrandissementOuReduction - 4].texFraction}$, cela revient à diviser toutes les longueurs par $${coefReduction[choixAgrandissementOuReduction - 4].den}$`
                texteCorr +=
                  choixAgrandissementOuReduction === 6
                    ? ' puis multiplier chacun de ces résultats par $3$'
                    : ''
              }
              texteCorr += `.<br>$${absB} \\times ${texNombre(coefAgrandissement[choixAgrandissementOuReduction])}=${texNombre(reponse)}${sp(10)}${absC} \\times ${texNombre(coefAgrandissement[choixAgrandissementOuReduction])}=${miseEnEvidence(texNombre(reponse1))}$`
              if (choixAgrandissementOuReduction === 6) {
                texteCorr += `${sp(10)} ou bien ${sp(10)}$(${absB} \\div 4) \\times 3=${texNombre(arrondi(absB / 4, 1))} \\times 3=${miseEnEvidence(texNombre(reponse))}$`
                texteCorr += `${sp(10)}$(${absC} \\div 4) \\times 3=${texNombre(arrondi(absC / 4, 1))} \\times 3=${miseEnEvidence(texNombre(reponse1))}$`
              } else if (choixAgrandissementOuReduction >= 4) {
                texteCorr += `${sp(10)} ou bien ${sp(10)}$${absB} \\div ${coefReduction[choixAgrandissementOuReduction - 4].den}=${miseEnEvidence(texNombre(reponse))}$`
                texteCorr += `${sp(10)}$${absC} \\div ${coefReduction[choixAgrandissementOuReduction - 4].den}=${miseEnEvidence(texNombre(reponse1))}$`
              }
              texteCorr += `<br>Le triangle issu d'un${texteAgrandissementOuReduction[0][choixAgrandissementOuReduction < 4 ? 0 : 1]} du triangle ${nom} de coefficient $${texNombre(coefAgrandissement[choixAgrandissementOuReduction])}$ possède donc des côtés de longueur respective $${texNombre(reponse2)}$ ; $${texNombre(reponse1)}$ et $${miseEnEvidence(texNombre(reponse))}$.`
              texteCorr += '<br>' + correctionParticularite
              texteCorr += '<br>En voici, une réalisation ci-dessous.'
              objets.push(polygoneCorr)
              objets.push(
                afficheLongueurSegment(
                  angleOriente(CCorr, A, BCorr) > 0 ? A : BCorr,
                  angleOriente(CCorr, A, BCorr) > 0 ? BCorr : A,
                  'red',
                  0.5,
                  '',
                  true,
                ),
              )
              objets.push(
                afficheLongueurSegment(
                  angleOriente(A, BCorr, CCorr) > 0 ? BCorr : CCorr,
                  angleOriente(A, BCorr, CCorr) > 0 ? CCorr : BCorr,
                  'red',
                  0.5,
                  '',
                  true,
                ),
              )
              objets.push(
                afficheLongueurSegment(
                  angleOriente(BCorr, CCorr, A) > 0 ? CCorr : A,
                  angleOriente(BCorr, CCorr, A) > 0 ? A : CCorr,
                  'red',
                  0.5,
                  '',
                  true,
                ),
              )
              texteCorr +=
                '<br>' +
                mathalea2d(
                  Object.assign(
                    { pixelsParCm: 20, scale: 0.5 },
                    fixeBordures(objets),
                  ),
                  objets,
                )
              longueurMax = Math.max(reponse, reponse1, reponse2)
            }
            break
          case 5:
            {
              // Rectangle avec coefficient de réduction ou d'agrandissement
              const absC =
                choixAgrandissementOuReduction < 4
                  ? randint(5, 11, [6, 9, absB])
                  : 2 * randint(4, 7, [arrondi(absB / 2, 0)])
              const reponse = arrondi(
                coefAgrandissement[choixAgrandissementOuReduction] * absB,
                1,
              )
              const reponse1 = arrondi(
                coefAgrandissement[choixAgrandissementOuReduction] * absC,
                1,
              )
              const alpha = randint(10, 170)
              const alphaCorr = randint(10, 170, [alpha])
              const sensRotation = choice([-1, 1])
              const B = pointAdistance(A, absB, sensRotation * alpha)
              const BCorr = pointAdistance(A, reponse, sensRotation * alphaCorr)
              const C = rotation(
                pointAdistance(B, absC, 180 + sensRotation * alpha),
                B,
                -90,
              )
              const CCorr = rotation(
                pointAdistance(BCorr, reponse1, 180 + sensRotation * alphaCorr),
                BCorr,
                -90,
              )
              const D = rotation(
                pointAdistance(A, absC, sensRotation * alpha),
                A,
                90,
              )
              const DCorr = rotation(
                pointAdistance(A, reponse1, sensRotation * alphaCorr),
                A,
                90,
              )
              const polygoneInit = polygone(A, B, C, D)
              const polygoneCorr = polygone(A, BCorr, CCorr, DCorr)
              const numA = randint(1, 26, [4, 5, 15, 23, 24, 25])
              const numB = randint(1, 26, [4, 5, 15, 23, 24, 25, numA])
              const numC = randint(1, 26, [4, 5, 15, 23, 24, 25, numA, numB])
              const numD = randint(1, 26, [
                4,
                5,
                15,
                23,
                24,
                25,
                numA,
                numB,
                numC,
              ])
              const nom =
                lettreDepuisChiffre(numA) +
                lettreDepuisChiffre(numB) +
                lettreDepuisChiffre(numC) +
                lettreDepuisChiffre(numD)
              objets.push(polygoneInit, nommePolygone(polygoneInit, nom))
              objets.push(codageSegments('||', 'red', A, B, C, D))
              objets.push(codageSegments('X', 'red', B, C, D, A))
              objets.push(
                afficheLongueurSegment(
                  angleOriente(B, C, D) > 0 ? C : D,
                  angleOriente(B, C, D) > 0 ? D : C,
                  bleuMathalea,
                  0.5,
                  '',
                  true,
                ),
              )
              objets.push(
                afficheLongueurSegment(
                  angleOriente(C, D, A) > 0 ? D : A,
                  angleOriente(C, D, A) > 0 ? A : D,
                  bleuMathalea,
                  0.5,
                  '',
                  true,
                ),
              )
              objets.push(
                codageAngleDroit(A, B, C),
                codageAngleDroit(D, C, B),
                codageAngleDroit(A, D, C),
                codageAngleDroit(B, A, D),
              )
              const enonceInit = `On décide d'effectuer un${texteAgrandissementOuReduction[0][choixAgrandissementOuReduction < 4 ? 0 : 1]} de coefficient $${texNombre(coefAgrandissement[choixAgrandissementOuReduction])}$ du rectangle ${nom}. Quelles seront les longueurs respectives de chaque côté du rectangle à construire ?`
              const enonceAMC =
                '<br>' +
                mathalea2d(
                  Object.assign(
                    {
                      pixelsParCm: 20,
                      scale: 0.5,
                    },
                    fixeBordures(objets),
                  ),
                  objets,
                )
              let correctionParticularite = ''
              if (this.interactif) {
                texte += enonceInit
                texte += enonceAMC
                switch (choice([1, 2])) {
                  case 1:
                    texte +=
                      '<br> Dans le nouveau rectangle, le côté le moins long aura pour longueur :' +
                      ajouteChampTexteMathLive(
                        this,
                        i,
                        KeyboardType.clavierNumbers,
                      )
                    handleAnswers(this, i, {
                      reponse: { value: Math.min(reponse, reponse1) },
                    })
                    correctionParticularite +=
                      'Dans le nouveau triangle, le côté le moins long aura pour longueur $' +
                      miseEnEvidence(texNombre(Math.min(reponse, reponse1))) +
                      '$.'
                    break
                  case 2:
                    texte +=
                      '<br> Dans le nouveau rectangle, le côté le plus long aura pour longueur :' +
                      ajouteChampTexteMathLive(
                        this,
                        i,
                        KeyboardType.clavierNumbers,
                      )
                    handleAnswers(this, i, {
                      reponse: { value: Math.max(reponse, reponse1) },
                    })
                    correctionParticularite +=
                      'Dans le nouveau triangle, le côté le moins long aura pour longueur $' +
                      miseEnEvidence(texNombre(Math.max(reponse, reponse1))) +
                      '$.'
                    break
                }
              } else if (!context.isAmc) {
                texte += `Trace un${texteAgrandissementOuReduction[0][choixAgrandissementOuReduction < 4 ? 0 : 1]} de coefficient $${texNombre(coefAgrandissement[choixAgrandissementOuReduction])}$ du rectangle ${nom}.`
                texte +=
                  '<br>' +
                  mathalea2d(
                    Object.assign(
                      { pixelsParCm: 20, scale: 0.5 },
                      fixeBordures(objets),
                    ),
                    objets,
                  )
              } else {
                propositionsAMC[iiAMC] = {
                  type: 'AMCOpen',
                  propositions: [
                    {
                      texte: '',
                      statut: 1,
                      sanscadre: true,
                      enonce:
                        enonceAMC +
                        `<br>Trace, sur une feuille blanche, ${texteAgrandissementOuReduction[1][choixAgrandissementOuReduction < 4 ? 0 : 1]}.`,
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
                        texte:
                          enonceInit +
                          '<br> <br>Dans le nouveau rectangle, le côté le moins long aura pour longueur :',
                        valeur: [Math.min(reponse, reponse1)],
                        alignement: 'center',
                        param: {
                          digits: nombreDeChiffresDe(
                            Math.min(reponse, reponse1),
                          ),
                          decimals: nombreDeChiffresDansLaPartieDecimale(
                            Math.min(reponse, reponse1),
                          ),
                          signe: false,
                        },
                      },
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
                        texte:
                          'Dans le nouveau rectangle, le côté le plus long aura pour longueur :',
                        valeur: [Math.max(reponse, reponse1)],
                        alignement: 'center',
                        param: {
                          digits: nombreDeChiffresDe(
                            Math.max(reponse, reponse1),
                          ),
                          decimals: nombreDeChiffresDansLaPartieDecimale(
                            Math.max(reponse, reponse1),
                          ),
                          signe: false,
                        },
                      },
                    },
                  ],
                }
                iiAMC++
              }
              texteCorr = `Effectuer un${texteAgrandissementOuReduction[0][choixAgrandissementOuReduction < 4 ? 0 : 1]} de coefficient $${texNombre(coefAgrandissement[choixAgrandissementOuReduction])}$ implique de multiplier toutes les longueurs par ce coefficient`
              if (choixAgrandissementOuReduction >= 4) {
                texteCorr += ` ou bien, comme $${texNombre(coefAgrandissement[choixAgrandissementOuReduction])}=${coefReduction[choixAgrandissementOuReduction - 4].texFraction}$, cela revient à diviser toutes les longueurs par $${coefReduction[choixAgrandissementOuReduction - 4].den}$`
                texteCorr +=
                  choixAgrandissementOuReduction === 6
                    ? ' puis multiplier chacun de ces résultats par $3$'
                    : ''
              }
              texteCorr += '.<br>'
              texteCorr += `$${absB} \\times ${texNombre(coefAgrandissement[choixAgrandissementOuReduction])}=${texNombre(reponse)}${sp(10)}${absC} \\times ${texNombre(coefAgrandissement[choixAgrandissementOuReduction])}=${miseEnEvidence(texNombre(reponse1))}$`
              if (choixAgrandissementOuReduction === 6) {
                texteCorr += `${sp(10)} ou bien ${sp(10)}$(${absB} \\div 4) \\times 3=${texNombre(arrondi(absB / 4, 1))} \\times 3=${miseEnEvidence(texNombre(reponse))}$`
                texteCorr += `${sp(10)}$(${absC} \\div 4) \\times 3=${texNombre(arrondi(absC / 4, 1))} \\times 3=${miseEnEvidence(texNombre(reponse1))}$`
              } else if (choixAgrandissementOuReduction >= 4) {
                texteCorr += `${sp(10)} ou bien ${sp(10)}$${absB} \\div ${coefReduction[choixAgrandissementOuReduction - 4].den}=${miseEnEvidence(texNombre(reponse))}$`
                texteCorr += `${sp(10)}$${absC} \\div ${coefReduction[choixAgrandissementOuReduction - 4].den}=${miseEnEvidence(texNombre(reponse1))}$`
              }
              texteCorr += `<br>Le rectangle issu d'un${texteAgrandissementOuReduction[0][choixAgrandissementOuReduction < 4 ? 0 : 1]} du rectangle ${nom} de coefficient $${texNombre(coefAgrandissement[choixAgrandissementOuReduction])}$ possède donc des côtés de longueur respective $${texNombre(reponse)}$ et $${miseEnEvidence(texNombre(reponse1))}$.`
              texteCorr += '<br>' + correctionParticularite
              texteCorr += '<br>En voici, une réalisation ci-dessous.'
              objets.push(polygoneCorr)
              objets.push(
                codageSegments('|||', bleuMathalea, A, BCorr, CCorr, DCorr),
              )
              objets.push(
                codageSegments('XX', bleuMathalea, BCorr, CCorr, DCorr, A),
              )
              objets.push(
                afficheLongueurSegment(
                  angleOriente(CCorr, A, BCorr) > 0 ? A : BCorr,
                  angleOriente(CCorr, A, BCorr) > 0 ? BCorr : A,
                  'red',
                  0.5,
                  '',
                  true,
                ),
              )
              objets.push(
                afficheLongueurSegment(
                  angleOriente(A, BCorr, CCorr) > 0 ? BCorr : CCorr,
                  angleOriente(A, BCorr, CCorr) > 0 ? CCorr : BCorr,
                  'red',
                  0.5,
                  '',
                  true,
                ),
              )
              objets.push(
                codageAngleDroit(A, BCorr, CCorr),
                codageAngleDroit(DCorr, CCorr, BCorr),
                codageAngleDroit(A, DCorr, CCorr),
                codageAngleDroit(BCorr, A, DCorr),
              )
              texteCorr +=
                '<br>' +
                mathalea2d(
                  Object.assign(
                    { pixelsParCm: 20, scale: 0.5 },
                    fixeBordures(objets),
                  ),
                  objets,
                )
              longueurMax = Math.max(reponse, reponse1)
            }
            break
          default:
            {
              // Rectangle avec longueur initiale et longueur finale
              const absC =
                choixAgrandissementOuReduction < 4
                  ? randint(5, 11, [6, 9, absB])
                  : 2 * randint(4, 7, [arrondi(absB / 2, 0)])
              const reponse = arrondi(
                coefAgrandissement[choixAgrandissementOuReduction] * absB,
                1,
              )
              const reponse1 = arrondi(
                coefAgrandissement[choixAgrandissementOuReduction] * absC,
                1,
              )
              const alpha = randint(10, 170)
              const alphaCorr = randint(10, 170, [alpha])
              const sensRotation = choice([-1, 1])
              const B = pointAdistance(A, absB, sensRotation * alpha)
              const BCorr = pointAdistance(A, reponse, sensRotation * alphaCorr)
              const C = rotation(
                pointAdistance(B, absC, 180 + sensRotation * alpha),
                B,
                -90,
              )
              const CCorr = rotation(
                pointAdistance(BCorr, reponse1, 180 + sensRotation * alphaCorr),
                BCorr,
                -90,
              )
              const D = rotation(
                pointAdistance(A, absC, sensRotation * alpha),
                A,
                90,
              )
              const DCorr = rotation(
                pointAdistance(A, reponse1, sensRotation * alphaCorr),
                A,
                90,
              )
              const polygoneInit = polygone(A, B, C, D)
              const polygoneCorr = polygone(A, BCorr, CCorr, DCorr)
              const numA = randint(1, 26, [4, 5, 15, 23, 24, 25])
              const numB = randint(1, 26, [4, 5, 15, 23, 24, 25, numA])
              const numC = randint(1, 26, [4, 5, 15, 23, 24, 25, numA, numB])
              const numD = randint(1, 26, [
                4,
                5,
                15,
                23,
                24,
                25,
                numA,
                numB,
                numC,
              ])
              const nom =
                lettreDepuisChiffre(numA) +
                lettreDepuisChiffre(numB) +
                lettreDepuisChiffre(numC) +
                lettreDepuisChiffre(numD)
              const numACorr = randint(1, 26, [
                4,
                5,
                15,
                23,
                24,
                25,
                numA,
                numB,
                numC,
              ])
              const numBCorr = randint(1, 26, [
                4,
                5,
                15,
                23,
                24,
                25,
                numA,
                numB,
                numACorr,
              ])
              const numCCorr = randint(1, 26, [
                4,
                5,
                15,
                23,
                24,
                25,
                numA,
                numB,
                numACorr,
                numBCorr,
              ])
              const numDCorr = randint(1, 26, [
                4,
                5,
                15,
                23,
                24,
                25,
                numA,
                numB,
                numACorr,
                numBCorr,
                numCCorr,
              ])
              const nomCorr =
                lettreDepuisChiffre(numACorr) +
                lettreDepuisChiffre(numBCorr) +
                lettreDepuisChiffre(numCCorr) +
                lettreDepuisChiffre(numDCorr)
              objets.push(polygoneInit, nommePolygone(polygoneInit, nom))
              objets.push(codageSegments('||', 'red', A, B, C, D))
              objets.push(codageSegments('X', 'red', B, C, D, A))
              objets.push(
                afficheLongueurSegment(
                  angleOriente(B, C, D) > 0 ? C : D,
                  angleOriente(B, C, D) > 0 ? D : C,
                  bleuMathalea,
                  0.5,
                  '',
                  true,
                ),
              )
              objets.push(
                afficheLongueurSegment(
                  angleOriente(C, D, A) > 0 ? D : A,
                  angleOriente(C, D, A) > 0 ? A : D,
                  bleuMathalea,
                  0.5,
                  '',
                  true,
                ),
              )
              objets.push(
                codageAngleDroit(A, B, C),
                codageAngleDroit(D, C, B),
                codageAngleDroit(A, D, C),
                codageAngleDroit(B, A, D),
              )
              const enonceInit = `On décide d'effectuer un${texteAgrandissementOuReduction[0][choixAgrandissementOuReduction < 4 ? 0 : 1]} du rectangle ${nom}, de telle sorte que la longueur du côté associé à [${lettreDepuisChiffre(numA) + lettreDepuisChiffre(numB)}] mesurera $${texNombre(reponse)}$. Quelle sera l'autre dimension du rectangle à construire ?`
              const enonceAMC =
                '<br>' +
                mathalea2d(
                  Object.assign(
                    {
                      pixelsParCm: 20,
                      scale: 0.5,
                    },
                    fixeBordures(objets),
                  ),
                  objets,
                )
              if (this.interactif) {
                texte += enonceInit
                texte += ajouteChampTexteMathLive(
                  this,
                  i,
                  KeyboardType.clavierNumbers,
                )
                texte += enonceAMC
                handleAnswers(this, i, { reponse: { value: reponse1 } })
              } else if (!context.isAmc) {
                texte += `Trace un${texteAgrandissementOuReduction[0][choixAgrandissementOuReduction < 4 ? 0 : 1]} du rectangle ${nom} de telle sorte que la longueur du côté associé à [${lettreDepuisChiffre(numA) + lettreDepuisChiffre(numB)}] mesurera $${texNombre(reponse)}$.`
                texte +=
                  '<br>' +
                  mathalea2d(
                    Object.assign(
                      { pixelsParCm: 20, scale: 0.5 },
                      fixeBordures(objets),
                    ),
                    objets,
                  )
              } else {
                propositionsAMC[iiAMC] = {
                  type: 'AMCOpen',
                  propositions: [
                    {
                      texte: '',
                      statut: 1,
                      sanscadre: true,
                      enonce:
                        enonceAMC +
                        `<br>Trace, sur une feuille blanche, ${texteAgrandissementOuReduction[1][choixAgrandissementOuReduction < 4 ? 0 : 1]}.`,
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
                        texte:
                          enonceInit +
                          '<br> <br>Dans le nouveau rectangle, la deuxième longueur sera :',
                        valeur: [reponse1],
                        alignement: 'center',
                        param: {
                          digits: nombreDeChiffresDe(reponse1),
                          decimals:
                            nombreDeChiffresDansLaPartieDecimale(reponse1),
                          signe: false,
                        },
                      },
                    },
                  ],
                }
              }
              texteCorr = `Effectuer un${texteAgrandissementOuReduction[0][choixAgrandissementOuReduction < 4 ? 0 : 1]} implique de multiplier toutes les longueurs par un coefficient de proportionnalité. Trouvons ce coefficient.<br>`
              texteCorr += `Pour trouver ce coefficient, divisons la longueur connue du futur rectangle par sa longueur associée dans le rectangle actuel : $${texNombre(reponse)} \\div ${absB} = ${texNombre(coefAgrandissement[choixAgrandissementOuReduction])}$. Le coefficient de proportionnalité est donc $${texNombre(coefAgrandissement[choixAgrandissementOuReduction])}$.<br>`
              texteCorr += `Multiplions toutes les longueurs connues du triangle actuel par $${texNombre(coefAgrandissement[choixAgrandissementOuReduction])}$`

              if (choixAgrandissementOuReduction >= 4) {
                texteCorr += ` ou bien, comme $${texNombre(coefAgrandissement[choixAgrandissementOuReduction])}=${coefReduction[choixAgrandissementOuReduction - 4].texFraction}$, cela revient à diviser toutes les longueurs par $${coefReduction[choixAgrandissementOuReduction - 4].den}$`
                texteCorr +=
                  choixAgrandissementOuReduction === 6
                    ? ' puis multiplier chacun de ces résultats par $3$'
                    : ''
              }
              texteCorr += '.<br>'
              texteCorr += `$${absC} \\times ${texNombre(coefAgrandissement[choixAgrandissementOuReduction])}=${miseEnEvidence(texNombre(reponse1))}$`
              if (choixAgrandissementOuReduction === 6) {
                texteCorr += `${sp(10)} ou bien ${sp(10)}$(${absC} \\div 4) \\times 3=${texNombre(arrondi(absC / 4, 1))} \\times 3=${miseEnEvidence(texNombre(reponse1))}$`
              } else if (choixAgrandissementOuReduction >= 4) {
                texteCorr += `${sp(10)} ou bien ${sp(10)}$${absC} \\div ${coefReduction[choixAgrandissementOuReduction - 4].den}=${miseEnEvidence(texNombre(reponse1))}$`
              }
              texteCorr += `<br>Le rectangle issu d'un${texteAgrandissementOuReduction[0][choixAgrandissementOuReduction < 4 ? 0 : 1]} du rectangle ${nom} de coefficient $${texNombre(coefAgrandissement[choixAgrandissementOuReduction])}$ possède donc des côtés de longueur respective $${miseEnEvidence(texNombre(reponse))}$ et $${miseEnEvidence(texNombre(reponse1))}$.`
              texteCorr += '<br>En voici, une réalisation ci-dessous.'
              objets.push(polygoneCorr, nommePolygone(polygoneCorr, nomCorr))
              objets.push(
                codageSegments('|||', bleuMathalea, A, BCorr, CCorr, DCorr),
              )
              objets.push(
                codageSegments('XX', bleuMathalea, BCorr, CCorr, DCorr, A),
              )
              objets.push(
                afficheLongueurSegment(
                  angleOriente(CCorr, A, BCorr) > 0 ? A : BCorr,
                  angleOriente(CCorr, A, BCorr) > 0 ? BCorr : A,
                  'red',
                  0.5,
                  '',
                  true,
                ),
              )
              objets.push(
                afficheLongueurSegment(
                  angleOriente(A, BCorr, CCorr) > 0 ? BCorr : CCorr,
                  angleOriente(A, BCorr, CCorr) > 0 ? CCorr : BCorr,
                  'red',
                  0.5,
                  '',
                  true,
                ),
              )
              objets.push(
                codageAngleDroit(A, BCorr, CCorr),
                codageAngleDroit(DCorr, CCorr, BCorr),
                codageAngleDroit(A, DCorr, CCorr),
                codageAngleDroit(BCorr, A, DCorr),
              )
              texteCorr +=
                '<br>' +
                mathalea2d(
                  Object.assign(
                    { pixelsParCm: 20, scale: 0.5 },
                    fixeBordures(objets),
                  ),
                  objets,
                )
              longueurMax = Math.max(reponse, reponse1)
            }
            break
        }
        if (context.isAmc) {
          this.autoCorrectionAMC[i] = {
            enonce: '',
            options: { multicols: true, barreseparation: false },
            enonceCentre: true,
            enonceAvant: true, // EE : ce champ est facultatif et permet (si false) de supprimer l'énoncé ci-dessus avant la numérotation de chaque question.
            propositions: propositionsAMC,
          }
          this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        }
        cpt++
      } while (longueurMax > longueurMaximum && cpt < 200)
      if (
        this.questionJamaisPosee(
          i,
          absBFinal,
          coeffFinal,
          listeTypeQuestions[i],
        )
      ) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}

export default AgrandirReduireFigure
