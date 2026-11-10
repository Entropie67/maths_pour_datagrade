import {
  addEchiquierProbleme,
  type EchiquierProblemeOptions,
} from '../../lib/customElements/EchiquierProblemeElement'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { prenomF, prenomM } from '../../lib/outils/Personne'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Construire l'échiquier d'un problème"
export const interactifReady = true
export const dateDePublication = '15/08/2026'

/**
 * Construire l'échiquier d'un problème à partir de son énoncé.
 * @author Jean-claude Lhote
 */
export const dateDeModifImportante = '02/11/2026'
export const uuid = 'b7f28'

export const refs = {
  'fr-fr': ['6N5-14'],
  'fr-2016': ['6C12-14'],
  'fr-ch': ['9R1NO7F-3', '9R2NO7F-3', '9R3NO7F-3', 'PRQST02C-3'],
}

type ProblemeEchiquier = EchiquierProblemeOptions & {
  enonce: string
  correction: string
}

const creerProblemes: (() => ProblemeEchiquier)[] = [
  () => {
    const fruit = choice(['pommes', 'oranges', 'bananes', 'poires'])
    const masse = randint(2, 8)
    const prixUnitaire = randint(2, 6)
    return {
      enonce: `Au marché, ${prenomF(1)} achète $${masse}\\text{ kg}$ ${fruit === 'oranges' ? "d'" : 'de'} ${fruit}. Les ${fruit} coûtent $${prixUnitaire}\\text{ €}$ le kg. Quel est le prix des ${fruit} ?`,
      expectedRows: ['prix unitaire', 'masse totale', 'prix total'],
      expectedColumns: [fruit],
      cells: [
        {
          row: 'prix unitaire',
          column: fruit,
          value: `${prixUnitaire} €/kg`,
        },
        { row: 'masse totale', column: fruit, value: `${masse} kg` },
        { row: 'prix total', column: fruit, value: '?' },
      ],
      rowChoices: [
        'prix unitaire',
        'masse totale',
        'prix total',
        'nombre de fruits',
        'durée',
      ],
      columnChoices: [
        fruit,
        choice(['pommes', 'oranges', 'bananes', 'poires'], fruit),
        'total',
        'cartable vide',
      ],
      expectedStructure: 'colonne',
      expectedOperation: 'multiplication',
      correction: `L'échiquier simplifié est en colonne : les données concernent les ${fruit} et sont exprimées avec des grandeurs différentes. L'unité du résultat est l'unité apparente de la grandeur «\u00a0unitaire\u00a0». On multiplie le prix unitaire par la masse totale pour obtenir le prix total.`,
    }
  },
  () => {
    const prixUnitaire = randint(2, 6)
    const nombre = randint(3, 9)
    const objet = choice(['cahiers', 'stylos', 'livres', 'classeurs'])
    const prixTotal = prixUnitaire * nombre
    return {
      enonce: `Un ${objet} coûte $${prixUnitaire}\\text{ €}$. ${prenomM(1)} paie $${prixTotal}\\text{ €}$ pour plusieurs ${objet} identiques. Combien de ${objet} a-t-il achetés ?`,
      expectedRows: ['prix unitaire', 'prix total', 'nombre de ' + objet],
      expectedColumns: [objet],
      cells: [
        {
          row: 'prix unitaire',
          column: objet,
          value: `${prixUnitaire} €/${objet.endsWith('s') ? objet.slice(0, -1) : objet}`,
        },
        { row: 'prix total', column: objet, value: `${prixTotal} €` },
        { row: 'nombre de ' + objet, column: objet, value: '?' },
      ],
      rowChoices: [
        'prix unitaire',
        'prix total',
        'nombre de ' + objet,
        'masse totale',
        'distance',
      ],
      columnChoices: [objet, 'cartable', 'trousse', 'sac à dos'],
      expectedStructure: 'colonne',
      expectedOperation: 'division',
      correction: `L'échiquier simplifié est en colonne : on cherche un nombre d'objets à partir d'un prix total et d'un prix unitaire. On divise le prix total par le prix unitaire.`,
    }
  },
  () => {
    const objet1 = choice(['livre', 'cahier', 'stylo', 'trousse'])
    const objet2 = choice(['trousse', 'cahier', 'stylo', 'livre'], objet1)
    const masseObjet1 = randint(250, 650)
    const masseObjet2 = randint(100, 300)
    return {
      enonce: `Dans son cartable, ${prenomF(1)} a un${objet1 === 'trousse' ? 'e' : ''} ${objet1} de $${masseObjet1}\\text{ g}$ et un${objet2 === 'trousse' ? 'e' : ''} ${objet2} de $${masseObjet2}\\text{ g}$. Quelle est la masse totale de ces deux objets ?`,
      expectedRows: ['masse'],
      expectedColumns: [objet1, objet2, 'total'],
      cells: [
        { row: 'masse', column: objet1, value: `${masseObjet1} g` },
        { row: 'masse', column: objet2, value: `${masseObjet2} g` },
        { row: 'masse', column: 'total', value: '?' },
      ],
      rowChoices: ['masse', 'prix', 'durée', 'distance'],
      columnChoices: [objet1, objet2, 'total', 'cartable vide', 'cahier'],
      expectedStructure: 'ligne',
      expectedOperation: 'addition',
      correction: `L'échiquier simplifié est en ligne : les données sont exprimées dans la même grandeur, la masse, pour plusieurs objets. Le mot «\u00a0total\u00a0» indique une addition.`,
    }
  },
  () => {
    const objet = choice(['bande dessinée', 'livre', 'cahier', 'stylo'])
    const sommeAvant = randint(20, 60)
    const sommeApres = randint(5, sommeAvant - 5)
    return {
      enonce: `${prenomM(1)} avait $${sommeAvant}\\text{ €}$ dans sa tirelire. Après avoir acheté ${objet === 'bande dessinée' ? 'une' : 'un'} ${objet}, il lui reste $${sommeApres}\\text{ €}$. Quel est le prix ${objet === 'bande dessinée' ? 'de la' : 'du'} ${objet} ?`,
      expectedRows: ['argent'],
      expectedColumns: ['somme avant achat', 'somme après achat', objet],
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
      ],
      rowChoices: ['argent', 'prix unitaire', 'masse', 'durée'],
      columnChoices: [
        'somme avant achat',
        'somme après achat',
        objet,
        choice(['livre', 'cahier', 'stylo', 'bande dessinée'], objet),
        'économies du frère',
      ],
      expectedStructure: 'ligne',
      expectedOperation: 'soustraction',
      correction:
        "L'échiquier simplifié est en ligne : les données portent sur une même grandeur, l'argent. Les mots «\u00a0avant\u00a0» et «\u00a0après\u00a0» conduisent à une soustraction.",
    }
  },
]

