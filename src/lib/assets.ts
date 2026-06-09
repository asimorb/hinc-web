import type { ZoneId } from './zones'

export type AssetType = 'image' | 'text' | 'sketch' | 'product' | 'survey' | 'message'
export type ProductId = 'vanly' | 'laerly' | 'budge' | 'revamp'

export interface LogoAnchorDefinition {
  id: string
  x: number
  y: number
  width: number
  height: number
}

export interface AssetDefinition {
  id: string
  type: AssetType
  zoneId: ZoneId
  src?: string
  alt?: string
  content?: string
  width: number
  height: number
  isErasable: boolean
  isCritical: boolean
  productId?: ProductId
  objectFit?: 'cover' | 'contain'
  variant?: 'photo' | 'graphic' | 'mass' | 'quote' | 'etymology' | 'body'
  fixedPlacement?: {
    x: number
    y: number
  }
}

export interface ProductDefinition {
  id: string
  type: 'product'
  zoneId: ZoneId
  width: number
  height: number
  isErasable: boolean
  isCritical: boolean
  productId: ProductId
  name: string
  tagline: string
  status?: string
  logo: {
    src: string
    width: number
    height: number
    displayWidth?: number
    displayHeight?: number
  }
  fixedPlacement: {
    x: number
    y: number
  }
}

export const products = [
  {
    id: 'product-vanly',
    type: 'product',
    zoneId: 'products',
    width: 280,
    height: 170,
    isErasable: false,
    isCritical: true,
    productId: 'vanly',
    name: 'Vanly',
    tagline:
      'Independent cafes run on returning customers, but the tools that serve those customers have always belonged to the chains. Vanly centralises digital stamp cards across independent venues into a single app - one card, every cafe you frequent. It begins in Trondheim, with Nabolaget Bagelri as its first partner, and builds outward from there.',
    status: 'Under development',
    logo: {
      src: '/assets/Logos-02.png?v=20260608',
      width: 1739,
      height: 717,
      displayWidth: 384,
      displayHeight: 147,
    },
    fixedPlacement: {
      x: 6938,
      y: 1836,
    },
  },
  {
    id: 'product-laerly',
    type: 'product',
    zoneId: 'products',
    width: 367,
    height: 286,
    isErasable: false,
    isCritical: true,
    productId: 'laerly',
    name: 'Lærly',
    tagline:
      "Most AI tools give teachers content and call it support. Lærly starts differently - it asks about the classroom first. Subject, level, pedagogy, curriculum framework. The output is a lesson workflow built for that specific context, validated against Norway's LK20. Not a content generator. A specificity engine for Nordic teachers.",
    status: 'Under development',
    logo: {
      src: '/assets/Logos-03.png?v=20260608',
      width: 1553,
      height: 1141,
      displayWidth: 576,
      displayHeight: 221,
    },
    fixedPlacement: {
      x: 6334,
      y: 4241,
    },
  },
  {
    id: 'product-budge',
    type: 'product',
    zoneId: 'products',
    width: 350,
    height: 213,
    isErasable: false,
    isCritical: true,
    productId: 'budge',
    name: 'Budge',
    tagline:
      'Standard travel tools assume you already know where you want to go. Budge inverts that. Give it a budget and a departure point - it surfaces where you can actually go, right now, for that amount. It runs as a continuous agent, pushing alerts when the right combination appears rather than waiting to be searched.',
    status: 'Under development',
    logo: {
      src: '/assets/Logos-01.png?v=20260608',
      width: 1239,
      height: 717,
      displayWidth: 480,
      displayHeight: 184,
    },
    fixedPlacement: {
      x: 731,
      y: 2304,
    },
  },
  {
    id: 'product-revamp',
    type: 'product',
    zoneId: 'products',
    width: 425,
    height: 275,
    isErasable: false,
    isCritical: true,
    productId: 'revamp',
    name: 'REVAMP',
    tagline:
      'When a housing block is retrofitted, its technical performance is measured carefully. How it feels to live in afterwards rarely is. REVAMP is a methodology for evaluating perceptual quality in built environments - giving residents a formal, measurable voice in how their spaces are transformed. The market-facing form is still in development.',
    status: 'Under development',
    logo: {
      src: '/assets/Logos-04.png?v=20260608',
      width: 2115,
      height: 610,
      displayWidth: 480,
      displayHeight: 184,
    },
    fixedPlacement: {
      x: 1378,
      y: 3676,
    },
  },
] as const satisfies readonly ProductDefinition[]

