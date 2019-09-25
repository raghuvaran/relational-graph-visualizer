#!/bin/bash

./cockroach sql --host=cockroachdb --insecure --database=defaultdb < /db.dump.sql