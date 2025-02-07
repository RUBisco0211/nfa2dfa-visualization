<template>
    <q-page>
        <q-splitter
            v-model:model-value="ref(30).value"
            :limits="[20, 50]"
            style="height: calc(100vh - 66px)"
        >
            <template v-slot:before>
                <q-toolbar>
                    <q-toolbar-title> NFA状态 </q-toolbar-title>
                    <q-space></q-space>
                    <q-btn
                        icon="mdi-plus"
                        label="添加状态"
                        color="primary"
                        flat
                    >
                        <q-popup-proxy>
                            <q-card style="width: 400px">
                                <q-form @submit="saveNode" @reset="resetNode">
                                    <q-card-section>
                                        <q-toolbar>
                                            <q-toolbar-title
                                                >添加状态</q-toolbar-title
                                            >
                                        </q-toolbar>
                                    </q-card-section>
                                    <q-separator></q-separator>
                                    <q-card-section>
                                        <q-input
                                            outlined
                                            label="状态名称"
                                            v-model="newNode.name"
                                            :rules="[
                                                (val) =>
                                                    (val && val.length > 0) ||
                                                    '请输入状态名称',
                                                (val) =>
                                                    !nfaNodes
                                                        .map((n) => n.name)
                                                        .includes(val) ||
                                                    '存在同名状态',
                                            ]"
                                        ></q-input>
                                        <q-toggle
                                            label="起始状态"
                                            keep-color
                                            checked-icon="check"
                                            :color="
                                                newNode.isStartNode
                                                    ? 'positive'
                                                    : 'negative'
                                            "
                                            unchecked-icon="clear"
                                            v-model="newNode.isStartNode"
                                        ></q-toggle>
                                        <q-toggle
                                            label="结束状态"
                                            keep-color
                                            checked-icon="check"
                                            :color="
                                                newNode.isEndNode
                                                    ? 'positive'
                                                    : 'negative'
                                            "
                                            unchecked-icon="clear"
                                            v-model="newNode.isEndNode"
                                        ></q-toggle>
                                        <q-space></q-space>
                                    </q-card-section>
                                    <q-separator></q-separator>
                                    <q-card-actions align="right">
                                        <q-btn
                                            flat
                                            label="确定"
                                            color="primary"
                                            type="submit"
                                        ></q-btn>
                                    </q-card-actions>
                                </q-form>
                            </q-card>
                        </q-popup-proxy>
                    </q-btn>
                    <q-btn
                        icon="mdi-code-json"
                        label="从json导入"
                        flat
                        color="primary"
                        @click="importFromJson"
                    ></q-btn>
                    <q-btn
                        :disable="nfaNodes.length === 0"
                        icon="mdi-play"
                        label="开始绘制"
                        flat
                        color="primary"
                        @click="drawNfa"
                    ></q-btn>
                </q-toolbar>
                <q-separator></q-separator>
                <q-scroll-area style="height: calc(100vh - 66px - 50px)">
                    <q-list separator>
                        <q-expansion-item
                            dense
                            expand-icon-toggle
                            v-for="nfaNode in nfaNodes"
                            :key="nfaNode.name"
                        >
                            <template v-slot:header>
                                <q-item-section avatar>
                                    <q-avatar
                                        icon="mdi-gamepad-circle"
                                        color="primary"
                                        text-color="white"
                                    ></q-avatar>
                                </q-item-section>
                                <q-item-section>
                                    <q-item-label class="text-h6">{{
                                        nfaNode.name
                                    }}</q-item-label>
                                    <q-item-label
                                        class="text-primary"
                                        caption
                                        v-if="nfaNode.isStartNode"
                                    >
                                        起始状态
                                    </q-item-label>
                                    <q-item-label
                                        class="text-secondary"
                                        caption
                                        v-if="nfaNode.isEndNode"
                                    >
                                        结束状态
                                    </q-item-label>
                                </q-item-section>
                                <q-item-section side>
                                    <q-toggle
                                        label="起始状态"
                                        keep-color
                                        checked-icon="check"
                                        :color="
                                            nfaNode.isStartNode
                                                ? 'positive'
                                                : 'negative'
                                        "
                                        unchecked-icon="clear"
                                        v-model="nfaNode.isStartNode"
                                    ></q-toggle>
                                    <q-toggle
                                        label="结束状态"
                                        keep-color
                                        checked-icon="check"
                                        :color="
                                            nfaNode.isEndNode
                                                ? 'positive'
                                                : 'negative'
                                        "
                                        unchecked-icon="clear"
                                        v-model="nfaNode.isEndNode"
                                    ></q-toggle>
                                </q-item-section>
                                <q-item-section side>
                                    <q-btn
                                        flat
                                        stack
                                        color="primary"
                                        icon="mdi-pencil"
                                        label="编辑后续状态"
                                    >
                                        <q-popup-proxy>
                                            <q-card style="width: 400px">
                                                <q-form
                                                    @submit="
                                                        saveNextNodes(nfaNode)
                                                    "
                                                    @reset="resetNextNodes"
                                                >
                                                    <q-card-section>
                                                        <q-toolbar>
                                                            <q-toolbar-title
                                                                >后续状态</q-toolbar-title
                                                            >
                                                            <q-space></q-space>
                                                            <q-btn
                                                                flat
                                                                stack
                                                                icon="mdi-plus"
                                                                color="primary"
                                                                label="添加路径"
                                                                @click="
                                                                    addNewNextNode
                                                                "
                                                            ></q-btn>
                                                        </q-toolbar>
                                                    </q-card-section>
                                                    <q-separator></q-separator>
                                                    <q-card-section>
                                                        <q-list>
                                                            <q-item
                                                                v-for="node in nextNodes"
                                                                :key="
                                                                    node.nextChar
                                                                "
                                                            >
                                                                <q-item-section>
                                                                    <q-input
                                                                        outlined
                                                                        v-model="
                                                                            node.nextChar
                                                                        "
                                                                        label="字符"
                                                                        hint="可输入空字符"
                                                                        :rules="[
                                                                            (
                                                                                val
                                                                            ) =>
                                                                                val !==
                                                                                    undefined ||
                                                                                '请输入字符',
                                                                            (
                                                                                val
                                                                            ) =>
                                                                                !(
                                                                                    val.length >
                                                                                    1
                                                                                ) ||
                                                                                '请输入单个字符',
                                                                            (
                                                                                val
                                                                            ) =>
                                                                                nextNodes.filter(
                                                                                    (
                                                                                        n
                                                                                    ) =>
                                                                                        n.nextChar ===
                                                                                        val
                                                                                )
                                                                                    .length ===
                                                                                    1 ||
                                                                                '已存在对应该字符的路径',
                                                                        ]"
                                                                    ></q-input>
                                                                </q-item-section>
                                                                <q-item-section>
                                                                    <q-select
                                                                        outlined
                                                                        label="后续状态"
                                                                        v-model="
                                                                            node.nextNodes
                                                                        "
                                                                        multiple
                                                                        :rules="[
                                                                            (
                                                                                val
                                                                            ) =>
                                                                                val.length >
                                                                                    0 ||
                                                                                '请至少选择一个后续状态',
                                                                        ]"
                                                                        :options="
                                                                            nfaNodes
                                                                        "
                                                                        :option-label="
                                                                            (
                                                                                node
                                                                            ) =>
                                                                                node.name
                                                                        "
                                                                    ></q-select>
                                                                </q-item-section>
                                                            </q-item>
                                                        </q-list>
                                                    </q-card-section>
                                                    <q-separator></q-separator>
                                                    <q-card-actions
                                                        align="right"
                                                    >
                                                        <q-btn
                                                            flat
                                                            label="重设"
                                                            color="primary"
                                                            type="reset"
                                                        ></q-btn>
                                                        <q-btn
                                                            flat
                                                            label="保存"
                                                            color="primary"
                                                            type="submit"
                                                        ></q-btn>
                                                    </q-card-actions>
                                                </q-form>
                                            </q-card>
                                        </q-popup-proxy>
                                    </q-btn>
                                </q-item-section>
                            </template>
                            <q-card flat>
                                <q-card-section>
                                    <q-list>
                                        <q-item
                                            dense
                                            v-for="value in Array.from(
                                                nfaNode.nextNodesMap
                                            )"
                                            :key="value[0]"
                                        >
                                            <q-item-section>
                                                <q-item-label class="text-h6">{{
                                                    value[0] === ''
                                                        ? '空'
                                                        : value[0]
                                                }}</q-item-label>
                                            </q-item-section>
                                            <q-item-section>
                                                <q-icon
                                                    name="mdi-arrow-right"
                                                    colo="primary"
                                                    size="sm"
                                                ></q-icon>
                                            </q-item-section>
                                            <q-item-section>
                                                <div class="q-gutter-x-sm">
                                                    <q-chip
                                                        v-for="n in value[1]"
                                                        color="primary"
                                                        text-color="white"
                                                        :key="n.name"
                                                        :label="n.name"
                                                    ></q-chip>
                                                </div>
                                            </q-item-section>
                                        </q-item>
                                    </q-list>
                                </q-card-section>
                            </q-card>
                        </q-expansion-item>
                    </q-list>
                </q-scroll-area>
            </template>
            <template v-slot:after>
                <q-splitter horizontal v-model="ref(50).value">
                    <template v-slot:before>
                        <q-toolbar>
                            <q-toolbar-title> 状态转换图 </q-toolbar-title>
                        </q-toolbar>
                        <q-separator></q-separator>
                        <vue-vis-network
                            ref="nfaNetworkRef"
                            style="height: calc(100% - 51px)"
                            :nodes="nfaNetwork.nodes"
                            :edges="nfaNetwork.edges"
                            :options="nfaNetwork.options"
                        ></vue-vis-network>
                    </template>
                    <template v-slot:separator>
                        <q-btn
                            unelevated
                            icon="mdi-arrow-down"
                            color="primary"
                            rounded
                            label="转换为对应的DFA"
                            @click="transferToDfa"
                        ></q-btn>
                    </template>
                    <template v-slot:after>
                        <q-separator></q-separator>
                        <vue-vis-network
                            style="height: calc(100% - 1px)"
                            :nodes="dfaNetwork.nodes"
                            :edges="dfaNetwork.edges"
                            :options="dfaNetwork.options"
                        ></vue-vis-network>
                    </template>
                </q-splitter>
            </template>
        </q-splitter>
    </q-page>
