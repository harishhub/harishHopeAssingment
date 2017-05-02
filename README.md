HopeResearch Assingment

    The Assingment that i have wrote downloads the data from the medntioned URL 'http://data.githubarchive.org/2015-01-01-15.json.gz';

Stack requirements
	
	Node
	Express
	Mongo

Setup instructions:

	Clone this Repo
	Run npm install 
	Run npm start or type node bin/www from the root folder
	The server runs on PORT 3000


API server endpoints

	1> localhost:3000/dumpData
			This route imports the data from URL:  'http://data.githubarchive.org/2015-01-01-15.json.gz' 
			This will take time.

API for data Operations accoirding to tasks:

	1> localhost:3000/events/{type}/{id}
		
		Return records filtered by the repository id and event type.

	2> localhost:3000/actor/{login}

		Return actor details and list of contributed repositories by actor login.

	3> localhost:3000/highest/{login}

		Find the repository with the highest number of events
		from an actor (by login). If multiple repos have the same
		number of events, return the one with the latest event. 		

  4> localhost:3000/repository/all

  	Return list of all repositories with their top contributor (actor with most events).
  	pass limit and skip in the query 
  	
  	localhost:3000/repository/all?limit=200&skip=0

  5> localhost:3000/{login} 
  		
  		THIS IS DELETE REQUEST
  		Delete the history of actor’s events by login.





	THERE MIGHT BE FEW ERRORS SINCE I HAVENT INCLUCDED ANT TEMPLATE FOR RENDRING THE DEFAULTS PAGE FOR EXPRESS PLEASE IGNORE THOSE ERROS I AM ONLY FOCUSSING ON APIS



