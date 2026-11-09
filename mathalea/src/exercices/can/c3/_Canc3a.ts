import { colorToLatexOrHTML } from '../../../lib/2d/colorToLatexOrHtml'
import { droiteGraduee } from '../../../lib/2d/DroiteGraduee'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { grille } from '../../../lib/2d/Grille'
import { plot } from '../../../lib/2d/Plot'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { polygone, polygoneAvecNom } from '../../../lib/2d/polygones'
import {
  segment,
  segmentAvecExtremites,
} from '../../../lib/2d/segmentsVecteurs'
import { texteParPosition } from '../../../lib/2d/textes'
import { milieu } from '../../../lib/2d/utilitairesPoint'
import { bleuMathalea } from '../../../lib/colors'
import { texPrix } from '../../../lib/format/style'
import { choice, shuffle } from '../../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../../lib/outils/embellissements'
import { queDevant, sp } from '../../../lib/outils/outilString'
import { prenomF, prenomM } from '../../../lib/outils/Personne'
import {
  formatMinute,
  stringNombre,
  texNombre,
} from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import FractionEtendue from '../../../modules/FractionEtendue'
import { mathalea2d } from '../../../modules/mathalea2d'
import { egal, randint } from '../../../modules/outils'

export const titre = 'Classe CAN C3'

/**
 * Essai de classe Can pour le sujet cm2 2023
 * @author Sébastien LOZANO: number
 */

export default class ClasseCan2023 {
  compareNombres(a: number, b: number) {
    return a - b
  }

  /**
   * Méthode pour la question produit de deux facteurs entiers
   * @param {number} minFacteur0 min pour le premier facteur
   * @param {number} maxFacteur0 max pour le premier facteur
   * @param {number} minFacteur1 min pour le second facteur
   * @param {number} maxFacteur1 max pour le second facteur
   * @returns {object}
   */

  produitDeDeuxFacteurs(
    minFacteur0: number,
    maxFacteur0: number,
    minFacteur1: number,
    maxFacteur1: number,
  ) {
    const sortie = {
      texte: '',
      texteCorr: '',
      reponse: '0',
      canEnonce: '',
      canReponseACompleter: '',
    }
    const a = randint(minFacteur0, maxFacteur0)
    const b = randint(minFacteur1, maxFacteur1)
    sortie.texte = `$${a} \\times ${b}$`
    sortie.texteCorr = `$${a} \\times ${b}=${miseEnEvidence(a * b)}$`
    sortie.reponse = String(a * b)
    sortie.canEnonce = sortie.texte
    sortie.canReponseACompleter = ''
    return sortie
  }

  /**
   * Méthode pour ajouter une dizaine moins un
   * @returns {object}
   */

  ajouterDizaineMoinsUn() {
    const sortie = {
      texte: '',
      texteCorr: '',
      reponse: '0',
      canEnonce: '',
      canReponseACompleter: '',
    }
    const a = randint(23, 38, [20, 30, 31, 29])
    const b = choice([19, 29, 39])

    sortie.texte = `$${a}+${b}$`
    sortie.reponse = String(a + b)
    if (b === 19) {
      sortie.texteCorr = `$${a}+${b}=${a}+20-1=${a + 20}-1=${miseEnEvidence(sortie.reponse)}$`
    }
    if (b === 29) {
      sortie.texteCorr = `$${a}+${b}=${a}+30-1=${a + 30}-1=${miseEnEvidence(sortie.reponse)}$`
    }
    if (b === 39) {
      sortie.texteCorr = `$${a}+${b}=${a}+40-1=${a + 40}-1=${miseEnEvidence(sortie.reponse)}$`
    }
    sortie.canEnonce = sortie.texte
    sortie.canReponseACompleter = ''
    return sortie
  }

  /**
   * Méthode pour dénombrer les éléments d'un rectangle
   * @returns {object}
   */

  denombrementProduit() {
    const sortie = {
      texte: '',
      texteCorr: '',
      reponse: '0',
      canEnonce: '',
      canReponseACompleter: '',
    }
    const k = randint(5, 8)
    const b = randint(2, 5) * k
    const d = []
    for (let n = 0; n < b; n++) {
      d.push(
        plot(n % k, -Math.floor(n / k), {
          rayon: 0.2,
          couleur: 'black',
          couleurDeRemplissage: 'black',
        }),
      )
    }
    sortie.texte = 'Combien y a-t-il de boules noires ? <br> \n'

    sortie.texte += `${mathalea2d(Object.assign({ scale: 0.3 }, fixeBordures(d)), d)}`
    sortie.reponse = b.toString()
    sortie.texteCorr = `Le nombre de boules noires est donné par : $${k}\\times ${texNombre(b / k, 0)}=${miseEnEvidence(b)}$.`
    sortie.canEnonce = sortie.texte
    sortie.canReponseACompleter = '\\dots{} boules'
    return sortie
  }

  /**
   * Méthode pour calucler la moitié ou le double
   * @returns {object}
   */

  moitieDouble() {
    const sortie = {
      texte: '',
      texteCorr: '',
      reponse: '0',
      canEnonce: '',
      canReponseACompleter: '',
    }
    let a
    if (choice([true, false])) {
      a = randint(11, 25, 20) * 2
      sortie.reponse = (a / 2).toFixed(0)
      sortie.texte = `La moitié de $${a}$`
      sortie.texteCorr = `La moitié de $${a}$ est $${a}\\div 2=${miseEnEvidence(a / 2)}$.`
    } else {
      a = randint(16, 45, [20, 30, 40])
      sortie.reponse = String(2 * a)
      sortie.texte = `Le double de $${a}$`
      sortie.texteCorr = `Le double  de $${a}$ est $${a}\\times 2=${miseEnEvidence(a * 2)}$.`
    }
    sortie.canEnonce = sortie.texte
    sortie.canReponseACompleter = ''
    return sortie
  }

  /**
   * Méthode pour la lecture d'abscisse entière
   * @returns {object}
   */
  lectureAbscisseEntiere() {
    const sortie = {
      texte: '',
      texteCorr: '',
      reponse: '0',
      canEnonce: '',
      canReponseACompleter: '',
    }
    // Variables pour l'affichage LaTeX
    let pas, valeurOrigine, valeurUnitex, gradLaTeX
    let a, d
    if (choice([true, false])) {
      a = randint(42, 52, [40, 45, 50]) * 2 // choix de la produit = écart entre deux graduations
      pas = 5
      valeurOrigine = a - (a % 10)
      valeurUnitex = valeurOrigine + 10
      gradLaTeX = Math.floor((a % 10) / 2)
      d = droiteGraduee({
        Unite: 0.5,
        Min: 81,
        Max: 106,
        x: 0,
        y: 0,
        thickDistance: 10,
        thickSec: true,
        thickSecDist: 2,
        thickOffset: 0,
        axeStyle: '->',
        pointListe: [[a, '?']],
        pointCouleur: bleuMathalea,
        pointStyle: 'x',
        labelsPrincipaux: true,
      })
    } else {
      a = choice([75, 85, 95, 105, 115]) // choix de la produit = écart entre deux graduations
      pas = 2
      valeurOrigine = a - (a % 10)
      valeurUnitex = valeurOrigine + 10
      gradLaTeX = 1
      d = droiteGraduee({
        Unite: 0.25,
        Min: 71,
        Max: 116,
        x: 0,
        y: 0,
        thickDistance: 10,
        thickSec: true,
        thickSecDist: 5,
        thickOffset: 0,
        axeStyle: '->',
        pointListe: [[a, '?']],
        pointCouleur: bleuMathalea,
        pointStyle: 'x',
        labelsPrincipaux: true,
      })
    }
    sortie.reponse = a.toString()
    sortie.texte = context.isHtml
      ? "Quel est le nombre écrit sous le point d'interrogation ?<br>\n" +
        mathalea2d(
          {
            xmin: -1,
            ymin: -1,
            xmax: 15,
            ymax: 1.5,
            scale: 0.6,
            center: !context.isHtml,
          },
          d,
        ) +
        '\n'
      : `Complète \\\\ {\\Reperage[ValeurOrigine=${valeurOrigine},ValeurUnitex=${valeurUnitex},Pasx=${pas},AffichageAbs=3,AffichageGrad]{${gradLaTeX}/A}}`
    // texte += context.isHtml ? '' : '\\\\\\smallskip'
    sortie.texteCorr = `Le nombre écrit sous le point d'interrogation est : $${miseEnEvidence(a)}$.`
    sortie.canEnonce = 'Complète.'
    sortie.canReponseACompleter = `{\\Reperage[ValeurOrigine=${valeurOrigine},ValeurUnitex=${valeurUnitex},Pasx=${pas},AffichageAbs=3,AffichageGrad]{${gradLaTeX}/A}}`
    return sortie
  }

