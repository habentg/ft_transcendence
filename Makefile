
COMPOSE 		= docker compose


# ----------------------- creating services --------------------------
all: build up

up:
	$(COMPOSE) -f docker-compose.yaml up -d

build:
	$(COMPOSE) -f docker-compose.yaml build

down:
	$(COMPOSE) -f docker-compose.yaml down

re: down up # rebuilding the services without deleting the persistent storages


# ----------------------- restarting services --------------------------

start:
	$(COMPOSE) -f docker-compose.yaml start

stop:
	$(COMPOSE) -f docker-compose.yaml stop

restart: stop start # restarting the services (volumes, network, and images stay the same)


# ----------------------- Deleting resources and rebuilding --------------------------

fclean: down
	@yes | docker system prune --all
	@docker volume ls -q | grep -q . && docker volume rm $$(docker volume ls -q) || true

rebuild: fclean all 

# ----------------------- Managing app service only --------------------------

app-down:
	$(COMPOSE) -f docker-compose.yaml stop app
	$(COMPOSE) -f docker-compose.yaml rm -f app

app-up:
	$(COMPOSE) -f docker-compose.yaml up --build -d --no-deps app

app-rebuild: app-down app-up

app-restart:
	$(COMPOSE) -f docker-compose.yaml restart app

# ---------------------------- git push target -------------------------------

push:
	@if [ -z "$(msg)" ]; then \
		echo "Please provide a commit message."; \
		echo "Usage: make push msg=\"<commit_message>\""; \
		exit 1; \
	fi
	git add .
	git status
	git commit -m "$(msg)"
	git push


# ---------------------------- PHONY PHONY ... -------------------------------
.PHONY: up down fclean re restart rebuild

