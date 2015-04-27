#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
import webapp2, logging, urllib, json, csv, re, yaml
from webapp2_extras import jinja2


# BaseHandler subclasses RequestHandler so that we can use jinja
class BaseHandler(webapp2.RequestHandler):

	@webapp2.cached_property
	def jinja2(self):
		# Returns a Jinja2 renderer cached in the app registry.
		return jinja2.get_jinja2(app=self.app)

	def render_response(self, _template, **context):
		# Renders a template and writes the result to the response.
		rv = self.jinja2.render_template(_template, **context)
		self.response.write(rv)

class MainHandler(BaseHandler):

	# This method finds values for relative comparison within the view
	def find_values(self, data, category):
		states = data[category]
		min_rating = 0
		max_rating = 0
		min_state = ''
		max_state = ''
		for s in states:
			rating = s[s.keys()[0]]['rating']
			if s[s.keys()[0]]["review_count"] == 0: 
				rating = 0 # hack because some states don't have southern restaurants
				s[s.keys()[0]]['rating'] = rating
			if rating > max_rating:
				max_rating = rating
				max_state = s.keys()[0]
			elif (rating < max_rating and min_rating == 0) or rating < min_rating:
				min_rating = rating
				min_state = s.keys()[0]
		logging.info(category + " " + str(max_rating) + " " + str(min_rating))
		return max_rating, min_rating, max_state, min_state

	def find_adjusted_reviews(self, data, category):
		states = data[category]
		total_adjusted_reviews = 0
		for s in states:
			review_count = s[s.keys()[0]]['review_count']
			restaurant_count = s[s.keys()[0]]['restaurant_count']
			if restaurant_count > 0:
				adjusted_reviews = review_count / restaurant_count
				total_adjusted_reviews += adjusted_reviews
		return total_adjusted_reviews

	def get(self):
		context = {'data': [], 'stats': {}}
		category_list = ['pizza', 'mexican', 'chinese', 'bars', 'bbq', 'southern', 'steak']
		# Iterate through JSON files
		for category in category_list:
			with open('data/{0}_B.json'.format(category)) as f:
				data = f.read()
				# get rid of unicode encoding
				data = yaml.load(data)
			max_rating, min_rating, max_state, min_state = self.find_values(data, category)
			total_adjusted_reviews = self.find_adjusted_reviews(data, category)
			val = {'data': data, 'max_rating': max_rating, 'min_rating': min_rating, 'max_state': max_state, 'min_state': min_state, 'total_adjusted_reviews': total_adjusted_reviews}
			# add this particular dataset to context
			context['data'].append(val)
		# add boxplot data to context *** UNEQUAL NUMBER OF RATINGS BREAKS IT
		# with open('data/boxplot.json') as f:
		# 	stats = f.read()
		# 	stats = yaml.load(stats)
		# context['stats'] = stats
		self.render_response('index.html', **context)

	
	
	def post(self):
		context = {}
		self.render_response('index.html', **context)

app = webapp2.WSGIApplication([
    ('.*', MainHandler)
], debug=True)
