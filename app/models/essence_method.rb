class EssenceMethod < ApplicationRecord
	has_many :nodes, dependent: :destroy





	def as_json(options={})
        raw_nodes = Node.where(essence_method: self)
		node_info = {}
        raw_nodes.each do |n|
			node_info[ n.id ] =
				{
				name: n.name,
				id: n.id,
				element: n.element,
				category: n.category,
				x: n.x,
				y: n.y,
				r: n.r,
				children: n.children.map{|i| i.id},
				parents: n.parents.map{|i| i.id}
			}
		end

		{method_graph: node_info, origin: {x: self.x, y: self.y}}.to_json
	end

	def update_model(received_data)
		p "Here's the inside of update_model:"
		p self.id
		received_graph = received_data["method_graph"]
		deleted_nodes = received_data["deleted_nodes"]

		pseudo_id_transforms = {}
		new_nodes = {}

		#TODO: Add data sanity (incl. children-parent cohesivity?)



		self.update_attributes(received_data["origin"])

		deleted_nodes.each { |nid| 
			numeralized = Integer(nid) rescue false
			if numeralized
				Node.find_by(id: nid).destroy
			else
				raise "Bad data received in deleted_nodes" + deleted_nodes.to_s
			end
		}


		#Assuming data is sane
		#Pass to "parse" ids
		received_graph.keys.each {|nk|
			numeralized = Integer(nk) rescue false
			if numeralized
				p "currently in numeralized"
				p numeralized
				#byebug
				pseudo_id_transforms[nk] = numeralized
			else
				nn = Node.new()
				nn.essence_method = self
				nn.save!
				pseudo_id_transforms[nk] = nn.id
				new_nodes[nn.id] = nn
			end
		}
		#Pass to actually update the real nodes
		received_graph.keys.each {|nk|
			rk = pseudo_id_transforms[nk]

			rn = new_nodes[rk] || Node.find_by(id: rk) #real_node
			pn = received_graph[nk] #pseudo_nose
			
			[:category, :element, :name, :r, :x, :y].each {|f|
				rn[f] = pn[f]
			}

			keyified_children = pn[:children].map {|c| pseudo_id_transforms[c.to_s]}
			p "KEYCHILDS"
			p keyified_children
			#keyified_parents = pn[:parents].map {|p| pseudo_id_transforms[p.to_s]}
			des_map = keyified_children.map {|i| Node.find_by(id: i) }
			p "des_map"
			p des_map
			rn.children = des_map
			rn.save!
		}
		return :ok
	end
end
