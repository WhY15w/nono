# src 目录文件功能说明

本文档详细说明了 `src` 目录下各个文件的功能和作用。

## 核心文件

### main.ts
**主入口文件**
- 提供 Live2D 的初始化接口 `initializeLive2D()`
- 导出用户可调用的公共 API：
  - `setExpression()` - 设置表情
  - `setRandomExpression()` - 设置随机表情
  - `setMessageBox()` - 显示消息框
  - `hideMessageBox()` - 隐藏消息框
  - `revealMessageBox()` - 显示消息框
- 处理窗口生命周期事件（关闭、调整大小）
- 动态加载必要的 JavaScript 库（core-js、live2dcubismcore）

### lappdefine.ts
**配置定义文件**
- 定义了 Live2D 应用的所有配置参数
- 包含画布配置（Canvas ID、大小、背景色）
- 视图相关参数（缩放、逻辑坐标范围）
- 资源路径配置
- 交互相关配置（点击区域、动作组）
- 优先级设置
- 调试和日志配置
- 导出全局配置对象 `LAppDefine`

### lappdelegate.ts
**应用委托类**（应用程序主控制器）
- 管理 Live2D 应用的生命周期
- 初始化和管理 WebGL 上下文
- 创建和配置 Canvas 元素
- 管理 Cubism SDK 的初始化
- 处理触摸和鼠标事件（点击、移动、拖拽）
- 管理主渲染循环
- 创建和管理着色器程序
- 单例模式实现

## 模型管理

### lapplive2dmanager.ts
**Live2D 模型管理器**
- 管理 Live2D 模型的生命周期
- 提供模型加载和卸载功能 `loadLive2dModel()`
- 处理模型的更新和渲染 `onUpdate()`
- 处理用户交互事件（点击、拖拽）
- 管理视图矩阵和投影矩阵
- 支持多模型管理（当前实现为单模型）
- 单例模式实现

### lappmodel.ts
**Live2D 模型实现类**
- 继承自 `CubismUserModel`，实现具体的模型功能
- 异步加载模型资源（model3.json、贴图、物理、表情等）
- 管理模型的各种组件：
  - 表情系统
  - 动作系统
  - 物理演算
  - 眨眼系统
  - 呼吸效果
  - 口型同步
- 实现模型的更新逻辑（参数更新、动作播放）
- 提供碰撞检测功能 `hitTest()`
- 管理模型渲染

### lappview.ts
**视图管理类**
- 管理渲染视图的初始化和更新
- 处理坐标变换（设备坐标 ↔ 屏幕坐标 ↔ 视图坐标）
- 管理视图矩阵和设备矩阵
- 处理触摸事件并转换为模型可用的坐标
- 初始化着色器程序
- 控制渲染流程

## 资源管理

### lapptexturemanager.ts
**纹理管理器**
- 管理 WebGL 纹理的加载和释放
- 支持从远程 URL 加载纹理（PNG、WebP）
- 实现纹理缓存机制
- 处理 Premultiplied Alpha（预乘 Alpha）
- 提供纹理查询和删除功能
- 管理纹理的 WebGL 绑定

### cache.ts
**缓存管理模块**
- 提供 `cacheFetch()` 函数，用于缓存 Live2D 资源
- 支持 IndexedDB 缓存机制
- 自动管理缓存的读取和写入
- 支持缓存刷新控制
- 减少重复网络请求，提高加载速度
- 提供 ArrayBuffer 和 Base64 转换工具

### db.ts
**IndexedDB 数据库操作模块**
- 初始化 IndexedDB 数据库 `initialiseIndexDB()`
- 提供数据的增删查改接口：
  - `selectItemIndexDB()` - 查询数据
  - `createItemIndexDB()` - 创建数据
- 管理 "live2d" 对象存储
- 为缓存系统提供持久化支持

## UI 组件

