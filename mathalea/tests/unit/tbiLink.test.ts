import { describe, expect, it } from 'vitest'
import {
  externalUrlOf,
  fileNameOfUrl,
  isBlockedMixedContent,
  isDropboxFolderUrl,
  linksOfUriList,
  parseHttpUrl,
  parseTbiLink,
  parseTimestamp,
  viewerContentTitle,
  webPageContent,
} from '../../src/lib/tbiLink'

function videoSrc(text: string): string | undefined {
  const content = parseTbiLink(text)
  return content?.type === 'video' ? content.video.src : undefined
}

describe('parseHttpUrl', () => {
  it('accepte une adresse avec ou sans protocole', () => {
    expect(parseHttpUrl(' https://a.fr/b.pdf ')?.href).toBe(
      'https://a.fr/b.pdf',
    )
    expect(parseHttpUrl('youtu.be/dQw4w9WgXcQ')?.href).toBe(
      'https://youtu.be/dQw4w9WgXcQ',
    )
  })

  it('refuse un texte qui n’est pas une adresse web', () => {
    expect(parseHttpUrl('bonjour')).toBeNull()
    expect(parseHttpUrl('deux mots.fr')).toBeNull()
    expect(parseHttpUrl('javascript:alert(1)')).toBeNull()
    expect(parseHttpUrl('ftp://a.fr/b.pdf')).toBeNull()
    expect(parseHttpUrl('')).toBeNull()
  })
})

describe('parseTimestamp', () => {
  it('lit les secondes et les durées', () => {
    expect(parseTimestamp('90')).toBe(90)
    expect(parseTimestamp('90s')).toBe(90)
    expect(parseTimestamp('1m30s')).toBe(90)
    expect(parseTimestamp('1h2m3s')).toBe(3723)
    expect(parseTimestamp('1:30')).toBe(90)
    expect(parseTimestamp('1:02:03')).toBe(3723)
  })

  it('renvoie null pour une valeur absente ou illisible', () => {
    expect(parseTimestamp(null)).toBeNull()
    expect(parseTimestamp('')).toBeNull()
    expect(parseTimestamp('demain')).toBeNull()
  })
})

describe('vidéos YouTube', () => {
  const embed =
    'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&iv_load_policy=3&playsinline=1'

  it('reconnaît les différentes formes de lien', () => {
    for (const link of [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://m.youtube.com/watch?v=dQw4w9WgXcQ&list=PL123',
      'https://youtu.be/dQw4w9WgXcQ',
      'https://www.youtube.com/embed/dQw4w9WgXcQ',
      'https://www.youtube.com/shorts/dQw4w9WgXcQ',
      'https://www.youtube.com/live/dQw4w9WgXcQ',
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    ]) {
      expect(videoSrc(link)).toBe(embed)
    }
  })

  it("reprend l'instant de départ", () => {
    expect(videoSrc('https://youtu.be/dQw4w9WgXcQ?t=1m30s')).toBe(
      `${embed}&start=90`,
    )
    expect(videoSrc('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42')).toBe(
      `${embed}&start=42`,
    )
  })

  it('traite une page YouTube sans vidéo comme un simple lien', () => {
    expect(parseTbiLink('https://www.youtube.com/@chaine')?.type).toBe('link')
  })
})

describe('vidéos PeerTube', () => {
  const params = 'title=0&warningTitle=0&peertubeLink=0&p2p=0'

  it('reconnaît les liens courts, longs et intégrés, sur toute instance', () => {
    const host = 'https://tube-sciences-technologies.apps.education.fr'
    const embed = `${host}/videos/embed/i8tYFE68d7i1UdvrabSkap?${params}`
    expect(videoSrc(`${host}/w/i8tYFE68d7i1UdvrabSkap`)).toBe(embed)
    expect(videoSrc(`${host}/videos/embed/i8tYFE68d7i1UdvrabSkap`)).toBe(embed)
    expect(
      videoSrc(
        'https://framatube.org/videos/watch/8ab6ce24-0510-4aa1-8aee-dc12979aa59d?start=1m30s',
      ),
    ).toBe(
      `https://framatube.org/videos/embed/8ab6ce24-0510-4aa1-8aee-dc12979aa59d?${params}&start=90`,
    )
  })

  it('reconnaît une liste de lecture', () => {
    expect(videoSrc('https://framatube.org/w/p/i8tYFE68d7i1UdvrabSkap')).toBe(
      `https://framatube.org/video-playlists/embed/i8tYFE68d7i1UdvrabSkap?${params}`,
    )
  })

  it("ne confond pas d'autres chemins en /w/ avec PeerTube", () => {
    expect(parseTbiLink('https://fr.wikipedia.org/w/index.php')?.type).toBe(
      'link',
    )
  })
})

