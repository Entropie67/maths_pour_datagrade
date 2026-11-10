import {
  addPossibleMultiLinesAnswer,
  baremeMultiLignes,
  besoinFormulaireVerificationMultiLignes,
  commentaireMultiLignes,
} from '../../lib/customElements/PossibleMultiLinesAnswerElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import FractionEtendue from '../../modules/FractionEtendue'
import { obtenirListeFractionsIrreductibles } from '../../modules/fractions'
import { gestionnaireFormulaireTexte } from '../../modules/outils'
import Exercice from '../Exercice'

import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../lib/outils/embellissements'

export const titre = 'Effectuer des calculs complexes avec des fractions'
export const interactifReady = true

export const dateDePublication = '20/06/2024'

/**
 * @author Jean-claude Lhote

 */
export const uuid = 'f7f49'

export const refs = {
  'fr-fr': ['4C23-11', 'BP2AutoH19'],
  'fr-ch': ['1mCN-15', '10LSNO3C-5', '11CTNO2B-5', '11LCNO2B-5', 'PRQNO13C-6'],
}
export default class FractionEtPriorites extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Types de questions',
      'Nombres séparés par des tirets :\n1 : produit en premier\n2 : produit en deuxième sans piège\n3 : produit en deuxième avec piège\n4 : quotient en premier\n5 : quotient en deuxième sans piège\n6 : quotient en deuxième avec piège\n7 : Mélange',
    ]
    this.besoinFormulaire2CaseACocher = ['Présence de nombre relatifs', false]
    this.besoinFormulaire3Numerique = besoinFormulaireVerificationMultiLignes
    this.sup = '3'
    this.sup3 = 2
    this.comment = commentaireMultiLignes

    this.correctionDetaillee = true
    this.correctionDetailleeDisponible = true
  }

  nouvelleVersion() {
    this.consigne = this.interactif
      ? "Donner le résultat du calcul sous forme d'une fraction irréductible."
      : 'Effectuer les calculs suivant en respectant les priorités opératoires.'
    const cd = this.correctionDetaillee
    const useRelatifs = this.sup2
    let reponse: FractionEtendue
    const listeTypeDeQuestion = gestionnaireFormulaireTexte({
      defaut: 1,
      saisie: this.sup,
      nbQuestions: this.nbQuestions,
      min: 1,
      max: 6,
      melange: 7,
    })
    for (let i = 0, cpt = 0; i < listeTypeDeQuestion.length && cpt < 50;) {
      let texte: string = ''
      let texteCorr: string = ''
      let operation = choice(['+', '-'])
      let update: boolean = false // Un booléen mis à true en cas d'étape supplémentaire
      let a: FractionEtendue = choice(obtenirListeFractionsIrreductibles())
      let b: FractionEtendue = choice(
        obtenirListeFractionsIrreductibles().filter((el) => !el.isEqual(a)),
      )
      let c: FractionEtendue = choice(obtenirListeFractionsIrreductibles())
      const changeForSignes = function (): void {
        if (operation === '-' && a.signe === -1) {
          operation = '+'
          a = a.oppose()
          update = true
        } else if (a.signe === -1) {
          update = true
          operation = '-'
          a = a.oppose()
        }
      }
      c = new FractionEtendue(
        c.num,
        Number(listeTypeDeQuestion[i]) < 4 ? a.den * b.den : a.den * b.num,
      )
      if (useRelatifs) {
        // On injecte deux - et un + sur les trois fractions au hasard
        const signes = shuffle([1, -1, -1])
        a = a.multiplieEntier(signes[0])
        b = b.multiplieEntier(signes[1])
        c = c.multiplieEntier(signes[2])
      }
      switch (Number(listeTypeDeQuestion[i])) {
        case 2: // c +/- a*b
          texte = `$${lettreDepuisChiffre(i + 1)}=${c.texFraction}${operation}${a.texFraction}\\times ${b.texFraction}$`
          texteCorr = texte.slice(3, -1) // La correction de base reprend l'énoncé

          // on utilise l'environnement aligned pour les calculs
          texteCorr =
            `$\\begin{aligned}${lettreDepuisChiffre(i + 1)} &=` + texteCorr
          if (b.signe === -1) {
            // on change le signe de b et donc de a pour conserver le signe du produit
            a = a.oppose()
            b = b.oppose()
            update = true
          }
          changeForSignes()
          // cd est un booléen qui active la correction détaillée (on ajoute des commentaires)
          if (update) {
            texteCorr += `${cd ? "&\\text{On s'occupe d'abord des signes moins.}" : ''} \\\\`
          }
          if (update) {
            texteCorr += ` &= ${c.texFSD}${operation}${a.texFSD}\\times ${b.texFraction}${cd ? '&\\text{On effectue la multiplication en priorité.}' : ''} \\\\`
          } else {
            texteCorr += `${cd ? '&\\text{On effectue la multiplication en priorité.}' : ''} \\\\`
          }
          texteCorr += ` &= ${c.texFSD}${operation}${a.produitFraction(b).texFSD}${cd ? `&\\text{On effectue ${operation === '-' ? 'la soustraction.' : "l'addtition."}}` : ''}\\\\`
          reponse =
            operation === '+'
              ? c.sommeFraction(a.produitFraction(b))
              : c.differenceFraction(a.produitFraction(b))
          // dernière étape on simplifie si c'est nécessaire après le switch car étape commune
          break
        case 3: // c +/- a*b avec piège de priorité
          c = new FractionEtendue(c.num, a.den)
          texte = `$${lettreDepuisChiffre(i + 1)}=${c.texFraction}${operation}${a.texFraction}\\times ${b.texFraction}$`
          texteCorr = texte.slice(3, -1) // La correction de base reprend l'énoncé

          // on utilise l'environnement aligned pour les calculs
          texteCorr =
            `$\\begin{aligned}${lettreDepuisChiffre(i + 1)} &=` + texteCorr
          if (b.signe === -1) {
            // on change le signe de b et donc de a pour conserver le signe du produit
            a = a.oppose()
            b = b.oppose()
            update = true
          }
          changeForSignes()
          // cd est un booléen qui active la correction détaillée (on ajoute des commentaires)
          if (update) {
            texteCorr += `${cd ? "&\\text{On s'occupe d'abord des signes moins.}" : ''} \\\\`
          }
          if (update) {
            texteCorr += ` &= ${c.texFSD}${operation}${a.texFSD}\\times ${b.texFraction}${cd ? '&\\text{On effectue la multiplication en priorité.}' : ''} \\\\`
          } else {
            texteCorr += `${cd ? '&\\text{On effectue la multiplication en priorité.}' : ''} \\\\`
          }
          texteCorr += ` &= ${c.texFSD}${operation}${a.produitFraction(b).texFSD}${cd ? '&\\text{On met au même dénominateur}' : ''}\\\\`
          texteCorr += ` &= ${c.reduire(b.denIrred).texFSD}${operation}${a.produitFraction(b).texFSD}${cd ? `&\\text{On effectue ${operation === '-' ? 'la soustraction.' : "l'addtition."}}` : ''}\\\\`
          reponse =
            operation === '+'
              ? c.sommeFraction(a.produitFraction(b))
              : c.differenceFraction(a.produitFraction(b))
          // dernière étape on simplifie si c'est nécessaire après le switch car étape commune
          break
        case 5: // c +/- a/b sans piège
          texte = `$${lettreDepuisChiffre(i + 1)}=${c.texFraction}${operation}${a.texFraction}\\div ${b.texFraction}$`
          texteCorr = texte.slice(3, -1) // La correction de base reprend l'énoncé

          // on utilise l'environnement aligned pour les calculs
          texteCorr =
            `$\\begin{aligned}${lettreDepuisChiffre(i + 1)} &=` + texteCorr
          if (b.signe === -1) {
            // on change le signe de b et donc de a pour conserver le signe du produit
            a = a.oppose()
            b = b.oppose()
            update = true
          }
          changeForSignes()
          // cd est un booléen qui active la correction détaillée (on ajoute des commentaires)
          if (update) {
            texteCorr += `${cd ? "&\\text{On s'occupe d'abord des signes moins.}" : ''} \\\\`
          }
          if (update) {
            texteCorr += ` &= ${c.texFSD}${operation}${a.texFSD}\\div ${b.texFraction}${cd ? '&\\text{On effectue la division en priorité.}' : ''} \\\\`
          } else {
            texteCorr += `${cd ? '&\\text{On effectue la division en priorité.}' : ''} \\\\`
          }

          texteCorr += ` &= ${c.texFSD}${operation}${a.texFSD}\\times ${b.inverse().texFSD}${cd ? "&\\text{Diviser revient à multiplier par l'inverse}" : ''}\\\\`
          texteCorr += ` &= ${c.texFSD}${operation}${a.diviseFraction(b).texFSD}${cd ? `&\\text{On effectue ${operation === '-' ? 'la soustraction.' : "l'addtition."}}` : ''}\\\\`
          reponse =
            operation === '+'
              ? c.simplifie().sommeFraction(a.diviseFraction(b))
              : c.differenceFraction(a.diviseFraction(b))
          break
        case 4: // a/b +/- c
          texte = `$${lettreDepuisChiffre(i + 1)}=${a.texFraction}\\div ${b.texFraction}${operation}${c.texFraction}$`
          texteCorr = texte.slice(3, -1) // La correction de base reprend l'énoncé

          // on utilise l'environnement aligned pour les calculs
          texteCorr =
            `$\\begin{aligned}${lettreDepuisChiffre(i + 1)} &=` + texteCorr
          if (b.signe === -1) {
            // on change le signe de b et donc de a pour conserver le signe du produit
            a = a.oppose()
            b = b.oppose()
            update = true
          }
          if (operation === '-' && c.signe === -1) {
            operation = '+'
            c = c.oppose()
            update = true
          } else if (c.signe === -1) {
            update = true
            operation = '-'
            c = c.oppose()
          }
          // cd est un booléen qui active la correction détaillée (on ajoute des commentaires)
          if (update) {
            texteCorr += `${cd ? "&\\text{On s'occupe d'abord des signes moins.}" : ''} \\\\`
          }
          if (update) {
            texteCorr += ` &= ${a.texFSD}\\div ${b.texFraction}${operation}${c.texFraction}${cd ? '&\\text{On effectue la division en priorité.}' : ''} \\\\`
          } else {
            texteCorr += `${cd ? '&\\text{On effectue la division en priorité.}' : ''} \\\\`
          }
          texteCorr += ` &= ${a.texFSD}\\times ${b.inverse().texFSD}${operation}${c.texFSD}${cd ? "&\\text{Diviser revient à multiplier par l'inverse}" : ''}\\\\`
          texteCorr += ` &= ${a.diviseFraction(b).texFSD}${operation}${c.texFraction}${cd ? `&\\text{On effectue ${operation === '-' ? 'la soustraction.' : "l'addtition."}}` : ''}\\\\`
          reponse =
            operation === '+'
              ? a.diviseFraction(b).sommeFraction(c)
              : a.diviseFraction(b).differenceFraction(c)

          break
        case 6: // a +/- b/c avec piège
          c = new FractionEtendue(c.num, a.den)
          texte = `$${lettreDepuisChiffre(i + 1)}=${c.texFraction}${operation}${a.texFraction}\\div ${b.texFraction}$`
          texteCorr = texte.slice(3, -1) // La correction de base reprend l'énoncé

          // on utilise l'environnement aligned pour les calculs
          texteCorr =
            `$\\begin{aligned}${lettreDepuisChiffre(i + 1)} &=` + texteCorr
          if (b.signe === -1) {
            // on change le signe de b et donc de a pour conserver le signe du produit
            a = a.oppose()
            b = b.oppose()
            update = true
          }
          changeForSignes()
          // cd est un booléen qui active la correction détaillée (on ajoute des commentaires)
          if (update) {
            texteCorr += `${cd ? "&\\text{On s'occupe d'abord des signes moins.}" : ''} \\\\`
          }
          if (update) {
            texteCorr += ` &= ${c.texFSD}${operation}${a.texFSD}\\div ${b.texFraction}${cd ? '&\\text{On effectue la division en priorité.}' : ''} \\\\`
          } else {
            texteCorr += `${cd ? '&\\text{On effectue la division en priorité.}' : ''} \\\\`
          }

          texteCorr += ` &= ${c.texFSD}${operation}${a.texFSD}\\times ${b.inverse().texFSD}${cd ? "&\\text{Diviser revient à multiplier par l'inverse}" : ''}\\\\`
          if (b.numIrred !== 1) {
            texteCorr += ` &= ${c.texFSD}${operation}${a.diviseFraction(b).texFSD}${cd ? '&\\text{On met au même dénominateur}' : ''}\\\\`
          }
          texteCorr += ` &= ${c.reduire(b.numIrred).texFSD}${operation}${a.diviseFraction(b).texFSD}${cd ? `&\\text{On effectue ${operation === '-' ? 'la soustraction.' : "l'addtition."}}` : ''}\\\\`
          reponse =
            operation === '+'
              ? c.simplifie().sommeFraction(a.diviseFraction(b))
              : c.differenceFraction(a.diviseFraction(b))

          break
        case 1:
        default: // a*b +/- c
          texte = `$${lettreDepuisChiffre(i + 1)}=${a.texFraction}\\times ${b.texFraction}${operation}${c.texFraction}$`
          texteCorr = texte.slice(3, -1) // La correction de base reprend l'énoncé

          // on utilise l'environnement aligned pour les calculs
          texteCorr =
            `$\\begin{aligned}${lettreDepuisChiffre(i + 1)} &=` + texteCorr
          if (b.signe === -1) {
            // on change le signe de b et donc de a pour conserver le signe du produit
            a = a.oppose()
            b = b.oppose()
            update = true
          }
          if (operation === '-' && c.signe === -1) {
            operation = '+'
            c = c.oppose()
            update = true
          } else if (c.signe === -1) {
            update = true
            operation = '-'
            c = c.oppose()
          }
          // cd est un booléen qui active la correction détaillée (on ajoute des commentaires)
          if (update) {
            texteCorr += `${cd ? "&\\text{On s'occupe d'abord des signes moins.}" : ''} \\\\`
          }
          if (update) {
            texteCorr += ` &= ${a.texFSD}\\times ${b.texFraction}${operation}${c.texFraction}${cd ? '&\\text{On effectue la multiplication en priorité.}' : ''} \\\\`
          } else {
            texteCorr += `${cd ? '&\\text{On effectue la multiplication en priorité.}' : ''} \\\\`
          }
          texteCorr += ` &= ${a.produitFraction(b).texFSD}${operation}${c.texFraction}${cd ? `&\\text{On effectue ${operation === '-' ? 'la soustraction.' : "l'addtition."}}` : ''}\\\\`
          reponse =
            operation === '+'
              ? a.produitFraction(b).sommeFraction(c)
              : a.produitFraction(b).differenceFraction(c)
          // dernière étape on simplifie si c'est nécessaire après le switch car étape commune
          break
      }
      if (this.interactif) {
        handleAnswers(this, i, {
          reponse: {
            value: reponse.texFractionSimplifiee,
            options: { fractionIrreductible: true },
          },
        })
        texte += addPossibleMultiLinesAnswer(this, i, {
          prefix: `${lettreDepuisChiffre(i + 1)} =`,
          style: KeyboardType.clavierDeBaseAvecFraction,
          bareme: baremeMultiLignes(this.sup3),
        })
      }

      // La dernière étape de réduction est commune on la fait maintenant si besoin
      if (!reponse.estIrreductible) {
        texteCorr += ` &= ${reponse.texFSD}`
        texteCorr += `${cd ? '&\\text{On pense à simplifier le résultat.}' : ''}\\\\`
        texteCorr += `&= ${miseEnEvidence(reponse.texFractionSimplifiee)}\\\\`
      } else {
        texteCorr += ` &= ${miseEnEvidence(reponse.texFSD)}\\\\`
      }
      texteCorr += '\\end{aligned}$\n'

      if (
        this.questionJamaisPosee(i, a.texFraction, b.texFraction, c.texFraction)
      ) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
  }
}
