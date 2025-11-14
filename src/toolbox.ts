import { CacheFetchSetting } from "./cache";
import LAppDefine from "./lappdefine";
import { LAppLive2DManager } from "./lapplive2dmanager";
import * as svgIcon from "./svg";

// TODO: 适配到 live2dBoxItemCss
const _defaultIconSize = 35;
const _defaultIconBgColor = "#00A6ED";
const _defaultIconFgColor = "white";
const _defaultHoverColor = "rgb(224, 209, 41)";

let container: undefined | HTMLDivElement = undefined;
let containerTimer: number | undefined = undefined;
let collapse = false;
let widthXoffset = 35;
const live2dBoxItemCss = "__live2d-toolbox-item";

const LS_KEY = "live2d_collapsed";
let initialXoffset = 0;

function addCssClass() {
  const style = document.createElement("style");
  style.innerHTML = `
.${live2dBoxItemCss} {
    margin: 2px;
    padding: 2px;
    display: flex;
    height: ${_defaultIconSize}px;
    width: ${_defaultIconSize}px;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    font-size: 0.7rem;
    background-color: ${_defaultIconBgColor};
    color: ${_defaultIconFgColor};
    border-radius: 0.5em;
    transition: all .35s cubic-bezier(0.23, 1, 0.32, 1);
}

.${live2dBoxItemCss}:hover {
    background-color: rgb(224, 209, 41);
}

.${live2dBoxItemCss}.button-item {
    display: flex;
    align-items: center;
    width: fit-content;
    padding: 5px 10px 0px;
}

.${live2dBoxItemCss}.button-item svg {
    height: 20px;
}

.${live2dBoxItemCss}.expression-item {
    display: flex;
    align-items: center;
    width: fit-content;
    padding: 3px 10px;
}

.${live2dBoxItemCss}.expression-item > span:last-child {
    width: 60px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.${live2dBoxItemCss}.expression-item svg {
    height: 20px;
    margin-right: 5px;
}

.${live2dBoxItemCss} svg path {
    fill: white;
}

`;
  document.head.appendChild(style);
}

function showContainer() {
  if (container) {
    if (containerTimer) {
      clearTimeout(containerTimer);
    }
    containerTimer = setTimeout(() => {
      container.style.opacity = "1";
    }, 200);
  }
}

function hideContainer() {
  if (container && !collapse) {
    if (containerTimer) {
      clearTimeout(containerTimer);
    }
    containerTimer = setTimeout(() => {
      container.style.opacity = "0";
    }, 200);
  }
}

/**
 * @description 生成一个普通的按钮元素
 * @param text 元素内的文本
 * @returns
 */
function createCommonIcon(
  svgString: string,
  extraString: string = "",
  cssClasses: string[] = []
) {
  const div = document.createElement("div");
  div.classList.add(live2dBoxItemCss);
  cssClasses.forEach((cssString) => div.classList.add(cssString));

  const firstSpan = document.createElement("span");
  const secondSpan = document.createElement("span");
  firstSpan.innerHTML = svgString;
  secondSpan.innerText = extraString;

  div.appendChild(firstSpan);
  div.appendChild(secondSpan);
  return div;
}

/**
 * @description 收起和展开 live2d
 * @param container
 * @returns
 */
function makeLive2dCollapseIcon(container: HTMLDivElement): HTMLDivElement {
  const icon = createCommonIcon(svgIcon.collapseIcon, "", ["button-item"]);
  icon.style.backgroundColor = _defaultIconBgColor;
  icon.style.fontSize = "1.05rem";

  // 注册 icon 的鼠标事件
  icon.addEventListener("mouseenter", () => {
    icon.style.backgroundColor = _defaultHoverColor;
  });

  icon.addEventListener("mouseleave", () => {
    icon.style.backgroundColor = _defaultIconBgColor;
  });

  if (collapse) {
    icon.style.transform = "rotate(180deg)";
  }

  let xoffset = initialXoffset;

  icon.onclick = async () => {
    const canvas = LAppDefine.Canvas;
    if (canvas) {
      const canvasWidth = Math.ceil(canvas.width);
      xoffset = (xoffset + canvasWidth) % (canvasWidth << 1);
      canvas.style.transform = `translateX(${xoffset}px)`;

      container.style.transform = `translateX(${Math.max(
        0,
        xoffset - widthXoffset
      )}px)`;

      if (xoffset > 0) {
        // 收起
        collapse = true;
        icon.style.transform = "rotate(180deg)";
        setTimeout(() => {
          showContainer();
        }, 500);
      } else {
        // 展开
        collapse = false;
        icon.style.transform = "rotate(0)";
      }

      // 写入 localStorage 记录当前状态
      try {
        localStorage.setItem(LS_KEY, collapse ? "true" : "false");
      } catch (e) {}
    }
  };
  return icon;
}

