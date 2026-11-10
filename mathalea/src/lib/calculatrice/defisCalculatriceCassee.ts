import { miseEnEvidence } from '../outils/embellissements'
import { randint } from '../../modules/outils'
import { range } from '../outils/nombres'

const situation1 = () => {
  const solutions: [number, number][] = []
  let result: any
  do {
    const a = randint(1, 9)
    const b = randint(1, 9, a)
    const somme = a + b
    if (somme < 10) continue
    const anotherNumberBroken = randint(2, 9, [a, b])

    for (let i = 2; i <= 9; i++) {
      for (let j = 2; j <= 9; j++) {
        if (
          i === a ||
          i === b ||
          j === a ||
          j === b ||
          i === 1 ||
          j === 1 ||
          j === anotherNumberBroken ||
          i === anotherNumberBroken
        ) {
          continue
        }
        if (i + j === somme) {
          solutions.push([i, j])
        }
      }
    }
    if (solutions.length < 1) {
      continue
    }
    const solution = solutions[0]
    const x = solution[0]
    const y = solution[1]
    const listeTouchesCassees = [
      String(anotherNumberBroken),
      String(a),
      String(b),
      '0',
      '1',
      '×',
      '-',
      '÷',
      'x²',
    ]
    result = {
      question: `Produire un calcul donnant $${somme}$ en utilisant les touches de la calculatrice.<br>
    Certaines touches sont cassées.`,
      reponse: String(somme),
      solution: `Une solution pour obtenir $${somme}$ est de faire $${miseEnEvidence(`${x} + ${y}`)}$ EXE.`,
      listeTouchesCassees,
    }
  } while (solutions.length < 1)
  return result
}

const situation2 = () => {
  const a = randint(1, 9)
  const b = randint(1, 9, a)
  const premierTerme = a * 10 + b
  const c = randint(1, 9, [a, b])
  const reponse = String(premierTerme - c)
  const listeTouchesCassees = range(9)
    .filter((n) => n !== a && n !== b && n !== c)
    .map(String)
    .concat(['×', '+', '÷', 'x²'])

  return {
    question: `Produire un calcul donnant $${reponse}$ en utilisant les touches de la calculatrice.<br>
    Certaines touches sont cassées.`,
    reponse,
    solution: `Une solution pour obtenir $${reponse}$ est de faire $${miseEnEvidence(`${a}${b} - ${c}`)}$ EXE.`,
    listeTouchesCassees,
  }
}

export const defisCalculatriceCassee = [
  {
    niveau: 0,
    situation: situation1,
  },
  {
    niveau: 0,
    situation: situation2,
  },
]
