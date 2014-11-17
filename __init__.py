from flask import Flask, render_template, request, jsonify
from WordToNotes import new_word
from nltk.corpus import cmudict
import ast

app = Flask(__name__)
app.debug = False
d = cmudict.dict()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/new_word')
def send_notes():
	msg = ast.literal_eval(request.args.keys()[0])
	print msg
	key, notes, scores = new_word(msg,d)
	print key, notes, scores
	return jsonify(**{'key': key, 'notes': notes, 'scores': scores})

if __name__ == '__main__':
	app.run()
