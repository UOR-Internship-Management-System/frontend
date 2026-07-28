export const gatewayCaptions = [
  {
    id: 'profile',
    text: 'Build your academic profile.',
  },
  {
    id: 'skills',
    text: 'Showcase skills and experience.',
  },
  {
    id: 'opportunities',
    text: 'Connect with the right opportunities.',
  },
] as const

export const gatewayCaptionTexts = gatewayCaptions.map((caption) => caption.text)

export type GatewayCaption = (typeof gatewayCaptions)[number]
