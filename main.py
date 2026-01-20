from dotenv import load_dotenv
load_dotenv()

from flask import request
from flask import Flask, jsonify
from db import Connection
from bson.objectid import ObjectId

# Connect to the MongoDB database using the Connection class from db.py
db = Connection("DB1")  # Replace 'meig' with your actual database name if different
collection = db["private_posts"]  # Use your desired collection name
app = Flask(__name__)

@app.route("/entry/private", methods=['POST'])
def home():
    if request.method == "POST":
        data = request.get_json()
        heading = data.get("Heading")
        text = data.get("Text")
        view = data.get("viewing")  # Use 'viewing' to match the Express payload

        if not heading or not text:
            return jsonify({"error": "Heading and Text are required."}), 400

        # Insert into MongoDB
        post = {
            "heading": heading,
            "text": text,
            "view": view,
            "createdAt": request.headers.get('Date') or None  # Optionally add timestamp
        }
        result = collection.insert_one(post)
        return jsonify({"message": "Private Entry saved", "id": str(result.inserted_id)})
    return "Private Entry Endpoint (use POST)"

# GET all private posts
@app.route("/entry/private/all", methods=["GET"])
def get_all_private():
    try:
        posts = list(collection.find({}, {"_id": 1, "heading": 1}))
        formatted_posts = [{"id": str(post["_id"]), "heading": post["heading"]} for post in posts]
        return jsonify(formatted_posts)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# GET a specific private post by ID
@app.route("/entry/private/<post_id>", methods=["GET"])
def get_private_post(post_id):
    try:
        post = collection.find_one({"_id": ObjectId(post_id)})
        if not post:
            return jsonify({"error": "Post not found"}), 404
        return jsonify({
            "id": str(post["_id"]),
            "heading": post["heading"],
            "text": post["text"],
            "view": post.get("view")
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# PUT update a private post
@app.route("/entry/private/<post_id>", methods=["PUT"])
def update_private_post(post_id):
    try:
        data = request.get_json()
        heading = data.get("Heading")
        text = data.get("Text")
        
        if not heading or not text:
            return jsonify({"error": "Heading and Text are required."}), 400
        
        result = collection.update_one(
            {"_id": ObjectId(post_id)},
            {"$set": {"heading": heading, "text": text}}
        )
        
        if result.matched_count == 0:
            return jsonify({"error": "Post not found"}), 404
        
        return jsonify({"message": "Private Entry updated", "id": post_id})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)