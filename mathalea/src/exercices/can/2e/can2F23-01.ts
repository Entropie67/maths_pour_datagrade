import { bleuMathalea } from '../../../lib/colors'
import { propositionsQcm } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { abs } from '../../../lib/outils/nombres'
import { texNombre } from '../../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'
export const titre = 'Utiliser la fonction carré pour comparer deux images'
export const interactifReady = true

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '30/12/2021' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export const uuid = '991c2'

export const refs = {
  'fr-fr': ['can2F23-01', '2F22-flash3'],
  'fr-ch': [],
}
export default class ComparerAvecFctCarre extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 1
    this.spacing = 1.2
    this.tip = `La fonction carré est :<br>
      <ul style="list-style-type: disc; padding-left: 1.5em;">
        <li>strictement <strong>décroissante</strong> sur $]-\\infty\\,;\\,0]$</li>
        <li>strictement <strong>croissante</strong> sur $[0\\,;\\,+\\infty[$</li>
      </ul>`
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte, texteCorr, a, b, props
      const choix = choice([1, 2, 3])
      switch (
        choix //
      ) {
        case 1:
          a =
            randint(0, 5) +
            randint(5, 9) / 10 +
            randint(5, 9) / 100 +
            randint(0, 2) / 1000
          b = a + ((2 * randint(1, 9)) / 1000) * choice([1, -1])
          texte = 'Sélectionner la réponse correcte. '
          if (a < b) {
            this.autoCorrection[i] = {
              enonce: texte,
              propositions: [
                {
                  texte: `$${texNombre(a)}^2<${texNombre(b)}^2$`,
                  statut: true,
                },
                {
                  texte: `$${texNombre(a)}^2>${texNombre(b)}^2$`,
                  statut: false,
                },
              ],
            }
          } else {
            this.autoCorrection[i] = {
              enonce: texte,
              propositions: [
                {
                  texte: `$${texNombre(a)}^2>${texNombre(b)}^2$`,
                  statut: true,
                },
                {
                  texte: `$${texNombre(a)}^2<${texNombre(b)}^2$`,
                  statut: false,
                },
              ],
            }
          }

          props = propositionsQcm(this, i)
          if (this.interactif) texte += props.texte
          else {
            texte = `Comparer $${texNombre(a)}^2$ et $${texNombre(b)}^2$.`
          }

          texteCorr = ` La fonction carré étant strictement croissante sur $[0;+\\infty[$, elle conserve l'ordre. Cela signifie que deux nombres positifs sont rangés dans le même ordre que leurs carrés. <br>
            Autrement dit, si $a$ et $b$ sont deux nombres positifs et si $a < b$, alors $a^2 < b^2$.<br>`

          if (a < b) {
            texteCorr += `Comme $${texNombre(a)}${miseEnEvidence('<', bleuMathalea)}${texNombre(b)}$,
          alors $${miseEnEvidence(`${texNombre(a)}^2 < ${texNombre(b)}^2`)}$.`
          } else {
            texteCorr += `Comme $${texNombre(b)}${miseEnEvidence('<', bleuMathalea)}${texNombre(a)}$,
          alors $${miseEnEvidence(`${texNombre(a)}^2 > ${texNombre(b)}^2`)}$.`
          }
          this.canEnonce = `Comparer $${texNombre(a)}^2$ et $${texNombre(b)}^2$.`

          break
        case 2:
          a =
            (randint(0, 5) +
              randint(5, 9) / 10 +
              randint(5, 9) / 100 +
              randint(0, 2) / 1000) *
            -1
          b = a + ((2 * randint(1, 9)) / 1000) * choice([1, -1])
          texte = 'Sélectionner la réponse correcte. '
          if (a < b) {
            this.autoCorrection[i] = {
              enonce: texte,
              propositions: [
                {
                  texte: `$(${texNombre(a)})^2>(${texNombre(b)})^2$`,
                  statut: true,
                },
                {
                  texte: `$(${texNombre(a)})^2<(${texNombre(b)})^2$`,
                  statut: false,
                },
              ],
            }
          } else {
            this.autoCorrection[i] = {
              enonce: texte,
              propositions: [
                {
                  texte: `$(${texNombre(a)})^2<(${texNombre(b)})^2$`,
                  statut: true,
                },
                {
                  texte: `$(${texNombre(a)})^2>(${texNombre(b)})^2$`,
                  statut: false,
                },
              ],
            }
          }

          props = propositionsQcm(this, i)
          if (this.interactif) texte += props.texte
          else {
            texte = `Comparer $(${texNombre(a)})^2$ et $(${texNombre(b)})^2$.`
          }

          texteCorr = ` La fonction carré étant strictement décroissante sur $]-\\infty;0]$, elle change l'ordre. <br>
            Cela signifie que deux nombres négatifs sont rangés dans l'ordre inverse de leurs carrés.<br>
            Autrement dit, si $a$ et $b$ sont deux nombres négatifs et si $a < b$, alors $a^2 > b^2$.<br>`

          if (a < b) {
            texteCorr += `Comme $${texNombre(a)}${miseEnEvidence('<', bleuMathalea)}${texNombre(b)}$,
        alors $${miseEnEvidence(`(${texNombre(a)})^2 > (${texNombre(b)})^2`)}$.`
          } else {
            texteCorr += `Comme $${texNombre(b)}${miseEnEvidence('<', bleuMathalea)}${texNombre(a)}$,
        alors $${miseEnEvidence(`(${texNombre(a)})^2 < (${texNombre(b)})^2`)}$.`
          }
          this.canEnonce = `Comparer $(${texNombre(a)})^2$ et $(${texNombre(b)})^2$.`

          break
        case 3:
        default:
          a =
            randint(1, 6) +
            randint(5, 9) / 10 +
            randint(5, 9) / 100 +
            randint(0, 2) / 1000
          b = -1 * a + ((2 * randint(1, 9)) / 1000) * choice([1, -1])
          texte = 'Sélectionner la réponse correcte. '
          if (abs(a) < abs(b)) {
            this.autoCorrection[i] = {
              enonce: texte,
              propositions: [
                {
                  texte: `$(${texNombre(b)})^2>${texNombre(a)}^2$`,
                  statut: true,
                },
                {
                  texte: `$${texNombre(a)}^2>(${texNombre(b)})^2$`,
                  statut: false,
                },
              ],
            }
          } else {
            this.autoCorrection[i] = {
              enonce: texte,
              propositions: [
                {
                  texte: `$${texNombre(a)}^2>(${texNombre(b)})^2$`,
                  statut: true,
                },
                {
                  texte: `$(${texNombre(b)})^2>${texNombre(a)}^2$`,
                  statut: false,
                },
              ],
            }
          }

          props = propositionsQcm(this, i)
          if (this.interactif) texte += props.texte
          else {
            if (choice([true, false])) {
              texte = `Comparer $${texNombre(a)}^2$ et $(${texNombre(b)})^2$.`
              this.canEnonce = `Comparer $${texNombre(a)}^2$ et $(${texNombre(b)})^2$.`
            } else {
              texte = `Comparer $(${texNombre(b)})^2$ et $${texNombre(a)}^2$.`
            }
            this.canEnonce = `Comparer $(${texNombre(b)})^2$ et $${texNombre(a)}^2$.`
          }

          texteCorr = ` Le nombre $${texNombre(b)}$ est négatif, alors que le nombre $${texNombre(a)}$ est positif.
            Comme deux nombres opposés ont le même carré, comparer $${texNombre(a)}^2$ et $(${texNombre(b)})^2$
            revient à comparer $${texNombre(a)}^2$ et $${texNombre(-b)}^2$.<br>
             La fonction carré étant strictement croissante sur $[0;+\\infty[$, elle conserve l'ordre.<br>
             Cela signifie que deux nombres positifs sont rangés dans le même ordre que leurs carrés.<br>
             Autrement dit, si $a$ et $b$ sont deux nombres positifs et si $a < b$, alors $a^2 < b^2$.<br>`
          if (abs(a) < abs(b)) {
            texteCorr += `Comme $${texNombre(a)}${miseEnEvidence('<', bleuMathalea)}${texNombre(-b)}$,
        alors $${texNombre(a)}^2${miseEnEvidence('<', bleuMathalea)}${texNombre(-b)}^2$.<br>
        On en déduit que $${miseEnEvidence(`(${texNombre(b)})^2 > ${texNombre(a)}^2`)}$.`
          } else {
            texteCorr += `Comme $${texNombre(a)}${miseEnEvidence('>', bleuMathalea)}${texNombre(-b)}$,
        alors $${texNombre(a)}^2${miseEnEvidence('>', bleuMathalea)}${texNombre(-b)}^2$.<br>
        On en déduit que $${miseEnEvidence(`${texNombre(a)}^2 > (${texNombre(b)})^2`)}$.`
          }

          break
      }
      if (this.questionJamaisPosee(i, choix, a, b)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
