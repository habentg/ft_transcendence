Flow of a Request:
User Request: A user sends a request to the server (e.g., opening a page on your Django app).
Nginx: Nginx receives the request, and if it's a request for static files (like images or CSS), it serves them directly. If it's a dynamic request (e.g., a Django view), it forwards it to the WSGI server.
WSGI Server: The WSGI server (Gunicorn or uWSGI) receives the request from Nginx and translates it into a WSGI-compatible format, then forwards it to Django.
Django: Django processes the request, performs any necessary logic (e.g., querying the database, rendering a template), and generates an HTTP response.
WSGI Server: The WSGI server receives the response from Django and forwards it back to Nginx.
Nginx: Nginx sends the response back to the user.


[ User ] ---> [ Nginx ] ---> [ WSGI Server (Gunicorn/uWSGI) ] ---> [ Django ]
                ↑                                                 ↓
      (serves static files)                         (processes request and returns response)
