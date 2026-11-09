import { ensureAmcParam } from '../../lib/amc/amcHelpers'
import type { ReponseParams } from '../../lib/amc/amcTypes'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import {
  contraindreValeur,
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Décomposer un nombre décimal (nombre de..., chiffre des..., partie entière, partie décimale)'
export const amcReady = true
export const interactifReady = true

export const amcType = 'AMCNum'
export const dateDeModifImportante = '11/09/2026'

/**
 * Des questions sur le nombre ou le chiffre de centaines, de dizaines, de dixièmes, de centièmes...
 * @author Rémi Angot
 * Ajout de l'interactivité, de l'export AMC et du paramétrage par Jean-claude Lhote (15/10/2021)
 * Rajout d'un paramètre par Éric Elter (08/09/2025)
 * Rajout de nouveaux paramètres par Éric Elter (11/09/2026)
 */
export const uuid = '6ee89'

export const refs = {
  'fr-fr': ['6N1A'],
  'fr-2016': ['6N10-2'],
  'fr-ch': ['9R1NO2A-1', '9R2NO2A-1', '9R3NO2A-1', 'PRQNO02A-6', 'PRQNO02B-1'], // Primaire anciennement :['9NO1-3'],
}
export default class DecompositionNombreDecimal extends Exercice {
  constructor() {
    super()
    this.consigne = 'Compléter les phrases suivantes.'
    this.nbQuestions = 4

    this.besoinFormulaireNumerique = [
      'Type de nombres',
      3,
      [
        '1 : Inférieurs à 10',
        '2 : Inférieurs à 100',
        '3 : Supérieurs à 100',
      ].join('\n'),
    ]
    this.sup = 3
    this.besoinFormulaire2Texte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : Chiffre des',
        '2 : Nombre de',
        '3 : Partie entière',
        '4 : Partie décimale',
        '5 : Mélange',
      ].join('\n'),
    ]
    this.sup2 = '5'
    this.besoinFormulaire3Texte = [
      'Rang possible',
      [
        'Nombres séparés par des tirets :',
        '1 : Milliers',
        '2 : Centaines',
        '3 : Dizaines',
        '4 : Unités',
        '5 : Dixièmes',
        '6 : Centièmes',
        '7 : Millièmes',
        '8 : Mélange',
      ].join('\n'),
    ]
    this.sup3 = '8'
    this.besoinFormulaire4CaseACocher = ['Avec nombre entier ?']
    this.sup4 = false
    this.consigne = 'Compléter les phrases suivantes.'
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles4 = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      max: 4,
      melange: 5,
      defaut: 5,
      nbQuestions: this.nbQuestions,
    }).map(Number)

    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles4,
      this.nbQuestions,
    )

    const rangs = gestionnaireFormulaireTexte({
      saisie: this.sup3,
      max: 7,
      melange: 8,
      defaut: 8,
      nbQuestions: this.nbQuestions,
      listeOfCase: [
        'milliers',
        'centaines',
        'dizaines',
        'unites',
        'dixiemes',
        'centiemes',
        'milliemes',
      ],
    })

    const choixRang = combinaisonListes(rangs, this.nbQuestions)

    let amcParam: ReponseParams
    const typeDeNombres = contraindreValeur(1, 3, this.sup, 3)

    for (
      let i = 0, m, c, d, u, di, ci, mi, n, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      switch (typeDeNombres) {
        case 1: // Nombres inférieurs à 10
          m = 0
          c = 0
          d = 0
          u = randint(1, 9)
          break
        case 2: // Nombres inférieurs à 100
          m = 0
          c = 0
          d = randint(1, 9)
          u = randint(0, 9)
          break
        case 3: // Supérieurs à 100 (comportement original)
        default:
          m = randint(1, 9) // le nombre sera le même tant qu'on peut poser des questions dessus, s'il y a trop de questions, on choisit un autre nombre
          c = randint(0, 9, [m])
          d = randint(0, 9, [m, c])
          u = randint(0, 9, [m, c, d])
          break
      }

      if (this.sup4) {
        di = 0
        ci = 0
        mi = 0
        n = m.toString() + '~' + c.toString() + d.toString() + u.toString()
      } else {
        di = randint(0, 9, [m, c, d, u])
        ci = randint(0, 9, [m, c, d, u, di])
        mi = randint(1, 9, [m, c, d, u, di, ci])
        n =
          m.toString() +
          '~' +
          c.toString() +
          d.toString() +
          u.toString() +
          ',' +
          di.toString() +
          ci.toString() +
          mi
      }
      n = texNombre(
        m * 1000 + c * 100 + d * 10 + u + di / 10 + ci / 100 + mi / 1000,
      )

      texte = ''
      texteCorr = ''
      let reponse = 0
      amcParam = ensureAmcParam(this, i)
      switch (listeTypeDeQuestions[i]) {
        case 3:
          texte = `La partie entière du nombre $${n}$ est : `
          reponse = m! * 1000 + c! * 100 + d! * 10 + u!
          amcParam.digits = 4
          amcParam.decimals = 0
          break
        case 4:
          texte = `La partie décimale du nombre $${n}$ est : `
          reponse = arrondi(di! / 10 + ci! / 100 + mi! / 1000, 3)
          amcParam.digits = 5
          amcParam.decimals = 4
          break
        case 1: {
          switch (choixRang[i]) {
            case 'unites':
              texte = `Le chiffre des unités du nombre $${n}$ est : `
              reponse = u!
              break
            case 'dizaines':
              texte = `Le chiffre des dizaines du nombre $${n}$ est : `
              reponse = d!
              break
            case 'centaines':
              texte = `Le chiffre des centaines du nombre $${n}$ est : `
              reponse = c!
              break
            case 'milliers':
              texte = `Le chiffre des milliers du nombre $${n}$ est : `
              reponse = m!
              break
            case 'dixiemes':
              texte = `Le chiffre des dixièmes du nombre $${n}$ est : `
              reponse = di!
              break
            case 'centiemes':
              texte = `Le chiffre des centièmes du nombre $${n}$ est : `
              reponse = ci!
              break
            case 'milliemes':
              texte = `Le chiffre des millièmes du nombre $${n}$ est : `
              reponse = mi!
              break
          }
          amcParam.digits = 1
          amcParam.decimals = 0
          break
        }
        case 2:
          switch (choixRang[i]) {
            case 'unites':
              texte = `Le nombre d'unités du nombre $${n}$ est : `
              reponse = m! * 1000 + c! * 100 + d! * 10 + u!
              break
            case 'dizaines': {
              texte = `Le nombre de dizaines du nombre $${n}$ est : `
              reponse = d! + c! * 10 + m! * 100
              break
            }
            case 'centaines': {
              texte = `Le nombre de centaines du nombre $${n}$ est : `
              reponse = c! + m! * 10
              break
            }
            case 'milliers':
              texte = `Le nombre de milliers du nombre $${n}$ est : `
              reponse = m!
              break
            case 'dixiemes':
              texte = `Le nombre de dixièmes du nombre $${n}$ est : `
              reponse = di! + u! * 10 + d! * 100 + c! * 1000 + m! * 10000
              break
            case 'centiemes': {
              texte = `Le nombre de centièmes du nombre $${n}$ est : `
              reponse =
                ci! + di! * 10 + u! * 100 + d! * 1000 + c! * 10000 + m! * 100000
              break
            }
            case 'milliemes': {
              texte = `Le nombre de millièmes du nombre $${n}$ est : `
              reponse =
                mi! +
                ci! * 10 +
                di! * 100 +
                u! * 1000 +
                d! * 10000 +
                c! * 100000 +
                m! * 1000000
              break
            }
          }
          amcParam = ensureAmcParam(this, i)
          amcParam.digits = 7
          amcParam.decimals = 0
          break
      }
      texteCorr = texte + `$${miseEnEvidence(texNombre(reponse))}$`
      texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)
      handleAnswers(this, i, { reponse: { value: reponse } })

      texteCorr += '.'
      if (!this.interactif) texte += '$\\ldots\\ldots\\ldots\\ldots$'
      if (
        this.questionJamaisPosee(i, m!, c!, d!, u!, listeTypeDeQuestions[i])
      ) {
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
