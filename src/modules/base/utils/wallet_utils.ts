// getAddress.ts
import { ethers } from 'ethers';
import { Web3 } from "web3";
import axios from 'axios';
import {
    Connection, PublicKey, LAMPORTS_PER_SOL, Keypair, 
  } from '@solana/web3.js';
import bs58 from 'bs58';

interface TokenData {
    token: string;
}

interface TransactionParams {
    from: string;
    to: string;
    value: bigint;
    gas: number;
    nonce: number;
    gasPrice: string;
    maxPriorityFeePerGas?: string;
    maxFeePerGas?: string;
}

interface Wallet {
    group: string;
    privateKey: string;
    address: string;
}

/**
 * 根据私钥获取地址的函数
 * @param {string} privateKey - 要获取地址的私钥
 * @returns {Promise<string | null>} - 对应私钥的地址
 */
export const getAddress = async (privateKey: string)=> {
    try {
        const wallet = new ethers.Wallet(privateKey);
        const address = wallet.address;
        return address;
    } catch (error) {
        console.error('获取地址时出错:', error);
        return null;
    }
}

// 生成随机私钥的函数
export const generatePrivateKey = (): string | null => {
    try {
        const wallet = ethers.Wallet.createRandom();
        const privateKey = wallet.privateKey;
        return privateKey;
    } catch (error) {
        console.error("生成私钥失败:", error);
        return null;
    }
};

export const getGas = async (rpcs: string): Promise<string> => {
    if (!rpcs) {
        console.log("RPCs not defined. Returning gas price as 0.00 gwei.");
        return '0.00';
    }

    const provider = new ethers.providers.JsonRpcProvider(rpcs);
    const gasPrice = await provider.getGasPrice();
    console.log(`Gas price: ${ethers.utils.formatUnits(gasPrice, 'gwei')} gwei`);

    return ethers.utils.formatUnits(gasPrice, 'gwei');
}

export const getTokenData = async (walletAddress: string, network: string): Promise<TokenData> => {
    try {
        let rpcLink = network;
        if (!rpcLink) {
            return { token: "Error: Invalid Network Name" };
        }
        console.log(rpcLink);
        const web3 = new Web3(rpcLink);
        const amountInWei = await web3.eth.getBalance(walletAddress);
        console.log(amountInWei);
        const amountInWeiNumber = (parseInt(amountInWei, 16) / 10 ** 21) === 0 ? 0 : (parseInt(amountInWei, 16) / 10 ** 21).toFixed(3);

        return { token: amountInWeiNumber.toString() };
    } catch (error) {
        console.error(error);
        return { token: "-" };
    }
}

export const transferOneto = async (sendaddr: string, pk: string, network: string, reciveaddr: string, amount: string): Promise<void> => {
    try {
        let rpcLink = network;
        if (!rpcLink) {
            throw new Error("Error: Invalid Network Name");
        }
        const provider = new ethers.providers.JsonRpcProvider(rpcLink);
        const wallet = new ethers.Wallet(pk, provider);
        const gasPrice = await provider.getGasPrice();
        const nonce = await provider.getTransactionCount(sendaddr);
        const gasEstimate = await provider.estimateGas({
            to: reciveaddr,
            value: amount,
            data: "0x",
        });

        const transaction = {
            to: reciveaddr,
            value: amount,
            gasPrice: gasPrice,
            nonce: nonce,
            gas: gasEstimate,
            data: "0x",
        };

        let sendTransactionPromise = wallet.sendTransaction(transaction);

        sendTransactionPromise.then((tx) => {
            console.log(tx);
        });
    } catch (error) {
        console.error(error);
    }
}

export const buildTransaction = async (address: string, rpc: string, to: string, value: number, fixed: number): Promise<TransactionParams> => {
    const web3 = new Web3(rpc);
    const amount = BigInt(web3.utils.toWei((value / 10 ** 2).toString(), 'ether'));

    try {
        const gasPrice = await web3.eth.getGasPrice();
        const nonce = await web3.eth.getTransactionCount(address);
        const gasLimit = await web3.eth.estimateGas({
            from: address,
            to: to,
            value: amount,
        });

        return {
            from: address,
            to: to,
            value: amount - BigInt(gasLimit * parseInt(gasPrice)),
            gas: gasLimit * fixed,
            nonce: nonce,
            gasPrice: gasPrice,
        };
    } catch (error) {
        throw new Error(`构建交易失败: ${error.message}`);
    }
};

export const sendTransaction = async (transaction: TransactionParams, pk: string, rpc: string): Promise<any> => {
    const web3 = new Web3(rpc);
    try {
        const signedTransaction = await web3.eth.accounts.signTransaction(transaction, pk);
        return web3.eth.sendSignedTransaction(signedTransaction.rawTransaction as string);
    } catch (error) {
        throw new Error(`发送交易失败: ${error.message}`);
    }
};

export const testRPC = async (rpc_get: string): Promise<{ success: boolean, message: string }> => {
    const startTime = Date.now();
    try {
        const response = await axios.get(rpc_get, {
            timeout: 5000,
        });

        const endTime = Date.now();
        const latency = endTime - startTime;
        console.log('RPC可用，延迟：', latency, 'ms');
        return { success: true, message: `RPC可用，延迟：${latency}ms` };
    } catch (error) {
        console.error('RPC不可用:', error.message);
        return { success: false, message: `RPC不可用: ${error.message}` };
    }
};

export const buildMint = async (address: string, rpc: string, to: string, value: number, fixed: number, Max?: number, Prior?: number): Promise<TransactionParams> => {
    const web3 = new Web3(rpc);
    const amount = BigInt(web3.utils.toWei((value / 10 ** 2).toString(), 'ether'));
    try {
        const gasPrice = await web3.eth.getGasPrice();
        const nonce = await web3.eth.getTransactionCount(address);
        const gasLimit = await web3.eth.estimateGas({
            from: address,
            to: to,
            value: amount,
        });

        let transactionParams: TransactionParams = {
            from: address,
            to: to,
            value: amount - BigInt(gasLimit * parseInt(gasPrice)),
            gas: gasLimit * fixed,
            nonce: nonce,
            gasPrice: gasPrice,
        };

        if (Max && Prior) {
            transactionParams.maxPriorityFeePerGas = Prior.toString();
            transactionParams.maxFeePerGas = Max.toString();
        }

        return transactionParams;
    } catch (error) {
        throw new Error(`构建交易失败: ${error.message}`);
    }
};

export const createWallet = async (group: string, count: number): Promise<Wallet[]> => {
    const wallets: Wallet[] = [];
    for (let i = 0; i < count; i++) {
        const privateKey = generatePrivateKey();
        const address = await getAddress(privateKey as string);
        wallets.push({ group, privateKey: privateKey as string, address: address as string });
    }
    return wallets;
};

export const createWallet_sol = async (group: string, count: number): Promise<Wallet[]> => {
    const wallets: Wallet[] = [];
    for (let i = 0; i < count; i++) {
        const wallet = Keypair.generate();
        const privateKey = bs58.encode(wallet.secretKey);
        const address = wallet.publicKey;
        console.log(privateKey)
        wallets.push({ group, privateKey: privateKey as string, address: address as string });
    }
    return wallets;
};

export const getAddress_sol = async (privateKey: string)=> {
    try {
        const wallet = Keypair.fromSecretKey(bs58.decode(privateKey));
        const address = wallet.publicKey;
        return address;
    } catch (error) {
        console.error('获取地址时出错:', error);
        return null;
    }
}