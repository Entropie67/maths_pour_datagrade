import Decimal from 'decimal.js'
import { choice } from '../../../lib/outils/arrayOutils'
import { texNombre } from '../../../lib/outils/texNombre'
import { Arbre } from '../../../modules/arbres'
import { mathalea2d } from '../../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { miseEnEvidence } from '../../../lib/outils/embellissements'

export const titre =
  'Calculer la probabilité d’une intersection à partir d’un arbre'
export const dateDePublication = '04/07/2022'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 *
 * @author Gilles Mora

 */
export const uuid = '7c8b7'

export const refs = {
  'fr-fr': ['can1P11-03', 'can2P2-04', '2P20-flash4'],
  'fr-ch': [],
}
export default class CalculerProbabiliteIntersection extends Exercice {
  constructor() {
    super()

    this.sup = true

    this.nbQuestions = 1
  }

  nouvelleVersion() {
    for (
      let i = 0,
        cpt = 0,
        reponse1,
        reponse2,
        reponse3,
        reponse4,
        pA,
        pBsachantA,
        pBbarresachantAbarre,
        pBbarresachantA,
        pAbarre,
        pBsachantAbarre,
        omega,
        texte = '',
        texteCorr = '',
        objets;
      i < this.nbQuestions && cpt < 50;
    ) {
      objets = []
      // On choisit les probas de l'arbre
      pA = new Decimal(randint(1, 9, 5)).div(10)
      pAbarre = new Decimal(pA).mul(-1).add(1)
      pBsachantA = new Decimal(randint(1, 9, 5)).div(10)
      pBbarresachantA = new Decimal(pBsachantA).mul(-1).add(1)
      pBsachantAbarre = new Decimal(randint(1, 9, 5)).div(10)
      pBbarresachantAbarre = new Decimal(pBsachantAbarre).mul(-1).add(1)
      reponse1 = new Decimal(pA).mul(pBsachantA)
      reponse2 = new Decimal(pA).mul(pBbarresachantA)
      reponse3 = new Decimal(pAbarre).mul(pBsachantAbarre)
      reponse4 = new Decimal(pAbarre).mul(pBbarresachantAbarre)

      switch (
        choice([1, 2, 3, 4]) //
      ) {
        case 1:
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
                nom: 'A',
                proba: pA.toNumber(),
                visible: false,
                alter: '',
                enfants: [
                  new Arbre({
                    rationnel: false,
                    nom: 'B',
                    proba: pBsachantA.toNumber(),
                    visible: false,
                    alter: '',
                  }),
                  new Arbre({
                    rationnel: false,
                    nom: '\\overline{B}',
                    proba: new Decimal(1 - pBsachantA.toNumber()).toNumber(),
                  }),
                ],
              }),
              new Arbre({
                rationnel: false,
                nom: '\\overline{A}',
                proba: pAbarre.toNumber(),
                enfants: [
                  new Arbre({
                    rationnel: false,
                    nom: 'B',
                    proba: new Decimal(pBsachantAbarre).toNumber(),
                  }),
                  new Arbre({
                    rationnel: false,
                    nom: '\\overline{B}',
                    proba: new Decimal(
                      1 - pBsachantAbarre.toNumber(),
                    ).toNumber(),
                  }),
                ],
              }),
            ],
          })

          omega.setTailles() // On calcule les tailles des arbres.
          objets = omega.represente(0, 8, 0, 2, true, 1, 10) // On crée l'arbre complet echelle 1.4 feuilles verticales sens gauche-droite
          texte = `On donne l'arbre de probabilités ci-dessous :<br>
          
          `
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

          if (this.interactif) {
            texte += '<br> $P(A\\cap B)=$ '
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
            )
          } else {
            texte += `<br>
          
          Calculer $P(A\\cap B)$. `
          }

          texteCorr = ` $P(A\\cap B)=P(A)\\times P_{A}(B)$.<br>
      $P(A)=1-${texNombre(pAbarre, 1)}= ${texNombre(pA, 1)}$.<br>
      $P_{A}(B)=1-${texNombre(1 - pBsachantA.toNumber(), 1)}= ${texNombre(pBsachantA, 1)}$.<br>
      Ainsi, $P(A\\cap B)=P(A)\\times P_{A}(B)=${texNombre(pA, 1)}\\times ${texNombre(pBsachantA, 1)}=${texNombre(reponse1, 2)}$.
      `
          handleAnswers(this, i, { reponse: { value: reponse1 } })
          this.canEnonce = texte

          break

        case 2:
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
                nom: 'A',
                proba: 1,
                visible: false,
                alter: '',
                enfants: [
                  new Arbre({
                    rationnel: false,
                    nom: 'B',
                    proba: pBsachantA.toNumber(),
                    alter: '',
                  }),
                  new Arbre({
                    rationnel: false,
                    nom: '\\overline{B}',
                    proba: 1,
                    visible: false,
                  }),
                ],
              }),
              new Arbre({
                rationnel: false,
                nom: '\\overline{A}',
                proba: pAbarre.toNumber(),
                enfants: [
                  new Arbre({
                    rationnel: false,
                    nom: 'B',
                    proba: new Decimal(pBsachantAbarre).toNumber(),
                  }),
                  new Arbre({
                    rationnel: false,
                    nom: '\\overline{B}',
                    proba: pBbarresachantAbarre.toNumber(),
                  }),
                ],
              }),
            ],
          })

          omega.setTailles() // On calcule les tailles des arbres.
          objets = omega.represente(0, 8, 0, 2, true, 1, 10) // On crée l'arbre complet echelle 1.4 feuilles verticales sens gauche-droite
          texte = `On donne l'arbre de probabilités ci-dessous :<br>
          
          `
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

          if (this.interactif) {
            texte += '<br> $P(A\\cap \\overline{B})=$ '
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
            )
          } else {
            texte += `<br>
          
          Calculer $P(A\\cap \\overline{B})$. `
          }

          texteCorr = ` $P(A\\cap \\overline{B})=P(A)\\times P_{A}(\\overline{B})$.<br>
        $P(A)=1-${texNombre(pAbarre, 1)}= ${texNombre(pA, 1)}$.<br>
        $P_{A}(\\overline{B})=1-${texNombre(pBsachantA, 1)}= ${texNombre(1 - pBsachantA.toNumber(), 1)}$.<br>
        Ainsi, $P(A\\cap \\overline{B})=P(A)\\times P_{A}(\\overline{B})=${texNombre(pA, 1)}\\times ${texNombre(1 - pBsachantA.toNumber(), 1)}=${texNombre(reponse2, 2)}$.
        `
          handleAnswers(this, i, { reponse: { value: reponse2 } })
          this.canEnonce = texte

          break

        case 3:
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
                nom: 'A',
                proba: pA.toNumber(),
                alter: '',
                enfants: [
                  new Arbre({
                    rationnel: false,
                    nom: 'B',
                    proba: pBsachantA.toNumber(),
                    alter: '',
                  }),
                  new Arbre({
                    rationnel: false,
                    nom: '\\overline{B}',
                    proba: pBbarresachantA.toNumber(),
                  }),
                ],
              }),
              new Arbre({
                rationnel: false,
                nom: '\\overline{A}',
                proba: 1,
                visible: false,
                enfants: [
                  new Arbre({
                    rationnel: false,
                    nom: 'B',
                    proba: 1,
                    visible: false,
                  }),
                  new Arbre({
                    rationnel: false,
                    nom: '\\overline{B}',
                    proba: pBbarresachantAbarre.toNumber(),
                  }),
                ],
              }),
            ],
          })

          omega.setTailles() // On calcule les tailles des arbres.
          objets = omega.represente(0, 8, 0, 2, true, 1, 10) // On crée l'arbre complet echelle 1.4 feuilles verticales sens gauche-droite
          texte = `On donne l'arbre de probabilités ci-dessous :<br>
          
          `
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

          if (this.interactif) {
            texte += '<br> $P(\\overline{A}\\cap B)=$ '
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
            )
          } else {
            texte += `<br>
          
          Calculer $P(\\overline{A}\\cap B)$. `
          }

          texteCorr = `
        





        $P(\\overline{A}\\cap B)=P(\\overline{A})\\times P_{\\overline{A}}(B)$.<br>
        $P(\\overline{A})=1-${texNombre(pA, 1)}=${texNombre(pAbarre, 1)}$.<br>
        $P_{\\overline{A}}(B)=1-${texNombre(pBbarresachantAbarre, 1)}= ${texNombre(1 - pBbarresachantAbarre.toNumber(), 1)}$.<br>
        Ainsi, $P(\\overline{A}\\cap B)=P(\\overline{A})\\times P_{\\overline{A}}(B)=${texNombre(pAbarre, 1)}\\times ${texNombre(pBsachantAbarre, 1)}=${texNombre(reponse3, 2)}$.
        `
          handleAnswers(this, i, { reponse: { value: reponse3 } })
          this.canEnonce = texte

          break

        case 4:
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
                nom: 'A',
                proba: pA.toNumber(),
                alter: '',
                enfants: [
                  new Arbre({
                    rationnel: false,
                    nom: 'B',
                    proba: pBsachantA.toNumber(),
                    alter: '',
                  }),
                  new Arbre({
                    rationnel: false,
                    nom: '\\overline{B}',
                    proba: pBbarresachantA.toNumber(),
                  }),
                ],
              }),
              new Arbre({
                rationnel: false,
                nom: '\\overline{A}',
                proba: 1,
                visible: false,
                enfants: [
                  new Arbre({
                    rationnel: false,
                    nom: 'B',
                    proba: pBsachantAbarre.toNumber(),
                  }),
                  new Arbre({
                    rationnel: false,
                    nom: '\\overline{B}',
                    proba: 1,
                    visible: false,
                  }),
                ],
              }),
            ],
          })

          omega.setTailles() // On calcule les tailles des arbres.
          objets = omega.represente(0, 8, 0, 2, true, 1, 10) // On crée l'arbre complet echelle 1.4 feuilles verticales sens gauche-droite
          texte = `On donne l'arbre de probabilités ci-dessous :<br>
          
          `
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

          if (this.interactif) {
            texte += '<br> $P(\\overline{A}\\cap \\overline{B})=$ '
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
            )
          } else {
            texte += `<br>
          
          Calculer $P(\\overline{A}\\cap \\overline{B})$. `
          }

          texteCorr = `
        





        $P(\\overline{A}\\cap \\overline{B})=P(\\overline{A})\\times P_{\\overline{A}}(\\overline{B})$.<br>
        $P(\\overline{A})=1-${texNombre(pA, 1)}=${texNombre(pAbarre, 1)}$.<br>
        $P_{\\overline{A}}(\\overline{B})=1-${texNombre(pBsachantAbarre, 1)}= ${texNombre(pBbarresachantAbarre, 1)}$.<br>
        Ainsi, $P(\\overline{A}\\cap \\overline{B})=P(\\overline{A})\\times P_{\\overline{A}}(\\overline{B})=${texNombre(pAbarre, 1)}\\times ${texNombre(pBbarresachantAbarre, 1)}=${texNombre(reponse4, 2)}$.
        `
          handleAnswers(this, i, { reponse: { value: reponse4 } })
          this.canEnonce = texte

          break
      }
      if (this.questionJamaisPosee(i, pA, pBsachantA)) {
        this.listeQuestions[i] = texte
        // Uniformisation : Mise en place de la réponse attendue en interactif en orange et gras
        const textCorrSplit = texteCorr.split('=')
        let aRemplacer = textCorrSplit[textCorrSplit.length - 1]
        aRemplacer = aRemplacer.replace('$', '')
        aRemplacer = aRemplacer.replace('.', '')

        texteCorr = ''
        for (let ee = 0; ee < textCorrSplit.length - 1; ee++) {
          texteCorr += textCorrSplit[ee] + '='
        }
        texteCorr += `$ $${miseEnEvidence(aRemplacer)}$` + '.' // Gestion du point final
        // Fin de cette uniformisation

        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}

// $P(A)=${texNombre(pA)}$.<br>
//      $P(\\overline{A})=${texNombre(pAbarre)}$.<br>
//    $P_A(B)=${texNombre(pBsachantA)}$.<br>
//  $P_A(\\overline{B})=${texNombre(pBbarresachantA)}$.<br>
// $P_{\\overline{A}}(B)=${texNombre(pBsachantAbarre)}$.<br>
// $P_{\\overline{A}}(\\overline{B})=${texNombre(pBbarresachantAbarre)}$.<br>
