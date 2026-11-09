import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { ecritureAlgebrique } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import Exercice from '../Exercice'

import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { context } from '../../modules/context'
export const titre = 'Résoudre des équations différentielles'
export const interactifReady = true

export const uuid = 'debc6'
export const refs = {
  'fr-fr': [''],
  'fr-ch': [],
}
export const dateDePublication = '16/06/2024'

/**
 * Un premier exercice de résolution d'équations différentielles
 * @author Jean-claude Lhote et Stéphane Guyon
 *
 */
class EquaDiffs extends Exercice {
  constructor() {
    super()

    this.besoinFormulaireTexte = [
      "Types d'équations ",
      "Nombres séparés par des tirets :\n1 : y'= ay\n2 : y'= ay + b\n3 : y'= ay + f\n4 : Mélange",
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
      max: 3,
      defaut: 1,
      melange: 4,
      nbQuestions: this.nbQuestions,
      listeOfCase: ['yprime+ay=0', 'yprime+ay=b', 'yprime+ay=f'],
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
      switch (listeTypeDeQuestion[i]) {
        case 'yprime+ay=0':
          a = randint(-10, 10, [-1, 0, 1])
          y0 = randint(-10, 10, [-1, 0, 1])
          texte = `Résoudre l'équation différentielle $y^\\prime${ecritureAlgebrique(a)}y=0$, avec $y(0)=${texNombre(y0, 0)}$.`
          texteCorr =
            "On sait que la solution générale d'une équation de la forme $\\boxed{y^\\prime+ay=0}$ est $\\boxed{y(x)=ke^{-ax}}$ .<br>"
          texteCorr += `Donc $y(x)=ke^{${texNombre(-a, 0)}x}$.<br>`
          texteCorr += `De plus, $y(0)=${texNombre(y0, 0)}$, par conséquent : $${texNombre(y0, 0)}=ke^0=k$.<br>`
          reponse = `${texNombre(y0, 0)}e^{${texNombre(-a, 0)}x}`
          texteCorr += `La solution de l'équation différentielle  $y^\\prime${ecritureAlgebrique(a)}y=0$ telle que $y(0)=${texNombre(y0, 0)}$ est :<br>$y(x)=${miseEnEvidence(reponse)}$.<br>`

          break
        case 'yprime+ay=b':
          a = randint(-10, 10, [-1, 0, 1])
          b = randint(-10, 10, [-1, 0, 1])
          y0 = randint(-10, 10, [-1, 0, 1])
          bSurA = new FractionEtendue(b, a)
          texte = `Résoudre l'équation différentielle $y^\\prime${ecritureAlgebrique(a)}y=${texNombre(b, 0)}$, avec $y(0)=${texNombre(y0, 0)}$.`
          texteCorr =
            "On sait que la solution générale d'une équation de la forme $\\boxed{y^\\prime+ay=b}$ est $\\boxed{y(x)=ke^{-ax}+\\dfrac{b}{a}}$ .<br>"
          texteCorr += `Donc $y(x)=ke^{${texNombre(-a, 0)}x}${bSurA.ecritureAlgebrique}$.<br>`
          texteCorr += `De plus, $y(0)=${texNombre(y0, 0)}$, par conséquent : $${texNombre(y0, 0)}=ke^0${bSurA.ecritureAlgebrique}=k${bSurA.ecritureAlgebrique}$.<br>`
          kString = new FractionEtendue(a * y0 - b, a).simplifie().texFSD
          texteCorr += `On en déduit que $k=${texNombre(y0, 0)}${bSurA.multiplieEntier(-1).ecritureAlgebrique}=${kString}$.<br>`
          reponse = `${kString}e^{${texNombre(-a, 0)}x}${bSurA.ecritureAlgebrique}`
          texteCorr += `La solution de l'équation différentielle $y^\\prime${ecritureAlgebrique(a)}y=${texNombre(b, 0)}$ telle que $y(0)=${texNombre(y0, 0)}$ est :<br>$y(x)=${miseEnEvidence(reponse)}$.<br>`
          break
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
            texte = `Résoudre l'équation différentielle $y^\\prime${ecritureAlgebrique(a)}y=${texNombre(c, 0)}x${ecritureAlgebrique(d)}$, avec $y(0)=${texNombre(y0, 0)}$.`
            texteCorr =
              'Comme le deuxième membre est une fonction affine, cherchons une solution particulière de la forme $y_f=mx+p$.<br>'
            texteCorr +=
              "Si $y_f=mx+p$, alors $y_f^\\prime=m$, l'équation différentielle que vérifie $y_f$ est alors : "
            texteCorr += `$${miseEnEvidence(`m${ecritureAlgebrique(a)}(mx+p)=${texNombre(c, 0)}x${ecritureAlgebrique(d)}`, bleuMathalea)}$.<br>`
            texteCorr +=
              'En regroupant les termes de même degré, on obtient le système :<br>$\\begin{cases}\n'
            texteCorr += `m${ecritureAlgebrique(a)}p &=${texNombre(d, 0)}\\\\\n`
            texteCorr += `${texNombre(a, 0)}m &=${texNombre(c, 0)}\\\\\n`
            texteCorr += '\\end{cases}\n'
            texteCorr += '\\Longleftrightarrow \\begin{cases}\n'
            texteCorr += `${texNombre(a, 0)}p &=${texNombre(d, 0)}-m\\\\\n`
            texteCorr += `m &=${texNombre(c / a, 0)}\\\\\n`
            texteCorr += '\\end{cases}\n \\Longleftrightarrow \\begin{cases}\n'
            texteCorr += `${texNombre(a, 0)}p &=${texNombre(d - c / a, 0)}\\\\`
            texteCorr += `m &=${texNombre(m, 0)}\\\\\n \\end{cases}\n`
            texteCorr += '\\Longleftrightarrow \\begin{cases}\n'
            texteCorr += `p &=${texNombre(p, 0)}\\\\`
            texteCorr += `m &=${texNombre(m, 0)}\\\\\n \\end{cases}$<br>`
            texteCorr += `Soit $y_f=${texNombre(m, 0)}x${ecritureAlgebrique(p)}$.<br>`
            texteCorr +=
              "On sait que la solution générale d'une équation de la forme $\\boxed{y^\\prime+ay=f}$ est de la forme $\\boxed{ke^{-ax}+y_f}$ où $y_f$ est une solution particulière de l'équation.<br>"
            texteCorr += 'On a donc :<br>'
            texteCorr += `$y(x)=ke^{${texNombre(-a, 0)}x}${ecritureAlgebrique(m)}x${ecritureAlgebrique(p)}$.<br>`
            texteCorr += "Les conditions initiales permettent d'écrire :<br>"
            texteCorr += `$y(0)=${texNombre(y0, 0)}=ke^0${ecritureAlgebrique(m)}\\times 0${ecritureAlgebrique(p)}=k${ecritureAlgebrique(p)}$.<br>`
            texteCorr += `On en déduit : $k=${texNombre(y0, 0)}${ecritureAlgebrique(-p)}=${texNombre(k, 0)}$.<br>`
            texteCorr += `La solution de l'équation différentielle $y^\\prime${ecritureAlgebrique(a)}y=${texNombre(c, 0)}x${ecritureAlgebrique(d)}$ telle que $y(0)=${texNombre(y0, 0)}$ est :<br>`
            reponse = `${texNombre(k, 0)}e^{${texNombre(-a, 0)}x}${ecritureAlgebrique(m)}x${ecritureAlgebrique(p)}`
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
