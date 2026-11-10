import { range } from '../../outils/nombres'
import { BufferGeometryUtils, Text, THREE } from './threeInstance'
import { bleuMathalea } from '../../../lib/colors'

// Three.js pur pour créer un prisme polygonal utilisable dans une scène Three.js en perspective avec arêtes cachées en pointillés.
export function createPrismGeometry(
  sides: number,
  radius: number,
  bottom: number,
  top: number,
  withBottomBase = false,
  withTopBase = false,
): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry()
  const vertices: number[] = []
  const base: THREE.Vector3[] = []
  const topBase: THREE.Vector3[] = []

  // Sommets des deux bases
  for (let i = 0; i < sides; i++) {
    const theta = (i / sides) * Math.PI * 2
    const x = radius * Math.cos(theta)
    const z = radius * Math.sin(theta)
    base.push(new THREE.Vector3(x, bottom, z))
    topBase.push(new THREE.Vector3(x, top, z))
  }

  // Triangulation de la base inférieure
  if (withBottomBase) {
    for (let i = 1; i < sides - 1; i++) {
      vertices.push(
        base[0].x,
        base[0].y,
        base[0].z,
        base[i + 1].x,
        base[i + 1].y,
        base[i + 1].z,
        base[i].x,
        base[i].y,
        base[i].z,
      )
    }
  }

  // Triangulation de la base supérieure
  if (withTopBase) {
    for (let i = 1; i < sides - 1; i++) {
      vertices.push(
        topBase[0].x,
        topBase[0].y,
        topBase[0].z,
        topBase[i].x,
        topBase[i].y,
        topBase[i].z,
        topBase[i + 1].x,
        topBase[i + 1].y,
        topBase[i + 1].z,
      )
    }
  }

  // Side faces (un seul rectangle par côté, découpé en 2 triangles)
  for (let i = 0; i < sides; i++) {
    const a = base[i]
    const b = base[(i + 1) % sides]
    const c = topBase[(i + 1) % sides]
    const d = topBase[i]

    // Premier triangle
    vertices.push(a.x, a.y, a.z, b.x, b.y, b.z, d.x, d.y, d.z)
    // Second triangle
    vertices.push(b.x, b.y, b.z, c.x, c.y, c.z, d.x, d.y, d.z)
  }

  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(vertices, 3),
  )
  geometry.computeVertexNormals()
  return geometry
}

export function createPyramidGeometry(
  sides: number,
  radius: number,
  bottom: number,
  top: number,
  withBase = false, // <-- nouveau paramètre, false par défaut
): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry()
  const vertices: number[] = []
  const apex = new THREE.Vector3(0, top, 0)
  const base: THREE.Vector3[] = []

  for (let i = 0; i < sides; i++) {
    const theta = (i / sides) * Math.PI * 2
    const x = radius * Math.cos(theta)
    const z = radius * Math.sin(theta)
    base.push(new THREE.Vector3(x, bottom, z))
  }

  // Base face (triangulation) si demandé
  if (withBase) {
    for (let i = 1; i < sides - 1; i++) {
      vertices.push(
        base[0].x,
        base[0].y,
        base[0].z,
        base[i + 1].x,
        base[i + 1].y,
        base[i + 1].z,
        base[i].x,
        base[i].y,
        base[i].z,
      )
    }
  }

  // Side faces
  for (let i = 0; i < sides; i++) {
    const a = base[i]
    const b = base[(i + 1) % sides]
    vertices.push(a.x, a.y, a.z, b.x, b.y, b.z, apex.x, apex.y, apex.z)
  }

  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(vertices, 3),
  )
  geometry.computeVertexNormals()
  return geometry
}

