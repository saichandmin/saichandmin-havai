const express = require('express')
const {sequelize, Airport, City, Country} = require('./models')

const app = express()
const port = 3000

// Define a GET route that accepts the "iata_code" parameter
app.get('/airport/:iata_code', async (req, res) => {
  const iata_code = req.params.iata_code

  // Use Sequelize to query the database for the airport details,
  // including related city and country data in a single query
  const airport = await Airport.findOne({
    where: {iata_code},
    include: [
      {
        model: City,
        include: [
          {
            model: Country,
          },
        ],
      },
    ],
  })

  // If airport data is found, return it in the required format
  if (airport) {
    const response = {
      airport: {
        id: airport.id,
        icao_code: airport.icao_code,
        iata_code: airport.iata_code,
        name: airport.name,
        type: airport.type,
        latitude_deg: airport.latitude_deg,
        longitude_deg: airport.longitude_deg,
        elevation_ft: airport.elevation_ft,
        address: {
          city: {
            id: airport.City.id,
            name: airport.City.name,
            country_id: airport.City.country_id,
            is_active: airport.City.is_active,
            lat: airport.City.lat,
            long: airport.City.long,
          },
          country: airport.City.Country
            ? {
                id: airport.City.Country.id,
                name: airport.City.Country.name,
                country_code_two: airport.City.Country.country_code_two,
                country_code_three: airport.City.Country.country_code_three,
                mobile_code: airport.City.Country.mobile_code,
                continent_id: airport.City.Country.continent_id,
              }
            : null,
        },
      },
    }
    res.send(response)
  } else {
    res.status(404).send('Airport not found')
  }
})

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})
