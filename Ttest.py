# -*- coding: utf-8 -*-
"""
Created on Wed Apr 22 22:52:24 2015

@author: lorraine
"""

import json
from pprint import pprint
import numpy as np
from scipy.stats import mstats
from scipy import stats
import csv
import pandas as pd
#json_data=open("data/{0}_B.json".format("pizza")).read()

#data = json.loads(json_data)
#pprint(data)

def normaltest_data(category):
    data,population = load_rating_data(category)
    z,pval = mstats.normaltest(data)
    print(category+" p value is "+str(pval))
    if(pval < 0.01):
        print "Not normal distribution"
    else:
        print "normal"

# normaltest_data
# null hypothesis is the pizza ratings all over the states follow a normal distribution
# A a significan level of 0.01 was chosen. 
#Since the calculated p value is greater than the significan level, we do not reject the null hypothesis
#Therefore we can safely assume the ratings follows a normal distribution
   
#Suppose the top-40 rated pizza rating nationwide is 4.0, the one sample t-test returns a p value of 0.0019 < significance level=0.05
#therefore we can reject the null hypothesis. Do not have sufficient evidence to conclude the population mean is 4.0    
#one-sided t-test, H0: score = 4.0, H1: score < 4.0 
# As t<0 & p/2<alpha, we reject null hypothesis. Enough evidence to conclude best pizza score < 4.0


#assume the best pizza and best chinese have the same score in the population
#p-val = 2.32e-07 < 0.01, reject the null hypothesis. Do not have sufficient confidence to conclude the best scores are the same
#One-tailed greater than test. H0: pizza = chinese, H1:pizza >= chinese. 
#As t>0 p/2<alpha, we reject null hypothesis. Enough evidence to conclude that best pizza socre is significantly greater than best chinese food 


#two side p-val=0.003<0.01, t>0, reject null
#H0: best pizza score = best mexican, H1:best pizza >= mexican
#As t>0 and p/2<alpha, we reject null hypothesis. Best pizza is significantly greater than best mexican

#H0: best chinese = best mexican
#H1: best chinese not equal
# p>0.01, do not reject null. Mexican rating is not significantly different than Chinese
    

#assume the best pizza and the best bar have the same score in the population
#p-val=0.64 > 0.05, do ont reject the null hyphothesis. The best bar score is not significantly different from best pizza
def anova_test(cat1,cat2,cat3,cat4):
    x1,pop1=load_rating_data(cat1)
    x2,pop2=load_rating_data(cat2)
    x3,pop3=load_rating_data(cat3)
    x4,pop4=load_rating_data(cat4)    
    F_val, p_val_anova = stats.f_oneway(x1,x2,x3,x4)
    print("anova f val"+str(F_val))
    print("anova p val"+str(p_val_anova))
# anova test null hypothesis:the population mean of the best pizza, bar, chinese and mexican restaurant ratings are the same
#p_val=1.13e-05<0.01, reject null hypothesis
#need to state the assumption of Anova Test
def pearson_rapop(category):
    rating,population = load_rating_data(category)
    pearson, p_val = stats.pearsonr(rating,population)
    print("pearson rapop is "+str(pearson))
    print("pearson rapop p_val is "+str(p_val))
# pearson coefficient = 0.23, 0.20<pearson<0.29,weak positive correlation
# p_val=0.09>0.05, H0: There is so statistically significant relationship between the two variables
# do not reject null hypothesis
    
def load_rating_data(category):
    with open("data/{0}_B.json".format(category),"r") as f:
        cat = f.read()
    cat = json.loads(cat)
    rating=[]
    population=[]
    for i in xrange(len(cat[category])):
        score = cat[category][i].values()
        rating.append(score[0]["rating"])
        population.append(score[0]["population"])
        
    return rating,population
        

def pearson_raAge(category):
    rating,population = load_rating_data(category)
    rating = np.array(rating)
    population=np.array(population)
    age = []
    f = open('data/MedianAge.csv')
    csv_f = csv.reader(f)
    for row in csv_f:
        age.append(float(row[2]))
    #rating = np.array(rating)
    age=np.array(age)
    pearson, p_val = stats.pearsonr(rating,age)
    print("pearson raAge is "+str(pearson))
    print("pearson raAge p_val is "+str(p_val))
#neglible correlation between rating and median age   

def one_sample_ttest(category,base):
    rating,population=load_rating_data(category)
    rating = np.array(rating)
    population=np.array(population)
    t4, prob4 = stats.ttest_1samp(rating,base)
    print("t value of "+category+str(t4))
    print("p value of "+category+str(prob4))
    
def two_sample_ttest(category1, category2):
    data1,populaton1=load_rating_data(category1)
    data1 = np.array(data1)
    data2,population2=load_rating_data(category2)
    data2 = np.array(data2)
    t, prob = stats.ttest_rel(data1,data2)
    print("t value of "+ category1+category2+str(t))
    print("p value of "+ category1+category2+str(prob))

category_filter = ["pizza","chinese","mexican","bars"]

#for category　in category_filter:
normaltest_data("pizza")
# pearson_raAge("pizza")
# pearson_rapop("pizza")
# one_sample_ttest("pizza",4)
# two_sample_ttest("pizza","chinese")  
# anova_test("pizza","chinese","mexican","bars")  
