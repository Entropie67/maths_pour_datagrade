/**
 * Préfixes d'unités du système international
 */
export type Prefix =
  | 'yotta'
  | 'Y'
  | 'zetta'
  | 'Z'
  | 'exa'
  | 'E'
  | 'peta'
  | 'P'
  | 'tera'
  | 'T'
  | 'giga'
  | 'G'
  | 'mega'
  | 'M'
  | 'kilo'
  | 'k'
  | 'hecto'
  | 'h'
  | 'deca'
  | 'da'
  | 'deci'
  | 'd'
  | 'centi'
  | 'c'
  | 'milli'
  | 'm'
  | 'micro'
  | 'μ'
  | 'nano'
  | 'n'
  | 'pico'
  | 'p'
  | 'femto'
  | 'f'
  | 'atto'
  | 'a'
  | 'zepto'
  | 'z'
  | 'yocto'
  | 'y'

/**
 * Catégories d'unités de mesure
 */
export type UnitCategory =
  | 'length' // longueur (m, cm, mm, km, etc.)
  | 'mass' // masse (g, kg, t, etc.)
  | 'time' // temps (s, min, h, etc.)
  | 'area' // surface (m², cm², ha, etc.)
  | 'volume' // volume (L, mL, m³, etc.)
  | 'temperature' // température (°C, K, °F)
  | 'energy' // énergie (J, kWh, cal, etc.)
  | 'power' // puissance (W, kW, hp, etc.)
  | 'pressure' // pression (Pa, bar, atm, etc.)
  | 'speed' // vitesse (m/s, km/h, mph, etc.)
  | 'force' // force (N, kgf, lbf, etc.)
  | 'electric' // électricité (A, V, Ω, etc.)
  | 'angle' // angle (rad, deg, grad, etc.)
  | 'frequency' // fréquence (Hz, rpm, etc.)
