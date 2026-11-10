import { amcConvert } from '../../lib/amc/amcBuilders'
import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import {
  choice,
  combinaisonListes,
  combinaisonListesSansChangerOrdre,
  shuffle,
} from '../../lib/outils/arrayOutils'
import { rienSi1 } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Réduire et simplifier, si possible, un produit et une somme'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCOpen'
export const dateDeModifImportante = '19/11/2023'

/**
 * Distinction entre la réduction d'un produit et la réduction d'une somme, on garde les même coeffs
 * @author Sébastien Lozano (modifié par EE)
 */
export const uuid = '4623e'

export const refs = {
  'fr-fr': ['5N5F-1'],
  'fr-2016': ['5L12-1'],
  'fr-ch': ['10LCFA4D-2', '10LSFA4D-2', 'PRQAL03B-2'],
}
export default class ReduireDinstinctionSommeProduit extends Exercice {
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
    const choix1 = choice([0, 2])
    const choix2 = choice([1, 3])
    const typesDeQuestionsDisponibles =
      this.sup === 3
        ? [...shuffle([choix1, choix2]), ...shuffle([2 - choix1, 4 - choix2])]
        : this.sup === 2
          ? [1, 3]
          : [0, 2]

    const listeTypeDeQuestions =
      this.sup === 3
        ? combinaisonListesSansChangerOrdre(
            typesDeQuestionsDisponibles,
            this.nbQuestions,
          )
        : combinaisonListes(typesDeQuestionsDisponibles, this.nbQuestions)
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
        texte +=
          '<br>' +
          addMultiMathfield(this, i, {
            dataTemplate: `${listeTypeDeQuestions[i] > 1 ? 'Somme : ' : 'Produit : '} %{champ1}<br>
           ${listeTypeDeQuestions[i] > 1 ? 'Produit : ' : 'Somme : '} %{champ2}`,
            dataOptions: {
              champ1: {
                keyboard: KeyboardType.clavierDeBaseAvecVariable,
              },
              champ2: {
                keyboard: KeyboardType.clavierDeBaseAvecVariable,
              },
            },
          })
        handleAnswers(
          this,
          i,
          {
            // bareme: toutAUnPoint,
            champ1: {
              value:
                listeTypeDeQuestions[i] < 2 ? reponseProduit : reponseSomme,
              options: { expressionsForcementReduites: true },
            },
            champ2: {
              value:
                listeTypeDeQuestions[i] < 2 ? reponseSomme : reponseProduit,
              options: { expressionsForcementReduites: true },
            },
          },
          { formatInteractif: 'multi-mathfield' },
        )
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
