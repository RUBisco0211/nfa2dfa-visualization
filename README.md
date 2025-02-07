# nfa2dfa_visualization

#### 将 NFA 转为 DFA 的可视化网页

在线预览：https://rubisco0211.github.io/nfa2dfa-visualization/

-   支持编辑 nfa 结点（功能待完善）
-   推荐以 json 格式导入 nfa 结点

参考 json 格式：

```json
{
    "nfaNodes": [
        // 每个结点有唯一的name
        {
            "name": "X",
            "isStartNode": true, // 若为起始结点，置isStartNode为true
            "nextNodes": {
                "epsilon": ["1"] // 以epsilon字符串为key表示epsilon转换得到的后继结点
            }
        },
        {
            "name": "1",
            "nextNodes": {
                "a": ["1"],
                "b": ["1"],
                "epsilon": ["2"]
            }
        },
        {
            "name": "2",
            "nextNodes": {
                "a": ["3"],
                "b": ["4"]
            }
        },
        {
            "name": "3",
            "nextNodes": {
                "a": ["5"]
            }
        },
        {
            "name": "4",
            "nextNodes": {
                "b": ["5"]
            }
        },
        {
            "name": "5",
            "nextNodes": {
                "epsilon": ["6"]
            }
        },
        {
            "name": "6",
            "nextNodes": {
                "a": ["6"],
                "b": ["6"],
                "epsilon": ["Y"]
            }
        },
        {
            "name": "Y", // 若为终末结点，置isEndNode为true
            "isEndNode": true
        }
    ]
}
```
