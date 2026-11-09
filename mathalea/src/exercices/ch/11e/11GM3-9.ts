import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import {
    gestionnaireFormulaireTexte,
    listeQuestionsToContenu,
    randint,
} from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre =
  "Calculer une grandeur manquante dans un problème d'aire ou de volume"
export const dateDePublication = '29/10/2026'
export const uuid = '3b8d4'
export const interactifReady = true
export const refs = { 'fr-fr': [], 'fr-ch': ['10CTGM1D-1', '10LCGM1D-1', '10LSGM1D-1', '11CTGM1F-1', '11LCGM1F-1', '11LSGM1F-1'] }

type Tirage = {
  enonce: string
  correction: string
  valeur: number
  grandeur: string
  unite: string
  cle: string
}

const n = (x: number): string => texNombre(x)

/** Aire d'un triangle : on cherche la hauteur. */
function triangle(): Tirage {
  const b = 2 * randint(2, 7)
  const h = randint(3, 12)
  const A = (b * h) / 2
  return {
    enonce: `Un champ a la forme d'un triangle. Sa base mesure $${b}\\text{ m}$ et son aire est de $${A}\\text{ m}^2$.<br>Calculer la hauteur de ce triangle.`,
    correction:
      `L'aire d'un triangle de base $b$ et de hauteur $h$ est $\\mathcal{A}=\\dfrac{b\\times h}{2}$.<br>` +
      `On isole $h$ : $h=\\dfrac{2\\times\\mathcal{A}}{b}$.<br>` +
      `On remplace par les valeurs : $h=\\dfrac{2\\times${A}}{${b}}=${miseEnEvidence(n(h))}\\text{ m}$.`,
    valeur: h,
    grandeur: 'h',
    unite: '\\text{m}',
    cle: `tr${b}-${h}`,
  }
}

/** Aire d'un trapèze : on cherche la hauteur. */
function trapeze(): Tirage {
  const b = randint(3, 9)
  const B = randint(b + 2, 14)
  const h = (B + b) % 2 === 0 ? randint(3, 9) : 2 * randint(2, 5)
  const A = ((B + b) * h) / 2
  return {
    enonce: `Un terrain a la forme d'un trapèze de bases $${B}\\text{ m}$ et $${b}\\text{ m}$. Son aire est de $${A}\\text{ m}^2$.<br>Calculer la hauteur de ce trapèze.`,
    correction:
      `L'aire d'un trapèze de bases $B$ et $b$ et de hauteur $h$ est $\\mathcal{A}=\\dfrac{(B+b)\\times h}{2}$.<br>` +
      `On isole $h$ : $h=\\dfrac{2\\times\\mathcal{A}}{B+b}$.<br>` +
      `On remplace par les valeurs : $h=\\dfrac{2\\times${A}}{${B}+${b}}=\\dfrac{${2 * A}}{${B + b}}=${miseEnEvidence(n(h))}\\text{ m}$.`,
    valeur: h,
    grandeur: 'h',
    unite: '\\text{m}',
    cle: `tz${B}-${b}-${h}`,
  }
}

/** Volume d'un pavé : on cherche la hauteur de l'eau. */
function pave(): Tirage {
  const L = randint(4, 12) * 10
  const l = randint(3, 8) * 10
  const h = randint(2, 9) * 5
  const V = L * l * h
  return {
    enonce: `Un aquarium a la forme d'un pavé droit de $${L}\\text{ cm}$ de long et de $${l}\\text{ cm}$ de large. Il contient $${n(V)}\\text{ cm}^3$ d'eau.<br>Calculer la hauteur de l'eau dans l'aquarium.`,
    correction:
      `Le volume d'un pavé droit est $V=L\\times l\\times h$.<br>` +
      `On isole $h$ : $h=\\dfrac{V}{L\\times l}$.<br>` +
      `On remplace par les valeurs : $h=\\dfrac{${n(V)}}{${L}\\times${l}}=\\dfrac{${n(V)}}{${n(L * l)}}=${miseEnEvidence(n(h))}\\text{ cm}$.`,
    valeur: h,
    grandeur: 'h',
    unite: '\\text{cm}',
    cle: `pa${L}-${l}-${h}`,
  }
}

