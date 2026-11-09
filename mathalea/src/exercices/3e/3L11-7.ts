import { amcConvert } from '../../lib/amc/amcBuilders'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { reduirePolynomeDegre3, rienSi1 } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import {
  listeQuestionsToContenuSansNumero,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Développer des carrés avec la double distributivité'
export const interactifReady = true

export const amcType = 'AMCHybride'
export const amcReady = true
export const dateDePublication = '12/12/2021'

/**
 * Utiliser la double distributivité pour développer (a+b)² ou (a-b)²
 *
 * @author Rémi Angot (AMC par Éric Elter)
 * 3L11-7
 */
export const uuid = '7cf81'

export const refs = {
  'fr-fr': ['3L11-7', 'BP2AutoI7'],
  'fr-ch': ['11LCFA3F-4', '11LSFA3F-4'],
}
export default class CarreDoubleDistributivite extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = [
      'Écrire toutes les multiplications dans la correction',
    ]

    this.nbQuestions = 4

    this.spacing = context.isHtml ? 3 : 2
    this.spacingCorr = context.isHtml ? 3 : 2
    this.sup = true

    this.listeAvecNumerotation = false
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions > 1
        ? 'Développer et réduire les expressions suivantes.'
        : "Développer et réduire l'expression suivante."

    const typesDeQuestionsDisponibles = [
      '(ax+b)2',
      '(b+ax)2',
      '(ax-b)2',
      '(b-ax)2',
    ]
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posées mais l'ordre diffère à chaque "cycle"
    const lettresPossibles = ['a', 'b', 'c', 'x', 'y', 'z']
    for (
      let i = 0,
        texte,
        texteCorr,
        reponse,
        reponse1,
        reponse2,
        reponse3,
        choixLettre,
        a,
        b,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      texte = ''
      texteCorr = ''
      reponse = ''
      reponse1 = 0
      reponse2 = 0
      reponse3 = 0
      a = randint(1, 11, 0)
      b = randint(1, 11, 0)
      choixLettre = choice(lettresPossibles)
      switch (listeTypeDeQuestions[i]) {
        case '(ax+b)2':
          texte = `$${lettreDepuisChiffre(i + 1)}=(${rienSi1(a)}${choixLettre}+${b})^2$`
          texteCorr = `$${lettreDepuisChiffre(i + 1)}=(${rienSi1(a)}${choixLettre}+${b})^2$`
          texteCorr += `<br>$${lettreDepuisChiffre(i + 1)}=(${rienSi1(a)}${choixLettre}+${b})(${rienSi1(a)}${choixLettre}+${b})$`
          if (this.sup) {
            texteCorr += `<br>$${lettreDepuisChiffre(i + 1)}= ${rienSi1(a)}${choixLettre} \\times ${rienSi1(a)}${choixLettre} + ${rienSi1(a)}${choixLettre} \\times ${b} + ${b} \\times ${rienSi1(a)}${choixLettre}  + ${b} \\times ${b}$`
          }
          texteCorr += `<br>$${lettreDepuisChiffre(i + 1)}=${a * a}${choixLettre}^2 + ${a * b}${choixLettre} + ${a * b}${choixLettre} + ${b * b}$`
          reponse1 = a * a
          reponse2 = 2 * a * b
          reponse3 = b * b
          break
        case '(b+ax)2':
          texte = `$${lettreDepuisChiffre(i + 1)}=(${b}+${rienSi1(a)}${choixLettre})^2$`
          texteCorr = `$${lettreDepuisChiffre(i + 1)}=(${b}+${rienSi1(a)}${choixLettre})^2$`
          texteCorr += `<br>$${lettreDepuisChiffre(i + 1)}=(${b}+${rienSi1(a)}${choixLettre})(${b}+${rienSi1(a)}${choixLettre})$`
          if (this.sup) {
            texteCorr += `<br>$${lettreDepuisChiffre(i + 1)}= ${b} \\times ${b} +  ${b} \\times ${rienSi1(a)}${choixLettre} +  ${rienSi1(a)}${choixLettre} \\times ${b}  + ${rienSi1(a)}${choixLettre} \\times ${rienSi1(a)}${choixLettre} $`
          }
          texteCorr += `<br>$${lettreDepuisChiffre(i + 1)}=${b * b} + ${rienSi1(a * b)}${choixLettre} + ${rienSi1(a * b)}${choixLettre} + ${rienSi1(a * a)}${choixLettre}^2$`
          reponse1 = a * a
          reponse2 = 2 * a * b
          reponse3 = b * b
          break
        case '(ax-b)2':
          texte = `$${lettreDepuisChiffre(i + 1)}=(${rienSi1(a)}${choixLettre}-${b})^2$`
          texteCorr = `$${lettreDepuisChiffre(i + 1)}=(${rienSi1(a)}${choixLettre}-${b})^2$`
          texteCorr += `<br>$${lettreDepuisChiffre(i + 1)}=(${rienSi1(a)}${choixLettre}-${b})(${rienSi1(a)}${choixLettre}-${b})$`
          if (this.sup) {
            texteCorr += `<br>$${lettreDepuisChiffre(i + 1)}= ${rienSi1(a)}${choixLettre} \\times ${rienSi1(a)}${choixLettre} + ${rienSi1(a)}${choixLettre} \\times (${-b}) + (${-b}) \\times ${rienSi1(a)}${choixLettre}  + (${-b}) \\times (${-b})$`
          }
          texteCorr += `<br>$${lettreDepuisChiffre(i + 1)}=${rienSi1(a * a)}${choixLettre}^2 - ${rienSi1(a * b)}${choixLettre} - ${rienSi1(a * b)}${choixLettre} + ${b * b}$`
          reponse1 = a * a
          reponse2 = -2 * a * b
          reponse3 = b * b

          break
        case '(b-ax)2':
          texte = `$${lettreDepuisChiffre(i + 1)}=(${b}-${rienSi1(a)}${choixLettre})^2$`
          texteCorr = `$${lettreDepuisChiffre(i + 1)}=(${b}-${rienSi1(a)}${choixLettre})^2$`
          texteCorr += `<br>$${lettreDepuisChiffre(i + 1)}=(${b}-${rienSi1(a)}${choixLettre})(${b}-${rienSi1(a)}${choixLettre})$`
          if (this.sup) {
            texteCorr += `<br>$${lettreDepuisChiffre(i + 1)}= ${b} \\times ${b} +  ${b} \\times (-${rienSi1(a)}${choixLettre}) +  (-${rienSi1(a)}${choixLettre}) \\times ${b}  + (-${rienSi1(a)}${choixLettre}) \\times (-${rienSi1(a)}${choixLettre}) $`
          }
          texteCorr += `<br>$${lettreDepuisChiffre(i + 1)}=${b * b} - ${rienSi1(a * b)}${choixLettre} - ${rienSi1(a * b)}${choixLettre} + ${rienSi1(a * a)}${choixLettre}^2$`
          reponse1 = a * a
          reponse2 = -2 * a * b
          reponse3 = b * b
          break
      }
      reponse = reduirePolynomeDegre3(
        0,
        reponse1,
        reponse2,
        reponse3,
        choixLettre,
      )
      texteCorr += `<br>$${lettreDepuisChiffre(i + 1)}=${reponse}$`

      handleAnswers(this, i, { reponse: { value: reponse } })
      if (!context.isAmc) {
        texte += this.interactif
          ? `<br>$${lettreDepuisChiffre(i + 1)} = $` +
            ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBaseAvecVariable,
            )
          : ''
      } else {
        this.autoCorrectionAMC[i] = {
          enonce: '',
          enonceAvant: false,
          options: { multicols: true, barreseparation: true },
          propositions: [
            {
              type: 'AMCOpen',
              propositions: [
                {
                  texte: texteCorr,
                  enonce: texte + '<br>',
                  statut: 4,
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
                    texte: 'valeur de $a$ dans $ax^2+bx+c$',
                    valeur: reponse1,
                    param: {
                      digits: 2,
                      decimals: 0,
                      signe: true,
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
                    texte: 'valeur de $b$ dans $ax^2+bx+c$',
                    valeur: reponse2,
                    param: {
                      digits: 2,
                      decimals: 0,
                      signe: true,
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
                    texte: 'valeur de $c$ dans $ax^2+bx+c$',
                    valeur: reponse3,
                    param: {
                      digits: 2,
                      decimals: 0,
                      signe: true,
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

      if (this.questionJamaisPosee(i, a, b)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte

        // Uniformisation : Mise en place de la réponse attendue en interactif en orange et gras
        const textCorrSplit = texteCorr.split('=')
        let aRemplacer = textCorrSplit[textCorrSplit.length - 1]
        aRemplacer = aRemplacer.replace('$', '')

        texteCorr = ''
        for (let ee = 0; ee < textCorrSplit.length - 1; ee++) {
          texteCorr += textCorrSplit[ee] + '='
        }
        texteCorr += `$ $${miseEnEvidence(aRemplacer)}$`
        // Fin de cette uniformisation
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenuSansNumero(this)
  }
}
