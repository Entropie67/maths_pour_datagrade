import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Trouver un pourcentage dans un problème'
export const dateDePublication = '04/06/2025'

export const interactifReady = true

/**
 * Trouver un pourcentage dans un problème
 * @author Éric Elter
 */

export const uuid = '66c48'

export const refs = {
  'fr-fr': ['6N3O-1'],
  'fr-2016': ['6N23-12'],
  'fr-ch': ['10CTFA1D-1', '10LCFA1D-1', '10LSFA1D-1', 'PRQPF05B-2'],
}
export default class DecimalFractionPourcentage extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Choix de problèmes',
      [
        'Nombres séparés par des tirets  :',
        '1 : Brebis dans un troupeau',
        '2 : Filles dans un groupe',
        '3 : Matière grasse dans un fromage',
        '4 : Réussite dans des tirs au but',
        '5 : Pièces défectueuses dans une usine',
        '6 : Romans dans une bibliothèque',
        '7 : Bonbons dans un paquet',
        '8 : Chênes dans un parc',
        '9 : Trajet sur autoroute',
        '10 : Réussite à un contrôle',
        '11 : Poules dans une ferme',
        '12 : Élèves à lunettes dans un groupe',
        '13 : BD dans une bibliothèque',
        '14 : Pommes chez un primeur',
        '15 : Sucre dans un jus',
        '16 : Œufs cassés dans un poulailler',
        '17 : Vélos dans un parking',
        '18 : Eau utilisée dans une réserve',
        '19 : Bonbons dans un sachet',
        '20 : Mélange',
      ].join('\n'),
    ]

    this.besoinFormulaire2Texte = [
      'Choix des dénominateurs initiaux',
      [
        'Nombres séparés par des tirets  :',
        '1 : 10',
        '2 : 20',
        '3 : 25',
        '4 : 50',
        '5 : 100',
        '6 : 200',
        '7 : 500',
        '8 : 1000',
        '9 : Mélange',
      ].join('\n'),
    ]

    this.sup = 20
    this.sup2 = 9
    this.nbQuestions = 5
  }

  nouvelleVersion() {
    const typeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 19,
      defaut: 20,
      melange: 20,
      nbQuestions: this.nbQuestions,
    })

    const typeDeDenominateurs = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: 8,
      defaut: 9,
      melange: 9,
      nbQuestions: this.nbQuestions,
      listeOfCase: [10, 20, 25, 50, 100, 200, 500, 1000],
    })
    const typeDeDenominateursNumber: number[] = typeDeDenominateurs.filter(
      (val): val is number => typeof val === 'number',
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let reponse = 0
      const num = typeDeDenominateursNumber[i]
      let den: number[] = [0, 0]
      switch (num) {
        case 10:
        case 20:
        case 25:
        case 50:
        case 100:
          den = [randint(2, num), arrondi(100 / num, 1)]
          break
        case 200:
          den = [2 * randint(1, 99), 2]
          break
        case 500:
          den = [50 * randint(1, 9), 5]
          break
        case 1000:
          den = [10 * randint(1, 99), 10]
          break
      }

      switch (typeDeQuestions[i]) {
        case 1: {
          texte = `Dans un troupeau de $${texNombre(num)}$ moutons, il y a $${den[0]}$ brebis. Quel est le pourcentage de brebis ?`
          if (num === 100) {
            reponse = den[0]
            texteCorr = `Puisque sur $100$ moutons, il y a $${den[0]}$ brebis, alors la proportion de brebis dans ce troupeau`
          } else {
            if (num < 100) {
              reponse = den[0] * den[1]
              texteCorr = `Sur $${texNombre(num)}$ moutons, il y a $${den[0]}$ brebis, alors avec $${den[1]}$ fois plus de moutons, on obtient $100$ moutons dont $${reponse}$ brebis car $${den[0]}\\times${den[1]}=${reponse}$.<br>`
            } else {
              reponse = arrondi(den[0] / den[1])
              texteCorr = `Sur $${texNombre(num)}$ moutons, il y a $${den[0]}$ brebis, alors avec $${den[1]}$ fois moins de moutons, on obtient $100$ moutons dont $${reponse}$ brebis car $${den[0]}\\div${den[1]}=${reponse}$.<br>`
            }
            texteCorr += 'La proportion de brebis dans ce troupeau'
          }
          break
        }

        case 2: {
          texte = `Dans un groupe de $${texNombre(num)}$ élèves, il y a $${den[0]}$ filles. Quel est le pourcentage de filles ?`
          if (num === 100) {
            reponse = den[0]
            texteCorr = `Puisque sur $100$ élèves, il y a $${den[0]}$ filles, alors la proportion de filles dans ce groupe`
          } else {
            if (num < 100) {
              reponse = den[0] * den[1]
              texteCorr = `Sur $${texNombre(num)}$ élèves, il y a $${den[0]}$ filles, alors avec $${den[1]}$ fois plus d’élèves, on obtient $100$ élèves dont $${reponse}$ filles car $${den[0]}\\times${den[1]}=${reponse}$.<br>`
            } else {
              reponse = arrondi(den[0] / den[1])
              texteCorr = `Sur $${texNombre(num)}$ élèves, il y a $${den[0]}$ filles, alors avec $${den[1]}$ fois moins d’élèves, on obtient $100$ élèves dont $${reponse}$ filles car $${den[0]}\\div${den[1]}=${reponse}$.<br>`
            }
            texteCorr += 'La proportion de filles dans ce groupe'
          }
          break
        }

        case 3: {
          texte = `Dans un morceau de fromage de $${texNombre(num)}$ g, il y a $${den[0]}$ g de matière grasse. Quel est le pourcentage de matière grasse ?`
          if (num === 100) {
            reponse = den[0]
            texteCorr = `Puisque sur $100$ g, il y a $${den[0]}$ g de matière grasse, alors la proportion de matière grasse dans ce fromage`
          } else {
            if (num < 100) {
              reponse = den[0] * den[1]
              texteCorr = `Sur $${texNombre(num)}$ g de fromage, il y a $${den[0]}$ g de matière grasse, alors avec $${den[1]}$ fois plus de fromage, on obtient $100$ g de fromage dont $${reponse}$ g de matière grasse car $${den[0]}\\times${den[1]}=${reponse}$.<br>`
            } else {
              reponse = arrondi(den[0] / den[1])
              texteCorr = `Sur $${texNombre(num)}$ g de fromage, il y a $${den[0]}$ g de matière grasse, alors avec $${den[1]}$ fois moins de fromage, on obtient $100$ g de fromage dont $${reponse}$ g de matière grasse car $${den[0]}\\div${den[1]}=${reponse}$.<br>`
            }
            texteCorr += 'La proportion de matière grasse dans ce fromage'
          }
          break
        }

        case 4: {
          texte = `Un joueur de foot a tiré $${texNombre(num)}$ fois au but et a marqué $${den[0]}$ fois. Quel est son pourcentage de réussite ?`
          if (num === 100) {
            reponse = den[0]
            texteCorr = `Sur $100$ tirs, il a marqué $${den[0]}$ buts, alors son taux de réussite`
          } else {
            if (num < 100) {
              reponse = den[0] * den[1]
              texteCorr = `Sur $${texNombre(num)}$ tirs, il y a $${den[0]}$ buts, alors avec $${den[1]}$ fois plus de tirs, il aurait effectué $100$ tirs et marqué $${reponse}$ buts car $${den[0]}\\times${den[1]}=${reponse}$.<br>`
            } else {
              reponse = arrondi(den[0] / den[1])
              texteCorr = `Sur $${texNombre(num)}$ tirs, il y a $${den[0]}$ buts, alors avec $${den[1]}$ fois moins de tirs, il aurait effectué $100$ tirs et marqué $${reponse}$ buts $${den[0]}\\div${den[1]}=${reponse}$.<br>`
            }
            texteCorr += 'La proportion de réussite aux tirs au but'
          }
          break
        }

        case 5: {
          texte = `Une usine fabrique $${texNombre(num)}$ pièces, dont $${den[0]}$ sont défectueuses. Quel est le pourcentage de pièces défectueuses ?`
          if (num === 100) {
            reponse = den[0]
            texteCorr = `Sur $100$ pièces, il y en a $${den[0]}$ de défectueuses, alors la proportion de pièces défectueuses dans cette usine`
          } else {
            if (num < 100) {
              reponse = den[0] * den[1]
              texteCorr = `Sur $${texNombre(num)}$ pièces, $${den[0]}$ sont défectueuses, alors avec $${den[1]}$ fois plus de pièces, on obtient $100$ pièces dont $${reponse}$ défectueuses car $${den[0]}\\times${den[1]}=${reponse}$.<br>`
            } else {
              reponse = arrondi(den[0] / den[1])
              texteCorr = `Sur $${texNombre(num)}$ pièces, $${den[0]}$ sont défectueuses, alors avec $${den[1]}$ fois moins de pièces, on obtient $100$ pièces dont $${reponse}$ défectueuses car $${den[0]}\\div${den[1]}=${reponse}$.<br>`
            }
            texteCorr += 'La proportion de pièces défectueuses dans cette usine'
          }
          break
        }

        case 6: {
          texte = `Dans une bibliothèque de $${texNombre(num)}$ livres, il y a $${den[0]}$ romans. Quel est le pourcentage de romans ?`
          if (num === 100) {
            reponse = den[0]
            texteCorr = `Sur $100$ livres, il y a $${den[0]}$ romans alors la proportion de romans dans cette bibliothèque`
          } else {
            if (num < 100) {
              reponse = den[0] * den[1]
              texteCorr = `Sur $${texNombre(num)}$ livres, $${den[0]}$ sont des romans, alors avec $${den[1]}$ fois plus de livres, on obtient $100$ livres dont $${reponse}$ romans car $${den[0]}\\times${den[1]}=${reponse}$.<br>`
            } else {
              reponse = arrondi(den[0] / den[1])
              texteCorr = `Sur $${texNombre(num)}$ livres, $${den[0]}$ sont des romans, alors avec $${den[1]}$ fois moins de livres, on obtient $100$ livres dont $${reponse}$ romans car $${den[0]}\\div${den[1]}=${reponse}$.<br>`
            }
            texteCorr += 'La proportion de romans dans cette bibliothèque'
          }
          break
        }
        case 7: {
          texte = `Dans un paquet de $${texNombre(num)}$ bonbons, $${den[0]}$ sont à la fraise. Quel est le pourcentage de bonbons à la fraise ?`
          if (num === 100) {
            reponse = den[0]
            texteCorr = `Puisque sur $100$ bonbons, il y en a $${den[0]}$ à la fraise, alors la proportion de bonbons à la fraise dans ce paquet`
          } else {
            if (num < 100) {
              reponse = den[0] * den[1]
              texteCorr = `Sur $${texNombre(num)}$ bonbons, $${den[0]}$ sont à la fraise, alors avec $${den[1]}$ fois plus de bonbons, on obtient $100$ bonbons dont $${reponse}$ à la fraise car $${den[0]}\\times${den[1]}=${reponse}$.<br>`
            } else {
              reponse = arrondi(den[0] / den[1])
              texteCorr = `Sur $${texNombre(num)}$ bonbons, $${den[0]}$ sont à la fraise, alors avec $${den[1]}$ fois moins de bonbons, on obtient $100$ bonbons dont $${reponse}$ à la fraise car $${den[0]}\\div${den[1]}=${reponse}$.<br>`
            }
            texteCorr += 'La proportion de bonbons à la fraise dans ce paquet'
          }
          break
        }
        case 8: {
          texte = `Sur $${texNombre(num)}$ arbres plantés dans un parc, $${den[0]}$ sont des chênes. Quel est le pourcentage de chênes ?`
          if (num === 100) {
            reponse = den[0]
            texteCorr = `Puisque sur $100$ arbres, $${den[0]}$ sont des chênes, alors la proportion de chênes dans ce parc`
          } else {
            if (num < 100) {
              reponse = den[0] * den[1]
              texteCorr = `Sur $${texNombre(num)}$ arbres, $${den[0]}$ sont des chênes, alors avec $${den[1]}$ fois plus d'arbres, on obtient $100$ arbres dont $${reponse}$ chênes car $${den[0]}\\times${den[1]}=${reponse}$.<br>`
            } else {
              reponse = arrondi(den[0] / den[1])
              texteCorr = `Sur $${texNombre(num)}$ arbres, $${den[0]}$ sont des chênes, alors avec $${den[1]}$ fois moins d'arbres, on obtient $100$ arbres dont $${reponse}$ chênes car $${den[0]}\\div${den[1]}=${reponse}$.<br>`
            }
            texteCorr += 'La proportion de chênes dans ce parc'
          }
          break
        }
        case 9: {
          texte = `Une voiture parcourt $${texNombre(num)}\\text{ km}$, dont $${den[0]}\\text{ km}$ sur autoroute. Quel est le pourcentage du trajet fait sur autoroute ?`
          if (num === 100) {
            reponse = den[0]
            texteCorr = `Puisque sur $100\\text{ km}$, $${den[0]}$ sont faits sur autoroute, alors la proportion du trajet sur autoroute`
          } else {
            if (num < 100) {
              reponse = den[0] * den[1]
              texteCorr = `Sur $${texNombre(num)}\\text{ km}$, $${den[0]}$ sont faits sur autoroute, alors avec $${den[1]}$ fois plus de km, on obtient $100\\text{ km}$ dont $${reponse}$ sur autoroute car $${den[0]}\\times${den[1]}=${reponse}$.<br>`
            } else {
              reponse = arrondi(den[0] / den[1])
              texteCorr = `Sur $${texNombre(num)}\\text{ km}$, $${den[0]}$ sont faits sur autoroute, alors avec $${den[1]}$ fois moins de km, on obtient $100\\text{ km}$ dont $${reponse}$ sur autoroute car $${den[0]}\\div${den[1]}=${reponse}$.<br>`
            }
            texteCorr += 'La proportion du trajet sur autoroute'
          }
          break
        }
        case 10: {
          texte = `Parmi les $${texNombre(num)}$ questions d’un contrôle, un élève en a réussi $${den[0]}$. Quel est son pourcentage de réussite ?`
          if (num === 100) {
            reponse = den[0]
            texteCorr = `Avec $100$ questions et $${den[0]}$ réussies, alors la proportion de réussite à ce contrôle`
          } else {
            if (num < 100) {
              reponse = den[0] * den[1]
              texteCorr = `Avec $${texNombre(num)}$ questions et $${den[0]}$ réussies, alors avec $${den[1]}$ fois plus de questions, on obtient $100$ questions dont $${reponse}$ réussies car $${den[0]}\\times${den[1]}=${reponse}$.<br>`
            } else {
              reponse = arrondi(den[0] / den[1])
              texteCorr = `Avec $${texNombre(num)}$ questions et $${den[0]}$ réussies, alors avec $${den[1]}$ fois moins de questions, on obtient $100$ questions dont $${reponse}$ réussies car $${den[0]}\\div${den[1]}=${reponse}$.<br>`
            }
            texteCorr += 'La proportion de réussite à ce contrôle'
          }
          break
        }
        case 11: {
          texte = `Sur $${texNombre(num)}$ animaux d'une ferme, $${den[0]}$ sont des poules. Quel est le pourcentage de poules ?`
          if (num === 100) {
            reponse = den[0]
            texteCorr = `Sur $100$ animaux, il y a $${den[0]}$ poules, alors la proportion de poules dans cette ferme`
          } else {
            if (num < 100) {
              reponse = den[0] * den[1]
              texteCorr = `Sur $${texNombre(num)}$ animaux, il y a $${den[0]}$ poules, alors avec $${den[1]}$ fois plus d'animaux, on obtient $100$ animaux dont $${reponse}$ poules car $${den[0]}\\times${den[1]}=${reponse}$.<br>`
            } else {
              reponse = arrondi(den[0] / den[1])
              texteCorr = `Sur $${texNombre(num)}$ animaux, il y a $${den[0]}$ poules, alors avec $${den[1]}$ fois moins d'animaux, on obtient $100$ animaux dont $${reponse}$ poules car $${den[0]}\\div${den[1]}=${reponse}$.<br>`
            }
            texteCorr += 'La proportion de poules dans cette ferme'
          }
          break
        }
        case 12: {
          texte = `Dans un groupe de $${texNombre(num)}$ élèves, $${den[0]}$ portent des lunettes. Quel est le pourcentage d'élèves portant des lunettes ?`
          if (num === 100) {
            reponse = den[0]
            texteCorr = `Sur $100$ élèves, $${den[0]}$ portent des lunettes, alors la proportion d'élèves à lunettes dans ce groupe`
          } else {
            if (num < 100) {
              reponse = den[0] * den[1]
              texteCorr = `Parmi $${texNombre(num)}$ élèves, $${den[0]}$ portent des lunettes, alors avec $${den[1]}$ fois plus d'élèves, on obtient $100$ élèves dont $${reponse}$ à lunettes car $${den[0]}\\times${den[1]}=${reponse}$.<br>`
            } else {
              reponse = arrondi(den[0] / den[1])
              texteCorr = `Parmi $${texNombre(num)}$ élèves, $${den[0]}$ portent des lunettes, alors avec $${den[1]}$ fois moins d'élèves, on obtient $100$ élèves dont $${reponse}$ à lunettes car $${den[0]}\\div${den[1]}=${reponse}$.<br>`
            }
            texteCorr += "La proportion d'élèves à lunettes dans ce groupe"
          }
          break
        }
        case 13: {
          texte = `Une bibliothèque contient $${texNombre(num)}$ livres, dont $${den[0]}$ sont des bandes dessinées. Quel est le pourcentage de BD ?`
          if (num === 100) {
            reponse = den[0]
            texteCorr = `Sur $100$ livres, $${den[0]}$ sont des BD, alors la proportion de bandes dessinées dans cette bibliothèque`
          } else {
            if (num < 100) {
              reponse = den[0] * den[1]
              texteCorr = `Sur $${texNombre(num)}$ livres, $${den[0]}$ sont des BD, alors avec $${den[1]}$ fois plus de livres, on obtient $100$ livres dont $${reponse}$ bandes dessinées car $${den[0]}\\times${den[1]}=${reponse}$.<br>`
            } else {
              reponse = arrondi(den[0] / den[1])
              texteCorr = `Sur $${texNombre(num)}$ livres, $${den[0]}$ sont des BD, alors avec $${den[1]}$ fois moins de livres, on obtient $100$ livres dont $${reponse}$ bandes dessinées car $${den[0]}\\div${den[1]}=${reponse}$.<br>`
            }
            texteCorr +=
              'La proportion de bandes dessinées dans cette bibliothèque'
          }
          break
        }
        case 14: {
          texte = `Sur un total de $${texNombre(num)}$ fruits chez un primeur, $${den[0]}$ sont des pommes. Quel est le pourcentage de pommes ?`
          if (num === 100) {
            reponse = den[0]
            texteCorr = `Sur $100$ fruits, $${den[0]}$ sont des pommes, alors la proportion de pommes chez ce primeur`
          } else {
            if (num < 100) {
              reponse = den[0] * den[1]
              texteCorr = `Sur $${texNombre(num)}$ fruits, $${den[0]}$ sont des pommes, alors avec $${den[1]}$ fois plus de fruits, on obtient $100$ fruits dont $${reponse}$ pommes car $${den[0]}\\times${den[1]}=${reponse}$.<br>`
            } else {
              reponse = arrondi(den[0] / den[1])
              texteCorr = `Sur $${texNombre(num)}$ fruits, $${den[0]}$ sont des pommes, alors avec $${den[1]}$ fois moins de fruits, on obtient $100$ fruits dont $${reponse}$ pommes car $${den[0]}\\div${den[1]}=${reponse}$.<br>`
            }
            texteCorr += 'La proportion de pommes chez ce primeur'
          }
          break
        }
        case 15: {
          texte = `Une bouteille contient $${texNombre(num)}$ cl de jus, dont $${den[0]}$ cg de sucre. Quel est le pourcentage de sucre ?`
          if (num === 100) {
            reponse = den[0]
            texteCorr = `Sur $100$ cl, il y a $${den[0]}$ cg de sucre, alors la proportion de sucre dans ce jus`
          } else {
            if (num < 100) {
              reponse = den[0] * den[1]
              texteCorr = `Dans $${texNombre(num)}$ cl, il y a $${den[0]}$ cg de sucre, alors avec $${den[1]}$ fois plus de jus, on obtient $100$ cl jus dont $${reponse}$ cg de sucre car $${den[0]}\\times${den[1]}=${reponse}$.<br>`
            } else {
              reponse = arrondi(den[0] / den[1])
              texteCorr = `Dans $${texNombre(num)}$ cl, il y a $${den[0]}$ cg de sucre, alors avec $${den[1]}$ fois moins de jus, on obtient $100$ cl jus dont $${reponse}$ cg de sucre car $${den[0]}\\div${den[1]}=${reponse}$.<br>`
            }
            texteCorr += 'La proportion de sucre dans ce jus'
          }
          break
        }
        case 16: {
          texte = `Un poulailler possède $${texNombre(num)}$ œufs, dont $${den[0]}$ sont cassés. Quel est le pourcentage d’œufs cassés ?`
          if (num === 100) {
            reponse = den[0]
            texteCorr = `Sur $100$ œufs, $${den[0]}$ sont cassés, alors la proportion d'œufs cassés dans ce poulailler`
          } else {
            if (num < 100) {
              reponse = den[0] * den[1]
              texteCorr = `Parmi $${texNombre(num)}$ œufs, $${den[0]}$ sont cassés, alors avec $${den[1]}$ fois plus d'œufs, on obtient $100$ œufs dont $${reponse}$ cassés car $${den[0]}\\times${den[1]}=${reponse}$.<br>`
            } else {
              reponse = arrondi(den[0] / den[1])
              texteCorr = `Parmi $${texNombre(num)}$ œufs, $${den[0]}$ sont cassés, alors avec $${den[1]}$ fois moins d'œufs, on obtient $100$ œufs dont $${reponse}$ cassés car $${den[0]}\\div${den[1]}=${reponse}$.<br>`
            }
            texteCorr += "La proportion d'œufs cassés dans ce poulailler"
          }
          break
        }
        case 17: {
          texte = `Un parking contient $${texNombre(num)}$ véhicules, dont $${den[0]}$ sont des vélos. Quel est le pourcentage de vélos ?`
          if (num === 100) {
            reponse = den[0]
            texteCorr = `Sur $100$ véhicules, $${den[0]}$ sont des vélos, alors la proportion de vélos dans ce parking`
          } else {
            if (num < 100) {
              reponse = den[0] * den[1]
              texteCorr = `Sur $${texNombre(num)}$ véhicules, $${den[0]}$ sont des vélos, alors avec $${den[1]}$ fois plus de véhicules, on obtient $100$ véhicules dont $${reponse}$ vélos car $${den[0]}\\times${den[1]}=${reponse}$.<br>`
            } else {
              reponse = arrondi(den[0] / den[1])
              texteCorr = `Sur $${texNombre(num)}$ véhicules, $${den[0]}$ sont des vélos, alors avec $${den[1]}$ fois moins de véhicules, on obtient $100$ véhicules dont $${reponse}$ vélos car $${den[0]}\\div${den[1]}=${reponse}$.<br>`
            }
            texteCorr += 'La proportion de vélos dans ce parking'
          }
          break
        }
        case 18: {
          texte = `Dans une réserve de $${texNombre(num)}$ litres d'eau, $${den[0]}$ litres sont utilisés. Quel est le pourcentage utilisé ?`
          if (num === 100) {
            reponse = den[0]
            texteCorr = `Sur $100$ litres, $${den[0]}$ sont utilisés, alors la proportion d'eau utilisée dans cette réserve`
          } else {
            if (num < 100) {
              reponse = den[0] * den[1]
              texteCorr = `Sur $${texNombre(num)}$ litres, $${den[0]}$ sont utilisés, alors avec $${den[1]}$ fois plus de litres d'eau, on obtient $100$ litres d'eau dont $${reponse}$ litres sont utilisés car $${den[0]}\\times${den[1]}=${reponse}$.<br>`
            } else {
              reponse = arrondi(den[0] / den[1])
              texteCorr = `Sur $${texNombre(num)}$ litres, $${den[0]}$ sont utilisés, alors avec $${den[1]}$ fois moins de litres d'eau, on obtient $100$ litres d'eau dont $${reponse}$ litres sont utilisés car $${den[0]}\\div${den[1]}=${reponse}$.<br>`
            }
            texteCorr += "La proportion d'eau utilisée dans cette réserve"
          }
          break
        }
        case 19: {
          texte = `Un sachet contient $${texNombre(num)}$ bonbons, dont $${den[0]}$ sont rouges. Quel est le pourcentage de bonbons rouges ?`
          if (num === 100) {
            reponse = den[0]
            texteCorr = `Sur $100$ bonbons, $${den[0]}$ sont rouges, alors la proportion de bonbons rouges dans ce sachet est donc de $${miseEnEvidence(reponse)}\\,\\%$.`
          } else {
            if (num < 100) {
              reponse = den[0] * den[1]
              texteCorr = `Sur $${texNombre(num)}$ bonbons, $${den[0]}$ sont rouges, alors avec $${den[1]}$ fois plus de bonbons, on obtient $100$ bonbons dont $${reponse}$ rouges car $${den[0]}\\times${den[1]}=${reponse}$.<br>`
            } else {
              reponse = arrondi(den[0] / den[1])
              texteCorr = `Sur $${texNombre(num)}$ bonbons, $${den[0]}$ sont rouges, alors avec $${den[1]}$ fois plus de bonbons, on obtient $100$ bonbons dont $${reponse}$ rouges car $${den[0]}\\div${den[1]}=${reponse}$.<br>`
            }
            texteCorr += 'La proportion de bonbons rouges dans ce sachet'
          }
          break
        }
      }
      texteCorr += ` est donc de $${new FractionEtendue(reponse, 100).texFraction}$, soit $${miseEnEvidence(reponse)}\\,\\%$.`

      texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers, {
        texteApres: ' %',
      })
      handleAnswers(this, i, {
        reponse: { value: reponse, options: { nombreDecimalSeulement: true } },
      })
      if (this.questionJamaisPosee(i, num, ...den)) {
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
