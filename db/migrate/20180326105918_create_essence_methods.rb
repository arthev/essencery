class CreateEssenceMethods < ActiveRecord::Migration[5.1]
  def change
    create_table :essence_methods do |t|
      t.string :name
	  t.integer :x, default: 0
	  t.integer :y, default: 0

      t.timestamps
    end

	add_reference :nodes, :essence_method, index: true, foreign_key: true
  end
end
