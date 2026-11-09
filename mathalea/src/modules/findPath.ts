/**
 * Représente un nœud dans une grille 2D.
 * @author Mickaël Guironnet
 */

class Node2d {
  x: number
  y: number
  walkable: boolean
  gCost: number
  hCost: number
  parent: Node2d | null

  constructor(x: number, y: number, walkable = true) {
    this.x = x
    this.y = y
    this.walkable = walkable
    this.gCost = Infinity
    this.hCost = 0
    this.parent = null
  }

  get fCost() {
    return this.gCost + this.hCost
  }
}

function heuristic(nodeA: Node2d, nodeB: Node2d) {
  const dx = Math.abs(nodeA.x - nodeB.x)
  const dy = Math.abs(nodeA.y - nodeB.y)
  return 14 * Math.min(dx, dy) + 10 * Math.abs(dx - dy)
}

function findPath(
  startNode: Node2d,
  endNode: Node2d,
  grid: Node2d[][],
  modifiedNodes = new Set(),
) {
  const openSet = [startNode]
  const closedSet = new Set<Node2d>()
  startNode.gCost = 0

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.fCost - b.fCost)
    let currentNode = openSet.shift()
    if (!currentNode) break
    closedSet.add(currentNode)

    if (currentNode === endNode) {
      const path = []
      while (currentNode !== startNode) {
        path.push(currentNode)
        if (currentNode.parent) {
          currentNode = currentNode.parent
        } else {
          break
        }
      }
      return path
    }

    for (const neighbor of getNeighbors(currentNode, grid)) {
      if (
        !neighbor.walkable ||
        closedSet.has(neighbor) ||
        modifiedNodes.has(neighbor)
      )
        continue
      const cost = currentNode.gCost + heuristic(currentNode, neighbor)
      if (cost < neighbor.gCost || !openSet.includes(neighbor)) {
        neighbor.gCost = cost
        neighbor.hCost = heuristic(neighbor, endNode)
        neighbor.parent = currentNode
        if (!openSet.includes(neighbor)) openSet.push(neighbor)
      }
    }
  }
  return null
}

function getNeighbors(node: Node2d, grid: Node2d[][]) {
  const neighbors = []
  const { x, y } = node
  const directions = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
  ]
  for (const [dx, dy] of directions) {
    const nx = x + dx
    const ny = y + dy
    if (grid[ny] && grid[ny][nx] && grid[ny][nx].walkable)
      neighbors.push(grid[ny][nx])
  }
  return neighbors
}

function createGrid(rows: number, cols: number, rate: number) {
  const grid = []
  for (let y = 0; y < rows; y++) {
    const row = []
    for (let x = 0; x < cols; x++) {
      const walkable = Math.random() > rate && x + 1 !== cols // 20% de cases non accessibles
      row.push(new Node2d(x, y, walkable))
    }
    grid.push(row)
  }
  return grid
}

/**
 * MGu trouve des chemins ebtres deux points dans une grille de taille rows * cols.
 * Il y a 20% de cases non accessibles.
 * @param rows le nombre de lignes de la grille
 * @param cols le nombre de colonnes de la grille
 * @param rowsStart le numéro de la ligne de départ
 * @param colsStart le  numéro de la colonne de départ
 * @param rowsEnd le numéro de la ligne d'arrivée
 * @param colsEnd le numéro de la colonne d'arrivée
 * @returns les chemins trouvés entre le point de départ et le point d'arrivée
 * @author Mickaël Guironnet
 */
export function runAStar(
  rows: number,
  cols: number,
  rowsStart: number,
  colsStart: number,
  rowsEnd: number,
  colsEnd: number,
): Node2d[][] {
  const rate = rows * cols > 25 ? 0.2 : 0 // 20% de cases non accessibles
  const grid = createGrid(rows, cols, rate)
  const start = grid[rowsStart][colsStart]
  const end = grid[rowsEnd][colsEnd]
  start.walkable = true
  end.walkable = true
  const paths: Node2d[][] = []
  const modifiedNodes = new Set()
  const path1 = findPath(start, end, grid, modifiedNodes)
  if (path1) {
    paths.push([start, ...path1.slice().reverse()])
    modifiedNodes.add(path1[Math.floor(path1.length * 0.5)])
  }

  const path2 = findPath(start, end, grid, modifiedNodes)
  if (path2) {
    paths.push([start, ...path2.slice().reverse()])
    paths[paths.length - 1]
      .slice(Math.floor(path2.length * 0.4), Math.floor(path2.length * 0.6))
      .forEach((node) => modifiedNodes.add(node))
  }

  const path3 = findPath(start, end, grid, modifiedNodes)
  if (path3) {
    paths.push([start, ...path3.slice().reverse()])
  }
  return paths
}