export function createTruncatedPyramidGeometry(
  sides: number,
  bottomRadius: number,
  topRadius: number,
  bottom: number,
  top: number,
  withBottomBase = false,
  withTopBase = false,
): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry()
  const vertices: number[] = []
  const bottomVerts: THREE.Vector3[] = []
  const topVerts: THREE.Vector3[] = []

  for (let i = 0; i < sides; i++) {
    const theta = (i / sides) * Math.PI * 2
    bottomVerts.push(
      new THREE.Vector3(
        bottomRadius * Math.cos(theta),
        bottom,
        bottomRadius * Math.sin(theta),
      ),
    )
    topVerts.push(
      new THREE.Vector3(
        topRadius * Math.cos(theta),
        top,
        topRadius * Math.sin(theta),
      ),
    )
  }

  // Bottom face (triangulation) si demandé
  if (withBottomBase) {
    for (let i = 1; i < sides - 1; i++) {
      vertices.push(
        bottomVerts[0].x,
        bottomVerts[0].y,
        bottomVerts[0].z,
        bottomVerts[i + 1].x,
        bottomVerts[i + 1].y,
        bottomVerts[i + 1].z,
        bottomVerts[i].x,
        bottomVerts[i].y,
        bottomVerts[i].z,
      )
    }
  }

  // Top face (triangulation) si demandé
  if (withTopBase) {
    for (let i = 1; i < sides - 1; i++) {
      vertices.push(
        topVerts[0].x,
        topVerts[0].y,
        topVerts[0].z,
        topVerts[i].x,
        topVerts[i].y,
        topVerts[i].z,
        topVerts[i + 1].x,
        topVerts[i + 1].y,
        topVerts[i + 1].z,
      )
    }
  }

  // Side faces (un seul rectangle par côté, découpé en 2 triangles)
  for (let i = 0; i < sides; i++) {
    const a = bottomVerts[i]
    const b = bottomVerts[(i + 1) % sides]
    const c = topVerts[(i + 1) % sides]
    const d = topVerts[i]

    // Premier triangle
    vertices.push(a.x, a.y, a.z, b.x, b.y, b.z, d.x, d.y, d.z)
    // Second triangle
    vertices.push(b.x, b.y, b.z, c.x, c.y, c.z, d.x, d.y, d.z)
  }

  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(vertices, 3),
  )
  geometry.computeVertexNormals()
  return geometry
}
export function createMeshFromGeometry(
  geometry: THREE.BufferGeometry,
  material?: THREE.Material | THREE.Material[],
): THREE.Mesh {
  const mat = material ?? new THREE.MeshStandardMaterial({ color: '#fff' })
  return new THREE.Mesh(geometry, mat)
}

export function createEdgesFromGeometry(
  geometry: THREE.BufferGeometry,
  dashed = false,
): THREE.LineSegments {
  const edges = new THREE.EdgesGeometry(geometry)
  let material: THREE.Material
  if (dashed) {
    material = new THREE.LineDashedMaterial({
      color: 0x000000,
      dashSize: 0.05,
      gapSize: 0.025,
      depthTest: false,
      transparent: true,
      opacity: 0.5, // ou 0.5 si tu veux atténuer les pointillés
    })
  } else {
    material = new THREE.LineBasicMaterial({
      color: 0x000000,
      depthTest: true,
      transparent: true,
      opacity: 1,
    })
  }
  const line = new THREE.LineSegments(edges, material)
  if (dashed && line.computeLineDistances) line.computeLineDistances()
  return line
}

// Template sans arêtes
const coloredCubeMeshTemplate = (() => {
  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const materials = [
    new THREE.MeshPhongMaterial({ color: 'red' }),
    new THREE.MeshPhongMaterial({ color: 'red' }),
    new THREE.MeshPhongMaterial({ color: 'green' }),
    new THREE.MeshPhongMaterial({ color: 'green' }),
    new THREE.MeshPhongMaterial({ color: bleuMathalea }),
    new THREE.MeshPhongMaterial({ color: bleuMathalea }),
  ]
  const mesh = new THREE.Mesh(geometry, materials)
  return mesh
})()

// Template avec arêtes
const coloredCubeWithEdgesTemplate = (() => {
  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const materials = [
    new THREE.MeshPhongMaterial({ color: 'red' }),
    new THREE.MeshPhongMaterial({ color: 'red' }),
    new THREE.MeshPhongMaterial({ color: 'green' }),
    new THREE.MeshPhongMaterial({ color: 'green' }),
    new THREE.MeshPhongMaterial({ color: bleuMathalea }),
    new THREE.MeshPhongMaterial({ color: bleuMathalea }),
  ]
  const mesh = new THREE.Mesh(geometry, materials)
  const edges = new THREE.EdgesGeometry(geometry)
  const line = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({ color: 0x000000 }),
  )
  const group = new THREE.Group()
  group.add(mesh)
  group.add(line)
  return group
})()

