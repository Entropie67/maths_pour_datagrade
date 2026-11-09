import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import {
    combinaisonListes,
    compteOccurences,
} from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { arrondi } from '../../../lib/outils/nombres'
import { sp } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
import FractionEtendue from '../../../modules/FractionEtendue'
import Grandeur from '../../../modules/Grandeur'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre =
  'Convertir des durées en heures-minutes-secondes, en heures décimales ou en minutes décimales'
export const dateDePublication = '19/08/2025'
export const dateDeModifImportante = '19/03/2026'
export const interactifReady = true

export const uuid = '31e61'
export const refs = {
  'fr-ch': ['NR'],
  'fr-fr': [''],
}

/**
 * Exercice de conversion de durées entre hhmmss, hdec et mindec utilisant la classe Grandeur
 * @author Nathan Scheinmann (Adaptation à la France par Éric Elter)
 */
export default class ConvertirDuree extends Exercice {
  version: string
  constructor() {
    super()
    this.nbQuestions = 5
    this.sup = 1 // Type de conversion
    this.sup2 = false // Quart ou demi-heures seulement
    this.sup3 = false // dixièmes d'heure
    this.besoinFormulaireNumerique = [
      'Type de conversions',
      6,
      '1 : Heures-minutes-secondes vers heures décimales\n2 : Heures-minutes-secondes vers minutes décimales\n3 : Heures décimales vers heures-minutes-secondes\n4 : Minutes décimales vers heures-minutes-secondes\n5 : Heures ↔ minutes décimales\n6 : Mélange',
    ]
    this.besoinFormulaire2CaseACocher = [
      'Quarts et demi-heures seulement',
      false,
    ]
    this.besoinFormulaire3CaseACocher = ["Dixièmes d'heure seulement", true]
    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = true
    this.version = '10GM3B-6'
  }

