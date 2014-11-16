from flask import Flask, render_template
from flask.ext.socketio import SocketIO, emit
from WordToNotes import new_word
from nltk.corpus import cmudict

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('my event')
def test_message(message):
    emit('my response', {'data': 'got it!'})

@socketio.on('new_word')
def send_notes(msg):
	emit('new_notes', {'scores': new_word(msg['word'])})

if __name__ == '__main__':
    socketio.run(app)