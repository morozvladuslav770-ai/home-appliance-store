class AuditLog < ApplicationRecord
  belongs_to :user, optional: true

  validates :action, presence: true

  # AuditLog.record(current_user, "product.update", product, summary: product.name, details: { changes: {...} })
  def self.record(actor, action, subject = nil, summary: nil, details: {})
    create!(
      user: actor,
      action: action,
      subject_type: subject&.class&.name,
      subject_id: subject&.id,
      summary: summary,
      details: details
    )
  end
end
