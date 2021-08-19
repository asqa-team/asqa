from fastapi import FastAPI
from config import settings
import logging


if settings['DEBUG_LOG']:
    logging.basicConfig(level=logging.DEBUG)
else:
    logging.basicConfig(level=logging.INFO)

from .api import router, graphql_router

logging.info(f'App version: {settings["APP_VERSION"]}')

app = FastAPI(port=settings['SERVER_PORT'])
logging.info(f'Run server at port {settings["SERVER_PORT"]}')

app.include_router(router)
app.include_router(graphql_router)
