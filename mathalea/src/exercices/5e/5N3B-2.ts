import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { pgcd } from '../../lib/outils/primalite'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { sp } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { texNombre } from '../../lib/outils/texNombre'

export const interactifReady = true

export const titre =
  'Effectuer des calculs de fractions (à dénominateurs multiples) un peu complexes'

export const dateDePublication = '12/05/2023'
export const dateDeModifImportante = '07/04/2024'
// Modifié le 2/4/24 pour permettre d'utiliser cet exercice sans connaitre les nombres négatifs (+ suppression des fonctions dépréciées)

/**
 * Effectuer des calculs mêlant fractions (dont un dénominateur est un multiple de l'autre) et priorités opératoires simples .
 *
 * Le résultat de la soustraction peut être négatif.
 *
 * Pour ne pas surcharger la difficulté, le coefficient est limité à 2, 3, 4 ou 5.

 * @author Mireille Gain
 */
export const uuid = '75f80'

export const refs = {
  'fr-fr': ['5N3B-2', 'BP2AutoH23'],
  'fr-2016': ['5N20-2', 'BP2AutoH23'],
  'fr-ch': ['10CTNO3A-12', '10LCNO3A-12', '10LSNO3A-12', 'PRQNO12A-10', 'PRQNO13C-2'],
}
export default class ExerciceAdditionnerSoustraireFractions5e extends Exercice {
  constructor(max = 5) {
    super()
    this.sup = max // Correspond au facteur commun
    this.sup3 = false // Si false alors le résultat n'est pas en fraction simplifiée
    this.sup4 = false // Si true, tous les nombres doivent être positifs
    this.spacing = 2
    this.spacingCorr = 3
    this.nbQuestions = 4
    this.nbColsCorr = 2
    this.besoinFormulaireNumerique = [
      'Valeur maximale du coefficient multiplicateur',
      99999,
    ]
    this.besoinFormulaire3CaseACocher = [
      "Avec l'écriture simplifiée de la fraction résultat",
    ]
    this.besoinFormulaire4CaseACocher = ['Avec uniquement des nombres positifs']
    this.comment =
      'Calculs de la forme : <br>a/b + n ✕ c/bk<br> a/b - n ✕ c/bk<br>a/b - (c/b + e/bk)<br>a/b + n<br>a/b - n<br>a/b - c/bk + e/b'
  }

