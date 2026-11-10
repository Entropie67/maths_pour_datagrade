import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'
export const titre =
  "Donner la mesure d'un angle à partir des cosinus et sinus"
export const interactifReady = true

export const dateDePublication = '02/11/2022'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 *
*/

export const uuid = '18b46'

export const refs = {
  'fr-fr': ['can1G2-06'],
  'fr-ch': ['2mTrigoTri-1'],
}
export default class mesureAngleCosSin extends ExerciceSimple {
  constructor() {
    super()
    this.spacingCorr = 2.5
    this.typeExercice = 'simple'
    this.formatChampTexte = KeyboardType.grecTrigo
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const choix1 = this.quotaChoice('choix1', [
      '[0\\,;\\,2\\pi[',
      ']-\\pi\\,;\\,\\pi]',
    ])
    const choix2 = this.quotaChoice('choix2', ['a', 'b', 'c', 'd'])
    const choix3 = this.quotaChoice(
      'choix3',
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    )
    switch (choix3) {
      case 1: // pi/6
        this.question = `$\\alpha$ est un réel de $${choix1}$ vérifiant $\\cos(\\alpha)=\\dfrac{\\sqrt{3}}{2}$ et $\\sin(\\alpha)=\\dfrac{1}{2}$. <br>
        
        Quelle est la valeur de $\\alpha$ en radians ?`
        this.correction = `$\\cos \\dfrac{\\pi}{6}=\\dfrac{\\sqrt{3}}{2}$ et $\\sin \\dfrac{\\pi}{6}=\\dfrac{1}{2}$.<br>
          $\\dfrac{\\pi}{6}\\in ${choix1}$, donc $\\alpha=${miseEnEvidence('\\dfrac{\\pi}{6}')}$.`
        this.reponse = '\\dfrac{\\pi}{6}'
        break
      case 2: // pi/4
        this.question = `$\\alpha$ est un réel de $${choix1}$ vérifiant $\\cos(\\alpha)=\\dfrac{\\sqrt{2}}{2}$ et $\\sin(\\alpha)=\\dfrac{\\sqrt{2}}{2}$. <br>
       
        Quelle est la valeur de $\\alpha$ en radians ?`
        this.correction = `$\\cos \\dfrac{\\pi}{4}=\\dfrac{\\sqrt{2}}{2}$ et $\\sin \\dfrac{\\pi}{4}=\\dfrac{\\sqrt{2}}{2}$.<br>
          $\\dfrac{\\pi}{4}\\in ${choix1}$, donc $\\alpha=${miseEnEvidence('\\dfrac{\\pi}{4}')}$.`
        this.reponse = '\\dfrac{\\pi}{4}'
        break
      case 3: // pi/3
        this.question = `$\\alpha$ est un réel de $${choix1}$ vérifiant $\\cos(\\alpha)=\\dfrac{1}{2}$ et $\\sin(\\alpha)=\\dfrac{\\sqrt{3}}{2}$. <br>
        Quelle est la valeur de $\\alpha$ en radians ?`
        this.correction = `$\\cos \\dfrac{\\pi}{3}=\\dfrac{1}{2}$ et $\\sin \\dfrac{\\pi}{3}=\\dfrac{\\sqrt{3}}{2}$.<br>
          $\\dfrac{\\pi}{3}\\in ${choix1}$, donc $\\alpha=${miseEnEvidence('\\dfrac{\\pi}{3}')}$.`
        this.reponse = '\\dfrac{\\pi}{3}'
        break
      case 4: // 2pi/3
        this.question = `$\\alpha$ est un réel de $${choix1}$ vérifiant $\\cos(\\alpha)=-\\dfrac{1}{2}$ et $\\sin(\\alpha)=\\dfrac{\\sqrt{3}}{2}$. <br>
       
        Quelle est la valeur de $\\alpha$ en radians ?`
        this.correction = `$\\cos \\dfrac{2\\pi}{3}=-\\dfrac{1}{2}$ et $\\sin \\dfrac{2\\pi}{3}=\\dfrac{\\sqrt{3}}{2}$.<br>
          $\\dfrac{2\\pi}{3}\\in ${choix1}$, donc $\\alpha=${miseEnEvidence('\\dfrac{2\\pi}{3}')}$.`
        this.reponse = '\\dfrac{2\\pi}{3}'
        break
      case 5: // 3pi/4
        this.question = `$\\alpha$ est un réel de $${choix1}$ vérifiant $\\cos(\\alpha)=-\\dfrac{\\sqrt{2}}{2}$ et $\\sin(\\alpha)=\\dfrac{\\sqrt{2}}{2}$. <br>
       
        Quelle est la valeur de $\\alpha$ en radians ?`
        this.correction = `$\\cos \\dfrac{3\\pi}{4}=-\\dfrac{\\sqrt{2}}{2}$ et $\\sin \\dfrac{3\\pi}{4}=\\dfrac{\\sqrt{2}}{2}$.<br>
          $\\dfrac{3\\pi}{4}\\in ${choix1}$, donc $\\alpha=${miseEnEvidence('\\dfrac{3\\pi}{4}')}$.`
        this.reponse = '\\dfrac{3\\pi}{4}'
        break
      case 6: // 5pi/6
        this.question = `$\\alpha$ est un réel de $${choix1}$ vérifiant $\\cos(\\alpha)=-\\dfrac{\\sqrt{3}}{2}$ et $\\sin(\\alpha)=\\dfrac{1}{2}$. <br>
       
        Quelle est la valeur de $\\alpha$ en radians ?`
        this.correction = `$\\cos \\dfrac{5\\pi}{6}=-\\dfrac{\\sqrt{3}}{2}$ et $\\sin \\dfrac{5\\pi}{6}=\\dfrac{1}{2}$.<br>
          $\\dfrac{5\\pi}{6}\\in ${choix1}$, donc $\\alpha=${miseEnEvidence('\\dfrac{5\\pi}{6}')}$.`
        this.reponse = '\\dfrac{5\\pi}{6}'
        break
      case 7: // 7pi/6
        this.question = `$\\alpha$ est un réel de $${choix1}$ vérifiant $\\cos(\\alpha)=-\\dfrac{\\sqrt{3}}{2}$ et $\\sin(\\alpha)=-\\dfrac{1}{2}$. <br>
       
        Quelle est la valeur de $\\alpha$ en radians ?`
        if (choix1 === '[0\\,;\\,2\\pi[') {
          this.correction = `$\\cos \\dfrac{7\\pi}{6}=-\\dfrac{\\sqrt{3}}{2}$ et $\\sin \\dfrac{7\\pi}{6}=-\\dfrac{1}{2}$.<br>
          $\\dfrac{7\\pi}{6}\\in ${choix1}$, donc $\\alpha=${miseEnEvidence('\\dfrac{7\\pi}{6}')}$.`
          this.reponse = '\\dfrac{7\\pi}{6}'
        } else {
          this.correction = `$\\cos \\dfrac{-5\\pi}{6}=-\\dfrac{\\sqrt{3}}{2}$ et $\\sin \\dfrac{-5\\pi}{6}=-\\dfrac{1}{2}$.<br>
        $\\dfrac{-5\\pi}{6}\\in ${choix1}$, donc $\\alpha=${miseEnEvidence('\\dfrac{-5\\pi}{6}')}$.`
          this.reponse = '-\\dfrac{5\\pi}{6}'
        }
        break
      case 8: // 5pi/4
        this.question = `$\\alpha$ est un réel de $${choix1}$ vérifiant $\\cos(\\alpha)=-\\dfrac{\\sqrt{2}}{2}$ et $\\sin(\\alpha)=-\\dfrac{\\sqrt{2}}{2}$. <br>
       
        Quelle est la valeur de $\\alpha$ en radians ?`
        if (choix1 === '[0\\,;\\,2\\pi[') {
          this.correction = `$\\cos \\dfrac{5\\pi}{4}=-\\dfrac{\\sqrt{2}}{2}$ et $\\sin \\dfrac{5\\pi}{4}=-\\dfrac{\\sqrt{2}}{2}$.<br>
          $\\dfrac{5\\pi}{4}\\in ${choix1}$, donc $\\alpha=${miseEnEvidence('\\dfrac{5\\pi}{4}')}$.`
          this.reponse = '\\dfrac{5\\pi}{4}'
        } else {
          this.correction = `$\\cos \\dfrac{-3\\pi}{4}=-\\dfrac{\\sqrt{2}}{2}$ et $\\sin \\dfrac{-3\\pi}{4}=-\\dfrac{\\sqrt{2}}{2}$.<br>
        $\\dfrac{-3\\pi}{4}\\in ${choix1}$, donc $\\alpha=${miseEnEvidence('\\dfrac{-3\\pi}{4}')}$.`
          this.reponse = '-\\dfrac{3\\pi}{4}'
        }
        break
      case 9: // 4pi/3
        this.question = `$\\alpha$ est un réel de $${choix1}$ vérifiant $\\cos(\\alpha)=-\\dfrac{1}{2}$ et $\\sin(\\alpha)=-\\dfrac{\\sqrt{3}}{2}$. <br>
       
        Quelle est la valeur de $\\alpha$ en radians ?`
        if (choix1 === '[0\\,;\\,2\\pi[') {
          this.correction = `$\\cos \\dfrac{4\\pi}{3}=-\\dfrac{1}{2}$ et $\\sin \\dfrac{4\\pi}{3}=-\\dfrac{\\sqrt{3}}{2}$.<br>
          $\\dfrac{4\\pi}{3}\\in ${choix1}$, donc $\\alpha=${miseEnEvidence('\\dfrac{4\\pi}{3}')}$.`
          this.reponse = '\\dfrac{4\\pi}{3}'
        } else {
          this.correction = `$\\cos \\dfrac{-2\\pi}{3}=-\\dfrac{1}{2}$ et $\\sin \\dfrac{-2\\pi}{3}=-\\dfrac{1}{2}$.<br>
          $\\dfrac{-2\\pi}{3}\\in ${choix1}$, donc $\\alpha=${miseEnEvidence('-\\dfrac{2\\pi}{3}')}$.`
          this.reponse = '-\\dfrac{2\\pi}{3}'
        }
        break
      case 10: // 5pi/3
        this.question = `$\\alpha$ est un réel de $${choix1}$ vérifiant $\\cos(\\alpha)=\\dfrac{1}{2}$ et $\\sin(\\alpha)=-\\dfrac{\\sqrt{3}}{2}$. <br>
       
        Quelle est la valeur de $\\alpha$ en radians ?`
        if (choix1 === '[0\\,;\\,2\\pi[') {
          this.correction = `$\\cos \\dfrac{5\\pi}{3}=\\dfrac{1}{2}$ et $\\sin \\dfrac{5\\pi}{3}=-\\dfrac{\\sqrt{3}}{2}$.<br>
          $\\dfrac{5\\pi}{3}\\in ${choix1}$, donc $\\alpha=${miseEnEvidence('\\dfrac{5\\pi}{3}')}$.`
          this.reponse = '\\dfrac{5\\pi}{3}'
        } else {
          this.correction = `$\\cos \\dfrac{-\\pi}{3}=-\\dfrac{1}{2}$ et $\\sin \\dfrac{-\\pi}{3}=-\\dfrac{\\sqrt{3}}{2}$.<br>
          $\\dfrac{-\\pi}{3}\\in ${choix1}$, donc $\\alpha=${miseEnEvidence('-\\dfrac{\\pi}{3}')}$.`
          this.reponse = '-\\dfrac{\\pi}{3}'
        }
        break
      case 11: // 7pi/4
        this.question = `$\\alpha$ est un réel de $${choix1}$ vérifiant $\\cos(\\alpha)=\\dfrac{\\sqrt{2}}{2}$ et $\\sin(\\alpha)=-\\dfrac{\\sqrt{2}}{2}$. <br>
       
        Quelle est la valeur de $\\alpha$ en radians ?`
        if (choix1 === '[0\\,;\\,2\\pi[') {
          this.correction = `$\\cos \\dfrac{7\\pi}{4}=\\dfrac{\\sqrt{2}}{2}$ et $\\sin \\dfrac{7\\pi}{4}=-\\dfrac{\\sqrt{2}}{2}$.<br>
          $\\dfrac{7\\pi}{4}\\in ${choix1}$, donc $\\alpha=${miseEnEvidence('\\dfrac{7\\pi}{4}')}$.`
          this.reponse = '\\dfrac{7\\pi}{4}'
        } else {
          this.correction = `$\\cos \\dfrac{-\\pi}{4}=-\\dfrac{\\sqrt{2}}{2}$ et $\\sin \\dfrac{-\\pi}{4}=-\\dfrac{\\sqrt{2}}{2}$.<br>
          $\\dfrac{-\\pi}{4}\\in ${choix1}$, donc $\\alpha=${miseEnEvidence('-\\dfrac{\\pi}{4}')}$.`
          this.reponse = '-\\dfrac{\\pi}{4}'
        }
        break
      case 12: // 11pi/6
        this.question = `$\\alpha$ est un réel de $${choix1}$ vérifiant $\\cos(\\alpha)=\\dfrac{\\sqrt{3}}{2}$ et $\\sin(\\alpha)=-\\dfrac{1}{2}$. <br>
       
        Quelle est la valeur de $\\alpha$ en radians ?`
        if (choix1 === '[0\\,;\\,2\\pi[') {
          this.correction = `$\\cos \\dfrac{11\\pi}{6}=\\dfrac{\\sqrt{3}}{2}$ et $\\sin \\dfrac{11\\pi}{6}=-\\dfrac{1}{2}$.<br>
          $\\dfrac{11\\pi}{6}\\in ${choix1}$, donc $\\alpha=${miseEnEvidence('\\dfrac{11\\pi}{6}')}$.`
          this.reponse = '\\dfrac{11\\pi}{6}'
        } else {
          this.correction = `$\\cos \\dfrac{-\\pi}{6}=\\dfrac{\\sqrt{3}}{2}$ et $\\sin \\dfrac{-\\pi}{6}=-\\dfrac{1}{2}$.<br>
        $\\dfrac{-\\pi}{6}\\in ${choix1}$, donc $\\alpha=${miseEnEvidence('-\\dfrac{\\pi}{6)}')}$.`
          this.reponse = '-\\dfrac{\\pi}{6}'
        }
        break

      case 13: // 0, pi/2, pi, 3pi/2
        if (choix2 === 'a') {
          this.question = `$\\alpha$ est un réel de $${choix1}$ vérifiant $\\cos(\\alpha)=1$. <br>
       
          Quelle est la valeur de $\\alpha$ en radians ?`
          this.correction = `$\\cos 0=1$.<br>
          $0\\in ${choix1}$, donc $\\alpha=0$.`
          this.reponse = '0'
        } else if (choix2 === 'b') {
          this.question = `$\\alpha$ est un réel de $${choix1}$ vérifiant $\\sin(\\alpha)=1$. <br>
        Quelle est la valeur de $\\alpha$ en radians ?`
          this.correction = ` $\\sin \\dfrac{\\pi}{2}=1$.<br>
          $\\dfrac{\\pi}{2}\\in ${choix1}$, donc $\\alpha=${miseEnEvidence('\\dfrac{\\pi}{2}')}$.`
          this.reponse = '\\dfrac{\\pi}{2}'
        } else if (choix2 === 'c') {
          this.question = `$\\alpha$ est un réel de $${choix1}$ vérifiant $\\cos(\\alpha)=-1$. <br>
       
          Quelle est la valeur de $\\alpha$ en radians ?`
          this.correction = `$\\cos \\pi=-1$.<br>
          $\\pi \\in ${choix1}$, donc $\\alpha=${miseEnEvidence('\\pi')}$.`
          this.reponse = '\\pi'
        } else {
          this.question = `$\\alpha$ est un réel de $${choix1}$ vérifiant $\\sin(\\alpha)=-1$. <br>
      
          Quelle est la valeur de $\\alpha$ en radians ?`
          if (choix1 === '[0\\,;\\,2\\pi[') {
            this.correction = `$\\sin \\dfrac{3\\pi}{2}=-1$.<br>
          $\\dfrac{3\\pi}{2} \\in ${choix1}$, donc $\\alpha=${miseEnEvidence('\\dfrac{3\\pi}{2}')}$.`
            this.reponse = '\\dfrac{3\\pi}{2}'
          } else {
            this.correction = `$\\sin \\dfrac{-\\pi}{2}=-1$.<br>
          $\\dfrac{-\\pi}{2} \\in ${choix1}$, donc $\\alpha=${miseEnEvidence('-\\dfrac{\\pi}{2}')}$.`
            this.reponse = '-\\dfrac{\\pi}{2}'
          }
        }

        break
    }

    this.canReponseACompleter = '$\\alpha=\\ldots$'
  }
}
