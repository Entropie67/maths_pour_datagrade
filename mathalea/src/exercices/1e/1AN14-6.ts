import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ce from '../../lib/interactif/comparisonFunctions'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { Polynome } from '../../lib/mathFonctions/Polynome'
import { ecritureAlgebrique } from '../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Dériver une fonction du type $\\dfrac{u}{v}$'
export const dateDePublication = '22/01/2022'
export const dateDeModifImportante = '27/01/2026'
export const interactifReady = true

/**
 * Calculer la dérivée d'un quotient
 * @author Jean-Léon Henry
 * Finalisé par Jean-claude Lhote

 */

export const uuid = 'b32f2'
export const refs = {
  'fr-fr': ['1AN14-6', 'TSA3-12', 'TCA7-12'],
  'fr-ch': [],
}

type TypeDeQuotient =
  'poly1a/poly1' | 'mon/poly1' | 'poly/poly1' | 'mon/poly2centre' | 'exp/poly1'
type TypeDeFonction =
  'mon' | 'racine' | 'poly1' | 'poly2centre' | 'poly' | 'exp'

export default class DeriveeQuotient extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Types de fonctions : ',
      'Nombres séparés par des tirets :\n1 : (ax+b)/(cx+d)\n2 : ax^n/(cx+d)\n3 : (ax²+bx+c)/(ex+f)\n4 ax^n/(ax²+bx+c)\n5 : Mélange',
    ]
    this.besoinFormulaire2CaseACocher = [
      'Montrer que $\\ldots$ (non interactif)',
      false,
    ]
    this.nbQuestions = 4
    // Sortie LaTeX
    this.nbCols = 2 // Nombre de colonnes
    this.nbColsCorr = 2 // Nombre de colonnes dans la correction
    this.sup = '5'
    this.sup2 = false
  }

  nouvelleVersion() {
    // Consigne adaptée selon le mode
    if (this.sup2) {
      this.consigne =
        'Dans chacun des cas suivants, on admet que la fonction est définie et dérivable sur un intervalle $I$.'
    } else {
      this.consigne =
        'Dans chacun des cas suivants, on admet que la fonction est définie et dérivable sur un intervalle $I$.<br> Déterminer une expression de la fonction dérivée sur $I$.'
    }

    const listeValeurs: string[] = [] // Les questions sont différentes du fait du nom de la fonction, donc on stocke les valeurs
    if (this.sup2) {
      this.interactifReady = false
    } else {
      this.interactifReady = true
    }
    // Types d'énoncés
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      nbQuestions: this.nbQuestions,
      listeOfCase: [
        'poly1a/poly1',
        'mon/poly1',
        'poly/poly1',
        'mon/poly2centre',
      ],
      min: 1,
      max: 4,
      melange: 5,
      defaut: 1,
    }).map(String) as TypeDeQuotient[]
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let expression = ''
      let maReponse = ''
      let isQuotientConstant = false
      do {
        // On créé les coefficients d'un monome x^m qu'ont va générer
        const coeffs = new Array(randint(2, 9)) // Au moins 2 coeffs, i.e. deg >= 1
        coeffs.fill(0)
        coeffs.push(1) // on ajoute un coeff donc deg >= 2
        // On génère des fonctions qui pourrait servir
        const dictFonctions = {
          exp: 'e^x',
          mon: new Polynome({ coeffs }),
          poly1: new Polynome({ rand: true, deg: 1 }),
          poly1a: new Polynome({ rand: true, deg: 1 }),
          poly2centre: new Polynome({
            rand: true,
            coeffs: [[10, true], 0, [10, true]],
          }),
          poly: new Polynome({ rand: true, deg: 2 }),
          monome2: new Polynome({ rand: true, coeffs: [0, 0, [10, true]] }),
          racine: 'sqrt(x)',
        }
        const listeTypeFonctions = listeTypeDeQuestions[i].split(
          '/',
        ) as TypeDeFonction[]
        const typeNum = listeTypeFonctions[0]
        const typeDen = listeTypeFonctions[1]
        // Extraction des fonctions
        const fNum = dictFonctions[typeNum]
        const fDen = dictFonctions[typeDen]
        const termeNum = ce.parse(
          ['pol', 'mon'].includes(typeNum.slice(0, 3))
            ? (fNum as Polynome).toMathExpr()
            : (fNum as string),
        )
        const termeDen = ce.parse(
          ['pol', 'mon'].includes(typeDen.slice(0, 3))
            ? (fDen as Polynome).toMathExpr()
            : (fDen as string),
        )
        isQuotientConstant = ce
          .expr(['Divide', termeNum, termeDen])
          .simplify().isConstant
        if (isQuotientConstant) continue
        expression = `(${termeNum.latex})/(${termeDen.latex})`

        // Énoncé
        const nameF = [
          'f',
          'g',
          'h',
          'l',
          'm',
          'p',
          'r',
          's',
          't',
          'u',
          'v',
          'w',
          'b',
          'c',
          'd',
          'e',
        ][i % 16]
        texte = ''
        texte += `$${nameF}(x)=${ce.parse(expression).latex}$`
        // Correction
        const derNum = ce.expr(['D', termeNum, 'x']).evaluate()
        const derDen = ce.expr(['D', termeDen, 'x']).evaluate()
        texteCorr = ''
        texteCorr +=
          "On rappelle le cours : si $u,v$ sont deux fonctions dérivables sur un même intervalle $I$, et que $v$ ne s'annule pas sur $I$ alors leur quotient est dérivable sur $I$ et on a la formule : "
        texteCorr +=
          "\\[\\left(\\frac{u}{v}\\right)'=\\frac{u'\\times v-u\\times v'}{v^2}.\\]"
        texteCorr += `Ici $${nameF}=\\frac{u}{v}$ avec : `
        texteCorr += `\\[\\begin{aligned}u(x)&=${termeNum.latex},\\ u'(x)=${derNum.latex}\\\\ v(x)&=${termeDen.latex},\\ v'(x)=${derDen.latex}.\\end{aligned}\\]`

        switch (listeTypeDeQuestions[i]) {
          case 'poly1a/poly1':
          case 'poly/poly1': {
            // fDen = cx+d
            const c = (fDen as Polynome).monomes[1]
            const d = (fDen as Polynome).monomes[0]

            texteCorr += 'On obtient alors : '
            if (Number((fNum as Polynome).deg) === 1) {
              // fNum = ax+b
              const a = (fNum as Polynome).monomes[1]
              const b = (fNum as Polynome).monomes[0]
              texteCorr += `\\[${nameF}'(x)=\\frac{${a}(${termeDen.latex})-(${termeNum.latex})\\times${Number(c) < 0 ? `(${c})` : c}}{(${termeDen.latex})^2}.\\]`
              texteCorr += "D'où, en développant le numérateur : "
              texteCorr += `\\[${nameF}'(x)=\\frac{${(fDen as Polynome).multiply(a)}-(${(fNum as Polynome).multiply(c)})}{(${termeDen.latex})^2}.\\]`
              texteCorr += 'Les termes en $x$ se compensent et on obtient : '
              texteCorr += `\\[${nameF}'(x)=\\frac{${Number(a) * Number(d)}${ecritureAlgebrique(-c * Number(b))}}{(${termeDen.latex})^2}.\\]`
              texteCorr += "C'est-à-dire : "
              texteCorr += `$${nameF}'(x)=${miseEnEvidence(`\\frac{${Number(a) * Number(d) - Number(c) * Number(b)}}{(${termeDen.latex})^2}`)}$.`
              maReponse = `\\frac{${Number(a) * Number(d) - Number(c) * Number(b)}}{(${termeDen.latex})^2}`
            } else if ((fNum as Polynome).deg === 2) {
              texteCorr += `\\[${nameF}'(x)=\\frac{(${(fNum as Polynome).derivee()})(${termeDen.latex})-(${termeNum.latex})\\times${Number(c) < 0 ? `(${c})` : c}}{(${termeDen.latex})^2}.\\]`
              texteCorr += "D'où, en développant le numérateur : "
              const polyInterm = (fNum as Polynome)
                .derivee()
                .multiply(fDen as Polynome)
              texteCorr += `\\[${nameF}'(x)=\\frac{${polyInterm}-(${(fNum as Polynome).multiply(c)})}{(${termeDen.latex})^2}.\\]`
              texteCorr += 'On réduit le numérateur pour obtenir : '
              maReponse = `\\frac{${polyInterm.add((fNum as Polynome).multiply(-c))}}{(${termeDen.latex})^2}`
              texteCorr += ` $${nameF}'(x)=${miseEnEvidence(`${maReponse}`)}$.<br>`
              texteCorr += `${texteEnCouleurEtGras('Remarque :', 'black')} la plupart du temps, on veut le signe de la dérivée. Il serait donc plus logique de factoriser le numérateur si possible, mais cela sort du cadre de cet exercice.`
            }
            break
          }
          case 'mon/poly2centre':
            {
              const fDenDer = (fDen as Polynome).derivee().toLatex()

              texteCorr += 'On obtient alors : '
              texteCorr += `\\[${nameF}'(x)=\\frac{${(fNum as Polynome).derivee()}(${fDen})-${fNum}\\times${fDenDer.startsWith('-') ? `(${fDenDer})` : `${fDenDer}`}}{(${termeDen.latex})^2}.\\]`
              texteCorr += "D'où, en développant le numérateur : "
              texteCorr += `\\[${nameF}'(x)=\\frac{${(fNum as Polynome).derivee().multiply(fDen as Polynome)}${(fNum as Polynome).multiply((fDen as Polynome).derivee().multiply(-1)).toMathExpr(true)}}{(${termeDen.latex})^2}.\\]`
              texteCorr += 'On simplifie pour obtenir :'
              maReponse = `\\frac{${(fNum as Polynome)
                .derivee()
                .multiply(fDen as Polynome)
                .add(
                  (fNum as Polynome).multiply(
                    (fDen as Polynome).derivee().multiply(-1),
                  ),
                )}}{(${termeDen.latex})^2}`
              texteCorr += ` $${nameF}'(x)=${miseEnEvidence(`${maReponse}`)}$.<br>`
              texteCorr += `${texteEnCouleurEtGras('Remarque :', 'black')} la plupart du temps, on veut le signe de la dérivée. Il serait donc plus logique de factoriser le numérateur, mais cela sort du cadre de cet exercice.`
            }
            break
          case 'mon/poly1': {
            // fDen = cx+d
            const c = (fDen as Polynome).monomes[1]

            texteCorr += 'On obtient alors : '
            texteCorr += `\\[${nameF}'(x)=\\frac{${(fNum as Polynome).derivee()}(${fDen})-${fNum}\\times${Number(c) < 0 ? `(${c})` : c}}{(${termeDen.latex})^2}.\\]`
            texteCorr += "D'où, en développant le numérateur : "
            texteCorr += `\\[${nameF}'(x)=\\frac{${(fNum as Polynome).derivee().multiply(fDen as Polynome)}${(fNum as Polynome).multiply(-c).toMathExpr(true)}}{(${termeDen.latex})^2}.\\]`
            texteCorr += 'On simplifie pour obtenir :'
            maReponse = `\\frac{${(fNum as Polynome)
              .derivee()
              .multiply(fDen as Polynome)
              .add((fNum as Polynome).multiply(-c))}}{(${termeDen.latex})^2}`
            texteCorr += ` $${nameF}'(x)=${miseEnEvidence(`${maReponse}`)}$.<br>`
            texteCorr += `${texteEnCouleurEtGras('Remarque :', 'black')} la plupart du temps, on veut le signe de la dérivée. Il serait donc plus logique de factoriser le numérateur, mais cela sort du cadre de cet exercice.`
            break
          }
          case 'exp/poly1': {
            // fDen = cx+d
            const c = (fDen as Polynome).monomes[1]
            const d = (fDen as Polynome).monomes[0]

            texteCorr += 'On obtient alors : '
            texteCorr += `\\[${nameF}'(x)=\\frac{${fNum}(${fDen})-${fNum}\\times${Number(c) < 0 ? `(${c})` : c}}{(${termeDen.latex})^2}.\\]`
            texteCorr += 'On factorise par $e^x$, et on obtient : '
            texteCorr += `\\[${nameF}'(x)=\\frac{${fNum}(${fDen}${ecritureAlgebrique(-c)})}{(${termeDen.latex})^2},\\]`
            texteCorr += 'ce qui donne, après réduction : '
            maReponse = `\\frac{${fNum}(${Polynome.print([Number(d) - Number(c), Number(c)])})}{(${termeDen.latex})^2}`
            texteCorr += `$${miseEnEvidence(`${nameF}'(x)=${maReponse}`, 'black')}$.`
            break
          }
          default:
            texteCorr += ''
            break
        }
        texte = texte.replaceAll('\\frac', '\\dfrac')
        if (this.sup2) {
          texte += `<br>Montrer que $${nameF}^\\prime(x)=${maReponse.replaceAll('\\frac', '\\dfrac')}$.`
        }
        texteCorr = texteCorr.replaceAll('\\frac', '\\dfrac')
        if (this.interactif && !this.sup2) {
          texte +=
            '<br>' +
            ajouteChampTexteMathLive(this, i, KeyboardType.lyceeClassique, {
              texteAvant: `$${nameF}'(x)=$`,
            })
        }
      } while (isQuotientConstant)
      if (listeValeurs.indexOf(expression) === -1) {
        listeValeurs.push(expression)
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr

        // « Montrer que… » : aucun champ, donc pas de réponse attendue.
        if (!this.sup2) {
          handleAnswers(this, i, {
            reponse: { value: maReponse, options: { fonction: true } },
          })
        }
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