### lappmessagebox.ts
**消息框组件**
- 在页面上显示临时提示信息
- 支持自动隐藏（可设置显示时长）
- 根据 Canvas 位置自动调整消息框位置
- 检查 localStorage 中的收起状态
- 提供显示/隐藏控制接口
- 单例模式实现

### toolbox.ts
**工具箱组件**
- 创建和管理悬浮工具栏
- 提供以下功能按钮：
  - 收起/展开按钮 - 控制 Live2D 的显示/隐藏
  - 刷新按钮 - 重新加载模型
  - 星标按钮 - 跳转到外部链接
- 支持鼠标悬停显示/隐藏
- 持久化保存展开/收起状态到 localStorage
- 响应式布局，自动适应 Canvas 位置

### svg.ts
**SVG 图标资源**
- 定义工具箱使用的 SVG 图标：
  - `collapseIcon` - 收起/展开图标
  - `expressionIcon` - 表情图标
  - `reloadIcon` - 刷新图标
  - `starIcon` - 星标图标
  - `catIcon` - 猫咪图标
- 所有图标以字符串形式导出

## 辅助模块

### lapppal.ts
**平台抽象层**
- 封装平台相关的功能
- 提供文件加载接口 `loadFileAsBytes()`
- 时间管理（Delta Time 计算）
- 日志输出接口
- 为 Cubism SDK 提供平台适配

### lappwavfilehandler.ts
**WAV 音频文件处理器**
- 加载和解析 WAV 音频文件
- 计算音频的 RMS（均方根）值
- 为口型同步提供音量数据
- 支持多声道音频
- 包含 `ByteReader` 类用于二进制文件读取
- 支持 8/16/24 位音频格式

### touchmanager.ts
**触摸管理器**
- 管理触摸和鼠标输入
- 跟踪触摸点的位置和移动
- 计算触摸距离和移动量
- 支持单点和多点触摸
- 检测滑动手势
- 为交互系统提供输入数据

### utils.ts
**工具函数模块**
- 提供彩色日志输出函数：
  - `pinkLog()` - 粉色背景日志（一般信息）
  - `redLog()` - 红色背景日志（错误或警告）
- 用于调试和开发时的信息输出

## 文件关系总结

```
main.ts (入口)
  ├─> lappdelegate.ts (应用管理)
  │     ├─> lappview.ts (视图管理)
  │     ├─> lapplive2dmanager.ts (模型管理)
  │     │     └─> lappmodel.ts (模型实现)
  │     ├─> lapptexturemanager.ts (纹理管理)
  │     └─> lappmessagebox.ts (消息框)
  ├─> lappdefine.ts (配置)
  ├─> cache.ts (缓存)
  │     └─> db.ts (数据库)
  ├─> toolbox.ts (工具箱)
  │     └─> svg.ts (图标)
  └─> 辅助模块
        ├─> lapppal.ts (平台层)
        ├─> lappwavfilehandler.ts (音频处理)
        ├─> touchmanager.ts (触摸管理)
        └─> utils.ts (工具函数)
```

## 技术栈

- **TypeScript** - 主要编程语言
- **Live2D Cubism SDK** - Live2D 渲染引擎
- **WebGL** - 图形渲染
- **IndexedDB** - 本地缓存存储
- **Canvas API** - 画布管理

## 核心功能流程

1. **初始化流程**：`main.ts` → 加载依赖库 → 初始化配置 → 创建 `LAppDelegate` → 启动渲染循环

2. **模型加载流程**：配置资源路径 → 加载 model3.json → 依次加载模型、表情、物理、纹理等资源 → 完成初始化

3. **渲染流程**：渲染循环 → 更新时间 → 更新模型参数 → 绘制模型 → 请求下一帧

4. **交互流程**：用户输入 → `TouchManager` 处理 → 坐标转换 → 触发模型响应（表情/动作）

5. **缓存流程**：请求资源 → 检查 IndexedDB → 存在则返回缓存 → 不存在则请求并缓存
