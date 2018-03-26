class EssenceMethod < ApplicationRecord
	has_many :nodes, dependent: :destroy





	def as_json(options={})
        raw_nodes = Node.where(essence_method: self)
		node_info = {}
        raw_nodes.each do |n|
			node_info[ n.id ] =
				{
				name: n.name,
				element: n.element,
				category: n.category,
				x: n.x,
				y: n.y,
				r: n.r,
				children: n.children.map{|i| i.id},
				parents: n.parents.map{|i| i.id}
			}
		end

		{method_graph: node_info}.to_json
	end
end
