class EssenceMethod < ApplicationRecord
	has_many :nodes, dependent: :destroy
end
