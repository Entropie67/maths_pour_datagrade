import { droiteGraduee } from '../../lib/2d/DroiteGraduee'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { latex2d } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { bleuMathalea } from '../../lib/colors'
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'
import { mathalea2d } from '../../modules/mathalea2d'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import ExerciceQcmA from '../ExerciceQcmA'

export const titre = 'Interpréter une valeur absolue comme une distance'
export const dateDePublication = '23/09/2026'
export const uuid = 'f3535'

export const refs = {
  'fr-fr': ['2N13-3'],
  'fr-ch': [],
}

export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'

/**
 * Point de la droite réelle de la forme s*x + c, avec s dans {-1, 0, 1}.
 */
type Point = { s: number; c: number }

type Proposition = { texte: string; cle: string }

const texPoint = (p: Point) => (p.s === 0 ? `${p.c}` : p.s === 1 ? 'x' : '-x')

/**
 * Clé identifiant la quantité |P - Q| : deux propositions de même clé sont égales.
 * Avec deux nombres, la clé est la valeur de la distance.
 */
const cleDistance = (p: Point, q: Point) => {
  let ds = p.s - q.s
  let dc = p.c - q.c
  if (ds < 0 || (ds === 0 && dc < 0)) {
    ds = -ds
    dc = -dc
  }
  return `${ds};${dc}`
}

const propDistance = (p: Point, q: Point): Proposition => ({
  texte: `La distance entre $${texPoint(p)}$ et $${texPoint(q)}$`,
  cle: cleDistance(p, q),
})

const X: Point = { s: 1, c: 0 }
const MOINS_X: Point = { s: -1, c: 0 }
const ZERO: Point = { s: 0, c: 0 }
const nb = (c: number): Point => ({ s: 0, c })

type PointFigure = { abscisse: number; tex: string }

/**
 * Droite graduée (pas de 1) sur laquelle sont placés deux points,
 * avec une accolade matérialisant la distance qui les sépare (même style que can2F25-06).
 */
const figureDistance = (
  p: PointFigure,
  q: PointFigure,
  texDistance: string,
) => {
  const min = Math.floor(Math.min(p.abscisse, q.abscisse, 0)) - 1
  const max = Math.ceil(Math.max(p.abscisse, q.abscisse, 0)) + 1
  const axe = droiteGraduee({
    Unite: 1,
    Min: min,
    Max: max,
    thickDistance: 1,
    labelsPrincipaux: false,
    labelListe: p.abscisse !== 0 && q.abscisse !== 0 ? [[0, '0']] : [],
  })
  const objets: NestedObjetMathalea2dArray = [axe]
  for (const point of [p, q]) {
    const position = pointAbstrait(point.abscisse - min, 0)
    const marque = tracePoint(position, bleuMathalea)
    marque.style = '|'
    marque.epaisseur = 3
    objets.push(
      marque,
      latex2d(point.tex, position.x, -0.7, { color: bleuMathalea }),
    )
  }
  const distance = Math.abs(p.abscisse - q.abscisse)
  objets.push(
    latex2d(
      `\\overbrace{\\hspace{${distance * 0.55}cm}}^{${texDistance}}`,
      (p.abscisse + q.abscisse) / 2 - min,
      1,
      { color: bleuMathalea },
    ),
  )
  return mathalea2d(
    Object.assign({}, fixeBordures(objets), {
      pixelsParCm: 24,
      scale: 0.8,
    }),
    objets,
  )
}

/**
 * Abscisse (non entière) où représenter x sur la droite graduée, à distance de 0 et de c.
 */
const abscisseDeX = (c: number) => {
  const decalage = choice([-1, 1]) * 3.5
  return Math.abs(c + decalage) < 1.5 ? c - decalage : c + decalage
}

/**
 * Faire le lien entre |a-b|, |a+b| et la distance entre deux réels.
 * @author Arnaud Meistermann
 */
export default class ValeurAbsolueEtDistance extends ExerciceQcmA {
  private appliquerLesValeurs(
    enonce: string,
    correction: string,
    bonne: Proposition,
    candidats: Proposition[],
  ): void {
    // On écarte les distracteurs égaux à la bonne réponse et les doublons d'écriture.
    const distracteurs = shuffle(
      candidats.filter(
        (prop, index) =>
          prop.cle !== bonne.cle &&
          prop.texte !== bonne.texte &&
          candidats.findIndex((autre) => autre.texte === prop.texte) === index,
      ),
    ).slice(0, 3)
    this.enonce = enonce
    this.correction = correction
    this.reponses = [bonne.texte, ...distracteurs.map((prop) => prop.texte)]
  }

