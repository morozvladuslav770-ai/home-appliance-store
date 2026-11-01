class Api::OrdersController < ApplicationController
  before_action :authenticate! # оформлення й історія — лише для зареєстрованих покупців

  # GET /api/orders — історія замовлень поточного користувача (FR-4.9)
  def index
    orders = current_user.orders.includes(:order_items).order(created_at: :desc, id: :desc)
    render json: orders.map { |order| serialize(order) }
  end

  # POST /api/orders
  # { order: { customer_name, email, phone, city, delivery_method, address,
  #            payment_method, comment }, items: [{ product_id, quantity }] }
  def create
    order = Order.place(order_params.merge(user_id: current_user.id), items_params)

    if order.persisted?
      render json: serialize(order), status: :created
    else
      render json: { errors: order.errors.to_hash }, status: :unprocessable_entity
    end
  end

  # PATCH /api/orders/:id/cancel — скасування протягом обмеженого часу (FR-4.9)
  def cancel
    order = current_user.orders.find(params[:id])

    if order.cancel!
      render json: serialize(order.reload)
    else
      render_error("Це замовлення вже не можна скасувати", :unprocessable_entity)
    end
  end

  private

  def order_params
    params.require(:order).permit(
      :customer_name, :email, :phone, :city, :delivery_method,
      :address, :payment_method, :comment
    )
  end

  def items_params
    params.permit(items: [ :product_id, :quantity ]).fetch(:items, [])
  end

  def serialize(order)
    {
      id: order.id,
      status: order.status,
      total: order.total,
      customer_name: order.customer_name,
      email: order.email,
      city: order.city,
      address: order.address,
      delivery_method: order.delivery_method,
      payment_method: order.payment_method,
      created_at: order.created_at,
      cancellable: order.cancellable?,
      items: order.order_items.map do |item|
        {
          product_id: item.product_id,
          name: item.name,
          sku: item.sku,
          unit_price: item.unit_price,
          quantity: item.quantity
        }
      end
    }
  end
end
