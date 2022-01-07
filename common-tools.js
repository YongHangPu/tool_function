/*
 * @Description: 常用工具函数
 * @Author: 永航
 * @Date: 2021-09-05 22:16:39
 * @LastEditors: 永航
 * @LastEditTime: 2021-09-20 15:34:08
 */
import axios from 'axios'
// 引入文本复制插件
import Clipboard from 'clipboard.min'

/**
 * @description: 获取文件后缀名
 * @param {String} filename
 * @return {String} 返回文件后缀名
 * @author: 永航
 */
export function getExt(filename) {
    if (typeof filename !== 'string') {
        throw new Error('filename must be a string type')
    }
    return filename.split('.').pop().toLowerCase()
}

/**
 * @description: 下载一个链接 如：download('http://111.229.14.189/file/1.xlsx')
 * @param {String} link 下载的链接
 * @param {String} name 文件名
 * @author: 永航
 */
export function download(link, name) {
    if (!name) name = getExt(link)
    let eleLink = document.createElement('a')
    eleLink.download = name
    eleLink.style.display = 'none'
    eleLink.href = link
    document.body.appendChild(eleLink)
    eleLink.click()
    document.body.removeChild(eleLink)
}

/**
 * @description: 浏览器下载静态文件
 * @param {String} name 文件名
 * @param {String} content 文件内容
 * @author: 永航
 */
export function downloadFile(name, content) {
    if (typeof name == 'undefined') {
        throw new Error('The first parameter name is a must')
    }
    if (typeof content == 'undefined') {
        throw new Error('The second parameter content is a must')
    }
    if (!(content instanceof Blob)) {
        // 创建一个Blob对象
        content = new Blob([content])
    }
    // 生成一个浏览器可以预览的地址
    const link = URL.createObjectURL(content)
    download(link, name)
}

/**
 * @description: 图片、pdf等文件，浏览器会默认执行预览，不能调用download方法进行下载，
 * 需要先把图片、pdf等文件转成blob，再调用download方法进行下载，转换的方式是使用axios请求对应的链接,
 * 提供一个link，完成文件下载，link可以是 http://xxx.com/xxx.xls
 * 注：仅支持同源的链接，如果链接不同源的话，本地转发一下或者让后端转发。
 * @param {String} link 要下载的链接
 * @param {String} fileName 文件名
 * @return {*}
 * @author: 永航
 */
export function downloadByLink(link, fileName) {
    axios
        .request({
            url: link,
            responseType: 'blob', // 关键代码，让axios把响应改成blob
        })
        .then(res => {
            const link = URL.createObjectURL(res.data)
            download(link, fileName)
        })
}

/**
 * @description: 防抖 在一定时间间隔内，多次调用一个方法，只会执行一次
 * @param {Function} cb 要进行debouce的函数
 * @param {Int} wait 等待时间,默认500ms
 * @param {Boolean} immediate 是否立即执行
 * @author: 永航
 */
export function debounce(cb, wait = 500, immediate = false) {
    let timeout = null
    // 清除定时器
    if (timeout !== null) clearTimeout(timeout)
    // 立即执行，此类情况一般用不到
    if (immediate) {
        let callNow = !timeout
        timeout = setTimeout(() => {
            timeout = null
        }, wait)
        if (callNow) typeof cb === 'function' && cb()
    } else {
        // 设置定时器，当最后一次操作后，timeout不会再被清除，所以在延时wait毫秒后执行func回调方法
        timeout = setTimeout(() => {
            typeof cb === 'function' && cb()
        }, wait)
    }
}

/**
 * @description: 节流，多次触发，间隔时间段执行
 * @param {Function} cb 要执行的回调函数
 * @param {Int} wait 延时的时间
 * @param {Boolean} immediate 是否立即执行
 * @author: 永航
 */
export function throttle(cb, wait = 500, immediate = true) {
    let timer, flag
    if (!flag) {
        flag = true
        if (immediate) {
            // 如果是立即执行，则在wait毫秒内开始时执行
            typeof cb === 'function' && cb()
            timer = setTimeout(() => {
                flag = false
            }, wait)
        } else {
            // 如果是非立即执行，则在wait毫秒内的结束处执行
            timer = setTimeout(() => {
                flag = false
                typeof cb === 'function' && cb()
            }, wait)
        }
    }
}

