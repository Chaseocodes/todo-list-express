// we use express by requiring it
const express = require('express')
// we run the app function by creating the variable we call 
const app = express()
// we create the mongoclient by requiring mongo
const MongoClient = require('mongodb').MongoClient
// we are creating a variable for it so its not hardcoded in the file
const PORT = 2121
// we are requiring our dotenv instantiates your hidden keys
require('dotenv').config()
// create a db variable to add our mongoclient string
let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'todo'
// we are connecting to mongodb by using a promise
MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })
    .then(client => {
        console.log(`Connected to ${dbName} Database`)
        db = client.db(dbName)
    })
// it tells express that we are using ejs as a template
app.set('view engine', 'ejs')
// tell Express to make this public folder accessible to the public by using a built-in middleware called express.static
app.use(express.static('public'))
// its extracts data from the todo list and adds them to the body property of the request object
app.use(express.urlencoded({ extended: true }))
// app.use parses incoming JSON requests and puts the parsed data in req.body
app.use(express.json())
//app.get is using an async  the callback 
app.get('/',async (request, response)=>{
 // await is waiting for a response from the server and returns an array of key value pairs
    const todoItems = await db.collection('todos').find().toArray()
// Returns the count of documents that match the query for a collection or view. 
    const itemsLeft = await db.collection('todos').countDocuments({completed: false})
// its rendering it in the index.ejs
    response.render('index.ejs', { items: todoItems, left: itemsLeft })
    // db.collection('todos').find().toArray()
    // .then(data => {
    //     db.collection('todos').countDocuments({completed: false})
    //     .then(itemsLeft => {
    //         response.render('index.ejs', { items: data, left: itemsLeft })
    //     })
    // })
    // .catch(error => console.error(error))
})
// a create request 
app.post('/addTodo', (request, response) => {
// // We use the insertOne method to add items to mongodb
    db.collection('todos').insertOne({thing: request.body.todoItem, completed: false})
    .then(result => {
        console.log('Todo Added')
        response.redirect('/')
    })
    .catch(error => console.error(error))
})

app.put('/markComplete', (request, response) => {
    // updateone finds the first document the matches the filter
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{
    //    $set appends new fields to existing documents.
        $set: {
            completed: true
          }
    },{
        sort: {_id: -1},
   // upsert means: insert a document if no documents can be updated
        upsert: false
    })
    .then(result => {
        console.log('Marked Complete')
        response.json('Marked Complete')
    })
    .catch(error => console.error(error))

})

app.put('/markUnComplete', (request, response) => {
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{
        $set: {
            completed: false
          }
    },{
        sort: {_id: -1},
        upsert: false
    })
    .then(result => {
        console.log('Marked Complete')
        response.json('Marked Complete')
    })
    .catch(error => console.error(error))

})

app.delete('/deleteItem', (request, response) => {
    db.collection('todos').deleteOne({thing: request.body.itemFromJS})
    .then(result => {
        console.log('Todo Deleted')
        response.json('Todo Deleted')
    })
    .catch(error => console.error(error))

})

app.listen(process.env.PORT || PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})