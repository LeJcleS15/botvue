<template>
	<cl-crud ref="Crud">

	  
	  <div>
		<a-checkbox-group v-model:value="checkedGroups" :options="uniqueGroups" />
	  </div>
	  <div >
		<div>
      <el-row :gutter="1200">
				<el-col :lg="6" :md="12" :xs="24">
					<ul>
					<li>
						<div class="card" style="height: 500px; width: 1100px; overflow: auto;">
							<a-table
								ref="tableRef"
								:columns="columns"
								:dataSource="data"
								:rowSelection="rowSelection"
								:pagination="false"
								height="10"
								rowKey="key"
							/>
						</div>
					</li>
					<li class="button-group">
						<a-button type="primary" @click="run_task">开始任务</a-button>
						<a-button type="primary" danger @click="stop_task">停止任务</a-button>
						<a-button type="primary" @click="clear_log">清空日志</a-button>
						<a-button type="primary" @click="flush_wallet">刷新钱包</a-button>
					</li>
					
					<li class="tab-group" style="height: 500px; width: 600px; " >
						<a-tabs size="large">
							<a-tab-pane key="1" tab="执行日志"><pre>{{ executionLog }}</pre></a-tab-pane>
							<a-tab-pane key="2" tab="成功日志"><pre>{{ successLog }}</pre></a-tab-pane>
							<a-tab-pane key="3" tab="失败日志"><pre>{{ failureLog }}</pre></a-tab-pane>
						</a-tabs>
					</li>
					</ul>
				</el-col>
				<el-col :lg="6" :md="24" :xs="24">
					<div class="card" style="height: 800px; width: 700px; overflow: auto;">
						<Divider>
							<p>系统配置</p>
						</Divider>
						<a-button type="primary" @click="config_task">配置任务</a-button>
						<ul>
							<li>
								<el-switch v-model="autoGas"  /> 自动qas
							</li>
							<li>
								<el-switch v-model="randomdex" /> dapp随机轮询
							</li>
							<li>
								<el-switch v-model="autoslip" />自动滑点(0.3%)
							</li>
							<li>
								<el-switch v-model="swap_all_to_eth"/>USDT -> ETH (全换)
							</li>
							<li>
								<a-row :gutter="20">
									<a-col>
										<p>随机时间间隔:</p>
									</a-col>	
									<a-col span="4">
										<a-input v-model:value="pause_min" placeholder="" />
									</a-col>

									<a-col>
										<p>-</p>
									</a-col>

									<a-col span="4">
										<a-input v-model:value="pause_max" placeholder="" />
									</a-col>
									<a-col>
										<p>min</p>
									</a-col>
								</a-row>
							</li>
							<li>
								<a-row :gutter="15">
									<a-col span="4">
										<p>ETH->USDT</p>
									</a-col>
									<a-col span="4">
										<a-input v-model:value="amount_min" placeholder="" />
									</a-col>
									<a-col>
										<p>-</p>
									</a-col>
									<a-col span="4">
										<a-input v-model:value="amount_max" placeholder="" />
									</a-col>
									<a-col span="10">
										<p>%</p>
									</a-col>
								</a-row>
							</li>
						</ul>
						<Divider>
							<p>skydrome</p>
						</Divider>
						<ul>
							<li>
								<el-switch v-model="skydrome_swap"/>ETH  -> USDT
							</li>
							<li>
								<el-switch></el-switch>组LP
							</li>
							<li>
								<el-switch></el-switch>解LP
							</li>
						</ul>
						<Divider>
							<p>punk</p>
						</Divider>
						<ul>
							<li>
								<el-switch v-model="punk_swap"/> ETH  -> USDT
							</li>
							<li>
								<el-switch></el-switch>组LP
							</li>
							<li>
								<el-switch></el-switch>解LP
							</li>
						</ul>
						<Divider>
							<p>zebra</p>
						</Divider>
						<ul>
							<li>
								<el-switch v-model="zebra_swap"/>ETH  -> USDT
							</li>
							<li>
								<el-switch></el-switch>组LP
							</li>
							<li>
								<el-switch></el-switch>解LP
							</li>
						</ul>
						<Divider>
							<p>sycswanp</p>
						</Divider>
						<ul>
							<li>
								<el-switch v-model="sycswanp_swap"/>ETH  -> USDT
							</li>
							<li>
								<el-switch></el-switch>组LP
							</li>
							<li>
								<el-switch></el-switch>解LP
							</li>
						</ul>
						<Divider>
							<p>specefi</p>
						</Divider>
						<ul>
							<li>
								<el-switch v-model="specefi_swap"/>ETH  -> USDT
							</li>
							<li>
								<el-switch></el-switch>组LP
							</li>
							<li>
								<el-switch></el-switch>解LP
							</li>
						</ul>
					</div>
				</el-col>
			</el-row>
	  </div>

	</div>
	<div width="100%">
		<a-row :gutter="1000">

		</a-row>
	</div>
	</cl-crud>
  </template>
  
  <script lang="ts" setup>
  import { ref, reactive, onMounted, watch, computed } from 'vue';
  import { useCrud } from "@cool-vue/crud";
  import { useCool } from "/@/cool";
  import { Divider } from 'ant-design-vue';
  const { service } = useCool();
  
  const Crud = useCrud({ service: service.scroll.run }, (app) => {
	app.refresh();
  });

  const columns = [
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
	  title: 'ETH',
	  dataIndex: 'balance',
	  key: 'balance',
	},
	{
	  title: 'USDT',
	  dataIndex: 'token',
	  key: 'token',
	},
  ];
  
  const checkedGroups = ref([]);
  const data = ref([]);

  // 日志变量
  const executionLog = ref('');
  const successLog   = ref('');
  const failureLog   = ref('');
  
  const idCounter = ref(localStorage.getItem('idCounter') ? parseInt(localStorage.getItem('idCounter')) : 1);
  
  
  const fetchLocalStorageData = () => {
	const storedAddresses = localStorage.getItem('addresses');
	if (storedAddresses) {
	  data.value = JSON.parse(storedAddresses);
	}
  };
  
  const saveDataToLocalStorage = () => {
	localStorage.setItem('addresses', JSON.stringify(data.value));
  };
  
  const updateIdCounterInLocalStorage = () => {
	localStorage.setItem('idCounter', idCounter.value.toString());
  };
  
  onMounted(() => {
	fetchLocalStorageData();
  });
  
  watch(data, saveDataToLocalStorage, { deep: true });
  watch(idCounter, updateIdCounterInLocalStorage);

  const autoGas = ref(false);
  const randomdex = ref(false);
  const autoslip = ref(false);
  const skydrome_swap = ref(false);
  const punk_swap = ref(false);
  const zebra_swap = ref(false);
  const sycswanp_swap = ref(false);
  const specefi_swap = ref(false);
  const swap_all_to_eth = ref(false);
  const pause_min = ref('0');
  const pause_max = ref('0');
  const amount_min = ref('0');
  const amount_max = ref('0');

  watch(autoGas, (newVal, oldVal) => {
	console.log(`autoGas changed from ${oldVal} to ${newVal}`);
	});


	const config_task = async() => {

		try {

		}catch{

		}

	};

	async function run_task() {
		const selectedKeys = rowSelection.selectedRowKeys;
		const selectedRows = data.value.filter(row => selectedKeys.includes(row.key));
		const config = {
			autoGas: autoGas.value,
			randomdex: randomdex.value,
			autoslip: autoslip.value,
			skydrome_swap: skydrome_swap.value,
			punk_swap: punk_swap.value,
			zebra_swap: zebra_swap.value,
			sycswanp_swap: sycswanp_swap.value,
			specefi_swap: specefi_swap.value,
			swap_all_to_eth: swap_all_to_eth.value,
			pause_min: pause_min.value,
			pause_max: pause_max.value,
			amount_min: amount_min.value,
			amount_max: amount_max.value,
		};
		console.log(config)
		
		for (const row of selectedRows) {
			try {
			executionLog.value += `\nTask for ${row.address} started.`;	
			console.log(executionLog.value)
			const response =  await service.scroll.run.runTask({
				privateKey: row.privateKey,
				config: config
			}).then();
			// 更新日志

			if (response.success) {
				successLog.value += `\nTask for ${row.address} completed successfully.`;
			} else {
				failureLog.value += `\nTask for ${row.address} failed: ${response.error}`;
			}
			console.log(`Task for ${row.address} completed successfully:`);
			} catch (error) {
			console.error(`Task for ${row.address} failed:`, error);
			}
		}
	};



	const clear_log = async () => {
		executionLog.value = '';
		successLog.value = '';
		failureLog.value = '';
	};

  const stop_task = async() => {

  };

  const flush_wallet = async() => {

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
  <style scoped>

  .button-group {
	margin-top: 20px; /* 上边距 */
	margin-bottom: 20px;
	display: flex;
	gap: 50px;
  }
  .tab-group {
    display: flex;
    flex-grow: 1;
	gap: 50px;

	}

  </style>