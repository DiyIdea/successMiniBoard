const XHR = (method, url, params = {}) => {
    return new Promise((resolve, reject) => {
        try {
            const request = new XMLHttpRequest()
            request.onreadystatechange = () => {
                if (request.readyState === XMLHttpRequest.DONE) {
                    resolve(request.response)
                }
            }
            request.open(method, url, true)
            request.setRequestHeader("Content-Type", "application/json")
            request.send(JSON.stringify(params))
        } catch (e) {
            console.log(e)
        }
    })
}
//asdfasdfasdfasdfa

const listingArticle = async () => {
    const data = await XHR("get", "http://localhost:3714/")
    const reconstructions = JSON.parse(data)
    reconstructions.sort((a, b) => {
        return a.timestamp - b.timestamp
    })

    for (const reconstruction of reconstructions) {
        const date = new Date(reconstruction.timestamp)

        const article = document.createElement("article")
        article.dataset.index = `${reconstruction.index}`
        const titleDiv = document.createElement("div")
        titleDiv.className = "title"

        const titleLabel = document.createElement("label")
        titleLabel.innerText = reconstruction.title
        titleDiv.append(titleLabel)

        const infoDiv = document.createElement("div")
        infoDiv.className = "info"

        const authorLabel = document.createElement("label")
        authorLabel.className = "author"
        authorLabel.innerText = reconstruction.author

        const timeLabel = document.createElement("date")
        timeLabel.className = "write_time"
        timeLabel.innerText = date.toLocaleString("ko-KR", {
            timeZone: "ASIA/SEOUL",
        })

        const deleteA = document.createElement("a")
        deleteA.setAttribute("onclick", `deleteArticle(${reconstruction.index})`)
        deleteA.innerText = "삭제"

        infoDiv.append(authorLabel, timeLabel, deleteA)

        const contentsDiv = document.createElement("div")
        contentsDiv.classList.add("contents")
        contentsDiv.innerHTML = reconstruction.contents

        article.append(titleDiv, infoDiv, contentsDiv)

        const section = document.querySelector("section")
        const articleLatest = section.querySelector("article")
        section.insertBefore(article, articleLatest)
    }
}

const insertArticle = async () => {
    const inputTitle = document.querySelector('input[name="title"]')
    const inputContents = document.querySelector("textarea")
    const inputAuthor = document.querySelector('input[name="author"]')
    const inputPassword = document.querySelector('input[name="password"]')
    const inputSubmit = document.querySelector('input[type="submit"]')

    const title = inputTitle.value
    const contents = inputContents.value.replace(/\n/g, "<br />")
    const author = inputAuthor.value
    const password = inputPassword.value
    const timestamp = new Date().getTime()
    if (!title || !contents || !author || !password) {
        alert("입력되지 않은 항목이 있습니다!")
        return
    }

    inputTitle.setAttribute("disabled", "disabled")
    inputContents.setAttribute("disabled", "disabled")
    inputAuthor.setAttribute("disabled", "disabled")
    inputPassword.setAttribute("disabled", "disabled")
    inputSubmit.setAttribute("disabled", "disabled")

    await XHR("post", "http://localhost:3714/", {
        title: title,
        author: author,
        password: password,
        contents: contents,
        timestamp: timestamp,
    })
}

const deleteArticle = async (selectedIndex) => {
    let isSuccess
    let errorMsg
    const password = prompt("비밀번호를 입력해주세요.")
    const response = await XHR("delete", "http://localhost:3714/", {
        index: selectedIndex,
        password: password,
    })
    const reResponse = JSON.parse(response)
    if (reResponse.success === true) {
        isSuccess = true
    } else {
        errorMsg = reResponse.errorMsg
    }

    if (isSuccess === true) {
        Object.keys(document.getElementsByTagName("article")).forEach((k) => {
            const object = document.getElementsByTagName("article")[k]
            console.log("object", object)
            if (object.dataset.index == selectedIndex) {
                object.remove()
            }
        })
    } else {
        alert(`다음과 같은 에러가 발생하여 게시물을 지우지 못했습니다:\n${errorMsg}`)
    }
}

;(async () => {
    await listingArticle()
})()
