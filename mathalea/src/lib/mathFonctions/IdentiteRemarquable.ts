import PolynomePlusieursVariables from './PolynomePlusieursVariables'
import MonomePlusieursVariables from './MonomePlusieursVariables'

class IdentiteRemarquable {
  static carreDuneSomme(
    a: PolynomePlusieursVariables | MonomePlusieursVariables,
    b: PolynomePlusieursVariables | MonomePlusieursVariables,
  ): PolynomePlusieursVariables {
    // a² - b² = (a + b)(a - b)
    let aP: PolynomePlusieursVariables
    if (a instanceof MonomePlusieursVariables) {
      aP = PolynomePlusieursVariables.createPolynomeFromMonome(a)
    } else {
      aP = a
    }
    let bP: PolynomePlusieursVariables
    if (b instanceof MonomePlusieursVariables) {
      bP = PolynomePlusieursVariables.createPolynomeFromMonome(b)
    } else {
      bP = b
    }
    return aP.somme(bP).produit(aP.somme(bP)).reduire()
  }

  static carreDuneDifference(
    a: PolynomePlusieursVariables | MonomePlusieursVariables,
    b: PolynomePlusieursVariables | MonomePlusieursVariables,
  ): PolynomePlusieursVariables {
    // a² - b² = (a + b)(a - b)
    let aP: PolynomePlusieursVariables
    if (a instanceof MonomePlusieursVariables) {
      aP = PolynomePlusieursVariables.createPolynomeFromMonome(a)
    } else {
      aP = a
    }
    let bP: PolynomePlusieursVariables
    if (b instanceof MonomePlusieursVariables) {
      bP = PolynomePlusieursVariables.createPolynomeFromMonome(b)
    } else {
      bP = b
    }
    return aP.difference(bP).produit(aP.difference(bP)).reduire()
  }

  static differenceDeDeuxCarres(
    a: PolynomePlusieursVariables | MonomePlusieursVariables,
    b: PolynomePlusieursVariables | MonomePlusieursVariables,
  ): PolynomePlusieursVariables {
    // a² - b² = (a + b)(a - b)
    let aP: PolynomePlusieursVariables
    if (a instanceof MonomePlusieursVariables) {
      aP = PolynomePlusieursVariables.createPolynomeFromMonome(a)
    } else {
      aP = a
    }
    let bP: PolynomePlusieursVariables
    if (b instanceof MonomePlusieursVariables) {
      bP = PolynomePlusieursVariables.createPolynomeFromMonome(b)
    } else {
      bP = b
    }
    return aP.somme(bP).produit(aP.difference(bP)).reduire()
  }

  static sommeProduit(
    a: PolynomePlusieursVariables | MonomePlusieursVariables,
    b: PolynomePlusieursVariables | MonomePlusieursVariables,
    c: PolynomePlusieursVariables | MonomePlusieursVariables,
  ): PolynomePlusieursVariables {
    // a² - b² = (a + b)(a - b)
    let aP: PolynomePlusieursVariables
    if (a instanceof MonomePlusieursVariables) {
      aP = PolynomePlusieursVariables.createPolynomeFromMonome(a)
    } else {
      aP = a
    }
    let bP: PolynomePlusieursVariables
    if (b instanceof MonomePlusieursVariables) {
      bP = PolynomePlusieursVariables.createPolynomeFromMonome(b)
    } else {
      bP = b
    }
    let cP: PolynomePlusieursVariables
    if (c instanceof MonomePlusieursVariables) {
      cP = PolynomePlusieursVariables.createPolynomeFromMonome(c)
    } else {
      cP = c
    }
    return aP.somme(bP).produit(aP.somme(cP)).reduire()
  }
}

export default IdentiteRemarquable
