import { addGuideAne, GuideAne } from '../../lib/customElements/GuideAne'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteFeedback } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { egalOuApprox } from '../../lib/outils/ecritures'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Utiliser le guide-âne pour construire un segment de longueur donnée'
export const uuid = '327f2'
export const interactifReady = true
export const refs = {
  'fr-fr': ['4G30-0'],
  'fr-ch': ['11LCGM3B-8', '11LSGM3B-8', 'PRQMG03C-8'],
}
export const dateDePublication = '30/12/2025'
/**
 * @author Jean-claude Lhote
 */
export default class MonExoGuideAne extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireCaseACocher = ['Affichage de la longueur AD']
    this.besoinFormulaire2CaseACocher = ['Affichage du rapport AD/AB']
  }

  nouvelleVersion(): void {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const alpha = choice([30, 45, 60])
      const targetAB = randint(5, 16, 10)

      // Générer une fraction cible aléatoire
      const targetN = randint(3, 8)
      const targetP = randint(1, targetN - 1)
      const targetFraction = `\\dfrac{${targetP}}{${targetN}}`
      const targetValue = (targetAB * targetP) / targetN
      let texte = `Représenter en rouge un segment de longueur $${targetFraction}\\times AB$ lorsque $AB$ mesure $${targetAB}\\text{ cm}$`
      let texteCorr = ''
      if (context.isHtml && !context.isTypst) {
        const guideAneData = {
          alpha,
          targetAB,
          targetFraction,
          snapToCentimeter: true,
          disableADrag: true,
          targetValue,
          printAD: this.sup,
          printRatio: this.sup2,
          fractionToDecimalAD: true,
          displayTargetOn: false,
        }
        texte += `.<br>Utilisez les points draggables pour ajuster la construction du guide-âne.<br>
       ${addGuideAne(this, i, guideAneData)}<br>
       ${ajouteFeedback(this, i)}`

        texteCorr = `Le segment $[AB]$ mesurant $${targetAB}$ cm, on place un point $C$ sur une demi-droite issue de $A$ tel que $AC=${targetN}$ unités.<br>
        Ensuite, on trace $${targetN - 1}$ parallèles à $[CB]$ passant par les points sur cette demi-droite.<br>
        Ces parallèles coupent le segment $[AB]$ en $${targetN}$ segments de même longueur.<br>
         Le point $D$ est placé sur la $${targetP}^\\text{ème}$ parallèle, ce qui donne $AD=\\dfrac{${targetP}}{${targetN}}AB${egalOuApprox(targetValue, 2)}${texNombre(targetValue, 2)}$ cm.<br>
         ${GuideAne.create({
           numeroExercice: this.numeroExercice,
           questionIndex: i,
           A: { x: 100, y: 300 },
           n: targetN,
           p: targetP,
           alpha,
           targetAB,
           disableADrag: true,
           displayTargetOn: true,
           interactivityOn: false,
         })}`
      } else {
        // contexte latex
        texte += ' sans utiliser les graduations de la règle.<br>'
        texte += GuideAne.create({
          numeroExercice: this.numeroExercice,
          questionIndex: i,
          n: targetN,
          p: targetP,
          alpha,
          targetAB,
          interactivityOn: true,
        })
        texteCorr = `Le segment $[AB]$ mesurant $${targetAB}$ cm, on place un point $C$ sur une demi-droite issue de $A$ tel que $AC=${targetN}$ unités.<br>
        Ensuite, on trace $${targetN - 1}$ parallèles passant par les points sur cette demi-droite.<br>
        Ces parallèles coupent le segment $[AB]$ en $${targetN}$ segments de même longueur.<br>
         Le point $D$ est placé sur la $${targetP}^\\text{ème}$ parallèle, ce qui donne $AD=\\dfrac{${targetP}}{${targetN}}AB${egalOuApprox(targetValue, 2)}${texNombre(targetValue, 2)}$ cm.<br>
         ${GuideAne.create({
           numeroExercice: this.numeroExercice,
           questionIndex: i,
           n: targetN,
           p: targetP,
           alpha,
           targetAB,
           disableADrag: true,
           displayTargetOn: true,
           interactivityOn: false,
         })}`
      }
      if (this.questionJamaisPosee(i, targetAB, targetN, targetP)) {
        // GuideAne.verifQuestion() n'utilise pas exercice.autoCorrection[i], mais on remplit quand-même pour harmoniser les usages
        handleAnswers(
          this,
          i,
          {
            reponse: {
              value: JSON.stringify({
                n: targetN,
                p: targetP,
                lengthAD: targetValue,
                lengthAB: targetAB,
              }),
            },
          },
          { formatInteractif: 'guide-ane' },
        )
        this.listeQuestions.push(texte)
        this.listeCorrections.push(texteCorr)
        i++
      }
      cpt++
    }
  }
}
