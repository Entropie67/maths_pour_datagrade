import { colorToLatexOrHTML } from '../../../lib/2d/colorToLatexOrHtml'
import { courbe } from '../../../lib/2d/Courbe'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { polygone } from '../../../lib/2d/polygones'
import { repere } from '../../../lib/2d/reperes'
import { latex2d } from '../../../lib/2d/textes'
import {
    lireFormulaireComplexe,
    serialiseFormulaireComplexe,
    valeursParDefaut,
    type FormulaireComplexe,
} from '../../../lib/formulaireComplexe'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import { Polynome } from '../../../lib/mathFonctions/Polynome'
import { choice } from '../../../lib/outils/arrayOutils'
import { ecritureAlgebrique, rienSi1 } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import { mathalea2d } from '../../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = 'Calculer un volume de révolution'
export const dateDePublication = '08/10/2026'
export const dateDeModifImportante = '03/11/2026'
export const uuid = 'bae8f'
export const interactifReady = true
export const refs = { 'fr-fr': [], 'fr-ch': ['4mInt-9'] }

const formulaire: FormulaireComplexe = {
  champs: [
    {
      type: 'listePonderee',
      nom: 'regions',
      label: 'Région à faire tourner autour de l’axe Ox',
      items: [
        { nom: 'disques', label: 'Une fonction f et l’axe Ox' },
        { nom: 'couronnes', label: 'Deux fonctions f et g' },
      ],
    },
    {
      type: 'listePonderee',
      nom: 'familles',
      label: 'Familles de fonctions',
      items: [
        { nom: 'droite', label: 'Droite (ou droite et parabole)' },
        { nom: 'parabole', label: 'Parabole (ou deux paraboles)' },
        { nom: 'racine', label: 'Racine carrée (ou racine et droite)' },
        {
          nom: 'exponentielle',
          label: 'Exponentielle (ou exponentielle et racine)',
        },
      ],
    },
  ],
}

type Draw = {
  a: number
  b: number
  fTex: string
  gTex?: string
  f: (x: number) => number
  g: (x: number) => number
  boundsExplanation: string
  radiusExplanation: string
} & (
  | { integrand: Polynome; exponentielle?: undefined }
  | {
      integrand?: undefined
      exponentielle: {
        aTex: string
        bTex: string
        integrandTex: string
        primitiveTex: string
        result: string
        evaluation: string
      }
    }
)

const fraction = (n: number, d = 1) => new FractionEtendue(n, d).simplifie()

const factor = (root: number) =>
  root === 0 ? 'x' : `\\left(x${ecritureAlgebrique(-root)}\\right)`

/** Bornes logarithmiques exactes, réservées à la nouvelle famille. */
const borneLog = (q: number, k: number) =>
  q === 1 ? '0' : k === 1 ? `\\ln(${q})` : `\\dfrac{\\ln(${q})}{${k}}`

