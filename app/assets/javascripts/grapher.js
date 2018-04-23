
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
function get_graph_coords(xi, yi){
	return {x: Math.round(xi - get_graphcv_left()),
		y: Math.round(yi - get_graphcv_top())
	}
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
		if (ev.key == "Backspace") {
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
		var coords = get_graph_coords(ev.clientX, ev.clientY);
		method_graph[temp] = {name: "", id: temp, element: ctool.element, category: ctool.category,
			children: [], parents: [], r: ctool.r, 
			x: coords.x,
			y: coords.y
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

function onclick_handler(ev) {
	if (ctool.type == "name_node" && ctool.prev_type == "create_node"){
		ctool.type = "create_node";
		ctool.func = null;
	}
	else if (ctool.type == "relation_maker"){
		return;
	}
	draw_tool_functions[ctool.type](ev);
}

function get_node_by_coords(coords){
	var potential_nodes = Object.values(method_graph).filter(
			function(node){ 
				return Math.abs(coords.x - node.x) <= node.r && 
		Math.abs(coords.y - node.y) <= node.r
			}
			)
	if(potential_nodes.length == 0){
		return null;
	}
	return potential_nodes.reduce( function(prev, curr){
		return prev.r <= curr.r ? prev : curr;
	}
	);
}

function onmousedown_handler(ev){
	if (ctool.type == "relation_maker"){
		var coords = get_graph_coords(ev.clientX, ev.clientY);
		var found_node = get_node_by_coords(coords);
		if (found_node){
			ctool.element = found_node;
		}
		else {
			ctool.element = null;
		}
	}
}

function onmouseup_handler(ev){
	if (ctool.type == "relation_maker"){
		var coords = get_graph_coords(ev.clientX, ev.clientY);
		var found_node = get_node_by_coords(coords);
		if ( (found_node && ctool.element) &&
				(found_node.id != ctool.element.id) &&
				(ctool.element.children.indexOf(found_node.id) < 0) 
		   ){
			   ctool.element.children.push(found_node.id);
		   }
		ctool.element = null;
	}
}

function onmousemove_handler(ev){
	var coords = get_graph_coords(ev.clientX, ev.clientY);
	ctool.mouseX = coords.x;
	ctool.mouseY = coords.y;
}






function populate_onclicks(){
	function generate_draw_tooler_function(f){
		return function(){
			//Call "main" on_click function spoofing this->tool
			f(this);

			//Manipulate .last_selected_tool for user feedback re. selection
			var cladd = "last_selected_tool";
			var last = document.querySelector("." + cladd);
			if (last) {
				last.className = last.className.replace(" " + cladd, "");
			}
			this.className = this.className + " " + cladd;
		};
	}

	var tools = document.querySelectorAll('[data-js="node_tool"]');
	for (var i = 0; i < tools.length; i++){
		tools[i].onclick = generate_draw_tooler_function( 
				function (tool) { 
					ctool.element = tool.parentElement.dataset.semat_element;
					ctool.category = tool.dataset.semat_category;
					ctool.type = "create_node";
				}
				);
	}

	graphcv.onclick = onclick_handler;

	var op_tools = document.querySelectorAll('[data-js="operation_tool"]');
	console.log(op_tools);
	for (var i = 0; i < op_tools.length; i++){
		op_tools[i].onclick = generate_draw_tooler_function(
				function (tool) {
					ctool.type = tool.dataset.tool_type;
					ctool.element = null;

				}
				);
	}
}

function populate_onkeydowns(){
	window.onkeydown = keydown_handler;
}
function populate_onmousedowns(){
	graphcv.onmousedown = onmousedown_handler;
}
function populate_onmouseups(){
	graphcv.onmouseup = onmouseup_handler;
}
function populate_onmousemove(){
	graphcv.onmousemove = onmousemove_handler;
}




function graph_redraw(){
	function draw_arrow(start, end){
		ctx.beginPath();
		ctx.moveTo(start.x, start.y);
		ctx.lineTo(end.x, end.y);
		ctx.stroke();

		//And now the arrow!
		//TODO: Redo this part later to save on translate, rotate etc. by using direct trigonometry?
		//Current solution lifted from chalks.

		var yComp = end.y - start.y;
		var xComp = end.x - start.x;

		var angle = Math.atan2( yComp, xComp );

		ctx.save();
		ctx.beginPath();
		ctx.translate( end.x, end.y );
		ctx.rotate( angle + 90*Math.PI/180 );
		ctx.moveTo( 0, 0 );
		ctx.lineTo( 8, 12 );
		ctx.lineTo( -8, 12 );
		ctx.closePath();
		ctx.restore();
		ctx.stroke();
		ctx.fill();
	}


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

			ctx.fillStyle = "rgb(40, 40, 40)";
			ctx.strokeStyle = "rgb(40, 40, 40)";

			var yComp = child.y - node.y;
			var xComp = child.x - node.x;

			var angle = Math.atan2( yComp, xComp );

			// Arrow right at the edge of the circle.
			var yPoint = child.y - ( EDGE_WIDTH + child.r ) * Math.sin( angle );
			var xPoint = child.x - ( EDGE_WIDTH + child.r ) * Math.cos( angle );

			var start = {x: node.x, y: node.y};
			var end = {x: xPoint, y: yPoint};

			draw_arrow(start, end);
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

	/*Draw a box to draw user attention if currently renaming a node?
	  if (ctool.type == "name_node"){
	//TODO


	}*/

	if (ctool.type == "relation_maker" && ctool.element){
		ctx.fyllStyle = "rgb(40, 40, 40)";
		ctx.strokeStyle = "rgb(40, 40, 40)";

		var node = ctool.element;
		var end = {x: ctool.mouseX, y: ctool.mouseY};

		var yComp = end.y - node.y;
		var xComp = end.x - node.x;

		var angle = Math.atan2( yComp, xComp );
		// Line starting right at the edge of the node, hehe
		var yPoint = node.y + ( EDGE_WIDTH + node.r ) * Math.sin( angle );
		var xPoint = node.x + ( EDGE_WIDTH + node.r ) * Math.cos( angle );

		var start = {x: xPoint, y: yPoint};
		draw_arrow(start, end);
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

	ctool = {element: null, category: null, type: null, prev_type: null, 
			func: null, r: 40, mouseX: 0, mouseY: 0}
	populate_onclicks();
	populate_onkeydowns();
	populate_onmousedowns();
	populate_onmouseups();
	populate_onmousemove();


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
