import { bleuMathalea } from '../../../lib/colors'
import {
    ecritureAlgebrique,
    ecritureAlgebriqueSauf1,
} from '../../../lib/outils/ecritures'
import {
    miseEnCouleur,
    miseEnEvidence,
    texteEnCouleurEtGras,
} from '../../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre =
  "Déterminer si une équation cartésienne est l'équation d'un cercle"
export const dateDePublication = '05/09/2025'
export const interactifReady = false
export const uuid = '4efcd'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['2mEqCar-2'],
}

/**
 * Déterminer si une équation cartésienne est l'équation d'un cercle
 * @author Nathan Scheinmann
 */

export default class ExerciceTangenteCourbe extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      let texte = ''
      let texteCorr = ''
      const rPot = randint(-12, 12, [0])
      const x1 = randint(-10, 10)
      const y1 = randint(-10, 10)
      const cConst = x1 ** 2 + y1 ** 2 - rPot ** 2 * (rPot > 0 ? 1 : -1)
      const cX = -2 * x1
      const cY = -2 * y1
      let eqCerclePot = ''
      if (cConst === 0) {
        eqCerclePot = `x^2 + y^2 ${ecritureAlgebriqueSauf1(cX)}x ${ecritureAlgebriqueSauf1(cY)}y = 0`
      } else {
        eqCerclePot = `x^2 + y^2 ${ecritureAlgebriqueSauf1(cX)}x ${ecritureAlgebriqueSauf1(cY)}y ${ecritureAlgebrique(cConst)} = 0`
      }

      texte += `Déterminer si l'équation $${eqCerclePot}$ est l'équation d'un cercle. Si oui, donner son centre et son rayon.`
      texteCorr += `Une équation représente un cercle si on peut la mettre sous la forme 
      \\[(x - x_0)^2 + (y - y_0)^2 = r^2\\]
      avec $(x_0\\,;\\,y_0)$ le centre du cercle et $r$ son rayon.<br>
      On commence par appliquer la technique de la complétion du carré pour faire apparaître les carrés parfaits $(x - x_0)^2$ et $(y - y_0)^2$ dans l'équation initiale.<br>
      On a <br>
      $\\begin{aligned}
      &${eqCerclePot} \\\\
      \\iff& x^2 ${ecritureAlgebriqueSauf1(cX)}x + y^2  ${ecritureAlgebriqueSauf1(cY)}y ${ecritureAlgebrique(cConst)} = 0 \\\\
      \\iff& x^2 ${ecritureAlgebriqueSauf1(cX)}x ${miseEnCouleur(`\\,+ \\left(\\frac{${cX}}{2}\\right)^2 - \\left(\\frac{${cX}}{2}\\right)^2`, 'red')} + y^2  ${ecritureAlgebriqueSauf1(cY)}y ${miseEnCouleur(`\\,+ \\left(\\frac{${cY}}{2}\\right)^2 - \\left(\\frac{${cY}}{2}\\right)^2`, 'red')} ${ecritureAlgebrique(cConst)} = 0 \\\\
      \\iff& ${miseEnCouleur(`\\,x^2 ${ecritureAlgebriqueSauf1(cX)}x ${ecritureAlgebrique((cX / 2) ** 2)}`, 'green')}  ${miseEnCouleur(`\\,${ecritureAlgebrique(-((cX / 2) ** 2))}`, 'orange')} + ${miseEnCouleur(`\\,y^2  ${ecritureAlgebriqueSauf1(cY)}y ${ecritureAlgebrique((cY / 2) ** 2)}`, bleuMathalea)}  ${miseEnCouleur(`\\,${ecritureAlgebrique(-((cY / 2) ** 2))} ${ecritureAlgebrique(cConst)}`, 'orange')} = 0 \\\\
      \\iff& ${miseEnCouleur(`\\,(x ${ecritureAlgebrique(-x1)})^2`, 'green')} + ${miseEnCouleur(`\\,(y ${ecritureAlgebrique(-y1)})^2`, bleuMathalea)} = ${miseEnCouleur(`\\,${rPot < 0 ? '-' : ''}${rPot ** 2}`, 'orange')}
      \\end{aligned}$<br>
      `
      if (rPot > 0) {
        texteCorr += `$\\iff(x ${ecritureAlgebrique(-x1)})^2 + (y ${ecritureAlgebrique(-y1)})^2 =${rPot}^2$<br>`
        texteCorr += `${texteEnCouleurEtGras(`C'est l'équation d'un cercle de centre`)} $${miseEnEvidence(`(${x1}\\,;\\,${y1})`)}$ ${texteEnCouleurEtGras('et de rayon')} $${miseEnEvidence(`${rPot}`)}$.`
      } else if (rPot < 0) {
        texteCorr += `Le membre de droite de l'équation ne peut pas être écrit sous la forme d'un carré, donc ${texteEnCouleurEtGras(`ce n'est pas l'équation d'un cercle`)}.`
      }
      if (this.questionJamaisPosee(i, rPot, x1, y1)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
