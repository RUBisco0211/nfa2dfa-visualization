// Nfa结点
export class NfaNode {
    public readonly name: string;
    public readonly nextNodesMap: Map<string, NfaNode[]>;
    public readonly isStartNode: boolean;
    public readonly isEndNode: boolean;

    constructor(name: string, isStartNode = false, isEndNode = false) {
        this.name = name;
        this.nextNodesMap = new Map();
        this.isStartNode = isStartNode;
        this.isEndNode = isEndNode;
    }

    public setNextNodes(nextChar: string, nodes: NfaNode[]) {
        this.nextNodesMap.set(nextChar, [...nodes]);
    }
    public addNewNextNode(nextChar: string, node: NfaNode) {
        if (!this.nextNodesMap.has(nextChar)) {
            this.nextNodesMap.set(nextChar, []);
        }
        this.nextNodesMap.get(nextChar)!.push(node);
    }

    public getNextNodes(nextChar: string): NfaNode[] | undefined {
        if (
            this.nextNodesMap.has(nextChar) &&
            this.nextNodesMap.get(nextChar)!.length > 0
        ) {
            return this.nextNodesMap.get(nextChar)!;
        }
    }

    public epsilonClosure() {
        const nextNodes = this.getNextNodes('');
        if (!nextNodes) {
            return [this];
        }
        const closure: Set<NfaNode> = new Set();
        closure.add(this);
        for (const nextNode of nextNodes) {
            // 合并epsilon闭包
            for (const item of nextNode.epsilonClosure()) {
                if (!closure.has(item)) {
                    closure.add(item);
                }
            }
        }
        return Array.from(closure);
    }
}

// Nfa
export class Nfa {
    public readonly nodes: NfaNode[];
    public readonly startNodes: NfaNode[];
    public readonly endNodes: NfaNode[];
    public readonly alphabet: string[];

    constructor(nodes: NfaNode[], alphabet?: string[]) {
        this.nodes = nodes;
        this.startNodes = this.nodes.filter((n) => n.isStartNode);
        this.endNodes = this.nodes.filter((n) => n.isEndNode);
        if (alphabet) {
            this.alphabet = alphabet;
            return;
        }
        this.alphabet = [];
        this.nodes.forEach((node) => {
            node.nextNodesMap.forEach((value, key) => {
                if (!this.alphabet.includes(key)) {
                    this.alphabet.push(key);
                }
            });
        });
    }
    public move(nodes: NfaNode[], nextChar: string): NfaNode[] {
        const nextNodes: Set<NfaNode> = new Set();
        for (const node of nodes) {
            const nds = node.getNextNodes(nextChar);
            if (!nds) {
                continue;
            }
            for (const n of nds) {
                if (!nextNodes.has(n)) {
                    nextNodes.add(n);
                }
            }
        }
        return Array.from(nextNodes);
    }

    public epsilonClosure(nodes: NfaNode[]): NfaNode[] {
        const closure = new Set<NfaNode>();
        nodes.forEach((node) => {
            node.epsilonClosure().forEach((n) => {
                if (!closure.has(n)) {
                    closure.add(n);
                }
            });
        });
        return Array.from(closure);
    }

    public toDfa(): Dfa | undefined {
        if (this.startNodes.length === 0) {
            throw new Error('no start nodes for this Nfa');
        }
        if (this.endNodes.length === 0) {
            throw new Error('no end nodes for this Nfa');
        }
        // 加上唯一初态
        let startNode: NfaNode;
        if (this.startNodes.length !== 1) {
            startNode = new NfaNode('start', true);
            this.startNodes.forEach((node) => {
                startNode.addNewNextNode('', node);
            });
        } else startNode = this.startNodes[0];

        // 加上唯一终态
        let endNode: NfaNode;
        if (this.endNodes.length !== 1) {
            endNode = new NfaNode('end', false, true);
            this.endNodes.forEach((node) => {
                node.addNewNextNode('', endNode);
            });
        } else endNode = this.endNodes[0];

        // 子集法转换
        const startEl = new DfaElement(startNode.epsilonClosure());
        const elements: DfaElement[] = [startEl];

        for (const el of elements) {
            // dfa字母表中不存在空串，需要排除
            for (const ch of this.alphabet.filter((c) => c !== '')) {
                const newEl = new DfaElement(
                    this.epsilonClosure(this.move(el.nodes, ch))
                );
                el.addNextElement(ch, newEl);
                if (elements.find((e) => e.equals(newEl))) {
                    continue;
                }
                elements.push(newEl);
            }
        }
        return new Dfa(
            elements,
            this.alphabet.filter((c) => c !== '')
        );
    }
}

// Dfa子集
export class DfaElement {
    public readonly nodes: NfaNode[];
    public readonly isStartNode: boolean = false;
    public readonly isEndNode: boolean = false;
    public readonly nextElementMap: Map<string, DfaElement> = new Map();

    constructor(nodes: NfaNode[]) {
        this.nodes = nodes;
        if (this.nodes.find((n) => n.isStartNode)) {
            this.isStartNode = true;
        }
        if (this.nodes.find((n) => n.isEndNode)) {
            this.isEndNode = true;
        }
    }
    public equals(el: DfaElement): boolean {
        if (this.nodes.length !== el.nodes.length) {
            return false;
        }
        for (const node of el.nodes) {
            if (!this.nodes.includes(node)) {
                return false;
            }
        }
        return true;
    }
    public addNextElement(nextChar: string, el: DfaElement) {
        this.nextElementMap.set(nextChar, el);
    }
}

// Dfa
export class Dfa {
    public readonly elements: DfaElement[];
    public readonly alphabet: string[];

    constructor(elements: DfaElement[], alphabet?: string[]) {
        this.elements = elements;
        if (alphabet) {
            this.alphabet = alphabet;
            return;
        }
        this.alphabet = [];
        this.elements.forEach((e) => {
            e.nextElementMap.forEach((value, key) => {
                if (!this.alphabet.includes(key)) {
                    this.alphabet.push(key);
                }
            });
        });
    }
}
