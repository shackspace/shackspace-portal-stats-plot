/*
 * load portal open stats data and intialize plots
 */
function onLoadPortalStatsPlot(event) {
	loadData(
		portalOpenStatsURL, 
		function() {
			portalOpenStatsData = JSON.parse(this.responseText);
			initAllPlots(portalOpenStatsData);

			$('#mainTabs').tabs();
			$('#openHoursTabs').tabs();
			$('#accumulatedTabs').tabs();

			var eventSource = event.currentTarget;
			eventSource.dispatchEvent( new CustomEvent('portal-stats-initialized') );
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

window.addEventListener("load", onLoadPortalStatsPlot);
