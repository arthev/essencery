CATEGORIES = ["customer", "solution", "endeavour"].freeze
ELEMENTS   = ["alpha", "activity", "activity_space", "competency", "pattern", "role", "work_product"].freeze

COLOURS = {"customer" => "#3B9F6B", 
		   "solution" => "#CC9900",
		   "endeavour" => "#3366E3"}.freeze

OP_TOOLS = {"MOVE_NODE" => {image: "move_symbol.png",
				            title: "Move a node."},
			"RELATION_MAKER" => {image: "relation_symbol.png",
								 title: "Make relations between nodes."},
			"DELETE_NODE" => {image: "trash_symbol.png",
					          title: "Delete a node."}
}

FILE_TOOLS = {"save_method" => {image: "save_symbol.png",
								title: "Save the method to the cloud."},
			 "new_method" =>  {image: "new_symbol.png",
					            title: "Make a new method."},
			 "undo_action" => {image: "undo_symbol.png",
					            title: "Undo the last action."},
			 "redo_action" => {image: "redo_symbol.png",
					            title: "Redo the last action (if undone)."},
			 "index_method" => {image: "index_symbol.png",
					            title: "Return to the index of the methods."}
}
