const titleRef = document.getElementById('note-title')
const boxcontentRef = document.getElementById('box-content')
const sidebarRef = document.getElementById('side-bar')
const resizebarRef = document.getElementById('resize-bar')
const minSideBarSize = 160;
var isResizing = false

window.electronAPI.onShowNote((title, value) => {
    titleRef.innerText = title
    const renderer = new BoxNotesToHtml('box-note')
    renderer.render(value)
})

window.electronAPI.onBoxDir((tree) => {    
    if(tree) {
        sidebarRef.style.width = "180px"
        resizebarRef.style.width = "2px"
        const treeview = new TreeView('treeview')
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