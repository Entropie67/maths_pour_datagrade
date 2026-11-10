import { bleuMathalea } from '../../lib/colors'
import { texSymbole } from '../../lib/format/style'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import {
  texFractionFromString,
  texFractionReduite,
} from '../../lib/outils/deprecatedFractions'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { abs, signe } from '../../lib/outils/nombres'
import { pgcd } from '../../lib/outils/primalite'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

type SymboleInegalite = '≤' | '≥' | '<' | '>'
type Question =
  'ax≤b' | 'x+b≤c' | 'ax+b≤c' | 'ax+b≤0' | 'ax+b≤cx+d' | 'a(bx+c)≤dx+e'
export const interactifReady = true

export const titre = 'Résoudre une inéquation du premier degré'
export const dateDeModifImportante = '08/10/2025'
/**
 * Inéquations du premier degré
 * * Type 1 : x+a≤b ou ax≤b
 * * Type 2 : ax+b≤c
 * * Type 3 : ax+b≤cx+d
 * * Tous les types
 * @author Rémi Angot et Guillaume Valmont et Gilles Mora pour l'interactif
 * 2L30-3, ex 2L13
 */
export const uuid = 'bc1e4'

export const refs = {
  'fr-fr': ['2L30-3', 'BP2RES19'],
  'fr-ch': [],
}

function buildConclusion(
  borneInfinie: 'gauche' | 'droite',
  borneFinie: FractionEtendue,
  estStrict: boolean,
): { reponse: string; correction: string } {
  let reponse: string
  if (borneInfinie === 'gauche') {
    reponse = `\\left] -\\infty\\,;\\,${borneFinie.texFractionSimplifiee}\\right${estStrict ? '[' : ']'}`
  } else {
    reponse = `\\left${estStrict ? ']' : '['}${borneFinie.texFractionSimplifiee}\\,;\\,+\\infty\\right[`
  }
  return {
    reponse,
    correction: `L'ensemble de solutions de l'inéquation est $S = ${miseEnEvidence(reponse)}$.`,
  }
}

