const CREATE_NODE = "CREATE_NODE";
const NAME_NODE = "NAME_NODE";
const DELETE_NODE = "DELETE_NODE";
const MOVE_NODE = "MOVE_NODE";
const RELATION_MAKER = "RELATION_MAKER";

const MOVE_ORIGIN = "MOVE_ORIGIN";
const RELATION_REMOVER = "RELATION_REMOVER";



var BORDER_THICKNESS = 3;
var CANVAS_WIDTH_PERCENTAGE = 0.91;
var CANVAS_HEIGHT_PERCENTAGE = 0.9;
var CIRCLE_OUTLINE_WIDTH = 2;
var EDGE_WIDTH = 2;
var NAME_BUTT = 6;
var WINGSPAN_ANGLE = 0.2;
var COLOURS = {endeavour: "#3366E3",
	solution : "#CC9900",
	customer : "#3B9F6B",
	black    : "#333333",
	white    : "#FFFFFF"};

var frame_counter = 0;
var mouse_down = 0;
var old_node_name = "";
var old_pos_holder = undefined;

var pseudoid = 0;
function get_new_id(){
	return String(pseudoid++);
}

function slice_element(arr, i){
	if(i !== -1){
		arr.splice(i, 1);
	}
}


var ctool = {
	element: null,
	category: null,
	type: null,
	prev_type: null,
	r: 40,
	mouseX: 0,
	mouseY: 0,
	selected_node: null,
	update: function (param_hash) {
		var dummy = {element: null, category: null, type: null, selected_node: null, r: 40};

		this.prev_type = this.type;
		for(var v in dummy){
			if(param_hash[v] === undefined){
				this[v] = dummy[v];
			}
			else{
				this[v] = param_hash[v];
			}
		}

	},
	move: function (coords){
		this.mouseX = coords.x;
		this.mouseY = coords.y;
	},
	finished_naming_node: function(){
		if(this.selected_node){
			action_stack.NAME_NODE(this.selected_node, old_node_name, this.selected_node.name);	
		}
		if(this.prev_type == CREATE_NODE){
			this.update({element: this.element, category: this.category, type: CREATE_NODE, r: this.r});
		}
		else{
			this.update({type: NAME_NODE, r: this.r});
		}
	}
}

