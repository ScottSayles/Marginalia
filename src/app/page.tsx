import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Book } from '@/types/book'

export default async function Home() {
  const supabase = await createClient()
  const { data: books, error } = await supabase
    .from('books')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen p-8 max-w-3xl mx-auto">
      <div className="mb-8">
  <div className="flex items-center justify-between">
    <h1 className="text-4xl font-serif font-medium">Marginalia</h1>
    <Link
      href="/books/new"
      className="px-4 py-2 bg-stone-800 text-amber-100 rounded-lg text-sm hover:bg-stone-700 transition-colors"
    >
      + Add Book
    </Link>
  </div>
  <p className="text-sm text-gray-500 mt-1">My Reading Log</p>
</div>

      {error && <p className="text-red-500">Error: {error.message}</p>}

      {books?.length === 0 && (
        <div className="text-center py-24 text-gray-400">
          <p className="text-lg">No books yet.</p>
          <p className="text-sm mt-1">Add your first book to get started.</p>
        </div>
      )}

      <div className="divide-y divide-stone-200">
        {books?.map((book: Book) => (
          <Link
            key={book.id}
            href={`/books/${book.id}`}
            className="flex items-center gap-4 py-4 hover:bg-stone-50 px-2 rounded-lg transition-colors group"
          >
            {book.cover_url ? (
              <img
                src={book.cover_url}
                alt={book.title}
                className="w-10 h-14 object-cover rounded shadow-sm"
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