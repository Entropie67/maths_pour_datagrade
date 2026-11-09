import { texteCentre } from '../../../lib/format/miseEnPage'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  rienSi1,
} from '../../../lib/outils/ecritures'
import { sp } from '../../../lib/outils/outilString'
import { egal, listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'

export const titre =
  'Déterminer un vecteur normal avec une équation cartésienne'
export const interactifReady = true
export const dateDePublication = '08/07/2022'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora avec Jean-Claude pour la partie interactive

 *
 */
export const uuid = 'e7919'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export default class VecteurNormEqCart extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let texte
    let texteCorr

    for (let i = 0, a, b, c, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      a = randint(-9, 9, 0)
      b = randint(-9, 9, 0)
      c = randint(-5, 5, 0)

      texte = ` Dans un repère orthonormé $\\big(O ; \\vec \\imath,\\vec \\jmath\\big)$, la droite $d$ a pour équation :
    ${texteCentre(`$${rienSi1(a)}x${ecritureAlgebriqueSauf1(b)}y${ecritureAlgebrique(c)}=0$`)}
 Donner les coordonnées d'un vecteur normal $\\vec{u}$ de la droite $d$.<br>`

      if (this.interactif) {
        texte +=
          '$\\Bigg($' +
          ajouteChampTexteMathLive(this, 2 * i, KeyboardType.clavierDeBase)
        texte += ` ${sp(1)} ;  `
        texte +=
          ajouteChampTexteMathLive(
            this,
            2 * i + 1,
            KeyboardType.clavierDeBase,
          ) + '$\\Bigg)$'

        handleAnswers(this, 2 * i, { reponse: { value: a } })
        handleAnswers(this, 2 * i + 1, { reponse: { value: b } })
      }
      texteCorr = `Si l'équation est de la forme $ax+by+c=0$, on sait d'après le cours, qu'un vecteur normal $\\vec{u}$ a pour coordonnées $(a;b)$.<br>
    On en déduit qu'un vecteur normal de $d$ est $\\vec{u}(${a};${b})$.<br>
     Tout vecteur colinéaire à $\\vec{u}$ est aussi un vecteur normal de $d$.`

      if (this.questionJamaisPosee(i, a, b)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
    this.canEnonce = texte
  }

  correctionInteractive = (i: number) => {
    let resultat = 'KO'
    const champTexte1 = document.getElementById(
      `champTexteEx${this.numeroExercice}Q${2 * i}`,
    )
    const champTexte2 = document.getElementById(
      `champTexteEx${this.numeroExercice}Q${2 * i + 1}`,
    )
    const spanResultat1 = document.querySelector(
      `#resultatCheckEx${this.numeroExercice}Q${2 * i}`,
    )
    const spanResultat2 = document.querySelector(
      `#resultatCheckEx${this.numeroExercice}Q${2 * i + 1}`,
    )
    if (
      champTexte1 &&
      champTexte2 &&
      spanResultat1 &&
      spanResultat2 &&
      'value' in champTexte1 &&
      'value' in champTexte2
    ) {
      let saisie1 = String(champTexte1.value).replace(',', '.')
      let saisie2 = String(champTexte2.value).replace(',', '.')
      saisie1 = saisie1.replace(/\((\+?-?\d+)\)/, '$1') // Pour les nombres négatifs, supprime les parenthèses
      saisie2 = saisie2.replace(/\((\+?-?\d+)\)/, '$1') // Pour les nombres négatifs, supprime les parenthèses
      const reponse1 = this.autoCorrection[2 * i]?.valeur?.reponse?.value
      const reponse2 = this.autoCorrection[2 * i + 1]?.valeur?.reponse?.value
      if (reponse1 !== undefined || reponse2 !== undefined) {
        const x0 = reponse1
        const y0 = reponse2
        const x = Number(saisie1)
        const y = Number(saisie2)

        if (egal(x / Number(x0), y / Number(y0)) && !(x === 0 && y === 0)) {
          spanResultat1.innerHTML = '😎'
          spanResultat2.innerHTML = '😎'
          resultat = 'OK'
        } else {
          spanResultat1.innerHTML = '☹️'
          spanResultat2.innerHTML = '☹️'
          resultat = 'KO'
        }
      }
    }
    return resultat
  }
}
