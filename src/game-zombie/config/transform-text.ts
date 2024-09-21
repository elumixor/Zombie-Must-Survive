export function transformText(text: string) {
    // Split by camelCase and capitalize each word
    return text
        .replace(/([a-z])([A-Z])/g, "$1 $2") // Split camelCase
        .split(" ")
        .map((word) => word.capitalize())
        .join(" ");
}
