import {ImageResponse} from 'next/og'

import {horseDataUri, logoDataUri} from './og-art'

export const alt = 'Shiny Thing Coffee — Coming Soon'
export const size = {width: 1200, height: 630}
export const contentType = 'image/png'

const horseSrc = horseDataUri
const logoSrc = logoDataUri

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fff1e7',
        }}
      >
        <img src={horseSrc} width={214} height={240} alt="" />
        <img src={logoSrc} width={460} height={69} alt="" style={{marginTop: 28}} />
        <div
          style={{
            display: 'flex',
            marginTop: 14,
            fontSize: 40,
            letterSpacing: 16,
            fontWeight: 700,
            color: '#ff0000',
          }}
        >
          COFFEE
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 34,
            fontSize: 24,
            letterSpacing: 6,
            color: '#6ad0ef',
          }}
        >
          COMING SOON / 519 HAGAN AVE
        </div>
      </div>
    ),
    {...size},
  )
}