  /**
   * Méthode pour déterminer deux facteurs d'un produit donné
   * @returns {object}
   */

  trouverLesFacteursDUnProduit() {
    const sortie: {
      texte: string
      texteCorr: string
      reponse: string | string[]
      canEnonce: string
      canReponseACompleter: string
    } = {
      texte: '',
      texteCorr: '',
      reponse: '0',
      canEnonce: '',
      canReponseACompleter: '',
    }
    function texteQ6(valeurCible: number) {
      const sortie = { texte: '', reponseACompleter: '' }
      sortie.texte = `Complète : ${context.isHtml ? sp(3) : ''} $\\ldots \\times \\ldots =${String(valeurCible)}$`
      sortie.reponseACompleter = `$\\ldots \\times \\ldots =${valeurCible}$`
      return sortie
    }
    const m = choice([1, 2, 3, 4])
    if (m === 1) {
      sortie.texte = texteQ6(18).texte
      sortie.canReponseACompleter = texteQ6(18).reponseACompleter
      sortie.reponse = ['3;6', '1;18', '2;9', '6;3', '18;1', '9;2']
      sortie.texteCorr = `Trois réponses possibles (avec des entiers) : <br>
    $${miseEnEvidence('3;6')}$ car $3\\times 6=18$<br>
    $${miseEnEvidence('2;9')}$ car $2\\times 9=18$<br>
    $${miseEnEvidence('1;18')}$ car $1\\times 18=18$ `
    }
    if (m === 2) {
      sortie.texte = texteQ6(21).texte
      sortie.canReponseACompleter = texteQ6(21).reponseACompleter
      sortie.reponse = ['3;7', '1;21', '7;3', '21;1']
      sortie.texteCorr = `Deux réponses possibles (avec des entiers) : <br>
      $${miseEnEvidence(3)}\\times ${miseEnEvidence(7)}=21$<br>
      $${miseEnEvidence(1)}\\times ${miseEnEvidence(21)}=21$ `
    }
    if (m === 3) {
      sortie.texte = texteQ6(35).texte
      sortie.canReponseACompleter = texteQ6(35).reponseACompleter
      sortie.reponse = ['5;7', '1;35', '7;5', '35;1']
      sortie.texteCorr = `Deux réponses possibles (avec des entiers) : <br>
        $${miseEnEvidence(5)}\\times ${miseEnEvidence(7)}=35$<br>
        $${miseEnEvidence(1)}\\times ${miseEnEvidence(35)}=35$ `
    }
    if (m === 4) {
      sortie.texte = texteQ6(42).texte
      sortie.canReponseACompleter = texteQ6(42).reponseACompleter
      sortie.reponse = [
        '6;7',
        '1;42',
        '2;21',
        '3;14',
        '7;6',
        '42;1',
        '21;2',
        '14;3',
      ]
      sortie.texteCorr = `Quatre réponses possibles (avec des entiers) : <br>
            $${miseEnEvidence(6)}\\times ${miseEnEvidence(7)}=42$<br>
            $${miseEnEvidence(2)}\\times ${miseEnEvidence(21)}=42$ <br>
            $${miseEnEvidence(3)}\\times ${miseEnEvidence(14)}=42$<br>
            $${miseEnEvidence(1)}\\times ${miseEnEvidence(42)}=42$`
    }
    sortie.canEnonce = 'Complète.'
    return sortie
  }

  /**
   * Méthode pour ajouter des durées
   * @returns {object}
   */

  sommeDeDurees() {
    const sortie: {
      texte: string
      texteCorr: string
      reponse: string | string[]
      canEnonce: string
      canReponseACompleter: string
    } = {
      texte: '',
      texteCorr: '',
      reponse: '0',
      canEnonce: '',
      canReponseACompleter: '',
    }
    let b, c
    if (choice([true, false])) {
      b = choice([35, 40, 45, 50, 55])
      c = choice([30, 35, 40, 45])
    } else {
      b = choice([20, 25, 30, 35])
      c = choice([45, 50, 55])
    }
    sortie.texte = context.isHtml
      ? `$${b}\\text{ min }+${c} \\text{ min }=\\ldots \\text{ h } \\ldots \\text{ min }$`
      : `\\Temps{;;;;${b};}+ \\Temps{;;;;${c};}`
    sortie.reponse = String(b + c - 60)
    if (b > c) {
      sortie.texteCorr = `De $${b} \\text{ min }$ pour aller à $1$ h, il faut $${60 - b}$ min, et il reste $${b - 60 + c}$ min à ajouter.<br>
        On obtient  $${miseEnEvidence(`1\\text{ h }${formatMinute(Number(sortie.reponse))}\\text{ min}`)}$.`
    } else {
      sortie.texteCorr = `De $${c} \\text{ min }$ pour aller à $1$ h, il faut $${60 - c}$ min, et il reste $${b - 60 + c}$ min à ajouter.<br>
        On obtient  $${miseEnEvidence(`1\\text{ h }${formatMinute(Number(sortie.reponse))}\\text{ min}`)}$.`
    }
    sortie.reponse = String(sortie.reponse)
    sortie.canEnonce = sortie.texte
    sortie.canReponseACompleter = '\\ldots{} h \\ldots{} min'
    return sortie
  }

  /**
   * Méthode pour un calcul de partage
   * @returns {object}
   */

  partages() {
    const sortie = {
      texte: '',
      texteCorr: '',
      reponse: '0',
      canEnonce: '',
      canReponseACompleter: '',
    }
    const choix = choice(['a', 'b', 'c', 'd'])
    let a
    if (choix === 'a') {
      a = randint(9, 15) * 3
      sortie.reponse = String(Math.round(a / 3))
      sortie.texte = `Pour partager $${a}$ œufs, combien de boîtes de $3$ œufs dois-je utiliser ? `
      sortie.texteCorr = `Le nombre de boites est donné par $${a}\\div 3=${miseEnEvidence(a / 3)}$.`
    }
    if (choix === 'b') {
      sortie.reponse = String(randint(8, 12))
      a = Number(sortie.reponse) * 4
      sortie.texte = `Pour partager $${a}$ œufs, combien de boîtes de $4$ œufs dois-je utiliser ? `
      sortie.texteCorr = `Le nombre de boites est donné par $${a}\\div 4=${miseEnEvidence(a / 4)}$.`
    }
    if (choix === 'c') {
      sortie.reponse = String(randint(6, 10))
      a = Number(sortie.reponse) * 5
      sortie.texte = `Pour partager $${a}$ œufs, combien de boîtes de $5$ œufs dois-je utiliser ? `
      sortie.texteCorr = `Le nombre de boites est donné par $${a}\\div 5=${miseEnEvidence(sortie.reponse)}$.`
    }
    if (choix === 'd') {
      sortie.reponse = String(randint(4, 8))
      a = Number(sortie.reponse) * 6
      sortie.texte = `Pour partager $${a}$ œufs, combien de boîtes de $6$ œufs dois-je utiliser ? `
      sortie.texteCorr = `Le nombre de boites est donné par $${a}\\div 6=${miseEnEvidence(sortie.reponse)}$.`
    }
    sortie.canEnonce = sortie.texte
    sortie.canReponseACompleter = 'Je dois utiliser \\\\ \\ldots{} boites.'
    return sortie
  }

  /**
   * Méthode pour un ordre de grandeur
   * @returns {object}
   */

  ordreDeGrandeur() {
    const sortie: {
      texte: string
      texteCorr: string
      reponse: string | string[]
      canEnonce: string
      reponseUnite: string
      canReponseACompleter: string
    } = {
      texte: '',
      texteCorr: '',
      reponse: '0',
      reponseUnite: '',
      canEnonce: '',
      canReponseACompleter: '',
    }
    const taille1: [string, number, number, string][] = [
      ['falaise', 15, 25, '\\text{ m}'],
      ['girafe', 40, 50, '\\text{ dm}'],
      ['échelle', 200, 300, '\\text{ cm}'],
      ['bouteille', 28, 35, '\\text{ cm}'],
      ['télévision', 50, 60, '\\text{ cm}'],
    ]

    const a = randint(0, 4)
    const b = randint(taille1[a][1] as number, taille1[a][2] as number)
    const propositions = shuffle([
      context.isHtml ? `$${b}\\text{ m}$` : `\\Lg[m]{${b}}`,
      context.isHtml ? `$${b}\\text{ dm}$` : `\\Lg[dm]{${b}}`,
      context.isHtml ? `$${b}\\text{ cm}$` : `\\Lg[cm]{${b}}`,
      context.isHtml ? `$${b}\\text{ mm}$` : `\\Lg[mm]{${b}}`,
    ])
    sortie.reponse = String(b)
    sortie.reponseUnite = taille1[a][3] as string

    sortie.texte = `Choisis parmi les propositions suivantes la hauteur d'une ${taille1[a][0]}.<br>`
    sortie.texte += `${propositions[0]} ${sp(4)} ${propositions[1]} ${sp(4)} ${propositions[2]}${sp(4)} ${propositions[3]}`
    sortie.texteCorr = `La taille d'une ${taille1[a][0]} est $${miseEnEvidence(sortie.reponse)}${sortie.reponseUnite}$.`
    sortie.canEnonce = `Entoure parmi les propositions suivantes la hauteur d'une ${taille1[a][0]}`
    sortie.canReponseACompleter = `${propositions[0]} \\hfill ${propositions[1]} \\hfill ${propositions[2]} \\hfill ${propositions[3]}`
    return sortie
  }

