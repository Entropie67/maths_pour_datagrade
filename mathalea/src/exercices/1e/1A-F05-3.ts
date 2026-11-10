import { repere } from '../../lib/2d/reperes'
import { latex2d, texteParPosition } from '../../lib/2d/textes'
import { bleuMathalea, orangeMathalea } from '../../lib/colors'
import { creerTableauSignesVariations } from '../../lib/customElements/TableauSignesVariationsElement'
import { configCorrige } from '../../lib/interactif/tableauSignesVariations/helpers'
import type { TableauSVConfig } from '../../lib/interactif/tableauSignesVariations/types'
import { tableauDeVariation } from '../../lib/mathFonctions/etudeFonction'
import { spline } from '../../lib/mathFonctions/Spline'
import { choice } from '../../lib/outils/arrayOutils'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { nombreElementsDifferents } from '../ExerciceQcm'
import ExerciceQcmACourt, { genereTableauxDeSignes } from '../ExerciceQcmACourt'

export const titre = "Déterminer un tableau de variations à partir d'une courbe"
export const dateDePublication = '06/08/2026'
export const dateDeModifImportante = '27/10/2026'

export const uuid = '9d17d'
export const refs = {
  'fr-fr': ['1A-F05-3'],
  'fr-ch': ['2mQCM-19', '1mQCM-60'],
}
export const interactifReady = true

export const amcReady = 'true'

type Position = '+' | '-'

/**
 * Question ouverte par défaut (tableau de variations à compléter), QCM en option.
 * @author Stéphane Guyon
 */
export default class TableauDeVariationsGraphique extends ExerciceQcmACourt {
  // Données du tirage en cours, relues par le tableau à compléter
  private abscisses: number[] = []
  private images: number[] = []
  // Identifiant unique des tableaux corrigés (distinct de celui de la question)
  private compteurTableauxCorriges = 0

  private construireTableau(
    abscisses: number[],
    images: number[],
    positions: Position[],
    couleur?: string,
  ): string {
    const ligneAbscisses: (string | number)[] = []
    const ligneVariations: (string | number)[] = ['Var', 10]

    for (let index = 0; index < abscisses.length; index++) {
      ligneAbscisses.push(`$${texNombre(abscisses[index], 0)}$`, 10)
      ligneVariations.push(
        `${positions[index]}/$${texNombre(images[index], 0)}$`,
        10,
      )
    }

    return tableauDeVariation({
      tabInit: [
        [
          ['$x$', 1.5, 10],
          ['$f(x)$', 4, 30],
        ],
        ligneAbscisses,
      ],
      tabLines: [ligneVariations],
      espcl: 2.8,
      deltacl: 1,
      lgt: 2.2,
      scale: context.isHtml ? 0.75 : 0.5,
      hauteurLignes: [18, 18],
      couleur,
    })
  }

