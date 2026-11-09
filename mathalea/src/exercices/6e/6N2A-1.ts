/**
 * ⚠️ Cet exercice est utilisé dans le test : tests/e2e/tests/interactivity/mathLive.calcul.test.ts ⚠️
 */

import { grille, seyes } from '../../lib/2d/Grille'
import { vide2d } from '../../lib/2d/Vide2d'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { orangeMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { enleveElement } from '../../lib/outils/arrayOutils'
import { nombreDeChiffresDe } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import operation from '../../modules/operations'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const dateDeModifImportante = '15/02/2025'
export const amcReady = true
export const amcType = 'AMCHybride'
export const interactifReady = true

export const titre =
  'Poser additions, soustractions et multiplications de nombres entiers'

/**
 * Additions, soustractions et multiplications posées de nombres entiers
 *
 * * abcd +efg
 * * abc0-efg
 * * 1abc-def
 * * abc*d0e tables de 2 à 5
 * * abc*de tables de 5 à 9
 * @author Rémi Angot
 * Support des opérations posées en html par Jean-claude Lhote.
 */
export const uuid = 'cfa6a'

export const refs = {
  'fr-fr': ['6N2A-1'],
  'fr-2016': ['6C10'],
  'fr-ch': ['9R1NO7A-4', '9R2NO7A-4', '9R3NO7A-4', 'PRQNO06A-9'], // Primaire anciennement : ['9NO3-1'],
}
export default class AdditionsSoustractionsMultiplicationsPosees extends Exercice {
  version: string
  constructor() {
    super()
    this.spacing = 2
    this.spacingCorr = context.isHtml ? 2 : 1 // Important sinon les opérations posées ne sont pas jolies
    this.nbQuestions = 5

    this.besoinFormulaireTexte = [
      'Types de calculs',
      'Nombres séparés par des tirets :\n1 : abcde + fgh\n2 : abc0 - efg\n3 : 1abc - def\n4 : abc * d0e (tables de 2 à 5)\n5 : abc * de (tables de 5 à 9)\n6 : Mélange',
    ]
    this.besoinFormulaire2Numerique = [
      'Type de cahier',
      3,
      ' 1 : Cahier à petits carreaux\n 2 : Cahier à gros carreaux (Seyes)\n 3 : Feuille blanche',
    ]
    this.besoinFormulaire3CaseACocher = [
      "Opérations posées dans l'énoncé",
      false,
    ]
    this.sup = '6'
    this.sup2 = 3
    this.sup3 = false
    this.sup4 = false
    this.version = '6e'
  }

  nouvelleVersion() {
    if (this.version === 'CM1') {
      this.sup = String(this.sup).replace(
        /[123]/g,
        (c: string): string => ({ '1': '4', '2': '5', '3': '6' })[c]!,
      )
    }

    let typesDeQuestions, reponse
    this.consigne =
      this.nbQuestions > 1
        ? this.sup3
          ? 'Effectuer les opérations suivantes.'
          : 'Poser et effectuer les calculs suivants.'
        : this.sup3
          ? "Effectuer l'opération suivante."
          : 'Poser et effectuer le calcul suivant.'
    const colore = orangeMathalea

    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      max: 5,
      defaut: 6,
      nbQuestions: this.nbQuestions,
      melange: 6,
      saisie: this.sup,
    }).map(Number)

    if (this.version === 'CM1') {
      enleveElement(listeTypeDeQuestions, 1)
      enleveElement(listeTypeDeQuestions, 2)
      enleveElement(listeTypeDeQuestions, 3)
    }

    let grilletxt
    if (this.sup2 < 3) {
      const g = this.sup2 < 3 ? grille(0, 0, 5, 8, 'gray', 0.7) : vide2d()
      const carreaux = this.sup2 === 2 ? seyes(0, 0, 5, 8) : vide2d()
      const sc = this.sup2 === 2 ? 0.8 : 0.5
      const params = {
        xmin: 0,
        ymin: 0,
        xmax: 5,
        ymax: 8,
        pixelsParCm: 20,
        scale: sc,
      }
      grilletxt = '<br>' + mathalea2d(params, g, carreaux)
    } else {
      grilletxt = ''
    }

    for (
      let i = 0, cpt = 0, a, b, c, d, e, f, g, x, y;
      i < this.nbQuestions && cpt < 50;
    ) {
      typesDeQuestions = listeTypeDeQuestions[i]
      this.autoCorrection[i] = {}
      let texte = ''
      let texteCorr = ''
      switch (typesDeQuestions) {
        case 1: // abcde + fgh
          a =
            randint(1, 9) * 10000 +
            randint(5, 9) * 1000 +
            randint(5, 9) * 100 +
            randint(7, 9) * 10 +
            randint(1, 9)
          b = randint(5, 9) * 100 + randint(7, 9) * 10 + randint(1, 9)
          texte = `$${texNombre(a, 0)}+${b}`
          if (this.interactif)
            texte +=
              '=$' +
              ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)
          // fonction à utiliser pour la version en ligne afin d'ajouter le formulaire de réponse
          else texte += '$'
          texte += grilletxt
          reponse = a + b
          texteCorr = String(
            operation({
              options: { colore, solution: true },
              operande1: a,
              operande2: b,
              type: 'addition',
            }),
          )
          if (this.sup3) {
            texte =
              String(
                operation({
                  operande1: a,
                  operande2: b,
                  type: 'addition',
                  options: { solution: false, colore },
                }),
              ) + (this.interactif ? '<br>' + texte : '')
          }
          break
        case 2: // abc0 - efg
          a = randint(1, 9)
          b = randint(1, 9)
          c = randint(1, 9)
          e = randint(b, 9)
          f = randint(c, 9)
          g = randint(2, 9)
          x = a * 1000 + b * 100 + c * 10
          y = e * 100 + f * 10 + g
          texte = `$${texNombre(x, 0)}-${y}`
          if (this.interactif)
            texte +=
              '=$' +
              ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)
          // fonction à utiliser pour la version en ligne afin d'ajouter le formulaire de réponse
          else texte += '$'
          texte += grilletxt
          reponse = x - y
          texteCorr = String(
            operation({
              operande1: x,
              operande2: y,
              type: 'soustraction',
              options: { solution: true, colore },
            }),
          )
          if (this.sup3) {
            texte =
              String(
                operation({
                  operande1: x,
                  operande2: y,
                  type: 'soustraction',
                  options: { solution: false, colore },
                }),
              ) + (this.interactif ? '<br>' + texte : '')
          }
          break
        case 3: // 1abc - def
          a = randint(1, 9)
          b = randint(1, 9)
          c = randint(1, 9)
          d = randint(a, 9)
          e = randint(1, 9)
          f = randint(c, 9)
          x = 1000 + a * 100 + b * 10 + c
          y = d * 100 + e * 10 + f
          texte = `$${texNombre(x, 0)}-${y}`
          if (this.interactif)
            texte +=
              '=$' +
              ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)
          // fonction à utiliser pour la version en ligne afin d'ajouter le formulaire de réponse
          else texte += '$'
          texte += grilletxt
          reponse = x - y
          texteCorr = String(
            operation({
              operande1: x,
              operande2: y,
              type: 'soustraction',
              options: { solution: true, colore },
            }),
          )
          if (this.sup3) {
            texte =
              String(
                operation({
                  operande1: x,
                  operande2: y,
                  type: 'soustraction',
                  options: { solution: false, colore },
                }),
              ) + (this.interactif ? '<br>' + texte : '')
          }
          break
        case 4: // abc * d0e tables de 2 à 5
          a = randint(2, 5)
          b = randint(2, 5)
          c = randint(2, 5)
          d = randint(2, 5)
          e = randint(2, 5)
          x = 100 * a + 10 * b + c
          y = d * 100 + e
          texte = `$${texNombre(x, 0)}\\times${y}`
          if (this.interactif)
            texte +=
              '=$' +
              ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)
          // fonction à utiliser pour la version en ligne afin d'ajouter le formulaire de réponse
          else texte += '$'
          texte += grilletxt
          reponse = x * y
          texteCorr = String(
            operation({
              operande1: x,
              operande2: y,
              type: 'multiplication',
              options: { solution: true, colore },
            }),
          )
          if (this.sup3) {
            texte =
              String(
                operation({
                  operande1: x,
                  operande2: y,
                  type: 'multiplication',
                  options: { solution: false, colore },
                }),
              ) + (this.interactif ? '<br>' + texte : '')
          }
          break
        case 5: // abc * de tables de 5 à 9
        default:
          a = randint(5, 9)
          b = randint(5, 9)
          c = randint(5, 9)
          d = randint(5, 9)
          e = randint(5, 9)
          x = 100 * a + 10 * b + c
          y = 10 * d + e
          texte = `$${x}\\times${y}`
          if (this.interactif)
            texte +=
              '=$' +
              ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)
          // fonction à utiliser pour la version en ligne afin d'ajouter le formulaire de réponse
          else texte += '$'
          texte += grilletxt
          reponse = x * y
          texteCorr = String(
            operation({
              operande1: x,
              operande2: y,
              type: 'multiplication',
              options: { solution: true, colore },
            }),
          )
          if (this.sup3) {
            texte =
              String(
                operation({
                  operande1: x,
                  operande2: y,
                  type: 'multiplication',
                  options: { solution: false, colore },
                }),
              ) + (this.interactif ? '<br>' + texte : '')
          }
          break
      }

      if (this.questionJamaisPosee(i, ...[a, b, c, d, e, f, g].map(String))) {
        // Si la question n'a jamais été posée, on l'enregistre
        this.listeQuestions[i] = texte
        if (!context.isHtml && i === 0) {
          texteCorr = '\\setlength\\itemsep{2em}' + texteCorr
        } // espacement entre les questions
        this.listeCorrections[i] = texteCorr
        // L'opération posée n'est pas extractible : la réponse est fournie explicitement
        this.listeReponsesCourtes[i] = `$${texNombre(reponse as number, 0)}$`
        if (!context.isAmc) {
          handleAnswers(this, i, { reponse: { value: reponse } }, { digits: 0 })
        } else {
          this.autoCorrectionAMC[i] = {
            enonce: '',
            enonceAvant: false,
            propositions: [
              {
                type: 'AMCOpen',
                propositions: [
                  {
                    enonce:
                      "Poser et effectuer l'opération suivante : " + texte,
                    texte: texteCorr,
                    statut: 3,
                    pointilles: false,
                  },
                ],
              },
              {
                type: 'AMCNum',
                propositions: [
                  {
                    texte: '',
                    statut: '',
                    reponse: {
                      texte: "Résultat de l'opération : ",
                      valeur: [reponse],
                      param: {
                        digits: nombreDeChiffresDe(reponse),
                        decimals: 0,
                        signe: false,
                        approx: 0,
                      },
                    },
                  },
                ],
              },
            ],
          }
          this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        }
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