export default class ConstruireEchiquierProbleme extends Exercice {
  constructor() {
    super()
    // La réponse attendue est un tableau structurant les données du problème.
    this.reponseCourteDisponible = false
    this.nbQuestions = 1
    this.consigne =
      "Lire chaque énoncé, puis construire l'échiquier du problème en choisissant les grandeurs en ligne et les objets en colonne."
    this.spacing = 2
    this.spacingCorr = 2
    this.comment = `Cet exercice a été inspiré par le fascicule de l'IREM de Lorraine : <a style="text-decoration: underline; color: blue;" target="_blank" href="https://irem.univ-lorraine.fr/liste-des-brochures-editees-par-lirem-de-lorraine/#:~:text=La%20Lecture%20d%E2%80%99%C3%A9nonc%C3%A9s%20et%20le%20sens%20des%20op%C3%A9rations.">«\u00a0La lecture d'énoncés et le sens des opérations\u00a0»</a>.<br>
    L'autrice, Michèle Muniglia, y expose une méthode pour classer et résoudre les problèmes concrets.<br>
    Le terme d'<b>échiquier</b> employé ici est tiré de ce fascicule et symbolise la position des élèves participant à la mise en scène du problème (la méthode reposant sur une activité théatrale réelle).<br>
    On l'a conservé pour rester fidèle à l'autrice de la méthode.<br>
    La méthode, cet exercice, et les suivants poursuivent plusieurs objectifs :<br><br>
- <b>identifier les grandeurs</b>;<br>
Exemple : prix unitaire, masse, prix total, distance, durée, vitesse, nombre d’objets, etc.<br><br>
- <b>identifier les objets</b>;<br>
Exemple : pommes, oranges, cahiers, trajets, lots, élèves, boîtes, etc.<br><br>
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
      this.listeCorrections[i] =
        `${probleme.correction}<br>Organisation attendue : ${texteEnCouleurEtGras(probleme.expectedStructure === 'ligne' ? 'en ligne' : 'en colonne')}.<br>Opération attendue : ${texteEnCouleurEtGras(probleme.expectedOperation ?? '')}.<br>${echiquierCorr}`
    }
    listeQuestionsToContenu(this)
  }
}
