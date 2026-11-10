import { amcConvert } from '../../lib/amc/amcBuilders'
import { ensureAmcParam } from '../../lib/amc/amcHelpers'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import {
  ajouteChampTexteMathLive,
  remplisLesBlancs,
} from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { texFractionFromString } from '../../lib/outils/deprecatedFractions'
import { miseEnEvidence, texteGras } from '../../lib/outils/embellissements'
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

export const titre = 'Compléter des égalités à trou multiplicatives'
export const dateDePublication = '07/07/2025'

/**
 * Compléter des égalités à trou multiplicatives
 * @author Éric Elter
 *
 */
export const uuid = 'e9ba3'

export const refs = {
  'fr-fr': ['6N3C', '6AutoF1-3'],
  'fr-2016': ['6N23-5b'],
  'fr-ch': ['9R1NO4C-3', '9R2NO4C-3', '9R3NO4C-3'],
}

export default class EgaliteATrousMultiplicatives extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Place de la fraction dans la multiplication',
      [
        'Nombres séparés par des tirets  :',
        '1 : Fraction en premier',
        '2 : Fraction en second',
        '3 : Mélange',
      ].join('\n'),
    ]

    this.besoinFormulaire2Texte = [
      'Nombre à trouver',
      [
        'Nombres séparés par des tirets  :',
        '1 : Facteur entier',
        '2 : Facteur fractionnaire',
        '3 : Numérateur de la fraction',
        '4 : Dénominateur de la fraction',
        '5 : Produit',
        '6 : Mélange',
      ].join('\n'),
    ]

    this.sup = '3'
    this.sup2 = '6'
    this.spacing = 2
    this.spacingCorr = 2
    this.nbQuestions = 8
    this.correctionDetaillee = false
    this.correctionDetailleeDisponible = true
    this.consigne = 'Compléter.'
  }

  nouvelleVersion() {
    const sensMultiplicationPossibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: 2,
      melange: 3,
      defaut: 3,
      nbQuestions: this.nbQuestions,
    })
    const sensMultiplication = combinaisonListes(
      sensMultiplicationPossibles.map(Number),
      this.nbQuestions,
    )

    const typesDeNombresCherches = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      max: 5,
      melange: 6,
      defaut: 6,
      nbQuestions: this.nbQuestions,
    })
    const typesDeNombres = combinaisonListes(
      typesDeNombresCherches.map(Number),
      this.nbQuestions,
    )

    let reponse

    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      texteCorr = ''

      let numerateur = randint(2, 20)
      let denominateur = randint(2, 20)

      while (!new FractionEtendue(numerateur, denominateur).estIrreductible) {
        numerateur = randint(2, 20)
        denominateur = randint(2, 20)
      }
      const fractionQuotient = new FractionEtendue(numerateur, denominateur)
        .texFraction

      texteCorr = this.correctionDetaillee
        ? `On sait que ${texteGras('le quotient de ')}$${miseEnEvidence('a', 'black')}$${texteGras(' par ')}$${miseEnEvidence('b', 'black')}$${texteGras(' est le nombre qui, multiplié par ')}$${miseEnEvidence('b', 'black')}$${texteGras(', donne ')}$${miseEnEvidence('a', 'black')}$${texteGras('.')}<br>
          En particulier, le quotient de $${texNombre(numerateur)}$ par $${texNombre(denominateur)}$ est le nombre qui, multiplié par $${texNombre(denominateur)}$, donne $${texNombre(numerateur)}$, alors :<br>`
        : ''

      switch (typesDeNombres[i]) {
        case 1:
          reponse = denominateur
          if (sensMultiplication[i] === 2) {
            texte = `$\\times${fractionQuotient}=${numerateur}$`

            if (this.interactif)
              texte = ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierNumbers,
                { texteApres: texte },
              )
            else texte = '$ \\ldots$' + sp() + texte
            texteCorr += `$${miseEnEvidence(denominateur)}\\times${fractionQuotient}=${numerateur}$`
          } else {
            texte = `$${fractionQuotient}\\times$`

            if (this.interactif)
              texte = ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierNumbers,
                { texteAvant: texte, texteApres: `$=${numerateur}$` },
              )
            else texte += sp() + '$ \\ldots$' + sp() + `$=${numerateur}$`
            texteCorr += `$${fractionQuotient}\\times${miseEnEvidence(denominateur)}=${numerateur}$`
          }
          break
        case 2:
          reponse = context.isAmc
            ? denominateur +
              (numerateur < 10
                ? arrondi(numerateur / 10)
                : arrondi(numerateur / 100))
            : fractionQuotient
          if (sensMultiplication[i] === 2) {
            texte = `$${denominateur}\\times$`

            if (this.interactif)
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierDeBaseAvecFraction,
                { texteApres: `$=${numerateur}$` },
              )
            else texte += sp() + '$ \\ldots$' + sp() + `$=${numerateur}$`
            texteCorr += `$${denominateur}\\times${miseEnEvidence(fractionQuotient)}=${numerateur}$`
          } else {
            texte = `$\\times${denominateur}=${numerateur}$`

            if (this.interactif)
              texte = ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierDeBaseAvecFraction,
                { texteApres: texte },
              )
            else texte = '$ \\ldots$' + sp() + texte
            texteCorr += `$${miseEnEvidence(fractionQuotient)}\\times${denominateur}=${numerateur}$`
          }
          break
        case 3:
          reponse = numerateur
          if (sensMultiplication[i] === 2) {
            texte = `$${denominateur}\\times$`
            texte += this.interactif
              ? remplisLesBlancs(
                  this,
                  i,
                  `$\\dfrac{%{champ1}}{${texNombre(denominateur)}}=${numerateur}`,
                  KeyboardType.clavierNumbers,
                  '\\ldots\\ldots',
                )
              : `$\\dfrac{\\ldots}{${denominateur}}$` +
                sp() +
                `$=${numerateur}$`

            texteCorr += `$${denominateur}\\times${texFractionFromString(miseEnEvidence(numerateur), denominateur)}=${numerateur}$`
          } else {
            texte = this.interactif
              ? remplisLesBlancs(
                  this,
                  i,
                  `$\\dfrac{%{champ1}}{${texNombre(denominateur)}}\\times${denominateur}=${numerateur}`,
                  KeyboardType.clavierNumbers,
                  '\\ldots\\ldots',
                )
              : `$\\dfrac{\\ldots}{${denominateur}}$` +
                sp() +
                `$\\times${denominateur}=${numerateur}$`

            texteCorr += `$${texFractionFromString(miseEnEvidence(numerateur), denominateur)}\\times${denominateur}=${numerateur}$`
          }
          break
        case 4:
          reponse = denominateur
          if (sensMultiplication[i] === 2) {
            texte = `$${denominateur}\\times$`
            texte += this.interactif
              ? remplisLesBlancs(
                  this,
                  i,
                  `$\\dfrac{${texNombre(numerateur)}}{%{champ1}}=${numerateur}`,
                  KeyboardType.clavierNumbers,
                  '\\ldots\\ldots',
                )
              : `$\\dfrac{${numerateur}}{\\ldots}$` + sp() + `$=${numerateur}$`

            texteCorr += `$${denominateur}\\times${texFractionFromString(numerateur, miseEnEvidence(denominateur))}=${numerateur}$`
          } else {
            texte = this.interactif
              ? remplisLesBlancs(
                  this,
                  i,
                  `$\\dfrac{${texNombre(numerateur)}}{%{champ1}}\\times${denominateur}=${numerateur}`,
                  KeyboardType.clavierNumbers,
                  '\\ldots\\ldots',
                )
              : `$\\dfrac{${numerateur}}{\\ldots}$` +
                sp() +
                `$\\times${denominateur}=${numerateur}$`

            texteCorr += `$${texFractionFromString(numerateur, miseEnEvidence(denominateur))}\\times${denominateur}=${numerateur}$`
          }
          break
        case 5:
        default:
          reponse = numerateur

          texte =
            sensMultiplication[i] === 2
              ? `$${denominateur}\\times${fractionQuotient}=$`
              : (texte = `$${fractionQuotient}\\times${denominateur}=$`)

          texte += this.interactif
            ? ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)
            : sp() + '$ \\ldots$'

          texteCorr = this.correctionDetaillee
            ? `On sait que ${texteGras('le quotient de ')}$${miseEnEvidence('a', 'black')}$${texteGras(' par ')}$${miseEnEvidence('b', 'black')}$${texteGras(' est le nombre qui, multiplié par ')}$${miseEnEvidence('b', 'black')}$${texteGras(', donne ')}$${miseEnEvidence('a', 'black')}$${texteGras('.')}<br>
          En particulier, le quotient de $${texNombre(numerateur)}$ par $${texNombre(denominateur)}$ est le nombre qui, multiplié par $${texNombre(denominateur)}$, donne $${texNombre(numerateur)}$, alors :<br>`
            : ''

          texteCorr +=
            sensMultiplication[i] === 2
              ? `$${denominateur}\\times${fractionQuotient}=${miseEnEvidence(numerateur)}$`
              : (texteCorr += `$${fractionQuotient}\\times${denominateur}=${miseEnEvidence(numerateur)}$`)
      }
      if (this.correctionDetaillee) texteCorr += '.'
      if (typesDeNombres[i] !== 3 && typesDeNombres[i] !== 4) {
        handleAnswers(this, i, {
          reponse: {
            value: reponse,
            options: { fractionEgale: true, nombreDecimalSeulement: true },
          },
        })
      } else {
        handleAnswers(
          this,
          i,
          {
            champ1: { value: reponse },
          },
          { formatInteractif: 'fillInTheBlank' },
        )
      }

      if (context.isAmc) {
        this.autoCorrectionAMC[i].enonce = texte
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        this.autoCorrectionAMC[i].propositions = [{ texte: texteCorr }]
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        const amcParam = ensureAmcParam(this, i)
        amcParam.digits =
          nombreDeChiffresDansLaPartieEntiere(Number(reponse)) + randint(0, 1)
        amcParam.decimals = nombreDeChiffresDansLaPartieDecimale(
          Number(reponse),
        )
        amcParam.signe = false
        amcParam.exposantNbChiffres = 0
      }
      if (this.questionJamaisPosee(i, numerateur, denominateur)) {
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
