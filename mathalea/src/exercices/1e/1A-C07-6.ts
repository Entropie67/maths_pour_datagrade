import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice } from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import ExerciceSimple from '../ExerciceSimple'
export const dateDePublication = '22/02/2026'
export const dateDeModifImportante = '30/09/2026'
export const uuid = '70650'

export const refs = {
  'fr-fr': ['1A-C07-6', '2A-N7-6'],
  'fr-ch': ['9R1GM4A-4', '9R2GM4A-4', '9R3GM4A-4'],
}
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const titre = 'Trouver la bonne unité'

type Situation = {
  objet: string
  valeurs: number[]
  bonneUnite: string
  distracteurs: [string, string, string]
  explication: string
}

const situations: Situation[] = [
  // ===== LONGUEURS =====
  {
    objet: "La largeur d'une salle de classe peut mesurer ",
    valeurs: [5, 6, 7, 8],
    bonneUnite: 'm',
    distracteurs: ['dm', 'cm', 'mm'],
    explication: "La largeur d'une salle de classe est d'environ",
  },
  {
    objet: "La longueur d'un terrain de football est d'environ ",
    valeurs: [100, 105, 110],
    bonneUnite: 'm',
    distracteurs: ['km', 'dm', 'cm'],
    explication: 'Un terrain de football mesure environ',
  },
  {
    objet: "L'épaisseur d'un trait de crayon est d'environ ",
    valeurs: [0.3, 0.5, 0.7],
    bonneUnite: 'mm',
    distracteurs: ['cm', 'dm', 'm'],
    explication: "Un trait de crayon a une épaisseur d'environ",
  },
  {
    objet: "La hauteur d'une porte est d'environ",
    valeurs: [2, 2.1, 2.2],
    bonneUnite: 'm',
    distracteurs: ['cm', 'dm', 'km'],
    explication: 'Une porte mesure environ',
  },
  {
    objet: "La longueur d'une fourmi est d'environ",
    valeurs: [3, 4, 5],
    bonneUnite: 'mm',
    distracteurs: ['cm', 'dm', 'm'],
    explication: 'Une fourmi mesure environ',
  },
  {
    objet: "La distance entre Paris et Lyon est d'environ",
    valeurs: [460, 465, 470],
    bonneUnite: 'km',
    distracteurs: ['m', 'dam', 'hm'],
    explication: "La distance Paris-Lyon est d'environ",
  },
  {
    objet: "La longueur d'un crayon est d'environ",
    valeurs: [17, 18, 19],
    bonneUnite: 'cm',
    distracteurs: ['mm', 'm', 'dm'],
    explication: 'Un crayon mesure environ',
  },
  {
    objet: "L'épaisseur d'un téléphone portable est d'environ",
    valeurs: [7, 8, 9],
    bonneUnite: 'mm',
    distracteurs: ['cm', 'dm', 'm'],
    explication: "Un téléphone portable a une épaisseur d'environ",
  },
  {
    objet: "La hauteur d'un immeuble de $4$ étages est d'environ",
    valeurs: [12, 13, 14],
    bonneUnite: 'm',
    distracteurs: ['dm', 'dam', 'cm'],
    explication: 'Un immeuble de $4$ étages mesure environ',
  },
  {
    objet: "La largeur d'un timbre-poste est d'environ",
    valeurs: [24, 25, 26],
    bonneUnite: 'mm',
    distracteurs: ['cm', 'dm', 'm'],
    explication: "Un timbre-poste a une largeur d'environ",
  },

  // ===== MASSES =====
  {
    objet: "La masse d'une tablette de chocolat est d'environ",
    valeurs: [100, 150, 200],
    bonneUnite: 'g',
    distracteurs: ['kg', 'mg', 't'],
    explication: 'Une tablette de chocolat pèse environ',
  },
  {
    objet: "La masse d'un nouveau-né est d'environ",
    valeurs: [3, 3.3, 3.5, 4],
    bonneUnite: 'kg',
    distracteurs: ['g', 't', 'mg'],
    explication: 'Un nouveau-né pèse environ',
  },
  {
    objet: "La masse d'un camion chargé est d'environ",
    valeurs: [15, 18, 20, 25],
    bonneUnite: 't',
    distracteurs: ['kg', 'g', 'mg'],
    explication: 'Un camion chargé pèse environ',
  },
  {
    objet: "La masse d'un comprimé de médicament est d'environ",
    valeurs: [200, 400, 500, 600],
    bonneUnite: 'mg',
    distracteurs: ['g', 'kg', 'cg'],
    explication: 'Un comprimé de médicament pèse environ',
  },
  {
    objet: "La masse d'une baguette de pain est d'environ",
    valeurs: [200, 250, 300],
    bonneUnite: 'g',
    distracteurs: ['kg', 'mg', 't'],
    explication: 'Une baguette de pain pèse environ',
  },

  // ===== CONTENANCES =====
  {
    objet: "La contenance d'une bouteille d'eau est d'environ",
    valeurs: [0.5, 1, 1.5],
    bonneUnite: 'L',
    distracteurs: ['mL', 'cL', 'dL'],
    explication: "Une bouteille d'eau contient environ",
  },
  {
    objet: "La contenance d'une cuillère à café est d'environ",
    valeurs: [4, 5, 6],
    bonneUnite: 'mL',
    distracteurs: ['cL', 'dL', 'L'],
    explication: 'Une cuillère à café contient environ',
  },
  {
    objet: "La contenance d'une casserole est d'environ",
    valeurs: [1, 1.5, 2, 3],
    bonneUnite: 'L',
    distracteurs: ['mL', 'cL', 'dL'],
    explication: 'Une casserole contient environ',
  },
  {
    objet: "La contenance d'un verre de jus d'orange est d'environ",
    valeurs: [20, 25, 30],
    bonneUnite: 'cL',
    distracteurs: ['L', 'mL', 'dL'],
    explication: "Un verre de jus d'orange contient environ",
  },
  {
    objet: "La contenance d'un seau est d'environ",
    valeurs: [8, 10, 12],
    bonneUnite: 'L',
    distracteurs: ['mL', 'cL', 'dL'],
    explication: 'Un seau contient environ',
  },
]

export default class auto1AC7f extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1.5
    this.formatChampTexte = KeyboardType.alphanumeric
    this.optionsDeComparaison = { texteAvecCasse: true }
    this.versionQcmDisponible = true
    this.versionQcm = false
  }

  nouvelleVersion() {
    if (context.isAmc) this.versionQcm = true

    const { objet, valeurs, bonneUnite, distracteurs, explication } =
      this.quotaChoice('situation', situations)
    const valeur = choice(valeurs)
    this.correction = `${explication} $${texNombre(valeur)}$ ${texteEnCouleurEtGras(bonneUnite)}.`

    if (this.versionQcm) {
      this.question = `Quelle unité convient pour compléter la phrase suivante ?<br>${objet} $${texNombre(valeur)}$ $\\ldots$`
      this.reponse = `$\\text{${bonneUnite}}$`
      this.distracteurs = distracteurs.map((d) => `$\\text{${d}}$`)
    } else {
      this.question = `Compléter la phrase suivante avec l'unité qui convient.<br>${objet.trim()} $${texNombre(valeur)}$ ${this.interactif ? '' : '$\\ldots$'}`
      this.optionsChampTexte = { texteApres: '.' }
      this.reponse = bonneUnite
    }
  }
}
