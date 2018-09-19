#!/bin/bash
SRC="./dist/"
DEST="awalmsley@192.168.102.250:/usr/share/nginx/www/quality-web"
if [ $# -eq 0 ]
  then
    echo "Incorrect parameters";
elif[ $1 == "goats" ]
  then
    if [[-z $2]]
      then
        echo "Dry-run"
        rsync --dry-run -rz --force --delete --progress -e "ssh -p22" $SRC $DEST
    elif[ $2 == "now" ]
      then
        echo "Deploying the goats"
        rsync -rz --force --delete --progress -e "ssh -p22" $SRC $DEST
    else
      echo "Goats can't do that";
    fi
fi