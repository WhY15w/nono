import LAppDefine from "./lappdefine";

export let s_instance: LAppMessageBox = null;
export let messageBox: HTMLDivElement = null;

/**
 * 消息框类，用于在页面上展示临时提示信息。
 * 当 localStorage 中记录了收起状态（live2d_collapsed === "true"）时，不会显示消息框。
 */
export class LAppMessageBox {
  public static getInstance(): LAppMessageBox {
    if (s_instance == null) {
      s_instance = new LAppMessageBox();
    }

    return s_instance;
  }

  public getMessageBox(): HTMLDivElement {
    if (this._messageBox == null) {
      this._messageBox = document.querySelector("#live2dMessageBox-content");
    }
    return this._messageBox;
  }

  public initialize(canvas: HTMLCanvasElement): boolean {
    messageBox = document.createElement("div");

    messageBox.id = LAppDefine.MessageBoxId;
    messageBox.style.position = "fixed";
    messageBox.style.padding = "10px";
    messageBox.style.zIndex = "9999";
    messageBox.style.display = "flex";
    messageBox.style.justifyContent = "center";

    messageBox.style.width = canvas.width + "px";
    messageBox.style.height = "20px";
    messageBox.style.right = "0";
    messageBox.style.bottom = canvas.height + 50 + "px";
    messageBox.innerHTML = '<div id="live2dMessageBox-content"></div>';

    this._messageBox = messageBox.querySelector("#live2dMessageBox-content");

    if (!LAppMessageBox.isCollapsed()) {
      document.body.appendChild(messageBox);
    }

    this.hideMessageBox();
    return true;
  }

  /**
   * 设置消息并显示。若处于收起状态（localStorage 标记），则不做任何显示。
   * @param message 要显示的文本
   * @param duration 显示时长（毫秒），为 null 则持续显示直到手动 hide
   */
  public setMessage(message: string, duration: number = null) {
    // 如果当前 live2d 是收起状态，不显示消息
    if (LAppMessageBox.isCollapsed()) {
      return;
    }

    const messageBox = this.getMessageBox();
    if (!messageBox) {
      return;
    }

    this.hideMessageBox();
    messageBox.textContent = message;

    // 根据 canvas/配置调整 wrapper 的 bottom 值
    setTimeout(() => {
      const wrapperDiv: HTMLDivElement = document.querySelector(
        "#" + LAppDefine.MessageBoxId
      );
      if (wrapperDiv) {
        wrapperDiv.style.bottom =
          (LAppDefine.CanvasSize === "auto"
            ? 500
            : LAppDefine.CanvasSize.height) +
          messageBox.offsetHeight -
          25 +
          "px";
      }
    }, 10);

    this.revealMessageBox();
    if (duration) {
      setTimeout(() => {
        this.hideMessageBox();
      }, duration);
    }
  }

  // 隐藏对话框
  public hideMessageBox() {
    if (LAppMessageBox.isCollapsed()) {
      return;
    }
    const messageBox = this.getMessageBox();
    if (!messageBox) {
      return;
    }
    messageBox.classList.remove("live2dMessageBox-content-visible");
    messageBox.classList.add("live2dMessageBox-content-hidden");
  }

  // 展示对话框
  public revealMessageBox() {
    if (LAppMessageBox.isCollapsed()) {
      return;
    }
    const messageBox = this.getMessageBox();
    if (!messageBox) {
      return;
    }
    messageBox.classList.remove("live2dMessageBox-content-hidden");
    messageBox.classList.add("live2dMessageBox-content-visible");
  }

  _messageBox: HTMLDivElement = null;

  private static isCollapsed(): boolean {
    try {
      const saved = localStorage.getItem("live2d_collapsed");
      return saved === "true";
    } catch (e) {
      return false;
    }
  }
}
