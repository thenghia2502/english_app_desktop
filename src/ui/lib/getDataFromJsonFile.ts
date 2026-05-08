export async function getDataFromJsonFile() {
    const res = await fetch("http://localhost:3000/api/danhsachtu")
    if (!res.ok) {
        throw new Error("Failed to fetch data")
    }
    return res.json()
}
