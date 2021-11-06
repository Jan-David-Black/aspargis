const express = require('express');
const webpush = require('web-push');
var debug = require('debug')('http');
var router = express.Router();

//storing the keys in variables
const publicVapidKey = 'BN1rZgnIUhURBJGNVVbLHUp2LMzfrKtPDfvP9QgNUzu1oBnFPLPLrOjKaNDry44Pzv0uD_YI4KAiqmQawoMHcr4';
const privateVapidKey = 'YmL-gKsKRt7I6J_8UayfovuuanGw5Y5KNjU00a3L_-A';

//setting vapid keys details
webpush.setVapidDetails('mailto:jan-david.fischbach@rwth-aachen.de', publicVapidKey,privateVapidKey);
/* GET users listing. */
router.post('/', function(req, res, next) {
  const body = req.body;
  console.log("subscriptions: ", body)

  //create paylod: specified the detals of the push notification
  body.sub.forEach((sub)=>{
    console.log(sub);
    const payload = JSON.stringify({title: body.name, id:body.id});
    webpush.sendNotification(sub, payload)
      .then((resp)=>{console.log("Success:", resp); res.status(201).json({message:"success"});})
      .catch(err=> {console.error(err); res.status(201).json({err});});
  })
});

module.exports = router;