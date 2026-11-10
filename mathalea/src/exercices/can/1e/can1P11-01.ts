import Decimal from 'decimal.js'
import { choisitLettresDifferentes } from '../../../lib/outils/aleatoires'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
import { Arbre } from '../../../modules/arbres'
import { mathalea2d } from '../../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'

export const titre = 'Lire une probabilité à partir d’un arbre'
export const dateDePublication = '03/07/2022'
export const interactifReady = true

/**
 * On donne un arbre de probabilité et lit une probabilité sur l'arbre
 * @author Gilles Mora

 */
export const uuid = '32394'

export const refs = {
  'fr-fr': ['can1P11-01', 'can2P2-02', '2P20-flash2', '1A-P05-10'],
  'fr-ch': ['NR'],
}
export default class LectureProbabilite extends Exercice {
  constructor() {
    super()

    this.sup = true
    this.nbQuestions = 1
    this.nbCols = 2 // Uniquement pour la sortie LaTeX

    // this.sup = 1; // Niveau de difficulté
  }

  nouvelleVersion() {
    for (
      let i = 0,
        cpt = 0,
        pA,
        pB,
        pAC,
        pBC,
        pACcompl,
        pBCcompl,
        omega,
        texte,
        texteCorr,
        choix,
        nom1,
        nom2,
        objets;
      i < this.nbQuestions && cpt < 50;
    ) {
      objets = []
      // On choisit les probas de l'arbre
      nom1 = choisitLettresDifferentes(1, 'DP')[0]
      nom2 = choisitLettresDifferentes(1, nom1 + 'DP')[0]
      pA = new Decimal(randint(1, 9, 5)).div(10)

      pB = new Decimal(1).minus(pA)
      pAC = new Decimal(randint(1, 9) * 10 + randint(1, 9)).div(100)
      pBC = new Decimal(randint(1, 9) * 10 + randint(1, 9)).div(100)
      while (pAC.equals(pBC) || pAC.equals(new Decimal(1).minus(pBC))) {
        pA = new Decimal(randint(1, 9, 5)).div(10)

        pB = new Decimal(1).minus(pA)
        pAC = new Decimal(randint(1, 9) * 10 + randint(1, 9)).div(100)
        pBC = new Decimal(randint(1, 9) * 10 + randint(1, 9)).div(100)
      }
      // pACcompl et pBCcompl sont calculés une seule fois puis réutilisés
      // (y compris dans les comparaisons choix === ... plus bas) : Decimal.js
      // n'a pas d'égalité structurelle, donc recalculer new Decimal(1).minus(pAC)
      // à chaque comparaison produirait un objet différent et ne matcherait jamais.
      pACcompl = new Decimal(1).minus(pAC)
      pBCcompl = new Decimal(1).minus(pBC)
      choix = choice([pA, pB, pAC, pACcompl, pBC, pBCcompl])
      // On définit l'arbre complet
      omega = new Arbre({
        racine: true,
        rationnel: false,
        nom: '',
        proba: 1,
        visible: false,
        alter: '',
        enfants: [
          new Arbre({
            rationnel: false,
            nom: `${nom1}`,
            proba: pA.toNumber(),
            enfants: [
              new Arbre({
                rationnel: false,
                nom: `${nom2}`,
                proba: pAC.toNumber(),
              }),
              new Arbre({
                rationnel: false,
                nom: `\\overline{${nom2}}`,
                proba: new Decimal(1).minus(pAC).toNumber(),
              }),
            ],
          }),
          new Arbre({
            rationnel: false,
            nom: `\\overline{${nom1}}`,
            proba: new Decimal(1).minus(pA).toNumber(),
            enfants: [
              new Arbre({
                rationnel: false,
                nom: `${nom2}`,
                proba: pBC.toNumber(),
              }),
              new Arbre({
                rationnel: false,
                nom: `\\overline{${nom2}}`,
                proba: new Decimal(1).minus(pBC).toNumber(),
              }),
            ],
          }),
        ],
      })

      omega.setTailles() // On calcule les tailles des arbres.
      objets = omega.represente(0, 8, 0, 2, true, 1, 10) // On crée l'arbre complet echelle 1.4 feuilles verticales sens gauche-droite
      texte = "On donne l'arbre de probabilités :<br><br>"
      texte += mathalea2d(
        {
          xmin: -0.1,
          xmax: 14,
          ymin: 0,
          ymax: 8,
          display: 'inline',
          scale: 0.5,
        },
        ...objets,
      )
      texte += '<br>Compléter avec la notation qui convient : '
      if (this.interactif) {
        texte += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierProbabilite,
        )
      } else {
        texte += `${sp(7)}$\\ldots\\ldots $`
      }
      texte += ` $= ${texNombre(choix, 2)}$${this.interactif ? '.' : ''}`
      texteCorr = `Les probabilités conditionnelles se lisent sur la deuxième partie de l'arbre.<br>
            `

      if (choix === pA) {
        texteCorr += `$${texNombre(pA, 2)}$ n'est pas une probabilité conditionnelle, 
        $${miseEnEvidence(`P(${nom1})=${texNombre(pA, 2)}`)}$.`
        handleAnswers(this, i, {
          reponse: { value: [`p(${nom1})`, `P(${nom1})`] },
        })
      }
      if (choix === pB) {
        texteCorr += `$${texNombre(pA, 2)}$ n'est pas une probabilité conditionnelle, 
        $${miseEnEvidence(`P(\\overline{${nom1}})=${texNombre(pB, 2)}`)}$.`
        handleAnswers(this, i, {
          reponse: {
            value: [`p(\\overline{${nom1}})`, `P(\\overline{${nom1}})`],
          },
        })
      }
      if (choix === pAC) {
        texteCorr += `$${texNombre(pAC, 2)}$ est une probabilité conditionnelle, 
        $${miseEnEvidence(`P_{${nom1}}(${nom2})=${texNombre(pAC, 2)}`)}$.`
        handleAnswers(this, i, {
          reponse: { value: [`p_${nom1}({${nom2}})`, `P_${nom1}({${nom2}})`] },
        }) // Testé et Correct
      }
      if (choix === pACcompl) {
        texteCorr += `$${texNombre(pACcompl, 2)}$ est une probabilité conditionnelle,
        $${miseEnEvidence(`P_{${nom1}}(\\overline{${nom2}})=${texNombre(pACcompl, 2)}`)}$.`
        handleAnswers(this, i, {
          reponse: {
            value: [
              `p_${nom1}({\\overline{${nom2}}})`,
              `P_${nom1}({\\overline{${nom2}}})`,
              `p_${nom1}(\\overline{{${nom2}}})`,
              `P_${nom1}(\\overline{{${nom2}}})`,
            ],
          },
        }) // Testé et Correct
      }
      if (choix === pBC) {
        texteCorr += `$${texNombre(pBC, 2)}$ est une probabilité conditionnelle, 
        $${miseEnEvidence(`P_{\\overline{${nom1}}}(${nom2})=${texNombre(pBC, 2)}`)}$.`
        handleAnswers(this, i, {
          reponse: {
            value: [
              `p_{\\overline{${nom1}}}({${nom2}})`,
              `P_{\\overline{${nom1}}}({${nom2}})`,
              `p\\overline{_${nom1}}({${nom2}})`,
              `P\\overline{_${nom1}}({${nom2}})`,
            ],
          },
        }) // Testé et Correct
      }
      if (choix === pBCcompl) {
        texteCorr += `$${texNombre(pBCcompl, 2)}$ est une probabilité conditionnelle,
        $${miseEnEvidence(`P_{\\overline{${nom1}}}(\\overline{${nom2}})=${texNombre(pBCcompl, 2)}`)}$.`
        handleAnswers(this, i, {
          reponse: {
            value: [
              `p_{\\overline{${nom1}}}({\\overline{${nom2}}})`,
              `P_{\\overline{${nom1}}}({\\overline{${nom2}}})`,
              `p\\overline{_${nom1}}(\\overline{{${nom2}}})`,
              `P\\overline{_${nom1}}(\\overline{{${nom2}}})`,
              `p_{\\overline{${nom1}}}(\\overline{{${nom2}}})`,
              `P_{\\overline{${nom1}}}(\\overline{{${nom2}}})`,
              `p\\overline{_${nom1}}({\\overline{${nom2}}})`,
              `P\\overline{_${nom1}}({\\overline{${nom2}}})`,
            ],
          },
        })
      }
      this.canEnonce = `On donne l'arbre de probabilités :<br>
      
      `
      this.canEnonce += mathalea2d(
        {
          xmin: -0.1,
          xmax: 14,
          ymin: 0,
          ymax: 8,
          display: 'inline',
          scale: 0.5,
        },
        ...objets,
      )
      this.canReponseACompleter = `Compléter avec la notation qui convient.<br>

      $\\ldots= ${texNombre(choix, 2)}$`
      if (this.questionJamaisPosee(i, pA, pAC, pBC)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr

        this.listeCanEnonces.push(this.canEnonce)
        this.listeCanReponsesACompleter.push(this.canReponseACompleter)
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
