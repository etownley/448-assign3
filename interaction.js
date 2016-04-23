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

/*

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



