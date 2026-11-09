import { miseEnEvidence } from '../../lib/outils/embellissements'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { shuffle } from '../../lib/outils/arrayOutils'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  differenceDeDeuxFractions,
  obtenirListeFractionsIrreductibles,
  produitDeDeuxFractions,
  quotientDeDeuxFractions,
  sommeDeDeuxFractions,
} from '../../modules/fractions'
import { gestionnaireFormulaireTexte } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Calculer des expressions fractionnaires avec parenthèses'
export const amcReady = true
export const amcType = 'AMCNum'
export const interactifReady = true

/** Styles d'expressions :
 * 1 : produit avec une somme ou une différence
 * 2 : produit de deux sommes ou différences
 * 3 : Différence avec une différence
 * 4 : Quotient avec une somme ou une différence
 * 5 : Quotient de somme ou différence par une fraction
 * 6 : Quotient de sommes ou différences
 * @author Jean-claude Lhote
 */
export const uuid = '18dde'

export const refs = {
  'fr-fr': ['4C23-2'],
  'fr-ch': ['10LSNO3C-4', '11CTNO2B-4', '11LCNO2B-4', 'PRQNO13C-5'],
}

function supprimeDoublons(correction: string) {
  const parties = correction.split('=')
  const partiesSansDoublons: string[] = []
  for (const partie of parties) {
    if (!partiesSansDoublons.includes(partie.trim())) {
      partiesSansDoublons.push(partie.trim())
    }
  }
  return partiesSansDoublons.join('=')
}

function miseEnFormeCorrection(correction: string, colonne: boolean) {
  correction = supprimeDoublons(correction)
  // Le dernier membre est le résultat final : on le met en évidence
  const membres = correction.split('=')
  membres.push(miseEnEvidence(membres.pop() ?? ''))
  correction = membres.join('=')
  if (!colonne) {
    return `$${correction}$`
  }
  const lignesCorrection = correction.split('=')
  let correctionColonne = '$\\begin{aligned}'
  correctionColonne += `${lignesCorrection[0]}&=`
  correctionColonne += lignesCorrection.slice(1).join('\\\\\n&=')
  correctionColonne += '\\end{aligned}$'
  return correctionColonne
}

