import { orangeMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import operation from '../../modules/operations'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = true

export const titre = 'Effectuer des divisions euclidiennes'
export const dateDeModifImportante = '01/11/2014'

/**
 * Poser et effectuer les divisions euclidiennes suivantes puis donner l'égalité fondamentale correspondante.
 *
 * Niveau de difficulté 2 :
 * * division par 2, 3, 4 ou 5
 *
 * Niveau de difficulté 2 :
 * * division par 2, 3, 4 ou 5
 * * division par 6 à 9
 * * un 0 dans le quotient
 *
 * Niveau de difficulté 3 :
 * * division par 11, 12, 15, 25
 * * division par 13,14,21,22,23 ou 24 et un 0 dans le quotient
 * * division par un multiple de 10 et un 0 dans le quotient
 * @author Rémi Angot
 */
export const uuid = '2da81'

export const refs = {
  'fr-fr': [],
  'fr-2016': ['6C11'],
  'fr-ch': [],
}
export default class DivisionsEuclidiennes extends Exercice {
  classe: number
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      3,
      '1 : Divisions par 2, 3, 4 ou 5\n2 : Diviseur à 1 chiffre\n3 : Diviseur à 2 chiffres',
    ]
    this.sup = 2
    this.spacing = 2
    this.spacingCorr = context.isHtml ? 2 : 1 // Important sinon opidiv n'est pas joli
    this.nbQuestions = 4
    this.classe = 6
  }

  nouvelleVersion() {
    this.consigne = 'Poser et effectuer '
    this.consigne +=
      this.nbQuestions === 1
        ? 'la division euclidienne suivante'
        : 'les divisions euclidiennes suivantes'
    this.consigne += '.'

    let typesDeQuestionsDisponibles, typesDeQuestions
    if (this.sup === 1) typesDeQuestionsDisponibles = [1]
    else if (this.sup === 2) typesDeQuestionsDisponibles = [1, 2, 2, 3]
    else typesDeQuestionsDisponibles = [4, 4, 5, 6]
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posées mais l'ordre diffère à chaque "cycle"

    for (
      let i = 0, texte = '', texteCorr = '', cpt = 0, a, b, q, r;
      i < this.nbQuestions && cpt < 50;
    ) {
      // La ligne suivante ne doit pas être mise après les setReponses car sinon elle les efface
      // this.autoCorrection[i] = { enonce: texte, propositions: [{ texte: texteCorr, statut: 4, feedback: '' }] }
      typesDeQuestions = listeTypeDeQuestions[i]
      switch (typesDeQuestions) {
        case 1: // division par 2, 3, 4 ou 5
          q = randint(2, 5) * 100 + randint(2, 5) * 10 + randint(2, 5)
          b = randint(2, 5)
          break
        case 2: // division par 6 à 9
          q = randint(5, 9) * 100 + randint(2, 5) * 10 + randint(5, 9)
          b = randint(6, 9)
          break
        case 3: // un 0 dans le quotient
          if (randint(1, 2) === 1) {
            q = randint(2, 9) * 1000 + randint(2, 9) * 100 + randint(2, 9)
          } else {
            q = randint(2, 9) * 1000 + randint(2, 9) * 10 + randint(2, 9)
          }
          b = randint(7, 9)
          break
        case 4: // division par 11, 12, 15, 25
          q = randint(1, 5) * 100 + randint(1, 5) * 10 + randint(1, 5)
          b = choice([11, 12, 15, 25])
          break
        case 5: // division par 13,14,21,22,23 ou 24 et un 0 dans le quotient
          q = randint(1, 5) * 1000 + randint(6, 9) * 100 + randint(1, 5)
          b = choice([11, 12, 13, 14, 21, 22, 23, 24])
          break
        case 6: // division par un multiple de 10 et un 0 dans le quotient
        default:
          q = randint(6, 9) * 1000 + randint(6, 9) * 10 + randint(1, 5)
          b = randint(2, 9) * 10
          break
      }
      r = randint(0, b - 1) // reste inférieur au diviseur
      a = b * q + r
      texte = `La division euclidienne de $${texNombre(a)}$ par $${b}$.`
      if (r === 0) {
        texteCorr =
          operation({
            operande1: a,
            operande2: b,
            type: 'divisionE',
            options: { solution: true, colore: orangeMathalea },
          }) + `$${texNombre(a)}=${b}\\times${texNombre(q)}$`
      } else {
        texteCorr =
          operation({
            operande1: a,
            operande2: b,
            type: 'divisionE',
            options: { solution: true, colore: orangeMathalea },
          }) +
          (this.classe !== 6
            ? `$${texNombre(a)}=${b}\\times${miseEnEvidence(texNombre(q))}+${miseEnEvidence(String(r))}$`
            : `$${texNombre(a)}=(${b}\\times${miseEnEvidence(texNombre(q))})+${miseEnEvidence(String(r))}$`)
      }
      texte += ajouteChampTexteMathLive(
        this,
        2 * i,
        KeyboardType.clavierNumbers,
        {
          texteAvant: `<br>Quel est le quotient de la division euclidienne de $${texNombre(a)}$ par $${b}$ ?`,
        },
      )
      handleAnswers(this, 2 * i, {
        reponse: {
          value: `${q}`,
        },
      })
      texte += ajouteChampTexteMathLive(
        this,
        2 * i + 1,
        KeyboardType.clavierNumbers,
        {
          texteAvant: `<br>Quel est le reste de la division euclidienne de $${texNombre(a)}$ par $${b}$ ?`,
        },
      )
      handleAnswers(this, 2 * i + 1, {
        reponse: {
          value: `${r}`,
        },
      })
      if (this.questionJamaisPosee(i, a, b)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
