export interface IFractionEtendue {
  readonly num: number
  readonly den: number
  readonly numIrred: number
  readonly denIrred: number
  readonly n: number
  readonly d: number
  readonly s: -1 | 0 | 1
  readonly type: 'FractionEtendue'
  readonly sign: -1 | 0 | 1
  readonly signe: -1 | 0 | 1
  readonly signeString: '+' | '-' | ''

  readonly pourcentage: number
  readonly texFraction: string
  readonly texFractionSimplifiee: string
  readonly texFSD: string
  readonly texFractionSR: string
  readonly texFractionSignee: string
  readonly texFractionSaufUn: string
  readonly valeurDecimale: number
  readonly texFractionSaufUnSignee: string
  readonly texFSP: string
  readonly texParentheses: string
  readonly ecritureAlgebrique: string
  readonly ecritureParentheseSiNegatif: string

  readonly estEntiere: boolean
  readonly estParfaite: boolean
  readonly estIrreductible: boolean

  toLatex(): string
  toNumber(): number
  toString(): string
  valueOf(): number

  simplifie(): IFractionEtendue
  valeurAbsolue(): IFractionEtendue
  oppose(): IFractionEtendue
  reduire(k: number): IFractionEtendue

  isEqual(f2: IFractionEtendue | number): boolean
  differenceFraction(f: IFractionEtendue | number): IFractionEtendue

  multiplieEntier(n: number): IFractionEtendue
  entierDivise(n: number): IFractionEtendue
  ajouteEntier(n: number): IFractionEtendue
  entierMoinsFraction(n: number): IFractionEtendue

  superieurLarge(f2: IFractionEtendue | number): boolean
  superieurstrict(f2: IFractionEtendue | number): boolean
  inferieurstrict(f2: IFractionEtendue | number): boolean
  inferieurlarge(f2: IFractionEtendue | number): boolean
  estUneSimplification(f2: IFractionEtendue): boolean

  sommeFraction(f2: IFractionEtendue): IFractionEtendue
  sommeFractions(...fractions: IFractionEtendue[]): IFractionEtendue

  produitFraction(f2: IFractionEtendue | number): IFractionEtendue
  produitFractions(...fractions: IFractionEtendue[]): IFractionEtendue

  texProduitFraction(
    f2: IFractionEtendue,
    simplification?: boolean | 'none',
  ): string
  texDiviseFraction(
    f2: IFractionEtendue,
    simplification?: boolean | 'none',
    symbole?: string,
  ): string
  texQuotientFraction(f2: IFractionEtendue): string
  texSimplificationAvecEtapes(
    factorisation?: boolean | 'none',
    couleurFinale?: string,
  ): string
  texSimplificationParFacteursCommuns(
    facteursNumerateur: number[],
    facteursDenominateur: number[],
  ): string

  puissanceFraction(n: number): IFractionEtendue
  inverse(): IFractionEtendue
  diviseFraction(f2: IFractionEtendue | number): IFractionEtendue
  diviseEntier(n: number): IFractionEtendue

  fractionDecimale(): IFractionEtendue
  racineCarree(): IFractionEtendue | false
}
