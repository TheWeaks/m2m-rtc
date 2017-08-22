class UploadService {

    /**
     * 上传文件
     * @param {string} url 文件服务器路径
     * @param {File} imgFile 图片文件
     * @param {HTMLButtonElement} processEle 显示进度的元素
     * @return {Promise<string>} 返回结果promise
     */
    static uploadFile(url, imgFile, processEle) {
        let formData = new FormData()
        formData.append('imgFile', imgFile);
        let xhr = new XMLHttpRequest();
        let promise = new Promise((resolve, reject) => {
            
            xhr.open('POST', url);
            xhr.onload = () => {
                processEle.disabled = false;
                processEle.style.background = '';
                if (xhr.status === 200) {
                    resolve(xhr.responseText)
                } else {
                    reject(xhr.responseText)
                }
            }
            xhr.upload.onprogress = event => {
                if (event.lengthComputable) {
                    let complete = event.loaded / event.total * 100 | 0;
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
}

UploadService.FILE_SERVER = 'http://localhost:3000/file';
UploadService.IMG_SERVER = 'http://localhost:3000/img'

export default UploadService;