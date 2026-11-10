import type { IExerciceBrevet } from '../lib/types'
import Exercice from './Exercice'

// export const uuid = 'UUID à modifier'
// export const titre = 'Titre de l'exercice à modifier'
// export const refs = [{'fr-fr',['ref française à renseigner']},{'fr-ch', ['ref suisse à renseigner]}]

export const interactifReady = true
export const amcReady = 'true'
export const amcType = 'qcmMono'

export const nombreElementsDifferents = (liste: string[]) => {
  const elements = new Set(liste)
  return elements.size
}

// class à utiliser pour fabriquer des Qcms sans aléatoirisation (en cas d'aléatoirisation, on utilisera ExerciceQcmA à la place)
/**
 * @author Jean-claude Lhote
 */
export default class ExerciceBrevet
  extends Exercice
  implements IExerciceBrevet
{
  enonce!: string
  checksum!: string
  versionAleatoire?: (i: number) => void
  versionOriginale: () => void = () => {
    // Le texte récupéré avant le bloc des réponses (il ne faut pas oublier de doubler les \ du latex et de vérifier que les commandes latex sont supportées par Katex)
    this.enonce = 'Enoncé de la question'
    // Ici, on colle les différentes réponses prise dans le latex : attention !!! mettre la bonne en premier (elles seront brassées par propositionsQcm)
    this.correction = 'La correction'
  }

  constructor() {
    super()
    // Il n'est pas prévu d'avoir plus d'une question car ceci est prévu pour un seul énoncé statique à la base même si on pourra changer les valeurs et prévoir une aléatoirisation
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.spacing = 1.5 // à adapter selon le contenu de l'énoncé
    this.spacingCorr = 2 // idem pour la correction
    // Les options pour le qcm à modifier éventuellement (vertical à true pour les longues réponses par exemple)
    this.versionOriginale()
  }

  nouvelleVersion() {
    if (this.versionAleatoire != null) {
      for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 30;) {
        if (this.sup) this.versionOriginale()
        else this.versionAleatoire(i)
        if (this.questionJamaisPosee(i, String(this.correction))) {
          // Ici on colle le texte de la correction à partir du latex d'origine (vérifier la compatibilité Katex et doubler les \)s
          this.listeQuestions[i] = this.enonce
          this.listeCorrections[i] = String(this.correction) // Pour le cas où this.correction est undefined
          i++
        }
        cpt++
        if (this.sup) break // Si on a coché pour la version originale, il n'y aura qu'une seule question
      }
    } else {
      this.versionOriginale()
      this.listeQuestions[0] = this.enonce
      this.listeCorrections[0] = String(this.correction)
    }
  }
}
