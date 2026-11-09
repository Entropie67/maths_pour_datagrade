import { tableauColonneLigne } from '../../lib/2d/tableau'
import {
  addDiagramBarAssessment,
  type BarAssessmentMode,
} from '../../lib/customElements/DiagramBarAssessmentElement'
import {
  addDiagramPieAssessment,
  type PieAssessmentMode,
  type PieAssessmentShape,
} from '../../lib/customElements/DiagramPieAssessmentElement'
import {
  lireFormulaireComplexe,
  serialiseFormulaireComplexe,
  valeursParDefaut,
  type FormulaireComplexe,
} from '../../lib/formulaireComplexe'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice, shuffle2tableaux } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import {
  listeQuestionsToContenuSansNumero,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = true
export const dateDePublication = '07/08/2026' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
export const titre = 'Représenter des données par un diagramme'

const leSuperFormulaire: FormulaireComplexe = {
  champs: [
    {
      type: 'selection',
      nom: 'nbEspeces',
      label: 'Nombre de catégories différentes',
      options: [
        { valeur: '1', label: 'Deux catégories' },
        { valeur: '2', label: 'Trois catégories' },
        { valeur: '3', label: 'Quatre catégories' },
      ],
      defaut: '3',
    },
    {
      type: 'selection',
      nom: 'nombres',
      label: 'Valeurs numériques',
      options: [
        { valeur: '1', label: 'Entre 1 et 100' },
        { valeur: '2', label: 'Entre 100 et 1 000' },
      ],
      defaut: '1',
    },
    {
      type: 'selection',
      nom: 'diagramme',
      label: 'Type de diagramme',
      options: [
        { valeur: '1', label: 'Diagramme circulaire' },
        { valeur: '2', label: 'Diagramme semi-circulaire' },
        { valeur: '3', label: 'Diagramme en barres' },
      ],
      defaut: '1',
    },
    {
      type: 'case',
      nom: 'status',
      label: "Avec aide pour l'interactivité (informations dynamiques)",
      defaut: false,
    },
    {
      type: 'case',
      nom: 'melange',
      label: 'Noms des catégories mélangées',
      defaut: false,
    },
    {
      type: 'case',
      nom: 'coloration',
      label: 'Avec de la couleur en version imprimable',
      defaut: false,
    },
  ],
}

/**
 * @author Jean-claude Lhote
 */
export const uuid = 'd3ba7'

export const refs = {
  'fr-fr': ['5D1D-1'],
  'fr-2016': [],
  'fr-ch': ['9R1FA2C-2', '9R2FA2C-2', '9R3FA2C-2', '10CTFA2B-2', '10LCFA2B-2', '10LSFA2B-2', 'PRQST01B-4'],
}

type DiagrammeTheme = {
  entete: string
  unite: string
  effectifFormule: string
  effectifParCategorie: string
  categories: string[]
  lieux: string[]
  introduction: (lieu: string) => string
}

const themesDiagrammes: DiagrammeTheme[] = [
  {
    entete: 'Couleurs',
    unite: 'voitures',
    effectifFormule: 'effectif de la couleur',
    effectifParCategorie: 'nombre de voitures de chaque couleur',
    categories: [
      'blanches',
      'grises',
      'noires',
      'bleues',
      'rouges',
      'vertes',
      'jaunes',
      'beiges',
      'marron',
    ],
    lieux: [
      'de la gare',
      'de la médiathèque',
      'de la piscine municipale',
      'de la salle des fêtes',
      'du centre commercial',
      'du stade',
      'du cinéma',
      'de la zone artisanale',
      "de l'hôpital",
      "de l'université",
    ],
    introduction: (lieu) =>
      `Sur le parking ${lieu}, on relève la couleur des voitures garées.<br> Voici un tableau qui donne le nombre de voitures de quelques couleurs.<br><br>`,
  },
  {
    entete: 'Genres',
    unite: 'livres',
    effectifFormule: 'effectif du genre',
    effectifParCategorie: 'nombre de livres de chaque genre',
    categories: [
      'romans',
      'bandes dessinées',
      'mangas',
      'documentaires',
      'albums',
      'contes',
      'poésies',
      'théâtre',
      'revues',
    ],
    lieux: [
      'à la médiathèque municipale',
      'à la bibliothèque du collège',
      'à la bibliothèque de quartier',
      'à la médiathèque intercommunale',
      'à la bibliothèque centrale',
    ],
    introduction: (lieu) =>
      `On relève les emprunts de livres ${lieu}, selon leur genre.<br> Voici un tableau qui donne le nombre de livres empruntés dans quelques genres.<br><br>`,
  },
  {
    entete: 'Menus',
    unite: 'repas',
    effectifFormule: 'effectif du menu',
    effectifParCategorie: 'nombre de repas de chaque menu',
    categories: [
      'menu classique',
      'menu végétarien',
      'menu poisson',
      'menu salade',
      'menu pâtes',
      'menu sandwich',
      'menu soupe',
      'menu du jour',
      'menu dessert',
    ],
    lieux: [
      'à la cantine du collège',
      'au restaurant universitaire',
      'à la restauration du stade',
      'à la cafétéria municipale',
      "à la cantine de l'entreprise",
    ],
    introduction: (lieu) =>
      `On relève les repas servis ${lieu}, selon le menu choisi.<br> Voici un tableau qui donne le nombre de repas servis pour quelques menus.<br><br>`,
  },
]

function shuffleNumbers(values: number[]): number[] {
  const shuffled = [...values]
  for (let index = shuffled.length - 1; index > 0; index--) {
    const swapIndex = randint(0, index)
    const value = shuffled[index]
    shuffled[index] = shuffled[swapIndex]
    shuffled[swapIndex] = value
  }
  return shuffled
}

function repartitionsPositivesDistinctes(
  total: number,
  nbParts: number,
): number[][] {
  const repartitions: number[][] = []

  function ajoutePart(
    depart: number,
    partsRestantes: number,
    reste: number,
    parts: number[],
  ) {
    if (partsRestantes === 0) {
      if (reste === 0) repartitions.push([...parts])
      return
    }

    for (let valeur = depart; valeur <= reste; valeur++) {
      parts.push(valeur)
      ajoutePart(valeur + 1, partsRestantes - 1, reste - valeur, parts)
      parts.pop()
    }
  }

  ajoutePart(1, nbParts, total, [])
  return repartitions
}

function effectifsBasePourDiagrammeCirculaire(nbAnimaux: number): number[] {
  const candidats = [2, 3, 4, 6, 9, 12, 15].flatMap((denominateur) =>
    repartitionsPositivesDistinctes(denominateur, nbAnimaux).flatMap(
      (parts) => {
        const maxPart = Math.max(...parts)
        const facteurMax = Math.floor(20 / maxPart)
        const facteurMin = Math.ceil(10 / denominateur)
        const repartitions: number[][] = []

        for (let facteur = facteurMin; facteur <= facteurMax; facteur++) {
          const effectifs = parts.map((part) => part * facteur)
          const total = effectifs.reduce(
            (somme, effectif) => somme + effectif,
            0,
          )
          const anglesEntiers = effectifs.every(
            (effectif) =>
              (360 * effectif) % total === 0 && (180 * effectif) % total === 0,
          )
          if (anglesEntiers) repartitions.push(shuffleNumbers(effectifs))
        }

        return repartitions
      },
    ),
  )

  return choice(candidats)
}

function effectifsBasePourDiagrammeEnBarres(nbAnimaux: number): number[] {
  const effectifs = shuffleNumbers(
    Array.from({ length: 30 }, (_value, index) => (index + 1) * 2),
  ).slice(0, nbAnimaux)

  if (Math.max(...effectifs) <= 20) {
    const grandsEffectifs = shuffleNumbers(
      Array.from({ length: 20 }, (_value, index) => (index + 11) * 2),
    )
    const grandEffectif = grandsEffectifs.find(
      (effectif) => !effectifs.includes(effectif),
    )
    if (grandEffectif != null) effectifs[0] = grandEffectif
  }

  return effectifs
}

export default class ConstruireUnDiagramme2 extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireComplexe = leSuperFormulaire
    this.sup = serialiseFormulaireComplexe(
      leSuperFormulaire,
      valeursParDefaut(leSuperFormulaire),
    )

    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
  }

  nouvelleVersion() {
    const params = lireFormulaireComplexe(leSuperFormulaire, this.sup)
    const listeNombreEspeces =
      params.selection('nbEspeces') === '0'
        ? 4
        : Number(params.selection('nbEspeces')) + 1
    const indexValeursNumeriques =
      params.selection('nombres') === '0'
        ? 1
        : Number(params.selection('nombres'))
    const typeDeDiagramme =
      params.selection('diagramme') === '0'
        ? 1
        : Number(params.selection('diagramme'))
    const statusOn = params.case('status')
    const melangeOn = params.case('melange')
    const colorOn = params.case('coloration')

    for (let i = 0; i < this.nbQuestions; i++) {
      let nom
      const contenutableau: string[] = []
      const theme = choice(themesDiagrammes)
      const categoriesExo: string[] = []
      const effectifs: number[] = []

      let texte = theme.introduction(choice(theme.lieux))
      let texteCorr = ''
      const entete = [`\\text{${theme.entete}}`]

      const nbCategories = listeNombreEspeces // nombre de catégories différentes dans l'énoncé

      const effectifsBase =
        typeDeDiagramme === 1 || typeDeDiagramme === 2
          ? effectifsBasePourDiagrammeCirculaire(nbCategories)
          : effectifsBasePourDiagrammeEnBarres(nbCategories)
      const facteurValeurs = indexValeursNumeriques === 1 ? 1 : 10
      effectifs.push(
        ...effectifsBase.map((effectif) => effectif * facteurValeurs),
      )
      let effectiftotal = 0
      for (let k = 0; k < nbCategories; k++) {
        effectiftotal += effectifs[k]
      }
      for (let k = 0; k < nbCategories; k++) {
        nom = choice(theme.categories, categoriesExo) // choisit une catégorie au hasard sauf parmi celles déjà utilisées
        categoriesExo.push(nom)
        entete.push(`\\text{${nom}}`)
      }

      entete.push('\\text{Total}')
      for (let k = 0; k < nbCategories; k++) {
        contenutableau.push(texNombre(effectifs[k], 0))
      }
      contenutableau.push(texNombre(effectiftotal, 0))
      texte += `${tableauColonneLigne(entete, ['\\text{Effectifs}'], contenutableau.map(String))}<br><br>`
      // On mélange les données pour en changer l'ordre (pour tous les cas)
      if (melangeOn) {
        shuffle2tableaux(categoriesExo, effectifs)
      }
      let expectedAnswer: string = ''
      switch (typeDeDiagramme) {
        case 2:
        case 1: {
          // diagramme circulaire
          const shape = typeDeDiagramme === 1 ? 'pie' : 'semi-pie'
          const targetAngle = shape === 'pie' ? 360 : 180
          const emptyValues = {
            items: categoriesExo.map((categorie) =>
              Object.assign(
                {},
                { label: categorie, effectif: null, angle: null },
              ),
            ),
            mode: 'angle' as PieAssessmentMode,
            shape: shape as PieAssessmentShape,
            targetAngle,
            infosStatus: statusOn,
            interactivityOn: this.interactif,
            colorOn,
          }
          const value = {
            items: categoriesExo.map((categorie, index) =>
              Object.assign(
                {},
                {
                  label: categorie,
                  effectif: effectifs[index],
                  angle: (targetAngle * effectifs[index]) / effectiftotal,
                },
              ),
            ),
            mode: 'angle' as PieAssessmentMode,
            shape: shape as PieAssessmentShape,
            targetAngle,
            infosStatus: statusOn,
            interactivityOn: false,
            colorOn,
            correctionOn: true,
          }
          expectedAnswer = JSON.stringify(value)
          texte +=
            'Représenter ces données par un diagramme circulaire.<br><br>' +
            addDiagramPieAssessment(this, i, emptyValues)
          texteCorr = `Pour réaliser le diagramme ${targetAngle === 360 ? 'circulaire' : 'semi-circulaire'}, on calcule l'angle de chaque secteur proportionnellement au ${theme.effectifParCategorie} par rapport à l'effectif total.<br>
          Il y a $${effectiftotal}$ ${theme.unite} au total, donc l'angle de chaque secteur est calculé par la formule :<br>
          $\\text{angle du secteur} = \\dfrac{\\text{${theme.effectifFormule}}}{${effectiftotal}} \\times ${targetAngle}^\\circ$.<br>
          Ce qui donne les angles suivants :<br>
          ${effectifs.map((effectif, index) => `${categoriesExo[index]} : $\\dfrac{${effectif}}{${effectiftotal}}\\times ${targetAngle}^\\circ = ${miseEnEvidence(texNombre((targetAngle * effectif) / effectiftotal, 0))}^\\circ$`).join('<br><br>')}<br>
          On complète le tableau avec les valeurs calculées et on trace les secteurs correspondants :<br><br>${addDiagramPieAssessment(this, i, value)}`

          break
        }
        case 3:
        default: {
          // diagramme en barres
          const valMax = Math.max(...effectifs)
          const unitValue = indexValeursNumeriques === 1 ? 20 : 200

          const emptyValues = {
            unitValue,
            unitLabel: theme.unite,
            yMax: Math.ceil(valMax / unitValue) * unitValue,
            mode: 'hauteur' as BarAssessmentMode,
            infosStatus: statusOn,
            interactivityOn: this.interactif,
            colorOn,
            items: categoriesExo.map((categorie, index) =>
              Object.assign(
                {},
                {
                  label: categorie,
                  effectif: this.interactif ? effectifs[index] : null,
                  height: this.interactif ? effectifs[index] / unitValue : null,
                },
              ),
            ),
          }
          const value = {
            unitValue,
            unitLabel: theme.unite,
            yMax: Math.ceil(valMax / unitValue) * unitValue,
            mode: 'hauteur' as BarAssessmentMode,
            labelValueKind: 'hauteur' as const,
            infosStatus: statusOn,
            interactivityOn: false,
            colorOn,
            correctionOn: true,
            items: categoriesExo.map((categorie, index) =>
              Object.assign(
                {},
                {
                  label: categorie,
                  effectif: effectifs[index],
                  height: effectifs[index] / unitValue,
                },
              ),
            ),
          }
          expectedAnswer = JSON.stringify(value)
          texte +=
            `Représenter ces données par un diagramme en barres (une unité représente ${unitValue} ${theme.unite}).<br><br>` +
            addDiagramBarAssessment(this, i, emptyValues)
          texteCorr = `Pour réaliser le diagramme en barres, on calcule la hauteur de chaque barre proportionnellement au ${theme.effectifParCategorie} par rapport à l'unité choisie.<br>
          Ce qui donne les hauteurs suivantes :<br>
          ${effectifs.map((effectif, index) => `${categoriesExo[index]} : $\\dfrac{${effectif}}{${unitValue}} = ${miseEnEvidence(texNombre(effectif / unitValue, 2))}$ unité${effectif / unitValue > 1 ? 's' : ''}`).join('<br><br>')}<br>
          On complète le tableau avec les valeurs calculées et on trace les barres de hauteurs correspondantes :<br><br>${addDiagramBarAssessment(this, i, value)}`
          break
        }
      }
      handleAnswers(
        this,
        i,
        { reponse: { value: expectedAnswer } },
        {
          formatInteractif:
            typeDeDiagramme === 1 || typeDeDiagramme === 2
              ? 'diagram-pie-assessment'
              : 'diagram-bar-assessment',
        },
      )
      this.listeQuestions.push(texte)
      this.listeCorrections.push(texteCorr)
      listeQuestionsToContenuSansNumero(this) // On envoie l'exercice à la fonction de mise en page
    }
  }
}
