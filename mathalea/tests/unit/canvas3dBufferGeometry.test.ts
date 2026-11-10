import { afterEach, describe, expect, it, vi } from 'vitest'
import Canvas3dElement, {
  ajouteCanvas3d,
  type Canvas3DContentDescription,
} from '../../src/lib/3d/3d_dynamique/Canvas3DElement'
import {
  createPrismWithWireframe,
  createPyramidWithWireframe,
  createWireframeUnion,
} from '../../src/lib/3d/3d_dynamique/solidesThreeJs'
import { THREE } from '../../src/lib/3d/3d_dynamique/threeInstance'

// Seul le rendu GPU est remplacé ; les géométries, loaders et matériaux sont réels.
vi.mock('three', async (importOriginal) => {
  const actual = await importOriginal<typeof import('three')>()
  return {
    ...actual,
    WebGLRenderer: class {
      setSize() {}
      render() {}
      dispose() {}
      forceContextLoss() {}
    },
  }
})

afterEach(() => vi.restoreAllMocks())

describe('contrat bufferGeometry du canvas 3D', () => {
  it('préserve la sérialisation implicite et reconstruit les matériaux du canvas', () => {
    const group = createWireframeUnion([
      createPrismWithWireframe(4, 3, -0.5, 0.5, true, false),
      createPyramidWithWireframe(4, 3, 0.5, 2),
    ])
    const content: Canvas3DContentDescription = {
      objects: [{ type: 'bufferGeometry', geometry: group.toJSON() }],
      autoCenterZoomMargin: 1,
    }
    const html = ajouteCanvas3d({
      id: 'test-buffer-geometry',
      content,
      width: 250,
      height: 250,
    })
    const encodedContent = html.match(/content='([^']+)'/)?.[1]
    if (!encodedContent) throw new Error('Attribut content absent.')
    expect(decodeURIComponent(encodedContent)).toBe(
      JSON.stringify({
        objects: [{ type: 'bufferGeometry', geometry: group }],
        autoCenterZoomMargin: 1,
      }),
    )

    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(
      'data:image/png;base64,',
    )
    const canvas = new Canvas3dElement()
    canvas.setAttribute('content', encodedContent)
    canvas.connectedCallback()
    expect(canvas.objects).toHaveLength(1)
    const [faces, dashed, solid] = canvas.objects[0].children
    expect(canvas.objects[0].children).toHaveLength(3)
    if (
      !(faces instanceof THREE.Mesh) ||
      !(faces.material instanceof THREE.MeshPhongMaterial) ||
      !(dashed instanceof THREE.LineSegments) ||
      !(dashed.material instanceof THREE.LineDashedMaterial) ||
      !(solid instanceof THREE.LineSegments) ||
      !(solid.material instanceof THREE.LineBasicMaterial)
    ) {
      throw new Error('Matériaux du chemin bufferGeometry non conservés.')
    }
    expect(faces.material.color.getHex()).toBe(0x222222)
    expect(faces.material.opacity).toBe(0.5)
    expect(faces.material.polygonOffset).toBe(true)
    expect(dashed.material.dashSize).toBe(0.05)
    expect(dashed.material.gapSize).toBe(0.025)
    expect(dashed.material.depthTest).toBe(false)
    expect(solid.material.depthTest).toBe(true)
    expect([faces.renderOrder, dashed.renderOrder, solid.renderOrder]).toEqual([
      0, 1, 2,
    ])
    canvas.disconnectedCallback()
  })

  it('peut présenter une scène sous la forme d’un bouton seul', () => {
    const html = ajouteCanvas3d({
      id: 'test-button-only',
      content: {
        objects: [{ type: 'cube', pos: [0, 0, 0], size: 1 }],
      },
      width: 500,
      height: 500,
      buttonLabel: 'Visualisation 3D',
    })
    const encodedContent = html.match(/content='([^']+)'/)?.[1]
    if (!encodedContent) throw new Error('Attribut content absent.')

    const canvas = new Canvas3dElement()
    canvas.setAttribute('content', encodedContent)
    canvas.setAttribute('button-label', 'Visualisation 3D')
    canvas.connectedCallback()

    expect(canvas.style.width).toBe('auto')
    expect(canvas.querySelector('img')).toBeNull()
    expect(canvas.querySelector('button')?.textContent).toBe('Visualisation 3D')
    canvas.disconnectedCallback()
  })
})
