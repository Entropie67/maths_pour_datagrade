import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const dateDePublication = '20/07/2026'
export const interactifReady = true

export const titre =
  'Additionner, soustraire, multiplier des nombres décimaux à une ou deux décimales'

/**
 * @author Éric Elter
 */

export const uuid = '9af48'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export default class OperationsSurDecimauxOld extends Exercice {
  version: string
  constructor() {
    super()
    this.nbQuestions = 6
    this.besoinFormulaireTexte = [
      'Choix des opérations',
      'Nombres séparés par des tirets  :\n1 : Addition\n2 : Soustraction\n3 : Multiplication\n4 : Mélange',
    ]
    this.sup = '4'
    this.besoinFormulaire2Numerique = [
      'Nombre maximum de décimales',
      2,
      '1 décimale\n2 décimales',
    ]
    this.sup2 = 2
    this.besoinFormulaire3CaseACocher = [
      "Sans retenue pour l'addition et la soustraction",
    ]
    this.sup3 = false
    this.besoinFormulaire4CaseACocher = [
      "Nombre différent de décimales dans les deux nombres de l'opération",
    ]
    this.sup4 = true
    this.consigne = 'Calculer.'
    this.spacing = 2
    this.comment =
      "Le paramètre 4 (sur le nombre différent de décimales dans les deux nombres de l'opération) ne fonctionne que si le paramètre 2 indique 2 décimales maximum.<br><br>"
    this.comment +=
      "Pour la multiplication, si le paramètre 2 indique 2 décimales maximum, ce ne sera appliqué qu'à seul des deux facteurs pour permettre un calcul de tête."
    this.version = '5e'
  }
  nouvelleVersion() {
    let operations =
      this.version === '6eAdditionSoustraction'
        ? gestionnaireFormulaireTexte({
            max: 2,
            defaut: 3,
            nbQuestions: String(this.sup).includes('-')
              ? this.sup.split('-').length
              : 2,
            saisie: this.sup,
            melange: 3,
            listeOfCase: [1, 2],
          }).map(Number)
        : gestionnaireFormulaireTexte({
            max: 3,
            defaut: 4,
            nbQuestions: String(this.sup).includes('-')
              ? this.sup.split('-').length
              : 3,
            saisie: this.sup,
            melange: 4,
          }).map(Number)
    operations = combinaisonListes(operations, this.nbQuestions)

    let signe
    let reponse = 0
    let unitea, uniteb, dixiemea, dixiemeb, centiemea, centiemeb
    for (
      let i = 0, a = 0, b = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const uneDecimaleaOub = this.sup4 ? choice(['a', 'b']) : ''
      switch (operations[i]) {
        case 1:
          do {
            unitea = randint(0, 9)
            dixiemea = randint(this.sup2 === 1 ? 1 : 0, 9)
            centiemea =
              this.sup2 === 1 || uneDecimaleaOub === 'a'
                ? 0
                : randint(this.sup4 ? 1 : 0, 9)
            a = arrondi(unitea + dixiemea / 10 + centiemea / 100, this.sup2)
            uniteb = randint(0, 9, [unitea])
            dixiemeb = randint(this.sup2 === 1 ? 1 : 0, 9)
            centiemeb =
              this.sup2 === 1 || uneDecimaleaOub === 'b'
                ? 0
                : randint(this.sup4 ? 1 : 0, 9)
            b = arrondi(uniteb + dixiemeb / 10 + centiemeb / 100, this.sup2)
          } while (
            Number.isInteger(arrondi(a + b)) ||
            Number.isInteger(a) ||
            Number.isInteger(b) ||
            (this.sup3 &&
              (unitea + uniteb > 9 ||
                dixiemea + dixiemeb > 9 ||
                centiemea + centiemeb > 9))
          )
          signe = '+'
          reponse = arrondi(a + b)
          break
        case 2:
          do {
            unitea = randint(0, 9)
            dixiemea = randint(this.sup2 === 1 ? 1 : 0, 9)
            centiemea =
              this.sup2 === 1 || uneDecimaleaOub === 'a'
                ? 0
                : randint(this.sup4 ? 1 : 0, 9)
            a = arrondi(unitea + dixiemea / 10 + centiemea / 100, this.sup2)
            uniteb = randint(0, 9, [unitea])
            dixiemeb = randint(this.sup2 === 1 ? 1 : 0, 9, [dixiemea])
            centiemeb =
              this.sup2 === 1 || uneDecimaleaOub === 'b'
                ? 0
                : randint(this.sup4 ? 1 : 0, 9, [centiemea])
            b = arrondi(uniteb + dixiemeb / 10 + centiemeb / 100, this.sup2)
          } while (
            a < b ||
            Number.isInteger(arrondi(a - b)) ||
            Number.isInteger(a) ||
            Number.isInteger(b) ||
            (this.sup3 &&
              (unitea < uniteb ||
                dixiemea < dixiemeb ||
                (this.sup2 === 2 &&
                  uneDecimaleaOub === '' &&
                  centiemea < centiemeb)))
          )
          signe = '-'
          reponse = arrondi(a - b)
          break
        case 3:
          unitea = randint(0, 3)
          dixiemea = randint(this.sup2 === 1 ? 1 : 0, 9)
          centiemea = randint(1, 9)
          a = arrondi(unitea + dixiemea / 10 + centiemea / 100, this.sup2)

          b = arrondi(randint(2, 9) / 10)
          if (choice([true, false])) {
            const tampon = a
            a = b
            b = tampon
          }
          signe = '\\times'
          reponse = arrondi(a * b)
          break
      }
      if (this.questionJamaisPosee(i, a, b)) {
        texte = '$ ' + texNombre(a) + signe + texNombre(b) + '$'
        texteCorr =
          texte.slice(0, -1) + '=' + miseEnEvidence(texNombre(reponse)) + ' $'
        texte += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierNumbers,
          {
            texteAvant: ` =`,
          },
        )
        handleAnswers(this, i, { reponse: { value: reponse } })
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
