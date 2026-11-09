import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { Complexe } from '../../lib/mathFonctions/Complexe'
import { shuffle } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { fraction } from '../../modules/fractions'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { texNombre } from '../../lib/outils/texNombre'

export const interactifReady = true

export const dateDePublication = '25/06/2026'
export const titre = 'Calculs avec des nombres complexes'

type Terme = {
  a: Complexe
  result: Complexe
  latex: string
  transformations: string[]
}

type Facteur = {
  z: Complexe
  factor: number
  latex: string
  isConjugate: boolean
  zZBarre: Complexe
  transformations: string[]
}

const inventeUneSomme = (nbTermes: number) => {
  const termes: Complexe[] = []
  for (let i = 0; i < nbTermes;) {
    const re = randint(-5, 5, [-1, 1, 0])
    const im = randint(-5, 5, [-1, 1, 0])
    if (re === 0 && im === 0) continue
    termes.push(new Complexe(re, im))
    i++
  }
  return termes
}

const inventeUneSomme2 = (nbTermes: number) => {
  const termes: Terme[] = []
  for (let i = 0; i < nbTermes;) {
    const choixType = [
      'inverse',
      'reel',
      'imaginaire',
      'carré',
      'cube',
      'inverseCarré',
    ][randint(0, 5)]
    let a: Complexe
    let latex: string
    let transformations: string[] = []
    let result: Complexe
    switch (choixType) {
      case 'inverse':
        a = new Complexe(0, randint(-5, 5, [-1, 1, 0]))
        latex = `\\dfrac{1}{${a.tex()}}`
        transformations = [
          `\\dfrac{i}{${a.tex()}\\times i}`,
          `\\dfrac{i}{${a.im}\\times (-1)}`,
          `${fraction(-1, Number(a.im)).texFSD}i`,
        ]
        result = a.inverse()
        break

      case 'imaginaire':
        a = new Complexe(0, randint(-5, 5, [-1, 1, 0]))
        latex = `${a.tex()}`
        transformations = [`${a.tex()}`]
        result = a
        break
      case 'carré':
        a = new Complexe(0, randint(-5, 5, [-1, 1, 0]))
        latex = `(${a.tex()})^2`
        transformations = [
          `${Number(a.im) ** 2}\\times(-1)`,
          `-${Number(a.im) ** 2}`,
        ]
        result = a.mul(a)
        break
      case 'cube':
        a = new Complexe(0, randint(-5, 5, [-1, 1, 0]))
        latex = `(${a.tex()})^3`
        transformations = [
          `${Number(a.im) ** 3}\\times(-1)i`,
          `${Number(-a.im) ** 3}i`,
        ]
        result = a.mul(a).mul(a)
        break
      case 'inverseCarré':
        a = new Complexe(0, randint(-5, 5, [-1, 1, 0]))
        latex = `\\dfrac{1}{(${a.tex()})^2}`
        transformations = [
          `\\dfrac{1}{${Number(a.im) ** 2}\\times(-1)}`,
          `-${fraction(1, Number(a.im) ** 2).texFSD}`,
        ]
        result = a.inverse().mul(a.inverse())
        break
      case 'reel':
      default:
        a = new Complexe(randint(-5, 5, [-1, 1, 0]), 0)
        latex = `${a.tex()}`
        transformations = [`${a.tex()}`]
        result = a
        break
    }
    termes.push({ a, latex, transformations, result })
    i++
  }
  // filtrer les doublons
  const termesTex = termes.map((c) => c.latex)
  const termesUniques = termes.filter(
    (c, index) => termesTex.indexOf(c.latex) === index,
  )

  return termesUniques
}

