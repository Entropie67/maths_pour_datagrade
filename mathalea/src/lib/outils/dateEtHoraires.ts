import { choice } from './arrayOutils'
import { sp } from './outilString'

/**
 * @author Rémi Angot
 * @Example
 * //0 h 24 est accepté
 */
export function minToHoraire(minutes: number, NbEnLatex = false) {
  let nbHour = Math.floor(minutes / 60)
  if (nbHour > 23) {
    nbHour = nbHour - 24
  }
  const nbminuteRestante = minutes % 60
  if (NbEnLatex) {
    if (nbminuteRestante > 9) {
      return `${nbHour}${sp()}\\text{h}${sp()}${nbminuteRestante}${sp()}\\text{min}`
    }
    return `${nbHour}${sp()}\\text{h}${sp()}0${nbminuteRestante}${sp()}\\text{min}`
  }
  if (nbminuteRestante > 9) {
    return nbHour + sp() + 'h' + sp() + nbminuteRestante + sp() + 'min'
  }
  return nbHour + sp() + 'h' + sp() + '0' + nbminuteRestante + sp() + 'min'
}

/**
 * @author Rémi Angot
 * @Example
 * //on écrira 24 minutes plutôt que 0 h 24
 */
export function minToHour(minutes: number, NbEnLatex = false) {
  let nbHour = Math.floor(minutes / 60)
  let retour = ''
  if (nbHour > 23) {
    nbHour = nbHour - 24
  }
  const nbminuteRestante = minutes % 60
  if (nbHour === 0) {
    retour = nbminuteRestante + sp() + 'min'
  } else {
    if (nbminuteRestante > 9) {
      retour = nbHour + sp() + 'h' + sp() + nbminuteRestante + sp() + 'min'
    } else {
      retour =
        nbHour + sp() + 'h' + sp() + '0' + nbminuteRestante + sp() + 'min'
    }
  }
  if (NbEnLatex)
    retour = retour
      .replace(/\bmin\b/g, '\\text{min}')
      .replace(/\bh\b/g, '\\text{h}')

  return retour
}

/**
 * Renvoie un tableau de deux valeurs : le nombre d'heures dans un paquet de minutes ainsi que le nombre de minutes restantes.
 * @author Éric Elter
 * @example minToHeuresMinutes (127) renvoie [2,7] car 127min = 2h7min
 * @example minToHeuresMinutes (300) renvoie [5,0] car 300min = 6h
 * @example minToHeuresMinutes (1456) renvoie [24,16] car 1456min = 24h16min
 *
 */
export function minToHeuresMinutes(minutes: number) {
  return [Math.floor(minutes / 60), minutes % 60]
}

/**
 * Renvoie le nombre de jour d'un mois donné
 * @param n quantième du mois (janvier=1...)
 * @author Jean-claude Lhote
 */
export function joursParMois(n: number, annee = 2022) {
  const joursMois = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  if (n === 2) {
    if ((annee % 4 === 0 && annee % 100 !== 0) || annee % 400 === 0)
      return 29 // années bissextiles.
    else return 28
  } else return joursMois[n - 1]
}

/**
 * Renvoie le nom du mois
 * @param n quantième du mois
 * @author Jean-claude Lhote
 */
export function nomDuMois(n: number) {
  const mois = [
    'janvier',
    'février',
    'mars',
    'avril',
    'mai',
    'juin',
    'juillet',
    'août',
    'septembre',
    'octobre',
    'novembre',
    'décembre',
  ]
  return mois[n - 1]
}

/**
 * Renvoie le nom du jour
 * @param n quantième du jour
 * @author Mireille Gain
 */
export function nomDuJour(n: number) {
  const jour = [
    'lundi',
    'mardi',
    'mercredi',
    'jeudi',
    'vendredi',
    'samedi',
    'dimanche',
  ]
  return jour[n - 1]
}

/**
 * Renvoie le nom d'un jour au hasard
 * @param n quantième du jour
 * @author Mireille Gain
 */
export function jourAuHasard() {
  return choice([
    'lundi',
    'mardi',
    'mercredi',
    'jeudi',
    'vendredi',
    'samedi',
    'dimanche',
  ])
}
