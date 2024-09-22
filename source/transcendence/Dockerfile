# FROM python:3.12

# WORKDIR /app



# # Installing app dependencies
# COPY requirements.txt /app/
# RUN pip install --upgrade pip && pip install -r requirements.txt


# EXPOSE 8000

# ENTRYPOINT [ "./entry_point.sh" ]

FROM python:3.12

WORKDIR /app

# # Installing system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists

COPY requirements.txt .
COPY entry_point.sh .


RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

EXPOSE 8000

# Creating and Runing as non-root user
RUN useradd -m transcendance_user
USER transcendance_user

ENTRYPOINT [ "./entry_point.sh" ]