import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { texteSurSegment } from '../../lib/2d/texteSurSegment'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import {
  compareGrandeur,
  optionsClavierGrandeur,
  reponseGrandeur,
} from '../../lib/interactif/saisieGrandeur'
import { choice } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const titre = "Calculer le volume d'un prisme droit"
export const dateDePublication = '24/06/2026'

export const dateDeModifImportante = '22/10/2026'

export const uuid = '6ec4a'

export const refs = {
  'fr-fr': ['1A-G02-13', '2A-G3-13'],
  'fr-ch': ['10CTGM2A-3', '10LCGM2A-3', '10LSGM2A-3'],
}

export const interactifReady = true

export const amcReady = true

/**
 * Calculer le volume d'un prisme droit à base pentagonale à partir de l'aire
 * de la base et de la hauteur du prisme.
 * @author Stéphane Guyon
 */
export default class VolumePrismeDroitBasePentagonaleQcm extends ExerciceQcmACourt {
  // En saisie libre, la question est portée par la phrase placée avant le champ
  private enonceFigure = ''
  private reponseSaisie = ''
  clavierReponseCourte = KeyboardType.clavierEntierementPersonnalisable
  texteAvantReponseCourte = 'Le volume de ce prisme droit vaut '
  texteApresReponseCourte = ". (Préciser l'unité.)"
  enonceCourt = () =>
    this.enonceFigure +
    (this.interactif ? '' : '<br>Calculer le volume de ce prisme droit.')
  reponseCourte = () => this.reponseSaisie
  compareReponseCourte = compareGrandeur

  private appliquerLesValeurs(aireBaseEnCm2: number, hauteurEnDm: number) {
    const hauteurEnCm = hauteurEnDm * 10
    const volume = aireBaseEnCm2 * hauteurEnCm

    const A = pointAbstrait(0, 0)
    const B = pointAbstrait(2.5, 0)
    const C = pointAbstrait(3.2, 1)
    const D = pointAbstrait(1.3, 1.7)
    const E = pointAbstrait(-0.6, 0.9)
    const dx = 0
    const dy = 2.6
    const Aprime = pointAbstrait(A.x + dx, A.y + dy)
    const Bprime = pointAbstrait(B.x + dx, B.y + dy)
    const Cprime = pointAbstrait(C.x + dx, C.y + dy)
    const Dprime = pointAbstrait(D.x + dx, D.y + dy)
    const Eprime = pointAbstrait(E.x + dx, E.y + dy)

    const baseInferieure = polygone([A, B, C, D, E])
    const baseSuperieure = polygone([Aprime, Bprime, Cprime, Dprime, Eprime])
    baseInferieure.epaisseur = 2
    baseInferieure.color = colorToLatexOrHTML('none')
    baseInferieure.couleurDeRemplissage = colorToLatexOrHTML('lightgray')
    baseInferieure.opaciteDeRemplissage = 0.6
    baseSuperieure.epaisseur = 2
    baseSuperieure.couleurDeRemplissage = colorToLatexOrHTML('lightgray')
    baseSuperieure.opaciteDeRemplissage = 0.35

    const aretesBaseInferieure = [
      segment(A, B),
      segment(B, C),
      segment(C, D),
      segment(D, E),
      segment(E, A),
    ]
    for (const arete of aretesBaseInferieure) {
      arete.epaisseur = 2
    }
    for (const areteCachee of [
      aretesBaseInferieure[2],
      aretesBaseInferieure[3],
    ]) {
      areteCachee.pointilles = 5
    }

    const aretes = [
      segment(A, Aprime),
      segment(B, Bprime),
      segment(C, Cprime),
      segment(D, Dprime),
      segment(E, Eprime),
    ]
    for (const arete of aretes) {
      arete.epaisseur = 1.5
    }
    aretes[3].pointilles = 5

    const coteHauteur = segment(
      pointAbstrait(C.x + 0.65, C.y),
      pointAbstrait(C.x + 0.65, C.y + dy),
    )
    coteHauteur.pointilles = 5
    coteHauteur.styleExtremites = '<->'
    coteHauteur.epaisseur = 1.5

    const objets = [
      baseInferieure,
      baseSuperieure,
      ...aretesBaseInferieure,
      ...aretes,
      coteHauteur,
      texteSurSegment(
        `$${hauteurEnDm}\\text{ dm}$`,
        coteHauteur.extremite1,
        coteHauteur.extremite2,
        'black',
        -0.45,
      ),
    ]

    const figure = mathalea2d(
      Object.assign(
        { pixelsParCm: 25, scale: 0.8, style: 'margin: auto' },
        fixeBordures(objets, {
          rxmin: -0.5,
          rxmax: 0.8,
          rymin: -0.3,
          rymax: 0.45,
        }),
      ),
      objets,
    )

    this.enonceFigure = `Le solide ci-dessous est un prisme droit à base pentagonale. Il n'est pas représenté à l'échelle.<br>
L'aire de sa base est $${aireBaseEnCm2}\\text{ cm}^2$.
${figure}`
    this.enonce = `${this.enonceFigure}
Son volume est égal à `
    this.reponseSaisie = reponseGrandeur(volume, 'cm^3')
    this.optionsChampReponseCourte = optionsClavierGrandeur({
      unitesEnonce: ['cm', 'dm'],
      dimension: 3,
      unitePrincipale: 'cm',
    })

    this.reponses = [
      `$${texNombre(volume)}\\text{ cm}^3$`,
      `$${texNombre(volume / 2)}\\text{ cm}^3$`,
      `$${texNombre(volume / 3)}\\text{ cm}^3$`,
      `$${texNombre(volume)}\\pi\\text{ cm}^3$`,
    ]

    this.correction = `Le volume d'un prisme droit dont l'aire de la base mesure $\\mathcal{A}$ et dont la hauteur est $h$ est donné par :<br>
$V=\\mathcal{A}\\times h$<br>
On convertit la hauteur en centimètres : $${hauteurEnDm}\\text{ dm}=${hauteurEnCm}\\text{ cm}$.<br>
Donc $V=${aireBaseEnCm2}\\times ${hauteurEnCm}=${miseEnEvidence(texNombre(volume))}$ ${texteEnCouleurEtGras('cm$^3$')}.`
  }

  versionOriginale = () => {
    this.appliquerLesValeurs(48, 3)
  }

  versionAleatoire = () => {
    const aireBaseEnCm2 = choice([30, 36, 42, 48, 54, 60, 72, 90])
    const hauteurEnDm = randint(2, 6)
    this.appliquerLesValeurs(aireBaseEnCm2, hauteurEnDm)
  }

  constructor() {
    super()

    this.nbQuestions = 1
    this.versionAleatoire()
  }
}
