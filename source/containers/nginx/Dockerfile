FROM alpine:3.19

RUN apk update && apk add --no-cache \
    nginx \
    && rm -rf /var/lib/apt/lists

# this folders are used to store static and media files - they are mounted from the host(that are mounted to the neon_app services' directory - see docker-compose).
RUN mkdir -p /media_static/static /media_static/media

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]