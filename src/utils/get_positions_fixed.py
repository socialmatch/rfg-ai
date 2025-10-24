#!/usr/bin/env python3
"""
获取 Aster 期货仓位示例 - 修正版

使用说明:
1. 替换下面的 USER_ADDRESS、SIGNER_ADDRESS、PRIVATE_KEY
2. 运行脚本: python get_positions_fixed.py
"""

import json
import os
import sys
import time

import httpx
from eth_hash.auto import keccak as eth_keccak
from eth_keys import keys

# ===== 配置你的信息 =====
USER_ADDRESS = "0xbcd72a4206dfF98bF64D6563Fa29b5Ac45D4095d"
SIGNER_ADDRESS = "0x8a50BF4Ad95E01981479bdcd47D5cCdd0946eC6e"
PRIVATE_KEY = ""

BASE_URL = "https://fapi.asterdex.com"


def stringify_params(params: dict) -> dict:
    """将参数值转换为字符串 - 与原始实现一致"""
    normalized = {}
    for key, value in params.items():
        if isinstance(value, bool):
            normalized[key] = "true" if value else "false"
        elif isinstance(value, float):
            # 浮点数格式化，去除末尾0
            normalized[key] = format(value, "f").rstrip("0").rstrip(".")
        elif isinstance(value, int):
            normalized[key] = str(value)
        else:
            normalized[key] = str(value)
    return normalized


def sign_params(params: dict, user_address: str, signer_address: str, private_key: str) -> dict:
    """对 API 参数进行签名 - 完全按照原始实现"""
    # 添加必要参数
    params.setdefault("timestamp", int(time.time() * 1000))
    params.setdefault("recvWindow", 5000)

    # 生成 nonce (微秒时间戳)
    nonce = int(time.time() * 1_000_000)

    # 序列化参数
    normalized = stringify_params(params)
    json_str = json.dumps(normalized, sort_keys=True, separators=(",", ":"))

    # 编码
    result = b""
    result += (4 * 32).to_bytes(32, "big")  # 参数指针
    result += bytes.fromhex(user_address[2:].rjust(64, "0"))  # user_address
    result += bytes.fromhex(signer_address[2:].rjust(64, "0"))  # signer_address
    result += nonce.to_bytes(32, "big")  # nonce

    # JSON字符串
    json_bytes = json_str.encode("utf-8")
    result += len(json_bytes).to_bytes(32, "big")
    result += json_bytes

    # 填充
    padding = (32 - (len(json_bytes) % 32)) % 32
    result += b"\x00" * padding

    # 计算哈希
    payload_hash = eth_keccak(result)
    eth_prefix = b"\x19Ethereum Signed Message:\n"
    prefix = eth_prefix + str(len(payload_hash)).encode("ascii")
    sign_hash = eth_keccak(prefix + payload_hash)

    # 签名
    if private_key.startswith("0x"):
        private_key = private_key[2:]
    private_key_obj = keys.PrivateKey(bytes.fromhex(private_key))
    signature = private_key_obj.sign_msg_hash(sign_hash).to_hex()

    # 返回带签名的参数
    signed = normalized.copy()
    signed.update({
        "nonce": str(nonce),
        "user": user_address,
        "signer": signer_address,
        "signature": signature,
    })

    return signed


def get_positions():
    """获取当前所有仓位"""
    # API 端点
    endpoint = "/fapi/v3/positionRisk"
    url = BASE_URL + endpoint

    # 准备参数（获取所有仓位不需要额外参数）
    params = {}

    # 签名
    signed_params = sign_params(params, USER_ADDRESS, SIGNER_ADDRESS, PRIVATE_KEY)

    # 发送请求
    with httpx.Client() as client:
        response = client.get(url, params=signed_params)

        if response.status_code == 200:
            positions = response.json()
            return positions
        else:
            print(f"错误: {response.status_code} - {response.text}")
            return None


def main():
    """主函数"""
    # 检查配置
    if USER_ADDRESS == "0x0000000000000000000000000000000000000000" or \
       SIGNER_ADDRESS == "0x0000000000000000000000000000000000000000" or \
       PRIVATE_KEY == "0000000000000000000000000000000000000000000000000000000000000000":
        print("❌ 请先配置 USER_ADDRESS、SIGNER_ADDRESS 和 PRIVATE_KEY")
        print("编辑脚本，填入你的实际信息")
        sys.exit(1)

    print("📊 获取 Aster 期货仓位信息...\n")

    # 获取仓位
    positions = get_positions()

    if positions is None:
        print("❌ 获取仓位失败")
        return

    # 显示结果
    if not positions:
        print("✅ 当前没有持仓")
    else:
        # 过滤出有实际持仓的
        active_positions = [p for p in positions if float(p.get("positionAmt", "0")) != 0]

        if not active_positions:
            print("✅ 当前没有活跃持仓")
            return

        print(f"📈 当前有 {len(active_positions)} 个活跃持仓:\n")
        total_pnl = 0

        for pos in active_positions:
            symbol = pos.get("symbol", "")
            position_amt = float(pos.get("positionAmt", "0"))
            entry_price = float(pos.get("entryPrice", "0"))
            mark_price = float(pos.get("markPrice", "0"))
            unrealized_pnl = float(pos.get("unRealizedProfit", "0"))
            leverage = pos.get("leverage", "1")

            side = "做多" if position_amt > 0 else "做空"
            total_pnl += unrealized_pnl

            print(f"交易对: {symbol}")
            print(f"方向: {side}")
            print(f"数量: {abs(position_amt)}")
            print(f"开仓价: {entry_price}")
            print(f"标记价: {mark_price}")
            print(f"未实现盈亏: {unrealized_pnl:.4f} USDT")
            print(f"杠杆: {leverage}x")
            print("-" * 40)

        print(f"\n💰 总未实现盈亏: {total_pnl:.4f} USDT")


if __name__ == "__main__":
    main()