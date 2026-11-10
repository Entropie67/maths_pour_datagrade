import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  choice,
  combinaisonListes,
  shuffle,
} from '../../lib/outils/arrayOutils'
import { obtenirListeFractionsIrreductibles } from '../../lib/outils/deprecatedFractions'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

import { amcConvert } from '../../lib/amc/amcBuilders'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'

export const titre = 'Multiplier ou/et diviser des fractions'
export const amcReady = true
export const amcType = 'AMCNum'
export const interactifReady = true

export const dateDeModifImportante = '09/04/2022'

/**
 * Exercice de calcul de produit de deux fractions.
 *
 * Paramétrages possibles :
 * * 1 : Produits de nombres positifs seulement
 * * 2 : deux questions niveau 1 puis deux questions niveau 3
 * * 3 : Produits de nombres relatifs
 * * Si décomposition cochée : les nombres utilisés sont plus importants.
 * @author Jean-claude Lhote
 * Ajout d'une option pour ne pas exiger une fraction irréductible le 09/04/2022 par Guillaume Valmont
 */
export const uuid = '72ce7'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}

const space = '\\phantom{\\dfrac{(_(^(}{(_(^(}}' // Utilisé pour mettre de l'espace dans une fraction de fraction
const space2 = '\\phantom{(_(^(}' // Utilisé pour mettre de l'espace dans une fraction de fraction lorsque le numérateur ou le dénominateur est entier

export default class ExerciceMultiplierFractions extends Exercice {
  constructor() {
    super()
    this.nbCols = 4 // Pour Latex
    this.nbColsCorr = 2
    this.besoinFormulaireTexte = [
      'Niveau de difficulté',
      'Nombres séparés par des tirets\n1 : Un entier et une fraction (tout positif)\n2 : Deux fractions à numérateurs et dénominateurs positifs\n3 : Fractions avec nombres relatifs (au moins 2 négatifs)\n4 : Mélange',
    ]
    this.besoinFormulaire2CaseACocher = [
      'Avec décomposition en produit de facteurs premiers',
    ]
    this.besoinFormulaire3CaseACocher = ['Demander une fraction irréductible']
    this.besoinFormulaire4Numerique = [
      "Type d'opération",
      3,
      '1 : Multiplication\n2 : Division\n3 : Mélange',
    ]
    this.listeAvecNumerotation = false
    this.sup = '2' // Avec ou sans relatifs
    this.sup3 = true
    if (context.isAmc)
      this.titre =
        'Multiplier des fractions et donner le résultat sous forme irréductible'
    this.spacing = 3
    this.spacingCorr = 3
    this.nbQuestions = 5
    this.sup2 = true // méthode de simplification par défaut = factorisation
    this.sup4 = 1 // multiplications par défaut
  }

