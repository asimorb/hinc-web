import type { Metadata } from 'next'
import {
  Cardo,
  DotGothic16,
  Hind,
  Instrument_Sans,
  Karla,
  Montserrat,
  Plus_Jakarta_Sans,
  Rethink_Sans,
  Space_Mono,
  Spectral,
  Young_Serif,
} from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
})

const karla = Karla({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-karla',
})

const dotGothic = DotGothic16({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-dot-gothic',
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-space-mono',
})

const cardo = Cardo({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-cardo',
})

const hind = Hind({
  subsets: ['latin'],
  weight: ['400', '600'],
  display: 'swap',
  variable: '--font-hind',
})

const rethink = Rethink_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-rethink',
})

const spectral = Spectral({
  subsets: ['latin'],
  weight: ['400', '600'],
  display: 'swap',
  variable: '--font-spectral',
})

const youngSerif = Young_Serif({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-young-serif',
})

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-instrument-sans',
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta',
})

const instrumentSerif = localFont({
  src: [
    {
      path: '../../public/fonts/InstrumentSerif-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/InstrumentSerif-Italic.ttf',
      weight: '400',
      style: 'italic',
    },
  ],
  variable: '--font-instrument-serif',
  display: 'swap',
})

const rishaNeo = localFont({
  src: '../../public/fonts/rishaneo_fontlot5370.otf',
  variable: '--font-risha-neo',
  display: 'swap',
})

const fontVariables = [
  montserrat.variable,
  karla.variable,
  dotGothic.variable,
  spaceMono.variable,
  cardo.variable,
  hind.variable,
  rethink.variable,
  spectral.variable,
  youngSerif.variable,
  instrumentSans.variable,
  plusJakarta.variable,
  instrumentSerif.variable,
  rishaNeo.variable,
].join(' ')

export const metadata: Metadata = {
  title: 'HINC AS',
  description: 'A Trondheim-based design and technology studio. From here.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      data-font="0"
      data-colour="0"
      className={fontVariables}
    >
      <body>{children}</body>
    </html>
  )
}
