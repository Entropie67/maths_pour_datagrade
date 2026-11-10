<script lang="ts" module>
  let count = 0
</script>

<script lang="ts">
  // Graphique d'une fiche, tracé comme dans l'application : courbes, aire
  // ombrée entre deux bornes, curseurs et valeur de l'intégrale.
  import { compile, integral } from '../../../lib/parcours/lessonExpression'
  import {
    formula,
    richText,
    richTitle,
  } from '../../../lib/parcours/lessonText'
  import type {
    Coordinate,
    GraphColor,
    LessonGraph,
  } from '../../../lib/parcours/parcoursTypes'

  let { graph }: { graph: LessonGraph } = $props()

  const clip = `fiche-graphique-${++count}`
  const start = () =>
    Object.fromEntries(
      Object.entries(graph.curseurs ?? {}).map(([n, c]) => [n, c[2]]),
    )
  let values: Record<string, number> = $state({})
  // Les curseurs reviennent à leur valeur de départ quand on les modifie
  $effect(() => {
    values = start()
  })
  const names = $derived(Object.keys(graph.curseurs ?? {}))
  const curves = $derived(
    graph.fonctions.map((f) => compile(f, ['x', ...names])),
  )
  const f = (k: number) => (x: number) => curves[k]?.({ ...values, x }) ?? NaN

  const W = 320
  const H = 220
  const margin = { l: 26, r: 8, t: 8, b: 20 }
  const x0 = $derived(graph.x[0])
  const x1 = $derived(graph.x[1])
  const y0 = $derived(graph.y[0])
  const y1 = $derived(graph.y[1])
  const ok = $derived(x0 < x1 && y0 < y1)
  const X = (x: number) =>
    margin.l + ((x - x0) / (x1 - x0)) * (W - margin.l - margin.r)
  const Y = (y: number) =>
    H - margin.b - ((y - y0) / (y1 - y0)) * (H - margin.b - margin.t)

  /** Graduations : au plus 10 par axe, pas de 1, 2, 5, 10… */
  function ticks(a: number, b: number) {
    const raw = (b - a) / 10
    const p = Math.pow(10, Math.floor(Math.log10(raw)))
    const step = [1, 2, 5, 10].map((m) => m * p).find((m) => m >= raw)!
    const list: number[] = []
    for (let v = Math.ceil(a / step) * step; v <= b + 1e-9; v += step)
      list.push(Math.round(v / step) * step)
    return list
  }

  /** Tracé d'une courbe, coupé là où elle n'est pas définie */
  function path(g: (x: number) => number) {
    let d = ''
    let inside = false
    const n = 300
    for (let k = 0; k <= n; k++) {
      const x = x0 + ((x1 - x0) * k) / n
      const y = g(x)
      if (!Number.isFinite(y) || Math.abs(y) > 1e6) {
        inside = false
        continue
      }
      d += `${inside ? 'L' : 'M'}${X(x).toFixed(1)},${Y(Math.max(y0 - (y1 - y0), Math.min(y1 + (y1 - y0), y))).toFixed(1)} `
      inside = true
    }
    return d
  }

  const bound = (b: number | string) =>
    typeof b === 'number' ? b : (values[b] ?? 0)
  const area = $derived.by(() => {
    if (!graph.aire) return null
    const top = f(graph.aire.fonction ?? 0)
    const between = graph.aire.entre !== undefined
    const bottom = between ? f(graph.aire.entre!) : () => 0
    const a = bound(graph.aire.de)
    const b = bound(graph.aire.a)
    const [lo, hi] = a <= b ? [a, b] : [b, a]
    let d = ''
    if (hi > lo) {
      const n = 200
      const pts = Array.from(
        { length: n + 1 },
        (_, k) => lo + ((hi - lo) * k) / n,
      )
      d =
        `M${X(lo)},${Y(bottom(lo))} ` +
        pts.map((x) => `L${X(x).toFixed(1)},${Y(top(x)).toFixed(1)}`).join(' ')
      d +=
        ' ' +
        pts
          .reverse()
          .map((x) => `L${X(x).toFixed(1)},${Y(bottom(x)).toFixed(1)}`)
          .join(' ') +
        ' Z'
    }
    return {
      a,
      b,
      d,
      between,
      value: between
        ? integral((x) => Math.abs(top(x) - bottom(x)), lo, hi)
        : integral(top, a, b),
    }
  })

  const number = (v: number) => {
    const r = Math.round(v * 100) / 100
    return (Object.is(r, -0) ? 0 : r).toString().replace('.', '{,}')
  }
  const result = $derived(
    area && graph.valeur
      ? area.between
        ? formula(`\\mathcal{A}\\approx ${number(area.value)}`)
        : formula(
            `\\int_{${number(area.a)}}^{${number(area.b)}} f(x)\\,\\mathrm{d}x\\approx ${number(area.value)}`,
          )
      : '',
  )
  // Couleurs de MathALÉA : trait, remplissage, texte
  const COLORS: Record<GraphColor, [string, string, string]> = {
    bleu: [
      'stroke-coopmaths-struct dark:stroke-coopmathsdark-struct',
      'fill-coopmaths-struct dark:fill-coopmathsdark-struct',
      'text-coopmaths-struct dark:text-coopmathsdark-struct',
    ],
    orange: [
      'stroke-coopmaths-action dark:stroke-coopmathsdark-action',
      'fill-coopmaths-action dark:fill-coopmathsdark-action',
      'text-coopmaths-action dark:text-coopmathsdark-action',
    ],
    vert: [
      'stroke-coopmaths-warn',
      'fill-coopmaths-warn',
      'text-coopmaths-warn',
    ],
    gris: [
      'stroke-coopmaths-corpus-light dark:stroke-coopmathsdark-corpus-light',
      'fill-coopmaths-corpus-light dark:fill-coopmathsdark-corpus-light',
      'text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light',
    ],
  }
  const DASHES = { plein: undefined, tirets: '7 5', pointilles: '1.5 4' }
  const curveColor = (k: number) =>
    COLORS[graph.styles?.[k]?.couleur ?? (k % 2 ? 'orange' : 'bleu')]
  const strokes = [COLORS.bleu[0], COLORS.orange[0]]
  const fills = [COLORS.bleu[1], COLORS.orange[1]]

  // Points et textes : coordonnées fixes ou suivant un curseur
  const coord = (c: Coordinate) =>
    typeof c === 'number' ? c : (values[c] ?? 0)
  const inside = (x: number, y: number) =>
    Number.isFinite(y) && x >= x0 && x <= x1 && y >= y0 && y <= y1
  const points = $derived(
    (graph.points ?? []).map((p) => {
      const x = coord(p.x)
      const y = p.y !== undefined ? coord(p.y) : f(p.sur ?? 0)(x)
      return {
        ...p,
        x,
        y,
        color: COLORS[p.couleur ?? 'bleu'],
        visible: inside(x, y),
      }
    }),
  )
  const texts = $derived(
    (graph.textes ?? []).map((t) => ({
      ...t,
      x: coord(t.x),
      y: coord(t.y),
      color: t.couleur ? COLORS[t.couleur][2] : '',
    })),
  )
  /** Nom et coordonnées d'un point : « A(1,5 ; 2) » */
  const pointLabel = (p: {
    nom?: string
    coordonnees?: boolean
    x: number
    y: number
  }) =>
    (p.nom ? richTitle(p.nom) : '') +
    (p.coordonnees
      ? formula(`\\left(${number(p.x)}\\,;\\,${number(p.y)}\\right)`)
      : '')
  // Position en pourcentage du cadre, pour les étiquettes posées sur le dessin
  const left = (x: number) => `${(X(x) / W) * 100}%`
  const top = (y: number) => `${(Y(y) / H) * 100}%`
  const labelClass =
    'absolute text-[0.8rem] leading-tight whitespace-nowrap pointer-events-none'
  const curveNames = ['f', 'g', 'h']
  const label =
    'fill-coopmaths-corpus-light dark:fill-coopmathsdark-corpus-light'
