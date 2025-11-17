const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middle ware

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DD_USER}:${process.env.DB_PASS}@simple-crud-db.s7vfjgz.mongodb.net/?appName=simple-crud-db`;

// console.log(uri);

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("habbits-tracker-server is running");
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const db = client.db("habbits");
    const habbitCollection = db.collection("habbits");
    const usersCollection = db.collection("users");

    app.post("/users", async (req, res) => {
      const newUser = req.body;

      const email = req.body.email;
      const query = { email: email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        res.send({message:"user already exists.Do not need to insert again"});
      } else {
        const result = await usersCollection.insertOne(newUser);
        res.send(result);
      }
    });

// api for public habbits
    app.get("/habbits", async (req, res) => {
      const cursor = habbitCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // latest or recent habbit 

    app.get("/latest-habbits",async(req,res)=>{
      const cursor = habbitCollection.find().sort({created_At:-1}).limit(6);
      const result = await cursor.toArray();
      res.send(result)
    });

    // habbit details api

    app.get("/habbits/:id",async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await habbitCollection.findOne(query)
      res.send(result)
    });

    // api for my habbits
    app.get("/my-habbits",async(req,res)=>{
      const email = req.query.email;
      const query = {};
      if(email){
        query.email = email;
      }
      
      const cursor = habbitCollection.find(query)
      const result = await cursor.toArray();
      res.send(result)

    });

    app.post("/habbits", async (req, res) => {
      const newHabbit = req.body;
      const habbitWithDate ={
        ...newHabbit,created_At: new Date()
      }
      const result = await habbitCollection.insertOne(habbitWithDate);
      res.send(result);
    });
    // update my habbit api

    // PATCH: update habit + push date into completionHistory (if provided)
app.patch("/habbits/:id", async (req, res) => {
  const id = req.params.id;
  const { addDate, ...fields } = req.body;

  const query = { _id: new ObjectId(id) };

  let update = { $set: fields };

  // If frontend sends addDate → push into completionHistory array
  if (addDate) {
    update.$addToSet = { completionHistory: addDate };
  }

  const result = await habbitCollection.updateOne(query, update);

  // Fetch updated habit
  const updatedHabit = await habbitCollection.findOne(query);

  // Compute streak
  const history = updatedHabit.completionHistory || [];
  let streak = 0;
  let check = new Date();

  while (true) {
    const day = check.toISOString().split("T")[0];
    if (history.includes(day)) {
      streak++;
      check.setDate(check.getDate() - 1);
    } else break;
  }

  // Save streak in DB
  await habbitCollection.updateOne(query, { $set: { currentStreak: streak } });

  updatedHabit.currentStreak = streak;

  res.send({
    success: true,
    habit: updatedHabit,
    currentStreak: streak,
  });
});

// delete api 
    app.delete("/habbits/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await habbitCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`habbits tracker server is running on port ${port}`);
});
