import EquationSecondDegre from '../../modules/EquationSecondDegre'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import { ecritureAlgebrique, rienSi1 } from '../outils/ecritures'
import { ppcmListe } from '../outils/primalite'
import MonomePlusieursVariables from './MonomePlusieursVariables'
import PolynomePlusieursVariables from './PolynomePlusieursVariables'

class PolynomeFactorisable {
  racinesRationnelles: (number | FractionEtendue)[]
  facteurSansRacineRationnelle: PolynomePlusieursVariables
  coeffDominant: FractionEtendue
  polynome: PolynomePlusieursVariables
  coefficients: FractionEtendue[]
  polynomeEquivEntier: PolynomePlusieursVariables
  ppcm: number

  constructor(
    racinesRationnelles: (number | FractionEtendue)[],
    coeffDominant: FractionEtendue,
    facteurSansRacineRationnelle: PolynomePlusieursVariables = new PolynomePlusieursVariables(
      [
        new MonomePlusieursVariables(new FractionEtendue(1, 1), {
          variables: ['x'],
          exposants: [0],
        }),
      ],
    ),
  ) {
    this.racinesRationnelles = racinesRationnelles
    this.coeffDominant = coeffDominant
    this.facteurSansRacineRationnelle = facteurSansRacineRationnelle
    this.polynome = PolynomeFactorisable.creerPolynome(
      racinesRationnelles,
      coeffDominant,
    )
      .produit(facteurSansRacineRationnelle)
      .reduire()
    this.coefficients = this.polynome.reduire().termes()
    this.ppcm = ppcmListe(this.coefficients.map((c) => c.simplifie().den))
    this.polynomeEquivEntier = PolynomeFactorisable.creerPolynome(
      racinesRationnelles,
      coeffDominant.multiplieEntier(this.ppcm),
    )
      .produit(facteurSansRacineRationnelle)
      .reduire()
  }

  static creerPolynome(
    racines: (number | FractionEtendue)[],
    coeffDominant: number | FractionEtendue,
  ) {
    return PolynomePlusieursVariables.createPolynomeFromRoots(
      racines,
      coeffDominant as FractionEtendue,
    )
  }

  static creerPolynomeAleatoire(
    degre: number,
    typeRacines: 'entieres' | 'rationnelles' | 'reelles',
    typeCoeff: 'entier' | 'rationnel',
    completementFactorisable: boolean,
    nbRacinesMaxEgales: number,
    nbRacinesMinEgales: number = 1,
  ): PolynomeFactorisable {
    if (degre < 3 || degre > 4) {
      throw new Error('Le degré doit être entre 1 et 4.')
    }
    let degreCourant = 0
    let compteurRacinesRationnelles = 0
    let compteurRacinesEgales = 0
    let partieSansRacineRationnelle = new PolynomePlusieursVariables([
      new MonomePlusieursVariables(new FractionEtendue(1, 1), {
        variables: ['x'],
        exposants: [0],
      }),
    ])
    if (!completementFactorisable || typeRacines === 'reelles') {
      degreCourant += 2
    }
    const racines: FractionEtendue[] = []
    let coeffDominant = new FractionEtendue(1, 1)
    while (degreCourant < degre) {
      let racine: FractionEtendue
      racine = new FractionEtendue(0, 1)
      if (
        (typeRacines === 'rationnelles' || typeRacines === 'reelles') &&
        compteurRacinesRationnelles < 1
      ) {
        compteurRacinesRationnelles++
        let numerateur: number
        let denominateur: number
        do {
          numerateur = randint(-5, 5, [-4, 4, 0]) // Numérateur entre -5 et 5
          denominateur = randint(1, 5, [4, 0]) // Dénominateur entre 1 et 5
          racine = new FractionEtendue(numerateur, denominateur).simplifie()
        } while (racine.simplifie().den === 1)
      } else {
        racine = new FractionEtendue(randint(-7, 7, [0]), 1) // Racine entière entre -5 et 5
      }
      // Vérifier la multiplicité maximale
      const count = racines.filter((r) =>
        r.simplifie().isEqual(racine.simplifie()),
      ).length
      if (count < nbRacinesMaxEgales) {
        racines.push(racine.simplifie())
        if (compteurRacinesEgales < nbRacinesMinEgales) {
          racines.push(racine.simplifie())
          compteurRacinesEgales++
          degreCourant++
        }
        degreCourant++
      }
    }
    if (typeCoeff === 'entier') {
      const denominators = racines.map((r) => r.den)
      let mult = ppcmListe(denominators)
      if (mult === 1) {
        mult = randint(-3, 3, [0])
      }
      coeffDominant = new FractionEtendue(mult, 1)
    } else {
      coeffDominant = new FractionEtendue(
        randint(1, 5, [0]),
        randint(1, 5, [0]),
      ).simplifie()
    }
    if (!completementFactorisable) {
      const b = randint(-1, 1)
      partieSansRacineRationnelle = new PolynomePlusieursVariables([
        new MonomePlusieursVariables(new FractionEtendue(1, 1), {
          variables: ['x'],
          exposants: [2],
        }),
        new MonomePlusieursVariables(new FractionEtendue(b, 1), {
          variables: ['x'],
          exposants: [1],
        }),
        new MonomePlusieursVariables(
          new FractionEtendue(
            randint(0 + Math.abs(b), 2 - Math.abs(b), [0]),
            1,
          ),
          { variables: ['x'], exposants: [0] },
        ),
      ])
    }
    if (typeRacines === 'reelles' && completementFactorisable) {
      const c = randint(-2, -1)
      partieSansRacineRationnelle = new PolynomePlusieursVariables([
        new MonomePlusieursVariables(new FractionEtendue(1, 1), {
          variables: ['x'],
          exposants: [2],
        }),
        new MonomePlusieursVariables(-randint(2, 2, [0]), {
          variables: ['x'],
          exposants: [1],
        }),
        new MonomePlusieursVariables(new FractionEtendue(c, 1), {
          variables: ['x'],
          exposants: [0],
        }),
      ])
    }
    return new PolynomeFactorisable(
      racines,
      coeffDominant,
      partieSansRacineRationnelle,
    )
  }