  nouvelleVersion() {
    if (this.sup3) {
      this.consigne = 'Calculer'
      this.consigne += this.interactif
        ? ' au brouillon et indiquer seulement le résultat final simplifié au maximum.'
        : ' et simplifier au maximum le résultat.'
    } else {
      this.consigne = 'Calculer'
      this.consigne += this.interactif
        ? ' au brouillon et indiquer seulement le résultat final.'
        : '.'
    }

    if (context.isDiaporama) {
      this.consigne = ''
    }

    const typeQuestionsDisponibles = ['type1', 'type2', 'type3', 'type4'] // On crée 4 types de questions

    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posés mais l'ordre diffère à chaque "cycle"
    for (
      let i = 0,
        a,
        b,
        c,
        d,
        e,
        k,
        n,
        s,
        ordreDesFractions,
        negOuPos,
        texte,
        texteCorr,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // Boucle principale où i+1 correspond au numéro de la question
      // les numérateurs
      let reponse
      a = randint(1, 9)
      e = randint(1, 9)
      // les dénominateurs
      b = randint(2, 9, a)
      if (this.sup > 1) {
        k = randint(2, this.sup)
      } else k = 1
      d = b * k
      c = randint(1, 9, d)
      n = randint(2, 5)
      ordreDesFractions = randint(1, 2) // Quand ordreDesFractions = 1, alors le premier dénominateur est le plus petit.
      negOuPos = randint(1, 2)
      switch (
        listeTypeQuestions[i] // Suivant le type de question, le contenu sera différent
      ) {
        case 'type1': // Calculs du type a/b + n * c/bk lorsque negOuPos === 1 et du type a/b - n * c/bk lorsque negOuPos === 2
          if (this.sup4) negOuPos = 1
          if (negOuPos === 1) {
            if (ordreDesFractions === 1) {
              // La fraction de dénominateur plus grand est la deuxième
              //     texte = `$${new FractionEtendue(a, b)}+ ${n} \\times  ${new FractionEtendue(c, d)}$`
              texte = `$${new FractionEtendue(a, b).texFSD}+ ${n} \\times  ${new FractionEtendue(c, d).texFSD}$`
            } else {
              texte = `$${new FractionEtendue(c, d).texFSD}+ ${n} \\times  ${new FractionEtendue(a, b).texFSD}$`
            }

            if (ordreDesFractions === 1) {
              texteCorr = `$${new FractionEtendue(a, b).texFSD}+ ${n} \\times ${new FractionEtendue(c, d).texFSD}=`

              texteCorr += `${new FractionEtendue(a, b).texFSD}+ ${new FractionEtendue(n * c, d).texFSD}=`

              texteCorr += `${new FractionEtendue(a * k, d).texFSD}+ ${new FractionEtendue(n * c, d).texFSD}=`

              texteCorr += `${texFraction(`${texNombre(a * k)}+${texNombre(n * c)}`, texNombre(d))}=${new FractionEtendue(a * k + n * c, d).texFSD}$`
            } else {
              texteCorr = `$${new FractionEtendue(c, d).texFSD}+ ${n} \\times ${new FractionEtendue(a, b).texFSD}=`

              texteCorr += `${new FractionEtendue(c, d).texFSD}+ ${new FractionEtendue(n * a, b).texFSD}=`

              texteCorr += `${new FractionEtendue(c, d).texFSD}+ ${new FractionEtendue(n * a * k, d).texFSD}=`

              texteCorr += `${texFraction(texNombre(c) + '+' + texNombre(n * a * k), texNombre(d))}=${new FractionEtendue(n * a * k + c, d).texFSD}$`
            }
            // Est-ce que le résultat est simplifiable ?
            if (this.sup3) {
              if (ordreDesFractions === 1) {
                s = pgcd(a * k + n * c, d)
                if (s !== 1) {
                  texteCorr += `$=${texFraction(texNombre((a * k + n * c) / s) + miseEnEvidence('\\times ' + texNombre(s), bleuMathalea), texNombre(d / s) + miseEnEvidence('\\times ' + texNombre(s), bleuMathalea))}=${texFractionReduite((a * k + n * c) / s, d / s)}$`
                }
                reponse = {
                  num: a * k + n * c,
                  den: d,
                  options: { fractionIrreductible: true },
                }
              } else {
                s = pgcd(n * a * k + c, d)
                if (s !== 1) {
                  texteCorr += `$=${texFraction(texNombre((n * a * k + c) / s) + miseEnEvidence('\\times ' + texNombre(s), bleuMathalea), texNombre(d / s) + miseEnEvidence('\\times ' + texNombre(s), bleuMathalea))}=${texFractionReduite((n * a * k + c) / s, d / s)}$`
                }
                reponse = {
                  num: n * a * k + c,
                  den: d,
                  options: { fractionIrreductible: true },
                }
              }
            } else {
              if (ordreDesFractions === 1) {
                reponse = { num: a * k + n * c, den: d }
              } else {
                reponse = { num: n * a * k + c, den: d }
              }
            }
          } else {
            if (ordreDesFractions === 1) {
              texte = `$${new FractionEtendue(a, b).texFSD}- ${n} \\times  ${new FractionEtendue(c, d).texFSD}$`
            } else {
              texte = `$${new FractionEtendue(c, d).texFSD}- ${n} \\times  ${new FractionEtendue(a, b).texFSD}$`
            }

            if (ordreDesFractions === 1) {
              texteCorr = `$${new FractionEtendue(a, b).texFSD}- ${n} \\times ${new FractionEtendue(c, d).texFSD}=`

              texteCorr += `${new FractionEtendue(a, b).texFSD}- ${new FractionEtendue(n * c, d).texFSD}=`

              texteCorr += `${new FractionEtendue(a * k, d).texFSD}- ${new FractionEtendue(n * c, d).texFSD}=`

              texteCorr += `${texFraction(`${texNombre(a * k)}-${texNombre(n * c)}`, texNombre(d))}=${new FractionEtendue(a * k - n * c, d).texFSD}$`
            } else {
              texteCorr = `$${new FractionEtendue(c, d).texFSD}- ${n} \\times ${new FractionEtendue(a, b).texFSD}=`

              texteCorr += `${new FractionEtendue(c, d).texFSD}- ${new FractionEtendue(n * a, b).texFSD}=`

              texteCorr += `${new FractionEtendue(c, d).texFSD}- ${new FractionEtendue(n * a * k, d).texFSD}=`

              texteCorr += `${texFraction(`${texNombre(c)}-${texNombre(n * a * k)}`, texNombre(d))}=`

              texteCorr += `${new FractionEtendue(c - n * a * k, d).texFSD}$`
            }
            // Est-ce que le résultat est simplifiable ?
            if (this.sup3) {
              if (ordreDesFractions === 1) {
                s = pgcd(a * k - n * c, d)
                if (s !== 1 && a * k - n * c !== 0) {
                  if (a * k - n * c > 0)
                    texteCorr += `$=${texFraction(texNombre((a * k - n * c) / s) + miseEnEvidence('\\times ' + texNombre(s), bleuMathalea), texNombre(d / s) + miseEnEvidence('\\times ' + texNombre(s), bleuMathalea))}=${texFractionReduite((a * k - n * c) / s, d / s)}$`
                  else
                    texteCorr += `$=-${texFraction(texNombre(-(a * k - n * c) / s) + miseEnEvidence('\\times ' + texNombre(s), bleuMathalea), texNombre(d / s) + miseEnEvidence('\\times ' + texNombre(s), bleuMathalea))}=-${texFractionReduite(-(a * k - n * c) / s, d / s)}$`
                }
                reponse = {
                  num: a * k - n * c,
                  den: d,
                  options: { fractionIrreductible: true },
                }
              } else {
                s = pgcd(n * a * k - c, d)
                if (s !== 1 && c - n * a * k !== 0) {
                  if (c - n * a * k > 0)
                    texteCorr += `$=${texFraction(texNombre((c - n * a * k) / s) + miseEnEvidence('\\times ' + texNombre(s), bleuMathalea), texNombre(d / s) + miseEnEvidence('\\times ' + texNombre(s), bleuMathalea))}=${texFractionReduite((c - n * a * k) / s, d / s)}$`
                  else
                    texteCorr += `$=-${texFraction(texNombre(-(c - n * a * k) / s) + miseEnEvidence('\\times ' + texNombre(s), bleuMathalea), texNombre(d / s) + miseEnEvidence('\\times ' + texNombre(s), bleuMathalea))}=-${texFractionReduite(-(c - n * a * k) / s, d / s)}$`
                }
                reponse = {
                  num: c - n * a * k,
                  den: d,
                  options: { fractionIrreductible: true },
                }
              }
            } else {
              if (ordreDesFractions === 1) {
                reponse = { num: a * k - n * c, den: d }
              } else {
                reponse = { num: c - n * a * k, den: d }
              }
            }
          }
          break
        case 'type2': // Calculs du type :     a/b - (c/b + e/bk)
          if (this.sup4) {
            let max = 9
            while (a < c * e || a < c + e / k || a % b === 0) {
              a = randint(1, max)
              b = randint(2, 9, a)
              c = randint(1, 9)
              e = randint(1, 9)
              max++
            }
            d = b * k
          }
          if (ordreDesFractions === 2) {
            texte = `$${new FractionEtendue(a, b).texFSD}- \\Big(${new FractionEtendue(c, b).texFSD} + ${new FractionEtendue(e, d).texFSD}\\Big)$`
          } else {
            texte = `$${new FractionEtendue(a, b).texFSD}- \\Big(${new FractionEtendue(c, d).texFSD} + ${new FractionEtendue(e, b).texFSD}\\Big)$`
          }

          if (ordreDesFractions === 2) {
            texteCorr = `$${new FractionEtendue(a, b).texFSD}- \\Big(${new FractionEtendue(c, b).texFSD} + ${new FractionEtendue(e, d).texFSD}\\Big)=`

            texteCorr += `${new FractionEtendue(a, b).texFSD} - \\Big( ${new FractionEtendue(k * c, d).texFSD} + ${new FractionEtendue(e, d).texFSD}\\Big)=`

            texteCorr += `${new FractionEtendue(a, b).texFSD} -  ${new FractionEtendue(k * c + e, d).texFSD}=`

            texteCorr += `${new FractionEtendue(a * k, d).texFSD} - ${new FractionEtendue(k * c + e, d).texFSD}=`

            texteCorr += `${new FractionEtendue(a * k - c * k - e, d).texFSD}$`

            // texteCorr += a * k - c * k - e === 0 ? '=0$' : '$'
          } else {
            texteCorr = `$${new FractionEtendue(a, b).texFSD}- \\Big(${new FractionEtendue(c, d).texFSD} + ${new FractionEtendue(e, b).texFSD}\\Big)=`

            texteCorr += `${new FractionEtendue(a, b).texFSD} - \\Big( ${new FractionEtendue(c, d).texFSD} + ${new FractionEtendue(k * e, d).texFSD}\\Big)=`

            texteCorr += `${new FractionEtendue(a, b).texFSD} -  ${new FractionEtendue(c + k * e, d).texFSD}=`

            texteCorr += `${new FractionEtendue(a * k, d).texFSD} - ${new FractionEtendue(c + k * e, d).texFSD}=`

            texteCorr += `${new FractionEtendue(a * k - c - k * e, d).texFSD}$`

            // texteCorr += a * k - c - k * e === 0 ? '=0$' : '$'
          }
          // Est-ce que le résultat est simplifiable ?
          if (this.sup3) {
            if (ordreDesFractions === 2) {
              s = pgcd(a * k - c * k - e, d)
              if (s !== 1 && a * k - c * k - e !== 0) {
                if (a * k - c * k - e > 0)
                  texteCorr += `$=${texFraction(texNombre((a * k - c * k - e) / s) + miseEnEvidence('\\times ' + texNombre(s), bleuMathalea), texNombre(d / s) + miseEnEvidence('\\times ' + texNombre(s), bleuMathalea))}=${texFractionReduite((a * k - c * k - e) / s, d / s)}$`
                else
                  texteCorr += `$=-${texFraction(texNombre(-(a * k - c * k - e) / s) + miseEnEvidence('\\times ' + texNombre(s), bleuMathalea), texNombre(d / s) + miseEnEvidence('\\times ' + texNombre(s), bleuMathalea))}=-${texFractionReduite(-(a * k - c * k - e) / s, d / s)}$`
              }
              reponse = {
                num: a * k - c * k - e,
                den: d,
                options: { fractionIrreductible: true },
              }
            } else {
              s = pgcd(a * k - c - k * e, d)
              if (s !== 1 && a * k - c - k * e !== 0) {
                if (a * k - c - k * e > 0)
                  texteCorr += `$=${texFraction(texNombre((a * k - c - k * e) / s) + miseEnEvidence('\\times ' + texNombre(s), bleuMathalea), texNombre(d / s) + miseEnEvidence('\\times ' + texNombre(s), bleuMathalea))}=${texFractionReduite((a * k - c - k * e) / s, d / s)}$`
                else
                  texteCorr += `$=-${texFraction(texNombre(-(a * k - c - k * e) / s) + miseEnEvidence('\\times ' + texNombre(s), bleuMathalea), texNombre(d / s) + miseEnEvidence('\\times ' + texNombre(s), bleuMathalea))}=-${texFractionReduite(-(a * k - c - k * e) / s, d / s)}$`
              }
              reponse = {
                num: a * k - c - k * e,
                den: d,
                options: { fractionIrreductible: true },
              }
            }
          } else {
            if (ordreDesFractions === 2) {
              reponse = { num: a * k - c * k - e, den: d }
            } else {
              reponse = { num: a * k - c - k * e, den: d }
            }
          }
          break
        case 'type3': // Calculs du type a/b + n (pour retravailler le fait qu'un entier est une fraction) lorsque negOuPos === 2 et du type a/b - n lorsque negOuPos === 1
          if (this.sup4) negOuPos = 2
          if (negOuPos === 2) {
            texte = `$${new FractionEtendue(a, b).texFSD} + ${n}$`
            texteCorr = `$${new FractionEtendue(a, b).texFSD} + ${n}=`
            texteCorr += `${new FractionEtendue(a, b).texFSD} + ${new FractionEtendue(n * b, b).texFSD}=`
            texteCorr += `${new FractionEtendue(a + n * b, b).texFSD}$`
            // Est-ce que le résultat est simplifiable ?
            if (this.sup3) {
              s = pgcd(a + n * b, b)
              if (s !== 1) {
                texteCorr += `$=${texFraction(texNombre((a + n * b) / s) + miseEnEvidence('\\times ' + texNombre(s), bleuMathalea), b / s + miseEnEvidence('\\times ' + s, bleuMathalea))}=${texFractionReduite((a + n * b) / s, b / s)}$`
              }
              reponse = {
                num: a + n * b,
                den: b,
                options: { fractionIrreductible: true },
              }
            } else {
              reponse = { num: a + n * b, den: b }
            }
          } else {
            texte = `$${new FractionEtendue(a, b).texFSD} - ${n}$`
            texteCorr = `$${new FractionEtendue(a, b).texFSD} - ${n}=`
            texteCorr += `${new FractionEtendue(a, b).texFSD} - ${new FractionEtendue(n * b, b).texFSD}=`
            texteCorr += `${new FractionEtendue(a - n * b, b).texFSD}$`
            // Est-ce que le résultat est simplifiable ?
            if (this.sup3) {
              s = pgcd(a - n * b, b)
              if (s !== 1 && a - n * b !== 0) {
                if (a - n * b > 0)
                  texteCorr += `$=${texFraction(texNombre((a - n * b) / s) + miseEnEvidence('\\times ' + texNombre(s), bleuMathalea), b / s + miseEnEvidence('\\times ' + s, bleuMathalea))}=${texFractionReduite((a - n * b) / s, b / s)}$`
                else
                  texteCorr += `$=-${texFraction(texNombre(-(a - n * b) / s) + miseEnEvidence('\\times ' + texNombre(s), bleuMathalea), b / s + miseEnEvidence('\\times ' + s, bleuMathalea))}=-${texFractionReduite(-(a - n * b) / s, b / s)}$`
              }
              reponse = {
                num: a - n * b,
                den: b,
                options: { fractionIrreductible: true },
              }
            } else {
              reponse = { num: a - n * b, den: b }
            }
          }
          break
        case 'type4': // Calculs du type a/b - c/bk + e/b
        default:
          if (this.sup4) {
            let max = 9
            while (a * k - c + e * k < 0) {
              a = randint(1, max)
              c = randint(1, 9)
              e = randint(1, 9)
              max++
            }
          }
          texte = `$${new FractionEtendue(a, b).texFSD}-${new FractionEtendue(c, d).texFSD}+${new FractionEtendue(e, b).texFSD}$`

          texteCorr = `$${new FractionEtendue(a, b).texFSD}-${new FractionEtendue(c, d).texFSD}+${new FractionEtendue(e, b).texFSD}=`
          texteCorr += `${new FractionEtendue(a * k, b * k).texFSD}-${new FractionEtendue(c, d).texFSD}+${new FractionEtendue(e * k, b * k).texFSD}=`
          texteCorr += `${texFraction(`${texNombre(a * k)}-${c}+${texNombre(e * k)}`, texNombre(d))}=`
          texteCorr += `${new FractionEtendue(a * k - c + e * k, d).texFSD}$`
          // Est-ce que le résultat est simplifiable ?
          if (this.sup3) {
            s = pgcd(a * k - c + e * k, d)
            if (s !== 1 && a * k - c + e * k !== 0) {
              if (a * k - c + e * k > 0)
                texteCorr += `$=${texFraction(texNombre((a * k - c + e * k) / s) + miseEnEvidence('\\times ' + texNombre(s), bleuMathalea), texNombre(d / s) + miseEnEvidence('\\times ' + texNombre(s), bleuMathalea))}=${texFractionReduite((a * k - c + e * k) / s, d / s)}$`
              else
                texteCorr += `$=-${texFraction(texNombre(-(a * k - c + e * k) / s) + miseEnEvidence('\\times ' + texNombre(s), bleuMathalea), texNombre(d / s) + miseEnEvidence('\\times ' + texNombre(s), bleuMathalea))}=-${texFractionReduite(-(a * k - c + e * k) / s, d / s)}$`
            }
            reponse = {
              num: a * k - c + e * k,
              den: d,
              options: { fractionIrreductible: true },
            }
          } else {
            reponse = { num: a * k - c + e * k, den: d }
          }
          break
      }
      texte += ajouteChampTexteMathLive(
        this,
        i,
        KeyboardType.clavierDeBaseAvecFraction,
        { texteAvant: sp() + '$=$' },
      )
      if (!context.isAmc) {
        handleAnswers(this, i, {
          reponse: {
            value: new FractionEtendue(reponse.num, reponse.den).simplifie()
              .texFSD,
          },
        })
      } else {
        // Ici mettre le code pour AMC
      }
      // Uniformisation : Mise en place de la réponse attendue en interactif en orange et gras
      const textCorrSplit = texteCorr.split('=')
      let aRemplacer = textCorrSplit[textCorrSplit.length - 1]
      aRemplacer = aRemplacer.replace('$', '').replace('<br>', '')

      texteCorr = ''
      for (let ee = 0; ee < textCorrSplit.length - 1; ee++) {
        texteCorr += textCorrSplit[ee] + '='
      }
      texteCorr += `$ $${miseEnEvidence(aRemplacer)}$`
      // Fin de cette uniformisation

      if (this.questionJamaisPosee(i, a, b, c, e, k, n)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this) // Espacement de 2 em entre chaque questions.
  }
}

function texFraction(n: string, d: string) {
  return `\\dfrac{${n}}{${d}}`
}

function texFractionReduite(n: number, d: number) {
  const fraction = new FractionEtendue(n, d)
  return fraction.simplifie().texFSD
}
