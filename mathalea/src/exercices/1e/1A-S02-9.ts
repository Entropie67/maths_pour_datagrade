import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import { nombreElementsDifferents } from '../ExerciceQcm'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const dateDeModifImportante = '22/10/2026'

export const uuid = 'e222f'
export const refs = {
  'fr-fr': ['1A-S02-9', '2A-S2-9', 'BP1AUTO030'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const titre =
  "Déterminer la valeur manquante d'une série dont on connaît la médiane"
export const dateDePublication = '05/07/2026'

type CasMediane = {
  serie: number[]
  noteAAjouter: number
  medianeVoulue: number
}

/**
 * @author Stéphane Guyon
 */
export default class AjouterUneNotePourMedianeQCM extends ExerciceQcmACourt {
  // Saisie libre : toute note comprise entre 0 et la médiane voulue convient
  private reponseSaisie = ''
  private correctionSaisie = ''

  private melangerSerie(serie: number[]): number[] {
    const serieTriee = [...serie].sort((a, b) => a - b)
    let serieMelangee = shuffle([...serie])
    let compteur = 0
    while (
      compteur < 20 &&
      serieMelangee.every((valeur, index) => valeur === serieTriee[index])
    ) {
      serieMelangee = shuffle([...serie])
      compteur++
    }
    return serieMelangee
  }

  private appliquerLesValeurs({
    serie,
    noteAAjouter,
    medianeVoulue,
  }: CasMediane): void {
    const serieTriee = [...serie].sort((a, b) => a - b)
    const serieEnonce = this.melangerSerie(serie)
    const serieCompleteTriee = [...serie, noteAAjouter].sort((a, b) => a - b)
    const medianeFinale = serieCompleteTriee[2]
    const distracteurs = [
      serieEnonce[2],
      serieEnonce[3],
      serieTriee[2],
      serieTriee[3],
      medianeVoulue + 1,
      medianeVoulue + 2,
      medianeVoulue + 3,
      medianeVoulue + 4,
      20,
      noteAAjouter + 1,
    ].filter((valeur) => valeur > medianeVoulue)
    const reponses = [noteAAjouter]
    for (const distracteur of distracteurs) {
      if (
        distracteur >= 0 &&
        distracteur <= 20 &&
        distracteur !== noteAAjouter &&
        !reponses.includes(distracteur)
      ) {
        reponses.push(distracteur)
      }
      if (reponses.length === 4) break
    }

    this.reponses = reponses.map((reponse) => `$${texNombre(reponse, 0)}$`)

    this.enonce = `On considère la série suivante de notes : $${serieEnonce.join('\\,;\\,')}$.<br>
    Quelle note faut-il ajouter à cette série pour que sa médiane soit égale à $${texNombre(medianeVoulue, 0)}$ ?`

    this.correction = `On commence par ranger la série dans l'ordre croissant : $${serieTriee.join('\\,;\\,')}$.<br>
      Après ajout d'une note, la série contient $5$ notes : l'effectif est impair.<br>
      La médiane est donc la $3^e$ valeur de la série rangée dans l'ordre croissant.<br>
      En ajoutant $${miseEnEvidence(noteAAjouter)}$, la série ordonnée devient $${serieCompleteTriee.join('\\,;\\,')}$ 
      et la médiane est alors $${texNombre(medianeFinale, 0)}$.`

    this.reponseSaisie = `[0;${medianeVoulue}]`
    this.correctionSaisie = `On commence par ranger la série dans l'ordre croissant : $${serieTriee.join('\\,;\\,')}$.<br>
      Après ajout d'une note, la série contient $5$ notes : l'effectif est impair.<br>
      La médiane est donc la $3^e$ valeur de la série rangée dans l'ordre croissant.<br>
      Dans la série de l'énoncé, $${texNombre(medianeVoulue, 0)}$ est la $2^e$ valeur : pour qu'il devienne la $3^e$, il faut ajouter une note inférieure ou égale à $${texNombre(medianeVoulue, 0)}$.<br>
      Toute note comprise entre $0$ et $${texNombre(medianeVoulue, 0)}$ convient.<br>
      Par exemple, en ajoutant $${miseEnEvidence(noteAAjouter)}$, la série ordonnée devient $${serieCompleteTriee.join('\\,;\\,')}$ 
      et la médiane est alors $${texNombre(medianeFinale, 0)}$.`
  }

  private creerCasEffectifInitial4(): CasMediane {
    const medianeVoulue = randint(6, 14)
    const noteAAjouter = medianeVoulue - choice([1, 2, 3])
    const serie = [
      randint(1, Math.max(1, medianeVoulue - 3)),
      medianeVoulue,
      randint(medianeVoulue + 1, Math.min(20, medianeVoulue + 3)),
      randint(Math.min(20, medianeVoulue + 2), 20),
    ].sort((a, b) => a - b)
    return { serie, noteAAjouter, medianeVoulue }
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs({
      serie: [6, 11, 14, 17],
      noteAAjouter: 8,
      medianeVoulue: 11,
    })
  }

  versionAleatoire: () => void = () => {
    const n = 4
    do {
      this.appliquerLesValeurs(this.creerCasEffectifInitial4())
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()
    this.enonceCourt = () =>
      this.enonce.replace(
        /Quelle note faut-il ajouter à cette série pour que sa médiane soit égale à (\$.*\$) \?\s*$/,
        "Donner une note que l'on peut ajouter à cette série pour que sa médiane soit égale à $1.",
      )
    this.reponseCourte = () => this.reponseSaisie
    this.correctionCourte = () => this.correctionSaisie
    // Toute note de l'intervalle [0 ; médiane voulue] convient
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { estDecimalDansIntervalle: true })
    this.clavierReponseCourte = KeyboardType.clavierNumbers

    this.versionAleatoire()
  }
}
