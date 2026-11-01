# Спільна база адмін-контролерів: доступ мають менеджер і адміністратор
class Api::Admin::BaseController < ApplicationController
  before_action :require_staff!

  private

  def validation_errors(record)
    render json: { errors: record.errors.to_hash }, status: :unprocessable_entity
  end
end
