const titleRef = document.getElementsByTagName('h1')[0]
const bodyRef = document.getElementById("main-content")

window.electronAPI.onShowNote((title, value) => {
    titleRef.innerText = title
    bodyRef.innerHTML = ""
    bodyRef.appendChild(boxNotesToHtml(value))
})