/**
 * @description: 判断是否是假值
 * @param {any} value
 * @return {Boolean} 假值返回true，否则返回false
 * @author: 永航
 */
export const isFalsy = value => (value === 0 ? false : !value)

/**
 * @description: 判断是否是空值
 * @param {any} value
 * @return {Boolean} 空值返回true，否则返回false
 * @author: 永航
 */
export const isVoid = value => value === undefined || value === null || value === ''

/**
 * @description: 去除对象中value为空(null,undefined,'')的属性
 * @param {Object} object 要去除value为空值的对象
 * @return {*}
 * @author: 永航
 */
export const cleanObject = object => {
    if (!object) {
        return {}
    }
    const result = {...object}
    Object.keys(result).forEach(key => {
        const value = result[key]
        if (isVoid(value)) {
            // 删除对象中value为空(null,undefined,'')的属性
            delete result[key]
        }
    })
    return result
}

/**
 * @description: 复制内容到剪贴板
 * @param {String} value 需要复制的内容
 * @return {*} 返回true或false
 * @author: 永航
 */
export function copyToBoard(value) {
    if (document.execCommand) {
        const element = document.createElement('textarea')
        document.body.appendChild(element)
        element.value = value
        // 调用select()方法选中需要复制内容
        element.select()
        document.execCommand('copy')
        document.body.removeChild(element)
        return true
    }
    if (window.clipboardData) {
        window.clipboardData.setData('Text', value)
        return true
    }
    return false
    // 这里括号里填写上面点击事件绑定的class名
    // let clipboard = new Clipboard('.copy-btn')
    // clipboard.on('success', e => {
    //     // 复制成功
    //     console.log('内容已复制到剪切板!')
    //     // Message.success('内容已复制到剪切板!')
    //     // 释放内存
    //     clipboard.destroy()
    // })
    // clipboard.on('error', e => {
    //     // 不支持复制
    //     console.error('该浏览器不支持自动复制')
    //     // Message.error('该浏览器不支持自动复制')
    //     // 释放内存
    //     clipboard.destroy()
    // })
}

/**
 * @description: 生成随机id或字符串，默认返回长度为8的字符
 * @param {Int} length
 * @param {*} chars
 * @return {*}
 * @author: 永航
 */
export function uuid(length, chars) {
    chars = chars || '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    length = length || 8
    let result = ''
    for (let i = length; i > 0; --i) {
        result += chars[Math.floor(Math.random() * chars.length)]
    }
    return result
}

/**
 * @description: 取 [min, max] 范围的随机整数
 * @param {Int} min
 * @param {Int} max
 * @return {Int} 返回随机整数
 * @author: 永航
 */
export function random(min = 0, max) {
    if (max > 0 && max >= min) {
        let gab = max - min + 1
        return Math.floor(Math.random() * gab + min)
    } else {
        return 0
    }
}

/**
 * @description: 打乱一维数组元素的顺序
 * @param {Array} array 一维数组
 * @return {Array} 返回被打乱元素顺序的一维数组
 * @author: 永航
 */
export function randomArray(array = []) {
    // 原理是sort排序,Math.random()产生0<= x < 1之间的数,会导致x-0.05大于或者小于0
    return array.sort(() => Math.random() - 0.5)
}

// 怕个别浏览器不兼容padStart (字符串补全长度)，这里做一个 兼容处理
if (!String.prototype.padStart) {
    // 为了方便表示这里 fillString 用了ES6 的默认参数，不影响理解
    String.prototype.padStart = function (maxLength, fillString = ' ') {
        if (Object.prototype.toString.call(fillString) !== '[object String]') throw new TypeError('fillString must be String')
        let str = this
        // 返回 String(str) 这里是为了使返回的值是字符串字面量，在控制台中更符合直觉
        if (str.length >= maxLength) return String(str)

        let fillLength = maxLength - str.length,
            times = Math.ceil(fillLength / fillString.length)
        while ((times >>= 1)) {
            fillString += fillString
            if (times === 1) {
                fillString += fillString
            }
        }
        return fillString.slice(0, fillLength) + str
    }
}