/** Volume d'un cylindre : on cherche la hauteur. */
function cylindreHauteur(): Tirage {
  const r = randint(2, 9)
  const h = randint(3, 14)
  const k = r * r * h
  return {
    enonce: `Un bidon cylindrique a un rayon de $${r}\\text{ cm}$ et un volume de $${n(k)}\\pi\\text{ cm}^3$.<br>Calculer la hauteur de ce bidon.`,
    correction:
      `Le volume d'un cylindre de rayon $r$ et de hauteur $h$ est $V=\\pi\\times r^2\\times h$.<br>` +
      `On isole $h$ : $h=\\dfrac{V}{\\pi\\times r^2}$.<br>` +
      `On remplace par les valeurs : $h=\\dfrac{${n(k)}\\pi}{\\pi\\times${r}^2}=\\dfrac{${n(k)}}{${r * r}}=${miseEnEvidence(n(h))}\\text{ cm}$.`,
    valeur: h,
    grandeur: 'h',
    unite: '\\text{cm}',
    cle: `ch${r}-${h}`,
  }
}

/** Volume d'un cylindre : on cherche le rayon (racine carrée). */
function cylindreRayon(): Tirage {
  const r = randint(2, 9)
  const h = randint(3, 12)
  const k = r * r * h
  return {
    enonce: `Un silo cylindrique a une hauteur de $${h}\\text{ m}$ et un volume de $${n(k)}\\pi\\text{ m}^3$.<br>Calculer le rayon de ce silo.`,
    correction:
      `Le volume d'un cylindre de rayon $r$ et de hauteur $h$ est $V=\\pi\\times r^2\\times h$.<br>` +
      `On isole $r^2$ : $r^2=\\dfrac{V}{\\pi\\times h}$.<br>` +
      `On remplace par les valeurs : $r^2=\\dfrac{${n(k)}\\pi}{\\pi\\times${h}}=${r * r}$.<br>` +
      `Le rayon est positif, donc $r=\\sqrt{${r * r}}=${miseEnEvidence(n(r))}\\text{ m}$.`,
    valeur: r,
    grandeur: 'r',
    unite: '\\text{m}',
    cle: `cr${r}-${h}`,
  }
}

/** Volume d'une pyramide : on cherche la hauteur. */
function pyramide(): Tirage {
  const B = randint(4, 12) * 4
  const h = choice([3, 6, 9, 12])
  const V = (B * h) / 3
  return {
    enonce: `Une pyramide a une base d'aire $${B}\\text{ cm}^2$ et un volume de $${V}\\text{ cm}^3$.<br>Calculer la hauteur de cette pyramide.`,
    correction:
      `Le volume d'une pyramide dont la base a pour aire $B$ et dont la hauteur est $h$ est $V=\\dfrac{B\\times h}{3}$.<br>` +
      `On isole $h$ : $h=\\dfrac{3\\times V}{B}$.<br>` +
      `On remplace par les valeurs : $h=\\dfrac{3\\times${V}}{${B}}=\\dfrac{${3 * V}}{${B}}=${miseEnEvidence(n(h))}\\text{ cm}$.`,
    valeur: h,
    grandeur: 'h',
    unite: '\\text{cm}',
    cle: `py${B}-${h}`,
  }
}

/** Volume d'un cône : on cherche la hauteur. */
function cone(): Tirage {
  const r = randint(2, 8)
  const h = choice([3, 6, 9, 12])
  const k = (r * r * h) / 3
  return {
    enonce: `Un cône de révolution a un rayon de $${r}\\text{ cm}$ et un volume de $${n(k)}\\pi\\text{ cm}^3$.<br>Calculer la hauteur de ce cône.`,
    correction:
      `Le volume d'un cône de rayon $r$ et de hauteur $h$ est $V=\\dfrac{\\pi\\times r^2\\times h}{3}$.<br>` +
      `On isole $h$ : $h=\\dfrac{3\\times V}{\\pi\\times r^2}$.<br>` +
      `On remplace par les valeurs : $h=\\dfrac{3\\times${n(k)}\\pi}{\\pi\\times${r}^2}=\\dfrac{${n(3 * k)}}{${r * r}}=${miseEnEvidence(n(h))}\\text{ cm}$.`,
    valeur: h,
    grandeur: 'h',
    unite: '\\text{cm}',
    cle: `co${r}-${h}`,
  }
}

