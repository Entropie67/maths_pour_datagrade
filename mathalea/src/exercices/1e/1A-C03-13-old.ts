// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 6cf57 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
// import ExerciceQcmA from '../../ExerciceQcmA'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = '6cf57'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  'Résoudre un problème de hauteur avec une puissance de $10$'
export const dateDePublication = '15/12/2025'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora (avec claude ai)
 *
 */
export default class Auto1AC3mOld extends ExerciceQcmA {
  private appliquerLesValeurs(
    cas: number,
    epaisseurBase: number,
    nbFeuillesPile: number,
  ): void {
    let nbFeuillesReference: number
    let epaisseurValeur: number
    let exposant: number
    let unite: string
    let valeurBonneReponse: number
    let uniteBonneReponse: string
    const mauvaisesReponses: string[] = []

    // Cas 1 : 1 feuille en mm
    if (cas === 1) {
      nbFeuillesReference = 1
      unite = 'mm'
      const format = choice([1, 2])
      if (format === 1) {
        // Format 70×10^-3
        epaisseurValeur = epaisseurBase
        exposant = -3
      } else {
        // Format 7×10^-2
        epaisseurValeur = epaisseurBase / 10
        exposant = -2
      }

      // Calculs pour cas 1
      const epaisseurUneFeuilleEnMm = epaisseurValeur * Math.pow(10, exposant)
      const epaisseurPileEnMm = epaisseurUneFeuilleEnMm * nbFeuillesPile

      // Si nbFeuillesPile = 1000, réponse en mm (60-80 mm)
      // Si nbFeuillesPile = 2000 ou 5000, réponse en cm
      if (nbFeuillesPile === 1000) {
        valeurBonneReponse = epaisseurPileEnMm
        uniteBonneReponse = 'mm'

        // Bonne = 60 mm ou 80 mm (= 6 ou 8 cm) - NE PAS mettre 6 cm ou 8 cm !
        // Erreur 1 : même valeur en cm (60 cm au lieu de 60 mm)
        mauvaisesReponses.push(
          `$${texNombre(valeurBonneReponse, 1)}\\text{ cm}$`,
        )
        // Erreur 2 : virgule décalée ÷10 en mm (6 mm au lieu de 60 mm)
        mauvaisesReponses.push(
          `$${texNombre(valeurBonneReponse / 10, 1)}\\text{ mm}$`,
        )
        // Erreur 3 : virgule décalée ×10 en mm (600 mm au lieu de 60 mm)
        mauvaisesReponses.push(
          `$${texNombre(valeurBonneReponse * 10, 1)}\\text{ mm}$`,
        )
        // Erreur 4 : virgule décalée ×10 en cm (600 cm au lieu de 60 mm)
        mauvaisesReponses.push(
          `$${texNombre(valeurBonneReponse * 10, 1)}\\text{ cm}$`,
        )
        // Erreur 5 : virgule décalée ÷100 en cm (0,6 cm au lieu de 60 mm)
        mauvaisesReponses.push(
          `$${texNombre(valeurBonneReponse / 100, 2)}\\text{ cm}$`,
        )
      } else {
        valeurBonneReponse = epaisseurPileEnMm / 10
        uniteBonneReponse = 'cm'

        // Bonne = 12 cm (= 120 mm) - NE PAS mettre 120 mm !
        // Erreur 1 : même valeur en mm (12 mm au lieu de 12 cm)
        mauvaisesReponses.push(
          `$${texNombre(valeurBonneReponse, 1)}\\text{ mm}$`,
        )
        // Erreur 2 : virgule décalée ÷10 en cm (1,2 cm au lieu de 12 cm)
        mauvaisesReponses.push(
          `$${texNombre(valeurBonneReponse / 10, 1)}\\text{ cm}$`,
        )
        // Erreur 3 : virgule décalée ×10 en cm (120 cm au lieu de 12 cm)
        mauvaisesReponses.push(
          `$${texNombre(valeurBonneReponse * 10, 1)}\\text{ cm}$`,
        )
        // Erreur 4 : virgule décalée ×10 en mm (1200 mm au lieu de 12 cm)
        mauvaisesReponses.push(
          `$${texNombre(epaisseurPileEnMm * 10, 1)}\\text{ mm}$`,
        )
        // Erreur 5 : virgule décalée ×100 en cm (1200 cm au lieu de 12 cm)
        mauvaisesReponses.push(
          `$${texNombre(valeurBonneReponse * 100, 1)}\\text{ cm}$`,
        )
      }
    }
    // Cas 2 : 10 feuilles en mm ou cm
    else if (cas === 2) {
      nbFeuillesReference = 10
      unite = choice(['mm', 'cm'])
      const format = choice([1, 2])

      if (unite === 'mm') {
        if (format === 1) {
          // Format 700×10^-3
          epaisseurValeur = epaisseurBase * 10
          exposant = -3
        } else {
          // Format 70×10^-2
          epaisseurValeur = epaisseurBase
          exposant = -2
        }

        // Calculs pour cas 2 avec mm
        const epaisseur10FeuillesEnMm = epaisseurValeur * Math.pow(10, exposant)
        const epaisseurPileEnMm =
          (epaisseur10FeuillesEnMm * nbFeuillesPile) / 10

        // La bonne réponse sera toujours en cm (car >= 100 mm)
        valeurBonneReponse = epaisseurPileEnMm / 10
        uniteBonneReponse = 'cm'

        // Bonne = 35 cm (= 350 mm) - NE PAS mettre 350 mm !
        // Erreur 1 : même valeur en mm (35 mm au lieu de 35 cm)
        mauvaisesReponses.push(
          `$${texNombre(valeurBonneReponse, 1)}\\text{ mm}$`,
        )
        // Erreur 2 : virgule décalée ÷10 en cm (3,5 cm au lieu de 35 cm)
        mauvaisesReponses.push(
          `$${texNombre(valeurBonneReponse / 10, 1)}\\text{ cm}$`,
        )
        // Erreur 3 : virgule décalée ×10 en cm (350 cm au lieu de 35 cm)
        mauvaisesReponses.push(
          `$${texNombre(valeurBonneReponse * 10, 1)}\\text{ cm}$`,
        )
        // Erreur 4 : virgule décalée ×10 en mm (3500 mm au lieu de 35 cm)
        mauvaisesReponses.push(
          `$${texNombre(epaisseurPileEnMm * 10, 1)}\\text{ mm}$`,
        )
        // Erreur 5 : virgule décalée ×100 en mm (35000 mm au lieu de 35 cm)
        mauvaisesReponses.push(
          `$${texNombre(epaisseurPileEnMm * 100, 1)}\\text{ mm}$`,
        )
      } else {
        // cm
        if (format === 1) {
          // Format 700×10^-4
          epaisseurValeur = epaisseurBase * 10
          exposant = -4
        } else {
          // Format 70×10^-3
          epaisseurValeur = epaisseurBase
          exposant = -3
        }

        // Calculs pour cas 2 avec cm
        const epaisseur10FeuillesEnCm = epaisseurValeur * Math.pow(10, exposant)
        const epaisseurPileEnCm =
          (epaisseur10FeuillesEnCm * nbFeuillesPile) / 10

        // Si nbFeuillesPile = 1000, réponse en mm (60-80 mm)
        // Si nbFeuillesPile = 2000 ou 5000, réponse en cm
        if (nbFeuillesPile === 1000) {
          valeurBonneReponse = epaisseurPileEnCm * 10
          uniteBonneReponse = 'mm'

          // Bonne = 70 mm (= 7 cm) - NE PAS mettre 7 cm !
          // Erreur 1 : même valeur en cm (70 cm au lieu de 70 mm)
          mauvaisesReponses.push(
            `$${texNombre(valeurBonneReponse, 1)}\\text{ cm}$`,
          )
          // Erreur 2 : virgule décalée ÷10 en mm (7 mm au lieu de 70 mm)
          mauvaisesReponses.push(
            `$${texNombre(valeurBonneReponse / 10, 1)}\\text{ mm}$`,
          )
          // Erreur 3 : virgule décalée ×10 en mm (700 mm au lieu de 70 mm)
          mauvaisesReponses.push(
            `$${texNombre(valeurBonneReponse * 10, 1)}\\text{ mm}$`,
          )
          // Erreur 4 : virgule décalée ×10 en cm (700 cm au lieu de 70 mm)
          mauvaisesReponses.push(
            `$${texNombre(valeurBonneReponse * 10, 1)}\\text{ cm}$`,
          )
          // Erreur 5 : virgule décalée ×100 en mm (7000 mm au lieu de 70 mm)
          mauvaisesReponses.push(
            `$${texNombre(valeurBonneReponse * 100, 1)}\\text{ mm}$`,
          )
        } else {
          valeurBonneReponse = epaisseurPileEnCm
          uniteBonneReponse = 'cm'

          // Bonne = 14 cm (= 140 mm) - NE PAS mettre 140 mm !
          // Erreur 1 : même valeur en mm (14 mm au lieu de 14 cm)
          mauvaisesReponses.push(
            `$${texNombre(valeurBonneReponse, 1)}\\text{ mm}$`,
          )
          // Erreur 2 : virgule décalée ÷10 en cm (1,4 cm au lieu de 14 cm)
          mauvaisesReponses.push(
            `$${texNombre(valeurBonneReponse / 10, 1)}\\text{ cm}$`,
          )
          // Erreur 3 : virgule décalée ×10 en cm (140 cm au lieu de 14 cm)
          mauvaisesReponses.push(
            `$${texNombre(valeurBonneReponse * 10, 1)}\\text{ cm}$`,
          )
          // Erreur 4 : virgule décalée ×100 en mm (1400 mm au lieu de 14 cm)
          mauvaisesReponses.push(
            `$${texNombre(valeurBonneReponse * 100, 1)}\\text{ mm}$`,
          )
          // Erreur 5 : virgule décalée ÷100 en cm (0,14 cm au lieu de 14 cm)
          mauvaisesReponses.push(
            `$${texNombre(valeurBonneReponse / 100, 2)}\\text{ cm}$`,
          )
        }
      }
    }
    // Cas 3 : 100 feuilles en cm
    else {
      nbFeuillesReference = 100
      unite = 'cm'
      const format = choice([1, 2])
      if (format === 1) {
        // Format 7000×10^-4
        epaisseurValeur = epaisseurBase * 100
        exposant = -4
      } else {
        // Format 700×10^-3
        epaisseurValeur = epaisseurBase * 10
        exposant = -3
      }

      // Calculs pour cas 3
      const epaisseur100FeuillesEnCm = epaisseurValeur * Math.pow(10, exposant)
      const epaisseurPileEnCm =
        (epaisseur100FeuillesEnCm * nbFeuillesPile) / 100

      // La réponse reste toujours en cm pour ce cas
      valeurBonneReponse = epaisseurPileEnCm
      uniteBonneReponse = 'cm'

      // Bonne = 35 cm (= 350 mm) - NE PAS mettre 350 mm !
      // Erreur 1 : même valeur en mm (35 mm au lieu de 35 cm)
      mauvaisesReponses.push(`$${texNombre(valeurBonneReponse, 1)}\\text{ mm}$`)
      // Erreur 2 : virgule décalée ÷10 en cm (3,5 cm au lieu de 35 cm)
      mauvaisesReponses.push(
        `$${texNombre(valeurBonneReponse / 10, 1)}\\text{ cm}$`,
      )
      // Erreur 3 : virgule décalée ×10 en cm (350 cm au lieu de 35 cm)
      mauvaisesReponses.push(
        `$${texNombre(valeurBonneReponse * 10, 1)}\\text{ cm}$`,
      )
      // Erreur 4 : virgule décalée ×100 en mm (3500 mm au lieu de 35 cm)
      mauvaisesReponses.push(
        `$${texNombre(valeurBonneReponse * 100, 1)}\\text{ mm}$`,
      )
      // Erreur 5 : virgule décalée ÷100 en cm (0,35 cm au lieu de 35 cm)
      mauvaisesReponses.push(
        `$${texNombre(valeurBonneReponse / 100, 2)}\\text{ cm}$`,
      )
      // Erreur 6 : virgule décalée ×1000 en mm (35000 mm au lieu de 35 cm)
      mauvaisesReponses.push(
        `$${texNombre(valeurBonneReponse * 1000, 1)}\\text{ mm}$`,
      )
    }

    // Calculer epaisseurPileDecimale pour la correction
    const epaisseurUneFeuilleEnUnite =
      (epaisseurValeur * Math.pow(10, exposant)) / nbFeuillesReference
    const epaisseurPileDecimale = epaisseurUneFeuilleEnUnite * nbFeuillesPile

    // Énoncé
    const texteReference =
      nbFeuillesReference === 1
        ? "d'une feuille"
        : `de $${texNombre(nbFeuillesReference)}$ feuilles`

    this.enonce = `L'épaisseur ${texteReference} de papier est égale à $${texNombre(epaisseurValeur)} \\times 10^{${exposant}}$ ${unite}.<br>`
    this.enonce += `L'épaisseur d'une pile de $${texNombre(nbFeuillesPile)}$ feuilles est égale à :`

    const bonneReponse = `$${texNombre(valeurBonneReponse, 1)}\\text{ ${uniteBonneReponse}}$`

    // Sélection de 3 mauvaises réponses différentes
    const mauvaisesList = shuffle(mauvaisesReponses).slice(0, 3)

    // Calcul pour la correction (avec notation scientifique intermédiaire)
    const epaisseurPileScientifique =
      (epaisseurValeur * nbFeuillesPile) / nbFeuillesReference
    let epaisseurPileValeur = epaisseurPileScientifique
    let exposantPile = exposant

    // Normaliser en notation scientifique
    while (epaisseurPileValeur >= 10) {
      epaisseurPileValeur /= 10
      exposantPile += 1
    }

    // Correction
    this.correction =
      `L'épaisseur ${texteReference} est $${texNombre(epaisseurValeur)} \\times 10^{${exposant}}$ ${unite}.<br>` +
      `Pour $${texNombre(nbFeuillesPile)}$ feuilles, il faut multiplier par $${texNombre(nbFeuillesPile / nbFeuillesReference)}$.<br>` +
      `L'épaisseur de la pile en $\\textbf{${unite}}$ est donc : <br>` +
      `$\\begin{aligned}` +
      `${texNombre(epaisseurValeur)} \\times ${texNombre(nbFeuillesPile / nbFeuillesReference, 0)} \\times 10^{${exposant}}` +
      `&=${texNombre(epaisseurPileScientifique)} \\times 10^{${exposant}}\\\\` +
      `&=${texNombre(epaisseurPileValeur, 2)} \\times 10^{${exposantPile}} \\\\` +
      `&=${texNombre(epaisseurPileDecimale, 2)}` +
      `\\end{aligned}$<br>` +
      `L'épaisseur de la pile est donc de $${miseEnEvidence(`${texNombre(valeurBonneReponse, 1)} \\text{ ${uniteBonneReponse}}`)}$.`

    this.reponses = [
      bonneReponse,
      mauvaisesList[0],
      mauvaisesList[1],
      mauvaisesList[2],
    ]
  }

