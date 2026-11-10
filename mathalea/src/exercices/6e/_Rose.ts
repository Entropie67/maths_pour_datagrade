import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygoneRegulierParCentreEtRayon } from '../../lib/2d/polygonesParticuliers'
import { Segment, segment } from '../../lib/2d/segmentsVecteurs'
import {
  latexParCoordonnees,
  latexParCoordonneesBox,
  texteParPoint,
} from '../../lib/2d/textes'
import { homothetie, rotation, similitude } from '../../lib/2d/transformations'
import { longueur } from '../../lib/2d/utilitairesGeometriques'
import { vide2d } from '../../lib/2d/Vide2d'
import ce from '../../lib/interactif/comparisonFunctions'
import { choice } from '../../lib/outils/arrayOutils'
import { lettreMinusculeDepuisChiffre } from '../../lib/outils/outilString'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'

type ValueType = number | FractionEtendue | string
/**
 * Classe Rose
 * @author Jean-claude Lhote
 */
export class Rose {
  type: string
  operation: string
  typeDonnees: string
  nombreDeValeurs: number
  cellulesPreremplies: ValueType[]
  rayon: number
  resultats: string[]
  valeurMax: number
  indexInconnue: number
  values: ValueType[]
  rayonBoite?: number

  constructor({
    values = [],
    nombreDeValeurs = 3,
    rayon = 2,
    operation = 'addition',
    type = 'résultats',
    typeDonnees = 'entiers',
    cellulesPreremplies = Array.from('abcdefghi'),
    valeurMax = 10,
    indexInconnue = 999,
  }: {
    values?: ValueType[]
    nombreDeValeurs?: number
    rayon?: number
    operation?: string
    type?: string
    typeDonnees?: string
    cellulesPreremplies?: string[]
    valeurMax?: number
    indexInconnue?: number
  }) {
    this.type = type
    this.operation = operation
    this.typeDonnees = typeDonnees
    this.nombreDeValeurs = nombreDeValeurs
    this.cellulesPreremplies = cellulesPreremplies
    this.rayon = rayon
    this.resultats = []
    this.valeurMax = valeurMax
    this.indexInconnue = indexInconnue

    if (values === undefined || values.length === 0) {
      values = []
      while (this.valeurMax - 2 < this.nombreDeValeurs) {
        this.valeurMax++
      }
      const den = randint(2, this.valeurMax)
      for (let i = 0; i < this.nombreDeValeurs; i++) {
        switch (this.typeDonnees) {
          case 'entiers':
            values.push(randint(2, this.valeurMax, values.map(Number)))
            this.rayon = 2
            break
          case 'entiers relatifs':
            values.push(
              randint(-this.valeurMax, this.valeurMax, [
                0,
                1,
                ...values.map(Number),
              ]),
            )
            this.rayon = 2
            break
          case 'litteraux':
            {
              const value = ce
                .parse(
                  `${randint(1, this.valeurMax)}x + ${randint(1, this.valeurMax)}`,
                )
                .toLatex()

              values.push(value)
              this.rayon = 3
            }
            break
          case 'fractions dénominateurs multiples':
            values.push(
              new FractionEtendue(randint(1, this.valeurMax), den).simplifie(),
            )
            this.rayon = 2.5
            break
          case 'fractions positives dénominateurs premiers':
            values.push(
              new FractionEtendue(
                randint(1, this.valeurMax),
                choice([2, 3, 5, 7]),
              ).simplifie(),
            )
            this.rayon = 2.5
            break

          case 'fractions positives':
            values.push(
              new FractionEtendue(
                randint(1, this.valeurMax),
                randint(2, this.valeurMax),
              ).simplifie(),
            )
            this.rayon = 2.5
            break
          case 'fractions relatives':
            values.push(
              new FractionEtendue(
                randint(-this.valeurMax, this.valeurMax, 0),
                randint(2, this.valeurMax),
              ).simplifie(),
            )
            this.rayon = 2.5
            break
        }
      }
    } else {
      // si elles sont définies, on complète éventuellement la grille aléatoirement.
      for (let i = values.length; i < this.nombreDeValeurs; i++) {
        switch (this.typeDonnees) {
          case 'entiers':
            values.push(randint(2, this.valeurMax, values.map(Number)))
            break
          case 'entiers relatifs':
            values.push(
              randint(-this.valeurMax, this.valeurMax, [
                0,
                1,
                ...values.map(Number),
              ]),
            )
            break
          case 'litteraux':
            {
              const value = ce
                .parse(
                  `${randint(1, this.valeurMax)}x + ${randint(1, this.valeurMax)}`,
                  {},
                )
                .toLatex()
              values.push(value)
            }
            break
          case 'fractions dénominateurs multiples':
            values.push(
              new FractionEtendue(
                randint(1, this.valeurMax),
                (values[i - 1] as FractionEtendue).d,
              ).simplifie(),
            )
            break
          case 'fractions positives dénominateurs premiers':
            values.push(
              new FractionEtendue(
                randint(1, this.valeurMax),
                choice([2, 3, 5, 7]),
              ).simplifie(),
            )
            break
          case 'fractions positives':
            values.push(
              new FractionEtendue(
                randint(1, this.valeurMax),
                randint(2, this.valeurMax),
              ).simplifie(),
            )
            break
          case 'fractions relatives':
            values.push(
              new FractionEtendue(
                randint(-this.valeurMax, this.valeurMax, 0),
                randint(2, this.valeurMax),
              ).simplifie(),
            )
            break
        }
      }
    }
    this.values = values
    this.calculeResultats()
  }

