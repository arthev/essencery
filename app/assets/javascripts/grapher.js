
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


var pseudoid = 0;
function get_new_id(){
	return String(pseudoid++);
}



function get_graphcv_left(){
	return graphcv.getBoundingClientRect().left;
}

function get_graphcv_top(){
	return graphcv.getBoundingClientRect().top;
}


function save_graph(){
	$.ajax({
		url: window.location.href + ".json",
		data: JSON.stringify(methodGraph),
		type: "PATCH",
		contentType: "application/json",
	});
	return "heh"
}


function node_renamer_gen(node_id){
	return function(ev){
		var node = method_graph[node_id];
		console.log("didgeridoo!! : " + node_id);
		console.log(ev);
		if (ev.key == "Backspace") {
			console.log("BACKSPACE MOTHERFUCKER");
			node.name = node.name.slice(0, node.name.length - 1);
		}
		else if( RegExp("^[a-zA-Z0-9 ]$").test(ev.key) ){
			node.name = node.name + ev.key;
		}
		else if( ev.key == "Enter" ){
			ctool.func = null;
			ctool.type = ctool.prev_type;
		}
	}
}

draw_tool_functions = {
	null: function(){},	
	"create_node": function (ev) {
		var temp = "n" + get_new_id();
		method_graph[temp] = {name: "", element: ctool.element, category: ctool.category,
			children: [], parents: [], r: ctool.r, 
			x: Math.round(ev.clientX - get_graphcv_left()),
			y: Math.round(ev.clientY - get_graphcv_top())
		};
		ctool.prev_type = ctool.type;
		ctool.type = "name_node";
		ctool.func = node_renamer_gen(temp);
	} 
}

function keydown_handler(ev){
	if (ctool.type == "name_node") {
		ctool.func(ev);
	}
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

			//Manipulate .last_selected_tool for user feedback re. selection
			var cladd = "last_selected_tool";
			var last = document.querySelector("." + cladd);
			if (last) {
				last.className = last.className.replace(" " + cladd, "");
			}
			this.className = this.className + " " + cladd;
		};
	}
	graphcv.onclick = function(ev) {
		if (ctool.type == "name_node" && ctool.prev_type == "create_node"){
			ctool.type = "create_node";
			ctool.func = null;
		}
		draw_tool_functions[ctool.type](ev);
	};
}

function populate_onkeydowns(){
	window.onkeydown = keydown_handler;
}




function graph_redraw(){
	//Draw the blank canvas first of all
	ctx.fillStyle = "rgba(255, 255, 255, 1.0)";
	ctx.fillRect(0, 0, graphcv.width, graphcv.height);


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
			ctx.fillStyle = "rgb(0, 0, 0)";

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
	//graphcv.style.left = String(get_graphcv_left()) + "px";
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

	ctool = {element: null, category: null, type: null, prev_type: null, func: null, r: 40}
	populate_onclicks();
	populate_onkeydowns();


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
