import type { CreatePodcastGapData } from '../types/podcast.type'

/**
 * Extract gaps from text content with [word] format
 * Example: "Hello [world] this is [test]"
 * Returns gaps with startIndex/endIndex positions
 *
 * Enhanced with better error handling and validation
 */
export function extractGapsFromContent(content: string): {
  cleanContent: string
  gaps: CreatePodcastGapData[]
} {
  const gaps: CreatePodcastGapData[] = []
  let cleanContent = content
  let orderNo = 1

  try {
    // Validate input
    if (!content || typeof content !== 'string') {
      return { cleanContent: '', gaps: [] }
    }

    // Regex để tìm [word] pattern - improved to handle nested brackets
    const gapRegex = /\[([^\[\]]+)\]/g
    let match
    const processedPositions: number[] = []

    // Process từng match
    while ((match = gapRegex.exec(content)) !== null) {
      const answer = match[1].trim() // word, remove extra spaces
      const matchStart = match.index
      const matchEnd = match.index + match[0].length

      // Skip if this position was already processed (avoid duplicates)
      if (
        processedPositions.some((pos) => pos >= matchStart && pos < matchEnd)
      ) {
        continue
      }

      // Validate answer
      if (!answer) {
        console.warn(`Empty gap found at position ${matchStart}`)
        continue
      }

      if (answer.length > 100) {
        console.warn(
          `Gap too long (${answer.length} chars) at position ${matchStart}, truncating`
        )
        answer.substring(0, 100)
      }

      // Tính toán vị trí trong clean content (không có brackets)
      const beforeMatch = content.substring(0, matchStart)
      const cleanBefore = beforeMatch.replace(/\[([^\[\]]+)\]/g, '$1')
      const startIndex = cleanBefore.length
      const endIndex = startIndex + answer.length

      // Validate positions
      if (startIndex < 0 || endIndex < startIndex) {
        console.warn(`Invalid gap positions: ${startIndex}-${endIndex}`)
        continue
      }

      gaps.push({
        startIndex,
        endIndex,
        answer,
        orderNo: orderNo++,
      })

      processedPositions.push(matchStart)
    }

    // Tạo clean content bằng cách replace [word] với word
    cleanContent = content.replace(/\[([^\[\]]+)\]/g, '$1')

    // Final validation
    if (gaps.length > 0) {
      // Sort gaps by startIndex to ensure proper order
      gaps.sort((a, b) => a.startIndex - b.startIndex)

      // Update orderNo after sorting
      gaps.forEach((gap, index) => {
        gap.orderNo = index + 1
      })

      // Check for overlapping gaps
      for (let i = 1; i < gaps.length; i++) {
        if (gaps[i].startIndex < gaps[i - 1].endIndex) {
          console.warn(
            `Overlapping gaps detected between gap ${i} and ${i + 1}`
          )
        }
      }
    }

    return {
      cleanContent,
      gaps,
    }
  } catch (error) {
    console.error('Error extracting gaps from content:', error)
    return {
      cleanContent: content.replace(/\[([^\[\]]*)\]/g, '$1'), // Fallback cleanup
      gaps: [],
    }
  }
}

/**
 * Preview gaps trong content để user kiểm tra
 * Enhanced with better formatting and validation
 */