  private questionAvecX(type: number): void {
    const c = type === 3 ? randint(-9, 9, 0) : randint(1, 9)
    const xEnPremier = choice([true, false])
    switch (type) {
      case 1: {
        const expression = xEnPremier
          ? `\\vert x-${c}\\vert`
          : `\\vert ${c}-x\\vert`
        let correction = `Pour tous réels $a$ et $b$, $\\vert a-b\\vert$ est la distance entre $a$ et $b$ sur une droite graduée.<br>`
        correction += `Ainsi, $${expression}$ est la distance entre $x$ et $${c}$.<br>`
        correction += figureDistance(
          { abscisse: abscisseDeX(c), tex: 'x' },
          { abscisse: c, tex: `${c}` },
          expression,
        )
        this.appliquerLesValeurs(
          `$${expression}$ est égal à :`,
          correction,
          propDistance(X, nb(c)),
          [
            propDistance(X, nb(-c)),
            propDistance(X, ZERO),
            propDistance(nb(c), ZERO),
            propDistance(MOINS_X, nb(c)),
            propDistance(MOINS_X, nb(-c)),
          ],
        )
        break
      }
      case 2: {
        const expression = xEnPremier
          ? `\\vert x+${c}\\vert`
          : `\\vert ${c}+x\\vert`
        let correction = `Pour tous réels $a$ et $b$, $\\vert a-b\\vert$ est la distance entre $a$ et $b$ sur une droite graduée.<br>`
        correction += `Or $${expression}=\\vert x-(-${c})\\vert$.<br>`
        correction += `Ainsi, $${expression}$ est la distance entre $x$ et $-${c}$.<br>`
        correction += figureDistance(
          { abscisse: abscisseDeX(-c), tex: 'x' },
          { abscisse: -c, tex: `-${c}` },
          `\\vert x-${ecritureParentheseSiNegatif(-c)}\\vert`,
        )
        this.appliquerLesValeurs(
          `$${expression}$ est égal à :`,
          correction,
          propDistance(X, nb(-c)),
          [
            propDistance(X, nb(c)),
            propDistance(X, ZERO),
            propDistance(nb(-c), ZERO),
            propDistance(nb(c), ZERO),
            propDistance(MOINS_X, nb(-c)),
            propDistance(MOINS_X, nb(c)),
          ],
        )
        break
      }
      case 3:
      default: {
        const points = xEnPremier ? `$x$ et $${c}$` : `$${c}$ et $x$`
        const texBonne = `\\vert x${ecritureAlgebrique(-c)}\\vert`
        let correction = `Pour tous réels $a$ et $b$, la distance entre $a$ et $b$ sur une droite graduée est $\\vert a-b\\vert$.<br>`
        correction += `Ainsi, la distance entre ${points} est égale à `
        correction +=
          c < 0
            ? `$\\vert x-(${c})\\vert$, c'est-à-dire $${texBonne}$.<br>`
            : `$${texBonne}$.<br>`
        correction += figureDistance(
          { abscisse: abscisseDeX(c), tex: 'x' },
          { abscisse: c, tex: `${c}` },
          `\\vert x-${ecritureParentheseSiNegatif(c)}\\vert`,
        )
        this.appliquerLesValeurs(
          `La distance entre ${points} est égale à :`,
          correction,
          { texte: `$${texBonne}$`, cle: cleDistance(X, nb(c)) },
          [
            {
              texte: `$\\vert x${ecritureAlgebrique(c)}\\vert$`,
              cle: cleDistance(X, nb(-c)),
            },
            {
              texte: `$\\vert ${-c}-x\\vert$`,
              cle: cleDistance(nb(-c), X),
            },
            {
              texte: `$\\vert x\\vert${ecritureAlgebrique(-c)}$`,
              cle: 'sansValeurAbsolue1',
            },
            {
              texte: `$\\vert x\\vert${ecritureAlgebrique(c)}$`,
              cle: 'sansValeurAbsolue2',
            },
          ],
        )
        break
      }
    }
  }

