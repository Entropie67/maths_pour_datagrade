import { texteGras } from '../../lib/format/style'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { miseEnEvidence } from '../../lib/outils/embellissements'

export const titre = "Déterminer un taux d'évolution global"
export const interactifReady = true

export const dateDePublication = '06/01/2022'
export const dateDeModifImportante = '17/10/2026'
/**
 * Problèmes d'évolutions successives'
 *
 * * Situations variées : prix, habitants, adhérents  ##
 *
 * * Déterminer un taux d'évolution global ou un taux intermédiaire
 * * Mélange des 3 types de problèmes
 * @author Florence Tapiero et Gilles Mora pour le cas problème taux intermédiaire
 * 2I21-1
 */

export const uuid = '018f3'

export const refs = {
  'fr-fr': ['2I21-1', 'BP1CF07'],
  'fr-ch': ['10CTFA1E-7', '10LCFA1E-7', '10LSFA1E-7'],
}
/**
 * Tire deux taux d'évolution (en %) calculables sans calculatrice : des multiples de 10,
 * pour que les coefficients multiplicateurs n'aient qu'une décimale.
 * @returns [premier taux, deuxième taux]
 */
function tauxSansCalculatrice(): [number, number] {
  const dizaines = [10, 20, 30, 40, 50]
  return [
    choice(dizaines) * choice([-1, 1]),
    choice(dizaines) * choice([-1, 1]),
  ]
}

/**
 * Aide au calcul mental du produit de deux coefficients multiplicateurs à une décimale.
 */
function aideProduitDeTete(CM1: number, CM2: number): string {
  const a = Math.round(CM1 * 10)
  const b = Math.round(CM2 * 10)
  const produit = `${texNombre(CM1, 1)} \\times ${texNombre(CM2, 1)}`
  return `<br>Pour calculer $${produit}$ sans calculatrice, on écrit :<br>$${produit} = ${a} \\times 0{,}1 \\times ${b} \\times 0{,}1 = (${a} \\times ${b}) \\times 0{,}01 = ${a * b} \\times 0{,}01 = ${texNombre((a * b) / 100, 2)}$.`
}