  /**
   * Méthode pour écrire un nombre en chiffres
   * @returns {object}
   */

  ecrireUnNombreEnChiffres() {
    const sortie = {
      texte: '',
      texteCorr: '',
      reponse: '0',
      canEnonce: '',
      canReponseACompleter: '',
    }
    let chiffre: [string, number][] = [
      ['un', 1],
      ['deux', 2],
      ['trois', 3],
      ['cinq', 5],
      ['quatre', 4],
      ['six', 6],
      ['sept', 7],
      ['huit', 8],
      ['neuf', 9],
    ]
    let chiffre2: [string, number][] = [
      ['vingt', 20],
      ['trente', 30],
      ['quarante', 40],
      ['cinquante', 50],
      ['soixante', 60],
    ]
    let a = randint(0, 8)
    let b = randint(0, 4)
    let c = randint(0, 8)
    const d = randint(0, 4)
    if (choice([true, false])) {
      chiffre = [
        ['un', 1],
        ['deux', 2],
        ['trois', 3],
        ['cinq', 5],
        ['quatre', 4],
        ['six', 6],
        ['sept', 7],
        ['huit', 8],
        ['neuf', 9],
      ]
      chiffre2 = [
        ['vingt', 20],
        ['trente', 30],
        ['quarante', 40],
        ['cinquante', 50],
        ['soixante', 60],
      ]
      a = randint(0, 8)
      b = randint(0, 4)
      c = randint(0, 8)
      if (a === 0) {
        sortie.texte = `Écris en chiffres le nombre ${chiffre2[b][0]}-et-${chiffre[a][0]}-mille-${chiffre[c][0]}.`
        sortie.reponse = String(
          (chiffre2[b][1] + chiffre[a][1]) * 1000 + chiffre[c][1],
        )
        sortie.texteCorr = `${chiffre2[b][0]}-et-${chiffre[a][0]}-mille-${chiffre[c][0]} = $${texNombre((chiffre2[b][1] + chiffre[a][1]) * 1000)}$ + ${chiffre[c][1]} = $${miseEnEvidence(texNombre((chiffre2[b][1] + chiffre[a][1]) * 1000 + chiffre[c][1]))}$ `
      } else {
        sortie.texte = `Écris en chiffres le nombre ${chiffre2[b][0]}-${chiffre[a][0]}-mille-${chiffre[c][0]}.`
        sortie.reponse = String(
          (chiffre2[b][1] + chiffre[a][1]) * 1000 + chiffre[c][1],
        )
        sortie.texteCorr = `${chiffre2[b][0]}-${chiffre[a][0]}-mille-${chiffre[c][0]} = $${texNombre((chiffre2[b][1] + chiffre[a][1]) * 1000)}$ + ${chiffre[c][1]} = $${miseEnEvidence(texNombre((chiffre2[b][1] + chiffre[a][1]) * 1000 + chiffre[c][1]))}$ `
      }
    } else {
      if (a === 0) {
        sortie.texte = `Écris en chiffres le nombre : <br> ${chiffre2[b][0]}-et-${chiffre[a][0]}-mille-${chiffre2[d][0]} `
        sortie.reponse = String(
          (chiffre2[b][1] + chiffre[a][1]) * 1000 + chiffre2[d][1],
        )
        sortie.texteCorr = `$\\text{${chiffre2[b][0]}-et-${chiffre[a][0]}-mille-${chiffre2[d][0]}} = ${texNombre((chiffre2[b][1] + chiffre[a][1]) * 1000)} + ${chiffre2[d][1]} =${miseEnEvidence(texNombre((chiffre2[b][1] + chiffre[a][1]) * 1000 + chiffre2[d][1]))}$ `
      } else {
        sortie.texte = `Écris en chiffres le nombre : <br> ${chiffre2[b][0]}-${chiffre[a][0]}-mille-${chiffre2[d][0]} `
        sortie.reponse = String(
          (chiffre2[b][1] + chiffre[a][1]) * 1000 + chiffre2[d][1],
        )
        sortie.texteCorr = `$\\text{${chiffre2[b][0]}-${chiffre[a][0]}-mille-${chiffre2[d][0]}} = ${texNombre((chiffre2[b][1] + chiffre[a][1]) * 1000)} + ${chiffre2[d][1]} =${miseEnEvidence(texNombre((chiffre2[b][1] + chiffre[a][1]) * 1000 + chiffre2[d][1]))}$ `
      }
    }
    sortie.canEnonce = sortie.texte
    sortie.canReponseACompleter = ''
    return sortie
  }

  /**
   * Méthode pour de plus de moins
   * @param {string} type pour le type de problème
   * @returns {object}
   */

  dePlusDeMoins(type: 'billes' | 'ages') {
    const sortie = {
      texte: '',
      texteCorr: '',
      reponse: '0',
      canEnonce: '',
      canReponseACompleter: '',
      champTexteApres: {},
    }
    const prenom1 = prenomF()
    const prenom2 = prenomM()
    let b, a
    switch (type) {
      case 'billes':
        b = randint(3, 5)
        sortie.reponse = String(randint(4, 9))
        a = Number(sortie.reponse) + b
        sortie.texte = `${prenom1} a $${a}$ billes. <br>
        Elle en a $${b}$ de plus ${queDevant(prenom2)}.${context.isHtml ? '' : '\\\\'} Combien de billes a ${prenom2} ? `
        sortie.texteCorr = `Puisque ${prenom1} en  a $${b}$ de plus, sa sœur en a $${b}$ de moins, soit  : $${a} - ${b}=${miseEnEvidence(a - b)}$. `
        sortie.champTexteApres = {}
        sortie.canEnonce = sortie.texte
        sortie.canReponseACompleter = `${prenom2} a \\ldots{} billes.`
        break
      case 'ages':
        b = randint(6, 15)
        a = randint(2, 5)
        sortie.reponse = String(b - a)
        sortie.texte = `${prenom1} a $${b}$ ans. <br>
        ${prenom2} a $${a}$ ans de moins ${queDevant(prenom1)}. ${prenom2} a `
        sortie.texteCorr = `Puisque ${prenom2} a $${a}$ ans de moins ${queDevant(prenom1)}, son âge est  : $${b}-${a}=${miseEnEvidence(b - a)}$ ${texteEnCouleur('ans')}. `
        sortie.champTexteApres = { texteApres: sp(5) + 'ans.' }
        sortie.canReponseACompleter = `${prenom2} a \\ldots{} ans.`
        sortie.canEnonce = `${prenom1} a $${b}$ ans. <br>
        ${prenom2} a $${a}$ ans de moins ${queDevant(prenom1)}.`
        break
    }
    return sortie
  }

  /**
   * Méthode pour demander l'écriture d'un produit d'un entier par un nombre entier de dixièmes/centièmes
   * @returns {object}
   */
  ecritureDecimaleProduitEntierParDixiemesOuCentiemes() {
    const sortie = {
      texte: '',
      texteCorr: '',
      reponse: '0',
      canEnonce: '',
      canReponseACompleter: '',
    }
    let a, b, c
    if (choice([true, false])) {
      a = randint(2, 5)
      b = randint(6, 9)
      c = 0.1
      sortie.reponse = (a * b * c).toFixed(1)
      sortie.texte = `Donne l'écriture décimale de  $${a}\\times ${b}$ dixièmes.`
      sortie.texteCorr = `$1$ dixième $=0,1$, d'où $${a}\\times ${b}$ dixièmes $=${a}\\times ${b}\\times 0,1=${miseEnEvidence(texNombre(Number(sortie.reponse), 1))}$.`
    } else {
      a = randint(2, 5)
      b = randint(6, 9)
      c = 0.01
      sortie.reponse = (a * b * c).toFixed(2)
      sortie.texte = `Donne l'écriture décimale de  $${a}\\times ${b}$ centièmes.`
      sortie.texteCorr = `$1$ centième $=0,01$, d'où $${a}\\times ${b}$ centièmes $=${a}\\times ${b}\\times 0,01=${miseEnEvidence(texNombre(Number(sortie.reponse), 2))}$.`
    }
    sortie.canEnonce = sortie.texte
    sortie.canReponseACompleter = ''
    return sortie
  }