</script>

<figure class="flex flex-col gap-2 m-0">
  {#if ok}
    <div class="relative">
      <svg
        viewBox="0 0 {W} {H}"
        class="w-full h-auto"
        role="img"
        aria-label={graph.legende ?? 'Graphique'}
      >
        <defs>
          <clipPath id={clip}>
            <rect
              x={margin.l}
              y={margin.t}
              width={W - margin.l - margin.r}
              height={H - margin.t - margin.b}
            ></rect>
          </clipPath>
        </defs>
        {#each ticks(y0, y1) as v (v)}
          <line
            x1={X(x0)}
            x2={X(x1)}
            y1={Y(v)}
            y2={Y(v)}
            class="stroke-coopmaths-canvas-darkest dark:stroke-coopmathsdark-canvas-darkest"
            stroke-width="1"
          ></line>
          <text
            x={margin.l - 4}
            y={Y(v) + 4}
            text-anchor="end"
            font-size="10"
            class={label}>{String(v).replace('.', ',')}</text
          >
        {/each}
        {#each ticks(x0, x1) as v (v)}
          <line
            x1={X(v)}
            x2={X(v)}
            y1={Y(y0)}
            y2={Y(y1)}
            class="stroke-coopmaths-canvas-darkest dark:stroke-coopmathsdark-canvas-darkest"
            stroke-width="1"
          ></line>
          <text
            x={X(v)}
            y={H - 6}
            text-anchor="middle"
            font-size="10"
            class={label}>{String(v).replace('.', ',')}</text
          >
        {/each}
        <g clip-path="url(#{clip})">
          {#if area?.d}
            <path d={area.d} class={fills[1]} fill-opacity="0.22" stroke="none"
            ></path>
          {/if}
          {#if y0 <= 0 && y1 >= 0}
            <line
              x1={X(x0)}
              x2={X(x1)}
              y1={Y(0)}
              y2={Y(0)}
              class="stroke-coopmaths-corpus-light dark:stroke-coopmathsdark-corpus-light"
              stroke-width="1.3"
            ></line>
          {/if}
          {#if x0 <= 0 && x1 >= 0}
            <line
              x1={X(0)}
              x2={X(0)}
              y1={Y(y0)}
              y2={Y(y1)}
              class="stroke-coopmaths-corpus-light dark:stroke-coopmathsdark-corpus-light"
              stroke-width="1.3"
            ></line>
          {/if}
          {#each graph.fonctions as _, k (k)}
            <path
              d={path(f(k))}
              fill="none"
              class={curveColor(k)[0]}
              stroke-width="2.2"
              stroke-dasharray={DASHES[graph.styles?.[k]?.trait ?? 'plein']}
              stroke-linecap="round"
            ></path>
          {/each}
          {#if area && graph.aire}
            {#each [[graph.aire.de, area.a], [graph.aire.a, area.b]] as [b, v], k (k)}
              {#if typeof b === 'string'}
                <line
                  x1={X(+v)}
                  x2={X(+v)}
                  y1={Y(0)}
                  y2={Y(f(graph.aire.fonction ?? 0)(+v))}
                  class={strokes[1]}
                  stroke-width="1.5"
                  stroke-dasharray="3 3"
                ></line>
              {/if}
            {/each}
          {/if}
        </g>
        {#if graph.fonctions.length > 1}
          {#each graph.fonctions as _, k (k)}
            <text
              x={W - margin.r - 4}
              y={margin.t + 14 + 14 * k}
              text-anchor="end"
              font-size="12"
              font-style="italic"
              class={curveColor(k)[1]}>{curveNames[k] ?? ''}</text
            >
          {/each}
        {/if}
        {#each points as p, k (k)}
          {#if p.visible}
            {#if p.forme === 'croix'}
              <path
                d="M{X(p.x) - 4},{Y(p.y) - 4} L{X(p.x) + 4},{Y(p.y) + 4} M{X(
                  p.x,
                ) - 4},{Y(p.y) + 4} L{X(p.x) + 4},{Y(p.y) - 4}"
                class={p.color[0]}
                stroke-width="2"
                stroke-linecap="round"
              ></path>
            {:else}
              <circle
                cx={X(p.x)}
                cy={Y(p.y)}
                r="3.6"
                class="{p.color[0]} {p.forme === 'vide'
                  ? 'fill-coopmaths-canvas dark:fill-coopmathsdark-canvas'
                  : p.color[1]}"
                stroke-width="1.8"
              ></circle>
            {/if}
          {/if}
        {/each}
      </svg>
      {#each points as p, k (k)}
        {#if p.visible && (p.nom || p.coordonnees)}
          <span
            class="{labelClass} {p.color[2]}"
            style="left: {left(p.x)}; top: {top(p.y)}; translate: 5px -110%"
            >{@html pointLabel(p)}</span
          >
        {/if}
      {/each}
      {#each texts as t, k (k)}
        {#if inside(t.x, t.y)}
          <span
            class="{labelClass} {t.color}"
            style="left: {left(t.x)}; top: {top(t.y)}; translate: -50% -50%"
            >{@html richTitle(t.texte)}</span
          >
        {/if}
      {/each}
    </div>
  {/if}
  {#each names as n (n)}
    {@const c = graph.curseurs![n]}
    <label class="flex flex-row items-center gap-3 text-sm">
      <span class="w-6 shrink-0">{@html formula(n)}</span>
      <input
        type="range"
        min={c[0]}
        max={c[1]}
        step={c[3] ?? (c[1] - c[0]) / 20}
        bind:value={values[n]}
        class="flex-1 accent-coopmaths-action dark:accent-coopmathsdark-action"
        aria-label="Valeur de {n}"
      />
      <output class="w-12 text-right tabular-nums"
        >{String(Math.round((values[n] ?? 0) * 100) / 100).replace(
          '.',
          ',',
        )}</output
      >
    </label>
  {/each}
  {#if result}
    <p class="text-center" aria-live="polite">{@html result}</p>
  {/if}
  {#if graph.legende}
    <figcaption
      class="text-sm font-light text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light"
    >
      {@html richText(graph.legende)}
    </figcaption>
  {/if}
</figure>
