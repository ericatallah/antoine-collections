#!/usr/bin/bash
while true ; do
  npm start 2>&1 | tee -a ./collections-app.log
  sleep 10
done

