import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  choice,
  combinaisonListes,
  combinaisonListesSansChangerOrdre,
} from '../../lib/outils/arrayOutils'
import { miseEnEvidence, texteGras } from '../../lib/outils/embellissements'
import {
  nombreDeChiffresDansLaPartieEntiere,
  rangeMinMax,
} from '../../lib/outils/nombres'
import { sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const dateDeModifImportante = '22/09/2024'
export const titre =
  'Décomposer un nombre entier (nombre de ..., chiffres des ...)'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * * Donner le chiffre des ... le nombre de ...
 * @author Sébastien Lozano
 * Rendu interactif par Jean-claude Lhote et ajout de paramètre type de questions
 * Rajout paramètre par EE sur la classe maximale
 * Relecture : Décembre 2021 par EE
 */

export const uuid = '34579'

export const refs = {
  'fr-fr': ['6N1A-2'],
  'fr-2016': ['6N10-3'],
  'fr-ch': ['9R1NO2A-3', '9R2NO2A-3', '9R3NO2A-3', 'PRQNO02A-4'], // Primaire anciennement :['9NO1-4'],
}

/**
 *
 * @param {string} type
 * @param {string} str
 * @param {number[]} rang
 * @returns {number}
 */
// une fonction pour la correction selon le type de question
function chiffreNombreCorr(type: string, str: string, rang: number[]) {
  let sortie
  if (type === 'chiffre') {
    sortie = str.split('')[rang[0]]
  }
  if (type === 'nombre') {
    sortie = str.split('')[rang[0]]
    for (let k = 1; k < rang.length; k++) {
      sortie += str.split('')[rang[k]]
    }
  }
  return Number(sortie)
}

/**
 *
 * @param {string} type
 * @param {string} str
 * @param {number[]} rang
 * @param {number} cduNum
 * @returns {string}
 */
// une fonction pour la justification supplémentaire dans le cas nombre de ...
function nombreDeJustif(
  type: string,
  str: string,
  rang: number[],
  cduNum: number,
) {
  let sortie = ''
  if (type === 'chiffre') {
    sortie = ''
  }
  if (type === 'nombre') {
    let nbDeString = str.split('')[rang[0]]
    for (let k = 1; k < rang.length; k++) {
      nbDeString += str.split('')[rang[k]]
    }
    const nbDe = Number(nbDeString)
    let j = rang[rang.length - 1]
    j++
    let nbDeResteString = ''
    while (str.split('')[j] !== undefined) {
      nbDeResteString += str.split('')[j]
      j++
    }
    const nbDeReste = Number(nbDeResteString)
    // faut arrêter de passer des strings à texNombre !
    sortie = `comme $${texNombre(Number(str), 0)} = ${texNombre(nbDe, 0)}\\times ${texNombre(cduNum, 0)}`
    sortie += !isNaN(nbDeReste)
      ? `+${texNombre(Number(nbDeReste), 0)}$, alors `
      : '$, alors '
  }
  return sortie
}

export default class ChiffreNombreDe extends Exercice {
  declare sup: number
  declare sup2: number

  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Type de questions',
      3,
      '1 : Chiffre des ...\n2 : Nombre de ...\n3 : Mélange',
    ]
    this.besoinFormulaire2Numerique = [
      'Nombre maximum',
      3,
      '1 : 1 000\n2 : 1 000 000\n3 : 1 000 000 000',
    ]

    this.sup = 1
    this.sup2 = 3
    this.spacing = context.isHtml ? 3 : 2
    this.spacingCorr = context.isHtml ? 2.5 : 1.5

    this.nbQuestions = 6
  }

  nouvelleVersion() {
    this.spacing = context.isHtml ? 3 : 2
    this.spacingCorr = context.isHtml ? 2.5 : 1.5
    let typesDeQuestionsDisponibles: number[] = []
    this.consigne =
      this.interactif && this.sup > 1
        ? texteGras('Penser à mettre les espaces nécessaires.')
        : ''
    let listeChiffres: number[] = []
    let listeLettres: number[] = []
    switch (this.sup) {
      case 1:
        typesDeQuestionsDisponibles = combinaisonListes(
          rangeMinMax(0, this.sup2 - 1),
          this.nbQuestions,
        )
        break
      case 2:
        typesDeQuestionsDisponibles = combinaisonListes(
          rangeMinMax(3, this.sup2 + 2),
          this.nbQuestions,
        )
        break
      default:
        typesDeQuestionsDisponibles = []
        listeChiffres = combinaisonListes(
          rangeMinMax(0, this.sup2 - 1),
          this.nbQuestions,
        )
        listeLettres = combinaisonListes(
          rangeMinMax(3, this.sup2 + 2),
          this.nbQuestions,
        )
        for (let ee = 0; ee < listeChiffres.length; ee++) {
          if (choice([true, false]))
            typesDeQuestionsDisponibles.push(
              listeChiffres[ee],
              listeLettres[ee],
            )
          else
            typesDeQuestionsDisponibles.push(
              listeLettres[ee],
              listeChiffres[ee],
            )
        }
        break
    }

    const listeTypeDeQuestions = combinaisonListesSansChangerOrdre(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posées --> à remettre comme ci-dessus
    const reponses: number[] = []
    for (
      let i = 0, texte = '', texteCorr = '', cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const mmc = randint(1, 9)
      const mmd = randint(0, 9, [mmc])
      const mmu = randint(0, 9, [mmc, mmd])
      const mc = randint(this.sup2 === 3 ? 0 : 1, 9, [mmu, mmd, mmc])
      const md = randint(0, 9, [mmu, mmd, mmc, mc])
      const mu = randint(0, 9, [mmu, mmd, mmc, mc, md])
      const c = randint(this.sup2 > 1 ? 0 : 1, 9, [mmu, mmd, mmc, mu, md, mc])
      const d = randint(0, 9, [mmu, mmd, mmc, mu, md, mc, c])
      const u = randint(0, 9, [mmu, mmd, mmc, mu, md, mc, c, d])
      let nbStr = ''
      switch (this.sup2) {
        case 1:
          nbStr = c.toString() + d.toString() + u.toString()
          break
        case 2:
          nbStr =
            mc.toString() +
            md.toString() +
            mu.toString() +
            c.toString() +
            d.toString() +
            u.toString()
          break
        case 3:
          nbStr =
            mmc.toString() +
            mmd.toString() +
            mmu.toString() +
            mc.toString() +
            md.toString() +
            mu.toString() +
            c.toString() +
            d.toString() +
            u.toString()

          break
      }
      const nb = Number(nbStr)
      const cdu: Cdu[] = ['unites', 'dizaines', 'centaines']
      type TypeQuestion = 'chiffre' | 'nombre'
      type Tranche = 'unites' | 'milliers' | 'millions'
      type Cdu = 'unites' | 'dizaines' | 'centaines'
      type InformationRang = {
        determinant: string
        cdu: [string, string | number]
        rangs: number[]
      }
      const chiffreNombre: Record<
        TypeQuestion,
        Record<Tranche, Record<Cdu, InformationRang>>
      > = {
        chiffre: {
          unites: {
            unites: {
              determinant: 'des',
              cdu: ['unités', ''],
              rangs: [2 + (this.sup2 - 1) * 3],
            },
            dizaines: {
              determinant: 'des',
              cdu: ['dizaines', ''],
              rangs: [1 + (this.sup2 - 1) * 3],
            },
            centaines: {
              determinant: 'des',
              cdu: ['centaines', ''],
              rangs: [(this.sup2 - 1) * 3],
            },
          },
          milliers: {
            unites: {
              determinant: 'des',
              cdu: ['unités de milliers', ''],
              rangs: [2 + (this.sup2 - 2) * 3],
            },
            dizaines: {
              determinant: 'des',
              cdu: ['dizaines de milliers', ''],
              rangs: [1 + (this.sup2 - 2) * 3],
            },
            centaines: {
              determinant: 'des',
              cdu: ['centaines de milliers', ''],
              rangs: [(this.sup2 - 2) * 3],
            },
          },
          millions: {
            unites: {
              determinant: 'des',
              cdu: ['unités de millions', ''],
              rangs: [2 + (this.sup2 - 3) * 3],
            },
            dizaines: {
              determinant: 'des',
              cdu: ['dizaines de millions', ''],
              rangs: [1 + (this.sup2 - 3) * 3],
            },
            centaines: {
              determinant: 'des',
              cdu: ['centaines de millions', ''],
              rangs: [(this.sup2 - 3) * 3],
            },
          },
        },
        nombre: {
          unites: {
            unites: {
              determinant: "d'",
              cdu: ['unités', 1],
              rangs: rangeMinMax(0, 2 + (this.sup2 - 1) * 3),
            },
            dizaines: {
              determinant: 'de',
              cdu: ['dizaines', 10],
              rangs: rangeMinMax(0, 1 + (this.sup2 - 1) * 3),
            },
            centaines: {
              determinant: 'de',
              cdu: ['centaines', 100],
              rangs: rangeMinMax(0, (this.sup2 - 1) * 3),
            },
          },
          milliers: {
            unites: {
              determinant: "d'",
              cdu: ['unités de milliers', 1000],
              rangs: rangeMinMax(0, 2 + (this.sup2 - 2) * 3),
            },
            dizaines: {
              determinant: 'de',
              cdu: ['dizaines de milliers', 10000],
              rangs: rangeMinMax(0, 1 + (this.sup2 - 2) * 3),
            },
            centaines: {
              determinant: 'de',
              cdu: ['centaines de milliers', 100000],
              rangs: rangeMinMax(0, (this.sup2 - 2) * 3),
            },
          },
          millions: {
            unites: {
              determinant: "d'",
              cdu: ['unités de millions', 1000000],
              rangs: rangeMinMax(0, 2 + (this.sup2 - 3) * 3),
            },
            dizaines: {
              determinant: 'de',
              cdu: ['dizaines de millions', 10000000],
              rangs: rangeMinMax(0, 1 + (this.sup2 - 3) * 3),
            },
            centaines: {
              determinant: 'de',
              cdu: ['centaines de millions', 100000000],
              rangs: [0],
            },
          },
        },
      }

      // pour les situations, autant de situations que de cas dans le switch !
      const situations: Array<{
        type: TypeQuestion
        tranche: Tranche
        cdu: Cdu
      }> = [
        {
          // case 0 --> chiffre des
          type: 'chiffre',
          tranche: 'unites',
          cdu: choice(cdu),
        },
        {
          // case 1 --> chiffre des
          type: 'chiffre',
          tranche: 'milliers',
          cdu: choice(cdu),
        },
        {
          // case 2 --> chiffre des
          type: 'chiffre',
          tranche: 'millions',
          cdu: choice(cdu),
        },
        {
          // case 3 --> nombre de
          type: 'nombre',
          tranche: 'unites',
          cdu: choice(cdu),
        },
        {
          // case 4 --> nombre de
          type: 'nombre',
          tranche: 'milliers',
          cdu: choice(cdu),
        },
        {
          // case 5 --> nombre de
          type: 'nombre',
          tranche: 'millions',
          cdu: choice(cdu),
        },
      ]

      const typeIndex = Number(listeTypeDeQuestions[i])
      const situation = situations[typeIndex]
      const information =
        chiffreNombre[situation.type][situation.tranche][situation.cdu]
      reponses[typeIndex] = chiffreNombreCorr(
        situation.type,
        nbStr,
        information.rangs,
      )
      texte = `Dans $${texNombre(nb, 0)}$, quel est le ${situation.type} ${information.determinant}${information.determinant === "d'" ? '' : ' '}${information.cdu[0]} ?`
      texteCorr = `Dans $${texNombre(nb, 0)}$, ${nombreDeJustif(situation.type, nbStr, information.rangs, Number(information.cdu[1]))} le ${situation.type} ${information.determinant}${information.determinant === "d'" ? '' : ' '}${information.cdu[0]} est $${miseEnEvidence(texNombre(reponses[typeIndex], 0))}$.`
      handleAnswers(this, i, {
        reponse: {
          value: texNombre(reponses[typeIndex]),
          options: { nombreAvecEspace: true },
        },
      })

      if (context.isAmc) {
        const nbDigitsSupplementaires = randint(1, 2)
        this.autoCorrectionAMC[i] = {
          enonce: texte, // Si vide, l'énoncé est celui de l'exercice.
          propositions: [
            {
              texte: texteCorr, // Si vide, le texte est la correction de l'exercice.
            },
          ],
          reponse: {
            texte:
              'le texte affiché au-dessus du formulaire numerique dans AMC', // facultatif
            valeur: [reponses[typeIndex]], // obligatoire (la réponse numérique à comparer à celle de l'élève), NE PAS METTRE DE STRING à virgule ! 4.9 et non pas 4,9. Cette valeur doit être passée dans un tableau d'où la nécessité des crochets.
            alignement: 'flushleft', // EE : ce champ est facultatif et n'est fonctionnel que pour l'hybride. Il permet de choisir où les cases sont disposées sur la feuille. Par défaut, c'est comme le texte qui le précède. Pour mettre à gauche, au centre ou à droite, choisir parmi ('flushleft', 'center', 'flushright').
            param: {
              aussiCorrect:
                reponses[typeIndex] * Math.pow(10, nbDigitsSupplementaires),
              digits:
                nbDigitsSupplementaires +
                nombreDeChiffresDansLaPartieEntiere(reponses[typeIndex]), // obligatoire pour AMC (le nombre de chiffres pour AMC, si digits est mis à 0, alors il sera déterminé pour coller au nombre décimal demandé)
              decimals: 0, // facultatif. S'il n'est pas mis, il sera mis à 0 et sera déterminé automatiquement comme décrit ci-dessus
              signe: false, // (présence d'une case + ou - pour AMC)
              approx: 0, // (0 = valeur exacte attendue, sinon valeur de tolérance... voir plus bas pour un point technique non intuitif)
            },
          },
        }
      }

      if (this.questionJamaisPosee(i, listeTypeDeQuestions[i], nb)) {
        // Si la question n'a jamais été posée, on en crée une autre
        texte += ajouteChampTexteMathLive(
          this,
          i,
          ` ${KeyboardType.numbersSpace}`,
          { texteAvant: `${sp(5)}` },
        )
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
