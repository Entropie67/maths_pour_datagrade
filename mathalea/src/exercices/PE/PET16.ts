import { choixDeroulant } from '../../lib/customElements/ListeDeroulanteElement'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import {
  ajouteChampTexte,
  ajouteChampTexteMathLive,
} from '../../lib/interactif/questionMathLive'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import {
  decaleFormule,
  evalueFormule,
  expressionNumerique,
  formuleEnTex,
  normaliseFormule,
  recopieFormule,
  refCellule,
  valeurAffichee,
  type Cellules,
} from '../../lib/outils/tableurFormules'
import { rendTableur } from '../../lib/outils/tableurRendu'
import { creeRecopie, decritDecalage } from '../../lib/outils/tableurRecopie'
import { creeScenario } from '../../lib/outils/tableurScenarios'
import type { CompareFunction } from '../../lib/types'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Déterminer l’incidence du signe dollar lors d’un étirement de cellule sur tableur'
export const dateDePublication = '14/10/2026'
export const interactifReady = true
export const uuid = 'aa5b6'

export const refs = {
  'fr-fr': ['PET16'],
  'fr-ch': [],
}

/**
 * Déterminer l'incidence d'un copier-coller avec ou sans utilisation du $ (CRPE).
 * @author Rémi Angot
 */

const COULEUR_SAISIE = '#fde68a'
const COULEUR_RECOPIE = '#bfdbfe'

type TableOperation = {
  entetesColonnes: number[]
  entetesLignes: number[]
  operateur: '*' | '+'
  cellules: Cellules
  /** Valeur attendue dans la cellule de la ligne `l` et de la colonne `c` (à partir de 0 dans le corps du tableau). */
  attendu: (colonne: number, ligne: number) => number
}

const NB_COLONNES_TABLE = 4
const NB_LIGNES_TABLE = 4

function creeTable(): TableOperation {
  const operateur = choice(['*', '+'] as const)
  const nombres = shuffle([2, 3, 4, 5, 6, 7, 8, 9])
  const entetesLignes = nombres.slice(0, NB_LIGNES_TABLE)
  const entetesColonnes = nombres.slice(NB_LIGNES_TABLE)
  const cellules: Cellules = { A1: operateur === '*' ? '×' : '+' }
  entetesColonnes.forEach((v, c) => {
    cellules[refCellule(c + 1, 0)] = v
  })
  entetesLignes.forEach((v, l) => {
    cellules[refCellule(0, l + 1)] = v
  })
  return {
    entetesColonnes,
    entetesLignes,
    operateur,
    cellules,
    attendu: (c, l) =>
      operateur === '*'
        ? entetesLignes[l] * entetesColonnes[c]
        : entetesLignes[l] + entetesColonnes[c],
  }
}

/**
 * Une saisie convient si, étirée dans tout le corps du tableau, elle
 * donne partout la valeur attendue.
 */
function compareTable(table: TableOperation): CompareFunction {
  return (saisie) => {
    const formule = normaliseFormule(saisie)
    if (!formule.startsWith('=')) {
      return { isOk: false, feedback: 'Une formule commence par le signe =.' }
    }
    const calcule = (colonne: number, ligne: number): number | null => {
      try {
        return evalueFormule(decaleFormule(formule, colonne, ligne), (ref) =>
          valeurAffichee(table.cellules, ref),
        )
      } catch {
        return null
      }
    }
    let toutEstJuste = true
    for (let l = 0; l < NB_LIGNES_TABLE; l++) {
      for (let c = 0; c < NB_COLONNES_TABLE; c++) {
        if (calcule(c, l) !== table.attendu(c, l)) toutEstJuste = false
      }
    }
    if (toutEstJuste) return { isOk: true }
    return calcule(0, 0) === table.attendu(0, 0)
      ? {
          isOk: false,
          feedback:
            'La formule donne le bon résultat en B2 mais pas dans toutes les cellules après l’étirement.',
        }
      : { isOk: false }
  }
}

