import { ensureAmcParam } from '../../lib/amc/amcHelpers'
import type { ReponseParams } from '../../lib/amc/amcTypes'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import {
  contraindreValeur,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Décomposer un nombre décimal (nombre de..., chiffre des..., partie entière, partie décimale)'
export const amcReady = true
export const interactifReady = true

export const amcType = 'AMCNum'
export const dateDeModifImportante = '08/09/2025'

/**
 * Des questions sur le nombre ou le chiffre de centaines, de dizaines, de dixièmes, de centièmes...
 * @author Rémi Angot
 * Ajout de l'interactivité, de l'export AMC et du paramétrage par Jean-claude Lhote (15/10/2021)
 * Rajout d'un paramètre par Éric Elter (08/09/2025)
 */
export const uuid = '6ea89'

export const refs = {
  'fr-fr': [],
  'fr-2016': ['6N10-2'],
  'fr-ch': [''], // Primaire anciennement :['9NO1-3'],
}
export default class DecompositionNombreDecimal extends Exercice {
  constructor() {
    super()
    this.consigne = 'Compléter les phrases suivantes.'
    this.nbQuestions = 5

    this.sup = 7
    this.besoinFormulaireNumerique = [
      'Choix de questions',
      7,
      "1 : 'Chiffre des'\n2 : 'Nombre de'\n3 : Partie entière ou partie décimale\n4 : 'Chiffre des' ou 'nombre de'\n5 : 'Chiffre des' ou partie entière ou partie décimale\n6 : 'Nombre de' ou partie entière ou partie décimale\n7 : Mélange",
    ]
    this.besoinFormulaire2CaseACocher = ['Avec nombre entier ?']
    this.sup2 = false
    this.besoinFormulaire3Numerique = [
      'Type de nombres',
      3,
      [
        '1 : Inférieurs à 10',
        '2 : Inférieurs à 100',
        '3 : Supérieurs à 100',
      ].join('\n'),
    ]
    this.sup3 = 3
  }

  nouvelleVersion() {
    let amcParam: ReponseParams
    const typeDeNombres = contraindreValeur(1, 3, this.sup3, 3)

    let typesDeQuestionsDisponibles
    switch (this.sup) {
      case 1:
        typesDeQuestionsDisponibles = [3, 4, 5, 6, 7, 8, 'chiffreDesUnites']
        break
      case 2:
        typesDeQuestionsDisponibles = [9, 10, 11, 12]
        break
      case 3:
        typesDeQuestionsDisponibles = [1, 2]
        break
      case 4:
        typesDeQuestionsDisponibles = [
          3,
          4,
          5,
          6,
          7,
          8,
          'chiffreDesUnites',
          9,
          10,
          11,
          12,
        ]
        break
      case 5:
        typesDeQuestionsDisponibles = [
          1,
          2,
          3,
          4,
          5,
          6,
          7,
          8,
          'chiffreDesUnites',
        ]
        break
      case 6:
        typesDeQuestionsDisponibles = [1, 2, 9, 10, 11, 12]
        break
      default:
        typesDeQuestionsDisponibles = [
          1,
          2,
          choice([3, 4, 5, 'chiffreDesUnites']),
          choice([6, 7, 8]),
          choice([9, 10]),
          choice([11, 12]),
        ] // sans chevauchement ou avec chevauchement
        break
    }
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posées mais l'ordre diffère à chaque "cycle"

    // calcul ne semble pas marcher avec 7 chiffres significatifs
    this.consigne = 'Compléter les phrases suivantes.'
    for (
      let i = 0, m, c, d, u, di, ci, mi, n, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      if (i % typesDeQuestionsDisponibles.length === 0) {
        // Génération des chiffres selon le type de nombre souhaité
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

        if (this.sup2) {
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
      }

      switch (listeTypeDeQuestions[i]) {
        case 1:
          texte = `La partie entière du nombre $${n}$ est : `
          texteCorr =
            texte +
            `$${miseEnEvidence(texNombre(m! * 1000 + c! * 100 + d! * 10 + u!))}$`
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierNumbers,
          )
          handleAnswers(this, i, {
            reponse: { value: m! * 1000 + c! * 100 + d! * 10 + u! },
          })
          amcParam = ensureAmcParam(this, i)
          amcParam.digits = 5
          amcParam.decimals = 0
          break
        case 2:
          texte = `La partie décimale du nombre $${n}$ est : `
          texteCorr =
            texte +
            `$${miseEnEvidence(texNombre(di! / 10 + ci! / 100 + mi! / 1000))}$`
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierNumbers,
          )
          handleAnswers(this, i, {
            reponse: {
              value: arrondi(di! / 10 + ci! / 100 + mi! / 1000, 3),
            },
          })
          amcParam = ensureAmcParam(this, i)
          amcParam.digits = 6
          amcParam.decimals = 4
          break
        case 3:
          // Pour les nombres < 10, pas de dizaines
          if (typeDeNombres === 1) {
            texte = `Le chiffre des unités du nombre $${n}$ est : `
            texteCorr = texte + `$${miseEnEvidence(u!)}$`
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
            )
            handleAnswers(this, i, { reponse: { value: u! } })
          } else {
            texte = `Le chiffre des dizaines du nombre $${n}$ est : `
            texteCorr = texte + `$${miseEnEvidence(d!)}$`
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
            )
            handleAnswers(this, i, { reponse: { value: d! } })
          }
          amcParam = ensureAmcParam(this, i)
          amcParam.digits = 1
          amcParam.decimals = 0
          break
        case 'chiffreDesUnites':
          texte = `Le chiffre des unités du nombre $${n}$ est : `
          texteCorr = texte + `$${miseEnEvidence(u!)}$`
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierNumbers,
          )
          handleAnswers(this, i, { reponse: { value: u! } })
          amcParam = ensureAmcParam(this, i)
          amcParam.digits = 1
          amcParam.decimals = 0
          break
        case 4:
          // Pour les nombres < 100, pas de centaines
          if (typeDeNombres === 1 || typeDeNombres === 2) {
            if (typeDeNombres === 1) {
              texte = `Le chiffre des unités du nombre $${n}$ est : `
              texteCorr = texte + `$${miseEnEvidence(u!)}$`
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierNumbers,
              )
              handleAnswers(this, i, { reponse: { value: u! } })
            } else {
              texte = `Le chiffre des dizaines du nombre $${n}$ est : `
              texteCorr = texte + `$${miseEnEvidence(d!)}$`
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierNumbers,
              )
              handleAnswers(this, i, { reponse: { value: d! } })
            }
          } else {
            texte = `Le chiffre des centaines du nombre $${n}$ est : `
            texteCorr = texte + `$${miseEnEvidence(c!)}$`
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
            )
            handleAnswers(this, i, { reponse: { value: c! } })
          }
          amcParam = ensureAmcParam(this, i)
          amcParam.digits = 1
          amcParam.decimals = 0
          break
        case 5:
          // Pour les nombres < 1000, pas de milliers
          if (typeDeNombres === 1 || typeDeNombres === 2) {
            if (typeDeNombres === 1) {
              texte = `Le chiffre des unités du nombre $${n}$ est : `
              texteCorr = texte + `$${miseEnEvidence(u!)}$`
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierNumbers,
              )
              handleAnswers(this, i, { reponse: { value: u! } })
            } else {
              texte = `Le chiffre des centaines du nombre $${n}$ est : `
              texteCorr = texte + `$${miseEnEvidence(0)}$` // Pas de centaines pour < 100
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierNumbers,
              )
              handleAnswers(this, i, { reponse: { value: 0 } })
            }
          } else {
            texte = `Le chiffre des milliers du nombre $${n}$ est : `
            texteCorr = texte + `$${miseEnEvidence(m!)}$`
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
            )
            handleAnswers(this, i, { reponse: { value: m! } })
          }
          amcParam = ensureAmcParam(this, i)
          amcParam.digits = 1
          amcParam.decimals = 0
          break
        case 6:
          texte = `Le chiffre des dixièmes du nombre $${n}$ est : `
          texteCorr = texte + `$${miseEnEvidence(di!)}$`
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierNumbers,
          )
          handleAnswers(this, i, { reponse: { value: di! } })
          amcParam = ensureAmcParam(this, i)
          amcParam.digits = 1
          amcParam.decimals = 0
          break
        case 7:
          texte = `Le chiffre des centièmes du nombre $${n}$ est : `
          texteCorr = texte + `$${miseEnEvidence(ci!)}$`
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierNumbers,
          )
          handleAnswers(this, i, { reponse: { value: ci! } })
          amcParam = ensureAmcParam(this, i)
          amcParam.digits = 1
          amcParam.decimals = 0
          break
        case 8:
          texte = `Le chiffre des millièmes du nombre $${n}$ est : `
          texteCorr = texte + `$${miseEnEvidence(mi!)}$`
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierNumbers,
          )
          handleAnswers(this, i, { reponse: { value: mi! } })
          amcParam = ensureAmcParam(this, i)
          amcParam.digits = 1
          amcParam.decimals = 0
          break
        case 9:
          // Nombre de dizaines - Adaptation selon le type
          if (typeDeNombres === 1) {
            texte = `Le nombre de dixièmes du nombre $${n}$ est : `
            texteCorr = texte + `$${miseEnEvidence(texNombre(di! + u! * 10))}$`
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
            )
            handleAnswers(this, i, { reponse: { value: di! + u! * 10 } })
          } else {
            texte = `Le nombre de dizaines du nombre $${n}$ est : `
            const nombreDizaines =
              typeDeNombres === 2 ? d! : d! + c! * 10 + m! * 100
            texteCorr = texte + `$${miseEnEvidence(texNombre(nombreDizaines))}$`
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
            )
            handleAnswers(this, i, { reponse: { value: nombreDizaines } })
          }
          amcParam = ensureAmcParam(this, i)
          amcParam.digits = 6
          amcParam.decimals = 0
          break
        case 10:
          // Nombre de centaines - Adaptation selon le type
          if (typeDeNombres === 1 || typeDeNombres === 2) {
            texte = `Le nombre de centièmes du nombre $${n}$ est : `
            const nombreCentiemes =
              typeDeNombres === 1
                ? ci! + di! * 10 + u! * 100
                : ci! + di! * 10 + u! * 100 + d! * 1000
            texteCorr =
              texte + `$${miseEnEvidence(texNombre(nombreCentiemes))}$`
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
            )
            handleAnswers(this, i, { reponse: { value: nombreCentiemes } })
          } else {
            texte = `Le nombre de centaines du nombre $${n}$ est : `
            texteCorr = texte + `$${miseEnEvidence(texNombre(c! + m! * 10))}$`
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
            )
            handleAnswers(this, i, { reponse: { value: c! + m! * 10 } })
          }
          amcParam = ensureAmcParam(this, i)
          amcParam.digits = 6
          amcParam.decimals = 0
          break
        case 11:
          {
            texte = `Le nombre de dixièmes du nombre $${n}$ est : `
            const nombreDixiemes =
              typeDeNombres === 1
                ? di! + u! * 10
                : typeDeNombres === 2
                  ? di! + u! * 10 + d! * 100
                  : di! + u! * 10 + d! * 100 + c! * 1000 + m! * 10000
            texteCorr = texte + `$${miseEnEvidence(texNombre(nombreDixiemes))}$`
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
            )
            handleAnswers(this, i, { reponse: { value: nombreDixiemes } })
            amcParam = ensureAmcParam(this, i)
            amcParam.digits = 6
            amcParam.decimals = 0
          }
          break
        case 12:
        default:
          {
            texte = `Le nombre de centièmes du nombre $${n}$ est : `
            const nombreCentiemes =
              typeDeNombres === 1
                ? ci! + di! * 10 + u! * 100
                : typeDeNombres === 2
                  ? ci! + di! * 10 + u! * 100 + d! * 1000
                  : ci! +
                    di! * 10 +
                    u! * 100 +
                    d! * 1000 +
                    c! * 10000 +
                    m! * 100000
            texteCorr =
              texte + `$${miseEnEvidence(texNombre(nombreCentiemes))}$`
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
            )
            handleAnswers(this, i, { reponse: { value: nombreCentiemes } })
            amcParam = ensureAmcParam(this, i)
            amcParam.digits = 6
            amcParam.decimals = 0
          }
          break
      }

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