export default class ExerciceCalculFractionnairesAvecParenthèses extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      "Type d'expressions",
      `Nombres séparés par des tirets\n
  1 : produit avec une somme ou une différence\n
  2 : produit de deux sommes ou différences\n
  3 : Différence avec une différence\n
  4 : Quotient avec une somme ou une différence\n
  5 : Quotient de somme ou différence par une fraction\n
  6 : Quotient de sommes ou différences\n
  0 : Mélange`,
    ]
    this.besoinFormulaire2CaseACocher = ['Résultat irréductible', false]
    this.besoinFormulaire3CaseACocher = [
      'Présentation des calculs en colonnes',
      true,
    ]
    this.sup = '1'
    this.sup2 = false
    this.sup3 = true

    this.consigne = 'Calculer et donner un résultat simplifié au maximum.'
    this.nbCols = 2

    this.spacingCorr = 3
    this.nbQuestions = 6
    this.nbColsCorr = this.sup3 ? 2 : 1
  }

  nouvelleVersion() {
    // Définition des styles d'exercices
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 6,
      melange: 0,
      defaut: 0,
      nbQuestions: this.nbQuestions,
    }).map(Number)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let fractions = ''

      let compteur = 0
      const typesDeQuestions = listeTypeDeQuestions[i]
      const choixOperation = Math.random() < 0.5 ? '+' : '-'

      let reponse: FractionEtendue
      let texte = ''
      let texteCorr = ''
      do {
        const listeFractions = shuffle(obtenirListeFractionsIrreductibles())
        texte = ''
        texteCorr = ''
        fractions = ''
        reponse = new FractionEtendue(0, 1)
        switch (typesDeQuestions) {
          case 1:
            {
              // De la forme a/b (c/d ± e/f))
              // Vérification que fraction2 ± fraction3 n'est pas égal à 1 ou ±1
              let fraction1, fraction2, fraction3
              ;[fraction1, fraction2, fraction3] = listeFractions.splice(0, 3)

              let valide = false
              let tentatives = 0
              while (!valide && tentatives < 100) {
                ;[fraction1, fraction2, fraction3] = listeFractions.splice(0, 3)
                const somme = fraction2.sommeFraction(fraction3)
                const difference = fraction2.differenceFraction(fraction3)
                // Vérifier que la somme n'est pas 1 et que la différence n'est pas 1 ou -1
                const sommeEst1 = somme.isEqual(1)
                const differenceEst1 = difference.isEqual(1)
                const differenceEstMoins1 = difference.isEqual(-1)
                valide = !(sommeEst1 || differenceEst1 || differenceEstMoins1)
                if (!valide) {
                  // Remettre les fractions dans la liste si elles ne sont pas valides
                  listeFractions.unshift(fraction1, fraction2, fraction3)

                  tentatives++
                }
              }
              fractions +=
                fraction1.texFraction +
                fraction2.texFraction +
                fraction3.texFraction
              const etapes =
                choixOperation === '+'
                  ? sommeDeDeuxFractions(fraction2, fraction3, this.sup2)
                  : differenceDeDeuxFractions(fraction2, fraction3, this.sup2)
              texte += `${fraction1.texFraction}\\times \\left(${fraction2.texFraction}${choixOperation}${fraction3.texFraction}\\right)`
              reponse =
                choixOperation === '+'
                  ? fraction1.produitFraction(
                      fraction2.sommeFraction(fraction3),
                    )
                  : fraction1.produitFraction(
                      fraction2.differenceFraction(fraction3),
                    )
              texteCorr += `${fraction1.texFraction} \\times \\left(${etapes[0]}\\right)`
              for (const etape of etapes.slice(1, -1)) {
                texteCorr += `= ${fraction1.texFraction}${(etape?.match(/\\dfrac/g) ?? []).length > 1 ? '\\left(' : '\\times '}${etape}${(etape?.match(/\\dfrac/g) ?? []).length > 1 ? '\\right)' : ''} `
              }
              if (choixOperation === '+') {
                if (fraction2.sommeFraction(fraction3).estEntiere) {
                  texteCorr += `=${produitDeDeuxFractions(
                    fraction1,
                    fraction2.sommeFraction(fraction3),
                    this.sup2,
                  )
                    .slice(1)
                    .join('=')}`
                } else {
                  texteCorr += `=${produitDeDeuxFractions(
                    fraction1,
                    fraction2.sommeFraction(fraction3),
                    this.sup2,
                  ).join('=')}`
                }
              } else {
                if (fraction2.differenceFraction(fraction3).estEntiere) {
                  texteCorr += `=${produitDeDeuxFractions(
                    fraction1,
                    fraction2.differenceFraction(fraction3),
                    this.sup2,
                  )
                    .slice(1)
                    .join('=')}`
                } else {
                  texteCorr += `=${produitDeDeuxFractions(
                    fraction1,
                    fraction2.differenceFraction(fraction3),
                    this.sup2,
                  ).join('=')}`
                }
              }
            }
            break
          case 2: // De la forme : (a/b ± c/d) × (e/f ± g/h)
            {
              const choixOperation2 = Math.random() < 0.5 ? '+' : '-'
              // Vérification que les deux facteurs ne soient pas égaux à 1 ou -1
              let fraction1, fraction2, fraction3, fraction4
              let valide = false
              let tentatives = 0
              while (!valide && tentatives < 100) {
                ;[fraction1, fraction2, fraction3, fraction4] =
                  listeFractions.splice(0, 4)
                const facteur1 =
                  choixOperation === '+'
                    ? fraction1.sommeFraction(fraction2)
                    : fraction1.differenceFraction(fraction2)
                const facteur2 =
                  choixOperation2 === '+'
                    ? fraction3.sommeFraction(fraction4)
                    : fraction3.differenceFraction(fraction4)
                // Vérifier qu'aucun facteur n'est égal à 1 ou -1
                const facteur1Est1 = facteur1.isEqual(1)
                const facteur1EstMoins1 = facteur1.isEqual(-1)
                const facteur2Est1 = facteur2.isEqual(1)
                const facteur2EstMoins1 = facteur2.isEqual(-1)
                valide = !(
                  facteur1Est1 ||
                  facteur1EstMoins1 ||
                  facteur2Est1 ||
                  facteur2EstMoins1
                )
                if (!valide) {
                  // Remettre les fractions dans la liste si elles ne sont pas valides
                  listeFractions.unshift(
                    fraction1,
                    fraction2,
                    fraction3,
                    fraction4,
                  )

                  tentatives++
                }
              }
              if (
                fraction1 === undefined ||
                fraction2 === undefined ||
                fraction3 === undefined ||
                fraction4 === undefined
              ) {
                // Pas d'inquétude, on sort toujours avec les 4 fractions définies même si l'on dépasse le nombre de tentatives
                throw new Error(
                  "Impossible de générer des fractions valides pour l'expression.",
                )
              }
              fractions +=
                fraction1.texFraction +
                fraction2.texFraction +
                fraction3.texFraction +
                fraction4.texFraction
              const etapes1 =
                choixOperation === '+'
                  ? sommeDeDeuxFractions(fraction1, fraction2, this.sup2)
                  : differenceDeDeuxFractions(fraction1, fraction2, this.sup2)
              const etapes2 =
                choixOperation2 === '+'
                  ? sommeDeDeuxFractions(fraction3, fraction4, this.sup2)
                  : differenceDeDeuxFractions(fraction3, fraction4, this.sup2)
              texte += `\\left(${fraction1.texFraction}${choixOperation}${fraction2.texFraction}\\right)\\times \\left(${fraction3.texFraction}${choixOperation2}${fraction4.texFraction}\\right)`
              reponse =
                choixOperation === '+'
                  ? choixOperation2 === '+'
                    ? fraction1
                        .sommeFraction(fraction2)
                        .produitFraction(fraction3.sommeFraction(fraction4))
                    : fraction1
                        .sommeFraction(fraction2)
                        .produitFraction(
                          fraction3.differenceFraction(fraction4),
                        )
                  : choixOperation2 === '+'
                    ? fraction1
                        .differenceFraction(fraction2)
                        .produitFraction(fraction3.sommeFraction(fraction4))
                    : fraction1
                        .differenceFraction(fraction2)
                        .produitFraction(
                          fraction3.differenceFraction(fraction4),
                        )
              texteCorr += `\\left(${etapes1[0]}\\right) \\times \\left(${etapes2[0]}\\right)`
              if (etapes1.length === etapes2.length) {
                for (const etape of etapes1.slice(1, -1)) {
                  const matches = etape?.match(/\\dfrac/g) ?? []
                  const nbFrac = matches.length
                  if (nbFrac > 1) {
                    texteCorr += `= \\left(${etape}\\right) \\times \\left(${etapes2[etapes1.indexOf(etape)]}\\right) `
                  } else {
                    texteCorr += `= ${etape} \\times ${etapes2[etapes1.indexOf(etape)]}`
                  }
                }
                texteCorr += `=${produitDeDeuxFractions(
                  choixOperation === '+'
                    ? fraction1.sommeFraction(fraction2)
                    : fraction1.differenceFraction(fraction2),
                  choixOperation2 === '+'
                    ? fraction3.sommeFraction(fraction4)
                    : fraction3.differenceFraction(fraction4),
                  this.sup2,
                ).join('=')}`
              } else {
                // Cas où les deux opérations n'ont pas le même nombre d'étapes
                // Cela peut arriver dans deux cas de figure :
                // l'une des opération se fait avec den commun et l'autre sans
                // l'une des opérations donne un résultat à simplifier et l'autre non
                // On garde toujours l'ordre des facteurs: etapes1 × etapes2
                const minLength = Math.min(etapes1.length, etapes2.length)
                for (let i = 1; i < minLength - 1; i++) {
                  const matchesFacteur1 = etapes1[i]?.match(/\\dfrac/g) ?? []
                  const nbFracFacteur1 = matchesFacteur1.length
                  const matchesFacteur2 = etapes2[i]?.match(/\\dfrac/g) ?? []
                  const nbFracFacteur2 = matchesFacteur2.length
                  texteCorr += `=${nbFracFacteur1 > 1 ? `\\left(${etapes1[i]}\\right)` : etapes1[i]} \\times ${nbFracFacteur2 > 1 ? `\\left(${etapes2[i]}\\right)` : etapes2[i]} `
                }
                // Continuer avec les étapes supplémentaires
                if (etapes1.length > etapes2.length) {
                  for (
                    let j = etapes2.length - 1;
                    j < etapes1.length - 1;
                    j++
                  ) {
                    const matchesFacteur1 = etapes1[j]?.match(/\\dfrac/g) ?? []
                    const nbFracFacteur1 = matchesFacteur1.length
                    texteCorr += `= ${nbFracFacteur1 > 1 ? `\\left(${etapes1[j]}\\right)` : etapes1[j]}\\times ${etapes2[etapes2.length - 1]} `
                  }
                } else if (etapes2.length > etapes1.length) {
                  for (
                    let j = etapes1.length - 1;
                    j < etapes2.length - 1;
                    j++
                  ) {
                    const matchesFacteur2 = etapes2[j]?.match(/\\dfrac/g) ?? []
                    const nbFracFacteur2 = matchesFacteur2.length
                    texteCorr += `= ${etapes1[etapes1.length - 1]}\\times ${nbFracFacteur2 > 1 ? `\\left(${etapes2[j]}\\right)` : etapes2[j]} `
                  }
                }
                texteCorr += `=${produitDeDeuxFractions(
                  choixOperation === '+'
                    ? fraction1.sommeFraction(fraction2)
                    : fraction1.differenceFraction(fraction2),
                  choixOperation2 === '+'
                    ? fraction3.sommeFraction(fraction4)
                    : fraction3.differenceFraction(fraction4),
                  this.sup2,
                ).join('=')}`
              }
            }
            break
          case 3: // De la forme : a/b - (c/d ± e/f)
            {
              const choixOperation2 = Math.random() < 0.5 ? '+' : '-'
              let fraction1, fraction2, fraction3
              ;[fraction1, fraction2, fraction3] = listeFractions.splice(0, 3)
              let valide = false
              let tentatives = 0
              while (!valide && tentatives < 100) {
                ;[fraction1, fraction2, fraction3] = listeFractions.splice(0, 3)
                const somme = fraction2.sommeFraction(fraction3)
                const difference = fraction2.differenceFraction(fraction3)
                // Vérifier que la somme n'est pas 1 et que la différence n'est pas 1 ou -1
                const sommeEstEntiere = somme.estEntiere
                const differenceEstEntiere = difference.estEntiere
                valide = !(sommeEstEntiere || differenceEstEntiere)
                if (!valide) {
                  // Remettre les fractions dans la liste si elles ne sont pas valides
                  listeFractions.unshift(fraction1, fraction2, fraction3)
                  tentatives++
                }
              }
              if (
                fraction1 === undefined ||
                fraction2 === undefined ||
                fraction3 === undefined
              ) {
                // Pas d'inquétude, on sort toujours avec les 3 fractions définies même si l'on dépasse le nombre de tentatives
                throw new Error(
                  "Impossible de générer des fractions valides pour l'expression.",
                )
              }
              fractions +=
                fraction1.texFraction +
                fraction2.texFraction +
                fraction3.texFraction
              const etapes =
                choixOperation2 === '+'
                  ? sommeDeDeuxFractions(fraction2, fraction3, this.sup2)
                  : differenceDeDeuxFractions(fraction2, fraction3, this.sup2)
              texte += `${fraction1.texFraction}-\\left(${fraction2.texFraction}${choixOperation2}${fraction3.texFraction}\\right)`
              reponse =
                choixOperation2 === '+'
                  ? fraction1.differenceFraction(
                      fraction2.sommeFraction(fraction3),
                    )
                  : fraction1.differenceFraction(
                      fraction2.differenceFraction(fraction3),
                    )
              texteCorr += `${fraction1.texFraction} - \\left(${etapes[0]}\\right)`
              for (const etape of etapes.slice(1, -1)) {
                const matches = etape?.match(/\\dfrac/g) ?? []
                const nbFrac = matches.length
                texteCorr += `= ${fraction1.texFraction} - ${nbFrac > 1 ? `\\left(${etape}\\right)` : etape} `
              }
              if (choixOperation2 === '+') {
                if (fraction2.sommeFraction(fraction3).estEntiere) {
                  texteCorr += `=${differenceDeDeuxFractions(
                    fraction1,
                    fraction2.sommeFraction(fraction3),
                    this.sup2,
                  )
                    .slice(1)
                    .join('=')}`
                } else {
                  texteCorr += `=${differenceDeDeuxFractions(
                    fraction1,
                    fraction2.sommeFraction(fraction3),
                    this.sup2,
                  ).join('=')}`
                }
              } else {
                if (fraction2.differenceFraction(fraction3).estEntiere) {
                  texteCorr += `=${differenceDeDeuxFractions(
                    fraction1,
                    fraction2.differenceFraction(fraction3),
                    this.sup2,
                  )
                    .slice(1)
                    .join('=')}`
                } else {
                  texteCorr += `=${differenceDeDeuxFractions(
                    fraction1,
                    fraction2.differenceFraction(fraction3),
                    this.sup2,
                  ).join('=')}`
                }
              }
            }
            break
          case 4: // De la forme : a/b \div (c/d ± e/f)
            {
              const choixOperation2 = Math.random() < 0.5 ? '+' : '-'
              let fraction1, fraction2, fraction3
              ;[fraction1, fraction2, fraction3] = listeFractions.splice(0, 3)
              let valide = false
              let tentatives = 0
              while (!valide && tentatives < 100) {
                ;[fraction1, fraction2, fraction3] = listeFractions.splice(0, 3)
                const somme = fraction2.sommeFraction(fraction3)
                const difference = fraction2.differenceFraction(fraction3)
                // Vérifier que la somme n'est pas 1 et que la différence n'est pas 1 ou -1
                const sommeEstEntiere = somme.estEntiere
                const differenceEstEntiere = difference.estEntiere
                valide = !(sommeEstEntiere || differenceEstEntiere)
                if (!valide) {
                  // Remettre les fractions dans la liste si elles ne sont pas valides
                  listeFractions.unshift(fraction1, fraction2, fraction3)
                  tentatives++
                }
              }
              fractions +=
                fraction1.texFraction +
                fraction2.texFraction +
                fraction3.texFraction
              const etapes =
                choixOperation2 === '+'
                  ? sommeDeDeuxFractions(fraction2, fraction3, this.sup2)
                  : differenceDeDeuxFractions(fraction2, fraction3, this.sup2)
              texte += `${fraction1.texFraction}\\div\\left(${fraction2.texFraction}${choixOperation2}${fraction3.texFraction}\\right)`
              reponse =
                choixOperation2 === '+'
                  ? fraction1.diviseFraction(fraction2.sommeFraction(fraction3))
                  : fraction1.diviseFraction(
                      fraction2.differenceFraction(fraction3),
                    )
              texteCorr += `${fraction1.texFraction} \\div \\left(${etapes[0]}\\right)`
              for (const etape of etapes.slice(1, -1)) {
                const matches = etape?.match(/\\dfrac/g) ?? []
                const nbFrac = matches.length
                texteCorr += `= ${fraction1.texFraction} \\div ${nbFrac > 1 ? `\\left(${etape}\\right)` : etape} `
              }
              texteCorr += `= ${fraction1.texFraction} \\div ${choixOperation2 === '+' ? fraction2.sommeFraction(fraction3).texFraction : fraction2.differenceFraction(fraction3).texFraction}`
              // On termine par la division
              if (choixOperation2 === '+') {
                if (fraction2.sommeFraction(fraction3).estEntiere) {
                  texteCorr += `=${produitDeDeuxFractions(
                    fraction1,
                    fraction2.sommeFraction(fraction3).inverse(),
                    this.sup2,
                  )
                    .slice(1)
                    .join('=')}`
                } else {
                  texteCorr += `=${produitDeDeuxFractions(
                    fraction1,
                    fraction2.sommeFraction(fraction3).inverse(),
                    this.sup2,
                  ).join('=')}`
                }
              } else {
                if (fraction2.differenceFraction(fraction3).estEntiere) {
                  texteCorr += `=${produitDeDeuxFractions(
                    fraction1,
                    fraction2.differenceFraction(fraction3).inverse(),
                    this.sup2,
                  )
                    .slice(1)
                    .join('=')}`
                } else {
                  texteCorr += `=${produitDeDeuxFractions(
                    fraction1,
                    fraction2.differenceFraction(fraction3).inverse(),
                    this.sup2,
                  ).join('=')}`
                }
              }
            }
            break
          case 5: // De la forme : (a/b ± c/d) ÷ e/f
            {
              let fraction1, fraction2, fraction3
              ;[fraction1, fraction2, fraction3] = listeFractions.splice(0, 3)
              let valide = false
              let tentatives = 0
              while (!valide && tentatives < 100) {
                ;[fraction1, fraction2, fraction3] = listeFractions.splice(0, 3)
                const somme = fraction1.sommeFraction(fraction2)
                const difference = fraction1.differenceFraction(fraction2)
                // Vérifier que la somme n'est pas 1 et que la différence n'est pas 1 ou -1
                const sommeEstEntiere = somme.estEntiere
                const differenceEstEntiere = difference.estEntiere
                valide = !(sommeEstEntiere || differenceEstEntiere)
                if (!valide) {
                  // Remettre les fractions dans la liste si elles ne sont pas valides
                  listeFractions.unshift(fraction1, fraction2, fraction3)
                  tentatives++
                }
              }
              fractions +=
                fraction1.texFraction +
                fraction2.texFraction +
                fraction3.texFraction
              const etapes =
                choixOperation === '+'
                  ? sommeDeDeuxFractions(fraction1, fraction2, this.sup2)
                  : differenceDeDeuxFractions(fraction1, fraction2, this.sup2)
              texte += `\\left(${fraction1.texFraction}${choixOperation}${fraction2.texFraction}\\right)\\div ${fraction3.texFraction}`
              reponse =
                choixOperation === '+'
                  ? fraction1.sommeFraction(fraction2).diviseFraction(fraction3)
                  : fraction1
                      .differenceFraction(fraction2)
                      .diviseFraction(fraction3)
              texteCorr += `\\left(${etapes[0]}\\right) \\div ${fraction3.texFraction}`
              for (const etape of etapes.slice(1, -1)) {
                const matches = etape?.match(/\\dfrac/g) ?? []
                const nbFrac = matches.length
                texteCorr += `= ${nbFrac > 1 ? `\\left(${etape}\\right)` : etape} \\div ${fraction3.texFraction} `
              }
              texteCorr += `= ${choixOperation === '+' ? fraction1.sommeFraction(fraction2).texFraction : fraction1.differenceFraction(fraction2).texFraction} \\div ${fraction3.texFraction}`
              // On termine par la division
              if (choixOperation === '+') {
                if (fraction1.sommeFraction(fraction2).estEntiere) {
                  texteCorr += `=${produitDeDeuxFractions(
                    fraction1.sommeFraction(fraction2),
                    fraction3.inverse(),
                    this.sup2,
                  )
                    .slice(1)
                    .join('=')}`
                } else {
                  texteCorr += `=${produitDeDeuxFractions(
                    fraction1.sommeFraction(fraction2),
                    fraction3.inverse(),
                    this.sup2,
                  ).join('=')}`
                }
              } else {
                if (fraction1.differenceFraction(fraction2).estEntiere) {
                  texteCorr += `=${produitDeDeuxFractions(
                    fraction1.differenceFraction(fraction2),
                    fraction3.inverse(),
                    this.sup2,
                  )
                    .slice(1)
                    .join('=')}`
                } else {
                  texteCorr += `=${produitDeDeuxFractions(
                    fraction1.differenceFraction(fraction2),
                    fraction3.inverse(),
                    this.sup2,
                  ).join('=')}`
                }
              }
            }
            break
          case 6: // De la forme : (a/b ± c/d) ÷( e/f ± g/h)
          default:
            {
              const choixOperation2 = Math.random() < 0.5 ? '+' : '-'
              let fraction1, fraction2, fraction3, fraction4
              ;[fraction1, fraction2, fraction3, fraction4] =
                listeFractions.splice(0, 4)
              let valide = false
              let tentatives = 0
              while (!valide && tentatives < 100) {
                ;[fraction1, fraction2, fraction3, fraction4] =
                  listeFractions.splice(0, 4)
                const somme = fraction3.sommeFraction(fraction4)
                const difference = fraction3.differenceFraction(fraction4)
                // Vérifier que la somme n'est pas 1 et que la différence n'est pas 1 ou -1
                const sommeEstEntiere = somme.estEntiere
                const differenceEstEntiere = difference.estEntiere
                valide = !(sommeEstEntiere || differenceEstEntiere)
                if (!valide) {
                  // Remettre les fractions dans la liste si elles ne sont pas valides
                  listeFractions.unshift(
                    fraction1,
                    fraction2,
                    fraction3,
                    fraction4,
                  )
                  tentatives++
                }
              }
              fractions +=
                fraction1.texFraction +
                fraction2.texFraction +
                fraction3.texFraction +
                fraction4.texFraction
              const etapes1 =
                choixOperation === '+'
                  ? sommeDeDeuxFractions(fraction1, fraction2, this.sup2)
                  : differenceDeDeuxFractions(fraction1, fraction2, this.sup2)
              const etapes2 =
                choixOperation2 === '+'
                  ? sommeDeDeuxFractions(fraction3, fraction4, this.sup2)
                  : differenceDeDeuxFractions(fraction3, fraction4, this.sup2)
              texte += `\\left(${fraction1.texFraction}${choixOperation}${fraction2.texFraction}\\right)\\div \\left(${fraction3.texFraction}${choixOperation2}${fraction4.texFraction}\\right)`
              reponse =
                choixOperation === '+'
                  ? choixOperation2 === '+'
                    ? fraction1
                        .sommeFraction(fraction2)
                        .diviseFraction(fraction3.sommeFraction(fraction4))
                    : fraction1
                        .sommeFraction(fraction2)
                        .diviseFraction(fraction3.differenceFraction(fraction4))
                  : choixOperation2 === '+'
                    ? fraction1
                        .differenceFraction(fraction2)
                        .diviseFraction(fraction3.sommeFraction(fraction4))
                    : fraction1
                        .differenceFraction(fraction2)
                        .diviseFraction(fraction3.differenceFraction(fraction4))
              texteCorr += `\\left(${etapes1[0]}\\right) \\div \\left(${etapes2[0]}\\right)`
              if (etapes1.length === etapes2.length) {
                for (const etape of etapes1.slice(1)) {
                  const matchesDividende = etape?.match(/\\dfrac/g) ?? []
                  const nbFracDividende = matchesDividende.length
                  const matchesDiviseur =
                    etapes2[etapes1.indexOf(etape)]?.match(/\\dfrac/g) ?? []
                  const nbFracDiviseur = matchesDiviseur.length
                  if (nbFracDividende > 1 && nbFracDiviseur > 1) {
                    texteCorr += `= \\left(${etape}\\right) \\div \\left(${etapes2[etapes1.indexOf(etape)]}\\right) `
                  } else if (nbFracDividende > 1 && nbFracDiviseur <= 1) {
                    texteCorr += `= \\left(${etape}\\right) \\div ${etapes2[etapes1.indexOf(etape)]} `
                  } else if (nbFracDividende <= 1 && nbFracDiviseur > 1) {
                    texteCorr += `= ${etape} \\div \\left(${etapes2[etapes1.indexOf(etape)]}\\right) `
                  } else {
                    texteCorr += `= ${etape} \\div ${etapes2[etapes1.indexOf(etape)]} `
                  }
                }
              } else {
                const minLength = Math.min(etapes1.length, etapes2.length)
                for (let i = 1; i < minLength; i++) {
                  const etapeDividende = etapes1[i]
                  const etapeDiviseur = etapes2[i]
                  const matchesDividende =
                    etapeDividende?.match(/\\dfrac/g) ?? []
                  const nbFracDividende = matchesDividende.length
                  const matchesDiviseur = etapeDiviseur?.match(/\\dfrac/g) ?? []
                  const nbFracDiviseur = matchesDiviseur.length
                  if (nbFracDividende > 1 && nbFracDiviseur > 1) {
                    texteCorr += `= \\left(${etapeDividende}\\right) \\div \\left(${etapeDiviseur}\\right) `
                  } else if (nbFracDividende > 1 && nbFracDiviseur <= 1) {
                    texteCorr += `= \\left(${etapeDividende}\\right) \\div ${etapeDiviseur} `
                  } else if (nbFracDividende <= 1 && nbFracDiviseur > 1) {
                    texteCorr += `= ${etapeDividende} \\div \\left(${etapeDiviseur}\\right) `
                  } else {
                    texteCorr += `= ${etapeDividende} \\div ${etapeDiviseur} `
                  }
                }
                if (etapes1.length > etapes2.length) {
                  const dernierDiviseur = etapes2[etapes2.length - 1]
                  const matchesDiviseur =
                    dernierDiviseur?.match(/\\dfrac/g) ?? []
                  const nbFracDiviseur = matchesDiviseur.length
                  for (let j = etapes2.length; j < etapes1.length; j++) {
                    const etapeDividende = etapes1[j]
                    const matchesDividende =
                      etapeDividende?.match(/\\dfrac/g) ?? []
                    const nbFracDividende = matchesDividende.length
                    if (nbFracDividende > 1 && nbFracDiviseur > 1) {
                      texteCorr += `= \\left(${etapeDividende}\\right) \\div \\left(${dernierDiviseur}\\right) `
                    } else if (nbFracDividende > 1 && nbFracDiviseur <= 1) {
                      texteCorr += `= \\left(${etapeDividende}\\right) \\div ${dernierDiviseur} `
                    } else if (nbFracDividende <= 1 && nbFracDiviseur > 1) {
                      texteCorr += `= ${etapeDividende} \\div \\left(${dernierDiviseur}\\right) `
                    } else {
                      texteCorr += `= ${etapeDividende} \\div ${dernierDiviseur} `
                    }
                  }
                } else if (etapes2.length > etapes1.length) {
                  const dernierDividende = etapes1[etapes1.length - 1]
                  const matchesDividende =
                    dernierDividende?.match(/\\dfrac/g) ?? []
                  const nbFracDividende = matchesDividende.length
                  for (let j = etapes1.length; j < etapes2.length; j++) {
                    const etapeDiviseur = etapes2[j]
                    const matchesDiviseur =
                      etapeDiviseur?.match(/\\dfrac/g) ?? []
                    const nbFracDiviseur = matchesDiviseur.length
                    if (nbFracDividende > 1 && nbFracDiviseur > 1) {
                      texteCorr += `= \\left(${dernierDividende}\\right) \\div \\left(${etapeDiviseur}\\right) `
                    } else if (nbFracDividende > 1 && nbFracDiviseur <= 1) {
                      texteCorr += `= \\left(${dernierDividende}\\right) \\div ${etapeDiviseur} `
                    } else if (nbFracDividende <= 1 && nbFracDiviseur > 1) {
                      texteCorr += `= ${dernierDividende} \\div \\left(${etapeDiviseur}\\right) `
                    } else {
                      texteCorr += `= ${dernierDividende} \\div ${etapeDiviseur} `
                    }
                  }
                }
              }
              //     texteCorr += `= ${choixOperation === '+' ? fraction1.sommeFraction(fraction2).texFraction : fraction1.differenceFraction(fraction2).texFraction} \\div ${choixOperation2 === '+' ? fraction3.sommeFraction(fraction4).texFraction : fraction3.differenceFraction(fraction4).texFraction}`
              const dividende =
                choixOperation === '+'
                  ? fraction1.sommeFraction(fraction2)
                  : fraction1.differenceFraction(fraction2)
              const diviseur =
                choixOperation2 === '+'
                  ? fraction3.sommeFraction(fraction4)
                  : fraction3.differenceFraction(fraction4)
              // On termine par la division
              texteCorr += `=${quotientDeDeuxFractions(
                dividende,
                diviseur,
                this.sup2,
              )
                .slice(1)
                .join('=')}`
            }
            break
        }
      } while (reponse.denIrred > 100 && compteur++ < 50)
      if (
        this.questionJamaisPosee(i, choixOperation, fractions, typesDeQuestions)
      ) {
        handleAnswers(this, i, {
          reponse: {
            value: this.sup2
              ? reponse.texFractionSimplifiee
              : reponse.texFraction,
            options: { fractionIrreductible: this.sup2 },
          },
        })
        this.listeQuestions[i] =
          `$${texte}$` +
          ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierDeBaseAvecFraction,
            { texteAvant: ' = ' },
          )
        this.listeCorrections[i] = miseEnFormeCorrection(texteCorr, this.sup3)
        i++
      }
      cpt++
    }
  }
}
