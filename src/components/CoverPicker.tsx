'use client'

import { useState } from 'react'

type Props = {
  value: string
  onChange: (url: string) => void
  title?: string
  author?: string
  size?: 'sm' | 'lg'
  showMeta?: boolean
}

export default function CoverPicker({
  value,
  onChange,
  title = '',
  author = '',
  size = 'sm',
  showMeta = true,
}: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{ id: number; url: string }[]>([])
  const [searching, setSearching] = useState(false)

  const box = size === 'lg' ? 'w-24 h-36' : 'w-14 h-20'

  async function searchCovers() {
    const q = query.trim() || title.trim()
    if (!q) return
    setSearching(true)
    setResults([])
    try {
      const res = await fetch(
        `https://openlibrary.org/search.json?title=${encodeURIComponent(q)}&limit=12&fields=cover_i`
      )
      const data = await res.json()
      const covers = (data.docs || [])
        .filter((d: any) => d.cover_i)
        .map((d: any) => ({
          id: d.cover_i,
          url: `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg`,
        }))
      setResults(covers)
    } catch {
      alert('Cover search failed.')
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="mb-6 p-4 bg-stone-50 rounded-lg border border-stone-200">
      <div className="flex items-center gap-4">
        {value ? (
          <img src={value} alt="Cover" className={`${box} object-cover rounded shadow-md flex-shrink-0`} />
        ) : (
          <div className={`${box} bg-stone-800 rounded shadow-md flex items-center justify-center flex-shrink-0`}>
            <div className="w-2 h-2/5 bg-amber-400 rounded" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          {showMeta && (
            <>
              <p className="font-medium text-stone-800 truncate">{title || 'Untitled'}</p>
              <p className="text-sm text-stone-500 italic truncate">{author}</p>
            </>
          )}
          <div className={`flex gap-3 ${showMeta ? 'mt-2' : ''}`}>
            <button
              type="button"
              onClick={() => {
                setOpen(o => !o)
                if (!query) setQuery(title)
              }}
              className="text-xs text-stone-600 underline"
            >
              {value ? 'Change cover' : 'Find a cover'}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="text-xs text-stone-400 hover:text-red-500 underline transition-colors"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      {open && (
        <div className="mt-4 pt-4 border-t border-stone-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  searchCovers()
                }
              }}
              placeholder="Search covers by title…"
              className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 outline-none focus:border-stone-400 bg-white"
            />
            <button
              type="button"
              onClick={searchCovers}
              disabled={searching}
              className="px-4 py-2 bg-stone-800 text-amber-100 rounded-lg text-sm disabled:opacity-50"
            >
              {searching ? '…' : 'Search'}
            </button>
          </div>

          {results.length > 0 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mt-4">
              {results.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    onChange(c.url)
                    setOpen(false)
                    setResults([])
                  }}
                  className="rounded overflow-hidden border-2 border-transparent hover:border-amber-400 transition-colors"
                >
                  <img src={c.url} alt="" className="w-full h-24 object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-4">
            <label className="block text-xs uppercase tracking-wider text-stone-400 mb-1">
              Or paste an image URL
            </label>
            <input
              type="text"
              value={value}
              onChange={e => onChange(e.target.value)}
              placeholder="https://…"
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 outline-none focus:border-stone-400 bg-white"
            />
          </div>
        </div>
      )}
    </div>
  )
}