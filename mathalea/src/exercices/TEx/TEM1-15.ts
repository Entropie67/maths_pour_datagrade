import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { matriceCompare } from '../../lib/interactif/comparaisonMatrices'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  choice,
  combinaisonListes,
  shuffle,
} from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { numAlpha } from '../../lib/outils/outilString'
import { prenom } from '../../lib/outils/Personne'
import { texNombre, texPrix } from '../../lib/outils/texNombre'
import type { IExercice } from '../../lib/types'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Calculer et interpréter un produit de matrices'
export const interactifReady = true
export const interactifType = 'mathLive'
export const dateDePublication = '08/10/2026'

/**
 * Dans une situation décrite par un tableau à double entrée (achats,
 * championnat, recettes, bulletin de notes), écrire la matrice Q des quantités
 * et la matrice colonne P des valeurs unitaires, puis calculer et interpréter QP.
 *
 * @author Arnaud Meistermann
 */
export const uuid = '32fa9'

export const refs = {
  'fr-fr': ['TEM1-15'],
  'fr-ch': [],
}

/**
 * Valeurs unitaires (prix, points, coefficients) en centièmes, pour calculer de
 * manière exacte. `quantites` remplace, pour cet objet, l'intervalle du contexte.
 * Un objet `toujours` figure dans toutes les questions de son contexte.
 */
type Objet = {
  nom: string
  pluriel: string
  un: string
  valeurs: number[]
  quantites?: [number, number]
  toujours?: boolean
}

/** Une ligne du tableau : `nom` sert à indiquer l'ordre, `sujet` dans les phrases. */
type Ligne = { nom: string; sujet: string }

/**
 * Situation décrite par un tableau à double entrée (lignes × objets) et une
 * valeur unitaire par objet.
 */
type ContexteTableau = {
  id: string
  objets: Objet[]
  lignes: (n: number) => Ligne[]
  quantites: [number, number]
  valeurs: (objets: Objet[], v: number[]) => string
  ligne: (l: Ligne, q: number[], objets: Objet[]) => string
  nomLignes: string
  nomColonnes: string
  consigneQ: string
  consigneP: string
  correctionQ: string
  sensQP: string
  total: (l: Ligne, t: number) => string
}

function texPmatrix(table: string[][]): string {
  return `\\begin{pmatrix}${table.map((ligne) => ligne.join(' & ')).join('\\\\')}\\end{pmatrix}`
}

/** Matrice à coefficients décimaux, écrits à la française. */
function texMatrice(table: number[][]): string {
  return texPmatrix(table.map((ligne) => ligne.map((x) => texNombre(x))))
}

function colonne(valeurs: number[]): number[][] {
  return valeurs.map((x) => [x])
}

/** « a », « a et b », « a, b et c ». */
function joinEt(liste: string[]): string {
  return liste.length === 1
    ? liste[0]
    : `${liste.slice(0, -1).join(', ')} et ${liste[liste.length - 1]}`
}

/** « d'article », « de billet ». */
function elision(mot: string): string {
  return /^[aeiouyéèh]/i.test(mot) ? `d'${mot}` : `de ${mot}`
}

function majuscule(texte: string): string {
  return texte.charAt(0).toUpperCase() + texte.slice(1)
}

function texEuros(centiemes: number): string {
  return `$${texPrix(centiemes / 100)}~\\text{€}$`
}

function texPoints(centiemes: number): string {
  const points = centiemes / 100
  return `$${texNombre(points)}$ point${points > 1 ? 's' : ''}`
}

/** « $2$ baguettes et $1$ croissant », sans les objets en quantité nulle. */
function texQuantites(quantites: number[], objets: Objet[]): string {
  return joinEt(
    quantites.flatMap((q, j) =>
      q === 0 ? [] : [`$${q}$ ${q === 1 ? objets[j].nom : objets[j].pluriel}`],
    ),
  )
}

function prenoms(n: number): Ligne[] {
  return (prenom(n) as string[]).map((nom) => ({ nom, sujet: nom }))
}

function prixUnitaires(objets: Objet[], v: number[]): string {
  return joinEt(objets.map((a, j) => `${a.un} coûte ${texEuros(v[j])}`))
}

