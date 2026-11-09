import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  combinaisonListes,
  enleveElement,
  remplaceDansTableau,
} from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const dateDePublication = '28/09/2022'
export const titre = "Trouver une valeur approchée ou l'arrondi d'un décimal"
export const interactifReady = true

/**
 * * Arrondir_un_decimal_selon_une_precision_donnée
 * @author Mickael Guironnet
 */

export const refs = {
  'fr-fr': ['6N1K-1', 'BP2AutoS8'],
  'fr-2016': ['6N31-6', 'BP2AutoS8'],
  'fr-ch': ['PR-43', '9R1NO2D-11', '9R2NO2D-11', '9R3NO2D-11', 'PRQNO05A-14'],
}
export const uuid = 'd2b82'

export default class ArrondirUnDecimal extends Exercice {
  version: string
  constructor() {
    super()
    this.version = '6eme'
    this.sup = 7
    this.sup2 = 3 // Utile pour CM1N3K
    this.sup3 = '4' // Utile pour CM1N3K

    this.nbQuestions = 6

    this.spacing = context.isHtml ? 1.2 : 1.5
    this.spacingCorr = context.isHtml ? 1.2 : 1.5

    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets  :',
        "1 : Valeur approchée à l'unité",
        '2 : Valeur approchée au dixième',
        '3 : Valeur approchée au centième',
        "4 : Arrondi à l'unité",
        '5 : Arrondi au dixième',
        '6 : Arrondi au centième',
        '7 : Mélange',
      ].join('\n'),
    ]
  }

  nouvelleVersion() {
    const nbDecimales = this.sup2
    let listeTypeDeQuestions = gestionnaireFormulaireTexte({
      max: 6,
      defaut: 7,
      melange: 7,
      nbQuestions: this.nbQuestions,
      saisie: this.sup,
    }).map(Number)

    if (this.version === 'CM1') {
      enleveElement(listeTypeDeQuestions, 3)
      enleveElement(listeTypeDeQuestions, 4)
      enleveElement(listeTypeDeQuestions, 5)
      enleveElement(listeTypeDeQuestions, 6)
      listeTypeDeQuestions = remplaceDansTableau(listeTypeDeQuestions, 2, 4)
      if (listeTypeDeQuestions.length === 0) listeTypeDeQuestions = [1, 4]
      listeTypeDeQuestions = combinaisonListes(
        listeTypeDeQuestions,
        this.nbQuestions,
      )
    }

    const puissanceDeDix = gestionnaireFormulaireTexte({
      max: 4,
      defaut: 4,
      melange: 5,
      nbQuestions: this.nbQuestions,
      saisie: this.sup3,
    }).map(Number)

    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
      cpt++
    ) {
      let m = randint(1, 9)
      let c = randint(1, 9)
      let d = randint(1, 9)
      const u = randint(1, 9)
      const di = randint(1, 9)
      let ci = randint(1, 9)
      let mi = randint(1, 9)

      if (!this.questionJamaisPosee(i, m, c, u, di, ci, mi)) {
        continue
      }

      let valeurdegaucheoudroite = randint(1, 2)

      switch (listeTypeDeQuestions[i]) {
        case 6: {
          // arrondi au centième
          texte = `Donner l'arrondi au centième de
                    $${texNombre(m * 1000 + c * 100 + d * 10 + u * 1 + (di * 0.1 + ci * 0.01 + mi * 0.001))}$ : `
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
            )
          } else {
            texte += '$\\ldots\\ldots\\ldots $'
          }
          const nombreStr = texNombre(
            m * 1000 +
              c * 100 +
              d * 10 +
              u * 1 +
              (di * 0.1 + 0 * 0.01 + 0 * 0.001),
            3,
            true,
          )
            .replace('0', miseEnEvidence(ci, bleuMathalea))
            .replace('0', `\\underline{${miseEnEvidence(mi, bleuMathalea)}}`)
          if (mi < 5) {
            handleAnswers(this, i, {
              reponse: {
                value: (
                  m * 1000 +
                  c * 100 +
                  d * 10 +
                  u * 1 +
                  (di * 0.1 + ci * 0.01)
                ).toString(),
              },
            })
            texteCorr = `L'arrondi au centième de $${nombreStr}$ est $${texNombre(m * 1000 + c * 100 + d * 10 + u * 1 + (di * 0.1 + ci * 0.01))}$.`
          } else {
            handleAnswers(this, i, {
              reponse: {
                value: (
                  m * 1000 +
                  c * 100 +
                  d * 10 +
                  u * 1 +
                  (di * 0.1 + (ci + 1) * 0.01)
                ).toString(),
              },
            })
            texteCorr = `L'arrondi au centième de $${nombreStr}$ est $${texNombre(m * 1000 + c * 100 + d * 10 + u * 1 + (di * 0.1 + (ci + 1) * 0.01))}$.`
          }

          break
        }
        case 5: {
          // arrondi au dixième
          texte = `Donner l'arrondi au dixième de
                    $${texNombre(m * 1000 + c * 100 + d * 10 + u * 1 + (di * 0.1 + ci * 0.01 + mi * 0.001))}$ : `
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
            )
          } else {
            texte += '$\\ldots\\ldots\\ldots $'
          }
          const nombreStr = texNombre(
            m * 1000 +
              c * 100 +
              d * 10 +
              u * 1 +
              (0 * 0.1 + 0 * 0.01 + mi * 0.001),
          )
            .replace('0', miseEnEvidence(di, bleuMathalea))
            .replace('0', `\\underline{${miseEnEvidence(ci, bleuMathalea)}}`)
          if (ci < 5) {
            handleAnswers(this, i, {
              reponse: {
                value: (
                  m * 1000 +
                  c * 100 +
                  d * 10 +
                  u * 1 +
                  di * 0.1
                ).toString(),
              },
            })
            texteCorr = `L'arrondi au dixième de $${nombreStr}$ est $${texNombre(m * 1000 + c * 100 + d * 10 + u * 1 + di * 0.1)}$.`
          } else {
            handleAnswers(this, i, {
              reponse: {
                value: (
                  m * 1000 +
                  c * 100 +
                  d * 10 +
                  u * 1 +
                  (di + 1) * 0.1
                ).toString(),
              },
            })
            texteCorr = `L'arrondi au dixième de $${nombreStr}$ est $${texNombre(m * 1000 + c * 100 + d * 10 + u * 1 + (di + 1) * 0.1)}$.`
          }

          break
        }
        case 4: {
          // arrondi à l'unité
          const termeEduscol =
            this.version === '6eme' ? `à l'unité` : `à l'entier`
          if (this.version === 'CM1') {
            if (nbDecimales < 2) ci = 0
            if (nbDecimales < 3) mi = 0
            if (puissanceDeDix[i] < 2) d = 0
            if (puissanceDeDix[i] < 3) c = 0
            if (puissanceDeDix[i] < 4) m = 0
          }
          const nbDecimal =
            m * 1000 +
            c * 100 +
            d * 10 +
            u * 1 +
            (di * 0.1 + ci * 0.01 + mi * 0.001)

          texte = `Donner l'arrondi ${termeEduscol} de
                    $${texNombre(nbDecimal)}$ : `
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
            )
          } else {
            texte += '$\\ldots\\ldots\\ldots $'
          }
          const nombreStr = texNombre(
            nbDecimal -
              (u + di * 0.1) +
              (this.version === 'CM1' ? 99 * 0.000001 : 0),
            nbDecimales,
            true,
          )
            .replace('0', miseEnEvidence(u, bleuMathalea))
            .replace('0', `\\underline{${miseEnEvidence(di, bleuMathalea)}}`)
            .replace(this.version === 'CM1' ? '99' : '', '')
          if (di < 5) {
            handleAnswers(this, i, {
              reponse: {
                value: (m * 1000 + c * 100 + d * 10 + u * 1).toString(),
              },
            })
            texteCorr = `L'arrondi ${termeEduscol} de $${nombreStr}$ est $${texNombre(m * 1000 + c * 100 + d * 10 + u * 1)}$.`
          } else {
            handleAnswers(this, i, {
              reponse: {
                value: (m * 1000 + c * 100 + d * 10 + (u + 1) * 1).toString(),
              },
            })
            texteCorr = `L'arrondi ${termeEduscol} de $${nombreStr}$ est $${texNombre(m * 1000 + c * 100 + d * 10 + (u + 1) * 1)}$.`
          }

          break
        }
        case 3: {
          // valeur approchée au centième
          texte = `${valeurdegaucheoudroite === 1 ? 'Donner une valeur par défaut au centième de ' : 'Donner une valeur par excès au centième de '}
                    $${texNombre(m * 1000 + c * 100 + d * 10 + u * 1 + (di * 0.1 + ci * 0.01 + mi * 0.001))}$ : `
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
            )
          } else {
            texte += '$\\ldots\\ldots\\ldots $'
          }
          const nombreStr = texNombre(
            m * 1000 +
              c * 100 +
              d * 10 +
              u * 1 +
              (di * 0.1 + 0 * 0.01 + mi * 0.001),
            3,
            true,
          ).replace('0', miseEnEvidence(ci, bleuMathalea))
          if (valeurdegaucheoudroite === 1) {
            handleAnswers(this, i, {
              reponse: {
                value: (
                  m * 1000 +
                  c * 100 +
                  d * 10 +
                  u * 1 +
                  (di * 0.1 + ci * 0.01)
                ).toString(),
              },
            })
            texteCorr = `Une valeur approchée au centième par défaut de $${nombreStr}$ est $${texNombre(m * 1000 + c * 100 + d * 10 + u * 1 + (di * 0.1 + ci * 0.01))}$.`
          } else {
            handleAnswers(this, i, {
              reponse: {
                value: (
                  m * 1000 +
                  c * 100 +
                  d * 10 +
                  u * 1 +
                  (di * 0.1 + (ci + 1) * 0.01)
                ).toString(),
              },
            })
            texteCorr = `Une valeur approchée au centième par excès de $${nombreStr}$ est $${texNombre(m * 1000 + c * 100 + d * 10 + u * 1 + (di * 0.1 + (ci + 1) * 0.01))}$.`
          }

          break
        }
        case 2: {
          // valeur approchée au dixième
          texte = `${valeurdegaucheoudroite === 1 ? 'Donner une valeur par défaut au dixième de ' : 'Donner une valeur par excès au dixième de '}
                    $${texNombre(m * 1000 + c * 100 + d * 10 + u * 1 + (di * 0.1 + ci * 0.01 + mi * 0.001))}$ : `
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
            )
          } else {
            texte += '$\\ldots\\ldots\\ldots $'
          }
          const nombreStr = texNombre(
            m * 1000 +
              c * 100 +
              d * 10 +
              u * 1 +
              (0 * 0.1 + ci * 0.01 + mi * 0.001),
            3,
            true,
          ).replace('0', miseEnEvidence(di, bleuMathalea))
          if (valeurdegaucheoudroite === 1) {
            handleAnswers(this, i, {
              reponse: {
                value: (
                  m * 1000 +
                  c * 100 +
                  d * 10 +
                  u * 1 +
                  di * 0.1
                ).toString(),
              },
            })
            texteCorr = `Une valeur approchée au dixième par défaut de $${nombreStr}$ est $${texNombre(m * 1000 + c * 100 + d * 10 + u * 1 + di * 0.1)}$.`
          } else {
            handleAnswers(this, i, {
              reponse: {
                value: (
                  m * 1000 +
                  c * 100 +
                  d * 10 +
                  u * 1 +
                  (di + 1) * 0.1
                ).toString(),
              },
            })
            texteCorr = `Une valeur approchée au dixième par excès de $${nombreStr}$ est $${texNombre(m * 1000 + c * 100 + d * 10 + u * 1 + (di + 1) * 0.1)}$.`
          }

          break
        }
        case 1:
        default: {
          // encadrement à l'unité
          if (this.version === 'CM1') valeurdegaucheoudroite = 1
          texte =
            this.version === '6eme'
              ? `${valeurdegaucheoudroite === 1 ? "Donner une valeur par défaut à l'unité de " : "Donner une valeur par excès à l'unité de "}`
              : `Donner la partie entière de`

          if (this.version === 'CM1') {
            if (nbDecimales < 2) ci = 0
            if (nbDecimales < 3) mi = 0
            if (puissanceDeDix[i] < 2) d = 0
            if (puissanceDeDix[i] < 3) c = 0
            if (puissanceDeDix[i] < 4) m = 0
          }

          texte += ` $${texNombre(m * 1000 + c * 100 + d * 10 + u * 1 + (di * 0.1 + ci * 0.01 + mi * 0.001))}$ : `
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
            )
          } else {
            texte += '$\\ldots\\ldots\\ldots $'
          }
          const nombreStr = texNombre(
            m * 1000 +
              c * 100 +
              d * 10 +
              u * 0 +
              (di * 0.1 + ci * 0.01 + mi * 0.001),
            nbDecimales,
            true,
          ).replace('0', miseEnEvidence(u, bleuMathalea))
          if (valeurdegaucheoudroite === 1) {
            handleAnswers(this, i, {
              reponse: {
                value: (m * 1000 + c * 100 + d * 10 + u * 1).toString(),
              },
            })
            texteCorr =
              this.version === '6eme'
                ? `Une valeur approchée à l'unité par défaut`
                : `La partie entière`
            texteCorr += ` de $${nombreStr}$ est $${texNombre(m * 1000 + c * 100 + d * 10 + u * 1)}$.`
          } else {
            handleAnswers(this, i, {
              reponse: {
                value: (m * 1000 + c * 100 + d * 10 + (u + 1) * 1).toString(),
              },
            })
            texteCorr = `Une valeur approchée à l'unité par excès de $${nombreStr}$ est $${texNombre(m * 1000 + c * 100 + d * 10 + (u + 1) * 1)}$.`
          }

          break
        }
      }

      this.listeQuestions.push(texte)
      // Uniformisation : Mise en place de la réponse attendue en interactif en orange et gras
      const textCorrSplit = texteCorr.split('est')
      let aRemplacer = textCorrSplit[textCorrSplit.length - 1]
      aRemplacer = aRemplacer.replaceAll('$', '')

      texteCorr = ''
      for (let ee = 0; ee < textCorrSplit.length - 1; ee++) {
        texteCorr += textCorrSplit[ee] + 'est '
      }
      texteCorr += `$${miseEnEvidence(aRemplacer.slice(0, -1).trim())}$` + '.' // Gestion du point final
      // Fin de cette uniformisation

      this.listeCorrections.push(texteCorr)
      i++
    }
    listeQuestionsToContenu(this)
  }
}