export default class ExerciceInequation1 extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = ['Avec des nombres relatifs']
    this.besoinFormulaire2Texte = [
      "Type d'inéquations",
      '1 : ax≤b ou x+a≤b\n2 : ax+b≤c ou ax+b≤0\n3 : ax+b≤cx+d\n4 : a(bx+c)≤dx+e\n5 : Mélange',
    ]

    this.spacing = 1.5
    this.spacingCorr = 1.5
    this.spacingCorr = context.isHtml ? 2 : 1.5
    this.correctionDetailleeDisponible = true
    if (!context.isHtml) {
      this.correctionDetaillee = false
    }
    this.sup = true // Avec des nombres relatifs
    this.sup2 = 5 // Choix du type d'inéquation
    this.nbQuestions = 2
  }

  nouvelleVersion() {
    this.consigne =
      'Résoudre ' +
      (this.nbQuestions !== 1
        ? 'les inéquations suivantes'
        : "l'inéquation suivante") +
      '.'
    if (this.interactif) {
      this.consigne +=
        "<p>On donnera la réponse sous forme d'un intervalle.</p>"
    }

    const typeQuestionsPermis: Question[] = [
      'ax≤b',
      'x+b≤c',
      'ax+b≤c',
      'ax+b≤0', // pourquoi ce cas là est-il géré à part bien que non proposé explicitement à l'utilisateur
      'ax+b≤cx+d',
      'a(bx+c)≤dx+e',
    ]
    const listeTypeDeQuestions: Question[] = []
    const typeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: 4,
      melange: 5,
      defaut: 1,
      nbQuestions: this.nbQuestions,
    })

    for (let index = 0; index < this.nbQuestions; index++) {
      switch (typeDeQuestions[index]) {
        case 1:
          listeTypeDeQuestions.push(choice(typeQuestionsPermis.slice(0, 2)))
          break
        case 2:
          listeTypeDeQuestions.push(choice(typeQuestionsPermis.slice(2, 4)))
          break
        case 3:
          listeTypeDeQuestions.push(typeQuestionsPermis[4])
          break
        case 4:
          listeTypeDeQuestions.push(typeQuestionsPermis[5])
          break
        case 5:
          listeTypeDeQuestions.push(choice(typeQuestionsPermis))
          break
      }
    }

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      // On limite le nombre d'essais pour chercher des valeurs nouvelles
      let a = randint(2, 13)
      let b = randint(1, 13)
      let c = randint(1, 13)
      let d = randint(1, 13)
      let e = randint(1, 13) // sert seulement dans le dernier des types de questions
      let symboleInegalite: SymboleInegalite | '\\' = '>'
      let symboleInegaliteOppose: SymboleInegalite | '\\' = '<'
      let texte = ''
      let texteCorr = ''
      let reponse = ''

      switch (randint(1, 4)) {
        case 1:
          symboleInegalite = '<'
          symboleInegaliteOppose = '>'
          break
        case 2:
          symboleInegalite = '≤'
          symboleInegaliteOppose = '≥'
          break
        case 3:
          symboleInegalite = '>'
          symboleInegaliteOppose = '<'
          break
        case 4:
          symboleInegalite = '≥'
          symboleInegaliteOppose = '≤'
          break
      }
      const estStrict = ['<', '>'].includes(symboleInegalite)
      if (this.sup) {
        a *= choice([-1, 1])
        b *= choice([-1, 1])
        c *= choice([-1, 1])
        d *= choice([-1, 1])
        e *= choice([-1, 1])
      }

      if (
        listeTypeDeQuestions[i] === 'ax+b≤0' ||
        listeTypeDeQuestions[i] === 'ax+b≤c'
      ) {
        if (listeTypeDeQuestions[i] === 'ax+b≤0') {
          c = 0
        }
        if (!this.sup && c < b) {
          b = randint(1, 9)
          c = randint(b, 15) // c sera plus grand que b pour que c-b≥0
        }
        texte = `$${a}x${ecritureAlgebrique(b)}${texSymbole(symboleInegalite)}${c}$`
        texteCorr = texte + '<br>'
        if (this.correctionDetaillee) {
          if (b > 0) {
            texteCorr += `On soustrait $${b}$ aux deux membres.<br>`
          } else {
            texteCorr += `On ajoute $${-1 * b}$ aux deux membres.<br>`
          }
        }
        texteCorr += `$${a}x${ecritureAlgebrique(b)}${miseEnEvidence(ecritureAlgebrique(-1 * b), bleuMathalea)}
          ${texSymbole(symboleInegalite)}${c}${miseEnEvidence(ecritureAlgebrique(-1 * b), bleuMathalea)}$<br>`
        texteCorr += `$${a}x${texSymbole(symboleInegalite)}${c - b}$<br>`
        if (this.correctionDetaillee) {
          texteCorr += `On divise les deux membres par $${a}$.<br>`
          if (a < 0) {
            texteCorr += `Comme $${a}$ est négatif, l'inégalité change de sens.<br>`
          }
        }
        if (a < 0) {
          texteCorr += `$${a}x${miseEnEvidence(
            '\\div' +
              ecritureParentheseSiNegatif(a) +
              texSymbole(symboleInegaliteOppose),
            bleuMathalea,
          )}${c - b + miseEnEvidence('\\div' + ecritureParentheseSiNegatif(a), bleuMathalea)}$<br>`
          texteCorr += `$x${texSymbole(symboleInegaliteOppose)}${texFractionFromString(c - b, a)}$`
          texteCorr += `<br>$x${texSymbole(symboleInegaliteOppose)}${texFractionReduite(c - b, a)}$`
        } else {
          texteCorr += `$${a}x${miseEnEvidence('\\div' + ecritureParentheseSiNegatif(a), bleuMathalea)}
            ${texSymbole(symboleInegalite)}${c - b + miseEnEvidence('\\div' + ecritureParentheseSiNegatif(a), bleuMathalea)}$<br>`
          texteCorr += `$x${texSymbole(symboleInegalite)}${texFractionFromString(c - b, a)}$`
          if (pgcd(abs(a), abs(c - b)) > 1) {
            texteCorr += `<br>$x${texSymbole(symboleInegalite)}${texFractionReduite(c - b, a)}$`
          }
        }
        // Conclusion
        const borneInfinie =
          (symboleInegalite === '<' && a >= 0) ||
          (symboleInegalite === '>' && a < 0) ||
          (symboleInegalite === '≤' && a >= 0) ||
          (symboleInegalite === '≥' && a < 0)
            ? 'gauche'
            : 'droite'
        const borneFinie = new FractionEtendue(c - b, a)
        const conclusion = buildConclusion(borneInfinie, borneFinie, estStrict)
        reponse = conclusion.reponse
        texteCorr += `<br> ${conclusion.correction}`
      } else if (listeTypeDeQuestions[i] === 'x+b≤c') {
        a = 1
        if (!this.sup && c < b) {
          b = randint(-9, 9, [0]) // b peut être négatif, ça sera une inéquation du type x-b=c
          c = abs(randint(b, 15)) // c sera plus grand que b pour que c-b>0
        }
        texte = `$x${ecritureAlgebrique(b)}${texSymbole(symboleInegalite)}${c}$`
        texteCorr = texte + '<br>'
        if (this.correctionDetaillee) {
          if (b > 0) {
            texteCorr += `On soustrait $${b}$ aux deux membres.<br>`
          } else {
            texteCorr += `On ajoute $${-1 * b}$ aux deux membres.<br>`
          }
        }
        texteCorr += `$x${ecritureAlgebrique(b)}${miseEnEvidence(ecritureAlgebrique(-1 * b), bleuMathalea)}
          ${texSymbole(symboleInegalite)}${c}${miseEnEvidence(ecritureAlgebrique(-1 * b), bleuMathalea)}$<br>`
        texteCorr += `$x${texSymbole(symboleInegalite)}${c - b}$`
        // Conclusion
        const borneInfinie =
          (symboleInegalite === '<' && a >= 0) ||
          (symboleInegalite === '>' && a < 0) ||
          (symboleInegalite === '≤' && a >= 0) ||
          (symboleInegalite === '≥' && a < 0)
            ? 'gauche'
            : 'droite'
        const borneFinie = new FractionEtendue(c - b, 1)
        const conclusion = buildConclusion(borneInfinie, borneFinie, estStrict)
        reponse = conclusion.reponse
        texteCorr += `<br> ${conclusion.correction}`
      } else if (listeTypeDeQuestions[i] === 'ax≤b') {
        texte = `$${a}x${texSymbole(symboleInegalite)}${b}$`
        texteCorr = texte + '<br>'
        if (this.correctionDetaillee) {
          texteCorr += `On divise les deux membres par $${a}$.<br>`
          if (a < 0) {
            texteCorr += `Comme $${a}$ est négatif, l'inégalité change de sens.<br>`
          }
        }
        if (a < 0) {
          texteCorr += `$${a}x${miseEnEvidence(
            '\\div' +
              ecritureParentheseSiNegatif(a) +
              texSymbole(symboleInegaliteOppose),
            bleuMathalea,
          )}${b + miseEnEvidence('\\div' + ecritureParentheseSiNegatif(a), bleuMathalea)}$<br>`
          texteCorr += `$x${texSymbole(symboleInegaliteOppose)}${texFractionFromString(b, a)}$`
          texteCorr += `<br>$x${texSymbole(symboleInegaliteOppose)}${texFractionReduite(b, a)}$`
        } else {
          texteCorr += `$${a}x${miseEnEvidence('\\div' + ecritureParentheseSiNegatif(a), bleuMathalea)}
            ${texSymbole(symboleInegalite)}${b + miseEnEvidence('\\div' + ecritureParentheseSiNegatif(a), bleuMathalea)}$<br>`
          texteCorr += `$x${texSymbole(symboleInegalite)}${texFractionFromString(b, a)}$`
          if (pgcd(abs(a), abs(b)) > 1 || a < 0) {
            texteCorr += `<br>$x${texSymbole(symboleInegalite)}${texFractionReduite(b, a)}$`
          }
        }
        // Conclusion
        const borneInfinie =
          (symboleInegalite === '<' && a >= 0) ||
          (symboleInegalite === '>' && a < 0) ||
          (symboleInegalite === '≤' && a >= 0) ||
          (symboleInegalite === '≥' && a < 0)
            ? 'gauche'
            : 'droite'
        const borneFinie = new FractionEtendue(b, a)
        const conclusion = buildConclusion(borneInfinie, borneFinie, estStrict)
        reponse = conclusion.reponse
        texteCorr += `<br> ${conclusion.correction}`
      } else if (listeTypeDeQuestions[i] === 'ax+b≤cx+d') {
        if (c === a) {
          c = randint(1, 13, [a])
        } // sinon on arrive à une division par 0
        if (!this.sup && a < c) {
          c = randint(1, 9)
          a = randint(c + 1, 15) // a sera plus grand que c pour que a-c>0
        }
        if (!this.sup && d < b) {
          b = randint(1, 9)
          d = randint(b + 1, 15) // d sera plus grand que b pour que d-b>0
        }
        texte = `$${rienSi1(a)}x${ecritureAlgebrique(b)}${texSymbole(symboleInegalite)} ${rienSi1(c)}x${ecritureAlgebrique(d)}$`
        texteCorr = texte + '<br>'
        if (this.correctionDetaillee) {
          if (c > 0) {
            texteCorr += `On soustrait $${rienSi1(c)}x$ aux deux membres.<br>`
          } else {
            texteCorr += `On ajoute $${rienSi1(-1 * c)}x$ aux deux membres.<br>`
          }
        }
        texteCorr += `$${rienSi1(a)}x${ecritureAlgebrique(b)}${miseEnEvidence(signe(-1 * c) + rienSi1(abs(c)) + 'x', bleuMathalea)}
          ${texSymbole(symboleInegalite)}${c}x${ecritureAlgebrique(d)}${miseEnEvidence(signe(-1 * c) + rienSi1(abs(c)) + 'x', bleuMathalea)}$<br>`
        texteCorr += `$${rienSi1(a - c)}x${ecritureAlgebrique(b)}${texSymbole(symboleInegalite)}${d}$<br>`
        if (this.correctionDetaillee) {
          if (b > 0) {
            texteCorr += `On soustrait $${b}$ aux deux membres.<br>`
          } else {
            texteCorr += `On ajoute $${-1 * b}$ aux deux membres.<br>`
          }
        }
        texteCorr += `$${rienSi1(a - c)}x${ecritureAlgebrique(b)}${miseEnEvidence(ecritureAlgebrique(-1 * b), bleuMathalea)}
          ${texSymbole(symboleInegalite)}${d}${miseEnEvidence(ecritureAlgebrique(-1 * b), bleuMathalea)}$<br>`
        texteCorr += `$${rienSi1(a - c)}x${texSymbole(symboleInegalite)}${d - b}$<br>`

        if (this.correctionDetaillee) {
          texteCorr += `On divise les deux membres par $${a - c}$.<br>`
          if (a - c < 0) {
            texteCorr += `Comme $${a - c}$ est négatif, l'inégalité change de sens.<br>`
          }
        }
        if (a - c < 0) {
          texteCorr += `$${rienSi1(a - c)}x${miseEnEvidence(
            '\\div' +
              ecritureParentheseSiNegatif(a - c) +
              texSymbole(symboleInegaliteOppose),
            bleuMathalea,
          )}${d - b + miseEnEvidence('\\div' + ecritureParentheseSiNegatif(a - c), bleuMathalea)}$<br>`
          texteCorr += `$x${texSymbole(symboleInegaliteOppose)}${texFractionFromString(d - b, a - c)}$`
          texteCorr += `<br>$x${texSymbole(symboleInegaliteOppose)}${texFractionReduite(d - b, a - c)}$`
        } else {
          texteCorr += `$${rienSi1(a - c)}x${miseEnEvidence('\\div' + ecritureParentheseSiNegatif(a - c), bleuMathalea)}
            ${texSymbole(symboleInegalite)}${d - b + miseEnEvidence('\\div' + ecritureParentheseSiNegatif(a - c), bleuMathalea)}$<br>`
          texteCorr += `$x${texSymbole(symboleInegalite)}${texFractionFromString(d - b, a - c)}$`
          if (pgcd(abs(d - b), abs(a - c)) > 1 || a - c < 0) {
            texteCorr += `<br>$x${texSymbole(symboleInegalite)}${texFractionReduite(d - b, a - c)}$`
          }
        }
        // Conclusion
        const borneInfinie =
          (symboleInegalite === '<' && a - c >= 0) ||
          (symboleInegalite === '>' && a - c < 0) ||
          (symboleInegalite === '≤' && a - c >= 0) ||
          (symboleInegalite === '≥' && a - c < 0)
            ? 'gauche'
            : 'droite'
        const borneFinie = new FractionEtendue(d - b, a - c)
        const conclusion = buildConclusion(borneInfinie, borneFinie, estStrict)
        reponse = conclusion.reponse
        texteCorr += `<br> ${conclusion.correction}`
      } else {
        if (d === a * b) {
          // évitons une division par 0
          d = randint(1, 13, [a * b])
        }
        if (e === a * c) {
          // évitons un résultat nul
          e = randint(1, 13, [a * c])
        }
        texte = `$${a}(${reduireAxPlusB(b, c)}) ${texSymbole(symboleInegalite)} ${reduireAxPlusB(d, e)}$`
        texteCorr = texte + '<br>'
        texteCorr += 'On commence par développer le membre de gauche.<br>'
        texteCorr += `$${a}\\times ${b === 1 ? '' : ecritureParentheseSiNegatif(b)}x${ecritureAlgebrique(a)}\\times${ecritureParentheseSiNegatif(c)}${texSymbole(symboleInegalite)}${reduireAxPlusB(d, e)}$<br>`
        texteCorr += `$${reduireAxPlusB(a * b, a * c)}${texSymbole(symboleInegalite)}${reduireAxPlusB(d, e)}$<br>`
        if (this.correctionDetaillee) {
          if (d > 0) {
            texteCorr += `On soustrait $${rienSi1(d)}x$ aux deux membres.<br>`
          } else {
            texteCorr += `On ajoute $${rienSi1(-d)}x$ aux deux membres.<br>`
          }
        }
        texteCorr += `$${reduireAxPlusB(a * b, a * c)}${miseEnEvidence(signe(-1 * d) + rienSi1(abs(d)) + 'x', bleuMathalea)}${texSymbole(symboleInegalite)}${reduireAxPlusB(d, e)}${miseEnEvidence(signe(-1 * d) + rienSi1(abs(d)) + 'x', bleuMathalea)}$<br>`
        texteCorr += `$${rienSi1(a * b - d)}x${ecritureAlgebrique(a * c)}${texSymbole(symboleInegalite)}${e}$<br>`
        if (this.correctionDetaillee) {
          if (a * c > 0) {
            texteCorr += `On soustrait $${a * c}$ aux deux membres.<br>`
          } else {
            texteCorr += `On ajoute $${-a * c}$ aux deux membres.<br>`
          }
        }
        texteCorr += `$${rienSi1(a * b - d)}x${ecritureAlgebrique(a * c)}${miseEnEvidence(ecritureAlgebrique(-a * c), bleuMathalea)}
           ${texSymbole(symboleInegalite)}${e}${miseEnEvidence(ecritureAlgebrique(-a * c), bleuMathalea)}$<br>`
        texteCorr += `$${rienSi1(a * b - d)}x${texSymbole(symboleInegalite)}${e - a * c}$<br>`
        if (this.correctionDetaillee) {
          texteCorr += `On divise les deux membres par $${a * b - d}$.<br>`
          if (a * b - d < 0) {
            texteCorr += `Comme $${a * b - d}$ est négatif, l'inégalité change de sens.<br>`
          }
        }
        const borneFinie = new FractionEtendue(e - a * c, a * b - d)
        const symboleInegaliteFinal =
          a * b - d > 0 ? symboleInegalite : symboleInegaliteOppose
        texteCorr += `$${rienSi1(a * b - d)}x${miseEnEvidence(
          '\\div' +
            ecritureParentheseSiNegatif(a * b - d) +
            texSymbole(symboleInegaliteFinal),
          bleuMathalea,
        )}${e - a * c + miseEnEvidence('\\div' + ecritureParentheseSiNegatif(a * b - d), bleuMathalea)}$<br>`
        texteCorr += `$x${texSymbole(symboleInegaliteFinal)}${borneFinie.texFraction}$`
        if (!borneFinie.estIrreductible) {
          texteCorr += `<br><br>$x${texSymbole(symboleInegaliteFinal)}${borneFinie.texFractionSimplifiee}$`
        }

        // Conclusion
        const borneInfinie = ['≥', '>'].includes(symboleInegaliteFinal)
          ? 'droite'
          : 'gauche'
        const conclusion = buildConclusion(borneInfinie, borneFinie, estStrict)
        reponse = conclusion.reponse
        texteCorr += `<br> ${conclusion.correction}`
      }
      // texte += `<br> Solution : $${reponse}$` // pour test
      texte +=
        '<br>' +
        ajouteChampTexteMathLive(this, i, KeyboardType.clavierEnsemble, {
          texteAvant: ' $S=$',
        })
      handleAnswers(this, i, {
        reponse: { value: reponse, options: { intervalle: true } },
      })
      if (
        this.questionJamaisPosee(
          i,
          JSON.stringify([a, b, c, d, symboleInegalite]),
        )
      ) {
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
