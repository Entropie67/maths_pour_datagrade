// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 515b0 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { equation1erDegre1Inconnue } from '../../lib/outils/equations'
import { sp } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

export const titre =
  'Résoudre une équation du premier degré à solutions entières'

/**
 * Équation du premier degré
 * * Type 1 : x+b=d ou ax=d
 * * Type 2 : ax+b=d
 * * Type 3 : ax+b=cx+d
 * * Tous les types
 * @author Rémi Angot
 * Modifications de 4L20 pour n'avoir que des solutions entières : Jean-claude Lhote
 * Refactorisation et extraction de la fonction génératrice d'équations par Guillaume Valmont le 06/06/2025
 * 4L20-0
 */
export const uuid = '515b0'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class ExerciceEquationASolutionEntiereOld extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = ['Avec des nombres relatifs']
    this.besoinFormulaire2Numerique = [
      "Type d'équations",
      4,
      '1 : ax=d ou x+b=d ou x-b=d\n2: ax+b=d\n3: ax+b=cx+d\n4: Mélange',
    ]

    this.spacing = 2
    this.spacingCorr = context.isHtml ? 3 : 2
    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = context.isHtml
    this.sup = true // Avec des nombres relatifs
    this.sup2 = 4 // Choix du type d'équation
    this.nbQuestions = 6
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions > 1 ? 'Résoudre les équations suivantes.' : ''
    let listeTypeDeQuestions: (
      'ax+b=0' | 'ax+b=d' | 'ax=d' | 'x+b=d' | 'ax+b=cx+d'
    )[] = []
    switch (this.sup2.toString()) {
      case '1':
        listeTypeDeQuestions = ['ax=d', 'x+b=d']
        break
      case '2':
        listeTypeDeQuestions = ['ax+b=d']
        break
      case '3':
        listeTypeDeQuestions = ['ax+b=cx+d']
        break
      default:
        listeTypeDeQuestions = [
          'ax+b=0',
          'ax+b=d',
          'ax=d',
          'x+b=d',
          'ax+b=cx+d',
        ]
        break
    }
    listeTypeDeQuestions = combinaisonListes(
      listeTypeDeQuestions,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const equation = equation1erDegre1Inconnue({
        valeursRelatives: this.sup,
        type: listeTypeDeQuestions[i],
      })
      let texte = ''
      if (this.nbQuestions === 1) texte += "Résoudre l'équation "
      texte += `$${equation.egalite}$`
      if (this.nbQuestions === 1) texte += '.'
      texte += `${ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase, { texteApres: '.', texteAvant: sp(10) + '<br>La solution est : $x=$' })}`
      const texteCorr =
        texte +
        '<br>' +
        (this.correctionDetaillee
          ? equation.correctionDetaillee
          : equation.correction)
      handleAnswers(
        this,
        i,
        { reponse: { value: equation.reponse } },
        { signe: !!this.sup },
      )
      if (this.questionJamaisPosee(i, equation.a, equation.b, equation.c)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
    if (!context.isHtml) {
      this.canEnonce = "Résoudre l'équation " + this.listeQuestions[0] + '.'
      this.correction = this.listeCorrections[0]

      for (const enonce of this.listeQuestions) {
        this.listeCanEnonces.push("Résoudre l'équation " + enonce + '.')
      }
    }
  }
}
