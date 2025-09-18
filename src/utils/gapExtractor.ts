import type { CreatePodcastGapData } from '../types/podcast.type'

/**
 * Extract gaps from text content with [word] format
 * Example: "Hello [world] this is [test]"
 * Returns gaps with startIndex/endIndex positions
 */
export function extractGapsFromContent(content: string): {
  cleanContent: string
  gaps: CreatePodcastGapData[]
} {
  const gaps: CreatePodcastGapData[] = []
  let cleanContent = content
  let orderNo = 1

  // Regex để tìm [word] pattern
  const gapRegex = /\[([^\]]+)\]/g
  let match

  // Process từng match
  while ((match = gapRegex.exec(content)) !== null) {
    const answer = match[1] // word
    const matchStart = match.index

    // Tính toán vị trí trong clean content (không có brackets)
    const beforeMatch = content.substring(0, matchStart)
    const cleanBefore = beforeMatch.replace(/\[[^\]]+\]/g, '')
    const startIndex = cleanBefore.length
    const endIndex = startIndex + answer.length

    gaps.push({
      startIndex,
      endIndex,
      answer,
      orderNo: orderNo++,
    })
  }

  // Tạo clean content bằng cách replace [word] với word
  cleanContent = content.replace(/\[([^\]]+)\]/g, '$1')

  return {
    cleanContent,
    gaps,
  }
}

/**
 * Preview gaps trong content để user kiểm tra
 */
export function previewGapsInContent(content: string): string {
  const { gaps } = extractGapsFromContent(content)

  if (gaps.length === 0) {
    return 'Không tìm thấy gaps nào. Sử dụng format [từ] để đánh dấu chỗ trống.'
  }

  return (
    `Tìm thấy ${gaps.length} gaps:\n` +
    gaps
      .map(
        (gap) =>
          `${gap.orderNo}. "${gap.answer}" (vị trí ${gap.startIndex}-${gap.endIndex})`
      )
      .join('\n')
  )
}
