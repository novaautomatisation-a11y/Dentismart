import { createClient } from '@/lib/supabase/server'

interface CampagnesRecentesProps {
  cabinetId: string
}

export async function CampagnesRecentes({ cabinetId }: CampagnesRecentesProps) {
  const supabase = await createClient()

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*')
    .eq('type', 'reactivation')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Campagnes récentes</h2>

      {campaigns && campaigns.length > 0 ? (
        <div className="space-y-3 flex-1">
          {campaigns.map(campaign => (
            <div key={campaign.id} className="p-3 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900">{campaign.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {campaign.channel === 'sms' ? '📱 SMS' : campaign.channel === 'whatsapp' ? '💬 WhatsApp' : '📧 Email'}
                    {' • '}
                    {new Date(campaign.created_at).toLocaleDateString('fr-CH')}
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  campaign.status === 'completed' ? 'bg-green-100 text-green-700' :
                  campaign.status === 'running' ? 'bg-blue-100 text-blue-700' :
                  campaign.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {campaign.status === 'completed' ? 'Terminé' :
                   campaign.status === 'running' ? 'En cours' :
                   campaign.status === 'draft' ? 'Brouillon' : 'Annulé'}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <div className="text-3xl mb-2">📢</div>
            <div className="text-sm">Aucune campagne créée</div>
          </div>
        </div>
      )}
    </div>
  )
}
