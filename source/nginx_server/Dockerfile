FROM nginx:1.14.0

RUN apt-get update && apt-get install -y git curl wget unzip zip \
bison build-essential ca-certificates curl dh-autoreconf doxygen flex gawk \
iputils-ping libcurl4-gnutls-dev libexpat1-dev libgeoip-dev liblmdb-dev \
libpcre3-dev libpcre++-dev libssl-dev libtool libxml2 libxml2-dev libyajl-dev \
locales lua5.3-dev pkg-config wget zlib1g-dev zlibc libxslt libgd-dev libgeoip-dev libperl-dev
RUN rm -rf /var/lib/apt/lists/*
