
export function makeid(len = 8) {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < len; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

export function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}