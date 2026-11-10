// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 8d642 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
/**
 * @author Gilles Mora
 *
 */
export const uuid = '8d642'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Exprimer une variable en fonction des autres'
export const dateDePublication = '05/08/2025'

export default class Auto1AC13bOld extends ExerciceQcmA {
  versionOriginale: () => void = () => {
    this.enonce = `Soient $a$, $b$, $c$ et $d$ quatre nombres (avec $d$ non nul) vérifiant l'égalité :<br>
    $a = b - cd$.<br>
    Exprimer $c$ en fonction de $a$, $b$ et $d$.`

    this.correction = `On isole $c$ dans un membre de l'égalité :<br>
    $\\begin{aligned}
    a &= b - cd\\\\
    a - b &= -cd\\\\
    -a + b &= cd\\\\
    \\dfrac{-a + b}{d} &= c
    \\end{aligned}$<br>
    Une expression de $c$ en fonction de $a$, $b$ et $d$ est $${miseEnEvidence('c = \\dfrac{b - a}{d}')}$.`

    this.reponses = [
      '$c=\\dfrac{b - a}{d}$',
      '$c=\\dfrac{a - b}{d}$',
      '$c=d(b - a)$',
      '$c=\\dfrac{b + a}{d}$',
    ]
  }

  versionAleatoire: () => void = () => {
    const nomVariables = [
      shuffle(['a', 'b', 'c', 'e']),
      shuffle(['x', 'y', 'z', 'w']),
      shuffle(['u', 'v', 'w', 't']),
      shuffle(['A', 'B', 'C', 'E']),
      shuffle(['R', 'S', 'T', 'U']),
      shuffle(['I', 'J', 'K', 'L']),
      shuffle(['c', 'g', 'e', 'f']),
      shuffle(['c', 'm', 'f', 'e']),
      shuffle(['K', 'L', 'M', 'N']),
      shuffle(['r', 's', 't', 'u']),
      shuffle(['U', 'V', 'W', 'X']),
    ]
    const nomV = choice(nomVariables)
    const choix = randint(1, 12)

    switch (choix) {
      case 1: {
        // a=b-cd on cherche c
        const intro = `Soient $${nomV[0]}$, $${nomV[1]}$, $${nomV[2]}$ et $${nomV[3]}$ quatre nombres (avec $${nomV[3]}$ non nul) vérifiant l'égalité :`

        this.enonce = `${intro} $${nomV[0]} = ${nomV[1]} - ${nomV[2]}${nomV[3]}$.<br>
        Une expression de $${nomV[2]}$ en fonction de $${nomV[0]}$, $${nomV[1]}$ et $${nomV[3]}$ est :`

        this.correction = `On isole $${nomV[2]}$ dans un membre de l'égalité :<br>
        $\\begin{aligned}
        ${nomV[0]} &= ${nomV[1]} - ${nomV[2]}${nomV[3]}\\\\
        ${nomV[0]} - ${nomV[1]} &= -${nomV[2]}${nomV[3]}\\\\
        -${nomV[0]} + ${nomV[1]} &= ${nomV[2]}${nomV[3]}\\\\
        \\dfrac{-${nomV[0]} + ${nomV[1]}}{${nomV[3]}} &= ${nomV[2]}
        \\end{aligned}$<br>
        Une expression de $${nomV[2]}$ en fonction de $${nomV[0]}$, $${nomV[1]}$ et $${nomV[3]}$ est $${miseEnEvidence(nomV[2] + ' = \\dfrac{' + nomV[1] + ' - ' + nomV[0] + '}{' + nomV[3] + '}')}$.`

        this.reponses = [
          `$${nomV[2]} = \\dfrac{${nomV[1]} - ${nomV[0]}}{${nomV[3]}}$`,
          `$${nomV[2]} = \\dfrac{${nomV[0]} - ${nomV[1]}}{${nomV[3]}}$`,
          `$${nomV[2]} = ${nomV[3]}(${nomV[1]} - ${nomV[0]})$`,
          `$${nomV[2]} = \\dfrac{${nomV[1]} + ${nomV[0]}}{${nomV[3]}}$`,
        ]
        break
      }

      case 2: {
        // a=b-cd on cherche d
        const intro = `Soient $${nomV[0]}$, $${nomV[1]}$, $${nomV[2]}$ et $${nomV[3]}$ quatre nombres (avec $${nomV[2]}$ non nul) vérifiant l'égalité :`

        this.enonce = `${intro} $${nomV[0]} = ${nomV[1]} - ${nomV[2]}${nomV[3]}$.<br>
        Une expression de $${nomV[3]}$ en fonction de $${nomV[0]}$, $${nomV[1]}$ et $${nomV[2]}$ est :`

        this.correction = `On isole $${nomV[3]}$ dans un membre de l'égalité :<br>
        $\\begin{aligned}
        ${nomV[0]} &= ${nomV[1]} - ${nomV[2]}${nomV[3]}\\\\
        ${nomV[0]} - ${nomV[1]} &= -${nomV[2]}${nomV[3]}\\\\
        -${nomV[0]} + ${nomV[1]} &= ${nomV[2]}${nomV[3]}\\\\
        \\dfrac{-${nomV[0]} + ${nomV[1]}}{${nomV[2]}} &= ${nomV[3]}
        \\end{aligned}$<br>
        Une expression de $${nomV[3]}$ en fonction de $${nomV[0]}$, $${nomV[1]}$ et $${nomV[2]}$ est $${miseEnEvidence(nomV[3] + ' = \\dfrac{' + nomV[1] + ' - ' + nomV[0] + '}{' + nomV[2] + '}')}$.`

        this.reponses = [
          `$${nomV[3]} = \\dfrac{${nomV[1]} - ${nomV[0]}}{${nomV[2]}}$`,
          `$${nomV[3]} = \\dfrac{${nomV[0]} - ${nomV[1]}}{${nomV[2]}}$`,
          `$${nomV[3]} = ${nomV[2]}(${nomV[1]} - ${nomV[0]})$`,
          `$${nomV[3]} = \\dfrac{${nomV[1]} + ${nomV[0]}}{${nomV[2]}}$`,
        ]
        break
      }

      case 3: {
        // a=b-cd on cherche b
        const intro = `Soient $${nomV[0]}$, $${nomV[1]}$, $${nomV[2]}$ et $${nomV[3]}$ quatre nombres vérifiant l'égalité :`

        this.enonce = `${intro} $${nomV[0]} = ${nomV[1]} - ${nomV[2]}${nomV[3]}$.<br>
         Une expression de $${nomV[1]}$ en fonction de $${nomV[0]}$, $${nomV[2]}$ et $${nomV[3]}$ est :`

        this.correction = `On isole $${nomV[1]}$ dans un membre de l'égalité :<br>
        $\\begin{aligned}
        ${nomV[0]} &= ${nomV[1]} - ${nomV[2]}${nomV[3]}\\\\
        ${nomV[0]} + ${nomV[2]}${nomV[3]} &= ${nomV[1]}
        \\end{aligned}$<br>
        Une expression de $${nomV[1]}$ en fonction de $${nomV[0]}$, $${nomV[2]}$ et $${nomV[3]}$ est $${miseEnEvidence(nomV[1] + ' = ' + nomV[0] + ' + ' + nomV[2] + nomV[3])}$.`

        this.reponses = [
          `$${nomV[1]} = ${nomV[0]} + ${nomV[2]}${nomV[3]}$`,
          `$${nomV[1]} = ${nomV[0]} - ${nomV[2]}${nomV[3]}$`,
          `$${nomV[1]} = \\dfrac{${nomV[0]}}{${nomV[2]}${nomV[3]}}$`,
          `$${nomV[1]} = ${nomV[0]} \\times ${nomV[2]}${nomV[3]}$`,
        ]
        break
      }

      case 4: {
        // a=bc+d on cherche b
        const intro = `Soient $${nomV[0]}$, $${nomV[1]}$, $${nomV[2]}$ et $${nomV[3]}$ quatre nombres (avec $${nomV[2]}$ non nul) vérifiant l'égalité :`

        this.enonce = `${intro} $${nomV[0]} = ${nomV[1]}${nomV[2]} + ${nomV[3]}$.<br>
        Une expression de $${nomV[1]}$ en fonction de $${nomV[0]}$, $${nomV[2]}$ et $${nomV[3]}$ est :`

        this.correction = `On isole $${nomV[1]}$ dans un membre de l'égalité :<br>
        $\\begin{aligned}
        ${nomV[0]} &= ${nomV[1]}${nomV[2]} + ${nomV[3]}\\\\
        ${nomV[0]} - ${nomV[3]} &= ${nomV[1]}${nomV[2]}\\\\
        \\dfrac{${nomV[0]} - ${nomV[3]}}{${nomV[2]}} &= ${nomV[1]}
        \\end{aligned}$<br>
        Une expression de $${nomV[1]}$ en fonction de $${nomV[0]}$, $${nomV[2]}$ et $${nomV[3]}$ est $${miseEnEvidence(nomV[1] + ' = \\dfrac{' + nomV[0] + ' - ' + nomV[3] + '}{' + nomV[2] + '}')}$.`

        this.reponses = [
          `$${nomV[1]} = \\dfrac{${nomV[0]} - ${nomV[3]}}{${nomV[2]}}$`,
          `$${nomV[1]} = \\dfrac{${nomV[0]} + ${nomV[3]}}{${nomV[2]}}$`,
          `$${nomV[1]} = ${nomV[2]}(${nomV[0]} - ${nomV[3]})$`,
          `$${nomV[1]} = \\dfrac{${nomV[3]} - ${nomV[0]}}{${nomV[2]}}$`,
        ]
        break
      }

      case 5: {
        // a=bc+d on cherche d
        const intro = `Soient $${nomV[0]}$, $${nomV[1]}$, $${nomV[2]}$ et $${nomV[3]}$ quatre nombres vérifiant l'égalité suivante :`

        this.enonce = `${intro} $${nomV[0]} = ${nomV[1]}${nomV[2]} + ${nomV[3]}$.<br>
         Une expression de $${nomV[3]}$ en fonction de $${nomV[0]}$, $${nomV[1]}$ et $${nomV[2]}$ est :`

        this.correction = `On isole $${nomV[3]}$ dans un membre de l'égalité :<br>
        $\\begin{aligned}
        ${nomV[0]} &= ${nomV[1]}${nomV[2]} + ${nomV[3]}\\\\
        ${nomV[0]} - ${nomV[1]}${nomV[2]} &= ${nomV[3]}
        \\end{aligned}$<br>
        Une expression de $${nomV[3]}$ en fonction de $${nomV[0]}$, $${nomV[1]}$ et $${nomV[2]}$ est $${miseEnEvidence(nomV[3] + ' = ' + nomV[0] + ' - ' + nomV[1] + nomV[2])}$.`

        this.reponses = [
          `$${nomV[3]} = ${nomV[0]} - ${nomV[1]}${nomV[2]}$`,
          `$${nomV[3]} = ${nomV[0]} + ${nomV[1]}${nomV[2]}$`,
          `$${nomV[3]} = \\dfrac{${nomV[0]}}{${nomV[1]}${nomV[2]}}$`,
          `$${nomV[3]} = ${nomV[0]} \\times ${nomV[1]}${nomV[2]}$`,
        ]
        break
      }

      case 6: {
        // a=(b+c)/d on cherche b
        const intro = `Soient $${nomV[0]}$, $${nomV[1]}$, $${nomV[2]}$ et $${nomV[3]}$ quatre nombres (avec $${nomV[3]}$ non nul) vérifiant l'égalité :`

        this.enonce = `${intro} $${nomV[0]} = \\dfrac{${nomV[1]} + ${nomV[2]}}{${nomV[3]}}$.<br>
        Une expression de $${nomV[1]}$ en fonction de $${nomV[0]}$, $${nomV[2]}$ et $${nomV[3]}$ est :`

        this.correction = `On isole $${nomV[1]}$ dans un membre de l'égalité :<br>
        $\\begin{aligned}
        ${nomV[0]} &= \\dfrac{${nomV[1]} + ${nomV[2]}}{${nomV[3]}}\\\\
        ${nomV[0]} \\times ${nomV[3]} &= ${nomV[1]} + ${nomV[2]}\\\\
        ${nomV[0]} \\times ${nomV[3]} - ${nomV[2]} &= ${nomV[1]}
        \\end{aligned}$<br>
        Une expression de $${nomV[1]}$ en fonction de $${nomV[0]}$, $${nomV[2]}$ et $${nomV[3]}$ est $${miseEnEvidence(nomV[1] + ' = ' + nomV[3] + ' \\times ' + nomV[0] + ' - ' + nomV[2])}$.`

        this.reponses = [
          `$${nomV[1]} = ${nomV[3]} \\times ${nomV[0]} - ${nomV[2]}$`,
          `$${nomV[1]} = ${nomV[3]} \\times ${nomV[0]} + ${nomV[2]}$`,
          `$${nomV[1]} = \\dfrac{${nomV[0]} - ${nomV[2]}}{${nomV[3]}}$`,
          `$${nomV[1]} = ${nomV[0]} - ${nomV[2]} \\times ${nomV[3]}$`,
        ]
        break
      }

      case 7: {
        // a=(b+c)/d on cherche c
        const intro = `Soient $${nomV[0]}$, $${nomV[1]}$, $${nomV[2]}$ et $${nomV[3]}$ quatre nombres (avec $${nomV[3]}$ non nul) vérifiant l'égalité :`

        this.enonce = `${intro} $${nomV[0]} = \\dfrac{${nomV[1]} + ${nomV[2]}}{${nomV[3]}}$.<br>
         Une expression de $${nomV[2]}$ en fonction de $${nomV[0]}$, $${nomV[1]}$ et $${nomV[3]}$ est :`

        this.correction = `On isole $${nomV[2]}$ dans un membre de l'égalité :<br>
        $\\begin{aligned}
        ${nomV[0]} &= \\dfrac{${nomV[1]} + ${nomV[2]}}{${nomV[3]}}\\\\
        ${nomV[0]} \\times ${nomV[3]} &= ${nomV[1]} + ${nomV[2]}\\\\
        ${nomV[0]} \\times ${nomV[3]} - ${nomV[1]} &= ${nomV[2]}
        \\end{aligned}$<br>
        Une expression de $${nomV[2]}$ en fonction de $${nomV[0]}$, $${nomV[1]}$ et $${nomV[3]}$ est $${miseEnEvidence(nomV[2] + ' = ' + nomV[3] + ' \\times ' + nomV[0] + ' - ' + nomV[1])}$.`

        this.reponses = [
          `$${nomV[2]} = ${nomV[3]} \\times ${nomV[0]} - ${nomV[1]}$`,
          `$${nomV[2]} = ${nomV[3]} \\times ${nomV[0]} + ${nomV[1]}$`,
          `$${nomV[2]} = \\dfrac{${nomV[0]} - ${nomV[1]}}{${nomV[3]}}$`,
          `$${nomV[2]} = ${nomV[0]} - ${nomV[1]} \\times ${nomV[3]}$`,
        ]
        break
      }

      case 8: {
        // a=(b+c)/d on cherche d
        const intro = `Soient $${nomV[0]}$, $${nomV[1]}$, $${nomV[2]}$ et $${nomV[3]}$ quatre nombres (avec $${nomV[3]}$ et $${nomV[0]}$ non nuls) vérifiant l'égalité :`

        this.enonce = `${intro} $${nomV[0]} = \\dfrac{${nomV[1]} + ${nomV[2]}}{${nomV[3]}}$.<br>
         Une expression de $${nomV[3]}$ en fonction de $${nomV[0]}$, $${nomV[1]}$ et $${nomV[2]}$ est :`

        this.correction = `On isole $${nomV[3]}$ dans un membre de l'égalité :<br>
        $\\begin{aligned}
        ${nomV[0]} &= \\dfrac{${nomV[1]} + ${nomV[2]}}{${nomV[3]}}\\\\
        ${nomV[0]} \\times ${nomV[3]} &= ${nomV[1]} + ${nomV[2]}\\\\
        ${nomV[3]} &= \\dfrac{${nomV[1]} + ${nomV[2]}}{${nomV[0]}}
        \\end{aligned}$<br>
        Une expression de $${nomV[3]}$ en fonction de $${nomV[0]}$, $${nomV[1]}$ et $${nomV[2]}$ est $${miseEnEvidence(nomV[3] + ' = \\dfrac{' + nomV[1] + ' + ' + nomV[2] + '}{' + nomV[0] + '}')}$.`

        this.reponses = [
          `$${nomV[3]} = \\dfrac{${nomV[1]} + ${nomV[2]}}{${nomV[0]}}$`,
          `$${nomV[3]} = \\dfrac{${nomV[1]} - ${nomV[2]}}{${nomV[0]}}$`,
          `$${nomV[3]} = ${nomV[0]}(${nomV[1]} + ${nomV[2]})$`,
          `$${nomV[3]} = \\dfrac{${nomV[0]}}{${nomV[1]} + ${nomV[2]}}$`,
        ]
        break
      }

      case 9: {
        // a=(b+c)*d on cherche b
        const intro = `Soient $${nomV[0]}$, $${nomV[1]}$, $${nomV[2]}$ et $${nomV[3]}$ quatre nombres (avec $${nomV[3]}$ non nul) vérifiant l'égalité :`

        this.enonce = `${intro} $${nomV[0]} = (${nomV[1]} + ${nomV[2]})${nomV[3]}$.<br>
         Une expression de $${nomV[1]}$ en fonction de $${nomV[0]}$, $${nomV[3]}$ et $${nomV[2]}$ est :`

        this.correction = `On isole $${nomV[1]}$ dans un membre de l'égalité :<br>
        $\\begin{aligned}
        ${nomV[0]} &= (${nomV[1]} + ${nomV[2]})${nomV[3]}\\\\
        ${nomV[0]} &= ${nomV[1]}${nomV[3]} + ${nomV[2]}${nomV[3]}\\\\
        ${nomV[0]} - ${nomV[2]}${nomV[3]} &= ${nomV[1]}${nomV[3]}\\\\
        \\dfrac{${nomV[0]} - ${nomV[2]}${nomV[3]}}{${nomV[3]}} &= ${nomV[1]}
        \\end{aligned}$<br>
        Une expression de $${nomV[1]}$ en fonction de $${nomV[0]}$, $${nomV[3]}$ et $${nomV[2]}$ est $${miseEnEvidence(nomV[1] + ' = \\dfrac{' + nomV[0] + '}{' + nomV[3] + '} - ' + nomV[2])}$.`

        this.reponses = [
          `$${nomV[1]} = \\dfrac{${nomV[0]}}{${nomV[3]}} - ${nomV[2]}$`,
          `$${nomV[1]} = \\dfrac{${nomV[0]}}{${nomV[3]}} + ${nomV[2]}$`,
          `$${nomV[1]} = ${nomV[0]} - ${nomV[2]}${nomV[3]}$`,
          `$${nomV[1]} = \\dfrac{${nomV[0]} + ${nomV[2]}${nomV[3]}}{${nomV[3]}}$`,
        ]
        break
      }

      case 10: {
        // a=(b+c)*d on cherche d
        const intro = `Soient $${nomV[0]}$, $${nomV[1]}$, $${nomV[2]}$ et $${nomV[3]}$ quatre nombres (avec $${nomV[1]} + ${nomV[2]}$ non nul) vérifiant l'égalité :`

        this.enonce = `${intro} $${nomV[0]} = (${nomV[1]} + ${nomV[2]})${nomV[3]}$.<br>
         Une expression de $${nomV[3]}$ en fonction de $${nomV[0]}$, $${nomV[1]}$ et $${nomV[2]}$ est :`

        this.correction = `On isole $${nomV[3]}$ dans un membre de l'égalité :<br>
        $\\begin{aligned}
        ${nomV[0]} &= (${nomV[1]} + ${nomV[2]})${nomV[3]}\\\\
        \\dfrac{${nomV[0]}}{${nomV[1]} + ${nomV[2]}} &= ${nomV[3]}
        \\end{aligned}$<br>
        Une expression de $${nomV[3]}$ en fonction de $${nomV[0]}$, $${nomV[1]}$ et $${nomV[2]}$ est $${miseEnEvidence(nomV[3] + ' = \\dfrac{' + nomV[0] + '}{' + nomV[1] + ' + ' + nomV[2] + '}')}$.`

        this.reponses = [
          `$${nomV[3]} = \\dfrac{${nomV[0]}}{${nomV[1]} + ${nomV[2]}}$`,
          `$${nomV[3]} = \\dfrac{${nomV[0]}}{${nomV[1]} - ${nomV[2]}}$`,
          `$${nomV[3]} = ${nomV[0]}(${nomV[1]} + ${nomV[2]})$`,
          `$${nomV[3]} = \\dfrac{${nomV[1]} + ${nomV[2]}}{${nomV[0]}}$`,
        ]
        break
      }

      case 11: {
        // a=(b-c)*d on cherche b
        const intro = `Soient $${nomV[0]}$, $${nomV[1]}$, $${nomV[2]}$ et $${nomV[3]}$ quatre nombres (avec $${nomV[3]}$ non nul) vérifiant l'égalité :`

        this.enonce = `${intro} $${nomV[0]} = (${nomV[1]} - ${nomV[2]})${nomV[3]}$.<br>
        Une expression de $${nomV[1]}$ en fonction de $${nomV[0]}$, $${nomV[3]}$ et $${nomV[2]}$ est :`

        this.correction = `On isole $${nomV[1]}$ dans un membre de l'égalité :<br>
        $\\begin{aligned}
        ${nomV[0]} &= (${nomV[1]} - ${nomV[2]})${nomV[3]}\\\\
        ${nomV[0]} &= ${nomV[1]}${nomV[3]} - ${nomV[2]}${nomV[3]}\\\\
        ${nomV[0]} + ${nomV[2]}${nomV[3]} &= ${nomV[1]}${nomV[3]}\\\\
        \\dfrac{${nomV[0]} + ${nomV[2]}${nomV[3]}}{${nomV[3]}} &= ${nomV[1]}
        \\end{aligned}$<br>
        Une expression de $${nomV[1]}$ en fonction de $${nomV[0]}$, $${nomV[3]}$ et $${nomV[2]}$ est $${miseEnEvidence(nomV[1] + ' = \\dfrac{' + nomV[0] + '}{' + nomV[3] + '} + ' + nomV[2])}$.`

        this.reponses = [
          `$${nomV[1]} = \\dfrac{${nomV[0]}}{${nomV[3]}} + ${nomV[2]}$`,
          `$${nomV[1]} = \\dfrac{${nomV[0]}}{${nomV[3]}} - ${nomV[2]}$`,
          `$${nomV[1]} = ${nomV[0]} + ${nomV[2]}${nomV[3]}$`,
          `$${nomV[1]} = \\dfrac{${nomV[0]} - ${nomV[2]}${nomV[3]}}{${nomV[3]}}$`,
        ]
        break
      }

      case 12:
      default: {
        // a=(b-c)*d on cherche c
        const intro = `Soient $${nomV[0]}$, $${nomV[1]}$, $${nomV[2]}$ et $${nomV[3]}$ quatre nombres (avec $${nomV[3]}$ non nul) vérifiant l'égalité :`

        this.enonce = `${intro} $${nomV[0]} = (${nomV[1]} - ${nomV[2]})${nomV[3]}$.<br>
        Une expression de $${nomV[2]}$ en fonction de $${nomV[0]}$, $${nomV[1]}$ et $${nomV[3]}$ est :`

        this.correction = `On isole $${nomV[2]}$ dans un membre de l'égalité :<br>
        $\\begin{aligned}
        ${nomV[0]} &= (${nomV[1]} - ${nomV[2]})${nomV[3]}\\\\
        ${nomV[0]} &= ${nomV[1]}${nomV[3]} - ${nomV[2]}${nomV[3]}\\\\
        ${nomV[0]} - ${nomV[1]}${nomV[3]} &= -${nomV[2]}${nomV[3]}\\\\
        \\dfrac{${nomV[0]} - ${nomV[1]}${nomV[3]}}{-${nomV[3]}} &= ${nomV[2]}\\\\
        \\dfrac{-${nomV[0]} + ${nomV[1]}${nomV[3]}}{${nomV[3]}} &= ${nomV[2]}
        \\end{aligned}$<br>
        Une expression de $${nomV[2]}$ en fonction de $${nomV[0]}$, $${nomV[1]}$ et $${nomV[3]}$ est $${miseEnEvidence(nomV[2] + ' = ' + nomV[1] + ' - \\dfrac{' + nomV[0] + '}{' + nomV[3] + '}')}$.`

        this.reponses = [
          `$${nomV[2]} = ${nomV[1]} - \\dfrac{${nomV[0]}}{${nomV[3]}}$`,
          `$${nomV[2]} = ${nomV[1]} + \\dfrac{${nomV[0]}}{${nomV[3]}}$`,
          `$${nomV[2]} = \\dfrac{${nomV[0]} - ${nomV[1]}${nomV[3]}}{${nomV[3]}}$`,
          `$${nomV[2]} = ${nomV[0]} - ${nomV[1]}${nomV[3]}$`,
        ]
        break
      }
    }
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
