import { NfaNode } from './fa';

export interface NfaNodeInputProps {
    name?: string;
    isStartNode?: boolean;
    isEndNode?: boolean;
    nextNodes?: NextNodesProps[];
}
export interface NextNodesProps {
    nextChar: string;
    nextNodes: NfaNode[];
}
