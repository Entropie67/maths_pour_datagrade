import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { fraction } from '../../modules/fractions'
import { randint } from '../../modules/outils'
import { tableauColonneLigne } from '../2d/tableau'
import { orangeMathalea } from '../colors'
import { KeyboardType } from '../interactif/claviers/keyboard'
import ce from '../interactif/comparisonFunctions'
import { AddTabDbleEntryMathlive } from '../interactif/tableaux/AjouteTableauMathlive'
import { choice } from './arrayOutils'
import { reduireAxPlusB } from './ecritures'

/**
 * @class
 * @property {'entiers'|'entiers relatifs'|'littéraux'|'fractions positives'|'fractions relatives'|'fractions dénominateurs multiples'|'fractions positives dénominateurs premiers'} type
 * @property {number?} largeur
 * @property {number?} hauteur
 * @property {number?} taille
 * @property {number|null} Case
 * @property {string[]} cellules
 * @property {'addition'|'multiplication'} operation = 'addition'
 * @property {number} valeurMax = 50,
 * @property {boolean} solution = false,
 * @author Jean-claude Lhote
 */
export class Yohaku {
  type: string
  largeur: number
  hauteur: number
  taille: number
  Case: number | undefined
  cellules: string[]
  cellulesEE: FractionEtendue[]
  sommesCellules: FractionEtendue[]
  cellulesPreremplies: string[]
  resultats: string[]
  operation?: 'addition' | 'multiplication'
  solution?: boolean
  clavier?: string
  constructor(
    {
      type,
      largeur,
      hauteur,
      taille,
      Case,
      cellules,
      operation,
      valeurMax,
      solution,
    }: {
      type?: string
      largeur?: number
      hauteur?: number
      taille?: number
      Case?: number | undefined
      cellules?: string[]
      resultats?: string[]
      operation?: 'addition' | 'multiplication'
      valeurMax?: number
      solution?: boolean
    } = {
      type: 'entiers',
      largeur: 2,
      hauteur: 2,
      taille: 2,
      Case: undefined,
      resultats: [],
      operation: 'addition',
      valeurMax: 50,
      solution: false,
      cellules: [],
    },
  ) {
    this.largeur = largeur ?? 2
    this.hauteur = hauteur ?? 2
    this.Case = Case
    this.resultats = []
    this.taille = taille ?? 2
    this.operation = operation
    this.solution = solution
    this.type = type ?? 'entiers'
    this.cellules = cellules ?? []
    this.cellulesPreremplies = []
    this.cellulesEE = []
    this.sommesCellules = []
    this.clavier = String(KeyboardType.clavierDeBase)
    if (valeurMax == null) valeurMax = 50
    if (this.cellules.length === 0) {
      const den = randint(2, valeurMax)
      for (let i = 0; i < this.taille ** 2; i++) {
        switch (this.type) {
          case 'entiers':
            this.cellules.push(String(randint(1, valeurMax) ?? 2))
            this.clavier = String(KeyboardType.clavierDeBase)
            break
          case 'entiers relatifs':
            this.cellules.push(String(randint(-valeurMax, valeurMax, 0)))
            this.clavier = String(KeyboardType.clavierDeBase)
            break
          case 'littéraux':
            this.cellules.push(
              reduireAxPlusB(randint(1, valeurMax), randint(1, valeurMax), 'x'),
            )
            this.clavier = String(KeyboardType.clavierDeBaseAvecVariable)
            break
          case 'fractions dénominateurs multiples': {
            // EE : Modif pour 4C21-2 afin que les sommes des lignes ne soient pas identiques aux sommes des colonnes
            let testFraction = new FractionEtendue(randint(1, valeurMax), den)
            let sommeFractions: FractionEtendue
            if (i + 1 >= this.taille) {
              if ((i + 1) % this.taille === 1) {
                sommeFractions = new FractionEtendue(0, 1)
                for (let ee = 0; ee < this.taille; ee++) {
                  sommeFractions = sommeFractions.sommeFraction(
                    this.cellulesEE[
                      ee + this.taille * Math.floor(ee / this.taille)
                    ],
                  )
                }
                this.sommesCellules.push(sommeFractions)
              }
              if (i >= this.taille * (this.taille - 1)) {
                let fractionsEgales: boolean
                do {
                  fractionsEgales = false
                  testFraction = new FractionEtendue(randint(1, valeurMax), den)
                  sommeFractions = new FractionEtendue(0, 1)
                  for (let ee = 0; ee < this.taille - 1; ee++) {
                    sommeFractions = sommeFractions.sommeFraction(
                      this.cellulesEE[(i % this.taille) + this.taille * ee],
                    )
                  }
                  sommeFractions = sommeFractions.sommeFraction(testFraction)
                  for (let ee = 0; ee < this.sommesCellules.length; ee++) {
                    fractionsEgales =
                      fractionsEgales ||
                      this.sommesCellules[ee].isEqual(sommeFractions)
                  }
                } while (fractionsEgales)
                this.sommesCellules.push(sommeFractions)
              }
            }
            this.cellulesEE.push(testFraction)
            this.cellules.push(testFraction.texFSD)
            this.clavier = String(KeyboardType.clavierDeBaseAvecFraction)
            break
          }
          case 'fractions positives dénominateurs premiers':
            this.cellules.push(
              fraction(
                randint(1, valeurMax),
                Number(choice([2, 3, 5, 7])),
              ).texFraction.replace('dfrac', 'frac'),
            )
            this.clavier = String(KeyboardType.clavierDeBaseAvecFraction)
            break

          case 'fractions positives':
            this.cellules.push(
              fraction(
                randint(1, valeurMax),
                randint(2, valeurMax),
              ).texFraction.replace('dfrac', 'frac'),
            )
            this.clavier = String(KeyboardType.clavierDeBaseAvecFraction)
            break
          case 'fractions relatives':
            this.cellules.push(
              fraction(
                randint(-valeurMax, valeurMax, 0),
                randint(2, valeurMax),
              ).texFraction.replace('dfrac', 'frac'),
            )
            this.clavier = String(KeyboardType.clavierDeBaseAvecFraction)
            break
        }
      }
    } else {
      // si elles sont définies, on complète éventuellement la grille aléatoirement.
      this.cellulesPreremplies = [...(cellules ?? [])]
      for (let i = this.cellules.length; i < this.taille ** 2; i++) {
        if (Array.isArray(cellules) && cellules[i] === '') {
          switch (this.type) {
            case 'entiers':
              this.cellules.push(String(randint(1, valeurMax)))
              this.clavier = String(KeyboardType.clavierDeBase)
              break
            case 'entiers relatifs':
              this.cellules.push(String(randint(-valeurMax, valeurMax, 0)))
              this.clavier = String(KeyboardType.clavierDeBase)
              break
            case 'littéraux':
              this.cellules.push(
                reduireAxPlusB(
                  randint(1, valeurMax),
                  randint(1, valeurMax),
                  'x',
                ),
              )
              this.clavier = String(KeyboardType.clavierDeBaseAvecVariable)
              break
            case 'fractions dénominateurs multiples':
              {
                const cellulePrecedente = ce.parse(this.cellules[i - 1])
                if (Array.isArray(cellulePrecedente.re)) {
                  const [, den] = cellulePrecedente.re
                  this.cellules.push(
                    fraction(
                      randint(1, valeurMax),
                      Number(den) ?? 1,
                    ).texFraction.replace('dfrac', 'frac'),
                  )
                }
                this.clavier = String(KeyboardType.clavierDeBaseAvecFraction)
              }
              break
            case 'fractions positives dénominateurs premiers':
              this.cellules.push(
                new FractionEtendue(
                  randint(1, valeurMax),
                  Number(choice([2, 3, 5, 7])),
                ).texFraction.replace('dfrac', 'frac'),
              )
              this.clavier = String(KeyboardType.clavierDeBaseAvecFraction)
              break
            case 'fractions positives':
              this.cellules.push(
                fraction(
                  randint(1, valeurMax),
                  randint(2, valeurMax),
                ).texFraction.replace('dfrac', 'frac'),
              )
              this.clavier = String(KeyboardType.clavierDeBaseAvecFraction)
              break
            case 'fractions relatives':
              this.cellules.push(
                fraction(
                  randint(-valeurMax, valeurMax, 0),
                  randint(2, valeurMax),
                ).texFraction.replace('dfrac', 'frac'),
              )
              this.clavier = String(KeyboardType.clavierDeBaseAvecFraction)
              break
          }
        }
      }
    }
  }

