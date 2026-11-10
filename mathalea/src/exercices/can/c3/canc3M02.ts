import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { codageAngleDroit } from '../../../lib/2d/CodageAngleDroit'
import { codageSegments } from '../../../lib/2d/CodageSegment'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { texteParPosition } from '../../../lib/2d/textes'
import { milieu } from '../../../lib/2d/utilitairesPoint'
import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre =
  'Calculer une longueur/un périmètre/une aire (avec des entiers)'
export const dateDePublication = '25/08/2022'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
/**
 * @author Gilles Mora
 * Créé le 03/08/2022

 */
export const uuid = 'cb91f'

export const refs = {
  'fr-fr': ['canc3M02'],
  'fr-ch': [],
}
export default class ProblemesDeLongueursEtPerimetreCM extends ExerciceSimple {
  constructor() {
    super()

    this.nbQuestions = 1
    this.typeExercice = 'simple'
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteApres: ' $\\text{cm}$' }
  }

  nouvelleVersion() {
    let choix
    let a
    let b
    let A
    let B
    let C
    let D
    let objets = []
    let s1
    let s2
    let s3
    let s4
    switch (
      this.quotaChoice('cas', [1, 2, 3, 4]) //
    ) {
      case 1: // périmètre/aire carré
        choix = choice([true, false])
        objets = []
        a = randint(3, 14)
        A = pointAbstrait(0, 0, 'A', 'below')
        B = pointAbstrait(6, 0, 'B', 'below')
        C = pointAbstrait(6, 6, 'C', 'below')
        D = pointAbstrait(0, 6, 'D', 'below')
        s1 = segment(A, B)
        s2 = segment(B, C)
        s3 = segment(C, D)
        s4 = segment(A, D)
        if (choice([true, false])) {
          objets.push(
            codageSegments('||', bleuMathalea, A, B),
            codageSegments('||', bleuMathalea, B, C),
            codageSegments('||', bleuMathalea, C, D),
            codageSegments('||', bleuMathalea, A, D),
            texteParPosition(`${a} cm`, milieu(A, B).x, milieu(A, B).y - 0.8),
            codageAngleDroit(D, A, B),
            codageAngleDroit(A, B, C),
            codageAngleDroit(B, C, D),
            codageAngleDroit(C, D, A),
            s1,
            s2,
            s3,
            s4,
          )
          this.question =
            `${choix ? 'Quel' : 'Quelle'} est ${choix ? 'le périmètre' : 'l’aire'} de ce carré ? <br>` +
            mathalea2d(
              {
                xmin: -0.5,
                ymin: -1.2,
                xmax: 7,
                ymax: 7,
                scale: 0.5,
                center: !context.isHtml,
              },
              objets,
            )
          this.optionsChampTexte = {
            texteApres: choix ? ' $\\text{cm}$' : ' $\\text{cm}^2$',
          }

          this.reponse = choix ? 4 * a : a * a
          this.correction = `Il s'agit d'un carré. <br>
        Son ${choix ? 'périmètre' : 'aire'} est donc
        ${choix ? `$4$ fois la longueur de son côté, soit $4\\times ${a}=${miseEnEvidence(4 * a)}\\text{ cm}$.` : `le carré de la longueur de son côté, soit $${a}\\times ${a}=${miseEnEvidence(a * a)}\\text{ cm}^2$.`}`
        } else {
          objets.push(
            codageSegments('||', bleuMathalea, A, B),
            codageSegments('||', bleuMathalea, B, C),
            codageSegments('||', bleuMathalea, C, D),
            codageSegments('||', bleuMathalea, A, D),
            texteParPosition('?', milieu(A, B).x, milieu(A, B).y - 0.8),
            codageAngleDroit(D, A, B),
            codageAngleDroit(A, B, C),
            codageAngleDroit(B, C, D),
            codageAngleDroit(C, D, A),
            s1,
            s2,
            s3,
            s4,
          )
          this.question =
            `Le périmètre de ce carré est $${4 * a}\\text{ cm}$.<br>
            Quelle est la longueur de son côté ? <br>
            
            ` +
            mathalea2d(
              {
                xmin: -0.5,
                ymin: -1.5,
                xmax: 7,
                ymax: 7,
                scale: 0.5,
                center: !context.isHtml,
              },
              objets,
            )
          this.optionsChampTexte = { texteApres: ' $\\text{cm}$' }

          this.reponse = a
          this.correction = `Il s'agit d'un carré. <br>
            Son côté est donc le quart de son périmètre, soit $${4 * a}\\div 4=${miseEnEvidence(a)}\\text{ cm}$.`
        }
        break

      case 2: // périmètre/aire rectangle
        choix = choice([true, false])
        objets = []
        a = randint(6, 11)
        b = a - randint(1, 3)
        A = pointAbstrait(0, 0, 'A', 'below')
        B = pointAbstrait(8, 0, 'B', 'below')
        C = pointAbstrait(8, 6, 'C', 'below')
        D = pointAbstrait(0, 6, 'D', 'below')
        s1 = segment(A, B)
        s2 = segment(B, C)
        s3 = segment(C, D)
        s4 = segment(A, D)

        objets.push(
          codageSegments('||', bleuMathalea, A, B),
          codageSegments('|', bleuMathalea, B, C),
          codageSegments('||', bleuMathalea, C, D),
          codageSegments('|', bleuMathalea, A, D),
          texteParPosition(`${a} cm`, milieu(A, B).x, milieu(A, B).y - 0.7),
          texteParPosition(`${b} cm`, milieu(B, C).x + 1.5, milieu(B, C).y),
          codageAngleDroit(D, A, B),
          codageAngleDroit(A, B, C),
          codageAngleDroit(B, C, D),
          codageAngleDroit(C, D, A),
          s1,
          s2,
          s3,
          s4,
        )
        this.question =
          `${choix ? 'Quel' : 'Quelle'} est ${choix ? 'le périmètre' : 'l’aire'} de ce rectangle ? <br>
        La figure n'est pas à l'échelle. <br>
        
        ` +
          mathalea2d(
            {
              xmin: -0.5,
              ymin: -1.5,
              xmax: 11,
              ymax: 7,
              scale: 0.5,
              center: !context.isHtml,
            },
            objets,
          )
        this.optionsChampTexte = {
          texteApres: choix ? ' $\\text{cm}$' : ' $\\text{cm}^2$',
        }

        this.reponse = choix ? 2 * a + 2 * b : a * b
        this.correction = `Il s'agit d'un rectangle. <br>
        Son ${choix ? 'périmètre' : 'aire'} est donc
        ${choix ? `$2$ fois la longueur de son demi-périmètre, soit $2\\times (${a}+${b})=${miseEnEvidence(2 * a + 2 * b)}\\text{ cm}$.` : `le produit de sa longueur par sa largeur, soit $${a}\\times ${b}=${miseEnEvidence(a * b)}\\text{ cm}^2$.`}`
        break

      case 3: // périmètre/longueur triangle équi
        objets = []
        a = randint(3, 14)
        A = pointAbstrait(0, 0, 'A', 'below')
        B = pointAbstrait(6, 0, 'B', 'below')
        C = pointAbstrait(3, 5.2, 'C', 'below')
        s1 = segment(A, B)
        s2 = segment(B, C)
        s3 = segment(A, C)

        if (choice([true, false])) {
          objets.push(
            codageSegments('||', bleuMathalea, A, B),
            codageSegments('||', bleuMathalea, B, C),
            codageSegments('||', bleuMathalea, C, A),
            texteParPosition(`${a} cm`, milieu(A, B).x, milieu(A, B).y - 0.8),
            s1,
            s2,
            s3,
          )
          this.question =
            `Quel est le périmètre de ce triangle ? <br>
          
          ` +
            mathalea2d(
              {
                xmin: -0.5,
                ymin: -1.5,
                xmax: 7,
                ymax: 6,
                scale: 0.5,
                center: !context.isHtml,
              },
              objets,
            )
          this.optionsChampTexte = { texteApres: ' $\\text{cm}$' }

          this.reponse = 3 * a
          this.correction = `Le triangle est équilatéral.<br>
        Son périmètre est $3$ fois la longueur de son côté, soit $3\\times ${a}=${miseEnEvidence(3 * a)}\\text{ cm}$.`
        } else {
          objets.push(
            codageSegments('||', bleuMathalea, A, B),
            codageSegments('||', bleuMathalea, B, C),
            codageSegments('||', bleuMathalea, C, A),
            texteParPosition('?', milieu(A, B).x, milieu(A, B).y - 0.7),
            s1,
            s2,
            s3,
          )
          this.question =
            `Le périmètre de ce triangle est $${3 * a}\\text{ cm}$, quelle est la longueur de son côté ?<br>
          
          ` +
            mathalea2d(
              {
                xmin: -0.5,
                ymin: -1.5,
                xmax: 7,
                ymax: 6,
                scale: 0.5,
                center: !context.isHtml,
              },
              objets,
            )
          this.optionsChampTexte = { texteApres: ' $\\text{cm}$' }

          this.reponse = a
          this.correction = `Puisque le triangle est équilatéral, la longueur de son côté est le tiers de son périmètre, soit $${3 * a}\\div ${3}=${miseEnEvidence(a)}\\text{ cm}$. `
        }
        break

      case 4: // périmètre/longueur triangle isocèle
        objets = []
        do {
          a = randint(3, 7)
          b = randint(8, 12)
        } while (2 * a <= b)
        A = pointAbstrait(0, 0, 'A', 'below')
        B = pointAbstrait(5, 0, 'B', 'below')
        C = pointAbstrait(2.5, 2, 'C', 'below')
        s1 = segment(A, B)
        s2 = segment(B, C)
        s3 = segment(A, C)

        choix = choice(['a', 'b', 'c']) //
        if (choix === 'a') {
          objets.push(
            codageSegments('||', bleuMathalea, B, C),
            codageSegments('||', bleuMathalea, C, A),
            texteParPosition(`${b} cm`, milieu(A, B).x, milieu(A, B).y - 0.7),
            texteParPosition(
              `${a} cm`,
              milieu(B, C).x + 1,
              milieu(B, C).y + 0.5,
            ),
            s1,
            s2,
            s3,
          )
          this.question =
            `Quel est le périmètre de ce triangle ? <br>

        La figure n'est pas à l'échelle. <br>
        
        ` +
            mathalea2d(
              {
                xmin: -0.5,
                ymin: -1.5,
                xmax: 6,
                ymax: 3,
                scale: 0.7,
                center: !context.isHtml,
              },
              objets,
            )
          this.optionsChampTexte = { texteApres: ' $\\text{cm}$' }

          this.reponse = 2 * a + b
          this.correction = `Le triangle est isocèle.<br>

        Son périmètre est : $2\\times ${a}+${b}=${miseEnEvidence(2 * a + b)}\\text{ cm}$.`
        }
        if (choix === 'b') {
          objets.push(
            codageSegments('||', bleuMathalea, B, C),
            codageSegments('||', bleuMathalea, C, A),
            texteParPosition(`${b} cm`, milieu(A, B).x, milieu(A, B).y - 0.7),
            texteParPosition('?', milieu(B, C).x + 1, milieu(B, C).y + 0.5),
            s1,
            s2,
            s3,
          )
          this.question =
            `Le périmètre de ce triangle est $${2 * a + b}\\text{ cm}$, quelle est la longueur manquante ?<br>
          
          La figure n'est pas à l'échelle. <br>
            
            ` +
            mathalea2d(
              {
                xmin: -0.5,
                ymin: -1.5,
                xmax: 6,
                ymax: 2.5,
                scale: 0.7,
                center: !context.isHtml,
              },
              objets,
            )
          this.optionsChampTexte = { texteApres: ' $\\text{cm}$' }

          this.reponse = a
          this.correction = `Le triangle est isocèle, il possède donc deux longueurs égales.<br>
            Puisque le périmètre est $${2 * a + b}\\text{ cm}$, on obtient la somme des deux longueurs égales du triangle en effectuant la différence $${2 * a + b}-${b}=${2 * a}\\text{ cm}$.<br>
            On obtient la longueur cherchée en divisant par $2$, soit $${2 * a}\\div 2=${miseEnEvidence(a)}\\text{ cm}$.`
        }
        if (choix === 'c') {
          objets.push(
            codageSegments('||', bleuMathalea, B, C),
            codageSegments('||', bleuMathalea, C, A),
            texteParPosition('?', milieu(A, B).x, milieu(A, B).y - 0.7),
            texteParPosition(
              `${a} cm`,
              milieu(B, C).x + 1,
              milieu(B, C).y + 0.5,
            ),
            s1,
            s2,
            s3,
          )
          this.question =
            `Le périmètre de ce triangle est $${2 * a + b}\\text{ cm}$, quelle est la longueur manquante ?<br>
          
          La figure n'est pas à l'échelle. <br>
                
                ` +
            mathalea2d(
              {
                xmin: -0.5,
                ymin: -1.5,
                xmax: 6,
                ymax: 2.5,
                scale: 0.7,
                center: !context.isHtml,
              },
              objets,
            )
          this.optionsChampTexte = { texteApres: ' $\\text{cm}$' }

          this.reponse = b
          this.correction = `Le triangle est isocèle, il possède donc deux longueurs égales.<br>
                Puisque le périmètre est $${2 * a + b}\\text{ cm}$, on obtient la longueur manquante par : $${2 * a + b}-2\\times ${a}=${miseEnEvidence(b)}\\text{ cm}$.`
        }
        break
    }

    this.canReponseACompleter = '$\\ldots\\text{ cm}$'
  }
}