  // méthode qui calcule les résultats si on le veut (sinon on peut les renseigner dans this.resultats manuellement)
  calculeResultats() {
    for (let i = 0; i < this.nombreDeValeurs; i++) {
      const valeur =
        this.values[i] instanceof FractionEtendue
          ? (this.values[i] as FractionEtendue).texFraction.replace(
              'dfrac',
              'frac',
            )
          : typeof this.values[i] === 'number'
            ? String(this.values[i])
            : String(this.values[i])
      const valeur2 =
        this.values[(i + 1) % this.nombreDeValeurs] instanceof FractionEtendue
          ? (
              this.values[(i + 1) % this.nombreDeValeurs] as FractionEtendue
            ).texFraction.replace('dfrac', 'frac')
          : typeof this.values[(i + 1) % this.nombreDeValeurs] === 'number'
            ? String(this.values[(i + 1) % this.nombreDeValeurs])
            : String(this.values[(i + 1) % this.nombreDeValeurs])

      this.resultats[i] = this.operate(valeur, valeur2)
    }
  }

  // fonction utilisée par calculeResultats On lui passe des strings pour unifier, elle retourne un string
  operate(a: string, b: string): string {
    switch (this.operation) {
      case 'addition':
        if (this.typeDonnees !== 'litteraux') {
          if (this.typeDonnees.substring(0, 4) === 'frac') {
            const numDenA = a.match(/\{(\d+)\}\{(\d+)\}/)
            let numA: number
            let denA: number
            if (numDenA) {
              numA = Number(numDenA[1])
              denA = Number(numDenA[2])
            } else {
              numA = Number(a)
              denA = 1
            }
            const numDenB = b.match(/\{(\d+)\}\{(\d+)\}/)
            let numB: number
            let denB: number
            if (numDenB) {
              numB = Number(numDenB[1])
              denB = Number(numDenB[2])
            } else {
              numB = Number(b)
              denB = 1
            }
            const aFrac = new FractionEtendue(numA, denA)
            const bFrac = new FractionEtendue(numB, denB)
            return aFrac.sommeFraction(bFrac).texFraction // math.fraction(math.add(a, b))
          } else {
            const aNumber = Number(a.replace(',', '.').replace('{.}', '.'))
            const bNumber = Number(b.replace(',', '.').replace('{.}', '.'))
            return String(aNumber + bNumber)
          }
        } else {
          return ce
            .parse(`${String(a)}+${String(b)}`, {})
            .simplify()
            .toLatex()
        }
      case 'multiplication':
      default:
        if (this.typeDonnees !== 'litteraux') {
          if (this.typeDonnees.substring(0, 4) === 'frac') {
            const numDenA = a.match(/\{(\d+)\}\{(\d+)\}/)
            let numA: number
            let denA: number
            if (numDenA) {
              numA = Number(numDenA[1])
              denA = Number(numDenA[2])
            } else {
              numA = Number(a)
              denA = 1
            }
            const numDenB = b.match(/\{(\d+)\}\{(\d+)\}/)
            let numB: number
            let denB: number
            if (numDenB) {
              numB = Number(numDenB[1])
              denB = Number(numDenB[2])
            } else {
              numB = Number(b)
              denB = 1
            }
            const aFrac = new FractionEtendue(numA, denA)
            const bFrac = new FractionEtendue(numB, denB)
            return aFrac.produitFraction(bFrac).texFraction
          } else {
            const aNumber = Number(a.replace(',', '.').replace('{.}', '.'))
            const bNumber = Number(b.replace(',', '.').replace('{.}', '.'))
            return String(aNumber * bNumber)
          }
        } else {
          return ce
            .parse(`(${String(a)}) * (${String(b)})`, {})
            .simplify()
            .toLatex()
        }
    }
  }