  // méthode qui calcule les résultats si on le veut (sinon on peut les renseigner dans this.resultats manuellement)
  calculeResultats() {
    let valeurs
    for (let i = 0; i < this.taille; i++) {
      valeurs = []
      for (let j = 0; j < this.taille; j++) {
        valeurs.push(this.cellules[i + j * this.taille])
      }
      this.resultats[i] = String(this.operate(valeurs))
    }
    for (let i = this.taille; i < this.taille * 2; i++) {
      valeurs = []
      for (let j = 0; j < this.taille; j++) {
        valeurs.push(this.cellules[(i - this.taille) * this.taille + j])
      }
      this.resultats[i] = String(this.operate(valeurs))
    }
  }

  // fonction utilisée par calculeResultats
  operate(valeurs: Array<string>) {
    let initialValue: string
    switch (this.operation) {
      case 'addition':
        initialValue = '0'
        return ce
          .parse(
            valeurs.reduce(
              (previous, current) => `${previous}+${current}`,
              initialValue,
            ),
          )
          .simplify().latex
      case 'multiplication':
        initialValue = '1'
        return ce
          .parse(
            valeurs.reduce(
              (previous, current) => `(${previous})\\times (${current})`,
              initialValue,
            ),
          )
          .simplify().latex
    }
  }

