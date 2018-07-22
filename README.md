# Drone-Project

----

----

This project can be divided into three parts considering the three components namely drone, central server and the ground control station.
The DroneFly directory holds all the codes for the android app to be deployed in the ground control station. The Mavproxy_v2 holds the code to be run on the drone and webpage directory contains the code for the webpage to be run on the server to view the status of the drone. All three components are linked via socket connection. The server is the central hub for communication as both work ground control station and drone communicate with each other via the server.
