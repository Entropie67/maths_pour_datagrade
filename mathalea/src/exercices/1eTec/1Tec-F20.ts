import { addCliqueFigure } from '../../lib/customElements/CliqueFigureElement'
import Decimal from 'decimal.js'
import { courbe } from '../../lib/2d/Courbe'
import { repere } from '../../lib/2d/reperes'
import { bleuMathalea } from '../../lib/colors'
import { Polynome } from '../../lib/mathFonctions/Polynome'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { rienSi1 } from '../../lib/outils/ecritures'
import { miseEnEvidence, texteGras } from '../../lib/outils/embellissements'
import { range } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const dateDePublication = '28/02/2026'
export const dateDeModifImportante = '08/11/2026'
export const titre =
  'Associer une parabole à une expression algébrique de degré $2$'
/**
 * @author Jordan Martin
 */
export const uuid = 'e297b'

export const refs = {
  'fr-fr': ['1Tec-F21'],
  'fr-ch': [],
}

export const interactifReady = true

export default class ExpressionAParabole extends Exercice {
  // Type d'expressions fournie par le menu
  public typePolynome = {
    monome: 1,
    monomeEtConstante: 2,
    deuxRacines: 3,
  }

  // Amplitude de la fenetre
  private amplitude = {
    x: 5,
    y: 10,
  }

  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireTexte = [
      "Types d'expression",
      `Nombres séparés par des tirets\n1 : $ax^2$\n2 : $ax^2 + c$\n3 : $a(x-r_1)(x-r_2)$\n4 : Mélange`,
    ]
    this.sup = 4
  }

  nouvelleVersion() {
    this.cliqueFiguresArray = []

    // Gestion du choix du type d'expression
    const expressionsPossibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      defaut: 1,
      melange: 4,
      nbQuestions: this.nbQuestions,
    })

    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const choixExpression = expressionsPossibles[i]
      // Coef dominant
      const coefDominant = new Decimal(randint(-12, 12, [0, 1, 2]))
        .div(10)
        .toNumber()
      const coefDominantTexte = texNombre(coefDominant)
      const finId = `Ex${this.numeroExercice}Q${i}`
      const id0 = `cliquefigure0` + finId
      const id1 = `cliquefigure1` + finId
      const id2 = `cliquefigure2` + finId
      const id3 = `cliquefigure3` + finId
      let expressionLatex = ''
      let grapheCorrect = ''
      let graphePourCorrection = ''
      let grapheErr2 = ''
      let grapheErr3 = ''
      texteCorr = ''
      let polynome = new Polynome({ coeffs: [0] })

      // Premier graphe erroné : affine ou polynome degré 3
      const erreur1 = this.affineOuPoly3({ id: id1 })
      const grapheErr1 = erreur1.graphe

      // Distinguer le cas ax², ax²+c et a(x-r_1)(x-r_2)
      switch (choixExpression) {
        // Cas ax²
        case this.typePolynome.monome: {
          polynome = new Polynome({ coeffs: [0, 0, coefDominant] })
          expressionLatex = polynome.toLatex()
          const fenetre = this.reglerFenetrePoly2(coefDominant, 0, 0)
          grapheCorrect = this.genererGraphique(
            Object.assign({ fonction: polynome.fonction, id: id0 }, fenetre),
          )
          graphePourCorrection = this.genererGraphique(
            Object.assign({ fonction: polynome.fonction }, fenetre),
          )
          // Gestion du graphe erroné 2 : signe du coefficient dominant mal interprété
          const erreur2 = this.erreurCoefDominantOpposé({
            polynome,
            typePoly: choixExpression,
            id: id2,
          })
          grapheErr2 = erreur2.graphe
          // Gestion du graphe erroné 3 : décalage vertical
          const erreur3 = this.erreurDecalageVertical({
            polynome,
            decalage: randint(-3, 3, [0]),
            id: id3,
          })
          grapheErr3 = erreur3.graphe
          // Correction
          texteCorr = `L'expression de $f$ est celle d'une fonction polynôme de degré $2$ dont la représentation graphique est une ${texteGras('parabole')} ayant pour axe de symétrie l'axe des ordonnées.<br>`
          let signeCoef, orientation, minMax
          if (coefDominant > 0) {
            signeCoef = texteGras('positif')
            orientation = texteGras('haut')
            minMax = texteGras('minimum')
          } else {
            signeCoef = texteGras('négatif')
            orientation = texteGras('bas')
            minMax = texteGras('maximum')
          }
          texteCorr += `Le coefficient dominant est ${signeCoef} : $${miseEnEvidence(coefDominantTexte)}$. Les branches de la parabole sont donc orientées vers le ${orientation}.<br>`
          texteCorr += `Le ${minMax} de $f$ est atteint en $0$ et vaut $${miseEnEvidence(0)}$.<br>`
          texteCorr += `La bonne représentation graphique est :<br>${graphePourCorrection}`
          break
        }
        // Cas /ax²+c
        case this.typePolynome.monomeEtConstante: {
          const coefConstant = randint(-3, 3, [0])
          polynome = new Polynome({
            coeffs: [coefConstant, 0, coefDominant],
          })
          expressionLatex = polynome.toLatex()
          const fenetre = this.reglerFenetrePoly2(coefDominant, 0, coefConstant)
          grapheCorrect = this.genererGraphique(
            Object.assign({ fonction: polynome.fonction, id: id0 }, fenetre),
          )
          graphePourCorrection = this.genererGraphique(
            Object.assign({ fonction: polynome.fonction }, fenetre),
          )
          // Gestion du graphe erroné 2 : signe du coefficient dominant mal interprété
          const erreur2 = this.erreurCoefDominantOpposé({
            polynome,
            typePoly: choixExpression,
            id: id2,
          })
          grapheErr2 = erreur2.graphe

          // Graphe erroné 3 : même coefficient dominant mais coefficient décalage vertical ou horizontal
          const erreur3 = this.erreurDecalage({
            polynome,
            decalage: coefConstant,
            id: id3,
          })
          grapheErr3 = erreur3.graphe
          // Correction
          texteCorr = `L'expression de $f$ est celle d'une fonction polynôme de degré $2$ dont la représentation graphique est une ${texteGras('parabole')} ayant pour axe de symétrie l'axe des ordonnées.<br>`
          let signeCoef, orientation, minMax
          if (coefDominant > 0) {
            signeCoef = texteGras('positif')
            orientation = texteGras('haut')
            minMax = texteGras('minimum')
          } else {
            signeCoef = texteGras('négatif')
            orientation = texteGras('bas')
            minMax = texteGras('maximum')
          }
          texteCorr += `Le coefficient dominant est ${signeCoef} : $${miseEnEvidence(coefDominantTexte)}$. Les branches de la parabole sont donc orientées vers le ${orientation}.<br>`
          texteCorr += `Le ${minMax} de $f$ est atteint en $0$ et vaut $${miseEnEvidence(coefConstant)}$.<br>`
          texteCorr += `La bonne représentation graphique est :<br>${graphePourCorrection}`
          break
        }
        // Cas a(x-r_1)(r-r_2)
        case this.typePolynome.deuxRacines: {
          const racine1 = randint(-4, 4)
          const racine2 = randint(-4, 4, [0])
          // (x - r_1) et (x - r_2)
          const polynome1 = new Polynome({ coeffs: [-racine1, 1] })
          const polynome2 = new Polynome({ coeffs: [-racine2, 1] })
          polynome = polynome1.multiply(polynome2).multiply(coefDominant)
          // Exression
          expressionLatex = this.gererExpressionDeuxRacines(
            coefDominant,
            racine1,
            racine2,
          )
          // Graphe
          const absSommet = new Decimal(racine1 + racine2).div(2).toNumber()
          const extremum = polynome.fonction(absSommet)
          const fenetre = this.reglerFenetrePoly2(
            coefDominant,
            absSommet,
            extremum,
          )
          grapheCorrect = this.genererGraphique(
            Object.assign({ fonction: polynome.fonction, id: id0 }, fenetre),
          )
          graphePourCorrection = this.genererGraphique(
            Object.assign({ fonction: polynome.fonction }, fenetre),
          )
          // Gestion du graphe erroné 2 : signe du coefficient dominant mal interprété
          const erreur2 = this.erreurCoefDominantOpposé({
            polynome,
            typePoly: choixExpression,
            absSommet,
            id: id2,
          })
          grapheErr2 = erreur2.graphe
          // Graphe erroné 3 : une racine changée ou les deux racines opposées
          const erreur3 = this.erreurRacines({
            polynome,
            racine1,
            racine2,
            id: id3,
          })
          grapheErr3 = erreur3.graphe
          // Correction
          texteCorr = `L'expression développée de $f$ est $${polynome.toLatex()}$.<br>C'est l'expression d'une fonction polynôme de degré $2$. La représentation graphique est donc une ${texteGras('parabole')}.<br>`
          let signeCoef, orientation
          if (coefDominant > 0) {
            signeCoef = texteGras('positif')
            orientation = texteGras('haut')
          } else {
            signeCoef = texteGras('négatif')
            orientation = texteGras('bas')
          }
          texteCorr += `Le coefficient dominant est ${signeCoef} : $${miseEnEvidence(coefDominantTexte)}$. Les branches de la parabole sont donc orientées vers le ${orientation}.<br>`
          texteCorr +=
            racine1 === racine2
              ? `Le polynôme admet une racine double : $${miseEnEvidence(racine1)}$. La parabole passe donc par le point $(${texNombre(racine1)};0)$.`
              : `Le polynôme possède deux racines distinctes : $${miseEnEvidence(racine1)}$ et $${miseEnEvidence(racine2)}$. La parabole passe donc par les points $(${texNombre(racine1)};0)$ et $(${texNombre(racine2)};0)$.<br>`
          texteCorr += `La bonne représentation graphique est :<br>${graphePourCorrection}`
          break
        }
      }

      texte = `${this.interactif ? 'Cliquer sur' : 'Choisir'} la représentation graphique de la fonction $f$ définie sur $\\mathbb{R}$
    par $f(x) = ${expressionLatex}$.<br>`
      const graphes = [grapheCorrect, grapheErr1, grapheErr2, grapheErr3]
      const ordre = shuffle(range(3))
      texte +=
        graphes[ordre[0]] +
        graphes[ordre[1]] +
        graphes[ordre[2]] +
        graphes[ordre[3]]

      this.cliqueFiguresArray[i] = [
        { id: id0, solution: true },
        { id: id1, solution: false },
        { id: id2, solution: false },
        { id: id3, solution: false },
      ]

      if (this.interactif) {
        this.autoCorrection[i] = {}
        this.autoCorrection[i].formatInteractif = 'clique-figure'

        texte += addCliqueFigure(this, i)
        texte += `<span id="resultatCheckEx${this.numeroExercice}Q${i}"></span>`
      }

      if (this.questionJamaisPosee(i, ...polynome.monomes)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }

  // Renvoie les valeurs xMin, xMax, yMin et yMax pour une fenetre adaptée à une fonction polynôme de degré 2, à partir du coefficient dominant,de l'extremum et de son abscisse
  public reglerFenetrePoly2(
    coefDominant: number,
    absSommet: number,
    extremum: number,
  ): { xmin: number; xmax: number; ymin: number; ymax: number } {
    let ymin, ymax
    // Gestion de yMin/Max selon l'orientatin de la parabole, donc selon le signe du coefficient dominant
    if (coefDominant > 0) {
      ymin = Math.min(extremum - 2, -2)
      ymax = ymin + 2 * this.amplitude.y
    } else {
      ymax = Math.max(extremum + 2, 2)
      ymin = ymax - 2 * this.amplitude.y
    }
    return {
      xmin: absSommet - this.amplitude.x,
      xmax: absSommet + this.amplitude.x,
      ymin,
      ymax,
    }
  }

  // Génère un graphique pour la fonction fournie et avec la fenêtre donnée
  public genererGraphique({
    fonction,
    xmin = -this.amplitude.x,
    xmax = this.amplitude.x,
    ymin = -this.amplitude.y,
    ymax = this.amplitude.y,
    id,
    pixelsParCm,
  }: {
    fonction: (x: number) => number
    xmin?: number
    xmax?: number
    ymin?: number
    ymax?: number
    id?: string
    pixelsParCm?: number
  }): string {
    const rapportY = 2
    const fenetreMathalea2d = {
      xmin: xmin * 1.1,
      xmax: xmax * 1.1,
      ymin: new Decimal(ymin).div(rapportY).toNumber(),
      ymax: new Decimal(ymax).div(rapportY).toNumber(),
      display: 'inline-block' as const,
    }
    if (id !== undefined) Object.assign(fenetreMathalea2d, { id })
    if (pixelsParCm !== undefined)
      Object.assign(fenetreMathalea2d, { pixelsParCm })
    const r1 = repere({
      xMin: xmin,
      yMin: ymin,
      yMax: ymax,
      xMax: xmax,
      xUnite: 1,
      yUnite: new Decimal(1).div(rapportY).toNumber(),
      yThickDistance: rapportY,
      axeXStyle: '->',
      axeYStyle: '->',
      grilleX: false,
      grilleY: false,
    })
    const graphe1 = mathalea2d(
      fenetreMathalea2d,
      r1,
      courbe(fonction, { repere: r1, color: bleuMathalea, epaisseur: 2 }),
    )
    return graphe1
  }

  // Gère le cas particulier de l'expression Latex avec deux racines
  public gererExpressionDeuxRacines(
    coefDominant: number,
    racine1: number,
    racine2: number,
  ): string {
    let expressionRacine2, expressionRacine1
    let coefOppose = false
    const format = ['x-r', 'r-x']
    // Cas de la racine2, jamais nulle
    // Si positive, deux expressions possibles : (x - r2) ou (r2 - x)
    if (racine2 > 0) {
      if (choice(format) === 'x-r')
        expressionRacine2 = `(x - ${texNombre(racine2)})`
      else {
        expressionRacine2 = `(${texNombre(racine2)} - x)`
        coefOppose = true
        coefDominant *= -1
      }
    } else expressionRacine2 = `(x + ${texNombre(-racine2)})`
    // Cas d'égalité (dans ce cas, racine1 est non nulle) : (x - r2)²
    if (racine1 === racine2) {
      coefDominant = coefOppose ? -1 * coefDominant : coefDominant
      return rienSi1(coefDominant) + expressionRacine2 + `^2`
    }
    // Si racine1 nulle
    if (racine1 === 0) expressionRacine1 = `x`
    else {
      if (racine1 > 0) {
        if (choice(format) === 'x-r')
          expressionRacine1 = `(x - ${texNombre(racine1)})`
        else {
          coefDominant *= -1
          expressionRacine1 = `(${texNombre(racine1)} - x)`
        }
      } else expressionRacine1 = `(x + ${texNombre(-racine1)})`
    }
    return rienSi1(coefDominant) + expressionRacine1 + expressionRacine2
  }

  // Génère une fausse réponse "évidente", une fonction affine ou une fonction polynôme de degré 3
  public affineOuPoly3({
    avecGraphe = true,
    id,
    pixelsParCm,
  }: { avecGraphe?: boolean; id?: string; pixelsParCm?: number } = {}): {
    polynome: Polynome
    graphe: string
  } {
    let polynome = new Polynome({ coeffs: [0] })
    let graphe = ''
    const typeFonction = choice(['affine', 'deg3'])
    switch (typeFonction) {
      case 'affine': {
        const coefDominant = randint(-3, 3, [0])
        const coefConstant = randint(-3, 3)
        polynome = new Polynome({ coeffs: [coefConstant, coefDominant] })
        const yMin = polynome.fonction(0) - this.amplitude.y
        graphe = avecGraphe
          ? this.genererGraphique({
              fonction: polynome.fonction,
              ymin: yMin,
              ymax: yMin + 2 * this.amplitude.y,
              id,
              pixelsParCm,
            })
          : ''
        break
      }
      case 'deg3': {
        // Choix des abscisses des extrema locaux puis primitive
        const extrema1 = randint(-3, 3)
        const extrema2 = randint(-3, 3, [extrema1 - 1, extrema1, extrema1 + 1])
        polynome = Polynome.fromRoots([extrema1, extrema2])
          .primitive0()
          .multiply(randint(-1, 1, [0]))
          .add(randint(-3, 3))
        // Atténuation verticale (entre 40 % et 90 %)
        const attenuation = new Decimal(randint(4, 9)).div(10).toNumber()
        const amplitudeMax = new Decimal(10)
          .div(
            Math.max(
              Math.abs(polynome.fonction(extrema1)),
              Math.abs(polynome.fonction(extrema2)),
            ),
          )
          .mul(attenuation)
          .toNumber()
        polynome = polynome.multiply(amplitudeMax)
        graphe = avecGraphe
          ? this.genererGraphique({
              fonction: polynome.fonction,
              id,
              pixelsParCm,
            })
          : ''
        break
      }
    }
    return { polynome, graphe }
  }

  // Génère une fausse réponse avec la parabole orientée dans le mauvais sens
  public erreurCoefDominantOpposé({
    polynome,
    typePoly,
    absSommet = 0,
    avecGraphe = true,
    id,
  }: {
    polynome: Polynome
    typePoly: number
    absSommet?: number
    avecGraphe?: boolean
    id?: string
  }): {
    polynome: Polynome
    graphe: string
  } {
    let graphe = ''
    // Polynome opposé dans deux cas, "symétrie" dans l'autre
    let erreurPolynome = polynome.multiply(-1)
    if (typePoly === this.typePolynome.monomeEtConstante)
      erreurPolynome = erreurPolynome.add(2 * polynome.fonction(absSommet))
    if (avecGraphe) {
      let coefDominant = erreurPolynome.monomes[polynome.deg]
      if (
        coefDominant instanceof FractionEtendue ||
        coefDominant instanceof Decimal
      )
        coefDominant = coefDominant.toNumber()
      graphe = this.genererGraphique(
        Object.assign(
          { fonction: erreurPolynome.fonction, id },
          this.reglerFenetrePoly2(
            coefDominant,
            absSommet,
            erreurPolynome.fonction(absSommet),
          ),
        ),
      )
    }
    return { polynome: erreurPolynome, graphe }
  }

  // Génère une fausse réponse avec un décalage vertical
  public erreurDecalageVertical({
    polynome,
    decalage,
    avecGraphe = true,
    id,
  }: {
    polynome: Polynome
    decalage: number
    avecGraphe?: boolean
    id?: string
  }): { polynome: Polynome; graphe: string } {
    let graphe = ''
    const coeffs = polynome.monomes.map(function (monome) {
      if (monome instanceof Decimal || monome instanceof FractionEtendue)
        return monome.toNumber()
      return monome
    })
    coeffs[0] += decalage
    const erreurPolynome = new Polynome({ coeffs, letter: polynome.letter })
    graphe = avecGraphe
      ? this.genererGraphique(
          Object.assign(
            { fonction: erreurPolynome.fonction, id },
            this.reglerFenetrePoly2(coeffs[polynome.deg], 0, decalage),
          ),
        )
      : ''
    return { polynome: erreurPolynome, graphe }
  }

  // Génère une fausse réponse avec un décalage horizontal ou vertical
  public erreurDecalage({
    polynome,
    decalage,
    avecGraphe = true,
    id,
  }: {
    polynome: Polynome
    decalage: number
    avecGraphe?: boolean
    id?: string
  }): { polynome: Polynome; graphe: string } {
    let graphe = ''
    const coeffs = polynome.monomes.map(function (monome) {
      if (monome instanceof Decimal || monome instanceof FractionEtendue)
        return monome.toNumber()
      return monome
    })
    const coefDominant = coeffs[polynome.deg]
    let erreurPolynome = new Polynome({ coeffs: [0] })
    const typeDecalage = choice(['horizontal', 'vertical'])
    switch (typeDecalage) {
      case 'horizontal': {
        // Monome constant
        erreurPolynome = new Polynome({
          coeffs: [coeffs[0]],
          letter: polynome.letter,
        })
        // Polynome (x - decalage)
        const polynomeDecaleBase = new Polynome({ coeffs: [-decalage, 1] })
        // Polynome constant 1
        let polynomeDecale = new Polynome({ coeffs: [1] })
        for (let indice = 1; indice < coeffs.length; indice++) {
          // (x - decalage)^indice
          polynomeDecale = polynomeDecale.multiply(polynomeDecaleBase)
          // Ajout pour construire le polynome final
          erreurPolynome = erreurPolynome.add(
            polynomeDecale.multiply(coeffs[indice]),
          )
        }
        graphe = avecGraphe
          ? this.genererGraphique(
              Object.assign(
                { fonction: erreurPolynome.fonction, id },
                this.reglerFenetrePoly2(
                  coefDominant,
                  decalage,
                  erreurPolynome.fonction(decalage),
                ),
              ),
            )
          : ''
        break
      }
      case 'vertical': {
        coeffs[0] += randint(-3, 3, [0])
        erreurPolynome = new Polynome({ coeffs, letter: polynome.letter })
        graphe = avecGraphe
          ? this.genererGraphique(
              Object.assign(
                { fonction: erreurPolynome.fonction, id },
                this.reglerFenetrePoly2(coefDominant, 0, coeffs[0]),
              ),
            )
          : ''
        break
      }
    }
    return { polynome: erreurPolynome, graphe }
  }

  // Génère une fausse réponse dans le cas (x - r_1)(x - r_2) en changeant les racines en leurs opposées si elles sont différentes ou en changeant une seule racine si les deux sont identiques
  public erreurRacines({
    polynome,
    racine1,
    racine2,
    avecGraphe = true,
    id,
  }: {
    polynome: Polynome
    racine1: number
    racine2: number
    avecGraphe?: boolean
    id?: string
  }): { polynome: Polynome; graphe: string } {
    let graphe = ''
    if (racine1 === -racine2) {
      racine1 = randint(-4, 4, [racine2, -racine2])
    } else {
      racine1 = -racine1
      racine2 = -racine2
    }
    const erreurPolynome = Polynome.fromRoots([racine1, racine2]).multiply(
      polynome.monomes[polynome.deg],
    )
    erreurPolynome.letter = polynome.letter
    if (avecGraphe) {
      let coefDominant = polynome.monomes[polynome.deg]
      if (
        coefDominant instanceof FractionEtendue ||
        coefDominant instanceof Decimal
      )
        coefDominant = coefDominant.toNumber()
      const absSommet = new Decimal(racine1 + racine2).div(2).toNumber()
      graphe = this.genererGraphique(
        Object.assign(
          { fonction: erreurPolynome.fonction, id },
          this.reglerFenetrePoly2(
            coefDominant,
            absSommet,
            erreurPolynome.fonction(absSommet),
          ),
        ),
      )
    }
    return { polynome: erreurPolynome, graphe }
  }
}
