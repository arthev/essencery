module EssenceMethodsHelper

	def concat_all_essence_image_tags
		categories = ["endeavour", "solution", "customer"]
		elements = ["alpha"]

		categories.each {|c|
			elements.each {|e|
				concat(image_tag(c + "_" + e + ".png", id: c + "_" + e))
			}
		}
	end
end
