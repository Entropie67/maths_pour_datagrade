import { courbe } from '../../../lib/2d/Courbe'
import { droite } from '../../../lib/2d/droites'
import { crochetD, crochetG } from '../../../lib/2d/intervalles'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { repere } from '../../../lib/2d/reperes'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../../lib/2d/textes'
import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { mathalea2d } from '../../../modules/mathalea2d'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Résoudre une inéquation du type $x^2<k$ ou $x^2>k$'
export const interactifReady = true

export const dateDePublication = '04/05/2024'
export const uuid = '1f55b'
export const refs = {
  'fr-fr': ['can2L3-03'],
  'fr-ch': ['NR'],
}
/**
 * @author Gilles Mora
 */
export default class EquationsCarree extends ExerciceSimple {
  constructor() {
    super()
    this.canOfficielle = false
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
    const Texte1 = latex2d(`y=${a ** 2}`, 4, 2.7, {
      color: 'green',
      letterSize: 'scriptsize',
      backgroundColor: '',
    })
    const Texte2 = latex2d('y=x^2', 3, 4.5, {
      color: bleuMathalea,
      letterSize: 'scriptsize',
      backgroundColor: '',
    })
    const Texte3 = latex2d(`-${a}`, -1.73, -0.6, {
      color: 'red',
      letterSize: 'scriptsize',
      backgroundColor: '',
    })
    const Texte4 = latex2d(`${a}`, 1.73, -0.6, {
      color: 'red',
      letterSize: 'scriptsize',
      backgroundColor: '',
    })
    const A = pointAbstrait(1.73, 3)
    const Ax = pointAbstrait(A.x, 0)
    const sAAx = segment(A, Ax)
    const B = pointAbstrait(-1.73, 3)
    const Bx = pointAbstrait(B.x, 0)
    const sBBx = segment(B, Bx)
    const f = (x: number): number => x ** 2
    const Cg = droite(pointAbstrait(-6, 3), pointAbstrait(6, 3), '', 'green')
    switch (this.quotaChoice('type', [1, 2])) {
      case 1: // x^2<k
        {
          const choix = choice([true, false])
          sAAx.epaisseur = 2
          sAAx.pointilles = 5
          sBBx.epaisseur = 2
          sBBx.pointilles = 5
          const sAxBx = segment(Bx, Ax, 'red')
          sAxBx.epaisseur = 2
          const c1 = choix ? crochetG(Bx, 'red') : crochetD(Bx, 'red')
          const c2 = choix ? crochetD(Ax, 'red') : crochetG(Ax, 'red')
          const r1 = repere({
            xMin: -4,
            yMin: -1,
            yMax: 5,
            xMax: 4,
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
          Cg.epaisseur = 2
          const graphiqueC = mathalea2d(
            {
              xmin: -6,
              xmax: 6,
              ymin: -1.5,
              ymax: 5,
              pixelsParCm: 30,
              scale: 1,
            },
            courbe(f, {
              repere: r1,
              color: bleuMathalea,
              epaisseur: 2,
            }),
            Cg,
            r1,
            o,
            sAAx,
            sBBx,
            sAxBx,
            c1,
            c2,
            Texte1,
            Texte2,
            Texte3,
            Texte4,
          )
          reponse = choix ? `]-${a};${a}[` : `[-${a};${a}]`
          this.question = `Donner l'ensemble $S$ des solutions de l'inéquation $x^2${choix ? '<' : ' \\leqslant '}${a ** 2}$.`
          this.correction =
            'Pour résoudre cette inéquation, on peut imaginer le graphique correspondant à la situation : <br>'
          this.correction += `${graphiqueC}`
          this.correction += `L'ensemble des solutions de l'inéquation $x^2${choix ? '<' : ' \\leqslant '}${a ** 2}$ est :
            ${choix ? `$${miseEnEvidence(`]${-a}\\,;\\,${a}[`)}$.` : `$${miseEnEvidence(`[${-a}\\,;\\,${a}]`)}$.`}`
        }
        break
      case 2: // x^2>k
        {
          const choix = choice([true, false])
          sAAx.epaisseur = 2
          sAAx.pointilles = 5
          sBBx.epaisseur = 2
          sBBx.pointilles = 5
          const BxI = pointAbstrait(-4, 0)
          const sBxBxI = segment(BxI, Bx, 'red')
          sBxBxI.epaisseur = 2
          const c1 = choix ? crochetD(Bx, 'red') : crochetG(Bx, 'red')
          const AxI = pointAbstrait(4, 0)
          const sAxAxI = segment(Ax, AxI, 'red')
          sAxAxI.epaisseur = 2
          const c2 = choix ? crochetG(Ax, 'red') : crochetD(Ax, 'red')
          const r1 = repere({
            xMin: -4,
            yMin: -1,
            yMax: 5,
            xMax: 4,
            xUnite: 1,
            yUnite: 1,
            axeXStyle: '->',
            axeYStyle: '->',
            grilleX: false,
            grilleY: false,
            xThickListe: [-6],
            yThickListe: [-6],
            xLabelListe: [-6],
            yLabelListe: [-6],
          })

          Cg.epaisseur = 2
          const graphiqueC = mathalea2d(
            {
              xmin: -5,
              xmax: 6,
              ymin: -1.5,
              ymax: 5.5,
              pixelsParCm: 30,
              scale: 1,
            },
            courbe(f, {
              repere: r1,
              color: bleuMathalea,
              epaisseur: 2,
            }),
            Cg,
            r1,
            o,
            sAAx,
            sBBx,
            sAxAxI,
            sBxBxI,
            c1,
            c2,
            Texte1,
            Texte2,
            Texte3,
            Texte4,
          )
          reponse = choix
            ? `]-\\infty;${-a}[\\cup]${a};+\\infty[`
            : `]-\\infty;${-a}]\\cup[${a};+\\infty[`
          this.question = `Donner l'ensemble $S$ des solutions de l'inéquation : $x^2${choix ? '>' : ' \\geqslant '}${a ** 2}$.`
          this.correction =
            'Pour résoudre cette inéquation, on peut imaginer le graphique correspondant à la situation : <br>'
          this.correction += `${graphiqueC}<br>`
          this.correction += `L'ensemble des solutions de l'inéquation 
        $x^2${choix ? '>' : ' \\geqslant '}${a}$ est : 
        ${choix ? `$${miseEnEvidence(`]-\\infty\\,;\\,-${a}[\\cup ]${a}\\,;\\, +\\infty[`)}$` : `$${miseEnEvidence(`]-\\infty\\,;\\,-${a}]\\cup [${a}\\,;\\, +\\infty[`)}$`}.`
        }
        break
    }
    this.reponse = {
      reponse: {
        value: reponse,
        options: { intervalle: true },
      },
    }
    if (this.interactif) {
      this.question += `<br>
  $S=$`
    }

    this.canReponseACompleter = '\\hspace{-2.5cm}$S=\\ldots$'
  }
}
