import { miseEnEvidence } from '../../lib/outils/embellissements'
import { symboleParallele } from '../../lib/outils/notationsGeometrie'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { texteParPoint } from '../../lib/2d/textes'
import { homothetie, similitude } from '../../lib/2d/transformations'
import { triangle2points2longueurs } from '../../lib/2d/triangles'
import {
  angle,
  angleOriente,
  longueur,
} from '../../lib/2d/utilitairesGeometriques'
import { pointAdistance, pointSurSegment } from '../../lib/2d/utilitairesPoint'
import { bleuMathalea } from '../../lib/colors'
import { texteGras } from '../../lib/format/style'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { ajouterBoutonMathalea2d } from '../../lib/outils/enrichissements'
import { creerNomDePolygone } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Écrire une relation de Thalès'

export const interactifReady = true
/**
 * Relation de Thalès
 * @author Sébastien LOZANO
 */

/**
 * Génère toutes les permutations uniques d’un tableau de chaînes.
 *
 * @param arr - Tableau d'éléments (chaînes) à permuter.
 * @returns Un tableau de permutations uniques, où chaque permutation est un tableau de chaînes.
 * @author Éric Elter
 */
function permutationsUnique(arr: string[]): string[][] {
  const results = new Set<string>()
  function permute(a: string[], l = 0): void {
    if (l === a.length - 1) {
      results.add(a.join('||'))
      return
    }
    for (let i = l; i < a.length; i++) {
      const b = a.slice()
      ;[b[l], b[i]] = [b[i], b[l]]
      permute(b, l + 1)
    }
  }
  permute(arr.slice())
  return Array.from(results).map((s) => s.split('||'))
}

/**
 * Extrait toutes les fractions \dfrac{...}{...} d’un texte LaTeX.
 *
 * @param texte - Chaîne contenant des fractions LaTeX du type \dfrac{...}{...}.
 * @returns Un tableau d’objets représentant les fractions extraites avec leur forme brute, numérateur et dénominateur.
 * @author Éric Elter
 */
function extraireFractions(
  texte: string,
): { raw: string; num: string; den: string }[] {
  const re = /\\dfrac\{([^}]*)\}\{([^}]*)\}/g
  const fractions: { raw: string; num: string; den: string }[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(texte)) !== null) {
    fractions.push({ raw: m[0], num: m[1], den: m[2] })
  }
  return fractions
}

/**
 * Génère toutes les variantes d'une expression (numérateur ou dénominateur)
 * en tenant compte :
 *  - des permutations à l'intérieur des ${...} ou des "a + b"
 *  - des inversions de lettres majuscules ("GE" ↔ "EG")
 *
 * @param content - Contenu du numérateur ou du dénominateur.
 * @returns Un tableau de variantes de l’expression.
 *
 * @example
 * variantsFor("GE")
 * // => ["GE", "EG"]
 *
 * variantsFor("${a + b}")
 * // => ["${a + b}", "${b + a}"]
 *
 * @author Éric Elter
 */
function variantsFor(content: string): string[] {
  const trimmed = content.trim()

  // Cas 1 : interpolation JS ${...}
  const dollarCurly = /^\$\{([\s\S]+)\}$/.exec(trimmed)
  if (dollarCurly) {
    const operands = dollarCurly[1].split(/\s*\+\s*/).map((s) => s.trim())
    const perms = permutationsUnique(operands)
    return perms.map((parts) => `\${${parts.join(' + ')}}`)
  }

  // Cas 2 : expression "a + b"
  if (trimmed.includes('+')) {
    const operands = trimmed.split(/\s*\+\s*/).map((s) => s.trim())
    const perms = permutationsUnique(operands)
    return perms.map((parts) => parts.join(' + '))
  }

  // Cas 3 : lettres majuscules collées (ex: GE → EG)
  if (/^[A-Z]{2,}$/.test(trimmed)) {
    const letters = trimmed.split('')
    const perms = permutationsUnique(letters)
    return perms.map((l) => l.join(''))
  }

  // Cas par défaut : aucune permutation possible
  return [trimmed]
}

/**
 * Génère toutes les variantes équivalentes (commutatives) pour chaque fraction trouvée dans un texte.
 *
 * @param texte - Chaîne contenant des fractions LaTeX du type \dfrac{...}{...}.
 * @returns Un tableau de sous-tableaux : chaque sous-tableau contient les variantes d’une fraction donnée.
 * @example
 * genererVariantsParFraction("\\dfrac{GE}{GH}=\\dfrac{BF}{BK}")
 * // => [["\\dfrac{GE}{GH}", "\\dfrac{EG}{GH}", "\\dfrac{GE}{HG}", "\\dfrac{EG}{HG}"], ...]
 * @author Éric Elter
 */
