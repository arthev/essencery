# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)
AR = EssenceMethod.create({name: "Agile Retrospective Essentials"})

improvement = Node.create({name: "Improvement",
						   icon: "alpha",
						   category: "endeavour",
						   x: 50,
						   y: 50,
						   r: 20,
						   essence_method: AR})
wayofworking = Node.create({name: "Way of Working",
							icon: "alpha",
							category: "endeavour",
							x: 80, 
							y: 80,
							r: 20,
							essence_method: AR})
