import { sameComparisonSign, seq } from '../../lib/interactif/checks'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { rienSi1 } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Comparer deux nombres réels en étudiant leur différence'
export const dateDePublication = '16/07/2026'
export const interactifReady = true

export const uuid = '92e90'

export const refs = {
  'fr-fr': ['2N14-2'],
  'fr-ch': [],
}

type TypeQuestion = 'racineCarree' | 'pi' | 'variable'

/**
 * Comparer a-b√c et d-e√c en étudiant le signe de leur différence.
 * @author Stéphane Guyon
 */
export default class ComparerDeuxNombresAvecRacineCarree extends Exercice {
  constructor() {
    super()
    this.tip = `
      <p style="margin: 0 0 10px 0;">
        Pour déterminer lequel de deux nombres est le plus grand, on peut étudier le signe de leur différence.
      </p>
      <ul style="list-style-type: disc; padding-left: 1.5em; margin: 0; line-height: 2;">
        <li>Si $A-B > 0$, alors $A > B$.</li>
        <li>Si $A-B < 0$, alors $A < B$.</li>
      </ul>
    `
    this.nbQuestions = 2
    this.nbCols = 2
    this.nbColsCorr = 2
    this.spacing = 2
    this.spacingCorr = 2
    this.sup = 4
    this.besoinFormulaireNumerique = [
      'Type de questions',
      4,
      '1 : avec une racine carrée\n2 : avec Pi\n3 : avec une variable\n4 : Mélange',
    ]
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions === 1
        ? 'Comparer les deux nombres réels suivants en justifiant la réponse.'
        : 'Comparer les deux nombres réels de chaque question en justifiant les réponses.'

    const typesDisponibles: TypeQuestion[] =
      this.sup === 1
        ? ['racineCarree']
        : this.sup === 2
          ? ['pi']
          : this.sup === 3
            ? ['variable']
            : ['racineCarree', 'pi', 'variable']
    const typesDeQuestions = combinaisonListes(
      typesDisponibles,
      this.nbQuestions,
    )
    const valeursDeC = combinaisonListes(
      [3, 5, 7, 11, 13, 15],
      this.nbQuestions,
    )
    const sensDesComparaisons = combinaisonListes(
      ['inferieur', 'superieur'],
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const typeQuestion = typesDeQuestions[i]
      const sensComparaison = sensDesComparaisons[i]
      const d = randint(1, 9)
      const e = randint(1, 6)
      const b = e + 1
      let a = 0
      let donneeCaracteristique = 0
      let reponse: '<' | '>'
      let texte = ''
      let texteCorr = ''

      if (typeQuestion === 'racineCarree') {
        const c = valeursDeC[i]
        const entierInferieur = Math.floor(Math.sqrt(c))
        const differencePartiesEntieres =
          sensComparaison === 'inferieur'
            ? entierInferieur
            : entierInferieur + 1
        const carreDifference = differencePartiesEntieres ** 2
        a = d + differencePartiesEntieres
        donneeCaracteristique = c
        reponse = carreDifference < c ? '<' : '>'

        texte = `On pose $A=${a}-${rienSi1(b)}\\sqrt{${c}}$ et $B=${d}-${rienSi1(e)}\\sqrt{${c}}$.<br>`
        texteCorr = `On calcule la différence $A-B$ :<br>
        $\\begin{aligned}
        A-B
        &=\\left(${a}-${rienSi1(b)}\\sqrt{${c}}\\right)-\\left(${d}-${rienSi1(e)}\\sqrt{${c}}\\right)\\\\
        &=${a}-${d}-${rienSi1(b)}\\sqrt{${c}}+${rienSi1(e)}\\sqrt{${c}}\\\\
        &=${differencePartiesEntieres}-\\sqrt{${c}}.
        \\end{aligned}$<br>`

        if (carreDifference < c) {
          texteCorr += `Comme $${differencePartiesEntieres}=\\sqrt{${carreDifference}}$ et $\\sqrt{${carreDifference}} < \\sqrt{${c}}$, on a
          $${differencePartiesEntieres} < \\sqrt{${c}}$, donc $${differencePartiesEntieres}-\\sqrt{${c}} < 0$.<br>
          Par conséquent, $A ${miseEnEvidence('<')} B$.`
        } else {
          texteCorr += `Comme $${differencePartiesEntieres}=\\sqrt{${carreDifference}}$ et $\\sqrt{${carreDifference}} > \\sqrt{${c}}$, on a
          $${differencePartiesEntieres} > \\sqrt{${c}}$, donc $${differencePartiesEntieres}-\\sqrt{${c}} > 0$.<br>
          Par conséquent, $A ${miseEnEvidence('>')} B$.`
        }
      } else if (typeQuestion === 'pi') {
        const differencePartiesEntieres =
          sensComparaison === 'inferieur'
            ? choice([1, 2, 3])
            : choice([4, 5, 6])
        a = d + differencePartiesEntieres
        donneeCaracteristique = differencePartiesEntieres
        reponse = differencePartiesEntieres <= 3 ? '<' : '>'

        const comparaisonAvecPi =
          differencePartiesEntieres < 3
            ? `${differencePartiesEntieres} < 3 < \\pi`
            : differencePartiesEntieres === 3
              ? '3 < \\pi'
              : differencePartiesEntieres === 4
                ? '\\pi < 4'
                : `\\pi < 4 < ${differencePartiesEntieres}`

        texte = `On pose $A=${a}-${rienSi1(b)}\\pi$ et $B=${d}-${rienSi1(e)}\\pi$.<br>`
        texteCorr = `On calcule la différence $A-B$ :<br>
        $\\begin{aligned}
        A-B
        &=\\left(${a}-${rienSi1(b)}\\pi\\right)-\\left(${d}-${rienSi1(e)}\\pi\\right)\\\\
        &=${a}-${d}-${rienSi1(b)}\\pi+${rienSi1(e)}\\pi\\\\
        &=${differencePartiesEntieres}-\\pi.
        \\end{aligned}$<br>
        On sait que $3 < \\pi < 4$. Ainsi, $${comparaisonAvecPi}$. On a donc $${differencePartiesEntieres}-\\pi ${reponse === '<' ? '<' : '>'} 0$.<br>
        Par conséquent, $A ${miseEnEvidence(reponse)} B$.`
      } else {
        const borneInferieure = randint(1, 8)
        const differencePartiesEntieres =
          sensComparaison === 'inferieur'
            ? borneInferieure
            : borneInferieure + 1
        a = d + differencePartiesEntieres
        donneeCaracteristique = borneInferieure
        reponse = differencePartiesEntieres === borneInferieure ? '<' : '>'

        texte = `On pose $A=${a}-${rienSi1(b)}n$ et $B=${d}-${rienSi1(e)}n$, où $n$ est un nombre réel tel que $${borneInferieure} < n < ${borneInferieure + 1}$.<br>`
        texteCorr = `On calcule la différence $A-B$ :<br>
        $\\begin{aligned}
        A-B
        &=\\left(${a}-${rienSi1(b)}n\\right)-\\left(${d}-${rienSi1(e)}n\\right)\\\\
        &=${a}-${d}-${rienSi1(b)}n+${rienSi1(e)}n\\\\
        &=${differencePartiesEntieres}-n.
        \\end{aligned}$<br>
        Comme $${borneInferieure} < n < ${borneInferieure + 1}$, on a
        $${differencePartiesEntieres}-n ${reponse === '<' ? '<' : '>'} 0$.<br>
        Par conséquent, $A ${miseEnEvidence(reponse)} B$.`
      }

      if (this.interactif) {
        texte += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierCompare,
          {
            texteAvant: '$A$',
            texteApres: '$B$',
          },
        )
      }

      handleAnswers(this, i, {
        reponse: {
          value: reponse,
          compare: seq([sameComparisonSign()]),
        },
      })

      if (
        this.questionJamaisPosee(
          i,
          a,
          b,
          d,
          e,
          typeQuestion,
          donneeCaracteristique,
        )
      ) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
