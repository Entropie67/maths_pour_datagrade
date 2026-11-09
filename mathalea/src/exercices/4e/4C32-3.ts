import { amcConvert } from '../../lib/amc/amcBuilders'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const titre =
  'Résoudre des problèmes avec des puissances de $10$ et des conversions'
export const dateDePublication = '05/02/2021'
export const dateDeModifImportante = '30/10/2026'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCOpen'

/**
 * Problèmes avec des multiplications ou des divisions avec des puissances de 10 et des conversions
 * @author Rémi Angot (pour les problèmes 1 à 4) et Éric Elter (pour les problèmes 5 à 8 et pour l'interactif)
 */
export const uuid = '5c9c2'

export const refs = {
  'fr-fr': ['4C32-3', 'BP2AutoE9'],
  'fr-ch': ['10LCNO5B-3', '10LSNO5B-3', 'PRQNO07C-3', 'PRQNO15C-6'],
}

function decompositionScientifique(n: number) {
  if (n === 0) return { mantisse: 0, exposant: 0 }

  // Utilise la notation scientifique complète
  const exp = n.toExponential()
  const [mantisseStr, exposantStr] = exp.split('e')

  return {
    mantisse: parseFloat(mantisseStr),
    exposant: parseInt(exposantStr, 10),
  }
}

