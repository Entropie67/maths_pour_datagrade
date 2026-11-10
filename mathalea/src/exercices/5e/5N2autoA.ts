import { orangeMathalea } from 'apigeom/src/elements/defaultValues'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import operation from '../../modules/operations'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const dateDePublication = '20/07/2026'
export const dateDeModifImportante = '22/09/2026'
export const interactifReady = true

export const titre =
  'Additionner, soustraire, multiplier des nombres décimaux à une ou deux décimales'

/**
 * @author Éric Elter
 */

export const uuid = '9af4e'

export const refs = {
  'fr-fr': ['5N2autoA'],
  'fr-ch': ['9R1NO7A-5', '9R2NO7A-5', '9R3NO7A-5', 'PRQNO06A-10', '9R1NO7B-3', '9R2NO7B-3', '9R3NO7B-3'],
}
export default class OperationsSurDecimaux extends Exercice {
  version: string
  constructor() {
    super()
    this.nbQuestions = 6
    this.besoinFormulaireTexte = [
      'Choix des opérations',
      'Nombres séparés par des tirets  :\n1 : Addition\n2 : Soustraction\n3 : Multiplication\n4 : Mélange',
    ]
    this.sup = '4'

    this.besoinFormulaire2Texte = [
      'Nombre de décimales sur le premier nombre',
      '0 : Aucune décimale\n1 : Une seule décimale\n2 : Deux décimales',
    ]
    this.sup2 = '1-2'

    this.besoinFormulaire3Texte = [
      'Nombre de décimales sur le deuxième nombre',
      '0 : Aucune décimale\n1 : Une seule décimale\n2 : Deux décimales',
    ]
    this.sup3 = '1-2'

    this.besoinFormulaire4CaseACocher = [
      "Sans retenue pour l'addition et la soustraction",
    ]
    this.sup4 = false

    this.consigne = 'Calculer.'
    this.spacing = 2
    this.version = '5e'
    this.comment =
      "Le dernier paramètre (sur la retenue) n'est pas toujours réalisable selon le choix du nombre de décimales choisi pour chaque nombre."
  }
  nouvelleVersion() {
    let decimalesPremierNombre = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 0,
      max: 2,
      defaut: 3,
      melange: 3,
      nbQuestions: this.nbQuestions,
    }).map(Number)
    decimalesPremierNombre = combinaisonListes(
      decimalesPremierNombre,
      this.nbQuestions,
    )
    let decimalesDeuxièmeNombre = gestionnaireFormulaireTexte({
      saisie: this.sup3,
      min: 0,
      max: 2,
      defaut: 3,
      melange: 3,
      nbQuestions: this.nbQuestions,
    }).map(Number)
    decimalesDeuxièmeNombre = combinaisonListes(
      decimalesDeuxièmeNombre,
      this.nbQuestions,
    )

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
      let i = 0, a = 0, b = 0, texte, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      let texteCorr = ''
      const nbDecimalesPremierNombre = decimalesPremierNombre[i]
      const nbDecimalesDeuxiemeNombre = decimalesDeuxièmeNombre[i]

      switch (operations[i]) {
        case 1:
          do {
            unitea = randint(0, 9)
            dixiemea = nbDecimalesPremierNombre >= 1 ? randint(1, 9) : 0
            centiemea = nbDecimalesPremierNombre === 2 ? randint(1, 9) : 0
            a = arrondi(unitea + dixiemea / 10 + centiemea / 100, 2)
            uniteb = randint(0, 9, [unitea])
            dixiemeb = nbDecimalesDeuxiemeNombre >= 1 ? randint(1, 9) : 0
            centiemeb = nbDecimalesDeuxiemeNombre === 2 ? randint(1, 9) : 0
            b = arrondi(uniteb + dixiemeb / 10 + centiemeb / 100, 2)
          } while (
            ((nbDecimalesPremierNombre > 0 || nbDecimalesDeuxiemeNombre > 0) &&
              Number.isInteger(arrondi(a + b))) ||
            (nbDecimalesPremierNombre > 0 && Number.isInteger(a)) ||
            (nbDecimalesDeuxiemeNombre > 0 && Number.isInteger(b)) ||
            (this.sup4 &&
              (unitea + uniteb > 9 ||
                dixiemea + dixiemeb > 9 ||
                centiemea + centiemeb > 9))
          )
          signe = '+'
          reponse = arrondi(a + b)
          break
        case 2: {
          // Sans retenue impossible si le 2e nombre a plus de décimales que le 1er
          const sansRetenue =
            this.sup4 && nbDecimalesDeuxiemeNombre <= nbDecimalesPremierNombre
          unitea = randint(1, 9)
          dixiemea =
            nbDecimalesPremierNombre >= 1 ? randint(sansRetenue ? 2 : 1, 9) : 0
          centiemea =
            nbDecimalesPremierNombre === 2 ? randint(sansRetenue ? 2 : 1, 9) : 0
          a = arrondi(unitea + dixiemea / 10 + centiemea / 100, 2)
          uniteb = randint(0, unitea - 1)
          dixiemeb =
            nbDecimalesDeuxiemeNombre >= 1
              ? randint(1, sansRetenue ? dixiemea - 1 : 9)
              : 0
          centiemeb =
            nbDecimalesDeuxiemeNombre === 2
              ? randint(1, sansRetenue ? Math.max(1, centiemea - 1) : 9)
              : 0
          b = arrondi(uniteb + dixiemeb / 10 + centiemeb / 100, 2)

          signe = '-'
          reponse = arrondi(a - b)
          break
        }
        case 3:
          do {
            unitea = randint(nbDecimalesPremierNombre === 0 ? 2 : 0, 9)
            dixiemea = nbDecimalesPremierNombre >= 1 ? randint(1, 9) : 0
            centiemea = nbDecimalesPremierNombre === 2 ? randint(1, 9) : 0
            a = arrondi(unitea + dixiemea / 10 + centiemea / 100, 2)

            uniteb = randint(nbDecimalesDeuxiemeNombre === 0 ? 2 : 0, 9)
            dixiemeb = nbDecimalesDeuxiemeNombre >= 1 ? randint(1, 9) : 0
            centiemeb = nbDecimalesDeuxiemeNombre === 2 ? randint(1, 9) : 0
            b = arrondi(uniteb + dixiemeb / 10 + centiemeb / 100, 2)
          } while (a === 0 || b === 0)
          signe = '\\times'
          reponse = arrondi(a * b)
          if (
            nbDecimalesPremierNombre !== 0 ||
            nbDecimalesDeuxiemeNombre !== 0
          ) {
            texteCorr = operation({
              operande1: a,
              operande2: b,
              type: 'multiplication',
              display: 'inline',
              options: { solution: true, colore: orangeMathalea },
            })
            texteCorr +=
              '$\\phantom{espace}$' +
              operation({
                operande1: b,
                operande2: a,
                type: 'multiplication',
                display: 'inline',
                options: { solution: true, colore: orangeMathalea },
              })
            texteCorr += '<br>'
          }
          break
      }
      if (this.questionJamaisPosee(i, a, b)) {
        texte = '$ ' + texNombre(a) + signe + texNombre(b) + '$'
        texteCorr +=
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
