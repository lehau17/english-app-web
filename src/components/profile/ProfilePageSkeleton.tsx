export default function ProfilePageSkeleton() {
  return (
    <div className="min-h-screen space-y-6">
      {/* Profile Header Skeleton */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 p-8 animate-pulse">
        {/* Background blur effects */}
        <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-black/10 blur-3xl" />

        <div className="relative flex flex-col items-center gap-6 md:flex-row">
          <div className="relative">
            <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white/30 bg-white/20 md:h-32 md:w-32" />
            <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm" />
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="h-8 bg-white/30 rounded w-48 mb-2" />
            <div className="h-4 bg-white/20 rounded w-64 mb-3" />
            <div className="h-3 bg-white/20 rounded w-96 mb-4" />

            <div className="flex flex-wrap justify-center gap-3 md:justify-start">
              <div className="h-6 bg-white/20 rounded-full w-32 px-3 py-1" />
              <div className="h-6 bg-white/20 rounded-full w-24 px-3 py-1" />
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation Skeleton */}
      <div className="flex gap-1 rounded-2xl bg-gray-100 p-1">
        <div className="flex flex-1 items-center justify-center gap-2 h-12 bg-white rounded-xl shadow-sm animate-pulse">
          <div className="h-4 w-4 bg-gray-300 rounded" />
          <div className="h-4 w-16 bg-gray-300 rounded hidden sm:block" />
        </div>
        <div className="flex flex-1 items-center justify-center gap-2 h-12 bg-gray-50 rounded-xl animate-pulse">
          <div className="h-4 w-4 bg-gray-200 rounded" />
          <div className="h-4 w-12 bg-gray-200 rounded hidden sm:block" />
        </div>
      </div>

      {/* Tab Content Skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Personal Information Card */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <div className="mb-4 flex items-center justify-between">
              <div className="h-6 bg-gray-200 rounded w-40 animate-pulse" />
              <div className="flex items-center gap-2 h-8 bg-gray-100 rounded-lg px-3 py-2 animate-pulse">
                <div className="h-4 w-4 bg-gray-300 rounded" />
                <div className="h-4 w-12 bg-gray-300 rounded" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Tên hiển thị', width: 'w-32' },
                { label: 'Email', width: 'w-48' },
                { label: 'Tiểu sử', width: 'w-full' },
                { label: 'Quốc tịch', width: 'w-24' },
                { label: 'Múi giờ', width: 'w-36' },
                { label: 'Ngày tham gia', width: 'w-28' },
              ].map((field, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-20 animate-pulse" />
                  <div
                    className={`h-4 bg-gray-300 rounded ${field.width} animate-pulse`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Settings Actions Card */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <div className="mb-4">
              <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
            </div>

            <div className="space-y-3">
              {[
                {
                  title: 'Thông tin cá nhân',
                  desc: 'Cập nhật thông tin cơ bản',
                },
                { title: 'Bảo mật', desc: 'Đổi mật khẩu và cài đặt bảo mật' },
              ].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-gray-100 p-4 animate-pulse"
                >
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-48" />
                  </div>
                  <div className="h-5 w-5 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <div className="h-6 bg-gray-200 rounded w-24 mb-4 animate-pulse" />
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-4 bg-gray-100 rounded w-full animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
