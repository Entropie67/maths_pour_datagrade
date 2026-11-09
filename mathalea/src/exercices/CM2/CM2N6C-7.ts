import { bleuMathalea, orangeMathalea } from '../../lib/colors'
import { deuxColonnesResp } from '../../lib/format/miseEnPage'
import { ajouteQuestionMathlive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { nombreEnLettres } from '../../modules/nombreEnLettres'
import operation from '../../modules/operations'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { prenoms } from './CM2N6C-4'
import { deDevant, queDevant } from '../../lib/outils/outilString'
export const uuid = 'c7954'
export const refs = {
  'fr-fr': ['CM2N6C-7'],
  'fr-2016': ['c3C32-06'],
  'fr-ch': ['9R1NO7G-9', '9R2NO7G-9', '9R3NO7G-9', 'PRQPF04A-11'],
}
export const titre = 'Résoudre des problèmes de billes'
export const dateDePublication = '30/11/2024'

export const interactifReady = true

/**
 * @author Jean-claude Lhote (rendu interactif par Lydie El Halougi)
 * Sources (eduscol) : https://eduscol.education.fr/ressources/numerique/2020/2020-exercices-mathematiques-6e
 * Ces exercices seront proposés systématiquement pour 3 niveaux de difficulté afin de différentier autour d'un même problème
 */
export default class ExerciceProbleme006 extends Exercice {
  constructor() {
    super()
    this.spacing = 1.2
    this.spacingCorr = 1.2
    this.nbQuestions = 1
    this.besoinFormulaireNumerique = [
      'niveau de difficulté',
      3,
      '1 : Élèves à besoin\n2 : Moyens\n3 : Avancés',
    ]
    this.sup = 2
    this.besoinFormulaire2Texte = [
      'type de Problème',
      [
        '1 : Nombres séparés par des tirets :',
        '2 : Problème de combinaison',
        '3 : Problème de comparaison',
        '4 : Problème de partage',
        '5 : Mélange de problèmes',
      ].join('\n'),
    ]
    this.sup2 = '1'
    this.besoinFormulaire3CaseACocher = [
      'Opération posée dans la correction',
      false,
    ]
    this.sup3 = false

    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = true
  }

  nouvelleVersion() {
    const listeTypesDeProblemes = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: 4,
      melange: 5,
      defaut: 1,
      nbQuestions: this.nbQuestions,
    })
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 5;) {
      const prenom1 = choice(prenoms)
      const prenom2 = choice(prenoms, [prenom1])
      const typeDeProbleme = listeTypesDeProblemes[i]
      let nb1: number
      let nb2: number
      let enonce: string
      let correction: string

      switch (typeDeProbleme) {
        case 1:
          switch (this.sup) {
            case 1:
              nb1 = randint(3, 17)
              nb2 = randint(3, 17)
              enonce = `${prenom1} avait $${nb1}$ billes et ${prenom2} lui en a donné $${nb2}$.<br>Quel est le nombre de billes que possède ${prenom1} maintenant ?${
                this.interactif
                  ? ajouteQuestionMathlive({
                      exercice: this,
                      question: i,
                      typeInteractivite: 'mathlive',
                      texteApres: ' billes',
                      reponseParams: { formatInteractif: 'mathalea-mathfield' },
                      objetReponse: {
                        reponse: {
                          value: texNombre(nb1 + nb2),
                          options: { nombreDecimalSeulement: true },
                        },
                      },
                    })
                  : ''
              }`
              correction = `${this.correctionDetaillee ? `Nombre de billes ${deDevant(prenom1)} : ` : ''}
          ${this.sup3 ? operation({ operande1: nb1, operande2: nb2, type: 'addition', options: { solution: true, colore: orangeMathalea } }) : `$${nb1} + ${nb2} = ${nb1 + nb2}$<br>`}
          ${prenom1} a maintenant $${miseEnEvidence(String(nb1 + nb2))}$ billes.`
              break
            case 2:
              nb2 = randint(10, 20)
              nb1 = nb2 + randint(10, 30)
              enonce = `${prenom1} avait $${nb1}$ billes et elle en a donné $${nb2}$ à ${prenom2}.<br>Quel est le nombre de billes que possède ${prenom1} maintenant ?${
                this.interactif
                  ? ajouteQuestionMathlive({
                      exercice: this,
                      question: i,
                      typeInteractivite: 'mathlive',
                      texteApres: ' billes',
                      reponseParams: { formatInteractif: 'mathalea-mathfield' },
                      objetReponse: {
                        reponse: {
                          value: texNombre(nb1 - nb2),
                          options: { nombreDecimalSeulement: true },
                        },
                      },
                    })
                  : ''
              }`
              correction = `${this.correctionDetaillee ? `Nombre de billes ${deDevant(prenom1)} : ` : ''}
          ${this.sup3 ? operation({ operande1: nb1, operande2: nb2, type: 'soustraction', options: { solution: true, colore: orangeMathalea } }) : `$${nb1} - ${nb2} = ${nb1 - nb2}$<br>`}
          ${prenom1} a maintenant $${miseEnEvidence(String(nb1 - nb2))}$ billes.`
              break
            default:
              nb2 = randint(10, 20)
              nb1 = nb2 + randint(10, 30)
              enonce = `${prenom1} a donné $${nb2}$ billes à ${prenom2}. Elle en a maintenant $${nb1 - nb2}$.<br>Quel est le nombre de billes que possèdait ${prenom1} avant ?${
                this.interactif
                  ? ajouteQuestionMathlive({
                      exercice: this,
                      question: i,
                      typeInteractivite: 'mathlive',
                      texteApres: ' billes',
                      reponseParams: { formatInteractif: 'mathalea-mathfield' },
                      objetReponse: {
                        reponse: {
                          value: texNombre(nb1),
                          options: { nombreDecimalSeulement: true },
                        },
                      },
                    })
                  : ''
              }`

              correction = `${this.correctionDetaillee ? `Nombres de billes qu'avait ${prenom1} avant : ` : ''}
          ${this.sup3 ? operation({ operande1: nb1 - nb2, operande2: nb2, type: 'addition', options: { solution: true, colore: orangeMathalea } }) : ` $${nb1 - nb2} + ${nb2} = ${nb1}$<br>`}
         ${prenom1} avait $${miseEnEvidence(String(nb1))}$ billes.`
              break
          }
          break

        case 2: // combinaison
          switch (this.sup) {
            case 1:
              nb1 = randint(3, 17)
              nb2 = randint(3, 17)
              enonce = `${prenom1} a $${nb1}$ billes et ${prenom2} en a $${nb2}$.<br>Quel est le nombre de billes que possèdent ensemble ${prenom1} et ${prenom2} ?${
                this.interactif
                  ? ajouteQuestionMathlive({
                      exercice: this,
                      question: i,
                      typeInteractivite: 'mathlive',
                      texteApres: ' billes',
                      reponseParams: { formatInteractif: 'mathalea-mathfield' },
                      objetReponse: {
                        reponse: {
                          value: texNombre(nb1 + nb2),
                          options: { nombreDecimalSeulement: true },
                        },
                      },
                    })
                  : ''
              }`
              correction = `${this.correctionDetaillee ? `On ajoute le nombre de billes ${deDevant(prenom1)} et ${deDevant(prenom2)} : ` : ''}
        ${this.sup3 ? operation({ operande1: nb1, operande2: nb2, type: 'addition', options: { solution: true, colore: orangeMathalea } }) : ` $${nb1} + ${nb2} = ${nb1 + nb2}$<br>`}
       Ensemble ${prenom1} et ${prenom2} ont $${miseEnEvidence(String(nb1 + nb2))}$ billes.`
              break
            case 2:
              nb2 = randint(10, 20)
              nb1 = nb2 + randint(10, 30)
              enonce = `${prenom1} et  ${prenom2} ont ensemble $${nb1}$ billes. ${prenom2} en a $${nb2}$.<br>Quel est le nombre de billes que possède ${prenom1} ?${
                this.interactif
                  ? ajouteQuestionMathlive({
                      exercice: this,
                      question: i,
                      typeInteractivite: 'mathlive',
                      texteApres: ' billes',
                      reponseParams: { formatInteractif: 'mathalea-mathfield' },
                      objetReponse: {
                        reponse: {
                          value: texNombre(nb1 - nb2),
                          options: { nombreDecimalSeulement: true },
                        },
                      },
                    })
                  : ''
              }`
              correction = `${this.correctionDetaillee ? `Nombre de billes ${deDevant(prenom1)} : ` : ''}
        ${this.sup3 ? operation({ operande1: nb1, operande2: nb2, type: 'soustraction', options: { solution: true, colore: orangeMathalea } }) : `$${nb1} - ${nb2} = ${nb1 - nb2}$<br>`}
        ${prenom1} a $${miseEnEvidence(String(nb1 - nb2))}$ billes.`
              break
            default:
              nb2 = randint(10, 20)
              nb1 = nb2 + randint(10, 30)
              enonce = `${prenom2} a $${nb2}$ billes. ${prenom1} en a $${nb1 - nb2}$ de plus.<br>Quel est le nombre de billes que possèdent ensemble ${prenom1} et ${prenom2} ?${
                this.interactif
                  ? ajouteQuestionMathlive({
                      exercice: this,
                      question: i,
                      typeInteractivite: 'mathlive',
                      texteApres: ' billes',
                      reponseParams: { formatInteractif: 'mathalea-mathfield' },
                      objetReponse: {
                        reponse: {
                          value: texNombre(nb1 + nb2),
                          options: { nombreDecimalSeulement: true },
                        },
                      },
                    })
                  : ''
              }`
              correction = `${this.correctionDetaillee ? `Nombre de billes ${deDevant(prenom1)} : $${nb1 - nb2} + ${nb2}=${nb1}$.<br>Nombre de billes total : $${nb1}+${nb2}=${nb1 + nb2}$.<br>` : ''}
        ${
          this.sup3
            ? deuxColonnesResp(
                (this.correctionDetaillee
                  ? ''
                  : `Nombre de billes ${deDevant(prenom1)} :<br>`) +
                  String(
                    operation({
                      operande1: nb1 - nb2,
                      operande2: nb2,
                      type: 'addition',
                      options: { solution: true, colore: bleuMathalea },
                    }),
                  ),
                (this.correctionDetaillee
                  ? ''
                  : 'Nombre de billes total :<br>') +
                  String(
                    operation({
                      operande1: nb1,
                      operande2: nb2,
                      type: 'addition',
                      options: { solution: true, colore: orangeMathalea },
                    }).toString(),
                  ),
                {
                  eleId: '',
                  largeur1: 20,
                  widthmincol1: '40px',
                  widthmincol2: '40px',
                },
              )
            : ` $(${nb1 - nb2} + ${nb2}) + ${nb2} = ${nb1}+${nb2}=${nb1 + nb2}$<br>`
        }
       Ensemble, ${prenom1} et ${prenom2} ont $${miseEnEvidence(String(nb1 + nb2))}$ billes.`
              break
          }

          break

        case 3: // comparaison
          switch (this.sup) {
            case 1:
              nb1 = randint(3, 17)
              nb2 = randint(3, 17) + nb1
              enonce = `${prenom1} a $${nb1}$ billes et ${prenom2} en a $${nb2 - nb1}$ de plus.<br>Quel est le nombre de billes que possède ${prenom2} ?${
                this.interactif
                  ? ajouteQuestionMathlive({
                      exercice: this,
                      question: i,
                      typeInteractivite: 'mathlive',
                      texteApres: ' billes',
                      reponseParams: { formatInteractif: 'mathalea-mathfield' },
                      objetReponse: {
                        reponse: {
                          value: texNombre(nb2),
                          options: { nombreDecimalSeulement: true },
                        },
                      },
                    })
                  : ''
              }`
              correction = `${this.correctionDetaillee ? `Nombre de billes ${deDevant(prenom2)} : ` : ''}
        ${this.sup3 ? operation({ operande1: nb2 - nb1, operande2: nb1, type: 'addition', options: { solution: true, colore: orangeMathalea } }) : `$${nb2 - nb1} + ${nb1} = ${nb2}$<br>`}
        ${prenom2} a $${miseEnEvidence(String(nb2))}$ billes.`
              break
            case 2:
              nb2 = randint(20, 30)
              nb1 = nb2 + randint(10, nb2 - 5)
              enonce = `${prenom2} a $${nb2}$ billes, c'est $${nb1 - nb2}$ de moins ${queDevant(prenom1)}.<br>Quel est le nombre de billes que possède ${prenom1} ?${
                this.interactif
                  ? ajouteQuestionMathlive({
                      exercice: this,
                      question: i,
                      typeInteractivite: 'mathlive',
                      texteApres: ' billes',
                      reponseParams: { formatInteractif: 'mathalea-mathfield' },
                      objetReponse: {
                        reponse: {
                          value: texNombre(nb1),
                          options: { nombreDecimalSeulement: true },
                        },
                      },
                    })
                  : ''
              }`
              correction = `${this.correctionDetaillee ? `Nombre de billes ${deDevant(prenom1)} : ` : ''}
        ${this.sup3 ? operation({ operande1: nb1, operande2: nb2, type: 'addition', options: { solution: true, colore: orangeMathalea } }) : `$${nb1} + ${nb2} = ${nb1}$<br>`}
        ${prenom1} a $${miseEnEvidence(String(nb1))}$ billes.`

              break
            default:
              nb2 = randint(20, 30)
              nb1 = nb2 + randint(10, nb2 - 5)
              enonce = `${prenom2} a $${nb2}$ billes, c'est $${nb1 - nb2}$ de moins ${queDevant(prenom1)}.<br>Quel est le nombre de billes que possèdent ${prenom1} et ${prenom2} ensemble ?${
                this.interactif
                  ? ajouteQuestionMathlive({
                      exercice: this,
                      question: i,
                      typeInteractivite: 'mathlive',
                      texteApres: ' billes',
                      reponseParams: { formatInteractif: 'mathalea-mathfield' },
                      objetReponse: {
                        reponse: {
                          value: texNombre(nb1 + nb2),
                          options: { nombreDecimalSeulement: true },
                        },
                      },
                    })
                  : ''
              }`
              correction = `${this.correctionDetaillee ? `Nombre de billes ${deDevant(prenom1)} : $${nb1 - nb2} + ${nb2}=${nb1}$.<br>Nombre de billes total : $${nb1}+${nb2}=${nb1 + nb2}$.<br>` : ''}
        ${
          this.sup3
            ? deuxColonnesResp(
                (this.correctionDetaillee
                  ? ''
                  : `Nombre de billes ${deDevant(prenom1)} :<br>`) +
                  String(
                    operation({
                      operande1: nb1 - nb2,
                      operande2: nb2,
                      type: 'addition',
                      options: { solution: true, colore: bleuMathalea },
                    }),
                  ),
                (this.correctionDetaillee
                  ? ''
                  : 'Nombre de billes total :<br>') +
                  String(
                    operation({
                      operande1: nb1,
                      operande2: nb2,
                      type: 'addition',
                      options: { solution: true, colore: orangeMathalea },
                    }),
                  ),
                {
                  eleId: '',
                  largeur1: 20,
                  widthmincol1: '40px',
                  widthmincol2: '40px',
                },
              )
            : ` $(${nb1 - nb2} + ${nb2}) + ${nb2} = ${nb1}+${nb2}=${nb1 + nb2}$<br>`
        }
        Ensemble, ${prenom1} et ${prenom2} ont $${miseEnEvidence(String(nb1 + nb2))}$ billes.`

              break
          }

          break

        default:
          {
            // partage
            let nbFois = randint(2, 4)
            switch (this.sup) {
              case 1:
                nb1 = randint(3, 17)
                nb2 = nbFois * nb1
                enonce = `${prenom1} a $${nb1}$ billes et ${prenom2} en a $${nbFois}$ fois plus.<br>Quel est le nombre de billes que possède ${prenom2} ?${
                  this.interactif
                    ? ajouteQuestionMathlive({
                        exercice: this,
                        question: i,
                        typeInteractivite: 'mathlive',
                        texteApres: ' billes',
                        reponseParams: {
                          formatInteractif: 'mathalea-mathfield',
                        },
                        objetReponse: {
                          reponse: {
                            value: texNombre(nb1 * nbFois),
                            options: { nombreDecimalSeulement: true },
                          },
                        },
                      })
                    : ''
                }`
                correction = `${this.correctionDetaillee ? `Nombre de billes ${deDevant(prenom2)} : ` : ''}
                      ${this.sup3 ? operation({ operande1: nb1, operande2: nbFois, type: 'multiplication', options: { solution: true, colore: orangeMathalea } }) : `$${nb1}\\times ${nbFois} = ${nb1 * nbFois}$<br>`}
      ${prenom2} a $${miseEnEvidence(String(nb1 * nbFois))}$ billes.`
                break
              case 2:
                nb1 = randint(3, 17)
                nb2 = nbFois * nb1
                enonce = `${prenom2} a $${nb2}$ billes, c'est $${nbFois}$ fois plus ${queDevant(prenom1)}.<br>Quel est le nombre de billes que possède ${prenom1} ?${
                  this.interactif
                    ? ajouteQuestionMathlive({
                        exercice: this,
                        question: i,
                        typeInteractivite: 'mathlive',
                        texteApres: ' billes',
                        reponseParams: {
                          formatInteractif: 'mathalea-mathfield',
                        },
                        objetReponse: {
                          reponse: {
                            value: texNombre(nb1),
                            options: { nombreDecimalSeulement: true },
                          },
                        },
                      })
                    : ''
                }`
                correction = `${this.correctionDetaillee ? `Nombre de billes ${deDevant(prenom1)} : ` : ''}
      ${this.sup3 ? operation({ operande1: nb2, operande2: nbFois, type: 'division', options: { solution: true, colore: orangeMathalea } }) : `$${nb2} \\div ${nbFois} = ${nb1}$<br>`}
      ${prenom1} a $${miseEnEvidence(String(nb1))}$ billes.`
                break
              default:
                nbFois = randint(3, 6)
                nb1 = randint(3, 17)
                nb2 = (nbFois - 1) * nb1
                enonce = `${prenom1} a $${nb1}$ billes, ${prenom1} et ${prenom2} en possèdent ensemble ${nbFois} fois plus.<br>Quel est le nombre de billes que possède ${prenom2} ?${
                  this.interactif
                    ? ajouteQuestionMathlive({
                        exercice: this,
                        question: i,
                        typeInteractivite: 'mathlive',
                        texteApres: ' billes',
                        reponseParams: {
                          formatInteractif: 'mathalea-mathfield',
                        },
                        objetReponse: {
                          reponse: {
                            value: texNombre(nb2),
                            options: { nombreDecimalSeulement: true },
                          },
                        },
                      })
                    : ''
                }`
                correction = `${this.correctionDetaillee ? `Nombre de billes total : $${nb1} \\times ${nbFois}=${nb1 * nbFois}$.<br>Nombre de billes ${deDevant(prenom2)} : $${nb1 * nbFois} -  ${nb1}=${nb2}$.<br>` : ''}
      ${
        this.sup3
          ? deuxColonnesResp(
              (this.correctionDetaillee ? '' : 'Nombre de billes total :<br>') +
                String(
                  operation({
                    operande1: nb1,
                    operande2: nbFois,
                    type: 'multiplication',
                    options: { solution: true, colore: bleuMathalea },
                  }),
                ),
              (this.correctionDetaillee
                ? ''
                : `Nombre de billes ${deDevant(prenom2)} :<br>`) +
                String(
                  operation({
                    operande1: nb1 * nbFois,
                    operande2: nb1,
                    type: 'soustraction',
                    options: { solution: true, colore: orangeMathalea },
                  }),
                ),
              {
                eleId: '',
                largeur1: 20,
                widthmincol1: '40px',
                widthmincol2: '40px',
              },
            )
          : ` $${nb1} \\times ${nbFois} = ${nb1 * nbFois}$<br> $${nb1 * nbFois} -  ${nb1} = ${nb2}$<br>`
      }
      ${prenom2} a $${miseEnEvidence(String(nb2))}$ billes.<br>
      Une autre façon de voir les choses :<br>
      Si ensemble, ${prenom1} et ${prenom2} ont ${texteEnCouleurEtGras(nombreEnLettres(nbFois), 'black')} fois $${nb1}$ billes, ${prenom1} en a ${texteEnCouleurEtGras('une', 'black')} fois $${nb1}$ et ${prenom2} en a ${texteEnCouleurEtGras(nombreEnLettres(nbFois - 1), 'black')} fois ${nb1} soit $${miseEnEvidence(String(nb2))}$.`

                break
            }
          }
          break
      }

      if (this.questionJamaisPosee(i, nb1, nb2)) {
        this.listeQuestions[i] = enonce
        this.listeCorrections[i] = correction
        i++
      }
      cpt++
    }
  }
}
