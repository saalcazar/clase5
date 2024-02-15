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
    const {
      title,
      year,
      director,
      duration,
      poster,
      rate
    } = input

    const uuidResult = await client.query('SELECT gen_random_uuid() uuid')
    const [{ uuid }] = uuidResult.rows

    try {
      await client.query('INSERT INTO movies (id, title, year, director, duration, poster, rate) VALUES ($1, $2, $3, $4, $5, $6, $7)', [uuid, title, year, director, duration, poster, rate])
    } catch (e) {
      throw new Error('Error to send information')
    }

    const movies = await client.query('SELECT id, title, year, director, duration, poster, rate FROM movies WHERE id = $1', [uuid])

    return movies.rows
  }

  static async delete ({ id }) {
    await client.query('DELETE FROM movies WHERE id = $1', [id])
  }

  static async update ({ id, input }) {
    const fields = Object.keys(input)
    if (fields.length === 0) {
      return 'No fields to update'
    }
    const set = fields.map((field, index) => `${field} = $${index + 1}`).join(', ')
    const values = fields.map(field => input[field])
    client.query(`UPDATE movies SET ${set} WHERE id = $${fields.length + 1}`, [...values, id])
    return 'Movie updated'
  }
}
