import sys
import nltk

def new_word(msg,d):
    word = msg['word']
    scores = msg['scores']
    scores_up = word_semantic(word,scores) #calc pos,neg, neu values
    key = tone_to_key(scores_up) #convert pos,neg,neu values to key
    notes = word_to_notes(word,d) #get phonemes and convert to notes
    return key, notes, scores_up
 
def word_semantic(word,scores):
    good_pos = ['JJ', 'JJR', 'JJS', 'NN', 'NNS', 'RB', 'RBR', 'RBS', 'VB', 'VBD', 'VBG', 'VBN', 'VBP', 'VBZ']
    
    part = nltk.pos_tag(nltk.word_tokenize(word)) #get part of speech
    part = part[0][1]
    if(part in good_pos): #run code if word is adjective, noun, adverb, or verb
        pl,nl,ol = get_scores(word)
 
        #filter out definitions that give a neutralitiy of 1
        pf = [float(pl[i]) for i in range(len(pl)) if ol[i] != 1]
        nf = [float(nl[i]) for i in range(len(nl)) if ol[i] != 1]
        of = [float(ol[i]) for i in range(len(ol)) if ol[i] != 1] 
        
        if not pf:
            return scores

        #average values of valid definitions
        pa = sum(pf)/len(pf) if pf else 0
        na = sum(nf)/len(nf) if nf else 0
        oa = sum(of)/len(of) if of else 1
        
        #add average to rolling average across last 10 words      
        scores['pos'].append(pa)
        scores['neg'].append(na)
        scores['neu'].append(oa)
        
        #start to delete old numbers from rolling average after accumulating 10 words
        if len(scores['pos']) > 10 or (len(scores['neu']) == 2 and scores['neu'][0]==1):
            scores['pos'].pop(0)
            scores['neg'].pop(0)
            scores['neu'].pop(0)
    return scores
    
def word_to_notes(word,d):
    bindings = ['ER', 'EH', 'UH', 'AE', 'IH', 'AH', 'UW', 'AO', 'IY', 'OW', 'EY', 'AA', 'AY', 'AW', 'OY']
    notes = []
    try:
        phonemes = d[word] #use cmudict to convert to phonemes
        phonemes = phonemes[0] #only take first pronouncation
    except KeyError:
        phonemes = []
    for phoneme in phonemes:
        if len(phoneme) == 3:
            phoneme = phoneme[0:-1]
            notes.append(bindings.index(phoneme))
 
    return notes
     
def tone_to_key(scores):
    pos = scores['pos']
    neg = scores['neg']
    neu = scores['neu']
    #average rolling average
    ave_pos = sum(pos)/len(pos)
    ave_neg = sum(neg)/len(neg)
    ave_neu = sum(neu)/len(neu)
 
    #test for regions of triangle plane and assign them different keys
    if ave_pos >= 0.5:
        return "dma"
    elif ave_neg >= 0.5:
        return "fmi"
    elif ave_neu >= 0.5:
        return "cma"
    elif ((1.0/3 - ave_pos)**2 + (1.0/3 - ave_neg)**2 + (1.0/3 - ave_neu)**2)**0.5 < 1.0/6:
        return "bbmi"
    elif ave_pos < 1.0/3:
        return "bmi"
    elif ave_neg < 1.0/3:
        return "fma"
    elif ave_neu < 1.0/3:
        return "fsma"
    else:
        return "cma"
 
def split_line(line):
    cols = line.split("\t")
    return cols
 
def get_words(cols):
    words_ids = cols[4].split(" ")
    words = [w.split("#")[0] for w in words_ids]
    return words
 
def get_positive(cols):
    return cols[2]
 
def get_negative(cols):
    return cols[3]
 
def get_objective(cols):
    return 1 - (float(cols[2]) + float(cols[3]))
 
def get_scores(word):
    pos = []
    neg = []
    neu = []
    
    word = word.lower()
 
    with open("SentiWordNet_3.0.0.txt","r") as f:
        for line in f:
            if not line.startswith("#"):
                cols = split_line(line)
                words = get_words(cols)
     
                if word in words:
                    pos.append(get_positive(cols))
                    neg.append(get_negative(cols))
                    neu.append(get_objective(cols))
 
    return pos,neg,neu