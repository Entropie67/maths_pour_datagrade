import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import FractionEtendue from '../../../modules/FractionEtendue'
import {
    gestionnaireFormulaireTexte,
    listeQuestionsToContenu,
    randint,
} from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = "Résoudre des problèmes d'intérêts composés simples"
export const dateDePublication = '03/02/2026'
export const interactifReady = true

export const uuid = 'bfd77'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['2mLogExp-5'],
}

/**
 * Problèmes d'intérêts composés simples
 * @author Nathan Scheinmann
 */

export default class InteretsComposes extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : Calculer le capital final',
        '2 : Trouver le taux',
        '3 : Trouver la durée',
        '4 : Trouver le capital initial',
        '5 : Calculer les intérêts gagnés',
        '6 : Temps de doublement',
        '7 : Mélange',
      ].join('\n'),
    ]
    this.sup = '7'
  }

  nouvelleVersion() {
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 6,
      melange: 7,
      defaut: 7,
      listeOfCase: [
        'capitalFinal',
        'taux',
        'duree',
        'capitalInitial',
        'interets',
        'doublement',
      ],
      nbQuestions: this.nbQuestions,
      shuffle: true,
    })

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let reponse = ''

      // Variables aléatoires
      const C0 = choice([
        500, 750, 1000, 1200, 1500, 2000, 2500, 3000, 4000, 5000, 6000, 8000,
        10000, 12500, 500000, 750000, 1000000,
      ])
      const tauxNum = randint(1, 10)
      const tauxDen = choice([1, 2, 4, 5])
      const taux = new FractionEtendue(tauxNum, tauxDen)
      const tauxDecimal = taux.valeurDecimale / 100
      const n = randint(5, 25)

      // Calcul avec Decimal pour la précision
      const facteur = new Decimal(1).plus(tauxDecimal)
      const Cn = new Decimal(C0).mul(facteur.pow(n))

      const typeQuestion = listeTypeDeQuestions[i]

      // Formater le taux avec le bon nombre de décimales
      const tauxAffiche =
        tauxDen === 1
          ? texNombre(taux.valeurDecimale, 0)
          : tauxDen === 2
            ? texNombre(taux.valeurDecimale, 1)
            : texNombre(taux.valeurDecimale, 2)

      if (typeQuestion === 'capitalFinal') {
        // Calculer le capital final
        texte = `Un capital de $${texNombre(C0, 0)}$ CHF est placé à un taux annuel de $${tauxAffiche}\\,\\%$. `
        texte += `Quel sera le capital après $${n}$ années ? Arrondir la réponse au franc près.`

        const resultat = Cn.toDecimalPlaces(0)
        reponse = resultat.toFixed(0)

        texteCorr = `La formule des intérêts composés est $C_n = C_0 \\cdot (1 + r)^n$ où :<br>`
        texteCorr += `$\\bullet$ $C_0 = ${texNombre(C0, 0)}$ CHF (capital initial)<br>`
        texteCorr += `$\\bullet$ $r = ${tauxAffiche}\\,\\% = ${texNombre(tauxDecimal, 4)}$ (taux annuel)<br>`
        texteCorr += `$\\bullet$ $n = ${n}$ ans (durée)<br><br>`
        texteCorr += `On obtient :<br>`
        texteCorr += `$\\begin{aligned}\n`
        texteCorr += `C_{${n}} &= ${texNombre(C0, 0)} \\cdot (1 + ${texNombre(tauxDecimal, 4)})^{${n}}\\\\\n`
        texteCorr += `&= ${texNombre(C0, 0)} \\cdot (${texNombre(facteur, 4)})^{${n}}\\\\\n`
        texteCorr += `&\\approx ${miseEnEvidence(texNombre(resultat, 0))}\\text{ CHF}\n`
        texteCorr += `\\end{aligned}$<br><br>`
        texteCorr += `Le capital après $${n}$ années vaut environ $${miseEnEvidence(texNombre(resultat, 0))}\\text{ CHF}$.`
      } else if (typeQuestion === 'taux') {
        // Trouver le taux
        const CnArrondi = Cn.toDecimalPlaces(0).toNumber()
        texte = `Un capital de $${texNombre(C0, 0)}$ CHF est placé pendant $${n}$ années. `
        texte += `Le capital final est de $${texNombre(CnArrondi, 0)}$ CHF. Quel est le taux annuel en $\\%$ ? Arrondir au dixième de pourcent près.`

        const tauxTrouve = new Decimal(CnArrondi)
          .div(C0)
          .pow(new Decimal(1).div(n))
          .minus(1)
          .mul(100)
        reponse = tauxTrouve.toDecimalPlaces(1).toFixed(1)

        texteCorr = `La formule des intérêts composés est $C_n = C_0 \\cdot (1 + r)^n$ où :<br>`
        texteCorr += `$\\bullet$ $C_0 = ${texNombre(C0, 0)}$ CHF (capital initial)<br>`
        texteCorr += `$\\bullet$ $C_n = ${texNombre(CnArrondi, 0)}$ CHF (capital final)<br>`
        texteCorr += `$\\bullet$ $n = ${n}$ ans (durée)<br>`
        texteCorr += `$\\bullet$ $r = ?$ (taux annuel recherché)<br><br>`
        texteCorr += `On isole $r$ :<br>`
        texteCorr += `$\\begin{aligned}\n`
        texteCorr += `(1 + r)^n &= \\dfrac{C_{n}}{C_0}\\\\\n`
        texteCorr += `1 + r &= \\sqrt[n]{\\dfrac{C_{n}}{C_0}}\\\\\n`
        texteCorr += `r &= \\sqrt[${n}]{\\dfrac{${texNombre(CnArrondi, 0)}}{${texNombre(C0, 0)}}} - 1\\\\\n`
        texteCorr += `&\\approx ${texNombre(tauxTrouve.div(100), 3)}\n`
        texteCorr += `\\end{aligned}$<br><br>`
        texteCorr += `Le taux annuel recherché est donc d'environ $${miseEnEvidence(texNombre(tauxTrouve, 1))}\\,\\%$.`
      } else if (typeQuestion === 'duree') {
        // Trouver la durée
        const CnArrondi = Cn.toDecimalPlaces(0).toNumber()
        texte = `Un capital de $${texNombre(C0, 0)}$ CHF est placé à un taux annuel de $${tauxAffiche}\\,\\%$. `
        texte += `Combien d'années faut-il pour atteindre $${texNombre(CnArrondi, 0)}$ CHF ? Arrondir à l'année.`

        const dureeTrouvee = new Decimal(CnArrondi)
          .div(C0)
          .ln()
          .div(facteur.ln())
        reponse = dureeTrouvee.toDecimalPlaces(1).toFixed(1)

        texteCorr = `La formule des intérêts composés est $C_n = C_0 \\cdot (1 + r)^n$ où :<br>`
        texteCorr += `$\\bullet$ $C_0 = ${texNombre(C0, 0)}$ CHF (capital initial)<br>`
        texteCorr += `$\\bullet$ $C_n = ${texNombre(CnArrondi, 0)}$ CHF (capital final)<br>`
        texteCorr += `$\\bullet$ $r = ${tauxAffiche}\\,\\% = ${texNombre(tauxDecimal, 4)}$ (taux annuel)<br>`
        texteCorr += `$\\bullet$ $n = ?$ (durée recherchée)<br><br>`
        texteCorr += `On isole $n$ :<br>`
        texteCorr += `$\\begin{aligned}\n`
        texteCorr += `(1 + r)^n &= \\dfrac{C_n}{C_0}\\\\\n`
        texteCorr += `n \\cdot \\ln(1 + r) &= \\ln\\left(\\dfrac{C_n}{C_0}\\right)\\\\\n`
        texteCorr += `n &= \\dfrac{\\ln\\left(\\dfrac{${texNombre(CnArrondi, 0)}}{${texNombre(C0, 0)}}\\right)}{\\ln(${texNombre(facteur, 4)})}\\\\\n`
        texteCorr += `&\\approx ${texNombre(dureeTrouvee, 2)}\n`
        texteCorr += `\\end{aligned}$<br><br>`
        texteCorr += `Il faut donc environ $${miseEnEvidence(texNombre(dureeTrouvee.toDecimalPlaces(1), 1))}\\text{ ans}$.`
      } else if (typeQuestion === 'capitalInitial') {
        // Trouver le capital initial
        const CnArrondi = Cn.toDecimalPlaces(0).toNumber()
        texte = `Quel capital faut-il placer à un taux annuel de $${tauxAffiche}\\,\\%$ `
        texte += `pour obtenir $${texNombre(CnArrondi, 0)}$ CHF après $${n}$ années ? Arrondir au franc près.`

        const C0Trouve = new Decimal(CnArrondi).div(facteur.pow(n))
        reponse = C0Trouve.toDecimalPlaces(0).toFixed(0)

        texteCorr = `La formule des intérêts composés est $C_n = C_0 \\cdot (1 + r)^n$ où :<br>`
        texteCorr += `$\\bullet$ $C_n = ${texNombre(CnArrondi, 0)}$ CHF (capital final)<br>`
        texteCorr += `$\\bullet$ $r = ${tauxAffiche}\\,\\% = ${texNombre(tauxDecimal, 4)}$ (taux annuel)<br>`
        texteCorr += `$\\bullet$ $n = ${n}$ ans (durée)<br>`
        texteCorr += `$\\bullet$ $C_0 = ?$ (capital initial recherché)<br><br>`
        texteCorr += `On isole $C_0$ :<br>`
        texteCorr += `$\\begin{aligned}\n`
        texteCorr += `C_0 &= \\dfrac{C_{n}}{(1 + r)^n}\\\\\n`
        texteCorr += `&= \\dfrac{${texNombre(CnArrondi, 0)}}{(${texNombre(facteur, 4)})^{${n}}}\\\\\n`
        texteCorr += `&\\approx ${miseEnEvidence(texNombre(C0Trouve, 0))}\\text{ CHF}\n`
        texteCorr += `\\end{aligned}$<br><br>`
        texteCorr += `Le capital initial vaut environ $${miseEnEvidence(texNombre(C0Trouve, 0))}\\text{ CHF}$.`
      } else if (typeQuestion === 'interets') {
        // Calculer les intérêts gagnés
        texte = `Un capital de $${texNombre(C0, 0)}$ CHF est placé à un taux annuel de $${tauxAffiche}\\,\\%$ pendant $${n}$ années. `
        texte += `Quel est le montant des intérêts gagnés ? Donner la réponse au franc près.`

        const interets = Cn.minus(C0)
        const resultat = interets.toDecimalPlaces(0)
        reponse = resultat.toFixed(0)

        texteCorr = `La formule des intérêts composés est $C_n = C_0 \\cdot (1 + r)^n$ où :<br>`
        texteCorr += `$\\bullet$ $C_0 = ${texNombre(C0, 0)}$ CHF (capital initial)<br>`
        texteCorr += `$\\bullet$ $r = ${tauxAffiche}\\,\\% = ${texNombre(tauxDecimal, 4)}$ (taux annuel)<br>`
        texteCorr += `$\\bullet$ $n = ${n}$ ans (durée)<br>`
        texteCorr += `$\\bullet$ $I = ?$ (intérêts recherchés)<br><br>`
        texteCorr += `Les intérêts sont $I = C_{${n}} - C_0$. Calculons d'abord $C_{${n}}$ :<br>`
        texteCorr += `$\\begin{aligned}\n`
        texteCorr += `C_{${n}} &= ${texNombre(C0, 0)} \\cdot (${texNombre(facteur, 4)})^{${n}}\\\\\n`
        texteCorr += `&\\approx ${texNombre(Cn, 0)}\\text{ CHF}\n`
        texteCorr += `\\end{aligned}$<br><br>`
        texteCorr += `Les intérêts gagnés sont :<br>`
        texteCorr += `$I = C_{${n}} - ${texNombre(C0, 0)} \\approx ${miseEnEvidence(texNombre(resultat, 0))}\\text{ CHF}$<br><br>`
        texteCorr += `Les intérêts gagnés s'élèvent à environ $${miseEnEvidence(texNombre(resultat, 0))}\\text{ CHF}$.`
      } else {
        // Temps de doublement
        texte = `Un capital est placé à un taux annuel de $${tauxAffiche}\\,\\%$. `
        texte += `Au bout de combien d'années ce capital aura-t-il doublé ? Arrondir la réponse au dixième.`

        const tempsDoublement = new Decimal(2).ln().div(facteur.ln())
        reponse = tempsDoublement.toDecimalPlaces(1).toFixed(1)

        texteCorr = `La formule des intérêts composés est $C_n = C_0 \\cdot (1 + r)^n$ où :<br>`
        texteCorr += `$\\bullet$ $r = ${tauxAffiche}\\,\\% = ${texNombre(tauxDecimal, 4)}$ (taux annuel)<br>`
        texteCorr += `$\\bullet$ $n = ?$ (temps de doublement recherché)<br><br>`
        texteCorr += `Pour que le capital double, on cherche $n$ tel que $C_n = 2C_0$ :<br>`
        texteCorr += `$\\begin{aligned}\n`
        texteCorr += `2C_0 &= C_0 \\cdot (1 + r)^n\\\\\n`
        texteCorr += `2 &= (1 + r)^n\\\\\n`
        texteCorr += `\\ln(2) &= n \\cdot \\ln(1 + r)\\\\\n`
        texteCorr += `n &= \\dfrac{\\ln(2)}{\\ln(${texNombre(facteur, 4)})}\\\\\n`
        texteCorr += `&\\approx ${texNombre(tempsDoublement, 2)}\n`
        texteCorr += `\\end{aligned}$<br><br>`
        texteCorr += `Le capital double après environ $${miseEnEvidence(texNombre(tempsDoublement, 1))}\\text{ ans}$.`
      }

      // Champ interactif
      if (this.interactif) {
        let unite = ''
        if (
          typeQuestion === 'capitalFinal' ||
          typeQuestion === 'capitalInitial' ||
          typeQuestion === 'interets'
        ) {
          unite = 'CHF'
        } else if (typeQuestion === 'taux') {
          unite = '%'
        } else {
          unite = 'ans'
        }
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase, {
          texteAvant: '<br>',
          texteApres: ` ${unite}`,
        })
        handleAnswers(this, i, {
          reponse: {
            value: reponse,
            options: { nombreDecimalSeulement: true },
          },
        })
      }

      if (this.questionJamaisPosee(i, C0, tauxNum, tauxDen, n, typeQuestion)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
