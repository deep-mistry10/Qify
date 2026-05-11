function showForm(type){

document.querySelectorAll(".form").forEach(form=>{
form.style.display="none"
})

document.getElementById(type+"-form").style.display="block"

document.getElementById("qrcode").innerHTML=""
document.getElementById("downloadBtn").style.display="none"

document.getElementById("card").style.display="none"
}

function togglePasswordField(){
let security = document.getElementById("wifiSecurity").value
let passwordField = document.getElementById("wifiPassword")

if(security === "nopass"){
passwordField.style.display = "none"
}else{
passwordField.style.display = "block"
}
}

async function generateQR(type){

let qrData=""

if (type === "url") {
  let url = document.getElementById("urlInput").value.trim();
  let error = document.getElementById("urlError");
  let input = document.getElementById("urlInput");

  if (!url) {
  error.style.display = "none";
  input.classList.remove("invalid");
  return;
}

if (!url.startsWith("http://") && !url.startsWith("https://")) {
  url = "http://" + url;
}

try {
  const parsed = new URL(url);

  const host = parsed.hostname;

  const domainRegex = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;

  const isLocalhost = host === "localhost";

  if (domainRegex.test(host) || ipRegex.test(host) || isLocalhost) {
    error.style.display = "none";
    input.classList.remove("invalid");
    const q = parsed.searchParams.get("q");

if(parsed.hostname.includes("google.com") && q){
  qrData = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
}else{
  qrData = url;
}
  } else {
    throw new Error("Invalid host");
  }

} catch {
  error.innerText = "Enter valid URL / IP";
  error.style.display = "block";
  input.classList.add("invalid");

  document.getElementById("qrcode").innerHTML = "";
  document.getElementById("downloadBtn").style.display = "none";
  return;
}
}

else if(type==="text"){
qrData=document.getElementById("textInput").value
}

else if(type==="phone"){
let name=document.getElementById("phoneName").value
let number=document.getElementById("phoneNumber").value
qrData=`Name:${name}\nPhone:${number}`
}

else if(type==="email"){
qrData=document.getElementById("emailInput").value
}

else if(type==="contact"){
let name=document.getElementById("contactName").value
let phone=document.getElementById("contactPhone").value
let email=document.getElementById("contactEmail").value
qrData=`Name:${name}\nPhone:${phone}\nEmail:${email}`
}

else if(type==="upi"){

  let name = document.getElementById("upiName").value || "MERCHANT NAME";
  let upi = document.getElementById("upiId").value || "merchant@upi";
  let amount = document.getElementById("upiAmount").value;

  let link = `upi://pay?pa=${upi}&pn=${name}&cu=INR`;

  if(amount && !isNaN(amount)){
    link += `&am=${amount}`;
  }

  document.getElementById("card").style.display = "block";

  document.getElementById("cardName").innerText = name.toUpperCase();
  document.getElementById("cardUpi").innerText = upi;

  document.getElementById("qr").innerHTML = "";

  const qrCode = new QRCodeStyling({
    width: 300,
    height: 300,
    data: link,
    image: "images/upi.png",

  imageOptions: {
    crossOrigin: "anonymous",
    margin: 4,
    imageSize: 0.22
  },

  dotsOptions: { color: "#000", type: "rounded" },
  backgroundOptions: { color: "#fff" }
  });

  qrCode.append(document.getElementById("qr"));

  document.getElementById("downloadBtn").style.display = "inline-block";
return;
}

else if(type==="wifi"){

let ssid = document.getElementById("wifiSSID").value.trim()
let password = document.getElementById("wifiPassword").value.trim()
let security = document.getElementById("wifiSecurity").value
let hidden = document.getElementById("wifiHidden").checked ? "true" : "false"



if(!ssid){
alert("Enter WiFi name")
return
}

if(security === "nopass"){
qrData = `WIFI:S:${ssid};T:nopass;H:${hidden};;`
}else{
if(!password){
alert("Enter password")
return
}
qrData = `WIFI:S:${ssid};T:${security};P:${password};H:${hidden};;`
}}


document.getElementById("qrcode").innerHTML=""

const qrCode=new QRCodeStyling({

width:300,
height:300,
type:"canvas",
data:qrData,

image: "images/qify.png",

imageOptions: {
  crossOrigin: "anonymous",
  margin: 5,
  imageSize: 0.25
},

dotsOptions:{
color:"#000000",
type:"rounded"
},

backgroundOptions:{
color:"#ffffff"
}
})

let tempDiv=document.createElement("div")
qrCode.append(tempDiv)

let qrCanvas = null;
let tries = 0;

while (!qrCanvas && tries < 40) {
  await new Promise(r => setTimeout(r, 50));
  qrCanvas = tempDiv.querySelector("canvas");
  tries++;
}

if (!qrCanvas) {
  alert("QR could not be generated.");
  return;
}

let padding=20

let canvas=document.createElement("canvas")

canvas.width=qrCanvas.width+padding*2
canvas.height=qrCanvas.height+padding*2

let ctx=canvas.getContext("2d")

ctx.fillStyle="#ffffff"
ctx.fillRect(0,0,canvas.width,canvas.height)

ctx.drawImage(qrCanvas,padding,padding)

ctx.strokeStyle="#000"
ctx.lineWidth=4
ctx.strokeRect(2,2,canvas.width-4,canvas.height-4)

ctx.font="bold 14px Arial"
ctx.fillStyle="#000"
ctx.textAlign="right"
ctx.fillText("",canvas.width-10,canvas.height-10)

document.getElementById("qrcode").appendChild(canvas)

document.getElementById("downloadBtn").style.display="inline-block"

}

async function downloadQR(){

  let btn = document.getElementById("downloadBtn");

  btn.disabled = true;
  btn.innerText = "Downloading...";

  let card = document.getElementById("card");


  if(card.style.display !== "none"){

    await new Promise(r => setTimeout(r, 500));

    html2canvas(card, {
      scale: 4,
      useCORS: true,
      backgroundColor: null
    }).then(canvas => {
      let link = document.createElement("a");
      link.download = "UPI_QR.png";
      link.href = canvas.toDataURL();
      link.click();
      btn.disabled = false;
      btn.innerText = "Download QR";
    });

  }


  else{

    let qrCanvas = document.querySelector("#qrcode canvas");

    if(!qrCanvas){
      btn.disabled = false;
      btn.innerText = "Download QR";
      return;
    }

    let link = document.createElement("a");
    link.download = "QR.png";
    link.href = qrCanvas.toDataURL("image/png");
    link.click();
    btn.disabled = false;
    btn.innerText = "Download QR";
  }
}



document.addEventListener("DOMContentLoaded", () => {

  const popup = document.getElementById("privacyPopup");
  const acceptBtn = document.getElementById("acceptPrivacy");

  if(localStorage.getItem("privacyAccepted")){
    popup.style.display = "none";
  }
  acceptBtn.addEventListener("click", () => {
    popup.style.opacity = "0";
    setTimeout(() => {
      popup.style.display = "none";
    },300);
    localStorage.setItem("privacyAccepted","true");
  });

});
const cookieBanner = document.getElementById("cookie-banner");
const acceptBtn = document.getElementById("accept-cookies");

if(localStorage.getItem("cookiesAccepted")){
  cookieBanner.style.display = "none";
}

acceptBtn.addEventListener("click", () => {
  localStorage.setItem("cookiesAccepted", "true");
  cookieBanner.style.display = "none";
});