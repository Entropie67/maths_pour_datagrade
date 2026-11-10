import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { latex2d } from '../../lib/2d/textes'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { stringNombre, texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Calculer le périmètre d’un rectangle'
export const interactifReady = true
export const interactifType = 'mathLive'

export const dateDePublication = '07/11/2026'

export const uuid = '24d84'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * Modèle d'une figure accessible : `description`, `decorative` et `demandeLaVue`.
 * Règles : documentation/developpement/auteurs-exercices/rediger-un-exercice.md
 * @author Équipe MathALÉA
 */
export default class FigureAccessible extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.consigne = 'Calculer le périmètre du rectangle.'
    // Seulement si décrire la figure donne la réponse (voir 6G0-7), avec la raison :
    // this.demandeLaVue = true // Décrire la position des points donnerait la réponse.
  }

  nouvelleVersion() {
    // Figure sans information : `decorative` la masque aux lecteurs d'écran.
    const ornement = polygone(
      pointAbstrait(0, 0),
      pointAbstrait(6, 0),
      pointAbstrait(6, 0.3),
      pointAbstrait(0, 0.3),
    )
    this.introduction = mathalea2d(
      Object.assign({ decorative: true }, fixeBordures([ornement])),
      ornement,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const largeur = randint(20, 50) / 10
      const longueur = randint(55, 90) / 10
      const perimetre = 2 * (largeur + longueur)

      const A = pointAbstrait(0, 0)
      const B = pointAbstrait(longueur, 0)
      const C = pointAbstrait(longueur, largeur)
      const D = pointAbstrait(0, largeur)
      const objets = [
        polygone(A, B, C, D),
        latex2d(
          `${texNombre(longueur, 1)}\\text{ cm}`,
          longueur / 2,
          largeur + 0.5,
          { letterSize: 'small' },
        ),
        latex2d(
          `${texNombre(largeur, 1)}\\text{ cm}`,
          longueur + 1.2,
          largeur / 2,
          { letterSize: 'small' },
        ),
      ]

      // La description reprend les valeurs tirées, en texte brut :
      // `stringNombre()` et non `texNombre()`, qui donnerait « 3{,}5 ».
      // Elle ne contient pas le périmètre, que l'élève doit trouver.
      const description = `Rectangle de longueur ${stringNombre(longueur, 1)}${sp()}cm et de largeur ${stringNombre(largeur, 1)}${sp()}cm.`

      let texte = mathalea2d(
        Object.assign({ scale: 0.7, description }, fixeBordures(objets)),
        objets,
      )
      texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers, {
        texteAvant: 'Périmètre : ',
        texteApres: '$\\text{ cm}$',
      })
      const texteCorr = `Le périmètre du rectangle est de $2\\times(${texNombre(longueur, 1)}+${texNombre(largeur, 1)})=${miseEnEvidence(texNombre(perimetre, 1))}\\text{ cm}$.`

      if (this.questionJamaisPosee(i, largeur, longueur)) {
        handleAnswers(this, i, { reponse: { value: texNombre(perimetre, 1) } })
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
