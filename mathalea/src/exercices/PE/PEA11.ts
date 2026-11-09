import { bleuMathalea, vertMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  estPremier,
  factorisation,
  listeDesDiviseurs,
} from '../../lib/outils/primalite'
import { texNombre } from '../../lib/outils/texNombre'
import type { ResultType } from '../../lib/types'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import { extraitLaDecomposition } from '../3e/3A10-5'
import Exercice from '../Exercice'

export const titre =
  'Décomposer un nombre en produit de facteurs premiers et déterminer ses diviseurs'
export const interactifReady = true
export const dateDePublication = '25/09/2026'
export const uuid = '1d131'
export const refs = {
  'fr-fr': ['PEA11'],
  'fr-ch': ['10CTNO1A-18', '9R2NO1G-8', '9R3NO1G-8'],
}

/**
 * Décomposer N en produit de facteurs premiers, en déduire le nombre de diviseurs puis la liste des diviseurs
 * @author Rémi Angot
 */
export default class DiviseursDUnEntier extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.nbQuestionsModifiable = false
  }

  nouvelleVersion() {
    let n = 1
    let facto: [number, number][] = []
    for (let cpt = 0; cpt < 100; cpt++) {
      n = tirerNombre()
      facto = factorisation(n)
      const nbDiviseurs = nombreDeDiviseurs(facto)
      if (
        n >= 100 &&
        n <= 1000 &&
        facto.length >= 2 &&
        nbDiviseurs >= 8 &&
        nbDiviseurs <= 24
      ) {
        break
      }
    }
    const texN = texNombre(n, 0)
    const nbDiviseurs = nombreDeDiviseurs(facto)
    const diviseurs = listeDesDiviseurs(n)

    let question1 = `Décomposer $${texN}$ en produit de facteurs premiers.`
    if (this.interactif) {
      question1 += `<br>${ajouteChampTexteMathLive(this, 0, KeyboardType.clavierFullOperations, { texteAvant: `$${texN} = $` })}`
    }
    handleAnswers(this, 0, {
      reponse: { value: texFacto(facto), compare: compareDecomposition },
    })
    let correction1 =
      'On divise successivement par les nombres premiers dans l’ordre croissant :'
    correction1 += `<br><br>$${texEchelleDeDivisions(n)}$`
    correction1 += `<br><br>$${texN} = ${miseEnEvidence(texFacto(facto))}$`

    let question2 = `En déduire le nombre de diviseurs de $${texN}$.`
    if (this.interactif) {
      question2 += ajouteChampTexteMathLive(this, 1, KeyboardType.clavierDeBase)
    }
    handleAnswers(this, 1, { reponse: { value: nbDiviseurs } })
    let correction2 = `Il y a ${facto.map(([p, e]) => `$${e}+1$ choix pour l’exposant de $${p}$`).join(', ')}.`
    correction2 += `<br>Le nombre de diviseurs de $${texN}$ est donc le produit des exposants de sa décomposition, chacun augmenté de $1$ :`
    correction2 += `<br>$${facto.map(([, e]) => `(${e}+1)`).join('\\times ')} = ${facto.map(([, e]) => e + 1).join('\\times ')} = ${miseEnEvidence(nbDiviseurs)}$`

    let question3 = `Donner la liste de tous les diviseurs de $${texN}$.`
    if (this.interactif) {
      question3 += `<br>${ajouteChampTexteMathLive(this, 2, KeyboardType.clavierEnsemble, { texteAvant: 'Diviseurs séparés par des points-virgules :' })}`
    }
    handleAnswers(this, 2, {
      reponse: {
        value: diviseurs.join(';'),
        options: { suiteDeNombres: true },
      },
    })
    let correction3 = `On cherche toutes les façons d’écrire $${texN}$ comme produit de deux entiers, en testant les entiers dans l’ordre croissant à partir de $1$.`
    correction3 += `<br><br>${texRechercheDesDiviseurs(n, facto)}`
    correction3 += `<br><br>Les $${nbDiviseurs}$ diviseurs de $${texN}$ sont : ${texListeDiviseurs(diviseurs)}.`

    this.listeQuestions.push(question1, question2, question3)
    this.listeCorrections.push(correction1, correction2, correction3)

    listeQuestionsToContenu(this)
  }
}

/**
 * Recherche des diviseurs de n par produits de deux entiers, avec les critères de divisibilité pour les entiers qui ne conviennent pas
 */
export function texRechercheDesDiviseurs(n: number, facto: [number, number][]) {
  const texN = texNombre(n, 0)
  const lignes: string[] = []
  let d = 1
  for (; d * d <= n; d++) {
    if (n % d === 0) {
      lignes.push(`$${texN} = ${d}\\times ${texNombre(n / d, 0)}$`)
    } else {
      lignes.push(
        `$${texN}$ n’est pas divisible par $${d}$ ${raisonNonDivisible(n, d, facto)}.`,
      )
    }
  }
  let texte = lignes.join('<br>')
  texte += `<br><br>$${d}\\times ${d} = ${texNombre(d * d, 0)}$ et $${texNombre(d * d, 0)} > ${texN}$ donc on peut s’arrêter : les produits suivants seraient les mêmes que ceux déjà trouvés.`
  return texte
}

