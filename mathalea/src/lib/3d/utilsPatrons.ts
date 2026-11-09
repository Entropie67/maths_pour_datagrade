export type FaceNode = {
  x: number
  y: number
  parent?: FaceNode
  children: FaceNode[]
  directionFromParent?: 'T' | 'B' | 'L' | 'R'
}
export type objetFace = {
  width?: number
  height?: number
  numero: number
  isFace: boolean
  collision?: number // optionnel car pas présent partout
}

export const vraiCubes: number[][][] = [
  [
    [0, 1, 0],
    [1, 1, 1],
    [0, 1, 0],
    [0, 1, 0],
  ],
  [
    [0, 1, 0],
    [0, 1, 1],
    [1, 1, 0],
    [0, 1, 0],
  ],
  [
    [1, 1, 0],
    [0, 1, 1],
    [0, 1, 0],
    [0, 1, 0],
  ],
  [
    [1, 1, 0],
    [0, 1, 0],
    [0, 1, 1],
    [0, 1, 0],
  ],
  [
    [1, 0, 0],
    [1, 1, 1],
    [0, 1, 0],
    [0, 1, 0],
  ],
  [
    [0, 1, 0],
    [0, 1, 1],
    [1, 1, 0],
    [1, 0, 0],
  ],
  [
    [1, 1, 1],
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
  ],
  [
    [0, 1, 1],
    [0, 1, 0],
    [0, 1, 0],
    [1, 1, 0],
  ],
  [
    [0, 1, 1],
    [0, 1, 0],
    [1, 1, 0],
    [1, 0, 0],
  ],
  [
    [1, 0],
    [1, 0],
    [1, 1],
    [0, 1],
    [0, 1],
  ],
  [
    [0, 0, 1],
    [0, 1, 1],
    [1, 1, 0],
    [1, 0, 0],
  ],
]

export const fauxCubes: number[][][] = [
  [
    [1, 0],
    [1, 0],
    [1, 1],
    [1, 0],
    [1, 0],
  ],
  [
    [1, 0, 0],
    [1, 1, 1],
    [1, 0, 0],
    [1, 0, 0],
  ],
  [
    [1, 0],
    [1, 1],
    [1, 0],
    [1, 0],
    [1, 0],
  ],
  [
    [1, 1],
    [1, 0],
    [1, 1],
    [1, 0],
  ],
  [
    [1, 0, 1],
    [1, 1, 1],
    [0, 1, 0],
  ],
  [
    [0, 1, 0],
    [1, 1, 1],
    [1, 0, 0],
    [1, 0, 0],
  ],
  [
    [1, 1, 1],
    [0, 1, 0],
    [1, 1, 0],
  ],
  [[1], [1], [1], [1], [1], [1]],
  [
    [1, 1],
    [1, 0],
    [1, 0],
    [1, 0],
    [1, 0],
  ],
  [
    [1, 1],
    [1, 0],
    [1, 0],
    [1, 1],
  ],
  [
    [0, 1],
    [1, 1],
    [1, 0],
    [1, 0],
    [1, 0],
  ],
  [
    [1, 1, 1],
    [1, 0, 0],
    [1, 0, 0],
    [1, 0, 0],
  ],
  [
    [1, 1],
    [1, 0],
    [1, 1],
    [0, 1],
  ],
  [
    [1, 1, 1],
    [1, 0, 1],
    [1, 0, 0],
  ],
  [
    [0, 0, 1],
    [1, 1, 1],
    [1, 0, 0],
    [1, 0, 0],
  ],
  [
    [0, 1, 1],
    [1, 1, 0],
    [1, 0, 0],
    [1, 0, 0],
  ],
]

