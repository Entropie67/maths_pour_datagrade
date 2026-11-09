import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre =
  "Exprimer le terme général d'une suite définie par récurrence"
export const dateDePublication = '04/08/2026'
export const interactifReady = true

export const uuid = 'cf810'
export const refs = {
  'fr-fr': ['can1S22-04'],
  'fr-ch': [],
}

/**
 * Déterminer la forme explicite d'une suite arithmétique ou géométrique
 * définie par récurrence à partir de $u_0$ ou $u_1$.
 * @author Stéphane Guyon
 */
export default class TermeGeneralSuiteParRecurrence extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierSuite
  }

  nouvelleVersion() {
    const indicePremierTerme = choice([0, 1])
    const premierTerme = randint(-12, 12, 0)

    switch (this.quotaChoice('typeSuite', ['arithmetique', 'geometrique'])) {
      case 'arithmetique': {
        const raison = randint(-9, 9, 0)
        const termeConstant = premierTerme - indicePremierTerme * raison
        const decalage = indicePremierTerme === 0 ? 'n' : '\\left(n-1\\right)'
        const formeDeveloppee = `${premierTerme}${ecritureAlgebriqueSauf1(raison)}n${indicePremierTerme === 0 ? '' : ecritureAlgebrique(-raison)}`
        const reponse = reduireAxPlusB(raison, termeConstant, 'n')
        const relation = `u_{n+1}=u_n${ecritureAlgebrique(raison)}`

        this.question = `La suite $(u_n)$ est définie par $u_{${indicePremierTerme}}=${premierTerme}$ et par la relation $${relation}$, pour tout entier naturel $n$.<br>Exprimer $u_n$ en fonction de $n$.`
        if (this.interactif) this.question += '<br>$u_n=$'

        this.correction = `$${relation}$ est la relation de récurrence d’une suite arithmétique de raison $r=${raison}$.<br>`
        this.correction +=
          indicePremierTerme === 0
            ? 'Pour tout entier naturel $n$, on a $u_n=u_0+nr$.<br>'
            : 'Pour tout entier naturel $n$, on a $u_n=u_1+(n-1)r$.<br>'
        this.correction += `$\\begin{aligned}u_n&=${premierTerme}+${decalage}\\times ${ecritureParentheseSiNegatif(raison)}\\\\&=${formeDeveloppee}\\\\&=${miseEnEvidence(reponse)}.\\end{aligned}$`

        this.reponse = reponse
        this.canReponseACompleter = '$u_n=\\ldots$'
        break
      }
      case 'geometrique': {
        const raison = choice([
          new Decimal(randint(2, 9)).div(10),
          new Decimal(randint(2, 5)),
        ])
        const raisonTex = texNombre(raison, 1)
        const puissance = indicePremierTerme === 0 ? 'n' : 'n-1'
        const reponse = `${premierTerme}*(${raison.toString()})^{${puissance}}`
        const relation = `u_{n+1}=${raisonTex}u_n`
        const formeExplicite = `${premierTerme}\\times ${raisonTex}^{${puissance}}`

        this.question = `La suite $(u_n)$ est définie par $u_{${indicePremierTerme}}=${premierTerme}$ et par la relation $${relation}$, pour tout entier naturel $n$.<br>Exprimer $u_n$ en fonction de $n$.`
        if (this.interactif) this.question += '<br>$u_n=$'

        this.correction = `$${relation}$ est la relation de récurrence d’une suite géométrique de raison $q=${raisonTex}$.<br>`
        this.correction +=
          indicePremierTerme === 0
            ? 'Pour tout entier naturel $n$, on a $u_n=u_0\\times q^n$.<br>'
            : 'Pour tout entier naturel $n$, on a $u_n=u_1\\times q^{n-1}$.<br>'
        this.correction += `$u_n=${miseEnEvidence(formeExplicite)}$.`

        this.reponse = reponse
        this.canReponseACompleter = '$u_n=\\ldots$'
        break
      }
    }
  }
}
