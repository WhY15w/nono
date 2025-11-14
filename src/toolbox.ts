import { CacheFetchSetting } from "./cache";
import LAppDefine from "./lappdefine";
import { LAppLive2DManager } from "./lapplive2dmanager";
import * as svgIcon from "./svg";

const DEFAULT_ICON_SIZE = 35;
const DEFAULT_ICON_BG = "#00A6ED";
const DEFAULT_ICON_FG = "white";
const DEFAULT_HOVER_COLOR = "rgb(224, 209, 41)";

const LIVE2D_ITEM_CSS = "__live2d-toolbox-item";
const LS_KEY = "live2d_collapsed";

let toolboxInstance: Live2DToolbox | null = null;

class Live2DToolbox {
  private container: HTMLDivElement | null = null;
  private containerTimer: number | undefined;
  private collapse = false;
  private widthXoffset = 35;
  private initialXoffset = 0;

  constructor() {
    Live2DToolbox.injectCss();
  }

  public async initFromLocalStorage(): Promise<void> {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved === "true") {
        const canvas = LAppDefine.Canvas;
        if (canvas) {
          const canvasWidth = Math.ceil(canvas.width);

          const prevTransition = canvas.style.transition;
          (canvas as any).dataset.prevTransition = prevTransition ?? "";

          canvas.style.transition = "none";
          canvas.style.transform = `translateX(${canvasWidth}px)`;

          this.collapse = true;
          this.initialXoffset = canvasWidth;

          canvas.getBoundingClientRect();

          requestAnimationFrame(() => {
            setTimeout(() => {
              const prev = (canvas as any).dataset.prevTransition || "";
              canvas.style.transition = prev;
              try {
                delete (canvas as any).dataset.prevTransition;
              } catch (e) {}
            }, 50);
          });
        }
      }
    } catch (e) {}
  }

  public addToolBox(): void {
    if (this.container) {
      return;
    }

    this.container = this.createContainer();

    // 为容器和 canvas 添加显示/隐藏事件
    this.container.onmouseenter = async () => this.showContainer();
    this.container.onmouseleave = async () => this.hideContainer();

    const canvas = LAppDefine.Canvas;
    if (canvas) {
      canvas.onmouseenter = async () => this.showContainer();
      canvas.onmouseleave = async () => this.hideContainer();
    }

    document.body.appendChild(this.container);
  }

  public reloadToolBox(): void {
    if (!this.container) {
      return;
    }

    this.hideContainer();
    document.body.removeChild(this.container);
    this.container = this.createContainer();

    this.container.onmouseenter = async () => this.showContainer();
    this.container.onmouseleave = async () => this.hideContainer();

    document.body.appendChild(this.container);
  }

  private static injectCss() {
    if (document.head.querySelector(`style[data-live2d-toolbox]`)) {
      return;
    }

    const style = document.createElement("style");
    style.setAttribute("data-live2d-toolbox", "true");
    style.innerHTML = `
.${LIVE2D_ITEM_CSS} {
    margin: 2px;
    padding: 2px;
    display: flex;
    height: ${DEFAULT_ICON_SIZE}px;
    width: ${DEFAULT_ICON_SIZE}px;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    font-size: 0.7rem;
    background-color: ${DEFAULT_ICON_BG};
    color: ${DEFAULT_ICON_FG};
    border-radius: 0.5em;
    transition: all .35s cubic-bezier(0.23, 1, 0.32, 1);
}

.${LIVE2D_ITEM_CSS}:hover {
    background-color: ${DEFAULT_HOVER_COLOR};
}

.${LIVE2D_ITEM_CSS}.button-item {
    display: flex;
    align-items: center;
    width: fit-content;
    padding: 5px 10px 0px;
}

.${LIVE2D_ITEM_CSS}.button-item svg {
    height: 20px;
}

.${LIVE2D_ITEM_CSS}.expression-item {
    display: flex;
    align-items: center;
    width: fit-content;
    padding: 3px 10px;
}

.${LIVE2D_ITEM_CSS}.expression-item > span:last-child {
    width: 60px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.${LIVE2D_ITEM_CSS}.expression-item svg {
    height: 20px;
    margin-right: 5px;
}

.${LIVE2D_ITEM_CSS} svg path {
    fill: ${DEFAULT_ICON_FG};
}
`;
    document.head.appendChild(style);
  }

  private createCommonIcon(
    svgString: string,
    extraText: string = "",
    cssClasses: string[] = []
  ): HTMLDivElement {
    const div = document.createElement("div");
    div.classList.add(LIVE2D_ITEM_CSS);
    cssClasses.forEach((c) => div.classList.add(c));

    const firstSpan = document.createElement("span");
    const secondSpan = document.createElement("span");
    firstSpan.innerHTML = svgString;
    secondSpan.innerText = extraText;

    div.appendChild(firstSpan);
    div.appendChild(secondSpan);
    return div;
  }

  private createCollapseIcon(container: HTMLDivElement): HTMLDivElement {
    const icon = this.createCommonIcon(svgIcon.collapseIcon, "", [
      "button-item",
    ]);
    icon.style.backgroundColor = DEFAULT_ICON_BG;
    icon.style.fontSize = "1.05rem";

    icon.addEventListener("mouseenter", () => {
      icon.style.backgroundColor = DEFAULT_HOVER_COLOR;
    });
    icon.addEventListener("mouseleave", () => {
      icon.style.backgroundColor = DEFAULT_ICON_BG;
    });

    if (this.collapse) {
      icon.style.transform = "rotate(180deg)";
    }

    let xoffset = this.initialXoffset;

    icon.onclick = async () => {
      const canvas = LAppDefine.Canvas;
      if (!canvas) return;

      const canvasWidth = Math.ceil(canvas.width);
      // 与原始相同的算术：在 [0, canvasWidth*2) 范围内循环偏移
      xoffset = (xoffset + canvasWidth) % (canvasWidth << 1);
      canvas.style.transform = `translateX(${xoffset}px)`;

      container.style.transform = `translateX(${Math.max(
        0,
        xoffset - this.widthXoffset
      )}px)`;

      if (xoffset > 0) {
        // 收起
        this.collapse = true;
        icon.style.transform = "rotate(180deg)";
        setTimeout(() => {
          this.showContainer();
        }, 500);
      } else {
        // 展开
        this.collapse = false;
        icon.style.transform = "rotate(0)";
      }

      // 持久化状态
      try {
        localStorage.setItem(LS_KEY, this.collapse ? "true" : "false");
      } catch (e) {}
    };

    return icon;
  }

  private createRefreshIcon(): HTMLDivElement {
    const icon = this.createCommonIcon(svgIcon.reloadIcon, "", ["button-item"]);
    icon.style.backgroundColor = DEFAULT_ICON_BG;
    icon.style.fontSize = "1.05rem";

    icon.addEventListener("mouseenter", () => {
      icon.style.backgroundColor = DEFAULT_HOVER_COLOR;
    });
    icon.addEventListener("mouseleave", () => {
      icon.style.backgroundColor = DEFAULT_ICON_BG;
    });

    icon.onclick = async () => {
      CacheFetchSetting.refreshCache = true;
      const manager = LAppLive2DManager.getInstance();
      manager.loadLive2dModel();
    };

    return icon;
  }

  private createStarIcon(): HTMLDivElement {
    const icon = this.createCommonIcon(svgIcon.starIcon, "", ["button-item"]);
    icon.style.backgroundColor = DEFAULT_ICON_BG;
    icon.style.fontSize = "1.05rem";

    icon.addEventListener("mouseenter", () => {
      icon.style.backgroundColor = DEFAULT_HOVER_COLOR;
    });
    icon.addEventListener("mouseleave", () => {
      icon.style.backgroundColor = DEFAULT_ICON_BG;
    });

    icon.onclick = async () => {
      window.open(
        "https://www.bilibili.com/video/BV1pWMuzTEtt/?vd_source=0f6c285aec88767a18fa00a5b8114b98",
        "_blank"
      );
    };

    return icon;
  }

  private createContainer(): HTMLDivElement {
    const container = document.createElement("div");
    container.id = "live2d-toolbox-container";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.flexDirection = "column";

    const canvas = LAppDefine.Canvas;
    // 保持 z-index 行为
    const baseZ = (() => {
      const z = parseInt(canvas?.style?.zIndex ?? "");
      return Number.isNaN(z) ? 0 : z;
    })();
    container.style.zIndex = (baseZ + 1).toString();

    container.style.opacity = "0"; // 初始隐藏
    container.style.transition = ".7s cubic-bezier(0.23, 1, 0.32, 1)";

    container.style.position = "fixed";
    container.style.right = canvas.width - this.widthXoffset + "px";
    container.style.top = window.innerHeight - canvas.height + 35 + "px";

    if (this.initialXoffset > 0) {
      container.style.transform = `translateX(${Math.max(
        0,
        this.initialXoffset - this.widthXoffset
      )}px)`;
    }

    const showLive2dIcon = this.createCollapseIcon(container);
    const refreshCacheIcon = this.createRefreshIcon();
    const starIcon = this.createStarIcon();

    container.appendChild(showLive2dIcon);
    container.appendChild(refreshCacheIcon);
    container.appendChild(starIcon);

    return container;
  }

  private showContainer(): void {
    if (!this.container) return;
    if (this.containerTimer) {
      clearTimeout(this.containerTimer);
    }

    this.containerTimer = window.setTimeout(() => {
      if (this.container) {
        this.container.style.opacity = "1";
      }
    }, 200);
  }

  private hideContainer(): void {
    if (!this.container || this.collapse) return;
    if (this.containerTimer) {
      clearTimeout(this.containerTimer);
    }
    this.containerTimer = window.setTimeout(() => {
      if (this.container) {
        this.container.style.opacity = "0";
      }
    }, 200);
  }
}

export async function addToolBox() {
  if (!toolboxInstance) {
    toolboxInstance = new Live2DToolbox();
    await toolboxInstance.initFromLocalStorage();
    toolboxInstance.addToolBox();
  } else {
    toolboxInstance.addToolBox();
  }
}

export function reloadToolBox() {
  if (!toolboxInstance) {
    toolboxInstance = new Live2DToolbox();
    toolboxInstance.addToolBox();
    return;
  }
  toolboxInstance.reloadToolBox();
}
