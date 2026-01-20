from pymongo import MongoClient
import os

mongo_uri = os.getenv("MONGODB_URI")

if not mongo_uri:
    raise ValueError("MONGODB_URI environment variable is not set. Please set it before running the app.")

class Connection:
    def __new__(cls, database):
        connection = MongoClient(mongo_uri)
        return connection[database]