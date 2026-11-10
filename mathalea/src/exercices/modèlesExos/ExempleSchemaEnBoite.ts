import { choice } from '../../lib/outils/arrayOutils'
import { range } from '../../lib/outils/nombres'
import { prenom, prenomF, prenomM } from '../../lib/outils/Personne'
import SchemaEnBoite from '../../lib/outils/SchemaEnBoite'
import { texNombre, texPrix } from '../../lib/outils/texNombre'
import { nombreEnLettres } from '../../modules/nombreEnLettres'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Schemas en boite'
export const uuid = 'sebseb'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote
 */
export default class BetaSchemaEnBoite extends Exercice {
  constructor() {
    super()
    this.comment =
      'Les exercices qui sont en magenta sont des exercices tirés du guide "La résolution de problèmes au cours moyen."'
    this.nbQuestions = 12
    this.besoinFormulaireTexte = [
      'Types de problèmes',
      [
        'Nombres séparés par des tirets  :',
        '1 : Somme dont on cherche le résultat',
        '2 : Soustraction dont on cherche un terme',
        '3 : Multiplication dont on cherche le résultat',
        '4 : Division partition ou quotition exacte',
        '5 : Division dont on cherche le reste',
        '6 : Un exemple avec barres séparées et flèche',
        '7 : Additif avec une barre et une accolade',
        '8 : Division avec reste dont on cherche le dividende ou le quotient',
        '9 : Problème additif de comparaison',
        '10 : Problème multiplicatif de parties-tout',
        '11 : Problème multiplicatif de comparaison',
        '12 : Problème algébrique à une inconnue',
        '13 : Mélange',
      ].join('\n'),
    ]
    this.sup = '13'
  }

