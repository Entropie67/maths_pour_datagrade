import { describe, expect, it } from 'vitest'
import {
  construireReferentielBanque,
  estCheminInterne,
  ManifestInvalideError,
  sourceForgeDepuisUrl,
  urlFichierForge,
  uuidBanqueExterne,
  validerManifest,
} from './banquesExternes'
import {
  BANQUE_EXTERNE_SCHEMA,
  cleSource,
  estUuidBanqueExterne,
  sourceDepuisCle,
  type BanqueExterneSource,
} from '../types/banquesExternes'
import {
  isBanqueExterneType,
  isStaticType,
  hasTypSource,
  type JSONReferentielObject,
} from '../types/referentiels'

const manifestMinimal = {
  schema: BANQUE_EXTERNE_SCHEMA,
  id: 'ma-banque',
  titre: 'Ma banque',
  exercices: [
    {
      id: 'ex1',
      titre: 'Premier exercice',
      categorie: 'Nombres',
      sousCategorie: 'Fractions',
      tags: ['fractions', 'calcul'],
      etoiles: 2,
      png: 'png/ex1.png',
      pngCor: 'png/ex1_cor.png',
      typ: 'typ/ex1.typ',
    },
  ],
}

describe('estCheminInterne', () => {
  it('accepte un chemin relatif simple', () => {
    expect(estCheminInterne('png/ex1.png')).toBe(true)
  })
  it('refuse une remontée de dossier', () => {
    expect(estCheminInterne('../secret.png')).toBe(false)
    expect(estCheminInterne('png/../../secret.png')).toBe(false)
  })
  it('refuse un chemin absolu ou une URL', () => {
    expect(estCheminInterne('/etc/passwd')).toBe(false)
    expect(estCheminInterne('https://exemple.fr/a.png')).toBe(false)
    expect(estCheminInterne('')).toBe(false)
  })
})

describe('validerManifest', () => {
  it('valide un manifest correct', () => {
    const manifest = validerManifest(manifestMinimal)
    expect(manifest.id).toBe('ma-banque')
    expect(manifest.exercices).toHaveLength(1)
    expect(manifest.exercices[0].etoiles).toBe(2)
    expect(manifest.exercices[0].tags).toEqual(['fractions', 'calcul'])
  })
  it('refuse un schéma inconnu', () => {
    expect(() =>
      validerManifest({ ...manifestMinimal, schema: 'autre' }),
    ).toThrow(ManifestInvalideError)
  })
  it('refuse un id de banque contenant une barre oblique', () => {
    expect(() => validerManifest({ ...manifestMinimal, id: 'a/b' })).toThrow(
      ManifestInvalideError,
    )
  })
  it('refuse deux exercices de même id', () => {
    expect(() =>
      validerManifest({
        ...manifestMinimal,
        exercices: [
          manifestMinimal.exercices[0],
          { ...manifestMinimal.exercices[0], titre: 'Doublon' },
        ],
      }),
    ).toThrow(ManifestInvalideError)
  })
  it('refuse un exercice sans png, ni typ, ni tex', () => {
    expect(() =>
      validerManifest({
        ...manifestMinimal,
        exercices: [{ id: 'ex1', titre: 'Sans fichier' }],
      }),
    ).toThrow(ManifestInvalideError)
  })
  it('accepte un exercice fourni uniquement en LaTeX', () => {
    const manifest = validerManifest({
      ...manifestMinimal,
      exercices: [{ id: 'ex1', titre: 'LaTeX seul', tex: 'tex/ex1.tex' }],
    })
    expect(manifest.exercices[0].tex).toBe('tex/ex1.tex')
  })
  it('refuse un chemin de source LaTeX qui sort de la banque', () => {
    expect(() =>
      validerManifest({
        ...manifestMinimal,
        exercices: [
          {
            id: 'ex1',
            titre: 'Fuite',
            png: 'png/ex1.png',
            tex: '../../secret.tex',
          },
        ],
      }),
    ).toThrow(ManifestInvalideError)
  })
  it('refuse un chemin qui sort de la banque', () => {
    expect(() =>
      validerManifest({
        ...manifestMinimal,
        exercices: [
          {
            id: 'ex1',
            titre: 'Fuite',
            png: '../../json/referentielProfs.json',
          },
        ],
      }),
    ).toThrow(ManifestInvalideError)
  })
  it('borne le nombre d’étoiles entre 0 et 5', () => {
    const manifest = validerManifest({
      ...manifestMinimal,
      exercices: [{ ...manifestMinimal.exercices[0], etoiles: 12 }],
    })
    expect(manifest.exercices[0].etoiles).toBe(5)
  })
})

