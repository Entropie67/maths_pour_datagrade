import { arcPointPointAngle } from '../../lib/2d/Arc'
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { crochetD, crochetG } from '../../lib/2d/intervalles'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { texteParPosition } from '../../lib/2d/textes'
import { bleuMathalea } from '../../lib/colors'
import { lampeMessage } from '../../lib/format/message'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { ecritureAlgebrique } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Résoudre une équation ou une inéquation avec une valeur absolue'
export const interactifReady = true
export const interactifType = 'mathLive'

/**
 * Résoudre |x-a| = r, |x-a| < r, |x-a| ≤ r, |x-a| > r ou |x-a| ≥ r
 * en interprétant |x-a| comme la distance entre x et a.
 * @author Stéphane Guyon (version initiale), Arnaud Meistermann
 */
export const dateDeModifImportante = '02/10/2026'

export const uuid = '1380e'

export const refs = {
  'fr-fr': ['2N13-2'],
  'fr-ch': [],
}

type Symbole = '=' | '<' | '\\leqslant' | '>' | '\\geqslant'

const phraseDistance: Record<Symbole, string> = {
  '=': 'égale à',
  '<': 'strictement inférieure à',
  '\\leqslant': 'inférieure ou égale à',
  '>': 'strictement supérieure à',
  '\\geqslant': 'supérieure ou égale à',
}

/**
 * Droite graduée (non proportionnelle) : a au centre, a-r et a+r de part et d'autre,
 * flèches arrondies de longueur r, crochets et hachures sur l'ensemble solution.
 */
function droiteSolution(a: number, r: number, symbole: Symbole) {
  const xG = 3
  const xA = 6
  const xD = 9
  const yFleche = 0.6
  const objets = []

  const axe = segment(pointAbstrait(0, 0), pointAbstrait(12, 0))
  axe.styleExtremites = '->'
  objets.push(axe)

  for (const [x, valeur] of [
    [xG, a - r],
    [xA, a],
    [xD, a + r],
  ]) {
    objets.push(
      segment(pointAbstrait(x, -0.15), pointAbstrait(x, 0.15)),
      texteParPosition(`$${valeur}$`, x, -0.7),
    )
  }

  // Flèches arrondies de a vers a-r et a+r
  for (const xFin of [xG, xD]) {
    const sens = xFin > xA ? 1 : -1
    const depart = pointAbstrait(xA + 0.15 * sens, yFleche)
    const fin = pointAbstrait(xFin, yFleche)
    objets.push(arcPointPointAngle(depart, fin, -90 * sens, false, 'none'))
    // La tangente en l'extrémité fait un angle de 45° avec l'horizontale
    const angleTangente = sens === 1 ? -Math.PI / 4 : (-3 * Math.PI) / 4
    for (const ecart of [-0.45, 0.45]) {
      const angle = angleTangente + Math.PI + ecart
      objets.push(
        segment(
          fin,
          pointAbstrait(
            xFin + 0.3 * Math.cos(angle),
            yFleche + 0.3 * Math.sin(angle),
          ),
        ),
      )
    }
    objets.push(
      texteParPosition(
        `$${sens === 1 ? '+' : '-'}${r}$`,
        (xA + xFin) / 2,
        yFleche + 1,
      ),
    )
  }

  // Ensemble solution : crochets et hachures (crochetD trace « [ », crochetG trace « ] »)
  const hachure = (x1: number, x2: number) => {
    const p = polygone(
      pointAbstrait(x1, 0),
      pointAbstrait(x2, 0),
      pointAbstrait(x2, 0.3),
      pointAbstrait(x1, 0.3),
    )
    p.color = colorToLatexOrHTML(bleuMathalea)
    p.hachures = 'north east lines'
    p.couleurDesHachures = colorToLatexOrHTML(bleuMathalea)
    p.distanceDesHachures = 6
    return p
  }
  const G = pointAbstrait(xG, 0, '')
  const D = pointAbstrait(xD, 0, '')
  switch (symbole) {
    case '=':
      for (const x of [xG, xD]) {
        objets.push(
          segment(
            pointAbstrait(x - 0.15, -0.15),
            pointAbstrait(x + 0.15, 0.15),
            bleuMathalea,
          ),
          segment(
            pointAbstrait(x - 0.15, 0.15),
            pointAbstrait(x + 0.15, -0.15),
            bleuMathalea,
          ),
        )
      }
      break
    case '<':
      objets.push(hachure(xG, xD), crochetG(G), crochetD(D))
      break
    case '\\leqslant':
      objets.push(hachure(xG, xD), crochetD(G), crochetG(D))
      break
    case '>':
      objets.push(hachure(0, xG), hachure(xD, 11.6), crochetD(G), crochetG(D))
      break
    case '\\geqslant':
      objets.push(hachure(0, xG), hachure(xD, 11.6), crochetG(G), crochetD(D))
      break
  }
  return mathalea2d(
    {
      xmin: -0.5,
      xmax: 12.5,
      ymin: -1.2,
      ymax: 2.1,
      pixelsParCm: 30,
      scale: 0.7,
    },
    objets,
  )
}