export const logoAnchors = [
  {
    id: 'hinc-logo-main',
    x: 3900,
    y: 2950,
    width: 598,
    height: 302,
  },
  {
    id: 'hinc-logo-upper-opening',
    x: 5150,
    y: 1450,
    width: 598,
    height: 302,
  },
  {
    id: 'hinc-logo-left-identity',
    x: 1680,
    y: 1655,
    width: 598,
    height: 302,
  },
] as const satisfies readonly LogoAnchorDefinition[]

export const mainLogoAnchor = logoAnchors[0]

export const assets = [
  {
    id: 'img01-street',
    type: 'image',
    zoneId: 'identity',
    src: '/assets/Img01.png',
    alt: 'Street scene with a family on a motorbike beside a red car.',
    width: 699,
    height: 421,
    isErasable: true,
    isCritical: false,
    variant: 'photo',
    fixedPlacement: {
      x: 415,
      y: 3130,
    },
  },
  {
    id: 'scr-anteater-01',
    type: 'sketch',
    zoneId: 'identity',
    src: '/assets/Scr01.png',
    alt: 'Large black graphic field used as a cropped spatial mark.',
    width: 1163,
    height: 1073,
    isErasable: true,
    isCritical: false,
    objectFit: 'contain',
    variant: 'graphic',
    fixedPlacement: {
      x: 450,
      y: 650,
    },
  },
  {
    id: 'identity-etymology',
    type: 'text',
    zoneId: 'opening',
    content: 'hic HERE\nhuc TO HERE\nhinc FROM HERE',
    width: 1900,
    height: 826,
    isErasable: false,
    isCritical: true,
    variant: 'etymology',
    fixedPlacement: {
      x: 4550,
      y: 3900,
    },
  },
  {
    id: 'contact-message-field',
    type: 'message',
    zoneId: 'opening',
    content: 'Get in touch. Share your thoughts.',
    width: 1460,
    height: 360,
    isErasable: false,
    isCritical: true,
    fixedPlacement: {
      x: 3000,
      y: 2050,
    },
  },
  {
    id: 'opening-body-statement',
    type: 'text',
    zoneId: 'opening',
    content:
      'We are Hinc.  We build artefacts that participate in the everyday lived experience. Not products that perform but things want to be part of your day to day. Technology that earns its place in your day without announcing why. Because not every useful thing needs to solve something. Some things just need to belong.',
    width: 720,
    height: 380,
    isErasable: false,
    isCritical: true,
    variant: 'body',
    fixedPlacement: {
      x: 3100,
      y: 2460,
    },
  },
  {
    id: 'philosophy-quote',
    type: 'text',
    zoneId: 'opening',
    content:
      '"We cannot choose where we are cast into this world, but it is only from here--confronting the exact landscape of our present existence--that we can begin to strip away illusions, embrace our ultimate responsibility, and design an authentic future."\n-- Heidegger',
    width: 825,
    height: 450,
    isErasable: false,
    isCritical: true,
    variant: 'quote',
    fixedPlacement: {
      x: 5950,
      y: 2340,
    },
  },
  {
    id: 'img03-sky',
    type: 'image',
    zoneId: 'opening',
    src: '/assets/Img03.png',
    alt: 'A single white cloud in blue sky.',
    width: 732,
    height: 1092,
    isErasable: true,
    isCritical: false,
    variant: 'photo',
    fixedPlacement: {
      x: 5300,
      y: 1790,
    },
  },
  {
    id: 'interactive-survey-prompt',
    type: 'survey',
    zoneId: 'opening',
    content: 'What do you absolutely hate about technology?',
    width: 813,
    height: 438,
    isErasable: false,
    isCritical: true,
    fixedPlacement: {
      x: 3220,
      y: 3820,
    },
  },
  {
    id: 'survey-technology-friction',
    type: 'survey',
    zoneId: 'opening',
    content: 'Where does technology make your day heavier than it needs to be?',
    width: 813,
    height: 438,
    isErasable: false,
    isCritical: true,
    fixedPlacement: {
      x: 4225,
      y: 1080,
    },
  },
  {
    id: 'survey-technology-room',
    type: 'survey',
    zoneId: 'opening',
    content: 'What would make a digital tool feel more human to you?',
    width: 813,
    height: 438,
    isErasable: false,
    isCritical: true,
    fixedPlacement: {
      x: 6940,
      y: 3300,
    },
  },
  {
    id: 'img02-columns',
    type: 'image',
    zoneId: 'opening',
    src: '/assets/Img02.jpg',
    alt: 'Silver architectural columns against blue sky.',
    width: 516,
    height: 675,
    isErasable: true,
    isCritical: false,
    variant: 'photo',
    fixedPlacement: {
      x: 2750,
      y: 3600,
    },
  },
  {
    id: 'img05-procession',
    type: 'image',
    zoneId: 'identity',
    src: '/assets/Img05.png',
    alt: 'Black and white street procession with musicians and flags.',
    width: 488,
    height: 651,
    isErasable: true,
    isCritical: false,
    variant: 'photo',
    fixedPlacement: {
      x: 7230,
      y: 1050,
    },
  },
  {
    id: 'img09-red-house',
    type: 'image',
    zoneId: 'identity',
    src: '/assets/Img09.jpg',
    alt: 'Red urban facade with blue-green doors and windows.',
    width: 463,
    height: 618,
    isErasable: true,
    isCritical: false,
    variant: 'photo',
    fixedPlacement: {
      x: 3700,
      y: 1000,
    },
  },
  {
    id: 'pix-planet-01',
    type: 'sketch',
    zoneId: 'opening',
    src: '/assets/Pix01.png',
    alt: 'Black pixelated circular graphic mass.',
    width: 984,
    height: 991,
    isErasable: true,
    isCritical: false,
    objectFit: 'contain',
    variant: 'graphic',
    fixedPlacement: {
      x: 6000,
      y: 2990,
    },
  },
  {
    id: 'pix-planet-02',
    type: 'sketch',
    zoneId: 'opening',
    src: '/assets/Pix02.png',
    alt: 'Black pixelated oval graphic mass.',
    width: 1476,
    height: 1033,
    isErasable: true,
    isCritical: false,
    objectFit: 'contain',
    variant: 'graphic',
    fixedPlacement: {
      x: 1430,
      y: 2350,
    },
  },
  {
    id: 'pix-planet-03',
    type: 'sketch',
    zoneId: 'opening',
    src: '/assets/Pix03.png',
    alt: 'Black pixelated circular graphic mass with contrasting interior.',
    width: 1476,
    height: 1033,
    isErasable: true,
    isCritical: false,
    objectFit: 'contain',
    variant: 'graphic',
    fixedPlacement: {
      x: 1910,
      y: 616,
    },
  },
  {
    id: 'scr-anteater-03',
    type: 'sketch',
    zoneId: 'opening',
    src: '/assets/Scr03.png',
    alt: 'Large black graphic field used as a cropped spatial mark.',
    width: 850,
    height: 813,
    isErasable: true,
    isCritical: false,
    objectFit: 'contain',
    variant: 'graphic',
    fixedPlacement: {
      x: 4700,
      y: 3425,
    },
  },
  ...products,
] as const satisfies readonly AssetDefinition[]