export function previewGapsInContent(content: string): string {
  try {
    const { gaps, cleanContent } = extractGapsFromContent(content)

    if (gaps.length === 0) {
      return 'Không tìm thấy gaps nào. Sử dụng format [từ] để đánh dấu chỗ trống.'
    }

    // Validate that gaps make sense in context
    const issues: string[] = []
    gaps.forEach((gap, index) => {
      if (gap.answer.length > 50) {
        issues.push(`Gap ${index + 1}: Từ quá dài (${gap.answer.length} ký tự)`)
      }
      if (!/^[a-zA-Z0-9\s'-]+$/.test(gap.answer)) {
        issues.push(`Gap ${index + 1}: Chứa ký tự đặc biệt`)
      }
    })

    const preview =
      `Tìm thấy ${gaps.length} gaps:\n` +
      gaps
        .map(
          (gap) =>
            `${gap.orderNo}. "${gap.answer}" (vị trí ${gap.startIndex}-${gap.endIndex})`
        )
        .join('\n')

    if (issues.length > 0) {
      return preview + '\n\n⚠️ Cảnh báo:\n' + issues.join('\n')
    }

    // Show a sample of how it will look
    const sampleLength = Math.min(cleanContent.length, 200)
    const sample =
      cleanContent.substring(0, sampleLength) +
      (cleanContent.length > sampleLength ? '...' : '')

    return preview + '\n\n📝 Nội dung sau khi xử lý:\n' + sample
  } catch (error) {
    return (
      'Lỗi khi phân tích gaps: ' +
      (error instanceof Error ? error.message : 'Unknown error')
    )
  }
}

/**
 * Auto-generate gaps from plain content string using improved heuristics.
 * Returns the content with selected words wrapped in [brackets].
 * Enhanced with better word selection and validation.
 */
export function generateAutoGaps(
  content: string,
  // difficulty string or explicit number of gaps to generate
  difficultyOrCount:
    | 'beginner'
    | 'elementary'
    | 'intermediate'
    | 'upper_intermediate'
    | 'advanced'
    | number = 'intermediate'
): string {
  try {
    if (!content || !content.trim()) return content

    // Remove any existing brackets to avoid nested [[...]] when generating repeatedly
    content = content.replace(/\[+\s*([^\]]+?)\s*\]+/g, '$1')

    // Build tokens while preserving separators
    const parts = content.split(/(\b\w+\b)/)

    // total characters (excluding whitespace) to compute percent target
    const totalChars = content.replace(/\s+/g, '').length || 0

    // Collect candidate indices for word tokens with improved filtering
    const candidateIndices: Array<{
      index: number
      word: string
      priority: number
    }> = []

    for (let i = 0; i < parts.length; i++) {
      const token = parts[i]
      if (!token || !/^\w+$/.test(token)) continue

      // Filter out very short words and common words for better gaps
      const word = token.toLowerCase()
      let priority = 1

      // Skip very short words unless advanced difficulty
      if (
        word.length < 3 &&
        typeof difficultyOrCount === 'string' &&
        difficultyOrCount !== 'advanced'
      ) {
        continue
      }

      // Skip common words for beginner/elementary
      const commonWords = [
        'the',
        'and',
        'or',
        'but',
        'in',
        'on',
        'at',
        'to',
        'for',
        'of',
        'with',
        'by',
        'is',
        'are',
        'was',
        'were',
        'be',
        'been',
        'have',
        'has',
        'had',
        'do',
        'does',
        'did',
        'will',
        'would',
        'could',
        'should',
        'may',
        'might',
        'can',
        'a',
        'an',
        'this',
        'that',
        'these',
        'those',
      ]

      if (
        typeof difficultyOrCount === 'string' &&
        ['beginner', 'elementary'].includes(difficultyOrCount)
      ) {
        if (commonWords.includes(word)) {
          continue
        }
      }

      // Prioritize content words (nouns, verbs, adjectives, adverbs)
      if (word.length >= 4) priority += 1
      if (word.length >= 6) priority += 1
      if (/ing$|ed$|ly$|ion$|tion$|ness$|ment$/.test(word)) priority += 1 // Common suffixes

      candidateIndices.push({ index: i, word: token, priority })
    }

    if (candidateIndices.length === 0) return content

    // Sort by priority (higher priority first), then shuffle within same priority
    candidateIndices.sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority
      return Math.random() - 0.5 // Random within same priority
    })

    // Helper: shuffle array copy
    const shuffled = (arr: typeof candidateIndices) => {
      const a = arr.slice()
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[a[i], a[j]] = [a[j], a[i]]
      }
      return a
    }

    // Decide selection strategy
    let chosenIndices: number[] = []

    if (typeof difficultyOrCount === 'number') {
      // User requested explicit number of gaps
      const requested = Math.max(0, Math.floor(difficultyOrCount))
      if (requested > candidateIndices.length) {
        console.warn(
          `Requested ${requested} gaps but only ${candidateIndices.length} candidate words available. Using all candidates.`
        )
      }

      const limit = Math.min(requested, candidateIndices.length)
      // Take best candidates but add some randomness
      const topCandidates = candidateIndices.slice(
        0,
        Math.min(limit * 2, candidateIndices.length)
      )
      chosenIndices = shuffled(topCandidates)
        .slice(0, limit)
        .map((c) => c.index)
    } else {
      // difficulty string -> percent of characters to blank
      const percentMap: Record<string, number> = {
        beginner: 15, // Fewer, easier gaps
        elementary: 25, // More gaps but still selective
        intermediate: 35, // Moderate gaps
        upper_intermediate: 45, // More challenging
        advanced: 60, // Many gaps including function words
      }

      const percent = percentMap[difficultyOrCount] ?? 35
      const targetChars = Math.max(1, Math.round((totalChars * percent) / 100))

      // Prefer higher priority words but add randomness
      const pool = shuffled(candidateIndices)
      let accChars = 0
      for (const candidate of pool) {
        const len = candidate.word.length
        chosenIndices.push(candidate.index)
        accChars += len
        if (accChars >= targetChars) break
      }
    }

    // Final safety: ensure unique indices
    chosenIndices = Array.from(new Set(chosenIndices))

    // Wrap chosen tokens with brackets
    const chosenSet = new Set(chosenIndices)
    const out = parts.map((p, idx) => {
      if (chosenSet.has(idx)) {
        // ensure we don't wrap something that already includes brackets
        if (/^\[.*\]$/.test(p) || /^\[/.test(p) || /\]$/.test(p)) return p
        return `[${p}]`
      }
      return p
    })

    const result = out.join('')

    // Validate result
    const { gaps } = extractGapsFromContent(result)
    if (gaps.length === 0) {
      console.warn('Generated content produced no valid gaps')
      return content
    }

    return result
  } catch (error) {
    console.error('Error generating auto gaps:', error)
    return content
  }
}
