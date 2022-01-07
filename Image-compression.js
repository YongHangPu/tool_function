/*
 * @Description: 图片压缩
 * @Author: 永航
 * @Date: 2021-09-20 11:37:53
 * @LastEditors: 永航
 * @LastEditTime: 2021-09-20 15:33:59
 */
function compressImg(file) {
    return new Promise(resolve => {
        let reader = new FileReader()
        let ndata
        // 将图片2将转成 base64 格式
        reader.readAsDataURL(file)
        // 读取成功后的回调
        reader.onloadend = function () {
            let result = this.result
            let img = new Image()
            img.src = result

            img.onload = function () {
                ndata = compress(img)
                //BASE64转图片
                const arr = ndata.split(',')
                const mime = arr[0].match(/:(.*?);/)[1]
                const bstr = atob(arr[1])
                let n = bstr.length
                const u8arr = new Uint8Array(n)

                while (n--) {
                    u8arr[n] = bstr.charCodeAt(n)
                }
                ndata = new File([u8arr], file.name, {type: mime})
                resolve({flag: 1, file: ndata})
            }
        }
    })
}
function compress(img) {
    let canvas = document.createElement('canvas')
    let ctx = canvas.getContext('2d')
    //瓦片canvas
    let tCanvas = document.createElement('canvas')
    let tctx = tCanvas.getContext('2d')
    let initSize = img.src.length
    let width = img.width
    let height = img.height
    //如果图片大于四百万像素，计算压缩比并将大小压至400万以下
    let ratio
    if ((ratio = (width * height) / 4000000) > 1) {
        ratio = Math.sqrt(ratio)
        width /= ratio
        height /= ratio
    } else {
        ratio = 1
    }
    canvas.width = width
    canvas.height = height
    // 铺底色
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    //如果图片像素大于100万则使用瓦片绘制
    let count
    if ((count = (width * height) / 1000000) > 1) {
        // 超过100W像素
        // ~是按位取反运算，~~是取反两次
        count = ~~(Math.sqrt(count) + 1) //计算要分成多少块瓦片
        // 计算每块瓦片的宽和高
        let nw = ~~(width / count)
        let nh = ~~(height / count)
        tCanvas.width = nw
        tCanvas.height = nh
        for (let i = 0; i < count; i++) {
            for (let j = 0; j < count; j++) {
                tctx.drawImage(img, i * nw * ratio, j * nh * ratio, nw * ratio, nh * ratio, 0, 0, nw, nh)
                ctx.drawImage(tCanvas, i * nw, j * nh, nw, nh)
            }
        }
    } else {
        ctx.drawImage(img, 0, 0, width, height)
    }
    //进行最小压缩
    let ndata = canvas.toDataURL('image/jpeg', 0.1)
    console.log('压缩前：' + initSize)
    console.log('压缩后kb：' + ndata.length / 1024)
    console.log('ndata:' + ndata)
    console.log('压缩率：' + ~~((100 * (initSize - ndata.length)) / initSize) + '%')
    tCanvas.width = tCanvas.height = canvas.width = canvas.height = 0
    return ndata
}
