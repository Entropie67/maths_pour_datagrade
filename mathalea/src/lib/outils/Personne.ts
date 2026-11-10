import { choice, shuffle } from './arrayOutils'

export const prenoms: { prenom: string; pronom: string }[] = [
  { prenom: 'Albert', pronom: 'il' },
  { prenom: 'Alice', pronom: 'elle' },
  { prenom: 'Benoît', pronom: 'il' },
  { prenom: 'Béatrice', pronom: 'elle' },
  { prenom: 'Céline', pronom: 'elle' },
  { prenom: 'Charles', pronom: 'il' },
  { prenom: 'David', pronom: 'il' },
  { prenom: 'Diane', pronom: 'elle' },
  { prenom: 'Émile', pronom: 'il' },
  { prenom: 'Élodie', pronom: 'elle' },
  { prenom: 'François', pronom: 'il' },
  { prenom: 'Fiona', pronom: 'elle' },
  { prenom: 'Gaspard', pronom: 'il' },
  { prenom: 'Gabrielle', pronom: 'elle' },
  { prenom: 'Hugo', pronom: 'il' },
  { prenom: 'Hélène', pronom: 'elle' },
  { prenom: 'Isabelle', pronom: 'elle' },
  { prenom: 'Julien', pronom: 'il' },
  { prenom: 'Julie', pronom: 'elle' },
  { prenom: 'Kevin', pronom: 'il' },
  { prenom: 'Karine', pronom: 'elle' },
  { prenom: 'Lucas', pronom: 'il' },
  { prenom: 'Léa', pronom: 'elle' },
  { prenom: 'Mathieu', pronom: 'il' },
  { prenom: 'Marie', pronom: 'elle' },
  { prenom: 'Nicolas', pronom: 'il' },
  { prenom: 'Nathalie', pronom: 'elle' },
  { prenom: 'Olivier', pronom: 'il' },
  { prenom: 'Océane', pronom: 'elle' },
  { prenom: 'Paul', pronom: 'il' },
  { prenom: 'Pascale', pronom: 'elle' },
  { prenom: 'Quentin', pronom: 'il' },
  { prenom: 'Quynh', pronom: 'elle' },
  { prenom: 'Romain', pronom: 'il' },
  { prenom: 'Roxane', pronom: 'elle' },
  { prenom: 'Sébastien', pronom: 'il' },
  { prenom: 'Sophie', pronom: 'elle' },
  { prenom: 'Thomas', pronom: 'il' },
  { prenom: 'Tania', pronom: 'elle' },
  { prenom: 'Ulysse', pronom: 'il' },
  { prenom: 'Ursule', pronom: 'elle' },
  { prenom: 'Victor', pronom: 'il' },
  { prenom: 'Valérie', pronom: 'elle' },
  { prenom: 'William', pronom: 'il' },
  { prenom: 'Wendy', pronom: 'elle' },
  { prenom: 'Xavier', pronom: 'il' },
  { prenom: 'Yasmine', pronom: 'elle' },
  { prenom: 'Zoé', pronom: 'elle' },
  { prenom: 'Yann', pronom: 'il' },
  { prenom: 'Yvette', pronom: 'elle' },
  { prenom: 'Zacharie', pronom: 'il' },
  { prenom: 'Madeleine', pronom: 'elle' },
  { prenom: 'Schona', pronom: 'elle' },
  { prenom: 'Lilian', pronom: 'il' },
  { prenom: 'Aude', pronom: 'elle' },
  { prenom: 'Carine', pronom: 'elle' },
  { prenom: 'Corinne', pronom: 'elle' },
  { prenom: 'Dalila', pronom: 'elle' },
  { prenom: 'Elsa', pronom: 'elle' },
  { prenom: 'Farida', pronom: 'elle' },
  { prenom: 'Karole', pronom: 'elle' },
  { prenom: 'Lisa', pronom: 'elle' },
  { prenom: 'Manon', pronom: 'elle' },
  { prenom: 'Marina', pronom: 'elle' },
  { prenom: 'Magalie', pronom: 'elle' },
  { prenom: 'Nadia', pronom: 'elle' },
  { prenom: 'Nawel', pronom: 'elle' },
  { prenom: 'Teresa', pronom: 'elle' },
  { prenom: 'Vanessa', pronom: 'elle' },
  { prenom: 'Arthur', pronom: 'il' },
  { prenom: 'Benjamin', pronom: 'il' },
  { prenom: 'Bernard', pronom: 'il' },
  { prenom: 'Christophe', pronom: 'il' },
  { prenom: 'Cyril', pronom: 'il' },
  { prenom: 'Fernando', pronom: 'il' },
  { prenom: 'Guillaume', pronom: 'il' },
  { prenom: 'Jean-Claude', pronom: 'il' },
  { prenom: 'Joachim', pronom: 'il' },
  { prenom: 'José', pronom: 'il' },
  { prenom: 'Kamel', pronom: 'il' },
  { prenom: 'Karim', pronom: 'il' },
  { prenom: 'Laurent', pronom: 'il' },
  { prenom: 'Mehdi', pronom: 'il' },
  { prenom: 'Nassim', pronom: 'il' },
  { prenom: 'Pablo', pronom: 'il' },
  { prenom: 'Rémi', pronom: 'il' },
  { prenom: 'Yazid', pronom: 'il' },
]

