import { ethers } from 'ethers'
import axios from 'axios';

const user = '0xbcd72a4206dfF98bF64D6563Fa29b5Ac45D4095d';
const signer = '0x8a50BF4Ad95E01981479bdcd47D5cCdd0946eC6e';
const privateKey = '';

const baseUrl = 'https://fapi.asterdex.com';

function stringifyParams(params: any): any {
  const normalized: any = {};
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'boolean') {
      normalized[key] = value ? 'true' : 'false';
    } else if (typeof value === 'number') {
      if (Number.isInteger(value)) {
        normalized[key] = value.toString();
      } else {
        // 浮点数格式化，去除末尾0
        normalized[key] = value.toFixed(10).replace(/\.?0+$/, '');
      }
    } else {
      normalized[key] = String(value);
    }
  }
  return normalized;
}

async function signParams(params: any, userAddress: string, signerAddress: string, privateKey: string): Promise<any> {
  // 添加必要参数
  const timestamp = Math.floor(Date.now() / 1000);
  const recvWindow = 50000;

  params.timestamp = timestamp;
  params.recvWindow = recvWindow;

  // 生成 nonce (微秒时间戳)
  const nonce = Math.floor(Date.now() * 1000);

  // 序列化参数
  const normalized = stringifyParams(params);
  const jsonStr = JSON.stringify(normalized, Object.keys(normalized).sort());

  console.log('JSON payload:', jsonStr);

  // 使用ethers.js的AbiCoder编码
  const data = ethers.AbiCoder.defaultAbiCoder().encode(
    ['string', 'address', 'address', 'uint256'],
    [jsonStr, userAddress, signerAddress, nonce]
  );

  console.log('Encoded data:', data);

  const digest = ethers.keccak256(data);
  console.log('Digest:', digest);

  // 使用ethers.js签名
  const wallet = new ethers.Wallet(privateKey);
  const digestBytes = ethers.getBytes(digest);
  const signature = await wallet.signMessage(digestBytes);
  console.log('Signature:', signature);

  // 返回带签名的参数
  const signed = { ...normalized };
  signed.nonce = nonce.toString();
  signed.user = userAddress;
  signed.signer = signerAddress;
  signed.signature = signature;

  return signed;
}

async function getPositions() {
  const endpoint = '/fapi/v3/positionRisk';
  const url = baseUrl + endpoint;

  const params = {};
  const signedParams = await signParams(params, user, signer, privateKey);

  console.log('Signed params:', signedParams);

  try {
    const response = await axios.get(url, { params: signedParams });
    return response.data;
  } catch (error: any) {
    console.error('Error:', error.response?.status, error.response?.data);
    return null;
  }
}

async function main() {
  console.log('📊 获取 Aster 期货仓位信息...\n');

  const positions = await getPositions();

  if (positions === null) {
    console.log('❌ 获取仓位失败');
    return;
  }

  if (!positions || positions.length === 0) {
    console.log('✅ 当前没有持仓');
    return;
  }

  // 过滤出有实际持仓的
  const activePositions = positions.filter((p: any) => parseFloat(p.positionAmt || '0') !== 0);

  if (activePositions.length === 0) {
    console.log('✅ 当前没有活跃持仓');
    return;
  }

  console.log(`📈 当前有 ${activePositions.length} 个活跃持仓:\n`);
  let totalPnl = 0;

  for (const pos of activePositions) {
    const symbol = pos.symbol || '';
    const positionAmt = parseFloat(pos.positionAmt || '0');
    const entryPrice = parseFloat(pos.entryPrice || '0');
    const markPrice = parseFloat(pos.markPrice || '0');
    const unrealizedPnl = parseFloat(pos.unRealizedProfit || '0');
    const leverage = pos.leverage || '1';

    const side = positionAmt > 0 ? '做多' : '做空';
    totalPnl += unrealizedPnl;

    console.log(`交易对: ${symbol}`);
    console.log(`方向: ${side}`);
    console.log(`数量: ${Math.abs(positionAmt)}`);
    console.log(`开仓价: ${entryPrice}`);
    console.log(`标记价: ${markPrice}`);
    console.log(`未实现盈亏: ${unrealizedPnl.toFixed(4)} USDT`);
    console.log(`杠杆: ${leverage}x`);
    console.log('-'.repeat(40));
  }

  console.log(`\n💰 总未实现盈亏: ${totalPnl.toFixed(4)} USDT`);
}

main();