/** Disques exponentiels ou couronnes entre u et √u, avec u=e^(kx)-q. */
function drawExponential(washers: boolean): Draw {
  const s = randint(1, 3)
  const k = randint(1, 3)
  const q = washers ? randint(1, 3) : randint(2, 4)
  const E = '\\mathrm{e}'
  const ek = `${E}^{${k === 1 ? 'x' : `${k}x`}}`
  const e2k = `${E}^{${2 * k}x}`
  const a = washers ? Math.log(q) / k : 0
  const b = Math.log(washers ? q + 1 : q) / k
  const aTex = washers ? borneLog(q, k) : '0'
  const bTex = borneLog(washers ? q + 1 : q, k)
  if (!washers) {
    const coef = fraction(s * s, 2 * k)
    const volume = fraction(s * s * (q * q - 1), 2 * k)
    return {
      a,
      b,
      fTex: `${rienSi1(s)}${ek}`,
      f: (x) => s * Math.exp(k * x),
      g: () => 0,
      boundsExplanation: `Les bornes sont données : $a=${aTex}$ et $b=${bTex}$.`,
      radiusExplanation: '',
      exponentielle: {
        aTex,
        bTex,
        integrandTex: `${rienSi1(s * s)}${e2k}`,
        primitiveTex: `${rienSi1(coef)}${e2k}`,
        result: `${rienSi1(volume)}\\pi`,
        evaluation: `${E}^{${k === 1 ? 'a' : `${k}a`}}=1\\quad\\text{et}\\quad ${E}^{${k === 1 ? 'b' : `${k}b`}}=${q}`,
      },
    }
  }
  const u = `${ek}-${q}`
  const f = (x: number) => s * (Math.exp(k * x) - q)
  const g = (x: number) => s * Math.sqrt(Math.max(0, Math.exp(k * x) - q))
  const coef2 = fraction(s * s, 2 * k)
  const coef1 = fraction(s * s * (2 * q + 1), k)
  const constant = s * s * q * (q + 1)
  const rationnel = fraction(s * s * (2 * q + 1), 2 * k)
  const coefLog = fraction(-constant, k)
  const logRatio =
    q === 1 ? '\\ln(2)' : `\\ln\\left(\\dfrac{${q + 1}}{${q}}\\right)`
  const coefficient = `${rationnel.texFractionSimplifiee}${rienSi1(coefLog)}${logRatio}`
  return {
    a,
    b,
    f,
    g,
    fTex: s === 1 ? u : `${s}(${u})`,
    gTex: `${rienSi1(s)}\\sqrt{${u}}`,
    boundsExplanation: `La racine est définie lorsque $${u}\\geq0$, soit $x\\geq${aTex}$. Sur cet ensemble, les deux membres sont positifs ou nuls. On peut donc élever au carré :<br>$f(x)=g(x)\\iff (${u})^2=${u}\\iff (${u})(${ek}-${q + 1})=0$.<br>Les intersections ont pour abscisses $a=${aTex}$ et $b=${bTex}$.`,
    radiusExplanation: `Sur $[${aTex};${bTex}]$, $0\\leq ${u}\\leq1$, donc $0\\leq f(x)\\leq g(x)$. Le rayon extérieur est $g(x)$ et le rayon intérieur est $f(x)$.`,
    exponentielle: {
      aTex,
      bTex,
      integrandTex: `-${rienSi1(s * s)}${e2k}+${s * s * (2 * q + 1)}${ek}-${constant}`,
      primitiveTex: `-${rienSi1(coef2)}${e2k}+${rienSi1(coef1)}${ek}-${constant}x`,
      result: `\\pi\\left(${coefficient}\\right)`,
      evaluation: `${E}^{${k === 1 ? 'a' : `${k}a`}}=${q}\\quad\\text{et}\\quad ${E}^{${k === 1 ? 'b' : `${k}b`}}=${q + 1}`,
    },
  }
}

function drawDisks(family: string): Draw {
  if (family === 'exponentielle') return drawExponential(false)
  const a = randint(-2, 1)
  const b = a + randint(2, 4)
  let p: Polynome
  let fTex: string
  let f: (x: number) => number
  let integrand: Polynome
  if (family === 'racine') {
    const k = randint(1, 3)
    fTex = `${rienSi1(k)}\\sqrt{${Polynome.fromRationalCoefficients([-a, 1]).toLatex()}}`
    f = (x) => k * Math.sqrt(Math.max(0, x - a))
    integrand = Polynome.fromRationalCoefficients([-k * k * a, k * k])
  } else {
    if (family === 'droite') {
      p = Polynome.fromRationalCoefficients([
        randint(-3, 3),
        choice([-2, -1, 1, 2]),
      ])
    } else {
      const shift = randint(a, b)
      const k = randint(1, 2)
      p = Polynome.fromRationalCoefficients([
        k * shift ** 2 + randint(1, 3),
        -2 * k * shift,
        k,
      ])
    }
    fTex = p.toLatex()
    f = p.fonction
    integrand = p.multiplyExact(p)
  }
  return {
    a,
    b,
    fTex,
    f,
    g: () => 0,
    integrand,
    boundsExplanation: `Les bornes sont données : $a=${a}$ et $b=${b}$.`,
    radiusExplanation: '',
  }
}

