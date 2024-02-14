import pg from 'pg'

const config = {
  host: 'localhost',
  port: 5432,
  database: 'node_api',
  user: 'saalcazar',
  password: 'a1b2c3d4c0'
}

const client = new pg.Client(config)
await client.connect()

export class MovieModel {
  static async getAll ({ genre }) {
    if (genre) {
      const lowerCaseGenre = genre.toLowerCase()
      const genres = await client.query('SELECT id, name FROM genres WHERE LOWER(name) = $1', [lowerCaseGenre])
      if (genres.length === 0) return []
      const [{ id }] = genres.rows
      const allMovies = await client.query('SELECT id, title, year, director, duration, poster, rate FROM movies')
      const moviesId = await client.query('SELECT movie_id FROM movie_genres WHERE genre_id = $1', [id])
      const mapMoviesId = moviesId.rows.map(movieId => movieId.movie_id)
      const moviesByGender = allMovies.rows.filter(movie => mapMoviesId.includes(movie.id))
      return [moviesByGender]
    }
    const result = await client.query('SELECT id, title, year, director, duration, poster, rate FROM movies')
    return result.rows
  }

  static async getById ({ id }) {
    const movie = await client.query('SELECT id, title, year, director, duration, poster, rate FROM movies WHERE id = $1', [id])
    if (!movie) return null
    return movie.rows
  }

  static async create ({ input }) {

  }

  static async delete ({ id }) {

  }

  static async update ({ id, input }) {

  }
}
