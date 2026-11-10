import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import {
  choice,
  combinaisonListes,
  enleveElement,
} from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { obtenirListeFractionsIrreductibles } from '../../modules/fractions'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const titre = 'Comparer deux fractions (dénominateurs multiples)'

/**
 * Comparer deux fractions dont les dénominateurs sont multiples (avec un coefficient paramétrable qui est par défaut inférieur à 11)
 * @author Rémi Angot
 * Ajout du paramètre d'inclusion de nombres négatifs le 14/08/2021 : Guillaume Valmont
 * rendu interactif + AMC par Jean-claude Lhote
 */
export const uuid = '234a7'

export const refs = {
  'fr-fr': [],
  'fr-2016': [],
  'fr-ch': ['NR'],
}
export default class ExerciceComparerDeuxFractionsOld extends Exercice {
  constructor(max = 11) {
    super()
    this.besoinFormulaireNumerique = [
      'Valeur maximale du coefficient multiplicateur',
      99999,
    ]
    this.besoinFormulaire2CaseACocher = ['Inclure des nombres négatifs']
    this.sup = max // Correspond au facteur commun
    this.consigne = 'Comparer les fractions suivantes.'
    this.spacing = 2
    this.spacingCorr = 2
    this.nbQuestions = 5

    this.sup2 = false
  }

  nouvelleVersion() {
    const listeSignes = combinaisonListes([-1, 1], this.nbQuestions)
    // On crée une liste de FractionEtendues irréductibles.
    const listeFractions = obtenirListeFractionsIrreductibles()
    for (
      let i = 0, cpt = 0, positifOuNegatif, texte, texteCorr, signe, signe2;
      i < this.nbQuestions && cpt < 50;
    ) {
      this.autoCorrection[i] = {}
      if (this.sup2 === true) positifOuNegatif = listeSignes[i]
      else positifOuNegatif = 1
      const fractionAbsolue = choice(listeFractions)
      const k = randint(2, this.sup)
      let ecart = choice(
        [-4, -3, -2, -1, 1, 2, 3, 4],
        [-k * fractionAbsolue.num, k * fractionAbsolue.num],
      ) // On exclut -k * a pour ne pas avoir une fraction nulle
      if (k * fractionAbsolue.num + ecart <= 0) {
        ecart = ecart * -1
      }
      if (ecart > 0) {
        signe = ['<', '\\leqslant']
        signe2 = ['>', '\\geqslant']
      } else {
        signe = ['>', '\\leqslant']
        signe2 = ['<', '\\geqslant']
      }
      enleveElement(listeFractions, fractionAbsolue) // Il n'y aura pas 2 fois la même réponse
      const fraction = fractionAbsolue.multiplieEntier(positifOuNegatif)
      const autreFraction = new FractionEtendue(
        k * fraction.num + ecart,
        k * fraction.den,
      )
      const ordreDesFractions = Math.random() < 0.5
      if (ordreDesFractions) {
        texte = remplisLesBlancs(
          this,
          i,
          `${fraction.texFSD}\\quad%{champ1}\\quad${autreFraction.texFSD}`,
          KeyboardType.clavierCompare,
          '\\quad\\ldots\\quad',
        )
      } else {
        texte = remplisLesBlancs(
          this,
          i,
          `${autreFraction.texFSD}\\quad%{champ1}\\quad${fraction.texFSD}`,
          KeyboardType.clavierCompare,
          '\\quad\\ldots\\quad',
        )
      }
      if (!context.isHtml) {
        texte = texte.replace('\\quad$ et $\\quad', '\\ldots\\ldots\\ldots')
      }
      let signeAsurB
      if (fraction.signe < 0) signeAsurB = '-'
      else signeAsurB = ''
      texteCorr = `$${fraction.texFSD}= ${signeAsurB} \\dfrac{${Math.abs(fractionAbsolue.num).toString() + miseEnEvidence('\\times  ' + k.toString(), bleuMathalea)}}{${Math.abs(fractionAbsolue.den).toString() + miseEnEvidence('\\times  ' + k.toString(), bleuMathalea)}}=${fraction.reduire(k).texFSD}\\quad$`
      if (ordreDesFractions) {
        texteCorr += `  et   $\\quad${fraction.reduire(k).texFSD} ${signe[0]} ${autreFraction.texFSD} \\quad$ donc $\\quad ${fraction.texFSD} ${miseEnEvidence(signe[0])} ${autreFraction.texFSD}$.`
      } else {
        texteCorr += `  et   $\\quad${autreFraction.texFSD} ${signe2[0]} ${fraction.reduire(k).texFSD} \\quad$ donc $\\quad ${autreFraction.texFSD} ${miseEnEvidence(signe2[0])} ${fraction.texFSD} $.`
      }
      if (context.isAmc) {
        this.autoCorrection[i] = {
          enonce:
            'comparer les fractions suivantes : ' +
            (ordreDesFractions
              ? `$${fraction.texFSD} \\quad$ et $\\quad ${autreFraction.texFSD}$`
              : `$${autreFraction.texFSD} \\quad$ et $\\quad ${fraction.texFSD}$`),
          propositions: [
            {
              texte: ordreDesFractions
                ? `$${fraction.texFSD} < ${autreFraction.texFSD}$`
                : `$${autreFraction.texFSD} < ${fraction.texFSD}$`,
              statut: ordreDesFractions ? ecart > 0 : ecart < 0,
            },
            {
              texte: ordreDesFractions
                ? `$${fraction.texFSD} > ${autreFraction.texFSD}$`
                : `$${autreFraction.texFSD} >${fraction.texFSD}$`,
              statut: ordreDesFractions ? ecart < 0 : ecart > 0,
            },
          ],
          options: { ordered: false },
        }
      } else {
        handleAnswers(
          this,
          i,
          {
            champ1: {
              value: ordreDesFractions ? signe : signe2,
              options: { texteSansCasse: true },
            },
          },
          { formatInteractif: 'fillInTheBlank' },
        )
      }

      if (
        this.questionJamaisPosee(i, fractionAbsolue.num, fractionAbsolue.den, k)
      ) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      if (!context.isHtml) {
        this.canEnonce = 'Compléter avec $>$ ou $<$.<br>'
        this.correction = this.listeCorrections[0]
        if (ordreDesFractions) {
          this.canReponseACompleter = `$${fraction.texFSD}\\ldots${autreFraction.texFSD}$`
        } else {
          this.canReponseACompleter = `$${autreFraction.texFSD} \\ldots${fraction.texFSD}$`
        }
      }
      cpt++
      if (listeFractions.length === 0) cpt = 50
    }
    listeQuestionsToContenu(this) // Espacement de 2 em entre chaque questions.
  }
}