describe('vidéos PodEduc', () => {
  it('ajoute is_iframe=true au lien de la vidéo', () => {
    expect(
      videoSrc(
        'https://podeduc.apps.education.fr/video/165818-singingmicrodefmp4/',
      ),
    ).toBe(
      'https://podeduc.apps.education.fr/video/165818-singingmicrodefmp4/?is_iframe=true',
    )
    expect(
      videoSrc(
        'https://podeduc.apps.education.fr/video/165818-singingmicrodefmp4',
      ),
    ).toBe(
      'https://podeduc.apps.education.fr/video/165818-singingmicrodefmp4/?is_iframe=true',
    )
  })

  it('conserve la clé des liens privés et le lien intégré', () => {
    expect(
      videoSrc(
        'https://pod.univ-exemple.fr/video/0042-cours/ab12cd/?is_iframe=true',
      ),
    ).toBe(
      'https://pod.univ-exemple.fr/video/0042-cours/ab12cd/?is_iframe=true',
    )
  })

  it('ignore les chemins /video/ des autres sites', () => {
    expect(parseTbiLink('https://exemple.fr/video/12-cours/')?.type).toBe(
      'link',
    )
  })
})

describe('fichiers vidéo et documents', () => {
  it('lit un fichier vidéo avec la balise video', () => {
    const content = parseTbiLink('https://a.fr/films/cours.MP4')
    expect(content).toEqual({
      type: 'video',
      video: {
        provider: 'file',
        src: 'https://a.fr/films/cours.MP4',
        pageUrl: 'https://a.fr/films/cours.MP4',
      },
    })
  })

  it('traite les autres liens comme des documents', () => {
    expect(parseTbiLink('https://a.fr/sujet.pdf')).toEqual({
      type: 'link',
      url: 'https://a.fr/sujet.pdf',
    })
    expect(parseTbiLink('pas un lien')).toBeNull()
  })
})

describe('Google Drive', () => {
  const preview =
    'https://drive.google.com/file/d/1KZ3jaxGUafwmF32-Cdta3su2DUmMDFW4/preview'
  it('affiche un fichier Drive dans son aperçu intégré', () => {
    for (const text of [
      'https://drive.google.com/file/d/1KZ3jaxGUafwmF32-Cdta3su2DUmMDFW4/view?usp=sharing',
      'https://drive.google.com/file/u/0/d/1KZ3jaxGUafwmF32-Cdta3su2DUmMDFW4/view',
      'https://drive.google.com/open?id=1KZ3jaxGUafwmF32-Cdta3su2DUmMDFW4',
      'https://drive.google.com/uc?export=download&id=1KZ3jaxGUafwmF32-Cdta3su2DUmMDFW4',
    ]) {
      expect(videoSrc(text)).toBe(preview)
    }
    expect(
      viewerContentTitle(
        parseTbiLink('https://drive.google.com/file/d/abc123/view'),
      ),
    ).toBe('Document Google Drive')
  })
  it('laisse les autres liens Drive (dossiers) comme des documents', () => {
    expect(
      parseTbiLink('https://drive.google.com/drive/folders/abc123')?.type,
    ).toBe('link')
  })
})

describe('Dropbox', () => {
  const file =
    'https://www.dropbox.com/scl/fi/abc123/sujet.pdf?rlkey=xyz&st=q1&raw=1'
  it('convertit un lien de fichier en téléchargement direct', () => {
    for (const text of [
      'https://www.dropbox.com/scl/fi/abc123/sujet.pdf?rlkey=xyz&st=q1&dl=0',
      'https://www.dropbox.com/scl/fi/abc123/sujet.pdf?rlkey=xyz&st=q1&dl=1',
      'https://www.dropbox.com/scl/fi/abc123/sujet.pdf?rlkey=xyz&st=q1',
      file,
    ]) {
      expect(parseTbiLink(text)).toEqual({ type: 'link', url: file })
    }
    expect(
      parseTbiLink('https://www.dropbox.com/s/abc123/fiche.png?dl=0'),
    ).toEqual({
      type: 'link',
      url: 'https://www.dropbox.com/s/abc123/fiche.png?raw=1',
    })
    expect(
      viewerContentTitle(
        parseTbiLink('dropbox.com/scl/fi/abc123/sujet%20un.pdf?dl=0'),
      ),
    ).toBe('sujet un.pdf')
  })
  it('lit un fichier vidéo Dropbox avec la balise vidéo', () => {
    expect(
      videoSrc('https://www.dropbox.com/scl/fi/abc123/film.mp4?rlkey=xyz&dl=0'),
    ).toBe('https://www.dropbox.com/scl/fi/abc123/film.mp4?rlkey=xyz&raw=1')
  })
  it('laisse un lien de dossier inchangé', () => {
    const folder =
      'https://www.dropbox.com/scl/fo/dy3ayk3lywlde17p1h6ku/h?rlkey=2fkj&dl=0'
    expect(isDropboxFolderUrl(new URL(folder))).toBe(true)
    expect(parseTbiLink(folder)).toEqual({ type: 'link', url: folder })
    expect(isDropboxFolderUrl(new URL(file))).toBe(false)
  })
})

