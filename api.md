# API 接口文档

本文档整理了项目中使用的所有 API 接口，包括接口地址、请求参数、返回字段及字段含义。

---

## 目录

1. [后端服务 API](#后端服务-api)
2. [Aster Finance 公开 API](#aster-finance-公开-api)

---

## 后端服务 API

所有后端服务 API 的基础 URL 通过环境变量 `VITE_APP_SERVER_URL` 配置。

### 1. 获取账户余额信息

**接口地址：** `{VITE_APP_SERVER_URL}/aster/balance/{uid}`

**请求类型：** `GET`

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| uid | string | 是 | 模型UID（路径参数） |

**请求头：**
```
Content-Type: application/json
```

**返回数据结构：**

```json
{
  "success": true,
  "data": {
    "uid": "string",
    "wallet_name": "string",
    "mark": "string",
    "available_cash": 0,
    "total_value": 0,
    "total_assets": 0,
    "account_summary": "string",
    "balances": [],
    "active_balances": [],
    "timestamp": 0
  },
  "message": "string"
}
```

**返回字段说明：**

| 字段名 | 类型 | 说明 |
|--------|------|------|
| success | boolean | 请求是否成功 |
| data | object | 余额数据对象 |
| data.uid | string | 账户UID标识 |
| data.wallet_name | string | 钱包名称 |
| data.mark | string | 标记/备注信息 |
| data.available_cash | number | 可用现金，可用的USDT余额 |
| data.total_value | number | 总价值，账户总资产价值（USDT） |
| data.total_assets | number | 总资产，所有资产的总和 |
| data.account_summary | string | 账户摘要信息 |
| data.balances | array | 所有余额列表 |
| data.active_balances | array | 活跃余额列表（余额大于0的资产） |
| data.timestamp | number | 时间戳，数据更新时间 |
| message | string | 错误信息（仅在失败时返回） |

---

### 2. 获取持仓信息

**接口地址：** `{VITE_APP_SERVER_URL}/aster/positions/{uid}`

**请求类型：** `GET`

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| uid | string | 是 | 模型UID（路径参数） |

**请求头：**
```
Content-Type: application/json
```

**返回数据结构：**

```json
{
  "success": true,
  "data": {
    "uid": "string",
    "wallet_name": "string",
    "total_positions": 0,
    "positions": [
      {
        "symbol": "string",
        "positionAmt": "string",
        "entryPrice": "string",
        "markPrice": "string",
        "unRealizedProfit": "string",
        "liquidationPrice": "string",
        "leverage": "string",
        "maxNotionalValue": "string",
        "marginType": "string",
        "isolatedMargin": "string",
        "isAutoAddMargin": "string",
        "positionSide": "string",
        "notional": "string",
        "isolatedWallet": "string",
        "updateTime": 0
      }
    ]
  },
  "message": "string"
}
```

**返回字段说明：**

| 字段名 | 类型 | 说明 |
|--------|------|------|
| success | boolean | 请求是否成功 |
| data | object | 持仓数据对象 |
| data.uid | string | 账户UID标识 |
| data.wallet_name | string | 钱包名称 |
| data.total_positions | number | 总持仓数量 |
| data.positions | array | 持仓列表 |
| data.positions[].symbol | string | 交易对符号，如 BTCUSDT |
| data.positions[].positionAmt | string | 持仓数量，正数表示做多，负数表示做空 |
| data.positions[].entryPrice | string | 开仓均价 |
| data.positions[].markPrice | string | 标记价格（当前市场价格） |
| data.positions[].unRealizedProfit | string | 未实现盈亏（浮动盈亏） |
| data.positions[].liquidationPrice | string | 强平价格 |
| data.positions[].leverage | string | 杠杆倍数 |
| data.positions[].maxNotionalValue | string | 最大名义价值 |
| data.positions[].marginType | string | 保证金类型，如 isolated（逐仓）、crossed（全仓） |
| data.positions[].isolatedMargin | string | 逐仓保证金 |
| data.positions[].isAutoAddMargin | string | 是否自动追加保证金 |
| data.positions[].positionSide | string | 持仓方向，LONG（做多）或 SHORT（做空） |
| data.positions[].notional | string | 名义价值（持仓价值） |
| data.positions[].isolatedWallet | string | 逐仓钱包余额 |
| data.positions[].updateTime | number | 更新时间戳 |
| message | string | 错误信息（仅在失败时返回） |

---

### 3. 获取已平仓交易记录

**接口地址：** `{VITE_APP_SERVER_URL}/aster/closed-trades`

**请求类型：** `GET`

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| uid | string | 是 | 模型UID（查询参数） |
| limit | number | 否 | 返回记录数量限制，默认 10000 |

**请求头：**
```
Content-Type: application/json
```

**返回数据结构：**

```json
{
  "success": true,
  "data": {
    "trades": [
      {
        "id": "string",
        "trade_id": "string",
        "symbol": "string",
        "direction": "string",
        "side": "string",
        "quantity": "number",
        "qty": "number",
        "entry_price": "number",
        "exit_price": "number",
        "net_pnl": "number",
        "realizedPnl": "number",
        "gross_pnl": "number",
        "fees_total": "number",
        "commission": "number",
        "leverage": "number",
        "wallet_name": "string",
        "created_at": "string",
        "time": "number",
        "entry_beijing_time": "string",
        "close_beijing_time": "string",
        "holding_time": "string",
        "buyer": "boolean",
        "maker": "boolean"
      }
    ],
    "query_params": {
      "uid": "string",
      "limit": "number"
    },
    "statistics": {
      "total_trades": "number",
      "win_rate": "number",
      "total_pnl": "number"
    }
  },
  "message": "string"
}
```

**返回字段说明：**

| 字段名 | 类型 | 说明 |
|--------|------|------|
| success | boolean | 请求是否成功 |
| data | object | 交易数据对象 |
| data.trades | array | 交易记录列表 |
| data.trades[].id | string | 交易ID |
| data.trades[].trade_id | string | 交易ID（同id） |
| data.trades[].symbol | string | 交易对符号 |
| data.trades[].direction | string | 交易方向，LONG（做多）或 SHORT（做空） |
| data.trades[].side | string | 买卖方向，BUY（买入）或 SELL（卖出） |
| data.trades[].quantity | number | 交易数量 |
| data.trades[].qty | number | 交易数量（同quantity） |
| data.trades[].entry_price | number | 开仓价格 |
| data.trades[].exit_price | number | 平仓价格 |
| data.trades[].net_pnl | number | 净盈亏（扣除手续费后） |
| data.trades[].realizedPnl | number | 已实现盈亏（同net_pnl） |
| data.trades[].gross_pnl | number | 总盈亏（未扣除手续费） |
| data.trades[].fees_total | number | 总手续费 |
| data.trades[].commission | number | 手续费（同fees_total） |
| data.trades[].leverage | number | 杠杆倍数 |
| data.trades[].wallet_name | string | 钱包名称 |
| data.trades[].created_at | string | 创建时间（ISO格式） |
| data.trades[].time | number | 交易时间戳 |
| data.trades[].entry_beijing_time | string | 开仓时间（北京时间） |
| data.trades[].close_beijing_time | string | 平仓时间（北京时间） |
| data.trades[].holding_time | string | 持仓时长 |
| data.trades[].buyer | boolean | 是否为买方 |
| data.trades[].maker | boolean | 是否为挂单方 |
| data.query_params | object | 查询参数 |
| data.query_params.uid | string | 查询的UID |
| data.query_params.limit | number | 查询限制数量 |
| data.statistics | object | 交易统计信息 |
| data.statistics.total_trades | number | 总交易次数 |
| data.statistics.win_rate | number | 胜率（0-1之间的小数） |
| data.statistics.total_pnl | number | 总盈亏 |
| message | string | 错误信息（仅在失败时返回） |

---

### 4. 获取交易者余额记录（图表数据）

**接口地址：** `{VITE_APP_SERVER_URL}/app/v1/trader_balance_record`

**请求类型：** `POST`

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| uid | string | 是 | 模型UID，多个用逗号分隔，如 "uid1,uid2,uid3" |
| size | number | 否 | 返回记录数量，默认 10000 |

**请求头：**
```
Content-Type: application/json
```

**请求体示例：**
```json
{
  "uid": "rfg_ai,deepseek",
  "size": 10000
}
```

**返回数据结构：**

```json
{
  "success": true,
  "data": [
    {
      "rfg_ai": [
        {
          "wrt_time": "string",
          "balance_json": {
            "total_asset": "number"
          }
        }
      ]
    },
    {
      "deepseek": [
        {
          "wrt_time": "string",
          "balance_json": {
            "total_asset": "number"
          }
        }
      ]
    }
  ],
  "message": "string"
}
```

**返回字段说明：**

| 字段名 | 类型 | 说明 |
|--------|------|------|
| success | boolean | 请求是否成功 |
| data | array | 按UID分组的数据数组 |
| data[] | object | 每个对象包含一个UID的数据，键名为UID，值为记录数组 |
| data[][uid][] | array | 该UID的余额记录列表 |
| data[][uid][].wrt_time | string | 记录时间（ISO格式字符串） |
| data[][uid][].balance_json | object | 余额信息对象 |
| data[][uid][].balance_json.total_asset | number | 总资产价值（USDT） |
| message | string | 错误信息（仅在失败时返回） |

**说明：**
- 当传入多个UID时，返回的数据是一个数组，每个元素是一个对象
- 每个对象的键是UID，值是该UID对应的记录数组
- 记录按时间倒序排列（最新的在前）

---

## Aster Finance 公开 API

Aster Finance API 的基础 URL 为：`https://fapi.asterdex.com`

以下接口为公开接口，无需认证即可访问。

### 1. 获取交易对价格

**接口地址：** `https://fapi.asterdex.com/fapi/v3/ticker/price`

**请求类型：** `GET`

**认证方式：** 无需认证（公开接口）

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| symbol | string | 是 | 交易对符号，如 BTCUSDT |

**返回数据结构：**

```json
{
  "symbol": "string",
  "price": "string",
  "time": 0
}
```

**返回字段说明：**

| 字段名 | 类型 | 说明 |
|--------|------|------|
| symbol | string | 交易对符号 |
| price | string | 当前价格（USDT） |
| time | number | 价格更新时间戳（毫秒） |

**支持的交易对：**
- BTCUSDT
- BNBUSDT
- SOLUSDT
- DOGEUSDT
- ETHUSDT
- XRPUSDT

---

### 2. 获取标记价格K线数据

**接口地址：** `https://fapi.asterdex.com/fapi/v3/markPriceKlines`

**请求类型：** `GET`

**认证方式：** 无需认证（公开接口）

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| symbol | string | 是 | 交易对符号，如 BTCUSDT |
| interval | string | 是 | K线间隔，如 5m, 15m, 1h, 1d |
| limit | number | 否 | 返回数量，最大 1500，默认 500 |
| startTime | number | 否 | 开始时间戳（毫秒） |
| endTime | number | 否 | 结束时间戳（毫秒） |

**返回数据结构：**

```json
[
  [
    0,  // 开盘时间（毫秒时间戳）
    "string",  // 开盘价
    "string",  // 最高价
    "string",  // 最低价
    "string",  // 收盘价
    "string",  // 标记价格
    "string",  // 收盘时间（毫秒时间戳）
    "string"   // 忽略
  ]
]
```

**返回字段说明：**

数组格式的K线数据，每个元素是一个数组：

| 索引 | 类型 | 说明 |
|------|------|------|
| 0 | number | 开盘时间（毫秒时间戳） |
| 1 | string | 开盘价 |
| 2 | string | 最高价 |
| 3 | string | 最低价 |
| 4 | string | 收盘价（标记价格） |
| 5 | string | 标记价格 |
| 6 | string | 收盘时间（毫秒时间戳） |
| 7 | string | 其他数据（通常为空） |

---

## 接口使用说明

### 环境变量配置

项目使用环境变量配置API基础URL：

- `VITE_APP_SERVER_URL`: 后端服务基础URL

### 错误处理

所有接口的通用错误响应格式：

```json
{
  "success": false,
  "message": "错误信息描述",
  "error": "详细错误信息"
}
```

### 数据缓存

项目中实现了数据缓存机制，部分接口支持缓存：

- 余额信息缓存
- 持仓信息缓存
- 交易记录缓存

缓存键名格式：`{api_name}/{uid}`

---

## 更新日志

- 2025-01-XX: 整理当前使用的接口文档，移除已废弃的API

