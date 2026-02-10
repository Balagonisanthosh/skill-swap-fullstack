export async function fetchWithAuth(url, options = {}) {
const token = localStorage.getItem("token");


const res = await fetch(url, {
...options,
headers: {
...(options.headers || {}),
Authorization: `Bearer ${token}`,
},
credentials: "include",
});


return res;
}