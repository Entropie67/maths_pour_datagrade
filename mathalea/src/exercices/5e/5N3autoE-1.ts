/**
 * ⚠️ Cet exercice est utilisé dans le test : tests/e2e/tests/interactivity/mathLive.fractionPlusSimple.test.ts ⚠️
 */

import { amcConvert } from '../../lib/amc/amcBuilders'
import { seq, fractionSimplification } from '../../lib/interactif/checks'
import { fractionSimplificationFromFieldsCallback } from '../../lib/interactif/checks/fractionSimplification'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { propositionsQcm } from '../../lib/interactif/qcm'
import {
  ajouteChampTexteMathLive,
  remplisLesBlancs,
} from '../../lib/interactif/questionMathLive'
import { choice, enleveElement, shuffle } from '../../lib/outils/arrayOutils'
import { texFractionFromString } from '../../lib/outils/deprecatedFractions'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { listeDesDiviseurs } from '../../lib/outils/primalite'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { texNombre } from '../../lib/outils/texNombre'

export const amcReady = true
export const amcType = ['AMCOpen', 'AMCNum', 'qcmMult', 'qcmMono']
export const interactifReady = true

export const titre = 'Simplifier des fractions'
export const dateDeModifImportante = '30/10/2026'

/**
 * Simplifier une fraction, le facteur commun est inférieur à une valeur donnée en paramètre qui est 11 par défaut
 * @author Rémi Angot
 */
export const uuid = 'f8f4e'

export const refs = {
  'fr-fr': ['5N3autoE-1'],
  'fr-2016': ['5N13'],
  'fr-ch': ['9R1NO4D-5', '9R2NO4D-5', '9R3NO4D-5', 'PRQNO10B-2'],
}
export default class Exercice_fractions_simplifier extends Exercice {
  constructor(max = 11) {
    super()
    this.besoinFormulaireNumerique = [
      'Valeur maximale du facteur commun',
      99999,
    ]
    this.besoinFormulaire2CaseACocher = ['Simplification maximale exigée']
    this.besoinFormulaire3CaseACocher = ['QCM']
    this.besoinFormulaire4Numerique = [
      'Méthode interactive (hors QCM)',
      3,
      '1 : Méthode non imposée\n2 : Faire apparaître les multiplications\n3 : Utiliser des divisions à trou',
    ]
    this.sup4 = 1
    this.sup = max // Correspond au facteur commun
    this.sup2 = false
    this.spacing = 2
    this.spacingCorr = 3
  }

