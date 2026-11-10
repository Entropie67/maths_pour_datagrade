/**
 * ⚠️ Cet exercice est utilisé dans le test : tests/e2e/tests/interactivity/mathLive.calcul.test.ts ⚠️
 */

import { amcConvert } from '../../lib/amc/amcBuilders'
import { bleuMathalea, orangeMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiMoins,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
  reduirePolynomeDegre3,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenuSansNumero,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Utiliser la simple distributivité'

export const interactifReady = true

export const amcType = 'AMCHybride'
export const amcReady = true
export const dateDeModifImportante = '10/06/2024'

/**
 * Développer en utilisant la distributivité simple
 *
 * * La lettre peut être x, y, z, t, a, b ou c
 * *
 * * Forme de développement case1:  k(ax+b)
 * * Forme de développement case2: (ax+b)×k
 * * Forme de développement case3: kx(ax+b)
 * * Forme de développement case4: (ax+b)×kx
 * * Forme de développement case5: k(ax+b)+c
 * * Forme de développement case6: c+k(ax+b)
 *
 * Niveau de difficulté :
 * * 1 : Multiplication par un entier positif, tous les termes sont positifs
 * * 2 : Multiplication par un facteur positif et les termes sont relatifs
 * * 3 : Multiplication par un facteur relatif et les termes sont relatifs
 * *
 * * Refactoring 21/12/2012
 * @author Rémi Angot et Mickael Guironnet (AMC par Éric Elter)
 */
export const uuid = 'db2e0'

export const refs = {
  'fr-fr': ['3L11', '3AutoL03-1'],
  'fr-ch': ['10LCFA4E-3', '10LSFA4E-3', 'PRQAL03C-1'],
}
export default class ExerciceDevelopper extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      3,
      ' 1 : Multiplication par un entier positif, tous les termes sont positifs\n2 : Multiplication par un facteur positif\n3 : Multiplication par un facteur relatif',
    ]
    this.besoinFormulaire2Numerique = [
      'Consigne',
      2,
      '1 : Développer \n2 : Développer et réduire',
    ]
    this.besoinFormulaire3Texte = [
      'Forme de développement',
      'Nombres séparés par des tirets :\n1: k(ax+b)\n2: (ax+b)×k\n3: kx(ax+b)\n4: (ax+b)×kx\n5: k(ax+b)+c\n6: c+k(ax+b)\n7: Mélange',
    ]
    this.besoinFormulaire4CaseACocher = ['$x$ est la seule lettre utilisée']
    this.sup = 3 // difficulté
    this.sup2 = 2 // consigne
    this.sup3 = 7 // forme de développement
    this.sup4 = false
    this.nbQuestions = 6
    this.spacing = 2
    this.spacingCorr = 2

    this.listeAvecNumerotation = false
  }

  nouvelleVersion() {
    this.consigne = this.sup2 === 1 ? 'Développer' : 'Développer et réduire'
    if (this.nbQuestions > 1 && !context.isDiaporama)
      this.consigne += ' les expressions suivantes'
    this.consigne += '.'

    let lettre = this.interactif
      ? ['x', 'y', 'z', 'a', 'b', 'c']
      : ['x', 'y', 'z', 't', 'a', 'b', 'c']
    if (this.sup4) lettre = ['x']

    const typesDeQuestionsDisponibles = [
      'k(ax+b)',
      '(ax+b)×k',
      'kx(ax+b)',
      '(ax+b)×kx',
      'k(ax+b)+c',
      'c+k(ax+b)',
    ]
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup3,
      min: 1,
      max: 6,
      defaut: 7,
      listeOfCase: typesDeQuestionsDisponibles,
      nbQuestions: this.nbQuestions,
      melange: 7,
    })

    const signesK = combinaisonListes([1, -1], this.nbQuestions)
    const signesabc = combinaisonListes(
      [
        [1, -1, 1],
        [-1, -1, -1],
        [-1, 1, 1],
        [-1, 1, -1],
        [1, -1, 1],
        [1, -1, -1],
      ],
      this.nbQuestions,
    )

    const couleurCorrection =
      this.sup2 === 1
        ? [orangeMathalea, bleuMathalea]
        : [bleuMathalea, orangeMathalea]

    for (
      let i = 0,
        texte,
        texteCorr,
        reponse: string,
        reponseDev: string,
        reponseRed: string,
        reponse1,
        reponse2,
        reponse3,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      texte = ''
      texteCorr = ''
      reponse = ''
      reponseDev = ''
      reponseRed = ''
      const typesDeQuestions = listeTypeDeQuestions[i]
      const k = randint(2, 11) * (this.sup === 3 ? signesK[i] : 1)
      const a =
        randint(1, 9, [Math.abs(k)]) * (this.sup >= 2 ? signesabc[i][0] : 1)
      const b =
        randint(1, 9, [Math.abs(k), Math.abs(a)]) *
        (this.sup >= 2 ? signesabc[i][1] : 1)
      const inconnue = choice(lettre)
      const c =
        randint(2, 9, [Math.abs(k), Math.abs(a), Math.abs(b)]) *
        (this.sup >= 2 ? signesabc[i][2] : 1)
      switch (typesDeQuestions) {
        case 'k(ax+b)':
          // ne pas écrire 1x
          texte = `$${lettreDepuisChiffre(i + 1)}=${k}(${a === 1 ? '' : a === -1 ? '-' : a}${inconnue}${ecritureAlgebrique(b)})$`
          reponseDev = `${k}\\times ${ecritureParentheseSiMoins((a === 1 ? '' : a === -1 ? '-' : a) + inconnue)}+${ecritureParentheseSiNegatif(k)}\\times ${ecritureParentheseSiNegatif(b)}`
          reponseRed = `${reduireAxPlusB(k * a, k * b, inconnue)}`
          reponse1 = 0
          reponse2 = k * a
          reponse3 = k * b
          break
        case '(ax+b)×k':
          texte = `$${lettreDepuisChiffre(i + 1)}=(${a === 1 ? '' : a === -1 ? '-' : a}${inconnue}${ecritureAlgebrique(b)})\\times ${ecritureParentheseSiNegatif(k)}$`
          reponseDev = `${k}\\times ${ecritureParentheseSiMoins((a === 1 ? '' : a === -1 ? '-' : a) + inconnue)}+${ecritureParentheseSiNegatif(k)}\\times ${ecritureParentheseSiNegatif(b)}`
          reponseRed = `${reduireAxPlusB(k * a, k * b, inconnue)}`
          reponse1 = 0
          reponse2 = k * a
          reponse3 = k * b
          break
        case '(ax+b)×kx':
          texte = `$${lettreDepuisChiffre(i + 1)}=(${a === 1 ? '' : a === -1 ? '-' : a}${inconnue}${ecritureAlgebrique(b)})\\times ${ecritureParentheseSiMoins(k + inconnue)}$`
          reponseDev = `${k}${inconnue}\\times ${ecritureParentheseSiMoins((a === 1 ? '' : a === -1 ? '-' : a) + inconnue)}+${ecritureParentheseSiMoins(k + inconnue)}\\times ${ecritureParentheseSiNegatif(b)}`
          reponseRed = `${reduirePolynomeDegre3(0, k * a, k * b, 0, inconnue)}`
          reponse1 = k * a
          reponse2 = k * b
          reponse3 = 0
          break
        case 'kx(ax+b)':
          texte = `$${lettreDepuisChiffre(i + 1)}=${k}${inconnue}(${a === 1 ? '' : a === -1 ? '-' : a}${inconnue}${ecritureAlgebrique(b)})$`
          reponseDev = `${k}${inconnue}\\times ${ecritureParentheseSiMoins((a === 1 ? '' : a === -1 ? '-' : a) + inconnue)} + ${ecritureParentheseSiMoins(k + inconnue)}\\times ${ecritureParentheseSiNegatif(b)}`
          reponseRed = `${reduirePolynomeDegre3(0, k * a, k * b, 0, inconnue)}`
          reponse1 = k * a
          reponse2 = k * b
          reponse3 = 0
          break
        case 'k(ax+b)+c':
          texte = `$${lettreDepuisChiffre(i + 1)}=${k}(${a === 1 ? '' : a === -1 ? '-' : a}${inconnue}${ecritureAlgebrique(b)})${ecritureAlgebrique(c)}$`
          reponseDev = `${k}\\times ${ecritureParentheseSiMoins(reduireAxPlusB(a, 0, inconnue))}+${ecritureParentheseSiNegatif(k)}\\times ${ecritureParentheseSiNegatif(b)}${ecritureAlgebrique(c)}`
          reponseRed = `${reduireAxPlusB(k * a, k * b + c, inconnue)}`
          /* if (this.sup2 === 1) {
            reponse = [`${k * a}${inconnue}${ecritureAlgebrique(k * b)}${ecritureAlgebrique(c)}`, `${k * a}${inconnue}${ecritureAlgebrique(k * b + c)}`]
          } */
          reponse1 = 0
          reponse2 = k * a
          reponse3 = k * b + c
          break
        case 'c+k(ax+b)':
          texte = `$${lettreDepuisChiffre(i + 1)}=${c}${ecritureAlgebrique(k)}(${a === 1 ? '' : a === -1 ? '-' : a}${inconnue}${ecritureAlgebrique(b)})$`
          reponseDev = `${c}${ecritureAlgebrique(k)}\\times ${ecritureParentheseSiMoins((a === 1 ? '' : a === -1 ? '-' : a) + inconnue)}+${ecritureParentheseSiNegatif(k)}\\times ${ecritureParentheseSiNegatif(b)}`
          reponseRed = `${reduireAxPlusB(k * a, k * b + c, inconnue)}`
          /* if (this.sup2 === 1) {
             reponse = [`${k * a}${inconnue}${ecritureAlgebrique(k * b)}${ecritureAlgebrique(c)}`, `${k * a}${inconnue}${ecritureAlgebrique(k * b + c)}`]
          } */
          reponse1 = 0
          reponse2 = k * a
          reponse3 = k * b + c
          break
      }
      texteCorr = texte + '<br>'
      texteCorr += `$${lettreDepuisChiffre(i + 1)}=${miseEnEvidence(reponseDev, couleurCorrection[0])}$`
      if (this.sup2 === 1) {
        reponse = reponseDev
      } else {
        reponse = reponseRed
      }

      if (this.sup2 === 1) {
        texteCorr +=
          "<br>Ce n'est pas demandé, ici, mais si on voulait réduire l'expression, on obtiendrait : <br>"
        handleAnswers(this, i, {
          reponse: {
            value: reponseDev,
            options: { developpementEgal: true },
          },
        })
      } else {
        texteCorr += "<br>En réduisant l'expression, on obtient : <br>"
        handleAnswers(this, i, {
          reponse: {
            value: reponse,
            options: { expressionsForcementReduites: true },
          },
        })
      }

      texteCorr += ` $${lettreDepuisChiffre(i + 1)}=${reponseRed}$`
      if (!context.isAmc) {
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
                    texte: `valeur de $a$ dans $a${inconnue}^2+b${inconnue}+c$`,
                    valeur: reponse1,
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
                    texte: `valeur de $b$ dans $a${inconnue}^2+b${inconnue}+c$`,
                    valeur: reponse2,
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
                    texte: `valeur de $c$ dans $a${inconnue}^2+b${inconnue}+c$`,
                    valeur: reponse3,
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
      // Uniformisation : Mise en place de la réponse attendue en interactif en orange et gras

      const textCorrSplit = texteCorr.split('=')
      let aRemplacer = textCorrSplit[textCorrSplit.length - 1]
      aRemplacer = aRemplacer.replace('$', '').replace('<br>', '')

      texteCorr = ''
      for (let ee = 0; ee < textCorrSplit.length - 1; ee++) {
        texteCorr += textCorrSplit[ee] + '='
      }
      texteCorr += `$ $${miseEnEvidence(aRemplacer, couleurCorrection[1])}$`

      // Fin de cette uniformisation
      texteCorr += '.'

      if (this.questionJamaisPosee(i, reponse)) {
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
