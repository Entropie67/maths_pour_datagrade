import Grandeur, { USI } from '../../modules/Grandeur'
import type { OptionsComparaisonType } from '../types'
import ce from './comparisonFunctions'

export function guessOptionsForReponses(
  reponses: string[],
): OptionsComparaisonType {
  if (!Array.isArray(reponses) || reponses.length === 0) return {}
  // Cas spécial : plusieurs blocs $...$ ou séparateur 'ou' → comparer comme du texte
  const hasMultiLatexOrOu = reponses.some((r) => {
    // Compte le nombre de $ dans la chaîne
    const dollarCount = (r.match(/\$/g) || []).length
    return dollarCount > 0 || /\bou\b/i.test(r) // Les $ ont déjà été enlevés aux extrémités dans la fonction aLeBonNombreDePropsDifferentes, donc on regarde s'il en reste à l'intérieur de la chaîne. Si oui, on suppose que c'est du texte à comparer tel quel. De même, la présence de "ou" est un indice que la réponse contient plusieurs possibilités à comparer telles quelles.
  })
  if (hasMultiLatexOrOu) {
    return { texteSansCasse: true }
  }
  // Cas spécial : réponse  alphabétique (hors espaces) sur les 8 premiers caractères ("On ne peux pas savoir")
  const isAlpha = reponses
    .map((r) => r.replaceAll('\\%', 'pourcent'))
    .some((r) => {
      if (r.includes('pourcent')) return true
      if (r.includes('centime')) return true
      const s = r.replace(/\s+/g, '').slice(0, 8) // On se limite aux 5 premiers caractères pour éviter la fallback si un chiffre se balade plus loin dans la réponse
      return /^[A-Za-zÀ-ÿ]+$/.test(s)
    })

  // Utilise le premier élément comme heuristique principale
  const reponse = reponses[0]

  // Test grandeur (unité physique) : on nettoie le latex et on tente Grandeur.fromString
  const cleaned = reponse
    .replace(/^\$/g, '') // retire $ de début
    .replace(/\$$/g, '') // retire $ de fin
    .replace(/\\text\{([^}]*)\}/g, ' $1') // remplace \text{...} par ...
    .replace(/\\,/g, '') // retire les virgules latex
    .replace(/~/g, '') // retire les espaces insécables latex
    .replace(/\\ /g, ' ') // retire les espaces latex
    .replace(/\s+/g, ' ') // espaces multiples
    .trim()
  try {
    const grandeur = Grandeur.fromString(cleaned)
    // Vérifie que la mesure est un nombre fini et que l'unité contient au moins un caractère non alphabétique
    if (
      typeof grandeur.mesure === 'number' &&
      isFinite(grandeur.mesure) &&
      grandeur.unite &&
      USI.includes(grandeur.uniteDeReference) &&
      !isNaN(grandeur.puissancePrefixe) &&
      /[^A-Za-zÀ-ÿ]/.test(grandeur.unite)
    ) {
      return { unite: true }
    }
    // Sinon, ce n'est pas une grandeur valide
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    // Parsing échoué, ce n'est pas une grandeur valide
  }

  if (
    /\[.*;.*\]/.test(reponse) ||
    /\]/.test(reponse) ||
    /\[/.test(reponse) ||
    /\\emptyset/.test(reponse)
  ) {
    // Intervalles ou réunion d'intervalles
    return { intervalle: true }
  }
  if (/\{.*[;].*\}/.test(reponse) || /\\emptyset/.test(reponse)) {
    // Ensembles de nombres
    return { ensembleDeNombres: true }
  }
  if (reponses.some((r) => /\\dfrac\{.*\}\{.*\}/.test(r))) {
    // Fractions
    return { fractionEgale: true }
  }
  if (/\^|\*/.test(reponse)) {
    // Puissances ou expressions avec exposant
    return { puissance: true }
  }
  if (/;/.test(reponse)) {
    // Suites de nombres
    return { suiteDeNombres: true }
  }
  if (/^\(.*;.*\)$/.test(reponse)) {
    // Coordonnées
    return { coordonnees: true }
  }
  if (/=/.test(reponse) || /\\approx/.test(reponse)) {
    // Expressions avec égalité
    // Vérification stricte : chaque membre autour du = doit être une expression mathématique valide
    const parts = reponse.includes('=')
      ? reponse.split('=')
      : reponse.includes('\\approx')
        ? reponse.split('\\approx')
        : []
    if (parts.length === 2) {
      try {
        ce.parse(parts[0])
        ce.parse(parts[1])
        return { egaliteExpression: true }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        // Parsing échoué, fallback texte
        return { texteSansCasse: true }
      }
    } else {
      // Pas deux membres, fallback texte
      return { texteSansCasse: true }
    }
  }
  if (isAlpha) {
    return { texteSansCasse: true }
  }
  // Par défaut, aucune option spéciale
  return {}
}
