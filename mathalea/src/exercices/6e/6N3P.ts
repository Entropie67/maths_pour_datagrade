import { codageAngle } from '../../lib/2d/angles'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { texteParPoint } from '../../lib/2d/textes'
import { rotation } from '../../lib/2d/transformations'
import { pointSurSegment } from '../../lib/2d/utilitairesPoint'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const dateDeModifImportante = '27/03/2024'
export const titre =
  'Résoudre des problèmes de calcul de pourcentage par complément à $100\\,\\%$'
export const interactifReady = true

export const amcType = 'AMCNum'
export const amcReady = true

/**
 * Déduire un pourcentage par complément à 100%
 * @author Jean-claude Lhote
 */
export const uuid = 'db772'

export const refs = {
  'fr-fr': ['6N3P'],
  'fr-2016': ['6N33-2'],
  'fr-ch': ['10CTFA1C-2', '10LCFA1C-2', '10LSFA1C-2', 'PRQPF05A-4'],
}
export default class CalculerUnPourcentage extends Exercice {
  can: boolean
  constructor() {
    super()
    this.can = false
    this.nbQuestions = 1
    this.spacing = 2
    this.spacingCorr = 2
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = [1, 2, 3]
    const listeChoix = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    const listeMoyens = ['en bus', 'en deux-roues', 'à pied', 'en voiture']
    const listeSports = [
      'le foot',
      'la natation',
      'le basket',
      'le ping-pong',
      'le volley',
      'la gym',
    ]
    const listeHobbies = [
      'la couture',
      'le cinéma',
      'la musique',
      'le sport',
      'le codage',
      'le jardinage',
      'la cuisine',
    ]
    let p1, p2, p3, moy1, moy2, moy3
    let objets
    const centre = pointAbstrait(5, 5)
    const depart = pointAbstrait(10, 5)
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      objets = []
      p1 = randint(6, 9) * 5
      p2 = randint(6, 9) * 5
      p3 = 100 - p1 - p2
      switch (listeChoix[i]) {
        case 1: // Les moyens de déplacement maison collège
          ;[moy1, moy2, moy3] = combinaisonListes(listeMoyens, 3)
          texte = `Dans un collège, $${p1}\\,\\%$ des élèves se déplacent ${moy1}, $${p2}\\,\\%$ ${moy2} et les autres ${moy3}.<br>
          
          `
          texte += `Quel est le pourcentage des élèves qui se déplacent ${moy3} ?`
          texteCorr = `Les élèves qui se déplacent ${moy1} ou ${moy2} représentent $${p1}\\,\\%$ + $${p2}\\,\\% = ${p1 + p2}\\,\\%$.<br>`
          texteCorr += `Donc on calcule : $100 - ${p1 + p2}\\,\\% = ${p3}\\,\\%$.<br>`
          texteCorr += `$${miseEnEvidence(p3)}\\,\\%$ des élèves de ce collège se déplacent ${moy3}.<br>`
          if (!context.isHtml) {
            this.canEnonce = texte
            this.correction = this.listeCorrections[0]
            this.canReponseACompleter = `$\\ldots \\,\\%$`
          }
          break
        case 2: // Les sports pratiqués par les ados
          ;[moy1, moy2, moy3] = combinaisonListes(listeSports, 3)
          texte = `Dans une association sportive, $${p1}\\,\\%$ des ados pratiquent ${moy1}, $${p2}\\,\\%$ ${moy2} et les autres ${moy3}.<br>
          
          `
          texte += `Quel est le pourcentage des ados qui pratiquent ${moy3} ?`
          texteCorr = `Les ados qui pratiquent ${moy1} ou ${moy2} représentent $${p1}\\,\\% + ${p2}\\,\\% = ${p1 + p2}\\,\\%$.<br>`
          texteCorr += `Donc on calcule : $100\\,\\% - ${p1 + p2}\\,\\% = ${p3}\\,\\%$.<br>`
          texteCorr += `$${miseEnEvidence(p3)}\\,\\%$ des ados de cette association sportive pratiquent ${moy3}.<br>`
          if (!context.isHtml) {
            this.canEnonce = texte
            this.correction = this.listeCorrections[0]
            this.canReponseACompleter = `$\\ldots \\,\\%$`
          }
          break
        case 3: // Les hobbys pratiqués par les ados
        default:
          ;[moy1, moy2, moy3] = combinaisonListes(listeHobbies, 3)
          texte = `Dans une association culturelle, $${p1}\\,\\%$ des membres ont comme passe-temps favori ${moy1}, pour $${p2}\\,\\%$ c'est ${moy2} et pour les autres ${moy3}.<br>
          
          `
          texte += `Quel est le pourcentage des membres qui préfèrent ${moy3} ?`
          texteCorr = `Les membres qui préfèrent ${moy1} ou ${moy2} représentent $${p1}\\,\\% + ${p2}\\,\\% = ${p1 + p2}\\,\\%$.<br>`
          texteCorr += `Donc on calcule : $100\\,\\% - ${p1 + p2}\\,\\% = ${p3}\\,\\%$.<br>`
          texteCorr += `$${miseEnEvidence(p3)}\\,\\%$ des membres de cette association culturelle préfèrent ${moy3}.<br>`
          if (!context.isHtml) {
            this.canEnonce = texte
            this.correction = this.listeCorrections[0]
            this.canReponseACompleter = `$\\ldots \\,\\%$`
          }
          break
      }
      texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers, {
        texteApres: ' %',
      })

      objets.push(
        codageAngle(
          depart,
          centre,
          p1 * 3.6,
          4.9,
          '',
          'black',
          2,
          1,
          'red',
          0.4,
        ),
        texteParPoint(
          `${moy1.substring(3)}`,
          pointSurSegment(centre, rotation(depart, centre, p1 * 1.8), 3),
          0,
        ),
      )
      objets.push(
        codageAngle(
          rotation(depart, centre, p1 * 3.6),
          centre,
          p2 * 3.6,
          4.9,
          '',
          'black',
          2,
          1,
          bleuMathalea,
          0.4,
        ),
        texteParPoint(
          `${moy2.substring(3)}`,
          pointSurSegment(
            centre,
            rotation(depart, centre, p1 * 3.6 + p2 * 1.8),
            3,
          ),
          0,
        ),
      )
      objets.push(
        codageAngle(
          depart,
          centre,
          -p3 * 3.6,
          4.9,
          '',
          'black',
          2,
          1,
          'yellow',
          0.4,
          false,
          true,
        ),
        texteParPoint(
          `${moy3.substring(3)}`,
          pointSurSegment(centre, rotation(depart, centre, -p3 * 1.8), 3),
          0,
        ),
      )
      texteCorr += mathalea2d(
        {
          xmin: 0,
          ymin: 0,
          xmax: 10,
          ymax: 10,
          pixelsParCm: 20,
          scale: 0.5,
          mainlevee: false,
          amplitude: 1,
        },
        ...objets,
      )
      handleAnswers(
        this,
        i,
        { reponse: { value: p3 } },
        { digits: 3, decimals: 0, signe: false },
      )

      if (this.questionJamaisPosee(i, moy1, moy2, moy3)) {
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
