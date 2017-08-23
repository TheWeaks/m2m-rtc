import $ from 'jquery';

class HTTPService {

    /**
     * 获取房间
     * @param {number} rid 房间id
     * @param {number} uid 用户id
     * @return {promise<{rid: number, [{userId, prefix, suffix}]}>} 返回KMSService的promise
     */
    static getRoom(rid, uid) {
        let promise = new Promise((resolve, reject) => {
            if (rid && uid) {
                let xhr = new XMLHttpRequest()
                xhr.open('GET', `${this.HOST}?rid=${rid}&uid=${uid}`);
                xhr.onload = () => {
                    console.log(xhr.responseText);
                    if (xhr.status === 200) {
                        let json = JSON.parse(xhr.responseText);
                        if (json.status === 0) {
                            resolve(json.data);
                        } else {
                            reject(json.message);
                        }
                    } else {
                        reject(xhr.responseText);
                    }
                }
                xhr.send();
            } else {
                reject(new Error('参数不合法'));
            }
        })

        return promise;
    }

    /**
     * 获取浏览器url参数
     * @return {{rid, uid}} url参数
     */
    static getSearch() {
        let search = window.location.search;
        let searchs = search.substring(1, search.length).split('&');

        let params = {};
        searchs.forEach(s => {
            let content = s.split('=');
            params[content[0]] = content[1];
        })
        return params;
    }

    /**
     * 上传文件
     * @param {string} url 文件服务器路径
     * @param {File} imgFile 图片文件
     * @param {HTMLButtonElement} processEle 显示进度的元素
     * @return {Promise<{fileName, fileType, fileUrl}>} 返回结果promise
     */
    static uploadFile(url, imgFile, processEle) {
        let formData = new FormData()
        formData.append('uploadFile', imgFile);
        let xhr = new XMLHttpRequest();
        let promise = new Promise((resolve, reject) => {
            
            xhr.open('POST', url);
            xhr.onload = () => {
                processEle.style.background = null;
                processEle.style.backgroundSize = null;
                processEle.disabled = false;
                if (xhr.status === 200) {
                    resolve(JSON.parse(xhr.responseText).result);
                } else {
                    reject(xhr.responseText);
                }
            }
            xhr.upload.onprogress = event => {
                if (event.lengthComputable) {
                    let complete = event.loaded / event.total * 100;
                    processEle.style.backgroundSize = complete + '% 100%';
                }
            }
            
            processEle.disabled = true;
            processEle.style.background = '#286090';
            processEle.style.backgroundSize = '0 100%';
            xhr.send(formData);
        })

        return promise;
    }

    /**
     * 获取文件历史列表
     * @param {number} room 
     * @return {Promise<{[{fileName, fileType, fileUrl}]}>} 返回结果的 promise
     */
    static getFileHistory(room) {
        let xhr = new XMLHttpRequest();
        let promise = new Promise((resolve, reject) => {
            xhr.open('GET', this.FILE_LIST_HOST);
            xhr.onload = () => {
                if (xhr.status === 200) {
                    resolve(JSON.parse(xhr.responseText).result);
                } else {
                    reject(xhr.responseText);
                }
            }
            xhr.send();
        })
        return promise;
    }
    
}

HTTPService.HOST = 'http://localhost:3000/join'
HTTPService.FILE_HOST = 'http://localhost:3000/file';
HTTPService.FILE_LIST_HOST="http://localhost:3000/fileList";

export default HTTPService;