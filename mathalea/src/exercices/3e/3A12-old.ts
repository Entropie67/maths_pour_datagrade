// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid ce352 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import {
  choice,
  combinaisonListesSansChangerOrdre,
} from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { ajouterAide } from '../../lib/outils/enrichissements'
import { numAlpha } from '../../lib/outils/outilString'
import {
  decompositionFacteursPremiers,
  pgcd,
  ppcm,
} from '../../lib/outils/primalite'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const titre = "Résoudre un exercice d'engrenages"
export const dateDeModifImportante = '01/04/2023'
/**
 * ppcmEngrenages
 * les deux on besoin de la def partielle serie : stlX
 * @author Sébastien Lozano
 */
export const uuid = 'ce352'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class PpcmEngrenagesOld extends Exercice {
  constructor() {
    super()

    this.spacing = 2
    this.spacingCorr = context.isHtml ? 2 : 1
    this.nbQuestionsModifiable = false
    this.nbQuestions = 4

    this.sup = false
  }

  nouvelleVersion() {
    let typesDeQuestions
    const typesDeQuestionsDisponibles = [1, 2, 3]
    const listeTypeDeQuestions = combinaisonListesSansChangerOrdre(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    /*
    const txtIntro = 'Boîte de vitesse, transmission de vélo, de moto, perceuse électrique, tout cela fonctionne avec des engrenages ! Mais au fait, comment ça fonctionne, les engrenages ?'
    if (context.isHtml) {
      const numEx = '3A12' // pour rendre unique les id des SVG, en cas d'utilisation dans plusieurs exercices y faisant appel
      const idUnique = `${numEx}_${Date.now()}`
      const idDivIntro = `divIntro${idUnique}`
      // On ajoute un customElement au registre via la fonction svgEngrenages()
      svgEngrenages()
      txtIntro += `<svg-engrenage id="${idDivIntro}"></svg-engrenage>`
    } else {
      txtIntro += '\\\\ \\textit{Attention, les roues ci-dessous ne comportent pas le nombre de dents de l\'énoncé !} \\\\ \\Engrenages[Couleur=white,Unite=1mm]{1/24,1/9}'
    }

    this.introduction = lampeMessage({
      titre: 'Arithmétique des engrenages',
      texte: txtIntro,
      couleur: 'nombres'
    })
    */

    for (
      let i = 0, texte, texteCorr, k, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      texte = ''
      texteCorr = ''
      typesDeQuestions = listeTypeDeQuestions[i]

      let nbDentsr1 = 0
      let nbDentsr2 = 0
      let txtPopup = `Soient deux nombres entiers a et b, lorsque le plus petit multiple commun à $a$ et $b$ vaut $a \\times b$ ${context.isHtml ? '' : '\\\\'}( $ppcm(a,b)=a\\times b$ ), on dit que `
      if (context.isHtml) {
        txtPopup += '<b>les nombres a et b sont premiers entre eux.</b>'
      } else {
        txtPopup += '$\\textbf{les nombres a et b sont premiers entre eux}$.'
      }
      let txtPopupBis = `Soient deux nombres entiers a et b, lorsque le plus grang diviseur commun à $a$ et $b$ vaut $1$ ${context.isHtml ? '' : '\\\\'} ( $pgcd(a,b)=1$ ), on dit que `
      if (context.isHtml) {
        txtPopupBis += '<b>les nombres a et b sont premiers entre eux.</b>'
      } else {
        txtPopupBis += '$\\textbf{les nombres a et b sont premiers entre eux}$.'
      }
      let txtPopupTer =
        "Soient deux nombres entiers a et b, lorsque $a$ et $b$ n'ont pas d'autre diviseur commun que $1$, on dit que "
      if (context.isHtml) {
        txtPopupTer += '<b>les nombres a et b sont premiers entre eux.</b>'
      } else {
        txtPopupTer += '$\\textbf{les nombres a et b sont premiers entre eux}$.'
      }

      switch (typesDeQuestions) {
        case 1:
          {
            // avec de petits nombres on calcule les mutliples
            nbDentsr1 = randint(5, 30)
            nbDentsr2 = randint(5, 30, nbDentsr1)
            texte += `La roue n$^\\circ$1 possède $${nbDentsr1}$ dents et la roue n$^\\circ$2 a $${nbDentsr2}$ dents.`
            texte +=
              '<br>' +
              numAlpha(0) +
              ` Écrire la liste des multiples de $${nbDentsr1}$ et de $${nbDentsr2}$ jusqu'à trouver un multiple commun.`
            if (ppcm(nbDentsr1, nbDentsr2) === nbDentsr1 * nbDentsr2) {
              texte += `<br>Justifier que ${nbDentsr1} et ${nbDentsr2} sont des `
              texte += ajouterAide(
                `${context.isHtml ? '<br>' : '\\\\'} ${txtPopup}`,
                {
                  texteAvant: 'nombres premiers entre eux',
                  titreAide:
                    'Définition à partir du plus petit multiple commun',
                },
              )
            }
            texte += '.'
            texte +=
              '<br>' +
              numAlpha(1) +
              ' En déduire le nombre de tours de chaque roue avant le retour à leur position initiale.'
            texteCorr =
              numAlpha(0) +
              ` Liste des premiers multiples de $${nbDentsr1}$ : <br>`
            // on va faire en sorte de toujours avoir un nombre de multiples multiple de 5
            let nbMarge = 5 - ((ppcm(nbDentsr1, nbDentsr2) / nbDentsr1) % 5)
            let kMax = ppcm(nbDentsr1, nbDentsr2) / nbDentsr1 + nbMarge
            for (let k = 1; k < kMax + 1; k++) {
              texteCorr += `$${k}\\times${nbDentsr1} = `
              if (k === ppcm(nbDentsr1, nbDentsr2) / nbDentsr1) {
                texteCorr += miseEnEvidence(texNombre(k * nbDentsr1))
                texteCorr += '$ ; '
              } else {
                texteCorr += `${texNombre(k * nbDentsr1)}$ ; `
              }
              if (k % 5 === 0) {
                texteCorr += '<br>'
              }
            }
            texteCorr += '$\\ldots$ '
            texteCorr += '<br>'
            texteCorr += ` Liste des premiers multiples de $${nbDentsr2}$ : <br>`
            // on va faire en sorte de toujours avoir un nombre de multiples multiple de 5
            nbMarge = 5 - ((ppcm(nbDentsr1, nbDentsr2) / nbDentsr2) % 5)
            kMax = ppcm(nbDentsr1, nbDentsr2) / nbDentsr2 + nbMarge
            for (let k = 1; k < kMax + 1; k++) {
              texteCorr += `$${k}\\times${nbDentsr2} = `
              if (k === ppcm(nbDentsr1, nbDentsr2) / nbDentsr2) {
                texteCorr += miseEnEvidence(texNombre(k * nbDentsr2))
                texteCorr += '$ ; '
              } else {
                texteCorr += `${texNombre(k * nbDentsr2)}$ ; `
              }
              if (k % 5 === 0) {
                texteCorr += '<br>'
              }
            }
            texteCorr += '$\\ldots$ '
            texteCorr += '<br>'
            if (ppcm(nbDentsr1, nbDentsr2) === nbDentsr1 * nbDentsr2) {
              texteCorr +=
                '$ppcm(' +
                nbDentsr1 +
                ';' +
                nbDentsr2 +
                ')=' +
                nbDentsr1 +
                '\\times' +
                nbDentsr2 +
                `$ donc $${nbDentsr1}$ et $${nbDentsr2}$ sont des `
              texteCorr += ajouterAide(
                `${context.isHtml ? '<br>' : '\\\\'} ${txtPopup}`,
                {
                  texteAvant: 'nombres premiers entre eux',
                  titreAide:
                    'Définition à partir du plus petit multiple commun',
                },
              )
            }
            texteCorr += '.'
            texteCorr += '<br>'
            texteCorr +=
              numAlpha(1) +
              ` Le plus petit multiple commun à $${nbDentsr1}$ et $${nbDentsr2}$ vaut donc $${ppcm(nbDentsr1, nbDentsr2)}$.<br>
            Il suffit donc que chaque roue tourne de $${ppcm(nbDentsr1, nbDentsr2)}$ dents pour faire un nombre entier de tours et ainsi revenir dans sa position initiale.<br>
            En effet, chaque roue doit tourner de façon à ce que le nombre total de dents utilisé soit un multiple de son nombre
            de dents soit au minimum de $${texNombre(ppcm(nbDentsr1, nbDentsr2))}$ dents.`
            texteCorr += `<br> Cela correspond à $(${ppcm(nbDentsr1, nbDentsr2)}\\text{ dents})\\div (${nbDentsr1}\\text{ dents/tour}) = ${ppcm(nbDentsr1, nbDentsr2) / nbDentsr1}$`
            if (ppcm(nbDentsr1, nbDentsr2) / nbDentsr1 === 1) {
              texteCorr += ' tour '
            } else {
              texteCorr += ' tours '
            }
            texteCorr += 'pour la roue n$^\\circ$1.'
            texteCorr += `<br>Cela correspond à $(${ppcm(nbDentsr1, nbDentsr2)}\\text{ dents})\\div (${nbDentsr2}\\text{ dents/tour}) = ${ppcm(nbDentsr1, nbDentsr2) / nbDentsr2}$`
            if (ppcm(nbDentsr1, nbDentsr2) / nbDentsr2 === 1) {
              texteCorr += ' tour '
            } else {
              texteCorr += ' tours '
            }
            texteCorr += 'pour la roue n$^\\circ$2.'
          }
          break
        case 2: // avec de plus grands nombre, c'est mieux de décomposer en facteurs premiers
          if (this.sup) {
            nbDentsr1 = randint(51, 100)
            nbDentsr2 = randint(51, 100, nbDentsr1)
            while (nbDentsr2 % nbDentsr1 === 0 || nbDentsr1 % nbDentsr2 === 0) {
              nbDentsr2 = randint(51, 100, nbDentsr1)
            }
          } else {
            nbDentsr1 = randint(31, 80)
            nbDentsr2 = randint(31, 80, nbDentsr1)
            while (nbDentsr2 % nbDentsr1 === 0 || nbDentsr1 % nbDentsr2 === 0) {
              nbDentsr2 = randint(51, 100, nbDentsr1)
            }
          }

          texte += `La roue n$^\\circ$1 possède $${nbDentsr1}$ dents et la roue n$^\\circ$2 a $${nbDentsr2}$ dents.`
          texte +=
            '<br>' +
            numAlpha(0) +
            ` Décomposer $${nbDentsr1}$ et $${nbDentsr2}$ en produit de facteurs premiers.`
          if (ppcm(nbDentsr1, nbDentsr2) === nbDentsr1 * nbDentsr2) {
            texte += `<br>Justifier que ${nbDentsr1} et ${nbDentsr2} sont des `
            texte += ajouterAide(
              `<br>- ${txtPopup} ${context.isHtml ? '<br>- ' : '\\\\- '} ${txtPopupBis} ${context.isHtml ? '<br>- ' : '\\\\- '} ${txtPopupTer}`,
              {
                texteAvant: 'nombres premiers entre eux',
                titreAide: 'Trois définitions équivalentes au choix',
              },
            )
          }
          texte += '.'
          texte +=
            '<br>' +
            numAlpha(1) +
            ' En déduire le nombre de tours de chaque roue avant le retour à leur position initiale.'
          texteCorr =
            "Pour un nombre de dents plus élevé, il est plus commode d'utiliser les décompositions en produit de facteurs premiers."
          texteCorr +=
            '<br>' +
            numAlpha(0) +
            ` Décomposition de $${nbDentsr1}$ en produit de facteurs premiers :  $${nbDentsr1} = ${decompositionFacteursPremiers(nbDentsr1)}$.`
          texteCorr += `<br> Décomposition de $${nbDentsr2}$ en produit de facteurs premiers :  $${nbDentsr2} = ${decompositionFacteursPremiers(nbDentsr2)}$.`
          texteCorr += '<br>'
          if (ppcm(nbDentsr1, nbDentsr2) === nbDentsr1 * nbDentsr2) {
            texteCorr +=
              'Proposition de trois corrections valables pour la déduction : <br>'
            texteCorr += 'Proposition de correction 1 : <br>'

            texteCorr += `D'après les calculs précédents, $ppcm(${nbDentsr1},${nbDentsr2})= ${decompositionFacteursPremiers(ppcm(nbDentsr1, nbDentsr2))}$.<br>`

            texteCorr += `Donc $${nbDentsr1}$ et $${nbDentsr2}$ sont des `
            texteCorr += ajouterAide(
              `${context.isHtml ? '<br>' : '\\\\'} ${txtPopup}`,
              {
                texteAvant: 'nombres premiers entre eux',
                titreAide: 'Définition à partir du plus petit multiple commun',
              },
            )
          }
          texteCorr += '.'
          if (pgcd(nbDentsr1, nbDentsr2) === 1) {
            texteCorr += '<br>Proposition de correction 2 : <br>'

            texteCorr += `D'après les calculs précédents, $pgcd(${nbDentsr1},${nbDentsr2})= ${pgcd(nbDentsr1, nbDentsr2) === 1 ? 1 : ''} ${decompositionFacteursPremiers(pgcd(nbDentsr1, nbDentsr2))}$.<br>`
            texteCorr += `Donc $${nbDentsr1}$ et $${nbDentsr2}$ sont des `
            texteCorr += ajouterAide(
              `${context.isHtml ? '<br>' : '\\\\'} ${txtPopupBis}`,
              {
                texteAvant: 'nombres premiers entre eux',
                titreAide: 'Définition à partir du plus grand diviseur commun',
              },
            )
          }
          texteCorr += '.'
          if (pgcd(nbDentsr1, nbDentsr2) === 1) {
            texteCorr += '<br>Proposition de correction 3 : <br>'

            texteCorr += `D'après les calculs précédents, le seul diviseur commun à $${nbDentsr1}$ et $${nbDentsr2}$ vaut $1$.<br> `
            texteCorr += `Donc $${nbDentsr1}$ et $${nbDentsr2}$ sont des `
            texteCorr += ajouterAide(
              `${context.isHtml ? '<br>' : '\\\\'} ${txtPopupTer}`,
              {
                texteAvant: 'nombres premiers entre eux',
                titreAide:
                  "Définition à partir de l'intersection des diviseurs communs",
              },
            )
          }
          texteCorr += '.'
          texteCorr += '<br>'
          texteCorr +=
            numAlpha(1) +
            ` Pour retrouver la position initiale,
          chaque roue doit tourner de façon à ce que le nombre total de dents utilisé soit un multiple de son nombre
          de dents.<br>
          Soit, grâce aux décompositions précédentes, au minimum de $${decompositionFacteursPremiers(ppcm(nbDentsr1, nbDentsr2))} = ${ppcm(nbDentsr1, nbDentsr2)}$ dents.`
          texteCorr += `<br> Cela correspond à $(${texNombre(ppcm(nbDentsr1, nbDentsr2))}\\text{ dents})\\div (${nbDentsr1}\\text{ dents/tour}) = ${ppcm(nbDentsr1, nbDentsr2) / nbDentsr1}$`
          if (ppcm(nbDentsr1, nbDentsr2) / nbDentsr1 === 1) {
            texteCorr += ' tour '
          } else {
            texteCorr += ' tours '
          }
          texteCorr += 'pour la roue n$^\\circ$1.'
          texteCorr += `<br> Cela correspond à $(${texNombre(ppcm(nbDentsr1, nbDentsr2))}\\text{ dents})\\div (${nbDentsr2}\\text{ dents/tour}) = ${ppcm(nbDentsr1, nbDentsr2) / nbDentsr2}$`
          if (ppcm(nbDentsr1, nbDentsr2) / nbDentsr2 === 1) {
            texteCorr += ' tour '
          } else {
            texteCorr += ' tours '
          }
          texteCorr += 'pour la roue n$^\\circ$2.'
          break
        case 3: // déterminer le nombre de dents d'une roue connaissant l'autre et le nombre de tours nécessaires à la re-synchro
          if (this.sup) k = choice([2, 3, 4, 5, 6])
          else k = choice([2, 3])
          nbDentsr1 = randint(5, 15)
          nbDentsr2 = randint(5, 80, nbDentsr1)
          nbDentsr1 *= k
          nbDentsr2 *= k
          texte += `La roue n$^\\circ$2 a maintenant $${nbDentsr2}$ dents.`
          texte += ` Déterminer le nombre de dents de la roue n$^\\circ$1 qui ferait $${ppcm(nbDentsr1, nbDentsr2) / nbDentsr1}$ `
          if (ppcm(nbDentsr1, nbDentsr2) / nbDentsr1 === 1) {
            texte += ' tour '
          } else {
            texte += ' tours '
          }
          texte += ` pendant que la roue n$^\\circ$2 en fait $${ppcm(nbDentsr1, nbDentsr2) / nbDentsr2}$.`
          texteCorr = `Puisque la roue n$^\\circ$2, qui a $${nbDentsr2}$ dents, fait $${ppcm(nbDentsr1, nbDentsr2) / nbDentsr2}$ `
          if (ppcm(nbDentsr1, nbDentsr2) / nbDentsr2 === 1) {
            texteCorr += ' tour '
          } else {
            texteCorr += ' tours '
          }
          texteCorr += `, cela représente $${texNombre(ppcm(nbDentsr1, nbDentsr2))}$ dents.`
          texteCorr += `<br>La roue n$^\\circ$1 doit donc aussi tourner de $${texNombre(ppcm(nbDentsr1, nbDentsr2))}$ dents, ceci en $${ppcm(nbDentsr1, nbDentsr2) / nbDentsr1}$ `
          if (ppcm(nbDentsr1, nbDentsr2) / nbDentsr1 === 1) {
            texteCorr += ' tour '
          } else {
            texteCorr += ' tours '
          }
          texteCorr += '.'
          texteCorr += `<br> On obtient donc $(${texNombre(ppcm(nbDentsr1, nbDentsr2))}\\text{ dents})\\div (${ppcm(nbDentsr1, nbDentsr2) / nbDentsr1}\\text{`
          if (ppcm(nbDentsr1, nbDentsr2) / nbDentsr1 === 1) {
            texteCorr += ' tour '
          } else {
            texteCorr += ' tours '
          }
          texteCorr += `}) = ${nbDentsr1} \\text{ dents/tour}.$`
          texteCorr += `<br>La roue n$^\\circ$1 a donc $${nbDentsr1}$ dents.`
          break
      }

      if (this.questionJamaisPosee(i, nbDentsr1, nbDentsr2)) {
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