  private questionAvecNombres(type: number): void {
    const a = randint(-9, 9, 0)
    // b > 0 pour les types 1 et 2 : on écrit |4-7| ou |4+7|, jamais |4+(-7)|.
    const b = type === 3 ? randint(-9, 9, [0, a, -a]) : randint(1, 9, [a, -a])
    switch (type) {
      case 1: {
        const expression = `\\vert ${a}-${b}\\vert`
        let correction = `Pour tous réels $a$ et $b$, $\\vert a-b\\vert$ est la distance entre $a$ et $b$ sur une droite graduée.<br>`
        correction += `Ainsi, $${expression}$ est la distance entre $${a}$ et $${b}$.<br>`
        correction += `On peut vérifier : $${expression}=\\vert ${a - b}\\vert=${Math.abs(a - b)}$.<br>`
        correction += figureDistance(
          { abscisse: a, tex: `${a}` },
          { abscisse: b, tex: `${b}` },
          `${Math.abs(a - b)}`,
        )
        this.appliquerLesValeurs(
          `$${expression}$ est égal à :`,
          correction,
          propDistance(nb(a), nb(b)),
          [
            propDistance(nb(a), nb(-b)),
            propDistance(nb(-a), nb(b)),
            propDistance(nb(-a), nb(-b)),
            propDistance(nb(a), ZERO),
            propDistance(nb(b), ZERO),
          ],
        )
        break
      }
      case 2: {
        const expression = `\\vert ${a}+${b}\\vert`
        let correction = `Pour tous réels $a$ et $b$, $\\vert a-b\\vert$ est la distance entre $a$ et $b$ sur une droite graduée.<br>`
        correction += `Or $${expression}=\\vert ${a}-(${-b})\\vert$.<br>`
        correction += `Ainsi, $${expression}$ est la distance entre $${a}$ et $${-b}$.<br>`
        correction += `On peut vérifier : $${expression}=\\vert ${a + b}\\vert=${Math.abs(a + b)}$.<br>`
        correction += figureDistance(
          { abscisse: a, tex: `${a}` },
          { abscisse: -b, tex: `${-b}` },
          `${Math.abs(a + b)}`,
        )
        this.appliquerLesValeurs(
          `$${expression}$ est égal à :`,
          correction,
          propDistance(nb(a), nb(-b)),
          [
            propDistance(nb(a), nb(b)),
            propDistance(nb(-a), nb(-b)),
            propDistance(nb(-a), nb(b)),
            propDistance(nb(a), ZERO),
            propDistance(nb(b), ZERO),
          ],
        )
        break
      }
      case 3:
      default: {
        const texBonne = `\\vert ${a}${ecritureAlgebrique(-b)}\\vert`
        let correction = `Pour tous réels $a$ et $b$, la distance entre $a$ et $b$ sur une droite graduée est $\\vert a-b\\vert$.<br>`
        correction += `Ainsi, la distance entre $${a}$ et $${b}$ est égale à `
        correction +=
          b < 0
            ? `$\\vert ${a}-(${b})\\vert$, c'est-à-dire $${texBonne}$.<br>`
            : `$${texBonne}$.<br>`
        correction += `On peut vérifier : $${texBonne}=\\vert ${a - b}\\vert=${Math.abs(a - b)}$.<br>`
        correction += figureDistance(
          { abscisse: a, tex: `${a}` },
          { abscisse: b, tex: `${b}` },
          `${Math.abs(a - b)}`,
        )
        this.appliquerLesValeurs(
          `La distance entre $${a}$ et $${b}$ est égale à :`,
          correction,
          { texte: `$${texBonne}$`, cle: cleDistance(nb(a), nb(b)) },
          [
            {
              texte: `$\\vert ${a}${ecritureAlgebrique(b)}\\vert$`,
              cle: cleDistance(nb(a), nb(-b)),
            },
            {
              texte: `$\\vert ${-a}${ecritureAlgebrique(-b)}\\vert$`,
              cle: cleDistance(nb(-a), nb(b)),
            },
            {
              texte: `$\\vert ${b}${ecritureAlgebrique(a)}\\vert$`,
              cle: cleDistance(nb(b), nb(-a)),
            },
            {
              texte: `$\\vert ${a}\\vert+\\vert ${b}\\vert$`,
              cle: cleDistance(nb(Math.abs(a) + Math.abs(b)), ZERO),
            },
            {
              texte: `$\\vert ${a}\\vert-\\vert ${b}\\vert$`,
              cle: cleDistance(nb(Math.abs(a) - Math.abs(b)), ZERO),
            },
          ],
        )
        break
      }
    }
  }

  versionAleatoire = () => {
    // Un type par appel : versionAleatoire() est rappelée par ExerciceQcm pour chaque question.
    const type = Number(
      gestionnaireFormulaireTexte({
        saisie: this.sup3,
        min: 1,
        max: 3,
        defaut: 4,
        melange: 4,
        nbQuestions: 1,
      })[0],
    )
    let compteur = 0
    do {
      const avecX =
        this.sup5 === 1 ? true : this.sup5 === 2 ? false : choice([true, false])
      if (avecX) this.questionAvecX(type)
      else this.questionAvecNombres(type)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4))
  }

  constructor() {
    super()
    this.besoinFormulaire3Texte = [
      'Type de questions',
      'Nombres séparés par des tirets :\n1 : |a-b| vers distance\n2 : |a+b| vers distance\n3 : Distance vers valeur absolue\n4 : Mélange',
    ]
    this.besoinFormulaire5Numerique = [
      'Nombres utilisés',
      3,
      '1 : Avec x\n2 : Avec deux nombres\n3 : Mélange',
    ]
    this.sup3 = '4'
    this.sup5 = 3
    this.versionAleatoire()
  }
}
