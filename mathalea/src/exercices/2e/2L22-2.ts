import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { ecritureAlgebrique, rienSi1 } from '../../lib/outils/ecritures'
import { miseEnEvidence, texteGras } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'

import { extraireRacineCarree } from '../../lib/outils/calculs'
import FractionEtendue from '../../modules/FractionEtendue'
import Trinome from '../../modules/Trinome'
import { sp } from '../../lib/outils/outilString'
export const titre = 'Résoudre une équation avec un carré'
export const interactifReady = true

export const dateDeModifImportante = '12/10/2024'
/**
 * Résoudre des équations de type x² = a
 * @author Gilles Mora (Stéphane Guyon)
 * 2L22-2, ex 2L11-1
 */
export const uuid = 'bb6d5'

export const refs = {
  'fr-fr': ['2L22-2'],
  'fr-ch': ['11LSFA4E-6'],
}
export default class FactoriserIdentitesRemarquables2 extends Exercice {
  can: boolean
  constructor() {
    super()
    this.nbQuestions = 1
    this.sup = '8'
    this.spacing = 1.5
    this.spacingCorr = 1.5
    this.can = false
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : $x²-a²=0$',
        '2 : $x²-a=0$',
        '3 : $x²+a²=0$',
        '4 : $x²=a$',
        '5 : $ax²+b=0$',
        '6 : $a²(x-c)²$+/-$ b²=0$',
        '7 : $a(x-c)²+b=0$',
        '8 : Mélange',
      ].join('\n'),
    ]
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 7,
      melange: 8,
      defaut: 8,
      nbQuestions: this.nbQuestions,
    })
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let a, a1
      let b
      let k
      let p
      let alpha
      let beta, beta1
      let frac, frac1
      let reponse
      let reduction
      const CorrIdentite = `On reconnaît l'identité remarquable $a^2-b^2$ qui se factorise en $(a-b)(a+b)$.<br>
          On l'applique avec `
      const CorrCarre = `On isole le carré pour se ramener à une équation du type $x^2=k$.<br>
        Résoudre l'équation revient à résoudre `
      const CorrCarre2 = `On isole le carré pour se ramener à une équation du type $X^2=k$.<br>
        Résoudre l'équation revient à résoudre `
      // const texteInteractif = '<br>Écrire les solutions sous la forme la plus simple possible.'
      const CorrNegatif = ` est strictement négatif, l'équation n'a pas de solution.<br>
          Ainsi, $S=${miseEnEvidence('\\emptyset')}$.`
      const CorrPositif =
        ` est strictement positif, l'équation a deux solutions${sp()}: `
      const choix = choice([true, false])
      if (!this.can) {
        this.consigne = `Résoudre dans $\\mathbb{R}$${sp()}:`
      }
      switch (listeTypeDeQuestions[i]) {
        case 1:
          a = randint(1, 9)
          b = randint(2, 19, [4, 8, 9, 12, 16])
          if (this.can) {
            texte = `Résoudre, dans $\\mathbb{R}$,${sp()}:<br>`
            texte += `${choix ? `$x^{2}-${a * a}=0$` : `$${a * a}-x^2=0$`} `
          } else {
            texte = `${choix ? `$x^{2}-${a * a}=0$` : `$${a * a}-x^2=0$`} `
          } // x²-a²=0
          reponse = `\\{-${a};${a}\\}`
          handleAnswers(this, i, {
            reponse: { value: reponse, options: { ensembleDeNombres: true } },
          })
          if (!this.can) {
            texteCorr =
              `${texteGras(`Méthode $\\mathbf{1}$${sp()}:`)}<br>` +
              CorrIdentite +
              `$a=${choix ? 'x' : `${a}`}$ et $b=${choix ? `${a}` : 'x'}$.<br>
         Résoudre l'équation revient à résoudre ${choix ? `$(x-${a})(x+${a})=0$` : `$(${a}-x)(${a}+x)=0$`} (on reconnaît une équation produit nul).<br>  
        ${choix ? `$x-${a}=0$` : `$${a}-x=0$`} ou ${choix ? `$x+${a}=0$` : `$${a}+x=0$`}<br>
        $x=${a}$ ou $x=-${a}$<br>`
            texteCorr += `Ainsi, $S=${miseEnEvidence(`\\{-${a};${a}\\}`)}$.
            <br>${texteGras(`Méthode $\\mathbf{2}$${sp()}:`)}<br>`
          } else {
            texteCorr = ''
          }
          texteCorr +=
            CorrCarre +
            ` $x^2=${a * a}$.<br>  
        Puisque $${a * a}$` +
            CorrPositif
          texteCorr += `$-\\sqrt{${a * a}}=-${a}$ et $\\sqrt{${a * a}}=${a}$.<br>`
          texteCorr += `Ainsi, $S=${miseEnEvidence(`\\{-${a}\\,;\\,${a}\\}`)}$.`
          break
        case 2:
          b = randint(2, 35, [4, 9, 16, 25])
          reduction = extraireRacineCarree(b)
          reponse = [
            `\\{-${reduction[0]}\\sqrt{${reduction[1]}};${reduction[0]}\\sqrt{${reduction[1]}}\\}`,
            `\\{-\\sqrt{${b}};\\sqrt{${b}}\\}`,
          ]
          if (this.can) {
            texte = `Résoudre, dans $\\mathbb{R}$,${sp()}:<br>`
            texte += `$x^{2}-${b}=0$`
          } else {
            texte = `$x^{2}-${b}=0$`
          } // x²-b=0
          if (!this.can) {
            texteCorr =
              `${texteGras(`Méthode $\\mathbf{1}$${sp()}:`)}<br>` +
              CorrIdentite +
              ` $ a=x$ et $b=\\sqrt{${b}}$.<br>
         Résoudre l'équation revient à résoudre $(x-\\sqrt{${b}})(x+\\sqrt{${b}})=0$ (on reconnaît une équation produit nul).<br>  
        $x-\\sqrt{${b}}=0$ ou $x+\\sqrt{${b}}=0$<br>
        $x=\\sqrt{${b}}$ ou $x=-\\sqrt{${b}}$<br>
        Ainsi, $S=${miseEnEvidence(`\\{-\\sqrt{${b}}\\,;\\,\\sqrt{${b}}\\}`)}$<br>
       `
            texteCorr += ` <br>${texteGras(`Méthode $\\mathbf{2}$${sp()}:`)}<br>`
            texteCorr +=
              CorrCarre +
              ` $x^2=${b}$.<br>  
        Puisque $${b}$` +
              CorrPositif
            texteCorr += ` $-\\sqrt{${b}}$ et $\\sqrt{${b}}$.<br>`
            texteCorr += `Ainsi, $S=${miseEnEvidence(`\\{-\\sqrt{${b}}\\,;\\,\\sqrt{${b}}\\}`)}$.`
          } else {
            texteCorr = ''
            texteCorr +=
              CorrCarre +
              ` $x^2=${b}$.<br>  
        Puisque $${b}$` +
              CorrPositif
            texteCorr += ` $-\\sqrt{${b}}$ et $\\sqrt{${b}}$.<br>`
            texteCorr += `Ainsi, $S=${miseEnEvidence(`\\{-\\sqrt{${b}}\\,;\\,\\sqrt{${b}}\\}`)}$.`
          }

          handleAnswers(this, i, {
            reponse: { value: reponse, options: { ensembleDeNombres: true } },
          })

          break
        case 3:
          a = randint(1, 9)
          b = randint(2, 19, [4, 8, 9, 12, 16])
          reponse = '\\emptyset'
          if (this.can) {
            texte = `Résoudre, dans $\\mathbb{R}$,${sp()}:<br>`
            texte += `$x^{2}+${a * a}=0$`
          } else {
            texte = `$x^{2}+${a * a}=0$`
          } // x²+a²=0
          texteCorr +=
            `On isole le carré. L'équation s'écrit $x^{2}=-${a * a}$.<br>
          Comme $-${a * a}$` + CorrNegatif
          handleAnswers(this, i, {
            reponse: { value: reponse, options: { ensembleDeNombres: true } },
          })

          break

        case 4:
          switch (
            choice(['a', 'b']) //, 'b'
          ) {
            case 'a':
              a = randint(-24, 24, [0, 1, 4, 9, 16])
              reduction = extraireRacineCarree(a)
              if (this.can) {
                texte = `Résoudre, dans $\\mathbb{R}$,${sp()}:<br>`
                texte += `$x^{2}=${a}$`
              } else {
                texte = `$x^{2}=${a}$`
              } // x²=a

              reponse =
                a > 0
                  ? [
                      `\\{-\\sqrt{${a}};\\sqrt{${a}}\\}`,
                      `\\{-${reduction[0]}\\sqrt{${reduction[1]}};${reduction[0]}\\sqrt{${reduction[1]}}\\}`,
                    ]
                  : '\\emptyset'

              texteCorr = ` On reconnaît une équation du type $x^2=k$ avec $k=${a}$.<br>`
              if (a > 0) {
                texteCorr += `Puisque $${a}$ ` + CorrPositif
                texteCorr += ` $-\\sqrt{${a}}$ et $\\sqrt{${a}}$.<br>`
                texteCorr += `Ainsi, $S=${miseEnEvidence(`\\{-\\sqrt{${a}};\\sqrt{${a}}\\}`)}$.`
              } else {
                texteCorr = `Puisque $${a}$ ` + CorrNegatif
              }
              handleAnswers(this, i, {
                reponse: {
                  value: reponse,
                  options: { ensembleDeNombres: true },
                },
              })
              break
            case 'b':
              b = randint(1, 12)
              a = b ** 2 * choice([-1, 1])
              if (this.can) {
                texte = `Résoudre, dans $\\mathbb{R}$,${sp()}:<br>`
                texte += `$x^{2}=${a}$`
              } else {
                texte = `$x^{2}=${a}$`
              }
              texteCorr = ` On reconnaît une équation du type $x^2=k$ avec $k=${a}$.<br>`
              if (a > 0) {
                texteCorr += `Puisque $${a}$ ` + CorrPositif
                texteCorr += ` $-\\sqrt{${a}}=-${b}$ et $\\sqrt{${a}}=${b}$.<br>`
                texteCorr += `Ainsi, $S=${miseEnEvidence(`\\{-${b}\\,;\\,${b}\\}`)}$.`
                reponse = [
                  `\\{-${b};${b}\\}`,
                  `\\{-\\sqrt{${a}};\\sqrt{${a}}\\}`,
                ]
              } else {
                reponse = '\\emptyset'
                texteCorr += `Puisque $${a}$ ` + CorrNegatif
              }
              handleAnswers(this, i, {
                reponse: {
                  value: reponse,
                  options: { ensembleDeNombres: true },
                },
              })
              break
          }
          break
        case 5:
          a = randint(2, 9)
          k = randint(-7, 17, [0, 1, 4, 9])
          b = a * k
          if (this.can) {
            texte = `Résoudre, dans $\\mathbb{R}$,${sp()}:<br>`
            texte += `${choix ? `$${a}x^{2}${ecritureAlgebrique(-b)}=0$` : `$${-b}${ecritureAlgebrique(a)}x^{2}=0$`}`
          } else {
            texte = `${choix ? `$${a}x^{2}${ecritureAlgebrique(-b)}=0$` : `$${-b}${ecritureAlgebrique(a)}x^{2}=0$`}`
          }
          texteCorr = '' + CorrCarre + ` $x^2=${k}$.<br>  `
          if (k < 0) {
            reponse = '\\emptyset'
            texteCorr += `Puisque $${k}$ ` + CorrNegatif
          } else {
            reduction = extraireRacineCarree(k)
            reponse = [
              `\\{-${reduction[0]}\\sqrt{${reduction[1]}};${reduction[0]}\\sqrt{${reduction[1]}}\\}`,
              `\\{-\\sqrt{${k}};\\sqrt{${k}}\\}`,
            ]
            texteCorr += `Puisque $${k}$ ` + CorrPositif
            texteCorr += ` $-\\sqrt{${k}}$ et $\\sqrt{${k}}$.<br>`
            texteCorr += `Ainsi, $S=${miseEnEvidence(`\\{-\\sqrt{${k}}\\,;\\,\\sqrt{${k}}\\}`)}$.`
          }
          handleAnswers(this, i, {
            reponse: { value: reponse, options: { ensembleDeNombres: true } },
          })

          break
        case 6:
          a1 = randint(1, 12)
          a = a1 ** 2
          alpha = randint(1, 10)
          beta1 = randint(1, 12)
          beta = beta1 ** 2 * choice([-1, 1, -1])
          p = new Trinome(a, -2 * a * alpha, a * alpha ** 2 + beta)
          p.defFormeCanonique(a, alpha, beta)
          frac = new FractionEtendue(-beta, a)
          frac1 = new FractionEtendue(-beta1, a1)
          reponse =
            beta < 0
              ? [
                  `\\{${p.texX1};${p.texX2}\\}`,
                  `\\{${texNombre((alpha * a1 + beta1) / a1, 1)};${texNombre((a1 * alpha - beta1) / a1, 1)}\\}`,
                ]
              : '\\emptyset'
          if (this.can) {
            texte = `Résoudre, dans $\\mathbb{R}$,${sp()}:<br>`
            texte += `$${p.texFormeCanonique}=0$`
          } else {
            texte = `$${p.texFormeCanonique}=0$`
          }

          if (beta < 0) {
            texteCorr =
              `${texteGras(`Méthode $\\mathbf{1}$${sp()}:`)}<br> ` +
              CorrIdentite +
              ` $a=${rienSi1(a1)}(x${ecritureAlgebrique(-alpha)})$ et $b=${beta1}$.<br>
         Résoudre l'équation revient à résoudre $(${rienSi1(a1)}(x${ecritureAlgebrique(-alpha)})-${beta1})(${rienSi1(a1)}(x${ecritureAlgebrique(-alpha)})+${beta1})=0$ ou encore 
        $(${rienSi1(a1)}x${ecritureAlgebrique(-alpha * a1 - beta1)})(${rienSi1(a1)}x${ecritureAlgebrique(-a1 * alpha + beta1)})=0$ (on reconnaît une équation produit nul).<br> 
        L'équation $${rienSi1(a1)}x${ecritureAlgebrique(-alpha * a1 - beta1)}=0$ a pour solution $x=${p.texX2}$ et l'équation $${rienSi1(a1)}x${ecritureAlgebrique(-a1 * alpha + beta1)}=0$ a pour solution $x=${p.texX1}$.<br>
       `
            texteCorr += `Ainsi, $S=${miseEnEvidence(`\\left\\{${p.texX1}\\,;\\,${p.texX2}\\right\\}`)}$.`
            texteCorr +=
              `<br>${texteGras(`Méthode $\\mathbf{2}$${sp()}:`)}<br> ` +
              CorrCarre2 +
              ` $(x${ecritureAlgebrique(-alpha)})^2=${frac.texFractionSimplifiee}$.<br>
          Puisque $${frac.texFractionSimplifiee}$ est strictement positif, les solutions sont données par chacune des équations${sp()}:<br>
         $x${ecritureAlgebrique(-alpha)}=${frac1.texFractionSimplifiee}$ et $x${ecritureAlgebrique(-alpha)}=${frac1.oppose().texFractionSimplifiee}$.<br>
         L'équation $x${ecritureAlgebrique(-alpha)}=${frac1.texFractionSimplifiee}$ a pour solution $x=${p.texX1}$ et l'équation 
         $x${ecritureAlgebrique(-alpha)}=${frac1.oppose().texFractionSimplifiee}$ a pour solution $x=${p.texX2}$. <br>`
            texteCorr += `Ainsi, $S=${miseEnEvidence(`\\left\\{${p.texX1}\\,;\\,${p.texX2}\\right\\}`)}$.`
          } else {
            texteCorr =
              '' +
              CorrCarre2 +
              ` $(x${ecritureAlgebrique(-alpha)})^2=${frac.texFractionSimplifiee}$.<br> `
            texteCorr +=
              `Puisque $${frac.texFractionSimplifiee}$ ` + CorrNegatif
          }

          handleAnswers(this, i, {
            reponse: { value: reponse, options: { ensembleDeNombres: true } },
          })
          break

        case 7:
          a = randint(1, 10) * choice([-1, 1, 1])
          alpha = randint(1, 10)
          k = choice([2, 3, 5, 7, 10, 11]) * choice([-1, 1, -1])
          beta = a * k
          p = new Trinome(a, -2 * a * alpha, a * alpha ** 2 + beta)
          p.defFormeCanonique(a, alpha, beta)
          frac = new FractionEtendue(-beta, a)
          if (this.can) {
            texte = `Résoudre, dans $\\mathbb{R}$,${sp()}:<br>`
            texte += `$${p.texFormeCanonique}=0$`
          } else {
            texte = `$${p.texFormeCanonique}=0$`
          }

          texteCorr =
            '' +
            CorrCarre2 +
            ` $(x${ecritureAlgebrique(-alpha)})^2=${frac.texFractionSimplifiee}$.<br> `
          if (beta * a < 0) {
            reponse = `\\{${p.texX1};${p.texX2}\\}`
            texteCorr += `Puisque $${frac.texFractionSimplifiee}$ est strictement positif, les solutions sont données par chacune des équations${sp()}:<br>
         $x${ecritureAlgebrique(-alpha)}=\\sqrt{${-k}}$ et $x${ecritureAlgebrique(-alpha)}=-\\sqrt{${-k}}$.<br>
         L'équation $x${ecritureAlgebrique(-alpha)}=\\sqrt{${-k}}$ a pour solution $x=${p.texX2}$ et l'équation 
         $x${ecritureAlgebrique(-alpha)}=-\\sqrt{${-k}}$ a pour solution $x=${p.texX1}$. <br>`
            texteCorr += `Ainsi, $S=${miseEnEvidence(`\\left\\{${p.texX1}\\,;\\,${p.texX2}\\right\\}`)}$.`
          } else {
            texteCorr +=
              `Puisque $${frac.texFractionSimplifiee}$ ` + CorrNegatif
            reponse = '\\emptyset'
          }

          handleAnswers(this, i, {
            reponse: { value: reponse, options: { ensembleDeNombres: true } },
          })
          break
      }

      texte +=
        '<br>' +
        ajouteChampTexteMathLive(this, i, KeyboardType.clavierEnsemble, {
          texteAvant: ' $S=$',
        })
      if (this.questionJamaisPosee(i, texte)) {
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
