import { texteCentre } from '../../../lib/format/miseEnPage'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import ExerciceSimple from '../../ExerciceSimple'
export const titre =
  'Exprimer une variable en fonction des autres (formules avec carrés/racines carrées)'
export const interactifReady = true

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '13/01/2026' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
export const dateDeModifImportante = '14/02/2026'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export const uuid = '14e86'

export const refs = {
  'fr-fr': ['can2L12-03', '2L14-flash5'],
  'fr-ch': ['NR'],
}
export default class ExprimerEnFonctionRac extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.versionQcmDisponible = true
    this.formatChampTexte = KeyboardType.alphanumeric
    this.optionsChampTexte = { texteAvant: '<br> ' }
    this.optionsDeComparaison = { calculFormel: true }
  }

  nouvelleVersion() {
    // En QCM, toute l'égalité est mise en évidence ; sinon seule l'expression saisie
    // (« X = » est écrit devant le champ)
    const egalite = (lettre: string, expression: string) =>
      this.versionQcm
        ? miseEnEvidence(`${lettre} = ${expression}`)
        : `${lettre} = ${miseEnEvidence(expression)}`
    const choixQ = this.quotaChoice('choixQ', [true, false])

    if (context.isAmc) this.versionQcm = false
    switch (
      this.quotaChoice('type', [1, 2, 3, 4, 5, 6]) //
    ) {
      case 1:
        this.question = `Lorsqu'un point mobile suit une trajectoire circulaire de rayon $R$, 
  en mètre ($\\text{m}$), son accélération centripète $a$ (en $\\text{m/s}^2$) 
  et sa vitesse $v$ (en $\\text{m/s}$) sont liées par la relation : <br>
  `
        this.question += choixQ
          ? context.isHtml
            ? '$a=\\dfrac{v^2}{R}$<br>'
            : `${texteCentre('$a=\\dfrac{v^2}{R}$')}`
          : context.isHtml
            ? '$v=\\sqrt{aR}$<br>'
            : `${texteCentre('$v=\\sqrt{aR}$')}`
        if (this.versionQcm) {
          this.question += choixQ
            ? `L'expression permettant, à partir de cette formule, d'exprimer la vitesse $v$ est : `
            : `L'expression permettant, à partir de cette formule, d'exprimer l'accélération $a$ est : `
          this.reponse = choixQ ? '$v=\\sqrt{aR}$' : '$a=\\dfrac{v^2}{R}$'
        } else {
          this.question += choixQ
            ? `Donner l'expression permettant, à partir de cette formule, d'exprimer la vitesse $v$.`
            : `Donner l'expression permettant, à partir de cette formule, d'exprimer l'accélération $a$.`
          this.reponse = choixQ ? '\\sqrt{aR}' : '\\dfrac{v^2}{R}'
        }
        if (this.versionQcm) {
          this.distracteurs = choixQ
            ? ['$v=aR^2$', '$v=\\sqrt{\\dfrac{a}{R}}$', '$v=\\dfrac{a^2}{R}$']
            : ['$a=v^2R$', '$a=\\dfrac{v}{\\sqrt{R}}$', '$a=\\dfrac{R}{v^2}$']
        }
        /* Ancienne version
        choixQ
          ? (this.optionsChampTexte = {
              texteAvant: '<br> $v=$',
              texteApres: ' ',
            })
          : (this.optionsChampTexte = {
              texteAvant: '<br> $a=$',
              texteApres: ' ',
            }) 
        */
        // Nouvelle version
        this.optionsChampTexte = choixQ
          ? {
              texteAvant: '<br> $v=$',
              texteApres: ' ',
            }
          : {
              texteAvant: '<br> $a=$',
              texteApres: ' ',
            }
        // Fin nouvelle version

        this.correction = choixQ
          ? `Puisque $a=\\dfrac{v^2}{R}$, alors $v^2 = a \\times R$. <br>Comme $a \\times R\\geqslant 0$, $${egalite('v', '\\sqrt{aR}')}$.`
          : `On part de la formule $v = \\sqrt{aR}$.<br>
En élevant les deux membres au carré, on obtient : $v^2 = aR$.<br>
Puis en isolant $a$, on obtient : $${egalite('a', '\\dfrac{v^2}{R}')}$.`
        break
      case 2:
        this.question =
          'On considère $x$, $y$ et $v$ des nombres réels positifs non nuls liés par la relation : <br>'
        this.question += choixQ
          ? context.isHtml
            ? '$v=\\sqrt{\\dfrac{x}{y}}$<br>'
            : `${texteCentre('$v=\\sqrt{\\dfrac{x}{y}}$')}`
          : context.isHtml
            ? '$y=(1+vx)^2$<br>'
            : `${texteCentre('$y=(1+vx)^2$')}`
        if (this.versionQcm) {
          this.question += choixQ
            ? `L'expression permettant, à partir de cette formule, d'exprimer $y$ est : `
            : `L'expression permettant, à partir de cette formule, d'exprimer $v$ est : `
          this.reponse = choixQ
            ? '$y=\\dfrac{x}{v^2}$'
            : '$v=\\dfrac{\\sqrt{y}-1}{x}$'
        } else {
          this.question += choixQ
            ? `Donner l'expression permettant, à partir de cette formule, d'exprimer $y$.`
            : `Donner l'expression permettant, à partir de cette formule, d'exprimer $v$.`
          this.reponse = choixQ ? '\\dfrac{x}{v^2}' : '\\dfrac{\\sqrt{y}-1}{x}'
        }
        if (this.versionQcm) {
          this.distracteurs = choixQ
            ? ['$y=\\sqrt{xv}$', '$y=x \\times v^2$', '$y=\\dfrac{v^2}{x}$']
            : [
                '$v=\\dfrac{y-1}{x}$',
                '$v=\\sqrt{y} \\times x - 1$',
                '$v=\\dfrac{1}{x \\times \\sqrt{y}}$',
              ]
        }
        this.optionsChampTexte = choixQ
          ? {
              texteAvant: '<br> $y=$',
              texteApres: ' ',
            }
          : {
              texteAvant: '<br> $v=$',
              texteApres: ' ',
            }
        if (choixQ) {
          this.correction = `On part de la relation : $v = \\sqrt{\\dfrac{x}{y}}$.<br>
En élevant les deux membres au carré, on obtient : $v^2 = \\dfrac{x}{y}$.<br>
Puis en isolant $y$, on obtient : $${egalite('y', '\\dfrac{x}{v^2}')}$.`
        } else {
          this.correction = `On part de la formule : $y = (1 + vx)^2$.<br>
Comme les deux membres sont positifs, on peut prendre la racine carrée : $\\sqrt{y} = 1 + vx$.<br>
En isolant  $v$, on obtient : $vx = \\sqrt{y} - 1$.<br>
Donc : $${egalite('v', '\\dfrac{\\sqrt{y} - 1}{x}')}$.`
        }
        break

      case 3:
        this.question = `On considère la relation $C = (1 + t)^2$. On cherche à isoler la variable $t$. On a :`
        if (this.versionQcm) {
          this.question = `On considère la relation $C = (1 + t)^2$.<br>L'expression permettant, à partir de cette formule, d'exprimer $t$ est : `
          this.reponse = '$t=\\sqrt{C}-1$'
        } else {
          this.question = `On considère la relation $C = (1 + t)^2$.<br>Donner l'expression permettant, à partir de cette formule, d'exprimer $t$.`
          this.reponse = '\\sqrt{C}-1'
        }
        if (this.versionQcm) {
          this.distracteurs = [
            '$t=\\sqrt{C-1}$',
            '$t=1-\\sqrt{C}$',
            '$t=\\sqrt{C+1}$',
          ]
        }
        this.optionsChampTexte = {
          texteAvant: '<br> $t=$',
          texteApres: ' ',
        }
        this.correction = `On part de la formule : $C = (1 + t)^2$.<br>
Comme les deux membres sont positifs, on peut prendre la racine carrée : $\\sqrt{C} = 1 + t$.<br>
En isolant $t$, on obtient : $${egalite('t', '\\sqrt{C} - 1')}$.`
        break

      case 4:
        this.question = `Le volume $V$ d'un cylindre de hauteur $h$ et de rayon $r$ est égal à :<br>`
        this.question += context.isHtml
          ? '$V=\\pi r^2h$<br>'
          : texteCentre('$V=\\pi r^2h$')
        if (this.versionQcm) {
          this.question += choixQ
            ? `L'expression permettant, à partir de cette formule, d'exprimer la hauteur $h$ est : `
            : `L'expression permettant, à partir de cette formule, d'exprimer le rayon $r$ est : `
          this.reponse = choixQ
            ? '$h=\\dfrac{V}{\\pi r^2}$'
            : '$r=\\sqrt{\\dfrac{V}{\\pi h}}$'
        } else {
          this.question += choixQ
            ? `Donner l'expression permettant, à partir de cette formule, d'exprimer la hauteur $h$.`
            : `Donner l'expression permettant, à partir de cette formule, d'exprimer le rayon $r$.`
          this.reponse = choixQ
            ? [
                '\\dfrac{V}{\\pi\\times r^2}',
                '\\dfrac{V}{\\pi r^2}',
                '\\dfrac{V}{r^2\\pi}',
                '\\dfrac{V}{r^2\\times \\pi}',
              ]
            : [
                '\\sqrt{\\dfrac{V}{\\pi\\times h}}',
                '\\sqrt{\\dfrac{V}{\\pi h}}',
                '\\sqrt{\\dfrac{V}{h\\pi}}',
                '\\sqrt{\\dfrac{V}{h\\times \\pi}}',
              ]
        }
        if (this.versionQcm) {
          this.distracteurs = choixQ
            ? [
                '$h=\\sqrt{\\dfrac{V}{\\pi r^2}}$',
                '$h=\\dfrac{V}{\\pi r}$',
                '$h=\\dfrac{r^2}{\\pi V}$',
              ]
            : [
                '$r=\\dfrac{V}{\\pi h}$',
                '$r=\\dfrac{\\sqrt{V}}{\\pi r}$',
                '$r=\\dfrac{r^2}{\\pi V}$',
              ]
        }
        this.optionsChampTexte = choixQ
          ? {
              texteAvant: '<br> $h=$',
              texteApres: ' ',
            }
          : {
              texteAvant: '<br> $r=$',
              texteApres: ' ',
            }

        if (choixQ) {
          this.correction = `On part de la formule : $V = \\pi r^2 h$.<br>
En isolant $h$, on obtient : $${egalite('h', '\\dfrac{V}{\\pi r^2}')}$.`
        } else {
          this.correction = `On part de la formule : $V = \\pi r^2 h$.<br>
En isolant $r^2$, on obtient : $r^2 = \\dfrac{V}{\\pi h}$.<br>
Comme $r \\geqslant 0$, en prenant la racine carrée, on obtient : $${egalite('r', '\\sqrt{\\dfrac{V}{\\pi h}}')}$.`
        }
        break

      case 5:
        this.question = `Le volume $V$ d'un cône de hauteur $h$ et de rayon $r$ est $V=\\dfrac{1}{3}\\pi r^2h$. <br>
On cherche à isoler $h$. On a :`
        if (this.versionQcm) {
          this.question = `Le volume $V$ d'un cône de hauteur $h$ et de rayon $r$ est :`
          this.question += context.isHtml
            ? '$V=\\dfrac{1}{3}\\pi r^2h$<br>'
            : texteCentre('$V=\\dfrac{1}{3}\\pi r^2h$')
          this.question += choixQ
            ? `L'expression permettant, à partir de cette formule, d'exprimer la hauteur $h$ est : `
            : `L'expression permettant, à partir de cette formule, d'exprimer le rayon $r$ est : `
          this.reponse = choixQ
            ? '$h=\\dfrac{3V}{\\pi r^2}$'
            : '$r=\\sqrt{\\dfrac{3V}{\\pi h}}$'
        } else {
          this.question = `Le volume $V$ d'un cône de hauteur $h$ et de rayon $r$ est :`
          this.question += context.isHtml
            ? '$V=\\dfrac{1}{3}\\pi r^2h$<br>'
            : texteCentre('$V=\\dfrac{1}{3}\\pi r^2h$')
          this.question += choixQ
            ? `Donner l'expression permettant, à partir de cette formule, d'exprimer la hauteur $h$.`
            : `Donner l'expression permettant, à partir de cette formule, d'exprimer le rayon $r$.`
          this.reponse = choixQ
            ? [
                '\\dfrac{3V}{\\pi r^2}',
                '\\dfrac{3V}{\\pi\\times r^2}',
                '\\dfrac{3V}{r^2\\times \\pi}',
                '\\dfrac{3V}{r^2\\pi}',
              ]
            : [
                '\\sqrt{\\dfrac{3V}{\\pi h}}',
                '\\sqrt{\\dfrac{3V}{\\pi\\times h}}',
                '\\sqrt{\\dfrac{3V}{h\\pi}}',
                '\\sqrt{\\dfrac{3V}{h\\times\\pi}}',
              ]
        }
        if (this.versionQcm) {
          this.distracteurs = choixQ
            ? [
                '$h=\\dfrac{V}{3\\pi r^2}$',
                '$h=\\dfrac{\\pi r^2}{3V}$',
                '$h=\\sqrt{\\dfrac{3V}{\\pi r}}$',
              ]
            : [
                '$r=\\dfrac{3V}{\\pi h}$',
                '$r=\\dfrac{\\sqrt{V}}{\\pi r}$',
                '$r=\\dfrac{\\sqrt{3V}}{\\pi h}$',
              ]
        }
        this.optionsChampTexte = choixQ
          ? {
              texteAvant: '<br> $h=$',
              texteApres: ' ',
            }
          : {
              texteAvant: '<br> $r=$',
              texteApres: ' ',
            }

        if (choixQ) {
          this.correction = `On part de la formule : $V = \\dfrac{1}{3}\\pi r^2 h$.<br>
En multipliant les deux membres par $3$, on obtient : $3V = \\pi r^2 h$.<br>
En isolant $h$, on obtient : $${egalite('h', '\\dfrac{3V}{\\pi r^2}')}$.`
        } else {
          this.correction = `On part de la formule : $V = \\dfrac{1}{3}\\pi r^2 h$.<br>
En multipliant les deux membres par $3$, on obtient : $3V = \\pi r^2 h$.<br>
En isolant $r^2$, on obtient : $r^2 = \\dfrac{3V}{\\pi h}$.<br>
Comme $r \\geqslant 0$, en prenant la racine carrée, on obtient : $${egalite('r', '\\sqrt{\\dfrac{3V}{\\pi h}}')}$.`
        }
        break
      case 6:
      default:
        this.question = `L'énergie cinétique $E$ (en joules) d'un objet de masse $m$ (en kg) et de vitesse $v$ (en m/s) est donnée par :<br>`
        this.question += context.isHtml
          ? '$E=\\dfrac{1}{2}mv^2$<br>'
          : texteCentre('$E=\\dfrac{1}{2}mv^2$')
        if (this.versionQcm) {
          this.question += choixQ
            ? `L'expression permettant, à partir de cette formule, d'exprimer la masse $m$ est : `
            : `L'expression permettant, à partir de cette formule, d'exprimer la vitesse $v$ est : `
          this.reponse = choixQ
            ? '$m=\\dfrac{2E}{v^2}$'
            : '$v=\\sqrt{\\dfrac{2E}{m}}$'
        } else {
          this.question += choixQ
            ? `Donner l'expression permettant, à partir de cette formule, d'exprimer la masse $m$.`
            : `Donner l'expression permettant, à partir de cette formule, d'exprimer la vitesse $v$.`
          this.reponse = choixQ
            ? ['\\dfrac{2E}{v^2}', '\\dfrac{2E}{v^{2}}']
            : ['\\sqrt{\\dfrac{2E}{m}}', '\\sqrt{\\dfrac{2\\times E}{m}}']
        }
        if (this.versionQcm) {
          this.distracteurs = choixQ
            ? [
                '$m=\\dfrac{E}{2v^2}$',
                '$m=\\dfrac{v^2}{2E}$',
                '$m=\\sqrt{\\dfrac{2E}{v}}$',
              ]
            : [
                '$v=\\dfrac{2E}{m}$',
                '$v=\\dfrac{\\sqrt{2E}}{m}$',
                '$v=\\sqrt{\\dfrac{E}{2m}}$',
              ]
        }
        this.optionsChampTexte = choixQ
          ? {
              texteAvant: '<br> $m=$',
              texteApres: ' ',
            }
          : {
              texteAvant: '<br> $v=$',
              texteApres: ' ',
            }

        if (choixQ) {
          this.correction = `On part de la formule : $E = \\dfrac{1}{2}mv^2$.<br>
En multipliant les deux membres par $2$, on obtient : $2E = mv^2$.<br>
En isolant $m$, on obtient : $${egalite('m', '\\dfrac{2E}{v^2}')}$.`
        } else {
          this.correction = `On part de la formule : $E = \\dfrac{1}{2}mv^2$.<br>
En multipliant les deux membres par $2$, on obtient : $2E = mv^2$.<br>
En isolant $v^2$, on obtient : $v^2 = \\dfrac{2E}{m}$.<br>
Comme $v \\geqslant 0$, en prenant la racine carrée, on obtient : $${egalite('v', '\\sqrt{\\dfrac{2E}{m}}')}$.`
        }
        break
    }
  }
}
