import { miseEnEvidence } from '../../lib/outils/embellissements'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice } from '../../lib/outils/arrayOutils'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

import { amcConvert } from '../../lib/amc/amcBuilders'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'

export const titre = 'Écrire correctement les nombres décimaux'

export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCOpen'
export const dateDePublication = '15/06/2026'

/**
 * Supprimer les zéros inutiles, séparer les classes d'un nombre décimal.
 * @author Jean-claude Lhote
 */
export const uuid = 'dc349'

export const refs = {
  'fr-fr': ['6N1A-6'],
  'fr-2016': [],
  'fr-ch': ['9R1NO2B-4', '9R2NO2B-4', '9R3NO2B-4', 'PRQNO01A-4'],
}
export default class ÉcrireNombresDecimauxFormates extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 5
  }

  nouvelleVersion() {
    this.consigne =
      'Écrire les nombres en chiffres en supprimant les zéros inutiles et en séparant les classes.'
    function zeroSuperflus(n: number) {
      const nzeroEnt = choice([0, 1, 1, 1, 2, 2])
      const nzeroDec = choice([0, 1, 1, 1, 2, 2])
      let nombrestring = n.toString()
      for (let k = 0; k < nzeroEnt; k++) nombrestring = '0' + nombrestring
      for (let k = 0; k < nzeroDec; k++) nombrestring = nombrestring + '0'
      return nombrestring.replace('.', ',')
    }
    function compteZerosFinaux(n: number) {
      let cpt = 0
      while (n % 10 === 0) {
        n /= 10
        cpt++
      }
      return cpt
    }

    for (
      let i = 0,
        texte,
        texteCorr,
        a,
        b,
        c,
        nombre,
        tranche,
        nombrestring,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      do {
        nombre = 0
        tranche = []
        while (nombre === 0) {
          tranche.length = 0
          for (let j = 0; j < 2; j++) {
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
          for (let j = 0; j < 2; j++) {
            nombre += tranche[j] * 10 ** (j * 3)
          }
          if (tranche[1] === 0) nombre = 0
        }
        const nbChiffres = nombre.toString().length
        const nbZerosFinaux = compteZerosFinaux(nombre)
        if (nbChiffres - nbZerosFinaux >= 2) {
          nombre /= 10 ** randint(nbZerosFinaux + 1, nbChiffres - 1)
        } else if (nbChiffres - nbZerosFinaux >= 1) {
          nombre /= 10 ** randint(nbZerosFinaux, nbChiffres - 1)
        } else {
          nombre /= 10 ** randint(nbZerosFinaux, nbChiffres)
        }
      } while (Math.abs(nombre - Math.round(nombre)) < 0.00000001)
      nombrestring = zeroSuperflus(nombre)
      nombre = parseFloat(nombrestring.replace(',', '.'))
      texte =
        `$${nombrestring}$` +
        ajouteChampTexteMathLive(this, i, KeyboardType.numbersSpace, {
          espace: true,
          texteAvant: '$=$',
        })
      if (context.vue !== 'diap')
        texteCorr = `$${nombrestring}$ s'écrit plus lisiblement $${miseEnEvidence(texNombre(nombre, 6))}$.`
      else texteCorr = `$${miseEnEvidence(texNombre(nombre, 6))}$`
      if (context.isAmc) {
        this.autoCorrectionAMC[i] = {
          enonce: texte + '<br>',
          propositions: [
            {
              texte: texteCorr,
              statut: 1, // OBLIGATOIRE (ici c'est le nombre de lignes du cadre pour la réponse de l'élève sur AMC)
              sanscadre: true,
            },
          ],
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      } else {
        handleAnswers(this, i, {
          reponse: {
            value: texNombre(nombre, 6),
            options: { nombreAvecEspace: true },
          },
        })
      }

      if (this.questionJamaisPosee(i, nombre)) {
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
