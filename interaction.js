
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
var homeLocation = [-122.490402, 37.786453];
var workLocation = [-122.389809, 37.72728];
var selectRadius = 0.05; //Currently I hard-coded the radius just to test out functionality

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
function drawPoints(drawAll) {

	var filteredIncidents = incidents.filter(function(incident) {
		return incident.Selected;
	});

	var map = d3.select("svg")
		.selectAll("circle.incident")
		.data(filteredIncidents);

	map.enter()
		.append("circle")
		.filter(function(d) { return d.Selected })
		.attr("class", "incident")
		.attr("cx", function(d) { return projection(d.Location)[0] })
		.attr("cy", function(d) { return projection(d.Location)[1] })
		.attr("r", "2px")
		.attr("fill", "rgba(255, 0, 0, 0.3)");

	map.exit().remove();
}

var drag = d3.behavior.drag()
    .on("drag", dragmove);

function dragmove(d) {
	d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
	console.log(d.target);
  //var x = d3.event.x;
  //var y = d3.event.y;
}

function drawHome() {
	//homeLocation = [-122.490402, 37.786453];	

	var map = d3.select("svg")
		.selectAll("circle.home")
		.data([homeLocation])
		.enter()
		.append("circle")
		.attr("class", "home")
		.attr("cx", function(d) { return projection(d)[0] })
		.attr("cy", function(d) { return projection(d)[1] })
		.attr("r", "10px")
		.attr("fill", "blue")
		.call(drag);


		var homePoint = document.getElementsByClassName("home");
		console.log(homeLocation);


}

function drawWork() {
	//workLocation = [-122.389809, 37.72728];	

	var map = d3.select("svg")
		.selectAll("circle.work")
		.data([workLocation])
		.enter()
		.append("circle")
		.attr("class", "work")
		.attr("cx", function(d) { return projection(d)[0] })
		.attr("cy", function(d) { return projection(d)[1] })
		.attr("r", "10px")
		.attr("fill", "green")
		.call(drag);

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
	makeSlider("home");
	makeSlider("work");

	var buttons = document.getElementsByClassName("default-selected");
	for(var i = 0; i < buttons.length; i++) {
		buttons[i].classList.add("active");
	}
	// note to self location is an array with lat and long
});


function dayIndex(button) {
	var DayOfWeek = button.value;
	var existingIndex = options.DayOfWeek.indexOf(DayOfWeek);
	console.log("Index of " + button.value + " = " + existingIndex);
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
	console.log(buttons);
	var handleClick = function(e) {
		var button = e.target;
		var DayOfWeek = button.value;
		console.log(DayOfWeek);
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
			console.log(options);
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
		console.log(options.DayOfWeek);
	};

	for (var i = 0; i < buttons.length; i++) {
		buttons[i].addEventListener("click", handleClick);
	}
}

function timeIndex(button) {
	var TimeRange = button.value;
	var existingIndex = options.TimeRange.indexOf(TimeRange);
		console.log("Index of " + button.value + " = " + existingIndex);
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
			console.log(options);
			for(var i = 0; i < buttons.length; i++) {
				buttons[i].classList.remove("active");
			}
		} else {
			addOrRemoveTime(e.target);
		}


		filterIncidents(options);
		drawPoints();

		console.log(options.TimeRange);

	};

	for (var i = 0; i < buttons.length; i++) {
		buttons[i].addEventListener("click", handleClick);
	}
}

function categoryIndex(button) {
	var Category = button.value;
	var existingIndex = options.Category.indexOf(Category);
	console.log("Index of " + button.value + " = " + existingIndex);
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
			console.log(options);
			for(var i = 0; i < buttons.length; i++) {
				buttons[i].classList.remove("active");
			}
		} else {
			addOrRemoveCategory(e.target);
		}


		filterIncidents(options);
		drawPoints();
		console.log(options.Category);

	};

	for (var i = 0; i < buttons.length; i++) {
		buttons[i].addEventListener("click", handleClick);
	}
}

/*function attachResetListener() {
	var buttons = document.getElementsByClassName("reset-btn");

	var handleClick = function(e) {
		var allButtons = document.getElementsByClassName("default-selected");
		for (var i = 0; i < allButtons.length; i++) {
			allButtons[i].classList.add("active");
		}
		options = {
			"DayOfWeek": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
			"TimeRange": ["Morning", "Afternoon", "Night", "Late Night"],
			"Category": ["ARSON", "ASSAULT", "BRIBERY", "BURGLARY", "DISORDERLY CONDUCT", "DRIVING UNDER THE INFLUENCE", "DRUG/NARCOTIC", "DRUNKENNESS", "EMBEZZLEMENT", "EXTORTION", "FAMILY OFFENSES", "FORGERY/COUNTERFEITING", "FRAUD", "GAMBLING", "KIDNAPPING", "LARCENY/THEFT", "LIQUOR LAWS", "LOITERING", "MISSING PERSON", "NON-CRIMINAL", "OTHER OFFENSES", "PROSTITUTION", "ROBBERY", "RUNAWAY", "SECONDARY CODES", "SEX OFFENSES, FORCIBLE", "SEX OFFENSES, NON FORCIBLE", "STOLEN PROPERTY", "SUICIDE", "SUSPICIOUS OCC", "TRESPASS", "VANDALISM", "VEHICLE THEFT", "WARRANTS", "WEAPON LAWS"]
		}
		
		filterIncidents(options);
		drawPoints();
	};
	

	console.log(options.DayOfWeek);
	console.log(options.TimeRange);
	console.log(options.Category);

	buttons[0].addEventListener("click", handleClick);
}*/

