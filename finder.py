# -*- coding: utf-8 -*-
"""
Yelp API v2.0 code sample.

This program demonstrates the capability of the Yelp API version 2.0
by using the Search API to query for businesses by a search term and location,
and the Business API to query additional information about the top result
from the search query.

Please refer to http://www.yelp.com/developers/documentation for the API documentation.

This program requires the Python oauth2 library, which you can install via:
`pip install -r requirements.txt`.

Sample usage of the program:
`python sample.py --term="bars" --location="San Francisco, CA"`
"""
import argparse
import json
import pprint
import sys
import urllib
import urllib2
import re
import string
import csv
import oauth2

from keys import Keys


API_HOST = 'api.yelp.com'
DEFAULT_TERM = 'restaurants'
DEFAULT_LOCATION = 'Pittsburgh, PA'
# SEARCH_LIMIT = 20
SEARCH_PATH = '/v2/search/'
BUSINESS_PATH = '/v2/business/'

# initialize keys
keys = Keys()

# NOTE: do a gitignore on keys.py
CONSUMER_KEY = keys.CONSUMER_KEY
CONSUMER_SECRET = keys.CONSUMER_SECRET
TOKEN = keys.TOKEN
TOKEN_SECRET = keys.TOKEN_SECRET



def request(host, path, url_params=None):
    """Prepares OAuth authentication and sends the request to the API.

    Args:
        host (str): The domain host of the API.
        path (str): The path of the API after the domain.
        url_params (dict): An optional set of query parameters in the request.

    Returns:
        dict: The JSON response from the request.

    Raises:
        urllib2.HTTPError: An error occurs from the HTTP request.
    """
    url_params = url_params or {}
    url = 'http://{0}{1}?'.format(host, urllib.quote(path.encode('utf8')))

    consumer = oauth2.Consumer(CONSUMER_KEY, CONSUMER_SECRET)
    oauth_request = oauth2.Request(method="GET", url=url, parameters=url_params)

    oauth_request.update(
        {
            'oauth_nonce': oauth2.generate_nonce(),
            'oauth_timestamp': oauth2.generate_timestamp(),
            'oauth_token': TOKEN,
            'oauth_consumer_key': CONSUMER_KEY
        }
    )
    token = oauth2.Token(TOKEN, TOKEN_SECRET)
    oauth_request.sign_request(oauth2.SignatureMethod_HMAC_SHA1(), consumer, token)
    signed_url = oauth_request.to_url()
    
    print u'Querying {0} ...'.format(url)

    conn = urllib2.urlopen(signed_url, None)
    try:
        response = json.loads(conn.read())
    finally:
        conn.close()

    return response



def search(category_filter, location, offset):
    """Query the Search API by a search term and location.

    Args:
        # term (str): The search term passed to the API.
        category_filter (str): The category passed to the API
        location (str): The search location passed to the API.
        offset (int): How many results to offset the search by (e.g. an offset of 20 will return results 21-40)

    Returns:
        dict: The JSON response from the request.
    """
    
    url_params = {
        'category_filter': category_filter.replace(' ', '+'),
        # 'term': term.replace(' ', '+'),
        'location': location.replace(' ', '+'),
        'offset': offset,
        'sort': 2 # Highest Rated
    }
    return request(API_HOST, SEARCH_PATH, url_params=url_params)

def get_business(business_id):
    """Query the Business API by a business ID.

    Args:
        business_id (str): The ID of the business to query.

    Returns:
        dict: The JSON response from the request.
    """
    business_path = BUSINESS_PATH + business_id

    return request(API_HOST, business_path)

def query_api(category_filter, location, offset):
    """Queries the API by the input values from the user.

    Args:
        # term (str): The search term to query.
        location (str): The location of the business to query.
    """
    response = search(category_filter, location, offset)

    businesses = response.get('businesses')

    if not businesses:
        print u'No businesses for {0} in {1} found.'.format(category_filter, location)
        # If there are no remaining results, return an empty list
        return []

    responses = []
    # Return a list of businesses instead of just a single one
    for business in businesses:
        business_id = business['id']
        response = get_business(business_id)
        # sometimes results are from nearby cities, but not the city proper
        city = response['location']['city'].lower()
        state = response['location']['state_code'].lower()
        # Hard-coding: Louisville/Jefferson County, KY causes issues because it's two places
        location = location.lower()
        if location == "louisville/jefferson county, ky":
            loc_cities = location[:-4].split('/')
            loc_state = location[-2:]
            for c in loc_cities:
                l_city_state = '%s, %s' % (c, loc_state)
                r_city_state = '%s, %s' % (city, state)
                print l_city_state, r_city_state
                # only include response if locations are the same
                if l_city_state == r_city_state:
                    responses.append(response)
        else:
            # only include response if locations are the same
            city_state = '%s, %s' % (city, state)
            if location.lower() == city_state:
                responses.append(response)

    return responses


