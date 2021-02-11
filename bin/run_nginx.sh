#!/bin/bash

nginx -c nginx-dev.conf -p $PWD -e stderr