  /**
   * Méthode pour la lecture d'abscisse entière
   * @returns {object}
   */
  lectureAbscisseEntiereOrigineZero() {
    const sortie = {
      texte: '',
      texteCorr: '',
      reponse: '0',
      canEnonce: '',
      canReponseACompleter: '',
    }
    const facteur = randint(2, 9)
    const table = randint(2, 9)
    const a = facteur * table
    let unite = 1
    switch (table) {
      case 2:
      case 3:
      case 4:
      case 5:
        unite = 0.5
        break
      case 6:
      case 7:
      case 8:
      case 9:
        unite = 0.25
        break
    }
    const d = droiteGraduee({
      Unite: unite,
      Min: 0,
      Max: 11 * table,
      x: 0,
      y: 0,
      thickDistance: table,
      thickOffset: 0,
      axeStyle: '->',
      pointListe: [[a, '?']],
      labelListe: [
        [0, '0'],
        [table, `${table}`],
        [10 * table, `${10 * table}`],
      ],
      pointCouleur: bleuMathalea,
      pointStyle: 'x',
      labelsPrincipaux: false,
    })
    sortie.reponse = a.toString()
    sortie.canReponseACompleter = `{\\Reperage[DemiDroite,Pasx=1,Unitex=0.4,ValeurUnitex=${table},AffichageAbs=2]{${facteur}/3*A,10/B}}`
    sortie.texte = context.isHtml
      ? "Quel est le nombre écrit sous le point d'interrogation ?<br>\n" +
        mathalea2d(
          Object.assign(
            { scale: 0.6, center: !context.isHtml },
            fixeBordures([d]),
          ),
          d,
        ) +
        '\n'
      : `Complète \\\\ ${sortie.canReponseACompleter}`
    // texte += context.isHtml ? '' : '\\\\\\smallskip'
    sortie.texteCorr = `Le nombre écrit sous le point d'interrogation est : $${miseEnEvidence(a)}$.`
    sortie.canEnonce = 'Complète.'
    return sortie
  }

  /**
   * Méthode pour déterminer un terme décimal inconnu
   * @returns {object}
   */
  trouverUnTermeDecimalInconnu() {
    const sortie = {
      texte: '',
      texteCorr: '',
      reponse: '0',
      canEnonce: '',
      canReponseACompleter: '',
    }
    const a = randint(1, 9) / 10
    const b = randint(1, 9) + a
    const res = choice([10, 20])
    sortie.reponse = texNombre(res - b, 1)
    sortie.texte = `Complète : ${sp(3)}
    $${texNombre(b, 1)}+\\ldots =${res}$ `
    sortie.texteCorr = `Le nombre cherché est donné par : $${res}-${texNombre(b, 1)}=${miseEnEvidence(sortie.reponse)}$.`
    // sortie.reponse = a
    sortie.canEnonce = 'Complète.'
    sortie.canReponseACompleter = `$${texNombre(b, 1)}+\\ldots =${res}$`
    return sortie
  }

  /**
   * Méthode pour décomposer un nombre à 3 chiffres en ... dizaines et ... unités
   * @returns {object}
   */
  decomposerUnNombreATroisChiffresEnDizainesUnites() {
    const sortie: {
      texte: string
      texteCorr: string
      reponse: string[] | string
      canEnonce: string
      canReponseACompleter: string
    } = {
      texte: '',
      texteCorr: '',
      reponse: '0',
      canEnonce: '',
      canReponseACompleter: '',
    }
    const nombreDeDizaines = randint(10, 99)
    const nombreDUnites = randint(2, 9)
    const nombre = 10 * nombreDeDizaines + nombreDUnites
    sortie.reponse = [`${nombreDeDizaines};${nombreDUnites}`]
    sortie.texte = `Complète : ${sp(3)}
    $${texNombre(nombre, 0)}= \\ldots$ dizaines  $\\ldots$  unités`
    sortie.texteCorr = `$${texNombre(nombre, 0)} = ${miseEnEvidence(texNombre(nombreDeDizaines, 0))}$ dizaines $${miseEnEvidence(texNombre(nombreDUnites, 0))}$ unités`
    sortie.canEnonce = 'Complète.'
    sortie.canReponseACompleter = `$${texNombre(nombre, 0)}= \\ldots$  dizaines $\\ldots$  unités  `
    return sortie
  }

  /**
   * Méthode pour déterminer une fraction à partir d'une figure
   * @returns {object}
   */
  determinerUneFractionAPartirDUneFigure() {
    const sortie = {
      texte: '',
      texteCorr: '',
      reponse: '0',
      canEnonce: '',
      canReponseACompleter: '',
    }
    const b = randint(2, 4)
    const a = randint(b + 1, 6)
    const c = randint(1, a - 1)
    const d = randint(1, b)
    const e = randint(0, c - 1)
    const f = randint(d, b)
    const A = polygone(
      [
        pointAbstrait(0, 0),
        pointAbstrait(c, 0),
        pointAbstrait(c, d),
        pointAbstrait(e, d),
        pointAbstrait(e, f),
        pointAbstrait(0, f),
      ],
      'black',
    )
    A.couleurDeRemplissage = colorToLatexOrHTML('lightgray')
    const C = grille(0, 0, a, b, 'black', 1, 1, 0)
    // const D = pointAbstrait(1 + a, 4 - b)
    sortie.texte = `Quelle fraction de la surface totale représente la surface grisée ?
    <br>`
    sortie.texte += mathalea2d(
      {
        xmin: -0.5,
        ymin: -0.1,
        xmax: 6.1,
        ymax: b + 0.5,
        scale: 0.7,
        center: !context.isHtml,
      },
      A,
      C,
    )
    sortie.texteCorr = `Il y a $${c * d + e * f - e * d}$ ${c * d + e * f - e * d > 1 ? 'carrés' : 'carré'} gris sur un total de $${a * b}$ carrés, la surface grisée représente donc $${miseEnEvidence(`\\dfrac{${c * d + e * f - e * d}}{${a * b}}`)}$ de la surface totale.`
    sortie.reponse = new FractionEtendue(
      c * d + e * f - e * d,
      a * b,
    ).texFraction
    sortie.canEnonce = sortie.texte
    sortie.canReponseACompleter = ''
    return sortie
  }

  /**
   * Méthode pour déterminer un quotient
   * @returns {object}
   */
  determinerUnQuotient() {
    const sortie = {
      texte: '',
      texteCorr: '',
      reponse: '0',
      canEnonce: '',
      canReponseACompleter: '',
    }
    const a = randint(5, 9)
    const b = randint(4, 9)
    const c = a * b
    sortie.reponse = b.toString()
    sortie.texte = `$${c}\\div ${a}$`
    sortie.texteCorr = `$${c}\\div ${a}=${miseEnEvidence(sortie.reponse)}$`
    sortie.canEnonce = 'Complète.'
    sortie.canReponseACompleter = `$${c}\\div ${a} =\\ldots$`
    return sortie
  }

