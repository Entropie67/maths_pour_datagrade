import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Déterminer le dernier chiffre d'une somme ou différence entre décimaux"
export const dateDePublication = '28/01/2026'
export const dateDeModifImportante = '27/03/2026'
export const amcReady = true
export const interactifReady = true

export const amcType = 'AMCNum'

/**
 * Trouver le dernier chiffre d'un calcul (somme, différence) entre décimaux
 * Modif 27/03/2026 : Le premier terme de la différence est toujours plus grand que le second terme
 * @author Éric Elter
 */

export const uuid = 'b38m3'

export const refs = {
  'fr-fr': ['6N2A-3', 'CM1N5C-1', '5N2autoA-1'],
  'fr-ch': ['9R1NO7D-2', '9R2NO7D-2', '9R3NO7D-2', 'PRQST03A-2'],
}

function nomFractionDecimale(
  n: number,
): 'unités' | 'dixièmes' | 'centièmes' | 'millièmes' {
  const correspondance = {
    0: 'unités',
    1: 'dixièmes',
    2: 'centièmes',
    3: 'millièmes',
  } as const

  if (!(n in correspondance)) {
    throw new Error('Valeur attendue : 0, 1, 2 ou 3')
  }

  return correspondance[n as 0 | 1 | 2 | 3]
}

