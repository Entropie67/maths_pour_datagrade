/**
 * ⚠️ Cet exercice est utilisé dans le test : tests/e2e/tests/view/view.capytale.save3L11-2.test.ts ⚠️
 */

import { amcConvert } from '../../lib/amc/amcBuilders'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiMoins,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { rangeMinMax } from '../../lib/outils/nombres'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import {
  contraindreValeur,
  gestionnaireFormulaireTexte,
  listeQuestionsToContenuSansNumero,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Réduire une expression'
export const interactifReady = true

export const amcType = 'AMCHybride'
export const amcReady = true
export const dateDeModifImportante = '06/02/2024'

/**
 * Réduire des expressions lorsque c'est possible
 *
 * @author Rémi Angot (Amélioration AMC par Éric Elter)
 */
export const uuid = 'f6853'

export const refs = {
  'fr-fr': ['3L11-2', 'BP2AutoI10', '3AutoL01'],
  'fr-ch': ['10LCFA4D-7', '10LSFA4D-7', '11CTFA3E-2', '11LCFA3E-2', '11LSFA3E-2', 'PRQAL03A-5'],
}
export default class ReductionSiPossible extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = ['On peut toujours réduire.']
    this.besoinFormulaire2CaseACocher = [
      'Présentation des corrections en colonnes',
      false,
    ]
    this.besoinFormulaire3Texte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets  :',
        '1 : ax+b',
        '2 : ax+bx',
        '3 : ax+bx²',
        '4 : ax*b',
        '5 : b*ax',
        '6 : ax+b+cx+d',
        '7 : b+ax+d+cx',
        '8 : ax+b+x',
        '10 : ax*bx',
      ].join('\n'),
    ]
    this.nbQuestions = 5

    this.spacing = context.isHtml ? 3 : 2
    this.spacingCorr = context.isHtml ? 3 : 2

    this.sup = false
    this.sup2 = false
    this.sup3 = 9
    this.listeAvecNumerotation = false
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions > 1
        ? 'Réduire les expressions suivantes, si cela est possible.'
        : "Réduire l'expression suivante, si cela est possible."

    const exclus: number[] = []
    if (this.sup) {
      exclus.push(1)
      exclus.push(3)
    }
    if (context.isAmc) {
      exclus.push(3)
    }

    // Le cas 9 (« Mélange » historique) n'est plus proposé dans le formulaire,
    // mais reste géré ci-dessous par gestionnaireFormulaireTexte (melange: 9)
    // pour les liens déjà partagés qui portent s3=9. La nouvelle forme « ax*bx »
    // prend donc le numéro 10, sans décaler la numérotation existante.
    // gestionnaireFormulaireTexte plafonne la saisie à la valeur de mélange (9) :
    // on intercepte la demande du cas 10 avant l'appel. En mode AMC, ce cas
    // (réduction en ab x², hors modèle ax+b) est écarté, comme le cas 3.
    const casDemandes = String(this.sup3 ?? '')
      .split('-')
      .map((cas) => cas.trim())
      .filter((cas) => cas !== '')
    const seulementAxBx =
      !context.isAmc &&
      casDemandes.length > 0 &&
      casDemandes.every((cas) => cas === '10')
    // La saisie mélange le cas 10 (ax*bx) avec d'autres cas (par exemple « 4-5-10 »).
    // gestionnaireFormulaireTexte plafonnerait la valeur 10 à la valeur de mélange (9),
    // ce qui remplacerait silencieusement la sélection de l'utilisateur par un mélange
    // de tous les cas 1 à 8 : c'est ce qui produisait des questions ne correspondant pas
    // aux cases cochées. On construit donc nous-mêmes la liste des cas demandés, en
    // reprenant les mêmes règles (cas exclus, cas mélange 9) que gestionnaireFormulaireTexte.
    const contientCas10 =
      !context.isAmc && !seulementAxBx && casDemandes.includes('10')

    let listeTypeDeQuestions: (string | number)[]
    if (seulementAxBx) {
      listeTypeDeQuestions = new Array(this.nbQuestions).fill(10)
    } else if (contientCas10) {
      let autresCas = casDemandes
        .filter((cas) => cas !== '10')
        .map((cas) => contraindreValeur(1, 9, parseInt(cas), 2))
      if (autresCas.length === 0) autresCas = [2]
      autresCas = autresCas.filter((cas) => !exclus.includes(cas))
      if (autresCas.length === 0) autresCas = [2]
      if (autresCas.includes(9)) {
        autresCas = rangeMinMax(1, 8, exclus)
      }
      listeTypeDeQuestions = combinaisonListes(
        [...autresCas, 10],
        this.nbQuestions,
      )
    } else {
      listeTypeDeQuestions = gestionnaireFormulaireTexte({
        nbQuestions: this.nbQuestions,
        saisie: this.sup3,
        max: 8,
        melange: 9,
        defaut: 2,
        exclus,
      })
    }

    // const listeTypeDeQuestions = combinaisonListes(typesDeQuestionsDisponibles, this.nbQuestions) // Tous les types de questions sont posées mais l'ordre diffère à chaque "cycle"
    for (
      let i = 0, reponse, coeffa, constb, a, b, c, d, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      let texte = ''
      let texteCorr = ''
      reponse = ''
      coeffa = 0
      constb = 0
      a = randint(-11, 11, 0)
      b = randint(-11, 11, [0, a])
      c = randint(-11, 11, [0])
      d = randint(-11, 11, 0)
      switch (listeTypeDeQuestions[i]) {
        case 1: // 'ax+b':
          texte = `$${lettreDepuisChiffre(i + 1)}=${rienSi1(a)}x${ecritureAlgebrique(b)}$`
          texteCorr = texte
          reponse = [
            `${rienSi1(a)}x${ecritureAlgebrique(b)}`,
            `${b}${ecritureAlgebriqueSauf1(a)}x`,
          ]
          coeffa = a
          constb = b
          break
        case 2: // 'ax+bx':
          texte = `$${lettreDepuisChiffre(i + 1)}=${rienSi1(a)}x${ecritureAlgebriqueSauf1(b)}x$`
          texteCorr = `$${lettreDepuisChiffre(i + 1)}=${rienSi1(a)}x${ecritureAlgebriqueSauf1(b)}x=${rienSi1(a + b)}x$`
          reponse = `${rienSi1(a + b)}x`
          coeffa = a + b
          constb = 0
          break
        case 3: // 'ax+bx2':
          texte = `$${lettreDepuisChiffre(i + 1)}=${rienSi1(a)}x${ecritureAlgebriqueSauf1(b)}x^2$`
          texteCorr = texte
          reponse = [
            `${rienSi1(a)}x${ecritureAlgebriqueSauf1(b)}x^2`,
            `${b}x^2${ecritureAlgebriqueSauf1(a)}x`,
          ]
          // celui-ci ne peut pas être choisi pour AMC
          break
        case 4: // 'ax*b':
          texte = `$${lettreDepuisChiffre(i + 1)}=${rienSi1(a)}x\\times ${ecritureParentheseSiNegatif(b)}$`
          texteCorr = `$${lettreDepuisChiffre(i + 1)}=${rienSi1(a)}x\\times ${ecritureParentheseSiNegatif(b)}=${rienSi1(a * b)}x$`
          reponse = `${rienSi1(a * b)}x`
          coeffa = a * b
          constb = 0
          break
        case 5: // 'b*ax':
          a = randint(1, 11)
          texte = `$${lettreDepuisChiffre(i + 1)}=${b}\\times ${rienSi1(a)}x$`
          texteCorr = `$${lettreDepuisChiffre(i + 1)}=${b}\\times ${rienSi1(a)}x=${rienSi1(b * a)}x$`
          reponse = `${rienSi1(b * a)}x`
          coeffa = a * b
          constb = 0
          break
        case 6: // 'ax+b+cx+d':
          texte = `$${lettreDepuisChiffre(i + 1)}=${rienSi1(a)}x${ecritureAlgebrique(b)}${ecritureAlgebriqueSauf1(c)}x${ecritureAlgebrique(d)}$`
          texteCorr = `$${lettreDepuisChiffre(i + 1)}=${rienSi1(a)}x${ecritureAlgebrique(b)}${ecritureAlgebriqueSauf1(c)}x${ecritureAlgebrique(d)}`
          if (b + d === 0) {
            if (a + c === 0) {
              texteCorr += '=0$'
              reponse = 0
              coeffa = 0
              constb = 0
            } else {
              texteCorr += `=${rienSi1(a + c)}x$`
              reponse = `${rienSi1(a + c)}x`
              coeffa = a + c
              constb = 0
            }
          } else {
            if (a + c === 0) {
              texteCorr += `=${b + d}$`
              reponse = b + d
              constb = b + d
              coeffa = 0
            } else {
              texteCorr += `=${rienSi1(a + c)}x${ecritureAlgebrique(b + d)}$`
              reponse = [
                `${rienSi1(a + c)}x${ecritureAlgebrique(b + d)}`,
                `${b + d}${ecritureAlgebriqueSauf1(a + c)}x`,
              ]
              coeffa = a + c
              constb = b + d
            }
          }
          break
        case 7: // 'b+ax+d+cx':
          texte = `$${lettreDepuisChiffre(i + 1)}=${b}${ecritureAlgebriqueSauf1(a)}x${ecritureAlgebrique(d)}${ecritureAlgebriqueSauf1(c)}x$`
          texteCorr = `$${lettreDepuisChiffre(i + 1)}=${b}${ecritureAlgebriqueSauf1(a)}x${ecritureAlgebrique(d)}${ecritureAlgebriqueSauf1(c)}x`
          if (b + d === 0) {
            if (a + c === 0) {
              texteCorr += '=0$'
              reponse = 0
              coeffa = 0
              constb = 0
            } else {
              texteCorr += `=${rienSi1(a + c)}x$`
              reponse = `${rienSi1(a + c)}x`
              coeffa = a + c
              constb = 0
            }
          } else {
            if (a + c === 0) {
              texteCorr += `=${b + d}$`
              reponse = b + d
              coeffa = 0
              constb = b + d
            } else {
              texteCorr += `=${rienSi1(a + c)}x${ecritureAlgebrique(b + d)}$`
              reponse = [
                `${rienSi1(a + c)}x${ecritureAlgebrique(b + d)}`,
                `${b + d}${ecritureAlgebriqueSauf1(a + c)}x`,
              ]
              coeffa = a + c
              constb = b + d
            }
          }
          break
        case 8: // 'ax+b+x':
          a = randint(-11, 11, [0, -1])
          texte = `$${lettreDepuisChiffre(i + 1)}=${rienSi1(a)}x${ecritureAlgebrique(b)}+x$`
          texteCorr = `$${lettreDepuisChiffre(i + 1)}=${rienSi1(a)}x${ecritureAlgebrique(b)}+x=${rienSi1(a + 1)}x${ecritureAlgebrique(b)}$`
          reponse = [
            `${rienSi1(a + 1)}x${ecritureAlgebrique(b)}`,
            `${b}${ecritureAlgebriqueSauf1(a + 1)}x`,
          ]
          coeffa = a + 1
          constb = b
          break
        case 10: // 'ax*bx':
          texte = `$${lettreDepuisChiffre(i + 1)}=${rienSi1(a)}x\\times ${ecritureParentheseSiMoins(`${rienSi1(b)}x`)}$`
          texteCorr = `$${lettreDepuisChiffre(i + 1)}=${rienSi1(a)}x\\times ${ecritureParentheseSiMoins(`${rienSi1(b)}x`)}=${rienSi1(a * b)}x^2$`
          reponse = `${rienSi1(a * b)}x^2`
          coeffa = a * b
          constb = 0
          break
      }
      // EE : Permet en deux lignes de mettre toutes les réponses attendues en couleur
      // const aMettreEnCouleur = miseEnEvidence(texteCorr.split('=').pop().replace('$', '')) + '$'
      // texteCorr = texteCorr.replace(texteCorr.split('=').pop(), '') + aMettreEnCouleur
      const lastPart = texteCorr.split('=').pop()
      if (lastPart !== undefined) {
        const aMettreEnCouleur = miseEnEvidence(lastPart.replace('$', '')) + '$'
        texteCorr = texteCorr.replace(lastPart, '') + aMettreEnCouleur
      }

      if (this.sup2) {
        // On découpe
        const etapes = texteCorr.split('=')
        texteCorr = ''
        etapes.forEach(function (etape) {
          etape = etape.replace('$', '')
          texteCorr +=
            etape === lettreDepuisChiffre(i + 1)
              ? ''
              : `$${lettreDepuisChiffre(i + 1)} = ${etape}$<br>`
        })
      }

      if (!context.isAmc) {
        handleAnswers(this, i, {
          reponse: {
            value: reponse,
            options: { expressionsForcementReduites: true },
          },
        })
        texte += this.interactif
          ? `<br>$${lettreDepuisChiffre(i + 1)} = $` +
            ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBaseAvecVariable,
            )
          : ''
      } else {
        this.autoCorrectionAMC[i] = {
          enonce: '',
          enonceAvant: false,
          options: { multicols: true, barreseparation: true },
          propositions: [
            {
              type: 'AMCOpen',
              propositions: [
                {
                  texte: texteCorr,
                  enonce: texte + '<br>',
                  statut: 4,
                },
              ],
            },
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  statut: '',
                  reponse: {
                    texte: 'valeur de $a$ dans $ax+b$',
                    valeur: [coeffa],
                    param: {
                      digits: 2,
                      decimals: 0,
                      signe: true,
                      approx: 0,
                    },
                  },
                },
              ],
            },
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  statut: '',
                  reponse: {
                    texte: 'valeur de $b$ dans $ax+b$',
                    valeur: [constb],
                    param: {
                      digits: 2,
                      decimals: 0,
                      signe: true,
                      approx: 0,
                    },
                  },
                },
              ],
            },
          ],
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      }

      if (this.questionJamaisPosee(i, a, b, c, d)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenuSansNumero(this)
  }
}
