import Decimal from 'decimal.js'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { Tableau } from '../../lib/2d/tableau'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const titre =
  'Étudier une situation de proportionnalité avec des échelles'
export const dateDePublication = '15/03/2024'
export const interactifReady = true

export const uuid = '412a7'
export const refs = {
  'fr-ch': ['10CTFA1F-3', '10LCFA1F-3', '10LSFA1F-3', 'PRQPF03B-2', 'PRQPF04B-2'],
  'fr-fr': [],
}
// export const dateDeModifImportante = '24/10/2021'

/**
 *
 * @author Nathan Scheinmann
 */

export default class EchellesCartes extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 3
    this.sup = 4
    this.besoinFormulaireNumerique = [
      'Type de questions',
      4,
      '1 : Distance sur la carte\n2 : Distance réelle\n3 : Échelle\n4 : Mélange',
    ]
  }

  nouvelleVersion() {
    let typeQuestionsDisponibles: ('carte' | 'reelle' | 'echelle')[]
    if (this.sup === 1) {
      typeQuestionsDisponibles = ['carte']
    } else if (this.sup === 2) {
      typeQuestionsDisponibles = ['reelle']
    } else if (this.sup === 3) {
      typeQuestionsDisponibles = ['echelle']
    } else {
      typeQuestionsDisponibles = ['carte', 'reelle', 'echelle']
    }

    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const dCarte = randint(2, 30)
      const echelle = new Decimal(randint(1, 50, dCarte))
        .mul(choice([1, 10, 100, 1000]))
        .mul(1000)
      const dReelle = new Decimal(echelle.mul(dCarte))
      const dReelleKm = dReelle.div(100000)
      const echelleKm = echelle.div(100000)
      this.comment =
        "Dans cet exercice, l'échelle est le rapport de 1 et d'un nombre entier entre 1 et 50 multiplié par 1000, 10000, 100000 ou 1000000 et la distance sur la carte est un nombre entier entre 2 et 30."
      const premiereLigneReelle = ['$1$', '$d$']
      const deuxiemeLigneReelle = [
        `$${texNombre(echelleKm, 3)}$`,
        `$${texNombre(dReelleKm, 3)}$`,
      ]
      const premiereLigneCarte = ['$1$', `$${texNombre(dCarte, 3)}$`]
      const deuxiemeLigneCarte = [`$${texNombre(echelleKm, 3)}$`, '$d$']
      const premiereLigneEchelle = ['$1$', `$${texNombre(dCarte, 3)}$`]
      const deuxiemeLigneEchelle = ['$d$', `$${texNombre(dReelleKm, 3)}$`]
      const ligne1CorrCarte = [{ texte: 'Distance sur la carte (cm)' }].concat(
        premiereLigneCarte.map((elt) => {
          return { texte: String(elt), math: true }
        }),
      )
      const ligne2CorrCarte = [{ texte: 'Distance réelle (km)' }].concat(
        deuxiemeLigneCarte.map((elt) => {
          return { texte: String(elt), math: true }
        }),
      )
      const monTableauCorrCarte = new Tableau({
        largeurTitre: 10,
        largeur: 5,
        hauteur: 2,
        nbColonnes: 3,
        ligne1: ligne1CorrCarte,
        ligne2: ligne2CorrCarte,
      })
      const ligne1CorrReelle = [{ texte: 'Distance sur la carte (cm)' }].concat(
        premiereLigneReelle.map((elt) => {
          return { texte: String(elt), math: true }
        }),
      )
      const ligne2CorrReelle = [{ texte: 'Distance réelle (km)' }].concat(
        deuxiemeLigneReelle.map((elt) => {
          return { texte: String(elt), math: true }
        }),
      )
      const monTableauCorrReelle = new Tableau({
        largeurTitre: 10,
        largeur: 5,
        hauteur: 2,
        nbColonnes: 3,
        ligne1: ligne1CorrReelle,
        ligne2: ligne2CorrReelle,
      })
      const ligne1CorrEchelle = [
        { texte: 'Distance sur la carte (cm)' },
      ].concat(
        premiereLigneEchelle.map((elt) => {
          return { texte: String(elt), math: true }
        }),
      )
      const ligne2CorrEchelle = [{ texte: 'Distance réelle (km)' }].concat(
        deuxiemeLigneEchelle.map((elt) => {
          return { texte: String(elt), math: true }
        }),
      )
      const monTableauCorrEchelle = new Tableau({
        largeurTitre: 10,
        largeur: 5,
        hauteur: 2,
        nbColonnes: 3,
        ligne1: ligne1CorrEchelle,
        ligne2: ligne2CorrEchelle,
      })
      let texte = ''
      let texteCorr = ''
      switch (listeTypeQuestions[i]) {
        case 'carte':
          texte = `Tu mesures sur une carte d'échelle $1:${texNombre(echelle, 3)}$ une distance de $${texNombre(dCarte, 3)}\\,\\text{cm}$ entre deux villes.
          <br>Quelle est la distance réelle (en $\\text{km}$) entre ces deux villes ?`
          texteCorr = `L'échelle d'une carte correspond au rapport entre la distance sur la carte et la distance réelle. 
          Dans notre cas, $1\\,\\text{cm}$ sur la carte correspond à $${texNombre(echelle, 3)}\\,\\text{cm} = ${texNombre(echelleKm, 3)}\\,\\text{km}$ dans la réalité. 
          Ainsi, `
          if (context.isHtml) {
            texteCorr += mathalea2d(
              Object.assign({}, fixeBordures([monTableauCorrCarte])),
              monTableauCorrCarte,
            )
          } else {
            texteCorr +=
              '\n\n\\Propor[Math,Stretch=2,largeur=15, GrandeurA=Dist. carte ($\\text{cm}$),GrandeurB=Dist. réelle ($\\text{km}$)]{'
            texteCorr += `{${premiereLigneCarte[0]}}/{${deuxiemeLigneCarte[0]}},{${premiereLigneCarte[1]}}/{${deuxiemeLigneCarte[1]}}}<br>`
          }
          texteCorr += `<br> et en utilisant le produit en croix, on obtient que $d=${texNombre(echelleKm, 3)} \\times ${texNombre(dCarte, 3)} \\div 1  = ${miseEnEvidence(texNombre(dReelleKm, 3))}\\,\\text{km}$.`
          if (this.interactif && context.isHtml) {
            texte +=
              '<br>La distance réelle est de ' +
              remplisLesBlancs(this, i, '%{champ1}') +
              '$\\,\\text{km}.$'
            handleAnswers(
              this,
              i,
              {
                bareme: (listePoints: number[]) => [listePoints[0], 1],
                champ1: { value: String(dReelleKm) },
              },
              { formatInteractif: 'fillInTheBlank' },
            )
          }
          break
        case 'reelle':
          texte = `Deux villes se situent à une distance de $${texNombre(dReelleKm, 3)}\\,\\text{km}$.<br>
          Quelle distance sépare les deux villes (en $\\text{cm}$) sur une carte d'échelle $1:${texNombre(echelle, 3)}$ ?`
          texteCorr = `L'échelle d'une carte correspond au rapport entre la distance sur la carte et la distance réelle. 
          Dans notre cas, $1\\,\\text{cm}$ sur la carte correspond à $${texNombre(echelle, 3)}\\,\\text{cm} = ${texNombre(echelleKm, 3)}\\,\\text{km}$ dans la réalité. 
          Ainsi, `
          if (context.isHtml) {
            texteCorr += mathalea2d(
              Object.assign({}, fixeBordures([monTableauCorrReelle])),
              monTableauCorrReelle,
            )
          } else {
            texteCorr +=
              '\n\n\\Propor[Math,Stretch=2,largeur=15, GrandeurA=Dist. carte ($\\text{cm}$),GrandeurB=Dist. réelle ($\\text{km}$)]{'
            texteCorr += `{${premiereLigneReelle[0]}}/{${deuxiemeLigneReelle[0]}},{${premiereLigneReelle[1]}}/{${deuxiemeLigneReelle[1]}}}<br>`
          }
          texteCorr += `<br> et en utilisant le produit en croix, on obtient que $d=1 \\times   ${texNombre(dReelleKm, 3)} \\div ${texNombre(echelleKm, 3)} = ${miseEnEvidence(texNombre(dCarte, 3))}\\,\\text{cm}$.`
          if (this.interactif && context.isHtml) {
            texte +=
              '<br> La distance sur la carte est de ' +
              remplisLesBlancs(this, i, '%{champ1}') +
              '$\\,\\text{cm}$.'
            handleAnswers(
              this,
              i,
              {
                bareme: (listePoints: number[]) => [listePoints[0], 1],
                champ1: { value: String(dCarte) },
              },
              { formatInteractif: 'fillInTheBlank' },
            )
          }
          break
        case 'echelle':
          texte = `Deux villes se situent à une distance de $${texNombre(dCarte, 3)}\\,\\text{cm}$ sur une carte. Dans la réalité, elles se situent à $${texNombre(dReelleKm, 3)}\\,\\text{km}$ de distance.<br>
           Déterminer l'échelle de la carte.`
          texteCorr = `L'échelle d'une carte correspond au rapport entre la distance sur la carte et la distance réelle. 
          Dans notre cas, $${texNombre(dCarte, 3)}\\,\\text{cm}$ sur la carte correspondent à $${texNombre(dReelle, 3)}\\,\\text{cm}=${texNombre(dReelleKm, 3)}\\,\\text{km}$ dans la réalité. 
          Ainsi,`
          if (context.isHtml) {
            texteCorr += mathalea2d(
              Object.assign({}, fixeBordures([monTableauCorrEchelle])),
              monTableauCorrEchelle,
            )
          } else {
            texteCorr +=
              '\n\n\\Propor[Math,Stretch=2,largeur=15, GrandeurA=Dist. carte ($\\text{cm}$),GrandeurB=Dist. réelle ($\\text{km}$)]{'
            texteCorr += `{${premiereLigneEchelle[0]}}/{${deuxiemeLigneEchelle[0]}},{${premiereLigneEchelle[1]}}/{${deuxiemeLigneEchelle[1]}}}<br>`
          }
          texteCorr += `<br> donc $d=${texNombre(dReelleKm, 3)} \\div  ${texNombre(dCarte, 3)}=${texNombre(echelleKm, 3)}\\,\\text{km}$. Ce qui signifie que $1\\,\\text{cm}$ sur la carte correspond à $${texNombre(echelleKm, 3)}\\,\\text{km}=${texNombre(echelle, 3)}\\,\\text{cm}$ en réalité. L'échelle de la carte est $${miseEnEvidence('1')}:${miseEnEvidence(texNombre(echelle, 3))}$.`
          if (this.interactif && context.isHtml) {
            texte +=
              "<br>L'échelle de la carte est" +
              remplisLesBlancs(this, i, '%{champ1}\\text{:}%{champ2}.')
            handleAnswers(
              this,
              i,
              {
                bareme: (listePoints: number[]) => [
                  Math.min(listePoints[0], listePoints[1]),
                  1,
                ],
                champ1: { value: String(1) },
                champ2: { value: String(echelle) },
              },
              { formatInteractif: 'fillInTheBlank' },
            )
          }
          break
      }
      if (
        this.questionJamaisPosee(
          i,
          dCarte,
          dReelle.toString(),
          echelle.toString(),
        )
      ) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
