import { choice } from '../../../lib/outils/arrayOutils'
import { texNombre } from '../../../lib/outils/texNombre'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'

import { tableauColonneLigne } from '../../../lib/2d/tableau'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'
import { sp } from '../../../lib/outils/outilString'
export const titre = 'Déterminer une probabilité dans un tableau d’effectifs'
export const dateDePublication = '06/07/2022'
export const dateDeModifImportante = '13/02/2026'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 *
 * @author Gilles Mora

 */
export const uuid = '1b057'

export const refs = {
  'fr-fr': ['can1P12-03', 'can2P2-06', '2P20-flash5', '1A-P05-9'],
  'fr-ch': ['4mProbStat-12'],
}
export default class CalculProbaTableauEff extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
  }

  nouvelleVersion() {
    const F = randint(27, 80)
    const V = randint(41, 70)
    const FinterV = randint(5, 20)
    const T = randint(160, 180)
    const choix = choice([true, false])
    const tableau = tableauColonneLigne(
      ['', 'F', '\\overline{F}', '\\text{Total}'],
      ['V', '\\overline{V}', '\\text{Total}'],
      [
        `${texNombre(FinterV, 2)}`,
        `${texNombre(V - FinterV, 2)}`,
        `${texNombre(V, 2)}`,
        `${texNombre(F - FinterV)}`,
        `${texNombre(T - F - V + FinterV)}`,
        `${texNombre(T - V)}`,
        `${texNombre(F)}`,
        `${texNombre(T - F)}`,
        `${texNombre(T)}`,
      ],
    )

    const enonce = `
      $F$ : «${sp()}La personne est une fille${sp()}» et $V$ : «${sp()}La personne a plus de $20$ ans${sp()}».<br>
      On choisit une personne au hasard.<br>${tableau}<br>`

    let texteCorr = ''
    let reponse!: FractionEtendue

    switch (this.quotaChoice('type', [1, 2, 3, 4, 5, 6, 7, 8])) {
      case 1: // p(F)
        this.question = enonce
        if (choice([true, false])) {
          this.optionsChampTexte = { texteAvant: '<br>$P(F)=$ ' }
          this.canEnonce = enonce
          this.canReponseACompleter = ' $P(F)=\\ldots$'
          this.question += 'Déterminer $P(F)$.'
        } else {
          this.question += this.interactif
            ? 'La probabilité que la personne choisie soit une fille est :'
            : 'Déterminer la probabilité de choisir une fille.'
          this.optionsChampTexte = { texteAvant: ' ' }
          this.canEnonce =
            enonce + 'Quelle est la probabilité de choisir une fille ?'
        }
        texteCorr = `$P(F)=\\dfrac{\\text{Nombre de filles}}{\\text{Nombre  de personnes au total}}=\\dfrac{${texNombre(F)}}{${texNombre(T)}}$`
        reponse = new FractionEtendue(F, T)
        break

      case 2: // p(FinterV)
        this.question = enonce
        if (choice([true, false])) {
          this.optionsChampTexte = { texteAvant: '<br>$P(F\\cap V)=$ ' }
          this.canEnonce = enonce
          this.canReponseACompleter = '$P(F\\cap V)=\\ldots$'
          this.question += 'Déterminer $P(F\\cap V)$.'
        } else {
          this.question += this.interactif
            ? 'La probabilité que la personne choisie soit une fille de plus de $20$ ans est :'
            : 'Déterminer la probabilité de choisir une fille de plus de $20$ ans.'
          this.optionsChampTexte = { texteAvant: ' ' }
          this.canEnonce =
            enonce +
            'Quelle est la probabilité de choisir une fille de plus de $20$ ans ?'
        }
        texteCorr = `$P(F\\cap V)=\\dfrac{\\text{Nombre de filles de plus de 20 ans}}{\\text{Nombre  de personnes au total}}=\\dfrac{${texNombre(FinterV)}}{${texNombre(T)}}$`
        reponse = new FractionEtendue(FinterV, T)
        break

      case 3: // p_V(F)
        this.question = enonce
        if (choice([true, false])) {
          this.optionsChampTexte = { texteAvant: '<br>$P_V(F)=$ ' }
          this.canEnonce = enonce
          this.canReponseACompleter = '$P_V(F)=\\ldots$'
          this.question += 'Déterminer $P_V(F)$.'
        } else {
          const question = this.interactif
            ? choix
              ? 'Sachant que la personne choisie a plus de $20$ ans, la probabilité que ce soit une fille est :'
              : 'La personne choisie a plus de $20$ ans. La probabilité que ce soit une fille est :'
            : choix
              ? "Déterminer la probabilité de choisir une fille sachant qu'elle a plus de $20$ ans."
              : 'La personne choisie a plus de $20$ ans. Déterminer la probabilité que ce soit une fille.'
          this.question += question
          this.optionsChampTexte = { texteAvant: ' ' }
          const questionCan = choix
            ? "Quelle est la probabilité de choisir une fille sachant qu'elle a plus de $20$ ans ?"
            : 'La personne choisie a plus de $20$ ans. Quelle est la probabilité que ce soit une fille ?'
          this.canEnonce = enonce + questionCan
        }
        texteCorr = `$P_V(F)=\\dfrac{\\text{Nombre de filles de plus de 20 ans}}{\\text{Nombre  de personnes de plus de 20 ans}}=\\dfrac{${texNombre(FinterV)}}{${texNombre(V)}}$`
        reponse = new FractionEtendue(FinterV, V)
        break

      case 4: // p(FinterVbarre))
        this.question = enonce
        if (choice([true, false])) {
          this.optionsChampTexte = {
            texteAvant: '<br>$P(F\\cap\\overline{V})=$ ',
          }
          this.canEnonce = enonce
          this.canReponseACompleter = '$P(F\\cap\\overline{V})=\\ldots$'
          this.question += 'Déterminer $P(F\\cap\\overline{V})$.'
        } else {
          this.question += this.interactif
            ? 'La probabilité que la personne choisie soit une fille de moins de $20$ ans est :'
            : 'Déterminer la probabilité de choisir une fille de moins de $20$ ans.'
          this.optionsChampTexte = { texteAvant: ' ' }
          this.canEnonce =
            enonce +
            'Quelle est la probabilité de choisir une fille de moins de $20$ ans ?'
        }
        texteCorr = `$P(F\\cap\\overline{V})=\\dfrac{\\text{Nombre de filles de moins de 20 ans}}{\\text{Nombre  total de personnes}}=\\dfrac{${texNombre(F - FinterV)}}{${texNombre(T)}}$`
        reponse = new FractionEtendue(F - FinterV, T)
        break

      case 5: // p_Vbarre(Fbarre)
        this.question = enonce
        if (choice([true, false])) {
          this.optionsChampTexte = {
            texteAvant: '<br>$P_{\\overline{V}}(\\overline{F})=$ ',
          }
          this.canEnonce = enonce
          this.canReponseACompleter =
            '$P_{\\overline{V}}(\\overline{F})=\\ldots$'
          this.question += 'Déterminer $P_{\\overline{V}}(\\overline{F})$.'
        } else {
          const question = this.interactif
            ? choix
              ? 'Sachant que la personne choisie a moins de $20$ ans, la probabilité que ce soit un garçon est :'
              : 'La personne choisie a moins de $20$ ans. La probabilité que ce soit un garçon est :'
            : choix
              ? "Déterminer la probabilité de choisir un garçon sachant qu'il a moins de $20$ ans."
              : 'La personne choisie a moins de $20$ ans. Déterminer la probabilité que ce soit un garçon.'
          this.question += question
          this.optionsChampTexte = { texteAvant: ' ' }
          const questionCan = choix
            ? "Quelle est la probabilité de choisir un garçon sachant qu'il a moins de $20$ ans ?"
            : 'La personne choisie a moins de $20$ ans. Quelle est la probabilité que ce soit un garçon ?'
          this.canEnonce = enonce + questionCan
        }
        texteCorr = `$P_{\\overline{V}}(\\overline{F})=\\dfrac{\\text{Nombre de garçons de moins de 20 ans}}{\\text{Nombre  de personnes de moins de 20 ans}}=\\dfrac{${texNombre(T - F - V + FinterV)}}{${texNombre(T - V)}}$`
        reponse = new FractionEtendue(T - F - V + FinterV, T - V)
        break

      case 6: // p_F(V)
        this.question = enonce
        if (choice([true, false])) {
          this.optionsChampTexte = { texteAvant: '<br>$P_{F}(V)=$ ' }
          this.canEnonce = enonce
          this.canReponseACompleter = '$P_{F}(V)=\\ldots$'
          this.question += 'Déterminer $P_{F}(V)$.'
        } else {
          const question = this.interactif
            ? choix
              ? "Sachant que la personne choisie est une fille, la probabilité qu'elle ait plus de $20$ ans est :"
              : "La personne choisie est une fille. La probabilité qu'elle ait plus de $20$ ans est :"
            : choix
              ? "Déterminer la probabilité de choisir une personne de plus de $20$ ans sachant que c'est une fille."
              : "La personne choisie est une fille. Déterminer la probabilité qu'elle ait plus de $20$ ans."
          this.question += question
          this.optionsChampTexte = { texteAvant: ' ' }
          const questionCan = choix
            ? "Quelle est la probabilité de choisir une personne de plus de $20$ ans sachant que c'est une fille ?"
            : "La personne choisie est une fille. Quelle est la probabilité qu'elle ait plus de $20$ ans  ?"
          this.canEnonce = enonce + questionCan
        }
        texteCorr = `$P_{F}(V)=\\dfrac{\\text{Nombre de filles de plus de 20 ans}}{\\text{Nombre  de filles}}=\\dfrac{${texNombre(FinterV)}}{${texNombre(F)}}$`
        reponse = new FractionEtendue(FinterV, F)
        break

      case 7: // p_Farre(V)
        this.question = enonce
        if (choice([true, false])) {
          this.optionsChampTexte = {
            texteAvant: '<br>$P_{\\overline{F}}(V)=$ ',
          }
          this.canEnonce = enonce
          this.canReponseACompleter = '$P_{\\overline{F}}(V)=\\ldots$'
          this.question += 'Déterminer $P_{\\overline{F}}(V)$.'
        } else {
          const question = this.interactif
            ? choix
              ? "Sachant que la personne choisie est un garçon, la probabilité qu'il ait plus de $20$ ans est :"
              : "La personne choisie est un garçon. La probabilité qu'il ait plus de $20$ ans est :"
            : choix
              ? "Déterminer la probabilité de choisir une personne de plus de $20$ ans sachant que c'est un garçon."
              : "La personne choisie est un garçon. Déterminer la probabilité qu'il ait plus de $20$ ans."
          this.question += question
          this.optionsChampTexte = { texteAvant: ' ' }
          const questionCan = choix
            ? "Quelle est la probabilité de choisir une personne de plus de $20$ ans sachant que c'est un garçon ?"
            : "La personne choisie est un garçon. Quelle est la probabilité qu'il ait plus de $20$ ans  ?"
          this.canEnonce = enonce + questionCan
        }
        texteCorr = `$P_{\\overline{F}}(V)=\\dfrac{\\text{Nombre de garçons de plus de 20 ans}}{\\text{Nombre  de garçons}}=\\dfrac{${texNombre(V - FinterV)}}{${texNombre(T - F)}}$`
        reponse = new FractionEtendue(V - FinterV, T - F)
        break

      case 8: // p(Vbarre)
        this.question = enonce
        if (choice([true, false])) {
          this.optionsChampTexte = { texteAvant: '<br>$P(\\overline{V})=$ ' }
          this.canEnonce = enonce
          this.canReponseACompleter = '$P(\\overline{V})=\\ldots$'
          this.question += 'Déterminer $P(\\overline{V})$.'
        } else {
          this.question += this.interactif
            ? 'La probabilité que la personne choisie ait moins de $20$ ans est :'
            : 'Déterminer la probabilité de choisir une personne de moins de $20$ ans.'
          this.optionsChampTexte = { texteAvant: ' ' }
          this.canEnonce =
            enonce +
            'Quelle est la probabilité de choisir une personne de moins de $20$ ans ?'
        }
        texteCorr = `$P(\\overline{V})=\\dfrac{\\text{Nombre de personnes de moins de 20 ans}}{\\text{Nombre  de personnes au total}}=\\dfrac{${texNombre(T - V)}}{${texNombre(T)}}$`
        reponse = new FractionEtendue(T - V, T)
        break
    }

    // Uniformisation : Mise en place de la réponse attendue en interactif en orange et gras
    const textCorrSplit = texteCorr.split('=')
    let aRemplacer = textCorrSplit[textCorrSplit.length - 1]
    aRemplacer = aRemplacer.replace('$', '')

    texteCorr = ''
    for (let ee = 0; ee < textCorrSplit.length - 1; ee++) {
      texteCorr += textCorrSplit[ee] + '='
    }
    texteCorr += `${miseEnEvidence(aRemplacer)}$`

    this.correction = `La probabilité est donnée par : <br><br>${texteCorr}`
    this.reponse = reponse
  }
}
