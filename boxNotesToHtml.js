function boxNotesToHtml(textData) {
    let dataObject = JSON.parse(textData)
    let content = document.createElement("div")    
    return getConent(content, dataObject.doc.content)
}


function getConent(parentNode, childs) {
    let node
    childs.forEach(child => {
        node = getNode(child)
        if (node) {
            if (child.content) {
                parentNode.appendChild(getConent(node, child.content))
            } else {
                parentNode.appendChild(node)
            }
        }
    });
    return parentNode
}

function getNode(node) {
    let newNode;
    switch (node.type) {
        case 'text':
            newNode = getTextNode(node)
            break;
        case 'paragraph':
            newNode = getPNode(node)
            break;
        case 'heading':
            newNode = getHNode(node)
            break;
        case 'check_list':
            newNode = document.createElement("ul")
            newNode.classList.add("check-list")
            break;
        case 'check_list_item':
            newNode = getCheckListItem(node)            
            break;
        case 'ordered_list':
            newNode = document.createElement("ol")
            break;
        case 'bullet_list':
            newNode = document.createElement("ul")
            newNode.classList.add("unordered-list")
            break;
        case 'list_item':
            newNode = document.createElement("li")
            break;
        case 'image':
            newNode = getImageNode(node)
            break;
        case 'horizontal_rule':
            newNode = document.createElement("hr")
            break;
        case 'blockquote':
            newNode = document.createElement("blockquote")
            break;
        case 'call_out_box':
            newNode = getCalloutNode(node)
            break;
        case 'tab_list':
            newNode = document.createElement("ul")
            newNode.classList.add("tab-list")
            break;
        case 'table':
            newNode = document.createElement("table")
            break;
        case 'table_row':
            newNode = document.createElement("tr")
            break;
        case 'table_cell':
            newNode = document.createElement("td")
            break;
    }
    return newNode;

}

function getMarkNode(marks, node) {
    let markNodes = []
    let markNode, parentNode
    marks.forEach(element => {
        switch (element.type) {
            case 'alignment':
                markNode = document.createElement("div")
                markNode.style.textAlign = element.attrs.alignment
                markNodes.push(markNode)
                break;
            case 'highlight':
                markNode = document.createElement("span")
                markNode.style.backgroundColor = element.attrs.color
                markNodes.push(markNode)
                break;
            case 'font_color':
                markNode = document.createElement("span")
                markNode.style.color = element.attrs.color
                markNodes.push(markNode)
                break;
            case 'font_size':
                markNode = document.createElement("span")
                markNode.style.fontSize = element.attrs.size
                markNodes.push(markNode)
                break;
            case 'link':
                markNode = document.createElement("a")
                markNode.href = element.attrs.href
                markNode.target = "_blank"
                markNodes.push(markNode)
                break;
            case 'underline':
                markNodes.push(document.createElement("u"))
                break;
            case 'strikethrough':
                markNodes.push(document.createElement("s"))
                break;
            case 'strong':
                markNodes.push(document.createElement("strong"))
                break;
            case 'em':
                markNodes.push(document.createElement("em"))
                break;
        }
    });
    markNode = node;
    while (markNodes.length > 0) {
        parentNode = markNodes.pop()
        parentNode.appendChild(markNode)
        markNode = parentNode
    }
    return markNode;
}

function getTextNode(node) {
    let textNode = document.createElement("span")
    textNode.innerText = node.text
    if (node.marks) {
        return getMarkNode(node.marks, textNode)
    } else {
        return textNode
    }
}

function getPNode(node) {
    let pNode = document.createElement("p")
    if (node.marks) {
        return getMarkNode(node.marks, pNode)
    } else {
        return pNode
    }
}

function getHNode(node) {
    let hNode
    switch (node.attrs.level) {
        case 1:
            hNode = document.createElement("h2")
            break;
        case 2:
            hNode = document.createElement("h3")
            break;
        case 3:
            hNode = document.createElement("h4")
            break;
    }
    return hNode
}

function getImageNode(node) {
    let imageNode = document.createElement("img")
    if(node.attrs.fileName) {
        imageNode.src = "file://" + window.electronAPI.getImagePath(node.attrs.fileName)
    } else if(node.attrs.src) {
        imageNode.src = node.attrs.src
    } 
    return imageNode
}

function getCheckListItem(node) {
    let newNode = document.createElement("li")
    let checkBox = document.createElement("input")
    checkBox.type = "checkbox"
    checkBox.checked = node.attrs.checked
    checkBox.onclick = (e) => false;
    newNode.appendChild(checkBox)
    return newNode
}

function getCalloutNode(node) {
    let callout = document.createElement("div")
    callout.classList.add("call-out")
    if(node.attrs.backgroundColor) {
        callout.style.backgroundColor = node.attrs.backgroundColor
    }
    let button = document.createElement("button")
    let icon = document.createElement("span")
    icon.innerText = node.attrs.emoji
    button.appendChild(icon)
    callout.appendChild(button)
    return callout;
}