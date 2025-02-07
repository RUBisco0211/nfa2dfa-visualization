import { Nfa, NfaNode } from 'src/models/fa';

export function readNfaFromJson(raw: string): Nfa {
    const rawNodes = JSON.parse(raw);

    const nfaNodes: NfaNode[] = [];

    for (const item of rawNodes['nfaNodes']) {
        const name: string = item['name'];
        const isStartNode: boolean | undefined = item['isStartNode'];
        const isEndNode: boolean | undefined = item['isEndNode'];
        const node = new NfaNode(name, isStartNode, isEndNode);
        nfaNodes.push(node);
    }

    for (const item of rawNodes['nfaNodes']) {
        const node = nfaNodes.find((n) => n.name === item['name']);
        if (!node) {
            continue;
        }
        if (!item['nextNodes']) {
            continue;
        }
        Object.keys(item['nextNodes']).forEach((ch) => {
            const nextNodeNames: string[] = item['nextNodes'][ch];
            const nextNodes = nfaNodes.filter((n) =>
                nextNodeNames.includes(n.name)
            );
            nextNodes.forEach((n) =>
                node.addNewNextNode(ch === 'epsilon' ? '' : ch, n)
            );
        });
    }
    return new Nfa(nfaNodes);
}
