class OrderMailer < ApplicationMailer
  STATUS_LABEL = {
    "pending_payment" => "Очікує оплати",
    "processing" => "В обробці",
    "paid" => "Оплачено",
    "shipped" => "Відправлено",
    "delivered" => "Доставлено",
    "cancelled" => "Скасовано"
  }.freeze

  STATUS_NOTE = {
    "paid" => "Дякуємо за оплату! Ми передаємо замовлення на комплектацію.",
    "shipped" => "Замовлення передано на доставку.",
    "delivered" => "Замовлення доставлено. Дякуємо, що обрали ТехноДім!",
    "cancelled" => "Замовлення скасовано, товари повернуто на склад."
  }.freeze

  DELIVERY_LABEL = {
    "courier" => "Кур'єр за адресою",
    "carrier_branch" => "Відділення служби доставки",
    "pickup" => "Самовивіз"
  }.freeze

  PAYMENT_LABEL = {
    "card_online" => "Карткою онлайн",
    "cash_on_delivery" => "При отриманні",
    "installments" => "Оплата частинами"
  }.freeze

  helper_method :money, :status_label, :delivery_label, :payment_label

  # Покупець щойно оформив замовлення
  def confirmation(order)
    @order = order
    @account_url = "#{frontend_url}/account"
    mail to: order.email, subject: "Замовлення №#{order.id} прийнято — ТехноДім"
  end

  # Змінився статус (оплачено, відправлено, доставлено, скасовано)
  def status_changed(order)
    @order = order
    @account_url = "#{frontend_url}/account"
    @note = STATUS_NOTE[order.status]
    mail to: order.email, subject: "Замовлення №#{order.id}: #{status_label(order.status).downcase} — ТехноДім"
  end

  private

  def money(value)
    "#{ActiveSupport::NumberHelper.number_to_delimited(value.to_d.round(2).to_s('F').sub(/\.0+\z/, ''), delimiter: ' ')} грн"
  end

  def status_label(status) = STATUS_LABEL.fetch(status, status)
  def delivery_label(method) = DELIVERY_LABEL.fetch(method, method)
  def payment_label(method) = PAYMENT_LABEL.fetch(method, method)
end
