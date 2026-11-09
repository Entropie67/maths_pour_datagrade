import Decimal from 'decimal.js'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Exprimer le terme général d'une suite définie par récurrence"
export const dateDePublication = '04/08/2026'
export const interactifReady = true

export const uuid = '4d360'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}

type TypeSuite = 'arithmetique' | 'geometrique'

function exposant(indicePremierTerme: number) {
  return indicePremierTerme === 0 ? 'n' : `n-${indicePremierTerme}`
}

/**
 * Reconnaître une suite arithmétique ou géométrique définie par récurrence,
 * puis en donner la forme explicite à partir d'un terme quelconque.
 * @author Stéphane Guyon
 */
export default class TermeGeneralSuiteParRecurrence extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 2
    this.sup = 3
    this.sup2 = 1
    this.besoinFormulaireNumerique = [
      'Nature de la suite',
      3,
      '1 : Suite arithmétique\n2 : Suite géométrique\n3 : Mélange',
    ]
    this.besoinFormulaire2Numerique = [
      'Indice du premier terme donné',
      3,
      '1 : 0\n2 : 1\n3 : p',
    ]
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions === 1
        ? 'Exprimer $u_n$ en fonction de $n$.'
        : 'Dans chaque cas, exprimer $u_n$ en fonction de $n$.'

    const typesDisponibles: TypeSuite[] =
      this.sup === 1
        ? ['arithmetique']
        : this.sup === 2
          ? ['geometrique']
          : ['arithmetique', 'geometrique']
    const typesDeQuestions = combinaisonListes(
      typesDisponibles,
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const type = typesDeQuestions[i]
      const indicePremierTerme =
        this.sup2 === 2 ? 1 : this.sup2 === 3 ? randint(2, 8) : 0
      const premierTerme = randint(-12, 12, 0)
      let relation: string
      let reponse: string
      let texteCorr: string

      if (type === 'arithmetique') {
        const raison = randint(-9, 9, 0)
        const termeConstant = premierTerme - indicePremierTerme * raison
        const decalage =
          indicePremierTerme === 0
            ? 'n'
            : `\\left(n-${indicePremierTerme}\\right)`
        const formeDeveloppee = `${premierTerme}${ecritureAlgebriqueSauf1(raison)}n${indicePremierTerme === 0 ? '' : ecritureAlgebrique(-indicePremierTerme * raison)}`
        reponse = reduireAxPlusB(raison, termeConstant, 'n')
        relation = `u_{n+1}=u_n${ecritureAlgebrique(raison)}`
        texteCorr = `$u_{n+1}=u_n${ecritureAlgebrique(raison)}$ est la relation de récurrence d’une suite arithmétique de raison $r=${raison}$.<br>`
        texteCorr +=
          indicePremierTerme === 0
            ? `Pour tout entier naturel $n$, on a $u_n=u_0+nr$.<br>`
            : indicePremierTerme === 1
              ? `Pour tout entier naturel $n$, on a $u_n=u_1+(n-1)r$.<br>`
              : `Pour tous entiers naturels $n$ et $p$, on a $u_n=u_p+(n-p)r$. Ici, $p=${indicePremierTerme}$, donc $u_n=u_{${indicePremierTerme}}+(n-${indicePremierTerme})r$.<br>`
        texteCorr += `$\\begin{aligned}u_n&=${premierTerme}+${decalage}\\times ${ecritureParentheseSiNegatif(raison)}\\\\&=${formeDeveloppee}\\\\&=${miseEnEvidence(reponse)}.\\end{aligned}$`
      } else {
        const raison = choice([
          new Decimal(randint(2, 9)).div(10),
          new Decimal(randint(2, 5)),
        ])
        const raisonTex = texNombre(raison, 1)
        const puissance = exposant(indicePremierTerme)
        reponse = `${premierTerme}*(${raison.toString()})^{${puissance}}`
        relation = `u_{n+1}=${raisonTex}u_n`
        texteCorr = `$u_{n+1}=${raisonTex}u_n$ est la relation de récurrence d’une suite géométrique de raison $q=${raisonTex}$.<br>`
        texteCorr +=
          indicePremierTerme === 0
            ? `Pour tout entier naturel $n$, on a $u_n=u_0\\times q^n$.<br>`
            : indicePremierTerme === 1
              ? `Pour tout entier naturel $n$, on a $u_n=u_1\\times q^{n-1}$.<br>`
              : `Pour tous entiers naturels $n$ et $p$, on a $u_n=u_p\\times q^{n-p}$. Ici, $p=${indicePremierTerme}$, donc $u_n=u_{${indicePremierTerme}}\\times q^{n-${indicePremierTerme}}$.<br>`
        texteCorr += `$u_n=${miseEnEvidence(`${premierTerme}\\times ${raisonTex}^{${puissance}}`)}$.`
      }

      let texte = `La suite $(u_n)$ est définie par $u_{${indicePremierTerme}}=${premierTerme}$ et par la relation $${relation}$, pour tout entier naturel $n$.`
      if (this.interactif) {
        texte += `<br>$u_n=$${ajouteChampTexteMathLive(this, i, KeyboardType.clavierSuite)}`
      }

      if (
        this.questionJamaisPosee(
          i,
          type,
          indicePremierTerme,
          premierTerme,
          relation,
        )
      ) {
        handleAnswers(this, i, {
          reponse: { value: reponse, options: { calculFormel: true } },
        })
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
