class ApplicationController < ActionController::API
  include ActionController::RateLimiting
  include Authentication

  rescue_from ActionController::ParameterMissing do
    render_error("Некоректний запит", :bad_request)
  end
end