  nouvelleVersion() {
    this.amcType = this.sup3
      ? !this.sup2
        ? 'qcmMult'
        : 'qcmMono'
      : !this.sup2
        ? 'AMCOpen'
        : 'AMCNum'

    this.consigne = this.sup3
      ? ''
      : this.sup2
        ? 'Simplifier les fractions suivantes au maximum.'
        : 'Simplifier les fractions suivantes.'
    if (this.nbQuestions === 1) {
      this.consigne = this.consigne.replace(
        'les fractions suivantes',
        'la fraction suivante',
      )
    }
    if (this.interactif && context.isHtml && !this.sup3 && !context.isAmc) {
      if (this.sup4 === 2)
        this.consigne +=
          ' Écrire chaque nombre comme un produit de deux entiers en faisant apparaître un facteur commun différent de 1.'
      if (this.sup4 === 3)
        this.consigne +=
          ' Compléter les divisions par un même diviseur commun différent de 1.'
    }
    const liste_fractions = [
      [1, 2],
      [1, 3],
      [2, 3],
      [1, 4],
      [3, 4],
      [1, 5],
      [2, 5],
      [3, 5],
      [4, 5],
      [1, 6],
      [5, 6],
      [1, 7],
      [2, 7],
      [3, 7],
      [4, 7],
      [5, 7],
      [6, 7],
      [1, 8],
      [3, 8],
      [5, 8],
      [7, 8],
      [1, 9],
      [2, 9],
      [4, 9],
      [5, 9],
      [7, 9],
      [8, 9],
      [1, 10],
      [3, 10],
      [7, 10],
      [9, 10],
    ] // Couples de nombres premiers entre eux
    for (
      let i = 0, cpt = 0, fraction, a, k, b, texte, texteCorr, reponse;
      i < this.nbQuestions && cpt < 50;
    ) {
      if (liste_fractions.length === 0) break
      fraction = choice(liste_fractions) //
      a = fraction[0]
      b = fraction[1]
      k = randint(2, this.sup)

      enleveElement(liste_fractions, fraction) // Il n'y aura pas 2 fois la même réponse
      const tabDiviseursDek = listeDesDiviseurs(k)
      const fractionInitale = new FractionEtendue(k * a, k * b).texFraction
      if (this.sup3) {
        texte = 'Parmi les fractions proposées ci-dessous, '
        texte +=
          tabDiviseursDek.length > 2 && !this.sup2
            ? 'lesquelles sont '
            : 'laquelle est '
        if (this.sup2) texte += 'la fraction la plus simplifiée de '
        else texte += 'une fraction simplifiée de '
        texte += `$${fractionInitale}$ ? `
      } else {
        texte =
          '$ ' +
          fractionInitale +
          ' = ' +
          texFractionFromString(
            '\\ldots\\ldots\\ldots\\ldots',
            '\\ldots\\ldots\\ldots\\ldots',
          ) +
          ' = ' +
          texFractionFromString('\\ldots\\ldots', '\\ldots\\ldots') +
          ' $'
      }
      texteCorr = ''
      for (let ee = tabDiviseursDek.length - 2; ee >= 0; ee--) {
        texteCorr +=
          '$ ' +
          fractionInitale +
          ' = ' +
          (this.interactif && context.isHtml && !this.sup3 && this.sup4 === 3
            ? texFractionFromString(
                `${texNombre(k * a)} \\div ${texNombre(k / tabDiviseursDek[ee])}`,
                `${texNombre(k * b)} \\div ${texNombre(k / tabDiviseursDek[ee])}`,
              )
            : texFractionFromString(
                texNombre(k / tabDiviseursDek[ee]) +
                  ' \\times ' +
                  texNombre(a * tabDiviseursDek[ee]),
                texNombre(k / tabDiviseursDek[ee]) +
                  ' \\times ' +
                  texNombre(b * tabDiviseursDek[ee]),
              )) +
          ' = ' +
          (!this.sup2 || ee === 0 // On met tout en couleur qd on veut toutes les simplifications ou seulement la dernière si simplification maximale
            ? miseEnEvidence(
                new FractionEtendue(
                  a * tabDiviseursDek[ee],
                  b * tabDiviseursDek[ee],
                ).texFraction,
              )
            : new FractionEtendue(
                a * tabDiviseursDek[ee],
                b * tabDiviseursDek[ee],
              ).texFraction) +
          ' $<br>'
      }
      if (this.sup2 || this.sup3) {
        reponse = new FractionEtendue(a, b)
      } else {
        reponse = new FractionEtendue(k * a, k * b)
      }
      if (
        this.sup3 ||
        this.amcType === 'qcmMult' ||
        this.amcType === 'qcmMono'
      ) {
        let fractionsFausses = [
          [a, b - 1],
          [a, b + 1],
          [a + 1, b - 1],
          [a + 1, b],
          [a + 1, b + 1],
        ]
        if (a !== 1)
          fractionsFausses.push([a - 1, b - 1], [a - 1, b], [a - 1, b + 1])

        fractionsFausses = shuffle(fractionsFausses)
        this.autoCorrection[i] = {
          enonce: texte,
          propositions: [
            {
              texte: '$' + reponse.toLatex() + '$',
              statut: true,
              feedback: '',
            },
            {
              texte:
                '$' +
                new FractionEtendue(
                  fractionsFausses[0][0],
                  fractionsFausses[0][1],
                ).toLatex() +
                '$',
              statut: false,
              feedback: '',
            },
            {
              texte:
                '$' +
                new FractionEtendue(
                  fractionsFausses[1][0],
                  fractionsFausses[1][1],
                ).toLatex() +
                '$',
              statut: false,
              feedback: '',
            },
            {
              texte:
                '$' +
                new FractionEtendue(
                  fractionsFausses[2][0],
                  fractionsFausses[2][1],
                ).toLatex() +
                '$',
              statut: false,
              feedback: '',
            },
            {
              texte: '$' + new FractionEtendue(a * k, b).toLatex() + '$',
              statut: false,
              feedback: '',
            },
            {
              texte: '$' + new FractionEtendue(a, b * k).toLatex() + '$',
              statut: false,
              feedback: '',
            },
          ],
          options: {
            ordered: false, // (true si les réponses doivent rester dans l'ordre ci-dessus, false s'il faut les mélanger),
          },
        }
        if (tabDiviseursDek.length > 2) {
          const choixDiviseurDek = choice(tabDiviseursDek, [1, k])
          const denSimplifie = (a * k) / choixDiviseurDek
          const numSimplifie = (b * k) / choixDiviseurDek
          this.autoCorrection[i].propositions![3] = {
            texte:
              '$' +
              new FractionEtendue(denSimplifie, numSimplifie).toLatex() +
              '$',
            statut: !this.sup2,
            feedback: '',
          }
          let fractionsFaussesSimplifiees = [
            [denSimplifie + 1, numSimplifie],
            [denSimplifie - 1, numSimplifie],
          ]
          fractionsFaussesSimplifiees.push(
            [denSimplifie, numSimplifie + 1],
            [denSimplifie, numSimplifie - 1],
          )
          fractionsFaussesSimplifiees = shuffle(fractionsFaussesSimplifiees)
          this.autoCorrection[i].propositions![4] = {
            texte:
              '$' +
              new FractionEtendue(
                fractionsFaussesSimplifiees[0][0],
                fractionsFaussesSimplifiees[0][1],
              ).toLatex() +
              '$',
            statut: false,
            feedback: '',
          }
          this.autoCorrection[i].propositions![5] = {
            texte:
              '$' +
              new FractionEtendue(
                fractionsFaussesSimplifiees[1][0],
                fractionsFaussesSimplifiees[1][1],
              ).toLatex() +
              '$',
            statut: false,
            feedback: '',
          }
        }
        const monQcm = propositionsQcm(this, i) // Les deux paramètres sont obligatoires et désignent, respectivement, l'exercice appelant, le numéro de la question dans la programmation de l'exercice.
        if (this.interactif && this.sup3) texte += monQcm.texte
        if (!this.interactif && this.sup3 && !context.isAmc)
          texte += monQcm.texte
      } else {
        const methodeDetaillee =
          this.interactif &&
          context.isHtml &&
          !context.isAmc &&
          (this.sup4 === 2 || this.sup4 === 3)
        if (methodeDetaillee) {
          const etape =
            this.sup4 === 2
              ? '\\dfrac{%{champ1}}{%{champ2}}'
              : `\\dfrac{${k * a} \\div %{champ1}}{${k * b} \\div %{champ2}}`
          texte = remplisLesBlancs(
            this,
            i,
            `${fractionInitale} = ${etape} = \\dfrac{%{champ3}}{%{champ4}}`,
            KeyboardType.clavierDeBase,
          )
        } else
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierDeBaseAvecFraction,
          )
        if (this.amcType === 'AMCOpen')
          this.autoCorrection[i] = {
            enonce: `Simplfier $${fractionInitale}$ en détaillant la simplification.`,
            propositions: [{ texte: texteCorr, statut: 1, feedback: '' }],
          }
        if (this.amcType === 'AMCNum' && context.isAmc)
          texte = `Simplifier, de façon maximale, $${fractionInitale}$.`
      }
      if ((this.interactif && context.isHtml) || this.sup3)
        texte = texte.replace(
          ' \\dfrac{\\ldots\\ldots\\ldots\\ldots}{\\ldots\\ldots\\ldots\\ldots} = \\dfrac{\\ldots\\ldots}{\\ldots\\ldots}',
          '',
        )
      if (this.questionJamaisPosee(i, a, b)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr

        if (!this.sup3 || this.amcType === 'AMCNum') {
          const methodeDetaillee =
            this.interactif &&
            context.isHtml &&
            !context.isAmc &&
            (this.sup4 === 2 || this.sup4 === 3)
          if (methodeDetaillee) {
            const expected = JSON.stringify({
              numerator: k * a,
              denominator: k * b,
              mode: this.sup4 === 2 ? 'product' : 'division',
              maximal: this.sup2,
            })
            handleAnswers(this, i, {
              champ1: { value: expected },
              champ2: { value: expected },
              champ3: { value: expected },
              champ4: { value: expected },
              callback: fractionSimplificationFromFieldsCallback(
                seq([fractionSimplification()]),
              ),
            })
          } else
            handleAnswers(this, i, {
              reponse: {
                value: reponse.toLatex(),
                options: {
                  fractionIrreductible: this.sup2,
                  // fractionSimplifiee: !this.sup2,
                  fractionReduite: !this.sup2,
                },
              },
            })
          if (context.isAmc) {
            texte = 'Simplifier la fraction suivante au maximum.\\\\\n' + texte
            this.autoCorrectionAMC[i] = {
              enonce: texte, // Si vide, l'énoncé est celui de l'exercice.
              propositions: [
                {
                  texte: '', // Si vide, le texte est la correction de l'exercice.
                },
              ],
              reponse: {
                valeur: reponse.simplifie(), // obligatoire (la réponse numérique à comparer à celle de l'élève), NE PAS METTRE DE STRING à virgule ! 4.9 et non pas 4,9. Cette valeur doit être passée dans un tableau d'où la nécessité des crochets.
                param: {
                  digits: 4,
                  digitsNum: 2,
                  digitsDen: 2,
                },
              },
            }
            this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
          }
        }
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this) // Espacement de 2 em entre chaque question
  }
}
