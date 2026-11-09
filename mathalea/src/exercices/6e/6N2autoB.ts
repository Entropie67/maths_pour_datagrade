import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { texFractionFromString } from '../../lib/outils/deprecatedFractions'
import { arrondi } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import FractionEtendue from '../../modules/FractionEtendue'

export const titre =
  "Donner l'écriture décimale d'un nombre à partir de fraction décimale (ou inversement)"
export const amcReady = true
export const amcType = 'AMCNum'
export const interactifReady = true

export const dateDePublication = '25/09/2025'
/**
 * Donner l\'écriture décimale d\'un nombre à partir de fraction décimale (ou inversement)
 *
 * * 128/10
 * * 8+5/100+7/100
 * @author Éric Elter (d'après 6N23-4)
 */
export const uuid = '47fed'

export const refs = {
  'fr-fr': ['6N2autoB', '6AutoF1-4'],
  'fr-2016': ['6N23-4a'],
  'fr-ch': ['9R1NO4E-4', '9R2NO4E-4', '9R3NO4E-4', 'PRQNO11A-6'],
}
export default class NombreDecimalOraliseDeDifferentesManieres extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 5
    this.besoinFormulaireTexte = [
      'Type des fractions décimales',
      'Nombres séparés par des tirets :\n1 : Du genre 128/10\n2 : Du genre 8+5/100+7/100\n3 : Mélange',
    ]
    this.besoinFormulaire2Numerique = [
      'Type de questions',
      2,
      '1 : Du nombre décimal à la fraction décimale\n2 : De la fraction décimale au nombre décimal',
    ]
    this.sup = 3
    this.sup2 = 1
  }

  nouvelleVersion() {
    if (this.sup2 === 2) {
      this.consigne =
        "Donner l'écriture décimale de " +
        (this.nbQuestions > 1 ? 'chaque' : 'ce') +
        ' nombre.'
    } else {
      this.consigne =
        'Donner une fraction décimale de ' +
        (this.nbQuestions > 1 ? 'chaque' : 'ce') +
        ' nombre.'
    }

    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      max: 2,
      defaut: 2,
      melange: 3,
      nbQuestions: this.nbQuestions,
      saisie: this.sup,
      shuffle: false,
    })

    for (
      let i = 0, texte, texteCorr, cpt = 0, a, b, c, reponseAMC, n, choix;
      i < this.nbQuestions && cpt < 50;
    ) {
      a = randint(2, 9)
      b = randint(2, 9, a)
      c = randint(2, 9, [a, b])
      switch (listeTypeDeQuestions[i]) {
        case 1: // 128/10
          n = a * 100 + b * 10 + c
          choix = randint(1, 3)
          if (choix === 1) {
            texte = `$${texFractionFromString(n, 10)}$`
            reponseAMC = arrondi(n / 10)
            texteCorr = `$${texFractionFromString(n, 10)}=${texNombre(reponseAMC)}$`
          } else if (choix === 2) {
            texte = `$${texFractionFromString(n, 100)}$`
            reponseAMC = arrondi(n / 100)
            texteCorr = `$${texFractionFromString(n, 100)}=${texNombre(reponseAMC)}$`
          } else {
            texte = `$${texFractionFromString(n, 1000)}$`
            reponseAMC = arrondi(n / 1000)
            texteCorr = `$${texFractionFromString(n, 1000)}=${texNombre(reponseAMC)}$`
          }
          break
        case 2: // 8+5/100+7/100
        default:
          choix = randint(1, 2)
          if (choix === 1) {
            texte = `$${a}+${texFractionFromString(b, 100)}+${texFractionFromString(c, 100)}$`
            reponseAMC = arrondi(a + (b + c) / 100)
            texteCorr = `$${a}+${texFractionFromString(b, 100)}+${texFractionFromString(c, 100)}=${a}+${texFractionFromString(b + c, 100)}=${texNombre(reponseAMC)}$`
          } else {
            texte = `$${a}+${texFractionFromString(b, 10)}+${texFractionFromString(c, 10)}$`
            reponseAMC = arrondi(a + (b + c) / 10)
            texteCorr = `$${a}+${texFractionFromString(b, 10)}+${texFractionFromString(c, 10)}=${a}+${texFractionFromString(b + c, 10)}=${a}+${texNombre((b + c) / 10)}=${texNombre(reponseAMC)}$`
          }
          break
      }
      const fractionDecimale = new FractionEtendue(reponseAMC, 1)
      if (this.sup2 === 2) {
        texte += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierNumbers,
          { texteAvant: sp() + '=' },
        )
        handleAnswers(this, i, {
          reponse: {
            value: reponseAMC,
            options: { nombreDecimalSeulement: true },
          },
        })
      } else {
        texte = `$${texNombre(reponseAMC)}$`
        texte += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierDeBaseAvecFraction,
          { texteAvant: sp() + '=' },
        )
        texteCorr = `$${texNombre(reponseAMC)}=${fractionDecimale.texFraction}$`
        handleAnswers(this, i, {
          reponse: {
            value: fractionDecimale.texFraction,
            options: { fractionDecimale: true },
          },
        })
      }
      // Uniformisation : Mise en place de la réponse attendue en interactif en orange et gras

      const textCorrSplit = texteCorr.split('=')
      let aRemplacer = textCorrSplit[textCorrSplit.length - 1]
      aRemplacer = aRemplacer.replace('$', '').replace('<br>', '')

      texteCorr = ''
      for (let ee = 0; ee < textCorrSplit.length - 1; ee++) {
        texteCorr += textCorrSplit[ee] + '='
      }
      texteCorr += `$ $${miseEnEvidence(aRemplacer)}$`

      // Fin de cette uniformisation

      if (this.questionJamaisPosee(i, reponseAMC)) {
        // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        if (!context.isHtml && i === 0) {
          texteCorr = '\\setlength\\itemsep{2em}' + texteCorr
        } // espacement entre les questions
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
