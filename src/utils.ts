export function isEqual(a: any, b: any) {

    if (a === b || a !== a && b !== b) {
        return true;
    }

    if (
        (!(a instanceof Object && b instanceof Object)) ||
        String(a) !== String(b)
    ) {
        return false;
    }

    for (const key in a) {
        if (!((key in b) && isEqual(a[key], b[key]))) {
            return false;
        }
    }

    for (const key in b) {
        if (!(key in a)) {
            return false;
        }
    }

    return true;

}

export function _clearChildren(node: Node, deep = false) {
    [...node.childNodes].forEach(childNode => {
        if (deep) {
            _clearChildren(childNode, true);
        }
        node.removeChild(childNode);
    });
}

export function _flatten<T, U = T>(array: (T | U[])[]) {
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
