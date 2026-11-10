import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { ecritureAlgebrique } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { texNombre } from '../../lib/outils/texNombre'

export const titre = 'Simplifier une somme de racines carrées'
export const interactifReady = true

/**
 * 2N32-4, ex 2N12-1
 * @author Stéphane Guyon
 */
export const uuid = '12b72'

export const refs = {
  'fr-fr': ['2N51-3'],
  'fr-ch': ['1mCN-9', '11LSNO3C-4'],
}
export default class SimplifierUneSommeDeRacinesCarrees extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      2,
      '1 : En donnant la racine carrée unité\n2 : Sans indication',
    ]

    this.besoinFormulaire2CaseACocher = ['Valeurs adaptées au calcul mental']

    this.nbQuestions = 4
    this.nbCols = 2
    this.nbColsCorr = 2
    this.sup = 1
    this.sup2 = false
    this.spacingCorr = context.isHtml ? 2 : 1
  }

  nouvelleVersion() {
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const e1 = randint(this.sup2 ? 1 : 2, this.sup2 ? 3 : 8) * choice([-1, 1])
      const e2 = randint(this.sup2 ? 1 : 2, this.sup2 ? 3 : 8) * choice([-1, 1])
      const e3 = randint(this.sup2 ? 1 : 2, this.sup2 ? 3 : 8) * choice([-1, 1])
      const a1 = randint(2, this.sup2 ? 4 : 11)
      const a2 = randint(2, this.sup2 ? 4 : 11, [a1])
      const a3 = randint(2, this.sup2 ? 4 : 11, [a1, a2])
      const b1 = a1 * a1
      const b2 = a2 * a2
      const b3 = a3 * a3
      const c = this.sup2 ? choice([2, 3, 5]) : randint(2, 11, [4, 8, 9])
      const d1 = c * b1
      const d2 = c * b2
      const d3 = c * b3
      const f1 = e1 * a1
      const f2 = e2 * a2
      const f3 = e3 * a3
      const f = f1 + f2 + f3

      texte = `Écrire $${lettreDepuisChiffre(i + 1)}=${e1}\\sqrt{${texNombre(d1)}} ${ecritureAlgebrique(e2)}\\sqrt{${texNombre(d2)}} ${ecritureAlgebrique(e3)}\\sqrt{${texNombre(d3)}}$`
      texte +=
        this.sup === 1
          ? ` sous la forme $a\\sqrt{${c}}$ où $a$ est un entier.`
          : ' sous la forme $a\\sqrt{b}$ où $a$ et $b$ sont des entiers et $b$ le plus petit possible.'
      texteCorr = `On cherche le plus grand carré parfait diviseur de $${texNombre(d1)}$, $${texNombre(d2)}$ et $${texNombre(d3)}$. <br>
                On trouve $${texNombre(d1)}=${b1} \\times ${c}~~$, $~~${texNombre(d2)}=${b2} \\times ${c}~~$ et $${texNombre(d3)}=${b3} \\times ${c}$<br>
                On a donc  : $\\sqrt{${texNombre(d1)}}=\\sqrt{${a1}^{2} \\times ${c} }=${a1}\\times \\sqrt{${c}}$,
                $~~\\sqrt{${texNombre(d2)}}=\\sqrt{${a2}^{2} \\times ${c} }=${a2}\\times \\sqrt{${c}}~$ et
                $~\\sqrt{${texNombre(d3)}}=\\sqrt{${a3}^{2} \\times ${c} }=${a3}\\times \\sqrt{${c}}$<br>
                On en déduit que : $${lettreDepuisChiffre(i + 1)}=${e1}\\times${a1}\\times \\sqrt{${c}} ${ecritureAlgebrique(e2)}\\times ${a2}\\times \\sqrt{${c}}${ecritureAlgebrique(e3)}\\times ${a3}\\times \\sqrt{${c}}$<br>
                $${lettreDepuisChiffre(i + 1)}=${f1}\\times \\sqrt{${c}} ${ecritureAlgebrique(f2)}\\times \\sqrt{${c}}${ecritureAlgebrique(f3)}\\times \\sqrt{${c}}$  <br>
                $${lettreDepuisChiffre(i + 1)}=(${f1}${ecritureAlgebrique(f2)}${ecritureAlgebrique(f3)})\\times \\sqrt{${c}} = ${f}\\sqrt{${c}}$`

      if (this.interactif) {
        texte +=
          '<br><br>' +
          ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierFullOperations,
            {
              texteAvant: `$${lettreDepuisChiffre(i + 1)}=$`,
            },
          )
        handleAnswers(this, i, {
          reponse: { value: `${f}\\sqrt{${c}}` },
        })
      }

      if (this.questionJamaisPosee(i, e1, e2, e3, d1, d2, d3)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        // Uniformisation : Mise en place de la réponse attendue en interactif en orange et gras
        const textCorrSplit = texteCorr.split('=')
        let aRemplacer = textCorrSplit[textCorrSplit.length - 1]
        aRemplacer = aRemplacer.replace('$', '')

        texteCorr = ''
        for (let ee = 0; ee < textCorrSplit.length - 1; ee++) {
          texteCorr += textCorrSplit[ee] + '='
        }
        texteCorr += `${miseEnEvidence(aRemplacer)}$`
        // Fin de cette uniformisation

        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