</template>

<script setup lang="ts">
import { NfaNode, Nfa } from 'src/models/fa';
import { ref } from 'vue';
import { NfaNodeInputProps, NextNodesProps } from '../models/props';
import { VueVisNetwork } from 'vue-vis-network2';
import { Edge, Node, Options } from 'vis-network';
import { Notify } from 'quasar';
import { readNfaFromJson } from 'src/utils/util';

const nfaNodes = ref<NfaNode[]>([]);

const newNode = ref<NfaNodeInputProps>({
    isStartNode: false,
    isEndNode: false,
});

const resetNode = () => {
    newNode.value = { isStartNode: false, isEndNode: false };
};

const saveNode = () => {
    const { name, isStartNode, isEndNode } = newNode.value!;
    const node = new NfaNode(name!, isStartNode, isEndNode);
    nfaNodes.value.push(node);
    resetNode();
};

const nextNodes = ref<NextNodesProps[]>([{ nextChar: '', nextNodes: [] }]);

const addNewNextNode = () => {
    nextNodes.value.push({ nextChar: '', nextNodes: [] });
};

const saveNextNodes = (nfaNode: NfaNode) => {
    nextNodes.value.forEach((n) => {
        nfaNode.setNextNodes(n.nextChar, n.nextNodes);
    });
    resetNextNodes();
};

