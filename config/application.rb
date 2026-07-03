require_relative "boot"

require "rails/all"

Bundler.require(*Rails.groups)

module Myapp
  class Application < Rails::Application
    config.load_defaults 7.1
    config.i18n.default_locale = :ja
    config.time_zone = "Tokyo"

    config.autoload_lib(ignore: %w[assets tasks])
    config.active_storage.variant_processor = :vips

  end
end
