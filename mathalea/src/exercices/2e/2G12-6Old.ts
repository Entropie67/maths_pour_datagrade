import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait, PointAbstrait } from '../../lib/2d/PointAbstrait'
import { Segment, segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import type { TracePoint } from '../../lib/2d/TracePoint'
import { tracePoint } from '../../lib/2d/TracePoint'
import { homothetie, rotation, similitude } from '../../lib/2d/transformations'
import { ajouteQuestionMathlive } from '../../lib/interactif/questionMathLive'
import { Matrice } from '../../lib/mathFonctions/Matrice'
import { choisitLettresDifferentes } from '../../lib/outils/aleatoires'
import { choice } from '../../lib/outils/arrayOutils'
import type FractionEtendue from '../../modules/FractionEtendue'
import { fraction } from '../../modules/fractions'
import { mathalea2d } from '../../modules/mathalea2d'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = true

export const uuid = '2c20c'
export const titre =
  'Lire des coordonnées en repère orthogonal, normé ou quelconque'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @title Repérage 2e
 * @author Jean-claude Lhote
 * On se propose de lire des coordonnées dans un repère orthogonal, normé ou quelconque.
 * Une version de cet exercice en sens inverse est disponible sous le titre "Repérage 2e" (bis).
 */
export default class Reperage2e extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireTexte = [
      'Type de repère',
      [
        'Nombres séparés par des tirets  :',
        '1 : Orthogonal',
        '2 : Normé',
        '3 : Quelconque',
        '4 : Mélange',
      ].join('\n'),
    ]
    this.sup = '1'
    this.besoinFormulaire2CaseACocher = [
      'Présence de coordonnées fractionnaires',
      false,
    ]
    this.sup2 = false
    this.besoinFormulaire3Numerique = ['Nombre de points à trouver/placer', 3]
    this.sup3 = 3
    this.besoinFormulaire4CaseACocher = ['Papier pointé / Quadrillage', false]
    this.sup4 = false
    this.comment = `Exercice fait suite à une demande sur la forge de Carole Feugère.<br> Il y a trois types de repères, le premier est orthogonal mais pas normé, le deuxième est normé mais pas orthonormal, le troisième n'est ni normé ni orthogonal.<br>
    Les points à trouver sont choisis aléatoirement à coordonnées entières. On peut choisir le nombre de points à trouver de 1 à 3.`
  }

  nouvelleVersion() {
    const listeTypeDeReperes = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      melange: 4,
      nbQuestions: this.nbQuestions,
      defaut: 4,
    })
    const x: FractionEtendue[][] = []
    const y: FractionEtendue[][] = []
    const X: number[][] = []
    const Y: number[][] = []
    const noms: string[][] = []
    const points: PointAbstrait[][] = []
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      x[i] = []
      y[i] = []
      X[i] = []
      Y[i] = []
      points[i] = []
      noms[i] = []
      let coordsI: [number, number]
      let coordsK: [number, number]
      let matrice: Matrice
      let matriceInverse: Matrice | undefined
      const listeNoms = choisitLettresDifferentes(3 + this.sup3)
      const [labelI, labelK, labelO] = listeNoms.slice(0, 3)
      noms[i] = listeNoms.slice(3)
      const pointO = pointAbstrait(0, 0, labelO, 'below left')
      let compteur = 0
      do {
        switch (listeTypeDeReperes[i]) {
          case 1:
            coordsI = [choice([1.5, 2.5]), 0]
            coordsK = [0, choice([1, 2])]
            break
          case 2:
            {
              const I = similitude(
                pointAbstrait(randint(6, 8) * 0.2, 0),
                pointO,
                randint(-20, 20),
                1,
              )
              coordsI = [I.x, I.y]
              const K = similitude(
                pointAbstrait(...coordsI),
                pointO,
                randint(60, 80),
                1,
              )
              coordsK = [K.x, K.y]
            }
            break
          case 3:
          default:
            {
              coordsI = [1.5, randint(-4, 4, [0]) * 0.2]
              const K = similitude(
                pointAbstrait(...coordsI),
                pointO,
                randint(60, 80),
                choice([0.6, 0.7, 1.25, 1.3, 1.4]),
              )
              coordsK = [K.x, K.y]
            }
            break
        }
        matrice = new Matrice([
          [coordsI[0], coordsK[0]],
          [coordsI[1], coordsK[1]],
        ])
        matriceInverse = matrice.inverse()
        compteur++
      } while ((matrice == null || matriceInverse == null) && compteur < 100)
      if (matrice == null || matriceInverse == null) {
        throw new Error(
          "La matrice de passage n'est pas inversible après 100 tentatives. Problème dans le code.",
        )
      }
      const pointI = pointAbstrait(coordsI[0], coordsI[1], labelI, 'below')
      const pointK = pointAbstrait(coordsK[0], coordsK[1], labelK, 'left')
      const traceRep = tracePoint(pointO, pointI, pointK)
      traceRep.style = '.'
      traceRep.epaisseur = 2
      const IPrime = homothetie(pointI, pointO, 4)
      const KPrime = homothetie(pointK, pointO, 3)
      const INeg = rotation(IPrime, pointO, 180)
      const KNeg = rotation(KPrime, pointO, 180)
      const OI = segment(INeg, homothetie(IPrime, pointO, 1.05))
      OI.epaisseur = 1.5
      OI.styleExtremites = '->'
      const OK = segment(KNeg, homothetie(KPrime, pointO, 1.1))
      OK.epaisseur = 1.5
      OK.styleExtremites = '->'
      const grid: (PointAbstrait | Segment)[] = []
      /*
      Construire la grille
      */
      let denX: number = 1
      let denY: number = 1
      if (this.sup2) {
        denX = choice([1, 2, 3])
        denY = choice([1, 2, 3], [denX])
      }
      for (let xx = -4; xx < 4 + 1 / denX; xx += 1 / denX) {
        if (this.sup4) {
          const pointL = pointAbstrait(
            ...(matrice.multiply([xx, -3]) as [number, number]),
          )
          const pointH = pointAbstrait(
            ...(matrice.multiply([xx, 3]) as [number, number]),
          )
          if (Math.abs(xx) > 0.01) grid.push(segment(pointL, pointH))
        }
        for (let yy = -3; yy < 3 + 1 / denY; yy += 1 / denY) {
          if (this.sup4 && xx === -4) {
            const pointL = pointAbstrait(
              ...(matrice.multiply([-4, yy]) as [number, number]),
            )
            const pointH = pointAbstrait(
              ...(matrice.multiply([4, yy]) as [number, number]),
            )
            if (Math.abs(yy) > 0.01) grid.push(segment(pointL, pointH))
          }
          if (!this.sup4) {
            // Si pas de grille, on fait des points et on ajoute des ticks sur les axes.
            if (Math.abs(xx) > 0.1 && Math.abs(yy) > 0.1) {
              grid.push(
                pointAbstrait(
                  ...(matrice.multiply([xx, yy]) as [number, number]),
                ),
              )
            } else {
              const [x, y] = matrice.multiply([xx, yy]) as [number, number]
              if (Math.abs(x) < 0.1) {
                // On est sur l'axe des ordonnées
                const s = segment(x - 0.1, y, x + 0.1, y)
                s.epaisseur = 1.5
                if (Math.abs(y) > 0.1) grid.push(s)
              }
              if (Math.abs(y) < 0.1) {
                // On est sur l'axe des abscisses
                const s = segment(x, y - 0.1, x, y + 0.1)
                s.epaisseur = 1.5
                if (Math.abs(x) > 0.1) grid.push(s)
              }
            }
          }
        }
      }
      const dots = this.sup4
        ? grid
        : tracePoint(...grid.filter((el) => el instanceof PointAbstrait))
      const ticks = this.sup4 ? [] : grid.filter((el) => el instanceof Segment)
      if (this.sup4) {
        for (const el of dots as Segment[]) {
          el.styleExtremites = '-'
          el.epaisseur = 0.5
          el.color = colorToLatexOrHTML('gray')
          el.opacite = 0.6
        }
      } else {
        ;(dots as TracePoint).style = '.'
        ;(dots as TracePoint).epaisseur = 0.4
        ;(dots as TracePoint).opacite = 0.6
        ;(dots as TracePoint).color = colorToLatexOrHTML('gray')
      }

      for (let k = 0; k < this.sup3; k++) {
        do {
          x[i][k] = fraction(randint(-3 * denX, 3 * denX), denX)
          y[i][k] = fraction(randint(-2 * denY, 2 * denY), denY)
        } while (
          (x[i][k].isEqual(0) && y[i][k].isEqual(1)) ||
          (x[i][k].isEqual(1) && y[i][k].isEqual(0)) ||
          (x[i][k].isEqual(0) && y[i][k].isEqual(0)) ||
          (x[i]
            .slice(0, k)
            .map((el) => el.num)
            .includes(x[i][k].num) &&
            y[i]
              .slice(0, k)
              .map((el) => el.num)
              .includes(y[i][k].num))
        )
        const [mdx, mdy] = matrice.multiply([
          x[i][k].valeurDecimale,
          y[i][k].valeurDecimale,
        ]) as [number, number]
        X[i][k] = mdx
        Y[i][k] = mdy
        points[i][k] = pointAbstrait(
          mdx,
          mdy,
          listeNoms[3 + k],
          `${
            x[i][k].valeurDecimale < 0
              ? y[i][k].valeurDecimale < 0
                ? 'below left'
                : 'above left'
              : y[i][k].valeurDecimale
                ? 'below right'
                : 'above right'
          }`,
        )
      }
      const traces = tracePoint(...points[i])
      traces.style = 'x'
      traces.epaisseur = 2
      traces.color = colorToLatexOrHTML('black')
      const labels = labelPoint(pointO, pointI, pointK, ...points[i])
      const objets = [traces, traceRep, labels, OI, OK, dots, ticks]
      let question = mathalea2d(
        Object.assign({ scale: 0.5 }, fixeBordures(objets)),
        objets,
      )

      question += `Quelles sont les coordonnées des points $${noms[i].join('$, $')}$ dans le repère $(${labelO},${labelI},${labelK})$ ?<br>`
      if (this.interactif) {
        question += noms[i]
          .map(
            (el, k) =>
              `Coordonnées de $${el}$ : ${ajouteQuestionMathlive({
                exercice: this,
                question: i * this.sup3 + k,
                typeInteractivite: 'fillInTheBlank',
                // objetReponse: { champ1: { value: x[i][k].texFractionSimplifiee, options: { nombreDecimalSeulement: true } }, champ2: { value: y[i][k].texFractionSimplifiee, options: { nombreDecimalSeulement: true } }, bareme: (listePoints: number[]) => [Math.min(...listePoints), 1] },
                objetReponse: {
                  champ1: { value: x[i][k].texFractionSimplifiee },
                  champ2: { value: y[i][k].texFractionSimplifiee },
                  bareme: (listePoints: number[]) => [
                    Math.min(...listePoints),
                    1,
                  ],
                },
                reponseParams: { formatInteractif: 'fill-in-the-blank' },
                content: '(%{champ1}~~;~~%{champ2})',
              })}`,
          )
          .join('<br>')
      } else {
        question += noms[i]
          .map((el) => `Coordonnées de $${el}$ : $(\\ldots~~;~~\\ldots)$`)
          .join('<br>')
      }
      const reponse = `Dans le repère $(${labelO},${labelI},${labelK})$ sont :<br>
            $${points[i].map((p, k) => `${listeNoms[k + 3]}(${x[i][k].texFractionSimplifiee};${y[i][k].texFractionSimplifiee})`).join(', ')}$`
      if (
        this.questionJamaisPosee(
          i,
          X[i].join(),
          Y[i].join(),
          coordsI.join(),
          coordsK.join(),
        )
      ) {
        this.listeQuestions[i] = question
        this.listeCorrections[i] = reponse
        i++
      }
      cpt++
    }
  }
}