/** Volume d'une boule : on cherche le rayon (racine cubique). */
function boule(): Tirage {
  const r = choice([3, 6, 9])
  const k = (4 * r ** 3) / 3
  return {
    enonce: `Une boule a un volume de $${n(k)}\\pi\\text{ cm}^3$.<br>Calculer le rayon de cette boule.`,
    correction:
      `Le volume d'une boule de rayon $r$ est $V=\\dfrac{4\\times\\pi\\times r^3}{3}$.<br>` +
      `On isole $r^3$ : $r^3=\\dfrac{3\\times V}{4\\times\\pi}$.<br>` +
      `On remplace par les valeurs : $r^3=\\dfrac{3\\times${n(k)}\\pi}{4\\pi}=${n(r ** 3)}$.<br>` +
      `Comme $${r}^3=${n(r ** 3)}$, on obtient $r=\\sqrt[3]{${n(r ** 3)}}=${miseEnEvidence(n(r))}\\text{ cm}$.`,
    valeur: r,
    grandeur: 'r',
    unite: '\\text{cm}',
    cle: `bo${r}`,
  }
}

/** Aire latérale d'un cylindre : on cherche la hauteur de l'étiquette. */
function etiquette(): Tirage {
  const r = randint(2, 6)
  const h = randint(3, 12)
  const k = 2 * r * h
  return {
    enonce: `L'étiquette d'une boîte de conserve est un rectangle qui entoure exactement la boîte, de rayon $${r}\\text{ cm}$. Son aire est de $${k}\\pi\\text{ cm}^2$.<br>Calculer la hauteur de la boîte.`,
    correction:
      `L'étiquette est la surface latérale du cylindre : $\\mathcal{A}=2\\times\\pi\\times r\\times h$.<br>` +
      `On isole $h$ : $h=\\dfrac{\\mathcal{A}}{2\\times\\pi\\times r}$.<br>` +
      `On remplace par les valeurs : $h=\\dfrac{${k}\\pi}{2\\times\\pi\\times${r}}=\\dfrac{${k}}{${2 * r}}=${miseEnEvidence(n(h))}\\text{ cm}$.`,
    valeur: h,
    grandeur: 'h',
    unite: '\\text{cm}',
    cle: `et${r}-${h}`,
  }
}

/** Aire d'un parallélogramme : on cherche la hauteur. */
function parallelogramme(): Tirage {
  const b = randint(4, 15)
  const h = randint(3, 12)
  const A = b * h
  return {
    enonce: `Un champ a la forme d'un parallélogramme. Sa base mesure $${b}\\text{ m}$ et son aire est de $${A}\\text{ m}^2$.<br>Calculer la hauteur de ce parallélogramme relative à cette base.`,
    correction:
      `L'aire d'un parallélogramme de base $b$ et de hauteur $h$ est $\\mathcal{A}=b\\times h$.<br>` +
      `On isole $h$ : $h=\\dfrac{\\mathcal{A}}{b}$.<br>` +
      `On remplace par les valeurs : $h=\\dfrac{${A}}{${b}}=${miseEnEvidence(n(h))}\\text{ m}$.`,
    valeur: h,
    grandeur: 'h',
    unite: '\\text{m}',
    cle: `pl${b}-${h}`,
  }
}

/** Aire d'un losange : on cherche la seconde diagonale. */
function losange(): Tirage {
  const D = 2 * randint(3, 10)
  const d = randint(4, 14)
  const A = (D * d) / 2
  return {
    enonce: `Un losange a une aire de $${A}\\text{ cm}^2$ et une diagonale de $${D}\\text{ cm}$.<br>Calculer la longueur de l'autre diagonale.`,
    correction:
      `L'aire d'un losange de diagonales $D$ et $d$ est $\\mathcal{A}=\\dfrac{D\\times d}{2}$.<br>` +
      `On isole $d$ : $d=\\dfrac{2\\times\\mathcal{A}}{D}$.<br>` +
      `On remplace par les valeurs : $d=\\dfrac{2\\times${A}}{${D}}=\\dfrac{${2 * A}}{${D}}=${miseEnEvidence(n(d))}\\text{ cm}$.`,
    valeur: d,
    grandeur: 'd',
    unite: '\\text{cm}',
    cle: `lo${D}-${d}`,
  }
}

