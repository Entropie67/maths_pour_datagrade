import { amcConvert } from '../../lib/amc/amcBuilders'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Résoudre des problèmes avec des puissances de 10 et des conversions'
export const amcReady = true
export const amcType = 'AMCOpen'

/**
 * Problèmes avec des multiplications ou des divisions avec des puissances de 10 et des conversions
 * @author Rémi Angot
 * 20/09/2025 : Cet exo a été refactorisé et amélioré dans le nouveau 4C32-3
 */
export const uuid = '051c7'

export const refs = {
  'fr-fr': [''],
  'fr-ch': ['NR'],
}
export default class ProblemesPuissancesDe10EtConversions extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 4

    this.spacingCorr = context.isHtml ? 2 : 1
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = [
      'info',
      'info2',
      'electricite',
      'lumiere',
    ]
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posés mais l'ordre diffère à chaque "cycle"
    for (
      let i = 0, texte, texteCorr, a, a1, b, b1, c, c1, u, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // Boucle principale où i+1 correspond au numéro de la question
      switch (
        listeTypeDeQuestions[i] // Suivant le type de question, le contenu sera différent
      ) {
        case 'info':
          a = randint(3, 7)
          a1 = randint(3, 7, a) * 100
          a *= 100
          b = randint(11, 40)
          b1 = choice([650, 700, 750])
          c = randint(3, 20)
          c1 = randint(11, 49) / 10
          texte = `Sur mon disque dur, j'ai ${a} photos de ${a1} ko, ${b} films de ${b1} Mo et ${c} films HD de $${texNombre(c1)}$ Go.<br>`
          texte +=
            'Combien de place vont occuper tous ces fichiers ? Donner le résultat en mega-octets ou en giga-octets.'
          texteCorr = `Taille des photos : $${a}\\times${a1}~\\text{ko}=${texNombre(a * a1)}~\\text{ko}=${texNombre((a * a1) / 1000)}~\\text{Mo}$<br>`
          texteCorr += `Taille des films : $${b}\\times${b1}~\\text{Mo}=${texNombre(b * b1)}~\\text{Mo}$<br>`
          texteCorr += `Taille des films HD : $${c}\\times${texNombre(c1)}~\\text{Go}=${texNombre(c * c1)}~\\text{Go}=${texNombre(c * c1 * 1000)}~\\text{Mo}$<br>`
          texteCorr += `Taille totale : $${texNombre((a * a1) / 1000)}~\\text{Mo}+${texNombre(b * b1)}~\\text{Mo}+${texNombre(c * c1 * 1000)}~\\text{Mo}=${texNombre((a * a1) / 1000 + b * b1 + c * c1 * 1000)}~\\text{Mo}=${texNombre(((a * a1) / 1000 + b * b1 + c * c1 * 1000) / 1000)}~\\text{Go}$`
          break
        case 'info2':
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
        case 'electricite':
          a = choice([30, 35, 40, 45])
          b = randint(11, 49, [20, 30, 40]) / 10
          texte = `On estime qu'un foyer consomme ${a} kWh par jour. Si une centrale électrique produit $${texNombre(b)}$ TWh par an, combien de foyers pourra-t-elle alimenter ? Arrondir à l'unité.<br>`
          texteCorr = `Consommation annuelle d'un foyer français : $365\\times${texNombre(a)}~\\text{kWh} = ${texNombre(a * 365)}~\\text{kWh}$<br>`
          texteCorr += `Nombre de foyers pouvant être alimentés par cette centrale : $\\dfrac{${texNombre(b)}~\\text{TWh}}{${texNombre(a * 365)}~\\text{kWh}}=\\dfrac{${texNombre(b)}\\times10^{12}~\\text{Wh}}{${texNombre(a * 365)}\\times10^3~\\text{Wh}}\\approx${texNombre((b * 10 ** 12) / (a * 365 * 10 ** 3), 0)}$`
          break
        case 'lumiere':
        default:
          a = randint(2, 22)
          u = choice(['j', 'h'])
          texte = `On admet que la vitesse de la lumière dans le vide est de $3\\times10^8~\\text{m/s}$. Quelle est la distance parcourue par la lumière en ${a} `
          if (u === 'j') {
            texte += 'jours ? Donner le résultat en kilomètres.'
            texteCorr =
              'Dans une journée, il y a $24$ heures et dans chaque heure $3~600$ secondes, la distance parcourue est donc : <br>'
            texteCorr += `$${a}\\times24\\times3~600~\\text{s}\\times3\\times10^8~\\text{m/s}=${texNombre(a * 24 * 3600 * 3)}\\times10^8\\text{ m}=${texNombre((a * 24 * 3600 * 3) / 1000)}\\times10^8\\text{ km}$`
          } else {
            texte += 'heures ? Donner le résultat en kilomètres.<br>'
            texteCorr =
              'Dans une heure, il y a $3~600$ secondes, la distance parcourue est donc : <br>'
            texteCorr += `$${a}\\times3~600~\\text{s}\\times3\\times10^8~\\text{m/s}=${texNombre(a * 3600 * 3)}\\times10^8\\text{ m}=${texNombre((a * 3600 * 3) / 1000)}\\times10^8\\text{ km}$`
          }
          break
      }
      if (context.isAmc) {
        this.autoCorrectionAMC[i] = {
          enonce:
            texte +
            '<br>Indiquer votre raisonnement, vos calculs et votre réponse ci-dessous.',
          propositions: [{ statut: 3, sanscadre: false, texte: texteCorr }],
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      }

      if (this.questionJamaisPosee(i, texte)) {
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