document.addEventListener("DOMContentLoaded", function() {
	attachDayListeners();
	attachTimeListeners();
	attachCategoryListeners();
	//attachResetListener();
});


/**
	---------- Adding home and work location on the map ----------
**/

function withinRadius(incident, radius, latitude, longitude) {
	var latDiff = latitude - incident.Location[0];
	var longDiff = longitude - incident.Location[1];
	var distance = Math.sqrt(latDiff*latDiff + longDiff*longDiff); 
	return (distance <= radius);
}

//if location is reset, set lat and long back to 0. A location point is reset or not. 
function isLegit(latitude, longitude) { 
	console.log(latitude + ", " + longitude + " is legit or not");
	return (latitude !== 0 && longitude !== 0); 
}

function satisfiesOptions(incident) {
	var dayIndex = options.DayOfWeek.indexOf(incident.DayOfWeek);
	var timeIndex = options.TimeRange.indexOf(incident.TimeRange);
	var categoryIndex = options.Category.indexOf(incident.Category);
	console.log(dayIndex, timeIndex, categoryIndex);
	return (dayIndex > -1 && timeIndex > -1 && categoryIndex > -1);

}

//Currently registers and figures out what points are within the radius, but does not render them on the screen correctly.. 

function findNearestCrimes(lat1, long1, lat2, long2, radius) {
	if(isLegit(lat1,long1) && isLegit(lat2,long2)) {
		console.log("Both points legit");
		incidents.forEach(function(incident, index, arr) {
			//console.log("checking to see if " + arr[index] + " is within radius");
			if(withinRadius(incident, radius, lat1, long1) && withinRadius(incident, radius, lat2, long2)) {
				if(satisfiesOptions(incident)) {
						console.log("Incident " + index + " is within radius");
						arr[index].Selected = true;
				}
				console.log("Incident " + index + " is within radius but does not satisfy options");
			} else {
				console.log("Incident " + index + " is not within radius");
				arr[index].Selected = false;
			}
		});
	} else if (isLegit(lat1,long1) && !isLegit(lat2,long2)) {
		console.log("Only first point legit");
		incidents.forEach(function(incident, index, arr) {
			if(withinRadius(incident, radius, lat1, long1)) {
				if(satisfiesOptions(incident)) {
					arr[index].Selected = true;
				}
			} else {
				arr[index].Selected = false;
			}
		});
	} else if (!isLegit(lat1,long1) && isLegit(lat2,long2)) {
		console.log("Only second point legit");
		incidents.forEach(function(incident, index, arr) {
			if(withinRadius(incident, radius, lat2, long2)) {
				if(satisfiesOptions(incident)) {
					arr[index].Selected = true;
				}
			} else {
				arr[index].Selected = false;
			}
		});
	}
	drawPoints();
}

/*d3.select("svg").on("mousedown.log", function() {
  selectedPoint = projection.invert(d3.mouse(this));
  if(mouseClick === 0) {
  	location1 = selectedPoint;
  	mouseClick++;
  } else {
  	location2 = selectedPoint;
  	mouseClick--;
  }
  console.log(location1[0], location1[1], location2[0], location2[1], mouseClick);
  findNearestCrimes(location1[0], location1[1], location2[0], location2[1], selectRadius);
 
});*/

// ---------------- MAKING RADIUS SLIDER -------------------

function makeSlider(title) {

	var sliderType = title;

var margin = {top: 0, right: 50, bottom: 0, left: 50},
    width = 200,
    height = 200;

var x = d3.scale.linear()
    .domain([0, 50])
    .range([0, width])

var brush = d3.svg.brush()
    .x(x)
    .extent([0, 0])
    .on("brush", brushed);

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height / 2 + ")")
    .call(d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .tickFormat(function(d) { return d; })
      .tickSize(1)
      .tickPadding(12))
  .select(".domain")
  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "halo");

var slider = svg.append("g")
    .attr("class", "slider")
    .call(brush);

slider.selectAll(".extent,.resize")
    .remove();

slider.select(".background")
    .attr("height", height);

var handle = slider.append("circle")
    .attr("class", "handle")
    .attr("transform", "translate(0," + height / 2 + ")")
    .attr("r", 9);

slider
    .call(brush.event)
    .call(brush.extent([25, 25]))
    .call(brush.event);

function brushed() {
  var value = brush.extent()[0];

  if (d3.event.sourceEvent) { // not a programmatic event
    value = x.invert(d3.mouse(this)[0]);
    brush.extent([value, value]);
  }

  handle.attr("cx", x(value));
}
}
