// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid a04f7 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import Stat from '../../lib/mathFonctions/Stat'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import { nombreElementsDifferents } from '../ExerciceQcm'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = 'a04f7'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calculer une proportion à partir d’un diagramme en barres'
export const dateDePublication = '03/07/2026'

type SensCumul = 'auPlus' | 'auMoins'

/**
 * @author Stéphane Guyon
 */
export default class CalculProportionCumuleeHistogrammeOld extends ExerciceQcmA {
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

  private fractionTex(numerateur: number, denominateur: number): string {
    return new FractionEtendue(numerateur, denominateur).texFractionSimplifiee
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
      effectifsOn: true,
      titre: "Nombre d'exercices réalisés en une semaine par des élèves",
      labelHorizontal: "Nombre d'exercices réalisés",
      labelVertical: "Nombre d'élèves",
    })
    const total = serie.reduce((somme, [, effectif]) => somme + effectif, 0)
    const effectifReponse = this.effectifCumule(serie, seuil, sens)
    const effectifSeuil = serie.find(([valeur]) => valeur === seuil)?.[1] ?? 0
    const effectifSensOppose = this.effectifCumule(
      serie,
      seuil,
      sens === 'auPlus' ? 'auMoins' : 'auPlus',
    )
    const effectifIntervalleStrict = serie
      .filter(([valeur]) =>
        sens === 'auPlus' ? valeur < seuil : valeur > seuil,
      )
      .reduce((somme, [, effectif]) => somme + effectif, 0)
    const reponse = this.fractionTex(effectifReponse, total)

    const distracteursEffectifs = [
      effectifSensOppose,
      effectifIntervalleStrict,
      total - effectifReponse,
      effectifSeuil,
      Math.max(0, effectifReponse - effectifSeuil),
      Math.min(total, effectifReponse + effectifSeuil),
    ].filter((effectif) => effectif > 0 && effectif !== effectifReponse)

    const reponses = [reponse]
    for (const effectif of distracteursEffectifs) {
      const distracteur = this.fractionTex(effectif, total)
      if (!reponses.includes(distracteur)) reponses.push(distracteur)
      if (reponses.length === 4) break
    }

    while (reponses.length < 4) {
      const numerateur = randint(1, total - 1, [effectifReponse])
      const candidat = this.fractionTex(numerateur, total)
      if (!reponses.includes(candidat)) reponses.push(candidat)
    }

    this.reponses = reponses.map((r) => `$${r}$`)

    const question =
      sens === 'auPlus'
        ? `Quelle proportion d'élèves a réalisé au plus $${seuil}$ exercices ?`
        : `Quelle proportion d'élèves a réalisé au moins $${seuil}$ exercices ?`
    const valeursConcernees = serie.filter(([valeur]) =>
      sens === 'auPlus' ? valeur <= seuil : valeur >= seuil,
    )
    const valeursTex = valeursConcernees
      .map(([valeur]) => `$${valeur}$`)
      .join(', ')
    const sommeTex = valeursConcernees
      .map(([, effectif]) => texNombre(effectif, 0))
      .join('+')
    const sommeTotaleTex = serie
      .map(([, effectif]) => texNombre(effectif, 0))
      .join('+')

    this.enonce = `Le diagramme en barres ci-dessous donne la répartition du nombre d'exercices réalisés en une semaine par des élèves sur le site MathALÉA.<br>
    ${histogramme}<br><br>
    ${question}`

    this.correction = `On commence par calculer l'effectif total : $${sommeTotaleTex}=${total}$.<br>
    ${sens === 'auPlus' ? `« Au plus $${seuil}$ exercices » signifie $${seuil}$ exercices ou moins.` : `« Au moins $${seuil}$ exercices » signifie $${seuil}$ exercices ou plus.`}<br>
    On additionne donc les effectifs correspondant aux nombres d'exercices suivants : ${valeursTex}.<br>
    On obtient $${sommeTex}=${texNombre(effectifReponse, 0)}$ élèves sur un total de $${total}$ élèves.<br>
    La proportion cherchée est donc $\\dfrac{${effectifReponse}}{${total}}=${miseEnEvidence(reponse)}$.`
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
