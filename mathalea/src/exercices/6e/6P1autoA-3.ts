import type { TableauHybrideCell } from '../../lib/customElements/TableauHybride'
import { creeTableauHybrideElement } from '../../lib/customElements/TableauHybride'
import { deuxColonnesResp } from '../../lib/format/miseEnPage'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { toutAUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
  texteGras,
} from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import {
  buildDoubleEntryTable,
  buildSimpleTable,
  type DoubleEntryTable,
  type SimpleTable,
} from './6P1autoA-2'

export const titre = 'Compléter un tableau à partir d’informations'
export const interactifReady = true
export const dateDePublication = '23/08/2026'
export const uuid = 'b74c8'

export const refs = {
  'fr-fr': ['6P1autoA-3', '6AutoS1-4'],
  'fr-2016': ['6S13-1'],
  'fr-ch': ['9R1FA2A-2', '9R2FA2A-2', '9R3FA2A-2', 'PRQST01A-4'],
}

function celluleTexte(
  texte: string | number,
  header = false,
): TableauHybrideCell {
  return { type: 'text', texte, header }
}

function celluleMathfield(
  id: string,
  value: string | number,
): TableauHybrideCell {
  return {
    type: 'mathfield',
    id,
    value,
    keyboard: KeyboardType.clavierNumbers,
    minWidth: 32,
  }
}

function celluleListe(
  id: string,
  choices: string[],
  value: string | number,
): TableauHybrideCell {
  return {
    type: 'select',
    id,
    value,
    choix0: true,
    choices: [
      { label: 'Choisir', value: '' },
      ...choices.map((value) => ({ label: value, value })),
    ],
  }
}

function relationEcart(
  cible: string,
  valeurCible: number,
  reference: string,
  valeurReference: number,
) {
  const ecart = Math.abs(valeurCible - valeurReference)
  if (valeurCible >= valeurReference) {
    return `La valeur de ${cible} est celle de ${reference} augmentée de $${ecart}$.`
  }
  return `La valeur de ${cible} est celle de ${reference} diminuée de $${ecart}$.`
}

function correctionRelationEcart(
  cible: string,
  valeurCible: number,
  reference: string,
  valeurReference: number,
) {
  const ecart = Math.abs(valeurCible - valeurReference)
  const operation =
    valeurCible >= valeurReference
      ? `${valeurReference}+${ecart}`
      : `${valeurReference}-${ecart}`
  return `Pour ${cible}, à partir de la valeur de ${reference}, on calcule $${operation}=${miseEnEvidence(valeurCible)}$.`
}

function enonceDouble(table: DoubleEntryTable) {
  return table.lignes
    .flatMap((ligne, indexLigne) =>
      table.colonnes.map((colonne, indexColonne) => {
        const valeur = table.valeurs[indexLigne][indexColonne]
        if (table.titre.includes('emploi')) {
          return `Le ${colonne.toLowerCase()} de ${ligne}, on a ${valeur}.`
        }
        return `${ligne} ont marqué $${valeur}$ au ${colonne}.`
      }),
    )
    .join('<br>')
}

type CelluleDouble = {
  ligne: number
  colonne: number
  valeur: string
}

const matieresEmploiDuTemps = [
  'Mathématiques',
  'Français',
  'Anglais',
  'SVT',
  'Histoire-Géo',
  'EPS',
  'Technologie',
  'Arts plastiques',
  'Musique',
]

