import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'

import { amcConvert } from '../../lib/amc/amcBuilders'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  reduireAxPlusB,
  reduirePolynomeDegre3,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenuSansNumero,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Utiliser la distributivité (simple ou double) et réduire'
export const interactifReady = true

export const amcType = 'AMCHybride'
export const amcReady = true

/**
 * Utiliser la simple ou la double distributivité et réduire l'expression
 *
 * @author Rémi Angot (Amélioration AMC par Éric Elter)
 */
export const uuid = '82313'

export const refs = {
  'fr-fr': ['3L11-3', 'BP2AutoI11'],
  'fr-ch': ['1mCL1-9', '11LCFA3F-7', '11LSFA3F-7', 'PRQAL03D-5'],
}
export default class DistributiviteSimpleDoubleReduction extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 5
    this.spacing = context.isHtml ? 3 : 2
    this.spacingCorr = context.isHtml ? 3 : 2
    this.sup = '1-2-3-4-5-6'
    this.besoinFormulaireTexte = [
      "Type d'expressions",
      [
        'Nombres séparés par des tirets :',
        '1 : cx + e(ax + b)',
        '2 : ex + (ax + b)(cx + d)',
        '3 : e + (ax + b)(cx + d)',
        '4 : e - (ax + b)(cx + d)',
        '5 : (ax × b)(cx + d)',
        '6 : e(ax + b) - (d + cx)',
        '7 : k(ax + b)(cx + d)',
        '0 : Mélange',
      ].join('\n'),
    ]
    this.listeAvecNumerotation = false
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions > 1
        ? 'Développer et réduire les expressions suivantes.'
        : "Développer et réduire l'expression suivante."

    const typesDeQuestionsDisponibles = [
      'cx+e(ax+b)',
      'ex+(ax+b)(cx+d)',
      'e+(ax+b)(cx+d)',
      'e-(ax+b)(cx+d)',
      '(ax*b)(cx+d)',
      'e(ax+b)-(d+cx)',
      'k(ax+b)(cx+d)',
    ]
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 7,
      melange: 0,
      defaut: 0,
      nbQuestions: this.nbQuestions,
      listeOfCase: typesDeQuestionsDisponibles,
    }) as string[]
    for (
      let i = 0,
        texte,
        texteCorr,
        reponse,
        coeffa,
        coeffb,
        coeffc,
        a,
        b,
        c,
        d,
        e,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      a = randint(-11, 11, 0)
      b = randint(-11, 11, 0)
      c = randint(-11, 11, 0)
      d = randint(-11, 11, 0)
      e = randint(-11, 11, 0)
      texte = ''
      texteCorr = ''
      reponse = ''
      switch (listeTypeDeQuestions[i]) {
        case 'cx+e(ax+b)':
          texte = `$${lettreDepuisChiffre(i + 1)}=${rienSi1(c)}x${ecritureAlgebriqueSauf1(e)}(${rienSi1(a)}x${ecritureAlgebrique(b)})$`
          texteCorr = texte
          texteCorr += `<br>$\\phantom{${lettreDepuisChiffre(i + 1)}}=${rienSi1(c)}x${ecritureAlgebriqueSauf1(e * a)}x${ecritureAlgebrique(e * b)}$`
          texteCorr += `<br>$\\phantom{${lettreDepuisChiffre(i + 1)}}=${rienSi1(c + e * a)}x${ecritureAlgebrique(e * b)}$`
          reponse = reduireAxPlusB(c + e * a, e * b, 'x')
          coeffa = 0
          coeffb = c + e * a
          coeffc = e * b
          break
        case 'ex+(ax+b)(cx+d)':
          texte = `$${lettreDepuisChiffre(i + 1)}=${rienSi1(e)}x+(${rienSi1(a)}x${ecritureAlgebrique(b)})(${rienSi1(c)}x${ecritureAlgebrique(d)})$`
          texteCorr = texte
          texteCorr += `<br>$\\phantom{${lettreDepuisChiffre(i + 1)}}=${rienSi1(e)}x${ecritureAlgebriqueSauf1(a * c)}x^2${ecritureAlgebriqueSauf1(a * d)}x${ecritureAlgebriqueSauf1(b * c)}x${ecritureAlgebrique(b * d)}$`
          texteCorr += `<br>$\\phantom{${lettreDepuisChiffre(i + 1)}}=${rienSi1(a * c)}x^2${ecritureAlgebriqueSauf1(e + b * c + a * d)}x${ecritureAlgebrique(b * d)}$`
          reponse = reduirePolynomeDegre3(
            0,
            a * c,
            e + b * c + a * d,
            b * d,
            'x',
          )
          coeffa = a * c
          coeffb = e + b * c + a * d
          coeffc = b * d
          break
        case 'e+(ax+b)(cx+d)':
          texte = `$${lettreDepuisChiffre(i + 1)}=${e}+(${rienSi1(a)}x${ecritureAlgebrique(b)})(${rienSi1(c)}x${ecritureAlgebrique(d)})$`
          texteCorr = texte
          texteCorr += `<br>$\\phantom{${lettreDepuisChiffre(i + 1)}}=${e}${ecritureAlgebriqueSauf1(a * c)}x^2${ecritureAlgebriqueSauf1(a * d)}x${ecritureAlgebriqueSauf1(b * c)}x${ecritureAlgebrique(b * d)}$`
          texteCorr += `<br>$\\phantom{${lettreDepuisChiffre(i + 1)}}=${rienSi1(a * c)}x^2${ecritureAlgebriqueSauf1(b * c + a * d)}x${ecritureAlgebrique(e + b * d)}$`
          reponse = reduirePolynomeDegre3(
            0,
            a * c,
            b * c + a * d,
            e + b * d,
            'x',
          )
          coeffa = a * c
          coeffb = b * c + a * d
          coeffc = e + b * d
          break
        case 'e-(ax+b)(cx+d)':
          texte = `$${lettreDepuisChiffre(i + 1)}=${e}-(${rienSi1(a)}x${ecritureAlgebrique(b)})(${rienSi1(c)}x${ecritureAlgebrique(d)})$`
          texteCorr = texte
          texteCorr += `<br>$\\phantom{${lettreDepuisChiffre(i + 1)}}=${e}-(${rienSi1(a * c)}x^2${ecritureAlgebriqueSauf1(a * d)}x${ecritureAlgebriqueSauf1(b * c)}x${ecritureAlgebrique(b * d)})$`
          texteCorr += `<br>$\\phantom{${lettreDepuisChiffre(i + 1)}}=${e}${ecritureAlgebriqueSauf1(-1 * a * c)}x^2${ecritureAlgebriqueSauf1(-1 * a * d)}x${ecritureAlgebriqueSauf1(-1 * b * c)}x${ecritureAlgebrique(-1 * b * d)}$`
          texteCorr += `<br>$\\phantom{${lettreDepuisChiffre(i + 1)}}=${rienSi1(-1 * a * c)}x^2${ecritureAlgebriqueSauf1(-1 * b * c - a * d)}x${ecritureAlgebrique(e - b * d)}$`
          reponse = reduirePolynomeDegre3(
            0,
            -1 * a * c,
            -1 * b * c - a * d,
            e - b * d,
            'x',
          )
          coeffa = -1 * a * c
          coeffb = -1 * b * c - a * d
          coeffc = e - b * d

          break
        case '(ax*b)(cx+d)':
          a = randint(-3, 3, [0])
          b = randint(2, 3)
          texte = `$${lettreDepuisChiffre(i + 1)}=(${rienSi1(a)}x\\times${b})(${rienSi1(c)}x${ecritureAlgebrique(d)})$`
          texteCorr = texte
          texteCorr += `<br>$\\phantom{${lettreDepuisChiffre(i + 1)}}=${rienSi1(a * b)}x\\times(${rienSi1(c)}x${ecritureAlgebrique(d)})$`
          texteCorr += `<br>$\\phantom{${lettreDepuisChiffre(i + 1)}}=${rienSi1(a * b * c)}x^2${ecritureAlgebriqueSauf1(a * b * d)}x$`
          reponse = reduirePolynomeDegre3(0, a * b * c, a * b * d, 0, 'x')
          coeffa = a * b * c
          coeffb = a * b * d
          coeffc = 0
          break
        case 'k(ax+b)(cx+d)':
          e = randint(-3, 3, [-1, 0, 1]) // k
          texte = `$${lettreDepuisChiffre(i + 1)}=${e}(${rienSi1(a)}x${ecritureAlgebrique(b)})(${rienSi1(c)}x${ecritureAlgebrique(d)})$`
          texteCorr = texte
          texteCorr += `<br>$\\phantom{${lettreDepuisChiffre(i + 1)}}=${e}(${rienSi1(a * c)}x^2${ecritureAlgebriqueSauf1(a * d)}x${ecritureAlgebriqueSauf1(b * c)}x${ecritureAlgebrique(b * d)})$`
          texteCorr += `<br>$\\phantom{${lettreDepuisChiffre(i + 1)}}=${e}(${rienSi1(a * c)}x^2${ecritureAlgebriqueSauf1(a * d + b * c)}x${ecritureAlgebrique(b * d)})$`
          texteCorr += `<br>$\\phantom{${lettreDepuisChiffre(i + 1)}}=${rienSi1(e * a * c)}x^2${ecritureAlgebriqueSauf1(e * (a * d + b * c))}x${ecritureAlgebrique(e * b * d)}$`
          reponse = reduirePolynomeDegre3(
            0,
            e * a * c,
            e * (a * d + b * c),
            e * b * d,
            'x',
          )
          coeffa = e * a * c
          coeffb = e * (a * d + b * c)
          coeffc = e * b * d
          break
        case 'e(ax+b)-(d+cx)':
          e = randint(-11, 11, [-1, 1, 0])
          texte = `$${lettreDepuisChiffre(i + 1)}=${e}(${rienSi1(a)}x${ecritureAlgebrique(b)})-(${d}${ecritureAlgebriqueSauf1(c)}x)$`
          texteCorr = texte
          texteCorr += `<br>$\\phantom{${lettreDepuisChiffre(i + 1)}}=${rienSi1(e * a)}x${ecritureAlgebrique(e * b)}-(${d}${ecritureAlgebriqueSauf1(c)}x)$`
          texteCorr += `<br>$\\phantom{${lettreDepuisChiffre(i + 1)}}=${rienSi1(e * a)}x${ecritureAlgebrique(e * b)}${ecritureAlgebrique(-d)}${ecritureAlgebriqueSauf1(-c)}x$`
          texteCorr += `<br>$\\phantom{${lettreDepuisChiffre(i + 1)}}=${rienSi1(e * a - c)}x${ecritureAlgebrique(e * b - d)}$`
          reponse = reduireAxPlusB(e * a - c, e * b - d, 'x')
          coeffa = 0
          coeffb = e * a - c
          coeffc = e * b - d
          break
      }
      if (!context.isAmc && this.interactif) {
        handleAnswers(this, i, { reponse: { value: reponse } })
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
                    valeur: coeffa,
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
                    valeur: coeffb,
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
                    valeur: coeffc,
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
      if (this.questionJamaisPosee(i, a, b, c, d, e)) {
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
