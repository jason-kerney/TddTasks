export function isNotImplemented(name) {
    throw new Error(`Method '${name}' is not implemented`);
}

export function addMethod(classnm: any, name: string) {
    classnm[name] = function () {
        throw new Error(`Method '${name}' is not implemented`);
    }
}