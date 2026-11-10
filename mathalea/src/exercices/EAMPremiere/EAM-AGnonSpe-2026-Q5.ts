import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = 'ff84b'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  'Déterminer le calcul permettant de calculer un prix final après une évolution'
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ5AGns2026 extends ExerciceQcmACourt {
  private calculPrix = ''
  private prixApresEvolution = ''

  private appliquerLesValeurs(
    valeur: number,
    p: number,
    typeEvolution: 'augmentation' | 'réduction',
    typeForme: 1 | 2 | 3,
    distracteurs?: string[],
  ): void {
    const decimalP = p / 100
    const strDecimalP = texNombre(decimalP, 2)
    const signe = typeEvolution === 'augmentation' ? '+' : '-'
    const strVal = String(valeur)

    this.enonce = `Un article à $${strVal}$ € coûtera après une ${typeEvolution} de $${p}\\,\\%$ :`

    let repCorrecteMath = ''
    let explication = ''

    // Génération de la bonne réponse SANS les dollars pour pouvoir utiliser miseEnEvidence
    if (typeForme === 1) {
      // Forme : Coefficient multiplicateur (ex: 200 x 1.2)
      const cm = typeEvolution === 'augmentation' ? 1 + decimalP : 1 - decimalP
      repCorrecteMath = `${strVal} \\times ${texNombre(cm, 2)}`
      explication = `Une ${typeEvolution} de $${p}\\,\\%$ revient à multiplier le prix initial par le coefficient multiplicateur $1 ${signe} \\dfrac{${p}}{100} = ${texNombre(cm, 2)}$.<br>Le calcul est donc : $${miseEnEvidence(repCorrecteMath)}$.`
    } else if (typeForme === 2) {
      // Forme : Fraction (ex: 200 x 120/100)
      const num = typeEvolution === 'augmentation' ? 100 + p : 100 - p
      repCorrecteMath = `${strVal} \\times \\dfrac{${num}}{100}`
      explication = `Une ${typeEvolution} de $${p}\\,\\%$ revient à prendre $100\\,\\% ${signe} ${p}\\,\\% = ${num}\\,\\%$ du prix initial.<br>Le calcul est donc : $${miseEnEvidence(repCorrecteMath)}$.`
    } else {
      // Forme : Additive/Soustractive (ex: 200 + 0.2 x 200)
      repCorrecteMath =
        typeEvolution === 'augmentation'
          ? `${strVal} + ${strDecimalP} \\times ${strVal}`
          : `${strVal} - ${strDecimalP} \\times ${strVal}`
      const motEvo =
        typeEvolution === 'augmentation' ? "l'augmentation" : 'la réduction'
      const motOp = typeEvolution === 'augmentation' ? 'ajoute' : 'soustrait'
      explication = `On calcule d'abord le montant de ${motEvo} : $${p}\\,\\%$ de $${strVal}$ s'écrit $${strDecimalP} \\times ${strVal}$.<br>`
      explication += `Puis on ${motOp} ce montant au prix initial.<br>Le calcul est donc : $${miseEnEvidence(repCorrecteMath)}$.`
    }

    this.calculPrix = repCorrecteMath
    this.prixApresEvolution = texNombre(
      valeur * (typeEvolution === 'augmentation' ? 1 + decimalP : 1 - decimalP),
      2,
    )
    // On rajoute les dollars à la toute fin pour le QCM
    const repCorrecte = `$${repCorrecteMath}$`

    if (distracteurs && distracteurs.length >= 3) {
      this.reponses = [
        repCorrecte,
        distracteurs[0],
        distracteurs[1],
        distracteurs[2],
      ]
    } else {
      const cmOppose =
        typeEvolution === 'augmentation' ? 1 - decimalP : 1 + decimalP
      const erreurModAdd =
        typeEvolution === 'augmentation'
          ? `$100 \\times ${strDecimalP} + ${strVal}$`
          : `$${strVal} - 100 \\times ${strDecimalP}$`

      let mauvaisesReponses = [
        `$${strVal} ${signe} ${strDecimalP}$`, // Ajouter/soustraire le décimal brut
        `$${strVal} \\times \\dfrac{${p}}{100}$`, // Calculer juste l'évolution
        `$${strVal} \\times ${texNombre(cmOppose, 2)}$`, // Se tromper de signe pour le CM
        erreurModAdd, // Mauvaise modélisation avec 100
        `$${strVal} \\times ${strDecimalP}$`, // Oublier le "1" du CM
      ]

      // On filtre pour être sûr à 100% que la bonne réponse n'est pas dans le tableau
      mauvaisesReponses = mauvaisesReponses.filter((rep) => rep !== repCorrecte)

      // On prend la bonne réponse et les 3 premières mauvaises réponses
      this.reponses = [
        repCorrecte,
        mauvaisesReponses[0],
        mauvaisesReponses[1],
        mauvaisesReponses[2],
      ]
    }

    this.correction = explication
  }

  versionOriginale: () => void = () => {
    // Reproduction exacte de la question 5 de l'image
    this.appliquerLesValeurs(200, 20, 'augmentation', 1, [
      `$200 + 0,2$`,
      `$200 \\times \\dfrac{20}{100}$`,
      `$100 \\times 0,20 + 200$`,
    ])
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    do {
      // Tirage de valeurs cohérentes pour des prix
      const valeur = choice([40, 50, 80, 120, 150, 200, 250, 300, 400])
      const p = choice([5, 10, 15, 20, 25, 30, 40, 50, 60])

      // On varie entre augmentation et réduction, et on tire une des 3 formes de formules attendues
      const typeEvo = choice(['augmentation', 'réduction']) as
        'augmentation' | 'réduction'
      const forme = choice([1, 2, 3]) as 1 | 2 | 3

      this.appliquerLesValeurs(valeur, p, typeEvo, forme)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { nombreDecimalSeulement: true })
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    // Même question, en interactif ou non : le QCM « … coûtera après … : » devient une vraie question
    this.enonceCourt = () =>
      this.enonce.replace(
        /^Un article à (.*) coûtera après (.*?)\s*:\s*$/,
        (_, prix: string, evolution: string) =>
          `Combien coûtera un article à ${prix}, après ${evolution}${sp()}?`,
      )
    // Le calcul du QCM est remplacé par son résultat
    this.reponseCourte = () => this.prixApresEvolution
    this.correctionCourte = () =>
      `${(this.correction ?? '').replace(miseEnEvidence(this.calculPrix), () => this.calculPrix)}<br>Le prix de l'article est donc de $${this.calculPrix} = ${miseEnEvidence(this.prixApresEvolution)}$ €.`
    this.clavierReponseCourte = KeyboardType.clavierNumbers
    this.texteApresReponseCourte = ' €.'
  }
}
