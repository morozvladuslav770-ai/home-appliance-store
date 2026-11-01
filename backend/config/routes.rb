Rails.application.routes.draw do
  namespace :api do
    resources :products, only: [ :index, :show ] do
      get :facets, on: :collection
    end

    resources :orders, only: [ :index, :create ] do
      patch :cancel, on: :member
    end

    resource :registration, only: [ :create ]
    resource :session, only: [ :show, :create ]
    post "confirmation", to: "confirmations#create"
    post "confirmation/resend", to: "confirmations#resend"
    resource :password_reset, only: [ :create, :update ]

    namespace :admin do
      resources :users, only: [ :index, :update ]
    end
  end
end
