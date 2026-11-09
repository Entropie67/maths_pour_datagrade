import { darkRatio } from './binarize'
import { applyHomography, type Homography } from './registration'
import type { OmrBox, OmrBoxReading, OmrBoxStatus } from './omrTypes'

/**
 * Lecture des cases : mesure de noirceur, puis décision cochée / vide.
 *
 * Les seuils ne sont pas fixés a priori. Une campagne de mesures sur des
 * marques simulées (marge intérieure de 20 %, 150 dpi) donne :
 *
 * | marque                          | noirceur |
 * | ------------------------------- | -------- |
 * | case vide                       | 0,000    |
 * | trait débordant d'une voisine   | 0,000    |
 * | barre horizontale               | 0,214    |
 * | coche ✓                         | 0,338    |
 * | croix ✗                         | 0,556    |
 * | case noircie                    | 1,000    |
 *
 * Deux enseignements. D'abord, la marge intérieure de 20 % annule complètement
 * le piège du trait qui déborde d'une case voisine : le rejet du bruit de bord
 * n'est pas un problème. Ensuite, un seuil fixe est dangereux — placé à 0,25 il
 * classerait une case *barrée* (0,214) comme vide, c'est-à-dire un faux négatif
 * silencieux, la seule erreur qu'on ne s'autorise pas.
 *
 * D'où le choix d'un **seuil déterminé copie par copie**. Une première version
 * appliquait Otsu à l'histogramme des noirceurs ; le test de bout en bout l'a
 * mise en défaut, et pour une raison de fond : Otsu cherche à équilibrer deux
 * classes, alors que la distribution est très asymétrique — sur un QCM, au plus
 * une case sur trois est marquée, souvent une sur dix. Le seuil se faisait tirer
 * vers le milieu du nuage des marques et repassait au-dessus de la case barrée.
 *
 * La bonne question n'est pas « à quel groupe cette case appartient-elle » mais
 * « est-elle distinguable du fond ». On estime donc le **niveau « case vide »**
 * de la copie par son premier quartile — robuste tant que moins des trois quarts
 * des cases sont marquées, ce qui est toujours vrai — puis on décide par deux
 * marges au-dessus de ce niveau. Le niveau de fond absorbe le voile gris d'un
 * scanner mal réglé, sans que la vigueur du trait des élèves ne le déplace.
 */

/** Marge intérieure retirée de chaque côté, pour ignorer le trait du cadre. */
export const MARGE_INTERIEURE = 0.2

/**
 * Écart de noirceur minimal entre la case la plus sombre d'une question à
 * réponse unique et la suivante, en deçà duquel les deux se valent.
 */
export const SEPARATION_CHOIX_UNIQUE = 0.09

/**
 * Sur une question à réponse unique, la deuxième case la plus sombre doit
 * rester sous cette fraction de la première pour que le vainqueur soit net.
 */
export const RATIO_CHOIX_UNIQUE = 0.8

/** Au-delà de ce niveau de fond, la page est jugée trop sale pour décider. */
export const BASE_MAX = 0.35

/** Marge au-dessus du niveau « vide » en deçà de laquelle la case reste vide. */
export const MARGE_VIDE = 0.08

/** Marge au-dessus du niveau « vide » à partir de laquelle la case est cochée. */
export const MARGE_COCHEE = 0.16

/** Seuils de décision d'une copie, déduits de son niveau de fond. */
export interface SeuilsCopie {
  /** Noirceur d'une case vide sur cette copie (voile du scanner compris) */
  base: number
  /** En dessous : vide */
  vide: number
  /** Au-dessus : cochée. Entre les deux : ambigu, arbitrage manuel */
  cochee: number
}

/**
 * Mesure la proportion de pixels sombres à l'intérieur d'une case.
 *
 * La case est projetée par l'homographie, puis échantillonnée sur un rectangle
 * centré, réduit de `MARGE_INTERIEURE` de chaque côté. On mesure autour du
 * centre projeté plutôt que sur la boîte englobante du quadrilatère projeté :
 * cette dernière s'élargit avec la rotation de la page et ferait entrer le
 * cadre dans la mesure.
 */
export function measureBox(
  integral: Int32Array,
  width: number,
  height: number,
  h: Homography,
  box: OmrBox,
  marge = MARGE_INTERIEURE,
): number {
  const centre = applyHomography(h, {
    x: box.x + box.w / 2,
    y: box.y + box.h / 2,
  })
  // demi-dimensions mesurées sur les milieux des côtés projetés : insensible
  // à une petite rotation, contrairement à une boîte englobante
  const droite = applyHomography(h, {
    x: box.x + box.w,
    y: box.y + box.h / 2,
  })
  const bas = applyHomography(h, { x: box.x + box.w / 2, y: box.y + box.h })
  const demiLargeur = Math.hypot(droite.x - centre.x, droite.y - centre.y)
  const demiHauteur = Math.hypot(bas.x - centre.x, bas.y - centre.y)
  const facteur = 1 - 2 * marge
  const dx = demiLargeur * facteur
  const dy = demiHauteur * facteur
  return darkRatio(
    integral,
    width,
    height,
    centre.x - dx,
    centre.y - dy,
    centre.x + dx,
    centre.y + dy,
  )
}

