import Figure from 'apigeom'
import { wrapperApigeomToMathalea } from '../../lib/apigeom/apigeomZoom'
import { centrage } from '../../lib/format/miseEnPage'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'
export const titre = 'Utiliser une échelle graphique'
export const interactifReady = true

export const dateDePublication = '20/6/2025'

export const uuid = '1651d'
export const refs = {
  'fr-fr': ['6P3E-1'],
  'fr-ch': ['10CTFA1F-2', '10LCFA1F-2', '10LSFA1F-2', 'PRQPF03B-3', 'PRQPF04B-3'],
}

/**
 * Utiliser une échelle graphique sans prendre de mesures sur la feuille.
 * @author Rémi Angot

*/
export default class ExerciceEchelleGraphique extends Exercice {
  constructor() {
    super()
    this.consigne = ''
    this.nbQuestions = 2
    this.besoinFormulaireNumerique = [
      'Type de problème',
      3,
      '1: Déterminer les dimensions réelles\n2 : Déterminer les dimensions sur le plan\n3 : Mélange ',
    ]
    this.sup = 3
    this.comment =
      "L'échelle graphique est de $1$ cm pour $2$, $4$, $5$ ou $10$ m. Dans une question on demande les dimensions réelles et dans l'autre celles sur le plan avec un point par réponse soit $4$ points au total."
  }

