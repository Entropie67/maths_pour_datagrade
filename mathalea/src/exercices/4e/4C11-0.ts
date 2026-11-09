import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Effectuer des calculs complexes utilisant les priorités opératoires'
export const dateDePublication = '23/04/2025'
export const interactifReady = true

/**
 * Plusieurs types de calculs avec des nombres relatifs, incluant des expressions complexes avec parenthèses imbriquées.
 *
 * Types d'expressions:
 *1. Expressions simples

    Case  1: Expressions imbriquées simples: a - (b + (c - d))
    Case  9: Opérations de multiplication avec addition: a × b + c × d
    Case 10: Opérations de multiplication avec soustraction: a × b - c × d
    Case 11: Expression avec fraction et multiples opérations: a/b + c × d - e

2. Expressions complexes avec plusieurs niveaux de parenthèses

    Case  2: Expression avec multiplications imbriquées: a × (b + c × d)
    Case  4: Expression avec double niveau d'imbrication: a × (b - c × (d + e))
    Case  8: Expression très complexe à multiples niveaux: a × (b × (c + d × e + f) - g) + h

3. Expressions impliquant des fractions et des nombres décimaux

    Case  3: Expression complexe avec fractions: (a - b × c) / (d + e)
    Case  5: Expression avec nombre décimal et opérations multiples: a - (b + (c - d × e))
    Case  6: Expression combinant multiplication et addition avec nombres décimaux: a × (b + c) - (d + e) × f

4. Expressions avec multiples opérations et parenthèses imbriquées

    Case  7: Expression avec fraction complexe: [a × (b + c × d)] / [e + f × g]
    Case 12: Fraction complexe avec produits: (a - b × c) / (d × e + f)
 *
 *
 * @author Éric Elter
 */
export const uuid = '1bf3b'
export const refs = {
  'fr-fr': ['4C11-0'],
  'fr-ch': ['1mCN-14', '10LCNO2D-5', '10LSNO2D-5', '11CTNO1C-5', 'PRQNO13B-2'],
}

export default class PrioritesEtRelatifsComplex extends Exercice {
  constructor() {
    super()
    this.consigne = 'Calculer.'
    this.spacing = 2
    this.nbQuestions = 6
    this.nbCols = 2
    this.sup = 13
    this.sup2 = true
    this.besoinFormulaireTexte = [
      "Type d'expressions",
      [
        'Nombres séparés par des tirets  :',
        '1 : a - (b + (c - d))',
        '2 : a × (b + c × d)',
        '3 : (a - b × c) / (d + e)',
        '4 : a × (b - c × (d + e))',
        '5 : a - (b + (c - d × e))',
        '6 : a × (b + c) - (d + e) × f',
        '7 : [a × (b + c × d)] / [e + f × g]',
        '8 : a × (b × (c + d × e + f) - g) + h',
        '9 : a × b + c × d',
        '10 : a × b - c × d',
        '11 : a/b + c × d - e',
        '12 : (a - b × c) / (d × e + f)',
        '13 : Mélange',
      ].join('\n'),
    ]

    this.besoinFormulaire2CaseACocher = [
      'Présentation des corrections en colonnes',
      true,
    ]
    this.listeAvecNumerotation = false
  }

