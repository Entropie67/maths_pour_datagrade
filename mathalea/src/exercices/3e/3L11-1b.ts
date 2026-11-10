import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import {
  listeQuestionsToContenuSansNumero,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

import { amcConvert } from '../../lib/amc/amcBuilders'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import {
  doubleDeveloppement,
  reduirePolynomeDegre3,
} from '../../lib/outils/ecritures'
import { abs } from '../../lib/outils/nombres'

export const titre = 'Effectuer la double distributivité'
export const dateDePublication = '03/02/2025'
export const interactifReady = true

export const amcType = 'AMCHybride'
export const amcReady = true

/**
 * Développer des expressions de la forme (ax+b)(cx+d) avec a, b, c et d relatifs et paramétrables ainsi que x
 * @author Éric Elter (Fork 3L11-1 de Jean-claude Lhote)
 */
export const uuid = '67396'

export const refs = {
  'fr-fr': ['3L11-1b'],
  'fr-ch': ['1mCL1-2', '11LCFA3F-2', '11LSFA3F-2', 'PRQAL03D-2'],
}

export default class MultipleDistributivite extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Signe de $a$',
      3,
      '1 : Positif\n2 : Négatif \n3 : Hasard',
    ]
    this.besoinFormulaire2Numerique = [
      'Signe de $b$',
      3,
      '1 : Positif\n2 : Négatif \n3 : Hasard',
    ]
    this.besoinFormulaire3Numerique = [
      'Signe de $c$',
      3,
      '1 : Positif\n2 : Négatif \n3 : Hasard',
    ]
    this.besoinFormulaire4Numerique = [
      'Signe de $d$',
      3,
      '1 : Positif\n2 : Négatif \n3 : Hasard',
    ]
    this.besoinFormulaire5CaseACocher = [
      'Uniquement avec la variable $x$',
      false,
    ]
    this.sup = 3
    this.sup2 = 3
    this.sup3 = 3
    this.sup4 = 3
    this.comment = 'Les expressions sont toutes de la forme $(ax+b)(cx+d)$.<br>'
    this.comment +=
      'Le paramétrage permet de choisir finement les signes des coefficients et de modifier le nom de la variable $x$.'
    this.spacing = 2
    this.spacingCorr = 2
    this.nbQuestions = 4

    this.listeAvecNumerotation = false
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions > 1
        ? 'Développer et réduire les expressions suivantes.'
        : "Développer et réduire l'expression suivante."

    for (
      let i = 0, reponse, cpt = 0, a, b, c, d;
      i < this.nbQuestions && cpt < 50;
    ) {
      a =
        randint(1, 9) *
        (this.sup === 1 ? 1 : this.sup === 2 ? -1 : choice([1, -1]))
      b =
        randint(1, 9) *
        (this.sup2 === 1 ? 1 : this.sup2 === 2 ? -1 : choice([1, -1]))
      c =
        randint(1, 9, [abs(a)]) *
        (this.sup3 === 1 ? 1 : this.sup3 === 2 ? -1 : choice([1, -1]))
      d =
        randint(1, 9, [abs(b)]) *
        (this.sup4 === 1 ? 1 : this.sup4 === 2 ? -1 : choice([1, -1]))
      let reponse1 = 0
      let reponse2 = 0
      let reponse3 = 0
      let texteCorr = ''
      let texte = ''
      const variable = this.sup5
        ? 'x'
        : choice(['x', 'y', 'z', 'a', 'b', 'c', 'n', 'k'])
      texte = `$${lettreDepuisChiffre(i + 1)} = (${reduirePolynomeDegre3(0, 0, a, b, variable)})(${reduirePolynomeDegre3(0, 0, c, d, variable)})$`
      texteCorr = texte.slice(0, -1)
      texteCorr += `= ${doubleDeveloppement({ a, b, c, d, x: variable })[0]}`
      texteCorr += `=${doubleDeveloppement({ a, b, c, d, x: variable })[1]}`
      reponse1 = a * c
      reponse2 = a * d + b * c
      reponse3 = b * d

      reponse = reduirePolynomeDegre3(0, reponse1, reponse2, reponse3, variable)
      texteCorr += `=${reponse}$`

      // On enlève la première égalité pour ne pas avoir A = A en première ligne
      texteCorr = texteCorr.slice(4)
      // On découpe
      const etapes = texteCorr.split('=')
      texteCorr = ''
      for (const etape of etapes) {
        const etapeModifiee = etape.replace('$', '')
        texteCorr +=
          etapeModifiee === lettreDepuisChiffre(i + 1)
            ? ''
            : `$${lettreDepuisChiffre(i + 1)} = ${etapeModifiee}$ <br>`
      }

      // Uniformisation : Mise en place de la réponse attendue en interactif en orange et gras
      const textCorrSplit = texteCorr.split('=')
      let aRemplacer = textCorrSplit[textCorrSplit.length - 1]
      aRemplacer = aRemplacer.replace('$', '').replace('<br>', '')

      texteCorr = ''
      for (let ee = 0; ee < textCorrSplit.length - 1; ee++) {
        texteCorr += `${textCorrSplit[ee]}=`
      }
      texteCorr += `$ $${miseEnEvidence(aRemplacer)}$`
      // Fin de cette uniformisation

      handleAnswers(this, i, {
        reponse: {
          value: reponse,
          options: { expressionsForcementReduites: true },
        },
      })
      texte += ajouteChampTexteMathLive(
        this,
        i,
        KeyboardType.clavierDeBaseAvecVariable,
        { texteAvant: ' $=$' },
      )

      if (context.isAmc) {
        this.autoCorrectionAMC[i] = {
          enonce: '',
          enonceAvant: false,
          options: { multicols: true, barreseparation: true },
          propositions: [
            {
              type: 'AMCOpen',
              propositions: [
                {
                  texte: texteCorr,
                  enonce: `${texte}<br>`,
                  statut: 4,
                },
              ],
            },
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  statut: '',
                  reponse: {
                    texte: 'valeur de $a$ dans $ax^2+bx+c$',
                    valeur: reponse1,
                    param: {
                      digits: 2,
                      decimals: 0,
                      signe: true,
                      approx: 0,
                    },
                  },
                },
              ],
            },
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  statut: '',
                  reponse: {
                    texte: 'valeur de $b$ dans $ax^2+bx+c$',
                    valeur: reponse2,
                    param: {
                      digits: 2,
                      decimals: 0,
                      signe: true,
                      approx: 0,
                    },
                  },
                },
              ],
            },
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  statut: '',
                  reponse: {
                    texte: 'valeur de $c$ dans $ax^2+bx+c$',
                    valeur: reponse3,
                    param: {
                      digits: 2,
                      decimals: 0,
                      signe: true,
                      approx: 0,
                    },
                  },
                },
              ],
            },
          ],
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      }
      if (this.questionJamaisPosee(i, a, b, c, d)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenuSansNumero(this)
  }
}
