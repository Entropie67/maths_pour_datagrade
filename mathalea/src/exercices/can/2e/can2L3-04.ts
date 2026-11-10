import { courbe } from '../../../lib/2d/Courbe'
import { droiteParPointEtPente } from '../../../lib/2d/droites'
import { crochetD, crochetG } from '../../../lib/2d/intervalles'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { repere } from '../../../lib/2d/reperes'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../../lib/2d/textes'
import { bleuMathalea } from '../../../lib/colors'
import { sameInterval, seq } from '../../../lib/interactif/checks'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { mathalea2d } from '../../../modules/mathalea2d'
import ExerciceSimple from '../../ExerciceSimple'

export const titre =
  'Résoudre une inéquation du type $\\sqrt{x}<k$ ou $\\sqrt{x}>k$'
export const interactifReady = true

export const dateDePublication = '18/05/2024'
export const uuid = 'bdc96'
export const refs = {
  'fr-fr': ['can2L3-04'],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class EquationsRacCarree extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierEnsemble
  }

  nouvelleVersion() {
    let reponse = ''
    const a = this.quotaRandint('a', 1, 12)
    const o = latex2d('\\text{O}', -0.2, -0.3, {
      color: 'black',
      letterSize: 'scriptsize',
      backgroundColor: '',
    })
    const Texte1 = latex2d(`y=${a}`, 4, 1.2, {
      color: 'green',
      letterSize: 'scriptsize',
      backgroundColor: '',
    })
    const Texte2 = latex2d('y=\\sqrt{x}', 3, 2.3, {
      color: bleuMathalea,
      letterSize: 'scriptsize',
      backgroundColor: '',
    })
    const Texte3 = latex2d(`${a ** 2}`, 2.25, -0.6, {
      color: 'red',
      letterSize: 'scriptsize',
      backgroundColor: '',
    })
    const choix = this.quotaChoice('choix', [true, false])
    const A = pointAbstrait(2.25, 1.5)
    const Ax = pointAbstrait(A.x, 0)
    const sAAx = segment(A, Ax)
    const O = pointAbstrait(0, 0)
    const sAxBx = segment(O, Ax, 'red')

    const f = (x: number) => Math.sqrt(x)
    const Cg = droiteParPointEtPente(pointAbstrait(0, 1.5), 0, '', 'green')
    const r1 = repere({
      xMin: -1,
      yMin: -1,
      yMax: 4,
      xMax: 5,
      xUnite: 1,
      yUnite: 1,
      axeXStyle: '->',
      axeYStyle: '->',
      grilleX: false,
      grilleY: false,
      xThickListe: [0],
      yThickListe: [0],
      xLabelListe: [-6],
      yLabelListe: [-6],
    })
    switch (choice([2])) {
      case 1: // sqrt(x)<k
        {
          const c1 = choix ? crochetD(Ax, 'red') : crochetG(Ax, 'red')
          const c0 = crochetD(O, 'red')

          sAAx.epaisseur = 2
          sAAx.pointilles = 5
          sAxBx.epaisseur = 2
          sAxBx.tailleExtremites = 4

          Cg.epaisseur = 2
          const graphiqueC = mathalea2d(
            {
              xmin: -2,
              xmax: 6,
              ymin: -1,
              ymax: 4,
              pixelsParCm: 30,
              scale: 0.7,
            },
            courbe(f, {
              repere: r1,
              color: bleuMathalea,
              epaisseur: 2,
              xMin: 0,
            }),
            Cg,
            r1,
            sAAx,
            o,
            sAxBx,
            c0,
            c1,
            Texte1,
            Texte2,
            Texte3,
          )
          reponse = choix ? `[0;${a ** 2}[` : `[0;${a ** 2}]`
          this.question = `Donner l'ensemble $S$ des solutions de l'inéquation $\\sqrt{x}${choix ? '<' : ' \\leqslant '}${a}$.`
          this.correction =
            'Pour résoudre cette inéquation, on peut imaginer le graphique correspondant à la situation : <br>'
          this.correction += `${graphiqueC}`
          this.correction += `L'ensemble des solutions de l'inéquation $\\sqrt{x}${choix ? '<' : ' \\leqslant '}${a}$ est :
            ${choix ? `$${miseEnEvidence(`[0\\,;\\,${a ** 2}[`)}$.` : `$${miseEnEvidence(`[0\\,;\\,${a ** 2}]`)}$.`}`
        }
        break
      case 2: // sqrt(x)>k
        {
          sAAx.epaisseur = 2
          sAAx.pointilles = 5
          const AxI = pointAbstrait(5, 0)
          const sAxAxI = segment(Ax, AxI, 'red')
          const c1 = choix ? crochetG(Ax, 'red') : crochetD(Ax, 'red')

          sAxAxI.epaisseur = 2

          sAxAxI.tailleExtremites = 4
          Cg.epaisseur = 2
          const graphiqueC = mathalea2d(
            {
              xmin: -2,
              xmax: 6,
              ymin: -1,
              ymax: 4,
              pixelsParCm: 30,
              scale: 0.7,
            },
            courbe(f, {
              repere: r1,
              color: bleuMathalea,
              epaisseur: 2,
              xMin: 0,
            }),
            Cg,
            r1,
            o,
            c1,
            sAAx,
            sAxAxI,
            Texte1,
            Texte2,
            Texte3,
          )
          reponse = choix ? `]${a ** 2};+\\infty[` : `[${a ** 2};+\\infty[`
          this.question = `Donner l'ensemble $S$ des solutions de l'inéquation : $\\sqrt{x}${choix ? '>' : ' \\geqslant '}${a}$.`
          this.correction =
            'Pour résoudre cette inéquation, on peut imaginer le graphique correspondant à la situation : <br>'
          this.correction += `${graphiqueC}<br>`
          this.correction += `L'ensemble des solutions de l'inéquation 
        $\\sqrt{x}${choix ? '>' : ' \\geqslant '}${a}$ est : 
        ${choix ? `$${miseEnEvidence(`]${a ** 2}\\,;\\,+\\infty[`)}$` : `$${miseEnEvidence(`[${a ** 2}\\,;\\,+\\infty[`)}$`}.`
        }
        break
    }
    this.reponse = {
      reponse: { value: reponse, compare: seq([sameInterval()]) },
    }
    if (this.interactif) {
      this.question += `<br>
  $S=$`
    }

    this.canReponseACompleter = '\\hspace{-2.5cm}$S=\\ldots$'
  }
}
