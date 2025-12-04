'use client'

interface ScoreDentismartProps {
  score: number
  noShowRate: number
}

export function ScoreDentismart({ score, noShowRate }: ScoreDentismartProps) {
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const getBadge = () => {
    if (score >= 85) return { label: 'Excellent', color: 'text-green-600', bg: 'bg-green-50' }
    if (score >= 70) return { label: 'À surveiller', color: 'text-orange-600', bg: 'bg-orange-50' }
    return { label: 'Critique', color: 'text-red-600', bg: 'bg-red-50' }
  }

  const badge = getBadge()

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h3 className="text-sm font-medium text-gray-600 mb-4">Santé du cabinet</h3>

      {/* Donut Chart */}
      <div className="relative">
        <svg width="180" height="180" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            stroke="#E5E7EB"
            strokeWidth="20"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            stroke={score >= 85 ? '#10B981' : score >= 70 ? '#F59E0B' : '#EF4444'}
            strokeWidth="20"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Score Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl font-bold text-gray-900">{score}</div>
          <div className="text-sm text-gray-500">/ 100</div>
        </div>
      </div>

      {/* Badge */}
      <div className={`mt-4 px-3 py-1 rounded-full ${badge.bg}`}>
        <span className={`text-sm font-medium ${badge.color}`}>{badge.label}</span>
      </div>

      {/* Info */}
      <div className="mt-4 text-center text-xs text-gray-500">
        Taux de no-show: {(noShowRate * 100).toFixed(1)}%
        <br />
        Sur les 6 derniers mois
      </div>
    </div>
  )
}
