#!/bin/bash
# Stick this in a crontab to run once a day and mail yourself your unindexed queries.
# when you don't get an email - you don't have any unindexed queries.

# Until then see if you can identify why your queries are unindexed. It could be unavoidable

datestring=`date -d '1 day ago' +"%a %b %e"`
logfile="/var/log/mongodb.log"
grep nscanned $logfile | grep -v "nscanned:1 " | grep -v "nscanned:0 " | grep "$datestring"
