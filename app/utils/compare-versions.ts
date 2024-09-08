export const compareVersions = (a: string, b: string) => {
    const aParts = a.match(/\d+/g) ?? ''
    const bParts = b.match(/\d+/g) ?? ''
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        const aPart = parseInt(aParts[i]) ?? 0
        const bPart = parseInt(bParts[i]) ?? 0
        if (aPart < bPart) {
            return -1
        } else if (aPart > bPart) {
            return 1
        }
    }
    return 0
}