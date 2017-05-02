var express = require('express');
var router = express.Router();
const EventCtrl = require("../controllers/events");
const ActorCtrl = require("../controllers/actors");
const data = require('../tasks');
const config = require('../config');



/*
* this is route is to store the events data in db.
*/
router.get("/dumpData",function(req,res){
	console.log("data dump started calling other functions please wait...................");
	data.dumpEventsInDatabase(config.dataSet)
	.then(function(result) {
		console.log(result);
		res.status(200).json("Data stored");
	})
	.catch(function(error) {
		console.log(error)
	})
});

//this route will return the records based on repoId and eventtype

router.get('/events/:type/:id', function(req, res) {
	const event = req.params.type;
	const repo = req.params.id;
	EventCtrl.getRepositoryByIdAndEventType(repo, event)
		.then(function(result) {
			res.json({
				status: "ok",
				repository: result
			})
		})
		.catch(function(err) {
			res.json({
				status: "error",
				message: "Internal Server error"
			})
		});
});


// returns the list of repositories contributed by actor login.
router.get("/actor/:login", function(req, res) {
	const login = req.params.login;
	EventCtrl.getActorAndHisRepositories(login)
		.then(function(result) {
			res.json({
				status: "ok",
				repository: result
			})
		})
		.catch(function(err) {
			console.log(err)
			res.json({
				status: "error",
				message: "Internal Server error"
			})
		});
});


/*return list of all repositories with their top contributor 
* applying a limit of 200 
* u can pass the limit and skip in the query too
*/
router.get("/repository/all", function(req, res) {
	const skip = parseInt(req.query.skip) || 0;
	const limit = parseInt(req.query.limit) || 200;

	EventCtrl.getAllRepoWithTopContributor(skip, limit)
		.then(function(result) {
			res.json({
				status: "ok",
				repository: result
			})
		})
		.catch(function(err) {
			console.log(err)
			res.json({
				status: "error",
				message: "Internal Server error"
			})
		});
});

//return the repositories with the highest number of events and sort by date if same number of events occour

router.get("/highest/:login", function(req, res) {
	const login = req.params.login;
	EventCtrl.getHighestEventsByActor(login)
		.then(function(result) {
			res.json({
				status: "ok",
				repository: result
			})
		})
		.catch(function(err) {
			console.log(err)
			res.json({
				status: "error",
				message: "Internal Server error"
			})
		});
});

/*
Delete the history of actors event 
*/
router.delete("/:login", function(req, res) {
	const login = req.params.login;
	ActorCtrl.deleteHistoryByLoginName(login)
		.then(function(result) {
			res.json({
				status: "ok",
				repository: result
			})
		})
		.catch(function(err) {
			console.log(err)
			res.json({
				status: "error",
				message: "Internal Server error"
			})
		});
});



module.exports = router;

