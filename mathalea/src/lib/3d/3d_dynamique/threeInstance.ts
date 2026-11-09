import type * as THREEType from 'three'
import type { Object3D } from 'three'
import * as THREE from 'three'

import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Wireframe } from 'three/examples/jsm/lines/Wireframe.js'
export { Text } from 'troika-three-text'

const BoxGeometry = THREE.BoxGeometry
const Mesh = THREE.Mesh
const MeshPhongMaterial = THREE.MeshPhongMaterial

const EdgesGeometry = THREE.EdgesGeometry
type Object3DJSON = THREEType.Object3DJSON

export {
  BoxGeometry,
  BufferGeometryUtils,
  EdgesGeometry,
  LineMaterial,
  LineSegmentsGeometry,
  Mesh,
  MeshPhongMaterial,
  OrbitControls,
  THREE,
  Wireframe,
  type Object3D,
  type Object3DJSON,
  type THREEType,
}
