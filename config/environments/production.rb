require "active_support/core_ext/integer/time"

Rails.application.configure do
  config.enable_reloading = false

  config.eager_load = true

  config.consider_all_requests_local = false
  config.action_controller.perform_caching = true
  config.active_storage.service = :amazon

  config.assets.compile = false

  config.active_storage.service = :local

  config.force_ssl = true

  config.logger = ActiveSupport::Logger.new(STDOUT)
    .tap  { |logger| logger.formatter = ::Logger::Formatter.new }
    .then { |logger| ActiveSupport::TaggedLogging.new(logger) }

  config.log_tags = [ :request_id ]

  config.log_level = ENV.fetch("RAILS_LOG_LEVEL", "info")

  config.action_mailer.perform_caching = false

  config.i18n.fallbacks = true

  config.active_support.report_deprecations = false

  config.active_record.dump_schema_after_migration = false

  host = "https://www.live-fes.com/"
  config.action_mailer.default_url_options = { protocol: "https", host: host } # メール内で生成されるURLに関するデフォルトの設定
  config.action_mailer.raise_delivery_errors = true # メール送信時にエラーが発生した場合、エラーを表示
  config.action_mailer.delivery_method = :smtp # メール送信の方法をSMTP経由に設定
  config.action_mailer.smtp_settings = { # SMTPの設定
    port: 587,
    domain: "www.live-fes.com",
    address: "smtp.gmail.com",
    user_name: ENV["GMAIL_USERNAME"],
    password: ENV["GMAIL_PASSWORD"],
    authentication: :plain, # 認証方式としてPLAINを使用
    enable_starttls_auto: true # STARTTLS（Transport Layer Security）を自動的に有効にする設定(セキュアな通信)
  }
end
