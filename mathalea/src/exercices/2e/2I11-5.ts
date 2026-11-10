import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'
export const titre = "Calculer la proportion d'une sous-population"

export const interactifReady = true

export const dateDePublication = '25/06/2022' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
export const dateDeModifImportante = '' // Une date de modification importante au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
 *
 * @author Stéphane Guyon

*/
export const uuid = '86f71'

export const refs = {
  'fr-fr': ['2I11-5'],
  'fr-ch': [],
}
/**
 * Tire un effectif total N et un effectif n de la sous-population tels que n/N
 * soit un pourcentage entier et simple, calculable sans calculatrice.
 * @returns [N, n]
 */
function valeursSansCalculatrice(typeQuestion: string): [number, number] {
  if (typeQuestion === 'Basket') {
    const taux = choice([10, 20, 25, 30, 40, 50])
    const N = choice(
      [200, 300, 400, 500, 600, 800, 1000, 1200, 1500, 2000].filter(
        (effectif) => (effectif * taux) % 100 === 0,
      ),
    )
    return [N, (N * taux) / 100]
  }
  // Classe de terminale : la proportion se ramène facilement à un dénominateur 100
  const N = choice([20, 25, 40])
  const taux = choice(
    {
      20: [50, 60, 70, 75, 80, 85, 90],
      25: [60, 72, 80, 84, 88, 92],
      40: [50, 60, 75, 80, 90],
    }[N] ?? [50],
  )
  return [N, (N * taux) / 100]
}

export default class nomExercice extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 1 // Nombre de questions par défaut
    this.nbCols = 2 // Uniquement pour la sortie LaTeX
    this.nbColsCorr = 2 // Uniquement pour la sortie LaTeX
    this.besoinFormulaireCaseACocher = ['Sans calculatrice', false]
    this.sup = false
  }

  nouvelleVersion() {
    const typeQuestionsDisponibles = ['Basket', 'STMG']

    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posés mais l'ordre diffère à chaque "cycle"
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let N: number
      let n: number
      let texte = ''
      let texteCorr = ''
      switch (listeTypeQuestions[i]) {
        case 'Basket':
          if (this.sup) {
            ;[N, n] = valeursSansCalculatrice('Basket')
          } else {
            N = randint(200, 1500) * 2
            n = randint(50, N / 2)
          }
          texte = `Parmi les $${texNombre(N)}$ spectateurs d’un match de basket-ball, $${texNombre(n)}$ ont moins de $20$ ans.<br> Calculer la proportion de spectateurs
          ayant moins de $20$ ans.<br>Exprimer le résultat sous la forme d'un pourcentage${this.sup ? '' : " arrondi à l'unité près"}.`
          if (this.interactif) {
            texte += '<br><br>'
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBase,
              { texteApres: '%' },
            )
            handleAnswers(this, i, {
              reponse: { value: arrondi((100 * n) / N, 0) },
            })
          }
          texteCorr = `La population de référence est celle des spectateurs du match.<br>
           On note $N=${texNombre(N)}$ son effectif.<br>
          La sous-population étudiée est celle des spectateurs de moins de $20$ ans.<br>
           On note $n=${texNombre(n)}$ son effectif.<br>
          D'après le cours, on sait que la proportion d'une sous-population dans une population est${sp()}:<br>
          <br>$p=\\dfrac{\\text{Effectif de la sous population}}{\\text{Effectif de la population de référence}}=\\dfrac{n}{N}=\\dfrac{${texNombre(n)}}{${texNombre(N)}}${this.sup ? '=' : '\\approx'}${texNombre(n / N, 2)}$<br>
          <br>La proportion de moins de $20$ ans parmi les spectateurs est $p${this.sup ? '=' : '\\approx'}${miseEnEvidence(texNombre((n * 100) / N, 0))}~\\%$.`
          break
        case 'STMG':
        default:
          if (this.sup) {
            ;[N, n] = valeursSansCalculatrice('STMG')
          } else {
            N = randint(12, 18) * 2
            n = randint(18, N / 2)
          }
          texte = `L’an passé, parmi les $${texNombre(N)}$ élèves de terminale STMG, $${n}$ ont obtenu une place en BTS ou en IUT.<br>
            Calculer la proportion d'élèves de cette classe qui ont obtenu une place en BTS ou en IUT.<br>Exprimer le résultat sous la forme d'un pourcentage${this.sup ? '' : " arrondi à l'unité près"}.
            `
          if (this.interactif) {
            texte += '<br><br>'
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBase,
              { texteApres: '%' },
            )
            handleAnswers(this, i, {
              reponse: { value: arrondi((100 * n) / N, 0) },
            })
          }
          texteCorr = `La population de référence est celle des élèves de Terminale STMG.<br>
             On note $N=${texNombre(N)}$ son effectif.<br>
            La sous-population étudiée est celle des bacheliers de cette classe qui ont obtenu une place en BTS ou en IUT.<br>
             On note $n=${n}$ son effectif.<br>
            D'après le cours, on sait que la proportion d'une sous-population dans une population est${sp()}:<br>
            <br>$p=\\dfrac{\\text{Effectif de la sous population}}{\\text{Effectif de la population de référence}}=\\dfrac{n}{N}=\\dfrac{${n}}{${texNombre(N)}}${this.sup ? '=' : '\\approx'}${texNombre(n / N, 2)}$<br>
            <br>La proportion d'élèves qui ont obtenu une place en BTS ou en IUT dans cette classe est $p${this.sup ? '=' : '\\approx'}${miseEnEvidence(texNombre((n * 100) / N, 0))}~\\%$.`
          break
      }
      // Si la question n'a jamais été posée, on l'enregistre
      if (this.questionJamaisPosee(i, N, n)) {
        // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this) // On envoie l'exercice à la fonction de mise en page
  }
}
