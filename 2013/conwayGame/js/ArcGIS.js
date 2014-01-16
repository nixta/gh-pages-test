dojo.require("esri.map");
dojo.require("esri.tasks.query");
dojo.require("esri.graphic");
dojo.require("esri.layers.graphics");

var countiesCount, map, greenFillSymbol, redFillSymbol, greyFillSymbol;
dojo.ready(init);
function init() {
	map = new esri.Map("map", {
		basemap : "gray",
		center : [-98.58, 39.83],
		zoom : 5
	});
	redFillSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([127, 31, 31]), 2), new dojo.Color([255, 127, 127, 0.4]));
	grayFillSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([127, 127, 127]), 2), new dojo.Color([127, 127, 127, 0.4]));
	dojo.connect(map, "onClick", function getState(mapOnClickEvent) {
		var stateQuery = new esri.tasks.Query();
		stateQuery.geometry = mapOnClickEvent.mapPoint;
		stateQuery.returnGeometry = true;
		stateQuery.outFields = ["ST_ABBREV", "NAME"];
		var stateQueryTask = new esri.tasks.QueryTask("http://services.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_1990-2000_Population_Change/MapServer/4");
		dojo.byId("nextGenerationButton").innerHTML = "Selecting state...";
		stateQueryTask.execute(stateQuery, stateQueryTaskOnComplete);
	});
}

function stateQueryTaskOnComplete(stateFeatureSet) {
	map.setExtent(stateFeatureSet.features[0].geometry.getExtent().expand(1.4), true);
	getCountiesForState(stateFeatureSet.features[0]);
}

function getCountiesForState(stateGraphic) {
	var countyQuery = new esri.tasks.Query();
	countyQuery.where = "ST_ABBREV = '" + stateGraphic.attributes.ST_ABBREV + "'";
	countyQuery.returnGeometry = true;
	countyQuery.outFields = ["ID"];
	var countyQueryTask = new esri.tasks.QueryTask("http://services.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_1990-2000_Population_Change/MapServer/3");
	dojo.byId("nextGenerationButton").innerHTML = stateGraphic.attributes.NAME + " selected. Waiting for counties...";
	countyQueryTask.execute(countyQuery, countyQueryTaskOnComplete);
}

function countyQueryTaskOnComplete(countyFeatureSet) {
	map.graphics.clear();
	dojo.forEach(countyFeatureSet.features, addCounty);
	dojo.byId("nextGenerationButton").innerHTML = "Calculating neighbours...";
	dojo.forEach(map.graphics.graphics, function(primaryCounty) {
		primaryCounty.attributes.neighbours = [];
		dojo.forEach(map.graphics.graphics, function(potentialNeighbour) {
			if (primaryCounty.attributes.id != potentialNeighbour.attributes.id) {
				var extentsIntersection = primaryCounty.geometry.getExtent().intersects(potentialNeighbour.geometry.getExtent());
				if (extentsIntersection)
					dojo.every(primaryCounty.geometry.rings, function(primaryCountyRing) {
						return dojo.every(primaryCountyRing, function(vertexXYArray) {
							var vertex = new esri.geometry.Point(vertexXYArray, map.spatialReference);
							if (extentsIntersection.contains(vertex))
								if (potentialNeighbour.geometry.contains(vertex)) {
									primaryCounty.attributes.neighbours.push("" + potentialNeighbour.attributes.id);
									return false;
								}

							return true;
						});
					});

			}
		});
	});
	dojo.byId("nextGenerationButton").innerHTML = "Click for Next Generation of counties";
}

function addCounty(countyGraphic) {
	var initialCountyStatus = Math.round(Math.random());
	var countyGraphicForMap = new esri.Graphic(countyGraphic.geometry, (initialCountyStatus) ? redFillSymbol : grayFillSymbol, {
		"id" : countyGraphic.attributes.ID,
		"currentStatus" : initialCountyStatus
	});
	map.graphics.add(countyGraphicForMap);
}

function calculateNextStep() {
	dojo.forEach(map.graphics.graphics, function(county) {
		var numberOfActiveNeighBours = getActiveNeighbourCount(county);
		switch(numberOfActiveNeighBours) {
			case 2:
				county.attributes.futureStatus = county.attributes.currentStatus;
				break;
			case 3:
				county.attributes.futureStatus = 1;
				break;
			default:
				county.attributes.futureStatus = 0;

		}
	});
	dojo.forEach(map.graphics.graphics, function(county) {
		county.attributes.currentStatus = county.attributes.futureStatus;
		county.setSymbol((county.attributes.currentStatus == 1) ? redFillSymbol : grayFillSymbol);
	});
}

function getActiveNeighbourCount(county) {
	var numberOfActiveNeighbours = 0;
	dojo.forEach(map.graphics.graphics, function(neighbour) {
		if (neighbour.attributes.id != county.attributes.id)
			if (county.attributes.neighbours.indexOf(neighbour.attributes.id) != -1) {
				numberOfActiveNeighbours += neighbour.attributes.currentStatus;
			}

	});
	return numberOfActiveNeighbours;
}
