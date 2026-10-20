import { useEffect } from 'react'

const DOMAIN = 'https://restoflow.uz'
const DEFAULT_IMAGE = `${DOMAIN}/og-image.png`
const DEFAULT_TITLE = 'RestoFlow — Restoran Boshqaruv Tizimi | POS, KDS va QR Menyu'
const DEFAULT_DESCRIPTION =
  "O'zbekistondagi restoranlar, kafelar va choyxonalar uchun zamonaviy bulutli boshqaruv platformasi. POS kassa, ofitsiant paneli, oshxona KDS, ombor kalkulyatsiyasi va tahliliy hisobotlar."

/**
 * SEOHead — Har bir sahifaga mos meta teglar, Open Graph, Twitter Card,
 * canonical, ko'p tilli hreflang va JSON-LD structured data o'rnatuvchi universal komponent.
 */
export default function SEOHead({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  keywords,
  path = '/',
  image = DEFAULT_IMAGE,
  type = 'website',
  jsonLd = null,
  noindex = false,
}) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  const canonicalUrl = `${DOMAIN}${cleanPath === '/' ? '' : cleanPath}`
  const formattedTitle = title.includes('RestoFlow') ? title : `${title} — RestoFlow`

  useEffect(() => {
    // 1. Sahifa sarlavhasini yangilash
    document.title = formattedTitle

    // 2. Meta teglarni yangilash yordamchisi
    const setMeta = (attr, key, content) => {
      if (!content) return
      let el = document.querySelector(`meta[${attr}="${key}"]`)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, key)
        document.head.appendChild(el)
      }
      el.setAttribute('content', content)
    }

    setMeta('name', 'description', description)
    if (keywords) setMeta('name', 'keywords', keywords)
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large')

    // Open Graph
    setMeta('property', 'og:title', formattedTitle)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:url', canonicalUrl)
    setMeta('property', 'og:type', type)
    setMeta('property', 'og:image', image)
    setMeta('property', 'og:site_name', 'RestoFlow')
    setMeta('property', 'og:locale', 'uz_UZ')

    // Twitter Card
    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', formattedTitle)
    setMeta('name', 'twitter:description', description)
    setMeta('name', 'twitter:image', image)

    // Canonical link
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', canonicalUrl)

    // Hreflang alternates (uz, ru, en, x-default)
    const langs = [
      { lang: 'uz', href: canonicalUrl },
      { lang: 'ru', href: `${canonicalUrl}${canonicalUrl.includes('?') ? '&' : '?'}lang=ru` },
      { lang: 'en', href: `${canonicalUrl}${canonicalUrl.includes('?') ? '&' : '?'}lang=en` },
      { lang: 'x-default', href: canonicalUrl },
    ]

    langs.forEach(({ lang, href }) => {
      let link = document.querySelector(`link[rel="alternate"][hreflang="${lang}"]`)
      if (!link) {
        link = document.createElement('link')
        link.setAttribute('rel', 'alternate')
        link.setAttribute('hreflang', lang)
        document.head.appendChild(link)
      }
      link.setAttribute('href', href)
    })

    // JSON-LD structured data
    let jsonLdScript = document.getElementById('seo-jsonld')
    if (jsonLd) {
      if (!jsonLdScript) {
        jsonLdScript = document.createElement('script')
        jsonLdScript.id = 'seo-jsonld'
        jsonLdScript.type = 'application/ld+json'
        document.head.appendChild(jsonLdScript)
      }
      const data = Array.isArray(jsonLd)
        ? { '@context': 'https://schema.org', '@graph': jsonLd }
        : { '@context': 'https://schema.org', ...jsonLd }
      jsonLdScript.textContent = JSON.stringify(data)
    } else if (jsonLdScript) {
      jsonLdScript.remove()
    }
  }, [formattedTitle, description, keywords, canonicalUrl, image, type, jsonLd, noindex])

  return (
    <>
      <title>{formattedTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Multilingual Hreflang */}
      <link rel="alternate" hreflang="uz" href={canonicalUrl} />
      <link rel="alternate" hreflang="ru" href={`${canonicalUrl}${canonicalUrl.includes('?') ? '&' : '?'}lang=ru`} />
      <link rel="alternate" hreflang="en" href={`${canonicalUrl}${canonicalUrl.includes('?') ? '&' : '?'}lang=en`} />
      <link rel="alternate" hreflang="x-default" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={formattedTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="RestoFlow" />
      <meta property="og:locale" content="uz_UZ" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={formattedTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* JSON-LD Script tag */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              Array.isArray(jsonLd)
                ? { '@context': 'https://schema.org', '@graph': jsonLd }
                : { '@context': 'https://schema.org', ...jsonLd }
            ),
          }}
        />
      )}
    </>
  )
}
