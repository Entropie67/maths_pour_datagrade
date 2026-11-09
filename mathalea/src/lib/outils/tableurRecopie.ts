import { choice } from './arrayOutils'
import { randint } from '../../modules/outils'
import {
  formateReference,
  recopieFormule,
  refCellule,
  type Reference,
} from './tableurFormules'

export type RecopieDeFormule = {
  origine: string
  destination: string
  /** Formule saisie dans la cellule d'origine. */
  formule: string
  /** Formule obtenue dans la cellule de destination. */
  formuleRecopiee: string
  /** Décalage de la recopie, en colonnes et en lignes. */
  dColonnes: number
  dLignes: number
}

/** 1 : sans `$` ; 2 : références mixtes (`$A1`, `A$1`) ; 3 : références absolues (`$A$1`) ; 4 : tout */
export type ModeDollar = 1 | 2 | 3 | 4

/** 1 : vers la droite ; 2 : vers le bas ; 3 : vers la droite et vers le bas */
export type ModeRecopie = 1 | 2 | 3

type OptionsRecopie = {
  mode: ModeRecopie
  dollar: ModeDollar
  /** Taille de la feuille : toutes les références doivent y rester. */
  nbColonnes: number
  nbLignes: number
}

function reference(
  colonne: number,
  ligne: number,
  dollar: ModeDollar,
): Reference {
  const forme =
    dollar === 1
      ? 'relative'
      : dollar === 2
        ? choice(['colonne', 'ligne'])
        : dollar === 3
          ? choice(['absolue', 'relative'])
          : choice(['relative', 'colonne', 'ligne', 'absolue'])
  return {
    colonne,
    ligne,
    colonneAbsolue: forme === 'colonne' || forme === 'absolue',
    ligneAbsolue: forme === 'ligne' || forme === 'absolue',
  }
}

/**
 * Tire une formule à deux références, la cellule dans laquelle elle est
 * saisie et celle où elle est recopiée. La formule recopiée reste dans la
 * feuille, et au moins une référence change et une référence bloquée
 * intervient quand `dollar` est supérieur à 1.
 */
export function creeRecopie({
  mode,
  dollar,
  nbColonnes,
  nbLignes,
}: OptionsRecopie): RecopieDeFormule {
  for (let essai = 0; essai < 1000; essai++) {
    const dColonnes = mode === 2 ? 0 : randint(1, 3)
    const dLignes = mode === 1 ? 0 : randint(1, 3)
    const colonneOrigine = randint(1, Math.max(1, nbColonnes - 1 - dColonnes))
    const ligneOrigine = randint(1, Math.max(1, nbLignes - 1 - dLignes))
    const origine = refCellule(colonneOrigine, ligneOrigine)
    const destination = refCellule(
      colonneOrigine + dColonnes,
      ligneOrigine + dLignes,
    )
    const refs = [0, 1].map(() =>
      reference(
        randint(0, nbColonnes - 1 - dColonnes),
        randint(0, nbLignes - 1 - dLignes),
        dollar,
      ),
    )
    const [r1, r2] = refs.map(formateReference)
    if (r1 === r2) continue
    const absolues = refs.filter((r) => r.colonneAbsolue || r.ligneAbsolue)
    if (dollar > 1 && absolues.length === 0) continue
    if (dollar === 3 && absolues.length === 2) continue
    // les références ne désignent ni la cellule saisie ni sa recopie
    const interdites = [origine, destination]
    const sansDollar = (r: Reference) => refCellule(r.colonne, r.ligne)
    if (refs.some((r) => interdites.includes(sansDollar(r)))) continue
    const formule = `=${r1}${choice(['+', '-', '*'])}${r2}`
    const formuleRecopiee = recopieFormule(formule, origine, destination)
    if (formuleRecopiee === formule || formuleRecopiee.includes('#REF!')) {
      continue
    }
    return {
      origine,
      destination,
      formule,
      formuleRecopiee,
      dColonnes,
      dLignes,
    }
  }
  throw new Error('Impossible de générer une recopie de formule')
}

/** Phrase décrivant le décalage d'une recopie, ex. « 2 colonnes vers la droite et 3 lignes vers le bas ». */
export function decritDecalage(dColonnes: number, dLignes: number): string {
  const morceaux: string[] = []
  if (dColonnes !== 0) {
    morceaux.push(
      `$${Math.abs(dColonnes)}$ colonne${Math.abs(dColonnes) > 1 ? 's' : ''} vers la ${dColonnes > 0 ? 'droite' : 'gauche'}`,
    )
  }
  if (dLignes !== 0) {
    morceaux.push(
      `$${Math.abs(dLignes)}$ ligne${Math.abs(dLignes) > 1 ? 's' : ''} vers le ${dLignes > 0 ? 'bas' : 'haut'}`,
    )
  }
  return morceaux.join(' et ')
}