  nouvelleVersion() {
    const nombreDeMetresPour1Cm = choice([2, 4, 5, 10])
    const figure = new Figure({
      xMin: -1,
      yMin: -0.3,
      width: 90,
      height: 50,
      isDynamic: false,
    })
    const m = figure.create('Point', { x: 0, y: 0, isVisible: false })
    const n = figure.create('Point', { x: 1, y: 0, isVisible: false })
    figure.create('Segment', { point1: m, point2: n, shape: '|-|' })
    figure.create('TextByPosition', {
      x: 0.5,
      y: 0.6,
      text: `${nombreDeMetresPour1Cm} m`,
    })
    if (context.isHtml) {
      this.introduction = `Pour tout l'exercice, l'échelle graphique est de $1$ cm pour $${nombreDeMetresPour1Cm}$ m.`
      this.introduction += `${centrage(wrapperApigeomToMathalea(figure))}`
    } else {
      this.introduction =
        "Pour tout l'exercice, l'échelle graphique est la suivante : <br>"
      this.introduction += figure.latex({
        includePreambule: false,
        xMax: figure.xMax,
        xMin: figure.xMin,
        yMax: figure.yMax,
        yMin: figure.yMin,
      })
    }

    const rectangles = [
      { name: 'terrain de football', genre: 'm', width: 68, height: 105 },
      { name: 'terrain de rugby', genre: 'm', width: 68, height: 100 },
      { name: 'terrain de handball', genre: 'm', width: 20, height: 40 },
      { name: 'terrain de basket', genre: 'm', width: 15, height: 28 },
      { name: 'terrain de tennis', genre: 'm', width: 8.2, height: 23.7 },
      { name: 'piscine olympique', genre: 'f', width: 25, height: 50 },
      { name: 'piscine', genre: 'f', width: 10, height: 25 },
      { name: 'salle de classe', genre: 'f', width: 6, height: 9 },
      { name: 'salle de réunion', genre: 'f', width: 8, height: 12 },
      { name: 'salle de spectacle', genre: 'f', width: 15, height: 20 },
      { name: 'salle de sport', genre: 'f', width: 20, height: 30 },
      { name: 'salle de concert', genre: 'f', width: 25, height: 40 },
      { name: 'salle de cinéma', genre: 'f', width: 15, height: 20 },
      { name: 'salle de danse', genre: 'f', width: 10, height: 15 },
      { name: 'salle de conférence', genre: 'f', width: 12, height: 18 },
    ]

    const typesDeQuestionsDisponibles = []
    if (this.sup === 1) {
      typesDeQuestionsDisponibles.push('réelle')
    } else if (this.sup === 2) {
      typesDeQuestionsDisponibles.push('carte')
    } else {
      typesDeQuestionsDisponibles.push('réelle', 'carte')
    }
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const typeDeQuestion = listeTypeDeQuestions[i]
      const rectangle = choice(rectangles)
      let texte = ''
      let correction = ''
      switch (typeDeQuestion) {
        case 'réelle':
          texte = `Quelles sont les dimensions réelles ${rectangle.genre === 'm' ? "d'un" : "d'une"} ${rectangle.name} représenté${rectangle.genre === 'm' ? '' : 'e'} par un rectangle de longueur $${texNombre(rectangle.height / nombreDeMetresPour1Cm)}\\text{ cm}$ et de largeur $${texNombre(rectangle.width / nombreDeMetresPour1Cm)}\\text{ cm}$ ?`
          if (this.interactif) {
            texte +=
              '<br>' +
              remplisLesBlancs(
                this,
                i,
                '\\text{Longueur} = %{champ1}~\\text{m} \\quad \\text{Largeur} = %{champ2}~\\text{m}',
                KeyboardType.clavierDeBase,
              )
            handleAnswers(
              this,
              i,
              {
                bareme: (listePoints) => [listePoints[0] + listePoints[1], 2],
                champ1: { value: rectangle.height },
                champ2: { value: rectangle.width },
              },
              { formatInteractif: 'fillInTheBlank' },
            )
          }
          correction =
            "On sait que l'échelle graphique est de $1$ cm pour $" +
            nombreDeMetresPour1Cm +
            '$ m.<br>'
          correction += `Donc, la longueur réelle d'un${rectangle.genre === 'm' ? '' : 'e'} ${rectangle.name} est $${texNombre(rectangle.height / nombreDeMetresPour1Cm)}~\\text{cm} \\times ${nombreDeMetresPour1Cm}~\\text{m/cm} = ${miseEnEvidence(texNombre(rectangle.height))}~\\text{m}$ et sa largeur réelle est $${texNombre(rectangle.width / nombreDeMetresPour1Cm)}~\\text{cm} \\times ${nombreDeMetresPour1Cm}~\\text{m/cm} = ${miseEnEvidence(texNombre(rectangle.width))}~\\text{m}$.`
          break
        default: // case 'carte':
          texte = `Un${rectangle.genre === 'm' ? '' : 'e'} ${rectangle.name} est un rectangle de longueur $${texNombre(rectangle.height)}\\text{ m}$ et de largeur $${texNombre(rectangle.width)}\\text{ m}$. Quelles sont ses dimensions sur le plan ?`
          if (this.interactif) {
            texte +=
              '<br>' +
              remplisLesBlancs(
                this,
                i,
                '\\text{Longueur} = %{champ1}~\\text{cm} \\quad \\text{Largeur} = %{champ2}~\\text{cm}',
                KeyboardType.clavierDeBase,
              )
            handleAnswers(
              this,
              i,
              {
                bareme: (listePoints) => [listePoints[0] + listePoints[1], 2],
                champ1: { value: rectangle.height / nombreDeMetresPour1Cm },
                champ2: { value: rectangle.width / nombreDeMetresPour1Cm },
              },
              { formatInteractif: 'fillInTheBlank' },
            )
          }
          correction =
            "On sait que l'échelle graphique est de $1$ cm pour $" +
            nombreDeMetresPour1Cm +
            '$ m.<br>'
          correction += `Donc, la longueur sur le plan d'un${rectangle.genre === 'm' ? '' : 'e'} ${rectangle.name} est $${texNombre(rectangle.height)}~\\text{m} \\div ${nombreDeMetresPour1Cm}~\\text{m/cm} = ${miseEnEvidence(texNombre(rectangle.height / nombreDeMetresPour1Cm))}~\\text{cm}$ et sa largeur sur le plan est $${texNombre(rectangle.width)}~\\text{m} \\div ${nombreDeMetresPour1Cm}~\\text{m/cm} = ${miseEnEvidence(texNombre(rectangle.width / nombreDeMetresPour1Cm))}~\\text{cm}$.`
          correction += '<br>'
          break
      }

      if (this.questionJamaisPosee(i, rectangle.name)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = correction
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
