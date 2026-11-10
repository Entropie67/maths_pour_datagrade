import Decimal from 'decimal.js'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const titre = 'Compléter des opérations à trous'

export const dateDePublication = '2/11/2024'
export const uuid = 'b3704'
export const interactifReady = true

export const refs = {
  'fr-fr': ['6N0A-14'],
  'fr-ch': ['9R1NO6H-3', '9R2NO6H-3', '9R3NO6H-3'],
}

/**
 * Travail sur le sens de l'égalité
 * @author Rémi Angot

*/
export default class CompleterEgalite extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 6
    this.comment =
      "Cet exercice permet de voir le symbole = autrement que la touche EXE de la calculatrice. Il y a 6 formes d'égalité différentes à compléter."
  }

  nouvelleVersion() {
    this.consigne = `Compléter ${this.nbQuestions > 1 ? 'les égalités suivantes' : "l'égalité suivante"}.`
    const typeQuestionsDisponibles = [
      'a=xb',
      'ab=cx',
      'a-b=c+x',
      'ab=x+c',
      'a+x=bc',
      'ab=c-x',
    ]

    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let x: number | Decimal = NaN
      let a: number | Decimal = NaN
      let b: number | Decimal = NaN
      let c: number | Decimal = NaN
      switch (listeTypeQuestions[i]) {
        case 'a=xb':
          b = randint(2, 9)
          x = randint(2, 9)
          a = b * x
          texte = remplisLesBlancs(
            this,
            i,
            `${a} = %{champ1} \\times ${b}`,
            KeyboardType.clavierDeBase,
          )
          texteCorr = `$${a} = ${miseEnEvidence(x.toString())} \\times ${b}$`
          break
        case 'ab=cx':
          ;[a, b, c, x] = getabcx()
          texte = remplisLesBlancs(
            this,
            i,
            `${a} \\times ${b} = %{champ1} \\times ${c}`,
            KeyboardType.clavierDeBase,
          )
          texteCorr = `$${a} \\times ${b} = ${miseEnEvidence(x.toString())} \\times ${c}$`
          break
        case 'a-b=c+x':
          c = randint(2, 7) * 10
          b = new Decimal(randint(100, 150)).div(10)
          x = new Decimal(randint(10, 20)).div(10)
          a = b.plus(c).plus(x)
          texte = remplisLesBlancs(
            this,
            i,
            `${texNombre(a)} - ${texNombre(b)} = %{champ1} + ${texNombre(c)}`,
            KeyboardType.clavierDeBase,
          )
          texteCorr = `$${texNombre(a)} - ${texNombre(b)} = ${miseEnEvidence(texNombre(x))} + ${texNombre(c)}$`
          break
        case 'ab=x+c':
          a = randint(3, 9)
          b = randint(2, 9)
          c = randint(2, a * b - 1)
          x = a * b - c
          texte = remplisLesBlancs(
            this,
            i,
            `${a} \\times ${b} = %{champ1} + ${c}`,
            KeyboardType.clavierDeBase,
          )
          texteCorr = `$${a} \\times ${b} = ${miseEnEvidence(x.toString())} + ${c}$`
          break
        case 'a+x=bc':
          b = randint(3, 9)
          c = randint(2, 9)
          a = randint(2, b * c - 1)
          x = b * c - a
          texte = remplisLesBlancs(
            this,
            i,
            `${a} + %{champ1} = ${b} \\times ${c}`,
            KeyboardType.clavierDeBase,
          )
          texteCorr = `$${a} + ${miseEnEvidence(x.toString())} = ${b} \\times ${c}$`
          break
        case 'ab=c-x':
          a = randint(2, 9)
          b = randint(2, 9)
          x = randint(2, 20)
          c = a * b + x
          texte = remplisLesBlancs(
            this,
            i,
            `${a} \\times ${b} = ${c} - %{champ1}`,
            KeyboardType.clavierDeBase,
          )
          texteCorr = `$${a} \\times ${b} = ${c} - ${miseEnEvidence(x.toString())}$`
          break
      }
      handleAnswers(this, i, {
        champ1: { value: x },
      })
      if (
        this.questionJamaisPosee(
          i,
          x.toString(),
          a.toString(),
          b.toString(),
          c.toString(),
        )
      ) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}

function getabcx() {
  const produits = [
    [
      [2, 6],
      [3, 4],
    ], // 12
    [
      [2, 9],
      [3, 6],
    ], // 18
    [
      [2, 10],
      [4, 5],
    ], // 20
    [
      [2, 12],
      [3, 8],
      [4, 6],
    ], // 24
    [
      [2, 14],
      [4, 7],
    ], // 28
    [
      [2, 15],
      [3, 10],
      [5, 6],
    ], // 30
    [
      [2, 18],
      [3, 12],
      [4, 9],
      [6, 6],
    ], // 36
    [
      [2, 21],
      [3, 14],
      [6, 7],
    ], // 42
    [
      [2, 22],
      [4, 11],
    ], // 44
    [
      [3, 15],
      [5, 9],
    ], // 45
    [
      [2, 24],
      [4, 12],
      [6, 8],
      [8, 6],
    ], // 48
    [
      [2, 27],
      [6, 9],
    ], // 54
    [
      [2, 30],
      [3, 20],
      [4, 15],
      [5, 12],
      [6, 10],
    ], // 60
    [
      [2, 33],
      [3, 22],
      [11, 6],
    ], // 66
    [
      [2, 42],
      [4, 21],
    ], // 84
    [
      [2, 45],
      [3, 30],
      [9, 10],
    ], // 90
    [
      [2, 50],
      [4, 25],
    ], // 100
  ]
  const indiceProduit = randint(0, produits.length - 1)
  const produit = produits[indiceProduit]
  const indiceFacteur1 = randint(0, produit.length - 1)
  const indiceFacteur2 = randint(0, produit.length - 1, [indiceFacteur1])
  const [a, b] = produit[indiceFacteur1]
  const [c, x] = produit[indiceFacteur2]
  // Shuffle [a, b] and [c, x]
  const ordre = randint(0, 3)
  if (ordre === 0) {
    return [a, b, c, x]
  } else if (ordre === 1) {
    return [b, a, x, c]
  } else if (ordre === 2) {
    return [a, b, x, c]
  }
  return [b, a, c, x]
}