  versionOriginale: () => void = () => {
    // Version originale de l'image : 70×10⁻³ mm pour 1 feuille, pile de 2000 feuilles
    // Calcul : 70×10⁻³ × 2000 = 140 mm = 14 cm

    const epaisseurValeur = 70
    const exposant = -3
    const unite = 'mm'

    const nbFeuillesPile = 2000

    // Calcul
    const epaisseurUneFeuilleEnMm = epaisseurValeur * Math.pow(10, exposant) // 0,07 mm
    const epaisseurPileEnMm = epaisseurUneFeuilleEnMm * nbFeuillesPile // 140 mm
    const valeurBonneReponse = epaisseurPileEnMm / 10 // 14 cm
    const uniteBonneReponse = 'cm'

    // Énoncé
    this.enonce = `L'épaisseur d'une feuille de papier est égale à $${texNombre(epaisseurValeur)} \\times 10^{${exposant}}$ ${unite}.<br>`
    this.enonce += `L'épaisseur d'une pile de $${texNombre(nbFeuillesPile)}$ feuilles est égale à :`

    // Réponses exactes de l'image
    const bonneReponse = `$14$ cm` // 14 cm (bonne réponse c)
    const dist1 = `$140$ cm` // 140 cm (choix a)
    const dist2 = `$14$ mm` // 14 mm (choix b)
    const dist3 = `$72$ cm` // 72 cm (choix d)

    // Correction
    this.correction =
      `L'épaisseur d'une feuille est $${texNombre(epaisseurValeur)} \\times 10^{${exposant}}$ ${unite}.<br>` +
      `Pour $${texNombre(nbFeuillesPile)}$ feuilles, il faut multiplier par $${texNombre(nbFeuillesPile)}$.<br>` +
      `L'épaisseur de la pile en $\\textbf{${unite}}$ est donc : <br>` +
      `$\\begin{aligned}` +
      `${texNombre(epaisseurValeur)} \\times ${texNombre(nbFeuillesPile)} \\times 10^{${exposant}}` +
      `&=${texNombre(epaisseurValeur * nbFeuillesPile)} \\times 10^{${exposant}}\\\\` +
      `&=${texNombre(14)} \\times 10^{1} \\\\` +
      `&=${texNombre(epaisseurPileEnMm)}` +
      `\\end{aligned}$<br>` +
      `L'épaisseur de la pile est donc de $${miseEnEvidence(`${texNombre(valeurBonneReponse)} \\text{ ${uniteBonneReponse}}`)}$.`

    this.reponses = [
      bonneReponse, // 14 cm (bonne réponse)
      dist1, // 140 cm
      dist2, // 14 mm
      dist3, // 72 cm
    ]
  }

