# koishi-plugin-eula

[![npm](https://img.shields.io/npm/v/koishi-plugin-eula?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-eula) ![Rating](https://badge.koishi.chat/rating/koishi-plugin-eula)

为你的 Koishi bot 添加一个 EULA(End-user licence agreement) 最终用户许可协议。

## 功能特性

- ✅ 支持多语言协议内容配置
- ✅ 可自定义协议别名和认可关键字
- ✅ 支持命令白名单/黑名单模式
- ✅ 提供完整的事件系统用于扩展
- ✅ 支持权限等级控制

## 快速开始

### 普通用户使用

在 Koishi 插件市场中搜索 `eula`，点击添加即可使用。

### 开发者使用

#### 安装

```bash
# 使用 yarn
yarn add koishi-plugin-eula

# 或使用 npm
npm install koishi-plugin-eula
```

#### 配置

在 `package.json` 中声明 eula 服务依赖：

```json
{
  "koishi": {
    "service": {
      "required": ["eula"]
    }
  }
}
```

#### 在插件中使用

1. **引入类型定义**（获得 TypeScript 类型提示）：

```typescript
import {} from 'koishi-plugin-eula'

export const using = ['eula']
```

2. **监听 EULA 更新事件**：

```typescript
ctx.on('eula/update', (session: Session, eula: boolean) => {
  if (eula) {
    // 用户已同意协议
    console.log(`用户 ${session.userId} 已同意 EULA`)
  } else {
    // 用户未同意协议
    console.log(`用户 ${session.userId} 未同意 EULA`)
  }
})
```

3. **在命令执行前检查**（可选）：

```typescript
ctx.before('command/execute', async (argv) => {
  const session = argv.session
  if (!session.user.eula) {
    return '请先同意最终用户许可协议'
  }
})
```

## API 文档

### 服务：`ctx.eula`

#### `vertify(userId: number): Promise<boolean>`

验证指定用户是否已同意 EULA。

> **注意**：一般情况下，更推荐使用 `eula/update` 事件来获得认证状态，这将得到完整的 Session 支持。

**参数：**

- `userId: number` - 用户 ID，即 `session.user.id`

**返回值：**

- `Promise<boolean>` - `true` 表示用户已同意，`false` 表示未同意

**示例：**

```typescript
const hasAccepted = await ctx.eula.vertify(session.user.id)
if (!hasAccepted) {
  return '请先同意最终用户许可协议'
}
```

### 事件系统

#### 事件：`eula/before`

在命令触发 EULA 流程**之前**触发该事件。

**参数：**

- `argv: Argv` - 命令参数对象

**示例：**

```typescript
ctx.on('eula/before', (argv) => {
  console.log(`用户 ${argv.session.userId} 即将看到 EULA`)
})
```

#### 事件：`eula/update`

当用户回复 EULA 后触发，用于通知用户同意或拒绝的状态。

**参数：**

- `session: Session` - 会话对象
- `eula: boolean` - `true` 表示用户已同意，`false` 表示用户拒绝或超时

**示例：**

```typescript
ctx.on('eula/update', (session, eula) => {
  if (eula) {
    // 用户同意协议后的处理逻辑
    session.send('感谢您同意协议！')
  } else {
    // 用户拒绝协议后的处理逻辑
    session.send('您已拒绝协议，部分功能将无法使用。')
  }
})
```

## 配置说明

插件支持以下配置项：

- **waitTime**: 等待用户回复的时长（秒），范围 30-300，默认 60
- **replyAuthority**: 协议生效的最高权限等级，范围 1-5，默认 1
- **forwardMessgae**: 是否合并发送协议和认可段（目前仅在 QQ 生效），默认 `true`
- **alias**: 协议别名，默认 `'EULA'`
- **content**: 协议内容的多语言设置（字典格式）
- **accept**: 认可协议的关键字数组（如果有多个，将随机选择一个）
- **enable**: 是否限制所有命令，默认 `true`
- **model**: 限制命令的模式（`true` 为白名单，`false` 为黑名单）
- **commands**: 指令列表（配合 `model` 使用）

## 注意事项

⚠️ **重要声明**

本插件只用于体现 Koishi 部署者意志，即："部署者仅对同意了《最终用户协议》的最终用户提供服务"。

对于部署者行为及所产生的任何纠纷，Koishi 及 koishi-plugin-eula 概不负责。

协议内容文本可以在本地化文件中修改（`src/locales/` 目录下的 YAML 文件），因此你可以根据不同语言给予不同的协议文本。

## 许可证

MIT
