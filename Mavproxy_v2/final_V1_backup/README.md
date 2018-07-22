### README

The final mavproxy_v2.py contains code to send drone data to mission planner, establishing socket connection with the server to send data to the drone monitoring website and also listen to mission download and initiate flight to start the mission.

The program is executed on bootup. On running mavproxy.py and dronekit program at startup, the socket connection was always established but data was not sent. This problem was solved by integrating all the codes into mavproxy_v2.py such that only one program had to be run, and the result obtained gave 100% efficiency. It was able to establish connection as well as send data every time.

#### Run program at bootup
* In order to run the program at boot up a service had to be setup in /etc/systemd (test.service).

		[Unit]	
		Description = My service
		After=network.target

		[Service]
		Type=forking
		Restart=on-failure
		RestartSec=3
		ExecStart = /home/pi/startup/test.sh

		[Install]
		WantedBy=multi-user.target
	
* The test.sh as directed to ExecStart contains:
	
		#!/bin/bash
		sleep 3s
		/usr/bin/screen -S mav -d -m python /usr/local/bin/mavproxy_v2.py --out=udp:202.52.1.49:8081 --out 10.42.0.1:14550 --out 127.0.0.1:14551

* NOTE: without screen mavproxy does not run. Apparently, it needs a screen to run it on foreground as it does not seem to run in background.

* After performing the above steps, the service should be enabled and run :

		sudo systemctl enable [service name--test] //starts service at bootup 
		sudo systemctl run [service name]
		sudo systemctl daemon-reload
		sudo systemctl status service_name.service //check status of service
