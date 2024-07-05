const express = require('express')
const {Sequelize, Model, DataTypes} = require('sequelize')

const sequelize = new Sequelize('sqlite::memory:')

const app = express()
app.use(express.json())

class Country extends Model {}
Country.init(
  {
    name: DataTypes.STRING,
    country_code_two: DataTypes.STRING,
    country_code_three: DataTypes.STRING,
    mobile_code: DataTypes.STRING,
    continent_id: DataTypes.INTEGER,
  },
  {sequelize, modelName: 'Country'},
)

class City extends Model {}
City.init(
  {
    name: DataTypes.STRING,
    country_id: DataTypes.INTEGER,
    is_active: DataTypes.BOOLEAN,
    lat: DataTypes.DECIMAL(10, 8),
    long: DataTypes.DECIMAL(11, 8),
  },
  {sequelize, modelName: 'City'},
)
City.belongsTo(Country)

class Airport extends Model {}
Airport.init(
  {
    icao_code: DataTypes.STRING,
    iata_code: DataTypes.STRING,
    name: DataTypes.STRING,
    type: DataTypes.STRING,
    latitude_deg: DataTypes.DECIMAL(10, 8),
    longitude_deg: DataTypes.DECIMAL(11, 8),
    elevation_ft: DataTypes.INTEGER,
  },
  {sequelize, modelName: 'Airport'},
)
Airport.belongsTo(City)

const data = require('./data.json')

sequelize.sync().then(async () => {
  await Country.bulkCreate(data.countries)
  await City.bulkCreate(data.cities)
  await Airport.bulkCreate(data.airports)

  app.get('/airport/:iata_code', async (req, res) => {
    const iataCode = req.params.iata_code.toUpperCase().trim()

    const airport = await Airport.findOne({
      where: {iata_code: iataCode},
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

    if (!airport) {
      res.status(404).send('Airport not found')
      return
    }

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

    res.json(response)
  })

  // Test cases
  app.get('/test', async (req, res) => {
    // Test case 1: Valid iata_code with all information
    let response = await requestAirport('AGR')
    console.log(response)
    assert(
      response.status === 200 &&
        response.data &&
        response.data.airport &&
        response.data.airport.address &&
        response.data.airport.address.city &&
        response.data.airport.address.city.country &&
        response.data.airport.address.city.country.name === 'India',
    )

    // Test case 2: Valid iata_code with missing country information
    response = await requestAirport('LCY')
    console.log(response)
    assert(
      response.status === 200 &&
        response.data &&
        response.data.airport &&
        response.data.airport.address &&
        response.data.airport.address.city &&
        response.data.airport.address.city.country == null,
    )

    // Test case 3: Invalid iata_code
    response = await requestAirport('XYZ')
    console.log(response)
    assert(response.status === 404 && response.data === 'Airport not found')

    // Test case 4: Valid iata_code with missing airport information
    response = await requestAirport('LCY')
    console.log(response)
    assert(
      response.status === 200 &&
        response.data &&
        response.data.airport &&
        response.data.airport.iata_code === 'LCY',
    )

    // Test case 5: Valid iata_code with missing city information
    response = await requestAirport('JFK')
    console.log(response)
    assert(response.status === 404 && response.data === 'Airport not found')

    // Test case 6: Invalid input parameters
    response = await requestAirport('')
    console.log(response)
    assert(response.status === 404 && response.data === 'Airport not found')

    // Test case 7: Edge cases
    response = await requestAirport(' aGr ')
    console.log(response)
    assert(
      response.status === 200 &&
        response.data &&
        response.data.airport &&
        response.data.airport.address &&
        response.data.airport.address.city &&
        response.data.airport.address.city.country &&
        response.data.airport.address.city.country.name === 'India',
    )

    // Test case 8: Multiple concurrent requests
    const requests = []
    for (let i = 0; i < 10; i++) {
      requests.push(requestAirport('AGR'))
      requests.push(requestAirport('LCY'))
      requests.push(requestAirport('JFK'))
    }
    response = await Promise.all(requests)
    console.log(response)
    assert(
      response.every(
        r =>
          r.status === 200 &&
          r.data &&
          r.data.airport &&
          r.data.airport.address &&
          r.data.airport.address.city,
      ),
    )

    res.send('All tests passed')
  })

  app.listen(3000, () => {
    console.log('Server started on port 3000')
  })
})

async function requestAirport(iataCode) {
  return await axios.get(`http://localhost:3000/airport/${iataCode}`)
}

function assert(condition) {
  if (!condition) {
    throw new Error('Assertion failed')
  }
}