export function createColoredCube(
  position: [number, number, number],
  size = 1,
  options?: {
    edges?: boolean // true pour ajouter les arêtes
    edgesColor?: number // couleur des arêtes (ex: 0x000000)
    edgesOpacity?: number // opacité des arêtes (ex: 1)
    colors: number[]
  },
): THREE.Group | THREE.Mesh {
  const colors = range(6).map(
    (n) => (options?.colors ?? [0xffffff])[n % (options?.colors?.length ?? 1)],
  )
  const geometry = new THREE.BoxGeometry(size, size, size)
  const materials = [
    new THREE.MeshPhongMaterial({ color: colors[0] }), // +X
    new THREE.MeshPhongMaterial({ color: colors[1] }), // -X
    new THREE.MeshPhongMaterial({ color: colors[2] }), // +Y
    new THREE.MeshPhongMaterial({ color: colors[3] }), // -Y
    new THREE.MeshPhongMaterial({ color: colors[4] }), // +Z
    new THREE.MeshPhongMaterial({ color: colors[5] }), // -Z
  ]
  const mesh = new THREE.Mesh(geometry, materials)
  mesh.position.set(...position)

  if (options?.edges) {
    const edges = new THREE.EdgesGeometry(geometry)
    const line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({
        color: options.edgesColor ?? 0x000000,
        opacity: options.edgesOpacity ?? 1,
        transparent: (options.edgesOpacity ?? 1) < 1,
      }),
    )
    line.position.copy(mesh.position)
    // On regroupe mesh et edges dans un Group
    const group = new THREE.Group()
    group.add(mesh)
    group.add(line)
    return group
  } else {
    return mesh
  }
}

export function createColoredCubeInstance(
  position: [number, number, number],
  size = 1,
  withEdges = false,
  colors: number[],
): THREE.Group | THREE.Mesh {
  const template = withEdges
    ? coloredCubeWithEdgesTemplate
    : coloredCubeMeshTemplate
  const clone = template.clone(true)
  clone.position.set(...position)
  clone.scale.set(size, size, size)
  return clone
}

export function createRealisticEarthSphere(desc: {
  position?: [number, number, number]
  radius?: number
  greenwichAlignment?: number
  segmentsWidth?: number
  segmentsHeight?: number
  onTextureLoaded?: () => void // optionnel, pour forcer un render
}): THREE.Mesh {
  const DIFFUSE_MAP = 'images/earth_day_4096.jpg'
  const NORMAL_MAP = 'images/earth_normal_2048.jpg'

  const geometry = new THREE.SphereGeometry(
    desc.radius ?? 1,
    desc.segmentsWidth ?? 64,
    desc.segmentsHeight ?? 32,
  )

  const loader = new THREE.TextureLoader()
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.2,
    roughness: 0.8,
    bumpScale: 0.1,
    normalScale: new THREE.Vector2(1, 1),
    emissive: 0x222222,
  })

  const mesh = new THREE.Mesh(geometry, material)
  if (desc.position) mesh.position.set(...desc.position)
  if (desc.greenwichAlignment)
    mesh.rotation.y = THREE.MathUtils.degToRad(desc.greenwichAlignment)

  // Charge la texture diffuse
  loader.load(DIFFUSE_MAP, (diffuse) => {
    diffuse.colorSpace = THREE.SRGBColorSpace
    material.map = diffuse
    material.needsUpdate = true
    desc.onTextureLoaded?.()
  })

  // Charge la normalMap
  loader.load(NORMAL_MAP, (normal) => {
    material.normalMap = normal
    material.needsUpdate = true
    desc.onTextureLoaded?.()
  })

  return mesh
}

