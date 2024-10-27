const boxcontentRef = document.getElementById('box-content')
const titleRef = document.getElementById('note-title')
const noteRef = document.getElementById('box-note')
const sidebarRef = document.getElementById('side-bar')
const resizebarRef = document.getElementById('resize-bar')
const searchTextRef = document.getElementById('searchText')
const searchButtonRef = document.getElementById('search')
const reloadButtonRef = document.getElementById('refresh')
const minSideBarSize = 160;
var isResizing = false
var treeview

window.electronAPI.onShowNote((title, value) => {
    titleRef.innerText = title
    const renderer = new BoxNotesToHtml('box-note')
    renderer.render(value)
})

window.electronAPI.onBoxDir((tree) => {    
    if(tree) {
        sidebarRef.style.width = "180px"
        resizebarRef.style.width = "2px"
        treeview = new TreeView('tree')
        treeview.render(tree)
    }
})

window.addEventListener("mousemove", (e) => {
    if (!isResizing) {
        return
    }
    
    let contentDim = boxcontentRef.getBoundingClientRect()
    let sidebarDim = sidebarRef.getBoundingClientRect()

    if(sidebarDim.width + e.movementX >= minSideBarSize) {
        boxcontentRef.style.width = (contentDim.width + e.movementX * -1) + "px"
        sidebarRef.style.width = (sidebarDim.width + e.movementX) + "px"
    }
})

window.addEventListener("mouseup", () => {
    isResizing = false
})

resizebarRef.addEventListener("mousedown", () => {
    isResizing = true
})


searchButtonRef.setAttribute('title', window.electronAPI.i18n("Search Note"))
searchButtonRef.addEventListener("click", () => {
    if(searchTextRef.value) {
        treeview.search(searchTextRef.value)
    }
})

searchTextRef.addEventListener("keyup", (e) => {
    if(searchTextRef.value && e.code == "Enter") {
        treeview.search(searchTextRef.value)
    }
})

reloadButtonRef.setAttribute('title', window.electronAPI.i18n("Refresh Folders"))
reloadButtonRef.addEventListener("click", () => {
    titleRef.innerHTML = ''
    noteRef.innerHTML = ''
    searchTextRef.value = ''
    treeview = new TreeView('tree')
    treeview.render(window.electronAPI.reloadBoxDir())
})