export const cubesObj: objetFace[][][] = [
  [
    [
      { numero: 0, isFace: false },
      { numero: 1, isFace: true },
      { numero: 0, isFace: false },
    ],
    [
      { numero: 2, isFace: true },
      { numero: 3, isFace: true },
      { numero: 4, isFace: true },
    ],
    [
      { numero: 0, isFace: false },
      { numero: 5, isFace: true },
      { numero: 0, isFace: false },
    ],
    [
      { numero: 0, isFace: false },
      { numero: 6, isFace: true },
      { numero: 0, isFace: false },
    ],
  ],
  [
    [
      { numero: 0, isFace: false },
      { numero: 1, isFace: true },
      { numero: 0, isFace: false },
    ],
    [
      { numero: 0, isFace: false },
      { numero: 2, isFace: true },
      { numero: 3, isFace: true },
    ],
    [
      { numero: 4, isFace: true },
      { numero: 5, isFace: true },
      { numero: 0, isFace: false },
    ],
    [
      { numero: 0, isFace: false },
      { numero: 6, isFace: true },
      { numero: 0, isFace: false },
    ],
  ],
  [
    [
      { numero: 1, isFace: true },
      { numero: 2, isFace: true },
      { numero: 0, isFace: false },
    ],
    [
      { numero: 0, isFace: false },
      { numero: 3, isFace: true },
      { numero: 4, isFace: true },
    ],
    [
      { numero: 0, isFace: false },
      { numero: 5, isFace: true },
      { numero: 0, isFace: false },
    ],
    [
      { numero: 0, isFace: false },
      { numero: 6, isFace: true },
      { numero: 0, isFace: false },
    ],
  ],
  [
    [
      { numero: 1, isFace: true },
      { numero: 2, isFace: true },
      { numero: 0, isFace: false },
    ],
    [
      { numero: 0, isFace: false },
      { numero: 3, isFace: true },
      { numero: 0, isFace: false },
    ],
    [
      { numero: 0, isFace: false },
      { numero: 4, isFace: true },
      { numero: 5, isFace: true },
    ],
    [
      { numero: 0, isFace: false },
      { numero: 6, isFace: true },
      { numero: 0, isFace: false },
    ],
  ],
  [
    [
      { numero: 1, isFace: true },
      { numero: 0, isFace: false },
      { numero: 0, isFace: false },
    ],
    [
      { numero: 2, isFace: true },
      { numero: 3, isFace: true },
      { numero: 4, isFace: true },
    ],
    [
      { numero: 0, isFace: false },
      { numero: 5, isFace: true },
      { numero: 0, isFace: false },
    ],
    [
      { numero: 0, isFace: false },
      { numero: 6, isFace: true },
      { numero: 0, isFace: false },
    ],
  ],
  [
    [
      { numero: 0, isFace: false },
      { numero: 1, isFace: true },
      { numero: 0, isFace: false },
    ],
    [
      { numero: 0, isFace: false },
      { numero: 2, isFace: true },
      { numero: 3, isFace: true },
    ],
    [
      { numero: 4, isFace: true },
      { numero: 5, isFace: true },
      { numero: 0, isFace: false },
    ],
    [
      { numero: 6, isFace: true },
      { numero: 0, isFace: false },
      { numero: 0, isFace: false },
    ],
  ],
  [
    [
      { numero: 1, isFace: true },
      { numero: 2, isFace: true },
      { numero: 3, isFace: true },
    ],
    [
      { numero: 0, isFace: false },
      { numero: 4, isFace: true },
      { numero: 0, isFace: false },
    ],
    [
      { numero: 0, isFace: false },
      { numero: 5, isFace: true },
      { numero: 0, isFace: false },
    ],
    [
      { numero: 0, isFace: false },
      { numero: 6, isFace: true },
      { numero: 0, isFace: false },
    ],
  ],
  [
    [
      { numero: 0, isFace: false },
      { numero: 1, isFace: true },
      { numero: 2, isFace: true },
    ],
    [
      { numero: 0, isFace: false },
      { numero: 3, isFace: true },
      { numero: 0, isFace: false },
    ],
    [
      { numero: 0, isFace: false },
      { numero: 4, isFace: true },
      { numero: 0, isFace: false },
    ],
    [
      { numero: 5, isFace: true },
      { numero: 6, isFace: true },
      { numero: 0, isFace: false },
    ],
  ],
  [
    [
      { numero: 0, isFace: false },
      { numero: 1, isFace: true },
      { numero: 2, isFace: true },
    ],
    [
      { numero: 0, isFace: false },
      { numero: 3, isFace: true },
      { numero: 0, isFace: false },
    ],
    [
      { numero: 4, isFace: true },
      { numero: 5, isFace: true },
      { numero: 0, isFace: false },
    ],
    [
      { numero: 6, isFace: true },
      { numero: 0, isFace: false },
      { numero: 0, isFace: false },
    ],
  ],
  [
    [
      { numero: 1, isFace: true },
      { numero: 0, isFace: false },
    ],
    [
      { numero: 2, isFace: true },
      { numero: 0, isFace: false },
    ],
    [
      { numero: 3, isFace: true },
      { numero: 4, isFace: true },
    ],
    [
      { numero: 0, isFace: false },
      { numero: 5, isFace: true },
    ],
    [
      { numero: 0, isFace: false },
      { numero: 6, isFace: true },
    ],
  ],
  [
    [
      { numero: 0, isFace: false },
      { numero: 0, isFace: false },
      { numero: 1, isFace: true },
    ],
    [
      { numero: 0, isFace: false },
      { numero: 2, isFace: true },
      { numero: 3, isFace: true },
    ],
    [
      { numero: 4, isFace: true },
      { numero: 5, isFace: true },
      { numero: 0, isFace: false },
    ],
    [
      { numero: 6, isFace: true },
      { numero: 0, isFace: false },
      { numero: 0, isFace: false },
    ],
  ],
]

