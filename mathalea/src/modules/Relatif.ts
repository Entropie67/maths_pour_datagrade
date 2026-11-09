/**
 * @class
 * @classdesc Classe Relatif - Méthodes utiles sur les relatifs
 * @param {...number} relatifs est un paramètre du reste
 * @author Sébastien Lozano
 */
export class Relatif {
  relatifs: number[]

  constructor(...relatifs: number[]) {
    this.relatifs = relatifs
  }

  /**
   * * Récupère le signe de chaque relatif déclaré dans le paramètre du reste relatifs,
   * * Si 0 fait partie des relatifs on renvoie une erreur
   * @return {array} Renvoie un tableau de -1 ou 1
   * @example getSigneNumber(-1,-2,8,-9,4) renvoie [-1,-1,1,-1,1]
   */
  getSigneNumber() {
    const signes: number[] = []
    try {
      // port du string interdit !
      this.relatifs.forEach(function (element) {
        if (typeof element === 'string') {
          throw new TypeError(`${element} est un string !`)
        }
        if (element === 0) {
          throw new RangeError(`${element} a été exclu des valeurs possibles.`)
        }
      })
      // Quoi faire sans nombres ?
      if (this.relatifs.length === 0) {
        throw new Error("C'est mieux avec quelques nombres !")
      }
      this.relatifs.forEach(function (element) {
        if (element < 0) {
          signes.push(-1)
        }
        if (element > 0) {
          signes.push(1)
        }
      })
    } catch (err) {
      console.error(err)
    }
    return signes
  }

  /**
   * * Récupère le signe de chaque relatif déclaré dans le paramètre du reste relatifs
   * @return {array} Renvoie un tableau de strings valant 'négatif' ou 'positif'
   * @example getSigneNumber(-1,-2,8,-9,4) renvoie le tableau de strings [négatif,négatif,positif,négatif,positif]
   */
  getSigneString() {
    const signesString: string[] = []
    const signes = this.getSigneNumber()
    signes.forEach(function (element) {
      if (element === -1) {
        signesString.push('négatif')
      }
      if (element === 1) {
        signesString.push('positif')
      }
    })
    return signesString
  }

  /**
   *
   * @param  {...number} n une liste de deux ou plus de nombres relatifs
   * @return {number} Renvoie le signe du produit des nombres de cette liste. 1 ou -1
   * @example getSigneProduitNumber(1,-4,-7) renvoie 1
   */

  getSigneProduitNumber(...n: number[]): number {
    let produit = 1
    try {
      // port du string interdit !
      n.forEach(function (element) {
        if (typeof element === 'string') {
          throw new TypeError(`${element} est un string !`)
        }
        if (element === 0) {
          throw new RangeError(`${element} a été exclu des valeurs possibles.`)
        }
      })
      // Quoi faire sans nombres ?
      if (n.length === 0) {
        throw new Error("C'est mieux avec quelques nombres !")
      }
      n.forEach(function (element) {
        produit = produit * element
      })
      if (produit < 0) {
        return -1
      }
      if (produit > 0) {
        return 1
      }
    } catch (err) {
      console.error(err)
    }
    return 1
  }

  /**
   *
   * @param  {...number} n une liste de deux ou plus de nombres relatifs
   * @return {string} Renvoie un string désignant le signe du produit des nombres de cette liste. postif1 ou négatif
   * @example getSigneProduitNumber(1,-4,-7) renvoie le string positif
   */

  getSigneProduitString(...n: number[]): string {
    const produit = this.getSigneProduitNumber(...n)
    if (produit === -1) {
      return 'négatif'
    }
    if (produit === 1) {
      return 'positif'
    }
    return 'positif'
  }

  /**
   *
   * @param  {...number} n une liste de deux ou plus de nombres relatifs
   * @return {string} Renvoie le nombre d'éléments négatifs des nombres de cette liste.
   * * la liste d'entiers doit être passé dans un tableau
   * @example getCardNegatifs([1,-4,-7]) renvoie 2
   * @example getCardNegatifs([4,-5,7,7,-8,-9]) renvoie 3
   */

  getCardNegatifs([...n]: number[]): number {
    let card = 0
    try {
      // port du string interdit !
      n.forEach(function (element) {
        if (typeof element === 'string') {
          throw new TypeError(`${element} est un string !`)
        }
        if (element === 0) {
          throw new RangeError(`${element} a été exclu des valeurs possibles.`)
        }
      })
      // Quoi faire sans nombres ?
      if (n.length === 0) {
        throw new Error("C'est mieux avec quelques nombres !")
      }
      n.forEach(function (element) {
        if (element < 0) {
          card = card + 1
        }
      })
      return card
    } catch (err) {
      console.error(err)
    }
    return card
  }