  /**
   * Méthode pour un calcul de proportionnalité par addition
   * @param {string} type type d'énoncé
   * @returns {object}
   */
  proportionnaliteParAddition(type: 'pieces' | 'cahiers') {
    const sortie = {
      texte: '',
      texteCorr: '',
      reponse: '0',
      canEnonce: '',
      canReponseACompleter: '',
      uniteInteractif: '',
    }
    let a, b, k
    switch (type) {
      case 'pieces':
        a = choice([4, 6, 8, 10, 12, 14])
        b = a + a / 2
        sortie.reponse = (2 * b).toFixed(0)
        sortie.texte = `Si une pile de $${a}$ pièces de monnaie a une hauteur de $${2 * a}\\text{ mm}$, alors une pile de $${texNombre(b, 0)}$ pièces a une hauteur de `
        sortie.texteCorr = `Une pile de $${a}$ pièces de monnaie a une hauteur de $2\\times ${a}=${2 * a}\\text{ mm}$.<br>
        Donc une pile de  $${texNombre(b, 0)}$ pièces aura une hauteur de $2\\times ${b}=${miseEnEvidence(2 * b)}\\text{ mm}$.`
        sortie.canEnonce = `Si une pile de $${a}$ pièces de monnaie a une hauteur de $\\Lg[mm]{${2 * a}}$, `
        sortie.canReponseACompleter = `alors une pile de $${texNombre(b, 0)}$ pièces a une hauteur de $\\ldots$ \\Lg[mm]{}.`
        sortie.uniteInteractif = '$\\text{mm}$'
        break
      case 'cahiers':
        a = randint(2, 6)
        k = randint(2, 4)
        b = k * a
        sortie.reponse = String(k * b)
        sortie.texte = `Si $${a}$ cahiers coûtent $${b}$ €, alors $${b}$ cahiers coûtent `
        sortie.texteCorr = `$${a}$ cahiers coûtent $${b}$ €.<br> $${k}\\times${a}=${k * a}$ cahiers coûtent $${k}\\times${b}=${miseEnEvidence(k * b)}$ €.`
        sortie.canEnonce = `Si $${a}$ cahiers coûtent $\\Prix[0]{${b}}$,`
        sortie.canReponseACompleter = `alors $${b}$ cahiers coûtent $\\ldots$ \\Prix[0]{}.`
        sortie.uniteInteractif = '€'
        break
    }
    return sortie
  }

  /**
   * Méthode pour déterminer une longueur en unité de longueur donnée
   * @returns {object}
   */
  determinerUnNombreDUnitesDeLongueur() {
    const sortie = {
      texte: '',
      texteCorr: '',
      reponse: '0',
      canEnonce: '',
      canReponseACompleter: '',
    }
    let a,
      b,
      A,
      B,
      C,
      D,
      E,
      G,
      H,
      s1,
      s2,
      s3,
      s4,
      s5,
      xmin,
      ymin,
      xmax,
      ymax,
      objets
    const choix = choice(['a', 'b', 'c']) //, 'b', 'd', 'e'
    sortie.texte = 'Quelle est la longueur de la ligne en pointillé ? <br>'
    if (choix === 'a') {
      a = grille(-2, 0, 7, 4, 'gray', 1, 1)
      b = choice([3, 4, 5, 6])
      A = pointAbstrait(0, 2, 'A', 'below')
      B = pointAbstrait(1, 2, 'B', 'below')
      C = pointAbstrait(1, 1, 'C', 'above')
      G = pointAbstrait(0, 4, 'C', 'above')
      H = pointAbstrait(b, 4, 'D', 'above')
      s1 = segmentAvecExtremites(G, H)
      s1.epaisseur = 2
      s2 = segment(A, B)
      s2.pointilles = 2
      s2.epaisseur = 2

      s3 = segment(B, C)
      s3.pointilles = 2
      s3.epaisseur = 2
      xmin = -1
      ymin = -0.2
      xmax = 7
      ymax = 5
      objets = []
      objets.push(
        texteParPosition(
          '1 ul',
          milieu(G, H).x,
          milieu(G, H).y + 0.7,
          0,
          'black',
          context.isHtml ? 1 : 0.7,
        ),
        a,
        s1,
        s2,
        s3,
      )
      sortie.reponse = new FractionEtendue(2, b).texFraction
      sortie.texte +=
        mathalea2d(
          {
            xmin,
            ymin,
            xmax,
            ymax,
            pixelsParCm: 20,
            mainlevee: false,
            amplitude: 0.5,
            scale: 0.5,
            center: !context.isHtml,
          },
          objets,
        ) + '<br>'
      sortie.texteCorr = `Une unité correspond à $${b}$ carreaux, la ligne en pointillé mesure $2$ carreaux, soit $${miseEnEvidence(`\\dfrac{2}{${b}}`)}$ ul.`
    }
    if (choix === 'b') {
      a = grille(-2, 0, 7, 4, 'gray', 1, 1)
      b = choice([2, 4, 5, 6])
      A = pointAbstrait(0, 2, 'A', 'below')
      B = pointAbstrait(1, 2, 'B', 'below')
      C = pointAbstrait(1, 1, 'C', 'above')
      D = pointAbstrait(2, 1, 'C', 'above')
      G = pointAbstrait(0, 4, 'C', 'above')
      H = pointAbstrait(b, 4, 'D', 'above')
      s1 = segmentAvecExtremites(G, H)
      s1.epaisseur = 2
      s2 = segment(A, B)
      s2.pointilles = 2
      s2.epaisseur = 2

      s3 = segment(B, C)
      s3.pointilles = 2
      s3.epaisseur = 2
      s4 = segment(D, C)
      s4.pointilles = 2
      s4.epaisseur = 2
      xmin = -1
      ymin = -0.2
      xmax = 7
      ymax = 5
      objets = []
      objets.push(
        texteParPosition(
          '1 ul',
          milieu(G, H).x,
          milieu(G, H).y + 0.7,
          0,
          'black',
          context.isHtml ? 1 : 0.7,
        ),
        a,
        s1,
        s2,
        s3,
        s4,
      )
      sortie.reponse = new FractionEtendue(3, b).texFraction
      sortie.texte +=
        mathalea2d(
          {
            xmin,
            ymin,
            xmax,
            ymax,
            pixelsParCm: 20,
            mainlevee: false,
            amplitude: 0.5,
            scale: 0.5,
            center: !context.isHtml,
          },
          objets,
        ) + '<br>'
      sortie.texteCorr = `Une unité correspond à $${b}$ carreaux, la ligne en pointillé mesure $3$ carreaux, soit $${miseEnEvidence(`\\dfrac{3}{${b}}`)}$ ul `
    }
    if (choix === 'c') {
      a = grille(-2, 0, 7, 4, 'gray', 1, 1)
      b = choice([3, 5, 6])
      A = pointAbstrait(0, 2, 'A', 'below')
      B = pointAbstrait(1, 2, 'B', 'below')
      C = pointAbstrait(1, 1, 'C', 'above')
      D = pointAbstrait(2, 1, 'C', 'above')
      E = pointAbstrait(2, 2, 'C', 'above')
      G = pointAbstrait(0, 4, 'C', 'above')
      H = pointAbstrait(b, 4, 'D', 'above')
      s1 = segmentAvecExtremites(G, H)
      s1.epaisseur = 2
      s2 = segment(A, B)
      s2.pointilles = 2
      s2.epaisseur = 2

      s3 = segment(B, C)
      s3.pointilles = 2
      s3.epaisseur = 2
      s4 = segment(D, C)
      s4.pointilles = 2
      s4.epaisseur = 2
      s5 = segment(D, E)
      s5.pointilles = 2
      s5.epaisseur = 2
      xmin = -1
      ymin = -0.2
      xmax = 7
      ymax = 5
      objets = []
      objets.push(
        texteParPosition(
          '1 ul',
          milieu(G, H).x,
          milieu(G, H).y + 0.7,
          0,
          'black',
          context.isHtml ? 1 : 0.7,
        ),
        a,
        s1,
        s2,
        s3,
        s4,
        s5,
      )
      sortie.reponse = new FractionEtendue(4, b).texFraction
      sortie.texte +=
        mathalea2d(
          {
            xmin,
            ymin,
            xmax,
            ymax,
            pixelsParCm: 20,
            mainlevee: false,
            amplitude: 0.5,
            scale: 0.5,
            center: !context.isHtml,
          },
          objets,
        ) + '<br>'
      sortie.texteCorr = `Une unité correspond à $${b}$ carreaux, la ligne en pointillé mesure $4$ carreaux, soit $${miseEnEvidence(`\\dfrac{4}{${b}}`)}$ ul `
    }
    sortie.canEnonce = sortie.texte
    sortie.canReponseACompleter = '$\\ldots$ ul'
    return sortie
  }

  /**
   * Méthode pour multiplier par 5
   * @returns {object}
   */
  multiplierParCinq() {
    const sortie = {
      texte: '',
      texteCorr: '',
      reponse: '0',
      canEnonce: '',
      canReponseACompleter: '',
    }
    const a = randint(11, 99, [20, 30, 40, 50, 60, 70, 80, 90])
    const b = 5 // randint(2, 7) * 100

    sortie.reponse = String(a * b)
    sortie.texte = ` $${a}\\times ${b}$`
    sortie.texteCorr = `$${a}\\times ${b}=${a}\\times 10 \\div 2=${a * 10}\\div 2=${miseEnEvidence(sortie.reponse)}$`
    sortie.canEnonce = 'Complète.'
    sortie.canReponseACompleter = `$${a}\\times ${b} =\\ldots$`
    return sortie
  }

