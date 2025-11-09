import { Check } from 'lucide-react'
import React from 'react'

interface Step {
  id: number
  title: string
  description: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
}) => {
  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id
          const isCurrent = currentStep === step.id

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center flex-1">
                {/* Circle */}
                <div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
                    ${
                      isCompleted
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                        : isCurrent
                          ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-lg'
                          : 'bg-gray-200 text-gray-500'
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check className="h-6 w-6" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>

                {/* Label */}
                <div className="mt-3 text-center">
                  <div
                    className={`text-sm font-medium ${
                      isCurrent
                        ? 'text-blue-600'
                        : isCompleted
                          ? 'text-gray-700'
                          : 'text-gray-400'
                    }`}
                  >
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 hidden sm:block">
                    {step.description}
                  </div>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`
                    h-0.5 flex-1 mx-4 transition-all duration-300
                    ${isCompleted ? 'bg-blue-600' : 'bg-gray-200'}
                  `}
                  style={{ marginTop: '-40px' }}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
