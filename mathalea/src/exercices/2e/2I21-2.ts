import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { egalOuApprox } from '../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { arrondi } from '../../lib/outils/nombres'

export const titre = "Déterminer un taux d'évolution réciproque"
export const interactifReady = true

export const dateDePublication = '16/01/2022'

/**
 * Problèmes d'évolution réciproque'
 *
 * * Situations variées : prix, tarif horaire, nombre d'employés
 * * Déterminer un taux d'évolution réciproque
 * * Mélange des 3 types de problèmes
 * @author Florence Tapiero
 */
export const uuid = '509db'

export const refs = {
  'fr-fr': ['2I21-2', 'BP1CF08'],
  'fr-ch': [],
}
export default class EvolutionsSuccesives extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 3

    this.sup = 4 // type de questions
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = [1, 2, 3]
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posées mais l'ordre diffère à chaque "cycle"
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const typesDeQuestions = listeTypeDeQuestions[i]
      let taux: number
      let nom: string
      let p: number
      let CM: number
      let CMr: number
      let CMra: number
      let pr: number
      let tauxr: number
      let tr: number
      let nomr: string
      let t: number
      let texte = ''
      let texteCorr = ''
      let metier = ''
      switch (typesDeQuestions) {
        case 1:
          taux = randint(-50, 50, 0)
          if (taux > 0) {
            nom = 'hausse'
          } else {
            nom = 'baisse'
          }
          p = taux / 100
          t = Math.abs(taux)
          CM = 1 + p
          CMr = 1 / CM
          CMra = arrondi(CMr, 4)
          pr = CMra - 1
          tauxr = pr * 100
          tr = Math.abs(tauxr)
          if (tauxr > 0) {
            nomr = 'hausse'
          } else {
            nomr = 'baisse'
          }
          texte = `Le prix d'un article subit une ${nom} de $${t}\\,\\%$.<br>Quelle évolution devra-t-il subir pour revenir à son prix initial ?`
          texte +=
            "<br>On donnera le taux d'évolution en pourcentage, éventuellement arrondi à $0,01\\,\\%$ près."
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierDeBase,
            { texteApres: '%' },
          )
          texteCorr =
            "Pour déterminer le taux d'évolution réciproque, on commence par calculer le coefficient multiplicateur associé :"
          if (taux > 0) {
            texteCorr += `<br>Augmenter de $${t}\\,\\%$ revient à multiplier par $ 1 + \\dfrac{${t}}{100} = ${texNombre(CM, 2)}$ `
          }
          if (taux < 0) {
            texteCorr += `<br>Diminuer de $${t}\\,\\%$ revient à multiplier par $ 1 - \\dfrac{${t}}{100} = ${texNombre(CM, 2)}$ `
          }
          texteCorr += `<br><br>Le coefficient multiplicateur réciproque est donc :<br> $CM_R=\\dfrac{1}{${texNombre(CM, 2)}} ${egalOuApprox(CMr, 4)} ${texNombre(CMra, 4)}$.`
          if (CMr - CMra !== 0) {
            texteCorr += texteEnCouleur(
              '<br>Remarque : Il faut arrondir les valeurs à $10^{-4}$ pour avoir un arrondi en pourcentage à $10^{-2}$.',
              bleuMathalea,
            )
          }
          if (CMr > 1) {
            texteCorr += `<br><br> Le taux d'évolution réciproque est donc : <br>$T_R=CM_R-1=${texNombre(CMra, 4)}-1=${texNombre(pr, 4)}=${texNombre(tr, 2)}\\,\\%$ ce qui correspond à une hausse de $${texNombre(tr, 2)}\\,\\%$.`
          }
          if (CMr < 1) {
            texteCorr += `<br><br> Le taux d'évolution réciproque est donc : <br>$T_R=CM_R-1=${texNombre(CMra, 4)}-1=${texNombre(pr, 4)}=-${texNombre(tr, 2)}\\,\\%$ ce qui correspond à une baisse de $${texNombre(tr, 2)}\\,\\%$.`
          }
          if (CMr - CMra === 0) {
            texteCorr += `<br><br>Il faut donc appliquer une ${nomr} de $${texNombre(tr, 2)}\\,\\%$, soit un taux d'évolution de $${miseEnEvidence(texNombre(tauxr, 2))}\\,\\%$, pour revenir au prix initial.`
          } else {
            texteCorr += `<br><br>Il faut donc appliquer une ${nomr} d'environ $${texNombre(tr, 2)}\\,\\%$, soit un taux d'évolution de $${miseEnEvidence(texNombre(tauxr, 2))}\\,\\%$, pour revenir au prix initial.`
          }
          break
        case 2:
          taux = randint(-50, 50, 0)
          if (taux > 0) {
            nom = "d'augmenter"
          } else {
            nom = 'de diminuer'
          }
          p = taux / 100
          t = Math.abs(taux)
          CM = 1 + p
          CMr = 1 / CM
          CMra = arrondi(CMr, 4)
          pr = CMra - 1
          tauxr = pr * 100
          tr = Math.abs(tauxr)

          if (tauxr > 0) {
            nomr = 'hausse'
          } else {
            nomr = 'baisse'
          }
          metier = choice([
            'Un artisan',
            'Un ouvrier',
            'Un coiffeur',
            'Une informaticienne',
            'Une cordonnière',
            'Une luthière',
          ])
          texte = `${metier} a décidé ${nom} son tarif horaire de $${t}\\,\\%$.<br>Quelle évolution devra-t-il subir pour revenir à son niveau de départ ?`
          texte +=
            "<br>On donnera le taux d'évolution en pourcentage, éventuellement arrondi à $0,01\\,\\%$ près."
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierDeBase,
            { texteApres: '%' },
          )
          texteCorr =
            "Pour déterminer le taux d'évolution réciproque, on commence par calculer le coefficient multiplicateur associé :"
          if (taux > 0) {
            texteCorr += `<br>Augmenter de $${t}\\,\\%$ revient à multiplier par $ 1 + \\dfrac{${t}}{100} = ${texNombre(CM, 2)}$ `
          }
          if (taux < 0) {
            texteCorr += `<br>Diminuer de $${t}\\,\\%$ revient à multiplier par $ 1 - \\dfrac{${t}}{100} = ${texNombre(CM, 2)}$ `
          }
          texteCorr += `<br><br>Le coefficient multiplicateur réciproque est donc : <br>
          $CM_R=\\dfrac{1}{${texNombre(CM, 2)}} ${egalOuApprox(CMr, 4)} ${texNombre(CMr, 4)}$.`
          if (CMr - CMra !== 0) {
            texteCorr += texteEnCouleur(
              '<br>Remarque : Il faut arrondir les valeurs à $10^{-4}$ pour avoir un arrondi en pourcentage à $10^{-2}$.',
              bleuMathalea,
            )
          }
          if (CMr > 1) {
            texteCorr += `<br><br> Le taux d'évolution réciproque est donc : <br>$T_R=CM_R-1=${texNombre(CMra, 4)}-1=${texNombre(pr, 4)}=${texNombre(tr, 2)}\\,\\%$ ce qui correspond à une hausse de $${texNombre(tr, 2)}\\,\\%$.`
          }
          if (CMr < 1) {
            texteCorr += `<br><br> Le taux d'évolution réciproque est donc : <br>$T_R=CM_R-1=${texNombre(CMra, 4)}-1=${texNombre(pr, 4)}=-${texNombre(tr, 2)}\\,\\%$ ce qui correspond à une baisse de $${texNombre(tr, 2)}\\,\\%$.`
          }
          if (CMr - CMra === 0) {
            texteCorr += `<br><br>Il faut donc appliquer une ${nomr} de $${texNombre(tr, 2)}\\,\\%$, soit un taux d'évolution de $${miseEnEvidence(texNombre(tauxr, 2))}\\,\\%$, pour revenir au niveau de départ.`
          } else {
            texteCorr += `<br><br>Il faut donc appliquer une ${nomr} d'environ $${texNombre(tr, 2)}\\,\\%$, soit un taux d'évolution de $${miseEnEvidence(texNombre(tauxr, 2))}\\,\\%$, pour revenir au niveau de départ.`
          }
          break
        case 3:
        default:
          taux = randint(-50, 50, 0)
          if (taux > 0) {
            nom = 'augmenté'
          } else {
            nom = 'baissé'
          }
          p = taux / 100
          t = Math.abs(taux)
          CM = 1 + p
          CMr = 1 / CM
          CMra = arrondi(CMr, 4)
          pr = CMra - 1
          tauxr = pr * 100
          tr = Math.abs(tauxr)
          if (tauxr > 0) {
            nomr = 'hausse'
          } else {
            nomr = 'baisse'
          }
          metier = choice([
            "d'employés",
            'de commerciaux',
            'de stagiaires',
            'de jeunes diplomés',
          ])
          texte = `Le nombre ${metier} d'une entreprise a ${nom} de $${t}\\,\\%$.<br>Quelle évolution permettrait de retrouver le nombre de départ ?`
          texte +=
            "<br>On donnera le taux d'évolution en pourcentage, éventuellement arrondi à $0,01\\,\\%$ près."
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierDeBase,
            { texteApres: '%' },
          )
          texteCorr =
            "Pour déterminer le taux d'évolution réciproque, on commence par calculer le coefficient multiplicateur associé :"
          if (taux > 0) {
            texteCorr += `<br>Augmenter de $${t}~\\%$ revient à multiplier par $ 1 + \\dfrac{${t}}{100} = ${texNombre(CM, 2)}$ `
          }
          if (taux < 0) {
            texteCorr += `<br>Diminuer de $${t}\\,\\%$ revient à multiplier par $ 1 - \\dfrac{${t}}{100} = ${texNombre(CM, 2)}$ `
          }
          texteCorr += `<br><br>Le coefficient multiplicateur réciproque est donc : <br>$CM_R=\\dfrac{1}{${texNombre(CM, 2)}} ${egalOuApprox(CMr, 3)} ${texNombre(CMr, 4)}$.`
          if (CMr - CMra !== 0) {
            texteCorr += texteEnCouleur(
              '<br>Remarque : Il faut arrondir les valeurs à $10^{-4}$ pour avoir un arrondi en pourcentage à $10^{-2}$.',
              bleuMathalea,
            )
          }
          if (CMr > 1) {
            texteCorr += `<br><br> Le taux d'évolution réciproque est donc : <br>$T_R=CM_R-1=${texNombre(CMra, 4)}-1=${texNombre(pr, 4)}=${texNombre(tr, 2)}\\,\\%$ ce qui correspond à une hausse de $${texNombre(tr, 2)}\\,\\%$.`
          }
          if (CMr < 1) {
            texteCorr += `<br><br> Le taux d'évolution réciproque est donc : <br>$T_R=CM_R-1=${texNombre(CMra, 4)}-1=${texNombre(pr, 4)}=-${texNombre(tr, 2)}\\,\\%$ ce qui correspond à une baisse de $${texNombre(tr, 2)}\\,\\%$.`
          }

          if (CMr - CMra === 0) {
            texteCorr += `<br><br>Il faut donc appliquer une ${nomr} de $${texNombre(tr, 2)}\\,\\%$, soit un taux d'évolution de $${miseEnEvidence(texNombre(tauxr, 2))}\\,\\%$, pour revenir au niveau de départ.`
          } else {
            texteCorr += `<br><br>Il faut donc appliquer une ${nomr} d'environ $${texNombre(tr, 2)}\\,\\%$, soit un taux d'évolution de $${miseEnEvidence(texNombre(tauxr, 2))}\\,\\%$, pour revenir au niveau de départ.`
          }
          break
      }
      handleAnswers(this, i, { reponse: { value: texNombre(tauxr, 2) } })
      if (this.questionJamaisPosee(i, taux)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