/**
 * @description: 时间格式化
 * @param {String} dateTime 任何合法的时间格式
 * @param {String} fmt yyyy:mm:dd|yyyy:mm|yyyy年mm月dd日|yyyy年mm月dd日 hh时MM分等,可自定义组合
 * @return {String} 返回一个格式化好的时间
 * @author: 永航
 */
export function timeFormat(dateTime = null, fmt = 'yyyy-mm-dd') {
    let date = dateTime ? new Date(dateTime) : new Date()
    let ret
    let opt = {
        'y+': date.getFullYear().toString(), // 年
        'm+': (date.getMonth() + 1).toString(), // 月
        'd+': date.getDate().toString(), // 日
        'h+': date.getHours().toString(), // 时
        'M+': date.getMinutes().toString(), // 分
        's+': date.getSeconds().toString(), // 秒
        // 有其他格式化字符需求可以继续添加，必须转化成字符串
    }
    for (let k in opt) {
        ret = new RegExp('(' + k + ')').exec(fmt)
        if (ret) {
            fmt = fmt.replace(ret[1], ret[1].length == 1 ? opt[k] : opt[k].padStart(ret[1].length, '0'))
        }
    }
    return fmt
}

/**
 * @description: 去除空格
 * @param {String} str 字符串
 * @param {String} pos both-去除两端空格，left-去除左边空格，right-去除右边空格，all-去除所有空格
 * @return {String} 返回去除空格后的字符串
 * @author: 永航
 */
export function trim(str, pos = 'both') {
    if (pos == 'both') {
        return str.replace(/^\s+|\s+$/g, '')
    } else if (pos == 'left') {
        return str.replace(/^\s*/, '')
    } else if (pos == 'right') {
        return str.replace(/(\s*$)/g, '')
    } else if (pos == 'all') {
        return str.replace(/\s+/g, '')
    } else {
        return str
    }
}
/**
 * @description: 判断arr是否为一个数组，返回一个bool值
 * @param {Array} arr
 * @return {Boolean} 返回true或false
 * @author: 永航
 */
export function isArray(arr) {
    return Object.prototype.toString.call(arr) === '[object Array]'
}

/**
 * @description: 深度克隆对象
 * @param {Object} obj 需要被克隆的对象
 * @return {Object} 返回一个新的对象
 * @author: 永航
 */
export function deepClone(obj) {
    // 对常见的“非”值，直接返回原来值
    if ([null, undefined, NaN, false].includes(obj)) return obj
    if (typeof obj !== 'object' && typeof obj !== 'function') {
        //原始类型直接返回
        return obj
    }
    let newObj = isArray(obj) ? [] : {}
    for (let i in obj) {
        if (obj.hasOwnProperty(i)) {
            newObj[i] = typeof obj[i] === 'object' ? deepClone(obj[i]) : obj[i]
        }
    }
    return newObj
}

/**
 * @description: JS对象深度合并
 * @param {Object} target 目标对象
 * @param {Object} source 源对象
 * @return {Object} 返回一个新的合并后的对象
 * @author: 永航
 */
export function deepMerge(target = {}, source = {}) {
    target = deepClone(target)
    if (typeof target !== 'object' || typeof source !== 'object') return false
    for (let prop in source) {
        if (!source.hasOwnProperty(prop)) continue
        if (prop in target) {
            if (typeof target[prop] !== 'object') {
                target[prop] = source[prop]
            } else {
                if (typeof source[prop] !== 'object') {
                    target[prop] = source[prop]
                } else {
                    if (target[prop].concat && source[prop].concat) {
                        target[prop] = target[prop].concat(source[prop])
                    } else {
                        target[prop] = deepMerge(target[prop], source[prop])
                    }
                }
            }
        } else {
            target[prop] = source[prop]
        }
    }
    return target
}

