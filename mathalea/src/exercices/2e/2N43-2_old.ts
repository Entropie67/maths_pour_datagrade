import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'

export const titre =
  'Effectuer des calculs avec des puissances et leurs règles de calculs'

export const interactifReady = true
export const interactifType = 'mathLive'
export const amcReady = true
export const amcType = 'AMCNum'
/**
 * Puissances d'un relatif (2)
 * * Travailler des résultats automatisés
 * * mais aussi d'utiliser les propriétés du produit de puissance, du quotient de puissances et des puissances de puissances
 * * Date initiale non renseignée
 * * Mise à jour le 2021-01-24
 * @author Sébastien Lozano
 */
export const uuid = 'c71da'

export const refs = {
  'fr-fr': [''],
  'fr-ch': [''],
}
export default class PuissancesDUnRelatif2 extends Exercice {
  constructor() {
    super()

    this.consigne = 'Écrire sous la forme $a^n$.'
    this.spacing = 2
    this.spacingCorr = 2.5
    this.nbQuestions = 8
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = [1, 2, 3, 4, 5, 6, 7, 8]
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const typesDeQuestions = listeTypeDeQuestions[i]
      let base = 0
      let exp: number[] = []
      let texte = ''
      let texteCorr = ''
      let reponseInteractive = ''
      let exposantInteractif = 0
      switch (typesDeQuestions) {
        case 1:
          base = 3 // on travaille sur cette base mais on pourrait rendre la base aléatoire
          exp = [randint(1, 7, [1]), randint(1, 7, [1]), randint(1, 7, [1])] // on a besoin de 3 exposants distincts
          texte = `$\\dfrac{${base}^${exp[0]}\\times ${base * base}}{${base}^${
            exp[1]
          } \\times ${base}^${exp[2]}}$`
          texteCorr = `$\\dfrac{${base}^${exp[0]}\\times ${
            base * base
          }}{${base}^${exp[1]} \\times ${base}^${exp[2]}}`
          texteCorr += ` = \\dfrac{${base}^${exp[0]}\\times ${base}^{2}}{${base}^${exp[1]} \\times ${base}^${exp[2]}}`
          texteCorr += ` = \\dfrac{${base}^{${exp[0]}+2}}{${base}^{${exp[1]}+${exp[2]}}}`
          texteCorr += ` = \\dfrac{${base}^{${exp[0] + 2}}}{${base}^{${
            exp[1] + exp[2]
          }}}`
          texteCorr += ` = ${base}^{${exp[0] + 2}-${exp[1] + exp[2]}}`
          texteCorr += ` = ${base}^{${exp[0] + 2 - exp[1] - exp[2]}}`
          if (
            exp[0] + 2 - exp[1] - exp[2] === 0 ||
            exp[0] + 2 - exp[1] - exp[2] === 1
          ) {
            // on ne teste l'exposant que pour la sortie puisque l'exposant 1 est évincé
            // texteCorr += '=' + simpExp(base, exp[0] + 2 - exp[1] - exp[2])
          }
          texteCorr += '$'
          reponseInteractive = `${base}^{${exp[0] + 2 - exp[1] - exp[2]}}`
          exposantInteractif = exp[0] + 2 - exp[1] - exp[2]
          break
        case 2:
          base = 2 // on travaille sur cette base mais on pourrait rendre la base aléatoire
          exp = [randint(1, 7, [1]), randint(1, 7, [1])] // on a besoin de 2 exposants distincts
          texte = `$\\dfrac{${base}^${exp[0]}\\times ${base ** 3}}{${base}^${
            exp[1]
          }}$`
          texteCorr = `$\\dfrac{${base}^${exp[0]}\\times ${
            base ** 3
          }}{${base}^${exp[1]}}`
          texteCorr += ` = \\dfrac{${base}^${exp[0]}\\times ${base}^3}{${base}^${exp[1]}}`
          texteCorr += ` = \\dfrac{${base}^{${exp[0]}+3}}{${base}^${exp[1]}}`
          texteCorr += ` = \\dfrac{${base}^{${exp[0] + 3}}}{${base}^${exp[1]}}`
          texteCorr += ` = ${base}^{${exp[0] + 3}-${exp[1]}}`
          texteCorr += ` = ${base}^{${exp[0] + 3 - exp[1]}}`
          if (exp[0] + 3 - exp[1] === 0 || exp[0] + 3 - exp[1] === 1) {
            // on ne teste l'exposant que pour la sortie puisque l'exposant 1 est évincé
            // texteCorr += '=' + simpExp(base, exp[0] + 3 - exp[1])
          }
          texteCorr += '$'
          reponseInteractive = `${base}^{${exp[0] + 3 - exp[1]}}`
          exposantInteractif = exp[0] + 3 - exp[1]
          break
        case 3:
          base = 5 // on travaille sur cette base mais on pourrait rendre la base aléatoire
          exp = [randint(1, 7, [1]), randint(1, 2)] // on a besoin de 2 exposants distincts
          // le second exposant ne peut valoir que 1 ou 2 la fonction testExp ne convient pas à l'affichage ici
          if (exp[1] === 2) {
            texte = `$\\dfrac{${base}\\times ${base}^${exp[0]}}{${base ** 2}^${
              exp[1]
            }}$`
            texteCorr = `$\\dfrac{${base}\\times ${base}^${exp[0]}}{${
              base ** 2
            }^${exp[1]}}`
            texteCorr += `=\\dfrac{${base}^{1+${exp[0]}}}{(${base}^2)^${exp[1]}}`
            texteCorr += `=\\dfrac{${base}^{1+${exp[0]}}}{${base}^{2 \\times ${exp[1]}}}`
            texteCorr += `=\\dfrac{${base}^{${1 + exp[0]}}}{${base}^{${
              2 * exp[1]
            }}}`
          } else {
            texte = `$\\dfrac{${base}\\times ${base}^${exp[0]}}{${base ** 2}}$`
            texteCorr = `$\\dfrac{${base}\\times ${base}^${exp[0]}}{${
              base ** 2
            }}`
            texteCorr += `=\\dfrac{${base}^{1+${exp[0]}}}{${base}^2}`
          }
          texteCorr += `=${base}^{${1 + exp[0]}-${2 * exp[1]}}`
          texteCorr += `=${base}^{${1 + exp[0] - 2 * exp[1]}}`
          if (1 + exp[0] - 2 * exp[1] === 0 || 1 + exp[0] - 2 * exp[1] === 1) {
            // on ne teste l'exposant que pour la sortie puisque l'exposant 1 est évincé
            // texteCorr += '=' + simpExp(base, 1 + exp[0] - 2 * exp[1])
          }
          texteCorr += '$'
          reponseInteractive = `${base}^{${1 + exp[0] - 2 * exp[1]}}`
          exposantInteractif = 1 + exp[0] - 2 * exp[1]
          break
        case 4:
          base = 2 // on travaille sur cette base mais on pourrait rendre la base aléatoire
          exp = [randint(1, 7, [1])] // on a besoin de 1 exposant
          texte = `$\\dfrac{${base}\\times ${base}^${exp[0]}}{${
            base ** 2
          }\\times ${base ** 2}}$`
          texteCorr = `$\\dfrac{${base}\\times ${base}^${exp[0]}}{${
            base ** 2
          }\\times ${base ** 2}}`
          texteCorr += `=\\dfrac{${base}^{1+${exp[0]}}}{${base}^2\\times ${base}^2}`
          texteCorr += `=\\dfrac{${base}^{${1 + exp[0]}}}{${base}^{2+2}}`
          texteCorr += `=\\dfrac{${base}^{${1 + exp[0]}}}{${base}^{${2 + 2}}}`
          texteCorr += `=${base}^{${1 + exp[0]}-${2 + 2}}`
          texteCorr += `=${base}^{${1 + exp[0] - 2 - 2}}`
          if (1 + exp[0] - 2 - 2 === 0 || 1 + exp[0] - 2 - 2 === 1) {
            // on ne teste l'exposant que pour la sortie puisque l'exposant 1 est évincé
            // texteCorr += '=' + simpExp(base, 1 + exp[0] - 2 - 2)
          }
          texteCorr += '$'
          reponseInteractive = `${base}^{${1 + exp[0] - 2 - 2}}`
          exposantInteractif = 1 + exp[0] - 2 - 2
          break
        case 5:
          base = 2 // on travaille sur cette base mais on pourrait rendre la base aléatoire
          exp = [randint(1, 7, [1])] // on a besoin de 1 exposant
          texte = `$\\dfrac{${base ** 2}^${exp[0]}}{${base}}$`
          texteCorr = `$\\dfrac{${base ** 2}^${exp[0]}}{${base}}`
          texteCorr += `=\\dfrac{(${base}^2)^${exp[0]}}{${base}}`
          texteCorr += `=\\dfrac{${base}^{2\\times ${exp[0]}}}{${base}}`
          texteCorr += `=\\dfrac{${base}^{${2 * exp[0]}}}{${base}}`
          texteCorr += `=${base}^{${2 * exp[0]}-1}`
          texteCorr += `=${base}^{${2 * exp[0] - 1}}$`
          // Inutile de tester l'exposant final car il vaut au minimum 3
          reponseInteractive = `${base}^{${2 * exp[0] - 1}}`
          exposantInteractif = 2 * exp[0] - 1
          break
        case 6:
          base = 3 // on travaille sur cette base mais on pourrait rendre la base aléatoire
          exp = [randint(1, 3, [1])] // on a besoin de 1 exposant
          texte = `$\\dfrac{${base ** 3}^${exp[0]}}{${base}}$`
          texteCorr = `$\\dfrac{${base ** 3}^${exp[0]}}{${base}}`
          texteCorr += `=\\dfrac{(${base}^3)^${exp[0]}}{${base}}`
          texteCorr += `=\\dfrac{${base}^{3\\times ${exp[0]}}}{${base}}`
          texteCorr += `=\\dfrac{${base}^{${3 * exp[0]}}}{${base}}`
          texteCorr += `=${base}^{${3 * exp[0]}-1}`
          texteCorr += `=${base}^{${3 * exp[0] - 1}}$`
          // inutile de tester l'exposant final car il vaut au minimum 5
          reponseInteractive = `${base}^{${3 * exp[0] - 1}}`
          exposantInteractif = 3 * exp[0] - 1
          break
        case 7:
          base = 3 // on travaille sur cette base mais on pourrait rendre la base aléatoire
          exp = [randint(1, 7, [1]), randint(1, 7, [1]), randint(1, 4, [1])] // on a besoin de 3 exposants distincts
          texte = `$\\dfrac{${base}^${exp[0]}\\times ${base}^${exp[1]}}{${
            base ** 2
          }^${exp[2]}}\\times ${base}$`
          texteCorr = `$\\dfrac{${base}^${exp[0]}\\times ${base}^${exp[1]}}{${
            base ** 2
          }^${exp[2]}}\\times ${base}`
          texteCorr += `=\\dfrac{${base}^{${exp[0]}+${exp[1]}}}{(${base}^2)^${exp[2]}}\\times ${base}`
          texteCorr += `=\\dfrac{${base}^{${
            exp[0] + exp[1]
          }}}{${base}^{2\\times ${exp[2]}}}\\times ${base}`
          texteCorr += `=\\dfrac{${base}^{${exp[0] + exp[1]}}}{${base}^{${
            2 * exp[2]
          }}}\\times ${base}`
          texteCorr += `=\\dfrac{${base}^{${
            exp[0] + exp[1]
          }}\\times ${base}}{${base}^{${2 * exp[2]}}}`
          texteCorr += `=\\dfrac{${base}^{${exp[0] + exp[1]}+1}}{${base}^{${
            2 * exp[2]
          }}}`
          texteCorr += `=\\dfrac{${base}^{${exp[0] + exp[1] + 1}}}{${base}^{${
            2 * exp[2]
          }}}`
          texteCorr += `=${base}^{${exp[0] + exp[1] + 1}-${2 * exp[2]}}`
          texteCorr += `=${base}^{${exp[0] + exp[1] + 1 - 2 * exp[2]}}`
          if (
            exp[0] + exp[1] + 1 - 2 * exp[2] === 0 ||
            exp[0] + exp[1] + 1 - 2 * exp[2] === 1
          ) {
            // on ne teste l'exposant que pour la sortie puisque l'exposant est évincé
            // texteCorr += '=' + simpExp(base, exp[0] + exp[1] + 1 - 2 * exp[2])
          }
          texteCorr += '$'
          reponseInteractive = `${base}^{${exp[0] + exp[1] + 1 - 2 * exp[2]}}`
          exposantInteractif = exp[0] + exp[1] + 1 - 2 * exp[2]
          break
        case 8:
          base = 2 // on travaille sur cette base mais on pourrait rendre la base aléatoire
          exp = [randint(1, 7, [1])] // on a besoin de 1 exposant
          texte = `$\\dfrac{${base ** 3}\\times ${base}}{${base ** 2}^${
            exp[0]
          }}$`
          texteCorr = `$\\dfrac{${base ** 3}\\times ${base}}{${base ** 2}^${
            exp[0]
          }}`
          texteCorr += `=\\dfrac{${base}^3\\times ${base}}{(${base}^2)^${exp[0]}}`
          texteCorr += `=\\dfrac{${base}^{3+1}}{${base}^{2\\times${exp[0]}}}`
          texteCorr += `=\\dfrac{${base}^{4}}{${base}^{${2 * exp[0]}}}`
          texteCorr += `=${base}^{4-${2 * exp[0]}}`
          texteCorr += `=${base}^{${3 + 1 - 2 * exp[0]}}`
          if (3 + 1 - 2 * exp[0] === 0 || 3 + 1 - 2 * exp[0] === 1) {
            // on ne teste l'exposant que pour la sortie puisque l'exposant est évincé
            // texteCorr += '=' + simpExp(base, 3 + 1 - 2 * exp[0])
          }
          texteCorr += '$'
          reponseInteractive = `${base}^{${3 + 1 - 2 * exp[0]}}`
          exposantInteractif = 3 + 1 - 2 * exp[0]
          break
      }

      if (this.interactif && !context.isAmc) {
        handleAnswers(this, i, {
          reponse: {
            value: reponseInteractive,
            options: { sansExposantUn: exposantInteractif !== 1 },
          },
        })
        texte += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets,
          {
            texteAvant: sp(2) + '$=$',
          },
        )
      }
      if (context.isAmc) {
        handleAnswers(
          this,
          i,
          {
            reponse: {
              value: String(reponseInteractive),
              options: { puissance: true },
            },
          },
          {
            formatInteractif: 'mathlive',
            basePuissance: base,
            exposantPuissance: exposantInteractif,
          },
        )
      }

      // Uniformisation : Mise en place de la réponse attendue en interactif en orange et gras

      const textCorrSplit = texteCorr.split('=')
      let aRemplacer = textCorrSplit[textCorrSplit.length - 1]
      aRemplacer = aRemplacer.replace('$', '').replace('<br>', '')

      texteCorr = ''
      for (let ee = 0; ee < textCorrSplit.length - 1; ee++) {
        texteCorr += textCorrSplit[ee] + '='
      }
      texteCorr += `$ $${miseEnEvidence(aRemplacer)}$`

      // Fin de cette uniformisation

      if (this.questionJamaisPosee(i, texte)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this) // Espacement de 2 em entre chaque questions.
  }
}
