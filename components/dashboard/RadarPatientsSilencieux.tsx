import Link from 'next/link'

interface RadarPatientsSilencieuxProps {
  cabinetId: string
  count: number
}

export function RadarPatientsSilencieux({ cabinetId, count }: RadarPatientsSilencieuxProps) {
  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Patients silencieux</h2>
      <p className="text-sm text-gray-600 mb-4">
        Patients n'ayant pas consulté depuis plus de 12 mois
      </p>

      {/* Count Display */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl font-bold text-orange-500">{count}</div>
          <div className="text-sm text-gray-500 mt-2">patients à réactiver</div>
        </div>
      </div>

      {/* Action Button */}
      <Link
        href="/radar"
        className="mt-4 w-full px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 text-center transition-colors"
      >
        Voir le détail et créer une campagne
      </Link>
    </div>
  )
}
