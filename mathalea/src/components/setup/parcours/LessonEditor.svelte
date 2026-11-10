<script lang="ts">
  // Éditeur d'une fiche de cours : les blocs à gauche, l'aperçu tel que
  // l'élève le verra dans l'application à droite. Toucher un bloc de
  // l'aperçu l'ouvre ; le JSON reste accessible pour qui l'écrit à la main.
  import {
    BLOCK_ICONS,
    BLOCK_LABELS,
    blockProblem,
    emptyBlock,
    isLesson,
    lessonProblems,
    SLIDER_NAME,
    withoutKeys,
  } from '../../../lib/parcours/lessonFile'
  import {
    newKey,
    type EditorCollab,
  } from '../../../lib/parcours/salon/salonPresence'
  import SalonMark from './salon/SalonMark.svelte'
  import {
    GRAPH_COLORS,
    LINE_STYLES,
    POINT_SHAPES,
    type CurveStyle,
    type GraphColor,
    type GraphPoint,
    type GraphText,
    type Lesson,
    type LessonBlock,
    type LessonBlockType,
    type LessonGraph,
    type Slider,
  } from '../../../lib/parcours/parcoursTypes'

  type LineStyle = (typeof LINE_STYLES)[number]
  type PointShape = (typeof POINT_SHAPES)[number]
  import { tick } from 'svelte'
  import LessonPreview from './LessonPreview.svelte'
  import LessonTextField from './LessonTextField.svelte'

  let {
    lesson,
    onchange,
    collab,
  }: {
    lesson: Lesson
    onchange: (lesson: Lesson) => void
    collab?: EditorCollab // fiche d'un salon : verrous et commentaires
  } = $props()

  // Bloc ouvert. Dans un salon, il est suivi par sa clé : un bloc ajouté plus
  // haut par quelqu'un d'autre ne fait pas changer le bloc ouvert
  let openedIndex: number | null = $state(null)
  let openedKey: string | null = $state(null)
  const opened = $derived.by(() => {
    if (!collab) return openedIndex
    const k = lesson.blocs.findIndex((b) => b.cle === openedKey)
    return k === -1 ? null : k
  })
  function setOpened(k: number | null, key?: string) {
    openedIndex = k
    openedKey = k === null ? null : (key ?? lesson.blocs[k]?.cle ?? null)
  }
  const mark = (el: string) => (collab ? el : undefined)
  /** Élément amené au milieu de l'écran (ouvert depuis un commentaire) */
  const scrollToElement = (el: string) =>
    void tick().then(() =>
      document
        .querySelector(`[data-element="${CSS.escape(el)}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
    )
  /** Élément d'un commentaire : un bloc s'ouvre */
  export function reveal(el: string) {
    const k = lesson.blocs.findIndex((b) => `bloc:${b.cle}` === el)
    if (k !== -1) setOpened(k)
    scrollToElement(el)
  }
  // Bloc neuf : dans un salon, il reçoit tout de suite sa clé
  const fresh = (b: LessonBlock): LessonBlock =>
    collab ? { ...b, cle: newKey() } : b
  let jsonText = $state('')
  let jsonError = $state('')

  const copy = (): Lesson => JSON.parse(JSON.stringify($state.snapshot(lesson)))
  const update = (change: (l: Lesson) => void) => {
    const next = copy()
    change(next)
    onchange(next)
  }
  const setBlock = (k: number, change: (b: LessonBlock) => void) =>
    update((l) => change(l.blocs[k]))

  function add(type: LessonBlockType) {
    const at = opened === null ? lesson.blocs.length : opened + 1
    const b = fresh(emptyBlock(type))
    update((l) => l.blocs.splice(at, 0, b))
    setOpened(at, b.cle)
  }
  function move(k: number, d: -1 | 1) {
    update((l) => {
      const [b] = l.blocs.splice(k, 1)
      l.blocs.splice(k + d, 0, b)
    })
    if (opened === k) setOpened(k + d, openedKey ?? undefined)
  }
  function remove(k: number) {
    update((l) => l.blocs.splice(k, 1))
    setOpened(null)
  }
  function duplicate(k: number) {
    const b = fresh(JSON.parse(JSON.stringify($state.snapshot(lesson.blocs[k]))))
    update((l) => l.blocs.splice(k + 1, 0, b))
    setOpened(k + 1, b.cle)
  }

  /** Nombre saisi (virgule acceptée) ; undefined si le champ est vide ou faux */
  const readNumber = (t: string) => {
    const v = Number(t.trim().replace(',', '.').replace('−', '-'))
    return t.trim() === '' || !Number.isFinite(v) ? undefined : v
  }
  const show = (v: number | undefined) =>
    v === undefined ? '' : String(v).replace('.', ',')

  /** Résumé d'un bloc replié : début du texte, sans mise en forme */
  function summary(b: LessonBlock) {
    const plain = (t: string) =>
      t.replace(/\$\$?/g, '').replace(/\*+/g, '').replace(/\s+/g, ' ').trim()
    const text =
      b.type === 'texte' || b.type === 'retenir'
        ? b.texte
        : b.type === 'exemple' || b.type === 'question'
          ? b.enonce
          : b.type === 'graphique'
            ? b.fonctions.join(' ; ')
            : b.type === 'image'
              ? b.alt
              : b.titre
    const p = plain(text)
    return p.length > 70 ? `${p.slice(0, 70)}…` : p
  }

  // Graphiques : curseurs, aire
  const sliderNames = (g: LessonGraph) => Object.keys(g.curseurs ?? {})
  function nextSliderName(g: LessonGraph) {
    return (
      'abcdkmnpqrst'.split('').find((n) => !sliderNames(g).includes(n)) ?? 'z'
    )
  }
  /** Curseur neuf sur toute la fenêtre : le premier au quart, le suivant aux trois quarts */
  function newSlider(g: LessonGraph): Slider {
    const [x0, x1] = g.x
    const raw = (x1 - x0) / 20
    const p = Math.pow(10, Math.floor(Math.log10(raw)))
    const step = [1, 2, 5, 10].map((m) => m * p).find((m) => m >= raw)!
    const at = sliderNames(g).length % 2 ? 0.75 : 0.25
    const value = Math.round((x0 + (x1 - x0) * at) / step) * step
    return [x0, x1, +value.toFixed(10), +step.toFixed(10)]
  }
  function renameSlider(k: number, from: string, to: string) {
    setBlock(k, (b) => {
      const g = b as LessonGraph
      const entries = Object.entries(g.curseurs ?? {}).map(
        ([n, c]): [string, Slider] => [n === from ? to : n, c],
      )
      g.curseurs = Object.fromEntries(entries)
      if (g.aire?.de === from) g.aire.de = to
      if (g.aire?.a === from) g.aire.a = to
    })
  }
  /** Style d'une courbe ; sans aucun style choisi, le champ disparaît */
  function setStyle(
    k: number,
    j: number,
    key: 'trait' | 'couleur',
    value: string,
  ) {
    setBlock(k, (b) => {
      const g = b as LessonGraph
      const styles: CurveStyle[] = g.styles ?? []
      while (styles.length <= j) styles.push({})
      const isDefault =
        key === 'trait'
          ? value === 'plein'
          : value === (j % 2 ? 'orange' : 'bleu')
      if (isDefault) delete styles[j][key]
      else Object.assign(styles[j], { [key]: value })
      while (styles.length && !styles.at(-1)!.trait && !styles.at(-1)!.couleur)
        styles.pop()
      if (styles.length) g.styles = styles
      else delete g.styles
    })
  }
  const setPoint = (k: number, j: number, change: (p: GraphPoint) => void) =>
    setBlock(k, (b) => change((b as LessonGraph).points![j]))
  const setText = (k: number, j: number, change: (t: GraphText) => void) =>
    setBlock(k, (b) => change((b as LessonGraph).textes![j]))
  const showCoordinate = (c: number | string) =>
    typeof c === 'number' ? show(c) : c
  const LINE_LABELS: Record<LineStyle, string> = {
    plein: 'Plein',
    tirets: 'Tirets',
    pointilles: 'Pointillés',
  }
  const COLOR_LABELS: Record<GraphColor, string> = {
    bleu: 'Bleu',
    orange: 'Orange',
    vert: 'Vert',
    gris: 'Gris',
  }
  const SHAPE_LABELS: Record<PointShape, string> = {
    plein: 'Point plein',
    vide: 'Point vide',
    croix: 'Croix',
  }

  /** Borne d'aire : nombre, ou nom d'un curseur */
  const readBound = (t: string): number | string =>
    readNumber(t) ?? t.trim().toLowerCase()

  async function chooseImage(k: number, file: File | undefined) {
    if (!file) return
    const src = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.readAsDataURL(file)
    })
    setBlock(k, (b) => {
      if (b.type === 'image') {
        b.src = src
        if (!b.alt) b.alt = file.name.replace(/\.[a-z]+$/i, '')
      }
    })
  }
  const size = (src: string) => Math.round((src.length * 3) / 4 / 1024)

  function openJson(open: boolean) {
    if (!open) return
    jsonText = JSON.stringify(withoutKeys($state.snapshot(lesson)), null, 2)
    jsonError = ''
  }
  function applyJson(text: string) {
    jsonText = text
    let value: unknown
    try {
      value = JSON.parse(text)
    } catch {
      jsonError = 'JSON invalide.'
      return
    }
    if (!isLesson(value)) {
      jsonError =
        'Ce n’est pas une fiche valide (titre, blocs et champs de chaque bloc).'
      return
    }
    jsonError = ''
    onchange(value)
  }

  const problems = $derived(lessonProblems(lesson))

  const label =
    'block text-sm font-light text-coopmaths-struct dark:text-coopmathsdark-struct'
  const field =
    'w-full rounded-md border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest bg-coopmaths-canvas dark:bg-coopmathsdark-canvas px-3 py-2 text-coopmaths-corpus dark:text-coopmathsdark-corpus focus:outline-none focus:border-coopmaths-action dark:focus:border-coopmathsdark-action'
  const small = `${field} px-2 py-1 text-sm`
  const quiet =
    'text-sm text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light'
  const link =
    'inline-flex items-center gap-1 text-sm font-semibold text-coopmaths-action dark:text-coopmathsdark-action hover:text-coopmaths-action-lightest dark:hover:text-coopmathsdark-action-lightest'
  const iconButton =
    'inline-flex items-center justify-center w-8 h-8 rounded-full text-coopmaths-action dark:text-coopmathsdark-action hover:bg-coopmaths-canvas-dark dark:hover:bg-coopmathsdark-canvas-dark disabled:opacity-30 disabled:hover:bg-transparent'
  const chip =
    'inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm border border-coopmaths-action dark:border-coopmathsdark-action text-coopmaths-action dark:text-coopmathsdark-action hover:bg-coopmaths-canvas-dark dark:hover:bg-coopmathsdark-canvas-dark'
  const segment = (on: boolean) =>
    `px-3 py-1 text-sm font-semibold ${
      on
        ? 'bg-coopmaths-action dark:bg-coopmathsdark-action text-coopmaths-canvas dark:text-coopmathsdark-canvas'
        : 'text-coopmaths-action dark:text-coopmathsdark-action'
    }`
</script>

{#snippet graphForm(k: number, g: LessonGraph)}
  {@const names = sliderNames(g)}
  <div class="flex flex-col gap-2">
    <span class={label}
      >Fonctions (en x{names.map((n) => `, ${n}`).join('')})</span
    >
    {#each g.fonctions as f, j (j)}
      <div class="flex flex-row items-center gap-2">
        <span class="w-10 shrink-0 italic {quiet}"
          >{['f', 'g', 'h'][j]}(x) =</span
        >
        <input
          class="{small} font-mono"
          aria-label="Fonction {j + 1}"
          value={f}
          oninput={(e) =>
            setBlock(
              k,
              (b) => ((b as LessonGraph).fonctions[j] = e.currentTarget.value),
            )}
        />
        <select
          class="{small} w-auto"
          aria-label="Trait de la courbe {j + 1}"
          value={g.styles?.[j]?.trait ?? 'plein'}
          onchange={(e) =>
            setStyle(k, j, 'trait', e.currentTarget.value as LineStyle)}
        >
          {#each LINE_STYLES as t (t)}<option value={t}>{LINE_LABELS[t]}</option
            >{/each}
        </select>
        <select
          class="{small} w-auto"
          aria-label="Couleur de la courbe {j + 1}"
          value={g.styles?.[j]?.couleur ?? (j % 2 ? 'orange' : 'bleu')}
          onchange={(e) =>
            setStyle(k, j, 'couleur', e.currentTarget.value as GraphColor)}
        >
          {#each GRAPH_COLORS as c (c)}<option value={c}
              >{COLOR_LABELS[c]}</option
            >{/each}
        </select>
        {#if g.fonctions.length > 1}
          <button
            type="button"
            class={iconButton}
            aria-label="Retirer la fonction {j + 1}"
            onclick={() =>
              setBlock(k, (b) => {
                const gg = b as LessonGraph
                gg.fonctions.splice(j, 1)
                gg.styles?.splice(j, 1)
                if (
                  gg.styles &&
                  !gg.styles.some((st) => st.trait || st.couleur)
                )
                  delete gg.styles
                // Points de cette courbe : posés à la même hauteur, ceux des suivantes suivent leur rang
                for (const pt of gg.points ?? []) {
                  if (pt.sur === undefined) continue
                  if (pt.sur === j) {
                    delete pt.sur
                    pt.y = 0
                  } else if (pt.sur > j) pt.sur--
                }
                if (gg.aire) {
                  if ((gg.aire.fonction ?? 0) >= gg.fonctions.length)
                    delete gg.aire.fonction
                  if ((gg.aire.entre ?? 0) >= gg.fonctions.length)
                    delete gg.aire.entre
                }
              })}><i class="bx bx-x text-xl" aria-hidden="true"></i></button
          >
        {/if}
      </div>
    {/each}
    {#if g.fonctions.length < 3}
      <button
        type="button"
        class="{link} self-start"
        onclick={() =>
          setBlock(k, (b) => (b as LessonGraph).fonctions.push(''))}
        ><i class="bx bx-plus text-lg" aria-hidden="true"></i> Ajouter une courbe</button
      >
    {/if}
    <span class={quiet}
      >sin, cos, tan, exp, ln, log, sqrt, abs ; pi et e ; 2x et 3(x+1) sont
      compris.</span
    >
  </div>

  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
    {#each [['x', 0, 'x min'], ['x', 1, 'x max'], ['y', 0, 'y min'], ['y', 1, 'y max']] as [axis, j, text] (text)}
      <label>
        <span class={label}>{text}</span>
        <input
          class={small}
          inputmode="decimal"
          value={show(g[axis as 'x' | 'y'][j as number])}
          onchange={(e) => {
            const v = readNumber(e.currentTarget.value)
            if (v !== undefined)
              setBlock(
                k,
                (b) => ((b as LessonGraph)[axis as 'x' | 'y'][j as number] = v),
              )
          }}
        />
      </label>
    {/each}
  </div>

  <div class="flex flex-col gap-2">
    <span class={label}>Curseurs (l’élève fait varier une lettre)</span>
    {#each names as n (n)}
      {@const c = g.curseurs![n]}
      <div class="flex flex-row flex-wrap items-end gap-2">
        <label class="w-14">
          <span class={quiet}>Lettre</span>
          <input
            class="{small} font-mono"
            maxlength="1"
            value={n}
            onchange={(e) => {
              const to = e.currentTarget.value.trim().toLowerCase()
              if (SLIDER_NAME.test(to) && !names.includes(to))
                renameSlider(k, n, to)
              else e.currentTarget.value = n
            }}
          />
        </label>
        {#each ['min', 'max', 'départ', 'pas'] as text, j (text)}
          <label class="w-20">
            <span class={quiet}>{text}</span>
            <input
              class={small}
              inputmode="decimal"
              value={show(c[j])}
              onchange={(e) => {
                const v = readNumber(e.currentTarget.value)
                setBlock(k, (b) => {
                  const s = [...(b as LessonGraph).curseurs![n]] as number[]
                  if (j === 3 && v === undefined) s.length = 3
                  else if (v !== undefined) s[j] = v
                  ;(b as LessonGraph).curseurs![n] = s as Slider
                })
              }}
            />
          </label>
        {/each}
        <button
          type="button"
          class={iconButton}
          aria-label="Retirer le curseur {n}"
          onclick={() =>
            setBlock(k, (b) => {
              const gg = b as LessonGraph
              delete gg.curseurs![n]
              if (!Object.keys(gg.curseurs!).length) delete gg.curseurs
              if (gg.aire?.de === n) gg.aire.de = c[2]
              if (gg.aire?.a === n) gg.aire.a = c[2]
            })}><i class="bx bx-x text-xl" aria-hidden="true"></i></button
        >
      </div>
    {/each}
    <button
      type="button"
      class="{link} self-start"
      onclick={() =>
        setBlock(k, (b) => {
          const gg = b as LessonGraph
          gg.curseurs = { ...gg.curseurs, [nextSliderName(gg)]: newSlider(gg) }
        })}
      ><i class="bx bx-slider-alt text-lg" aria-hidden="true"></i> Ajouter un curseur</button
    >
  </div>

  <div class="flex flex-col gap-2">
    <label class="inline-flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={!!g.aire}
        onchange={(e) =>
          setBlock(k, (b) => {
            const gg = b as LessonGraph
            if (e.currentTarget.checked)
              gg.aire = { de: names[0] ?? gg.x[0], a: names[1] ?? gg.x[1] }
            else {
              delete gg.aire
              delete gg.valeur
            }
          })}
      />
      Ombrer une aire
    </label>
    {#if g.aire}
      {@const aire = g.aire}
      <div class="flex flex-row flex-wrap items-end gap-2">
        {#each [['de', 'De'], ['a', 'À']] as [key, text] (key)}
          <label class="w-24">
            <span class={quiet}>{text}</span>
            <input
              class={small}
              list="curseurs-{k}"
              value={typeof aire[key as 'de' | 'a'] === 'number'
                ? show(aire[key as 'de' | 'a'] as number)
                : aire[key as 'de' | 'a']}
              onchange={(e) =>
                setBlock(
                  k,
                  (b) =>
                    ((b as LessonGraph).aire![key as 'de' | 'a'] = readBound(
                      e.currentTarget.value,
                    )),
                )}
            />
          </label>
        {/each}
        {#if g.fonctions.length > 1}
          <label>
            <span class={quiet}>Sous</span>
            <select
              class={small}
              value={String(aire.fonction ?? 0)}
              onchange={(e) =>
                setBlock(k, (b) => {
                  const v = Number(e.currentTarget.value)
                  if (v) (b as LessonGraph).aire!.fonction = v
                  else delete (b as LessonGraph).aire!.fonction
                })}
            >
              {#each g.fonctions as _, j (j)}<option value={String(j)}
                  >{['f', 'g', 'h'][j]}</option
                >{/each}
            </select>
          </label>
          <label>
            <span class={quiet}>Au-dessus de</span>
            <select
              class={small}
              value={aire.entre === undefined ? '' : String(aire.entre)}
              onchange={(e) =>
                setBlock(k, (b) => {
                  const v = e.currentTarget.value
                  if (v === '') delete (b as LessonGraph).aire!.entre
                  else (b as LessonGraph).aire!.entre = Number(v)
                })}
            >
              <option value="">l’axe des abscisses</option>
              {#each g.fonctions as _, j (j)}<option value={String(j)}
                  >{['f', 'g', 'h'][j]}</option
                >{/each}
            </select>
          </label>
        {/if}
      </div>
      <span class={quiet}
        >Une borne est un nombre ou la lettre d’un curseur : l’élève déplace
        alors la borne.</span
      >
      <label class="inline-flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={!!g.valeur}
          onchange={(e) =>
            setBlock(k, (b) => {
              if (e.currentTarget.checked) (b as LessonGraph).valeur = true
              else delete (b as LessonGraph).valeur
            })}
        />
        Afficher la valeur calculée de l’aire
      </label>
    {/if}
  </div>
  <div class="flex flex-col gap-2">
    <span class={label}>Points</span>
    {#each g.points ?? [] as pt, j (j)}
      <div class="flex flex-row flex-wrap items-end gap-2">
        <label class="w-16">
          <span class={quiet}>Nom</span>
          <input
            class={small}
            value={pt.nom ?? ''}
            oninput={(e) =>
              setPoint(k, j, (q) => {
                if (e.currentTarget.value) q.nom = e.currentTarget.value
                else delete q.nom
              })}
          />
        </label>
        <label class="w-20">
          <span class={quiet}>x</span>
          <input
            class={small}
            list="curseurs-{k}"
            value={showCoordinate(pt.x)}
            onchange={(e) =>
              setPoint(k, j, (q) => (q.x = readBound(e.currentTarget.value)))}
          />
        </label>
        <label>
          <span class={quiet}>Hauteur</span>
          <select
            class={small}
            value={pt.sur === undefined ? 'y' : String(pt.sur)}
            onchange={(e) =>
              setPoint(k, j, (q) => {
                const v = e.currentTarget.value
                if (v === 'y') {
                  delete q.sur
                  q.y = 0
                } else {
                  delete q.y
                  q.sur = Number(v)
                }
              })}
          >
            <option value="y">y donné</option>
            {#each g.fonctions as _, c (c)}<option value={String(c)}
                >sur {['f', 'g', 'h'][c]}</option
              >{/each}
          </select>
        </label>
        {#if pt.sur === undefined}
          <label class="w-20">
            <span class={quiet}>y</span>
            <input
              class={small}
              list="curseurs-{k}"
              value={showCoordinate(pt.y ?? 0)}
              onchange={(e) =>
                setPoint(k, j, (q) => (q.y = readBound(e.currentTarget.value)))}
            />
          </label>
        {/if}
        <label>
          <span class={quiet}>Forme</span>
          <select
            class={small}
            value={pt.forme ?? 'plein'}
            onchange={(e) =>
              setPoint(k, j, (q) => {
                const v = e.currentTarget.value as PointShape
                if (v === 'plein') delete q.forme
                else q.forme = v
              })}
          >
            {#each POINT_SHAPES as f (f)}<option value={f}
                >{SHAPE_LABELS[f]}</option
              >{/each}
          </select>
        </label>
        <label>
          <span class={quiet}>Couleur</span>
          <select
            class={small}
            value={pt.couleur ?? 'bleu'}
            onchange={(e) =>
              setPoint(k, j, (q) => {
                const v = e.currentTarget.value as GraphColor
                if (v === 'bleu') delete q.couleur
                else q.couleur = v
              })}
          >
            {#each GRAPH_COLORS as c (c)}<option value={c}
                >{COLOR_LABELS[c]}</option
              >{/each}
          </select>
        </label>
        <label class="inline-flex items-center gap-1 text-sm pb-1.5">
          <input
            type="checkbox"
            checked={!!pt.coordonnees}
            onchange={(e) =>
              setPoint(k, j, (q) => {
                if (e.currentTarget.checked) q.coordonnees = true
                else delete q.coordonnees
              })}
          />
          Coordonnées
        </label>
        <button
          type="button"
          class={iconButton}
          aria-label="Retirer le point {j + 1}"
          onclick={() =>
            setBlock(k, (b) => {
              const gg = b as LessonGraph
              gg.points!.splice(j, 1)
              if (!gg.points!.length) delete gg.points
            })}><i class="bx bx-x text-xl" aria-hidden="true"></i></button
        >
      </div>
    {/each}
    <button
      type="button"
      class="{link} self-start"
      onclick={() =>
        setBlock(k, (b) => {
          const gg = b as LessonGraph
          const x = (gg.x[0] + gg.x[1]) / 2
          gg.points = [...(gg.points ?? []), { x, sur: 0 }]
        })}
      ><i class="bx bx-radio-circle-marked text-lg" aria-hidden="true"></i> Ajouter
      un point</button
    >
    <span class={quiet}
      >x ou y peut être la lettre d’un curseur : le point le suit. « Sur f »
      pose le point sur la courbe.</span
    >
  </div>

  <div class="flex flex-col gap-2">
    <span class={label}>Textes dans le repère</span>
    {#each g.textes ?? [] as t, j (j)}
      <div class="flex flex-row flex-wrap items-end gap-2">
        <label class="flex-1 min-w-40">
          <span class={quiet}>Texte (formule entre $)</span>
          <input
            class={small}
            value={t.texte}
            oninput={(e) =>
              setText(k, j, (q) => (q.texte = e.currentTarget.value))}
          />
        </label>
        {#each ['x', 'y'] as const as axis (axis)}
          <label class="w-20">
            <span class={quiet}>{axis}</span>
            <input
              class={small}
              list="curseurs-{k}"
              value={showCoordinate(t[axis])}
              onchange={(e) =>
                setText(
                  k,
                  j,
                  (q) => (q[axis] = readBound(e.currentTarget.value)),
                )}
            />
          </label>
        {/each}
        <label>
          <span class={quiet}>Couleur</span>
          <select
            class={small}
            value={t.couleur ?? ''}
            onchange={(e) =>
              setText(k, j, (q) => {
                const v = e.currentTarget.value as GraphColor | ''
                if (v) q.couleur = v
                else delete q.couleur
              })}
          >
            <option value="">Texte</option>
            {#each GRAPH_COLORS as c (c)}<option value={c}
                >{COLOR_LABELS[c]}</option
              >{/each}
          </select>
        </label>
        <button
          type="button"
          class={iconButton}
          aria-label="Retirer le texte {j + 1}"
          onclick={() =>
            setBlock(k, (b) => {
              const gg = b as LessonGraph
              gg.textes!.splice(j, 1)
              if (!gg.textes!.length) delete gg.textes
            })}><i class="bx bx-x text-xl" aria-hidden="true"></i></button
        >
      </div>
    {/each}
    <button
      type="button"
      class="{link} self-start"
      onclick={() =>
        setBlock(k, (b) => {
          const gg = b as LessonGraph
          gg.textes = [
            ...(gg.textes ?? []),
            {
              x: (gg.x[0] + gg.x[1]) / 2,
              y: (gg.y[0] + 3 * gg.y[1]) / 4,
              texte: '$\\mathcal{C}_f$',
            },
          ]
        })}
      ><i class="bx bx-text text-lg" aria-hidden="true"></i> Ajouter un texte</button
    >
  </div>
  <datalist id="curseurs-{k}">
    {#each names as n (n)}<option value={n}></option>{/each}
  </datalist>

  <label>
    <span class={label}>Légende (facultative)</span>
    <input
      class={field}
      value={g.legende ?? ''}
      oninput={(e) =>
        setBlock(k, (b) => {
          const v = e.currentTarget.value
          if (v) (b as LessonGraph).legende = v
          else delete (b as LessonGraph).legende
        })}
    />
  </label>
{/snippet}

{#snippet blockForm(k: number, b: LessonBlock)}
  {#if b.type === 'texte'}
    <LessonTextField
      label="Texte"
      rows={5}
      hint
      value={b.texte}
      onchange={(v) => setBlock(k, (x) => x.type === 'texte' && (x.texte = v))}
    />
  {:else if b.type === 'retenir'}
    <label>
      <span class={label}>Titre de l’encadré (« À retenir » si vide)</span>
      <input
        class={field}
        value={b.titre ?? ''}
        oninput={(e) =>
          setBlock(k, (x) => {
            if (x.type !== 'retenir') return
            if (e.currentTarget.value) x.titre = e.currentTarget.value
            else delete x.titre
          })}
      />
    </label>
    <LessonTextField
      label="Contenu"
      rows={4}
      hint
      value={b.texte}
      onchange={(v) =>
        setBlock(k, (x) => x.type === 'retenir' && (x.texte = v))}
    />
  {:else if b.type === 'exemple'}
    <label>
      <span class={label}>Titre (« Exemple » si vide)</span>
      <input
        class={field}
        value={b.titre ?? ''}
        oninput={(e) =>
          setBlock(k, (x) => {
            if (x.type !== 'exemple') return
            if (e.currentTarget.value) x.titre = e.currentTarget.value
            else delete x.titre
          })}
      />
    </label>
    <LessonTextField
      label="Énoncé"
      value={b.enonce}
      onchange={(v) =>
        setBlock(k, (x) => x.type === 'exemple' && (x.enonce = v))}
    />
    {#each b.etapes as e, j (j)}
      <div class="flex flex-row items-start gap-2">
        <div class="flex-1">
          <LessonTextField
            label="Étape {j + 1} (dévoilée au toucher)"
            rows={2}
            value={e}
            onchange={(v) =>
              setBlock(k, (x) => x.type === 'exemple' && (x.etapes[j] = v))}
          />
        </div>
        <button
          type="button"
          class="{iconButton} mt-8"
          aria-label="Retirer l’étape {j + 1}"
          disabled={b.etapes.length === 1}
          onclick={() =>
            setBlock(k, (x) => x.type === 'exemple' && x.etapes.splice(j, 1))}
          ><i class="bx bx-x text-xl" aria-hidden="true"></i></button
        >
      </div>
    {/each}
    <button
      type="button"
      class="{link} self-start"
      onclick={() =>
        setBlock(k, (x) => x.type === 'exemple' && x.etapes.push(''))}
      ><i class="bx bx-plus text-lg" aria-hidden="true"></i> Ajouter une étape</button
    >
  {:else if b.type === 'question'}
    <LessonTextField
      label="Question (non notée)"
      value={b.enonce}
      onchange={(v) =>
        setBlock(k, (x) => x.type === 'question' && (x.enonce = v))}
    />
    <div class="flex flex-row items-center gap-3">
      <span class={quiet}>Réponse</span>
      <div
        class="flex flex-row rounded-lg overflow-hidden border border-coopmaths-action dark:border-coopmathsdark-action"
        role="radiogroup"
        aria-label="Type de réponse"
      >
        <button
          type="button"
          role="radio"
          aria-checked={!!b.choix}
          class={segment(!!b.choix)}
          onclick={() =>
            setBlock(k, (x) => {
              if (x.type !== 'question' || x.choix) return
              x.choix = ['', '']
              x.bonne = 0
              delete x.reponse
            })}>À choisir</button
        >
        <button
          type="button"
          role="radio"
          aria-checked={!b.choix}
          class={segment(!b.choix)}
          onclick={() =>
            setBlock(k, (x) => {
              if (x.type !== 'question' || !x.choix) return
              delete x.choix
              delete x.bonne
              x.reponse = 0
            })}>Un nombre</button
        >
      </div>
    </div>
    {#if b.choix}
      {#each b.choix as c, j (j)}
        <div class="flex flex-row items-center gap-2">
          <input
            type="radio"
            name="bonne-{k}"
            checked={b.bonne === j}
            aria-label="Bonne réponse : proposition {j + 1}"
            title="Bonne réponse"
            onchange={() =>
              setBlock(k, (x) => x.type === 'question' && (x.bonne = j))}
          />
          <input
            class={small}
            aria-label="Proposition {j + 1}"
            value={c}
            oninput={(e) =>
              setBlock(
                k,
                (x) =>
                  x.type === 'question' &&
                  (x.choix![j] = e.currentTarget.value),
              )}
          />
          <button
            type="button"
            class={iconButton}
            aria-label="Retirer la proposition {j + 1}"
            disabled={b.choix.length <= 2}
            onclick={() =>
              setBlock(k, (x) => {
                if (x.type !== 'question') return
                x.choix!.splice(j, 1)
                if (x.bonne! >= j && x.bonne! > 0) x.bonne!--
              })}><i class="bx bx-x text-xl" aria-hidden="true"></i></button
          >
        </div>
      {/each}
      <span class={quiet}>Cochez la bonne réponse.</span>
      <button
        type="button"
        class="{link} self-start"
        onclick={() =>
          setBlock(k, (x) => x.type === 'question' && x.choix!.push(''))}
        ><i class="bx bx-plus text-lg" aria-hidden="true"></i> Ajouter une proposition</button
      >
    {:else}
      <label class="w-40">
        <span class={label}>Réponse attendue</span>
        <input
          class={field}
          inputmode="decimal"
          value={show(b.reponse)}
          onchange={(e) => {
            const v = readNumber(e.currentTarget.value)
            if (v !== undefined)
              setBlock(k, (x) => x.type === 'question' && (x.reponse = v))
          }}
        />
      </label>
    {/if}
    <LessonTextField
      label="Explication (montrée après la réponse)"
      value={b.explication}
      onchange={(v) =>
        setBlock(k, (x) => x.type === 'question' && (x.explication = v))}
    />
  {:else if b.type === 'graphique'}
    {@render graphForm(k, b)}
  {:else if b.type === 'image'}
    <div class="flex flex-row flex-wrap items-center gap-3">
      <label
        class="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold border border-coopmaths-action dark:border-coopmathsdark-action text-coopmaths-action dark:text-coopmathsdark-action cursor-pointer"
      >
        <i class="bx bx-image-add" aria-hidden="true"></i>
        {b.src ? 'Remplacer l’image' : 'Choisir une image'}
        <input
          type="file"
          accept="image/svg+xml,image/png,image/jpeg,image/webp"
          class="hidden"
          onchange={(e) => {
            chooseImage(k, e.currentTarget.files?.[0])
            e.currentTarget.value = ''
          }}
        />
      </label>
      {#if b.src}
        <span class={quiet}>{size(b.src)} Ko, enregistrée dans le fichier</span>
      {/if}
    </div>
    {#if b.src && size(b.src) > 500}
      <span
        class="text-sm text-coopmaths-warn-dark dark:text-coopmathsdark-warn-dark"
        >Image lourde : préférez un SVG ou une image plus petite, le fichier
        part chez chaque élève.</span
      >
    {/if}
    <label>
      <span class={label}>Description (lue aux élèves malvoyants)</span>
      <input
        class={field}
        value={b.alt}
        oninput={(e) =>
          setBlock(
            k,
            (x) => x.type === 'image' && (x.alt = e.currentTarget.value),
          )}
      />
    </label>
    <label>
      <span class={label}>Légende (facultative)</span>
      <input
        class={field}
        value={b.legende ?? ''}
        oninput={(e) =>
          setBlock(k, (x) => {
            if (x.type !== 'image') return
            if (e.currentTarget.value) x.legende = e.currentTarget.value
            else delete x.legende
          })}
      />
    </label>
  {:else if b.type === 'lien'}
    <label>
      <span class={label}>Titre du bouton</span>
      <input
        class={field}
        value={b.titre}
        oninput={(e) =>
          setBlock(
            k,
            (x) => x.type === 'lien' && (x.titre = e.currentTarget.value),
          )}
      />
    </label>
    <label>
      <span class={label}>Lien (PDF, vidéo…)</span>
      <input
        class={field}
        type="url"
        value={b.lien}
        oninput={(e) =>
          setBlock(
            k,
            (x) => x.type === 'lien' && (x.lien = e.currentTarget.value),
          )}
      />
    </label>
  {/if}
{/snippet}

<div class="@container">
  <div
    class="grid grid-cols-1 @4xl:grid-cols-[minmax(0,1fr)_400px] gap-6 items-start"
  >
    <div class="flex flex-col gap-4 min-w-0">
      <div
        class="relative grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-3 items-end"
        data-element={mark('fiche')}
      >
        {#if collab}<SalonMark {collab} element="fiche" />{/if}
        <label>
          <span class={label}>Titre de la fiche</span>
          <input
            class={field}
            value={lesson.titre}
            oninput={(e) => update((l) => (l.titre = e.currentTarget.value))}
          />
        </label>
        <label class="inline-flex items-center gap-2 text-sm pb-2">
          <input
            type="checkbox"
            checked={!!lesson.avant}
            onchange={(e) =>
              update((l) => {
                if (e.currentTarget.checked) l.avant = true
                else delete l.avant
              })}
          />
          Montrer avant le premier entraînement
        </label>
      </div>

      <ol class="flex flex-col gap-2" aria-label="Blocs de la fiche">
        {#each lesson.blocs as b, k (collab ? (b.cle ?? k) : k)}
          {@const problem = blockProblem(b)}
          <li
            data-element={mark(`bloc:${b.cle}`)}
            class="relative rounded-xl border {opened === k
              ? 'border-coopmaths-action dark:border-coopmathsdark-action'
              : 'border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest'} bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
          >
            {#if collab}<SalonMark {collab} element={`bloc:${b.cle}`} />{/if}
            <div class="flex flex-row items-center gap-2 px-3 py-2">
              <button
                type="button"
                class="flex-1 min-w-0 flex flex-row items-center gap-2 text-left"
                aria-expanded={opened === k}
                onclick={() => setOpened(opened === k ? null : k)}
              >
                <i
                  class="bx {BLOCK_ICONS[
                    b.type
                  ]} text-xl text-coopmaths-struct dark:text-coopmathsdark-struct"
                  aria-hidden="true"
                ></i>
                <span
                  class="shrink-0 whitespace-nowrap font-semibold text-coopmaths-struct dark:text-coopmathsdark-struct"
                  >{BLOCK_LABELS[b.type]}</span
                >
                <span class="truncate {quiet}">{summary(b)}</span>
                {#if problem}
                  <i
                    class="bx bx-error-circle text-coopmaths-warn-dark dark:text-coopmathsdark-warn-dark"
                    title={problem}
                    aria-label="À compléter"
                  ></i>
                {/if}
              </button>
              <button
                type="button"
                class={iconButton}
                aria-label="Monter le bloc {k + 1}"
                disabled={k === 0}
                onclick={() => move(k, -1)}
                ><i class="bx bx-chevron-up text-xl" aria-hidden="true"
                ></i></button
              >
              <button
                type="button"
                class={iconButton}
                aria-label="Descendre le bloc {k + 1}"
                disabled={k === lesson.blocs.length - 1}
                onclick={() => move(k, 1)}
                ><i class="bx bx-chevron-down text-xl" aria-hidden="true"
                ></i></button
              >
              <button
                type="button"
                class={iconButton}
                aria-label="Dupliquer le bloc {k + 1}"
                title="Dupliquer"
                onclick={() => duplicate(k)}
                ><i class="bx bx-duplicate text-lg" aria-hidden="true"
                ></i></button
              >
              <button
                type="button"
                class={iconButton}
                aria-label="Supprimer le bloc {k + 1}"
                title="Supprimer"
                onclick={() => remove(k)}
                ><i class="bx bx-trash text-lg" aria-hidden="true"></i></button
              >
            </div>
            {#if opened === k}
              <div class="flex flex-col gap-3 px-3 pb-3">
                {@render blockForm(k, b)}
                {#if problem}
                  <p
                    class="text-sm text-coopmaths-warn-dark dark:text-coopmathsdark-warn-dark"
                  >
                    {problem}
                  </p>
                {/if}
              </div>
            {/if}
          </li>
        {/each}
      </ol>

      <div class="flex flex-col gap-2">
        <span class={quiet}
          >{opened === null
            ? 'Ajouter un bloc à la fin'
            : `Ajouter un bloc après le bloc ${opened + 1}`}</span
        >
        <div class="flex flex-row flex-wrap gap-2">
          {#each Object.keys(BLOCK_LABELS) as LessonBlockType[] as type (type)}
            <button type="button" class={chip} onclick={() => add(type)}>
              <i class="bx {BLOCK_ICONS[type]}" aria-hidden="true"></i>
              {BLOCK_LABELS[type]}
            </button>
          {/each}
        </div>
      </div>

      {#if problems.length}
        <div
          class="flex flex-col gap-1 text-sm text-coopmaths-warn-dark dark:text-coopmathsdark-warn-dark"
          role="status"
        >
          <span class="font-semibold">À compléter</span>
          {#each problems as p (p)}<span>{p}</span>{/each}
        </div>
      {/if}

      <details ontoggle={(e) => openJson(e.currentTarget.open)}>
        <summary class="{link} cursor-pointer list-none"
          ><i class="bx bx-code-curly text-lg" aria-hidden="true"></i> JSON de la
          fiche</summary
        >
        <textarea
          class="{field} mt-2 font-mono text-xs"
          rows="14"
          aria-label="JSON de la fiche"
          value={jsonText}
          oninput={(e) => applyJson(e.currentTarget.value)}
        ></textarea>
        {#if jsonError}
          <p
            class="text-sm text-coopmaths-warn-dark dark:text-coopmathsdark-warn-dark"
          >
            {jsonError}
          </p>
        {:else}
          <p class={quiet}>
            Modifiable : chaque changement valide s’applique aussitôt. Format
            décrit dans la documentation des parcours de l’application.
          </p>
        {/if}
      </details>
    </div>

    <aside class="@4xl:sticky @4xl:top-24 min-w-0">
      <span class="{quiet} block mb-2">Aperçu dans l’application</span>
      <div
        class="max-w-[400px] max-h-[calc(100vh-9rem)] overflow-y-auto rounded-3xl p-4 border-4 border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
      >
        {#if lesson.blocs.length}
          <LessonPreview
            {lesson}
            active={opened}
            onselect={(k) => setOpened(k)}
          />
        {:else}
          <p class={quiet}>Ajoutez un premier bloc : il s’affiche ici.</p>
        {/if}
      </div>
    </aside>
  </div>
</div>
