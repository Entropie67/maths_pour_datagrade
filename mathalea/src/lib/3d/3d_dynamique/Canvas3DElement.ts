import {
  createColoredCube,
  createCustomWireSphere,
  createEdgesFromGeometry,
  createGeoPoint,
  createGeoPoints,
  createRealisticEarthSphere,
  createSkySphere,
  createSkyscraperGrid,
} from './solidesThreeJs'
import {
  BufferGeometryUtils,
  OrbitControls,
  Text,
  THREE,
  type Object3DJSON,
} from './threeInstance'

export const DEFAULT_CUBE_COLORS = [
  0xff0000, // red
  0xa70909, // dark red
  0xffa35c, // orange
  0xda8427, // dark orange
  0xffff00, // yellow
  0xcaca1a, // dark yellow
]

class Canvas3dElement extends HTMLElement {
  private background: number = 0xeeeeee
  private width: number = 500
  private height: number = 300
  private renderer: THREE.WebGLRenderer | null = null
  private scene: THREE.Scene | null = null
  private camera: THREE.PerspectiveCamera | null = null
  private controls: OrbitControls | null = null
  private _objects: THREE.Object3D[] = []
  private _imgElement?: HTMLImageElement
  private _contentDescription?: Canvas3DContentDescription
  private _animationFrameId: number | null = null
  private _fullscreenBtn?: HTMLButtonElement
  private _cameraPosition: THREE.Vector3 = new THREE.Vector3(8, 8, 8)
  private _cameraTarget: THREE.Vector3 = new THREE.Vector3(0, 0, 0)

  private _imgClickHandler?: (ev: MouseEvent) => void

  set objects(objs: THREE.Object3D[]) {
    this._objects = objs
    if (this.scene) {
      this.setObjects(objs)
    }
  }

  get objects() {
    return this._objects
  }

