require "test_helper"

class Api::CategoriesControllerTest < ActionDispatch::IntegrationTest
  test "публічний список категорій у заданому порядку" do
    get api_categories_url
    assert_response :success
    names = response.parsed_body.map { |c| c["name"] }
    assert_equal 7, names.size
    assert_equal "Холодильники", names.first
  end
end
