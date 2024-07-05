const {sequelize} = require('./models')

// Create the database tables
async function createTables() {
  await sequelize.sync({force: true})
  console.log('Tables created!')
}

createTables()