/** Achats dans un commerce : quantités achetées et prix unitaires. */
function commerce(
  id: string,
  lieu: string,
  objets: Objet[],
  {
    lignes = prenoms,
    nomLignes = 'les personnes',
    individu = 'personne',
    article = 'article',
  }: {
    lignes?: (n: number) => Ligne[]
    nomLignes?: string
    individu?: string
    article?: string
  } = {},
): ContexteTableau {
  return {
    id,
    objets,
    lignes,
    quantites: [0, 4],
    valeurs: (o, v) => `${lieu}, ${prixUnitaires(o, v)}.`,
    ligne: (l, q, o) => `${majuscule(l.sujet)} achète ${texQuantites(q, o)}.`,
    nomLignes,
    nomColonnes: `les ${article}s`,
    consigneQ: `le nombre ${elision(article)}s du $j$-ième type achetés par la $i$-ième ${individu}`,
    consigneP: 'des prix unitaires, en euros',
    correctionQ: `Chaque ligne correspond à une ${individu} et chaque colonne à un type ${elision(article)}`,
    sensQP: `la somme dépensée, en euros, par la $i$-ième ${individu}`,
    total: (l, t) => `${l.sujet} dépense ${texEuros(t)}`,
  }
}

function familles(n: number): Ligne[] {
  return shuffle(['Martin', 'Bernard', 'Petit', 'Durand', 'Leroy', 'Moreau'])
    .slice(0, n)
    .map((nom) => ({ nom, sujet: `la famille ${nom}` }))
}

function equipes(n: number): Ligne[] {
  return shuffle(['Aigles', 'Lions', 'Requins', 'Tigres', 'Loups', 'Faucons'])
    .slice(0, n)
    .map((nom) => ({ nom: `les ${nom}`, sujet: `les ${nom}` }))
}

function recettes(n: number): Ligne[] {
  return shuffle([
    { nom: 'quatre-quarts', sujet: 'un quatre-quarts' },
    { nom: 'génoise', sujet: 'une génoise' },
    { nom: 'clafoutis', sujet: 'un clafoutis' },
    { nom: 'tarte', sujet: 'une tarte' },
    { nom: 'flan', sujet: 'un flan' },
    { nom: 'pâte à crêpes', sujet: 'une pâte à crêpes' },
  ]).slice(0, n)
}

