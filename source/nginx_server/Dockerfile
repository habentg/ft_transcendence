FROM alpine:3.19

RUN apk update && apk add --no-cache \
    nginx \
    && rm -rf /var/lib/apt/lists

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]