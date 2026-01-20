from pymongo import MongoClient
import os 

mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
config = {
    "host": mongo_uri,
    "port": 27017,
    "username": os.getenv("MONGO_USERNAME", ""),
    "password": os.getenv("MONGO_PASSWORD", ""),  
}

class Connection:
    def __new__(cls,database):
        connection = MongoClient(**config)
        return connection[database]
    
    