export function createGeoPoint(desc: {
  spherePosition?: [number, number, number]
  sphereRadius?: number
  latitude: number
  longitude: number
  altitude?: number
  pointRadius?: number
  pointColor?: string | number
  label?: string
  labelColor?: string
  labelOffset?: number
  labelSize?: number
  font?: string // chemin vers le .json MSDF
  fontTexture?: string // chemin vers le .png MSDF
  transparent?: boolean
}): THREE.Group {
  // Valeurs par défaut
  const spherePos = desc.spherePosition ?? [0, 0, 0]
  const r = (desc.sphereRadius ?? 1) + (desc.altitude ?? 0)
  const latRad = (desc.latitude * Math.PI) / 180
  const lonRad = (desc.longitude * Math.PI) / 180

  // Calcul coordonnées sphériques
  const [x, y, z] = sphericalToCartesian(
    desc.latitude,
    desc.longitude,
    r,
    spherePos,
  )

  // Création du point (petite sphère)
  const geometry = new THREE.SphereGeometry(desc.pointRadius ?? 0.03, 16, 16)
  const material = new THREE.MeshPhongMaterial({
    color: desc.pointColor ?? 0xff0000,
  })
  const point = new THREE.Mesh(geometry, material)
  point.position.set(x, y, z)

  const group = new THREE.Group()
  group.add(point)

  // Ajout du label si demandé
  if (desc.label) {
    const [x, y, z] = sphericalToCartesian(
      desc.latitude - 3,
      desc.longitude,
      r,
      spherePos,
    )
    const textMesh = new Text()
    // Label position avec offset
    // Normal à la sphère au point du label
    const normal = new THREE.Vector3(x, y, z).normalize()
    const labelOffset = desc.labelOffset ?? 0.05
    const labelPos = normal.clone().multiplyScalar(r + labelOffset)

    // Appliquer
    textMesh.position.copy(labelPos)
    textMesh.text = desc.label
    textMesh.fontSize = desc.labelSize ?? 0.5
    textMesh.color = desc.labelColor ?? '#ffffff'
    textMesh.anchorX = 'center'
    textMesh.anchorY = 'middle'
    textMesh.font = desc.font ?? 'fonts/Arial Rounded Bold.ttf'
    const euler = new THREE.Euler(0, lonRad, 0, 'YXZ')
    euler.x = -latRad // rotation latitude
    textMesh.setRotationFromEuler(euler)

    textMesh.sync()
    group.add(textMesh)
  }

  return group
}
export function createGeoPoints(desc: {
  spherePosition?: [number, number, number]
  sphereRadius?: number
  points: Array<{
    latitude: number
    longitude: number
    altitude?: number
    pointRadius?: number
    pointColor?: string | number
    label?: string
    labelColor?: string
    labelOffset?: number
    labelSize?: number
    font?: string
    transparent?: boolean
  }>
}): THREE.Group {
  const group = new THREE.Group()
  desc.points.forEach((pointDesc) => {
    group.add(
      createGeoPoint({
        spherePosition: desc.spherePosition,
        sphereRadius: desc.sphereRadius,
        ...pointDesc,
      }),
    )
  })
  return group
}

export type SkyscraperGridOptions = {
  grid: number[][]
  north: number[]
  south: number[]
  west: number[]
  east: number[]
}

/**
 * Construit une grille de gratte-ciels avec ses indices de visibilité.
 * Les textures sont créées ici, côté navigateur, afin que la description
 * transmise à <canvas-3d> reste légère et entièrement sérialisable.
 */
