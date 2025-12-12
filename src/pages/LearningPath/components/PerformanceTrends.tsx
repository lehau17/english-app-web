// Performance Trends Chart - Phase 5 Student UX
import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface PerformanceTrendsProps {
  recentScores: number[]
  trendAnalysis: {
    trend: 'improving' | 'declining' | 'stable'
    avgScore: number
    message: string
  }
}

export const PerformanceTrends: React.FC<PerformanceTrendsProps> = ({
  recentScores,
  trendAnalysis,
}) => {
  const chartData = recentScores.map((score, index) => ({
    activity: `#${index + 1}`,
    score,
  }))

  const getTrendIcon = () => {
    if (trendAnalysis.trend === 'improving') return '↗'
    if (trendAnalysis.trend === 'declining') return '↘'
    return '→'
  }

  const getTrendLabel = () => {
    if (trendAnalysis.trend === 'improving') return 'Improving'
    if (trendAnalysis.trend === 'declining') return 'Declining'
    return 'Stable'
  }

  const getTrendColor = () => {
    if (trendAnalysis.trend === 'improving') return 'text-green-600'
    if (trendAnalysis.trend === 'declining') return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Performance Trends
      </h2>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="activity" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#8884d8"
            strokeWidth={2}
            dot={{ fill: '#8884d8' }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Trend
          </span>
          <span className={`text-sm font-semibold ${getTrendColor()}`}>
            {getTrendIcon()} {getTrendLabel()}
          </span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Average Score
          </span>
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {trendAnalysis.avgScore.toFixed(1)}%
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {trendAnalysis.message}
        </p>
      </div>
    </div>
  )
}

export default PerformanceTrends
