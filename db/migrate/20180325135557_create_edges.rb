class CreateEdges < ActiveRecord::Migration[5.1]
  def change
    create_table :edges do |t|
    end

	add_reference :edges, :parent, index: true, foreign_key: true
	add_reference :edges, :child, index: true, foreign_key: true

  end
end
