import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  rienSi1,
} from '../../../lib/outils/ecritures'
import { egal, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

import {
  addMultiMathfield,
  MultiMathfieldElement,
} from '../../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { toutPourUnPoint } from '../../../lib/interactif/fonctionsBaremes'
import { miseEnEvidence } from '../../../lib/outils/embellissements'

export const titre =
  'Déterminer un vecteur normal avec une équation cartésienne'
export const interactifReady = true
export const dateDePublication = '08/07/2022'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora avec Jean-Claude pour la partie interactive

 *
 */
export const uuid = 'e791a'

export const refs = {
  'fr-fr': ['can1G1-05'],
  'fr-ch': ['3G97-5'],
}
export default class VecteurNormEqCart extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let texte
    let texteCorr

    for (let i = 0, a, b, c, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      a = randint(-9, 9, 0)
      b = randint(-9, 9, 0)
      c = randint(-5, 5, 0)

      texte = ` Dans un repère orthonormé $\\big(O ; \\vec \\imath,\\vec \\jmath\\big)$, la droite $d$ a pour équation :
    $${rienSi1(a)}x${ecritureAlgebriqueSauf1(b)}y${ecritureAlgebrique(c)}=0$.<br>`
      texte += addMultiMathfield(this, i, {
        dataTemplate: `Donner les coordonnées d'un vecteur normal $\\vec{u}$ de la droite $d$ : $\\vec{u}\\Bigg($ %{champ1} ; %{champ2}$\\Bigg)$`,
        dataOptions: {
          champ1: { keyboard: KeyboardType.clavierDeBase },
          champ2: { keyboard: KeyboardType.clavierDeBase },
        },
      })

      handleAnswers(
        this,
        i,
        {
          bareme: toutPourUnPoint,
          champ1: { value: a },
          champ2: { value: b },
        },
        { formatInteractif: 'multi-mathfield' },
      )
      texteCorr = `Si l'équation est de la forme $ax+by+c=0$, on sait d'après le cours, qu'un vecteur normal $\\vec{u}$ a pour coordonnées $(a\\,;\\,b)$.<br>
    On en déduit qu'un vecteur normal de $d$ est $${miseEnEvidence(`\\vec{u}(${a}\\,;\\,${b})`)}$.<br>
     Tout vecteur colinéaire à $\\vec{u}$ est aussi un vecteur normal de $d$.`

      if (this.questionJamaisPosee(i, a, b)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    this.canEnonce = texte
  }

  correctionInteractive = (i: number) => {
    let resultat = 'KO'
    const multiMF =
      (document.getElementById(
        `multi-mathfieldEx${this.numeroExercice}Q${i}`,
      ) as MultiMathfieldElement | null) ??
      (document.getElementById(
        `multiMathfieldEx${this.numeroExercice}Q${i}`,
      ) as MultiMathfieldElement | null)
    if (multiMF) {
      const values = multiMF.getValue()
      const saisie1 = String(values.champ1).replace(',', '.')
      const saisie2 = String(values.champ2).replace(',', '.')
      const reponse1 = this.autoCorrection[i]?.valeur?.champ1?.value
      const reponse2 = this.autoCorrection[i]?.valeur?.champ2?.value

      const spansResultat = multiMF.getSpansResultats()
      const spanResultat1 = spansResultat.champ1
      const spanResultat2 = spansResultat.champ2

      if (spanResultat1 && spanResultat2) {
        if (reponse1 !== undefined || reponse2 !== undefined) {
          const x0 = Number(reponse1)
          const y0 = Number(reponse2)
          const x = Number(saisie1)
          const y = Number(saisie2)

          if (
            !(x === 0 && y === 0) &&
            !isNaN(x0) &&
            !isNaN(y0) &&
            !(x0 === 0 && y0 === 0) &&
            !isNaN(x) &&
            !isNaN(y) &&
            egal(x / x0, y / y0)
          ) {
            spanResultat2.innerHTML = '😎'
            spanResultat1.innerHTML = '😎'
            resultat = 'OK'
          } else {
            spanResultat2.innerHTML = '☹️'
            spanResultat1.innerHTML = '☹️'
            resultat = 'KO'
          }
        }
      }
      return resultat
    } else {
      console.error(
        `MultiMathfield pour la question ${i} de l'exercice ${this.numeroExercice} introuvable.`,
      )
      return resultat
    }
  }
}
