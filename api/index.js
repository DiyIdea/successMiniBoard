const express = require('express')
const cors = require('cors')
const app = express()
const fs = require('fs')
const crypto = require('crypto')

app.use(express.json())
app.use(cors())

app.get('/', function (req, res) {
    const data = fs.readFileSync('data/board.json').toString('utf-8')
    res.send(data)
})

app.post('/', function (req, res) {
    const data = JSON.parse(
        fs.readFileSync('data/board.json').toString('utf-8')
    )
    req.body.password = crypto
        .createHmac('sha256', req.body.password)
        .digest('hex')
    data.sort((a, b) => {
        return a.index - b.index
    })
    req.body.index = data[data.length - 1].index + 1
    data.push(req.body)
    fs.writeFileSync('data/board.json', JSON.stringify(data))
    res.send({ success: true, index: req.body.index })
})

app.delete('/', function (req, res) {
    let success = false
    let errorMsg
    const data = JSON.parse(
        fs.readFileSync('data/board.json').toString('utf-8')
    )
    const index = req.body.index
    const passwordHash = crypto
        .createHmac('sha256', req.body.password)
        .digest('hex')
    const target = data.find((o) => o.index == index)
    if (target) {
        if (target.password === passwordHash) {
            data.splice(data.indexOf(target), 1)
            success = true
        } else {
            errorMsg = '비밀번호가 잘못 됨'
        }
    } else {
        errorMsg = '해당 게시물을 찾을 수 없음'
    }
    fs.writeFileSync('data/board.json', JSON.stringify(data))
    res.send({ success, errorMsg })
})

app.listen(3714)
