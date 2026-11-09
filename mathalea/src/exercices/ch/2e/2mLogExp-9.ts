import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import {
    ajouteChampTexteMathLive,
    remplisLesBlancs,
} from '../../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { estPuissanceDe } from '../../../lib/outils/puissance'
import { texNombre } from '../../../lib/outils/texNombre'
import FractionEtendue from '../../../modules/FractionEtendue'
import {
    gestionnaireFormulaireTexte,
    listeQuestionsToContenu,
    randint,
} from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = 'Effectuer un changement de base des logarithmes'
export const dateDePublication = '12/02/2026'
export const interactifReady = true

export const uuid = '2l9cb'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['2mLogExp-9'],
}

/**
 * Changement de base des logarithmes
 * @author Nathan Scheinmann
 */
export default class ChangementBaseLogarithmes extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : Calcul direct (log_a(b))',
        '2 : Compléter la formule',
        '3 : Écrire avec log/ln (numérateur et dénominateur)',
        '4 : Écrire avec log/ln (numérateur seul)',
        '5 : Écrire avec log/ln (dénominateur seul)',
        '6 : Calculer avec la formule',
        '7 : Compléter la formule (2 blancs)',
        '8 : Compléter la formule (1 blanc)',
        '9 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire2CaseACocher = ['Logarithme népérien (ln)', false]
    this.sup = '9'
    this.sup2 = false
  }

  nouvelleVersion() {
    const logString = this.sup2 ? '\\ln' : '\\log'
    const logNom = this.sup2
      ? 'logarithme népérien $\\ln$'
      : 'logarithme décimal $\\log$'

    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 8,
      melange: 9,
      defaut: 9,
      listeOfCase: [
        'direct',
        'formule',
        'ecrireComplet',
        'ecrireNumerateur',
        'ecrireDenominateur',
        'calculer',
        'completer2blancs',
        'completer1blanc',
      ],
      nbQuestions: this.nbQuestions,
      shuffle: true,
    })

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let cleUnique = ''

      const typeQuestion = listeTypeDeQuestions[i]

      if (typeQuestion === 'direct') {
        // Type 1 : Calcul direct log_a(b)
        const variante = choice(['simple', 'puissance', 'racine', 'inverse'])

        if (variante === 'simple') {
          const base = randint(2, 9)
          let arg: number
          do {
            arg = randint(2, 100)
          } while (estPuissanceDe(arg, base) || arg === base)

          cleUnique = `direct-simple-${base}-${arg}`

          const resultat = new Decimal(arg).ln().div(new Decimal(base).ln())
          const resultatArrondi = resultat.toDecimalPlaces(3)

          texte = `Calculer $\\log_{${base}}(${arg})$ à l'aide de la formule de changement de base.`
          texte += ` Arrondir au millième près.`

          texteCorr = `Par la formule de changement de base : $\\log_a(b) = \\dfrac{${logString}(b)}{${logString}(a)}$<br><br>`
          texteCorr += `$\\begin{aligned}\n`
          texteCorr += `\\log_{${base}}(${arg}) &= \\dfrac{${logString}(${arg})}{${logString}(${base})}\\\\\n`
          texteCorr += `&\\approx ${miseEnEvidence(texNombre(resultatArrondi, 3, true))}\n`
          texteCorr += `\\end{aligned}$`

          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBase,
              { texteAvant: '<br>Réponse : ' },
            )
            handleAnswers(this, i, {
              reponse: {
                value: resultatArrondi.toFixed(3),
                options: { nombreDecimalSeulement: true },
              },
            })
          }
        } else if (variante === 'puissance') {
          const base = choice([2, 3, 5])
          const exp = randint(2, 4)
          const arg = base ** exp

          cleUnique = `direct-puissance-${base}-${exp}`

          texte = `Calculer $\\log_{${base}}(${arg})$.`

          texteCorr = `On reconnaît que $${arg} = ${base}^{${exp}}$.<br><br>`
          texteCorr += `Donc $\\log_{${base}}(${arg}) = \\log_{${base}}(${base}^{${exp}}) = ${miseEnEvidence(exp.toString())}$.`

          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBase,
              { texteAvant: '<br>Réponse : ' },
            )
            handleAnswers(this, i, {
              reponse: {
                value: `${exp}`,
                options: { nombreDecimalSeulement: true },
              },
            })
          }
        } else if (variante === 'racine') {
          const baseSimple = choice([2, 3, 5])
          const den = choice([2, 3, 4])
          const puissanceBase = baseSimple ** den

          cleUnique = `direct-racine-${baseSimple}-${den}`

          texte = `Calculer $\\log_{${puissanceBase}}(${baseSimple})$.`

          const frac = new FractionEtendue(1, den)

          texteCorr = `On reconnaît que $${baseSimple} = ${puissanceBase}^{1/${den}}$.<br><br>`
          texteCorr += `Donc $\\log_{${puissanceBase}}(${baseSimple}) = \\log_{${puissanceBase}}(${puissanceBase}^{1/${den}}) = ${miseEnEvidence(frac.texFractionSimplifiee)}$.`

          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBase,
              { texteAvant: '<br>Réponse : ' },
            )
            handleAnswers(this, i, {
              reponse: {
                value: frac.texFractionSimplifiee,
              },
            })
          }
        } else {
          const base = randint(2, 5)
          const exp = randint(2, 4)
          const denom = base ** exp

          cleUnique = `direct-inverse-${base}-${exp}`

          texte = `Calculer $\\log_{${base}}\\left(\\dfrac{1}{${denom}}\\right)$.`

          texteCorr = `On reconnaît que $\\dfrac{1}{${denom}} = \\dfrac{1}{${base}^{${exp}}} = ${base}^{-${exp}}$.<br><br>`
          texteCorr += `Donc $\\log_{${base}}\\left(\\dfrac{1}{${denom}}\\right) = \\log_{${base}}(${base}^{-${exp}}) = ${miseEnEvidence((-exp).toString())}$.`

          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBase,
              { texteAvant: '<br>Réponse : ' },
            )
            handleAnswers(this, i, {
              reponse: {
                value: `${-exp}`,
                options: { nombreDecimalSeulement: true },
              },
            })
          }
        }
      } else if (typeQuestion === 'formule') {
        // Type 2 : Compléter la formule avec placeholders
        const variante = choice(['changementBase', 'produitSimple', 'quotient'])

        if (variante === 'changementBase') {
          const base = randint(2, 9)
          let arg: number
          do {
            arg = randint(2, 50)
          } while (arg === base)

          cleUnique = `formule-changement-${base}-${arg}`

          texte = `Compléter la formule de changement de base :<br>`
          texte += `\\[\\log_{${base}}(${arg}) = \\dfrac{${logString}(\\ldots)}{${logString}(\\ldots)}\\]`

          texteCorr = `Par la formule de changement de base : $\\log_a(b) = \\dfrac{${logString}(b)}{${logString}(a)}$<br><br>`
          texteCorr += `Donc $\\log_{${base}}(${arg}) = \\dfrac{${logString}(${miseEnEvidence(arg.toString())})}{${logString}(${miseEnEvidence(base.toString())})}$.`

          if (this.interactif) {
            texte = `Compléter la formule de changement de base :<br>`
            texte += remplisLesBlancs(
              this,
              i,
              `\\log_{${base}}(${arg}) = \\dfrac{${logString}(%{champ1})}{${logString}(%{champ2})}`,
              KeyboardType.clavierDeBase,
            )
            handleAnswers(this, i, {
              champ1: { value: `${arg}` },
              champ2: { value: `${base}` },
            })
          }
        } else if (variante === 'produitSimple') {
          const bases = [2, 3, 4, 5, 6, 7, 8, 9]
          const [a, b, c] = combinaisonListes(bases, 3).slice(0, 3) as [
            number,
            number,
            number,
          ]

          cleUnique = `formule-produit-${a}-${b}-${c}`

          texte = `Compléter en utilisant la propriété du produit :<br>`
          texte += `\\[\\log_{${a}}(${b}) \\times \\log_{${b}}(${c}) = \\log_{${a}}(\\ldots)\\]`

          texteCorr = `Par la propriété : $\\log_a(b) \\times \\log_b(c) = \\log_a(c)$<br><br>`
          texteCorr += `Donc $\\log_{${a}}(${b}) \\times \\log_{${b}}(${c}) = \\log_{${a}}(${miseEnEvidence(c.toString())})$.`

          if (this.interactif) {
            texte = `Compléter en utilisant la propriété du produit :<br>`
            texte += remplisLesBlancs(
              this,
              i,
              `\\log_{${a}}(${b}) \\times \\log_{${b}}(${c}) = \\log_{${a}}(%{champ1})`,
              KeyboardType.clavierDeBase,
            )
            handleAnswers(this, i, {
              champ1: { value: `${c}` },
            })
          }
        } else {
          const bases = [2, 3, 4, 5, 6, 7, 8, 9]
          const [a, b, c] = combinaisonListes(bases, 3).slice(0, 3) as [
            number,
            number,
            number,
          ]

          cleUnique = `formule-quotient-${a}-${b}-${c}`

          texte = `Compléter en simplifiant le quotient :<br>`
          texte += `\\[\\dfrac{\\log_{${a}}(${b})}{\\log_{${a}}(${c})} = \\log_{${c}}(\\ldots)\\]`

          texteCorr = `En utilisant la formule de changement de base :<br>`
          texteCorr += `$\\dfrac{\\log_{${a}}(${b})}{\\log_{${a}}(${c})} = \\dfrac{\\frac{${logString}(${b})}{${logString}(${a})}}{\\frac{${logString}(${c})}{${logString}(${a})}} = \\dfrac{${logString}(${b})}{${logString}(${c})} = \\log_{${c}}(${miseEnEvidence(b.toString())})$`

          if (this.interactif) {
            texte = `Compléter en simplifiant le quotient :<br>`
            texte += remplisLesBlancs(
              this,
              i,
              `\\dfrac{\\log_{${a}}(${b})}{\\log_{${a}}(${c})} = \\log_{${c}}(%{champ1})`,
              KeyboardType.clavierDeBase,
            )
            handleAnswers(this, i, {
              champ1: { value: `${b}` },
            })
          }
        }
      } else if (typeQuestion === 'ecrireComplet') {
        // Type 3 : Écrire log_a(b) avec log/ln au numérateur ET dénominateur
        const bases = [2, 3, 4, 5, 6, 7, 8, 9]
        const base = choice(bases)
        let arg: number
        do {
          arg = randint(2, 50)
        } while (arg === base || estPuissanceDe(arg, base))

        cleUnique = `ecrireComplet-${base}-${arg}-${this.sup2}`

        texte = `Exprimer $\\log_{${base}}(${arg})$ à l'aide du ${logNom}.`

        texteCorr = `Par la formule de changement de base :<br>`
        texteCorr += `$\\log_a(b) = \\dfrac{${logString}(b)}{${logString}(a)}$<br><br>`
        texteCorr += `Donc $\\log_{${base}}(${arg}) = ${miseEnEvidence(`\\dfrac{${logString}(${arg})}{${logString}(${base})}`)}$.`

        if (this.interactif) {
          texte += '<br>'
          texte += remplisLesBlancs(
            this,
            i,
            `\\log_{${base}}(${arg}) = \\dfrac{${logString}(%{champ1})}{${logString}(%{champ2})}`,
            KeyboardType.clavierDeBase,
          )
          handleAnswers(this, i, {
            champ1: { value: `${arg}` },
            champ2: { value: `${base}` },
          })
        }
      } else if (typeQuestion === 'ecrireNumerateur') {
        // Type 4 : Compléter le numérateur (dénominateur donné)
        const bases = [2, 3, 4, 5, 6, 7, 8, 9]
        const base = choice(bases)
        let arg: number
        do {
          arg = randint(2, 50)
        } while (arg === base || estPuissanceDe(arg, base))

        cleUnique = `ecrireNum-${base}-${arg}-${this.sup2}`

        texte = `Compléter l'égalité : $\\log_{${base}}(${arg}) = \\dfrac{${logString}(\\ldots)}{${logString}(${base})}$`

        texteCorr = `Par la formule de changement de base : $\\log_a(b) = \\dfrac{${logString}(b)}{${logString}(a)}$<br><br>`
        texteCorr += `Le numérateur est $${logString}(${miseEnEvidence(arg.toString())})$, car $${arg.toString()}$ est l'argument $b$ du logarithme initial.`

        if (this.interactif) {
          texte = `Compléter l'égalité :<br>`
          texte += remplisLesBlancs(
            this,
            i,
            `\\log_{${base}}(${arg}) = \\dfrac{${logString}(%{champ1})}{${logString}(${base})}`,
            KeyboardType.clavierDeBase,
          )
          handleAnswers(this, i, {
            champ1: { value: `${arg}` },
          })
        }
      } else if (typeQuestion === 'ecrireDenominateur') {
        // Type 5 : Compléter le dénominateur (numérateur donné)
        const bases = [2, 3, 4, 5, 6, 7, 8, 9]
        const base = choice(bases)
        let arg: number
        do {
          arg = randint(2, 50)
        } while (arg === base || estPuissanceDe(arg, base))

        cleUnique = `ecrireDen-${base}-${arg}-${this.sup2}`

        texte = `Compléter l'égalité : $\\log_{${base}}(${arg}) = \\dfrac{${logString}(${arg})}{${logString}(\\ldots)}$`

        texteCorr = `Par la formule de changement de base : $\\log_a(b) = \\dfrac{${logString}(b)}{${logString}(a)}$<br><br>`
        texteCorr += `Le dénominateur est $${logString}(${miseEnEvidence(base.toString())})$, car $${base.toString()}$ est la base du logarithme initial.`

        if (this.interactif) {
          texte = `Compléter l'égalité :<br>`
          texte += remplisLesBlancs(
            this,
            i,
            `\\log_{${base}}(${arg}) = \\dfrac{${logString}(${arg})}{${logString}(%{champ1})}`,
            KeyboardType.clavierDeBase,
          )
          handleAnswers(this, i, {
            champ1: { value: `${base}` },
          })
        }
      } else if (typeQuestion === 'calculer') {
        // Type 6 : Calculer la valeur numérique
        const bases = [2, 3, 4, 5, 6, 7, 8, 9]
        const base = choice(bases)
        let arg: number
        do {
          arg = randint(2, 50)
        } while (arg === base || estPuissanceDe(arg, base))

        cleUnique = `calculer-${base}-${arg}-${this.sup2}`

        const resultat = new Decimal(arg).ln().div(new Decimal(base).ln())
        const resultatArrondi = resultat.toDecimalPlaces(3)

        texte = `Calculer $\\log_{${base}}(${arg})$ en utilisant la formule de changement de base.`
        texte += ` Arrondir au millième près.`

        texteCorr = `Par la formule de changement de base :<br>`
        texteCorr += `$\\begin{aligned}\n`
        texteCorr += `\\log_{${base}}(${arg}) &= \\dfrac{${logString}(${arg})}{${logString}(${base})}\\\\\n`
        texteCorr += `&\\approx ${miseEnEvidence(texNombre(resultatArrondi, 3, true))}\n`
        texteCorr += `\\end{aligned}$`

        if (this.interactif) {
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierDeBase,
            {
              texteAvant: '<br>Réponse : ',
            },
          )
          handleAnswers(this, i, {
            reponse: {
              value: resultatArrondi.toFixed(3),
              options: { nombreDecimalSeulement: true },
            },
          })
        }
      } else if (typeQuestion === 'completer2blancs') {
        // Type 7 : Compléter avec 2 blancs (à partir d'une fraction de log/ln)
        const bases = [2, 3, 4, 5, 6, 7, 8, 9]
        const [a, b] = combinaisonListes(bases, 2).slice(0, 2) as [
          number,
          number,
        ]

        cleUnique = `completer2-${a}-${b}-${this.sup2}`

        texte = `Compléter l'égalité : $\\dfrac{${logString}(${b})}{${logString}(${a})} = \\log_{\\ldots}(\\ldots)$`

        texteCorr = `Par la formule de changement de base : $\\dfrac{${logString}(b)}{${logString}(a)} = \\log_a(b)$<br><br>`
        texteCorr += `Donc $\\dfrac{${logString}(${b})}{${logString}(${a})} = \\log_{${miseEnEvidence(a.toString())}}(${miseEnEvidence(b.toString())})$.`

        if (this.interactif) {
          texte = `Compléter l'égalité :<br>`
          texte += remplisLesBlancs(
            this,
            i,
            `\\dfrac{${logString}(${b})}{${logString}(${a})} = \\log_{%{champ1}}(%{champ2})`,
            KeyboardType.clavierDeBase,
          )
          handleAnswers(this, i, {
            champ1: { value: `${a}` },
            champ2: { value: `${b}` },
          })
        }
      } else {
        // Type 8 : Compléter avec 1 blanc (base ou argument donné)
        const bases = [2, 3, 4, 5, 6, 7, 8, 9]
        const [a, b] = combinaisonListes(bases, 2).slice(0, 2) as [
          number,
          number,
        ]
        const donnerBase = choice([true, false])

        cleUnique = `completer1-${a}-${b}-${donnerBase ? 'base' : 'arg'}-${this.sup2}`

        if (donnerBase) {
          texte = `Compléter l'égalité : $\\dfrac{${logString}(${b})}{${logString}(${a})} = \\log_{${a}}(\\ldots)$`

          texteCorr = `Par la formule de changement de base : $\\dfrac{${logString}(b)}{${logString}(a)} = \\log_a(b)$<br><br>`
          texteCorr += `L'argument est $${miseEnEvidence(b.toString())}$, il correspond au $b$ dans la formule de changement de base.`

          if (this.interactif) {
            texte = `Compléter l'égalité :<br>`
            texte += remplisLesBlancs(
              this,
              i,
              `\\dfrac{${logString}(${b})}{${logString}(${a})} = \\log_{${a}}(%{champ1})`,
              KeyboardType.clavierDeBase,
            )
            handleAnswers(this, i, {
              champ1: { value: `${b}` },
            })
          }
        } else {
          texte = `Compléter l'égalité : $\\dfrac{${logString}(${b})}{${logString}(${a})} = \\log_{\\ldots}(${b})$`

          texteCorr = `Par la formule de changement de base : $\\dfrac{${logString}(b)}{${logString}(a)} = \\log_a(b)$<br><br>`
          texteCorr += `La base est $${miseEnEvidence(a.toString())}$ (qui apparaît au dénominateur de la fraction).`

          if (this.interactif) {
            texte = `Compléter l'égalité :<br>`
            texte += remplisLesBlancs(
              this,
              i,
              `\\dfrac{${logString}(${b})}{${logString}(${a})} = \\log_{%{champ1}}(${b})`,
              KeyboardType.clavierDeBase,
            )
            handleAnswers(this, i, {
              champ1: { value: `${a}` },
            })
          }
        }
      }

      if (this.questionJamaisPosee(i, cleUnique)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
