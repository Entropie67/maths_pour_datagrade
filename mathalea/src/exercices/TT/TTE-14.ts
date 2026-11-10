import { bleuMathalea } from '../../lib/colors'
import { choixDeroulant } from '../../lib/customElements/ListeDeroulanteElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  texteEnCouleur,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Déterminer le sens de variation d’une fonction $x\\mapsto k\\times a^x$'
export const dateDePublication = '11/10/2026'
export const uuid = 'fae75'
export const interactifReady = true
export const refs = {
  'fr-fr': ['TTE-14'],
  'fr-ch': [],
}

const croissante = 'strictement croissante'
const decroissante = 'strictement décroissante'

// Chaque base est donnée sous sa forme LaTeX : une fraction est plus lisible qu'un décimal.
const basesSupA1 = [
  texNombre(1.2),
  texNombre(1.5),
  texNombre(2),
  texNombre(3),
  texNombre(5),
  texNombre(10),
  '\\dfrac{3}{2}',
  '\\dfrac{5}{4}',
]
const basesInfA1 = [
  texNombre(0.2),
  texNombre(0.5),
  texNombre(0.8),
  texNombre(0.9),
  texNombre(0.25),
  '\\dfrac{1}{2}',
  '\\dfrac{2}{3}',
  '\\dfrac{1}{3}',
]
const valeursDeK = [2, 3, 4, 5, 6, 0.5, 1.5, 2.5]

/**
 * Exercice de détermination du sens de variation de f(x) = k × a^x
 * à partir du signe de k et de la position de a par rapport à 1.
 */
export default class SensVariationKFoisAPuissanceX extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.consigne =
      this.nbQuestions === 1
        ? 'Déterminer le sens de variation de la fonction $f$ définie sur $\\mathbb{R}$.'
        : 'Déterminer le sens de variation de chaque fonction définie sur $\\mathbb{R}$.'
    this.spacingCorr = 2

    this.besoinFormulaireNumerique = [
      'Valeur de la base a',
      3,
      '1 : a > 1\n2 : 0 < a < 1\n3 : Mélange',
    ]
    this.sup = 3
    this.besoinFormulaire2Numerique = [
      'Signe de k',
      3,
      '1 : k > 0\n2 : k < 0\n3 : Mélange',
    ]
    this.sup2 = 3
    this.besoinFormulaire3CaseACocher = ['Correction détaillée', false]
    this.sup3 = false
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions === 1
        ? 'Déterminer le sens de variation de la fonction $f$ définie sur $\\mathbb{R}$.'
        : 'Déterminer le sens de variation de chaque fonction définie sur $\\mathbb{R}$.'

    // Mélange équilibré des quatre situations (signe de k, position de a par rapport à 1).
    const situationsDisponibles = [
      { kPositif: true, aSupA1: true },
      { kPositif: true, aSupA1: false },
      { kPositif: false, aSupA1: true },
      { kPositif: false, aSupA1: false },
    ].filter(
      (situation) =>
        (this.sup === 3 || (this.sup === 1) === situation.aSupA1) &&
        (this.sup2 === 3 || (this.sup2 === 1) === situation.kPositif),
    )
    const situations = combinaisonListes(
      situationsDisponibles,
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const { kPositif, aSupA1 } = situations[i]
      const valeurAbsolueK = choice(valeursDeK)
      const k = kPositif ? valeurAbsolueK : -valeurAbsolueK
      const baseTex = choice(aSupA1 ? basesSupA1 : basesInfA1)
      const puissanceTex = baseTex.includes('frac')
        ? `\\left(${baseTex}\\right)^x`
        : `${baseTex}^x`
      const fonctionCroissante = kPositif === aSupA1
      const reponse = fonctionCroissante ? croissante : decroissante

      const symboleBase = aSupA1 ? '\\gt' : '\\lt'
      const symboleK = kPositif ? '\\gt' : '\\lt'

      let texte = `$f(x)=${texNombre(k)}\\times ${puissanceTex}$`
      if (this.interactif) {
        texte +=
          '<br>La fonction $f$ est ' +
          choixDeroulant(this, i, {
            choices: [
              { label: 'Choisir', value: '' },
              { label: croissante, value: croissante },
              { label: decroissante, value: decroissante },
            ],
          }) +
          ' sur $\\mathbb{R}$.'
        handleAnswers(
          this,
          i,
          { reponse: { value: reponse } },
          { formatInteractif: 'liste-deroulante' },
        )
      }

      const conclusion = `${texteEnCouleur('La fonction $f$ est', bleuMathalea)} ${texteEnCouleurEtGras(reponse)} ${texteEnCouleur('sur $\\mathbb{R}$.', bleuMathalea)}`
      let texteCorr = ''
      if (this.sup3) {
        const puissanceY = puissanceTex.replace('^x', '^y')
        const ordreExponentielle = aSupA1 ? '\\lt' : '\\gt'
        const ordreFinal = fonctionCroissante ? '\\lt' : '\\gt'
        texteCorr += texteEnCouleur(
          'Soient $x$ et $y$ deux réels tels que $x\\lt y$.',
          bleuMathalea,
        )
        texteCorr += '<br>'
        texteCorr += texteEnCouleur(
          aSupA1
            ? `Comme $a=${baseTex}\\gt 1$, la fonction $x\\mapsto a^x$ est strictement croissante, donc l'ordre est conservé :`
            : `Comme $0\\lt a=${baseTex}\\lt 1$, la fonction $x\\mapsto a^x$ est strictement décroissante, donc l'ordre est inversé :`,
          bleuMathalea,
        )
        texteCorr += `<br>$${puissanceTex} ${ordreExponentielle} ${puissanceY}$`
        texteCorr += '<br>'
        texteCorr += texteEnCouleur(
          kPositif
            ? `Comme $k=${texNombre(k)}\\gt 0$, multiplier par $k$ conserve l'ordre :`
            : `Comme $k=${texNombre(k)}\\lt 0$, multiplier par $k$ inverse l'ordre :`,
          bleuMathalea,
        )
        texteCorr += `<br>$${texNombre(k)}\\times ${puissanceTex} ${ordreFinal} ${texNombre(k)}\\times ${puissanceY}$, soit $f(x) ${ordreFinal} f(y)$.`
        texteCorr += '<br>'
        texteCorr += texteEnCouleur(
          `Ainsi, $x\\lt y$ entraîne $f(x) ${ordreFinal} f(y)$.`,
          bleuMathalea,
        )
        texteCorr += `<br>${conclusion}`
      } else {
        texteCorr += texteEnCouleur(
          `Comme $a=${baseTex}${symboleBase} 1$ et $k=${texNombre(k)}${symboleK} 0$,`,
          bleuMathalea,
        )
        texteCorr += `<br>${conclusion.replace('La', 'la')}` // Pas de majuscule après une virgule
      }

      if (this.questionJamaisPosee(i, k, baseTex)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