  representation() {
    if (this.type === 'résultats') {
      this.rayonBoite = 1
    } else {
      if (this.typeDonnees.substring(0, 4) === 'frac') this.rayonBoite = 1.5
      else if (this.typeDonnees === 'litteraux') {
        if (this.operation === 'multiplication') this.rayonBoite = 3.2
        else this.rayonBoite = 2.5
      } else this.rayonBoite = 1
    }
    const objets = []
    const O = pointAbstrait(0, 0, '', '')
    const A = rotation(
      pointAbstrait(this.rayon, 0, '', ''),
      O,
      180 / this.nombreDeValeurs - 90,
      'A',
    )
    for (let i = 0, bulle1, bulle2; i < this.nombreDeValeurs; i++) {
      const M = rotation(A, O, (360 * i) / this.nombreDeValeurs, 'M')
      M.positionLabel = 'center'
      const B = similitude(M, O, 180 / this.nombreDeValeurs, 1.2, 'B')
      const D = similitude(M, O, -180 / this.nombreDeValeurs, 1.2, 'D')
      const C = homothetie(M, O, 1.5, 'C')
      const N = rotation(C, O, 360 / this.nombreDeValeurs, 'N')
      const P = similitude(M, O, 180 / this.nombreDeValeurs, 2.5, 'P')
      const s = segment(O, B, 'black')
      const t = segment(B, C, 'black')
      const u = segment(C, D, 'black')
      const M2 = homothetie(C, O, 0.6) // pointIntersectionDD(droite(B, D), droite(O, C), 'M2')
      const s1 = homothetie(
        segment(C, P),
        C,
        (longueur(C, P) - this.rayonBoite) / longueur(C, P),
      ) as Segment
      s1.styleExtremites = '->'
      s1.tailleExtremites = 5
      s1.pointilles = 2
      const s2 = homothetie(
        segment(N, P),
        N,
        (longueur(N, P) - this.rayonBoite) / longueur(N, P),
      ) as Segment
      s2.styleExtremites = '->'
      s2.tailleExtremites = 5
      s2.pointilles = 2
      if (this.type === 'can1') {
        bulle1 = vide2d() // rotation(boite({??????}), M, 180 / this.nombreDeValeurs - 90)
      } else {
        bulle1 = vide2d()
      }
      objets.push(bulle1)
      objets.push(s, t, u, s1, s2)
      bulle2 = rotation(
        polygoneRegulierParCentreEtRayon(
          P,
          this.rayonBoite,
          this.nombreDeValeurs,
        ),
        P,
        360 / this.nombreDeValeurs - 90,
      )
      if (
        this.type === 'résultats' ||
        this.type === 'solutions' ||
        this.type === 'can1' ||
        this.type === 'can2'
      ) {
        if (
          !(
            this.type === 'can1' &&
            (this.indexInconnue === i ||
              i === (this.indexInconnue - 1) % this.nombreDeValeurs ||
              i === (this.indexInconnue + 1) % this.nombreDeValeurs)
          )
        ) {
          if (
            !(
              this.type === 'can2' &&
              (this.indexInconnue === i ||
                i === (this.indexInconnue + 1) % this.nombreDeValeurs)
            )
          ) {
            if (
              this.typeDonnees !== 'litteraux' &&
              this.typeDonnees.substring(0, 4) !== 'frac'
            ) {
              objets.push(
                texteParPoint(
                  String(this.values[i]),
                  M,
                  0,
                  'black',
                  1,
                  'milieu',
                  true,
                ),
              )
            } else {
              if (this.typeDonnees !== 'litteraux') {
                if (this.values[i] instanceof FractionEtendue) {
                  objets.push(
                    latexParCoordonnees(
                      (this.values[i] as FractionEtendue).texFSD,
                      M.x,
                      M.y,
                      'black',
                      0,
                      0,
                      'none',
                      8,
                    ),
                  )
                } else {
                  objets.push(
                    texteParPoint(
                      String(this.values[i]),
                      M,
                      0,
                      'black',
                      1,
                      'milieu',
                      true,
                    ),
                  )
                }
              } else {
                objets.push(
                  latexParCoordonneesBox(
                    String(this.values[i]),
                    M2.x,
                    M2.y,
                    'black',
                    50,
                    12,
                    'none',
                    8,
                    { anchor: 'center' },
                  ),
                )
              }
            }
          }
        }
        if (this.type === 'can1' && this.indexInconnue === i) {
          objets.push(texteParPoint(lettreMinusculeDepuisChiffre(i + 1), M))
        }
      }
      if (
        this.type === 'solutions' ||
        this.type === 'valeurs' ||
        this.type === 'can1' ||
        this.type === 'can2'
      ) {
        // on ajoute les produits
        if (!(this.type === 'can2' && this.indexInconnue === i)) {
          if (
            this.typeDonnees !== 'litteraux' &&
            this.typeDonnees.substring(0, 4) !== 'frac'
          ) {
            objets.push(
              texteParPoint(
                this.resultats[i],
                P,
                0,
                'black',
                1,
                'milieu',
                true,
              ),
            )
          } else {
            objets.push(
              latexParCoordonnees(
                String(this.resultats[i]),
                P.x,
                P.y,
                'black',
                0,
                0,
                'none',
                8,
              ),
            )
          }
        }
        if (this.type === 'can2' && this.indexInconnue === i) {
          objets.push(texteParPoint(lettreMinusculeDepuisChiffre(i + 1), P))
        } else {
          bulle2.color = colorToLatexOrHTML('black')
          if (this.type === 'valeurs') {
            objets.push(texteParPoint(lettreMinusculeDepuisChiffre(i + 1), M))
          }
        }
      } else {
        if (this.cellulesPreremplies[i] instanceof FractionEtendue) {
          objets.push(
            texteParPoint(
              (this.cellulesPreremplies[i] as FractionEtendue).texFSD,
              P,
              0,
              'black',
              1,
              'milieu',
              true,
            ),
          )
        } else {
          objets.push(
            texteParPoint(
              String(this.cellulesPreremplies[i]),
              P,
              0,
              'black',
              1,
              'milieu',
              true,
            ),
          )
        }
      }

      objets.push(bulle2)
    }
    return objets
  }
}
