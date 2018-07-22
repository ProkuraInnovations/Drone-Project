# Website based Drone Monitoring system
Drone status is emitted from the companion computer in the UAV to the [server](https://www.heroku.com) and the status is emitted to the website for display. Also the server is connected with the android app for takeoff and for showing the status of the drone. [Website](https://www.nicwebpage.herokuapp.com)

#Getting Started
To run the program in locally download the file and run
		
		npm install 
		
to install the packages used for the project. Then run the server using node version 9.6.1
		
		node server/server.js 
		
from root directory. Then you can view the website in browser in the [link](http://localhost:3000).
Before running the program you should start the mongodb server for storing the data in the database

		$ sudo service mongod start
		
		
Download the file and run 

		npm install
		
to install the modules/dependencies of the node

This is the project related to the drone monitoring system.
The following repository consists of both [client](public) and [server](server/server.js) side.


### Server Side
Server side uses nodejs as the core program. It uses [express](http://expressjs.com/) to handle the webrequest's and [socket.io](https://socket.io/) to handle the websockets between the companion computer and android app.

Different socket rooms are created so that the required data is given to the specific devices as.
For companioin computer - joinPi 
For website - joinWebsite
For andorid - joinAndroid

 Database used for storing the data is NoSQL database - mongodb.