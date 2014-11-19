[typechi.me](http://typechi.me)
===============================

Generating music based on typing speed, connotation, and vowel sounds.

Typechi.me was made at [HackRPI](http://hack.rpi.edu) by myself and Jon Schaad.  We were hoping to create something that produced music based on the words that were being typed.

It uses [MIDI.js](https://github.com/mudcube/MIDI.js/) to produce the actual music, the python library [nltk](http://www.nltk.org/) for natural language processing, and it is currently hosted on [Microsoft Azure](http://azure.microsoft.com/).

To run a local instance of Typechi.me, clone the repo and run in your terminal:

```
virtualenv env
source env/bin/activate
pip install -r requirements.txt
```

From here you will have to download some files in the nltk data package so in python run:

```python
import nltk
nltk.download
```

This should bring up a GUI for you to install the correct packages.  Those packages are:

```
cmu_dict (under the Corpora tab)
maxent\_treebank\_pos (under the Models tab)
punkt (under the Models tab)
```

This will work for OS X/Linux, but the command to activate the virtual environment is different for windows.  Also, the installation of numpy might not work for Windows users.  Download and install the binaries for [numpy here](http://www.lfd.uci.edu/~gohlke/pythonlibs/).
