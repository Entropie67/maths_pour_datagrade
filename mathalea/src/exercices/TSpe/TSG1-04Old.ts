import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { pgcd } from '../../lib/outils/primalite'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  factorielle,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
import { texNombre } from '../../lib/outils/texNombre'
export const titre = 'Utiliser le dénombrement et les probabilités élémentaires'
export const interactifReady = true

export const dateDePublication = '21/04/2025' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

export const uuid = '5120f'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * Ce model est prévu pour les exercice où le nombre de questions est fixe
 * et où on ne demande pas la même chose à toutes les questions
 * @author Stéphane Guyon

*/
export default class nomExercice extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 3
    this.nbQuestionsModifiable = false
  }

  nouvelleVersion() {
    const n = randint(7, 10) // nombre de lettres
    // On limite à 6 voyelles (a, e, i, o, u, y) et on garde au moins 3 consonnes
    const voy = randint(3, Math.min(6, n - 3)) // nombre de voyelles dans le jeu
    const con = n - voy // nombre de consonnes dans le jeu
    const tirage = 2 // nombre de lettres à tirer

    const factorielleN = factorielle(n)
    const factorielleN2 = factorielle(n - 2)
    const resultat = factorielleN / (factorielleN2 * 2) // nombre de tirages possibles
    const proba = new FractionEtendue(voy * con, resultat) // proba de gagner)
    this.consigne = `Sujet inspiré d'un exercice du sujet Bac Asie Juin 2021.<br>Un sac contient $${n}$ lettres distinctes de l'alphabet dont $${voy}$ voyelles et $${con}$ consonnes.<br>
    Un jeu consiste à tirer simultanément au hasard $${tirage}$ lettres dans ce sac.<br>
    On gagne si le tirage est constitué d'une voyelle ${texteEnCouleurEtGras('et')} d'une consonne.`

    let question1 =
      'Un joueur extrait simultanément deux lettres du sac. Déterminer le nombre $n$ de tirages possibles.'
    const correction1 = `Le tirage est simultané, on cherche donc le nombre de combinaisons de $2$ éléments parmi $${n}$.<br>
    On calcule donc <br>$\\begin{aligned}n&=\\dbinom{${n}}{2}\\\\&=\\dfrac{${n}~!}{${n - 2}~!\\times 2~ !}\\\\&=\\dfrac{${texNombre(factorielleN)}}{${texNombre(factorielleN2)}\\times 2}\\\\&=${resultat}.\\end{aligned}$<br>
    Il y a donc $${miseEnEvidence(resultat)}$ tirages possibles.`
    let question2 = 'Déterminer la probabilité que le joueur gagne à ce jeu.'
    const correction2 = `On cherche le nombre de tirages gagnants.<br>
    Il y a $${voy}$ voyelles possibles et pour chacune d'elles, $${con}$ consonnes possibles. <br>
    D'après le principe multiplicatif, il y a donc $${voy}\\times${con}=${voy * con}$ tirages gagnants.<br>
    La probabilité de succès est $p=${proba.texFraction}${pgcd(resultat, voy * con) !== 1 ? `=${proba.texFractionSimplifiee}` : ''}$<br>
    La probabilité que le joueur gagne à ce jeu est $${miseEnEvidence(proba.texFractionSimplifiee)}.$`
    const reponse2 = proba.texFractionSimplifiee

    handleAnswers(this, 0, { reponse: { value: resultat } })
    question1 += ajouteChampTexteMathLive(
      this,
      0,
      KeyboardType.clavierDeBaseAvecFraction,
      {
        texteAvant: '<br>$n=$ ',
      },
    )
    this.listeQuestions.push(question1)
    this.listeCorrections.push(correction1)
    handleAnswers(this, 1, { reponse: { value: reponse2 } })
    question2 += ajouteChampTexteMathLive(
      this,
      1,
      KeyboardType.clavierDeBaseAvecFraction,
      {
        texteAvant: '<br>$p=$ ',
      },
    )
    this.listeQuestions.push(question2)
    this.listeCorrections.push(correction2)

    listeQuestionsToContenu(this)
  }
}
