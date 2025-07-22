<template>
    <div class="pro-export">
        <el-dropdown v-if="hasCheckMode" @command="handleExportCommand">
            <el-button :disabled="disabled" plain type="primary"
                >{{ btnText }}<i class="el-icon-arrow-down el-icon--right"
            /></el-button>
            <template #dropdown >
                <el-dropdown-menu class="dark-item">
                    <el-dropdown-item command="all">全部导出</el-dropdown-item>
                    <el-dropdown-item command="some">勾选导出</el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
        <el-button v-else :disabled="disabled" plain type="primary" @click="handleExportCommand('all')"
            >{{ btnText }}</el-button
        >
        <el-dialog
            :title="title"
            :append-to-body="true"
            :close-on-click-modal="false"
            v-model="dialogVisable"
            :before-close="close"
            width="600px"
        >
            <div class="pro-export__inner">
                <div class="export-column">
                    <el-checkbox v-model="checkAll" :indeterminate="isIndeterminate" @change="handleCheckAllChange"
                        >全选</el-checkbox
                    >
                    <div style="margin: 15px 0" />
                    <el-checkbox-group v-model="checkedColumn" @change="handleCheckedColumnChange">
                        <el-checkbox 
                            v-for="(item, key) in columns" 
                            :key="key" 
                            :label="item.prop"
                        >
                            <span class="column-name" :title="item.label">{{ item.label }}</span>
                        </el-checkbox>
                    </el-checkbox-group>
                </div>
            </div>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="close">取 消</el-button>
                    <el-button :loading="loading" type="primary" @click="handleSubmit">确 定</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, toRefs } from 'vue'
import modal from '../../utils/modal'
import download from '../../utils/download'

// 定义列的类型
interface ColumnItem {
  prop: string
  label: string
  // 如有其它字段可在此补充
}

const props = defineProps<{
  columns: ColumnItem[]
  action: string
  title?: string
  btnText?: string
  disabled?: boolean
  checkList?: any[]
  data?: Record<string, any>
  idKey?: string
  valueKey?: string
}>()

const dialogVisable = ref(false)
const isIndeterminate = ref(false)
const checkAll = ref(false)
const loading = ref(false)
const checkedColumn = ref([])
const command = ref("")

const hasCheckMode = computed(() => {
    return props.checkList !== null
})

const handleExportCommand = (cmd: string) => {
    if (cmd === "some" && (!props.checkList || props.checkList.length === 0)) {
        return modal.msgWarning("请勾选需要导出的数据")
    }
    command.value = cmd
    dialogVisable.value = true
}

const handleCheckAllChange = (val: any) => {
    checkedColumn.value = val ? props.columns.map((item: any) => item.prop) as never : []
    isIndeterminate.value = false
}

const handleCheckedColumnChange = (val: any) => {
    let checkedCount = val.length
    checkAll.value = checkedCount === props.columns.length
    isIndeterminate.value = checkedCount > 0 && checkedCount < props.columns.length
}

const handleSubmit = async () => {
    if (checkedColumn.value.length === 0) {
        return modal.msgWarning("请勾选需要导出的列")
    }
    loading.value = true

    const idKey = props.idKey ?? 'ids';
    const params = Object.assign({}, props.data, {
        [idKey]: Array.isArray(props.checkList) ? props.checkList.map((el: any) => el?.[props.valueKey ?? 'id']).join(",") : "",
        fieldNames: checkedColumn.value.join(",")
    })

    if (command.value === "all") {
        delete params[idKey]
    }

    download.download(props.action, { ...params}, props.title+`_${new Date().getTime()}.xlsx`);
    close()
    loading.value = false

}
    
const close = () => {
    checkedColumn.value = []
    isIndeterminate.value = false
    checkAll.value = false
    dialogVisable.value = false
    loading.value = false
}

const open = () => {
    dialogVisable.value = true
}
</script>
