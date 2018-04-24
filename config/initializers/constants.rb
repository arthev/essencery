CATEGORIES = ["customer", "solution", "endeavour"].freeze
ELEMENTS   = ["alpha", "activity", "work_product", "role", "competency", "pattern"].freeze

COLOURS = {"customer" => "#3B9F6B", 
		   "solution" => "#CC9900",
		   "endeavour" => "#3366E3"}.freeze

OP_TOOLS = {"relation_maker" => {image: "relation_symbol.png",
								 title: "Make relations between nodes."},
			"name_node" => {image: "rename_symbol.png",
				            title: "Rename a node."},
			"move_node" => {image: "move_symbol.png",
				            title: "Move a node."},
			"delete_node" => {image: "trash_symbol.png",
					          title: "Delete a node."}
}

FILE_TOOLS = {"save_button" => {image: "save_symbol.png",
								title: "save current graph."}}
