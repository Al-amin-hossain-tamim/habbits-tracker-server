const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 3000;

// middle ware

app.use(cors())
app.use(express.json())



// const uri = "mongodb+srv://HabbitsTrackerUser:80Gk4MofiCrOyY7q@simple-crud-db.s7vfjgz.mongodb.net/?appName=simple-crud-db";

const uri = `mongodb+srv://${process.env.DD_USER}:${process.env.DB_PASS}@simple-crud-db.s7vfjgz.mongodb.net/?appName=simple-crud-db`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});





app.get('/',(req,res)=>{
    res.send("habbits-tracker-server is running")
})

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

app.listen(port,()=>{
    console.log(`habbits tracker server is running on port ${port}`)
})