  /**
   * Méthode pour choisir une vitesse commune
   * @returns {object}
   */
  vitesseCommune() {
    const sortie = {
      diviseurDeLHeure: 0,
      vitesse: 0,
      nombreDeMinutes: 0,
    }
    sortie.diviseurDeLHeure = choice([2, 4]) // diviseur de l'heure
    if (sortie.diviseurDeLHeure === 4) {
      sortie.vitesse = choice([40, 80, 100])
      sortie.nombreDeMinutes = 15
    } else {
      sortie.vitesse = choice([30, 60, 90, 120])
      sortie.nombreDeMinutes = 30
    }
    return sortie
  }

  /**
   * Méthode pour proportionnalité et vitesse
   * @param {string} type premiere ou seconde question
   * @param {object} vitesseCommune éléments communs à deux questions liées
   * @returns {object}
   */
  proportionnaliteEtVitesse(
    type: 'premiere' | 'seconde',
    vitesseCommune: {
      diviseurDeLHeure: number
      vitesse: number
      nombreDeMinutes: number
    },
  ) {
    const sortie = {
      texte: '',
      texteCorr: '',
      reponse: '0',
      canEnonce: '',
      canReponseACompleter: '',
    }
    switch (type) {
      case 'premiere':
        sortie.reponse = texNombre(
          vitesseCommune.vitesse / vitesseCommune.diviseurDeLHeure,
          2,
        )
        sortie.texte = `Une voiture roule à $${vitesseCommune.vitesse}\\text{ km/h}$ à vitesse constante. <br>Combien de kilomètres parcourt-elle en $${vitesseCommune.nombreDeMinutes}\\text{ min}$ à cette vitesse ?`
        sortie.texteCorr = `En $1\\text{ h}$, la voiture parcourt $${vitesseCommune.vitesse}\\text{ km}$.<br>
        En $${vitesseCommune.nombreDeMinutes}$ minutes, elle parcourt $${vitesseCommune.diviseurDeLHeure}$ fois moins de $\\text{km}$ qu'en $1\\text{ h}$, soit $\\dfrac{${vitesseCommune.vitesse}}{${vitesseCommune.diviseurDeLHeure}}=
        ${miseEnEvidence(texNombre(vitesseCommune.vitesse / vitesseCommune.diviseurDeLHeure, 2))}\\text{ km}$.`
        sortie.canReponseACompleter = `Elle parcourt $\\ldots$ \\Lg[km]{} en $${vitesseCommune.nombreDeMinutes}\\text{ min}$ à cette vitesse.`
        break
      case 'seconde':
        {
          const d = randint(1, 3)
          sortie.reponse = String(
            d * vitesseCommune.vitesse +
              (vitesseCommune.nombreDeMinutes / 60) * vitesseCommune.vitesse,
          )
          sortie.texte = `Une voiture roule à $${vitesseCommune.vitesse}\\text{ km/h}$ à vitesse constante.<br> Combien de kilomètres parcourt-elle en $${d}\\text{ h}$ et $${vitesseCommune.nombreDeMinutes}\\text{ min}$ à cette vitesse ?`
          sortie.texteCorr = `En $${d}\\text{ h}$, elle parcourt $${d * vitesseCommune.vitesse}\\text{ km}$.<br>
        En $${vitesseCommune.nombreDeMinutes}\\text{ min}$, elle parcourt $${texNombre((vitesseCommune.nombreDeMinutes / 60) * vitesseCommune.vitesse, 2)}\\text{ km}$.<br>
        Ainsi, en $${d}\\text{ h}$ et $${vitesseCommune.nombreDeMinutes}\\text{ min}$, elle parcourt donc $${miseEnEvidence(sortie.reponse)}\\text{ km}$.`
          sortie.canReponseACompleter = `Elle parcourt $\\ldots$ \\Lg[km]{} en $${d}\\text{ h}$ et $${vitesseCommune.nombreDeMinutes}\\text{ min}$ à cette vitesse.`
        }
        break
    }
    sortie.canEnonce = `Une voiture roule à la vitesse constante de $${vitesseCommune.vitesse}\\text{ km/h}$.`
    return sortie
  }

  /**
   * Méthode pour travailler la question clef de la division
   * @returns {object}
   */
  dansNCombienDeFoisP() {
    const sortie = {
      texte: '',
      texteCorr: '',
      reponse: '0',
      canEnonce: '',
      canReponseACompleter: '',
    }
    const a = randint(3, 9)
    const b = randint(3, 9)
    const c = a * b

    sortie.reponse = b.toString()
    sortie.texte = `Dans $${c}$ combien de fois $${a}$ ?`
    sortie.texteCorr = `Dans $${c}$, il y a $${miseEnEvidence(b)}$ fois $${a}$ car $${b}\\times ${a}=${c}$.`
    sortie.canEnonce = sortie.texte
    sortie.canReponseACompleter = ''
    return sortie
  }

  /**
   * Méthode pour décomposer un nombre à 3 chiffres en ... dizaines et ... unités
   * @returns {object}
   */
  determinerUnNombreDeDizainesDansUnEntierATroisChiffres() {
    const sortie = {
      texte: '',
      texteCorr: '',
      reponse: '0',
      canEnonce: '',
      canReponseACompleter: '',
    }
    const nombreDeDizaines = randint(1, 9)
    const nombreDeCentaines = randint(1, 9)
    const nombre = 100 * nombreDeCentaines + 10 * nombreDeDizaines
    const accordDizaine = nombreDeDizaines === 1 ? 'dizaine' : 'dizaines'
    const accordCentaine = nombreDeCentaines === 1 ? 'centaine' : 'centaines'
    sortie.reponse = nombreDeDizaines.toString()
    sortie.texte = `Complète : ${sp(3)}
    $${texNombre(nombreDeCentaines, 0)}$ ${accordCentaine} et  $\\ldots$  ${accordDizaine} font  $${nombre}$.`
    sortie.texteCorr = `$${texNombre(nombre, 0)} = ${texNombre(nombreDeCentaines, 0)}$ centaines et $${miseEnEvidence(texNombre(nombreDeDizaines, 0))}$ dizaines`
    sortie.canEnonce = 'Complète.'
    sortie.canReponseACompleter = `$${texNombre(nombreDeCentaines, 0)}$ ${accordCentaine} et  $\\ldots$  ${accordDizaine} font  $${nombre}$.`
    return sortie
  }

