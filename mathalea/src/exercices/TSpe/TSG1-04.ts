import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { pgcd } from '../../lib/outils/primalite'
import FractionEtendue from '../../modules/FractionEtendue'
import { factorielle, randint } from '../../modules/outils'
import Exercice from '../Exercice'

import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { toutAUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { numAlpha } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
export const titre = 'Utiliser le dénombrement et les probabilités élémentaires'
export const interactifReady = true

export const dateDePublication = '21/04/2025' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

export const uuid = '5121f'
export const refs = {
  'fr-fr': ['TSG1-04'],
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

    this.nbQuestions = 1
  }

  nouvelleVersion() {
    // Sujet inspiré d'un exercice du sujet Bac Asie Juin 2021
    this.consigne = 'Répondre aux questions suivantes.'
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const n = randint(7, 10) // nombre de lettres
      // On limite à 6 voyelles (a, e, i, o, u, y) et on garde au moins 3 consonnes
      const voy = randint(3, Math.min(6, n - 3)) // nombre de voyelles dans le jeu
      const con = n - voy // nombre de consonnes dans le jeu
      const tirage = 2 // nombre de lettres à tirer

      const factorielleN = factorielle(n)
      const factorielleN2 = factorielle(n - 2)
      const resultat = factorielleN / (factorielleN2 * 2) // nombre de tirages possibles
      const proba = new FractionEtendue(voy * con, resultat) // proba de gagner)
      let texte = `Un sac contient $${n}$ lettres distinctes de l'alphabet dont $${voy}$ voyelles et $${con}$ consonnes.<br>`
      texte += `Un jeu consiste à tirer simultanément au hasard $${tirage}$ lettres dans ce sac.<br>`
      texte += `On gagne si le tirage est constitué d'une voyelle ${texteEnCouleurEtGras('et', 'black')} d'une consonne.<br><br>`

      const question1 =
        'Un joueur extrait simultanément deux lettres du sac. Déterminer le nombre $n$ de tirages possibles.'
      let correction1 = `Le tirage est simultané, on cherche donc le nombre de combinaisons de $2$ éléments parmi $${n}$.<br>`
      correction1 += `On calcule donc <br>$\\begin{aligned}n&=\\dbinom{${n}}{2}\\\\&=\\dfrac{${n}~!}{${n - 2}~!\\times 2~ !}\\\\&=\\dfrac{${texNombre(factorielleN)}}{${texNombre(factorielleN2)}\\times 2}\\\\&=${resultat}.\\end{aligned}$<br>`
      correction1 += `Il y a donc $${miseEnEvidence(resultat)}$ tirages possibles.`
      const question2 =
        'Déterminer la probabilité que le joueur gagne à ce jeu.'
      let correction2 = 'On cherche le nombre de tirages gagnants.<br>'
      correction2 += `Il y a $${voy}$ voyelles possibles et, pour chacune d'elles, $${con}$ consonnes possibles. <br>D'après le principe multiplicatif, il y a donc $${voy}\\times${con}=${voy * con}$ tirages gagnants.<br>`
      correction2 += `La probabilité de succès est $p=${proba.texFraction}${pgcd(resultat, voy * con) !== 1 ? `=${proba.texFractionSimplifiee}` : ``}$.<br>`
      correction2 += `La probabilité que le joueur gagne à ce jeu est $${miseEnEvidence(proba.texFractionSimplifiee)}.$`
      const reponse2 = proba.texFractionSimplifiee

      handleAnswers(
        this,
        i,
        {
          bareme: toutAUnPoint,
          champ1: { value: resultat },
          champ2: { value: reponse2 },
        },
        { formatInteractif: 'multi-mathfield' },
      )
      if (this.questionJamaisPosee(i, resultat, reponse2)) {
        this.listeQuestions[i] =
          texte +
          addMultiMathfield(this, i, {
            dataTemplate: `a) ${question1}\n${this.interactif ? '$n=$' : ''}%{champ1}\nb) ${question2}\n${this.interactif ? '$n=$' : ''}%{champ2}`,
            dataOptions: {},
          })
        this.listeCorrections[i] =
          `${numAlpha(0)} ${correction1}<br><br>${numAlpha(1)} ${correction2}`
        i++
      }
      cpt++
    }
  }
}
