import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  choice,
  combinaisonListes,
  shuffle,
} from '../../lib/outils/arrayOutils'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'

import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
export const interactifReady = true

export const titre =
  'Exprimer une variable en fonction des autres à partir de formules mathématiques'
export const dateDePublication = '02/10/2023'
export const dateDeModifImportante = '06/11/2024'
/**
 *
 * @author Gilles Mora
 * 2L12-2
 */
export const uuid = '96bac'

export const refs = {
  'fr-fr': ['2L14-2', 'BP2AutoJ1'],
  'fr-ch': ['11LCFA4D-2', '11LSFA4D-2'],
}
export default class ExprimerEnFonctionDesAutresFormules extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Cas possibles',
      3,
      "1 : Sans rappel de formule\n 2 : Avec rappel d'une formule\n 3 : Mélange ",
    ]

    this.nbQuestions = 1
    this.sup = 1
  }

  nouvelleVersion() {
    let typesDeQuestionsDisponibles: number[] = []
    if (this.sup === 1) {
      typesDeQuestionsDisponibles = shuffle([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
      ])
    } else if (this.sup === 2) {
      typesDeQuestionsDisponibles = shuffle([15, 16, 17, 18, 19, 20, 21, 22])
    } else {
      typesDeQuestionsDisponibles = shuffle([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22,
      ]) //
    } // Tous les cas possibles sauf fractions
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const typesDeQuestions = listeTypeDeQuestions[i]
      let texteCorr = ''
      let texte = ''
      let varAExprimer = ''
      let reponse: string[] = []

      switch (typesDeQuestions) {
        case 1: //  côté carré en fonction de son perimètre
          varAExprimer = 'c'
          texte =
            "Exprimer le côté $c$ d'un carré en fonction de son périmètre $P$.<br>"
          reponse = ['\\dfrac{P}{4}', '0.25\\times P', 'P\\times 0.25']
          texteCorr = `Le périmètre $P$ d'un carré en fonction de son côté $c$ est donné par $P=4\\times c$.<br>
          On isole $c$ dans un membre de l'égalité :<br>
          $\\begin{aligned}
      P&=4\\times c\\\\
      \\dfrac{P}{4}&=c
                 \\end{aligned}$ <br>      
                 Ainsi, $c=${miseEnEvidence('\\dfrac{P}{4}')}$. `

          break
        case 2: // côté triangle équi en fonction de son perimètre
          varAExprimer = 'c'
          texte =
            "Exprimer le côté $c$ d'un triangle équilatéral en fonction de son périmètre $P$.<br>"
          reponse = [
            '\\dfrac{P}{3}',
            '\\dfrac{P}{3}',
            '\\dfrac{1}{3}\\times P',
            'P\\times \\dfrac{1}{3}',
          ]
          texteCorr = `Le périmètre $P$ d'un triangle équilatéral en fonction de son côté $c$ est donné par $P=3\\times c$.<br>
          On isole $c$ dans un membre de l'égalité :<br>
          $\\begin{aligned}
      P&=3\\times c\\\\
     \\dfrac{P}{3}&=c
     \\end{aligned}$ <br>      
    Ainsi, $c=${miseEnEvidence('\\dfrac{P}{3}')}$. `
          break

        case 3: // rayon cercle en fonction de son perimètre
          varAExprimer = 'r'
          texte =
            "Exprimer le rayon $r$ d'un cercle en fonction de son périmètre $P$.<br>"
          reponse = [
            '\\dfrac{P}{2\\pi}',
            '\\dfrac{1}{2\\pi}\\times P',
            '\\dfrac{1}{2\\pi}\\times P',
          ]
          texteCorr = `Le périmètre $P$ d'un cercle en fonction de son rayon $r$ est donné par $P=2\\pi r$.<br>
          On isole $r$ dans un membre de l'égalité :<br>
           $\\begin{aligned}
 P&=2\\times \\pi \\times r\\\\
  \\dfrac{P}{2\\times \\pi}&=r
 \\end{aligned}$ <br>      
   Ainsi, $r=\\dfrac{P}{2\\times \\pi}$ ou encore $r=${miseEnEvidence('\\dfrac{P}{2\\pi}')}$.`
          break

        case 4: // diamètre cercle en fonction de son perimètre
          varAExprimer = 'd'
          texte =
            "Exprimer le diamètre $d$ d'un cercle en fonction de son périmètre $P$.<br>"
          reponse = ['\\dfrac{P}{\\pi}', '\\dfrac{1}{\\pi}\\times P']
          texteCorr = `Le périmètre $P$ d'un cercle en fonction de son diamètre $d$ est donné par $P=\\pi \\times d$.<br>
          On isole $d$ dans un membre de l'égalité :<br>
          $\\begin{aligned}
     P&=\\pi \\times d\\\\
     \\dfrac{P}{\\pi}&=d
       \\end{aligned}$ <br>      
     Ainsi, $d=${miseEnEvidence('\\dfrac{P}{\\pi}')}$.`
          break
        case 5: // perimètre d'un cercle en fonction de son diamètre
          varAExprimer = 'P'
          texte =
            "Exprimer le périmètre $P$ d'un cercle en fonction de son diamètre $d$.<br>"
          reponse = ['\\pi\\times d', '\\pi\\times d']
          texteCorr = `Le périmètre $P$ d'un cercle en fonction de son diamètre $d$ est donné par $P=\\pi \\times d$ ou encore $P=${miseEnEvidence('\\pi d')}$.`
          break

        case 6: // perimètre d'un cercle en fonction de son rayon
          varAExprimer = 'P'
          texte =
            "Exprimer le périmètr $P$ d'un cercle en fonction de son rayon $r$.<br>"
          reponse = ['2\\pi\\times r', '2\\pi\\times r']
          texteCorr = `Le périmètre $P$ d'un cercle en fonction de son rayon $r$ est donné par $P=2\\pi\\times r$ ou plus simplement $P=${miseEnEvidence('2\\pi r')}$.`
          break

        case 7: // perimètre d'un cercle en fonction de son diamètre
          varAExprimer = 'c'
          texte =
            "Exprimer le côté $c$ d'un carré en fonction de son aire $A$.<br>"
          reponse = ['\\sqrt{A}']
          texteCorr = `L'aire $A$ d'un carré en fonction de son côté $c$ est donnée par $A=c^2$.<br>
          On isole $c$ dans un membre de l'égalité :<br>
  $\\begin{aligned}
  A&=c^2\\\\
  \\sqrt{A}&=c
  \\end{aligned}$ <br>      
  Ainsi, $c=${miseEnEvidence('\\sqrt{A}')}$.`
          break

        case 8: // diamètre d'un cercle en fonction de son perimètre
          varAExprimer = 'd'
          texte =
            "Exprimer le diamètre $d$ d'un cercle en fonction de son périmètre $P$.<br>"
          reponse = ['\\dfrac{P}{\\pi}', '\\dfrac{2P}{2\\pi}']
          texteCorr = `Le périmètre d'un cercle en fonction de son rayon $r$ est donné par $P=2\\times \\pi\\times r$.<br>
    Or $r=\\dfrac{d}{2}$, donc le périmètre d'un cercle en fonction de son diamètre $d$ est donné par $P=2\\times \\pi\\times \\dfrac{d}{2}$.<br>
    On isole $d$ dans un membre de l'égalité :<br>
    $\\begin{aligned}
    P&=2\\times \\pi\\times \\dfrac{d}{2}\\\\
    P&= \\pi\\times d\\\\
    \\dfrac{P}{\\pi}&=d
    \\end{aligned}$ <br>      
    Ainsi, $d=${miseEnEvidence('\\dfrac{P}{\\pi}')}$.`
          break

        case 9: // rayon disque en fonction de son aire
          varAExprimer = 'r'
          texte =
            "Exprimer le rayon $r$ d'un disque en fonction de son aire $A$.<br>"
          reponse = [
            '\\sqrt{\\dfrac{A}{\\pi}}',
            '\\dfrac{\\sqrt{A}}{\\sqrt{\\pi}}',
          ]
          texteCorr = `L'aire $A$ d'un disque en fonction de son rayon $r$ est donnée par $A=\\pi\\times r^2$.<br>
          On isole $r$ dans un membre de l'égalité :<br>
          $\\begin{aligned}
    A&=\\pi\\times r^2\\\\
    \\dfrac{A}{\\pi}&=r^2\\\\
    \\sqrt{ \\dfrac{A}{\\pi}}&=r
    \\end{aligned}$ <br>  
    Ainsi, $r=\\sqrt{\\dfrac{A}{\\pi}}$ ou encore $r=${miseEnEvidence('\\dfrac{\\sqrt{A}}{\\sqrt{\\pi}}')}$.`
          break

        case 10: // diamètre disque en fonction de son aire
          varAExprimer = 'd'
          texte =
            "Exprimer le diamètre $d$ d'un disque en fonction de son aire $A$.<br>"
          reponse = [
            '\\sqrt{\\dfrac{4\\times A}{\\pi}}',
            '\\dfrac{2\\sqrt{A}}{\\sqrt{\\pi}}',
            '2\\times\\sqrt{\\dfrac{A}{\\pi}}',
            '2\\times\\dfrac{\\sqrt{A}}{\\sqrt{\\pi}}',
          ]
          texteCorr = `L'aire $A$ d'un disque en fonction de son rayon $r$ est donnée par $A=\\pi\\times r^2$.<br>
      Comme $r=\\dfrac{d}{2}$, alors $A=\\pi\\times \\left(\\dfrac{d}{2}\\right)^2$.<br>
      On isole $d$ dans un membre de l'égalité :<br>
      $\\begin{aligned}
      A&=\\pi\\times \\left(\\dfrac{d}{2}\\right)^2\\\\
      A&=\\pi \\times \\dfrac{d^2}{4}\\\\
     4\\times A &=\\pi \\times d^2\\\\
    \\dfrac{4\\times A}{\\pi} &= d^2\\\\
    \\sqrt{\\dfrac{4\\times A}{\\pi}} &= d
      \\end{aligned}$ <br>  
      Ainsi, $d=\\sqrt{\\dfrac{4\\times A}{\\pi}}$ ou encore $d=${miseEnEvidence('2\\dfrac{\\sqrt{A}}{\\sqrt{\\pi}}')}$.`
          break

        case 11: // longueur/largeur rectangle en fonction de son périmètre
          {
            const choix1 = choice([
              ['longueur', 'L', 'largeur', 'l'],
              ['largeur', 'l', 'longueur', 'L'],
            ])
            varAExprimer = choix1[1]
            texte = `Exprimer la ${choix1[0]} $${choix1[1]}$ d'un rectangle en fonction de son périmètre $P$ et de sa ${choix1[2]} $${choix1[3]}$.<br>`
            reponse = [
              `\\dfrac{P-2${choix1[3]}}{2}`,
              `\\dfrac{P}{2}-${choix1[3]}`,
            ]
            texteCorr = `Le périmètre $P$ d'un rectangle en fonction de sa longueur et de largeur est donné par $P=2L+2l$.<br>
          On isole $${choix1[1]}$ dans un membre de l'égalité :<br>
          $\\begin{aligned}
    P&=2L+2l\\\\
   P-2${choix1[3]}&=2${choix1[1]}\\\\
    \\dfrac{P-2${choix1[3]}}{2}&=${choix1[1]}
    \\end{aligned}$ <br>  
    Ainsi, $${choix1[1]}=${miseEnEvidence(`\\dfrac{P-2${choix1[3]}}{2}`)}$ ou, par exemple $${choix1[1]}=\\dfrac{P}{2}-${choix1[3]}$.`
          }
          break

        case 12: // longueur/largeur rectangle en fonction de son Aire
          {
            const choix1 = choice([
              ['longueur', 'L', 'largeur', 'l'],
              ['largeur', 'l', 'longueur', 'L'],
            ])
            varAExprimer = choix1[1]
            texte = `Exprimer la ${choix1[0]} $${choix1[1]}$ d'un rectangle en fonction de son aire $A$ et de sa ${choix1[2]} $${choix1[3]}$.<br>`
            reponse = [`\\dfrac{A}{${choix1[3]}}`]
            texteCorr = `L'aire $A$ d'un rectangle en fonction de sa longueur et de largeur est donnée par $A=L\\times l$.<br>
          On isole $${choix1[1]}$ dans un membre de l'égalité :<br>
          $\\begin{aligned}
A&=L\\times l\\\\
\\dfrac{A}{${choix1[3]}}&=${choix1[1]}\\\\
\\end{aligned}$ <br>  
Ainsi, $${choix1[1]}=${miseEnEvidence(`\\dfrac{A}{${choix1[3]}}`)}$.`
          }
          break

        case 13: // Diamètre en fonction du rayon
          varAExprimer = 'd'
          texte =
            "Exprimer le diamètre $d$ d'un cercle en fonction de son rayon $r$.<br>"
          reponse = ['2\\times r']
          texteCorr = `Le diamètre d'un cercle est le double de son rayon. <br>
  Ainsi, $d=2\\times r$ ou encore $d=${miseEnEvidence('2r')}$.`
          break

        case 14: // rayon en fonction du diamètre
          varAExprimer = 'r'
          texte =
            "Exprimer le rayon $r$ d'un cercle en fonction de son diamètre $d$.<br>"
          reponse = ['\\dfrac{d}{2}', '\\dfrac{1}{2}\\times d', '0.5\\times d']
          texteCorr = `Le diamètre d'un cercle est le double de son rayon, donc le rayon est la moitié du diamètre : <br>
   Ainsi, $r=${miseEnEvidence('\\dfrac{d}{2}')}$.`

          break
        // avec les formules* *************************************************************************************** */
        case 15: // aire triangle  : hauteur ou base en fonction des autres
          {
            const choix1 = choice([
              ['hauteur', 'h', 'base', 'B'],
              ['Base', 'B', 'hauteur', 'h'],
            ])
            varAExprimer = choix1[1]
            texte = `L'aire $A$ d'un triangle est donnée par : $A=\\dfrac{B\\times h}{2}$, avec $B$ la longueur d'un côté et $h$ la hauteur relative à ce côté.<br>
 Exprimer $${choix1[1]}$ en fonction de $A$ et de $${choix1[3]}$.<br>`
            reponse = [
              `\\dfrac{2\\times A}{${choix1[3]}}`,
              `2\\times\\dfrac{A}{${choix1[3]}}`,
              `\\dfrac{2}{${choix1[3]}}\\times A`,
            ]
            texteCorr = `On isole $${choix1[1]}$ dans un membre de l'égalité :<br>
       $\\begin{aligned}
      A&=\\dfrac{B\\times h}{2}\\\\
      A\\times 2&=B\\times h\\\\
      \\dfrac{A\\times 2}{${choix1[3]}}&= ${choix1[1]}
                     \\end{aligned}$<br> 
     Une expression de $${choix1[1]}$ en fonction de $A$ et de $${choix1[3]}$ est $${choix1[1]}=\\dfrac{A\\times 2}{${choix1[3]}}$ ou plus simplement $${choix1[1]}=${miseEnEvidence(`\\dfrac{2A}{${choix1[3]}}`)}$.`
          }
          break

        case 16: // aire trapèze  : petite base ou grande base en fonction des autres
          {
            const choix1 = choice([
              ['b', 'B'],
              ['B', 'b'],
            ])
            varAExprimer = choix1[0]
            texte = `L'aire $A$ d'un trapèze est donnée par : $A=\\dfrac{(b+B)\\times h}{2}$, avec $B$ la longueur de la grande base, $b$ la longueur de la petite base et $h$ la hauteur du trapèze.<br>
Exprimer $${choix1[0]}$ en fonction de $A$, de $${choix1[1]}$ et de $h$.<br>`
            reponse = [
              `2\\times\\dfrac{A}{h}-${choix1[1]}`,
              `\\dfrac{2\\times A}{h}-${choix1[1]}`,
              `\\dfrac{2\\times A-${choix1[1]}\\times h}{h}`,
            ]
            texteCorr = `On isole $${choix1[0]}$ dans un membre de l'égalité :<br>
    $\\begin{aligned}
   A&=\\dfrac{(b+B)\\times h}{2}\\\\
  2\\times A&=(b+B)\\times h\\\\
  \\dfrac{2A}{h}&=b+B\\\\
  \\dfrac{2A}{h}-${choix1[1]} &=${choix1[0]}\\end{aligned}$ <br> 
    
 Une expression de $${choix1[0]}$ en fonction de $A$, de $${choix1[1]}$ et de $h$ est $${choix1[0]}=${miseEnEvidence(`\\dfrac{2A}{h}-${choix1[1]}`)}$.`
          }
          break

        case 17: // aire trapèze  : hauteur en fonction des autres
          varAExprimer = 'h'
          texte = `L'aire $A$ d'un trapèze est donnée par : $A=\\dfrac{(b+B)\\times h}{2}$, avec $B$ la longueur de la grande base, $b$ la longueur de la petite base et $h$ la hauteur du trapèze.<br>
Exprimer $h$ en fonction de $A$, de $B$ et de $b$.<br>`
          reponse = ['\\dfrac{2\\times A}{B+b}', '2\\times \\dfrac{A}{B+b}']
          texteCorr = `On isole $h$ dans un membre de l'égalité :<br>
 $\\begin{aligned}
  A&=\\dfrac{(b+B)\\times h}{2}\\\\
  2\\times A&=(b+B)\\times h\\\\
  \\dfrac{2A}{b+B}&=h
  \\end{aligned}$<br> 
                 
  Une expression de $h$ en fonction de $A$, de $B$ et de $b$ est $h= ${miseEnEvidence('\\dfrac{2A}{b+B}')}$.`
          break

        case 18: // moyenne arithmétique
          {
            const choix1 = choice([
              ['a', 'b'],
              ['b', 'a'],
            ])
            varAExprimer = choix1[0]
            texte = `La moyenne arithmétique de deux nombres $a$ et $b$ est le nombre $m$ défini par : 
      $m=\\dfrac{a+b}{2}$.<br>
     Exprimer $${choix1[0]}$ en fonction de $m$ et de $${choix1[1]}$.<br>`
            reponse = [`2\\times m - ${choix1[1]}`, `-${choix1[1]}+2\\times m`]
            texteCorr = `On isole $${choix1[0]}$ dans un membre de l'égalité :<br>
         $\\begin{aligned}
        m&=\\dfrac{a+b}{2}\\\\
       2\\times m&=a+b\\\\
       2\\times m-${choix1[1]}&=${choix1[0]}\\end{aligned}$<br> 
         
      Une expression de $${choix1[0]}$ en fonction de $m$ et de $${choix1[1]}$ est $${choix1[0]}=${miseEnEvidence(`2m-${choix1[1]}`)}$.`
          }
          break

        case 19: // moyenne géométrique
          {
            const choix1 = choice([
              ['a', 'b'],
              ['b', 'a'],
            ])
            varAExprimer = choix1[0]
            texte = `La moyenne géométrique de deux nombres non nuls $a$ et $b$ (de même signe) est le nombre $m$ défini par : 
      $m=\\sqrt{a\\times b}$.<br>
     Exprimer $${choix1[0]}$ en fonction de $m$ et de $${choix1[1]}$.<br>`
            reponse = [
              `\\dfrac{m^2}{${choix1[1]}}`,
              `\\dfrac{1}{${choix1[1]}}\\times m^2`,
            ]
            texteCorr = `On isole $${choix1[0]}$ dans un membre de l'égalité :<br>
         $\\begin{aligned}
        m&=\\sqrt{a\\times b}\\\\
        m^2&=a\\times b\\\\
       \\dfrac{m^2}{${choix1[1]}}&=${choix1[0]}\\end{aligned}$<br> 
         
      Une expression de $${choix1[0]}$ en fonction de $m$ et de $${choix1[1]}$ est $${miseEnEvidence(`\\dfrac{m^2}{${choix1[1]}}`)}$.`
          }
          break

        case 20: // moyenne harmonique
          {
            const choix1 = choice([
              ['a', 'b'],
              ['b', 'a'],
            ])
            varAExprimer = choix1[0]
            texte = `La moyenne harmonique de deux nombres non nuls $a$ et $b$ est le nombre $h$ défini par : 
      $\\dfrac{1}{h}=\\dfrac{1}{2}\\left(\\dfrac{1}{a}+\\dfrac{1}{b}\\right)$.<br>
     Exprimer $${choix1[0]}$ en fonction de $h$ et de $${choix1[1]}$.<br>`
            reponse = [
              `\\dfrac{1}{\\dfrac{2}{h}-\\dfrac{1}{${choix1[1]}}}`,
              `\\dfrac{${choix1[1]}\\times h}{2\\times ${choix1[1]}-h}`,
              `\\dfrac{1}{\\dfrac{2\\times ${choix1[1]}-h}{${choix1[1]}\\times h}}`,
            ]
            texteCorr = `On isole $${choix1[0]}$ dans un membre de l'égalité :<br>
         $\\begin{aligned}
         \\dfrac{1}{h}&=\\dfrac{1}{2}\\left(\\dfrac{1}{a}+\\dfrac{1}{b}\\right)\\\\
         \\dfrac{2}{h}&=\\dfrac{1}{a}+\\dfrac{1}{b}\\\\
         \\dfrac{2}{h}-\\dfrac{1}{${choix1[1]}}&=\\dfrac{1}{${choix1[0]}}\\\\
       \\dfrac{1}{\\dfrac{2}{h}-\\dfrac{1}{${choix1[1]}}}&=${choix1[0]}\\\\
       \\dfrac{1}{\\dfrac{2${choix1[1]}}{${choix1[1]}h}-\\dfrac{h}{${choix1[1]}h}}&=${choix1[0]}\\\\
       \\dfrac{1}{\\dfrac{2${choix1[1]}-h}{${choix1[1]}h}}&=${choix1[0]}\\\\
       \\dfrac{${choix1[1]}h}{2${choix1[1]}-h}&=${choix1[0]}
       \\end{aligned}$<br> 
         
      Une expression de $${choix1[0]}$ en fonction de $h$ et de $${choix1[1]}$ est $${choix1[0]}=${miseEnEvidence(`\\dfrac{${choix1[1]}h}{2${choix1[1]}-h}`)}$.`
          }
          break

        case 21: // taux d'évolution F
          varAExprimer = 'F'
          texte = `Le taux d'évolution entre deux valeurs $I$ et $F$ est le nombre $T$ défini par : 
      $T=\\dfrac{F-I}{I}$.<br>
     Exprimer $F$ en fonction de $I$ et de $T$.<br>`
          reponse = ['T\\times I+I', 'I\\times(T+1)']

          texteCorr = `On isole $F$ dans un membre de l'égalité :<br>
         $\\begin{aligned}
         T&=\\dfrac{F-I}{I}\\\\
         T\\times I&=F-I\\\\
         T\\times I+I&=F
       \\end{aligned}$ <br> 
         
      Une expression de $F$ en fonction de $T$ et de $I$ est $F=T\\times I +I$ ou encore $F=${miseEnEvidence('I\\times(T+1)')}$.`
          break

        case 22: // taux d'évolution I
        default:
          varAExprimer = 'I'
          texte = `Le taux d'évolution entre deux valeurs $I$ et $F$ est le nombre $T$ défini par : 
      $T=\\dfrac{F-I}{I}$.<br>
     Exprimer $I$ en fonction de $F$ et de $T$.<br>`
          reponse = ['\\dfrac{F}{T+1}']

          texteCorr = `On isole $I$ dans un membre de l'égalité :<br>
         $\\begin{aligned}
         T&=\\dfrac{F-I}{I}\\\\
         T\\times I+I&=F\\\\
         I(T+1)&=F\\\\
         I&=\\dfrac{F}{T+1}
       \\end{aligned}$<br> 
         
      Une expression de $I$ en fonction de $T$ et de $F$ est $I=${miseEnEvidence('\\dfrac{F}{T+1}')}$.`
          break
      }

      if (this.interactif) {
        texte +=
          '<br>' +
          ajouteChampTexteMathLive(this, i, KeyboardType.alphanumeric, {
            texteAvant: sp(10) + `$${varAExprimer} =$`,
          })
      }
      handleAnswers(this, i, { reponse: { value: reponse } })
      if (this.questionJamaisPosee(i, typesDeQuestions, varAExprimer)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
