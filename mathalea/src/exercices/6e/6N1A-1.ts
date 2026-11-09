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

export const titre =
  "Donner l'écriture décimale d'un nombre à partir de différents textes"
export const amcReady = true
export const amcType = 'AMCNum'
export const interactifReady = true

export const dateDeModifImportante = '15/01/2022' // Ajout de paramètres
/**
 * Écriture décimale à partir de différentes manières de l'énoncé
 *
 * * 3 unités, 5 dixièmes et 8 centièmes
 * * 3 unités et 5 centièmes
 * * 5 dixièmes
 * * 128/10
 * * 8+5/100+7/100
 * @author Rémi Angot

 * Ajout de paramètres, Interactivité et AMC : Janvier 2022 par EE
 */
export const uuid = 'e8e24'

export const refs = {
  'fr-fr': ['6N1A-1'],
  'fr-2016': ['6N23-4'],
  'fr-ch': ['9R1NO2A-2', '9R2NO2A-2', '9R3NO2A-2', 'PRQNO02B-2'], // Primaire anciennement : ['9NO10-3'],
}
export default class NombreDecimalOraliseDeDifferentesManieres extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 5
    this.besoinFormulaireTexte = [
      'Type des textes',
      'Nombres séparés par des tirets :\n1 : 3 unités, 5 dixièmes et 8 centièmes\n2 : 3 unités et 5 centièmes\n3 : 5 dixièmes\n4 : Du genre 128/10\n5 : Du genre 8+5/100+7/100\n6 : Mélange',
    ]
    this.sup = 6
  }

  nouvelleVersion() {
    this.consigne =
      "Donner l'écriture décimale de " +
      (this.nbQuestions > 1 ? 'chaque' : 'ce') +
      ' nombre.'
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      max: 5,
      defaut: 6,
      melange: 6,
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
        case 1: // 3 unités, 5 dixièmes et 8 centièmes
          texte = `$${a}$ unités, $${b}$ dixièmes et $${c}$ centièmes`
          reponseAMC = arrondi(a + b / 10 + c / 100)
          texteCorr = `$${a}+${texFractionFromString(b, 10)}+${texFractionFromString(c, 100)}=${texNombre(reponseAMC)}$`
          break
        case 2: // 3 unités et 5 centièmes
          texte = `$${a}$ unités et $${c}$ centièmes`
          reponseAMC = arrondi(a + c / 100)
          texteCorr = `$${a}+${texFractionFromString(c, 100)}=${texNombre(reponseAMC)}$`
          break
        case 3: // 5 dixièmes / centièmes ou millièmes
          choix = randint(1, 3)
          if (choix === 1) {
            texte = `$${a}$ dixièmes`
            reponseAMC = arrondi(a / 10)
            texteCorr = `$${texFractionFromString(a, 10)}=${texNombre(reponseAMC)}$`
          } else if (choix === 2) {
            texte = `${a} centièmes`
            reponseAMC = arrondi(a / 100)
            texteCorr = `$${texFractionFromString(a, 100)}=${texNombre(reponseAMC)}$`
          } else {
            texte = `$${a}$ millièmes`
            reponseAMC = arrondi(a / 1000)
            texteCorr = `$${texFractionFromString(a, 1000)}=${texNombre(reponseAMC)}$`
          }
          break
        case 4: // 128/10
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
        case 5: // 8+5/100+7/100
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

      texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers, {
        texteAvant: sp() + '=',
      })
      handleAnswers(this, i, { reponse: { value: reponseAMC } })

      if (this.questionJamaisPosee(i, a, b, c)) {
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
