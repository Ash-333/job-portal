import { useState } from 'react'
import { usePlans, useCreatePlan, useUpdatePlan, useDeletePlan } from '../hooks/useApi'

export default function PlansPage() {
  const { data: plans, isLoading } = usePlans()
  const createPlan = useCreatePlan()
  const updatePlan = useUpdatePlan()
  const deletePlan = useDeletePlan()

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({
    name: '', slug: '', description: '', price: 0, duration: 'MONTHLY',
    features: '', jobLimit: '', featuredJobLimit: '', sortOrder: 0, isActive: true,
  })

  const resetForm = () => {
    setForm({ name: '', slug: '', description: '', price: 0, duration: 'MONTHLY', features: '', jobLimit: '', featuredJobLimit: '', sortOrder: 0, isActive: true })
    setEditing(null)
    setShowForm(false)
  }

  const handleEdit = (plan: any) => {
    setForm({
      name: plan.name, slug: plan.slug, description: plan.description || '', price: plan.price,
      duration: plan.duration, features: (plan.features || []).join('\n'), jobLimit: plan.jobLimit ?? '',
      featuredJobLimit: plan.featuredJobLimit ?? '', sortOrder: plan.sortOrder, isActive: plan.isActive,
    })
    setEditing(plan)
    setShowForm(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      ...form,
      features: form.features.split('\n').filter(Boolean),
      price: Number(form.price),
      jobLimit: form.jobLimit ? Number(form.jobLimit) : null,
      featuredJobLimit: form.featuredJobLimit ? Number(form.featuredJobLimit) : null,
      sortOrder: Number(form.sortOrder),
    }
    if (editing) {
      updatePlan.mutate({ id: editing.id, data }, { onSuccess: resetForm })
    } else {
      createPlan.mutate(data, { onSuccess: resetForm })
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Subscription Plans</h1>
        <button onClick={() => { resetForm(); setShowForm(true) }} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + New Plan
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-6 space-y-4">
          <h2 className="text-lg font-semibold">{editing ? 'Edit Plan' : 'Create Plan'}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium">Slug</label>
              <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="w-full border rounded px-3 py-2" required />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium">Description</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full border rounded px-3 py-2" rows={2} />
            </div>
            <div>
              <label className="block text-sm font-medium">Price (NPR)</label>
              <input type="number" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium">Duration</label>
              <select value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} className="w-full border rounded px-3 py-2">
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Job Limit</label>
              <input type="number" value={form.jobLimit} onChange={e => setForm({ ...form, jobLimit: e.target.value })} className="w-full border rounded px-3 py-2" placeholder="Unlimited if empty" />
            </div>
            <div>
              <label className="block text-sm font-medium">Featured Job Limit</label>
              <input type="number" value={form.featuredJobLimit} onChange={e => setForm({ ...form, featuredJobLimit: e.target.value })} className="w-full border rounded px-3 py-2" placeholder="Unlimited if empty" />
            </div>
            <div>
              <label className="block text-sm font-medium">Sort Order</label>
              <input type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: Number(e.target.value) })} className="w-full border rounded px-3 py-2" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} id="isActive" />
              <label htmlFor="isActive" className="text-sm font-medium">Active</label>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium">Features (one per line)</label>
              <textarea value={form.features} onChange={e => setForm({ ...form, features: e.target.value })} className="w-full border rounded px-3 py-2" rows={4} placeholder="resume_access&#10;cv_unlock&#10;analytics" />
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
                <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Price</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Duration</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Jobs</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Featured</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Active</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {plans?.map((plan: any) => (
                <tr key={plan.id}>
                  <td className="px-4 py-3 font-medium">{plan.name}</td>
                  <td className="px-4 py-3">NPR {plan.price?.toLocaleString()}</td>
                  <td className="px-4 py-3 capitalize">{plan.duration?.toLowerCase()}</td>
                  <td className="px-4 py-3">{plan.jobLimit ?? '∞'}</td>
                  <td className="px-4 py-3">{plan.featuredJobLimit ?? '∞'}</td>
                  <td className="px-4 py-3">{plan.isActive ? <span className="text-green-600">Yes</span> : <span className="text-red-600">No</span>}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => handleEdit(plan)} className="text-blue-600 hover:underline text-sm">Edit</button>
                    <button onClick={() => { if (confirm('Delete this plan?')) deletePlan.mutate(plan.id) }} className="text-red-600 hover:underline text-sm">Delete</button>
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
