import { sp } from './outilString'
import type { TestCellDatas } from '../types'
import { randint } from '../../modules/outils'
import { choice, shuffle } from './arrayOutils'
import { decaleFormule, texteAffiche, type Cellules } from './tableurFormules'

/**
 * Situations de tableur dans lesquelles on doit saisir, juger ou corriger une
 * formule de calcul (exercices PET12, PET13 et PET14).
 */
export type ScenarioTableur = {
  numero: number
  intro: string
  /** Contenu de la feuille avant la saisie (en-têtes, données, totaux…). */
  cellules: Cellules
  nbColonnes: number
  nbLignes: number
  largeurs: number[]
  /** Première cellule dans laquelle la formule est saisie, ex. `'D2'`. */
  cible: string
  /** Nombre de cellules situées sous la cible où la formule est recopiée. */
  nbRecopies: number
  /** Objectif de la formule (complète « afin de … »). */
  but: string
  formuleJuste: string
  /** Formules justes équivalentes à `formuleJuste` (elle comprise). */
  formulesJustes: string[]
  erreurs: { formule: string; explication: string }[]
  /** Cellules de données à faire varier pour tester une formule saisie. */
  testes: TestCellDatas[]
  /** Le résultat n'est juste après recopie que si un `$` est bien placé. */
  dependDuDollar: boolean
}

export const LIBELLES_SCENARIOS = [
  'Prix total (produit de deux cellules)',
  'Prix après une remise en pourcentage',
  'Moyenne de deux notes',
  "Périmètre d'un rectangle",
  'Pourcentage par rapport à un total',
  'Prix TTC avec un taux de TVA fixe',
  "Somme d'une colonne",
  "Hypoténuse d'un triangle rectangle",
]

export const NB_SCENARIOS = LIBELLES_SCENARIOS.length

const MOIS = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
]

/** Références des cellules de la colonne de la cible concernées par la formule. */
export function cellulesCible(s: ScenarioTableur): string[] {
  const colonne = s.cible.replace(/\d+/, '')
  const ligne = Number(s.cible.replace(/\D+/, ''))
  return Array.from(
    { length: s.nbRecopies + 1 },
    (_, k) => `${colonne}${ligne + k}`,
  )
}

/** Formule saisie dans la cible puis recopiée vers le bas (références décalées). */
export function formulesRecopiees(
  s: ScenarioTableur,
  formule: string,
): string[] {
  return cellulesCible(s).map((_, k) => decaleFormule(formule, 0, k))
}

/** La feuille du scénario complétée par la formule dans toutes les cellules cibles. */
export function cellulesAvecFormule(
  s: ScenarioTableur,
  formule: string,
): Cellules {
  const cellules: Cellules = { ...s.cellules }
  const refs = cellulesCible(s)
  formulesRecopiees(s, formule).forEach((f, k) => {
    cellules[refs[k]] = f
  })
  return cellules
}

/** Valeurs affichées dans les cellules cibles pour une formule donnée. */
export function valeursCible(
  s: ScenarioTableur,
  formule: string,
): (string | number)[] {
  const cellules = cellulesAvecFormule(s, formule)
  return cellulesCible(s).map((ref) => texteAffiche(cellules, ref))
}

/** Les deux formules affichent-elles les mêmes valeurs dans la feuille du scénario ? */
export function memesResultats(
  s: ScenarioTableur,
  f1: string,
  f2: string,
): boolean {
  const v1 = valeursCible(s, f1)
  const v2 = valeursCible(s, f2)
  return v1.every((v, k) =>
    typeof v === 'number' && typeof v2[k] === 'number'
      ? Math.abs(v - v2[k]) < 1e-9
      : v === v2[k],
  )
}

