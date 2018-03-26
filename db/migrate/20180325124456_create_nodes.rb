class CreateNodes < ActiveRecord::Migration[5.1]
  def change
    create_table :nodes do |t|
      t.string :name
      t.string :element
	  t.string :category #customer, solution, endeavour
      t.integer :x
      t.integer :y
      t.integer :r

      t.timestamps
    end
  end
end