  nouvelleVersion(numeroExercice?: number): void {
    const type: number[] = gestionnaireFormulaireTexte({
      nbQuestions: this.nbQuestions,
      saisie: this.sup,
      min: 1,
      max: 12,
      defaut: 13,
      melange: 13,
    }).map(Number)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      const lea = prenomF(1)
      const eric = prenomM(1)
      let texte: string
      let seb: SchemaEnBoite
      let nb1: number
      let nb2: number
      switch (type[i]) {
        case 1:
          {
            // Addition dont on cherche le résultat
            const hl1 = randint(3, 5)
            const hl2 = 8 - hl1
            const coef = randint(2, 8)
            nb1 = hl1 * coef
            nb2 = hl2 * coef
            // const somme = nb1 + nb2

            texte = `${lea} a ${nb1} bonbons et ${eric} a ${nb2} bonbons. Combien ont-ils de bonbons en tout ?<br>`
            seb = SchemaEnBoite.additionPartiesTout(nb1 + nb2, 2, [nb1, nb2])
          }
          break
        case 2: {
          // Soustraction dont on cherche un terme
          const hl1 = randint(3, 5)
          const hl2 = 8 - hl1
          const coef = randint(2, 8)
          nb1 = hl1 * coef
          nb2 = hl2 * coef
          const somme = nb1 + nb2
          switch (randint(1, 3)) {
            case 1:
              texte = `${lea} a donné ${nb1} bonbons à ${eric} et maintenant il lui en reste ${nb2}. Combien ${lea} avait-elle de bonbons au départ ?<br>`
              seb = SchemaEnBoite.additionPartiesTout(undefined, 2, [nb1, nb2])

              break
            case 2:
              {
                const hl1 = randint(3, 5)
                const hl2 = 8 - hl1
                const coef = randint(2, 8)
                nb1 = hl1 * coef
                nb2 = hl2 * coef
                const somme = nb1 + nb2
                texte = `${lea} a ${nb1} bonbons et, avec ${eric}, ils en ont ${somme}. Combien ${eric} a-t-il de bonbons ?<br>`
                seb = SchemaEnBoite.additionPartiesTout(somme, 2, [
                  nb1,
                  undefined,
                ])
              }
              break
            default:
              texte = `${lea} a ${somme} bonbons. Après en avoir donné à ${eric}, il lui en reste ${nb1}. Combien de bonbons a-t-elle donnés ?<br>`
              seb = SchemaEnBoite.additionPartiesTout(somme, 2, [
                undefined,
                nb1,
              ])

            //    soustraction(somme, nb1, undefined, 2)
          }
          break
        }
        case 3:
          {
            // Multiplication dont on cherche le résultat
            const nbFois = randint(15, 30)
            nb1 = randint(2, 8)
            nb2 = nb1 * nbFois

            texte = `${lea} a distribué ${nb1} bonbons à chacun de ses ${nbFois} élèves. Combien de bonbons a-t-elle distribués en tout ?<br>`
            seb = SchemaEnBoite.multiplication(nb1, nbFois, 2, undefined) // J'ai mis 2 en précision pour que les cases soient plus grandes
          }
          break
        case 4: // Division partition ou quotition exacte
          switch (randint(1, 2)) {
            case 1:
              {
                const nbFois = randint(15, 30)
                nb1 = randint(2, 8)
                nb2 = nb1 * nbFois
                texte = `${lea} avait ${nb2} bonbons. Elle les a distribués équitablement à chacun de ses ${nbFois} élèves. Combien de bonbons a reçu chaque élève ?<br>`
                seb = SchemaEnBoite.division(nb2, undefined, nbFois, 2)
              }
              break
            default: {
              const nbFois = randint(15, 30)
              nb1 = randint(2, 8)
              nb2 = nb1 * nbFois
              texte = `${lea} a distribué ${nb1} bonbons à chacun de ses élèves. En tout, elle a distribué ${nb2} bonbons. Combien d'élèves a-t-elle ?<br>`
              seb = SchemaEnBoite.division(nb2, nb1, undefined, 2)
            }
          }
          break

        case 5:
          {
            // Division dont on cherche le reste
            const nbFois = randint(15, 30)
            nb1 = randint(2, 8)
            nb2 = nb1 * nbFois + randint(1, nb1 - 1)
            texte = `${lea} avait ${nb2} bonbons. Elle a distribué ${nb1} bonbons à chacun de ses ${nbFois} élèves. Combien de bonbons lui reste-t-il ?<br>`
            seb = SchemaEnBoite.divisionAvecReste(nb2, nb1, nbFois, 0, '?')
          }
          break
        case 6:
          {
            // Un exemple avec barres séparées et flèche
            const prenoms = prenomF(2)
            nb1 = randint(150, 180) / 10
            nb2 = randint(20, 50) / 10
            texte = `À la fête foraine, ${prenoms[0]} a dépensé $${texPrix(nb1)}$ € et ${prenoms[1]}, sa sœur, a dépensé $${texPrix(nb2)}$ €.
Combien ${prenoms[0]} a-t-elle dépensé de plus que sa sœur ?<br>`
            seb = new SchemaEnBoite({
              lignes: [
                {
                  entete: {
                    content: prenoms[0],
                    couleur: 'magenta',
                    longueur: 4,
                  },
                  barres: [
                    {
                      length: 8,
                      type: 'boite',
                      color: 'magenta',
                      content: `$${texPrix(nb1)}~$€`,
                      options: { color: 'white' },
                    },
                  ],
                  spacing: 0.5,
                },
                {
                  entete: {
                    content: prenoms[1],
                    couleur: 'magenta',
                    longueur: 4,
                  },
                  barres: [
                    {
                      length: 3,
                      type: 'boite',
                      color: 'magenta',
                      content: `$${texPrix(nb2)}~$€`,
                      options: { color: 'white' },
                    },
                    {
                      length: 5,
                      type: 'flèche',
                      color: 'white',
                      content: '?',
                      options: { color: 'magenta' },
                    },
                  ],
                },
              ],
            })
          }
          break
        case 7:
          {
            // additif avec une barre et une accolade
            const prenom = prenomF(2)[0]
            nb1 = randint(100, 200) / 10
            nb2 = randint(5500, 10000) / 100
            texte = `${prenom} paie $${texPrix(nb1)}$ € avec sa carte bancaire dans un magasin de bricolage.
Il lui reste maintenant $${texPrix(nb2)}$ € sur son compte en banque.
Combien d’argent ${prenom} avait-elle sur son compte en banque avant son achat ?<br>`
            seb = new SchemaEnBoite({
              lignes: [
                {
                  barres: [
                    {
                      length: 7,
                      type: 'boite',
                      color: 'magenta',
                      content: `Argent dépensé<br>$${texPrix(nb1)}~$€`,
                      options: { color: 'white' },
                    },
                    {
                      length: 9,
                      type: 'boite',
                      color: 'magenta',
                      content: `Argent restant après l'achat<br>$${texPrix(nb2)}~$€`,
                      options: { color: 'white' },
                    },
                  ],
                },
              ],
              bottomBraces: [
                {
                  text: '? €<br>Argent sur le compte au départ',
                  options: { color: 'magenta' },
                  start: 1,
                  end: 17,
                },
              ],
            })
          }
          break
        case 8: // Problème additif de comparaison
          nb1 = randint(200000, 500000) * 1000
          nb2 = randint(100000, 200000) * 1000
          texte = `Le pays A a $${texNombre(nb2, 0)}$ habitants de plus que le pays B et le nombre d'habitants du pays A est $${texNombre(nb1, 0)}$ habitants. Combien d'habitants a le pays 2 ?<br>`
          seb = new SchemaEnBoite({
            lignes: [
              {
                height: '2.5em',
                entete: {
                  content: 'Pays A',
                  couleur: 'magenta',
                  longueur: 4,
                },
                barres: [
                  {
                    length: 12,
                    type: 'boite',
                    color: 'magenta',
                    content: `$${texNombre(nb1, 0)}~$ habitants`,
                    options: { color: 'white' },
                  },
                ],
                spacing: 0.5,
              },
              {
                height: '2.5em',
                entete: {
                  content: 'Pays B',
                  couleur: 'magenta',
                  longueur: 4,
                },
                barres: [
                  {
                    length: 4,
                    type: 'boite',
                    color: 'magenta',
                    content: '? habitants',
                    options: { color: 'white' },
                  },
                  {
                    length: 8,
                    type: 'flèche',
                    color: 'white',
                    content: `$${texNombre(nb2, 0)}~$ habitants`,
                    options: { color: 'magenta' },
                  },
                ],
              },
            ],
          })

          break
        case 10:
          {
            const prenom = prenomF(2)[0]

            nb1 = choice([4, 5, 6, 8])
            nb2 = randint(15, 20) * 3
            texte = `${prenom} souhaite fabriquer ${nombreEnLettres(nb1)} invitations pour son anniversaire en découpant
une bande de papier cartonné d’une longueur de $${nb2}\\text{ cm}$.
Quelle est la plus grande longueur qu’elle peut choisir pour que toutes les invitations aient la même longueur ?<br>`
            seb = new SchemaEnBoite({
              topBraces: [
                {
                  text: `${texNombre(nb2, 0)}\\text{ cm}`,
                  type: 'accolade',
                  options: { color: 'magenta' },
                  start: 1,
                  end: 1 + nb1 * 2,
                },
              ],
              lignes: [
                {
                  height: '2.5em',
                  barres: range(nb1 - 1).map((i) => {
                    const barre = Object.assign(
                      {
                        length: 2,
                        color: 'magenta',
                        options: { color: 'white' },
                      },
                      {
                        type:
                          i === 0 ? ('flèche' as const) : ('boite' as const),
                        content: i === 0 ? '? cm' : '',
                      },
                    )
                    return barre
                  }),
                },
              ],
              bottomBraces: [
                {
                  text: `${nb1} cartons`,
                  options: { color: 'magenta' },
                  start: 1,
                  end: 1 + nb1 * 2,
                  type: 'accolade',
                },
              ],
            })
          }
          break
        case 11:
          {
            //
            const prenoms = prenom(2) as string[]
            nb1 = randint(50, 60)
            nb2 = randint(3, 5)
            texte = `${prenoms[0]} et ${prenoms[1]} jouent à la bataille avec un jeu de ${nb1} cartes qu’ils ont fabriqué.
${prenoms[0]} a ${nombreEnLettres(nb2)} fois plus de cartes qu’${prenoms[1]}.
Combien ${prenoms[1]} a-t-il de cartes ?<br>`
            seb = new SchemaEnBoite({
              lignes: [
                {
                  height: '2.5em',
                  entete: {
                    content: prenoms[1],
                    couleur: 'magenta',
                    longueur: 3,
                  },
                  barres: [
                    {
                      length: 3,
                      type: 'boite',
                      color: 'magenta',
                      content: '? cartes',
                      options: { color: 'white' },
                    },
                  ],
                  spacing: 0.5,
                },
                {
                  height: '2.5em',
                  entete: {
                    content: prenoms[0],
                    couleur: 'magenta',
                    longueur: 3,
                  },
                  barres: range(nb2 - 1).map((i) => {
                    const barre = Object.assign(
                      {
                        length: 3,
                        type: 'boite' as const,
                        color: 'magenta',
                        content: '',
                        options: {
                          style: `min-height: ${(2.5 * 1).toFixed(1)}em;`,
                        },
                      },
                      {},
                    )
                    return barre
                  }),
                },
              ],
              bottomBraces: [
                {
                  text: `${nb2} fois plus`,
                  options: { color: 'magenta' },
                  start: 1,
                  end: 1 + nb2 * 3,
                  type: 'accolade',
                },
              ],
              rightBraces: [
                {
                  text: `${nb1} cartes`,
                  options: { color: 'magenta' },
                  start: 1,
                  end: 5,
                  type: 'accolade',
                },
              ],
            })
          }
          break
        case 12:
          {
            // Algébrique à une inconnue
            const bleuesDePlus = randint(1, 9)

            const nbBillesVertes = randint(50, 100)
            const nbBillesRouges = 3 * nbBillesVertes
            const nbBillesBleues = nbBillesVertes + bleuesDePlus
            const total = nbBillesVertes + nbBillesRouges + nbBillesBleues
            nb1 = nbBillesVertes
            nb2 = bleuesDePlus
            texte = `Dans un bocal, il y a des billes vertes, rouges et bleues. Il y a trois fois plus de billes rouges que de  billes vertes et il y a ${bleuesDePlus} billes vertes de moins que de billes bleues. Combien y a-t-il de billes rouges ?<br>`
            seb = new SchemaEnBoite({
              lignes: [
                {
                  height: '1em',
                  entete: {
                    content: 'Billes vertes',
                    couleur: 'magenta',
                    longueur: 5,
                  },
                  barres: [
                    {
                      length: 3,
                      type: 'boite',
                      color: 'magenta',
                      content: '$\\phantom{M}$',
                    },
                  ],
                  spacing: 1,
                },
                {
                  height: '1em',
                  entete: {
                    content: 'Billes rouges',
                    couleur: 'magenta',
                    longueur: 5,
                  },
                  barres: [1, 2, 3].map(() => ({
                    length: 3,
                    type: 'boite',
                    color: 'magenta',
                    content: '$\\phantom{M}$',
                  })),
                  spacing: 1,
                },
                {
                  height: '1em',
                  entete: {
                    content: 'Billes bleues',
                    couleur: 'magenta',
                    longueur: 5,
                  },
                  barres: [
                    {
                      length: 3,
                      type: 'boite',
                      color: 'magenta',
                      content: '',
                    },
                    {
                      length: 1,
                      type: 'boite',
                      color: 'magenta',
                      content: `${bleuesDePlus}`,
                    },
                  ],
                },
              ],
              rightBraces: [
                {
                  text: `${total} billes`,
                  options: { color: 'magenta' },
                  start: 1,
                  end: 7,
                  type: 'accolade',
                },
              ],
            })
          }
          break
        case 20:
        default: {
          // Division dont on cherche le dividende
          switch (randint(1, 2)) {
            case 1:
              {
                const nbFois = randint(15, 30)
                nb1 = randint(2, 8)
                const reste = randint(1, nb1 - 1)
                nb2 = nb1 * nbFois + reste
                texte = `${lea} a distribué ${nb1} bonbons à chacun de ses ${nbFois} élèves. Il lui en reste ${reste}. Combien en avait-elle avant la distribution ?`
                seb = SchemaEnBoite.divisionAvecReste(
                  undefined,
                  nb1,
                  nbFois,
                  0,
                  `$${texNombre(reste, 0)}$`,
                )
              }
              break
            default:
              {
                const nbFois = randint(15, 30)
                nb1 = randint(2, 8)
                const reste = randint(1, nb1 - 1)
                nb2 = nb1 * nbFois + reste
                texte = `${lea} avait ${nb2} bonbons. Elle a distribué ${nb1} bonbons à chacun de ses élèves. Il lui reste ${reste} bonbons. Combien d'élèves a-t-elle ?`
                seb = SchemaEnBoite.divisionAvecReste(
                  nb2,
                  nb1,
                  undefined,
                  0,
                  `$${texNombre(reste, 0)}$`,
                )
              }
              break
          }
        }
      }
      if (this.questionJamaisPosee(i, nb1, nb2)) {
        this.listeQuestions[i] = `${texte}<br>${seb.display()}`
        this.listeCorrections[i] = ''
        i++
      }
      cpt++
    }
  }
}
