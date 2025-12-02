// components/dashboard/HealthScore.tsx
'use client'

interface HealthScoreProps {
  score: number
  noShowRate: number
  period: string
}

export default function HealthScore({ score, noShowRate, period }: HealthScoreProps) {
  // Déterminer la couleur en fonction du score
  let scoreColor = 'text-green-600'
  let bgColor = 'bg-green-50'
  let borderColor = 'border-green-200'
  let emoji = '🟢'

  if (score < 50) {
    scoreColor = 'text-red-600'
    bgColor = 'bg-red-50'
    borderColor = 'border-red-200'
    emoji = '🔴'
  } else if (score < 75) {
    scoreColor = 'text-orange-600'
    bgColor = 'bg-orange-50'
    borderColor = 'border-orange-200'
    emoji = '🟠'
  }

  return (
    <div className={`${bgColor} border-2 ${borderColor} rounded-lg p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {emoji} Score Dentismart
          </h3>
          <p className="text-sm text-gray-600">
            Basé sur les {period}
          </p>
        </div>
        <div className="text-right">
          <div className={`text-5xl font-bold ${scoreColor}`}>
            {score}
          </div>
          <div className="text-sm text-gray-500 mt-1">/ 100</div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Taux de no-show:</span>
          <span className={`font-semibold ${scoreColor}`}>
            {noShowRate.toFixed(1)}%
          </span>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          {score >= 90 && '🎉 Excellent ! Votre cabinet a un taux de no-show très faible.'}
          {score >= 75 && score < 90 && '👍 Bon ! Continuez vos efforts pour réduire les no-shows.'}
          {score >= 50 && score < 75 && '⚠️ À améliorer. Pensez à envoyer des rappels SMS avant les rendez-vous.'}
          {score < 50 && '🚨 Attention ! Le taux de no-show est élevé. Action recommandée.'}
        </div>
      </div>
    </div>
  )
}