  nouvelleVersion(): void {
    this.autoCorrection = []

    // Déterminer les types de questions disponibles
    let typesDeQuestionsDisponibles: number[]
    switch (this.sup) {
      case 1:
        typesDeQuestionsDisponibles = [1]
        break // hhmmss → hdec
      case 2:
        typesDeQuestionsDisponibles = [2]
        break // hhmmss → mindec
      case 3:
        typesDeQuestionsDisponibles = [3]
        break // hdec → hhmmss
      case 4:
        typesDeQuestionsDisponibles = [4]
        break // mindec → hhmmss
      case 5:
        typesDeQuestionsDisponibles = [5, 6]
        break // hdec ↔ mindec
      default:
        typesDeQuestionsDisponibles = [1, 2, 3, 4, 5, 6]
        break // Mélange
    }
    if (this.version === '6M4C-3') {
      // this.besoinFormulaireNumerique n'est plus le même.
      // On parcourt le tableau à l'envers (pour éviter les décalages d'index)
      for (let i = typesDeQuestionsDisponibles.length - 1; i >= 0; i--) {
        if (typesDeQuestionsDisponibles[i] === 5) {
          // 1. Supprimer tous les 5
          typesDeQuestionsDisponibles.splice(i, 1)
        } else if (typesDeQuestionsDisponibles[i] === 3) {
          // 2. Remplacer chaque 3 par 6
          typesDeQuestionsDisponibles.splice(i, 1, 6)
        } else if (typesDeQuestionsDisponibles[i] === 4) {
          // 3. Remplacer chaque 4 par [1,2,6]
          typesDeQuestionsDisponibles.splice(i, 1, 1, 2, 6)
        }
      }
    } else if (this.version === '6M4C-4') {
      // this.besoinFormulaireNumerique n'est plus le même.
      // On parcourt le tableau à l'envers (pour éviter les décalages d'index)
      for (let i = typesDeQuestionsDisponibles.length - 1; i >= 0; i--) {
        switch (typesDeQuestionsDisponibles[i]) {
          case 3:
            // Remplacer 3 par [3, 4]
            typesDeQuestionsDisponibles.splice(i, 1, 3, 4)
            break
          case 1:
            // Remplacer 1 par [3]
            typesDeQuestionsDisponibles.splice(i, 1, 3)
            break
          case 2:
            // Remplacer 2 par [4]
            typesDeQuestionsDisponibles.splice(i, 1, 4)
            break
          case 5:
          case 6:
            // Supprimer 5 et 6
            typesDeQuestionsDisponibles.splice(i, 1)
            break
        }
      }
    }
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    //    this.consigne = `${this.sup === 4 || this.sup === 3 || this.sup2 ? ' ' : `Arrondir, si nécessaire, les résultats au ${this.sup3 ? 'dixième' : 'centième'}`}`
    this.consigne = `${
      typesDeQuestionsDisponibles.length ===
        compteOccurences(typesDeQuestionsDisponibles, 3) ||
      this.sup2 ||
      this.sup3
        ? ' '
        : `Arrondir, si nécessaire, ${this.nbQuestions > 1 ? 'les résultats' : 'le résultat'}` +
          `${
            typesDeQuestionsDisponibles.length ===
            compteOccurences(typesDeQuestionsDisponibles, 4) +
              compteOccurences(typesDeQuestionsDisponibles, 3)
              ? ' à la seconde près'
              : ' au centième' +
                `${compteOccurences(typesDeQuestionsDisponibles, 4) > 0 ? ' ou à la seconde près' : ''}`
          }` +
          '.'
    }`
    for (
      let i = 0, cpt = 0, champIndex = 0;
      i < this.nbQuestions && cpt < 50;
      i++
    ) {
      let texte: string
      let texteCorr: string
      const typeDeQuestion = listeTypeDeQuestions[i]
      let totalSecondes: number = 0
      let valeurDepart: number | string = 0
      let uniteDepart: string = ''
      let uniteArrivee: string = ''
      let reponse: number | string = 0
      let estApproximation: boolean = false

      // Déterminer les unités selon le type de question
      switch (typeDeQuestion) {
        case 1: // hhmmss → hdec
          uniteDepart = 'hhmmss'
          uniteArrivee = 'hdec'
          break
        case 2: // hhmmss → mindec
          uniteDepart = 'hhmmss'
          uniteArrivee = 'mindec'
          break
        case 3: // hdec → hhmmss
          uniteDepart = 'hdec'
          uniteArrivee = 'hhmmss'
          break
        case 4: // mindec → hhmmss
          uniteDepart = 'mindec'
          uniteArrivee = 'hhmmss'
          break
        case 5: // hdec → mindec
          uniteDepart = 'hdec'
          uniteArrivee = 'mindec'
          break
        case 6: // mindec → hdec
          uniteDepart = 'mindec'
          uniteArrivee = 'hdec'
          break
        default:
          uniteDepart = 'hhmmss'
          uniteArrivee = 'hdec'
          break
      }
      let condition1 = false
      let condition2 = false
      let condition3 = false
      do {
        // Générer un nombre de secondes aléatoire
        if (this.sup2) {
          // Quarts et demi-heures seulement : multiples de 15 minutes (900 secondes)
          const nbQuartsHeure =
            uniteDepart === 'hhmmss'
              ? randint(1, 31, [4, 8, 12, 16, 20, 24, 28]) // 1 à 12 quarts d'heure = 15 min à 3h
              : randint(1, 12)
          totalSecondes = nbQuartsHeure * 900
        } else if (this.sup3) {
          //  totalSecondes = randint(1, 60 * 3, [60, 120, 180]) * 60
          totalSecondes = randint(11, 79, [10, 20, 30, 40, 50, 60, 70]) * 360
        } else {
          // Nombre de secondes aléatoire entre 1 et 3*3600 (3 heures)
          const multiplesOf60 = []
          for (let i = 120; i < 3600; i += 60) {
            multiplesOf60.push(i)
          }
          totalSecondes = randint(60, 3 * 3600, multiplesOf60) // Au moins 1 minute
        }

        // Créer la grandeur de base en secondes
        const dureeBase = new Grandeur(totalSecondes, 'hhmmss')

        // Convertir vers l'unité de départ pour afficher la question
        if (uniteDepart === 'hhmmss') {
          // Pour hhmmss, la valeur de départ est directement le formatage du temps total
          if (this.sup3 && uniteArrivee === 'hdec') {
            valeurDepart = (randint(0, 3) + 0.1 * randint(1, 9)) * 3600
          }
          valeurDepart = dureeBase.toHHMMSS()
        } else {
          const dureeDepart = dureeBase.convertirEn(uniteDepart)
          const valeurBrute =
            typeof dureeDepart.mesure === 'number'
              ? dureeDepart.mesure
              : Number(dureeDepart.mesure)
          valeurDepart = Math.round(valeurBrute * 100) / 100
          /* if (this.sup3) {
            valeurDepart = Math.round(valeurBrute * 10) / 10
          } */
          if (this.sup3 && uniteDepart === 'mindec') {
            valeurDepart = (randint(0, 3) + 0.1 * randint(1, 9)) * 60
          }
        }

        // Convertir vers l'unité d'arrivée pour la réponse
        if (uniteArrivee === 'hhmmss') {
          // Si on convertit vers hhmmss et qu'on a une approximation sur les unités de départ,
          // recalculer le résultat à partir des valeurs arrondies pour la cohérence
          if (uniteDepart !== 'hhmmss') {
            // Recalculer à partir de la valeur de départ arrondie
            valeurDepart = Math.floor((valeurDepart as number) * 100) / 100
            /* if (this.sup3) {
              valeurDepart = Math.round((valeurDepart as number) * 10) / 10
            } */
            const dureeDepArr = new Grandeur(valeurDepart, uniteDepart)
            reponse = dureeDepArr.toHHMMSS()

            estApproximation =
              ((60 * arrondi(valeurDepart * 100)) % 100) % 100 !== 0
          } else {
            reponse = dureeBase.toHHMMSS()
          }
        } else {
          // IMPORTANT: Si on a une approximation sur l'unité de départ,
          // calculer la réponse à partir de la valeur affichée (arrondie) pour la cohérence
          if (uniteDepart !== 'hhmmss') {
            // Recalculer à partir de la valeur de départ arrondie
            const dureeDepArr = new Grandeur(
              valeurDepart as number,
              uniteDepart,
            )
            const dureeArriveeArr = dureeDepArr.convertirEn(uniteArrivee)
            reponse =
              typeof dureeArriveeArr.mesure === 'number'
                ? dureeArriveeArr.mesure
                : Number(dureeArriveeArr.mesure)
          } else {
            const dureeArrivee = dureeBase.convertirEn(uniteArrivee)
            const reponseB =
              typeof dureeArrivee.mesure === 'number'
                ? dureeArrivee.mesure
                : Number(dureeArrivee.mesure)

            // Vérifier si c'est une approximation (plus de 2 décimales)
            if (Math.round(reponseB * 100) !== reponseB * 100) {
              // estApproximation = true
              // Arrondir à 2 décimales pour la cohérence
              reponse = Math.round(reponseB * 100) / 100
              /* }
            if (Math.round(reponseB * 10) !== reponseB * 10 && this.sup3) {
              // estApproximation = true
              // Arrondir à 2 décimales pour la cohérence
              reponse = Math.round(reponseB * 10) / 10
            */
            } else {
              reponse = reponseB
            }
            // reponse = reponseB
          }
        }
        condition1 =
          uniteArrivee === 'hhmmss' &&
          ((reponse as string).length === 3 || (reponse as string).length === 0)
        condition2 = uniteDepart === 'hhmmss' && totalSecondes < 3600
        condition3 =
          uniteArrivee === 'hhmmss' &&
          !(
            ((reponse as string).includes('h') &&
              (reponse as string).includes('min')) ||
            ((reponse as string).includes('h') &&
              (reponse as string).includes('s')) ||
            ((reponse as string).includes('min') &&
              (reponse as string).includes('s'))
          )
      } while (condition1 || condition2 || condition3) // Éviter les réponses du type "0 h 0 min 45 s" et s'assurer qu'au moins h et min ou h et s ou min et s apparaissent

      // Formater la question
      let valeurAffichee: string
      if (uniteDepart === 'hhmmss') {
        // valeurDepart est déjà au format "3 h 45 min 28 s", extraire les nombres
        const matches =
          (valeurDepart as string).match(/(\d+) h|(\d+) min|(\d+) s/g) || []
        const parts: string[] = []
        matches.forEach((match) => {
          if (match.includes(' h')) {
            const h = parseInt(match.replace(' h', ''))
            if (h > 0) parts.push(`$${h}${sp()}$${h <= 1 ? 'heure' : 'heures'}`)
          } else if (match.includes(' min')) {
            const m = parseInt(match.replace(' min', ''))
            if (m > 0) {
              parts.push(`$${m}${sp()}$${m <= 1 ? 'minute' : 'minutes'}`)
            }
          } else if (match.includes(' s')) {
            const s = parseInt(match.replace(' s', ''))
            if (s > 0) {
              parts.push(`$${s}${sp()}$${s <= 1 ? 'seconde' : 'secondes'}`)
            }
          }
        })
        valeurAffichee = parts.join(`${sp()}`)
      } else {
        valeurAffichee = `$${texNombre(valeurDepart as number, 2)}$`
      }

      let uniteAffichageDepart: string = ''
      let uniteAffichageArrivee: string = ''

      switch (uniteDepart) {
        case 'hhmmss':
          uniteAffichageDepart =
            this.sup2 || this.sup3
              ? 'format heures-minutes'
              : 'format heures-minutes-secondes'
          break
        case 'hdec':
          uniteAffichageDepart =
            valeurDepart.toString() !== '1' ? 'heures' : 'heure'
          break
        case 'mindec':
          uniteAffichageDepart = 'minutes'
          break
        default:
          uniteAffichageDepart = this.sup2 || this.sup3 ? 'hh:mm:ss' : 'hh:mm'
          break
      }

      switch (uniteArrivee) {
        case 'hhmmss':
          uniteAffichageArrivee =
            this.sup2 || this.sup3
              ? 'format heures-minutes'
              : 'format heures-minutes-secondes'
          break
        case 'hdec':
          uniteAffichageArrivee = 'heures'
          break
        case 'mindec':
          uniteAffichageArrivee = 'minutes'
          break
        default:
          uniteAffichageArrivee = 'heures'
          break
      }

      texte = `Convertir ${valeurAffichee} ${uniteDepart === 'hhmmss' ? '' : uniteAffichageDepart} en ${uniteAffichageArrivee}.`

      // Ajouter le champ de réponse si interactif
      if (this.interactif) {
        if (uniteArrivee === 'hhmmss') {
          texte +=
            '<br>' +
            ajouteChampTexteMathLive(
              this,
              champIndex,
              KeyboardType.clavierNumbers,
              { texteApres: ' h ' },
            )
          texte += ajouteChampTexteMathLive(
            this,
            champIndex + 1,
            KeyboardType.clavierNumbers,
            { texteApres: ' min ' },
          )
          if (!this.sup2 && !this.sup3)
            texte += ajouteChampTexteMathLive(
              this,
              champIndex + 2,
              KeyboardType.clavierNumbers,
              { texteApres: ' s' },
            )
        } else {
          texte +=
            '<br>' +
            ajouteChampTexteMathLive(
              this,
              champIndex,
              KeyboardType.clavierNumbers,
              { texteAvant: ' ', texteApres: ` ${uniteAffichageArrivee}` },
            )
        }
      } else {
        if (uniteArrivee === 'hhmmss') {
          texte += '<br><br>' + '$\\ldots \\ldots$' + ' h '
          texte += '$\\ldots \\ldots$' + ' min '
          if ((reponse as string).includes('s'))
            texte += '$\\ldots \\ldots$' + ' s '
        } else {
          texte += '<br><br>' + `$\\ldots \\ldots$ ${uniteAffichageArrivee}`
        }
      }

      // Préparer la correction détaillée
      texteCorr = ''
      const correctionDetaillee = this.genererCorrectionDetaillee(
        typeDeQuestion,
        valeurDepart,
        reponse,
        uniteDepart,
        uniteArrivee,
        estApproximation,
      )
      if (this.correctionDetaillee) {
        texteCorr = correctionDetaillee.texte
      }
      texteCorr += this.genererCorrectionSimple(
        valeurDepart,
        reponse,
        uniteDepart,
        uniteArrivee,
        correctionDetaillee.estApproximation,
      )

      // Ajouter la gestion pour l'interactivité
      if (this.interactif) {
        if (uniteArrivee === 'hhmmss') {
          // Extraire heures, minutes, secondes de la réponse
          const hmsString = reponse as string
          const parts =
            hmsString.match(/(\d+)\s*h|(\d+)\s*min|(\d+)\s*s/g) || []
          let heures = 0
          let minutes = 0
          let secondes = 0

          parts.forEach((part) => {
            if (part.includes('h')) {
              heures = parseInt(part.replace(/[^\d]/g, ''))
            } else if (part.includes('min')) {
              minutes = parseInt(part.replace(/[^\d]/g, ''))
            } else if (part.includes('s')) {
              secondes = parseInt(part.replace(/[^\d]/g, ''))
            }
          })

          handleAnswers(this, champIndex, {
            reponse: {
              value: arrondi(heures, 2),
              options: {
                nombreDecimalSeulement: true,
              },
            },
          })
          handleAnswers(this, champIndex + 1, {
            reponse: {
              value: minutes,
              options: {
                nombreDecimalSeulement: true,
              },
            },
          })
          if (!this.sup2 && !this.sup3)
            handleAnswers(this, champIndex + 2, {
              reponse: {
                value: secondes,
                options: {
                  nombreDecimalSeulement: true,
                },
              },
            })
        } else {
          handleAnswers(this, champIndex, {
            reponse: {
              value: arrondi(reponse as number, 2),
              options: {
                nombreDecimalSeulement: true,
              },
            },
          })
        }
      }

      if (this.questionJamaisPosee(i, valeurDepart, typeDeQuestion)) {
        this.listeQuestions.push(texte)
        this.listeCorrections.push(texteCorr)
        // Incrémenter champIndex selon le type de réponse
        champIndex +=
          uniteArrivee === 'hhmmss' ? (this.sup2 || this.sup3 ? 2 : 3) : 1
        cpt++
      } else {
        cpt++
        i--
      }
    }

    listeQuestionsToContenu(this)
  }

