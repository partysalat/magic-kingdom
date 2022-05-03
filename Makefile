# BRACcounting Backend
start_infra:
	docker-compose -f docker/docker-compose-infra.yaml up -d
stop_infra:
	docker-compose -f docker/docker-compose-infra.yaml stop
	docker-compose -f docker/docker-compose-infra.yaml rm

restart_infra: stop_infra start_infra

start_local:
	go run .

build_docker_arm:
	docker buildx build --platform linux/arm64 --progress=plain  -t bra:5000/magic-kingdom-accounting:latest -m 4g .
build:
	docker build --progress=plain -t magic-kingdom-accounting .
build_frontend:
	cd frontend; npm run build
start: build
	docker-compose -f docker/docker-compose-all.yaml up -d

push:
	docker push bra:5000/magic-kingdom-accounting
	node ./magicmirror/deploy/deployDocker.mjs

deploy:build_frontend build_docker_arm push


# Magic Mirror

push_mm_config:
	./magicmirror/deploy/upload.sh
	cp -R ./frontend/build/static ../magic-mirror/MagicMirror/modules/braccountingfeed
	cp -R ./magicmirror/braccounting/build/* ../magic-mirror/MagicMirror/modules
	cp -R ./magicmirror/magic-mirror-core/config.js ../magic-mirror/MagicMirror/config

# button
build_docker_arm_button:
	docker buildx build --platform linux/arm64 --progress=plain  -t bra:5000/magic-kingdom-button:latest -m 4g ./button
push_button:build_docker_arm_button
	docker push bra:5000/magic-kingdom-button
	node ./magicmirror/deploy/deployDocker.mjs
