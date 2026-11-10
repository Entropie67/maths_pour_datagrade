import Figure from 'apigeom'
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { createApigeomFigureHtml } from '../../lib/apigeom/apigeom-figure'
import { bleuMathalea } from '../../lib/colors'
import { isEqual, isFraction, seq } from '../../lib/interactif/checks'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import {
  ajouteChampTexteMathLive,
  remplisLesBlancs,
} from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Écrire la somme d'un entier et d'une fraction inférieure à 1 comme une unique fraction"
export const dateDePublication = '03/11/2026'
export const interactifReady = true

/**
 * 3 + 2/5 = 15/5 + 2/5 = 17/5
 * @author Rémi Angot
 */
export const uuid = 'd7242'

export const refs = {
  'fr-fr': ['CM1N2C', 'CM2N2C'],
  'fr-ch': [],
}

const nomsDesParts: Record<number, string> = {
  2: 'demis',
  3: 'tiers',
  4: 'quarts',
  5: 'cinquièmes',
  6: 'sixièmes',
  8: 'huitièmes',
  10: 'dixièmes',
}

/** Des rectangles, un par unité, partagés en `den` parts égales toutes coloriées */
function unitesPartagees(entier: number, den: number) {
  const largeur = 4
  const hauteur = 1
  const ecart = 0.5
  const objets = []
  for (let k = 0; k < entier; k++) {
    for (let j = 0; j < den; j++) {
      const x0 = k * (largeur + ecart) + (j * largeur) / den
      const x1 = x0 + largeur / den
      const part = polygone([
        pointAbstrait(x0, 0),
        pointAbstrait(x1, 0),
        pointAbstrait(x1, hauteur),
        pointAbstrait(x0, hauteur),
      ])
      part.couleurDeRemplissage = colorToLatexOrHTML(bleuMathalea)
      part.opaciteDeRemplissage = 0.4
      objets.push(part)
    }
  }
  return objets
}

export default class EntierPlusFractionEnFraction extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 6
    this.nbCols = 2
    this.nbColsCorr = 1
    this.spacingCorr = 2
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets  :',
        '1 : Compléter le numérateur',
        '2 : Écrire la fraction',
        '3 : Mélange',
      ].join('\n'),
    ]
    this.sup = '3'
    this.besoinFormulaire2CaseACocher = ['Brouillon interactif']
    this.sup2 = false
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions > 1
        ? "Écrire chaque somme sous la forme d'une seule fraction."
        : "Écrire la somme sous la forme d'une seule fraction."
    if (this.sup2 && context.isHtml) {
      const figure = new Figure({
        xMin: -0.5,
        yMin: -2,
        width: 560,
        height: 110,
        pixelsPerUnit: 25,
      })
      figure.options.automaticUserMessage = false
      figure.options.color = bleuMathalea
      figure.create('RectangleFractionDiagram', {
        denominator: 2,
        // 6 unités : l'entier va jusqu'à 5, plus la fraction
        numberOfRectangles: 6,
        width: 3,
        gap: 0.6,
      })
      this.introduction = createApigeomFigureHtml(figure, {
        numeroExercice: this.numeroExercice,
      })
    } else {
      this.introduction = ''
    }
    const listeTypesDeQuestions = combinaisonListes(
      gestionnaireFormulaireTexte({
        saisie: this.sup,
        max: 2,
        melange: 3,
        defaut: 3,
        nbQuestions: this.nbQuestions,
      }).map(Number),
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const entier = randint(1, 5)
      const den = choice([2, 3, 4, 5, 6, 8, 10])
      const num = randint(1, den - 1)
      const numEntier = entier * den
      const numTotal = numEntier + num
      const somme = `${entier}+\\dfrac{${num}}{${den}}`

      let texte = ''
      if (listeTypesDeQuestions[i] === 1) {
        texte = remplisLesBlancs(
          this,
          i,
          `${somme}=\\dfrac{%{champ1}}{${den}}`,
          KeyboardType.clavierNumbers,
        )
        handleAnswers(
          this,
          i,
          { champ1: { value: numTotal } },
          { formatInteractif: 'fill-in-the-blank' },
        )
      } else {
        texte =
          `$${somme}$` +
          (this.interactif
            ? ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierDeBaseAvecFraction,
                { texteAvant: ' $=$' },
              )
            : '')
        handleAnswers(this, i, {
          reponse: {
            value: `\\dfrac{${numTotal}}{${den}}`,
            compare: seq([isEqual(), isFraction()]),
          },
        })
      }

      const parts = nomsDesParts[den]
      let texteCorr = texteEnCouleur(
        entier === 1
          ? `Dans une unité, il y a $${den}$ ${parts}.`
          : `Dans une unité, il y a $${den}$ ${parts}, donc $${entier}$ unités $=${entier}\\times ${den}$ ${parts} $=${numEntier}$ ${parts}.`,
        bleuMathalea,
      )
      const dessin = unitesPartagees(entier, den)
      texteCorr += `<br>${mathalea2d(
        Object.assign({}, fixeBordures(dessin), {
          scale: context.isHtml ? 1 : 0.7,
        }),
        dessin,
      )}`
      texteCorr += `$${somme}=\\dfrac{${numEntier}}{${den}}+\\dfrac{${num}}{${den}}=`
      texteCorr +=
        listeTypesDeQuestions[i] === 1
          ? `\\dfrac{${miseEnEvidence(numTotal)}}{${den}}$`
          : `${miseEnEvidence(`\\dfrac{${numTotal}}{${den}}`)}$`

      if (this.questionJamaisPosee(i, entier, num, den)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
