const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const dbPath = path.join(__dirname, 'bus_management.db') 

let db = null

const createTables = async db => {
  const createUserTableQuery = `
    CREATE TABLE IF NOT EXISTS user (
      id INTEGER PRIMARY KEY,
      username TEXT UNIQUE,
      password TEXT,
      type TEXT,
      associate_id INTEGER
    );
  `
  const createDriverDetailsTableQuery = `
    CREATE TABLE IF NOT EXISTS driver_details (
      id INTEGER PRIMARY KEY,
      name TEXT,
      contact TEXT,
      assigned_bus_id INTEGER,
      FOREIGN KEY (assigned_bus_id) REFERENCES bus_details (id)
    );
  `
  const createBusDetailsTableQuery = `
    CREATE TABLE IF NOT EXISTS bus_details (
      id INTEGER PRIMARY KEY,
      assigned_route INTEGER,
      current_lat REAL,
      current_long REAL,
      isOnline INTEGER, -- 0 for false, 1 for true
      FOREIGN KEY (assigned_route) REFERENCES route_details (id)
    );
  `
  const createRouteDetailsTableQuery = `
    CREATE TABLE IF NOT EXISTS route_details (
      id INTEGER PRIMARY KEY,
      order_num INTEGER,
      info TEXT,
      lat REAL,
      long REAL
    );
  `
  const createStudentDetailsTableQuery = `
    CREATE TABLE IF NOT EXISTS student_details (
      id INTEGER PRIMARY KEY,
      name TEXT,
      default_bus_id INTEGER,
      FOREIGN KEY (default_bus_id) REFERENCES bus_details (id)
    );
  `
  await db.exec(createUserTableQuery)
  await db.exec(createDriverDetailsTableQuery)
  await db.exec(createBusDetailsTableQuery)
  await db.exec(createRouteDetailsTableQuery)
  await db.exec(createStudentDetailsTableQuery)
}

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    // Create tables after successfully connecting to the database
    await createTables(db) 
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

app.use(express.json())

const middleWare = (request, response, next) => {
  let jwtToken
  const authHeader = request.headers['authorization']
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(' ')[1]
  }
  if (jwtToken !== undefined) {
    jwt.verify(jwtToken, 'SECRET_TOKEN', async (error, payload) => {
      if (error) {
        response.status(401)
        response.send('Invalid JWT Token')
      } else {
        request.username = payload.username
        next()
      }
    })
  } else {
    response.status(401)
    response.send('Invalid JWT Token')
  }
}

app.post('/login', async (request, response) => {
  const {username = '', password = ''} = request.body
  const query = `SELECT * FROM user WHERE username='${username}'`
  const result = await db.get(query)
  if (result === undefined) {
    response.status(400)
    response.send('Invalid user')
  } else {
    const verify = await bcrypt.compare(password, result.password)
    if (verify) {
      const payload = {
        username,
      }
      const jwtToken = jwt.sign(payload, 'SECRET_TOKEN')
      response.status(200)
      response.send({jwtToken})
    } else {
      response.status(400)
      response.send('Invalid password')
    }
  }
})