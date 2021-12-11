start_infra:
	docker-compose -f docker/docker-compose-infra.yaml up -d
stop_infra:
	docker-compose -f docker/docker-compose-infra.yaml stop
	docker-compose -f docker/docker-compose-infra.yaml rm

restart_infra: stop_infra start_infra


build_docker_arm:
	docker buildx build --platform linux/arm64 --progress=plain  -t farnsworth:5000/magic-kingdom-accounting:latest -m 4g .
build:
	docker build --progress=plain -t magic-kingdom-accounting .
build_frontend:
	cd frontend; npm run build
start: build
	docker-compose -f docker/docker-compose-all.yaml up -d

push:
	docker push farnsworth:5000/magic-kingdom-accounting
	node ./magicmirror/deploy/deployDocker.mjs

deploy:build_frontend build_docker_arm push