describe('construireReferentielBanque', () => {
  const resoudre = (chemin: string) => `blob:${chemin}`
  it('range les exercices selon catégorie puis sous-catégorie', () => {
    const referentiel = construireReferentielBanque(
      validerManifest(manifestMinimal),
      resoudre,
    )
    const banque = referentiel['Ma banque'] as JSONReferentielObject
    const nombres = banque.Nombres as JSONReferentielObject
    const fractions = nombres.Fractions as JSONReferentielObject
    const terminaison = fractions['bq-ma-banque-ex1']
    expect(isBanqueExterneType(terminaison)).toBe(true)
    expect(isStaticType(terminaison)).toBe(true)
    expect(hasTypSource(terminaison)).toBe(true)
  })
  it('range à la racine un exercice sans catégorie', () => {
    const referentiel = construireReferentielBanque(
      validerManifest({
        ...manifestMinimal,
        exercices: [{ id: 'ex2', titre: 'Hors catégorie', png: 'png/ex2.png' }],
      }),
      resoudre,
    )
    const banque = referentiel['Ma banque'] as JSONReferentielObject
    expect(Object.keys(banque)).toEqual(['bq-ma-banque-ex2'])
  })
  it('résout les chemins des fichiers en URLs', () => {
    const referentiel = construireReferentielBanque(
      validerManifest(manifestMinimal),
      resoudre,
    )
    const banque = referentiel['Ma banque'] as JSONReferentielObject
    const fractions = (banque.Nombres as JSONReferentielObject)
      .Fractions as JSONReferentielObject
    const terminaison = fractions['bq-ma-banque-ex1']
    expect(isBanqueExterneType(terminaison)).toBe(true)
    if (!isBanqueExterneType(terminaison)) return
    expect(terminaison.png).toBe('blob:png/ex1.png')
    expect(terminaison.pngCor).toBe('blob:png/ex1_cor.png')
    expect(terminaison.typUrl).toBe('blob:typ/ex1.typ')
    expect(terminaison.typCorUrl).toBeUndefined()
  })
  it('résout les sources LaTeX dans tex et texCor', () => {
    const referentiel = construireReferentielBanque(
      validerManifest({
        ...manifestMinimal,
        exercices: [
          {
            id: 'ex1',
            titre: 'Avec LaTeX',
            png: 'png/ex1.png',
            tex: 'tex/ex1.tex',
            texCor: 'tex/ex1_cor.tex',
          },
        ],
      }),
      resoudre,
    )
    const banque = referentiel['Ma banque'] as JSONReferentielObject
    const terminaison = banque['bq-ma-banque-ex1']
    expect(isBanqueExterneType(terminaison)).toBe(true)
    if (!isBanqueExterneType(terminaison)) return
    expect(terminaison.tex).toBe('blob:tex/ex1.tex')
    expect(terminaison.texCor).toBe('blob:tex/ex1_cor.tex')
  })
  it('laisse tex vide quand la banque n’en fournit pas', () => {
    const referentiel = construireReferentielBanque(
      validerManifest(manifestMinimal),
      resoudre,
    )
    const banque = referentiel['Ma banque'] as JSONReferentielObject
    const fractions = (banque.Nombres as JSONReferentielObject)
      .Fractions as JSONReferentielObject
    const terminaison = fractions['bq-ma-banque-ex1']
    expect(isBanqueExterneType(terminaison)).toBe(true)
    if (!isBanqueExterneType(terminaison)) return
    expect(terminaison.tex).toBe('')
    expect(terminaison.texCor).toBe('')
  })
  it('porte le titre et l’auteur de la banque, pour l’attribution affichée', () => {
    const referentiel = construireReferentielBanque(
      validerManifest({ ...manifestMinimal, auteur: 'Iona Dupont' }),
      resoudre,
    )
    const banque = referentiel['Ma banque'] as JSONReferentielObject
    const fractions = (banque.Nombres as JSONReferentielObject)
      .Fractions as JSONReferentielObject
    const terminaison = fractions['bq-ma-banque-ex1']
    expect(isBanqueExterneType(terminaison)).toBe(true)
    if (!isBanqueExterneType(terminaison)) return
    expect(terminaison.banqueTitre).toBe('Ma banque')
    expect(terminaison.banqueAuteur).toBe('Iona Dupont')
  })
  it('laisse banqueAuteur indéfini quand le manifest ne déclare pas d’auteur', () => {
    const referentiel = construireReferentielBanque(
      validerManifest(manifestMinimal),
      resoudre,
    )
    const banque = referentiel['Ma banque'] as JSONReferentielObject
    const fractions = (banque.Nombres as JSONReferentielObject)
      .Fractions as JSONReferentielObject
    const terminaison = fractions['bq-ma-banque-ex1']
    expect(isBanqueExterneType(terminaison)).toBe(true)
    if (!isBanqueExterneType(terminaison)) return
    expect(terminaison.banqueAuteur).toBeUndefined()
  })
})