const resetNextNodes = () => {
    nextNodes.value = [{ nextChar: '', nextNodes: [] }];
};

const nfaNetwork = ref<{
    nodes: Node[];
    edges: Edge[];
    options: Options;
}>({
    nodes: [],
    edges: [],
    options: {
        nodes: {
            shape: 'circle',
            size: 50,
            color: {
                border: 'grey',
                highlight: {
                    border: 'black',
                    background: 'white',
                },
                hover: {
                    border: 'orange',
                    background: 'grey',
                },
            },
            font: { color: 'black' },
            shapeProperties: {
                useBorderWithImage: true,
            },
        },
    },
});

const drawNfa = () => {
    nfaNetwork.value.nodes = [];
    nfaNetwork.value.edges = [];
    nfaNetwork.value.nodes = nfaNodes.value.map((n) => {
        return {
            id: n.name,
            label: n.name,
        };
    });
    nfaNodes.value.forEach((node) => {
        const { nextNodesMap } = node;
        nextNodesMap.forEach((value, key) => {
            value.forEach((v) => {
                nfaNetwork.value.edges.push({
                    from: node.name,
                    label: key,
                    to: v.name,
                    arrows: 'to',
                });
            });
        });
    });
};

const importFromJson = async () => {
    let files: FileSystemFileHandle[];
    try {
        files = await window.showOpenFilePicker({
            types: [
                {
                    description: 'JSON',
                    accept: { 'application/json': ['.json'] },
                },
            ],
        });
    } catch (error) {
        Notify.create({
            message: '没有选择文件',
            color: 'negative',
            position: 'top',
        });
        return;
    }
    let content: string;
    try {
        content = await (await files[0].getFile()).text();
    } catch {
        Notify.create({
            message: '获取文件内容失败',
            color: 'negative',
            position: 'top',
        });
        return;
    }
    let nfa: Nfa;
    try {
        nfa = readNfaFromJson(content);
    } catch {
        Notify.create({
            message: 'json格式不正确',
            color: 'negative',
            position: 'top',
        });
        return;
    }
    nfaNodes.value = nfa.nodes;
    drawNfa();
};
const dfaNetwork = ref<{
    nodes: Node[];
    edges: Edge[];
    options: Options;
}>({
    nodes: [],
    edges: [],
    options: {
        nodes: {
            shape: 'circle',
            size: 24,
            color: {
                border: 'grey',
                highlight: {
                    border: 'black',
                    background: 'white',
                },
                hover: {
                    border: 'orange',
                    background: 'grey',
                },
            },
            font: { color: 'black' },
            shapeProperties: {
                useBorderWithImage: true,
            },
        },
    },
});
const transferToDfa = () => {
    const dfa = new Nfa(nfaNodes.value).toDfa();
    dfaNetwork.value.nodes = [];
    dfaNetwork.value.edges = [];
    dfaNetwork.value.nodes = dfa!.elements.map((el) => {
        const id = el.nodes.map((n) => n.name).toString();
        return {
            id,
            label: id,
        };
    });
    dfa?.elements.forEach((el) => {
        const { nextElementMap } = el;
        nextElementMap.forEach((value, key) => {
            dfaNetwork.value.edges.push({
                from: el.nodes.map((n) => n.name).toString(),
                label: key,
                to: value.nodes.map((n) => n.name).toString(),
                arrows: 'to',
            });
        });
    });
};
</script>
