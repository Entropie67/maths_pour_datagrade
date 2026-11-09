import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import FractionEtendue from '../../../modules/FractionEtendue'
import {
    gestionnaireFormulaireTexte,
    listeQuestionsToContenu,
    randint,
} from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = 'Résoudre des problèmes de capitalisation périodique'
export const dateDePublication = '03/02/2026'
export const interactifReady = true

export const uuid = 'bfc45'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['2mLogExp-6'],
}

/**
 * Problèmes de capitalisation périodique
 * @author Nathan Scheinmann
 */

export default class CapitalisationPeriodique extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.besoinFormulaireTexte = [
      'Périodicité',
      [
        'Nombres séparés par des tirets :',
        '1 : Semestrielle (k=2)',
        '2 : Trimestrielle (k=4)',
        '3 : Mensuelle (k=12)',
        '4 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire2Texte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : Calculer le capital final',
        '2 : Trouver le taux annuel',
        '3 : Calculer les intérêts',
        '4 : Trouver le capital initial',
        '5 : Mélange',
      ].join('\n'),
    ]
    this.sup = '4'
    this.sup2 = '5'
  }

  nouvelleVersion() {
    this.consigne = `Arrondir ${this.nbQuestions === 1 ? 'la réponse' : 'les réponses'} à l'unité.`

    const listePeriodicites = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
      listeOfCase: ['semestrielle', 'trimestrielle', 'mensuelle'],
      nbQuestions: this.nbQuestions,
      shuffle: true,
    })

    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: 4,
      melange: 5,
      defaut: 5,
      listeOfCase: ['capitalFinal', 'taux', 'interets', 'capitalInitial'],
      nbQuestions: this.nbQuestions,
      shuffle: true,
    })

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let reponse = ''

      // Variables aléatoires
      const C0 = randint(5, 25) * 1000
      const tauxAnnuelNum = randint(2, 10)
      const tauxAnnuel = new FractionEtendue(tauxAnnuelNum, 1)
      const tauxAnnuelDecimal = tauxAnnuel.valeurDecimale / 100
      const n = randint(5, 20)

      // Périodicité
      const periodicites: {
        [key: string]: { nom: string; k: number; nomAdj: string }
      } = {
        semestrielle: { nom: 'semestrielle', k: 2, nomAdj: 'semestrielle' },
        trimestrielle: { nom: 'trimestrielle', k: 4, nomAdj: 'trimestrielle' },
        mensuelle: { nom: 'mensuelle', k: 12, nomAdj: 'mensuelle' },
      }
      const periodiciteKey = listePeriodicites[i] as string
      const periodicite = periodicites[periodiciteKey]
      const k = periodicite.k

      // Calcul avec Decimal pour la précision
      const tauxPeriodique = new Decimal(tauxAnnuelDecimal).div(k)
      const facteur = new Decimal(1).plus(tauxPeriodique)
      const nbPeriodes = k * n
      const Cn = new Decimal(C0).mul(facteur.pow(nbPeriodes))

      const typeQuestion = listeTypeDeQuestions[i]

      if (typeQuestion === 'capitalFinal') {
        // Calculer le capital final
        texte = `Un montant de $${texNombre(C0, 0)}$ CHF est placé à un taux annuel de $${tauxAnnuel.texFractionSimplifiee}\\,\\%$ avec capitalisation ${periodicite.nomAdj}. `
        texte += `À combien s'élèvera cette somme après $${n}$ années ?`

        const resultat = Cn.toDecimalPlaces(0)
        reponse = resultat.toFixed(0)

        texteCorr = `Avec une capitalisation périodique, on utilise la formule $C_n = C_0 \\cdot \\left(1 + \\dfrac{r}{k}\\right)^{kn}$ où :<br>`
        texteCorr += `$\\bullet$ $C_0 = ${texNombre(C0, 0)}$ CHF (capital initial)<br>`
        texteCorr += `$\\bullet$ $r = ${tauxAnnuel.texFractionSimplifiee}\\,\\% = ${texNombre(tauxAnnuelDecimal, 2)}$ (taux annuel)<br>`
        texteCorr += `$\\bullet$ $k = ${k}$ (capitalisation ${periodicite.nomAdj})<br>`
        texteCorr += `$\\bullet$ $n = ${n}$ ans (durée)<br><br>`
        texteCorr += `On obtient :<br>`
        texteCorr += `$\\begin{aligned}\n`
        texteCorr += `C_{${n}} &= ${texNombre(C0, 0)} \\cdot \\left(1 + \\dfrac{${texNombre(tauxAnnuelDecimal, 2)}}{${k}}\\right)^{${k} \\times ${n}}\\\\\n`
        texteCorr += `&= ${texNombre(C0, 0)} \\cdot (${texNombre(facteur, 6)})^{${nbPeriodes}}\\\\\n`
        texteCorr += `&\\approx ${miseEnEvidence(texNombre(resultat, 0))}\\text{ CHF}\n`
        texteCorr += `\\end{aligned}$<br><br>`
        texteCorr += `Le capital après $${n}$ années vaut environ $${miseEnEvidence(texNombre(resultat, 0))}\\text{ CHF}$.`
      } else if (typeQuestion === 'taux') {
        // Trouver le taux annuel
        const CnArrondi = Cn.toDecimalPlaces(0).toNumber()
        texte = `Un montant de $${texNombre(C0, 0)}$ CHF est placé pendant $${n}$ années avec capitalisation ${periodicite.nomAdj}. `
        texte += `Le solde final est de $${texNombre(CnArrondi, 0)}$ CHF. Déterminer le taux annuel en $\\%$.`

        // r = k * ((Cn/C0)^(1/(k*n)) - 1)
        const tauxTrouve = new Decimal(CnArrondi)
          .div(C0)
          .pow(new Decimal(1).div(nbPeriodes))
          .minus(1)
          .mul(k)
          .mul(100)
        reponse = tauxTrouve.toDecimalPlaces(0).toFixed(0)

        texteCorr = `Avec une capitalisation périodique, on a $C_n = C_0 \\cdot \\left(1 + \\dfrac{r}{k}\\right)^{kn}$ où :<br>`
        texteCorr += `$\\bullet$ $C_0 = ${texNombre(C0, 0)}$ CHF (capital initial)<br>`
        texteCorr += `$\\bullet$ $C_n = ${texNombre(CnArrondi, 0)}$ CHF (capital final)<br>`
        texteCorr += `$\\bullet$ $k = ${k}$ (capitalisation ${periodicite.nomAdj})<br>`
        texteCorr += `$\\bullet$ $n = ${n}$ ans (durée)<br>`
        texteCorr += `$\\bullet$ $r = ?$ (taux annuel recherché)<br><br>`
        texteCorr += `On isole $r$ :<br>`
        texteCorr += `$\\begin{aligned}\n`
        texteCorr += `\\left(1 + \\dfrac{r}{k}\\right)^{kn} &= \\dfrac{C_{n}}{C_0}\\\\\n`
        texteCorr += `1 + \\dfrac{r}{k} &= \\sqrt[kn]{\\dfrac{C_{n}}{C_0}}\\\\\n`
        texteCorr += `\\dfrac{r}{${k}} &= \\sqrt[${nbPeriodes}]{\\dfrac{${texNombre(CnArrondi, 0)}}{${texNombre(C0, 0)}}} - 1\\\\\n`
        texteCorr += `r &= ${k} \\cdot \\left(\\sqrt[${nbPeriodes}]{\\dfrac{${texNombre(CnArrondi, 0)}}{${texNombre(C0, 0)}}} - 1\\right)\\\\\n`
        texteCorr += `&\\approx ${texNombre(tauxTrouve.div(100), 3)}\n`
        texteCorr += `\\end{aligned}$<br><br>`
        texteCorr += `Le taux annuel recherché est donc d'environ $${miseEnEvidence(texNombre(tauxTrouve, 1))}\\,\\%$.`
      } else if (typeQuestion === 'interets') {
        // Calculer les intérêts
        texte = `Une somme de $${texNombre(C0, 0)}$ CHF est placée à $${tauxAnnuel.texFractionSimplifiee}\\,\\%$ annuel avec capitalisation ${periodicite.nomAdj} pendant $${n}$ années. `
        texte += `Calculer le montant des intérêts.`

        const interets = Cn.minus(C0)
        const resultat = interets.toDecimalPlaces(0)
        reponse = resultat.toFixed(0)

        texteCorr = `Avec une capitalisation périodique, on a $C_n = C_0 \\cdot \\left(1 + \\dfrac{r}{k}\\right)^{kn}$ où :<br>`
        texteCorr += `$\\bullet$ $C_0 = ${texNombre(C0, 0)}$ CHF (capital initial)<br>`
        texteCorr += `$\\bullet$ $r = ${tauxAnnuel.texFractionSimplifiee}\\,\\% = ${texNombre(tauxAnnuelDecimal, 2)}$ (taux annuel)<br>`
        texteCorr += `$\\bullet$ $k = ${k}$ (capitalisation ${periodicite.nomAdj})<br>`
        texteCorr += `$\\bullet$ $n = ${n}$ ans (durée)<br>`
        texteCorr += `$\\bullet$ $I = ?$ (intérêts recherchés)<br><br>`
        texteCorr += `Les intérêts sont $I = C_{${n}} - C_0$. Calculons d'abord $C_{${n}}$ :<br>`
        texteCorr += `$\\begin{aligned}\n`
        texteCorr += `C_{${n}} &= ${texNombre(C0, 0)} \\cdot \\left(1 + \\dfrac{${texNombre(tauxAnnuelDecimal, 2)}}{${k}}\\right)^{${nbPeriodes}}\\\\\n`
        texteCorr += `&\\approx ${texNombre(Cn, 0)}\\text{ CHF}\n`
        texteCorr += `\\end{aligned}$<br><br>`
        texteCorr += `Les intérêts gagnés sont :<br>`
        texteCorr += `$I = C_{${n}} - ${texNombre(C0, 0)} \\approx ${miseEnEvidence(texNombre(resultat, 0))}\\text{ CHF}$<br><br>`
        texteCorr += `Les intérêts gagnés s'élèvent à environ $${miseEnEvidence(texNombre(resultat, 0))}\\text{ CHF}$.`
      } else {
        // Trouver le capital initial
        const CnArrondi = Cn.toDecimalPlaces(0).toNumber()
        texte = `Quelle somme faut-il placer à $${tauxAnnuel.texFractionSimplifiee}\\,\\%$ annuel avec capitalisation ${periodicite.nomAdj} `
        texte += `pour obtenir $${texNombre(CnArrondi, 0)}$ CHF après $${n}$ années ?`

        const C0Trouve = new Decimal(CnArrondi).div(facteur.pow(nbPeriodes))
        reponse = C0Trouve.toDecimalPlaces(0).toFixed(0)

        texteCorr = `Avec une capitalisation périodique, on a $C_n = C_0 \\cdot \\left(1 + \\dfrac{r}{k}\\right)^{kn}$ où :<br>`
        texteCorr += `$\\bullet$ $C_n = ${texNombre(CnArrondi, 0)}$ CHF (capital final)<br>`
        texteCorr += `$\\bullet$ $r = ${tauxAnnuel.texFractionSimplifiee}\\,\\% = ${texNombre(tauxAnnuelDecimal, 2)}$ (taux annuel)<br>`
        texteCorr += `$\\bullet$ $k = ${k}$ (capitalisation ${periodicite.nomAdj})<br>`
        texteCorr += `$\\bullet$ $n = ${n}$ ans (durée)<br>`
        texteCorr += `$\\bullet$ $C_0 = ?$ (capital initial recherché)<br><br>`
        texteCorr += `On isole $C_0$ :<br>`
        texteCorr += `$\\begin{aligned}\n`
        texteCorr += `C_0 &= \\dfrac{C_n}{\\left(1 + \\dfrac{r}{k}\\right)^{kn}}\\\\\n`
        texteCorr += `&= \\dfrac{${texNombre(CnArrondi, 0)}}{(${texNombre(facteur, 6)})^{${nbPeriodes}}}\\\\\n`
        texteCorr += `&\\approx ${miseEnEvidence(texNombre(C0Trouve, 0))}\\text{ CHF}\n`
        texteCorr += `\\end{aligned}$<br><br>`
        texteCorr += `Le capital initial vaut environ $${miseEnEvidence(texNombre(C0Trouve, 0))}\\text{ CHF}$.`
      }

      // Champ interactif
      if (this.interactif) {
        const unite = typeQuestion === 'taux' ? '%' : 'CHF'
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

      if (this.questionJamaisPosee(i, C0, tauxAnnuelNum, k, n, typeQuestion)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
