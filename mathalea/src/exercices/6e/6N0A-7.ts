import { texteEnCouleurEtGras, miseEnEvidence } from '../../lib/outils/embellissements'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { nombreEnLettres } from '../../modules/nombreEnLettres'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'

export const titre = 'Écrire un nombre en chiffres ou en lettres'

export const interactifReady = true

/**
 * Lire un nombre / écrire un nombre : passer d'une écriture à une autre et inversement
 * On peut fixer la classe maximale : unités, milliers, millions, milliards
 * @author Jean-claude Lhote

 */

export const uuid = '6babf'

export const refs = {
  'fr-fr': ['6N0A-7'],
  'fr-2016': ['6N10-0'],
  'fr-ch': ['9R1NO2B-2', '9R2NO2B-2', '9R3NO2B-2', 'PRQNO01A-3', 'PRQNO02B-7'], // Primaire anciennement :['9NO1-2'],
}
export default class ÉcrireNombresEntiers extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Type de questions',
      3,
      "1 : Écrire en lettres un nombre donné en chiffres\n2 : Écrire en chiffres un nombre donné en lettres\n3 : Passer d'une écriture à l'autre",
    ]
    this.besoinFormulaire2Numerique = [
      'Niveau',
      4,
      "1 : Élémentaire (jusqu'à la classe des milliers) \n2 : Facile (jusqu'à la classe des millions)\n3 : Moyen (jusqu'à la classe des milliards)\n4 : Difficile",
    ]

    this.nbQuestions = 5

    this.sup = 1
    this.sup2 = 3
  }

  nouvelleVersion() {
    let typeDeConsigne: number[] = []
    if (this.sup === 1) {
      this.consigne = 'Écrire le nombre en lettres.'
      typeDeConsigne = combinaisonListes([1], this.nbQuestions)
    } else if (this.sup === 2) {
      this.consigne = 'Écrire le nombre en chiffres.'
      typeDeConsigne = combinaisonListes([2], this.nbQuestions)
      if (this.interactif)
        this.consigne = 'Écrire le nombre en chiffres sans oublier les espaces.'
    } else if (this.sup === 3) {
      this.consigne =
        "Passer de l'écriture en chiffres à celle en lettres et inversement."
      typeDeConsigne = combinaisonListes([1, 2], this.nbQuestions)
    }
    let typesDeQuestionsDisponibles
    if (this.sup2 === 1) typesDeQuestionsDisponibles = [1, 1, 1, 2, 2]
    else if (this.sup2 === 2) typesDeQuestionsDisponibles = [1, 2, 2, 2, 3]
    else if (this.sup2 === 3) typesDeQuestionsDisponibles = [2, 2, 3, 3, 4]
    else typesDeQuestionsDisponibles = [2, 3, 3, 4, 4]

    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posées mais l'ordre diffère à chaque "cycle"
    for (
      let i = 0, texte, texteCorr, a, b, c, nombre, tranche, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      nombre = 0
      tranche = []
      while (nombre === 0) {
        tranche.splice(0)
        for (let j = 0; j < listeTypeDeQuestions[i]; j++) {
          a = randint(1, 9)
          b = randint(1, 9)
          c = randint(1, 9)
          tranche.push(
            choice([
              0,
              100,
              20,
              80,
              a,
              a * 100,
              a * 100 + b * 10 + c,
              a * 100 + 80 + b,
              a * 10,
              a * 100 + b * 10 + 1,
            ]),
          )
        }
        for (let j = 0; j < listeTypeDeQuestions[i]; j++) {
          nombre += tranche[j] * 10 ** (j * 3)
        }
        if (tranche[listeTypeDeQuestions[i] - 1] === 0) nombre = 0
      }
      if (typeDeConsigne[i] === 1) {
        handleAnswers(this, i, {
          reponse: { value: nombreEnLettres(nombre) },
        })
        if (context.vue !== 'diap')
          texte = `$${texNombre(nombre)} ${!this.interactif ? ' : $' : '$ <br>' + ajouteChampTexteMathLive(this, i, KeyboardType.alphanumeric)}`
        else texte = `$${texNombre(nombre)}$`
        if (context.vue !== 'diap')
          texteCorr = `$${texNombre(nombre)}$ : ${texteEnCouleurEtGras(nombreEnLettres(nombre))}`
        else texteCorr = `${texteEnCouleurEtGras(nombreEnLettres(nombre))}`
      } else {
        handleAnswers(this, i, {
          reponse: {
            value: texNombre(nombre),
            options: { nombreAvecEspace: true },
          },
        })
        if (context.vue !== 'diap')
          texte = `${nombreEnLettres(nombre)} ${!this.interactif ? ' : ' : ' <br>' + ajouteChampTexteMathLive(this, i, KeyboardType.numbersSpace, { espace: true })}`
        else texte = `${nombreEnLettres(nombre)}`
        if (context.vue !== 'diap')
          texteCorr = `${nombreEnLettres(nombre)} : $${miseEnEvidence(texNombre(nombre))}$`
        else texteCorr = `$${miseEnEvidence(texNombre(nombre))}$`
      }
      if (this.listeQuestions.indexOf(texte) === -1) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
