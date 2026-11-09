import { imposerCorrectionsQcm } from '../../lib/interactif/alignerMiseEnEvidenceQcm'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import SchemaEnBoite from '../../lib/outils/SchemaEnBoite'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'

export const titre = 'Identifier des patterns numériques (divisibilité)'

/**
 * On donne une liste de nombre et on demande si des nombres sont dans cette liste.
 *
 *
 * @author Jean-claude Lhote (idée de Claire Bruneau)
 * 6N43-1
 */
export const uuid = 'fa2ec'

export const refs = {
  'fr-fr': ['6N43-1'],
  'fr-ch': ['9R1NO1A-11', '9R2NO1A-11', '9R3NO1A-11', 'PRQNO14A-6'],
}
export default class NumericPatterns extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = ['difficulté augmentée', false]
    this.nbQuestions = 5
    this.sup = false
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const raison = choice([2, 3, 4, 5, 6, 8])
      const u0 = randint(2, 9)
      const k = this.sup ? randint(2, 5) : 0
      const termes = [0, 1, 2, 3]
        .map((el) => el + k)
        .map((i) => u0 + i * raison)
      const rang0 = choice([
        randint(10, 20) * 10 + randint(0, 9),
        randint(10, 20) * 10 + randint(0, 9),
        randint(20, 90) * 100 + randint(0, 9) * 10 + randint(0, 9),
      ])
      const rang1 = choice([
        randint(10, 20) * 10 + randint(0, 9),
        randint(20, 90) * 100 + randint(0, 9) * 10 + randint(0, 9),
        randint(20, 90) * 100 + randint(0, 9) * 10 + randint(0, 9),
      ])
      const offset0 = choice([randint(0, raison - 1), 0, raison, 1])
      const offset1 = choice([randint(0, raison - 1), 0, raison, 1])
      const nb0 = rang0 * raison + offset0
      const nb1 = rang1 * raison + offset1
      const schema = new SchemaEnBoite({
        lignes: [
          {
            barres: [
              ...termes.map((terme, j) => ({
                content: `$${texNombre(terme, 0)}$`,
                length: 2,
                color: 'white',
                type: 'boite',
              })),
              ...[0, 1, 2].map(() => ({
                content: '$\\ldots$',
                length: 2,
                color: 'white',
              })),
            ],
          },
        ],
      })
      let texte = `Voici une suite de nombres :<br>
      ${schema.display()}<br>
      Les nombres $${texNombre(nb0, 0)}$ et $${texNombre(nb1, 0)}$ sont dans cette suite ?`
      this.autoCorrection[i] = {}
      this.autoCorrection[i].options = { ordered: true, radio: true }
      this.autoCorrection[i].propositions = [
        {
          texte: 'Oui pour les deux',
          statut: (nb0 - u0) % raison === 0 && (nb1 - u0) % raison === 0,
        },
        {
          texte: 'Oui pour le premier, non pour le second',
          statut: (nb0 - u0) % raison === 0 && (nb1 - u0) % raison !== 0,
        },
        {
          texte: 'Non pour le premier, oui pour le second',
          statut: (nb0 - u0) % raison !== 0 && (nb1 - u0) % raison === 0,
        },
        {
          texte: 'Non pour les deux',
          statut: (nb0 - u0) % raison !== 0 && (nb1 - u0) % raison !== 0,
        },
      ]
      const monQcm = propositionsQcm(this, i)
      texte += `<br><br>${monQcm.texte}`
      const texteCorr = `Cette suite de nombres démarre à $${texNombre(u0, 0)}$ et chaque terme est obtenu en ajoutant $${raison}$ au terme précédent.<br>
      $${texNombre(nb0, 0)}$ est dans la suite si et seulement si la différence entre $${texNombre(nb0, 0)}$ et $${texNombre(u0, 0)}$ est un multiple de $${raison}$.<br>
      $${texNombre(nb0, 0)} - ${texNombre(u0, 0)} = ${texNombre(nb0 - u0, 0)}$.<br>
      et ${
        (nb0 - u0) % raison === 0
          ? `$${texNombre(nb0 - u0, 0)}$ est un multiple de $${raison}$`
          : `$${texNombre(nb0 - u0, 0)}$ n'est pas un multiple de $${raison}$`
      }.<br>
      Donc, $${texNombre(nb0, 0)}$ ${texteEnCouleurEtGras((nb0 - u0) % raison === 0 ? 'est dans la suite' : "n'est pas dans la suite")}.<br>
      $${texNombre(nb1, 0)}$ est dans la suite si et seulement si la différence entre $${texNombre(nb1, 0)}$ et $${texNombre(u0, 0)}$ est un multiple de $${raison}$.<br>
      $${texNombre(nb1, 0)} - ${texNombre(u0, 0)} = ${texNombre(nb1 - u0, 0)}$.<br>
      et ${
        (nb1 - u0) % raison === 0
          ? `$${texNombre(nb1 - u0, 0)}$ est un multiple de $${raison}$`
          : `$${texNombre(nb1 - u0, 0)}$ n'est pas un multiple de $${raison}$`
      }.<br>
        Donc, $${texNombre(nb1, 0)}$ ${texteEnCouleurEtGras((nb1 - u0) % raison === 0 ? 'est dans la suite' : "n'est pas dans la suite")}.<br>
        `
      if (
        this.questionJamaisPosee(
          i,
          String(u0),
          String(raison),
          String(nb0),
          String(nb1),
        )
      ) {
        this.listeQuestions.push(texte)
        this.listeCorrections.push(texteCorr)
        i++
      }
      cpt++
    }
    imposerCorrectionsQcm(this)
  }
}
