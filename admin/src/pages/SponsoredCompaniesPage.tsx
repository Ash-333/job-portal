import { useState } from 'react'
import { useSponsoredCompanies, useCreateSponsoredCompany, useUpdateSponsoredCompany, useDeleteSponsoredCompany } from '../hooks/useApi'
import { useUsers } from '../hooks/useApi'

export default function SponsoredCompaniesPage() {
  const { data, isLoading } = useSponsoredCompanies()
  const { data: usersData } = useUsers({ role: 'EMPLOYER', limit: 200 })
  const create = useCreateSponsoredCompany()
  const update = useUpdateSponsoredCompany()
  const del = useDeleteSponsoredCompany()

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ employerId: '', durationDays: 30, sortOrder: 0, isActive: true })

  const employers = usersData?.data ?? []
  const sponsored = data?.data ?? data ?? []

  const resetForm = () => {
    setForm({ employerId: '', durationDays: 30, sortOrder: 0, isActive: true })
    setEditing(null)
    setShowForm(false)
  }

  const handleEdit = (item: any) => {
    setForm({ employerId: item.employerId, durationDays: 30, sortOrder: item.sortOrder, isActive: item.isActive })
    setEditing(item)
    setShowForm(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = { ...form, durationDays: Number(form.durationDays), sortOrder: Number(form.sortOrder) }
    if (editing) {
      update.mutate({ id: editing.id, data }, { onSuccess: resetForm })
    } else {
      create.mutate(data, { onSuccess: resetForm })
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Sponsored Companies</h1>
        <button onClick={() => { resetForm(); setShowForm(true) }} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + Add Sponsor
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-6 space-y-4">
          <h2 className="text-lg font-semibold">{editing ? 'Edit Sponsor' : 'Add Sponsor'}</h2>
          {!editing && (
            <div>
              <label className="block text-sm font-medium">Employer</label>
              <select value={form.employerId} onChange={e => setForm({ ...form, employerId: e.target.value })} className="w-full border rounded px-3 py-2" required>
                <option value="">Select employer...</option>
                {Array.isArray(employers) && employers.map((u: any) => (
                  <option key={u.id} value={u.id}>{u.companyName || u.email}</option>
                ))}
              </select>
            </div>
          )}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium">Duration (days)</label>
              <input type="number" value={form.durationDays} onChange={e => setForm({ ...form, durationDays: Number(e.target.value) })} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium">Sort Order</label>
              <input type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: Number(e.target.value) })} className="w-full border rounded px-3 py-2" />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} id="spIsActive" />
              <label htmlFor="spIsActive" className="text-sm font-medium">Active</label>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">{editing ? 'Update' : 'Create'}</button>
            <button type="button" onClick={resetForm} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Cancel</button>
          </div>
        </form>
      )}

      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Employer</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Start</th>
                <th className="px-4 py-3 text-left text-sm font-medium">End</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Active</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Sort</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {Array.isArray(sponsored) && sponsored.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No sponsored companies</td></tr>
              )}
              {Array.isArray(sponsored) && sponsored.map((item: any) => (
                <tr key={item.id}>
                  <td className="px-4 py-3">{item.employer?.companyName || item.employer?.email || item.employerId}</td>
                  <td className="px-4 py-3 text-sm">{item.startDate ? new Date(item.startDate).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3 text-sm">{item.endDate ? new Date(item.endDate).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3">{item.isActive ? <span className="text-green-600">Yes</span> : <span className="text-red-600">No</span>}</td>
                  <td className="px-4 py-3">{item.sortOrder}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => handleEdit(item)} className="text-blue-600 hover:underline text-sm">Edit</button>
                    <button onClick={() => { if (confirm('Remove sponsorship?')) del.mutate(item.id) }} className="text-red-600 hover:underline text-sm">Remove</button>
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
