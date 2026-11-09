import Decimal from 'decimal.js'
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = 'db1d5'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Déterminer une médiane'
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ8FMns2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(
    notes: number[],
    repOrigine?: string,
    d1Origine?: string,
    d2Origine?: string,
    d3Origine?: string,
  ): void {
    const notesTriees = [...notes].sort((a, b) => a - b)
    const n = notesTriees.length

    let mediane: number
    if (n % 2 === 0) {
      // Les deux valeurs centrales sont garanties d'être identiques par notre constructeur aléatoire
      mediane = notesTriees[n / 2]
    } else {
      mediane = notesTriees[Math.floor(n / 2)]
    }

    // Traduction de la taille du tableau en toutes lettres pour l'énoncé
    const nbLettres =
      n === 5 ? 'cinq' : n === 6 ? 'six' : n === 7 ? 'sept' : 'huit'

    this.enonce = `On s'intéresse au confort d'un hôtel.<br>`
    this.enonce += `Les ${nbLettres} dernières notes obtenues sont : $${notes.join('\\,;\\,')}$<br><br>`
    this.enonce += `La médiane de cette série de notes est :`

    let correct = ''
    let d1 = ''
    let d2 = ''
    let d3 = ''

    if (repOrigine && d1Origine && d2Origine && d3Origine) {
      correct = repOrigine
      d1 = d1Origine
      d2 = d2Origine
      d3 = d3Origine
    } else {
      correct = `$${texNombre(mediane, 1)}$`

      // --- UTILISATION DE DECIMAL.JS POUR LES CALCULS ---
      const decMediane = new Decimal(mediane)
      const sum = notes.reduce((acc, val) => acc + val, 0)
      const decMean = new Decimal(sum).div(n) // Calcul de la moyenne sans erreur de flottant

      // On utilise un Set<number> avec des valeurs primitives pour dédoublonner proprement
      const faussesReponses = new Set<number>()

      // Distracteur 1 : La moyenne (on l'arrondit à 1 décimale, puis on reconvertit en number)
      faussesReponses.add(new Decimal(decMean.toFixed(1)).toNumber())

      // Distracteur 2 & 3 : Valeurs décimales autour de la médiane
      faussesReponses.add(decMediane.plus(0.5).toNumber())
      faussesReponses.add(decMediane.minus(0.5).toNumber())
      faussesReponses.add(decMediane.plus(1).toNumber())
      faussesReponses.add(decMediane.minus(1).toNumber())

      // On s'assure d'avoir au moins d'autres notes existantes dans les distracteurs
      faussesReponses.add(notes[0])
      faussesReponses.add(notes[1])

      // On enlève évidemment la bonne réponse si elle a été ajoutée par erreur
      faussesReponses.delete(mediane)

      const dist = Array.from(faussesReponses)
      d1 = `$${texNombre(dist[0], 1)}$`
      d2 = `$${texNombre(dist[1], 1)}$`
      d3 = `$${texNombre(dist[2], 1)}$`
    }

    this.reponses = [correct, d1, d2, d3]

    // Rédaction de la correction
    this.correction = `Pour déterminer la médiane d'une série statistique, on commence par ranger les valeurs dans l'ordre croissant :<br>`
    this.correction += `$${notesTriees.join(' \\leqslant ')}$<br><br>`

    if (n % 2 === 0) {
      const i1 = n / 2 - 1
      const i2 = n / 2
      this.correction += `L'effectif total est de $${n}$ (un nombre pair).<br>`
      this.correction += `La médiane est donc comprise entre la $${i1 + 1}^{\\text{e}}$ valeur et la $${i2 + 1}^{\\text{e}}$ valeur.<br>`
      this.correction += `Ces deux valeurs centrales étant identiques et égales à $${notesTriees[i1]}$, la médiane est $${miseEnEvidence(texNombre(mediane, 1))}$.`
    } else {
      const idx = Math.floor(n / 2)
      this.correction += `L'effectif total est de $${n}$ (un nombre impair).<br>`
      this.correction += `La médiane est donc la valeur centrale de la série triée, c'est-à-dire la $${idx + 1}^{\\text{e}}$ valeur.<br>`
      this.correction += `La médiane est donc $${miseEnEvidence(texNombre(mediane, 1))}$.`
    }
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs([2, 3, 5, 4, 2, 3], '$3$', '$2$', '$3,5$', '$4$')
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    do {
      const isEven = choice([true, false])
      let notes: number[] = []

      if (isEven) {
        // CAS PAIR : 6 ou 8 valeurs
        const n = choice([6, 8])
        const mediane = randint(2, 4) // Médiane ni trop petite, ni trop grande

        // On force les deux valeurs du centre à être strictement identiques
        notes.push(mediane, mediane)

        // On répartit équitablement le reste des notes de part et d'autre pour conserver la médiane
        const nbOthers = (n - 2) / 2
        for (let i = 0; i < nbOthers; i++) {
          notes.push(randint(1, mediane)) // Valeurs plus petites ou égales
          notes.push(randint(mediane, 5)) // Valeurs plus grandes ou égales
        }

        notes = shuffle(notes)
      } else {
        // CAS IMPAIR : 5 ou 7 valeurs
        const n = choice([5, 7])
        notes = Array.from({ length: n }, () => randint(1, 5))

        const notesSorted = [...notes].sort((a, b) => a - b)
        const m = notesSorted[Math.floor(n / 2)]
        if (m === 1 || m === 5) {
          notes[0] = choice([2, 3, 4])
        }
      }

      this.appliquerLesValeurs(notes)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { nombreDecimalSeulement: true })
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /La médiane de cette série de notes est :\s*$/,
        this.interactif
          ? 'La médiane de cette série de notes est '
          : 'Déterminer la médiane de cette série de notes.',
      )
    this.clavierReponseCourte = KeyboardType.clavierNumbers
    this.champReponseCourteEnLigne = true
    this.texteApresReponseCourte = '.'
  }
}
