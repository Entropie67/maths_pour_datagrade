import Decimal from 'decimal.js'
import { createList } from '../../lib/format/lists'
import { ajouteQuestionMathlive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import { nombreEnLettres } from '../../modules/nombreEnLettres'
import { randint } from '../../modules/outils'
import Exercice from '../Exercice'

import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { sp } from '../../lib/outils/outilString'

export const uuid = 'ab18c'
export const refs = {
  'fr-fr': ['CM2N6C-6'],
  'fr-2016': ['c3C32-05'],
  'fr-ch': ['9R1NO4I-7', '9R2NO4I-7', '9R3NO4I-7'],
}
export const titre =
  'La bouteille (problème de conversion avec fraction simple)'
export const dateDePublication = '30/11/2024'

export const interactifReady = true
/**
 * @Author Jean-claude Lhote
 * Sources (eduscol) : https://eduscol.education.fr/ressources/numerique/2020/2020-exercices-mathematiques-6e
 * Ces exercices seront proposés systématiquement pour 3 niveaux de difficulté afin de différentier autour d'un même problème
 */
const fractionEnLettres = (frac: FractionEtendue) => {
  if (frac.den === 2)
    return `${nombreEnLettres(frac.num)} demi${frac.num > 1 ? 's' : ''}`
  if (frac.den === 4)
    return `${nombreEnLettres(frac.num)} quart${frac.num > 1 ? 's' : ''} de`
  return `${nombreEnLettres(frac.num)} ${nombreEnLettres(frac.den)}ième${frac.num > 1 ? 's' : ''}`
}
export default class ExerciceProbleme005 extends Exercice {
  constructor() {
    super()
    this.spacing = 1.2
    this.spacingCorr = 1.2
    this.nbQuestions = 1
    this.besoinFormulaireNumerique = [
      'niveau de difficulté',
      3,
      '1 : Élèves à besoin\n2 : Moyens\n3 : Avancés',
    ]
    this.sup = 2

    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = true
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 5;) {
      const volume = new Decimal(randint(1, 7)).div(10)
      const frac = choice([
        new FractionEtendue(1, 2),
        new FractionEtendue(1, 4),
        new FractionEtendue(3, 4),
      ])
      let enonce = `Une bouteille ${this.sup === 3 ? 'de 1L' : ''} contient `
      let correction = ''

      switch (this.sup) {
        case 1:
          enonce += `$${texNombre(volume.mul(1000), 0)}$ mL d'eau. On ajoute ${fractionEnLettres(frac)} litre d'eau dans la bouteille.<br>`
          enonce += createList({
            items: [
              `Compléter avec une écriture décimale : «${sp()}${fractionEnLettres(frac)} litre d'eau = ${
                this.interactif
                  ? ajouteQuestionMathlive({
                      exercice: this,
                      question: i * 2,
                      typeInteractivite: 'mathlive',
                      texteApres: ' mL',
                      reponseParams: { formatInteractif: 'mathalea-mathfield' },
                      objetReponse: {
                        reponse: {
                          value: texNombre(
                            frac.multiplieEntier(1000).valeurDecimale,
                            0,
                          ),
                        },
                      },
                    })
                  : '$\\ldots$ mL'
              }${sp()}».`,
              "Quel volume d'eau la bouteille contient-elle maintenant ?" +
                ajouteQuestionMathlive({
                  exercice: this,
                  question: i * 2 + 1,
                  typeInteractivite: 'mathlive',
                  texteApres: ' mL',
                  reponseParams: { formatInteractif: 'mathalea-mathfield' },
                  objetReponse: {
                    reponse: {
                      value: texNombre(
                        volume
                          .mul(1000)
                          .plus(frac.multiplieEntier(1000).valeurDecimale),
                        0,
                      ),
                    },
                  },
                }),
            ],
            style: 'nombres',
          })
          correction = createList({
            items: [
              `${
                this.correctionDetaillee
                  ? `On sait que $1$ litre d'eau = $${texNombre(1000)}$ mL et que $${frac.texFraction}=${texNombre(frac.valeurDecimale, 2)}$.<br>
              ${fractionEnLettres(frac)} litre d'eau = $${texNombre(frac.valeurDecimale, 2)}\\times ${texNombre(1000, 0)} = ${miseEnEvidence(texNombre(frac.multiplieEntier(1000).valeurDecimale, 0))}$ mL.<br>`
                  : `${fractionEnLettres(frac)} litre d'eau = $${texNombre(frac.valeurDecimale, 2)}\\times ${texNombre(1000, 0)} = ${miseEnEvidence(texNombre(frac.multiplieEntier(1000).valeurDecimale, 0))}$ mL.<br>`
              }`,
              `Volume total d'eau dans la bouteille : $${texNombre(volume.mul(1000), 0)}$ mL $+${texNombre(frac.multiplieEntier(1000).valeurDecimale, 0)}$ mL $=${miseEnEvidence(texNombre(volume.mul(1000).plus(frac.multiplieEntier(1000).valeurDecimale), 0))}$ mL.`,
            ],
            style: 'nombres',
          })

          break
        case 3:
          enonce += `$${texNombre(volume.mul(100), 0)}$ cL d'eau. On ajoute ${fractionEnLettres(frac)} litre d'eau dans la bouteille.<br>`
          enonce += 'La bouteille va-t-elle déborder ?'
          enonce += this.interactif
            ? `${ajouteQuestionMathlive({
                exercice: this,
                question: i * 2,
                typeInteractivite: 'mathlive',

                texteAvant: 'O pour oui, N pour non.',
                reponseParams: { formatInteractif: 'mathalea-mathfield' },
                objetReponse: {
                  reponse: {
                    value: volume
                      .mul(100)
                      .plus(frac.multiplieEntier(100).valeurDecimale)
                      .greaterThan(100)
                      ? ['O', 'oui']
                      : ['N', 'non'],
                    options: { texteSansCasse: true },
                  },
                },
                classe: KeyboardType.vFON,
              })}<br>
            ${ajouteQuestionMathlive({
              exercice: this,
              question: i * 2 + 1,
              typeInteractivite: 'mathlive',
              texteApres: ' cL',
              texteAvant: "Quel est le volume total d'eau dans la bouteille ?",
              reponseParams: { formatInteractif: 'mathalea-mathfield' },
              objetReponse: {
                reponse: {
                  value: texNombre(
                    volume
                      .mul(100)
                      .plus(frac.multiplieEntier(100).valeurDecimale),
                    0,
                  ),
                },
              },
              classe: KeyboardType.vFON,
            })}`
            : ' Justifier votre réponse.'
          correction = `${volume.mul(100).plus(frac.multiplieEntier(100).valeurDecimale).greaterThan(100) ? texteEnCouleurEtGras('Oui') : texteEnCouleurEtGras('Non')}, la bouteille ${volume.mul(100).plus(frac.multiplieEntier(100).valeurDecimale).greaterThan(100) ? 'va' : 'ne va pas'} déborder.<br><br>
             ${texteEnCouleurEtGras('Justification :', 'black')}<br>
            ${
              this.correctionDetaillee
                ? `On sait que $1$ litre d'eau = $100$ cL et que $${frac.texFraction}=${texNombre(frac.valeurDecimale, 2)}$.<br>
            ${fractionEnLettres(frac)} litre d'eau = $${texNombre(frac.valeurDecimale, 2)}\\times ${texNombre(100, 0)} = ${miseEnEvidence(texNombre(frac.multiplieEntier(100).valeurDecimale, 0))}$ cL.<br>`
                : `${fractionEnLettres(frac)} litre d'eau = $${texNombre(frac.valeurDecimale, 2)}\\times ${texNombre(100, 0)} = ${miseEnEvidence(texNombre(frac.multiplieEntier(100).valeurDecimale, 0))}$ cL.<br>`
            }
             Volume total d'eau dans la bouteille : $${texNombre(volume.mul(100), 0)}$ cL $+${texNombre(frac.multiplieEntier(100).valeurDecimale, 0)}$ cL $=${miseEnEvidence(texNombre(volume.mul(100).plus(frac.multiplieEntier(100).valeurDecimale), 0))}$ cL.<br>
            $${texNombre(volume.mul(100).plus(frac.multiplieEntier(100).valeurDecimale), 0)}$ cL ${volume.mul(100).plus(frac.multiplieEntier(100).valeurDecimale).greaterThan(100) ? 'est' : "n'est pas"} supérieur à $100$ cL.`

          break
        default:
          enonce += `$${texNombre(volume, 1)}$ L d'eau. On ajoute ${fractionEnLettres(frac)} litre d'eau dans la bouteille.<br>`
          enonce += createList({
            items: [
              `Compléter avec une écriture décimale : «${sp()}${fractionEnLettres(frac)} litre d'eau = ${
                this.interactif
                  ? ajouteQuestionMathlive({
                      exercice: this,
                      question: i * 2,
                      typeInteractivite: 'mathlive',
                      texteApres: ' L',
                      reponseParams: { formatInteractif: 'mathalea-mathfield' },
                      objetReponse: {
                        reponse: { value: texNombre(frac.valeurDecimale, 2) },
                      },
                    })
                  : '$\\ldots$'
              }${sp()}».`,
              "Quel volume d'eau la bouteille contient-elle maintenant ?" +
                ajouteQuestionMathlive({
                  exercice: this,
                  question: i * 2 + 1,
                  typeInteractivite: 'mathlive',
                  texteApres: ' L',
                  reponseParams: { formatInteractif: 'mathalea-mathfield' },
                  objetReponse: {
                    reponse: {
                      value: texNombre(volume.plus(frac.valeurDecimale), 2),
                    },
                  },
                }),
            ],
            style: 'nombres',
          })
          correction = createList({
            items: [
              `${
                this.correctionDetaillee
                  ? `On sait que $1$ litre d'eau = $1$ L et que $${frac.texFraction}=${texNombre(frac.valeurDecimale, 2)}$.<br>
              ${fractionEnLettres(frac)} litre d'eau = $${texNombre(frac.valeurDecimale, 2)}$ L.<br>`
                  : `${fractionEnLettres(frac)} litre d'eau = $${miseEnEvidence(texNombre(frac.valeurDecimale, 2))}$ L.<br>`
              }`,
              `Volume total d'eau dans la bouteille : $${texNombre(volume, 1)}$ L $+${texNombre(frac.valeurDecimale, 2)}$ L $=${miseEnEvidence(texNombre(volume.plus(frac.valeurDecimale), 2))}$ L.`,
            ],
            style: 'nombres',
          })
          break
      }

      if (this.questionJamaisPosee(i, volume, frac.texFraction)) {
        this.listeQuestions[i] = enonce
        this.listeCorrections[i] = correction
        i++
      }
      cpt++
    }
  }
}
