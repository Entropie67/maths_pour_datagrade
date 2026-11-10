import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import ExerciceSimple from '../ExerciceSimple'

export const titre = 'Déterminer une expression littérale'
export const dateDePublication = '18/01/2026'
export const dateDeModifImportante = '03/10/2026'
export const uuid = 'd5058'
export const refs = {
  'fr-fr': ['1A-C08-1'],
  'fr-ch': ['10LCQCMFA4-1', '10LSQCMFA4-1', '11CTQCMFA4-1'],
}
export const interactifReady = true
export const amcReady = true
export const amcType = 'qcmMono'

type DonneesQuestion = {
  situation: string
  reponse: string
  reponseQcm?: string
  distracteurs: string[]
  correction: string
}

/** @author Gilles Mora - Stéphane Guyon (passage en question ouverte)*/
export default class Auto1AC8a extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1.5
    this.spacingCorr = 1.5
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = {
      texteAvant: '<br>',
      dataKeys: ['x', 'POW'],
    }
    this.optionsDeComparaison = { expressionsForcementReduites: true }
    this.versionQcmDisponible = true
    this.versionQcm = false
  }

  nouvelleVersion(): void {
    if (context.isAmc) this.versionQcm = true

    const cas = this.quotaChoice('cas', [1, 2, 3, 4, 5, 6, 7, 8, 9])
    const donnees = this.donneesQuestion(cas)

    this.correction = donnees.correction
    if (this.versionQcm) {
      this.consigne = ''
      this.question = `${donnees.situation}<br>Choisir le résultat correct.`
      this.reponse = `$${donnees.reponseQcm ?? donnees.reponse}$`
      this.distracteurs = donnees.distracteurs.map(
        (distracteur) => `$${distracteur}$`,
      )
    } else {
      this.consigne = ''
      this.question = `${donnees.situation}<br>Écrire une expression littérale réduite correspondant à cette situation.`
      this.reponse = donnees.reponse
    }
  }

  private donneesQuestion(cas: number): DonneesQuestion {
    switch (cas) {
      case 1:
        return {
          situation:
            'On additionne un nombre réel $x$, son triple et son carré.',
          reponse: '4x+x^2',
          distracteurs: ['(x+3x)^2', 'x+(3x)^2', '1+3x^2'],
          correction: `On additionne un nombre réel $x$, son triple $3x$ et son carré $x^2$.<br>
          On obtient $x+3x+x^2=${miseEnEvidence('4x+x^2')}$.`,
        }
      case 2:
        return {
          situation:
            'On additionne un nombre réel $x$, son double et son carré.',
          reponse: '3x+x^2',
          distracteurs: ['(x+2x)^2', 'x+(2x)^2', '1+2x^2'],
          correction: `On additionne un nombre réel $x$, son double $2x$ et son carré $x^2$.<br>
          On obtient $x+2x+x^2=${miseEnEvidence('3x+x^2')}$.`,
        }
      case 3:
        return {
          situation:
            'On additionne un nombre réel $x$ et son triple, puis on élève le résultat au carré.',
          reponse: '16x^2',
          reponseQcm: '(4x)^2',
          distracteurs: ['x+(3x)^2', '4x+x^2', '4x^2'],
          correction: `On additionne d’abord $x$ et son triple $3x$ : $x+3x=4x$.<br>
          Puis on élève le résultat au carré : $(4x)^2=${miseEnEvidence('16x^2')}$.`,
        }
      case 4:
        return {
          situation:
            'On additionne un nombre réel $x$ et le carré de son triple.',
          reponse: 'x+9x^2',
          reponseQcm: 'x+(3x)^2',
          distracteurs: ['(x+3x)^2', '4x+x^2', 'x+3x^2'],
          correction: `Le triple de $x$ est $3x$.<br>
          Le carré de son triple est $(3x)^2=9x^2$.<br>
          On additionne $x$ et ce carré : $${miseEnEvidence('x+9x^2')}$.`,
        }
      case 5:
        return {
          situation:
            'On additionne un nombre réel $x$ et son double, puis on élève le résultat au carré.',
          reponse: '9x^2',
          reponseQcm: '(x+2x)^2',
          distracteurs: ['x+(2x)^2', '3x+x^2', 'x^2+4x^2'],
          correction: `On additionne d’abord $x$ et son double $2x$ : $x+2x=3x$.<br>
          Puis on élève le résultat au carré : $(3x)^2=${miseEnEvidence('9x^2')}$.`,
        }
      case 6:
        return {
          situation:
            'On additionne un nombre réel $x$ et le carré de son double.',
          reponse: 'x+4x^2',
          reponseQcm: 'x+(2x)^2',
          distracteurs: ['(x+2x)^2', '3x+x^2', 'x^2+2x^2'],
          correction: `Le double de $x$ est $2x$.<br>
          Le carré de son double est $(2x)^2=4x^2$.<br>
          On additionne $x$ et ce carré : $${miseEnEvidence('x+4x^2')}$.`,
        }
      case 7:
        return {
          situation:
            'On additionne le carré d’un nombre réel $x$ et son triple.',
          reponse: 'x^2+3x',
          distracteurs: ['x^2+(3x)^2', '(x^2+3)x', '4x^2'],
          correction: `Le carré de $x$ est $x^2$ et son triple est $3x$.<br>
          On additionne les deux expressions : $${miseEnEvidence('x^2+3x')}$.`,
        }
      case 8:
        return {
          situation:
            'On multiplie un nombre réel $x$ par son triple, puis on ajoute son carré.',
          reponse: '4x^2',
          reponseQcm: '3x^2+x^2',
          distracteurs: ['4x+x^2', '(x+3x)^2', 'x+3x^2'],
          correction: `On multiplie $x$ par son triple $3x$ : $x\\times 3x=3x^2$.<br>
          On ajoute son carré $x^2$ : $3x^2+x^2=${miseEnEvidence('4x^2')}$.`,
        }
      default:
        return {
          situation:
            'On additionne le double d’un nombre réel $x$ et son carré.',
          reponse: '2x+x^2',
          distracteurs: ['(2x)^2', '2(x+x^2)', '3x^2'],
          correction: `Le double de $x$ est $2x$ et son carré est $x^2$.<br>
          On additionne les deux expressions : $${miseEnEvidence('2x+x^2')}$.`,
        }
    }
  }
}
