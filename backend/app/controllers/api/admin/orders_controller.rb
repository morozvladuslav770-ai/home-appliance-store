class Api::Admin::OrdersController < Api::Admin::BaseController
  # GET /api/admin/orders?status=&q=
  def index
    orders = Order.includes(:order_items).order(created_at: :desc, id: :desc).limit(200)
    orders = orders.where(status: params[:status]) if Order.statuses.key?(params[:status].to_s)
    if params[:q].present?
      like = "%#{Order.sanitize_sql_like(params[:q].strip)}%"
      orders = orders.where(
        "customer_name ILIKE :q OR email ILIKE :q OR phone ILIKE :q OR CAST(orders.id AS TEXT) = :id",
        q: like, id: params[:q].strip
      )
    end

    render json: orders.map { |order| serialize(order) }
  end

  # PATCH /api/admin/orders/:id { status }
  def update
    order = Order.find(params[:id])
    from = order.status
    to = params.require(:status).to_s

    if order.change_status!(to)
      AuditLog.record(current_user, "order.status", order,
                      summary: "Замовлення №#{order.id}", details: { status: [ from, to ] })
      render json: serialize(order.reload)
    else
      render_error("Зі статусу «#{from}» не можна перейти до «#{to}»", :unprocessable_entity)
    end
  end

  private

  def serialize(order)
    {
      id: order.id,
      status: order.status,
      next_statuses: order.next_statuses,
      total: order.total,
      created_at: order.created_at,
      customer_name: order.customer_name,
      email: order.email,
      phone: order.phone,
      city: order.city,
      address: order.address,
      delivery_method: order.delivery_method,
      payment_method: order.payment_method,
      comment: order.comment,
      items: order.order_items.map do |item|
        { product_id: item.product_id, name: item.name, sku: item.sku,
          unit_price: item.unit_price, quantity: item.quantity }
      end
    }
  end
end
