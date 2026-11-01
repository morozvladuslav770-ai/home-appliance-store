require "test_helper"

class UserTest < ActiveSupport::TestCase
  def build_user(attrs = {})
    User.new({
      full_name: "Тест Тестович", email: "Test@Example.com", phone: "+380501234567",
      password: "Password1", password_confirmation: "Password1"
    }.merge(attrs))
  end

  test "нормалізує email" do
    assert_equal "test@example.com", build_user.tap(&:valid?).email
  end

  test "новий користувач — покупець без підтвердженого email" do
    user = build_user
    user.save!
    assert user.buyer?
    assert_not user.email_confirmed?
  end

  test "пароль: щонайменше 8 символів, літери й цифри" do
    assert_not build_user(password: "short1", password_confirmation: "short1").valid?
    assert_not build_user(password: "onlyletters", password_confirmation: "onlyletters").valid?
    assert_not build_user(password: "12345678", password_confirmation: "12345678").valid?
    assert build_user(password: "Valid123", password_confirmation: "Valid123").valid?
  end

  test "пароль і підтвердження мають збігатися" do
    assert_not build_user(password_confirmation: "Other123").valid?
  end

  test "email унікальний без урахування регістру" do
    assert_not build_user(email: "BUYER@example.com").valid?
  end

  test "невідома роль відхиляється" do
    assert_not build_user(role: "superuser").valid?
  end

  test "після 5 невдалих спроб акаунт блокується на 15 хвилин" do
    user = users(:buyer)
    5.times { user.register_failed_login! }
    assert user.reload.locked?

    travel 16.minutes do
      assert_not user.reload.locked?
    end
  end

  test "токен сесії перестає діяти після зміни пароля" do
    user = users(:buyer)
    token = user.generate_token_for(:session)
    assert_equal user, User.find_by_session_token(token)

    user.update!(password: "NewPass123", password_confirmation: "NewPass123")
    assert_nil User.find_by_session_token(token)
  end

  test "токен сесії спливає" do
    token = users(:buyer).generate_token_for(:short_session)
    travel 2.days do
      assert_nil User.find_by_session_token(token)
    end
  end

  test "staff? для менеджера й адміністратора" do
    assert users(:manager).staff?
    assert users(:admin).staff?
    assert_not users(:buyer).staff?
  end
end
