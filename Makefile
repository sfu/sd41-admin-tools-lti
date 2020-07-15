NAME   := simonfraseruniversity/sd41-admin-tools-lti
TAG    := $(shell /bin/date "+%s")
IMG    := ${NAME}\:${TAG}
LATEST := ${NAME}\:latest

build:
	rm -rf dist/*
	@docker build -f Dockerfile.production -t ${IMG} .
	@docker tag ${IMG} ${LATEST}

push:
	@docker push ${NAME}

login:
	@docker log -u ${DOCKER_USER} -p ${DOCKER_PASS}