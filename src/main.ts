/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { LAppDelegate, type CanvasSize } from "./lappdelegate";
import LAppDefine from "./lappdefine";
import { LAppLive2DManager } from "./lapplive2dmanager";
import { LAppMessageBox } from "./lappmessagebox";
import { initialiseIndexDB } from "./db";
import { addToolBox } from "./toolbox";

interface Live2dRenderConfig {
  CanvasId?: string;
  CanvasSize?: CanvasSize;
  BackgroundRGBA?: [number, number, number, number];
  ResourcesPath?: string;
  LoadFromCache?: boolean;
  ShowToolBox?: boolean;
  MinifiedJSUrl?: string;
  Live2dCubismcoreUrl?: string;
}

const DEFAULT_MINIFIED_JS_URL =
  "https://unpkg.com/core-js-bundle@3.6.1/minified.js";
const DEFAULT_CUBISM_CORE_URL =
  "https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js";

// 避免重复插入外部脚本（同 URL 多次初始化时）
const loadedScriptPromises = new Map<string, Promise<void>>();

async function launchLive2d(): Promise<boolean> {
  const live2dModel = LAppDelegate.getInstance();
  const ok = live2dModel.initialize();
  if (!ok) {
    console.log("初始化失败，退出");
    return false;
  }

  live2dModel.run();

  // show
  const canvas = LAppDefine.Canvas;
  if (canvas) {
    setTimeout(() => {
      canvas.style.opacity = "1";
      if (LAppDefine.ShowToolBox) {
        addToolBox();
      }
    }, 500);
  }

  return true;
}

function getFirstModel() {
  const manager = LAppLive2DManager.getInstance();
  if (!manager) return null;

  // 优先用 getModel(0)，兼容旧代码
  const model =
    (manager as any).getModel?.(0) ?? (manager as any).model ?? null;
  return model;
}

function setExpression(name: string) {
  const model = getFirstModel();
  model?.setExpression?.(name);
}

function setRandomExpression() {
  const model = getFirstModel();
  model?.setRandomExpression?.();
}

function setMessageBox(message: string, duration: number) {
  const messageBox = LAppMessageBox.getInstance();
  messageBox.setMessage(message, duration);
}

function hideMessageBox() {
  const messageBox = LAppMessageBox.getInstance();
  messageBox.hideMessageBox();
}

function revealMessageBox() {
  const messageBox = LAppMessageBox.getInstance();
  messageBox.revealMessageBox();
}

function loadScriptOnce(src: string): Promise<void> {
  const existing = loadedScriptPromises.get(src);
  if (existing) return existing;

  // 若页面已存在相同 src 的 script，认为已加载/正在加载
  const already = Array.from(document.scripts).some((s) => s.src === src);
  if (already) {
    const p = Promise.resolve();
    loadedScriptPromises.set(src, p);
    return p;
  }

  const script = document.createElement("script");
  script.src = src;

  const p = new Promise<void>((resolve, reject) => {
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`脚本加载失败: ${src}`));
    document.head.appendChild(script);
  });

  loadedScriptPromises.set(src, p);
  return p;
}

async function loadLibs(urls: string[]) {
  // 并发加载即可；外部脚本之间无依赖时更快
  await Promise.all(urls.map((u) => loadScriptOnce(u)));
}

async function initializeLive2D(config: Live2dRenderConfig) {
  const canvasId = config.CanvasId ?? LAppDefine.CanvasId;

  // 如果已存在同 id canvas，则不重复创建
  const els = document.querySelectorAll(`#${CSS.escape(canvasId)}`);
  if (els.length >= 1) {
    return;
  }

  config.MinifiedJSUrl ??= DEFAULT_MINIFIED_JS_URL;
  config.Live2dCubismcoreUrl ??= DEFAULT_CUBISM_CORE_URL;
  config.ShowToolBox ??= false;

  LAppDefine.ShowToolBox = config.ShowToolBox;

  await loadLibs([config.MinifiedJSUrl, config.Live2dCubismcoreUrl]);

  if (config.CanvasId) {
    LAppDefine.CanvasId = config.CanvasId;
  }
  if (config.CanvasSize) {
    LAppDefine.CanvasSize = config.CanvasSize;
  }
  if (config.BackgroundRGBA) {
    LAppDefine.BackgroundRGBA = config.BackgroundRGBA;
  }
  if (config.ResourcesPath) {
    LAppDefine.ResourcesPath = config.ResourcesPath;
  }

  if (config.LoadFromCache && typeof indexedDB !== "undefined") {
    LAppDefine.LoadFromCache = config.LoadFromCache;
    // 初始化缓存数据库
    const db = await initialiseIndexDB("db", 1, "live2d");
    LAppDefine.Live2dDB = db;
  }

  return launchLive2d();
}

if (typeof window !== "undefined") {
  // 不覆盖宿主页面已有监听
  window.addEventListener("beforeunload", () => {
    const live2dModel = LAppDelegate.getInstance();
    live2dModel?.release();
  });

  window.addEventListener("resize", () => {
    const live2dModel = LAppDelegate.getInstance();
    if (live2dModel && LAppDefine.CanvasSize === "auto" && LAppDefine.Canvas) {
      live2dModel.onResize();
    }
  });
}

const Live2dRender = {
  initializeLive2D,
  setExpression,
  setMessageBox,
  setRandomExpression,
  hideMessageBox,
  revealMessageBox,
};

export default Live2dRender;
