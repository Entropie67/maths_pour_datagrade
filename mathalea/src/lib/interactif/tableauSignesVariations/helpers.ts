import type {
  CelluleFleche,
  CelluleSigne,
  CelluleValeur,
  ColonneConfig,
  Ligne,
  LigneSigne,
  LigneValeur,
  LigneVariation,
  TableauSVConfig,
} from './types'

// ===== Utilitaires de construction (sucre syntaxique pour les exercices) =====

export function colonne(
  valeur: string,
  opts: Partial<ColonneConfig> = {},
): ColonneConfig {
  return { valeur, ...opts }
}

export function celluleSigne(
  symbole: CelluleSigne['symbole'],
  opts: Partial<CelluleSigne> = {},
): CelluleSigne {
  return { symbole, ...opts }
}

export function celluleFleche(
  sens: CelluleFleche['sens'],
  opts: Partial<CelluleFleche> = {},
): CelluleFleche {
  return { sens, ...opts }
}

export function celluleValeur(
  latex: string,
  opts: Partial<CelluleValeur> = {},
): CelluleValeur {
  return { latex, ...opts }
}

/**
 * Cellule avec deux valeurs (limite à gauche et limite à droite d'une discontinuité).
 * @param latexGauche Limite à gauche (affiché côté gauche de la barre).
 * @param latexDroite Limite à droite (affiché côté droit de la barre).
 */
export function celluleValeurDouble(
  latexGauche: string,
  latexDroite: string,
  opts: Partial<Omit<CelluleValeur, 'latex' | 'latexDroite'>> = {},
): CelluleValeur {
  return { latex: latexGauche, latexDroite, ...opts }
}

export function ligneSigne(
  label: string,
  cellules: CelluleSigne[],
): LigneSigne {
  return { type: 'signe', label, cellules }
}

export function ligneVariation(
  label: string,
  valeurs: CelluleValeur[],
  fleches: CelluleFleche[],
): LigneVariation {
  return { type: 'variation', label, valeurs, fleches }
}

export function ligneValeur(
  label: string,
  valeurs: CelluleValeur[],
): LigneValeur {
  return { type: 'valeur', label, valeurs }
}

/**
 * Retourne une copie de la config où chaque cellule éditable est remplacée
 * par sa valeur `expected`. La config résultante peut être affichée en
 * lecture seule pour montrer le tableau corrigé.
 * Avec `enEvidence`, ces cellules sont aussi mises en évidence : seules les
 * différences avec le tableau vierge apparaissent ainsi.
 */
export function configCorrige(
  config: TableauSVConfig,
  options: { enEvidence?: boolean } = {},
): TableauSVConfig {
  const evidence = options.enEvidence ? { highlight: true } : {}
  return {
    ...config,
    colonnes: config.colonnes.map((col) => {
      if (col.editable && col.expected != null) {
        const { editable: _, expected: __, ...rest } = col
        return { ...rest, ...evidence, valeur: col.expected }
      }
      return col
    }),
    lignes: config.lignes.map((ligne) => {
      if (ligne.type === 'signe') {
        return {
          ...ligne,
          cellules: ligne.cellules.map((c) => {
            if (c.editable && c.expected != null) {
              const { editable: _, expected: __, ...rest } = c
              return {
                ...rest,
                ...evidence,
                symbole: corrigeSigneSymbol(c.symbole, c.expected),
              }
            }
            return c
          }),
        }
      }
      if (ligne.type === 'variation') {
        return {
          ...ligne,
          valeurs: ligne.valeurs.map((c) => {
            if (c.editable && c.expected != null) {
              const { editable: _, expected: __, ...rest } = c
              return { ...rest, ...evidence, latex: c.expected }
            }
            return c
          }),
          fleches: ligne.fleches.map((c) => {
            if (c.editable && c.expected != null) {
              const { editable: _, expected: __, ...rest } = c
              return { ...rest, ...evidence, sens: c.expected }
            }
            return c
          }),
        }
      }
      // type === 'valeur'
      return {
        ...ligne,
        valeurs: ligne.valeurs.map((c) => {
          if (c.editable && c.expected != null) {
            const { editable: _, expected: __, ...rest } = c
            return { ...rest, latex: c.expected }
          }
          return c
        }),
      }
    }),
  }
}

export type { CelluleValeur, Ligne, TableauSVConfig }

/**
 * Combine le type de barre de l'original avec la valeur signe attendue.
 * Ex : original '|', expected '0' → '|0' ; original '||', expected '' → '||'.
 * Si expected est déjà un symbole complet avec barre, il est utilisé tel quel.
 */
function corrigeSigneSymbol(
  original: CelluleSigne['symbole'],
  expected: CelluleSigne['symbole'],
): CelluleSigne['symbole'] {
  if (expected === '|' || expected === '||' || expected === '|0' || expected === '||0') {
    return expected
  }
  const isDouble = original === '||' || original === '||0'
  const isSingle = original === '|' || original === '|0'
  if (isDouble) return expected === '0' ? '||0' : '||'
  if (isSingle) return expected === '0' ? '|0' : '|'
  return expected
}