function genererVariantsParFraction(texte: string): string[][] {
  const fractions = extraireFractions(texte)
  return fractions.map((f) => {
    const numVars = variantsFor(f.num)
    const denVars = variantsFor(f.den)
    const variants = new Set<string>()
    for (const nv of numVars) {
      for (const dv of denVars) {
        variants.add(`\\dfrac{${nv}}{${dv}}`)
      }
    }
    return Array.from(variants)
  })
}

/**
 * Inverse une fraction LaTeX du type \dfrac{num}{den}.
 *
 * @param fraction - Fraction LaTeX à inverser.
 * @returns La fraction inversée (\dfrac{den}{num}).
 * @example
 * inverserFraction("\\dfrac{GE}{GH}")
 * // => "\\dfrac{GH}{GE}"
 * @author Éric Elter
 */
function inverserFraction(fraction: string): string {
  const match = /\\dfrac\{([^}]*)\}\{([^}]*)\}/.exec(fraction)
  if (!match) return fraction
  const [, num, den] = match
  return `\\dfrac{${den}}{${num}}`
}

/**
 * Génère toutes les égalités triples possibles entre les fractions d'un texte,
 * y compris leurs inverses.
 * Chaque égalité relie une variante de chaque fraction, et peut inclure toutes les permutations d’ordre.
 *
 * @param texte - Chaîne contenant des fractions LaTeX du type \dfrac{...}{...}.
 * @param inclurePermutations - Si true, inclut aussi toutes les permutations d’ordre entre les fractions.
 * @returns Un tableau de chaînes représentant des égalités complètes de type "f1 = f2 = f3" et leurs inverses.
 * @example
 * genererToutesEgalites("\\dfrac{GE}{GH}=\\dfrac{BF}{BK}=\\dfrac{AB}{CD}", true)
 * // => ["\\dfrac{GE}{GH} = \\dfrac{BF}{BK} = \\dfrac{AB}{CD}", "\\dfrac{GH}{GE} = \\dfrac{BK}{BF} = \\dfrac{CD}{AB}", ...]
 * @throws Erreur si le texte contient moins de trois fractions.
 * @author Éric Elter
 */
function genererToutesEgalites(
  texte: string,
  inclurePermutations = false,
): string[] {
  const groupes = genererVariantsParFraction(texte)
  if (groupes.length < 3)
    throw new Error('Il faut au moins trois fractions dans le texte.')

  const egalites = new Set<string>()

  // Produit cartésien entre les 3 groupes
  for (const f1 of groupes[0]) {
    for (const f2 of groupes[1]) {
      for (const f3 of groupes[2]) {
        const base = [f1, f2, f3]
        const baseStr = base.join('=')
        egalites.add(baseStr)

        // Ajoute la version inverse (toutes les fractions inversées)
        const inverses = base.map(inverserFraction).join('=')
        egalites.add(inverses)

        if (inclurePermutations) {
          for (const perm of permutationsUnique(base)) {
            egalites.add(perm.join('='))
            const invPerm = perm.map(inverserFraction)
            egalites.add(invPerm.join('='))
          }
        }
      }
    }
  }

  return Array.from(egalites)
}

