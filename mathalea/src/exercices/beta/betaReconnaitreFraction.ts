import {
  fractionVisualizer,
  type BorderMode,
  type ShapeName,
} from '../../lib/apps/fraction_visualizer'
import { bleuMathalea } from '../../lib/colors'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { listeDesDiviseurs } from '../../lib/outils/primalite'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Reconnaître une fraction sur des représentations variées'
export const dateDePublication = '02/11/2025'
export const interactifReady = true

export const uuid = '35b4c'
export const refs = {
  'fr-fr': [],
  'fr-2016': [],
  'fr-ch': [],
}

/**
 * Reconnaître une fraction sur des représentations variées
 * Projet abandonné par manque de temps pour concevoir une version LaTeX et vu le manque d'intérêt de l'exercice.
 * L'exercice n'est donc pas référencé et n'est accessible que par son UUID.
 * @author Guillaume Valmont
 */

export default class ConnaitreQuart extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 5
    this.besoinFormulaireTexte = [
      'Choix des représentations',
      [
        'Nombres séparés par des tirets :',
        '0 : Mélange',
        '1 : Disque',
        '2 : Carré',
        '3 : Rectangle',
        '4 : Barre',
        '5 : Segment',
      ].join('\n'),
    ]
    this.sup = '1-2-3-4-5'

    this.besoinFormulaire2Texte = [
      'Choix des types de fraction',
      [
        'Nombres séparés par des tirets :',
        '0 : Mélange',
        '1 : Fractions unitaires (1/n)',
        '2 : Fractions <= 1',
        '3 : Fractions > 1',
      ].join('\n'),
    ]
    this.sup2 = '1-2-3'

    this.besoinFormulaire3Numerique = [
      'Choix du curseur',
      5,
      [
        'Pas de curseur',
        'Limité à la première part',
        'Limité à la première unité',
        'Limité à la partie colorée',
        'Minimum la première unité, limité à la partie colorée',
        'Limité à la dernière unité',
      ].join('\n'),
    ]
    this.sup3 = 3

    this.spacingCorr = 2.5
  }

  nouvelleVersion() {
    const representationsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 0,
      max: 5,
      melange: 0,
      defaut: 0,
      nbQuestions: this.nbQuestions,
    })
    const listeRepresentations = combinaisonListes(
      representationsDisponibles,
      this.nbQuestions,
    )
    const typesFractionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 0,
      max: 3,
      melange: 0,
      defaut: 0,
      nbQuestions: this.nbQuestions,
    })
    const listeTypesFractions = combinaisonListes(
      typesFractionsDisponibles,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const forme = getShapeNameFr(listeRepresentations[i])
      const shape = getShapeName(listeRepresentations[i])
      const typeFraction = getFractionType(listeTypesFractions[i])
      const nbPartsUnite =
        forme === 'carré' || forme === 'rectangle'
          ? choice([2, 4, 8])
          : randint(3, 10)
      const nbPartsColorees =
        typeFraction === 'Fractions unitaires (1/n)'
          ? 1
          : typeFraction === 'fraction inférieure ou égale à 1'
            ? randint(2, nbPartsUnite)
            : randint(nbPartsUnite + 1, nbPartsUnite * 3)
      let limiteCurseur = nbPartsUnite
      let borderMode: BorderMode = 'cursor'
      switch (this.sup3) {
        case 1:
          borderMode = 'none'
          break
        case 2:
          limiteCurseur = 1
          break
        case 3:
          limiteCurseur = nbPartsUnite
          break
        case 4:
          limiteCurseur = nbPartsColorees
          break
        case 5:
          limiteCurseur = Math.max(nbPartsColorees, nbPartsUnite)
          break
        case 6:
          limiteCurseur =
            nbPartsUnite * Math.ceil(nbPartsColorees / nbPartsUnite)
          break
      }
      const texte = `L'unité est ${forme === 'barre' ? 'la' : 'le'} ${forme}.<br>
      Indiquer la fraction représentée par la partie colorée.<br>
      ${fractionVisualizer({
        filled: nbPartsColorees,
        total: nbPartsUnite,
        shape,
        borderMode,
        sliderMaxInput: limiteCurseur,
      })}`

      let texteCorr = ''
      const diviseurs = listeDesDiviseurs(nbPartsUnite)
      const decoupages = []
      for (const diviseur of diviseurs) {
        if (nbPartsColorees % diviseur === 0) {
          decoupages.push(diviseur)
        }
      }
      switch (typeFraction) {
        case 'Fractions unitaires (1/n)':
          texteCorr += `${fractionVisualizer({
            filled: nbPartsColorees,
            total: nbPartsUnite,
            shape,
            borderMode: 'all',
            showPartNumbers: true,
          })}<br>
          Il faut $${miseEnEvidence(nbPartsUnite, bleuMathalea)}$ parts pour représenter une unité,
          donc la partie colorée représente $\\dfrac{1}{${miseEnEvidence(nbPartsUnite, bleuMathalea)}}$ de l'unité.`
          break
        default:
          if (decoupages.length > 1) {
            texteCorr += `Il y a plusieurs possibilités :<br>`
          }
          for (let i = 0; i < decoupages.length; i++) {
            const decoupage = decoupages[i]
            const partsColoreesDecoupage = Math.round(
              nbPartsColorees / decoupage,
            )
            const partsUniteDecoupage = Math.round(nbPartsUnite / decoupage)
            texteCorr += `${fractionVisualizer({
              filled: partsColoreesDecoupage,
              total: partsUniteDecoupage,
              shape,
              borderMode: 'all',
              showPartNumbers: true,
            })} ${context.isHtml ? '' : '<br>'}
            Avec $${miseEnEvidence(partsUniteDecoupage, bleuMathalea)}$ part${partsUniteDecoupage > 1 ? 's' : ''} pour représenter une unité,
            chaque part représente ${partsUniteDecoupage === 1 ? 'une unité' : `$\\dfrac{1}{${miseEnEvidence(partsUniteDecoupage, bleuMathalea)}}$ de l'unité`} .<br>
            Il faut $${miseEnEvidence(partsColoreesDecoupage, 'green')}$ ${partsUniteDecoupage === 1 ? `unité${partsUniteDecoupage > 1 ? 's' : ''}` : `parts de $\\dfrac{1}{${partsUniteDecoupage}}$`} pour représenter toute la partie colorée
            donc la partie colorée représente ${partsUniteDecoupage === 1 ? `$${miseEnEvidence(partsColoreesDecoupage, 'green')}$ unité${partsUniteDecoupage > 1 ? 's' : ''}` : `$\\dfrac{${miseEnEvidence(partsColoreesDecoupage, 'green')}}{${partsUniteDecoupage}}$ de l'unité`}.`
            if (i < decoupages.length - 1) {
              texteCorr += `<br>Ce n'est pas le seul découpage possible.<br>`
            }
          }
      }
      if (this.questionJamaisPosee(i, forme, nbPartsUnite)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}

function getShapeName(type: string | number): ShapeName {
  const typeNumber = Number(type)
  switch (typeNumber) {
    case 1:
      return 'disk'
    case 2:
      return 'square'
    case 3:
      return 'rectangle'
    case 4:
      return 'bar'
    case 5:
      return 'segment'
    default:
      return 'disk'
  }
}

function getShapeNameFr(type: string | number): string {
  const typeNumber = Number(type)
  switch (typeNumber) {
    case 1:
      return 'disque'
    case 2:
      return 'carré'
    case 3:
      return 'rectangle'
    case 4:
      return 'barre'
    case 5:
      return 'segment'
    default:
      return 'disque'
  }
}

function getFractionType(type: string | number): string {
  const typeNumber = Number(type)
  switch (typeNumber) {
    case 1:
      return 'Fractions unitaires (1/n)'
    case 2:
      return 'fraction inférieure ou égale à 1'
    case 3:
      return 'Fractions > 1'
    default:
      return 'Fractions unitaires (1/n)'
  }
}