  /**
   * Méthode pour tracer une figure d'aire donnée en fonction d'une unité d'aire
   * @param {string} niveau Pour pouvoir être utilisé en 6e et en cm2
   * @returns {object}
   */
  tracerUneFigureAireDonneeEnFonctionUniteAire(niveau: 'cm2' | '6e') {
    const sortie = {
      texte: '',
      texteCorr: '',
      reponse: '0',
      canEnonce: '',
      canReponseACompleter: '',
    }
    let f, prenom1, a, A, B, C
    let nombreDUnitesDAire
    const choix = choice([true, false])
    switch (niveau) {
      case 'cm2':
        f = [
          [1, 1],
          [2, 1],
          [3, 1],
          [4, 1],
          [5, 1],
          [6, 1],
          [7, 1],
          [8, 1],
        ]
        a = randint(0, 7)
        // b = randint(2, 4)
        nombreDUnitesDAire = f[a][0]
        break
      case '6e':
        if (choix) {
          f = [
            [3, 5],
            [6, 5],
            [7, 5],
            [8, 5],
            [3, 2],
            [5, 2],
            [9, 5],
            [7, 2],
          ]
          a = randint(0, 7)
          // b = randint(2, 4)
        } else {
          f = [
            [5, 4],
            [7, 4],
            [3, 2],
            [5, 2],
            [7, 2],
            [3, 4],
            [9, 4],
          ]
          a = randint(0, 6)
          // b = randint(2, 4)
        }
        nombreDUnitesDAire = `$\\dfrac{${f[a][0]}}{${f[a][1]}}$`
        break
    }
    if (choix) {
      prenom1 = prenomF()
      A = polygone(
        [
          pointAbstrait(1, 5),
          pointAbstrait(11, 5),
          pointAbstrait(11, 4),
          pointAbstrait(1, 4),
        ],
        'black',
      )
      A.couleurDeRemplissage = colorToLatexOrHTML('lightgray')
      B = texteParPosition('1 uA', 6, 4.5, 0, 'black', 1, 'milieu', false)
      C = grille(0, 0, 12, 5, 'black', 1, 1, 0)
      // D = pointAbstrait(1 + a, 4 - b)

      sortie.texte = `${prenom1} veut construire une figure d'aire $${nombreDUnitesDAire}$ ${f[a][0] / f[a][1] >= 2 ? 'unités' : 'unité'} d'aire (uA).<br>
      Combien de petits carreaux doit-elle contenir ?<br>`

      sortie.texte += mathalea2d(
        {
          xmin: -1,
          ymin: -0.1,
          xmax: 12.1,
          ymax: 5.5,
          scale: 1,
          center: !context.isHtml,
        },
        C,
        A,
        B,
      )
      sortie.texteCorr = '$1$ uA est représentée par $10$ petits carreaux. <br>'
      sortie.texteCorr +=
        f[a][1] === 1
          ? ''
          : `$\\dfrac{1}{${f[a][1]}}$ d'unité d'aire est donc représentée par $${texNombre(10 / f[a][1], 0)}$ petits carreaux. <br>`
      sortie.texteCorr += `Ainsi, une figure de $${nombreDUnitesDAire}$ ${f[a][0] / f[a][1] >= 2 ? 'unités' : 'unité'} d'aire se représente par une figure de $${miseEnEvidence(texNombre((10 / f[a][1]) * f[a][0], 0))}$ petits carreaux.`
      sortie.reponse = texNombre((10 / f[a][1]) * f[a][0], 2)
    } else {
      prenom1 = prenomF()
      A = polygone(
        [
          pointAbstrait(1, 5),
          pointAbstrait(3, 5),
          pointAbstrait(3, 3),
          pointAbstrait(1, 3),
        ],
        'black',
      )
      A.couleurDeRemplissage = colorToLatexOrHTML('lightgray')
      B = texteParPosition('1 uA', 2, 5.4, 0, 'black', 1, 'milieu', false)
      C = grille(0, 0, 12, 5, 'black', 1, 1, 0)

      sortie.texte = `${prenom1} veut construire une figure d'aire $${nombreDUnitesDAire}$ ${f[a][0] / f[a][1] >= 2 ? 'unités' : 'unité'} d'aire (uA).<br>
    
      Combien de petits carreaux doit-elle contenir ?<br>

    `
      sortie.texte += mathalea2d(
        {
          xmin: -1,
          ymin: -0.1,
          xmax: 12.1,
          ymax: 6,
          scale: 1,
          center: !context.isHtml,
        },
        A,
        C,
        B,
      )
      if (f[a][1] === 4) {
        sortie.texteCorr =
          '$1$ uA est représentée par  $4$ petits carreaux. <br>'
        sortie.texteCorr +=
          f[a][1] === 1
            ? ''
            : `$\\dfrac{1}{${f[a][1]}}$ d'unité d'aire est donc rerésenté par un petit carreau.<br>`
        sortie.texteCorr += `Ainsi, une figure de $${nombreDUnitesDAire}$ ${f[a][0] / f[a][1] >= 2 ? 'unités' : 'unité'} d'aire se représente par une figure de  `
        sortie.texteCorr +=
          f[a][1] === 1
            ? `$${miseEnEvidence(4 * f[a][0])}$`
            : `$${miseEnEvidence(f[a][0])}$`
        sortie.texteCorr += ' petits carreaux.'
        sortie.reponse = String(f[a][1] === 1 ? 4 * f[a][0] : f[a][0])
      } else {
        sortie.texteCorr =
          '$1$ uA est représentée par $4$ petits carreaux. <br>'
        sortie.texteCorr +=
          f[a][1] === 1
            ? ''
            : `$\\dfrac{1}{${f[a][1]}}$ d'unité d'aire est donc rerésenté par deux petits carreaux.<br>`
        sortie.texteCorr += `Ainsi, une figure de $${nombreDUnitesDAire}$ ${f[a][0] / f[a][1] >= 2 ? 'unités' : 'unité'} d'aire se représente par une figure de `
        sortie.texteCorr +=
          f[a][1] === 1
            ? `$${miseEnEvidence(4 * f[a][0])}$`
            : `$${miseEnEvidence(2 * f[a][0])}$`
        sortie.texteCorr += ' petits carreaux.'
        sortie.reponse = String(f[a][1] === 1 ? 4 * f[a][0] : 2 * f[a][0])
      }
    }
    sortie.canEnonce =
      `${prenom1} veut construire une figure d'aire \\\\ ${nombreDUnitesDAire} ${f[a][0] / f[a][1] > 2 ? 'unités' : 'unité'} d'aire (uA).<br>` +
      mathalea2d(
        { xmin: -1, ymin: -0.1, xmax: 12.1, ymax: 6, scale: 0.3 },
        A,
        C,
        B,
      )
    sortie.canReponseACompleter =
      'La figure doit contenir $\\ldots$ petits carreaux.'
    return sortie
  }

  /**
   * Méthode pour déterminer le nombre de dixièmes dans un décimal
   * @returns {object}
   */
  nombreDeDixiemesDansUnDecimal() {
    const sortie = {
      texte: '',
      texteCorr: '',
      reponse: '0',
      canEnonce: '',
      canReponseACompleter: '',
      nombre: 0,
    }
    const unites = randint(1, 9)
    const dixiemes = randint(1, 9) / 10
    const centiemes = randint(1, 9) / 100
    sortie.nombre = unites + dixiemes + centiemes
    sortie.reponse = String((unites + dixiemes) * 10)
    sortie.texte = `Combien de dixièmes y a-t-il en tout dans $${texNombre(sortie.nombre, 2)}$ ?`
    sortie.texteCorr = `$${texNombre(sortie.nombre, 2)} = ${texNombre(unites, 0)}$ ${unites === 1 ? 'unité' : 'unités'} $${texNombre(dixiemes * 10, 0)}$ ${egal(dixiemes * 10, 1) ? 'dixième' : 'dixièmes'} $${texNombre(centiemes * 100, 0)}$ ${egal(centiemes * 100, 1) ? 'centième' : 'centièmes'}.<br>`
    sortie.texteCorr += `Or $1$ unité = $10$ dixièmes donc $${texNombre(unites, 0)}$ ${unites === 1 ? 'unité' : 'unités'} $= ${texNombre(unites * 10, 0)}$ dixièmes.<br>`
    sortie.texteCorr += `Finalement $${texNombre(sortie.nombre, 2)} = ${texNombre((unites + dixiemes) * 10, 0)}$ dixièmes $${texNombre(centiemes * 100, 0)}$ ${egal(centiemes * 100, 1) ? 'centième' : 'centièmes'}.<br>`
    sortie.texteCorr += `Il y a donc $${miseEnEvidence(sortie.reponse)}$ dixièmes en tout dans $${texNombre(sortie.nombre, 2)}$.`
    sortie.canEnonce = `Combien de dixièmes y a-t-il en tout \\\\ dans $${texNombre(sortie.nombre, 2)}$ ?`
    sortie.canReponseACompleter = '\\dots{} dixièmes'
    return sortie
  }

  /**
   * Méthode pour déterminer le prix d'un diviseur d'une quantité donnée
   * @param {string} type pour le type d'énoncé
   * @returns {object}
   */
  proportionnaliteEtDiviseur(type: 'stylos' | 'cahiers') {
    const sortie = {
      texte: '',
      texteCorr: '',
      reponse: '0',
      canEnonce: '',
      canReponseACompleter: '',
    }
    let a, prix, k
    switch (type) {
      case 'stylos':
        a = randint(2, 6)
        prix = 2 + randint(1, 3) / 10 + 0.05
        k = randint(2, 4)
        sortie.reponse = String(prix * 100 * k)
        sortie.texte = `$${a}$ stylos identiques coûtent  $${texPrix(prix)}$ €. <br>
Combien coûtent $${k * a}$ de ces mêmes stylos ?`
        sortie.texteCorr = `$${a}$ stylos identiques coûtent  $${texPrix(prix)}$ €, donc $${k * a}$ de ces mêmes stylos coûtent  $${k}$ fois plus, soit $${k}\\times ${texPrix(prix)}=${texPrix(k * prix)}$ € $=${miseEnEvidence(texNombre(k * prix * 100))}$ centimes.`
        break
      case 'cahiers':
        prix = choice([1.2, 1.8, 2.4])
        k = randint(3, 4)
        sortie.reponse = String((100 * prix) / k)
        sortie.texte = `$${k * 2}$ cahiers coûtent  $${texPrix(prix)}$ €. <br>
Combien coûtent $2$ cahiers ?`
        sortie.texteCorr = `$${k * 2}$ cahiers coûtent  $${texPrix(prix)}$ €, donc $2$ de ces mêmes cahiers coûtent  $${k}$ fois moins, soit $ ${texPrix(prix)}\\div${k}=${texPrix(prix / k)}$ € $=${miseEnEvidence(texNombre((100 * prix) / k, 0))}$ centimes.`
        break
    }
    sortie.canEnonce = sortie.texte
    sortie.canReponseACompleter = '$\\ldots$ centimes'
    return sortie
  }

