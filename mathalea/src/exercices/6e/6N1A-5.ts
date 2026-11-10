import { miseEnEvidence } from '../../lib/outils/embellissements'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { nombreDeChiffresDansLaPartieEntiere } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

import { amcConvert } from '../../lib/amc/amcBuilders'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'

export const titre =
  'Écrire un nombre à partir de son nombre de dizaines, de centaines, de milliers...'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

export const dateDeModifImportante = '09/09/2022'

/**
 * Le nombre de dizaines, centaines et milliers étant donné, il faut écrire le nombre.
 *
 * 2 fois sur 5 il y a chevauchement entre les classes
 * @author Rémi Angot (complété par Éric Elter pour mettre des niveaux de difficulté)
 * Relecture : Novembre 2021 par EE
 */
export const uuid = '7efdf'

export const refs = {
  'fr-fr': ['6N1A-5'],
  'fr-2016': ['6N10-1'],
  'fr-ch': ['9R1NO2A-5', '9R2NO2A-5', '9R3NO2A-5', 'PRQNO02A-5'],
}
export default class ExerciceNumerationEntier extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = [
      'Décomposition avec uniquement des entiers à un chiffre',
    ]
    this.besoinFormulaire2CaseACocher = ['Décomposition vers les unités']
    this.besoinFormulaire3Numerique = [
      'Chevauchement des unités',
      3,
      '1 : Sans chevauchement des unités\n2 : Avec chevauchement des unités\n3 : Mélange',
    ]
    this.besoinFormulaire4Numerique = [
      'Variante',
      3,
      "1 : Jusqu'aux millions\n2 : Jusqu'aux centaines de milliards\n3 : Mélange",
    ]

    this.nbQuestions = 5
    this.sup = false
    this.sup2 = true
    this.sup3 = 3
    this.sup4 = 1
  }

  nouvelleVersion() {
    this.sup3 = Number(this.sup3)
    this.sup4 = Number(this.sup4)
    let listeTypeDeQuestions = []
    if (this.sup2) {
      // Vers les unités
      this.consigne = 'Écrire en chiffres '
      this.consigne +=
        this.nbQuestions === 1 ? 'ce nombre.' : 'chacun des nombres.'
    } else {
      // Vers les dizaines, centaines, milliers....
      this.consigne = 'Compléter.'
    }
    this.consigne += this.interactif
      ? ' Penser à mettre les espaces nécessaires.'
      : ''
    if (this.sup) {
      this.sup3 = 1
    } // Si entiers à 1 chiffre choisis, chevauchement impossible.
    if (this.sup3 === 1) {
      // Sans chevauchement
      listeTypeDeQuestions = combinaisonListes([1], this.nbQuestions)
    } else if (this.sup3 === 2) {
      // Avec chevauchement
      listeTypeDeQuestions = combinaisonListes([2], this.nbQuestions)
    } else {
      listeTypeDeQuestions = combinaisonListes(
        // Avec et sans chevauchement (2 sur 5 sont chevauchees)
        [1, 1, 1, 2, 2], // Tous les types de questions sont posées mais l'ordre diffère à chaque "cycle"
        this.nbQuestions,
      )
    }
    for (
      let i = 0, texte, texteCorr, a, b, rangA, rangB, rangRef, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const rangs = [
        'unités',
        'dizaines',
        'centaines',
        'milliers',
        'dizaines de mille',
        'centaines de mille',
        'millions',
        'dizaines de millions',
        'centaines de millions',
        'milliards',
        'dizaines de milliards',
        'centaines de milliards',
      ]
      if (this.sup) {
        // Un chiffre ou deux chiffres ?
        a = randint(2, 9)
        b = randint(2, 9, [a])
      } else {
        a = randint(2, 8) * 10 + randint(1, 5)
        b = randint(2, 8) * 10 + randint(1, 5)
      }
      if (this.sup2) {
        // Vers les unités
        rangA = randint(0, 2)
        rangRef = 0 // ça n'est pas utile si this.sup2, c'est pour éviter undefined signalé par typescript
      } else {
        // Vers les dizaines, centaines, milliers....
        rangRef = randint(1, this.sup4 === 1 ? 4 : 9)
        rangA = randint(rangRef, this.sup4 === 1 ? 4 : 9)
      }

      if (listeTypeDeQuestions[i] === 1) {
        // Sans chevauchement
        rangB = randint(rangA + 2, this.sup4 === 1 ? 6 : 11)
      } else {
        // Avec chevauchement
        rangB = rangA + 1
      }
      if (this.sup2) {
        texte = `$${b}$  ${rangs[rangB]} et $${a}$ ${rangs[rangA]}`
        texteCorr = `$${b}$  ${rangs[rangB]} et $${a}$ ${rangs[rangA]} $ = ${texNombre(b * Math.pow(10, rangB))} + ${texNombre(a * Math.pow(10, rangA))} =${miseEnEvidence(texNombre(
          b * Math.pow(10, rangB) + a * Math.pow(10, rangA),
        ))}$`
      } else {
        texte = `$${b}$  ${rangs[rangB]} et $${a}$ ${rangs[rangA]} correspondent à `
        texte += !this.interactif
          ? `$\\text{\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots}$ ${rangs[rangRef]}.`
          : ''
        texteCorr = `$${b}$  ${rangs[rangB]} et $${a}$ ${rangs[rangA]} correspondent à `
        texteCorr += ` $${texNombre(b * Math.pow(10, rangB - rangRef))}$ ${rangs[rangRef]} + $${texNombre(a * Math.pow(10, rangA - rangRef))}$ ${rangs[rangRef]} $=${miseEnEvidence(texNombre(
          b * Math.pow(10, rangB - rangRef) + a * Math.pow(10, rangA - rangRef),
        ))}$ ${rangs[rangRef]}`
      }
      const reponse = texNombre(
        this.sup2
          ? b * Math.pow(10, rangB) + a * Math.pow(10, rangA)
          : b * Math.pow(10, rangB - rangRef) +
              a * Math.pow(10, rangA - rangRef),
      )
      const nbReponse = this.sup2
        ? b * Math.pow(10, rangB) + a * Math.pow(10, rangA)
        : b * Math.pow(10, rangB - rangRef) + a * Math.pow(10, rangA - rangRef)
      handleAnswers(this, i, {
        reponse: { value: reponse, options: { nombreAvecEspace: true } },
      })
      if (this.sup2) {
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.numbersSpace, {
          espace: true,
        })
      } else {
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.numbersSpace, {
          espace: true,
          texteApres: `$\\text{ ${rangs[rangRef]}.}$`,
        })
      }

      if (context.isAmc) {
        const nbDigitsSupplementaires = randint(0, 2)
        this.autoCorrectionAMC[i] = {
          enonce: texte, // Si vide, l'énoncé est celui de l'exercice.
          propositions: [
            {
              texte: 'texteCorr', // Si vide, le texte est la correction de l'exercice.
            },
          ],
          reponse: {
            texte: 'AMC', // facultatif
            valeur: Number(reponse), // obligatoire (la réponse numérique à comparer à celle de l'élève), NE PAS METTRE DE STRING à virgule ! 4.9 et non pas 4,9. Cette valeur doit être passée dans un tableau d'où la nécessité des crochets.
            alignement: 'flushleft', // EE : ce champ est facultatif et n'est fonctionnel que pour l'hybride. Il permet de choisir où les cases sont disposées sur la feuille. Par défaut, c'est comme le texte qui le précède. Pour mettre à gauche, au centre ou à droite, choisir parmi ('flushleft', 'center', 'flushright').
            param: {
              digits:
                nbDigitsSupplementaires +
                nombreDeChiffresDansLaPartieEntiere(nbReponse), // obligatoire pour AMC (le nombre de chiffres pour AMC, si digits est mis à 0, alors il sera déterminé pour coller au nombre décimal demandé)
              decimals: 0, // facultatif. S'il n'est pas mis, il sera mis à 0 et sera déterminé automatiquement comme décrit ci-dessus
              signe: false, // (présence d'une case + ou - pour AMC)
              approx: 0, // (0 = valeur exacte attendue, sinon valeur de tolérance... voir plus bas pour un point technique non intuitif)
            },
          },
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      }
      if (this.listeQuestions.indexOf(texte) === -1) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