export const fauxCubesObj: objetFace[][][] = [
  [
    [
      { numero: 1, isFace: true, collision: 6 },
      { numero: 0, isFace: false },
    ],
    [
      { numero: 2, isFace: true },
      { numero: 0, isFace: false },
    ],
    [
      { numero: 3, isFace: true },
      { numero: 4, isFace: true },
    ],
    [
      { numero: 5, isFace: true },
      { numero: 0, isFace: false },
    ],
    [
      { numero: 6, isFace: true },
      { numero: 0, isFace: false },
    ],
  ], // fait
  [
    [
      { numero: 1, isFace: true },
      { numero: 0, isFace: false },
      { numero: 0, isFace: false },
    ],
    [
      { numero: 2, isFace: true },
      { numero: 3, isFace: true },
      { numero: 4, isFace: true, collision: 6 },
    ],
    [
      { numero: 5, isFace: true },
      { numero: 0, isFace: false },
      { numero: 0, isFace: false },
    ],
    [
      { numero: 6, isFace: true },
      { numero: 0, isFace: false },
      { numero: 0, isFace: false },
    ],
  ], // fait
  [
    [
      { numero: 1, isFace: true, collision: 6 },
      { numero: 0, isFace: false },
    ],
    [
      { numero: 2, isFace: true },
      { numero: 3, isFace: true },
    ],
    [
      { numero: 4, isFace: true },
      { numero: 0, isFace: false },
    ],
    [
      { numero: 5, isFace: true },
      { numero: 0, isFace: false },
    ],
    [
      { numero: 6, isFace: true },
      { numero: 0, isFace: false },
    ],
  ], // fait
  [
    [
      { numero: 1, isFace: true },
      { numero: 2, isFace: true, collision: 5 },
    ],
    [
      { numero: 3, isFace: true },
      { numero: 0, isFace: false },
    ],
    [
      { numero: 4, isFace: true },
      { numero: 5, isFace: true },
    ],
    [
      { numero: 6, isFace: true },
      { numero: 0, isFace: false },
    ],
  ], // fait
  [
    [
      { numero: 1, isFace: true, collision: 2 },
      { numero: 0, isFace: false },
      { numero: 2, isFace: true },
    ],
    [
      { numero: 3, isFace: true },
      { numero: 4, isFace: true },
      { numero: 5, isFace: true },
    ],
    [
      { numero: 0, isFace: false },
      { numero: 6, isFace: true },
      { numero: 0, isFace: false },
    ],
  ], // fait
  [
    [
      { numero: 0, isFace: false },
      { numero: 1, isFace: true },
      { numero: 0, isFace: false },
    ],
    [
      { numero: 2, isFace: true },
      { numero: 3, isFace: true },
      { numero: 4, isFace: true, collision: 6 },
    ],
    [
      { numero: 5, isFace: true },
      { numero: 0, isFace: false },
      { numero: 0, isFace: false },
    ],
    [
      { numero: 6, isFace: true },
      { numero: 0, isFace: false },
      { numero: 0, isFace: false },
    ],
  ], // fait
  [
    [
      { numero: 1, isFace: true, collision: 5 },
      { numero: 2, isFace: true },
      { numero: 3, isFace: true },
    ],
    [
      { numero: 0, isFace: false },
      { numero: 4, isFace: true },
      { numero: 0, isFace: false },
    ],
    [
      { numero: 5, isFace: true },
      { numero: 6, isFace: true },
      { numero: 0, isFace: false },
    ],
  ], // fait
  [
    [{ numero: 1, isFace: true, collision: 5 }],
    [{ numero: 2, isFace: true, collision: 6 }],
    [{ numero: 3, isFace: true }],
    [{ numero: 4, isFace: true }],
    [{ numero: 5, isFace: true }],
    [{ numero: 6, isFace: true }],
  ], // fait
  [
    [
      { numero: 1, isFace: true, collision: 6 },
      { numero: 2, isFace: true },
    ],
    [
      { numero: 3, isFace: true },
      { numero: 0, isFace: false },
    ],
    [
      { numero: 4, isFace: true },
      { numero: 0, isFace: false },
    ],
    [
      { numero: 5, isFace: true },
      { numero: 0, isFace: false },
    ],
    [
      { numero: 6, isFace: true },
      { numero: 0, isFace: false },
    ],
  ], // fait
  [
    [
      { numero: 1, isFace: true },
      { numero: 2, isFace: true, collision: 6 },
    ],
    [
      { numero: 3, isFace: true },
      { numero: 0, isFace: false },
    ],
    [
      { numero: 4, isFace: true },
      { numero: 0, isFace: false },
    ],
    [
      { numero: 5, isFace: true },
      { numero: 6, isFace: true },
    ],
  ], // fait
  [
    [
      { numero: 0, isFace: false },
      { numero: 1, isFace: true, collision: 6 },
    ],
    [
      { numero: 2, isFace: true },
      { numero: 3, isFace: true },
    ],
    [
      { numero: 4, isFace: true },
      { numero: 0, isFace: false },
    ],
    [
      { numero: 5, isFace: true },
      { numero: 0, isFace: false },
    ],
    [
      { numero: 6, isFace: true },
      { numero: 0, isFace: false },
    ],
  ], // fait
  [
    [
      { numero: 1, isFace: true },
      { numero: 2, isFace: true },
      { numero: 3, isFace: true, collision: 6 },
    ],
    [
      { numero: 4, isFace: true },
      { numero: 0, isFace: false },
      { numero: 0, isFace: false },
    ],
    [
      { numero: 5, isFace: true },
      { numero: 0, isFace: false },
      { numero: 0, isFace: false },
    ],
    [
      { numero: 6, isFace: true },
      { numero: 0, isFace: false },
      { numero: 0, isFace: false },
    ],
  ], // fait
  [
    [
      { numero: 1, isFace: true },
      { numero: 2, isFace: true, collision: 5 },
    ],
    [
      { numero: 3, isFace: true },
      { numero: 0, isFace: false },
    ],
    [
      { numero: 4, isFace: true },
      { numero: 5, isFace: true },
    ],
    [
      { numero: 0, isFace: false },
      { numero: 6, isFace: true },
    ],
  ], // fait
  [
    [
      { numero: 1, isFace: true },
      { numero: 2, isFace: true },
      { numero: 3, isFace: true, collision: 6 },
    ],
    [
      { numero: 4, isFace: true, collision: 5 },
      { numero: 0, isFace: false },
      { numero: 5, isFace: true },
    ],
    [
      { numero: 6, isFace: true },
      { numero: 0, isFace: false },
      { numero: 0, isFace: false },
    ],
  ], // fait ce patron ci dessus risque de poser problème a l'animation
  [
    [
      { numero: 0, isFace: false },
      { numero: 0, isFace: false },
      { numero: 1, isFace: true },
    ],
    [
      { numero: 2, isFace: true },
      { numero: 3, isFace: true },
      { numero: 4, isFace: true, collision: 6 },
    ],
    [
      { numero: 5, isFace: true },
      { numero: 0, isFace: false },
      { numero: 0, isFace: false },
    ],
    [
      { numero: 6, isFace: true },
      { numero: 0, isFace: false },
      { numero: 0, isFace: false },
    ],
  ], // fait
  [
    [
      { numero: 0, isFace: false },
      { numero: 1, isFace: true },
      { numero: 2, isFace: true, collision: 6 },
    ],
    [
      { numero: 3, isFace: true },
      { numero: 4, isFace: true },
      { numero: 0, isFace: false },
    ],
    [
      { numero: 5, isFace: true },
      { numero: 0, isFace: false },
      { numero: 0, isFace: false },
    ],
    [
      { numero: 6, isFace: true },
      { numero: 0, isFace: false },
      { numero: 0, isFace: false },
    ],
  ], // fait
]

