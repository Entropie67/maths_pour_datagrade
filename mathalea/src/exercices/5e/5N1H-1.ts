import { combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteGras,
} from '../../lib/outils/embellissements'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Utiliser la distributivité pour du calcul numérique'

export const dateDePublication = '26/11/2022'

/**
 * Distribultivité numérique
 * @author Sébastien LOZANO
 */

export const uuid = '41f23'

export const refs = {
  'fr-fr': ['5N1H-1'],
  'fr-2016': ['5C12-2b'],
  'fr-ch': ['9R1NO6D-2', '9R2NO6D-2', '9R3NO6D-2'],
}
export default class DistributiviteNumerique extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 6
    this.listeAvecNumerotation = false
    this.consigne =
      'Calculer les expressions suivantes de deux manières différentes.'
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = [1, 2, 3, 4, 5, 6] // tableau à compléter par valeurs possibles des types de questions
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    // Quelques fonctions pour factoriser le code
    function avecLesPriorites(
      i: number,
      k: number,
      b: number,
      c: number,
      formeInitiale: 'factorisee' | 'developpee',
      operation: number,
    ) {
      let sortie = 'bug'
      if (formeInitiale === 'factorisee') {
        sortie = `
        ${texteGras(`Méthode 1 : avec les priorités.`)}<br>
        $${lettreDepuisChiffre(i + 1)}=${k}\\times (${texNombre(b)} ${operation === 1 ? `+ ${texNombre(c)}` : `- ${texNombre(c)}`})$<br>
        $${lettreDepuisChiffre(i + 1)}=${k}\\times ${operation === 1 ? texNombre(b + c) : texNombre(b - c)}$<br>
        $${lettreDepuisChiffre(i + 1)}=${operation === 1 ? texNombre(k * (b + c)) : texNombre(k * (b - c))}$<br>
        `
        sortie += `<br>
        ${texteGras(`Méthode 2 : en distribuant d'abord.`)}<br>
        $${lettreDepuisChiffre(i + 1)}=${miseEnEvidence(k)}\\times (${texNombre(b)} ${operation === 1 ? `+ ${texNombre(c)}` : `- ${texNombre(c)}`})$<br>
        $${lettreDepuisChiffre(i + 1)}=${miseEnEvidence(k)}\\times ${texNombre(b)} ${operation === 1 ? '+' : '-'} ${miseEnEvidence(k)}\\times ${c}$<br>
        $${lettreDepuisChiffre(i + 1)}=${texNombre(k * b)} ${operation === 1 ? '+' : '-'} ${texNombre(k * c)}$<br>
        $${lettreDepuisChiffre(i + 1)}=${operation === 1 ? texNombre(k * b + k * c) : texNombre(k * b - k * c)}$<br>
        `
      }
      if (formeInitiale === 'developpee') {
        sortie = `
        ${texteGras(`Méthode 1 : avec les priorités.`)}<br>
        $${lettreDepuisChiffre(i + 1)}=${k}\\times ${texNombre(b)} ${operation === 1 ? '+' : '-'} ${k}\\times ${texNombre(c)}$<br>
        $${lettreDepuisChiffre(i + 1)}=${texNombre(k * b)} ${operation === 1 ? '+' : '-'} ${texNombre(k * c)}$<br>
        $${lettreDepuisChiffre(i + 1)}=${operation === 1 ? texNombre(k * b + k * c) : texNombre(k * b - k * c)}$<br>
        `
        sortie += `<br>
        ${texteGras(`Méthode 2 : en factorisant d'abord.`)}<br>
        $${lettreDepuisChiffre(i + 1)}=${miseEnEvidence(k)}\\times ${texNombre(b)} ${operation === 1 ? '+' : '-'} ${miseEnEvidence(k)}\\times ${texNombre(c)}$<br>
        $${lettreDepuisChiffre(i + 1)}=${miseEnEvidence(k)}\\times (${texNombre(b)} ${operation === 1 ? `+ ${texNombre(c)}` : `- ${texNombre(c)}`})$<br>
        $${lettreDepuisChiffre(i + 1)}=${miseEnEvidence(k)}\\times ${operation === 1 ? texNombre(b + c) : texNombre(b - c)}$<br>
        $${lettreDepuisChiffre(i + 1)}=${operation === 1 ? texNombre(k * (b + c)) : texNombre(k * (b - c))}$<br>
        `
      }
      return sortie
    }

    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      texte = '' // Nous utilisons souvent cette variable pour construire le texte de la question.
      texteCorr = '' // Idem pour le texte de la correction.
      // Choix des paramètres aléatoires
      // Pour la gestion de la soustraction, on ne veut pas que b-c soit négatif
      let k = randint(2, 9)
      let b = randint(1, 9, [k])
      let c = randint(1, 9, [k, b])
      let temp
      if (b < c) {
        temp = b
        b = c
        c = temp
      }
      // Pour éviter la contre-productivité tendant à montrer que distribuer allonge le travail
      // On ajoute le cas classique d'application au calcul mental
      const puissance = [100, 1000]
      const ajoutRetrait = randint(1, 9)
      texte = ''
      texteCorr = ''
      switch (
        listeTypeDeQuestions[i] // Chaque question peut être d'un type différent, ici 6 cas sont prévus...
      ) {
        case 1: // k(a+b)
          texte += `$${lettreDepuisChiffre(i + 1)}=${k}\\times (${texNombre(b)} + ${texNombre(c)})$`
          texteCorr += avecLesPriorites(i, k, b, c, 'factorisee', 1)
          break
        case 2: // ka+kb
          texte += `$${lettreDepuisChiffre(i + 1)}=${k}\\times ${texNombre(b)} + ${k}\\times ${texNombre(c)}$`
          texteCorr += avecLesPriorites(i, k, b, c, 'developpee', 1)
          break
        case 3: // k(a-b)
          texte += `$${lettreDepuisChiffre(i + 1)}=${k}\\times (${texNombre(b)} - ${texNombre(c)})$`
          texteCorr += avecLesPriorites(i, k, b, c, 'factorisee', -1)
          break
        case 4: // ka-kb
          texte += `$${lettreDepuisChiffre(i + 1)}=${k}\\times ${texNombre(b)} - ${k}\\times ${texNombre(c)}$`
          texteCorr += avecLesPriorites(i, k, b, c, 'developpee', -1)
          break
        case 5: {
          // Calcul mental addition
          k = randint(47, 83)
          const choixIndicePuissance = randint(0, 1)
          c = ajoutRetrait
          b = puissance[choixIndicePuissance] - c
          texte += `$${lettreDepuisChiffre(i + 1)}=${k}\\times ${texNombre(b)} + ${k}\\times ${c}$`
          texteCorr += avecLesPriorites(i, k, b, c, 'developpee', 1)
          break
        }
        case 6: {
          // Calcul mental soustraction
          k = randint(47, 83)
          const choixIndicePuissance = randint(0, 1)
          c = ajoutRetrait
          b = puissance[choixIndicePuissance] + c
          texte += `$${lettreDepuisChiffre(i + 1)}=${k}\\times ${texNombre(b)} - ${k}\\times ${c}$`
          texteCorr += avecLesPriorites(i, k, b, c, 'developpee', -1)
          break
        }
      }

      if (this.listeQuestions.indexOf(texte) === -1) {
        // Si la question n'a jamais été posée, on la stocke dans la liste des questions
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this) // On envoie l'exercice à la fonction de mise en page
  }
}