  private appliquerLesValeurs(): void {
    const decalageX = choice([-1, 0, 1])
    const decalageY = choice([-1, 1])
    const coefficientY = choice([-1, 1])
    const abscisses = [-4, -2, 1, 3, 5].map((x) => x + decalageX)
    const images = [1, 4, -2, 3, 0].map((y) => coefficientY * y + decalageY)
    const positionsCorrectes: Position[] =
      coefficientY === 1 ? ['-', '+', '-', '+', '-'] : ['+', '-', '+', '-', '+']

    const noeuds = abscisses.map((x, index) => ({
      x,
      y: images[index],
      deriveeGauche: index === 0 ? Math.sign(images[1] - images[0]) : 0,
      deriveeDroit:
        index === abscisses.length - 1
          ? Math.sign(images.at(-1)! - images.at(-2)!)
          : 0,
      isVisible: false,
    }))
    const maSpline = spline(noeuds)
    const bornes = maSpline.trouveMaxes()
    const repere1 = repere({
      xMin: bornes.xMin - 1,
      xMax: bornes.xMax + 1,
      yMin: bornes.yMin - 1,
      yMax: bornes.yMax + 1,
      grilleX: false,
      grilleY: false,
      grilleSecondaire: true,
      grilleSecondaireXDistance: 1,
      grilleSecondaireYDistance: 1,
    })
    const courbe = maSpline.courbe({
      epaisseur: 1.7,
      ajouteNoeuds: false,
      color: bleuMathalea,
    })
    const origine = texteParPosition('O', -0.3, -0.3, 0, 'black', 1)
    // Nom de la courbe, à droite de son extrémité
    const nomCourbe = latex2d(
      '\\mathscr{C}_f',
      abscisses.at(-1)! + 0.5,
      images.at(-1)! + 0.6,
      { color: bleuMathalea },
    )
    this.abscisses = abscisses
    this.images = images
    const figure = mathalea2d(
      {
        xmin: bornes.xMin - 1,
        xmax: bornes.xMax + 1,
        ymin: bornes.yMin - 1,
        ymax: bornes.yMax + 1,
        pixelsParCm: 30,
        scale: 0.65,
        center: !context.isHtml,
      },
      repere1,
      courbe,
      nomCourbe,
      origine,
    )

    const tableauCorrect = this.construireTableau(
      abscisses,
      images,
      positionsCorrectes,
    )

    // Les valeurs portées sur les deux lignes sont échangées.
    const tableauAxesInverses = this.construireTableau(
      images,
      abscisses,
      positionsCorrectes,
    )

    // Les flèches sont toutes inversées : on confond notamment valeur positive
    // et croissance, ou valeur négative et décroissance.
    const positionsInversees = positionsCorrectes.map<Position>((position) =>
      position === '+' ? '-' : '+',
    )
    const tableauSigneEtVariation = this.construireTableau(
      abscisses,
      images,
      positionsInversees,
    )

    // Distracteur plus subtil : un extremum de la courbe a été oublié.
    const indexOublie = choice([1, 3])
    const abscissesAvecOubli = abscisses.filter(
      (_, index) => index !== indexOublie,
    )
    const imagesAvecOubli = images.filter((_, index) => index !== indexOublie)
    const premierePosition: Position =
      imagesAvecOubli[1] > imagesAvecOubli[0] ? '-' : '+'
    const positionsAvecOubli = imagesAvecOubli.map<Position>((_, index) =>
      index % 2 === 0 ? premierePosition : premierePosition === '+' ? '-' : '+',
    )
    const tableauSubtil = this.construireTableau(
      abscissesAvecOubli,
      imagesAvecOubli,
      positionsAvecOubli,
    )

    this.reponses = [
      tableauCorrect,
      tableauAxesInverses,
      tableauSigneEtVariation,
      tableauSubtil,
    ].map((tableau) =>
      context.isHtml && !context.isTypst
        ? `<div style="margin: 1.25rem 0.75rem;">${tableau}</div>`
        : tableau,
    )
    this.enonce = `On donne ci-dessous la représentation graphique $\\mathscr{C}_f$ d'une fonction $f$.<br>
    ${figure}<br><br>
    Quel est le tableau de variations de la fonction $f$ ?`

    const intervalles = abscisses
      .slice(0, -1)
      .map((borne, index) => {
        const sens =
          images[index + 1] > images[index] ? 'croissante' : 'décroissante'
        return `Sur $[${texNombre(borne, 0)}\\,;\\,${texNombre(abscisses[index + 1], 0)}]$, $f$ est ${sens}`
      })
      .join(' ;<br>')
    this.reponseCourteExplicite = this.construireTableau(
      abscisses,
      images,
      positionsCorrectes,
      orangeMathalea,
    )
    let tableauFinal = this.reponseCourteExplicite
    if (this.interactif) {
      this.compteurTableauxCorriges++
      tableauFinal = creerTableauSignesVariations(
        configCorrige(this.configTableauSignes(), { enEvidence: true }),
        {
          readonly: true,
          id: `tableauCorrigeEx${this.numeroExercice}N${this.compteurTableauxCorriges}`,
        },
      )
    }
    this.correction = `En parcourant la courbe de gauche à droite, on lit :<br>
    ${intervalles}.<br>
    Les nombres de la première ligne sont les abscisses et ceux de la deuxième ligne sont leurs images respectives.<br>
    On obtient donc le tableau suivant :<br>
    ${tableauFinal}`
  }

  versionAleatoire: () => void = () => {
    do {
      this.appliquerLesValeurs()
    } while (nombreElementsDifferents(this.reponses) < 4)
  }

  /** Tableau à compléter : abscisses, images et flèches. */
  configTableauSignes(): TableauSVConfig {
    return {
      variableName: 'x',
      colonnes: this.abscisses.map((x) => ({
        valeur: '',
        editable: true,
        expected: texNombre(x, 0),
      })),
      lignes: [
        {
          type: 'variation',
          label: 'f(x)',
          valeurs: this.images.map((y) => ({
            latex: '',
            editable: true,
            expected: texNombre(y, 0),
          })),
          fleches: this.images.slice(1).map((y, index) => ({
            sens: '',
            editable: true,
            expected: y > this.images[index] ? 'haut' : 'bas',
          })),
        },
      ],
    }
  }

  nouvelleVersion(): void {
    this.reponseCourteDisponible = true
    if (!this.sup3) {
      genereTableauxDeSignes(this)
      return
    }
    super.nouvelleVersion()
    if (!context.isHtml) {
      this.listeQuestions = this.listeQuestions.map((question) =>
        question.replaceAll(
          '\\begin{qcmprop}[cols=4]',
          '\\begin{qcmprop}[cols=2]',
        ),
      )
      this.listeCorrections = this.listeCorrections.map((correction) =>
        correction.replaceAll(
          '\\begin{qcmprop}[cols=4',
          '\\begin{qcmprop}[cols=2',
        ),
      )
    }
  }

  constructor() {
    super()
    this.enonceCourt = () =>
      this.enonce.replace(
        'Quel est le tableau de variations de la fonction $f$ ?',
        `${this.interactif ? 'Compléter' : 'Déterminer'} le tableau de variations de la fonction $f$.`,
      )
    this.options.ordered = context.isTypst
    this.versionAleatoire()
  }
}
