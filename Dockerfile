FROM python:3

WORKDIR /drf

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8000

ENTRYPOINT [ "./entry_point.sh" ]