  toLatex(factorise: boolean = false): string {
    if (!factorise) {
      return this.polynome.toString()
    }

    // Count multiplicities of roots
    const rootCounts = new Map<
      string,
      { root: number | FractionEtendue; count: number }
    >()
    for (const root of this.racinesRationnelles) {
      const rootKey =
        root instanceof FractionEtendue ? root.toLatex() : root.toString()
      if (rootCounts.has(rootKey)) {
        rootCounts.get(rootKey)!.count++
      } else {
        rootCounts.set(rootKey, { root, count: 1 })
      }
    }

    // Format coefficient dominant using rienSi1
    const coeffStr = rienSi1(this.coeffDominant)

    // Build factorized form
    const factors: string[] = []

    for (const { root, count } of rootCounts.values()) {
      // Use ecritureAlgebrique to handle the sign properly
      const rootAlgebraique = ecritureAlgebrique(
        root instanceof FractionEtendue ? root.oppose() : -root,
      )
      const factor = `\\left(x${rootAlgebraique}\\right)`

      if (count === 1) {
        factors.push(factor)
      } else {
        factors.push(`${factor}^{${count}}`)
      }
    }

    // Combine coefficient and factors
    let result = coeffStr + factors.join('')
    if (!factorise && this.facteurSansRacineRationnelle.toString() !== '1') {
      result += result + this.facteurSansRacineRationnelle.toString()
    } else if (
      factorise &&
      this.facteurSansRacineRationnelle.toString() !== '1'
    ) {
      result += EquationSecondDegre.aPartirDuPolynome(
        this.facteurSansRacineRationnelle,
      ).printToLatexFormeFactorisee()
    }

    return result || '0'
  }

  /**
   * Génère l'expression LaTeX de la forme factorisée avec une valeur substituée pour x
   * @param x - La valeur à substituer (FractionEtendue ou number)
   * @returns String LaTeX avec la substitution
   */
  toLatexFactoriseSubstitue(x: FractionEtendue | number): string {
    const xFrac = x instanceof FractionEtendue ? x : new FractionEtendue(x, 1)

    // Count multiplicities of roots
    const rootCounts = new Map<
      string,
      { root: FractionEtendue; count: number }
    >()
    for (const root of this.racinesRationnelles) {
      const rootFrac =
        root instanceof FractionEtendue ? root : new FractionEtendue(root, 1)
      const rootKey = rootFrac.toLatex()
      if (rootCounts.has(rootKey)) {
        rootCounts.get(rootKey)!.count++
      } else {
        rootCounts.set(rootKey, { root: rootFrac, count: 1 })
      }
    }

    // Format coefficient dominant using rienSi1
    const coeffStr = rienSi1(this.coeffDominant)

    // Build factorized form with substitution
    const factors: string[] = []

    for (const { root, count } of rootCounts.values()) {
      // Format as (value - root) without evaluating
      const xStr = xFrac.texFractionSimplifiee
      const rootAlgebraique = ecritureAlgebrique(root.oppose())

      const factor = `\\left(${xStr}${rootAlgebraique}\\right)`

      if (count === 1) {
        factors.push(factor)
      } else {
        factors.push(`${factor}^{${count}}`)
      }
    }

    // Combine coefficient and factors
    let result = coeffStr + factors.join('')

    // Handle non-rational factor if present
    if (this.facteurSansRacineRationnelle.toString() !== '1') {
      const valeurFacteur = this.facteurSansRacineRationnelle.evaluer({
        x: xFrac,
      })
      result += `\\left(${valeurFacteur.texFractionSimplifiee}\\right)`
    }

    return result || '0'
  }
}
export default PolynomeFactorisable
