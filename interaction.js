
// ------------------------ SET UP MAP ----------------------
// Set up size
var width = 750,
	height = width;

// Set up projection that map is using
var projection = d3.geo.mercator()
	.center([-122.433701, 37.767683]) // San Francisco, roughly
	.scale(225000)
	.translate([width / 2, height / 2]); //translates origin of map to this position

var incidents = [];
var homeLocation = [-122.433701, 37.787683]; //reset original point
var workLocation = [-122.433701, 37.767683]; //reset original point
var homeRadius = 500;
var workRadius = 500;


// ------ All options are selected in default state to let user see all data
var options = {
	"DayOfWeek": ["Sunday", "Monday", "Tuesday","Wednesday", "Thursday", "Friday", "Saturday"],
	"TimeRange": ["Morning", "Afternoon", "Night", "Late Night"],
	"Category": ["ARSON", "ASSAULT", "BRIBERY", "BURGLARY", "DISORDERLY CONDUCT", "DRIVING UNDER THE INFLUENCE", "DRUG/NARCOTIC", "DRUNKENNESS", "EMBEZZLEMENT", "EXTORTION", "FAMILY OFFENSES", "FORGERY/COUNTERFEITING", "FRAUD", "GAMBLING", "KIDNAPPING", "LARCENY/THEFT", "LIQUOR LAWS", "LOITERING", "MISSING PERSON", "NON-CRIMINAL", "OTHER OFFENSES", "PROSTITUTION", "ROBBERY", "RUNAWAY", "SECONDARY CODES", "SEX OFFENSES, FORCIBLE", "SEX OFFENSES, NON FORCIBLE", "STOLEN PROPERTY", "SUICIDE", "SUSPICIOUS OCC", "TRESPASS", "VANDALISM", "VEHICLE THEFT", "WARRANTS", "WEAPON LAWS"]
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
		.selectAll("circle.incident")
		.data(filteredIncidents, function(d) { return d.IncidentNumber; });

	map.enter()
		.append("circle")
		.attr("class", "incident")
		.attr("cx", function(d) { return projection(d.Location)[0] })
		.attr("cy", function(d) { return projection(d.Location)[1] }) //look at inverse projection
		.attr("r", "2px")
		.attr("fill", "rgba(85, 34, 68, 0.3)");

	map.exit().remove();
}


var drag = d3.behavior.drag()
    .on("drag", dragmove)

    .on("dragend", function () {
    	filterIncidents(options);
    	drawPoints();
    });

function dragmove(d) {


	var x = d3.event.x;
	var y = d3.event.y;

	d3.select(this).attr("cx", x).attr("cy", y);
	

	var pointID = d3.select(this).attr("id");
	var pointLocation = projection.invert([x, y]);


	if(pointID === "home") {
		homeLocation = pointLocation;
	} else {
		workLocation = pointLocation;
	}

	filterIncidents(options);
	drawPoints();

}

function drawHome() {
	//homeLocation = [-122.490402, 37.786453];	

	var map = d3.select("svg")
		.selectAll("circle.home")
		.data([homeLocation]);
		
		map.enter()
		.append("circle")
		.attr("id", "home")
		.attr("cx", projection(homeLocation)[0])
		.attr("cy", projection(homeLocation)[1])
		.attr("r", "14px")
		.attr("fill", "#DB504A")
		.call(drag);

		var homePoint = document.getElementsByClassName("home");

		map.exit().remove();

}

function drawWork() {
	//workLocation = [-122.389809, 37.72728];	

	var map = d3.select("svg")
		.selectAll("circle.work")
		.data([workLocation]);

		map.enter()
		.append("circle")
		.attr("id", "work")
		.attr("cx", projection(workLocation)[0])
		.attr("cy", projection(workLocation)[1])
		.attr("r", "14px")
		.attr("fill", "#084C61")
		.call(drag);

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
	} else if (hour >= 0 && hour < 6) {
		return "Night";
	} else {
		return "Late Night"; 
	}
}



/*
 * This function selects/deselects incidents based on criteria as specified in the
 * options object.
 */
