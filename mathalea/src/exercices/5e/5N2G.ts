/**
 * ⚠️ Cet exercice est utilisé dans le test : tests/e2e/tests/interactivity/mathLive.calcul.test.ts ⚠️
 */

import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureNombreRelatif,
  ecritureNombreRelatifc,
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import {
  contraindreValeur,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

import Decimal from 'decimal.js'
import { orangeMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'

export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

export const titre = 'Additionner deux nombres relatifs'
export const dateDeModifImportante = '24/9/2024'

/**
 * Additionner deux relatifs inférieurs à la valeur maximale en paramètre qui est par défaut à 20.
 * Paramètre supplémentaire ; utilisation des écritures simplifiées / utilisation de nombres décimaux
 * @author Rémi Angot
 */
export const uuid = 'cbc26'

export const refs = {
  'fr-fr': ['5N2G'],
  'fr-2016': ['5R20'],
  'fr-ch': ['9R2NO3C-3', '9R3NO3C-3', '10CTNO2A-3', 'PRQNO06B-1'],
}
export default class ExerciceAdditionsRelatifs extends Exercice {
  modeQcm: boolean
  constructor() {
    super()
    this.sup = 20
    this.sup4 = false // nombres décimaux
    this.spacing = 0.5
    this.modeQcm = false
    this.sup3 = false
    this.besoinFormulaireNumerique = ['Valeur maximale', 99999]
    this.besoinFormulaire2Numerique = [
      "Type d'expressions",
      3,
      'Tous les nombres entre parenthèses \n2 : Seul le 2e terme négatif est entre parenthèses \n3 : Écriture simplifiée',
    ]
    this.sup2 = 1 // écriture simplifiée
    this.besoinFormulaire4CaseACocher = ['Avec des nombres décimaux']
    if (context.isHtml) this.besoinFormulaire3CaseACocher = ['QCM']
    this.comment =
      "Si l'option « Avec des nombres décimaux » est activée, 2 fois sur 3 les nombres auront un chiffre après la virgule et une fois sur 3 un seul terme aura deux chiffres après la virgule."
  }

  nouvelleVersion() {
    // Rétrocompatibilité avec les liens vers les exercices quand c'était des cases à cocher
    if (this.sup2 === false) {
      this.sup2 = 1
    } else if (this.sup2 === true) {
      this.sup2 = 3
    }
    this.consigne = this.sup3
      ? 'Calculer puis cocher la case correspondante.'
      : this.interactif
        ? 'Calculer (mentalement ou au brouillon) et indiquer seulement le résultat final.'
        : 'Calculer.'
    this.nbCols = this.sup3 ? 2 : 3
    this.nbColsCorr = this.sup3 ? 2 : 3

    const partieDecimaleAUnChiffre = combinaisonListes(
      [true, true, false],
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let a: number
      let b: number
      let texte = ''
      let texteCorr = ''
      this.sup = contraindreValeur(1, 99999, this.sup, 10)
      a = randint(1, this.sup)
      b = randint(1, this.sup)
      const k: (1 | -1)[] = choice([
        [-1, -1],
        [-1, 1],
        [1, -1],
      ]) // Les deux nombres relatifs ne peuvent pas être tous les deux positifs
      a = a * k[0]
      b = b * k[1]
      if (this.sup4) {
        a = new Decimal(randint(1, this.sup * 10)).div(10).mul(k[0]).toNumber()
        if (partieDecimaleAUnChiffre[i]) {
          b = new Decimal(randint(1, this.sup * 10))
            .div(10)
            .mul(k[1])
            .toNumber()
        } else {
          b = new Decimal(randint(1, this.sup * 100))
            .div(100)
            .mul(k[1])
            .toNumber()
        }
        if (choice([true, false])) {
          ;[a, b] = [b, a]
        }
      }
      if (this.sup2 === 1) {
        texte =
          '$ ' +
          ecritureNombreRelatif(a) +
          ' + ' +
          ecritureNombreRelatif(b) +
          '$'
        texteCorr =
          '$ ' +
          ecritureNombreRelatifc(a) +
          ' + ' +
          ecritureNombreRelatifc(b) +
          ' = ' +
          ecritureNombreRelatifc(a + b, { color: orangeMathalea }) +
          ' $'
      } else if (this.sup2 === 2) {
        texte = `$ ${texNombre(a)} + ${ecritureParentheseSiNegatif(b)}$`
        texteCorr = `$ ${texNombre(a)} + ${ecritureParentheseSiNegatif(b)} = ${miseEnEvidence(texNombre(a + b))} $`
      } else {
        texte = `$ ${texNombre(a)}${ecritureAlgebrique(b)}$`
        texteCorr = `$ ${a}${ecritureAlgebrique(b)} = ${miseEnEvidence(texNombre(a + b))} $`
      }
      this.autoCorrection[i] = {}
      this.autoCorrection[i].options = {}
      this.autoCorrection[i].enonce = `${texte}\n`
      const reponses = [a + b, a - b, -a + b, -a - b]
      this.autoCorrection[i].propositions = reponses
        .filter((reponse, index) => reponses.indexOf(reponse) === index)
        .map((reponse, index) => ({
          texte: `$${texNombre(reponse)}$`,
          statut: index === 0,
        }))
      if (this.sup3) {
        const qcm = propositionsQcm(this, i)
        texte += qcm.texte
        if (!this.interactif) {
          texteCorr += qcm.texteCorr
        }
      } else {
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase, {
          texteAvant: ' $=$',
        })
        handleAnswers(this, i, {
          reponse: {
            value: arrondi(a + b).toString(),
            options: { nombreDecimalSeulement: true },
          },
        })
      }
      if (this.questionJamaisPosee(i, a, b)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
