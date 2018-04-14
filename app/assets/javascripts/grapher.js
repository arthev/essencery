
var CANVAS_PAGE_PERCENTAGE = 0.9; 
var CIRCLE_OUTLINE_WIDTH = 2;
var EDGE_WIDTH = 2;
var NAME_BUTT = 6;
var WINGSPAN_ANGLE = 0.2;
var COLOURS = {endeavour: "#3366E3",
	solution : "#CC9900",
	customer : "#3B9F6B",
	black    : "#333333",
	white    : "#FFFFFF"};


function save_graph(){
	$.ajax({
		url: window.location.href + ".json",
		data: JSON.stringify(methodGraph),
		type: "PATCH",
		contentType: "application/json",
		});

	return "heh"
}








function populate_onclicks(){
	var tools = document.querySelectorAll('[data-js="node_tool"]');
	console.log(tools);
	for (var i = 0; i < tools.length; i++){
		tools[i].onclick = function () { 
			//console.log(this.dataset.semat_category); 
			//console.log(this.parentElement);
			ctool.element = this.parentElement.dataset.semat_element;
			ctool.category = this.dataset.semat_category;
			ctool.type = "create_node";
		
		};

	}

}

function graph_redraw(){
	//Draw the parent->child edges
	ctx.strokeStyle = COLOURS.black;
	ctx.lineWidth = EDGE_WIDTH; 
	for (var id in method_graph){
		var node = method_graph[id];
		for (var child_id in node.children){
			var child = method_graph[node.children[child_id]];

			ctx.beginPath();
			ctx.moveTo(node.x, node.y);
			ctx.lineTo(child.x, child.y);
			ctx.stroke();

			//And now for the arrows...
			//TODO: Redo this part later to save on translate, rotate etc. by using direct trigonometry?
			//Current solution lifted from chalks.
			var yComp = child.y - node.y;
			var xComp = child.x - node.x;

			var angle = Math.atan2( yComp, xComp );

			// Arrow right at the edge of the circle.
			var yPoint = child.y - ( EDGE_WIDTH + child.r ) * Math.sin( angle );
			var xPoint = child.x - ( EDGE_WIDTH + child.r ) * Math.cos( angle );

			ctx.save();
			ctx.beginPath();
			ctx.translate( xPoint, yPoint );
			ctx.rotate( angle + 90*Math.PI/180 );
			ctx.moveTo( 0, 0 );
			ctx.lineTo( 8, 12 );
			ctx.lineTo( -8, 12 );
			ctx.closePath();
			ctx.restore();
			ctx.stroke();
			ctx.fill();
		}
	}

	//Draw the nodes themselves
	for (var id in method_graph){
		var node = method_graph[id];
		ctx.strokeStyle = COLOURS[node.category];
		ctx.fillStyle = COLOURS.white;
		ctx.lineWidth = CIRCLE_OUTLINE_WIDTH;
		ctx.beginPath();
		ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		var d = 1.3*node.r; //Pseudo-diameter adjusted for a little extra space for scaling
		var di = node.r*(1.3)/2.0; //"Inverse" diameter
		ctx.drawImage(document.getElementById(node.category + "_" + node.element),
				node.x - di, node.y - di,
				d, d);
	}


	//Draw the node names
	ctx.font = "16px sans-serif";
	for (var id in method_graph){
		var node = method_graph[id];
		var width = ctx.measureText(node.name).width;

		ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
		ctx.fillRect(node.x - width/2  - NAME_BUTT/2,
				node.y - 1.2*node.r - 14,
				width + NAME_BUTT,
				18);
		ctx.fillStyle = COLOURS.black;
		ctx.fillText(node.name, node.x - width/2, node.y - 1.2*node.r);
	}
}

function graph_resize(){
	graphcv.width = innerWidth*CANVAS_PAGE_PERCENTAGE;
	graphcv.height = innerHeight*CANVAS_PAGE_PERCENTAGE;
	graphcv.style.left = String(innerWidth*(1.0-CANVAS_PAGE_PERCENTAGE)/1.25) + "px";

	graphsb.style.width = graphcv.style.left;
	graphsb.style.height = String(graphcv.height) + "px";

	graph_redraw();
}

function initialize_graph(){
	graphcnt = document.querySelector('[data-js="graph_canvas_section"]');
	graphsb = document.querySelector('[data-js="graph_tools_section"]');

	ctx = graphcv.getContext("2d");
	origin = {x:0, y:0};

	ctool = {element: null, category: null, type: null}
	populate_onclicks();


	( window.onresize = graph_resize )();
	draw_loop_ID = window.setInterval(graph_redraw, 1000/30);
}

window.addEventListener("load", function(event) {
	graphcv = document.querySelector('[data-js="graph_canvas"]');
	if (graphcv){
		console.log("All resources finished loading!");
		console.log(methodGraph);
		method_graph = methodGraph.method_graph;
		initialize_graph();
	}
})