export function createSkyscraperGrid({
  grid,
  north,
  south,
  west,
  east,
}: SkyscraperGridOptions): THREE.Group {
  const group = new THREE.Group()
  const size = grid.length
  const cellSize = 1.15
  const footprint = 0.82
  const heightPerLevel = 0.72
  const center = ((size - 1) * cellSize) / 2
  const baseSize = (size + 2) * cellSize

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(baseSize, 0.12, baseSize),
    new THREE.MeshPhongMaterial({ color: 0x747c84 }),
  )
  base.position.y = -0.08
  group.add(base)

  const gridMaterial = new THREE.LineBasicMaterial({ color: 0xd9dde0 })
  for (let i = 0; i <= size; i++) {
    const offset = i * cellSize - center - cellSize / 2
    const horizontal = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-center - cellSize / 2, 0, offset),
      new THREE.Vector3(center + cellSize / 2, 0, offset),
    ])
    const vertical = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(offset, 0, -center - cellSize / 2),
      new THREE.Vector3(offset, 0, center + cellSize / 2),
    ])
    group.add(new THREE.Line(horizontal, gridMaterial))
    group.add(new THREE.Line(vertical, gridMaterial))
  }

  const facadeMaterials = new Map<number, THREE.MeshPhongMaterial>()
  const getFacadeMaterial = (levelCount: number) => {
    const cached = facadeMaterials.get(levelCount)
    if (cached) return cached

    const textureCanvas = document.createElement('canvas')
    textureCanvas.width = 64
    textureCanvas.height = 64
    const context = textureCanvas.getContext('2d')
    if (context) {
      context.fillStyle = '#495663'
      context.fillRect(0, 0, 64, 64)
      context.fillStyle = '#f8cf68'
      context.fillRect(8, 10, 18, 34)
      context.fillRect(38, 10, 18, 34)
      context.fillStyle = '#303b46'
      context.fillRect(0, 52, 64, 12)
    }
    const texture = new THREE.CanvasTexture(textureCanvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(1, levelCount)
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      map: texture,
    })
    facadeMaterials.set(levelCount, material)
    return material
  }

  grid.forEach((row, rowIndex) => {
    row.forEach((height, columnIndex) => {
      const levelCount = Math.max(1, Math.round(height / 10))
      const buildingHeight = levelCount * heightPerLevel
      const facade = getFacadeMaterial(levelCount)
      const roof = new THREE.MeshPhongMaterial({ color: 0xb9c0c5 })
      const bottom = new THREE.MeshPhongMaterial({ color: 0x3d4650 })
      const building = new THREE.Mesh(
        new THREE.BoxGeometry(footprint, buildingHeight, footprint),
        [facade, facade, roof, bottom, facade, facade],
      )
      building.position.set(
        columnIndex * cellSize - center,
        buildingHeight / 2,
        rowIndex * cellSize - center,
      )
      group.add(building)
    })
  })

  const addClue = (value: number, x: number, z: number) => {
    const label = new Text()
    label.text = String(value)
    label.font = 'fonts/Arial Rounded Bold.ttf'
    label.fontSize = 0.48
    label.color = '#17212b'
    label.anchorX = 'center'
    label.anchorY = 'middle'
    label.position.set(x, 0.03, z)
    label.rotation.x = -Math.PI / 2
    label.sync()
    group.add(label)
  }

  const clueOffset = center + cellSize
  for (let i = 0; i < size; i++) {
    const position = i * cellSize - center
    addClue(north[i], position, -clueOffset)
    addClue(south[i], position, clueOffset)
    addClue(west[i], -clueOffset, position)
    addClue(east[i], clueOffset, position)
  }

  return group
}

export function sphericalToCartesian(
  latitude: number,
  longitude: number,
  radius: number,
  center: [number, number, number],
): [number, number, number] {
  const latRad = (latitude * Math.PI) / 180
  const lonRad = (longitude * Math.PI) / 180
  return [
    center[0] + radius * Math.cos(latRad) * Math.sin(lonRad),
    center[1] + radius * Math.sin(latRad),
    center[2] + radius * Math.cos(latRad) * Math.cos(lonRad),
  ]
}

/**
 * Crée une sphère filaire personnalisée (parallèles, méridiens, équateur, Greenwich)
 */
