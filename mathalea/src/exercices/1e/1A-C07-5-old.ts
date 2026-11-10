// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid f69e5 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import ExerciceQcmA from '../ExerciceQcmA'
export const dateDePublication = '20/02/2026'
export const uuid = 'f69e5'
// @Author Gilles Mora
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Calculer l'aire d'un carré avec une conversion d'unité"
export default class auto1AC7eOld extends ExerciceQcmA {
  private appliquerLesValeurs(
    cote: number,
    uniteCote: string,
    uniteAire: string,
    facteur: number,
  ): void {
    const coteConverti = cote * facteur
    const aireCorrecte = coteConverti * coteConverti

    // Nombre de décimales adapté pour un affichage propre
    // On calcule le nombre de décimales nécessaires à partir des valeurs réelles
    const nbDecimalesCote = this.compterDecimales(coteConverti)
    const nbDecimalesAire = this.compterDecimales(aireCorrecte)

    this.enonce = `L'aire en $\\text{${uniteAire}}^2$ d'un carré de côté $${texNombre(cote)}$ $\\text{${uniteCote}}$ est égale à :`

    // Bonne réponse
    const bonneReponse = `$${texNombre(aireCorrecte, nbDecimalesAire)}$ $\\text{${uniteAire}}^2$`

    this.correction = `$${texNombre(cote)}$ $\\text{ ${uniteCote}}$ $= ${texNombre(coteConverti, nbDecimalesCote)}$ $\\text{${uniteAire}}$<br>
L'aire du carré est : $${texNombre(coteConverti, nbDecimalesCote)} \\text{ ${uniteAire}}\\times ${texNombre(coteConverti, nbDecimalesCote)} \\text{ ${uniteAire}} = ${miseEnEvidence(`${texNombre(aireCorrecte, nbDecimalesAire)}\\text{ ${uniteAire}}^2`)}$ .`

    // Distracteurs classiques
    const distracteurs = [
      `$${texNombre(cote * cote, nbDecimalesAire)}$ $\\text{${uniteAire}}^2$`, // Oubli de convertir : cote² dans l'unité d'origine
      `$${texNombre(cote * cote * facteur, this.compterDecimales(cote * cote * facteur))}$ $\\text{${uniteAire}}^2$`, // Convertir l'aire comme une longueur (× facteur au lieu de × facteur²)
      `$${texNombre(coteConverti, nbDecimalesCote)}$ $\\text{${uniteAire}}^2$`, // Côté converti sans élever au carré
      `$${texNombre(4 * coteConverti, this.compterDecimales(4 * coteConverti))}$ $\\text{${uniteAire}}^2$`, // Périmètre converti au lieu de l'aire
      `$${texNombre(cote * facteur * facteur, this.compterDecimales(cote * facteur * facteur))}$ $\\text{${uniteAire}}^2$`, // cote × facteur² sans élever le côté au carré
      `$${texNombre((cote * cote) / facteur, this.compterDecimales((cote * cote) / facteur))}$ $\\text{${uniteAire}}^2$`, // Division au lieu de multiplication (ou inversement)
    ]

    // Sélection de 3 distracteurs distincts (différents de la bonne réponse)
    const distracteursFiltres = distracteurs.filter(
      (rep) => rep !== bonneReponse,
    )
    const troisDistracteurs: string[] = []

    while (troisDistracteurs.length < 3 && distracteursFiltres.length > 0) {
      const distracteur = choice(distracteursFiltres)
      if (!troisDistracteurs.includes(distracteur)) {
        troisDistracteurs.push(distracteur)
      }
      const index = distracteursFiltres.indexOf(distracteur)
      distracteursFiltres.splice(index, 1)
    }

    this.reponses = [bonneReponse, ...troisDistracteurs]
  }

  /**
   * Compte le nombre de décimales significatives d'un nombre
   * en évitant les artefacts de virgule flottante
   */
  private compterDecimales(valeur: number): number {
    // Arrondir pour éviter les artefacts flottants (ex : 0.0009000000000000001)
    const str = parseFloat(valeur.toPrecision(10)).toString()
    if (!str.includes('.')) return 0
    return str.split('.')[1].length
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(4, 'dm', 'm', 0.1)
  }

