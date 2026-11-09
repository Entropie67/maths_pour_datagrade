import {
  addTableauSignesVariations,
  creerTableauSignesVariations,
} from '../../lib/customElements/TableauSignesVariationsElement'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { isEqual, seq } from '../../lib/interactif/checks'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  celluleFleche,
  celluleValeur,
  colonne,
  configCorrige,
  ligneVariation,
} from '../../lib/interactif/tableauSignesVariations/helpers'
import type { TableauSVConfig } from '../../lib/interactif/tableauSignesVariations/types'
import { Polynome } from '../../lib/mathFonctions/Polynome'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import { createList } from '../../lib/format/lists'
import { lampeMessage } from '../../lib/format/message'
import Exercice from '../Exercice'

export const titre =
  "Étudier les variations d'une fonction du type $u^n$, $\\mathrm{e}^u$ ou $\\sqrt{u}$"
export const dateDePublication = '02/11/2026'
export const interactifReady = true

export const uuid = '4336f'

export const refs = {
  'fr-fr': ['TSA3-32'],
  'fr-ch': [],
}

type TypeDeFonction = 'puissance' | 'exp' | 'racine'

/**
 * Calculer la dérivée de u^n, e^u ou √u (u du second degré), puis en déduire
 * le tableau de variations.
 * @author Arnaud Meistermann
 */
