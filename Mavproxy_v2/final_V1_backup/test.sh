#!/bin/bash
sleep 3s
/usr/bin/screen -S mav -d -m python /usr/local/bin/mavproxy_v2.py --out=udp:202.52.1.49:8081 --out 10.42.0.1:14550 --out 127.0.0.1:14551

