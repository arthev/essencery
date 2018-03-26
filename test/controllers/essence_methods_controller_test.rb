require 'test_helper'

class EssenceMethodsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @essence_method = essence_methods(:one)
  end

  test "should get index" do
    get essence_methods_url
    assert_response :success
  end

  test "should get new" do
    get new_essence_method_url
    assert_response :success
  end

  test "should create essence_method" do
    assert_difference('EssenceMethod.count') do
      post essence_methods_url, params: { essence_method: { name: @essence_method.name } }
    end

    assert_redirected_to essence_method_url(EssenceMethod.last)
  end

  test "should show essence_method" do
    get essence_method_url(@essence_method)
    assert_response :success
  end

  test "should get edit" do
    get edit_essence_method_url(@essence_method)
    assert_response :success
  end

  test "should update essence_method" do
    patch essence_method_url(@essence_method), params: { essence_method: { name: @essence_method.name } }
    assert_redirected_to essence_method_url(@essence_method)
  end

  test "should destroy essence_method" do
    assert_difference('EssenceMethod.count', -1) do
      delete essence_method_url(@essence_method)
    end

    assert_redirected_to essence_methods_url
  end
end
