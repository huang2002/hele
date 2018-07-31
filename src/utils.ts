import { HElement } from "./HElement";

export function isEqualValue(a: any, b: any) {
    return a === b || a !== a && b !== b;
}

export function isEqual(a: any, b: any) {

    if (isEqualValue(a, b)) {
        return true;
    }

    if (
        (!(a instanceof Object && b instanceof Object)) ||
        String(a) !== String(b)
    ) {
        return false;
    }

    for (const key in a) {
        if (!isEqual(a[key], b[key])) {
            return false;
        }
    }

    for (const key in b) {
        if (!isEqual(a[key], b[key])) {
            return false;
        }
    }

    return true;

}

export function clearChildNodes(node: Node) {
    [...node.childNodes].forEach(childNode => {
        node.removeChild(childNode);
    });
}

export function flatten<T, U = T>(array: (T | U[])[]) {
    const ans = new Array<T | U>();
    array.forEach(ele => {
        if (ele instanceof Array) {
            ele.forEach(e => {
                ans.push(e);
            });
        } else {
            ans.push(ele);
        }
    });
    return ans;
}

export function parsePossibleElement(element: any): HElement | null | (HElement | null)[] {
    if (element instanceof HElement) {
        return element;
    } else if (element instanceof Array) {
        return element.map(parsePossibleElement) as HElement[];
    } else {
        return null;
    }
}
