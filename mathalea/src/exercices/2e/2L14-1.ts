import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  choice,
  combinaisonListes,
  shuffle,
} from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = true

export const titre = 'Exprimer une variable en fonction des autres'
export const dateDePublication = '25/09/2023'
export const dateDeModifImportante = '27/09/2024'
/**
 *
 * @author Gilles Mora
 */
export const uuid = 'ef686'

export const refs = {
  'fr-fr': ['2L14-1'],
  'fr-ch': ['11LCFA4D-1', '11LSFA4D-1'],
}
export default class ExprimerEnFonctionDesAutres extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      4,
      '1 : Niveau 1\n 2 : Niveau 2\n 3 : Niveau 3\n 4 : Mélange des niveaux précédents',
    ]

    this.nbQuestions = 1
    this.sup = 1
  }

  nouvelleVersion() {
    let typesDeQuestionsDisponibles = []
    if (this.sup === 1) {
      typesDeQuestionsDisponibles = [1]
    } else if (this.sup === 2) {
      typesDeQuestionsDisponibles = [2]
    } else if (this.sup === 3) {
      typesDeQuestionsDisponibles = [3]
    } else {
      typesDeQuestionsDisponibles = [1, 2, 3]
    } // Tous les cas possibles sauf fractions

    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (
      let i = 0,
        texte,
        texteCorr,
        reponse,
        cpt = 0,
        typesDeQuestions,
        intro,
        nomVariables,
        nomV,
        choix,
        varAExprimer;
      i < this.nbQuestions && cpt < 50;
    ) {
      typesDeQuestions = listeTypeDeQuestions[i]

      texteCorr = ''
      switch (typesDeQuestions) {
        case 1:
          nomVariables = [
            shuffle(['a', 'b', 'c']),
            shuffle(['x', 'y', 'z']),
            shuffle(['u', 'v', 'w']),
            shuffle(['A', 'B', 'C']),
            shuffle(['R', 'S', 'T']),
            shuffle(['I', 'J', 'K']),
            shuffle(['c', 'd', 'e']),
            shuffle(['K', 'L', 'M']),
            shuffle(['r', 's', 't']),
            shuffle(['U', 'V', 'W']),
          ]
          nomV = choice(nomVariables)
          choix = randint(1, 5) // 5
          if (choix === 1) {
            // a=b-c on cherche b
            texte = `Soient $${nomV[0]}$, $${nomV[1]}$ et $${nomV[2]}$ trois nombres vérifiant l'égalité : 
          $${nomV[0]}=${nomV[1]}-${nomV[2]}$.<br>
          Exprimer $${nomV[1]}$ en fonction de $${nomV[0]}$ et $${nomV[2]}$.`
            varAExprimer = nomV[1]
            reponse = `${nomV[0]}+${nomV[2]}`
            texteCorr = `On isole $${nomV[1]}$ dans un membre de l'égalité :<br>
            $\\begin{aligned}
            ${nomV[0]}&=${nomV[1]}-${nomV[2]}\\\\
            ${nomV[0]}+${miseEnEvidence(nomV[2])}&=${nomV[1]}-${nomV[2]}+${miseEnEvidence(nomV[2])}\\\\
            ${nomV[0]}+${nomV[2]}&= ${nomV[1]}
                           \\end{aligned}$<br> Une expression de $${nomV[1]}$ en fonction de $${nomV[0]}$ et $${nomV[2]}$ est $${nomV[1]}= ${nomV[0]}+${nomV[2]}$.`
          } else if (choix === 2) {
            // a=b+c on cherche b
            texte = `Soient $${nomV[0]}$, $${nomV[1]}$ et $${nomV[2]}$ trois nombres vérifiant l'égalité :
             $${nomV[0]}=${nomV[1]}+${nomV[2]}$.<br>
            Exprimer $${nomV[1]}$ en fonction de $${nomV[0]}$ et $${nomV[2]}$.`
            varAExprimer = nomV[1]
            reponse = [
              `${nomV[1]}=${nomV[0]}-${nomV[2]}`,
              `${nomV[0]}-${nomV[2]}`,
            ]
            texteCorr = `On isole $${nomV[1]}$ dans un membre de l'égalité :<br>
              $\\begin{aligned}
              ${nomV[0]}&=${nomV[1]}+${nomV[2]}\\\\
              ${nomV[0]}-${miseEnEvidence(nomV[2])}&=${nomV[1]}-${nomV[2]}-${miseEnEvidence(nomV[2])}\\\\
              ${nomV[0]}-${nomV[2]}&= ${nomV[1]}
                             \\end{aligned}$<br> Une expression de $${nomV[1]}$ en fonction de $${nomV[0]}$ et $${nomV[2]}$ est $${nomV[1]}= ${nomV[0]}-${nomV[2]}$.`
          } else if (choix === 3) {
            // a=b/c on cherche b
            texte = `Soient $${nomV[0]}$, $${nomV[1]}$ et $${nomV[2]}$ trois nombres non nuls vérifiant l'égalité  : 
  $${nomV[0]}=\\dfrac{${nomV[1]}}{${nomV[2]}}$.<br>
                            Exprimer $${nomV[1]}$ en fonction de $${nomV[0]}$ et $${nomV[2]}$.`
            varAExprimer = nomV[1]
            reponse = [
              `${nomV[1]}=${nomV[0]}\\times ${nomV[2]}`,
              `${nomV[0]}\\times ${nomV[2]}`,
            ]
            texteCorr = `On isole $${nomV[1]}$ dans un membre de l'égalité :<br>
                              $\\begin{aligned}
                              ${nomV[0]}&=\\dfrac{${nomV[1]}}{${nomV[2]}}\\\\
                              ${nomV[0]}\\times ${nomV[2]}&=${nomV[1]}                              
                                             \\end{aligned}$ <br> Une expression de $${nomV[1]}$ en fonction de $${nomV[0]}$ et $${nomV[2]}$ est $${nomV[1]}=${nomV[0]}\\times ${nomV[2]}$.`
          } else if (choix === 4) {
            // a=b/c on cherche c
            texte = `Soient $${nomV[0]}$, $${nomV[1]}$ et $${nomV[2]}$ trois nombres non nuls vérifiant l'égalité  :
  $${nomV[0]}=\\dfrac{${nomV[1]}}{${nomV[2]}}$.<br>
Exprimer $${nomV[2]}$ en fonction de $${nomV[0]}$ et $${nomV[1]}$.`
            varAExprimer = nomV[2]
            reponse = `\\dfrac{${nomV[1]}}{${nomV[0]}}`
            texteCorr = `On isole $${nomV[2]}$ dans un membre de l'égalité :<br>
$\\begin{aligned}   
 ${nomV[0]}&=\\dfrac{${nomV[1]}}{${nomV[2]}}\\\\
 ${nomV[0]}\\times ${nomV[2]}&=${nomV[1]} \\\\
 ${nomV[2]}&=\\dfrac{${nomV[1]}}{${nomV[0]}}                        
 \\end{aligned}$<br> Une expression de $${nomV[2]}$ en fonction de $${nomV[0]}$ et $${nomV[1]}$ est $${nomV[2]}=\\dfrac{${nomV[1]}}{${nomV[0]}}$.`
          } else {
            // a=b*c on cherche b
            texte = `Soient $${nomV[0]}$, $${nomV[1]}$ et $${nomV[2]}$ trois nombres non nuls vérifiant l'égalité  :
  $${nomV[0]}=${nomV[1]}\\times ${nomV[2]}$.<br>
  Exprimer $${nomV[1]}$ en fonction de $${nomV[0]}$ et $${nomV[2]}$.`
            varAExprimer = nomV[1]
            reponse = [
              `${nomV[1]}=\\dfrac{${nomV[0]}}{${nomV[2]}}`,
              `\\dfrac{${nomV[0]}}{${nomV[2]}}`,
            ]
            texteCorr = `On isole $${nomV[1]}$ dans un membre de l'égalité :<br>
    $\\begin{aligned}
    ${nomV[0]}&=${nomV[1]}\\times ${nomV[2]}\\\\
    \\dfrac{${nomV[0]}}{${nomV[2]}}&=${nomV[1]}
                   \\end{aligned}$ <br> Une expression de $${nomV[1]}$ en fonction de $${nomV[0]}$ et $${nomV[2]}$ est $${nomV[1]}= \\dfrac{${nomV[0]}}{${nomV[2]}}$.`
          }
          break

        case 2:
          nomVariables = [
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
          nomV = choice(nomVariables)
          choix = randint(1, 12)
          if (choix === 1) {
            // a=b-cd on cherche  c
            intro = `Soient $${nomV[0]}$, $${nomV[1]}$, $${nomV[2]}$ et $${nomV[3]}$  quatre nombres (avec $${nomV[3]}$ non nul) vérifiant l'égalité  :`
            texte =
              `${intro}` +
              ` $${nomV[0]}=${nomV[1]}-${nomV[2]}${nomV[3]}$.<br>
   Exprimer $${nomV[2]}$ en fonction de $${nomV[0]}$, $${nomV[1]}$ et  $${nomV[3]}$.`
            varAExprimer = nomV[2]
            reponse = [
              `\\dfrac{${nomV[1]}-${nomV[0]}}{${nomV[3]}}`,
              `\\dfrac{${nomV[0]}-${nomV[1]}}{-${nomV[3]}}`,
            ]
            texteCorr = `On isole $${nomV[2]}$ dans un membre de l'égalité :<br>
       $\\begin{aligned}
      ${nomV[0]}&=${nomV[1]}-${nomV[2]}${nomV[3]}\\\\
      ${nomV[0]}-${nomV[1]}&=-${nomV[2]}${nomV[3]}\\\\
       -${nomV[0]}+${nomV[1]}&= ${nomV[2]}${nomV[3]}\\\\
       \\dfrac{-${nomV[0]}+${nomV[1]}}{${nomV[3]}}&=${nomV[2]}
                 \\end{aligned}$<br>Une expression de $${nomV[2]}$ en fonction de $${nomV[0]}$, $${nomV[1]}$ et  $${nomV[3]}$ est $${nomV[2]}=  \\dfrac{${nomV[1]}-${nomV[0]}}{${nomV[3]}}$.`
          } else if (choix === 2) {
            // a=b-cd on cherche  d
            intro = `Soient $${nomV[0]}$, $${nomV[1]}$, $${nomV[2]}$ et $${nomV[3]}$  quatre nombres (avec $${nomV[2]}$ non nul) vérifiant l'égalité  :`
            texte =
              `${intro}` +
              ` $${nomV[0]}=${nomV[1]}-${nomV[2]}${nomV[3]}$.<br>
          Exprimer $${nomV[3]}$ en fonction de $${nomV[0]}$, $${nomV[1]}$ et  $${nomV[2]}$.`
            varAExprimer = nomV[3]
            reponse = [
              `\\dfrac{${nomV[1]}-${nomV[0]}}{${nomV[2]}}`,
              `\\dfrac{${nomV[0]}-${nomV[1]}}{-${nomV[2]}}`,
            ]
            texteCorr = `On isole $${nomV[3]}$ dans un membre de l'égalité :<br>
              $\\begin{aligned}
             ${nomV[0]}&=${nomV[1]}-${nomV[2]}${nomV[3]}\\\\
             ${nomV[0]}-${nomV[1]}&=-${nomV[2]}${nomV[3]}\\\\
              -${nomV[0]}+${nomV[1]}&= ${nomV[2]}${nomV[3]}\\\\
              \\dfrac{-${nomV[0]}+${nomV[1]}}{${nomV[2]}}&=${nomV[3]}
                        \\end{aligned}$<br>Une expression de $${nomV[3]}$ en fonction de $${nomV[0]}$, $${nomV[1]}$ et  $${nomV[2]}$ est $${nomV[3]}=  \\dfrac{${nomV[1]}-${nomV[0]}}{${nomV[2]}}$.`
          } else if (choix === 3) {
            // a=b-cd on cherche  b
            intro = `Soient $${nomV[0]}$, $${nomV[1]}$, $${nomV[2]}$ et $${nomV[3]}$  quatre nombres vérifiant l'égalité :`
            texte =
              `${intro}` +
              ` $${nomV[0]}=${nomV[1]}-${nomV[2]}${nomV[3]}$.<br>
     Exprimer $${nomV[1]}$ en fonction de $${nomV[0]}$, $${nomV[2]}$ et  $${nomV[3]}$.`
            varAExprimer = nomV[1]
            reponse = [`${nomV[0]}+${nomV[2]}${nomV[3]}`]
            texteCorr = `On isole $${nomV[1]}$ dans un membre de l'égalité :<br> 
         $\\begin{aligned}
        ${nomV[0]}&=${nomV[1]}-${nomV[2]}${nomV[3]}\\\\
        ${nomV[0]}+${nomV[2]}${nomV[3]}&=${nomV[1]}
                   \\end{aligned}$ <br> Une expression de $${nomV[1]}$ en fonction de $${nomV[0]}$, $${nomV[2]}$ et  $${nomV[2]}$ est $${nomV[1]}= ${nomV[0]}+${nomV[2]}${nomV[3]}$.`
          } else if (choix === 4) {
            // a=bc+d on cherche  b
            intro = `Soient $${nomV[0]}$, $${nomV[1]}$, $${nomV[2]}$ et $${nomV[3]}$  quatre nombres (avec $${nomV[2]}$ non nul) vérifiant l'égalité  :`
            texte =
              `${intro}` +
              `  $${nomV[0]}=${nomV[1]}${nomV[2]}+${nomV[3]}$.<br>
    Exprimer $${nomV[1]}$ en fonction de $${nomV[0]}$, $${nomV[2]}$ et  $${nomV[3]}$.`
            varAExprimer = nomV[1]
            reponse = [
              `\\dfrac{${nomV[0]}-${nomV[3]}}{${nomV[2]}}`,
              `\\dfrac{-${nomV[0]}+${nomV[3]}}{-${nomV[2]}}`,
            ]
            texteCorr = `On isole $${nomV[1]}$ dans un membre de l'égalité :<br> 
        $\\begin{aligned}
       ${nomV[0]}&=${nomV[1]}${nomV[2]}+${nomV[3]}\\\\
       ${nomV[0]}-${nomV[3]}&=${nomV[1]}${nomV[2]}\\\\
        \\dfrac{${nomV[0]}-${nomV[3]}}{${nomV[2]}}&=${nomV[1]}
                  \\end{aligned}$       <br> Une expression de $${nomV[1]}$ en fonction de $${nomV[0]}$, $${nomV[2]}$ et  $${nomV[3]}$ est $${nomV[1]}=  \\dfrac{${nomV[0]}-${nomV[3]}}{${nomV[2]}}$.`
          } else if (choix === 5) {
            // a=bc+d on cherche  d
            intro = `Soient $${nomV[0]}$, $${nomV[1]}$, $${nomV[2]}$ et $${nomV[3]}$  quatre nombres vérifiant l'égalité suivante :`
            texte =
              `${intro}` +
              `  $${nomV[0]}=${nomV[1]}${nomV[2]}+${nomV[3]}$.<br>
     Exprimer $${nomV[3]}$ en fonction de $${nomV[0]}$, $${nomV[1]}$ et  $${nomV[2]}$.`
            varAExprimer = nomV[3]
            reponse = `${nomV[0]}-${nomV[1]}${nomV[2]}`
            texteCorr = `On isole $${nomV[3]}$ dans un membre de l'égalité :<br> 
 $\\begin{aligned}
 ${nomV[0]}&=${nomV[1]}${nomV[2]}+${nomV[3]}\\\\
  ${nomV[0]}-${nomV[1]}${nomV[2]}&=${nomV[3]}
 \\end{aligned}$<br> Une expression de $${nomV[3]}$ en fonction de $${nomV[0]}$, $${nomV[1]}$ et  $${nomV[2]}$ est $${nomV[3]}=  ${nomV[0]}-${nomV[1]}${nomV[2]}$.`
          } else if (choix === 6) {
            // a=(b+c)/d on cherche  b
            intro = `Soient $${nomV[0]}$, $${nomV[1]}$, $${nomV[2]}$ et $${nomV[3]}$  quatre nombres (avec $${nomV[3]}$ non nul) vérifiant l'égalité  :`
            texte =
              `${intro}` +
              `  $${nomV[0]}=\\dfrac{${nomV[1]}+${nomV[2]}}{${nomV[3]}}$.<br>
  Exprimer $${nomV[1]}$ en fonction de $${nomV[0]}$, $${nomV[2]}$ et  $${nomV[3]}$.`
            varAExprimer = nomV[1]
            reponse = `${nomV[3]}\\times ${nomV[0]}-${nomV[2]}`
            texteCorr = `On isole $${nomV[1]}$ dans un membre de l'égalité :<br> 
  $\\begin{aligned}
 ${nomV[0]}&=\\dfrac{${nomV[1]}+${nomV[2]}}{${nomV[3]}}\\\\
 ${nomV[0]}\\times ${nomV[3]}&=${nomV[1]}+${nomV[2]}\\\\
 ${nomV[0]}\\times ${nomV[3]}-${nomV[2]}&=${nomV[1]}
 \\end{aligned}$<br> Une expression de $${nomV[1]}$ en fonction de $${nomV[0]}$, $${nomV[2]}$ et  $${nomV[3]}$ est $${nomV[1]}= ${nomV[3]}\\times ${nomV[0]}-${nomV[2]}$.`
          } else if (choix === 7) {
            // a=(b+c)/d on cherche  c
            intro = `Soient $${nomV[0]}$, $${nomV[1]}$, $${nomV[2]}$ et $${nomV[3]}$ quatre nombres (avec $${nomV[3]}$ non nul) vérifiant l'égalité  :`
            texte =
              `${intro}` +
              `  $${nomV[0]}=\\dfrac{${nomV[1]}+${nomV[2]}}{${nomV[3]}}$.<br>
  Exprimer $${nomV[2]}$ en fonction de $${nomV[0]}$, $${nomV[1]}$ et  $${nomV[3]}$.`
            varAExprimer = nomV[2]
            reponse = `${nomV[3]}\\times ${nomV[0]}-${nomV[1]}`
            texteCorr = `On isole $${nomV[2]}$ dans un membre de l'égalité :<br> 
  $\\begin{aligned}
 ${nomV[0]}&=\\dfrac{${nomV[1]}+${nomV[2]}}{${nomV[3]}}\\\\
 ${nomV[0]}\\times ${nomV[3]}&=${nomV[1]}+${nomV[2]}\\\\
 ${nomV[0]}\\times ${nomV[3]}-${nomV[1]}&=${nomV[2]}
 \\end{aligned}$<br> Une expression de $${nomV[2]}$ en fonction de $${nomV[0]}$, $${nomV[1]}$ et  $${nomV[3]}$ est $${nomV[2]}= ${nomV[3]}\\times ${nomV[0]}-${nomV[1]}$.`
          } else if (choix === 8) {
            // a=(b+c)/d on cherche  d
            intro = `Soient $${nomV[0]}$, $${nomV[1]}$, $${nomV[2]}$ et $${nomV[3]}$   quatre nombres (avec $${nomV[3]}$ et $${nomV[0]}$  non nuls) vérifiant l'égalité  :`
            texte =
              `${intro}` +
              `  $${nomV[0]}=\\dfrac{${nomV[1]}+${nomV[2]}}{${nomV[3]}}$.<br>
  Exprimer $${nomV[3]}$ en fonction de $${nomV[0]}$, $${nomV[1]}$ et  $${nomV[2]}$.`
            varAExprimer = nomV[3]
            reponse = [
              `\\dfrac{${nomV[1]} +${nomV[2]}}{${nomV[0]}}`,
              `\\dfrac{-${nomV[1]} -${nomV[2]}}{-${nomV[0]}}`,
            ]
            texteCorr = `On isole $${nomV[3]}$ dans un membre de l'égalité :<br> 
  $\\begin{aligned}
 ${nomV[0]}&=\\dfrac{${nomV[1]}+${nomV[2]}}{${nomV[3]}}\\\\
 ${nomV[0]}\\times ${nomV[3]}&=${nomV[1]}+${nomV[2]}\\\\
  ${nomV[3]}&=\\dfrac{${nomV[1]} +${nomV[2]}}{${nomV[0]}}
 \\end{aligned}$<br> Une expression de $${nomV[3]}$ en fonction de $${nomV[0]}$, $${nomV[1]}$ et  $${nomV[2]}$ est $${nomV[3]}= \\dfrac{${nomV[1]} +${nomV[2]}}{${nomV[0]}}$.`
          } else if (choix === 9) {
            // a=(b+c)*d on cherche  b
            intro = `Soient $${nomV[0]}$, $${nomV[1]}$, $${nomV[2]}$ et $${nomV[3]}$   quatre nombres (avec $${nomV[3]}$ non nul) vérifiant l'égalité  :`
            texte =
              `${intro}` +
              `  $${nomV[0]}=(${nomV[1]}+${nomV[2]})${nomV[3]}$.<br>
  Exprimer $${nomV[1]}$ en fonction de $${nomV[0]}$, $${nomV[3]}$ et  $${nomV[2]}$.`
            varAExprimer = nomV[1]
            reponse = [
              `\\dfrac{${nomV[0]} -${nomV[2]}\\times ${nomV[3]}}{${nomV[3]}}`,
              `\\dfrac{-${nomV[0]} +${nomV[2]}\\times ${nomV[3]}}{-${nomV[3]}}`,
              `\\dfrac{${nomV[0]}}{${nomV[3]}}-${nomV[2]}`,
              `\\dfrac{${nomV[0]}}{${nomV[3]}}-${nomV[2]}`,
            ]
            texteCorr = `On isole $${nomV[1]}$ dans un membre de l'égalité :<br> 
  $\\begin{aligned}
 ${nomV[0]}&=(${nomV[1]}+${nomV[2]})${nomV[3]}\\\\
 ${nomV[0]}&=${nomV[1]}${nomV[3]}+${nomV[2]}${nomV[3]}\\\\
  ${nomV[0]}-${nomV[2]}${nomV[3]}&=${nomV[1]}${nomV[3]}\\\\
 \\dfrac{${nomV[0]}-${nomV[2]}${nomV[3]}}{${nomV[3]}}&=${nomV[1]}
 \\end{aligned}$<br> Une expression de $${nomV[1]}$ en fonction de $${nomV[0]}$, $${nomV[3]}$ et  $${nomV[2]}$ est 
    $${nomV[1]}= \\dfrac{${nomV[0]} -${nomV[2]}\\times ${nomV[3]}}{${nomV[3]}}$ ou plus simplement $${nomV[1]}=\\dfrac{${nomV[0]}}{${nomV[3]}}-${nomV[2]}$.`
          } else if (choix === 10) {
            // a=(b+c)*d on cherche  d
            intro = `Soient $${nomV[0]}$, $${nomV[1]}$, $${nomV[2]}$ et $${nomV[3]}$   quatre nombres (avec $${nomV[1]}+${nomV[2]}$  non nul) vérifiant l'égalité  :`
            texte =
              `${intro}` +
              `  $${nomV[0]}=(${nomV[1]}+${nomV[2]})${nomV[3]}$.<br>
  Exprimer $${nomV[3]}$ en fonction de $${nomV[0]}$, $${nomV[1]}$ et  $${nomV[2]}$.`
            varAExprimer = nomV[3]
            reponse = `\\dfrac{${nomV[0]}}{${nomV[1]}+${nomV[2]}}`
            texteCorr = `On isole $${nomV[3]}$ dans un membre de l'égalité :<br> 
  $\\begin{aligned}
 ${nomV[0]}&=(${nomV[1]}+${nomV[2]})${nomV[3]}\\\\
\\dfrac{${nomV[0]}}{${nomV[1]}+${nomV[2]}} &=${nomV[3]}
 \\end{aligned}$<br> Une expression de $${nomV[3]}$ en fonction de $${nomV[0]}$, $${nomV[1]}$ et  $${nomV[2]}$ est 
    $${nomV[3]}= \\dfrac{${nomV[0]}}{${nomV[1]}+${nomV[2]}}$.`
          } else if (choix === 11) {
            // a=(b-c)*d on cherche  b
            intro = `Soient $${nomV[0]}$, $${nomV[1]}$, $${nomV[2]}$ et $${nomV[3]}$   quatre nombres (avec $${nomV[3]}$ non nul) vérifiant l'égalité  :`
            texte =
              `${intro}` +
              `  $${nomV[0]}=(${nomV[1]}-${nomV[2]})${nomV[3]}$.<br>
  Exprimer $${nomV[1]}$ en fonction de $${nomV[0]}$, $${nomV[3]}$ et  $${nomV[2]}$.`
            varAExprimer = nomV[1]
            reponse = [
              `\\dfrac{${nomV[0]} +${nomV[2]}\\times ${nomV[3]}}{${nomV[3]}}`,
              `\\dfrac{${nomV[0]}}{${nomV[3]}}+${nomV[2]}`,
            ]
            texteCorr = `On isole $${nomV[1]}$ dans un membre de l'égalité :<br> 
  $\\begin{aligned}
 ${nomV[0]}&=(${nomV[1]}-${nomV[2]})${nomV[3]}\\\\
 ${nomV[0]}&=${nomV[1]}${nomV[3]}-${nomV[2]}${nomV[3]}\\\\
  ${nomV[0]}+${nomV[2]}${nomV[3]}&=${nomV[1]}${nomV[3]}\\\\
 \\dfrac{${nomV[0]}+${nomV[2]}${nomV[3]}}{${nomV[3]}}&=${nomV[1]}
 \\end{aligned}$<br> Une expression de $${nomV[1]}$ en fonction de $${nomV[0]}$, $${nomV[3]}$ et  $${nomV[2]}$ est 
    $${nomV[1]}= \\dfrac{${nomV[0]} +${nomV[2]}${nomV[3]}}{${nomV[3]}}$ ou plus simplement $${nomV[1]}=\\dfrac{${nomV[0]}}{${nomV[3]}}+${nomV[2]}$.`
          } else {
            // a=(b-c)*d on cherche  c
            intro = `Soient $${nomV[0]}$, $${nomV[1]}$, $${nomV[2]}$ et $${nomV[3]}$   quatre nombres (avec $${nomV[3]}$  non nul) vérifiant l'égalité  :`
            texte =
              `${intro}` +
              `  $${nomV[0]}=(${nomV[1]}-${nomV[2]})${nomV[3]}$.<br>
  Exprimer $${nomV[2]}$ en fonction de $${nomV[0]}$, $${nomV[1]}$ et  $${nomV[3]}$.`
            varAExprimer = nomV[2]
            reponse = [
              `\\dfrac{-${nomV[0]} +${nomV[1]}\\times ${nomV[3]}}{${nomV[3]}}`,
              `${nomV[1]}-\\dfrac{${nomV[0]}}{${nomV[3]}}`,
            ]
            texteCorr = `On isole $${nomV[2]}$ dans un membre de l'égalité :<br> 
  $\\begin{aligned}
 ${nomV[0]}&=(${nomV[1]}-${nomV[2]})${nomV[3]}\\\\
 ${nomV[0]}&=${nomV[1]}${nomV[3]}-${nomV[2]}${nomV[3]}\\\\
  ${nomV[0]}-${nomV[1]}${nomV[3]}&=-${nomV[2]}${nomV[3]}\\\\
 \\dfrac{${nomV[0]}-${nomV[1]}${nomV[3]}}{-${nomV[3]}}&=${nomV[2]}\\\\
 \\dfrac{-${nomV[0]}+${nomV[1]}${nomV[3]}}{${nomV[3]}}&=${nomV[2]}
 \\end{aligned}$<br> Une expression de $${nomV[2]}$ en fonction de $${nomV[0]}$, $${nomV[1]}$ et  $${nomV[3]}$ est 
    $${nomV[2]}=  \\dfrac{-${nomV[0]}+${nomV[1]}${nomV[3]}}{${nomV[3]}}$ ou plus simplement : 
    $${nomV[2]}= ${nomV[1]} -\\dfrac{${nomV[0]}}{${nomV[3]}}$ .`
          }

          break

        case 3:
        default:
          nomVariables = [
            shuffle(['a', 'b', 'c', 'e', 'f']),
            shuffle(['x', 'y', 'z', 'w', 'v']),
            shuffle(['u', 'v', 'w', 't', 'r']),
            shuffle(['A', 'B', 'C', 'E', 'F']),
            shuffle(['R', 'S', 'T', 'U', 'V']),
            shuffle(['I', 'J', 'K', 'L', 'M']),
            shuffle(['c', 'g', 'e', 'f', 'h']),
            shuffle(['c', 'm', 'f', 'e', 'a']),
            shuffle(['K', 'L', 'M', 'N', 'P']),
            shuffle(['r', 's', 't', 'u', 'a']),
            shuffle(['U', 'V', 'W', 'X', 'R']),
          ]
          nomV = choice(nomVariables)
          choix = randint(1, 6)
          if (choix === 1) {
            // a=(b+c)(d-e) on cherche  b
            intro = `Soient $${nomV[0]}$, $${nomV[1]}$, $${nomV[2]}$, $${nomV[3]}$ et $${nomV[4]}$ cinq nombres (avec $${nomV[3]}-${nomV[4]}$ non nul) vérifiant l'égalité  :`
            texte =
              `${intro}` +
              ` $${nomV[0]}=(${nomV[1]}+${nomV[2]})(${nomV[3]}-${nomV[4]})$.<br>
       Exprimer $${nomV[1]}$ en fonction de $${nomV[0]}$, $${nomV[2]}$, $${nomV[3]}$ et $${nomV[4]}$.`
            varAExprimer = nomV[1]
            reponse = [
              `\\dfrac{${nomV[0]}-${nomV[2]}${nomV[3]}+${nomV[2]}${nomV[4]}}{${nomV[3]}-${nomV[4]}}`,
              ` \\dfrac{${nomV[0]}}{${nomV[3]}-${nomV[4]}}-${nomV[2]}`,
              ` \\dfrac{${nomV[0]}-${nomV[2]}(${nomV[3]}-${nomV[4]})}{${nomV[3]}-${nomV[4]}}`,
            ]
            texteCorr = `On isole $${nomV[1]}$ dans un membre de l'égalité :<br>
           $\\begin{aligned}
          ${nomV[0]}&=(${nomV[1]}+${nomV[2]})(${nomV[3]}-${nomV[4]})\\\\
          ${nomV[0]}&=${nomV[1]}${nomV[3]}-${nomV[1]}${nomV[4]}+${nomV[2]}${nomV[3]}-${nomV[2]}${nomV[4]}\\\\
           ${nomV[0]}-${nomV[2]}${nomV[3]}+${nomV[2]}${nomV[4]}&= ${nomV[1]}(${nomV[3]}-${nomV[4]})\\\\
           \\dfrac{${nomV[0]}-${nomV[2]}${nomV[3]}+${nomV[2]}${nomV[4]}}{${nomV[3]}-${nomV[4]}}&=${nomV[1]}
                     \\end{aligned}$<br> Une expression de $${nomV[1]}$ en fonction de $${nomV[0]}$, $${nomV[1]}$, $${nomV[3]}$ et $${nomV[4]}$ est $${nomV[1]}=\\dfrac{${nomV[0]}-${nomV[2]}${nomV[3]}+${nomV[2]}${nomV[4]}}{${nomV[3]}-${nomV[4]}}$ ou plus simplement 
          $${nomV[1]}= \\dfrac{${nomV[0]}}{${nomV[3]}-${nomV[4]}}-${nomV[2]}$.`
          } else if (choix === 2) {
            // a=(b+c)(d-e) on cherche  e
            intro = `Soient $${nomV[0]}$, $${nomV[1]}$, $${nomV[2]}$, $${nomV[3]}$ et $${nomV[4]}$ cinq nombres (avec $${nomV[1]}+${nomV[2]}$ non nul) vérifiant l'égalité  :`
            texte =
              `${intro}` +
              ` $${nomV[0]}=(${nomV[1]}+${nomV[2]})(${nomV[3]}-${nomV[4]})$.<br>
                Exprimer $${nomV[4]}$ en fonction de $${nomV[0]}$, $${nomV[2]}$, $${nomV[3]}$ et $${nomV[1]}$.`
            varAExprimer = nomV[4]
            reponse = [
              `\\dfrac{${nomV[0]}-${nomV[1]}${nomV[3]}-${nomV[2]}${nomV[3]}}{-${nomV[1]}-${nomV[2]}}`,
              `\\dfrac{-${nomV[0]}+${nomV[1]}${nomV[3]}+${nomV[2]}${nomV[3]}}{${nomV[1]}+${nomV[2]}}`,
              ` \\dfrac{-${nomV[0]}}{${nomV[1]}+${nomV[2]}}+${nomV[3]}`,
              `\\dfrac{-${nomV[0]}+${nomV[3]}(${nomV[1]}+${nomV[2]})}{${nomV[1]}+${nomV[2]}}`,
              `\\dfrac{${nomV[0]}-${nomV[3]}(${nomV[1]}+${nomV[2]})}{-${nomV[1]}-${nomV[2]}}`,
            ]
            texteCorr = `On isole $${nomV[4]}$ dans un membre de l'égalité :<br>
                    $\\begin{aligned}
                   ${nomV[0]}&=(${nomV[1]}+${nomV[2]})(${nomV[3]}-${nomV[4]})\\\\
                   ${nomV[0]}&=${nomV[1]}${nomV[3]}-${nomV[1]}${nomV[4]}+${nomV[2]}${nomV[3]}-${nomV[2]}${nomV[4]}\\\\
${nomV[0]}-${nomV[1]}${nomV[3]}-${nomV[2]}${nomV[3]}&= -${nomV[1]}${nomV[4]}-${nomV[2]}${nomV[4]})\\\\
${nomV[0]}-${nomV[1]}${nomV[3]}-${nomV[2]}${nomV[3]}&= ${nomV[4]}(-${nomV[1]}-${nomV[2]})\\\\
 \\dfrac{${nomV[0]}-${nomV[1]}${nomV[3]}-${nomV[2]}${nomV[3]}}{-${nomV[1]}-${nomV[2]}}&=${nomV[4]}\\\\
 \\dfrac{-${nomV[0]}+${nomV[1]}${nomV[3]}+${nomV[2]}${nomV[3]}}{${nomV[1]}+${nomV[2]}}&=${nomV[4]}
                              \\end{aligned}$<br> Une expression de $${nomV[4]}$ en fonction de $${nomV[0]}$, $${nomV[1]}$, $${nomV[2]}$ et $${nomV[3]}$ est 
                   $${nomV[4]}=\\dfrac{-${nomV[0]}+${nomV[1]}${nomV[3]}+${nomV[2]}${nomV[3]}}{${nomV[1]}+${nomV[2]}}$ 
                   ou plus simplement 
                   $${nomV[4]}= -\\dfrac{${nomV[0]}}{${nomV[1]}+${nomV[2]}}+${nomV[3]}$.<br>
                   `
          } else if (choix === 3) {
            // a=(b+c)/(d-e) on cherche  d
            intro = `Soient $${nomV[0]}$, $${nomV[1]}$, $${nomV[2]}$, $${nomV[3]}$ et $${nomV[4]}$ cinq nombres (avec $${nomV[3]}-${nomV[4]}$ et $${nomV[0]}$ non nuls) vérifiant l'égalité  :`
            texte =
              `${intro}` +
              ` $${nomV[0]}=\\dfrac{${nomV[1]}+${nomV[2]}}{${nomV[3]}-${nomV[4]}}$.<br>
 Exprimer $${nomV[3]}$ en fonction de $${nomV[0]}$, $${nomV[1]}$, $${nomV[2]}$ et $${nomV[4]}$.`
            varAExprimer = nomV[3]
            reponse = `\\dfrac{${nomV[1]}+${nomV[2]}+${nomV[0]}${nomV[4]}}{${nomV[0]}}`
            texteCorr = `On isole $${nomV[3]}$ dans un membre de l'égalité :<br>
 $\\begin{aligned}
   ${nomV[0]}=&\\dfrac{${nomV[1]}+${nomV[2]}}{${nomV[3]}-${nomV[4]}}\\\\
    ${nomV[0]}(${nomV[3]}-${nomV[4]})&=${nomV[1]}+${nomV[2]}\\\\
   ${nomV[0]}${nomV[3]}-${nomV[0]}${nomV[4]}&= ${nomV[1]}+${nomV[2]}\\\\
   ${nomV[0]}${nomV[3]}&=${nomV[1]}+${nomV[2]}+${nomV[0]}${nomV[4]}\\\\
   ${nomV[3]}&=\\dfrac{${nomV[1]}+${nomV[2]}+${nomV[0]}${nomV[4]}}{${nomV[0]}}
     \\end{aligned}$<br> Une expression de $${nomV[3]}$ en fonction de $${nomV[0]}$, $${nomV[1]}$, $${nomV[2]}$ et $${nomV[4]}$ est 
       $${nomV[3]}=\\dfrac{${nomV[1]}+${nomV[2]}+${nomV[0]}${nomV[4]}}{${nomV[0]}}$.`
          } else if (choix === 4) {
            // a=(b+c)/(d-e) on cherche  e
            intro = `Soient $${nomV[0]}$, $${nomV[1]}$, $${nomV[2]}$, $${nomV[3]}$ et $${nomV[4]}$ cinq nombres (avec $${nomV[3]}-${nomV[4]}$ et $${nomV[0]}$ non nuls) vérifiant l'égalité  :`
            texte =
              `${intro}` +
              ` $${nomV[0]}=\\dfrac{${nomV[1]}+${nomV[2]}}{${nomV[3]}-${nomV[4]}}$.<br>
    Exprimer $${nomV[4]}$ en fonction de $${nomV[0]}$, $${nomV[1]}$, $${nomV[2]}$ et $${nomV[3]}$.`
            varAExprimer = nomV[4]
            reponse = [
              `\\dfrac{${nomV[1]}+${nomV[2]}-${nomV[0]}${nomV[3]}}{-${nomV[0]}}`,
              `\\dfrac{-${nomV[1]}-${nomV[2]}+${nomV[0]}${nomV[3]}}{${nomV[0]}}`,
              `\\dfrac{-${nomV[1]}-${nomV[2]}}{${nomV[0]}}+${nomV[3]}`,
            ]
            texteCorr = `$${reponse}$On isole $${nomV[4]}$ dans un membre de l'égalité :<br>
     $\\begin{aligned}
      ${nomV[0]}=&\\dfrac{${nomV[1]}+${nomV[2]}}{${nomV[3]}-${nomV[4]}}\\\\
        ${nomV[0]}(${nomV[3]}-${nomV[4]})&=${nomV[1]}+${nomV[2]}\\\\
      ${nomV[0]}${nomV[3]}-${nomV[0]}${nomV[4]}&= ${nomV[1]}+${nomV[2]}\\\\
      -${nomV[0]}${nomV[4]} &=${nomV[1]}+${nomV[2]}-${nomV[0]}${nomV[3]}\\\\
      ${nomV[4]}&=\\dfrac{${nomV[1]}+${nomV[2]}-${nomV[0]}${nomV[3]}}{-${nomV[0]}}\\\\
      ${nomV[4]}&=\\dfrac{-${nomV[1]}-${nomV[2]}+${nomV[0]}${nomV[3]}}{${nomV[0]}}
         \\end{aligned}$<br> Une expression de $${nomV[4]}$ en fonction de $${nomV[0]}$, $${nomV[1]}$, $${nomV[2]}$ et $${nomV[3]}$ est 
           $${nomV[4]}=\\dfrac{-${nomV[1]}-${nomV[2]}+${nomV[0]}${nomV[3]}}{${nomV[0]}}$.`
          } else if (choix === 5) {
            // a=b+c\sqrt{d+e} on cherche d
            intro = `Soient $${nomV[0]}$, $${nomV[1]}$, $${nomV[2]}$, $${nomV[3]}$ et $${nomV[4]}$ cinq nombres (strictement positifs) vérifiant l'égalité  :`
            texte =
              `${intro}` +
              ` $${nomV[0]}=${nomV[1]}+${nomV[2]}\\sqrt{${nomV[3]}+${nomV[4]}}$.<br>
    Exprimer $${nomV[3]}$ en fonction de $${nomV[0]}$, $${nomV[1]}$, $${nomV[2]}$ et $${nomV[4]}$.`
            varAExprimer = nomV[3]
            reponse = [
              `\\dfrac{${nomV[0]}^2-2${nomV[0]}${nomV[1]}+${nomV[1]}^2}{${nomV[2]}^2}-${nomV[4]}`,
              `(\\dfrac{${nomV[0]}-${nomV[1]}}{${nomV[2]}})^2-${nomV[4]}`,
              `$\\dfrac{${nomV[0]}^2-2${nomV[0]}${nomV[1]}+${nomV[1]}^2-${nomV[4]}${nomV[2]}^2}{${nomV[2]}^2}`,
              `\\dfrac{(${nomV[0]}-${nomV[1]})^2-${nomV[4]}${nomV[2]}^2}{${nomV[2]}^2}`,
            ]
            texteCorr = `On isole $${nomV[3]}$ dans un membre de l'égalité :<br>
 $\\begin{aligned}
  ${nomV[0]}=&${nomV[1]}+${nomV[2]}\\sqrt{${nomV[3]}+${nomV[4]}}\\\\
   ${nomV[0]}-${nomV[1]}&=${nomV[2]}\\sqrt{${nomV[3]}+${nomV[4]}}\\\\
   \\dfrac{${nomV[0]}-${nomV[1]}}{${nomV[2]}}&= \\sqrt{${nomV[3]}+${nomV[4]}}\\\\
   \\left(\\dfrac{${nomV[0]}-${nomV[1]}}{${nomV[2]}}\\right)^2 &=${nomV[3]}+${nomV[4]}\\\\
   \\left(\\dfrac{${nomV[0]}-${nomV[1]}}{${nomV[2]}}\\right)^2-${nomV[4]}&=${nomV[3]}
\\end{aligned}$ <br> Une expression de $${nomV[3]}$ en fonction de $${nomV[0]}$, $${nomV[1]}$, $${nomV[2]}$ et $${nomV[4]}$ est 
   $${nomV[3]}=\\left(\\dfrac{${nomV[0]}-${nomV[1]}}{${nomV[2]}}\\right)^2-${nomV[4]}$ ou par exemple $${nomV[3]}=\\dfrac{\\left(${nomV[0]}-${nomV[1]}\\right)^2-${nomV[4]}${nomV[2]}^2}{${nomV[2]}^2}$.
 `
          } else {
            // a=b+c\sqrt{d+e} on cherche c
            intro = `Soient $${nomV[0]}$, $${nomV[1]}$, $${nomV[2]}$, $${nomV[3]}$ et $${nomV[4]}$ cinq nombres (strictement positifs) vérifiant l'égalité  :`
            texte =
              `${intro}` +
              ` $${nomV[0]}=${nomV[1]}+${nomV[2]}\\sqrt{${nomV[3]}+${nomV[4]}}$.<br>
     Exprimer $${nomV[2]}$ en fonction de $${nomV[0]}$, $${nomV[1]}$, $${nomV[3]}$ et $${nomV[4]}$.`
            varAExprimer = nomV[2]
            reponse = `\\dfrac{${nomV[0]}-${nomV[1]}}{\\sqrt{${nomV[3]}+${nomV[4]}}}`
            texteCorr = `On isole $${nomV[2]}$ dans un membre de l'égalité :<br>
  $\\begin{aligned}
   ${nomV[0]}=&${nomV[1]}+${nomV[2]}\\sqrt{${nomV[3]}+${nomV[4]}}\\\\
    ${nomV[0]}-${nomV[1]}&=${nomV[2]}\\sqrt{${nomV[3]}+${nomV[4]}}\\\\
    \\dfrac{${nomV[0]}-${nomV[1]}}{\\sqrt{${nomV[3]}+${nomV[4]}}}&=${nomV[2]}
 \\end{aligned}$<br> Une expression de $${nomV[2]}$ en fonction de $${nomV[0]}$, $${nomV[1]}$, $${nomV[3]}$ et $${nomV[4]}$ est 
    $${nomV[2]}= \\dfrac{${nomV[0]}-${nomV[1]}}{\\sqrt{${nomV[3]}+${nomV[4]}}}$.
  `
          }
          break
      }
      const GilllesDAccord = true // EE : Quand Gilles sera d'accord, on pourra changer. ;-)
      if (GilllesDAccord)
        texte +=
          '<br>' +
          ajouteChampTexteMathLive(this, i, KeyboardType.alphanumeric, {
            texteAvant: sp(10) + `$${varAExprimer} =$`,
          })
      else
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.alphanumeric, {
          texteAvant: sp(10),
        })
      handleAnswers(this, i, { reponse: { value: reponse } })

      // Uniformisation : Mise en place de la réponse attendue en interactif en orange et gras

      const textCorrSplit = texteCorr.split('=')
      let aRemplacer = textCorrSplit[textCorrSplit.length - 1]
      aRemplacer = aRemplacer.replace('$', '').replace('<br>', '')
      const pointFinal = /\.\s*$/.test(aRemplacer)
      aRemplacer = aRemplacer.replace(/\s*\.\s*$/, '').trim()

      texteCorr = ''
      for (let ee = 0; ee < textCorrSplit.length - 1; ee++) {
        texteCorr += textCorrSplit[ee]
        texteCorr += ee < textCorrSplit.length - 2 ? '=' : ''
      }
      texteCorr =
        texteCorr.slice(0, texteCorr.length - 1) +
        sp(2) +
        `${texteCorr[texteCorr.length - 1]}=${miseEnEvidence(aRemplacer)}$${pointFinal ? '.' : ''}`

      // Fin de cette uniformisation

      if (this.questionJamaisPosee(i, typesDeQuestions, choix, nomV.join())) {
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
