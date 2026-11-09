import Decimal from 'decimal.js'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const titre = 'Reconnaître une suite arithmétique/géométrique (QCM)'
export const interactifReady = true

export const dateDePublication = '23/11/2024'

/**
 *
 * @author Gilles Mora

*/
export const uuid = '42983'

export const refs = {
  'fr-fr': ['1AL11-1', '1Gen-A201'],
  'fr-ch': ['autres-2'],
}
export default class ReconnaitreSuites extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.spacing = 1.5
    this.spacingCorr = 1.5
    this.comment =
      'Cet exercice ne présentant que 3 types de suites différentes, ne possède que 3 questions au maximum.'
    this.sup = 3
    this.besoinFormulaireNumerique = [
      'Forme de la suite',
      3,
      '1 : Explicite\n2 : Récurrente\n3 : Mélange',
    ]
  }

  nouvelleVersion() {
    // this.consigne = this.interactif ? `Indiquer l'écriture simplifiée ${this.nbQuestions === 1 ? 'du calcul suivant.' : 'des calculs suivants.'}` : `Donner, si possible, une écriture simplifiée ${this.nbQuestions === 1 ? 'du calcul suivant.' : 'des calculs suivants.'}`
    const typeDeQuestionsDisponibles = [1, 2, 3]
    let typeDeQuestion
    const listeTypeDeQuestions = combinaisonListes(
      typeDeQuestionsDisponibles,
      this.nbQuestions,
    )

    // Choix du sous-cas selon la forme demandée (this.sup) : en mélange, tirage
    // uniforme parmi tous les cas ; sinon, tirage parmi ceux de la forme choisie.
    const choisitCas = (
      nbCas: number,
      explicites: number[],
      recurrents: number[],
    ) => {
      if (this.sup === 1) return choice(explicites)
      if (this.sup === 2) return choice(recurrents)
      return randint(1, nbCas)
    }

    for (
      let i = 0, a, b, r, q, u0, q1, monQcm, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      typeDeQuestion = listeTypeDeQuestions[i]
      if (this.questionJamaisPosee(i, typeDeQuestion)) {
        const ListeNomS = ['u', 'v', 'w', 't']
        const NomS = choice(ListeNomS)
        const reponseSA = `La suite $(${NomS}_n)$ est arithmétique de raison `
        const reponseSG = `La suite $(${NomS}_n)$ est géométrique de raison `
        const reponseNiNi = `La suite $(${NomS}_n)$ n'est ni arithmétique, ni géométrique. `
        const NiNi = `$${NomS}_{1}-${NomS}_{0}\\neq ${NomS}_{2}-${NomS}_{1}$ donc la suite n'est pas arithmétique.<br>
          $\\dfrac{${NomS}_{1}}{${NomS}_{0}}\\neq \\dfrac{${NomS}_{2}}{${NomS}_{1}}$ donc la suite n'est pas géométrique.<br>
          Donc ${texteEnCouleurEtGras(`la suite $(${NomS}_n)$ n'est ni arithmétique, ni géométrique`)}.`
        switch (typeDeQuestion) {
          case 1: // SA
            switch (choisitCas(3, [1, 2], [3])) {
              case 1:
                r = randint(-10, 10, 0)
                u0 = randint(-10, 10, [0, r])
                texte = `On considère la suite $(${NomS}_n)$ définie pour tout $n\\in \\mathbb{N}$ par : $${NomS}_n=${choice([true, false]) ? `${rienSi1(r)}n${ecritureAlgebrique(u0)}` : `${u0}${ecritureAlgebriqueSauf1(r)}n`}$.<br>
          Alors :`
                texteCorr = `On reconnaît la forme explicite d'une suite $${NomS}$ arithmétique de raison $r$ et de premier terme $${NomS}_0$ :<br> $${NomS}_n=${NomS}_0+n\\times r$ avec $${NomS}_0=${u0}$ et $r=${r}$.`
                break

              case 2: // SA forme explicite2
                r = randint(-10, 10, 0)
                u0 = randint(-10, 10, [0, r])
                texte = `On considère la suite $(${NomS}_n)$ définie pour tout $n\\in \\mathbb{N}^*$ par :
          $${NomS}_n=${choice([true, false]) ? `\\dfrac{${rienSi1(r)}n^2${ecritureAlgebrique(u0)}n}{n}` : `\\dfrac{${rienSi1(u0)}n${ecritureAlgebriqueSauf1(r)}n^2}{n}`}$.<br>
          Alors :`
                texteCorr = `$${NomS}_n=${choice([true, false]) ? `\\dfrac{${rienSi1(r)}n^2${ecritureAlgebrique(u0)}n}{n}` : `\\dfrac{${u0}n${ecritureAlgebriqueSauf1(r)}n^2}{n}`}
          =${rienSi1(r)}n${ecritureAlgebrique(u0)}$<br>
          On reconnaît la forme explicite d'une suite $${NomS}$ arithmétique de raison $r=${r}$.`
                break

              default: // SA forme récurrente
                u0 = randint(-10, 10, 0)
                r = randint(-10, 10, [0, u0])
                texte = `On considère la suite $(${NomS}_n)$ définie pour tout $n\\in \\mathbb{N}$ par : $${NomS}_{n+1}=${choice([true, false]) ? `${NomS}_n${ecritureAlgebrique(r)}` : `${r}+${NomS}_n`}$ et $${NomS}_0=${u0}$.<br>
                  Alors :`
                texteCorr = `On reconnaît la forme récurrente d'une suite $${NomS}$ arithmétique de raison $r$ :<br> $${NomS}_{n+1}=${NomS}_n+ r$ avec $r=${r}$.`
                break
            }
            this.autoCorrection[i] = {
              enonce: texte,
              options: { vertical: true },
              propositions: [
                {
                  texte: reponseSA + `$${r}$.`,
                  statut: true,
                },
                {
                  texte: reponseSA + `$${u0}$.`,
                  statut: false,
                },
                {
                  texte: reponseSG + ` $${r}$.`,
                  statut: false,
                },
                {
                  texte: reponseNiNi,
                  statut: false,
                },
              ],
            }
            texteCorr =
              texteCorr +
              `<br> ${texteEnCouleurEtGras(`La suite $(${NomS}_n)$ est arithmétique de raison`)} $${miseEnEvidence(r)}$.`
            break

          case 2: // SG
            switch (choisitCas(4, [3, 4], [1, 2])) {
              case 1: // SG forme récurrente
                u0 = randint(-10, 10, 0)
                q = randint(-9, 9, [0, 1, -1, u0])
                texte = `On considère la suite $(${NomS}_n)$ définie pour tout $n\\in \\mathbb{N}$ par : $${NomS}_{n+1}=${choice([true, false]) ? `${NomS}_n\\times ${ecritureParentheseSiNegatif(q)}` : `${q}${NomS}_n`}$ et $${NomS}_0=${u0}$.<br>
            Alors :`
                texteCorr = `On reconnaît la forme récurrente d'une suite $${NomS}$ géométrique de raison $q$ :<br> $${NomS}_{n+1}=q\\times ${NomS}_n$ avec $q=${q}$.`
                break
              case 2:
                a = new Decimal(randint(-9, 9, 0)).div(10)
                u0 = randint(-9, 9, 0)
                q = a.add(1)
                texte = `On considère la suite $(${NomS}_n)$ définie pour tout $n\\in \\mathbb{N}$ par : $${NomS}_{n+1}=${NomS}_n${ecritureAlgebrique(a)}${NomS}_n$.<br>
          Alors :`
                texteCorr = `$${NomS}_{n+1}=${NomS}_n${ecritureAlgebrique(a)}${NomS}_n=${texNombre(q, 1)}${NomS}_n$.<br>
          On reconnaît la forme récurrente d'une suite $${NomS}$ géométrique de raison $q=${texNombre(q, 1)}$.`
                break

              case 3: // SG forme explicite1
                q = new Decimal(randint(-9, 9, 0)).div(10)
                u0 = randint(-9, 9, [0, -1, 1])
                texte = `On considère la suite $(${NomS}_n)$ définie pour tout $n\\in \\mathbb{N}$ par : $${NomS}_{n}=${u0}\\times ${ecritureParentheseSiNegatif(q)}^n$.<br>
                  Alors :`
                texteCorr = `On reconnaît la forme explicite d'une suite $${NomS}$ géométrique de raison $q$ et de premier terme $${NomS}_0$ :<br> $${NomS}_n=${NomS}_0\\times q^n$ avec $${NomS}_0=${u0}$ et $q=${texNombre(q, 1)}$.`
                break
              default: // SG forme explicite2
                q1 = choice([2, 4, 5])
                q = new Decimal(1).div(q1)
                u0 = randint(-9, 9, [0, -1, 1, q1])
                texte = `On considère la suite $(${NomS}_n)$ définie pour tout $n\\in \\mathbb{N}$ par : $${NomS}_{n}=\\dfrac{${u0}}{${q1}^n}$.<br>
                  Alors :`
                texteCorr = `On a $${NomS}_{n}=\\dfrac{${u0}}{${q1}^n}=${u0}\\times \\left(\\dfrac{1}{${q1}}\\right)^n$.<br>
                  On reconnaît la forme explicite d'une suite $${NomS}$ géométrique de raison $q$ et de premier terme $${NomS}_0$ :<br> $${NomS}_n=${NomS}_0\\times q^n$ avec $${NomS}_0=${u0}$ et $q=\\dfrac{1}{${q1}}=${texNombre(q, 2)}$.`
                break
            }

            this.autoCorrection[i] = {
              enonce: texte,
              options: { vertical: true },
              propositions: [
                {
                  texte: reponseSA + `$${texNombre(q, 2)}$.`,
                  statut: false,
                },
                {
                  texte: reponseSG + `$${u0}$.`,
                  statut: false,
                },
                {
                  texte: reponseSG + ` $${texNombre(q, 2)}$.`,
                  statut: true,
                },
                {
                  texte: reponseNiNi,
                  statut: false,
                },
              ],
            }
            texteCorr =
              texteCorr +
              `<br> ${texteEnCouleurEtGras(`La suite $(${NomS}_n)$ est géométrique de raison`)} $${miseEnEvidence(texNombre(q, 2))}$.`
            break

          default: // NiNi
            switch (choisitCas(3, [3], [1, 2])) {
              case 1: // NiNi1
                u0 = randint(-9, 9, [0, -1, 1])
                a = randint(-9, 9, [0, u0])
                texte = `On considère la suite $(${NomS}_n)$ définie pour tout $n\\in \\mathbb{N}$ par : $${NomS}_{n+1}=${a}-${NomS}_{n}$ et $${NomS}_{0}=${u0}$.<br>
            Alors :`
                texteCorr =
                  `On a $${NomS}_{0}=${u0}$, $${NomS}_{1}=${a - u0}$ et $${NomS}_{2}=${u0}$.<br>
            ` + NiNi
                break
              case 2:
                u0 = randint(-9, 9, [0, -1, 1])
                a = randint(-5, 5, [0, u0, -1, 1])
                b = randint(-5, 5, [0, a])
                texte = `On considère la suite $(${NomS}_n)$ définie pour tout $n\\in \\mathbb{N}$ par : $${NomS}_{n+1}=${a}${NomS}_{n}${ecritureAlgebrique(b)}$ et $${NomS}_{0}=${u0}$.<br>
            Alors :`

                texteCorr =
                  `On a $${NomS}_{0}=${u0}$, $${NomS}_{1}=${a * u0 + b}$ et $${NomS}_{2}=${a * (a * u0 + b) + b}$.<br>
            ` + NiNi
                break
              default: // NiNi3
                a = randint(-5, 5, 0)
                u0 = randint(-5, 5, [0, a])
                texte = `On considère la suite $(${NomS}_n)$ définie pour tout $n\\in \\mathbb{N}$ par : $${NomS}_{n}=${rienSi1(a)}n^2${ecritureAlgebrique(u0)}$.<br>
            Alors :`
                texteCorr =
                  `On a $${NomS}_{0}=${u0}$, $${NomS}_{1}=${a + u0}$ et $${NomS}_{2}=${a * 4 + u0}$.<br>
            ` + NiNi
                break
            }

            this.autoCorrection[i] = {
              enonce: texte,
              options: { vertical: true },
              propositions: [
                {
                  texte: reponseSA + `$${a}$.`,
                  statut: false,
                },
                {
                  texte: reponseSG + `$${a}$.`,
                  statut: false,
                },
                {
                  texte: reponseSA + `$${u0}$.`,
                  statut: false,
                },
                {
                  texte: reponseNiNi,
                  statut: true,
                },
              ],
            }
            break
        }
        monQcm = propositionsQcm(this, i)
        texte = texte + monQcm.texte

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