/* const matrice = [
[{ width: 1, height: 1,numero: 1, isFace: true, collision: 5}],
[{ width: 1, height: 1,numero: 2, isFace: true, collision: 6}],
[{ width: 1, height: 1,numero: 3, isFace: true}],
[{ width: 1, height: 1,numero: 4, isFace: true}],
[{ width: 1, height: 1,numero: 5, isFace: true}],
[{ width: 1, height: 1,numero: 6, isFace: true}]
] */

function getVoisins(matrice: objetFace[][], x: number, y: number) {
  const dirs = [
    { dx: 0, dy: -1, dir: 'T' },
    { dx: 0, dy: 1, dir: 'B' },
    { dx: -1, dy: 0, dir: 'L' },
    { dx: 1, dy: 0, dir: 'R' },
  ] as const
  return dirs
    .filter(({ dx, dy }) => matrice[y + dy]?.[x + dx]?.isFace)
    .map(({ dx, dy, dir }) => ({ x: x + dx, y: y + dy, dir }))
}

// 1. Trouver la face pivot (celle avec le plus de voisins)
export function findPivot(matrice: objetFace[][]) {
  let maxVoisins = -1
  let pivot = { x: 0, y: 0 }
  for (let y = 0; y < matrice.length; y++) {
    for (let x = 0; x < matrice[0].length; x++) {
      if (matrice[y][x].isFace) {
        const voisins = getVoisins(matrice, x, y)
        if (voisins.length > maxVoisins) {
          maxVoisins = voisins.length
          pivot = { x, y }
        }
      }
    }
  }
  return pivot
}