/**
 * @description: 将一个对象形式参数转换成get传参所需参数形式，如把{name: 'lisa', age: 20}转换成?name=lisa&age=20
 * @param {Object} data 对象
 * @param {Boolean} isPrefix 否在返回的字符串前加上"?"
 * @param {Boolean} arrayFormat 属性为数组的情况下的处理办法
 * @return {*}
 * @author: 永航
 */
export function queryParams(data = {}, isPrefix = true, arrayFormat = 'brackets') {
    let prefix = isPrefix ? '?' : ''
    let _result = []
    for (let key in data) {
        let value = data[key]
        // 去掉为空的参数
        if (['', undefined, null].indexOf(value) >= 0) {
            continue
        }
        // 如果值为数组，另行处理
        if (value.constructor === Array) {
            // e.g. {ids: [1, 2, 3]}
            switch (arrayFormat) {
                case 'indices':
                    // 结果: ids[0]=1&ids[1]=2&ids[2]=3
                    for (let i = 0; i < value.length; i++) {
                        _result.push(key + '[' + i + ']=' + value[i])
                    }
                    break
                case 'brackets':
                    // 结果: ids[]=1&ids[]=2&ids[]=3
                    value.forEach(_value => {
                        _result.push(key + '[]=' + _value)
                    })
                    break
                case 'repeat':
                    // 结果: ids=1&ids=2&ids=3
                    value.forEach(_value => {
                        _result.push(key + '=' + _value)
                    })
                    break
                case 'comma':
                    // 结果: ids=1,2,3
                    let commaStr = ''
                    value.forEach(_value => {
                        commaStr += (commaStr ? ',' : '') + _value
                    })
                    _result.push(key + '=' + commaStr)
                    break
                default:
                    value.forEach(_value => {
                        _result.push(key + '[]=' + _value)
                    })
            }
        } else {
            _result.push(key + '=' + value)
        }
    }
    return _result.length ? prefix + _result.join('&') : ''
}

/**
 * @description: 休眠多少毫秒
 * @param {Number} ms 多少毫秒
 * @return {*}
 * @author: 永航
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * @description: 取出多个数组中不同的元素
 * @return {Array} 返回一个新的数组
 * @author: 永航
 */
export function getArrDifference() {
    // 没有去重复的新数组
    let newArr = Array.prototype.concat.apply([], arguments)
    return newArr.filter((v, i, arr) => {
        return arr.indexOf(v) === arr.lastIndexOf(v)
    })
}

/**
 * @description: 取出两个数组相同的元素
 * @param {Array} arr1
 * @param {Array} arr2
 * @return {Array} 返回一个新数组
 * @author: 永航
 */
export function getArrEqual(arr1, arr2) {
    let newArr = []
    for (let i = 0; i < arr2.length; i++) {
        for (let j = 0; j < arr1.length; j++) {
            if (arr1[j] === arr2[i]) {
                newArr.push(arr1[j])
            }
        }
    }
    return newArr
}

/**
 * @description: 合并多个数组 并去重
 * @param {Array} 参数 要合并的数组
 * @return: 返回一个没有重复值的新数组
 * @author: 永航
 */
export function concatArray() {
    let newArr = Array.prototype.concat.apply([], arguments) // 没有去重复的新数组
    return [...new Set(newArr)]
}

/**
 * @description: 对象转化为formdata
 * @param {Object} object
 * @return {*}
 * @author: 永航
 */
export function getFormData(object) {
    const formData = new FormData()
    Object.keys(object).forEach(key => {
        const value = object[key]
        if (Array.isArray(value)) {
            value.forEach((subValue, i) => formData.append(key + `[${i}]`, subValue))
        } else {
            formData.append(key, object[key])
        }
    })
    return formData
}

/**
 * @description: url编码转成json格式 'name=xxx&age=11' -> {name:xxx,age:11}
 * @param {String} str
 * @return {Object} 返回json格式的对象
 * @author: 永航
 */
export function getObjByUrl(str) {
    return Object.fromEntries(new URLSearchParams(str))
}
