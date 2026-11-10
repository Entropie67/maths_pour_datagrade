import { droiteGraduee } from '../../lib/2d/DroiteGraduee'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { arrayClone, choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { lettreIndiceeDepuisChiffre } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'

import { fraction } from '../../modules/fractions'
import { mathalea2d } from '../../modules/mathalea2d'

import { amcConvert } from '../../lib/amc/amcBuilders'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  quotientier,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Lire des abscisses fractionnaires'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCOpen'
export const dateDePublication = '14/01/2025'
export const dateDeModifImportante = '30/10/2025'
/**
 *
 * Lire des abscisses sous forme de fractions avec possibilté d'avoir des fractions simplifiées
 * @author Olivier Mimeau d'après Jean-claude Lhote 6N21-2
 */
export const uuid = '0e527'

export const refs = {
  'fr-fr': ['CM2N2F-1'],
  'fr-2016': ['6N21-3'],
  'fr-ch': ['9R1NO4B-1', '9R2NO4B-1', '9R3NO4B-1', 'PRQNO04B-1'],
}
export default class LireAbscissesFractionnairesComplexes extends Exercice {
  constructor() {
    super()
    this.sup = 13 // 3
    /* this.sup2 = true // sous forme fractionnaire
    this.sup3 = true // avec des fractions simplifiées
    this.sup4 = false // valeurs positives si false sinon valeurs positives et négatives */
    this.besoinFormulaireTexte = [
      'Types de questions',
      'Nombres séparés par des tirets  :\n2 : Demis\n3 : Tiers\n4 : Quarts\n5 : Cinquièmes\n6 : Sixièmes\n7 : Septièmes\n8 : Huitièmes\n9 : Neuvièmes\n10: Dixièmes\n11: Onzièmes\n12 : Douzièmes\n13 : Mélange',
    ]
    /*
    this.besoinFormulaire3CaseACocher = [
      'Avec des fractions simplifiées (le cas échéant)',
      true,
    ]
    this.besoinFormulaire4CaseACocher = ['Avec des valeurs négatives', false] */

    // evitons les nombreuses cases a cocher

    this.besoinFormulaire2Texte = [
      'Options supplémentaires',
      '0: Sans option\n1 : Ajouter "sous forme fractionnaire" dans l\'énoncé\n2 : Avec des fractions simplifiées (le cas échéant)\n3 : Avec des valeurs négatives\n4 : Correction détaillée\n5 : Utiliser la notation ( )\n6: Fractions non simplifiées sur l\'axe',
    ]

    this.nbQuestions = 3
    this.sup2 = '1-2-4-6'
    this.spacingCorr = context.isHtml ? 2.5 : 4 // ecart pour les fractions
  }

  nouvelleVersion() {
    //    let typeDeQuestions: number[]

    // Pour éviter les erreurs lorsqu'on manipule un this.sup2 undefined
    if (typeof this.sup2 !== 'string') this.sup2 = '1-2-4-6'

    if (this.sup3 === true) {
      this.sup2 += '-2'
    }
    if (this.sup3 === false) {
      // !this.sup3 ne reflete pas s3=false si s3 non defini
      this.sup2 = this.sup2.replace('2', '')
    }
    if (this.sup4 === true) {
      this.sup2 += '-3'
    }
    if (this.sup4 === false) {
      this.sup2 = this.sup2.replace('3', '')
    }
    const typeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 2,
      max: 12,
      defaut: 13,
      melange: 13,
      nbQuestions: this.nbQuestions,
    })
    const listeOptions = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      nbQuestions: 0,
      min: 0,
      max: 6,
      melange: 7,
      defaut: 0,
    })
    const motFractionnaire = listeOptions.includes(1)
    const fractionsSimplifiees = listeOptions.includes(2)
    const valeursNegatives = listeOptions.includes(3)
    const correctionDetaillee = listeOptions.includes(4)
    const correctionNotationParentheses = listeOptions.includes(5)
    const correctionFractionsNonSimplifiees = listeOptions.includes(6)
    const data: Record<
      number,
      { id: number; den: number[]; max: number; min: number }
    > = {
      2: {
        id: 2,
        den: [2],
        max: !valeursNegatives ? 8 : 4,
        min: !valeursNegatives ? 0 : -4,
      },
      3: {
        id: 3,
        den: [3],
        max: !valeursNegatives ? 8 : 4,
        min: !valeursNegatives ? 0 : -4,
      },
      4: {
        id: 4,
        den: [2, 4],
        max: !valeursNegatives ? 8 : 4,
        min: !valeursNegatives ? 0 : -4,
      },
      5: {
        id: 5,
        den: [5],
        max: !valeursNegatives ? 8 : 4,
        min: !valeursNegatives ? 0 : -4,
      },
      6: {
        id: 6,
        den: [2, 3, 6],
        max: !valeursNegatives ? 6 : 3,
        min: !valeursNegatives ? 0 : -3,
      },
      7: {
        id: 7,
        den: [7],
        max: !valeursNegatives ? 4 : 2,
        min: !valeursNegatives ? 0 : -2,
      },
      8: {
        id: 8,
        den: [2, 4, 8],
        max: !valeursNegatives ? 4 : 2,
        min: !valeursNegatives ? 0 : -2,
      },
      9: {
        id: 9,
        den: [3, 9],
        max: !valeursNegatives ? 4 : 2,
        min: !valeursNegatives ? 0 : -2,
      },
      10: {
        id: 10,
        den: [2, 5, 10],
        max: !valeursNegatives ? 4 : 2,
        min: !valeursNegatives ? 0 : -2,
      },
      11: {
        id: 11,
        den: [11],
        max: !valeursNegatives ? 3 : 2,
        min: !valeursNegatives ? 0 : -1,
      },
      12: {
        id: 12,
        den: [2, 3, 4, 6, 12],
        max: !valeursNegatives ? 3 : 2,
        min: !valeursNegatives ? 0 : -1,
      },
    }

    for (let i = 0, texte, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      texte = ''
      const tab = Number(typeDeQuestions[i])
      const origine = data[tab].min

      const den1 =
        !fractionsSimplifiees || data[tab].den.length === 1
          ? data[tab].id
          : choice(data[tab].den)
      const tab1 = data[tab].id / den1

      const num1 = trouveNumerateur(den1, origine, data[tab].max)
      const den2 =
        !fractionsSimplifiees || data[tab].den.length === 1
          ? data[tab].id
          : choice(data[tab].den, den1)
      const tab2 = data[tab].id / den2
      const num2 = trouveNumerateur(den2, origine, data[tab].max, [
        { num: num1, den: den1 },
      ])
      const den3 =
        !fractionsSimplifiees || data[tab].den.length === 1
          ? data[tab].id
          : choice(
              data[tab].den,
              data[tab].den.length > 2 ? [den1, den2] : [den1],
            )
      const tab3 = data[tab].id / den3
      const num3 = trouveNumerateur(den3, origine, data[tab].max, [
        { num: num1, den: den1 },
        { num: num2, den: den2 },
      ])
      const fraction1 = fraction(num1, den1)
      const fraction2 = fraction(num2, den2)
      const fraction3 = fraction(num3, den3)
      const reponse1 = fraction1.reduire(tab1 * 2).texFraction
      const reponse2 = fraction2.reduire(tab2 * 2).texFraction
      const reponse3 = fraction3.reduire(tab3 * 2).texFraction
      texte +=
        'Donner les abscisses respectives des points ' +
        (motFractionnaire ? 'sous forme fractionnaire ' : '') +
        ': '
      let textePourRemplisLesBlancs = ''
      if (correctionNotationParentheses) {
        textePourRemplisLesBlancs = `\\quad ${lettreIndiceeDepuisChiffre(i * 3 + 1)}\\left( \\; %{champ1} \\right) \\quad ${lettreIndiceeDepuisChiffre(i * 3 + 2)} \\left( \\; %{champ2} \\right) \\quad ${lettreIndiceeDepuisChiffre(i * 3 + 3)} \\left( \\;  %{champ3} \\right)`
      } else {
        textePourRemplisLesBlancs = `\\quad ${lettreIndiceeDepuisChiffre(i * 3 + 1)} \\; %{champ1}  \\quad ${lettreIndiceeDepuisChiffre(i * 3 + 2)}  \\; %{champ2}  \\quad ${lettreIndiceeDepuisChiffre(i * 3 + 3)}  \\;  %{champ3} `
      }
      texte += remplisLesBlancs(
        this,
        i,
        textePourRemplisLesBlancs,
        'clavierDeBaseAvecFraction',
        '\\ldots',
      )
      handleAnswers(
        this,
        i,
        {
          bareme: (listePoints) => [
            listePoints[0] + listePoints[1] + listePoints[2],
            3,
          ],
          champ1: {
            value: reponse1,
            options: { fractionEgale: motFractionnaire },
          }, // avecFractions
          champ2: {
            value: reponse2,
            options: { fractionEgale: motFractionnaire },
          },
          champ3: {
            value: reponse3,
            options: { fractionEgale: motFractionnaire },
          },
        },
        { formatInteractif: 'fillInTheBlank' },
      )

      const tailleUnite = 20 / (data[tab].max - origine)
      // const P=point
      const d = droiteGraduee({
        Min: origine,
        Max: data[tab].max,
        Unite: tailleUnite,
        thickSec: true,
        thickSecDist: 1 / data[tab].id,
        thickEpaisseur: 3,
        pointListe: [
          [num1 / den1, lettreIndiceeDepuisChiffre(i * 3 + 1)],
          [num2 / den2, lettreIndiceeDepuisChiffre(i * 3 + 2)],
          [num3 / den3, lettreIndiceeDepuisChiffre(i * 3 + 3)],
        ],
        pointTaille: 5,
        pointStyle: '|',
        pointOpacite: 0.8,
        pointEpaisseur: 2,
      })

      texte +=
        '<br>' +
        mathalea2d(
          {
            xmin: -0.2,
            xmax: (data[tab].max - origine) * tailleUnite + 1,
            ymin: -1,
            ymax: 1.5,
            scale: 0.6,
          },
          d,
        )
      // correctionFractionsNonSimplifiees
      const label1 = correctionFractionsNonSimplifiees
        ? fraction((num1 * data[tab].id) / den1, data[tab].id).texFraction
        : textFractionCorr(num1, den1, fractionsSimplifiees)
      const label2 = correctionFractionsNonSimplifiees
        ? fraction((num2 * data[tab].id) / den2, data[tab].id).texFraction
        : textFractionCorr(num2, den2, fractionsSimplifiees)
      const label3 = correctionFractionsNonSimplifiees
        ? fraction((num3 * data[tab].id) / den3, data[tab].id).texFraction
        : textFractionCorr(num3, den3, fractionsSimplifiees)
      const dCorr = droiteGraduee({
        Min: origine,
        Max: data[tab].max,
        Unite: tailleUnite,
        thickSec: true,
        thickSecDist: 1 / data[tab].id,
        thickEpaisseur: 3,
        pointListe: [
          [num1 / den1, lettreIndiceeDepuisChiffre(i * 3 + 1)],
          [num2 / den2, lettreIndiceeDepuisChiffre(i * 3 + 2)],
          [num3 / den3, lettreIndiceeDepuisChiffre(i * 3 + 3)],
        ],
        pointTaille: 5,
        pointStyle: '|',
        pointOpacite: 0.8,
        pointEpaisseur: 2,
        labelListe: [
          [num1 / den1, miseEnEvidence(label1)],
          [num2 / den2, miseEnEvidence(label2)],
          [num3 / den3, miseEnEvidence(label3)],
        ],
        labelDistance: 0.8,
        labelCustomDistance: 1.7,
      })
      let texteCorr = mathalea2d(
        {
          xmin: -0.2,
          xmax: (data[tab].max - origine) * tailleUnite + 1,
          ymin: -2.5,
          ymax: 1.5,
          scale: 0.6,
        },
        dCorr,
      )

      // correction textuelle
      if (!context.isHtml) {
        texteCorr += '<br><br>'
      }
      // correction textuelle
      if (correctionDetaillee) {
        texteCorr += textCorrectionDetaillee(
          [
            lettreIndiceeDepuisChiffre(i * 3 + 1),
            lettreIndiceeDepuisChiffre(i * 3 + 2),
            lettreIndiceeDepuisChiffre(i * 3 + 3),
          ],
          data[tab].id,
          [num1, num2, num3],
          [den1, den2, den3],
          fractionsSimplifiees,
          correctionNotationParentheses,
        )
      } else {
        texteCorr += `Il y a $${data[tab].id}$ intervalles entre 0 et 1, `
        texteCorr += `on peut donc écrire des fractions du type $\\dfrac{\\ldots}{${data[tab].id}}$`
        if (fractionsSimplifiees) {
          if (data[tab].den.length > 1) {
            const autresDen = arrayClone(data[tab].den).filter(
              (n) => n !== data[tab].id,
            )
            while (autresDen.length > 1) {
              texteCorr += `, $\\dfrac{\\ldots}{${autresDen[0]}}$`
              autresDen.shift()
            }
            texteCorr += ` ou $\\dfrac{\\ldots}{${autresDen[0]}}$ `
          }
          texteCorr += ''
        }
        texteCorr += `.<br> Donc `

        texteCorr +=
          ecritAbscisse(
            lettreIndiceeDepuisChiffre(i * 3 + 1),
            textFractionCorr(num1, den1, fractionsSimplifiees),
            correctionNotationParentheses,
          ) + ', '
        // ` $${lettreIndiceeDepuisChiffre(i * 3 + 1)} \\left( ${textFractionCorr(num1, den1, fractionsSimplifiees)}  \\right)$, `
        texteCorr +=
          ecritAbscisse(
            lettreIndiceeDepuisChiffre(i * 3 + 2),
            textFractionCorr(num2, den2, fractionsSimplifiees),
            correctionNotationParentheses,
          ) + ' et '
        texteCorr +=
          ecritAbscisse(
            lettreIndiceeDepuisChiffre(i * 3 + 3),
            textFractionCorr(num3, den3, fractionsSimplifiees),
            correctionNotationParentheses,
          ) + '.'
      }
      if (fractionsSimplifiees) {
        // donner les ecritures avec fractions simplifiée quand c'est possible
        // texteCorr += '<br>'
        type PrepareReponseSimplifiee = { lettre: string; valeur: string }
        const listeReponseSimplifiee: PrepareReponseSimplifiee[] = []
        if (fraction1.simplifie().den !== data[tab].id) {
          listeReponseSimplifiee.push({
            lettre: lettreIndiceeDepuisChiffre(i * 3 + 1),
            valeur: fraction1.simplifie().texFraction,
          })
        }
        if (fraction2.simplifie().den !== data[tab].id) {
          listeReponseSimplifiee.push({
            lettre: lettreIndiceeDepuisChiffre(i * 3 + 2),
            valeur: fraction2.simplifie().texFraction,
          })
        }
        if (fraction3.simplifie().den !== data[tab].id) {
          listeReponseSimplifiee.push({
            lettre: lettreIndiceeDepuisChiffre(i * 3 + 3),
            valeur: fraction3.simplifie().texFraction,
          })
        }
        if (listeReponseSimplifiee.length > 0) {
          texteCorr += 'On peut aussi écrire : '
          texteCorr += ecritAbscisse(
            listeReponseSimplifiee[0].lettre,
            listeReponseSimplifiee[0].valeur,
            correctionNotationParentheses,
          )
          listeReponseSimplifiee.shift()
          if (listeReponseSimplifiee.length > 0) {
            if (listeReponseSimplifiee.length > 1) {
              texteCorr +=
                ', ' +
                ecritAbscisse(
                  listeReponseSimplifiee[0].lettre,
                  listeReponseSimplifiee[0].valeur,
                  correctionNotationParentheses,
                )
              listeReponseSimplifiee.shift()
            }
            texteCorr +=
              ' et ' +
              ecritAbscisse(
                listeReponseSimplifiee[0].lettre,
                listeReponseSimplifiee[0].valeur,
                correctionNotationParentheses,
              )
          }
          texteCorr += '.'
        }
      }
      if (!motFractionnaire) {
        // donner les ecritures décimales quand c'est possible
        // texteCorr += '<br>'
        type PrepareReponseDecimale = { lettre: string; valeur: string }
        const listeReponseDecimale: PrepareReponseDecimale[] = []
        if (fraction1.multiplieEntier(100).estEntiere) {
          listeReponseDecimale.push({
            lettre: lettreIndiceeDepuisChiffre(i * 3 + 1),
            valeur: texNombre(fraction1.toNumber()),
          })
        } // texNombre(L > l ? L : l)
        if (fraction2.multiplieEntier(100).estEntiere) {
          listeReponseDecimale.push({
            lettre: lettreIndiceeDepuisChiffre(i * 3 + 2),
            valeur: texNombre(fraction2.toNumber()),
          })
        }
        if (fraction3.multiplieEntier(100).estEntiere) {
          listeReponseDecimale.push({
            lettre: lettreIndiceeDepuisChiffre(i * 3 + 3),
            valeur: texNombre(fraction3.toNumber()),
          })
        }
        if (listeReponseDecimale.length > 0) {
          texteCorr += 'On peut aussi écrire : '
          texteCorr += ecritAbscisse(
            listeReponseDecimale[0].lettre,
            listeReponseDecimale[0].valeur,
            correctionNotationParentheses,
          )
          listeReponseDecimale.shift()
          if (listeReponseDecimale.length > 0) {
            if (listeReponseDecimale.length > 1) {
              texteCorr +=
                ', ' +
                ecritAbscisse(
                  listeReponseDecimale[0].lettre,
                  listeReponseDecimale[0].valeur,
                  correctionNotationParentheses,
                )
              listeReponseDecimale.shift()
            }
            texteCorr +=
              ' et ' +
              ecritAbscisse(
                listeReponseDecimale[0].lettre,
                listeReponseDecimale[0].valeur,
                correctionNotationParentheses,
              )
          }
          texteCorr += '.'
        }
      }

      if (this.questionJamaisPosee(i, den1, num1, num2, num3)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        if (context.isAmc) {
          this.autoCorrectionAMC[i] = {
            enonce: texte + '\n',
            propositions: [
              {
                texte: texteCorr,
                statut: 5,
                sanscadre: true,
                pointilles: true,
                feedback: '',
              },
            ],
          }
          this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        }
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}

function trouveNumerateur(
  den: number,
  min: number,
  max: number,
  fractionsAEviter: { num: number; den: number }[] = [],
) {
  const isNombreEntier = function (nu: number, de: number) {
    if (nu % de === 0) return true
    return false
  }

  const listeAPiocher = []
  let trouve = true
  for (let i = min * den; i <= max * den; i++) {
    trouve = true
    if (isNombreEntier(i, den)) {
      trouve = false
    } else {
      for (const fraction of fractionsAEviter) {
        if (
          Math.abs(fraction.num / fraction.den - i / den) <
          2 / fraction.den
        ) {
          trouve = false
        }
      }
    }
    if (trouve) {
      listeAPiocher.push(i)
    }
  }
  const num = choice(listeAPiocher) // randint(min * den, den * max, listeAEviter)
  return num
}

function textFractionCorr(
  num: number,
  den: number,
  simplifier: boolean,
): string {
  return simplifier
    ? fraction(num, den).texFractionSimplifiee
    : fraction(num, den).texFraction
}

function ecritAbscisse(
  point: string,
  nombre: string,
  parenthese: boolean,
): string {
  let texte = ''
  if (parenthese) {
    texte += `$${point} \\left( ${miseEnEvidence(nombre)} \\right)$`
  } else {
    texte += `l'abscisse de $${point}$ est $${miseEnEvidence(nombre)}$`
    // texte += `\\text{l'abscisse de }${point}\\text{ est }${nombre}`
  }
  return texte
}

function ecritAbscisseDétaillée(
  point: string,
  num: number,
  den: number,
  parentheses: boolean,
  aussi: boolean = false,
): string {
  let texte = ''
  texte += `L'abscisse du point $${point}$ est `
  texte += aussi ? 'également ' : ''
  texte += `$${miseEnEvidence(fraction(num, den).texFraction)}$`
  texte += parentheses
    ? ` et se note $${point} \\left( ${miseEnEvidence(fraction(num, den).texFraction)} \\right)$.`
    : `.`
  return texte
}

function expliciteNbPas(num: number, den: number): string {
  let texte = ''
  if (quotientier(num, den) > 0) {
    texte += `(${quotientier(num, den)} \\times  ${den}) + ${num % den} = `
  }
  texte += `${num}`
  return texte
}

function textCorrectionDetaillee(
  lettre: string[],
  PasPrincipal: number,
  num: number[],
  den: number[],
  simplifier: boolean,
  parentheses: boolean,
): string {
  let reponse = ''
  reponse += `Il y a $${PasPrincipal}$ intervalles dans une unité, donc le pas est de $\\dfrac{1}{${PasPrincipal}}$ car $${PasPrincipal} \\times \\dfrac{1}{${PasPrincipal}} = 1$.<br>`
  let mult = PasPrincipal / den[0]
  reponse += `Pour aller de l'origine au point $${lettre[0]}$, il y a $${expliciteNbPas(num[0] * mult, PasPrincipal)}$ pas : `
  reponse += `$${num[0] * mult} \\times \\dfrac{1}{${PasPrincipal}}$ = $${fraction(num[0] * mult, PasPrincipal).texFraction}$.`
  reponse += `<br> `
  reponse +=
    ecritAbscisseDétaillée(
      lettre[0],
      num[0] * mult,
      PasPrincipal,
      parentheses,
    ) + '<br>Pour les autres points on procède de la même façon.'
  for (let i = 1; i < lettre.length; i++) {
    mult = PasPrincipal / den[i]
    reponse +=
      `$~$` +
      ecritAbscisseDétaillée(
        lettre[i],
        num[i] * mult,
        PasPrincipal,
        parentheses,
      )
  }
  if (simplifier) {
    /*   type PointEtFraction = { point: string; num: number; den: number }
    const pointEtFraction = new Array<PointEtFraction>()
    for (let i = 0; i < lettre.length; i++) {
      const fractSimp = fraction(num[i], den[i]).simplifie()
      pointEtFraction.push({
        point: lettre[i],
        num: fractSimp.num,
        den: fractSimp.den,
      })
    }
    // tri par dénominateur croissant
    pointEtFraction.sort((a, b) => a.den - b.den)
    let denom = 0
    for (let i = 0; i < pointEtFraction.length; i++) {
      if (pointEtFraction[i].den !== PasPrincipal) {
        if (denom !== pointEtFraction[i].den) {
          reponse += `<br>En groupant ces intervalles par ${quotientier(PasPrincipal, pointEtFraction[i].den)}, `
          reponse += `on obtient ${pointEtFraction[i].den} groupements identiques pour faire une unité. Chaque groupement vaut donc $\\dfrac{1}{${pointEtFraction[i].den}}$.<br>`
          reponse += `Pour aller de l'origine au point $${pointEtFraction[i].point}$, il y a $${expliciteNbPas(pointEtFraction[i].num, pointEtFraction[i].den)}$ groupement`
          reponse += pointEtFraction[i].num > 1 ? 's' : ''
          reponse += ` de  ${quotientier(PasPrincipal, pointEtFraction[i].den)} intervalles : $${pointEtFraction[i].num} \\times \\dfrac{1}{${pointEtFraction[i].den}}$ = $${fraction(pointEtFraction[i].num, pointEtFraction[i].den).texFraction}$.`
        }
        if (denom !== pointEtFraction[i].den) {
          reponse += ' <br>'
        } else {
          reponse += `$~$`
        } // i > 0 ? `$~$` : ''}
        reponse += ecritAbscisseDétaillée(
          pointEtFraction[i].point,
          pointEtFraction[i].num,
          pointEtFraction[i].den,
          parentheses,
          true,
        )

        denom = pointEtFraction[i].den
      }
    } */
  }
  reponse += `<br>`
  return reponse
}
