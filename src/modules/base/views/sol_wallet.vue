<template>
	<cl-crud ref="Crud">
	  <cl-row>
		<a-button type="primary" @click="showModal">创建钱包</a-button>
		<a-button type="primary" @click="showimport">导入钱包</a-button>
		<a-button type="primary" danger @click="handleDeleteSelected">删除钱包</a-button>
		<a-button type="primary" @click="exportToExcelFile">导出钱包</a-button>
	  </cl-row>
	  
	  <div>
		<a-checkbox-group v-model:value="checkedGroups" :options="uniqueGroups" />
	  </div>
  
	  <a-table
		ref="tableRef"
		:columns="columns"
		:dataSource="data"
		:rowSelection="rowSelection"
		:pagination="false"
		rowKey="key"
	  />
  
	  <!-- Create Wallet Modal -->
	  <a-modal
		:visible="isModalVisible_import"
		title="批量添加地址"
		@ok="handlebatch_import"
		@cancel="handleCancel_import"
		okText="导入"
		cancelText="取消"
	  >
		<p style="white-space: pre-line;"></p>
		<textarea
		  v-model="batchTextareaContent"
		  placeholder="输入格式：备注,分组,私钥\n（换行）"
		  :rows="4"
		>
		</textarea>
	  </a-modal>
  
	  <a-modal
		:visible="isModalVisible"
		title="创建钱包"
		okText="创建"
		@ok="handleCreate"
		@cancel="handleCancel"
	  >
		<a-form form="form" layout="vertical" :model="form">
		  <a-form-item label="数量" name="quantity" :rules="[{ required: true, message: '请输入数量!' }]">
			<a-input v-model:value="form.quantity" />
		  </a-form-item>
		  <a-form-item label="备注" name="name" :rules="[{ required: true, message: '请输入备注名!' }]">
			<a-input v-model:value="form.name" />
		  </a-form-item>
		  <a-form-item label="分组" name="group" :rules="[{ required: true, message: '请输入分组!' }]">
			<a-input v-model:value="form.group" />
		  </a-form-item>
		</a-form>
	  </a-modal>
	</cl-crud>
  </template>
  
  <script lang="ts" setup>
  import { ref, reactive, onMounted, watch, computed } from 'vue';
  import { useCrud } from "@cool-vue/crud";
  import { useCool } from "/@/cool";
  import { notification } from "ant-design-vue";
  import { createWallet_sol, getAddress_sol } from "../utils/wallet_utils";
  import { deleteData } from "../utils/indexedDB/deleteData.ts";
  import { dbConfig, getAllKeys, update, remove, get, add, initDB } from "../utils/indexedDB/indexedDB.ts";
  import { exportToExcel } from "../utils/save_excel";


  const { service } = useCool();
  
  const Crud = useCrud({ service: service.base.sys.role }, (app) => {
	app.refresh();
  });
  
  const columns = [
	{
	  title: "index",
	  key: "index",
	  align: "center",
	  render: (text, record, index) => index + 1,
	},
	{
	  title: '名字',
	  dataIndex: 'name',
	  key: 'name',
	},
	{
	  title: '分组',
	  dataIndex: 'group',
	  key: 'group',
	},
	{
	  title: '地址',
	  dataIndex: 'address',
	  key: 'address',
	},
	{
	  title: '余额(sol)',
	  dataIndex: 'balance',
	  key: 'balance',
	},
	{
	  title: 'ip代理',
	  dataIndex: 'IP',
	  key: 'IP',
	},
  ];
  
  const checkedGroups = ref([]);
  const batchTextareaContent = ref('');
  const data = ref([]);
  const isModalVisible = ref(false);
  const isModalVisible_import = ref(false);
  const form = ref({
	quantity: '',
	group: '',
	name: ''
  });

  const fetchIndexedDBData = async () => {
    try {
        const keys = await getAllKeys('solWalletManage');
        if (keys) {
            const allWallets = await Promise.all(keys.map(key => get('solWalletManage', key)));
            console.log(allWallets);

            data.value = allWallets.filter(wallet => wallet !== null).map((wallet, index) => ({
                key: index.toString(),
                address: wallet.address,
                ...wallet.data
            }));
            console.log(data.value);
        }
    } catch (error) {
        console.error('Failed to fetch data from IndexedDB:', error);
    }
};

    onMounted(() => {
        initDB(dbConfig);
        fetchIndexedDBData();
    });
  const idCounter_sol = ref(localStorage.getItem('idCounter_sol') ? parseInt(localStorage.getItem('idCounter_sol')) : 1);
  
  const showimport = () => {
	isModalVisible_import.value = true;
  }
  
  const showModal = () => {
	isModalVisible.value = true;
  };
  
  const handleCancel = () => {
	isModalVisible.value = false;
  };
  
  const handleCancel_import = () => {
	isModalVisible_import.value = false;
  };
  

  
  
  const updateIdCounterInLocalStorage = () => {
	localStorage.setItem('idCounter_sol', idCounter_sol.value.toString());
  };
  
  const saveDataToIndexedDB = async () => {
    try {
        await Promise.all(data.value.map(wallet => update('solWalletManage', wallet)));
    } catch (error) {
        console.error('Failed to save data to IndexedDB:', error);
    }
  };

  watch(data, saveDataToIndexedDB, { deep: true });


  watch(idCounter_sol, updateIdCounterInLocalStorage);
  
  const handlebatch_import = async () => {
    const data_tmp = ref([]);
	try {
	  console.log(batchTextareaContent.value);
	  const rawContent = batchTextareaContent.value.trim();
	  console.log('rawContent:', rawContent);
	  if (!rawContent) {
		throw new Error("批量添加内容不能为空");
	  }
  
	  const lines = rawContent.split('\n');
	  for (const line of lines) {
		const [name, group, privateKey] = line.split(',');
		if (name && group && privateKey) {
		  const address = await getAddress_sol(privateKey);  // 解析地址
		  const existingIndex = data.value.findIndex(wallet => wallet.address === address);
		  if (existingIndex !== -1) {
			// 如果地址已存在，则覆盖原有的数据
			data.value[existingIndex] = {
			  key: data.value[existingIndex].key, // 保持原有的 key
			  name: name.trim(),
			  group: group.trim(),
			  address: address,
			  privateKey: privateKey.trim(),
			  balance: 0,
			  token: 0,
			};
		  } else {
			// 如果地址不存在，则添加新的数据
			data.value.push({
			  key: idCounter_sol.value.toString(), // 增加唯一键
			  name: name.trim(),
			  group: group.trim(),
			  address: address,
			  privateKey: privateKey.trim(),
			  balance: 0,
			  token: 0,
			});
			idCounter_sol.value++;
		  }
		}
	  }
	  localStorage.setItem('addresses', JSON.stringify(data.value));
	  localStorage.setItem('idCounter_sol', idCounter_sol.value.toString());
  
	  notification.success({
		message: "成功",
		description: "批量添加完成",
		duration: 1,
	  });
	} catch (error) {
	  notification.error({
		message: "错误",
		description: error.message,
		duration: 1,
	  });
	} finally {
	  isModalVisible_import.value = false;
	}
  };
  
  const handleCreate = async () => {

    try {
        const quantity = parseInt(form.value.quantity, 10);
        const group = form.value.group;
        const name = form.value.name;
        if (isNaN(quantity) || quantity <= 0) {
        throw new Error("数量必须是一个有效的正整数");
        }

        const wallets = await createWallet_sol(group, quantity);

        for (const wallet of wallets) {
        const { address, privateKey } = wallet;
        console.log(address.toString())
        console.log(privateKey)

        const newWallet = {
            address:address.toString(),
            data: {
                name,
                group,
                privateKey,
                balance: 0,   // 
                token: 0,     // 
                settoken: '', // 
                idCounter_sol:idCounter_sol.value.toString(),
                data: ''
                // 其他你想要存储的数据字段
            }
        };
        console.log(newWallet)

        await add('solWalletManage', newWallet);
        idCounter_sol.value++;
        }

        notification.success({
        message: "成功",
        description: "批量创建完成,请及时导出私钥！",
        duration: 1,
        });

        isModalVisible.value = false;
        form.value.quantity = '';
        form.value.group = '';
    } catch (error) {
        notification.error({
        message: "错误",
        description: error.message,
        duration: 1,
        });
    }
    };

  
  const handleRefresh = async () => {
	try {
	  data.value.forEach(async (wallet) => {
		// const response = await getAllZksSyncData(wallet.address);
		// wallet.balance = response.balance;
	  });
	  notification.success({
		message: "完成",
		description: "刷新地址数据完成",
		duration: 1,
	  });
	} catch (error) {
	  notification.error({
		message: "错误",
		description: error.message,
		duration: 1,
	  });
	}
  };
  
  const handleDeleteSelected = async () => {
    try {
        const selectedKeys = rowSelection.selectedRowKeys;
        if (!selectedKeys || selectedKeys.length === 0) {
        notification.error({
            message: "错误",
            description: "请选择要删除的钱包",
            duration: 1,
        });
        return;
        }

        const addresses = data.value.filter(item => selectedKeys.includes(item.key)).map(item => item.address);
        await deleteData('solWalletManage', addresses);

        data.value = data.value.filter(wallet => !selectedKeys.includes(wallet.key));

        notification.success({
        message: "删除成功",
        description: "选中的钱包已被删除",
        duration: 1,
        });
    } catch (error) {
        notification.error({
        message: "错误",
        description: error.message,
        duration: 1,
        });
    }
    };

  
  const exportToExcelFile = () => {
	const exportData = data.value.map(wallet => ({
	  name: wallet.name,
	  group: wallet.group,
	  address: wallet.address,
	  privateKey: wallet.privateKey
	}));
	exportToExcel(exportData, 'aiowallet.xlsx');
  };
  
  const rowSelection = reactive({
	selectedRowKeys: [],
	onChange: (selectedRowKeys) => {
	  console.log('Selected keys:', selectedRowKeys);
	  rowSelection.selectedRowKeys = selectedRowKeys;
	}
  });
  
  // 获取所有的分组
  const uniqueGroups = computed(() => {
	const groups = new Set();
	data.value.forEach(item => groups.add(item.group));
	return Array.from(groups);
  });
  
  // 选择分组后，选择该分组的所有行
  const selectedGroup = ref('');
  const selectGroupRows = () => {
	const group = selectedGroup.value;
	if (group) {
	  rowSelection.selectedRowKeys = data.value.filter(item => item.group === group).map(item => item.key);
	}
  };
  
  watch(checkedGroups, (newVal) => {
	if (newVal.length === 0) {
	  rowSelection.selectedRowKeys = [];
	} else {
	  rowSelection.selectedRowKeys = [];
	  newVal.forEach(group => {
		const groupRows = data.value.filter(item => item.group === group).map(item => item.key);
		rowSelection.selectedRowKeys.push(...groupRows);
	  });
	}
  });
  </script>
  