import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Clock, Plus, Trash2, Trophy, X } from 'lucide-react'
import React, { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { createAssignment } from '../../services/assignment.api'
import type { AssignmentCreateRequest } from '../../types/assignment.type'
import type { ActivityType } from '../../types/learn.type'

type Props = {
  isOpen: boolean
  classroomId: string
  onClose: () => void
}

type ExtendedActivityType =
  | ActivityType
  | 'fill_blank'
  | 'dictation'
  | 'matching'

const ACTIVITY_TYPES: ExtendedActivityType[] = [
  'quiz',
  'vocab',
  'listening',
  'pronunciation',
  'speaking',
  'mini_game',
  'reading',
  'writing',
  'grammar',
  'flashcard',
  'conversation',
  'fill_blank',
  'dictation',
  'matching',
]

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <h4 className="font-semibold mb-3">{title}</h4>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Labeled({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  )
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={
        'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ' +
        (props.className ?? '')
      }
    />
  )
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={
        'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none ' +
        (props.className ?? '')
      }
    />
  )
}

export default function CreateAssignmentModal({
  isOpen,
  classroomId,
  onClose,
  ...rest
}: Props & {
  mode?: 'create' | 'edit'
  assignmentId?: string
  initialValues?: AssignmentCreateRequest
  onSubmitted?: () => void
}) {
  const mode = rest.mode ?? 'create'

  console.log('🚀 CreateAssignmentModal render:', {
    isOpen,
    mode,
    hasInitialValues: !!rest.initialValues,
    initialActivitiesCount: rest.initialValues?.activities?.length,
  })

  const queryClient = useQueryClient()
  const { register, control, handleSubmit, watch, setValue, reset } =
    useForm<AssignmentCreateRequest>({
      defaultValues: rest.initialValues ?? {
        title: '',
        description: '',
        instructions: '',
        isPublished: false,
        totalPoints: 100,
        maxAttempts: 1,
        timeLimit: undefined,
        activities: [],
      },
    })

  const {
    fields: actFields,
    append: addAct,
    remove: removeAct,
    replace: replaceActivities,
  } = useFieldArray({ control, name: 'activities' })

  // Reset form when initialValues change (for edit mode)
  useEffect(() => {
    if (rest.initialValues && mode === 'edit') {
      console.log('🔄 Resetting form with initialValues:', rest.initialValues)
      console.log('📋 Activities count:', rest.initialValues.activities?.length)
      rest.initialValues.activities?.forEach((activity, index) => {
        console.log(`📝 Activity ${index}:`, {
          type: activity.type,
          title: activity.title,
          content: activity.content,
        })
      })

      // Reset the entire form
      reset(rest.initialValues)

      // Also manually replace field array to ensure it updates
      if (rest.initialValues.activities) {
        replaceActivities(rest.initialValues.activities)
      }

      // Also manually ensure field array is updated
      setTimeout(() => {
        console.log('📊 After reset - actFields length:', actFields.length)
      }, 100)
    }
  }, [rest.initialValues, mode, reset, actFields.length])

  // Debug log current field array state
  useEffect(() => {
    console.log('📊 Current actFields length:', actFields.length)
    actFields.forEach((field, index) => {
      console.log(`📋 Field ${index}:`, field)
    })
  }, [actFields])

  const mutation = useMutation({
    mutationFn: (payload: AssignmentCreateRequest) =>
      mode === 'edit' && rest.assignmentId
        ? (async () => {
            const { updateAssignment } = await import(
              '../../services/assignment.api'
            )
            return updateAssignment(classroomId, rest.assignmentId!, payload)
          })()
        : createAssignment(classroomId, payload),
    onSuccess: () => {
      toast.success('Tạo bài tập thành công')
      queryClient.invalidateQueries({
        queryKey: ['classroom-detail', classroomId],
      })
      onClose()
      rest.onSubmitted?.()
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.message || 'Tạo bài tập thất bại')
    },
  })

  if (!isOpen) return null

  const addActivityOf = (type: ExtendedActivityType) => {
    const base = {
      type,
      title: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' '),
      points: 10,
      maxAttempts: 1,
      content: {},
    }
    // seed minimal content per type
    switch (type) {
      case 'quiz':
      case 'reading':
      case 'grammar':
        ;(base as any).content = {
          question: '',
          options: ['', ''],
          correctIndex: 0,
        }
        break
      case 'listening':
        ;(base as any).content = {
          audioUrl: '',
          prompt: '',
          options: ['', ''],
          correctIndex: 0,
        }
        break
      case 'vocab':
        ;(base as any).content = { items: [{ word: '', definition: '' }] }
        break
      case 'pronunciation':
        ;(base as any).content = { phrase: '', tips: [] }
        break
      case 'speaking':
        ;(base as any).content = { prompt: '', minSeconds: 10, tips: [] }
        break
      case 'mini_game':
        ;(base as any).content = { target: '', pool: [], rounds: 3 }
        break
      case 'writing':
        ;(base as any).content = { prompt: '', minWords: 50, rubric: [] }
        break
      case 'flashcard':
        ;(base as any).content = { cards: [{ front: '', back: '' }] }
        break
      case 'conversation':
        ;(base as any).content = {
          scenario: '',
          initialDialog: [{ role: 'assistant', text: '' }],
          suggestions: [],
        }
        break
      case 'fill_blank':
        ;(base as any).content = { passage: '', blanks: [''] }
        break
      case 'dictation':
        ;(base as any).content = {
          audioUrl: '',
          transcript: '',
          minWords: 0,
        }
        break
      case 'matching':
        ;(base as any).content = { pairs: [{ left: '', right: '' }] }
        break
    }
    addAct(base as any)
  }

  const onSubmit = (values: AssignmentCreateRequest) => {
    // ensure dueDate ISO if provided (from datetime-local)
    const due = (values as any).dueDate as any
    const payload: AssignmentCreateRequest = {
      ...values,
      dueDate: due ? new Date(due).toISOString() : undefined,
      isPublished:
        typeof values.isPublished === 'string'
          ? values.isPublished === 'true'
          : !!values.isPublished,
    }
    mutation.mutate(payload)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">
            {mode === 'edit' ? 'Chỉnh sửa bài tập' : 'Tạo bài tập'}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Section title="Thông tin bài tập">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Labeled label="Tiêu đề">
                <TextInput
                  placeholder="Ví dụ: Unit 3 – Practice"
                  {...register('title', { required: true })}
                />
              </Labeled>
              <Labeled label="Hạn nộp">
                <TextInput type="datetime-local" {...register('dueDate')} />
              </Labeled>
              <Labeled label="Mô tả">
                <TextArea
                  rows={2}
                  placeholder="Mô tả ngắn cho học sinh"
                  {...register('description')}
                />
              </Labeled>
              <Labeled label="Hướng dẫn chung">
                <TextArea
                  rows={2}
                  placeholder="Lưu ý khi làm bài"
                  {...register('instructions')}
                />
              </Labeled>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Labeled label="Tổng điểm">
                <TextInput
                  type="number"
                  min={0}
                  {...register('totalPoints', { valueAsNumber: true })}
                />
              </Labeled>
              <Labeled label="Giới hạn thời gian (phút)">
                <TextInput
                  type="number"
                  min={0}
                  {...register('timeLimit', { valueAsNumber: true })}
                />
              </Labeled>
              <Labeled label="Số lần làm tối đa">
                <TextInput
                  type="number"
                  min={1}
                  defaultValue={1}
                  {...register('maxAttempts', { valueAsNumber: true })}
                />
              </Labeled>
              <Labeled label="Trạng thái">
                <select
                  {...register('isPublished')}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="false">Nháp</option>
                  <option value="true">Xuất bản</option>
                </select>
              </Labeled>
            </div>
          </Section>

          <Section title="Hoạt động trong bài tập">
            <div className="flex flex-wrap gap-2">
              {ACTIVITY_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => addActivityOf(t)}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4" /> {t.replace('_', ' ')}
                </button>
              ))}
            </div>

            {actFields.length === 0 && (
              <p className="text-sm text-gray-500">
                Chưa có hoạt động. Hãy chọn loại để thêm.
              </p>
            )}

            <div className="space-y-4">
              {actFields.map((f, idx) => {
                const type = watch(
                  `activities.${idx}.type`
                ) as ExtendedActivityType
                return (
                  <div key={f.id} className="rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-blue-700">
                          #{idx + 1}
                        </span>
                        <span className="font-medium capitalize">
                          {type?.replace('_', ' ') || 'activity'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => removeAct(idx)}
                          className="rounded-lg p-2 hover:bg-red-50 text-red-600"
                          title="Xóa hoạt động"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Labeled label="Tiêu đề hoạt động">
                          <TextInput
                            {...register(`activities.${idx}.title` as const)}
                            placeholder="Ví dụ: Quiz 1"
                          />
                        </Labeled>
                        <Labeled label="Điểm">
                          <TextInput
                            type="number"
                            min={0}
                            {...register(`activities.${idx}.points` as const, {
                              valueAsNumber: true,
                            })}
                          />
                        </Labeled>
                        <Labeled label="Thời gian (phút)">
                          <TextInput
                            type="number"
                            min={0}
                            {...register(
                              `activities.${idx}.timeLimit` as const,
                              { valueAsNumber: true }
                            )}
                          />
                        </Labeled>
                        <Labeled label="Qua bài khi ≥ điểm">
                          <TextInput
                            type="number"
                            min={0}
                            {...register(
                              `activities.${idx}.passingScore` as const,
                              { valueAsNumber: true }
                            )}
                          />
                        </Labeled>
                        <Labeled label="Số lần làm tối đa">
                          <TextInput
                            type="number"
                            min={1}
                            defaultValue={1}
                            {...register(
                              `activities.${idx}.maxAttempts` as const,
                              { valueAsNumber: true }
                            )}
                          />
                        </Labeled>
                        <Labeled label="Hướng dẫn">
                          <TextArea
                            rows={2}
                            placeholder="Gợi ý cho học sinh"
                            {...register(
                              `activities.${idx}.instructions` as const
                            )}
                          />
                        </Labeled>
                      </div>

                      {/* Type specific form */}
                      <TypeSpecificFields
                        idx={idx}
                        type={type}
                        register={register}
                        setValue={setValue}
                        watch={watch}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </Section>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {mutation.isPending ? (
                <span className="inline-flex items-center gap-2">
                  <Clock className="h-4 w-4 animate-spin" /> Đang tạo...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <Trophy className="h-4 w-4" /> Tạo bài tập
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Type-specific form renderer
function TypeSpecificFields({
  idx,
  type,
  register,
  setValue,
  watch,
}: {
  idx: number
  type: any
  register: any
  setValue: any
  watch: any
}) {
  const basePath = `activities.${idx}.content`
  const val = (name: string) => watch(`${basePath}.${name}`)

  // helpers for array fields
  const addTo = (name: string, item: any) => {
    const arr = (val(name) as any[]) || []
    setValue(`${basePath}.${name}` as any, [...arr, item])
  }
  const removeAt = (name: string, i: number) => {
    const arr = (val(name) as any[]) || []
    setValue(
      `${basePath}.${name}` as any,
      arr.filter((_, idx) => idx !== i)
    )
  }

  switch (type) {
    case 'quiz':
    case 'reading':
    case 'grammar':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Labeled label="Câu hỏi">
            <TextArea rows={3} {...register(`${basePath}.question` as const)} />
          </Labeled>
          <Labeled label="Giải thích (tuỳ chọn)">
            <TextArea
              rows={3}
              {...register(`${basePath}.explanation` as const)}
            />
          </Labeled>
          <div className="md:col-span-2">
            <Labeled label="Phương án trả lời">
              <div className="space-y-2">
                {((val('options') as string[]) || []).map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <TextInput
                      defaultValue={opt}
                      onChange={(e) => {
                        const arr = [...((val('options') as string[]) || [])]
                        arr[i] = e.target.value
                        setValue(`${basePath}.options` as any, arr)
                      }}
                    />
                    <button
                      type="button"
                      className="rounded-lg p-2 hover:bg-gray-100"
                      onClick={() => removeAt('options', i)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
                  onClick={() => addTo('options', '')}
                >
                  <Plus className="h-4 w-4 inline mr-1" /> Thêm phương án
                </button>
              </div>
            </Labeled>
          </div>
          <Labeled label="Đáp án đúng (index)">
            <TextInput
              type="number"
              min={0}
              max={Math.max(0, ((val('options') as string[]) || []).length - 1)}
              {...register(`${basePath}.correctIndex` as const, {
                valueAsNumber: true,
                validate: (value: number) => {
                  const options = val('options') as string[]
                  if (!options || options.length === 0)
                    return 'Cần có ít nhất 1 lựa chọn'
                  if (value < 0 || value >= options.length) {
                    return `Index phải từ 0 đến ${options.length - 1}`
                  }
                  return true
                },
              })}
            />
          </Labeled>
        </div>
      )
    case 'listening':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Labeled label="Audio URL">
            <TextInput {...register(`${basePath}.audioUrl` as const)} />
          </Labeled>
          <Labeled label="Prompt">
            <TextInput {...register(`${basePath}.prompt` as const)} />
          </Labeled>
          <div className="md:col-span-2">
            <Labeled label="Phương án">
              <div className="space-y-2">
                {((val('options') as string[]) || []).map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <TextInput
                      defaultValue={opt}
                      onChange={(e) => {
                        const arr = [...((val('options') as string[]) || [])]
                        arr[i] = e.target.value
                        setValue(`${basePath}.options` as any, arr)
                      }}
                    />
                    <button
                      type="button"
                      className="rounded-lg p-2 hover:bg-gray-100"
                      onClick={() => removeAt('options', i)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
                  onClick={() => addTo('options', '')}
                >
                  <Plus className="h-4 w-4 inline mr-1" /> Thêm phương án
                </button>
              </div>
            </Labeled>
          </div>
          <Labeled label="Đáp án đúng (index)">
            <TextInput
              type="number"
              min={0}
              max={Math.max(0, ((val('options') as string[]) || []).length - 1)}
              {...register(`${basePath}.correctIndex` as const, {
                valueAsNumber: true,
                validate: (value: number) => {
                  const options = val('options') as string[]
                  if (!options || options.length === 0)
                    return 'Cần có ít nhất 1 lựa chọn'
                  if (value < 0 || value >= options.length) {
                    return `Index phải từ 0 đến ${options.length - 1}`
                  }
                  return true
                },
              })}
            />
          </Labeled>
        </div>
      )
    case 'vocab':
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Từ vựng</span>
            <button
              type="button"
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
              onClick={() => addTo('items', { word: '', definition: '' })}
            >
              <Plus className="h-4 w-4 inline mr-1" /> Thêm từ
            </button>
          </div>
          {((val('items') as any[]) || []).map((it, i) => (
            <div
              key={i}
              className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end"
            >
              <Labeled label="Từ">
                <TextInput
                  defaultValue={it.word}
                  onChange={(e) => {
                    const arr = [...((val('items') as any[]) || [])]
                    arr[i] = { ...arr[i], word: e.target.value }
                    setValue(`${basePath}.items` as any, arr)
                  }}
                />
              </Labeled>
              <Labeled label="Định nghĩa">
                <TextInput
                  defaultValue={it.definition}
                  onChange={(e) => {
                    const arr = [...((val('items') as any[]) || [])]
                    arr[i] = { ...arr[i], definition: e.target.value }
                    setValue(`${basePath}.items` as any, arr)
                  }}
                />
              </Labeled>
              <button
                type="button"
                className="rounded-lg p-2 hover:bg-gray-100 justify-self-start"
                onClick={() => removeAt('items', i)}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )
    case 'pronunciation':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Labeled label="Cụm từ">
            <TextInput {...register(`${basePath}.phrase` as const)} />
          </Labeled>
          <Labeled label="Audio mẫu (tuỳ chọn)">
            <TextInput {...register(`${basePath}.sampleUrl` as const)} />
          </Labeled>
          <div className="md:col-span-2">
            <Labeled label="Mẹo phát âm">
              <div className="space-y-2">
                {((val('tips') as string[]) || []).map((t, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <TextInput
                      defaultValue={t}
                      onChange={(e) => {
                        const arr = [...((val('tips') as string[]) || [])]
                        arr[i] = e.target.value
                        setValue(`${basePath}.tips` as any, arr)
                      }}
                    />
                    <button
                      type="button"
                      className="rounded-lg p-2 hover:bg-gray-100"
                      onClick={() => removeAt('tips', i)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
                  onClick={() => addTo('tips', '')}
                >
                  <Plus className="h-4 w-4 inline mr-1" /> Thêm mẹo
                </button>
              </div>
            </Labeled>
          </div>
        </div>
      )
    case 'speaking':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Labeled label="Đề bài">
            <TextArea rows={3} {...register(`${basePath}.prompt` as const)} />
          </Labeled>
          <Labeled label="Số giây tối thiểu">
            <TextInput
              type="number"
              min={0}
              {...register(`${basePath}.minSeconds` as const, {
                valueAsNumber: true,
              })}
            />
          </Labeled>
          <div className="md:col-span-2">
            <Labeled label="Gợi ý">
              <div className="space-y-2">
                {((val('tips') as string[]) || []).map((t, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <TextInput
                      defaultValue={t}
                      onChange={(e) => {
                        const arr = [...((val('tips') as string[]) || [])]
                        arr[i] = e.target.value
                        setValue(`${basePath}.tips` as any, arr)
                      }}
                    />
                    <button
                      type="button"
                      className="rounded-lg p-2 hover:bg-gray-100"
                      onClick={() => removeAt('tips', i)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
                  onClick={() => addTo('tips', '')}
                >
                  <Plus className="h-4 w-4 inline mr-1" /> Thêm gợi ý
                </button>
              </div>
            </Labeled>
          </div>
        </div>
      )
    case 'mini_game':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Labeled label="Mục tiêu">
            <TextInput {...register(`${basePath}.target` as const)} />
          </Labeled>
          <Labeled label="Số vòng">
            <TextInput
              type="number"
              min={1}
              {...register(`${basePath}.rounds` as const, {
                valueAsNumber: true,
              })}
            />
          </Labeled>
          <div className="md:col-span-2">
            <Labeled label="Tập lựa chọn">
              <div className="space-y-2">
                {((val('pool') as string[]) || []).map((t, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <TextInput
                      defaultValue={t}
                      onChange={(e) => {
                        const arr = [...((val('pool') as string[]) || [])]
                        arr[i] = e.target.value
                        setValue(`${basePath}.pool` as any, arr)
                      }}
                    />
                    <button
                      type="button"
                      className="rounded-lg p-2 hover:bg-gray-100"
                      onClick={() => removeAt('pool', i)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
                  onClick={() => addTo('pool', '')}
                >
                  <Plus className="h-4 w-4 inline mr-1" /> Thêm từ
                </button>
              </div>
            </Labeled>
          </div>
        </div>
      )
    case 'writing':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Labeled label="Đề bài viết">
            <TextArea rows={3} {...register(`${basePath}.prompt` as const)} />
          </Labeled>
          <Labeled label="Số từ tối thiểu">
            <TextInput
              type="number"
              min={0}
              {...register(`${basePath}.minWords` as const, {
                valueAsNumber: true,
              })}
            />
          </Labeled>
          <div className="md:col-span-2">
            <Labeled label="Tiêu chí chấm (rubric)">
              <div className="space-y-2">
                {((val('rubric') as string[]) || []).map((t, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <TextInput
                      defaultValue={t}
                      onChange={(e) => {
                        const arr = [...((val('rubric') as string[]) || [])]
                        arr[i] = e.target.value
                        setValue(`${basePath}.rubric` as any, arr)
                      }}
                    />
                    <button
                      type="button"
                      className="rounded-lg p-2 hover:bg-gray-100"
                      onClick={() => removeAt('rubric', i)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
                  onClick={() => addTo('rubric', '')}
                >
                  <Plus className="h-4 w-4 inline mr-1" /> Thêm tiêu chí
                </button>
              </div>
            </Labeled>
          </div>
        </div>
      )
    case 'flashcard':
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Thẻ</span>
            <button
              type="button"
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
              onClick={() => addTo('cards', { front: '', back: '' })}
            >
              <Plus className="h-4 w-4 inline mr-1" /> Thêm thẻ
            </button>
          </div>
          {((val('cards') as any[]) || []).map((it, i) => (
            <div
              key={i}
              className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end"
            >
              <Labeled label="Mặt trước">
                <TextInput
                  defaultValue={it.front}
                  onChange={(e) => {
                    const arr = [...((val('cards') as any[]) || [])]
                    arr[i] = { ...arr[i], front: e.target.value }
                    setValue(`${basePath}.cards` as any, arr)
                  }}
                />
              </Labeled>
              <Labeled label="Mặt sau">
                <TextInput
                  defaultValue={it.back}
                  onChange={(e) => {
                    const arr = [...((val('cards') as any[]) || [])]
                    arr[i] = { ...arr[i], back: e.target.value }
                    setValue(`${basePath}.cards` as any, arr)
                  }}
                />
              </Labeled>
              <button
                type="button"
                className="rounded-lg p-2 hover:bg-gray-100 justify-self-start"
                onClick={() => removeAt('cards', i)}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )
    case 'conversation':
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Labeled label="Tình huống">
              <TextInput {...register(`${basePath}.scenario` as const)} />
            </Labeled>
          </div>
          <Section title="Đoạn hội thoại ban đầu">
            <div className="space-y-2">
              {((val('initialDialog') as any[]) || []).map((m, i) => (
                <div
                  key={i}
                  className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end"
                >
                  <Labeled label="Vai">
                    <select
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      value={m.role}
                      onChange={(e) => {
                        const arr = [...((val('initialDialog') as any[]) || [])]
                        arr[i] = { ...arr[i], role: e.target.value }
                        setValue(`${basePath}.initialDialog` as any, arr)
                      }}
                    >
                      <option value="assistant">assistant</option>
                      <option value="user">user</option>
                    </select>
                  </Labeled>
                  <div className="md:col-span-3">
                    <Labeled label="Nội dung">
                      <TextInput
                        defaultValue={m.text}
                        onChange={(e) => {
                          const arr = [
                            ...((val('initialDialog') as any[]) || []),
                          ]
                          arr[i] = { ...arr[i], text: e.target.value }
                          setValue(`${basePath}.initialDialog` as any, arr)
                        }}
                      />
                    </Labeled>
                  </div>
                  <button
                    type="button"
                    className="rounded-lg p-2 hover:bg-gray-100 justify-self-start"
                    onClick={() => removeAt('initialDialog', i)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
                onClick={() =>
                  addTo('initialDialog', { role: 'assistant', text: '' })
                }
              >
                <Plus className="h-4 w-4 inline mr-1" /> Thêm lời thoại
              </button>
            </div>
          </Section>
          <Section title="Gợi ý">
            <div className="space-y-2">
              {((val('suggestions') as string[]) || []).map((t, i) => (
                <div key={i} className="flex items-center gap-2">
                  <TextInput
                    defaultValue={t}
                    onChange={(e) => {
                      const arr = [...((val('suggestions') as string[]) || [])]
                      arr[i] = e.target.value
                      setValue(`${basePath}.suggestions` as any, arr)
                    }}
                  />
                  <button
                    type="button"
                    className="rounded-lg p-2 hover:bg-gray-100"
                    onClick={() => removeAt('suggestions', i)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
                onClick={() => addTo('suggestions', '')}
              >
                <Plus className="h-4 w-4 inline mr-1" /> Thêm gợi ý
              </button>
            </div>
          </Section>
        </div>
      )
    case 'fill_blank':
      return (
        <div className="space-y-3">
          <Labeled label="Đoạn văn (đánh dấu chỗ trống bằng [____] – mỗi [____] tương ứng 1 đáp án theo thứ tự)">
            <>
              <TextArea
                rows={4}
                {...register(`${basePath}.passage` as const)}
              />
              <div className="mt-1 text-xs text-gray-500">
                {(() => {
                  const passage = watch(
                    `${basePath}.passage` as const
                  ) as string
                  const ph = (passage || '').match(/\[_{2,}\]/g)?.length || 0
                  const blanksCount = ((val('blanks') as string[]) || []).length
                  return `Phát hiện ${ph} chỗ trống • Đáp án hiện có ${blanksCount}`
                })()}
              </div>
            </>
          </Labeled>
          <Section title="Đáp án cho các chỗ trống (theo thứ tự)">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">
                Gợi ý: Bấm đồng bộ để khớp số đáp án với số [____] trong đoạn
                văn.
              </span>
              <button
                type="button"
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs hover:bg-gray-50"
                onClick={() => {
                  const passage: string =
                    watch(`${basePath}.passage` as const) || ''
                  const count = (passage.match(/\[_{2,}\]/g) || []).length
                  const arr = Array.from(
                    { length: count },
                    (_, i) => ((val('blanks') as string[]) || [])[i] || ''
                  )
                  setValue(`${basePath}.blanks` as any, arr)
                }}
              >
                Đồng bộ đáp án
              </button>
            </div>
            <div className="space-y-2">
              {((val('blanks') as string[]) || []).map((t, i) => (
                <div key={i} className="flex items-center gap-2">
                  <TextInput
                    defaultValue={t}
                    onChange={(e) => {
                      const arr = [...((val('blanks') as string[]) || [])]
                      arr[i] = e.target.value
                      setValue(`${basePath}.blanks` as any, arr)
                    }}
                  />
                  <button
                    type="button"
                    className="rounded-lg p-2 hover:bg-gray-100"
                    onClick={() => removeAt('blanks', i)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
                onClick={() => addTo('blanks', '')}
              >
                <Plus className="h-4 w-4 inline mr-1" /> Thêm đáp án
              </button>
            </div>
          </Section>
        </div>
      )
    case 'dictation':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Labeled label="Audio URL">
            <TextInput {...register(`${basePath}.audioUrl` as const)} />
          </Labeled>
          <Labeled label="Số từ tối thiểu">
            <TextInput
              type="number"
              min={0}
              {...register(`${basePath}.minWords` as const, {
                valueAsNumber: true,
              })}
            />
          </Labeled>
          <div className="md:col-span-2">
            <Labeled label="Bản chép chuẩn (đáp án)">
              <TextArea
                rows={4}
                {...register(`${basePath}.transcript` as const)}
              />
            </Labeled>
          </div>
        </div>
      )
    case 'matching':
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Cặp ghép tương ứng</span>
            <button
              type="button"
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
              onClick={() => addTo('pairs', { left: '', right: '' })}
            >
              <Plus className="h-4 w-4 inline mr-1" /> Thêm cặp
            </button>
          </div>
          {((val('pairs') as any[]) || []).map((p, i) => (
            <div
              key={i}
              className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end"
            >
              <Labeled label="Trái">
                <TextInput
                  defaultValue={p.left}
                  onChange={(e) => {
                    const arr = [...((val('pairs') as any[]) || [])]
                    arr[i] = { ...arr[i], left: e.target.value }
                    setValue(`${basePath}.pairs` as any, arr)
                  }}
                />
              </Labeled>
              <Labeled label="Phải">
                <TextInput
                  defaultValue={p.right}
                  onChange={(e) => {
                    const arr = [...((val('pairs') as any[]) || [])]
                    arr[i] = { ...arr[i], right: e.target.value }
                    setValue(`${basePath}.pairs` as any, arr)
                  }}
                />
              </Labeled>
              <button
                type="button"
                className="rounded-lg p-2 hover:bg-gray-100 justify-self-start"
                onClick={() => removeAt('pairs', i)}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )
    default:
      return (
        <p className="text-sm text-gray-500">
          Loại hoạt động chưa hỗ trợ trong form.
        </p>
      )
  }
}
