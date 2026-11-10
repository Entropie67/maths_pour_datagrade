import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  texFractionFromString,
  texFractionReduite,
} from '../../lib/outils/deprecatedFractions'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { pgcd } from '../../lib/outils/primalite'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Trouver l'inverse d'un nombre"
export const interactifReady = true

/**
 * * Calcul de l'inverse d'un nombre.
 *
 * Paramétrages possibles :
 * * 1 : inverse d'un nombre entier
 * * 2 : inverse d'une fraction
 * * 3 : inverse d'un nombre décimal
 * * 4 : mélange des trois autres niveaux
 * @author Jean-claude Lhote
 */
export const uuid = '43cea'

export const refs = {
  'fr-fr': ['4C22-1'],
  'fr-ch': ['10LSNO3B-3', '11CTNO2A-3', '11LCNO2A-3', 'PRQNO12B-5'],
}
export default class ExerciceTrouverInverse extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      4,
      ' 1 : Nombres entiers\n 2 : Nombres décimaux\n 3 : Fractions\n 4 : Mélange',
    ]
    this.sup = 1 // Avec ou sans relatifs

    this.consigne =
      "Calculer l'inverse et donner la réponse sous forme de fraction ou sous forme d'un nombre décimal quand c'est possible."
    this.spacing = 2
    this.spacingCorr = 2
    this.nbQuestions = 5
  }

  nouvelleVersion() {
    let typesDeQuestionsDisponibles
    const listeEntiers = [
      [1, 1],
      [2, 0.5],
      [3, 0],
      [4, 0.25],
      [5, 0.2],
      [6, 0],
      [7, 0],
      [8, 0.125],
      [9, 0],
      [10, 0.1],
      [11, 0],
      [12, 0],
      [13, 0],
      [14, 0],
      [15, 0],
      [20, 0.05],
      [50, 0.02],
      [100, 0.01],
    ]
    // [n,0] si l'inverse de n n'est pas décimal [n,1/n] si il est décimal.
    const listeDecimaux = [
      [0.1, 10, 1],
      [0.2, 5, 1],
      [0.3, 10, 3],
      [0.4, 10, 4],
      [0.5, 2, 1],
      [0.6, 10, 6],
      [0.75, 100, 75],
      [0.8, 10, 8],
      [1.2, 10, 12],
      [1.5, 10, 15],
      [2.5, 10, 25],
      [3.5, 10, 35],
      [4.8, 10, 48],
      [7.5, 10, 75],
    ]
    // [x,n,d] n/d = inverse de x fraction à réduire si besoin ... d=1 si l'inverse de x est entier.
    const listeFractions: [number, number, boolean][] = [
      [3, 4, false],
      [5, 2, true],
      [4, 5, true],
      [5, 7, true],
      [7, 3, false],
      [16, 6, true],
      [12, 18, true],
      [9, 4, false],
      [4, 6, true],
      [8, 7, true],
      [5, 9, true],
      [9, 7, false],
      [13, 6, false],
      [7, 2, false],
    ]
    // [n,d,bol] inverse d/n à simplifier si besoin. si bol = true, alors d/n est décimal.
    let couplesDInverses
    if (this.sup === 4) {
      typesDeQuestionsDisponibles = [1, 1, 2, 2, 3] // nombre entier,fraction,décimal]
    } else {
      typesDeQuestionsDisponibles = [parseInt(this.sup)]
    }
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (
      let i = 0,
        nombreChoisi,
        nombreInverse,
        nombreInverseNum,
        nombreInverseDen,
        texte,
        texteCorr,
        typesDeQuestions,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      typesDeQuestions = listeTypeDeQuestions[i]
      switch (typesDeQuestions) {
        case 1: // inverse d'entier
          couplesDInverses = choice(listeEntiers)
          nombreChoisi = couplesDInverses[0]
          nombreInverse = couplesDInverses[1]
          if (choice([true, false])) {
            // nombre entier positif
            if (nombreInverse !== 0) {
              // inverse décimal
              texteCorr = `L'inverse de $${nombreChoisi}$ est $${miseEnEvidence(
                texNombre(nombreInverse),
              )} \\:$ car $\\: ${nombreChoisi}   \\times   ${texNombre(
                nombreInverse,
              )} =  1$.`
            } else {
              // inverse non décimal
              texteCorr = `L'inverse de $${nombreChoisi}$ est $${miseEnEvidence(
                texFractionFromString(1, nombreChoisi),
              )} \\:$ car $\\: ${nombreChoisi}   \\times   ${texFractionFromString(
                1,
                nombreChoisi,
              )} =  1$.`
            }
          } else {
            // nombre entier négatif
            nombreChoisi = -nombreChoisi
            if (nombreInverse !== 0) {
              // inverse décimal
              texteCorr = `L'inverse de $${nombreChoisi}$ est $${miseEnEvidence(
                texNombre(-nombreInverse),
              )} \\:$`
              texteCorr += ` car $\\: ${nombreChoisi}  \\times  \\left(-${texNombre(
                nombreInverse,
              )}\\right)  =  1$.`
            } else {
              // inverse non décimal
              texteCorr = `L'inverse de $${nombreChoisi}$ est $${miseEnEvidence(
                `-${texFractionFromString(1, -nombreChoisi)}`,
              )} \\:$ car $\\: ${nombreChoisi}   \\times   \\left(-${texFractionFromString(
                1,
                -nombreChoisi,
              )}\\right) =  1$.`
            }
          }
          texte = `Quel est l'inverse de $${texNombre(nombreChoisi)}$ ?`
          handleAnswers(this, i, {
            reponse: {
              value: new FractionEtendue(1, nombreChoisi).texFraction,
              options: { fractionEgale: true, nombreDecimalSeulement: true },
            },
          })
          break
        case 2:
          couplesDInverses = choice(listeDecimaux)
          nombreChoisi = couplesDInverses[0]
          nombreInverseNum = couplesDInverses[1]
          nombreInverseDen = couplesDInverses[2]
          if (choice([true, false])) {
            // nombre positif
            handleAnswers(this, i, {
              reponse: {
                value: new FractionEtendue(nombreInverseNum, nombreInverseDen)
                  .texFraction,
                options: { fractionEgale: true, nombreDecimalSeulement: true },
              },
            })

            if (pgcd(nombreInverseNum, nombreInverseDen) === 1) {
              // non simplifiable après inversion
              texteCorr = `Comme $${texNombre(nombreChoisi)}=${texFractionFromString(
                nombreInverseDen,
                nombreInverseNum,
              )}$, l'inverse de $${texNombre(
                nombreChoisi,
              )}$ est $${miseEnEvidence(
                texFractionFromString(nombreInverseNum, nombreInverseDen),
              )} \\:$ car $\\: ${texFractionFromString(
                nombreInverseDen,
                nombreInverseNum,
              )}   \\times   ${texFractionFromString(
                nombreInverseNum,
                nombreInverseDen,
              )} =  1$.`
            } else {
              // à simplifier après inversion
              texteCorr = `Comme $${texNombre(nombreChoisi)}=${texFractionFromString(
                nombreInverseDen,
                nombreInverseNum,
              )}=${texFractionReduite(
                nombreInverseDen,
                nombreInverseNum,
              )}$, l'inverse de $${texNombre(
                nombreChoisi,
              )}$ est $${miseEnEvidence(
                texFractionReduite(nombreInverseNum, nombreInverseDen),
              )} \\:$ car $\\: ${texFractionReduite(
                nombreInverseDen,
                nombreInverseNum,
              )}  \\times   ${texFractionReduite(
                nombreInverseNum,
                nombreInverseDen,
              )} =  1$.`
            }
          } else {
            // nombre négatif
            nombreChoisi = -nombreChoisi
            handleAnswers(this, i, {
              reponse: {
                value: new FractionEtendue(-nombreInverseNum, nombreInverseDen)
                  .texFraction,
                options: { fractionEgale: true, nombreDecimalSeulement: true },
              },
            })
            if (pgcd(nombreInverseNum, nombreInverseDen) === 1) {
              // non simplifiable après inversion
              texteCorr = `L'inverse de $${texNombre(
                nombreChoisi,
              )}$ est $${miseEnEvidence(
                `-${texFractionFromString(nombreInverseNum, nombreInverseDen)}`,
              )} \\:$ car $\\: ${texNombre(
                nombreChoisi,
              )}   \\times   \\left(-${texFractionFromString(
                nombreInverseNum,
                nombreInverseDen,
              )}\\right) =  1$.`
              texteCorr = `Comme $${texNombre(
                nombreChoisi,
              )}=-${texFractionFromString(
                nombreInverseDen,
                nombreInverseNum,
              )}$, l'inverse de $${texNombre(
                nombreChoisi,
              )}$ est $${miseEnEvidence(
                `-${texFractionFromString(nombreInverseNum, nombreInverseDen)}`,
              )} \\:$ car $\\: -${texFractionFromString(
                nombreInverseDen,
                nombreInverseNum,
              )}   \\times  \\left(- ${texFractionFromString(
                nombreInverseNum,
                nombreInverseDen,
              )}\\right) =  1$.`
            } else {
              // à simplifier après inversion
              texteCorr = `Comme $${texNombre(
                nombreChoisi,
              )}=-${texFractionFromString(
                nombreInverseDen,
                nombreInverseNum,
              )}=-${texFractionReduite(
                nombreInverseDen,
                nombreInverseNum,
              )}$, l'inverse de $${texNombre(
                nombreChoisi,
              )}$ est $${miseEnEvidence(
                `-${texFractionReduite(nombreInverseNum, nombreInverseDen)}`,
              )} \\:$ car $\\: -${texFractionReduite(
                nombreInverseDen,
                nombreInverseNum,
              )}  \\times  \\left(- ${texFractionReduite(
                nombreInverseNum,
                nombreInverseDen,
              )} \\right)=  1$.`
            }
          }
          texte = `Quel est l'inverse de $${texNombre(nombreChoisi)}$ ?`
          break
        case 3:
        default:
          couplesDInverses = choice(listeFractions)
          nombreInverseNum = couplesDInverses[0]
          nombreInverseDen = couplesDInverses[1]
          nombreChoisi = nombreInverseNum / nombreInverseDen
          if (choice([true, false])) {
            handleAnswers(this, i, {
              reponse: {
                value: new FractionEtendue(nombreInverseDen, nombreInverseNum)
                  .texFraction,
                options: { fractionEgale: true, nombreDecimalSeulement: true },
              },
            })
            // fraction positive
            if (couplesDInverses[2] === true) {
              // inverse décimal
              texteCorr = `L'inverse de $${texFractionFromString(
                nombreInverseNum,
                nombreInverseDen,
              )}$ est $${miseEnEvidence(
                texFractionFromString(nombreInverseDen, nombreInverseNum),
              )}=${texNombre(
                nombreInverseDen / nombreInverseNum,
              )} \\:$ car $\\: ${texFractionFromString(
                nombreInverseNum,
                nombreInverseDen,
              )}   \\times   ${texFractionFromString(
                nombreInverseDen,
                nombreInverseNum,
              )} =  1$.`
            } else {
              // inverse non décimal
              texteCorr = `L'inverse de $${texFractionFromString(
                nombreInverseNum,
                nombreInverseDen,
              )}$ est $${miseEnEvidence(
                texFractionFromString(nombreInverseDen, nombreInverseNum),
              )} \\:$ car $\\: ${texFractionFromString(
                nombreInverseNum,
                nombreInverseDen,
              )}   \\times   ${texFractionFromString(
                nombreInverseDen,
                nombreInverseNum,
              )} =  1$.`
            }
            texte = `Quel est l'inverse de $${texFractionFromString(
              nombreInverseNum,
              nombreInverseDen,
            )}$ ?`
          } else {
            // fraction négative
            handleAnswers(this, i, {
              reponse: {
                value: new FractionEtendue(-nombreInverseDen, nombreInverseNum)
                  .texFraction,
                options: { fractionEgale: true, nombreDecimalSeulement: true },
              },
            })
            if (couplesDInverses[2] === true) {
              // inverse décimal
              texteCorr = `L'inverse de $-${texFractionFromString(
                nombreInverseNum,
                nombreInverseDen,
              )}$ est $-${texFractionFromString(
                nombreInverseDen,
                nombreInverseNum,
              )}=${miseEnEvidence(
                `-${texNombre(nombreInverseDen / nombreInverseNum)}`,
              )} \\:$ car $\\: -${texFractionFromString(
                nombreInverseNum,
                nombreInverseDen,
              )}   \\times  \\left(- ${texFractionFromString(
                nombreInverseDen,
                nombreInverseNum,
              )}\\right) =  1$.`
            } else {
              // inverse non décimal
              texteCorr = `L'inverse de $-${texFractionFromString(
                nombreInverseNum,
                nombreInverseDen,
              )}$ est $${miseEnEvidence(
                `-${texFractionFromString(nombreInverseDen, nombreInverseNum)}`,
              )} \\:$ car $\\: -${texFractionFromString(
                nombreInverseNum,
                nombreInverseDen,
              )}   \\times  \\left(- ${texFractionFromString(
                nombreInverseDen,
                nombreInverseNum,
              )} \\right)=  1$.`
            }
            texte = `Quel est l'inverse de $-${texFractionFromString(
              nombreInverseNum,
              nombreInverseDen,
            )}$ ?`
          }
          break
      }
      if (this.interactif) {
        texte += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierDeBaseAvecFraction,
          { texteAvant: sp(5) },
        )
      }
      if (this.questionJamaisPosee(i, typesDeQuestions, String(nombreChoisi))) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this) // Espacement de 2 em entre chaque questions.
  }
}
