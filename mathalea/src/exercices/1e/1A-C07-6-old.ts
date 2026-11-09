// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 8148b continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import ExerciceQcmA from '../ExerciceQcmA'
export const dateDePublication = '22/02/2026'
export const uuid = '8148b'
// @Author Gilles Mora
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Trouver la bonne unité'
export default class auto1AC7fOld extends ExerciceQcmA {
  private appliquerLesValeurs(
    objet: string,
    valeurs: number[],
    bonneUnite: string,
    distracteurs: [string, string, string],
    explication: string,
  ): void {
    const valeur = choice(valeurs)
    this.enonce = `Quelle unité convient pour compléter la phrase suivante ?<br>${objet} $${texNombre(valeur)}$ ...`
    this.correction = `${explication} $${texNombre(valeur)}$ $${miseEnEvidence(`\\text{${bonneUnite}}`)}$.`
    this.reponses = [
      `$\\text{${bonneUnite}}$`,
      `$\\text{${distracteurs[0]}}$`,
      `$\\text{${distracteurs[1]}}$`,
      `$\\text{${distracteurs[2]}}$`,
    ]
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(
      "La largeur d'une salle de classe peut mesurer ",
      [6],
      'm',
      ['dm', 'cm', 'mm'],
      "La largeur d'une salle de classe est d'environ ",
    )
  }

  versionAleatoire = () => {
    const situations: {
      objet: string
      valeurs: number[]
      bonneUnite: string
      distracteurs: [string, string, string]
      explication: string
    }[] = [
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

    const situationChoisie = choice(situations)
    this.appliquerLesValeurs(
      situationChoisie.objet,
      situationChoisie.valeurs,
      situationChoisie.bonneUnite,
      situationChoisie.distracteurs,
      situationChoisie.explication,
    )
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
