import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

import Decimal from 'decimal.js'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'

export const titre =
  "Donner la forme explicite d'une suite arithmétique ou géométrique"

export const dateDePublication = '30/11/2024'
export const interactifReady = true

/**
 *
 * @author Gilles Mora
 */
export const uuid = 'b30ac'

export const refs = {
  'fr-fr': ['1AL11-6'],
  'fr-ch': [],
}
export default class SuitesExplicites extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.sup = '5'
    this.spacing = 1.5
    this.spacingCorr = 2
    this.besoinFormulaire2CaseACocher = [
      'Le premier terme de la suite est $u_p$',
    ]
    this.correctionDetaillee = false
    this.correctionDetailleeDisponible = true
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : Suite arithmétique définie directement',
        '2 : Suite arithmétique définie par une relation de récurrence',
        '3 : Suite géométrique définie directement',
        '4 : Suite géométrique défine par une relation de récurrence',
        '5 : Mélange',
      ].join('\n'),
    ]
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 4,
      melange: 5,
      defaut: 5,
      nbQuestions: this.nbQuestions,
    })
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let reponse
      const ListeNomS = ['u', 'v', 'w', 't']
      const NomS = choice(ListeNomS)
      let r = new Decimal(1)
      let a = new Decimal(1)
      let b = new Decimal(1)
      let q = new Decimal(1)
      let indice
      switch (listeTypeDeQuestions[i]) {
        case 1: // SA définie directement
          a = choice([
            new Decimal(randint(1, 99)).div(10),
            new Decimal(randint(-12, 12, 0)),
          ])
          r = choice([
            new Decimal(randint(-99, 99, [0, 10])).div(10),
            new Decimal(randint(-15, 15, 0)),
          ])
          indice = this.sup2 ? randint(1, 10) : 0
          b = new Decimal(r).mul(indice).mul(-1).add(a)
          reponse = this.sup2
            ? `${reduireAxPlusB(r, b, 'n')}`
            : `${reduireAxPlusB(r, a, 'n')}`
          handleAnswers(this, i, {
            reponse: { value: reponse, options: { calculFormel: true } },
          })
          texte = `Soit $(${NomS}_n)$ une suite arithmétique de raison $r=${texNombre(r, 1)}$ telle que $${NomS}_{${indice}}=${texNombre(a, 2)}$.<br>
        Donner une expression de $${NomS}_n$ en fonction de $n$.`

          if (this.sup2) {
            if (this.interactif) {
              texte +=
                '<br>Écrire cette expression sous forme développée et réduite.'
            }
            texteCorr = `La suite $(${NomS}_n)$ est arithmétique, on a pour tout $n$ et $p$ entiers naturels : $${NomS}_n=${NomS}_p+(n-p)\\times r$.<br>
          Pour tout $n\\in\\mathbb{N}$, <br>
          $\\begin{aligned}          
          ${NomS}_n&=${texNombre(a, 1)}+(n-${indice})\\times ${ecritureParentheseSiNegatif(r)}\\\\
          &=${miseEnEvidence(`${texNombre(b, 1)}${ecritureAlgebriqueSauf1(r)}n`)}
          \\end{aligned}$`
          } else {
            texteCorr = `La suite $(${NomS}_n)$ est arithmétique, l'expression de $${NomS}_n$ en fonction de $n$ est donnée par : $${NomS}_n=${NomS}_0+n\\times r$.<br>
          Ainsi, pour tout $n\\in\\mathbb{N}$, $${NomS}_n=${miseEnEvidence(`${texNombre(a, 1)}${ecritureAlgebriqueSauf1(r)}n`)}$.`
          }
          break
        case 2: // SA définie avec une Relation de récurrence
          a = choice([
            new Decimal(randint(1, 99)).div(10),
            new Decimal(randint(-12, 12, 0)),
          ])
          r = choice([
            new Decimal(randint(-99, 99, [0, 10])).div(10),
            new Decimal(randint(-15, 15, 0)),
          ])
          indice = this.sup2 ? randint(1, 10) : 0
          b = new Decimal(r).mul(indice).mul(-1).add(a)
          reponse = this.sup2
            ? [
                `${texNombre(b, 1)}+n\\times ${ecritureParentheseSiNegatif(r)} `,
                `${texNombre(b, 1)}${ecritureAlgebriqueSauf1(r)}n`,
              ]
            : [
                `${texNombre(a, 1)}+n\\times ${ecritureParentheseSiNegatif(r)}`,
                `${texNombre(a, 1)}${ecritureAlgebriqueSauf1(r)}n`,
              ]
          handleAnswers(this, i, {
            reponse: {
              value: reponse,
              options: { calculFormel: true },
            },
          })
          texte = `Soit $(${NomS}_n)$ une suite définie par $${NomS}_{${indice}}=${texNombre(a, 1)}$ et  
        $${NomS}_{n+1}=${NomS}_n${ecritureAlgebrique(r)}$ pour tout entier naturel $n$.<br>
      Donner une expression de $${NomS}_n$ en fonction de $n$.`
          texteCorr = `$${NomS}_{n+1}=${NomS}_n${ecritureAlgebrique(r)}$ est la relation de récurrence d'une suite arithmétique de raison $${texNombre(r, 1)}$.<br>`
          if (this.sup2) {
            if (this.interactif) {
              texte +=
                '<br> Écrire cette expression sous forme développée et réduite.'
            }
            texteCorr += `On a pour tout $n$ et $p$ entiers naturels : $${NomS}_n=${NomS}_p+(n-p)\\times r$.<br>
        Pour tout $n\\in\\mathbb{N}$ : <br>
        $\\begin{aligned}          
        ${NomS}_n&=${texNombre(a, 1)}+(n-${indice})\\times ${r.isPositive() ? `${texNombre(r, 1)}` : `(${texNombre(r, 1)})`}\\\\
        &=${miseEnEvidence(`${texNombre(b, 1)}${ecritureAlgebriqueSauf1(r)}n`)}
        \\end{aligned}$`
          } else {
            texteCorr += `L'expression de $${NomS}_n$ en fonction de $n$ est donnée par : $${NomS}_n=${NomS}_0+n\\times r$.<br>
        Ainsi, pour tout $n\\in\\mathbb{N}$, $${NomS}_n=${miseEnEvidence(`${texNombre(a, 1)}${ecritureAlgebriqueSauf1(r)}n`)}$.`
          }
          break
        case 3: // SG définie directement
          a = choice([
            new Decimal(randint(1, 99, 10)).div(10),
            new Decimal(randint(-12, 12, [0, 1])),
          ])
          q = choice([
            new Decimal(randint(-99, 99, [0, 10])).div(10),
            new Decimal(randint(-15, 15, [0, 1])),
          ])
          indice = this.sup2 ? randint(1, 10) : 0

          reponse = this.sup2
            ? `${texNombre(a, 1)}\\times ${ecritureParentheseSiNegatif(q)}^{n-${indice}} `
            : `${texNombre(a, 1)}\\times ${ecritureParentheseSiNegatif(q)}^n`
          //  handleAnswers(this, i, { reponse: { value: reponse, options: { nbFacteursIdentiquesFactorisation: true } } })
          handleAnswers(this, i, {
            reponse: {
              value: reponse,
              options: {
                fonction: true,
                variable: 'n',
                entier: true,
                domaine: [0, 10],
              },
            },
          })
          texte = `Soit $(${NomS}_n)$ une suite géométrique de raison $q=${texNombre(q, 1)}$ telle que $${NomS}_{${indice}}=${texNombre(a, 2)}$.<br>
        Donner une expression de $${NomS}_n$ en fonction de $n$.`
          if (this.sup2) {
            texteCorr = `La suite $(${NomS}_n)$ est géométrique, on a pour tout $n$ et $p$ entiers naturels : $${NomS}_n=${NomS}_p\\times q^{n-p}$.<br>
          Pour tout $n\\in\\mathbb{N}$, $${NomS}_n=${miseEnEvidence(`${texNombre(a, 1)}\\times ${ecritureParentheseSiNegatif(q)}^{n-${indice}}`)}$.`
          } else {
            texteCorr = `La suite $(${NomS}_n)$ est géométrique, l'expression de $${NomS}_n$ en fonction de $n$ est donnée par : $${NomS}_n=${NomS}_0\\times q^n$.<br>
          Ainsi, pour tout $n\\in\\mathbb{N}$, $${NomS}_n=${miseEnEvidence(`${texNombre(a, 1)}\\times${ecritureParentheseSiNegatif(q)}^n`)}$.`
          }

          break

        case 4: // SG définie par relation de récurrence
          a = choice([
            new Decimal(randint(1, 99, 10)).div(10),
            new Decimal(randint(-12, 12, [0, 1])),
          ])
          q = choice([
            new Decimal(randint(-99, 99, [0, 10])).div(10),
            new Decimal(randint(-15, 15, [0, 1])),
          ])
          indice = this.sup2 ? randint(1, 10) : 0
          reponse = this.sup2
            ? `${texNombre(a, 1)}\\times ${ecritureParentheseSiNegatif(q)}^{n-${indice}} `
            : `${texNombre(a, 1)}\\times ${ecritureParentheseSiNegatif(q)}^n`
          handleAnswers(this, i, {
            reponse: { value: reponse, options: { calculFormel: true } },
          })
          texte = `Soit $(${NomS}_n)$ une suite définie par $${NomS}_{${indice}}=${texNombre(a, 1)}$ et  
        $${NomS}_{n+1}=${texNombre(q, 1)}\\times ${NomS}_n$ pour tout entier naturel $n$.<br>
      Donner une expression de $${NomS}_n$ en fonction de $n$.`
          texteCorr = `$${NomS}_{n+1}=${texNombre(q, 1)}\\times ${NomS}_n$ est la relation de récurrence d'une suite géométrique de raison $${texNombre(q, 1)}$.<br>`
          if (this.sup2) {
            texteCorr += `On a pour tout $n$ et $p$ entiers naturels : $${NomS}_n=${NomS}_p\\times q^{n-p}$.<br>
         Pour tout $n\\in\\mathbb{N}$, $${NomS}_n=${miseEnEvidence(`${texNombre(a, 1)}\\times ${ecritureParentheseSiNegatif(q)}^{n-${indice}}`)}$.`
          } else {
            texteCorr += `On a pour tout $n$ et $p$ entiers naturels : $${NomS}_n=${NomS}_p\\times q^{n-p}$.<br>
         Pour tout $n\\in\\mathbb{N}$, $${NomS}_n=${miseEnEvidence(`${texNombre(a, 1)}\\times${ecritureParentheseSiNegatif(q)}^n`)}$.`
          }

          break
      }

      if (this.interactif) {
        texte +=
          '<br>' +
          ajouteChampTexteMathLive(this, i, KeyboardType.lyceeClassique, {
            texteAvant: `$${NomS}_n=$`,
          })
      }
      if (this.questionJamaisPosee(i, a, q, r, b)) {
        // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
