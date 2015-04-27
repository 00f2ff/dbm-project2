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
			// add color to path
			$('.'+state_id).css('fill', rgb_string);
			// assign data for this state (g)
			// exception for mi
			if (state_id === 'mi') {
				$('.'+state_id).data('info', state_data);
			} else {
				$('.'+state_id).parent().data('info', state_data);
			}
		}
	}

	// Radio button click handler
	$('input').click(function() {
		// uncheck all radio buttons then check this one
		$('input').prop('checked',false);
		$(this).prop('checked',true);
		var index = parseInt($(this).val(),10);
		// change dataset
		changeDataset(index);
	});

	// function changeStrokeColor(element, color) {
	// 	console.log(element.attr('id'));
	// 	// exception to labeling rule
	// 	if (element.attr('id') === 'mi') {
	// 		element.find('path').css('stroke',color);
	// 	} else if (element.attr('id') === 'dc') {
	// 		element.find('circle').css('stroke',color);
	// 	}
	// 	element.find('.state').css('stroke',color);
	// }


	$('svg g').on('mouseover', function (e) {

		var info = $(this).data('info');
		// console.log(info);
		$('#tooltip #city').text(info.city+', '+$(this).attr('id').toUpperCase());
		$('#tooltip #population').text(info.population);
		$('#tooltip #rating').text(info.rating.toFixed(2));
		$('#tooltip #restaurant_count').text(info.restaurant_count);
		$('#tooltip #review_count').text(info.review_count);
		$('#tooltip #reviews_by_pop').text((info.reviews_by_pop*100).toFixed(2)+'%');

		// make all other states more transparent
		$('svg g').css('opacity',0.6);
		$(this).css('opacity',1);
	}).on('mouseleave', function() {
		$('svg g').css('opacity',1);
	});


	// initial load
	$('input[name="pizza"]').prop('checked',true);
	changeDataset(0);

})