import { typstImport } from '../../components/setup/typst/typstPackages'

/**
 * Préambule Typst du document de lecture optique.
 *
 * Trois éléments décident de la fiabilité de la lecture, et ils sont tous ici :
 *
 * 1. les **marqueurs de calage**, quatre carrés noirs posés en fond de page, à
 *    position fixe et identique sur toutes les pages : ils donnent les quatre
 *    correspondances dont l'homographie a besoin pour rattraper le décalage,
 *    la rotation et la légère perspective d'une numérisation ;
 * 2. le **QR-code**, généré dans Typst et non en amont, afin qu'il puisse
 *    contenir le numéro de page — inconnu tant que la mise en page n'est pas
 *    faite. C'est lui qui rattache une feuille isolée à sa copie ;
 * 3. la **case à cocher**, qui publie sa propre position absolue dans une
 *    métadonnée. Interrogées après compilation, ces métadonnées forment
 *    l'équivalent du fichier de positions d'AMC, obtenu sans étape séparée.
 *
 * Les identifiants de copie et de case sont écrits en dur par le générateur
 * plutôt que portés par un `state` Typst : le code étant produit par MathALÉA,
 * il peut se permettre d'être explicite, et cela évite les subtilités d'ordre
 * de résolution des états entre corps de page et en-tête.
 */

/** Version du format encodé dans le QR-code, pour pouvoir le faire évoluer. */
export const OMR_QR_VERSION = 'M1'

/** Côté d'un marqueur de calage, en millimètres. */
export const OMR_MARQUEUR_TAILLE_MM = 5

/** Distance entre le bord de la page et le marqueur, en millimètres. */
export const OMR_MARQUEUR_MARGE_MM = 10

/** Côté d'une case à cocher, en millimètres. */
export const OMR_CASE_TAILLE_MM = 4

/** Sélecteur interrogé après compilation pour récupérer les positions. */
export const OMR_SELECTEUR = '<omr-box>'

/**
 * Centres des quatre marqueurs en fraction de page, dans l'ordre attendu par
 * le recalage : haut-gauche, haut-droit, bas-droit, bas-gauche.
 *
 * Doit rester d'accord avec le placement fait par `omr-calage` : c'est la
 * seule chose que le moteur de lecture sait de la géométrie du document.
 *
 * @param largeurMm largeur du papier en millimètres
 * @param hauteurMm hauteur du papier en millimètres
 */
export function reperesRelatifs(
  largeurMm: number,
  hauteurMm: number,
): [
  { x: number; y: number },
  { x: number; y: number },
  { x: number; y: number },
  { x: number; y: number },
] {
  const centre = OMR_MARQUEUR_MARGE_MM + OMR_MARQUEUR_TAILLE_MM / 2
  const gauche = centre / largeurMm
  const droite = 1 - centre / largeurMm
  const haut = centre / hauteurMm
  const bas = 1 - centre / hauteurMm
  return [
    { x: gauche, y: haut },
    { x: droite, y: haut },
    { x: droite, y: bas },
    { x: gauche, y: bas },
  ]
}

/** Échappe une chaîne pour l'insérer comme littéral Typst entre guillemets. */
export function typstString(texte: string): string {
  return `"${texte.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
}

/**
 * Le préambule proprement dit.
 *
 * `omr-box` place sa métadonnée par un `place(top + left, …)` **à l'intérieur**
 * de la case : hors flux, il ne décale rien, et `here().position()` y désigne
 * exactement le coin interne haut-gauche. Publier la position avant de dessiner
 * la case obligerait à corriger après coup un décalage de ligne de base.
 */
export const OMR_PREAMBULE = `${typstImport('tiaoma', 'qrcode')}

#let omr-marqueur-taille = ${OMR_MARQUEUR_TAILLE_MM}mm
#let omr-marqueur-marge = ${OMR_MARQUEUR_MARGE_MM}mm
#let omr-case-taille = ${OMR_CASE_TAILLE_MM}mm

// Quatre repères de calage, identiques sur toutes les pages.
//
// Attention au décalage : \`place(right)\` aligne déjà le *bord droit* de
// l'élément sur celui de la page, donc \`dx\` doit valoir \`-marge\` et non
// \`-marge - taille\`, sans quoi les marqueurs se retrouvent une largeur de
// marqueur trop à l'intérieur — un écart que \`reperesRelatifs\` ne prévoit pas
// et qui fait échouer le recalage. Même raisonnement pour \`bottom\`.
#let omr-calage = {
  let m = rect(width: omr-marqueur-taille, height: omr-marqueur-taille, fill: black, stroke: none)
  let d = omr-marqueur-marge
  let e = -omr-marqueur-marge
  place(top + left, dx: d, dy: d, m)
  place(top + right, dx: e, dy: d, m)
  place(bottom + right, dx: e, dy: e, m)
  place(bottom + left, dx: d, dy: e, m)
}

