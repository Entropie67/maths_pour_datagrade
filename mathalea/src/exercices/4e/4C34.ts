import { amcConvert } from '../../lib/amc/amcBuilders'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  nombreDeChiffresDansLaPartieEntiere,
  range1,
} from '../../lib/outils/nombres'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenuSansNumero,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'

export const titre =
  'Calculer en utilisant les priorités opératoires et les puissances'
export const dateDePublication = '23/01/2023'
export const dateDeModifImportante = '17/09/2023'

/**
 * Plusieurs types de calcul avec priorités opératoires/ relatifs/ puissances
 * modifié le 17/09/2023 pour permettre les cubes a la place des carrés
 * Sans parenthèses :
 * * a²+b*c
 * * a+b²*c
 * * a²+b+c*d
 *
 * * a²*b+c
 * * a*b²+c
 * * a²+b+c
 * * a+b²+c
 * * a+b+c²
 * * a+b²+c*d
 * * a+b+c²*d
 * * a+b+c*d²
 * * a²*b+c*d
 * * a*b+c*d²
 *
 * Avec parenthèses :
 * * a²*(b+c)
 * * a*(b²+c*d)
 * * (a+b+c²)*d
 * * d²(a+b+c)
 *
 * * a*(b²+c)
 * * a*(b+c²)
 * * (a²+b)*c
 * * (a+b²)*c
 * * (a+b)*c²
 * * a²*(b+c)*d
 * * a*(b²+c)*d
 * * a*(b+c²)*d
 * * a*(b+c)*d²
 * * a²*b*(c+d)
 * * a*b²*(c+d)
 * * a*b*(c²+d)
 * * a*b*(c+d²)
 * * a²*(b+c*d)
 * * a*(b+c²*d)
 * * a*(b+c*d²)
 * * a²+(b+c)
 * * a+(b²+c)
 * * a+(b+c²)
 * * (a²+b+c)*d
 * * (a+b²+c)*d
 * @author Mireille Gain
 * Ajout de l'interactivité par Guillaume Valmont le 2021-11-20
 */
export const uuid = '2d79c'