export default class EvolutionsSuccesives extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Type de questions',
      3,
      '1 : Déterminer un taux global \n2 : Déterminer un taux intermédiaire\n3 : Mélange',
    ]

    this.besoinFormulaire2CaseACocher = ['Sans calculatrice', false]

    this.nbQuestions = 1

    this.sup = 1 // type de question
    this.sup2 = false
  }

  nouvelleVersion() {
    let typesDeQuestionsDisponibles: number[] = []
    if (this.sup === 1) {
      typesDeQuestionsDisponibles = [1, 2, 3]
    }
    if (this.sup === 2) {
      typesDeQuestionsDisponibles = [4, 5, 6]
    }
    if (this.sup === 3) {
      typesDeQuestionsDisponibles = [1, 2, 3, 4, 5, 6]
    }

    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posées mais l'ordre diffère à chaque "cycle"
    let typesDeQuestions,
      CM1,
      CM2,
      CM,
      p1,
      p2,
      p,
      verbe1,
      nom1,
      verbe2,
      verbe3,
      nom2,
      nom,
      nom3,
      taux,
      t1,
      t2,
      t
    for (
      let i = 0, texte, texteCorr, taux1, taux2, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      typesDeQuestions = listeTypeDeQuestions[i]
      switch (typesDeQuestions) {
        case 1:
          ;[taux1, taux2] = this.sup2
            ? tauxSansCalculatrice()
            : [randint(-80, 80, 0), randint(-80, 80, 0)]
          if (taux1 > 0) {
            verbe1 = 'Augmenter'
            nom1 = 'hausse'
          } else {
            verbe1 = 'Diminuer'
            nom1 = 'baisse'
          }
          if (taux2 > 0) {
            verbe2 = 'Augmenter'
            nom2 = 'hausse'
          } else {
            verbe2 = 'Diminuer'
            nom2 = 'baisse'
          }
          p1 = taux1 / 100
          p2 = taux2 / 100
          t1 = Math.abs(taux1)
          t2 = Math.abs(taux2)
          CM1 = 1 + p1
          CM2 = 1 + p2
          CM = CM1 * CM2
          p = CM - 1
          taux = p * 100
          t = Math.abs(taux)
          if (taux > 0) {
            nom = 'hausse'
          } else {
            nom = 'baisse'
          }
          texte = `Le prix d'un article subit une ${nom1} de $${t1}~\\%$ puis une ${nom2} de $${t2}~\\%$.<br>Déterminer le taux d'évolution global du prix de cet article.`
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierDeBase,
            { texteApres: '%' },
          )
          texteCorr =
            "Pour déterminer le taux d'évolution global, on commence par calculer le coefficient multiplicateur global."
          texteCorr +=
            '<br>Si une grandeur subit des évolutions successives, le coefficient multiplicateur global est le produit des coefficients multiplicateurs de chaque évolution :'
          texteCorr += `<br><br>${texteGras('Première évolution :')} <br>
          ${verbe1} de $${t1}~\\%$ revient à multiplier par `
          if (taux1 > 0) {
            texteCorr += `$CM_1 = 1 + \\dfrac{${t1}}{100} = ${texNombre(CM1, 2)}$.`
          } else {
            texteCorr += `$CM_1 = 1 - \\dfrac{${t1}}{100} = ${texNombre(CM1, 2)}$.`
          }
          texteCorr += `<br><br>${texteGras('Deuxième évolution :')}<br> ${verbe2} de $${t2}~\\%$ revient à multiplier par `
          if (taux2 > 0) {
            texteCorr += `$CM_2 = 1 + \\dfrac{${t2}}{100} = ${texNombre(CM2, 2)}$.`
          } else {
            texteCorr += `$CM_2 = 1 - \\dfrac{${t2}}{100} = ${texNombre(CM2, 2)}$.`
          }

          texteCorr += `<br>Le coefficient multiplicateur global est égal à $CM = CM_1 \\times CM_2 = ${texNombre(CM1, 2)} \\times ${texNombre(CM2, 2)} =${texNombre(CM, 4)}$.`
          if (this.sup2 && taux1 * taux2 < 0) {
            texteCorr += aideProduitDeTete(CM1, CM2)
          }
          texteCorr += `<br><br>${texteGras('Évolution globale :')}<br>`
          if (CM > 1) {
            texteCorr += `
          Le taux d'évolution global est égal à : $T=CM-1=${texNombre(CM, 4)}-1=${texNombre(Math.abs(p), 4)}=${texNombre(t, 2)}~\\%$.`
          } else {
            texteCorr += `Le taux d'évolution global est égal à : $T=CM-1=${texNombre(CM, 4)}-1=-${texNombre(Math.abs(p), 4)}=-${texNombre(t, 2)}~\\%$.`
          }
          texteCorr += `<br><br><br>Le prix de l'article a subi une ${nom} globale de $${texNombre(Math.abs(taux), 2)}~\\%$, soit un taux d'évolution de $${miseEnEvidence(texNombre(taux, 2))}~\\%$.`
          handleAnswers(this, i, { reponse: { value: texNombre(taux) } })
          break
        case 2:
          ;[taux1, taux2] = this.sup2
            ? tauxSansCalculatrice()
            : [randint(-20, 20, 0), randint(-20, 20, 0)]
          if (taux1 > 0) {
            verbe1 = 'Augmenter'
            nom1 = 'augmenté'
          } else {
            verbe1 = 'Diminuer'
            nom1 = 'diminué'
          }
          if (taux2 > 0) {
            verbe2 = 'Augmenter'
            nom2 = 'augmenté'
          } else {
            verbe2 = 'Diminuer'
            nom2 = 'diminué'
          }
          p1 = taux1 / 100
          p2 = taux2 / 100
          t1 = Math.abs(taux1)
          t2 = Math.abs(taux2)
          CM1 = 1 + p1
          CM2 = 1 + p2
          CM = CM1 * CM2
          p = CM - 1
          taux = p * 100
          t = Math.abs(taux)
          if (taux > 0) {
            nom = 'augmenté'
          } else {
            nom = 'diminué'
          }
          texte = `La population d'une ville a ${nom1} de $${t1}~\\%$ en $2021$ puis a ${nom2} de $${t2}~\\%$ en $2022$.<br>Quel est le taux d'évolution global ?`
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierDeBase,
            { texteApres: '%' },
          )
          texteCorr =
            "Pour déterminer le taux d'évolution global, on commence par calculer le coefficient multiplicateur global."
          texteCorr +=
            '<br>Si une grandeur subit des évolutions successives, le coefficient multiplicateur global est le produit des coefficients multiplicateurs de chaque évolution :'
          texteCorr += `<br><br>${texteGras('Première évolution :')} <br>
           ${verbe1} de $${t1}~\\%$ revient à multiplier par `
          if (taux1 > 0) {
            texteCorr += `$CM_1 = 1 + \\dfrac{${t1}}{100} = ${texNombre(CM1, 2)}$.`
          } else {
            texteCorr += `$CM_1 = 1 - \\dfrac{${t1}}{100} = ${texNombre(CM1, 2)}$.`
          }
          texteCorr += `<br><br>${texteGras('Deuxième évolution :')} <br>
           ${verbe2} de $${t2}~\\%$ revient à multiplier par `
          if (taux2 > 0) {
            texteCorr += `$CM_2 = 1 + \\dfrac{${t2}}{100} = ${texNombre(CM2, 2)}$.`
          } else {
            texteCorr += `$CM_2 = 1 - \\dfrac{${t2}}{100} = ${texNombre(CM2, 2)}$.`
          }
          texteCorr += `<br><br>Le coefficient multiplicateur global est égal à $CM = CM_1 \\times CM_2 = ${texNombre(CM1, 2)} \\times ${texNombre(CM2, 2)} =${texNombre(CM, 4)}$.`
          if (this.sup2 && taux1 * taux2 < 0) {
            texteCorr += aideProduitDeTete(CM1, CM2)
          }
          texteCorr += `<br><br>${texteGras('Évolution globale :')}<br>`
          if (CM > 1) {
            texteCorr += `
          Le taux d'évolution global est égal à : $T=CM -1=${texNombre(CM, 4)} -1= ${texNombre(Math.abs(p), 4)} = ${texNombre(t, 2)}~\\%$.`
          } else {
            texteCorr += `Le taux d'évolution global est égal à : $T=CM-1=${texNombre(CM, 4)}-1=-${texNombre(Math.abs(p), 4)}=-${texNombre(t, 2)}~\\%$.`
          }
          texteCorr += `<br><br>Le nombre d'habitants de cette ville a ${nom} de $${texNombre(Math.abs(taux), 2)}~\\%$, soit un taux d'évolution de $${miseEnEvidence(texNombre(taux, 2))}~\\%$ entre $2021$ et $2022$.`
          handleAnswers(this, i, { reponse: { value: texNombre(taux) } })
          break
        case 3:
          ;[taux1, taux2] = this.sup2
            ? tauxSansCalculatrice()
            : [randint(-40, 40, 0), randint(-40, 40, 0)]
          if (taux1 > 0) {
            verbe1 = 'Augmenter'
            nom1 = 'augmenté'
          } else {
            verbe1 = 'Diminuer'
            nom1 = 'diminué'
          }
          if (taux2 > 0) {
            verbe2 = 'Augmenter'
            nom2 = 'augmenté'
          } else {
            verbe2 = 'Diminuer'
            nom2 = 'diminué'
          }
          p1 = taux1 / 100
          p2 = taux2 / 100
          t1 = Math.abs(taux1)
          t2 = Math.abs(taux2)
          CM1 = 1 + p1
          CM2 = 1 + p2
          CM = CM1 * CM2
          p = CM - 1
          taux = p * 100
          t = Math.abs(taux)
          if (taux > 0) {
            nom = 'augmenté'
          } else {
            nom = 'diminué'
          }
          texte = `Le nombre d'adhérents d'une association a ${nom1} de $${t1}~\\%$ entre $2020$ et $2021$ puis a ${nom2} de $${t2}~\\%$ entre $2021$ et $2022$.<br>Quel est le taux d'évolution global du nombre d'adhérents ?`
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierDeBase,
            { texteApres: '%' },
          )
          texteCorr =
            "Pour déterminer le taux d'évolution global, on commence par calculer le coefficient multiplicateur global."
          texteCorr +=
            '<br>Si une grandeur subit des évolutions successives, le coefficient multiplicateur global est le produit des coefficients multiplicateurs de chaque évolution :'
          texteCorr += `<br><br>${texteGras('Première évolution :')} <br> ${verbe1} de $${t1}~\\%$ revient à multiplier par `
          if (taux1 > 0) {
            texteCorr += `$CM_1 = 1 + \\dfrac{${t1}}{100} = ${texNombre(CM1, 2)}$.`
          } else {
            texteCorr += `$CM_1 = 1 - \\dfrac{${t1}}{100} = ${texNombre(CM1, 2)}$.`
          }
          texteCorr += `<br><br>${texteGras('Deuxième évolution :')}<br>
           ${verbe2} de $${t2}~\\%$ revient à multiplier par `
          if (taux2 > 0) {
            texteCorr += `$CM_2 = 1 + \\dfrac{${t2}}{100} = ${texNombre(CM2, 2)}$.`
          } else {
            texteCorr += `$CM_2 = 1 - \\dfrac{${t2}}{100} = ${texNombre(CM2, 2)}$.`
          }
          texteCorr += `<br><br>Le coefficient multiplicateur global est égal à $CM = CM_1 \\times CM_2 = ${texNombre(CM1, 2)} \\times ${texNombre(CM2, 2)} =${texNombre(CM, 4)}$.`
          if (this.sup2 && taux1 * taux2 < 0) {
            texteCorr += aideProduitDeTete(CM1, CM2)
          }
          texteCorr += `<br><br>${texteGras('Évolution globale :')}<br>`
          if (CM > 1) {
            texteCorr += `
          Le taux d'évolution global est égal à : $T=CM -1=${texNombre(CM, 4)} -1= ${texNombre(Math.abs(p), 4)} = ${texNombre(t, 2)}~\\%$.`
          } else {
            texteCorr += `Le taux d'évolution global est égal à : $T=CM-1=${texNombre(CM, 4)}-1=-${texNombre(Math.abs(p), 4)}=-${texNombre(t, 2)}~\\%$.`
          }
          texteCorr += `<br><br>Le nombre d'adhérents de cette association a ${nom} de $${texNombre(Math.abs(taux), 2)}~\\%$, soit un taux d'évolution de $${miseEnEvidence(texNombre(taux, 2))}~\\%$ entre $2020$ et $2022$.`
          handleAnswers(this, i, { reponse: { value: texNombre(taux) } })
          break

        case 4:
          ;[taux1, taux2] = this.sup2
            ? tauxSansCalculatrice()
            : [randint(-80, 80, 0), randint(-80, 80, 0)]
          if (taux1 > 0) {
            verbe1 = 'Augmenter'
            nom1 = 'hausse'
          } else {
            verbe1 = 'Diminuer'
            nom1 = 'baisse'
          }
          if (taux2 > 0) {
            verbe2 = 'Augmenter'
            nom2 = 'hausse'
          } else {
            verbe2 = 'Diminuer'
            nom2 = 'baisse'
          }
          p1 = taux1 / 100
          p2 = taux2 / 100
          t1 = Math.abs(taux1)
          t2 = Math.abs(taux2)
          CM1 = 1 + p1
          CM2 = 1 + p2
          CM = CM1 * CM2
          p = CM - 1
          p2 = CM2 - 1
          taux = p * 100
          t = Math.abs(taux)
          if (taux > 0) {
            nom = 'hausse'
            nom3 = 'augmenté'
            verbe3 = 'Augmenter'
          } else {
            nom = 'baisse'
            nom3 = 'baissé'
            verbe3 = 'Diminuer'
          }
          texte = `Le prix d'un article subit une ${nom1} $${t1}~\\%$ puis une ${nom2} de $t\\,\\%$.<br>
          Globalement, le prix de cet article a ${nom3} de $${texNombre(t, 2)} \\,\\%$.<br>
          Quelle est la valeur de $t$ ?`
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierDeBase,
            { texteApres: '%' },
          )

          texteCorr =
            'Si une grandeur subit des évolutions successives, le coefficient multiplicateur global est le produit des coefficients multiplicateurs de chaque évolution.'
          texteCorr += `<br><br>${texteGras('Première évolution :')} <br> ${verbe1} de $${t1}~\\%$ revient à multiplier par `
          if (taux1 > 0) {
            texteCorr += `$CM_1 = 1 + \\dfrac{${t1}}{100} = ${texNombre(CM1, 2)}$.<br>`
          } else {
            texteCorr += `$CM_1 = 1 - \\dfrac{${t1}}{100} = ${texNombre(CM1, 2)}$.<br>`
          }
          texteCorr += `<br>${texteGras('Évolution globale :')} <br>
           ${verbe3} de $${texNombre(t, 2)}~\\%$ revient à multiplier par `
          if (taux > 0) {
            texteCorr += `$CM = 1 + \\dfrac{${texNombre(t, 2)}}{100} = ${texNombre(CM, 4)}$.`
          } else {
            texteCorr += `$CM = 1 - \\dfrac{${texNombre(t, 2)}}{100} = ${texNombre(CM, 4)}$.`
          }
          texteCorr += `<br><br>En notant $CM_2$ le coefficient multiplicateur de la deuxième évolution, on a : $CM = CM_1 \\times CM_2$, soit
             $${texNombre(CM1, 2)} \\times CM_2 =${texNombre(CM, 4)}$ et par suite $CM_2 =\\dfrac{${texNombre(CM, 4)}}{${texNombre(CM1, 2)} }${this.sup2 ? `=\\dfrac{${texNombre(CM * 10, 3)}}{${texNombre(CM1 * 10, 1)}}` : ''}=${texNombre(CM2, 2)}$<br>
             `
          if (CM2 > 1) {
            texteCorr += `<br>Or $T_2=CM_2 -1=${texNombre(CM2, 2)} -1= ${texNombre(Math.abs(p2), 2)}$ ce qui correspond à une hausse de $${texNombre(t2, 2)}~\\%$.`
          }
          if (CM2 < 1) {
            texteCorr += `<br>Or $T_2=CM_2 -1= ${texNombre(CM2, 2)} -1= - ${texNombre(Math.abs(p2), 2)}$ ce qui correspond à une baisse de $${texNombre(t2, 2)}~\\%$.`
          }
          texteCorr += `<br><br>Le prix de l'article a subi une ${nom2} $${miseEnEvidence(texNombre(t2))}~\\%$ lors de la deuxième évolution.`
          handleAnswers(this, i, { reponse: { value: texNombre(t2) } })
          break

        case 5:
          ;[taux1, taux2] = this.sup2
            ? tauxSansCalculatrice()
            : [randint(-20, 20, 0), randint(-20, 20, 0)]
          if (taux1 > 0) {
            verbe1 = 'Augmenter'
            nom1 = 'augmenté'
          } else {
            verbe1 = 'Diminuer'
            nom1 = 'baissé'
          }
          if (taux2 > 0) {
            verbe2 = 'Augmenter'
            nom2 = 'augmenté'
          } else {
            verbe2 = 'Diminuer'
            nom2 = 'baissé'
          }
          p1 = taux1 / 100
          p2 = taux2 / 100
          t1 = Math.abs(taux1)
          t2 = Math.abs(taux2)
          CM1 = 1 + p1
          CM2 = 1 + p2
          CM = CM1 * CM2
          p = CM - 1
          p2 = CM2 - 1
          taux = p * 100
          t = Math.abs(taux)
          if (taux > 0) {
            nom = 'hausse'
            nom3 = 'augmenté'
            verbe3 = 'Augmenter'
          }
          if (taux < 0) {
            nom = 'baisse'
            nom3 = 'baissé'
            verbe3 = 'Diminuer'
          }
          texte = `La population d'une ville a ${nom1} de $${t1}~\\%$ en $2021$ puis a ${nom2} de $t~\\%$ en $2022$.<br>
          Globalement, sur ces deux années, la population de cette ville a ${nom3} de $${texNombre(t, 2)} \\,\\%$.<br>
          Quelle est la valeur de $t$ ?`
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierDeBase,
            { texteApres: '%' },
          )

          texteCorr =
            'Si une grandeur subit des évolutions successives, le coefficient multiplicateur global est le produit des coefficients multiplicateurs de chaque évolution.'
          texteCorr += `<br><br>${texteGras('Première évolution :')} <br> ${verbe1} de $${t1}~\\%$ revient à multiplier par `
          if (taux1 > 0) {
            texteCorr += `$CM_1 = 1 + \\dfrac{${t1}}{100} = ${texNombre(CM1, 2)}$.<br>`
          }
          if (taux1 < 0) {
            texteCorr += `$CM_1 = 1 - \\dfrac{${t1}}{100} = ${texNombre(CM1, 2)}$.<br>`
          }
          texteCorr += `<br>${texteGras('Évolution globale :')} <br>
           ${verbe3} de $${texNombre(t, 2)}~\\%$ revient à multiplier par `
          if (taux > 0) {
            texteCorr += `$CM = 1 + \\dfrac{${texNombre(t, 2)}}{100} = ${texNombre(CM, 4)}$.`
          }
          if (taux < 0) {
            texteCorr += `$CM = 1 - \\dfrac{${texNombre(t, 2)}}{100} = ${texNombre(CM, 4)}$.`
          }
          texteCorr += `<br><br>En notant $CM_2$ le coefficient multiplicateur de la deuxième évolution, on a : $CM = CM_1 \\times CM_2$, soit
             $${texNombre(CM1, 2)} \\times CM_2 =${texNombre(CM, 4)}$ et par suite $CM_2 =\\dfrac{${texNombre(CM, 4)}}{${texNombre(CM1, 2)} }${this.sup2 ? `=\\dfrac{${texNombre(CM * 10, 3)}}{${texNombre(CM1 * 10, 1)}}` : ''}=${texNombre(CM2, 2)}$<br>
             `
          if (CM2 > 1) {
            texteCorr += `<br> $T_2=CM_2 -1=${texNombre(CM2, 2)} -1= ${texNombre(Math.abs(p2), 2)}$ ce qui correspond à une hausse de $${texNombre(t2, 2)}~\\%$.`
          }
          if (CM2 < 1) {
            texteCorr += `<br>Or $T_2=CM_2 -1= ${texNombre(CM2, 2)} -1= - ${texNombre(Math.abs(p2), 2)} $ ce qui correspond à une baisse de $${texNombre(t2, 2)}~\\%$.`
          }
          texteCorr += `<br><br>En $2022$, le nombre d'habitants de cette ville a ${nom2} de $${miseEnEvidence(texNombre(t2, 2))}\\,\\%$.`
          handleAnswers(this, i, { reponse: { value: texNombre(t2) } })
          break

        case 6:
        default:
          ;[taux1, taux2] = this.sup2
            ? tauxSansCalculatrice()
            : [randint(-40, 40, 0), randint(-40, 40, 0)]
          if (taux1 > 0) {
            verbe1 = 'Augmenter'
            nom1 = 'augmenté'
          }
          if (taux2 > 0) {
            verbe2 = 'Augmenter'
            nom2 = 'augmenté'
          }
          if (taux1 < 0) {
            verbe1 = 'Diminuer'
            nom1 = 'baissé'
          }
          if (taux2 < 0) {
            verbe2 = 'Diminuer'
            nom2 = 'baissé'
          }
          p1 = taux1 / 100
          p2 = taux2 / 100
          t1 = Math.abs(taux1)
          t2 = Math.abs(taux2)
          CM1 = 1 + p1
          CM2 = 1 + p2
          CM = CM1 * CM2
          p = CM - 1
          p2 = CM2 - 1
          taux = p * 100
          t = Math.abs(taux)
          if (taux > 0) {
            nom = 'hausse'
            nom3 = 'augmenté'
            verbe3 = 'Augmenter'
          }
          if (taux < 0) {
            nom = 'baisse'
            nom3 = 'baissé'
            verbe3 = 'Diminuer'
          }
          texte = `Le nombre d'adhérents d'une association a ${nom1} de $${t1}\\,\\%$ entre $2021$ et $2022$ puis a ${nom2} de $t\\,\\%$ entre $2022$ et $2023$.<br>
          Globalement, entre 2021 et 2023, le nombre d'adhérents a ${nom3} de $${texNombre(t, 2)}\\,\\%$.<br>
          Déterminer la valeur de $t$.
          `
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierDeBase,
            { texteApres: '%' },
          )

          texteCorr =
            'Si une grandeur subit des évolutions successives, le coefficient multiplicateur global est le produit des coefficients multiplicateurs de chaque évolution.'
          texteCorr += `<br><br>${texteGras('Première évolution :')} <br> ${verbe1} de $${t1}~\\%$ revient à multiplier par `
          if (taux1 > 0) {
            texteCorr += `$CM_1 = 1 + \\dfrac{${t1}}{100} = ${texNombre(CM1, 2)}$.<br>`
          }
          if (taux1 < 0) {
            texteCorr += `$CM_1 = 1 - \\dfrac{${t1}}{100} = ${texNombre(CM1, 2)}$.<br>`
          }
          texteCorr += `<br>${texteGras('Évolution globale :')} <br>
          ${verbe3} de $${texNombre(t, 2)}~\\%$ revient à multiplier par `
          if (taux > 0) {
            texteCorr += `$CM = 1 + \\dfrac{${texNombre(t, 2)}}{100} = ${texNombre(CM, 4)}$.`
          }
          if (taux < 0) {
            texteCorr += `$CM = 1 - \\dfrac{${texNombre(t, 2)}}{100} = ${texNombre(CM, 4)}$.`
          }
          texteCorr += `<br><br>En notant $CM_2$ le coefficient multiplicateur de la deuxième évolution, on a : $CM = CM_1 \\times CM_2$, soit
             $${texNombre(CM1, 2)} \\times CM_2 =${texNombre(CM, 4)}$ et par suite $CM_2 =\\dfrac{${texNombre(CM, 4)}}{${texNombre(CM1, 2)} }${this.sup2 ? `=\\dfrac{${texNombre(CM * 10, 3)}}{${texNombre(CM1 * 10, 1)}}` : ''}=${texNombre(CM2, 2)}$<br>
             `
          if (CM2 > 1) {
            texteCorr += `<br> $T_2=CM_2 -1=${texNombre(CM2, 2)}-1 = ${texNombre(Math.abs(p2), 2)}$ ce qui correspond à une hausse de $${texNombre(t2, 2)}~\\%$.`
          }
          if (CM2 < 1) {
            texteCorr += `<br> $T_2=CM_2 -1= ${texNombre(CM2, 2)} -1= - ${texNombre(Math.abs(p2), 2)}$ ce qui correspond à une baisse de $${texNombre(t2, 2)}~\\%$.`
          }
          texteCorr += `<br><br>Le nombre d'adhérents de cette association a ${nom2} de $${miseEnEvidence(texNombre(t2, 2))}\\,\\%$ en $2022$.`

          handleAnswers(this, i, { reponse: { value: texNombre(t2) } })
          break
      }
      if (this.questionJamaisPosee(i, taux1, taux2)) {
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
