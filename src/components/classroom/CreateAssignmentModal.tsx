import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Clock,
  Download,
  FileUp,
  Plus,
  Sparkles,
  Trash2,
  Trophy,
  Upload,
  X,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import type { GeneratedActivity } from '../../services/activity-ai.api'
import {
  createAssignment,
  downloadAssignmentTemplate,
  previewAssignmentImport,
} from '../../services/assignment.api'
import type { AssignmentCreateRequest } from '../../types/assignment.type'
import { AssignmentType } from '../../types/assignment.type'
import type { ActivityType } from '../../types/learn.type'
import { AudioGenerationOptions } from '../ui/AudioGenerationOptions'
import { AIActivityGeneratorModal } from './AIActivityGeneratorModal'

type Props = {
  isOpen: boolean
  classroomId: string
  onClose: () => void
}

interface ImportPreviewResult {
  assignment: Partial<AssignmentCreateRequest>
  activities: any[]
  errors: string[]
  warnings: string[]
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
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showAIModal, setShowAIModal] = useState(false)
  const [importPreview, setImportPreview] =
    useState<ImportPreviewResult | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  console.log('🚀 CreateAssignmentModal render:', {
    isOpen,
    mode,
    hasInitialValues: !!rest.initialValues,
    initialActivitiesCount: rest.initialValues?.activities?.length,
  })

  const queryClient = useQueryClient()
  const { register, control, handleSubmit, watch, setValue, reset } =
    useForm<AssignmentCreateRequest>({
      defaultValues: rest.initialValues
        ? {
            ...rest.initialValues,
            // Convert weight from 0-1 to 0-100% for display
            weight: rest.initialValues.weight
              ? rest.initialValues.weight * 100
              : 0,
          }
        : {
            title: '',
            description: '',
            instructions: '',
            isPublished: false,
            totalPoints: 100,
            maxAttempts: 1,
            timeLimit: undefined,
            type: AssignmentType.HOMEWORK,
            weight: 0,
            activities: [],
          },
    })

  const {
    fields: actFields,
    append: addAct,
    remove: removeAct,
    replace: replaceActivities,
  } = useFieldArray({ control, name: 'activities' })

  // Handler for AI-generated activities
  const handleActivitiesGenerated = (activities: GeneratedActivity[]) => {
    activities.forEach((activity) => {
      addAct({
        type: activity.type as any,
        title: activity.title,
        content: activity.content,
        points: activity.points || 10,
        difficulty: activity.difficulty,
        instructions: activity.instructions,
        passingScore: activity.passingScore,
        hints: [],
      })
    })
    toast.success(`Đã thêm ${activities.length} hoạt động từ AI`)
  }

  // Reset form when initialValues change (for edit mode)
  useEffect(() => {
    if (rest.initialValues && mode === 'edit') {
      console.log('Resetting form with initialValues:', rest.initialValues)
      console.log('Activities count:', rest.initialValues.activities?.length)
      rest.initialValues.activities?.forEach((activity, index) => {
        console.log(`Activity ${index}:`, {
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
        console.log('After reset - actFields length:', actFields.length)
      }, 100)
    }
  }, [rest.initialValues, mode, reset, actFields.length])

  // Debug log current field array state
  useEffect(() => {
    console.log('Current actFields length:', actFields.length)
    actFields.forEach((field: any, index: number) => {
      console.log(`Field ${index}:`, field)
    })
  }, [actFields])

  // Import handlers
  const handleDownloadTemplate = async () => {
    try {
      const blob = await downloadAssignmentTemplate()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'assignment-import-template.xlsx'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Template downloaded successfully')
    } catch (error) {
      console.error('Download template error:', error)
      toast.error('Failed to download template')
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      toast.error('Please upload an Excel file (.xlsx or .xls)')
      return
    }

    setIsUploading(true)
    try {
      const result = await previewAssignmentImport(file)
      setImportPreview(result.data)

      if (result.data.errors.length === 0) {
        toast.success('File processed successfully')
      } else {
        toast.error('File processed with errors')
      }
    } catch (error: any) {
      console.error('Import preview error:', error)
      toast.error(error?.response?.data?.message || 'Failed to process file')
    } finally {
      setIsUploading(false)
    }
  }

  const handleImportConfirm = () => {
    if (!importPreview) return

    // Merge imported data with current form values
    const currentValues = watch()

    // Update form values with imported assignment data
    if (importPreview.assignment.title) {
      setValue('title', importPreview.assignment.title)
    }
    if (importPreview.assignment.description) {
      setValue('description', importPreview.assignment.description)
    }
    if (importPreview.assignment.instructions) {
      setValue('instructions', importPreview.assignment.instructions)
    }
    if (importPreview.assignment.totalPoints) {
      setValue('totalPoints', importPreview.assignment.totalPoints)
    }
    if (importPreview.assignment.timeLimit) {
      setValue('timeLimit', importPreview.assignment.timeLimit)
    }
    if (importPreview.assignment.maxAttempts) {
      setValue('maxAttempts', importPreview.assignment.maxAttempts)
    }
    if (typeof importPreview.assignment.isPublished === 'boolean') {
      setValue('isPublished', importPreview.assignment.isPublished)
    }

    // Add imported activities to existing ones
    const existingActivities = currentValues.activities || []
    const newActivities = [...existingActivities, ...importPreview.activities]
    replaceActivities(newActivities)

    setShowImportDialog(false)
    setImportPreview(null)
    toast.success(`Imported ${importPreview.activities.length} activities`)
  }

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
      toast.success(
        mode === 'edit'
          ? 'Cập nhật bài tập thành công'
          : 'Tạo bài tập thành công'
      )
      queryClient.invalidateQueries({
        queryKey: ['classroom-detail', classroomId],
      })
      onClose()
      rest.onSubmitted?.()
    },
    onError: (e: any) => {
      // Handle validation errors from backend
      if (
        e?.response?.data?.message &&
        Array.isArray(e.response.data.message)
      ) {
        const validationErrors = e.response.data.message

        // Format error messages for better readability
        const formattedErrors = validationErrors
          .filter((err: any) => err.errors && err.errors.length > 0)
          .map((err: any) => {
            const fieldName =
              err.field.charAt(0).toUpperCase() +
              err.field.slice(1).replace(/([A-Z])/g, ' $1')
            return `• ${fieldName}: ${err.errors.join(', ')}`
          })

        if (formattedErrors.length > 0) {
          toast.error(
            <div style={{ textAlign: 'left' }}>
              <strong>Lỗi xác thực:</strong>
              <br />
              {formattedErrors.map((msg: string, idx: number) => (
                <div key={idx}>{msg}</div>
              ))}
            </div>,
            { duration: 6000 }
          )
        } else {
          toast.error('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.')
        }
      } else if (e?.response?.data?.message) {
        toast.error(e.response.data.message)
      } else {
        toast.error(
          mode === 'edit' ? 'Cập nhật bài tập thất bại' : 'Tạo bài tập thất bại'
        )
      }
    },
  })

  if (!isOpen) return null

  const addActivityOf = (type: ExtendedActivityType) => {
    const base = {
      type,
      title: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' '),
      points: 10,
      content: {},
    }
    // seed minimal content per type (matching AI generated structure)
    switch (type) {
      case 'quiz':
        ;(base as any).content = {
          questions: [
            {
              question: '',
              options: ['', ''],
              correctIndex: 0,
              explanation: '',
            },
          ],
        }
        break
      case 'grammar':
        ;(base as any).content = {
          rule: '',
          exercises: [
            {
              question: '',
              options: ['', ''],
              correctIndex: 0,
            },
          ],
        }
        break
      case 'reading':
        ;(base as any).content = {
          passage: '',
          questions: [
            {
              question: '',
              options: ['', ''],
              correctIndex: 0,
            },
          ],
        }
        break
      case 'listening':
        ;(base as any).content = {
          audioUrl: '',
          questions: [
            {
              question: '',
              options: ['', ''],
              correctIndex: 0,
            },
          ],
        }
        break
      case 'vocab':
        ;(base as any).content = {
          items: [
            {
              word: '',
              definition: '',
              translationVi: '',
              pronunciation: '',
              partOfSpeech: '',
              examples: [''],
              synonyms: [],
              antonyms: [],
              audioUrl: '',
              imageUrl: '',
            },
          ],
        }
        break
      case 'pronunciation':
        ;(base as any).content = {
          phrase: '',
          tips: [''],
          phonetics: '',
          sampleUrl: '',
        }
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
        ;(base as any).content = {
          cards: [{ front: '', back: '', imageUrl: '' }],
        }
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
        ;(base as any).content = {
          leftItems: [''],
          rightItems: [''],
        }
        break
    }
    addAct(base as any)
  }

  const onSubmit = (values: AssignmentCreateRequest) => {
    // Frontend validation
    if (!values.title?.trim()) {
      toast.error('Tiêu đề bài tập là bắt buộc')
      return
    }

    if (!values.activities || values.activities.length === 0) {
      toast.error('Cần có ít nhất một hoạt động')
      return
    }

    // Ensure dueDate ISO if provided (from datetime-local)
    const due = (values as any).dueDate as any
    const payload: AssignmentCreateRequest = {
      ...values,
      title: values.title.trim(),
      description: values.description?.trim() || undefined,
      instructions: values.instructions?.trim() || undefined,
      dueDate: due ? new Date(due).toISOString() : undefined,
      // Only send timeLimit if it's a valid positive integer
      timeLimit:
        values.timeLimit && values.timeLimit > 0
          ? Math.floor(values.timeLimit)
          : undefined,
      // Ensure maxAttempts is at least 1
      maxAttempts:
        values.maxAttempts && values.maxAttempts > 0
          ? Math.floor(values.maxAttempts)
          : 1,
      isPublished:
        typeof values.isPublished === 'string'
          ? values.isPublished === 'true'
          : !!values.isPublished,
      // Convert weight from 0-100% to 0-1
      weight: values.weight ? values.weight / 100 : 0,
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
          <div className="flex items-center gap-2">
            {mode === 'create' && (
              <button
                type="button"
                onClick={() => setShowImportDialog(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
              >
                <FileUp className="h-4 w-4" />
                Import Excel
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-2 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
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
              <Labeled label="Loại bài tập">
                <select
                  {...register('type', { required: true })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value={AssignmentType.HOMEWORK}>
                    Bài tập về nhà
                  </option>
                  <option value={AssignmentType.QUIZ}>Bài kiểm tra</option>
                  <option value={AssignmentType.MIDTERM_EXAM}>
                    Thi giữa kỳ
                  </option>
                  <option value={AssignmentType.FINAL_EXAM}>Thi cuối kỳ</option>
                </select>
              </Labeled>
              <Labeled label="Hạn nộp">
                <TextInput type="datetime-local" {...register('dueDate')} />
              </Labeled>
              <Labeled label="Trọng số (%)">
                <TextInput
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  placeholder="0"
                  {...register('weight', { valueAsNumber: true })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Trọng số trong điểm tổng kết (0-100%)
                </p>
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
                  placeholder="Để trống = không giới hạn"
                  {...register('timeLimit', { valueAsNumber: true })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Để trống hoặc 0 nếu không giới hạn thời gian
                </p>
              </Labeled>
              <Labeled label="Số lần làm tối đa">
                <TextInput
                  type="number"
                  min={1}
                  defaultValue={1}
                  placeholder="Tối thiểu: 1"
                  {...register('maxAttempts', { valueAsNumber: true })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Số lần học sinh được làm bài (tối thiểu 1)
                </p>
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
            <div className="flex flex-wrap gap-2 items-center">
              {/* AI Generate Button */}
              <button
                type="button"
                onClick={() => setShowAIModal(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-medium text-white hover:from-blue-700 hover:to-purple-700 shadow-sm"
              >
                <Sparkles className="h-4 w-4" />
                AI Generate Activities
              </button>

              <div className="h-4 border-l border-gray-300 mx-2"></div>

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
              {actFields.map((f: any, idx: number) => {
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

      {/* Import Dialog */}
      {showImportDialog && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">
                Import Assignment from Excel
              </h4>
              <button
                onClick={() => {
                  setShowImportDialog(false)
                  setImportPreview(null)
                }}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Step 1: Download Template */}
              <div className="rounded-xl border border-gray-200 p-4">
                <h5 className="font-medium mb-2">Step 1: Download Template</h5>
                <p className="text-sm text-gray-600 mb-3">
                  Download the Excel template, fill in your assignment data, and
                  upload it below.
                </p>
                <button
                  onClick={handleDownloadTemplate}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
                >
                  <Download className="h-4 w-4" />
                  Download Template
                </button>
              </div>

              {/* Step 2: Upload File */}
              <div className="rounded-xl border border-gray-200 p-4">
                <h5 className="font-medium mb-2">
                  Step 2: Upload Completed File
                </h5>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition">
                  <input
                    accept=".xlsx,.xls"
                    style={{ display: 'none' }}
                    id="excel-file-upload"
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        handleFileUpload(file)
                      }
                    }}
                  />
                  <label htmlFor="excel-file-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Click to upload Excel file
                    </p>
                    <p className="text-xs text-gray-500">
                      Supports .xlsx and .xls files
                    </p>
                  </label>
                </div>

                {isUploading && (
                  <div className="mt-3">
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <Clock className="h-4 w-4 animate-spin" />
                      Processing file...
                    </div>
                  </div>
                )}
              </div>

              {/* Import Preview */}
              {importPreview && (
                <div className="rounded-xl border border-gray-200 p-4">
                  <h5 className="font-medium mb-2">Import Preview</h5>

                  {importPreview.errors.length > 0 && (
                    <div className="rounded-lg bg-red-50 border border-red-200 p-3 mb-3">
                      <p className="text-sm font-medium text-red-800 mb-1">
                        Errors:
                      </p>
                      <ul className="text-sm text-red-700 space-y-1">
                        {importPreview.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {importPreview.warnings.length > 0 && (
                    <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3 mb-3">
                      <p className="text-sm font-medium text-yellow-800 mb-1">
                        Warnings:
                      </p>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        {importPreview.warnings.map((warning, index) => (
                          <li key={index}>• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {importPreview.errors.length === 0 && (
                    <div className="rounded-lg bg-green-50 border border-green-200 p-3 mb-3">
                      <p className="text-sm font-medium text-green-800 mb-1">
                        Ready to Import:
                      </p>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Assignment: {importPreview.assignment.title}</li>
                        <li>
                          • Activities: {importPreview.activities.length} found
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Dialog Actions */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowImportDialog(false)
                    setImportPreview(null)
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImportConfirm}
                  disabled={!importPreview || importPreview.errors.length > 0}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Import Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Activity Generator Modal */}
      <AIActivityGeneratorModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        courseTitle={watch('title') || 'Assignment'}
        courseDescription={watch('description') || undefined}
        lessonTitle={watch('title') || 'Assignment Activities'}
        lessonDescription={watch('instructions') || undefined}
        onActivitiesGenerated={handleActivitiesGenerated}
      />
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
    case 'reading':
      return (
        <div className="space-y-4">
          {/* Reading Passage (optional) */}
          <Labeled label="Đoạn văn (tuỳ chọn)">
            <TextArea
              rows={5}
              {...register(`${basePath}.passage` as const)}
              placeholder="Nhập đoạn văn để học sinh đọc..."
            />
          </Labeled>

          {/* Questions Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Câu hỏi</span>
              <button
                type="button"
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
                onClick={() =>
                  addTo('questions', {
                    question: '',
                    options: ['', ''],
                    correctIndex: 0,
                  })
                }
              >
                <Plus className="h-4 w-4 inline mr-1" /> Thêm câu hỏi
              </button>
            </div>

            {((val('questions') as any[]) || []).map((q, qIndex) => (
              <div
                key={qIndex}
                className="rounded-lg border border-gray-200 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Câu hỏi {qIndex + 1}
                  </span>
                  <button
                    type="button"
                    className="rounded-lg p-2 hover:bg-gray-100 text-red-600"
                    onClick={() => removeAt('questions', qIndex)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <Labeled label="Nội dung câu hỏi">
                  <TextInput
                    defaultValue={q.question}
                    onChange={(e) => {
                      const arr = [...((val('questions') as any[]) || [])]
                      arr[qIndex] = { ...arr[qIndex], question: e.target.value }
                      setValue(`${basePath}.questions` as any, arr)
                    }}
                    placeholder="Nhập câu hỏi..."
                  />
                </Labeled>

                <Labeled label="Phương án trả lời">
                  <div className="space-y-2">
                    {(q.options || []).map((opt: string, optIndex: number) => (
                      <div key={optIndex} className="flex items-center gap-2">
                        <TextInput
                          defaultValue={opt}
                          onChange={(e) => {
                            const questions = [
                              ...((val('questions') as any[]) || []),
                            ]
                            const options = [
                              ...(questions[qIndex].options || []),
                            ]
                            options[optIndex] = e.target.value
                            questions[qIndex] = {
                              ...questions[qIndex],
                              options,
                            }
                            setValue(`${basePath}.questions` as any, questions)
                          }}
                          placeholder={`Phương án ${optIndex + 1}`}
                        />
                        <button
                          type="button"
                          className="rounded-lg p-2 hover:bg-gray-100"
                          onClick={() => {
                            const questions = [
                              ...((val('questions') as any[]) || []),
                            ]
                            const options = [
                              ...(questions[qIndex].options || []),
                            ]
                            options.splice(optIndex, 1)
                            questions[qIndex] = {
                              ...questions[qIndex],
                              options,
                            }
                            setValue(`${basePath}.questions` as any, questions)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
                      onClick={() => {
                        const questions = [
                          ...((val('questions') as any[]) || []),
                        ]
                        const options = [
                          ...(questions[qIndex].options || []),
                          '',
                        ]
                        questions[qIndex] = { ...questions[qIndex], options }
                        setValue(`${basePath}.questions` as any, questions)
                      }}
                    >
                      <Plus className="h-4 w-4 inline mr-1" /> Thêm phương án
                    </button>
                  </div>
                </Labeled>

                <Labeled label="Đáp án đúng (index)">
                  <TextInput
                    type="number"
                    min={0}
                    max={Math.max(0, (q.options || []).length - 1)}
                    defaultValue={q.correctIndex}
                    onChange={(e) => {
                      const questions = [...((val('questions') as any[]) || [])]
                      questions[qIndex] = {
                        ...questions[qIndex],
                        correctIndex: parseInt(e.target.value) || 0,
                      }
                      setValue(`${basePath}.questions` as any, questions)
                    }}
                    placeholder="0"
                  />
                </Labeled>
              </div>
            ))}

            {((val('questions') as any[]) || []).length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                Chưa có câu hỏi. Click "Thêm câu hỏi" để bắt đầu.
              </p>
            )}
          </div>
        </div>
      )
    case 'listening':
      return (
        <div className="space-y-4">
          {/* Audio Section with Generation Options */}
          <AudioGenerationOptions
            value={val('audioUrl')}
            onChange={(audioUrl) =>
              setValue(`${basePath}.audioUrl` as any, audioUrl)
            }
            label="Audio for Listening Activity"
            required
          />

          {/* Questions Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Questions
              </span>
              <button
                type="button"
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
                onClick={() =>
                  addTo('questions', {
                    question: '',
                    options: ['', ''],
                    correctIndex: 0,
                  })
                }
              >
                <Plus className="h-4 w-4 inline mr-1" /> Add Question
              </button>
            </div>

            {((val('questions') as any[]) || []).map((q, qIndex) => (
              <div
                key={qIndex}
                className="rounded-lg border border-gray-200 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Question {qIndex + 1}
                  </span>
                  <button
                    type="button"
                    className="rounded-lg p-2 hover:bg-gray-100 text-red-600"
                    onClick={() => removeAt('questions', qIndex)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <Labeled label="Question Text">
                  <TextInput
                    defaultValue={q.question}
                    onChange={(e) => {
                      const arr = [...((val('questions') as any[]) || [])]
                      arr[qIndex] = { ...arr[qIndex], question: e.target.value }
                      setValue(`${basePath}.questions` as any, arr)
                    }}
                    placeholder="Enter the question..."
                  />
                </Labeled>

                <Labeled label="Answer Options">
                  <div className="space-y-2">
                    {(q.options || []).map((opt: string, optIndex: number) => (
                      <div key={optIndex} className="flex items-center gap-2">
                        <TextInput
                          defaultValue={opt}
                          onChange={(e) => {
                            const questions = [
                              ...((val('questions') as any[]) || []),
                            ]
                            const options = [
                              ...(questions[qIndex].options || []),
                            ]
                            options[optIndex] = e.target.value
                            questions[qIndex] = {
                              ...questions[qIndex],
                              options,
                            }
                            setValue(`${basePath}.questions` as any, questions)
                          }}
                          placeholder={`Option ${optIndex + 1}`}
                        />
                        <button
                          type="button"
                          className="rounded-lg p-2 hover:bg-gray-100"
                          onClick={() => {
                            const questions = [
                              ...((val('questions') as any[]) || []),
                            ]
                            const options = [
                              ...(questions[qIndex].options || []),
                            ]
                            options.splice(optIndex, 1)
                            questions[qIndex] = {
                              ...questions[qIndex],
                              options,
                            }
                            setValue(`${basePath}.questions` as any, questions)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
                      onClick={() => {
                        const questions = [
                          ...((val('questions') as any[]) || []),
                        ]
                        const options = [
                          ...(questions[qIndex].options || []),
                          '',
                        ]
                        questions[qIndex] = { ...questions[qIndex], options }
                        setValue(`${basePath}.questions` as any, questions)
                      }}
                    >
                      <Plus className="h-4 w-4 inline mr-1" /> Add Option
                    </button>
                  </div>
                </Labeled>

                <Labeled label="Correct Answer Index">
                  <TextInput
                    type="number"
                    min={0}
                    max={Math.max(0, (q.options || []).length - 1)}
                    defaultValue={q.correctIndex}
                    onChange={(e) => {
                      const questions = [...((val('questions') as any[]) || [])]
                      questions[qIndex] = {
                        ...questions[qIndex],
                        correctIndex: parseInt(e.target.value) || 0,
                      }
                      setValue(`${basePath}.questions` as any, questions)
                    }}
                    placeholder="0"
                  />
                </Labeled>
              </div>
            ))}

            {((val('questions') as any[]) || []).length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No questions added yet. Click "Add Question" to get started.
              </p>
            )}
          </div>
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
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Cụm từ cần phát âm</span>
            <button
              type="button"
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
              onClick={() => addTo('phrases', { text: '', sampleUrl: '' })}
            >
              <Plus className="h-4 w-4 inline mr-1" /> Thêm cụm từ
            </button>
          </div>
          {((val('phrases') as any[]) || []).map((phrase, i) => (
            <div
              key={i}
              className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end border border-gray-200 rounded-lg p-3"
            >
              <div className="md:col-span-2">
                <Labeled label="Cụm từ">
                  <TextInput
                    defaultValue={phrase.text}
                    onChange={(e) => {
                      const arr = [...((val('phrases') as any[]) || [])]
                      arr[i] = { ...arr[i], text: e.target.value }
                      setValue(`${basePath}.phrases` as any, arr)
                    }}
                    placeholder="Ví dụ: Hello world"
                  />
                </Labeled>
              </div>
              <div className="md:col-span-2">
                <Labeled label="Audio mẫu (tuỳ chọn)">
                  <TextInput
                    defaultValue={phrase.sampleUrl}
                    onChange={(e) => {
                      const arr = [...((val('phrases') as any[]) || [])]
                      arr[i] = { ...arr[i], sampleUrl: e.target.value }
                      setValue(`${basePath}.phrases` as any, arr)
                    }}
                    placeholder="https://..."
                  />
                </Labeled>
              </div>
              <button
                type="button"
                className="rounded-lg p-2 hover:bg-gray-100 text-red-600 justify-self-start"
                onClick={() => removeAt('phrases', i)}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {((val('phrases') as any[]) || []).length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              Chưa có cụm từ. Click "Thêm cụm từ" để bắt đầu.
            </p>
          )}
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
