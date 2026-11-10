import Decimal from 'decimal.js'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  rienSi1,
} from './ecritures'
import { miseEnEvidence } from './embellissements'
import { abs, arrondi, signe } from './nombres'
import { texNombre } from './texNombre'

/**
 * Génère une équation du premier degré à une inconnue, avec son énoncé,
 * sa correction et sa correction détaillée.
 *
 * Les quatre types d'équations supportés sont :
 * - `'x+b=d'`      : équation sans coefficient devant l'inconnue
 * - `'ax=d'`       : équation sans terme constant
 * - `'ax+b=0'`     : équation avec second membre nul
 * - `'ax+b=d'`     : équation complète à un seul membre avec inconnue
 * - `'ax+b=cx+d'`  : équation avec inconnue des deux côtés (type par défaut)
 *
 * Si `a`, `b`, `c`, `d` sont fournis, le type est déduit automatiquement
 * et la réponse est calculée exactement. Sinon, les coefficients manquants
 * sont tirés aléatoirement de façon à garantir une solution entière.
 * Si une des 4 variables `a`, `b`, `c`, `d` est fournie, alors il faut fournir les autres,
 * quitte à les mettre à zéro, si on veut que le type soit sélectionné automatiquement.
 *
 * @param options - Paramètres de configuration de l'équation.
 * @param options.valeursRelatives - Si `true`, autorise des coefficients et
 *   une solution négatifs. Si `false` (défaut), tous les coefficients et la
 *   solution générés aléatoirement sont positifs.
 * @param options.divisiblePar - Facteur multiplicatif appliqué aux coefficients
 *   tirés aléatoirement, afin de garantir une divisibilité particulière.
 *   Défaut : `1`.
 * @param options.type - Force le type d'équation. Ignoré si `a`, `b`, `c`, `d`
 *   sont tous fournis (le type est alors recalculé). Défaut : `'ax+b=cx+d'`.
 * @param options.a - Coefficient de l'inconnue au membre gauche. Si absent,
 *   tiré aléatoirement selon le type et `valeursRelatives`.
 * @param options.b - Terme constant au membre gauche. Si absent, calculé pour
 *   que la solution soit un entier simple ou tiré aléatoirement.
 * @param options.c - Coefficient de l'inconnue au membre droit. Si absent,
 *   tiré aléatoirement (peut être `0` selon le type).
 * @param options.d - Terme constant au membre droit. Si absent, tiré
 *   aléatoirement selon le type et `valeursRelatives`.
 * @param options.inconnue - Symbole utilisé pour l'inconnue dans les chaînes
 *   LaTeX générées. Défaut : `'x'`.
 *
 * @returns Un objet contenant :
 * - `membreDeGauche` — chaîne LaTeX du membre gauche (ex. `"3x+2"`)
 * - `membreDeDroite` — chaîne LaTeX du membre droit (ex. `"x-4"`)
 * - `egalite` — chaîne LaTeX de l'équation complète (ex. `"3x+2=x-4"`)
 * - `reponse` — solution exacte, sous forme de `number` si entière ou
 *   décimale exacte, ou de `FractionEtendue` si rationnelle non décimale
 * - `reponseDecimale` — valeur décimale de la solution, arrondie à 2 décimales
 * - `correction` — correction LaTeX concise (étapes de résolution + conclusion)
 * - `correctionDetaillee` — correction LaTeX avec explications textuelles à
 *   chaque étape
 * - `correctionSansConclusion` — correction LaTeX concise sans la phrase de
 *   conclusion finale
 * - `correctionSansConclusionDetaillee` — correction détaillée sans la phrase
 *   de conclusion finale
 * - `a` — valeur numérique du coefficient `a` effectivement utilisé
 * - `aDecimal` — valeur `Decimal` du coefficient `a`
 * - `b` — valeur numérique du coefficient `b` effectivement utilisé
 * - `bDecimal` — valeur `Decimal` du coefficient `b`
 * - `c` — valeur numérique du coefficient `c` effectivement utilisé
 * - `cDecimal` — valeur `Decimal` du coefficient `c`
 * - `d` — valeur numérique du coefficient `d` effectivement utilisé
 * - `dDecimal` — valeur `Decimal` du coefficient `d`
 *
 * @example
 * // Équation entièrement aléatoire avec valeurs relatives
 * const eq = equation1erDegre1Inconnue({ valeursRelatives: true })
 * // eq.egalite -->  "-2x+3=x-9"
 * // eq.reponse -->  4
 * // eq.correction --> chaîne LaTeX prête à l'emploi
 *
 * @example
 * // Équation imposée : 3x + 2 = x - 4  →  solution : -3
 * const eq = equation1erDegre1Inconnue({
 *   valeursRelatives: true,
 *   a: 3, b: 2, c: 1, d: -4,
 * })
 * // eq.reponse --> -3
 *
 * @example
 * // Équation avec inconnue personnalisée et divisibilité forcée
 * const eq = equation1erDegre1Inconnue({
 *   valeursRelatives: false,
 *   divisiblePar: 3,
 *   inconnue: 't',
 * })
 * // eq.membreDeGauche --> "6t+9"
 *
 * @author Guillaume Valmont
 * Eric Elter a rajouté la possibilité de choisir a, b, c, d, inconnue
 * Eric Elter a permis la sortie en fraction quand a, b, c et d choisi.
 */

