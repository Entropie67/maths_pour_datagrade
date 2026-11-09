import Decimal from 'decimal.js'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../lib/outils/ecritures'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const titre =
  "Déterminer le sens de variation d'une suite arithmétique/géométrique"
export const interactifReady = true

export const dateDePublication = '23/12/2024'

/**
 * Description didactique de l'exercice
 * @author Gilles Mora
 * Référence
 */
export const uuid = '35f3a'
export const ref = '1AL12-1'
export const refs = {
  'fr-fr': ['1AL12-1'],
  'fr-ch': [],
}
export default class SensVariationsSuitesAG extends Exercice {
  constructor() {
    super()
    this.sup = 3
    this.sup2 = 3
    this.nbQuestions = 1
    this.spacing = 1.5
    this.spacingCorr = 1.5
    this.besoinFormulaireNumerique = [
      'Définition de la suite',
      3,
      '1 : Forme explicite\n2 : Relation de récurrence\n3 : Mélange',
    ]
    this.besoinFormulaire2Numerique = [
      'Type de suite',
      3,
      '1 : Suite arithmétique\n2 : Suite géométrique\n3 : Mélange',
    ]
  }

  nouvelleVersion() {
    this.autoCorrection = []
    this.listeQuestions = [] // Vide la liste de questions
    this.listeCorrections = [] // Vide la liste de questions corrigées

    for (
      let i = 0, r, q, u0, monQcm, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const ListeNomS = ['u', 'v', 'w', 't']
      const NomS = choice(ListeNomS)
      const reponseSC = `La suite $(${NomS}_n)$ est croissante `
      const reponseSD = `La suite $(${NomS}_n)$ est décroissante `
      const reponseNiNi = `La suite $(${NomS}_n)$ n'est ni croissante, ni décroissante. `
      const typeSuite = this.sup2 === 3 ? randint(1, 2) : this.sup2
      const definition = this.sup === 3 ? randint(1, 2) : this.sup
      switch (typeSuite) {
        case 1: // SA
          switch (definition) {
            case 1: // SA explicite
              r = randint(-10, 10, 0)
              u0 = randint(-10, 10, [0, r])

              texte = `On considère la suite $(${NomS}_n)$ définie pour tout $n\\in \\mathbb{N}$ par : $${NomS}_n=${choice([true, false]) ? `${rienSi1(r)}n${ecritureAlgebrique(u0)}` : `${u0}${ecritureAlgebriqueSauf1(r)}n`}$.
       `
              if (this.interactif) {
                texte += ' <br> Alors :'
              } else {
                texte +=
                  '<br>Déterminer, en justifiant, le sens de variation de cette suite.'
              }
              texteCorr = `On reconnaît la forme explicite d'une suite $(${NomS}_n)$ arithmétique de raison $r=${r}$ et de premier terme $${NomS}_0=${u0}$.<br>
              Or $r${r > 0 ? '>' : '<'}0$, donc ${texteEnCouleurEtGras(`la suite $(${NomS}_n)$ est ${r > 0 ? 'croissante' : 'décroissante'}`)}.`
              break

            default: // SA récurrente
              r = randint(-10, 10, 0)
              u0 = randint(-10, 10, [0, r])
              texte = `On considère la suite $(${NomS}_n)$ définie pour tout $n\\in \\mathbb{N}$ par $${NomS}_0=${u0}$ et $${NomS}_{n+1}=${NomS}_{n}${ecritureAlgebrique(r)}$.`
              if (this.interactif) {
                texte += ' <br> Alors :'
              } else {
                texte +=
                  '<br>Déterminer, en justifiant, le sens de variation de cette suite.'
              }
              texteCorr = `On reconnaît la définition par récurrence d'une suite $(${NomS}_n)$ arithmétique de raison $${r}$ et de premier terme $${NomS}_0$.<br>
              Or $r${r > 0 ? '>' : '<'}0$, donc ${texteEnCouleurEtGras(`la suite $(${NomS}_n)$ est ${r > 0 ? 'croissante' : 'décroissante'}`)}.`
              break
          }
          this.autoCorrection[i] = {
            enonce: texte,
            options: { vertical: true },
            propositions: [
              {
                texte: reponseSC,
                statut: r > 0,
              },
              {
                texte: reponseSD,
                statut: r < 0,
              },
              {
                texte: reponseNiNi,
                statut: false,
              },
            ],
          }
          monQcm = propositionsQcm(this, i)
          if (this.interactif) {
            texte = texte + monQcm.texte
          }
          break

        default: // SG
          switch (definition) {
            case 1: // SG explicite
              q = choice([
                new Decimal(randint(-20, -1, -10)).div(10),
                new Decimal(randint(1, 9)).div(10),
                new Decimal(randint(20, 90)).div(10),
              ])

              u0 = randint(-10, 10, [0, 1])

              texte = `On considère la suite $(${NomS}_n)$ définie pour tout $n\\in \\mathbb{N}$ par : $${NomS}_n=${u0 === -1 ? `-${ecritureParentheseSiNegatif(q)}^n` : `${u0}\\times${ecritureParentheseSiNegatif(q)}^n`}$.`
              if (this.interactif) {
                texte += ' <br> Alors :'
              } else {
                texte +=
                  '<br>Déterminer, en justifiant, le sens de variation de cette suite.'
              }
              texteCorr = `On reconnaît la forme explicite d'une suite $(${NomS}_n)$ géométrique de raison $q=${texNombre(q, 1)}$ et de premier terme $${NomS}_0=${u0}$.<br>`

              if (q.lessThan(1) && q.greaterThan(0) && u0 > 0) {
                texteCorr += `La suite $(${texNombre(q, 1)}^n)$ est une suite décroissante.<br>
              En multipliant par un nombre positif (ici on multiplie par $${u0}$), le sens de variation ne change pas. <br>
              On en déduit que ${texteEnCouleurEtGras(`la suite $(${NomS}_n)$ est décroissante`)}.`
              }
              if (q.lessThan(1) && q.greaterThan(0) && u0 < 0) {
                texteCorr += `La suite $(${texNombre(q, 1)}^n)$ est une suite décroissante.<br>
              En multipliant par un nombre négatif (ici on multiplie par $${u0}$), le sens de variation change. <br>
              On en déduit que ${texteEnCouleurEtGras(`la suite $(${NomS}_n)$ est croissante`)}.`
              }

              if (q.lessThan(0)) {
                texteCorr += `La suite $(${texNombre(q, 1)}^n)$ est une suite ni croissante ni décroissante.<br>
               Le sens de variation ne change pas si on multiplie par $${u0}$. <br>
              On en déduit que ${texteEnCouleurEtGras(`la suite $(${NomS}_n)$ n'est ni croissante, ni décroissante`)}.`
              }

              if (q.greaterThan(1) && u0 > 0) {
                texteCorr += `La suite $(${texNombre(q, 1)}^n)$ est une suite croissante.<br>
              En multipliant par un nombre positif (ici on multiplie par $${u0}$), le sens de variation ne change pas. <br>
              On en déduit que ${texteEnCouleurEtGras(`la suite $(${NomS}_n)$ est croissante`)}.`
              }
              if (q.greaterThan(1) && u0 < 0) {
                texteCorr += `La suite $(${texNombre(q, 1)}^n)$ est une suite croissante.<br>
              En multipliant par un nombre négatif (ici on multiplie par $${u0}$), le sens de variation change. <br>
              On en déduit que ${texteEnCouleurEtGras(`la suite $(${NomS}_n)$ est décroissante`)}.`
              }

              break

            default: // SG récurrente
              q = choice([
                new Decimal(randint(-20, -1, -10)).div(10),
                new Decimal(randint(1, 9)).div(10),
                new Decimal(randint(20, 90)).div(10),
              ])

              u0 = randint(-10, 10, [0, 1])
              texte = `On considère la suite $(${NomS}_n)$ définie pour tout $n\\in \\mathbb{N}$ par $${NomS}_0=${u0}$ et 
              $${NomS}_{n+1}=${choice([true, false]) ? `${NomS}_{n}\\times ${ecritureParentheseSiNegatif(q)}.` : `${ecritureParentheseSiNegatif(q)}\\times ${NomS}_{n}.`}$`

              if (this.interactif) {
                texte += ' <br> Alors :'
              } else {
                texte +=
                  '<br>Déterminer, en justifiant, le sens de variation de cette suite.'
              }
              texteCorr = `On reconnaît la forme récurrente d'une suite $${NomS}$ géométrique de raison $${texNombre(q, 1)}$ et de premier terme $${NomS}_0$.<br>
             `
              texteCorr = `On reconnaît la définition par récurrence d'une suite $(${NomS}_n)$ géométrique de raison $q=${texNombre(q, 1)}$ et de premier terme $${NomS}_0=${u0}$.<br>`

              if (q.lessThan(1) && q.greaterThan(0) && u0 > 0) {
                texteCorr += `Puisque $0 < q < 1$ et $${NomS}_0 >0$, ${texteEnCouleurEtGras(`la suite $(${NomS}_n)$ est décroissante`)}.`
              }
              if (q.lessThan(1) && q.greaterThan(0) && u0 < 0) {
                texteCorr += `Puisque $0 < q < 1$ et $${NomS}_0 <0$, ${texteEnCouleurEtGras(`la suite $(${NomS}_n)$ est croissante`)}.`
              }

              if (q.lessThan(0)) {
                texteCorr += `Puisque $q < 0$, ${texteEnCouleurEtGras(`la suite $(${NomS}_n)$ n'est ni croissante, ni décroissante`)}.`
              }

              if (q.greaterThan(1) && u0 > 0) {
                texteCorr += `Puisque $q > 1$ et $${NomS}_0 > 0$, ${texteEnCouleurEtGras(`la suite $(${NomS}_n)$ est croissante`)}.`
              }
              if (q.greaterThan(1) && u0 < 0) {
                texteCorr += `Puisque $q > 1$ et $${NomS}_0 < 0$, ${texteEnCouleurEtGras(`la suite $(${NomS}_n)$ est décroissante`)}.`
              }

              break
          }
          this.autoCorrection[i] = {
            enonce: texte,
            options: { vertical: true },
            propositions: [
              {
                texte: reponseSC,
                statut:
                  (q.lessThan(1) && q.greaterThan(0) && u0 < 0) ||
                  (q.greaterThan(1) && u0 > 0),
              },
              {
                texte: reponseSD,
                statut:
                  (q.lessThan(1) && q.greaterThan(0) && u0 > 0) ||
                  (q.greaterThan(1) && u0 < 0),
              },
              {
                texte: reponseNiNi,
                statut: q.lessThan(0),
              },
            ],
          }
          monQcm = propositionsQcm(this, i)
          if (this.interactif) {
            texte = texte + monQcm.texte
          }
          break
      }

      if (this.questionJamaisPosee(i, texte)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions.push(texte)
        this.listeCorrections.push(texteCorr)
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