  versionAleatoire: () => void = () => {
    // Cas : 1 (1 feuille), 2 (10 feuilles), 3 (100 feuilles)
    const cas = randint(1, 3)

    // Épaisseur de base : entre 60 et 80
    const epaisseurBase = choice([60, 70, 80])

    // Nombre de feuilles dans la pile : 1000, 2000 ou 5000
    const nbFeuillesPile = choice([1000, 2000, 5000])

    this.appliquerLesValeurs(cas, epaisseurBase, nbFeuillesPile)
  }

  constructor() {
    super()
    this.tip = `
  <p style="margin: 0 0 10px 0;">
    Il faut bien identifier les informations utiles.
  </p>
  <ul style="list-style-type: disc; padding-left: 1.5em; margin: 0 0 14px 0; line-height: 2;">
    <li>Repérer à quoi correspond l'épaisseur donnée : une feuille, dix feuilles ou cent feuilles.</li>
    <li>Identifier l'unité de l'épaisseur donnée.</li>
    <li>Repérer le nombre de feuilles dans la pile à calculer.</li>
    <li>Identifier l'unité attendue pour la réponse.</li>
  </ul>
  <p style="margin: 0;">
   Faire un tableau de conversion si besoin.
  </p>`
    this.versionAleatoire()
  }
}
