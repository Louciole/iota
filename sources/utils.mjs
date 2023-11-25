export function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

export function arrayEqual(a, b) {
    if (a.length !== b.length)
        return false

    for (let i = 0; i < a.length; i++)
        if (a[i] !== b[i])
            return false

    return true
}