describe('uuid des banques externes', () => {
  it('préfixe les uuid par bq-', () => {
    const uuid = uuidBanqueExterne('ma-banque', 'ex1')
    expect(uuid).toBe('bq-ma-banque-ex1')
    expect(estUuidBanqueExterne(uuid)).toBe(true)
    expect(estUuidBanqueExterne('dnb_2023_ex1')).toBe(false)
  })
})

describe('sources de forge', () => {
  it('reconnaît une URL de dépôt', () => {
    const source = sourceForgeDepuisUrl(
      'https://forge.apps.education.fr/groupe/ma-banque',
    )
    expect(source).not.toBeNull()
    expect(source?.projet).toBe('groupe/ma-banque')
    expect(source?.ref).toBe('main')
  })
  it('reconnaît une URL d’arborescence avec branche et sous-dossier', () => {
    const source = sourceForgeDepuisUrl(
      'https://forge.apps.education.fr/groupe/sous-groupe/ma-banque/-/tree/v2/dist',
    )
    expect(source?.projet).toBe('groupe/sous-groupe/ma-banque')
    expect(source?.ref).toBe('v2')
    expect(source?.racine).toBe('dist')
  })
  it('supprime le suffixe .git', () => {
    const source = sourceForgeDepuisUrl(
      'https://forge.apps.education.fr/groupe/ma-banque.git',
    )
    expect(source?.projet).toBe('groupe/ma-banque')
  })
  it('refuse un autre hôte ou une URL sans groupe', () => {
    expect(
      sourceForgeDepuisUrl('https://github.com/groupe/ma-banque'),
    ).toBeNull()
    expect(
      sourceForgeDepuisUrl('https://forge.apps.education.fr/groupe'),
    ).toBeNull()
    expect(sourceForgeDepuisUrl('pas une url')).toBeNull()
  })
  it('construit une URL d’API encodée', () => {
    const source: BanqueExterneSource = {
      type: 'forge',
      cle: '',
      projet: 'groupe/ma-banque',
      ref: 'main',
      racine: 'dist',
    }
    expect(urlFichierForge(source, 'png/ex1.png')).toBe(
      'https://forge.apps.education.fr/api/v4/projects/groupe%2Fma-banque/repository/files/dist%2Fpng%2Fex1.png/raw?ref=main',
    )
  })
  it('fait un aller-retour entre source et clé', () => {
    const source: BanqueExterneSource = {
      type: 'forge',
      cle: '',
      projet: 'groupe/ma-banque',
      ref: 'v2',
      racine: 'dist',
    }
    const cle = cleSource(source)
    expect(cle).toBe('forge:groupe/ma-banque@v2:dist')
    const relue = sourceDepuisCle(cle)
    expect(relue?.projet).toBe('groupe/ma-banque')
    expect(relue?.ref).toBe('v2')
    expect(relue?.racine).toBe('dist')
  })
  it('refuse une clé de banque locale', () => {
    expect(sourceDepuisCle('zip:abcdef')).toBeNull()
  })
})