// 2. Construire l’arbre des faces
export function buildFaceTree(
  matrice: objetFace[][],
  x: number,
  y: number,
  parent?: FaceNode,
  directionFromParent?: 'T' | 'B' | 'L' | 'R',
  visited = new Set<string>(),
): FaceNode {
  const key = `${x},${y}`
  if (visited.has(key)) return null as any
  visited.add(key)
  const node: FaceNode = { x, y, parent, children: [], directionFromParent }
  for (const voisin of getVoisins(matrice, x, y)) {
    if (!visited.has(`${voisin.x},${voisin.y}`)) {
      // Ajoute ce log :
      if (Math.abs(voisin.x - x) + Math.abs(voisin.y - y) !== 1) {
        console.warn(
          `Parent (${x},${y}) et enfant (${voisin.x},${voisin.y}) ne sont pas adjacents !`,
        )
      }
      const child = buildFaceTree(
        matrice,
        voisin.x,
        voisin.y,
        node,
        voisin.dir,
        visited,
      )
      if (child) node.children.push(child)
    }
  }
  return node
}

const EPSILON = 0.001 // ou 0.005 selon le rendu souhaité

export function getAbsolutePositions(
  tree: FaceNode,
  taille: number,
  pos: [number, number, number] = [0, 0, 0],
  positions = new Map<string, [number, number, number]>(),
) {
  const key = `${tree.x},${tree.y}`
  positions.set(key, pos)
  for (const child of tree.children) {
    let offset: [number, number, number] = [0, 0, 0]
    switch (child.directionFromParent) {
      case 'T':
        offset = [0, 0, -(taille + EPSILON)]
        break
      case 'B':
        offset = [0, 0, taille + EPSILON]
        break
      case 'L':
        offset = [-(taille + EPSILON), 0, 0]
        break
      case 'R':
        offset = [taille + EPSILON, 0, 0]
        break
    }
    getAbsolutePositions(
      child,
      taille,
      [pos[0] + offset[0], pos[1] + offset[1], pos[2] + offset[2]],
      positions,
    )
  }
  return positions
}

export function getPivotPositions(
  node: FaceNode,
  taille: number,
  facePositions: Map<string, [number, number, number]>,
  pivotPositions: Map<string, [number, number, number]>,
) {
  const key = `${node.x},${node.y}`
  const faceAbsPos = facePositions.get(key) ?? [0, 0, 0]
  let pivotAbsPos: [number, number, number]
  if (!node.parent) {
    pivotAbsPos = faceAbsPos
  } else {
    const parentKey = `${node.parent.x},${node.parent.y}`
    const parentFaceAbsPos = facePositions.get(parentKey) ?? [0, 0, 0]
    pivotAbsPos = [
      (parentFaceAbsPos[0] + faceAbsPos[0]) / 2,
      (parentFaceAbsPos[1] + faceAbsPos[1]) / 2,
      (parentFaceAbsPos[2] + faceAbsPos[2]) / 2,
    ]
  }
  pivotPositions.set(key, pivotAbsPos)
  for (const child of node.children) {
    getPivotPositions(child, taille, facePositions, pivotPositions)
  }
  return pivotPositions
}