const contextesTableau: ContexteTableau[] = [
  commerce('boulangerie', 'Dans une boulangerie', [
    {
      nom: 'baguette',
      pluriel: 'baguettes',
      un: 'une baguette',
      valeurs: [110, 120, 130],
    },
    {
      nom: 'croissant',
      pluriel: 'croissants',
      un: 'un croissant',
      valeurs: [100, 110, 120],
    },
    {
      nom: 'pain au chocolat',
      pluriel: 'pains au chocolat',
      un: 'un pain au chocolat',
      valeurs: [130, 140, 150],
    },
    {
      nom: 'brioche',
      pluriel: 'brioches',
      un: 'une brioche',
      valeurs: [250, 280, 300],
    },
  ]),
  commerce('papeterie', 'Dans une papeterie', [
    {
      nom: 'cahier',
      pluriel: 'cahiers',
      un: 'un cahier',
      valeurs: [250, 280, 320],
    },
    {
      nom: 'stylo',
      pluriel: 'stylos',
      un: 'un stylo',
      valeurs: [90, 120, 150],
    },
    {
      nom: 'classeur',
      pluriel: 'classeurs',
      un: 'un classeur',
      valeurs: [450, 520, 600],
    },
    {
      nom: 'trousse',
      pluriel: 'trousses',
      un: 'une trousse',
      valeurs: [600, 750, 850],
    },
  ]),
  commerce('sport', 'Dans un magasin de sport', [
    {
      nom: 'ballon',
      pluriel: 'ballons',
      un: 'un ballon',
      valeurs: [1500, 1800, 2200],
    },
    {
      nom: 'paire de chaussettes',
      pluriel: 'paires de chaussettes',
      un: 'une paire de chaussettes',
      valeurs: [500, 650, 800],
    },
    {
      nom: 'gourde',
      pluriel: 'gourdes',
      un: 'une gourde',
      valeurs: [900, 1200, 1500],
    },
    {
      nom: 'casquette',
      pluriel: 'casquettes',
      un: 'une casquette',
      valeurs: [1100, 1300, 1600],
    },
  ]),
  commerce(
    'cinema',
    'Dans un cinéma',
    [
      {
        nom: 'billet adulte',
        pluriel: 'billets adulte',
        un: 'un billet adulte',
        valeurs: [1050, 1150, 1250],
      },
      {
        nom: 'billet enfant',
        pluriel: 'billets enfant',
        un: 'un billet enfant',
        valeurs: [550, 650, 750],
      },
      {
        nom: 'billet senior',
        pluriel: 'billets senior',
        un: 'un billet senior',
        valeurs: [800, 850, 900],
      },
      {
        nom: 'billet étudiant',
        pluriel: 'billets étudiant',
        un: 'un billet étudiant',
        valeurs: [700, 750, 800],
      },
    ],
    {
      lignes: familles,
      nomLignes: 'les familles',
      individu: 'famille',
      article: 'billet',
    },
  ),
  {
    id: 'championnat',
    objets: [
      {
        nom: 'victoire',
        pluriel: 'victoires',
        un: 'une victoire',
        valeurs: [200, 300, 400],
        toujours: true,
      },
      {
        nom: 'match nul',
        pluriel: 'matchs nuls',
        un: 'un match nul',
        valeurs: [100],
      },
      { nom: 'défaite', pluriel: 'défaites', un: 'une défaite', valeurs: [0] },
    ],
    lignes: equipes,
    quantites: [0, 6],
    valeurs: (o, v) =>
      `Dans un championnat, ${joinEt(o.map((a, j) => `${a.un} rapporte ${texPoints(v[j])}`))}.`,
    ligne: (l, q, o) => `${majuscule(l.sujet)} comptent ${texQuantites(q, o)}.`,
    nomLignes: 'les équipes',
    nomColonnes: 'les résultats',
    consigneQ:
      'le nombre de résultats du $j$-ième type obtenus par la $i$-ième équipe',
    consigneP: 'des points attribués pour chaque résultat',
    correctionQ:
      'Chaque ligne correspond à une équipe et chaque colonne à un type de résultat',
    sensQP: 'le nombre total de points de la $i$-ième équipe',
    total: (l, t) => `${l.sujet} totalisent ${texPoints(t)}`,
  },
  {
    id: 'patisserie',
    objets: [
      {
        nom: 'œuf',
        pluriel: 'œufs',
        un: 'un œuf',
        valeurs: [25, 30, 35],
        quantites: [2, 6],
      },
      {
        nom: 'plaquette de beurre',
        pluriel: 'plaquettes de beurre',
        un: 'une plaquette de beurre',
        valeurs: [200, 230, 250],
        quantites: [0, 2],
      },
      {
        nom: 'litre de lait',
        pluriel: 'litres de lait',
        un: 'un litre de lait',
        valeurs: [100, 110, 120],
        quantites: [0, 1],
      },
      {
        nom: 'sachet de levure',
        pluriel: 'sachets de levure',
        un: 'un sachet de levure',
        valeurs: [30, 40, 50],
        quantites: [0, 2],
      },
    ],
    lignes: recettes,
    quantites: [0, 4],
    valeurs: (o, v) =>
      `Un pâtissier achète ses ingrédients aux prix suivants : ${prixUnitaires(o, v)}.`,
    ligne: (l, q, o) =>
      `${majuscule(l.sujet)} nécessite ${texQuantites(q, o)}.`,
    nomLignes: 'les recettes',
    nomColonnes: 'les ingrédients',
    consigneQ:
      'la quantité du $j$-ième ingrédient nécessaire à la $i$-ième recette',
    consigneP: 'des prix unitaires des ingrédients, en euros',
    correctionQ:
      'Chaque ligne correspond à une recette et chaque colonne à un ingrédient',
    sensQP: 'le coût, en euros, des ingrédients de la $i$-ième recette',
    total: (l, t) => `les ingrédients d'${l.sujet} coûtent ${texEuros(t)}`,
  },
  {
    id: 'bulletin',
    // `un` contient ici la matière précédée de « de » contracté.
    objets: [
      {
        nom: 'mathématiques',
        pluriel: '',
        un: 'des mathématiques',
        valeurs: [300, 400, 500],
      },
      {
        nom: 'physique-chimie',
        pluriel: '',
        un: 'de la physique-chimie',
        valeurs: [200, 300],
      },
      {
        nom: 'français',
        pluriel: '',
        un: 'du français',
        valeurs: [200, 300, 400],
      },
      {
        nom: 'anglais',
        pluriel: '',
        un: "de l'anglais",
        valeurs: [100, 200, 300],
      },
    ],
    lignes: prenoms,
    quantites: [6, 20],
    valeurs: (o, v) =>
      `Dans une classe, ${joinEt(o.map((a, j) => `le coefficient ${a.un} est $${texNombre(v[j] / 100)}$`))}.`,
    ligne: (l, q, o) =>
      `${l.sujet} a obtenu ${joinEt(q.map((note, j) => `$${note}$ en ${o[j].nom}`))}.`,
    nomLignes: 'les élèves',
    nomColonnes: 'les matières',
    consigneQ: 'la note obtenue par le $i$-ième élève dans la $j$-ième matière',
    consigneP: 'des coefficients',
    correctionQ:
      'Chaque ligne correspond à un élève et chaque colonne à une matière',
    sensQP:
      'la somme des notes du $i$-ième élève, pondérées par les coefficients',
    total: (l, t) => `${l.sujet} obtient $${texNombre(t / 100)}$`,
  },
]

