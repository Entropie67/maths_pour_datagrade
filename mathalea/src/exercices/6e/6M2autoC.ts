import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { grille } from '../../lib/2d/Grille'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { carre } from '../../lib/2d/polygonesParticuliers'
import { Polyquad } from '../../lib/2d/Polyquad'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latex2d, texteParPosition } from '../../lib/2d/textes'
import { ajouteQuestionMathlive } from '../../lib/interactif/questionMathLive'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { mathalea2d } from '../../modules/mathalea2d'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Trouver une aire ou un périmètre par comptage'
export const interactifReady = true

export const dateDePublication = '20/04/2025'
export const dateDeModifImportante = '26/04/2025'

/**
 * @author Jean-claude Lhote
 * Ajout du choix des unités par Guillaume Valmont le 26/04/2025
 */
export const uuid = '83be3'

export const refs = {
  'fr-fr': ['6M2autoC', 'CM1M4B', 'CM2M1B'],
  'fr-2016': ['6M10-0'],
  'fr-ch': ['9R1GM2A-1', '9R2GM2A-1', '9R3GM2A-1', 'PRQMG01B-4'],
}
export default class AireParComptage extends Exercice {
  constructor() {
    super()
    this.comment = `Une version course aux nombres de cet exercice est disponible sous la référence can6M2-02 pour l'aire et can6M1-05 pour le périmètre. Dans les versions can, il n'y a qu'une figure.<br>
    Les figures sont générées aléatoirement à partir d'une aire choisie. Les possiblités sont nombreuses, mais aucune vérification n'a été faite afin d'éviter les doublons.`
    this.besoinFormulaireTexte = [
      'Aire maximale',
      'Nombres séparés par des tirets :\n1 : Inférieure à 10\n2 : Inférieure à 20\n3 : Inférieure à 30\n4 : Mélange',
    ]
    this.besoinFormulaire2Numerique = [
      'Mesures demandées',
      3,
      '1 : Aire\n2 : Périmètre\n3 : Aire et périmètre',
    ]
    this.besoinFormulaire3Texte = [
      'Unités',
      'Nombres séparés par des tirets :\n1 : u.l / u.a\n2 : cm / cm²\n3 : m / m²\n4 : Mélange',
    ]
    this.sup = '4'
    this.sup2 = 1
    this.sup3 = '2'
  }

