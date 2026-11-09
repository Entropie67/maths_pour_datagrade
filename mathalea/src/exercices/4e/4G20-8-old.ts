import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { RedactionPythagore } from './_pythagore'

export const titre =
  'Calculer mentalement une longueur avec le théorème de Pythagore'
export const dateDePublication = '05/10/2024'
export const interactifReady = true

export const uuid = '6dc45'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Calcul mental utilisant les carrés de 1 à 15 avec le théorème de Pythagore
 * @author Mireille Gain
 */

export default class CalculMentalPythagore extends Exercice {
  constructor() {
    super()
    this.consigne =
      'Calculer la longueur demandée sous forme de racine carrée, puis de la partie entière du résultat.'
    this.nbQuestions = 2 // Ligne obligatoire ? Indique le nombre de questions affiché à l'ouverture de l'exercice
    this.spacing = 1.5 // Indique l'espace entre les lignes dans un exercice. C'est 1 par défaut, si cette ligne est absente.
    this.spacingCorr = 1.5
  }

  nouvelleVersion() {
    // Triangle ABC rectangle en A
    const typeQuestionsDisponibles = ['hypotenuse', 'coteAngleDroit']
    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const AB = randint(2, 5)
      const BC = randint(10, 15)
      const AC = randint(6, 9)
      const choixA = randint(1, 26, [17, 15])
      const choixB = randint(1, 26, [17, 15, choixA])
      const choixC = randint(1, 26, [17, 15, choixA, choixB])
      const sommetA = lettreDepuisChiffre(choixA)
      const sommetB = lettreDepuisChiffre(choixB)
      const sommetC = lettreDepuisChiffre(choixC)

      let texte, reponse, texteCorr, reponse0
      switch (listeTypeQuestions[i]) {
        case 'coteAngleDroit':
          if (choice([true, false])) {
            texte = `On considère le triangle $${sommetA}${sommetB}${sommetC}$ rectangle en $${sommetA}$ tel que $${sommetA}${sommetB} = ${AB}\\text{ cm}$ et $${sommetB}${sommetC} = ${BC}\\text{ cm}$.<br>`
            texte += `Calculer $${sommetA}${sommetC}$.`
            reponse0 = `\\sqrt{${BC ** 2 - AB ** 2}}`
            reponse = Math.floor(Math.sqrt(BC ** 2 - AB ** 2))
            texteCorr = RedactionPythagore(
              `${sommetA}`,
              `${sommetC}`,
              `${sommetB}`,
              2,
              reponse,
              AB,
              BC,
            )[0]
            texte += ajouteChampTexteMathLive(
              this,
              2 * i,
              KeyboardType.clavierFullOperations,
              {
                texteAvant: `<br> $${sommetA}${sommetC}$ = `,
                texteApres: '$\\text{cm}$ (Racine carrée)',
              },
            )
            texte += ajouteChampTexteMathLive(
              this,
              2 * i + 1,
              KeyboardType.clavierNumbers,
              {
                texteAvant: `<br> $${sommetA}${sommetC}$ $\\approx$ `,
                texteApres: '$\\text{cm}$ (Partie entière)',
              },
            )
          } else {
            texte = `On considère le triangle $${sommetA}${sommetB}${sommetC}$ rectangle en $${sommetA}$ tel que $${sommetA}${sommetC} = ${AC}\\text{ cm}$ et $${sommetB}${sommetC} = ${BC}\\text{ cm}$.<br>`
            texte += `Calculer $${sommetA}${sommetB}$.`
            reponse0 = `\\sqrt{${BC ** 2 - AC ** 2}}`
            reponse = Math.floor(Math.sqrt(BC ** 2 - AC ** 2))
            texteCorr = RedactionPythagore(
              `${sommetA}`,
              `${sommetB}`,
              `${sommetC}`,
              2,
              reponse,
              AC,
              BC,
            )[0]
            texte += ajouteChampTexteMathLive(
              this,
              2 * i,
              KeyboardType.clavierFullOperations,
              {
                texteAvant: `<br> $${sommetA}${sommetB}$ = `,
                texteApres: '$\\text{cm}$ (Racine carrée)',
              },
            )
            texte += ajouteChampTexteMathLive(
              this,
              2 * i + 1,
              KeyboardType.clavierNumbers,
              {
                texteAvant: `<br> $${sommetA}${sommetB}$ $\\approx$ `,
                texteApres: '$\\text{cm}$ (Partie entière)',
              },
            )
          }
          break

        // case 'hypotenuse':
        default:
          texte = `On considère le triangle $${sommetA}${sommetB}${sommetC}$ rectangle en $${sommetA}$ tel que $${sommetA}${sommetB} = ${AB}\\text{ cm}$ et $${sommetA}${sommetC} = ${AC}\\text{ cm}$.<br>`
          texte += `Calculer $${sommetB}${sommetC}$.`
          reponse0 = `\\sqrt{${AB ** 2 + AC ** 2}}`
          reponse = Math.floor(Math.sqrt(AB ** 2 + AC ** 2))
          texteCorr = RedactionPythagore(
            `${sommetA}`,
            `${sommetB}`,
            `${sommetC}`,
            1,
            AB,
            AC,
            reponse,
          )[0]
          texte += ajouteChampTexteMathLive(
            this,
            2 * i,
            KeyboardType.clavierFullOperations,
            {
              texteAvant: `<br> $${sommetB}${sommetC}$ = `,
              texteApres: '$\\text{cm}$ (Racine carrée)',
            },
          )
          texte += ajouteChampTexteMathLive(
            this,
            2 * i + 1,
            KeyboardType.clavierNumbers,
            {
              texteAvant: `<br> $${sommetB}${sommetC}$ $\\approx$ `,
              texteApres: '$\\text{cm}$ (Partie entière)',
            },
          )
          break
      }
      handleAnswers(this, 2 * i, { reponse: { value: reponse0 } })
      handleAnswers(this, 2 * i + 1, { reponse: { value: String(reponse) } })

      if (this.questionJamaisPosee(i, AB, BC, AC)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr !== undefined ? texteCorr : ''
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