  connectedCallback() {
    this.style.display = 'inline-block'
    this.width = parseInt(this.getAttribute('width') || '') || 500
    this.height = parseInt(this.getAttribute('height') || '') || 300
    this.style.width = `${this.width}px`
    this.style.height = `${this.height}px`
    this.style.position = 'relative'
    if (!this.camera) {
      // Valeurs par défaut
      const defaultPosition = new THREE.Vector3(8, 8, 8)
      const defaultTarget = new THREE.Vector3(0, 0, 0)
      this._cameraPosition = defaultPosition.clone()
      this._cameraTarget = defaultTarget.clone()
      this.camera = new THREE.PerspectiveCamera(
        35,
        this.width / this.height,
        0.1,
        1000,
      )
      this.camera.position.copy(this._cameraPosition)
      this.camera.lookAt(this._cameraTarget)
    }
    // Parsing du content
    const contentAttr = this.getAttribute('content')
    if (contentAttr) {
      try {
        // Cet attribut est produit par ajouteCanvas3d avec le contrat ci-dessous.
        const contentDescription: Canvas3DContentDescription = JSON.parse(
          decodeURIComponent(contentAttr),
        )
        this._contentDescription = contentDescription
        const margin = contentDescription.autoCenterZoomMargin ?? 1.2 // 1.2 par défaut
        if (Array.isArray(contentDescription.cameraPosition)) {
          const pos = contentDescription.cameraPosition
          this._cameraPosition.set(pos[0], pos[1], pos[2])
          if (this.camera) this.camera.position.set(pos[0], pos[1], pos[2])
        }
        if (Array.isArray(contentDescription.cameraTarget)) {
          const tgt = contentDescription.cameraTarget
          this._cameraTarget.set(tgt[0], tgt[1], tgt[2])
          if (this.camera) this.camera.lookAt(tgt[0], tgt[1], tgt[2])
          if (this.controls) {
            this.controls.target.set(tgt[0], tgt[1], tgt[2])
            this.controls.update()
          }
        }
        const objects = contentDescription.objects
          .map((desc) => {
            if (desc.type === 'geoPoint') {
              return createGeoPoint(desc)
            }
            if (desc.type === 'geoPoints') {
              return createGeoPoints(desc)
            }
            if (desc.type === 'cube') {
              return createColoredCube(desc.pos, desc.size, {
                edges: desc.edges,
                edgesColor: desc.edgesColor,
                edgesOpacity: desc.edgesOpacity,
                colors: desc.colors ?? DEFAULT_CUBE_COLORS,
              })
            }
            if (desc.type === 'skyscraperGrid') {
              return createSkyscraperGrid(desc)
            }
            if (desc.type === 'bufferGeometry') {
              if (
                'type' in desc.geometry &&
                desc.geometry.type === 'BufferGeometry'
              ) {
                // JSON de BufferGeometry
                const loader = new THREE.BufferGeometryLoader()
                const geometry = loader.parse(desc.geometry)
                // Création du group filaire à la main (comme dans createPrismWithWireframe)
                const group = new THREE.Group()

                // Mesh (faces pleines, transparentes)
                const mesh = new THREE.Mesh(
                  geometry,
                  new THREE.MeshPhongMaterial({
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.5,
                    polygonOffset: true,
                    polygonOffsetFactor: 1,
                    polygonOffsetUnits: 1,
                  }),
                )
                group.add(mesh)

                // Arêtes cachées (pointillés)
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
                const dashedLines = new THREE.LineSegments(
                  edgesDashed,
                  dashedMaterial,
                )
                dashedLines.computeLineDistances()
                group.add(dashedLines)

                // Arêtes visibles (traits pleins)
                const edgesSolid = new THREE.EdgesGeometry(geometry)
                const solidMaterial = new THREE.LineBasicMaterial({
                  color: 0x000000,
                  linewidth: 2,
                  transparent: false,
                  depthTest: true,
                })
                const solidLines = new THREE.LineSegments(
                  edgesSolid,
                  solidMaterial,
                )
                group.add(solidLines)

                return group
              } else if (
                'geometries' in desc.geometry &&
                Array.isArray(desc.geometry.geometries)
              ) {
                const loader = new THREE.BufferGeometryLoader()
                // On ne garde que les BufferGeometry (ignore EdgesGeometry)
                const bufferGeometries = desc.geometry.geometries
                  .filter((g) => g.type === 'BufferGeometry')
                  .map((g) => loader.parse(g))
                // Fusionne si plusieurs géométries, sinon prend la seule
                let geometry: THREE.BufferGeometry
                if (bufferGeometries.length === 1) {
                  geometry = bufferGeometries[0]
                } else {
                  // Nécessite BufferGeometryUtils
                  geometry = BufferGeometryUtils.mergeGeometries(
                    bufferGeometries,
                    true,
                  )
                }
                // Création du group filaire à la main (comme dans createPrismWithWireframe)
                const group = new THREE.Group()

                // Mesh (faces pleines, transparentes)
                const mesh = new THREE.Mesh(
                  geometry,
                  new THREE.MeshPhongMaterial({
                    color: 0x222222,
                    transparent: true,
                    opacity: 0.5,
                    polygonOffset: true,
                    polygonOffsetFactor: 1,
                    polygonOffsetUnits: 1,
                  }),
                )
                this.applyPolygonOffset(mesh)
                mesh.renderOrder = 0
                group.add(mesh)

                // Arêtes cachées (pointillés)
                const edgesDashed = createEdgesFromGeometry(geometry, true)
                edgesDashed.renderOrder = 1
                const edgesSolid = createEdgesFromGeometry(geometry, false)
                edgesSolid.renderOrder = 2
                group.add(edgesDashed)
                group.add(edgesSolid)

                return group
              }
            }
            if (desc.type === 'realisticEarthSphere') {
              return createRealisticEarthSphere({
                ...desc,
                onTextureLoaded: () => {
                  // Quand la texture est chargée, on refait le rendu statique
                  this.renderStaticImage()
                },
              })
            }

            if (desc.type === 'customWireSphere') {
              return createCustomWireSphere(desc)
            }
            if (desc.type === 'ambientLight') {
              return new THREE.AmbientLight(
                desc.color ?? 0xffffff,
                desc.intensity ?? 1,
              )
            }
            if (desc.type === 'directionalLight') {
              const light = new THREE.DirectionalLight(
                desc.color ?? 0xffffff,
                desc.intensity ?? 1,
              )
              if (desc.position)
                light.position.set(
                  ...(desc.position as [number, number, number]),
                )
              return light
            }
            if (desc.type === 'skySphere') {
              const sky = createSkySphere({
                ...desc,
                onTextureLoaded: () => {},
              })
              ;(sky as any).isSkySphere = true
              return sky
            }
            if (desc.type === 'group') {
              const loader = new THREE.ObjectLoader()
              const group = loader.parse(desc.object)
              return group
            }
            if (desc.type === 'canvas3dButton') {
              const btn = document.createElement('button')
              btn.id = desc.id
              btn.textContent = desc.text
              applyDefaultMathaleaButtonStyle(btn)
              btn.type = 'button'
              btn.style.cursor = 'pointer'
              if (desc.position) Object.assign(btn.style, desc.position)
              if (desc.style) Object.assign(btn.style, desc.style)
              btn.style.zIndex = '20'
              btn.style.pointerEvents = 'auto'

              // Event custom
              const handler = () => {
                this.dispatchEvent(
                  new CustomEvent(desc.onClick, {
                    bubbles: true,
                    composed: true,
                  }),
                )
              }
              btn.addEventListener('click', handler)

              // Ajout dans l'overlay
              let overlay = this.querySelector(
                '.canvas-threejs-overlay',
              ) as HTMLDivElement
              if (!overlay) {
                overlay = document.createElement('div')
                overlay.className = 'canvas-threejs-overlay'
                overlay.style.position = 'absolute'
                overlay.style.top = '0'
                overlay.style.left = '0'
                overlay.style.width = '100%'
                overlay.style.height = '100%'
                overlay.style.pointerEvents = 'none'
                overlay.style.zIndex = '10'
                this.appendChild(overlay)
              }
              overlay.appendChild(btn)
              return null
            }
            // ...autres types
            return null
          })
          .filter((object) => object !== null)

        this._objects = objects
        this.setObjects(objects)
        if (!(
          Array.isArray(this._contentDescription?.cameraPosition) ||
          Array.isArray(this._contentDescription?.cameraTarget)
        )) {
          this.autoCenterZoom(objects, margin)
        }
        const overlay = this.querySelector(
          '.canvas-threejs-overlay',
        ) as HTMLDivElement
        if (overlay) {
          overlay.style.display = 'none'
        }
        if (contentDescription.backgroundColor) {
          this.background = contentDescription.backgroundColor
          this.setBackground(contentDescription.backgroundColor)
        }
      } catch (e) {
        console.error('Erreur de parsing content:', e)
      }
    }

    const buttonLabel = this.getAttribute('button-label')
    // En mode bouton seul, la scène n'est révélée qu'à l'ouverture.
    if (buttonLabel && !this._fullscreenBtn) {
      this.style.width = 'auto'
      this.style.height = 'auto'
      this._fullscreenBtn = document.createElement('button')
      this._fullscreenBtn.textContent = buttonLabel
      this._fullscreenBtn.title = buttonLabel
      applyDefaultMathaleaButtonStyle(this._fullscreenBtn)
      this._fullscreenBtn.onclick = () => this.enterFullscreen()
      this.appendChild(this._fullscreenBtn)
    }
    // Création unique de l'image
    if (!buttonLabel && !this._imgElement) {
      this._imgElement = document.createElement('img')
      this._imgElement.style.position = 'absolute'
      this._imgElement.style.top = '0'
      this._imgElement.style.left = '0'
      this._imgElement.style.objectFit = 'contain'
      this._imgElement.style.zIndex = '1'
      this._imgElement.style.pointerEvents = 'auto'
      this._imgElement.style.cursor = 'zoom-in'
      this._imgElement.style.width = this.width + 'px'
      this._imgElement.style.height = this.height + 'px'
      this._imgClickHandler = () => this.enterFullscreen()
      this._imgElement.addEventListener('click', this._imgClickHandler)
      this.appendChild(this._imgElement)
    }
    // Création unique du bouton
    if (!buttonLabel && !this._fullscreenBtn) {
      this._fullscreenBtn = document.createElement('button')
      this._fullscreenBtn.innerHTML =
        '<i class="bx bx-fullscreen text-lg text-gray-700 hover:text-blue-500 transition-colors"></i>'
      this._fullscreenBtn.title = 'Plein écran'
      this._fullscreenBtn.style.position = 'absolute'
      this._fullscreenBtn.style.top = '5px'
      this._fullscreenBtn.style.right = '5px'
      this._fullscreenBtn.style.zIndex = '10'
      this._fullscreenBtn.style.pointerEvents = 'auto'
      this._fullscreenBtn.style.background = '#fff' // Fond blanc opaque
      this._fullscreenBtn.style.border = '1px solid #888' // Bordure grise
      this._fullscreenBtn.style.borderRadius = '6px'
      this._fullscreenBtn.style.width = '48px'
      this._fullscreenBtn.style.height = '48px'
      this._fullscreenBtn.style.display = 'flex'
      this._fullscreenBtn.style.alignItems = 'center'
      this._fullscreenBtn.style.justifyContent = 'center'
      this._fullscreenBtn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)'
      this._fullscreenBtn.style.cursor = 'pointer'
      this._fullscreenBtn.style.color = '#222'
      this._fullscreenBtn.style.opacity = '1'
      this._fullscreenBtn.onclick = () => this.enterFullscreen()
      this.appendChild(this._fullscreenBtn)
    }

