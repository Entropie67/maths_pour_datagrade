import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import { choice } from '../../../lib/outils/arrayOutils'
import {
    ecritureAlgebrique,
    ecritureAlgebriqueSauf1,
    rienSi1,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import {
    gestionnaireFormulaireTexte,
    listeQuestionsToContenu,
    randint,
} from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = 'Résoudre des équations exponentielles'
export const dateDePublication = '18/02/2026'
export const interactifReady = true

export const uuid = 'rvjcl'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['2mLogExp-12'],
}

/**
 * Équations exponentielles
 * @author Nathan Scheinmann
 */
export default class EquationsExponentielles extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.spacingCorr = 2
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : Équations exponentielles simples',
        '2 : Équations exponentielles mixtes',
        '3 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire2CaseACocher = ['Logarithme népérien (ln)', false]
    this.sup = '3'
    this.sup2 = false
  }

  nouvelleVersion() {
    const logString = this.sup2 ? '\\ln' : '\\log'

    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 2,
      melange: 3,
      defaut: 3,
      listeOfCase: ['expoSimple', 'expoMixte'],
      nbQuestions: this.nbQuestions,
      shuffle: true,
    })

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let reponse = ''
      let cleUnique = ''

      const typeQuestion = listeTypeDeQuestions[i]

      if (typeQuestion === 'expoSimple') {
        const variante = choice(['simple', 'coef', 'produit'])

        if (variante === 'simple') {
          // a^x = b
          const a = choice([2, 3, 5, 6, 7, 11, 13])
          const b = randint(10, 200)

          cleUnique = `expo-simple-${a}-${b}`

          const resultat = new Decimal(b).ln().div(new Decimal(a).ln())
          const resultatArrondi = resultat.toDecimalPlaces(3)

          texte = `Résoudre l'équation $${a}^x = ${b}$.`
          texte += ` Arrondir la solution au millième près.`

          reponse = resultatArrondi.toFixed(3)
          texteCorr = `Notons que le domaine de l'équation est $\\mathbb{R}$<br>`
          texteCorr += `Résolvons l'équation en appliquant le logarithme aux deux membres :<br>`
          texteCorr += `$\\begin{aligned}\n`
          texteCorr += `\\iff &${logString}(${a}^x) = ${logString}(${b})\\\\\n`
          texteCorr += `\\iff &x \\times ${logString}(${a}) = ${logString}(${b})\\\\\n`
          texteCorr += `\\iff &x = \\dfrac{${logString}(${b})}{${logString}(${a})}\\\\\n`
          texteCorr += `\\iff &x \\approx ${miseEnEvidence(texNombre(resultatArrondi, 3, true))}\n`
          texteCorr += `\\end{aligned}$<br>`
          texteCorr += `$S \\approx ${miseEnEvidence(`\\left\\{${texNombre(resultatArrondi, 3, true)}\\right\\}`)}$`
        } else if (variante === 'coef') {
          // a^(mx) = b
          const a = choice([2, 3, 5, 7])
          const m = randint(2, 5)
          const b = randint(10, 100)

          cleUnique = `expo-coef-${a}-${m}-${b}`

          const resultat = new Decimal(b)
            .ln()
            .div(new Decimal(m).mul(new Decimal(a).ln()))
          const resultatArrondi = resultat.toDecimalPlaces(3)

          texte = `Résoudre l'équation $${a}^{${m}x} = ${b}$.`
          texte += ` Arrondir la solution au millième près.`

          reponse = resultatArrondi.toFixed(3)

          texteCorr = `Notons que le domaine de l'équation est $\\mathbb{R}$<br>`
          texteCorr += `Résolvons l'équation en appliquant le logarithme aux deux membres :<br>`
          texteCorr += `$\\begin{aligned}\n`
          texteCorr += `\\iff &${logString}(${a}^{${m}x}) = ${logString}(${b})\\\\\n`
          texteCorr += `\\iff &${m}x \\times ${logString}(${a}) = ${logString}(${b})\\\\\n`
          texteCorr += `\\iff &x = \\dfrac{${logString}(${b})}{${m} \\times ${logString}(${a})}\\\\\n`
          texteCorr += `\\iff &x \\approx ${miseEnEvidence(texNombre(resultatArrondi, 3, true))}\n`
          texteCorr += `\\end{aligned}$<br>`
          texteCorr += `$S \\approx ${miseEnEvidence(`\\left\\{${texNombre(resultatArrondi, 3, true)}\\right\\}`)}$`
        } else {
          // a^x · b^x = c
          const a = choice([2, 3, 5])
          const b = choice([2, 3, 5, 7], [a])
          const c = randint(20, 500)

          cleUnique = `expo-produit-${a}-${b}-${c}`

          const produit = a * b
          const resultat = new Decimal(c).ln().div(new Decimal(produit).ln())
          const resultatArrondi = resultat.toDecimalPlaces(3)

          texte = `Résoudre l'équation $${a}^x \\times ${b}^x = ${c}$.`
          texte += ` Arrondir la solution au millième près.`

          reponse = resultatArrondi.toFixed(3)
          texteCorr = `Notons que le domaine de l'équation est $\\mathbb{R}$<br>`
          texteCorr += `Résolvons l'équation en utilisant la propriété $a^x \\times b^x = (a\\times b)^x$ :<br>`
          texteCorr += `$\\begin{aligned}\n`
          texteCorr += `\\iff &(${a} \\times ${b})^x = ${c}\\\\\n`
          texteCorr += `\\iff &${produit}^x = ${c}\\\\\n`
          texteCorr += `\\end{aligned}$<br>`
          texteCorr += `On applique le logarithme aux deux membres :<br>`
          texteCorr += `$\\begin{aligned}\n`
          texteCorr += `\\iff &${logString}(${produit}^x) = ${logString}(${c})\\\\\n`
          texteCorr += `\\iff &x \\times ${logString}(${produit}) = ${logString}(${c})\\\\\n`
          texteCorr += `\\iff &x = \\dfrac{${logString}(${c})}{${logString}(${produit})}\\\\\n`
          texteCorr += `\\iff &x \\approx ${miseEnEvidence(texNombre(resultatArrondi, 3, true))}\n`
          texteCorr += `\\end{aligned}$<br>`
          texteCorr += `$S \\approx ${miseEnEvidence(`\\left\\{${texNombre(resultatArrondi, 3, true)}\\right\\}`)}$`
        }
      } else {
        // Équations exponentielles mixtes a^(mx+n) = b^(px+q)
        const bases = [2, 3, 5, 7, 11]
        let baseA: number
        let baseB: number
        let m: number
        let n: number
        let p: number
        let q: number
        let logA: Decimal
        let logB: Decimal
        let denominateur: Decimal
        let numerateur: Decimal
        let resultat: Decimal

        do {
          baseA = choice(bases)
          do {
            baseB = choice(bases)
          } while (baseB === baseA)

          m = randint(1, 4)
          n = randint(-3, 3)
          p = randint(1, 4, [m])
          q = randint(-3, 3)

          logA = new Decimal(baseA).ln()
          logB = new Decimal(baseB).ln()
          numerateur = new Decimal(q).mul(logB).minus(new Decimal(n).mul(logA))
          denominateur = new Decimal(m)
            .mul(logA)
            .minus(new Decimal(p).mul(logB))
          resultat = numerateur.div(denominateur)
        } while (
          denominateur.abs().lessThan(0.5) ||
          resultat.abs().greaterThan(20)
        )

        cleUnique = `expo-mixte-${baseA}-${baseB}-${m}-${n}-${p}-${q}`

        const resultatArrondi = resultat.toDecimalPlaces(3)

        const afficherCoefM = rienSi1(m)
        const afficherCoefP = rienSi1(p)
        const afficherExposantA =
          n === 0
            ? `${afficherCoefM}x`
            : `${afficherCoefM}x${ecritureAlgebrique(n)}`
        const afficherExposantB =
          q === 0
            ? `${afficherCoefP}x`
            : `${afficherCoefP}x${ecritureAlgebrique(q)}`

        texte = `Résoudre l'équation $${baseA}^{${afficherExposantA}} = ${baseB}^{${afficherExposantB}}$.`
        texte += ` Arrondir la solution au millième près.`

        reponse = resultatArrondi.toFixed(3)

        texteCorr = `Notons que le domaine de l'équation est $\\mathbb{R}$<br>`
        texteCorr += `Résolvons l'équation en appliquant le logarithme aux deux membres :<br>`
        texteCorr += `$\\begin{aligned}\n`
        texteCorr += `\\iff &${logString}(${baseA}^{${afficherExposantA}}) = ${logString}(${baseB}^{${afficherExposantB}})\\\\\n`
        texteCorr += `\\iff &(${afficherExposantA}) \\times ${logString}(${baseA}) = (${afficherExposantB}) \\times ${logString}(${baseB})\n`
        texteCorr += `\\end{aligned}$<br>`

        // Expansion step
        texteCorr += `En développant et regroupant les termes en $x$ :<br>`
        texteCorr += `$\\begin{aligned}\n`

        // Expanded form: mx·log(a) + n·log(a) = px·log(b) + q·log(b)
        let expandLHS = `${rienSi1(m)}x \\times ${logString}(${baseA})`
        if (n !== 0)
          expandLHS += ` ${ecritureAlgebriqueSauf1(n)}${logString}(${baseA})`
        let expandRHS = `${rienSi1(p)}x \\times ${logString}(${baseB})`
        if (q !== 0)
          expandRHS += ` ${ecritureAlgebriqueSauf1(q)}${logString}(${baseB})`
        texteCorr += `\\iff &${expandLHS} = ${expandRHS}\\\\\n`

        // Regrouping step: mx·log(a) - px·log(b) = q·log(b) - n·log(a)
        const regroupLHS = `${rienSi1(m)}x \\times ${logString}(${baseA}) ${ecritureAlgebriqueSauf1(-p)}x \\times ${logString}(${baseB})`
        let regroupRHS: string
        if (q !== 0 && n !== 0) {
          regroupRHS = `${rienSi1(q)}${logString}(${baseB}) ${ecritureAlgebriqueSauf1(-n)}${logString}(${baseA})`
        } else if (q !== 0) {
          regroupRHS = `${rienSi1(q)}${logString}(${baseB})`
        } else if (n !== 0) {
          regroupRHS = `${rienSi1(-n)}${logString}(${baseA})`
        } else {
          regroupRHS = '0'
        }
        texteCorr += `\\iff &${regroupLHS} = ${regroupRHS}\\\\\n`

        // Factor x out: x·(m·log(a) - p·log(b)) = q·log(b) - n·log(a)
        const factorCoef = `${rienSi1(m)}${logString}(${baseA}) ${ecritureAlgebriqueSauf1(-p)}${logString}(${baseB})`
        texteCorr += `\\iff &x \\left(${factorCoef}\\right) = ${regroupRHS}\\\\\n`

        // Divide
        texteCorr += `\\iff &x = \\dfrac{${regroupRHS}}{${factorCoef}}\\\\\n`
        texteCorr += `\\iff &x \\approx ${miseEnEvidence(texNombre(resultatArrondi, 3, true))}\n`
        texteCorr += `\\end{aligned}$<br>`
        texteCorr += `$S \\approx ${miseEnEvidence(`\\left\\{${texNombre(resultatArrondi, 3, true)}\\right\\}`)}$`
      }

      if (this.interactif) {
        texte += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierEnsemble,
          {
            texteAvant: '<br>$S \\approx$ ',
          },
        )
        handleAnswers(this, i, {
          reponse: {
            value: `\\{${reponse}\\}`,
            options: { ensembleDeNombres: true },
          },
        })
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
