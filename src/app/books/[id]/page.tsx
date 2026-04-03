
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function BookDetail() {
  const router = useRouter()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [notesHistory, setNotesHistory] = useState<string[]>([])
  const [form, setForm] = useState({
    title: '',
    author: '',
    genre: '',
    page_count: '',
    series: '',
    next_in_series: '',
    start_date: '',
    end_date: '',
    star_rating: 0,
    spice_rating: 0,
    format: 'physical' as   'ebook' | 'audio' | 'physical',
    notes: '',
    cover_url: '',
  })

  useEffect(() => {
    async function loadBook() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', id)
        .single()
      if (error || !data) {
        alert('Book not found.')
        router.push('/')
        return
      }
      setForm({
        title: data.title || '',
        author: data.author || '',
        genre: data.genre || '',
        page_count: data.page_count?.toString() || '',
        series: data.series || '',
        next_in_series: data.next_in_series || '',
        start_date: data.start_date || '',
        end_date: data.end_date || '',
        star_rating: data.star_rating || 0,
        spice_rating: data.spice_rating || 0,
        format: data.format || 'physical',
        notes: data.notes || '',
        cover_url: data.cover_url || '',
      })
      setLoading(false)
    }
    loadBook()
  }, [id])

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase
  .from('books')
  .update({
    ...form,
    page_count: form.page_count ? parseInt(form.page_count) : null,
    start_date: form.start_date || null,
    end_date: form.end_date || null,
  })
  .eq('id', id)
    if (error) {
      alert('Error saving: ' + error.message)
      setSaving(false)
      return
    }
    router.push('/')
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm('Delete this book? This cannot be undone.')) return
    setDeleting(true)
    const supabase = createClient()
    const { error } = await supabase.from('books').delete().eq('id', id)
    if (error) {
      alert('Error deleting: ' + error.message)
      setDeleting(false)
      return
    }
    router.push('/')
    router.refresh()
  }

  if (loading) {
    return (
      <main className="min-h-screen px-6 py-8 w-full">
        <p className="text-stone-400">Loading…</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-4 py-8 w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {form.cover_url && (
            <img src={form.cover_url} alt="Cover" className="w-12 h-16 object-cover rounded shadow" />
          )}
          <div>
            <h1 className="text-3xl font-serif font-medium text-stone-800">{form.title}</h1>
            <p className="text-sm text-stone-500 italic">{form.author}</p>
          </div>
        </div>
        <button
          onClick={() => router.back()}
          className="text-sm text-stone-500 hover:text-stone-800"
        >
          ← Back
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs uppercase tracking-wider text-stone-400 mb-1">Title</label>
            <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-800 outline-none focus:border-stone-400 bg-stone-50" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs uppercase tracking-wider text-stone-400 mb-1">Author</label>
            <input type="text" value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
              className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-800 outline-none focus:border-stone-400 bg-stone-50" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-400 mb-1">Genre</label>
            <select value={form.genre} onChange={e => setForm(f => ({ ...f, genre: e.target.value }))}
              className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-800 outline-none focus:border-stone-400 bg-stone-50">
              <option value="">Select…</option>
              <option>Paranormal Romance</option>
              <option>Dark Romance</option>
              <option>Hockey Romance</option>
              <option>Mafia Romance</option>
              <option>Romance</option>
              <option>Fantasy</option>
              <option>Literary Fiction</option>
              <option>Mystery / Thriller</option>
              <option>Sci-Fi</option>
              <option>Historical Fiction</option>
              <option>Non-Fiction</option>              
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-400 mb-1">Page Count</label>
            <input type="number" value={form.page_count} onChange={e => setForm(f => ({ ...f, page_count: e.target.value }))}
              className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-800 outline-none focus:border-stone-400 bg-stone-50" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-400 mb-1">Start Date</label>
            <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
              className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-800 outline-none focus:border-stone-400 bg-stone-50" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-400 mb-1">End Date</label>
            <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
              className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-800 outline-none focus:border-stone-400 bg-stone-50" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-400 mb-1">Number in Series</label>
            <input type="text" value={form.series} onChange={e => setForm(f => ({ ...f, series: e.target.value }))}
              placeholder="Number in series…"
              className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-800 outline-none focus:border-stone-400 bg-stone-50" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-400 mb-1">Next in Series</label>
            <input type="text" value={form.next_in_series} onChange={e => setForm(f => ({ ...f, next_in_series: e.target.value }))}
              placeholder="Next book title…"
              className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-800 outline-none focus:border-stone-400 bg-stone-50" />
          </div>
        </div>

        {/* Ratings */}
        <div className="flex gap-8 py-2">
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-400 mb-2">My Rating</label>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(i => (
                <button key={i} onClick={() => setForm(f => ({ ...f, star_rating: i }))}
                  className={`text-2xl transition-colors ${i <= form.star_rating ? 'text-amber-400' : 'text-stone-300'}`}>
                  ★
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-400 mb-2">Spice Level</label>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(i => (
                <button key={i} onClick={() => setForm(f => ({ ...f, spice_rating: i }))}
                  className={`text-2xl transition-colors ${i <= form.spice_rating ? 'opacity-100' : 'opacity-25'}`}>
                  🌶️
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Format */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-stone-400 mb-2">Format</label>
          <div className="flex gap-2">
            {(['ebook', 'audio', 'physical'] as const).map(fmt => (
              <button key={fmt} onClick={() => setForm(f => ({ ...f, format: fmt }))}
                className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                  form.format === fmt
                    ? 'bg-stone-800 text-amber-100 border-stone-800'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-400'
                }`}>
                {fmt === 'physical' ? '📖 Physical' : fmt === 'ebook' ? '📱 E-Book' : '🎧 Audiobook'}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
       <div>
  <div className="flex items-center justify-between mb-1">
    <label className="block text-xs uppercase tracking-wider text-stone-400">Notes</label>
    <button
      onClick={() => {
        if (notesHistory.length === 0) return
        const prev = notesHistory[notesHistory.length - 1]
        setForm(f => ({ ...f, notes: prev }))
        setNotesHistory(h => h.slice(0, -1))
      }}
      disabled={notesHistory.length === 0}
      className="text-xs text-stone-400 hover:text-stone-600 disabled:opacity-30 transition-colors px-2 py-1 border border-stone-200 rounded-md"
    >
      ↩ Undo
    </button>
  </div>
  <textarea
    value={form.notes}
    onChange={e => {
      setNotesHistory(h => [...h, form.notes])
      setForm(f => ({ ...f, notes: e.target.value }))
    }}
    placeholder="Your thoughts, reflections, favorite moments…"
    rows={20}
className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-800 outline-none focus:border-stone-400 bg-stone-50 resize-y leading-relaxed"
  />
</div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 bg-stone-800 text-amber-100 rounded-lg text-sm font-medium hover:bg-stone-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-6 py-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 disabled:opacity-50 transition-colors"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </main>
  )
}