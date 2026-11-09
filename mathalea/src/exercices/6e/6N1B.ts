import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import {
  ajouteChampTexteMathLive,
  remplisLesBlancs,
} from '../../lib/interactif/questionMathLive'
import { texNombre } from '../../lib/outils/texNombre'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import {
  enleveDoublonNum,
  genererBinomesAleatoires,
} from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'

export const titre = 'Connaitre les liens entre les unités de numération'
export const amcReady = true
export const amcType = 'AMCNum'
export const interactifReady = true

export const dateDePublication = '12/05/2025'
export const dateDeModifImportante = '05/09/2025'

/**
 * Connaitre les liens entre les unités de numération : unité, dizaine, centaine, millier, dixième, centième, millième
 *
 * @author Éric Elter

 */
export const uuid = 'bc1e0'

export const refs = {
  'fr-fr': ['6N1B'],
  'fr-2016': ['6N23-9'],
  'fr-ch': ['9R1NO2A-6', '9R2NO2A-6', '9R3NO2A-6', 'PRQNO02B-4'],
}

export default class NombreDecimalOraliseDeDifferentesManieres extends Exercice {
  constructor() {
    super()
    this.consigne = 'Compléter.'
    this.nbQuestions = 5
    this.besoinFormulaireTexte = [
      'Choix des unités de numération',
      'Au moins deux nombres séparés par des tirets :\n' +
        '1 : Milliers\n' +
        '2 : Centaines\n' +
        '3 : Dizaines\n' +
        '4 : Unités\n' +
        '5 : Dixièmes\n' +
        '6 : Centièmes\n' +
        '7 : Millièmes\n' +
        '8 : Mélange',
    ]
    this.besoinFormulaire2Numerique = [
      'Type de conversions',
      3,
      '1 : De grandes unités vers de plus petites unités\n' +
        '2 : De petites unités vers de plus grandes unités\n' +
        '3 : Mélange',
    ]
    this.sup = 8
    this.sup2 = 3
    this.sup3 = this.besoinFormulaire3CaseACocher = ["Qu'avec des mots", true]
    this.sup4 = this.besoinFormulaire4CaseACocher = [
      "Que depuis l'unité",
      false,
    ]
    this.comment =
      "Selon le paramétrage choisi, les possibilités diffèrent et vous pourriez ne pas avoir autant que questions que vous le souhaitez. C'est alors un fonctionnement normal."
  }

  nouvelleVersion() {
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      max: 7,
      defaut: 8,
      melange: 8,
      nbQuestions: 7,
      saisie: this.sup,
    })
    const listeTypeDeQuestions3 = listeTypeDeQuestions.map(
      (value) => parseInt(value.toString(), 10) - 1,
    )

    if (this.sup4) listeTypeDeQuestions3.push(3)

    enleveDoublonNum(listeTypeDeQuestions3)
    if (listeTypeDeQuestions3.length === 1)
      listeTypeDeQuestions3.push(randint(0, 6, listeTypeDeQuestions3[0]))

    let binomesConversion = this.sup4
      ? this.sup2 === 1
        ? genererBinomesAleatoires(listeTypeDeQuestions3, {
            dernierNombre: 3,
            ordreCroissant: true,
          })
        : this.sup2 === 2
          ? genererBinomesAleatoires(listeTypeDeQuestions3, {
              premierNombre: 3,
              ordreDecroissant: true,
            })
          : genererBinomesAleatoires(listeTypeDeQuestions3, {
              premierNombre: 3,
            })
      : this.sup2 === 1
        ? genererBinomesAleatoires(listeTypeDeQuestions3, {
            ordreCroissant: true,
          })
        : this.sup2 === 2
          ? genererBinomesAleatoires(listeTypeDeQuestions3, {
              ordreDecroissant: true,
            })
          : genererBinomesAleatoires(listeTypeDeQuestions3)

    // « Que depuis l'unité » avec seulement des unités plus petites que l'unité :
    // les conversions ci-dessus n'existent pas. On garde le sens de conversion
    // demandé en passant par ces unités plus petites.
    if (binomesConversion.length === 0) {
      binomesConversion = genererBinomesAleatoires(
        listeTypeDeQuestions3,
        this.sup2 === 1
          ? { premierNombre: 3, ordreCroissant: true }
          : { dernierNombre: 3, ordreDecroissant: true },
      )
    }

    const unites = [
      'milliers',
      'centaines',
      'dizaines',
      'unités',
      'dixièmes',
      'centièmes',
      'millièmes',
    ]
    const unitesNumeriques = [
      texNombre(1000),
      100,
      10,
      1,
      new FractionEtendue(1, 10).texFraction,
      new FractionEtendue(1, 100).texFraction,
      new FractionEtendue(1, 1000).texFraction,
    ]
    const denominateur = [1, 1, 1, 1, 10, 100, 1000]
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < Math.min(this.nbQuestions, binomesConversion.length) && cpt < 50;
    ) {
      const reponse = Math.pow(
        10,
        binomesConversion[i][1] - binomesConversion[i][0],
      )
      if (this.sup3) {
        texte = '$1$ ' + unites[binomesConversion[i][0]].slice(0, -1) + ' $=$'
        texteCorr =
          texte +
          ` $${miseEnEvidence(texNombre(reponse))}$ ` +
          (reponse > 1
            ? unites[binomesConversion[i][1]]
            : unites[binomesConversion[i][1]].slice(0, -1))
        texte += this.interactif
          ? ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers, {
              texteApres: unites[binomesConversion[i][1]],
            })
          : ' $\\ldots\\ldots\\ldots$ ' + unites[binomesConversion[i][1]]
        handleAnswers(this, i, { reponse: { value: reponse } })
      } else {
        const texteApres =
          binomesConversion[i][1] < 4
            ? unites[binomesConversion[i][1]]
            : `$\\times ${unitesNumeriques[binomesConversion[i][1]]}$`
        texte = '$' + unitesNumeriques[binomesConversion[i][0]] + ' =$'
        texteCorr = texte
        if (binomesConversion[i][1] > 3) {
          texteCorr +=
            ` $${miseEnEvidence(texNombre(reponse))}$ ` + texteApres + '$=$'
        }
        texteCorr +=
          ` $${miseEnEvidence(texNombre(reponse))}$ ` +
          (reponse > 1
            ? unites[binomesConversion[i][1]]
            : unites[binomesConversion[i][1]].slice(0, -1))

        texte += this.interactif
          ? binomesConversion[i][1] > 3
            ? remplisLesBlancs(
                this,
                i,
                `$\\dfrac{%{champ1}}{${texNombre(denominateur[binomesConversion[i][1]])}}`,
                KeyboardType.clavierNumbers,
                '\\ldots\\ldots',
              )
            : ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers, {
                texteApres,
              })
          : ' $\\ldots\\ldots\\ldots$ ' + texteApres
        handleAnswers(
          this,
          i,
          binomesConversion[i][1] > 3
            ? { champ1: { value: reponse } }
            : { reponse: { value: reponse } },
        )
      }

      if (this.questionJamaisPosee(i, ...binomesConversion[i])) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
