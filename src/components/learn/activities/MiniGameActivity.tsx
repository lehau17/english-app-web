import { Sparkles } from 'lucide-react'
import { useMemo, useState, type JSX } from 'react'
import type { MiniGameContent } from '../../../types/learn.type'
import { shuffle } from '../../../utils/learn.utils'

export function MiniGameActivity({
  data,
  onPass,
}: {
  data: MiniGameContent
  onPass: () => void
}): JSX.Element {
  const [round, setRound] = useState(1)
  const [hits, setHits] = useState(0)
  const words = useMemo(() => shuffle([...data.pool]), [data.pool])
  function clickWord(w: string) {
    if (w === data.target) {
      const nhits = hits + 1
      setHits(nhits)
      if (nhits >= data.rounds) onPass()
      else setRound((r) => r + 1)
    }
  }
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5" /> Tìm từ:{' '}
          <span className="text-blue-700">{data.target}</span>
        </h3>
        <div className="text-sm text-gray-600">
          Vòng {round}/{data.rounds} · Trúng: {hits}
        </div>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {words.map((w, i) => (
          <button
            key={i}
            onClick={() => clickWord(w)}
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm hover:bg-blue-50 hover:border-blue-300"
          >
            {w}
          </button>
        ))}
      </div>
    </div>
  )
}
