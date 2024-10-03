# base image
FROM python:3.12-alpine

WORKDIR /app

# Installing system dependencies
RUN apk update && apk add --no-cache \
    shadow \ 
    curl \
    && rm -rf /var/lib/apt/lists

COPY requirements.txt .
COPY entry_point.sh .

RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

EXPOSE 8000

# Creating and Runing as non-root user
RUN useradd -m transcendance_user
USER transcendance_user

ENTRYPOINT [ "./entry_point.sh" ]