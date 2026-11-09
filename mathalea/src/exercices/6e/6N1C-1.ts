import { latex2d } from '../../lib/2d/textes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { texteGras } from '../../lib/outils/embellissements'
import {
  arrondi,
  nombreDeChiffresDansLaPartieEntiere,
} from '../../lib/outils/nombres'
import { lettreIndiceeDepuisChiffre } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

import { droiteGraduee } from '../../lib/2d/DroiteGraduee'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { orangeMathalea } from '../../lib/colors'
import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { toutAUnPoint } from '../../lib/interactif/fonctionsBaremes'

export const titre = "Lire l'abscisse entière d'un point (grands nombres)"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const dateDeModifImportante = '26/08/2024'

/**
 * Lire l'abscisse entière d'un point
 * @author Jean-claude Lhote et Rémi Angot
 * Relecture : Novembre 2021 par EE
 */
export const uuid = 'ad8c9'

export const refs = {
  'fr-fr': ['6N1C-1'],
  'fr-2016': ['6N11'],
  'fr-ch': ['9R1NO2C-4', '9R2NO2C-4', '9R3NO2C-4', 'PRQNO04A-7'], // Primaire anciennement :['9NO2-1'],
}
export default class LireAbscisseEntiere2d extends Exercice {
  constructor() {
    super()

    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      5,
      '1 : Centaines\n2 : Milliers\n3 : Dizaines de mille\n4 : Centaines de mille\n5 : Mélange',
    ]

    this.nbQuestions = 3

