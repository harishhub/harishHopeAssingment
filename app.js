const express = require('express');
const router = express.Router();

const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));

const data = require('./tasks');
const config = require('./config');

mongoose.Promise = global.Promise;


mongoose.connect(config.dbase())
	.then(function(con) {
		console.log("Database Connected");
	})
	.catch(function(err) {
		console.log("error connecting Database", err)
	});


var net = require("net");


var sockets = [];


/*this is used to dump data */
/*app.use("/dumpdata",function(req,res){
	
	data.dumpEventsInDatabase(config.dataSet)
	.then(function(result) {
		console.log(result);
		res.status(200).json("Data stored");
	})
	.catch(function(error) {
		console.log(error)
	})
});*/

const index = require('./routes/index');

app.use(index);

app.use(function(req, res, next) {
	let err = new Error('Not Found');
	err.status = 404;
	next(err);
});

module.exports = app;