var action_stack = {
	repr: [],
	pointer: 0,
	CREATE_NODE: function(node){
		this.stack_sanity();
		this.repr.push({type: CREATE_NODE, selected_node: node});
	},
	DELETE_NODE: function(node){
		this.stack_sanity();
		this.repr.push({type: DELETE_NODE, selected_node: node});
	},
	MOVE_NODE: function(node, original_position){
		this.stack_sanity();
		this.repr.push({type: MOVE_NODE, selected_node: node, 
			            old_pos: original_position, new_pos: {x: node.x, y: node.y} });
	},
	MOVE_ORIGIN: function(original_origin, new_origin){
		this.stack_sanity();
		this.repr.push({type: MOVE_ORIGIN, old_pos: original_origin, new_pos: new_origin});
	},
	NAME_NODE: function(node, original_name, unoriginal_name){
		this.stack_sanity();
		this.repr.push({type: NAME_NODE, selected_node: node, 
			            old_name: original_name, new_name: unoriginal_name});
	},
	RELATION_MAKER: function(from_node, to_node){
		this.stack_sanity();
		this.repr.push({type: RELATION_MAKER, from: from_node, to: to_node});
	},
	stack_sanity: function(){
		this.repr = this.repr.slice(0, this.pointer);
		this.pointer++;
	},
	undo: function(){
		if(this.pointer == 0){
			return;
		}
		this.pointer--;
		var frame = this.repr[this.pointer];
		switch(frame.type){
			case CREATE_NODE:
				graph_procs.DELETE_NODE(frame.selected_node);
				break;
			case DELETE_NODE:
				graph_procs.CREATE_NODE(frame.selected_node);
				methodGraph.deleted_nodes.pop();
				break;
			case RELATION_MAKER:
				graph_procs.RELATION_REMOVER(frame.from, frame.to);
				break;
			case NAME_NODE:
				frame.selected_node.name = frame.old_name;
				break;
			case MOVE_NODE:
				frame.selected_node.x = frame.old_pos.x;
				frame.selected_node.y = frame.old_pos.y;
				break;
			case MOVE_ORIGIN:
				origin.x = frame.old_pos.x;
				origin.y = frame.old_pos.y;
				break;
			default:
				this.pointer++;

		}
	},
	redo: function(){
		if(this.pointer >= this.repr.length){
			return;
		}
		var frame = this.repr[this.pointer];
		this.pointer++;
		switch(frame.type){
			case CREATE_NODE:
				graph_procs.CREATE_NODE(frame.selected_node);
				break;
			case DELETE_NODE:
				graph_procs.DELETE_NODE(frame.selected_node);
				break;
			case RELATION_MAKER:
				graph_procs.RELATION_MAKER(frame.from, frame.to);
				break;
			case NAME_NODE:
				frame.selected_node.name = frame.new_name;
				break;
			case MOVE_NODE:
				frame.selected_node.x = frame.new_pos.x;
				frame.selected_node.y = frame.new_pos.y;
				break;
			case MOVE_ORIGIN:
				origin.x = frame.new_pos.x;
				origin.y = frame.new_pos.y;
				break;
			default:
				this.pointer--;

		}
	}
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

function get_node_by_coords(coords){
	var potential_nodes = Object.values(method_graph).filter(
			function(node){ 
				return Math.abs(coords.x - node.x - origin.x) <= node.r && 
		Math.abs(coords.y - node.y - origin.y) <= node.r
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


function save_graph(){
	function update_client_on_response(results){
		for(id in results){
			if(!Number.isInteger(parseInt(id))){
				method_graph[id].id = results[id];
				method_graph[results[id]] = method_graph[id];
				delete method_graph[id];
			}
		}
		for(id in method_graph){
			var node = method_graph[id];
			for(var i = 0; i < node.children.length; i++){
				if(!Number.isInteger(parseInt(node.children[i]))){
					node.children[i] = results[node.children[i]];
				}
			}
			for(var i = 0; i < node.parents.length; i++){
				if(!Number.isInteger(parseInt(node.parents[i]))){
					node.parents[i] = results[node.parents[i]];
				}
			}
		}
	}


	$.ajax({
		url: window.location.href + ".json",
	data: JSON.stringify(methodGraph),
	type: "PATCH",
	contentType: "application/json",
	success: update_client_on_response
	});
}

function file_op_selection_effect(){
	var previous_tool = document.querySelector(".last_selected_tool");
	setTimeout(function(){
		var cladd = "last_selected_tool";

		var last = document.querySelector("." + cladd);
		if (last) {
			last.className = last.className.replace(" " + cladd, "");
		}
		previous_tool.className = previous_tool.className + " " + cladd;

	}, 100);
}


function node_renamer(ev){
	var node = ctool.selected_node;
	if(ev.key == "Backspace"){
		node.name = node.name.slice(0, node.name.length - 1);
	}
	else if( RegExp("^[a-zA-Z0-9 ]$").test(ev.key) ){
		node.name += ev.key;
	}
	else if(ev.key == "Enter" ){
		ctool.finished_naming_node();
	}
}

var graph_procs = {
	DELETE_NODE: function(node){
		//First detach all parents and children
		for(var i = 0; i < node.children.length; i++){
			var parent_array = method_graph[node.children[i]].parents;
			var index = parent_array.indexOf(node.id);
			slice_element(parent_array, index);
		}
		for(var i = 0; i < node.parents.length; i++){
			var children_array = method_graph[node.parents[i]].children;
			var index = children_array.indexOf(node.id);
			slice_element(children_array, index);
		}

		//Then update methodGraph.deleted_nodes if found_node.id is numerical AKA in DB
		if(Number.isInteger(node.id)){
			methodGraph.deleted_nodes.push(node.id);
		}

		//Then remove the node itself
		delete method_graph[node.id];
	},
	CREATE_NODE: function(node){
		method_graph[node.id] = node;
		for(var i = 0; i < node.children.length; i++){
			graph_procs.RELATION_MAKER(node, method_graph[node.children[i]]);
		}
		for(var i = 0; i < node.parents.length; i++){
			graph_procs.RELATION_MAKER(method_graph[node.parents[i]], node);
		}
	},
	RELATION_MAKER: function(from, to){
		if(from.id == to.id){
			return;
		}
		if(from.children.indexOf(to.id) < 0){
			from.children.push(to.id);
		}
		if(to.parents.indexOf(from.id) < 0){
			to.parents.push(from.id);
		}
	},
	RELATION_REMOVER: function(from, to){
		if(from.id == to.id){
			return;
		}
		var index = from.children.indexOf(to.id);
		slice_element(from.children, index);

		var index = to.parents.indexOf(from.id);
		slice_element(to.parents, index);
	}


}

var draw_tool_functions = {
	null: function(){},	
	CREATE_NODE: function(ev) {
		var temp = "n" + get_new_id();
		var coords = get_graph_coords(ev.clientX - origin.x, ev.clientY - origin.y);
		var new_node = {name: "", id: temp, element: ctool.element, category: ctool.category,
			children: [], parents: [], r: ctool.r, 
			x: coords.x,
			y: coords.y
		};
		graph_procs.CREATE_NODE(new_node);
		action_stack.CREATE_NODE(new_node);
		ctool.update({element: ctool.element, category: ctool.category, 
			type: NAME_NODE, r: ctool.r, selected_node: method_graph[temp]});
		old_node_name = "";
	},
	NAME_NODE: function(ev) {
		var coords = get_graph_coords(ev.clientX, ev.clientY);
		var found_node = get_node_by_coords(coords);
		if (found_node){
			ctool.update({r: ctool.r, type: NAME_NODE, selected_node: found_node});
			old_node_name = found_node.name;
		}
	},
	DELETE_NODE: function (ev) {
		var coords = get_graph_coords(ev.clientX, ev.clientY);
		var found_node = get_node_by_coords(coords);
		if (found_node){
			action_stack.DELETE_NODE(found_node);
			graph_procs.DELETE_NODE(found_node);
		}
	}
}

function keydown_handler(ev){
	if (ctool.type == NAME_NODE && ctool.selected_node) {
		node_renamer(ev);
	}
}

function onclick_handler(ev) {
	if (ctool.type == NAME_NODE){
		ctool.finished_naming_node();
	}
	else if (ctool.type == RELATION_MAKER || ctool.type == MOVE_NODE){
		return;
	}
	draw_tool_functions[ctool.type](ev);
}



function onmousedown_handler(ev){
	mouse_down++;
	var coords = get_graph_coords(ev.clientX, ev.clientY);
	var found_node = get_node_by_coords(coords);

	if (ctool.type == RELATION_MAKER || ctool.type == MOVE_NODE){
		ctool.update({r: ctool.r, type: ctool.type, selected_node: found_node});

		if(ctool.type == MOVE_NODE && found_node){
			old_pos_holder = {x: found_node.x, y: found_node.y};
		}
		else if(ctool.type == MOVE_NODE){
			old_pos_holder = {x: origin.x, y: origin.y};
		}
	}
}

function onmouseup_handler(ev){
	mouse_down--;
	if (ctool.type == RELATION_MAKER){
		var coords = get_graph_coords(ev.clientX, ev.clientY);
		var found_node = get_node_by_coords(coords);
		if(found_node && ctool.selected_node){
			   graph_procs.RELATION_MAKER(ctool.selected_node, found_node);
			   action_stack.RELATION_MAKER(ctool.selected_node, found_node);
		   }
		ctool.update({r: ctool.r, type: RELATION_MAKER});
	}
	else if(ctool.type == MOVE_NODE){
		if(ctool.selected_node){
			action_stack.MOVE_NODE(ctool.selected_node, old_pos_holder);
		}
		else{
			action_stack.MOVE_ORIGIN(old_pos_holder, {x: origin.x, y: origin.y});
		}
		ctool.update({r: ctool.r, type: MOVE_NODE});
	}
}

function onmousemove_handler(ev){
	if(ev.buttons == 0){
		mouse_down = 0;
	}
	var coords = get_graph_coords(ev.clientX, ev.clientY);
	var deltaX = coords.x - ctool.mouseX;
	var deltaY = coords.y - ctool.mouseY;
	ctool.mouseX = coords.x;
	ctool.mouseY = coords.y;

	if (ctool.type == MOVE_NODE && ctool.selected_node){
		ctool.selected_node.x += deltaX;
		ctool.selected_node.y += deltaY;
	}
	else if (ctool.type == MOVE_NODE && mouse_down > 0){
		origin.x += deltaX;
		origin.y += deltaY;
	}

}



function populate_onclicks(){
	function generate_draw_tooler_function(f){
		return function(){
			//Odd place to fix a NODE_NAME action stack bug...
			if(ctool.type == NAME_NODE){
				ctool.finished_naming_node();
			}

			//Call "main" on_click function spoofing this->tool
			f(this);

			//Manipulate .last_selected_tool for user feedback re. selected_node
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
					var new_element = tool.parentElement.dataset.semat_element;
					var new_category = tool.dataset.semat_category;
					ctool.update({r: ctool.r, type: CREATE_NODE, 
						element: new_element, category: new_category});
				}
				);
	}

	graphcv.onclick = onclick_handler;

	var op_tools = document.querySelectorAll('[data-js="operation_tool"]');
	console.log(op_tools);
	for (var i = 0; i < op_tools.length; i++){
		op_tools[i].onclick = generate_draw_tooler_function(
				function (tool) {
					//Running twice so as to override prev_type as well.
					ctool.update({r: ctool.r, type: tool.dataset.tool_type}); 
					ctool.update({r: ctool.r, type: tool.dataset.tool_type}); 
				}
				);
	}


	function file_onclicker(identificator, func){
		var filer = document.querySelector(identificator);
		if (filer){
			filer.onclick = generate_draw_tooler_function(
					function (tool) {
						func();
						file_op_selection_effect();
					}
					);
		}
	}

	file_onclicker('[data-js="save_method"]',
			function(){
				save_graph();
				//window.location.href = "./";
			});
	file_onclicker('[data-js="new_method"]',
			function(){
				window.location.href = "./new";
			});
	file_onclicker('[data-js="index_method"]',
			function(){
				window.location.href = "./";
			});
	file_onclicker('[data-js="undo_action"]',
			function(){
				action_stack.undo();	
			});
	file_onclicker('[data-js="redo_action"]',
			function(){
				action_stack.redo();
			});

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
		ctx.moveTo(start.x + origin.x, start.y + origin.y);
		ctx.lineTo(end.x + origin.x, end.y + origin.y);
		ctx.stroke();

		//And now the arrow!
		//TODO: Redo this part later to save on translate, rotate etc. by using direct trigonometry?
		//Current solution lifted from chalks.

		var yComp = end.y - start.y;
		var xComp = end.x - start.x;

		var angle = Math.atan2( yComp, xComp );

		ctx.save();
		ctx.beginPath();
		ctx.translate( end.x + origin.x, end.y + origin.y );
		ctx.rotate( angle + 90*Math.PI/180 );
		ctx.moveTo( 0, 0 );
		ctx.lineTo( 8, 12 );
		ctx.lineTo( -8, 12 );
		ctx.closePath();
		ctx.restore();
		ctx.stroke();
		ctx.fill();
	}

	frame_counter += 1;


	//Draw the blank canvas first of all
	ctx.fillStyle = "rgba(255, 255, 255, 1.0)";
	ctx.fillRect(0, 0, graphcv.width, graphcv.height);

	//Draw the origin
	ctx.strokeStyle = COLOURS.black;
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(0, origin.y);
	ctx.lineTo(graphcv.width, origin.y);
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(origin.x, 0);
	ctx.lineTo(origin.x, graphcv.height);
	ctx.stroke();



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

	function draw_node(node){
		ctx.strokeStyle = COLOURS[node.category];
		ctx.fillStyle = COLOURS.white;
		ctx.lineWidth = CIRCLE_OUTLINE_WIDTH;
		ctx.beginPath();
		ctx.arc(node.x + origin.x, node.y + origin.y, node.r, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		var d = 1.3*node.r; //Pseudo-diameter adjusted for a little extra space for scaling
		var di = node.r*(1.3)/2.0; //"Inverse" diameter
		ctx.drawImage(document.getElementById(node.category + "_" + node.element),
				node.x - di + origin.x, node.y - di + origin.y,
				d, d);
	}

	//Draw the nodes themselves
	for (var id in method_graph){
		draw_node(method_graph[id]);
	}

	if(ctool.type == CREATE_NODE || (ctool.type == NAME_NODE && ctool.prev_type == CREATE_NODE)){
		ctx.globalAlpha = 0.4;
		var pseudonode = {x: ctool.mouseX - origin.x, y: ctool.mouseY - origin.y, r: ctool.r,
			element: ctool.element, category: ctool.category};
		/*if(ctool.type == NAME_NODE){
		  pseudonode.element = ctool.prev_element;
		  }*/
		draw_node(pseudonode);
		ctx.globalAlpha = 1.0;
	}


	//Draw the node names
	ctx.font = "16px sans-serif";
	for (var id in method_graph){
		var node = method_graph[id];
		var width = ctx.measureText(node.name).width;

		ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
		ctx.fillRect(node.x - width/2  - NAME_BUTT/2 + origin.x,
				node.y - 1.2*node.r - 14 + origin.y,
				width + NAME_BUTT,
				18);
		ctx.fillStyle = COLOURS.black;
		ctx.fillText(node.name, node.x - width/2 + origin.x, node.y - 1.2*node.r + origin.y);

		//And a box around the input for active naming...
		if (ctool.type == NAME_NODE && ctool.selected_node == node){
			if(frame_counter > 60){
				frame_counter = 0;
			}
			else if(frame_counter < 40){
				ctx.strokeStyle = "rgba(40, 40, 40, 0.6)";
				ctx.strokeRect(node.x - width/2 - NAME_BUTT/2 + origin.x,
						node.y - 1.2*node.r - 14 + origin.y,
						width + NAME_BUTT,
						18);
			}
		}
	}

	//Draw the name of the method
	ctx.font = "32px serif";
	var width = ctx.measureText(methodName).width;
	ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
	ctx.fillRect(4, 4, width, 36);
	ctx.fillStyle = COLOURS.black;
	ctx.fillText(methodName, 4, 32);





	if (ctool.type == RELATION_MAKER && ctool.selected_node){
		ctx.fyllStyle = "rgb(40, 40, 40)";
		ctx.strokeStyle = "rgb(40, 40, 40)";

		var node = ctool.selected_node;
		var end = {x: ctool.mouseX - origin.x, y: ctool.mouseY - origin.y};

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

	graphcv.width = innerWidth*CANVAS_WIDTH_PERCENTAGE - BORDER_THICKNESS;
	graphcv.height = innerHeight*CANVAS_HEIGHT_PERCENTAGE;
	graphcv.style.left = String(innerWidth*(1.0-CANVAS_WIDTH_PERCENTAGE)) + "px";
	graphcv.style.top = String(innerHeight*(1.0-CANVAS_HEIGHT_PERCENTAGE) - BORDER_THICKNESS) + "px";

	graphsb.style.width = graphcv.style.left;
	graphsb.style.height = String(graphcv.height) + "px";
	graphsb.style.top = graphcv.style.top;

	graphfis.style.height = graphcv.style.top;
	graphfis.style.width = String(graphcv.width - 1) + "px";
	graphfis.style.left = graphcv.style.left;

	brandsct.style.width = graphsb.style.width;
	brandsct.style.height = graphfis.style.height;

	graph_redraw();
}

function initialize_graph(){
	graphcnt = document.querySelector('[data-js="graph_canvas_section"]');
	graphsb = document.querySelector('[data-js="graph_tools_section"]');
	graphfis = document.querySelector('[data-js="graph_file_section"]');
	brandsct = document.querySelector('[data-js="branding_section"]');


	ctx = graphcv.getContext("2d");

	populate_onclicks();
	populate_onkeydowns();
	populate_onmousedowns();
	populate_onmouseups();
	populate_onmousemove();

	origin = methodGraph.origin;

	document.querySelector('[data-tool_type=MOVE_NODE]').onclick();

	( window.onresize = graph_resize )();

	draw_loop_ID = window.setInterval(graph_redraw, 1000/30);
}

window.addEventListener("load", function(event) {
	graphcv = document.querySelector('[data-js="graph_canvas"]');
	if (graphcv){
		console.log("All resources finished loading!");
		console.log(methodGraph);
		methodGraph["deleted_nodes"] = [];
		method_graph = methodGraph.method_graph;
		initialize_graph();
	}
})
