import Decimal from 'decimal.js'
import { bleuMathalea } from '../../lib/colors'
import { texPrix } from '../../lib/format/style'
import { propositionsQcm } from '../../lib/interactif/qcm'
import {
  combinaisonListes,
  compteOccurences,
} from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { range } from '../../lib/outils/nombres'
import { deDevant, sp } from '../../lib/outils/outilString'
import { prenomF, prenomM } from '../../lib/outils/Personne'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Reconnaître une situation de proportionnalité'
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const dateDeModifImportante = '16/04/2024'
/**
 * Exercice sur la notion de proportionnalité (ou pas)
 * @author Jean-claude Lhote
 */
export const uuid = '850d5'

export const refs = {
  'fr-fr': ['6P3B-1', 'BP2AutoL4', '3AutoP01-1'],
  'fr-2016': ['6P10', 'BP2AutoL4'],
  'fr-ch': ['9R1FA1A-3', '9R2FA1A-3', '9R3FA1A-3', 'PRQPF03A-5'],
}
export default class ProportionnalitePasProportionnalite extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Type de questions',
      'Nombres séparés par des tirets :\n1 : Achat\n2 : Distance\n3 : Âge\n4 : Épidémie\n5 : Catalogue (tableau de proportionnalité)\n6 : Mélange',
    ]
    this.besoinFormulaire2CaseACocher = ['Ajout de « je ne sais pas »']

    this.spacing = context.isHtml ? 2 : 1.4
    this.spacingCorr = context.isHtml ? 1.5 : 1
    this.nbQuestions = 5

    this.nbColsModifiable = false
    this.nbColsCorrModifiable = false
    this.sup = 6
    this.sup2 = true
  }

  nouvelleVersion() {
    let bonneReponse

    this.consigne = this.interactif
      ? 'Cocher la bonne réponse.'
      : this.nbQuestions > 1
        ? 'Répondre aux questions posées en justifiant.'
        : 'Répondre à la question posée en justifiant.'
    const listeIndexDisponibles = [0, 1, 2, 3, 4]
    const listeIndex = combinaisonListes(
      listeIndexDisponibles,
      this.nbQuestions,
    )

    const listeChoix = gestionnaireFormulaireTexte({
      max: 5,
      defaut: 6,
      melange: 6,
      nbQuestions: this.nbQuestions,
      saisie: this.sup,
    })

    const nombre =
      compteOccurences(listeChoix, '1') + compteOccurences(listeChoix, '5')
    const listeProportionnelOuPas = combinaisonListes([true, false], nombre)
    const listeDeLieux = [
      'dans un magasin de bricolage',
      'dans une animalerie',
      'au supermarché local',
      "à l'épicerie",
      'dans la boutique du musée',
    ]
    const listeDeChoses: string[][] = [[]]
    const listeDePrixUnit: number[][] = [[]]
    const tirages: [number, Decimal][] = []
    let index3 = []
    const villes = [
      'Moscou',
      'Berlin',
      'Paris',
      'Bruxelles',
      'Rome',
      'Belgrade',
    ]
    const verbes = [
      'double',
      'triple',
      'quadruple',
      'est multiplié par $5$',
      'est multiplié par $6$',
    ]
    listeDeChoses[0] = [
      'articles',
      'outils',
      'accessoires',
      "pièces d'outillage",
      'pinceaux',
      'ampoules',
      'tournevis',
      'spatules',
      'raccords de tuyaux',
    ]
    listeDeChoses[1] = [
      'poissons rouges',
      'canetons',
      'perruches',
      'phasmes',
      'colliers anti-puces',
      'souris',
      'lapereaux',
      'paquets de graines',
    ]
    listeDeChoses[2] = [
      'sets de tables',
      'verres',
      'assiettes',
      'os à macher',
      'dosettes de café',
      'packs de lait',
      'paquets de pâtes',
    ]
    listeDeChoses[3] = [
      'mangues',
      'ananas',
      'fruits de la passion',
      'melons',
      'paquets de madeleines de Commercy',
      'bergamottes',
      'bredeles',
      'pots de cancoillotte',
    ]
    listeDeChoses[4] = [
      'cartes',
      'livres',
      'gravures',
      'puzzles',
      'maquettes',
      'roches',
      'jeux de société',
    ]
    listeDePrixUnit[0] = [5, 4, 1.25, 3, 0.5, 1.5, 2, 6, 4.5]
    listeDePrixUnit[1] = [1.5, 7, 20, 2.5, 25, 2, 15, 8]
    listeDePrixUnit[2] = [1.25, 1.5, 2, 0.5, 5, 4.5, 3]
    listeDePrixUnit[3] = [2, 2.5, 1.25, 1.5, 4, 7, 12, 3]
    listeDePrixUnit[4] = [0.5, 5, 7, 13.5, 10, 15, 20]

    for (
      let i = 0,
        x,
        y,
        z,
        pu,
        n,
        p,
        somme,
        prenoms,
        index1,
        index2,
        objet,
        met,
        compteurProportionnelsOuPas = 0,
        texte,
        texteCorr,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      x = 0
      y = 0
      p = 0
      z = 0
      pu = 0
      switch (listeChoix[i]) {
        case 1: // Achat
          if (listeProportionnelOuPas[compteurProportionnelsOuPas]) {
            index1 = listeIndex[i]
            prenoms = [prenomF(), prenomM()]
            index2 = randint(0, listeDeChoses[index1].length - 1)
            objet = listeDeChoses[index1][index2]
            pu = new Decimal(
              listeDePrixUnit[index1][index2] *
                (1 + randint(1, 2) * 0.2 * randint(-1, 1)),
            ).toDP(2)
            y = randint(2, 5)
            somme = pu.mul(y)
            p = y * randint(2, 5)
            z = pu.mul(p)
            texte = `${prenoms[0]} achète ${listeDeLieux[index1]} des ${objet}.<br>`
            texte += `Elle repart avec $${y}$ ${objet} pour $${texPrix(somme)}$${sp()}€.<br> ${prenoms[1]} achète quant à lui, au même endroit $${p}$ ${objet} pour $${texPrix(z)}$${sp()}€.<br>`
            texte += `Le prix des ${objet} est-il proportionnel à la quantité achetée ?<br>`
            texteCorr = `${prenoms[0]} dépense $${miseEnEvidence(texPrix(somme), bleuMathalea)}$${sp()}€.<br>`
            texteCorr += `${prenoms[1]} a acheté $${miseEnEvidence(Math.round(p / y))}$ fois la quantité des ${objet} achetée par ${prenoms[0]} pour $${miseEnEvidence(texPrix(somme), bleuMathalea)}$${sp()}€.<br>`
            texteCorr += `Il a payé $${texPrix(z)}$${sp()}€ $=${miseEnEvidence(Math.round(p / y))}\\times${miseEnEvidence(texPrix(somme), bleuMathalea)}$${sp()}€.<br>`
            texteCorr += `À l'aide de ces données, on constate que le prix des ${objet} et leur quantité sont tous les deux multipliés par le même nombre, donc ces deux grandeurs ${texteEnCouleurEtGras('sont proportionnelles')}.<br>
            ${this.interactif ? `La bonne réponse est ${texteEnCouleurEtGras('Oui')}` : ''}`
            bonneReponse = 'Oui'
          } else {
            index1 = listeIndex[i]
            prenoms = [prenomF(), prenomM()]
            index2 = randint(0, listeDeChoses[index1].length - 1)
            objet = listeDeChoses[index1][index2]
            pu = new Decimal(
              listeDePrixUnit[index1][index2] *
                (1 + randint(1, 2) * 0.2 * randint(-1, 1)),
            ).toDP(2)
            y = randint(2, 5)
            somme = pu.mul(y)
            p = y * randint(2, 5)
            z = pu.sub(0.1).mul(p).toDP(2)
            texte = `${prenoms[0]} achète ${listeDeLieux[index1]} des ${objet}. `
            texte += `Elle a obtenu $${y}$ ${objet} pour $${texPrix(somme)}$${sp()}€. ${prenoms[1]} achète quant à lui, au même endroit $${p}$${sp()}${objet} pour $${texPrix(z)}$${sp()}€.<br>`
            texte += `Le prix des ${objet} est-il proportionnel à la quantité achetée ?<br>`
            texteCorr = `${prenoms[0]} dépense $${miseEnEvidence(texPrix(somme), bleuMathalea)}$${sp()}${sp()}€.<br>`
            texteCorr += `${prenoms[1]} a acheté $${miseEnEvidence(Math.round(p / y))}$ fois la quantité des ${objet} achetée par ${prenoms[0]} pour $${miseEnEvidence(texPrix(somme), bleuMathalea)}$${sp()}€.<br>`
            texteCorr += `Il a payé $${texPrix(z)}$${sp()}€.<br>Mais $${miseEnEvidence(Math.round(p / y))}\\times${miseEnEvidence(texPrix(somme), bleuMathalea)}$${sp()}€ $=${texPrix(somme.mul(p).div(y))}$${sp()}€.<br>`
            texteCorr += `À l'aide de ces données, on constate que le prix unitaire des ${objet} n'est pas le même pour ${prenoms[0]} qui en a acheté $${y}$ que pour ${prenoms[1]} qui en a acheté $${p}$, donc ces deux grandeurs ${texteEnCouleurEtGras('ne sont pas proportionnelles')}.<br>
            ${this.interactif ? `La bonne réponse est ${texteEnCouleurEtGras('Non')}` : ''}`
            bonneReponse = 'Non'
          }
          compteurProportionnelsOuPas += 1
          break
        case 2: // Distance
          prenoms = [prenomF(), prenomM()]
          x = randint(5, 20)
          y = randint(5, 20, x) * 100
          x = x * 100
          n = Math.round((x * (1 + randint(0, 2) * 0.2)) / 60)
          p = Math.round((y * (1 + randint(0, 2) * 0.2)) / 60)
          index1 = new Decimal(x).div(n) // vitesse fille
          index2 = new Decimal(y).div(p) // vitesse garçon

          texte = `${prenoms[0]} habite à $${texNombre(x, 0)}\\text{ m}$ du collège. Elle met $${n}$ minutes pour s'y rendre depuis chez elle.<br>`
          texte += `${prenoms[1]}, lui, habite à $${texNombre(y, 0)}\\text{ m}$ du collège. Il met $${p}$ minutes pour s'y rendre depuis chez lui.<br>`
          texte +=
            'Les durées de trajet pour venir au collège sont-elles proportionnelles aux distances parcourues ?<br>'
          texteCorr = `${prenoms[0]} parcourt $${texNombre(x)}\\text{ m}$ en $${n}$ minutes soit environ $\\dfrac{${texNombre(x)}\\text{ m}}{${n}\\text{ min}} ${index1.eq(index1.toDP(1)) ? '=' : '\\approx'} ${texNombre(index1.toDP(1), 1)}\\text{ m}/_{\\text{ min}}$`
          texteCorr += ` et ${prenoms[1]} parcourt $${texNombre(y)}\\text{ m}$ en $${p}$ minutes soit environ $\\dfrac{${texNombre(y)}\\text{ m}}{${p}\\text{ min}} ${index2.eq(index2.toDP(1)) ? '=' : '\\approx'} ${texNombre(index2.toDP(1))}\\text{ m}/_{\\text{ min}}$.<br>`
          if (index1.eq(index2)) {
            texteCorr += `Pour ces deux élèves, le temps mis et la distance parcourue ${texteEnCouleurEtGras('sont proportionnelles')} (si l'on compare leur vitesse moyenne).<br>
              ${this.interactif ? `La bonne réponse est ${texteEnCouleurEtGras('Oui')}` : ''}`
            bonneReponse = 'Oui'
          } else {
            texteCorr += `La distance parcourue en une minute (vitesse moyenne) n'est pas la même dans ces deux situations, donc les durées de trajet ${texteEnCouleurEtGras('ne sont pas proportionnelles')} aux distances parcourues.<br>
              ${this.interactif ? `La bonne réponse est ${texteEnCouleurEtGras('Non')}` : ''}`
            bonneReponse = 'Non'
          }
          break
        case 3: // Âge
          prenoms = [prenomF(), prenomM()]
          x = randint(5, 20)
          y = x + randint(25, 35)
          texte = `${prenoms[0]} vient d'avoir $${x}$ ans cette année. Son père ${prenoms[1]} vient de fêter son ${y}ème anniversaire.<br>`
          texte += `L'âge de son père est-il proportionnel à l'âge ${deDevant(prenoms[0])} ?<br>`
          texteCorr = `Aujourd'hui, la différence d'âge entre ${
            prenoms[0]
          } et ${prenoms[1]} est de $${y - x}$ ans.<br>`
          texteCorr += `${prenoms[0]} a $${x}$ ans aujourd'hui. Dans $${x}$ années, ${prenoms[0]} aura $${
            2 * x
          }$ ans ($${x}+${x}$), c'est-à-dire le double d'aujourd'hui.<br>`
          texteCorr += `Son père ${prenoms[1]} qui a actuellement $${y}$ ans aura $${x + y}$ ans cette année-là ($${y}+${x}$).<br>`
          texteCorr += `Quand l'âge ${deDevant(prenoms[0])} double, l'âge ${deDevant(prenoms[1])} ne double pas, donc l'âge ${deDevant(prenoms[0])} et l'âge de son père ${texteEnCouleurEtGras('ne sont pas proportionnels')}.<br>`
          texteCorr += `Dans $${x}$ années, la différence d'âge restera la même : $${x + y}-${2 * x}=${y - x}$.<br>
          ${this.interactif ? `La bonne réponse est ${texteEnCouleurEtGras('Non')}` : ''}`
          bonneReponse = 'Non'
          break
        case 4: // Épidémie
          index1 = randint(0, 5)
          index2 = randint(0, 4)
          texte = `Une épidémie se répand dans la ville de ${villes[index1]}. `
          texte += `Le nombre de malades ${verbes[index2]} tous les $${
            index2 + 2
          }$ jours.<br>`
          texte += 'Le nombre de malades est-il proportionnel au nombre de '
          texte += "jours passés depuis le début de l'épidémie ?<br>"
          texteCorr = `Admettons qu'il y ait $10$ malades le 1er jour. Le ${1 + 2 + index2}e jour il y aura $10 \\times ${index2 + 2} = ${10 * (index2 + 2)}$ malades.<br>`
          texteCorr += `Entre le 1er jour et le ${3 + index2}e jour, le nombre de malades est multiplié par $${index2 + 2}$ mais le nombre de jours est multiplié par $${3 + index2}$.<br>`
          texteCorr += `Donc le nombre de malades ${texteEnCouleurEtGras("n'est pas proportionnel")} au nombre de jours passés.<br>
          ${this.interactif ? `La bonne réponse est ${texteEnCouleurEtGras('Non')}` : ''}`
          bonneReponse = 'Non'
          break
        case 5: // Achat (tableau de proportionnalité)
        default:
          prenoms = [prenomF(), prenomM()]
          index1 = randint(0, 5)
          objet = listeDeChoses[4][index1]
          index2 = randint(0, 4)
          pu = new Decimal(
            listeDePrixUnit[4][index1] *
              (1 + randint(1, 2) * 0.2 * randint(-1, 1)),
          ).toDP(2)
          n = randint(2, 6)
          p = randint(0, 3)
          tirages[0] = [n, pu.mul(n)]
          tirages[1] = [n + 1, pu.mul(n + 1)]
          tirages[2] = [2 * n + 1, pu.mul(2 * n + 1)]
          tirages[3] = [3 * n + 3, pu.mul(3 * n + 3)]
          met = listeProportionnelOuPas[compteurProportionnelsOuPas]
          compteurProportionnelsOuPas += 1
          if (!met) tirages[p][1] = tirages[p][1].sub(1)
          texte = `${prenoms[1]} relève les prix des ${objet} sur un catalogue par correspondance en fonction de la quantité saisie dans le panier. `
          texte += 'Il note les prix dans le tableau suivant :<br> <br>'
          texte += '$\\def\\arraystretch{1.5}\\begin{array}{|c' // construction du tableau des effectifs en un seul morceau
          for (let j = 0; j <= tirages.length; j++) texte += '|c'
          texte += `|}\\hline \\text{${objet}}`
          for (let j = 0; j < tirages.length; j++) texte += `&${tirages[j][0]}`
          texte += '\\\\\\hline \\text{Prix (en €})'
          for (let j = 0; j < tirages.length; j++) {
            texte += `&${texPrix(tirages[j][1])}`
          }
          texte += '\\\\\\hline\\end{array}$<br> <br>'
          texte += `Le prix des ${objet} est-il proportionnel à la quantité achetée ?<br>`
          texteCorr = `On peut calculer le prix unitaire des ${objet} dans chaque cas de figure :<br><br>`
          if (met) index3 = range(3)
          else index3 = range(3, [p])
          texteCorr += '$'
          for (let j = 0; j < index3.length; j++) {
            texteCorr += `\\dfrac{${texPrix(tirages[index3[j]][1])}\\text{ ${sp()}€}}{${tirages[index3[j]][0]}\\text{ ${objet}}}=`
          }
          texteCorr += `${texPrix(pu)}\\text{ ${sp()}€}/_{\\text{${objet.substring(0, objet.length - 1)}}}$<br><br>`
          if (!met) {
            texteCorr += `Mais $\\dfrac{${texPrix(tirages[p][1])}\\text{ ${sp()}€}}{${tirages[p][0]}\\text{ ${objet}}}
            =${texPrix(tirages[p][1].div(tirages[p][0]).toDP(2))}\\text{ ${sp()}€}/_{\\text{${objet.substring(0, objet.length - 1)}}}$.<br>`
            texteCorr += `Le prix des ${objet} ${texteEnCouleurEtGras("n'est pas proportionnel")} à leur nombre.<br>
            ${this.interactif ? `La bonne réponse est ${texteEnCouleurEtGras('Non')}` : ''}`
            bonneReponse = 'Non'
          } else {
            texteCorr += `Le prix des ${objet} ${texteEnCouleurEtGras('est bien proportionnel')} à leur nombre.<br>
            ${this.interactif ? `La bonne réponse est ${texteEnCouleurEtGras('Oui')}` : ''}`
            bonneReponse = 'Oui'
          }
          break
      }
      if (this.questionJamaisPosee(i, x, y, p, z, pu, listeChoix[i])) {
        if (this.interactif || context.isAmc) {
          this.autoCorrection[i] = {}
          this.autoCorrection[i].options = { ordered: true }
          this.autoCorrection[i].enonce = `${texte}\n`
          this.autoCorrection[i].propositions = [
            {
              texte: 'Oui',
              statut: bonneReponse !== 'Non',
            },
            {
              texte: 'Non',
              statut: bonneReponse !== 'Oui',
            },
          ]
          if (this.sup2) {
            this.autoCorrection[i].propositions!.push({
              texte: 'Je ne sais pas',
              statut: false,
            })
          }
          this.autoCorrection[i]!.options!.radio = true
          const props = propositionsQcm(this, i)

          if (this.interactif) {
            texte += props.texte
            texteCorr += props.texteCorr
          }
        }
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this) // Espacement de 2 em entre chaque questions.
  }
}
