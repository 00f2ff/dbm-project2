$(function() {
	var labels = true; // show the text labels beside individual boxplots?
var margin = {top: 30, right: 50, bottom: 70, left: 50};
var  width = 800 - margin.left - margin.right;
var height = 750 - margin.top - margin.bottom;
	
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
	data[4] = [];
	data[5] = [];
	data[6] = [];
	// add more rows if your csv file has more columns
	// add here the header of the csv file
	data[0][0] = "chinese";
	data[1][0] = "mexican";
	data[2][0] = "pizza";
	data[3][0] = "bars";
	data[4][0] = "bbq"
	data[5][0] = "southern"
	data[6][0] = "steak"
	// add more rows if your csv file has more columns
	data[0][1] = [];
	data[1][1] = [];
	data[2][1] = [];
	data[3][1] = [];
	data[4][1] = [];
	data[5][1] = [];
	data[6][1] = [];
  
	csv.forEach(function(x) {
		  var v1 = x.chinese,
		    v2 = x.mexican,
		    v3 = x.pizza,
			v4 = x.bars
			v5 = x.bbq
			v6 = x.southern
			v7 = x.steak
			// add more variables if your csv file has more columns
			
		var rowMax = Math.max(v7, Math.max(v6,Math.max(v5,Math.max(v1, Math.max(v2, Math.max(v3,v4))))));
		var rowMin = Math.min(v1, Math.min(v2, Math.min(v3,Math.min(v4,Math.min(v5,Math.min(v6,v7))))));
		  
		data[0][1].push(v1);
		data[1][1].push(v2);
		data[2][1].push(v3);
		data[3][1].push(v4);
		data[4][1].push(v5);
		data[5][1].push(v6);
		data[6][1].push(v7);
		 // add more rows if your csv file has more columns
		 
		if (rowMax > max) max = rowMax;
		if (rowMin < min) min = rowMin;	
	});
  
	var chart = d3.box()
		.whiskers(iqr(0.8))
		.height(height)	
		.domain([min, max])
		.showLabels(labels);
	var svg = d3.select("body").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.attr("class", "box")    
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	// the x-axis
	var x = d3.scale.ordinal()	   
		.domain( data.map(function(d) { console.log(d); return d[0] } ) )	    
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
        .text("The Best Cuisine Natiowide Ratings");
 
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
		  .text("Ratings");		
	
	// draw x axis	
	svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + (height  + margin.top + 10) + ")")
      .call(xAxis)
	  .append("text")             // text label for the x axis
        .attr("x", (width / 2) )
        .attr("y",  18 )
		.attr("dy", ".71em")
        .style("text-anchor", "middle")
		.style("font-size", "16px") 
        .text("cuisine"); 
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
	
})