  /**
   * Méthode pour trouver une dimension agrandie ou réduite
   * @param {string} type pour le type d'énoncé
   * @returns {object}
   */
  trouverUneDimensionAgrandieOuReduite(type: 'agrandissement' | 'reduction') {
    const sortie = {
      texte: '',
      texteCorr: '',
      reponse: '0',
      canEnonce: '',
      canReponseACompleter: '',
    }
    let l,
      k,
      L,
      l2,
      A,
      B,
      C,
      D,
      E,
      F,
      G,
      H,
      xmin,
      ymin,
      xmax,
      ymax,
      pol,
      pol2,
      objets
    switch (type) {
      case 'agrandissement':
        l = randint(2, 8)
        k = randint(2, 4)
        L = k * l
        l2 = l + randint(1, 3)
        A = pointAbstrait(0, 0)
        B = pointAbstrait(4, 0)
        C = pointAbstrait(4, 1.5)
        D = pointAbstrait(0, 1.5)
        E = pointAbstrait(5, 0)
        F = pointAbstrait(7.5, 0)
        G = pointAbstrait(7.5, 1)
        H = pointAbstrait(5, 1)
        xmin = -1.5
        ymin = -0.5
        xmax = 9.2
        ymax = 2
        pol = polygoneAvecNom(A, B, C, D)
        pol2 = polygoneAvecNom(E, F, G, H)

        // segment((i + 1) * 2, -0.1, (i + 1) * 2, 0.1)

        objets = []
        objets.push(pol[0]) //, pol[1]
        objets.push(pol2[0])
        objets.push(
          texteParPosition(
            `${stringNombre(l)} cm`,
            milieu(F, G).x + 0.7,
            milieu(F, G).y,
            0,
            'black',
            context.isHtml ? 1 : 0.7,
          ),
          texteParPosition(
            `${stringNombre(L)} cm`,
            milieu(E, F).x,
            milieu(E, F).y - 0.3,
            0,
            'black',
            context.isHtml ? 1 : 0.7,
          ),
          texteParPosition(
            `${stringNombre(l2)} cm`,
            milieu(A, D).x - 0.6,
            milieu(A, D).y,
            0,
            'black',
            context.isHtml ? 1 : 0.7,
          ),
          texteParPosition('A ', milieu(F, G).x - 1.2, milieu(F, G).y),
          texteParPosition('B ', milieu(B, C).x - 2, milieu(B, C).y),
        )
        sortie.reponse = String(l2 * k)
        sortie.texte = `Le rectangle B est un agrandissement du rectangle A.${context.isHtml ? '' : '\\\\'} Quelle est la longueur du rectangle B ?<br>`
        sortie.texte += mathalea2d(
          {
            xmin,
            ymin,
            xmax,
            ymax,
            pixelsParCm: 40,
            mainlevee: false,
            amplitude: 0.5,
            scale: 0.7,
            center: !context.isHtml,
          },
          objets,
        )
        sortie.texteCorr = `La longueur du rectangle A est $${k}$ fois plus grande que sa largeur. On en déduit que la longueur du rectangle B est aussi $${k}$ fois plus grande que sa largeur.<br>
Elle est donc égale à $${l2}\\times ${k}=${miseEnEvidence(sortie.reponse)}\\text{ cm}$.`
        break
      case 'reduction':
        L = randint(3, 5) * 2 // Longueur grand rectngle
        l = randint(2, 5) // Largeur grand rectngle
        k = L - randint(1, 2)
        // L = k * l
        l2 = L / 2 // long petit
        A = pointAbstrait(0, 0)
        B = pointAbstrait(2.5, 0)
        C = pointAbstrait(2.5, 1)
        D = pointAbstrait(0, 1)
        E = pointAbstrait(3, 0)
        F = pointAbstrait(7, 0)
        G = pointAbstrait(7, 2)
        H = pointAbstrait(3, 2)
        xmin = -1
        ymin = -0.5
        xmax = 8.5
        ymax = 2.5
        pol = polygoneAvecNom(A, B, C, D)
        pol2 = polygoneAvecNom(E, F, G, H)
        objets = []
        objets.push(pol[0]) //, pol[1]
        objets.push(pol2[0])
        objets.push(
          texteParPosition(
            `${stringNombre(l)} cm`,
            milieu(F, G).x + 0.7,
            milieu(F, G).y,
            0,
            'black',
            context.isHtml ? 1 : 0.7,
          ),
          texteParPosition(
            `${stringNombre(L)} cm`,
            milieu(E, F).x,
            milieu(E, F).y - 0.3,
            0,
            'black',
            context.isHtml ? 1 : 0.7,
          ),
          texteParPosition(
            `${stringNombre(l2)} cm`,
            milieu(A, B).x,
            milieu(A, B).y - 0.3,
            0,
            'black',
            context.isHtml ? 1 : 0.7,
          ),
          texteParPosition(
            'A ',
            milieu(E, F).x,
            milieu(F, G).y,
            0,
            'black',
            context.isHtml ? 1 : 0.7,
          ),
          texteParPosition(
            'B ',
            milieu(A, B).x,
            milieu(B, C).y,
            0,
            'black',
            context.isHtml ? 1 : 0.7,
          ),
        )
        sortie.reponse = texNombre(l / 2, 1)
        sortie.texte = `Le rectangle B est une réduction du rectangle A.${context.isHtml ? '' : '\\\\'} Quelle est la largeur du rectangle B ?<br>`
        sortie.texte += mathalea2d(
          {
            xmin,
            ymin,
            xmax,
            ymax,
            pixelsParCm: 40,
            mainlevee: false,
            amplitude: 0.5,
            scale: 0.7,
            center: !context.isHtml,
          },
          objets,
        )
        sortie.texteCorr = `La longueur du rectangle A est $2$ fois plus grande que la longueur du rectangle B. On en déduit que la largeur  du rectangle B est aussi $2$ fois plus petite que la largeur du rectangle A.<br>
Elle est donc égale à $${l}\\div 2=${miseEnEvidence(sortie.reponse)}\\text{ cm}$.
                        `
        break
    }
    sortie.canEnonce = sortie.texte
    sortie.canReponseACompleter = '$\\ldots$ \\Lg[cm]{}'
    return sortie
  }

  /**
   * Méthode pour ajouter deux décimaux
   * @returns {object}
   */
  ajouterDeuxDecimaux() {
    const sortie = {
      texte: '',
      texteCorr: '',
      reponse: '0',
      canEnonce: '',
      canReponseACompleter: '',
    }
    const a = randint(101, 199) / 100
    const b = randint(4, 9) / 10

    sortie.reponse = texNombre(a + b, 2)
    sortie.texte = `$${texNombre(a, 2)}+ ${texNombre(b, 1)}$`
    sortie.texteCorr = `$${texNombre(a, 2)}+ ${texNombre(b, 1)}=${miseEnEvidence(sortie.reponse)}$`
    sortie.canEnonce = sortie.texte
    sortie.canReponseACompleter = ''
    return sortie
  }

  /**
   * Méthode pour déterminer un nombre de combinaisons différentes
   * @param {string} type type entrée/plat, entrée/plat/dessert
   * @returns {object}
   */
  nombreDeCombinaisons(type: 'platDessert' | 'entreePlatDessert') {
    const sortie = {
      texte: '',
      texteCorr: '',
      reponse: '0',
      canEnonce: '',
      canReponseACompleter: '',
    }
    let a, b, c
    switch (type) {
      case 'entreePlatDessert':
        a = randint(2, 3)
        b = randint(2, 3)
        c = randint(2, 3)
        sortie.texte = `À la cantine, il y a toujours $${a}$ entrées différentes, $${b}$ plats différents et $${c}$ desserts différents.<br>
Combien de menus (composés d'une entrée, d'un plat et d'un dessert) différents peut-on avoir dans cette cantine ?`
        sortie.texteCorr = `On peut avoir : $${a}\\times ${b}\\times ${c} =${miseEnEvidence(a * b * c)}$ menus différents.`
        sortie.reponse = String(a * b * c)
        break
      case 'platDessert':
        a = randint(2, 5)
        b = randint(2, 5)
        sortie.texte = `En prenant un plat au choix parmi $${a}$ plats et un dessert au choix parmi $${b}$ desserts.<br>
Combien de repas différents peut-on réaliser ?  `
        sortie.texteCorr = `On peut avoir : $${a}\\times ${b}=${miseEnEvidence(a * b)}$ repas différents.`
        sortie.reponse = String(a * b)
        break
    }
    sortie.canEnonce = sortie.texte
    sortie.canReponseACompleter = '$\\ldots$ repas'
    return sortie
  }
}
