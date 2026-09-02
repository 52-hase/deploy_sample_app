import consumer from "./consumer";

// URLからlive_room_idを取得
function getLiveRoomIdFromUrl() {
  const url = window.location.pathname;
  const match = url.match(/live_rooms\/(\d+)/);
  return match ? match[1] : null;
}

// ログインユーザーIDを取得
function getUserId() {
  const userIdElement = document.getElementById("user-id");
  return userIdElement ? userIdElement.dataset.userId : null;
}

// メッセージの左右表示を設定
function applyMessagePosition(li) {
  const row = li.querySelector(".message-row");

  if (!row) return;

  if (String(li.dataset.userId) === String(userId)) {
    row.classList.add("justify-content-end");
  } else {
    row.classList.add("justify-content-start");
  }
}

const liveRoomId = getLiveRoomIdFromUrl();
const userId = getUserId();
const App = {};

// LiveRoomChannelに接続
if (liveRoomId) {
  App.room = consumer.subscriptions.create(
    { channel: "LiveRoomChannel", live_room_id: liveRoomId },
    {
      // 接続成功時
      connected() {
        console.log("Connected to LiveRoomChannel");
      },

      // 接続切断時
      disconnected() {
        console.log("Disconnected from LiveRoomChannel");
      },

      // メッセージを受信
      received(message) {
        const messages = document.getElementById("messages");

        if (messages) {
          const ul = messages.querySelector("ul");

          if (ul) {
            // 受け取ったHTMLを追加
            ul.insertAdjacentHTML("beforeend", message);

            // 追加したメッセージの左右を判定
            const lastLi = ul.lastElementChild;

            if (lastLi) {
              applyMessagePosition(lastLi);
            }
          }
        }
      },

      // メッセージを送信
      speak(content, image = null) {
        return this.perform("speak", {
          message: content,
          image: image,
          live_room_id: liveRoomId,
          user_id: userId
        });
      }
    }
  );

  // HTMLの読み込み完了後に処理
  document.addEventListener("DOMContentLoaded", function () {

    // 初期表示されているメッセージの左右を判定
    document
      .querySelectorAll("#messages li[data-user-id]")
      .forEach(applyMessagePosition);

    const input = document.getElementById("chat-input");
    const imageInput = document.getElementById("chat-image");
    const button = document.getElementById("button");
    const chatImageLabel = document.getElementById("chat-image-label");

    // 画像選択時にラベルを更新
    imageInput.addEventListener("change", function () {
      if (imageInput.files.length > 0) {
        chatImageLabel.textContent = "画像が添付されています";
      }
    });

    // 送信ボタンをクリックしたとき
    button.addEventListener("click", function () {
      const content = input.value;
      const file = imageInput.files[0];

      if (file) {
        // 画像をBase64形式に変換して送信
        const reader = new FileReader();

        reader.onload = function (event) {
          const base64String = event.target.result.split(",")[1];
          App.room.speak(content, base64String);
        };

        reader.readAsDataURL(file);
      } else {
        // テキストのみ送信
        App.room.speak(content);
      }

      // 入力欄と画像をリセット
      input.value = "";
      imageInput.value = "";
      chatImageLabel.textContent = "画像";
    });
  });
}