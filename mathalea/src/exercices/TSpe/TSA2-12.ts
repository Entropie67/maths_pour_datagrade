import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { toutPourUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Déterminer une asymptote à partir d’une limite'
export const dateDePublication = '08/10/2026'
export const dateDeModifImportante = '08/10/2026'

export const uuid = 'd4b14'
export const interactifReady = true
export const refs = {
  'fr-fr': ['TSA2-12', 'TCA2-12'],
  'fr-ch': [],
}

/** @author Stéphane Guyon */
export default class AsymptoteDepuisLimite extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
  }

  nouvelleVersion(): void {
    const isInteractive = context.isHtml && this.interactif && !context.isTypst
    const questionTypes = combinaisonListes([0, 1, 2, 3], this.nbQuestions)
    const choices = [
      { label: 'Choisir…', value: '' },
      { label: 'horizontale', value: 'horizontale' },
      { label: 'verticale', value: 'verticale' },
    ]
    for (
      let i = 0, attempts = 0;
      i < this.nbQuestions && attempts < 50;
      attempts++
    ) {
      const questionType = questionTypes[i]
      const horizontal = questionType === 0 || questionType === 2
      const hasAsymptote = questionType === 0 || questionType === 1
      const point = randint(-6, 6)
      const finiteLimit = randint(-6, 6, point)
      const infinity = choice(['-\\infty', '+\\infty'])
      const direction = choice(['-\\infty', '+\\infty'])
      const side = choice(['-', '+'])
      const approach = texNombre(point)
      const restriction = horizontal
        ? `x\\to ${direction}`
        : `\\substack{x\\to ${approach}\\\\x${side === '+' ? '>' : '\\lt'}${approach}}`
      const limitValue =
        questionType === 0 || questionType === 3
          ? texNombre(finiteLimit)
          : infinity
      const limitExpression = `\\displaystyle\\lim_{${restriction}}f(x)=${limitValue}`
      const coordinate = texNombre(horizontal ? finiteLimit : point)
      const orientation = horizontal ? 'horizontale' : 'verticale'
      const equation = `${horizontal ? 'y' : 'x'}=${coordinate}`
      if (!this.questionJamaisPosee(i, limitExpression)) continue

      const question =
        'Cette information permet-elle d’affirmer que la courbe représentative de $f$ admet une asymptote horizontale ou verticale ?'
      const answer = isInteractive
        ? addMultiMathfield(this, i, {
            dataTemplate: `%{field0}<span data-show-when="field0:oui">, une asymptote %{field1} d’équation %{field2}${horizontal ? ` en $${direction}$` : ''}</span>.`,
            dataOptions: {
              field0: {
                choices: [
                  { label: 'Choisir…', value: '' },
                  { label: 'Oui', value: 'oui' },
                  { label: 'Non', value: 'non' },
                ],
              },
              field1: { choices },
              field2: {
                keyboard: KeyboardType.clavierDeBaseAvecEgalEtVariable,
              },
            },
          })
        : 'Si oui, préciser si cette asymptote est horizontale ou verticale et donner son équation.'
      this.listeQuestions[i] =
        `Soit $f$ une fonction dont la courbe représentative est $\\mathcal C_f$. On sait que $${limitExpression}$.<br>${question}<br>${answer}`
      this.listeCorrections[i] = hasAsymptote
        ? `On a $${limitExpression}$.<br>
          La courbe $\\mathcal C_f$ admet donc une asymptote ${texteEnCouleurEtGras(orientation)}, d’équation $${miseEnEvidence(equation)}$${horizontal ? ` en $${direction}$` : ''}.`
        : horizontal
          ? `On a $${limitExpression}$.<br>
            Une asymptote horizontale en $${direction}$ nécessite une limite finie en $${direction}$. Ici, la limite est infinie.<br>
            La courbe représentative de $f$ ${texteEnCouleurEtGras('n’admet pas d’asymptote horizontale')} en $${direction}$. Cela n’exclut pas une asymptote oblique.`
          : `On a $${limitExpression}$.<br>
            Une asymptote verticale d’équation $x=${approach}$ nécessite une limite infinie en $${approach}$. Ici, la limite est finie du côté étudié.<br>
            La courbe représentative de $f$ ${texteEnCouleurEtGras('n’admet pas d’asymptote verticale')} d’équation $x=${approach}$ de ce côté. La limite donnée ne renseigne pas sur l’autre côté.`
      handleAnswers(
        this,
        i,
        {
          bareme: toutPourUnPoint,
          field0: { value: hasAsymptote ? 'oui' : 'non' },
          field1: { value: orientation },
          field2: { value: equation, options: { egaliteExpression: true } },
        },
        { formatInteractif: 'multi-mathfield' },
      )
      i++
    }
    listeQuestionsToContenu(this)
  }
}
