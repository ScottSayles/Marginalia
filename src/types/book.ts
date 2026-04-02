export type Book = {
  id: string
  title: string
  author: string | null
  genre: string | null
  page_count: number | null
  start_date: string | null
  end_date: string | null
  series: string | null
  next_in_series: string | null
  star_rating: number
  spice_rating: number
  format: 'physical' | 'ebook' | 'audio'
  notes: string | null
  cover_url: string | null
  created_at: string
}