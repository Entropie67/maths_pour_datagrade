import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice } from '../../lib/outils/arrayOutils'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'

import { createList } from '../../lib/format/lists'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { sp } from '../../lib/outils/outilString'
export const titre = 'Écrire ou reconnaitre une probabilité dans un énoncé'
export const interactifReady = true

export const dateDePublication = '29/04/2025'

/**
 *
 * @author Gilles Mora
 */
export const uuid = '227f0'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export default class EcritureProbabilite extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.sup = 3
    this.spacing = 1.5
    this.spacingCorr = 1.5
    this.besoinFormulaireNumerique = [
      'Choix des questions',
      3,
      '1 : Écrire avec les notations\n2 : Compléter avec la probabilité  \n3 :  Mélange',
    ]
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let val1,
        val2,
        val3,
        listeEV,
        ev,
        Pev1,
        Pev1b,
        Pev2sachantev1,
        Pev2sachantev1b,
        Pev2,
        Pev1sachantev2,
        Pev1bsachantev2,
        liste,
        intro,
        texte1,
        calc1,
        calc2,
        calc3,
        calc4,
        calc5,
        calc6,
        calc1C,
        calc2C,
        calc3C,
        calc4C,
        calc5C,
        calc6C

      switch (randint(1, 4)) {
        case 1: // valises
          val1 = randint(45, 55, 50)
          val2 = randint(83, 93)
          val3 = randint(85, 98, val2)
          listeEV = [
            ['D', 'T'],
            ['D', 'R'],
            ['U', 'S'],
            ['D', 'S'],
          ]
          ev = choice(listeEV)
          Pev1 = val1 / 100
          Pev1b = 1 - Pev1
          Pev2sachantev1 = val2 / 100
          Pev2sachantev1b = val3 / 100
          Pev2 = Pev1 * Pev2sachantev1 + Pev1b * Pev2sachantev1b
          Pev1sachantev2 = (Pev1 * Pev2sachantev1) / Pev2
          Pev1bsachantev2 = 1 - Pev1sachantev2
          liste = createList({
            items: [
              `$${texNombre(Pev2 * 100, 1)}\\,\\%$ des valises réussissent les tests ;`,
              ` Le stock contient $${texNombre(Pev1 * 100, 1)}\\,\\%$ de valises à deux roues ;`,
              ` $${texNombre(Pev2sachantev1b * 100, 1)}\\,\\%$ des valises à quatre roues réussissent les tests ; `,
              `$${texNombre(Pev1 * Pev2sachantev1 * 100, 1)}\\,\\%$  des valises sont des valises à deux roues qui ont réussi les tests ;`,
              `Parmi les valises à deux roues, $${texNombre(Pev2sachantev1 * 100, 1)}\\,\\%$ ont réussi les tests ;`,
              ` $${texNombre(Pev1bsachantev2 * 100, 1)}\\,\\%$ des valises qui ont réussi les tests sont des valises à quatre roues.`,
            ],
            style: 'fleches',
          })
          intro = `Une entreprise produit des valises de deux types : des valises à deux roues et des valises à quatre
    roues. Sur chacun des deux modèles, on effectue des tests afin d’évaluer leur solidité.<br>
    On dispose des informations suivantes sur le stock de production de cette entreprise :<br>`

          texte1 = ` On note : <br>
                $\\bullet$ $${ev[0]}$ : «${sp()}La valise a deux roues${sp()}» ;<br>
                $\\bullet$ $${ev[1]}$ : «${sp()} La valise réussit les tests${sp()}».<br>
                On choisit une valise au hasard dans toutes les valises à l'issue des tests. On appelle P la probabilité associée à cette expérience aléatoire.<br>`
          break
        case 2: // judo karate compétition
          val1 = randint(45, 55, 50)
          val2 = randint(40, 69)
          val3 = randint(55, 79, val2)
          listeEV = [
            ['J', 'C'],
            ['O', 'C'],
            ['U', 'N'],
            ['U', 'C'],
          ]
          ev = choice(listeEV)
          Pev1 = val1 / 100
          Pev1b = 1 - Pev1
          Pev2sachantev1 = val2 / 100
          Pev2sachantev1b = val3 / 100
          Pev2 = Pev1 * Pev2sachantev1 + Pev1b * Pev2sachantev1b
          Pev1sachantev2 = (Pev1 * Pev2sachantev1) / Pev2
          Pev1bsachantev2 = 1 - Pev1sachantev2
          liste = createList({
            items: [
              `$${texNombre(Pev2sachantev1 * 100, 1)}\\,\\%$ des adhérents qui pratiquent le judo le pratiquent en compétition ;`,
              `  $${texNombre(Pev1 * 100, 1)}\\,\\%$ des adhérents pratiquent le judo ;`,
              ` $${texNombre(Pev2sachantev1b * 100, 1)}\\,\\%$ des adhérents qui pratiquent le karaté font de la compétition ; `,
              `$${texNombre(Pev1 * Pev2sachantev1 * 100, 1)}\\,\\%$  des adhérents sont des adhérents qui pratiquent le judo en compétition ;`,
              `Les adhérents pratiquent la compétition pour $${texNombre(Pev2 * 100, 1)}\\,\\%$ d'entre eux ;`,
              ` $${texNombre(Pev1bsachantev2 * 100, 1)}\\,\\%$ des adhérents qui pratiquent leur sport en compétition pratiquent le karaté.`,
            ],
            style: 'fleches',
          })
          intro = `Un club d'arts martiaux propose à ses adhérents de pratiquer le judo ou le karaté. <br>
           Chaque adhérent ne peut pratiquer qu'un seul de ces deux arts martiaux.<br>
De plus, certains des adhérents font de la compétition, d'autres non.<br>
À son entrée dans le club, chaque adhérent a rempli une fiche de renseignements.<br>
On choisit une fiche au hasard et on note P la probabilité associée à cette expérience aléatoire.`
          texte1 = ` On note : <br>
                $\\bullet$ $${ev[0]}$ : «${sp()}La fiche est celle d'un adhérent qui pratique le judo${sp()}» ;<br>
                $\\bullet$ $${ev[1]}$ : «${sp()} La fiche est celle d'un adhérent qui pratique son sport en compétition${sp()}».<br>`
          break
        case 3:
          val1 = randint(45, 55, 50)
          val2 = randint(83, 93)
          val3 = randint(49, 69, val2)
          listeEV = [
            ['R', 'V'],
            ['R', 'E'],
            ['D', 'M'],
            ['R', 'T'],
          ]
          ev = choice(listeEV)
          Pev1 = val1 / 100
          Pev1b = 1 - Pev1
          Pev2sachantev1 = val2 / 100
          Pev2sachantev1b = val3 / 100
          Pev2 = Pev1 * Pev2sachantev1 + Pev1b * Pev2sachantev1b
          Pev1sachantev2 = (Pev1 * Pev2sachantev1) / Pev2
          Pev1bsachantev2 = 1 - Pev1sachantev2
          liste = createList({
            items: [
              ` $${texNombre(Pev1bsachantev2 * 100, 1)}\\,\\%$ des clients qui ont acheté un vêtement n'avaient pas un bon de réduction ;`,
              `  $${texNombre(Pev1 * 100, 1)}\\,\\%$ des clients avaient un bon de réduction ;`,
              `Parmi les clients qui ont un bon de réduction, $${texNombre(Pev2sachantev1 * 100, 1)}\\,\\%$ ont acheté un vêtement ;`,
              `$${texNombre(Pev1 * Pev2sachantev1 * 100, 1)}\\,\\%$  des clients sont des clients qui ont acheté un vêtement et qui avaient un bon de réduction ;`,
              ` $${texNombre(Pev2sachantev1b * 100, 1)}\\,\\%$ des clients qui n'avaient pas de bons de réduction ont acheté un vêtement ; `,
              `$${texNombre(Pev2 * 100, 1)}\\,\\%$ des clients ont acheté un vêtement.`,
            ],
            style: 'fleches',
          })
          intro = `Suite à l’envoi de bons de réduction par internet, le service marketing d’un magasin
de prêt-à-porter effectue une enquête sur les clients du magasin.
Cette enquête a montré que :`

          texte1 = `On note : <br>
                $\\bullet$ $${ev[0]}$ : «${sp()} Le client avait un bon de réduction${sp()}» ;<br>
                $\\bullet$ $${ev[1]}$ : «${sp()} Le client a acheté un vêtement${sp()}».<br>
                On interroge au hasard un client sortant du magasin et on note P la probabilité associée à cette expérience aléatoire.<br> `
          break

        case 4:
        default:
          val1 = randint(45, 55, 50)
          val2 = randint(1, 5)
          val3 = randint(25, 39, val2)
          listeEV = [
            ['V', 'M'],
            ['A', 'M'],
            ['C', 'M'],
            ['V', 'M'],
          ]
          ev = choice(listeEV)
          Pev1 = val1 / 100
          Pev1b = 1 - Pev1
          Pev2sachantev1 = val2 / 100
          Pev2sachantev1b = val3 / 100
          Pev2 = Pev1 * Pev2sachantev1 + Pev1b * Pev2sachantev1b
          Pev1sachantev2 = (Pev1 * Pev2sachantev1) / Pev2
          Pev1bsachantev2 = 1 - Pev1sachantev2
          liste = ` $${texNombre(Pev1 * 100, 1)}\\,\\%$ des animaux ont été vaccinés.<br>
Les experts considèrent que parmi les animaux qui  contractent la maladie, $${texNombre(Pev1bsachantev2 * 100, 1)}\\,\\%$  n'ont pas été vaccinés et que parmi les animaux vaccinés $${texNombre(Pev2sachantev1 * 100, 1)}\\,\\%$ contractent la maladie.<br>
Ils considèrent aussi que $${texNombre(Pev1 * Pev2sachantev1 * 100, 1)}\\,\\%$ des animaux sont des animaux vaccinés qui contractent la maladie et que parmi les animaux non vaccinés, $${texNombre(Pev2sachantev1b * 100, 1)}\\,\\%$ contractent la maladie.<br>
Enfin, ils estiment que $${texNombre(Pev2 * 100, 1)}\\,\\%$ des animaux contractent la maladie.<br>`

          intro =
            'Face à la menace d’une épidémie frappant les troupeaux de bovins, les services sanitaires décident d’organiser une vaccination de masse.<br>'

          texte1 = ` On note : <br>
                    $\\bullet$ $${ev[0]}$ : «${sp()} l’animal a été vacciné${sp()}» ;<br>
                    $\\bullet$ $${ev[1]}$ : «${sp()} l’animal a contracté la maladie${sp()}».<br>
                    On choisit  au hasard un animal et on note P la probabilité associée à cette expérience aléatoire.<br> `
          break
      }
      texte = intro
      texte += liste
      texte += texte1
      const choix = this.sup === 3 ? randint(1, 2) : this.sup
      if (choix === 1) {
        calc1 = this.interactif
          ? ajouteChampTexteMathLive(
              this,
              3 * i,
              KeyboardType.clavierProbabilite,
              { texteApres: `$=${texNombre(Pev2sachantev1, 2)}$` },
            )
          : `$\\ldots =${texNombre(Pev2sachantev1, 3)}$`
        calc2 = this.interactif
          ? ajouteChampTexteMathLive(
              this,
              3 * i + 1,
              KeyboardType.clavierProbabilite,
              { texteApres: `$=${texNombre(Pev2, 3)}$` },
            )
          : `$\\ldots =${texNombre(Pev2, 3)}$`
        calc3 = this.interactif
          ? ajouteChampTexteMathLive(
              this,
              3 * i + 2,
              KeyboardType.clavierProbabilite,
              { texteApres: `$=${texNombre(Pev2sachantev1b, 2)}$` },
            )
          : `$\\ldots =${texNombre(Pev2sachantev1b, 3)}$`
        calc1C = `Dans l'énoncé, $${texNombre(Pev2sachantev1, 3)}$ correspond à une probabilité conditionnelle :  $${miseEnEvidence(`P_{${ev[0]}}({${ev[1]}})`)}=${texNombre(Pev2sachantev1, 3)}$.<br>`
        calc2C = `$${miseEnEvidence(`P(${ev[1]})`)} =${texNombre(Pev2, 3)}$<br>`
        calc3C = `Dans l'énoncé, $${texNombre(Pev2sachantev1b, 3)}$ correspond à une probabilité conditionnelle : $${miseEnEvidence(`P_{\\overline{${ev[0]}}}({ ${ev[1]}})`)}=${texNombre(Pev2sachantev1b, 3)}$`
        calc4 = this.interactif
          ? ajouteChampTexteMathLive(
              this,
              3 * i,
              KeyboardType.clavierProbabilite,
              { texteApres: `$=${texNombre(Pev1bsachantev2, 3)}$` },
            )
          : `$\\ldots =${texNombre(Pev1bsachantev2, 3)}$`
        calc5 = this.interactif
          ? ajouteChampTexteMathLive(
              this,
              3 * i + 1,
              KeyboardType.clavierProbabilite,
              { texteApres: `$=${texNombre(Pev1 * Pev2sachantev1, 3)}$` },
            )
          : `$\\ldots =${texNombre(Pev1 * Pev2sachantev1, 3)}$`
        calc6 = this.interactif
          ? ajouteChampTexteMathLive(
              this,
              3 * i + 2,
              KeyboardType.clavierProbabilite,
              { texteApres: `$=${texNombre(Pev1, 3)}$` },
            )
          : `$\\ldots =${texNombre(Pev1, 3)}$`
        calc4C = `Dans l'énoncé, $${texNombre(Pev1bsachantev2, 3)}$ correspond à une probabilité conditionnelle : $${miseEnEvidence(`P_{${ev[1]}}(\\overline{${ev[0]}})`)}=${texNombre(Pev1bsachantev2, 3)}$.<br>`
        calc5C = `Dans l'énoncé, $${texNombre(Pev1 * Pev2sachantev1, 3)}$ correspond à la probabilité d'une intersection : $${miseEnEvidence(`P(${ev[0]}\\cap ${ev[1]})`)} =${texNombre(Pev1 * Pev2sachantev1, 3)}$.<br>`
        calc6C = `$${miseEnEvidence(`P( ${ev[0]})`)}=${texNombre(Pev1, 3)}$`

        texte +=
          "  En utilisant les données de l'énoncé, écrire avec la notation de probabilité qui convient :<br>"
        if (choice([true, false])) {
          texte += ` ${calc1}${sp(10)}${calc2}${sp(10)}${calc3}`
          handleAnswers(this, 3 * i, {
            reponse: {
              value: [`P_{${ev[0]}}({${ev[1]}})`, `P_{${ev[0]}}(${ev[1]})`],
              options: { texteAvecCasse: true },
            },
          })
          handleAnswers(this, 3 * i + 1, {
            reponse: {
              value: [`P(${ev[1]})`],
              options: { texteAvecCasse: true },
            },
          })
          handleAnswers(this, 3 * i + 2, {
            reponse: {
              value: [
                `P_{\\overline{${ev[0]}}}({${ev[1]}})`,
                `P_{\\overline{${ev[0]}}}({ ${ev[1]}})`,
                `P_{\\overline{${ev[0]}}}(${ev[1]})`,
                `P_{\\overline{${ev[0]}}}( ${ev[1]})`,
              ],
              options: { texteAvecCasse: true },
            },
          })
          texteCorr = ` ${calc1C}${calc2C}${calc3C}`
        } else {
          texte += ` ${calc4}${sp(10)}${calc5}${sp(10)}${calc6}`
          handleAnswers(this, 3 * i, {
            reponse: {
              value: [
                `P_{${ev[1]}}(\\overline{${ev[0]}})`,
                `P_{${ev[1]}}({\\overline{${ev[0]}}})`,
              ],
              options: { texteAvecCasse: true },
            },
          })
          handleAnswers(this, 3 * i + 1, {
            reponse: {
              value: [
                `P({${ev[0]}}\\cap {${ev[1]}})`,
                `P({${ev[1]}}\\cap {${ev[0]}})`,
                `P(${ev[0]}\\cap ${ev[1]})`,
              ],
              options: { texteAvecCasse: true },
            },
          })
          handleAnswers(this, 3 * i + 2, {
            reponse: {
              value: [`P(${ev[0]})`],
              options: { texteAvecCasse: true },
            },
          })
          texteCorr = ` ${calc4C}${calc5C}${calc6C}`
        }
      } else {
        calc1 = this.interactif
          ? ajouteChampTexteMathLive(this, 3 * i, KeyboardType.clavierDeBase, {
              texteAvant: `$P_{${ev[0]}}({${ev[1]}})=$`,
            })
          : `$P_{${ev[0]}}({${ev[1]}})=\\ldots$`
        calc2 = this.interactif
          ? ajouteChampTexteMathLive(
              this,
              3 * i + 1,
              KeyboardType.clavierDeBase,
              { texteAvant: `$P(${ev[1]})=$` },
            )
          : `$P(${ev[1]})=\\ldots$`
        calc3 = this.interactif
          ? ajouteChampTexteMathLive(
              this,
              3 * i + 2,
              KeyboardType.clavierDeBase,
              { texteAvant: `$P_{\\overline{${ev[0]}}}({${ev[1]}})=$` },
            )
          : `$P_{\\overline{${ev[0]}}}({${ev[1]}})=\\ldots$`
        calc1C = `$P_{${ev[0]}}({${ev[1]}})=${miseEnEvidence(`${texNombre(Pev2sachantev1, 3)}`)}$`
        calc2C = `$P(${ev[1]})= ${miseEnEvidence(`${texNombre(Pev2, 3)}`)}$`
        calc3C = `$P_{\\overline{${ev[0]}}}({${ev[1]}})=${miseEnEvidence(`${texNombre(Pev2sachantev1b, 3)}`)}$`

        calc4 = this.interactif
          ? ajouteChampTexteMathLive(
              this,
              3 * i,
              KeyboardType.clavierProbabilite,
              { texteAvant: `$P_{${ev[1]}}( \\overline{${ev[0]}})=$` },
            )
          : `$P_{${ev[1]}}( \\overline{${ev[0]}})=\\ldots$`
        calc5 = this.interactif
          ? ajouteChampTexteMathLive(
              this,
              3 * i + 1,
              KeyboardType.clavierProbabilite,
              { texteAvant: `$P({${ev[0]}}\\cap {${ev[1]}})=$` },
            )
          : `$P({${ev[0]}}\\cap {${ev[1]}})=\\ldots$`
        calc6 = this.interactif
          ? ajouteChampTexteMathLive(
              this,
              3 * i + 2,
              KeyboardType.clavierProbabilite,
              { texteAvant: `$P( ${ev[0]})=$` },
            )
          : `$P( ${ev[0]})=\\ldots$`
        calc4C = `$P_{${ev[1]}}( \\overline{${ev[0]}})=${miseEnEvidence(`${texNombre(Pev1bsachantev2, 3)}`)}$`
        calc5C = ` $P({${ev[0]}}\\cap {${ev[1]}})= ${miseEnEvidence(`${texNombre(Pev1 * Pev2sachantev1, 3)}`)}$`
        calc6C = `$P( ${ev[0]})=${miseEnEvidence(`${texNombre(Pev1, 3)}`)}$`

        texte += " En utilisant les données de l'énoncé, compléter :<br>"

        if (choice([true, false])) {
          texte += ` ${calc1}${sp(10)}${calc2}${sp(10)}${calc3}`
          handleAnswers(this, 3 * i, {
            reponse: {
              value: texNombre(Pev2sachantev1, 3),
              options: { texteAvecCasse: true },
            },
          })
          handleAnswers(this, 3 * i + 1, {
            reponse: {
              value: texNombre(Pev2, 3),
              options: { texteAvecCasse: true },
            },
          })
          handleAnswers(this, 3 * i + 2, {
            reponse: {
              value: texNombre(Pev2sachantev1b, 3),
              options: { texteAvecCasse: true },
            },
          })
          texteCorr = ` ${calc1C}${sp(10)}${calc2C}${sp(10)}${calc3C}`
        } else {
          texte += ` ${calc4}${sp(10)}${calc5}${sp(10)}${calc6}`
          handleAnswers(this, 3 * i, {
            reponse: {
              value: texNombre(Pev1bsachantev2, 3),
              options: { texteAvecCasse: true },
            },
          })
          handleAnswers(this, 3 * i + 1, {
            reponse: {
              value: texNombre(Pev1 * Pev2sachantev1, 3),
              options: { texteAvecCasse: true },
            },
          })
          handleAnswers(this, 3 * i + 2, {
            reponse: {
              value: texNombre(Pev1, 3),
              options: { texteAvecCasse: true },
            },
          })
          texteCorr = `${calc4C}${sp(10)}${calc5C}${sp(10)}${calc6C}`
        }
      }

      if (this.questionJamaisPosee(i, val1, val2, val3)) {
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
