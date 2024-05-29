from flask import request, jsonify,render_template, send_from_directory
from application import app
from application.processing import text2video, name_dir
from application.prediction import predict
import os

errorpath = "/static/database/error.mp4"

@app.route("/", methods=['GET','POST'])
def home_page():
    return render_template("index.html")


@app.route('/process_data', methods=['POST'])
def process_data():
    result={}
    try:
        data = request.get_json()
        print(data["question"])
        if data["question"]=="":
            raise Exception("This is a forced exception")
        text2video(data["question"],name_dir)
        print(data["question"])
        filepath="/static/database/output/converted_output123.mp4"
        result["message"]=200
        result["filepath"]=filepath
    except:
        result["filepath"]=errorpath
        result["message"]=400
    return jsonify(result)

@app.route('/static/<path:filename>')
def serve_static(filename):
    root_dir = os.path.dirname(os.getcwd())
    return send_from_directory(os.path.join(root_dir, 'static'), filename)

@app.route('/predict', methods=['POST'])
def predict_route():
    try:
        data = request.json  # Get JSON data from the request
        action = predict(data)  # Call the predict function with the data
        return jsonify({'action': action})
    except Exception as e:
        return jsonify({'error': str(e)}), 500