function drawWashers(family: string): Draw {
  if (family === 'exponentielle') return drawExponential(true)
  if (family === 'racine') {
    const k = randint(1, 3)
    const scale = randint(1, 3)
    const f = Polynome.fromRationalCoefficients([0, fraction(scale, k)])
    return {
      a: 0,
      b: k ** 2,
      fTex: f.toLatex(),
      gTex: `${rienSi1(scale)}\\sqrt{x}`,
      f: f.fonction,
      g: (x) => scale * Math.sqrt(Math.max(0, x)),
      integrand: Polynome.fromRationalCoefficients([0, scale ** 2])
        .add(f.multiplyExact(f).multiplyExact(-1))
        .toRational(),
      boundsExplanation: `Sur $x\\geq0$, les deux membres sont positifs ou nuls, donc on peut élever au carré :<br>$f(x)=g(x)\\iff ${f.toLatex()}=${rienSi1(scale)}\\sqrt{x}\\iff x^2=${rienSi1(k ** 2)}x\\iff x${factor(k ** 2)}=0$.<br>Les bornes sont donc $a=0$ et $b=${k ** 2}$.`,
      radiusExplanation: `Sur $[0;${k ** 2}]$, on a $0\\leq x\\leq ${k ** 2}$, donc $x^2\\leq ${rienSi1(k ** 2)}x$ et $0\\leq f(x)\\leq g(x)$. Le rayon extérieur est $g(x)$ et le rayon intérieur est $f(x)$ : les sections sont des couronnes.`,
    }
  }
  const a = randint(0, 2)
  const b = a + randint(2, 4)
  const k = randint(1, 2)
  const m = randint(0, 2)
  const flat = family === 'droite' && choice([false, true])
  const height = randint(1, 3) + (flat ? k * Math.ceil((b - a) ** 2 / 4) : 0)
  // f = k(x-a)² + m(x-a) + h reste positive. g-f = -c(x-a)(x-b) reste positive sur [a;b].
  const f = flat
    ? Polynome.fromRationalCoefficients([height + k * a * b, -k * (a + b), k])
    : Polynome.fromRationalCoefficients([
        k * a ** 2 - m * a + height,
        m - 2 * k * a,
        k,
      ])
  const c = family === 'droite' ? k : 2 * k
  const diff = Polynome.fromRationalCoefficients([-c * a * b, c * (a + b), -c])
  const g = f.add(diff).toRational()
  const positivity = flat
    ? `$f(x)=${rienSi1(k)}\\left(x-${fraction(a + b, 2).texFractionSimplifiee}\\right)^2+${fraction(4 * height - k * (b - a) ** 2, 4).texFractionSimplifiee}>0$`
    : `$f(x)=${rienSi1(k)}${factor(a)}^2${m === 0 ? '' : `+${rienSi1(m)}${factor(a)}`}+${height}>0$`
  return {
    a,
    b,
    fTex: f.toLatex(),
    gTex: g.toLatex(),
    f: f.fonction,
    g: g.fonction,
    integrand: g
      .multiplyExact(g)
      .add(f.multiplyExact(f).multiplyExact(-1))
      .toRational(),
    boundsExplanation: `$f(x)=g(x)\\iff ${f.toLatex()}=${g.toLatex()}\\iff ${diff.toLatex()}=0\\iff -${rienSi1(c)}${factor(a)}${factor(b)}=0$.<br>Un produit est nul si l’un des facteurs est nul : les bornes sont $a=${a}$ et $b=${b}$.`,
    radiusExplanation: `Sur $[${a};${b}]$, ${positivity}. De plus, $g(x)-f(x)=-${rienSi1(c)}${factor(a)}${factor(b)}\\geq0$, car $x-${a}\\geq0$ et $x-${b}\\leq0$. Ainsi, $0\\leq f(x)\\leq g(x)$. Le rayon extérieur est $g(x)$ et le rayon intérieur est $f(x)$ : les sections sont des couronnes.`,
  }
}

