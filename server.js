const cors = require('cors')
const express = require('express')

const PORT = 5500

app = express()

// ---- development purposes ----
// logging requests
const morgan = require('morgan')
app.use(morgan('dev'))

// alow external access
app.use(cors( {
	origin:  /[\s\S]/,
	credentials: true,
}))

// serve files
app.use(`/`, express.static(__dirname));



app.listen(PORT, () => {
    console.log('(+) Server listening on port', PORT, '...')
});