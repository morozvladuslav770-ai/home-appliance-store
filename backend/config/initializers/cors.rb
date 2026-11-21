# Дозволені frontend-домени задаються через CORS_ORIGINS (список через кому).
# Локальна адреса використовується за замовчуванням для розробки.
allowed_origins = ENV.fetch("CORS_ORIGINS", "http://localhost:5173")
                       .split(",")
                       .map(&:strip)
                       .reject(&:blank?)

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins(*allowed_origins)

    resource "/api/*",
      headers: :any,
      methods: %i[get post put patch delete options head]
  end
end
