const Event = require('../model/event');
const Actor = require('../model/actor');


module.exports ={
	deleteHistoryByLoginName: function(login) {
		return new Promise(function(resolve, reject) {
			Actor.getActorByLogin(login)
				.then(function(actor) {
					console.log(actor)
					return Event.remove({
						actor: actor.actorId
					}).lean().exec();
				})
				.then(function(result) {
					resolve(result);
				})
				.catch(function(err) {
					reject(err);
				})
		});
	}
}