import {
  addEchiquierProbleme,
  type EchiquierProblemeOptions,
} from '../../lib/customElements/EchiquierProblemeElement'
import { texPrix } from '../../lib/format/style'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { prenomF, prenomM } from '../../lib/outils/Personne'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Simplifier l'échiquier d'un problème"
export const interactifReady = true
export const dateDePublication = '15/08/2026'

/**
 * Construire l'échiquier complet puis griser les données inutiles.
 * @author Jean-claude Lhote
 */
export const uuid = 'd91fc'

export const refs = {
  'fr-fr': ['6N5-15'],
  'fr-2016': ['6C12-15'],
  'fr-ch': ['9R1NO7F-4', '9R2NO7F-4', '9R3NO7F-4', 'PRQST02C-4'],
}

type ProblemeEchiquier = EchiquierProblemeOptions & {
  enonce: string
  correction: string
}

const creerProblemes: (() => ProblemeEchiquier)[] = [
  () => {
    const fruitUtile = choice(['bananes', 'pommes', 'poires', 'oranges'])
    const fruitInutile = choice(
      ['bananes', 'pommes', 'poires', 'oranges'],
      fruitUtile,
    )
    const masseUtile = randint(2, 8)
    const prixUnitaireUtile = randint(2, 6)
    const masseInutile = randint(2, 8)
    const prixUnitaireInutile = randint(2, 6)
    return {
      enonce: `Au marché, ${prenomF(1)} achète $${masseUtile}\\text{ kg}$ de ${fruitUtile} à $${prixUnitaireUtile}\\text{ €}$ le kg et $${masseInutile}\\text{ kg}$ de ${fruitInutile} à $${prixUnitaireInutile}\\text{ €}$ le kg. Quel est le prix des ${fruitUtile} ?`,
      expectedRows: ['prix unitaire', 'masse totale', 'prix total'],
      expectedColumns: [fruitUtile, fruitInutile],
      cells: [
        {
          row: 'prix unitaire',
          column: fruitUtile,
          value: `${prixUnitaireUtile} €/kg`,
        },
        {
          row: 'masse totale',
          column: fruitUtile,
          value: `${masseUtile} kg`,
        },
        { row: 'prix total', column: fruitUtile, value: '?' },
        {
          row: 'prix unitaire',
          column: fruitInutile,
          value: `${prixUnitaireInutile} €/kg`,
        },
        {
          row: 'masse totale',
          column: fruitInutile,
          value: `${masseInutile} kg`,
        },
        { row: 'prix total', column: fruitInutile, value: '?' },
      ],
      rowChoices: [
        'prix unitaire',
        'masse totale',
        'prix total',
        'nombre de fruits',
        'durée',
      ],
      columnChoices: [
        fruitUtile,
        fruitInutile,
        'courses',
        choice(
          ['bananes', 'pommes', 'poires', 'oranges'],
          [fruitUtile, fruitInutile],
        ),
      ],
      expectedGreyedRows: [],
      expectedGreyedColumns: [fruitInutile],
      expectedStructure: 'colonne',
      expectedOperation: 'multiplication',
      correction: `L'échiquier complet contient les ${fruitUtile} et les ${fruitInutile}. La question ne porte que sur les ${fruitUtile} : on grise donc la colonne des ${fruitInutile}. L'échiquier simplifié restant est en colonne.`,
    }
  },
  () => {
    const objetUtile = choice(['cahiers', 'stylos', 'livres', 'classeurs'])
    const objetInutile = choice(
      ['cahiers', 'stylos', 'livres', 'classeurs'],
      objetUtile,
    )
    const prixUnitaireUtile = randint(2, 6)
    const nombreUtile = randint(3, 9)
    const prixTotalUtile = prixUnitaireUtile * nombreUtile
    const prixUnitaireInutile = randint(2, 6)
    const nombreInutile = randint(2, 8)
    const prixTotalInutile = prixUnitaireInutile * nombreInutile
    return {
      enonce: `${prenomM(1)} paie $${prixTotalUtile}$ € pour des ${objetUtile} coûtant $${prixUnitaireUtile}$ € chacun. Il achète aussi des ${objetInutile} coûtant $${prixUnitaireInutile}$ € chacun pour un total de $${prixTotalInutile}$ €. Combien de ${objetUtile} a-t-il achetés ?`,
      expectedRows: ['prix unitaire', 'prix total', 'nombre total'],
      expectedColumns: [objetUtile, objetInutile],
      cells: [
        {
          row: 'prix unitaire',
          column: objetUtile,
          value: `${prixUnitaireUtile} €/${objetUtile}`,
        },
        { row: 'prix total', column: objetUtile, value: `${prixTotalUtile} €` },
        { row: 'nombre total', column: objetUtile, value: '?' },
        {
          row: 'prix unitaire',
          column: objetInutile,
          value: `${prixUnitaireInutile} €/${objetInutile}`,
        },
        {
          row: 'prix total',
          column: objetInutile,
          value: `${prixTotalInutile} €`,
        },
        { row: 'nombre total', column: objetInutile, value: '?' },
      ],
      rowChoices: [
        'prix unitaire',
        'prix total',
        'nombre total',
        `nombre de ${objetUtile}`,
        `nombre de ${objetInutile}`,
        'masse totale',
        'distance',
      ],
      columnChoices: [objetUtile, objetInutile, 'cartable', 'courses'],
      expectedGreyedRows: [],
      expectedGreyedColumns: [objetInutile],
      expectedStructure: 'colonne',
      expectedOperation: 'division',
      correction: `L'échiquier complet contient les ${objetUtile} et les ${objetInutile}. Pour répondre, on ne garde que la colonne des ${objetUtile} et on grise aussi la ligne propre au nombre de ${objetInutile}.`,
    }
  },
  () => {
    const objet1 = choice(['livre', 'cahier', 'classeur'])
    const objet2 = choice(['trousse', 'gourde', 'boîte', 'calculatrice'])
    const objetInutile = choice(['ballon', 'manteau', 'sac'])
    const masse1 = randint(250, 650)
    const masse2 = randint(100, 350)
    const masseInutile = randint(150, 700)
    return {
      enonce: `Dans son cartable, ${prenomF(1)} a un ${objet1} de $${masse1}$ g, une ${objet2} de $${masse2}$ g et un ${objetInutile} de $${masseInutile}$ g. Quelle est la masse totale du ${objet1} et de la ${objet2} ?`,
      expectedRows: ['masse'],
      expectedColumns: [objet1, objet2, objetInutile, 'total'],
      cells: [
        { row: 'masse', column: objet1, value: `${masse1} g` },
        { row: 'masse', column: objet2, value: `${masse2} g` },
        { row: 'masse', column: objetInutile, value: `${masseInutile} g` },
        { row: 'masse', column: 'total', value: '?' },
      ],
      rowChoices: ['masse', 'prix', 'durée', 'distance'],
      columnChoices: [objet1, objet2, objetInutile, 'total', 'cartable vide'],
      expectedGreyedRows: [],
      expectedGreyedColumns: [objetInutile],
      expectedStructure: 'ligne',
      expectedOperation: 'addition',
      correction: `L'échiquier complet contient trois objets, mais la question ne demande que la masse totale du ${objet1} et de la ${objet2}. On grise la colonne du ${objetInutile}.`,
    }
  },
  () => {
    const objet = choice(['bande dessinée', 'livre', 'cahier', 'stylo'])
    const sommeAvant = randint(20, 60)
    const sommeApres = randint(5, sommeAvant - 5)
    const masseSac = randint(2, 8)
    return {
      enonce: `${prenomM(1)} avait $${sommeAvant}$ € dans sa tirelire. Après avoir acheté ${objet === 'bande dessinée' ? 'une' : 'un'} ${objet}, il lui reste $${sommeApres}$ €. Son sac pèse aussi $${masseSac}$ kg. Quel est le prix ${objet === 'bande dessinée' ? 'de la' : 'du'} ${objet} ?`,
      expectedRows: ['argent', 'masse'],
      expectedColumns: ['somme avant achat', 'somme après achat', objet, 'sac'],
      cells: [
        {
          row: 'argent',
          column: 'somme avant achat',
          value: `${sommeAvant} €`,
        },
        {
          row: 'argent',
          column: 'somme après achat',
          value: `${sommeApres} €`,
        },
        { row: 'argent', column: objet, value: '?' },
        { row: 'masse', column: 'sac', value: `${masseSac} kg` },
      ],
      rowChoices: ['argent', 'masse', 'prix unitaire', 'durée'],
      columnChoices: [
        'somme avant achat',
        'somme après achat',
        objet,
        'sac',
        'économies du frère',
      ],
      expectedGreyedRows: ['masse'],
      expectedGreyedColumns: ['sac'],
      expectedStructure: 'ligne',
      expectedOperation: 'soustraction',
      correction:
        "L'échiquier complet contient une donnée de masse, mais la question porte seulement sur l'argent. On grise donc la ligne de masse et la colonne du sac.",
    }
  },
  () => {
    const objet = choice(['le romarin', 'le thym', 'la verveine'])
    const quidam = choice([
      [prenomM(1), 'le'],
      [prenomF(1), 'la'],
    ])
    const masse1 = randint(15, 25)
    const pu1 = randint(2, 5) / 100
    const quantite2 = randint(2, 5)
    const masse2 = (randint(20, 40) / 10) * quantite2
    return {
      enonce: `${quidam[0]} a la grippe. Pour ${quidam[1]} soulager, sa grand-mère lui fait une infusion. Pour cela, elle mélange $${masse1}$ grammes de ${objet.split(' ')[1]} qui coûte $${texPrix(pu1)}$ € le gramme avec $${quantite2}$ feuilles de menthe de son jardin pesant $${texNombre(masse2, 1)}$
grammes. Quel est le prix ${objet.startsWith('le') ? 'du' : 'de la'} ${objet.split(' ')[1]} ?`,
      expectedRows: ['prix (total)', 'prix unitaire', 'masse totale'],
      expectedColumns: [objet, 'menthe', 'infusion'],
      cells: [
        {
          row: 'prix unitaire',
          column: objet,
          value: `${texPrix(pu1 * masse1)} €/g`,
        },
        {
          row: 'masse totale',
          column: objet,
          value: `${masse1} g`,
        },
        {
          row: 'masse totale',
          column: 'menthe',
          value: `${texNombre(masse2, 1)} g`,
        },
        { row: 'prix (total)', column: objet, value: '?' },
      ],
      rowChoices: [
        'argent',
        'prix unitaire',
        'prix (total)',
        'masse totale',
        'nombre',
        'durée',
      ],
      columnChoices: [
        objet,
        'infusion',
        objet,
        choice(['le romarin', 'le thym', 'la verveine'], objet),
        'menthe',
      ],
      expectedGreyedRows: [],
      expectedGreyedColumns: ['menthe', 'infusion'],
      expectedStructure: 'colonne',
      expectedOperation: 'multiplication',
      correction: `L'échiquier simplifié est en colonne : les données portent sur un même objet, ${objet}. Les données comprennent le prix unitaire et la quantité : on multiplie l'un et l'autre pour obtenir le prix total.`,
    }
  },
]