/** Volume d'un prisme à base triangulaire : on cherche la hauteur du prisme. */
function prismeTriangle(): Tirage {
  const b = 2 * randint(2, 6)
  const h = randint(3, 9)
  const H = randint(4, 12)
  const V = (b * h * H) / 2
  return {
    enonce: `Un prisme droit a pour base un triangle de base $${b}\\text{ cm}$ et de hauteur $${h}\\text{ cm}$. Son volume est de $${n(V)}\\text{ cm}^3$.<br>Calculer la hauteur de ce prisme.`,
    correction:
      `Le volume d'un prisme droit est $V=\\mathcal{B}\\times H$, où l'aire de la base est $\\mathcal{B}=\\dfrac{${b}\\times${h}}{2}=${(b * h) / 2}\\text{ cm}^2$.<br>` +
      `On isole $H$ : $H=\\dfrac{V}{\\mathcal{B}}$.<br>` +
      `On remplace par les valeurs : $H=\\dfrac{${n(V)}}{${(b * h) / 2}}=${miseEnEvidence(n(H))}\\text{ cm}$.`,
    valeur: H,
    grandeur: 'H',
    unite: '\\text{cm}',
    cle: `pt${b}-${h}-${H}`,
  }
}

/** Volume d'un prisme à base trapézoïdale : on cherche la hauteur du prisme. */
function prismeTrapeze(): Tirage {
  const b = randint(3, 8)
  const B = randint(b + 2, 14)
  const h = 2 * randint(2, 5)
  const H = randint(4, 12)
  const base = ((B + b) * h) / 2
  const V = base * H
  return {
    enonce: `Un prisme droit a pour base un trapèze de bases $${B}\\text{ cm}$ et $${b}\\text{ cm}$ et de hauteur $${h}\\text{ cm}$. Son volume est de $${n(V)}\\text{ cm}^3$.<br>Calculer la hauteur de ce prisme.`,
    correction:
      `L'aire de la base est $\\mathcal{B}=\\dfrac{(${B}+${b})\\times${h}}{2}=${base}\\text{ cm}^2$.<br>` +
      `Le volume d'un prisme droit est $V=\\mathcal{B}\\times H$, donc $H=\\dfrac{V}{\\mathcal{B}}$.<br>` +
      `On remplace par les valeurs : $H=\\dfrac{${n(V)}}{${base}}=${miseEnEvidence(n(H))}\\text{ cm}$.`,
    valeur: H,
    grandeur: 'H',
    unite: '\\text{cm}',
    cle: `pz${B}-${b}-${h}-${H}`,
  }
}

/** Volume d'un prisme à base en losange : on cherche la hauteur du prisme. */
function prismeLosange(): Tirage {
  const D = 2 * randint(3, 8)
  const d = randint(4, 12)
  const H = randint(4, 12)
  const base = (D * d) / 2
  const V = base * H
  return {
    enonce: `Un prisme droit a pour base un losange dont les diagonales mesurent $${D}\\text{ cm}$ et $${d}\\text{ cm}$. Son volume est de $${n(V)}\\text{ cm}^3$.<br>Calculer la hauteur de ce prisme.`,
    correction:
      `L'aire de la base est $\\mathcal{B}=\\dfrac{${D}\\times${d}}{2}=${base}\\text{ cm}^2$.<br>` +
      `Le volume d'un prisme droit est $V=\\mathcal{B}\\times H$, donc $H=\\dfrac{V}{\\mathcal{B}}$.<br>` +
      `On remplace par les valeurs : $H=\\dfrac{${n(V)}}{${base}}=${miseEnEvidence(n(H))}\\text{ cm}$.`,
    valeur: H,
    grandeur: 'H',
    unite: '\\text{cm}',
    cle: `pL${D}-${d}-${H}`,
  }
}

/** Volume d'un prisme à base en parallélogramme : on cherche la hauteur du prisme. */
function prismeParallelogramme(): Tirage {
  const b = randint(4, 12)
  const h = randint(3, 9)
  const H = randint(4, 12)
  const V = b * h * H
  return {
    enonce: `Un prisme droit a pour base un parallélogramme de base $${b}\\text{ cm}$ et de hauteur $${h}\\text{ cm}$. Son volume est de $${n(V)}\\text{ cm}^3$.<br>Calculer la hauteur de ce prisme.`,
    correction:
      `L'aire de la base est $\\mathcal{B}=${b}\\times${h}=${b * h}\\text{ cm}^2$.<br>` +
      `Le volume d'un prisme droit est $V=\\mathcal{B}\\times H$, donc $H=\\dfrac{V}{\\mathcal{B}}$.<br>` +
      `On remplace par les valeurs : $H=\\dfrac{${n(V)}}{${b * h}}=${miseEnEvidence(n(H))}\\text{ cm}$.`,
    valeur: H,
    grandeur: 'H',
    unite: '\\text{cm}',
    cle: `pp${b}-${h}-${H}`,
  }
}