export function texListeDiviseurs(diviseurs: number[]) {
  return `$${miseEnEvidence(diviseurs.map((x) => texNombre(x, 0)).join('\\text{ ; }'))}$`
}

/**
 * Vérifie que la saisie est un produit de facteurs premiers égal à la décomposition attendue
 */
export function compareDecomposition(
  input: string,
  goodAnswer: string,
): ResultType {
  const n = extraitLaDecomposition(goodAnswer).reduce(
    (acc, [p, e]) => acc * p ** e,
    1,
  )
  const saisie = input
    .replaceAll('\\cdot', '\\times')
    .replaceAll('\\,', '')
    .replaceAll(' ', '')
    .replaceAll('^{}', '')
  const decompo = extraitLaDecomposition(saisie)
  if (decompo.length === 0) {
    return {
      isOk: false,
      feedback: 'La réponse doit être un produit de facteurs premiers.',
    }
  }
  const produit = decompo.reduce((acc, [p, e]) => acc * p ** e, 1)
  if (produit !== n) {
    return {
      isOk: false,
      feedback: `Ce produit n’est pas égal à $${texNombre(n, 0)}$.`,
    }
  }
  const nonPremier = decompo.find(([p]) => !estPremier(p))
  if (nonPremier != null) {
    return {
      isOk: false,
      feedback: `$${texNombre(nonPremier[0], 0)}$ n’est pas un nombre premier.`,
    }
  }
  return { isOk: true, feedback: '' }
}

/**
 * Tire un produit de 3 à 7 facteurs premiers parmi 2, 3 et 5, avec au plus un 7 ou un 11
 */
export function tirerNombre() {
  const nbFacteurs = randint(3, 7)
  const autre = choice([0, 0, 7, 11])
  const facteurs = autre === 0 ? [] : [autre]
  while (facteurs.length < nbFacteurs) {
    facteurs.push(choice([2, 2, 3, 3, 5]))
  }
  return facteurs.reduce((a, b) => a * b, 1)
}

export function nombreDeDiviseurs(facto: [number, number][]) {
  return facto.reduce((acc, [, e]) => acc * (e + 1), 1)
}

/**
 * Écriture de la décomposition avec des puissances, en colorant les facteurs premiers de couleurs
 * @param facto décomposition sous la forme [[p1, e1], [p2, e2], …]
 * @param couleurs couleur de chaque facteur premier à colorer
 */
export function texFacto(
  facto: [number, number][],
  couleurs: Record<number, string> = {},
) {
  return facto
    .map(([p, e]) => {
      const puissance = e > 1 ? `${p}^{${e}}` : `${p}`
      return couleurs[p] ? miseEnEvidence(puissance, couleurs[p]) : puissance
    })
    .join('\\times ')
}

/**
 * Couleurs associées aux facteurs premiers (jamais l'orange réservé au résultat final)
 */
export const couleursFacteurs: Record<number, string> = {
  2: bleuMathalea,
  3: vertMathalea,
  5: '#8E44AD',
  7: '#B8860B',
  11: '#C2185B',
}

/**
 * Divisions successives par les facteurs premiers, présentées en tableau
 */
export function texEchelleDeDivisions(n: number) {
  const lignes: string[] = []
  let q = n
  for (let p = 2; q > 1;) {
    if (q % p === 0) {
      lignes.push(`${texNombre(q, 0)} & ${p}`)
      q /= p
    } else {
      p++
    }
  }
  lignes.push('1 &')
  return `\\begin{array}{r|l}${lignes.join('\\\\')}\\end{array}`
}

function raisonNonDivisible(
  n: number,
  d: number,
  facto: [number, number][],
): string {
  const chiffres = String(n).split('')
  const sommeChiffres = chiffres.reduce((a, c) => a + Number(c), 0)
  const texSomme = `$${chiffres.join('+')} = ${sommeChiffres}$`
  switch (d) {
    case 2:
      return 'car il est impair'
    case 3:
      return `car la somme de ses chiffres, ${texSomme}, n’est pas divisible par $3$`
    case 5:
      return 'car son chiffre des unités n’est ni $0$ ni $5$'
    case 4:
      if (n % 2 !== 0) return 'car il n’est pas divisible par $2$'
      return `car le nombre formé par ses deux derniers chiffres, $${n % 100}$, n’est pas divisible par $4$`
    case 9:
      if (n % 3 !== 0) return 'car il n’est pas divisible par $3$'
      return `car la somme de ses chiffres, ${texSomme}, n’est pas divisible par $9$`
  }
  for (let e = d - 1; e > 1; e--) {
    if (d % e === 0 && n % e !== 0) {
      return `car il n’est pas divisible par $${e}$`
    }
  }
  const facteursD = factorisation(d)
  const p = facteursD[0][0]
  const exposant = facto.find(([q]) => q === p)?.[1] ?? 0
  if (exposant === 0) {
    return `car $${p}$ n’apparaît pas dans sa décomposition en produit de facteurs premiers`
  }
  // d est une puissance de p et p n'apparaît pas assez de fois dans la décomposition de n
  return `car le facteur $${p}$ n’apparaît ${exposant === 1 ? 'qu’une fois' : `que $${exposant}$ fois`} dans sa décomposition en produit de facteurs premiers`
}