export default class ValeurAbsolueEtDistance extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets  :',
        '1 : $|x-a| = r$',
        '2 : $|x-a| < r$ ou $|x-a| \\leqslant r$',
        '3 : $|x-a| > r$ ou $|x-a| \\geqslant r$',
        '4 : Mélange',
      ].join('\n'),
    ]
    this.sup = 4
    this.besoinFormulaire2CaseACocher = [
      'Inclure des cas où $r \\leqslant 0$',
      false,
    ]
    this.sup2 = false
  }

  nouvelleVersion() {
    const typesDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: this.nbQuestions,
    })
    const avecEquation = typesDeQuestions.includes(1)
    const avecInequation = typesDeQuestions.some((t) => t !== 1)
    const pluriel = this.nbQuestions > 1
    this.consigne = `Résoudre, dans $\\mathbb{R}$, ${
      avecEquation && avecInequation
        ? pluriel
          ? 'les équations et inéquations suivantes'
          : "l'équation ou l'inéquation suivante"
        : avecEquation
          ? pluriel
            ? 'les équations suivantes'
            : "l'équation suivante"
          : pluriel
            ? 'les inéquations suivantes'
            : "l'inéquation suivante"
    }.`

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const type = typesDeQuestions[i]
      const large = choice([true, false])
      const symbole: Symbole =
        type === 1
          ? '='
          : type === 2
            ? large
              ? '\\leqslant'
              : '<'
            : large
              ? '\\geqslant'
              : '>'
      const a = randint(-9, 9, 0)
      let r = randint(1, 9)
      if (this.sup2 && randint(1, 4) === 1) r = choice([0, -randint(1, 9)])

      const valeurAbsolue = `|x${ecritureAlgebrique(-a)}|`
      let texte = `$${valeurAbsolue} ${symbole} ${r}$`
      let texteCorr = ''
      let reponse: string
      let autreReponse: string | undefined

      texteCorr = lampeMessage({
        titre: 'Rappel :',
        texte:
          'Pour tous réels $a$ et $b$, $|b-a|$ est la distance entre $a$ et $b$ sur une droite graduée.',
      })
      // On fait apparaître la forme |x-a| quand a est négatif
      if (a < 0) {
        texteCorr += `$${valeurAbsolue} ${symbole} ${r} \\iff |x-(${a})| ${symbole} ${r}$<br>`
      }
      const formeDistance = a < 0 ? `|x-(${a})|` : valeurAbsolue
      texteCorr += `$${formeDistance} ${symbole} ${r}$ signifie que la distance entre $x$ et $${a}$ est ${phraseDistance[symbole]} $${r}$.<br>`

      if (r > 0) {
        texteCorr += droiteSolution(a, r, symbole)
        texteCorr += `Les nombres situés à une distance $${r}$ de $${a}$ sont $${a}-${r}=${a - r}$ et $${a}+${r}=${a + r}$.<br>`
        switch (symbole) {
          case '=':
            reponse = `\\{${a - r};${a + r}\\}`
            break
          case '<':
            reponse = `]${a - r}\\,;\\,${a + r}[`
            break
          case '\\leqslant':
            reponse = `[${a - r}\\,;\\,${a + r}]`
            break
          case '>':
            reponse = `]-\\infty\\,;\\,${a - r}[\\cup]${a + r}\\,;\\,+\\infty[`
            break
          case '\\geqslant':
            reponse = `]-\\infty\\,;\\,${a - r}]\\cup[${a + r}\\,;\\,+\\infty[`
            break
        }
        if (symbole === '<' || symbole === '>') {
          texteCorr += `L'inégalité est stricte : les nombres situés exactement à une distance $${r}$ de $${a}$ ne sont pas solutions, donc $${a - r}$ et $${a + r}$ sont exclus et les crochets sont ouverts en ces valeurs.<br>`
        } else if (symbole !== '=') {
          texteCorr += `L'inégalité est large : les nombres situés exactement à une distance $${r}$ de $${a}$ sont solutions, donc $${a - r}$ et $${a + r}$ sont inclus et les crochets sont fermés en ces valeurs.<br>`
        }
      } else if (r < 0) {
        texteCorr += 'Or une distance est toujours positive ou nulle.<br>'
        if (['=', '<', '\\leqslant'].includes(symbole)) {
          reponse = '\\emptyset'
        } else {
          texteCorr += 'Tous les nombres réels conviennent.<br>'
          reponse = '\\mathbb{R}'
          autreReponse = ']-\\infty\\,;\\,+\\infty['
        }
      } else {
        switch (symbole) {
          case '=':
            texteCorr += `Or le seul nombre situé à une distance nulle de $${a}$ est $${a}$ lui-même.<br>`
            reponse = `\\{${a}\\}`
            break
          case '\\leqslant':
            texteCorr += `Or une distance est toujours positive ou nulle, donc elle est inférieure ou égale à $0$ seulement si elle est nulle, c'est-à-dire pour $x=${a}$.<br>`
            reponse = `\\{${a}\\}`
            break
          case '<':
            texteCorr +=
              "Or une distance est toujours positive ou nulle, elle n'est donc jamais strictement inférieure à $0$ : aucun nombre ne convient.<br>"
            reponse = '\\emptyset'
            break
          case '\\geqslant':
            texteCorr +=
              'Or une distance est toujours positive ou nulle : tous les nombres réels conviennent.<br>'
            reponse = '\\mathbb{R}'
            autreReponse = ']-\\infty\\,;\\,+\\infty['
            break
          case '>':
          default:
            texteCorr += `Or une distance est toujours positive ou nulle : toutes les valeurs de $x$ conviennent, sauf quand la distance entre $x$ et $${a}$ est nulle, c'est-à-dire pour $x=${a}$.<br>`
            reponse = `\\mathbb{R}\\backslash\\{${a}\\}`
            // Écriture équivalente acceptée en interactif
            autreReponse = `]-\\infty\\,;\\,${a}[\\cup]${a}\\,;\\,+\\infty[`
            break
        }
      }
      texteCorr += `On en déduit $S=${miseEnEvidence(reponse)}$.`

      if (this.interactif) {
        texte += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierEnsemble,
          { texteAvant: '<br>$S=$' },
        )
      }
      handleAnswers(this, i, {
        reponse: {
          value: autreReponse ? [autreReponse, reponse] : reponse,
          options:
            symbole === '='
              ? { ensembleDeNombres: true }
              : { intervalle: true },
        },
      })

      if (this.questionJamaisPosee(i, a, r, symbole)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
