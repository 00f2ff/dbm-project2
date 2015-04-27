# -*- coding: utf-8 -*-
"""
Created on Sun Apr 26 12:02:57 2015

@author: lorraine
"""

import json, csv

def load_review_data(category):
    with open("data/{0}_B.json".format(category),"r") as f:
        cat = f.read()
    cat = json.loads(cat)
    adj_review = []
    
    dict_child=[]
    for i in xrange(len(cat[category])):
        score = cat[category][i].values()
        state = cat[category][i].keys()
        review_dict={}
        if score[0]["restaurant_count"]!=0:
            adj = float(score[0]["review_count"])/score[0]["restaurant_count"]
        else:
            adj=0
        adj_review.append(adj)
        review_dict["name"]=state[0]
        review_dict["size"]=adj
        dict_child.append(review_dict)
    return dict_child
    #return review_dict
def load_cat_review(category):
    dict_parent={}
    dict_parent["name"]=category
    dict_parent["children"]=load_review_data(category)
    return dict_parent


    
        

#dict_final= load_total_review(["pizza","chinese","mexican","bars","bbq","steak","southern"])


dict_grand={}
dict_grand["name"]="adjusted_review"
dict_gr_val=[]
category_all=["pizza","chinese","mexican","bars","bbq","steak","southern"]
for i in xrange(len(category_all)):
    val = load_cat_review(category_all[i])
    dict_gr_val.append(val)
    dict_grand["children"]=dict_gr_val

# create percentages
children = dict_grand["children"]
# loop through categories
for child in children:
    size_sum = 0
    # loop through states
    for state in child["children"]:
        # add city
        with open('data/population1.csv') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row['abb'] == state['name']:
                    state['city'] = row['Place']
        # add reviews to sum
        size_sum += state["size"]
    # loop through states again and add percent
    for state in child["children"]:
        state["percent"] = "{0}%".format(round(state["size"] / size_sum * 100, 1)) # round to one decimal
        # add category here because it's easier to reference in treemap that way
        state["category"] = child["name"]


# print(dict_grand)

with open('data/tree.json', 'wb') as fp:
    json.dump(dict_grand, fp)

#print(state)
    
#review_dict = load_rating_data("pizza")
#print(review_dict)