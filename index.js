require('dotenv').config()
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;



// middleware 

app.use(cors())
app.use(express.json())



app.get('/', (req, res) => {
  res.send('Assignment test 10 is running')
})






const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2cslr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const reviewsCollections = client.db("gameRevieDB").collection("gamesReview");
    const watchlistCollections = client.db("gameRevieDB").collection("watchlist");
    const usersCollections = client.db("gameRevieDB").collection("users");


    // post for review
    app.post('/reviews', async (req, res) => {
      const reviews = req.body;
      const result = await reviewsCollections.insertOne(reviews)
      res.send(result)
    })

    // get for review

    app.get('/reviews', async (req, res) => {
      const reviews = reviewsCollections.find();
      const result = await reviews.toArray(reviews);
      res.send(result)
    })


    // sorted by rating only
    app.get('/reviews/highest-rated', async (req, res) => {
      const limit = parseInt(req.query.limit) || 6;
      const reviews = await reviewsCollections.find().sort({ rating: -1 }).limit(limit).toArray();
      res.send(reviews);

    });



    // get review using id
    app.get('/reviews/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await reviewsCollections.findOne(query)
      res.send(result)
    })

    // update for review
    app.put('/reviews/:id', async (req, res) => {
      const id = req.params.id;
      const review = req.body; // Accessing the review data from the request body

      const updateReview = {
        $set: {
          name: review.name,
          email: review.email,
          gameTitle: review.gameTitle,
          genre: review.genre,
          rating: review.rating,
          publishingYear: review.publishingYear,
          photoUrl: review.photoUrl,
          reviewDescription: review.reviewDescription
        }
      };

      const filter = { _id: new ObjectId(id) }; // Matching the review by ID
      const result = await reviewsCollections.updateOne(filter, updateReview);

      res.send(result);
    });

    // delete review 
    app.delete('/reviews/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await reviewsCollections.deleteOne(query);
      res.send(result)
    })

    // post 
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollections.insertOne(user)
      res.send(result)
    })

    // get for user
    app.get('/users', async (req, res) => {
      const user = usersCollections.find()
      const result = await user.toArray(user)
      res.send(result)
    })





    // post for watchlist 
    app.post('/watchlists', async (req, res) => {
      const watchlist = req.body;
      const result = await watchlistCollections.insertOne(watchlist);
      res.send(result)
    })




    // get for watchlist 

    app.get('/watchlists', async (req, res) => {
      const watchlist = watchlistCollections.find();
      const result = await watchlist.toArray(watchlist);
      res.send(result)
    })

    // watchlist delete -----------------

    app.delete('/watchlists/:id', async (req, res) => {
      const id = req.params.id;
      const watchlist = { _id: new ObjectId(id) };
      const result = await watchlistCollections.deleteOne(watchlist);
      res.send(result)
    })

    // watchlist getting by email
    app.get('/watchlists/:email', async (req, res) => {
      const email = req.params.email;
      const query = { reviewerEmail: email }
      const result = await watchlistCollections.find(query).toArray();
      res.send(result)
    })



    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




// listen 

app.listen(port, () => {
  console.log(`Simple crud running on the port ${port}`)
})