    const textMeshes = getAllTroikaTextMeshes(this._objects)
    if (textMeshes.length > 0) {
      let readyCount = 0
      textMeshes.forEach((textMesh) => {
        textMesh.addEventListener(
          'synccomplete',
          () => {
            readyCount++
            if (readyCount === textMeshes.length) {
              this.renderStaticImage()
            }
          },
          { once: true },
        )
      })
    } else {
      this.renderStaticImage()
    }
  }

  disconnectedCallback() {
    if (this._imgElement && this._imgClickHandler) {
      this._imgElement.removeEventListener('click', this._imgClickHandler)
      this._imgClickHandler = undefined
    }
    this.removeDynamicButtonListeners()
    this.destroyRenderer()
  }

  private renderStaticImage() {
    if (!this._imgElement) return
    const width = this.width
    const height = this.height
    // Crée un renderer temporaire
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    canvas.style.width = width + 'px'
    canvas.style.height = height + 'px'
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    })
    if (this.renderer && this.background) {
      this.setBackground(this.background)
    }
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000)
    camera.position.copy(this._cameraPosition)
    camera.lookAt(this._cameraTarget)
    this._objects.forEach((obj) => scene.add(obj))
    renderer.setSize(width, height, false)
    renderer.render(scene, camera)
    const dataUrl = canvas.toDataURL('image/png')
    renderer.dispose()
    if (typeof renderer.forceContextLoss === 'function') {
      renderer.forceContextLoss()
    }
    // Met à jour le src de l'image existante

    if (this._imgElement) {
      this._imgElement.style.width = width + 'px'
      this._imgElement.style.height = height + 'px'
      this._imgElement.width = width
      this._imgElement.height = height
      this._imgElement.src = dataUrl
    } else {
      console.error(
        "Il n'y a pas de this._imgElement alors qu'on est dans renderStaticImage",
      )
    }
  }

  private enterFullscreen() {
    // Masque l'image et le bouton
    if (this._imgElement) this._imgElement.style.display = 'none'
    if (this._fullscreenBtn) this._fullscreenBtn.style.display = 'none'

    // Détection mobile simple (largeur < 800px ou userAgent)
    const isMobile =
      window.innerWidth < 800 ||
      /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|Mobile/i.test(
        navigator.userAgent,
      )

    if (isMobile) {
      // Canvas plein écran natif sur mobile
      const width = window.innerWidth
      const height = window.innerHeight
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.style.width = '100vw'
      canvas.style.height = '100vh'
      canvas.style.position = 'fixed'
      canvas.style.top = '0'
      canvas.style.left = '0'
      canvas.style.zIndex = '5000'
      document.body.appendChild(canvas)

      // Demande le fullscreen natif
      if (canvas.requestFullscreen) {
        canvas.requestFullscreen()
      } else if ((canvas as any).webkitRequestFullscreen) {
        ;(canvas as any).webkitRequestFullscreen()
      }

      // Ajoute le bouton de sortie
      const exitBtn = document.createElement('button')
      exitBtn.type = 'button'
      exitBtn.style.position = 'fixed'
      exitBtn.style.top = '20px'
      exitBtn.style.right = '30px'
      exitBtn.style.zIndex = '6000'
      exitBtn.style.background = '#fff'
      exitBtn.style.border = '1px solid #888'
      exitBtn.style.borderRadius = '6px'
      exitBtn.style.width = '48px'
      exitBtn.style.height = '48px'
      exitBtn.style.fontSize = '1.8em'
      exitBtn.style.display = 'flex'
      exitBtn.style.alignItems = 'center'
      exitBtn.style.justifyContent = 'center'
      exitBtn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)'
      exitBtn.style.cursor = 'pointer'
      exitBtn.innerHTML =
        '<i class="bx bx-exit-fullscreen text-lg text-gray-700 hover:text-blue-500 transition-colors"></i>'
      exitBtn.title = 'Quitter le plein écran'
      document.body.appendChild(exitBtn)

      // Crée le renderer et la scène
      this.renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: false,
      })
      if (this.renderer && this.background) {
        this.setBackground(this.background)
      }
      this.scene = new THREE.Scene()
      this.camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000)
      this.camera.position.copy(this._cameraPosition)
      this.camera.lookAt(this._cameraTarget)
      this.controls = new OrbitControls(this.camera, canvas)
      this.controls.target.copy(this._cameraTarget)
      this.controls.update()
      this._objects.forEach((obj) => this.scene!.add(obj))
      this.renderer.setSize(width, height, false)
      this.startAnimationLoop()

      // Sortie du fullscreen natif
      const exit = () => {
        if (document.body.contains(exitBtn)) {
          document.body.removeChild(exitBtn)
        }
        this.stopAnimationLoop()
        if (this.renderer) {
          this.renderer.dispose()
          if (typeof this.renderer.forceContextLoss === 'function') {
            this.renderer.forceContextLoss()
          }
        }
        if (document.body.contains(canvas)) {
          document.body.removeChild(canvas)
        }
        this.renderer = null
        this.scene = null
        this.camera = null
        this.controls = null
        this.renderStaticImage()
        if (this._fullscreenBtn) {
          this._fullscreenBtn.style.display = ''
        }
        if (this._imgElement) {
          this._imgElement.style.display = ''
        }
        // Quitte le fullscreen natif si actif
        if (document.fullscreenElement) {
          document.exitFullscreen?.()
        }
      }
      exitBtn.onclick = exit

      // Quitte le plein écran si l'utilisateur utilise le geste natif
      document.addEventListener(
        'fullscreenchange',
        () => {
          if (!document.fullscreenElement) {
            exit()
          }
        },
        { once: true },
      )

      return
    }

    // --- Comportement desktop inchangé ---
    // Ajout du bouton dans enterFullscreen()
    const exitBtn = document.createElement('button')
    exitBtn.type = 'button'
    exitBtn.style.position = 'fixed'
    exitBtn.style.top = '20px'
    exitBtn.style.right = '30px'
    exitBtn.style.zIndex = '2000'
    exitBtn.style.background = '#fff'
    exitBtn.style.border = '1px solid #888'
    exitBtn.style.borderRadius = '6px'
    exitBtn.style.width = '48px'
    exitBtn.style.height = '48px'
    exitBtn.style.fontSize = '1.8em'
    exitBtn.style.display = 'flex'
    exitBtn.style.alignItems = 'center'
    exitBtn.style.justifyContent = 'center'
    exitBtn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)'
    exitBtn.style.cursor = 'pointer'

    exitBtn.innerHTML =
      '<i class="bx bx-exit-fullscreen text-lg text-gray-700 hover:text-blue-500 transition-colors"></i>'
    exitBtn.title = 'Quitter le plein écran'
    exitBtn.style.zIndex = '6000'

    exitBtn.onclick = () => {
      exit()
    }
    document.body.appendChild(exitBtn)

    // Crée le canvas fullscreen
    const width = window.innerWidth
    const height = window.innerHeight
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    canvas.style.position = 'absolute'
    canvas.style.top = '0'
    canvas.style.left = '0'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.zIndex = '5000'
    document.body.appendChild(canvas)
    const overlay = this.querySelector(
      '.canvas-threejs-overlay',
    ) as HTMLDivElement
    if (overlay) {
      overlay.style.position = 'fixed'
      overlay.style.display = 'block'
      overlay.style.top = '0'
      overlay.style.left = '0'
      overlay.style.width = '100vw'
      overlay.style.height = '100vh'
      overlay.style.zIndex = '6000' // supérieur au canvas
      overlay.style.pointerEvents = 'none' // sauf pour les boutons
      // Pour chaque bouton dans l'overlay
      overlay.querySelectorAll('button').forEach((btn) => {
        btn.style.zIndex = '6010'
        btn.style.pointerEvents = 'auto'
      })
    }

    // Crée le renderer et la scène
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
    })
    if (this.renderer && this.background) {
      this.setBackground(this.background)
    }
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000)
    this.camera.position.copy(this._cameraPosition)
    this.camera.lookAt(this._cameraTarget)
    this.controls = new OrbitControls(this.camera, canvas)
    this.controls.target.copy(this._cameraTarget)
    this.controls.update()
    this._objects.forEach((obj) => this.scene!.add(obj))
    this.renderer.setSize(width, height, false)

    // Animation
    this.startAnimationLoop()

    // Sortie du fullscreen simulé
    const exit = () => {
      if (document.body.contains(exitBtn)) {
        document.body.removeChild(exitBtn)
      }
      if (overlay) {
        overlay.style.position = 'absolute'
        overlay.style.display = 'none'
        overlay.style.top = '0'
        overlay.style.left = '0'
        overlay.style.width = '100%'
        overlay.style.height = '100%'
        overlay.style.zIndex = '10'
        overlay.style.pointerEvents = 'none'
        overlay.querySelectorAll('button').forEach((btn) => {
          btn.style.zIndex = '20'
          btn.style.pointerEvents = 'auto'
        })
      }

      this.stopAnimationLoop()
      if (this.renderer) {
        this.renderer.dispose()
        if (typeof this.renderer.forceContextLoss === 'function') {
          this.renderer.forceContextLoss()
        }
      }
      document.body.removeChild(canvas)
      this.renderer = null
      this.scene = null
      this.camera = null
      this.controls = null
      this.renderStaticImage()
      if (this._fullscreenBtn) {
        this._fullscreenBtn.style.display = ''
      }
      if (this._imgElement) {
        this._imgElement.style.display = ''
      }
    }
  }

  private setObjects(objects: THREE.Object3D[]) {
    if (!this.scene) return
    this.scene.clear()
    objects.forEach((obj) => this.scene!.add(obj))
    this.renderer?.render(this.scene, this.camera!)
  }

  private startAnimationLoop() {
    if (this._animationFrameId) return
    const loop = () => {
      this.renderer?.render(this.scene!, this.camera!)
      // Stocke la position et la cible actuelles
      if (this.camera) {
        this._cameraPosition.copy(this.camera.position)
        if (this.controls) {
          this._cameraTarget.copy(this.controls.target)
        } else {
          // Si pas de controls, cible = lookAt
          // (optionnel, selon ton usage)
        }
      }
      this._animationFrameId = requestAnimationFrame(loop)
    }
    loop()
  }

  private stopAnimationLoop() {
    if (this._animationFrameId) {
      cancelAnimationFrame(this._animationFrameId)
      this._animationFrameId = null
    }
  }

  private applyPolygonOffset(mesh: THREE.Mesh) {
    const materials = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material]
    for (const mat of materials) {
      mat.polygonOffset = true
      mat.polygonOffsetFactor = 1
      mat.polygonOffsetUnits = 1
    }
  }

  autoCenterZoom(objects: THREE.Object3D[], margin: number = 1.2) {
    const objs = objects
      .filter((obj) => !(obj as any).isSkySphere)
      .filter(
        (obj) => obj.type !== 'DirectionalLight' && obj.type !== 'AmbientLight',
      )

    const box = new THREE.Box3()
    objs.forEach((obj) => {
      if (obj instanceof THREE.Object3D) {
        const objBox = new THREE.Box3().setFromObject(obj)
        box.union(objBox)
        if (obj instanceof THREE.LineSegments && obj.userData.sourceGeometry) {
          const tempMesh = new THREE.Mesh(obj.userData.sourceGeometry)
          const geomBox = new THREE.Box3().setFromObject(tempMesh)
          box.union(geomBox)
        }
      }
    })

    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    const dx = size.x
    const dy = size.y
    const dz = size.z

    // ...calcul du center et de la distance...
    if (margin > 0 && this.camera) {
      // Calcule la nouvelle position
      const fovRad = (this.camera.fov * Math.PI) / 180
      const aspect = this.width / this.height
      const fovHorizontalRad = 2 * Math.atan(Math.tan(fovRad / 2) * aspect)
      const distanceV = dy / (2 * Math.tan(fovRad / 2))
      const distanceH = dx / (2 * Math.tan(fovHorizontalRad / 2))
      const distance = margin * Math.max(distanceV, distanceH, dz)
      const newPosition = new THREE.Vector3(
        center.x + distance,
        center.y + distance,
        center.z + distance,
      )
      this._cameraPosition.copy(newPosition) // <-- MAJ la position de référence
      this.camera.position.copy(newPosition)
    }
    // Centre la cible
    this._cameraTarget.copy(center) // <-- MAJ la cible de référence
    if (this.controls) {
      this.controls.target.copy(center)
      this.controls.update()
    } else if (this.camera) {
      this.camera.lookAt(center)
    }
  }

  private destroyRenderer() {
    this.stopAnimationLoop()
    if (this.renderer) {
      this.renderer.dispose()
      if (typeof this.renderer.forceContextLoss === 'function') {
        this.renderer.forceContextLoss()
      }
    }
    this.renderer = null
    this.scene = null
    this.camera = null
    this.controls = null
  }

  setBackground(color: string | number) {
    if (this.renderer) {
      this.renderer.setClearColor(color)
    }
  }

  private removeDynamicButtonListeners() {
    // Sélectionne tous les boutons dynamiques dans l'overlay
    const overlay = this.querySelector(
      '.canvas-threejs-overlay',
    ) as HTMLDivElement
    if (overlay) {
      const buttons = overlay.querySelectorAll('button')
      buttons.forEach((btn) => {
        // Clone le bouton pour supprimer tous les listeners
        const clone = btn.cloneNode(true) as HTMLButtonElement
        overlay.replaceChild(clone, btn)
      })
      // Optionnel : retire l'overlay du DOM
      this.removeChild(overlay)
    }
  }
}