  nouvelleVersion() {
    const listeFractions = obtenirListeFractionsIrreductibles()
    const fractionIrreductibleDemandee = this.sup3
    if (fractionIrreductibleDemandee) {
      this.consigne = 'Calculer et donner le résultat sous forme irréductible.'
    } else {
      this.consigne = 'Calculer.'
    }
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 2,
      nbQuestions: this.nbQuestions,
    })

    // On choisit les opérations en fonction de this.sup4
    const typesDoperation = []
    if (this.sup4 % 2 === 1) typesDoperation.push('mul')
    if (this.sup4 > 1) typesDoperation.push('div')
    const listeTypesDoperation = combinaisonListes(
      typesDoperation,
      this.nbQuestions,
    )
    let nombreDeSigneMoins

    for (
      let i = 0,
        a,
        b,
        c,
        d,
        texte,
        texteCorr,
        reponse,
        typesDeQuestions,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      typesDeQuestions = listeTypeDeQuestions[i]
      do {
        ;[a, b] = choice(listeFractions)
        ;[c, d] = choice(listeFractions)
      } while ((a * c) % (b * d) === 0 || (a * c) % d === 0 || b * d === 100)
      if (!this.sup2) {
        // methode 1 : simplifications finale
        switch (typesDeQuestions) {
          case 1: {
            // entier * fraction (tout positif)
            if (a === 1) {
              a = randint(2, 9)
            }
            b = 1
            const tampon = c
            c = d
            d = tampon
            break
          }
          case 2: // fraction * fraction tout positif
            break

          case 3:
            do {
              a = a * choice([-1, 1])
              b = b * choice([-1, 1])
              c = c * choice([-1, 1])
              d = d * choice([-1, 1])
              nombreDeSigneMoins =
                Number(a < 0) + Number(b < 0) + Number(c < 0) + Number(d < 0)
            } while (nombreDeSigneMoins < 2)
            break
        }
      } else {
        // méthode 2 : décomposition
        let facteurA, facteurB
        const listePremiers = shuffle([2, 3, 5, 7, 11])

        do {
          facteurA = listePremiers.pop() as number
          facteurB = listePremiers.pop() as number
          a = a * facteurA
          d = d * facteurA
          b = b * facteurB
          c = c * facteurB
        } while (
          Math.abs(a) === Math.abs(b) &&
          Math.abs(c) === Math.abs(d) &&
          listePremiers.length > 1
        )

        switch (typesDeQuestions) {
          case 1: // entier * fraction (tout positif)
            b = 1
            break
          case 2: // fraction * fraction tout positif
            break
          case 3:
            do {
              a = a * choice([-1, 1])
              b = b * choice([-1, 1])
              c = c * choice([-1, 1])
              d = d * choice([-1, 1])
              nombreDeSigneMoins =
                Number(a < 0) + Number(b < 0) + Number(c < 0) + Number(d < 0)
            } while (nombreDeSigneMoins < 2)
            break
        }
      }
      const f1 = new FractionEtendue(a, b)
      if (listeTypesDoperation[i] === 'mul') {
        const f2 = new FractionEtendue(c, d)
        texte = `$${lettreDepuisChiffre(i + 1)} = ${f1.texFraction}\\times${f2.texFraction}$`
        texteCorr = `$\\begin{aligned}${lettreDepuisChiffre(i + 1)} &= ${f1.texProduitFraction(f2, this.sup2).replaceAll('=', '\\\\&=')}\\end{aligned}$`
        reponse = f1.produitFraction(f2).simplifie()
      } else {
        const f2 = new FractionEtendue(d, c)
        texte = `$${lettreDepuisChiffre(i + 1)} = \\dfrac{${(f1.den === 1 ? space2 : space) + f1.texFSD + (f1.den === 1 ? space2 : space)}}{${(f2.den === 1 ? space2 : space) + f2.texFraction + (f2.den === 1 ? space2 : space)}}$`
        texteCorr = `$\\begin{aligned}${lettreDepuisChiffre(i + 1)} &= ${f1.texDiviseFraction(f2, this.sup2, '/').replaceAll('=', '\\\\&=')}\\end{aligned}$`
        reponse = f1.diviseFraction(f2).simplifie()
      }
      if (this.questionJamaisPosee(i, a, b, c, d, typesDeQuestions)) {
        // Si la question n'a jamais été posée, on en créé une autre
        texte += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierDeBaseAvecFraction,
          { texteAvant: '$=$' },
        )
        handleAnswers(this, i, {
          reponse: {
            value: reponse.toLatex(),
            options: { fractionIrreductible: fractionIrreductibleDemandee },
          },
        })

        if (context.isAmc) {
          texte =
            'Calculer et donner le résultat sous forme irréductible\\\\\n' +
            texte
          this.autoCorrectionAMC[i] = {
            enonce: texte, // Si vide, l'énoncé est celui de l'exercice.
            propositions: [
              {
                texte: '', // Si vide, le texte est la correction de l'exercice.
              },
            ],
            reponse: {
              valeur: [reponse], // obligatoire (la réponse numérique à comparer à celle de l'élève), NE PAS METTRE DE STRING à virgule ! 4.9 et non pas 4,9. Cette valeur doit être passée dans un tableau d'où la nécessité des crochets.
              param: {
                digits: 5,
                digitsNum: 3,
                digitsDen: 2,
                signe: true,
              },
            },
          }
          this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        }

        // Uniformisation : Mise en place de la réponse attendue en interactif en orange et gras
        const textCorrSplit = texteCorr.split('=')
        let aRemplacer = textCorrSplit[textCorrSplit.length - 1]
        const [result, end] = aRemplacer.split('\\end{aligned}')
        aRemplacer = `${miseEnEvidence(result.trim())}\\end{aligned}${end ?? ''}`
        textCorrSplit.length = textCorrSplit.length - 1
        texteCorr = `${textCorrSplit.join('=')}=${aRemplacer}`
        // Fin de cette uniformisation

        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }

    listeQuestionsToContenu(this) // Espacement de 2 em entre chaque questions.
  }
}