export default class ProblemesPuissancesDe10EtConversions extends Exercice {
  constructor() {
    super()

    this.besoinFormulaireTexte = [
      'Type de problèmes',
      'Nombres séparés par des tirets :\n1 : Informatique (fichiers)\n2 : Informatique (serveur)\n3 : Électricité\n4 : Vitesse de la lumière\n5 : Médecine\n6 : Écologie\n7 : Biologie marine\n8 : Physique nucléaire\n9 : Mélange',
    ]

    this.sup = '9'
    this.nbQuestions = 4

    this.spacingCorr = context.isHtml ? 2 : 1
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions > 1
        ? 'Résoudre les problèmes suivants.'
        : 'Résoudre le problème suivant.'

    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 8,
      melange: 9,
      defaut: 9,
      nbQuestions: this.nbQuestions,
    }).map(Number)

    for (
      let i = 0, texte, texteCorr, a, a1, b, b1, c, c1, u, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      let reponseNumerique = 0
      let mantisse, exposant
      // Boucle principale où i+1 correspond au numéro de la question
      switch (listeTypeDeQuestions[i]) {
        case 1: {
          // Informatique - fichiers
          a = randint(3, 7)
          a1 = randint(3, 7, a) * 100
          a *= 100
          b = randint(11, 40)
          b1 = choice([650, 700, 750])
          c = randint(3, 20)
          c1 = randint(11, 49) / 10
          texte = `Sur mon disque dur, j'ai $${a}$ photos de $${a1}~\\text{ko}$, $${b}$ films de $${b1}~\\text{Mo}$ et $${c}$ films HD de $${texNombre(c1)}~\\text{Go}$.<br>`
          texte += `Combien de place vont occuper tous ces fichiers${sp()}? `
          texte += this.interactif
            ? ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierFullOperations,
                { texteApres: '$~\\text{Go}$' },
              )
            : 'Donner le résultat en giga-octets.'
          texteCorr = `Taille des photos${sp()}: $${a}\\times${a1}~\\text{ko}=${texNombre(a * a1)}~\\text{ko}=${texNombre((a * a1) / 1000)}~\\text{Mo}$<br>`
          texteCorr += `Taille des films${sp()}: $${b}\\times${b1}~\\text{Mo}=${texNombre(b * b1)}~\\text{Mo}$<br>`
          texteCorr += `Taille des films HD${sp()}: $${c}\\times${texNombre(c1)}~\\text{Go}=${texNombre(c * c1)}~\\text{Go}=${texNombre(c * c1 * 1000)}~\\text{Mo}$<br>`
          reponseNumerique = ((a * a1) / 1000 + b * b1 + c * c1 * 1000) / 1000
          texteCorr += `Taille totale${sp()}: $${texNombre((a * a1) / 1000)}~\\text{Mo}+${texNombre(b * b1)}~\\text{Mo}+${texNombre(c * c1 * 1000)}~\\text{Mo}=${texNombre((a * a1) / 1000 + b * b1 + c * c1 * 1000)}~\\text{Mo}=${miseEnEvidence(texNombre(((a * a1) / 1000 + b * b1 + c * c1 * 1000) / 1000))}~\\text{Go}$`
          break
        }
        /* Abandonné car tera n'est pas un préfixe au programme de collège
          case 2: // Informatique - serveur
          a = randint(11, 49, [20, 30, 40]) / 10
          a1 = randint(4, 10)
          b = randint(11, 40)
          texte = `Un serveur héberge $${texNombre(a)}\\times10^{${a1}}$ fichiers de $${b}$ Mo.<br>`
          texte +=
            'Combien de place occupent tous ces fichiers ? Donner le résultat en tera-octets.'
          texteCorr = `$${texNombre(a)}\\times10^{${a1}}\\times${b}~\\text{Mo}=${texNombre(a * b)}\\times10^{${a1}}~\\text{Mo}$<br>`
          texteCorr +=
            'Or $1~\\text{To}=1~000~\\text{Go}=1~000~000~\\text{Mo}$, il faut donc diviser par un million ou multiplier par $10^{-6}$ pour convertir les méga-octets en tera-octets.<br>'
          texteCorr += `$${texNombre(a * b)}\\times10^{${a1}}~\\text{Mo}=${texNombre(a * b)}\\times10^{${a1 - 6}}~\\text{To}$`
          break
        */

        case 2: // Informatique - serveur
          a = randint(11, 49, [20, 30, 40]) / 10
          a1 = randint(4, 10)
          b = randint(11, 40)
          texte = `Un serveur héberge $${texNombre(a)}\\times10^{${a1}}$ fichiers de $${b}$ Mo.<br>`
          texte += `Combien de place occupent tous ces fichiers${sp()}? `
          texte += this.interactif
            ? ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierFullOperations,
                { texteApres: '$~\\text{Go}$' },
              )
            : 'Donner le résultat en giga-octets.'
          reponseNumerique = arrondi(a * b * Math.pow(10, a1 - 3), 0)
          texteCorr = `$${texNombre(a)}\\times10^{${a1}}\\times${b}~\\text{Mo}=${texNombre(a * b)}\\times10^{${a1}}~\\text{Mo}$<br>`
          texteCorr += `Or $1~\\text{Go}=${texNombre(1000)}~\\text{Mo}$, il faut donc diviser par $${texNombre(1000)}$ ou multiplier par $10^{-3}$ pour convertir les méga-octets en giga-octets.<br>`
          texteCorr += `$${texNombre(a * b)}\\times10^{${a1}}~\\text{Mo}=${texNombre(a * b)}\\times10^{${a1}}\\times10^{-3}~\\text{Go}=${miseEnEvidence(`${texNombre(a * b)}\\times10^{${a1 - 3}}`)}~\\text{Go}$`
          break

        case 3: // Électricité
          a = choice([30, 35, 40, 45])
          b = randint(11, 49, [20, 30, 40]) * 100
          texte = `On estime qu'un foyer consomme $${a}~\\text{kWh}$ par jour. Si une centrale électrique produit $${texNombre(b)}~\\text{GWh}$ par an, combien de foyers pourra-t-elle alimenter${sp()}? Arrondir à l'unité.`
          texte += this.interactif
            ? ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierFullOperations,
                { texteApres: '$~\\text{Go}$' },
              )
            : ''
          texteCorr = `Consommation annuelle d'un foyer français${sp()}: $365\\times${texNombre(a)}~\\text{kWh} = ${texNombre(a * 365)}~\\text{kWh}$<br>`
          reponseNumerique = arrondi((b * 10 ** 9) / (a * 365 * 10 ** 3), 0)
          texteCorr += `Nombre de foyers pouvant être alimentés par cette centrale${sp()}: $\\dfrac{${texNombre(b)}~\\text{GWh}}{${texNombre(a * 365)}~\\text{kWh}}=\\dfrac{${texNombre(b)}\\times10^{9}~\\text{Wh}}{${texNombre(a * 365)}\\times10^3~\\text{Wh}}\\approx${miseEnEvidence(texNombre(reponseNumerique, 0))}$`
          break

        case 4: {
          // Vitesse de la lumière
          a = randint(2, 22)
          u = choice(['j', 'h'])
          b = u
          texte = `On admet que la vitesse de la lumière dans le vide est de $3\\times10^8~\\text{m/s}$. Quelle est la distance parcourue par la lumière en $${a}$ `
          if (u === 'j') {
            texte += `jours${sp()}? `
            reponseNumerique = arrondi(
              ((a * 24 * 3600 * 3) / 1000) * 10 ** 8,
              0,
            )
            mantisse = decompositionScientifique(reponseNumerique).mantisse
            exposant = decompositionScientifique(reponseNumerique).exposant
            texteCorr =
              `Dans une journée, il y a $24$ heures et dans chaque heure $3~600$ secondes, la distance parcourue est donc${sp()}: <br>`
            texteCorr += `$${a}\\times24\\times3~600~\\text{s}\\times3\\times10^8~\\text{m/s}`
          } else {
            reponseNumerique = arrondi(((a * 3600 * 3) / 1000) * 10 ** 8, 0)
            mantisse = decompositionScientifique(reponseNumerique).mantisse
            exposant = decompositionScientifique(reponseNumerique).exposant
            texte += `heures${sp()}? `
            texteCorr =
              `Dans une heure, il y a $3~600$ secondes, la distance parcourue est donc${sp()}: <br>`
            texteCorr += `$${a}\\times3~600~\\text{s}\\times3\\times10^8~\\text{m/s}`
          }
          texteCorr += `=${texNombre(a * 24 * 3600 * 3)}\\times10^8\\text{ m}=${texNombre(mantisse)}\\times10^{${texNombre(exposant - 8 + 3)}}\\times10^8\\text{ m}=${texNombre(mantisse)}\\times10^{${texNombre(exposant + 3)}}\\times10^{-3}\\text{ km}=${miseEnEvidence(`${texNombre(mantisse)}\\times10^{${texNombre(exposant)}}`)}\\text{ km}$`

          texte += this.interactif
            ? ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierFullOperations,
                { texteApres: '$\\text{ km}$' },
              )
            : 'Donner le résultat en kilomètres.'
          break
        }
        case 5: // Médecine
          a = randint(5000, 15000) * 100 // distance en km
          b = randint(20, 30) / 10 // coefficient pour le nombre de globules rouges (2,0 à 3,0)
          texte = `Un globule rouge a un diamètre moyen de $${randint(6, 8)}~\\mu\\text{m}$ et parcourt environ $${texNombre(a)}\\text{ m}$ par jour dans le système circulatoire. Si le corps humain contient environ $${texNombre(b)}\\times10^{13}$ globules rouges, quelle distance totale parcourent tous les globules rouges en une journée${sp()}? `
          texte += this.interactif
            ? ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierFullOperations,
                { texteApres: '$\\text{ km}$' },
              )
            : 'Donner le résultat en kilomètres.'
          texteCorr = `Distance par globule rouge${sp()}: $${texNombre(a)}\\text{ m} = ${texNombre(a)} \\times 10^{-3}\\text{ km}$<br>`
          reponseNumerique = a * b * 10 ** 10
          mantisse = decompositionScientifique(reponseNumerique).mantisse
          exposant = decompositionScientifique(reponseNumerique).exposant
          texteCorr += `Distance totale${sp()}: $${texNombre(b)}\\times10^{13} \\times ${texNombre(a)}\\times10^{-3}\\text{ km} = ${miseEnEvidence(`${texNombre(mantisse)}\\times 10^{${texNombre(exposant)}`)}}\\text{ m}$`
          break

        case 6: {
          // Écologie
          a = randint(40, 60) // émission électrique en mg/m
          b = randint(110, 140) // émission essence en mg/m
          c = randint(12, 30) / 10 // distance en 10^7 m
          texte = `Une voiture électrique émet indirectement $${a}~\\text{mg}$ de CO$_2$ par mètre parcouru (production d'électricité), tandis qu'une voiture essence émet $${b}~\\text{mg}$ de CO$_2$ par mètre. `
          texte += `Si une famille parcourt $${texNombre(c * 10000)}$ kilomètres par an, quelle quantité de CO$_2$ économise-t-elle en choisissant l'électrique plutôt que l'essence${sp()}? `
          texte += this.interactif
            ? ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierFullOperations,
                { texteApres: '$~\\text{kg}$' },
              )
            : 'Donner le résultat en kg.'
          const emissionEssence = (b * c * 10000000) / 1000000 // conversion en kg
          const emissionElectrique = (a * c * 10000000) / 1000000 // conversion en kg
          const economie = arrondi(emissionEssence - emissionElectrique)
          reponseNumerique = economie
          texteCorr = `Distance parcourue${sp()}: en $\\text{m}$${sp()}: $${texNombre(c * 10000)}\\text{ km}=${texNombre(c)}\\times10^4\\text{ km}=${texNombre(c)}\\times10^4\\times10^3\\text{ m}=${texNombre(c)}\\times10^7\\text{ m}$<br>`
          texteCorr += `Émission de CO$_2$ pour la voiture essence${sp()}: $${texNombre(c)}\\times10^7\\text{ m} \\times ${b}~\\text{mg/m} = ${texNombre(b * c)}\\times10^7~\\text{mg}$<br>`
          texteCorr += `Émission de CO$_2$ pour la voiture électrique${sp()}: $${texNombre(c)}\\times10^7\\text{ m} \\times ${a}~\\text{mg/m} = ${texNombre(a * c)}\\times10^7~\\text{mg}$<br>`
          texteCorr += `Économie de CO$_2$${sp()}: $${texNombre(b * c)}\\times10^7 - ${texNombre(a * c)}\\times10^7 = ${texNombre((b - a) * c)}\\times10^7~\\text{mg}$<br>`
          texteCorr += `Conversion de l'économie de CO$_2$ en kg${sp()}: $${texNombre((b - a) * c)}\\times10^7~\\text{mg} = ${texNombre((b - a) * c)}\\times10^7 \\times 10^{-6}~\\text{kg}  = ${miseEnEvidence(texNombre(economie))}~\\text{kg}$`
          break
        }
        case 7: {
          // Biologie marine
          a = randint(2, 5) // taille en µm
          b = randint(25, 45) / 10 // masse en nanogrammes
          c = randint(35, 55) / 10 // nombre d'organismes (coefficient pour 10^8)
          const d = randint(20, 30) / 10 // volume du lac (coefficient pour 10^6)
          const masseIndividuelle = b * Math.pow(10, -9) // en grammes
          const nombreTotal = c * d * Math.pow(10, 14)
          const masseTotal = arrondi((nombreTotal * masseIndividuelle) / 1000) // en kg
          reponseNumerique = masseTotal
          texte = `Un phytoplancton microscopique mesure en moyenne $${texNombre(a)}~\\mu\\text{m}$ de long et pèse $${texNombre(b)}~\\text{ng}$. `
          texte += `Dans $1\\text{ m}^3$ d'eau dans un lac, on compte environ $${texNombre(c)}\\times10^8$ de ces organismes. `
          texte += `Quelle est la masse totale de phytoplanctons dans un lac de $${texNombre(d)}\\times10^6\\text{ m}^3$${sp()}? `
          texte += this.interactif
            ? ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierFullOperations,
                { texteApres: '$~\\text{kg}$' },
              )
            : 'Donner le résultat en kg.'
          texteCorr = `Masse d'un phytoplancton${sp()}: $${texNombre(b)}~\\text{ng} = ${texNombre(b)} \\times 10^{-9}~\\text{g}$<br>`
          texteCorr += `Nombre total d'organismes${sp()}: $${texNombre(c)}\\times10^8 \\times ${texNombre(d)}\\times10^6 = ${texNombre(c * d)}\\times10^{14}$<br>`
          texteCorr += `Masse totale de phytoplanctons${sp()}: $${texNombre(c * d)}\\times10^{14} \\times ${texNombre(b)}\\times10^{-9}~\\text{g} = ${texNombre(c * d * b)}\\times10^5~\\text{g}$<br>`
          texteCorr += `Conversion de la masse totale de phytoplanctons en kg${sp()}: $${texNombre(c * d * b)}\\times10^5~\\text{g} = ${texNombre(c * d * b)}\\times10^5 \\times 10^{-3}~\\text{kg} = ${texNombre((c * d * b) / 10)}\\times10^3~\\text{kg} = ${miseEnEvidence(texNombre(masseTotal))}~\\text{kg}$`
          break
        }
        case 8: // Physique nucléaire
        default: {
          a = (3.6 * randint(25, 40)) / 10 // énergie par jour (coefficient pour 10^16)
          const energieAnnuelle = a * 365 * Math.pow(10, 16) // en joules
          const energieKwh = energieAnnuelle / (3.6 * Math.pow(10, 6)) // en kWh
          const energieGwh = arrondi(energieKwh / Math.pow(10, 6)) // en GWh
          b = energieGwh
          texte = `Un réacteur nucléaire produit $${texNombre(a)}\\times10^{16}$ joules d'énergie par jour. Si 1 kilowatt-heure ($\\text{kWh}$) équivaut à $3,6\\times10^6$ joules, combien de gigawatt-heures ($\\text{GWh}$) d'énergie ce réacteur produit-il par an (prendre 365 jours par an)${sp()}?`
          texte += this.interactif
            ? ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierFullOperations,
                { texteApres: '$~\\text{GWh}$' },
              )
            : ''
          reponseNumerique = energieGwh
          mantisse = decompositionScientifique(reponseNumerique).mantisse
          exposant = decompositionScientifique(reponseNumerique).exposant
          texteCorr = `Énergie par an en joules${sp()}: $${texNombre(a)}\\times10^{16} \\times 365~\\text{J} = ${texNombre(a * 365)}\\times10^{16}~\\text{J}$<br>`
          texteCorr += `Conversion de l'énergie en $\\text{kWh}$${sp()}: $\\dfrac{${texNombre(a * 365)}\\times10^{16}}{3,6\\times10^6} = ${texNombre((a * 365) / 3.6)}\\times10^{10}~\\text{kWh}$<br>`
          texteCorr += `Conversion de l'énergie en $\\text{GWh}$${sp()}: $${texNombre((a * 365) / 3.6)}\\times10^{10}~\\text{kWh} = ${texNombre((a * 365) / 3.6)}\\times10^{10} \\times 10^{-6}~\\text{GWh} = ${miseEnEvidence(`${texNombre(mantisse)}\\times 10^{${texNombre(exposant)}`)}}~\\text{GWh}$`
          break
        }
      }

      if (this.questionJamaisPosee(i, a, b)) {
        // Si la question n'a jamais été posée, on en crée une autre
        handleAnswers(this, i, {
          reponse: {
            value: Number(reponseNumerique.toPrecision(12)),
          },
        })

        if (context.isAmc) {
          this.autoCorrectionAMC[i] = {
            enonce:
              texte +
              '<br>Indiquer votre raisonnement, vos calculs et votre réponse ci-dessous.',
            propositions: [{ statut: 3, sanscadre: false, texte: texteCorr }],
          }
          this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        }
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
