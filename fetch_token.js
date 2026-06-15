const url = "https://www.tiendanube.com/apps/authorize/token";
const payload = {
    client_id: "34322",
    client_secret: "9adf4bb6a58e3b1e61f60a516f373600e52e2494d5f0f11b",
    grant_type: "authorization_code",
    code: "19585a0f74166b0730dcef9cd35d4bce271e87b4"
};

fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
})
.then(res => res.json())
.then(data => console.log(JSON.stringify(data, null, 2)))
.catch(err => console.error(err));
