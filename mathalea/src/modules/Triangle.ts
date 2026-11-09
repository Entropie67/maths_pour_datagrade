import { choice } from '../lib/outils/arrayOutils'
import { egal } from './outils'

/**
 * @class
 * @classdesc Classe Triangles - Méthodes utiles pour les triangles *

 * @author Sébastien Lozano
 */

export class Triangle {
  /**
   * @param {number} l1 une des longueurs du triangle
   * @param {number} l2 une des longueurs du triangle
   * @param {number} l3 une des longueurs du triangle
   * @param {number} a1 un des angles du triangle
   * @param {number} a2 un des angles du triangle
   * @param {number} a3  un des angles du triangle
   */
  nom: string
  l1: number
  l2: number
  l3: number
  a1: number
  a2: number
  a3: number

  constructor(
    l1?: number,
    l2?: number,
    l3?: number,
    a1?: number,
    a2?: number,
    a3?: number,
  ) {
    this.nom = choice([
      'AGE',
      'AIL',
      'AIR',
      'ALU',
      'AME',
      'AMI',
      'ANE',
      'ARC',
      'BAC',
      'BAL',
      'BAR',
      'BEC',
      'BEL',
      'BIO',
      'BIP',
      'BIS',
      'BLE',
      'BOA',
      'BOF',
      'BOG',
      'BOL',
      'BUT',
      'BYE',
      'COQ',
      'CRI',
      'CRU',
      'DUC',
      'DUO',
      'DUR',
      'EAU',
      'ECU',
      'EGO',
      'EPI',
      'FER',
      'FIL',
      'FUN',
      'GPS',
      'ICE',
      'JET',
      'KIF',
      'KIR',
      'MAC',
      'NEM',
      'PAS',
      'PIC',
      'PIF',
      'PIN',
      'POT',
      'RAI',
      'RAP',
      'RAT',
      'RIF',
      'SEL',
      'TAF',
      'TIC',
      'TAC',
      'TOC',
      'TOP',
      'UNI',
      'WOK',
      'YAK',
      'YEN',
      'ZEN',
      'ZIG',
      'ZAG',
    ])
    this.l1 = l1 ?? 0
    this.l2 = l2 ?? 0
    this.l3 = l3 ?? 0
    this.a1 = a1 ?? 0
    this.a2 = a2 ?? 0
    this.a3 = a3 ?? 0
  }

  /**
   * @return {string} Renvoie le nom du triangle tiré au hasard
   * * les strings sont EN MODE MATHS le premier caractère du string est un $
   * @example si triangle est une instance de la classe Triangle() triangle.getNom() renvoie le string '$AMI$' si AMI est le nom tiré au hasard
   */
  getNom() {
    return '$' + this.nom + '$'
  }

  /**
   * @return {array} Renvoie un tableau contenant le nom des côtés, segments, du triangle tiré au hasard
   * * les strings sont EN MODE MATHS le premier caractère du string est un $
   * @example si triangle est une instance de la classe Triangle() triangle.getCotes() renvoie le tableau de strings ['$[AM]$','$[MI]$','$[IA]$'] dans cet ordre si AMI est le nom tiré au hasard
   */
  getCotes() {
    const cotes = []
    const triangle = this.nom
    const sommets = triangle.split('')
    cotes[0] = '$[' + sommets[0] + '' + sommets[1] + ']$'
    cotes[1] = '$[' + sommets[1] + '' + sommets[2] + ']$'
    cotes[2] = '$[' + sommets[2] + '' + sommets[0] + ']$'
    return cotes
  }

  /**
   * @return {array} Renvoie un tableau contenant le nom des longueurs des côtés du triangle tiré au hasard
   * * les strings sont EN MODE MATHS le premier caractère du string est un $
   * @example si triangle est une instance de la classe Triangle() triangle.getCotes() renvoie le tableau de strings ['$AM$','$MI$','$IA$'] dans cet ordre si AMI est le nom tiré au hasard
   */
  getLongueurs() {
    const longueurs = []
    const triangle = this.nom
    const sommets = triangle.split('')
    longueurs[0] = '$' + sommets[0] + '' + sommets[1] + '$'
    longueurs[1] = '$' + sommets[1] + '' + sommets[2] + '$'
    longueurs[2] = '$' + sommets[2] + '' + sommets[0] + '$'
    return longueurs
  }

