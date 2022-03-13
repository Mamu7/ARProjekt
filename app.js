const express = require('express')
var fs = require('fs')
var https = require('https')
const app = express()
const Swal = require('sweetalert2')
const MongoClient = require('mongodb').MongoClient

const bodyParser = require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;

const PORT = 3000

app.use('/aframe', express.static(__dirname + '/node_modules/aframe/dist/'))
app.use('/gltf', express.static(__dirname + '/public/gltf'))
app.use('/pattern', express.static(__dirname + '/public/pattern'))
app.use('/js', express.static(__dirname + '/public/js'))
app.use('/css', express.static(__dirname + '/public/css'))

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/html/index.html')
})

app.get('/ar', function (req, res) {
    res.sendFile(__dirname + '/public/html/ar.html')
})

app.get('/login', function (req, res) {
    res.sendFile(__dirname + '/public/html/login.html')
})

//database

//const url = 'mongodb://192.168.2.100:27017/likes'
const url = 'mongodb://localhost:27017/likes'

const dbName = "ARProjekt"
let db
MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
  if (err) return console.log(err)

  // Storing a reference to the database so you can use it later
  db = client.db(dbName)
  console.log(`Connected MongoDB: ${url}`)
  console.log(`Database: ${dbName}`)

  //Create Database
  db.collection("likes").findOneAndUpdate(
    {
      name : "car"
    },
    {
      $setOnInsert: {name: "car", likes: 20, dislikes: 5, meldungen: 2}
    },
    {upsert: true}
  )
  db.collection("likes").findOneAndUpdate(
    {
      name : "truck"
    },
    {
      $setOnInsert: {name: "truck", likes: 15, dislikes: 7, meldungen: 3}
    },
    {upsert: true}
  )
  db.collection("likes").findOneAndUpdate(
    {
      name : "old_building"
    },
    {
      $setOnInsert: {name: "old_building", likes: 25, dislikes: 10, meldungen: 5}
    },
    {upsert: true}
  )
  db.collection("likes").findOneAndUpdate(
    {
      name : "sofa"
    },
    {
      $setOnInsert: {name: "sofa", likes: 40, dislikes: 2, meldungen: 1}
    },
    {upsert: true}
  )
  db.collection("users").findOneAndUpdate(
    {
      username : "admin"
    },
    {
      $setOnInsert: {username: "admin", password: 48690, liked_posts: [], disliked_posts: [], gemeldet_posts: []}
    },
    {upsert: true}
  )
})


https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
}, app)
    .listen(3000, function () {
        console.log('Example app listening on port 3000! Go to https://localhost:3000/')
    })

//#######   Likes   ######################
app.get("/likes/", (req, res) => {
  db.collection("likes").find().toArray()
  .then(results => {
    res.send(results);
  })
  .catch(error => console.error(error))
})

app.post("/likes/", (req, res) => {
  db.collection("likes").insertOne(req.body)
  .then(results => {
  })
  .catch(error => console.error(error))
})

app.put("/likes/", (req, res) => {
  db.collection("likes").findOneAndUpdate(
    {name: req.body.name },
    {$set: {
      likes: req.body.likes,
      dislikes: req.body.dislikes,
      meldungen: req.body.meldungen
      }
    },
    {
      upsert: false
    }
  )
  .then(results => {
    res.send();
  })
  .catch(error => console.error(error))
})

app.delete("/likes/", (req, res) => {
  db.collection("likes").deleteOne(
    { name: req.body.name }
  )
  .then(results => {
    res.json("Instance Deleted")
  })
  .catch(error => console.error(error))
})

//#########   Users   ##################

app.get("/users/", (req, res) => {
  db.collection("users").find().toArray()
  .then(results => {
    res.send(results);
  })
  .catch(error => console.error(error))
})

app.post("/users/", (req, res) => {
  db.collection("users").insertOne(req.body)
  .then(results => {
  })
  .catch(error => console.error(error))
})

app.put("/users/", (req, res) => {
  db.collection("users").findOneAndUpdate(
    { username: req.body.username },
    { $set: {
      liked_posts: req.body.liked_posts,
      disliked_posts: req.body.disliked_posts,
      gemeldet_posts: req.body.gemeldet_posts
      }
    },
    {
      upsert: false
    }
  )
  .then(results => {
    res.send();
  })
  .catch(error => console.error(error))
})

app.delete("/users/", (req, res) => {
  db.collection("users").deleteOne(
    { username: req.body.username }
  )
  .then(results => {
    res.json("Instance Deleted")
  })
  .catch(error => console.error(error))
})
