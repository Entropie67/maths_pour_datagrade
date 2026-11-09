import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import type { Figure2D } from '../../lib/2d/Figures2D'
import {
  listeFigures2d,
  type Forme,
} from '../../lib/2d/figures2d/listeFigures2d'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { texteParPosition } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  contraindreValeur,
  gestionnaireFormulaireTexte,
  randint,
} from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'

export const titre = 'Reconnaitre une symétrie centrale'
export const interactifReady = true

// Gestion de la date de publication initiale
export const dateDePublication = '18/05/2025'

/**
 * Dire si une figure possède un centre de symétrie.
 * @author Jean-claude Lhote
 */
export const uuid = '428b2'

export const refs = {
  'fr-fr': ['5G3A-13'],
  'fr-2016': ['5G12-4'],
  'fr-ch': ['9R1ES4E-4', '9R2ES4E-4', '9R3ES4E-4', 'PRQES02D-2'],
}

export default class NbAxesDeSymetrie extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.besoinFormulaireTexte = [
      'Type de figures',
      'Nombres séparés par des tirets :\n1 : Panneaux\n2 : Formes géométriques\n3 : Legos\n4 : Lettres\n5 : Chiffres et nombres\n6 : Mélange',
    ]
    this.sup = '6'
    this.besoinFormulaire2Numerique = ['Nombre de figures par question', 3]
    this.sup2 = 3
    this.besoinFormulaire3CaseACocher = ['Avec des rotations aléatoires', false]
    this.sup3 = false
    this.besoinFormulaire4CaseACocher = ['Grandes figures', true]
    this.sup4 = true
  }

  nouvelleVersion(): void {
    let nbFigures = contraindreValeur(1, 3, this.sup2, 3)
    const factor = this.sup4 ? 2 : 1
    const typeDeFigures = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 5,
      defaut: 1,
      melange: 6,
      nbQuestions: this.nbQuestions,
    }).map(Number)
    const numerosChoisis: number[] = []
    for (let i = 0; i < this.nbQuestions;) {
      let texte = ''
      let texteCorr = ''
      const objets: NestedObjetMathalea2dArray = []
      const objetsCorr: NestedObjetMathalea2dArray = []

      const typeDeFigureChoisie = [
        'panneau',
        'geometrique',
        'lego',
        'lettre',
        'chiffre',
      ][typeDeFigures[i] - 1]
      const listeFigs = listeFigures2d
        .filter((el) => el.type === typeDeFigureChoisie)
        .filter((el) => !numerosChoisis.includes(el.numero))
        .filter((el, index, self) => {
          // Si on ne parle pas d'un panneau, on ne filtre pas par style
          if (typeDeFigureChoisie !== 'panneau') return true

          // On garde seulement le premier élément pour chaque style défini
          return (
            index ===
            self.findIndex((autre) => (autre.style ?? '') === (el.style ?? ''))
          )
        })
      if (listeFigs.length === 0) {
        this.listeQuestions.push('Aucune figure disponible')
        this.listeCorrections.push('Aucune figure disponible')
        break
      }
      const nbFigs = listeFigs.length
      if (nbFigs < nbFigures) {
        nbFigures = nbFigs
      }
      const figures = []
      for (let j = 0; j < nbFigures; j++) {
        const choix = listeFigs.filter(
          (el) => !numerosChoisis.includes(el.numero),
        )
        if (choix.length === 0) {
          nbFigures = j
          break
        }
        const figure: Forme = choice(choix)
        numerosChoisis.push(figure.numero)
        figures.push(figure)
      }
      texte += this.interactif
        ? `Dire si l${nbFigures > 1 ? 'es' : 'a'} figure${nbFigures > 1 ? 's' : ''} suivante${nbFigures > 1 ? 's' : ''} possède${nbFigures > 1 ? 'nt' : ''} un centre de symétrie.<br>`
        : `Placer le centre de symétrie d${nbFigures > 1 ? 'es ' : 'e la'} figure${nbFigures > 1 ? 's' : ''} suivante${nbFigures > 1 ? 's' : ''} s'il existe.<br>`
      const formes: Figure2D[] = []
      const scale = nbFigures === 1 ? 1 : nbFigures === 2 ? 0.9 : 0.8
      for (let j = 0; j < nbFigures; j++) {
        const alpha = randint(-30, 30, 0)
        const figure = figures[j]
        const options = figure.options ?? {}
        const forme = figure
          .figure2d(options)
          .dilate(factor)
          .translate(j * 6.5 * factor * scale, 0)
        forme.name = figure.name.replace(/ /g, '_')
        if (this.sup3) forme.rotate(alpha)
        formes.push(forme)

        const formeTexte = texteParPosition(
          `figure ${j + 1}`,
          j * 6.5 * factor * scale,
          2.8 * factor,
        )
        objets.push(forme, formeTexte)

        const formeBis = forme.copy(forme.name + 'Bis')
        formeBis.opacite = 0.3
        const formeCorr = forme.rotationAnimee({
          angleStart: 0,
          angleEnd: 180,
          // forme.centre est déjà translaté avec la figure
          cx: forme.centre?.x ?? forme.x,
          cy: forme.centre?.y ?? forme.y,
          loop: true,
          duration: '4s',
        })
        formeCorr.opacite = 0.5
        if (context.isHtml) {
          objetsCorr.push(formeBis, formeCorr, formeTexte)
        } else {
          objetsCorr.push(formeBis, formeTexte)
        }
        if (forme.centre != null) {
          const trace = tracePoint(forme.centre)
          trace.epaisseur = 3
          trace.color = colorToLatexOrHTML('red')
          trace.taille = 5
          objetsCorr.push(trace)
        } else {
          objetsCorr.push(
            texteParPosition(
              `Pas de centre ${sp(2)} de symétrie !`,
              j * 6.5 * factor * scale,
              0,
              45,
              'red',
            ),
            texteParPosition(
              `Pas de centre ${sp(2)} de symétrie !`,
              j * 6.5 * factor * scale,
              0,
              -45,
              'red',
            ),
          )
        }
      }
      texte += mathalea2d(
        Object.assign(
          { pixelsParCm: 20, scale: factor === 1 ? scale : 0.7 * scale },
          fixeBordures(objets),
        ),
        objets,
      )
      if (this.interactif) {
        for (let j = 0; j < nbFigures; j++) {
          this.autoCorrection[i * nbFigures + j] = {
            propositions: [
              { texte: 'oui', statut: formes[j].centre != null },
              { texte: 'non', statut: formes[j].centre == null },
            ],
            options: {
              ordered: true,
              radio: true,
            },
          }
          const monQcm = propositionsQcm(this, i * nbFigures + j, {
            style: 'inline-block',
            format: 'case',
          })
          texte += `figure $${j + 1}$ : ${monQcm.texte}`
        }
      }

      texteCorr += mathalea2d(
        Object.assign(
          { pixelsParCm: 20, scale: factor === 1 ? scale : 0.7 * scale },
          fixeBordures(objets),
        ),
        objetsCorr,
      )
      texteCorr += `${formes
        .map((el, j) =>
          el.centre != null
            ? `${j === 0 ? 'L' : 'l'}a figure $${j + 1}$ ${texteEnCouleurEtGras('possède')} un centre de symétrie.<br>`
            : `${j === 0 ? 'L' : 'l'}a figure $${j + 1}$ ${texteEnCouleurEtGras('ne possède pas')} de centre de symétrie.<br>`,
        )
        .join('')}`
      this.listeQuestions.push(texte)
      this.listeCorrections.push(texteCorr)
      i++
    }
  }
}
