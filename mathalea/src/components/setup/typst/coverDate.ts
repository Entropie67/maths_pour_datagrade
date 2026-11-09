/**
 * Date de la page de garde « Récitation » : le champ « Session » y tient la
 * date de l'épreuve, réglée par un sélecteur de date dans la palette de
 * l'aperçu. Le document affiche la date en clair (`02.09.24`, l'usage des
 * fiches suisses) tandis que le sélecteur HTML travaille en ISO
 * (`2024-09-02`) : ces deux fonctions font la conversion.
 */

/** Date affichée sur la fiche : `jj.mm.aa` */
export function formatCoverDate(date: Date): string {
  const deuxChiffres = (n: number) => String(n).padStart(2, '0')
  return [
    deuxChiffres(date.getDate()),
    deuxChiffres(date.getMonth() + 1),
    deuxChiffres(date.getFullYear() % 100),
  ].join('.')
}

/**
 * Valeur ISO (`2024-09-02`) attendue par `<input type="date">` pour une date
 * écrite sur la fiche. Renvoie `''` si le texte n'est pas une date reconnue
 * (le champ reste alors libre : le professeur peut y écrire ce qu'il veut,
 * le sélecteur s'ouvre simplement vide).
 *
 * Les années à deux chiffres sont lues dans le siècle courant (`24` → 2024),
 * les séparateurs `.`, `/` et `-` acceptés.
 */
export function coverDateToIso(texte: string): string {
  const match = /^\s*(\d{1,2})[./-](\d{1,2})[./-](\d{2}|\d{4})\s*$/.exec(texte)
  if (match == null) return ''
  const [, jour, mois, annee] = match
  const an =
    annee.length === 4
      ? Number(annee)
      : Math.floor(new Date().getFullYear() / 100) * 100 + Number(annee)
  const date = new Date(an, Number(mois) - 1, Number(jour))
  // rejette les dates inexistantes (31.02) : `Date` les reporte au mois suivant
  if (
    date.getFullYear() !== an ||
    date.getMonth() !== Number(mois) - 1 ||
    date.getDate() !== Number(jour)
  ) {
    return ''
  }
  return `${an}-${String(Number(mois)).padStart(2, '0')}-${String(Number(jour)).padStart(2, '0')}`
}

/** Date du jour au format ISO du sélecteur (`2026-08-28`) */
export function todayIso(): string {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

/**
 * Valeur à donner au sélecteur pour le texte courant du champ : sa date si
 * elle en est une, celle du jour sinon (le sélecteur s'ouvre sur aujourd'hui
 * plutôt que sur un calendrier vide).
 */
export function coverDatePickerValue(texte: string): string {
  return coverDateToIso(texte) || todayIso()
}

/** Texte à inscrire sur la fiche pour une valeur ISO du sélecteur de date */
export function isoToCoverDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (match == null) return ''
  return formatCoverDate(
    new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
  )
}
