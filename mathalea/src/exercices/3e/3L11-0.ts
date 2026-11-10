import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenuSansNumero,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

import { amcConvert } from '../../lib/amc/amcBuilders'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import {
  ecritureParentheseSiMoins,
  ecritureParentheseSiNegatif,
  reduirePolynomeDegre3,
  rienSi1,
  simpleDeveloppement,
  simpleDeveloppementAvecDoubleX,
} from '../../lib/outils/ecritures'

export const titre = 'Effectuer la simple distributivité'
export const dateDePublication = '03/02/2025'
export const interactifReady = true

export const amcType = 'AMCHybride'
export const amcReady = true

/**
 * Développer des expressions de la forme (ax+b)c ou (ax+b)c ou (ax+b)cx ou cx(ax+b) avec a, b, c relatifs et paramétrables ainsi que x
 * @author Éric Elter (modifié par Rémi Angot 10/10/2025 pour utiliser combinaisonListes)
 */
export const uuid = 'f61d9'

export const refs = {
  'fr-fr': ['3L11-0'],
  'fr-ch': ['1mCL1-1', '10LCFA4E-4', '10LSFA4E-4', 'PRQAL03C-2'],
}

export default class SimpleDistributivite extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      "Type d'expressions",
      'Nombres séparés par des tirets :\n1 : c(ax+b)\n2 : (ax+b)*c\n3 : cx(ax+b) \n4 : (ax+b)*cx\n5 : Mélange',
    ]
    this.besoinFormulaire2Numerique = [
      'Signe de $a$',
      3,
      '1 : Positif\n2 : Négatif \n3 : Hasard',
    ]
    this.besoinFormulaire3Numerique = [
      'Signe de $b$',
      3,
      '1 : Positif\n2 : Négatif \n3 : Hasard',
    ]
    this.besoinFormulaire4Numerique = [
      'Signe de $c$',
      3,
      '1 : Positif\n2 : Négatif \n3 : Hasard',
    ]
    this.besoinFormulaire5CaseACocher = [
      'Uniquement avec la variable $x$',
      false,
    ]
    this.sup = 5
    this.sup2 = 3
    this.sup3 = 3
    this.sup4 = 3
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

    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 4,
      melange: 5,
      defaut: 5,
      nbQuestions: this.nbQuestions,
    })
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    let signesa: (-1 | 1)[] = []
    if (this.sup2 === 1) {
      signesa = Array.from({ length: this.nbQuestions }, () => 1)
    } else if (this.sup2 === 2) {
      signesa = Array.from({ length: this.nbQuestions }, () => -1)
    } else {
      signesa = combinaisonListes([-1, 1], this.nbQuestions)
    }
    let signesb: (-1 | 1)[] = []
    if (this.sup3 === 1) {
      signesb = Array.from({ length: this.nbQuestions }, () => 1)
    } else if (this.sup3 === 2) {
      signesb = Array.from({ length: this.nbQuestions }, () => -1)
    } else {
      signesb = combinaisonListes([-1, 1], this.nbQuestions)
    }
    let signesc: (-1 | 1)[] = []
    if (this.sup4 === 1) {
      signesc = Array.from({ length: this.nbQuestions }, () => 1)
    } else if (this.sup4 === 2) {
      signesc = Array.from({ length: this.nbQuestions }, () => -1)
    } else {
      signesc = combinaisonListes([-1, 1], this.nbQuestions)
    }

    for (
      let i = 0, reponse, cpt = 0, a, b, c;
      i < this.nbQuestions && cpt < 50;
    ) {
      a = randint(1, 9) * signesa[i]
      b = randint(1, 9) * signesb[i]
      c = randint(2, 9) * signesc[i]
      let reponse1 = 0
      let reponse2 = 0
      let texteCorr = ''
      let texte = ''
      const variable = this.sup5
        ? 'x'
        : choice(['x', 'y', 'z', 'a', 'b', 'c', 'n', 'k'])
      texte = `$${lettreDepuisChiffre(i + 1)} = `
      const typeDeQuestions = parseInt(listeTypeDeQuestions[i].toString())
      switch (typeDeQuestions) {
        case 1:
          texte += `${c} (${reduirePolynomeDegre3(0, 0, a, b, variable)})$`
          break
        case 2:
          texte += `(${reduirePolynomeDegre3(0, 0, a, b, variable)})\\times ${ecritureParentheseSiNegatif(c)} $`
          break
        case 3:
          texte += `${c}${variable} (${reduirePolynomeDegre3(0, 0, a, b, variable)})$`
          break
        default:
          texte += `(${reduirePolynomeDegre3(0, 0, a, b, variable)}) \\times ${ecritureParentheseSiMoins(rienSi1(c) + variable)} $`
          break
      }
      texteCorr = texte.slice(0, -1)
      reponse1 = a * c
      reponse2 = b * c
      if (typeDeQuestions < 3) {
        texteCorr += `= ${simpleDeveloppement({ a, b, c, x: variable, sommeAGauche: typeDeQuestions === 2 })[0]}`
        texteCorr += `= ${simpleDeveloppement({ a, b, c, x: variable, sommeAGauche: typeDeQuestions === 2 })[1]}`
        reponse = reduirePolynomeDegre3(0, 0, reponse1, reponse2, variable)
      } else {
        texteCorr += `= ${simpleDeveloppementAvecDoubleX({ a, b, c, x: variable, sommeAGauche: typeDeQuestions === 4 })[0]}`
        texteCorr += `= ${simpleDeveloppementAvecDoubleX({ a, b, c, x: variable, sommeAGauche: typeDeQuestions === 4 })[1]}`
        reponse = reduirePolynomeDegre3(0, reponse1, reponse2, 0, variable)
      }
      texteCorr += reponse2 > 0 ? '$' : `=${reponse}$`

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
          ],
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        if (typeDeQuestions < 3) {
          this.autoCorrectionAMC[i].propositions?.push(
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  statut: '',
                  reponse: {
                    texte: 'valeur de $a$ dans $ax+b$',
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
                    texte: 'valeur de $b$ dans $ax+b$',
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
          )
        } else {
          this.autoCorrectionAMC[i].propositions?.push(
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  statut: '',
                  reponse: {
                    texte: 'valeur de $a$ dans $ax^2+bx$',
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
                    texte: 'valeur de $b$ dans $ax^2+bx$',
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
          )
        }
      }
      if (this.questionJamaisPosee(i, a, b, c)) {
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
