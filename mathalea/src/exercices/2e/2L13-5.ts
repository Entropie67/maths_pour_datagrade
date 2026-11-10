import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { rienSi1 } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { pgcd } from '../../lib/outils/primalite'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
export const titre = 'Calculer avec des fractions (calcul littéral)'
export const uuid = '2cb9a'
export const interactifReady = true

export const dateDePublication = '20/02/2025'
export const dateDeModificationImportante = '15/02/2026' // Ajout d'une option pour les quotients
export const refs = {
  'fr-fr': ['2L13-5', 'BP2AutoI2'],
  'fr-ch': ['1mCN-13'],
}

const ecritureQuotient = (num: string, den: string, fractionnaire: boolean) =>
  fractionnaire ? `\\dfrac{${num}}{${den}}` : `${num}\\div ${den}`
/**
 * @author Gilles Mora
 */
export default class CalculFractionLitteral extends Exercice {
  constructor() {
    super()
    // this.consigne = 'Calculer '
    this.sup = 5
    this.nbQuestions = 1
    this.spacingCorr = 2
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : Sommes/différences (simples)',
        '2 : Sommes/différences (moins simples)',
        '3 : Produits',
        '4 : Quotients',
        '5 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire2CaseACocher = [
      'Écriture fractionnaire des quotients',
      false,
    ]
    this.sup2 = false
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 4,
      melange: 5,
      defaut: 5,
      nbQuestions: this.nbQuestions,
    })

    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const NomVar = [
        ['a', 'b'],
        ['x', 'y'],
        ['n', 'z'],
      ]
      const pm = choice(['+', '-'])
      const Nom = choice(NomVar)
      const v1 = Nom[0]
      const v2 = Nom[1]
      const choix = choice([true, false])
      this.consigne =
        "Écrire sous la forme d'une fraction la plus simple possible (les variables sont supposées non nulles)."
      let texte = ''
      let texteCorr = ''
      switch (listeTypeDeQuestions[i]) {
        case 1: // somme 1
          {
            const Question = randint(1, 3)
            if (Question === 1) {
              const a = randint(1, 9)
              const b = randint(1, 9)
              texte = `$\\dfrac{${a}}{${v1}}${pm}\\dfrac{${b}}{${v2}}$`
              texteCorr += `$\\begin{aligned}
         \\dfrac{${a}}{${v1}}${pm}\\dfrac{${b}}{${v2}}&=\\dfrac{${a}\\times ${v2}}{${v1}\\times ${v2}}${pm}\\dfrac{${b}\\times ${v1}}{${v2}\\times ${v1}}\\\\
          &=${miseEnEvidence(`\\dfrac{${rienSi1(a)}${v2}${pm}${rienSi1(b)}${v1}}{${v1}${v2}}`)}
          \\end{aligned}$ `
              handleAnswers(this, i, {
                reponse: {
                  value: `\\dfrac{${rienSi1(a)}${v2}${pm}${rienSi1(b)}${v1}}{${v1}${v2}}`,
                },
              })
            } else if (Question === 2) {
              const a = randint(-9, 9, 0)
              const b = randint(1, 9)
              texte = `$${a}${pm}\\dfrac{${b}}{${v1}}$`

              texteCorr += `$\\begin{aligned}
          ${a}${pm}\\dfrac{${b}}{${v1}}&=\\dfrac{${a}\\times ${v1}}{${v1}}${pm}\\dfrac{${b}}{${v1}}\\\\
          &=${miseEnEvidence(`\\dfrac{${rienSi1(a)}${v1}${pm}${b}}{${v1}}`)}
          \\end{aligned}$ `

              handleAnswers(this, i, {
                reponse: {
                  value: `\\dfrac{${a}${v1}${pm}${b}}{${v1}}`,
                  options: { sansTimes: true },
                },
              })
            } else {
              let a = randint(2, 9)
              let b = randint(2, 9, a)
              while (pgcd(a, b) !== 1) {
                a = randint(2, 9)
                b = randint(2, 9, a)
              }
              texte = `$\\dfrac{${v1}}{${a}}${pm}\\dfrac{${v2}}{${b}}$`
              texteCorr += `$\\begin{aligned}
         \\dfrac{${v1}}{${a}}${pm}\\dfrac{${v2}}{${b}}&=\\dfrac{ ${v1}\\times ${b}}{${a}\\times ${b}}${pm}\\dfrac{ ${v2}\\times ${a}}{${b}\\times ${a}}\\\\
          &=${miseEnEvidence(`\\dfrac{${b}${v1}${pm}${a}${v2}}{${a * b}}`)}
          \\end{aligned}$ `
              handleAnswers(this, i, {
                reponse: {
                  value: `\\dfrac{${b}${v1}${pm}${a}${v2}}{${a * b}}`,
                  options: { sansTimes: true },
                },
              })
            }
          }
          break

        case 2: // somme 2
          {
            const Question = randint(1, 3)
            if (Question === 1) {
              const a = randint(1, 9)
              const b = randint(1, 9)
              texte = `$${rienSi1(a)}${v1}${pm}\\dfrac{${b}}{${v1}}$`
              texteCorr += `$\\begin{aligned}
          ${rienSi1(a)}${v1}${pm}\\dfrac{${b}}{${v1}}&=\\dfrac{${rienSi1(a)}${v1}\\times ${v1}}{${v1}}${pm}\\dfrac{${b}}{${v1}}\\\\
          &=${miseEnEvidence(`\\dfrac{${rienSi1(a)}${v1}^{2}${pm}${b}}{${v1}}`)}
          \\end{aligned}$ `
              handleAnswers(this, i, {
                reponse: {
                  value: `\\dfrac{${a}${v1}^2${pm}${b}}{${v1}}`,
                  options: { sansTimes: true },
                },
              })
            } else if (Question === 2) {
              const a = randint(2, 9)
              const b = randint(1, 9)
              texte = `$\\dfrac{${v1}}{${a}}${pm}\\dfrac{${b}}{${v1}}$`
              texteCorr += `$\\begin{aligned}
          \\dfrac{${v1}}{${a}}${pm}\\dfrac{${b}}{${v1}}&=\\dfrac{${v1}\\times ${v1}}{${a}\\times ${v1}}${pm}\\dfrac{${b}\\times ${a}}{${v1}\\times ${a}}\\\\
            &=${miseEnEvidence(`\\dfrac{${v1}^2${pm}${a * b}}{${a}${v1}}`)}
            \\end{aligned}$ `
              handleAnswers(this, i, {
                reponse: {
                  value: `\\dfrac{${v1}^2${pm}${a * b}}{${a}${v1}}`,
                  options: { sansTimes: true },
                },
              })
            } else {
              let c = randint(2, 9)
              let a = randint(1, 9)
              const b = randint(1, 9)
              while (pgcd(a, c) !== 1) {
                c = randint(2, 9)
                a = randint(1, 10)
              }
              texte = `$\\dfrac{${a}}{${c}${v1}}${pm}\\dfrac{${b}}{${v2}}$`
              texteCorr += `$\\begin{aligned}
         \\dfrac{${a}}{${c}${v1}}${pm}\\dfrac{${b}}{${v2}}&=\\dfrac{${a}\\times ${v2}}{${c}${v1}\\times ${v2}}${pm}\\dfrac{${b}\\times ${c}${v1}}{${v2}\\times ${c}${v1}}\\\\
          &=${miseEnEvidence(`\\dfrac{${a} ${v2}${pm}${b * c}${v1}}{${c}${v1}${v2}}`)}
          \\end{aligned}$ `

              handleAnswers(this, i, {
                reponse: {
                  value: `\\dfrac{${a} ${v2}${pm}${b * c}${v1}}{${c}${v1}${v2}}`,
                  options: { sansTimes: true },
                },
              })
            }
          }
          break

        case 3: // produit
          {
            const Question = randint(1, 4)
            if (Question === 1) {
              let c = randint(2, 9)
              let a = randint(1, 9)
              let b = randint(1, 9)
              while (pgcd(a * b, c) !== 1) {
                c = randint(2, 10)
                a = randint(1, 10)
                b = randint(1, 10)
              }
              texte = `$\\dfrac{${rienSi1(a)}${v1}}{${v2}}\\times \\dfrac{${rienSi1(b)}${v2}}{${c}}$`
              texteCorr += `$\\begin{aligned}
       \\dfrac{${rienSi1(a)}${v1}}{${v2}}\\times \\dfrac{${b}${v2}}{${c}}&=\\dfrac{${rienSi1(a)}${v1}\\times ${b}\\cancel{${v2}}}{${c}\\cancel{${v2}}}\\\\
          &=${miseEnEvidence(`\\dfrac{${a * b}${v1}}{${c}}`)}
          \\end{aligned}$ `
              handleAnswers(this, i, {
                reponse: {
                  value: `\\dfrac{${a * b}${v1}}{${c}}`,
                  options: { sansTimes: true },
                },
              })
            } else if (Question === 2) {
              let a = randint(2, 9)
              let b = randint(1, 9)
              while (pgcd(a, b) !== 1) {
                a = randint(2, 10)
                b = randint(1, 10)
              }
              texte = `$\\dfrac{${v1}}{${a}}\\times \\dfrac{${b}}{${v2}}$`
              texteCorr += `$\\begin{aligned}
\\dfrac{${v1}}{${a}}\\times \\dfrac{${b}}{${v2}}&=\\dfrac{${v1}\\times ${b}}{${a}\\times ${v2}}\\\\
&=${miseEnEvidence(`\\dfrac{${rienSi1(b)}${v1}}{${a}${v2}}`)}
\\end{aligned}$ `
              handleAnswers(this, i, {
                reponse: {
                  value: `\\dfrac{${b}${v1}}{${a}${v2}}`,
                  options: { sansTimes: true },
                },
              })
            } else if (Question === 3) {
              const a = randint(1, 10)

              texte = `${choix ? `$${v1}\\times \\dfrac{${a}}{${v2}}$` : `$\\dfrac{${a}}{${v2}}\\times ${v1}$`}`
              texteCorr += `$\\begin{aligned}
${choix ? `${v1}\\times \\dfrac{${a}}{${v2}}` : `\\dfrac{${a}}{${v2}}\\times ${v2}`}&=${choix ? `\\dfrac{${v1}\\times${a}}{${v2}}` : `\\dfrac{${a}\\times ${v1}}{${v2}}`}\\\\
  &=${miseEnEvidence(`\\dfrac{${rienSi1(a)}${v1}}{${v2}}`)}
  \\end{aligned}$ `
              handleAnswers(this, i, {
                reponse: {
                  value: `\\dfrac{${a}${v1}}{${v2}}`,
                  options: { sansTimes: true },
                },
              })
            } else {
              const a = randint(2, 10)
              const b = randint(2, 10)

              texte = `${choix ? `$\\dfrac{${v1}}{${a}}\\times \\dfrac{${v1}}{${b}}$` : `$\\dfrac{${v1}}{${a}}\\times \\dfrac{${v2}}{${b}}$`}`
              texteCorr += `$\\begin{aligned}
${choix ? `\\dfrac{${v1}}{${a}}\\times \\dfrac{${v1}}{${b}}` : `\\dfrac{${v1}}{${a}}\\times \\dfrac{${v2}}{${b}}`}&=${choix ? `\\dfrac{${v1}\\times ${v1}}{${a}\\times ${b}}` : `\\dfrac{${v1}\\times ${v2}}{${a}\\times ${b}}`}\\\\
  &=${choix ? `${miseEnEvidence(`\\dfrac{${v1}^2}{${a * b}}`)}` : `${miseEnEvidence(`\\dfrac{${v1}${v2}}{${a * b}}`)}`}
  \\end{aligned}$ `
              handleAnswers(this, i, {
                reponse: {
                  value: choix
                    ? `\\dfrac{${v1}^2}{${a * b}}`
                    : `\\dfrac{${v1}${v2}}{${a * b}}`,
                  options: { sansTimes: true },
                },
              })
            }
          }
          break

        case 4: // division
          {
            const Question = randint(1, 2)

            if (Question === 1) {
              const a = randint(2, 10)
              texte = `${choix ? `$${ecritureQuotient(v1, `\\dfrac{${v2}}{${a}}`, this.sup2)}$` : `$${ecritureQuotient(`\\dfrac{${v2}}{${a}}`, v1, this.sup2)}$`}`
              texteCorr += `$\\begin{aligned}
            ${choix ? `${ecritureQuotient(v1, `\\dfrac{${v2}}{${a}}`, this.sup2)}` : `${ecritureQuotient(`\\dfrac{${v2}}{${a}}`, v1, this.sup2)}`}&= ${choix ? `${v1}\\times \\dfrac{${a}}{${v2}}` : ` \\dfrac{${v2}}{${a}} \\times \\dfrac{1}{${v1}}`}\\\\
          &=${choix ? `${miseEnEvidence(` \\dfrac{${a}${v1}}{${v2}}`)}` : `${miseEnEvidence(` \\dfrac{${v2}}{${a}${v1}}`)}`}
\\end{aligned}$ `
              handleAnswers(this, i, {
                reponse: {
                  value: choix
                    ? `\\dfrac{${a}${v1}}{${v2}}`
                    : `\\dfrac{${v2}}{${a}${v1}}`,
                  options: { sansTimes: true },
                },
              })
            } else {
              let a = randint(2, 9)
              let b = randint(1, 9)
              while (pgcd(a, b) !== 1) {
                a = randint(2, 10)
                b = randint(1, 10)
              }
              texte = `${choix ? `$${ecritureQuotient(`\\dfrac{${v1}}{${a}}`, `\\dfrac{${b}}{${v2}}`, this.sup2)}$` : `$${ecritureQuotient(`\\dfrac{${v1}}{${a}}`, `\\dfrac{${v2}}{${b}}`, this.sup2)}$`}`
              texteCorr += `$\\begin{aligned}
          ${choix ? `${ecritureQuotient(`\\dfrac{${v1}}{${a}}`, `\\dfrac{${b}}{${v2}}`, this.sup2)}` : `${ecritureQuotient(`\\dfrac{${v1}}{${a}}`, `\\dfrac{${v2}}{${b}}`, this.sup2)}`}&=${choix ? `\\dfrac{${v1}}{${a}}\\times \\dfrac{${v2}}{${b}}` : `\\dfrac{${v1}}{${a}}\\times \\dfrac{${b}}{${v2}}`}\\\\
            &=${choix ? `${miseEnEvidence(`\\dfrac{${v1}${v2}}{${a * b}}`)}` : `${miseEnEvidence(`\\dfrac{${b}${v1}}{${a}${v2}}`)}`}
            \\end{aligned}$ `
              handleAnswers(this, i, {
                reponse: {
                  value: choix
                    ? `\\dfrac{${v1}${v2}}{${a * b}}`
                    : `\\dfrac{${b}${v1}}{${a}${v2}}`,
                  options: { sansTimes: true },
                },
              })
            }
          }
          break
      }
      texte += ajouteChampTexteMathLive(
        this,
        i,
        KeyboardType.clavierDeBaseAvecVariable,
        { texteAvant: ' $=$' },
      )
      if (this.questionJamaisPosee(i, listeTypeDeQuestions[i], texte)) {
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