/**
 * @description 创建强制刷新 live2d 的按钮
 * @param container
 * @returns
 */
function makeRefreshCacheIcon(container: HTMLDivElement): HTMLDivElement {
  const icon = createCommonIcon(svgIcon.reloadIcon, "", ["button-item"]);
  icon.style.backgroundColor = _defaultIconBgColor;
  icon.style.fontSize = "1.05rem";

  // 注册 icon 的鼠标事件
  icon.addEventListener("mouseenter", () => {
    icon.style.backgroundColor = _defaultHoverColor;
  });

  icon.addEventListener("mouseleave", () => {
    icon.style.backgroundColor = _defaultIconBgColor;
  });

  icon.onclick = async () => {
    CacheFetchSetting.refreshCache = true;
    const manager = LAppLive2DManager.getInstance();
    manager.loadLive2dModel();
  };

  return icon;
}

/**
 * @description 创建跳转到我的 github 仓库的按钮
 * @param container
 */
function makeStarIcon(container: HTMLDivElement): HTMLDivElement {
  const icon = createCommonIcon(svgIcon.starIcon, "", ["button-item"]);
  icon.style.backgroundColor = _defaultIconBgColor;
  icon.style.fontSize = "1.05rem";

  // 注册 icon 的鼠标事件
  icon.addEventListener("mouseenter", () => {
    icon.style.backgroundColor = _defaultHoverColor;
  });

  icon.addEventListener("mouseleave", () => {
    icon.style.backgroundColor = _defaultIconBgColor;
  });

  icon.onclick = async () => {
    window.open(
      "https://www.bilibili.com/video/BV1pWMuzTEtt/?vd_source=0f6c285aec88767a18fa00a5b8114b98",
      "_blank"
    );
  };

  return icon;
}

function makeBoxItemContainer() {
  const container = document.createElement("div");
  container.id = "live2d-toolbox-container";
  container.style.display = "flex";
  container.style.alignItems = "center";
  container.style.justifyContent = "center";
  container.style.flexDirection = "column";

  const canvas = LAppDefine.Canvas;
  container.style.zIndex = parseInt(canvas.style.zIndex) + 1 + "";
  container.style.opacity = "0"; // 初始隐藏
  container.style.transition = ".7s cubic-bezier(0.23, 1, 0.32, 1)";

  container.style.position = "fixed";
  container.style.right = canvas.width - widthXoffset + "px";
  container.style.top = window.innerHeight - canvas.height + 35 + "px";

  if (initialXoffset > 0) {
    container.style.transform = `translateX(${Math.max(
      0,
      initialXoffset - widthXoffset
    )}px)`;
  }

  // 1. 收起 live2d
  const showLive2dIcon = makeLive2dCollapseIcon(container);
  // 2. 刷新缓存
  const refreshCacheIcon = makeRefreshCacheIcon(container);
  // 3. 跳转到作者bilibili
  const starIcon = makeStarIcon(container);

  container.appendChild(showLive2dIcon);
  container.appendChild(refreshCacheIcon);
  container.appendChild(starIcon);

  document.body.appendChild(container);

  return container;
}

export function reloadToolBox() {
  if (!container) {
    return;
  }

  hideContainer();
  document.body.removeChild(container);
  container = makeBoxItemContainer();

  // 添加工具栏的事件
  container.onmouseenter = async () => {
    showContainer();
  };
  container.onmouseleave = async () => {
    hideContainer();
  };
}

export function addToolBox() {
  addCssClass();

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

        collapse = true;
        initialXoffset = canvasWidth;

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

  container = makeBoxItemContainer();

  // 添加工具栏的事件
  container.onmouseenter = async () => {
    showContainer();
  };
  container.onmouseleave = async () => {
    hideContainer();
  };

  // 添加 live2d 区域的光标事件
  const canvas = LAppDefine.Canvas;
  canvas.onmouseenter = async () => {
    showContainer();
  };

  canvas.onmouseleave = async () => {
    hideContainer();
  };
}
