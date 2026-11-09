import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { Polynome } from '../../lib/mathFonctions/Polynome'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { rienSi1 } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { lettreMinusculeDepuisChiffre } from '../../lib/outils/outilString'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
export const interactifReady = true

// export const titre = 'Calculer la dérivée de $x\mapsto u(ax + b)$'
export const titre = 'Dériver une fonction du type $u(ax + b)$'

/**
 * Calculer la dérivée de x -> f(ax+b)
 * @author Jean-Léon Henry

 */

export const uuid = '3391d'
export const refs = {
  'fr-fr': ['1AN14-7'],
  'fr-ch': ['3mA2-9', '4mDer-3'],
}

export default class DeriveeComposee extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Choix possibles pour $u$',
      'Nombres séparés par des tirets.\n' +
        ['Puissance', 'Racine', 'Inverse', 'Exponentielle', 'Mélange']
          .map((nom, index) => `${index + 1}. ${nom}`)
          .join('\n'),
    ]
    this.sup = 5
    // this.consigne = "Pour chacune des fonctions suivantes, dire sur quel ensemble elle est dérivable, puis déterminer l'expression de sa fonction dérivée."
    this.consigne =
      "Pour chacune des fonctions suivantes, déterminer l'expression de sa fonction dérivée."
    this.nbQuestions = 5
    // Sortie LaTeX
    this.nbCols = 2 // Nombre de colonnes
    this.nbColsCorr = 2 // Nombre de colonnes dans la correction
    // On modifie les règles de simplifications par défaut de math.js pour éviter 10x+10 = 10(x+1) et -4x=(-4x)
  }

  nouvelleVersion() {
    const listeValeurs = ['monome', 'racine', 'inv', 'exp']
    type TypeDeFonction = (typeof listeValeurs)[number]
    const listeTypeDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 4,
      melange: 5,
      defaut: 5,
      nbQuestions: this.nbQuestions,
      listeOfCase: listeValeurs,
    })
      .map(String)
      .filter((x): x is TypeDeFonction =>
        listeValeurs.includes(x as TypeDeFonction),
      )
    const listeTypeDeQuestions = combinaisonListes(
      listeTypeDeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let exprF = ''
      let expression = ''
      // On génère des fonctions qui pourrait servir
      const coeffs = new Array(randint(2, 9))
      coeffs.fill(0)
      coeffs.push(1)
      const dictFonctions: Record<TypeDeFonction, string | Polynome> = {
        exp: 'e^',
        racine: '\\sqrt',
        inv: '1/',
        monome: new Polynome({ coeffs }),
      }
      const polAff = new Polynome({ rand: true, deg: 1 })
      const a: number = Number(polAff.monomes[1])
      const b: number = Number(polAff.monomes[0])
      const typeF: TypeDeFonction = listeTypeDeQuestions[i]
      const f = dictFonctions[typeF]
      // Expression finale de la fonction
      exprF =
        typeF === 'monome'
          ? (f as Polynome).toMathExpr()
          : typeF === 'inv'
            ? '\\frac{1}{x}'
            : (f as string) + '{x}'
      expression =
        typeF === 'monome'
          ? `${rienSi1((f as Polynome).monomes[(f as Polynome).deg])}(${polAff})^${(f as Polynome).deg}`
          : typeF === 'inv'
            ? `\\frac{1}{${polAff}}`
            : `${f}{${polAff}}`
      let value = ''

      // Enoncé
      const nameF = lettreMinusculeDepuisChiffre(i + 6)
      texte = `$${nameF}(x)=${expression}$`
      // Correction
      texteCorr =
        'On rappelle le cours. Si $x$ est un nombre réel tel que $u$ soit dérivable en $ax+b$, alors $v:x\\mapsto u(ax+b)$ est dérivable en $x$ et on a :'
      texteCorr += "\\[v'(x)=a\\times u'(ax+b).\\]"
      let deriveeF = ''
      // Déterminons la dérivée de u
      switch (typeF) {
        case 'exp':
          deriveeF = 'e^x'
          break
        case 'inv':
          deriveeF = '\\frac{-1}{x^2}'
          break
        case 'racine':
          deriveeF = '\\frac{1}{2\\sqrt{x}}'
          break
        case 'monome':
          deriveeF = (f as Polynome).derivee().toLatex()
          break
      }
      texteCorr += `Ici : \\[\\begin{aligned}u(x)&=${exprF}\\\\ u^\\prime(x)&=${deriveeF}\\\\a&=${a}\\\\b&=${b}.\\end{aligned}\\]`
      texteCorr += `Soit $x$ un réel de l'ensemble de dérivabilité de $${nameF}$. On a, en appliquant la formule ci-dessus : `
      switch (typeF) {
        case 'exp':
          texteCorr += `\\[${nameF}'(x)=${miseEnEvidence(`${rienSi1(a)}e^{${polAff}}`)}.\\]`
          value = `${rienSi1(a)}e^{${polAff}}`
          break
        case 'inv':
          texteCorr += `\\[${nameF}'(x)=${a}\\times ${`\\frac{-1}{(${polAff})^2}`}.\\]`
          texteCorr += "D'où, en simplifiant : "
          texteCorr += `\\[${nameF}'(x)=${miseEnEvidence(`\\frac{${-a}}{(${polAff})^2}`)}\\].`
          value = `${`\\frac{${-a}}{(${polAff})^2}`}`
          break
        case 'racine': {
          texteCorr += `\\[${nameF}'(x)=${a}\\times${`\\frac{1}{2\\sqrt{${polAff}}}`}.\\]`
          texteCorr += "D'où, en simplifiant :"
          const num = a % 2 === 0 ? a / 2 : a
          const den = `${a % 2 === 0 ? '' : '2'}\\sqrt{${polAff}}`
          texteCorr += `\\[${nameF}'(x)=${miseEnEvidence(`\\frac{${num}}{${den}}`)}.\\]`
          value = `${`\\frac{${num}}{${den}}`}`
          break
        }
        case 'monome':
          texteCorr += `\\[${nameF}'(x)=${a}\\times ${`${(f as Polynome).deg}(${polAff})${(f as Polynome).deg === 2 ? '' : `^{${(f as Polynome).deg - 1}}`}`}.\\]`
          texteCorr += "D'où, en simplifiant : "

          if ((f as Polynome).deg !== 2) {
            texteCorr += `\\[${nameF}'(x)=${miseEnEvidence(`${a * (f as Polynome).deg}(${polAff})${(f as Polynome).deg === 2 ? '' : `^{${(f as Polynome).deg - 1}}`}`)}.\\]`
            value = `${a * (f as Polynome).deg}(${polAff})${(f as Polynome).deg === 2 ? '' : `^{${(f as Polynome).deg - 1}}`}`
          } else {
            texteCorr += `\\[${nameF}'(x)=${a * (f as Polynome).deg}(${polAff})${(f as Polynome).deg === 2 ? '' : `^{${(f as Polynome).deg - 1}}`}.\\]`
            texteCorr += 'On développe et on réduit pour obtenir  :'
            texteCorr += `\\[${nameF}'(x)=${miseEnEvidence(`${polAff.multiply(2 * a)}`)}.\\]`
            value = `${polAff.multiply(2 * a)}`
          }
          break
        default:
          texteCorr += 'Correction non encore implémentée.'
          break
      }
      texte =
        texte.replaceAll('\\frac', '\\dfrac') +
        ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierFonctionsTerminales,
          { texteAvant: `<br>$${nameF}'(x)=$` },
        )
      texteCorr = texteCorr.replaceAll('\\frac', '\\dfrac')

      if (listeValeurs.indexOf(expression) === -1) {
        listeValeurs.push(expression)
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr

        handleAnswers(this, i, {
          reponse: { value, options: { calculFormel: true } },
        })
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