/** Esquisse de la région plane qui tourne autour de Ox, incluse dans la correction. */
function figure(t: Draw): string {
  const points = []
  let yMin = 0
  let yMax = 0
  for (let j = 0; j <= 100; j++) {
    const x = t.a + ((t.b - t.a) * j) / 100
    yMin = Math.min(yMin, t.f(x), t.g(x))
    yMax = Math.max(yMax, t.f(x), t.g(x))
  }
  yMin = Math.floor(yMin) - 1
  yMax = Math.ceil(yMax) + 1
  // Les bornes logarithmiques peuvent être très proches : élargir la région
  // à l'écran sans changer les repères des anciennes familles.
  const xMin = Math.min(0, t.a) - (t.exponentielle ? (t.b - t.a) / 10 : 1)
  const xMax = t.b + (t.exponentielle ? (t.b - t.a) * 0.15 : 1)
  const xUnit = t.exponentielle
    ? 8 / (xMax - xMin)
    : Math.min(1.5, 10 / (xMax - xMin))
  const yUnit = Math.min(1, 5 / (yMax - yMin))
  const stepY = Math.ceil((yMax - yMin) / 6)
  const r = repere({
    xMin,
    xMax,
    yMin,
    yMax,
    xUnite: xUnit,
    yUnite: yUnit,
    grille: false,
    yThickDistance: stepY,
    yLabelDistance: stepY,
    ...(t.exponentielle
      ? {
          xThickListe: [t.a, t.b],
          xLabelListe: [
            { valeur: t.a, texte: t.exponentielle.aTex },
            { valeur: t.b, texte: t.exponentielle.bTex },
          ],
        }
      : {}),
  })
  for (let j = 0; j <= 60; j++) {
    const x = t.a + ((t.b - t.a) * j) / 60
    points.push(pointAbstrait(x * xUnit, t.f(x) * yUnit))
  }
  for (let j = 60; j >= 0; j--) {
    const x = t.a + ((t.b - t.a) * j) / 60
    points.push(pointAbstrait(x * xUnit, t.g(x) * yUnit))
  }
  const region = polygone(points, 'none')
  region.couleurDeRemplissage = colorToLatexOrHTML('gray')
  region.opaciteDeRemplissage = 0.35
  region.epaisseur = 0
  const x = t.a + 0.65 * (t.b - t.a)
  const curves = [
    courbe(t.f, {
      repere: r,
      color: 'blue',
      xMin: t.a,
      xMax: t.b,
      step: (t.b - t.a) / 200,
    }),
    latex2d('f', x * xUnit, t.f(x) * yUnit - 0.35, { color: 'blue' }),
  ]
  if (t.gTex)
    curves.push(
      courbe(t.g, {
        repere: r,
        color: 'red',
        xMin: t.a,
        xMax: t.b,
        step: (t.b - t.a) / 200,
      }),
      latex2d('g', x * xUnit, t.g(x) * yUnit + 0.35, { color: 'red' }),
    )
  return mathalea2d(
    {
      xmin: xMin * xUnit - 0.5,
      xmax: xMax * xUnit + 0.5,
      ymin: yMin * yUnit - 0.5,
      ymax: yMax * yUnit + 0.5,
      pixelsParCm: 40,
      scale: 1,
      center: true,
      centerLatex: true,
    },
    r,
    region,
    ...curves,
  )
}