  private genererCorrectionDetaillee(
    typeDeQuestion: number,
    valeurDepart: number | string,
    reponse: number | string,
    uniteDepart: string,
    uniteArrivee: string,
    estApproximation: boolean = false,
  ): { texte: string; estApproximation: boolean } {
    let texteCorr = ''

    switch (typeDeQuestion) {
      case 1: {
        // Extraire h, m, s du nouveau format "X h Y min Z s" // hhmmss → hdec
        const valStr1 = valeurDepart as string
        const h1 = valStr1.match(/(\d+) h/)
          ? parseInt(valStr1.match(/(\d+) h/)![1])
          : 0
        const m1 = valStr1.match(/(\d+) min/)
          ? parseInt(valStr1.match(/(\d+) min/)![1])
          : 0
        const s1 = valStr1.match(/(\d+) s/)
          ? parseInt(valStr1.match(/(\d+) s/)![1])
          : 0
        texteCorr =
          this.sup2 || this.sup3
            ? "Pour convertir un temps au format heures-minutes en heures, on convertit les minutes en fractions d'heures. <br>"
            : "Pour convertir un temps au format heures-minutes-secondes en heures, on convertit les minutes et secondes en fractions d'heures. <br>"
        if (h1 > 0) {
          texteCorr += ` Le nombre d'heures ne change pas : $${h1}\\text{\\,h}$. <br>`
        }
        if (m1 > 0) {
          // Vérifier si m1/60 est périodique
          const minToHours = m1 / 60
          // const puissDix = this.sup3 ? 10 : 100
          const puissDix = 100
          const isPeriodicMin =
            Math.round(minToHours * puissDix) !== minToHours * puissDix
          const isExactMin = Math.round(minToHours * 100) === minToHours * 100
          if (isPeriodicMin) estApproximation = true
          texteCorr += !this.sup2
            ? `On divise le nombre de minutes par $60$ pour le convertir en heures : `
            : ''
          texteCorr += `$${m1}\\text{\\,min} = ${this.sup2 ? new FractionEtendue(m1, 60).simplifie().texFSD : new FractionEtendue(m1, 60).texFSD}\\text{\\,h}`
          if (isExactMin) {
            texteCorr += `${!estApproximation ? '=' : '\\approx'}`
            // texteCorr += `${this.sup3 ? `${texNombre(minToHours, 1)}` : `${texNombre(minToHours, 2)}`}\\text{\\,h}$. <br>`
            texteCorr += `${texNombre(minToHours, 2)}\\text{\\,h}`
          }
          texteCorr += '$ <br>'
        }
        const secToHours = s1 / 3600
        const isExactSec = Math.round(secToHours * 100) === secToHours * 100
        if (!isExactSec) estApproximation = true
        if (s1 > 0) {
          // Vérifier si s1/3600 est périodique
          const secToHours = s1 / 3600
          const isPeriodicSec =
            Math.round(secToHours * 100) !== secToHours * 100
          if (isPeriodicSec) estApproximation = true
          texteCorr += `On divise le nombre de secondes par $${texNombre(3600)}$ pour le convertir en heures : $${s1}\\text{\\,s} = \\dfrac{${s1}}{${texNombre(3600)}}\\text{\\,h} ${isExactSec ? `=${secToHours}\\text{\\,h}` : ''}$.<br>`
        }
        texteCorr += 'On somme : $'
        const parts = []
        if (h1 > 0) parts.push(`${h1}`)
        if (m1 > 0) {
          // Utiliser la fraction si elle n'est pas un nombre exact
          const minToHours = m1 / 60
          const isExactMin = Math.round(minToHours * 100) === minToHours * 100
          if (isExactMin) {
            /* parts.push(
              `${this.sup3 ? `${texNombre(minToHours, 1)}` : `${texNombre(minToHours, 2)}`}`,
            ) */
            parts.push(`${texNombre(minToHours, 2)}`)
          } else {
            parts.push(`\\dfrac{${m1}}{60}`)
          }
        }
        if (s1 > 0) {
          // Utiliser la fraction si elle n'est pas un nombre exact

          if (isExactSec) {
            parts.push(`${texNombre(secToHours, 2)}`)
          } else {
            parts.push(`\\dfrac{${s1}}{${texNombre(3600)}}`)
          }
        }
        texteCorr += parts.join(' + ')

        // Si on a des fractions, on peut simplifier le calcul
        if (estApproximation && !this.sup3 && !this.sup2) {
          texteCorr += ` \\approx ${texNombre(reponse as number, 2)}$`
        } else {
          texteCorr += ` = ${texNombre(reponse as number, 2)}$`
        }
        break
      }
      case 2: // hhmmss → mindec
        {
          // Extraire h, m, s du nouveau format "X h Y min Z s"
          const valStr2 = valeurDepart as string
          const h2 = valStr2.match(/(\d+) h/)
            ? parseInt(valStr2.match(/(\d+) h/)![1])
            : 0
          const m2 = valStr2.match(/(\d+) min/)
            ? parseInt(valStr2.match(/(\d+) min/)![1])
            : 0
          const s2 = valStr2.match(/(\d+) s/)
            ? parseInt(valStr2.match(/(\d+) s/)![1])
            : 0
          const totalMinutes = h2 * 60 + m2 + s2 / 60
          texteCorr =
            this.sup2 || this.sup3
              ? 'Pour convertir un temps au format heures-minutes en minutes, on convertit tout en minutes. <br>'
              : 'Pour convertir un temps au format heures-minutes-secondes en minutes, on convertit tout en minutes. <br>'
          const secToMin = s2 / 60
          const isExactSec = Math.round(secToMin * 1000) === secToMin * 1000
          if (h2 > 0) {
            texteCorr += ` heures : $${h2}\\text{\\,h} = ${h2} \\times 60\\text{\\,min}= ${h2 * 60}\\text{\\,min}$ ;`
          }
          texteCorr += ` minutes : $${m2}\\text{\\,min}$${s2 > 0 ? ' ;' : '.'}`
          if (s2 > 0) {
            // Vérifier si s2/60 est périodique
            const secToMin = s2 / 60
            const isPeriodicSec2 =
              Math.round(secToMin * 1000) !== secToMin * 1000
            if (isPeriodicSec2) estApproximation = true
            texteCorr += ` secondes : $${s2}\\text{\\,s} = \\dfrac{${s2}}{60}\\text{\\,min}${isExactSec ? `=${secToMin}\\text{\\,h}` : ''}$.`
          }
          texteCorr += `<br>On somme : $${h2 * 60} + ${m2}`
          if (s2 > 0) {
            if (isExactSec) {
              texteCorr += ` + ${texNombre(secToMin, 3)}`
            } else {
              texteCorr += ` + \\dfrac{${s2}}{60}`
            }
          }
          if (estApproximation) {
            texteCorr += ` \\approx ${texNombre(totalMinutes, 2)}\\text{\\,min}$`
          } else {
            texteCorr += ` = ${texNombre(totalMinutes, 2)}\\text{\\,min}$`
          }
        }
        break

      case 3: {
        // Utiliser la valeur affichée pour la cohérence avec le résultat final // hdec → hhmmss
        const heuresTotales = valeurDepart as number
        const heuresEnt = Math.floor(heuresTotales)

        // Recalculer à partir du résultat final pour garantir la cohérence
        const reponseString = reponse as string
        /* const hFinal = reponseString.match(/(\d+) h/)
          ? parseInt(reponseString.match(/(\d+) h/)![1])
          : 0
        */
        const mFinal = reponseString.match(/(\d+) min/)
          ? parseInt(reponseString.match(/(\d+) min/)![1])
          : 0
        /* const sFinal = reponseString.match(/(\d+) s/)
          ? parseInt(reponseString.match(/(\d+) s/)![1])
          : 0
        */
        // Calculer les valeurs intermédiaires cohérentes
        const partieDecimale = heuresTotales - heuresEnt

        texteCorr =
          this.sup2 || this.sup3
            ? 'Pour convertir des heures au format heures-minutes, on sépare la partie entière (heures) et on convertit la partie décimale.<br>'
            : 'Pour convertir des heures au format heures-minutes-secondes, on sépare la partie entière (heures) et on convertit la partie décimale.<br>'

        // Utiliser la précision d'affichage (2 décimales) pour la cohérence
        texteCorr += `$${texNombre(heuresTotales, 2)}\\text{\\,h} = ${heuresEnt}\\text{\\,h} + ${texNombre(partieDecimale, 2)}\\text{\\,h}$`

        if (partieDecimale > 0) {
          if (this.sup2 || this.sup3) {
            texteCorr +=
              '<br><br>Conversion de la partie décimale en minutes :<br>'
            const minutesTotales = partieDecimale * 60
            texteCorr += `$${texNombre(partieDecimale, 2)}\\text{\\,h} = ${texNombre(partieDecimale, 2)} \\times 60\\text{\\,min} = ${texNombre(minutesTotales, 0)}\\text{\\,min}$`
          } else {
            texteCorr +=
              '<br><br>Conversion de la partie décimale en secondes :<br>'

            // Convertir d'abord en secondes totales
            const secondesTotales = partieDecimale * 3600
            // const egaliteSecondes = estApproximation ? '\\approx' : '='

            texteCorr += `$${texNombre(partieDecimale, 2)}\\text{\\,h} = ${texNombre(partieDecimale, 2)} \\times ${texNombre(3600)}\\text{\\,s} = ${texNombre(secondesTotales, 0)}\\text{\\,s}$`

            if (mFinal > 0) {
              texteCorr += `<br><br>Le nombre de minutes entières est la partie entière du quotient $${texNombre(secondesTotales, 0)} \\div 60$, soit $${mFinal}\\text{\\,min}$.<br>`

              const secondesRestantes = Math.round(
                secondesTotales - mFinal * 60,
              )
              texteCorr += `Le nombre de secondes est donné par le nombre de secondes total moins le nombre de minutes entières $${texNombre(secondesTotales)} - (${mFinal} \\times 60) = ${texNombre(secondesRestantes)}\\text{\\,s}$`
            } else {
              texteCorr += `<br><br>Comme ${texNombre(secondesTotales, 0)} < 60, il n'y a pas de minutes entières, donc ${texNombre(secondesTotales, 0)} secondes.`
            }
          }
        }
        break
      }
      case 4: {
        // mindec → hhmmss
        const minTotales = valeurDepart as number
        const heures4 = Math.floor(minTotales / 60)
        const minutesRestantes = minTotales - heures4 * 60
        const minutes4 = Math.floor(minutesRestantes)
        const secondes4 = Math.round((minutesRestantes - minutes4) * 60)

        texteCorr =
          "Pour convertir des minutes au format heures-minutes-secondes, on divise par $60$ pour obtenir le nombre d'heures, puis on traite le reste.<br><br>"
        texteCorr += `Le nombre d'heures entières correspond à la partie entière du quotient $${texNombre(minTotales, 2)}\\text{\\,min} \\div 60$, soit $${heures4}\\text{\\,h}$. `
        if (heures4 > 0) {
          if (!this.sup2 && !this.sup3) {
            texteCorr += `<br><br>Il reste à convertir : $${minTotales}-(${heures4}\\times 60) =${texNombre(minutesRestantes, 2)}\\text{\\,min}$ en minutes`
            texteCorr += this.sup2 || this.sup3 ? '' : ` et secondes`
          } else {
            texteCorr += `<br><br>Il reste à trouver les minutes : $${minTotales}-(${heures4}\\times 60) =${texNombre(minutesRestantes, 2)}\\text{\\,min}$`
          }
        }
        if (!this.sup2 && !this.sup3) {
          const egalite4 = estApproximation ? '\\approx' : '='
          if (minutesRestantes !== minutes4) {
            texteCorr += `<br><br>$${texNombre(minutesRestantes, 2)}\\text{\\,min} = ${minutes4}\\text{\\,min} + ${texNombre(minutesRestantes - minutes4, 3)}\\text{\\,min}$<br>`
            texteCorr += `$${texNombre(minutesRestantes - minutes4, 3)}\\text{\\,min} = ${texNombre(minutesRestantes - minutes4, 3)} \\times 60 \\text{\\,s} ${egalite4} ${secondes4}\\text{\\,s}$`
          } else {
            texteCorr += `<br><br> Il y a un nombre entier de minutes, donc $${minutes4}\\text{\\,min}$ et $0\\text{\\,s}$.`
          }
        }
        break
      }
      case 5: {
        // hdec → mindec
        texteCorr =
          'Pour convertir des heures en minutes, on multiplie par $60$ (car $1\\text{\\,h} = 60\\text{\\,min}$).<br><br>'
        const egalite5 = estApproximation ? '\\approx' : '='
        texteCorr += `$${texNombre(valeurDepart as number, 2)}\\text{\\,h} = ${texNombre(valeurDepart as number, 2)} \\times 60 \\text{\\,min}${egalite5} ${texNombre(reponse as number, 2)}\\text{\\,min}$`
        break
      }
      case 6: {
        // mindec → hdec
        texteCorr =
          'Pour convertir des minutes en heures, on divise par $60$ (car $60\\text{\\,min} = 1\\text{\\,h}$).<br><br>'
        if (
          texNombre(reponse as number, 2) !== texNombre(reponse as number, 3)
        ) {
          estApproximation = true
        }
        const egalite6 = estApproximation ? '\\approx' : '='
        texteCorr += `$${texNombre(valeurDepart as number, 2)}\\text{\\,min} = ${texNombre(valeurDepart as number, 2)} \\div 60 \\text{\\,h}${egalite6} ${texNombre(reponse as number, 2)}\\text{\\,h}$`
        break
      }
    }
    texteCorr += '.<br>Ainsi, '

    return { texte: texteCorr, estApproximation }
  }

