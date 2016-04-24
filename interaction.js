
// ------------------------ SET UP MAP ----------------------
// Set up size
var width = 750,
	height = width;

// Set up projection that map is using
var projection = d3.geo.mercator()
	.center([-122.433701, 37.767683]) // San Francisco, roughly
	.scale(225000)
	.translate([width / 2, height / 2]);

var incidents = [];

var options = {
	"DayOfWeek": [],
	"TimeRange": ["Morning", "Afternoon", "Night"],
	"Category": ["OTHER OFFENSES"]
};

// Add an svg element to the DOM
var svg = d3.select("#map").append("svg")
	.attr("width", width)
	.attr("height", height);

// Add svg map at correct size, assumes map is saved in a subdirectory called "data"
svg.append("image")
	.attr("width", width)
	.attr("height", height)
	.attr("xlink:href", "data/sf-map.svg");

// -------------- LINK ARRAY OF INCIDENTS TO DOM ELEMENTS ---------------
function drawPoints() {
	var filteredIncidents = incidents.filter(function(incident) {
		return incident.Selected;
	});

	var map = d3.select("svg")
		.selectAll("circle")
		.data(filteredIncidents);

	map.enter()
		.append("circle")
		.filter(function(d) { return d.Selected })
		.attr("cx", function(d) { return projection(d.Location)[0] })
		.attr("cy", function(d) { return projection(d.Location)[1] })
		.attr("r", "1px")
		.attr("fill", "rgba(255, 0, 0, 0.3)");

	map.exit().remove();
}

// --------------------- EXTRACT DATA FROM JSON FILE --------------------

function convertTimeToRange(time) {
  var partsOfTime = time.split(":");
	var hour = parseInt(partsOfTime[0]);
	if (hour >= 6 && hour < 12) {
		return "Morning";
	} else if (hour >= 12 && hour < 19) {
		return "Afternoon";
	} else {
		return "Night";
	}
}

/**
 * This function selects/deselects incidents based on criteria as specified in
 * options object.
 *
 * Potential options
 * {
 *   "DayOfWeek": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
 *   "TimeRange": ["Morning", "Afternoon", "Night"],
 *   "Category": [...]
 * }
 */
function filterIncidents(options) {
	incidents.forEach(function(incident, index, arr) {
		if (options.DayOfWeek.indexOf(incident.DayOfWeek) < 0) {
			arr[index].Selected = false;
			return;
		}

		if (options.Category.indexOf(incident.Category) < 0) {
			arr[index].Selected = false;
			return;
		}

		if (options.TimeRange.indexOf(incident.TimeRange) < 0) {
			arr[index].Selected = false;
			return;
		}

		arr[index].Selected = true;
	});
}

d3.json("scpd_incidents.json", function(error, scpd_incidents) {
	if (error) return console.warn(error);
	scpd_incidents.data.forEach(function(d) { // for each row in data table
		//d.Date = format.parse(d.date); -- need to figure this out later
		d.Selected = true; // set default selected property to true
		d.TimeRange = convertTimeToRange(d.Time);
		incidents.push(d); // put dynamically created object into array
	});

	drawPoints();
	// note to self location is an array with lat and long
});

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

function attachDayListeners() {
	var buttons = document.getElementsByClassName("day-btn");

	var handleClick = function(e) {
		var DayOfWeek = e.target.value;
		var existingIndex = options.DayOfWeek.indexOf(DayOfWeek);
		if (existingIndex > -1) {
			options.DayOfWeek.splice(existingIndex, 1);
			e.target.classList.remove("active");
		} else {
			options.DayOfWeek.push(DayOfWeek);
			e.target.classList.add("active");
		}

		filterIncidents(options);
		drawPoints();
	};

	for (var i = 0; i < buttons.length; i++) {
		buttons[i].addEventListener("click", handleClick);
	}
}

document.addEventListener("DOMContentLoaded", function() {
	attachDayListeners();
});
