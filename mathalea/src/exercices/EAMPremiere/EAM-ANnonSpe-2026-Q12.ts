import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import {
  texteEnCouleurEtGras,
  texteGras,
} from '../../lib/outils/embellissements'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = '8e7a5'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = ''
export const dateDePublication = '05/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ12ANns2026 extends ExerciceQcmACourt {
  private nouvelleSerie: number[] = []
  private moyenneNouvelleSerie = 0
  private medianeNouvelleSerie = 0

  // Une seule note pour les deux champs (barème de `genereReponsesCourtes`).
  champsReponseCourte = () => ({
    gabarit: '\\text{moyenne}=%{champ1}\\quad\\text{médiane}=%{champ2}',
    reponses: {
      champ1: { value: String(this.moyenneNouvelleSerie) },
      champ2: { value: String(this.medianeNouvelleSerie) },
    },
  })

  private appliquerLesValeurs(init: number[], add: number[]): void {
    const n1 = init[0],
      n2 = init[1],
      n3 = init[2]
    const a = add[0],
      b = add[1]

    const mean1 = (n1 + n2 + n3) / 3
    const med1 = n2 // La liste initiale est déjà triée

    const newSeries = [...init, ...add].sort((x, y) => x - y)
    const sum2 = newSeries.reduce((acc, curr) => acc + curr, 0)
    const mean2 = sum2 / 5
    const med2 = newSeries[2]
    this.nouvelleSerie = newSeries
    this.moyenneNouvelleSerie = mean2
    this.medianeNouvelleSerie = med2

    const propEqEq =
      'Les moyennes des deux séries sont égales et les médianes sont égales.'
    const propEqDiff =
      'Les moyennes des deux séries sont égales et les médianes sont différentes.'
    const propDiffEq =
      'Les moyennes des deux séries sont différentes et les médianes sont égales.'
    const propDiffDiff =
      'Les moyennes des deux séries sont différentes et les médianes sont différentes.'

    let repCorrecte = ''
    if (mean1 === mean2 && med1 === med2) repCorrecte = propEqEq
    else if (mean1 === mean2 && med1 !== med2) repCorrecte = propEqDiff
    else if (mean1 !== mean2 && med1 === med2) repCorrecte = propDiffEq
    else repCorrecte = propDiffDiff

    this.enonce = `Un élève a obtenu une série de trois notes $${n1}$ ; $${n2}$ ; $${n3}$ en mathématiques. Il a déterminé la moyenne et la médiane de cette série.<br>`
    this.enonce += `Il a obtenu deux nouvelles notes : $${a}$ et $${b}$ et obtient ainsi une nouvelle série de notes : $${newSeries.join(' ; ')}$.<br>`
    this.enonce += `Laquelle des quatre propositions est vraie ?`

    this.correction = `$\\bullet$ ${texteGras('Série initiale')} ($${n1}$ ; $${n2}$ ; $${n3}$) :<br>`
    this.correction += `La moyenne est : $\\dfrac{${n1} + ${n2} + ${n3}}{3} = \\dfrac{${n1 + n2 + n3}}{3} = ${mean1}$.<br>`
    this.correction += `La médiane est la valeur centrale : $${med1}$.<br><br>`

    this.correction += `$\\bullet$ ${texteGras('Nouvelle série')} ($${newSeries.join(' ; ')}$) :<br>`
    this.correction += `La moyenne est : $\\dfrac{${newSeries.join(' + ')}}{5} = \\dfrac{${sum2}}{5} = ${mean2}$.<br>`
    this.correction += `La médiane est la $3^{\\text{e}}$ valeur (car la série ordonnée comporte $5$ notes) : $${med2}$.<br><br>`

    this.correction += `$\\bullet$ ${texteGras('Conclusion')} :<br>`
    if (mean1 === mean2) this.correction += `Les moyennes sont égales.<br>`
    else this.correction += `Les moyennes sont différentes.<br>`

    if (med1 === med2) this.correction += `Les médianes sont égales.<br>`
    else this.correction += `Les médianes sont différentes.<br>`

    this.correction += `<br>${texteEnCouleurEtGras(repCorrecte.replace('.', ''))}.`

    // On place la bonne réponse en premier, et on filtre pour les 3 autres
    this.reponses = [
      repCorrecte,
      ...[propEqEq, propEqDiff, propDiffEq, propDiffDiff].filter(
        (p) => p !== repCorrecte,
      ),
    ]
  }

  versionOriginale: () => void = () => {
    // Version de l'image (Moyenne différente, Médiane égale)
    this.appliquerLesValeurs([9, 11, 13], [10, 17])
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    // Configurations pré-calculées pour garantir l'équité des 4 cas (et des moyennes rondes)
    const donnees: [number[], number[]][] = [
      // CAS A : Moyennes = et Médianes =
      [
        [9, 11, 13],
        [10, 12],
      ],
      [
        [8, 12, 16],
        [10, 14],
      ],
      [
        [10, 14, 18],
        [12, 16],
      ],
      // CAS B : Moyennes = et Médianes différentes
      [
        [8, 10, 15],
        [11, 11],
      ],
      [
        [7, 9, 14],
        [10, 10],
      ],
      [
        [10, 12, 17],
        [13, 13],
      ],
      // CAS C : Moyennes différentes et Médianes =
      [
        [9, 11, 13],
        [10, 17],
      ],
      [
        [8, 12, 16],
        [11, 18],
      ],
      [
        [10, 14, 18],
        [12, 21],
      ],
      // CAS D : Moyennes différentes et Médianes différentes
      [
        [9, 11, 13],
        [14, 18],
      ],
      [
        [8, 12, 16],
        [5, 9],
      ],
      [
        [10, 14, 18],
        [15, 18],
      ],
    ]

    let compteur = 0
    do {
      const configurationChoisie = choice(donnees)
      this.appliquerLesValeurs(configurationChoisie[0], configurationChoisie[1])
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
        /Laquelle des quatre propositions est vraie \?\s*$/,
        'Calculer la moyenne et la médiane de la nouvelle série.',
      )
    this.correctionCourte = () =>
      `$\\bullet$ ${texteGras('Nouvelle série')} ($${this.nouvelleSerie.join(' ; ')}$) :<br>La moyenne est : $\\dfrac{${this.nouvelleSerie.join(' + ')}}{5} = ${miseEnEvidence(String(this.moyenneNouvelleSerie))}$.<br>La médiane est la $3^{\\text{e}}$ valeur (car la série ordonnée comporte $5$ notes) : $${miseEnEvidence(String(this.medianeNouvelleSerie))}$.`
    this.clavierReponseCourte = KeyboardType.clavierNumbers
    this.options = { vertical: true }
  }
}
