from __future__ import print_function
import math



def readmission(aFileName):
    """
    Load a mission from a file into a list. The mission definition is in the Waypoint file
    format (http://qgroundcontrol.org/mavlink/waypoint_protocol#waypoint_file_format).

    This function is used by upload_mission().
    """
    print("\nReading mission from file: %s" % aFileName)
    missionlist=[]
    waypoint ={}
    inc=0
    with open(aFileName) as f:
        for i, line in enumerate(f):
            if i==0:
                if not line.startswith('QGC WPL 110'):
                    raise Exception('File is not supported WP version')
            else:
                linearray=line.split('\t')
                ln_index=int(linearray[0])
                ln_currentwp=int(linearray[1])
                ln_frame=int(linearray[2])
                ln_command=int(linearray[3])

                ln_lat=float(linearray[8])
                ln_lng=float(linearray[9])
                ln_alt=float(linearray[10])
                if ln_command!=22:
                    waypoint[inc]= {
                    'lat': ln_lat,
                    'lng': ln_lng,
                    'alt': ln_alt,
                    'command': ln_command
                    }
                    inc=inc+1

    return waypoint
