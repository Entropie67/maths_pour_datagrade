// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 43516 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
// import ExerciceQcmA from '../../ExerciceQcmA'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = '43516'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calculer une somme de nombres'
export const dateDePublication = '18/01/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoC4eOld extends ExerciceQcmA {
  private appliquerLesValeurs(
    partieEntiere: number,
    partieDecimale: number,
    denominateur: number,
    typeBonneReponse: 'decimal' | 'fraction',
  ): void {
    // Calcul du résultat
    const resultatDecimal = partieEntiere + partieDecimale + 1 / denominateur

    // Construction du numérateur de la fraction correcte
    const numerateurFraction =
      partieEntiere * denominateur + partieDecimale * denominateur + 1

    // Énoncé
    this.enonce = `On considère $A = ${texNombre(partieEntiere)} + ${texNombre(partieDecimale)} + \\dfrac{1}{${texNombre(denominateur)}}$. <br>
    On a :`

    // Créer tous les distracteurs possibles
    const tousLesDistracteursDecimaux = [
      `$A = ${texNombre(partieEntiere + partieDecimale + 0.1)}$`,
      `$A = ${texNombre(partieEntiere + 1 / denominateur)}$`,
      `$A = ${texNombre(partieEntiere + partieDecimale)}$`,
      `$A = ${texNombre(partieEntiere + partieDecimale + 0.01)}$`,
      `$A = ${texNombre(partieEntiere + partieDecimale + 0.11)}$`,
      `$A = ${texNombre(partieEntiere + 0.01 + 1 / denominateur)}$`,
      `$A = ${texNombre(partieEntiere + 0.1)}$`,
      `$A = ${texNombre(partieEntiere + 1)}$`,
      `$A = ${texNombre(partieEntiere + partieDecimale + 1)}$`,
      `$A = ${texNombre(partieEntiere + partieDecimale + 0.001)}$`,
      `$A = ${texNombre(partieEntiere + 0.001)}$`,
    ]

    const tousLesDistracteursFractions = [
      `$A = \\dfrac{${texNombre(partieEntiere + denominateur)}}{${texNombre(denominateur)}}$`,
      `$A = \\dfrac{${texNombre(partieEntiere * denominateur + 1)}}{${texNombre(denominateur)}}$`,
      `$A = \\dfrac{${texNombre(partieEntiere * denominateur + partieDecimale * 10 * denominateur)}}{${texNombre(denominateur)}}$`,
      `$A = \\dfrac{${texNombre(partieEntiere * denominateur)}}{${texNombre(denominateur)}}$`,
      `$A = \\dfrac{${texNombre(Math.round((partieEntiere + partieDecimale) * denominateur))}}{${texNombre(denominateur)}}$`,
      `$A = \\dfrac{${texNombre(partieEntiere * denominateur + 10)}}{${texNombre(denominateur)}}$`,
    ]

    if (typeBonneReponse === 'decimal') {
      const bonneReponse = `$A = ${texNombre(resultatDecimal)}$`

      // Filtrer les distracteurs décimaux différents de la bonne réponse et éliminer les doublons
      const distracteursDisponiblesDecimaux = shuffle(
        [...new Set(tousLesDistracteursDecimaux)].filter(
          (d) => d !== bonneReponse,
        ),
      )

      // Prendre 1 distracteur décimal aléatoire
      const distracteurDecimal = distracteursDisponiblesDecimaux[0]

      // Prendre 2 distracteurs fractions aléatoires
      const distracteursFractionsSelectionnes = shuffle(
        tousLesDistracteursFractions,
      ).slice(0, 2)

      this.reponses = [
        bonneReponse,
        distracteurDecimal,
        ...distracteursFractionsSelectionnes,
      ]

      this.correction = `On a : <br>$\\begin{aligned}  
      A &= ${texNombre(partieEntiere)} + ${texNombre(partieDecimale)} + \\dfrac{1}{${texNombre(denominateur)}}\\\\
      & = ${texNombre(partieEntiere + partieDecimale)} + ${texNombre(1 / denominateur)}\\\\
      & = ${miseEnEvidence(texNombre(resultatDecimal))}
      \\end{aligned}$.`
    } else {
      const bonneReponse = `$A = \\dfrac{${texNombre(numerateurFraction)}}{${texNombre(denominateur)}}$`
      const bonneReponseDecimale = `$A = ${texNombre(resultatDecimal)}$`

      // Filtrer les distracteurs fractions différents de la bonne réponse et éliminer les doublons
      const distracteursDisponiblesFractions = shuffle(
        [...new Set(tousLesDistracteursFractions)].filter(
          (d) => d !== bonneReponse,
        ),
      )

      // Prendre 1 distracteur fraction aléatoire
      const distracteurFraction = distracteursDisponiblesFractions[0]

      // Filtrer les distracteurs décimaux et éliminer les doublons
      const distracteursDisponiblesDecimaux = shuffle(
        [...new Set(tousLesDistracteursDecimaux)].filter(
          (d) => d !== bonneReponseDecimale,
        ),
      )

      // Prendre 2 distracteurs décimaux aléatoires
      const distracteursDecimauxSelectionnes =
        distracteursDisponiblesDecimaux.slice(0, 2)

      this.reponses = [
        bonneReponse,
        distracteurFraction,
        ...distracteursDecimauxSelectionnes,
      ]

      const numerateurEntier = partieEntiere * denominateur
      const numerateurDecimal = partieDecimale * denominateur

      this.correction = `On a : <br>
      
      $\\begin{aligned}
      A &= ${texNombre(partieEntiere)} + ${texNombre(partieDecimale)} + \\dfrac{1}{${texNombre(denominateur)}}\\\\
      & = \\dfrac{${texNombre(numerateurEntier)}}{${texNombre(denominateur)}} + \\dfrac{${texNombre(numerateurDecimal)}}{${texNombre(denominateur)}} + \\dfrac{1}{${texNombre(denominateur)}}\\\\
      & = ${miseEnEvidence('\\dfrac{' + texNombre(numerateurFraction) + '}{' + texNombre(denominateur) + '}')}
      \\end{aligned}$.<br>`
    }
  }

  versionOriginale: () => void = () => {
    // Version originale conforme à l'image : 10 + 0,1 + 1/1000 = 10,101
    this.enonce = `On considère $A = ${texNombre(10)} + ${texNombre(0.1)} + \\dfrac{1}{${texNombre(1000)}}$. On a :`

    this.reponses = [
      `$A = ${texNombre(10.101)}$`,
      `$A = \\dfrac{20^{-1}}{${texNombre(1000)}}$`,
      `$A = \\dfrac{1}{${texNombre(1000)}}$`,
      `$A = ${texNombre(10.11)}$`,
    ]

    this.correction = `On a : <br>
    $\\begin{aligned}
    A &= ${texNombre(10)} + ${texNombre(0.1)} + \\dfrac{1}{${texNombre(1000)}}\\\\
    &= ${texNombre(10.1)} + ${texNombre(0.001)}\\\\
    &= ${miseEnEvidence(texNombre(10.101))}
    \\end{aligned}$.`
  }

  versionAleatoire: () => void = () => {
    // Configurations possibles : [partieEntiere, partieDecimale, denominateur]
    const configurations = [
      [10, 0.1, 1000],
      [100, 0.01, 100],
      [1000, 0.1, 10],
      [10, 0.01, 100],
      [100, 0.1, 1000],
      [10, 0.1, 10],
      [10, 0.001, 1000],
      [100, 0.001, 1000],
      [1000, 0.001, 1000],
    ]

    const config = choice(configurations)
    const typeBonneReponse = choice(['decimal', 'fraction'] as const)

    this.appliquerLesValeurs(config[0], config[1], config[2], typeBonneReponse)
  }

  constructor() {
    super()
    this.tip = `
  <p style="margin: 0 0 10px 0;">
    Il faut additionner un entier, un nombre décimal et une fraction décimale.
  </p>
  <ul style="list-style-type: disc; padding-left: 1.5em; margin: 0 0 14px 0; line-height: 2;">
    <li>Identifier séparément la partie entière, la partie décimale et la fraction.</li>
    <li>Convertir la fraction décimale en écriture décimale ou vice-versa.</li>
    <li>Vérifier les propositions en repérant les erreurs classiques de virgule pour vous piéger.</li>
  </ul>`
  }
}