function questionTable(exercice: Exercice, i: number) {
  const table = creeTable()
  const symbole = table.operateur
  const formule = `=$A2${symbole}B$1`
  const cellulesCorrection: Cellules = { ...table.cellules }
  for (let l = 0; l < NB_LIGNES_TABLE; l++) {
    for (let c = 0; c < NB_COLONNES_TABLE; c++) {
      cellulesCorrection[refCellule(c + 1, l + 1)] = recopieFormule(
        formule,
        'B2',
        refCellule(c + 1, l + 1),
      )
    }
  }
  const parametres = {
    nbColonnes: NB_COLONNES_TABLE + 1,
    nbLignes: NB_LIGNES_TABLE + 1,
    largeurs: Array(NB_COLONNES_TABLE + 1).fill(60),
  }
  let texte = `On veut construire la table ${symbole === '*' ? 'de multiplication' : 'd’addition'} ci-dessous. On saisit une formule dans la cellule B2 puis on étire la cellule vers la droite et vers le bas jusqu’à la cellule ${refCellule(NB_COLONNES_TABLE, NB_LIGNES_TABLE)}, de façon que chaque cellule du tableau affiche ${symbole === '*' ? 'le produit' : 'la somme'} du nombre de sa ligne et du nombre de sa colonne.<br>`
  texte += rendTableur({
    ...parametres,
    cellules: table.cellules,
    couleurs: { B2: COULEUR_SAISIE },
    formuleImprimee: { cellule: 'B2', formule: '?' },
  })
  texte += '<br>Écrire la formule à saisir dans la cellule B2.'
  texte += ajouteChampTexte(exercice, i, KeyboardType.alphanumeric, {
    texteAvant: ' B2 :',
  })
  handleAnswers(
    exercice,
    i,
    { reponse: { value: formule, compare: compareTable(table) } },
    { formatInteractif: 'mathalea-textfield' },
  )
  let texteCorr = `Lors de l’étirement vers la droite, il faut que la colonne $A$ reste celle du nombre de la ligne : on écrit $\\text{\\$A2}$ (colonne bloquée).<br>`
  texteCorr += `Lors de l’étirement vers le bas, il faut que la ligne $1$ reste celle du nombre de la colonne : on écrit $\\text{B\\$1}$ (ligne bloquée).<br>`
  texteCorr += `On saisit donc $${miseEnEvidence(formuleEnTex(formule))}$ dans la cellule B2 (la formule $${formuleEnTex(`=B$1${symbole}$A2`)}$ convient aussi) puis on étire la cellule.<br>`
  texteCorr += rendTableur({
    ...parametres,
    cellules: cellulesCorrection,
    formuleImprimee: { cellule: 'B2', formule },
  })
  return {
    texte,
    texteCorr,
    cle: `table${symbole}${table.entetesLignes.join('')}`,
  }
}

function questionValeur(exercice: Exercice, i: number) {
  const nbColonnes = 6
  const nbLignes = 7
  const r = creeRecopie({
    mode: choice([1, 2, 3]),
    dollar: choice([2, 3, 4]),
    nbColonnes,
    nbLignes,
  })
  const cellules: Cellules = {}
  for (let l = 0; l < nbLignes; l++) {
    for (let c = 0; c < nbColonnes; c++) {
      cellules[refCellule(c, l)] = randint(1, 9)
    }
  }
  delete cellules[r.destination]
  cellules[r.origine] = r.formule
  const resultat = evalueFormule(r.formuleRecopiee, (ref) =>
    valeurAffichee(cellules, ref),
  )
  let texte = `Dans la cellule ${r.origine} du tableur ci-dessous, on a saisi la formule $${formuleEnTex(r.formule)}$. Cette cellule est ensuite copiée dans la cellule ${r.destination}.<br>`
  texte += rendTableur({
    cellules,
    nbColonnes,
    nbLignes,
    largeurs: Array(nbColonnes).fill(60),
    lignesEntete: [],
    couleurs: { [r.origine]: COULEUR_SAISIE, [r.destination]: COULEUR_RECOPIE },
    formuleImprimee: { cellule: r.origine, formule: r.formule },
  })
  texte += `<br>Quel nombre s’affiche alors dans la cellule ${r.destination} ?`
  texte += ajouteChampTexteMathLive(exercice, i, KeyboardType.clavierNumbers, {
    texteAvant: ' ',
  })
  handleAnswers(
    exercice,
    i,
    { reponse: { value: resultat } },
    { formatInteractif: 'mathlive' },
  )
  const texteCorr = `La copie de ${r.origine} vers ${r.destination} décale la formule de ${decritDecalage(r.dColonnes, r.dLignes)} : les références qui ne sont pas bloquées par le signe dollar $\\$$ sont modifiées.<br>
La cellule ${r.destination} contient donc la formule $${formuleEnTex(r.formuleRecopiee)}$, c’est-à-dire $${expressionNumerique(r.formuleRecopiee, cellules)}=${miseEnEvidence(resultat)}$.`
  return { texte, texteCorr, cle: `${r.formule}${r.destination}${resultat}` }
}