  nouvelleVersion() {
    const typeDeQuestion = gestionnaireFormulaireTexte({
      saisie: this.sup,
      nbQuestions: this.nbQuestions,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
    })
    const unites = gestionnaireFormulaireTexte({
      saisie: this.sup3,
      nbQuestions: this.nbQuestions,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 1,
    })
    for (let i = 0; i < this.nbQuestions; i++) {
      const uniteLongueurDefaut = '$\\text{u.l}$'
      const uniteAireDefaut = '$\\text{u.a}$'
      let uniteLongueur = uniteLongueurDefaut
      let uniteAire = uniteAireDefaut
      switch (unites[i]) {
        case 2:
          uniteLongueur = '$\\text{cm}$'
          uniteAire = '$\\text{cm}^2$'
          break
        case 3:
          uniteLongueur = '$\\text{m}$'
          uniteAire = '$\\text{m}^2$'
          break
      }
      const decalageVisuelAire = uniteLongueur === uniteLongueurDefaut ? 2 : 0
      const aire =
        typeDeQuestion[i] === 1
          ? randint(5, 9)
          : typeDeQuestion[i] === 2
            ? randint(10, 19)
            : randint(20, 29)
      const aire2 =
        typeDeQuestion[i] === 1
          ? randint(5, 9)
          : typeDeQuestion[i] === 2
            ? randint(10, 19)
            : randint(20, 29)
      const tetris = new Polyquad(aire, 0, 0)
      const tetris2 = new Polyquad(aire2, tetris.rectangle.xMax + 1, 0)
      const xmin = tetris.rectangle.xMin
      const ymin = tetris.rectangle.yMin
      const decalage = tetris.rectangle.xMax
      const xmax = tetris2.rectangle.xMax + decalage + 4 + decalageVisuelAire
      const ymax = Math.max(tetris.rectangle.yMax, tetris2.rectangle.yMax)
      const fig1 = texteParPosition(
        'Figure 1',
        (tetris.rectangle.xMin + tetris.rectangle.xMax) / 2,
        tetris.rectangle.yMin - 0.5,
      )
      const fig2 = texteParPosition(
        'Figure 2',
        (tetris2.rectangle.xMin + tetris2.rectangle.xMax) / 2 + decalage,
        tetris2.rectangle.yMin - 0.5,
        undefined,
        undefined,
        undefined,
        'gauche',
      )

      const visuelUniteLongueur = segment(
        pointAbstrait(xmax - (2 + decalageVisuelAire), ymin + 1),
        pointAbstrait(xmax - (1 + decalageVisuelAire), ymin + 1),
      )
      visuelUniteLongueur.epaisseur = 1.5
      visuelUniteLongueur.styleExtremites = '|-|'
      visuelUniteLongueur.tailleExtremites = 2
      const texteUniteLongueur = latex2d(
        '1 ' + uniteLongueur.slice(1, -1),
        xmax - (1.5 + decalageVisuelAire),
        ymin + 0.5,
        {},
      )

      const visuelUniteAire = carre(
        pointAbstrait(xmax - 2, ymin + 1),
        pointAbstrait(xmax - 1, ymin + 1),
      )
      visuelUniteAire.couleurDeRemplissage = colorToLatexOrHTML('gray')
      const texteUniteAire = latex2d(
        '1 ' + uniteAire.slice(1, -1),
        xmax - 1.5,
        ymin + 0.5,
        {},
      )

      const objets = [
        grille(xmin, ymin, xmax, ymax),
        tetris.poly,
        tetris2.poly,
        fig1,
        fig2,
        visuelUniteLongueur,
        texteUniteLongueur,
      ]
      if (uniteLongueur === uniteLongueurDefaut)
        objets.push(visuelUniteAire, texteUniteAire)
      const figure = mathalea2d(
        Object.assign(
          { pixelsParCm: 20, scale: 0.5 },
          fixeBordures(objets, {
            rxmin: -0.1,
            rymin: -0.1,
            rxmax: 0.1,
            rymax: 0.1,
          }),
        ),
        objets,
      )
      const texte =
        this.sup2 === 1
          ? `${figure}
Quelles sont les aires des figures ci-dessus ?<br>
 ${ajouteQuestionMathlive({
   exercice: this,
   question: 2 * i,
   typeInteractivite: 'mathlive',
   texteAvant: 'figure $1$ : ',
   texteApres: ` ${uniteAire} ${sp(17)} `,
   reponseParams: { formatInteractif: 'mathalea-mathfield' },
   objetReponse: { reponse: { value: aire } },
 })}
 ${ajouteQuestionMathlive({
   exercice: this,
   question: 2 * i + 1,
   typeInteractivite: 'mathlive',
   texteAvant: 'figure $2$ : ',
   texteApres: ` ${uniteAire}.`,
   reponseParams: { formatInteractif: 'mathalea-mathfield' },
   objetReponse: { reponse: { value: aire2 } },
 })}`
          : this.sup2 === 2
            ? `${figure}
 Quels sont les périmètres des figures ci-dessus ?<br>
  ${ajouteQuestionMathlive({
    exercice: this,
    question: 2 * i,
    typeInteractivite: 'mathlive',
    texteAvant: 'figure $1$ : ',
    texteApres: ` ${uniteLongueur} ${sp(6)}`,
    reponseParams: { formatInteractif: 'mathalea-mathfield' },
    objetReponse: { reponse: { value: tetris.poly.perimetre } },
  })}
  ${ajouteQuestionMathlive({
    exercice: this,
    question: 2 * i + 1,
    typeInteractivite: 'mathlive',
    texteAvant: 'figure $2$ : ',
    texteApres: ` ${uniteLongueur}.`,
    reponseParams: { formatInteractif: 'mathalea-mathfield' },
    objetReponse: { reponse: { value: tetris2.poly.perimetre } },
  })}`
            : `${figure}
  Quels sont les aires et les périmètres des figures ci-dessus ?<br>
  ${ajouteQuestionMathlive({
    exercice: this,
    question: 4 * i,
    typeInteractivite: 'mathlive',
    texteAvant: ' Aire figure $1$ : ',
    texteApres: `${uniteAire} ${sp(17)}`,
    reponseParams: { formatInteractif: 'mathalea-mathfield' },
    objetReponse: { reponse: { value: aire } },
  })}
  ${ajouteQuestionMathlive({
    exercice: this,
    question: 4 * i + 1,
    typeInteractivite: 'mathlive',
    texteAvant: 'Aire figure $2$ : ',
    texteApres: `${uniteAire}.`,
    reponseParams: { formatInteractif: 'mathalea-mathfield' },
    objetReponse: { reponse: { value: aire2 } },
  })}${this.interactif ? '<br>' : ''}
  ${ajouteQuestionMathlive({
    exercice: this,
    question: 4 * i + 2,
    typeInteractivite: 'mathlive',
    texteAvant: 'Périmètre figure $1$ : ',
    texteApres: `${uniteLongueur} ${sp(6)}`,
    reponseParams: { formatInteractif: 'mathalea-mathfield' },
    objetReponse: { reponse: { value: tetris.poly.perimetre } },
  })}
  ${ajouteQuestionMathlive({
    exercice: this,
    question: 4 * i + 3,
    typeInteractivite: 'mathlive',
    texteAvant: 'Périmètre figure $2$ : ',
    texteApres: `${uniteLongueur}.`,
    reponseParams: { formatInteractif: 'mathalea-mathfield' },
    objetReponse: { reponse: { value: tetris2.poly.perimetre } },
  })}`
      const texteCorr =
        this.sup2 === 1
          ? `L'aire de la figure $1$ est $${miseEnEvidence(aire)}$ ${uniteAire} et celle de la figure $2$ est  $${miseEnEvidence(aire2)}$ ${uniteAire}.`
          : this.sup2 === 2
            ? `Le périmètre de la figure $1$ est $${miseEnEvidence(tetris.poly.perimetre)}$ ${uniteLongueur} et celui de la figure $2$ est $${miseEnEvidence(tetris2.poly.perimetre)}$ ${uniteLongueur}.`
            : `L'aire de la figure $1$ est $${miseEnEvidence(aire)}$ ${uniteAire}, celle de la figure $2$ est $${miseEnEvidence(aire2)}$ ${uniteAire}.<br>
          Le périmètre de la figure $1$ est $${miseEnEvidence(tetris.poly.perimetre)}$ ${uniteLongueur} et celui de la figure $2$ est $${miseEnEvidence(tetris2.poly.perimetre)}$ ${uniteLongueur}.`
      this.listeQuestions.push(texte)
      this.listeCorrections.push(texteCorr)
    }
  }
}
