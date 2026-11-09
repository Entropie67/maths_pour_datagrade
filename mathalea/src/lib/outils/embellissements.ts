import { context } from '../../modules/context'
import type { IFractionEtendue } from '../../modules/FractionEtendue.type'
import { mathaleaColorAliases } from '../2d/colorToLatexOrHtml'
import { bleuMathalea, orangeMathalea } from '../colors'
import { Complexe } from '../mathFonctions/Complexe'
import { choice } from './arrayOutils'

// Garde structurel pour détecter une FractionEtendue
const isFractionEtendue = (x: unknown): x is IFractionEtendue =>
  typeof x === 'object' &&
  x !== null &&
  typeof (x as any).sommeFraction === 'function'

/**
 * Met en évidence une valeur suivie de son unité (à utiliser entre $).
 * En interactif, le champ ne contient que la valeur : seule la valeur est mise en évidence.
 * En non interactif, l'unité l'est aussi.
 * @param valeur valeur attendue dans le champ
 * @param unite unité en mode mathématique, par exemple `\\text{ cm}^2`
 * @param interactif true si l'exercice est interactif
 * @param couleur couleur de la mise en évidence (orange CoopMaths par défaut)
 */
export function miseEnEvidenceAvecUnite(
  valeur: string | number,
  unite: string,
  interactif: boolean,
  couleur: string = orangeMathalea,
) {
  return interactif
    ? `${miseEnEvidence(valeur, couleur)}${unite}`
    : miseEnEvidence(`${valeur}${unite}`, couleur)
}

/**
 * Met en couleur et en gras
 *
 * Met en couleur et gras un texte. JCL dit : "S'utilise entre $ car utilise des commandes qui fonctionnent en math inline"
 * @param {string|number} texte à mettre en couleur
 * @param {string} couleur en anglais ou code couleur hexadécimal par défaut c'est le orange de CoopMaths
 * @author Rémi Angot
 */
