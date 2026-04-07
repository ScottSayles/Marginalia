'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'


type SearchResult = {
  key: string
  title: string
  author_name?: string[]
  number_of_pages_median?: number
  cover_i?: number
  subject?: string[]
  series?: string[]
}

export default function NewBook() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [saving, setSaving] = useState(false)
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
    format: 'physical' as  'ebook' | 'audio' | 'physical' ,
    notes: '',
    cover_url: '',
  })

  useEffect(() => {
  const saved = localStorage.getItem('honeydew-draft')
  if (saved) {
    try {
      setForm(JSON.parse(saved))
    } catch {}
  }
}, [])

useEffect(() => {
  const timer = setTimeout(() => {
    localStorage.setItem('honeydew-draft', JSON.stringify(form))
  }, 1000)
  return () => clearTimeout(timer)
}, [form])


async function searchBooks() {
  if (!query.trim()) return
  setSearching(true)
  setResults([])
  try {
    const res = await fetch(
      `https://openlibrary.org/search.json?title=${encodeURIComponent(query)}&limit=6&fields=key,title,author_name,number_of_pages_median,cover_i,subject,series`
    )
    const data = await res.json()
    setResults(data.docs || [])
  } catch {
    alert('Search failed. You can enter details manually.')
  } finally {
    setSearching(false)
  }
}
  function selectBook(book: SearchResult) {
  const coverUrl = book.cover_i
    ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
    : ''
  const genre = book.subject ? book.subject.slice(0, 1).join(', ') : ''
  setForm(f => ({
    ...f,
    title: book.title || '',
    author: book.author_name?.[0] || '',
    page_count: book.number_of_pages_median?.toString() || '',
    series: book.series?.[0] || '',
    genre,
    cover_url: coverUrl,
  }))
  setResults([])
  setQuery('')
}

  function setRating(field: 'star_rating' | 'spice_rating', value: number) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSave() {
    if (!form.title.trim()) {
      alert('Please enter a title.')
      return
    }
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('books').insert({
  ...form,
  page_count: form.page_count ? parseInt(form.page_count) : null,
  start_date: form.start_date || null,
  end_date: form.end_date || null,
})
    if (error) {
      alert('Error saving: ' + error.message)
      setSaving(false)
      return
    }
    localStorage.removeItem('honeydew-draft')
router.push('/')
router.refresh()
  }

  return (
    <main className="min-h-screen px-4 py-8 w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-medium">Add a Book</h1>
          <p className="text-sm text-gray-500 mt-1">Search or enter manually</p>
          <p className="text-xs text-stone-400 mt-1">Draft saves automatically</p>
        </div>
        <button
  onClick={() => {
    localStorage.removeItem('honeydew-draft')
    router.back()
  }}
  className="text-sm text-stone-500 hover:text-stone-800"
>
  ← Cancel
</button>
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          placeholder="Search by title…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && searchBooks()}
          className="flex-1 border border-stone-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-stone-400 bg-stone-50 text-stone-800"
        />
        <button
          onClick={searchBooks}
          disabled={searching}
          className="px-4 py-2.5 bg-stone-800 text-amber-100 rounded-lg text-sm hover:bg-stone-700 disabled:opacity-50 transition-colors"
        >
          {searching ? 'Searching…' : 'Search'}
        </button>
      </div>

      {/* Search results */}
      {results.length > 0 && (
  <div className="border border-stone-200 rounded-lg overflow-hidden mb-6 shadow-sm">
    {results.map((book: SearchResult) => (
      <button
        key={book.key}
        onClick={() => selectBook(book)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-amber-50 border-b border-stone-100 last:border-0 text-left transition-colors"
      >
        {book.cover_i ? (
          <img
            src={`https://covers.openlibrary.org/b/id/${book.cover_i}-S.jpg`}
            className="w-8 h-11 object-cover rounded shadow-sm flex-shrink-0"
            alt={book.title}
          />
        ) : (
          <div className="w-8 h-11 bg-stone-200 rounded flex-shrink-0" />
        )}
        <div>
          <p className="text-sm font-medium text-stone-800">{book.title}</p>
          <p className="text-xs text-stone-500 italic">{book.author_name?.[0]}</p>
          {book.number_of_pages_median && (
            <p className="text-xs text-stone-400">{book.number_of_pages_median} pages</p>
          )}
        </div>
      </button>
    ))}
  </div>
)}

      {/* Cover preview */}
      {form.cover_url && (
        <div className="flex items-center gap-4 mb-6 p-4 bg-stone-50 rounded-lg border border-stone-200">
          <img src={form.cover_url} alt="Cover" className="w-14 h-20 object-cover rounded shadow" />
          <div>
            <p className="font-medium text-stone-800">{form.title}</p>
            <p className="text-sm text-stone-500 italic">{form.author}</p>
          </div>
        </div>
      )}

      {/* Form fields */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs uppercase tracking-wider text-stone-400 mb-1">Title</label>
            <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-stone-400 bg-stone-50 text-stone-800" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs uppercase tracking-wider text-stone-400 mb-1">Author</label>
            <input type="text" value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
              className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-stone-400 bg-stone-50 text-stone-800" />
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
              className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-stone-400 bg-stone-50 text-stone-800" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-400 mb-1">Start Date</label>
            <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
              className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-stone-400 bg-stone-50 text-stone-800" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-400 mb-1">End Date</label>
            <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
              className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-stone-400 bg-stone-50 text-stone-800" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-400 mb-1">Number in Series</label>
            <input type="text" value={form.series} onChange={e => setForm(f => ({ ...f, series: e.target.value }))}
              placeholder="Number in series..."
              className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-stone-400 bg-stone-50 text-stone-800" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-400 mb-1">Next in Series</label>
            <input type="text" value={form.next_in_series} onChange={e => setForm(f => ({ ...f, next_in_series: e.target.value }))}
              placeholder="Next book title…"
              className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-stone-400 bg-stone-50 text-stone-800" />
          </div>
        </div>

        {/* Ratings */}
        <div className="flex gap-8 py-2">
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-400 mb-2">My Rating</label>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(i => (
                <button key={i} onClick={() => setRating('star_rating', i)}
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
                <button key={i} onClick={() => setRating('spice_rating', i)}
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

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-stone-800 text-amber-100 rounded-lg text-sm font-medium hover:bg-stone-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving…' : 'Save Book'}
        </button>
      </div>
    </main>
  )
}