export default class RelationDeThales extends Exercice {
  level: number
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Configuration',
      3,
      '1 : Triangles imbriqués\n2 : Papillon\n3 : Mélange',
    ]

    this.nbQuestions = 1

    this.sup = 1 // Triangles imbriqués / configuration papillon / les 2
    this.level = 4
  }

  nouvelleVersion(numeroExercice: number) {
    let listeDeNomsDePolygones: string[] = []

    if (this.level === 4) {
      this.sup = 1
    }
    const premiereQuestionPapillon = randint(0, 1) // Pour alterner les configurations et savoir par laquelle on commence

    for (
      let i = 0, texte = '', texteCorr = '', cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // this.autoCorrection[i] = {}
      if (i % 3 === 0) {
        // Toutes les 3 questions, on repart à zéro sur les noms des polygones
        listeDeNomsDePolygones = ['QD']
      }
      const nomDesPoints = creerNomDePolygone(5, listeDeNomsDePolygones)
      listeDeNomsDePolygones.push(nomDesPoints)
      const nomA = nomDesPoints[0]
      const nomB = nomDesPoints[1]
      const nomC = nomDesPoints[2]
      const nomM = nomDesPoints[3]
      const nomN = nomDesPoints[4]
      const ab = randint(5, 10)
      const ac = randint(5, 10, ab)
      const bc = randint(Math.max(ab - ac, ac - ab) + 1, ab + ac - 1, [ab, ac]) // Pas de triangle isocèle ou équilatéral
      const A = pointAbstrait(0, 0, nomA)
      const B = pointAdistance(A, ab, nomB)
      const ABC = triangle2points2longueurs(A, B, ac, bc)
      ABC.id = `M2D_${numeroExercice}_${i}_1`
      const C = ABC.listePoints[2]
      C.nom = nomC
      let k = randint(3, 8, 5) / 10
      if (this.sup === 2) {
        k *= -1
      }
      if (this.sup === 3 && (i + premiereQuestionPapillon) % 2 === 0) {
        k *= -1
      }
      const M = homothetie(A, C, k)
      const N = homothetie(B, C, k)
      const MNC = polygone(M, N, C)
      MNC.id = `M2D_${numeroExercice}_${i}_2`
      const m = pointSurSegment(M, N, -0.5)
      const n = pointSurSegment(N, M, -0.5)
      const marqueNomM = texteParPoint(nomM, m, 0, 'black', 1, 'milieu', true)
      const marqueNomN = texteParPoint(nomN, n, 0, 'black', 1, 'milieu', true)
      const a = pointSurSegment(A, B, -0.5)
      const b = pointSurSegment(B, A, -0.5)
      const marqueNomA = texteParPoint(nomA, a, 0, 'black', 1, 'milieu', true)
      const marqueNomB = texteParPoint(nomB, b, 0, 'black', 1, 'milieu', true)
      let c
      if (k < 0) {
        if (angle(A, C, N) < angle(N, C, A)) {
          c = similitude(A, C, -angleOriente(A, C, N) / 2, 1 / longueur(A, C))
        } else {
          c = similitude(
            A,
            C,
            -angleOriente(N, C, A) / 2,
            (1 / longueur(A, C)) * 0.5,
          )
        }
      } else {
        c = similitude(
          A,
          C,
          -180 + angleOriente(A, C, B) / 2,
          (1 / longueur(A, C)) * 0.5,
        )
      }
      const marqueNomC = texteParPoint(nomC, c, 0, 'black', 1, 'milieu', true)

      texte = 'Sur la figure suivante : <br>'
      if (k > 0) {
        texte += `
         $\\leadsto ${nomM}$ est sur $${'[' + nomC + nomA + ']'}$,<br>
          $\\leadsto ${nomN}$ est sur $${'[' + nomC + nomB + ']'}$,<br> `
      } else {
        texte += `$\\leadsto$ les droites $(${nomA + nomM})$ et $(${nomB + nomN})$ sont sécantes en $${nomC}$,<br> `
      }

      texte += `$\\leadsto$ les droites $(${nomA + nomB})$ et $(${nomM + nomN})$ sont parallèles.<br>
      Écrire la double égalité de Thalès`
      if (this.interactif)
        texte +=
          ' : ' + ajouteChampTexteMathLive(this, i, KeyboardType.alphanumeric)
      else texte += '.<br>'

      texte += mathalea2d(
        {
          xmin: Math.min(A.x, B.x, C.x, M.x, N.x) - 1.5,
          ymin: Math.min(A.y, B.y, C.y, M.y, N.y) - 0.8,
          xmax: Math.max(A.x, B.x, C.x, M.x, N.x) + 1.5,
          ymax: Math.max(A.y, B.y, C.y, M.y, N.y) + 0.8,
          scale: 0.5,
        },

        ABC,
        MNC,
        marqueNomA,
        marqueNomB,
        marqueNomC,
        marqueNomM,
        marqueNomN,
      )

      const epaisseurTriangle = k < 0 ? 2 : 6 // En cas de configuration papillon il est inutile de changer l'épaisseur
      const boutonAideMathalea2d = ajouterBoutonMathalea2d(
        `${numeroExercice}_${i}`,
        `if (!document.getElementById('M2D_${numeroExercice}_${i}_1').dataset.colorie == true || (document.getElementById('M2D_${numeroExercice}_${i}_1').dataset.colorie == 'false')){
          document.getElementById('M2D_${numeroExercice}_${i}_1').style.stroke = '${bleuMathalea}';
          document.getElementById('M2D_${numeroExercice}_${i}_2').style.stroke = 'red';
          document.getElementById('M2D_${numeroExercice}_${i}_1').style.opacity = .5;
          document.getElementById('M2D_${numeroExercice}_${i}_1').style.strokeWidth = ${epaisseurTriangle};
          document.getElementById('M2D_${numeroExercice}_${i}_2').style.opacity = 1;
          document.getElementById('M2D_${numeroExercice}_${i}_2').style.strokeWidth = 2;
          document.getElementById('M2D_${numeroExercice}_${i}_1').dataset.colorie = true;
          document.getElementById('btnMathALEA2d_${numeroExercice}_${i}').classList.add('active');
        } else {
          document.getElementById('M2D_${numeroExercice}_${i}_1').style.stroke = 'black';
          document.getElementById('M2D_${numeroExercice}_${i}_2').style.stroke = 'black';
          document.getElementById('M2D_${numeroExercice}_${i}_1').style.opacity = 1;
          document.getElementById('M2D_${numeroExercice}_${i}_1').style.strokeWidth = 1;
          document.getElementById('M2D_${numeroExercice}_${i}_2').style.opacity = 1;
          document.getElementById('M2D_${numeroExercice}_${i}_2').style.strokeWidth = 1;
          document.getElementById('M2D_${numeroExercice}_${i}_1').dataset.colorie = false;
          document.getElementById('btnMathALEA2d_${numeroExercice}_${i}').classList.remove('active');
  
        }
        `,
        'Mettre en couleur les $2$ triangles',
      )

      if (k > 0) {
        texteCorr = `Dans le triangle $${nomA + nomB + nomC}$ :<br>
         $\\leadsto$ $${nomM}\\in${'[' + nomC + nomA + ']'}$,<br>
          $\\leadsto$ $${nomN}\\in${'[' + nomC + nomB + ']'}$,<br>
           $\\leadsto$  $(${nomA + nomB})${symboleParallele()}(${nomM + nomN})$,<br>
           donc d'après le théorème de Thalès, les triangles $${nomA + nomB + nomC}$ et $${nomM + nomN + nomC}$ ont des longueurs proportionnelles.`
      } else {
        texteCorr = `$\\leadsto$ Les droites $(${nomA + nomM})$ et $(${nomB + nomN})$ sont sécantes en $${nomC}$,<br>
         $\\leadsto$ les droites $(${nomA + nomB})$ et $(${nomM + nomN})$ sont parallèles,<br>
        donc d'après le théorème de Thalès, les triangles $${nomA + nomB + nomC}$ et $${nomM + nomN + nomC}$ ont des longueurs proportionnelles.`
      }
      texteCorr += '<br><br>'
      const relationDeThales = `\\dfrac{${nomC + nomM}}{${nomC + nomA}}=\\dfrac{${nomC + nomN}}{${nomC + nomB}}=\\dfrac{${nomM + nomN}}{${nomA + nomB}}`
      if (context.isHtml) {
        // Les couleurs repèrent les côtés ; la réponse mise en évidence reste exactement ce qui se saisit.
        texteCorr += `$\\dfrac{\\color{red}${nomC + nomM}}{\\color{blue}${nomC + nomA}}=\\dfrac{\\color{red}${nomC + nomN}}{\\color{blue}${nomC + nomB}}=\\dfrac{\\color{red}${nomM + nomN}}{\\color{blue}${nomA + nomB}}$<br>`
      }
      texteCorr += `$${miseEnEvidence(relationDeThales)}$`

      texteCorr += context.isHtml ? '<br>' : '\\medskip'
      texteCorr += `${texteGras('Remarque')}<br>On pourrait aussi écrire : `
      if (context.isHtml) {
        texteCorr += `$\\dfrac{\\color{blue}${nomC + nomA}}{\\color{red}${nomC + nomM}}=\\dfrac{\\color{blue}${nomC + nomB}}{\\color{red}${nomC + nomN}}=\\dfrac{\\color{blue}${nomA + nomB}}{\\color{red}${nomM + nomN}}$`
      } else {
        texteCorr += `$\\dfrac{${nomC + nomA}}{${nomC + nomM}}=\\dfrac{${nomC + nomB}}{${nomC + nomN}}=\\dfrac{${nomA + nomB}}{${nomM + nomN}}$`
      }
      const reponse = genererToutesEgalites(
        `\\dfrac{${nomC + nomA}}{${nomC + nomM}}=\\dfrac{${nomC + nomB}}{${nomC + nomN}}=\\dfrac{${nomA + nomB}}{${nomM + nomN}}`,
        true,
      )
      handleAnswers(this, i, {
        reponse: { value: reponse, options: { texteAvecCasse: true } },
      })
      if (context.isHtml) {
        texte += `<br><div style="display: inline-block;margin-top:20px;">${boutonAideMathalea2d}</div>`
      }

      if (this.questionJamaisPosee(i, ...nomDesPoints)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
