#!/usr/bin/env make

.PHONY: start default notebook attach-console chmod gpu-monitor search-notebook

default: start

# ---------------------------------------------------------------------------------------------------------------------
# DEVELOPMENT
# ---------------------------------------------------------------------------------------------------------------------

# Will start in docker develoment environment
notebook:
	docker-compose run --service-ports model-notebook

# Will start docker development environment for search lambda
search:
	docker-compose run --service-ports search

search-console:
	docker-compose run --service-ports search bash

answer:
	docker-compose run --service-ports answer

answer-console:
	docker-compose run --service-ports answer bash

attach-console:
	docker exec -it asqa_model-notebook_1 bash

attach-search-console:
	docker exec -it asqa_search_dev bash

attach-answer-console:
	docker exec -it asqa_answer_dev bash

platform-gateway:
	docker-compose up platform-gateway

core:
	docker-compose up core

core-console:
	docker-compose run --service-ports core bash

attach-core-console:
	docker exec -it asqa_core_run_9655390d68b8 bash

telegram:
	docker-compose up telegram_integration

telegram-console:
	docker-compose run --service-ports telegram_integration bash

chmod:
	chmod -R 777 .

# ---------------------------------------------------------------------------------------------------------------------
# DOCKER
# ---------------------------------------------------------------------------------------------------------------------

start:
	docker-compose up --build


# ---------------------------------------------------------------------------------------------------------------------
# BUILD
# ---------------------------------------------------------------------------------------------------------------------

# read .env $ set -o allexport; source .env; set +o allexport

export AWS_REGION = 'eu-central-1'
export AWS_ACCOUNT_ID = '449682673987'

export SEARCH_VERSION = 0.1.1
export ANSWER_VERSION = 0.1.0
export CORE_VERSION = 0.1.1
export TELEGRAM_INTEGRATION_VERSION = 0.1.0

login-aws:
	aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
# after login run cat ~/.docker/config.json to see credentials

add-aws-ecr-to-k8s:
	kubectl create secret generic regcred \
		--from-file=.dockerconfigjson=/home/leovs09/.docker/config.json \
		--type=kubernetes.io/dockerconfigjson

build-search:
	docker build -t asqa-search:${SEARCH_VERSION} ./search

deploy-search:
	docker tag asqa-search:${SEARCH_VERSION} ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/asqa-search:${SEARCH_VERSION}
	docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/asqa-search:${SEARCH_VERSION}

build-answer:
	docker build -t asqa-answer:${ANSWER_VERSION} ./answer

deploy-answer:
	docker tag asqa-answer:${ANSWER_VERSION} ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/asqa-answer:${ANSWER_VERSION}
	docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/asqa-answer:${ANSWER_VERSION}

build-core:
	docker build -t asqa-core:${CORE_VERSION} ./core

deploy-core:
	docker tag asqa-core:${CORE_VERSION} ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/asqa-core:${CORE_VERSION}
	docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/asqa-core:${CORE_VERSION}

build-telegram:
	docker build -t asqa-telegram:${TELEGRAM_INTEGRATION_VERSION} ./integrations/telegram

deploy-telegram:
	docker tag asqa-telegram:${TELEGRAM_INTEGRATION_VERSION} ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/asqa-telegram:${TELEGRAM_INTEGRATION_VERSION}
	docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/asqa-telegram:${TELEGRAM_INTEGRATION_VERSION}

# TODO: use argo-cd for automatically setup kafka
setup-kafka-for-k8s:
	kubectl apply -f ./manifests/kafka.yaml

# ---------------------------------------------------------------------------------------------------------------------
# GPU
# ---------------------------------------------------------------------------------------------------------------------

gpu-monitor:
	watch -n 0.5 nvidia-smi