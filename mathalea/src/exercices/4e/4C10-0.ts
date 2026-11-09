import { amcConvert } from '../../lib/amc/amcBuilders'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { deparenthise } from '../../lib/mathFonctions/EnleverParenthesesInutiles'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import { Relatif } from '../../modules/Relatif'
import Exercice from '../Exercice'

export const dateDeModifImportante = '02/11/2025'
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const titre =
  "Travailler sur le signe d'un produit ou d'un quotient de nombres relatifs"

/**
 * Signe d'un produit ou d'on quotient de relatifs
 * Plusieurs niveaux 2, 3 ou 4 factieurs, un quotient de 2 nombres, 1  nombre sur un produit de deux nombres, un produit de 2 nombres sur un nombre, un quotient de produit de 2 nombres
 * 4C10-0 exercice parent de 4C10-1 et 4C10-2
 * 4C10-0 contient tous les cas

 * @author Sébastien Lozano
 */
export const uuid = '450ae'

export const refs = {
  'fr-fr': ['4C10-0'],
  'fr-ch': ['10LCNO2B-1', '10LSNO2B-1', '11CTNO1A-1'],
}
export default class SigneProduitQuotientRelatifs extends Exercice {
  exo: string
  constructor() {
    super()
    this.nbQuestions = 7
    this.exo = '4C10-0'
    this.besoinFormulaire2CaseACocher = ['Avec des écritures simplifiées']
    this.sup2 = false
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions === 1
        ? 'Donner le signe des expressions numériques.'
        : "Donner le signe de l'expression numérique."
    let typesDeQuestionsDisponibles

    // this.sup = Number(this.sup) // attention le formulaire renvoie un string, on a besoin d'un number pour le switch !
    if (this.exo === '4C10-1') {
      // signe d'un produit
      switch (this.sup) {
        case 1: // 2 facteurs
          typesDeQuestionsDisponibles = [1]
          break
        case 2: // 3 facteurs
          typesDeQuestionsDisponibles = [2]
          break
        case 3: // 4 facteurs
          typesDeQuestionsDisponibles = [3]
          break
        case 4: // Mélange
        default:
          typesDeQuestionsDisponibles = [1, 2, 3]
          break
      }
    } else if (this.exo === '4C10-2') {
      // signe d'un quotient
      switch (this.sup) {
        case 1: // quotient de 2 nombres
          typesDeQuestionsDisponibles = [4]
          break
        case 2: // quotient d'1 nombre sur un produit de 2 nombres
          typesDeQuestionsDisponibles = [5]
          break
        case 3: // quotient d'1 produit de 2 nombres sur 1 nombre
          typesDeQuestionsDisponibles = [6]
          break
        case 4: // quotient de 2 produits de 2 nombres
          typesDeQuestionsDisponibles = [7]
          break
        case 5: // Mélange
        default:
          typesDeQuestionsDisponibles = [4, 5, 6, 7]
          break
      }
    } else {
      // signe d'un produit et/ou d'un quotient
      typesDeQuestionsDisponibles = [1, 2, 3, 4, 5, 6, 7]
    }

    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posées --> à remettre comme ci-dessus

    for (
      let i = 0, texte, texteCorr, reponse, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      this.autoCorrectionAMC[i] = {}
      this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      // on ne choisit que des nombres compris entre 1 et 20
      const nbMax = 20
      // Le tableau des relatifs nécessaires, il m'en faut max 4 !
      const num = new Relatif(
        randint(-1, 1, [0]) * randint(1, nbMax),
        randint(-1, 1, [0]) * randint(1, nbMax),
        randint(-1, 1, [0]) * randint(1, nbMax),
        randint(-1, 1, [0]) * randint(1, nbMax),
      )

      switch (listeTypeDeQuestions[i]) {
        case 1: // 2 facteurs
          texte = `$ ${ecritureParentheseSiNegatif(
            num.relatifs[0],
          )} \\times ${ecritureParentheseSiNegatif(num.relatifs[1])} $`
          texteCorr = `$ ${ecritureParentheseSiNegatif(num.relatifs[0])} $ est ${num.getSigneString()[0]} et $ ${ecritureParentheseSiNegatif(num.relatifs[1])} $ est ${num.getSigneString()[1]}.`
          texteCorr += `<br> ${num
            .setRegleSigneProduit(num.relatifs[0], num.relatifs[1])
            .replace(/Il y a (\d+)/, 'Il y a $$$1$')}`
          texteCorr += `<br>Donc $ ${ecritureParentheseSiNegatif(
            num.relatifs[0],
          )} \\times ${ecritureParentheseSiNegatif(
            num.relatifs[1],
          )} $ est ${texteEnCouleurEtGras(
            num.getSigneProduitString(num.relatifs[0], num.relatifs[1]),
          )}.`
          reponse = num.getSigneProduitString(num.relatifs[0], num.relatifs[1])
          break
        case 2: // 3 facteurs
          texte = `$ ${ecritureParentheseSiNegatif(
            num.relatifs[0],
          )} \\times ${ecritureParentheseSiNegatif(
            num.relatifs[1],
          )} \\times ${ecritureParentheseSiNegatif(num.relatifs[2])} $`
          texteCorr = `$ ${ecritureParentheseSiNegatif(num.relatifs[0])} $ est ${num.getSigneString()[0]}, $ ${ecritureParentheseSiNegatif(num.relatifs[1])} $ est ${num.getSigneString()[1]}`
          texteCorr += ` et $ ${ecritureParentheseSiNegatif(
            num.relatifs[2],
          )} $ est ${num.getSigneString()[2]}.`
          texteCorr += `<br> ${num
            .setRegleSigneProduit(
              num.relatifs[0],
              num.relatifs[1],
              num.relatifs[2],
            )
            .replace(/Il y a (\d+)/, 'Il y a $$$1$')}`
          texteCorr += `<br>Donc $ ${ecritureParentheseSiNegatif(
            num.relatifs[0],
          )} \\times ${ecritureParentheseSiNegatif(
            num.relatifs[1],
          )} \\times ${ecritureParentheseSiNegatif(
            num.relatifs[2],
          )} $ est ${texteEnCouleurEtGras(
            num.getSigneProduitString(
              num.relatifs[0],
              num.relatifs[1],
              num.relatifs[2],
            ),
          )}.`
          reponse = num.getSigneProduitString(
            num.relatifs[0],
            num.relatifs[1],
            num.relatifs[2],
          )
          break
        case 3: // 4 facteurs
          texte = `$ ${ecritureParentheseSiNegatif(
            num.relatifs[0],
          )} \\times ${ecritureParentheseSiNegatif(
            num.relatifs[1],
          )} \\times ${ecritureParentheseSiNegatif(
            num.relatifs[2],
          )} \\times ${ecritureParentheseSiNegatif(num.relatifs[3])} $`
          texteCorr = `$ ${ecritureParentheseSiNegatif(num.relatifs[0])} $ est ${num.getSigneString()[0]}, $ ${ecritureParentheseSiNegatif(num.relatifs[1])} $ est ${num.getSigneString()[1]}, `
          texteCorr += `$ ${ecritureParentheseSiNegatif(num.relatifs[2])} $ est ${num.getSigneString()[2]} et $ ${ecritureParentheseSiNegatif(num.relatifs[3])} $ est ${num.getSigneString()[3]}.`
          texteCorr += `<br> ${num
            .setRegleSigneProduit(
              num.relatifs[0],
              num.relatifs[1],
              num.relatifs[2],
              num.relatifs[3],
            )
            .replace(/Il y a (\d+)/, 'Il y a $$$1$')}`
          texteCorr += `<br>Donc $ ${ecritureParentheseSiNegatif(
            num.relatifs[0],
          )} \\times ${ecritureParentheseSiNegatif(
            num.relatifs[1],
          )} \\times ${ecritureParentheseSiNegatif(
            num.relatifs[2],
          )} \\times ${ecritureParentheseSiNegatif(
            num.relatifs[3],
          )} $ est ${texteEnCouleurEtGras(
            num.getSigneProduitString(
              num.relatifs[0],
              num.relatifs[1],
              num.relatifs[2],
              num.relatifs[3],
            ),
          )}.`
          reponse = num.getSigneProduitString(
            num.relatifs[0],
            num.relatifs[1],
            num.relatifs[2],
            num.relatifs[3],
          )
          break
        case 4: // quotient de 2 nombres
          texte = `$ \\dfrac{${ecritureParentheseSiNegatif(
            num.relatifs[0],
          )}}{${ecritureParentheseSiNegatif(num.relatifs[1])}} $`
          texteCorr = `$ ${ecritureParentheseSiNegatif(num.relatifs[0])} $ est ${num.getSigneString()[0]} et $ ${ecritureParentheseSiNegatif(num.relatifs[1])} $ est ${num.getSigneString()[1]}.`
          texteCorr += `<br> ${num.setRegleSigneQuotient(
            num.relatifs[0],
            num.relatifs[1],
          )}`
          texteCorr += `<br>Donc $ \\dfrac{${ecritureParentheseSiNegatif(
            num.relatifs[0],
          )}}{${ecritureParentheseSiNegatif(
            num.relatifs[1],
          )}} $ est ${texteEnCouleurEtGras(
            num.getSigneProduitString(num.relatifs[0], num.relatifs[1]),
          )}.`
          reponse = num.getSigneProduitString(num.relatifs[0], num.relatifs[1])
          break
        case 5: // quotient d'1 nombre sur un produit de 2 nombres
          texte = `$ \\dfrac{${ecritureParentheseSiNegatif(
            num.relatifs[0],
          )}}{${ecritureParentheseSiNegatif(
            num.relatifs[1],
          )} \\times ${ecritureParentheseSiNegatif(num.relatifs[2])}} $`
          texteCorr = `$ ${ecritureParentheseSiNegatif(num.relatifs[0])} $ est ${num.getSigneString()[0]}, $ ${ecritureParentheseSiNegatif(num.relatifs[1])} $ est ${num.getSigneString()[1]}`
          texteCorr += ` et $ ${ecritureParentheseSiNegatif(
            num.relatifs[2],
          )} $ est ${num.getSigneString()[2]}.`
          texteCorr += `<br> ${num.setRegleSigneQuotient(
            num.relatifs[0],
            num.relatifs[1],
            num.relatifs[2],
          )}`
          texteCorr += `<br>Donc $ \\dfrac{${ecritureParentheseSiNegatif(
            num.relatifs[0],
          )}}{${ecritureParentheseSiNegatif(
            num.relatifs[1],
          )} \\times ${ecritureParentheseSiNegatif(
            num.relatifs[2],
          )}} $ est ${texteEnCouleurEtGras(
            num.getSigneProduitString(
              num.relatifs[0],
              num.relatifs[1],
              num.relatifs[2],
            ),
          )}.`
          reponse = num.getSigneProduitString(
            num.relatifs[0],
            num.relatifs[1],
            num.relatifs[2],
          )
          break
        case 6: // quotient d'1 produit de 2 nombres sur 1 nombre
          texte = `$ \\dfrac{${ecritureParentheseSiNegatif(
            num.relatifs[0],
          )} \\times ${ecritureParentheseSiNegatif(
            num.relatifs[1],
          )}}{${ecritureParentheseSiNegatif(num.relatifs[2])}} $`
          texteCorr = `$ ${ecritureParentheseSiNegatif(num.relatifs[0])} $ est ${num.getSigneString()[0]}, $ ${ecritureParentheseSiNegatif(num.relatifs[1])} $ est ${num.getSigneString()[1]}`
          texteCorr += ` et $ ${ecritureParentheseSiNegatif(
            num.relatifs[2],
          )} $ est ${num.getSigneString()[2]}.`
          texteCorr += `<br> ${num.setRegleSigneQuotient(
            num.relatifs[0],
            num.relatifs[1],
            num.relatifs[2],
          )}`
          texteCorr += `<br>Donc $ \\dfrac{${ecritureParentheseSiNegatif(
            num.relatifs[0],
          )} \\times ${ecritureParentheseSiNegatif(
            num.relatifs[1],
          )}}{${ecritureParentheseSiNegatif(
            num.relatifs[2],
          )}} $ est ${texteEnCouleurEtGras(
            num.getSigneProduitString(
              num.relatifs[0],
              num.relatifs[1],
              num.relatifs[2],
            ),
          )}.`
          reponse = num.getSigneProduitString(
            num.relatifs[0],
            num.relatifs[1],
            num.relatifs[2],
          )
          break
        case 7: // quotient de 2 produits de 2 nombres
        default:
          texte = `$ \\dfrac{${ecritureParentheseSiNegatif(
            num.relatifs[0],
          )} \\times ${ecritureParentheseSiNegatif(
            num.relatifs[1],
          )}}{${ecritureParentheseSiNegatif(
            num.relatifs[2],
          )} \\times ${ecritureParentheseSiNegatif(num.relatifs[3])}} $`
          texteCorr = `$ ${ecritureParentheseSiNegatif(num.relatifs[0])} $ est ${num.getSigneString()[0]}, $ ${ecritureParentheseSiNegatif(num.relatifs[1])} $ est ${num.getSigneString()[1]}, `
          texteCorr += `$ ${ecritureParentheseSiNegatif(num.relatifs[2])} $ est ${num.getSigneString()[2]} et $ ${ecritureParentheseSiNegatif(num.relatifs[3])} $ est ${num.getSigneString()[3]}.`
          texteCorr += `<br> ${num.setRegleSigneQuotient(
            num.relatifs[0],
            num.relatifs[1],
            num.relatifs[2],
            num.relatifs[3],
          )}`
          texteCorr += `<br>Donc $ \\dfrac{${ecritureParentheseSiNegatif(
            num.relatifs[0],
          )} \\times ${ecritureParentheseSiNegatif(
            num.relatifs[1],
          )}}{${ecritureParentheseSiNegatif(
            num.relatifs[2],
          )} \\times ${ecritureParentheseSiNegatif(
            num.relatifs[3],
          )}} $ est ${texteEnCouleurEtGras(
            num.getSigneProduitString(
              num.relatifs[0],
              num.relatifs[1],
              num.relatifs[2],
              num.relatifs[3],
            ),
          )}.`
          reponse = num.getSigneProduitString(
            num.relatifs[0],
            num.relatifs[1],
            num.relatifs[2],
            num.relatifs[3],
          )
          break
      }
      this.autoCorrection[i] = {
        enonce: texte,
        options: { ordered: true },
        propositions: [
          {
            texte: 'négatif',
            statut: reponse === 'négatif',
          },
          {
            texte: 'nul',
            statut: false,
          },
          {
            texte: 'positif',
            statut: reponse === 'positif',
          },
        ],
      }
      if (this.sup2) texte = deparenthise(texte)

      texte += '<br>' + propositionsQcm(this, i).texte
      if (
        this.questionJamaisPosee(
          i,
          num.relatifs[0],
          num.relatifs[1],
          num.relatifs[2],
          num.relatifs[3],
          listeTypeDeQuestions[i],
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
