class Node < ApplicationRecord
	has_many :parent_edges,
		class_name: 'Edge',
		foreign_key: :child_id

	has_many :parents,
		through: :parent_edges,
		source: :parent

	has_many :child_edges,
		class_name: "Edge",
		foreign_key: :parent_id

	has_many :children,
		through: :child_edges,
		source: :child
end