function preparationSimple(table: SimpleTable) {
  const colonnesEnonce = table.colonnesEnonce ?? table.colonnes
  const indexPrefilled = randint(0, table.valeurs.length - 1)
  const indicesACompleter = table.valeurs
    .map((_valeur, index) => index)
    .filter((index) => index !== indexPrefilled)
  const indexDirect = choice(indicesACompleter)
  const affirmations: string[] = [
    `La valeur de ${colonnesEnonce[indexPrefilled]} est déjà indiquée dans le tableau.`,
  ]
  const corrections: string[] = []

  affirmations.push(
    `Pour ${colonnesEnonce[indexDirect]}, la valeur est $${table.valeurs[indexDirect]}$.`,
  )

  const indexTotal = table.colonnes.indexOf('Total')
  const indicesRestants = indicesACompleter.filter(
    (index) => index !== indexDirect,
  )
  const indexSomme = indicesRestants.find((index) => index !== indexTotal)
  if (indexSomme != null) {
    indicesRestants.splice(indicesRestants.indexOf(indexSomme), 1)
  }
  if (indexSomme != null) {
    const somme = table.valeurs[indexPrefilled] + table.valeurs[indexSomme]
    affirmations.push(
      `La somme des valeurs de ${colonnesEnonce[indexPrefilled]} et de ${colonnesEnonce[indexSomme]} est $${somme}$.`,
    )
    corrections.push(
      `Pour ${colonnesEnonce[indexSomme]}, on calcule $${somme}-${table.valeurs[indexPrefilled]}=${miseEnEvidence(table.valeurs[indexSomme])}$.`,
    )
  }
  for (const index of indicesRestants) {
    if (index === indexTotal) continue
    affirmations.push(
      relationEcart(
        colonnesEnonce[index],
        table.valeurs[index],
        colonnesEnonce[indexPrefilled],
        table.valeurs[indexPrefilled],
      ),
    )
    corrections.push(
      correctionRelationEcart(
        colonnesEnonce[index],
        table.valeurs[index],
        colonnesEnonce[indexPrefilled],
        table.valeurs[indexPrefilled],
      ),
    )
  }
  if (indexTotal !== -1 && indexTotal !== indexPrefilled) {
    affirmations.push(
      `La colonne Total contient la somme de toutes les autres valeurs du tableau.`,
    )
    const valeursSansTotal = table.valeurs.filter(
      (_valeur, index) => index !== indexTotal,
    )
    if (indexTotal === indexDirect) {
      corrections.push(
        `On peut vérifier le Total : $${valeursSansTotal.join('+')}=${table.valeurs[indexTotal]}$.`,
      )
    } else {
      corrections.push(
        `Pour la colonne Total, on calcule $${valeursSansTotal.join('+')}=${miseEnEvidence(table.valeurs[indexTotal])}$.`,
      )
    }
  }

  return {
    enonce: affirmations.join('<br>'),
    tableau: {
      rows: [
        [
          celluleTexte(table.entete, true),
          ...table.colonnes.map((colonne) => celluleTexte(colonne, true)),
        ],
        [
          celluleTexte(table.ligne, true),
          ...table.valeurs.map((valeur, index) =>
            index === indexPrefilled
              ? celluleTexte(valeur)
              : celluleMathfield(`L1C${index + 1}`, valeur),
          ),
        ],
      ],
    },
    correction: corrections.join('<br>'),
    reponses: Object.fromEntries(
      indicesACompleter.map((index) => [
        `L1C${index + 1}`,
        { value: table.valeurs[index] },
      ]),
    ),
    indexPrefilled,
  }
}

function tableauDoubleATrous(table: DoubleEntryTable) {
  const isEmploiDuTemps = table.titre.includes('emploi')
  const choices = Array.from(
    new Set(table.valeurs.flat().map((valeur) => String(valeur))),
  )
  return {
    rows: [
      [
        celluleTexte(table.enteteLigne, true),
        ...table.colonnes.map((colonne) => celluleTexte(colonne, true)),
      ],
      ...table.lignes.map((ligne, indexLigne) => [
        celluleTexte(ligne, true),
        ...table.colonnes.map((_colonne, indexColonne) =>
          isEmploiDuTemps
            ? celluleListe(
                `L${indexLigne + 1}C${indexColonne + 1}`,
                choices,
                table.valeurs[indexLigne][indexColonne],
              )
            : celluleMathfield(
                `L${indexLigne + 1}C${indexColonne + 1}`,
                table.valeurs[indexLigne][indexColonne],
              ),
        ),
      ]),
    ],
  }
}

function reponsesTableauDouble(
  table: DoubleEntryTable,
  cellulesACompleter?: CelluleDouble[],
) {
  if (cellulesACompleter != null) {
    return Object.fromEntries(
      cellulesACompleter.map(({ ligne, colonne, valeur }) => [
        `L${ligne + 1}C${colonne + 1}`,
        { value: valeur },
      ]),
    )
  }
  return Object.fromEntries(
    table.valeurs.flatMap((ligne, indexLigne) =>
      ligne.map((valeur, indexColonne) => [
        `L${indexLigne + 1}C${indexColonne + 1}`,
        { value: String(valeur) },
      ]),
    ),
  )
}

function baremeParLigne(nbColonnes: number) {
  return (listePoints: number[]) => {
    let nbLignesJustes = 0
    for (let index = 0; index < listePoints.length; index += nbColonnes) {
      const pointsLigne = listePoints.slice(index, index + nbColonnes)
      if (
        pointsLigne.length === nbColonnes &&
        pointsLigne.every((point) => point === 1)
      ) {
        nbLignesJustes++
      }
    }
    return [nbLignesJustes, Math.floor(listePoints.length / nbColonnes)] as [
      number,
      number,
    ]
  }
}

function horaireEnTexte(horaire: string) {
  return horaire.replace(' - ', ' à ')
}

