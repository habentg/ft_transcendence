#!/bin/sh

SECRETS_DIR=./secrets

mkdir -p ${SECRETS_DIR}

# cat "${SECRETS_DIR}/intro.txt"

openssl req -x509 -nodes -days 365 \
  -newkey rsa:2048 \
  -keyout ${SECRETS_DIR}/transcendence_pk.pem \
  -out ${SECRETS_DIR}/transcendence_cert.crt \
  -subj "/C=AE/ST=AD/L=Abu Dhabi/O=42AD/CN=localhost"


