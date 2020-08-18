var express = require('express');
var router = express.Router();
const MongoDb = require('mongodb');
var jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();

router.post('/addProduct',async function(req,res){

    try {

      let url = process.env.DB1;
      let client = await MongoDb.connect(url);
      let db = await client.db("users");
    
      let data = await db.collection("products1").insertOne({

        "productName" : req.body.productName,
        "productPrice" : req.body.productPrice,
        "productCategory"  : req.body.productCategory
      })
      await client.close();
      
      res.json({

        "message" : "Product Added Successfully"
      })
    
    } catch (error) {
      console.log(error);
    }
})

router.get('/loadProducts',async function(req,res){

    try {
  
      let url = process.env.DB1;
      let client = await MongoDb.connect(url);
      let db = await client.db("users");
  
      let data = await db.collection("products1").find().toArray()
  
      res.json({
        "data" : data
      })
    
    } catch (error) {
      console.log(error);
    }
})

router.post('/addProductToCart',async function(req,res){

  console.log(req.body)

  try {

    let url = process.env.DB1;
    let client = await MongoDb.connect(url);
    let db = await client.db("users");

    let data = await db.collection("Cart").updateOne(
    {
      "email" : req.body.email
    },
    {
      $push : { cart :
        
        {
          productName : req.body.productName,
          productPrice : req.body.productPrice,
          productCategory : req.body.productCategory
        }
      }
    }
    )

    res.json({
      "message" : "Product Added Successfully To Your Cart"
    })
  
  } catch (error) {
    console.log(error);
  }
})

router.get('/loadProductsInCart:email',async function(req,res){

  try {

    let url = process.env.DB1;
    let client = await MongoDb.connect(url);
    let db = await client.db("users");

    let data = await db.collection("Cart").find({handle : req.params.email}).toArray()

    res.json({
      "data" : data
    })
  
  } catch (error) {
    console.log(error);
  }
})

module.exports = router;