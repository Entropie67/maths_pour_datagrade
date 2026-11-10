import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { prenomF, prenomM } from '../../../lib/outils/Personne'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
import { deDevant, queDevant } from '../../../lib/outils/outilString'
export const titre = 'Résoudre un problème avec «\u00a0de plus\u00a0», «\u00a0de moins\u00a0»'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '25/07/2022'

/**
 * @author Gilles Mora

 */
export const uuid = '02561'

export const refs = {
  'fr-fr': ['canc3C07'],
  'fr-ch': ['PR-8'],
}
export default class PlusOuMoins extends ExerciceSimple {
  constructor() {
    super()
    this.spacing = 1.5
    this.typeExercice = 'simple'
    this.nbQuestions = 1

    this.formatChampTexte = KeyboardType.clavierNumbers
  }

  nouvelleVersion() {
    const listeObjets = [
      ['biscuits'],
      ['billes'],
      ['bonbons'],
      ['ballons'],
      ['vis'],
      ['clous'],
      ['bandes dessinées'],
    ]
    const listeClubs = [
      ['judo'],
      ['tennis'],
      ['tennis de table'],
      ['musique'],
      ['théâtre'],
      ['danse'],
    ]
    let choix,
      a,
      b,
      prenom1,
      prenom2,
      choix1,
      reponse1,
      reponse2,
      objets,
      choix2,
      clubs
    switch (this.quotaChoice('typeProbleme', [1, 2, 3])) {
      case 1: // âge
        choix = choice(['a', 'b'])
        if (choix === 'a') {
          choix1 = choice([true, false])
          prenom1 = prenomM()
          prenom2 = prenomF()

          a = randint(12, 20)
          b = randint(2, 8)
          if (choice([true, false])) {
            reponse1 = a + b
            reponse2 = a - b
            this.reponse = choix1 ? reponse2 : reponse1
            if (choice([true, false])) {
              this.question = `${prenom1} a $${a}$ ans. Il a $${b}$ ans ${choix1 ? 'de plus' : ' de moins '}
                ${queDevant(prenom2)}. <br>

                Quel est l'âge ${deDevant(prenom2)} ?`
            } else {
              this.question = `${prenom1} a $${b}$ ans ${choix1 ? 'de plus' : ' de moins '}
                ${queDevant(prenom2)}. <br>
                
                Sachant qu'il a $${a}$ ans, quel est l'âge ${deDevant(prenom2)} ?`
            }
            this.correction = `${prenom1} a $${b}$ ans ${choix1 ? 'de plus' : ' de moins '} ${queDevant(prenom2)} donc ${prenom2} a $${b}$ années ${choix1 ? 'de moins' : ' de plus '} ${queDevant(prenom1)}.<br>
                Il a donc (${choix1 ? `$${a}-${b}$` : `$${a}+${b}$`}) ans, soit ${choix1 ? `$${miseEnEvidence(a - b)}$` : `$${miseEnEvidence(a + b)}$`} ans. `
            if (this.interactif) {
              this.optionsChampTexte = { texteApres: ' ans' }
            }
          } else {
            reponse1 = a + b
            reponse2 = a - b
            this.reponse = choix1 ? reponse1 : reponse2
            if (choice([true, false])) {
              this.question = `${prenom1} a $${a}$ ans. ${prenom2} a $${b}$ ans ${choix1 ? 'de plus' : ' de moins '}
                ${queDevant(prenom1)}. <br>

                Quel est l'âge ${deDevant(prenom2)} ?`
            } else {
              this.question = `${prenom2} a $${b}$ ans ${choix1 ? 'de plus' : ' de moins '}
                ${queDevant(prenom1)} qui a $${a}$ ans. <br>
                Quel est l'âge ${deDevant(prenom2)} ?`
            }
            this.correction = `${prenom1} a $${b}$ ans ${choix1 ? 'de plus' : ' de moins '} ${queDevant(prenom2)}.
           Il a donc (${choix1 ? `$${a}+${b}$` : `$${a}-${b}$`}) ans, soit ${choix1 ? `$${miseEnEvidence(a + b)}$` : `$${miseEnEvidence(a - b)}$`} ans. `
            if (this.interactif) {
              this.optionsChampTexte = {
                texteAvant: '<br>',
                texteApres: ' ans',
              }
            }
          }
        }

        if (choix === 'b') {
          choix1 = choice([true, false])
          prenom1 = prenomM()

          a = randint(12, 20)
          b = randint(2, 8)
          if (choice([true, false])) {
            reponse1 = a + b
            reponse2 = a - b
            this.reponse = choix1 ? reponse2 : reponse1
            if (choice([true, false])) {
              this.question = `${prenom1} a $${a}$ ans. Il a $${b}$ ans ${choix1 ? 'de plus' : ' de moins '}
                  que sa sœur. <br>

                  Quel est l'âge de sa sœur ?`
            } else {
              this.question = `${prenom1} a $${a}$ ans soit $${b}$ ans ${choix1 ? 'de plus' : ' de moins '}
                  que sa sœur. <br>

                  Quel est l'âge de sa sœur ?`
            }
            this.correction = `${prenom1} a $${b}$ ans ${choix1 ? 'de plus' : ' de moins '} que sa sœur donc sa sœur a $${b}$ années ${choix1 ? 'de moins' : ' de plus '} que son frère.<br>
                  Elle a donc (${choix1 ? `$${a}-${b}$` : `$${a}+${b}$`}) ans, soit ${choix1 ? `$${miseEnEvidence(a - b)}$` : `$${miseEnEvidence(a + b)}$`} ans. `
          } else {
            reponse1 = a + b
            reponse2 = a - b
            this.reponse = choix1 ? reponse1 : reponse2
            if (choice([true, false])) {
              this.question = `${prenom1} a $${a}$ ans. Sa sœur a $${b}$ ans ${choix1 ? 'de plus' : ' de moins '}
                            que lui. <br>

                            Quel est l'âge de sa sœur ?`
            } else {
              this.question = `La sœur ${deDevant(prenom1)} a $${b}$ ans ${choix1 ? 'de plus' : ' de moins '}
                            que lui. <br>Sachant que ${prenom1} a $${a}$ ans, quel est l'âge de sa sœur ?`
            }
            this.correction = `${prenom1} a $${a}$ ans et sa sœur a $${b}$ ans de ${choix1 ? 'de plus' : ' de moins '}.<br>
                            Elle a donc (${choix1 ? `$${a}+${b}$` : `$${a}-${b}$`}) ans, soit ${choix1 ? `$${miseEnEvidence(a + b)}$` : `$${miseEnEvidence(a - b)}$`} ans. `
          }
        }
        if (this.interactif) {
          this.optionsChampTexte = { texteAvant: '<br>', texteApres: ' ans' }
        }

        this.canReponseACompleter = `$\\ldots$ ans`
        break

      case 2:
        choix = choice(['a', 'b'])
        if (choix === 'a') {
          choix1 = choice([true, false])
          prenom1 = prenomF()
          prenom2 = prenomM()
          objets = choice(listeObjets)
          a = randint(35, 60)
          b = randint(9, 21, [10, 20])

          reponse1 = a + b
          reponse2 = a - b
          this.reponse = choix1 ? reponse2 : reponse1
          if (choice([true, false])) {
            this.question = `${prenom1} a $${a}$ ${objets}. Elle en a $${b}$ ${choix1 ? 'de plus' : ' de moins '}
                    ${queDevant(prenom2)}. <br>

                    Combien ${prenom2} a-t-il de ${objets} ?`
          } else {
            this.question = `${prenom1} a $${b}$ ${objets} ${choix1 ? 'de plus' : ' de moins '} ${queDevant(prenom2)}. <br>
            
            Sachant ${queDevant(prenom1)} a $${a}$ ${objets}, combien ${prenom2} en a-t-il ?`
          }
          this.correction = `${prenom1} a $${b}$ ${objets} ${choix1 ? 'de plus' : ' de moins '} ${queDevant(prenom2)} donc ${prenom2} a $${b}$ ${objets} ${choix1 ? 'de moins' : ' de plus '} ${queDevant(prenom1)}.<br>
                    Il a donc (${choix1 ? `$${a}-${b}$` : `$${a}+${b}$`}) ${objets}, soit ${choix1 ? `$${miseEnEvidence(a - b)}$` : `$${miseEnEvidence(a + b)}$`} ${objets}. `
        }
        if (choix === 'b') {
          choix1 = choice([true, false])
          prenom1 = prenomM()
          prenom2 = prenomF()
          objets = choice(listeObjets)
          a = randint(12, 20)
          b = randint(2, 8)
          if (choice([true, false])) {
            reponse1 = a + b
            reponse2 = a - b
            this.reponse = choix1 ? reponse2 : reponse1
            if (choice([true, false])) {
              this.question = `${prenom1} a $${a}$ ${objets}. Il a $${b}$ ${objets} ${choix1 ? 'de plus' : ' de moins '}
                ${queDevant(prenom2)}. <br>

                Combien ${prenom2} a-t-elle de ${objets} ?`
            } else {
              this.question = `${prenom1} a $${b}$ ${objets} ${choix1 ? 'de plus' : ' de moins '}
                ${queDevant(prenom2)}. <br>

                Sachant qu'il a $${a}$ ${objets}, combien de ${objets} possède ${prenom2} ?`
            }
            this.correction = `${prenom1} a $${b}$ ${objets} ${choix1 ? 'de plus' : ' de moins '} ${queDevant(prenom2)} donc ${prenom2} a $${b}$ ${objets} ${choix1 ? 'de moins' : ' de plus '} ${queDevant(prenom1)}.<br>
                Elle en a donc (${choix1 ? `$${a}-${b}$` : `$${a}+${b}$`}), soit ${choix1 ? `$${miseEnEvidence(a - b)}$` : `$${miseEnEvidence(a + b)}$`}. `
          } else {
            reponse1 = a + b
            reponse2 = a - b
            this.reponse = choix1 ? reponse1 : reponse2
            if (choice([true, false])) {
              this.question = `${prenom1} a $${a}$ ${objets}. ${prenom2} a $${b}$ ${objets} ${choix1 ? 'de plus' : ' de moins '}
                que lui. <br>

                Combien ${prenom2} a-t-elle de ${objets} ?`
            } else {
              this.question = `${prenom2} a $${b}$ ${objets} ${choix1 ? 'de plus' : ' de moins '}
                ${queDevant(prenom1)} qui en a $${a}$. <br>

                Combien ${prenom2} a-t-elle de ${objets} ?`
            }
            this.correction = `${prenom2} a $${b}$ ${objets} ${choix1 ? 'de plus' : ' de moins '} ${queDevant(prenom1)}.
           Elle en a donc (${choix1 ? `$${a}+${b}$` : `$${a}-${b}$`}), soit ${choix1 ? `$${miseEnEvidence(a + b)}$` : `$${miseEnEvidence(a - b)}$`}. `
          }
        }
        if (this.interactif) {
          this.optionsChampTexte = {
            texteAvant: '<br>',
            texteApres: ` ${objets}`,
          }
        }

        this.canReponseACompleter = `$\\ldots$ ${objets}`
        break

      case 3:
        choix = choice(['a', 'b'])
        if (choix === 'a') {
          choix1 = choice([true, false])
          choix2 = choice([true, false])
          prenom1 = prenomF()
          prenom2 = prenomM()
          clubs = choice(listeClubs)
          a = randint(35, 60)
          b = randint(9, 21, [10, 20])

          reponse1 = a + b
          reponse2 = a - b
          this.reponse = choix1 ? reponse1 : reponse2

          this.question = `Dans un club de ${clubs}, il y a $${a}$ ${choix2 ? ' garçons ' : ' filles'}. <br>
              Il y a $${b}$ ${choix2 ? ' filles ' : ' garçons'} ${choix1 ? 'de plus' : ' de moins '}
                      que de ${choix2 ? ' garçons ' : ' filles'}. <br>

                      Combien y a-t-il de ${choix2 ? ' filles' : ' garçons '} dans ce club ? `

          this.correction = ` Il y a $${b}$ ${choix2 ? ' filles ' : ' garçons'} ${choix1 ? 'de plus' : ' de moins '}
            que de ${choix2 ? ' garçons ' : ' filles'}.<br>
                      Il y a donc (${choix1 ? `$${a}+${b}$` : `$${a}-${b}$`}) ${choix2 ? ' filles' : ' garçons'}, soit ${choix1 ? `$${miseEnEvidence(a + b)}$` : `$${miseEnEvidence(a - b)}$`} ${choix2 ? ' filles ' : ' garçons'}. `
          if (this.interactif) {
            this.optionsChampTexte = {
              texteAvant: '<br>',
              texteApres: ` ${choix2 ? ' filles' : ' garçons'}`,
            }
          }

          this.canReponseACompleter = `$\\ldots$ ${choix2 ? ' filles' : ' garçons'}`
        }
        if (choix === 'b') {
          choix1 = choice([true, false])
          choix2 = choice([true, false])
          prenom1 = prenomF()
          prenom2 = prenomM()
          clubs = choice(listeClubs)
          a = randint(35, 60)
          b = randint(9, 21, [10, 20])

          reponse1 = a + b
          reponse2 = a - b
          this.reponse = choix1 ? reponse2 : reponse1

          this.question = `Dans un club de ${clubs}, il y a $${a}$ ${choix2 ? ' filles ' : ' garçons'}.<br>
          
          Sachant qu'il y a $${b}$ ${choix2 ? ' filles ' : ' garçons'} ${choix1 ? 'de plus' : ' de moins '} que de ${choix2 ? ' garçons ' : ' filles'}, combien y a-t-il de ${choix2 ? 'garçons' : 'filles'} dans ce club ? `

          this.correction = ` Il y a $${b}$ ${choix2 ? ' filles ' : ' garçons'} ${choix1 ? 'de plus' : ' de moins '}
                      que de ${choix2 ? ' garçons ' : ' filles'}, il y a donc $${b}$ ${choix2 ? ' garçons ' : ' filles'} ${choix1 ? 'de moins' : ' de plus '}
                      que de ${choix2 ? ' filles ' : ' garçons'}.<br>
                     Il y a (${choix1 ? `$${a}-${b}$` : `$${a}+${b}$`}) ${choix2 ? ' garçons' : ' filles'}, soit ${choix1 ? `$${miseEnEvidence(a - b)}$` : `$${miseEnEvidence(a + b)}$`} ${choix2 ? ' garçons' : ' filles'} dans ce club.
     `
          if (this.interactif) {
            this.optionsChampTexte = {
              texteAvant: '<br>',
              texteApres: ` ${choix2 ? ' garçons' : ' filles'}`,
            }
          }

          this.canReponseACompleter = `$\\ldots$ ${choix2 ? ' garçons' : ' filles'}`
        }

        break
    }
  }
}
