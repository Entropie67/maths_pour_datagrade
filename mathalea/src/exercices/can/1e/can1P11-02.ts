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

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * On donne un arbre de probabilité et lit une probabilité sur l'arbre
 * @author Gilles Mora

 */
export const uuid = '32395'

export const refs = {
  'fr-fr': ['can1P11-02', 'can2P2-03', '2P20-flash3', '1A-P05-11'],
  'fr-ch': [],
}
export default class LectureProbabilite2 extends Exercice {
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
      while (pAC === pBC || pAC === new Decimal(1).minus(pBC)) {
        pA = new Decimal(randint(1, 9, 5)).div(10)

        pB = new Decimal(1).minus(pA)
        pAC = new Decimal(randint(1, 9) * 10 + randint(1, 9)).div(100)
        pBC = new Decimal(randint(1, 9) * 10 + randint(1, 9)).div(100)
      }
      choix = choice([
        `P(${nom1})`,
        `P(\\overline{${nom1}})`,
        `P_{${nom1}}(${nom2})`,
        `P_{${nom1}}(\\overline{${nom2}})`,
        `P_{\\overline{${nom1}}}(${nom2})`,
        `P_{\\overline{${nom1}}}(\\overline{${nom2}})`,
      ])
      const reponseChoisie =
        choix === `P(${nom1})`
          ? pA
          : choix === `P(\\overline{${nom1}})`
            ? pB
            : choix === `P_{${nom1}}(${nom2})`
              ? pAC
              : choix === `P_{${nom1}}(\\overline{${nom2}})`
                ? new Decimal(1).minus(pAC)
                : choix === `P_{\\overline{${nom1}}}(${nom2})`
                  ? pBC
                  : new Decimal(1).minus(pBC)
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
      texte += '<br>Compléter avec le nombre qui convient : '
      texte += `$${choix}$`

      if (this.interactif) {
        texte += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierProbabilite,
          { texteAvant: ' $ = $' },
        )
        texte += '.'
      } else {
        texte += ` = ${sp(7)}$\\ldots\\ldots $`
      }
      texteCorr = `Les probabilités conditionnelles se lisent sur la deuxième partie de l'arbre.<br>
            `

      if (choix === `P(${nom1})`) {
        texteCorr += `$${texNombre(pA, 2)}$ n'est pas une probabilité conditionnelle, 
        $${miseEnEvidence(`P(${nom1})=${texNombre(pA, 2)}`)}$.`
        handleAnswers(this, i, { reponse: { value: texNombre(pA, 2) } })
      }
      if (choix === `P(\\overline{${nom1}})`) {
        texteCorr += `$${texNombre(pA, 2)}$ n'est pas une probabilité conditionnelle, 
        $${miseEnEvidence(`P(\\overline{${nom1}})=${texNombre(pB, 2)}`)}$.`
        handleAnswers(this, i, { reponse: { value: texNombre(pB, 2) } })
      }
      if (choix === `P_{${nom1}}(${nom2})`) {
        texteCorr += `$${texNombre(pAC, 2)}$ est une probabilité conditionnelle, 
        $${miseEnEvidence(`P_{${nom1}}(${nom2})=${texNombre(pAC, 2)}`)}$.`
        handleAnswers(this, i, { reponse: { value: texNombre(pAC, 2) } })
      }
      if (choix === `P_{${nom1}}(\\overline{${nom2}})`) {
        texteCorr += `$${texNombre(new Decimal(1).minus(pAC), 2)}$ est une probabilité conditionnelle, 
        $${miseEnEvidence(`P_{${nom1}}(\\overline{${nom2}})=${texNombre(new Decimal(1).minus(pAC), 2)}`)}$.`
        handleAnswers(this, i, {
          reponse: { value: texNombre(new Decimal(1).minus(pAC), 2) },
        })
      }
      if (choix === `P_{\\overline{${nom1}}}(${nom2})`) {
        texteCorr += `$${texNombre(pBC, 2)}$ est une probabilité conditionnelle, 
        $${miseEnEvidence(`P_{\\overline{${nom1}}}(${nom2})=${texNombre(pBC, 2)}`)}$.`
        handleAnswers(this, i, { reponse: { value: texNombre(pBC, 2) } })
      }
      if (choix === `P_{\\overline{${nom1}}}(\\overline{${nom2}})`) {
        texteCorr += `$${texNombre(new Decimal(1).minus(pBC), 2)}$ est une probabilité conditionnelle, 
        $${miseEnEvidence(`P_{\\overline{${nom1}}}(\\overline{${nom2}})=${texNombre(new Decimal(1).minus(pBC), 2)}`)}$.`
        handleAnswers(this, i, {
          reponse: { value: texNombre(new Decimal(1).minus(pBC), 2) },
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

      $\\ldots= ${texNombre(reponseChoisie, 2)}$`
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