export function createCustomWireSphere(
  desc: {
    position?: [number, number, number]
    radius?: number
    parallels?: number
    meridians?: number
    segments?: number
    parallelColor?: string | number
    meridianColor?: string | number
    showParallels?: boolean
    showMeridians?: boolean
    showEquator?: boolean
    equatorColor?: string | number
    equatorThickness?: number
    showGreenwich?: boolean
    greenwichColor?: string | number
    greenwichThickness?: number
  } = {},
): THREE.Group {
  const {
    position = [0, 0, 0],
    radius = 1,
    parallels = 4,
    meridians = 8,
    segments = 32,
    parallelColor = 0xcccccc,
    meridianColor = 0xcccc00,
    showParallels = true,
    showMeridians = true,
    showEquator = true,
    equatorColor = 0xffff00,
    equatorThickness = 0.02,
    showGreenwich = false,
    greenwichColor = 0x00ffff,
    greenwichThickness = 0.02,
  } = desc

  const group = new THREE.Group()
  group.position.set(...position)

  // Parallèles (hors équateur)
  if (showParallels) {
    for (let i = 1; i <= parallels; i++) {
      const phi = (Math.PI * i) / (parallels + 1)
      const circle = new THREE.EllipseCurve(
        0,
        0,
        radius * Math.sin(phi),
        radius * Math.sin(phi),
        0,
        2 * Math.PI,
        false,
        0,
      )
      const points = circle.getPoints(segments)
      const geometry = new THREE.BufferGeometry().setFromPoints(
        points.map((p) => new THREE.Vector3(p.x, radius * Math.cos(phi), p.y)),
      )
      const material = new THREE.LineBasicMaterial({ color: parallelColor })
      const line = new THREE.LineLoop(geometry, material)
      group.add(line)
    }
  }

  // Méridiens
  if (showMeridians) {
    for (let i = 0; i < meridians; i++) {
      const theta = (2 * Math.PI * i) / meridians
      const points: THREE.Vector3[] = []
      for (let j = 0; j <= segments; j++) {
        const phi = (Math.PI * j) / segments
        const x = radius * Math.sin(phi) * Math.sin(theta)
        const y = radius * Math.cos(phi)
        const z = radius * Math.sin(phi) * Math.cos(theta)
        points.push(new THREE.Vector3(x, y, z))
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      const material = new THREE.LineBasicMaterial({ color: meridianColor })
      const line = new THREE.Line(geometry, material)
      group.add(line)
    }
  }

  // Équateur
  if (showEquator) {
    const circle = new THREE.EllipseCurve(
      0,
      0,
      radius,
      radius,
      0,
      2 * Math.PI,
      false,
      0,
    )
    const points = circle.getPoints(segments)
    const geometry = new THREE.BufferGeometry().setFromPoints(
      points.map((p) => new THREE.Vector3(p.x, 0, p.y)),
    )
    const material = new THREE.LineBasicMaterial({
      color: equatorColor,
      linewidth: equatorThickness ? Math.max(1, equatorThickness * 10) : 2,
    })
    const line = new THREE.LineLoop(geometry, material)
    group.add(line)
  }

  // Méridien de Greenwich
  if (showGreenwich) {
    const points: THREE.Vector3[] = []
    for (let j = 0; j <= segments; j++) {
      const phi = (Math.PI * j) / segments
      const x = 0
      const y = radius * Math.cos(phi)
      const z = radius * Math.sin(phi)
      points.push(new THREE.Vector3(x, y, z))
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const material = new THREE.LineBasicMaterial({
      color: greenwichColor,
      linewidth: greenwichThickness ? Math.max(1, greenwichThickness * 10) : 2,
    })
    const line = new THREE.Line(geometry, material)
    group.add(line)
  }

  return group
}

export function createSkySphere(desc: {
  radius?: number
  image: string
  onTextureLoaded?: (mesh: THREE.Mesh) => void
}): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(desc.radius ?? 200, 64, 32)
  const textureLoader = new THREE.TextureLoader()
  const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })
  const mesh = new THREE.Mesh(geometry, material)
  textureLoader.load(desc.image, (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace
    material.map = texture
    material.needsUpdate = true
    desc.onTextureLoaded?.(mesh)
  })
  return mesh
}

/**
 * Fusionne plusieurs géométries en une seule BufferGeometry (suppression des sommets dupliqués).
 * @param geometries Array de THREE.BufferGeometry à fusionner
 * @returns Une BufferGeometry fusionnée
 */

