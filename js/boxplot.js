$(function() {
	var labels = true; // show the text labels beside individual boxplots?
	var margin = {top: 30, right: 50, bottom: 70, left: 50};
	var width = 800 - margin.left - margin.right;
	var height = 500 - margin.top - margin.bottom;
		
	var min = Infinity,
	    max = -Infinity;
		
	// parse in the data	
	d3.csv("/data/wisker.csv", function(error, csv) {
		// using an array of arrays with
		// data[n][2] 
		// where n = number of columns in the csv file 
		// data[i][0] = name of the ith column
		// data[i][1] = array of values of ith column
		var data = [];
		data[0] = [];
		data[1] = [];
		data[2] = [];
		data[3] = [];
		// add more rows if your csv file has more columns
		// add here the header of the csv file
		data[0][0] = "chinese";
		data[1][0] = "mexican";
		data[2][0] = "pizza";
		data[3][0] = "bar";
		// add more rows if your csv file has more columns
		data[0][1] = [];
		data[1][1] = [];
		data[2][1] = [];
		data[3][1] = [];
	  
		csv.forEach(function(x) {
		  	var v1 = x.chinese,
			    v2 = x.mexican,
			    v3 = x.bar,
				v4 = x.pizza;
			// add more variables if your csv file has more columns
				
			var rowMax = Math.max(v1, Math.max(v2, Math.max(v3,v4)));
			var rowMin = Math.min(v1, Math.min(v2, Math.min(v3,v4)));
			  
			data[0][1].push(v1);
			data[1][1].push(v2);
			data[2][1].push(v3);
			data[3][1].push(v4);
			 // add more rows if your csv file has more columns
			 
			if (rowMax > max) max = rowMax;
			if (rowMin < min) min = rowMin;	
		});

		console.log(data);
	  
		var chart = d3.box()
			.whiskers(iqr(0.8)) // this calls the interquartile range function
			.height(height)	
			.domain([min, max])
			.showLabels(labels);
		var svg = d3.select("#boxplot-wrapper").append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.attr("class", "box")    
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		
		// the x-axis
		var x = d3.scale.ordinal()	   
			.domain( data.map(function(d) { return d[0] } ) ) // ordinal label	    
			.rangeRoundBands([0 , width], 0.7, 0.3); 		
		var xAxis = d3.svg.axis()
			.scale(x)
			.orient("bottom");
		// the y-axis
		var y = d3.scale.linear()
			.domain([min, max])
			.range([height + margin.top, 0 + margin.top]);
		
		var yAxis = d3.svg.axis()
	    .scale(y)
	    .orient("left");
		// draw the boxplots	
		svg.selectAll(".box")	   
	      .data(data)
		  .enter().append("g")
			.attr("transform", function(d) { return "translate(" +  x(d[0])  + "," + margin.top + ")"; } )
	      .call(chart.width(x.rangeBand())); 
		
		      
		// add a title
		svg.append("text")
	        .attr("x", (width / 2))             
	        .attr("y", 0 + (margin.top / 2))
	        .attr("text-anchor", "middle")  
	        .style("font-size", "18px") 
	        //.style("text-decoration", "underline")  
	        .text("Nationwide Cuisine Ratings");

	    // y-axis title
		svg.append("text")
		    .attr("y", 0 - margin.left) // x and y switched due to rotation
		    .attr("x", 0 - (height / 2))
		    .attr("dy", "1em") 
		    .attr("transform", "rotate(-90)")
		    .style("text-anchor", "middle")
		    .style("font-size", "16px") 
		    .style("font-weight", "bold")
		    .text("Rating");

		// x-axis title
		svg.append("text")
		    .attr("class", "xlabel")
		    .attr("text-anchor", "middle")
		    .style("font-size", "16px") 
		    .style("font-weight", "bold")
		    .attr("x", width / 2)
		    .attr("y", height + margin.bottom/1.9) // prevents cutoff
		    .attr("dy", "2em") 
		    .text("Cuisine");
	 
		// draw y axis
		svg.append("g")
	        .attr("class", "y axis")
	        .call(yAxis)
			.append("text") // and text1
			  .attr("transform", "rotate(-90)")
			  .attr("y", 6)
			  .attr("dy", ".71em")
			  .style("text-anchor", "end")
			  .style("font-size", "16px") 
			  // .text("Ratings");		
		
		// draw x axis	
		svg.append("g")
	      .attr("class", "x axis")
	      .attr("transform", "translate(0," + (height  + margin.top + 10) + ")")
	      .call(xAxis)
		  .append("text")             // text label for the x axis
	        .attr("x", (width / 2) )
	        .attr("y",  10 )
			.attr("dy", ".71em")
	        .style("text-anchor", "middle")
			.style("font-size", "16px") 
	        // .text("cuisine"); 
	});
	// Returns a function to compute the interquartile range.
	function iqr(k) {
	  return function(d, i) {
	    var q1 = d.quartiles[0],
	        q3 = d.quartiles[2],
	        iqr = (q3 - q1) * k,
	        i = -1,
	        j = d.length;
	    while (d[++i] < q1 - iqr);
	    while (d[--j] > q3 + iqr);
	    return [i, j];
	  };
	}




	// Keep keep track of selected state from dropdown
	$('select').click(function() {
		console.log($(this).val().toLowerCase());
	});
	
})