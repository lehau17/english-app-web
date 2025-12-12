// Skill Progress Chart - Phase 5 Student UX
import React from 'react'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

interface Skill {
  name: string
  mastery: number
  trend: 'improving' | 'stable' | 'declining'
}

interface SkillProgressChartProps {
  skills: Skill[]
}

export const SkillProgressChart: React.FC<SkillProgressChartProps> = ({
  skills,
}) => {
  const chartData = skills.map((skill) => ({
    subject: skill.name,
    mastery: skill.mastery * 100,
    fullMark: 100,
  }))

  const getTrendIcon = (trend: string) => {
    if (trend === 'improving') return '↗'
    if (trend === 'declining') return '↘'
    return '→'
  }

  const getTrendColor = (trend: string) => {
    if (trend === 'improving') return 'text-green-600'
    if (trend === 'declining') return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Skill Balance
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={chartData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis angle={90} domain={[0, 100]} />
          <Radar
            name="Mastery"
            dataKey="mastery"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.6}
          />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>

      <div className="mt-4 space-y-2">
        {skills.map((skill) => (
          <div
            key={skill.name}
            className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded"
          >
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {skill.name}
            </span>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${skill.mastery * 100}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400 w-10">
                {Math.round(skill.mastery * 100)}%
              </span>
              <span className={`text-sm ${getTrendColor(skill.trend)}`}>
                {getTrendIcon(skill.trend)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SkillProgressChart
