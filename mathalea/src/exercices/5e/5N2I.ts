import Decimal from 'decimal.js'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureNombreRelatif,
  ecritureNombreRelatifc,
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'
import { arrondi } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

import { orangeMathalea } from '../../lib/colors'
import { miseEnEvidence } from '../../lib/outils/embellissements'

export const titre = 'Soustraire deux nombres relatifs'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDeModifImportante = '23/08/2024'

/**
 * Effectuer la soustraction de  2 nombres relatifs.
 *
 * * On peut paramétrer la distance à zéro maximale des deux termes (par défaut égale à 20)
 * * On peut choisir d'avoir une écriture simplifiée  (par défaut ce n'est pas le cas)
 * * On peut choisir d'avoir des nombres décimaux (par défaut ce n'est pas le cas)
 * @author Rémi Angot
 * 5R21
 * Rendu les différentes situations équiprobables le 16/10/2021 par Guillaume Valmont
 * Ajout possibilité correction non détaillée le 11/11/2021 par Mireille Gain
 */
export const uuid = 'b6982'

export const refs = {
  'fr-fr': ['5N2I'],
  'fr-2016': ['5R21'],
  'fr-ch': ['9R2NO3D-1', '9R3NO3D-1', '10LCNO2D-1', '10LSNO2D-1', '11CTNO1C-1', 'PRQNO06B-3'],
}
export default class ExerciceSoustractionsRelatifs extends Exercice {
  constructor() {
    super()
    this.sup = 20
    this.sup2 = false // écriture simplifiée
    this.sup3 = false // nombres décimaux

    this.consigne = this.interactif
      ? 'Calculer (mentalement ou au brouillon) et indiquer seulement le résultat final.'
      : 'Calculer.'
    this.nbCols = 3
    this.nbColsCorr = 2
    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = true
    this.besoinFormulaireNumerique = ['Valeur maximale', 99999]
    this.besoinFormulaire2CaseACocher = ['Avec des écritures simplifiées']
    this.besoinFormulaire3CaseACocher = ['Avec des nombres décimaux']
    this.comment =
      "Si l'option « Avec des nombres décimaux » est activée, 2 fois sur 3 les nombres auront un chiffre après la virgule et une fois sur 3 un seul terme aura deux chiffres après la virgule."
  }

  nouvelleVersion() {
    let liste: [1 | -1, 1 | -1][] = [
      [-1, -1],
      [-1, 1],
      [1, -1],
    ] // Les deux nombres relatifs ne peuvent pas être tous les deux positifs
    liste = combinaisonListes(liste, this.nbQuestions)
    const partieDecimaleAUnChiffre = combinaisonListes(
      [true, true, false],
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let a: number
      let b: number
      let texte = ''
      let texteCorr = ''
      a = randint(1, this.sup)
      b = randint(1, this.sup)
      const k = liste[i]
      a = a * k[0]
      b = b * k[1]
      if (this.sup3) {
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
      if (this.sup2) {
        texte = `$ ${texNombre(a)} - ${ecritureParentheseSiNegatif(b)} =$`
        if (this.interactif && !context.isAmc) {
          texte =
            `$ ${a} - ${ecritureParentheseSiNegatif(b)} = $` +
            ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase, {})
        }
        if (b > 0) {
          texteCorr = `$ ${texNombre(a)} - ${ecritureParentheseSiNegatif(b)} = ${miseEnEvidence(texNombre(a - b))} $`
        } else {
          if (this.correctionDetaillee) {
            texteCorr = `$ ${texNombre(a)} - ${ecritureParentheseSiNegatif(b)} = ${texNombre(a)} ${ecritureAlgebrique(-b)} = ${miseEnEvidence(texNombre(a - b))}$`
          } else {
            texteCorr = `$ ${a} - ${ecritureParentheseSiNegatif(b)} = ${miseEnEvidence(texNombre(a - b))}$`
          }
        }
      } else {
        texte =
          '$ ' +
          ecritureNombreRelatif(a) +
          ' - ' +
          ecritureNombreRelatif(b) +
          ' =$'
        if (this.interactif && !context.isAmc) {
          texte =
            '$ ' +
            ecritureNombreRelatif(a) +
            ' - ' +
            ecritureNombreRelatif(b) +
            ' = $' +
            ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase, {})
        }
        if (this.correctionDetaillee) {
          texteCorr =
            '$ ' +
            ecritureNombreRelatif(a) +
            ' - ' +
            ecritureNombreRelatif(b) +
            ' = ' +
            ecritureNombreRelatifc(a) +
            ' + ' +
            ecritureNombreRelatifc(-1 * b) +
            ' = ' +
            ecritureNombreRelatifc(a - b, { color: orangeMathalea }) +
            ' $'
        } else {
          texteCorr =
            '$ ' +
            ecritureNombreRelatif(a) +
            ' - ' +
            ecritureNombreRelatif(b) +
            ' = ' +
            ecritureNombreRelatifc(a - b, { color: orangeMathalea }) +
            ' $'
        }
      }
      if (this.questionJamaisPosee(i, a, b)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr

        handleAnswers(this, i, {
          reponse: {
            value: arrondi(a - b).toString(),
            options: { nombreDecimalSeulement: true },
          },
        })

        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
