// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 81c7b continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import Stat from '../../lib/mathFonctions/Stat'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import { nombreElementsDifferents } from '../ExerciceQcm'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = '81c7b'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Interpréter un diagramme en barres'
export const dateDePublication = '03/07/2026'

type SensCumul = 'auPlus' | 'auMoins'

/**
 * @author Stéphane Guyon
 */
export default class LireEffectifCumuleHistogrammeOld extends ExerciceQcmA {
  private genererEffectifs(total: number): [number, number][] {
    const valeurs = [3, 4, 5, 6, 7, 8, 9, 10]
    const effectifs = valeurs.map(() => 1)
    let reste = total - effectifs.length

    while (reste > 0) {
      const index = randint(0, effectifs.length - 1)
      effectifs[index]++
      reste--
    }

    return valeurs.map((valeur, index) => [valeur, effectifs[index]])
  }

  private effectifCumule(
    serie: [number, number][],
    seuil: number,
    sens: SensCumul,
  ): number {
    return serie
      .filter(([valeur]) =>
        sens === 'auPlus' ? valeur <= seuil : valeur >= seuil,
      )
      .reduce((somme, [, effectif]) => somme + effectif, 0)
  }

  private appliquerLesValeurs(
    serie: [number, number][],
    seuil: number,
    sens: SensCumul,
  ): void {
    const maSerie = new Stat(serie, false, false)
    const histogramme = maSerie.diagramme({
      cumul: false,
      barres: true,
      valuesOn: true,
      effectifsOn: false,
      titre: "Nombre d'exercices réalisés par des élèves en une semaine",
      labelHorizontal: "Nombre d'exercices",
      labelVertical: "Nombre d'élèves",
    })
    const total = serie.reduce((somme, [, effectif]) => somme + effectif, 0)
    const reponse = this.effectifCumule(serie, seuil, sens)
    const effectifExact = serie.find(([valeur]) => valeur === seuil)?.[1] ?? 0
    const reponseOpposee = this.effectifCumule(
      serie,
      seuil,
      sens === 'auPlus' ? 'auMoins' : 'auPlus',
    )
    const reponseStricte = serie
      .filter(([valeur]) =>
        sens === 'auPlus' ? valeur < seuil : valeur > seuil,
      )
      .reduce((somme, [, effectif]) => somme + effectif, 0)

    const question =
      sens === 'auPlus'
        ? `Combien d'élèves ont réalisé au plus $${seuil}$ exercices ?`
        : `Combien d'élèves ont réalisé au moins $${seuil}$ exercices ?`
    const valeursConcernees = serie.filter(([valeur]) =>
      sens === 'auPlus' ? valeur <= seuil : valeur >= seuil,
    )
    const valeursTex = valeursConcernees
      .map(([valeur]) => `$${valeur}$`)
      .join(', ')
    const sommeTex = valeursConcernees
      .map(([, effectif]) => texNombre(effectif, 0))
      .join('+')

    const distracteurs = [
      effectifExact,
      reponseOpposee,
      reponseStricte,
      total - reponse,
      reponse + effectifExact,
      Math.max(0, reponse - effectifExact),
    ].filter((valeur) => valeur !== reponse)

    const reponses = [reponse, ...[...new Set(distracteurs)].slice(0, 3)]
    while (reponses.length < 4) {
      const candidat = randint(1, total)
      if (!reponses.includes(candidat)) reponses.push(candidat)
    }

    this.reponses = reponses.map((r) => `$${texNombre(r, 0)}$`)

    this.enonce = `Le diagramme en barres ci-dessous donne la répartition du nombre d'exercices réalisés en une semaine par des élèves sur le site MathALÉA.<br>
    ${histogramme}<br><br>
    ${question}`

    this.correction = `
    ${sens === 'auPlus' ? `« Au plus $${seuil}$ exercices » signifie $${seuil}$ exercices ou moins.` : `« Au moins $${seuil}$ exercices » signifie $${seuil}$ exercices ou plus.`}<br>
    On additionne donc les effectifs correspondant aux nombres d'exercices suivants : ${valeursTex}.<br>
    On obtient $${sommeTex}=${miseEnEvidence(texNombre(reponse, 0))}$.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(
      [
        [3, 2],
        [4, 4],
        [5, 5],
        [6, 3],
        [7, 4],
        [8, 3],
        [9, 2],
        [10, 1],
      ],
      6,
      'auPlus',
    )
  }

  versionAleatoire: () => void = () => {
    const n = 4
    do {
      const total = randint(20, 40)
      const serie = this.genererEffectifs(total)
      const seuil = randint(4, 9)
      const sens = choice(['auPlus', 'auMoins']) as SensCumul
      this.appliquerLesValeurs(serie, seuil, sens)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()

    this.versionAleatoire()
  }
}
