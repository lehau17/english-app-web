import {
  Calendar,
  Edit3,
  Gift,
  Plus,
  Settings,
  Star,
  Trash2,
  Users,
} from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import {
  useParentChildrenQuery,
  useParentRewardsQuery,
} from '../hooks/parent.queries'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createParentRewardApi,
  deleteParentRewardApi,
  toggleParentRewardApi,
  updateParentRewardApi,
} from '../services/parent.api'
import { toast } from 'react-hot-toast'

interface CreateRewardModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (reward: any) => void
  editReward?: any
  childrenOptions?: Array<{ id: string; name: string }>
}

function CreateRewardModal({
  isOpen,
  onClose,
  onSubmit,
  editReward,
  childrenOptions = [],
}: CreateRewardModalProps) {
  const [formData, setFormData] = useState({
    title: editReward?.title || '',
    description: editReward?.description || '',
    type: editReward?.type || 'privilege',
    imageUrl: editReward?.imageUrl || '',
    targetChildId: editReward?.targetChildId || '',
  })

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {editReward ? 'Sửa phần thưởng' : 'Tạo phần thưởng mới'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên phần thưởng
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ví dụ: 30 phút xem TV thêm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Mô tả chi tiết về phần thưởng..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loại phần thưởng
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="privilege">Đặc quyền</option>
              <option value="activity">Hoạt động</option>
              <option value="item">Vật phẩm</option>
              <option value="experience">Trải nghiệm</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dành cho con
            </label>
            <select
              value={formData.targetChildId}
              onChange={(e) =>
                setFormData({ ...formData, targetChildId: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Chọn --</option>
              {childrenOptions?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button type="submit" className="flex-1">
              {editReward ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ParentRewardsPage() {
  const queryClient = useQueryClient()
  const { data: rewardsData, isLoading: rewardsLoading } =
    useParentRewardsQuery()
  const { data: childrenData } = useParentChildrenQuery()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingReward, setEditingReward] = useState(null)
  const [selectedFilter, setSelectedFilter] = useState('all')

  const rewards = (rewardsData as any)?.data || rewardsData || []
  const children = useMemo(
    () => (childrenData as any)?.data || childrenData || [],
    [childrenData]
  )

  const createMutation = useMutation({
    mutationFn: createParentRewardApi,
    onSuccess: async () => {
      toast.success('Tạo phần thưởng thành công')
      await queryClient.invalidateQueries({ queryKey: ['parent-rewards'] })
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message || 'Tạo phần thưởng thất bại'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ rewardId, payload }: { rewardId: string; payload: any }) =>
      updateParentRewardApi(rewardId, payload),
    onSuccess: async () => {
      toast.success('Cập nhật phần thưởng thành công')
      await queryClient.invalidateQueries({ queryKey: ['parent-rewards'] })
    },
    onError: (e: any) =>
      toast.error(
        e?.response?.data?.message || 'Cập nhật phần thưởng thất bại'
      ),
  })

  const deleteMutation = useMutation({
    mutationFn: (rewardId: string) => deleteParentRewardApi(rewardId),
    onSuccess: async () => {
      toast.success('Xoá phần thưởng thành công')
      await queryClient.invalidateQueries({ queryKey: ['parent-rewards'] })
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message || 'Xoá phần thưởng thất bại'),
  })

  const toggleMutation = useMutation({
    mutationFn: (rewardId: string) => toggleParentRewardApi(rewardId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['parent-rewards'] })
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message || 'Cập nhật trạng thái thất bại'),
  })

  const filteredRewards = rewards.filter((reward: any) => {
    if (selectedFilter === 'all') return true
    if (selectedFilter === 'active') return reward.isActive
    if (selectedFilter === 'inactive') return !reward.isActive
    return reward.type === selectedFilter
  })

  const handleCreateReward = async (rewardData: any) => {
    if (!rewardData.targetChildId) {
      toast.error('Vui lòng chọn con áp dụng phần thưởng')
      return
    }
    await createMutation.mutateAsync(rewardData)
  }

  const handleEditReward = async (rewardData: any) => {
    const eid = (editingReward as any)?.id
    if (!eid) return
    await updateMutation.mutateAsync({ rewardId: eid, payload: rewardData })
    setEditingReward(null)
  }

  const handleDeleteReward = (rewardId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa phần thưởng này?')) {
      deleteMutation.mutate(rewardId)
    }
  }

  const handleToggleReward = (rewardId: string) => {
    toggleMutation.mutate(rewardId)
  }

  if (rewardsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="mx-auto max-w-4xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded-lg w-48 mb-6"></div>
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Quản lý phần thưởng
            </h1>
            <p className="text-gray-600">
              Tạo và quản lý phần thưởng động viên con học tập
            </p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Tạo phần thưởng
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Gift className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng phần thưởng</p>
                <p className="text-xl font-semibold">{rewards.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Star className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Đang hoạt động</p>
                <p className="text-xl font-semibold">
                  {rewards.filter((r: any) => r.isActive).length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Đã nhận</p>
                <p className="text-xl font-semibold">
                  {rewards.reduce(
                    (sum: number, r: any) => sum + r.claimsCount,
                    0
                  )}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tuần này</p>
                <p className="text-xl font-semibold">0</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'active', label: 'Đang hoạt động' },
            { key: 'inactive', label: 'Tạm dừng' },
            // Filter by UI-mapped types
            { key: 'privilege', label: 'Đặc quyền' },
            { key: 'activity', label: 'Hoạt động' },
            { key: 'item', label: 'Vật phẩm' },
            { key: 'experience', label: 'Trải nghiệm' },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setSelectedFilter(filter.key)}
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                selectedFilter === filter.key
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Rewards List */}
        <div className="space-y-4">
          {filteredRewards.length === 0 ? (
            <Card className="p-8 text-center">
              <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có phần thưởng nào
              </h3>
              <p className="text-gray-600 mb-4">
                Tạo phần thưởng đầu tiên để động viên con học tập
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Tạo phần thưởng
              </Button>
            </Card>
          ) : (
            filteredRewards.map((reward: any) => (
              <Card key={reward.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Gift className="h-6 w-6 text-purple-600" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {reward.title}
                        </h3>
                        <Badge
                          variant={reward.isActive ? 'default' : 'secondary'}
                        >
                          {reward.isActive ? 'Hoạt động' : 'Tạm dừng'}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {reward.type}
                        </Badge>
                      </div>

                      {reward.description && (
                        <p className="text-gray-600 mb-3">
                          {reward.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {reward.claimsCount} lần nhận
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(reward.createdAt).toLocaleDateString(
                            'vi-VN'
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleReward(reward.id)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingReward(reward)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteReward(reward.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Create/Edit Modal */}
        <CreateRewardModal
          isOpen={isCreateModalOpen || !!editingReward}
          onClose={() => {
            setIsCreateModalOpen(false)
            setEditingReward(null)
          }}
          onSubmit={editingReward ? handleEditReward : handleCreateReward}
          editReward={editingReward}
          childrenOptions={children?.map((c: any) => ({
            id: c.id,
            name: c.name,
          }))}
        />
      </div>
    </div>
  )
}
