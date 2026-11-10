import { texteGras } from '../../lib/format/style'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  texteEnCouleurEtGras,
  miseEnEvidence,
} from '../../lib/outils/embellissements'
import { sommeDesChiffres } from '../../lib/outils/nombres'
import { numAlpha, sp } from '../../lib/outils/outilString'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

import { KeyboardType } from '../../lib/interactif/claviers/keyboard'

export const titre =
  "Trouver un chiffre pour qu'un nombre soit divisible par un autre"
export const interactifReady = true

export const dateDePublication = '29/08/2022'
export const dateDeModifImportante = '30/09/2024'
/**
 *
 * Attendus de 3e : Connaitre et utiliser les critères de divisibilité par 2, par 3, par 5, par 9 et par 10
 * @author Éric Elter
 */

export const refs = {
  'fr-fr': ['3A10-6'],
  'fr-ch': ['9R1NO1C-8', '9R2NO1C-8', '9R3NO1C-8', 'PRQNO08A-3', 'PRQNO08B-2'],
}
export const uuid = '5636e'
export default class TrouverChiffre extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 4
    this.besoinFormulaireTexte = [
      'Nombre de chiffres dans le nombre à découvrir ',
      'Nombres séparés par des tirets :\n2 : 2 chiffres\n3 : 3 chiffres\n4 : 4 chiffres\n5 : 5 chiffres\n6 : 6 chiffres\n7 : Mélange',
    ]
    this.besoinFormulaire2Texte = [
      'Critère choisi de divisibilité',
      'Nombres séparés par des tirets \n1 : par 2\n2 : par 3\n3 : par 5\n4 : par 9\n5 : par 2 et par 3\n6 : par 2 et par 5\n7 : par 6\n8 : par 10\n9 : Mélange',
    ]
    this.besoinFormulaire3Numerique = [
      'Choix du symbole remplaçant le chiffre manquant',
      4,
      '1 : ?\n2 : _\n3 : ...\n4 : X',
    ]
    this.besoinFormulaire4CaseACocher = [
      'Le chiffre des unités est le seul chiffre caché',
      false,
    ]
    this.besoinFormulaire5CaseACocher = ['Une seule réponse demandée', false]

    this.sup = 7
    this.sup2 = 9
    this.sup3 = 1
  }

  nouvelleVersion() {
    const symboleChiffreCacheTab = ['?', '_', '...', 'X']
    const symboleChiffreCache = symboleChiffreCacheTab[this.sup3 - 1]
    this.consigne = this.interactif
      ? "Dans le champ de réponses, indiquer toutes les réponses possibles, séparées par des points-virgules. Si aucun chiffre n'est possible, saisir le symbole $\\emptyset$."
      : 'Dans cet exercice, une ou plusieurs réponses sont possibles tout comme aucune. ' +
        (!this.sup5
          ? 'On attend toutes les réponses possibles.'
          : "On n'attend qu'une seule réponse possible.")

    // CHOIX DU NOMBRE DE CHIFFRES COMPOSANT LE NOMBRE
    const nombreDeChiffres = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 2,
      max: 6,
      melange: 7,
      defaut: 7,
      nbQuestions: this.nbQuestions,
    }).map(Number)

    // CHOIX DU CRITERE DE DIVISIBILITE
    const choixDiviseurs = [
      '',
      'par $2$',
      'par $3$',
      'par $5$',
      'par $9$',
      'par $2$ et par $3$',
      'par $2$ et par $5$',
      'par $6$',
      'par $10$',
    ]
    const casChoixDiviseurs = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: 8,
      melange: 9,
      defaut: 9,
      nbQuestions: Math.max(this.nbQuestions, 8),
      shuffle: true,
    }).map(Number)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte =
        'Dans le nombre suivant à $' + nombreDeChiffres[i] + '$ chiffres '
      const positionX =
        this.sup4 || this.sup === 1
          ? nombreDeChiffres[i] - 1
          : randint(1, nombreDeChiffres[i] - 1)
      let reponse: string | string[]
      // CONSTRUCTION DU NOMBRE AVEC LE CHIFFRE CACHE
      let nb = randint(1, 9)
      const a = [nb] // a contient un tableau des chiffres du nombre
      const tabChiffresX: string[] = [String(nb)]
      let ajoutPourTroisouNeuf: number[] = []
      let sommePourTroisouNeuf: number
      for (let ee = 1; ee < nombreDeChiffres[i]; ee++) {
        if (positionX !== ee) {
          nb = randint(0, 9)
          a.push(nb)
          tabChiffresX.push((ee === nombreDeChiffres[i] - 3 ? sp(2) : '') + nb)
        } else
          tabChiffresX.push(
            (ee === nombreDeChiffres[i] - 3 ? sp(2) : '') + symboleChiffreCache,
          )
      }
      const nbAvecChiffreCache = tabChiffresX.join('') // C'est le nombre avec la gestion des espaces et du symbole pour cacher le chiffre

      // En mode math, « _ » ouvre un indice et « ... » s'espace mal
      const nbMath = nbAvecChiffreCache
        .replaceAll(sp(2), '\\,')
        .replace('_', '\\_')
        .replace('...', '\\ldots')
      texte += sp(2) + `$${nbMath}$` + sp(2)
      texte += `, il manque un chiffre (à l'emplacement de ${symboleChiffreCache}). <br>`
      let texteCorr = `Quel chiffre peut-on mettre dans ${sp(2)} $${nbMath}$ ${sp(2)} pour qu'il soit divisible ${choixDiviseurs[casChoixDiviseurs[i]]}${sp()}?`
      texte += texteCorr
      texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierEnsemble)

      // CORRECTION (beaucoup plus longue que l'énoncé)
      switch (casChoixDiviseurs[i]) {
        case 1: // Divisible par 2
          texteCorr += '<br>Un entier divisible par $2$ est pair donc ici, '
          switch (positionX) {
            case nombreDeChiffres[i] - 1: // Le chiffre inconnu est le chiffre des unités
              texteCorr += texteEnCouleurEtGras('tout chiffre pair suffit.<br>')
              texteCorr += `$${nbAvecChiffreCache.replace(symboleChiffreCache, '0')}$, $${nbAvecChiffreCache.replace(symboleChiffreCache, '2')}$, $${nbAvecChiffreCache.replace(symboleChiffreCache, '4')}$, $${nbAvecChiffreCache.replace(symboleChiffreCache, '6')}$ et $${nbAvecChiffreCache.replace(symboleChiffreCache, '8')}$ sont divisibles par $2$.`
              /* Cette méthode fonctionne mais par pour un autre cas, donc c'est tout ou rien
                            reponse = diversesReponsesPossibles([0, 2, 4, 6, 8])
                            for (let k = 0; k < reponse.length; k++) {
                              reponse[k] = reponse[k].join(';')
                            }
                            */
              reponse = '0;2;4;6;8'
              break
            default: // Le chiffre inconnu n'est pas le chiffre des unités
              if (a[nombreDeChiffres[i] - 2] % 2 === 0) {
                // Le chiffre des unités est pair
                texteCorr +=
                  texteEnCouleurEtGras('tout chiffre convient') +
                  ' car le nombre est déjà pair.<br>'
                for (let ee = 0; ee < 8; ee++) {
                  texteCorr += `$${nbAvecChiffreCache.replace(symboleChiffreCache, String(ee))}$, `
                }
                texteCorr += `$${nbAvecChiffreCache.replace(symboleChiffreCache, '8')}$ et $${nbAvecChiffreCache.replace(symboleChiffreCache, '9')}$ sont divisibles par $2$.`
                /* Cette méthode ne fonctionne pas car le tableau des diverses réponses possibles est trop grand et ralentit le fonctionnement de l'exercice
                                reponse = diversesReponsesPossibles(rangeMinMax(0, 9))
                                for (let k = 0; k < reponse.length; k++) {
                                  reponse[k] = reponse[k].join(';')
                                }
                                */
                reponse = '0;1;2;3;4;5;6;7;8;9'
              } else {
                // Le chiffre des unités est impair
                texteCorr +=
                  texteEnCouleurEtGras('aucun chiffre convient') +
                  ' car le nombre ne peut pas être pair.<br>'
                for (let ee = 0; ee < 8; ee++) {
                  texteCorr += `$${nbAvecChiffreCache.replace(symboleChiffreCache, String(ee))}$, `
                }
                texteCorr += `$${nbAvecChiffreCache.replace(symboleChiffreCache, '8')}$ et $${nbAvecChiffreCache.replace(symboleChiffreCache, '9')}$ ne sont pas divisibles par $2$.`
                reponse = '\\emptyset'
              }
              break
          }
          break
        case 2: // Divisible par 3
          ajoutPourTroisouNeuf = []
          sommePourTroisouNeuf = sommeDesChiffres(a)[0]
          ajoutPourTroisouNeuf[0] =
            sommePourTroisouNeuf % 3 === 0 ? 0 : 3 - (sommePourTroisouNeuf % 3)
          for (let ee = 1; ee < (ajoutPourTroisouNeuf[0] === 0 ? 4 : 3); ee++) {
            ajoutPourTroisouNeuf.push(3 + ajoutPourTroisouNeuf[ee - 1])
          }
          reponse = ajoutPourTroisouNeuf.join(';')
          texteCorr +=
            '<br>Il suffit de savoir quel nombre à un chiffre il faut ajouter à '
          texteCorr += `$${nombreDeChiffres[i] !== 2 ? sommeDesChiffres(a)[1] + '=' : ''}${sommePourTroisouNeuf}$`
          texteCorr += ' pour obtenir un multiple de $3$.<br>Or seuls '
          for (let ee = 0; ee < ajoutPourTroisouNeuf.length - 2; ee++) {
            texteCorr +=
              `$${sommePourTroisouNeuf}+${ajoutPourTroisouNeuf[ee]}=${sommePourTroisouNeuf + ajoutPourTroisouNeuf[ee]}$` +
              ', '
          }
          texteCorr +=
            `$${sommePourTroisouNeuf}+${ajoutPourTroisouNeuf[ajoutPourTroisouNeuf.length - 2]}=${sommePourTroisouNeuf + ajoutPourTroisouNeuf[ajoutPourTroisouNeuf.length - 2]}$` +
            ' et '
          texteCorr += `$${sommePourTroisouNeuf}+${ajoutPourTroisouNeuf[ajoutPourTroisouNeuf.length - 1]}=${sommePourTroisouNeuf + ajoutPourTroisouNeuf[ajoutPourTroisouNeuf.length - 1]}$`
          texteCorr +=
            ` sont divisibles par $3$ donc ici, les chiffres qui conviennent sont${sp()}: `
          for (let ee = 0; ee < ajoutPourTroisouNeuf.length - 2; ee++) {
            texteCorr +=
              '$' + miseEnEvidence(ajoutPourTroisouNeuf[ee]) + '$' + ', '
          }
          texteCorr +=
            texteEnCouleurEtGras(
              `$\\mathbf{${ajoutPourTroisouNeuf[ajoutPourTroisouNeuf.length - 2]}}$`,
            ) + ' et '
          texteCorr +=
            texteEnCouleurEtGras(
              `$\\mathbf{${ajoutPourTroisouNeuf[ajoutPourTroisouNeuf.length - 1]}}$`,
            ) + '.<br>'
          for (let ee = 0; ee < ajoutPourTroisouNeuf.length - 2; ee++) {
            texteCorr += `$${nbAvecChiffreCache.replace(symboleChiffreCache, String(ajoutPourTroisouNeuf[ee]))}$, `
          }
          texteCorr += `$${nbAvecChiffreCache.replace(symboleChiffreCache, String(ajoutPourTroisouNeuf[ajoutPourTroisouNeuf.length - 2]))}$ et $${nbAvecChiffreCache.replace(symboleChiffreCache, String(ajoutPourTroisouNeuf[ajoutPourTroisouNeuf.length - 1]))}$ sont divisibles par $3$.`
          break
        case 3: // Divisible par 5
          texteCorr +=
            '<br>Un entier divisible par $5$ a son chiffre des unités égal à $0$ ou $5$ donc ici, '
          switch (positionX) {
            case nombreDeChiffres[i] - 1: // Le chiffre caché est le chiffre des unités
              texteCorr += texteEnCouleurEtGras(
                'les chiffres $0$ et $5$ suffisent.<br>',
              )
              texteCorr += `$${nbAvecChiffreCache.replace(symboleChiffreCache, '0')}$ et $${nbAvecChiffreCache.replace(symboleChiffreCache, '5')}$ sont divisibles par $5$.`
              reponse = '0;5'
              break
            default: // Le chiffre caché n'est pas le chiffre des unités
              if (a[nombreDeChiffres[i] - 2] % 5 === 0) {
                // Le chiffre des unités est 0 ou 5
                reponse = '0;1;2;3;4;5;6;7;8;9'
                texteCorr +=
                  texteEnCouleurEtGras('tout chiffre convient') +
                  ' car le chiffre des unités est déjà égal à $0$ ou $5$.<br>'
                for (let ee = 0; ee < 8; ee++) {
                  texteCorr += `$${nbAvecChiffreCache.replace(symboleChiffreCache, String(ee))}$, `
                }
                texteCorr += `$${nbAvecChiffreCache.replace(symboleChiffreCache, '8')}$ et $${nbAvecChiffreCache.replace(symboleChiffreCache, '9')}$ sont divisibles par $5$.`
              } else {
                // Le chiffre des unités n'est pas 0 ou 5
                reponse = '\\emptyset'
                texteCorr +=
                  texteEnCouleurEtGras('aucun chiffre convient') +
                  " car le chiffre des unités n'est déjà pas égal à $0$ ou $5$.<br>"
                for (let ee = 0; ee < 8; ee++) {
                  texteCorr += `$${nbAvecChiffreCache.replace(symboleChiffreCache, String(ee))}$, `
                }
                texteCorr += `$${nbAvecChiffreCache.replace(symboleChiffreCache, '8')}$ et $${nbAvecChiffreCache.replace(symboleChiffreCache, '9')}$ ne sont pas divisibles par $5$.`
              }
              break
          }
          break
        case 4: // Divisible par 9
          sommePourTroisouNeuf = sommeDesChiffres(a)[0]
          ajoutPourTroisouNeuf =
            sommePourTroisouNeuf % 9 === 0
              ? [0, 9]
              : [9 - (sommePourTroisouNeuf % 9)]
          reponse = ajoutPourTroisouNeuf.join(';')

          texteCorr +=
            '<br>Il suffit de savoir quel nombre à un chiffre il faut ajouter à '
          texteCorr += `$${nombreDeChiffres[i] !== 2 ? sommeDesChiffres(a)[1] + '=' : ''}${sommePourTroisouNeuf}$`
          texteCorr += ' pour obtenir un multiple de $9$.<br>Or '
          texteCorr += ajoutPourTroisouNeuf.length === 2 ? 'seuls ' : 'seul '
          texteCorr += `$${sommePourTroisouNeuf}+${ajoutPourTroisouNeuf[0]}=${sommePourTroisouNeuf + ajoutPourTroisouNeuf[0]}$`
          texteCorr +=
            ajoutPourTroisouNeuf.length === 2
              ? ' et ' +
                `$${sommePourTroisouNeuf}+${ajoutPourTroisouNeuf[1]}=${sommePourTroisouNeuf + ajoutPourTroisouNeuf[1]}$` +
                ' sont divisibles '
              : ' est divisible '
          texteCorr += 'par $9$ donc ici, '
          texteCorr +=
            ajoutPourTroisouNeuf.length === 2
              ? `les chiffres qui conviennent sont${sp()}: ${texteEnCouleurEtGras('$\\mathbf{0}$')} et ${texteEnCouleurEtGras('$\\mathbf{9}$')}.<br>$${nbAvecChiffreCache.replace(symboleChiffreCache, String(ajoutPourTroisouNeuf[0]))}$ et $${nbAvecChiffreCache.replace(symboleChiffreCache, String(ajoutPourTroisouNeuf[1]))}$ sont divisibles par $9$.`
              : `le chiffre qui convient est${sp()}: $${miseEnEvidence(ajoutPourTroisouNeuf[0])}$.<br>$${nbAvecChiffreCache.replace(symboleChiffreCache, String(ajoutPourTroisouNeuf[0]))}$ est divisible par $9$.`
          break
        case 5: // Divisible par 2 et par 3
          switch (positionX) {
            case nombreDeChiffres[i] - 1: // Le chiffre inconnu est le chiffre des unités
              texteCorr += `<br>${numAlpha(0)}Un entier divisible par $2$ est pair donc ici, `
              texteCorr += texteEnCouleurEtGras(
                'tout chiffre pair suffit pour que le nombre soit divisible par $2$.<br>',
              )
              ajoutPourTroisouNeuf = []
              reponse = []
              sommePourTroisouNeuf = sommeDesChiffres(a)[0]
              ajoutPourTroisouNeuf[0] =
                sommePourTroisouNeuf % 3 === 0
                  ? 0
                  : 3 - (sommePourTroisouNeuf % 3)
              if (ajoutPourTroisouNeuf[0] % 2 === 0)
                reponse.push(String(ajoutPourTroisouNeuf[0]))
              for (
                let ee = 1;
                ee < (ajoutPourTroisouNeuf[0] === 0 ? 4 : 3);
                ee++
              ) {
                ajoutPourTroisouNeuf.push(3 + ajoutPourTroisouNeuf[ee - 1])
                if (ajoutPourTroisouNeuf[ee] % 2 === 0)
                  reponse.push(String(ajoutPourTroisouNeuf[ee]))
              }
              texteCorr += `<br>${numAlpha(1)}Pour savoir si le nombre est divisible par $3$, il suffit de savoir quel nombre à un chiffre, il faut ajouter à `
              texteCorr += `$${nombreDeChiffres[i] !== 2 ? sommeDesChiffres(a)[1] + '=' : ''}${sommePourTroisouNeuf}$`
              texteCorr += ' pour obtenir un multiple de $3$.<br>Or seuls '
              for (let ee = 0; ee < ajoutPourTroisouNeuf.length - 2; ee++) {
                texteCorr +=
                  `$${sommePourTroisouNeuf}+${ajoutPourTroisouNeuf[ee]}=${sommePourTroisouNeuf + ajoutPourTroisouNeuf[ee]}$` +
                  ', '
              }
              texteCorr +=
                `$${sommePourTroisouNeuf}+${ajoutPourTroisouNeuf[ajoutPourTroisouNeuf.length - 2]}=${sommePourTroisouNeuf + ajoutPourTroisouNeuf[ajoutPourTroisouNeuf.length - 2]}$` +
                ' et '
              texteCorr += `$${sommePourTroisouNeuf}+${ajoutPourTroisouNeuf[ajoutPourTroisouNeuf.length - 1]}=${sommePourTroisouNeuf + ajoutPourTroisouNeuf[ajoutPourTroisouNeuf.length - 1]}$`
              texteCorr +=
                ' sont divisibles par $3$ donc ici, les chiffres qui conviennent sont '
              for (let ee = 0; ee < ajoutPourTroisouNeuf.length - 2; ee++) {
                texteCorr +=
                  '$' + miseEnEvidence(ajoutPourTroisouNeuf[ee]) + '$' + ', '
              }
              texteCorr +=
                texteEnCouleurEtGras(
                  `$\\mathbf{${ajoutPourTroisouNeuf[ajoutPourTroisouNeuf.length - 2]}}$`,
                ) + ' et '
              texteCorr +=
                texteEnCouleurEtGras(
                  `$\\mathbf{${ajoutPourTroisouNeuf[ajoutPourTroisouNeuf.length - 1]}}$`,
                ) + ' '
              texteCorr += texteEnCouleurEtGras(
                'pour que le nombre soit divisible par $3$.<br>',
              )
              ajoutPourTroisouNeuf = ajoutPourTroisouNeuf.filter((nb) =>
                [0, 2, 4, 6, 8].includes(nb),
              )
              reponse = ajoutPourTroisouNeuf.join(';')
              texteCorr +=
                ajoutPourTroisouNeuf.length === 2
                  ? `<br>${numAlpha(2)} Donc les chiffres qui conviennent sont les chiffres en commun à ${numAlpha(0, true)} et ${numAlpha(1, true)}, soit $${miseEnEvidence(ajoutPourTroisouNeuf[0])}$ et $${miseEnEvidence(ajoutPourTroisouNeuf[1])}$`
                  : `<br>${numAlpha(2)} Donc le seul chiffre qui convient est le chiffre en commun à ${numAlpha(0, true)} et ${numAlpha(1, true)}, soit $${miseEnEvidence(ajoutPourTroisouNeuf[0])}$`
              texteCorr += '.<br>'
              texteCorr +=
                ajoutPourTroisouNeuf.length === 2
                  ? `$${nbAvecChiffreCache.replace(symboleChiffreCache, String(ajoutPourTroisouNeuf[0]))}$ et $${nbAvecChiffreCache.replace(symboleChiffreCache, String(ajoutPourTroisouNeuf[1]))}$ sont divisibles par $2$ et par $3$.`
                  : `$${nbAvecChiffreCache.replace(symboleChiffreCache, String(ajoutPourTroisouNeuf[0]))}$ est divisible par $2$ et par $3$.`
              break
            default: // Le chiffre inconnu n'est pas le chiffre des unités
              if (a[nombreDeChiffres[i] - 2] % 2 === 0) {
                // Le chiffre des unités est pair
                texteCorr += `<br>${numAlpha(0)}Un entier divisible par $2$ est pair donc ici, `
                texteCorr +=
                  texteEnCouleurEtGras(
                    'tout chiffre convient pour que le nombre soit divisible par $2$ ',
                  ) + ' car le nombre est déjà pair.<br>'
                ajoutPourTroisouNeuf = []
                sommePourTroisouNeuf = sommeDesChiffres(a)[0]
                ajoutPourTroisouNeuf[0] =
                  sommePourTroisouNeuf % 3 === 0
                    ? 0
                    : 3 - (sommePourTroisouNeuf % 3)
                for (
                  let ee = 1;
                  ee < (ajoutPourTroisouNeuf[0] === 0 ? 4 : 3);
                  ee++
                ) {
                  ajoutPourTroisouNeuf.push(3 + ajoutPourTroisouNeuf[ee - 1])
                }
                texteCorr += `<br>${numAlpha(1)}Pour savoir si le nombre est divisible par $3$, il suffit de savoir quel nombre à un chiffre il faut ajouter à `
                texteCorr += `$${nombreDeChiffres[i] !== 2 ? sommeDesChiffres(a)[1] + '=' : ''}${sommePourTroisouNeuf}$`
                texteCorr += ' pour obtenir un multiple de $3$.<br>Or seuls '
                for (let ee = 0; ee < ajoutPourTroisouNeuf.length - 2; ee++) {
                  texteCorr +=
                    `$${sommePourTroisouNeuf}+${ajoutPourTroisouNeuf[ee]}=${sommePourTroisouNeuf + ajoutPourTroisouNeuf[ee]}$` +
                    ', '
                }
                texteCorr +=
                  `$${sommePourTroisouNeuf}+${ajoutPourTroisouNeuf[ajoutPourTroisouNeuf.length - 2]}=${sommePourTroisouNeuf + ajoutPourTroisouNeuf[ajoutPourTroisouNeuf.length - 2]}$` +
                  ' et '
                texteCorr += `$${sommePourTroisouNeuf}+${ajoutPourTroisouNeuf[ajoutPourTroisouNeuf.length - 1]}=${sommePourTroisouNeuf + ajoutPourTroisouNeuf[ajoutPourTroisouNeuf.length - 1]}$`
                texteCorr +=
                  ' sont divisibles par $3$ donc ici, les chiffres qui conviennent sont '
                for (let ee = 0; ee < ajoutPourTroisouNeuf.length - 2; ee++) {
                  texteCorr +=
                    '$' + miseEnEvidence(ajoutPourTroisouNeuf[ee]) + '$' + ', '
                }
                texteCorr +=
                  texteEnCouleurEtGras(
                    `$\\mathbf{${ajoutPourTroisouNeuf[ajoutPourTroisouNeuf.length - 2]}}$`,
                  ) + ' et '
                texteCorr +=
                  texteEnCouleurEtGras(
                    `$\\mathbf{${ajoutPourTroisouNeuf[ajoutPourTroisouNeuf.length - 1]}}$`,
                  ) + ' '
                texteCorr += texteEnCouleurEtGras(
                  'pour que le nombre soit divisible par $3$.<br>',
                )
                texteCorr += `<br>${numAlpha(2)} Donc les chiffres qui conviennent sont les chiffres en commun à ${numAlpha(0, true)} et ${numAlpha(1, true)}, soit `
                for (let ee = 0; ee < ajoutPourTroisouNeuf.length - 2; ee++) {
                  texteCorr +=
                    '$' + miseEnEvidence(ajoutPourTroisouNeuf[ee]) + '$' + ', '
                }
                texteCorr +=
                  texteEnCouleurEtGras(
                    `$\\mathbf{${ajoutPourTroisouNeuf[ajoutPourTroisouNeuf.length - 2]}}$`,
                  ) + ' et '
                texteCorr +=
                  texteEnCouleurEtGras(
                    `$\\mathbf{${ajoutPourTroisouNeuf[ajoutPourTroisouNeuf.length - 1]}}$`,
                  ) + '.</br>'
                for (let ee = 0; ee < ajoutPourTroisouNeuf.length - 2; ee++) {
                  texteCorr += `$${nbAvecChiffreCache.replace(symboleChiffreCache, String(ajoutPourTroisouNeuf[ee]))}$, `
                }
                texteCorr += `$${nbAvecChiffreCache.replace(symboleChiffreCache, String(ajoutPourTroisouNeuf[ajoutPourTroisouNeuf.length - 2]))}$ et $${nbAvecChiffreCache.replace(symboleChiffreCache, String(ajoutPourTroisouNeuf[ajoutPourTroisouNeuf.length - 1]))}$ sont divisibles par $6$.`
                reponse = ajoutPourTroisouNeuf.join(';')
              } else {
                // Le chiffre des unités est impair
                texteCorr +=
                  '<br>Un entier divisible par $2$ est pair donc ici, '
                texteCorr +=
                  texteEnCouleurEtGras('aucun chiffre convient') +
                  " car le nombre ne peut pas être pair donc n'est pas divisible par $2$.<br>"
                for (let ee = 0; ee < 8; ee++) {
                  texteCorr += `$${nbAvecChiffreCache.replace(symboleChiffreCache, String(ee))}$, `
                }
                texteCorr += `$${nbAvecChiffreCache.replace(symboleChiffreCache, '8')}$ et $${nbAvecChiffreCache.replace(symboleChiffreCache, '9')}$ ne sont pas divisibles par $2$.`
                reponse = '\\emptyset'
              }
              break
          }
          break
        case 6: // Divisibles par 2 et 5
          texteCorr +=
            '<br>Un entier divisible par $2$ et par $5$ est divisible par $10$, or '
          texteCorr +=
            'unn entier divisible par $10$ a son chiffre des unités égal à $0$ donc ici, '
          switch (positionX) {
            case nombreDeChiffres[i] - 1: // Le chiffre caché est le chiffre des unités
              texteCorr += texteEnCouleurEtGras('le chiffre $0$ suffit.<br>')
              texteCorr += `$${nbAvecChiffreCache.replace(symboleChiffreCache, '0')}$ est divisible par $10$.`
              reponse = '0'
              break
            default: // Le chiffre caché n'est pas le chiffre des unités
              if (a[nombreDeChiffres[i] - 2] % 10 === 0) {
                // Le chiffre des unités est 0
                texteCorr +=
                  texteEnCouleurEtGras('tout chiffre convient') +
                  ' car le chiffre des unités est déjà égal à $0$.<br>'
                for (let ee = 0; ee < 8; ee++) {
                  texteCorr += `$${nbAvecChiffreCache.replace(symboleChiffreCache, String(ee))}$, `
                }
                texteCorr += `$${nbAvecChiffreCache.replace(symboleChiffreCache, '8')}$ et $${nbAvecChiffreCache.replace(symboleChiffreCache, '9')}$ sont divisibles par $10$.`
                reponse = '0;2;4;6;8'
              } else {
                // Le chiffre des unités n'est pas 0 ou 5
                texteCorr +=
                  texteEnCouleurEtGras('aucun chiffre convient') +
                  " car le chiffre des unités n'est déjà pas égal à $0$.<br>"
                for (let ee = 0; ee < 8; ee++) {
                  texteCorr += `$${nbAvecChiffreCache.replace(symboleChiffreCache, String(ee))}$, `
                }
                texteCorr += `$${nbAvecChiffreCache.replace(symboleChiffreCache, '8')}$ et $${nbAvecChiffreCache.replace(symboleChiffreCache, '9')}$ ne sont pas divisibles par $10$.`
                reponse = '\\emptyset'
              }
              break
          }
          break
        case 7: // Divisible par 6
          texteCorr +=
            '<br>Un entier divisible par $6$ est un entier divisible par $2$ et par $3$.'
          texteCorr += `<br>${numAlpha(0)}Un entier divisible par $2$ est pair donc ici, `
          switch (positionX) {
            case nombreDeChiffres[i] - 1: // Le chiffre inconnu est le chiffre des unités
              texteCorr += texteEnCouleurEtGras(
                'tout chiffre pair suffit pour que le nombre soit divisible par $2$.<br>',
              )
              ajoutPourTroisouNeuf = []
              reponse = []
              sommePourTroisouNeuf = sommeDesChiffres(a)[0]
              ajoutPourTroisouNeuf[0] =
                sommePourTroisouNeuf % 3 === 0
                  ? 0
                  : 3 - (sommePourTroisouNeuf % 3)
              if (ajoutPourTroisouNeuf[0] % 2 === 0)
                reponse.push(String(ajoutPourTroisouNeuf[0]))
              for (
                let ee = 1;
                ee < (ajoutPourTroisouNeuf[0] === 0 ? 4 : 3);
                ee++
              ) {
                ajoutPourTroisouNeuf.push(3 + ajoutPourTroisouNeuf[ee - 1])
                if (ajoutPourTroisouNeuf[ee] % 2 === 0)
                  reponse.push(String(ajoutPourTroisouNeuf[ee]))
              }
              reponse = reponse.join(';')
              texteCorr += `<br>${numAlpha(1)}Pour savoir si le nombre est divisible par $3$, il suffit de savoir quel nombre à un chiffre il faut ajouter à `
              texteCorr += `$${nombreDeChiffres[i] !== 2 ? sommeDesChiffres(a)[1] + '=' : ''}${sommePourTroisouNeuf}$`
              texteCorr += ' pour obtenir un multiple de $3$.<br>Or seuls '
              for (let ee = 0; ee < ajoutPourTroisouNeuf.length - 2; ee++) {
                texteCorr +=
                  `$${sommePourTroisouNeuf}+${ajoutPourTroisouNeuf[ee]}=${sommePourTroisouNeuf + ajoutPourTroisouNeuf[ee]}$` +
                  ', '
              }
              texteCorr +=
                `$${sommePourTroisouNeuf}+${ajoutPourTroisouNeuf[ajoutPourTroisouNeuf.length - 2]}=${sommePourTroisouNeuf + ajoutPourTroisouNeuf[ajoutPourTroisouNeuf.length - 2]}$` +
                ' et '
              texteCorr += `$${sommePourTroisouNeuf}+${ajoutPourTroisouNeuf[ajoutPourTroisouNeuf.length - 1]}=${sommePourTroisouNeuf + ajoutPourTroisouNeuf[ajoutPourTroisouNeuf.length - 1]}$`
              texteCorr +=
                ' sont divisibles par $3$ donc ici, les chiffres qui conviennent sont '
              for (let ee = 0; ee < ajoutPourTroisouNeuf.length - 2; ee++) {
                texteCorr +=
                  '$' + miseEnEvidence(ajoutPourTroisouNeuf[ee]) + '$' + ', '
              }
              texteCorr +=
                texteEnCouleurEtGras(
                  `$\\mathbf{${ajoutPourTroisouNeuf[ajoutPourTroisouNeuf.length - 2]}}$`,
                ) + ' et '
              texteCorr +=
                texteEnCouleurEtGras(
                  `$\\mathbf{${ajoutPourTroisouNeuf[ajoutPourTroisouNeuf.length - 1]}}$`,
                ) + ' '
              texteCorr += texteEnCouleurEtGras(
                'pour que le nombre soit divisible par $3$.<br>',
              )
              texteCorr +=
                reponse.length > 1
                  ? `<br>${numAlpha(2)} Donc les chiffres qui conviennent sont les chiffres en commun à ${numAlpha(0, true)} et ${numAlpha(1, true)}, soit ${texteEnCouleurEtGras(reponse[0])} et ${texteEnCouleurEtGras(reponse[2])}`
                  : `<br>${numAlpha(2)} Donc le seul chiffre qui convient est le chiffre en commun à ${numAlpha(0, true)} et ${numAlpha(1, true)}, soit ${texteEnCouleurEtGras(reponse[0])}`
              texteCorr += '.<br>'
              texteCorr +=
                reponse.length > 1
                  ? `$${nbAvecChiffreCache.replace(symboleChiffreCache, reponse[0])}$ et $${nbAvecChiffreCache.replace(symboleChiffreCache, reponse[2])}$ sont divisibles par $6$.`
                  : `$${nbAvecChiffreCache.replace(symboleChiffreCache, reponse[0])}$ est divisible par $6$.`
              break
            default: // Le chiffre inconnu n'est pas le chiffre des unités
              if (a[nombreDeChiffres[i] - 2] % 2 === 0) {
                // Le chiffre des unités est pair
                texteCorr +=
                  texteEnCouleurEtGras(
                    'tout chiffre convient pour que le nombre soit divisible par $2$ ',
                  ) + ' car le nombre est déjà pair.<br>'
                ajoutPourTroisouNeuf = []
                sommePourTroisouNeuf = sommeDesChiffres(a)[0]
                ajoutPourTroisouNeuf[0] =
                  sommePourTroisouNeuf % 3 === 0
                    ? 0
                    : 3 - (sommePourTroisouNeuf % 3)
                for (
                  let ee = 1;
                  ee < (ajoutPourTroisouNeuf[0] === 0 ? 4 : 3);
                  ee++
                ) {
                  ajoutPourTroisouNeuf.push(3 + ajoutPourTroisouNeuf[ee - 1])
                }
                texteCorr += `<br>${numAlpha(1)}Pour savoir si le nombre est divisible par $3$, il suffit de savoir quel nombre à un chiffre il faut ajouter à `
                texteCorr += `$${nombreDeChiffres[i] !== 2 ? sommeDesChiffres(a)[1] + '=' : ''}${sommePourTroisouNeuf}$`
                texteCorr += ' pour obtenir un multiple de $3$.<br>Or seuls '
                for (let ee = 0; ee < ajoutPourTroisouNeuf.length - 2; ee++) {
                  texteCorr +=
                    `$${sommePourTroisouNeuf}+${ajoutPourTroisouNeuf[ee]}=${sommePourTroisouNeuf + ajoutPourTroisouNeuf[ee]}$` +
                    ', '
                }
                texteCorr +=
                  `$${sommePourTroisouNeuf}+${ajoutPourTroisouNeuf[ajoutPourTroisouNeuf.length - 2]}=${sommePourTroisouNeuf + ajoutPourTroisouNeuf[ajoutPourTroisouNeuf.length - 2]}$` +
                  ' et '
                texteCorr += `$${sommePourTroisouNeuf}+${ajoutPourTroisouNeuf[ajoutPourTroisouNeuf.length - 1]}=${sommePourTroisouNeuf + ajoutPourTroisouNeuf[ajoutPourTroisouNeuf.length - 1]}$`
                texteCorr +=
                  ' sont divisibles par $3$ donc ici, les chiffres qui conviennent sont '
                for (let ee = 0; ee < ajoutPourTroisouNeuf.length - 2; ee++) {
                  texteCorr +=
                    '$' + miseEnEvidence(ajoutPourTroisouNeuf[ee]) + '$' + ', '
                }
                texteCorr +=
                  texteEnCouleurEtGras(
                    `$\\mathbf{${ajoutPourTroisouNeuf[ajoutPourTroisouNeuf.length - 2]}}$`,
                  ) + ' et '
                texteCorr +=
                  texteEnCouleurEtGras(
                    `$\\mathbf{${ajoutPourTroisouNeuf[ajoutPourTroisouNeuf.length - 1]}}$`,
                  ) + ' '
                texteCorr += texteEnCouleurEtGras(
                  'pour que le nombre soit divisible par $3$.<br>',
                )
                texteCorr += `<br>${numAlpha(2)} Donc les chiffres qui conviennent sont les chiffres en commun à ${numAlpha(0, true)} et ${numAlpha(1, true)}, soit `
                for (let ee = 0; ee < ajoutPourTroisouNeuf.length - 2; ee++) {
                  texteCorr +=
                    '$' + miseEnEvidence(ajoutPourTroisouNeuf[ee]) + '$' + ', '
                }
                texteCorr +=
                  texteEnCouleurEtGras(
                    `$\\mathbf{${ajoutPourTroisouNeuf[ajoutPourTroisouNeuf.length - 2]}}$`,
                  ) + ' et '
                texteCorr +=
                  texteEnCouleurEtGras(
                    `$\\mathbf{${ajoutPourTroisouNeuf[ajoutPourTroisouNeuf.length - 1]}}$`,
                  ) + '.</br>'
                for (let ee = 0; ee < ajoutPourTroisouNeuf.length - 2; ee++) {
                  texteCorr += `$${nbAvecChiffreCache.replace(symboleChiffreCache, String(ajoutPourTroisouNeuf[ee]))}$, `
                }
                texteCorr += `$${nbAvecChiffreCache.replace(symboleChiffreCache, String(ajoutPourTroisouNeuf[ajoutPourTroisouNeuf.length - 2]))}$ et $${nbAvecChiffreCache.replace(symboleChiffreCache, String(ajoutPourTroisouNeuf[ajoutPourTroisouNeuf.length - 1]))}$ sont divisibles par $6$.`
                reponse = ajoutPourTroisouNeuf.join(';')
              } else {
                // Le chiffre des unités est impair
                texteCorr +=
                  texteEnCouleurEtGras('aucun chiffre convient') +
                  " car le nombre ne peut pas être pair donc n'est pas divisible par $2$.<br>"
                for (let ee = 0; ee < 8; ee++) {
                  texteCorr += `$${nbAvecChiffreCache.replace(symboleChiffreCache, String(ee))}$, `
                }
                texteCorr += `$${nbAvecChiffreCache.replace(symboleChiffreCache, '8')}$ et $${nbAvecChiffreCache.replace(symboleChiffreCache, '9')}$ ne sont pas divisibles par $2$.`
                reponse = '\\emptyset'
              }
              break
          }
          break
        case 8: // Divisible par 10
        default:
          texteCorr +=
            '<br>Un entier divisible par $10$ a son chiffre des unités égal à $0$ donc ici, '
          switch (positionX) {
            case nombreDeChiffres[i] - 1: // Le chiffre caché est le chiffre des unités
              texteCorr += texteEnCouleurEtGras('le chiffre $0$ suffit.<br>')
              texteCorr += `$${nbAvecChiffreCache.replace(symboleChiffreCache, '0')}$ est divisible par $10$.`
              reponse = '0'
              break
            default: // Le chiffre caché n'est pas le chiffre des unités
              if (a[nombreDeChiffres[i] - 2] % 10 === 0) {
                // Le chiffre des unités est 0
                texteCorr +=
                  texteEnCouleurEtGras('tout chiffre convient') +
                  ' car le chiffre des unités est déjà égal à $0$.<br>'
                for (let ee = 0; ee < 8; ee++) {
                  texteCorr += `$${nbAvecChiffreCache.replace(symboleChiffreCache, String(ee))}$, `
                }
                texteCorr += `$${nbAvecChiffreCache.replace(symboleChiffreCache, '8')}$ et $${nbAvecChiffreCache.replace(symboleChiffreCache, '9')}$ sont divisibles par $10$.`
                reponse = '0;1;2;3;4;5;6;7;8;9'
              } else {
                // Le chiffre des unités n'est pas 0 ou 5
                texteCorr +=
                  texteEnCouleurEtGras('aucun chiffre convient') +
                  " car le chiffre des unités n'est déjà pas égal à $0$.<br>"
                for (let ee = 0; ee < 8; ee++) {
                  texteCorr += `$${nbAvecChiffreCache.replace(symboleChiffreCache, String(ee))}$, `
                }
                texteCorr += `$${nbAvecChiffreCache.replace(symboleChiffreCache, '8')}$ et $${nbAvecChiffreCache.replace(symboleChiffreCache, '9')}$ ne sont pas divisibles par $10$.`
                reponse = '\\emptyset'
              }
              break
          }
          break
      }
      handleAnswers(this, i, {
        reponse: { value: reponse, options: { suiteDeNombres: true } },
      })

      if (this.questionJamaisPosee(i, nbAvecChiffreCache)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
