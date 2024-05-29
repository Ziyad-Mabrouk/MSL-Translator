import os

def getFilePath(directory):
    files = os.listdir(directory)
    if len(files) == 1:
        filename = files[0]
        if directory.endswith("/"):
            return directory+filename
        else:
            return directory+"/"+filename
    else:
        print("The directory does not contain a single file.")