function unCoursDe(matiere: string) {
  return /^[AEIOUYÉÈÊÀÂÎÏÔŒ]/i.test(matiere)
    ? `un cours d'${matiere}`
    : `un cours de ${matiere}`
}

function preparationEmploiDuTemps(table: DoubleEntryTable) {
  const colonnesChoisies = shuffle(
    table.colonnes.map((_colonne, index) => index),
  ).slice(0, 2)
  const lignesChoisies = shuffle(table.lignes.map((_ligne, index) => index))
  const cellulesACompleter = colonnesChoisies.flatMap(
    (colonne, indexColonneChoisie) =>
      [0, 1].map((offset) => {
        const ligne = lignesChoisies[indexColonneChoisie * 2 + offset]
        return {
          ligne,
          colonne,
          valeur: String(table.valeurs[ligne][colonne]),
        }
      }),
  )

  const affirmations: string[] = []
  const corrections: string[] = []
  for (let index = 0; index < cellulesACompleter.length; index += 2) {
    const premiere = cellulesACompleter[index]
    const seconde = cellulesACompleter[index + 1]
    const jour = table.colonnes[premiere.colonne]
    const horairePremiere = table.lignes[premiere.ligne]
    const horaireSeconde = table.lignes[seconde.ligne]

    affirmations.push(`${unCoursDe(premiere.valeur)} a lieu le ${jour}.`)
    affirmations.push(
      `${unCoursDe(seconde.valeur)} a lieu de ${horaireEnTexte(horaireSeconde)}.`,
    )
    corrections.push(
      `Dans la colonne ${jour}, deux cases sont à compléter : ${horairePremiere} et ${horaireSeconde}.`,
    )
    corrections.push(
      `Comme ${unCoursDe(seconde.valeur)} a lieu de ${horaireEnTexte(horaireSeconde)}, on place ${texteEnCouleurEtGras(seconde.valeur)} sur cette ligne.`,
    )
    corrections.push(
      `Il reste donc la case de ${horairePremiere} dans la colonne ${jour} : on y place ${texteEnCouleurEtGras(premiere.valeur)}.`,
    )
  }

  const idsACompleter = new Set(
    cellulesACompleter.map(
      ({ ligne, colonne }) => `L${ligne + 1}C${colonne + 1}`,
    ),
  )
  const choix = shuffle(matieresEmploiDuTemps)

  if (cellulesACompleter.length === 0) {
    return undefined
  }

  return {
    enonce: affirmations.join('<br>'),
    tableau: {
      rows: [
        [
          celluleTexte(table.enteteLigne, true),
          ...table.colonnes.map((colonne) => celluleTexte(colonne, true)),
        ],
        ...table.lignes.map((ligne, indexLigne) => [
          celluleTexte(ligne, true),
          ...table.colonnes.map((_colonne, indexColonne) => {
            const id = `L${indexLigne + 1}C${indexColonne + 1}`
            const valeur = table.valeurs[indexLigne][indexColonne]
            return idsACompleter.has(id)
              ? celluleListe(id, choix, valeur)
              : celluleTexte(valeur)
          }),
        ]),
      ],
    },
    correction: corrections.join('<br>'),
    reponses: reponsesTableauDouble(table, cellulesACompleter),
  }
}

const matchsParTour = [
  [
    [0, 1],
    [2, 3],
  ],
  [
    [0, 2],
    [1, 3],
  ],
  [
    [0, 3],
    [1, 2],
  ],
] as const

function preparationTournoi(table: DoubleEntryTable) {
  const valeursAvecTotal = table.valeurs.map((ligne) => [
    ...ligne,
    ligne.map(Number).reduce((somme, valeur) => somme + valeur, 0),
  ])
  const colonnesAvecTotal = [...table.colonnes, 'Total']
  const enonce = matchsParTour
    .map((matchs, indexTour) => {
      const lignesMatchs = matchs
        .map(([indexEquipeA, indexEquipeB]) => {
          const equipeA = table.lignes[indexEquipeA]
          const equipeB = table.lignes[indexEquipeB]
          return `${equipeA} / ${equipeB} : $${table.valeurs[indexEquipeA][indexTour]}$ / $${table.valeurs[indexEquipeB][indexTour]}$`
        })
        .join('<br>')
      return `${texteGras(table.colonnes[indexTour])}<br>${lignesMatchs}`
    })
    .join('<br>')
  const calculsTotaux = table.lignes
    .map((equipe, indexEquipe) => {
      const scores = table.valeurs[indexEquipe].map((valeur) => Number(valeur))
      const total = valeursAvecTotal[indexEquipe][colonnesAvecTotal.length - 1]
      return `${equipe} : $${scores.join('+')}=${miseEnEvidence(total)}$.`
    })
    .join('<br>')

  return {
    enonce,
    tableau: {
      rows: [
        [
          celluleTexte(table.enteteLigne, true),
          ...colonnesAvecTotal.map((colonne) => celluleTexte(colonne, true)),
        ],
        ...table.lignes.map((ligne, indexLigne) => [
          celluleTexte(ligne, true),
          ...valeursAvecTotal[indexLigne].map((valeur, indexColonne) =>
            celluleMathfield(`L${indexLigne + 1}C${indexColonne + 1}`, valeur),
          ),
        ]),
      ],
    },
    correction: [
      'On reporte, pour chaque tour, le score de chaque équipe sur sa ligne.',
      calculsTotaux,
    ].join('<br>'),
    reponses: Object.fromEntries(
      valeursAvecTotal.flatMap((ligne, indexLigne) =>
        ligne.map((valeur, indexColonne) => [
          `L${indexLigne + 1}C${indexColonne + 1}`,
          { value: String(valeur) },
        ]),
      ),
    ),
  }
}

