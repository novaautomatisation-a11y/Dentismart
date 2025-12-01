// components/dashboard/StatsCard.tsx
/**
 * Composant carte de statistique pour le dashboard
 */

interface StatsCardProps {
  title: string
  value: number
  description: string
  icon?: string
}

export default function StatsCard({ title, value, description, icon }: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          <p className="mt-1 text-xs text-gray-500">{description}</p>
        </div>
        {icon && (
          <div className="text-4xl opacity-50">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
