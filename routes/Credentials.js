var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const MongoDb = require('mongodb');
var jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();


router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/signUp',async function(req,res){

    try {

      let salt = await bcrypt.genSalt(10);
      let hash = await bcrypt.hash(req.body.password,salt)
      req.body.password = hash

      let url = process.env.DB1;
      let client = await MongoDb.connect(url);
      let db = await client.db("users");
    
      let data = await db.collection("hack2Users").insertOne({

        "email" : req.body.email,
        "firstName" : req.body.firstName,
        "password" : req.body.password,
        "mobile" : req.body.mobile
      })

      let data1 = await db.collection("Cart").insertOne({

        "email" : req.body.email,
        cart : []
        
      })

      let jwtToken = await jwt.sign({email : req.body.email,firstName : req.body.firstName},process.env.JWT,{expiresIn : "1h"}) 
      await client.close();
      
      let userDetails  = {
        "email" : req.body.email,
        "firstName" : req.body.firstName,
        "mobile" : req.body.mobile,
      }
      res.json({
        "token" : jwtToken,
        "message" : "Registration Successful",
        "status" : "success",
        "userDetails" : userDetails
      })
    
    } catch (error) {
      console.log(error);
    }
})

router.post('/signIn',async function(req,res){


  try {

    let url = process.env.DB1;
    let client = await MongoDb.connect(url);
    let db = await client.db("users");

      let user = await db.collection("hack2Users").findOne({email : req.body.email})

      let result = await bcrypt.compare(req.body.password,user.password)
      if(result === true) {
        
        let jwtToken = await jwt.sign({email : req.body.email,firstName : user.firstName},process.env.JWT,{expiresIn : "1h"})

        res.json({
          "token" : jwtToken,
          "message" : "Authentication Successful",
          "status" : "Successful",
          "userDetails" : user
        })

      } else {

        res.json({
          message : "Password does not match",
          "status" : "Not Successful"
        })

      }
    await client.close();

  } catch (error) {
    console.log(error);
  }
})

router.post('/submitRequest',async function(req,res){

  try {

    let url = process.env.DB1;
    let client = await MongoDb.connect(url);
    let db = await client.db("users");
  
    let data = await db.collection("userRequests").insertOne({

      "email" : req.body.email,
      "firstName" : req.body.firstName,
      "mobile" : req.body.mobile,
      "RequestInfo" : req.body.RequestInfo
    })

    await client.close();
    
    res.json({

      "message" : "Request is Submitted Successfully"

    })
  
  } catch (error) {
    console.log(error);
  }
})

module.exports = router;