function questionChoix(exercice: Exercice, i: number) {
  const s = creeScenario(choice([5, 6]))
  const juste = choice(s.formulesJustes)
  const fausses = [s.erreurs[0], ...shuffle(s.erreurs.slice(1)).slice(0, 1)]
  const propositions = shuffle([
    { formule: juste, explication: '' },
    ...fausses,
  ])
  const lettres = ['A', 'B', 'C']
  const lettreJuste =
    lettres[propositions.findIndex((p) => p.formule === juste)]
  const derniere = `${s.cible.replace(/\d+/, '')}${Number(s.cible.replace(/\D+/, '')) + s.nbRecopies}`
  let texte = `${s.intro}<br>`
  texte += rendTableur({
    cellules: s.cellules,
    nbColonnes: s.nbColonnes,
    nbLignes: s.nbLignes,
    largeurs: s.largeurs,
    lignesEntete: s.numero === 6 ? [2] : [1],
    couleurs: { [s.cible]: COULEUR_SAISIE },
  })
  texte += `<br>On veut ${s.but}. On saisit une formule dans la cellule ${s.cible} puis on étire la cellule vers le bas jusqu’en ${derniere}.<br>`
  propositions.forEach((p, k) => {
    texte += `Proposition ${lettres[k]} : $${formuleEnTex(p.formule)}$<br>`
  })
  texte += 'Quelle proposition convient ?'
  if (exercice.interactif) {
    texte += ` La proposition qui convient est la proposition ${choixDeroulant(
      exercice,
      i,
      {
        choices: [
          { label: 'Choisir', value: '' },
          ...lettres.map((l) => ({ label: l, value: l })),
        ],
      },
    )}.`
    handleAnswers(
      exercice,
      i,
      { reponse: { value: lettreJuste } },
      { formatInteractif: 'liste-deroulante' },
    )
  }
  let texteCorr = `La proposition ${texteEnCouleurEtGras(lettreJuste)} convient : `
  texteCorr += `la référence qui doit rester fixe lors de l’étirement est bloquée par le signe dollar $\\$$, alors que les autres références sont décalées.<br>`
  propositions.forEach((p, k) => {
    if (p.formule !== juste) {
      texteCorr += `La proposition ${lettres[k]} ne convient pas : ${p.explication}.<br>`
    }
  })
  return {
    texte,
    texteCorr,
    cle: `${s.numero}${juste}${JSON.stringify(s.cellules)}`,
  }
}

export default class IncidenceDuDollar extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.besoinFormulaireTexte = [
      'Types de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : Écrire la formule d’une table à double entrée',
        '2 : Trouver la valeur affichée après un étirement de cellule',
        '3 : Choisir parmi trois formules celle qui convient après un étirement de cellule',
        '4 : Mélange',
      ].join('\n'),
    ]
    this.sup = '4'
  }

  nouvelleVersion() {
    const types = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: this.nbQuestions,
    }).map(Number)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const { texte, texteCorr, cle } =
        types[i] === 1
          ? questionTable(this, i)
          : types[i] === 2
            ? questionValeur(this, i)
            : questionChoix(this, i)
      if (this.questionJamaisPosee(i, types[i], cle)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
