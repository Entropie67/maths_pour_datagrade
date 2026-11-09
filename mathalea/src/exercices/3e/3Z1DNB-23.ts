import { createList } from '../../lib/format/lists'
import { choisitNombresEntreMetN } from '../../lib/outils/aleatoires'
import { choice } from '../../lib/outils/arrayOutils'
import { egalOuApprox } from '../../lib/outils/ecritures'
import { texteItalique, miseEnEvidence } from '../../lib/outils/embellissements'
import { estPremier } from '../../lib/outils/primalite'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import ExerciceBrevetA from '../ExerciceBrevetA'
import { sp } from '../../lib/outils/outilString'

export const uuid = 'bc6ae'
export const refs = {
  'fr-fr': ['3Z1DNB-23'],
  'fr-ch': ['4mProbStat-20'],
}
export const titre =
  'Préparation DNB : Probabilité, arithmétique'
export const dateDePublication = '27/06/2025'

/*
On dispose d'une urne A contenant $6$ boules numérotées: $7$; $10$; $12$; $15$; $24$; $30$ et d'une urne B contenant $9$ boules numérotées: 2; 5; 6; 8; 17; 18; 21; 22; 25.

Les boules sont indiscernables au toucher.

\begin{enumerate}
\item On tire une boule dans l'urne A, quelle est la probabilité d'obtenir un nombre pair ?

\item On tire une boule dans l'urne B, justifier que la probabilité d'obtenir un nombre premier est de $\dfrac{1}{3}$.

\item Quelle urne contient le plus grand nombre de boules dont le numéro est un multiple de $6$ ?

\item On tire une boule au hasard dans l'une des urnes. Démontrer que la probabilité d'obtenir un nombre supérieur ou égal à $20$ est la même quelle que soit l'urne choisie ?

\item En repartant avec la composition initiale des urnes A et B on décide d'ajouter une boule numérotée $50$ dans chacune d'entre elles. Dans ces conditions, la probabilité d'obtenir un résultat supérieur ou égal à $20$ est-t-elle toujours égale quelle que soit l'urne choisie ?
\end{enumerate}
*/

/**
 * @Author Jean-claude Lhote
 * Cet exerice exploite la nouvelle classe d'exercice que j'ai conçue pour les sujets de brevet
 * Il s'agit d'un exercice de type Brevet Aléatoirisé
 * La méthode privée appliquerLesValeurs permet de générer les valeurs aléatoires et de construire l'énoncé et la correction
 * La méthode versionOriginale permet de générer les valeurs de l'exercice telles qu'elles sont dans le sujet original
 * La méthode versionAleatoire permet de générer des valeurs aléatoires pour l'exercice
 */
