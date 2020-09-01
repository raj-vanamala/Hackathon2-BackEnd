var express = require('express');
var router = express.Router();
const MongoDb = require('mongodb');
var jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();
const razorPay = require('razorpay');
const shortId = require('shortid');

const instance = new razorPay({
  key_id: process.env.RAZORPAY_TEST_KEY,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

router.post('/addProduct',async function(req,res){

    try {

      let url = process.env.DB1;
      let client = await MongoDb.connect(url);
      let db = await client.db("EquipmentRentalSystem");
    
      let data = await db.collection("products").insertOne({

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

router.delete('/deleteProduct',async function(req,res){

  try {

    let url = process.env.DB1;
    let client = await MongoDb.connect(url);
    let db = await client.db("EquipmentRentalSystem");
  
    let data = await db.collection("products").deleteOne({"productName" : req.body.productName})
    await client.close();
    
    res.json({

      "message" : "Product Deleted Successfully"
    })
  
  } catch (error) {
    console.log(error);
  }
})

router.get('/loadProducts',async function(req,res){

    try {
  
      let url = process.env.DB1;
      let client = await MongoDb.connect(url);
      let db = await client.db("EquipmentRentalSystem");
  
      let data = await db.collection("products").find().toArray()
      await client.close();
  
      res.json({
        "data" : data
      })
    
    } catch (error) {
      console.log(error);
    }
})

router.post('/addProductToCart',async function(req,res){

  try {

    let url = process.env.DB1;
    let client = await MongoDb.connect(url);
    let db = await client.db("EquipmentRentalSystem");

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
    await client.close();

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
    let db = await client.db("EquipmentRentalSystem");

    let data = await db.collection("Cart").find({email : req.params.email}).toArray()
    await client.close();

    res.json({
      "data" : data[0].cart 
    })
  
  } catch (error) {
    console.log(error);
  }
})

router.post('/addProductToOrders',async function(req,res){

  try {

    let url = process.env.DB1;
    let client = await MongoDb.connect(url);
    let db = await client.db("EquipmentRentalSystem");

    let data1 = await db.collection("Orders").find({"email" : req.body.email}).toArray()
    
    let data = await db.collection("Orders").updateOne(
    {
      "email" : req.body.email
    },
    {
      $push : { products : req.body.productInfo },
      $set: { "Total Products" :  data1[0].products.length+1, "Total Price" : Number(data1[0]["Total Price"])+Number(req.body.productInfo.Price)}
    }
    )

    let data2 = await db.collection("Cart").updateOne(
      {
        "email" : req.body.email
      },
      {
        $pull : { cart : { productName : req.body.productInfo.productName} } 
      }
      )
      await client.close();

    res.json({
      "message" : "Product Added Successfully To Your Final Payment List"
    })
  
  } catch (error) {
    console.log(error);
  }
})

router.get('/paymentInfo/:email',async function(req,res){

  try {

    let url = process.env.DB1;
    let client = await MongoDb.connect(url);
    let db = await client.db("EquipmentRentalSystem");

    let data = await db.collection("Orders").find({"email" : req.params.email}).toArray()
    await client.close();

    res.json({
      "data" : data[0]
    })
  
  } catch (error) {
    console.log(error);
  }
})

router.get('/razorPay/:email',async function(req,res){

  try {

    let url = process.env.DB1;
    let client = await MongoDb.connect(url);
    let db = await client.db("EquipmentRentalSystem");

    let data = await db.collection("Orders").find({"email" : req.params.email}).toArray()
    await client.close();

    const payment_capture = 1
    const amount = data[0]["Total Price"]
    const currency = 'INR'

    const options = {
    amount : (amount * 100).toString(), 
    currency, 
    receipt: shortId.generate(), 
    payment_capture
    }

    const response = await instance.orders.create(options)
    console.log(response)
    res.json({
      id:response.id,
      currency : 'INR',
      amount : response.amount
    })
    
  } catch (error) {
    console.log(error)
  }
})

router.post('/addProductsToMyOrders',async function(req,res){

  try {

    let url = process.env.DB1;
    let client = await MongoDb.connect(url);
    let db = await client.db("EquipmentRentalSystem");
    
    let data = await db.collection("MyOrders").updateOne(
    {
      "email" : req.body.email
    },
    {
      $push : { orders : req.body }
    }
    )

    let data1 = await db.collection("Orders").updateOne(
      {
        "email" : req.body.email
      },
      {
        $set: { products : [],"Total Products" :  "", "Total Price" : ""}
      }
      )
      await client.close();

    res.json({
      "message" : "Product Added Successfully To Your Final Payment List"
    })
  
  } catch (error) {
    console.log(error);
  }
})

router.get('/loadMyOrders/:email',async function(req,res){

  try {

    let url = process.env.DB1;
    let client = await MongoDb.connect(url);
    let db = await client.db("EquipmentRentalSystem");

    let data = await db.collection("MyOrders").find({"email" : req.params.email}).toArray()
    await client.close();
    
    res.json({
      "data" : data[0].orders
    })
  
  } catch (error) {
    console.log(error);
  }
})

module.exports = router;