  nouvelleVersion() {
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 12,
      melange: 13,
      defaut: 13,
      nbQuestions: this.nbQuestions,
    })

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let a = 0
      let b = 0
      let c = 0
      let d, e, f, g, h
      let resultat: string = '0'

      switch (listeTypeDeQuestions[i]) {
        case 1: {
          // Expressions imbriquées simples: a - (b + (c - d))
          a = randint(2, 15) * choice([-1, 1])
          b = randint(2, 10) * choice([-1, 1])
          c = randint(2, 10) * choice([-1, 1])
          d = randint(2, 10) * choice([-1, 1])
          texte = `$${lettreDepuisChiffre(i + 1)} = ${a} - (${b} + (${c} - ${ecritureParentheseSiNegatif(d)}))$`
          // Calcul étape par étape
          const etape1 = c - d
          const etape2 = b + etape1
          resultat = texNombre(a - etape2)
          texteCorr = `$${lettreDepuisChiffre(i + 1)} = ${a} - (${b} + (${miseEnEvidence(c + ' - ' + ecritureParentheseSiNegatif(d), bleuMathalea)}))`
          if (d < 0) {
            texteCorr += `= ${a} - (${b} + (${miseEnEvidence(c + ' + ' + -d, bleuMathalea)}))`
          }
          texteCorr += `= ${a} - (${miseEnEvidence(b + ' + ' + ecritureParentheseSiNegatif(etape1), bleuMathalea)})`
          texteCorr += `= ${a} - ${ecritureParentheseSiNegatif(etape2)}`
          if (etape2 < 0) texteCorr += `= ${a} + ${-etape2}`
          break
        }
        case 2: {
          // Expression avec multiplications imbriquées: a × (b + c × d)
          a = randint(2, 8) * choice([-1, 1])
          b = randint(2, 8) * choice([-1, 1])
          c = randint(2, 5) * choice([-1, 1])
          d = randint(2, 5) * choice([-1, 1])
          texte = `$${lettreDepuisChiffre(i + 1)} = ${a} \\times (${b} + ${ecritureParentheseSiNegatif(c)} \\times ${ecritureParentheseSiNegatif(d)})$`
          // Calcul étape par étape
          const etape1Q22 = c * d
          const etape2Q22 = b + etape1Q22
          resultat = texNombre(a * etape2Q22)
          texteCorr = `$${lettreDepuisChiffre(i + 1)} = ${a} \\times (${b} + ${miseEnEvidence(ecritureParentheseSiNegatif(c) + ' \\times ' + ecritureParentheseSiNegatif(d), bleuMathalea)})`
          texteCorr += `= ${a} \\times (${miseEnEvidence(`${b} + ${ecritureParentheseSiNegatif(etape1Q22)}`, bleuMathalea)})`
          texteCorr += `= ${a} \\times ${ecritureParentheseSiNegatif(etape2Q22)}`
          break
        }
        case 3: {
          // Expression complexe avec fractions: (a - b × c) / (d + e)
          d = randint(2, 5) * choice([-1, 1])
          e = randint(1, 5) * choice([-1, 1])
          // Pour éviter division par zéro
          while (d + e === 0) {
            d = randint(2, 5) * choice([-1, 1])
            e = randint(1, 5) * choice([-1, 1])
          }
          b = randint(2, 5) * choice([-1, 1])
          c = randint(2, 5) * choice([-1, 1])
          a = b * c + randint(1, 10) * choice([-1, 1])
          texte = `$${lettreDepuisChiffre(i + 1)} = \\dfrac{${a} - ${ecritureParentheseSiNegatif(b)} \\times ${ecritureParentheseSiNegatif(c)}}{${d} + ${ecritureParentheseSiNegatif(e)}}$`
          // Calcul étape par étape
          const etape1Q23 = b * c
          const etape2Q23 = a - etape1Q23
          const etape3Q23 = d + e
          resultat = new FractionEtendue(etape2Q23, etape3Q23)
            .texFractionSimplifiee
          texteCorr = `$${lettreDepuisChiffre(i + 1)} = \\dfrac{${a} - ${miseEnEvidence(ecritureParentheseSiNegatif(b) + ' \\times ' + ecritureParentheseSiNegatif(c), bleuMathalea)}}{${miseEnEvidence(d + ' + ' + ecritureParentheseSiNegatif(e), bleuMathalea)}}`
          texteCorr += `= \\dfrac{${miseEnEvidence(`${a} - ${ecritureParentheseSiNegatif(etape1Q23)}`, bleuMathalea)}}{${etape3Q23}}`
          if (etape1Q23 < 0) {
            texteCorr += `= \\dfrac{${miseEnEvidence(`${a} + ${-etape1Q23}`, bleuMathalea)}}{${etape3Q23}}`
          }
          if (!(etape2Q23 > 0 && etape3Q23 > 0)) {
            texteCorr += `= \\dfrac{${etape2Q23}}{${etape3Q23}}`
          }
          break
        }
        case 4: {
          // Expression avec double niveau d'imbrication: a × (b - c × (d + e))
          a = randint(2, 5) * choice([-1, 1])
          b = randint(5, 15) * choice([-1, 1])
          c = randint(2, 4) * choice([-1, 1])
          d = randint(2, 5) * choice([-1, 1])
          e = randint(1, 5) * choice([-1, 1])
          texte = `$${lettreDepuisChiffre(i + 1)} = ${a} \\times (${b} - ${ecritureParentheseSiNegatif(c)} \\times (${d} + ${ecritureParentheseSiNegatif(e)}))$`
          // Calcul étape par étape
          const etape1Q24 = d + e
          const etape2Q24 = c * etape1Q24
          const etape3Q24 = b - etape2Q24
          resultat = texNombre(a * etape3Q24)
          texteCorr = `$${lettreDepuisChiffre(i + 1)} = ${a} \\times (${b} - ${ecritureParentheseSiNegatif(c)} \\times (${miseEnEvidence(d + ' + ' + ecritureParentheseSiNegatif(e), bleuMathalea)}))`
          texteCorr += `= ${a} \\times (${b} - ${miseEnEvidence(ecritureParentheseSiNegatif(c) + ' \\times ' + ecritureParentheseSiNegatif(etape1Q24), bleuMathalea)})`
          texteCorr += `= ${a} \\times (${miseEnEvidence(b + ' - ' + ecritureParentheseSiNegatif(etape2Q24), bleuMathalea)})`
          if (etape2Q24 < 0) {
            texteCorr += `= ${a} \\times (${miseEnEvidence(b + ' + ' + -etape2Q24, bleuMathalea)})`
          }
          texteCorr += `= ${a} \\times ${ecritureParentheseSiNegatif(etape3Q24)}`
          break
        }
        case 5: {
          // Expression avec nombre décimal et opérations multiples: a - (b + (c - d × e))
          a = randint(2, 7) * choice([-1, 1])
          b = (randint(2, 10) + 0.5) * choice([-1, 1])
          c = randint(2, 4) * choice([-1, 1])
          d = randint(2, 5) * choice([-1, 1])
          e = randint(1, 5) * choice([-1, 1])
          texte = `$${lettreDepuisChiffre(i + 1)} = ${a} - (${texNombre(b)} + (${c} - ${ecritureParentheseSiNegatif(d)} \\times ${ecritureParentheseSiNegatif(e)}))$`
          // Calcul étape par étape
          const etape1Q25 = d * e
          const etape2Q25 = c - etape1Q25
          const etape3Q25 = b + etape2Q25
          resultat = texNombre(a - etape3Q25)
          texteCorr = `$${lettreDepuisChiffre(i + 1)} = ${a} - (${texNombre(b)} + (${c} - ${miseEnEvidence(ecritureParentheseSiNegatif(d) + ' \\times ' + ecritureParentheseSiNegatif(e), bleuMathalea)}))`
          texteCorr += `= ${a} - (${texNombre(b)} + (${miseEnEvidence(c + ' - ' + ecritureParentheseSiNegatif(etape1Q25), bleuMathalea)}))`
          if (etape1Q25 < 0) {
            texteCorr += `= ${a} - (${texNombre(b)} + (${miseEnEvidence(c + ' + ' + -etape1Q25, bleuMathalea)}))`
          }
          texteCorr += `= ${a} - (${miseEnEvidence(texNombre(b) + ' + ' + ecritureParentheseSiNegatif(etape2Q25), bleuMathalea)})`
          texteCorr += `= ${a} - ${ecritureParentheseSiNegatif(etape3Q25)}`
          if (etape3Q25 < 0) {
            texteCorr += `= ${a} + ${ecritureParentheseSiNegatif(-etape3Q25)}`
          }
          break
        }
        case 6: {
          // Expression combinant multiplication et addition avec nombres décimaux: a × (b + c) - (d + e) × f
          a = randint(2, 7) * choice([-1, 1])
          b = (randint(2, 10) / 2) * choice([-1, 1])
          c = (randint(2, 10) / 2) * choice([-1, 1])
          d = randint(2, 5) * choice([-1, 1])
          e = randint(1, 5) * choice([-1, 1])
          f = (randint(1, 5) + 0.5) * choice([-1, 1])
          texte = `$${lettreDepuisChiffre(i + 1)} = ${a} \\times (${texNombre(b)} + ${ecritureParentheseSiNegatif(c)}) - (${d} + ${ecritureParentheseSiNegatif(e)}) \\times ${ecritureParentheseSiNegatif(f)}$`
          // Calcul étape par étape
          const etape1Q26 = b + c
          const etape2Q26 = a * etape1Q26
          const etape3Q26 = d + e
          const etape4Q26 = etape3Q26 * f
          resultat = texNombre(etape2Q26 - etape4Q26)
          texteCorr = `$${lettreDepuisChiffre(i + 1)} = ${a} \\times (${miseEnEvidence(texNombre(b) + ' + ' + ecritureParentheseSiNegatif(c), bleuMathalea)}) - (${miseEnEvidence(d + ' + ' + ecritureParentheseSiNegatif(e), bleuMathalea)}) \\times ${ecritureParentheseSiNegatif(f)}`
          texteCorr += `= ${miseEnEvidence(a + ' \\times ' + ecritureParentheseSiNegatif(etape1Q26), bleuMathalea)} - ${miseEnEvidence(ecritureParentheseSiNegatif(etape3Q26) + ' \\times ' + ecritureParentheseSiNegatif(f), bleuMathalea)}`
          texteCorr += `= ${texNombre(etape2Q26)} - ${ecritureParentheseSiNegatif(etape4Q26)}`
          break
        }
        case 7: {
          // Expression avec fraction complexe: [a × (b + c × d)] / [e + f × g]
          a = randint(2, 7) * choice([-1, 1])
          b = randint(2, 5) * choice([-1, 1])
          c = randint(2, 5) * choice([-1, 1])
          d = randint(2, 5) * choice([-1, 1])
          e = randint(2, 5) * choice([-1, 1])
          f = randint(2, 5) * choice([-1, 1])
          g = randint(2, 10) * choice([-1, 1])
          texte = `$${lettreDepuisChiffre(i + 1)} = \\dfrac{${a} \\times (${b} + ${ecritureParentheseSiNegatif(c)} \\times ${ecritureParentheseSiNegatif(d)})}{${e} + ${ecritureParentheseSiNegatif(f)} \\times ${ecritureParentheseSiNegatif(g)}}$`
          // Calcul étape par étape
          const etape1Q27 = c * d
          const etape2Q27 = b + etape1Q27
          const etape3Q27 = a * etape2Q27
          const etape4Q27 = f * g
          const etape5Q27 = e + etape4Q27
          resultat = new FractionEtendue(etape3Q27, etape5Q27).texFSD
          texteCorr = `$${lettreDepuisChiffre(i + 1)} = \\dfrac{${a} \\times (${b} + ${miseEnEvidence(ecritureParentheseSiNegatif(c) + ' \\times ' + ecritureParentheseSiNegatif(d), bleuMathalea)})}{${e} + ${miseEnEvidence(ecritureParentheseSiNegatif(f) + ' \\times ' + ecritureParentheseSiNegatif(g), bleuMathalea)}}`
          texteCorr += `= \\dfrac{${a} \\times (${miseEnEvidence(b + ' + ' + ecritureParentheseSiNegatif(etape1Q27), bleuMathalea)})}{${miseEnEvidence(e + ' + ' + ecritureParentheseSiNegatif(etape4Q27), bleuMathalea)}}`
          texteCorr += `= \\dfrac{${a} \\times ${ecritureParentheseSiNegatif(etape2Q27)}}{${etape5Q27}}`
          if (!(etape3Q27 > 0 && etape5Q27 > 0)) {
            texteCorr += `= \\dfrac{${etape3Q27}}{${etape5Q27}}`
          }
          break
        }
        case 8: {
          // Expression très complexe à multiples niveaux: a × (b × (c + d × e + f) - g) + h
          a = randint(2, 7) * choice([-1, 1])
          b = randint(2, 5) * choice([-1, 1])
          c = randint(2, 5) * choice([-1, 1])
          d = randint(2, 5) * choice([-1, 1])
          e = randint(2, 5) * choice([-1, 1])
          f = randint(2, 5) * choice([-1, 1])
          g = randint(2, 10) * choice([-1, 1])
          h = randint(2, 10) * choice([-1, 1])
          texte = `$${lettreDepuisChiffre(i + 1)} = ${a} \\times (${b} \\times (${c} + ${ecritureParentheseSiNegatif(d)} \\times ${ecritureParentheseSiNegatif(e)} + ${ecritureParentheseSiNegatif(f)}) - ${ecritureParentheseSiNegatif(g)}) + ${ecritureParentheseSiNegatif(h)}$`
          // Calcul étape par étape
          const etape1Q28 = d * e
          const etape2Q28 = c + etape1Q28 + f
          const etape3Q28 = b * etape2Q28
          const etape4Q28 = etape3Q28 - g
          const etape5Q28 = a * etape4Q28
          resultat = texNombre(etape5Q28 + h)
          texteCorr = `$${lettreDepuisChiffre(i + 1)} = ${a} \\times (${b} \\times (${c} + ${miseEnEvidence(ecritureParentheseSiNegatif(d) + ' \\times ' + ecritureParentheseSiNegatif(e), bleuMathalea)} + ${ecritureParentheseSiNegatif(f)}) - ${ecritureParentheseSiNegatif(g)}) + ${ecritureParentheseSiNegatif(h)}`
          texteCorr += `= ${a} \\times (${b} \\times (${miseEnEvidence(c + ' + ' + ecritureParentheseSiNegatif(etape1Q28) + ' + ' + ecritureParentheseSiNegatif(f), bleuMathalea)}) - ${ecritureParentheseSiNegatif(g)}) + ${ecritureParentheseSiNegatif(h)}`
          texteCorr += `= ${a} \\times (${miseEnEvidence(b + ' \\times ' + ecritureParentheseSiNegatif(etape2Q28), bleuMathalea)} - ${ecritureParentheseSiNegatif(g)}) + ${ecritureParentheseSiNegatif(h)}`
          texteCorr += `= ${a} \\times (${miseEnEvidence(etape3Q28 + ' - ' + ecritureParentheseSiNegatif(g), bleuMathalea)}) + ${ecritureParentheseSiNegatif(h)}`
          if (g < 0) {
            texteCorr += `= ${a} \\times (${miseEnEvidence(etape3Q28 + ' + ' + -g, bleuMathalea)}) + ${ecritureParentheseSiNegatif(h)}`
          }
          texteCorr += `= ${miseEnEvidence(a + ' \\times ' + ecritureParentheseSiNegatif(etape4Q28), bleuMathalea)} + ${ecritureParentheseSiNegatif(h)}`
          texteCorr += `= ${etape5Q28} + ${ecritureParentheseSiNegatif(h)}`
          break
        }
        case 9: {
          // Opérations de multiplication avec addition: a × b + c × d
          a = randint(2, 7) * choice([-1, 1])
          b = (randint(3, 10) / 2) * choice([-1, 1])
          c = randint(2, 5) * choice([-1, 1])
          d = (randint(3, 10) / 2) * choice([-1, 1])
          texte = `$${lettreDepuisChiffre(i + 1)} = ${a} \\times ${ecritureParentheseSiNegatif(b)} + ${ecritureParentheseSiNegatif(c)} \\times ${ecritureParentheseSiNegatif(d)}$`
          // Calcul étape par étape
          const etape1Q29 = a * b
          const etape2Q29 = c * d
          resultat = texNombre(etape1Q29 + etape2Q29)
          texteCorr = `$${lettreDepuisChiffre(i + 1)} = ${miseEnEvidence(a + ' \\times ' + ecritureParentheseSiNegatif(b), bleuMathalea)} + ${miseEnEvidence(ecritureParentheseSiNegatif(c) + ' \\times ' + ecritureParentheseSiNegatif(d), bleuMathalea)}`
          texteCorr += `= ${texNombre(etape1Q29)} + ${ecritureParentheseSiNegatif(etape2Q29)}`
          break
        }
        case 10: {
          // Opérations de multiplication avec soustraction: a × b - c × d
          a = randint(2, 7) * choice([-1, 1])
          b = (randint(3, 10) / 2) * choice([-1, 1])
          c = (randint(3, 10) / 2) * choice([-1, 1])
          d = randint(2, 5) * choice([-1, 1])
          texte = `$${lettreDepuisChiffre(i + 1)} = ${a} \\times ${ecritureParentheseSiNegatif(b)} - ${ecritureParentheseSiNegatif(c)} \\times ${ecritureParentheseSiNegatif(d)}$`
          // Calcul étape par étape
          const etape1Q30 = a * b
          const etape2Q30 = c * d
          resultat = texNombre(etape1Q30 - etape2Q30)
          texteCorr = `$${lettreDepuisChiffre(i + 1)} = ${miseEnEvidence(a + ' \\times ' + ecritureParentheseSiNegatif(b), bleuMathalea)} - ${miseEnEvidence(ecritureParentheseSiNegatif(c) + ' \\times ' + ecritureParentheseSiNegatif(d), bleuMathalea)}`
          texteCorr += `= ${texNombre(etape1Q30)} - ${ecritureParentheseSiNegatif(etape2Q30)}`
          if (etape2Q30 < 0) {
            texteCorr += `= ${texNombre(etape1Q30)} + ${texNombre(-etape2Q30)}`
          }
          break
        }
        case 11: {
          // Expression avec fraction et multiples opérations: d + b × c - a
          a = randint(2, 7) * choice([-1, 1])
          b = (randint(3, 10) / 2) * choice([-1, 1])
          c = randint(3, 10) * choice([-1, 1])
          e = choice([2, 4, 5])
          f = new FractionEtendue(
            randint(3, 10, [e, 2 * e, 3 * e, 4 * e, 5 * e]) * choice([-1, 1]),
            e,
          )
          d = f.texFSD
          g = f.toNumber()
          texte = `$${lettreDepuisChiffre(i + 1)} = ${d} + ${ecritureParentheseSiNegatif(b)} \\times ${ecritureParentheseSiNegatif(c)} - ${ecritureParentheseSiNegatif(a)}$`
          // Calcul étape par étape
          const etape1Q31 = b * c
          const etape2Q31 = g + etape1Q31
          resultat = texNombre(etape2Q31 - a)
          texteCorr = `$${lettreDepuisChiffre(i + 1)} = ${d} + ${miseEnEvidence(`${ecritureParentheseSiNegatif(b)} \\times ${ecritureParentheseSiNegatif(c)}`, bleuMathalea)} - ${ecritureParentheseSiNegatif(a)}`
          texteCorr += `= ${miseEnEvidence(`${d} + ${ecritureParentheseSiNegatif(etape1Q31)}`, bleuMathalea)} - ${ecritureParentheseSiNegatif(a)}`
          texteCorr += `= ${miseEnEvidence(`${texNombre(g)} + ${ecritureParentheseSiNegatif(etape1Q31)}`, bleuMathalea)} - ${ecritureParentheseSiNegatif(a)}`
          texteCorr += `= ${texNombre(etape2Q31)} - ${ecritureParentheseSiNegatif(a)}`
          if (a < 0) texteCorr += `= ${texNombre(etape2Q31)} + ${-a}`
          break
        }
        case 12: {
          // Fraction complexe avec produits: (a - b × c) / (d × e + f)
          a = randint(2, 7) * choice([-1, 1])
          b = randint(2, 5) * choice([-1, 1])
          c = randint(2, 5) * choice([-1, 1])
          d = randint(2, 5) * choice([-1, 1])
          e = randint(2, 5) * choice([-1, 1])
          f = randint(2, 5) * choice([-1, 1])
          texte = `$${lettreDepuisChiffre(i + 1)} = \\dfrac{${a} - ${ecritureParentheseSiNegatif(b)} \\times ${ecritureParentheseSiNegatif(c)}}{${d} \\times ${ecritureParentheseSiNegatif(e)} + ${ecritureParentheseSiNegatif(f)}}$`
          // Calcul étape par étape
          const etape1Q32 = b * c
          const etape2Q32 = a - etape1Q32
          const etape3Q32 = d * e
          const etape4Q32 = etape3Q32 + f
          resultat = new FractionEtendue(etape2Q32, etape4Q32).texFSD
          texteCorr = `$${lettreDepuisChiffre(i + 1)} = \\dfrac{${a} - ${miseEnEvidence(ecritureParentheseSiNegatif(b) + ' \\times ' + ecritureParentheseSiNegatif(c), bleuMathalea)}}{${miseEnEvidence(d + ' \\times ' + ecritureParentheseSiNegatif(e), bleuMathalea)} + ${ecritureParentheseSiNegatif(f)}}`
          texteCorr += `= \\dfrac{${miseEnEvidence(`${a} - ${ecritureParentheseSiNegatif(etape1Q32)}`, bleuMathalea)}}{${miseEnEvidence(`${etape3Q32} + ${ecritureParentheseSiNegatif(f)}`, bleuMathalea)}}`
          if (etape1Q32 < 0) {
            texteCorr += `= \\dfrac{${a} + ${-etape1Q32}}{${etape3Q32} + ${ecritureParentheseSiNegatif(f)}}`
          }
          if (!(etape2Q32 > 0 && etape4Q32 > 0)) {
            texteCorr += `= \\dfrac{${etape2Q32}}{${etape4Q32}}`
          }
          break
        }
      }
      texteCorr += `= ${miseEnEvidence(resultat)}$`

      texte = parenthesesExterieuresPlusGrandes(texte)
      texteCorr = parenthesesExterieuresPlusGrandes(texteCorr)

      // texte += ' num du case : ' + listeTypeDeQuestions[i]

      if (this.sup2) {
        // Transformation de texteCorr en lignes séparées avec $
        const texteCorrection = texteCorr.substring(1, texteCorr.length - 1) // Enlève premier et dernier $
        const lignesCorr = texteCorrection.split('=')
        const premierElement = lignesCorr[0]
        lignesCorr.shift()

        // Création du double saut de ligne pour FractionEtendue ou dfrac
        let nouvelleCorrection = '$' + premierElement + '='

        for (let i = 0; i < lignesCorr.length; i++) {
          if (i > 0) {
            // Détermine si un saut de ligne double est nécessaire
            if (
              lignesCorr[i - 1].includes('FractionEtendue') ||
              lignesCorr[i - 1].includes('dfrac')
            ) {
              nouvelleCorrection += '$<br><br>$' + premierElement + '='
            } else {
              nouvelleCorrection += '$<br>$' + premierElement + '='
            }
          }
          nouvelleCorrection += lignesCorr[i]
        }

        texteCorr = nouvelleCorrection + '$'
      }

      handleAnswers(this, i, {
        reponse: {
          value: resultat,
          options: { nombreDecimalSeulement: true, fractionEgale: true },
        },
      })
      texte += ajouteChampTexteMathLive(
        this,
        i,
        KeyboardType.clavierDeBaseAvecFraction,
        { texteAvant: '=' },
      )

      if (this.questionJamaisPosee(i, a, b, c)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}

