import { tableauColonneLigne } from '../../lib/2d/tableau'
import { reduireAxPlusB } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Déterminer le quotient et le reste d’une division euclidienne selon un entier naturel'
export const dateDePublication = '07/10/2026'
export const uuid = 'ed53c'

export const refs = {
  'fr-fr': ['TEA1-23'],
  'fr-ch': [],
}

/** @author Stéphane Guyon */
export default class DivisionEuclidienneSelonEntier extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
  }

  nouvelleVersion(): void {
    const divisorCoefficient = randint(3, 6)
    const divisorConstant = randint(1, 3)
    const quotient = randint(2, 3)
    const remainderCoefficient = randint(1, divisorCoefficient - 1)
    const difference = divisorCoefficient - remainderCoefficient
    // Cette constante garantit que le reste convient exactement pour n > 1.
    const remainderConstant = divisorConstant + difference
    const dividendCoefficient =
      quotient * divisorCoefficient + remainderCoefficient
    const dividendConstant = quotient * divisorConstant + remainderConstant
    const divisor = reduireAxPlusB(divisorCoefficient, divisorConstant, 'n')
    const dividend = reduireAxPlusB(dividendCoefficient, dividendConstant, 'n')
    const remainder = reduireAxPlusB(
      remainderCoefficient,
      remainderConstant,
      'n',
    )
    const quotientAtZero = Math.floor(dividendConstant / divisorConstant)
    const remainderAtZero = dividendConstant % divisorConstant
    const dividendAtOne = dividendCoefficient + dividendConstant
    const divisorAtOne = divisorCoefficient + divisorConstant
    const quotientAtOne = quotient + 1
    const tableauCasParticuliers = tableauColonneLigne(
      [
        'n',
        `\\text{Dividende }${dividend}`,
        `\\text{Diviseur }${divisor}`,
        '\\text{Reste}',
      ],
      ['0', '1'],
      [
        `${texNombre(dividendConstant)}`,
        `${texNombre(divisorConstant)}`,
        miseEnEvidence(texNombre(remainderAtZero)),
        `${texNombre(dividendAtOne)}`,
        `${texNombre(divisorAtOne)}`,
        miseEnEvidence('0'),
      ],
      1.5,
      true,
    )

    this.listeQuestions[0] = `Soit $n$ un entier naturel. Déterminer, selon les valeurs de $n$, le quotient et le reste de la division euclidienne de $${dividend}$ par $${divisor}$.`

    this.listeCorrections[0] = `Soit $n\\in \\mathbb{N}$. <br>
    L'écriture de la division euclidienne est unique : Il existe un unique couple d'entiers naturels $(q,r)$ vérifiant $${dividend}=q(${divisor})+r$ et $0\\leqslant r<${divisor}$.<br>
    On prend $q=${texNombre(quotient)}$.<br>
    On cherche un entier naturel $r$ tel que $0\\leqslant r<${divisor}$, qui vérifie $${dividend}=${texNombre(quotient)}(${divisor})+r$.<br>
    Il vient $r=${dividend}-${texNombre(quotient)}(${divisor})=${remainder}$.<br>
    On obtient donc $${dividend}=${texNombre(quotient)}(${divisor})+(${remainder})$.<br>
    Comme $n$ est un entier naturel, $r=${remainder}>0$.<br>
    La condition $0\\leqslant r<${divisor}$ est donc équivalente à la suivante.<br>
    $${remainder}\\lt ${divisor}\\iff ${texNombre(difference)}\\lt ${reduireAxPlusB(difference, 0, 'n')}\\iff n>1$<br>
    Ainsi, pour $n\\geqslant2$, on obtient bien la division euclidienne, avec $${miseEnEvidence(`q=${texNombre(quotient)}`)}$ et $${miseEnEvidence(`r=${remainder}`)}$.<br>
    Il reste à examiner séparément les cas $n=0$ et $n=1$, pour lesquels cette condition n'est pas vérifiée.<br><br>
    ${tableauCasParticuliers}<br>
    Pour $n=0$, alors $${texNombre(dividendConstant)}=${texNombre(quotientAtZero)}\\times${texNombre(divisorConstant)}+${texNombre(remainderAtZero)}$, donc $${miseEnEvidence(`q=${texNombre(quotientAtZero)}`)}$.<br>
    Pour $n=1$, alors $${texNombre(dividendAtOne)}=${texNombre(quotientAtOne)}\\times${texNombre(divisorAtOne)}+0$, donc $${miseEnEvidence(`q=${texNombre(quotientAtOne)}`)}$.`

    listeQuestionsToContenu(this)
  }
}
