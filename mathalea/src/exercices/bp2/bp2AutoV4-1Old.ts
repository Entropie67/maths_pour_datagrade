import { afficheLongueurSegment } from '../../lib/2d/afficheLongueurSegment'
import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { codageSegments } from '../../lib/2d/CodageSegment'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygoneAvecNom } from '../../lib/2d/polygones'
import { rotation, similitude, translation } from '../../lib/2d/transformations'
import { pointAdistance } from '../../lib/2d/utilitairesPoint'
import { vecteur } from '../../lib/2d/Vecteur'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { arrondi, nombreDeChiffresDe } from '../../lib/outils/nombres'
import { creerNomDePolygone, numAlpha, sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
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
  'Calculer périmètre et/ou aire de carrés, rectangles et triangles rectangles'
export const amcReady = true
export const amcType = 'AMCHybride'

export const interactifReady = true
export const dateDeModifImportante = '12/04/2023' // Ajout de trois paramètres - séparation des figures, des demandes d'aires et/ ou de périmètres, affichage ou pas des figures - par EE
/**
 * Un carré, un rectangle et un triangle rectangle sont tracés.
 * Il faut calculer les aires
 * @author Rémi Angot
 */
export const uuid = 'd1513'

export const refs = {
  'fr-fr': [],
  'fr-2016': [],
  'fr-ch': [],
}
export default class PerimetreOuAireDeCarresRectanglesTrianglesOld extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Type de figures',
      'Nombres séparés par des tirets :\n1 : Carré\n2 : Rectangle\n3 : Triangle rectangle\n4 : Mélange',
    ]
    this.besoinFormulaire2Numerique = [
      'Type de questions',
      3,
      '1 : Périmètres\n2 : Aires\n3 : Périmètres et aires',
    ]
    this.besoinFormulaire3CaseACocher = ['Avec figures']
    this.interactif = false

    this.nbQuestions = 1
    this.sup = 4
    this.sup2 = 3
    this.sup3 = true
  }

  nouvelleVersion() {
    const questionsDisponibles = gestionnaireFormulaireTexte({
      max: 3,
      defaut: 4,
      melange: 4,
      nbQuestions: 6,
      shuffle: true,
      saisie: this.sup,
      enleveDoublons: true,
    })

    const incrementation =
      questionsDisponibles.length * (this.sup2 === 3 ? 2 : 1)
    for (
      let i = 0, texte, texteAMC, texteCorr, nbPuces, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const nom = creerNomDePolygone(11, 'QD')
      const c = randint(2, 6)
      const L = randint(2, 5)
      const l = randint(2, 5, L)
      const a = randint(2, 5)
      const b = randint(2, 5)
      const c2 = Math.sqrt(a * a + b * b)
      const pIJK = arrondi(a + b + c2, 1)
      const A = pointAbstrait(0, 0, nom[0])
      const B = rotation(pointAbstrait(c, 0), A, randint(-15, 15), nom[1])
      const C = rotation(A, B, -90, nom[2])
      const D = rotation(B, A, 90, nom[3])
      const carre = polygoneAvecNom(A, B, C, D)
      const E = pointAbstrait(8, 0, nom[4])
      const F = pointAdistance(E, L, randint(-15, 15), nom[5])
      const G = similitude(E, F, -90, l / L, nom[6])
      const H = translation(G, vecteur(F, E), nom[7])
      const rectangle = polygoneAvecNom(E, F, G, H)
      const I = pointAbstrait(15, 0, nom[8])
      const J = pointAdistance(I, a, randint(-25, 25), nom[9])
      const K = similitude(I, J, -90, b / a, nom[10])
      const triangle = polygoneAvecNom(I, J, K)
      const objetsEnonce = []
      if (questionsDisponibles.includes(1)) {
        objetsEnonce.push(
          ...carre,
          codageAngleDroit(A, B, C),
          codageAngleDroit(A, D, C),
          codageAngleDroit(D, C, B),
          codageAngleDroit(B, A, D),
          codageSegments('//', bleuMathalea, [A, B, C, D]),
          afficheLongueurSegment(B, A),
        )
      }
      if (questionsDisponibles.includes(2)) {
        objetsEnonce.push(
          ...rectangle,
          codageAngleDroit(E, F, G),
          codageAngleDroit(F, G, H),
          codageAngleDroit(G, H, E),
          codageAngleDroit(H, E, F),
          codageSegments('/', 'red', E, F, G, H),
          codageSegments('||', bleuMathalea, F, G, H, E),
          afficheLongueurSegment(F, E),
          afficheLongueurSegment(G, F),
        )
      }
      if (questionsDisponibles.includes(3)) {
        objetsEnonce.push(
          ...triangle,
          codageAngleDroit(I, J, K),
          afficheLongueurSegment(J, I),
          afficheLongueurSegment(K, J),
          afficheLongueurSegment(I, K),
        )
      }
      texte = this.sup3
        ? mathalea2d(
            Object.assign({}, fixeBordures(objetsEnonce), {
              pixelsParCm: 20,
              scale: 0.75,
              mainlevee: false,
            }),
            objetsEnonce,
          )
        : //  ? mathalea2d(Object.assign({}, fixeBordures(objetsEnonce), { pixelsParCm: 20, scale: 0.75, mainlevee: false }), objetsEnonce)
          ''
      if (context.isAmc) {
        this.autoCorrectionAMC[i] = {
          enonce: texte,
          options: { barreseparation: true, numerotationEnonce: true },
          propositions: [],
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      }

      texteCorr = ''
      nbPuces = 0
      for (
        let indiceSousQuestion = 0;
        indiceSousQuestion < questionsDisponibles.length;
        indiceSousQuestion++
      ) {
        switch (questionsDisponibles[indiceSousQuestion]) {
          case 1: // Carré
            if (this.sup2 !== 2) {
              texteAMC =
                (this.sup2 === 3 ? numAlpha(nbPuces) : '') +
                'Calculer le périmètre' +
                (context.isAmc ? ', en cm, ' : ' ')
              texteAMC += this.sup3
                ? 'du carré ci-dessus.'
                : `d'un carré de côté${sp()}$${texNombre(c)}\\text{ cm}$.`
              texte +=
                texteAMC +
                ajouteChampTexteMathLive(
                  this,
                  incrementation * i + nbPuces,
                  KeyboardType.longueur + ' ' + KeyboardType.aire,
                  {
                    texteApres:
                      '<em class="ml-2">(Une unité est attendue.)</em>',
                  },
                ) +
                '<br>'

              texteCorr +=
                (this.sup2 === 3 ? numAlpha(nbPuces) : '') +
                `$\\mathcal{P}_{${nom[0] + nom[1] + nom[2] + nom[3]}}=${c}${sp()}\\text{cm}+${c}${sp()}\\text{cm}+${c}${sp()}\\text{cm}+${c}${sp()}\\text{cm}=${
                  4 * c
                }${sp()}\\text{cm}$<br>`
              handleAnswers(this, incrementation * i + nbPuces, {
                reponse: {
                  value: new Grandeur(c * 4, 'cm'),
                  options: { unite: true },
                },
              })
              if (context.isAmc) {
                this.autoCorrectionAMC[i].propositions!.push({
                  type: 'AMCNum',
                  propositions: [
                    {
                      texte: '',
                      multicolsBegin: nbPuces === 0,
                      multicolsEnd: nbPuces === incrementation - 1,
                      reponse: {
                        texte: texteAMC,
                        valeur: c * 4,
                        alignement: 'center',
                        param: {
                          signe: false,
                          decimals: 0,
                          digits: nombreDeChiffresDe(c * 4),
                        },
                      },
                    },
                  ],
                })
              }
              nbPuces++
            }
            if (this.sup2 !== 1) {
              texteAMC =
                (this.sup2 === 3 ? numAlpha(nbPuces) : '') +
                "Calculer l'aire" +
                (context.isAmc ? ', en $\\text{cm}^2$, ' : ' ')
              texteAMC += this.sup3
                ? 'du carré ci-dessus.'
                : `d'un carré de côté${sp()}$${texNombre(c)}\\text{ cm}$.`
              texte +=
                texteAMC +
                ajouteChampTexteMathLive(
                  this,
                  incrementation * i + nbPuces,
                  KeyboardType.longueur + ' ' + KeyboardType.aire,
                  {
                    texteApres:
                      '<em class="ml-2">(Une unité est attendue.)</em>',
                  },
                ) +
                '<br>'

              texteCorr +=
                (this.sup2 === 3 ? numAlpha(nbPuces) : '') +
                `$\\mathcal{A}_{${nom[0] + nom[1] + nom[2] + nom[3]}}=${c}${sp()}\\text{cm}\\times${c}${sp()}\\text{cm}=${c * c}${sp()}\\text{cm}^2$<br>`
              handleAnswers(this, incrementation * i + nbPuces, {
                reponse: {
                  value: new Grandeur(c * c, 'cm^2'),
                  options: { unite: true },
                },
              })
              if (context.isAmc) {
                this.autoCorrectionAMC[i].propositions!.push({
                  type: 'AMCNum',
                  propositions: [
                    {
                      texte: '',
                      multicolsBegin: nbPuces === 0,
                      multicolsEnd: nbPuces === incrementation - 1,
                      reponse: {
                        texte: texteAMC,
                        valeur: c * c,
                        alignement: 'center',
                        param: {
                          signe: false,
                          decimals: 0,
                          digits: nombreDeChiffresDe(c * c),
                        },
                      },
                    },
                  ],
                })
              }
              nbPuces++
            }
            break
          case 2: // Rectangle
            if (this.sup2 !== 2) {
              texteAMC =
                (this.sup2 === 3 ? numAlpha(nbPuces) : '') +
                'Calculer le périmètre' +
                (context.isAmc ? ', en cm, ' : ' ')
              texteAMC += this.sup3
                ? 'du rectangle ci-dessus.'
                : `d'un rectangle de longueur${sp()}$${texNombre(L > l ? L : l)}\\text{ cm}$ et de largeur${sp()}$${texNombre(L > l ? l : L)}\\text{ cm}$.`
              texte +=
                texteAMC +
                ajouteChampTexteMathLive(
                  this,
                  incrementation * i + nbPuces,
                  KeyboardType.longueur + ' ' + KeyboardType.aire,
                  {
                    texteApres:
                      '<em class="ml-2">(Une unité est attendue.)</em>',
                  },
                ) +
                '<br>'

              texteCorr +=
                (this.sup2 === 3 ? numAlpha(nbPuces) : '') +
                `$\\mathcal{P}_{${nom[4] + nom[5] + nom[6] + nom[7]}}=${L}${sp()}\\text{cm}+${l}${sp()}\\text{cm}+${L}${sp()}\\text{cm}+${l}${sp()}\\text{cm}=${
                  2 * L + 2 * l
                }${sp()}\\text{cm}$<br>`
              handleAnswers(this, incrementation * i + nbPuces, {
                reponse: {
                  value: new Grandeur((L + l) * 2, 'cm'),
                  options: { unite: true },
                },
              })
              if (context.isAmc) {
                this.autoCorrectionAMC[i].propositions!.push({
                  type: 'AMCNum',
                  propositions: [
                    {
                      texte: '',
                      multicolsBegin: nbPuces === 0,
                      multicolsEnd: nbPuces === incrementation - 1,
                      reponse: {
                        texte: texteAMC,
                        valeur: (L + l) * 2,
                        alignement: 'center',
                        param: {
                          signe: false,
                          decimals: 0,
                          digits: nombreDeChiffresDe((L + l) * 2),
                        },
                      },
                    },
                  ],
                })
              }
              nbPuces++
            }
            if (this.sup2 !== 1) {
              texteAMC =
                (this.sup2 === 3 ? numAlpha(nbPuces) : '') +
                "Calculer l'aire" +
                (context.isAmc ? ', en $\\text{cm}^2$, ' : ' ')
              texteAMC += this.sup3
                ? 'du rectangle ci-dessus.'
                : `d'un rectangle de longueur${sp()}$${texNombre(L > l ? L : l)}\\text{ cm}$ et de largeur${sp()}$${texNombre(L > l ? l : L)}\\text{ cm}$.`
              texte +=
                texteAMC +
                ajouteChampTexteMathLive(
                  this,
                  incrementation * i + nbPuces,
                  KeyboardType.longueur + ' ' + KeyboardType.aire,
                  {
                    texteApres:
                      '<em class="ml-2">(Une unité est attendue.)</em>',
                  },
                ) +
                '<br>'

              texteCorr +=
                (this.sup2 === 3 ? numAlpha(nbPuces) : '') +
                `$\\mathcal{A}_{${nom[4] + nom[5] + nom[6] + nom[7]}}=${L}${sp()}\\text{cm}\\times${l}${sp()}\\text{cm}=${
                  L * l
                }${sp()}\\text{cm}^2$<br>`
              handleAnswers(this, incrementation * i + nbPuces, {
                reponse: {
                  value: new Grandeur(L * l, 'cm^2'),
                  options: { unite: true },
                },
              })
              if (context.isAmc) {
                this.autoCorrectionAMC[i].propositions!.push({
                  type: 'AMCNum',
                  propositions: [
                    {
                      texte: '',
                      multicolsBegin: nbPuces === 0,
                      multicolsEnd: nbPuces === incrementation - 1,
                      reponse: {
                        texte: texteAMC,
                        valeur: L * l,
                        alignement: 'center',
                        param: {
                          signe: false,
                          decimals: 0,
                          digits: nombreDeChiffresDe(L * l),
                        },
                      },
                    },
                  ],
                })
              }
              nbPuces++
            }
            break
          case 3: // Triangle rectangle
            if (this.sup2 !== 2) {
              texteAMC =
                (this.sup2 === 3 ? numAlpha(nbPuces) : '') +
                'Calculer le périmètre' +
                (context.isAmc ? ', en cm, ' : ' ')
              texteAMC += this.sup3
                ? 'du triangle rectangle ci-dessus.'
                : `d'un triangle rectangle dont l'hypoténuse mesure $${texNombre(c2, 1)}\\text{ cm}$ et les côtés de l'angle droit mesurent respectivement $${texNombre(a)}\\text{ cm}$ et $${texNombre(b)}\\text{ cm}$.`
              texte +=
                texteAMC +
                ajouteChampTexteMathLive(
                  this,
                  incrementation * i + nbPuces,
                  KeyboardType.longueur + ' ' + KeyboardType.aire,
                  {
                    texteApres:
                      '<em class="ml-2">(Une unité est attendue.)</em>',
                  },
                ) +
                '<br>'

              texteCorr +=
                (this.sup2 === 3 ? numAlpha(nbPuces) : '') +
                `$\\mathcal{P}_{${nom[8] + nom[9] + nom[10]}}=${a}${sp()}\\text{cm}+${b}${sp()}\\text{cm}+${texNombre(c2, 1)}${sp()}\\text{cm}=${texNombre(pIJK)}${sp()}\\text{cm}$<br>`
              handleAnswers(this, incrementation * i + nbPuces, {
                reponse: {
                  value: new Grandeur(pIJK, 'cm'),
                  options: { unite: true },
                },
              })
              if (context.isAmc) {
                this.autoCorrectionAMC[i].propositions!.push({
                  type: 'AMCNum',
                  propositions: [
                    {
                      texte: '',
                      multicolsBegin: nbPuces === 0,
                      multicolsEnd: nbPuces === incrementation - 1,
                      reponse: {
                        texte: texteAMC,
                        valeur: pIJK,
                        alignement: 'center',
                        param: {
                          signe: false,
                          decimals: 0,
                          digits: nombreDeChiffresDe(pIJK),
                        },
                      },
                    },
                  ],
                })
              }
              nbPuces++
            }
            if (this.sup2 !== 1) {
              texteAMC =
                (this.sup2 === 3 ? numAlpha(nbPuces) : '') +
                "Calculer l'aire" +
                (context.isAmc ? ', en $\\text{cm}^2$, ' : ' ')
              texteAMC += this.sup3
                ? 'du triangle rectangle ci-dessus.'
                : `d'un triangle rectangle dont l'hypoténuse mesure $${texNombre(c2, 1)}\\text{ cm}$ et les côtés de l'angle droit mesurent respectivement $${texNombre(a)}\\text{ cm}$ et $${texNombre(b)}\\text{ cm}$.`
              texte +=
                texteAMC +
                ajouteChampTexteMathLive(
                  this,
                  incrementation * i + nbPuces,
                  KeyboardType.longueur + ' ' + KeyboardType.aire,
                  {
                    texteApres:
                      '<em class="ml-2">(Une unité est attendue.)</em>',
                  },
                ) +
                '<br>'

              texteCorr +=
                (this.sup2 === 3 ? numAlpha(nbPuces) : '') +
                `$\\mathcal{A}_{${nom[8] + nom[9] + nom[10]}}=${a}${sp()}\\text{cm}\\times${b}${sp()}\\text{cm}\\div2=${texNombre((a * b) / 2)}${sp()}\\text{cm}^2$<br>`
              handleAnswers(this, incrementation * i + nbPuces, {
                reponse: {
                  value: new Grandeur((a * b) / 2, 'cm^2'),
                  options: { unite: true },
                },
              })
              if (context.isAmc) {
                this.autoCorrectionAMC[i].propositions!.push({
                  type: 'AMCNum',
                  propositions: [
                    {
                      texte: '',
                      multicolsBegin: nbPuces === 0,
                      multicolsEnd: nbPuces === incrementation - 1,
                      reponse: {
                        texte: texteAMC,
                        valeur: (a * b) / 2,
                        alignement: 'center',
                        param: {
                          signe: false,
                          decimals: 0,
                          digits: nombreDeChiffresDe((a * b) / 2),
                        },
                      },
                    },
                  ],
                })
              }
              nbPuces++
            }
            break
        }
      }
      if (this.questionJamaisPosee(i, c, L, l, a, b, c2, pIJK)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
