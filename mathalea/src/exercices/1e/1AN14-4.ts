import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { Polynome } from '../../lib/mathFonctions/Polynome'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { rienSi1 } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const titre = 'Dériver une fonction du type $u + v$'
export const interactifReady = true

export const uuid = 'a83c0'
export const refs = {
  'fr-fr': ['1AN14-4'],
  'fr-ch': ['3mA2-3'],
}
export const dateDePublication = '17/04/2024'
export const dateDeModifImportante = '28/01/2026'

/**
 * Calculer la dérivée d'une somme
 * @author Jean-claude Lhote
 *
 */
class DerivationSommesSimples extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Types de fonctions',
      'Nombres séparés par des tirets :\n1 : Polynôme et inverse\n2 : Polynôme et racine carrée\n3 : Inverse et racine carrée\n4 : Les trois réunis\n5 : Mélange',
    ]
    this.sup = '5'
    this.nbQuestions = 5
    this.correctionDetailleeDisponible = true
  }

  nouvelleVersion() {
    // Consigne adaptative
    if (this.nbQuestions > 1) {
      this.consigne =
        'Dans chacun des cas suivants, on admet que la fonction est définie et dérivable sur un intervalle $I$. <br>Déterminer une expression de la fonction dérivée sur $I$.'
    } else {
      this.consigne =
        'On admet que la fonction est définie et dérivable sur un intervalle $I$. <br>Déterminer une expression de la fonction dérivée sur $I$.'
    }

    const listeTypeDeQuestion = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 4,
      defaut: 1,
      melange: 5,
      nbQuestions: this.nbQuestions,
    })
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const lesFonctions: { fonction: string; derivee: string }[] = []
      const [a, b, c] = choice([
        [0, 0, randint(-5, 5, [-1, 0, 1])],
        [0, randint(-5, 5, [-1, 0, 1]), 0],
        [0, randint(-5, 5, [-1, 0, 1]), randint(-5, 5, [-1, 0, 1])],
        [
          randint(-5, 5, [-1, 0, 1]),
          randint(-5, 5, [-1, 0, 1]),
          randint(-5, 5, [-1, 0, 1]),
        ],
      ])

      switch (Number(listeTypeDeQuestion[i])) {
        case 2:
          {
            const laFonction1 = new Polynome({
              rand: false,
              deg: 2,
              coeffs: [a, b, c],
            })
            const k = choice([1, 3, 5, 7, -1, -3, -5, -7])
            lesFonctions.push(
              {
                fonction: laFonction1.toLatex(),
                derivee: laFonction1.derivee().toLatex(),
              },
              {
                fonction: `${rienSi1(k)}\\sqrt{x}`,
                derivee: `${k < 0 ? '-' : ''}\\dfrac{${String(Math.abs(k))}}{2\\sqrt{x}}`,
              },
            )
          }
          break
        case 3:
          {
            const k = randint(-5, 5, 0)
            const k2 = choice([1, 3, 5, 7, -1, -3, -5, -7])
            lesFonctions.push(
              {
                fonction: `${k < 0 ? '-' : ''}\\dfrac{${String(Math.abs(k))}}{x}`,
                derivee: `${k > 0 ? '-' : ''}\\dfrac{${String(Math.abs(k))}}{x^2}`,
              },
              {
                fonction: `${rienSi1(k2)}\\sqrt{x}`,
                derivee: `${k2 < 0 ? '-' : ''}\\dfrac{${String(Math.abs(k2))}}{2\\sqrt{x}}`,
              },
            )
          }
          break
        case 4:
          {
            const laFonction1 = new Polynome({
              rand: false,
              deg: 2,
              coeffs: [a, b, c],
            })
            const k = randint(-5, 5, 0)
            const k2 = randint(-5, 5, [0, k])
            lesFonctions.push(
              {
                fonction: laFonction1.toLatex(),
                derivee: laFonction1.derivee().toLatex(),
              },
              {
                fonction: `${k < 0 ? '-' : ''}\\dfrac{${String(Math.abs(k))}}{x}`,
                derivee: `${k > 0 ? '-' : ''}\\dfrac{${String(Math.abs(k))}}{x^2}`,
              },
              {
                fonction: `${rienSi1(k2)}\\sqrt{x}`,
                derivee: `${k2 < 0 ? '-' : ''}\\dfrac{${String(Math.abs(k2))}}{2\\sqrt{x}}`,
              },
            )
          }
          break
        case 1:
        default:
          {
            const laFonction1 = new Polynome({ rand: false, coeffs: [a, b, c] })
            const k = randint(-9, 9, 0)
            lesFonctions.push(
              {
                fonction: laFonction1.toLatex(),
                derivee: laFonction1.derivee().toLatex(),
              },
              {
                fonction: `${k < 0 ? '-' : ''}\\dfrac{${String(Math.abs(k))}}{x}`,
                derivee: `${k > 0 ? '-' : ''}\\dfrac{${String(Math.abs(k))}}{x^2}`,
              },
            )
          }
          break
      }
      const fonctionsMelangees = shuffle(lesFonctions)
      let laFonction = ''
      for (const f of fonctionsMelangees) {
        if (f.fonction.startsWith('+')) f.fonction = f.fonction.substring(1)
        if (!f.fonction.startsWith('-')) {
          if (laFonction !== '') laFonction += '+'
        }
        laFonction += f.fonction
      }
      let laDerivee = ''
      for (const f of fonctionsMelangees) {
        if (f.derivee.startsWith('+')) f.derivee = f.derivee.substring(1)
        if (!f.derivee.startsWith('-')) {
          if (laDerivee !== '') laDerivee += '+'
        }
        laDerivee += f.derivee
      }
      const texte =
        `$f(x)=${laFonction}$<br>` +
        ajouteChampTexteMathLive(this, i, KeyboardType.lyceeClassique, {
          texteAvant: "$f'(x)=$",
        })
      let texteCorr = ''
      if (this.correctionDetaillee) {
        // Notation avec u, v, w
        const nomsFonctions = ['u', 'v', 'w']
        texteCorr += `La fonction $f$ est de la forme $f=${nomsFonctions.slice(0, fonctionsMelangees.length).join('+')}$ avec :<br>`
        texteCorr += '\\[\\begin{aligned}'
        for (let j = 0; j < fonctionsMelangees.length; j++) {
          const nomFonction = nomsFonctions[j]
          texteCorr += `${nomFonction}(x)&=${fonctionsMelangees[j].fonction},\\ ${nomFonction}'(x)=${fonctionsMelangees[j].derivee}`
          if (j < fonctionsMelangees.length - 1) texteCorr += '\\\\'
        }
        texteCorr += '\\end{aligned}\\]'
        texteCorr += `On utilise la formule : $(${nomsFonctions.slice(0, fonctionsMelangees.length).join('+')})^\\prime=${nomsFonctions
          .slice(0, fonctionsMelangees.length)
          .map((n) => n + '^\\prime')
          .join('+')}$.<br>`
        texteCorr += 'On obtient : '
      } else {
        texteCorr += `L'expression de la dérivée de la fonction $f$ définie par $f(x)=${laFonction}$ est :<br>`
      }
      texteCorr += `$f'(x)=${miseEnEvidence(laDerivee)}$.<br>`

      if (this.questionJamaisPosee(i, laFonction)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr

        handleAnswers(this, i, {
          reponse: {
            value: laDerivee,
            options: { fonction: true, variable: 'x' },
          },
        })
        i++
        cpt = 0
      }
      cpt++
    }
  }
}

export default DerivationSommesSimples
