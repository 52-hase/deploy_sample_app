class LiveRoomChannel < ApplicationCable::Channel
  def subscribed
    live_room = LiveRoom.find(params[:live_room_id])
    stream_for live_room
  end

  def speak(data)
    live_room = LiveRoom.find_by(id: data["live_room_id"])
    image_data = data["image"]
    message_content = data["message"].presence || ""

    message = live_room.messages.new(content: message_content, user_id: data["user_id"])

    if image_data.present?
      decoded_image = Base64.decode64(image_data)
      message.image.attach(io: StringIO.new(decoded_image), filename: "uploaded_image.png")
    end

    message.save!

    # 左右の表示判定はクライアント側(JS)で行うため、current_user依存の偽装ログインは不要
    template = ApplicationController.renderer.render(
      partial: "messages/message",
      locals: { message: message }
    )
    LiveRoomChannel.broadcast_to(live_room, template)
  end
end