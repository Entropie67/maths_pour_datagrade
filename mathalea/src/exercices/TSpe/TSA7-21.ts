import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf0,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import Exercice from '../Exercice'

import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { context } from '../../modules/context'
export const titre =
  'Résoudre des équations différentielles avec des conditions initiales'
export const interactifReady = true

export const uuid = 'debc7'
export const refs = {
  'fr-fr': ['TSA7-21'],
  'fr-ch': [],
}
export const dateDePublication = '16/06/2024'

/**
 * Un premier exercice de résolution d'équations différentielles
 * @author Jean-Claude Lhote et Stéphane Guyon
 *
 */
class EquaDiffs extends Exercice {
  constructor() {
    super()

    this.besoinFormulaireTexte = [
      "Types d'équations ",
      "Nombres séparés par des tirets :\n1 : y'= ay\n2 : y'- ay=0\n3 : y'= ay + b\n4 : y'- ay = b\n5 : Mélange",
    ]
    this.sup = '1'
    this.nbQuestions = 2
    this.correctionDetailleeDisponible = true
  }

  nouvelleVersion() {
    // initialise les propriété exportée de l'exo comme this.autoCorrection, this.listeQuestions...

    // on récupère la liste des valeurs saisies dans le formulaire
    const listeTypeDeQuestion = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 4,
      defaut: 5,
      melange: 5,
      nbQuestions: this.nbQuestions,
      listeOfCase: ['yprime=ay', 'yprime+ay=0', 'yprime=ay+b', 'yprime+ay=b'],
    })
    // Boucle principale pour fabriquer les question
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let a: number
      let b: number
      let c: number
      let d: number
      let bSurA: FractionEtendue
      let kString: string
      let y0: number
      let texte: string
      let texteCorr: string
      let reponse: string
      let test = ''
      switch (listeTypeDeQuestion[i]) {
        case 'yprime=ay':
          a = randint(-10, 10, [-1, 0, 1])
          y0 = randint(-10, 10, [-1, 0, 1])
          texte = `Résoudre l'équation différentielle $y^\\prime=${-a}y$, avec $y(0)=${texNombre(y0, 0)}$.`

          texteCorr =
            "On sait que la solution générale d'une équation de la forme $y^\\prime=ay$ avec $a\\in\\mathbb{R}^*$ est <br>$y(x)=k\\mathrm{e}^{ax}$ avec $k\\in\\mathbb{R}$.<br>"
          texteCorr += `Donc la solution générale de l'équation est sous la forme $y(x)=k\\mathrm{e}^{${texNombre(-a, 0)}x}$ avec $k\\in\\mathbb{R}$.<br>`
          texteCorr += `Comme $y(0)=${texNombre(y0, 0)}$, on en déduit que : $${texNombre(y0, 0)}=k\\mathrm{e}^0=k$.<br>`
          texteCorr += `Ce qui donne $k=${texNombre(y0, 0)}$.<br>`
          reponse = `${texNombre(y0, 0)}\\mathrm{e}^{${texNombre(-a, 0)}x}`
          texteCorr += `La solution de l'équation différentielle  $y^\\prime${ecritureAlgebrique(a)}y=0$ telle que $y(0)=${texNombre(y0, 0)}$ est :<br>$y(x)=${miseEnEvidence(reponse)}$.<br>`

          break
        case 'yprime+ay=0':
          a = randint(-10, 10, [-1, 0, 1])
          y0 = randint(-10, 10, [-1, 0, 1])
          texte = `Résoudre l'équation différentielle $y^\\prime${ecritureAlgebrique(a)}y=0$, avec $y(0)=${texNombre(y0, 0)}$.`
          texteCorr = `On peut écrire l'équation sous la forme $y^\\prime=${rienSi1(-a)}y$. <br>`

          texteCorr +=
            "On sait que la solution générale d'une équation de la forme $y^\\prime=ay$ avec $a\\in\\mathbb{R}^*$ est <br>$y(x)=k\\mathrm{e}^{ax}$ avec $k\\in\\mathbb{R}$.<br>"
          texteCorr += `Donc la solution générale de l'équation est sous la forme $y(x)=k\\mathrm{e}^{${texNombre(-a, 0)}x}$ avec $k\\in\\mathbb{R}$.<br>`
          texteCorr += `Comme $y(0)=${texNombre(y0, 0)}$, on en déduit que : $${texNombre(y0, 0)}=k\\mathrm{e}^0=k$.<br>`
          texteCorr += `Ce qui donne $k=${texNombre(y0, 0)}$.<br>`
          reponse = `${texNombre(y0, 0)}\\mathrm{e}^{${texNombre(-a, 0)}x}`
          texteCorr += `La solution de l'équation différentielle  $y^\\prime${ecritureAlgebrique(a)}y=0$ telle que $y(0)=${texNombre(y0, 0)}$ est :<br>$y(x)=${miseEnEvidence(reponse)}$.<br>`

          break

        case 'yprime=ay+b':
          a = randint(-10, 10, [-1, 0, 1])
          b = randint(-10, 10, [-1, 0, 1])

          if (a * b > 0) {
            test = '+'
          } // gère le signe de fractionSimplifiee dans la correction
          y0 = randint(-10, 10, [-1, 0, 1])
          bSurA = new FractionEtendue(b, a)
          texte = `Résoudre l'équation différentielle $y^\\prime=${rienSi1(-a)}y${ecritureAlgebriqueSauf0(b)}$, avec $y(0)=${texNombre(y0, 0)}$.`

          texteCorr = `On sait que la solution générale d'une équation de la forme $y^\\prime=ay+b$ avec $a\\in\\mathbb{R}^*$ et $b\\in\\mathbb{R}$ est :<br>
            $y(x)=k\\mathrm{e}^{ax}-\\dfrac{b}{a}$ avec $k\\in\\mathbb{R}$.<br>`
          texteCorr += `Donc la solution générale de l'équation est sous la forme $y(x)=k\\mathrm{e}^{${texNombre(-a, 0)}x}${test}${bSurA.texFractionSimplifiee}$.<br>`
          texteCorr += `Comme $y(0)=${texNombre(y0, 0)}$, on en déduit que :  $y(0)=k\\mathrm{e}^0${test}${bSurA.texFractionSimplifiee}=k${test}${bSurA.texFractionSimplifiee}$.<br>
          Or, d'après l'énoncé, $y(0)=${texNombre(y0, 0)}$. <br>
          Il vient alors : $${texNombre(y0, 0)}=k${test}${bSurA.texFractionSimplifiee}$.<br>`
          kString = new FractionEtendue(a * y0 - b, a).simplifie().texFSD
          texteCorr += `On en déduit que $k=${texNombre(y0, 0)}${test}${bSurA.texFractionSimplifiee}=${kString}$.<br>`
          reponse = `${kString}\\mathrm{e}^{${texNombre(-a, 0)}x}${test}${bSurA.texFractionSimplifiee}`
          texteCorr += `La solution de l'équation différentielle $y^\\prime${ecritureAlgebrique(a)}y=${texNombre(b, 0)}$ telle que $y(0)=${texNombre(y0, 0)}$ est :<br>$y(x)=${miseEnEvidence(reponse)}$.<br>`
          break

        case 'yprime+ay=b': {
          a = randint(-10, 10, [-1, 0, 1])
          b = randint(-10, 10, [-1, 0, 1])
          let test = ''
          if (a * b > 0) {
            test = '+'
          } // gère le signe de fractionSimplifiee dans la correction
          y0 = randint(-10, 10, [-1, 0, 1])
          bSurA = new FractionEtendue(b, a)
          texte = `Résoudre l'équation différentielle $y^\\prime${ecritureAlgebrique(a)}y=${texNombre(b, 0)}$, avec $y(0)=${texNombre(y0, 0)}$.`
          texteCorr = `On peut écrire l'équation sous la forme $y^\\prime=${rienSi1(-a)}y${ecritureAlgebriqueSauf0(b)}$.  <br>`

          texteCorr += `On sait que la solution générale d'une équation de la forme $y^\\prime=ay+b$ avec $a\\in\\mathbb{R}^*$ et $b\\in\\mathbb{R}$ est :<br>
            $y(x)=k\\mathrm{e}^{ax}-\\dfrac{b}{a}$ avec $k\\in\\mathbb{R}$.<br>`
          texteCorr += `Donc la solution générale de l'équation est sous la forme $y(x)=k\\mathrm{e}^{${texNombre(-a, 0)}x}${test}${bSurA.texFractionSimplifiee}$.<br>`
          texteCorr += `Comme $y(0)=${texNombre(y0, 0)}$, on en déduit que :  $y(0)=k\\mathrm{e}^0${test}${bSurA.texFractionSimplifiee}=k${test}${bSurA.texFractionSimplifiee}$.<br>
          Or, d'après l'énoncé, $y(0)=${texNombre(y0, 0)}$. <br>
          Il vient alors : $${texNombre(y0, 0)}=k${test}${bSurA.texFractionSimplifiee}$.<br>`
          kString = new FractionEtendue(a * y0 - b, a).simplifie().texFSD
          texteCorr += `On en déduit que $k=${texNombre(y0, 0)}${test}${bSurA.texFractionSimplifiee}=${kString}$.<br>`
          reponse = `${kString}\\mathrm{e}^{${texNombre(-a, 0)}x}${test}${bSurA.texFractionSimplifiee}`
          texteCorr += `La solution de l'équation différentielle $y^\\prime${ecritureAlgebrique(a)}y=${texNombre(b, 0)}$ telle que $y(0)=${texNombre(y0, 0)}$ est :<br>$y(x)=${miseEnEvidence(reponse)}$.<br>`
          break
        }
        default:
          {
            // yprime+ay=f
            do {
              a = randint(-10, 10, [-1, 0, 1])
              b = randint(-10, 10, [-1, 0, 1])
              c = randint(-6, 6, [-1, 0, 1]) * a
              d = randint(-6, 6, [-1, 0, 1]) * a + c / a
              y0 = randint(-10, 10, [-1, 0, 1])
              bSurA = new FractionEtendue(-b, a)
            } while (y0 - (c - d * a) / (-a * a) === 0)
            const m = c / a
            const p = (c - d * a) / (-a * a)
            const k = y0 - p
            texte = `Résoudre l'équation différentielle $y^\\prime${ecritureAlgebrique(a)}y=${texNombre(c, 0)}x${ecritureAlgebrique(d)}$, avec $y(0)=${texNombre(y0, 0)}$.<br>
            On donne $y_f=${texNombre(m, 0)}x${ecritureAlgebrique(p)}$.<br>
            Vérifier que c'est une solution de l'équation différentielle puis donner toutes les solutions de cette équation.<br>`

            texteCorr = `Soit $y_f=${texNombre(m, 0)}x${ecritureAlgebrique(p)}$.<br>`
            texteCorr +=
              "On sait que la solution générale d'une équation de la forme $\\boxed{y^\\prime+ay=f}$ est de la forme $\\boxed{k\\mathrm{e}^{-ax}+y_f}$ où $y_f$ est une solution particulière de l'équation.<br>"
            texteCorr += 'On a donc :<br>'
            texteCorr += `$y(x)=k\\mathrm{e}^{${texNombre(-a, 0)}x}${ecritureAlgebrique(m)}x${ecritureAlgebrique(p)}$.<br>`
            texteCorr += "Les conditions initiales permettent d'écrire :<br>"
            texteCorr += `$y(0)=${texNombre(y0, 0)}=k\\mathrm{e}^0${ecritureAlgebrique(m)}\\times 0${ecritureAlgebrique(p)}=k${ecritureAlgebrique(p)}$.<br>`
            texteCorr += `On en déduit : $k=${texNombre(y0, 0)}${ecritureAlgebrique(-p)}=${texNombre(k, 0)}$.<br>`
            texteCorr += `La solution de l'équation différentielle $y^\\prime${ecritureAlgebrique(a)}y=${texNombre(c, 0)}x${ecritureAlgebrique(d)}$ telle que $y(0)=${texNombre(y0, 0)}$ est :<br>`
            reponse = `${texNombre(k, 0)}\\mathrm{e}^{${texNombre(-a, 0)}x}${ecritureAlgebrique(m)}x${ecritureAlgebrique(p)}`
            texteCorr += `$y(x)=${miseEnEvidence(reponse)}$.`
          }
          break
      }
      texte += '<br>'
      // C'est fini... sauf pour la correction détaillée ci-dessous.
      if (this.questionJamaisPosee(i, a)) {
        if (this.interactif && context.isHtml) {
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierFonctionsTerminales,
            {
              texteAvant: '$y=$ ',
            },
          )
          handleAnswers(this, i, { reponse: { value: reponse } })
        }
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr

        i++
        cpt--
      }
      cpt++
    } // fin de boucle sur les questions
  } // nouvelleVersion
} // DerivationSimple

export default EquaDiffs