export const refs = {
  'fr-fr': ['4C34'],
  'fr-ch': ['10LCNO4A-7', '10LSNO4A-7', '9R1NO5A-7', '9R2NO5A-7', '9R3NO5A-7', 'PRQNO13B-5'],
}
export default class PrioritesEtRelatifsEtPuissances extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = [
      'AMC : Que la réponse numérique (pas de question ouverte)',
      false,
    ]
    this.besoinFormulaire2Texte = [
      'Type de puissance',
      'Nombres séparés par des tirets : \n1 : Carrés \n2 : Cubes\n3 : Mélange',
    ]
    this.besoinFormulaire3CaseACocher = ['Uniquement des nombres positifs']
    this.sup3 = false
    this.consigne = 'Calculer.'
    this.nbQuestions = 5

    this.video = 'https://youtu.be/0G9xWLl-0zg' // Id YouTube ou url
    this.spacing = context.isHtml ? 3 : 1
    this.spacingCorr = context.isHtml ? 3 : 1
    this.listeAvecNumerotation = false
    this.sup = false
    this.sup2 = '1'
  }

  nouvelleVersion() {
    if (this.sup) this.amcType = 'AMCNum'
    let reponse

    const listeQuestionsDisponibles = range1(7)

    const listeTypeDeQuestions = combinaisonListes(
      listeQuestionsDisponibles,
      this.nbQuestions,
    )
    const typeDePuissances = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: 2,
      melange: 3,
      defaut: 1,
      listeOfCase: ['Carre', 'Cube'],
      shuffle: true,
      nbQuestions: this.nbQuestions,
    })
    for (
      let i = 0, texte, texteCorr, a, b, c, d, m, n, p, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      a = typeDePuissances[i] === 'Carre' ? randint(2, 7) : randint(2, 5)
      b = randint(1, 7)
      c = randint(1, 7)
      d = randint(1, 7)
      m = randint(2, 5)
      n = randint(2, 3)
      if (!this.sup3) {
        a *= choice([-1, 1])
        b *= choice([-1, 1])
        c *= choice([-1, 1])
        d *= choice([-1, 1])
        m *= choice([-1, 1])
        n *= choice([-1, 1])
      }
      p = randint(2, 3)
      this.autoCorrectionAMC[i] = {}
      this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      switch (listeTypeDeQuestions[i]) {
        case 1: // a² + b*c
          texte = `$${lettreDepuisChiffre(i + 1)} = ${ecritureParentheseSiNegatif(a)}${affichePuissance(typeDePuissances[i])} +  ${ecritureParentheseSiNegatif(b)} \\times ${ecritureParentheseSiNegatif(c)}$`
          texteCorr = `$${lettreDepuisChiffre(i + 1)}=${miseEnEvidence(ecritureParentheseSiNegatif(a) + affichePuissance(typeDePuissances[i]), bleuMathalea)}  +  ${ecritureParentheseSiNegatif(b)} \\times ${ecritureParentheseSiNegatif(c)}$`

          texteCorr +=
            '<br>' +
            `$${lettreDepuisChiffre(i + 1)}=${calculPuissance(a, typeDePuissances[i])} + ${miseEnEvidence(ecritureParentheseSiNegatif(b) + '\\times' + ecritureParentheseSiNegatif(c), bleuMathalea)}$`
          texteCorr +=
            '<br>' +
            `$${lettreDepuisChiffre(i + 1)}=${calculPuissance(a, typeDePuissances[i])} ${ecritureAlgebrique(b * c)}$`
          texteCorr +=
            '<br>' +
            `$${lettreDepuisChiffre(i + 1)} = ${miseEnEvidence(calculPuissance(a, typeDePuissances[i]) + b * c)}$`

          reponse = calculPuissance(a, typeDePuissances[i]) + b * c
          break

        case 2: // a + b²*c
          texte = `$${lettreDepuisChiffre(i + 1)} = ${a} + ${ecritureParentheseSiNegatif(p)}${affichePuissance(typeDePuissances[i])} \\times ${ecritureParentheseSiNegatif(c)}$`
          texteCorr = `$${lettreDepuisChiffre(i + 1)}          =${a} + ${miseEnEvidence(ecritureParentheseSiNegatif(p) + affichePuissance(typeDePuissances[i]), bleuMathalea)} \\times ${ecritureParentheseSiNegatif(c)}$`
          texteCorr +=
            '<br>' +
            `$${lettreDepuisChiffre(i + 1)}=${a} + ${miseEnEvidence(ecritureParentheseSiNegatif(calculPuissance(p, typeDePuissances[i])) + '\\times' + ecritureParentheseSiNegatif(c), bleuMathalea)}$`
          texteCorr +=
            '<br>' +
            `$${lettreDepuisChiffre(i + 1)}=${a + ecritureAlgebrique(calculPuissance(p, typeDePuissances[i]) * c)}$`
          texteCorr +=
            '<br>' +
            `$${lettreDepuisChiffre(i + 1)} = ${miseEnEvidence(a + calculPuissance(p, typeDePuissances[i]) * c)}$`
          reponse = a + calculPuissance(p, typeDePuissances[i]) * c
          break

        case 3: // a²+b+c*d
          texte = `$${lettreDepuisChiffre(i + 1)} = ${ecritureParentheseSiNegatif(a)}${affichePuissance(typeDePuissances[i])}   ${ecritureAlgebrique(b)} ${ecritureAlgebrique(c)} \\times ${ecritureParentheseSiNegatif(d)}$`
          texteCorr = `$${lettreDepuisChiffre(i + 1)}        =${miseEnEvidence(ecritureParentheseSiNegatif(a) + affichePuissance(typeDePuissances[i]), bleuMathalea)} ${ecritureAlgebrique(b)}  ${ecritureAlgebrique(c)} \\times ${ecritureParentheseSiNegatif(d)}$`
          texteCorr +=
            '<br>' +
            `$${lettreDepuisChiffre(i + 1)}=${calculPuissance(a, typeDePuissances[i])} ${ecritureAlgebrique(b)} +  ${miseEnEvidence(ecritureParentheseSiNegatif(c) + '\\times' + ecritureParentheseSiNegatif(d), bleuMathalea)}$`
          texteCorr +=
            '<br>' +
            `$${lettreDepuisChiffre(i + 1)}=${calculPuissance(a, typeDePuissances[i]) + ecritureAlgebrique(b) + ecritureAlgebrique(c * d)}$`
          texteCorr +=
            '<br>' +
            `$${lettreDepuisChiffre(i + 1)} = ${miseEnEvidence(calculPuissance(a, typeDePuissances[i]) + b + c * d)}$`
          reponse = calculPuissance(a, typeDePuissances[i]) + b + c * d
          break

        case 4: // n²*(b+c)
          texte = `$${lettreDepuisChiffre(i + 1)} = ${ecritureParentheseSiNegatif(n)}${affichePuissance(typeDePuissances[i])} \\times ( ${b + ecritureAlgebrique(c)})$`
          texteCorr = `$${lettreDepuisChiffre(i + 1)}          =${miseEnEvidence(ecritureParentheseSiNegatif(n) + affichePuissance(typeDePuissances[i]), bleuMathalea)}  \\times ( ${b + ecritureAlgebrique(c)})$`
          texteCorr +=
            '<br>' +
            `$${lettreDepuisChiffre(i + 1)}=${calculPuissance(n, typeDePuissances[i])} \\times ( ${miseEnEvidence(b + ecritureAlgebrique(c), bleuMathalea)})$`
          texteCorr +=
            '<br>' +
            `$${lettreDepuisChiffre(i + 1)}=${calculPuissance(n, typeDePuissances[i])} \\times ${ecritureParentheseSiNegatif(b + c)}$`
          texteCorr +=
            '<br>' +
            `$${lettreDepuisChiffre(i + 1)} = ${miseEnEvidence(calculPuissance(n, typeDePuissances[i]) * (b + c))}$`
          reponse = calculPuissance(n, typeDePuissances[i]) * (b + c)
          break

        case 5: // m*(n²+p*n)
          texte = `$${lettreDepuisChiffre(i + 1)} = ${m} \\times ( ${ecritureParentheseSiNegatif(n)}${affichePuissance(typeDePuissances[i])}${ecritureAlgebrique(p)}\\times${ecritureParentheseSiNegatif(n)})$`
          texteCorr = `$${lettreDepuisChiffre(i + 1)}            =${m} \\times ( ${miseEnEvidence(ecritureParentheseSiNegatif(n) + affichePuissance(typeDePuissances[i]), bleuMathalea)} ${ecritureAlgebrique(p)}\\times${ecritureParentheseSiNegatif(n)})$`
          texteCorr +=
            '<br>' +
            `$${lettreDepuisChiffre(i + 1)}=${m} \\times ( ${calculPuissance(n, typeDePuissances[i])} + ${miseEnEvidence(ecritureParentheseSiNegatif(p) + '\\times' + ecritureParentheseSiNegatif(n), bleuMathalea)})$`
          texteCorr +=
            '<br>' +
            `$${lettreDepuisChiffre(i + 1)}=${m}\\times ( ${miseEnEvidence(calculPuissance(n, typeDePuissances[i]) + ecritureAlgebrique(p * n), bleuMathalea)})$`
          texteCorr +=
            '<br>' +
            `$${lettreDepuisChiffre(i + 1)}=${m}\\times ${ecritureParentheseSiNegatif(calculPuissance(n, typeDePuissances[i]) + p * n)}$`
          texteCorr +=
            '<br>' +
            `$${lettreDepuisChiffre(i + 1)} = ${miseEnEvidence(m * (calculPuissance(n, typeDePuissances[i]) + p * n))}$`
          reponse = m * (calculPuissance(n, typeDePuissances[i]) + p * n)
          break

        case 6: // (a+b+n²)*d
          texte = `$${lettreDepuisChiffre(i + 1)} = (${a} ${ecritureAlgebrique(b)} + ${ecritureParentheseSiNegatif(n)}${affichePuissance(typeDePuissances[i])} ) \\times ${ecritureParentheseSiNegatif(d)}$`
          texteCorr = `$${lettreDepuisChiffre(i + 1)}              =(${a} + ${ecritureParentheseSiNegatif(b)} + ${miseEnEvidence(ecritureParentheseSiNegatif(n) + affichePuissance(typeDePuissances[i]), bleuMathalea)}  ) \\times ${ecritureParentheseSiNegatif(d)}$`
          texteCorr +=
            '<br>' +
            `$${lettreDepuisChiffre(i + 1)}=(${miseEnEvidence(a + ecritureAlgebrique(b) + ecritureAlgebrique(calculPuissance(n, typeDePuissances[i])), bleuMathalea)}) \\times ${ecritureParentheseSiNegatif(d)}$`
          texteCorr +=
            '<br>' +
            `$${lettreDepuisChiffre(i + 1)}=${a + b + calculPuissance(n, typeDePuissances[i])} \\times ${ecritureParentheseSiNegatif(d)}$`
          texteCorr +=
            '<br>' +
            `$${lettreDepuisChiffre(i + 1)} = ${miseEnEvidence((a + b + calculPuissance(n, typeDePuissances[i])) * d)}$`
          reponse = (a + b + calculPuissance(n, typeDePuissances[i])) * d
          break

        case 7: // n²*(a+b+c)
        default:
          texte = `$${lettreDepuisChiffre(i + 1)} = ${ecritureParentheseSiNegatif(n)}${affichePuissance(typeDePuissances[i])} \\times ( ${a + ecritureAlgebrique(b) + ecritureAlgebrique(c)})$`
          texteCorr = `$${lettreDepuisChiffre(i + 1)}                =${miseEnEvidence(ecritureParentheseSiNegatif(n) + affichePuissance(typeDePuissances[i]), bleuMathalea)} \\times ( ${a} ${ecritureAlgebrique(b)} ${ecritureAlgebrique(c)})$`
          texteCorr +=
            '<br>' +
            `$${lettreDepuisChiffre(i + 1)}=${calculPuissance(n, typeDePuissances[i])} \\times ( ${miseEnEvidence(a + ecritureAlgebrique(b) + ecritureAlgebrique(c), bleuMathalea)})$`
          texteCorr +=
            '<br>' +
            `$${lettreDepuisChiffre(i + 1)}=${calculPuissance(n, typeDePuissances[i])} \\times ${ecritureParentheseSiNegatif(a + b + c)}$`
          texteCorr +=
            '<br>' +
            `$${lettreDepuisChiffre(i + 1)} = ${miseEnEvidence((a + b + c) * calculPuissance(n, typeDePuissances[i]))}$`
          reponse = calculPuissance(n, typeDePuissances[i]) * (a + b + c)
          break
      }
      if (this.questionJamaisPosee(i, a, b, c)) {
        // Si la question n'a jamais été posée, on en créé une autre
        if (!context.isAmc && this.interactif) {
          // On vérifie qu'on est pas en AMC pour vérifier qu'on ne casse rien à ce qui a été fait pour AMC
          handleAnswers(this, i, { reponse: { value: reponse } })
          texte +=
            ' =' + ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase)
        } else if (context.isAmc) {
          this.autoCorrectionAMC[i] = {
            enonce: texte,
            enonceAvant: false,
            propositions: [
              {
                type: 'AMCOpen',
                propositions: [
                  {
                    enonce: texte + '\\\\',
                    texte: texteCorr,
                    statut: 3,
                    pointilles: true,
                    multicolsBegin: true,
                  },
                ],
              },
              {
                type: 'AMCNum',
                propositions: [
                  {
                    texte: '',
                    statut: '',
                    multicolsEnd: true,
                    reponse: {
                      texte: 'résultat',
                      valeur: reponse,
                      param: {
                        digits: Math.max(
                          2,
                          nombreDeChiffresDansLaPartieEntiere(reponse),
                        ),
                        decimals: 0,
                        signe: true,
                        exposantNbChiffres: 0,
                        exposantSigne: false,
                      },
                    },
                  },
                ],
              },
            ],
          }
          this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        }
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenuSansNumero(this)
  }
}

function affichePuissance(st: string | number): string {
  switch (st) {
    case 'Cube':
      return '^3'
    case 'Carre':
    default:
      return '^2'
  }
}

function calculPuissance(nb: number, st: string | number): number {
  switch (st) {
    case 'Cube':
      return Math.pow(nb, 3)
    case 'Carre':
    default:
      return Math.pow(nb, 2)
  }
}
