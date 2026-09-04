from loguru import logger
import sys

logger.remove()
logger.add(sys.stdout, format="{time} | {level} | {message}", level="INFO", serialize=True)
logger.add("logs/app.log", rotation="10 MB", retention="30 days", level="INFO")