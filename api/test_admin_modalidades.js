const url = "https://backend.daipohlmann.com.br";
const email = "admin@fitrapido.com";
const password = "Admin123!";

fetch(`${url}/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password })
}).then(r => r.json()).then(r => {
  if (r.access_token) {
    return fetch(`${url}/treinos-modalidades`, {
      headers: { "Authorization": `Bearer ${r.access_token}` }
    }).then(res => res.text()).then(console.log);
  } else {
    console.log("Login failed:", r);
  }
}).catch(console.error);
