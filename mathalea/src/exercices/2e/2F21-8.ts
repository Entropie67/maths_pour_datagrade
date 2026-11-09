import { bleuMathalea } from '../../lib/colors'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { tableauDeVariation } from '../../lib/mathFonctions/etudeFonction'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { ecritureAlgebrique } from '../../lib/outils/ecritures'
import { numAlpha } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const dateDePublication = '01/10/2022'
export const titre =
  "Dresser et utiliser le tableau de signes d'une fonction affine en lien avec son sens de variation"

/**
 * @author Gilles Mora
 * Lintage typescript incomplet à cause de tableauDeVariation pas typé correctement
 * 2F21-8
 */

export const uuid = '46bec'

export const refs = {
  'fr-fr': ['2F21-8'],
  'fr-ch': [''],
}
export default class SignefonctionaffineVariation extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Types de question ',
      3,
      '1 : Donner le tableau de signes.\n2 : Utiliser le tableau de signes.\n3 : Mélange.',
    ]

    this.nbQuestions = 2 // On complète le nb de questions

    this.spacing = 1.75
    this.spacingCorr = 1.75
    this.sup = 1
  }

  nouvelleVersion() {
    let typeDeQuestionsDisponibles: string[]
    if (this.sup === 1) {
      typeDeQuestionsDisponibles = ['Signes1']
    } else if (this.sup === 2) {
      typeDeQuestionsDisponibles = ['Signes2']
    } else {
      typeDeQuestionsDisponibles = ['Signes1', 'Signes2']
    }
    const nomF = [['f'], ['g'], ['h'], ['u'], ['v'], ['w']]
    const listeTypeQuestions = combinaisonListes(
      typeDeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      // on rajoute les variables dont on a besoin
      let texte = ''
      let texteCorr = ''
      // Les questions de signes demandent aussi un tableau : conserver le corrigé entier.
      this.listeReponsesCourtes[i] = listeTypeQuestions[i] === 'Signes1' ? null : undefined
      const variables: number[] = []
      switch (listeTypeQuestions[i]) {
        case 'Signes1':
          {
            const choix = choice([0, 1])
            if (choix === 0) {
              const nom = choice(nomF)
              const a = choice([1, 2, 5, 10]) * choice([-1, 1]) // coefficient a de la fonction affine
              const b = randint(1, 15) * choice([-1, 1]) // coefficient b de la fonction affine
              const sol = -b / a

              texte = `Une fonction affine $${nom}$ définie sur $\\mathbb R$ est strictement ${a > 0 ? 'croissante' : 'décroissante'}. De plus $${nom}(${texNombre(sol, 1)})=0$.<br>
        ${numAlpha(0)} Dresser son tableau de signes sur $\\mathbb R$.<br>
        ${numAlpha(1)} Donner une fonction $${nom}$ vérifiant les conditions précédentes.`
              texteCorr = `${numAlpha(0)} $${nom}$ est une fonction affine. Elle s'écrit donc sous la forme $${nom}(x)=ax+b$. <br>
        Puisque $${nom}$ est strictement ${a > 0 ? 'croissante' : 'décroissante'} sur $\\mathbb R$, les images sont ${a > 0 ? "d'abord négatives, puis positives" : "d'abord positives, puis négatives"}.<br>
        Sachant que $${nom}$ s'annule en $${texNombre(sol, 1)}$, le changement de signe intervient donc en $x=${texNombre(sol, 1)}$. <br>
        On obtient ainsi le tableau de signes suivant : <br>
         `
              let ligne1
              if (a > 0) {
                ligne1 = ['Line', 10, '', 0, '-', 20, 'z', 20, '+']
              } else {
                ligne1 = ['Line', 10, '', 0, '+', 20, 'z', 20, '-']
              }

              texteCorr += tableauDeVariation({
                tabInit: [
                  [
                    // Première colonne du tableau avec le format [chaine d'entête, hauteur de ligne, nombre de pixels de largeur estimée du texte pour le centrage]
                    ['$x$', 1.5, 10],
                    [`$${nom}(x)$`, 2, 50],
                  ],
                  // Première ligne du tableau avec chaque antécédent suivi de son nombre de pixels de largeur estimée du texte pour le centrage
                  [
                    '$-\\infty$',
                    20,
                    `$${texNombre(sol, 1)}$`,
                    20,
                    '$+\\infty$',
                    30,
                  ],
                ],
                // tabLines ci-dessous contient les autres lignes du tableau.
                tabLines: [ligne1],
                espcl: 3.5, // taille en cm entre deux antécédents
                deltacl: 0.8, // distance entre la bordure et les premiers et derniers antécédents
                lgt: 5, // taille de la première colonne en cm
                hauteurLignes: [15, 15],
              })

              texteCorr += `<br> ${numAlpha(1)} La fonction doit vérifier les trois conditions : <br>
        $\\bullet$ être une fonction affine ; <br>
        $\\bullet$ être strictement ${a > 0 ? 'croissante' : 'décroissante'} ;<br>
        $\\bullet$ s'annuler en $${texNombre(sol, 1)}$.<br>
       Comme $${nom}$ est une fonction ${a > 0 ? 'croissante' : 'décroissante'}, on doit choisir un coefficient directeur
       $a$ ${a > 0 ? 'positif' : 'négatif'}.<br>
       Prenons ${a > 0 ? '$a=1$' : '$a=-1$'}.<br>
       $${nom}$ est alors de la forme : $${nom}(x)=${a > 0 ? '' : '-'}x + b$.<br>
       On cherche maintenant $b$ : <br>
       Comme on sait que : $${nom}(${texNombre(sol, 1)})=0$, on en déduit :
        $${nom}(${texNombre(sol, 1)})=${a > 0 ? `${texNombre(sol, 1)}` : `${texNombre(-sol, 1)}`} + b=0$.<br>
       d'où $b=${a > 0 ? `${texNombre(-sol, 1)}` : `${texNombre(sol, 1)}`}$.<br>
       On obtient la fonction $${nom}$ définie par $${miseEnEvidence(`${nom}(x)=${a > 0 ? '' : '-'}x${a > 0 ? ecritureAlgebrique(-sol) : ecritureAlgebrique(sol)}`)}$.<br>
       En partant d'une autre valeur pour $a$, on aurait obtenu une autre expression pour $${nom}$.<br>
       Il existe une infinité de fonctions qui possèdent ces trois propriétés. <br>
       Toutes les fonctions de la forme $${nom}(x)= k\\times\\left( ${a > 0 ? '' : '-'}x${a > 0 ? `${ecritureAlgebrique(-sol)}` : `${ecritureAlgebrique(sol)}`}\\right)$ avec $k$ un réel strictement positif sont solutions de l'exercice.

       `
              variables.push(a, b, sol)
            } else {
              const nom = choice(nomF)
              const a = randint(-5, 5, 0) // coefficient b de la fonction affine
              const b = a * randint(-9, 9, 0) // coefficient a de la fonction affine
              const sol = -b / a
              const x = randint(-10, 10, sol)
              const y = a * x + b

              texte = `Une fonction affine $${nom}$ définie sur $\\mathbb R$ vérifie $${nom}(${texNombre(sol, 1)})=0$ et $${nom}(${x})=${y}$.<br>
           Dresser son tableau de signes sur $\\mathbb R$. Justifier.
         `
              if (x > sol) {
                texteCorr = ` $${nom}$ est une fonction affine (non constante, puisque $${nom}(${x})\\neq ${nom}(${texNombre(sol, 1)})$), elle
          est donc soit strictement croissante, soit strictement décroissante.<br>
         On observe que $${sol}<${x}$ implique ${a > 0 ? `$${nom}(${sol}) < ${nom}(${x})$` : `$${nom}(${sol}) > ${nom}(${x})$`}.<br>
          Les images et les antécédents sont donc rangés ${a > 0 ? 'dans le même ordre' : "dans l'ordre inverse"}.<br>
          On en déduit que la fonction $${nom}$ est ${texteEnCouleurEtGras(a > 0 ? 'croissante' : 'décroissante', bleuMathalea)} sur $\\mathbb R$.<br>
          Les images sont donc ${a > 0 ? "d'abord négatives, puis positives" : "d'abord positives, puis négatives"}.<br>
          Sachant que $${nom}$ s'annule en $${texNombre(sol, 1)}$, le changement de signe intervient donc en $x=${texNombre(sol, 1)}$. <br>
          On obtient ainsi le tableau de signes suivant : <br>
           `
              } else {
                texteCorr = ` $${nom}$ est une fonction affine (non constante, puisque $${nom}(${x})\\neq ${nom}(${texNombre(sol, 1)})$), elle
           est donc soit strictement croissante, soit strictement décroissante.<br>
           On observe que $${x}<${sol}$ implique ${a > 0 ? `$${nom}(${x}) < ${nom}(${sol})$` : `$${nom}(${x}) > ${nom}(${sol})$`}.<br>
          Les images et les antécédents sont donc rangés ${a > 0 ? 'dans le même ordre' : "dans l'ordre inverse"}.<br>
          On en déduit que la fonction $${nom}$ est ${texteEnCouleurEtGras(a > 0 ? 'croissante' : 'décroissante', bleuMathalea)} sur $\\mathbb R$.<br>

           Les images sont ${a > 0 ? "d'abord négatives, puis positives" : "d'abord positives, puis négatives"}.<br>
           Sachant que $${nom}$ s'annule en $${texNombre(sol, 1)}$, le changement de signe intervient donc en $x=${texNombre(sol, 1)}$. <br>
           On obtient ainsi le tableau de signes suivant : <br>
            `
              }
              let ligne1
              if (a > 0) {
                ligne1 = ['Line', 10, '', 0, '-', 20, 'z', 20, '+']
              } else {
                ligne1 = ['Line', 10, '', 0, '+', 20, 'z', 20, '-']
              }

              texteCorr += tableauDeVariation({
                tabInit: [
                  [
                    // Première colonne du tableau avec le format [chaine d'entête, hauteur de ligne, nombre de pixels de largeur estimée du texte pour le centrage]
                    ['$x$', 1.5, 10],
                    [`$${nom}(x)$`, 2, 50],
                  ],
                  // Première ligne du tableau avec chaque antécédent suivi de son nombre de pixels de largeur estimée du texte pour le centrage
                  [
                    '$-\\infty$',
                    20,
                    `$${texNombre(sol, 1)}$`,
                    20,
                    '$+\\infty$',
                    30,
                  ],
                ],
                // tabLines ci-dessous contient les autres lignes du tableau.
                tabLines: [ligne1],
                espcl: 3.5, // taille en cm entre deux antécédents
                deltacl: 0.8, // distance entre la bordure et les premiers et derniers antécédents
                lgt: 5, // taille de la première colonne en cm
                hauteurLignes: [15, 15],
              })
              variables.push(a, b, sol)
            }
          }
          break
        case 'Signes2':
        default:
          {
            const a = randint(-5, 5, 0) // coefficient b de la fonction affine
            const b = a * randint(-6, 6, 0) // coefficient a de la fonction affine
            const sol = -b / a
            const nom = choice(nomF)
            let x1: number
            let x2: number
            if (choice([true, false])) {
              x1 = randint(sol + 1, 10)
              x2 = randint(sol + 1, 10, x1)
            } else {
              x1 = randint(-10, sol - 1)
              x2 = randint(-10, sol - 1, x1)
            }
            texte = `On donne le tableau de signes d'une fonction affine $${nom}$ définie sur $\\mathbb R$ :<br>`
            let ligne1
            if (a > 0) {
              ligne1 = ['Line', 10, '', 0, '-', 20, 'z', 20, '+']
            } else {
              ligne1 = ['Line', 10, '', 0, '+', 20, 'z', 20, '-']
            }

            texte += tableauDeVariation({
              tabInit: [
                [
                  // Première colonne du tableau avec le format [chaine d'entête, hauteur de ligne, nombre de pixels de largeur estimée du texte pour le centrage]
                  ['$x$', 1.5, 10],
                  [`$${nom}(x)$`, 2, 50],
                ],
                // Première ligne du tableau avec chaque antécédent suivi de son nombre de pixels de largeur estimée du texte pour le centrage
                [
                  '$-\\infty$',
                  20,
                  `$${texNombre(sol, 1)}$`,
                  20,
                  '$+\\infty$',
                  30,
                ],
              ],
              // tabLines ci-dessous contient les autres lignes du tableau.
              tabLines: [ligne1],
              espcl: 3.5, // taille en cm entre deux antécédents
              deltacl: 0.8, // distance entre la bordure et les premiers et derniers antécédents
              lgt: 5, // taille de la première colonne en cm
              hauteurLignes: [15, 15],
            })
            texte += `<br> ${numAlpha(0)} Donner le sens de varitions de $${nom}$ sur $\\mathbb R$.<br>
        ${numAlpha(1)} Comparer $${nom}(${x1})$ et $${nom}(${x2})$.`
            texteCorr = `${numAlpha(0)} D'après le tableau de signes, les images sont ${a > 0 ? "d'abord négatives, puis positives" : "d'abord positives, puis négatives"}.<br>
        On en déduit que la fonction $${nom}$ est ${texteEnCouleurEtGras(a > 0 ? 'strictement croissante' : 'strictement décroissante')} sur $\\mathbb R$.<br>`
            texteCorr += `${numAlpha(1)} Comme $${nom}$ est une fonction affine ${a > 0 ? 'strictement croissante' : 'strictement décroissante'},
          les antécédents et les images sont rangées ${a > 0 ? 'dans le même ordre' : "dans l'ordre inverse"}. <br>
         `
            if (x2 > x1) {
              texteCorr += ` Comme $${x1} < ${x2}$, alors $${miseEnEvidence(a > 0 ? `${nom}(${x1}) < ${nom}(${x2})` : `${nom}(${x1}) > ${nom}(${x2})`)}$.
         `
            } else {
              texteCorr += ` Comme $${x2} < ${x1}$, alors $${miseEnEvidence(a > 0 ? `${nom}(${x2}) < ${nom}(${x1})` : `${nom}(${x2}) > ${nom}(${x1})`)}$.
          `
            }
            variables.push(a, b, sol, x1, x2)
          }
          break
      }
      if (
        this.questionJamaisPosee(
          i,
          variables.map(String).join(';') + listeTypeQuestions[i],
        )
      ) {
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