export function createWireframeUnion(
  items: (THREE.BufferGeometry | THREE.Object3D)[],
  options?: {
    meshOpacity?: number
    meshColor?: THREE.ColorRepresentation
    dashedColor?: THREE.ColorRepresentation
    solidColor?: THREE.ColorRepresentation
  },
): THREE.Group {
  // 1. Récupère toutes les BufferGeometry récursivement
  const geometries: THREE.BufferGeometry[] = []

  function collectGeometries(obj: THREE.BufferGeometry | THREE.Object3D) {
    if (
      obj instanceof THREE.BufferGeometry &&
      !(obj instanceof THREE.EdgesGeometry)
    ) {
      geometries.push(obj)
    } else if (
      (obj as THREE.Mesh).geometry instanceof THREE.BufferGeometry &&
      !((obj as THREE.Mesh).geometry instanceof THREE.EdgesGeometry)
    ) {
      geometries.push((obj as THREE.Mesh).geometry)
    } else if (obj instanceof THREE.Group || obj instanceof THREE.Object3D) {
      obj.children.forEach((child) => collectGeometries(child))
    }
  }

  items.forEach((item) => collectGeometries(item))

  if (geometries.length === 0) {
    throw new Error('Aucune BufferGeometry trouvée pour la fusion')
  }

  // 2. Fusionne les géométries
  const mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries, true)
  if (!mergedGeometry) {
    throw new Error('La fusion des géométries a échoué (vérifiez les entrées)')
  }
  mergedGeometry.computeVertexNormals()
  // Inverser les faces dont la normale pointe vers l'intérieur
  const pos = mergedGeometry.getAttribute('position')

  // Calcul du barycentre
  const sum = new THREE.Vector3(0, 0, 0)
  for (let i = 0; i < pos.count; i++) {
    sum.x += pos.getX(i)
    sum.y += pos.getY(i)
    sum.z += pos.getZ(i)
  }
  const barycenter = sum.multiplyScalar(1 / pos.count)

  for (let i = 0; i < pos.count; i += 3) {
    // Calcul de la normale du triangle (A, B, C)
    const ax = pos.getX(i)
    const ay = pos.getY(i)
    const az = pos.getZ(i)
    const bx = pos.getX(i + 1)
    const by = pos.getY(i + 1)
    const bz = pos.getZ(i + 1)
    const cx = pos.getX(i + 2)
    const cy = pos.getY(i + 2)
    const cz = pos.getZ(i + 2)
    const ab = new THREE.Vector3(bx - ax, by - ay, bz - az)
    const ac = new THREE.Vector3(cx - ax, cy - ay, cz - az)
    const normal = new THREE.Vector3().crossVectors(ab, ac).normalize()
    const center = new THREE.Vector3(
      (ax + bx + cx) / 3,
      (ay + by + cy) / 3,
      (az + bz + cz) / 3,
    )
    const toBarycenter = barycenter.clone().sub(center).normalize()
    if (normal.dot(toBarycenter) > 0) {
      // La normale pointe vers l'intérieur, il faut inverser B et C
      pos.setXYZ(i + 1, cx, cy, cz)
      pos.setXYZ(i + 2, bx, by, bz)
    }
  }
  // 3. Crée le group (identique à avant)
  const group = new THREE.Group()

  // 4. Ajoute le mesh (optionnel)
  const mesh = new THREE.Mesh(
    mergedGeometry,
    new THREE.MeshPhongMaterial({
      color: options?.meshColor ?? 0xffffff,
      transparent: true,
      opacity: options?.meshOpacity ?? 0.5,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    }),
  )
  group.add(mesh)

  // 5. Arêtes cachées (pointillés)
  const edgesDashed = new THREE.EdgesGeometry(mergedGeometry)
  const dashedMaterial = new THREE.LineDashedMaterial({
    color: options?.dashedColor ?? 0x888888,
    dashSize: 0.08,
    gapSize: 0.04,
    linewidth: 1,
    transparent: true,
    opacity: 0.7,
    depthTest: true,
  })
  const dashedLines = new THREE.LineSegments(edgesDashed, dashedMaterial)
  dashedLines.computeLineDistances()
  group.add(dashedLines)

  // 6. Arêtes visibles (traits pleins)
  const edgesSolid = new THREE.EdgesGeometry(mergedGeometry)
  const solidMaterial = new THREE.LineBasicMaterial({
    color: options?.solidColor ?? 0x000000,
    linewidth: 2,
    transparent: false,
    depthTest: true,
  })
  const solidLines = new THREE.LineSegments(edgesSolid, solidMaterial)
  group.add(solidLines)

  return group
}
export function createPrismWithWireframe(
  sides: number,
  radius: number,
  bottom: number,
  top: number,
  withBottomBase = false,
  withTopBase = false,
  meshOpacity = 0.5,
): THREE.Group {
  const group = new THREE.Group()

  // 1. Mesh (faces pleines, légèrement transparentes)
  const geometry = createPrismGeometry(
    sides,
    radius,
    bottom,
    top,
    withBottomBase,
    withTopBase,
  )
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: meshOpacity,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    }),
  )
  group.add(mesh)

  // 2. Arêtes cachées (pointillés)
  const edgesDashed = new THREE.EdgesGeometry(geometry)
  const dashedMaterial = new THREE.LineDashedMaterial({
    color: 0x888888,
    dashSize: 0.08,
    gapSize: 0.04,
    linewidth: 1,
    transparent: true,
    opacity: 0.7,
    depthTest: true,
  })
  const dashedLines = new THREE.LineSegments(edgesDashed, dashedMaterial)
  dashedLines.computeLineDistances()
  group.add(dashedLines)

  // 3. Arêtes visibles (traits pleins, par-dessus)
  const edgesSolid = new THREE.EdgesGeometry(geometry)
  const solidMaterial = new THREE.LineBasicMaterial({
    color: 0x000000,
    linewidth: 2,
    transparent: false,
    depthTest: true,
  })
  const solidLines = new THREE.LineSegments(edgesSolid, solidMaterial)
  group.add(solidLines)

  return group
}

