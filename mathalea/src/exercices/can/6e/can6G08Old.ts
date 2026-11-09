import { colorToLatexOrHTML } from '../../../lib/2d/colorToLatexOrHtml'
import { droite } from '../../../lib/2d/droites'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { latex2d, type Latex2d } from '../../../lib/2d/textes'
import { TracePoint } from '../../../lib/2d/TracePoint'
import { symetrieAxiale } from '../../../lib/2d/transformations'
import { bleuMathalea } from '../../../lib/colors'
import { ajouteQuestionMathlive } from '../../../lib/interactif/questionMathLive'
import { choisitNombresEntreMetN } from '../../../lib/outils/aleatoires'
import { shuffle } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { range } from '../../../lib/outils/nombres'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
} from '../../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../../types/2d'
import Exercice from '../../Exercice'

export const titre = 'Trouver le symétrique'
export const dateDePublication = '03/05/2025'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * Symétrie axiale sur papier pointé
 * Ref can6G1-03
 * @author Jean-claude Lhote
 * Publié le 03/05/2025
 */
export const uuid = '85dfc'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

export default class TrouverLeSym extends Exercice {
  croix: TracePoint[] = []

  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireTexte = [
      'Axes de symétrie',
      'Nombres séparé par des tirets :\n1 : Vertical\n2 : Horizontal\n3 : Oblique 1\n4 : Oblique 2\n5 : Mélange',
    ]
    this.sup = '1'
    this.besoinFormulaire2Numerique = ['Nombre de points à afficher', 3]
    this.sup2 = 1
    this.besoinFormulaire3CaseACocher = ['Numéros dans le désordre', false]
    this.sup3 = false
    this.croix = []
    for (let i = 0; i < 49; i++) {
      const x = i % 7
      const y = Math.floor(i / 7)
      const trace = new TracePoint(pointAbstrait(x, y))
      trace.taille = context.isHtml ? 2 : 1
      this.croix.push(trace)
    }
  }

  nouvelleVersion() {
    const typeAxe = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 4,
      melange: 5,
      nbQuestions: this.nbQuestions,
      defaut: 1,
    }).map(Number)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      // on remet à vide tous les tableaux utilisés pour la question suivante
      let indexNumerosChoisis: number[] = []
      const numerosAEviter =
        typeAxe[i] === 1
          ? [
              3, 10, 17, 24, 31, 38, 45, 0, 7, 14, 21, 28, 35, 42, 6, 13, 20,
              27, 34, 41, 48,
            ]
          : typeAxe[i] === 2
            ? [
                21, 22, 23, 24, 25, 26, 27, 0, 1, 2, 3, 4, 5, 6, 42, 43, 44, 45,
                46, 47, 48,
              ]
            : typeAxe[i] === 3
              ? [35, 42, 43, 5, 6, 13]
              : [0, 1, 7, 41, 47, 48]

      indexNumerosChoisis = choisitNombresEntreMetN(
        0,
        48,
        this.sup2,
        numerosAEviter,
      )
      const numeros = this.sup3 ? shuffle(range(49)) : range(49)
      const nums: Latex2d[] = []
      for (let j = 0; j < 49; j++) {
        nums.push(
          latex2d(`${numeros[j]}`, (j % 7) - 0.2, Math.floor(j / 7) - 0.2, {
            letterSize: 'scriptsize',
          }),
        )
      }
      const numerosChoisis = indexNumerosChoisis.map((n) => numeros[n])
      const d =
        typeAxe[i] === 1
          ? droite(pointAbstrait(3, 0), pointAbstrait(3, 6))
          : typeAxe[i] === 2
            ? droite(pointAbstrait(0, 3), pointAbstrait(6, 3))
            : typeAxe[i] === 3
              ? droite(pointAbstrait(0, 0), pointAbstrait(6, 6))
              : droite(pointAbstrait(0, 6), pointAbstrait(6, 0))
      d.color = colorToLatexOrHTML(bleuMathalea)
      d.epaisseur = 2
      const numerosSymChoisis: number[] = []
      for (let j = 0; j < this.sup2; j++) {
        const n = indexNumerosChoisis[j]
        let m: number
        if (typeAxe[i] === 1) {
          const milieu = 3 + Math.floor(n / 7) * 7
          m = 2 * milieu - n
          numerosSymChoisis.push(numeros[m])
        } else if (typeAxe[i] === 2) {
          const milieu = 21 + (n % 7)
          m = 2 * milieu - n
          numerosSymChoisis.push(numeros[m])
        } else if (typeAxe[i] === 3) {
          const x = n % 7
          const y = Math.floor(n / 7)
          const yy = x
          const xx = y
          m = 7 * yy + xx
          numerosSymChoisis.push(numeros[m])
        } else {
          const x = n % 7
          const y = Math.floor(n / 7)
          const yy = 6 - x
          const xx = 6 - y
          m = 7 * yy + xx
          numerosSymChoisis.push(numeros[m])
        }
      }
      let questionInteractive = ''
      for (let j = 0; j < this.sup2; j++) {
        questionInteractive += `Quel est le numéro du symétrique du point $${numerosChoisis[j]}$ par rapport à $(d)$ ?
         ${ajouteQuestionMathlive({
           exercice: this,
           question: this.sup * i + j,
           typeInteractivite: 'mathlive',
           reponseParams: { formatInteractif: 'mathalea-mathfield' },
           objetReponse: { reponse: { value: numerosSymChoisis[j] } },
         })}<br>`
      }
      let texte = this.interactif
        ? questionInteractive
        : `Donner ${this.sup2 > 1 ? 'les' : 'le'} symétrique${this.sup2 > 1 ? 's' : ''} ${this.sup2 > 1 ? 'des' : 'du'} point${this.sup2 > 1 ? 's' : ''} ${numerosChoisis.map((n) => `$${n}$`).join(', ')} par rapport à $(d)$.<br>`
      const objetsEnonce: NestedObjetMathalea2dArray = [this.croix, nums, d]
      const objetsCorrection: NestedObjetMathalea2dArray = [this.croix, nums, d]
      const pointsChoisis = []
      for (let j = 0; j < this.sup2; j++) {
        const n = indexNumerosChoisis[j]
        const x = n % 7
        const y = Math.floor(n / 7)
        const p = pointAbstrait(x, y)
        const pSym = symetrieAxiale(p, d)
        pointsChoisis.push([x, y])
        const pAffiche = new TracePoint(p)
        pAffiche.epaisseur = 3
        pAffiche.taille = context.isHtml ? 3 : 2
        pAffiche.color = colorToLatexOrHTML('black')
        objetsEnonce.push(pAffiche)
        objetsCorrection.push(pAffiche)
        const pSymAffiche = new TracePoint(pSym)
        pSymAffiche.epaisseur = 3
        pSymAffiche.taille = context.isHtml ? 3 : 2
        pSymAffiche.color = colorToLatexOrHTML('orange')
        objetsCorrection.push(pSymAffiche)
      }
      texte += mathalea2d(
        {
          xmin: -0.5,
          ymin: -0.5,
          xmax: 6.5,
          ymax: 6.5,
          scale: 1,
          pixelsParCm: 40,
        },
        ...objetsEnonce,
      )
      let texteCorr = `${this.sup2 > 1 ? 'Les' : 'Le'} symétrique${this.sup2 > 1 ? 's' : ''} ${this.sup2 > 1 ? 'des' : 'du'} point${this.sup2 > 1 ? 's' : ''} ${numerosChoisis.map((n) => `$${n}$`).join(', ')} par rapport à $(d)$ ${this.sup2 > 1 ? 'sont' : 'est'} ${numerosSymChoisis.map((el) => `$${miseEnEvidence(`${numeros[el]}`)}$`).join(', ')}.<br>`
      texteCorr += mathalea2d(
        {
          xmin: -0.5,
          ymin: -0.5,
          xmax: 6.5,
          ymax: 6.5,
          scale: 1,
          pixelsParCm: 40,
        },
        ...objetsEnonce,
        ...objetsCorrection,
      )
      if (
        this.questionJamaisPosee(
          i,
          numerosChoisis.sort((a, b) => a - b).join('-'),
        )
      ) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
