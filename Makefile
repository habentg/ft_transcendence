
COMPOSE 		= cd ./source && docker-compose


# ----------------------- creating services --------------------------
all: build up

up:
	$(COMPOSE) -f docker-compose.yaml up -d --remove-orphans

create_users:
	$(COMPOSE) -f docker-compose.yaml exec app sh create_alot_of_users_for_testing.sh

build:
	$(COMPOSE) -f docker-compose.yaml build

down:
	$(COMPOSE) -f docker-compose.yaml down

re: down up # rebuilding the services without deleting the persistent storages

# ---------------------------- django related Operattions -------------------------------

collectstatic:
	$(COMPOSE) -f docker-compose.yaml exec app python manage.py collectstatic --noinput

migrate:
	$(COMPOSE) -f docker-compose.yaml exec app python manage.py makemigrations
	$(COMPOSE) -f docker-compose.yaml exec app python manage.py migrate


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
# @docker image rm app_image

app-up:
	$(COMPOSE) -f docker-compose.yaml up --build -d --no-deps app

app-rebuild: app-down app-up

app-restart:
	$(COMPOSE) -f docker-compose.yaml restart app

app-down:

nginx-rebuild:
	$(COMPOSE) -f docker-compose.yaml stop nginx
	$(COMPOSE) -f docker-compose.yaml rm -f nginx
	$(COMPOSE) -f docker-compose.yaml up --build -d --no-deps nginx

app-nginx-rebuild: app-rebuild nginx-rebuild


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

db:
	docker exec -it postgresql psql -U ${POSTGRES_USER} -d ${POSTGRES_DB}

# ---------------------------- Help target -------------------------------
help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  all:          Build and start the services"
	@echo "  up:           Start the services"
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
