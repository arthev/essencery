class EssenceMethodsController < ApplicationController
  before_action :set_essence_method, only: [:show, :edit, :update, :destroy]

  # GET /essence_methods
  # GET /essence_methods.json
  def index
    @essence_methods = EssenceMethod.all
  end

  # GET /essence_methods/1
  # GET /essence_methods/1.json
  def show
	  @essence_graph = Node.where(essence_method: @essence_method)

  end

  # GET /essence_methods/new
  def new
    @essence_method = EssenceMethod.new
  end

  # GET /essence_methods/1/edit
  def edit
  end

  # POST /essence_methods
  # POST /essence_methods.json
  def create
    @essence_method = EssenceMethod.new(essence_method_params)

    respond_to do |format|
      if @essence_method.save
        format.html { redirect_to @essence_method, notice: 'Essence method was successfully created.' }
        format.json { render :show, status: :created, location: @essence_method }
      else
        format.html { render :new }
        format.json { render json: @essence_method.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /essence_methods/1
  # PATCH/PUT /essence_methods/1.json
  def update
	  p "Received the following:"
	  p params["method_graph"]
	  
    #respond_to do |format|
      #if @essence_method.update(essence_method_params)
       # format.html { redirect_to @essence_method, notice: 'Essence method was successfully updated.' }
       # format.json { render :show, status: :ok, location: @essence_method }
      #else
       # format.html { render :edit }
       # format.json { render json: @essence_method.errors, status: :unprocessable_entity }
      #end
    #end
	
  end

  # DELETE /essence_methods/1
  # DELETE /essence_methods/1.json
  def destroy
    @essence_method.destroy
    respond_to do |format|
      format.html { redirect_to essence_methods_url, notice: 'Essence method was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_essence_method
      @essence_method = EssenceMethod.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def essence_method_params
      params.require(:essence_method).permit(:name)
    end
end