describe('linksOfUriList', () => {
  it('garde les liens valides et ignore les commentaires', () => {
    expect(
      linksOfUriList('# commentaire\r\nhttps://a.fr/a.png\r\n\r\nrien'),
    ).toEqual([{ type: 'link', url: 'https://a.fr/a.png' }])
  })
})

describe('titres', () => {
  it('nomme le document, la vidéo ou le visualiseur vide', () => {
    expect(fileNameOfUrl('https://a.fr/dossier/Sujet%20DNB.pdf')).toBe(
      'Sujet DNB.pdf',
    )
    expect(fileNameOfUrl('https://a.fr/')).toBe('a.fr')
    expect(viewerContentTitle(null)).toBe('Visualiseur de document')
    expect(
      viewerContentTitle(parseTbiLink('https://youtu.be/dQw4w9WgXcQ')),
    ).toBe('Vidéo YouTube')
    expect(viewerContentTitle(parseTbiLink('https://a.fr/sujet.pdf?x=1'))).toBe(
      'sujet.pdf',
    )
  })
})

describe('GeoGebra', () => {
  const embed = (id: string) =>
    `https://www.geogebra.org/material/iframe/id/${id}/border/888888/rc/false/ai/false/sdz/true/smb/false/stb/false/stbh/false/ld/false/sri/true`

  it.each([
    ['https://www.geogebra.org/m/umrknut3', embed('umrknut3')],
    ['www.geogebra.org/m/umrknut3/', embed('umrknut3')],
    ['https://mat.geogebra.org/m/umrknut3', embed('umrknut3')],
    ['https://tube.geogebra.org/m/1234', embed('1234')],
    ['https://www.geogebratube.org/student/m1234', embed('1234')],
    ['https://www.geogebra.org/material/show/id/umrknut3', embed('umrknut3')],
    [
      'https://www.geogebra.org/material/iframe/id/umrknut3/width/800/height/600',
      embed('umrknut3'),
    ],
    ['https://ggbm.at/umrknut3', embed('umrknut3')],
    ['https://ggbtu.be/m1234', embed('1234')],
    ['https://www.geogebra.org/m/livre#material/activite', embed('activite')],
    [
      'https://www.geogebra.org/classic/umrknut3',
      'https://www.geogebra.org/classic/umrknut3?embed',
    ],
    [
      'https://www.geogebra.org/calculator',
      'https://www.geogebra.org/calculator?embed',
    ],
  ])('affiche %s dans le lecteur intégré', (link, src) => {
    const content = parseTbiLink(link)
    expect(content?.type === 'video' && content.video.provider).toBe('geogebra')
    expect(content?.type === 'video' && content.video.src).toBe(src)
  })

  it('garde le lien saisi pour le titre et la séance', () => {
    const content = parseTbiLink('https://www.geogebra.org/m/umrknut3')
    expect(viewerContentTitle(content)).toBe('Figure GeoGebra')
    expect(content?.type === 'video' && content.video.pageUrl).toBe(
      'https://www.geogebra.org/m/umrknut3',
    )
  })

  it('ne reconnaît ni une autre page de GeoGebra ni un autre site', () => {
    for (const link of [
      'https://www.geogebra.org/u/quelquun',
      'https://www.geogebra.org.exemple.fr/m/umrknut3',
      'https://exemple.fr/m/umrknut3',
    ]) {
      expect(parseTbiLink(link)?.type).toBe('link')
    }
  })
})

describe('pages web', () => {
  it('affiche la page telle quelle et reprend son adresse', () => {
    const content = webPageContent('https://exemple.fr/page')
    expect(content).toEqual({
      type: 'video',
      video: {
        provider: 'web',
        src: 'https://exemple.fr/page',
        pageUrl: 'https://exemple.fr/page',
      },
    })
    expect(viewerContentTitle(content)).toBe('exemple.fr')
    expect(externalUrlOf(content)).toBe('https://exemple.fr/page')
  })

  it('propose d’ouvrir un lien dans un onglet, sauf sans adresse', () => {
    expect(externalUrlOf({ type: 'link', url: 'https://a.fr/b' })).toBe(
      'https://a.fr/b',
    )
    expect(externalUrlOf(null)).toBeNull()
    expect(
      externalUrlOf({ type: 'markdown', text: '', fontSize: 1 }),
    ).toBeNull()
  })

  it('n’interdit une page http que dans une vue https', () => {
    expect(isBlockedMixedContent('http://a.fr/', 'https:')).toBe(true)
    expect(isBlockedMixedContent('https://a.fr/', 'https:')).toBe(false)
    expect(isBlockedMixedContent('http://a.fr/', 'http:')).toBe(false)
  })
})
