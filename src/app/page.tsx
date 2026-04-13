'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Book } from '@/types/book'

type SortOption = 'date_added' | 'title' | 'author' | 'rating' | 'date_read'

export default function Home() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOption>('date_added')

  useEffect(() => {
    async function loadBooks() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('books')
        .select('*')
      if (!error && data) setBooks(data)
      setLoading(false)
    }
    loadBooks()
  }, [])

  const filtered = books
    .filter(b => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        b.title?.toLowerCase().includes(q) ||
        b.author?.toLowerCase().includes(q) ||
        b.series?.toLowerCase().includes(q) ||
        b.genre?.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      switch (sort) {
        case 'title':
          return (a.title || '').localeCompare(b.title || '')
        case 'author':
          return (a.author || '').localeCompare(b.author || '')
        case 'rating':
          return (b.star_rating || 0) - (a.star_rating || 0)
        case 'date_read':
          return (b.end_date || '').localeCompare(a.end_date || '')
        case 'date_added':
        default:
          return (b.created_at || '').localeCompare(a.created_at || '')
      }
    })

  return (
    <main className="min-h-screen px-6 py-8 w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-4xl font-serif font-medium">Honeydew Books</h1>
        <p className="text-sm text-gray-500 mt-1">My Smutty Reading Log</p>
        <p className="text-sm text-stone-400 mt-0.5">{books.length} {books.length === 1 ? 'book' : 'books'} total</p>
        <div className="mt-4">
          <Link
            href="/books/new"
            className="px-4 py-2 bg-stone-800 text-amber-100 rounded-lg text-sm hover:bg-stone-700 transition-colors"
          >
            + Add Book
          </Link>
        </div>
      </div>

      {/* Search and sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by title, author, genre, series…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-stone-400 bg-stone-50"
        />
        <select
          value={sort}
          onChange={e => setSort(e.target.value as SortOption)}
          className="border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-800 outline-none focus:border-stone-400 bg-stone-50"
        >
          <option value="date_added">Sort: Date Added</option>
          <option value="title">Sort: Title</option>
          <option value="author">Sort: Author</option>
          <option value="rating">Sort: Rating</option>
          <option value="date_read">Sort: Date Read</option>
        </select>
      </div>

      {loading && <p className="text-stone-400">Loading…</p>}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-24 text-gray-400">
          {search ? (
            <p className="text-lg">No books match "{search}"</p>
          ) : (
            <>
              <p className="text-lg">No books yet.</p>
              <p className="text-sm mt-1">Add your first book to get started.</p>
            </>
          )}
        </div>
      )}
{!loading && filtered.length > 0 && (
  <p className="text-xs text-stone-400 mb-3">
    Showing {filtered.length} {filtered.length === 1 ? 'book' : 'books'}
    {search ? ` matching "${search}"` : ''}
  </p>
)}
<div className="divide-y divide-stone-200"></div>
      <div className="divide-y divide-stone-200">
        {filtered.map((book: Book) => (
          <Link
            key={book.id}
            href={`/books/${book.id}`}
            className="flex items-center gap-4 py-4 hover:bg-stone-50 px-2 rounded-lg transition-colors group"
          >
            {book.cover_url ? (
              <img
                src={book.cover_url}
                alt={book.title}
                className="w-10 h-14 object-cover rounded shadow-sm flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-14 bg-stone-800 rounded shadow-sm flex items-center justify-center flex-shrink-0">
                <div className="w-1 h-8 bg-amber-400 rounded" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-stone-800 truncate">{book.title}</p>
              <p className="text-sm text-stone-500 italic truncate">{book.author}</p>
              {book.series && (
                <p className="text-xs text-stone-400 mt-0.5">{book.series}</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              {book.star_rating > 0 && (
                <p className="text-amber-400 text-sm tracking-tight">
                  {'★'.repeat(book.star_rating)}{'☆'.repeat(5 - book.star_rating)}
                </p>
              )}
              {book.end_date ? (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Read</span>
              ) : book.start_date ? (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Reading</span>
              ) : (
                <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">Unread</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}