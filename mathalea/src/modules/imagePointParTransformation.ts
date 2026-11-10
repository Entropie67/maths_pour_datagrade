import { Matrice, matrice } from '../lib/mathFonctions/Matrice'
export type TransformationsIndex =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 11
  | 12
  | 13
  | 14
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
export function isTransformationsIndex(
  obj: unknown,
): obj is TransformationsIndex {
  if (typeof obj !== 'number') return false
  if (!Number.isInteger(obj)) return false
  return obj >= 1 && obj <= 14
}
/**
 * Description
 * @param {any} transformation Entier déterminant la transformation voulue
 **1=symétrie / passant par O
 **2=symétrie \ passant par O
 **3=symétrie _ passant par O
 **4=symétrie | passant par O
 **5= rotation 90° anti-horaire centre O
 **6= rotation 90° horaire centre O
 **7= symétrie centrale centre O
 **11= rotation 60° anti-horaire centre O
 **12= rotation 60° horaire centre O
 **13= rotation 120° anti-horaire centre O
 **14= rotation 120° horaire centre O
 **8= translation coordonnées de O = vecteur de translation
 **9= homothétie. centre O rapport k
 **10= homothétie. centre O rapport 1/k
 * @param {[number, number]} pointA Point dont on cherche l'image
 * @param {[number, number]} pointO Centre du repère local pour les symétries, centre pour les rotations et les homothéties
 * @param {[number, number]} vecteur=[] Vecteur de la translation
 * @param {number} rapport=1 rapport d'homothétie
 * @author Jean-claude Lhote
 * @returns {[number, number]} Le point résultat
 */