export default class SimplifierEchiquierProbleme extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.reponseCourteDisponible = false // La réponse est un échiquier à construire et à simplifier.
    this.consigne =
      "Construire l'échiquier complet du problème, puis griser les lignes ou les colonnes inutiles pour obtenir l'échiquier simplifié."
    this.spacing = 2
    this.spacingCorr = 2
    this.comment = `Cet exercice a été inspiré par le fascicule de l'IREM de Lorraine : <a style="text-decoration: underline; color: blue;" target="_blank" href="https://irem.univ-lorraine.fr/liste-des-brochures-editees-par-lirem-de-lorraine/#:~:text=La%20Lecture%20d%E2%80%99%C3%A9nonc%C3%A9s%20et%20le%20sens%20des%20op%C3%A9rations.">"La lecture d'énoncés et le sens des opérations"</a>.<br>
    L'autrice, Michèle Muniglia, y expose une méthode pour classer et résoudre les problèmes concrets.<br>
    Le terme d'<b>échiquier</b> employé ici est tiré de ce fascicule et symbolise la position des élèves participant à la mise en scène du problème (la méthode reposant sur une activité théatrale réelle).<br>
    On l'a conservé pour rester fidèle à l'autrice de la méthode.<br>
    La méthode et cet exercice poursuivent plusieurs objectifs :<br><br>
- <b>identifier les grandeurs</b>;<br>
Exemple : prix unitaire, masse, prix total, distance, durée, vitesse, nombre d’objets, etc.<br><br>
- <b>identifier les objets</b>;<br>
Exemple : pommes, oranges, cahiers, trajets, lots, élèves, boîtes, etc.<br><br>
- <b>comprendre quelles données sont utiles et les relations qui les lient</b>;<br>
- <b>comprendre la structure opératoire</b>.<br>
Une fois l’échiquier construit, on peut faire apparaître que :<br>
- une relation sur une même ligne renvoie plutôt à une structure additive ;<br>
- une relation sur une même colonne renvoie plutôt à une structure multiplicative ;<br>
- les unités aident fortement à contrôler la cohérence des cases.`
  }

  nouvelleVersion() {
    const listeProblemes = combinaisonListes(
      creerProblemes,
      this.nbQuestions,
    ).map((creerProbleme) => creerProbleme())
    for (let i = 0; i < this.nbQuestions; i++) {
      const probleme = listeProblemes[i]
      const echiquier = addEchiquierProbleme(this, i, {
        ...probleme,
        cellFillMode: 'student',
        simplificationMode: 'grey',
      })
      const echiquierCorr = addEchiquierProbleme(this, i, {
        ...probleme,
        id: `echiquier-corr-${this.numeroExercice}-Q${i}`,
        cellFillMode: 'correction',
        interactivityOn: false,
      })
      handleAnswers(
        this,
        i,
        { reponse: { value: JSON.stringify(probleme) } },
        { formatInteractif: 'echiquier-probleme' },
      )
      this.listeQuestions[i] = `${probleme.enonce}<br>${echiquier}`
      this.listeCorrections[i] = `${probleme.correction}<br>${echiquierCorr}`
    }
    listeQuestionsToContenu(this)
  }
}