customElements.define('canvas-3d', Canvas3dElement)
export default Canvas3dElement

interface CubeDescription {
  type: 'cube'
  pos: [number, number, number]
  size: number
  edges?: boolean
  edgesColor?: number
  edgesOpacity?: number
  colors?: number[]
  // Compatibilité des descriptions existantes ; le rendu utilise colors.
  color?: string | number
}

export interface SkyscraperGridDescription {
  type: 'skyscraperGrid'
  grid: number[][]
  north: number[]
  south: number[]
  west: number[]
  east: number[]
}

interface AmbientLightDescription {
  type: 'ambientLight'
  color?: string | number
  intensity?: number
  [key: string]: any
}

interface DirectionalLightDescription {
  type: 'directionalLight'
  color?: string | number
  intensity?: number
  position?: [number, number, number]
  [key: string]: any
}

interface SphereDescription {
  type: 'sphere'
  position?: [number, number, number]
  radius: number
  color?: string | number
  wireframe?: boolean
  [key: string]: any
}

export interface GeoPointDescription {
  type: 'geoPoint'
  latitude: number
  longitude: number
  spherePosition?: [number, number, number]
  sphereRadius?: number
  label?: string
  pointColor?: string | number
  pointRadius?: number
  labelColor?: string
  labelSize?: number
  font?: string
  transparent?: boolean
  [key: string]: any
}

