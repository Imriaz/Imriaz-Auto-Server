const express = require('express')
const app = express()
const cors = require('cors');
//const admin = require("firebase-admin");
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require("mongodb").ObjectId;

const port = process.env.PORT || 5000;

//const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// });

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.y1dxx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// async function verifyToken(req, res, next) {
//     if (req.headers?.authorization?.startsWith('Bearer ')) {
//         const token = req.headers.authorization.split(' ')[1];

//         try {
//             const decodedUser = await admin.auth().verifyIdToken(token);
//             req.decodedEmail = decodedUser.email;
//         }
//         catch {

//         }

//     }
//     next();
// }

async function run() {
    try {
        await client.connect();
        const database = client.db('ImriazAuto');
        const productsCollection = database.collection('products');
        const usersCollection = database.collection('users');
        const ordersCollection = database.collection('orders');
        const reviewsCollection = database.collection('review');

        // app.get('/products', verifyToken, async (req, res) => {
        app.get('/products', async (req, res) => {
            const email = req.query.email;
            const date = req.query.date;

            const query = { email: email, date: date }

            const cursor = productsCollection.find(query);
            const products = await cursor.toArray();
            res.json(products);
        })

        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.json(result)
        });

        //ADD Order by POST Method
        app.post('/orders', async (req, res) => {
            const orderProduct = req.body;
            console.log(orderProduct);
            const result = await ordersCollection.insertOne(orderProduct);
            res.send(result);
        });

        //GET my Orders
        app.get('/myOrders/:email', async (req, res) => {
            const result = await ordersCollection.find({
                email: req.params.email,
            }).toArray();
            res.send(result);
        });

        //Get API for Manage All Order
        app.get('/manageAllOrder', async (req, res) => {
            const result = await ordersCollection.find({}).toArray();
            res.send(result);
            console.log(result);
        });

        //DELETE Ordered Package
        app.delete('/deleteOrder/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            console.log(id);
            const result = await ordersCollection.deleteOne(query);
            console.log("Deleting user with id ", result);
            res.send(result);
        });

        //Add Product API
        app.post('/addProduct', async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.send(result);
        });

        //Add Review API
        app.post('/addReview', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.send(result);
        });

        //Get API for All Review 
        app.get('/addReview', async (req, res) => {
            const result = await reviewsCollection.find({}).toArray();
            res.send(result);
            console.log(result);
        });

        //DELETE Product
        app.delete('/deleteProduct/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            res.send(result);
        });

        //Add Admin to the Database
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });

        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        //Update Status API

        // make admin role PUT API (verifyToken, async er ager part 101 line)
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            // console.log('decodedEmail', req.decodedEmail);
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } }
            const result = await usersCollection.updateOne(filter, updateDoc)
            res.json(result);

        });

        // admin data get by GET 
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        });

    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello Imriaz Auto !!')
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
})