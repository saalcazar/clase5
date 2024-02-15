import { createApp } from './app.js'
import { MovieModel } from './models/database/movie.js'

createApp({ movieModel: MovieModel })