/**
 * Niveau de noirceur d'une case vide sur cette copie, estimé par le premier
 * quartile des mesures.
 *
 * Le quartile, et non la moyenne ni la médiane du minimum : il reste sur le
 * mode « vide » tant que moins de 75 % des cases sont marquées, et il ignore
 * aussi bien une case anormalement propre qu'une salissure isolée.
 */
export function niveauDeFond(darknesses: readonly number[]): number {
  if (darknesses.length === 0) return 0
  const triees = [...darknesses].sort((a, b) => a - b)
  const index = Math.floor((triees.length - 1) * 0.25)
  return triees[index]
}

/**
 * Détermine les seuils de décision d'une copie à partir des noirceurs de
 * toutes ses cases.
 */
export function seuilsCopie(darknesses: readonly number[]): SeuilsCopie {
  const base = Math.min(BASE_MAX, niveauDeFond(darknesses))
  return {
    base,
    vide: base + MARGE_VIDE,
    cochee: base + MARGE_COCHEE,
  }
}

/** Classe une noirceur selon les seuils de la copie. */
export function classifier(
  darkness: number,
  seuils: SeuilsCopie,
): OmrBoxStatus {
  if (darkness >= seuils.cochee) return 'cochee'
  if (darkness < seuils.vide) return 'vide'
  return 'ambigue'
}

/**
 * Tranche les questions à réponse unique par contraste à l'intérieur du groupe.
 *
 * Les seuils absolus (`classifier`) répondent à « cette case est-elle
 * distinguable du fond ». Ils suffisent pour une case isolée, mais pas quand
 * plusieurs cases d'une même question ressortent : sur une copie scannée
 * médiocre, le débordement d'une coche voisine ou une gomme mal effacée fait
 * facilement monter une case vide à 0,25–0,32, juste au-dessus du seuil.
 *
 * Or une question à réponse unique n'a qu'une case cochée. Quand l'une domine
 * franchement les autres — nettement plus sombre, et l'ennemie la plus proche
 * en deçà d'une fraction d'elle —, on la retient et on remet les autres à
 * vide, même si leur mesure passait le seuil. À défaut de domination claire,
 * on ne touche à rien : `classifier` a déjà fait ressortir l'ambiguïté, et
 * c'est au professeur de trancher.
 *
 * @param groupesChoixUnique identifiants des cases de chaque question à réponse
 *   unique, une entrée par question
 */
export function affinerChoixUnique(
  lectures: readonly OmrBoxReading[],
  groupesChoixUnique: readonly (readonly string[])[],
  seuils: SeuilsCopie,
  options: { separation?: number; ratioMax?: number } = {},
): OmrBoxReading[] {
  const separation = options.separation ?? SEPARATION_CHOIX_UNIQUE
  const ratioMax = options.ratioMax ?? RATIO_CHOIX_UNIQUE
  const parId = new Map(lectures.map((lecture) => [lecture.id, { ...lecture }]))

  for (const groupe of groupesChoixUnique) {
    const casesDuGroupe = groupe
      .map((id) => parId.get(id))
      .filter((lecture): lecture is OmrBoxReading => lecture != null)
    if (casesDuGroupe.length < 2) continue

    const tri = [...casesDuGroupe].sort((a, b) => b.darkness - a.darkness)
    const [premier, second] = tri
    const domine =
      premier.darkness >= seuils.cochee &&
      premier.darkness - second.darkness >= separation &&
      second.darkness <= premier.darkness * ratioMax
    if (!domine) continue

    for (const lecture of casesDuGroupe) {
      lecture.status = lecture.id === premier.id ? 'cochee' : 'vide'
    }
  }

  return lectures.map((lecture) => parId.get(lecture.id) ?? lecture)
}

/**
 * Lit toutes les cases d'une page et les classe.
 *
 * @param seuils seuils de la copie ; omis, ils sont déduits des cases de cette
 *   page seule — moins fiable qu'un niveau de fond calculé sur la copie entière
 */
export function readBoxes(
  integral: Int32Array,
  width: number,
  height: number,
  h: Homography,
  boxes: readonly OmrBox[],
  seuils?: SeuilsCopie,
): OmrBoxReading[] {
  const noirceurs = boxes.map((box) =>
    measureBox(integral, width, height, h, box),
  )
  const seuilsUtilises = seuils ?? seuilsCopie(noirceurs)
  return boxes.map((box, i) => ({
    id: box.id,
    darkness: noirceurs[i],
    status: classifier(noirceurs[i], seuilsUtilises),
  }))
}