interface GeoPointsDescription {
  type: 'geoPoints'
  spherePosition?: [number, number, number]
  sphereRadius?: number
  points: GeoPointCoordinates[]
}

interface GeoPointCoordinates {
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
}

interface RealisticEarthSphereDescription {
  type: 'realisticEarthSphere'
  position?: [number, number, number]
  radius?: number
  greenwichAlignment?: number
  segmentsWidth?: number
  segmentsHeight?: number
  [key: string]: any
}

interface CustomWireSphereDescription {
  type: 'customWireSphere'
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
  [key: string]: any
}

interface SkySphereDescription {
  type: 'skySphere'
  radius?: number
  image: string
  [key: string]: any
}
// Three sérialise ces ressources à la racine, mais Object3DJSON ne les déclare pas.
export interface Object3DWithGeometriesJSON extends Object3DJSON {
  geometries?: THREE.BufferGeometryJSON[]
}

export interface BufferGeometryDescription {
  type: 'bufferGeometry'
  // Des données JSON, jamais une instance vivante de Group ou de BufferGeometry.
  geometry: THREE.BufferGeometryJSON | Object3DWithGeometriesJSON
}

export type LineSegmentsDescription = {
  type: 'lineSegments'
  geometry: THREE.LineSegments
}

export interface GroupDescription {
  type: 'group'
  object: Object3DJSON
}

