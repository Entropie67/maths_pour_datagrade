import { amcConvert } from '../../lib/amc/amcBuilders'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  choice,
  combinaisonListesSansChangerOrdre,
} from '../../lib/outils/arrayOutils'
import { rienSi1 } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Réduire et simplifier, si possible, un produit et une somme à partir des mêmes éléments algébriques pour distinguer la différence'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCOpen'
export const dateDeModifImportante = '19/11/2023'

/**
 * Distinction entre la réduction d'un produit et la réduction d'une somme, on garde les même coeffs
 * @author Sébastien Lozano (modifié par EE)
 */
export const uuid = '46234'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export default class ReduireDinstinctionSommeProduitOld extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Type de questions',
      3,
      '1 : Avec des mots\n2 : Avec des signes\n3 : Mélange',
    ]

    this.nbQuestions = 2

    this.sup = 3
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles =
      this.sup === 3
        ? [choice([0, 2]), choice([1, 3])]
        : this.sup === 2
          ? [choice([1, 3])]
          : [choice([0, 2])]

    const listeTypeDeQuestions = combinaisonListesSansChangerOrdre(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    const variables = ['x', 'y', 'z', 'a', 'b', 'c']

    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const enonces = []
      const n = randint(1, 6)
      const p = randint(1, 6)
      const inc = variables[randint(0, variables.length - 1)]

      //= ==== 0 le produit puis la somme
      enonces.push({
        enonce: `Réduire et simplifier, si possible, le produit puis la somme de $${rienSi1(n)}${inc}$ et de $${rienSi1(p)}${inc}$`,
        questtion: '',
        correction_produit:
          `Le produit de $${rienSi1(n)}${inc}$ et de $${rienSi1(p)}${inc}$ vaut : ` +
          (n * p === 1
            ? `$${inc}\\times ${inc} =$`
            : `$${rienSi1(n)}${inc}\\times ${rienSi1(p)}${inc} = ${n}\\times ${inc}\\times ${p}\\times ${inc} = ${n}\\times ${p}\\times ${inc}\\times ${inc}=$`),
        correction_somme: `La somme de $${rienSi1(n)}${inc}$ et de $${rienSi1(p)}${inc}$ vaut $${rienSi1(n)}${inc}+${rienSi1(p)}${inc} = ${n}\\times ${inc}+${p}\\times ${inc} = (${n}+${p})\\times ${inc}=$ `,
      })

      //= ==== 1 le produit puis la somme
      enonces.push({
        enonce: `Réduire et simplifier, si possible, l'expression $${rienSi1(n)}${inc}\\times ${rienSi1(p)}${inc}$ puis l'expression $${rienSi1(n)}${inc}+${rienSi1(p)}${inc}$`,
        questtion: '',
        correction_produit:
          n * p === 1
            ? `$${inc}\\times ${inc} =$`
            : `$${rienSi1(n)}${inc}\\times ${rienSi1(p)}${inc} = ${n}\\times ${inc}\\times ${p}\\times ${inc} = ${n}\\times ${p}\\times ${inc}\\times ${inc}=$`,
        correction_somme: `$${rienSi1(n)}${inc}+${rienSi1(p)}${inc} = ${n}\\times ${inc}+${p}\\times ${inc} = (${n}+${p})\\times ${inc}=$ `,
      })

      //= ==== 2 la somme puis le produit
      enonces.push({
        enonce: `Réduire et simplifier, si possible, la somme puis le produit de $${rienSi1(n)}${inc}$ et de $${rienSi1(p)}${inc}$`,
        questtion: '',
        correction_produit:
          `Le produit de $${rienSi1(n)}${inc}$ et de $${rienSi1(p)}${inc}$ vaut : ` +
          (n * p === 1
            ? `$${inc}\\times ${inc} =$`
            : `$${rienSi1(n)}${inc}\\times ${rienSi1(p)}${inc} = ${n}\\times ${inc}\\times ${p}\\times ${inc} = ${n}\\times ${p}\\times ${inc}\\times ${inc}=$`),
        correction_somme: `La somme de $${rienSi1(n)}${inc}$ et de $${rienSi1(p)}${inc}$ vaut : $${rienSi1(n)}${inc}+${rienSi1(p)}${inc} = ${n}\\times ${inc}+${p}\\times ${inc} = (${n}+${p})\\times ${inc}=$ `,
      })

      //= ==== 3 la somme puis le produit
      enonces.push({
        enonce: `Réduire et simplifier, si possible, l'expression $${rienSi1(n)}${inc}+${rienSi1(p)}${inc}$ puis l'expression $${rienSi1(n)}${inc}\\times ${rienSi1(p)}${inc}$`,
        questtion: '',
        correction_produit:
          n * p === 1
            ? `$${inc}\\times ${inc} =$`
            : `$${rienSi1(n)}${inc}\\times ${rienSi1(p)}${inc} = ${n}\\times ${inc}\\times ${p}\\times ${inc} = ${n}\\times ${p}\\times ${inc}\\times ${inc}=$`,
        correction_somme: `$${rienSi1(n)}${inc}+${rienSi1(p)}${inc} = ${n}\\times ${inc}+${p}\\times ${inc} = (${n}+${p})\\times ${inc}=$ `,
      })

      texte = `${enonces[listeTypeDeQuestions[i]].enonce}.`

      const reponseProduit = `${rienSi1(n * p)}${inc}^2`
      const correctionProduitFinal =
        `$${sp()}${miseEnEvidence(reponseProduit)}$` +
        (listeTypeDeQuestions[i] % 2 === 0 ? '.' : '')
      const reponseSomme = `${n + p}${inc}`
      const correctionSommeFinale =
        `$${sp()}${miseEnEvidence(reponseSomme)}$` +
        (listeTypeDeQuestions[i] % 2 === 0 ? '.' : '')

      if (this.interactif) {
        texte += ajouteChampTexteMathLive(
          this,
          2 * i,
          KeyboardType.clavierFullOperations,
          {
            texteAvant:
              listeTypeDeQuestions[i] > 1 ? '<br>Somme : ' : '<br>Produit : ',
          },
        )
        handleAnswers(this, 2 * i, {
          reponse: {
            value: listeTypeDeQuestions[i] < 2 ? reponseProduit : reponseSomme,
          },
        })
        texte += ajouteChampTexteMathLive(
          this,
          2 * i + 1,
          KeyboardType.clavierFullOperations,
          {
            texteAvant:
              listeTypeDeQuestions[i] > 1 ? '<br>Produit : ' : '<br>Somme : ',
          },
        )
        handleAnswers(this, 2 * i + 1, {
          reponse: {
            value: listeTypeDeQuestions[i] < 2 ? reponseSomme : reponseProduit,
          },
        })
      }
      texteCorr =
        listeTypeDeQuestions[i] > 1
          ? enonces[listeTypeDeQuestions[i]].correction_somme
          : enonces[listeTypeDeQuestions[i]].correction_produit
      texteCorr +=
        listeTypeDeQuestions[i] > 1
          ? correctionSommeFinale
          : correctionProduitFinal
      texteCorr += '<br>'
      texteCorr +=
        listeTypeDeQuestions[i] > 1
          ? enonces[listeTypeDeQuestions[i]].correction_produit
          : enonces[listeTypeDeQuestions[i]].correction_somme
      texteCorr +=
        listeTypeDeQuestions[i] > 1
          ? correctionProduitFinal
          : correctionSommeFinale

      if (this.questionJamaisPosee(i, n, p, inc)) {
        // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr

        if (context.isAmc) {
          this.autoCorrectionAMC[i] = {
            enonce: texte + '<br>',
            propositions: [
              {
                texte: texteCorr,
                statut: 2, // OBLIGATOIRE (ici c'est le nombre de lignes du cadre pour la réponse de l'élève sur AMC)
                sanscadre: false, // EE : ce champ est facultatif et permet (si true) de cacher le cadre et les lignes acceptant la réponse de l'élève
                pointilles: false, // EE : ce champ est facultatif et permet (si false) d'enlever les pointillés sur chaque ligne.
              },
            ],
          }
          this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        }
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
