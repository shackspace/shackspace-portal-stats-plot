/*
 * load portal open stats data and intialize plots
 */
function onLoad() {
	loadData(
		portalOpenStatsURL, 
		function() {
			portalOpenStatsData = JSON.parse(this.responseText);
			initAllPlots(portalOpenStatsData);

			$('#mainTabs').tabs();
			$('#openHoursTabs').tabs();
			$('#accumulatedTabs').tabs();
		}
	);
}

/*
 * This method can be called by the developer while debugging
 * to initialize plots with test data
 */
function loadDebugData() {
	var debugScript = document.createElement("script");
	debugScript.setAttribute("language", "JavaScript");
	debugScript.setAttribute("src", "js/api.shackspace.v1.stats.portal.debugdata.js");

	window.document.head.appendChild(debugScript);
} 


