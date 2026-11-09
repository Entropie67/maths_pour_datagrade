import Stat from '../../lib/mathFonctions/Stat'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = 'aeba5'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Interpréter un diagramme circulaire'
export const dateDePublication = '29/06/2026'
export const dateDeModifImportante = '22/10/2026'

// Légendes du diagramme (dans un \text{}) : les nombres sont en mode mathématique.
const ages = [
  '$6-9$ ans',
  '$10-14$ ans',
  '$15-24$ ans',
  '$25-35$ ans',
  '$35-49$ ans',
  '$50-65$ ans',
]
const agesMin = [6, 10, 15, 25, 35, 50]
const agesMax = [9, 14, 24, 35, 49, 65]

// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Jean-Claude Lhote
 *
 */
export default class AutoQ11AGt2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(
    raisonDiag: string,
    liste: number[],
    age: number,
    question: string,
    dist3: string,
  ): void {
    const serie = new Stat(
      liste.map((el, i) => [ages[i], el]),
      true,
      false,
    )
    const effectifsCumulesCroissants = liste.map((el, i, arr) =>
      arr.slice(0, i + 1).reduce((a, b) => a + b, 0),
    )
    const effectifsCumulesDecroissants = liste.map((el, i, arr) =>
      arr.slice(i).reduce((a, b) => a + b, 0),
    )
    const total = liste.reduce((a, b) => a + b, 0)

    serie.isQualitative = true
    this.enonce = `${raisonDiag}.<br>
    ${serie.diagrammeCirc({ percentVsEffectifs: true, effectifsOn: true, valuesOn: false })}<br>
    La proportion de joueurs ${question} est :`
    let sol: string
    let dist1: string
    let dist2: string
    let index: number
    let suiteCorrection: string
    if (question === `de $${age}$ ans et moins`) {
      index = agesMax.findIndex((el) => el === age)
      sol = `$${texNombre((effectifsCumulesCroissants[index] / total) * 100, 1)}\\,\\%$`
      dist1 = `$${texNombre((liste[index] / total) * 100, 1)}\\,\\%$`
      dist2 = `$${texNombre(
        100 - (effectifsCumulesCroissants[index] / total) * 100,
        1,
      )}\\,\\%$`
      suiteCorrection = `la somme des pourcentages des classes d'âge inférieures ou égales à $${age}$ ans, soit :<br>
      $${liste
        .slice(0, index + 1)
        .map((el, _i) => `${texNombre(el / 10, 1)}\\,\\%`)
        .join(
          '+',
        )}=${miseEnEvidence(texNombre((effectifsCumulesCroissants[index] / total) * 100, 1) + `\\,\\%`)}$`
    } else if (question === `de $${age}$ ans et plus`) {
      index = agesMin.findIndex((el) => el === age)
      sol = `$${texNombre((effectifsCumulesDecroissants[index] / total) * 100, 1)}\\,\\%$`
      dist1 = `$${texNombre((liste[index] / total) * 100, 1)}\\,\\%$`
      dist2 = `$${texNombre(
        100 - (effectifsCumulesDecroissants[index] / total) * 100,
        1,
      )}\\,\\%$`
      suiteCorrection = `la somme des pourcentages des classes d'âge supérieures ou égales à $${age}$ ans, soit :<br>
      $${liste
        .slice(index)
        .map((el, _i) => `${texNombre(el / 10, 1)}\\,\\%`)
        .join(
          '+',
        )}=${miseEnEvidence(texNombre((effectifsCumulesDecroissants[index] / total) * 100, 1) + `\\,\\%`)}$`
    } else if (question === `de moins de $${age}$ ans`) {
      index = agesMin.findIndex((el) => el === age)
      sol = `$${texNombre((effectifsCumulesCroissants[index - 1] / total) * 100, 1)}\\,\\%$`
      dist1 = `$${texNombre((liste[index] / total) * 100, 1)}\\,\\%$`
      dist2 = `$${texNombre(
        100 - (effectifsCumulesCroissants[index - 1] / total) * 100,
        1,
      )}\\,\\%$`
      suiteCorrection = `la somme des pourcentages des classes d'âge inférieures à $${age}$ ans, soit :<br>
      $${liste
        .slice(0, index)
        .map((el, _i) => `${texNombre(el / 10, 1)}\\,\\%`)
        .join(
          '+',
        )}=${miseEnEvidence(texNombre((effectifsCumulesCroissants[index - 1] / total) * 100, 1) + `\\,\\%`)}$`
    } else if (question === `de plus de $${age}$ ans`) {
      index = agesMax.findIndex((el) => el === age)
      sol = `$${texNombre((effectifsCumulesDecroissants[index + 1] / total) * 100, 1)}\\,\\%$`
      dist1 = `$${texNombre((liste[index + 1] / total) * 100, 1)}\\,\\%$`
      dist2 = `$${texNombre(
        100 - (effectifsCumulesDecroissants[index] / total) * 100,
        1,
      )}\\,\\%$`
      suiteCorrection = `la somme des pourcentages des classes d'âge supérieures à $${age}$ ans, soit :<br>
      $${liste
        .slice(index + 1)
        .map((el, _i) => `${texNombre(el / 10, 1)}\\,\\%`)
        .join(
          '+',
        )}=${miseEnEvidence(texNombre((effectifsCumulesDecroissants[index + 1] / total) * 100, 1) + `\\,\\%`)}$`
    } else {
      throw new Error(`question non prévue : ${question}`)
    }

    this.reponses = [sol, dist1, dist2, dist3]

    this.correction = `La proportion de joueurs ${question} est ${suiteCorrection}.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(
      `Le diagramme ci-dessous donne la répartition en pourcentage de joueurs de jeux vidéo selon leur âge`,
      [85, 125, 189, 186, 248, 167],
      24,
      'de $24$ ans et moins',
      '$\\dfrac{1}{3}$',
    )
  }

  /** Les effectifs du sujet officiel sont conservés ; les clones « aléatoires » les tirent. */
  effectifsDuSujet = true

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }
    const effectifs = this.effectifsDuSujet
      ? [85, 125, 189, 186, 248, 167]
      : Array.from({ length: 6 }, () => randint(100, 200))
    while (effectifs.reduce((a, b) => a + b, 0) < 1000) {
      const index = randint(0, 5)
      effectifs[index] += 1
    }
    while (effectifs.reduce((a, b) => a + b, 0) > 1000) {
      const index = randint(0, 5)
      if (effectifs[index] > 100) effectifs[index] -= 1
    }
    const choix = choice(['min', 'max'])
    const age =
      choix === 'min'
        ? choice(agesMin.slice(2, -2))
        : choice(agesMax.slice(2, -2))
    const question =
      choix === 'min'
        ? choice([`de $${age}$ ans et plus`, `de moins de $${age}$ ans`])
        : choice([`de $${age}$ ans et moins`, `de plus de $${age}$ ans`])
    const dist3 = choice([
      '$\\dfrac{1}{3}$',
      '$\\dfrac{1}{6}$',
      '$\\dfrac{1}{5}$',
    ])
    this.appliquerLesValeurs(
      `Le diagramme ci-dessous donne la répartition en pourcentage de joueurs de jeux vidéo selon leur âge`,
      effectifs,
      age,
      question,
      dist3,
    )
  }

  constructor() {
    super()
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { nombreDecimalSeulement: true })
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /La proportion de joueurs (.*) est :\s*$/,
        (_, tranche: string) =>
          this.interactif
            ? `La proportion de joueurs ${tranche} est `
            : `Calculer, en pourcentage, la proportion de joueurs ${tranche}.`,
      )
    // La bonne réponse du QCM est de la forme « $45,5\\,\\%$ » : on ne garde que le nombre
    this.reponseCourte = () =>
      this.reponses[0]
        .replace(/\\,\\%/, '')
        .replace(/\$/g, '')
        .replace(/\\,/g, '')
    this.clavierReponseCourte = KeyboardType.clavierNumbers
    this.champReponseCourteEnLigne = true
    this.texteApresReponseCourte = ' %.'
  }
}