// Case à cocher publiant la position absolue de son coin interne haut-gauche.
#let omr-box(copie, id) = box(
  width: omr-case-taille,
  height: omr-case-taille,
  stroke: 0.4pt,
  baseline: 0.6mm,
  place(top + left, context {
    let p = here().position()
    [#metadata((
      copie: copie,
      id: id,
      page: p.page,
      x: p.x.pt(),
      y: p.y.pt(),
      w: omr-case-taille.pt(),
      h: omr-case-taille.pt(),
    )) ${OMR_SELECTEUR}]
  }),
)

// En-tête : titre, nom de l'élève, et QR-code identifiant la feuille. Le
// numéro de page vient du contexte : il n'est connu qu'une fois la mise en
// page faite, d'où un QR généré ici plutôt qu'en amont par MathALÉA.
//
// C'est bien \`here().position().page\`, le rang physique de la feuille dans le
// document, et non \`counter(page)\` : dans un en-tête, l'incrément automatique
// du compteur de page n'est pas encore visible, si bien qu'un compteur y
// annonce une valeur décalée. Le rang physique, lui, est un fait de mise en
// page. La correspondance entre ce rang et le rang dans la copie est faite
// après coup par MathALÉA, qui connaît les deux.
//
// \`style\` reprend les habillages de la vue « Impression ». Le QR-code et le
// nom, eux, ne sont jamais masqués, pas même par \`"aucun"\` : ils identifient
// la feuille, et une feuille anonyme serait impossible à rattacher à sa copie.
#let omr-entete(titre, nom, sujet, copie, style: "epure", subtitle: "", header-line: "") = {
  mathalea-anchor("header", 0)
  let identite = {
    if style != "aucun" {
      text(size: 12pt, weight: "bold", titre)
      linebreak()
      if subtitle != "" {
        text(size: 10pt, subtitle)
        linebreak()
      }
      if header-line != "" {
        text(size: 9pt, header-line)
        linebreak()
      }
    }
    text(size: 10pt, nom)
  }
  let code = context qrcode(
    "${OMR_QR_VERSION}|" + sujet + "|" + copie + "|" + str(here().position().page),
    width: 18mm,
  )
  let bandeau = grid(
    columns: (1fr, 18mm),
    column-gutter: 4mm,
    align: (left + horizon, right + top),
    identite,
    code,
  )
  if style == "cartouche" {
    block(width: 100%, inset: 2mm, radius: 1mm, fill: luma(240), bandeau)
  } else if style == "cadre" {
    block(width: 100%, inset: 2mm, radius: 1mm, stroke: 0.5pt, bandeau)
  } else {
    bandeau
    v(-2mm)
    line(length: 100%, stroke: 0.5pt)
  }
}

// Consigne de remplissage : le geste attendu conditionne la fiabilité de la
// lecture. Une case noircie se mesure à 1,00, une simple barre à 0,21.
#let omr-consigne = block(
  width: 100%,
  inset: 2mm,
  stroke: 0.5pt + gray,
  radius: 1mm,
  text(size: 9pt)[
    Noircissez complètement la case choisie. Ne cochez pas, ne barrez pas :
    une case seulement effleurée risque de ne pas être comptée.
  ],
)
`