function creeBrouillon(numero: number): ScenarioTableur {
  switch (numero) {
    case 1: {
      const nb = randint(3, 5)
      const articles = shuffle([
        'Cahier',
        'Stylo',
        'Classeur',
        'Règle',
        'Gomme',
        'Compas',
        'Équerre',
        'Trousse',
      ]).slice(0, nb)
      const cellules: Cellules = {
        A1: 'Article',
        B1: 'Quantité',
        C1: 'Prix unitaire (€)',
        D1: 'Prix à payer (€)',
      }
      articles.forEach((a, k) => {
        cellules[`A${k + 2}`] = a
        cellules[`B${k + 2}`] = randint(2, 12)
        cellules[`C${k + 2}`] = randint(2, 15)
      })
      return {
        numero,
        intro: 'Un tableur est utilisé pour gérer une commande de fournitures.',
        cellules,
        nbColonnes: 4,
        nbLignes: nb + 1,
        largeurs: [110, 90, 130, 130],
        cible: 'D2',
        nbRecopies: nb - 1,
        but: 'calculer le prix à payer pour chaque article',
        formuleJuste: '=B2*C2',
        formulesJustes: ['=B2*C2', '=C2*B2'],
        erreurs: [
          {
            formule: '=B2+C2',
            explication:
              'elle additionne la quantité et le prix unitaire au lieu de les multiplier',
          },
          {
            formule: '=B2*C3',
            explication:
              "elle multiplie la quantité par le prix unitaire de l'article de la ligne suivante",
          },
          {
            formule: '=B2C2',
            explication:
              "il manque l'opérateur $*$ entre les deux références, le tableur ne comprend pas la formule",
          },
          {
            formule: 'B2*C2',
            explication:
              'elle ne commence pas par le signe $=$, le tableur affiche donc du texte et ne calcule rien',
          },
          {
            formule: '=$B$2*C2',
            explication:
              'le signe $\\$$ bloque la cellule B2 : une fois la cellule étirée vers le bas, la formule utilise toujours la quantité de la première ligne',
          },
        ],
        testes: [{ ref: `B2:C${nb + 1}`, rangeValues: [1, 20] }],
        dependDuDollar: false,
      }
    }
    case 2: {
      const nb = randint(3, 5)
      const articles = shuffle([
        'Manteau',
        'Pull',
        'Pantalon',
        'Chemise',
        'Chaussures',
        'Veste',
        'Écharpe',
      ]).slice(0, nb)
      const cellules: Cellules = {
        A1: 'Article',
        B1: 'Prix initial (€)',
        C1: 'Remise (%)',
        D1: 'Prix soldé (€)',
      }
      articles.forEach((a, k) => {
        cellules[`A${k + 2}`] = a
        cellules[`B${k + 2}`] = 20 * randint(1, 9)
        cellules[`C${k + 2}`] = choice([10, 20, 25, 50])
      })
      return {
        numero,
        intro:
          'Un magasin utilise un tableur pour calculer le prix de ses articles pendant les soldes.',
        cellules,
        nbColonnes: 4,
        nbLignes: nb + 1,
        largeurs: [110, 120, 100, 120],
        cible: 'D2',
        nbRecopies: nb - 1,
        but: 'calculer le prix soldé de chaque article, la remise étant un pourcentage du prix initial',
        formuleJuste: '=B2*(100-C2)/100',
        formulesJustes: ['=B2*(100-C2)/100', '=B2-B2*C2/100', '=B2*(1-C2/100)'],
        erreurs: [
          {
            formule: '=B2-C2',
            explication:
              'elle retire le nombre de la colonne C en euros alors que la remise est un pourcentage du prix',
          },
          {
            formule: '=B2*C2/100',
            explication:
              'elle calcule le montant de la remise et non le prix après remise',
          },
          {
            formule: '=B2*(100-C2)',
            explication:
              'il manque la division par $100$ : le résultat est $100$ fois trop grand',
          },
          {
            formule: '=B2-C2/100',
            explication: `elle retire C2/100 euros ; il faut retirer C2${sp()}% de B2, c'est-à-dire B2×C2/100`,
          },
        ],
        testes: [
          { ref: `B2:B${nb + 1}`, rangeValues: [10, 200] },
          { ref: `C2:C${nb + 1}`, rangeValues: [1, 90] },
        ],
        dependDuDollar: false,
      }
    }
    case 3: {
      const nb = randint(3, 5)
      const eleves = shuffle([
        'Alice',
        'Bilal',
        'Chloé',
        'David',
        'Emma',
        'Farid',
        'Inès',
        'Hugo',
      ]).slice(0, nb)
      const cellules: Cellules = {
        A1: 'Élève',
        B1: 'Note 1',
        C1: 'Note 2',
        D1: 'Moyenne',
      }
      eleves.forEach((e, k) => {
        cellules[`A${k + 2}`] = e
        // deux notes de même parité : la moyenne est un nombre entier
        const note1 = randint(4, 18)
        cellules[`B${k + 2}`] = note1
        cellules[`C${k + 2}`] =
          note1 % 2 === 0 ? 2 * randint(2, 9) : 2 * randint(2, 8) + 1
      })
      return {
        numero,
        intro:
          'Un professeur utilise un tableur pour calculer la moyenne de deux évaluations pour chaque élève, les deux notes ayant le même coefficient.',
        cellules,
        nbColonnes: 4,
        nbLignes: nb + 1,
        largeurs: [100, 90, 90, 100],
        cible: 'D2',
        nbRecopies: nb - 1,
        but: 'calculer la moyenne des deux notes de chaque élève',
        formuleJuste: '=(B2+C2)/2',
        formulesJustes: [
          '=(B2+C2)/2',
          '=B2/2+C2/2',
          '=(C2+B2)/2',
          '=MOYENNE(B2:C2)',
        ],
        erreurs: [
          {
            formule: '=B2+C2/2',
            explication:
              "la division par $2$ est prioritaire sur l'addition : seule la note C2 est divisée par $2$. Il faut des parenthèses",
          },
          {
            formule: '=(B2+C2)/3',
            explication: 'il faut diviser par $2$ car il y a deux notes',
          },
          {
            formule: '=B2+C2',
            explication:
              'elle calcule la somme des deux notes et non leur moyenne',
          },
        ],
        testes: [{ ref: `B2:C${nb + 1}`, rangeValues: [0, 20] }],
        dependDuDollar: false,
      }
    }
    case 4: {
      const nb = randint(3, 5)
      const cellules: Cellules = {
        A1: 'Rectangle',
        B1: 'Longueur (cm)',
        C1: 'Largeur (cm)',
        D1: 'Périmètre (cm)',
      }
      for (let k = 0; k < nb; k++) {
        cellules[`A${k + 2}`] = `Rectangle ${k + 1}`
        const largeur = randint(2, 9)
        cellules[`B${k + 2}`] = largeur + randint(1, 8)
        cellules[`C${k + 2}`] = largeur
      }
      return {
        numero,
        intro: 'Un tableur contient les dimensions de plusieurs rectangles.',
        cellules,
        nbColonnes: 4,
        nbLignes: nb + 1,
        largeurs: [110, 120, 120, 120],
        cible: 'D2',
        nbRecopies: nb - 1,
        but: 'calculer le périmètre de chaque rectangle',
        formuleJuste: '=2*(B2+C2)',
        formulesJustes: [
          '=2*(B2+C2)',
          '=(B2+C2)*2',
          '=2*B2+2*C2',
          '=B2+B2+C2+C2',
        ],
        erreurs: [
          {
            formule: '=2*B2+C2',
            explication:
              'elle ne double que la longueur ; la largeur doit aussi être comptée deux fois',
          },
          {
            formule: '=B2+C2',
            explication: 'elle calcule le demi-périmètre',
          },
          {
            formule: '=B2*C2',
            explication:
              "elle calcule l'aire du rectangle et non son périmètre",
          },
          {
            formule: '=2*B2*C2',
            explication: "elle calcule le double de l'aire et non le périmètre",
          },
        ],
        testes: [{ ref: `B2:C${nb + 1}`, rangeValues: [1, 30] }],
        dependDuDollar: false,
      }
    }
    case 5: {
      const nb = randint(3, 4)
      const total = choice([20, 25, 50, 100])
      // répartition aléatoire du total en nb effectifs non nuls
      const effectifs: number[] = []
      let reste = total
      for (let k = 0; k < nb - 1; k++) {
        const e = randint(1, reste - (nb - 1 - k))
        effectifs.push(e)
        reste -= e
      }
      effectifs.push(reste)
      const ligneTotal = nb + 2
      const cellules: Cellules = {
        A1: 'Classe',
        B1: 'Effectif',
        C1: 'Pourcentage (%)',
      }
      shuffle(['6e A', '6e B', '6e C', '6e D'])
        .slice(0, nb)
        .forEach((c, k) => {
          cellules[`A${k + 2}`] = c
          cellules[`B${k + 2}`] = effectifs[k]
        })
      cellules[`A${ligneTotal}`] = 'Total'
      cellules[`B${ligneTotal}`] = `=SOMME(B2:B${nb + 1})`
      return {
        numero,
        intro:
          "Un tableur donne l'effectif de plusieurs classes d'un collège. La cellule du total contient une formule.",
        cellules,
        nbColonnes: 3,
        nbLignes: nb + 2,
        largeurs: [100, 100, 130],
        cible: 'C2',
        nbRecopies: nb - 1,
        but: "calculer le pourcentage que représente chaque classe par rapport à l'effectif total",
        formuleJuste: `=B2/B$${ligneTotal}*100`,
        formulesJustes: [
          `=B2/B$${ligneTotal}*100`,
          `=B2/$B$${ligneTotal}*100`,
          `=B2*100/B$${ligneTotal}`,
          `=100*B2/$B$${ligneTotal}`,
        ],
        erreurs: [
          {
            formule: `=B2/B${ligneTotal}*100`,
            explication: `la référence B${ligneTotal} n'est pas bloquée : en étirant la cellule vers le bas, elle devient B${ligneTotal + 1}, B${ligneTotal + 2}… au lieu de rester sur le total`,
          },
          {
            formule: `=B2/B$${ligneTotal}`,
            explication:
              'elle calcule une proportion comprise entre $0$ et $1$ ; il manque la multiplication par $100$ pour obtenir un pourcentage',
          },
          {
            formule: `=B2/SOMME(B2:B${nb + 1})*100`,
            explication: `la plage B2:B${nb + 1} n'est pas bloquée : en étirant la cellule vers le bas, elle se décale et ne contient plus toutes les classes`,
          },
        ],
        testes: [{ ref: `B2:B${nb + 1}`, rangeValues: [1, 30] }],
        dependDuDollar: true,
      }
    }
    case 6: {
      const nb = randint(3, 5)
      const articles = shuffle([
        'Livre',
        'Casque',
        'Lampe',
        'Sac',
        'Clavier',
        'Souris',
        'Cartable',
      ]).slice(0, nb)
      const cellules: Cellules = {
        A1: 'Taux de TVA (%)',
        B1: choice([2.1, 5.5, 10, 20]),
        A2: 'Article',
        B2: 'Prix HT (€)',
        C2: 'Prix TTC (€)',
      }
      articles.forEach((a, k) => {
        cellules[`A${k + 3}`] = a
        cellules[`B${k + 3}`] = 10 * randint(1, 12)
      })
      return {
        numero,
        intro:
          'Un tableur contient le prix hors taxes de plusieurs articles. Le taux de TVA est écrit dans la cellule B1.',
        cellules,
        nbColonnes: 3,
        nbLignes: nb + 2,
        largeurs: [130, 110, 110],
        cible: 'C3',
        nbRecopies: nb - 1,
        but: 'calculer le prix TTC de chaque article (prix hors taxes augmenté du taux de TVA)',
        formuleJuste: '=B3*(1+$B$1/100)',
        formulesJustes: [
          '=B3*(1+$B$1/100)',
          '=B3+B3*$B$1/100',
          '=B3*(100+$B$1)/100',
          '=B3*(1+B$1/100)',
        ],
        erreurs: [
          {
            formule: '=B3*(1+B1/100)',
            explication:
              "la référence B1 n'est pas bloquée : en étirant la cellule vers le bas, elle devient B2, B3… au lieu de rester sur le taux de TVA",
          },
          {
            formule: '=B3*$B$1/100',
            explication:
              'elle calcule seulement le montant de la TVA ; il faut ajouter ce montant au prix hors taxes',
          },
          {
            formule: '=B3*(1+$B$1)',
            explication:
              'il manque la division par $100$ : le taux est un pourcentage',
          },
          {
            formule: '=B3+$B$1',
            explication:
              "elle ajoute le taux (en pourcentage) au prix comme s'il s'agissait d'euros",
          },
        ],
        testes: [
          { ref: `B3:B${nb + 2}`, rangeValues: [10, 200] },
          { ref: 'B1', rangeValues: [5, 50] },
        ],
        dependDuDollar: true,
      }
    }
    case 8: {
      const triplets = shuffle([
        [3, 4],
        [5, 12],
        [6, 8],
        [8, 15],
        [9, 12],
        [7, 24],
        [12, 16],
        [20, 21],
      ]).slice(0, randint(3, 4))
      const cellules: Cellules = {
        A1: 'Triangle',
        B1: 'Côté 1 (cm)',
        C1: 'Côté 2 (cm)',
        D1: 'Hypoténuse (cm)',
      }
      triplets.forEach(([a, b], k) => {
        cellules[`A${k + 2}`] = `Triangle ${k + 1}`
        cellules[`B${k + 2}`] = a
        cellules[`C${k + 2}`] = b
      })
      const nb = triplets.length
      return {
        numero,
        intro:
          "Un tableur contient les longueurs des deux côtés de l'angle droit de plusieurs triangles rectangles.",
        cellules,
        nbColonnes: 4,
        nbLignes: nb + 1,
        largeurs: [100, 110, 110, 130],
        cible: 'D2',
        nbRecopies: nb - 1,
        but: "calculer la longueur de l'hypoténuse de chaque triangle",
        formuleJuste: '=RACINE(B2^2+C2^2)',
        formulesJustes: [
          '=RACINE(B2^2+C2^2)',
          '=RACINE(B2*B2+C2*C2)',
          '=racine(C2^2+B2^2)',
        ],
        erreurs: [
          {
            formule: '=RACINE(B2+C2)',
            explication:
              "il manque les carrés : d'après le théorème de Pythagore, il faut additionner les carrés des deux côtés avant de calculer la racine carrée",
          },
          {
            formule: '=B2^2+C2^2',
            explication:
              "elle calcule le carré de l'hypoténuse ; il manque la racine carrée",
          },
          {
            formule: '=RACINE(B2^2)+C2^2',
            explication:
              'la racine carrée ne porte que sur B2^2 ; il faut des parenthèses autour de toute la somme B2^2+C2^2',
          },
          {
            formule: '=RACINE(B2)+RACINE(C2)',
            explication:
              'elle additionne les racines carrées des longueurs des côtés, ce qui ne correspond pas au théorème de Pythagore',
          },
        ],
        testes: [{ ref: `B2:C${nb + 1}`, rangeValues: [1, 20] }],
        dependDuDollar: false,
      }
    }
    default: {
      const nb = 5
      const debut = randint(0, 6)
      const cellules: Cellules = { A1: 'Mois', B1: 'Dépenses (€)' }
      for (let k = 0; k < nb; k++) {
        cellules[`A${k + 2}`] = MOIS[debut + k]
        cellules[`B${k + 2}`] = randint(5, 60) * 10
      }
      cellules[`A${nb + 2}`] = 'Total'
      return {
        numero: 7,
        intro:
          "Un tableur contient les dépenses d'une famille pour l'électricité pendant cinq mois.",
        cellules,
        nbColonnes: 2,
        nbLignes: nb + 2,
        largeurs: [110, 130],
        cible: `B${nb + 2}`,
        nbRecopies: 0,
        but: 'calculer le total des dépenses des cinq mois',
        formuleJuste: `=SOMME(B2:B${nb + 1})`,
        formulesJustes: [`=SOMME(B2:B${nb + 1})`, '=B2+B3+B4+B5+B6'],
        erreurs: [
          {
            formule: `=SOMME(B2:B${nb})`,
            explication: `la plage s'arrête en B${nb} : la dépense du dernier mois (cellule B${nb + 1}) n'est pas comptée`,
          },
          {
            formule: `=B2+B${nb + 1}`,
            explication:
              "elle n'additionne que la première et la dernière dépense",
          },
          {
            formule: `=MOYENNE(B2:B${nb + 1})`,
            explication:
              'la fonction MOYENNE calcule la dépense moyenne des cinq mois, au lieu de leur total',
          },
        ],
        testes: [{ ref: `B2:B${nb + 1}`, rangeValues: [10, 500] }],
        dependDuDollar: false,
      }
    }
  }
}

