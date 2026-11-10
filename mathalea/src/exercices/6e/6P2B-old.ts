import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { personne } from '../../lib/outils/Personne'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'
import { queDevant } from '../../lib/outils/outilString'

export const titre =
  'Trouver une probabilité sous forme fractionnaire, décimale et en pourcentage'
export const interactifReady = true

/**
 * @author Éric Elter
 */
export const dateDePublication = '10/08/2025'
export const uuid = 'b8296'

export const refs = {
  'fr-fr': [],
  'fr-2016': [],
  'fr-ch': ['NR'],
}
export default class Probabilites6e extends Exercice {
  constructor() {
    super()
    this.spacing = 2
    this.nbQuestions = 3
  }

  nouvelleVersion() {
    const fracPossible: [number, number, number][] = [
      // Numérateur, Dénominateur, Pourcentage
      [1, 2, 50],
      [1, 4, 25],
      [3, 4, 75],
      [1, 5, 20],
      [2, 5, 40],
      [3, 5, 60],
      [4, 5, 80],
      [1, 10, 10],
      [3, 10, 30],
      [7, 10, 70],
      [9, 10, 90],
    ]
    const couleur = ['noire', 'blanche', 'rouge', 'bleue', 'verte', 'jaune']
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const frac: [number, number, number] = choice(fracPossible)
      const choix = choice([true, false])
      const choixCouleur = [choice(couleur)]
      choixCouleur.push(choice(couleur, choixCouleur[0]))
      const quidam = personne()
      const boule1 = frac[0]
      const boule2 = frac[1] - frac[0]
      let texte = `${quidam.prenom} veut piocher une boule dans un sac contenant $${choix ? boule1 : boule2}$ boule${(choix ? boule1 : boule2) === 1 ? '' : 's'} ${choixCouleur[0]}${(choix ? boule1 : boule2) === 1 ? '' : 's'}
      et $${!choix ? boule1 : boule2}$ boule${(!choix ? boule1 : boule2) === 1 ? '' : 's'} ${choixCouleur[1]}${(!choix ? boule1 : boule2) === 1 ? '' : 's'}.<br>
      Quelle est la probabilité ${queDevant(quidam.prenom)} pioche une boule ${choixCouleur[choix ? 0 : 1]} ?`
      texte += "<br>Donner la réponse sous forme d'une fraction"
      texte += this.interactif
        ? ajouteChampTexteMathLive(
            this,
            3 * i,
            KeyboardType.clavierDeBaseAvecFraction,
            { texteAvant: ' : ', texteApres: '.' },
          )
        : '.'
      texte += "<br>Donner la réponse sous forme d'un nombre décimal"
      texte += this.interactif
        ? ajouteChampTexteMathLive(
            this,
            3 * i + 1,
            KeyboardType.clavierNumbers,
            { texteAvant: ' : ', texteApres: '.' },
          )
        : '.'
      texte += "<br>Donner la réponse sous forme d'un pourcentage"
      texte += this.interactif
        ? ajouteChampTexteMathLive(
            this,
            3 * i + 2,
            KeyboardType.clavierNumbers,
            { texteAvant: ' : ', texteApres: '%.' },
          )
        : '.'
      const reponseFrac = new FractionEtendue(boule1, boule1 + boule2)
        .texFraction
      const reponseDecimale = new FractionEtendue(boule1, boule1 + boule2)
        .valeurDecimale
      handleAnswers(this, 3 * i, {
        reponse: { value: reponseFrac, options: { fractionEgale: true } },
      })
      handleAnswers(this, 3 * i + 1, {
        reponse: {
          value: reponseDecimale,
          options: { nombreDecimalSeulement: true },
        },
      })
      handleAnswers(this, 3 * i + 2, {
        reponse: {
          value: frac[2].toString(),
          options: { nombreDecimalSeulement: true },
        },
      })
      const texteCorr = `La probabilité ${queDevant(quidam.prenom)} pioche une boule ${choixCouleur[choix ? 0 : 1]} est de $${miseEnEvidence(reponseFrac)}$, soit $${miseEnEvidence(texNombre(reponseDecimale))}$, soit encore $${miseEnEvidence(texNombre(frac[2]))}$ %.`

      if (this.questionJamaisPosee(i, ...frac)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
