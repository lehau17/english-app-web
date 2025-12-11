import type { JSX } from 'react'
import type { Activity } from '../../../types/learn.type'

export function RightSidebar({
  activity,
}: {
  activity?: Activity
}): JSX.Element {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4">
        <h4 className="mb-2 text-sm sm:text-base font-semibold">Gợi ý</h4>
        {activity?.hints?.length ? (
          <ul className="list-disc pl-4 sm:pl-5 text-xs sm:text-sm text-gray-700 space-y-1">
            {activity.hints!.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        ) : (
          <p className="text-xs sm:text-sm text-gray-500">
            Không có gợi ý cho hoạt động này.
          </p>
        )}
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4">
        <h4 className="mb-2 text-sm sm:text-base font-semibold">Tài liệu</h4>
        {activity?.materials?.length ? (
          <ul className="space-y-2 text-xs sm:text-sm text-blue-700">
            {activity.materials!.map((m) => (
              <li key={m.label}>
                <a
                  className="hover:underline break-words"
                  href={m.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {m.label}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs sm:text-sm text-gray-500">
            Chưa có tài liệu đính kèm.
          </p>
        )}
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4">
        <h4 className="mb-2 text-sm sm:text-base font-semibold">Ghi chú</h4>
        <textarea
          className="w-full rounded-lg border border-gray-300 p-2 text-xs sm:text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          rows={5}
          placeholder="Ghi chú nhanh trong lúc học..."
        />
      </div>
    </div>
  )
}