export function miseEnEvidence(
  texte: string | IFractionEtendue | number | Complexe,
  couleur: string = orangeMathalea,
) {
  if (texte instanceof Complexe) texte = texte.tex()
  if (isFractionEtendue(texte)) texte = texte.texFraction
  if (typeof texte === 'number') texte = String(texte)
  if (Array.isArray(couleur)) couleur = couleur[0]
  couleur = mathaleaColorAliases[couleur] ?? couleur
  texte = texte.replace(/\\text\{/g, '\\textbf{')

  if (context.isHtml) {
    return `{\\color{${couleur}}\\boldsymbol{${texte}}}`
  } else {
    if (couleur[0] === '#') {
      return `{\\color[HTML]{${couleur.replace('#', '')}}\\boldsymbol{${texte}}}`
    } else {
      return `{\\color{${couleur.replace('#', '')}}\\boldsymbol{${texte}}}`
    }
  }
}

/**
 * Met en évidence un seul chiffre d’un nombre au format LaTeX, en le coloriant et le mettant en gras.
 *
 * - Si le texte contient une virgule, la fonction identifie la partie entière (à gauche)
 *   et la partie décimale (à droite), puis colore le chiffre selon la position demandée.
 * - Si le texte ne contient pas de virgule, seul un chiffre de la partie entière est ciblé.
 *
 * @param {string | FractionEtendue | number} texte - Le nombre ou texte à analyser.
 *   Peut être :
 *   - une chaîne (ex. "123,45")
 *   - un nombre (ex. 123.45)
 *   - une instance de `FractionEtendue` (sa propriété `texFraction` sera utilisée)
 *
 * @param {string} [couleur=orangeMathalea] - Couleur à utiliser pour le chiffre mis en évidence.
 *   Peut être un nom de couleur LaTeX (ex. `"red"`) ou un code hexadécimal (ex. `"#FF0000"`).
 *
 * @param {number} [position=1] - La position du chiffre à mettre en évidence :
 *   - `0.001` → 3e chiffre à droite de la virgule (millième)
 *   - `0.01`  → 2e chiffre à droite de la virgule (centième)
 *   - `0.1`   → 1er chiffre à droite de la virgule (dixième)
 *   - `1`     → chiffre immédiatement à gauche de la virgule (unité)
 *   - `10`    → 2e chiffre à gauche de la virgule (dizaine)
 *   - `100`   → 3e chiffre à gauche de la virgule (centaine)
 *   - `1000`  → 4e chiffre à gauche de la virgule (millier)
 * @author Éric Elter
 * @returns {string} Une chaîne LaTeX avec un seul chiffre mis en couleur et en gras.
 *   Le reste du nombre est laissé tel quel.
 */

export function coloreUnSeulChiffre(
  texte: string | IFractionEtendue | number,
  couleur: string = orangeMathalea,
  position: number = 1,
): string {
  if (isFractionEtendue(texte)) texte = texte.texFraction
  if (typeof texte === 'number') texte = String(texte)
  if (Array.isArray(couleur)) couleur = couleur[0]
  couleur = mathaleaColorAliases[couleur] ?? couleur

  const getColorLatex = (contenu: string): string => {
    if (context.isHtml) {
      return `\\color{${couleur}}\\boldsymbol{${contenu}}`
    } else if (couleur.startsWith('#')) {
      return `\\color[HTML]{${couleur.slice(1)}}\\boldsymbol{${contenu}}`
    } else {
      return `\\color{${couleur}}\\boldsymbol{${contenu}}`
    }
  }

  const indexGauche = new Map<number, number>([
    [1, -1], // unités
    [10, -2], // dizaines
    [100, -3], // centaines
    [1000, -6], // milliers -6 à cause du séparateur de milliers
  ])

  const indexDroite = new Map<number, number>([
    [0.1, 0], // dixièmes
    [0.01, 1], // centièmes
    [0.001, 2], // millièmes
  ])

  const estDroite = position < 1
  const index = estDroite
    ? indexDroite.get(position)
    : indexGauche.get(position)
  if (index === undefined) return texte // sécurité

  // Cas avec virgule
  if (texte.includes(',')) {
    const [partieEntiere, partieDecimale] = texte.split(',')

    if (estDroite) {
      if (index >= partieDecimale.length) return texte
      const avant = partieDecimale.slice(0, index)
      const chiffreCible = partieDecimale.charAt(index)
      const apres = partieDecimale.slice(index + 1)
      const colored = getColorLatex(chiffreCible)
      return `\\boldsymbol{${partieEntiere},${avant}}{${colored}}\\boldsymbol{${apres}}`
    } else {
      const pos = partieEntiere.length + index
      if (pos < 0 || pos >= partieEntiere.length) return texte
      const prefixe = partieEntiere.slice(0, pos)
      const chiffreCible = partieEntiere.charAt(pos)
      const suffixe = partieEntiere.slice(pos + 1)
      const colored = getColorLatex(chiffreCible)

      return `\\boldsymbol{${prefixe}}{${colored}}\\boldsymbol{${suffixe},${partieDecimale}}`
    }
  }

  // Cas sans virgule
  const partieEntiere = texte
  if (estDroite) {
    // Pas de partie décimale → on ne peut pas accéder à des chiffres à droite
    return texte
  } else {
    const pos = partieEntiere.length + index
    if (pos < 0 || pos >= partieEntiere.length) return texte
    const prefixe = partieEntiere.slice(0, pos)
    const chiffreCible = partieEntiere.charAt(pos)
    const suffixe = partieEntiere.slice(pos + 1)
    const colored = getColorLatex(chiffreCible)
    return `\\boldsymbol{${prefixe}}{${colored}}\\boldsymbol{${suffixe}}`
  }
}

/**
 * Met en couleur
 * Met en couleur un texte. JCL dit : "S'utilise entre $ car utilise des commandes qui fonctionnent en math inline"
 * @param {string} texte à mettre en couleur
 * @param {string} couleur en anglais ou code couleur hexadécimal par défaut c'est le orange de CoopMaths
 * @author Guillaume Valmont d'apres MiseEnEvidence() de Rémi Angot
 */
export function miseEnCouleur(
  texte: string | number,
  couleur: string = orangeMathalea,
) {
  texte = typeof texte === 'number' ? String(texte) : texte
  if (Array.isArray(couleur)) couleur = couleur[0]
  couleur = mathaleaColorAliases[couleur] ?? couleur
  if (context.isHtml) {
    return `{\\color{${couleur}} ${texte}}`
  } else {
    if (couleur[0] === '#') {
      return `{\\color[HTML]{${couleur.replace('#', '')}} ${texte}}`
    } else {
      return `{\\color{${couleur}} ${texte}}`
    }
  }
}

/**
 * Met en couleur un texte
 * @param {string} texte à mettre en couleur
 * @param {string} couleur en anglais ou code couleur hexadécimal par défaut c'est le orange de CoopMaths
 * @author Rémi Angot
 */
export function texteEnCouleur(
  texte: string | number,
  couleur = orangeMathalea,
) {
  texte = typeof texte === 'number' ? String(texte) : texte
  if (Array.isArray(couleur)) couleur = couleur[0]
  couleur = mathaleaColorAliases[couleur] ?? couleur
  if (context.isHtml) {
    return `<span style="color:${couleur};">${texte}</span>`
  } else {
    if (couleur[0] === '#') {
      return `{\\color[HTML]{${couleur.replace('#', '')}}${texte}}`
    } else {
      return `{\\color{${couleur.replace('#', '')}}${texte}}`
    }
  }
}

/**
 * Met en couleur et gras un texte. JCL dit : "Ne fonctionne qu'en dehors de $....$". Utiliser miseEnEvidence si $....$.
 * @param {string} texte à mettre en couleur
 * @param {string} couleur en anglais ou code couleur hexadécimal par défaut c'est le orange de CoopMaths
 * @author Rémi Angot
 */
export function texteEnCouleurEtGras(
  texte: string | number,
  couleur = orangeMathalea,
) {
  if (typeof texte === 'number') texte = String(texte)
  if (Array.isArray(couleur)) couleur = couleur[0]
  couleur = mathaleaColorAliases[couleur] ?? couleur
  if (context.isHtml) {
    return `<span style="color:${couleur};font-weight: bold;">${texte}</span>`
  }
  if (couleur[0] === '#') {
    return `{\\bfseries \\color[HTML]{${couleur.replace('#', '')}}${texte}}`
  }
  return `{\\bfseries \\color{${couleur.replace('#', '')}}${texte}}`
}

export function barreTexte(text: string) {
  if (context.isHtml) {
    return `<span class="oblique-strike">${text}</span>`
  } else {
    return `\\strike{${text}}`
  }
}

/**
 * couleurAleatoire() renvoie le code d'une couleur au hasard
 *
 * @author Rémi Angot
 */
export function couleurAleatoire() {
  return choice([
    'white',
    'black',
    'red',
    'green',
    bleuMathalea,
    'cyan',
    'magenta',
    'yellow',
  ])
}

/**
 * couleurTab() renvoie :
 * soit le code d'une couleur au hasard, ainsi que sa traduction française au masculin et au féminin,
 * soit le code d'une couleur imposée, ainsi que sa traduction française au masculin et au féminin.
 * @example couleurTab() peut renvoyer ['black','noir','noire'].
 * @example couleurTab(0) renverra de façon certaine ['black','noir','noire'].
 * @author Éric Elter
 */
export function couleurTab(choixCouleur = 999) {
  const panelCouleurs = [
    ['black', 'noir', 'noire'],
    ['red', 'rouge', 'rouge'],
    ['green', 'vert', 'verte'],
    [bleuMathalea, 'bleu', 'bleue'],
    ['HotPink', 'rose', 'rose'],
    ['Sienna', 'marron', 'marron'],
    ['darkgray', 'gris', 'grise'],
    ['DarkOrange', 'orange', 'orange'],
  ]
  return choixCouleur === 999 ||
    choixCouleur >= panelCouleurs.length ||
    !Number.isInteger(choixCouleur)
    ? choice(panelCouleurs)
    : panelCouleurs[choixCouleur]
}

export function arcenciel(i: number, fondblanc = true) {
  let couleurs
  if (fondblanc)
    couleurs = [
      'violet',
      'purple',
      bleuMathalea,
      'green',
      'lime',
      orangeMathalea,
      'red',
    ]
  else
    couleurs = [
      'violet',
      'indigo',
      bleuMathalea,
      'green',
      'yellow',
      orangeMathalea,
      'red',
    ]
  return couleurs[i % 7]
}

export function texcolors(i: number, fondblanc = true) {
  const couleurs = [
    'black',
    bleuMathalea,
    'brown',
    'green',
    'cyan',
    'darkgray',
    'pink',
    'orange',
    'red',
    'magenta',
    'purple',
    'violet',
    'white',
    'yellow',
  ]
  if (fondblanc && i % couleurs.length >= couleurs.length - 2) i += 2
  return couleurs[i % couleurs.length]
}

/**
 * Met gras un texte
 * @param {string} texte à mettre en gras
 * @author Rémi Angot
 */
export function texteGras(texte: string) {
  if (context.isHtml) {
    return `<b>${texte}</b>`
  } else {
    return `\\textbf{${texte}}`
  }
}

/**
 * Texte en italique
 */
export function texteItalique(texte: string) {
  if (context.isHtml) {
    return `<i>${texte}</i>`
  } else {
    return `\\textit{${texte}}`
  }
}

export function blocCode(texte: string) {
  if (context.isHtml) {
    return `<pre style="background-color: #f0f0f0; border: 1px solid #ccc; border-radius: 4px; padding: 10px; font-family: Courier New, monospace; white-space: pre-wrap;">
    ${texte}</pre>`
  }
  return `\\fbox{
    \\parbox{0.5\\linewidth}{
    \\setlength{\\parskip}{.5cm}
    \\texttt{${texte}
    }
    }\\newline`
}

export function texteCode(texte: string) {
  if (context.isHtml) {
    return `<span style="background-color: #f0f0f0; border: 1px solid #ccc; border-radius: 4px; font-family: Courier New, monospace; white-space: pre-wrap;">${texte}</span>`
  }
  return `\\colorbox{lightgray}{\\texttt{${texte}}}`
}

export function texteEnBoite(texte: string) {
  if (context.isTypst) {
    // le convertisseur HTML → Typst ignore les styles : on passe par `\fbox`, qu'il sait encadrer
    return `\\fbox{${texte}}`
  }
  if (context.isHtml) {
    return `<div style="display: inline-block; max-width: fit-content; border: 2px solid #444; border-radius: 4px; padding: 10px;">${texte}</div>`
  }
  return `\\fbox{\\parbox{0.5\\linewidth}{\\setlength{\\parskip}{.5cm}${texte}}}\\newline`
}

export function texteEnCarte(texte: string, isTarget: boolean = false) {
  const bgcolor = isTarget ? orangeMathalea : bleuMathalea
  if (context.isTypst) {
    const width = isTarget ? '24pt' : '32pt'
    const height = isTarget ? '28pt' : '30pt'
    const radius = isTarget ? '4pt' : '6pt'
    return `<mathalea-typst>#box(width: ${width}, height: ${height}, fill: rgb("${bgcolor}"), stroke: 0.6pt + luma(75%), radius: ${radius}, inset: 0pt)[#align(center + horizon)[#text(fill: white, weight: "bold")[#raw(${JSON.stringify(texte)})]]]</mathalea-typst>`
  }
  const color = context.isTypst ? '' : 'white'
  const width = isTarget ? '' : '50px'
  const padding = isTarget ? '2px' : '20px'
  const radius = isTarget ? '5px' : '10px'
  if (context.isHtml) {
    return `<span style="display:flex; justify-content:center; background-color: ${bgcolor}; border: 1px solid #ccc; border-radius: ${radius}; color: ${color}; width:${width}; padding:${padding}";>${texte}</span>`
  }
  return `\\colorbox{lightgray}{\\texttt{${texte}}}`
}
