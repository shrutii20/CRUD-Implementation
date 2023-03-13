const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const jwtoken = require('jsonwebtoken');
const secret = "secret";

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



mongoose.connect('mongodb://127.0.0.1:27017');
mongoose.connection.on('connected', () => console.log('Connected'));
mongoose.connection.on('error', () => console.log('Connection failed with - ',err));


// Verification Middleware
async function verify(req, res, next) {
  const bearerHead = req.headers['Authorization'];
  if(typeof bearerHead !== 'undefined') {
    res.status(400).send({
      result: 'Token not valid'
    })
  }
  // else{

  // }
}



const Product = require('./product.model');

app.get('/products', verify, (req, res) => {
    Product.find().then((products) => {
      res.send(products);
    }).catch((err) => {
      res.status(500).send({
        message: err.message || 'Some error occurred while retrieving products.'
      });
    });
  });
  
app.get('/products/:id', (req, res) => {
    Product.findById(req.params.id).then((product) => {
      if (!product) {
        return res.status(404).send({
          message: `Product with id ${req.params.id} not found.`
        });
      }
      res.send(product);
    }).catch((err) => {
      if (err.kind === 'ObjectId') {
        return res.status(404).send({
          message: `Product with id ${req.params.id} not found.`
        });
      }
      return res.status(500).send({
        message: `Error retrieving product with id ${req.params.id}`
      });
    });
  });
  

app.post('/login', (req, res) => {
  const cred = {
    id: 1,
    username: "admin",
    email: 'admin@test.com',
  }
  jwtoken.sign({cred}, secret, {expiresIn: '300s'}, (err, token) => {
    res.json({token});
  });
});

app.post('/products', (req, res) => {
    const product = new Product({
      name: req.body.name,
      price: req.body.price,
      description: req.body.description
    });
  
    product.save().then((data) => {
      res.send(data);
    }).catch((err) => {
      res.status(500).send({
        message: err.message || 'Some error occurred while creating the product.'
      });
    });
  });
  
app.put('/products/:id', (req, res) => {
    Product.findByIdAndUpdate(req.params.id, {
      name: req.body.name,
      price: req.body.price,
      description: req.body.description
    }, { new: true }).then((product) => {
      if (!product) {
        return res.status(404).send({
          message: `Product with id ${req.params.id} not found.`
        });
      }
      res.send(product);
    }).catch((err) => {
      if (err.kind === 'ObjectId') {
        return res.status(404).send({
          message: `Product with id ${req.params.id} not found.`
        });
      }
      return res.status(500).send({
        message: `Error updating product with id ${req.params.id}`
      });
    });
  });
  
app.delete('/products/:id', (req, res) => {
    Product.findByIdAndRemove(req.params.id).then((product) => {
      if (!product) {
        return res.status(404).send({
          message: `Product with id ${req.params.id} not found.`
        });
      }
      res.send({ message: 'Product deleted successfully!' });
    }).catch((err) => {
      res.status(500).json({
        error: err,
        message: 'Error deleting product'
      });
    });
  });



app.listen(3000, () => {
console.log('Server started on port 3000');
});