const inventeUnProduit2 = (nbFacteurs: number) => {
  const facteurs: Facteur[] = []
  for (let i = 0; i < Math.floor(nbFacteurs / 2);) {
    const factor = randint(1, 3)
    const re = randint(-5, 5, [-1, 1, 0])
    const im = randint(-5, 5, [-1, 1, 0])
    const z = new Complexe(re, im)
    const zBarre = z.conjugue()
    const zZBarre = z.mul(zBarre)
    const latex = `(${z.tex()})`
    const isConjugate = false
    const transformations = [`${z.tex()}`]
    facteurs.push({
      z,
      factor: 1,
      latex,
      isConjugate,
      zZBarre,
      transformations,
    })
    facteurs.push({
      z: zBarre.mul(new Complexe(factor, 0)),
      factor,
      latex: `(${zBarre.mul(new Complexe(factor, 0)).tex()})`,
      isConjugate: true,
      zZBarre: zZBarre,
      transformations: [
        `\\overline{${z.mul(new Complexe(factor, 0)).tex()}}`,
        `${factor}\\times \\overline{${z.tex()}}`,
      ],
    })
    i++
  }
  return shuffle(facteurs)
}

const calculeProduit = (c1: Complexe, c2: Complexe) => {
  if (c1.isReal) {
    if (c2.isReal) {
      return `${c1.re}\\times ${ecritureParentheseSiNegatif(c2.re)}\\\\`
    } else if (c2.isImaginary) {
      return `${c1.re}\\times ${Number(c2.im) < 0 ? `(${c2.im}i)` : `${c2.im}i`}\\\\`
    } else {
      return `${c1.re}\\times ${ecritureParentheseSiNegatif(c2.re)}${
        Number(c1.re) * Number(c2.im) < 0 ? '-' : '+'
      }
            ${Math.abs(Number(c1.re))}\\times ${Math.abs(Number(c2.im))}i\\\\`
    }
  } else if (c1.isImaginary) {
    if (c2.isReal) {
      return `${ecritureAlgebrique(c2.re)}\\times ${Number(c1.im) < 0 ? `(${c1.im}i)` : `${c1.im}i`}\\\\`
    } else if (c2.isImaginary) {
      return `${Number(c1.im) * Number(c2.im) > 0 ? '+' : '-'}${Math.abs(Number(c1.im) * Number(c2.im))}i^2\\\\
      &=${Math.abs(Number(c1.im) * Number(c2.im))}\\times(-1)\\\\`
    } else {
      return `${Number(c1.im) * Number(c2.re) < 0 ? '-' : ''}${Math.abs(Number(c1.im))}\\times ${Math.abs(Number(c2.re))}i
      ${Number(c1.im) * Number(c2.im) > 0 ? '+' : '-'}${Math.abs(Number(c1.im))}\\times ${Math.abs(Number(c2.im))}i^2\\\\
      &=${Number(c1.im) * Number(c2.re)}i
      ${Number(c1.im) * Number(c2.im) > 0 ? '+' : '-'}${Math.abs(Number(c1.im) * Number(c2.im))}\\times(-1)\\\\`
    }
  }
  // c1 est complexe
  if (c2.isReal) {
    return `${ecritureAlgebrique(c2.re)}\\times ${ecritureParentheseSiNegatif(c1.re)}${
      Number(c1.im) * Number(c2.re) < 0 ? '-' : '+'
    }
        ${Math.abs(Number(c1.im))}\\times ${Math.abs(Number(c2.re))}i\\\\`
  } else if (c2.isImaginary) {
    return `${Number(c1.re)}\\times ${Number(c2.im) < 0 ? `(${c2.im}i)` : `${c2.im}i`}
    ${Number(c1.im) * Number(c2.im) > 0 ? '+' : '-'}${Math.abs(Number(c1.im))}\\times ${Math.abs(Number(c2.im))}i^2\\\\
    &=${Number(c1.re) * Number(c2.im)}i
    ${Number(c1.im) * Number(c2.im) > 0 ? '+' : '-'}${Math.abs(Number(c1.im) * Number(c2.im))}\\times(-1)\\\\`
  }
  // c1 et c2 sont complexes

  return `${c1.re}\\times ${ecritureParentheseSiNegatif(c2.re)}
   ${Number(c1.re) * Number(c2.im) < 0 ? '-' : '+'}${Math.abs(Number(c1.re))} \\times ${Math.abs(Number(c2.im))}i
 ${Number(c1.im) * Number(c2.re) < 0 ? '-' : '+'}${Math.abs(Number(c2.re))} \\times ${Math.abs(Number(c1.im))}i
  ${Number(c1.im) * Number(c2.im) > 0 ? '+' : '-'}${Math.abs(Number(c1.im))} \\times ${Math.abs(Number(c2.im))}i^2 \\\\

  &=${Number(c1.re) * Number(c2.re)}
  ${Number(c1.re) * Number(c2.im) < 0 ? '-' : '+'}${Math.abs(Number(c1.re) * Number(c2.im))}i
   ${Number(c1.im) * Number(c2.re) < 0 ? '-' : '+'}${Math.abs(Number(c1.im) * Number(c2.re))}i
  ${ecritureAlgebrique(Number(c1.im) * Number(c2.im))}\\times(-1)\\\\`
}

