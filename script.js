const API_URL = "https://ayyinah-chatbot-jasira-cakery.hf.space"

let user_id = null
let isLoading = false
let messageQueue = [];
let processing = false;

async function submitPhoneNumber(){

  if (isLoading) return 

  let phone = document.getElementById("phone-input").value
  let btn = document.getElementById("start-chat-btn")
  let loading = document.getElementById("loading-chat")

  if(!phone){
    showPopup("Masukkan Nomor Telepon Terlebih Dahulu!")
    return
  }

  const phoneRegex = /^(\+62|08)\d{8,13}$/;

  if (!phoneRegex.test(phone)) {
    showPopup("Nomor Tidak Valid!")
    return
  }

  btn.disabled = true
  btn.innerText = "Memuat..."
  loading.style.display = "block"

  isLoading = true

  try {

    let res = await fetch(API_URL + "/init-user",{
      method:"POST",
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({phone_number : phone})
    })

    let data = await res.json()

    user_id = data.user_id

    await loadHistory()

    document.getElementById("phone-popup").style.display="none"

  } catch(err){
    console.error(err)
  } finally {

    isLoading = false
    btn.disabled = false
    btn.innerText = "Mulai Chat"
    loading.style.display = "none"

  }

}
// Fungsi untuk menampilkan popup dengan pesan dinamis
function showPopup(message) {
  // Ubah teks di dalam popup sesuai pesan yang dikirim
  document.getElementById("popup-text").innerText = message; 
  
  // Tampilkan popup
  document.getElementById("phoneErrorPopup").style.display = "flex";
}

// Fungsi untuk menutup popup (cukup satu saja)
function closePopup() {
  document.getElementById("phoneErrorPopup").style.display = "none";
}

async function loadHistory(){

const res = await fetch(API_URL + "/chat-history/" + user_id)

const data = await res.json()

console.log("HISTORY DATA:", data)

addMessage(
"Halo Kak! Selamat datang di Jasira Cakery 🍰 Saya Admin Virtual yang siap bantu Kakak cari kue ulang tahun, info cabang, atau pemesanan😊",
"bot"
)

for(let msg of data.history){

addMessage(msg.message, msg.sender)

}

console.log(data.history)

}

function addMessage(text, sender){

console.log("addMessage called:", text, sender)

if(text === undefined || text === null){
   text = "Maaf Kak, terjadi error di server."
}


let chat = document.getElementById("chat-box")

let div = document.createElement("div")
div.className = sender

let bubble = document.createElement("div")
bubble.className = "bubble"

bubble.innerHTML = text.replace(
/(https?:\/\/[^\s]+)/g,
'<a href="$1" target="_blank">$1</a>'
)

div.appendChild(bubble)

chat.appendChild(div)

chat.scrollTop = chat.scrollHeight
}

function showTyping(){

const chatBox=document.getElementById("chat-box")

const typing=document.createElement("div")
typing.id="typing"
typing.className="typing"

typing.innerText="Jasira Assistant sedang mengetik..."

chatBox.appendChild(typing)

chatBox.scrollTop=chatBox.scrollHeight
}

function removeTyping(){

const typing=document.getElementById("typing")
if(typing) typing.remove()

}

function showCatalogPreview(){

const chatBox = document.getElementById("chat-box")

const msg = document.createElement("div")
msg.className = "bot"

const card = document.createElement("div")
card.className = "catalog-card"

card.innerHTML = `
<div class="catalog-title">📄 Katalog Jasira Cakery</div>

<button onclick="window.open('${API_URL}/katalog','_blank')">
📖 Buka Katalog
</button>
`

msg.appendChild(card)

chatBox.appendChild(msg)

chatBox.scrollTop = chatBox.scrollHeight
}

function sendMessage(){

let input = document.getElementById("message")
let message = input.value.trim()

if(message==="") return

addMessage(message,"user")

input.value=""

messageQueue.push(message)

processQueue()
}

async function processQueue(){

if(processing) return
if(messageQueue.length === 0) return

processing = true

let message = messageQueue.shift()

showTyping()

const res = await fetch(API_URL + "/chat", {
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
user_id:user_id,
message:message
})
})

const data = await res.json()

console.log("SERVER RESPONSE:", data)

removeTyping()

addMessage(data.reply,"bot")

if(data.file){
showCatalogPreview()
}

processing = false

processQueue()
}

function sendQuick(text){
document.getElementById("message").value = text
sendMessage()
}

document.getElementById("message")
.addEventListener("keypress",function(e){
if(e.key==="Enter"){
sendMessage()
}
})


