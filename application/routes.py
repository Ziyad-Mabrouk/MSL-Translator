from flask import request, jsonify,render_template, send_from_directory
from application import app
from application.processing import text2video, name_dir
import os

errorpath = "/static/database/error.mp4"

@app.route("/Question_Answering_AR", methods=['GET','POST'])
def home_page_ar():
    return render_template("indexar.html")

@app.route("/", methods=['GET','POST'])
@app.route("/Question_Answering_EN", methods=['GET','POST'])
def home_page_en():
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