const calculeProduit2 = (facteurs: Facteur[]) => {
  const f1 = facteurs.shift()!
  const reelleDeRefF1 = Number(f1.z.re) / f1.factor
  let f2: Facteur | undefined = undefined
  for (let i = 0; i < facteurs.length; i++) {
    const reelleDeRefFi = Number(facteurs[i].z.re) / facteurs[i].factor
    if (reelleDeRefFi === reelleDeRefF1) {
      f2 = facteurs.splice(i, 1)[0]!
      break
    }
  }

  const f3 = facteurs.pop()!
  const f4 = facteurs[0]!
  const calcul = `${f1.latex}${f2!.latex}${f3.latex}${f4.latex}\\\\
  &=${rienSi1(f1.factor * f2!.factor)}
  (${f1.z.divEntier(f1.factor).tex()})
  (${f2!.z.divEntier(f2!.factor).tex()})
  ${f3.factor * f4.factor !== 1 ? `\\times${f3!.factor * f4!.factor}` : ''}
  (${f3!.z.divEntier(f3!.factor).tex()})
  (${f4!.z.divEntier(f4!.factor).tex()})\\\\
    &=${f1.factor * f2!.factor === 1 ? '' : `${f1.factor * f2!.factor}\\times`}${f1.zZBarre.tex()}\\times${f3.factor * f4.factor !== 1 ? `${f3.factor * f4.factor}\\times ` : ''}${f3.zZBarre.tex()}\\\\`
  return calcul
}
/**
 * @author Jean-Claude Lhote
 * Exercice proposant des calculs avec la forme algébrique des nombres complexes
 * L'exercice est cloné en TEC1-0,  TEC1-02, TEC1-03, TEC1-04, TEC1-05 pour des version monolithiques
 */