function preparationDouble(table: DoubleEntryTable) {
  if (table.titre.includes('emploi')) {
    return (
      preparationEmploiDuTemps(table) ?? {
        enonce: enonceDouble(table),
        tableau: tableauDoubleATrous(table),
        correction: '',
        reponses: reponsesTableauDouble(table),
      }
    )
  }
  if (table.titre.includes('tournoi')) return preparationTournoi(table)
  return {
    enonce: enonceDouble(table),
    tableau: tableauDoubleATrous(table),
    correction: '',
    reponses: reponsesTableauDouble(table),
  }
}

export default class CompleterTableauInformations extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      3,
      '1 : Tableau simple\n2 : Tableau à double entrée\n3 : Mélange',
    ]
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.sup = 3
    this.spacing = 2
    this.spacingCorr = 2
  }

  nouvelleVersion() {
    const niveau = this.sup === 3 ? choice([1, 2]) : Number(this.sup)
    const table = niveau === 1 ? buildSimpleTable() : buildDoubleEntryTable()
    const preparationSimpleTable =
      table.type === 'simple' ? preparationSimple(table) : undefined
    const preparationDoubleTable =
      table.type === 'double' ? preparationDouble(table) : undefined
    const tableauATrous =
      preparationSimpleTable?.tableau ?? preparationDoubleTable!.tableau
    this.consigne = 'Compléter le tableau à partir des informations données.'
    const enonce =
      table.type === 'simple'
        ? preparationSimpleTable!.enonce
        : preparationDoubleTable!.enonce
    const bareme =
      table.type === 'double' && table.enteteColonne === 'Tour'
        ? baremeParLigne(table.colonnes.length + 1)
        : toutAUnPoint
    const estTournoi = table.type === 'double' && table.enteteColonne === 'Tour'
    const tableauEnonce = creeTableauHybrideElement({
      numeroExercice: this.numeroExercice ?? 0,
      questionIndex: 0,
      tableau: tableauATrous,
      interactivityOn: this.interactif,
    })
    const tableauCorrection = creeTableauHybrideElement({
      numeroExercice: this.numeroExercice ?? 0,
      questionIndex: 0,
      tableau: tableauATrous,
      interactivityOn: false,
      correctionOn: true,
    })
    const texte = [
      `${texteGras(table.titre)}<br>`,
      `${table.introduction}<br>`,
      estTournoi
        ? deuxColonnesResp(enonce, tableauEnonce, {
            largeur1: 40,
            widthmincol1: '100px',
            widthmincol2: '250px',
          })
        : [enonce, '<br>', tableauEnonce].join(''),
    ].join('')
    const detailsCorrection = [
      preparationSimpleTable?.correction,
      preparationDoubleTable?.correction,
    ]
      .filter((element) => element != null && element !== '')
      .join('<br>')
    const texteCorr = estTournoi
      ? deuxColonnesResp(detailsCorrection, tableauCorrection, {
          largeur1: 40,
          widthmincol1: '100px',
          widthmincol2: '250px',
        })
      : [
          detailsCorrection,
          'Le tableau complété est le suivant.',
          tableauCorrection,
        ]
          .filter((element) => element != null && element !== '')
          .join('<br>')

    handleAnswers(
      this,
      0,
      {
        bareme,
        ...(preparationSimpleTable?.reponses ??
          preparationDoubleTable!.reponses),
      },
      { formatInteractif: 'tableau-hybride' },
    )

    this.listeQuestions[0] = texte
    this.listeCorrections[0] = texteCorr
    listeQuestionsToContenu(this)
  }
}
