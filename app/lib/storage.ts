export function setStorage(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
}

export function getStorage(key: string, defaultValue: any = null) {
    return JSON.parse(localStorage.getItem(key) || "null") || defaultValue;
}
