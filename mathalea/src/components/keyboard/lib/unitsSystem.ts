import type { UnitCategory } from '../types/units'

/**
 * Type pour les puissances de 10 utilisées comme clés dans prefixes
 */
type PrefixPower =
  | '24'
  | '21'
  | '18'
  | '15'
  | '12'
  | '9'
  | '6'
  | '3'
  | '2'
  | '1'
  | '0'
  | '-1'
  | '-2'
  | '-3'
  | '-6'
  | '-9'
  | '-12'
  | '-15'
  | '-18'
  | '-21'
  | '-24'

/**
 * Interface pour un préfixe d'unité
 */
interface PrefixInfo {
  symbol: string
  name: string
}

export const prefixes: Record<PrefixPower, PrefixInfo> = {
  '24': {
    symbol: 'Y',
    name: 'yotta',
  },
  '21': {
    symbol: 'Z',
    name: 'zetta',
  },
  '18': {
    symbol: 'E',
    name: 'exa',
  },
  '15': {
    symbol: 'P',
    name: 'peta',
  },
  '12': {
    symbol: 'T',
    name: 'tera',
  },
  '9': {
    symbol: 'G',
    name: 'giga',
  },
  '6': {
    symbol: 'M',
    name: 'méga',
  },
  '3': {
    symbol: 'k',
    name: 'kilo',
  },
  '2': {
    symbol: 'h',
    name: 'hecto',
  },
  '1': {
    symbol: 'da',
    name: 'déca',
  },
  '0': {
    symbol: '',
    name: '',
  },
  '-1': {
    symbol: 'd',
    name: 'déci',
  },
  '-2': {
    symbol: 'c',
    name: 'centi',
  },
  '-3': {
    symbol: 'm',
    name: 'milli',
  },
  '-6': {
    symbol: 'μ',
    name: 'micro',
  },
  '-9': {
    symbol: 'n',
    name: 'nano',
  },
  '-12': {
    symbol: 'p',
    name: 'pico',
  },
  '-15': {
    symbol: 'f',
    name: 'femto',
  },
  '-18': {
    symbol: 'a',
    name: 'atto',
  },
  '-21': {
    symbol: 'z',
    name: 'zepto',
  },
  '-24': {
    symbol: 'y',
    name: 'yocto',
  },
} as const

/**
 * Interface pour une unité de base
 */
interface UnitInfo {
  symbol: string
  name: string
}

export const units: Record<UnitCategory, UnitInfo> = {
  length: {
    symbol: 'm',
    name: 'mètre',
  },
  volume: {
    // changé de 'content' vers 'volume' pour correspondre au type UnitCategory
    symbol: 'L',
    name: 'litre',
  },
  mass: {
    symbol: 'g',
    name: 'gramme',
  },
  power: {
    symbol: 'W',
    name: 'watt',
  },
  electric: {
    // changé de 'current' vers 'electric' pour correspondre au type UnitCategory
    symbol: 'A',
    name: 'ampère',
  },
  frequency: {
    symbol: 'Hz',
    name: 'hertz',
  },
  energy: {
    symbol: 'J',
    name: 'joule',
  },
  // Ajout des catégories manquantes pour correspondre au type UnitCategory
  time: {
    symbol: 's',
    name: 'seconde',
  },
  area: {
    symbol: 'a',
    name: 'are',
  },
  temperature: {
    symbol: '°C',
    name: 'degré Celsius',
  },
  pressure: {
    symbol: 'Pa',
    name: 'pascal',
  },
  speed: {
    symbol: 'm/s',
    name: 'mètre par seconde',
  },
  force: {
    symbol: 'N',
    name: 'newton',
  },
  angle: {
    symbol: 'rad',
    name: 'radian',
  },
} as const

export class Unit {
  prefix: PrefixPower
  category: UnitCategory
  exp: 1 | 2 | 3
  name: string
  symbol: string
  insert: string
  private superscript = [
    {
      name: '',
      symbol: '',
      latexInsert: '',
    },
    {
      name: ' carré',
      symbol: '²',
      latexInsert: '^2',
    },
    {
      name: ' cube',
      symbol: '³',
      latexInsert: '^3',
    },
  ]

  constructor(pre: PrefixPower, cat: UnitCategory, e: 1 | 2 | 3 = 1) {
    this.prefix = pre
    this.category = cat
    this.exp = e
    this.name = [
      prefixes[this.prefix].name,
      units[this.category].name,
      this.superscript[this.exp - 1].name,
    ].join('')
    this.symbol = [
      prefixes[this.prefix].symbol,
      units[this.category].symbol,
      this.superscript[this.exp - 1].symbol,
    ].join('')
    const symbol = [
      prefixes[this.prefix].symbol,
      units[this.category].symbol,
    ].join('')
    const pow = this.superscript[this.exp - 1].latexInsert
    this.insert = `$$\\operatorname{ ${symbol}}${pow}$$`
  }
}

export class UnitSystem {
  units: Unit[]
  private exp: number

  constructor(prefixList: PrefixPower[], cat: UnitCategory, e: 1 | 2 | 3 = 1) {
    this.units = prefixList.map((p) => new Unit(p, cat, e))
    this.exp = e
  }
}

export const lengthUnits: UnitSystem = new UnitSystem(
  ['3', '2', '1', '0', '-1', '-2', '-3'],
  'length',
)
export const areaMetricUnits: UnitSystem = new UnitSystem(
  ['3', '2', '1', '0', '-1', '-2', '-3'],
  'length',
  2,
)
export const areaOtherUnits: UnitSystem = new UnitSystem(
  ['2', '0', '-2'],
  'area',
)
export const volumeMetricUnits: UnitSystem = new UnitSystem(
  ['3', '2', '1', '0', '-1', '-2', '-3'],
  'length',
  3,
)
export const volumeOtherUnits: UnitSystem = new UnitSystem(
  ['2', '1', '0', '-1', '-2', '-3'],
  'volume', // changé de 'content' vers 'volume'
)
export const massUnits: UnitSystem = new UnitSystem(
  ['3', '2', '1', '0', '-1', '-2', '-3'],
  'mass',
)
