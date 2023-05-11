#!/bin/bash
echo "Starting replica set initialize"
until mongosh --host mongo-config-01 --eval "print(\"waited for connection\")"
do
    sleep 20
done
echo "Connection finished"
echo "Creating replica set"
mongosh --host mongo-config-01 <<EOF
rs.initiate({
  _id: "rs-config-server",
  configsvr: true,
  version: 1,
  members: [
    { _id: 0, host: "configsvr01:27017" },
    { _id: 1, host: "configsvr02:27017" },
    { _id: 2, host: "configsvr03:27017" },
  ],
})
EOF

