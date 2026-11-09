import { amcConvert } from '../../lib/amc/amcBuilders'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
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

export const titre = "Supprimer les parenthèses puis réduire l'expression"
export const interactifReady = true

export const amcType = 'AMCHybride'
export const amcReady = true

/**
 * Donner l'opposé d'une expression.
 *
 * Ajout des différents cas de 4 à 10 par Mickael Guironnet
 * @author Rémi Angot (AMC par Éric Elter)
 */
export const uuid = '603a8'

export const refs = {
  'fr-fr': ['3L10'],
  'fr-ch': ['10LCFA4F-1', '10LSFA4F-1', '11CTFA3E-5', '11LCFA3E-8', '11LSFA3E-8', 'PRQAL03C-7'],
}
export default class OpposeExpression extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Types de questions',
      `Nombres séparés par des tirets
1 : -(ax+b)
2 : (ax+b)
3 : -(ax2+bx+c)
4 : (ax2+bx+c)
5 : (ax+b)-(cx+d)
6 : -(ax+b)+(cx+d)
7 : (ax+b)-(cx2+dx+e)
8 : -(ax+b)+(cx2+dx+e)
9 : (ax2+bx+c)-(dx2+ex+f)
10 : -(ax2+bx+c)+(dx2+ex+f)
11 : Mélange`,
    ]
    this.spacing = context.isHtml ? 3 : 2
    this.spacing = context.isHtml ? 3 : 2
    this.nbQuestions = 6
    this.sup = '1-2-3-4'

    this.listeAvecNumerotation = false
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions > 1
        ? 'Supprimer les parenthèses et réduire les expressions suivantes.'
        : "Supprimer les parenthèses et réduire l'expression suivante."

    const lettresPossibles = ['a', 'b', 'c', 'x', 'y', 'z']

    let listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: 10,
      defaut: 2,
      melange: 11,
      nbQuestions: this.nbQuestions,
    })

    listeTypeDeQuestions = combinaisonListes(
      listeTypeDeQuestions,
      this.nbQuestions,
    )
    for (
      let i = 0, a, b, c, d, e, f, choixLettre, cpt = 0;
      i < this.nbQuestions && cpt < 50;
      cpt++
    ) {
      let texte = ''
      let texteCorr = ''
      let reponse = ''
      let reponse1 = 0
      let reponse2 = 0
      let reponse3 = 0
      a = randint(-9, 9, 0)
      b = randint(-9, 9, 0)
      c = randint(-11, 11, 0)
      d = randint(-11, 11, 0)
      e = randint(-11, 11, 0)
      f = randint(-11, 11, 0)
      choixLettre = choice(lettresPossibles)

      switch (listeTypeDeQuestions[i]) {
        case 1: // '-(ax+b)':
          texte = `$${lettreDepuisChiffre(i + 1)}=-(${rienSi1(a)}${choixLettre}${ecritureAlgebrique(b)})$`
          texteCorr = texte
          reponse1 = 0
          reponse2 = -a
          reponse3 = -b
          break
        case 2: // '(ax+b)':
          texte = `$${lettreDepuisChiffre(i + 1)}=(${rienSi1(a)}${choixLettre}${ecritureAlgebrique(b)})$`
          texteCorr = texte
          reponse1 = 0
          reponse2 = a
          reponse3 = b
          break
        case 3: // '-(ax2+bx+c)':
          texte = `$${lettreDepuisChiffre(i + 1)}=-(${rienSi1(a)}${choixLettre}^2${ecritureAlgebriqueSauf1(b)}${choixLettre}${ecritureAlgebrique(c)})$`
          texteCorr = texte
          reponse1 = -a
          reponse2 = -b
          reponse3 = -c
          break
        case 4: // '(ax2+bx+c)':
          texte = `$${lettreDepuisChiffre(i + 1)}=(${rienSi1(a)}${choixLettre}^2${ecritureAlgebriqueSauf1(b)}${choixLettre}${ecritureAlgebrique(c)})$`
          texteCorr = texte
          reponse1 = a
          reponse2 = b
          reponse3 = c
          break
        case 5: // '(ax+b)-(cx+d)':
          texte = `$${lettreDepuisChiffre(i + 1)}= (${rienSi1(a)}${choixLettre}${ecritureAlgebrique(b)}) - (${rienSi1(c)}${choixLettre}${ecritureAlgebrique(d)})$`
          texteCorr = texte
          texteCorr += `<br>$${lettreDepuisChiffre(i + 1)}= ${rienSi1(a)}${choixLettre}${ecritureAlgebrique(b)}${ecritureAlgebriqueSauf1(-c)}${choixLettre}${ecritureAlgebrique(-d)}$`
          reponse1 = 0
          reponse2 = a - c
          reponse3 = b - d
          break
        case 6: // '-(ax+b)+(cx+d)':
          texte = `$${lettreDepuisChiffre(i + 1)}= -(${rienSi1(a)}${choixLettre}${ecritureAlgebrique(b)}) + (${rienSi1(c)}${choixLettre}${ecritureAlgebrique(d)})$`
          texteCorr = texte
          texteCorr += `<br>$${lettreDepuisChiffre(i + 1)}= ${rienSi1(-a)}${choixLettre}${ecritureAlgebrique(-b)}${ecritureAlgebriqueSauf1(c)}${choixLettre}${ecritureAlgebrique(d)}$`
          reponse1 = 0
          reponse2 = c - a
          reponse3 = d - b
          break
        case 7: // '(ax+b)-(cx2+dx+e)':
          texte = `$${lettreDepuisChiffre(i + 1)}= (${rienSi1(a)}${choixLettre}${ecritureAlgebrique(b)}) - (${rienSi1(c)}${choixLettre}^2${ecritureAlgebriqueSauf1(d)}${choixLettre}${ecritureAlgebrique(e)})$`
          texteCorr = texte
          texteCorr += `<br>$${lettreDepuisChiffre(i + 1)}= ${rienSi1(a)}${choixLettre}${ecritureAlgebrique(b)} ${ecritureAlgebriqueSauf1(-c)}${choixLettre}^2${ecritureAlgebriqueSauf1(-d)}${choixLettre}${ecritureAlgebrique(-e)}$`
          reponse1 = -c
          reponse2 = a - d
          reponse3 = b - e
          break
        case 8: // '-(ax+b)+(cx2+dx+e)':
          texte = `$${lettreDepuisChiffre(i + 1)}= -(${rienSi1(a)}${choixLettre}${ecritureAlgebrique(b)}) + (${rienSi1(c)}${choixLettre}^2${ecritureAlgebriqueSauf1(d)}${choixLettre}${ecritureAlgebrique(e)})$`
          texteCorr = texte
          texteCorr += `<br>$${lettreDepuisChiffre(i + 1)}= ${rienSi1(-a)}${choixLettre}${ecritureAlgebrique(-b)} ${ecritureAlgebriqueSauf1(c)}${choixLettre}^2${ecritureAlgebriqueSauf1(d)}${choixLettre}${ecritureAlgebrique(e)}$`
          reponse1 = c
          reponse2 = -a + d
          reponse3 = -b + e
          break
        case 9: // '(ax2+bx+c)-(dx2+ex+f)'
          texte = `$${lettreDepuisChiffre(i + 1)}= (${rienSi1(a)}${choixLettre}^2${ecritureAlgebriqueSauf1(b)}${choixLettre}${ecritureAlgebrique(c)}) - (${rienSi1(d)}${choixLettre}^2${ecritureAlgebriqueSauf1(e)}${choixLettre}${ecritureAlgebrique(f)})$`
          texteCorr = texte
          texteCorr += `<br>$${lettreDepuisChiffre(i + 1)}= ${rienSi1(a)}${choixLettre}^2${ecritureAlgebriqueSauf1(b)}${choixLettre}${ecritureAlgebrique(c)}${ecritureAlgebriqueSauf1(-d)}${choixLettre}^2${ecritureAlgebriqueSauf1(-e)}${choixLettre}${ecritureAlgebrique(-f)}$`
          reponse1 = a - d
          reponse2 = b - e
          reponse3 = c - f
          break
        case 10: // '-(ax2+bx+c)+(dx2+ex+f)'
          texte = `$${lettreDepuisChiffre(i + 1)}= -(${rienSi1(a)}${choixLettre}^2${ecritureAlgebriqueSauf1(b)}${choixLettre}${ecritureAlgebrique(c)}) + (${rienSi1(d)}${choixLettre}^2${ecritureAlgebriqueSauf1(e)}${choixLettre}${ecritureAlgebrique(f)})$`
          texteCorr = texte
          texteCorr += `<br>$${lettreDepuisChiffre(i + 1)}= ${rienSi1(-a)}${choixLettre}^2${ecritureAlgebriqueSauf1(-b)}${choixLettre}${ecritureAlgebrique(-c)} ${ecritureAlgebriqueSauf1(d)}${choixLettre}^2${ecritureAlgebriqueSauf1(e)}${choixLettre}${ecritureAlgebrique(f)}$`
          reponse1 = -a + d
          reponse2 = -b + e
          reponse3 = -c + f
          break
      }
      texteCorr += `<br>$${lettreDepuisChiffre(i + 1)}=${reduirePolynomeDegre3(0, reponse1, reponse2, reponse3, choixLettre)}$`
      reponse = `${reduirePolynomeDegre3(0, reponse1, reponse2, reponse3, choixLettre)}`

      // Uniformisation : Mise en place de la réponse attendue en interactif en orange et gras
      const textCorrSplit = texteCorr.split('=')
      let aRemplacer = textCorrSplit[textCorrSplit.length - 1]
      aRemplacer = aRemplacer.replace('$', '').replace('<br>', '')

      texteCorr = ''
      for (let ee = 0; ee < textCorrSplit.length - 1; ee++) {
        texteCorr += textCorrSplit[ee] + '='
      }
      texteCorr += `$ $${miseEnEvidence(aRemplacer)}$`
      // Fin de cette uniformisation

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
                    texte: `valeur de $m$ dans $m${choixLettre}^2+n${choixLettre}+p$`,
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
                    texte: `valeur de $n$ dans $m${choixLettre}^2+n${choixLettre}+p$`,
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
                    texte: `valeur de $p$ dans $m${choixLettre}^2+n${choixLettre}+p$`,
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
      if (this.listeQuestions.indexOf(texte) === -1) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }
    listeQuestionsToContenuSansNumero(this)
  }
}
