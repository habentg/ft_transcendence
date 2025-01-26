
COMPOSE 		= cd ./source && docker-compose
COMPOSE_FILE 	= docker-compose.yaml

# ----------------------- creating services --------------------------
all: build up

keygen:
	@sh ./source/containers/nginx/tools/self_signed_keygen.sh
	@python3 ./source/containers/nginx/tools/get_host_ip.py

up: keygen
	$(COMPOSE) -f $(COMPOSE_FILE) up -d --remove-orphans

create_users:
	$(COMPOSE) -f $(COMPOSE_FILE) exec neon_pong sh create_alot_of_users_for_testing.sh

build:
	$(COMPOSE) -f $(COMPOSE_FILE) build

down:
	$(COMPOSE) -f $(COMPOSE_FILE) down

re: down up # rebuilding the services without deleting the persistent storages

# ---------------------------- django related Operattions -------------------------------

collectstatic:
	$(COMPOSE) -f $(COMPOSE_FILE) exec neon_pong python manage.py collectstatic --noinput

migrate:
	$(COMPOSE) -f $(COMPOSE_FILE) exec neon_pong python manage.py makemigrations
	$(COMPOSE) -f $(COMPOSE_FILE) exec neon_pong python manage.py migrate


# ----------------------- restarting services --------------------------

start:
	$(COMPOSE) -f $(COMPOSE_FILE) start

stop:
	$(COMPOSE) -f $(COMPOSE_FILE) stop

restart: stop start # restarting the services (volumes, network, and images stay the same)


# ----------------------- Deleting resources and rebuilding --------------------------
clean: down
	@rm -rf ./secrets
	@yes | docker container prune
	@yes | docker network prune
	@yes | docker images -q | grep -v $$(docker images redis:6-alpine -q) | grep -v $$(docker images postgres:15-alpine -q) | xargs docker rmi -f || true
	@yes | docker volume ls -q | grep -q . && docker volume rm $$(docker volume ls -q) || true 

fclean: down
	@rm -rf ./secrets
	@yes | docker system prune --all
	@docker volume ls -q | grep -q . && docker volume rm $$(docker volume ls -q) || true 

rebuild: clean all

# ---------------------------- PHONY PHONY ... -------------------------------
.PHONY: up down fclean re restart rebuild

# ---------------------------- Help target -------------------------------
help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  all:          Build and start the services"
	@echo "  up:           Start the services"
	@echo "  keygen:       Generate self-signed SSL certificate"
	@echo "  build:        Build the services"
	@echo "  down:         Stop the services"
	@echo "  start:        Start the services"
	@echo "  stop:         Stop the services"
	@echo "  restart:      Restart the services"
	@echo "  fclean:       Stop the services, delete all the containers, networks, and volumes"
	@echo "  rebuild:      Delete all the containers, networks, and volumes, then rebuild the services"
	@echo "  push:         Add, commit, and push the changes to the remote repository"
	@echo "  help:         Display this help message"
	@echo ""
	@echo "Variables:"
	@echo "  msg:          Commit message for the push target"
	@echo ""
	@echo "Examples:"
	@echo "  make all"
	@echo "  make push msg=\"Add a new feature\""
	@echo ""


# ---------------------------- End of Makefile -------------------------------
