import { renderPostOg, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og'

export const runtime = 'nodejs'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = 'abay.tech post preview'

export default async function Image() {
  return renderPostOg('stacking-symbolic-memory')
}