export const equation1erDegre1Inconnue = (
  options: {
    valeursRelatives: boolean
    divisiblePar?: number
    type?: 'x+b=d' | 'ax=d' | 'ax+b=0' | 'ax+b=d' | 'ax+b=cx+d'
    a?: number
    b?: number
    c?: number
    d?: number
    inconnue?: string
  } = {
    valeursRelatives: false,
    divisiblePar: 1,
    type: 'ax+b=cx+d',
  },
) => {
  let a: Decimal | null = options.a != null ? new Decimal(options.a) : null
  let b: Decimal | null = options.b != null ? new Decimal(options.b) : null
  let c: Decimal | null = options.c != null ? new Decimal(options.c) : null
  let d: Decimal | null = options.d != null ? new Decimal(options.d) : null

  if (a != null && a.isZero() && c == null) {
    window.notify(
      `Division impossible par zéro ! Changer la valeur de la variable a qui vaut actuellement 0.`,
      { a },
    )

    throw new Error(
      `equation1erDegre1Inconnue : a ne peut pas valoir 0 si c n'est pas fourni.`,
    )
  }

  if (a != null && c != null && a.sub(c).isZero()) {
    window.notify(
      `Division impossible par zéro ! Changer la valeur de la variable c (qui vaut actuellement ${c}) et/ou celle de a (qui vaut actuellement ${a}).`,
      { a, c },
    )

    throw new Error(`equation1erDegre1Inconnue : a - c ne peut pas valoir 0.`)
  }

  let type = 'ax+b=cx+d'
  if (options.type != null) {
    type = options.type
  } else if (b?.isZero() && c?.isZero()) {
    type = 'ax=d'
  } else if (a?.toNumber() === 1 && c?.isZero()) {
    type = 'x+b=d'
  } else if (c?.isZero() && d?.isZero()) {
    type = 'ax+b=0'
  } else if (c?.isZero()) {
    type = 'ax+b=d'
  }

  let reponse: FractionEtendue | Decimal | null = null

  const inconnue = options.inconnue ?? 'x'

  switch (type) {
    case 'x+b=d': {
      a = new Decimal(1)
      c = new Decimal(0)
      if (b == null)
        b = new Decimal(randint(-9, 9, [0])).times(options.divisiblePar ?? 1)
      if (d == null)
        d = new Decimal(randint(-16, 15, 0)).times(options.divisiblePar ?? 1)
      if (!options.valeursRelatives) {
        d = d.abs()
      }
      reponse = d.minus(b)
      break
    }

    case 'ax=d': {
      b = new Decimal(0)
      c = new Decimal(0)
      if (a != null && d != null && !a.isZero()) {
        reponse = new FractionEtendue(d, Number(a))
      } else {
        if (options.valeursRelatives) {
          a = new Decimal(randint(-9, 9, [0, -1, 1]))
          reponse = new Decimal(randint(-9, 9, [-1, 0, 1]))
        } else {
          a = new Decimal(randint(2, 15))
          reponse = new Decimal(randint(2, 9))
        }
        d = a.times(reponse)
      }
      break
    }

    case 'ax+b=0':
    case 'ax+b=d': {
      c = new Decimal(0)
      if (type === 'ax+b=0') {
        d = new Decimal(0)
      }

      if (a != null && b != null && !a.isZero()) {
        const dSafe = d ?? new Decimal(0)
        reponse = new FractionEtendue(dSafe.sub(b), Number(a))
      } else {
        let maxIterations = 100
        do {
          if (maxIterations-- <= 0) {
            throw new Error(
              `equation1erDegre1Inconnue : impossible de générer b ≠ 0 après 100 tentatives (type=${type}, valeursRelatives=${options.valeursRelatives}).`,
            )
          }
          if (type === 'ax+b=d') {
            d = new Decimal(randint(-9, 9, [0])).times(
              options.divisiblePar ?? 1,
            )
          } else {
            d = new Decimal(0)
          }
          reponse = new Decimal(randint(-5, 5, [0, -1, 1]))
          a = new Decimal(randint(-5, 5, [-1, 0, 1])).times(
            options.divisiblePar ?? 1,
          )
          if (!options.valeursRelatives) {
            reponse = reponse.abs()
            a = a.abs()
            d = d.abs()
          }
          b = d.minus(a.times(reponse))
        } while (b.equals(0))
      }
      break
    }

    case 'ax+b=cx+d':
    default: {
      if (
        a != null &&
        b != null &&
        c != null &&
        d != null &&
        !a.sub(c).isZero()
      ) {
        reponse = new FractionEtendue(d.sub(b), Number(a.sub(c)))
      } else {
        d = new Decimal(randint(-15, 15, 0)).times(options.divisiblePar ?? 1)
        c = new Decimal(randint(-5, 5, [-1, 0, 1])).times(
          options.divisiblePar ?? 1,
        )

        if (!options.valeursRelatives) {
          c = c.abs()
          a = new Decimal(randint(2, 5))
            .times(options.divisiblePar ?? 1)
            .plus(c)

          const denominateurExclu = c.minus(a).isZero()
            ? [] // aucune exclusion supplémentaire si on ne peut pas diviser
            : [Number(d.div(a.minus(c)))] // valeur à exclure pour éviter b=0
          reponse = new Decimal(
            randint(-9, 9, [0, -1, 1, ...denominateurExclu]),
          ).abs()
        } else {
          a = new Decimal(randint(-5, 5, [0]))
            .times(options.divisiblePar ?? 1)
            .plus(c)
          const denominateurExclu = c.minus(a).isZero()
            ? []
            : [Number(d.div(a.minus(c)))]
          reponse = new Decimal(
            randint(-9, 9, [0, -1, 1, ...denominateurExclu]),
          )
        }

        b = c.minus(a).times(reponse).plus(d)
      }
      break
    }
  }

  if (reponse === null) {
    throw new Error(
      `equation1erDegre1Inconnue : reponse n'a pas été calculée (type="${type}" non reconnu ou cas non couvert).`,
    )
  }

  // Ils ne devraient jamais être null ici si le switch est correct, mais on le garantit.
  const aFinal = a ?? new Decimal(1)
  const bFinal = b ?? new Decimal(0)
  const cFinal = c ?? new Decimal(0)
  const dFinal = d ?? new Decimal(0)

  const membreDeGauche = aFinal.equals(0)
    ? bFinal
    : `${rienSi1(aFinal)}${inconnue}${bFinal.equals(0) ? '' : ecritureAlgebrique(bFinal)}`
  const membreDeDroite = cFinal.equals(0)
    ? dFinal
    : `${rienSi1(cFinal)}${inconnue}${dFinal.equals(0) ? '' : ecritureAlgebrique(dFinal)}`
  const egalite = `${membreDeGauche}=${membreDeDroite}`

  let correction = ''
  let correctionDetaillee = ''

  if (!cFinal.equals(0)) {
    if (cFinal.greaterThan(0)) {
      correctionDetaillee += `On soustrait $${rienSi1(cFinal)}${inconnue}$ aux deux membres.<br>`
    } else {
      correctionDetaillee += `On ajoute $${rienSi1(cFinal.neg())}${inconnue}$ aux deux membres.<br>`
    }
    const soustraireCx = `$${rienSi1(aFinal)}${inconnue}${ecritureAlgebrique(bFinal)}${miseEnEvidence(signe(-cFinal) + rienSi1(abs(cFinal)) + inconnue)}=${texNombre(cFinal)}${inconnue}${ecritureAlgebrique(dFinal)}${miseEnEvidence(signe(-cFinal) + rienSi1(abs(cFinal)) + inconnue)}$<br>
      $${rienSi1(aFinal.minus(cFinal))}${inconnue}${ecritureAlgebrique(bFinal)}=${texNombre(dFinal)}$<br>`
    correction += soustraireCx
    correctionDetaillee += soustraireCx
  }

  if (!bFinal.equals(0)) {
    if (bFinal.greaterThan(0)) {
      correctionDetaillee += `On soustrait $${bFinal}$ aux deux membres.<br>`
    } else {
      correctionDetaillee += `On ajoute $${texNombre(bFinal.neg())}$ aux deux membres.<br>`
    }
    const soustraireB = `$${rienSi1(aFinal.minus(cFinal))}${inconnue}${ecritureAlgebrique(bFinal)}${miseEnEvidence(ecritureAlgebrique(bFinal.neg()))}=${texNombre(dFinal)}${miseEnEvidence(ecritureAlgebrique(bFinal.neg()))}$<br>
      $${rienSi1(aFinal.minus(cFinal))}${inconnue}=${texNombre(dFinal.minus(bFinal))}$<br>`
    correction += soustraireB
    correctionDetaillee += soustraireB
  }
  const coeffX = aFinal.minus(cFinal)
  if (!coeffX.equals(1) && !coeffX.equals(-1)) {
    correctionDetaillee += `On divise les deux membres par $${texNombre(coeffX)}$.<br>`
    let diviserParA = `$${rienSi1(coeffX)}${inconnue}${miseEnEvidence('\\div' + ecritureParentheseSiNegatif(coeffX))}=${texNombre(dFinal.minus(bFinal)) + miseEnEvidence('\\div' + ecritureParentheseSiNegatif(coeffX))}$<br>
      $${inconnue}=${new FractionEtendue(dFinal.minus(bFinal), Number(coeffX)).texFSD}`
    const estDecimal =
      reponse instanceof FractionEtendue
        ? new FractionEtendue(100 * reponse.num, reponse.den).estEntiere
        : true
    diviserParA +=
      reponse instanceof FractionEtendue
        ? estDecimal
          ? `=${texNombre(arrondi(reponse.toNumber(), 2))}`
          : `\\approx ${texNombre(arrondi(reponse.toNumber(), 2))}`
        : `=${reponse}`
    diviserParA += `$<br>`
    correction += diviserParA
    correctionDetaillee += diviserParA
  } else if (coeffX.equals(-1)) {
    correctionDetaillee += `On multiplie les deux membres par $-1$.<br>`
    const multiplierParMoins1 = `$-${inconnue}${miseEnEvidence('\\times(-1)')}=${texNombre(dFinal.minus(bFinal))}${miseEnEvidence('\\times(-1)')}$<br>
      $${inconnue}=${texNombre(dFinal.minus(bFinal).neg())}$<br>`
    correction += multiplierParMoins1
    correctionDetaillee += multiplierParMoins1
  }

  const correctionSansConclusion = correction
  const correctionSansConclusionDetaillee = correctionDetaillee

  const conclusion = `La solution de l'équation $${egalite}$ est $${miseEnEvidence(reponse instanceof FractionEtendue ? reponse.texFSP : texNombre(reponse))}$.`
  correction += conclusion
  correctionDetaillee += conclusion

  return {
    membreDeGauche: String(membreDeGauche),
    membreDeDroite: String(membreDeDroite),
    egalite,
    reponse: reponse instanceof Decimal ? reponse.toNumber() : reponse,
    reponseDecimale:
      reponse instanceof Decimal
        ? reponse.toNumber()
        : arrondi(reponse.valeurDecimale, 2),
    correction,
    correctionDetaillee,
    correctionSansConclusion,
    correctionSansConclusionDetaillee,
    a: aFinal.toNumber(),
    aDecimal: aFinal,
    b: bFinal.toNumber(),
    bDecimal: bFinal,
    c: cFinal.toNumber(),
    cDecimal: cFinal,
    d: dFinal.toNumber(),
    dDecimal: dFinal,
  }
}