export function createPyramidWithWireframe(
  sides: number,
  radius: number,
  bottom: number,
  top: number,
  withBase = false,
  meshOpacity = 0.5,
): THREE.Group {
  const group = new THREE.Group()

  // 1. Mesh (faces pleines, légèrement transparentes)
  const geometry = createPyramidGeometry(sides, radius, bottom, top, withBase)

  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: meshOpacity,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    }),
  )
  group.add(mesh)

  // 2. Arêtes cachées (pointillés)
  const edgesDashed = new THREE.EdgesGeometry(geometry)
  const dashedMaterial = new THREE.LineDashedMaterial({
    color: 0x888888,
    dashSize: 0.08,
    gapSize: 0.04,
    linewidth: 1,
    transparent: true,
    opacity: 0.7,
    depthTest: true,
  })
  const dashedLines = new THREE.LineSegments(edgesDashed, dashedMaterial)
  dashedLines.computeLineDistances()
  group.add(dashedLines)

  // 3. Arêtes visibles (traits pleins, par-dessus)
  const edgesSolid = new THREE.EdgesGeometry(geometry)
  const solidMaterial = new THREE.LineBasicMaterial({
    color: 0x000000,
    linewidth: 2,
    transparent: false,
    depthTest: true,
  })
  const solidLines = new THREE.LineSegments(edgesSolid, solidMaterial)
  group.add(solidLines)

  return group
}

export function createTruncatedPyramidWithWireframe(
  sides: number,
  bottomRadius: number,
  topRadius: number,
  bottom: number,
  top: number,
  withBottomBase = false,
  withTopBase = false,
  meshOpacity = 0.5,
): THREE.Group {
  const group = new THREE.Group()

  // 1. Mesh (faces pleines, légèrement transparentes)
  const geometry = createTruncatedPyramidGeometry(
    sides,
    bottomRadius,
    topRadius,
    bottom,
    top,
    withBottomBase,
    withTopBase,
  )
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: meshOpacity,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    }),
  )
  group.add(mesh)

  // 2. Arêtes cachées (pointillés)
  const edgesDashed = new THREE.EdgesGeometry(geometry)
  const dashedMaterial = new THREE.LineDashedMaterial({
    color: 0x888888,
    dashSize: 0.08,
    gapSize: 0.04,
    linewidth: 1,
    transparent: true,
    opacity: 0.7,
    depthTest: true,
  })
  const dashedLines = new THREE.LineSegments(edgesDashed, dashedMaterial)
  dashedLines.computeLineDistances()
  group.add(dashedLines)

  // 3. Arêtes visibles (traits pleins, par-dessus)
  const edgesSolid = new THREE.EdgesGeometry(geometry)
  const solidMaterial = new THREE.LineBasicMaterial({
    color: 0x000000,
    linewidth: 2,
    transparent: false,
    depthTest: true,
  })
  const solidLines = new THREE.LineSegments(edgesSolid, solidMaterial)
  group.add(solidLines)

  return group
}
