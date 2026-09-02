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

  const currentUserId = getUserId();

  if (String(li.dataset.userId) === String(currentUserId)) {
    row.classList.add("justify-content-end");
  } else {
    row.classList.add("justify-content-start");
  }
}

// 画面に表示されているメッセージの左右を設定
function applyAllMessagePositions() {
  document
    .querySelectorAll("#messages li[data-user-id]")
    .forEach(applyMessagePosition);
}

const liveRoomId = getLiveRoomIdFromUrl();
const App = {};

if (liveRoomId) {
  App.room = consumer.subscriptions.create(
    {
      channel: "LiveRoomChannel",
      live_room_id: liveRoomId
    },

    {
      connected() {
        console.log("Connected to LiveRoomChannel");
      },

      disconnected() {
        console.log("Disconnected from LiveRoomChannel");
      },

      received(message) {
        const messages = document.getElementById("messages");

        if (!messages) return;

        const ul = messages.querySelector("ul");

        if (!ul) return;

        // 受け取ったメッセージを追加
        ul.insertAdjacentHTML("beforeend", message);

        // 追加したメッセージの左右を設定
        const lastLi = ul.lastElementChild;

        if (lastLi) {
          applyMessagePosition(lastLi);
        }
      },

      speak(content, image = null) {
        const userId = getUserId();

        return this.perform("speak", {
          message: content,
          image: image,
          live_room_id: liveRoomId,
          user_id: userId
        });
      }
    }
  );

  // Turboでページが表示されたとき
  document.addEventListener("turbo:load", function () {
    applyAllMessagePositions();

    const input = document.getElementById("chat-input");
    const imageInput = document.getElementById("chat-image");
    const button = document.getElementById("button");
    const chatImageLabel = document.getElementById("chat-image-label");

    if (!input || !imageInput || !button || !chatImageLabel) return;

    // 画像が選択されたときにラベルを更新
    imageInput.addEventListener("change", function () {
      if (imageInput.files.length > 0) {
        chatImageLabel.textContent = "画像が添付されています";
      }
    });

    // 送信ボタン
    button.addEventListener("click", function () {
      const content = input.value;
      const file = imageInput.files[0];

      if (file) {
        const reader = new FileReader();

        reader.onload = function (event) {
          const base64String = event.target.result.split(",")[1];
          App.room.speak(content, base64String);
        };

        reader.readAsDataURL(file);
      } else {
        App.room.speak(content);
      }

      // 入力欄をリセット
      input.value = "";
      imageInput.value = "";
      chatImageLabel.textContent = "画像";
    });
  });
}