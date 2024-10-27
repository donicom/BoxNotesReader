function TreeView(ref) {
    let _ref = ref
    
    function getChilds(nodes) {
        let childs = [], child, dir, span;
        nodes.forEach(node => {
            child = document.createElement("li")    
            span = document.createElement("span")                    
            span.innerText = node.name    
            child.appendChild(span)    
            if (node.type == 'dir') {   
                span.classList.add("folder")
                child.classList.add("folder")   
                span.addEventListener('click', toggleFolder(child, node.path))          
                if(node.items.length) {
                    child.classList.add("open")
                    dir = document.createElement("ul")     
                    dir.classList.add("folder")                 
                    getChilds(node.items.sort((a, b) => a.name.localeCompare(b.name)))
                        .forEach(x => dir.appendChild(x))  
                    child.appendChild(dir)                        
                }     
            } else {                
                span.classList.add("note")                
                child.classList.add("note")
                child.addEventListener('click', openNote(node)) 
            }               
            childs.push(child)
        });
        return childs
    }

    function toggleFolder(node, path) {
        return function eventHandlerTF(e) {
            if(!node.querySelector("ul"))  {
                const value = JSON.parse(window.electronAPI.openPath(path))
                var dir = document.createElement("ul")     
                dir.classList.add("folder")                 
                getChilds(value.items.sort((a, b) => a.name.localeCompare(b.name)))
                    .forEach(x => dir.appendChild(x))  
                node.appendChild(dir)   
            }
            node.classList.toggle("open")
        }
    }

    function openNote(node) {
        return function eventHandler(e) {            
            const value = window.electronAPI.openNote(node.path)
            if(value) {
                var elems = document.querySelectorAll("li.note.selected");
                [].forEach.call(elems, function(el) {
                    el.classList.remove("selected");
                });
                this.classList.add('selected')
                const titleRef = document.getElementById('note-title')
                titleRef.innerText = node.name
                const renderer = new BoxNotesToHtml('box-note')
                renderer.render(value)
            }
        }
    }

    function openParentDir(node) {
        let parentDir = node.parentNode.closest('li.folder')
        if(parentDir && !parentDir.isEqualNode(node)) {
            parentDir.classList.add('open')
            openParentDir(parentDir)
        } else {
            parentDir = document.querySelector('li.box')
            parentDir.classList.add('open')
        }
    }

    this.render = function(data) {
        let dataObject = JSON.parse(data)
        const content = document.getElementById(_ref)
        content.innerHTML = ""
        let tree = document.createElement("ul")
        let box = document.createElement("li")
        box.innerText = "Box";
        box.classList.add("box", "open")
        box.addEventListener('click', (e) => e.currentTarget.classList.toggle("open"), false)
        tree.appendChild(box)
        mainLi = document.createElement("li")
        box = document.createElement("ul")
        box.classList.add("folder")
        getChilds(dataObject.items.sort((a, b) => a.name.localeCompare(b.name)))            
            .forEach(x => box.appendChild(x))
        mainLi.appendChild(box)
        tree.appendChild(mainLi)
        content.appendChild(tree)
    }

    this.search = function(text) {
        const treeContent = document.getElementById(_ref)
        const notes = treeContent.querySelectorAll("li.note")
        let note = null;
        notes.forEach((n) => {
            let span = n.querySelector('span')
            if(span.textContent.toLowerCase().includes(text.toLowerCase())) {
                note = n
                return false
            }
        })
        if(note) {
            note.click()
            openParentDir(note)
        }
    }
}



