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
	def get(self):
		# year = "2003" # I need to loop through
		# fp = open("data/{0}.json".format(year))
		# response = json.load(fp)
		# logging.info(type(response))
		# # j_2003 = self.get_year_data('2003')
		# # context = {'data':json.encode(response)}
		# context = {'data':response}
		with open('data/pizza_B.json') as f:
			data = f.read()
			# data = json.loads(data)
			# get rid of unicode encoding
			data = yaml.load(data)
		logging.info(data)
		context = {'data': data}
		self.render_response('index.html', **context)
	
	def post(self):
		context = {}
		self.render_response('index.html', **context)

app = webapp2.WSGIApplication([
    ('.*', MainHandler)
], debug=True)