def find_restaurants(category_filter, location, offset):
    try:
        return query_api(category_filter, location, offset)
    except urllib2.HTTPError as error:
        sys.exit('Encountered HTTP error {0}. Abort program.'.format(error.code))

def load_location_data(filename):
    states = []
    cities = []
    populations = []
    with open(filename) as f:
        reader = csv.DictReader(f)
        for row in reader:
            states.append(row['abb'])
            cities.append(row['Place'])
            populations.append(int(row['Population']))
    return cities, states, populations

# This method aggregates all of the highest rated restaurants into a dict
def find_all(city, state, category_filter, num_queries):
    city_state = '%s, %s' % (city, state)
    # set default dict
    highest_rated = {state: {}}
    highest_rated[state] = {"city": city, "restaurants": []}
    # increment offset by 20
    # maximum returned restaurants will be num_queries / 20 * 20 (not always = to num_queries)

    for offset in range(0,num_queries,20):
        # find 20 restaurants
        restaurants = find_restaurants(category_filter, city_state, offset)
        # add restaurants to highest_rated
        highest_rated[state]["restaurants"] += restaurants
    return highest_rated

# Save all restaurant data to a human-readable JSON file
def save_restaurants(category_filter):
    # load CSV data
    cities, states, populations = load_location_data('data/population1.csv')
    # create dict
    cat = {category_filter: []}
    for i in xrange(len(states)):
        # if i == 1: break # limit number of states for testing
        city = cities[i]
        state = states[i]
        # find highest rated for this city and state
        highest_rated = find_all(city, state, category_filter, 40)
        # add to main category dict
        cat[category_filter].append(highest_rated)
    # write to JSON
    cat = str(json.dumps(cat, indent=2))
    with open("data/{0}_A.json".format(category_filter),"w") as f:
        f.write(cat)

def get_rating_and_review_count(restaurants):
    total_weight = 0
    total_review_count = 0
    for r in restaurants:
        review_count = r['review_count']
        rating = r['rating']
        weight = review_count * rating
        # add to totals
        total_weight += weight
        total_review_count += review_count
    # calculate adjusted rating
    if total_review_count != 0: # debugging
        adjusted_rating = total_weight / total_review_count
    else:
        adjusted_rating = [total_weight, total_review_count]
    return adjusted_rating, total_review_count

# Analyze restaurant data and save a new JSON file
def analyze(category_filter):
    # load CSV data
    cities, states, populations = load_location_data('data/population1.csv')
    # load JSON data
    with open("data/{0}_A.json".format(category_filter),"r") as f:
        cat = f.read()
    cat = json.loads(cat)
    # iterate through states
    for i in xrange(len(cat[category_filter])):
        state = cat[category_filter][i]
        # get the value of a state
        val = state.itervalues().next()
        # get rating and review_count
        adjusted_rating, total_review_count = get_rating_and_review_count(val["restaurants"])
        # get the number of restaurants
        number = len(val["restaurants"])
        # we want to continue using this same dict, so delete restaurants
        del val["restaurants"]
        # add additional data to dict
        val["population"] = populations[i]
        val["rating"] = adjusted_rating
        val["review_count"] = total_review_count
        val["restaurant_count"] = number
        # calculate reviews / population
        val["reviews_by_pop"] = total_review_count * 1.0 / populations[i]
    # save data to JSON
    cat = str(json.dumps(cat, indent=2))
    with open("data/{0}_B.json".format(category_filter),"w") as f:
        f.write(cat)


category_filter = 'chinese'
save_restaurants(category_filter)
analyze(category_filter)





# write_restaurants_to_json('new york','ny','chinese')

# adjusted_rating, total_review_count = get_rating_and_review_count()
# print adjusted_rating, total_review_count
