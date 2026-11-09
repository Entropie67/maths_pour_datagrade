// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid d28ff continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { lettreDepuisChiffre, sp } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import {
  listeQuestionsToContenuSansNumero,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

import { amcConvert } from '../../lib/amc/amcBuilders'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import {
  doubleDeveloppement,
  reduirePolynomeDegre3,
} from '../../lib/outils/ecritures'

export const titre = 'Additionner des expressions à développer'
export const dateDePublication = '03/02/2025'
export const interactifReady = true

export const amcType = 'AMCHybride'
export const amcReady = true

/**
 * Développer des expressions de la forme (ax+b)(cx+d)+(ex+f)(gx+h) avec a, b, c, d, e, f, g et h relatifs et paramétrables ainsi que x
 * @author Éric Elter
 */
export const uuid = 'd28ff'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'], // déjà référencé dans un autre exercice
}

export default class MultipleDistributiviteOld extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Type de la première expression',
      4,
      '1 : c(ax+b)\n2 : cx(ax+b) \n3 : (cx+d)(ax+b)\n4 : Au hasard',
    ]
    this.besoinFormulaire2Numerique = [
      'Type de la seconde expression',
      4,
      '1 : c(ax+b)\n2 : cx(ax+b) \n3 : (cx+d)(ax+b)\n4 : Au hasard',
    ]
    this.besoinFormulaire3Numerique = [
      'Signe entre les expressions',
      3,
      '1 : Plus\n2 : Moins \n3 : Au hasard',
    ]
    this.besoinFormulaire4CaseACocher = [
      'Uniquement avec la variable $x$',
      false,
    ]
    this.sup = 4
    this.sup2 = 4
    this.sup3 = 3
    this.comment =
      'Les expressions sont toutes de la forme $(ax+b)(cx+d)+(ex+f)(gx+h)$ .<br>'
    this.comment +=
      "Le paramétrage permet de choisir le type des expressions de la somme et de choisir si c'est une somme ou bien une différence. On peut aussi choisir si $x$ est le nom de la variable ou bien une autre lettre."
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
      let i = 0, reponse, a, b, c, d, e, f, g, h, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      let texteCorr = ''
      let texte = ''
      const variable = this.sup4
        ? 'x'
        : choice(['x', 'y', 'z', 'a', 'b', 'c', 'n', 'k'])

      switch (
        this.sup // 1ère expression
      ) {
        case 1:
          a = 0
          b = randint(-9, 9, [0, 1, -1])
          break
        case 2:
          a = randint(-9, 9, [0])
          b = 0
          break
        case 3:
          a = randint(-9, 9, [0])
          b = randint(-9, 9, [0])
          break
        default:
          a = choice([0, randint(-9, 9, [0])])
          b = randint(-9, 9, [0, 1, -1, a])
          break
      }
      c = randint(1, 9) * choice([1, -1])
      d = randint(1, 9) * choice([1, -1])

      switch (
        this.sup2 // 2ème expression
      ) {
        case 1:
          e = 0
          f = randint(-9, 9, [0, 1, -1])
          break
        case 2:
          e = randint(-9, 9, [0])
          f = 0
          break
        case 3:
          e = randint(-9, 9, [0])
          f = randint(-9, 9, [0])
          break
        default:
          e = randint(-9, 9)
          f = randint(-9, 9, [0, 1, -1, e])
          break
      }
      g = randint(1, 9, [c]) * choice([1, -1])
      h = randint(1, 9, [d]) * choice([1, -1])
      const signe =
        this.sup3 === 1 ? '+' : this.sup3 === 2 ? '-' : choice(['+', '-'])

      let expression1 = a === 0 || b === 0 ? '' : '('
      expression1 += `${reduirePolynomeDegre3(0, 0, a, b, variable)}`
      expression1 += a === 0 || b === 0 ? '' : ')'
      expression1 += `(${reduirePolynomeDegre3(0, 0, c, d, variable)})`
      let expression2 = (e === 0 && f > 0) || (f === 0 && e > 0) ? '' : '('
      expression2 += `${reduirePolynomeDegre3(0, 0, e, f, variable)}`
      expression2 += (e === 0 && f > 0) || (f === 0 && e > 0) ? '' : ')'
      expression2 += `(${reduirePolynomeDegre3(0, 0, g, h, variable)})`

      texte = `$${lettreDepuisChiffre(i + 1)} = ${expression1}${signe}${expression2}$`
      texteCorr = texte.slice(0, -1)
      texteCorr += `= ${doubleDeveloppement({ a, b, c, d, x: variable })[0]}${miseEnEvidence(sp() + signe + '\\Big(', bleuMathalea)}${doubleDeveloppement({ a: e, b: f, c: g, d: h, x: variable })[0]}${miseEnEvidence('\\Big)', bleuMathalea)}`

      // Dans quelques cas, ligne 1 et ligne 2 sont identiques.
      // Si elles sont identiques, on n'en affiche qu'une.
      const ligne1 = `=${doubleDeveloppement({ a, b, c, d, x: variable })[1]}${miseEnEvidence(sp() + signe + '\\Big(', bleuMathalea)}${doubleDeveloppement({ a: e, b: f, c: g, d: h, x: variable })[1]}${miseEnEvidence('\\Big)', bleuMathalea)}`
      texteCorr += ligne1
      const ligne2 = `=${reduirePolynomeDegre3(0, a * c, a * d + b * c, b * d, variable)}${miseEnEvidence(sp() + signe + '\\Big(', bleuMathalea)}${reduirePolynomeDegre3(0, e * g, e * h + f * g, f * h, variable)}${miseEnEvidence('\\Big)', bleuMathalea)}`
      texteCorr += ligne1.replace(/\s+/g, '') === ligne2 ? '' : ligne2
      let reponse21 = e * g
      let reponse22 = e * h + f * g
      let reponse23 = f * h
      if (signe === '-') {
        reponse21 = -reponse21
        reponse22 = -reponse22
        reponse23 = -reponse23
      }
      const signe2 =
        reponse21 !== 0 ? (reponse21 > 0 ? '+' : '') : reponse22 > 0 ? '+' : ''

      texteCorr += `=${reduirePolynomeDegre3(0, a * c, a * d + b * c, b * d, variable)}${signe2}${reduirePolynomeDegre3(0, reponse21, reponse22, reponse23, variable)}`
      const reponse1 = a * c + reponse21
      const reponse2 = a * d + b * c + reponse22
      const reponse3 = b * d + reponse23

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
      if (this.questionJamaisPosee(i, a, b, c, d, e, f, g, h)) {
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