export interface Canvas3dButtonDescription {
  type: 'canvas3dButton'
  id: string
  text: string
  position?: { top?: string; left?: string; right?: string; bottom?: string }
  style?: Partial<CSSStyleDeclaration>
  onClick: string // nom de l'event custom à déclencher
}

export type Elements3DDescription =
  | BufferGeometryDescription
  | CubeDescription
  | SkyscraperGridDescription
  | SphereDescription
  | GroupDescription
  | GeoPointDescription
  | GeoPointsDescription
  | RealisticEarthSphereDescription
  | CustomWireSphereDescription
  | SkySphereDescription
  | AmbientLightDescription
  | DirectionalLightDescription
  | Canvas3dButtonDescription

export interface Canvas3DContentDescription {
  objects: Elements3DDescription[]
  backgroundColor?: number
  autoCenterZoomMargin?: number
  cameraPosition?: [number, number, number]
  cameraTarget?: [number, number, number]
}

export function ajouteCanvas3d({
  id,
  content,
  width = 200,
  height = 200,
  className,
  buttonLabel,
}: {
  id: string
  content: Canvas3DContentDescription
  width: number
  height: number
  className?: string
  buttonLabel?: string
}): string {
  const contentJson = encodeURIComponent(JSON.stringify(content))
  const classAttribute = className ? ` class="${className}"` : ''
  const buttonAttribute = buttonLabel
    ? ` button-label="${buttonLabel.replaceAll('&', '&amp;').replaceAll('"', '&quot;')}"`
    : ''
  return `<canvas-3d id="${id}"${classAttribute}${buttonAttribute} content='${contentJson}' width="${width}" height="${height}"></canvas-3d>`
}

function applyDefaultMathaleaButtonStyle(btn: HTMLButtonElement) {
  btn.className =
    'inline-flex px-6 py-2.5 ml-6 bg-coopmaths-action dark:bg-coopmathsdark-action text-coopmaths-canvas dark:text-coopmathsdark-canvas font-medium text-xs leading-tight uppercase rounded shadow-md transform hover:bg-coopmaths-action-lightest dark:hover:bg-coopmathsdark-action-lightest hover:shadow-lg focus:bg-coopmaths-action-lightest dark:focus:bg-coopmathsdark-action-lightest focus:shadow-lg focus:outline-none focus:ring-0 active:bg-coopmaths-action-lightest dark:active:bg-coopmathsdark-action-lightest active:shadow-lg transition duration-150 ease-in-out'
  btn.setAttribute('type', 'button')
}

function getAllTroikaTextMeshes(objects: THREE.Object3D[]): any[] {
  const texts: any[] = []
  objects.forEach((obj) => {
    obj.traverse((child) => {
      if (child instanceof Text) texts.push(child)
    })
  })
  return texts
}