/** Aire latérale d'un prisme droit : on cherche sa hauteur. */
function prismeAireLaterale(): Tirage {
  const P = randint(12, 40)
  const h = randint(3, 12)
  const A = P * h
  return {
    enonce: `Un prisme droit a une base de périmètre $${P}\\text{ cm}$. Son aire latérale est de $${A}\\text{ cm}^2$.<br>Calculer la hauteur de ce prisme.`,
    correction:
      `Les faces latérales d'un prisme droit forment un rectangle dont un côté est le périmètre de la base : $\\mathcal{A}=P\\times h$.<br>` +
      `On isole $h$ : $h=\\dfrac{\\mathcal{A}}{P}$.<br>` +
      `On remplace par les valeurs : $h=\\dfrac{${A}}{${P}}=${miseEnEvidence(n(h))}\\text{ cm}$.`,
    valeur: h,
    grandeur: 'h',
    unite: '\\text{cm}',
    cle: `al${P}-${h}`,
  }
}

const tirages: Record<number, () => Tirage> = {
  1: triangle,
  2: trapeze,
  3: pave,
  4: cylindreHauteur,
  5: cylindreRayon,
  6: pyramide,
  7: cone,
  8: boule,
  9: etiquette,
  10: parallelogramme,
  11: losange,
  12: prismeTriangle,
  13: prismeTrapeze,
  14: prismeLosange,
  15: prismeParallelogramme,
  16: prismeAireLaterale,
}

/**
 * Grandeur manquante dans un problème : on rappelle la formule, on isole la
 * grandeur, puis on remplace par les valeurs de l'énoncé.
 * @author Nathan Scheinmann
 */
export default class GrandeurManquanteProbleme extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.spacingCorr = 3
    this.sup = 17
    this.besoinFormulaireTexte = [
      'Situations',
      [
        'Nombres séparés par des tirets :',
        '1 : Aire d’un triangle',
        '2 : Aire d’un trapèze',
        '3 : Volume d’un pavé droit',
        '4 : Volume d’un cylindre (hauteur)',
        '5 : Volume d’un cylindre (rayon, avec racine carrée)',
        '6 : Volume d’une pyramide',
        '7 : Volume d’un cône',
        '8 : Volume d’une boule (rayon, avec racine cubique)',
        '9 : Aire latérale d’un cylindre',
        '10 : Aire d’un parallélogramme',
        '11 : Aire d’un losange',
        '12 : Volume d’un prisme droit à base triangulaire',
        '13 : Volume d’un prisme droit à base trapézoïdale',
        '14 : Volume d’un prisme droit à base en losange',
        '15 : Volume d’un prisme droit à base en parallélogramme',
        '16 : Aire latérale d’un prisme droit',
        '17 : Mélange',
      ].join('\n'),
    ]
    this.comment =
      'La formule n’est pas donnée dans l’énoncé : l’élève doit la connaître. La grandeur cherchée est toujours un nombre entier, sans arrondi. Quand le volume ou l’aire contient π, il est donné sous la forme $k\\pi$.'
  }

  nouvelleVersion() {
    const types = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: 16,
      melange: 17,
      defaut: 17,
      nbQuestions: this.nbQuestions,
    }) as number[]
    const liste = combinaisonListes(types, this.nbQuestions)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const tirage = tirages[liste[i]]()
      if (!this.questionJamaisPosee(i, tirage.cle)) continue
      let texte = tirage.enonce
      handleAnswers(this, i, { reponse: { value: tirage.valeur } })
      if (this.interactif) {
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase, {
          texteAvant: `<br>$${tirage.grandeur}=$`,
          texteApres: `$${tirage.unite}$.`,
        })
      }
      this.listeQuestions[i] = texte
      this.listeCorrections[i] = tirage.correction
      i++
    }
    listeQuestionsToContenu(this)
  }
}