    this.sup = 5
    this.interactif = false
  }

  nouvelleVersion() {
    this.consigne = "Lire l'abscisse de chacun des points suivants."
    if (this.interactif) {
      this.consigne += texteGras(' Penser à mettre les espaces nécessaires.')
    }
    let typesDeQuestions

    if (this.sup === 5) {
      typesDeQuestions = combinaisonListes([1, 2, 3, 4], this.nbQuestions)
    } else {
      typesDeQuestions = combinaisonListes([this.sup], this.nbQuestions)
    }
    const d = []
    for (
      let i = 0,
        abs0,
        l1,
        l2,
        l3,
        x1,
        x2,
        x3,
        reponse1,
        reponse2,
        reponse3,
        pas1,
        texte = '',
        texteCorr = '',
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      l1 = lettreIndiceeDepuisChiffre(i * 3 + 1)
      l2 = lettreIndiceeDepuisChiffre(i * 3 + 2)
      l3 = lettreIndiceeDepuisChiffre(i * 3 + 3)
      switch (typesDeQuestions[i]) {
        case 1: // Version simplifiée : Centaines (ajout Mireille, septembre 2025)
          abs0 = randint(1, 9) * 100 // Ex: 200, 500, 900...
          pas1 = 0.01 // 1 unité sur la droite = 100 (car 1/pas1 = 100)
          break

        case 2: // Placer des entiers sur un axe (milliers)
          abs0 = randint(1, 9) * 1000
          pas1 = 0.001
          break

        case 3: // Placer des entiers sur un axe (dizaines de mille)
          abs0 = randint(5, 15) * 10000
          pas1 = 0.0001
          break

        case 4: // Placer des entiers sur un axe (centaines de mille)
        default:
          abs0 = randint(35, 85) * 100000
          pas1 = 0.00001
          break
      }
      x1 = arrondi(randint(1, 27, [10, 20]) / 10)
      x2 = arrondi(randint(33, 47, 40) / 10)
      x3 = arrondi(randint(53, 67, 60) / 10)
      reponse1 = arrondi(x1 / pas1 + abs0)
      reponse2 = arrondi(x2 / pas1 + abs0)
      reponse3 = arrondi(x3 / pas1 + abs0)
      d[2 * i] = droiteGraduee({
        Unite: 4,
        Min: 0,
        Max: 7.1,
        axeStyle: '->',
        pointTaille: 5,
        pointStyle: 'x',
        labelsPrincipaux: false,
        thickSec: true,
        step1: 10,
        labelListe: [
          [0, `${texNombre(abs0, 0)}`],
          [1, `${texNombre(abs0 + 1 / pas1, 0)}`],
        ],
        pointListe: [
          [x1, l1],
          [x2, l2],
          [x3, l3],
        ],
      })
      d[2 * i + 1] = droiteGraduee({
        Unite: 4,
        Min: 0,
        Max: 7.1,
        axeStyle: '->',
        pointTaille: 5,
        pointStyle: 'x',
        labelsPrincipaux: false,
        labelColor: orangeMathalea,
        thickSec: true,
        step1: 10,
        labelListe: [
          [x1, `\\boldsymbol{${texNombre(reponse1, 0)}}`],
          [x2, `\\boldsymbol{${texNombre(reponse2, 0)}}`],
          [x3, `\\boldsymbol{${texNombre(reponse3, 0)}}`],
        ],
        pointListe: [
          [x1, l1],
          [x2, l2],
          [x3, l3],
        ],
        labelCustomDistance: 1.5,
      })
      const label1 = latex2d(`${texNombre(abs0, 0)}`, 0, -0.7, {
        letterSize: 'scriptsize',
      })
      const label2 = latex2d(`${texNombre(abs0 + 1 / pas1, 0)}`, 4, -0.7, {
        letterSize: 'scriptsize',
      })

      texte =
        mathalea2d(
          {
            xmin: -2,
            ymin: -1,
            xmax: 30,
            ymax: 2,
            pixelsParCm: 20,
            scale: 0.5,
          },
          d[2 * i],
        ) + (context.isHtml ? '<br>' : '')
      texteCorr = mathalea2d(
        { xmin: -2, ymin: -2, xmax: 30, ymax: 2, pixelsParCm: 20, scale: 0.5 },
        d[2 * i + 1],
        label1,
        label2,
      )
      if (this.interactif && context.isHtml) {
        texte += addMultiMathfield(this, i, {
          dataTemplate: `$${l1}($ %{champ1} $)$ ; $${l2}($%{champ2}$)$ ; $${l3}($%{champ3}$)$`,
          dataOptions: {
            champ1: {
              keyboard: KeyboardType.numbersSpace,
              minWidth: 50,
            },
            champ2: {
              keyboard: KeyboardType.numbersSpace,
              minWidth: 50,
            },
            champ3: {
              keyboard: KeyboardType.numbersSpace,
              minWidth: 50,
            },
          },
        })
        handleAnswers(
          this,
          i,
          {
            bareme: toutAUnPoint,
            champ1: {
              value: texNombre(reponse1, 0),
              options: { nombreAvecEspace: true },
            },
            champ2: {
              value: texNombre(reponse2, 0),
              options: { nombreAvecEspace: true },
            },
            champ3: {
              value: texNombre(reponse3, 0),
              options: { nombreAvecEspace: true },
            },
          },
          { formatInteractif: 'multi-mathfield' },
        )
      } else if (context.isAmc) {
        this.autoCorrectionAMC[i] = {
          enonce: texte,
          enonceAvant: false,
          propositions: [
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  statut: '',
                  reponse: {
                    texte: `Lire l'abscisse de chacun des points.<br>${texte}<br>Abscisse de $${l1}$ :`,
                    valeur: reponse1,
                    param: {
                      digits: nombreDeChiffresDansLaPartieEntiere(reponse1),
                      decimals: 0,
                      signe: false,
                      approx: 0,
                    },
                  },
                },
              ],
            },
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  statut: '',
                  reponse: {
                    texte: `Abscisse de $${l2}$ :`,
                    valeur: reponse2,
                    param: {
                      digits: nombreDeChiffresDansLaPartieEntiere(reponse2),
                      decimals: 0,
                      signe: false,
                      approx: 0,
                    },
                  },
                },
              ],
            },
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  statut: '',
                  reponse: {
                    texte: `Abscisse de $${l3}$ :`,
                    valeur: reponse3,
                    param: {
                      digits: nombreDeChiffresDansLaPartieEntiere(reponse3),
                      decimals: 0,
                      signe: false,
                      approx: 0,
                    },
                  },
                },
              ],
            },
          ],
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      }

      if (this.questionJamaisPosee(i, abs0, x1, x2, x3)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        // Les abscisses sont lues sur la figure de la correction : réponse explicite
        this.listeReponsesCourtes[i] =
          `$${l1}(${texNombre(reponse1, 0)})$ ; ` +
          `$${l2}(${texNombre(reponse2, 0)})$ ; ` +
          `$${l3}(${texNombre(reponse3, 0)})$`
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