  versionAleatoire = () => {
    const couplesUnites: {
      uniteCote: string
      uniteAire: string
      facteur: number
      cotes: number[]
    }[] = [
      // Vers une unité plus petite (facteur > 1) — résultats entiers
      {
        uniteCote: 'km',
        uniteAire: 'm',
        facteur: 1000,
        cotes: [1, 2, 3, 4, 5],
      },
      {
        uniteCote: 'm',
        uniteAire: 'dm',
        facteur: 10,
        cotes: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      },
      { uniteCote: 'm', uniteAire: 'cm', facteur: 100, cotes: [1, 2, 3, 4, 5] },
      {
        uniteCote: 'dm',
        uniteAire: 'cm',
        facteur: 10,
        cotes: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      },
      {
        uniteCote: 'dm',
        uniteAire: 'mm',
        facteur: 100,
        cotes: [1, 2, 3, 4, 5],
      },
      {
        uniteCote: 'cm',
        uniteAire: 'mm',
        facteur: 10,
        cotes: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      },

      // Vers une unité plus grande avec résultats entiers (multiples du facteur inverse)
      {
        uniteCote: 'm',
        uniteAire: 'dam',
        facteur: 0.1,
        cotes: [10, 20, 30, 40, 50, 60, 70, 80, 90],
      },
      {
        uniteCote: 'm',
        uniteAire: 'hm',
        facteur: 0.01,
        cotes: [100, 200, 300, 400, 500],
      },
      {
        uniteCote: 'm',
        uniteAire: 'km',
        facteur: 0.001,
        cotes: [1000, 2000, 3000, 4000, 5000],
      },
      {
        uniteCote: 'cm',
        uniteAire: 'dm',
        facteur: 0.1,
        cotes: [10, 20, 30, 40, 50, 60, 70, 80, 90],
      },
      {
        uniteCote: 'cm',
        uniteAire: 'm',
        facteur: 0.01,
        cotes: [100, 200, 300, 400, 500],
      },
      {
        uniteCote: 'mm',
        uniteAire: 'cm',
        facteur: 0.1,
        cotes: [10, 20, 30, 40, 50, 60, 70, 80, 90],
      },
      {
        uniteCote: 'mm',
        uniteAire: 'dm',
        facteur: 0.01,
        cotes: [100, 200, 300, 400, 500],
      },
      {
        uniteCote: 'dm',
        uniteAire: 'm',
        facteur: 0.1,
        cotes: [10, 20, 30, 40, 50, 60, 70, 80, 90],
      },

      // Vers une unité plus grande avec résultats décimaux (côtés NON multiples)
      // On limite à 4 décimales max pour l'aire → facteur ≥ 0.01 avec côtés ≤ 9
      {
        uniteCote: 'cm',
        uniteAire: 'm',
        facteur: 0.01,
        cotes: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      }, // ex : 3 cm = 0,03 m → aire = 0,0009 m² (4 déc)
      {
        uniteCote: 'cm',
        uniteAire: 'dm',
        facteur: 0.1,
        cotes: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      }, // ex : 3 cm = 0,3 dm → aire = 0,09 dm² (2 déc)
      {
        uniteCote: 'mm',
        uniteAire: 'cm',
        facteur: 0.1,
        cotes: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      }, // ex : 5 mm = 0,5 cm → aire = 0,25 cm² (2 déc)
      {
        uniteCote: 'dm',
        uniteAire: 'm',
        facteur: 0.1,
        cotes: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      }, // ex : 7 dm = 0,7 m → aire = 0,49 m² (2 déc)
      {
        uniteCote: 'm',
        uniteAire: 'dam',
        facteur: 0.1,
        cotes: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      }, // ex : 3 m = 0,3 dam → aire = 0,09 dam² (2 déc)
      {
        uniteCote: 'm',
        uniteAire: 'hm',
        facteur: 0.01,
        cotes: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      }, // ex : 5 m = 0,05 hm → aire = 0,0025 hm² (4 déc)
    ]

    const coupleChoisi = choice(couplesUnites)
    const cote = choice(coupleChoisi.cotes)

    this.appliquerLesValeurs(
      cote,
      coupleChoisi.uniteCote,
      coupleChoisi.uniteAire,
      coupleChoisi.facteur,
    )
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
