import { amcConvert } from '../../lib/amc/amcBuilders'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { rienSi1 } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { range1 } from '../../lib/outils/nombres'
import { lettreIndiceeDepuisChiffre, sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Réduire une expression littérale'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCOpen'
export const dateDeModifImportante = '04/11/2023'

/**
 * Réduire une expression
 *
 * * ax+bx+c
 * * ax+b+x+c
 * * ax^2+bx+c+dx^2+x
 * * a+x+b+c+dx
 * * ax+y+bx+c+dy
 * * ax+b-cx
 * @author Rémi Angot
 */
export const uuid = '85d2d'

export const refs = {
  'fr-fr': ['5N5F', 'BP2AutoI13'],
  'fr-2016': ['5L12', 'BP2AutoI13'],
  'fr-ch': ['10LCFA4D-1', '10LSFA4D-1', 'PRQAL03A-2'],
}
export default class ReduireUneExpressionLitterale extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Valeur maximale des coefficients (sup. à 1)',
      999,
    ]
    this.besoinFormulaire2CaseACocher = ['Avec des nombres décimaux']
    this.nbQuestions = 5

    this.sup = 9 // valeur maximale des coefficients
    this.sup2 = false // avec des nombres décimaux
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions === 1
        ? "Réduire l'expression suivante."
        : 'Réduire les expressions suivantes.'

    const typesDeQuestionsDisponibles = range1(7)
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posées mais l'ordre diffère à chaque "cycle"
    const variables = ['x', 'y', 'z', 'a', 'b', 'c']

    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      let a, b, c, d
      this.sup = Math.max(this.sup, 2)
      const choixLettre = randint(0, variables.length - 1)
      const inc = variables[choixLettre]
      const inc2 = variables[randint(0, variables.length - 1, choixLettre)]
      if (this.sup2) {
        a = randint(2, this.sup) + randint(1, 9) / 10
        b = choice([
          randint(2, 9) + randint(1, 9) / 10,
          randint(2, 9) + randint(1, 9) / 10 + randint(1, 9) / 100,
        ])
        c = randint(2, this.sup) + randint(1, 9) / 10
        d = choice([
          randint(2, 9) + randint(1, 9) / 10,
          randint(2, 9) + randint(1, 9) / 10 + randint(1, 9) / 100,
        ])
      } else {
        a = randint(2, this.sup)
        b = randint(2, this.sup)
        c = randint(2, this.sup)
        d = randint(2, this.sup)
      }
      let reponse = ''
      switch (listeTypeDeQuestions[i]) {
        case 1: // ax+bx+c
          texte = `$${lettreIndiceeDepuisChiffre(i + 1)}=${texNombre(a, 1)}${inc}+${texNombre(b, 1)}${inc}+${texNombre(c, 1)}$`
          texteCorr = `$${lettreIndiceeDepuisChiffre(i + 1)}=${texNombre(a, 1)}${inc}+${texNombre(b, 1)}${inc}+${texNombre(c, 1)}=`
          reponse = `${texNombre(a + b, 1)}${inc}+${texNombre(c, 1)}`
          break
        case 2: // ax+b+x+c
          texte = `$${lettreIndiceeDepuisChiffre(i + 1)}=${texNombre(a, 1)}${inc}+${texNombre(b, 1)}+${inc}+${texNombre(c, 1)}$`
          texteCorr = `$${lettreIndiceeDepuisChiffre(i + 1)}=${texNombre(a, 1)}${inc}+${texNombre(b, 1)}+${inc}+${texNombre(c, 1)}=`
          reponse = `${texNombre(a + 1, 1)}${inc}+${texNombre(b + c, 1)}`
          break
        case 3: // ax^2+bx+c+dx^2+x
          texte = `$${lettreIndiceeDepuisChiffre(i + 1)}=${texNombre(a, 1)}${inc}^2+${texNombre(b, 1)}${inc}+${texNombre(c, 1)}+${texNombre(d, 1)}${inc}^2+${inc}$`
          texteCorr = `$${lettreIndiceeDepuisChiffre(i + 1)}=${texNombre(a, 1)}${inc}^2+${texNombre(b, 1)}${inc}+${texNombre(c, 1)}+${texNombre(d, 1)}${inc}^2+${inc}=`
          reponse = `${texNombre(a + d, 1)}${inc}^2+${texNombre(b + 1, 1)}${inc}+${texNombre(c, 1)}`
          break
        case 4: // a+x+b+c+dx
          texte = `$${lettreIndiceeDepuisChiffre(i + 1)}=${texNombre(a, 1)}+${inc}+${texNombre(b, 1)}+${texNombre(c, 1)}+${texNombre(d, 1)}${inc}$`
          texteCorr = `$${lettreIndiceeDepuisChiffre(i + 1)}=${texNombre(a, 1)}+${inc}+${texNombre(b, 1)}+${texNombre(c, 1)}+${texNombre(d, 1)}${inc}=`
          reponse = `${texNombre(1 + d, 1)}${inc}+${texNombre(a + b + c, 1)}`
          break
        case 5: // ax+y+bx+c+dy
          texte = `$${lettreIndiceeDepuisChiffre(i + 1)}=${texNombre(a, 1)}${inc}+${inc2}+${texNombre(b, 1)}${inc}+${texNombre(c, 1)}+${texNombre(d, 1)}${inc2}$`
          texteCorr = `$${lettreIndiceeDepuisChiffre(i + 1)}=${texNombre(a, 1)}${inc}+${inc2}+${texNombre(b, 1)}${inc}+${texNombre(c, 1)}+${texNombre(d, 1)}${inc2}=`
          reponse = `${texNombre(a + b, 1)}${inc}+${texNombre(1 + d, 1)}${inc2}+${texNombre(c, 1)}`
          break
        case 6: // ax+b-cx
          if (c > a) {
            ;[a, c] = [c, a] // pour s'assurer que a-c est positif
          } else if (c === a) {
            a++
          }
          texte = `$${lettreIndiceeDepuisChiffre(i + 1)}=${texNombre(a, 1)}${inc}+${texNombre(b, 1)}-${texNombre(c, 1)}${inc}$`
          texteCorr = `$${lettreIndiceeDepuisChiffre(i + 1)}=${texNombre(a, 1)}${inc}+${texNombre(b, 1)}-${texNombre(c, 1)}${inc}=`
          reponse = `${rienSi1(a - c)}${inc}+${texNombre(b, 1)}`
          break
        case 7: // ax-cx
        default:
          if (c > a) {
            ;[a, c] = [c, a] // pour s'assurer que a-c est positif
          } else if (c === a) {
            a++
          }
          texte = `$${lettreIndiceeDepuisChiffre(i + 1)}=${texNombre(a, 1)}${inc}-${texNombre(c, 1)}${inc}$`
          texteCorr = `$${lettreIndiceeDepuisChiffre(i + 1)}=${texNombre(a, 1)}${inc}-${texNombre(c, 1)}${inc}=`
          reponse = `${rienSi1(a - c)}${inc}`
          break
      }
      texteCorr += `${sp()}${miseEnEvidence(reponse)}$`
      texte += ajouteChampTexteMathLive(this, i, KeyboardType.lyceeClassique, {
        texteAvant: `$${sp()} = $`,
      })
      handleAnswers(this, i, {
        reponse: {
          value: reponse,
          options: { expressionsForcementReduites: true },
        },
      })
      if (this.questionJamaisPosee(i, a, b, c, d)) {
        // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr

        if (context.isAmc) {
          this.autoCorrectionAMC[i] = {
            enonce: "Réduire l'expression " + texte + '.',
            propositions: [
              {
                texte: texteCorr,
                statut: 1, // OBLIGATOIRE (ici c'est le nombre de lignes du cadre pour la réponse de l'élève sur AMC)
                sanscadre: false, // EE : ce champ est facultatif et permet (si true) de cacher le cadre et les lignes acceptant la réponse de l'élève
                pointilles: false, // EE : ce champ est facultatif et permet (si false) d'enlever les pointillés sur chaque ligne.
              },
            ],
          }
          this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        }
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
