import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { texPrix, texteGras } from '../../lib/format/style'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { numAlpha } from '../../lib/outils/outilString'
import { prenomF, prenomM } from '../../lib/outils/Personne'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Résoudre un problème en utilisant une somme algébrique de relatifs'
export const interactifReady = true

export const dateDeModifImportante = '12/09/2026'

/**
 * * résoudre un problème additif avec des relatifs
 * @author Sébastien Lozano
 * Rendu interactif par Eric Elter le 15/04/2026
 */

export const uuid = '6667e'

export const refs = {
  'fr-fr': ['5N2H-1'],
  'fr-2016': ['5R20-4'],
  'fr-ch': ['9R2NO3D-8', '9R3NO3D-8', 'PRQNO06B-7'],
}
export default class ProblemesAdditifsRelatifs5e extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 2
    this.spacing = context.isHtml ? 1 : 1
    this.spacingCorr = context.isHtml ? 2 : 0.5
  }

  nouvelleVersion() {
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      let gainPerteUnitaire // pour le gain/perte unitaire
      let gainMultiple // pour le gain multiple
      let nombreTotalDeLancers // nombre total de lancers
      let nombreDeGainsUnitaires // nb de gains untitaires
      let nombreDePertes // nb de pertes
      let total
      do {
        // on veut des multiples de 5 pour n'avoir que des demis entiers ou des entiers
        do {
          gainPerteUnitaire = randint(10, 30)
          gainMultiple = randint(10, 30)
        } while (
          gainPerteUnitaire % 5 !== 0 ||
          gainMultiple % 5 !== 0 ||
          gainMultiple <= gainPerteUnitaire
        )
        nombreTotalDeLancers = randint(5, 10)
        do {
          nombreDeGainsUnitaires = randint(2, 5)
          nombreDePertes = randint(2, 5)
        } while (
          nombreDeGainsUnitaires + nombreDePertes >=
          nombreTotalDeLancers
        )
        // on échange parfois le nombre de gain unitaire et le nombre de perte pour avoir un bilan négatif plus souvent
        if (nombreDePertes < nombreDeGainsUnitaires) {
          if (randint(0, 1) === 0) {
            const temp = nombreDePertes
            nombreDePertes = nombreDeGainsUnitaires
            nombreDeGainsUnitaires = temp
          }
        }
        total =
          arrondi(
            (nombreTotalDeLancers - nombreDeGainsUnitaires - nombreDePertes) *
              arrondi(gainMultiple / 10),
          ) +
          arrondi(nombreDeGainsUnitaires * arrondi(gainPerteUnitaire / 10)) -
          arrondi(nombreDePertes * arrondi(gainPerteUnitaire / 10))
      } while (total === 0)

      const prenoms = [
        [prenomF(), 'Elle', 'elle'],
        [prenomM(), 'Il', 'il'],
      ]
      const currentPrenom = choice(prenoms)

      // une fonction pour écrire les chaine correctives
      const myGainPerteString = function (
        nb: number,
        type: 'gain' | 'perte',
        valeur: number,
      ) {
        let sortie = ''
        switch (type) {
          case 'gain':
            sortie = `(+${texPrix(valeur)}~$€$)`
            for (let m = 1; m < nb; m++) {
              sortie += `+(+${texPrix(valeur)}~$€$)`
            }
            break
          case 'perte':
            sortie = `(-${texPrix(valeur)}~$€$)`
            for (let m = 1; m < nb; m++) {
              sortie += `+(-${texPrix(valeur)}~$€$)`
            }
            break
        }
        return sortie
      }

      // une fonction pour dire si le bilan est positif ou négatif
      const isBilanPositif = function (tot: number) {
        return tot >= 0
      }

      let bilan
      if (isBilanPositif(total)) {
        bilan = [
          'Globalement, le montant des gains',
          'est supérieur au montant des pertes',
          `Donc, ${texteEnCouleurEtGras('oui')} (${texteEnCouleurEtGras('O')}), ${currentPrenom[0]} a gagné de l'argent.`,
          'a gagné',
          texPrix(total),
        ]
      } else {
        bilan = [
          'Globalement, le montant des gains',
          'est inférieur au montant des pertes',
          `Donc, ${texteEnCouleurEtGras('non')} (${texteEnCouleurEtGras('N')}), ${currentPrenom[0]} n'a pas gagné d'argent.`,
          'a perdu',
          texPrix(-1 * total),
        ]
      }
      // pour les situations
      const situations = {
        // case 0 --> les quilles
        nb_tot_lancers: nombreTotalDeLancers,
        nb_gains_unitaires: nombreDeGainsUnitaires,
        nb_pertes: nombreDePertes,
        nb_gains:
          nombreTotalDeLancers - nombreDeGainsUnitaires - nombreDePertes,
        perte: arrondi(gainPerteUnitaire / 10),
        gain_unitaire: arrondi(gainPerteUnitaire / 10),
        gain_multiple: arrondi(gainMultiple / 10),
        enonce_1: 'lancer une balle sur des quilles.',
        enonce_2: '- Si la balle touche plusieurs quilles, le joueur gagne ',
        enonce_3: "- Si la balle ne touche qu'une quille, le joueur gagne ",
        enonce_4: '- Si la balle ne touche aucune quille, le joueur perd ',
        enonce_5: 'a lancé',
        enonce_6: 'la balle',
        correction_1: 'touché plusieurs quilles',
        correction_2: "touché qu'une seule quille",
        prenom: currentPrenom[0], // prenoms[choice([0,1])][0],
        pronomMaj: currentPrenom[1], // prenoms[choice([0,1])][1],
        pronomMin: currentPrenom[2], // prenoms[choice([0,1])][2],
        bilan,
      }

      const enonces = []
      enonces.push({
        enonce: `Un jeu consiste à ${situations.enonce_1}<br>
${situations.enonce_2} $${texPrix(situations.gain_multiple)}~$€.<br>
${situations.enonce_3} $${texPrix(situations.gain_unitaire)}~$€.<br>
${situations.enonce_4} $${texPrix(situations.perte)}~$€.<br>
${situations.prenom} ${situations.enonce_5} $${situations.nb_tot_lancers}$ fois ${situations.enonce_6}.<br>
${situations.pronomMaj} a perdu de l'argent $${situations.nb_pertes}$ fois et a gagné $${situations.nb_gains_unitaires}$ fois $${texPrix(situations.gain_unitaire)}~$€.<br> 
${numAlpha(0)} A-t-${situations.pronomMin} gagné de l'argent ? ${this.interactif ? `%{champ1}` : ''}<br> 
${numAlpha(1)} Combien a-t-${situations.pronomMin} globalement gagné ou perdu ? ${this.interactif ? `%{champ2}` : ''}
`,
        question: '',
        correction: `
${situations.prenom} ${situations.enonce_5} $${situations.nb_tot_lancers}$ fois ${situations.enonce_6}.<br>
Sur les $${situations.nb_tot_lancers}$ lancers, on sait combien de fois ${situations.pronomMin} a perdu de l'argent et combien de fois ${situations.pronomMin} a gagné $${texPrix(situations.gain_unitaire)}~$€.<br>
Les autres lancers correspondent donc au nombre de fois où ${situations.pronomMin} a ${situations.correction_1} et gagné $${texPrix(situations.gain_multiple)}~$€.<br>
$${situations.nb_tot_lancers}-${situations.nb_pertes}-${situations.nb_gains_unitaires} = ${situations.nb_tot_lancers - situations.nb_pertes - situations.nb_gains_unitaires}$,
${situations.pronomMin} a donc ${situations.correction_1} $${situations.nb_gains}$ fois.<br>
${texteGras(`Gains lorsqu'${situations.pronomMin} a ${situations.correction_1} :`)}<br>
$${myGainPerteString(situations.nb_gains, 'gain', situations.gain_multiple)} = ${situations.nb_gains}\\times (+${texPrix(situations.gain_multiple)}~$€$) = (+${texPrix(situations.nb_gains * situations.gain_multiple)}~$€)<br>
${texteGras(`Gains lorsqu'${situations.pronomMin} n'a ${situations.correction_2} :`)}<br>
$${myGainPerteString(situations.nb_gains_unitaires, 'gain', situations.gain_unitaire)} = ${situations.nb_gains_unitaires}\\times (+${texPrix(situations.gain_unitaire)}~$€$) = (+${texPrix(situations.nb_gains_unitaires * situations.gain_unitaire)}~$€)<br>
${texteGras('Pertes :')}<br>
$${myGainPerteString(situations.nb_pertes, 'perte', situations.perte)} = ${situations.nb_pertes}\\times (-${texPrix(situations.perte)}~$€$) = (-${texPrix(situations.nb_pertes * situations.perte)}~$€)<br>
${numAlpha(0)} ${situations.bilan[0]} ${situations.bilan[1]}.<br> 
${situations.bilan[2]}<br>
${numAlpha(1)} 
$(+${texPrix(situations.nb_gains * situations.gain_multiple)}~$€$)+(+${texPrix(situations.nb_gains_unitaires * situations.gain_unitaire)}~$€$)+(-${texPrix(situations.nb_pertes * situations.perte)}~$€$) = (${situations.bilan[3].includes('perdu') ? '' : '+'}${texPrix(situations.nb_gains * situations.gain_multiple + situations.nb_gains_unitaires * situations.gain_unitaire - situations.nb_pertes * situations.perte)}~$€$)$<br>
Globalement, ${situations.prenom} ${situations.bilan[3]} $${miseEnEvidence(situations.bilan[4])}~$€.
`,
      })

      texte = this.interactif
        ? `${addMultiMathfield(this, i, {
            dataTemplate: `${enonces[0].enonce}`,
            dataOptions: {
              champ1: {
                keyboard: KeyboardType.vFON,
              },
              champ2: {
                keyboard: KeyboardType.clavierDeBase,
                texteApres: ' €',
              },
            },
          })}`
        : `${enonces[0].enonce}`
      handleAnswers(
        this,
        i,
        {
          champ1: {
            value: situations.bilan[3].includes('perdu')
              ? ['F', 'Faux', 'N', 'Non']
              : ['V', 'Vrai', 'O', 'Oui'],
            options: { texteSansCasse: true },
          },
          champ2: {
            value: situations.bilan[4],
            options: { nombreDecimalSeulement: true },
          },
        },
        { formatInteractif: 'multi-mathfield' },
      )

      texteCorr = `${enonces[0].correction}`

      if (this.listeQuestions.indexOf(texte) === -1) {
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
