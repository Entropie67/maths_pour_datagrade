import { amcConvert } from '../../lib/amc/amcBuilders'
import { ensureAmcParam } from '../../lib/amc/amcHelpers'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import {
  ajouteChampTexteMathLive,
  remplisLesBlancs,
} from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { texFractionFromString } from '../../lib/outils/deprecatedFractions'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  arrondi,
  nombreDeChiffresDansLaPartieDecimale,
  nombreDeChiffresDansLaPartieEntiere,
} from '../../lib/outils/nombres'
import { sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const amcReady = true
export const amcType = 'AMCNum'
export const interactifReady = true

export const titre = 'Multiplier un nombre décimal par $10$, $100$ ou $1\\,000$'
export const dateDeModifImportante = '11/02/2025'

/**
 * Multiplication d'un nombre décimal dans différentes écritures par 10, 100, 1000
 *
 *  * Type 1 : écriture entière
 *  * Type 3 : écriture décimale
 *  * Type 3 : écriture fractionnaire
 *  * Type 4 : écritures fractionnaires, décimales ou entières
 *
 *  * Sup2 : avec ou sans calculs à trous
 * @author Rémi Angot (Ajout 3 décimales maxi et que des entiers par Éric Elter)
 * Relecture : Décembre 2021 par EE
 *
 */
export const uuid = '2471d'

export const refs = {
  'fr-fr': [],
  'fr-2016': ['6C30-1'],
  'fr-ch': [''], // Primaire anciennement :['9NO1-10', '10NO5-1'],
}
export default class MultiplierDecimauxPar101001000 extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Type des résultats',
      [
        'Nombres séparés par des tirets  :',
        '1 : Entiers',
        '2 : Décimaux',
        '3 : Fractionnaires',
        '4 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire2CaseACocher = ['Avec des calculs à trous']
    this.besoinFormulaire3CaseACocher = ['Trois décimales maximum', true]
    this.sup = '4'
    this.sup2 = false
    this.sup3 = true
    this.spacing = 2
    this.spacingCorr = 2
    this.nbQuestions = 8
    this.comment =
      'Le premier paramètre permet de choisir si le résultat de chaque calcul est un nombre entier, un nombre décimal, une fraction ou un mélange des trois.<br><br>'
    this.comment +=
      'Le deuxième paramètre permet de trouver soit le résultat du calcul, soit un nombre dans le calcul.<br><br>'
    this.comment +=
      "Le troisième paramètre permet d'imposer, ou non, 3 décimales maximum dans le résultat du calcul."
  }

  nouvelleVersion() {
    const typesDeResultatsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: 3,
    })
    const typesDeResultats = combinaisonListes(
      typesDeResultatsDisponibles,
      this.nbQuestions,
    )

    let tableau1 = !this.sup2 ? [1, 2] : [1, 2, 5, 6]
    let tableau3 = !this.sup2 ? [3, 4] : [3, 4, 7, 8, 9, 10]
    tableau1 = combinaisonListes(tableau1, this.nbQuestions)
    tableau3 = combinaisonListes(tableau3, this.nbQuestions)
    let indexTableau1 = 0
    let indexTableau3 = 0
    const typesDeQuestionsDisponibles = []

    for (let i = 0; i < typesDeResultats.length; i++) {
      const resultat = typesDeResultats[i]
      switch (resultat) {
        case 1:
        case 2:
          typesDeQuestionsDisponibles.push(tableau1[indexTableau1])
          indexTableau1++
          break
        default:
          typesDeQuestionsDisponibles.push(tableau3[indexTableau3])
          indexTableau3++
          break
      }
    }
    this.consigne = "Calculer et donner le résultat sous forme d'un nombre "
    this.consigne +=
      this.sup === '1'
        ? 'entier.'
        : this.sup === '2'
          ? 'décimal.'
          : this.sup === '3'
            ? 'fractionnaire.'
            : ''
    if (this.sup2 || this.sup.length !== 1) this.consigne = 'Compléter.'

    let typesDeQuestions
    let reponse

    const listeTypeDeQuestions = typesDeQuestionsDisponibles
    const facteurs = combinaisonListes([10, 100, 1000], this.nbQuestions)
    const puissances = combinaisonListes([1, 2, 3], this.nbQuestions)

    for (
      let i = 0,
        texte,
        texteCorr,
        cpt = 0,
        a,
        b,
        den,
        choixPuissance10,
        fractionSolution,
        aEntier,
        reponseAMC;
      i < this.nbQuestions && cpt < 50;
    ) {
      typesDeQuestions = listeTypeDeQuestions[i]
      if (this.sup === '3' && !this.sup2) {
        if ([1, 2, 5, 6].includes(typesDeQuestions))
          texte =
            "Calculer et donner le résultat sous forme d'un nombre décimal.<br>"
        else
          texte =
            "Calculer et donner le résultat sous forme d'un nombre fractionnaire.<br>"
      } else texte = ''
      switch (typesDeQuestions) {
        case 1: // a,abcd × 10
          aEntier = choice([
            randint(1, 9) * 10 + randint(1, 9),
            randint(10, 99) * 10 + randint(1, 9),
          ])
          b = puissances[i]
          choixPuissance10 = Math.pow(10, randint(0, b))

          if (typesDeResultats[i] !== 1) {
            if (this.sup3) {
              choixPuissance10 = randint(b, 3)
              if (choixPuissance10 === b) {
                if (b === 3) b--
                else choixPuissance10++
              }
              choixPuissance10 = Math.pow(10, choixPuissance10)
            } else {
              choixPuissance10 = Math.pow(10, randint(b + 1, 4))
            }
          }
          fractionSolution = new FractionEtendue(
            aEntier,
            choixPuissance10 / Math.pow(10, b),
          ).texFraction
          a = arrondi(aEntier / choixPuissance10)

          texte = `$${texNombre(a)}\\times${texNombre(Math.pow(10, b))}=$`

          if (this.interactif)
            texte = ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBaseAvecFraction,
              { texteAvant: texte },
            )
          else texte += sp() + '$ \\ldots$'
          texteCorr = `$${texNombre(a)} \\times ${texNombre(
            Math.pow(10, b),
          )} = ${miseEnEvidence(typesDeResultats[i] !== 3 ? texNombre(a * Math.pow(10, b)) : fractionSolution)}$`
          reponse = new FractionEtendue(
            aEntier * Math.pow(10, b),
            choixPuissance10,
          ).texFraction
          reponseAMC = a * Math.pow(10, b)
          // Important laisser ici les deux options de comparaison
          handleAnswers(this, i, {
            reponse: {
              value: reponse,
              options: { fractionEgale: true, nombreDecimalSeulement: true },
            },
          })

          break
        case 2: // 10 × a,abcd
          aEntier = choice([
            randint(1, 9) * 10 + randint(1, 9),
            randint(10, 99) * 10 + randint(1, 9),
          ])
          b = puissances[i]
          choixPuissance10 = Math.pow(10, randint(0, b))

          if (typesDeResultats[i] !== 1) {
            if (this.sup3) {
              choixPuissance10 = randint(b, 3)
              if (choixPuissance10 === b) {
                if (b === 3) b--
                else choixPuissance10++
              }
              choixPuissance10 = Math.pow(10, choixPuissance10)
            } else {
              choixPuissance10 = Math.pow(10, randint(b + 1, 4))
            }
          }
          fractionSolution = new FractionEtendue(
            aEntier,
            choixPuissance10 / Math.pow(10, b),
          ).texFraction
          a = arrondi(aEntier / choixPuissance10)

          texteCorr = `$${texNombre(b)} \\times ${texNombre(
            a,
          )} = ${miseEnEvidence(texNombre(a * b))}$`

          texte = `$${texNombre(Math.pow(10, b))}\\times${texNombre(a)}=$`

          if (this.interactif)
            texte = ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBaseAvecFraction,
              { texteAvant: texte },
            )
          else texte += sp() + '$ \\ldots$'
          texteCorr = `$${texNombre(
            Math.pow(10, b),
          )} \\times ${texNombre(a)} = ${miseEnEvidence(typesDeResultats[i] !== 3 ? texNombre(a * Math.pow(10, b)) : fractionSolution)}$`
          reponse = new FractionEtendue(
            aEntier * Math.pow(10, b),
            choixPuissance10,
          ).texFraction
          reponseAMC = a * Math.pow(10, b)
          handleAnswers(this, i, {
            reponse: {
              value: reponse,
              options: { fractionEgale: true, nombreDecimalSeulement: true },
            },
          })

          break
        case 3: // abcd/10 × 10
          a = choice([
            randint(1, 9) * 10 + randint(1, 9),
            randint(10, 99) * 10 + randint(1, 9),
          ])
          b = puissances[i]
          choixPuissance10 = Math.pow(10, randint(0, b))

          if (typesDeResultats[i] !== 1) {
            if (this.sup3) {
              choixPuissance10 = randint(b, 3)
              if (choixPuissance10 === b) {
                if (b === 3) b--
                else choixPuissance10++
              }
              choixPuissance10 = Math.pow(10, choixPuissance10)
            } else {
              choixPuissance10 = Math.pow(10, randint(b + 1, 4))
            }
          }
          fractionSolution = new FractionEtendue(
            a * Math.pow(10, b),
            choixPuissance10,
          ).texFraction

          texte = `$${new FractionEtendue(a, choixPuissance10).texFraction}\\times${texNombre(Math.pow(10, b))}=$`

          if (this.interactif)
            texte = ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBaseAvecFraction,
              { texteAvant: texte },
            )
          else texte += sp() + '$ \\ldots$'

          texteCorr = `$${new FractionEtendue(a, choixPuissance10).texFraction}\\times${texNombre(Math.pow(10, b))}
          = ${typesDeResultats[i] !== 3 ? (choixPuissance10 !== 1 ? new FractionEtendue(a * Math.pow(10, b), choixPuissance10).texFraction : '') + ' = ' + miseEnEvidence(texNombre((a * Math.pow(10, b)) / choixPuissance10)) : miseEnEvidence(fractionSolution)}$`
          reponse = fractionSolution
          reponseAMC = (a * Math.pow(10, b)) / choixPuissance10

          handleAnswers(this, i, {
            reponse: {
              value: reponse,
              options: { fractionEgale: true, nombreDecimalSeulement: true },
            },
          })

          break
        case 4: // 10 × abcd/10
          a = choice([
            randint(1, 9) * 10 + randint(1, 9),
            randint(10, 99) * 10 + randint(1, 9),
          ])
          b = puissances[i]
          choixPuissance10 = Math.pow(10, randint(0, b))

          if (typesDeResultats[i] !== 1) {
            if (this.sup3) {
              choixPuissance10 = randint(b, 3)
              if (choixPuissance10 === b) {
                if (b === 3) b--
                else choixPuissance10++
              }
              choixPuissance10 = Math.pow(10, choixPuissance10)
            } else {
              choixPuissance10 = Math.pow(10, randint(b + 1, 4))
            }
          }
          fractionSolution = new FractionEtendue(
            a * Math.pow(10, b),
            choixPuissance10,
          ).texFraction

          texte = `$${texNombre(Math.pow(10, b))}\\times${new FractionEtendue(a, choixPuissance10).texFraction}=$`

          if (this.interactif)
            texte = ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBaseAvecFraction,
              { texteAvant: texte },
            )
          else texte += sp() + '$ \\ldots$'

          texteCorr = `$${texNombre(Math.pow(10, b))} \\times ${new FractionEtendue(a, choixPuissance10).texFraction}
          = ${typesDeResultats[i] !== 3 ? (choixPuissance10 !== 1 ? new FractionEtendue(a * Math.pow(10, b), choixPuissance10).texFraction : '') + ' = ' + miseEnEvidence(texNombre((a * Math.pow(10, b)) / choixPuissance10)) : miseEnEvidence(fractionSolution)}$`
          reponse = fractionSolution
          reponseAMC = (a * Math.pow(10, b)) / choixPuissance10

          handleAnswers(this, i, {
            reponse: {
              value: reponse,
              options: { fractionEgale: true, nombreDecimalSeulement: true },
            },
          })

          break
        case 5: // .... × 10 = a,abcd
          aEntier = choice([
            randint(1, 9) * 10 + randint(1, 9),
            randint(10, 99) * 10 + randint(1, 9),
          ])
          b = puissances[i]
          choixPuissance10 = Math.pow(10, randint(0, b))

          if (typesDeResultats[i] !== 1) {
            if (this.sup3) {
              choixPuissance10 = randint(b, 3)
              if (choixPuissance10 === b) {
                if (b === 3) b--
                else choixPuissance10++
              }
              choixPuissance10 = Math.pow(10, choixPuissance10)
            } else {
              choixPuissance10 = Math.pow(10, randint(b + 1, 4))
            }
          }
          fractionSolution = new FractionEtendue(
            aEntier * Math.pow(10, b),
            choixPuissance10,
          ).texFraction
          a = arrondi(aEntier / choixPuissance10)

          texte += `$\\times${texNombre(Math.pow(10, b))} = ${typesDeResultats[i] !== 3 ? texNombre(a * Math.pow(10, b)) : fractionSolution}$`
          if (this.interactif)
            texte = ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBaseAvecFraction,
              { texteApres: texte },
            )
          else texte = '$\\ldots$' + texte
          texteCorr = `$${miseEnEvidence(
            texNombre(a),
          )} \\times ${texNombre(Math.pow(10, b))} = ${typesDeResultats[i] !== 3 ? texNombre(a * Math.pow(10, b)) : fractionSolution}$`
          reponse = new FractionEtendue(aEntier, choixPuissance10).texFraction
          reponseAMC = (a * Math.pow(10, b)) / choixPuissance10

          handleAnswers(this, i, {
            reponse: {
              value: reponse,
              options: { fractionEgale: true, nombreDecimalSeulement: true },
            },
          })
          break
        case 6: // 10 × .... = a,abcd
          aEntier = choice([
            randint(1, 9) * 10 + randint(1, 9),
            randint(10, 99) * 10 + randint(1, 9),
          ])
          b = puissances[i]
          choixPuissance10 = Math.pow(10, randint(0, b))

          if (typesDeResultats[i] !== 1) {
            if (this.sup3) {
              choixPuissance10 = randint(b, 3)
              if (choixPuissance10 === b) {
                if (b === 3) b--
                else choixPuissance10++
              }
              choixPuissance10 = Math.pow(10, choixPuissance10)
            } else {
              choixPuissance10 = Math.pow(10, randint(b + 1, 4))
            }
          }
          fractionSolution = new FractionEtendue(
            aEntier,
            choixPuissance10 / Math.pow(10, b),
          ).texFraction
          a = arrondi(aEntier / choixPuissance10)

          reponse = a

          texte = `$=${typesDeResultats[i] !== 3 ? texNombre(a * Math.pow(10, b)) : fractionSolution}$`
          if (this.interactif)
            texte = ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBaseAvecFraction,
              {
                texteAvant: `$${texNombre(Math.pow(10, b))} \\times$`,
                texteApres: texte,
              },
            )
          else texte = `$${texNombre(Math.pow(10, b))} \\times \\ldots$` + texte
          texteCorr = `$${texNombre(Math.pow(10, b))} \\times ${miseEnEvidence(
            texNombre(a),
          )}  = ${typesDeResultats[i] !== 3 ? texNombre(a * Math.pow(10, b)) : fractionSolution}$`
          reponse = new FractionEtendue(aEntier, choixPuissance10).texFraction
          reponseAMC = (a * Math.pow(10, b)) / choixPuissance10

          handleAnswers(this, i, {
            reponse: {
              value: reponse,
              options: { fractionEgale: true, nombreDecimalSeulement: true },
            },
          })
          break
        case 7: // case 3 avec un trou sur l'entier
          a = choice([
            randint(1, 9) * 10 + randint(1, 9),
            randint(10, 99) * 10 + randint(1, 9),
          ])
          b = puissances[i]
          choixPuissance10 = Math.pow(10, randint(0, b))

          if (typesDeResultats[i] !== 1) {
            if (this.sup3) {
              choixPuissance10 = randint(b, 3)
              if (choixPuissance10 === b) {
                if (b === 3) b--
                else choixPuissance10++
              }
              choixPuissance10 = Math.pow(10, choixPuissance10)
            } else {
              choixPuissance10 = Math.pow(10, randint(b + 1, 4))
            }
          }
          fractionSolution = new FractionEtendue(
            a * Math.pow(10, b),
            choixPuissance10,
          ).texFraction

          texte = `$=${typesDeResultats[i] !== 3 ? texNombre((a * Math.pow(10, b)) / choixPuissance10) : fractionSolution}$`

          if (this.interactif)
            texte = ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBaseAvecFraction,
              {
                texteAvant: `$${new FractionEtendue(a, choixPuissance10).texFraction}\\times$`,
                texteApres: texte,
              },
            )
          else
            texte =
              `$${new FractionEtendue(a, choixPuissance10).texFraction}\\times$` +
              sp() +
              '$ \\ldots$' +
              sp() +
              texte

          texteCorr = `$${new FractionEtendue(a, choixPuissance10).texFraction}\\times${miseEnEvidence(texNombre(Math.pow(10, b)))}
          = ${typesDeResultats[i] !== 3 ? (choixPuissance10 !== 1 ? new FractionEtendue(a * Math.pow(10, b), choixPuissance10).texFraction : '') + ' = ' + texNombre((a * Math.pow(10, b)) / choixPuissance10) : fractionSolution}$`
          reponse = Math.pow(10, b)
          reponseAMC = Math.pow(10, b)

          handleAnswers(this, i, { reponse: { value: reponse } })

          break
        case 8: // case 4 avec un trou sur l'entier
          a = choice([
            randint(1, 9) * 10 + randint(1, 9),
            randint(10, 99) * 10 + randint(1, 9),
          ])
          b = puissances[i]
          choixPuissance10 = Math.pow(10, randint(0, b))

          if (typesDeResultats[i] !== 1) {
            if (this.sup3) {
              choixPuissance10 = randint(b, 3)
              if (choixPuissance10 === b) {
                if (b === 3) b--
                else choixPuissance10++
              }
              choixPuissance10 = Math.pow(10, choixPuissance10)
            } else {
              choixPuissance10 = Math.pow(10, randint(b + 1, 4))
            }
          }
          fractionSolution = new FractionEtendue(
            a * Math.pow(10, b),
            choixPuissance10,
          ).texFraction

          texte = `$\\times ${new FractionEtendue(a, choixPuissance10).texFraction}=${typesDeResultats[i] !== 3 ? texNombre((a * Math.pow(10, b)) / choixPuissance10) : fractionSolution}$`

          if (this.interactif)
            texte = ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBaseAvecFraction,
              {
                texteAvant: `$${new FractionEtendue(a, choixPuissance10).texFraction}\\times$`,
                texteApres: texte,
              },
            )
          else texte = '$ \\ldots$' + sp() + texte

          texteCorr = `$${miseEnEvidence(texNombre(Math.pow(10, b)))}\\times${new FractionEtendue(a, choixPuissance10).texFraction}
          = ${typesDeResultats[i] !== 3 ? (choixPuissance10 !== 1 ? new FractionEtendue(a * Math.pow(10, b), choixPuissance10).texFraction + ' = ' : '') + texNombre((a * Math.pow(10, b)) / choixPuissance10) : fractionSolution}$`
          reponse = Math.pow(10, b)
          reponseAMC = Math.pow(10, b)

          handleAnswers(this, i, { reponse: { value: reponse } })

          break
        case 9: // case 3 avec trou sur la fraction
          a = choice([randint(11, 99), randint(100, 999), randint(2, 9)])
          b = facteurs[i]
          if (this.sup4) {
            den = choice([10, 100, 1000])
            while (den > b) {
              den = choice([10, 100, 1000])
            }
          } else {
            den = choice([10, 100, 1000])
          }
          texte += `$${texFractionFromString(a, '\\ldots')}\\times${texNombre(
            b,
          )} = ${texNombre((a / den) * b)}$`
          texteCorr = `$${texFractionFromString(
            a,
            miseEnEvidence(texNombre(den)),
          )} \\times ${texNombre(b)} = ${texFractionFromString(
            a * b,
            den,
          )} = ${texNombre((a / den) * b)}$`
          reponse = den
          //
          a = choice([
            randint(1, 9) * 10 + randint(1, 9),
            randint(10, 99) * 10 + randint(1, 9),
          ])
          b = puissances[i]
          choixPuissance10 = Math.pow(10, randint(0, b))

          if (typesDeResultats[i] !== 1) {
            if (this.sup3) {
              choixPuissance10 = randint(b, 3)
              if (choixPuissance10 === b) {
                if (b === 3) b--
                else choixPuissance10++
              }
              choixPuissance10 = Math.pow(10, choixPuissance10)
            } else {
              choixPuissance10 = Math.pow(10, randint(b + 1, 4))
            }
          }
          fractionSolution = new FractionEtendue(
            a * Math.pow(10, b),
            choixPuissance10,
          ).texFraction

          texte = remplisLesBlancs(
            this,
            i,
            `\\dfrac{${a}}{%{champ1}}\\times ${texNombre(Math.pow(10, b))}= ${typesDeResultats[i] !== 3 ? texNombre((a * Math.pow(10, b)) / choixPuissance10) : fractionSolution}`,
            KeyboardType.clavierNumbers,
            '\\ldots\\ldots',
          )

          texteCorr = `$${texFractionFromString(a, miseEnEvidence(texNombre(choixPuissance10)))}\\times${texNombre(Math.pow(10, b))}
          = ${typesDeResultats[i] !== 3 ? (choixPuissance10 !== 1 ? new FractionEtendue(a * Math.pow(10, b), choixPuissance10).texFraction : '') + ' = ' + texNombre((a * Math.pow(10, b)) / choixPuissance10) : fractionSolution}$`
          reponse = choixPuissance10
          reponseAMC = reponse

          handleAnswers(this, i, { champ1: { value: reponse } })

          break
        default: // case 4 avec trou sur la fraction
          a = choice([
            randint(1, 9) * 10 + randint(1, 9),
            randint(10, 99) * 10 + randint(1, 9),
          ])
          b = puissances[i]
          choixPuissance10 = Math.pow(10, randint(0, b))

          if (typesDeResultats[i] !== 1) {
            if (this.sup3) {
              choixPuissance10 = randint(b, 3)
              if (choixPuissance10 === b) {
                if (b === 3) b--
                else choixPuissance10++
              }
              choixPuissance10 = Math.pow(10, choixPuissance10)
            } else {
              choixPuissance10 = Math.pow(10, randint(b + 1, 4))
            }
          }
          fractionSolution = new FractionEtendue(
            a * Math.pow(10, b),
            choixPuissance10,
          ).texFraction

          texte = remplisLesBlancs(
            this,
            i,
            `${texNombre(Math.pow(10, b))} \\times \\dfrac{${a}}{%{champ1}} = ${typesDeResultats[i] !== 3 ? texNombre((a * Math.pow(10, b)) / choixPuissance10) : fractionSolution}`,
            KeyboardType.clavierNumbers,
            '\\ldots\\ldots',
          )

          texteCorr = `$${texFractionFromString(a, miseEnEvidence(texNombre(choixPuissance10)))} \\times ${texNombre(Math.pow(10, b))}
          = ${typesDeResultats[i] !== 3 ? (choixPuissance10 !== 1 ? new FractionEtendue(a * Math.pow(10, b), choixPuissance10).texFraction + ' = ' : '') + texNombre((a * Math.pow(10, b)) / choixPuissance10) : fractionSolution}$`
          reponse = choixPuissance10
          reponseAMC = reponse

          handleAnswers(this, i, { champ1: { value: reponse } })
          break
      }

      if (context.isAmc) {
        this.autoCorrectionAMC[i].enonce = texte
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        this.autoCorrectionAMC[i].propositions = [{ texte: texteCorr }]
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        ensureAmcParam(this, i)
        this.autoCorrectionAMC[i].reponse!.param = {
          digits:
            nombreDeChiffresDansLaPartieEntiere(reponseAMC) +
            nombreDeChiffresDansLaPartieDecimale(reponseAMC) +
            2,
          decimals: nombreDeChiffresDansLaPartieDecimale(reponseAMC) + 1,
          signe: false,
          exposantNbChiffres: 0,
        }
      }
      if (this.questionJamaisPosee(i, a, b)) {
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
