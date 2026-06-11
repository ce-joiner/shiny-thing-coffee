import './globals.css'

import {SpeedInsights} from '@vercel/speed-insights/next'
import type {Metadata} from 'next'
import {Martian_Mono} from 'next/font/google'
import {toPlainText} from 'next-sanity'

import * as demo from '@/sanity/lib/demo'
import {sanityFetch} from '@/sanity/lib/live'
import {settingsQuery} from '@/sanity/lib/queries'
import {resolveOpenGraphImage} from '@/sanity/lib/utils'

/**
 * Generate metadata for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata(): Promise<Metadata> {
  const {data: settings} = await sanityFetch({
    query: settingsQuery,
    // Metadata should never contain stega
    stega: false,
  })
  const title = settings?.title || demo.title
  const description = settings?.description || demo.description

  const ogImage = resolveOpenGraphImage(settings?.ogImage)
  let metadataBase: URL | undefined = undefined
  try {
    metadataBase = settings?.ogImage?.metadataBase
      ? new URL(settings.ogImage.metadataBase)
      : undefined
  } catch {
    // ignore
  }
  return {
    // Falls back to the production domain so the Open Graph image resolves to an
    // absolute URL when no Sanity-configured metadataBase is present.
    metadataBase: metadataBase ?? new URL('https://shinythingcoffee.com'),
    title: {
      template: `%s | ${title}`,
      default: title,
    },
    description: toPlainText(description),
    openGraph: {
      type: 'website',
      // When Sanity has no ogImage, omit `images` so the file-based
      // app/opengraph-image route is used as the default share card.
      ...(ogImage ? {images: [ogImage]} : {}),
    },
    twitter: {
      card: 'summary_large_image',
    },
  }
}

const martianMono = Martian_Mono({
  variable: '--font-martian-mono',
  weight: ['300', '700'],
  subsets: ['latin'],
  display: 'swap',
})

export default function RootLayout({children}: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${martianMono.variable} bg-st-bg text-st-black`}>
      <body>
        <main className="min-h-screen">{children}</main>
        <SpeedInsights />
      </body>
    </html>
  )
}
