import os
from flask import Flask, request, jsonify
import requests
from deepface import DeepFace
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from flask_cors import CORS

app = Flask(__name__)
uploadFolder = 'uploads'
app.config['UPLOAD_FOLDER'] = uploadFolder
load_dotenv()
GROQ_API_KEY = os.getenv('GROQ_API_KEY')
llm = ChatGroq(model="llama3-70b-8192")
YOUTUBE_API_KEY = os.getenv('GOOGLE_API_KEY')

CORS(app)

os.makedirs(uploadFolder, exist_ok=True)

def saveImage(file):
    if file.filename == '':
        raise ValueError('No selected file')
    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    return filepath

def detectEmotion(filepath):
    try:
        emotion = DeepFace.analyze(img_path=filepath, actions=['emotion'])
        # print("emotion: " + str(emotion))
        return emotion
    except ValueError as e:
        raise ValueError("Face could not be detected. Please upload a clear face photo.")

def callLLM(emotion):
    prompt = f"""
        You are a song genre recommendation bot that suggests suitable song genre based on facial expressions detected from an image.
        Here is the emotion analysis data extracted from a face in the image by Deepface:
        {emotion}
        Based on this JSON data, please analyze the **emotions** and recommend a song genres from the following list that fits the person's current emotional state:
        angry, fearful, neutral, surprised, in love, romantic, sad, happy, action, energetic, cheery, party, melody, fun, tragic.
        Output only the genres names that best matches the emotion. No extra explanation is needed.
    """
    genreResponse = llm.invoke(prompt)
    return genreResponse.content.strip()

def fetchYoutubeVideos(genre: str, maxResults=6):
    query = f"{genre} genre official Hindi songs"
    url = "https://youtube.googleapis.com/youtube/v3/search"
    params = {
        'key': YOUTUBE_API_KEY,
        'part': 'snippet',
        'type': 'video',
        'maxResults': maxResults,
        'q': query,
    }

    response = requests.get(url, params=params)
    if response.status_code != 200:
        raise Exception(f"YouTube API error: {response.status_code}")
    
    return response.json().get('items', [])

@app.route('/genre-by-emotion', methods=['POST'])
def genreByEmotion():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file uploaded'}), 400
    file = request.files['image']

    try:
        filepath = saveImage(file)    
        emotion = detectEmotion(filepath)
        genre = callLLM(emotion) 
        videos = fetchYoutubeVideos(genre)

        return jsonify({'genre': genre, 'videos': videos})

    except ValueError as ve:
        return jsonify({'error': 'No face detected: ' + str(ve)}), 400
    except Exception as e:
        return jsonify({'error': 'Something went wrong: ' + str(e)}), 500
    finally:
        if os.path.exists(filepath):
            os.remove(filepath)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))

# ============================================================================================================================

# @app.route('/genre-by-emotion2', methods=['POST'])
# def genreByEmotion2():
#     if 'image' not in request.files:
#         return jsonify({'error': 'No image file uploaded'}), 400

#     file = request.files['image']
#     if file.filename == '':
#         return jsonify({'error': 'No selected file'}), 400

#     filename = secure_filename(file.filename)
#     filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
#     file.save(filepath)

#     try:
#         emotion = detectEmotion(filepath)
#         prompt = f"""
#             You are a song genre recommendation bot that suggests suitable song genre based on facial expressions detected from an image.
#             Here is the emotion analysis data extracted from a face in the image by Deepface:
#             {emotion}
#             Based on this JSON data, please analyze the **emotion** and recommend a song genre from the following list that fits the person's current emotional state:
#             angry, fearful, neutral, surprised, in love, romantic, sad, happy, action, energetic, cheery, party, melody, fun, tragic.
#             Output only the genres names that best matches the emotion. No extra explanation is needed.
#         """
#         response = llm.invoke(prompt)
#         # print("Response: " + str(response))
#         return jsonify({'genre': response.content})
#     except ValueError as ve:
#         return jsonify({'error': str(ve)}), 400
#     except Exception as e:
#         return jsonify({'error': 'Something went wrong: ' + str(e)}), 500
#     finally:
#         os.remove(filepath)


# @app.route('/youtube-search')
# def youtubeSearch():
#     genre = request.args.get('genre')
#     if not genre:
#         return jsonify({'error': 'Missing genre parameter'}), 400
    
#     query = f"{genre} genre official bollywood songs"
#     url = "https://youtube.googleapis.com/youtube/v3/search"
#     params = {
#         'key': YOUTUBE_API_KEY,
#         'part': 'snippet',
#         'type': 'video',
#         'maxResults': 5,
#         'q': query
#     }
    
#     response = requests.get(url, params=params)
#     if response.status_code == 200:
#         return jsonify(response.json())
#     else:
#         return jsonify({'error': 'Failed to fetch from YouTube API'}), response.status_code


# @app.route('/emotion-by-face', methods=['POST'])
# def emotionByFace():
#     if 'image' not in request.files:
#         return jsonify({'error': 'No image file uploaded'}), 400

#     file = request.files['image']
#     if file.filename == '':
#         return jsonify({'error': 'No selected file'}), 400

#     filename = secure_filename(file.filename)
#     filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
#     file.save(filepath)

#     try:
#         emotion = detectEmotion(filepath)
#         return jsonify({'emotion': emotion})
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500
#     finally:
#         os.remove(filepath)

# if __name__ == '__main__':
#     app.run(debug=True)