function filterIncidents(options) {
	incidents.forEach(function(incident, index, arr) {
		if ( !withinRadius(incident, homeLocation, homeRadius) ||
			 !withinRadius(incident, workLocation, workRadius)) {
			arr[index].Selected = false;
			return;
		}

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


function emptyOptions() {
	options.DayOfWeek = [];
	options.TimeRange = [];
	options.Category = [];
}

d3.json("scpd_incidents.json", function(error, scpd_incidents) {
	if (error) return console.warn(error);
	scpd_incidents.data.forEach(function(d) { // for each row in data table
		d.Selected = true; // set default selected property to true
		d.TimeRange = convertTimeToRange(d.Time);
		incidents.push(d); // put dynamically created object into array
	});

	drawPoints();
	drawHome();
	drawWork();

	var buttons = document.getElementsByClassName("default-selected");
	for(var i = 0; i < buttons.length; i++) {
		buttons[i].classList.add("active");
	}
	// note to self location is an array with lat and long
});


function dayIndex(button) {
	var DayOfWeek = button.value;
	var existingIndex = options.DayOfWeek.indexOf(DayOfWeek);
	return existingIndex;
}

function addOrRemoveDay(button) {
	if (dayIndex(button) > -1) {
		options.DayOfWeek.splice(dayIndex(button), 1);
		button.classList.remove("active");
	} else {
		options.DayOfWeek.push(button.value);
		button.classList.add("active");
	}
}

function attachDayListeners() {
	var buttons = document.getElementsByClassName("day-btn");
	var handleClick = function(e) {
		var button = e.target;
		var DayOfWeek = button.value;
		if(DayOfWeek === "AllDays") { //handling the toggle on and off for all options
				for(var i = 0; i < buttons.length; i++) {
					if(dayIndex(buttons[i]) === -1 ) {
						options.DayOfWeek.push(buttons[i].value);
						buttons[i].classList.add("active");
						if(buttons[i].value === "AllDays" || buttons[i].value === "NotAllDays") {
							buttons[i].classList.remove("active");
						}
					}		
				}
			
		} else if (DayOfWeek === "NotAllDays") {
			options.DayOfWeek = [];
			for(var i = 0; i < buttons.length; i++) {
				buttons[i].classList.remove("active");
			}
		} else { 
			addOrRemoveDay(e.target);
			var allDaysButton = document.getElementById("AllDays");
			allDaysButton.classList.remove("active");


		}
		
		filterIncidents(options);
		drawPoints();
	};

	for (var i = 0; i < buttons.length; i++) {
		buttons[i].addEventListener("click", handleClick);
	}
}

function timeIndex(button) {
	var TimeRange = button.value;
	var existingIndex = options.TimeRange.indexOf(TimeRange);
	return existingIndex;
}

function addOrRemoveTime(button) {
	if(timeIndex(button) > -1) {
		options.TimeRange.splice(timeIndex(button), 1);
		button.classList.remove("active");
	} else {
		options.TimeRange.push(button.value);
		button.classList.add("active");
	}
}

function attachTimeListeners() {
	var buttons = document.getElementsByClassName("time-btn");

	var handleClick = function(e) {
		var button = e.target;
		var TimeRange = button.value;
		if(TimeRange === "AllTimes") {
				for(var i = 0; i < buttons.length -1; i++) {
					if(timeIndex(buttons[i]) === -1) {
						options.TimeRange.push(buttons[i].value);
						buttons[i].classList.add("active");
					}
					if(buttons[i].value === "AllTimes") {
						buttons[i].classList.remove("active");
					}
				}
				
			
		} else if (TimeRange === "NotAllTimes") {
			options.TimeRange = [];
			for(var i = 0; i < buttons.length; i++) {
				buttons[i].classList.remove("active");
			}
		} else {
			addOrRemoveTime(e.target);
		}


		filterIncidents(options);
		drawPoints();
		drawHome();
		drawWork();

	};

	for (var i = 0; i < buttons.length; i++) {
		buttons[i].addEventListener("click", handleClick);
	}
}

function categoryIndex(button) {
	var Category = button.value;
	var existingIndex = options.Category.indexOf(Category);
	return existingIndex;
}

function addOrRemoveCategory(button) {
	if(categoryIndex(button) > -1) {
		options.Category.splice(categoryIndex(button), 1);
		button.classList.remove("active");
	} else {
		options.Category.push(button.value);
		button.classList.add("active");
	}
}

function attachCategoryListeners() {
	var buttons = document.getElementsByClassName("category-btn");

	var handleClick = function(e) {
		var button = e.target;
		var category = e.target.value;
		if(category === "AllCategories") {
				for (var i = 0; i < buttons.length - 1; i++) {
					if(categoryIndex(buttons[i]) === -1) {
						options.Category.push(buttons[i].value);
						buttons[i].classList.add("active");
					}
					if(buttons[i].value === "AllCategories") {
						buttons[i].classList.remove("active");
					}
				}
			

		} else if (category === "NotAllCategories") {
			options.Category = [];
			for(var i = 0; i < buttons.length; i++) {
				buttons[i].classList.remove("active");
			}
		} else {
			addOrRemoveCategory(e.target);
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
	attachTimeListeners();
	attachCategoryListeners();
	initializeSliders();
});


function initializeSliders() {
	var sliderOptions = {
		connect: "lower",
		start: [200],
		range: {
			"min": [0],
			"max": [800],
		}
	};


	var homeSlider = document.getElementById("home-slider");
	noUiSlider.create(homeSlider, sliderOptions);
	homeSlider.noUiSlider.on("update", function(value) {
		homeRadius = parseFloat(value[0]);
		filterIncidents(options);
		drawPoints();
	});

	var workSlider = document.getElementById("work-slider");
	noUiSlider.create(workSlider, sliderOptions);
	workSlider.noUiSlider.on("update", function(value) {
		workRadius = parseFloat(value[0]);
		filterIncidents(options);
		drawPoints();
	});
}

/**
	---------- Distance/Radius calculations ----------
**/


function getDistance(incident, point) {
	var xDistance = incident[0] - point[0];
	var yDistance = incident[1] - point[1];
	return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));

  }

function withinRadius(incident, point, radius) {

	var incidentXY = projection(incident.Location);
	var pointXY = projection(point);
	var distance = getDistance(incidentXY, pointXY);
	
	return distance <= radius;
}


