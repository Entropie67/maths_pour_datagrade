import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'

import Exercice from '../Exercice'

export const titre = 'Trouver le complément à $10$, $100$ ou $1\\,000$'
export const dateDeModifImportante = '18/08/2026'
export const amcReady = true
export const interactifReady = true

export const amcType = 'AMCNum'

/**
 * 100-...=
 * @author Rémi Angot
 * Rajout des compléments à 10 et 1000 par Éric Elter le 18/08/2026
 */
export const uuid = '6796e'

export const refs = {
  'fr-fr': ['CM2N4A-14', 'CM1N4A-3'],
  'fr-2016': ['CM012'],
  'fr-ch': ['PR-6', '9R1NO6A-10', '9R2NO6A-10', '9R3NO6A-10'],
}
export default class ComplementA100 extends Exercice {
  constructor() {
    super()
    this.consigne = `Compléter${sp()}:`
    this.besoinFormulaireTexte = [
      "Type d'écriture",
      [
        'Nombres séparés par des tirets  :',
        '1 : 10 - n = ...',
        '2 : n + ... = 10',
        '3 : 100 - n = ...',
        '4 : n + ... = 100',
        '5 : 1 000 - n = ...',
        '6 : n + ... = 1 000',
        '7 : Mélange',
      ].join('\n'),
    ]
    this.sup = '7'
    this.nbCols = 2
    this.nbColsCorr = 2
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: 6,
      melange: 7,
      defaut: 7,
      nbQuestions: this.nbQuestions,
    }).map(Number)
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    for (
      let i = 0, texte, texteCorr, a, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      let aCompleter
      switch (listeTypeDeQuestions[i]) {
        case 1:
        case 2:
          a = randint(1, 9)
          aCompleter = 10
          break
        case 3:
        case 4:
          a = randint(11, 89)
          aCompleter = 100
          break
        default:
          a = randint(111, 899)
          aCompleter = 1000
          break
      }
      const aCompleterTex = texNombre(aCompleter)
      texte =
        listeTypeDeQuestions[i] % 2 === 1
          ? `$${aCompleterTex} - ${texNombre(a)} = `
          : `$ ${texNombre(a)} + `
      if (this.interactif) {
        texte += `$`
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)
        if (listeTypeDeQuestions[i] % 2 === 0) {
          texte += `$ = ${aCompleterTex}$`
        }
      } else {
        if (listeTypeDeQuestions[i] % 2 === 1) texte += ` \\ldots\\ldots $`
        else texte += ` \\ldots\\ldots = ${aCompleterTex}$`
      }
      texteCorr =
        listeTypeDeQuestions[i] % 2 === 1
          ? `$${aCompleterTex} - ${a}=${miseEnEvidence(texNombre(aCompleter - a))}$ ${sp(5)} et ${sp(5)} $${texNombre(a)} + ${miseEnEvidence(texNombre(aCompleter - a))} = ${aCompleterTex}$`
          : `$${texNombre(a)} + ${miseEnEvidence(texNombre(aCompleter - a))} = ${aCompleterTex}$ ${sp(5)} car ${sp(5)}  $${aCompleterTex} - ${a}=${miseEnEvidence(texNombre(aCompleter - a))}$`
      handleAnswers(this, i, {
        reponse: {
          value: aCompleter - a,
          options: { nombreDecimalSeulement: true },
        },
      })

      if (this.questionJamaisPosee(i, aCompleter, a)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