  /**
   * Retourne le tableau
   * @param {boolean} isInteractif
   * @returns {string}
   */
  representation({
    numeroExercice,
    question,
    isInteractif,
    classes = '',
  }: {
    numeroExercice: number
    question: number
    isInteractif: boolean
    classes?: string
  }) {
    const dimension = this.taille
    const largeurARemplir = this.taille + 1 // 1 de plus que dimension pour la colonne/ligne résultat.
    // première case ; l'opération
    const tabEnteteColonnes = [this.operation === 'addition' ? '+' : '\\times']
    const couleur = context.isHtml ? '' : '\\cellcolor{lightgray}'
    // suite des entêtes de colonnes
    for (let i = 0; i < dimension; i++) {
      tabEnteteColonnes.push(`\\text{Colonne ${i + 1}}`)
    }
    tabEnteteColonnes.push(
      `\\text{${this.operation === 'addition' ? 'Sommes' : 'Produits'}}`,
    )
    // Avec des fractions, chaque ligne doit avoir la même hauteur et laisser la
    // place d'écrire une fraction (en TeX, un étai ajouté dans la 1re cellule).
    const hauteurLigneEm = this.type.includes('frac') ? 3 : undefined
    const etaiTex =
      hauteurLigneEm != null && !context.isHtml
        ? `\\rule[-${hauteurLigneEm / 2}em]{0pt}{${hauteurLigneEm}em}`
        : ''
    if (etaiTex !== '') tabEnteteColonnes[0] = `{${tabEnteteColonnes[0]}}${etaiTex}`
    // Les entêtes de lignes
    const tabEnteteLignes: string[] = []
    for (let i = 0; i < dimension; i++) {
      tabEnteteLignes.push(`${etaiTex}\\text{Ligne ${i + 1}}`)
    }
    tabEnteteLignes.push(
      `${etaiTex}\\text{${this.operation === 'addition' ? 'Sommes' : 'Produits'}}`,
    )
    // Y a-t-il une case prédéfinie ?
    const laCase =
      this.Case == null
        ? null
        : (this.Case % dimension) +
          Math.floor(this.Case / dimension) * largeurARemplir
    // La partie centrale du tableau : dimension + 1 pour les résultats.
    const tabLignes: string[] = []
    let j = 0 // Pour indexer le numéro de ligne
    let k = 0 // Pour indexer les valeurs utilisées de la grille
    for (let i = 0; i < largeurARemplir ** 2; i++) {
      // i parcourt la partie centrale (dimension+1)²
      if (this.solution) {
        // On remplit toutes les cases avec les valeurs stockées
        if (i % largeurARemplir < dimension) {
          if (i < largeurARemplir * dimension) {
            const cellule = this.cellules[k]
            tabLignes.push(cellule)
            k++
          } else {
            if (j < dimension * 2) {
              tabLignes.push(
                `${couleur}${this.resultats[(j + dimension) % (dimension * 2)]}`,
              )
              j++
            }
          }
        } else {
          if (j < dimension * 2) {
            tabLignes.push(
              `${couleur}${this.resultats[(j + dimension) % (dimension * 2)]}`,
            )
            j++
          }
        }
      } else {
        // Ici on met des chaines vides et éventuellement la case prédéfinie pour rendre la solution unique
        if (this.Case == null) {
          // numéro de case aléatoire prédéfinie undefined
          if (this.cellulesPreremplies[k] != null) {
            // Il peut y avoir des cases prédéfinies quand même par exemple 3 sur 4 pour une CAN à une réponse
            if (i % largeurARemplir < dimension) {
              if (i < largeurARemplir * dimension) {
                tabLignes.push(this.cellulesPreremplies[k])
                k++
              } else {
                if (j < dimension * 2) {
                  tabLignes.push(
                    `${couleur}${this.resultats[(j + dimension) % (dimension * 2)]}`,
                  )
                  j++
                }
              }
            } else {
              if (j < dimension * 2) {
                tabLignes.push(
                  `${couleur}${this.resultats[(j + dimension) % (dimension * 2)]}`,
                )
                j++
              }
            }
          } else {
            // On met une chaine vide donc case à compléter
            if (i % largeurARemplir < dimension) {
              if (i < largeurARemplir * dimension) {
                tabLignes.push('')
                k++
              } else {
                if (j < dimension * 2) {
                  tabLignes.push(
                    `${couleur}${this.resultats[(j + dimension) % (dimension * 2)]}`,
                  )
                  j++
                }
              }
            } else {
              if (j < dimension * 2) {
                tabLignes.push(
                  `${couleur}${this.resultats[(j + dimension) % (dimension * 2)]}`,
                )
                j++
              }
            }
          }
        } else {
          if (i % largeurARemplir < dimension) {
            if (i === laCase) {
              const cellule = this.cellules[k]
              k++
              tabLignes.push(cellule)
            } else {
              if (i < largeurARemplir * dimension) {
                if (this.cellulesPreremplies[k] != null) {
                  tabLignes.push(this.cellulesPreremplies[k])
                  k++
                } else {
                  tabLignes.push('')
                  k++
                }
              } else {
                if (j < dimension * 2) {
                  tabLignes.push(
                    `${couleur}${this.resultats[(j + dimension) % (dimension * 2)]}`,
                  )
                  j++
                }
              }
            }
          } else {
            if (j < dimension * 2) {
              tabLignes.push(
                `${couleur}${this.resultats[(j + dimension) % (dimension * 2)]}`,
              )
              j++
            }
          }
        }
      }
    }
    // dernière case
    tabLignes.push(`${context.isHtml ? '' : couleur}///////`)
    if (context.isHtml) {
      const style: { [key: string]: string } = Object.fromEntries(
        this.solution
          ? [
              ['L1C1', `;${orangeMathalea}`],
              ['L1C2', `;${orangeMathalea}`],
              ['L2C1', `;${orangeMathalea}`],
              ['L2C2', `;${orangeMathalea}`],
            ]
          : [],
      )
      const tab = AddTabDbleEntryMathlive.create(
        numeroExercice,
        question,
        AddTabDbleEntryMathlive.convertTclToTableauMathlive(
          tabEnteteColonnes,
          tabEnteteLignes,
          tabLignes,
        ),
        classes + ' ' + this.clavier,
        isInteractif,
        style,
        hauteurLigneEm != null ? 3.6 : undefined,
      )
      return tab.output
    } else {
      const style: { [key: string]: string } = Object.fromEntries(
        this.solution
          ? [
              ['L1C1', `${orangeMathalea}`],
              ['L1C2', `${orangeMathalea}`],
              ['L2C1', `${orangeMathalea}`],
              ['L2C2', `${orangeMathalea}`],
            ]
          : [],
      )
      return tableauColonneLigne(
        tabEnteteColonnes,
        tabEnteteLignes,
        tabLignes,
        2,
        true,
        numeroExercice,
        question,
        false,
        style,
      )
    }
  }
}
