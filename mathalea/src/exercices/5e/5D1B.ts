import { amcConvert } from '../../lib/amc/amcBuilders'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  listeDeNotes,
  tirerLesDes,
  unMoisDeTemperature,
} from '../../lib/outils/aleatoires'
import { choice } from '../../lib/outils/arrayOutils'
import { joursParMois, nomDuMois } from '../../lib/outils/dateEtHoraires'
import { texFractionFromString } from '../../lib/outils/deprecatedFractions'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { prenom } from '../../lib/outils/Personne'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Calculer des fréquences'

export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'

export const dateDeModifImportante = '28/02/2022'

/**
 * Calculs de fréquences dans des séries statistiques
 * @author Jean-claude Lhote (Interactif et AMC par EE)
 */
export const uuid = '8cdd5'

export const refs = {
  'fr-fr': ['5D1B', 'BP2AutoA2', 'BP2SP3', '3AutoS02-1'],
  'fr-2016': ['5S13', 'BP2AutoA2', 'BP2SP3', '3AutoP02-1'],
  'fr-ch': ['11CTNO4A-7', '11LCNO4A-7', '11LSNO4A-7'],
}
export default class CalculerDesFrequences extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Type de séries',
      3,
      '1 : Lancers de dés \n2 : Liste de notes\n3 : Un mois de températures',
    ]

    this.nbQuestions = 1

    this.spacingCorr = 1.5

    this.sup = 1
  }

  nouvelleVersion() {
    for (
      let i = 0,
        temperatures,
        nombreTemperatures,
        nombreNotes,
        notes,
        reponse,
        nombreDes,
        nombreFaces,
        nombreTirages,
        indexValeur,
        frequence,
        tirages,
        texte,
        texteCorr,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      if (this.sup === 1) {
        // ici on lance des dés
        nombreDes = randint(1, 2)
        nombreFaces = choice([4, 6, 8, 10])
        nombreTirages = choice([50, 100, 200, 500, 1000])
        tirages = tirerLesDes(nombreTirages, nombreFaces, nombreDes) // on récupère une série rangée dans l'ordre croissant avec les effectifs correspondants
        do {
          indexValeur = randint(0, tirages.length - 1)
        } while (tirages[indexValeur][1] === 0) // on choisit au hasard l'index d'une valeur dont l'effectif est différent de 0.
        if (nombreDes > 1) {
          texte = `On a réalisé $${texNombre(nombreTirages)}$ lancers de $${nombreDes}$ dés à $${nombreFaces}$ faces.<br>`
        } else {
          texte = `On a réalisé $${texNombre(nombreTirages)}$ lancers d'un dé à $${nombreFaces}$ faces.<br>`
        }
        texte +=
          'Les résultats sont inscrits dans ' +
          (tirages.length > 12 ? 'les tableaux' : 'le tableau') +
          ' ci-dessous.<br><br>'
        if (tirages.length > 12) {
          texte += '$\\def\\arraystretch{1.5}\\begin{array}{|c' // construction du tableau des effectifs 1/2
          for (let j = 0; j <= Math.round(tirages.length / 2); j++) {
            texte += '|c'
          }
          texte += '}\\hline  \\text{Scores}'
          for (let j = 0; j < Math.round(tirages.length / 2); j++) {
            texte += '&' + tirages[j][0]
          }
          texte += "\\\\\\hline \\text{Nombre d'apparitions}"
          for (let j = 0; j < Math.round(tirages.length / 2); j++) {
            texte += '&' + tirages[j][1]
          }
          texte += '\\\\\\hline\\end{array}$<br><br>'

          texte += '$\\def\\arraystretch{1.5}\\begin{array}{|c' // construction du tableau des effectifs 2/2
          for (
            let j = Math.round(tirages.length / 2);
            j <= tirages.length;
            j++
          ) {
            texte += '|c'
          }
          texte += '}\\hline  \\text{Scores}'
          for (
            let j = Math.round(tirages.length / 2);
            j < tirages.length;
            j++
          ) {
            texte += '&' + tirages[j][0]
          }
          texte += "\\\\\\hline \\text{Nombre d'apparitions}"
          for (
            let j = Math.round(tirages.length / 2);
            j < tirages.length;
            j++
          ) {
            texte += '&' + tirages[j][1]
          }
          texte += '\\\\\\hline\\end{array}$'
        } else {
          texte += '$\\def\\arraystretch{1.5}\\begin{array}{|c' // construction du tableau des effectifs en un seul morceau
          for (let j = 0; j <= tirages.length; j++) {
            texte += '|c'
          }
          texte += '}\\hline  \\text{Scores}'
          for (let j = 0; j < tirages.length; j++) {
            texte += '&' + tirages[j][0]
          }
          texte += "\\\\\\hline \\text{Nombre d'apparitions}"
          for (let j = 0; j < tirages.length; j++) {
            texte += '&' + tirages[j][1]
          }
          texte += '\\\\\\hline\\end{array}$'
        }

        texte +=
          '<br><br> Calculer la fréquence de la valeur ' +
          `$${arrondi(nombreDes + indexValeur)}$.`
        texteCorr =
          'La valeur ' +
          `$${arrondi(nombreDes + indexValeur)}$ apparaît ` +
          `$${tirages[indexValeur][1]}$ fois.<br>Le nombre total de lancers est $${texNombre(nombreTirages)}$.<br>`
        texteCorr +=
          'La fréquence de la valeur ' +
          `$${arrondi(nombreDes + indexValeur)}$` +
          ' est ' +
          `$${miseEnEvidence(texFractionFromString(tirages[indexValeur][1], texNombre(nombreTirages)))}=${miseEnEvidence(texNombre(arrondi(tirages[indexValeur][1] / nombreTirages)))}$, `
        texteCorr +=
          'soit ' +
          `$${texNombre(arrondi((tirages[indexValeur][1] * 100) / nombreTirages))}\\thickspace\\%$.`
        reponse = new FractionEtendue(tirages[indexValeur][1], nombreTirages)
      } else if (this.sup === 2) {
        // ici on trie des notes
        nombreNotes = choice([8, 10, 12])
        notes = listeDeNotes(nombreNotes, randint(0, 7), randint(13, 20)) // on récupère une liste de notes (série brute)
        indexValeur = randint(0, notes.length - 1) // on choisit une des notes au hasard
        frequence = 0
        for (let j = 0; j < notes.length; j++) {
          // fréquence va contenir l'effectif de la note choisie
          if (notes[j] === notes[indexValeur]) {
            frequence++
          }
        }
        texte = `${prenom()} a obtenu ces notes ce trimestre-ci en mathématiques :<br>`
        texte += `$${notes[0]}$`
        for (let j = 1; j < nombreNotes - 1; j++) {
          texte += `; $${notes[j]}$ `
        } // On liste les notes (série brute)
        texte += `et $${notes[nombreNotes - 1]}$.`

        texte += `<br><br>Calculer la fréquence de la note $${notes[indexValeur]}$.`
        texteCorr = `La note $${notes[indexValeur]}$ a été obtenue $${frequence}$ fois.<br> Il y a $${nombreNotes}$ notes.<br>`
        texteCorr +=
          `Donc la fréquence de la note $${notes[indexValeur]}$ est : ` +
          `$${miseEnEvidence(texFractionFromString(texNombre(frequence), texNombre(nombreNotes)))}$`
        reponse = new FractionEtendue(frequence, nombreNotes)
        if (arrondi(frequence / nombreNotes, 3) === frequence / nombreNotes) {
          // valeurs exactes
          texteCorr += `$=${miseEnEvidence(texNombre(frequence / nombreNotes, 3))}$, ` // fréquence à 3 chiffres significatifs
          texteCorr +=
            'soit ' +
            `$${texNombre(arrondi((frequence * 100) / nombreNotes))}\\thickspace\\%$.` // fréquence en pourcentage avec 1 décimale
        } else {
          texteCorr += `$\\approx${texNombre(frequence / nombreNotes, 3)}$, ` // valeurs arrondies
          texteCorr +=
            'soit environ ' +
            `$${texNombre(arrondi((frequence * 100) / nombreNotes), 1)}\\thickspace\\%$.`
        }
      } else {
        // ici on relève des températures
        const mois = randint(1, 12)
        const annee = randint(1980, 2019)
        const temperaturesDeBase = [3, 5, 9, 13, 19, 24, 26, 25, 23, 18, 10, 5]
        nombreTemperatures = joursParMois(mois, annee)
        temperatures = unMoisDeTemperature(
          temperaturesDeBase[mois - 1],
          mois,
          annee,
        ) // on récupère une série de températures correspondant à 1 mois d'une année (série brute)
        indexValeur = randint(0, temperatures.length - 1) // on choisit l'index d'une valeur au hasard
        frequence = 0
        for (let j = 0; j < temperatures.length; j++) {
          if (temperatures[j] === temperatures[indexValeur]) {
            frequence++
          } // frequence contient l'effectif de cette valeur
        }
        texte = `En ${nomDuMois(mois)} ${annee}, à ${choice(['Moscou', 'Berlin', 'Paris', 'Bruxelles', 'Rome', 'Belgrade'])}, on a relevé les températures suivantes.<br><br>`

        texte += '$\\def\\arraystretch{1.5}\\begin{array}{|c' // On construit le tableau des températures
        texte += '|c'
        for (let j = 0; j < Math.round(temperatures.length / 2); j++) {
          texte += '|c'
        }
        texte += '}\\hline  \\text{Jour}'
        for (let j = 0; j < Math.round(temperatures.length / 2); j++) {
          texte += '&' + texNombre(j + 1)
        }
        texte += '\\\\\\hline \\text{Température en}  ^\\circ\\text{C}'
        for (let j = 0; j < Math.round(temperatures.length / 2); j++) {
          texte += '&' + temperatures[j]
        }
        texte += '\\\\\\hline\\end{array}$<br><br>'
        texte += '$\\def\\arraystretch{1.5}\\begin{array}{|c' // On construit le tableau des températures
        texte += '|c'
        for (
          let j = Math.round(temperatures.length / 2);
          j < temperatures.length;
          j++
        ) {
          texte += '|c'
        }
        texte += '}\\hline  \\text{Jour}'
        for (
          let j = Math.round(temperatures.length / 2);
          j < temperatures.length;
          j++
        ) {
          texte += '&' + texNombre(j + 1)
        }
        texte += '\\\\\\hline \\text{Température en}  ^\\circ\\text{C}'
        for (
          let j = Math.round(temperatures.length / 2);
          j < temperatures.length;
          j++
        ) {
          texte += '&' + temperatures[j]
        }
        texte += '\\\\\\hline\\end{array}$'

        texte +=
          '<br><br>Calculer la fréquence de la température ' +
          `$${temperatures[indexValeur]}^\\circ\\text{C}$.`
        texteCorr = `En ${nomDuMois(mois)} ${annee}, à ${choice(['Moscou', 'Berlin', 'Paris', 'Bruxelles', 'Rome', 'Belgrade'])}, la température $${temperatures[indexValeur]}^\\circ\\text{C}$ a été relevée $${frequence}$ fois.<br>`
        texteCorr += `Il y a $${joursParMois(mois, annee)}$ jours ce mois-ci.<br> La fréquence de la température $${temperatures[indexValeur]}^\\circ\\text{C}$ est : `
        texteCorr += `$${miseEnEvidence(texFractionFromString(texNombre(frequence), texNombre(joursParMois(mois, annee))))}$`
        reponse = new FractionEtendue(frequence, joursParMois(mois, annee))
        if (
          arrondi(frequence / nombreTemperatures, 3) ===
          frequence / nombreTemperatures
        ) {
          // valeurs exactes
          texteCorr += `$=${miseEnEvidence(texNombre(frequence / nombreTemperatures, 3))}$, `
          texteCorr +=
            'soit ' +
            `$${texNombre(arrondi((frequence * 100) / nombreTemperatures))}\\thickspace\\%$.`
        } else {
          texteCorr += `$\\approx${texNombre(frequence / nombreTemperatures, 3)}$, ` // valeurs arrondies
          texteCorr +=
            'soit environ ' +
            `$${texNombre(arrondi((frequence * 100) / nombreTemperatures), 1)}\\thickspace\\%$.`
        }
      }
      if (this.interactif) {
        texte +=
          ' On donnera la valeur exacte en écriture fractionnaire ou décimale si elle existe.<br>'
        texte += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierDeBaseAvecFraction,
        )
        handleAnswers(
          this,
          i,
          {
            reponse: {
              value: reponse,
              options: { fractionEgale: true, nombreDecimalSeulement: true },
            },
          },
          { digits: 5, digitsNum: 3, digitsDen: 2, signe: true },
        )
      }
      if (context.isAmc) {
        reponse = reponse.simplifie()
        this.autoCorrectionAMC[i] = {
          enonce: texte,
          options: { multicols: true, barreseparation: true }, // facultatif. Par défaut, multicols est à false. Ce paramètre provoque un multicolonnage (sur 2 colonnes par défaut) : pratique quand on met plusieurs AMCNum. !!! Attention, cela ne fonctionne pas, nativement, pour AMCOpen. !!!
          propositions: [
            {
              type: 'AMCOpen',
              propositions: [
                {
                  texte: texteCorr,
                  statut: 3,
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
                    texte: "Résultat sous forme d'une fraction irréductible",
                    valeur: reponse,
                    param: {
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
      if (this.listeQuestions.indexOf(texte) === -1) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
