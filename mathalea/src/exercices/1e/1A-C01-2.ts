import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
// import ExerciceQcmA from '../../ExerciceQcmA'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = '21ea5'
export const refs = {
  'fr-fr': ['1A-C01-2', '2A-N1-1'],
  'fr-ch': ['11CTQCMNO-2', '11LCQCMNO-2', '11LSQCMNO-2'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Trouver le plus grand ou le plus petit nombre'
export const dateDePublication = '03/09/2025'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora (avec ia Claude)
 *
 */
export default class Auto1AC1b extends ExerciceQcmA {
  // Fonction pour convertir une fraction simple en décimal
  private fractionVersDecimal(
    numerateur: number,
    denominateur: number,
  ): number {
    return numerateur / denominateur
  }

  // Fonction pour formater l'affichage d'une fraction
  private formaterFraction(numerateur: number, denominateur: number): string {
    return `\\dfrac{${numerateur}}{${texNombre(denominateur)}}`
  }

  // Fonction pour formater l'affichage d'une puissance de 10
  private formaterPuissance(mantisse: number, exposant: number): string {
    if (mantisse === 1) {
      return `10^{${exposant}}`
    }
    return `${mantisse} \\times 10^{${exposant}}`
  }

  // Fonction pour la ligne de correction - modifiée pour être cohérente
  private construireLigneCorrection(
    tex: string,
    val: number,
    denominateur: number | null = null,
  ): string {
    const valeurDecimale = texNombre(Math.round(val * 10000) / 10000)

    // Si c'est une fraction avec dénominateur 10, 100 ou 1000, on affiche directement la valeur décimale
    if (denominateur !== null && [10, 100, 1000].includes(denominateur)) {
      return `$${tex} = ${valeurDecimale}$ <br><br>`
    } else if (
      tex.includes(',') &&
      !tex.includes('\\times') &&
      !tex.includes('^')
    ) {
      // C'est déjà un nombre décimal
      return `$${tex}$ <br><br>`
    } else if (tex.includes('\\dfrac')) {
      // C'est une fraction (pas 10, 100, 1000)
      return `$${tex} = ${valeurDecimale}$ <br><br>`
    } else if (tex.includes('\\times') || tex.includes('^')) {
      // C'est une puissance de 10
      return `$${tex} = ${valeurDecimale}$ <br><br>`
    }

    return `$${tex} = ${valeurDecimale}$ <br><br>`
  }

  versionOriginale: () => void = () => {
    this.enonce = `Parmi les quatre nombres suivants, lequel est le plus grand ?`

    this.correction = `Pour comparer ces quatre nombres, on les écrit sous forme décimale :<br><br>
    $\\dfrac{9}{4}= 2,25$ <br><br>
    $\\dfrac{123}{100}= 1,23$ <br><br>
    $595 \\times 10^{-2} = 5,95$ <br><br>
    $5,4$ <br><br>
    On a donc : $1,23 < 2,25 < 5,4 < 5,95$<br><br>
    Le plus grand nombre est donc : $${miseEnEvidence('595 \\times 10^{-2}')}$.`

    this.reponses = [
      '$595\\times 10^{-2}$',
      '$5,4$',
      '$\\dfrac{9}{4}$',
      `$\\dfrac{123}{${texNombre(100)}}$`,
    ]
  }

  versionAleatoire: () => void = () => {
    let compteur = 0
    do {
      // 25 cas différents avec 4 nombres chacun (uniquement fractions avec décimaux exacts)
      const cas = [
        // Cas 1
        {
          fractionSimple: { num: 1, den: 4, val: 0.25 },
          fractionStandard: { num: 23, den: 100, val: 0.23 },
          puissance: { mantisse: 3, exp: -1, val: 0.3 },
          decimal: { val: 0.27 },
        },
        // Cas 2
        {
          fractionSimple: { num: 3, den: 8, val: 0.375 },
          fractionStandard: { num: 4, den: 10, val: 0.4 },
          puissance: { mantisse: 38, exp: -2, val: 0.38 },
          decimal: { val: 0.35 },
        },
        // Cas 3
        {
          fractionSimple: { num: 2, den: 5, val: 0.4 },
          fractionStandard: { num: 415, den: 1000, val: 0.415 },
          puissance: { mantisse: 1, exp: -1, val: 0.1 },
          decimal: { val: 0.42 },
        },
        // Cas 4
        {
          fractionSimple: { num: 5, den: 8, val: 0.625 },
          fractionStandard: { num: 6, den: 10, val: 0.6 },
          puissance: { mantisse: 65, exp: -2, val: 0.65 },
          decimal: { val: 0.63 },
        },
        // Cas 5
        {
          fractionSimple: { num: 3, den: 4, val: 0.75 },
          fractionStandard: { num: 72, den: 100, val: 0.72 },
          puissance: { mantisse: 8, exp: -1, val: 0.8 },
          decimal: { val: 0.78 },
        },
        // Cas 6
        {
          fractionSimple: { num: 1, den: 5, val: 0.2 },
          fractionStandard: { num: 175, den: 1000, val: 0.175 },
          puissance: { mantisse: 18, exp: -2, val: 0.18 },
          decimal: { val: 0.19 },
        },
        // Cas 7
        {
          fractionSimple: { num: 4, den: 5, val: 0.8 },
          fractionStandard: { num: 85, den: 100, val: 0.85 },
          puissance: { mantisse: 9, exp: -1, val: 0.9 },
          decimal: { val: 0.88 },
        },
        // Cas 8
        {
          fractionSimple: { num: 1, den: 8, val: 0.125 },
          fractionStandard: { num: 12, den: 100, val: 0.12 },
          puissance: { mantisse: 13, exp: -2, val: 0.13 },
          decimal: { val: 0.128 },
        },
        // Cas 9
        {
          fractionSimple: { num: 3, den: 5, val: 0.6 },
          fractionStandard: { num: 625, den: 1000, val: 0.625 },
          puissance: { mantisse: 58, exp: -2, val: 0.58 },
          decimal: { val: 0.61 },
        },
        // Cas 10
        {
          fractionSimple: { num: 9, den: 8, val: 1.125 },
          fractionStandard: { num: 11, den: 10, val: 1.1 },
          puissance: { mantisse: 115, exp: -2, val: 1.15 },
          decimal: { val: 1.12 },
        },
        // Cas 11
        {
          fractionSimple: { num: 5, den: 4, val: 1.25 },
          fractionStandard: { num: 128, den: 100, val: 1.28 },
          puissance: { mantisse: 13, exp: -1, val: 1.3 },
          decimal: { val: 1.27 },
        },
        // Cas 12
        {
          fractionSimple: { num: 7, den: 5, val: 1.4 },
          fractionStandard: { num: 1375, den: 1000, val: 1.375 },
          puissance: { mantisse: 142, exp: -2, val: 1.42 },
          decimal: { val: 1.38 },
        },
        // Cas 13
        {
          fractionSimple: { num: 3, den: 2, val: 1.5 },
          fractionStandard: { num: 148, den: 100, val: 1.48 },
          puissance: { mantisse: 15, exp: -1, val: 1.5 },
          decimal: { val: 1.52 },
        },
        // Cas 14
        {
          fractionSimple: { num: 8, den: 5, val: 1.6 },
          fractionStandard: { num: 16, den: 10, val: 1.6 },
          puissance: { mantisse: 158, exp: -2, val: 1.58 },
          decimal: { val: 1.62 },
        },
        // Cas 15
        {
          fractionSimple: { num: 7, den: 4, val: 1.75 },
          fractionStandard: { num: 172, den: 100, val: 1.72 },
          puissance: { mantisse: 18, exp: -1, val: 1.8 },
          decimal: { val: 1.78 },
        },
        // Cas 16
        {
          fractionSimple: { num: 9, den: 5, val: 1.8 },
          fractionStandard: { num: 1825, den: 1000, val: 1.825 },
          puissance: { mantisse: 2, exp: 0, val: 2 },
          decimal: { val: 1.85 },
        },
        // Cas 17
        {
          fractionSimple: { num: 1, den: 2, val: 0.5 },
          fractionStandard: { num: 48, den: 100, val: 0.48 },
          puissance: { mantisse: 52, exp: -2, val: 0.52 },
          decimal: { val: 0.51 },
        },
        // Cas 18
        {
          fractionSimple: { num: 3, den: 10, val: 0.3 },
          fractionStandard: { num: 28, den: 100, val: 0.28 },
          puissance: { mantisse: 32, exp: -2, val: 0.32 },
          decimal: { val: 0.31 },
        },
        // Cas 19
        {
          fractionSimple: { num: 6, den: 5, val: 1.2 },
          fractionStandard: { num: 118, den: 100, val: 1.18 },
          puissance: { mantisse: 122, exp: -2, val: 1.22 },
          decimal: { val: 1.19 },
        },
        // Cas 20
        {
          fractionSimple: { num: 7, den: 10, val: 0.7 },
          fractionStandard: { num: 685, den: 1000, val: 0.685 },
          puissance: { mantisse: 72, exp: -2, val: 0.72 },
          decimal: { val: 0.69 },
        },
        // Cas 21
        {
          fractionSimple: { num: 9, den: 4, val: 2.25 },
          fractionStandard: { num: 22, den: 10, val: 2.2 },
          puissance: { mantisse: 228, exp: -2, val: 2.28 },
          decimal: { val: 2.24 },
        },
        // Cas 22
        {
          fractionSimple: { num: 1, den: 10, val: 0.1 },
          fractionStandard: { num: 95, den: 1000, val: 0.095 },
          puissance: { mantisse: 12, exp: -2, val: 0.12 },
          decimal: { val: 0.11 },
        },
        // Cas 23
        {
          fractionSimple: { num: 11, den: 5, val: 2.2 },
          fractionStandard: { num: 215, den: 100, val: 2.15 },
          puissance: { mantisse: 225, exp: -2, val: 2.25 },
          decimal: { val: 2.18 },
        },
        // Cas 24
        {
          fractionSimple: { num: 13, den: 8, val: 1.625 },
          fractionStandard: { num: 162, den: 100, val: 1.62 },
          puissance: { mantisse: 165, exp: -2, val: 1.65 },
          decimal: { val: 1.63 },
        },
        // Cas 25
        {
          fractionSimple: { num: 17, den: 10, val: 1.7 },
          fractionStandard: { num: 1695, den: 1000, val: 1.695 },
          puissance: { mantisse: 172, exp: -2, val: 1.72 },
          decimal: { val: 1.71 },
        },
      ]

      // Sélection aléatoire d'un cas
      const casChoisi = choice(cas)

      // Choix aléatoire entre plus grand ou plus petit
      const cherchePlusGrand = choice([true, false])

      // Construction des 4 nombres avec leurs représentations
      const nombres = [
        {
          tex: this.formaterFraction(
            casChoisi.fractionSimple.num,
            casChoisi.fractionSimple.den,
          ),
          val: this.fractionVersDecimal(
            casChoisi.fractionSimple.num,
            casChoisi.fractionSimple.den,
          ),
          denominateur: casChoisi.fractionSimple.den,
        },
        {
          tex: this.formaterFraction(
            casChoisi.fractionStandard.num,
            casChoisi.fractionStandard.den,
          ),
          val: casChoisi.fractionStandard.val,
          denominateur: casChoisi.fractionStandard.den,
        },
        {
          tex: this.formaterPuissance(
            casChoisi.puissance.mantisse,
            casChoisi.puissance.exp,
          ),
          val: casChoisi.puissance.val,
          denominateur: null,
        },
        {
          tex: texNombre(casChoisi.decimal.val),
          val: casChoisi.decimal.val,
          denominateur: null,
        },
      ]

      // Tri selon le critÃ¨re demandé
      const nombresTriesParValeur = [...nombres].sort((x, y) => x.val - y.val)
      const solution = cherchePlusGrand
        ? nombresTriesParValeur[nombresTriesParValeur.length - 1]
        : nombresTriesParValeur[0]

      // Construction de l'énoncé
      this.enonce = `Parmi les quatre nombres suivants, lequel est le ${cherchePlusGrand ? 'plus grand' : 'plus petit'} ?`

      // Construction de la correction
      let correctionTexte =
        'Pour comparer ces quatre nombres, on les écrit sous forme décimale :<br><br>'

      nombres.forEach((nombre) => {
        correctionTexte += this.construireLigneCorrection(
          nombre.tex,
          nombre.val,
          nombre.denominateur,
        )
      })

      const valeursTriees = nombresTriesParValeur
        .map((n) => texNombre(Math.round(n.val * 10000) / 10000))
        .join(' < ')

      correctionTexte += `On a donc : $${valeursTriees}$.<br>`
      correctionTexte += `Le ${cherchePlusGrand ? 'plus grand' : 'plus petit'} nombre est donc : $${miseEnEvidence(solution.tex)}$.`

      this.correction = correctionTexte

      // Construction des réponses (bonne réponse en premier)
      const autresNombres = nombres.filter((n) => n.tex !== solution.tex)

      this.reponses = [
        `$${solution.tex}$`,
        `$${autresNombres[0].tex}$`,
        `$${autresNombres[1].tex}$`,
        `$${autresNombres[2].tex}$`,
      ]
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true)) // On s'assure d'avoir 4 réponses différentes, sinon on régénère
  }

  constructor() {
    super()
    this.tip = `
  <p style="margin: 0 0 10px 0;">
    Pour comparer des nombres, selon les situations, il est souvent plus pratique de tous les écrire :
  </p>
  <ul style="list-style-type: disc; padding-left: 1.5em; margin: 0 0 14px 0; line-height: 2;">
    <li>sous forme de fractions de même dénominateur,</li>
    <li>sous forme décimale,</li>
    <li>en notation scientifique.</li>
  </ul>
   <p style="margin: 0 0 10px 0;">
   Le plus simple dans cet exercice est sans doute de les écrire sous forme décimale.
  </p>
 `
    this.versionAleatoire()
    this.spacing = 1
    this.spacingCorr = 1
  }
}
