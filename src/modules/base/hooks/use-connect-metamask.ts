// @ts-nocheck

/**
 * 链接metamask钱包
 * 参考文章：https://hicoldcat.com/posts/blockchain/how-to-build-a-web3-login-with-web3js-library/
 */
import Web3 from "web3";
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { USER_WALLET_ADDRESS, SIGN } from "../const/localstorage";


// 将 Metamask 连接相关的逻辑封装成一个 Vue 组合式函数
export function useConnectMetamask() {
    // 用户钱包地址
    const addresses = ref<string[]>([]);
    // 按钮 loading 状态
    const loading = ref(false);

    // 连接 Metamask 钱包
    const connectMetamask = async (genNonce) => {
        loading.value = true;
        const exampleMessage = '你好, 欢迎登录AIObot,' + genNonce;
        console.log(exampleMessage);
        if (!window.ethereum) return alert("请先安装 Metamask 钱包");
        try {
            const from = await window.ethereum.request({
                method: "eth_requestAccounts",
            });
            const encoder = new TextEncoder();
            const msgBuffer = encoder.encode(exampleMessage);
            const hexString = Array.prototype.map.call(msgBuffer, function (byte) {
                return ('0' + (byte & 0xFF).toString(16)).slice(-2);
            }).join('');
            const signature = await window.ethereum.request({
                "method": "personal_sign",
                "params": [
                    '0x' + hexString,
                    from[0]
                ]
            });
            // console.log(signature);
            // 保存用户钱包地址
            // localStorage.setItem(SIGN, signature);
            localStorage.setItem(USER_WALLET_ADDRESS, JSON.stringify(from));
            return { signature, from };
        } catch (err) {
            console.error(err);
        } finally {
            loading.value = false;
        }
    };


    // 退出 Metamask 钱包
    const disconnect = () => {
        localStorage.removeItem(USER_WALLET_ADDRESS);
        addresses.value = [];
    };

    // 检测 Metamask 钱包连接状态
    const isConnect = computed(() => {
        console.log(addresses);
        return addresses.value.length > 0;
    });

    // 监听 Metamask 钱包连接状态的变化
    onMounted(() => {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
        }
        const storedData = localStorage.getItem(USER_WALLET_ADDRESS);
        console.log("Stored data from localStorage:", storedData);
        try {
            addresses.value = JSON.parse(storedData || "[]");
        } catch (error) {
            console.log("Error parsing JSON data:", error);
            addresses.value = [];
        }
    });

    // 在组件销毁时取消监听
    onUnmounted(() => {
        addresses.value = [];
    });

    // 返回相关数据和方法
    return {
        loading,
        addresses,
        isConnect,
        disconnect,
        connectMetamask,
    };
}