function quantitesAleatoires(
  n: number,
  objets: Objet[],
  intervalle: [number, number],
): number[][] {
  return Array.from({ length: n }, () =>
    objets.map((objet) => {
      const [min, max] = objet.quantites ?? intervalle
      return randint(min, max)
    }),
  )
}

/** Tire p objets du contexte, en gardant ceux qui doivent toujours figurer. */
function objetsAleatoires(
  contexte: ContexteTableau,
  p: number,
): Objet[] | null {
  const objets = shuffle(contexte.objets).slice(0, p)
  return contexte.objets.some((o) => o.toujours && !objets.includes(o))
    ? null
    : objets
}

/** Des valeurs unitaires toutes distinctes, pour que la matrice P soit parlante. */
function valeursDistinctes(valeurs: number[]): boolean {
  return new Set(valeurs).size === valeurs.length
}

type Champ = { nom: string; reponse: string }
/** Une consigne, sa correction et les matrices attendues. */
type Etape = { consigne: string; correction: string; champs: Champ[] }
type Situation = { enonce: string; etapes: Etape[]; cle: string }

/** Tableau à double entrée : matrices Q et P, puis produit QP. */
function situationTableau(
  p: number,
  contexte: ContexteTableau,
): Situation | null {
  const objets = objetsAleatoires(contexte, p)
  if (objets == null) return null
  const valeurs = objets.map((a) => choice(a.valeurs))
  if (!valeursDistinctes(valeurs)) return null
  const n = randint(2, 3)
  const lignes = contexte.lignes(n)
  const quantites = quantitesAleatoires(n, objets, contexte.quantites)
  // Chaque ligne porte sur au moins deux objets (un seul si p = 2)…
  if (quantites.some((l) => l.filter((q) => q > 0).length < p - 1)) return null
  // … et chaque objet apparaît dans au moins une ligne.
  if (objets.some((_, j) => quantites.every((l) => l[j] === 0))) return null
  const totaux = quantites.map((l) =>
    l.reduce((s, q, j) => s + q * valeurs[j], 0),
  )

  const Q = texMatrice(quantites)
  const P = texMatrice(colonne(valeurs.map((c) => c / 100)))
  const QP = texMatrice(colonne(totaux.map((c) => c / 100)))
  const detail = quantites.map((l) => [
    l
      .flatMap((q, j) =>
        q === 0 ? [] : [`${q}\\times ${texNombre(valeurs[j] / 100)}`],
      )
      .join('+'),
  ])
  let correctionQP = `$Q$ est de taille $${n}\\times ${p}$ et $P$ est de taille $${p}\\times 1$, donc $QP$ existe et est de taille $${n}\\times 1$.<br>`
  correctionQP += `$QP=${texPmatrix(detail)}=${miseEnEvidence(QP)}$<br>`
  correctionQP += `Le coefficient de la ligne $i$ de $QP$ est ${contexte.sensQP} : ${joinEt(lignes.map((l, i) => contexte.total(l, totaux[i])))}.`
  let enonce = `${contexte.valeurs(objets, valeurs)}<br>`
  enonce += `${lignes.map((l, i) => contexte.ligne(l, quantites[i], objets)).join(' ')}<br>`
  enonce += `On range ${contexte.nomLignes} dans l'ordre ${joinEt(lignes.map((l) => l.nom))} et ${contexte.nomColonnes} dans l'ordre ${joinEt(objets.map((a) => a.nom))}.`
  return {
    enonce,
    etapes: [
      {
        consigne: `Écrire la matrice $Q$ dont le coefficient de la ligne $i$ et de la colonne $j$ est ${contexte.consigneQ}.`,
        correction: `${contexte.correctionQ} :<br>$Q=${miseEnEvidence(Q)}$`,
        champs: [{ nom: 'Q', reponse: Q }],
      },
      {
        consigne: `Écrire la matrice colonne $P$ ${contexte.consigneP}.`,
        correction: `Les valeurs sont rangées dans le même ordre que les colonnes de $Q$ :<br>$P=${miseEnEvidence(P)}$`,
        champs: [{ nom: 'P', reponse: P }],
      },
      {
        consigne: 'Calculer $QP$ et interpréter ses coefficients.',
        correction: correctionQP,
        champs: [{ nom: 'QP', reponse: QP }],
      },
    ],
    cle: [
      'tableau',
      contexte.id,
      ...objets.map((a) => a.nom),
      ...valeurs,
      ...quantites.flat(),
    ].join('|'),
  }
}

