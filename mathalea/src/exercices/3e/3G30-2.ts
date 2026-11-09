import Decimal from 'decimal.js'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { stringNombre } from '../../lib/outils/texNombre'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Résoudre une équation trigonométrique'
export const dateDePublication = '20/11/2023'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDeModifImportante = '25/03/2026'

/**
 * Résoudre une équation trigonométrique
 * @author Rémi Angot
 */
export const uuid = 'e13e3'

export const refs = {
  'fr-fr': ['3G30-2'],
  'fr-ch': ['1mT-4'],
}

class EquationTrigo extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.spacingCorr = 3
    this.sup = '4'
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets  :',
        "1 : Recherche d'une longueur au numérateur",
        "2 : Recherche d'une longueur au dénominateur",
        "3 : Recherche d'un angle",
        '4 : Mélange',
      ].join('\n'),
    ]
  }

  nouvelleVersion(): void {
    // type TypeQuestionsDisponibles = 'num' | 'den' | 'angle'
    type Trigo = 'cos' | 'sin' | 'tan'
    // let typeQuestionsDisponibles: TypeQuestionsDisponibles[]

    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: this.nbQuestions,
      listeOfCase: ['num', 'den', 'angle'],
    })
    const listeTypeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    const typeFormuleTrigo = ['cos', 'sin', 'tan'] as Trigo[]

    const listeFonctions = combinaisonListes(
      typeFormuleTrigo,
      this.nbQuestions,
    ) as Trigo[]
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      // Lettre entre A et X
      const indicFirstLetter = 65 + Math.floor(Math.random() * 24)
      const nomA = String.fromCharCode(indicFirstLetter)
      const nomB = String.fromCharCode(indicFirstLetter + 1)
      const nomC = String.fromCharCode(indicFirstLetter + 2)
      let texte = `Dans le triangle rectangle $${nomA}${nomB}${nomC}$, on a : `
      const lAB = new Decimal(randint(30, 90)).div(10)
      let lBC: Decimal
      let reponse = 0
      const angle = randint(25, 75)
      const cosSinTan = listeFonctions[i]
      let texteCorr = ''

      switch (listeTypeQuestions[i]) {
        case 'den':
          texte += `$\\${cosSinTan}\\left( ${angle} ^\\circ \\right) = \\dfrac{${stringNombre(lAB, 1)}}{${nomA}${nomC}}$.<br>`
          switch (cosSinTan) {
            case 'cos':
              reponse = lAB
                .div(new Decimal(Math.cos((angle * Math.PI) / 180)))
                .times(10)
                .round()
                .div(10)
                .toNumber()
              break
            case 'sin':
              reponse = lAB
                .div(new Decimal(Math.sin((angle * Math.PI) / 180)))
                .times(10)
                .round()
                .div(10)
                .toNumber()
              break
            case 'tan':
              reponse = lAB
                .div(new Decimal(Math.tan((angle * Math.PI) / 180)))
                .times(10)
                .round()
                .div(10)
                .toNumber()
              break
          }
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
              {
                texteAvant: `$${nomA}${nomC} \\approx$`,
                texteApres: sp(10) + ' (valeur approchée au dixième près)',
              },
            )
          } else {
            texte += `Calculer la longueur $${nomA}${nomC}$ (au dixième près).`
          }
          texteCorr = `$\\${cosSinTan}\\left( ${angle} ^\\circ \\right) = \\dfrac{${stringNombre(lAB, 1)}}{${nomA}${nomC}}$<br>
          $${nomA}${nomC} = \\dfrac{${stringNombre(lAB, 1)}}{\\${cosSinTan}\\left( ${angle} ^\\circ \\right)}$<br>
          $${nomA}${nomC} \\approx ${miseEnEvidence(stringNombre(reponse, 1))}$`
          break
        case 'num':
          texte += `$\\${cosSinTan}\\left( ${angle} ^\\circ \\right) = \\dfrac{${nomA}${nomC}}{${stringNombre(lAB, 1)}}$.<br>`
          switch (cosSinTan) {
            case 'cos':
              reponse = lAB
                .times(new Decimal(Math.cos((angle * Math.PI) / 180)))
                .times(10)
                .round()
                .div(10)
                .toNumber()
              break
            case 'sin':
              reponse = lAB
                .times(new Decimal(Math.sin((angle * Math.PI) / 180)))
                .times(10)
                .round()
                .div(10)
                .toNumber()
              break
            case 'tan':
              reponse = lAB
                .times(new Decimal(Math.tan((angle * Math.PI) / 180)))
                .times(10)
                .round()
                .div(10)
                .toNumber()
              break
          }
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
              {
                texteAvant: `$${nomA}${nomC} \\approx$`,
                texteApres: sp(10) + ' (valeur approchée au dixième près)',
              },
            )
          } else {
            texte += `Calculer la longueur $${nomA}${nomC}$ (au dixième près).`
          }
          texteCorr = `$\\${cosSinTan}\\left( ${angle} ^\\circ \\right) = \\dfrac{${nomA}${nomC}}{${stringNombre(lAB, 1)}}$<br>
          $${nomA}${nomC} = ${stringNombre(lAB, 1)} \\times \\${cosSinTan}\\left( ${angle} ^\\circ \\right) $<br>
          $${nomA}${nomC} \\approx ${miseEnEvidence(stringNombre(reponse, 1))}$`
          break
        case 'angle':
          lBC = new Decimal(
            randint(lAB.times(10).toNumber() + 1, 120, [
              2 * lAB.times(10).toNumber(),
            ]),
          ).div(10)

          texte += `$\\${cosSinTan}\\left( \\widehat{${nomA}${nomB}${nomC}} \\right) = \\dfrac{${stringNombre(lAB, 1)}}{${stringNombre(lBC, 1)}}$.<br>`
          switch (cosSinTan) {
            case 'cos':
              reponse = Math.round(
                (Math.acos(lAB.div(lBC).toNumber()) * 180) / Math.PI,
              )
              break
            case 'sin':
              reponse = Math.round(
                (Math.asin(lAB.div(lBC).toNumber()) * 180) / Math.PI,
              )
              break
            case 'tan':
              reponse = Math.round(
                (Math.atan(lAB.div(lBC).toNumber()) * 180) / Math.PI,
              )
              break
          }
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
              {
                texteAvant: `$\\widehat{${nomA}${nomB}${nomC}}\\approx$`,
                texteApres: '°' + sp(10) + ' (valeur approchée au degré près)',
              },
            )
          } else {
            texte += `Calculer la mesure l'angle $\\widehat{${nomA}${nomB}${nomC}}$ (au degré près).`
          }
          texteCorr = `$\\${cosSinTan}\\left( \\widehat{${nomA}${nomB}${nomC}} \\right) = \\dfrac{${stringNombre(lAB, 1)}}{${stringNombre(lBC, 1)}}$<br>
          $\\widehat{${nomA}${nomB}${nomC}} = \\arc${cosSinTan} \\left( \\dfrac{${stringNombre(lAB, 1)}}{${stringNombre(lBC, 1)}} \\right)$<br>
          $\\widehat{${nomA}${nomB}${nomC}} \\approx ${miseEnEvidence(stringNombre(reponse, 0))}^\\circ$`
          break
      }
      handleAnswers(this, i, { reponse: { value: reponse } })
      if (this.questionJamaisPosee(i, cosSinTan, angle, lAB.toFixed(1))) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
  }
}

export default EquationTrigo
