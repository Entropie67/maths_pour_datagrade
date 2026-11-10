/**
 * ⚠️ Cet exercice est utilisé dans le test : tests/e2e/tests/view/view.eleve.can.2025.4e.test.ts ⚠️
 */

import { afficheLongueurSegment } from '../../lib/2d/afficheLongueurSegment'
import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { nommePolygone, polygone } from '../../lib/2d/polygones'
import { rotation, similitude } from '../../lib/2d/transformations'
import { longueur } from '../../lib/2d/utilitairesGeometriques'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { arrondi, nombreDeChiffresDe } from '../../lib/outils/nombres'
import { creerNomDePolygone, sp } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import Grandeur from '../../modules/Grandeur'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { RedactionPythagore } from './_pythagore'

import { isFunction } from '@cortex-js/compute-engine'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { bleuMathalea, orangeMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ce from '../../lib/interactif/comparisonFunctions'
import { ordreAlphabetique } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import { texNombre } from '../../lib/outils/texNombre'

export const titre = 'Calculer une longueur avec le théorème de Pythagore'
export const amcType = 'AMCHybride'
export const amcReady = true
export const interactifReady = true

/**
 * Fonction utilisée pour la vérification des questions de cet exercice.
 * @param {string} input
 * @param {string} goodAnswer // L'expression commencera par la somme des carrés et comportera (ou pas) l'égalité avec le carré de l'hypoténuse
 * @return {{isOk: boolean, feedback: string}}
 */
export function pythagoreCompare(input: string, goodAnswer: string) {
  input = input.replaceAll(/([A-Z]{2})/g, '\\mathrm{$1}')
  const parsedInput = ce.parse(input)
  const parsedAnswer = ce.parse(goodAnswer)
  if (isFunction(parsedInput) && isFunction(parsedAnswer)) {
    if (parsedAnswer.operator === 'Equal') {
      if (parsedInput.operator !== 'Equal')
        return {
          isOk: false,
          feedback: 'Il faut saisir une égalité de Pythagore.',
        }
      // on a deux égalités. c'est le cas écrire l'égalité
      const inputOps = parsedInput.ops
      const answerOps = parsedAnswer.ops
      if (inputOps != null && answerOps != null) {
        const inputM1 = inputOps[0]
        const inputM2 = inputOps[1]
        const answerSum = answerOps[0]
        const answerHypo = answerOps[1]
        if (inputM1 && inputM2) {
          const inputHypo = ['Power', 'Square'].includes(inputM1.operator)
            ? inputM1
            : inputM2
          const inputSum = ['Power', 'Square'].includes(inputM1.operator)
            ? inputM2
            : inputM1
          if (
            isFunction(inputHypo) &&
            isFunction(inputSum) &&
            isFunction(answerSum) &&
            isFunction(answerHypo)
          ) {
            const inputT1 = inputSum.ops![0] // un ['Square','BC'] par exemple
            const inputT2 = inputSum.ops![1]
            const answerT1 = answerSum.ops![0]
            const answerT2 = answerSum.ops![1]

            // L'élève a-t-il saisi une différence (ex. BC^2=AB^2-AC^2) plutôt que la somme attendue ?
            const negatedTerm = [inputT1, inputT2].find(
              (term) => term.operator === 'Negate',
            )
            if (negatedTerm && isFunction(answerT1) && isFunction(answerT2)) {
              const positiveTerm = inputT1 === negatedTerm ? inputT2 : inputT1
              const negatedInner = isFunction(negatedTerm)
                ? negatedTerm.ops?.[0]
                : undefined
              const estCarre = (t: typeof inputT1 | undefined) =>
                isFunction(t) &&
                ['Square', 'Power'].includes(t.operator) &&
                t.ops![1]?.toString() === '2'
              if (
                estCarre(positiveTerm) &&
                estCarre(negatedInner) &&
                estCarre(inputHypo) &&
                isFunction(positiveTerm) &&
                isFunction(negatedInner)
              ) {
                // La soustraction saisie n'est vraie que si le terme positif est le carré
                // de la vraie hypoténuse et le terme soustrait est l'un des deux autres côtés
                // (l'hypoténuse isolée devenant alors l'autre côté).
                const positiveLettres = ordreAlphabetique(
                  positiveTerm.ops![0].toString(),
                )
                const negativeLettres = ordreAlphabetique(
                  negatedInner.ops![0].toString(),
                )
                const inputHypoLettres = ordreAlphabetique(
                  inputHypo.ops![0].toString(),
                )
                const trueHypoLettres = ordreAlphabetique(
                  answerHypo.ops![0].toString(),
                )
                const trueLeg1Lettres = ordreAlphabetique(
                  answerT1.ops![0].toString(),
                )
                const trueLeg2Lettres = ordreAlphabetique(
                  answerT2.ops![0].toString(),
                )
                const estVraie =
                  positiveLettres === trueHypoLettres &&
                  ((inputHypoLettres === trueLeg1Lettres &&
                    negativeLettres === trueLeg2Lettres) ||
                    (inputHypoLettres === trueLeg2Lettres &&
                      negativeLettres === trueLeg1Lettres))
                if (estVraie) {
                  return {
                    isOk: false,
                    feedback:
                      "Cette égalité est vraie, mais ce n'est pas l'égalité attendue : le carré de la longueur de l'hypoténuse est égal à la somme des carrés des longueurs des deux autres côtés.",
                  }
                }
              }
              return { isOk: false, feedback: "Cette égalité n'est pas vraie." }
            }

            for (const term of [inputT1, inputT2]) {
              // On ne vérifie pas la réponse, c'est nous qui l'avons écrite
              if (!['Square', 'Power'].includes(term.operator)) {
                return { isOk: false, feedback: 'Il manque au moins un carré.' }
              }
            }

            // c'est la même longueur pour l'hypoténuse ?
            if (
              ordreAlphabetique(inputHypo.ops![0].toString()) !==
              ordreAlphabetique(answerHypo.ops![0].toString())
            )
              return {
                isOk: false,
                feedback: "L'hypoténuse est mal identifiée.",
              }
            // l'élève a-t-il bien mis l'hypoténuse au carré ?
            if (inputHypo.ops![1].toString() !== '2')
              return {
                isOk: false,
                feedback: "L'hypoténuse doit être mise au carré.",
              }
            if (inputSum.operator !== 'Add')
              return {
                isOk: false,
                feedback:
                  "Le carré de l'hypoténuse est égal à la $somme$ des carrés des deux autres côtés.",
              }
            // le premier terme de la saisie est-il un carré ?
            if (
              isFunction(inputT1) &&
              isFunction(inputT2) &&
              isFunction(answerT1) &&
              isFunction(answerT2)
            ) {
              if (!['Square', 'Power'].includes(inputT1.operator))
                return { isOk: false, feedback: 'Il manque au moins un carré.' }
              const L1 = ordreAlphabetique(inputT1.ops![0].toString()) // on met la longueur saisie dans l'ordre alphabétique
              // le deuxième terme de la saisie est-il un carré ?
              if (!['Square', 'Power'].includes(inputT2.operator))
                return { isOk: false, feedback: 'Il manque au moins un carré.' }
              const L2 = ordreAlphabetique(inputT2.ops![0].toString()) // on met la longueur saisie dans l'ordre alphabétique
              const LL1 = ordreAlphabetique(answerT1.ops![0].toString()) // Ces longueurs sont déjà dans l'ordre alphabétique
              const LL2 = ordreAlphabetique(answerT2.ops![0].toString())
              // on teste les deux possibilités identiques ou croisées
              if ((LL1 === L1 && LL2 === L2) || (LL1 === L2 && LL2 === L1))
                return { isOk: true }
              // else return { isOk: false, feedback: 'Regarde bien la correction.' }
            }
            return { isOk: false }
          }
          return { isOk: false }
        }
      }
    } else {
      // on a une réponse sans égalité, il faut un input sans égalité
      // EE : computeEngine 0.47.0
      // L'usage de mathrm rend le parse problématique alphabétiquement avec un negate d'où les 4 nouvelles lignes
      // et la suppression de l'ordre alphabétique qui n'a plus d'intérêt.
      /* input = input.replace(/\\mathrm\{([^}]+)\}/g, '{$1}')
    goodAnswer = goodAnswer.replace(/\\mathrm\{([^}]+)\}/g, '{$1}')
    parsedInput = ce.parse(input)
    parsedAnswer = ce.parse(goodAnswer) */

      if (
        !(isFunction(parsedInput) && isFunction(parsedAnswer)) ||
        parsedInput.operator !== 'Add'
      ) {
        return {
          isOk: false,
          feedback:
            'Il faut saisir une somme ou une différence de deux carrés.',
        }
      }

      const isSub = parsedAnswer.ops!.some((term) => term.operator === 'Negate')
      const inputIsSub = parsedInput.ops!.some(
        (term) => term.operator === 'Negate',
      )

      if (isSub && !inputIsSub)
        return {
          isOk: false,
          feedback: 'Il fallait saisir une différence de deux carrés.',
        }

      if (!isSub && inputIsSub)
        return {
          isOk: false,
          feedback: 'Il fallait saisir une somme de deux carrés.',
        }

      if (parsedAnswer.operator !== parsedInput.operator)
        return {
          isOk: false,
          feedback: "L'opération n'est pas une somme ou une différence.",
        }

      if (parsedInput.ops!.length !== 2)
        return { isOk: false, feedback: "L'expression saisie est incorrecte." }

      const inputNegative = parsedInput.ops!.find(
        (term) => term.operator === 'Negate',
      )
      const answerNegative = parsedAnswer.ops!.find(
        (term) => term.operator === 'Negate',
      )
      const inputT1 = isSub
        ? parsedInput.ops!.find((term) => term !== inputNegative)
        : parsedInput.ops![1]
      const answerT1 = isSub
        ? parsedAnswer.ops!.find((term) => term !== answerNegative)
        : parsedAnswer.ops![1]
      const inputT2 = isSub && isFunction(inputNegative)
        ? inputNegative.ops?.[0]
        : parsedInput.ops![0]
      const answerT2 = isSub && isFunction(answerNegative)
        ? answerNegative.ops?.[0]
        : parsedAnswer.ops![0]

      if (!inputT1 || !inputT2 || !answerT1 || !answerT2)
        return { isOk: false, feedback: "L'expression saisie est incorrecte." }

      for (const term of [inputT1, inputT2]) {
        if (!['Square', 'Power'].includes(term.operator)) {
          return { isOk: false, feedback: 'Il manque au moins un carré.' }
        }
      }

      if (
        isFunction(inputT1) &&
        isFunction(inputT2) &&
        isFunction(answerT1) &&
        isFunction(answerT2)
      ) {
        const L1 = ordreAlphabetique(inputT1.ops![0].toString()).replaceAll(
          '"',
          '',
        )
        const L2 = ordreAlphabetique(inputT2.ops![0].toString()).replaceAll(
          '"',
          '',
        )
        const LL1 = answerT1.ops![0].toString().replaceAll('"', '')
        const LL2 = answerT2.ops![0].toString().replaceAll('"', '')

        if (LL1 === L1 && LL2 === L2)
          return { isOk: true }
        if (isSub) {
          if (LL1 === L2 && LL2 === L1)
            return {
              isOk: false,
              feedback: 'Les deux carrés sont dans le mauvais ordre dans la soustraction.',
            }
          return {
            isOk: false,
            feedback: "Ce n'est pas la soustraction attendue.",
          }
        }
        if (LL1 === L2 && LL2 === L1) return { isOk: true }
      }

      return {
        isOk: false,
        feedback: isSub ? "Ce n'est pas la soustraction attendue." : '',
      }
    }
  }
  // return { isOk: parsedInput.isEqual(parsedAnswer), feedback: '' }
  return { isOk: false, feedback: 'Regarde bien la correction.' }
}

/**
 * Exercices sur le théorème de Pythagore avec MathALEA2D
 * @author Rémi Angot (Factorisation de la rédaction de Pythagore par Éric Elter )
 */
export const uuid = 'bd660'

export const refs = {
  'fr-fr': ['4G20', 'BP2AutoR1', 'BP2G6'],
  'fr-ch': ['10LCGM3A-3', '10LSGM3A-3', '11CTGM2A-3', 'PRQMG03A-2', 'PRQMG03B-1'],
}

export default class Pythagore2D extends Exercice {
  typeDeQuestion: string
  constructor() {
    super()
    this.nbQuestions = 3
    this.nbCols = 3

    this.sup = 3
    this.sup2 = 3
    this.sup3 = false
    this.typeDeQuestion = 'Calculer :'
    this.video = 'M9sceJ8gzNc'
    this.besoinFormulaire2Numerique = [
      'Recherche de côtés ',
      3,
      "1 : Hypoténuse\n2 : Côtés de l'angle droit\n3: Mélange",
    ]
    this.besoinFormulaire3CaseACocher = [
      'Écrire les unités dans les calculs de la correction',
      false,
    ]

    this.besoinFormulaire4CaseACocher = ["Figure dans l'énoncé", false]
    this.sup4 = true
  }

  nouvelleVersion() {
    let listeTypeDeQuestions
    if (this.sup2 === 1) {
      listeTypeDeQuestions = ['BC']
    } else if (this.sup2 === 2) {
      listeTypeDeQuestions = ['AB', 'AC']
    } else if (this.nbQuestions === 2) {
      // Avec deux questions : une pour l'hypoténuse, l'autre pour un côté de l'angle droit
      listeTypeDeQuestions = ['BC', choice(['AB', 'AC'])]
    } else {
      listeTypeDeQuestions = ['AB', 'BC', 'AC']
    }
    let listeDeNomsDePolygones: string[] = []
    if (this.sup === 1) {
      this.consigne =
        (context.vue !== 'diap' && this.nbQuestions > 1
          ? 'Dans chaque cas, donner'
          : 'Donner') + " l'égalité de Pythagore."
    } else if (this.sup === 2) {
      this.consigne =
        (context.vue !== 'diap' && this.nbQuestions > 1
          ? 'Dans chaque cas, compléter'
          : 'Compléter') + " l'égalité en utilisant le théorème de Pythagore."
    } else {
      this.consigne =
        (context.vue !== 'diap' && this.nbQuestions > 1
          ? 'Dans chaque cas, calculer'
          : 'Calculer') +
        " la longueur manquante (si nécessaire, l'arrondir au millimètre près)."
    }
    listeTypeDeQuestions = combinaisonListes(
      listeTypeDeQuestions,
      this.nbQuestions,
    )
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      if (i % 5 === 0) listeDeNomsDePolygones = ['QD']
      texte = ''
      texteCorr = ''
      const c1 = randint(22, 50) / 10
      const c2 = randint(22, 50) / 10
      const A1 = pointAbstrait(0, 0)
      const B1 = pointAbstrait(c1, 0)
      const C1 = similitude(B1, A1, 90, c2 / longueur(A1, B1))
      const p1 = polygone(A1, B1, C1)
      p1.isVisible = false
      const p2 = rotation(p1, A1, randint(0, 360))
      const A = p2.listePoints[0]
      const B = p2.listePoints[1]
      const C = p2.listePoints[2]
      const codage = codageAngleDroit(B, A, C)
      const xmin = Math.min(A.x, B.x, C.x) - 1
      const ymin = Math.min(A.y, B.y, C.y) - 1
      const xmax = Math.max(A.x, B.x, C.x) + 1
      const ymax = Math.max(A.y, B.y, C.y) + 1
      const nomDuPolygone = creerNomDePolygone(3, listeDeNomsDePolygones)

      listeDeNomsDePolygones.push(nomDuPolygone)
      const nomme = nommePolygone(p2, nomDuPolygone)
      const affAB = afficheLongueurSegment(B, A)
      const affAC = afficheLongueurSegment(A, C)
      const affBC = afficheLongueurSegment(C, B)
      const longueurAB = longueur(A, B, 1)
      const longueurAC = longueur(A, C, 1)
      const longueurBC = longueur(B, C, 1)
      const mesObjetsATracer: NestedObjetMathalea2dArray = [codage, p2, nomme]

      if (
        this.typeDeQuestion === 'Calculer :' &&
        listeTypeDeQuestions[i] === 'AB'
      ) {
        mesObjetsATracer.push(affAC, affBC)
      } else if (
        this.typeDeQuestion === 'Calculer :' &&
        listeTypeDeQuestions[i] === 'BC'
      ) {
        mesObjetsATracer.push(affAC, affAB)
      } else if (
        this.typeDeQuestion === 'Calculer :' &&
        listeTypeDeQuestions[i] === 'AC'
      ) {
        mesObjetsATracer.push(affAB, affBC)
      }

      if (!context.isHtml) {
        texte = '~\\\\'
      }
      // Génération du texte de l'énoncé SANS la figure
      let texteEnonce = ''
      if (this.typeDeQuestion === 'Calculer :') {
        if (listeTypeDeQuestions[i] === 'AB') {
          texteEnonce = `On considère le triangle $${A.nom}${B.nom}${C.nom}$ rectangle en $${A.nom}$ tel que $${A.nom}${C.nom} = ${texNombre(longueurAC)}\\text{ cm}$ et $${B.nom}${C.nom} = ${texNombre(longueurBC)}\\text{ cm}$. <br>Calculer $${A.nom}${B.nom}$.<br>`
        } else if (listeTypeDeQuestions[i] === 'BC') {
          texteEnonce = `On considère le triangle $${A.nom}${B.nom}${C.nom}$ rectangle en $${A.nom}$ tel que $${A.nom}${B.nom} = ${texNombre(longueurAB)}\\text{ cm}$ et $${A.nom}${C.nom} = ${texNombre(longueurAC)}\\text{ cm}$. <br>Calculer $${B.nom}${C.nom}$.<br>`
        } else {
          texteEnonce = `On considère le triangle $${A.nom}${B.nom}${C.nom}$ rectangle en $${A.nom}$ tel que $${A.nom}${B.nom} = ${texNombre(longueurAB)}\\text{ cm}$ et $${B.nom}${C.nom} = ${texNombre(longueurBC)}\\text{ cm}$. <br>Calculer $${A.nom}${C.nom}$.<br>`
        }
      } else {
        // Pour les autres types de questions (égalité de Pythagore, etc.)
        texteEnonce = `On considère le triangle $${A.nom}${B.nom}${C.nom}$ rectangle en $${A.nom}$.<br>`
      }

      // Génération de la figure
      const figure = () => {
        return mathalea2d(
          { xmin, xmax, ymin, ymax, scale: 0.6, display: 'block' },
          mesObjetsATracer,
        )
      }

      // Affichage conditionnel : figure + texte OU texte seul
      texte += this.sup4 ? `${figure()}` : texteEnonce

      let redaction
      let nomCote = ''
      if (this.typeDeQuestion === 'Calculer :') {
        let reponse
        if (listeTypeDeQuestions[i] === 'AB') {
          nomCote = A.nom + B.nom
          reponse = arrondi(Math.sqrt(longueurBC ** 2 - longueurAC ** 2), 1)
          redaction = RedactionPythagore(
            A.nom,
            B.nom,
            C.nom,
            2,
            reponse,
            longueurAC,
            longueurBC,
            'cm',
            undefined,
            this.sup3,
            1,
          )
        } else if (listeTypeDeQuestions[i] === 'BC') {
          nomCote = B.nom + C.nom
          reponse = arrondi(Math.sqrt(longueurAB ** 2 + longueurAC ** 2), 1)
          redaction = RedactionPythagore(
            A.nom,
            B.nom,
            C.nom,
            1,
            longueurAB,
            longueurAC,
            reponse,
            'cm',
            undefined,
            this.sup3,
            1,
          )
        } else {
          // listeTypeDeQuestions[i] === 'AC'
          nomCote = A.nom + C.nom
          reponse = arrondi(Math.sqrt(longueurBC ** 2 - longueurAB ** 2), 1)
          redaction = RedactionPythagore(
            A.nom,
            C.nom,
            B.nom,
            2,
            reponse,
            longueurAB,
            longueurBC,
            'cm',
            undefined,
            this.sup3,
            1,
          )
        }
        texteCorr = redaction[0] ?? ''
        texte += this.interactif
          ? `$${nomCote} ${redaction[1]}$` +
            ajouteChampTexteMathLive(this, i, KeyboardType.longueur, {
              texteApres: '<em class="ml-2">(Une unité est attendue.)</em>',
            })
          : ''

        handleAnswers(this, i, {
          reponse: {
            value: new Grandeur(reponse, 'cm'),
            options: { precisionUnite: 0, unite: true },
          },
        })

        if (context.isAmc) {
          this.autoCorrectionAMC[i] = {
            enonce: '',
            enonceAvant: false,
            propositions: [
              {
                type: 'AMCOpen',
                propositions: [
                  {
                    texte: '',
                    enonce: `${texte}Calculer la longueur manquante.\\\\`,
                    statut: 3,
                    pointilles: true,
                    multicolsBegin: true,
                  },
                ],
              },
              {
                type: 'AMCNum',
                propositions: [
                  {
                    texte: '',
                    statut: '',
                    multicolsEnd: true,
                    reponse: {
                      texte: 'Longueur arrondie à 0,1 cm : ',
                      valeur: [arrondi(reponse, 1)],
                      param: {
                        digits: Math.max(nombreDeChiffresDe(reponse), 2),
                        decimals: 1,
                        signe: false,
                      },
                    },
                  },
                ],
              },
            ],
          }
          this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        }
      } else {
        const hypotenuse = [
          `\\mathrm{${ordreAlphabetique(B.nom + C.nom)}}^2`,
          `\\mathrm{${ordreAlphabetique(C.nom + B.nom)}}^2`,
        ]
        const cote1 = [
          `\\mathrm{${ordreAlphabetique(B.nom + A.nom)}}^2`,
          `\\mathrm{${ordreAlphabetique(A.nom + B.nom)}}^2`,
        ]
        const cote2 = [
          `\\mathrm{${ordreAlphabetique(C.nom + A.nom)}}^2`,
          `\\mathrm{${ordreAlphabetique(A.nom + C.nom)}}^2`,
        ]

        redaction = RedactionPythagore(
          A.nom,
          B.nom,
          C.nom,
          0,
          longueurAB,
          longueurAC,
          undefined,
          undefined,
          this.sup === 1 || listeTypeDeQuestions[i] === 'BC'
            ? orangeMathalea
            : bleuMathalea,
        )
        texteCorr = redaction[0] ?? ''
        let expr
        if (this.sup === 1) {
          expr = cote1[0] + '+' + cote2[0] + '=' + hypotenuse[0]
        } else {
          if (listeTypeDeQuestions[i] === 'AB') {
            texte += `<br>$${A.nom + B.nom}^2=$`
            texteCorr += '<br>'
            texteCorr += ` d'où $${A.nom + B.nom}^2=${miseEnEvidence(`${B.nom + C.nom}^2-${A.nom + C.nom}^2`)}$.`
            expr = `\\mathrm{${ordreAlphabetique(B.nom + C.nom)}}^2-\\mathrm{${ordreAlphabetique(A.nom + C.nom)}}^2`
          } else if (listeTypeDeQuestions[i] === 'AC') {
            texte += `<br>$${A.nom + C.nom}^2=$`
            texteCorr += '<br>'
            texteCorr += ` d'où $${A.nom + C.nom}^2=${miseEnEvidence(`${B.nom + C.nom}^2-${A.nom + B.nom}^2`)}$.`
            expr = `\\mathrm{${ordreAlphabetique(B.nom + C.nom)}}^2-\\mathrm{${ordreAlphabetique(A.nom + B.nom)}}^2`
          } else {
            texte += `<br>$${B.nom + C.nom}^2=$`
            expr = `\\mathrm{${ordreAlphabetique(A.nom + B.nom)}}^2+\\mathrm{${ordreAlphabetique(A.nom + C.nom)}}^2`
          }
          texte += this.interactif ? '' : `$${sp(2)}\\ldots$`
        }

        if (this.interactif) {
          handleAnswers(this, i, {
            reponse: { value: expr, compare: pythagoreCompare },
          })
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierEntierementPersonnalisable,
            { dataKeys: [A.nom, B.nom, C.nom, '+', '-', '=', 'SQ'] },
          )
        }
      }
      if (this.questionJamaisPosee(i, B1.x, B.y, C1.x, C1.y)) {
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
