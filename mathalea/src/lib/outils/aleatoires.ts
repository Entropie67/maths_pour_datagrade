import { randint } from '../../modules/outils'
import { shuffle } from './arrayOutils'
import { joursParMois } from './dateEtHoraires'
import { rangeMinMax } from './nombres'
import {
  lettreDepuisChiffre,
  lettreMinusculeDepuisChiffre,
} from './outilString'

/**
 * retourne une liste de combien de nombres compris entre m et n (inclus) en évitant les valeurs de listeAEviter
 * toute la liste des nombres est retournée si combien est supérieur à l'effectif disponible
 * les valeurs sont dans un ordre aléatoire.
 * @author Jean-claude Lhote
 *
 */
export function choisitNombresEntreMetN(
  m: number,
  n: number,
  combien: number,
  listeAEviter: number[] = [],
): number[] {
  let t
  if (m > n) {
    t = m
    m = n
    n = t
  } else if (m === n) {
    return [n]
  }
  if (combien > n - m) combien = n - m
  let index = rangeMinMax(m, n, listeAEviter)
  index = shuffle(index)
  index = index.slice(0, combien)
  return index
}

/**
 * retourne une liste de lettres majuscules (ou minuscule si majuscule=false)
 * il y aura nombre lettres dans un ordre aléatoire
 * les lettres à éviter sont données dans une chaine par exemple : 'QXY'
 * @author Jean-claude Lhote
 */
export function choisitLettresDifferentes(
  nombre: number,
  lettresAeviter: string = '',
  majuscule: boolean = true,
): string[] {
  const listeAEviter = []
  const lettres = []
  for (const l of lettresAeviter) {
    listeAEviter.push(l.charCodeAt(0) - 64)
  }
  const index = choisitNombresEntreMetN(1, 26, nombre, listeAEviter)
  for (const n of index) {
    if (majuscule) lettres.push(lettreDepuisChiffre(n))
    else lettres.push(lettreMinusculeDepuisChiffre(n))
  }
  return lettres
}

/**
 * Renvoie un tableau avec les résultats des tirages successifs
 * @param nombreTirages Combien de tirages ?
 * @param nombreFaces Pour spécifier le type de dés
 * @param nombreDes Combien de dés à chaque tirage ?
 * @author Jean-claude Lhote
 */
export function tirerLesDes(
  nombreTirages: number,
  nombreFaces: number,
  nombreDes: number,
): number[][] {
  const tirages = []
  for (let i = 0; i <= (nombreFaces - 1) * nombreDes; i++)
    tirages.push([i + nombreDes, 0])
  for (let i = 0, resultat; i < nombreTirages; i++) {
    resultat = 0
    for (let j = 0; j < nombreDes; j++) resultat += randint(1, nombreFaces)
    tirages[resultat - nombreDes][1]++
  }
  return tirages
}

/**
 * Renvoie un tableau de nombres
 * @param nombreNotes
 * @param noteMin
 * @param noteMax
 * @param distincts Si distincts === true, les notes de la liste seront toutes distinctes
 * @author Jean-claude Lhote et Guillaume Valmont
 */
export function listeDeNotes(
  nombreNotes: number,
  noteMin: number = 0,
  noteMax: number = 20,
  distincts: boolean = false,
): number[] {
  const notes: number[] = []
  let candidat, present, limite // nombre candidat, est-ce qu'il est déjà présent, une limite d'itérations pour éviter les boucles infinies
  limite = 0
  for (let i = 0; i < nombreNotes; ) {
    limite += 1
    if (distincts && limite < 100) {
      // Si les nombres doivent être tous distincts et que la limite d'itérations n'est pas encore atteinte,
      candidat = randint(noteMin, noteMax) // on tire au sort un nombre candidat,
      present = false
      for (let j = 0; j < notes.length; j++) {
        // on vérifie s'il est présent,
        if (candidat === notes[j]) {
          present = true
          break
        }
      }
      if (!present) {
        // s'il n'est pas présent, on le stocke.
        notes.push(candidat)
        i++
      }
    } else {
      // Si les nombres n'ont pas tous à être distincts, on push directement.
      notes.push(randint(noteMin, noteMax))
      i++
    }
  }
  return notes
}

/**
 * Renvoie un tableau de températures
 * @param base température médiane
 * @mois indice du mois (janvier=1...)
 * @annee pour déterminer si elle est bissextile ou non
 * @author Jean-claude Lhote
 */
export function unMoisDeTemperature(
  base: number,
  indiceMois: number,
  annee: number,
): number[] {
  const temperatures = []
  let nombreJours = joursParMois(indiceMois)
  if (indiceMois === 2) {
    if ((annee % 4 === 0 && annee % 100 !== 0) || annee % 400 === 0)
      nombreJours = 29 // années bissextiles.
    else nombreJours = 28
  }
  temperatures.push(randint(-3, 3) + base)
  for (let i = 1; i < nombreJours; i++)
    temperatures.push(temperatures[i - 1] + randint(-2, 2))
  return temperatures
}

/**
 * Crée une Uuid de 5 caractères hexadécimaux (1M de possibilités) (copie d'une fonction qui se trouve dans updateMenuInternational.js)
 * @returns {string}
 */
export function createUuid() {
  let dt = new Date().getTime()
  const uuid = 'xxxxx'.replace(/[xy]/g, (c) => {
    const r = (dt + Math.random() * 16) % 16 | 0
    dt = Math.floor(dt / 16)
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
  return uuid
}
