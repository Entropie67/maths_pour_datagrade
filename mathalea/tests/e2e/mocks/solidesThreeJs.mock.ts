import { vi } from 'vitest'

type StubNode = {
  kind: string
  args?: unknown[]
  children?: StubNode[]
  geometry?: unknown
}

function makeNode(kind: string, args: unknown[] = []): StubNode {
  return {
    kind,
    args,
    children: [],
  }
}

export function createSolidesThreeJsMock() {
  return {
    createPrismGeometry: vi.fn((...args) =>
      makeNode('createPrismGeometry', args),
    ),
    createPyramidGeometry: vi.fn((...args) =>
      makeNode('createPyramidGeometry', args),
    ),
    createTruncatedPyramidGeometry: vi.fn((...args) =>
      makeNode('createTruncatedPyramidGeometry', args),
    ),
    createMeshFromGeometry: vi.fn((geometry, material) => ({
      ...makeNode('createMeshFromGeometry', [geometry, material]),
      geometry,
      material,
    })),
    createEdgesFromGeometry: vi.fn((geometry, dashed = false) => ({
      ...makeNode('createEdgesFromGeometry', [geometry, dashed]),
      geometry,
      dashed,
    })),
    createColoredCube: vi.fn((...args) => makeNode('createColoredCube', args)),
    createColoredCubeInstance: vi.fn((...args) =>
      makeNode('createColoredCubeInstance', args),
    ),
    createRealisticEarthSphere: vi.fn((...args) =>
      makeNode('createRealisticEarthSphere', args),
    ),
    createGeoPoint: vi.fn((...args) => makeNode('createGeoPoint', args)),
    createGeoPoints: vi.fn((...args) => makeNode('createGeoPoints', args)),
    sphericalToCartesian: vi.fn(
      (
        latitude: number,
        longitude: number,
        radius: number,
        center: [number, number, number] = [0, 0, 0],
      ) => {
        const lat = (latitude * Math.PI) / 180
        const lon = (longitude * Math.PI) / 180
        const x = center[0] + radius * Math.cos(lat) * Math.cos(lon)
        const y = center[1] + radius * Math.sin(lat)
        const z = center[2] + radius * Math.cos(lat) * Math.sin(lon)
        return [x, y, z]
      },
    ),
    createCustomWireSphere: vi.fn((...args) =>
      makeNode('createCustomWireSphere', args),
    ),
    createSkySphere: vi.fn((...args) => makeNode('createSkySphere', args)),
    createWireframeUnion: vi.fn((geometries) => {
      const node = {
        ...makeNode('createWireframeUnion', [geometries]),
        geometries,
      }
      return { ...node, toJSON: () => node }
    }),
    createPrismWithWireframe: vi.fn((...args) =>
      makeNode('createPrismWithWireframe', args),
    ),
    createPyramidWithWireframe: vi.fn((...args) =>
      makeNode('createPyramidWithWireframe', args),
    ),
    createTruncatedPyramidWithWireframe: vi.fn((...args) =>
      makeNode('createTruncatedPyramidWithWireframe', args),
    ),
  }
}
