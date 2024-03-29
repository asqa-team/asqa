#!/usr/bin/env make

.PHONY: default checkout notebook install save-dependencies chmod

# ---------------------------------------------------------------------------------------------------------------------
# DEVELOPMENT
# ---------------------------------------------------------------------------------------------------------------------

# Will reproduce all stages to generate model based on changes
default:
	dvc repro && dvc push

# Will load data and models which specifaed by dvc files
checkout:
	dvc pull

# Will start notebook environment on http://0.0.0.0:8890
notebook: 
	jupyter notebook --ip=0.0.0.0 --NotebookApp.allow_origin='https://colab.research.google.com' --allow-root --port=8890 --NotebookApp.port_retries=0

install:
	pip install -r requirements.txt

# Will save all current dependencies to requirements.txt
save-dependencies:
	pip freeze > requirements.txt
	pip freeze | sed 's/==.*//g' > requirements-unfized.txt


# docs folder required for github pages
notebook-to-html:
	jupyter nbconvert ./*.ipynb --to html --output-dir="./docs"

notebook-to-python:
	jupyter nbconvert ./*.ipynb --to python --output-dir="./results"

notebook-artifacts: notebook-to-html notebook-to-python chmod

# ---------------------------------------------------------------------------------------------------------------------
# DOCKER
# ---------------------------------------------------------------------------------------------------------------------

CURRENT_UID := $(shell id -u)
CURRENT_GID := $(shell id -g)


chmod:
	chmod -R 777 .

# ---------------------------------------------------------------------------------------------------------------------
# GPU
# ---------------------------------------------------------------------------------------------------------------------

gpu-monitor:
	watch -n 0.5 nvidia-smi