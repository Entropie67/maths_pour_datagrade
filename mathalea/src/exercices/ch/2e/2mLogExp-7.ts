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

export const titre = "Résoudre des problèmes d'intérêt composé continu"
export const dateDePublication = '03/02/2026'
export const interactifReady = true

export const dateDeModifImportante = '31/10/2026'
export const uuid = 'bfce3'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['2mLogExp-7'],
}

/**
 * Problèmes d'intérêt composé continu
 * @author Nathan Scheinmann
 */

export default class InteretContinu extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : Calculer le capital final',
        '2 : Trouver le capital initial',
        '3 : Trouver le taux',
        '4 : Trouver la durée',
        '5 : Temps de doublement',
        '6 : Mélange',
      ].join('\n'),
    ]
    this.sup = '6'
  }

  nouvelleVersion() {
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 5,
      melange: 6,
      defaut: 6,
      listeOfCase: [
        'capitalFinal',
        'capitalInitial',
        'taux',
        'duree',
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
      const C0Base = choice([
        500, 750, 1000, 1200, 1500, 2000, 2500, 3000, 4000, 5000, 6000, 8000,
        10000, 12500, 500000, 750000, 1000000,
      ])
      const tauxNum = randint(1, 15)
      const taux = new FractionEtendue(tauxNum, 1)
      const tauxDecimal = taux.valeurDecimale / 100
      const n = randint(5, 25)

      // Calcul avec Decimal pour la précision
      const exposant = new Decimal(tauxDecimal).mul(n)
      const Cn = new Decimal(C0Base).mul(Decimal.exp(exposant))

      const typeQuestion = listeTypeDeQuestions[i]

      if (typeQuestion === 'capitalFinal') {
        // Calculer le capital final
        texte = `Une somme de $${texNombre(C0Base, 0)}$ CHF est placée à un taux de $${taux.texFractionSimplifiee}\\,\\%$ par an avec intérêt composé continu. `
        texte += `Quel sera le capital après $${n}$ années ? Arrondir au franc près.`

        const resultat = Cn.toDecimalPlaces(0)
        reponse = resultat.toFixed(0)

        texteCorr = `Avec l'intérêt composé continu, on utilise la formule $C_n = C_0 \\cdot \\mathrm{e}^{rn}$ où :<br>`
        texteCorr += `$\\bullet$ $C_0 = ${texNombre(C0Base, 0)}$ CHF (capital initial)<br>`
        texteCorr += `$\\bullet$ $r = ${taux.texFractionSimplifiee}\\,\\% = ${texNombre(tauxDecimal, 2)}$ (taux annuel)<br>`
        texteCorr += `$\\bullet$ $n = ${n}$ ans (durée)<br><br>`
        texteCorr += `On obtient :<br>`
        texteCorr += `$\\begin{aligned}\n`
        texteCorr += `C_{${n}} &= ${texNombre(C0Base, 0)} \\cdot \\mathrm{e}^{${texNombre(tauxDecimal, 2)} \\times ${n}}\\\\\n`
        texteCorr += `&= ${texNombre(C0Base, 0)} \\cdot \\mathrm{e}^{${texNombre(exposant, 4)}}\\\\\n`
        texteCorr += `&\\approx ${miseEnEvidence(texNombre(resultat, 0))}\\text{ CHF}\n`
        texteCorr += `\\end{aligned}$<br><br>`
        texteCorr += `Le capital après $${n}$ années vaut environ $${miseEnEvidence(texNombre(resultat, 0))}\\text{ CHF}$.`
      } else if (typeQuestion === 'capitalInitial') {
        // Trouver le capital initial
        const CnArrondi = Cn.toDecimalPlaces(0).toNumber()
        texte = `Quelle somme faut-il placer à un taux de $${taux.texFractionSimplifiee}\\,\\%$ par an avec intérêt composé continu `
        texte += `pour obtenir $${texNombre(CnArrondi, 0)}$ CHF après $${n}$ années ? Arrondir au franc près.`

        const C0Trouve = new Decimal(CnArrondi).div(Decimal.exp(exposant))
        reponse = C0Trouve.toDecimalPlaces(0).toFixed(0)

        texteCorr = `Avec l'intérêt composé continu, on a $C_n = C_0 \\cdot \\mathrm{e}^{rn}$ où :<br>`
        texteCorr += `$\\bullet$ $C_n = ${texNombre(CnArrondi, 0)}$ CHF (capital final)<br>`
        texteCorr += `$\\bullet$ $r = ${taux.texFractionSimplifiee}\\,\\% = ${texNombre(tauxDecimal, 2)}$ (taux annuel)<br>`
        texteCorr += `$\\bullet$ $n = ${n}$ ans (durée)<br>`
        texteCorr += `$\\bullet$ $C_0 = ?$ (capital initial recherché)<br><br>`
        texteCorr += `On isole $C_0$ :<br>`
        texteCorr += `$\\begin{aligned}\n`
        texteCorr += `C_0 &= \\dfrac{C_n}{\\mathrm{e}^{rn}} = C_n \\cdot \\mathrm{e}^{-rn}\\\\\n`
        texteCorr += `&= ${texNombre(CnArrondi, 0)} \\cdot \\mathrm{e}^{-${texNombre(exposant, 4)}}\\\\\n`
        texteCorr += `&\\approx ${miseEnEvidence(texNombre(C0Trouve, 0))}\\text{ CHF}\n`
        texteCorr += `\\end{aligned}$<br><br>`
        texteCorr += `Le capital initial vaut environ $${miseEnEvidence(texNombre(C0Trouve, 0))}\\text{ CHF}$.`
      } else if (typeQuestion === 'taux') {
        // Trouver le taux
        const CnArrondi = Cn.toDecimalPlaces(0).toNumber()
        texte = `Un placement à intérêt composé continu fait passer un capital de $${texNombre(C0Base, 0)}$ CHF `
        texte += `à $${texNombre(CnArrondi, 0)}$ CHF en $${n}$ années. Quel est le taux annuel en $\\%$ ? Arrondir au dixième de pourcent près.`

        // r = (1/n) * ln(Cn/C0)
        const tauxTrouve = new Decimal(CnArrondi)
          .div(C0Base)
          .ln()
          .div(n)
          .mul(100)
        reponse = tauxTrouve.toDecimalPlaces(0).toFixed(0)

        texteCorr = `Avec l'intérêt composé continu, on a $C_n = C_0 \\cdot \\mathrm{e}^{rn}$ où :<br>`
        texteCorr += `$\\bullet$ $C_0 = ${texNombre(C0Base, 0)}$ CHF (capital initial)<br>`
        texteCorr += `$\\bullet$ $C_n = ${texNombre(CnArrondi, 0)}$ CHF (capital final)<br>`
        texteCorr += `$\\bullet$ $n = ${n}$ ans (durée)<br>`
        texteCorr += `$\\bullet$ $r = ?$ (taux annuel recherché)<br><br>`
        texteCorr += `On isole $r$ :<br>`
        texteCorr += `$\\begin{aligned}\n`
        texteCorr += `\\mathrm{e}^{rn} &= \\dfrac{C_n}{C_0}\\\\\n`
        texteCorr += `rn &= \\ln\\left(\\dfrac{C_n}{C_0}\\right)\\\\\n`
        texteCorr += `r &= \\dfrac{1}{n} \\cdot \\ln\\left(\\dfrac{C_n}{C_0}\\right)\\\\\n`
        texteCorr += `&= \\dfrac{1}{${n}} \\cdot \\ln\\left(\\dfrac{${texNombre(CnArrondi, 0)}}{${texNombre(C0Base, 0)}}\\right)\\\\\n`
        texteCorr += `&\\approx ${texNombre(tauxTrouve.div(100), 3)}\n`
        texteCorr += `\\end{aligned}$<br><br>`
        texteCorr += `Le taux annuel est donc $${miseEnEvidence(texNombre(tauxTrouve, 0))}\\,\\%$.`
      } else if (typeQuestion === 'duree') {
        // Trouver la durée
        const CnArrondi = Cn.toDecimalPlaces(0).toNumber()
        texte = `Un capital de $${texNombre(C0Base, 0)}$ CHF est placé à un taux continu de $${taux.texFractionSimplifiee}\\,\\%$. `
        texte += `En combien d'années atteindra-t-il $${texNombre(CnArrondi, 0)}$ CHF ? Arrondir au dixième d'année près.`

        // n = (1/r) * ln(Cn/C0)
        const dureeTrouvee = new Decimal(CnArrondi)
          .div(C0Base)
          .ln()
          .div(tauxDecimal)
        reponse = dureeTrouvee.toDecimalPlaces(1).toFixed(1)

        texteCorr = `Avec l'intérêt composé continu, on a $C_n = C_0 \\cdot \\mathrm{e}^{rn}$ où :<br>`
        texteCorr += `$\\bullet$ $C_0 = ${texNombre(C0Base, 0)}$ CHF (capital initial)<br>`
        texteCorr += `$\\bullet$ $C_n = ${texNombre(CnArrondi, 0)}$ CHF (capital final)<br>`
        texteCorr += `$\\bullet$ $r = ${taux.texFractionSimplifiee}\\,\\% = ${texNombre(tauxDecimal, 2)}$ (taux annuel)<br>`
        texteCorr += `$\\bullet$ $n = ?$ (durée recherchée)<br><br>`
        texteCorr += `On isole $n$ :<br>`
        texteCorr += `$\\begin{aligned}\n`
        texteCorr += `\\mathrm{e}^{rn} &= \\dfrac{C_n}{C_0}\\\\\n`
        texteCorr += `rn &= \\ln\\left(\\dfrac{C_n}{C_0}\\right)\\\\\n`
        texteCorr += `n &= \\dfrac{1}{r} \\cdot \\ln\\left(\\dfrac{C_n}{C_0}\\right)\\\\\n`
        texteCorr += `&= \\dfrac{1}{${texNombre(tauxDecimal, 2)}} \\cdot \\ln\\left(\\dfrac{${texNombre(CnArrondi, 0)}}{${texNombre(C0Base, 0)}}\\right)\\\\\n`
        texteCorr += `&\\approx ${texNombre(dureeTrouvee, 1)}\n`
        texteCorr += `\\end{aligned}$<br><br>`
        texteCorr += `Il faut donc $${miseEnEvidence(texNombre(dureeTrouvee, 1))}\\text{ ans}$.`
      } else {
        // Temps de doublement
        texte = `Un capital est placé à un taux continu de $${taux.texFractionSimplifiee}\\,\\%$ par an. `
        texte += `Au bout de combien d'années ce capital aura-t-il doublé ? Arrondir au dixième d'année près.`

        // T = ln(2) / r
        const tempsDoublement = new Decimal(2).ln().div(tauxDecimal)
        reponse = tempsDoublement.toDecimalPlaces(1).toFixed(1)

        texteCorr = `Avec l'intérêt composé continu, on a $C_n = C_0 \\cdot \\mathrm{e}^{rn}$ où :<br>`
        texteCorr += `$\\bullet$ $r = ${taux.texFractionSimplifiee}\\,\\% = ${texNombre(tauxDecimal, 2)}$ (taux annuel)<br>`
        texteCorr += `$\\bullet$ $n = ?$ (temps de doublement recherché)<br><br>`
        texteCorr += `Pour que le capital double, on cherche $n$ tel que $C_n = 2C_0$ :<br>`
        texteCorr += `$\\begin{aligned}\n`
        texteCorr += `2C_0 &= C_0 \\cdot \\mathrm{e}^{rn}\\\\\n`
        texteCorr += `2 &= \\mathrm{e}^{rn}\\\\\n`
        texteCorr += `\\ln(2) &= rn\\\\\n`
        texteCorr += `n &= \\dfrac{\\ln(2)}{r}\\\\\n`
        texteCorr += `&= \\dfrac{\\ln(2)}{${texNombre(tauxDecimal, 2)}}\\\\\n`
        texteCorr += `&\\approx ${texNombre(tempsDoublement, 1)}\n`
        texteCorr += `\\end{aligned}$<br><br>`
        texteCorr += `Le capital double après environ $${miseEnEvidence(texNombre(tempsDoublement, 1))}\\text{ ans}$.`
      }

      // Champ interactif
      if (this.interactif) {
        let unite = ''
        if (
          typeQuestion === 'capitalFinal' ||
          typeQuestion === 'capitalInitial'
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

      if (this.questionJamaisPosee(i, C0Base, tauxNum, n, typeQuestion)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