/**
 * Renvoie un ou plusieurs prénoms féminins choisis aléatoirement.
 *
 * @param {number} [n=1] - Nombre de prénoms à renvoyer.
 *   - Si `n === 1`, la fonction renvoie par défaut un `string`.
 *   - Si `n > 1`, la fonction renvoie un `string[]` de longueur `n`.
 * @param {boolean} [asArray=false] - Si `true` et `n === 1`,
 *   renvoie un tableau contenant un seul prénom au lieu d'un string.
 *
 * @returns {string | string[]}
 *   - Un prénom unique (`string`) si `n === 1` et `asArray === false`.
 *   - Un tableau de prénoms (`string[]`) dans tous les autres cas.
 *
 * @author Rémi Angot
 *
 * @example
 * prenomF();
 * // → "Alice"
 *
 * @example
 * prenomF(1, true);
 * // → ["Alice"]
 *
 * @example
 * prenomF(3);
 * // → ["Alice", "Marie", "Léa"]
 */
export function prenomF(n = 1, asArray = false): string | string[] {
  const prenomsFeminins = prenoms
    .filter((p) => p.pronom === 'elle')
    .map((p) => p.prenom)

  if (n === 1) {
    const chosen = choice(prenomsFeminins)
    return asArray ? [chosen] : chosen
  } else {
    return shuffle(prenomsFeminins).slice(0, n)
  }
}

/**
 * Renvoie un ou plusieurs prénoms masculins choisis aléatoirement.
 *
 * @param {number} [n=1] - Nombre de prénoms à renvoyer.
 *   - Si `n === 1`, la fonction renvoie par défaut un `string`.
 *   - Si `n > 1`, la fonction renvoie un `string[]` de longueur `n`.
 * @param {boolean} [asArray=false] - Si `true` et `n === 1`,
 *   renvoie un tableau contenant un seul prénom au lieu d'un string.
 *
 * @returns {string | string[]}
 *   - Un prénom unique (`string`) si `n === 1` et `asArray === false`.
 *   - Un tableau de prénoms (`string[]`) dans tous les autres cas.
 *
 * @author Rémi Angot
 *
 * @example
 * prenomM();
 * // → "Marc"
 *
 * @example
 * prenomM(1, true);
 * // → ["Marc"]
 *
 * @example
 * prenomM(3);
 * // → ["Marc", "Francis", "Léo"]
 */
export function prenomM(n = 1, asArray = false): string | string[] {
  const prenomsMasculins = prenoms
    .filter((p) => p.pronom === 'il')
    .map((p) => p.prenom)

  if (n === 1) {
    const chosen = choice(prenomsMasculins)
    return asArray ? [chosen] : chosen
  } else {
    return shuffle(prenomsMasculins).slice(0, n)
  }
}

/**
 * Renvoie un prénom au hasard ou une liste de prénoms
 * @author Rémi Angot
 */
export function prenom(n = 1) {
  const prenomsArray = prenoms.map((element) => element.prenom) // Conversion de Set en tableau
  if (n === 1) {
    return choice(prenomsArray)
  } else {
    return shuffle(prenomsArray).slice(0, n)
  }
}

/**
 * Définit l'objet personne
 * @author Jean-claude Lhote
 * le 14/03/2021
 */
export class Personne {
  prenom: string
  genre: string
  pronom: string
  Pronom: string
  constructor({ prenom = '', genre = '', pronom = '' } = {}) {
    let choix: { prenom: string; pronom: string }
    this.prenom = ''
    this.genre = ''
    this.pronom = ''
    this.Pronom = ''
    if (prenom === '' || typeof prenom === 'undefined') {
      // On le/la baptise
      choix = prenomPronom()
      this.prenom = choix.prenom
      this.pronom = choix.pronom
    } else if (pronom === '') {
      // le pronom n'est pas précisé
      this.pronom = 'on'
      this.Pronom = 'On'
    }
    if (genre === '') {
      if (this.pronom === 'il') {
        this.Pronom = 'Il'
        this.genre = 'masculin'
      } else if (this.pronom === 'elle') {
        this.Pronom = 'Elle'
        this.genre = 'féminin'
      } else this.genre = 'neutre'
    }
  }
}

/**
 * crée une instance de la classe Personne
 * @author Jean-claude Lhote
 * le 14/03/2021
 */
export function personne({ prenom = '', genre = '', pronom = '' } = {}) {
  return new Personne({ prenom, genre, pronom })
}

/**
 * Crée un tableau de n objet de la classe Personne
 * @author Jean-claude Lhote
 * le 14/03/2021
 */
export function personnes(n: number) {
  const liste = []
  let essai
  let trouve
  for (let i = 0; i < n; ) {
    essai = personne()
    trouve = false
    for (let j = 0; j < liste.length; j++) {
      if (liste[j].prenom === essai.prenom) {
        trouve = true
        break
      }
    }
    if (trouve === false) {
      liste.push(essai)
      i++
    }
  }
  return liste
}

/**
 * Renvoie un objet {prénom,pronom} où pronom='il' ou 'elle'
 *  @author Jean-claude Lhote
 */
export function prenomPronom(): { prenom: string; pronom: string } {
  const couple = choice(prenoms)
  return couple
}

export function prenomsPronoms(
  n: number,
): { prenom: string; pronom: string } | { prenom: string; pronom: string }[] {
  if (n < 2) {
    return prenomPronom()
  } else {
    return shuffle(prenoms).slice(0, n)
  }
}