/**
 * Renvoie une fonction qui donne le contexte suivant, compatible avec la
 * taille p : un contexte ne revient pas avant que tous aient servi.
 */
function serieDeContextes<T>(
  contextes: T[],
  compatible: (contexte: T, p: number) => boolean = () => true,
): (p: number) => T {
  let file: T[] = []
  return (p) => {
    let k = file.findIndex((c) => compatible(c, p))
    if (k === -1) {
      file = [...file, ...shuffle(contextes)]
      k = file.findIndex((c) => compatible(c, p))
    }
    return file.splice(k, 1)[0]
  }
}

/** Première situation obtenue, en changeant de contexte si un tirage échoue. */
function premiereSituation<T>(
  suivant: (p: number) => T,
  p: number,
  generer: (contexte: T) => Situation | null,
): Situation | null {
  for (let c = 0; c < 5; c++) {
    const contexte = suivant(p)
    for (let essai = 0; essai < 1000; essai++) {
      const situation = generer(contexte)
      if (situation != null) return situation
    }
  }
  return null
}

/** Énoncé, champs de réponse et correction d'une situation (nbChamps champs par question). */
function assembler(
  exercice: IExercice,
  i: number,
  situation: Situation,
  nbChamps: number,
): { texte: string; texteCorr: string } {
  let texte = situation.enonce
  if (exercice.interactif) {
    texte += "<br>Saisir les matrices à l'aide de la touche «\u00a0Matrice\u00a0»."
  }
  let texteCorr = ''
  let champ = 0
  const numeroter = situation.etapes.length > 1
  situation.etapes.forEach((etape, k) => {
    const numero = numeroter ? numAlpha(k) : ''
    texte += `<br>${numero}${etape.consigne}`
    texteCorr += `${k > 0 ? '<br>' : ''}${numero}${etape.correction}`
    for (const { nom, reponse } of etape.champs) {
      if (exercice.interactif) {
        texte +=
          '<br>' +
          ajouteChampTexteMathLive(
            exercice,
            nbChamps * i + champ,
            KeyboardType.clavierMatrice,
            { texteAvant: `$${nom}=$` },
          )
      }
      handleAnswers(exercice, nbChamps * i + champ, {
        reponse: { value: reponse, compare: matriceCompare },
      })
      champ++
    }
  })
  return { texte, texteCorr }
}

export default class ProduitDeMatricesEnSituation extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireNumerique = [
      "Nombre de types d'objets",
      3,
      '1 : Deux\n2 : Trois\n3 : Mélange',
    ]
    this.sup = 3
    this.spacingCorr = 2
  }

  nouvelleVersion() {
    const tailles = combinaisonListes(
      this.sup === 3 ? [2, 3] : [this.sup + 1],
      this.nbQuestions,
    )
    const suivantTableau = serieDeContextes(contextesTableau)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const p = tailles[i]
      const situation = premiereSituation(suivantTableau, p, (c) =>
        situationTableau(p, c),
      )
      if (situation == null || !this.questionJamaisPosee(i, situation.cle)) {
        continue
      }
      const { texte, texteCorr } = assembler(this, i, situation, 3)
      this.listeQuestions[i] = texte
      this.listeCorrections[i] = texteCorr
      i++
    }
    listeQuestionsToContenu(this)
  }
}
