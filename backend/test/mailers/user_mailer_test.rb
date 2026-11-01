require "test_helper"

class UserMailerTest < ActionMailer::TestCase
  test "лист підтвердження містить посилання з токеном" do
    mail = UserMailer.confirmation(users(:unconfirmed))
    assert_equal [ users(:unconfirmed).email ], mail.to
    assert_match %r{/confirm-email\?token=}, mail.body.to_s
  end

  test "лист скидання пароля містить посилання з токеном" do
    mail = UserMailer.password_reset(users(:buyer))
    assert_equal [ users(:buyer).email ], mail.to
    assert_match %r{/reset-password\?token=}, mail.body.to_s
  end
end
