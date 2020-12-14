var portalOpenStatsURL = "https://api.shackspace.de/v1/stats/portal";
var portalOpenStatsData;

/*
 * group open-stats using the granularity of the given rounding function
 */
function groupBy(openStatsData, dateRoundFunction) {
	var data = { x: new Array(), y: new Array() };

	var yValue = 0;
	var xValue = null;

	for (var i in openStatsData) {
		var element = openStatsData[i];
		var dateValue = dateRoundFunction( new Date( element.time ) );

		if (xValue == null || xValue.getTime() != dateValue.getTime()) {
			if (xValue != null) {
				data.x.push(xValue);
				data.y.push(yValue);
			}

			yValue = 0;
			xValue = dateValue;
		}

		yValue += element.mean*1;
	}

	if (xValue != null) {
		data.x.push(xValue);
		data.y.push(yValue);
	}

	return data;
}

/*
 *	accumulate opening hours per week day
 */
function accumulateByWeekdays(openStatsData) {
	var data = { x: new Array(), y: new Array() };

	data.x.push("Monday"); data.y.push(0);
	data.x.push("Tuesday"); data.y.push(0);
	data.x.push("Wednesday"); data.y.push(0);
	data.x.push("Thursday"); data.y.push(0);
	data.x.push("Friday"); data.y.push(0);
	data.x.push("Saturday"); data.y.push(0);
	data.x.push("Sunday"); data.y.push(0);

	for (var i in openStatsData) {
		var element = openStatsData[i];
		var dateValue = new Date(element.time);

		// 0 based index starting at sunday
		var dayOfWeek = dateValue.getDay();

		// convert it to 0 based index starting at monday
		dayOfWeeg -= 1;
		if (dayOfWeek < 0)
			dayOfWeek += 7;

		data.y[dayOfWeek] += element.mean*1;
	}

	return data;
}

/*
 *	accumulate opening hours per day time
 */
function accumulateByHours(openStatsData) {
	var data = { x: new Array(), y: new Array() };

	for (var i=0; i<24; i++) {
		data.x.push(i + ":00");
		data.y.push(0);
	}

	for (var i in openStatsData) {
		var element = openStatsData[i];
		var dateValue = new Date(element.time);

		var hours = dateValue.getHours();
		data.y[hours] += element.mean*1;
	}

	return data;
}

function filterGreaterThanDate(element, date) {
	return new Date(element.time) >= date;
}

function filterWeekendDays(element, date) {
	var elementDate = new Date(element.time);

	if (elementDate.getDay() > 5)
		return true;

	if (elementDate.getDay() == 5 && elementDate.getHours() >= 12)
		return true;

	return false;
}

function roundToHour(date) {
	var d = new Date(date.getTime());
	d.setMinutes(0);
	d.setSeconds(0);
	d.setMilliseconds(0);

	return d;
}

function roundToDate(date) {
	var d = roundToHour(date);
	d.setHours(0);

	return d;
}

function roundToMonth(date) {
	var d = roundToDate(date);
	d.setDate(1);
	
	return d;
}

function roundToYear(date) {
	var d = roundToMonth(date);
	d.setMonth(0);

	return d;
}

function initGroupByYearPlot(openStatsData, divName) {
	var data = groupBy(openStatsData, roundToYear);
	data['type'] = 'bar';
	data['marker'] = { color: 'rgb(0,96,0)' };

	Plotly.newPlot(
		divName,
		[ data ],
		{ xaxis: { tickformat: '%Y' } }
	);
}

function initGroupByMonthPlot(openStatsData, divName) {
	var data = groupBy(openStatsData, roundToMonth);
	data['type'] = 'bar';
	data['marker'] = { color: 'rgb(0,96,0)' };

	Plotly.newPlot(
		divName,
		[ data ]
	);
}

function initGroupByDatePlot(openStatsData, divName) {
	var data;
	data = groupBy(openStatsData, roundToDate);
	data['type'] = 'bar';
	data['marker'] = { color: 'rgb(0,96,0)' };
	
	Plotly.newPlot(
		divName,
		[ data ],
		{ xaxis: { tickformat: '%a, %Y-%m-%d' } }
	);
}

function initGroupByHourPlot(openStatsData, divName) {
	var data = groupBy(openStatsData, roundToHour);
	data['type'] = 'scatter';
	data['line'] = { shape: 'spline' };
	data['marker'] = { color: 'rgb(0,96,0)' };

	Plotly.newPlot(
		divName,
		[ data ],
		{ xaxis: { tickformat: '%a, %Y-%m-%d %H:%M' } }
	);
}

function initAccumulateByWeekdaysPlot(openStatsData, divName) {
	var data = accumulateByWeekdays(openStatsData);
	data['type'] = 'bar';
	data['marker'] = { color: 'rgb(0,96,0)' };

	Plotly.newPlot(
		divName,
		[ data ]
	);
}

function initAccumulateByHoursPlot(openStatsData, divName) {
	var data = accumulateByHours(openStatsData);
	data['type'] = 'bar';
	data['marker'] = { color: 'rgb(0,96,0)' };

	Plotly.newPlot(
		divName,
		[ data ]
	);
}

/*
 * initializes plots using plotly lib
 * parameter openStatsData: parsed JSON of http://api.shackspace.de/v1/stats/portal
 * 	is expected to be an object like 
 *	[ 
 *		{ time: "1970-01-01T00:00:00", mean: "0" }, 
 *		{ time: "1970-01-01T01:00:00", mean: "1" },
 *		...
 *	]
 */
function initAllPlots(openStatsData) {
	var dateMaxElement = openStatsData.reduce(
			(max, element) => {
				var elementDate = new Date(element.time);
				var maxDate = new Date(max.time);

				if (elementDate > maxDate)
					return element;

				return max;
			} );
	var dateMax = new Date(dateMaxElement.time).getTime();

	var last14Days = new Date(dateMax - 1000*60*60*24*14)
	var lastMonth = new Date(dateMax - 1000*60*60*24*31)
	var lastYear = new Date(dateMax - 1000*60*60*24*365)

	initGroupByYearPlot(
		openStatsData,
		'groupByYear'
	);

	initGroupByMonthPlot(
		openStatsData.filter( x => filterGreaterThanDate(x, lastYear) ), 
		'groupByMonth'
	);

	initGroupByDatePlot(
		openStatsData.filter( x => filterGreaterThanDate(x, lastMonth) ), 
		'groupByDate'
	);

	initGroupByHourPlot(
		openStatsData.filter( x => filterGreaterThanDate(x, last14Days) ),
		'groupByHour'
	);

	initAccumulateByWeekdaysPlot(
		openStatsData.filter( x => filterGreaterThanDate(x, lastMonth) ),
		'accumulatedByWeekday'
	);

	initAccumulateByHoursPlot(
		openStatsData
			.filter( x => filterGreaterThanDate(x, lastMonth) )
			.filter( x => !filterWeekendDays(x) ),
		'accumulatedByDaytimeAtWorkingDays'
	);

	initAccumulateByHoursPlot(
		openStatsData
			.filter( x => filterGreaterThanDate(x, lastMonth) )
			.filter( x => filterWeekendDays(x) ),
		'accumulatedByDaytimeAtWeekend'
	);
}

function loadData(url, onLoadEventHandler) {
	var xreq = new XMLHttpRequest();
	xreq.open("GET", url, true);
	xreq.addEventListener("load", onLoadEventHandler);
	xreq.send();
}


