import { propositionsQcm } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
import { ecritureAlgebrique, rienSi1 } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'
import { sp } from '../../../lib/outils/outilString'

export const titre =
  'Résoudre une inéquation du second degré (cas particuliers)'
export const interactifReady = true

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '12/10/2023' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 */
export const uuid = 'b53ea'

export const refs = {
  'fr-fr': ['can1SD22-03'],
  'fr-ch': [],
}
export default class InequationCasParticuliers extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let texte,
      texteCorr,
      a,
      b,
      solution1,
      solution2,
      solution3,
      solution4,
      inegalite,
      props
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      switch (
        choice([1, 2, 3]) //, 2, 3
      ) {
        case 1: // cas ax^2+b> ou <0 solution ensemble vide ou R
          a = randint(1, 3)
          b = randint(1, 5)
          inegalite = choice(['>', '\\geqslant', '<', '\\leqslant'])
          if (inegalite === '>' || inegalite === '\\geqslant') {
            solution1 = '$\\mathbb{R}$'
            solution2 = '$\\emptyset$'
          } else {
            solution1 = '$\\emptyset$'
            solution2 = '$\\mathbb{R}$'
          }
          solution3 = `$]-\\infty\\,;\\,${-b}[\\cup]${b}\\,;\\,+\\infty[$`
          solution4 = `$\\mathbb{R}\\smallsetminus\\{${b}\\}$`
          texte = `L'ensemble des solutions dans $\\mathbb R$ de l'inéquation
        $${rienSi1(a)}x^2+${b * b * a} ${inegalite} 0$ est${sp()}:  `
          this.autoCorrection[i] = {
            enonce: texte,

            propositions: [
              {
                texte: String(solution1),
                statut: true,
              },
              {
                texte: String(solution2),
                statut: false,
              },
              {
                texte: String(solution3),
                statut: false,
              },
              {
                texte: String(solution4),
                statut: false,
              },
            ],
          }
          props = propositionsQcm(this, i)
          if (this.interactif) texte += props.texte
          else {
            texte = `Donner l'ensemble des solutions dans $\\mathbb R$ de l'inéquation
            $${rienSi1(a)}x^2+${b * b * a} ${inegalite} 0$.`
          }

          texteCorr = `Pour tout réel $x$, $x^2$ est positif. <br>Ainsi, pour tout réel $x$, 
          $${rienSi1(a)}x^2+${b * b * a}$ est strictement positif. <br>
          L'ensemble des solutions de l'inéquation est `
          if (inegalite === '>' || inegalite === '\\geqslant') {
            texteCorr += `$${miseEnEvidence('\\mathbb{R}')}$.`
          } else {
            texteCorr += `$${miseEnEvidence('\\emptyset')}$.`
          }

          break

        case 2: // cas ax^2-b> ou <0 solution intervalle ou réunion d'intervalles
          a = randint(-2, 2, 0)
          b = randint(1, 8)
          inegalite = choice(['>', '\\geqslant', '<', '\\leqslant'])
          texteCorr = `${a > 0 ? `$${rienSi1(a)}x^2-${b * b * a}$` : `$${rienSi1(a)}x^2+${-b * b * a}$`} est un polynôme du second degré ayant deux racines $${-b}$ et $${b}$.<br>
          Comme le coefficient devant $x^2$ est strictement ${a > 0 ? 'positif' : 'négatif'}, ${a > 0 ? `$${rienSi1(a)}x^2-${b * b * a}$` : `$${rienSi1(a)}x^2+${-b * b * a}$`} est ${a > 0 ? 'positif' : 'négatif'} sauf entre ses racines.<br>
          Ainsi, l'ensemble des solutions de l'inéquation est `
          if (inegalite === '\\geqslant') {
            if (a > 0) {
              solution1 = `$]-\\infty\\,;\\,${-b}]\\cup[${b}\\,;\\,+\\infty[$`
              solution2 = `$[${-b}\\,;\\,${b}]$`
              texteCorr += ` $${miseEnEvidence(`]-\\infty\\,;\\,${-b}]\\cup[${b}\\,;\\,+\\infty[`)}$.`
            } else {
              solution2 = `$]-\\infty\\,;\\,${-b}]\\cup[${b}\\,;\\,+\\infty[$`
              solution1 = `$[${-b}\\,;\\,${b}]$`
              texteCorr += ` $${miseEnEvidence(`[${-b}\\,;\\,${b}]`)}$.`
            }
            solution3 = '$\\mathbb{R}$'
            solution4 = `$\\mathbb{R}\\smallsetminus\\{${b}\\}$`
          }
          if (inegalite === '>') {
            if (a > 0) {
              solution1 = `$]-\\infty\\,;\\,${-b}[\\cup]${b}\\,;\\,+\\infty[$`
              solution2 = `$]${-b}\\,;\\,${b}[$`
              texteCorr += ` $${miseEnEvidence(`]-\\infty\\,;\\,${-b}[\\cup]${b}\\,;\\,+\\infty[`)}$.`
            } else {
              solution2 = `$]-\\infty\\,;\\,${-b}[\\cup]${b}\\,;\\,+\\infty[$`
              solution1 = `$]${-b}\\,;\\,${b}[$`
              texteCorr += ` $${miseEnEvidence(`]${-b}\\,;\\,${b}[`)}$.`
            }
            solution3 = '$\\mathbb{R}$'
            solution4 = `$\\mathbb{R}\\smallsetminus\\{${b}\\}$`
          }
          if (inegalite === '\\leqslant') {
            if (a > 0) {
              solution1 = `$[${-b}\\,;\\,${b}]$`
              solution2 = `$]-\\infty\\,;\\,${-b}]\\cup[${b}\\,;\\,+\\infty[$`
              texteCorr += ` $${miseEnEvidence(`[${-b}\\,;\\,${b}]`)}$.`
            } else {
              solution2 = `$[${-b}\\,;\\,${b}]$`
              solution1 = `$]-\\infty\\,;\\,${-b}]\\cup[${b}\\,;\\,+\\infty[$`
              texteCorr += ` $${miseEnEvidence(`]-\\infty\\,;\\,${-b}]\\cup[${b}\\,;\\,+\\infty[`)}$.`
            }
            solution3 = '$\\mathbb{R}$'
            solution4 = '$\\emptyset$'
          }
          if (inegalite === '<') {
            if (a > 0) {
              solution1 = `$]${-b}\\,;\\,${b}[$`
              solution2 = `$]-\\infty\\,;\\,${-b}[\\cup]${b}\\,;\\,+\\infty[$`
              texteCorr += ` $${miseEnEvidence(`]${-b}\\,;\\,${b}[`)}$.`
            } else {
              solution2 = `$]${-b}\\,;\\,${b}[$`
              solution1 = `$]-\\infty\\,;\\,${-b}[\\cup]${b}\\,;\\,+\\infty[$`
              texteCorr += ` $${miseEnEvidence(`]-\\infty\\,;\\,${-b}[\\cup]${b}\\,;\\,+\\infty[`)}$.`
            }
            solution3 = '$\\mathbb{R}$'
            solution4 = '$\\emptyset$'
          }
          texte = `L'ensemble des solutions dans $\\mathbb R$ de l'inéquation
            ${a > 0 ? `$${rienSi1(a)}x^2-${b * b * a} ${inegalite} 0$` : `$${rienSi1(a)}x^2+${-b * b * a} ${inegalite} 0$`} est${sp()}:  `
          this.autoCorrection[i] = {
            enonce: texte,

            propositions: [
              {
                texte: String(solution1),
                statut: true,
              },
              {
                texte: String(solution2),
                statut: false,
              },
              {
                texte: String(solution3),
                statut: false,
              },
              {
                texte: String(solution4),
                statut: false,
              },
            ],
          }
          props = propositionsQcm(this, i)
          if (this.interactif) texte += props.texte
          else {
            texte = `Donner l'ensemble des solutions dans $\\mathbb R$ de l'inéquation
            ${a > 0 ? `$${rienSi1(a)}x^2-${b * b * a} ${inegalite} 0$` : `$${rienSi1(a)}x^2+${-b * b * a} ${inegalite} 0$`}.`
          }

          break

        case 3: // cas a(x+b)^2> ou <0
        default:
          a = randint(-5, 5, 0)
          b = randint(-10, 10, 0)
          inegalite = choice(['>', '\\geqslant', '<', '\\leqslant'])
          if (a > 0) {
            texteCorr = `Pour tout réel $x$, $${rienSi1(a)}(x${ecritureAlgebrique(-b)})^2$ est positif et s'annule en $${b}$.<br>
          Ainsi, l'ensemble des solutions de l'inéquation est `
          } else {
            texteCorr = `Pour tout réel $x$, $${rienSi1(a)}(x${ecritureAlgebrique(-b)})^2$ est négatif et s'annule en $${b}$.<br>
          Ainsi, l'ensemble des solutions de l'inéquation est `
          }
          if (inegalite === '>' && a > 0) {
            solution1 = `$\\mathbb{R}\\smallsetminus\\{${b}\\}$`
            solution2 = '$\\emptyset$'
            solution3 = `$]${b}\\,;\\,+\\infty[$`
            solution4 = '$\\mathbb{R}$'
            texteCorr += ` $${miseEnEvidence(`\\mathbb{R}\\smallsetminus\\{${b}\\}`)}$.`
          }
          if (inegalite === '\\geqslant' && a > 0) {
            solution1 = '$\\mathbb{R}$'
            solution2 = '$\\emptyset$'
            solution3 = `$[${b}\\,;\\,+\\infty[$`
            solution4 = `$\\mathbb{R}\\smallsetminus\\{${b}\\}$`
            texteCorr += ` $${miseEnEvidence('\\mathbb{R}')}$.`
          }
          if (inegalite === '<' && a > 0) {
            solution1 = '$\\emptyset$'
            solution2 = '$\\mathbb{R}$'
            solution3 = `$]${b}\\,;\\,+\\infty[$`
            solution4 = `$\\mathbb{R}\\smallsetminus\\{${b}\\}$`
            texteCorr += ` $${miseEnEvidence('\\emptyset')}$.`
          }
          if (inegalite === '\\leqslant' && a > 0) {
            solution1 = `$\\{${b}\\}$`
            solution2 = '$\\mathbb{R}$'
            solution3 = `$\\mathbb{R}\\smallsetminus\\{${b}\\}$`
            solution4 = '$\\emptyset$'
            texteCorr += ` $${miseEnEvidence(`\\{${b}\\}`)}$.`
          }
          if (inegalite === '>' && a < 0) {
            solution1 = '$\\emptyset$'
            solution2 = `$\\mathbb{R}\\smallsetminus\\{${b}\\}$`
            solution3 = `$]${b}\\,;\\,+\\infty[$`
            solution4 = '$\\mathbb{R}$'
            texteCorr += ` $${miseEnEvidence('\\emptyset')}$.`
          }
          if (inegalite === '\\geqslant' && a < 0) {
            solution1 = `$\\{${b}\\}$`
            solution2 = '$\\emptyset$'
            solution3 = `$\\mathbb{R}\\smallsetminus\\{${b}\\}$`
            solution4 = '$\\mathbb{R}$'
            texteCorr += ` $${miseEnEvidence(`\\{${b}\\}`)}$.`
          }
          if (inegalite === '<' && a < 0) {
            solution1 = `$\\mathbb{R}\\smallsetminus\\{${b}\\}$`
            solution2 = '$\\mathbb{R}$'
            solution3 = `$]${b}\\,;\\,+\\infty[$`
            solution4 = '$\\emptyset$'
            texteCorr += ` $${miseEnEvidence(`\\mathbb{R}\\smallsetminus\\{${b}\\}`)}$.`
          }
          if (inegalite === '\\leqslant' && a < 0) {
            solution1 = '$\\mathbb{R}$'
            solution2 = `$\\mathbb{R}\\smallsetminus\\{${b}\\}$`
            solution3 = `$[${b}\\,;\\,+\\infty[$`
            solution4 = '$\\emptyset$'
            texteCorr += ` $${miseEnEvidence('\\mathbb{R}')}$.`
          }

          texte = `L'ensemble des solutions dans $\\mathbb R$ de l'inéquation
      $${rienSi1(a)}(x${ecritureAlgebrique(-b)})^2 ${inegalite} 0$ est${sp()}:  `
          this.autoCorrection[i] = {
            enonce: texte,

            propositions: [
              {
                texte: String(solution1),
                statut: true,
              },
              {
                texte: String(solution2),
                statut: false,
              },
              {
                texte: String(solution3),
                statut: false,
              },
              {
                texte: String(solution4),
                statut: false,
              },
            ],
          }
          props = propositionsQcm(this, i)
          if (this.interactif) texte += props.texte
          else {
            texte = `Donner l'ensemble des solutions dans $\\mathbb R$ de l'inéquation
            $${rienSi1(a)}(x${ecritureAlgebrique(-b)})^2 ${inegalite} 0$.`
          }

          break
      }
      if (this.questionJamaisPosee(i, a, b)) {
        // Si la question n'a jamais été posée, on la stocke dans la liste des questions
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr

        this.canEnonce = texte

        this.listeCanEnonces.push(this.canEnonce)
        this.listeCanReponsesACompleter.push(this.canReponseACompleter)
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