/** Une formule erronée est bien fausse et une formule juste donne les mêmes résultats. */
export function estCoherent(s: ScenarioTableur): boolean {
  return (
    s.formulesJustes.every((f) => memesResultats(s, f, s.formuleJuste)) &&
    s.erreurs.every((e) => !memesResultats(s, e.formule, s.formuleJuste))
  )
}

/** Génère un scénario (1 à 7) dont les formules justes et fausses sont vérifiées. */
export function creeScenario(numero: number): ScenarioTableur {
  for (let essai = 0; essai < 100; essai++) {
    const s = creeBrouillon(numero)
    if (estCoherent(s)) return s
  }
  return creeBrouillon(numero)
}

/** Largeurs de colonnes au format attendu par jspreadsheet. */
export function colonnesTableur(largeurs: number[]): { width: number }[] {
  return largeurs.map((width) => ({ width }))
}

/** Dernière cellule de la zone cible, ex. `'D5'`. */
export function derniereCibleDe(s: ScenarioTableur): string {
  const refs = cellulesCible(s)
  return refs[refs.length - 1]
}

/** Choix proposés à l'enseignant pour sélectionner les situations. */
export function formulaireScenarios(): [string, string] {
  return [
    'Situations',
    [
      'Nombres séparés par des tirets :',
      ...LIBELLES_SCENARIOS.map((l, k) => `${k + 1} : ${l}`),
      `${NB_SCENARIOS + 1} : Mélange`,
    ].join('\n'),
  ]
}
