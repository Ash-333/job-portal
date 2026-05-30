import { useSubscriptions, useActivateSubscription, useCancelSubscription } from '../hooks/useApi'

export default function SubscriptionsPage() {
  const { data, isLoading } = useSubscriptions()
  const activate = useActivateSubscription()
  const cancel = useCancelSubscription()

  const subscriptions = data?.data ?? data ?? []

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Employer Subscriptions</h1>

      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Employer</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Plan</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Period Start</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Period End</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Auto Renew</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {Array.isArray(subscriptions) && subscriptions.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No subscriptions yet</td></tr>
              )}
              {Array.isArray(subscriptions) && subscriptions.map((sub: any) => (
                <tr key={sub.id}>
                  <td className="px-4 py-3">{sub.employer?.companyName || sub.employer?.email || sub.employerId}</td>
                  <td className="px-4 py-3">{sub.plan?.name || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      sub.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                      sub.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      sub.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>{sub.status}</span>
                  </td>
                  <td className="px-4 py-3 text-sm">{sub.currentPeriodStart ? new Date(sub.currentPeriodStart).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3 text-sm">{sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3">{sub.autoRenew ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3 flex gap-2">
                    {sub.status === 'PENDING' && (
                      <button onClick={() => activate.mutate(sub.id)} className="text-green-600 hover:underline text-sm">Activate</button>
                    )}
                    {(sub.status === 'ACTIVE' || sub.status === 'PENDING') && (
                      <button onClick={() => { if (confirm('Cancel this subscription?')) cancel.mutate(sub.id) }} className="text-red-600 hover:underline text-sm">Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
