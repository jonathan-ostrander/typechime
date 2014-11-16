from flask import Flask, render_template
from flask.ext.socketio import SocketIO, emit
from WordToNotes import new_word
from nltk.corpus import cmudict

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)
d = cmudict.dict()

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('new_word')
def send_notes(msg):
	key, notes, scores = new_word(msg,d)
	emit('new_notes', {'key': key, 'notes': notes, 'scores': scores})

if __name__ == '__main__':
    socketio.run(app)