export const uuid = '8e72f'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export default class CalculsComplexes extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'types de calculs à effectuer',
      '0: Mélange\n1: somme à réduire\n2: Produit à réduire\n3: Quotient à réduire\n4: somme (2e niveau)\n5: Produit (2e niveau)',
    ]
    this.sup = '1'
    this.spacingCorr = 3
  }
  nouvelleVersion() {
    this.consigne =
      this.nbQuestions === 1
        ? `Donner la forme algébrique du nombre complexe suivant.`
        : `Donner la forme algébrique des nombres complexes suivants.`

    const listeTypesDeCalculs = gestionnaireFormulaireTexte({
      saisie: this.sup,
      nbQuestions: this.nbQuestions,
      min: 1,
      max: 5,
      melange: 0,
      defaut: 0,
      listeOfCase: ['somme', 'produit', 'quotient', 'somme2', 'produit2'],
    }).map(String)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = `$z_{${i + 1}}=`
      let texteCorr = ''
      let termes: Complexe[] = []
      let termes2: Terme[] = []
      let facteurs: Facteur[] = []
      let reponse: Complexe = new Complexe(0, 0)
      switch (listeTypesDeCalculs[i]) {
        case 'somme':
          {
            const nbTermes = randint(2, 3)
            termes = inventeUneSomme(nbTermes)

            texte +=
              termes[0].tex(false) +
              termes
                .slice(1)
                .map((c) => c.tex(true))
                .join('')
            texteCorr = `$\\begin{aligned}${texte.slice(1).replace('=', '&=')}\\\\`
            const partiesReelles = termes
              .map((c) => Number(c.re))
              .filter((c) => c !== 0)
            const partiesImaginaires = termes
              .map((c) => Number(c.im))
              .filter((c) => c !== 0)
            const sommeReelles = `${partiesReelles[0]}${partiesReelles
              .slice(1)
              .map((c) => ecritureAlgebrique(c))
              .join('')}`
            const sommeImaginaires = `${partiesImaginaires[0]}${partiesImaginaires
              .slice(1)
              .map((c) => ecritureAlgebrique(c))
              .join('')}`
            if (partiesImaginaires.filter((c) => c !== 0).length > 1) {
              texteCorr += ` &= ${sommeReelles}+(${sommeImaginaires})i\\\\`
            } else {
              texteCorr += ` &= ${sommeReelles}${sommeImaginaires.startsWith('-') ? '' : '+'}${sommeImaginaires}i\\\\`
            }
            const somme = new Complexe(
              partiesReelles.reduce((a: number, b: number) => a + b, 0),
              partiesImaginaires.reduce((a: number, b: number) => a + b, 0),
            )
            texteCorr += ` &= ${miseEnEvidence(somme.tex())}
            \\end{aligned}$`
            reponse = somme
          }

          break
        case 'produit':
          {
            do {
              termes = inventeUneSomme(2)
            } while (
              termes[0].mul(termes[1]).isReal ||
              termes[0].mul(termes[1]).isImaginary
            )
            if (termes[0].isReal) {
              texte += `${termes[0].tex()}(${termes[1].tex()})`
            } else {
              texte += `(${termes[0].tex()})(${termes[1].tex()})`
            }
            texteCorr += `$\\begin{aligned}${texte.slice(1).replace('=', '&=')}\\\\`
            texteCorr += `&= ${calculeProduit(termes[0], termes[1])}`
            const produit = termes[0].mul(termes[1])
            texteCorr += ` &= ${miseEnEvidence(produit.tex())}\\end{aligned}$`
            reponse = produit
          }

          break
        case 'quotient':
          {
            do {
              termes = inventeUneSomme(2)
            } while (termes[1].isReal)
            termes = inventeUneSomme(2)
            const denominator = termes[1].mul(termes[1].conjugue())
            texte += `\\dfrac{${termes[0].tex()}}{${termes[1].tex()}}`
            texteCorr = `Pour calculer un tel quotient, on multiplie le numérateur et le dénominateur par le conjugué du dénominateur :<br>
            $\\begin{aligned}${texte.slice(1).replace('=', '&=')}\\\\`
            texteCorr += `&= \\dfrac{${termes[0].parentheseSiComplexe()}\\times ${termes[1].conjugue().parentheseSiComplexe()}}{${termes[1].parentheseSiComplexe()}\\times ${termes[1].conjugue().parentheseSiComplexe()}}\\\\`
            texteCorr += `&= ${termes[0].tex()}\\times \\dfrac{${termes[1].conjugue().tex()}}{${denominator.tex()}}\\\\`

            texteCorr += `&= ${calculeProduit(termes[0], termes[1].conjugue())}`
              .split('\\\\')
              .map((s) =>
                s.replace('&=', `&=\\dfrac{1}{${denominator.tex()}}\\times(`),
              )
              .join(')\\\\')
            const numerateur = termes[0].mul(termes[1].conjugue())
            const quotient = termes[0].div(termes[1])
            texteCorr += `&=\\dfrac{${numerateur.tex()}}{${denominator.tex()}}\\\\
            &= ${miseEnEvidence(quotient.tex())}\\end{aligned}$`
            reponse = quotient
          }

          break

        case 'somme2':
          {
            const nbTermes = 3 // randint(3, 4)
            do {
              termes2 = inventeUneSomme2(nbTermes)
            } while (termes2.length < 3)

            texte += `${termes2[0].latex}
            ${termes2
              .slice(1)
              .map((c) => (c.latex.startsWith('-') ? c.latex : `+${c.latex}`))
              .join('')}`
            texteCorr += `$\\begin{aligned}${texte.slice(1).replace('=', '&=')}\\\\`
            texteCorr += `&= ${termes2[0].transformations[0]}${termes2
              .slice(1)
              .map((c) =>
                c.transformations[0].startsWith('-')
                  ? c.transformations[0]
                  : `+${c.transformations[0]}`,
              )
              .join('')}\\\\`
            if (termes2.some((c) => c.transformations.length > 1)) {
              texteCorr += `&= ${termes2[0].transformations[1] == null ? termes2[0].transformations[0] : termes2[0].transformations[1]}${termes2
                .slice(1)
                .map((c) =>
                  c.transformations[1] == null
                    ? c.transformations[0].startsWith('-')
                      ? c.transformations[0]
                      : `+${c.transformations[0]}`
                    : c.transformations[1].startsWith('-')
                      ? c.transformations[1]
                      : `+${c.transformations[1]}`,
                )
                .join('')}\\\\`
            }
            if (termes2.some((c) => c.transformations.length > 2)) {
              texteCorr += `&= ${termes2[0].transformations[2] == null ? (termes2[0].transformations[1] == null ? termes2[0].transformations[0] : termes2[0].transformations[1]) : termes2[0].transformations[2]}${termes2
                .slice(1)
                .map((c) =>
                  c.transformations[2] == null
                    ? c.transformations[1] == null
                      ? c.transformations[0].startsWith('-')
                        ? c.transformations[0]
                        : `+${c.transformations[0]}`
                      : c.transformations[1].startsWith('-')
                        ? c.transformations[1]
                        : `+${c.transformations[1]}`
                    : c.transformations[2].startsWith('-')
                      ? c.transformations[2]
                      : `+${c.transformations[2]}`,
                )
                .join('')}\\\\`
            }

            const somme = termes2
              .map((c) => c.result)
              .reduce((a: Complexe, b: Complexe) => a.add(b))

            texteCorr += ` &= ${miseEnEvidence(somme.tex())}
          \\end{aligned}$`
            reponse = somme
          }
          break
        case 'produit2':
          {
            do {
              facteurs = inventeUnProduit2(4)
            } while (facteurs.length < 4)
            texte += facteurs.map((c) => `${c.latex}`).join('')
            texteCorr += `$\\begin{aligned}${texte.slice(1).replace('=', '&=')}\\\\
            &= ${calculeProduit2(facteurs.slice())}`
            let produit: Complexe = new Complexe(1, 0)
            for (let j = 0; j < facteurs.length; j++) {
              produit = produit.mul(facteurs[j].z)
            }

            texteCorr += `&= ${miseEnEvidence(texNombre(Number(produit.tex())))}\\end{aligned}$`
            reponse = produit
          }
          break
        default:
          throw new Error(`Type de calcul inconnu : ${listeTypesDeCalculs[i]}`)
      }
      texte += '$'
      texteCorr += ''

      if (
        this.questionJamaisPosee(
          i,
          listeTypesDeCalculs[i] === 'somme2'
            ? termes2.map((c) => c.latex).join('')
            : listeTypesDeCalculs[i] === 'produit2'
              ? facteurs.map((c) => c.latex).join('')
              : termes.map((c) => c.tex()).join(''),
        )
      ) {
        if (this.interactif) {
          texte += ajouteChampTexteMathLive(this, i, KeyboardType.complexes, {
            texteAvant: `<br> $z_{${i + 1}}= $`,
          })
          handleAnswers(this, i, { reponse: { value: reponse.tex() } })
        }
        this.listeQuestions.push(texte)
        this.listeCorrections.push(texteCorr)
        i++
      }
      cpt++
    }
  }
}
