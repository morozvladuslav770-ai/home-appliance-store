Rails.application.routes.draw do
  namespace :api do
    resources :products, only: [ :index, :show ] do
      get :facets, on: :collection
    end
  end
end
