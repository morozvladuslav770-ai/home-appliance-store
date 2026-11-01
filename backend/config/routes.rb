Rails.application.routes.draw do
  namespace :api do
    resources :products, only: [ :index, :show ] do
      get :facets, on: :collection
    end

    resources :categories, only: [ :index ]

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
      resources :products, only: [ :index, :create, :update, :destroy ]
      resources :categories, only: [ :index, :create, :update, :destroy ]
      resources :orders, only: [ :index, :update ]
      resources :audit_logs, only: [ :index ]
    end
  end
end