export default class ExerciceMetropole392024 extends ExerciceBrevetA {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = ['Sujet original', false]
    this.sup = false
    this.versionAleatoire()
  }

  private appliquerLesValeurs(
    urneA: number[],
    urneB: number[],
    table: number,
    min: number,
    ajout: number,
  ): void {
    this.introduction = texteItalique(
      "D'après l'exercice $1$ du brevet Métropole juin 2025.",
    ) + '<br>'

    const nbPrem = urneB.filter((n) => estPremier(n)).length
    const probaPrem = new FractionEtendue(nbPrem, urneB.length)
    const probaPair = new FractionEtendue(
      urneA.filter((n) => n % 2 === 0).length,
      urneA.length,
    )
    const probaSupA = new FractionEtendue(
      urneA.filter((n) => n >= min).length,
      urneA.length,
    )
    const probaSupB = new FractionEtendue(
      urneB.filter((n) => n >= min).length,
      urneB.length,
    )
    const probaSupAajout = new FractionEtendue(
      [...urneA, ajout].filter((n) => n >= min).length,
      urneA.length + 1,
    )
    const probaSupBajout = new FractionEtendue(
      [...urneB, ajout].filter((n) => n >= min).length,
      urneB.length + 1,
    )
    const nbMulA = urneA.filter((n) => n % table === 0).length
    const nbMulB = urneB.filter((n) => n % table === 0).length
    this.enonce = `On dispose d'une urne A contenant $${urneA.length}$ boules numérotées${sp()}: ${urneA.map((n) => `$\\,${n}\\,$`).join(';')} et d'une urne B contenant $${urneB.length}$ boules numérotées${sp()}: ${urneB.map((n) => `$\\,${n}\\,$`).join(';')}.<br>
Les boules sont indiscernables au toucher.<br>`
    const question1 =
      `On tire une boule dans l'urne A, quelle est la probabilité d'obtenir un nombre pair${sp()}?`
    const question2 = `On tire une boule dans l'urne B, justifier que la probabilité d'obtenir un nombre premier est de $${probaPrem.texFractionSimplifiee}$.`
    const question3 = `Quelle urne contient le plus grand nombre de boules dont le numéro est un multiple de $${table}$${sp()}?`
    const question4 = `On tire une boule au hasard dans l'une des urnes. Démontrer que la probabilité d'obtenir un nombre supérieur ou égal à $${min}$ est la même quelle que soit l'urne choisie${sp()}?`
    const question5 = `En repartant avec la composition initiale des urnes A et B on décide d'ajouter une boule numérotée $${ajout}$ dans chacune d'entre elles. Dans ces conditions, la probabilité d'obtenir un résultat supérieur ou égal à $${min}$ est-t-elle toujours égale quelle que soit l'urne choisie${sp()}?`
    const correction1 = `Les nombres pairs présents dans l'urne A sont${sp()}: ${urneA
      .filter((n) => n % 2 === 0)
      .map((n) => `$${n}$`)
      .join(' ; ')}.<br>
  Il y a donc $${urneA.filter((n) => n % 2 === 0).length}$ nombres pairs sur $${urneA.length}$. La probabilité d'obtenir un nombre pair est de $${miseEnEvidence(`${probaPair.texFraction}${probaPair.estIrreductible ? '' : '=' + probaPair.texFractionSimplifiee}`)}$.`
    const correction2 = `Les nombres premiers présents dans l'urne B sont${sp()}: ${urneB
      .filter((n) => estPremier(n))
      .map((n) => `$${n}$`)
      .join(' ; ')}.<br>
  Il y a donc $${nbPrem}$ nombres premiers sur $${urneB.length}$. La probabilité d'obtenir un nombre premier est de $${miseEnEvidence(`${probaPrem.texFraction}${probaPrem.estIrreductible ? '' : '=' + probaPrem.texFractionSimplifiee}`)}$.`
    const correction3 = `L'urne A contient $${nbMulA}$ boules dont le numéro est un multiple de $${table}$ (${urneA
      .filter((n) => n % table === 0)
      .map((el) => `$\\,${el}\\,$`)
      .join(';')}) et l'urne B en contient $${nbMulB}$ (${urneB
      .filter((n) => n % table === 0)
      .map((el) => `$\\,${el}\\,$`)
      .join(';')}).<br>
  L'urne ${
    nbMulA > nbMulB
      ? ` A contient donc le plus grand nombre de boules dont le numéro est un multiple de $${table}$.`
      : ` B contient donc le plus grand nombre de boules dont le numéro est un multiple de $${table}$.`
  }`
    const correction4 = `Il y a $${urneA.filter((n) => n >= min).length}$ nombres supérieurs ou égaux à $${min}$ dans l'urne A et $${urneB.filter((n) => n >= min).length}$ dans l'urne B.<br>
    La probabilité d'obtenir un nombre supérieur ou égal à $${min}$ est de $${probaSupA.texFraction}${probaSupA.estIrreductible ? '' : '=' + probaSupA.texFractionSimplifiee}$ dans l'urne A, et de $${miseEnEvidence(`${probaSupB.texFraction}${probaSupB.estIrreductible ? '' : '=' + probaSupB.texFractionSimplifiee}`)}$ dans l'urne B.`
    const correction5 = `Il y a maintenant $${[...urneA, ajout].filter((n) => n >= min).length}$ nombres sur $${urneA.length + 1}$, supérieurs ou égaux à $${min}$, dans l'urne A et $${[...urneB, ajout].filter((n) => n >= min).length}$ sur $${urneB.length + 1}$ dans l'urne B.<br>
  La probabilité d'obtenir un nombre supérieur ou égal à $${min}$ dans l'urne A est de $${probaSupAajout.texFraction}${probaSupAajout.estIrreductible ? '' : '=' + probaSupAajout.texFractionSimplifiee}$.<br>
  La probabilité d'obtenir un nombre supérieur ou égal à $${min}$ dans l'urne B est de $${probaSupBajout.texFraction}${probaSupBajout.estIrreductible ? '' : '=' + probaSupBajout.texFractionSimplifiee}$.<br>
  $${probaSupAajout.texFractionSimplifiee}${egalOuApprox(probaSupAajout.valeurDecimale, 2)}${texNombre(probaSupAajout.valeurDecimale, 2)}$ et $${probaSupBajout.texFractionSimplifiee}${egalOuApprox(probaSupBajout.valeurDecimale, 2)}${texNombre(probaSupBajout.valeurDecimale, 2)}$.<br>
  La probabilité d'obtenir un nombre supérieur ou égal à $${min}$ n'est donc pas la même quelle que soit l'urne choisie.`
    this.correction = createList({
      items: [correction1, correction2, correction3, correction4, correction5],
      style: 'nombres',
    })

    this.enonce += createList({
      items: [question1, question2, question3, question4, question5],
      style: 'nombres',
    })
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(
      [7, 10, 12, 15, 24, 30],
      [2, 5, 6, 8, 17, 18, 21, 22, 25],
      6,
      20,
      50,
    )
  }

  versionAleatoire: () => void = () => {
    const a = choice([2, 3, 4])
    const A = randint(2, 4)
    const B = randint(2, 4, A)
    const nbNombreA = A * a
    const nbNombreB = B * a
    // LEs deux nombres ont un diviseur commun ce qui permet d'obtenir des probabilités égales.
    let urneA: number[] = []
    let urneB: number[] = []
    let probaPair: FractionEtendue
    let min: number
    let ajout: number
    let mul: number
    let probaMul1: FractionEtendue
    let probaMul2: FractionEtendue
    let probaSupA: FractionEtendue
    let probaSupB: FractionEtendue
    let nbPrem: number
    do {
      urneA = choisitNombresEntreMetN(5, 35, nbNombreA)
      urneB = choisitNombresEntreMetN(5, 35, nbNombreB, urneA)
      min = randint(Math.min(...urneA) + 4, Math.max(...urneA) - 4)
      ajout = randint(40, 60)
      mul = choice([3, 4, 6, 8, 10])
      nbPrem = urneB.filter((n) => estPremier(n)).length
      probaPair = new FractionEtendue(
        urneA.filter((n) => n % 2 === 0).length,
        urneA.length,
      )
      probaMul1 = new FractionEtendue(
        urneA.filter((n) => n % mul === 0).length,
        urneA.length,
      )
      probaMul2 = new FractionEtendue(
        urneB.filter((n) => n % mul === 0).length,
        urneB.length,
      )
      probaSupA = new FractionEtendue(
        urneA.filter((n) => n >= min).length,
        urneA.length,
      )
      probaSupB = new FractionEtendue(
        urneB.filter((n) => n >= min).length,
        urneB.length,
      )
    } while (
      probaMul1.inferieurstrict(2 / urneA.length) ||
      probaMul2.inferieurstrict(2 / urneB.length) ||
      probaMul1.isEqual(probaMul2) ||
      nbPrem < 1 ||
      probaPair.inferieurstrict(2 / urneA.length) ||
      !probaSupA.isEqual(probaSupB)
    )

    this.appliquerLesValeurs(urneA, urneB, mul, min, ajout)
  }
}
