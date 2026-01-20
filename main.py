from flask import request
from flask import Flask, jsonify
from db import Connection

# Connect to the MongoDB database using the Connection class from db.py
db = Connection("DB1")  # Replace 'meig' with your actual database name if different
collection = db["private_posts"]  # Use your desired collection name


@app.route("/entry/private", methods=["GET",'POST'])
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


if __name__ == "__main__":
    app.run(host="0.0.0.0",debug=True)