import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { Polynome } from '../../lib/mathFonctions/Polynome'
import { choice } from '../../lib/outils/arrayOutils'
import {
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Calculer la dérivée d'une fonction avec $\\mathrm{e}^u$"
export const dateDePublication = '06/08/2025'
export const dateDeModifImportante = '20/10/2026'
export const interactifReady = true

/**
 * Calculer la dérivée d'une fonction avec exp
 * @author Gilles Mora et Stéphane Guyon
 */

export const uuid = '0e5fa'

export const refs = {
  'fr-fr': ['TSA3-26', 'TCA7-26'],
  'fr-ch': [''],
}

export default class DeriveeExp1AN313 extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireTexte = [
      'Choix des questions',
      'Nombres séparés par des tirets :\n1 : $\\mathrm{e}^{ax+b}$\n2 : $\\mathrm{e}^{ax^2+bx+c}$  \n3 : $(a x+b)\\mathrm{e}^{kx}$   \n4 : Mélange',
    ]
    this.sup = '4'
    this.spacing = 1.5
    this.spacingCorr = 1.5
  }

  nouvelleVersion() {
    const listeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: this.nbQuestions,
    })
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let value = ''
      const texteIntro =
        'On considère la fonction $f$ définie sur $\\mathbb{R}$ par :'
      switch (listeDeQuestions[i]) {
        case 1: // exp(u) avec u affine
          {
            const a = randint(-10, 10, [0])
            const b = randint(-10, 10, 0)
            texte =
              texteIntro +
              `$f(x)=\\mathrm{e}^{${reduireAxPlusB(a, b)}}$.<br>
             Calculer $f'(x)$.`
            texteCorr = `La fonction $f$ est dérivable sur $\\mathbb{R}$ comme composée de fonctions dérivables sur $\\mathbb{R}$.<br>
            $f$ est de la forme $\\mathrm{e}^u$ avec $u(x)=${reduireAxPlusB(a, b)}$, donc sa fonction dérivée est donnée par $f'=u'\\mathrm{e}^u$.<br><br>
            Pour tout $x$ de $\\mathbb{R}$, $f'(x)=${miseEnEvidence(`${rienSi1(a)}e^{${reduireAxPlusB(a, b)}}`)}$.`
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierFonctionsTerminales,
              { texteAvant: "<br>$f'(x)=$" },
            )
            value = `${rienSi1(a)}e^{${reduireAxPlusB(a, b)}}`
          }
          handleAnswers(this, i, { reponse: { value } })
          break

        case 2: // exp(ax^2+bx+c)
          {
            const listeabc = [
              [randint(-10, 10, 0), 0, 0],
              [randint(-2, 2, 0), randint(-2, 2, 0), 0],
              [randint(-2, 2, 0), 0, randint(-2, 2, 0)],
              [randint(-2, 2, 0), randint(-5, 5, 0), randint(-2, 2, 0)],
              [randint(-30, 30, [-20, -10, 0, 10, 20]) / 10, 0, 0],
            ] // a puis b
            const abc = choice(listeabc)
            const poly = new Polynome({
              rand: true,
              coeffs: [abc[2], abc[1], abc[0]],
            })
            const derivee = poly.derivee()
            texte =
              texteIntro +
              `$f(x)=\\mathrm{e}^{${poly}}$.<br>
             Calculer $f'(x)$.`
            texteCorr = `La fonction $f$ est dérivable sur $\\mathbb{R}$ comme composée de fonctions dérivables sur $\\mathbb{R}$.<br>
            $f$ est de la forme $\\mathrm{e}^u$ avec $u(x)=${poly}$, donc sa fonction dérivée est donnée par $f'=u'\\mathrm{e}^u$.<br><br>
            Pour tout $x$ de $\\mathbb{R}$, `
            texteCorr += `${derivee.isMon() ? `$f'(x)=${miseEnEvidence(`${derivee}\\mathrm{e}^{${poly}}`)}$` : `$f'(x)=${miseEnEvidence(`(${derivee})\\mathrm{e}^{${poly}}`)}$`}.`
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierFonctionsTerminales,
              { texteAvant: "<br>$f'(x)=$" },
            )
            value = derivee.isMon()
              ? `${derivee}e^{${poly}}`
              : `(${derivee})e^{${poly}}`
          }
          handleAnswers(this, i, { reponse: { value } })
          break

        case 3: // (ax+b)e^mx
        default:
          {
            const a = randint(-5, 5, [0])
            const b = randint(-5, 5, [a, -a])
            const m = randint(-5, 5, [0, 1])
            texteCorr = `La fonction $f$ est dérivable sur $\\mathbb{R}$ comme produit de fonctions dérivables sur $\\mathbb{R}$.<br>
            $f$ est de la forme $u\\times v$ avec $u(x)=${reduireAxPlusB(a, b)}$ et $v(x)=\\mathrm{e}^{${rienSi1(m)}x}$, donc sa fonction dérivée est donnée par
            $f'=u'\\times v+ u\\times v'$.<br><br>
            Pour tout $x$ de $\\mathbb{R}$, <br>`

            texte =
              texteIntro +
              ` $f(x)=(${reduireAxPlusB(a, b)})\\mathrm{e}^{${rienSi1(m)}x}$.<br>
            Calculer $f'(x)$ et écrire son expression sous forme factorisée.`
            texteCorr += `
                $\\begin{aligned}
                f'(x)&=\\underbrace{${a}}_{u'(x)}\\times \\underbrace{\\mathrm{e}^{${rienSi1(m)}x}}_{v(x)}+\\underbrace{(${reduireAxPlusB(a, b)})}_{u(x)}\\times \\underbrace{${rienSi1(m)}\\mathrm{e}^{${rienSi1(m)}x}}_{v'(x)}\\\\
                &=\\mathrm{e}^{${rienSi1(m)}x}\\left(${a}+${ecritureParentheseSiNegatif(m)}(${reduireAxPlusB(a, b)})\\right)\\\\
                &= ${miseEnEvidence(`\\mathrm{e}^{${rienSi1(m)}x}(${reduireAxPlusB(m * a, a + m * b)})`)}.
                \\end{aligned}$`
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierFonctionsTerminales,
              { texteAvant: "<br>$f'(x)=$" },
            )
            value = `(${reduireAxPlusB(m * a, a + m * b)})e^{${rienSi1(m)}x}`
            handleAnswers(this, i, {
              reponse: { value, options: { factorisation: true } },
            })
          }
          break
      }
      if (this.questionJamaisPosee(i, value)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