  /**
   * Fonction locale
   * @param {number} n un entier désignant le cardinal de facteurs négatifs dans un produit
   * @return un string au singulier ou au pluriel
   * @example orth_facteurs_negatifs(0) ou orth_facteurs_negatifs(1) renvoie 'facteur negatif'
   * @example orth_facteurs_negatifs(7) renvoie 'facteurs negatifs'
   */
  orthographeFacteursNegatifs(n: number): string {
    if (n >= 2) {
      return 'facteurs négatifs'
    } else {
      return 'facteur négatif'
    }
  }

  /**
   * @param  {...number} n une liste de deux ou plus de nombres relatifs qui constituent les facteurs du produit
   * @return {string} Renvoie la règle qui permet de justifier le signe d'un produit de relatifs adaptée à la liste passée en paramètre.
   * @example setRegleProduitFacteurs([1,-2,-8,5]) renvoie le string 'Il y a 2 facteurs négatifs, le nombre de facteurs négatifs est pair donc le produit est positif.'
   */

  setRegleSigneProduit(...n: number[]): string {
    try {
      // port du string interdit !
      n.forEach(function (element) {
        if (typeof element === 'string') {
          throw new TypeError(`${element} est un string !`)
        }
      })
      // Quoi faire sans nombres ?
      if (n.length === 0) {
        throw new Error("C'est mieux avec quelques nombres !")
      }
      if (n.length === 2) {
        if (this.getCardNegatifs(n) % 2 === 0) {
          return 'Les deux facteurs ont le même signe donc le produit est positif.'
        } else {
          return 'Les deux facteurs ont un signe différent donc le produit est négatif.'
        }
      } else if (n.length > 2) {
        if (this.getCardNegatifs(n) % 2 === 0) {
          if (this.getCardNegatifs(n) === 0) {
            return 'Tous les facteurs sont positifs donc le produit est positif.'
          } else {
            return `Il y a $${this.getCardNegatifs(n)}$ ${this.orthographeFacteursNegatifs(this.getCardNegatifs(n))}, le nombre de facteurs négatifs est pair donc le produit est positif.`
          }
        } else {
          return `Il y a $${this.getCardNegatifs(n)}$ ${this.orthographeFacteursNegatifs(this.getCardNegatifs(n))}, le nombre de facteurs négatifs est impair donc le produit est négatif.`
        }
      }
    } catch (err) {
      console.error(err)
    }
    return ''
  }

  /**
   *
   * @param  {...number} num une liste de deux ou plus de nombres relatifs qui constituent les facteurs du numérateur
   * @param  {...number} den une liste de deux ou plus de nombres relatifs qui constituent les facteurs du dénominateur
   * @return {string} Renvoie la règle qui permet de justifier le signe d'un produit de relatifs adaptée à la liste passée en paramètre.
   * @example setRegleProduitQuotient([1,-2],[-8,5]) renvoie le string 'La somme des facteurs négatifs du numérateur et des facteurs négatifs du dénominateur vaut 2, ce nombre est pair donc le quotient est positif.'
   */

  setRegleSigneQuotient(...n: number[]): string {
    try {
      // port du string interdit !
      n.forEach(function (element) {
        if (typeof element === 'string') {
          throw new TypeError(`${element} est un string !`)
        }
      })
      // Quoi faire sans nombres ?
      if (n.length === 0) {
        throw new Error("C'est mieux avec quelques nombres !")
      }
      if (n.length === 2) {
        if (this.getCardNegatifs(n) % 2 === 0) {
          return 'Le numérateur et le dénominateur ont le même signe donc le quotient est positif.'
        } else {
          return 'Les numérateur et le dénominateur ont un signe différent donc le quotient est négatif.'
        }
      } else if (n.length > 2) {
        if (this.getCardNegatifs(n) % 2 === 0) {
          if (this.getCardNegatifs(n) === 0) {
            return 'Tous les facteurs du numérateur et tous les facteurs du dénominateur sont positifs donc le quotient est positif.'
          } else {
            // return `La somme du nombre de facteurs négatifs du numérateur et du nombre de facteurs négatifs du dénominateur vaut ${getCardNegatifs(n)}, ce nombre est pair donc le quotient est positif.`;
            return `Quand on compte les facteurs négatifs du numérateur et du dénominateur, on trouve $${this.getCardNegatifs(n)}$, ce nombre est pair donc le quotient est positif.`
          }
        } else {
          // return `La somme du nombre de facteurs négatifs du numérateur et du nombre de facteurs négatifs du dénominateur vaut ${getCardNegatifs(n)}, ce nombre est impair donc le quotient est négatif.`;
          return `Quand on compte les facteurs négatifs du numérateur et du dénominateur, on trouve $${this.getCardNegatifs(n)}$, ce nombre est impair donc le quotient est négatif.`
        }
      }
    } catch (err) {
      console.error(err)
    }
    return ''
  }
}
