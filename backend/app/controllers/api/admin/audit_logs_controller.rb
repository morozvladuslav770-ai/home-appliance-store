# Журнал аудиту бачить лише адміністратор
class Api::Admin::AuditLogsController < ApplicationController
  before_action :require_admin!

  def index
    logs = AuditLog.includes(:user).order(created_at: :desc, id: :desc).limit(200)

    render json: logs.map { |log|
      {
        id: log.id,
        action: log.action,
        summary: log.summary,
        details: log.details,
        actor: log.user&.full_name,
        actor_role: log.user&.role,
        created_at: log.created_at
      }
    }
  end
end
