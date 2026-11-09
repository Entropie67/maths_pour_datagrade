import { fixeBordures } from '../../lib/2d/fixeBordures'
import { tableauColonneLigne } from '../../lib/2d/tableau'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { AddTabDbleEntryMathlive } from '../../lib/interactif/tableaux/AjouteTableauMathlive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { prenomF, prenomM } from '../../lib/outils/Personne'
import { pgcd } from '../../lib/outils/primalite'
import { texNombre } from '../../lib/outils/texNombre'
import { Arbre } from '../../modules/arbres'
import { fraction } from '../../modules/fractions'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'
export const interactifReady = true

export const titre =
  "Déterminer la loi de probabilité d'une variable aléatoire discrète"
export const dateDePublication = '29/03/2026'
/**
 *
 * @author Arnaud Meistermann

*/
export const uuid = '5c031'

export const refs = {
  'fr-fr': ['1P20-1', '1Tec-P41'],
  'fr-ch': [],
}

export default class LoiDeProba extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireTexte = [
      'Choix des questions',
      '1 : Jeu de carte \n2 : Loterie \n3 : Sport \n4 : Mélange des cas précédents',
    ]
    this.sup = '4'

    this.spacing = 1.5 // Interligne des questions
    this.spacingCorr = 1.5 // Interligne des réponses
  }

  nouvelleVersion() {
    const listeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: this.nbQuestions,
    })
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      // Boucle principale où i+1 correspond au numéro de la question
      switch (listeDeQuestions[i]) {
        case 1: // jeu de cartes
          {
            const a = randint(2, 10) //
            const b = 10 * randint(3, 5) //
            const c = randint(a + 5, a + 10)
            const nom = prenomM(1)
            const entetesCol = ['x_i', `${b - a}`, `${c - a}`, `${-a}`]
            const entetesLgn = ['P(X=x_i)']
            const rep1 = fraction(4, 32).texFraction
            const rep2 = fraction(12, 32).texFraction
            const rep3 = fraction(16, 32).texFraction
            texte = `On propose à Monsieur ${nom} de faire un pari avec un jeu de $32$ cartes.<br>
              Il mise $${a}${sp()}\\text{€}$. S'il obtient un as, il gagne $${b}${sp()}\\text{€}$. S'il obtient un roi, une dame ou un valet, il gagne $${c}${sp()}\\text{€}$. Dans tous les autres cas, il ne gagne rien.<br>
              On note $X$ la variable aléatoire qui donne le gain de Monsieur ${nom}. Déterminer la loi de probabilité de $X$.<br>`
            const tableauCorr = tableauColonneLigne(
              entetesCol,
              entetesLgn,
              [
                miseEnEvidence(rep1),
                miseEnEvidence(rep2),
                miseEnEvidence(rep3),
              ],
              1.5,
            )
            const tabInteractif =
              AddTabDbleEntryMathlive.convertTclToTableauMathlive(
                entetesCol,
                entetesLgn,
                ['', '', ''],
              )
            const tabMathlive = AddTabDbleEntryMathlive.create(
              this.numeroExercice ?? 0, // numéro de l'exercice
              i, // numéro de la question (0 si une seule question)
              tabInteractif,
              'clavierDeBaseAvecFraction', // type de clavier
              this.interactif, // mode interactif
              {}, // styles optionnels
            )

            texteCorr =
              `Les valeurs possibles pour $X$ sont $${b - a}$, $${c - a}$ et $${-a}$. Donc, on obtient :<br> ` +
              tableauCorr
            if (this.interactif) {
              texte += tabMathlive.output
              const reponses = [
                ['L1C1', { value: rep1 }],
                ['L1C2', { value: rep2 }],
                ['L1C3', { value: rep3 }],
              ]
              handleAnswers(this, i, Object.fromEntries(reponses))
            }
          }

          break

        case 2: // jeu de loterie
          {
            const total = 100 * randint(20, 50)
            const lot1 = 1000 * randint(1, 5)
            const frac1 = fraction(1, total)
            const nb2 = randint(5, 10) //
            const lot2 = 100 * randint(5, 10)
            const frac2 = fraction(nb2, total)
            const nb3 = 10 * randint(5, 10)
            const lot3 = 10 * randint(5, 10)
            const frac3 = fraction(nb3, total)
            const frac4 = fraction(total - 1 - nb2 - nb3, total)
            const entetesCol = [
              'x_i',
              `${texNombre(lot1)}`,
              `${texNombre(lot2)}`,
              `${texNombre(lot3)}`,
              '0',
            ]
            const entetesLgn = ['P(X=x_i)']
            const tableauCorr = tableauColonneLigne(
              entetesCol,
              entetesLgn,
              [
                miseEnEvidence(frac1.texFraction),
                miseEnEvidence(frac2.texFraction),
                miseEnEvidence(frac3.texFraction),
                miseEnEvidence(frac4.texFraction),
              ],
              1.5,
            )
            const tabInteractif =
              AddTabDbleEntryMathlive.convertTclToTableauMathlive(
                entetesCol,
                entetesLgn,
                ['', '', '', ''],
              )
            const tabMathlive = AddTabDbleEntryMathlive.create(
              this.numeroExercice ?? 0, // numéro de l'exercice
              i, // numéro de la question (0 si une seule question)
              tabInteractif,
              'clavierDeBaseAvecFraction', // type de clavier
              this.interactif, // mode interactif
              {}, // styles optionnels
            )
            texte = `Une association décide d'organiser une loterie.<br>
              Sur les $${texNombre(total)}$ tickets mis en vente, un seul rapporte $${texNombre(lot1)}${sp()}\\text{€}$. $${nb2}$ billets font gagner $${texNombre(lot2)}${sp()}\\text{€}$, $${nb3}$ rapportent $${lot3}${sp()}\\text{€}$ et les autres sont des billets perdants.<br>
             On note $X$ la variable aléatoire égale à la valeur en euro d'un ticket. Déterminer la loi de $X$. `
            texteCorr =
              `Les valeurs possibles pour $X$ sont : $${texNombre(lot1)}$, $${texNombre(lot2)}$, $${texNombre(lot3)}$ et $0$. Donc, on obtient :<br> ` +
              tableauCorr
            if (this.interactif) {
              texte += tabMathlive.output
              const reponses = [
                ['L1C1', { value: frac1.texFraction }],
                ['L1C2', { value: frac2.texFraction }],
                ['L1C3', { value: frac3.texFraction }],
                ['L1C4', { value: frac4.texFraction }],
              ]
              handleAnswers(this, i, Object.fromEntries(reponses))
            }
          }
          break
        case 3: // jeu avec sport
          {
            const nom = prenomF(1)
            const sport = choice(['football', 'handball', 'hockey'])
            let nb1 = randint(2, 8)
            let nb2 = nb1 + randint(1, 4)
            const p = pgcd(nb1, nb2)
            nb1 = nb1 / p
            nb2 = nb2 / p
            const rationnel = true
            const entetesCol = ['x_i', '0', '1', '2']
            const entetesLgn = ['P(X=x_i)']
            const tableauCorr = tableauColonneLigne(
              entetesCol,
              entetesLgn,
              [
                miseEnEvidence(
                  fraction((nb2 - nb1) * (nb2 - nb1), nb2 * nb2).texFraction,
                ),
                miseEnEvidence(
                  fraction(2 * (nb2 - nb1) * nb1, nb2 * nb2).texFraction,
                ),
                miseEnEvidence(fraction(nb1 * nb1, nb2 * nb2).texFraction),
              ],
              1.5,
            )
            const tabInteractif =
              AddTabDbleEntryMathlive.convertTclToTableauMathlive(
                entetesCol,
                entetesLgn,
                ['', '', ''],
              )
            const tabMathlive = AddTabDbleEntryMathlive.create(
              this.numeroExercice ?? 0, // numéro de l'exercice
              i, // numéro de la question (0 si une seule question)
              tabInteractif,
              'clavierDeBaseAvecFraction', // type de clavier
              this.interactif, // mode interactif
              {}, // styles optionnels
            )
            const omega = new Arbre({
              racine: true,
              rationnel,
              nom: '',
              proba: 1,
              visible: false,
              alter: '',
              enfants: [
                new Arbre({
                  rationnel,
                  nom: 'M',
                  proba: fraction(nb1, nb2),
                  visible: true,
                  enfants: [
                    new Arbre({
                      rationnel,
                      nom: 'M',
                      proba: fraction(nb1, nb2),
                      visible: true,
                      alter: '',
                    }),
                    new Arbre({
                      rationnel,
                      nom: '\\bar M',
                      proba: fraction(nb2 - nb1, nb2),
                      visible: true,
                      alter: '',
                    }),
                  ],
                }),
                new Arbre({
                  rationnel,
                  nom: '\\bar M',
                  proba: fraction(nb2 - nb1, nb2),
                  enfants: [
                    new Arbre({
                      rationnel,
                      nom: 'M',
                      proba: fraction(nb1, nb2),
                      visible: true,
                      alter: '',
                    }),
                    new Arbre({
                      rationnel,
                      nom: '\\bar M',
                      proba: fraction(nb2 - nb1, nb2),
                      visible: true,
                      alter: '',
                    }),
                  ],
                }),
              ],
            })

            omega.setTailles() // On calcule les tailles des arbres.
            const objets = omega.represente(0, 6, 0, 3, true, 1, 8)

            texte = `${nom} joue au ${sport} et elle a remarqué que lorsqu'elle tirait au but, elle avait $${nb1}$ chances sur $${nb2}$ de marquer.<br>
              On note $X$ la variable aléatoire égale au nombre de buts marqués au cours de $2$ tirs successifs. Déterminer la loi de probabilité de $X$.`
            texteCorr = `On considère l'arbre suivant où $M$ est l'évènement : «${sp()}${nom} marque un but${sp()}».<br>
              `
            texteCorr +=
              mathalea2d(
                Object.assign(
                  { display: 'inline' } as const,
                  fixeBordures(objets),
                ),
                objets,
              ) +
              ' <br> ' +
              `Les valeurs possibles pour $X$ sont $0$, $1$, et $2$.<br>
            $P(X = 2) =${fraction(nb1, nb2).texFraction} \\times ${fraction(nb1, nb2).texFraction} = ${fraction(nb1 * nb1, nb2 * nb2).texFraction}$<br><br>
            $P(X = 1)=${fraction(nb1, nb2).texFraction} \\times ${fraction(nb2 - nb1, nb2).texFraction} +${fraction(nb2 - nb1, nb2).texFraction} \\times ${fraction(nb1, nb2).texFraction}=${fraction(2 * (nb2 - nb1) * nb1, nb2 * nb2).texFraction} $<br><br>
            $P(X = 0) =${fraction(nb2 - nb1, nb2).texFraction} \\times ${fraction(nb2 - nb1, nb2).texFraction} = ${fraction((nb2 - nb1) * (nb2 - nb1), nb2 * nb2).texFraction}$<br><br>
                  Ainsi, on obtient : <br>` +
              tableauCorr
            if (this.interactif) {
              texte += tabMathlive.output
              const reponses = [
                ['L1C3', { value: fraction(nb1 * nb1, nb2 * nb2).texFraction }],
                [
                  'L1C2',
                  {
                    value: fraction(2 * (nb2 - nb1) * nb1, nb2 * nb2)
                      .texFraction,
                  },
                ],
                [
                  'L1C1',
                  {
                    value: fraction((nb2 - nb1) * (nb2 - nb1), nb2 * nb2)
                      .texFraction,
                  },
                ],
              ]
              handleAnswers(this, i, Object.fromEntries(reponses))
            }
          }
          break
      }

      if (this.questionJamaisPosee(i, texte)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
