
// ------------------------ SET UP MAP ----------------------
// Set up size
var width = 750,
	height = width;

// Set up projection that map is using
var projection = d3.geo.mercator()
	.center([-122.433701, 37.767683]) // San Francisco, roughly
	.scale(225000)
	.translate([width / 2, height / 2]);

// Add an svg element to the DOM
var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);

// Add svg map at correct size, assumes map is saved in a subdirectory called "data"
svg.append("image")
	.attr("width", width)
	.attr("height", height)
	.attr("xlink:href", "data/sf-map.svg");

// -------------- LINK ARRAY OF INCIDENTS TO DOM ELEMENTS ---------------
function drawPoints() {
	d3.select("svg")
		.selectAll("circle")
		.data(allIncidents)
		.enter()
		.append("circle")
		.attr("cx", function(d) { return projection(d.Location)[0] })
		.attr("cy", function(d) { return projection(d.Location)[1] })
		.attr("r", "1px")
		.attr("fill", "red");
}

// --------------------- EXTRACT DATA FROM JSON FILE --------------------

var allIncidents = [];

d3.json("scpd_incidents.json", function(error, scpd_incidents) {
	if (error) return console.warn(error);
	console.log(scpd_incidents);
	scpd_incidents.data.forEach(function(d) { // for each row in data table
		//d.Date = format.parse(d.date); -- need to figure this out later
		allIncidents.push(d); // put dynamically created object into array
	});
	console.log(allIncidents);
	drawPoints();

	// note to self location is an array with lat and long
});






/*

What to do next

1. Figure out how to read JSON file into the browser
	- basically involves making extract_data.js work correctly
	- convert into an array of Javascript objects
2a.Figure out how to add array of Javascript location objects produced
   in first step to the map.
    - involves some projection voodoo
2b.Figure out how to filter array of Javascript objects based on proximity
    - given (lat, long) find everything within radius
    - optionally add in filtering controls
*/

function findNearestCrimes(latitude, longitude, radius, options) {
	for (incident in incidents) {
		if ("crime_types" in options) {
			var valid_types = options.crime_types;
			if (incident.crime_type in valid_crime_types) {
				// if not in filter then throw it
			}
			// filter by all crime types specified
		}		
	}
}

// Example call of this function
findNearestCrimes(35, 35, 5, {
	"crime_types": [ "theft", "homicide" ]
})



