console.log(methodGraph);
var CANVAS_PAGE_PERCENTAGE = 0.8; 
var CIRCLE_OUTLINE_WIDTH = 4;
var COLOURS = {endeavour: "#3366E3",
	           solution : "#CC9900",
			   customer : "#3B9F6B"};

var method_graph = methodGraph.method_graph;

function graph_redraw(){

	//Draw the nodes themselves
	for (var id in method_graph){
		var node = method_graph[id];
		ctx.strokeStyle = COLOURS[node.category];
		ctx.lineWidth = CIRCLE_OUTLINE_WIDTH;
		ctx.beginPath();
		ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
		ctx.stroke();

		var d = 1.3*node.r; //Pseudo-diameter adjusted for a little extra space for scaling
		var di = node.r*(1.3)/2.0; //"Inverse" diameter
		ctx.drawImage(document.getElementById(node.category + "_" + node.element),
				      node.x - di, node.y - di,
					  d, d);

	}

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
	ctx = graphcv.getContext("2d");
	origin = {x:0, y:0};
	( window.onresize = graph_resize )();
}

window.addEventListener("load", function(event) {
	console.log("All resources finished loading!");
	initialize_graph();
});