/** @author Nathan Scheinmann */
export default class VolumeDeRevolution extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 2
    this.spacingCorr = 3
    this.besoinFormulaireComplexe = formulaire
    this.sup = serialiseFormulaireComplexe(
      formulaire,
      valeursParDefaut(formulaire),
    )
    this.comment =
      'La famille exponentielle propose des disques et des couronnes entre s(e^(kx)-q) et s√(e^(kx)-q). Les intersections se calculent exactement et les volumes peuvent contenir un logarithme.'
  }

  nouvelleVersion() {
    const params = lireFormulaireComplexe(formulaire, this.sup)
    const regions = params.repartition('regions', this.nbQuestions)
    const families = params.repartition('familles', this.nbQuestions)
    for (
      let i = 0, attempts = 0;
      i < this.nbQuestions && attempts < 50;
      attempts++
    ) {
      const t =
        regions[i] === 'disques'
          ? drawDisks(families[i])
          : drawWashers(families[i])
      if (!this.questionJamaisPosee(i, t.fTex, t.gTex ?? '', t.a, t.b)) continue
      let result: string
      let bounds: string
      let correction: string
      if (t.exponentielle) {
        const e = t.exponentielle
        result = e.result
        bounds = `_{${e.aTex.replaceAll('\\dfrac', '\\frac')}}^{${e.bTex.replaceAll('\\dfrac', '\\frac')}}`
        const carre = t.gTex
          ? `\\left((${t.gTex})^2-(${t.fTex})^2\\right)`
          : `\\left(${t.fTex}\\right)^2`
        correction =
          `${t.boundsExplanation}<br>${figure(t)}<br>${t.radiusExplanation}<br>` +
          `La formule du volume donne :<br>$V=\\pi\\displaystyle\\int${bounds}${carre}\\,\\mathrm{d}x$.<br>` +
          `En développant, puis en intégrant :<br>$V=\\pi\\displaystyle\\int${bounds}\\left(${e.integrandTex}\\right)\\,\\mathrm{d}x=\\pi\\left[${e.primitiveTex}\\right]${bounds}$.<br>` +
          `On utilise $${e.evaluation}$ pour évaluer la primitive aux bornes. Le volume vaut donc $V=${miseEnEvidence(result)}$ unités de volume.`
      } else {
        const primitive = t.integrand.primitive0()
        const ha = primitive.evaluateExact(t.a)
        const hb = primitive.evaluateExact(t.b)
        const coefficient = hb
          .differenceFraction(ha)
          .simplifie().texFractionSimplifiee
        result = `${coefficient === '1' ? '' : coefficient}\\pi`
        bounds = `_{${t.a}}^{${t.b}}`
        const formula = t.gTex ? '\\left((g(x))^2-(f(x))^2\\right)' : '(f(x))^2'
        const squared = t.gTex
          ? `\\left((${t.gTex})^2-(${t.fTex})^2\\right)`
          : `\\left(${t.fTex}\\right)^2`
        const haTex = ha.texFractionSimplifiee
        correction =
          `${t.boundsExplanation}<br>${figure(t)}<br>` +
          (t.radiusExplanation ? `${t.radiusExplanation}<br>` : '') +
          `La formule du cours donne $V=\\displaystyle\\pi\\int${bounds}${formula}\\,\\mathrm{d}x$.<br>` +
          `On développe l’intégrande :<br>$V=\\displaystyle\\pi\\int${bounds}${squared}\\,\\mathrm{d}x=\\pi\\int${bounds}\\left(${t.integrand.toLatex()}\\right)\\,\\mathrm{d}x$.<br>` +
          `Une primitive de l’intégrande, avec $C=0$, est $H(x)=${primitive.toLatex()}$.<br>` +
          `On évalue aux bornes :<br>$V=\\pi\\left[${primitive.toLatex()}\\right]${bounds}=\\pi\\left(H(${t.b})-H(${t.a})\\right)=\\pi\\left(${hb.texFractionSimplifiee}-${ha.signe < 0 ? `\\left(${haTex}\\right)` : haTex}\\right)$.<br>` +
          `Le volume vaut donc $V=${miseEnEvidence(result)}$ unités de volume.`
      }
      let text = t.gTex
        ? `Soient $f(x)=${t.fTex}$ et $g(x)=${t.gTex}$.<br>Calculer le volume $V$ du solide engendré par la rotation autour de l’axe $Ox$ du domaine borné délimité par les courbes de $f$ et de $g$.`
        : `Soit $f(x)=${t.fTex}$.<br>Calculer le volume $V$ du solide engendré par la rotation autour de l’axe $Ox$ du domaine délimité par la courbe de $f$, l’axe $Ox$ et les droites $x=${t.exponentielle?.aTex ?? t.a}$ et $x=${t.exponentielle?.bTex ?? t.b}$.`
      text += ' Donner la valeur exacte en unités de volume.'
      if (this.interactif)
        text +=
          '<br>' +
          ajouteChampTexteMathLive(
            this,
            i,
            t.exponentielle
              ? KeyboardType.clavierFonctionsTerminales
              : KeyboardType.clavierPersonnalisable,
            {
              texteAvant: '$V=$',
              texteApres: ' unités de volume.',
            },
          )
      // Un seul champ et un point par question, dans les deux modes.
      handleAnswers(this, i, { reponse: { value: result } })
      this.listeQuestions[i] = text
      this.listeCorrections[i] = correction
      i++
    }
    listeQuestionsToContenu(this)
  }
}
