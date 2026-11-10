import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import {
  choice,
  combinaisonListes2,
  enleveDoublonNum,
} from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  arrondi,
  nombreDeChiffresDansLaPartieDecimale,
  nombreDeChiffresDe,
} from '../../lib/outils/nombres'
import { stringNombre, texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { fraction } from '../../modules/fractions'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

import { amcConvert } from '../../lib/amc/amcBuilders'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { texFractionFromString } from '../../lib/outils/deprecatedFractions'
import { sp } from '../../lib/outils/outilString'

export const titre =
  "Donner l'écriture (décimale, en fraction décimale ou en pourcentage) d'une somme (ou différence) de nombres avec fractions décimales"
export const interactifReady = true

export const dateDePublication = '20/01/2022'
export const dateDeModifImportante = '14/01/2026'
/**
 * Donner l'écriture (décimale ou en fraction décimale) d'une somme (ou différence) de nombres avec fractions décimales et pourcentages
 *
 * * La somme avec entiers peut être avec retenue (genre 2+23/10) ou sans retenue (3+7/10)
 * * Tous les choix sont paramétrables
 * *
 * @author Éric Elter

 */

export const uuid = 'c5438'

export const refs = {
  'fr-fr': [],
  'fr-2016': [],
  'fr-ch': [],
}
export default class SommeFractionsDecimalesOld extends Exercice {
  can: boolean

  constructor() {
    super()

    this.nbQuestions = 6
    this.besoinFormulaireTexte = [
      'Type des calculs',
      "Nombres séparés par des tirets :\n(Les fractions sont décimales et de même dénominateur)\n1 : Somme de 2 fractions\n2 : Différence de 2 fractions\n3 : Somme (sans retenue) d'un entier et d'une somme de 2 fractions\n4 : Somme (sans retenue) d'un entier et d'une différence de 2 fractions\n5 : Somme d'un entier et d'une somme de 2 fractions\n6 : Somme d'un entier et d'une différence de 2 fractions\n7 : Mélange",
    ]
    this.besoinFormulaire2Texte = [
      'Forme de la solution',
      'Nombres séparés par des tirets :\n1 : Un nombre décimal\n2 : Une fraction décimale\n3 : Un pourcentage\n4 : Les trois',
    ]
    this.sup = '7'
    this.sup2 = 4

    this.can = false
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      max: 6,
      defaut: 7,
      melange: 7,
      nbQuestions: this.nbQuestions,
      saisie: this.sup,
    })

    const listeTypeDeQuestions = combinaisonListes2(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    const typesDeSolutionsDisponibles = gestionnaireFormulaireTexte({
      max: 3,
      defaut: 4,
      melange: 4,
      nbQuestions: 50, // EE : ici, mettre this.nbQuestions empêchait d'avoir 2 ou 3 champs si une seule question. C'était donc une mauvaise idée.
      saisie: this.sup2,
    })

    let typesDeSolutionsDisponiblesEntiers = typesDeSolutionsDisponibles.map(
      (value) => parseInt(value.toString(), 10),
    )

    typesDeSolutionsDisponiblesEntiers = enleveDoublonNum(
      typesDeSolutionsDisponiblesEntiers,
    )

    this.consigne = 'Donner le résultat de '
    this.consigne += this.nbQuestions === 1 ? 'ce' : 'chaque'
    this.consigne += ' calcul sous forme '
    let casSolutionsAttendues
    if (typesDeSolutionsDisponiblesEntiers.length === 1) {
      casSolutionsAttendues = typesDeSolutionsDisponiblesEntiers[0]
      switch (casSolutionsAttendues) {
        case 1:
          this.consigne += "d'une écriture décimale."
          break
        case 2:
          this.consigne += "d'une fraction décimale."
          break
        case 3:
          this.consigne += "d'un pourcentage."
          break
      }
    } else if (typesDeSolutionsDisponiblesEntiers.length === 3) {
      casSolutionsAttendues = 7
      this.consigne +=
        "d'une fraction décimale puis d'une écriture décimale puis d'un pourcentage."
    } else if (typesDeSolutionsDisponiblesEntiers.includes(1)) {
      if (typesDeSolutionsDisponiblesEntiers.includes(2)) {
        casSolutionsAttendues = 4
        this.consigne += "d'une fraction décimale puis d'une écriture décimale."
      } else {
        casSolutionsAttendues = 5
        this.consigne += "d'une écriture décimale puis d'un pourcentage."
      }
    } else {
      casSolutionsAttendues = 6
      this.consigne += "d'une fraction décimale puis d'un pourcentage."
    }

    for (
      let i = 0,
        texte,
        texteCorrFrac,
        texteCorrFracSur100,
        texteCorr,
        cpt = 0,
        a,
        b,
        c,
        reponseAMC,
        denAMC,
        numAMC,
        choix;
      i < this.nbQuestions && cpt < 50;
    ) {
      a = randint(2, 19)
      b = randint(2, 19, a)
      c = randint(2, 19, [a, b])
      choix = randint(1, 3)
      denAMC = Math.pow(10, choix)
      switch (listeTypeDeQuestions[i]) {
        case 1:
          {
            // Somme de deux fractions décimales de même dénominateur
            b = randint(2, 50)
            c = randint(2, 50, [b])
            while ((b + c) % 10 === 0) {
              c = randint(2, 50, [b])
            } // Pour éviter d'avoir une somme multiple de 10
            const fracB = fraction(b, denAMC)
            const fracC = fraction(c, denAMC)
            const fracBPlusC = fraction(b + c, denAMC)
            texte = `$${fracB.texFraction}+${fracC.texFraction}$`
            numAMC = b + c
            if (this.can) {
              this.canEnonce = `Calculer $${fracB.texFraction}+${fracC.texFraction}$ sous forme d'une fraction décimale.`
              this.correction = this.listeCorrections[0]
            }
            texteCorrFrac = `${fracBPlusC.texFraction}`
          }
          break
        case 2:
          {
            // Différence de deux fractions décimales de même dénominateur
            b = randint(3, 50)
            c = randint(2, b - 1)
            numAMC = b - c
            const fracB = fraction(b, denAMC)
            const fracC = fraction(c, denAMC)
            const fracBMoinsC = fraction(b - c, denAMC)
            texte = `$${fracB.texFraction}-${fracC.texFraction}$`
            if (this.can) {
              this.canEnonce = `Calculer $${fracB.texFraction}-${fracC.texFraction}$ sous forme d'une fraction décimale.`
              this.correction = this.listeCorrections[0]
            }
            texteCorrFrac = `${fracBMoinsC.texFraction}`
          }
          break
        case 3:
          {
            // Somme d'un entier avec une somme de deux fractions décimales de même dénominateur, sans retenue
            b = choix === 1 ? randint(2, 7) : randint(2, 50)
            c = choix === 1 ? randint(2, 7, [b, 10 - b]) : randint(2, 50, [b])
            a = randint(2, 20, [b, c])
            while ((b + c) % 10 === 0) {
              c = randint(2, 50, [a, b])
            } // Pour éviter d'avoir une somme multiple de 10
            const fracA = fraction(a * denAMC, denAMC)
            const fracB = fraction(b, denAMC)
            const fracC = fraction(c, denAMC)
            const fracBPlusC = fraction(b + c, denAMC)
            texte = `$${a}+${fracB.texFraction}+${fracC.texFraction}$`
            numAMC = a * denAMC + b + c
            const fracNumAMC = fraction(numAMC, denAMC)
            if (this.can) {
              this.canEnonce = `Calculer $${a}+${fracB.texFraction}+${fracC.texFraction}$ sous forme décimale.`
              this.correction = this.listeCorrections[0]
            }
            texteCorrFrac = `${a}+${fracBPlusC.texFraction}=${fracA.texFraction}+${fracBPlusC.texFraction}=${fracNumAMC.texFraction}`
          }
          break
        case 4:
          {
            // Somme d'un entier avec une différence de deux fractions décimales de même dénominateur, sans retenue
            b = randint(3, 50)
            c =
              choix === 1
                ? randint(Math.max(b - 9, 2), b - 1)
                : randint(2, b - 1)
            a = randint(2, 20, [b, c])
            numAMC = a * denAMC + b - c
            const fracNumAMC = fraction(numAMC, denAMC)
            const fracA = fraction(a * denAMC, denAMC)
            const fracB = fraction(b, denAMC)
            const fracC = fraction(c, denAMC)
            const fracBMoinsC = fraction(b - c, denAMC)
            texte = `$${a}+${fracB.texFraction}-${fracC.texFraction}$`
            if (this.can) {
              this.canEnonce = `Calculer $${a}+${fracB.texFraction}-${fracC.texFraction}$ sous forme décimale.`
              this.correction = this.listeCorrections[0]
            }
            texteCorrFrac = `${a}+${fracBMoinsC.texFraction}=${fracA.texFraction}+${fracBMoinsC.texFraction}=${fracNumAMC.texFraction}`
          }
          break
        case 5:
          {
            // Somme d'un entier avec une somme de deux fractions décimales de même dénominateur, avec éventuelle retenue
            b = randint(2, 50)
            c = randint(2, 50, [b])
            a = randint(2, 20, [b, c])
            while ((b + c) % 10 === 0) {
              c = randint(2, 50, [a, b])
            } // Pour éviter d'avoir une somme multiple de 10
            const fracA = fraction(a * denAMC, denAMC)
            const fracB = fraction(b, denAMC)
            const fracC = fraction(c, denAMC)
            const fracBPlusC = fraction(b + c, denAMC)
            texte = `$${a}+${fracB.texFraction}+${fracC.texFraction}$`
            numAMC = a * denAMC + b + c
            const fracNumAMC = fraction(numAMC, denAMC)
            if (this.can) {
              this.canEnonce = `Calculer $${a}+${fracB.texFraction}+${fracC.texFraction}$ sous forme décimale.`
              this.correction = this.listeCorrections[0]
            }
            texteCorrFrac = `${a}+${fracBPlusC.texFraction}=${fracA.texFraction}+${fracBPlusC.texFraction}=${fracNumAMC.texFraction}`
          }
          break
        case 6:
        default:
          {
            // Somme d'un entier avec une différence de deux fractions décimales de même dénominateur, avec éventuelle retenue
            b = randint(3, 50)
            c = randint(2, b - 1)
            a = randint(2, 20, [b, c])
            const fracA = fraction(a * denAMC, denAMC)
            const fracB = fraction(b, denAMC)
            const fracC = fraction(c, denAMC)
            const fracBMoinsC = fraction(b - c, denAMC)
            texte = `$${a}+${fracB.texFraction}-${fracC.texFraction}$`
            numAMC = a * denAMC + b - c
            const fracNumAMC = fraction(numAMC, denAMC)
            if (this.can) {
              this.canEnonce = `Calculer $${a}+${fracB.texFraction}-${fracC.texFraction}$ sous forme décimale.`
              this.correction = this.listeCorrections[0]
            }
            texteCorrFrac = `${a}+${fracBMoinsC.texFraction}=${fracA.texFraction}+${fracBMoinsC.texFraction}=${fracNumAMC.texFraction}`
          }
          break
      }
      // commun à tous les cas : on termine avec '$' ou on ajoute la valeur décimale suivie de '$'
      reponseAMC = numAMC / denAMC
      const pourcentage = arrondi(reponseAMC * 100, 2)
      texteCorrFracSur100 = texFractionFromString(pourcentage, 100)
      texteCorr = texte + '$=' + texteCorrFrac + '$'
      if (typesDeSolutionsDisponiblesEntiers.includes(2)) {
        // Uniformisation : Mise en place de la réponse attendue en interactif en orange et gras

        const textCorrSplit = texteCorr.split('=')
        let aRemplacer = textCorrSplit[textCorrSplit.length - 1]
        aRemplacer = aRemplacer.replace('$', '').replace('<br>', '')

        texteCorr = ''
        for (let ee = 0; ee < textCorrSplit.length - 1; ee++) {
          texteCorr += textCorrSplit[ee] + '='
        }
        texteCorr += `$ $${miseEnEvidence(aRemplacer)}`

        // Fin de cette uniformisation
      } else texteCorr += '$'
      if (typesDeSolutionsDisponiblesEntiers.includes(1)) {
        texteCorr += `=${miseEnEvidence(texNombre(reponseAMC))}`
      }
      if (typesDeSolutionsDisponiblesEntiers.includes(3)) {
        if (denAMC !== 100) texteCorr += `=${texteCorrFracSur100}`
        texteCorr += `=${miseEnEvidence(texNombre(pourcentage))}${sp()} \\%`
      }
      texteCorr += '$'
      const choixDigit = randint(0, 1)
      const fractionResultat = fraction(numAMC, denAMC).texFraction
      switch (casSolutionsAttendues) {
        case 1: // Nombre décimal
          if (context.isAmc) {
            this.autoCorrectionAMC[i] = {
              enonce: texte, // Si vide, l'énoncé est celui de l'exercice.
              propositions: [
                {
                  texte: '', // Si vide, le texte est la correction de l'exercice.

                  reponse: {
                    valeur: [reponseAMC], // obligatoire (la réponse numérique à comparer à celle de l'élève), NE PAS METTRE DE STRING à virgule ! 4.9 et non pas 4,9. Cette valeur doit être passée dans un tableau d'où la nécessité des crochets.
                    param: {
                      digits:
                        nombreDeChiffresDe(reponseAMC) +
                        randint(choixDigit, choixDigit + 1),
                      decimals:
                        nombreDeChiffresDansLaPartieDecimale(reponseAMC) +
                        choixDigit,
                      signe: false,
                    },
                  },
                },
              ],
            }
            this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
          } else {
            handleAnswers(this, i, {
              bareme: (listePoints: number[]) => [listePoints[0], 1],
              champ1: {
                value: stringNombre(reponseAMC, 3),
                options: { nombreDecimalSeulement: true },
              },
            })
          }

          break
        case 2: // Fraction décimale
          if (context.isAmc) {
            this.autoCorrectionAMC[i] = {
              enonce: texte, // Si vide, l'énoncé est celui de l'exercice.
              propositions: [
                {
                  texte: '', // Si vide, le texte est la correction de l'exercice.
                  reponse: {
                    valeur: [new FractionEtendue(numAMC, denAMC)], // obligatoire (la réponse numérique à comparer à celle de l'élève), NE PAS METTRE DE STRING à virgule ! 4.9 et non pas 4,9. Cette valeur doit être passée dans un tableau d'où la nécessité des crochets.
                    param: {
                      digitsNum: nombreDeChiffresDe(numAMC),
                      digitsDen: nombreDeChiffresDe(denAMC) + 1,
                      signe: false,
                    },
                  },
                },
              ],
            }
            this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
          } else {
            handleAnswers(this, i, {
              bareme: (listePoints: number[]) => [listePoints[0], 1],
              champ1: {
                value: fractionResultat,
                options: { fractionDecimale: true },
              },
            })
          }
          break
        case 3: // Pourcentage
          if (context.isAmc) {
            this.autoCorrectionAMC[i] = {
              enonce: texte, // Si vide, l'énoncé est celui de l'exercice.
              propositions: [
                {
                  texte: '', // Si vide, le texte est la correction de l'exercice.
                  reponse: {
                    valeur: [pourcentage], // obligatoire (la réponse numérique à comparer à celle de l'élève), NE PAS METTRE DE STRING à virgule ! 4.9 et non pas 4,9. Cette valeur doit être passée dans un tableau d'où la nécessité des crochets.
                    param: {
                      digits: nombreDeChiffresDe(pourcentage) + randint(0, 1),
                      decimals:
                        nombreDeChiffresDansLaPartieDecimale(pourcentage) +
                        randint(0, 1),
                      signe: false,
                    },
                  },
                },
              ],
            }
            this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
          } else {
            handleAnswers(this, i, {
              bareme: (listePoints: number[]) => [listePoints[0], 1],
              champ1: {
                value: stringNombre(pourcentage, 3),
                options: { nombreDecimalSeulement: true },
              },
            })
          }

          break
        case 4: // Nombre décimal ET fraction décimale
          if (context.isAmc) {
            if (choice([0, 1]) === 0) {
              this.autoCorrectionAMC[i] = {
                enonce: texte, // Si vide, l'énoncé est celui de l'exercice.
                propositions: [
                  {
                    texte: '', // Si vide, le texte est la correction de l'exercice.
                    reponse: {
                      valeur: [new FractionEtendue(numAMC, denAMC)], // obligatoire (la réponse numérique à comparer à celle de l'élève), NE PAS METTRE DE STRING à virgule ! 4.9 et non pas 4,9. Cette valeur doit être passée dans un tableau d'où la nécessité des crochets.
                      param: {
                        digitsNum: nombreDeChiffresDe(numAMC),
                        digitsDen: nombreDeChiffresDe(denAMC) + 1,
                        signe: false,
                      },
                    },
                  },
                ],
              }
              this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
            } else {
              this.autoCorrectionAMC[i] = {
                enonce: texte, // Si vide, l'énoncé est celui de l'exercice.
                propositions: [
                  {
                    texte: '', // Si vide, le texte est la correction de l'exercice.
                    reponse: {
                      valeur: [reponseAMC], // obligatoire (la réponse numérique à comparer à celle de l'élève), NE PAS METTRE DE STRING à virgule ! 4.9 et non pas 4,9. Cette valeur doit être passée dans un tableau d'où la nécessité des crochets.
                      param: {
                        digits:
                          nombreDeChiffresDe(reponseAMC) +
                          randint(choixDigit, choixDigit + 1),
                        decimals:
                          nombreDeChiffresDansLaPartieDecimale(reponseAMC) +
                          choixDigit,
                        signe: false,
                      },
                    },
                  },
                ],
              }
              this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
            }
          } else {
            handleAnswers(this, i, {
              bareme: (listePoints: number[]) => [
                listePoints[0] + listePoints[1],
                2,
              ],
              champ1: {
                value: fractionResultat,
                options: { fractionDecimale: true },
              },
              champ2: {
                value: stringNombre(reponseAMC, 3),
                options: { nombreDecimalSeulement: true },
              },
            })
          }
          break
        case 5: // nombre décimal ET pourcentage
          if (context.isAmc) {
            if (choice([0, 1]) === 0) {
              this.autoCorrectionAMC[i] = {
                enonce: texte, // Si vide, l'énoncé est celui de l'exercice.
                propositions: [
                  {
                    texte: '', // Si vide, le texte est la correction de l'exercice.
                    reponse: {
                      valeur: [reponseAMC], // obligatoire (la réponse numérique à comparer à celle de l'élève), NE PAS METTRE DE STRING à virgule ! 4.9 et non pas 4,9. Cette valeur doit être passée dans un tableau d'où la nécessité des crochets.
                      param: {
                        digits:
                          nombreDeChiffresDe(reponseAMC) +
                          randint(choixDigit, choixDigit + 1),
                        decimals:
                          nombreDeChiffresDansLaPartieDecimale(reponseAMC) +
                          choixDigit,
                        signe: false,
                      },
                    },
                  },
                ],
              }
              this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
            } else {
              this.autoCorrectionAMC[i] = {
                enonce: texte, // Si vide, l'énoncé est celui de l'exercice.
                propositions: [
                  {
                    texte: '', // Si vide, le texte est la correction de l'exercice.
                    reponse: {
                      valeur: [pourcentage], // obligatoire (la réponse numérique à comparer à celle de l'élève), NE PAS METTRE DE STRING à virgule ! 4.9 et non pas 4,9. Cette valeur doit être passée dans un tableau d'où la nécessité des crochets.
                      param: {
                        digits: nombreDeChiffresDe(pourcentage) + randint(0, 1),
                        decimals:
                          nombreDeChiffresDansLaPartieDecimale(pourcentage) +
                          randint(0, 1),
                        signe: false,
                      },
                    },
                  },
                ],
              }
              this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
            }
          } else {
            handleAnswers(this, i, {
              bareme: (listePoints: number[]) => [
                listePoints[0] + listePoints[1],
                2,
              ],
              champ1: {
                value: stringNombre(reponseAMC, 3),
                options: { nombreDecimalSeulement: true },
              },
              champ2: {
                value: stringNombre(pourcentage, 2),
                options: { nombreDecimalSeulement: true },
              },
            })
          }
          break
        case 6: // fraction décimale ET pourcentage
          if (context.isAmc) {
            if (choice([0, 1]) === 0) {
              this.autoCorrectionAMC[i] = {
                enonce: texte, // Si vide, l'énoncé est celui de l'exercice.
                propositions: [
                  {
                    texte: '', // Si vide, le texte est la correction de l'exercice.
                    reponse: {
                      valeur: [new FractionEtendue(numAMC, denAMC)], // obligatoire (la réponse numérique à comparer à celle de l'élève), NE PAS METTRE DE STRING à virgule ! 4.9 et non pas 4,9. Cette valeur doit être passée dans un tableau d'où la nécessité des crochets.
                      param: {
                        digitsNum: nombreDeChiffresDe(numAMC),
                        digitsDen: nombreDeChiffresDe(denAMC) + 1,
                        signe: false,
                      },
                    },
                  },
                ],
              }
              this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
            } else {
              this.autoCorrectionAMC[i] = {
                enonce: texte, // Si vide, l'énoncé est celui de l'exercice.
                propositions: [
                  {
                    texte: '', // Si vide, le texte est la correction de l'exercice.
                    reponse: {
                      valeur: [pourcentage], // obligatoire (la réponse numérique à comparer à celle de l'élève), NE PAS METTRE DE STRING à virgule ! 4.9 et non pas 4,9. Cette valeur doit être passée dans un tableau d'où la nécessité des crochets.
                      param: {
                        digits: nombreDeChiffresDe(pourcentage) + randint(0, 1),
                        decimals:
                          nombreDeChiffresDansLaPartieDecimale(pourcentage) +
                          randint(0, 1),
                        signe: false,
                      },
                    },
                  },
                ],
              }
              this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
            }
          } else {
            handleAnswers(this, i, {
              bareme: (listePoints: number[]) => [
                listePoints[0] + listePoints[1],
                2,
              ],
              champ1: {
                value: fractionResultat,
                options: { fractionDecimale: true },
              },
              champ2: {
                value: stringNombre(pourcentage, 2),
                options: { nombreDecimalSeulement: true },
              },
            })
          }
          break
        case 7: // Les trois
          if (context.isAmc) {
            const choix = randint(0, 2)
            if (choix === 0) {
              this.autoCorrectionAMC[i] = {
                enonce: texte, // Si vide, l'énoncé est celui de l'exercice.
                propositions: [
                  {
                    texte: '', // Si vide, le texte est la correction de l'exercice.
                    reponse: {
                      valeur: [new FractionEtendue(numAMC, denAMC)], // obligatoire (la réponse numérique à comparer à celle de l'élève), NE PAS METTRE DE STRING à virgule ! 4.9 et non pas 4,9. Cette valeur doit être passée dans un tableau d'où la nécessité des crochets.
                      param: {
                        digitsNum: nombreDeChiffresDe(numAMC),
                        digitsDen: nombreDeChiffresDe(denAMC) + 1,
                        signe: false,
                      },
                    },
                  },
                ],
              }
              this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
            } else if (choix === 1) {
              this.autoCorrectionAMC[i] = {
                enonce: texte, // Si vide, l'énoncé est celui de l'exercice.
                propositions: [
                  {
                    texte: '', // Si vide, le texte est la correction de l'exercice.
                    reponse: {
                      valeur: [pourcentage], // obligatoire (la réponse numérique à comparer à celle de l'élève), NE PAS METTRE DE STRING à virgule ! 4.9 et non pas 4,9. Cette valeur doit être passée dans un tableau d'où la nécessité des crochets.
                      param: {
                        digits: nombreDeChiffresDe(pourcentage) + randint(0, 1),
                        decimals:
                          nombreDeChiffresDansLaPartieDecimale(pourcentage) +
                          randint(0, 1),
                        signe: false,
                      },
                    },
                  },
                ],
              }
              this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
            } else {
              this.autoCorrectionAMC[i] = {
                enonce: texte, // Si vide, l'énoncé est celui de l'exercice.
                propositions: [
                  {
                    texte: '', // Si vide, le texte est la correction de l'exercice.
                    reponse: {
                      valeur: [reponseAMC], // obligatoire (la réponse numérique à comparer à celle de l'élève), NE PAS METTRE DE STRING à virgule ! 4.9 et non pas 4,9. Cette valeur doit être passée dans un tableau d'où la nécessité des crochets.
                      param: {
                        digits:
                          nombreDeChiffresDe(reponseAMC) +
                          randint(choixDigit, choixDigit + 1),
                        decimals:
                          nombreDeChiffresDansLaPartieDecimale(reponseAMC) +
                          choixDigit,
                        signe: false,
                      },
                    },
                  },
                ],
              }
              this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
            }
          } else {
            handleAnswers(this, i, {
              bareme: (listePoints: number[]) => [
                listePoints[0] + listePoints[1] + listePoints[2],
                3,
              ],
              champ1: {
                value: fractionResultat,
                options: { fractionDecimale: true },
              },
              champ2: {
                value: stringNombre(reponseAMC, 3),
                options: { nombreDecimalSeulement: true },
              },
              champ3: {
                value: stringNombre(pourcentage, 2),
                options: { nombreDecimalSeulement: true },
              },
            })
          }
          break
      }
      if (this.interactif) {
        if (casSolutionsAttendues < 4) {
          texte += remplisLesBlancs(
            this,
            i,
            '= ~ %{champ1}' + (casSolutionsAttendues === 3 ? ' \\%' : ''),
            '  ' +
              (this.sup2 === 1
                ? KeyboardType.clavierNumbers
                : KeyboardType.clavierDeBaseAvecFraction),
            '\\ldots\\ldots',
          )
        } else if (casSolutionsAttendues < 7) {
          texte += remplisLesBlancs(
            this,
            i,
            '= ~  %{champ1} ~ = ~ %{champ2}' +
              (casSolutionsAttendues !== 4 ? ' \\%' : ''),
            KeyboardType.clavierDeBaseAvecFraction,
            '\\ldots\\ldots',
          )
        } else {
          texte += remplisLesBlancs(
            this,
            i,
            '= ~  %{champ1} ~ = ~ %{champ2} ~ = ~ %{champ3} \\%',
            KeyboardType.clavierDeBaseAvecFraction,
            '\\ldots\\ldots',
          )
        }
      }

      if (this.questionJamaisPosee(i, a, b, c, choix)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        if (!context.isHtml && i === 0) {
          texteCorr = '\\setlength\\itemsep{2em}' + texteCorr
        } // espacement entre les questions
        this.listeCorrections[i] = texteCorr
        this.listeCanEnonces.push(this.canEnonce ?? '')
        this.listeCanReponsesACompleter.push(this.canReponseACompleter ?? '')
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
