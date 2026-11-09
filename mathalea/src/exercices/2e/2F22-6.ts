import { choixDeroulant } from '../../lib/customElements/ListeDeroulanteElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const interactifReady = true

export const titre = 'Comparer deux images avec une fonction de référence'
export const dateDePublication = '14/02/2023'
export const dateDeModifImportante = '26/08/2025'

/**
 *
 * @author Gilles Mora - Mise à jour été 2026 : Stéphane Guyon

 */
export const uuid = '9315e'

export const refs = {
  'fr-fr': ['2F22-6'],
  'fr-ch': ['11LCFA2F-4', '11LSFA2F-4'],
}
export default class ComparerAvecFonctionRef extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Choix des questions',
      8,
      '1 : Avec une fonction affine\n2 : Avec la fonction carré\n3 : Avec la fonction inverse\n4 : Avec la fonction valeur absolue\n5 : Mélange programme 2026\n6 : Avec la fonction cube (année de transition)\n7 : Avec la fonction racine carrée (année de transition)\n8 : Mélange',
    ]
    this.besoinFormulaire2Numerique = [
      'Choix des énoncés',
      2,
      '1 : Avec la fonction précisée \n2 : Sans la fonction précisée (sauf fonction affine)',
    ]

    this.nbQuestions = 1

    this.sup = 5
    this.sup2 = true
    this.sup2 = 1

    this.spacing = 1.5 // Interligne des questions
  }

  nouvelleVersion() {
    let typeDeQuestionsDisponibles
    if (this.sup === 1) {
      typeDeQuestionsDisponibles = ['typeE1']
    } else if (this.sup === 2) {
      typeDeQuestionsDisponibles = ['typeE2', 'typeE3']
    } else if (this.sup === 3) {
      typeDeQuestionsDisponibles = ['typeE4', 'typeE5']
    } else if (this.sup === 4) {
      typeDeQuestionsDisponibles = ['typeE8']
    } else if (this.sup === 5) {
      typeDeQuestionsDisponibles = [
        'typeE1',
        'typeE2',
        'typeE3',
        'typeE4',
        'typeE5',
        'typeE8',
      ]
    } else if (this.sup === 6) {
      typeDeQuestionsDisponibles = ['typeE7']
    } else if (this.sup === 7) {
      typeDeQuestionsDisponibles = ['typeE6']
    } else {
      typeDeQuestionsDisponibles = [
        'typeE1',
        'typeE2',
        'typeE3',
        'typeE4',
        'typeE5',
        'typeE6',
        'typeE7',
        'typeE8',
      ] //
    }
    //
    const listeTypeQuestions = combinaisonListes(
      typeDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posés mais l'ordre diffère à chaque "cycle"
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // Boucle principale où i+1 correspond au numéro de la question
      const nomF = [['f'], ['g'], ['h'], ['u'], ['v'], ['w']]
      let nom
      let x1, x2
      const typeQuestion = listeTypeQuestions[i]
      const variables: number[] = []
      let reponse = []
      switch (
        typeQuestion // Suivant le type de question, le contenu sera différent
      ) {
        case 'typeE1': // fct affine
          {
            const a =
              (randint(11, 99, [20, 30, 40, 50, 60, 70, 80, 90]) / 100) *
              choice([1, -1])
            const a1 = Math.round(a * 100) / 100
            const b = randint(1, 99, [10, 20, 30, 40, 50, 60, 70, 80, 90]) / 10
            x1 = (randint(2, 29, [10, 20]) / 10) * choice([1, -1])
            x2 = (randint(2, 29, [10, 20]) / 10) * choice([1, -1])

            const x1B = Math.round(x1 * 10) / 10
            const x2B = Math.round(x2 * 10) / 10
            if (x1B === x2B) {
              x1 = x1 + 1
            }
            nom = choice(nomF)
            texte = ` Soit $${nom}$ la fonction définie sur $\\mathbb{R}$ par : $${nom}(x)=${texNombre(a, 2)}x+${texNombre(b, 1)}$.<br>
            Sans effectuer de calcul, comparer $${nom}(${texNombre(x1, 1)})$ et $${nom}(${texNombre(x2, 1)})$.`
            texteCorr = `La fonction $${nom}$ est une fonction de la forme $${nom}(x)=mx+p$ avec
            `
            if (a1 > 0) {
              texteCorr += `$m=${texNombre(a, 2)} > 0$.<br>
               D'après le cours, $${nom}$ est une fonction affine croissante sur $\\mathbb{R}$.<br>
              On sait que si une fonction est croissante, les antécédents et les images sont rangés dans le même ordre.<br>
              Ainsi, si $a$ et $b$ sont deux réels tels que $a < b$, alors $${nom}(a) < ${nom}(b)$.<br>
              `
              if (x1B < x2B) {
                texteCorr += `Or $${texNombre(x1, 1)}${sp(1)}${miseEnEvidence('\\boldsymbol{<}')}${sp(1)}${texNombre(x2, 1)}$, donc $${nom}(${texNombre(x1, 2)})${sp(1)} ${miseEnEvidence('\\boldsymbol{<}')} ${sp(1)}${nom}(${texNombre(x2, 1)})$.`
                reponse = ['croissante', 'R', '<']
              } else {
                texteCorr += `Or $${texNombre(x2, 1)}${sp(1)} ${miseEnEvidence('\\boldsymbol{<}')} ${sp(1)}${texNombre(x1, 1)}$, donc $${nom}(${texNombre(x2, 2)})${sp(1)} ${miseEnEvidence('\\boldsymbol{<}')}${sp(1)} ${nom}(${texNombre(x1, 1)})$.`
                reponse = ['croissante', 'R', '>']
              }
            } else {
              texteCorr += `$m=${texNombre(a, 2)} < 0$. <br>
              D'après le cours, $${nom}$ est une fonction affine décroissante sur $\\mathbb{R}$.<br>
              On sait que si une fonction est décroissante, les antécédents et les images sont rangés dans l'ordre inverse.<br>
              Ainsi, si $a$ et $b$ sont deux réels tels que $a < b$, alors $${nom}(a) > ${nom}(b)$.<br>
              `
              if (x1B < x2B) {
                texteCorr += `Or $${texNombre(x1, 1)}${sp(1)}${miseEnEvidence('\\boldsymbol{<}')}${sp(1)}${texNombre(x2, 1)}$, donc $${nom}(${texNombre(x1, 2)})${sp(1)}${miseEnEvidence('\\boldsymbol{>}')}${sp(1)}${nom}(${texNombre(x2, 1)})$.`
                reponse = ['decroissante', 'R', '>']
              } else {
                texteCorr += `Or $${texNombre(x2, 1)}${sp(1)}${miseEnEvidence('\\boldsymbol{<}')}${sp(1)} ${texNombre(x1, 1)}$, donc $${nom}(${texNombre(x2, 2)})${sp(1)} ${miseEnEvidence('\\boldsymbol{>}')}${sp(1)} ${nom}(${texNombre(x1, 1)})$.`
                reponse = ['decroissante', 'R', '<']
              }
            }
            variables.push(x1, x2)
          }
          break

        case 'typeE2': // fct carré avec des nombres positifs
          {
            const partiedec1x1 = randint(5, 9) / 10
            const partiedec2x1 = randint(5, 9) / 100
            const partiedec3x1 = randint(0, 2) / 1000
            x1 = randint(0, 5) + partiedec1x1 + partiedec2x1 + partiedec3x1
            const x2b = ((2 * randint(1, 9)) / 1000) * choice([1, -1])
            x2 = x1 + x2b
            const x1B = Math.round(x1 * 1000) / 1000
            const x2B = Math.round(x2 * 1000) / 1000
            nom = choice(nomF)
            if (this.sup2 === 1) {
              texte = ` Soit $${nom}$ la fonction carré.<br>
            Sans effectuer de calcul, comparer $${nom}(${texNombre(x1, 3)})$ et $${nom}(${texNombre(x2, 3)})$.`
            } else {
              texte = `Sans effectuer de calcul, comparer $${texNombre(x1, 3)}^2$ et $${texNombre(x2, 3)}^2$.`
            }

            texteCorr = `La fonction carré étant strictement croissante sur $]0\\,;\\,+\\infty[$, les antécédents et les images sont rangés dans le même ordre. <br>
            Ainsi, si $a$ et $b$ sont deux nombres réels positifs tels que $a < b$, alors $a^2 < b^2$.`

            if (x1B < x2B) {
              texteCorr += `<br>Or $${texNombre(x1, 3)}${sp(1)}${miseEnEvidence('\\boldsymbol{<}')}${sp(1)}${texNombre(x2, 3)}$,
          donc $${texNombre(x1, 3)}^2${sp(1)}${miseEnEvidence('\\boldsymbol{<}')}${sp(1)}${texNombre(x2, 3)}^2$`
              if (this.sup2 === 1) {
                texteCorr += `, soit $${nom}(${texNombre(x1, 3)})${sp(1)}${miseEnEvidence('\\boldsymbol{<}')}${sp(1)}${nom}(${texNombre(x2, 3)})$.`
              } else {
                texteCorr += '.'
              }
              reponse = ['croissante', 'R+', '<']
            } else {
              texteCorr += `<br>Or $${texNombre(x2, 3)}${sp(1)}${miseEnEvidence('\\boldsymbol{<}')}${sp(1)}${texNombre(x1, 3)}$,
          donc $${texNombre(x2, 3)}^2${sp(1)}${miseEnEvidence('\\boldsymbol{<}')}${sp(1)}${texNombre(x1, 3)}^2$`
              if (this.sup2 === 1) {
                texteCorr += `, soit $${nom}(${texNombre(x2, 3)})${sp(1)}${miseEnEvidence('\\boldsymbol{<}')}${sp(1)}${nom}(${texNombre(x1, 3)})$.`
              } else {
                texteCorr += '.'
              }
              reponse = ['croissante', 'R+', '>']
            }
            variables.push(x1, x2)
          }
          break

        case 'typeE3': // fct carré avec des nombres négatifs
          {
            const partiedec1x1 = randint(5, 9) / 10
            const partiedec2x1 = randint(5, 9) / 100
            const partiedec3x1 = randint(0, 2) / 1000
            x1 = -(randint(0, 5) + partiedec1x1 + partiedec2x1 + partiedec3x1)

            const x2b = ((2 * randint(1, 9)) / 1000) * choice([1, -1])
            x2 = x1 + x2b

            const x1B = Math.round(x1 * 1000) / 1000
            const x2B = Math.round(x2 * 1000) / 1000
            nom = choice(nomF)
            if (this.sup2 === 1) {
              texte = ` Soit $${nom}$ la fonction carré.<br>
            Sans effectuer de calcul, comparer $${nom}(${texNombre(x1, 3)})$ et $${nom}(${texNombre(x2, 3)})$.`
            } else {
              texte = `Sans effectuer de calcul, comparer $(${texNombre(x1, 3)})^2$ et $(${texNombre(x2, 3)})^2$.`
            }

            texteCorr = `La fonction carré étant strictement décroissante sur $]-\\infty\\,;\\,0[$, les antécédents et les images sont rangés dans l'ordre inverse. <br>
            Ainsi, si $a$ et $b$ sont deux nombres réels négatifs tels que $a < b$, alors $a^2 > b^2$.`

            if (x1B < x2B) {
              texteCorr += `<br>Or $${texNombre(x1, 3)}${sp(1)}${miseEnEvidence('\\boldsymbol{<}')}${sp(1)}${texNombre(x2, 3)}$,
          donc $(${texNombre(x1, 3)})^2${sp(1)}${miseEnEvidence('\\boldsymbol{>}')}${sp(1)}(${texNombre(x2, 3)})^2$`
              if (this.sup2 === 1) {
                texteCorr += `, soit $${nom}(${texNombre(x1, 3)})${sp(1)}${miseEnEvidence('\\boldsymbol{>}')}${sp(1)}${nom}(${texNombre(x2, 3)})$.`
              } else {
                texteCorr += '.'
              }
              reponse = ['decroissante', 'R-', '>']
            } else {
              texteCorr += `<br>Or $${texNombre(x2, 3)}${sp(1)}${miseEnEvidence('\\boldsymbol{<}')}${sp(1)}${texNombre(x1, 3)}$,
          donc $(${texNombre(x2, 3)})^2${sp(1)}${miseEnEvidence('\\boldsymbol{>}')}${sp(1)}(${texNombre(x1, 3)})^2$`
              if (this.sup2 === 1) {
                texteCorr += `, soit $${nom}(${texNombre(x2, 3)})${sp(1)}${miseEnEvidence('\\boldsymbol{>}')}${sp(1)}${nom}(${texNombre(x1, 3)})$.`
              } else {
                texteCorr += '.'
              }
              reponse = ['decroissante', 'R-', '<']
            }
            variables.push(x1, x2)
          }
          break

        case 'typeE4': // fct inverse avec des nombres positifs
          {
            const partiedec1x1 = randint(5, 9) / 10
            const partiedec1x2 = (randint(1, 9) / 10) * choice([1, -1])
            x1 = randint(1, 9) + partiedec1x1
            x2 = x1 + partiedec1x2
            const x1B = Math.round(x1 * 10) / 10
            const x2B = Math.round(x2 * 10) / 10

            nom = choice(nomF)
            if (this.sup2 === 1) {
              texte = ` Soit $${nom}$ la fonction inverse.<br>
            Sans effectuer de calcul, comparer $${nom}(${texNombre(x1, 2)})$ et $${nom}(${texNombre(x2, 2)})$.`
            } else {
              texte = `Sans effectuer de calcul, comparer $\\dfrac{1}{${texNombre(x1, 2)}}$ et $\\dfrac{1}{${texNombre(x2, 2)}}$.`
            }

            texteCorr = `La fonction inverse étant strictement décroissante sur $]0\\,;\\,+\\infty[$, les antécédents et les images sont rangés dans l'ordre inverse. <br>
            Ainsi, si $a$ et $b$ sont deux nombres réels stritement positifs tels que $a < b$, alors $\\dfrac{1}{a} > \\dfrac{1}{b}$.`

            if (x1B < x2B) {
              texteCorr += `<br>Or $${texNombre(x1, 1)}${sp(1)}${miseEnEvidence('\\boldsymbol{<}')}${sp(1)}${texNombre(x2, 1)}$,
          donc $\\dfrac{1}{${texNombre(x1, 1)}}${sp(1)}${miseEnEvidence('\\boldsymbol{>}')}${sp(1)}\\dfrac{1}{${texNombre(x2, 1)}}$`
              if (this.sup2 === 1) {
                texteCorr += `, soit $${nom}(${texNombre(x1, 1)})${sp(1)}${miseEnEvidence('\\boldsymbol{>}')}${sp(1)}${nom}(${texNombre(x2, 1)})$.`
              } else {
                texteCorr += '.'
              }
              reponse = ['decroissante', 'R+', '>']
            } else {
              texteCorr += `<br>Or $${texNombre(x2, 3)}${sp(1)}${miseEnEvidence('\\boldsymbol{<}')}${sp(1)}${texNombre(x1, 3)}$,
          donc $\\dfrac{1}{${texNombre(x2, 1)}}${sp(1)}${miseEnEvidence('\\boldsymbol{>}')}${sp(1)}\\dfrac{1}{${texNombre(x1, 1)}}$`
              if (this.sup2 === 1) {
                texteCorr += `, soit $${nom}(${texNombre(x2, 1)})${sp(1)}${miseEnEvidence('\\boldsymbol{>}')}${sp(1)}${nom}(${texNombre(x1, 1)})$.`
              } else {
                texteCorr += '.'
              }
              reponse = ['decroissante', 'R+', '<']
            }
            variables.push(x1, x2)
          }
          break

        case 'typeE5': // fct inverse avec des nombres négatifs
          {
            const partiedec1x1 = randint(5, 9) / 10
            const partiedec1x2 = (randint(1, 9) / 10) * choice([1, -1])
            x1 = -(randint(1, 9) + partiedec1x1)
            x2 = x1 + partiedec1x2
            const x1B = Math.round(x1 * 10) / 10
            const x2B = Math.round(x2 * 10) / 10

            nom = choice(nomF)
            if (this.sup2 === 1) {
              texte = ` Soit $${nom}$ la fonction inverse.<br>
            Sans effectuer de calcul, comparer $${nom}(${texNombre(x1, 2)})$ et $${nom}(${texNombre(x2, 2)})$.`
            } else {
              texte = `Sans effectuer de calcul, comparer $\\dfrac{1}{${texNombre(x1, 2)}}$ et $\\dfrac{1}{${texNombre(x2, 2)}}$.`
            }

            texteCorr = `La fonction inverse étant strictement décroissante sur $]-\\infty\\,;\\,0[$, les antécédents et les images sont rangés dans l'ordre inverse. <br>
            Ainsi, si $a$ et $b$ sont deux nombres réels stritement négatifs tels que $a < b$, alors $\\dfrac{1}{a} > \\dfrac{1}{b}$.`

            if (x1B < x2B) {
              texteCorr += `<br>Or $${texNombre(x1, 3)}${sp(1)}${miseEnEvidence('\\boldsymbol{<}')}${sp(1)}${texNombre(x2, 3)}$,
          donc $\\dfrac{1}{${texNombre(x1, 1)}}${sp(1)}${miseEnEvidence('\\boldsymbol{>}')}${sp(1)}\\dfrac{1}{${texNombre(x2, 1)}}$`
              if (this.sup2 === 1) {
                texteCorr += `, soit $${nom}(${texNombre(x1, 1)})${sp(1)}${miseEnEvidence('\\boldsymbol{>}')}${sp(1)}${nom}(${texNombre(x2, 1)})$.`
              } else {
                texteCorr += '.'
              }
              reponse = ['decroissante', 'R-', '>']
            } else {
              texteCorr += `<br>Or $${texNombre(x2, 3)}${sp(1)}${miseEnEvidence('\\boldsymbol{<}')}${sp(1)}${texNombre(x1, 3)}$,
          donc $\\dfrac{1}{${texNombre(x2, 1)}}${sp(1)}${miseEnEvidence('\\boldsymbol{>}')}${sp(1)}\\dfrac{1}{${texNombre(x1, 1)}}$`
              if (this.sup2 === 1) {
                texteCorr += `, soit $${nom}(${texNombre(x2, 1)})${sp(1)}${miseEnEvidence('\\boldsymbol{>}')}${sp(1)}${nom}(${texNombre(x1, 1)})$.`
              } else {
                texteCorr += '.'
              }
              reponse = ['decroissante', 'R-', '<']
            }
            variables.push(x1, x2)
          }
          break

        case 'typeE6': // fct racine carrée
          {
            const partiedec1x1 = randint(6, 9) / 10
            const partiedec1x2 = (randint(1, 5) / 10) * choice([1, -1])
            x1 = randint(0, 10) + partiedec1x1
            x2 = x1 + partiedec1x2
            const x1B = Math.round(x1 * 10) / 10
            const x2B = Math.round(x2 * 10) / 10
            if (x1B === 1) {
              x1 = randint(0, 10) + randint(6, 9) / 10
            }
            nom = choice(nomF)
            if (this.sup2 === 1) {
              texte = ` Soit $${nom}$ la fonction racine carrée.<br>
            Sans effectuer de calcul, comparer $${nom}(${texNombre(x1, 1)})$ et $${nom}(${texNombre(x2, 1)})$.`
            } else {
              texte = `Sans effectuer de calcul, comparer $\\sqrt{${texNombre(x1, 1)}}$ et $\\sqrt{${texNombre(x2, 1)}}$.`
            }

            texteCorr = `La fonction racine carrée étant strictement croissante sur $]0\\,;\\,+\\infty[$, les antécédents et les images sont rangés dans le même ordre. <br>
            Ainsi, si $a$ et $b$ sont deux nombres réels positifs tels que $a < b$, alors $\\sqrt{a} < \\sqrt{b}$.`

            if (x1B < x2B) {
              texteCorr += `<br>Or $${texNombre(x1, 3)}${sp(1)}${miseEnEvidence('\\boldsymbol{<}')}${sp(1)}${texNombre(x2, 3)}$,
          donc $\\sqrt{${texNombre(x1, 1)}}${sp(1)}${miseEnEvidence('\\boldsymbol{<}')}\\sqrt{${sp(1)}${texNombre(x2, 1)}}$`
              if (this.sup2 === 1) {
                texteCorr += `, soit $${nom}(${texNombre(x1, 1)})${sp(1)}${miseEnEvidence('\\boldsymbol{<}')}${sp(1)}${nom}(${texNombre(x2, 1)})$.`
              } else {
                texteCorr += '.'
              }
              reponse = ['croissante', 'R+', '<']
            } else {
              texteCorr += `<br>Or $${texNombre(x2, 1)}${sp(1)}${miseEnEvidence('\\boldsymbol{<}')}${sp(1)}${texNombre(x1, 1)}$,
          donc $\\sqrt{${texNombre(x2, 3)}}${sp(1)}${miseEnEvidence('\\boldsymbol{<}')}${sp(1)}\\sqrt{${texNombre(x1, 3)}}$`
              if (this.sup2 === 1) {
                texteCorr += `, soit $${nom}(${texNombre(x2, 1)})${sp(1)}${miseEnEvidence('\\boldsymbol{<}')}${sp(1)}${nom}(${texNombre(x1, 1)})$.`
              } else {
                texteCorr += '.'
              }
              reponse = ['croissante', 'R+', '>']
            }
            variables.push(x1, x2)
          }
          break
        case 'typeE7': // fct cube
          {
            const partiedec1x1 = (randint(-9, 9, 0) / 10) * choice([1, -1])
            const partiedec1x2 = (randint(1, 9) / 10) * choice([1, -1])
            x1 = randint(-10, 10) + partiedec1x1
            x2 = x1 + partiedec1x2
            const x1B = Math.round(x1 * 10) / 10
            const x2B = Math.round(x2 * 10) / 10
            nom = choice(nomF)
            if (this.sup2 === 1) {
              texte = ` Soit $${nom}$ la fonction cube.<br>
            Sans effectuer de calcul, comparer $${nom}(${texNombre(x1, 1)})$ et $${nom}(${texNombre(x2, 1)})$.`
            } else {
              texte = `Sans effectuer de calcul, comparer $${ecritureParentheseSiNegatif(x1)}^3$ et $${ecritureParentheseSiNegatif(x2)}^3$.`
            }

            texteCorr = `La fonction cube étant strictement croissante sur $\\mathbb{R}$, les antécédents et les images sont rangés dans le même ordre. <br>
            Ainsi, si $a$ et $b$ sont deux nombres réels tels que $a < b$, alors $a^3 < b^3$.`

            if (x1B < x2B) {
              texteCorr += `<br>Or $${texNombre(x1, 1)}${sp(1)}${miseEnEvidence('\\boldsymbol{<}')}${sp(1)}${texNombre(x2, 1)}$,
          donc $${ecritureParentheseSiNegatif(x1)}^3${sp(1)}${miseEnEvidence('\\boldsymbol{<}')}${sp(1)}${ecritureParentheseSiNegatif(x2)}^3$`
              if (this.sup2 === 1) {
                texteCorr += `, soit $${nom}(${texNombre(x1, 3)})${sp(1)}${miseEnEvidence('\\boldsymbol{<}')}${sp(1)}${nom}(${texNombre(x2, 3)})$.`
              } else {
                texteCorr += '.'
              }
              reponse = ['croissante', 'R', '<']
            } else {
              texteCorr += `<br>Or $${texNombre(x2, 1)}${sp(1)}${miseEnEvidence('\\boldsymbol{<}')}${sp(1)}${texNombre(x1, 1)}$,
          donc $${ecritureParentheseSiNegatif(x2)}^3${sp(1)}${miseEnEvidence('\\boldsymbol{<}')}${sp(1)}${ecritureParentheseSiNegatif(x1)}^3$`
              if (this.sup2 === 1) {
                texteCorr += `, soit $${nom}(${texNombre(x2, 3)})${sp(1)}${miseEnEvidence('\\boldsymbol{<}')}${sp(1)}${nom}(${texNombre(x1, 3)})$.`
              } else {
                texteCorr += '.'
              }
              reponse = ['croissante', 'R', '>']
            }
            variables.push(x1, x2)
          }
          break
        case 'typeE8': // fct valeur absolue
        default:
          {
            const signe = choice([1, -1])
            const premierNombrePositif = randint(1, 9) + randint(5, 9) / 10
            const ecart = (randint(1, 9) / 10) * choice([1, -1])
            x1 = signe * premierNombrePositif
            x2 = signe * (premierNombrePositif + ecart)
            const x1B = Math.round(x1 * 10) / 10
            const x2B = Math.round(x2 * 10) / 10
            const fonctionCroissante = signe > 0
            const premierEstInferieur = x1B < x2B
            const symboleReponse =
              premierEstInferieur === fonctionCroissante ? '<' : '>'
            nom = choice(nomF)

            if (this.sup2 === 1) {
              texte = ` Soit $${nom}$ la fonction valeur absolue.<br>
            Sans effectuer de calcul, comparer $${nom}(${texNombre(x1, 1)})$ et $${nom}(${texNombre(x2, 1)})$.`
            } else {
              texte = `Sans effectuer de calcul, comparer $\\left|${texNombre(x1, 1)}\\right|$ et $\\left|${texNombre(x2, 1)}\\right|$.`
            }

            texteCorr = `La fonction valeur absolue est strictement ${fonctionCroissante ? 'croissante' : 'décroissante'} sur $${fonctionCroissante ? ']0\\,;\\,+\\infty[' : ']-\\infty\\,;\\,0['}$. Les antécédents et les images sont donc rangés dans ${fonctionCroissante ? 'le même ordre' : "l'ordre inverse"}.<br>
            Or $${texNombre(Math.min(x1B, x2B), 1)}${sp(1)}${miseEnEvidence('\\boldsymbol{<}')}${sp(1)}${texNombre(Math.max(x1B, x2B), 1)}$.<br>`

            if (this.sup2 === 1) {
              texteCorr += `On en déduit que $${nom}(${texNombre(x1, 1)})${sp(1)}${miseEnEvidence(`\\boldsymbol{${symboleReponse}}`)}${sp(1)}${nom}(${texNombre(x2, 1)})$.`
            } else {
              texteCorr += `On en déduit que $\\left|${texNombre(x1, 1)}\\right|${sp(1)}${miseEnEvidence(`\\boldsymbol{${symboleReponse}}`)}${sp(1)}\\left|${texNombre(x2, 1)}\\right|$.`
            }

            reponse = [
              fonctionCroissante ? 'croissante' : 'decroissante',
              fonctionCroissante ? 'R+' : 'R-',
              symboleReponse,
            ]
            variables.push(x1, x2)
          }
          break
      }
      const choixListeDeroulante1 = [
        { label: 'Choisir', value: '' },
        { label: 'croissante', value: 'croissante' },
        { label: 'décroissante', value: 'decroissante' },
      ]
      const choixListeDeroulante2 = [
        { label: 'Choisir', value: '' },
        { latex: '\\mathbb{R}', value: 'R' },
        { latex: ']0\\,;\\,+\\infty[', value: 'R+' },
        { latex: ']-\\infty\\,;\\,0[', value: 'R-' },
      ]
      const choixListeDeroulante3 = [
        { label: 'Choisir', value: '' },
        { label: '<', value: '<' },
        { label: '>', value: '>' },
      ]
      if (this.interactif) {
        texte = texte.slice(0, -1)
        texte += ', et compléter ensuite la phrase suivante.'
        texte +=
          `<br><br>La fonction $${nom}$ est ` +
          (this.interactif
            ? choixDeroulant(this, 3 * i, { choices: choixListeDeroulante1 })
            : '$\\ldots\\ldots\\ldots\\ldots$') +
          ` sur ` +
          (this.interactif
            ? choixDeroulant(this, 3 * i + 1, {
                choices: choixListeDeroulante2,
              })
            : '$\\ldots\\ldots\\ldots\\ldots$') +
          `  donc $${nom}(${texNombre(x1, 3)})$` +
          (this.interactif
            ? choixDeroulant(this, 3 * i + 2, {
                choices: choixListeDeroulante3,
              })
            : '$\\ldots\\ldots\\ldots\\ldots$') +
          ` $${nom}(${texNombre(x2, 3)})$.`

        handleAnswers(
          this,
          3 * i,
          { reponse: { value: reponse[0], options: { texteSansCasse: true } } },
          { formatInteractif: 'liste-deroulante' },
        )
        handleAnswers(
          this,
          3 * i + 1,
          { reponse: { value: reponse[1], options: { texteSansCasse: true } } },
          { formatInteractif: 'liste-deroulante' },
        )
        handleAnswers(
          this,
          3 * i + 2,
          { reponse: { value: reponse[2], options: { texteSansCasse: true } } },
          { formatInteractif: 'liste-deroulante' },
        )
      }
      if (this.questionJamaisPosee(i, variables.map(String).join(''))) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
