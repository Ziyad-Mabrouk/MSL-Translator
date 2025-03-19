## Moroccan Sign Language Translator

Python application for translating Moroccan sign language to Arabic text and vice-versa using a trained ML model (.h5).

<img width="960" alt="image" src="https://github.com/Ziyad-Mabrouk/MSL-Translator/assets/125457402/4ea0744d-8a83-4cc7-952b-1148d37c0902">

##Test

To test our application, you can pull our Docker image by executing this command:
  ```sh
  docker pull ghcr.io/ziyad-mabrouk/msl-transaltor:latest
  ```
And then run the container:
 ```sh
  docker run -p 80:80 ghcr.io/ziyad-mabrouk/msl-transaltor:latest
  ```
You can now access the application from [http://localhost/](http://localhost/) .

### Built With

* Flask
* Mediapipe
* Tensorflow
* Scikit-learn
* NumPy

### Authors

* Mabrouk Ziyad
* Quehlaoui Mohamed
* Lansari Ibrahim
* Koumbogle Songuimpale