  private genererCorrectionSimple(
    valeurDepart: number | string,
    reponse: number | string,
    uniteDepart: string,
    uniteArrivee: string,
    estApproximation: boolean,
  ): string {
    let texteCorr = '$'

    // Afficher la valeur de départ avec son unité
    if (typeof valeurDepart === 'string') {
      // valeurDepart est déjà formaté avec les unités (ex: "1 h 2 min 30 s")
      // On doit le convertir au format LaTeX
      const valeurAvecUnites = valeurDepart
        .replace(/(\d+) h/g, '$1\\text{\\,h }')
        .replace(/(\d+) min/g, '$1\\text{\\,min }')
        .replace(/(\d+) s/g, '$1\\text{\\,s}')
      texteCorr += `${valeurAvecUnites} `
    } else {
      // valeurDepart est un nombre, ajouter l'unité appropriée
      const uniteTexte =
        uniteDepart === 'hdec'
          ? '\\text{\\,h}'
          : uniteDepart === 'mindec'
            ? '\\text{\\,min}'
            : ''
      texteCorr += `${texNombre(valeurDepart, 2)}${uniteTexte} `
    }

    let egalite = estApproximation ? '\\approx' : '='
    if (uniteDepart === 'hdec' && uniteArrivee === 'hhmmss') {
      egalite = '='
    }
    // Afficher la réponse avec son unité
    if (typeof reponse === 'string') {
      // reponse est déjà formaté avec les unités (ex: "1 h 2 min 30 s")
      let reponseAvecUnites = reponse
        .replace(/(\d+) h/g, '$1\\text{\\,h }')
        .replace(/(\d+) min/g, '$1\\text{\\,min }')
        .replace(/(\d+) s/g, '$1\\text{\\,s}')

      // Ajouter "0 s" si il y a des heures ou minutes mais pas de secondes
      if (
        (reponse.includes('h') || reponse.includes('min')) &&
        !reponse.includes('s')
      ) {
        if (!this.sup2 && !this.sup3) reponseAvecUnites += ' 0\\text{\\,s}'
      }

      texteCorr += `${egalite} ${reponseAvecUnites.replace(/(\d+)/g, (match) => miseEnEvidence(match))}`
    } else {
      // reponse est un nombre, ajouter l'unité appropriée
      const uniteTexte =
        uniteArrivee === 'hdec'
          ? '\\text{\\,h}'
          : uniteArrivee === 'mindec'
            ? '\\text{\\,min}'
            : ''
      texteCorr += `${egalite} ${miseEnEvidence(texNombre(reponse, 2)) + uniteTexte}`
    }

    texteCorr = texteCorr.replace(/\s+\}$/, '}') + '$.'
    return texteCorr
  }
}