  /**
   * @return {array} Renvoie un tableau avec les valeurs des longueurs des côtés du triangle passées en paramètre à l'instance de la classe
   */
  getLongueursValeurs() {
    if (
      typeof this.l1 === 'undefined' ||
      typeof this.l2 === 'undefined' ||
      typeof this.l3 === 'undefined'
    ) {
      // return false;
      return ["L'une des longueurs de l'objet triangle n'est pas définie"]
    }
    const longueurs = []
    longueurs[0] = this.l1
    longueurs[1] = this.l2
    longueurs[2] = this.l3

    return longueurs
  }

  /**
   * @return {array} Renvoie un tableau de strings avec les noms des angles du triangle.
   * * les strings sont EN MODE MATHS le premier caractère du string est un $
   */
  getAngles() {
    const angles = []
    const triangle = this.nom
    const sommets = triangle.split('')
    angles[0] = `$\\;\\widehat{${sommets[0] + sommets[1] + sommets[2]}}$`
    angles[1] = `$\\;\\widehat{${sommets[1] + sommets[2] + sommets[0]}}$`
    angles[2] = `$\\;\\widehat{${sommets[2] + sommets[0] + sommets[1]}}$`

    return angles
  }

  /**
   * @return {array} Renvoie un tableau avec les valeurs des angles du triangle passées en paramètre à l'instance de la classe
   */
  getAnglesValeurs() {
    if (
      typeof this.a1 === 'undefined' ||
      typeof this.a2 === 'undefined' ||
      typeof this.a3 === 'undefined'
    ) {
      // return false;
      return ["L'un des angles de l'objet triangle n'est pas définie"]
    }
    const angles = []
    angles[0] = this.a1
    angles[1] = this.a2
    angles[2] = this.a3

    return angles
  }

  /**
   * @return {array} Renvoie un tableau de strings avec les noms des sommets du triangle.
   * * les strings sont EN MODE MATHS le premier caractère du string est un $
   */
  getSommets(math = true) {
    const triangle = this.nom
    const sommets = triangle.split('')
    if (math === true) {
      sommets[0] = '$' + sommets[0] + '$'
      sommets[1] = '$' + sommets[1] + '$'
      sommets[2] = '$' + sommets[2] + '$'
    }
    return sommets
  }

  /**
   * @return {string} Renvoie un string avec les noms des sommets du triangle de la forme : '$A$, $B$ et $C$'
   */
  get stringSommets() {
    const [a, b, c] = this.getSommets()
    return `${a}, ${b} et ${c}`
  }

  /**
   * @return {array} Renvoie le périmètre de l'instance de la classe Triangle() avec les valeurs des longueurs des côtés du triangle passées en paramètre à l'instance
   * @example let triangle = new Triangle();
   * * triangle.l1 = 2;
   * * triangle.l2 = 3;
   * * triangle.l3 = 4
   * * triangle.getPerimetre() renvoie 9
   */
  getPerimetre() {
    if (
      typeof this.l1 === 'undefined' ||
      typeof this.l2 === 'undefined' ||
      typeof this.l3 === 'undefined'
    ) {
      // return false;
      return "L'une des longueurs de l'objet triangle n'est pas définie"
    } else {
      return this.l1 + this.l2 + this.l3
    }
  }

  /**
   * @return {array} Renvoie un booleen selon que les trois longueurs passées à l'instance de la classe forment un vrai triangle ou non
   * @example let triangle = new Triangle();
   * * triangle.l1 = 2;
   * * triangle.l2 = 3;
   * * triangle.l3 = 7
   * * triangle.isTrueTriangleLongueurs() renvoie false
   * @example let triangle = new Triangle();
   * * triangle.l1 = 2;
   * * triangle.l2 = 3;
   * * triangle.l3 = 4
   * * triangle.isTrueTriangleLongueurs() renvoie true
   */
  isTrueTriangleLongueurs() {
    if (
      typeof this.l1 === 'undefined' ||
      typeof this.l2 === 'undefined' ||
      typeof this.l3 === 'undefined'
    ) {
      return false
      // return 'L\'une des longueurs de l\'objet triangle n\'est pas définie';
    }
    const longueurs = [this.l1, this.l2, this.l3]
    longueurs.sort((a, b) => a - b)
    if (longueurs[2] < longueurs[0] + longueurs[1]) {
      return true
    } else {
      return false
    }
  }

