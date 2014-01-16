var endpoint =
"http://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/2";
dojo.require("esri.map");dojo.require("esri.layers.FeatureLayer");
dojo.require("esri.tasks.query");dojo.require("esri.dijit.Popup");
var queryTaskQuestions, queryQuestions,statelist=[],starting = true;
var lookforattribute = "state_name",placetofind = -1,numberfound = 0;
var map, mistakes=0,Where="";
function init(){
 //Add map
 map = new esri.Map("mapDiv", {center: [-95.625, 39.243],zoom: 4,
  basemap: "satellite"});	     
 dojo.connect(map, "onMouseMove", function(evt){
   //get mapPoint from event and display the mouse coordinates
   map.infoWindow.hide();
 });
 }
function initFunctionality(newpoints) {
var e = document.getElementById("WhatToSelect");
e= e.options[e.selectedIndex].value;
endpoint=e.split(',')[0];
lookforattribute=e.split(',')[1];
Where=e.split(',')[2];
map.centerAndZoom(eval(e.split(',')[3].replace(':',',')),e.split(',')[4]);
if ( Where == '') Where = "1=1";
 //build query
 queryTaskQuestions = new esri.tasks.QueryTask(endpoint);
 //build query filter
 queryQuestions = new esri.tasks.Query();
 queryQuestions.returnGeometry = false;
 queryQuestions.where = Where;
 queryQuestions.outFields = [lookforattribute];
 queryTaskQuestions.execute(queryQuestions, showResults);
 start.style.display="none";infospace.style.display='';
 starting = true;
 //build query task
 var queryTask = new esri.tasks.QueryTask(endpoint);
 //build query filter
 var query = new esri.tasks.Query();
 query.returnGeometry = true;
 query.outFields = [lookforattribute];
 query.where = Where;
 query.outSpatialReference = {"wkid":102100};
 var infoTemplate = new esri.InfoTemplate();
 infoTemplate.setTitle("${NAME}");
 infoTemplate.setContent( contentgetter);
 map.infoWindow.resize(245,105);
 //Can listen for onComplete event to process results or can use the 
 //callback option in the queryTask.execute method.
 dojo.connect(queryTask, "onComplete", function(featureSet) {
  map.graphics.clear();
  var symbol = new esri.symbol.SimpleFillSymbol(
   esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(
    esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255,255,255,0.35]
	), 1),new dojo.Color([125,125,125,0.35]));
  //QueryTask returns a featureSet.  
  //Loop through features in the featureSet and add them to the map.
  dojo.forEach(featureSet.features,function(feature){
	var graphic = feature;
	graphic.setSymbol(symbol);
	graphic.setInfoTemplate(infoTemplate);
	graphic.getContent(contentgetter(graphic));
	map.graphics.add(graphic);
  });
  starting = false;
 });
 queryTask.execute(query);
}
function contentgetter(input){
if (starting) return "";if ( placetofind == -1 ) 
 return userMessage.innerHTML="You found them all";
if ( input.attributes[lookforattribute] == statelist[placetofind] ) {
	numberfound++; {statelist.remove(placetofind);nextPlaceToFind();
	return userMessage.innerHTML=
	 ('<B style="color:Green">Awesome, you remembered!</B>');}
 }
 mistakes++;mistake.innerHTML = mistakes;
 return userMessage.innerHTML="<B style='color:red'>"+
 (input.attributes[lookforattribute]+" is not "+statelist[placetofind])+"</B>";
}      
function showResults(results) {
var s = "";
for (var i=0, il=results.features.length; i<il; i++) {
  var featureAttributes = results.features[i].attributes;
  statelist[statelist.length] = featureAttributes[lookforattribute];
}
nextPlaceToFind();
}
function nextPlaceToFind() {
if ( statelist.length == 0 ) 
{placetofind=-1; nametofind.innerHTML = "Nothing, you found them all!"; return}
placetofind = (Math.floor(Math.random() * statelist.length));
togo.innerHTML = (statelist.length); found.innerHTML = numberfound;
nametofind.innerHTML = statelist[placetofind];
}
// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};
dojo.ready(init);