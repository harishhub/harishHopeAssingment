'use strict';
const request = require('request');
const zlib = require('zlib');
const async = require('async');
const Actor = require('../model/actor');
const Repository = require('../model/repository');
const Event = require('../model/event');

class Events {
	constructor(uri) {
		this.uri = uri
	}

	getEvents() {
		let self = this;
		return new Promise(function(resolve, reject) {
			request.get(self.uri, function(error, response, body) {
				if (error)
					reject(error);
				else
					resolve(body);
			});
		})
	}

	decodeEvents(encodedEvents) {
		let self = this;
		return new Promise((resolve, reject) => {
			zlib.gunzip(encodedEvents, (error, decodedEvents) => {
				if (error)
					reject(error);
				else {
					let Events = decodedEvents.toString().trim().split(/\r?\n/).map(line => JSON.parse(line));
					resolve(Events);
				}
			});
		})
	}

	storeEventsInDatabase(events) {
		const self = this;
		return new Promise(function(resolve, reject) {
			async.eachOfSeries(events, function(event, index, callback) {
				self.eventProcessor(event, index, callback)
			}, function(error) {
				if (error)
					reject();
				else
					resolve("All data Saved");
			})
		})
	}

	eventProcessor(event, index, cb) {
		//console.log(event.type, "=======", index);
		const self = this;
		async.waterfall(
			[
				function(callback) {
					self.saveActor(event, callback)
				},
				function(callback) {
					self.saveRepository(event, callback)
				},
				function(callback) {
					self.saveEvent(event, callback)
				}
			],
			function(error, result) {
				if (!error)
					cb()
			})

	}

	saveActor(event,callback) {
		let actor = event.actor;
		let act;

		Actor.findOne({
				login: actor.login
			})
			.then(function(existingActor) {
				if (existingActor)
					return existingActor;
				else {
					act = {
						actorId: actor.id,
						login: actor.login,
						gravatar_id: actor.gravatar_id,
						url: actor.url,
						avatar_url: actor.avatar_url
					};
					console.log("Dumping Actor data");
					return new Actor(act).save();
				}

			})
			.then(function(Actor) {
				return callback();
			})
			.catch(function(error) {
				console.log(error);
				return callback(error);
			})
	}

	saveRepository(event,callback) {
		let repository = event.repo;
		Repository.findOne({
				repoId: repository.id
			}).exec()
			.then(function(existingRepository) {
				if (existingRepository)
					return existingRepository;
				else {
					let newRepository = {
						repoId: repository.id,
						name: repository.name,
						url: repository.url
					};
					return new Repository(newRepository).save();
				}
			})
			.then(function(savedRepository) {
				console.log("Saving Repository");
				callback()
			})
			.catch(function(error) {
				console.log(error);
				callback(null)
			})
	}

	saveEvent(event,callback) {
		Event.findOne({
				eventId: event.id
			}).lean().exec()
			.then(function(existingEvent) {
				if (existingEvent)
					return existingEvent;
				else {
					let newEvent = {
						eventId: event.id,
						type: event.type,
						actor: event.actor.id,
						repoId: event.repo.id,
						eventDate: event.created_at,
						public: event.public,
						payload: event.payload
					};
					return new Event(newEvent).save();
				}
			})
			.then(function(repo) {
				console.log("saving events");
				callback(null)
			})
			.catch(function(error) {
				console.log(error);
				callback(null)
			})
	}
}

module.exports = {
	dumpEventsInDatabase: function(endPoint) {
		const event = new Events({
			uri: endPoint,
			encoding: null,
		});
		return new Promise((resolve, reject) => {
			event.getEvents()
				.then((result) => {
					return event.decodeEvents(result);
				})
				.then((result) => {
					//console.log(result[0])
					return event.storeEventsInDatabase(result);
				})
				.then((result) => {
					resolve(result)
				})
				.catch((error) => {
					reject(error)
				})
		})
	}
};