export function imagePointParTransformation(
  transformation: TransformationsIndex,
  pointA: [number, number],
  pointO: [number, number],
  vecteur = [0, 0],
  rapport = 1,
): [number, number] {
  // pointA,centre et pointO sont des tableaux de deux coordonnées
  // on les rends homogènes en ajoutant un 1 comme 3ème coordonnée)
  // nécessite d'être en repère orthonormal...
  // Point O sert pour les rotations et homothéties en tant que centre (il y a un changement d'origine du repère en O pour simplifier l'expression des matrices de transformations.)

  if (pointA.length === 2) pointA.push(1)
  const x2 = pointO[0] // Point O' (origine du repère dans lequel les transformations sont simples (centre des rotations et point d'intersection des axes))
  const y2 = pointO[1]
  const u = vecteur[0] // (u,v) vecteur de translation.
  const v = vecteur[1]
  const k = rapport // rapport d'homothétie

  const matriceChangementDeRepere = matrice([
    [1, 0, x2],
    [0, 1, y2],
    [0, 0, 1],
  ])
  const matriceChangementDeRepereInv = matrice([
    [1, 0, -x2],
    [0, 1, -y2],
    [0, 0, 1],
  ])

  let maMatrice
  switch (transformation) {
    case 1:
      {
        // Symétrie par rapport à la première bissectrice
        const matriceSymObl1 = matrice([
          [0, 1, 0],
          [1, 0, 0],
          [0, 0, 1],
        ]) // x'=y et y'=x
        maMatrice = matriceSymObl1!.multiply(matriceChangementDeRepereInv)
      }
      break
    case 2:
      {
        // symétrie par rapport à la deuxième bissectrice
        const matriceSymObl2 = matrice([
          [0, -1, 0],
          [-1, 0, 0],
          [0, 0, 1],
        ]) // x'=-y et y'=-x
        maMatrice = matriceSymObl2!.multiply(matriceChangementDeRepereInv)
      }
      break
    case 3:
      {
        // Symétrie par rapport à l'axe des abscisses
        const matriceSymxxprime = matrice([
          [1, 0, 0],
          [0, -1, 0],
          [0, 0, 1],
        ]) // x'=x et y'=-y
        maMatrice = matriceSymxxprime!.multiply(matriceChangementDeRepereInv)
      }
      break
    case 4:
      {
        // symétrie par rapport à l'axe des ordonnées
        const matriceSymYyPrime = matrice([
          [-1, 0, 0],
          [0, 1, 0],
          [0, 0, 1],
        ]) // x'=-x et y'=y
        maMatrice = matriceSymYyPrime!.multiply(matriceChangementDeRepereInv)
      }
      break
    case 5:
      {
        // rotation 90 direct
        const matriceQuartDeTourDirect = matrice([
          [0, -1, 0],
          [1, 0, 0],
          [0, 0, 1],
        ]) // x'=-y et y'=x
        maMatrice = matriceQuartDeTourDirect!.multiply(
          matriceChangementDeRepereInv,
        )
      }
      break
    case 6:
      {
        // rotation quart de tour indirect
        const matriceQuartDeTourIndirect = matrice([
          [0, 1, 0],
          [-1, 0, 0],
          [0, 0, 1],
        ]) // x'=y et y'=-x
        maMatrice = matriceQuartDeTourIndirect!.multiply(
          matriceChangementDeRepereInv,
        )
      }
      break
    case 7:
      {
        // symétrie centrale
        const matriceSymCentrale = matrice([
          [-1, 0, 0],
          [0, -1, 0],
          [0, 0, 1],
        ]) // x'=-x et y'=-y
        maMatrice = matriceSymCentrale.multiply(matriceChangementDeRepereInv)
      }
      break
    case 11:
      {
        // rotation 60° direct
        const matriceRotation60Direct = matrice([
          [0.5, -Math.sin(Math.PI / 3), 0],
          [Math.sin(Math.PI / 3), 0.5, 0],
          [0, 0, 1],
        ])
        maMatrice = matriceRotation60Direct.multiply(
          matriceChangementDeRepereInv,
        )
      }
      break
    case 12:
      {
        // rotation 60° indirect
        const matriceRotation60Indirect = matrice([
          [0.5, Math.sin(Math.PI / 3), 0],
          [-Math.sin(Math.PI / 3), 0.5, 0],
          [0, 0, 1],
        ])
        maMatrice = matriceRotation60Indirect.multiply(
          matriceChangementDeRepereInv,
        )
      }
      break
    case 13:
      {
        // rotation 120° direct
        const matriceRotation120Direct = matrice([
          [-0.5, -Math.sin(Math.PI / 3), 0],
          [Math.sin(Math.PI / 3), -0.5, 0],
          [0, 0, 1],
        ])
        maMatrice = matriceRotation120Direct!.multiply(
          matriceChangementDeRepereInv,
        )
      }
      break
    case 14:
      {
        // rotation 120° indirect
        const matriceRotation120Indirect = matrice([
          [-0.5, Math.sin(Math.PI / 3), 0],
          [-Math.sin(Math.PI / 3), -0.5, 0],
          [0, 0, 1],
        ])
        maMatrice = matriceRotation120Indirect!.multiply(
          matriceChangementDeRepereInv,
        )
      }
      break
    case 8:
      {
        // translation
        const matriceTranslation = matrice([
          [1, 0, u],
          [0, 1, v],
          [0, 0, 1],
        ])
        maMatrice = matriceTranslation!.multiply(matriceChangementDeRepereInv)
      }
      break
    case 9:
      {
        // homothétie rapport entier
        const matriceHomothetie = matrice([
          [k, 0, 0],
          [0, k, 0],
          [0, 0, 1],
        ])
        maMatrice = matriceHomothetie!.multiply(matriceChangementDeRepereInv)
      }
      break
    case 10:
      {
        // homothetie rapport inverse d'entier
        const matriceHomothetie2 = matrice([
          [1 / k, 0, 0],
          [0, 1 / k, 0],
          [0, 0, 1],
        ])
        maMatrice = matriceHomothetie2!.multiply(matriceChangementDeRepereInv)
      }
      break
  }
  const pointA1 = (maMatrice! as Matrice).multiply(pointA)
  const pointA2 = matriceChangementDeRepere.multiply(
    pointA1 as [number, number, number],
  )
  return typeof (pointA2 as any).toArray === 'function'
    ? ((pointA2 as any).toArray().slice(0, 2) as [number, number])
    : Array.isArray(pointA2)
      ? (pointA2.slice(0, 2) as [number, number])
      : [0, 0]
}
