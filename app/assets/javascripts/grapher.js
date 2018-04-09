console.log(methodGraph);
var CANVAS_PAGE_PERCENTAGE = 0.8; 


function graph_redraw(){



}

function graph_resize(){
	graphcv.width = innerWidth*CANVAS_PAGE_PERCENTAGE;
	graphcv.height = innerHeight*CANVAS_PAGE_PERCENTAGE;
	graphcv.style.left = String(innerWidth*(1.0-CANVAS_PAGE_PERCENTAGE)/2) + "px";
	graphcv.style.position = "absolute";
	graph_redraw();
}

function initialize_graph(){
	graphcv = document.getElementById("graph_canvas");
	graphcnt = document.getElementById("graph_canvas_container");
	origin = {x:0, y:0};
	( window.onresize = graph_resize )();
}

window.addEventListener("load", function(event) {
	console.log("All resources finished loading!");
	initialize_graph();
});