export default class DernierChiffreSommeDifférenceDécimaux extends Exercice {
  version: string
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      "Type d'opérations",
      'Nombres séparés par des tirets :\n1 : Somme\n2 : Différence',
    ]
    this.besoinFormulaire2Numerique = [
      'Nombre de décimales sur les deux nombres',
      3,
      'Avec le même nombre de décimales\nAvec un nombre différent de décimales\nPeu importe le nombre de décimales',
    ]
    this.besoinFormulaire3CaseACocher = ['Avec un entier']

    this.sup = '1-2'
    this.sup2 = 3
    this.sup3 = false
    this.nbQuestions = 4 // Ici le nombre de questions
    this.version = '6e'
    this.correctionDetailleeDisponible = true
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions > 1
        ? 'Pour chaque calcul, déterminer le dernier chiffre (non nul) du résultat.'
        : 'Déterminer le dernier chiffre (non nul) du résultat de ce calcul.'
    const typeDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 2,
      melange: 3,
      defaut: 2,
      nbQuestions: 2,
      listeOfCase: ['somme', 'difference'],
    })

    const listeTypeDeQuestions = combinaisonListes(
      typeDeQuestionsDisponibles,
      this.nbQuestions,
    )

    if (this.sup3) this.sup2 = false
    for (
      let i = 0, a = 0, b = 0, texte = '', texteCorr = '', cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      let chiffreA, chiffreB
      let resultat = 0

      const memeNbDeDecimales =
        this.sup2 === 3 ? choice([true, false]) : this.sup2 === 1
      const exposant = randint(1, 3)
      let exposant1 = randint(1, 3)
      let exposant2 = randint(1, 3, exposant1)
      if (this.sup3) {
        if (choice([true, false])) exposant1 = 0
        else exposant2 = 0
      }
      switch (listeTypeDeQuestions[i]) {
        case 'somme':
          chiffreA = randint(1, 9)
          chiffreB = randint(1, 9, [10 - chiffreA])
          a =
            randint(0, 1) * randint(1, 9) * 10000 +
            randint(100, 999) * 10 +
            chiffreA
          b =
            randint(0, 1) * randint(1, 9) * 10000 +
            randint(10, 999) * 10 +
            chiffreB
          if (memeNbDeDecimales) {
            a = arrondi(a / 10 ** exposant)
            b = arrondi(b / 10 ** exposant)
            resultat = (chiffreA + chiffreB) % 10
          } else {
            a = arrondi(a / 10 ** exposant1, exposant1)
            b = arrondi(b / 10 ** exposant2, exposant2)
            resultat = exposant1 > exposant2 ? chiffreA : chiffreB
          }
          texte = `$${texNombre(a)} + ${texNombre(b)}$`
          texteCorr = ''
          if (this.correctionDetaillee) {
            if (memeNbDeDecimales) {
              texteCorr += `Dans les deux termes ($${texNombre(a)}$ et $${texNombre(b)}$), le dernier chiffre non nul est le chiffre des ${nomFractionDecimale(exposant)} (respectivement $${chiffreA}$ et $${chiffreB}$).<br>`
              texteCorr += `Le dernier chiffre attendu de la somme sera donc le chiffre des ${texteEnCouleurEtGras(nomFractionDecimale(exposant), bleuMathalea)}.<br>`
              texteCorr += `Ce sera donc le chiffre des unités de la somme des chiffres respectifs des ${nomFractionDecimale(exposant)} : $${chiffreA}+${chiffreB}=${chiffreA + chiffreB < 10 ? '' : 1}${miseEnEvidence(resultat)}$.<br>`
            } else {
              texteCorr += `Dans $${texNombre(a)}$, le dernier chiffre non nul est le chiffre des ${nomFractionDecimale(exposant1)}.<br>`
              texteCorr += `Dans $${texNombre(b)}$, le dernier chiffre non nul est le chiffre des ${nomFractionDecimale(exposant2)}.<br>`
              texteCorr += `Le dernier chiffre attendu de la somme sera donc le chiffre des ${texteEnCouleurEtGras(nomFractionDecimale(Math.max(exposant1, exposant2)), bleuMathalea)}, soit $${miseEnEvidence(resultat)}$.<br>`
            }
          }
          texteCorr += `Le dernier chiffre de $${texNombre(a)} + ${texNombre(b)}$ est $${miseEnEvidence(resultat)}$.`

          break
        case 'difference':
          chiffreA = randint(1, 9)
          chiffreB = randint(1, 9, [chiffreA])
          do {
            a =
              randint(0, 1) * randint(1, 9) * 10000 +
              randint(100, 999) * 10 +
              chiffreA
            b =
              randint(0, 1) * randint(1, 9) * 10000 +
              randint(10, 999) * 10 +
              chiffreB

            if (memeNbDeDecimales) {
              a = arrondi(a / 10 ** exposant)
              b = arrondi(b / 10 ** exposant)
              resultat =
                chiffreA > chiffreB
                  ? chiffreA - chiffreB
                  : 10 + chiffreA - chiffreB
            } else {
              a = arrondi(a / 10 ** exposant1, exposant1)
              if (exposant2 !== 0) b = arrondi(b / 10 ** exposant2, exposant2)
              else b = randint(0, Math.floor(a / 10)) * 10 + chiffreB

              resultat = exposant1 > exposant2 ? chiffreA : 10 - chiffreB
            }
          } while ((b >= a && a < 2) || b > a)
          texte = `$${texNombre(a)} - ${texNombre(b)}$`
          texteCorr = ''
          if (this.correctionDetaillee) {
            if (memeNbDeDecimales) {
              texteCorr += `Dans les deux termes ($${texNombre(a)}$ et $${texNombre(b)}$), le dernier chiffre non nul est le chiffre des ${nomFractionDecimale(exposant)} (respectivement $${chiffreA}$ et $${chiffreB}$).<br>`
              texteCorr += `Le dernier chiffre attendu sera donc le chiffre des ${texteEnCouleurEtGras(nomFractionDecimale(exposant), bleuMathalea)}`
              texteCorr +=
                chiffreA >= chiffreB
                  ? ` et $${chiffreA}-${chiffreB}=${miseEnEvidence(resultat)}$.<br>`
                  : `.<br>Mais comme $${chiffreA}<${chiffreB}$, il faut trouver ajouter une dizaine à $${chiffreA}$ et trouver le résultat de $(10+${chiffreA})-${chiffreB}$, soit $${miseEnEvidence(resultat)}$.<br>`
            } else {
              texteCorr += `Dans $${texNombre(a)}$, le dernier chiffre non nul est le chiffre des ${nomFractionDecimale(exposant1)}.<br>`
              texteCorr += `Dans $${texNombre(b)}$, le dernier chiffre non nul est le chiffre des ${nomFractionDecimale(exposant2)}.<br>`
              texteCorr += `Le dernier chiffre attendu sera donc le chiffre des ${texteEnCouleurEtGras(nomFractionDecimale(Math.max(exposant1, exposant2)), bleuMathalea)}.<br>`
              texteCorr +=
                Math.max(exposant1, exposant2) === exposant1
                  ? `Puisque c'est $${texNombre(a)}$ qui contient le chiffre des ${nomFractionDecimale(Math.max(exposant1, exposant2))}, ce sera donc ce chiffre qui sera le dernier chiffre attendu de cette différence.<br>`
                  : `Puisque c'est $${texNombre(b)}$ qui contient le chiffre des ${nomFractionDecimale(Math.max(exposant1, exposant2))}, il faut aussi utiliser le chiffre des ${nomFractionDecimale(Math.max(exposant1, exposant2))} de $${texNombre(a)}$ qui est, en fait, $0$ (car $${texNombre(a)}=${texNombre(a, exposant2, true)}$).<br>
                      On ajoute une dizaine à $0$ auquel on soustrait $${chiffreB}$, soit $(10 + 0)-${chiffreB}=${miseEnEvidence(resultat)}$.<br>`
            }
          }
          texteCorr += `Le dernier chiffre de $${texNombre(a)} - ${texNombre(b)}$ est $${miseEnEvidence(resultat)}$.`
          break
      }
      if (this.interactif) {
        texte =
          'Le dernier chiffre de ' +
          texte +
          ' est :' +
          ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)
      }
      handleAnswers(this, i, {
        reponse: {
          value: resultat,
          options: { nombreDecimalSeulement: true },
        },
      })
      if (this.questionJamaisPosee(i, a, b)) {
        // Si la question n'a jamais été posée, on la stocke dans la liste des questions
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this) // On envoie l'exercice à la fonction de mise en page
  }
}