/**
 * Remplace les parenthèses par des délimiteurs LaTeX selon leur niveau d'imbrication.
 * Les plus intérieures sont \left( et \right), et on utilise ensuite
 * \bigl(/\bigr), \Bigl(/\Bigr), \biggl(/\biggr), \Biggl(/\Biggr) pour les niveaux plus extérieurs.
 * @param expr Expression mathématique avec parenthèses
 * @returns Expression avec délimiteurs LaTeX
 * @author : chatGPT
 */
function replaceParenthesesWithLatexDelimiters(expr: string): string {
  function processSegment(segment: string): string {
    interface Paren {
      index: number
      isOpening: boolean
      level: number
      matchIndex?: number
    }

    const parens: Paren[] = []
    const stack: Paren[] = []
    let level = 0

    // Collecter parenthèses + associer les paires
    for (let i = 0; i < segment.length; i++) {
      if (segment[i] === '(') {
        level++
        const opening: Paren = { index: i, isOpening: true, level }
        parens.push(opening)
        stack.push(opening)
      } else if (segment[i] === ')') {
        const opening = stack.pop()
        if (opening) {
          const closing: Paren = {
            index: i,
            isOpening: false,
            level,
            matchIndex: opening.index,
          }
          opening.matchIndex = i
          closing.matchIndex = opening.index
          parens.push(closing)
        }
        level--
      }
    }

    const result = segment.split('')

    // Obtenir les niveaux d'imbrication max de chaque paire
    const groups = parens
      .filter((p) => p.isOpening && p.matchIndex !== undefined)
      .map((p) => ({
        start: p.index,
        end: p.matchIndex!,
        level: p.level,
      }))

    // Trier par profondeur (plus externes d'abord)
    groups.sort((a, b) => a.level - b.level)

    for (const group of groups) {
      const { start, end, level } = group

      // Le niveau d'affichage doit être inversé : intérieur = plus petit
      const maxDepth = groups
        .filter((g) => g.start >= start && g.end <= end)
        .reduce((max, g) => Math.max(max, g.level), 1)

      const relativeLevel = maxDepth - level + 1

      const useSize = (relativeLevel: number) => {
        if (relativeLevel === 1) return ['\\left(', '\\right)']
        if (relativeLevel === 2) return ['\\Bigl(', '\\Bigr)']
        if (relativeLevel === 3) return ['\\Biggl(', '\\Biggr)']
        return ['\\Biggl(', '\\Biggr)']
      }

      const [open, close] = useSize(relativeLevel)

      result[start] = open
      result[end] = close
    }

    return result.join('')
  }

  const parts = expr.split('=')
  const processedParts = parts.map(processSegment)
  return processedParts.join('=')
}

function parenthesesExterieuresPlusGrandes(texte: string): string {
  const contenu = texte.substring(1, texte.length - 1)
  const transforme = replaceParenthesesWithLatexDelimiters(contenu)
  return `$${transforme}$`
}
