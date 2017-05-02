const Actor = require('../model/actor');
const Repository = require('../model/repository');
const Event = require('../model/event');
const _ = require('lodash');
module.exports = {
	
	getRepositoryByIdAndEventType: function(id, event) {
		return new Promise(function(resolve, reject) {
			Event.find({
					eventId: id,
					type: event
				})
				.exec()
				.then(function(result) {
					resolve(result);
				})
				.catch(function(err) {
					reject(err);
				})
		});
	},

	getHighestEventsByActor: function(login) {
		const self = this;
		return new Promise(function(resolve, reject) {
			Actor.getActorByLogin(login)
				.then(function(actor) {
					return Event.aggregate(
						[{
							$match: {
								"actor": actor.actorId
							}
						}, {
							$lookup: {
								from: "repos",
								localField: "repoId",
								foreignField: "repoId",
								as: "Repostory"
							}
						}, {
							$lookup: {
								from: "actors",
								localField: "actor",
								foreignField: "actorId",
								as: "Actor"
							}
						}, {
							$group: {
								_id: {
									"Repo": "$Repostory",
									"Actor": "$Actor"
								},
								count: {
									$sum: 1
								},
								eventDates: {
									$push: "$eventDate"
								}

							}

						}, {
							$project: {
								"_id.Repo": 1,
								"Actor": {
									$slice: ["$_id.Actor", 1]
								},
								"count": 1,
								"latestDate": {
									$slice: ["$eventDates", -1]
								}
							}
						}, {
							$sort: {
								count: -1,
								"latestDate.0": -1
							}
						}]
					).exec();

				})
				.then(function(repos) {
					const result = {
						actorId: repos[0].Actor[0].actorId,
						login: repos[0].Actor[0].login,
						gravatar_id: repos[0].Actor[0].gravatar_id,
						url: repos[0].Actor[0].url,
						avatar_url: repos[0].Actor[0].avatar_url,
						repostory: repos[0]._id.Repo[0],
						totalNumberOfActions: repos[0].count,
						latestDate: repos[0].latestDate[0],

					}
					resolve(result);
				})
				.catch(function(err) {
					reject(err);
				})
		});
	},

	getActorAndHisRepositories: function(login) {
		const self = this;
		let actor;
		return new Promise(function(resolve, reject) {
			Actor.getActorByLogin(login)
				.then(function(actor) {
					return Event.aggregate(
						[{
								$match: {
									"actor": actor.actorId
								}
							}, {
								$lookup: {
									from: "repositories",
									localField: "repoId",
									foreignField: "repoId",
									as: "Repository"
								}
							}, {
								$lookup: {
									from: "actors",
									localField: "actor",
									foreignField: "actorId",
									as: "Actor"
								}
							},

							{
								$group: {
									_id: {
										"Actor": "$actor"
									},
									Repository: {
										$push: "$Repository"
									},
									Actor: {
										$push: "$Actor"
									}

								}
							}, {
								$project: {
									"Repository": 1,
									"Actor": {
										$slice: ["$Actor", 1]
									},
									_id: 0
								}
							}
						]
					).exec()
				})
				.then(function(actorRepos) {
					if(!actorRepos.length){
						const result = {
							repositories: "no repositories found"
						}
						resolve(result);	
					}else{
						let repos = _.flatten(actorRepos[0].Repository)
						let actor = _.flatten(actorRepos[0].Actor)
						let uniqRepo = _.uniqBy(repos, function(o) {
							return o.repoId;
						});
						const result = {
							actor: actor[0],
							repositories: uniqRepo
						}
						resolve(result);	
					}
				})
				.catch(function(err) {
					reject(err);
				})
		});

	},

	getAllRepoWithTopContributor: function(skip, limit) {
		var self = this;
		return new Promise(function(resolve, reject) {
			Event.aggregate(
					[{
							$skip: skip
						}, {
							$limit: limit
						}, {
							$lookup: {
								from: "repositories",
								localField: "repoId",
								foreignField: "repoId",
								as: "Repostory"
							}
						}, {
							$lookup: {
								from: "actors",
								localField: "actor",
								foreignField: "actorId",
								as: "Actor"
							}
						}, {
							$group: {
								_id: {
									"Repo": "$Repostory",
									"topContributor": "$Actor"
								},
								totalContributions: {
									$sum: 1
								},
								eventDates: {
									$push: "$eventDate"
								}

							}

						},

						{
							$project: {
								"_id.Repo": 1,
								"topContributor": {
									$slice: ["$_id.topContributor", 1]
								},
								"totalContributions": 1,
								"latestDate": {
									$slice: ["$eventDates", -1]
								}
							}
						}, {
							$sort: {
								count: -1,
								"latestDate.0": -1
							}
						}
					]
				).exec()
				.then(function(repositories) {
					let result = [];
					_.forOwn(repositories, function(value, key) {
						let repo = {};
						repo.Repository = value._id.Repo[0];
						repo.topContributor = value.topContributor[0];
						repo.totalContributions = value.totalContributions;
						repo.latestEventDate = value.latestDate[0]
						result.push(repo);
					})
					resolve(result);
				})
				.catch(function(err) {
					console.log(err);
					reject(err);
				})
		});
	}

}