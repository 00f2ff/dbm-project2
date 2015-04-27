$(function() {


	function changeDataset(index) {
		var category = Object.keys(data[index].data)[0],
			max_rating = data[index].max_rating,
			min_rating = data[index].min_rating,
			max_state = data[index].max_state.toUpperCase(),
			min_state = data[index].min_state.toUpperCase(),
			tar = data[index].total_adjusted_reviews;
		console.log(category, min_rating, max_rating, min_state, max_state, tar);

		// specific naming options for better phrasing
		var category_string;
		if (category === 'pizza') {
			category_string = 'Pizza';
		} else if (category === 'mexican') {
			category_string = 'Mexican Food';
		} else if (category === 'chinese') {
			category_string = 'Chinese Food';
		} else if (category === 'bars') {
			category_string = 'Bars';
		} else if (category === 'bbq') {
			category_string = 'BBQ';
		} else if (category === 'southern') {
			category_string = 'Southern Food';
		} else if (category === 'steak') {
			category_string = 'Steak';
		}
		$('#h1-category').text(category_string);
		// add low and high values
		var lr = min_rating.toFixed(2),
			hr = max_rating.toFixed(2);
		$('#low-end').text(lr);
		$('#high-end').text(hr);
		// add highest / lowest states
		$('.max_state').text(max_state);
		$('.min_state').text(min_state);
		var buckets = [0.1, 0.3, 0.5, 0.7, 0.9];
		// color gradient buckets
		for (var i = 0; i < buckets.length; i++) {
			var bg_string = 'rgb(255,'+Math.round(255*(1 - buckets[i]))+',0)';
			$('.bucket-'+i).css('background-color',bg_string);
		}
		// Right now this code does not use D3
		for (var i = 0; i < data[index].data[category].length; i++) {
			var s = data[index].data[category][i],
				state_abbr = Object.keys(s)[0],
				// match state name to SVG ids
				state_id = state_abbr.toLowerCase(),
				state_data = s[state_abbr],
				// adjust rating to relative values for coloring
				rg_val = (state_data.rating - min_rating) / (max_rating - min_rating),
				color_val,
				bucket;
			// Decide which bucket color_val would fall in assuming 5 buckets
			if (rg_val >= 0 && rg_val < 0.2) {
				bucket = buckets[0];
			} else if (rg_val >= 0.2 && rg_val < 0.4) {
				bucket = buckets[1];
			} else if (rg_val >= 0.4 && rg_val < 0.6) {
				bucket = buckets[2];
			} else if (rg_val >= 0.6 && rg_val < 0.8) {
				bucket = buckets[3];
			} else if (rg_val >= 0.8 && rg_val <= 1) {
				bucket = buckets[4];
			} 
			// create color val
			color_val = Math.round(bucket * 255);
			// color state
			// if (index % 2 === 0) { // alternate between even and odd
			// 	// Yellow to Red
			// 	rgb_string = 'rgb(255,'+(255-color_val)+',0)';
			// }else if (index % 2 === 1) {
			// 	// Cyan to Blue
			// 	rgb_string = 'rgb(0,'+(255-color_val)+',255)';
			// }
			// Just use a single color gradient so people can analyze maps more easily
			// Yellow to Red
			rgb_string = 'rgb(255,'+(255-color_val)+',0)';
			// check for 0 rating places (these would have a negative subtraction)
			if (state_data.rating == 0) {
				$('.'+state_id).css('fill', '#B6B6B6');
			} else {
				// add color to path
				$('.'+state_id).css('fill', rgb_string);
			}
			
			// assign data for this state (g)
			// exception for mi
			if (state_id === 'mi') {
				$('.'+state_id).data('info', state_data);
			} else {
				$('.'+state_id).parent().data('info', state_data);
			}
		}
	}


	$('svg g').on('mousemove', function (e) {
		var xPosition = e.pageX + 5;
      	var yPosition = e.pageY + 5;

      	$('#tooltip.map').css({'left': xPosition + "px", 'top': yPosition + "px"});

		var info = $(this).data('info');
		// console.log(info);
		$('#tooltip.map #header').text(info.city+', '+$(this).attr('id').toUpperCase());
		$('#tooltip.map #population').text(info.population);
		$('#tooltip.map #rating').text(info.rating.toFixed(2));
		$('#tooltip.map #restaurant_count').text(info.restaurant_count);
		$('#tooltip.map #review_count').text(info.review_count);
		$('#tooltip.map #reviews_by_pop').text((info.reviews_by_pop*100).toFixed(2)+'%');

		// make all other states more transparent
		$('#map svg g').css('opacity',0.6);
		$(this).css('opacity',1);

		if ($('#tooltip.map').hasClass('hidden')) { $('#tooltip.map').removeClass('hidden'); }
	}).on('mouseout', function() {
		$('svg g').css('opacity',1);
		$("#tooltip.map").addClass('hidden');
	});

	// dataset click handler
	$('.map-input').click(function() {
		// reset all elements and set this one to selected
		$('.map-input').removeClass('selected');
		$(this).addClass('selected');
		// change dataset
		changeDataset(parseInt($(this).attr('data-index'), 10));
	})


	// initial load
	changeDataset(0);

})