// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 73991 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
// import ExerciceQcmA from '../../ExerciceQcmA'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = '73991'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calculer avec tiers, quart, demi, ...'
export const dateDePublication = '29/09/2025'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoC4cOld extends ExerciceQcmA {
  versionOriginale: () => void = () => {
    this.enonce = `Le tiers d'un quart correspond à la fraction  : `
    this.correction = ` Le tiers d'un quart est égal à $\\dfrac{1}{3}\\times \\dfrac{1}{4}$ soit  $${miseEnEvidence('\\dfrac{1}{12}')}$.
  `

    this.reponses = [
      '$\\dfrac{1}{12}$',
      '$\\dfrac{1}{7}$',
      `$\\dfrac{3}{4}$`,
      '$\\dfrac{1}{3}\\times 4$',
    ]
  }

  versionAleatoire: () => void = () => {
    switch (randint(1, 25)) {
      case 1:
        this.enonce = `Le tiers d'un demi correspond à la fraction : `
        this.correction = `Le tiers d'un demi est égal à $\\dfrac{1}{3}\\times \\dfrac{1}{2}$ soit $${miseEnEvidence('\\dfrac{1}{6}')}$.`
        this.reponses = [
          '$\\dfrac{1}{6}$',
          '$\\dfrac{1}{5}$',
          '$\\dfrac{2}{3}$',
          '$\\dfrac{3}{2}$',
        ]
        break

      case 2:
        this.enonce = `La moitié d'un tiers correspond à la fraction : `
        this.correction = `La moitié d'un tiers est égal à $\\dfrac{1}{2}\\times \\dfrac{1}{3}$ soit $${miseEnEvidence('\\dfrac{1}{6}')}$.`
        this.reponses = [
          '$\\dfrac{1}{6}$',
          '$\\dfrac{1}{5}$',
          '$\\dfrac{2}{3}$',
          '$\\dfrac{3}{2}$',
        ]
        break

      case 3:
        this.enonce = `La moitié d'un quart correspond à la fraction : `
        this.correction = `La moitié d'un quart est égal à $\\dfrac{1}{2}\\times \\dfrac{1}{4}$ soit $${miseEnEvidence('\\dfrac{1}{8}')}$.`
        this.reponses = [
          '$\\dfrac{1}{8}$',
          '$\\dfrac{1}{6}$',
          '$\\dfrac{2}{4}$',
          '$\\dfrac{4}{2}$',
        ]
        break

      case 4:
        this.enonce = `Le cinquième d'un tiers correspond à la fraction : `
        this.correction = `Le cinquième d'un tiers est égal à $\\dfrac{1}{5}\\times \\dfrac{1}{3}$ soit $${miseEnEvidence('\\dfrac{1}{15}')}$.`
        this.reponses = [
          '$\\dfrac{1}{15}$',
          '$\\dfrac{1}{8}$',
          '$\\dfrac{5}{3}$',
          '$\\dfrac{3}{5}$',
        ]
        break

      case 5:
        this.enonce = `Le cinquième d'un quart correspond à la fraction : `
        this.correction = `Le cinquième d'un quart est égal à $\\dfrac{1}{5}\\times \\dfrac{1}{4}$ soit $${miseEnEvidence('\\dfrac{1}{20}')}$.`
        this.reponses = [
          '$\\dfrac{1}{20}$',
          '$\\dfrac{1}{9}$',
          '$\\dfrac{5}{4}$',
          '$\\dfrac{4}{5}$',
        ]
        break

      case 6:
        this.enonce = `La moitié d'un cinquième correspond à la fraction : `
        this.correction = `La moitié d'un cinquième est égal à $\\dfrac{1}{2}\\times \\dfrac{1}{5}$ soit $${miseEnEvidence('\\dfrac{1}{10}')}$.`
        this.reponses = [
          '$\\dfrac{1}{10}$',
          '$\\dfrac{1}{7}$',
          '$\\dfrac{2}{5}$',
          '$\\dfrac{5}{2}$',
        ]
        break

      case 7:
        this.enonce = `Le quart d'un tiers correspond à la fraction : `
        this.correction = `Le quart d'un tiers est égal à $\\dfrac{1}{4}\\times \\dfrac{1}{3}$ soit $${miseEnEvidence('\\dfrac{1}{12}')}$.`
        this.reponses = [
          '$\\dfrac{1}{12}$',
          '$\\dfrac{1}{7}$',
          '$\\dfrac{4}{3}$',
          '$\\dfrac{3}{4}$',
        ]
        break

      case 8:
        this.enonce = `Le sixième d'un demi correspond à la fraction : `
        this.correction = `Le sixième d'un demi est égal à $\\dfrac{1}{6}\\times \\dfrac{1}{2}$ soit $${miseEnEvidence('\\dfrac{1}{12}')}$.`
        this.reponses = [
          '$\\dfrac{1}{12}$',
          '$\\dfrac{1}{8}$',
          '$\\dfrac{6}{2}$',
          '$\\dfrac{2}{6}$',
        ]
        break

      case 9:
        this.enonce = `Le tiers d'un sixième correspond à la fraction : `
        this.correction = `Le tiers d'un sixième est égal à $\\dfrac{1}{3}\\times \\dfrac{1}{6}$ soit $${miseEnEvidence('\\dfrac{1}{18}')}$.`
        this.reponses = [
          '$\\dfrac{1}{18}$',
          '$\\dfrac{1}{9}$',
          '$\\dfrac{3}{6}$',
          '$\\dfrac{6}{3}$',
        ]
        break

      case 10:
        this.enonce = `Le quart d'un cinquième correspond à la fraction : `
        this.correction = `Le quart d'un cinquième est égal à $\\dfrac{1}{4}\\times \\dfrac{1}{5}$ soit $${miseEnEvidence('\\dfrac{1}{20}')}$.`
        this.reponses = [
          '$\\dfrac{1}{20}$',
          '$\\dfrac{1}{9}$',
          '$\\dfrac{4}{5}$',
          '$\\dfrac{5}{4}$',
        ]
        break

      case 11:
        this.enonce = `Le huitième d'un demi correspond à la fraction : `
        this.correction = `Le huitième d'un demi est égal à $\\dfrac{1}{8}\\times \\dfrac{1}{2}$ soit $${miseEnEvidence('\\dfrac{1}{16}')}$.`
        this.reponses = [
          '$\\dfrac{1}{16}$',
          '$\\dfrac{1}{10}$',
          '$\\dfrac{8}{2}$',
          '$\\dfrac{2}{8}$',
        ]
        break

      case 12:
        this.enonce = `Le dixième d'un tiers correspond à la fraction : `
        this.correction = `Le dixième d'un tiers est égal à $\\dfrac{1}{10}\\times \\dfrac{1}{3}$ soit $${miseEnEvidence('\\dfrac{1}{30}')}$.`
        this.reponses = [
          '$\\dfrac{1}{30}$',
          '$\\dfrac{1}{13}$',
          '$\\dfrac{10}{3}$',
          '$\\dfrac{3}{10}$',
        ]
        break

      case 13:
        this.enonce = `Le septième d'un quart correspond à la fraction : `
        this.correction = `Le septième d'un quart est égal à $\\dfrac{1}{7}\\times \\dfrac{1}{4}$ soit $${miseEnEvidence('\\dfrac{1}{28}')}$.`
        this.reponses = [
          '$\\dfrac{1}{28}$',
          '$\\dfrac{1}{11}$',
          '$\\dfrac{7}{4}$',
          '$\\dfrac{4}{7}$',
        ]
        break

      case 14:
        this.enonce = `Le neuvième d'un demi correspond à la fraction : `
        this.correction = `Le neuvième d'un demi est égal à $\\dfrac{1}{9}\\times \\dfrac{1}{2}$ soit $${miseEnEvidence('\\dfrac{1}{18}')}$.`
        this.reponses = [
          '$\\dfrac{1}{18}$',
          '$\\dfrac{1}{11}$',
          '$\\dfrac{9}{2}$',
          '$\\dfrac{2}{9}$',
        ]
        break

      case 15:
        this.enonce = `Le cinquième d'un sixième correspond à la fraction : `
        this.correction = `Le cinquième d'un sixième est égal à $\\dfrac{1}{5}\\times \\dfrac{1}{6}$ soit $${miseEnEvidence('\\dfrac{1}{30}')}$.`
        this.reponses = [
          '$\\dfrac{1}{30}$',
          '$\\dfrac{1}{11}$',
          '$\\dfrac{5}{6}$',
          '$\\dfrac{6}{5}$',
        ]
        break

      case 16:
        this.enonce = `Les deux tiers d'un quart correspondent à la fraction : `
        this.correction = `Les deux tiers d'un quart est égal à $\\dfrac{2}{3}\\times \\dfrac{1}{4}$ soit $${miseEnEvidence('\\dfrac{2}{12} = \\dfrac{1}{6}')}$.`
        this.reponses = [
          '$\\dfrac{1}{6}$',
          '$\\dfrac{2}{7}$',
          '$\\dfrac{6}{4}$',
          '$\\dfrac{8}{3}$',
        ]
        break

      case 17:
        this.enonce = `Les trois quarts d'un demi correspondent à la fraction : `
        this.correction = `Les trois quarts d'un demi est égal à $\\dfrac{3}{4}\\times \\dfrac{1}{2}$ soit $${miseEnEvidence('\\dfrac{3}{8}')}$.`
        this.reponses = [
          '$\\dfrac{3}{8}$',
          '$\\dfrac{3}{6}$',
          '$\\dfrac{7}{4}$',
          '$\\dfrac{4}{6}$',
        ]
        break

      case 18:
        this.enonce = `Les deux cinquièmes d'un tiers correspondent à la fraction : `
        this.correction = `Les deux cinquièmes d'un tiers est égal à $\\dfrac{2}{5}\\times \\dfrac{1}{3}$ soit $${miseEnEvidence('\\dfrac{2}{15}')}$.`
        this.reponses = [
          '$\\dfrac{2}{15}$',
          '$\\dfrac{2}{8}$',
          '$\\dfrac{7}{5}$',
          '$\\dfrac{5}{8}$',
        ]
        break

      case 19:
        this.enonce = `Les deux cinquièmes d'un quart correspondent à la fraction : `
        this.correction = `Les deux cinquièmes d'un quart est égal à $\\dfrac{2}{5}\\times \\dfrac{1}{4}$ soit $${miseEnEvidence('\\dfrac{2}{20} = \\dfrac{1}{10}')}$.`
        this.reponses = [
          '$\\dfrac{1}{10}$',
          '$\\dfrac{2}{9}$',
          '$\\dfrac{6}{5}$',
          '$\\dfrac{7}{4}$',
        ]
        break

      case 20:
        this.enonce = `Les trois cinquièmes d'un demi correspondent à la fraction : `
        this.correction = `Les trois cinquièmes d'un demi est égal à $\\dfrac{3}{5}\\times \\dfrac{1}{2}$ soit $${miseEnEvidence('\\dfrac{3}{10}')}$.`
        this.reponses = [
          '$\\dfrac{3}{10}$',
          '$\\dfrac{3}{7}$',
          '$\\dfrac{8}{5}$',
          '$\\dfrac{5}{7}$',
        ]
        break

      case 21:
        this.enonce = `Les quatre cinquièmes d'un tiers correspondent à la fraction : `
        this.correction = `Les quatre cinquièmes d'un tiers est égal à $\\dfrac{4}{5}\\times \\dfrac{1}{3}$ soit $${miseEnEvidence('\\dfrac{4}{15}')}$.`
        this.reponses = [
          '$\\dfrac{4}{15}$',
          '$\\dfrac{4}{8}$',
          '$\\dfrac{9}{5}$',
          '$\\dfrac{7}{3}$',
        ]
        break

      case 22:
        this.enonce = `Les trois quarts d'un cinquième correspondent à la fraction : `
        this.correction = `Les trois quarts d'un cinquième est égal à $\\dfrac{3}{4}\\times \\dfrac{1}{5}$ soit $${miseEnEvidence('\\dfrac{3}{20}')}$.`
        this.reponses = [
          '$\\dfrac{3}{20}$',
          '$\\dfrac{3}{9}$',
          '$\\dfrac{7}{4}$',
          '$\\dfrac{8}{5}$',
        ]
        break

      case 23:
        this.enonce = `Les cinq sixièmes d'un quart correspondent à la fraction : `
        this.correction = `Les cinq sixièmes d'un quart correspondent à $\\dfrac{5}{6}\\times \\dfrac{1}{4}$ soit $${miseEnEvidence('\\dfrac{5}{24}')}$.`
        this.reponses = [
          '$\\dfrac{5}{24}$',
          '$\\dfrac{5}{10}$',
          '$\\dfrac{11}{6}$',
          '$\\dfrac{9}{4}$',
        ]
        break

      case 24:
        this.enonce = `Les deux tiers d'un cinquième correspondent à la fraction : `
        this.correction = `Les deux tiers d'un cinquième est égal à $\\dfrac{2}{3}\\times \\dfrac{1}{5}$ soit $${miseEnEvidence('\\dfrac{2}{15}')}$.`
        this.reponses = [
          '$\\dfrac{2}{15}$',
          '$\\dfrac{2}{8}$',
          '$\\dfrac{7}{3}$',
          '$\\dfrac{8}{5}$',
        ]
        break

      case 25:
        this.enonce = `Les trois septièmes d'un demi correspondent à la fraction : `
        this.correction = `Les trois septièmes d'un demi est égal à $\\dfrac{3}{7}\\times \\dfrac{1}{2}$ soit $${miseEnEvidence('\\dfrac{3}{14}')}$.`
        this.reponses = [
          '$\\dfrac{3}{14}$',
          '$\\dfrac{3}{9}$',
          '$\\dfrac{10}{7}$',
          '$\\dfrac{5}{2}$',
        ]
        break
    }
  }

  constructor() {
    super()
    this.tip = `
  <p style="margin: 0 0 10px 0;">
    Il faut traduire une expression du type "une fraction d'une fraction".
  </p>
  <ul style="list-style-type: disc; padding-left: 1.5em; margin: 0 0 14px 0; line-height: 2;">
    <li>Repérer les deux fractions mentionnées dans l'énoncé.</li>
    <li>Comprendre que "de" ou "d'un" peut se traduire par une multiplication.</li>
  </ul>`
    this.versionAleatoire()
  }
}