export default class VariationsFonctionComposee extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Type de fonction',
      [
        'Nombres séparés par des tirets :',
        '1 : $u^n$',
        '2 : $\\mathrm{e}^u$',
        '3 : $\\sqrt{u}$',
        '4 : Mélange',
      ].join('\n'),
    ]
    this.sup = '4'
    // Nombre de fonctions étudiées : chacune donne deux questions
    // (dérivée puis tableau de variations)
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const listeTypes = combinaisonListes(
      gestionnaireFormulaireTexte({
        saisie: this.sup,
        min: 1,
        max: 3,
        melange: 4,
        defaut: 4,
        nbQuestions: this.nbQuestions,
        listeOfCase: ['puissance', 'exp', 'racine'],
      }) as TypeDeFonction[],
      this.nbQuestions,
    )
    this.listeQuestions = []
    this.listeCorrections = []
    for (let q = 0, cpt = 0; q < this.nbQuestions && cpt < 50; cpt++) {
      const typeF = listeTypes[q]
      // Pas de i ni de j, réservés aux complexes et aux indices
      const nomF = ['f', 'g', 'h', 'k', 'p', 'q', 'r', 's', 'v', 'w'][q % 10]
      // a) dérivée et b) tableau : deux réponses par question, aux index 2q et 2q+1
      const iDerivee = 2 * q
      const iTableau = 2 * q + 1
      const sortie = this.etudieFonction(typeF, nomF, iDerivee, iTableau)
      if (this.questionJamaisPosee(q, ...sortie.cle)) {
        // Le tableau interactif n'entre pas dans createQuestion({ subQuestions }) :
        // on numérote a), b) avec la même liste
        this.listeQuestions.push(
          sortie.introduction +
            createList({
              items: [sortie.texteDerivee, sortie.texteTableau],
              style: 'alpha',
            }),
        )
        this.listeCorrections.push(
          createList({
            items: [sortie.correctionDerivee, sortie.correctionTableau],
            style: 'alpha',
          }),
        )
        q++
      }
    }
    listeQuestionsToContenu(this)
  }

  /** Tire une fonction, renseigne les réponses des deux questions et renvoie leurs textes. */
  etudieFonction(
    typeF: TypeDeFonction,
    nomF: string,
    iDerivee: number,
    iTableau: number,
  ) {
    // u(x) = α(x-x0)² + k : u'(x) = 2α(x-x0) change de signe en x0
    const x0 = randint(-3, 3)
    let alpha = 1
    let k = 0
    let n = 1
    switch (typeF) {
      case 'puissance':
        n = choice([2, 3, 4, 5])
        // n pair : u > 0 ; n impair : u ne s'annule pas (αk > 0)
        alpha = n % 2 === 0 ? 1 : choice([-1, 1])
        k = alpha * randint(1, 2)
        break
      case 'exp':
        alpha = choice([-1, 1])
        k = randint(-2, 2)
        break
      case 'racine':
        k = choice([1, 4, 9])
        break
    }
    const b = -2 * alpha * x0
    const c = alpha * x0 * x0 + k
    const u = new Polynome({ coeffs: [c, b, alpha] })
    const uPrime = u.derivee()
    const uTex = u.toLatex()
    const uPrimeTex = uPrime.toLatex()
    // u'(x) = 2αx si x0 = 0 : un seul monôme, pas de parenthèses
    const facteur = (p: Polynome) =>
      x0 === 0 ? p.toLatex() : `\\left(${p.toLatex()}\\right)`
    const puissanceMoins1 = n === 2 ? '' : `^{${n - 1}}`

    // u(x0) avec x0 substitué, pour détailler le calcul de f(x0)
    const x0Tex = ecritureParentheseSiNegatif(x0)
    const uDeX0 = `${alpha === 1 ? '' : '-'}${x0Tex}^2${b === 0 ? '' : `${ecritureAlgebrique(b)}\\times${x0Tex}`}${c === 0 ? '' : ecritureAlgebrique(c)}`
    // Discriminant de u (Δ = -4αk < 0) : u a le signe de α sur ℝ
    const discriminant = `$\\Delta=${ecritureParentheseSiNegatif(b)}^2-4\\times${ecritureParentheseSiNegatif(alpha)}\\times${ecritureParentheseSiNegatif(c)}=${-4 * alpha * k}<0$`
    const definitionP = `Considérons le polynôme $P$ défini sur $\\mathbb R$ par $P(x)=${uTex}$.`
    const signeDeU = [
      definitionP,
      `Son discriminant est ${discriminant}.`,
      `Le polynôme est donc toujours du signe de $a=${alpha}$ donc, pour tout $x\\in\\mathbb R$, $P(x)${alpha > 0 ? '>' : '<'}0$.`,
    ].join('<br>')

    let expression = ''
    let cours = ''
    let formule = ''
    let reponse = ''
    let signe = ''
    // Facteur de f'(x) qui porte son signe : n×u'(x), u'(x) ou x-x0
    let facteurSigne = ''
    let fX0 = ''
    let calculFX0 = ''
    switch (typeF) {
      case 'puissance':
        expression = `\\left(${uTex}\\right)^{${n}}`
        cours = `Si $u$ est une fonction dérivable sur un intervalle $I$ et $n$ un entier naturel non nul, alors $u^n$ est dérivable sur $I$ et on a :\\[(u^n)'=nu'u^{n-1}.\\]`
        formule = `${n}\\times\\left(${uPrimeTex}\\right)\\times\\left(${uTex}\\right)${puissanceMoins1}`
        reponse = `${facteur(uPrime.multiply(n))}\\left(${uTex}\\right)${puissanceMoins1}`
        facteurSigne = uPrime.multiply(n).toLatex()
        signe =
          n === 2
            ? `${signeDeU}<br>Donc $${nomF}'(x)$ est du signe de $${facteurSigne}$.`
            : `${signeDeU}<br>${alpha > 0 ? 'Ainsi' : `Comme $${n - 1}$ est pair`}, pour tout $x\\in\\mathbb R$, $\\left(${uTex}\\right)${puissanceMoins1}>0$.<br>Donc $${nomF}'(x)$ est du signe de $${facteurSigne}$.`
        fX0 = `${k ** n}`
        calculFX0 = `\\left(${uDeX0}\\right)^{${n}}=${ecritureParentheseSiNegatif(k)}^{${n}}=${fX0}`
        break
      case 'exp':
        expression = `\\mathrm{e}^{${uTex}}`
        cours = `Si $u$ est une fonction dérivable sur un intervalle $I$, alors $\\mathrm{e}^u$ est dérivable sur $I$ et on a :\\[(\\mathrm{e}^u)'=u'\\mathrm{e}^u.\\]`
        formule = `${facteur(uPrime)}\\mathrm{e}^{${uTex}}`
        reponse = formule
        facteurSigne = uPrimeTex
        signe = `${definitionP}<br>Pour tout $x\\in\\mathbb R$, $\\mathrm{e}^{P(x)}>0$.<br>Donc $${nomF}'(x)$ est du signe de $${facteurSigne}$.`
        fX0 = k === 0 ? '1' : k === 1 ? '\\mathrm{e}' : `\\mathrm{e}^{${k}}`
        calculFX0 = `\\mathrm{e}^{${uDeX0}}=\\mathrm{e}^{${k}}${k === 0 || k === 1 ? `=${fX0}` : ''}`
        break
      case 'racine':
        expression = `\\sqrt{${uTex}}`
        cours = `Si $u$ est une fonction dérivable et strictement positive sur un intervalle $I$, alors $\\sqrt{u}$ est dérivable sur $I$ et on a :\\[(\\sqrt{u})'=\\dfrac{u'}{2\\sqrt{u}}.\\]`
        formule = `\\dfrac{${uPrimeTex}}{2\\sqrt{${uTex}}}`
        // u'(x) = 2(x-x0) : on simplifie par 2
        reponse = `\\dfrac{${new Polynome({ coeffs: [-x0, 1] }).toLatex()}}{\\sqrt{${uTex}}}`
        facteurSigne = new Polynome({ coeffs: [-x0, 1] }).toLatex()
        // P est défini et étudié dans la correction du a)
        signe = `Pour tout $x\\in\\mathbb R$, $\\sqrt{P(x)}>0$.<br>Donc $${nomF}'(x)$ est du signe de $${facteurSigne}$.`
        fX0 = `${Math.sqrt(k)}`
        calculFX0 = `\\sqrt{${uDeX0}}=\\sqrt{${k}}=${fX0}`
        break
    }

    const introduction = `Soit $${nomF}$ la fonction définie sur $\\mathbb R$ par $${nomF}(x)=${expression}$.`
    // Le cours sur √u demande u > 0 : on le remarque avant de dériver
    const remarqueRacine = typeF === 'racine' ? `${signeDeU}<br>` : ''

    // Question 1 : dérivée
    let texte1 = `Déterminer l'expression de $${nomF}'(x)$.`
    texte1 += ajouteChampTexteMathLive(
      this,
      iDerivee,
      KeyboardType.clavierFonctionsTerminales,
      { texteAvant: `<br>$${nomF}'(x)=$` },
    )
    let texteCorr1 = lampeMessage({ titre: 'Rappel :', texte: cours })
    texteCorr1 += `Soit $x\\in\\mathbb R$. On pose $u(x)=${uTex}$ donc $u'(x)=${uPrimeTex}$.<br>`
    texteCorr1 += remarqueRacine
    texteCorr1 += `On a, en appliquant la formule ci-dessus${typeF === 'puissance' ? ` avec $n=${n}$` : ''} :`
    if (formule === reponse) {
      texteCorr1 += `\\[${nomF}'(x)=${miseEnEvidence(reponse)}.\\]`
    } else {
      texteCorr1 += `\\[${nomF}'(x)=${formule}.\\]`
      texteCorr1 += "D'où, en simplifiant :"
      texteCorr1 += `\\[${nomF}'(x)=${miseEnEvidence(reponse)}.\\]`
    }
    handleAnswers(this, iDerivee, {
      reponse: { value: reponse, compare: seq([isEqual()]) },
    })

    // Question 2 : tableau de variations
    const signeGauche = alpha > 0 ? '-' : '+'
    const signeDroite = alpha > 0 ? '+' : '-'
    const flecheGauche = alpha > 0 ? 'bas' : 'haut'
    const flecheDroite = alpha > 0 ? 'haut' : 'bas'
    const config: TableauSVConfig = {
      variableName: 'x',
      colonnes: [
        colonne('-\\infty'),
        colonne('', { editable: true, expected: String(x0) }),
        colonne('+\\infty'),
      ],
      lignes: [
        {
          type: 'signe',
          label: `${nomF}'(x)`,
          cellules: [
            { symbole: '' },
            { symbole: '', editable: true, expected: signeGauche },
            { symbole: '|0' },
            { symbole: '', editable: true, expected: signeDroite },
            { symbole: '' },
          ],
        },
        ligneVariation(
          `${nomF}(x)`,
          [
            celluleValeur(''),
            celluleValeur('', {
              editable: true,
              expected: fX0,
              clavier: KeyboardType.clavierFonctionsTerminales,
            }),
            celluleValeur(''),
          ],
          [
            celluleFleche('', { editable: true, expected: flecheGauche }),
            celluleFleche('', { editable: true, expected: flecheDroite }),
          ],
        ),
      ],
    }
    let texte2 = `En déduire le tableau de variations de $${nomF}$ sur $\\mathbb R$.`
    if (this.interactif) {
      texte2 += `<br>${addTableauSignesVariations(this, iTableau, { config, bareme: 1 })}`
    }

    let texteCorr2 = `${signe}<br>`
    // facteurSigne = coeffX(x - x0), avec coeffX du signe de α
    const coeffX =
      typeF === 'puissance' ? 2 * alpha * n : typeF === 'exp' ? 2 * alpha : 1
    const etapes = [`${facteurSigne}>0`]
    if (x0 !== 0 && coeffX !== 1) etapes.push(`${coeffX}x>${coeffX * x0}`)
    etapes.push(`x${coeffX > 0 ? '>' : '<'}${x0}`)
    // Résolution en colonne : une équivalence par ligne
    texteCorr2 += `Or,\\[\\begin{aligned}${etapes[0]}&\\iff ${etapes.slice(1).join('\\\\ &\\iff ')}\\end{aligned}\\]`
    texteCorr2 += `De plus, $${nomF}(${x0})=${calculFX0}$.<br>`
    texteCorr2 += `On obtient le tableau de variations suivant :<br>${creerTableauSignesVariations(
      configCorrige(config, { enEvidence: true }),
      {
        readonly: true,
        numeroExercice: this.numeroExercice,
        numeroQuestion: iTableau,
        id: `tableauCorrectionEx${this.numeroExercice}Q${iTableau}`,
      },
    )}`

    return {
      introduction,
      texteDerivee: texte1,
      correctionDerivee: texteCorr1,
      texteTableau: texte2,
      correctionTableau: texteCorr2,
      cle: [typeF, x0, alpha, k, n],
    }
  }
}
