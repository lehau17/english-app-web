import React from 'react'
import { Activity, BookOpen, CalendarDays, Clock, Target } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'

// Mock Data
const mockChildData = {
  id: 'child-01',
  name: 'Nguyễn Văn An',
  avatarUrl: 'https://i.pravatar.cc/150?u=child01',
}

const mockStudyTimeData = {
  '7days': [
    { date: '2023-10-20', minutes: 30 },
    { date: '2023-10-21', minutes: 45 },
    { date: '2023-10-22', minutes: 60 },
    { date: '2023-10-23', minutes: 25 },
    { date: '2023-10-24', minutes: 75 },
    { date: '2023-10-25', minutes: 40 },
    { date: '2023-10-26', minutes: 90 },
  ],
  '30days': [
    // Add more data for 30 days if needed, for now we reuse 7 days data for simplicity
    ...Array.from({ length: 4 }, (_, i) =>
      [
        { date: `W${i + 1} D1`, minutes: 30 + i * 5 },
        { date: `W${i + 1} D2`, minutes: 45 + i * 5 },
        { date: `W${i + 1} D3`, minutes: 60 + i * 5 },
        { date: `W${i + 1} D4`, minutes: 25 + i * 5 },
        { date: `W${i + 1} D5`, minutes: 75 + i * 5 },
        { date: `W${i + 1} D6`, minutes: 40 + i * 5 },
        { date: `W${i + 1} D7`, minutes: 90 + i * 5 },
      ].flat()
    ).flat(),
  ],
  allTime: [
    // Add more data for all time if needed
    { date: 'Tháng 8', minutes: 1200 },
    { date: 'Tháng 9', minutes: 1500 },
    { date: 'Tháng 10', minutes: 1800 },
  ],
}

const mockSkillData = [
  { skill: 'Nghe', score: 85, fullMark: 100 },
  { skill: 'Nói', score: 70, fullMark: 100 },
  { skill: 'Đọc', score: 90, fullMark: 100 },
  { skill: 'Viết', score: 65, fullMark: 100 },
  { skill: 'Từ vựng', score: 88, fullMark: 100 },
  { skill: 'Ngữ pháp', score: 72, fullMark: 100 },
]

const mockCommonMistakes = [
  {
    type: 'Phát âm',
    mistake:
      "Phát âm sai âm /θ/, thường đọc thành /t/ (ví dụ: 'think' -> 'tink')",
    suggestion: 'Luyện tập đặt lưỡi giữa hai hàm răng khi phát âm.',
  },
  {
    type: 'Ngữ pháp',
    mistake: 'Sử dụng sai thì hiện tại đơn cho hành động trong quá khứ.',
    suggestion: 'Ôn lại cách dùng thì quá khứ đơn (Past Simple).',
  },
  {
    type: 'Từ vựng',
    mistake: "Nhầm lẫn giữa 'affect' và 'effect'.",
    suggestion:
      "Ghi nhớ: 'affect' là động từ (ảnh hưởng), 'effect' là danh từ (kết quả).",
  },
]

const mockRecentActivities = [
  {
    id: 'act-1',
    name: 'Bài tập Nghe: Động vật trong trang trại',
    date: '2023-10-26',
    score: 95,
  },
  {
    id: 'act-2',
    name: 'Bài tập Nói: Giới thiệu bản thân',
    date: '2023-10-25',
    score: 80,
  },
  {
    id: 'act-3',
    name: 'Bài tập Đọc: Câu chuyện về chú Rùa',
    date: '2023-10-25',
    score: 88,
  },
  {
    id: 'act-4',
    name: 'Kiểm tra từ vựng: Chủ đề Gia đình',
    date: '2023-10-24',
    score: 100,
  },
  {
    id: 'act-5',
    name: 'Bài tập Ngữ pháp: Thì hiện tại tiếp diễn',
    date: '2023-10-23',
    score: 75,
  },
]

export default function ParentProgressReportPage() {
  // For now, we don't use useParams as we have mock data.
  // const { childId } = useParams<{ childId: string }>();
  const [timeRange, setTimeRange] =
    React.useState<keyof typeof mockStudyTimeData>('7days')

  const chartData = mockStudyTimeData[timeRange]

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage
              src={mockChildData.avatarUrl}
              alt={mockChildData.name}
            />
            <AvatarFallback>
              {mockChildData.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Báo cáo tiến độ học tập
            </h1>
            <p className="text-lg text-muted-foreground">
              Học sinh: {mockChildData.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-muted-foreground" />
          <Select
            onValueChange={(value) =>
              setTimeRange(value as keyof typeof mockStudyTimeData)
            }
            defaultValue={timeRange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Chọn khoảng thời gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 ngày qua</SelectItem>
              <SelectItem value="30days">30 ngày qua</SelectItem>
              <SelectItem value="allTime">Toàn thời gian</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid Layout for Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {/* Study Time Chart */}
        <Card className="col-span-1 lg:col-span-2 xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-6 w-6" />
              Thời gian học mỗi ngày
            </CardTitle>
            <CardDescription>
              Tổng số phút học mỗi ngày trong khoảng thời gian đã chọn.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis unit=" phút" />
                <Tooltip
                  formatter={(value) => [`${value} phút`, 'Thời gian học']}
                />
                <Legend />
                <Bar
                  dataKey="minutes"
                  name="Số phút học"
                  fill="var(--color-primary, #1E88E5)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Skills Breakdown */}
        <Card className="col-span-1 lg:col-span-1 xl:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-6 w-6" />
              Phân tích Kỹ năng
            </CardTitle>
            <CardDescription>
              Điểm số trung bình cho các kỹ năng cốt lõi.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart
                cx="50%"
                cy="50%"
                outerRadius="80%"
                data={mockSkillData}
              >
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar
                  name={mockChildData.name}
                  dataKey="score"
                  stroke="var(--color-primary, #1E88E5)"
                  fill="var(--color-primary, #1E88E5)"
                  fillOpacity={0.6}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Common Mistakes */}
        <Card className="col-span-1 lg:col-span-2 xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              Những lỗi cần cải thiện
            </CardTitle>
            <CardDescription>
              Các lỗi sai phổ biến và gợi ý để cải thiện.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockCommonMistakes.map((item, index) => (
                <div key={index} className="flex flex-col gap-1">
                  <p className="font-semibold text-primary">{item.type}</p>
                  <p className="text-sm">{item.mistake}</p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold">Gợi ý:</span>{' '}
                    {item.suggestion}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="col-span-1 lg:col-span-1 xl:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-6 w-6" />
              Hoạt động gần đây
            </CardTitle>
            <CardDescription>
              5 hoạt động gần nhất đã hoàn thành.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {mockRecentActivities.map((activity) => (
                <li
                  key={activity.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex-1">
                    <p className="font-medium">{activity.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.date}
                    </p>
                  </div>
                  <div className="ml-4">
                    <span className="font-semibold text-primary">
                      {activity.score}%
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// A bit of styling for the chart colors
const style = document.createElement('style')
style.innerHTML = `
:root {
  --color-primary: #1E88E5;
}
`
document.head.appendChild(style)