  /**
   * @return {array} Renvoie un booleen selon que les trois longueurs passées à l'instance de la classe forment un triangle plat ou non
   * @example let triangle = new Triangle();
   * * triangle.l1 = 2;
   * * triangle.l2 = 3;
   * * triangle.l3 = 5
   * * triangle.isTrueTriangleLongueurs() renvoie true
   * @example let triangle = new Triangle();
   * * triangle.l1 = 2;
   * * triangle.l2 = 3;
   * * triangle.l3 = 4
   * * triangle.isTrueTriangleLongueurs() renvoie false
   */
  isPlatTriangleLongueurs() {
    if (
      typeof this.l1 === 'undefined' ||
      typeof this.l2 === 'undefined' ||
      typeof this.l3 === 'undefined'
    ) {
      // return 'L\'une des longueurs de l\'objet triangle n\'est pas définie';
      return false
    }
    const longueurs = [this.l1, this.l2, this.l3]
    longueurs.sort((a, b) => a - b)
    if (egal(longueurs[2], longueurs[0] + longueurs[1])) {
      return true
    } else {
      return false
    }
  }

  /**
   * @return {array} Renvoie un booleen selon que les trois angles passés à l'instance de la classe forment un vrai triangle ou non
   * @example let triangle = new Triangle();
   * * triangle.a1 = 100;
   * * triangle.a2 = 40;
   * * triangle.a3 = 50
   * * triangle.isTrueTriangleAngles() renvoie false
   * @example let triangle = new Triangle();
   * * triangle.a1 = 80;
   * * triangle.a2 = 40;
   * * triangle.a3 = 60
   * * triangle.isTrueTriangleAngles() renvoie true
   */
  isTrueTriangleAngles() {
    // si l'un des angles n'est pas defini ça ne va pas
    if (
      typeof this.a1 === 'undefined' ||
      typeof this.a2 === 'undefined' ||
      typeof this.a3 === 'undefined'
    ) {
      return false
      // return 'L\'une des longueurs de l\'objet triangle n\'est pas définie';
    }
    // si l'un des angles est négatif ça ne va pas
    if (this.a1 < 0 || this.a2 < 0 || this.a3 < 0) {
      return false
      // return 'L\'une des longueurs de l\'objet triangle n\'est pas définie';
    }
    if (this.a1 + this.a2 + this.a3 === 180) {
      if (
        (this.a1 === 0 && this.a2 === 0) ||
        (this.a2 === 0 && this.a3 === 0) ||
        (this.a3 === 0 && this.a1 === 0)
      ) {
        return false
      } else {
        return true
      }
    } else {
      return false
    }
  }

  // renvoie un booleen selon que les trois angles forment un triangle plat ou non
  /**
   * @return {array} Renvoie un booleen selon que les trois angles passés à l'instance de la classe forment un triangle plat ou non
   * @example let triangle = new Triangle();
   * * triangle.a1 = 0;
   * * triangle.a2 = 0;
   * * triangle.a3 = 180
   * * triangle.isTrueTriangleAngles() renvoie true
   * @example let triangle = new Triangle();
   * * triangle.a1 = 80;
   * * triangle.a2 = 40;
   * * triangle.a3 = 60
   * * triangle.isTrueTriangleAngles() renvoie false
   */
  isPlatTriangleAngles() {
    if (
      typeof this.a1 === 'undefined' ||
      typeof this.a2 === 'undefined' ||
      typeof this.a3 === 'undefined'
    ) {
      return false
      // return 'L\'une des longueurs de l\'objet triangle n\'est pas définie';
    }
    if (this.a1 + this.a2 + this.a3 === 180) {
      if (
        (this.a1 === 0 && this.a2 === 0) ||
        (this.a2 === 0 && this.a3 === 0) ||
        (this.a3 === 0 && this.a1 === 0)
      ) {
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  }
}

export function troisLongueursPourTriangle(longueurMax = 10, decimal = false) {
  let l1 = 0
  let l2 = 0
  let l3 = 0
  do {
    if (decimal) {
      l1 = Math.random() * longueurMax
      l2 = Math.random() * longueurMax
      l3 = Math.random() * longueurMax
    } else {
      l1 = Math.floor(Math.random() * longueurMax) + 1
      l2 = Math.floor(Math.random() * longueurMax) + 1
      l3 = Math.floor(Math.random() * longueurMax) + 1
    }
  } while (!(l1 + l2 > l3 && l1 + l3 > l2 && l2 + l3 > l1))
  return [l1, l2, l3]
}
